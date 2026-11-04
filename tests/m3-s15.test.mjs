import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Independently extracted from pinned EP04/S15 manuscript, excluding headings and metadata.
const proof = {
  "s15-intro": [
    12,
    "288714fea26cdcf4f0373ad074eebc93dd72e2abcc70cddc6d0e47a932dee052"
  ],
  "s15-nick-voice": [
    7,
    "431c14c6012e97027357d252256d1103d65d6f63a0c9f3363edcf1c6b2dd431b"
  ],
  "s15-other-voice": [
    4,
    "a07f37cacbadfeae05ecfda84ca2906467450aa09f83aa51fe01fce7e9a7ddd1"
  ],
  "s15-common-a": [
    29,
    "4e1f5f989170eb869682a914d5d03faa1786601d039c80cf415d20a6eaeb27b7"
  ],
  "s15-privacy": [
    7,
    "45f59c9c63c5ae04fff08bd4c0c7dbb51cf65422a43220275c4e05fbbfab6ce6"
  ],
  "s15-observed": [
    7,
    "1e772c8c584df805dc85ddecd6f34aacbe4c2c26ee32cc9af881767fe40e1abf"
  ],
  "s15-shared-file": [
    9,
    "3167b546e5b031d28f9ab8b43b439fbde22fc9c98dbdd2213b501662155a2ac5"
  ],
  "s15-common-b": [
    6,
    "f7d19fa99501bad33d1ac5189d619c820101b253857ca3c5e394fd5aefc4ba41"
  ],
  "s15-evening-walk": [
    1,
    "2e9d99408e8d3641f980e885ee44dc0042476a19738564a1d51215cbf5348b95"
  ],
  "s15-evening-photo": [
    1,
    "313892c1ae5fcbd94681139c88fd71dde49b14eeb11a21367a18ddc6113fad07"
  ]
};
const scene=id=>graphData.scenes.find(x=>x.id===id);
const paragraphs=id=>(scene(id)?.beats??[]).filter(b=>b.type==='dialogue').map(b=>b.text.ru);
const voices=['nick','eric','damir'], gestures=['walk','photo'];
const policies={
  a:['s15-privacy',['nick-failure-private','private-text-declined']],
  b:['s15-observed',['nick-failure-observed','private-text-limited']],
  c:['s15-shared-file',['nick-failure-shared-file','private-text-pending']],
};

test('S15 ten displayed canonical prose blocks match pinned 83 unique paragraphs and SHA-256',()=>{
  assert.equal(Object.values(proof).reduce((n,[count])=>n+count,0),83);
  for(const [id,[count,sha]] of Object.entries(proof)){
    const shown=paragraphs(id);
    assert.equal(shown.length,count,id);
    assert.equal(createHash('sha256').update(shown.join('\n\n')).digest('hex'),sha,id);
  }
  assert.doesNotThrow(()=>defineNarrativeGraph(graphData));
});

