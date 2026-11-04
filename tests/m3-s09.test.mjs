import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState, createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Independent SHA-256s of nine author blocks in pinned literary EP03/S09, not game/src/scenes/s09.js.
const proof = {
  's09-intro': [25, 'c8e045f007b43dd8689a9fa0403fdd2f036cc20c24fa7fb52a4c49cfe94e7297'],
  's09-eric': [9, '719e6878b68ae3bf780f097c83e602d5af8af42d77bb4e85b6c66820eaf751ce'],
  's09-nick': [8, '4bdb92e57d996247340f88b46354fd0a82f413e0be391c40c284d030260a45fb'],
  's09-damir': [9, 'cb53b55d2014f7608edfc007f8608cb16ed04149f536a2956bc70aa3e4157a27'],
  's09-common-a': [1, '66e1af8080db69a36e84a822922a909844dbed2bd7d122137c6dce257b5b6ec2'],
  's09-career-people': [1, 'ef158f4105560b88258efec01f2081773a28552be49e414ba4157c825c7a64da'],
  's09-career-place': [1, '4bb0c7a64d15c270d0e5ab53d7642d527082eab56462829d43c5ebd88bd27822'],
  's09-career-own': [1, '89649b79bc49903cb1ddee346283a532b5d4d987bc070c9b8efd471766c57300'],
  's09-common-b': [1, '9172c4dced6ea075aff61022b5c460c8d185345a92291b33f96db4d48c5af98a'],
};
const scene = id => graphData.scenes.find(item => item.id === id);
const prose = id => (scene(id)?.beats ?? []).filter(beat => beat.type === 'dialogue').map(beat => beat.text.ru);

test('S09 nine authored blocks retain exact pinned manuscript paragraphs and independent hashes', () => {
  for (const [id, [count, expectedHash]] of Object.entries(proof)) {
    const paragraphs = prose(id);
    assert.equal(paragraphs.length, count, `${id} paragraphs`);
    assert.equal(createHash('sha256').update(paragraphs.join('\n\n')).digest('hex'), expectedHash, id);
  }
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
});

test('S66 enters S09; free S09-C1 has exactly three exclusive voices and one later guarded thesis dispatch', () => {
  assert.equal(scene('s66-common-b').nextSceneId, 's09-intro');
  assert.equal(scene('s66-m3-end'), undefined);
  const voice = scene('s09-intro').beats.at(-1);
  assert.equal(voice.id, 's09-voice-choice');
  assert.deepEqual(voice.choices.map(({id,label,targetSceneId,effects}) => [id,label.ru,targetSceneId,effects]), [
    ['eric', 'Попросить Эрика показать место, которое он сам запомнил', 's09-eric', [{op:'flag_set',id:'skogafoss-voice-eric',value:true}]],
    ['nick', 'Попросить Ника назвать то, что камера пропустила', 's09-nick', [{op:'flag_set',id:'skogafoss-voice-nick',value:true}]],
    ['damir', 'Попросить Дамира вспомнить момент подъёма', 's09-damir', [{op:'flag_set',id:'skogafoss-voice-damir',value:true}]],
  ]);
  for (const id of ['eric','nick','damir']) assert.equal(scene('s09-'+id).nextSceneId,'s09-common-a');
  const career = scene('s09-common-a').beats.at(-1);
  assert.equal(career.id,'s09-career-dispatch');
  assert.deepEqual(career.choices.map(({id,targetSceneId,when}) => [id,targetSceneId,when]), [
    ['people','s09-career-people',{flag:'career-thesis-people'}],
    ['place','s09-career-place',{flag:'career-thesis-place'}],
    ['own-choice','s09-career-own',{flag:'career-thesis-own-choice'}],
  ]);
  for (const id of ['people','place','own']) assert.equal(scene('s09-career-'+id).nextSceneId,'s09-common-b');
  assert.equal(scene('s09-common-b').nextSceneId,'s09-m3-end');
  assert.equal(scene('s09-m3-end').beats[0].type,'ending');
  for (const opt of [...voice.choices,...career.choices]) {
    for (const key of ['cost','premium','contentId','requiredEntitlement']) assert.equal(opt[key],undefined,key);
  }
  for (const opt of career.choices) {
    assert.equal(opt.label.ru,'Продолжить');
    assert.equal(opt.effects,undefined);
  }
});

