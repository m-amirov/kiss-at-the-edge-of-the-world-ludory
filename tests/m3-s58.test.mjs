import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Independently hashed from pinned S58 original before production implementation.
const sourceProof={
  's58-intro': [7, '48159bcf6df8c8bc3b578c4d26e8dc10cdc7d5218eead1dfc7e64542b464de3a'],
  's58-choice-eric': [7, 'de7ce8a664277a65e023d22ee0fee445ece7df5550e8672f0acc3b1e165aa398'],
  's58-choice-nick': [7, 'f3dfc5585a519d4309b8b5f3eb1c9c780abd84c991202ad3d28634cde5ea805a'],
  's58-choice-damir': [8, '4c30da5ca9789208258def18fcf96b8433cc496013318b8b8d310b5b07c8665b'],
  's58-choice-alone': [2, '1db37c57751b11a8625af75a69377e0f11aab765c8644ad73f4c1f7e71fe7995'],
  's58-common-a': [2, 'c82cd6e0219c45023cea33a2ce967d91580ac4f4a9725419301a6fe79ae3f88c'],
  's58-payoff-damir': [1, '5de1c77d2048b27e43e73e97ac4f564240b48fc8e5f83678c2d8a7b55591df95'],
  's58-payoff-other': [1, 'c3f48cb43ee5f1377675a2a4f4005b6098eb3e6fbf8c575b963df71c0a0b3f6a'],
  's58-common-b': [12, '64179b45185cac1a1429397c3243dc2c85d3f988c87695253db2e57dbbeadf8f'],
};
const scene=id=>graphData.scenes.find(s=>s.id===id);
const dialogue=id=>(scene(id)?.beats??[]).filter(b=>b.type==='dialogue').map(b=>b.text.ru);
const choice=(id,beatId)=>scene(id)?.beats.find(b=>b.id===beatId);

test('S58 renders all 9 exact authorial blocks and 47 unique paragraphs',()=>{
  assert.equal(Object.values(sourceProof).reduce((n,[count])=>n+count,0),47);
  for(const [id,[count,sha]] of Object.entries(sourceProof)){
    const paragraphs=dialogue(id);
    assert.equal(paragraphs.length,count,id);
    assert.equal(createHash('sha256').update(paragraphs.join('\n\n')).digest('hex'),sha,id);
    assert.ok(paragraphs.every(p=>!p.startsWith('Технический переход')&&
      !p.startsWith('Выбор S58-')),id);
  }
  assert.match(dialogue('s58-choice-nick').join(' '),/не попросил фотографию/);
  assert.match(dialogue('s58-common-b').join(' '),/вправе поправить меня/);
  assert.doesNotThrow(()=>defineNarrativeGraph(graphData));
});

