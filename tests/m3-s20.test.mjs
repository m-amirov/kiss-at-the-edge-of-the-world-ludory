import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Independently pinned EP05/S20 displayed manuscript blocks. Headers,
// scene metadata and technical transitions are not authorial dialogue.
const sourceProof = {
  's20-intro': [35, '29919083b876aa85b506415a5e567de3975d464758616e201f49f30ba63e00fb'],
  's20-kiss': [5, '7e211abe9001fbf0212d559e699e0f155a81b0efd240a0682c88fd9106cd6f11'],
  's20-tea': [3, '28970eede9120d901e29ab48e0acaeb444db33564f30bec797357edc6c556a27'],
  's20-leave': [5, 'cb303cbc880421b35417d781362dbfe722bd3f9809085b109f3bb278505914d4'],
  's20-common': [2, 'ea2a07c34d9ec97637e5c0ca8adec2a1678ed69ffb4fb109a2a07b3d6f9954a7'],
  's20-k': [1, 'd753813531e98e7e77d3f5978551ca2b49509f2c6b65207c754ae23e28dab42e'],
  's20-t': [1, '962a8fd772cb61f51d1bbfb00636aed9efc2d8e6fa6a4b05b2dec81c34b757fd'],
  's20-l': [1, '7e2878b6fab1d568df5275291aa3843e382e622fe4181c0050d493b717b0990c'],
  's20-breakfast': [1, '5d2631b97b9bfcfc872338ec630a16039a52c2879e2a9ab1c9b2549c79dc727e'],
  's20-waterfront': [1, 'd2024cb4b66a74814df52afb7985d2ee42bd9ab12422e8b7031fe64e84b02633'],
};
const scene = id => graphData.scenes.find(s=>s.id===id);
const shown = id => (scene(id)?.beats??[]).filter(b=>b.type==='dialogue').map(b=>b.text.ru);
const choice = (id,beat) => scene(id)?.beats.find(b=>b.id===beat);

test('S20 renders all ten exact authored blocks, 55 paragraphs',()=>{
  assert.equal(Object.values(sourceProof).reduce((n,[c])=>n+c,0),55);
  for(const [id,[count,sha]] of Object.entries(sourceProof)){
    const paragraphs=shown(id);
    assert.equal(paragraphs.length,count,id);
    assert.equal(createHash('sha256').update(paragraphs.join('\n\n')).digest('hex'),sha,id);
    assert.ok(paragraphs.every(p=>!p.startsWith('Технический переход') &&
      !p.startsWith('Выбор S20-') && !p.startsWith('Переход S20')),id);
  }
  assert.doesNotThrow(()=>defineNarrativeGraph(graphData));
});

