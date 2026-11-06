import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Fixed against pinned source EP06 S25 before implementing production scene.
// Every text block is displayed exactly as separate paragraphs joined by two LF.
const sourceProof = {
  's25-intro': [9, '92ca7fad83c910fda82555f8ea7fb456aba7a201fd778ecad68b8eb301e889b4'],
  's25-evening-eric': [3, '524afbc03ab2945df4ca7fb621d9b34bbac7b8a75b8bb416355cbabaf20db8ad'],
  's25-evening-nick': [5, 'e017c747948f038d50ce866d0247dc2a55170b3d9cdc8a8a54dfea852f14f2cf'],
  's25-evening-damir': [4, 'abd5d7ee0182e0d50bb125035a14aa4879b6a6487d2d6edf87c1a74d77ea786c'],
  's25-evening-alice': [3, '96910227390b2d17a951769118924432e5ef0af394aabea9504a4aff09aad1e8'],
  's25-contact-kiss': [3, 'eacf264bcfc59166278ab2c5c9049e207c9101b1d7d9ce4796d43478288cac31'],
  's25-contact-tea': [5, '2cf7955a241deb71b4a6ebd2330414a879abaeed839bc06409e647af7e95c303'],
  's25-contact-leave': [3, '613d741b04a186314cf58c98aaf56cea2a8a051e0478d5f3d0d4c93f063bc74c'],
  's25-common-a': [6, '6b92ce400ec7a639a8ad80960784957c51a5bc60d3706e25f17d4a650655248b'],
  's25-choice-scheduled': [3, '26b9bb890ccb0c76cc34260b8a2260fa713bc8eed8bfe263799e8868f5c1b98c'],
  's25-choice-wait': [3, 'e683669080593ae95ede2999ea581ee42c4e4e42f5d2cfdf2b597af777e861d1'],
  's25-common-b': [5, '5c29c7219a5a5eb6123c864f12cb61d5b7ec76ea62e4894ec2d0362e35626799'],
  's25-eric-page': [1, 'b369283a028bc06ea7eaf407ab54014e4b9db5b2dd566173d0ae39485c9a4185'],
  's25-eric-readers': [1, 'a6a627d3fe6d0cb254fc6f329871de44a8aa621835f09abcab18a0ee8732f720'],
  's25-followup-shopping': [1, '37db8ece42a812c959c31be1055e789689ee9f70a9474e7ea27dcaebdd4695cd'],
  's25-followup-waterfront': [1, '130c83718eea8dbd377b9f2c38cba23b4739de936541658c8a0a24c12eb57a3c'],
};
const scene=id=>graphData.scenes.find(s=>s.id===id);
const dialogue=id=>(scene(id)?.beats??[]).filter(b=>b.type==='dialogue').map(b=>b.text.ru);
const choice=(id,beatId)=>scene(id)?.beats.find(b=>b.id===beatId);
const evenings={eric:'s17-evening-eric',nick:'s17-evening-nick',
  damir:'s17-evening-damir',alice:'s17-evening-self'};

test('S25 displays all 16 exact pinned prose blocks and 56 paragraphs',()=>{
  assert.equal(Object.values(sourceProof).reduce((sum,[count])=>sum+count,0),56);
  for(const [id,[count,sha]] of Object.entries(sourceProof)){
    const paragraphs=dialogue(id);
    assert.equal(paragraphs.length,count,id);
    assert.equal(createHash('sha256').update(paragraphs.join('\n\n')).digest('hex'),sha,id);
    assert.ok(paragraphs.every(p=>!p.startsWith('Технический переход')&&
      !p.startsWith('Выбор S25-')&&!p.startsWith('Если `S20-')),id);
  }
  const shared=dialogue('s25-common-b').join('\n\n');
  assert.match(shared,/аудио для расшифровки/);
  assert.match(shared,/прислать цитаты перед публикацией/);
  assert.match(shared,/согласен на собеседование/);
  assert.doesNotThrow(()=>defineNarrativeGraph(graphData));
});

