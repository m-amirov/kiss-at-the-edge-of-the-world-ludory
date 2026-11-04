import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Independently extracted from pinned EP04/S14 narrative prose, excluding authorial metadata.
const proof = {
  "s14-intro": [
    7,
    "fe3b2140fb1000b19660339411a34b7fbc15bddda5113d8e2dbc01aee4deb598"
  ],
  "s14-tone-playful": [
    4,
    "498e4695d487eea4deb5c9851412c5b5fec00511c88fd10a46359577841b57a1"
  ],
  "s14-tone-quiet": [
    4,
    "e132dd165a97a2f72c46260ba73e82edf4edf2383336c99636e15293d29250d9"
  ],
  "s14-common-a": [
    26,
    "2406a13a405197c8bea7603460645c7287985815206e1a74a849dd2fb7d9bbd4"
  ],
  "s14-pace-slow": [
    7,
    "fc7cae8ca0f8818ad739c33028305db7492374eabc1079f12778f727883d5ee6"
  ],
  "s14-pace-short": [
    7,
    "66e418f736d58f67b3d6f618518d84048fcd87a19623b7df134b122c0e5f5097"
  ],
  "s14-common-b": [
    6,
    "d302cedc5661925f52c859c22dcdbd73c3ffe3ac0195cdd7dd5dde43792c3e90"
  ],
  "s14-gesture-walk": [
    1,
    "0d81519d1cdc0d26f71eba2e6ac567b0af72fb357fb5f6899b66a459b49b3fb7"
  ],
  "s14-gesture-photo": [
    1,
    "eb4c44f813cb2d8982772a09507de83a1333aebf1eb6561259571c6242153631"
  ]
};
const scene=id=>graphData.scenes.find(x=>x.id===id);
const paragraphs=id=>(scene(id)?.beats??[]).filter(b=>b.type==='dialogue').map(b=>b.text.ru);
const tones=['playful','quiet'],paces=['slow','short'],gestures=['walk','photo'];

test('S14 all nine authored prose blocks match pinned 63 paragraphs and SHA-256',()=>{
  assert.equal(Object.values(proof).reduce((sum,[count])=>sum+count,0),63);
  for(const [id,[count,hash]]of Object.entries(proof)){
    const shown=paragraphs(id);
    assert.equal(shown.length,count,id);
    assert.equal(createHash('sha256').update(shown.join('\n\n')).digest('hex'),hash,id);
  }
  assert.doesNotThrow(()=>defineNarrativeGraph(graphData));
});

test('S13 enters S14, S10 guarded tone and both free authored S14 choices have exact state effects',()=>{
  for(const r of ['chocolate','alone'])assert.equal(scene('s13-return-'+r).nextSceneId,'s14-intro');
  assert.equal(scene('s13-m3-end'),undefined);
  const gate=scene('s14-intro').beats.at(-1);
  assert.equal(gate.id,'s14-tone-dispatch');
  assert.deepEqual(gate.choices.map(({id,targetSceneId,when,effects})=>[id,targetSceneId,when,effects]),[
    ['playful','s14-tone-playful',{flag:'eric-tone-playful'},undefined],
    ['quiet','s14-tone-quiet',{flag:'eric-tone-quiet'},undefined],
  ]);
  for(const t of tones)assert.equal(scene('s14-tone-'+t).nextSceneId,'s14-common-a');
  const pace=scene('s14-common-a').beats.at(-1);
  assert.equal(pace.id,'s14-pace-choice');
  assert.deepEqual(pace.choices.map(({id,label,targetSceneId,effects})=>[id,label.ru,targetSceneId,effects]),[
    ['slow','Попросить идти медленнее и назвать причину','s14-pace-slow',
      [{op:'flag_set',id:'eric-pace-slow',value:true}]],
    ['short','Предложить короткий возврат и взять на себя решение','s14-pace-short',
      [{op:'flag_set',id:'eric-pace-short',value:true}]],
  ]);
  for(const p of paces)assert.equal(scene('s14-pace-'+p).nextSceneId,'s14-common-b');
  const gesture=scene('s14-common-b').beats.at(-1);
  assert.equal(gesture.id,'s14-gesture-choice');
  assert.deepEqual(gesture.choices.map(({id,label,targetSceneId,effects})=>[id,label.ru,targetSceneId,effects]),[
    ['walk','Самой предложить прогуляться вдвоём после ужина','s14-gesture-walk',
      [{op:'flag_set',id:'eric-gesture-walk',value:true}]],
    ['photo','Поделиться с ним забавной находкой с маршрута','s14-gesture-photo',
      [{op:'flag_set',id:'eric-gesture-photo',value:true}]],
  ]);
  for(const g of gestures)assert.equal(scene('s14-gesture-'+g).nextSceneId,'s14-m3-end');
  assert.equal(scene('s14-m3-end').beats[0].type,'ending');
  assert.ok(gate.choices.every(c=>c.label.ru==='Продолжить'&&!c.effects));
  for(const c of [...gate.choices,...pace.choices,...gesture.choices])
    for(const key of ['cost','premium','contentId','requiredEntitlement','romancePoints'])
      assert.equal(c[key],undefined);
});

