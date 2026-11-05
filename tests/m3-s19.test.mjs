import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Independent pinned EP05/S19 paragraph counts and SHA-256; technical
// headings/transitions and metadata excluded. C3 is after S22 annotation.
const sourceProof = {
  's19-intro': [42, '07b2961de698a183d54974adee829e1c36abdb10663117bc9f554de79e4cb6c4'],
  's19-private-photo': [6, '88475f43597182aabc32a669fe9e65529ea95e132b40302c703b608dc734ee4a'],
  's19-no-photo': [6, '5f0f437e1596b27d3f5c4de34f63ba8df2ba435ced227e9f7068b0b8179b471d'],
  's19-ask-tomorrow': [6, 'd4328ffc8aa551549ddbb2729056b2ec7d4170b83a3db91410267bd6d77e944b'],
  's19-common-a': [8, 'df521c92a46f7b4cac3aba5c234da26c6e5324f6c1ac04de66df41098c8d9bc3'],
  's19-kiss': [6, '12308edc9c3a3a48aefa8136346f40e57968f9cb88fcd1daaaf19e95acc4b78e'],
  's19-hug': [5, '09cae1e118fbf91c93087358dfc6f60b7448be3c65cd7e30ec7da722c5dedbfe'],
  's19-distance': [6, '96cbd1fb525e6675b152faf8440874433374dfc0cf6967d4729b6c3c64d50576'],
  's19-common-b': [1, 'b16eb83b2a43263941d0e23ad18a0abe027c747180ec81e917e26d50f8a1dbc9'],
  's19-p-a': [1, '5db4a151c6c97229326dad8f7a1502d61c19fe8dadb16d7266051dca57e9486c'],
  's19-p-b': [1, '3188cd2ed2f585b4afaef02c3f0e3329e22bccc1c5bcba90e41432114ec9ca45'],
  's19-p-c': [1, '4b93f16ed6579aebde37d13f516bc4008c0e186cf580c043f37dbc0836aa2fc2'],
  's19-day10': [2, '5898f98fc2f686b0904b90eebc6d6640107dde4e345f13dfaffe5e03a91b801f'],
  's19-k': [1, '35e658e86703ed28d5b1da531b9c51133521b5dfc54f2efe5f0d2d83c9e9e48b'],
  's19-h': [1, '98e2a56e26de6f58d0aefc0a16989bc96c92e92fa7f1ff9d5a5ebc4f05414ab2'],
  's19-d': [1, 'f15deab50400c907e1c575164a10172d4f0a1784e692b6ce77612869837823dd'],
  's19-camera-free': [1, 'fdd49db81379f6ef2d90c7419e987105980972fc4b6a45d27869723fdd97f9d0'],
  's19-breakfast': [1, 'bb3de3a7dec1c0a2332fa98a08733e3cb718ba164956de1bd23733c2bd730d9f'],
};
const scene = id => graphData.scenes.find(s => s.id === id);
const shown = id => (scene(id)?.beats ?? []).filter(b => b.type === 'dialogue').map(b => b.text.ru);
const choice = (sceneId, beatId) => scene(sceneId)?.beats.find(b => b.id === beatId);

test('S19 renders all 18 pinned authorial blocks as exactly 96 unique paragraphs', () => {
  assert.equal(Object.values(sourceProof).reduce((n,[count]) => n + count, 0), 96);
  for(const [id,[count,sha]] of Object.entries(sourceProof)){
    const paragraphTexts=shown(id);
    assert.equal(paragraphTexts.length,count,id);
    assert.equal(createHash('sha256').update(paragraphTexts.join('\n\n')).digest('hex'),sha,id);
    assert.ok(paragraphTexts.every(p=>!p.startsWith('Технический переход') &&
      !p.startsWith('Выбор S19-') && !p.startsWith('Переход S19')),id);
  }
  assert.doesNotThrow(()=>defineNarrativeGraph(graphData));
});

