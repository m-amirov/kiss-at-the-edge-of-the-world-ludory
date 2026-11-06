import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Independently derived from pinned original EP06 lines 759–947 before implementation.
// Each SHA-256 hashes only displayed paragraphs, separated by two LF characters.
const sourceProof={
  's26-intro':[3,'33d6c4045543d0b4c07fb788aebc33dbcdc8127a3fe26fc74bfea3482b8bd296'],
  's26-choice-eric':[6,'9390d5030e110f9c56fb89188382a7031175efdc9157e7edde565de554de27e9'],
  's26-callback-eric-nick':[5,'65ff114ec3bea788393811ce5727db6e48b054e471664d86a9a89dba78c78d5c'],
  's26-callback-eric-damir':[3,'6dddf0c6f7a3e0a08a5bb10f2b612ba2f156d0a4e0fa7e068768ce1d19daf97a'],
  's26-callback-eric-eric':[1,'035abeedba68d2031c8d748e622dbcc306ad3b9d3f0978c905e2e77412074f7b'],
  's26-callback-eric-self':[1,'dea08d300f6539f712cad3d166cee8df11d3cb9c4c5e69b5ae91b5ba728834d3'],
  's26-common-eric':[1,'366d34931f9508c455f9e5a60d61e039feb0cedb664707849ffca567af59275f'],
  's26-choice-nick':[6,'f08f065b90632b9fa60a62cbed6e24224fb56dbd465bb108bd84cd00d1a9b21e'],
  's26-callback-nick-eric':[4,'8287d960b11b349c2c70293c1191a7e74d691a23829d52b8e0a6f0af201c6a9a'],
  's26-callback-nick-damir':[3,'09bbda192df1d0b52e7df6e13d9023a97d634802cae762be09c26840fa5fd9ff'],
  's26-callback-nick-nick':[1,'67648d0cb5c5becf6eabf3998a3ec25bbf28363ddc7886eaaabf9787e12c6ba9'],
  's26-callback-nick-self':[1,'04f4bbe604e363f28133a0661b3c540fe05effa35a055626733c5c9b392ef707'],
  's26-common-nick':[1,'268c6bf2e7c19843fba17281f0973ce41aed5fde131572d376ba4c5bd4b5ada5'],
  's26-choice-damir':[5,'b8e3f6c52c11eb1c876a8a9267d0a374cd76392961fe4f6c41eff7aac6ffeff4'],
  's26-callback-damir-eric':[4,'39452a9a17394a545c8f5d97e78e3e88096bf221e8e95bf258950fad5e4fcec1'],
  's26-callback-damir-nick':[4,'afa8af860422c3fe66c1f3cda0886dfdc1bbdc63940ce20e042bd8781cc35740'],
  's26-callback-damir-damir':[1,'af900a7869c2337fd63a5a7d5530ae539e66f860a15d3bd55b8e205f00d0ebbb'],
  's26-callback-damir-self':[1,'aa50e674f5a230f07f9d7ffe915a6773e6b77f2d3c011469b5fff51897b22bd0'],
  's26-common-damir':[1,'61f91ee061a2934c7fb426edc4d4827e522a968e0ae8c3c79d211488a6494384'],
  's26-choice-alice':[3,'d6a91ff64e01420f2e7c3b44e6b626d3bc157149cb9107b78e9bd10d2d820d24'],
  's26-callback-alice-eric':[3,'172e3fe1d4bc24a21418438add530f64d0f472342c99710d55f185884e475322'],
  's26-callback-alice-nick':[3,'7f44a0893ea194177289b26f270f81bbc640b5dda38e80507dd709e63f5a28bc'],
  's26-callback-alice-damir':[1,'b81bbe668f5bf3a1c895a8d2da5bf04e399b36c781a0cfd6f308e6c7b0945f20'],
  's26-callback-alice-self':[1,'fcd31a13281818869a3f6e833ffbe28b4f79df17c7c4d046e5d1624a949794b0'],
  's26-common-alice':[3,'fed4e0f9886084ae6a406e31d083fbd8ca6a12b08fb94bcdeb37cde2bd2df200'],
};
const routes=['eric','nick','damir','alice'];
const oldEvenings={eric:'s17-evening-eric',nick:'s17-evening-nick',
  damir:'s17-evening-damir',self:'s17-evening-self'};