function toS14(tone,pace){
  const graph=defineNarrativeGraph(graphData),catalog=defineNarrativeCatalog(catalogData);
  const update=createNarrativeRuntimeUpdate({graph,catalog});
  let state={narrative:createNarrativeState(graph)};
  const act=action=>update({deltaMs:16,state,inputs:[{schemaVersion:1,type:'pointer',
    action,phase:'up',timestamp:141,source:'renderer'}],setState(s){state=s;}});
  const voice=tone==='playful'?'eric':'nick';
  const care=pace==='slow'?'warm':'personal';
  const returning=pace==='slow'?'chocolate':'alone';
  const route={
    's01-seat-choice':'front-eric','s02-career-choice':'people',
    's03-career-dispatch':'people','s03-seat-dispatch':'other',
    's03-after-pharmacy-choice':'silence','s04-camera-consent-choice':'declined',
    's04-s03-dispatch':'silence','s05-weather-choice':'damir',
    's06-weather-dispatch':'other','s06-seat-dispatch':'eric',
    's06-eric-choice':'music','s07-weather-dispatch':'other',
    's07-seat-dispatch':'other','s07-consent-dispatch':'declined',
    's07-archive-choice':'private','s07-s06-dispatch':'music',
    's08-weather-dispatch':'damir','s08-damir-care-choice':care,
    's66-damir-dispatch':care,'s66-career-dispatch':'people',
    's09-voice-choice':voice,'s09-career-dispatch':'people',
    's10-seat-dispatch':'eric','s10-tone-choice':tone,
    's11-consent-dispatch':'declined','s11-safety-choice':'a',
    's12-care-dispatch':care,'s12-voice-dispatch':'other',
    's12-past-choice':tone==='quiet'?'pause':'listen',
    's12-draft-choice':tone==='quiet'?'private':'damir',
    's12-return-choice':returning,
    's13-voice-dispatch':voice,'s13-work-choice':tone==='quiet'?'shared':'editor',
    's13-return-dispatch':returning,
  };
  for(let i=0;i<4000&&state.narrative.sceneId!=='s14-intro';i++){
    const {sceneId,beatIndex}=state.narrative,beat=scene(sceneId)?.beats[beatIndex];
    assert.ok(beat,sceneId+':'+beatIndex);
    if(beat.type==='dialogue')act('narrative:next:'+beat.id);
    else if(beat.type==='choice'){
      assert.ok(route[beat.id],'unmapped '+beat.id);
      act('narrative:choose:'+beat.id+':'+route[beat.id]);
    }else assert.fail('unexpected prior ending '+sceneId);
  }
  assert.equal(state.narrative.sceneId,'s14-intro');
  const advance=id=>{
    assert.equal(state.narrative.sceneId,id);
    for(const beat of scene(id).beats.filter(b=>b.type==='dialogue'))act('narrative:next:'+beat.id);
  };
  return {graph,catalog,act,advance,get:()=>state.narrative,voice,returning};
}