test('all S25 outcomes enter S58; four free shop choices, exclusive potato callback',()=>{
  assert.equal(scene('s25-after-m3-end'),undefined);
  assert.equal(scene('s25-followup-dispatch').beats[0].choices[2].targetSceneId,'s58-intro');
  for(const id of ['shopping','waterfront'])
    assert.equal(scene('s25-followup-'+id).nextSceneId,'s58-intro');
  assert.equal(scene('s58-intro').beats.at(-1).id,'s58-shop-choice');
  const shop=choice('s58-intro','s58-shop-choice');
  assert.deepEqual(shop.choices.map(c=>[c.id,c.targetSceneId,c.effects]),[
    ['eric','s58-choice-eric',[{op:'flag_set',id:'s58-shop-eric',value:true}]],
    ['nick','s58-choice-nick',[{op:'flag_set',id:'s58-shop-nick',value:true}]],
    ['damir','s58-choice-damir',[{op:'flag_set',id:'s58-shop-damir',value:true}]],
    ['alone','s58-choice-alone',[{op:'flag_set',id:'s58-shop-alone',value:true}]],
  ]);
  assert.ok(shop.choices.every(c=>c.when===undefined));
  for(const id of ['eric','nick','damir','alone'])
    assert.equal(scene('s58-choice-'+id).nextSceneId,'s58-common-a');
  assert.equal(scene('s58-common-a').nextSceneId,'s58-payoff-dispatch');
  const payoff=choice('s58-payoff-dispatch','s58-payoff-choice');
  assert.deepEqual(payoff.choices.map(c=>[c.id,c.targetSceneId,c.when,c.effects]),[
    ['damir','s58-payoff-damir',{flag:'s58-shop-damir'},undefined],
    ['other','s58-payoff-other',{any:[
      {flag:'s58-shop-eric'},{flag:'s58-shop-nick'},{flag:'s58-shop-alone'},
    ]},undefined],
  ]);
  for(const id of ['damir','other'])
    assert.equal(scene('s58-payoff-'+id).nextSceneId,'s58-common-b');
  assert.equal(scene('s58-common-b').nextSceneId,'s26-intro');
  assert.equal(scene('s58-after-m3-end'),undefined);
  assert.equal(scene('s26-intro').beats.at(-1).id,'s26-route-choice');
  for(const c of [...shop.choices,...payoff.choices])
    for(const forbidden of ['cost','premium','routeLock','routeIntent',
      'romancePoints','requiredEntitlement','publishPermission','consentToPublish'])
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

const evenings={eric:'s17-evening-eric',nick:'s17-evening-nick',
  damir:'s17-evening-damir',alice:'s17-evening-self'};

function s58Checkpoints(){
  const base=eveningCheckpoint();
  const result={};
  for(const route of ['eric','nick','damir','alice']){
    const saved=route==='damir'
      ?s25SavedDamir(base,'tea','waterfront','read-page')
      :s25SavedEvening(base,route,'read-page');
    const run=runtime(saved);
    walkUntil(run,(_b,id)=>id==='s58-intro',{
      's25-evening-choice':route,
      's25-contact-choice':route==='damir'?'tea':'skip',
      's25-damir-choice':'scheduled-talk',
      's25-eric-choice':'page',
      's25-followup-choice':route==='damir'?'waterfront':'skip',
    });
    assert.equal(run.get().flags[evenings[route]],true);
    result[route]=deepSave(run.get());
  }
  return result;
}

function finishS58(saved,shop){
  const run=runtime(saved);
  walkUntil(run,b=>b.id==='s58-shop-choice');
  for(const id of ['eric','nick','damir','alone']){
    assert.equal(run.get().flags['s58-shop-'+id],undefined);
  }
  const before=JSON.stringify(run.get());
  expectNoWrite(run,'narrative:choose:s58-shop-choice:premium');
  run.act('narrative:choose:s58-shop-choice:'+shop);
  assert.equal(run.get().flags['s58-shop-'+shop],true);
  run.act('narrative:back');
  assert.equal(JSON.stringify(run.get()),before,'S58 Back reverses choice');
  run.act('narrative:choose:s58-shop-choice:'+shop);
  const resumed=runtime(deepSave(run.get()));
  walkUntil(resumed,(_b,id)=>id==='s58-payoff-dispatch');
  const payoff=shop==='damir'?'damir':'other';
  expectNoWrite(resumed,'narrative:choose:s58-payoff-choice:'+
    (payoff==='damir'?'other':'damir'));
  resumed.act('narrative:choose:s58-payoff-choice:'+payoff);
  assert.equal(resumed.get().sceneId,'s58-payoff-'+payoff);
  walkUntil(resumed,(_b,id)=>id==='s26-intro');
  assert.equal(resumed.get().routeLock,null);
  assert.equal(resumed.get().flags['private-text-pending'],true);
  assert.equal(resumed.get().flags['s58-shop-'+shop],true);
  for(const other of ['eric','nick','damir','alone'].filter(x=>x!==shop))
    assert.equal(resumed.get().flags['s58-shop-'+other],undefined);
  for(const forbidden of ['route-intent-eric','route-intent-nick',
    'route-intent-damir','route-intent-alice','nick-producer-teaser-approved',
    'smokehouse-quotes-published'])
    assert.equal(resumed.get().flags[forbidden],undefined);
}

test('real N1: each of 4 evening routes can make any of 4 free S58 choices',()=>{
  const checkpoints=s58Checkpoints();
  for(const route of ['eric','nick','damir','alice'])
    for(const shop of ['eric','nick','damir','alone'])
      finishS58(checkpoints[route],shop);
});

test('N1 rejects forged S58 shopping flags and replay provenance without writes',()=>{
  const saved=s58Checkpoints().damir;
  const run=runtime(saved);
  walkUntil(run,b=>b.id==='s58-shop-choice');
  run.act('narrative:choose:s58-shop-choice:damir');
  const chosen=deepSave(run.get());
  const forged=[
    {...chosen,flags:{...chosen.flags,'s58-shop-nick':true}},
    {...chosen,flags:{...chosen.flags,'s58-shop-eric':true}},
    {...chosen,flags:Object.fromEntries(Object.entries(chosen.flags)
      .filter(([id])=>id!=='s58-shop-damir'))},
    {...chosen,actionLog:chosen.actionLog.map(entry=>
      entry.type==='choose'&&entry.beatId==='s58-shop-choice'
        ?{...entry,optionId:'nick'}:entry)},
    {...chosen,actionLog:chosen.actionLog.slice(0,-1)},
  ];
  for(const invalid of forged){
    const before=JSON.stringify(invalid);
    let writes=0;
    assert.throws(()=>createNarrativeRuntimeUpdate({
      graph:run.graph,catalog:defineNarrativeCatalog(catalogData),
    })({deltaMs:16,state:{narrative:invalid},inputs:[{
      schemaVersion:1,type:'pointer',action:'narrative:next:s58-choice-damir-01',
      phase:'up',timestamp:200,source:'renderer',
    }],setState(){writes++;}}),/inconsistent actionLog provenance or position|unavailable choice/);
    assert.equal(writes,0);
    assert.equal(JSON.stringify(invalid),before);
  }
});

test('S58 remains group dinner, not a monetization or S26 route lock',()=>{
  assert.deepEqual(catalogData.interactions,[]);
  assert.equal(scene('s58-after-m3-end'),undefined);
  assert.equal(scene('s62-callback-a').nextSceneId,'s35-intro');
  const text=dialogue('s58-common-b').join('\n');
  assert.match(text,/не как три возможных ответа на один вопрос/);
});
