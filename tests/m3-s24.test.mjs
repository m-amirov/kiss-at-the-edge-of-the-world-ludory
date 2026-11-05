import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Fixed independently from pinned EP06/S24, before writing S24 production code.
// Includes both sides of every authored alternative; excludes markdown headers
// and technical access markers. Input: displayed paragraphs joined by \n\n.
const sourceProof = {
  's24-intro': [6,'2aca4ac3160c9695e30d4ef68dce3013eba389eff7c9d1b237f96d32a18ff427'],
  's24-evening-eric': [4,'a2a9ac34965bcdb0f06745b91f400516827c1481a6eb21bea1c8c29774114bef'],
  's24-evening-nick': [3,'58e1bbaf9c1ee9e8b9557a9f909d082909c5c3cc7dc62d3075b13ef754848d6e'],
  's24-evening-damir': [3,'4b9a90eb5e82e807f1b2d8d5f9b2bbd111d27bd1fb6f785d1536bf3074ea2b69'],
  's24-evening-alice': [4,'67ceca7b96e552b5db17aa73f6a64646edfbc97e88ebfcdbf53c4dfc1bf50f9d'],
  's24-contact-kiss': [4,'8617df3ff8c4ac06ca8a3397d51c4d38aa493c858ec85001a6c31dd763514202'],
  's24-contact-hug': [4,'efff019391701a917e0139993ca625cc07453c5de15b8bc30bb1858f77057c0c'],
  's24-contact-distance': [4,'4d1a8247c9d2bf6630ba837654dbac5fe4d8ab349f72f4a80eebbf565081a972'],
  's24-common-a': [8,'ec729a97ad72eed1f9a33a4676ea3e7ff74788cb2e9bab414b4526584fb054a7'],
  's24-choice-limited': [5,'1b63b956aaf4431a2f88098511abbf49470e98b2b9b79af5d180d465126eee53'],
  's24-choice-no-review': [4,'784683d6f1b91d7bf05e18a3b366426106aa29f2077684748f1576e02fa82cdf'],
  's24-common-b': [4,'c3d98c94420e89df0178ad2884800a53478d67f9669c758459238fb2ab2c6711'],
  's24-followup-camera-free': [1,'08c063071a169eef1f11a5e5a0de108e6bb8549a0149b5b0879af84baae5881a'],
  's24-followup-breakfast': [1,'c239fedc5efd882a8b37cc3d5a8d7b7a656761228e93181ebdfc7e87b3410f18'],
};
const scene=id=>graphData.scenes.find(s=>s.id===id);
const dialogue=id=>(scene(id)?.beats??[]).filter(b=>b.type==='dialogue').map(b=>b.text.ru);
const choice=(id,beatId)=>scene(id)?.beats.find(b=>b.id===beatId);
const eveningFlags={eric:'s17-evening-eric',nick:'s17-evening-nick',
  damir:'s17-evening-damir',alice:'s17-evening-self'};

test('S24 renders all 14 exact authorial blocks and 55 distinct paragraphs',()=>{
  assert.equal(Object.values(sourceProof).reduce((n,[count])=>n+count,0),55);
  for(const [id,[count,sha]] of Object.entries(sourceProof)){
    const paragraphs=dialogue(id);
    assert.equal(paragraphs.length,count,id);
    assert.equal(createHash('sha256').update(paragraphs.join('\n\n')).digest('hex'),sha,id);
    assert.ok(paragraphs.every(p=>!p.startsWith('Технический переход')&&
      !p.startsWith('Выбор S24-')&&!p.startsWith('Если `S19-C3')),id);
  }
  const deletion=dialogue('s24-common-a').join('\n\n');
  assert.match(deletion,/Это удалить/);
  assert.match(deletion,/удалил фрагмент из рабочей папки и подборки для тизера/);
  assert.match(deletion,/Не спросил, можно ли отправлять твоё лицо в тизере/);
  assert.doesNotThrow(()=>defineNarrativeGraph(graphData));
});

