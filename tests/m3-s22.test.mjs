import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Independent source SHA-256 from pinned EP06/S22, joined by original blank lines.
// Markdown headings, technical metadata and authorial choice headings are not dialogue.
const sourceProof = {
  's22-intro': [12,'ef8ea8f4bd8e3a9b8ada9cad206175d7f38e4056949fdb35b69349a52082dc44'],
  's22-weather-nick': [5,'456aff15fdb535bd9d84de36195a1b28193447e660cfd95dd7a60032117cf405'],
  's22-weather-erik': [5,'a42354e30f6ebb41e11f6b45b9e6670bc15ee3302e79171aaf1216277fcfac02'],
  's22-weather-damir': [4,'9826b7e310b3d6f5ad1fa8f1966779b22988e8dc49782b2b63a67e39ff808a97'],
  's22-common-a': [21,'5afe233b322eeb6002b246d46c9182872cedd6f7f707bf9a34f1de7789cb257c'],
  's22-repair-roles': [3,'6c56752741db15872137edef11df041b2dec13296f7e0175dc1d4eb459b0bcb4'],
  's22-repair-anger': [4,'b2939bb12e0dddd2bb60ea893ccfd73a9f9617d015548d09b25642035226ca89'],
  's22-common-b': [4,'b4ccc4dafdfca99b089679abed340a6ebbc2757c719c8f98667dc0193c730629'],
  's22-stop-group': [1,'8c6e735c862ed4113e54c3b34adf2b57edff08553b8c78c1d79714a643d9f914'],
  's22-stop-notes': [1,'116373e081a68be9650de18af3efe1fe2f87993e79a4350235e5fb1cc9a76fab'],
};
const scene=id=>graphData.scenes.find(s=>s.id===id);
const shown=id=>(scene(id)?.beats??[]).filter(b=>b.type==='dialogue').map(b=>b.text.ru);
const choice=(sid,bid)=>scene(sid)?.beats.find(b=>b.id===bid);
const entryRoutes=['s18','s19','s20','s61'];

test('S22 renders all ten pinned authorial blocks and exactly 60 paragraphs',()=>{
  assert.equal(Object.values(sourceProof).reduce((sum,[count])=>sum+count,0),60);
  for(const [id,[count,sha]] of Object.entries(sourceProof)){
    const paragraphs=shown(id);
    assert.equal(paragraphs.length,count,id);
    assert.equal(createHash('sha256').update(paragraphs.join('\n\n')).digest('hex'),sha,id);
    assert.ok(paragraphs.every(p=>!p.startsWith('Выбор S22-')&&
      !p.startsWith('Технический переход')&&!p.startsWith('Если `S22-C2')),id);
  }
  assert.doesNotThrow(()=>defineNarrativeGraph(graphData));
});

