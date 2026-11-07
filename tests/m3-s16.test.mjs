import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Literal proofs independently taken from pinned EP04/S16, excluding headings and metadata.
const proof = {
  's16-intro': [17, 'd3106a7af2ef2f99b2ea2867d5699c508caeebef6d06c04890714dbdbaca82e9'],
  's16-tea': [9, '67178909eb00a41fd689bc8ff6aff876d940687a799f6eadde2f7ecab7071fa9'],
  's16-room': [5, '92b18b033e48fb6eb8d113ff7f983c1f50ef9b1cc3bbf68b2d5a1263e53e93f9'],
  's16-common': [7, '29fbf12391220644857c60350008b761fe15e234f9b6cd0f0f6cb987dcf1ce7c'],
};
const scene=id=>graphData.scenes.find(s=>s.id===id);
const paragraphs=id=>(scene(id)?.beats??[]).filter(b=>b.type==='dialogue').map(b=>b.text.ru);
const policies={a:['s16-tea','damir-space-tea'],b:['s16-room','damir-space-room']};

test('S16 four original prose blocks render 38 canonical paragraphs, exactly',()=>{
  assert.equal(Object.values(proof).reduce((n,[count])=>n+count,0),38);
  for(const [id,[count,hash]]of Object.entries(proof)){
    const shown=paragraphs(id);
    assert.equal(shown.length,count,id);
    assert.equal(createHash('sha256').update(shown.join('\n\n')).digest('hex'),hash,id);
  }
  assert.doesNotThrow(()=>defineNarrativeGraph(graphData));
});

test('S15 flows to S16; one free two-way Damir-space choice rejoins exact shared ending',()=>{
  for(const g of ['walk','photo'])assert.equal(scene('s15-evening-'+g).nextSceneId,'s16-intro');
  assert.equal(scene('s15-m3-end'),undefined);
  const choice=scene('s16-intro').beats.at(-1);
  assert.equal(choice.id,'s16-care-choice');
  assert.deepEqual(choice.choices.map(({id,label,targetSceneId,effects,when})=>
    [id,label.ru,targetSceneId,effects,when]),[
    ['a','Подойти с конкретной заботой и не требовать разговора','s16-tea',
      [{op:'flag_set',id:'damir-space-tea',value:true}],undefined],
    ['b','Дать ему пространство и ясно назвать, когда увидятся снова','s16-room',
      [{op:'flag_set',id:'damir-space-room',value:true}],undefined],
  ]);
  for(const [target]of Object.values(policies))
    assert.equal(scene(target).nextSceneId,'s16-common');
  assert.equal(scene('s16-common').nextSceneId,'s17-intro');
  assert.equal(scene('s16-m3-end'),undefined);
  for(const c of choice.choices)for(const key of ['cost','premium','contentId',
    'requiredEntitlement','romancePoints','publishPermission','consentToPublish','routeLock'])
    assert.equal(c[key],undefined);
});

function runtimeFrom(graph,catalog,snapshot){
  const update=createNarrativeRuntimeUpdate({graph,catalog});
  let state={narrative:JSON.parse(JSON.stringify(snapshot))};
  const act=action=>update({deltaMs:16,state,inputs:[{schemaVersion:1,type:'pointer',
    action,phase:'up',timestamp:161,source:'renderer'}],setState(s){state=s;}});
  const advance=id=>{
    assert.equal(state.narrative.sceneId,id);
    for(const beat of scene(id).beats.filter(b=>b.type==='dialogue'))
      act('narrative:next:'+beat.id);
  };
  return {graph,catalog,act,advance,get:()=>state.narrative};
}

function toS16(privacy,gesture){
  const graph=defineNarrativeGraph(graphData),catalog=defineNarrativeCatalog(catalogData);
  const run=runtimeFrom(graph,catalog,createNarrativeState(graph));
  const route={
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
    's13-work-choice':'editor','s13-return-dispatch':'chocolate',
    's14-tone-dispatch':'quiet','s14-pace-choice':'slow',
    's14-gesture-choice':gesture,'s15-voice-dispatch':'damir',
    's15-privacy-choice':privacy,'s15-gesture-dispatch':gesture,
  };
  for(let i=0;i<5000&&run.get().sceneId!=='s16-intro';i++){
    const {sceneId,beatIndex}=run.get(),beat=scene(sceneId)?.beats[beatIndex];
    const before=sceneId+':'+beatIndex+':'+run.get().actionLog.length;
    assert.ok(beat,sceneId+':'+beatIndex);
    if(beat.type==='dialogue')run.act('narrative:next:'+beat.id);
    else if(beat.type==='choice'){
      assert.ok(route[beat.id],'unmapped '+beat.id);
      run.act('narrative:choose:'+beat.id+':'+route[beat.id]);
    }else assert.fail('encountered technical ending before S16: '+sceneId);
    const after=run.get();
    assert.notEqual(after.sceneId+':'+after.beatIndex+':'+after.actionLog.length,before,
      'stalled N1 action on '+sceneId+':'+beatIndex);
  }
  assert.equal(run.get().sceneId,'s16-intro');
  return run;
}

