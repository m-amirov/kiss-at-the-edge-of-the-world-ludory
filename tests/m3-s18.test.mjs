import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Independently extracted from the pinned EP05/S18, excluding headings,
// technical transitions and scene metadata.
const sourceProof = {
  's18-intro': [47, '1a8f310d3ec380cf3b8b9f1037c8bdc26e39f74539ec2ac9f0c0e7b1c5b7f74e'],
  's18-kiss': [6, '1f97e5d697c120ff7b6118b0c3cd33c438b978a1ab783a3fc642b9599d73f132'],
  's18-stay': [6, '9c7d14d16b929a07a6996aa3d88d3ffb6c96661957ad59af5116ae6970a8b13d'],
  's18-leave': [5, 'a4a8125248fbfab730b1142742a7ad8a92d4dbf90567fb9662bbb560c415f87c'],
  's18-common': [5, '4453fd79a235203c4fb0877b76a7f4992a6df3c5281bd47b6baf4ef95aa1530f'],
  's18-k': [1, 'd46249c96219fe6143a62a91403ee0d7d4ccd4e5430c2fb93ce8afc0b7275fec'],
  's18-s': [1, '12929190af9419a45c8aaa189beffeb2652e2b74bcc427072bc8d61a28a78b54'],
  's18-l': [1, '5baeffc1738a3349fde57dcc32fa4d852a50b50c18e8d91af0a7abed44d117ac'],
  's18-postcards': [1, '9dfed869967ae2993666dcc3cc853661fcd6bf757fa6b6e0a6f3d83e6e92aa77'],
  's18-song': [1, '614a412bae9ae6640379e328bf29c4cc5932012dadfbdb51c14cb05068848b3f'],
};
const scene = id => graphData.scenes.find(s => s.id === id);
const shown = id => (scene(id)?.beats ?? []).filter(b=>b.type==='dialogue').map(b=>b.text.ru);
const choice = (sceneId, beatId) => scene(sceneId).beats.find(b=>b.id===beatId);

test('S18 displays all ten pinned manuscript blocks, exactly 74 unique paragraphs',()=>{
  assert.equal(Object.values(sourceProof).reduce((n,[count])=>n+count,0),74);
  for(const [id,[count,sha]] of Object.entries(sourceProof)){
    const text=shown(id);
    assert.equal(text.length,count,id);
    assert.equal(createHash('sha256').update(text.join('\n\n')).digest('hex'),sha,id);
    assert.ok(text.every(p=>!p.startsWith('Технический переход') &&
      !p.startsWith('Выбор S18-')),id);
  }
  assert.doesNotThrow(()=>defineNarrativeGraph(graphData));
});

