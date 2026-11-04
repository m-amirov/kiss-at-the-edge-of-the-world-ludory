import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState, createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Pinned independently to original manuscript @1e775f1, EP03 S11.
const proof = {
  "s11-intro": [
    2,
    "1cc2b054862cd0254146ff3f516c5f1c8dc40f6378b820891a21eca38edddace"
  ],
  "s11-camera-accepted": [
    4,
    "0afd4d26d66a78c088f90be92a9f78d7a28164f7462f1480f6890749723b266e"
  ],
  "s11-camera-declined": [
    4,
    "a5302ab578c19826a395f295d2cae550b8e2bbde9b1642621d68462ef4aa1fe4"
  ],
  "s11-camera-negotiated": [
    3,
    "ef30d117a33fea519ad790231669a05f50a7df9c9160c5eaac9e912a6a371093"
  ],
  "s11-common-a": [
    13,
    "82c832f665a2baf481a02bba0cca778296377789d2093480114a0d0e258be23c"
  ],
  "s11-safe-point": [
    11,
    "b16ae35329faf7b2306e8a3a91c46eb9dc58dec5720349e486ecfcf509a562be"
  ],
  "s11-leave-water": [
    6,
    "8292ce01d3cd26febb2f1a6645f74fb5a9ae95a984be13f09b2949684b30518f"
  ],
  "s11-check-rules": [
    8,
    "fd45da4095605f59db897dc9ec6cc24ca5e82384db9a2074e42d8fce32fb0fcb"
  ],
  "s11-common-b": [
    7,
    "16542f7f7f4434f15f2508209d467d0a2f8f67bd95fd57d6595797ad20eb376b"
  ]
};
const scene = id => graphData.scenes.find(x => x.id === id);
const paragraphs = id => (scene(id)?.beats ?? [])
  .filter(x => x.type === 'dialogue').map(x => x.text.ru);