function undoBoth(run,at,choiceId,selected,other,prefix){
  const before=JSON.parse(JSON.stringify(run.get()));
  for(const option of [selected,other]){
    run.act('narrative:choose:'+choiceId+':'+option);
    assert.equal(run.get().flags[prefix+option],true);
    run.act('narrative:back');
    assert.equal(run.get().sceneId,at);
    assert.equal(run.get().flags[prefix+option],undefined);
  }
  assert.deepEqual({...run.get().flags},before.flags);
  run.act('narrative:choose:'+choiceId+':'+selected);
}

function verifyRestoredAndTamper(run,target,flag,conflicting){
  const saved=JSON.parse(JSON.stringify(run.get()));
  const updater=createNarrativeRuntimeUpdate({graph:run.graph,catalog:run.catalog});
  const event={schemaVersion:1,type:'pointer',action:'narrative:next:'+scene(target).beats[0].id,
    phase:'up',timestamp:142,source:'renderer'};
  let state={narrative:JSON.parse(JSON.stringify(saved))};
  updater({deltaMs:16,state,inputs:[event],setState(s){state=s;}});
  const single=scene(target).beats.length===1;
  assert.equal(state.narrative.sceneId,single?scene(target).nextSceneId:target);
  assert.equal(state.narrative.beatIndex,single?0:1);
  assert.equal(state.narrative.flags[flag],true);
  const forged={...saved,flags:{...saved.flags,[conflicting]:true}};
  const missing={...saved,flags:Object.fromEntries(Object.entries(saved.flags).filter(([k])=>k!==flag))};
  for(const damaged of [forged,missing])assert.throws(()=>updater({
    deltaMs:16,state:{narrative:damaged},inputs:[event],setState(){},
  }),/inconsistent actionLog provenance or position/);
}

test('S10 tone × S14 pace × S14 gesture: actual runtime, Back, JSON and tamper',()=>{
  for(const tone of tones)for(const pace of paces)for(const gesture of gestures){
    const run=toS14(tone,pace);
    run.advance('s14-intro');
    const saved=JSON.stringify(run.get()),otherTone=tone==='quiet'?'playful':'quiet';
    run.act('narrative:choose:s14-tone-dispatch:'+otherTone);
    assert.equal(JSON.stringify(run.get()),saved);
    run.act('narrative:choose:s14-tone-dispatch:'+tone);
    run.advance('s14-tone-'+tone);
    run.advance('s14-common-a');
    const otherPace=pace==='short'?'slow':'short';
    undoBoth(run,'s14-common-a','s14-pace-choice',pace,otherPace,'eric-pace-');
    verifyRestoredAndTamper(run,'s14-pace-'+pace,'eric-pace-'+pace,'eric-pace-'+otherPace);
    run.advance('s14-pace-'+pace);
    run.advance('s14-common-b');
    const otherGesture=gesture==='photo'?'walk':'photo';
    undoBoth(run,'s14-common-b','s14-gesture-choice',gesture,otherGesture,'eric-gesture-');
    verifyRestoredAndTamper(run,'s14-gesture-'+gesture,'eric-gesture-'+gesture,'eric-gesture-'+otherGesture);
    assert.equal(run.get().flags['eric-tone-'+tone],true);
    assert.equal(run.get().flags['eric-pace-'+pace],true);
    assert.equal(run.get().flags['eric-gesture-'+gesture],true);
    assert.equal(run.get().flags['skogafoss-voice-'+run.voice],true);
    assert.equal(run.get().flags['s12-return-'+run.returning],true);
    assert.equal(run.get().flags['alice-leads-'+(tone==='quiet'?'shared':'editor')],true);
    assert.equal(run.get().routeLock,null);
    run.advance('s14-gesture-'+gesture);
    assert.equal(run.get().sceneId,'s14-m3-end');
  }
});

test('S14 remains fully free and Economy E5 stays disabled',()=>{
  assert.equal(existsSync(new URL('../game/config/economy.json',import.meta.url)),false);
  assert.equal(existsSync(new URL('../game/config/premium.json',import.meta.url)),false);
  assert.deepEqual(catalogData.interactions,[]);
});