const scene=id=>graphData.scenes.find(s=>s.id===id);
const dialogue=id=>(scene(id)?.beats??[]).filter(b=>b.type==='dialogue').map(b=>b.text.ru);
const choice=(id,beatId)=>scene(id)?.beats.find(b=>b.id===beatId);

test('S26 displays all 25 exact original blocks / 66 unique authorial paragraphs',()=>{
  assert.equal(Object.values(sourceProof).reduce((n,[count])=>n+count,0),66);
  assert.equal(Object.keys(sourceProof).length,25);
  for(const [id,[count,sha]] of Object.entries(sourceProof)){
    const paragraphs=dialogue(id);
    assert.equal(paragraphs.length,count,id);
    assert.equal(createHash('sha256').update(paragraphs.join('\n\n')).digest('hex'),sha,id);
    assert.ok(paragraphs.every(p=>!p.startsWith('Технический переход')&&
      !p.startsWith('Выбор S26-')),id);
  }
  assert.match(dialogue('s26-common-damir').join(' '),/Пока нет/);
  assert.match(dialogue('s26-common-nick').join(' '),/Вот этого я не стану снимать/);
  assert.match(dialogue('s26-common-alice').join(' '),/право не участвовать в статье/);
  assert.doesNotThrow(()=>defineNarrativeGraph(graphData));
});