test('every S17 evening route enters S22; guarded weather and two free choices converge',()=>{
  for(const id of entryRoutes){
    assert.equal(scene(id+'-after-m3-end'),undefined,'removed technical ending '+id);
  }
  for(const id of ['postcards','song'])
    assert.equal(scene('s18-'+id).nextSceneId,'s22-intro');
  for(const id of ['camera-free','breakfast'])
    assert.equal(scene('s19-'+id).nextSceneId,'s22-intro');
  for(const id of ['breakfast','waterfront'])
    assert.equal(scene('s20-'+id).nextSceneId,'s22-intro');
  for(const id of ['friend','bookstore'])
    assert.equal(scene('s61-'+id).nextSceneId,'s22-intro');
  assert.equal(scene('s22-intro').nextSceneId,'s22-weather-dispatch');
  const weather=choice('s22-weather-dispatch','s22-weather-choice');
  assert.deepEqual(weather.choices.map(c=>[c.id,c.targetSceneId,c.when?.flag,c.effects]),[
    ['nick','s22-weather-nick','weather-choice-nick',undefined],
    ['erik','s22-weather-erik','weather-choice-erik',undefined],
    ['damir','s22-weather-damir','weather-choice-damir',undefined],
  ]);
  for(const w of ['nick','erik','damir'])
    assert.equal(scene('s22-weather-'+w).nextSceneId,'s22-common-a');
  const c1=choice('s22-common-a','s22-repair-choice');
  assert.deepEqual(c1.choices.map(c=>[c.id,c.targetSceneId,c.effects]),[
    ['roles','s22-repair-roles',[{op:'flag_set',id:'s22-repair-roles',value:true}]],
    ['anger','s22-repair-anger',[{op:'flag_set',id:'s22-repair-anger',value:true}]],
  ]);
  for(const id of ['roles','anger'])
    assert.equal(scene('s22-repair-'+id).nextSceneId,'s22-common-b');
  const c2=choice('s22-common-b','s22-stop-choice');
  assert.deepEqual(c2.choices.map(c=>[c.id,c.targetSceneId,c.effects]),[
    ['group','s22-stop-group',[{op:'flag_set',id:'s22-stop-group',value:true}]],
    ['notes','s22-stop-notes',[{op:'flag_set',id:'s22-stop-notes',value:true}]],
  ]);
  for(const id of ['group','notes'])
    assert.equal(scene('s22-stop-'+id).nextSceneId,'s23-intro');
  assert.equal(scene('s22-after-m3-end'),undefined);
  for(const c of [...weather.choices,...c1.choices,...c2.choices])
    for(const key of ['cost','premium','routeIntent','routeLock','romancePoints',
      'publishPermission','mediaPermission','requiredEntitlement','repairDebt'])
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
const endings={
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
function runtime(snapshot){
  const graph=defineNarrativeGraph(graphData),catalog=defineNarrativeCatalog(catalogData);
  const update=createNarrativeRuntimeUpdate({graph,catalog});
  let state={narrative:JSON.parse(JSON.stringify(snapshot??createNarrativeState(graph)))};
  const act=action=>update({deltaMs:16,state,inputs:[{schemaVersion:1,type:'pointer',
    action,phase:'up',timestamp:181,source:'renderer'}],setState(s){state=s;}});
  const advance=id=>{
    assert.equal(state.narrative.sceneId,id);
    for(const b of scene(id).beats.filter(x=>x.type==='dialogue'))
      act('narrative:next:'+b.id);
  };
  return {graph,catalog,act,advance,get:()=>state.narrative};
}
function walkUntil(run,stop,options,max=6000){
  for(let i=0;i<max;i++){
    const {sceneId,beatIndex}=run.get();
    const b=scene(sceneId)?.beats[beatIndex];
    assert.ok(b,'missing beat '+sceneId+':'+beatIndex);
    if(stop(b,sceneId))return;
    const before=sceneId+':'+beatIndex;
    if(b.type==='dialogue')run.act('narrative:next:'+b.id);
    else if(b.type==='choice'){
      assert.ok(options[b.id],'unmapped choice '+b.id+' at '+sceneId);
      run.act('narrative:choose:'+b.id+':'+options[b.id]);
    }else assert.fail('premature ending '+sceneId);
    assert.notEqual(run.get().sceneId+':'+run.get().beatIndex,before,'stalled '+before);
  }
  assert.fail('narrative walk exceeded '+max+' beats');
}
function reachEvening(weather){
  const run=runtime();
  const actions={...priorRoute,'s05-weather-choice':weather,
    's06-weather-dispatch':weather==='erik'?'erik':'other',
    's07-weather-dispatch':weather==='nick'?'nick':'other',
    's08-weather-dispatch':weather==='damir'?'damir':'other'};
  walkUntil(run,b=>b.id==='s17-evening-choice',actions);
  assert.equal(run.get().flags['weather-choice-'+weather],true);
  return run.get();
}
function reachS22(eveningSnapshot,route){
  const run=runtime(eveningSnapshot);
  run.act('narrative:choose:s17-evening-choice:'+endings[route].choice);
  walkUntil(run,(_b,id)=>id==='s22-intro',endings[route].actions);
  assert.equal(run.get().sceneId,'s22-intro');
  return run;
}

test('real N1: all 3 S05 callbacks × 4 evenings × 2 repair × 2 stop choices',()=>{
  for(const weather of ['nick','erik','damir']){
    const eveningCheckpoint=reachEvening(weather);
    for(const route of Object.keys(endings)){
      const merged=reachS22(eveningCheckpoint,route);
      assert.equal(merged.get().flags['s17-evening-'+(route==='alice'?'self':route)],true);
      assert.equal(merged.get().flags['private-text-pending'],true);
      assert.equal(merged.get().routeLock,null);
      merged.advance('s22-intro');
      assert.equal(merged.get().sceneId,'s22-weather-dispatch');
      for(const wrong of ['nick','erik','damir'].filter(w=>w!==weather)){
        const before=JSON.stringify(merged.get());
        merged.act('narrative:choose:s22-weather-choice:'+wrong);
        assert.equal(JSON.stringify(merged.get()),before);
      }
      merged.act('narrative:choose:s22-weather-choice:'+weather);
      assert.equal(merged.get().sceneId,'s22-weather-'+weather);
      assert.equal(merged.get().flags['s22-repair-roles'],undefined);
      merged.advance('s22-weather-'+weather);
      merged.advance('s22-common-a');
      const c1Checkpoint=JSON.parse(JSON.stringify(merged.get()));
      assert.equal(c1Checkpoint.sceneId,'s22-common-a');
      for(const repair of ['roles','anger']){
        for(const stop of ['group','notes']){
          const run=runtime(c1Checkpoint);
          const c1Before=JSON.stringify(run.get());
          run.act('narrative:choose:s22-repair-choice:illegal');
          assert.equal(JSON.stringify(run.get()),c1Before);
          run.act('narrative:choose:s22-repair-choice:'+repair);
          assert.equal(run.get().flags['s22-repair-'+repair],true);
          assert.equal(run.get().flags['s22-repair-'+(repair==='roles'?'anger':'roles')],undefined);
          run.act('narrative:back');
          assert.equal(JSON.stringify(run.get()),c1Before);
          run.act('narrative:choose:s22-repair-choice:'+repair);
          const restored=runtime(JSON.parse(JSON.stringify(run.get())));
          restored.advance('s22-repair-'+repair);
          assert.equal(restored.get().sceneId,'s22-common-b');
          restored.advance('s22-common-b');
          const c2Before=JSON.stringify(restored.get());
          restored.act('narrative:choose:s22-stop-choice:illegal');
          assert.equal(JSON.stringify(restored.get()),c2Before);
          restored.act('narrative:choose:s22-stop-choice:'+stop);
          assert.equal(restored.get().flags['s22-stop-'+stop],true);
          assert.equal(restored.get().flags['s22-stop-'+(stop==='group'?'notes':'group')],undefined);
          restored.act('narrative:back');
          assert.equal(JSON.stringify(restored.get()),c2Before);
          restored.act('narrative:choose:s22-stop-choice:'+stop);
          restored.advance('s22-stop-'+stop);
          assert.equal(restored.get().sceneId,'s23-intro');
          assert.equal(restored.get().routeLock,null);
          assert.equal(restored.get().flags['private-text-pending'],true);
          assert.equal(restored.get().flags['nick-joint-file-approved'],undefined);
          assert.equal(restored.get().flags['editor-publish-approved'],undefined);
        }
      }
    }
  }
});

test('N1 rejects forged S22 repair and stop flags/actionLog without state writes',()=>{
  const run=reachS22(reachEvening('damir'),'alice');
  run.advance('s22-intro');
  run.act('narrative:choose:s22-weather-choice:damir');
  run.advance('s22-weather-damir');
  run.advance('s22-common-a');
  run.act('narrative:choose:s22-repair-choice:roles');
  const repairSaved=JSON.parse(JSON.stringify(run.get()));
  run.advance('s22-repair-roles');
  run.advance('s22-common-b');
  run.act('narrative:choose:s22-stop-choice:group');
  const stopSaved=JSON.parse(JSON.stringify(run.get()));
  for(const [saved,chosen,other,beatId,branch] of [
    [repairSaved,'s22-repair-roles','s22-repair-anger','s22-repair-choice','s22-repair-roles'],
    [stopSaved,'s22-stop-group','s22-stop-notes','s22-stop-choice','s22-stop-group'],
  ]){
    const forged=[
      {...saved,flags:{...saved.flags,[other]:true}},
      {...saved,flags:Object.fromEntries(Object.entries(saved.flags)
        .filter(([k])=>k!==chosen))},
      {...saved,actionLog:saved.actionLog.map(entry=>
        entry.type==='choose'&&entry.beatId===beatId
          ?{...entry,optionId:other.split('-').at(-1)}:entry)},
      {...saved,actionLog:saved.actionLog.slice(0,-1)},
    ];
    for(const invalid of forged){
      const before=JSON.stringify(invalid);
      let writes=0;
      assert.throws(()=>createNarrativeRuntimeUpdate({graph:run.graph,catalog:run.catalog})({
        deltaMs:16,state:{narrative:invalid},inputs:[{schemaVersion:1,type:'pointer',
          action:'narrative:next:'+scene(branch).beats[0].id,
          phase:'up',timestamp:183,source:'renderer'}],
        setState(){writes++;},
      }),/inconsistent actionLog provenance or position|unavailable choice/);
      assert.equal(writes,0);
      assert.equal(JSON.stringify(invalid),before);
    }
  }
  assert.equal(run.get().flags['s22-repair-roles'],true);
  assert.equal(run.get().flags['s22-stop-group'],true);
});

test('S22 keeps the first novel free, independent and without new media consent',()=>{
  assert.equal(existsSync(new URL('../game/config/economy.json',import.meta.url)),false);
  assert.equal(existsSync(new URL('../game/config/premium.json',import.meta.url)),false);
  assert.deepEqual(catalogData.interactions,[]);
  assert.equal(graphData.scenes.some(s=>s.id==='s23-intro'),true);
});