test('only Eric S17 evening enters S18, with free C1 and effect-free guarded payoff',()=>{
  const previous=choice('s17-common-b','s17-evening-choice');
  assert.equal(previous.choices.find(x=>x.id==='eric').targetSceneId,'s18-intro');
  for(const [id,stub] of [['nick','s19-intro'],['damir','s20-intro'],['self','s21-intro']])
    assert.equal(previous.choices.find(x=>x.id===id).targetSceneId,stub);
  assert.equal(scene('s18-m3-end'),undefined);
  const c1=choice('s18-intro','s18-contact-choice');
  assert.deepEqual(c1.choices.map(c=>[c.id,c.targetSceneId,c.effects]),[
    ['kiss','s18-kiss',[{op:'flag_set',id:'eric-contact-kiss',value:true}]],
    ['stay-without-kiss','s18-stay',[{op:'flag_set',id:'eric-contact-stay-without-kiss',value:true}]],
    ['leave','s18-leave',[{op:'flag_set',id:'eric-contact-leave',value:true}]],
  ]);
  for(const id of ['kiss','stay','leave'])assert.equal(scene('s18-'+id).nextSceneId,'s18-common');
  assert.equal(scene('s18-common').nextSceneId,'s18-payoff-dispatch');
  const guard=choice('s18-payoff-dispatch','s18-payoff-dispatch-choice');
  assert.deepEqual(guard.choices.map(c=>[c.id,c.targetSceneId,c.when?.flag,c.effects]),[
    ['k','s18-k','eric-contact-kiss',undefined],
    ['s','s18-s','eric-contact-stay-without-kiss',undefined],
    ['l','s18-l','eric-contact-leave',undefined],
  ]);
  for(const id of ['k','s','l'])assert.equal(scene('s18-'+id).nextSceneId,'s18-followup-choice-scene');
  const c2=choice('s18-followup-choice-scene','s18-followup-choice');
  assert.deepEqual(c2.choices.map(c=>[c.id,c.targetSceneId,c.effects]),[
    ['postcards','s18-postcards',[{op:'flag_set',id:'eric-followup-postcards',value:true}]],
    ['song','s18-song',[{op:'flag_set',id:'eric-followup-song',value:true}]],
  ]);
  for(const id of ['postcards','song'])
    assert.equal(scene('s18-'+id).nextSceneId,'s22-intro');
  assert.equal(scene('s18-after-m3-end'),undefined);
  for(const c of [...c1.choices,...guard.choices,...c2.choices])
    for(const f of ['cost','premium','romancePoints','routeLock','publishPermission','consentToPublish','requiredEntitlement'])
      assert.equal(c[f],undefined,f);
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
  's17-d-dispatch':'a','s17-group-choice':'d','s17-evening-choice':'eric',
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

function reachS18(){
  const run=runtime();
  for(let i=0;i<5000 && run.get().sceneId!=='s18-intro';i++){
    const {sceneId,beatIndex}=run.get();
    const beat=scene(sceneId)?.beats[beatIndex],before=sceneId+':'+beatIndex;
    assert.ok(beat,before);
    if(beat.type==='dialogue')run.act('narrative:next:'+beat.id);
    else if(beat.type==='choice'){
      assert.ok(priorRoute[beat.id],'unmapped choice '+beat.id);
      run.act('narrative:choose:'+beat.id+':'+priorRoute[beat.id]);
    } else assert.fail('premature ending '+sceneId);
    assert.notEqual(run.get().sceneId+':'+run.get().beatIndex,before,'stalled '+before);
  }
  assert.equal(run.get().sceneId,'s18-intro');
  return run;
}

test('real N1: S17 Eric route, all S18-C1×C2 paths, Back and fresh-runtime JSON',()=>{
  const base=reachS18();
  assert.equal(base.get().flags['s17-evening-eric'],true);
  assert.equal(base.get().flags['private-text-pending'],true);
  base.advance('s18-intro');
  const checkpoint=JSON.parse(JSON.stringify(base.get()));
  const contacts={
    kiss:['s18-kiss','eric-contact-kiss','k'],
    'stay-without-kiss':['s18-stay','eric-contact-stay-without-kiss','s'],
    leave:['s18-leave','eric-contact-leave','l'],
  };
  for(const [answer,[branch,flag,payoff]] of Object.entries(contacts))
    for(const followup of ['postcards','song']){
      const run=runtime(checkpoint);
      const before=JSON.stringify(run.get());
      run.act('narrative:choose:s18-contact-choice:invalid');
      assert.equal(JSON.stringify(run.get()),before);
      run.act('narrative:choose:s18-contact-choice:'+answer);
      assert.equal(run.get().sceneId,branch);
      assert.equal(run.get().flags[flag],true);
      assert.equal(run.get().routeLock,null);
      run.act('narrative:back');
      assert.equal(JSON.stringify(run.get()),before);
      run.act('narrative:choose:s18-contact-choice:'+answer);
      const resumed=runtime(JSON.parse(JSON.stringify(run.get())));
      resumed.advance(branch);
      resumed.advance('s18-common');
      assert.equal(resumed.get().sceneId,'s18-payoff-dispatch');
      for(const incorrect of ['k','s','l'].filter(x=>x!==payoff)){
        const same=JSON.stringify(resumed.get());
        resumed.act('narrative:choose:s18-payoff-dispatch-choice:'+incorrect);
        assert.equal(JSON.stringify(resumed.get()),same);
      }
      resumed.act('narrative:choose:s18-payoff-dispatch-choice:'+payoff);
      resumed.advance('s18-'+payoff);
      assert.equal(resumed.get().sceneId,'s18-followup-choice-scene');
      resumed.act('narrative:choose:s18-followup-choice:'+followup);
      assert.equal(resumed.get().flags['eric-followup-'+followup],true);
      assert.equal(resumed.get().flags['private-text-pending'],true);
      assert.equal(resumed.get().routeLock,null);
      resumed.act('narrative:back');
      assert.equal(resumed.get().flags['eric-followup-'+followup],undefined);
      resumed.act('narrative:choose:s18-followup-choice:'+followup);
      resumed.advance('s18-'+followup);
      assert.equal(resumed.get().sceneId,'s22-intro');
    }
});

test('N1 rejects tampered S18 contact provenance without changing valid save',()=>{
  const run=reachS18();
  run.advance('s18-intro');
  run.act('narrative:choose:s18-contact-choice:stay-without-kiss');
  const saved=JSON.parse(JSON.stringify(run.get()));
  const forged=[
    {...saved,flags:{...saved.flags,'eric-contact-kiss':true}},
    {...saved,flags:Object.fromEntries(Object.entries(saved.flags).filter(([k])=>
      k!=='eric-contact-stay-without-kiss'))},
    {...saved,actionLog:saved.actionLog.map(entry=>
      entry.type==='choose'&&entry.beatId==='s18-contact-choice'
        ?{...entry,optionId:'kiss'}:entry)},
    {...saved,actionLog:saved.actionLog.slice(0,-1)},
  ];
  for(const invalid of forged)assert.throws(()=>createNarrativeRuntimeUpdate({
    graph:run.graph,catalog:run.catalog})({deltaMs:16,
    state:{narrative:invalid},inputs:[{schemaVersion:1,type:'pointer',
      action:'narrative:next:'+scene('s18-stay').beats[0].id,
      phase:'up',timestamp:182,source:'renderer'}],setState(){},
    }),/inconsistent actionLog provenance or position|unavailable choice/);
  assert.equal(run.get().flags['eric-contact-stay-without-kiss'],true);
});

test('S18 does not opt the first novel into economy or monetization',()=>{
  assert.equal(existsSync(new URL('../game/config/economy.json',import.meta.url)),false);
  assert.equal(existsSync(new URL('../game/config/premium.json',import.meta.url)),false);
  assert.deepEqual(catalogData.interactions,[]);
});
