import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { graphData,catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph,defineNarrativeCatalog,createNarrativeState,createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Independently derived from pinned EP03/S12 text, excluding headings and state notes.
const proof={
  "s12-intro": [
    6,
    "ca17c4390bfbf324c01c49690b7d5f2b1ca5bd6be4a365af6b6e5ed48029f923"
  ],
  "s12-care-warm": [
    5,
    "6c9670b03685f626756b9437d786078b679dd1eb5ad1e85debc284a931760d13"
  ],
  "s12-care-neutral": [
    6,
    "8b4904d54d73db8e9d810caa37f7cc8f9f43bd59b5fab52677ba547b8a47d02d"
  ],
  "s12-care-personal": [
    6,
    "9c2395c4ccefd6e715e29f414aaff63e24884e63b5b3f6ce54d39e21385d3ad2"
  ],
  "s12-common-a": [
    2,
    "e2dfd7e2dcce605c0cf0551a517e802429568e2b943c40a8343f5e9abf541deb"
  ],
  "s12-voice-damir": [
    2,
    "23ba9fa731fe3aeb0eb9a64984aebb0f605aa2ebaa9ec99cff34751d725bc483"
  ],
  "s12-voice-other": [
    2,
    "b9e1f477a54261fafb0883560b564e2bdbb799276a35f9bf8747961cb57e6746"
  ],
  "s12-common-b": [
    8,
    "78d63b7cd3667a32f7889e24e3e57a31d7fe702a8ffe33ad21d1aabc7d35fb6c"
  ],
  "s12-past-listen": [
    7,
    "2a82fa708596a62e07a55874dad1134af839e9f916f304d4a84231476393c709"
  ],
  "s12-past-pause": [
    9,
    "9a2a8daa5c2db9ab907ecc48a51a4dceab6d528b4c2b948db2a6cdf0fe25a831"
  ],
  "s12-common-c": [
    12,
    "388e59f1ab0192e0bdbc5fa93866220434734d7ac6b81abbeb3e0a07c4409374"
  ],
  "s12-draft-damir": [
    8,
    "af01e0a10e268e08686464acbe0372ddda91215cf125999c946514d81643bf81"
  ],
  "s12-draft-private": [
    4,
    "f0e5374078b4cd656d7e60ea78a5aeb44571e8d9a233daaf72ecb7112bca62db"
  ],
  "s12-common-d": [
    18,
    "ffb8d1a26565e456a325decc67891d56c3e1c373236ba348847584d41d364308"
  ],
  "s12-return-chocolate": [
    1,
    "1032335f301fb842db5a2f86b094361009880becda6a519683bf7c72b43242b3"
  ],
  "s12-return-alone": [
    1,
    "6d546bdfddc70bda27558661a62b9276b39430d49adbfa687f860a47cc9abbd8"
  ]
};
const scene=id=>graphData.scenes.find(x=>x.id===id);
const paragraphs=id=>(scene(id)?.beats??[]).filter(x=>x.type==='dialogue').map(x=>x.text.ru);
const careOptions=['warm','neutral','personal'];
const voiceOptions=['damir','eric','nick'];
const pastOptions=['listen','pause'];
const draftOptions=['damir','private'];
const returnOptions=['chocolate','alone'];

test('S12 all sixteen authored blocks match pinned manuscript paragraph counts and SHA-256',()=>{
  for(const [id,[count,sha]]of Object.entries(proof)){
    const p=paragraphs(id);
    assert.equal(p.length,count,id);
    assert.equal(createHash('sha256').update(p.join('\n\n')).digest('hex'),sha,id);
  }
  assert.doesNotThrow(()=>defineNarrativeGraph(graphData));
});

test('S11→S12 plus guarded S08/S09 callbacks and three separate free two-way author choices',()=>{
  assert.equal(scene('s11-common-b').nextSceneId,'s12-intro');
  assert.equal(scene('s11-m3-end'),undefined);
  const care=scene('s12-intro').beats.at(-1);
  assert.equal(care.id,'s12-care-dispatch');
  assert.deepEqual(care.choices.map(({id,targetSceneId,when})=>[id,targetSceneId,when]),[
    ['warm','s12-care-warm',{flag:'damir-care-warm'}],
    ['neutral','s12-care-neutral',{flag:'damir-care-neutral'}],
    ['personal','s12-care-personal',{flag:'damir-care-personal'}],
  ]);
  for(const c of careOptions)assert.equal(scene('s12-care-'+c).nextSceneId,'s12-common-a');
  const voice=scene('s12-common-a').beats.at(-1);
  assert.equal(voice.id,'s12-voice-dispatch');
  assert.deepEqual(voice.choices.map(({id,targetSceneId,when})=>[id,targetSceneId,when]),[
    ['damir','s12-voice-damir',{flag:'skogafoss-voice-damir'}],
    ['other','s12-voice-other',{any:[{flag:'skogafoss-voice-eric'},{flag:'skogafoss-voice-nick'}]}],
  ]);
  assert.equal(scene('s12-voice-damir').nextSceneId,'s12-common-b');
  assert.equal(scene('s12-voice-other').nextSceneId,'s12-common-b');
  for(const gate of [care,voice]) assert.ok(gate.choices.every(x=>x.label.ru==='Продолжить'&&!x.effects));
  const declarations=[
    ['s12-common-b','s12-past-choice',[
      ['listen','Спросить о людях, которые теперь рядом с ним','s12-past-listen','damir-past-listen'],
      ['pause','Попросить оставить разговор на сегодня','s12-past-pause','damir-past-pause']]],
    ['s12-common-c','s12-draft-choice',[
      ['damir','Показать две строки','s12-draft-damir','draft-shared-damir'],
      ['private','Оставить черновик у себя','s12-draft-private','draft-shared-private']]],
    ['s12-common-d','s12-return-choice',[
      ['chocolate','Позвать его зайти за горячим шоколадом','s12-return-chocolate','s12-return-chocolate'],
      ['alone','Вернуться к группе одной','s12-return-alone','s12-return-alone']]],
  ];
  for(const [source,id,expected]of declarations){
    const choice=scene(source).beats.at(-1);
    assert.equal(choice.id,id);
    assert.deepEqual(choice.choices.map(c=>[c.id,c.label.ru,c.targetSceneId,c.effects]),expected.map(
      ([option,label,target,flag])=>[option,label,target,[{op:'flag_set',id:flag,value:true}]]));
    for(const c of choice.choices)for(const forbidden of ['cost','premium','contentId','requiredEntitlement'])
      assert.equal(c[forbidden],undefined);
  }
  for(const c of pastOptions)assert.equal(scene('s12-past-'+c).nextSceneId,'s12-common-c');
  for(const c of draftOptions)assert.equal(scene('s12-draft-'+c).nextSceneId,'s12-common-d');
  for(const c of returnOptions)assert.equal(scene('s12-return-'+c).nextSceneId,'s13-intro');
  assert.equal(scene('s12-m3-end'),undefined);
});
function toS12(care,voice){
  const graph=defineNarrativeGraph(graphData),catalog=defineNarrativeCatalog(catalogData);
  const update=createNarrativeRuntimeUpdate({graph,catalog});
  let state={narrative:createNarrativeState(graph)};
  const act=action=>update({deltaMs:16,state,inputs:[{schemaVersion:1,type:'pointer',
    action,phase:'up',timestamp:121,source:'renderer'}],setState(s){state=s;}});
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
    's10-seat-dispatch':'eric','s10-tone-choice':'playful',
    's11-consent-dispatch':'declined','s11-safety-choice':'a',
  };
  for(let i=0;i<3000&&state.narrative.sceneId!=='s12-intro';i++){
    const {sceneId,beatIndex}=state.narrative,beat=scene(sceneId)?.beats[beatIndex];
    assert.ok(beat,sceneId+':'+beatIndex);
    if(beat.type==='dialogue')act('narrative:next:'+beat.id);
    else if(beat.type==='choice'){
      assert.ok(route[beat.id],'unmapped '+beat.id);
      act('narrative:choose:'+beat.id+':'+route[beat.id]);
    }else assert.fail('early ending '+sceneId);
  }
  assert.equal(state.narrative.sceneId,'s12-intro');
  const advance=id=>{
    assert.equal(state.narrative.sceneId,id);
    for(const b of scene(id).beats.filter(x=>x.type==='dialogue'))act('narrative:next:'+b.id);
  };
  return {graph,catalog,act,advance,get:()=>state.narrative,set(x){state={narrative:JSON.parse(JSON.stringify(x))};}};
}
function assertChoiceUndo(run,sceneId,choiceBeat,chosen,other,flag){
  const snapshot=JSON.parse(JSON.stringify(run.get()));
  run.act('narrative:choose:'+choiceBeat+':'+chosen);
  assert.equal(run.get().flags[flag],true);
  run.act('narrative:back');
  assert.equal(run.get().sceneId,sceneId);
  assert.equal(run.get().flags[flag],undefined);
  run.act('narrative:choose:'+choiceBeat+':'+other);
  run.act('narrative:back');
  assert.deepEqual({...run.get().flags},snapshot.flags);
  run.act('narrative:choose:'+choiceBeat+':'+chosen);
}
function restoreAndRejectTamper(run,target,flag,conflicting){
  const saved=JSON.parse(JSON.stringify(run.get()));
  const fresh=createNarrativeRuntimeUpdate({graph:run.graph,catalog:run.catalog});
  const input={schemaVersion:1,type:'pointer',action:'narrative:next:'+scene(target).beats[0].id,
    phase:'up',timestamp:122,source:'renderer'};
  let resumed={narrative:JSON.parse(JSON.stringify(saved))};
  fresh({deltaMs:16,state:resumed,inputs:[input],setState(x){resumed=x;}});
  if(scene(target).beats.length===1){
    assert.equal(resumed.narrative.sceneId,scene(target).nextSceneId);
    assert.equal(resumed.narrative.beatIndex,0);
  }else{
    assert.equal(resumed.narrative.sceneId,target);
    assert.equal(resumed.narrative.beatIndex,1);
  }
  assert.equal(resumed.narrative.flags[flag],true);
  const corrupt={...saved,flags:{...saved.flags,[conflicting]:true}};
  const missing={...saved,flags:Object.fromEntries(Object.entries(saved.flags).filter(([key])=>key!==flag))};
  for(const damaged of [corrupt,missing])assert.throws(()=>fresh({
    deltaMs:16,state:{narrative:damaged},inputs:[input],setState(){},
  }),/inconsistent actionLog provenance or position/);
}
test('S08 care × S09 voice callbacks plus all S12 choices preserve Back and fresh-runtime state',()=>{
  for(const care of careOptions)for(const voice of ['damir',care==='neutral'?'nick':'eric']){
    const run=toS12(care,voice);
    run.advance('s12-intro');
    const atCare=JSON.stringify(run.get());
    for(const wrong of careOptions.filter(x=>x!==care)){
      run.act('narrative:choose:s12-care-dispatch:'+wrong);
      assert.equal(JSON.stringify(run.get()),atCare);
    }
    run.act('narrative:choose:s12-care-dispatch:'+care);
    run.advance('s12-care-'+care);
    run.advance('s12-common-a');
    const answer=voice==='damir'?'damir':'other';
    const wrong=answer==='damir'?'other':'damir';
    const atVoice=JSON.stringify(run.get());
    run.act('narrative:choose:s12-voice-dispatch:'+wrong);
    assert.equal(JSON.stringify(run.get()),atVoice);
    run.act('narrative:choose:s12-voice-dispatch:'+answer);
    run.advance('s12-voice-'+answer);
    run.advance('s12-common-b');
    assert.equal(run.get().flags['damir-care-'+care],true);
    assert.equal(run.get().flags['skogafoss-voice-'+voice],true);
    const past=care==='neutral'?'pause':'listen',otherPast=past==='listen'?'pause':'listen';
    assertChoiceUndo(run,'s12-common-b','s12-past-choice',past,otherPast,'damir-past-'+past);
    assert.equal(run.get().sceneId,'s12-past-'+past);
    restoreAndRejectTamper(run,'s12-past-'+past,'damir-past-'+past,'damir-past-'+otherPast);
    run.advance('s12-past-'+past);
    run.advance('s12-common-c');
    const draft=voice==='damir'?'damir':'private',otherDraft=draft==='damir'?'private':'damir';
    assertChoiceUndo(run,'s12-common-c','s12-draft-choice',draft,otherDraft,'draft-shared-'+draft);
    assert.equal(run.get().sceneId,'s12-draft-'+draft);
    restoreAndRejectTamper(run,'s12-draft-'+draft,'draft-shared-'+draft,'draft-shared-'+otherDraft);
    run.advance('s12-draft-'+draft);
    run.advance('s12-common-d');
    const path=care==='personal'?'chocolate':'alone',otherPath=path==='chocolate'?'alone':'chocolate';
    assertChoiceUndo(run,'s12-common-d','s12-return-choice',path,otherPath,'s12-return-'+path);
    restoreAndRejectTamper(run,'s12-return-'+path,'s12-return-'+path,'s12-return-'+otherPath);
    assert.equal(run.get().flags['damir-care-'+care],true);
    assert.equal(run.get().flags['skogafoss-voice-'+voice],true);
    assert.equal(run.get().flags['damir-past-'+past],true);
    assert.equal(run.get().flags['draft-shared-'+draft],true);
    assert.equal(run.get().routeLock,null);
    run.advance('s12-return-'+path);
    assert.equal(run.get().sceneId,'s13-intro');
  }
});
test('S12 cannot use optional Ludory Economy E5 in the first novel',()=>{
  assert.equal(existsSync(new URL('../game/config/economy.json',import.meta.url)),false);
  assert.equal(existsSync(new URL('../game/config/premium.json',import.meta.url)),false);
  assert.deepEqual(catalogData.interactions,[]);
});
