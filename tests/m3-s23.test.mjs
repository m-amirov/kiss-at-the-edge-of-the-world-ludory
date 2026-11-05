import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Independent pinned EP06/S23 source proof. Count all authorial alternatives,
// not just those selected on one route; metadata and routing markers are omitted.
const sourceProof={
  's23-intro': [11,'b079ab537ed8c87c0c49e569181d10d2581307450179d080e50adeb7b2f37a6a'],
  's23-evening-eric': [3,'a1b7b2fac8f411db0f3ed4606dfa9b8db7640a43432ea441555769b5ee234ce7'],
  's23-evening-nick': [4,'f81f8af5a261e5a1901faa4979a3f3e4ab10342348ffee46a23c77e07536cff4'],
  's23-evening-damir': [4,'109905676ff6cb6dc98185ba14e9829867e0a0f393aea1efcb85657daed34754'],
  's23-evening-alice': [4,'5078bb697f0288857bbb05a2b1ff9f485ae202450e5579fd9d4f8063cb83df23'],
  's23-contact-kiss': [5,'50bc644c667fbed02b256c50658b6786e9fc475ac09090f9fa60ed1049e6a9cf'],
  's23-contact-stay': [2,'2b8e01cb7f290c58ec1847520b05fcb97322edab85579c270bb2d3c32c516581'],
  's23-contact-leave': [3,'8f5558285a5f0a7b89a96d614b96d081afbb07cfb8c094fd53d68d7ee1efc1b4'],
  's23-common-a': [11,'c850c5d2b204045ec327501409b68cf4019bf11b6722dbc226e9726dae7253af'],
  's23-choice-read': [5,'f0f1e0f6f1d56a9074efe9b8e750a51724d984d1efaf02a177c6997762ed07ac'],
  's23-choice-trial': [4,'0f4ce3b1596d9bd37484a8d1e0a1a05b34140d85d1cfb20527425e73cb280963'],
  's23-common-b': [3,'6121710ef7c2ffe929fe1d85ee89a6d2fcada048527718164be8a091cc046e7d'],
  's23-repair-roles': [1,'23d16b2b64ee773eee817f61fc900c3d783ad0cb1335c44a3a18cabf5cf2e6f0'],
  's23-repair-anger': [1,'eae3929bdeaeea4e7cfad9ce9d5176aa21edeb89fe77b2ffa21372ae33aace86'],
  's23-stop-group': [1,'1b63977e8d42db2f6c473cc5175240768d37221d305e550ab1ff903c20ee6526'],
  's23-stop-notes': [1,'50e3f1d4a7618e6ac9ce810d1544b4c2b516be00b66ac5b1b106b8b2d27777c4'],
  's23-followup-postcards': [1,'4827f675aa5c9a90d7b86c99665776b8d93a9115c34f44df418012a635139af1'],
  's23-followup-song': [1,'8c65a3f0f6d032df12f51a4feb0b4f068ce0bc75eb1dc7a503044733bd798ba3'],
};
const scene=id=>graphData.scenes.find(s=>s.id===id);
const shown=id=>(scene(id)?.beats??[]).filter(b=>b.type==='dialogue').map(b=>b.text.ru);
const choice=(sid,bid)=>scene(sid)?.beats.find(b=>b.id===bid);
const eveningFlags={eric:'s17-evening-eric',nick:'s17-evening-nick',
  damir:'s17-evening-damir',alice:'s17-evening-self'};

test('S23 renders all 18 exact manuscript blocks and 65 paragraphs',()=>{
  assert.equal(Object.values(sourceProof).reduce((n,[c])=>n+c,0),65);
  for(const [id,[count,sha]] of Object.entries(sourceProof)){
    const paragraphs=shown(id);
    assert.equal(paragraphs.length,count,id);
    assert.equal(createHash('sha256').update(paragraphs.join('\n\n')).digest('hex'),sha,id);
    assert.ok(paragraphs.every(p=>!p.startsWith('Технический переход')&&
      !p.startsWith('Выбор S23-')&&!p.startsWith('Продолжение S22-')),id);
  }
  assert.doesNotThrow(()=>defineNarrativeGraph(graphData));
});