test('prior Nick privacy × Eric gesture × both S16 choices: real N1, Back, JSON and tamper',()=>{
  for(const privacy of ['a','b','c'])for(const gesture of ['walk','photo']){
    const base=toS16(privacy,gesture);
    base.advance('s16-intro');
    const checkpoint=JSON.parse(JSON.stringify(base.get()));
    for(const chosen of ['a','b']){
      const run=runtimeFrom(base.graph,base.catalog,checkpoint);
      const [target,flag]=policies[chosen],other=chosen==='a'?'b':'a';
      const before=JSON.stringify(run.get());
      run.act('narrative:choose:s16-care-choice:invalid');
      assert.equal(JSON.stringify(run.get()),before);
      run.act('narrative:choose:s16-care-choice:'+chosen);
      assert.equal(run.get().flags[flag],true);
      assert.equal(run.get().flags[policies[other][1]],undefined);
      run.act('narrative:back');
      assert.equal(run.get().sceneId,'s16-intro');
      assert.equal(run.get().flags[flag],undefined);
      assert.equal(JSON.stringify(run.get()),before);
      run.act('narrative:choose:s16-care-choice:'+other);
      assert.equal(run.get().flags[policies[other][1]],true);
      run.act('narrative:back');
      assert.equal(JSON.stringify(run.get()),before);
      run.act('narrative:choose:s16-care-choice:'+chosen);
      const saved=JSON.parse(JSON.stringify(run.get()));
      const fresh=runtimeFrom(run.graph,run.catalog,saved);
      fresh.act('narrative:next:'+scene(target).beats[0].id);
      assert.equal(fresh.get().sceneId,target);
      assert.equal(fresh.get().beatIndex,1);
      const forged={...saved,flags:{...saved.flags,[policies[other][1]]:true}};
      const missing={...saved,flags:Object.fromEntries(Object.entries(saved.flags).filter(([k])=>k!==flag))};
      const changedLog={...saved,actionLog:saved.actionLog.map((entry,i)=>
        i===saved.actionLog.length-1?{...entry,optionId:other}:entry)};
      const shortenedLog={...saved,actionLog:saved.actionLog.slice(0,-1)};
      for(const invalid of [forged,missing,changedLog,shortenedLog]){
        assert.throws(()=>createNarrativeRuntimeUpdate({graph:run.graph,catalog:run.catalog})({
          deltaMs:16,state:{narrative:invalid},inputs:[{schemaVersion:1,
            type:'pointer',action:'narrative:next:'+scene(target).beats[0].id,
            phase:'up',timestamp:162,source:'renderer'}],setState(){},
        }),/inconsistent actionLog provenance or position/);
      }
      assert.equal(run.get().flags['nick-failure-'+({a:'private',b:'observed',c:'shared-file'}[privacy])],true);
      assert.equal(run.get().flags['private-text-'+({a:'declined',b:'limited',c:'pending'}[privacy])],true);
      assert.equal(run.get().flags['eric-gesture-'+gesture],true);
      assert.equal(run.get().flags['consent-camera-declined-respected'],true);
      assert.equal(run.get().flags['beach-footage-safe-only'],true);
      assert.equal(run.get().flags['alice-leads-editor'],true);
      assert.equal(run.get().routeLock,null);
      run.advance(target);
      run.advance('s16-common');
      assert.equal(run.get().sceneId,'s17-intro');
    }
  }
});

test('first novel still has no opt-in economy, purchases or premium consent',()=>{
  assert.equal(existsSync(new URL('../game/config/economy.json',import.meta.url)),false);
  assert.equal(existsSync(new URL('../game/config/premium.json',import.meta.url)),false);
  assert.deepEqual(catalogData.interactions,[]);
});