test('only S17 Nick enters S19; three C1 × three C2 × two C3 options are free and guarded',()=>{
  const entry=choice('s17-common-b','s17-evening-choice');
  assert.deepEqual(entry.choices.map(c=>[c.id,c.targetSceneId]),[
    ['eric','s18-intro'],['nick','s19-intro'],['damir','s20-intro'],['self','s21-m3-end'],
  ]);
  assert.equal(scene('s19-m3-end'),undefined);
  const photo=choice('s19-intro','s19-photo-choice');
  assert.deepEqual(photo.choices.map(c=>[c.id,c.targetSceneId,c.effects]),[
    ['alice-private-photo','s19-private-photo',[{op:'flag_set',id:'nick-photo-alice-private',value:true}]],
    ['no-photo','s19-no-photo',[{op:'flag_set',id:'nick-photo-none',value:true}]],
    ['ask-tomorrow','s19-ask-tomorrow',[{op:'flag_set',id:'nick-photo-ask-tomorrow',value:true}]],
  ]);
  for(const id of ['private-photo','no-photo','ask-tomorrow'])
    assert.equal(scene('s19-'+id).nextSceneId,'s19-common-a');
  const close=choice('s19-common-a','s19-contact-choice');
  assert.deepEqual(close.choices.map(c=>[c.id,c.targetSceneId,c.effects]),[
    ['kiss','s19-kiss',[{op:'flag_set',id:'nick-contact-kiss',value:true}]],
    ['hug','s19-hug',[{op:'flag_set',id:'nick-contact-hug',value:true}]],
    ['distance','s19-distance',[{op:'flag_set',id:'nick-contact-distance',value:true}]],
  ]);
  for(const id of ['kiss','hug','distance'])
    assert.equal(scene('s19-'+id).nextSceneId,'s19-common-b');
  assert.equal(scene('s19-common-b').nextSceneId,'s19-photo-payoff-dispatch');
  const pguard=choice('s19-photo-payoff-dispatch','s19-photo-payoff-choice');
  assert.deepEqual(pguard.choices.map(c=>[c.id,c.targetSceneId,c.when?.flag,c.effects]),[
    ['a','s19-p-a','nick-photo-alice-private',undefined],
    ['b','s19-p-b','nick-photo-none',undefined],
    ['c','s19-p-c','nick-photo-ask-tomorrow',undefined],
  ]);
  for(const id of ['a','b','c'])assert.equal(scene('s19-p-'+id).nextSceneId,'s19-day10');
  assert.equal(scene('s19-day10').nextSceneId,'s19-contact-payoff-dispatch');
  const kguard=choice('s19-contact-payoff-dispatch','s19-contact-payoff-choice');
  assert.deepEqual(kguard.choices.map(c=>[c.id,c.targetSceneId,c.when?.flag,c.effects]),[
    ['k','s19-k','nick-contact-kiss',undefined],
    ['h','s19-h','nick-contact-hug',undefined],
    ['d','s19-d','nick-contact-distance',undefined],
  ]);
  for(const id of ['k','h','d'])assert.equal(scene('s19-'+id).nextSceneId,'s19-followup-choice-scene');
  const follow=choice('s19-followup-choice-scene','s19-followup-choice');
  assert.deepEqual(follow.choices.map(c=>[c.id,c.targetSceneId,c.effects]),[
    ['camera-free','s19-camera-free',[{op:'flag_set',id:'nick-followup-camera-free',value:true}]],
    ['breakfast','s19-breakfast',[{op:'flag_set',id:'nick-followup-breakfast',value:true}]],
  ]);
  for(const id of ['camera-free','breakfast'])
    assert.equal(scene('s19-'+id).nextSceneId,'s19-after-m3-end');
  assert.equal(scene('s19-after-m3-end').beats[0].type,'ending');
  for(const c of [...photo.choices,...close.choices,...pguard.choices,...kguard.choices,...follow.choices])
    for(const forbidden of ['cost','premium','romancePoints','routeLock','publishPermission',
      'consentToPublish','requiredEntitlement','cameraPermission','teaserPermission'])
      assert.equal(c[forbidden],undefined,forbidden);
});

const priorRoute={
  's01-seat-choice':'front-eric','s02-career-choice':'people',
  's03-career-dispatch':'people','s03-seat-dispatch':'other',
  's03-after-pharmacy-choice':'silence','s04-camera-consent-choice':'declined',
  's04-s03-dispatch':'silence','s05-weather-choice':'damir',
  's06-weather-dispatch':'other','s06-seat-dispatch':'eric',
  's06-eric-choice':'music','s07-weather-dispatch':'other',
  's07-seat-dispatch':'other','s07-consent-dispatch':'declined',
  's07-archive-choice':'private','s07-s06-dispatch':'music',
  's08-weather-dispatch':'damir','s08-damir-care-choice':'warm',
  's66-damir-dispatch':'warm','s66-career-dispatch':'people',
  's09-voice-choice':'damir','s09-career-dispatch':'people',
  's10-seat-dispatch':'eric','s10-tone-choice':'quiet',
  's11-consent-dispatch':'declined','s11-safety-choice':'a',
  's12-care-dispatch':'warm','s12-voice-dispatch':'damir',
  's12-past-choice':'listen','s12-draft-choice':'private',
  's12-return-choice':'chocolate','s13-voice-dispatch':'damir',
  's13-work-choice':'shared','s13-return-dispatch':'chocolate',
  's14-tone-dispatch':'quiet','s14-pace-choice':'slow',
  's14-gesture-choice':'walk','s15-voice-dispatch':'damir',
  's15-privacy-choice':'c','s15-gesture-dispatch':'walk',
  's16-care-choice':'a','s17-n-dispatch':'c','s17-e-dispatch':'b',
  's17-d-dispatch':'a','s17-group-choice':'d','s17-evening-choice':'nick',
};