test('S24 enters S25; Damir-only callbacks, free S25-C1, Eric and Damir follow-ups',()=>{
  assert.equal(scene('s24-after-m3-end'),undefined);
  assert.equal(scene('s24-followup-dispatch').beats[0].choices[2].targetSceneId,'s25-intro');
  for(const id of ['camera-free','breakfast'])
    assert.equal(scene('s24-followup-'+id).nextSceneId,'s25-intro');
  assert.equal(scene('s25-intro').nextSceneId,'s25-evening-dispatch');
  const ev=choice('s25-evening-dispatch','s25-evening-choice');
  assert.deepEqual(ev.choices.map(c=>[c.id,c.when?.flag,c.effects]),[
    ['eric',evenings.eric,undefined],['nick',evenings.nick,undefined],
    ['damir',evenings.damir,undefined],['alice',evenings.alice,undefined],
  ]);
  for(const route of Object.keys(evenings))
    assert.equal(scene('s25-evening-'+route).nextSceneId,'s25-contact-dispatch');
  const contact=choice('s25-contact-dispatch','s25-contact-choice');
  assert.deepEqual(contact.choices.slice(0,3).map(c=>[c.id,c.when?.flag,c.effects]),[
    ['kiss','damir-dinner-new-kiss',undefined],
    ['tea','damir-dinner-tea-without-touch',undefined],
    ['leave','damir-dinner-leave',undefined],
  ]);
  assert.equal(contact.choices[3].id,'skip');
  assert.deepEqual(contact.choices[3].when?.any,
    [{flag:evenings.eric},{flag:evenings.nick},{flag:evenings.alice}]);
  const c1=choice('s25-common-a','s25-damir-choice');
  assert.deepEqual(c1.choices.map(c=>[c.id,c.targetSceneId,c.effects]),[
    ['scheduled-talk','s25-choice-scheduled',
      [{op:'flag_set',id:'damir-choice-scheduled-talk',value:true}]],
    ['wait-with-boundary','s25-choice-wait',
      [{op:'flag_set',id:'damir-choice-wait-with-boundary',value:true}]],
  ]);
  for(const id of ['scheduled','wait'])
    assert.equal(scene('s25-choice-'+id).nextSceneId,'s25-common-b');
  assert.equal(scene('s25-common-b').nextSceneId,'s25-eric-dispatch');
  const eric=choice('s25-eric-dispatch','s25-eric-choice');
  assert.deepEqual(eric.choices.map(c=>[c.id,c.when?.flag,c.effects]),[
    ['page','eric-open-read-page',undefined],
    ['readers','eric-open-trial-readers',undefined],
  ]);
  for(const id of ['page','readers'])
    assert.equal(scene('s25-eric-'+id).nextSceneId,'s25-followup-dispatch');
  const follow=choice('s25-followup-dispatch','s25-followup-choice');
  assert.deepEqual(follow.choices.slice(0,2).map(c=>[c.id,c.when?.flag,c.effects]),[
    ['shopping','damir-followup-shopping',undefined],
    ['waterfront','damir-followup-waterfront',undefined],
  ]);
  assert.deepEqual(follow.choices[2].when?.any,
    [{flag:evenings.eric},{flag:evenings.nick},{flag:evenings.alice}]);
  for(const id of ['shopping','waterfront'])
    assert.equal(scene('s25-followup-'+id).nextSceneId,'s58-intro');
  assert.equal(follow.choices[2].targetSceneId,'s58-intro');
  assert.equal(scene('s25-after-m3-end'),undefined);
  assert.equal(scene('s58-intro').beats.at(-1).id,'s58-shop-choice');
  for(const c of [...ev.choices,...contact.choices,...c1.choices,...eric.choices,...follow.choices])
    for(const key of ['cost','premium','routeLock','routeIntent','romancePoints',
      'requiredEntitlement','publishPermission','mediaPermission'])
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
const deepSave=value=>JSON.parse(JSON.stringify(value));
function runtime(snapshot){
  const graph=defineNarrativeGraph(graphData),catalog=defineNarrativeCatalog(catalogData);
  const update=createNarrativeRuntimeUpdate({graph,catalog});
  let state={narrative:deepSave(snapshot??createNarrativeState(graph))};
  const act=action=>update({deltaMs:16,state,inputs:[{schemaVersion:1,type:'pointer',
    action,phase:'up',timestamp:193,source:'renderer'}],setState(s){state=s;}});
  return {act,get:()=>state.narrative,graph,update};
}
function walkUntil(run,stop,actions={},max=7500){
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
  assert.fail('too many narrative beats');
}
function expectNoWrite(run,action){
  const before=JSON.stringify(run.get());
  run.act(action);
  assert.equal(JSON.stringify(run.get()),before,'rejected '+action);
}
const sharedDay={
  's22-weather-choice':'damir','s22-repair-choice':'roles','s22-stop-choice':'group',
  's23-repair-choice':'roles','s23-stop-choice':'group',
  's24-nick-choice':'no-review',
};
function dayActions(route,ericChoice='read-page'){
  return {...sharedDay,'s23-open-choice':ericChoice,
    's23-evening-choice':route,'s23-contact-choice':route==='eric'?'s':'skip',
    's23-followup-choice':route==='eric'?'song':'skip',
    's24-evening-choice':route,'s24-contact-choice':route==='nick'?'h':'skip',
    's24-followup-choice':route==='nick'?'camera-free':'skip'};
}
const earlier={
  eric:{evening:'eric',actions:{
    's18-contact-choice':'stay-without-kiss','s18-payoff-dispatch-choice':'s',
    's18-followup-choice':'song',
  }},
  nick:{evening:'nick',actions:{
    's19-photo-choice':'no-photo','s19-contact-choice':'hug',
    's19-photo-payoff-choice':'b','s19-contact-payoff-choice':'h',
    's19-followup-choice':'camera-free',
  }},
  alice:{evening:'self',actions:{
    's21-letter-choice':'own','s21-reply-choice':'c',
    's21-followup-choice':'friend','s61-editor-choice':'c',
    's61-day-choice':'alone-longer','s61-followup-payoff-choice':'friend',
  }},
};
function eveningCheckpoint(){
  const run=runtime();
  walkUntil(run,b=>b.id==='s17-evening-choice',priorRoute);
  return deepSave(run.get());
}
function s25SavedEvening(base,route,ericChoice){
  const branch=runtime(base);
  branch.act('narrative:choose:s17-evening-choice:'+earlier[route].evening);
  walkUntil(branch,(_b,id)=>id==='s25-intro',{
    ...earlier[route].actions,...dayActions(route,ericChoice),
  });
  return deepSave(branch.get());
}
function s25SavedDamir(base,contact,followup,ericChoice){
  const branch=runtime(base);
  branch.act('narrative:choose:s17-evening-choice:damir');
  const dinner={'kiss':'new-kiss','tea':'tea-without-touch','leave':'leave'}[contact];
  const payoff={'kiss':'k','tea':'t','leave':'l'}[contact];
  walkUntil(branch,(_b,id)=>id==='s25-intro',{
    's20-dinner-choice':dinner,'s20-payoff-choice':payoff,
    's20-followup-choice':followup,...dayActions('damir',ericChoice),
  });
  return deepSave(branch.get());
}
function completeS25(saved,{route,contact='tea',followup='shopping',eric='page',choice:answer}){
  const run=runtime(saved);
  walkUntil(run,(_b,id)=>id==='s25-evening-dispatch');
  for(const other of Object.keys(evenings).filter(x=>x!==route))
    expectNoWrite(run,'narrative:choose:s25-evening-choice:'+other);
  run.act('narrative:choose:s25-evening-choice:'+route);
  assert.equal(run.get().sceneId,'s25-evening-'+route);
  walkUntil(run,(_b,id)=>id==='s25-contact-dispatch');
  if(route==='damir'){
    for(const wrong of ['kiss','tea','leave','skip'].filter(x=>x!==contact))
      expectNoWrite(run,'narrative:choose:s25-contact-choice:'+wrong);
    run.act('narrative:choose:s25-contact-choice:'+contact);
    assert.equal(run.get().sceneId,'s25-contact-'+contact);
  }else{
    for(const wrong of ['kiss','tea','leave'])
      expectNoWrite(run,'narrative:choose:s25-contact-choice:'+wrong);
    run.act('narrative:choose:s25-contact-choice:skip');
  }
  walkUntil(run,b=>b.id==='s25-damir-choice');
  const before=JSON.stringify(run.get());
  expectNoWrite(run,'narrative:choose:s25-damir-choice:approve-relocation');
  run.act('narrative:choose:s25-damir-choice:'+answer);
  assert.equal(run.get().flags['damir-choice-'+answer],true);
  assert.equal(run.get().flags['damir-choice-'+
    (answer==='scheduled-talk'?'wait-with-boundary':'scheduled-talk')],undefined);
  run.act('narrative:back');
  assert.equal(JSON.stringify(run.get()),before,'Back restores before S25-C1');
  run.act('narrative:choose:s25-damir-choice:'+answer);
  const resumed=runtime(deepSave(run.get()));
  walkUntil(resumed,(_b,id)=>id==='s25-eric-dispatch');
  expectNoWrite(resumed,'narrative:choose:s25-eric-choice:'+
    (eric==='page'?'readers':'page'));
  resumed.act('narrative:choose:s25-eric-choice:'+eric);
  assert.equal(resumed.get().sceneId,'s25-eric-'+eric);
  walkUntil(resumed,(_b,id)=>id==='s25-followup-dispatch');
  if(route==='damir'){
    expectNoWrite(resumed,'narrative:choose:s25-followup-choice:skip');
    expectNoWrite(resumed,'narrative:choose:s25-followup-choice:'+
      (followup==='shopping'?'waterfront':'shopping'));
    resumed.act('narrative:choose:s25-followup-choice:'+followup);
  }else{
    for(const wrong of ['shopping','waterfront'])
      expectNoWrite(resumed,'narrative:choose:s25-followup-choice:'+wrong);
    resumed.act('narrative:choose:s25-followup-choice:skip');
  }
  walkUntil(resumed,(_b,id)=>id==='s58-intro');
  assert.equal(resumed.get().routeLock,null);
  assert.equal(resumed.get().flags['private-text-pending'],true);
  for(const forbidden of ['damir-interview-job-accepted','damir-relocation-approved',
    'smokehouse-quotes-published','smokehouse-audio-public',
    'nick-producer-teaser-approved','alice-teaser-publish-approved'])
    assert.equal(resumed.get().flags[forbidden],undefined,forbidden);
  return resumed;
}

test('real N1: all 4 evenings, Damir C1×C2, both Eric responses and both free S25 outcomes',()=>{
  const base=eveningCheckpoint();
  for(const route of ['eric','nick','alice'])
    for(const ericChoice of ['read-page','trial-readers']){
      const saved=s25SavedEvening(base,route,ericChoice);
      for(const answer of ['scheduled-talk','wait-with-boundary'])
        completeS25(saved,{route,eric:ericChoice==='read-page'?'page':'readers',choice:answer});
    }
  for(const contact of ['kiss','tea','leave'])
    for(const followup of ['shopping','waterfront'])
      for(const ericChoice of ['read-page','trial-readers']){
        const saved=s25SavedDamir(base,contact,followup,ericChoice);
        for(const answer of ['scheduled-talk','wait-with-boundary'])
          completeS25(saved,{route:'damir',contact,followup,
            eric:ericChoice==='read-page'?'page':'readers',choice:answer});
      }
});

test('N1 rejects forged S25 boundary flags and actionLog after persisted JSON',()=>{
  const saved=s25SavedDamir(eveningCheckpoint(),'tea','shopping','read-page');
  const run=runtime(saved);
  walkUntil(run,b=>b.id==='s25-damir-choice',{
    's25-evening-choice':'damir','s25-contact-choice':'tea',
  });
  run.act('narrative:choose:s25-damir-choice:scheduled-talk');
  const chosen=deepSave(run.get());
  const forged=[
    {...chosen,flags:{...chosen.flags,'damir-choice-wait-with-boundary':true}},
    {...chosen,flags:Object.fromEntries(Object.entries(chosen.flags)
      .filter(([id])=>id!=='damir-choice-scheduled-talk'))},
    {...chosen,actionLog:chosen.actionLog.map(entry=>
      entry.type==='choose'&&entry.beatId==='s25-damir-choice'
        ?{...entry,optionId:'wait-with-boundary'}:entry)},
    {...chosen,actionLog:chosen.actionLog.slice(0,-1)},
  ];
  for(const invalid of forged){
    let writes=0;
    const before=JSON.stringify(invalid);
    assert.throws(()=>createNarrativeRuntimeUpdate({graph:run.graph,
      catalog:defineNarrativeCatalog(catalogData)})({
      deltaMs:16,state:{narrative:invalid},inputs:[{
        schemaVersion:1,type:'pointer',action:'narrative:next:s25-choice-scheduled-01',
        phase:'up',timestamp:199,source:'renderer',
      }],setState(){writes++;},
    }),/inconsistent actionLog provenance or position|unavailable choice/);
    assert.equal(writes,0,'forged save did not write');
    assert.equal(JSON.stringify(invalid),before);
  }
});

test('S25 cannot opt in economy or grant audio/quote publication permission',()=>{
  assert.deepEqual(catalogData.interactions,[]);
  assert.equal(scene('s58-after-m3-end'),undefined);
  assert.equal(scene('s62-after-m3-end').beats[0].type,'ending');
  const source=dialogue('s25-common-b').join('\n');
  assert.match(source,/согласилась на аудио для расшифровки/);
  assert.match(source,/попросив прислать цитаты перед публикацией/);
});