const consentFlag = {
  accepted: 'consent-camera-accepted',
  declined: 'consent-camera-declined-respected',
  negotiated: 'consent-camera-negotiated',
};
const outcomes = {
  a: ['s11-safe-point', ['beach-footage-safe-only', 'nick-safety-changed-position']],
  b: ['s11-leave-water', ['beach-footage-none', 'nick-safety-deleted']],
  c: ['s11-check-rules', ['beach-footage-safe-only', 'nick-safety-asked-then-reframed']],
};
test('S11 nine manuscript blocks render exactly, not just in source files', () => {
  for (const [id, [count, hash]] of Object.entries(proof)) {
    const p = paragraphs(id);
    assert.equal(p.length, count, id);
    assert.equal(createHash('sha256').update(p.join('\n\n')).digest('hex'), hash, id);
  }
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
});
test('S10 enters S11; S04 consent guards and free safety choice have exact effects', () => {
  assert.equal(scene('s10-common').nextSceneId, 's11-intro');
  assert.equal(scene('s10-m3-end'), undefined);
  const dispatch = scene('s11-intro').beats.at(-1);
  assert.equal(dispatch.id, 's11-consent-dispatch');
  assert.deepEqual(dispatch.choices.map(({ id, targetSceneId, when }) => [id,targetSceneId,when]), [
    ['accepted','s11-camera-accepted',{flag:consentFlag.accepted}],
    ['declined','s11-camera-declined',{flag:consentFlag.declined}],
    ['negotiated','s11-camera-negotiated',{flag:consentFlag.negotiated}],
  ]);
  assert.ok(dispatch.choices.every(x => x.label.ru === 'Продолжить' && !x.effects));
  for (const c of Object.keys(consentFlag)) assert.equal(scene('s11-camera-'+c).nextSceneId,'s11-common-a');
  const choice=scene('s11-common-a').beats.at(-1);
  assert.equal(choice.id,'s11-safety-choice');
  assert.deepEqual(choice.choices.map(({id,label,targetSceneId,effects})=>[id,label.ru,targetSceneId,effects]),[
    ['a','Предложить безопасную точку для того же замысла','s11-safe-point',[
      {op:'flag_set',id:'beach-footage-safe-only',value:true},
      {op:'flag_set',id:'nick-safety-changed-position',value:true}]],
    ['b','Попросить всех уйти от воды, не обсуждая кадр сейчас','s11-leave-water',[
      {op:'flag_set',id:'beach-footage-none',value:true},
      {op:'flag_set',id:'nick-safety-deleted',value:true}]],
    ['c','Предложить сначала разобраться с правилами, затем решить вопрос о съёмке','s11-check-rules',[
      {op:'flag_set',id:'beach-footage-safe-only',value:true},
      {op:'flag_set',id:'nick-safety-asked-then-reframed',value:true}]],
  ]);
  for(const [id] of Object.values(outcomes))assert.equal(scene(id).nextSceneId,'s11-common-b');
  assert.equal(scene('s11-common-b').nextSceneId,'s11-m3-end');
  assert.equal(scene('s11-m3-end').beats[0].type,'ending');
  for(const c of [...dispatch.choices,...choice.choices])
    for(const key of ['cost','premium','contentId','requiredEntitlement'])
      assert.equal(c[key],undefined);
});
function toS11(consent) {
  const graph=defineNarrativeGraph(graphData),catalog=defineNarrativeCatalog(catalogData);
  const update=createNarrativeRuntimeUpdate({graph,catalog});
  let state={narrative:createNarrativeState(graph)};
  const act=action=>update({deltaMs:16,state,inputs:[{schemaVersion:1,type:'pointer',
    action,phase:'up',timestamp:111,source:'renderer'}],setState(s){state=s;}});
  const route={
    's01-seat-choice':'front-eric','s02-career-choice':'people',
    's03-career-dispatch':'people','s03-seat-dispatch':'other',
    's03-after-pharmacy-choice':'silence','s04-camera-consent-choice':consent,
    's04-s03-dispatch':'silence','s05-weather-choice':'damir',
    's06-weather-dispatch':'other','s06-seat-dispatch':'eric',
    's06-eric-choice':'music','s07-weather-dispatch':'other',
    's07-seat-dispatch':'other','s07-consent-dispatch':consent,
    's07-archive-choice':'private','s07-s06-dispatch':'music',
    's08-weather-dispatch':'damir','s08-damir-care-choice':'warm',
    's66-damir-dispatch':'warm','s66-career-dispatch':'people',
    's09-voice-choice':'nick','s09-career-dispatch':'people',
    's10-seat-dispatch':'eric','s10-tone-choice':'playful',
  };
  for(let i=0;i<3000&&state.narrative.sceneId!=='s11-intro';i++){
    const {sceneId,beatIndex}=state.narrative,beat=scene(sceneId)?.beats[beatIndex];
    assert.ok(beat,sceneId+':'+beatIndex);
    if(beat.type==='dialogue')act('narrative:next:'+beat.id);
    else if(beat.type==='choice'){
      assert.ok(route[beat.id],'unmapped '+beat.id);
      act('narrative:choose:'+beat.id+':'+route[beat.id]);
    }else assert.fail('early ending '+sceneId);
  }
  assert.equal(state.narrative.sceneId,'s11-intro');
  const advance=id=>{
    assert.equal(state.narrative.sceneId,id);
    for(const beat of scene(id).beats.filter(x=>x.type==='dialogue'))
      act('narrative:next:'+beat.id);
  };
  return {graph,catalog,act,advance,get:()=>state.narrative,
    set(s){state={narrative:JSON.parse(JSON.stringify(s))};}};
}
test('three S04 consents × three S11 outcomes: Back, JSON restore, tamper rejection',()=>{
  for(const consent of Object.keys(consentFlag)){
    const run=toS11(consent);
    run.advance('s11-intro');
    const before=JSON.stringify(run.get());
    for(const wrong of Object.keys(consentFlag).filter(x=>x!==consent)){
      run.act('narrative:choose:s11-consent-dispatch:'+wrong);
      assert.equal(JSON.stringify(run.get()),before,'wrong callback must be rejected');
    }
    run.act('narrative:choose:s11-consent-dispatch:'+consent);
    run.advance('s11-camera-'+consent);
    run.advance('s11-common-a');
    const beforeChoice=JSON.parse(JSON.stringify(run.get()));
    for(const [answer,[target,flags]] of Object.entries(outcomes)){
      run.set(beforeChoice);
      run.act('narrative:choose:s11-safety-choice:'+answer);
      assert.equal(run.get().sceneId,target);
      assert.deepEqual(Object.keys(run.get().flags).filter(k=>
        k.startsWith('beach-footage-')||k.startsWith('nick-safety-')).sort(),flags.slice().sort());
      assert.equal(run.get().flags[consentFlag[consent]],true);
      assert.equal(run.get().flags['eric-tone-playful'],true);
      assert.equal(run.get().routeLock,null);
      assert.ok(!Object.keys(run.get().flags).some(k=>k.startsWith('s11-camera-permission-')));
      const saved=JSON.parse(JSON.stringify(run.get()));
      const fresh=createNarrativeRuntimeUpdate({graph:run.graph,catalog:run.catalog});
      const next=scene(target).beats[0].id;
      const input={schemaVersion:1,type:'pointer',action:'narrative:next:'+next,
        phase:'up',timestamp:112,source:'renderer'};
      let resumed={narrative:JSON.parse(JSON.stringify(saved))};
      fresh({deltaMs:16,state:resumed,inputs:[input],setState(x){resumed=x;}});
      assert.equal(resumed.narrative.beatIndex,1);
      assert.equal(resumed.narrative.flags[consentFlag[consent]],true);
      for(const corrupt of [
        {...saved,flags:{...saved.flags,['beach-footage-'+(answer==='b'?'safe-only':'none')]:true}},
        {...saved,flags:Object.fromEntries(Object.entries(saved.flags).filter(([key])=>key!==flags[1]))},
      ]){
        assert.throws(()=>fresh({deltaMs:16,state:{narrative:corrupt},inputs:[input],setState(){}}),
          /inconsistent actionLog provenance or position/);
      }
      run.act('narrative:back');
      assert.equal(run.get().sceneId,'s11-common-a');
      assert.equal(run.get().flags[flags[0]],undefined);
      assert.equal(run.get().flags[flags[1]],undefined);
      assert.equal(run.get().flags[consentFlag[consent]],true);
      run.act('narrative:choose:s11-safety-choice:'+answer);
      run.advance(target);
      run.advance('s11-common-b');
      assert.equal(run.get().sceneId,'s11-m3-end');
    }
  }
});
test('S11 keeps first game fully free with Ludory Economy E5 off',()=>{
  assert.equal(existsSync(new URL('../game/config/economy.json',import.meta.url)),false);
  assert.equal(existsSync(new URL('../game/config/premium.json',import.meta.url)),false);
  assert.deepEqual(catalogData.interactions,[]);
});
