import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { graphData, catalogData } from '../game/src/story.js';
import { defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState, createNarrativeRuntimeUpdate } from '../game/assets/ludory-narrative.js';

const source = JSON.parse(readFileSync(new URL('./fixtures/s08-canon.json', import.meta.url), 'utf8')).blocks;
const scene = id => graphData.scenes.find(s => s.id === id);
const prose = id => scene(id).beats.filter(b => b.type === 'dialogue').map(b => b.text.ru).join('\n\n');

// Independently calculated from the pinned literary manuscript, not the fixture or game source.
const expectedProse = {
  's08-intro': [1, '93f66e115cdf56faaf89e945ebc47eca904022389fe913576b186444df8dce23'],
  's08-weather-damir': [2, '958afe98854e2d29ffa398e4739818e76d22368b83a578d0cd2f7e3722f55107'],
  's08-common': [90, '3459cd9268ae60ae55c9f029fd466bc8493af523c676dd8b2353d0f87e189fa9'],
  's08-warm': [4, '4eae33db16f53d077ced77b4561f3284e12663cd3075e78029b85cf09ed8210e'],
  's08-neutral': [3, 'a3e14450bbfae51b68da58527c3cdfd7216e6e8be7d3cd4c8fdb264e795c06a7'],
  's08-personal': [7, '5c3b9b160cf2c8f25549525b255f4e887780b56808d94222cc0da5cb859fb056'],
};

test('S08 displayed prose equals six pinned manuscript blocks', () => {
  const ids = {s08Intro:'s08-intro',s08WeatherDamir:'s08-weather-damir',s08Common:'s08-common',s08Warm:'s08-warm',s08Neutral:'s08-neutral',s08Personal:'s08-personal'};
  for(const [name, literal] of Object.entries(source)) assert.equal(prose(ids[name]), literal, name);
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
});
test('S08 six manuscript blocks retain independently verified paragraph counts and hashes', () => {
  for (const [id, [count, expectedHash]] of Object.entries(expectedProse)) {
    const paragraphs = scene(id).beats.filter(beat => beat.type === 'dialogue').map(beat => beat.text.ru);
    assert.equal(paragraphs.length, count, id);
    assert.equal(createHash('sha256').update(paragraphs.join('\n\n')).digest('hex'), expectedHash, id);
  }
});
test('S07→S08 and S08-C1 use prior weather state and exclusive free outcomes', () => {
  for(const id of ['s07-eric-favorite','s07-eric-music']) assert.equal(scene(id).nextSceneId,'s08-intro');
  assert.equal(scene('s07-m3-end'),undefined);
  const condition=scene('s08-intro').beats.at(-1);
  assert.equal(condition.id,'s08-weather-dispatch');
  assert.deepEqual(condition.choices.map(x=>x.id),['damir','other']);
  assert.deepEqual(condition.choices[0].when,{flag:'weather-choice-damir'});
  assert.deepEqual(condition.choices[1].when,{any:[{flag:'weather-choice-nick'},{flag:'weather-choice-erik'}]});
  assert.ok(condition.choices.every(x=>x.label.ru==='Продолжить' && !x.effects));
  assert.equal(scene('s08-weather-damir').nextSceneId,'s08-common');
  const choice=scene('s08-common').beats.at(-1);
  assert.equal(choice.id,'s08-damir-care-choice');
  assert.deepEqual(choice.choices.map(x=>x.id),['warm','neutral','personal']);
  assert.deepEqual(choice.choices.map(x=>x.label.ru),['Предложить Дамиру кофе','Поблагодарить и уйти','Спросить о Брюсселе']);
  for(const option of choice.choices){
    assert.deepEqual(option.effects,[{op:'flag_set',id:'damir-care-'+option.id,value:true}]);
    assert.equal(scene(option.targetSceneId).nextSceneId,'s08-m3-end');
    for(const field of ['cost','premium','contentId','requiredEntitlement']) assert.equal(option[field],undefined);
  }
  assert.equal(scene('s08-m3-end').beats[0].type,'ending');
  assert.equal(catalogData.interactions.length,0);
  assert.equal(existsSync(new URL('../game/config/economy.json',import.meta.url)),false);
});