test('only Damir S17 enters S20, free C1×C2 with effect-free guarded day-11 payoff',()=>{
  assert.deepEqual(choice('s17-common-b','s17-evening-choice').choices.map(c=>[c.id,c.targetSceneId]),[
    ['eric','s18-intro'],['nick','s19-intro'],['damir','s20-intro'],['self','s21-intro'],
  ]);
  assert.equal(scene('s20-m3-end'),undefined);
  const c1=choice('s20-intro','s20-dinner-choice');
  assert.deepEqual(c1.choices.map(c=>[c.id,c.targetSceneId,c.effects]),[
    ['new-kiss','s20-kiss',[{op:'flag_set',id:'damir-dinner-new-kiss',value:true}]],
    ['tea-without-touch','s20-tea',[{op:'flag_set',id:'damir-dinner-tea-without-touch',value:true}]],
    ['leave','s20-leave',[{op:'flag_set',id:'damir-dinner-leave',value:true}]],
  ]);
  for(const id of ['kiss','tea','leave'])assert.equal(scene('s20-'+id).nextSceneId,'s20-common');
  assert.equal(scene('s20-common').nextSceneId,'s20-payoff-dispatch');
  const guard=choice('s20-payoff-dispatch','s20-payoff-choice');
  assert.deepEqual(guard.choices.map(c=>[c.id,c.targetSceneId,c.when?.flag,c.effects]),[
    ['k','s20-k','damir-dinner-new-kiss',undefined],
    ['t','s20-t','damir-dinner-tea-without-touch',undefined],
    ['l','s20-l','damir-dinner-leave',undefined],
  ]);
  for(const id of ['k','t','l'])
    assert.equal(scene('s20-'+id).nextSceneId,'s20-followup-choice-scene');
  const c2=choice('s20-followup-choice-scene','s20-followup-choice');
  assert.deepEqual(c2.choices.map(c=>[c.id,c.targetSceneId,c.effects]),[
    ['shopping','s20-breakfast',[{op:'flag_set',id:'damir-followup-shopping',value:true}]],
    ['waterfront','s20-waterfront',[{op:'flag_set',id:'damir-followup-waterfront',value:true}]],
  ]);
  for(const id of ['breakfast','waterfront'])
    assert.equal(scene('s20-'+id).nextSceneId,'s20-after-m3-end');
  assert.equal(scene('s20-after-m3-end').beats[0].type,'ending');
  for(const c of [...c1.choices,...guard.choices,...c2.choices])
    for(const f of ['premium','cost','romancePoints','routeLock','requiredEntitlement',
      'publishPermission','consentToPublish','reconciliation','routeIntent'])
      assert.equal(c[f],undefined,f);
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
  's17-d-dispatch':'a','s17-group-choice':'d','s17-evening-choice':'damir',
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
function reachS20(){
  const run=runtime();
  for(let i=0;i<5000&&run.get().sceneId!=='s20-intro';i++){
    const {sceneId,beatIndex}=run.get();
    const beat=scene(sceneId)?.beats[beatIndex],before=sceneId+':'+beatIndex;
    assert.ok(beat,before);
    if(beat.type==='dialogue')run.act('narrative:next:'+beat.id);
    else if(beat.type==='choice'){
      assert.ok(priorRoute[beat.id],'unmapped choice '+beat.id);
      run.act('narrative:choose:'+beat.id+':'+priorRoute[beat.id]);
    }else assert.fail('premature ending '+sceneId);
    assert.notEqual(run.get().sceneId+':'+run.get().beatIndex,before,'stalled '+before);
  }
  assert.equal(run.get().sceneId,'s20-intro');
  return run;
}

test('real N1: all 3×2 Damir S20 branches, Back, JSON and consent remain separate',()=>{
  const base=reachS20();
  assert.equal(base.get().flags['s17-evening-damir'],true);
  assert.equal(base.get().flags['damir-space-tea'],true);
  assert.equal(base.get().flags['private-text-pending'],true);
  base.advance('s20-intro');
  const checkpoint=JSON.parse(JSON.stringify(base.get()));
  const dinners={
    'new-kiss':['s20-kiss','damir-dinner-new-kiss','k'],
    'tea-without-touch':['s20-tea','damir-dinner-tea-without-touch','t'],
    leave:['s20-leave','damir-dinner-leave','l'],
  };
  for(const [answer,[branch,flag,payoff]] of Object.entries(dinners))
    for(const follow of ['shopping','waterfront']){
      const run=runtime(checkpoint);
      const before=JSON.stringify(run.get());
      run.act('narrative:choose:s20-dinner-choice:invalid');
      assert.equal(JSON.stringify(run.get()),before);
      run.act('narrative:choose:s20-dinner-choice:'+answer);
      assert.equal(run.get().sceneId,branch);
      assert.equal(run.get().flags[flag],true);
      assert.equal(run.get().routeLock,null);
      run.act('narrative:back');
      assert.equal(JSON.stringify(run.get()),before);
      run.act('narrative:choose:s20-dinner-choice:'+answer);
      const restored=runtime(JSON.parse(JSON.stringify(run.get())));
      restored.advance(branch);
      restored.advance('s20-common');
      assert.equal(restored.get().sceneId,'s20-payoff-dispatch');
      for(const wrong of ['k','t','l'].filter(id=>id!==payoff)){
        const prior=JSON.stringify(restored.get());
        restored.act('narrative:choose:s20-payoff-choice:'+wrong);
        assert.equal(JSON.stringify(restored.get()),prior);
      }
      restored.act('narrative:choose:s20-payoff-choice:'+payoff);
      restored.advance('s20-'+payoff);
      assert.equal(restored.get().sceneId,'s20-followup-choice-scene');
      const beforeFollow=JSON.stringify(restored.get());
      restored.act('narrative:choose:s20-followup-choice:invalid');
      assert.equal(JSON.stringify(restored.get()),beforeFollow);
      restored.act('narrative:choose:s20-followup-choice:'+follow);
      assert.equal(restored.get().flags['damir-followup-'+follow],true);
      assert.equal(restored.get().flags['private-text-pending'],true);
      assert.equal(restored.get().flags['s17-evening-damir'],true);
      assert.equal(restored.get().routeLock,null);
      assert.equal(restored.get().flags['damir-reconciled'],undefined);
      restored.act('narrative:back');
      assert.equal(JSON.stringify(restored.get()),beforeFollow);
      restored.act('narrative:choose:s20-followup-choice:'+follow);
      restored.advance('s20-'+(follow==='shopping'?'breakfast':'waterfront'));
      assert.equal(restored.get().sceneId,'s20-after-m3-end');
    }
});

test('N1 rejects forged S20 dinner flags and actionLog with zero state writes',()=>{
  const run=reachS20();
  run.advance('s20-intro');
  run.act('narrative:choose:s20-dinner-choice:tea-without-touch');
  const saved=JSON.parse(JSON.stringify(run.get()));
  const forged=[
    {...saved,flags:{...saved.flags,'damir-dinner-new-kiss':true}},
    {...saved,flags:Object.fromEntries(Object.entries(saved.flags)
      .filter(([k])=>k!=='damir-dinner-tea-without-touch'))},
    {...saved,actionLog:saved.actionLog.map(entry=>
      entry.type==='choose'&&entry.beatId==='s20-dinner-choice'
        ?{...entry,optionId:'new-kiss'}:entry)},
    {...saved,actionLog:saved.actionLog.slice(0,-1)},
  ];
  for(const invalid of forged){
    const before=JSON.stringify(invalid);
    let writes=0;
    assert.throws(()=>createNarrativeRuntimeUpdate({graph:run.graph,catalog:run.catalog})({
      deltaMs:16,state:{narrative:invalid},inputs:[{schemaVersion:1,type:'pointer',
        action:'narrative:next:'+scene('s20-tea').beats[0].id,
        phase:'up',timestamp:182,source:'renderer'}],
      setState(){writes++;},
    }),/inconsistent actionLog provenance or position|unavailable choice/);
    assert.equal(writes,0);
    assert.equal(JSON.stringify(invalid),before);
  }
  assert.equal(run.get().flags['damir-dinner-tea-without-touch'],true);
});

test('S20 remains fully free, with no first-game economy',()=>{
  assert.equal(existsSync(new URL('../game/config/economy.json',import.meta.url)),false);
  assert.equal(existsSync(new URL('../game/config/premium.json',import.meta.url)),false);
  assert.deepEqual(catalogData.interactions,[]);
});
