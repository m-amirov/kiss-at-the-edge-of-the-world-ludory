import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState, createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Hashes and paragraph counts derived directly from the pinned S66 source, not from game code.
const proof = {
  's66-intro': [90, '34dc752974ce8d0fad7b78bd10e769187718633c0bd5d00fa39d6fddce7f4c1c'],
  's66-damir-warm': [1, '7e8960fe43266f44c02472ca998045448503bc68b2a06c3b86f8bcc5a3dfb28d'],
  's66-damir-neutral': [1, '430711b6d90ea3c13875c5244b62bdbafbcedbf7fb14e521c19517178ed40e4b'],
  's66-damir-personal': [1, '35bb7b6ab4648b65bb1366ecb95bdeb5c162b53b547136ea389cd08283e11b23'],
  's66-common-a': [2, '497f6c9987615546f73717943831d58a6d281dc0aa78c539a2b7afb011ffa804'],
  's66-career-people': [1, 'f58c2aa7e1b173dbcb9755e2cda52eadc555c109487a5f9f3fd494bc39c63046'],
  's66-career-place': [1, '288027ea1fd91536740e930b1207c781cf12bfb4d2890cdf09aeced26ec264b2'],
  's66-career-own': [1, '24b865f39081b944ae85760dd2b1103bd84853080aececa3e513df064943be09'],
  's66-common-b': [7, 'fea61ea61eee8adf0c8ad401aeb4bee668c420ec80c5e8c371193e16fd7f6cfc'],
};
const scene = id => graphData.scenes.find(item => item.id === id);
const dialogue = id => scene(id)?.beats.filter(beat => beat.type === 'dialogue') ?? [];

test('S66 displays all nine canonical prose blocks with independently verified SHA-256', () => {
  for (const [id, [expectedCount, expectedHash]] of Object.entries(proof)) {
    const paragraphs = dialogue(id).map(beat => beat.text.ru);
    assert.equal(paragraphs.length, expectedCount, `${id} paragraph count`);
    assert.equal(createHash('sha256').update(paragraphs.join('\n\n')).digest('hex'), expectedHash, id);
  }
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
});

test('S08 rejoins S66; two guarded callbacks have no invented decision or economy effects', () => {
  for (const id of ['s08-warm', 's08-neutral', 's08-personal']) {
    assert.equal(scene(id).nextSceneId, 's66-intro', id);
  }
  assert.equal(scene('s08-m3-end'), undefined);
  const care = scene('s66-intro').beats.at(-1);
  assert.equal(care.id, 's66-damir-dispatch');
  assert.deepEqual(care.choices.map(({id, targetSceneId, when}) => [id, targetSceneId, when]), [
    ['warm', 's66-damir-warm', {flag:'damir-care-warm'}],
    ['neutral', 's66-damir-neutral', {flag:'damir-care-neutral'}],
    ['personal', 's66-damir-personal', {flag:'damir-care-personal'}],
  ]);
  for (const id of ['warm', 'neutral', 'personal']) assert.equal(scene('s66-damir-'+id).nextSceneId, 's66-common-a');
  const thesis = scene('s66-common-a').beats.at(-1);
  assert.equal(thesis.id, 's66-career-dispatch');
  assert.deepEqual(thesis.choices.map(({id, targetSceneId, when}) => [id, targetSceneId, when]), [
    ['people', 's66-career-people', {flag:'career-thesis-people'}],
    ['place', 's66-career-place', {flag:'career-thesis-place'}],
    ['own-choice', 's66-career-own', {flag:'career-thesis-own-choice'}],
  ]);
  for (const id of ['people', 'place', 'own']) assert.equal(scene('s66-career-'+id).nextSceneId, 's66-common-b');
  assert.equal(scene('s66-common-b').nextSceneId, 's66-m3-end');
  assert.equal(scene('s66-m3-end').beats[0].type, 'ending');
  assert.ok([care,thesis].every(beat => beat.choices.every(choice =>
    choice.label.ru === 'Продолжить' && !choice.effects && !choice.cost && !choice.premium)));
});