test('S23 enters S24; Nick-only old contact and follow-up guards; free review/no-review',()=>{
  assert.equal(scene('s23-after-m3-end'),undefined);
  assert.equal(scene('s23-followup-dispatch').beats[0].choices[2].targetSceneId,'s24-intro');
  for(const id of ['postcards','song'])
    assert.equal(scene('s23-followup-'+id).nextSceneId,'s24-intro');
  assert.equal(scene('s24-intro').nextSceneId,'s24-evening-dispatch');
  const evening=choice('s24-evening-dispatch','s24-evening-choice');
  assert.deepEqual(evening.choices.map(c=>[c.id,c.targetSceneId,c.when?.flag,c.effects]),[
    ['eric','s24-evening-eric','s17-evening-eric',undefined],
    ['nick','s24-evening-nick','s17-evening-nick',undefined],
    ['damir','s24-evening-damir','s17-evening-damir',undefined],
    ['alice','s24-evening-alice','s17-evening-self',undefined],
  ]);
  for(const id of Object.keys(eveningFlags))
    assert.equal(scene('s24-evening-'+id).nextSceneId,'s24-contact-dispatch');
  const contact=choice('s24-contact-dispatch','s24-contact-choice');
  assert.deepEqual(contact.choices.slice(0,3).map(c=>[c.id,c.targetSceneId,c.when?.flag,c.effects]),[
    ['k','s24-contact-kiss','nick-contact-kiss',undefined],
    ['h','s24-contact-hug','nick-contact-hug',undefined],
    ['d','s24-contact-distance','nick-contact-distance',undefined],
  ]);
  assert.equal(contact.choices[3].id,'skip');
  assert.equal(contact.choices[3].targetSceneId,'s24-common-a');
  assert.deepEqual(contact.choices[3].when?.any,
    [{flag:'s17-evening-eric'},{flag:'s17-evening-damir'},{flag:'s17-evening-self'}]);
  for(const id of ['kiss','hug','distance'])
    assert.equal(scene('s24-contact-'+id).nextSceneId,'s24-common-a');
  const c1=choice('s24-common-a','s24-nick-choice');
  assert.deepEqual(c1.choices.map(c=>[c.id,c.targetSceneId,c.effects]),[
    ['limited-review','s24-choice-limited',[{op:'flag_set',id:'nick-choice-limited-review',value:true}]],
    ['no-review','s24-choice-no-review',[{op:'flag_set',id:'nick-choice-no-review',value:true}]],
  ]);
  for(const id of ['limited','no-review'])
    assert.equal(scene('s24-choice-'+id).nextSceneId,'s24-common-b');
  assert.equal(scene('s24-common-b').nextSceneId,'s24-followup-dispatch');
  const followup=choice('s24-followup-dispatch','s24-followup-choice');
  assert.deepEqual(followup.choices.slice(0,2).map(c=>[c.id,c.targetSceneId,c.when?.flag,c.effects]),[
    ['camera-free','s24-followup-camera-free','nick-followup-camera-free',undefined],
    ['breakfast','s24-followup-breakfast','nick-followup-breakfast',undefined],
  ]);
  assert.equal(followup.choices[2].id,'skip');
  assert.equal(followup.choices[2].targetSceneId,'s25-intro');
  assert.deepEqual(followup.choices[2].when?.any,
    [{flag:'s17-evening-eric'},{flag:'s17-evening-damir'},{flag:'s17-evening-self'}]);
  for(const id of ['camera-free','breakfast'])
    assert.equal(scene('s24-followup-'+id).nextSceneId,'s25-intro');
  assert.equal(scene('s24-after-m3-end'),undefined);
  assert.equal(scene('s25-intro').nextSceneId,'s25-evening-dispatch');
  for(const c of [...evening.choices,...contact.choices,...c1.choices,...followup.choices])
    for(const key of ['cost','premium','routeLock','routeIntent','romancePoints',
      'requiredEntitlement','publishPermission','consentToPublish','mediaPermission'])
      assert.equal(c[key],undefined,key);
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
  's17-d-dispatch':'a','s17-group-choice':'d',
};
const earlierEvenings={
  eric:{choice:'eric',actions:{
    's18-contact-choice':'stay-without-kiss','s18-payoff-dispatch-choice':'s',
    's18-followup-choice':'song',
  }},
  damir:{choice:'damir',actions:{
    's20-dinner-choice':'tea-without-touch','s20-payoff-choice':'t',
    's20-followup-choice':'waterfront',
  }},
  alice:{choice:'self',actions:{
    's21-letter-choice':'own','s21-reply-choice':'c',
    's21-followup-choice':'friend','s61-editor-choice':'c',
    's61-day-choice':'alone-longer','s61-followup-payoff-choice':'friend',
  }},
};
const sharedDay11={
  's22-weather-choice':'damir','s22-repair-choice':'roles','s22-stop-choice':'group',
  's23-open-choice':'read-page','s23-repair-choice':'roles','s23-stop-choice':'group',
};
const deepSave=value=>JSON.parse(JSON.stringify(value));
function runtime(snapshot){
  const graph=defineNarrativeGraph(graphData),catalog=defineNarrativeCatalog(catalogData);
  const update=createNarrativeRuntimeUpdate({graph,catalog});
  let state={narrative:deepSave(snapshot??createNarrativeState(graph))};
  const act=action=>update({deltaMs:16,state,inputs:[{schemaVersion:1,type:'pointer',
    action,phase:'up',timestamp:193,source:'renderer'}],setState(s){state=s;}});
  return {graph,catalog,act,get:()=>state.narrative};
}
function walkUntil(run,stop,actions={},max=7100){
  for(let i=0;i<max;i++){
    const {sceneId,beatIndex}=run.get();
    const b=scene(sceneId)?.beats[beatIndex];
    assert.ok(b,'missing '+sceneId+':'+beatIndex);
    if(stop(b,sceneId))return;
    const before=sceneId+':'+beatIndex;
    if(b.type==='dialogue')run.act('narrative:next:'+b.id);
    else if(b.type==='choice'){
      assert.ok(actions[b.id],'unmapped choice '+b.id+' at '+sceneId);
      run.act('narrative:choose:'+b.id+':'+actions[b.id]);
    }else assert.fail('premature ending '+sceneId);
    assert.notEqual(run.get().sceneId+':'+run.get().beatIndex,before,'stalled '+before);
  }
  assert.fail('exceeded '+max+' narrative beats');
}
function eveningCheckpoint(){
  const run=runtime();
  walkUntil(run,b=>b.id==='s17-evening-choice',priorRoute);
  assert.equal(run.get().flags['weather-choice-damir'],true);
  return deepSave(run.get());
}
function day11Actions(route){
  return {...sharedDay11,'s23-evening-choice':route,
    's23-contact-choice':route==='eric'?'s':'skip',
    's23-followup-choice':route==='eric'?'song':'skip'};
}
function otherS24Checkpoints(evening){
  const results={};
  for(const [route,{choice:eveningChoice,actions}] of Object.entries(earlierEvenings)){
    const run=runtime(evening);
    run.act('narrative:choose:s17-evening-choice:'+eveningChoice);
    walkUntil(run,(_b,id)=>id==='s24-intro',{...actions,...day11Actions(route)});
    assert.equal(run.get().flags[eveningFlags[route]],true);
    results[route]=deepSave(run.get());
  }
  return results;
}
function nickS24Checkpoints(evening){
  const first=runtime(evening);
  first.act('narrative:choose:s17-evening-choice:nick');
  walkUntil(first,b=>b.id==='s19-contact-choice',{'s19-photo-choice':'no-photo'});
  const contactCheckpoint=deepSave(first.get());
  const results=[];
  for(const [contact,old,dispatch] of [
    ['k','kiss','k'],['h','hug','h'],['d','distance','d'],
  ]){
    const run=runtime(contactCheckpoint);
    run.act('narrative:choose:s19-contact-choice:'+old);
    walkUntil(run,b=>b.id==='s19-followup-choice',{
      's19-photo-payoff-choice':'b','s19-contact-payoff-choice':dispatch,
    });
    const followCheckpoint=deepSave(run.get());
    for(const followup of ['camera-free','breakfast']){
      const resumed=runtime(followCheckpoint);
      resumed.act('narrative:choose:s19-followup-choice:'+followup);
      walkUntil(resumed,(_b,id)=>id==='s24-intro',day11Actions('nick'));
      assert.equal(resumed.get().flags[eveningFlags.nick],true);
      results.push({contact,followup,saved:deepSave(resumed.get())});
    }
  }
  return results;
}
function expectNoWrite(run,action){
  const before=JSON.stringify(run.get());
  run.act(action);
  assert.equal(JSON.stringify(run.get()),before,'guard rejected '+action);
}
function completeS24(saved,{route,contact='h',followup='camera-free',c1}){
  const run=runtime(saved);
  walkUntil(run,(_b,id)=>id==='s24-evening-dispatch');
  for(const invalid of Object.keys(eveningFlags).filter(x=>x!==route))
    expectNoWrite(run,'narrative:choose:s24-evening-choice:'+invalid);
  run.act('narrative:choose:s24-evening-choice:'+route);
  assert.equal(run.get().sceneId,'s24-evening-'+route);
  walkUntil(run,(_b,id)=>id==='s24-contact-dispatch');
  if(route==='nick'){
    for(const wrong of ['k','h','d','skip'].filter(x=>x!==contact))
      expectNoWrite(run,'narrative:choose:s24-contact-choice:'+wrong);
    run.act('narrative:choose:s24-contact-choice:'+contact);
    assert.equal(run.get().sceneId,{
      k:'s24-contact-kiss',h:'s24-contact-hug',d:'s24-contact-distance',
    }[contact]);
  }else{
    for(const wrong of ['k','h','d'])
      expectNoWrite(run,'narrative:choose:s24-contact-choice:'+wrong);
    run.act('narrative:choose:s24-contact-choice:skip');
  }
  walkUntil(run,b=>b.id==='s24-nick-choice');
  assert.equal(run.get().sceneId,'s24-common-a');
  expectNoWrite(run,'narrative:choose:s24-nick-choice:send-producer');
  const before=JSON.stringify(run.get());
  run.act('narrative:choose:s24-nick-choice:'+c1);
  assert.equal(run.get().flags['nick-choice-'+c1],true);
  assert.equal(run.get().flags['nick-choice-'+(c1==='limited-review'?'no-review':'limited-review')],undefined);
  run.act('narrative:back');
  assert.equal(JSON.stringify(run.get()),before,'Back fully reverses S24-C1');
  run.act('narrative:choose:s24-nick-choice:'+c1);
  const resumed=runtime(deepSave(run.get()));
  walkUntil(resumed,(_b,id)=>id==='s24-followup-dispatch');
  if(route==='nick'){
    expectNoWrite(resumed,'narrative:choose:s24-followup-choice:skip');
    expectNoWrite(resumed,'narrative:choose:s24-followup-choice:'+
      (followup==='camera-free'?'breakfast':'camera-free'));
    resumed.act('narrative:choose:s24-followup-choice:'+followup);
    assert.equal(resumed.get().sceneId,'s24-followup-'+followup);
  }else{
    for(const wrong of ['camera-free','breakfast'])
      expectNoWrite(resumed,'narrative:choose:s24-followup-choice:'+wrong);
    resumed.act('narrative:choose:s24-followup-choice:skip');
  }
  walkUntil(resumed,(_b,id)=>id==='s25-intro');
  assert.equal(resumed.get().routeLock,null);
  assert.equal(resumed.get().flags['private-text-pending'],true);
  for(const forbidden of ['nick-joint-file-approved','editor-publish-approved',
    'nick-producer-teaser-approved','alice-teaser-publish-approved'])
    assert.equal(resumed.get().flags[forbidden],undefined,'no invented consent '+forbidden);
  return resumed;
}

test('real N1: 4 evenings, all Nick contacts × follow-ups × both free S24-C1 choices',()=>{
  const evening=eveningCheckpoint();
  const others=otherS24Checkpoints(evening);
  for(const [route,saved] of Object.entries(others))
    for(const c1 of ['limited-review','no-review'])
      completeS24(saved,{route,c1});
  const nick=nickS24Checkpoints(evening);
  assert.equal(nick.length,6);
  for(const {saved,contact,followup} of nick)
    for(const c1 of ['limited-review','no-review'])
      completeS24(saved,{route:'nick',contact,followup,c1});
});

test('N1 rejects forged S24 review flags and actionLog after fresh JSON',()=>{
  const saved=otherS24Checkpoints(eveningCheckpoint()).damir;
  const run=runtime(saved);
  walkUntil(run,b=>b.id==='s24-nick-choice',{
    's24-evening-choice':'damir','s24-contact-choice':'skip',
  });
  run.act('narrative:choose:s24-nick-choice:limited-review');
  const chosen=deepSave(run.get());
  const forged=[
    {...chosen,flags:{...chosen.flags,'nick-choice-no-review':true}},
    {...chosen,flags:Object.fromEntries(Object.entries(chosen.flags)
      .filter(([id])=>id!=='nick-choice-limited-review'))},
    {...chosen,actionLog:chosen.actionLog.map(entry=>
      entry.type==='choose'&&entry.beatId==='s24-nick-choice'
        ?{...entry,optionId:'no-review'}:entry)},
    {...chosen,actionLog:chosen.actionLog.slice(0,-1)},
  ];
  for(const invalid of forged){
    const before=JSON.stringify(invalid);
    let writes=0;
    assert.throws(()=>createNarrativeRuntimeUpdate({graph:run.graph,catalog:run.catalog})({
      deltaMs:16,state:{narrative:invalid},inputs:[{schemaVersion:1,type:'pointer',
        action:'narrative:next:'+scene('s24-choice-limited').beats[0].id,
        phase:'up',timestamp:195,source:'renderer'}],setState(){writes++;},
    }),/inconsistent actionLog provenance or position|unavailable choice/);
    assert.equal(writes,0);
    assert.equal(JSON.stringify(invalid),before);
  }
  assert.equal(run.get().flags['nick-choice-limited-review'],true);
});

test('S24 never enables economy or marks photo review as publishing consent',()=>{
  assert.equal(existsSync(new URL('../game/config/economy.json',import.meta.url)),false);
  assert.equal(existsSync(new URL('../game/config/premium.json',import.meta.url)),false);
  assert.deepEqual(catalogData.interactions,[]);
  assert.equal(scene('s25-after-m3-end'),undefined);
  assert.equal(scene('s58-after-m3-end').beats[0].type,'ending');
});
