import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Independently extracted from pinned EP04/S13 prose, omitting metadata and authorial labels.
const proof = {
  "s13-intro": [
    28,
    "b75c1619bebcab1fd1b23b7409ea26de853b4f1674102ea6b8665e82471a136b"
  ],
  "s13-voice-eric": [
    6,
    "2cfe4269433a6cb255c947d7db2e6e714d619720ffa3a4e547163a97d6cca89f"
  ],
  "s13-voice-nick": [
    4,
    "9d08aad2225db95661a2a44c56d9a3dc5d09909026b07e35393e2d740127ff54"
  ],
  "s13-voice-damir": [
    4,
    "2e8a4d5d33eb3a1d3cb9b16abd7e1ad3ccb44034e95181c2b37bd1b67bd0150d"
  ],
  "s13-common-a": [
    6,
    "2a54238b51e3cb7d3fa36969b5a42362ed1522e599c52e421934c2f90638de8c"
  ],
  "s13-work-editor": [
    12,
    "eb3b155f5bde5339d45bb696746c53f897731305c1c646d211a81ce16bb37886"
  ],
  "s13-work-shared": [
    11,
    "c7440188508fa961dd413f00e4ff7ff01e4746f78522d1a06c9b8b018649ea8d"
  ],
  "s13-common-b": [
    6,
    "414c0ae3a828689f792cc252ab168d9824f9dfa8001dff0a0a1bf2b597132e1e"
  ],
  "s13-return-chocolate": [
    1,
    "3f40cd5d8f93910f30f5c3bdbb5422d8256b62e6c36e9a5cdf74c24b134e5769"
  ],
  "s13-return-alone": [
    1,
    "9ce3e36d15cb12141e6243a2df040f8d5e3f5ee0e8a472a61951d0f4291b607d"
  ]
};
const scene=id=>graphData.scenes.find(x=>x.id===id);
const paragraphs=id=>(scene(id)?.beats??[]).filter(x=>x.type==='dialogue').map(x=>x.text.ru);
const voices=['eric','nick','damir'];
const returns=['chocolate','alone'];
const choices=['editor','shared'];

test('S13 all ten authored dialogue blocks render exact pinned paragraphs and SHA-256',()=>{
  assert.equal(Object.values(proof).reduce((n,[count])=>n+count,0),79);
  for(const [id,[count,sha]]of Object.entries(proof)){
    const actual=paragraphs(id);
    assert.equal(actual.length,count,id);
    assert.equal(createHash('sha256').update(actual.join('\n\n')).digest('hex'),sha,id);
  }
  assert.doesNotThrow(()=>defineNarrativeGraph(graphData));
});

test('S12→S13 uses all three guarded voice callbacks, authored free C1 and both S12-C3 payoffs',()=>{
  for(const path of returns)assert.equal(scene('s12-return-'+path).nextSceneId,'s13-intro');
  assert.equal(scene('s12-m3-end'),undefined);
  const voice=scene('s13-intro').beats.at(-1);
  assert.equal(voice.id,'s13-voice-dispatch');
  assert.deepEqual(voice.choices.map(({id,targetSceneId,when,effects})=>[id,targetSceneId,when,effects]),[
    ['eric','s13-voice-eric',{flag:'skogafoss-voice-eric'},undefined],
    ['nick','s13-voice-nick',{flag:'skogafoss-voice-nick'},undefined],
    ['damir','s13-voice-damir',{flag:'skogafoss-voice-damir'},undefined],
  ]);
  for(const v of voices)assert.equal(scene('s13-voice-'+v).nextSceneId,'s13-common-a');
  const work=scene('s13-common-a').beats.at(-1);
  assert.equal(work.id,'s13-work-choice');
  assert.deepEqual(work.choices.map(({id,label,targetSceneId,effects})=>[id,label.ru,targetSceneId,effects]),[
    ['editor','Вести заметку самой и отвечать за согласие каждого','s13-work-editor',
      [{op:'flag_set',id:'alice-leads-editor',value:true}]],
    ['shared','Отказаться от роли распорядителя и договориться о равном сборе материала',
      's13-work-shared',[{op:'flag_set',id:'alice-leads-shared',value:true}]],
  ]);
  for(const c of choices)assert.equal(scene('s13-work-'+c).nextSceneId,'s13-common-b');
  const prior=scene('s13-common-b').beats.at(-1);
  assert.equal(prior.id,'s13-return-dispatch');
  assert.deepEqual(prior.choices.map(({id,targetSceneId,when,effects})=>[id,targetSceneId,when,effects]),[
    ['chocolate','s13-return-chocolate',{flag:'s12-return-chocolate'},undefined],
    ['alone','s13-return-alone',{flag:'s12-return-alone'},undefined],
  ]);
  for(const r of returns)assert.equal(scene('s13-return-'+r).nextSceneId,'s14-intro');
  assert.equal(scene('s13-m3-end'),undefined);
  for(const gate of [voice,prior])assert.ok(gate.choices.every(c=>c.label.ru==='Продолжить'&&!c.effects));
  for(const c of [...voice.choices,...work.choices,...prior.choices]){
    for(const forbidden of ['cost','premium','contentId','requiredEntitlement','romancePoints'])
      assert.equal(c[forbidden],undefined);
  }
});