function runtime(snapshot){
  const graph=defineNarrativeGraph(graphData),catalog=defineNarrativeCatalog(catalogData);
  const update=createNarrativeRuntimeUpdate({graph,catalog});
  let state={narrative:JSON.parse(JSON.stringify(snapshot??createNarrativeState(graph)))};
  const act=action=>update({deltaMs:16,state,inputs:[{schemaVersion:1,type:'pointer',
    action,phase:'up',timestamp:181,source:'renderer'}],setState(s){state=s;}});
  const advance=id=>{
    assert.equal(state.narrative.sceneId,id);
    for(const b of scene(id).beats.filter(x=>x.type==='dialogue'))
      act('narrative:next:'+b.id);
  };
  return {graph,catalog,act,advance,get:()=>state.narrative};
}
function reachS19(){
  const run=runtime();
  for(let i=0;i<5000 && run.get().sceneId!=='s19-intro';i++){
    const {sceneId,beatIndex}=run.get();
    const beat=scene(sceneId)?.beats[beatIndex],before=sceneId+':'+beatIndex;
    assert.ok(beat,before);
    if(beat.type==='dialogue')run.act('narrative:next:'+beat.id);
    else if(beat.type==='choice'){
      assert.ok(priorRoute[beat.id],'unmapped choice '+beat.id);
      run.act('narrative:choose:'+beat.id+':'+priorRoute[beat.id]);
    }else assert.fail('premature ending '+sceneId);
    assert.notEqual(run.get().sceneId+':'+run.get().beatIndex,before,'stalled '+before);
  }
  assert.equal(run.get().sceneId,'s19-intro');
  return run;
}