test('S58 always enters free four-way S26 route lock, with 16 guarded evening callbacks',()=>{
  assert.equal(scene('s58-after-m3-end'),undefined);
  assert.equal(scene('s58-common-b').nextSceneId,'s26-intro');
  const c=choice('s26-intro','s26-route-choice');
  assert.deepEqual(c.choices.map(x=>[x.id,x.targetSceneId,x.effects,x.when]),routes.map(id=>[
    id,'s26-choice-'+id,[{op:'route_intent',id},{op:'route_lock',id}],undefined,
  ]));
  for(const route of routes){
    assert.equal(scene('s26-choice-'+route).nextSceneId,'s26-'+route+'-evening-dispatch');
    const dispatch=choice('s26-'+route+'-evening-dispatch','s26-'+route+'-evening-choice');
    assert.deepEqual(dispatch.choices.map(x=>[x.id,x.targetSceneId,x.when,x.effects]),
      Object.entries(oldEvenings).map(([prior,flag])=>[
        prior,'s26-callback-'+route+'-'+prior,{flag},undefined,
      ]));
    for(const prior of Object.keys(oldEvenings))
      assert.equal(scene('s26-callback-'+route+'-'+prior).nextSceneId,'s26-common-'+route);
    assert.equal(scene('s26-common-'+route).nextSceneId,'s27-intro');
  }
  assert.equal(scene('s26-after-m3-end'),undefined);
  assert.equal(scene('s62-after-m3-end').beats[0].endingId,'m3-alice-s62-only');
  for(const c of [choice('s26-intro','s26-route-choice'),
    ...routes.map(r=>choice('s26-'+r+'-evening-dispatch','s26-'+r+'-evening-choice'))])
    for(const option of c.choices)
      for(const forbidden of ['cost','premium','romancePoints','requiredEntitlement',
        'publishPermission','consentToPublish','mediaPermission'])
        assert.equal(option[forbidden],undefined,forbidden);
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

function s26Checkpoints(){
  const earlierRuns=s58Checkpoints(),result={};
  for(const prior of ['eric','nick','damir','alice']){
    result[prior]={};
    for(const shop of ['eric','nick','damir','alone']){
      const run=runtime(earlierRuns[prior]);
      walkUntil(run,b=>b.id==='s58-shop-choice');
      run.act('narrative:choose:s58-shop-choice:'+shop);
      walkUntil(run,b=>b.id==='s58-payoff-choice');
      run.act('narrative:choose:s58-payoff-choice:'+
        (shop==='damir'?'damir':'other'));
      walkUntil(run,(_b,id)=>id==='s26-intro');
      assert.equal(run.get().routeIntent,null);
      assert.equal(run.get().routeLock,null);
      assert.equal(run.get().flags['s58-shop-'+shop],true);
      assert.equal(run.get().flags[evenings[prior]],true);
      result[prior][shop]=deepSave(run.get());
    }
  }
  return result;
}

function finishS26(saved,prior,shop,target){
  const run=runtime(saved);
  walkUntil(run,b=>b.id==='s26-route-choice');
  const before=JSON.stringify(run.get());
  expectNoWrite(run,'narrative:choose:s26-route-choice:premium');
  run.act('narrative:choose:s26-route-choice:'+target);
  assert.equal(run.get().routeIntent,target);
  assert.equal(run.get().routeLock,target);
  run.act('narrative:back');
  assert.equal(JSON.stringify(run.get()),before,'Back restores undecided intent and lock');
  run.act('narrative:choose:s26-route-choice:'+target);
  const resumed=runtime(deepSave(run.get()));
  walkUntil(resumed,b=>b.id==='s26-'+target+'-evening-choice');
  const callback=prior==='alice'?'self':prior;
  for(const wrong of Object.keys(oldEvenings).filter(x=>x!==callback))
    expectNoWrite(resumed,'narrative:choose:s26-'+target+'-evening-choice:'+wrong);
  resumed.act('narrative:choose:s26-'+target+'-evening-choice:'+callback);
  assert.equal(resumed.get().sceneId,'s26-callback-'+target+'-'+callback);
  walkUntil(resumed,(_b,id)=>id==='s27-intro');
  assert.equal(resumed.get().routeIntent,target);
  assert.equal(resumed.get().routeLock,target);
  assert.equal(resumed.get().flags[evenings[prior]],true);
  assert.equal(resumed.get().flags['s58-shop-'+shop],true);
  assert.equal(resumed.get().flags['private-text-pending'],true);
  for(const forbidden of ['nick-producer-teaser-approved',
    'smokehouse-quotes-published','s26-media-published',
    'damir-relocation-approved'])
    assert.equal(resumed.get().flags[forbidden],undefined);
}

test('real N1: all four S17 evenings × four S58 shops × four independent S26 routes',()=>{
  const checkpoints=s26Checkpoints();
  for(const prior of ['eric','nick','damir','alice'])
    for(const shop of ['eric','nick','damir','alone'])
      for(const target of routes)
        finishS26(checkpoints[prior][shop],prior,shop,target);
});

test('N1 rejects forged S26 intent/lock, evening flags and actionLog without state writes',()=>{
  const run=runtime(s26Checkpoints().damir.alone);
  walkUntil(run,b=>b.id==='s26-route-choice');
  run.act('narrative:choose:s26-route-choice:eric');
  const selected=deepSave(run.get());
  const forged=[
    {...selected,routeIntent:'nick'},
    {...selected,routeLock:'damir'},
    {...selected,routeIntent:null},
    {...selected,routeLock:null},
    {...selected,flags:{...selected.flags,'s17-evening-nick':true}},
    {...selected,actionLog:selected.actionLog.map(entry=>
      entry.type==='choose'&&entry.beatId==='s26-route-choice'
        ?{...entry,optionId:'nick'}:entry)},
    {...selected,actionLog:selected.actionLog.slice(0,-1)},
  ];
  for(const invalid of forged){
    const before=JSON.stringify(invalid);
    let writes=0;
    assert.throws(()=>createNarrativeRuntimeUpdate({
      graph:run.graph,catalog:defineNarrativeCatalog(catalogData),
    })({deltaMs:16,state:{narrative:invalid},inputs:[{
      schemaVersion:1,type:'pointer',action:'narrative:next:s26-choice-eric-01',
      phase:'up',timestamp:200,source:'renderer',
    }],setState(){writes++;}}),/inconsistent actionLog provenance or position|unavailable choice/);
    assert.equal(writes,0);
    assert.equal(JSON.stringify(invalid),before);
  }
});

test('S26 keeps autonomy, consent boundaries and first-game monetization disabled',()=>{
  assert.deepEqual(catalogData.interactions,[]);
  assert.equal(scene('s62-after-m3-end').beats[0].type,'ending');
  assert.match(dialogue('s26-choice-eric').join(' '),/Без обещания переехать/);
  assert.match(dialogue('s26-common-eric').join(' '),/Сейчас можно/);
  assert.match(dialogue('s26-common-damir').join(' '),/Пока нет/);
  assert.match(dialogue('s26-common-nick').join(' '),/не стану снимать/);
  assert.match(dialogue('s26-choice-alice').join(' '),/Романтических отношений сейчас не выбираю/);
});