test('S14 enters S15; guarded S09 callback, three privacy policies and both S14 payoffs',()=>{
  for(const g of gestures)assert.equal(scene('s14-gesture-'+g).nextSceneId,'s15-intro');
  assert.equal(scene('s14-m3-end'),undefined);
  const voice=scene('s15-intro').beats.at(-1);
  assert.equal(voice.id,'s15-voice-dispatch');
  assert.deepEqual(voice.choices.map(({id,targetSceneId,when,effects})=>[id,targetSceneId,when,effects]),[
    ['nick','s15-nick-voice',{flag:'skogafoss-voice-nick'},undefined],
    ['eric','s15-other-voice',{flag:'skogafoss-voice-eric'},undefined],
    ['damir','s15-other-voice',{flag:'skogafoss-voice-damir'},undefined],
  ]);
  for(const v of ['nick-voice','other-voice'])assert.equal(scene('s15-'+v).nextSceneId,'s15-common-a');
  const policy=scene('s15-common-a').beats.at(-1);
  assert.equal(policy.id,'s15-privacy-choice');
  assert.deepEqual(policy.choices.map(({id,label,targetSceneId,effects})=>[id,label.ru,targetSceneId,effects]),[
    ['a','Защитить приватность: оставить разговор только между ними','s15-privacy',
      [{op:'flag_set',id:'nick-failure-private',value:true},
       {op:'flag_set',id:'private-text-declined',value:true}]],
    ['b','Оставить честный материал, но назвать Нику точные границы','s15-observed',
      [{op:'flag_set',id:'nick-failure-observed',value:true},
       {op:'flag_set',id:'private-text-limited',value:true}]],
    ['c','Предложить совместно выбрать один фрагмент и право остановить его','s15-shared-file',
      [{op:'flag_set',id:'nick-failure-shared-file',value:true},
       {op:'flag_set',id:'private-text-pending',value:true}]],
  ]);
  for(const [target]of Object.values(policies))assert.equal(scene(target).nextSceneId,'s15-common-b');
  const evening=scene('s15-common-b').beats.at(-1);
  assert.equal(evening.id,'s15-gesture-dispatch');
  assert.deepEqual(evening.choices.map(({id,targetSceneId,when,effects})=>[id,targetSceneId,when,effects]),[
    ['walk','s15-evening-walk',{flag:'eric-gesture-walk'},undefined],
    ['photo','s15-evening-photo',{flag:'eric-gesture-photo'},undefined],
  ]);
  for(const g of gestures)assert.equal(scene('s15-evening-'+g).nextSceneId,'s16-intro');
  assert.equal(scene('s15-m3-end'),undefined);
  for(const gated of [voice,evening])assert.ok(gated.choices.every(c=>c.label.ru==='Продолжить'&&!c.effects));
  for(const c of [...voice.choices,...policy.choices,...evening.choices]){
    for(const key of ['cost','premium','contentId','requiredEntitlement','romancePoints',
      'publishPermission','consentToPublish','routeLock'])assert.equal(c[key],undefined);
  }
});

function runtimeFrom(graph,catalog,snapshot){
  const update=createNarrativeRuntimeUpdate({graph,catalog});
  let state={narrative:JSON.parse(JSON.stringify(snapshot))};
  const act=action=>update({deltaMs:16,state,inputs:[{schemaVersion:1,type:'pointer',
    action,phase:'up',timestamp:151,source:'renderer'}],setState(s){state=s;}});
  const advance=id=>{
    assert.equal(state.narrative.sceneId,id);
    for(const beat of scene(id).beats.filter(b=>b.type==='dialogue'))
      act('narrative:next:'+beat.id);
  };
  return {graph,catalog,act,advance,get:()=>state.narrative};
}

function toS15(voice,gesture){
  const graph=defineNarrativeGraph(graphData),catalog=defineNarrativeCatalog(catalogData);
  const run=runtimeFrom(graph,catalog,createNarrativeState(graph));
  const tone=voice==='eric'?'playful':'quiet';
  const route={
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
    's09-voice-choice':voice,'s09-career-dispatch':'people',
    's10-seat-dispatch':'eric','s10-tone-choice':tone,
    's11-consent-dispatch':'declined','s11-safety-choice':'a',
    's12-care-dispatch':'warm','s12-voice-dispatch':voice==='damir'?'damir':'other',
    's12-past-choice':'listen','s12-draft-choice':'private',
    's12-return-choice':'chocolate','s13-voice-dispatch':voice,
    's13-work-choice':'editor','s13-return-dispatch':'chocolate',
    's14-tone-dispatch':tone,'s14-pace-choice':'slow',
    's14-gesture-choice':gesture,
  };
  for(let i=0;i<5000&&run.get().sceneId!=='s15-intro';i++){
    const {sceneId,beatIndex}=run.get(),beat=scene(sceneId)?.beats[beatIndex];
    const before=sceneId+':'+beatIndex+':'+run.get().actionLog.length;
    assert.ok(beat,sceneId+':'+beatIndex);
    if(beat.type==='dialogue')run.act('narrative:next:'+beat.id);
    else if(beat.type==='choice'){
      assert.ok(route[beat.id],'unmapped '+beat.id);
      run.act('narrative:choose:'+beat.id+':'+route[beat.id]);
    }else assert.fail('unexpected prior ending '+sceneId);
    const after=run.get();
    assert.notEqual(after.sceneId+':'+after.beatIndex+':'+after.actionLog.length,before,
      'stalled N1 action on '+sceneId+':'+beatIndex);
  }
  assert.equal(run.get().sceneId,'s15-intro');
  return run;
}