function toS13(voice,returnPath){
  const graph=defineNarrativeGraph(graphData),catalog=defineNarrativeCatalog(catalogData);
  const update=createNarrativeRuntimeUpdate({graph,catalog});
  let state={narrative:createNarrativeState(graph)};
  const act=action=>update({deltaMs:16,state,inputs:[{schemaVersion:1,type:'pointer',
    action,phase:'up',timestamp:131,source:'renderer'}],setState(s){state=s;}});
  const route={
    's01-seat-choice':'front-eric','s02-career-choice':'people',
    's03-career-dispatch':'people','s03-seat-dispatch':'other',
    's03-after-pharmacy-choice':'silence','s04-camera-consent-choice':'declined',
    's04-s03-dispatch':'silence','s05-weather-choice':'damir',
    's06-weather-dispatch':'other','s06-seat-dispatch':'eric',
    's06-eric-choice':'music','s07-weather-dispatch':'other',
    's07-seat-dispatch':'other','s07-consent-dispatch':'declined',
    's07-archive-choice':'private','s07-s06-dispatch':'music',
    's08-weather-dispatch':'damir','s08-damir-care-choice':voice==='damir'?'personal':'warm',
    's66-damir-dispatch':voice==='damir'?'personal':'warm',
    's66-career-dispatch':'people','s09-voice-choice':voice,
    's09-career-dispatch':'people','s10-seat-dispatch':'eric',
    's10-tone-choice':'playful','s11-consent-dispatch':'declined',
    's11-safety-choice':'a','s12-care-dispatch':voice==='damir'?'personal':'warm',
    's12-voice-dispatch':voice==='damir'?'damir':'other',
    's12-past-choice':voice==='eric'?'pause':'listen',
    's12-draft-choice':voice==='nick'?'private':'damir',
    's12-return-choice':returnPath,
  };
  for(let i=0;i<3500&&state.narrative.sceneId!=='s13-intro';i++){
    const {sceneId,beatIndex}=state.narrative,beat=scene(sceneId)?.beats[beatIndex];
    assert.ok(beat,sceneId+':'+beatIndex);
    if(beat.type==='dialogue')act('narrative:next:'+beat.id);
    else if(beat.type==='choice'){
      assert.ok(route[beat.id],'unmapped '+beat.id);
      act('narrative:choose:'+beat.id+':'+route[beat.id]);
    }else assert.fail('unexpected earlier ending '+sceneId);
  }
  assert.equal(state.narrative.sceneId,'s13-intro');
  const advance=id=>{
    assert.equal(state.narrative.sceneId,id);
    for(const b of scene(id).beats.filter(x=>x.type==='dialogue'))act('narrative:next:'+b.id);
  };
  return {graph,catalog,act,advance,get:()=>state.narrative};
}