function runToS08(weather='damir') {
  const graph=defineNarrativeGraph(graphData),catalog=defineNarrativeCatalog(catalogData);
  const update=createNarrativeRuntimeUpdate({graph,catalog});
  let state={narrative:createNarrativeState(graph)};
  const act=action=>update({deltaMs:16,state,inputs:[{schemaVersion:1,type:'pointer',action,phase:'up',timestamp:41,source:'renderer'}],setState(next){state=next;}});
  const route={
    's01-seat-choice':'back-damir','s02-career-choice':'people',
    's03-career-dispatch':'people','s03-seat-dispatch':'damir',
    's03-after-pharmacy-choice':'silence','s04-camera-consent-choice':'declined',
    's04-s03-dispatch':'silence','s05-weather-choice':weather,
    's06-weather-dispatch':weather==='erik'?'erik':'other',
    's06-seat-dispatch':'other','s06-eric-choice':'music',
    's07-weather-dispatch':weather==='nick'?'nick':'other',
    's07-seat-dispatch':'other','s07-consent-dispatch':'declined',
    's07-archive-choice':'private','s07-s06-dispatch':'music',
  };
  for(let i=0;i<1500 && state.narrative.sceneId!=='s08-intro';i++){
    const {sceneId,beatIndex}=state.narrative;
    const beat=scene(sceneId)?.beats[beatIndex];
    assert.ok(beat,sceneId+':'+beatIndex);
    if(beat.type==='dialogue')act('narrative:next:'+beat.id);
    else if(beat.type==='choice'){
      const selected=route[beat.id];assert.ok(selected,'unmapped '+beat.id);
      act('narrative:choose:'+beat.id+':'+selected);
    }else assert.fail('Unexpected ending: '+sceneId);
  }
  assert.equal(state.narrative.sceneId,'s08-intro');
  return {act,get:()=>state.narrative,graph,catalog};
}
const advance=(run,id)=>{
  assert.equal(run.get().sceneId,id);
  for(const beat of scene(id).beats.filter(x=>x.type==='dialogue'))run.act('narrative:next:'+beat.id);
};
test('S08 conditional Damir paragraph only follows S05 Damir weather choice',()=>{
  for(const weather of ['damir','nick','erik']){
    const run=runToS08(weather);
    advance(run,'s08-intro');
    const eligible=weather==='damir'?'damir':'other',forbidden=eligible==='damir'?'other':'damir';
    const before=JSON.stringify(run.get());
    run.act('narrative:choose:s08-weather-dispatch:'+forbidden);
    assert.equal(JSON.stringify(run.get()),before);
    run.act('narrative:choose:s08-weather-dispatch:'+eligible);
    assert.equal(run.get().sceneId,weather==='damir'?'s08-weather-damir':'s08-common');
    if(weather==='damir')advance(run,'s08-weather-damir');
    assert.equal(run.get().sceneId,'s08-common');
    assert.equal(run.get().flags['weather-choice-'+weather],true);
  }
});
test('S08-C1 A→Back→B→Back→C and JSON continuation retain previous narrative state',()=>{
  const run=runToS08();
  advance(run,'s08-intro');
  run.act('narrative:choose:s08-weather-dispatch:damir');
  advance(run,'s08-weather-damir');
  advance(run,'s08-common');
  for(const id of ['warm','neutral','personal']){
    run.act('narrative:choose:s08-damir-care-choice:'+id);
    const current=run.get();
    assert.equal(current.sceneId,'s08-'+id);
    assert.deepEqual(Object.keys(current.flags).filter(x=>x.startsWith('damir-care-')),['damir-care-'+id]);
    assert.equal(current.flags['weather-choice-damir'],true);
    assert.equal(current.routeLock,null);
    let saved={narrative:JSON.parse(JSON.stringify(current))};
    let next=saved;
    const update=createNarrativeRuntimeUpdate({graph:run.graph,catalog:run.catalog});
    update({deltaMs:16,state:saved,inputs:[{schemaVersion:1,type:'pointer',action:'narrative:next:s08-'+id+'-01',phase:'up',timestamp:42,source:'renderer'}],setState(v){next=v;}});
    assert.equal(next.narrative.flags['damir-care-'+id],true);
    assert.equal(next.narrative.beatIndex,current.beatIndex+1,'JSON restore must advance the paragraph');
    assert.equal(next.narrative.actionLog.length,current.actionLog.length+1,'JSON restore must log the action');
    let completed=current;
    for(const beat of scene('s08-'+id).beats.filter(x=>x.type==='dialogue')){
      const snapshot={narrative:JSON.parse(JSON.stringify(completed))};
      let restored=snapshot;
      update({deltaMs:16,state:snapshot,inputs:[{schemaVersion:1,type:'pointer',action:'narrative:next:'+beat.id,phase:'up',timestamp:44,source:'renderer'}],setState(v){restored=v;}});
      completed=restored.narrative;
    }
    assert.equal(completed.sceneId,'s08-m3-end','each S08 response must complete through the real runtime');
    assert.equal(completed.flags['damir-care-'+id],true);
    const corrupted=JSON.parse(JSON.stringify(current));
    corrupted.flags['damir-care-'+(id==='warm'?'personal':'warm')]=true;
    assert.throws(()=>{
      let container={narrative:corrupted};
      update({deltaMs:16,state:container,inputs:[{schemaVersion:1,type:'pointer',action:'narrative:next:s08-'+id+'-01',phase:'up',timestamp:43,source:'renderer'}],setState(){}});
    },/inconsistent actionLog provenance or position/);
    run.act('narrative:back');
    assert.equal(run.get().sceneId,'s08-common');
    assert.equal(run.get().flags['damir-care-'+id],undefined);
  }
});