function checkedBack(run,selected,other,expected){
  const before=JSON.parse(JSON.stringify(run.get()));
  for(const option of [selected,other]){
    run.act('narrative:choose:s15-privacy-choice:'+option);
    for(const flag of policies[option][1])assert.equal(run.get().flags[flag],true);
    run.act('narrative:back');
    assert.equal(run.get().sceneId,'s15-common-a');
    for(const flag of policies[option][1])assert.equal(run.get().flags[flag],undefined);
  }
  assert.deepEqual({...run.get().flags},before.flags);
  assert.equal(run.get().beatIndex,before.beatIndex);
  run.act('narrative:choose:s15-privacy-choice:'+selected);
  for(const flag of expected)assert.equal(run.get().flags[flag],true);
}

function restoredAndTampered(run,chosen){
  const saved=JSON.parse(JSON.stringify(run.get()));
  const [target,flags]=policies[chosen];
  const next='narrative:next:'+scene(target).beats[0].id;
  const fresh=runtimeFrom(run.graph,run.catalog,saved);
  fresh.act(next);
  assert.equal(fresh.get().sceneId,target);
  assert.equal(fresh.get().beatIndex,1);
  for(const flag of flags)assert.equal(fresh.get().flags[flag],true);
  const wrong=chosen==='a'?'b':'a';
  const forged={...saved,flags:{...saved.flags,[policies[wrong][1][0]]:true}};
  const missing={...saved,flags:Object.fromEntries(Object.entries(saved.flags)
    .filter(([key])=>key!==flags[1]))};
  for(const invalid of [forged,missing]){
    const update=createNarrativeRuntimeUpdate({graph:run.graph,catalog:run.catalog});
    assert.throws(()=>update({deltaMs:16,state:{narrative:invalid},
      inputs:[{schemaVersion:1,type:'pointer',action:next,phase:'up',
        timestamp:152,source:'renderer'}],setState(){}}),
      /inconsistent actionLog provenance or position/);
  }
}

test('S09 three voices × S15 privacy three outcomes × S14 gesture two: real N1, Back, JSON, tamper',()=>{
  for(const voice of voices)for(const gesture of gestures){
    const base=toS15(voice,gesture);
    base.advance('s15-intro');
    const invalid=voice==='nick'?'eric':'nick';
    const before=JSON.stringify(base.get());
    base.act('narrative:choose:s15-voice-dispatch:'+invalid);
    assert.equal(JSON.stringify(base.get()),before);
    base.act('narrative:choose:s15-voice-dispatch:'+voice);
    base.advance('s15-'+(voice==='nick'?'nick-voice':'other-voice'));
    base.advance('s15-common-a');
    const checkpoint=JSON.parse(JSON.stringify(base.get()));
    for(const chosen of Object.keys(policies)){
      const run=runtimeFrom(base.graph,base.catalog,checkpoint);
      const other=chosen==='a'?'b':'a';
      checkedBack(run,chosen,other,policies[chosen][1]);
      restoredAndTampered(run,chosen);
      const [target,flags]=policies[chosen];
      for(const flag of flags)assert.equal(run.get().flags[flag],true);
      assert.equal(run.get().flags['skogafoss-voice-'+voice],true);
      assert.equal(run.get().flags['eric-gesture-'+gesture],true);
      assert.equal(run.get().flags['eric-pace-slow'],true);
      assert.equal(run.get().flags['consent-camera-declined-respected'],true);
      assert.equal(run.get().flags['beach-footage-safe-only'],true);
      assert.equal(run.get().flags['alice-leads-editor'],true);
      assert.equal(run.get().routeLock,null);
      run.advance(target);
      run.advance('s15-common-b');
      const wrongGesture=gesture==='walk'?'photo':'walk';
      const prior=JSON.stringify(run.get());
      run.act('narrative:choose:s15-gesture-dispatch:'+wrongGesture);
      assert.equal(JSON.stringify(run.get()),prior);
      run.act('narrative:choose:s15-gesture-dispatch:'+gesture);
      run.advance('s15-evening-'+gesture);
      assert.equal(run.get().sceneId,'s16-intro');
    }
  }
});

test('S15 decisions remain free; optional Economy E5 does not affect first game',()=>{
  assert.equal(existsSync(new URL('../game/config/economy.json',import.meta.url)),false);
  assert.equal(existsSync(new URL('../game/config/premium.json',import.meta.url)),false);
  assert.deepEqual(catalogData.interactions,[]);
});