function runToS66(career, care) {
  const graph = defineNarrativeGraph(graphData);
  const catalog = defineNarrativeCatalog(catalogData);
  const update = createNarrativeRuntimeUpdate({graph,catalog});
  let state = {narrative:createNarrativeState(graph)};
  const act = action => update({deltaMs:16,state,
    inputs:[{schemaVersion:1,type:'pointer',action,phase:'up',timestamp:75,source:'renderer'}],
    setState(next){state=next;}});
  const route = {
    's01-seat-choice':'back-damir','s02-career-choice':career,
    's03-career-dispatch':career,'s03-seat-dispatch':'damir',
    's03-after-pharmacy-choice':'silence','s04-camera-consent-choice':'declined',
    's04-s03-dispatch':'silence','s05-weather-choice':'damir',
    's06-weather-dispatch':'other','s06-seat-dispatch':'other','s06-eric-choice':'music',
    's07-weather-dispatch':'other','s07-seat-dispatch':'other','s07-consent-dispatch':'declined',
    's07-archive-choice':'private','s07-s06-dispatch':'music',
    's08-weather-dispatch':'damir','s08-damir-care-choice':care,
  };
  for(let i=0;i<2000 && state.narrative.sceneId!=='s66-intro';i++){
    const {sceneId,beatIndex}=state.narrative;
    const beat=scene(sceneId)?.beats[beatIndex];
    assert.ok(beat,`${sceneId}:${beatIndex}`);
    if(beat.type==='dialogue')act('narrative:next:'+beat.id);
    else if(beat.type==='choice'){
      assert.ok(route[beat.id],`unmapped choice ${beat.id}`);
      act('narrative:choose:'+beat.id+':'+route[beat.id]);
    }else assert.fail(`Unexpected ending ${sceneId}`);
  }
  assert.equal(state.narrative.sceneId,'s66-intro');
  const advance = id => {
    assert.equal(state.narrative.sceneId,id);
    for(const beat of dialogue(id)) act('narrative:next:'+beat.id);
  };
  const restore = (snapshot,action) => {
    let restored={narrative:JSON.parse(JSON.stringify(snapshot))};
    update({deltaMs:16,state:restored,
      inputs:[{schemaVersion:1,type:'pointer',action,phase:'up',timestamp:76,source:'renderer'}],
      setState(next){restored=next;}});
    return restored.narrative;
  };
  return {act,advance,restore,get:()=>state.narrative};
}

test('S66 real runtime preserves S08 care and S02 thesis in all authored callbacks', () => {
  for (const [career,care,careerScene] of [
    ['people','warm','people'], ['place','neutral','place'], ['own-choice','personal','own'],
  ]) {
    const run=runToS66(career,care);
    run.advance('s66-intro');
    const before=JSON.stringify(run.get());
    const wrongCare=care==='warm'?'neutral':'warm';
    run.act('narrative:choose:s66-damir-dispatch:'+wrongCare);
    assert.equal(JSON.stringify(run.get()),before,'wrong S08 callback must not advance');
    run.act('narrative:choose:s66-damir-dispatch:'+care);
    assert.equal(run.get().sceneId,'s66-damir-'+care);
    assert.equal(run.get().flags['damir-care-'+care],true);
    assert.equal(run.get().routeLock,null);

    // Back reverses only the new technical dispatch; the authored S08 decision survives.
    run.act('narrative:back');
    assert.equal(run.get().sceneId,'s66-intro');
    assert.equal(run.get().flags['damir-care-'+care],true);
    run.act('narrative:choose:s66-damir-dispatch:'+care);
    const resumed=run.restore(run.get(),'narrative:next:s66-damir-'+care+'-01');
    assert.equal(resumed.sceneId,'s66-common-a');
    assert.equal(resumed.flags['damir-care-'+care],true);
    assert.equal(resumed.actionLog.length,run.get().actionLog.length+1);

    run.advance('s66-damir-'+care);
    run.advance('s66-common-a');
    const beforeCareer=JSON.stringify(run.get());
    const wrongCareer=career==='people'?'place':'people';
    run.act('narrative:choose:s66-career-dispatch:'+wrongCareer);
    assert.equal(JSON.stringify(run.get()),beforeCareer,'wrong S02 callback must not advance');
    run.act('narrative:choose:s66-career-dispatch:'+career);
    assert.equal(run.get().sceneId,'s66-career-'+careerScene);
    assert.equal(run.get().flags['career-thesis-'+career],true);
    const afterCareer=run.restore(run.get(),'narrative:next:s66-career-'+careerScene+'-01');
    assert.equal(afterCareer.sceneId,'s66-common-b');
    assert.equal(afterCareer.flags['career-thesis-'+career],true);
    run.advance('s66-career-'+careerScene);
    run.advance('s66-common-b');
    assert.equal(run.get().sceneId,'s66-m3-end');
  }
});

test('S66 remains free, without Economy E5 or premium decisions', () => {
  assert.equal(existsSync(new URL('../game/config/economy.json',import.meta.url)),false);
  assert.equal(existsSync(new URL('../game/config/premium.json',import.meta.url)),false);
  assert.deepEqual(catalogData.interactions,[]);
  for(const id of Object.keys(proof)) for(const beat of scene(id)?.beats ?? []){
    if(beat.type!=='choice')continue;
    for(const option of beat.choices)for(const key of ['cost','premium','contentId','requiredEntitlement']){
      assert.equal(option[key],undefined,`${id}/${option.id}/${key}`);
    }
  }
});