test('real N1: Nick route, all 3×3×2 S19 paths, Back, fresh JSON, consent isolation',()=>{
  const base=reachS19();
  assert.equal(base.get().flags['s17-evening-nick'],true);
  assert.equal(base.get().flags['private-text-pending'],true);
  assert.equal(base.get().flags['nick-failure-shared-file'],true);
  base.advance('s19-intro');
  const checkpoint=JSON.parse(JSON.stringify(base.get()));
  const photos={
    'alice-private-photo':['s19-private-photo','nick-photo-alice-private','a'],
    'no-photo':['s19-no-photo','nick-photo-none','b'],
    'ask-tomorrow':['s19-ask-tomorrow','nick-photo-ask-tomorrow','c'],
  };
  const contacts={
    kiss:['s19-kiss','nick-contact-kiss','k'],
    hug:['s19-hug','nick-contact-hug','h'],
    distance:['s19-distance','nick-contact-distance','d'],
  };
  for(const [answer,[photoScene,photoFlag,payoff]] of Object.entries(photos))
    for(const [contact,[contactScene,contactFlag,contactPayoff]] of Object.entries(contacts))
      for(const followup of ['camera-free','breakfast']){
        const run=runtime(checkpoint);
        const prior=JSON.stringify(run.get());
        run.act('narrative:choose:s19-photo-choice:invalid');
        assert.equal(JSON.stringify(run.get()),prior);
        run.act('narrative:choose:s19-photo-choice:'+answer);
        assert.equal(run.get().sceneId,photoScene);
        assert.equal(run.get().flags[photoFlag],true);
        assert.equal(run.get().routeLock,null);
        run.act('narrative:back');
        assert.equal(JSON.stringify(run.get()),prior);
        run.act('narrative:choose:s19-photo-choice:'+answer);
        const restored=runtime(JSON.parse(JSON.stringify(run.get())));
        restored.advance(photoScene);
        restored.advance('s19-common-a');
        assert.equal(restored.get().sceneId,'s19-common-a');
        const closeBefore=JSON.stringify(restored.get());
        restored.act('narrative:choose:s19-contact-choice:invalid');
        assert.equal(JSON.stringify(restored.get()),closeBefore);
        restored.act('narrative:choose:s19-contact-choice:'+contact);
        assert.equal(restored.get().sceneId,contactScene);
        assert.equal(restored.get().flags[contactFlag],true);
        restored.advance(contactScene);
        restored.advance('s19-common-b');
        assert.equal(restored.get().sceneId,'s19-photo-payoff-dispatch');
        for(const wrong of ['a','b','c'].filter(id=>id!==payoff)){
          const before=JSON.stringify(restored.get());
          restored.act('narrative:choose:s19-photo-payoff-choice:'+wrong);
          assert.equal(JSON.stringify(restored.get()),before);
        }
        restored.act('narrative:choose:s19-photo-payoff-choice:'+payoff);
        restored.advance('s19-p-'+payoff);
        restored.advance('s19-day10');
        assert.equal(restored.get().sceneId,'s19-contact-payoff-dispatch');
        for(const wrong of ['k','h','d'].filter(id=>id!==contactPayoff)){
          const before=JSON.stringify(restored.get());
          restored.act('narrative:choose:s19-contact-payoff-choice:'+wrong);
          assert.equal(JSON.stringify(restored.get()),before);
        }
        restored.act('narrative:choose:s19-contact-payoff-choice:'+contactPayoff);
        restored.advance('s19-'+contactPayoff);
        assert.equal(restored.get().sceneId,'s19-followup-choice-scene');
        const beforeFollowup=JSON.stringify(restored.get());
        restored.act('narrative:choose:s19-followup-choice:'+followup);
        assert.equal(restored.get().flags['nick-followup-'+followup],true);
        assert.equal(restored.get().flags['private-text-pending'],true);
        assert.equal(restored.get().flags['nick-failure-shared-file'],true);
        assert.equal(restored.get().routeLock,null);
        assert.equal(restored.get().flags['teaser-consent'],undefined);
        assert.equal(restored.get().flags['media-publication-approved'],undefined);
        assert.equal(restored.get().flags['nick-joint-file-approved'],undefined);
        restored.act('narrative:back');
        assert.equal(JSON.stringify(restored.get()),beforeFollowup);
        restored.act('narrative:choose:s19-followup-choice:'+followup);
        restored.advance('s19-'+followup);
        assert.equal(restored.get().sceneId,'s19-after-m3-end');
      }
});

test('N1 rejects forged S19 photo flags and actionLog without mutating the save',()=>{
  const run=reachS19();
  run.advance('s19-intro');
  run.act('narrative:choose:s19-photo-choice:ask-tomorrow');
  const original=JSON.parse(JSON.stringify(run.get()));
  const forged=[
    {...original,flags:{...original.flags,'nick-photo-none':true}},
    {...original,flags:Object.fromEntries(Object.entries(original.flags)
      .filter(([k])=>k!=='nick-photo-ask-tomorrow'))},
    {...original,actionLog:original.actionLog.map(entry=>
      entry.type==='choose'&&entry.beatId==='s19-photo-choice'
        ?{...entry,optionId:'no-photo'}:entry)},
    {...original,actionLog:original.actionLog.slice(0,-1)},
  ];
  for(const invalid of forged){
    const before=JSON.stringify(invalid);
    let writes=0;
    assert.throws(()=>createNarrativeRuntimeUpdate({graph:run.graph,catalog:run.catalog})({
      deltaMs:16,state:{narrative:invalid},inputs:[{schemaVersion:1,type:'pointer',
        action:'narrative:next:'+scene('s19-ask-tomorrow').beats[0].id,
        phase:'up',timestamp:182,source:'renderer'}],
      setState(){writes++;},
    }),/inconsistent actionLog provenance or position|unavailable choice/);
    assert.equal(writes,0);
    assert.equal(JSON.stringify(invalid),before);
  }
  assert.equal(run.get().flags['nick-photo-ask-tomorrow'],true);
  assert.equal(run.get().flags['private-text-pending'],true);
});

test('S19 does not enable economy or a paid/locked romantic branch',()=>{
  assert.equal(existsSync(new URL('../game/config/economy.json',import.meta.url)),false);
  assert.equal(existsSync(new URL('../game/config/premium.json',import.meta.url)),false);
  assert.deepEqual(catalogData.interactions,[]);
});