function assertRestoreAndTamper(run,target,flag,opposite){
  const saved=JSON.parse(JSON.stringify(run.get()));
  const resume=createNarrativeRuntimeUpdate({graph:run.graph,catalog:run.catalog});
  const event={schemaVersion:1,type:'pointer',
    action:'narrative:next:'+scene(target).beats[0].id,
    phase:'up',timestamp:132,source:'renderer'};
  let state={narrative:JSON.parse(JSON.stringify(saved))};
  resume({deltaMs:16,state,inputs:[event],setState(s){state=s;}});
  assert.equal(state.narrative.sceneId,target);
  assert.equal(state.narrative.beatIndex,1);
  assert.equal(state.narrative.flags[flag],true);
  const forged={...saved,flags:{...saved.flags,[opposite]:true}};
  const missing={...saved,flags:Object.fromEntries(Object.entries(saved.flags).filter(([id])=>id!==flag))};
  for(const invalid of [forged,missing])assert.throws(()=>resume({
    deltaMs:16,state:{narrative:invalid},inputs:[event],setState(){},
  }),/inconsistent actionLog provenance or position/);
}

test('all S09 voices × S12 returns reach S13, Back and fresh-runtime state preserve authored decisions',()=>{
  for(const voice of voices)for(const ret of returns){
    const run=toS13(voice,ret);
    run.advance('s13-intro');
    const beforeVoice=JSON.stringify(run.get());
    for(const wrong of voices.filter(v=>v!==voice)){
      run.act('narrative:choose:s13-voice-dispatch:'+wrong);
      assert.equal(JSON.stringify(run.get()),beforeVoice);
    }
    run.act('narrative:choose:s13-voice-dispatch:'+voice);
    run.advance('s13-voice-'+voice);
    run.advance('s13-common-a');
    const chosen=ret==='chocolate'?'editor':'shared',other=chosen==='editor'?'shared':'editor';
    const snapshot=JSON.parse(JSON.stringify(run.get()));
    for(const attempt of [chosen,other]){
      run.act('narrative:choose:s13-work-choice:'+attempt);
      assert.equal(run.get().flags['alice-leads-'+attempt],true);
      run.act('narrative:back');
      assert.equal(run.get().sceneId,'s13-common-a');
      assert.equal(run.get().flags['alice-leads-'+attempt],undefined);
    }
    assert.deepEqual({...run.get().flags},snapshot.flags);
    run.act('narrative:choose:s13-work-choice:'+chosen);
    assertRestoreAndTamper(run,'s13-work-'+chosen,'alice-leads-'+chosen,'alice-leads-'+other);
    run.advance('s13-work-'+chosen);
    run.advance('s13-common-b');
    const beforeRet=JSON.stringify(run.get()),wrongRet=ret==='chocolate'?'alone':'chocolate';
    run.act('narrative:choose:s13-return-dispatch:'+wrongRet);
    assert.equal(JSON.stringify(run.get()),beforeRet);
    run.act('narrative:choose:s13-return-dispatch:'+ret);
    assert.equal(run.get().flags['s12-return-'+ret],true);
    assert.equal(run.get().flags['skogafoss-voice-'+voice],true);
    assert.equal(run.get().flags['alice-leads-'+chosen],true);
    assert.equal(run.get().flags['draft-shared-'+(voice==='nick'?'private':'damir')],true);
    assert.equal(run.get().routeLock,null);
    run.advance('s13-return-'+ret);
    assert.equal(run.get().sceneId,'s14-intro');
  }
});

test('S13 authorial choice cannot turn on optional Economy E5 in the first novel',()=>{
  assert.equal(existsSync(new URL('../game/config/economy.json',import.meta.url)),false);
  assert.equal(existsSync(new URL('../game/config/premium.json',import.meta.url)),false);
  assert.deepEqual(catalogData.interactions,[]);
});