function reachS09(career) {
  const graph=defineNarrativeGraph(graphData);
  const catalog=defineNarrativeCatalog(catalogData);
  const update=createNarrativeRuntimeUpdate({graph,catalog});
  let state={narrative:createNarrativeState(graph)};
  const act=action=>update({deltaMs:16,state,inputs:[{schemaVersion:1,type:'pointer',action,phase:'up',timestamp:91,source:'renderer'}],setState(next){state=next;}});
  const route={
    's01-seat-choice':'back-damir','s02-career-choice':career,
    's03-career-dispatch':career,'s03-seat-dispatch':'damir',
    's03-after-pharmacy-choice':'silence','s04-camera-consent-choice':'declined',
    's04-s03-dispatch':'silence','s05-weather-choice':'damir',
    's06-weather-dispatch':'other','s06-seat-dispatch':'other','s06-eric-choice':'music',
    's07-weather-dispatch':'other','s07-seat-dispatch':'other','s07-consent-dispatch':'declined',
    's07-archive-choice':'private','s07-s06-dispatch':'music',
    's08-weather-dispatch':'damir','s08-damir-care-choice':'warm',
    's66-damir-dispatch':'warm','s66-career-dispatch':career,
  };
  for(let i=0;i<2600 && state.narrative.sceneId!=='s09-intro';i++){
    const {sceneId,beatIndex}=state.narrative;
    const beat=scene(sceneId)?.beats[beatIndex];
    assert.ok(beat,`${sceneId}:${beatIndex}`);
    if(beat.type==='dialogue')act('narrative:next:'+beat.id);
    else if(beat.type==='choice'){
      assert.ok(route[beat.id],`unmapped choice ${beat.id}`);
      act('narrative:choose:'+beat.id+':'+route[beat.id]);
    }else assert.fail(`unexpected early ending ${sceneId}`);
  }
  assert.equal(state.narrative.sceneId,'s09-intro');
  const advance=id=>{
    assert.equal(state.narrative.sceneId,id);
    for(const beat of scene(id).beats.filter(b=>b.type==='dialogue')) act('narrative:next:'+beat.id);
  };
  return {act,advance,get:()=>state.narrative,set(snapshot){state={narrative:JSON.parse(JSON.stringify(snapshot))};},update};
}

test('real N1 runtime covers all nine S09 voice × S02 thesis combinations, Back and JSON restore', () => {
  for (const career of ['people','place','own-choice']) {
    const run=reachS09(career);
    run.advance('s09-intro');
    const checkpoint=JSON.parse(JSON.stringify(run.get()));
    for (const voice of ['eric','nick','damir']) {
      run.set(checkpoint);
      run.act('narrative:choose:s09-voice-choice:'+voice);
      assert.equal(run.get().sceneId,'s09-'+voice);
      assert.deepEqual(Object.keys(run.get().flags).filter(x=>x.startsWith('skogafoss-voice-')),['skogafoss-voice-'+voice]);
      assert.equal(run.get().routeLock,null);
      assert.equal(run.get().flags['career-thesis-'+career],true);
      run.act('narrative:back');
      assert.equal(run.get().sceneId,'s09-intro');
      assert.equal(run.get().flags['skogafoss-voice-'+voice],undefined);
      run.act('narrative:choose:s09-voice-choice:'+voice);
      run.advance('s09-'+voice);
      run.advance('s09-common-a');
      const before=JSON.stringify(run.get());
      const wrong=career==='people'?'place':'people';
      run.act('narrative:choose:s09-career-dispatch:'+wrong);
      assert.equal(JSON.stringify(run.get()),before,'guard must reject incorrect thesis');
      run.act('narrative:choose:s09-career-dispatch:'+career);
      assert.equal(run.get().sceneId,'s09-career-'+(career==='own-choice'?'own':career));
      assert.deepEqual(Object.keys(run.get().flags).filter(x=>x.startsWith('skogafoss-voice-')),['skogafoss-voice-'+voice]);
      const current=run.get();
      let restored={narrative:JSON.parse(JSON.stringify(current))};
      run.update({deltaMs:16,state:restored,inputs:[{schemaVersion:1,type:'pointer',action:'narrative:next:'+scene(current.sceneId).beats[0].id,phase:'up',timestamp:92,source:'renderer'}],setState(next){restored=next;}});
      assert.equal(restored.narrative.sceneId,'s09-common-b');
      assert.equal(restored.narrative.flags['skogafoss-voice-'+voice],true);
      assert.equal(restored.narrative.flags['career-thesis-'+career],true);
      run.advance(current.sceneId);
      run.advance('s09-common-b');
      assert.equal(run.get().sceneId,'s09-m3-end');
    }
  }
});

test('S09 does not enable optional Ludory Economy E5', () => {
  assert.equal(existsSync(new URL('../game/config/economy.json',import.meta.url)),false);
  assert.equal(existsSync(new URL('../game/config/premium.json',import.meta.url)),false);
  assert.deepEqual(catalogData.interactions,[]);
  for (const id of Object.keys(proof)) for (const beat of scene(id)?.beats ?? []) {
    if (beat.type !== 'choice') continue;
    for (const option of beat.choices) assert.equal(option.cost,undefined);
  }
});