test('S22 always enters S23; only Eric sees contact/follow-up and S22 callbacks are guarded',()=>{
  assert.equal(scene('s22-after-m3-end'),undefined);
  for(const id of ['group','notes'])assert.equal(scene('s22-stop-'+id).nextSceneId,'s23-intro');
  assert.equal(scene('s23-intro').nextSceneId,'s23-evening-dispatch');
  const evening=choice('s23-evening-dispatch','s23-evening-choice');
  assert.deepEqual(evening.choices.map(c=>[c.id,c.targetSceneId,c.when?.flag,c.effects]),[
    ['eric','s23-evening-eric','s17-evening-eric',undefined],
    ['nick','s23-evening-nick','s17-evening-nick',undefined],
    ['damir','s23-evening-damir','s17-evening-damir',undefined],
    ['alice','s23-evening-alice','s17-evening-self',undefined],
  ]);
  for(const id of Object.keys(eveningFlags))
    assert.equal(scene('s23-evening-'+id).nextSceneId,'s23-contact-dispatch');
  const contact=choice('s23-contact-dispatch','s23-contact-choice');
  assert.deepEqual(contact.choices.slice(0,3).map(c=>[c.id,c.targetSceneId,c.when?.flag,c.effects]),[
    ['k','s23-contact-kiss','eric-contact-kiss',undefined],
    ['s','s23-contact-stay','eric-contact-stay-without-kiss',undefined],
    ['l','s23-contact-leave','eric-contact-leave',undefined],
  ]);
  assert.equal(contact.choices[3].id,'skip');
  assert.equal(contact.choices[3].targetSceneId,'s23-common-a');
  assert.deepEqual(contact.choices[3].when?.any,
    [{flag:'s17-evening-nick'},{flag:'s17-evening-damir'},{flag:'s17-evening-self'}]);
  for(const id of ['kiss','stay','leave'])
    assert.equal(scene('s23-contact-'+id).nextSceneId,'s23-common-a');
  const open=choice('s23-common-a','s23-open-choice');
  assert.deepEqual(open.choices.map(c=>[c.id,c.targetSceneId,c.effects]),[
    ['read-page','s23-choice-read',[{op:'flag_set',id:'eric-open-read-page',value:true}]],
    ['trial-readers','s23-choice-trial',[{op:'flag_set',id:'eric-open-trial-readers',value:true}]],
  ]);
  assert.equal(scene('s23-choice-read').nextSceneId,'s23-common-b');
  assert.equal(scene('s23-choice-trial').nextSceneId,'s23-common-b');
  assert.equal(scene('s23-common-b').nextSceneId,'s23-repair-dispatch');
  const repair=choice('s23-repair-dispatch','s23-repair-choice');
  assert.deepEqual(repair.choices.map(c=>[c.id,c.targetSceneId,c.when?.flag,c.effects]),[
    ['roles','s23-repair-roles','s22-repair-roles',undefined],
    ['anger','s23-repair-anger','s22-repair-anger',undefined],
  ]);
  for(const id of ['roles','anger'])
    assert.equal(scene('s23-repair-'+id).nextSceneId,'s23-stop-dispatch');
  const stop=choice('s23-stop-dispatch','s23-stop-choice');
  assert.deepEqual(stop.choices.map(c=>[c.id,c.targetSceneId,c.when?.flag,c.effects]),[
    ['group','s23-stop-group','s22-stop-group',undefined],
    ['notes','s23-stop-notes','s22-stop-notes',undefined],
  ]);
  for(const id of ['group','notes'])
    assert.equal(scene('s23-stop-'+id).nextSceneId,'s23-followup-dispatch');
  const followup=choice('s23-followup-dispatch','s23-followup-choice');
  assert.deepEqual(followup.choices.slice(0,2).map(c=>[c.id,c.targetSceneId,c.when?.flag,c.effects]),[
    ['postcards','s23-followup-postcards','eric-followup-postcards',undefined],
    ['song','s23-followup-song','eric-followup-song',undefined],
  ]);
  assert.equal(followup.choices[2].id,'skip');
  assert.equal(followup.choices[2].targetSceneId,'s24-intro');
  assert.deepEqual(followup.choices[2].when?.any,
    [{flag:'s17-evening-nick'},{flag:'s17-evening-damir'},{flag:'s17-evening-self'}]);
  for(const id of ['postcards','song'])
    assert.equal(scene('s23-followup-'+id).nextSceneId,'s24-intro');
  assert.equal(scene('s23-after-m3-end'),undefined);
  assert.ok(scene('s24-intro'));
  for(const c of [...evening.choices,...contact.choices,...open.choices,
    ...repair.choices,...stop.choices,...followup.choices])
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
const eveningActions={
  eric:{choice:'eric',actions:{
    's18-contact-choice':'stay-without-kiss','s18-payoff-dispatch-choice':'s',
    's18-followup-choice':'song',
  }},
  nick:{choice:'nick',actions:{
    's19-photo-choice':'no-photo','s19-contact-choice':'hug',
    's19-photo-payoff-choice':'b','s19-contact-payoff-choice':'h',
    's19-followup-choice':'camera-free',
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
const deepSave=value=>JSON.parse(JSON.stringify(value));
function runtime(snapshot){
  const graph=defineNarrativeGraph(graphData),catalog=defineNarrativeCatalog(catalogData);
  const update=createNarrativeRuntimeUpdate({graph,catalog});
  let state={narrative:deepSave(snapshot??createNarrativeState(graph))};
  const act=action=>update({deltaMs:16,state,inputs:[{schemaVersion:1,type:'pointer',
    action,phase:'up',timestamp:181,source:'renderer'}],setState(s){state=s;}});
  return {graph,catalog,act,get:()=>state.narrative};
}
function walkUntil(run,stop,actions={},max=7000){
  for(let i=0;i<max;i++){
    const {sceneId,beatIndex}=run.get();
    const b=scene(sceneId)?.beats[beatIndex];
    assert.ok(b,'missing beat '+sceneId+':'+beatIndex);
    if(stop(b,sceneId))return;
    const before=sceneId+':'+beatIndex;
    if(b.type==='dialogue')run.act('narrative:next:'+b.id);
    else if(b.type==='choice'){
      assert.ok(actions[b.id],'unmapped choice '+b.id+' at '+sceneId);
      run.act('narrative:choose:'+b.id+':'+actions[b.id]);
    }else assert.fail('premature ending '+sceneId);
    assert.notEqual(run.get().sceneId+':'+run.get().beatIndex,before,'stalled '+before);
  }
  assert.fail('narrative walk exceeded '+max+' beats');
}
function reachEvening(weather){
  const run=runtime();
  walkUntil(run,b=>b.id==='s17-evening-choice',{
    ...priorRoute,'s05-weather-choice':weather,
    's06-weather-dispatch':weather==='erik'?'erik':'other',
    's07-weather-dispatch':weather==='nick'?'nick':'other',
    's08-weather-dispatch':weather==='damir'?'damir':'other',
  });
  assert.equal(run.get().flags['weather-choice-'+weather],true);
  return deepSave(run.get());
}
function reachS22(snapshot,route,overrides={}){
  const run=runtime(snapshot);
  const {choice:evening,actions}=eveningActions[route];
  run.act('narrative:choose:s17-evening-choice:'+evening);
  walkUntil(run,(_b,id)=>id==='s22-intro',{...actions,...overrides});
  assert.equal(run.get().flags[eveningFlags[route]],true);
  return deepSave(run.get());
}
function reachS23(saved,{repair='roles',stop='group',weather='damir'}={}){
  const run=runtime(saved);
  walkUntil(run,(_b,id)=>id==='s22-stop-'+stop,{
    's22-weather-choice':weather,'s22-repair-choice':repair,
    's22-stop-choice':stop,
  });
  assert.equal(run.get().flags['s22-repair-'+repair],true);
  assert.equal(run.get().flags['s22-stop-'+stop],true);
  // Real reload from JSON *after* S22-C2 (formerly an untested seam).
  const restored=runtime(deepSave(run.get()));
  walkUntil(restored,(_b,id)=>id==='s23-intro');
  return restored;
}
function expectUnchanged(run,action){
  const before=JSON.stringify(run.get());
  run.act(action);
  assert.equal(JSON.stringify(run.get()),before,'rejected action '+action);
}
function finishS23(run,{route,contact='s',followup='song',repair,stop,open}){
  walkUntil(run,(_b,id)=>id==='s23-evening-dispatch');
  for(const wrong of Object.keys(eveningFlags).filter(k=>k!==route))
    expectUnchanged(run,'narrative:choose:s23-evening-choice:'+wrong);
  run.act('narrative:choose:s23-evening-choice:'+route);
  assert.equal(run.get().sceneId,'s23-evening-'+route);
  walkUntil(run,(_b,id)=>id==='s23-contact-dispatch');
  if(route==='eric'){
    for(const wrong of ['k','s','l','skip'].filter(k=>k!==contact))
      expectUnchanged(run,'narrative:choose:s23-contact-choice:'+wrong);
    run.act('narrative:choose:s23-contact-choice:'+contact);
    assert.equal(run.get().sceneId,{
      k:'s23-contact-kiss',s:'s23-contact-stay',l:'s23-contact-leave',
    }[contact]);
  }else{
    for(const wrong of ['k','s','l'])
      expectUnchanged(run,'narrative:choose:s23-contact-choice:'+wrong);
    run.act('narrative:choose:s23-contact-choice:skip');
  }
  walkUntil(run,b=>b.id==='s23-open-choice');
  expectUnchanged(run,'narrative:choose:s23-open-choice:premium');
  const before=deepSave(run.get());
  run.act('narrative:choose:s23-open-choice:'+open);
  assert.equal(run.get().flags['eric-open-'+(open==='read-page'?'read-page':'trial-readers')],true);
  assert.equal(run.get().flags['eric-open-'+(open==='read-page'?'trial-readers':'read-page')],undefined);
  run.act('narrative:back');
  assert.equal(JSON.stringify(run.get()),JSON.stringify(before),
    'Back reverses S23-C1 choice');
  run.act('narrative:choose:s23-open-choice:'+open);
  // Reload after the new S23-C1 state transition.
  const resumed=runtime(deepSave(run.get()));
  walkUntil(resumed,(_b,id)=>id==='s23-repair-dispatch');
  expectUnchanged(resumed,'narrative:choose:s23-repair-choice:'+(repair==='roles'?'anger':'roles'));
  resumed.act('narrative:choose:s23-repair-choice:'+repair);
  assert.equal(resumed.get().sceneId,'s23-repair-'+repair);
  walkUntil(resumed,(_b,id)=>id==='s23-stop-dispatch');
  expectUnchanged(resumed,'narrative:choose:s23-stop-choice:'+(stop==='group'?'notes':'group'));
  resumed.act('narrative:choose:s23-stop-choice:'+stop);
  assert.equal(resumed.get().sceneId,'s23-stop-'+stop);
  walkUntil(resumed,(_b,id)=>id==='s23-followup-dispatch');
  if(route==='eric'){
    expectUnchanged(resumed,'narrative:choose:s23-followup-choice:skip');
    expectUnchanged(resumed,'narrative:choose:s23-followup-choice:'+(followup==='song'?'postcards':'song'));
    resumed.act('narrative:choose:s23-followup-choice:'+followup);
    assert.equal(resumed.get().sceneId,'s23-followup-'+followup);
  }else{
    for(const wrong of ['postcards','song'])
      expectUnchanged(resumed,'narrative:choose:s23-followup-choice:'+wrong);
    resumed.act('narrative:choose:s23-followup-choice:skip');
  }
  walkUntil(resumed,(_b,id)=>id==='s24-intro');
  assert.equal(resumed.get().routeLock,null);
  assert.equal(resumed.get().flags['private-text-pending'],true);
  assert.equal(resumed.get().flags['nick-joint-file-approved'],undefined);
  assert.equal(resumed.get().flags['editor-publish-approved'],undefined);
  return resumed;
}

test('real N1: 4 S17 evenings × S22-C1/C2 × S23-C1 through S23 ending',()=>{
  const sources={
    eric:reachS22(reachEvening('erik'),'eric'),
    nick:reachS22(reachEvening('nick'),'nick'),
    damir:reachS22(reachEvening('damir'),'damir'),
    alice:reachS22(reachEvening('damir'),'alice'),
  };
  for(const [route,saved] of Object.entries(sources))
    for(const repair of ['roles','anger'])
      for(const stop of ['group','notes'])
        for(const open of ['read-page','trial-readers']){
          const weather={eric:'erik',nick:'nick',damir:'damir',alice:'damir'}[route];
          const run=reachS23(saved,{repair,stop,weather});
          finishS23(run,{route,repair,stop,open,contact:'s',followup:'song'});
        }
});

test('real N1: all Eric S18-C1 × S18-C2 callbacks remain independent',()=>{
  const evening=reachEvening('damir');
  for(const [original,dispatch] of [['kiss','k'],['stay-without-kiss','s'],['leave','l']]){
    for(const followup of ['postcards','song']){
      const saved=reachS22(evening,'eric',{
        's18-contact-choice':original,
        's18-payoff-dispatch-choice':dispatch,
        's18-followup-choice':followup,
      });
      const run=reachS23(saved,{repair:'roles',stop:'group'});
      finishS23(run,{route:'eric',contact:dispatch,followup,
        repair:'roles',stop:'group',open:'read-page'});
    }
  }
});

test('N1 rejects forged S23-C1 flags and actionLog after persisted S22-C2',()=>{
  const saved=reachS22(reachEvening('damir'),'alice');
  const run=reachS23(saved,{repair:'roles',stop:'notes'});
  walkUntil(run,b=>b.id==='s23-open-choice',{
    's23-evening-choice':'alice','s23-contact-choice':'skip',
  });
  run.act('narrative:choose:s23-open-choice:read-page');
  const chosen=deepSave(run.get());
  const forged=[
    {...chosen,flags:{...chosen.flags,'eric-open-trial-readers':true}},
    {...chosen,flags:Object.fromEntries(Object.entries(chosen.flags)
      .filter(([id])=>id!=='eric-open-read-page'))},
    {...chosen,actionLog:chosen.actionLog.map(entry=>
      entry.type==='choose'&&entry.beatId==='s23-open-choice'
        ?{...entry,optionId:'trial-readers'}:entry)},
    {...chosen,actionLog:chosen.actionLog.slice(0,-1)},
  ];
  for(const invalid of forged){
    const before=JSON.stringify(invalid);
    let writes=0;
    assert.throws(()=>createNarrativeRuntimeUpdate({graph:run.graph,catalog:run.catalog})({
      deltaMs:16,state:{narrative:invalid},inputs:[{schemaVersion:1,type:'pointer',
        action:'narrative:next:'+scene('s23-choice-read').beats[0].id,
        phase:'up',timestamp:185,source:'renderer'}],setState(){writes++;},
    }),/inconsistent actionLog provenance or position|unavailable choice/);
    assert.equal(writes,0);
    assert.equal(JSON.stringify(invalid),before);
  }
  assert.equal(run.get().flags['eric-open-read-page'],true);
});

test('S23 is free, adds no economy/premium and grants no media consent',()=>{
  assert.equal(existsSync(new URL('../game/config/economy.json',import.meta.url)),false);
  assert.equal(existsSync(new URL('../game/config/premium.json',import.meta.url)),false);
  assert.deepEqual(catalogData.interactions,[]);
  assert.equal(scene('s23-after-m3-end'),undefined);
});
