import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog,
  createNarrativeState, createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Independent authorial S17/EP05 paragraph counts. The source hashes are
// pinned below after separate verification against the original manuscript.
const originalCounts = {
  's17-intro': 27,
  's17-n-a': 5, 's17-n-b': 3, 's17-n-c': 4,
  's17-common-a': 1,
  's17-e-a': 2, 's17-e-b': 2,
  's17-d-a': 4, 's17-d-b': 4,
  's17-group-a': 5, 's17-group-b': 6,
  's17-group-c': 5, 's17-group-d': 2,
  's17-common-b': 4,
};
const sourceHashes = {
  's17-intro': '42cb79c2e4c44c788316101e72dbdf8fba9b9dbe0b748d041cf87af2bad0eb6e',
  's17-n-a': 'edde411b13c8fb98451b1e4e9e79971918a54a44e39b8decf61e61f86db0bc90',
  's17-n-b': '9044dc327d339724830917f28c4d20828f16f573266231a834a904a903d1e40e',
  's17-n-c': 'cf550b94b5a028aae017f3c1ffaef07a70b6cda02d87de81387999183962d8c8',
  's17-common-a': '69ca44131871e552893ea217a2d32dca631e20c904155b855c8a479c6b016c13',
  's17-e-a': '03a8b23c626f0c26cd95ae68793a4720748a5587151c21273c1df3a421100705',
  's17-e-b': 'e84a8469cab7acc20f088dcf6e25d5535a56075afeeb8a56bb0d77ee42a8f6b8',
  's17-d-a': '7e0a2f0fa9cac07676e1c4f193d939b5061b51086e170221c1f898b338c1a9a9',
  's17-d-b': '3135b66f3c2e78c250c835c5efca18b8949e2ae84013a4bc342b3646e58ce71a',
  's17-group-a': '823ae6c980e13b8738172e537217158bcec1ce3ba0238c5f9bedace23cb47013',
  's17-group-b': 'b78b86ad23108a4f2f78f674a58d311fbd428b95f0539bfb2168b21e4847c5a8',
  's17-group-c': 'b7b5a2910d756c4efed85319c728a6b58b9f8eb77f6b9fc7d5e5a34ae5f74e32',
  's17-group-d': '254c86fe881aeb4efe425bd75d76c7def5c8f869a5c7076a406d6536a8e92687',
  's17-common-b': '389e020eed3caa10095b8fa21acef07da478202ba71600ad8fa3a8be7af2c9d4',
};
const scene = id => graphData.scenes.find(s => s.id === id);
const shown = id => (scene(id)?.beats ?? []).filter(b => b.type === 'dialogue').map(b => b.text.ru);
const choices = id => scene(id).beats.find(b => b.type === 'choice');
const guard = (id, values) => {
  assert.deepEqual(choices(id).choices.map(c => [c.id, c.targetSceneId, c.when?.flag]), values);
  for (const c of choices(id).choices) assert.equal(c.effects, undefined);
};

test('S17 renders 74 exact original paragraphs in 14 distinct prose blocks', () => {
  assert.equal(Object.values(originalCounts).reduce((n, x) => n + x, 0), 74);
  for (const [id, count] of Object.entries(originalCounts)) {
    const paragraphs = shown(id);
    assert.equal(paragraphs.length, count, id);
    assert.equal(createHash('sha256').update(paragraphs.join('\n\n')).digest('hex'), sourceHashes[id], id);
    assert.ok(paragraphs.every(p => !p.includes('Технический переход') &&
      !p.startsWith('Выбор S17-')), id);
  }
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
});

test('S16 enters S17 and three consent-sensitive callbacks are exclusive and effect-free', () => {
  assert.equal(scene('s16-common').nextSceneId, 's17-intro');
  assert.equal(scene('s16-m3-end'), undefined);
  guard('s17-n-dispatch', [
    ['a', 's17-n-a', 'nick-failure-private'],
    ['b', 's17-n-b', 'nick-failure-observed'],
    ['c', 's17-n-c', 'nick-failure-shared-file'],
  ]);
  guard('s17-e-dispatch', [
    ['a', 's17-e-a', 'alice-leads-editor'],
    ['b', 's17-e-b', 'alice-leads-shared'],
  ]);
  guard('s17-d-dispatch', [
    ['a', 's17-d-a', 'damir-space-tea'],
    ['b', 's17-d-b', 'damir-space-room'],
  ]);
  for (const id of ['s17-n-a','s17-n-b','s17-n-c'])
    assert.equal(scene(id).nextSceneId, 's17-common-a');
  for (const id of ['s17-e-a','s17-e-b'])
    assert.equal(scene(id).nextSceneId, 's17-d-dispatch');
  for (const id of ['s17-d-a','s17-d-b'])
    assert.equal(scene(id).nextSceneId, 's17-group-choice-scene');
  assert.equal(scene('s17-common-a').nextSceneId, 's17-e-dispatch');
});

test('S17-C1 and S17-C2 each have four free authored paths, without route lock', () => {
  const group = choices('s17-group-choice-scene');
  assert.equal(group.id, 's17-group-choice');
  assert.deepEqual(group.choices.map(c => [c.id, c.targetSceneId, c.effects]), [
    ['a','s17-group-a',[{op:'flag_set',id:'s17-group-plan',value:true}]],
    ['b','s17-group-b',[{op:'flag_set',id:'s17-group-laundry',value:true}]],
    ['c','s17-group-c',[{op:'flag_set',id:'s17-group-kitchen',value:true}]],
    ['d','s17-group-d',[{op:'flag_set',id:'s17-group-break',value:true}]],
  ]);
  for (const id of ['a','b','c','d'])
    assert.equal(scene('s17-group-'+id).nextSceneId, 's17-common-b');
  const evening = choices('s17-common-b');
  assert.equal(evening.id, 's17-evening-choice');
  assert.deepEqual(evening.choices.map(c=>[c.id,c.targetSceneId,c.effects]), [
    ['eric','s18-intro',[{op:'flag_set',id:'s17-evening-eric',value:true}]],
    ['nick','s19-intro',[{op:'flag_set',id:'s17-evening-nick',value:true}]],
    ['damir','s20-intro',[{op:'flag_set',id:'s17-evening-damir',value:true}]],
    ['self','s21-intro',[{op:'flag_set',id:'s17-evening-self',value:true}]],
  ]);
  for(const option of [...group.choices,...evening.choices])
    for(const forbidden of ['cost','premium','romancePoints','routeLock','requiredEntitlement','publishPermission','consentToPublish','contentId'])
      assert.equal(option[forbidden], undefined, forbidden);
  assert.equal(scene('s21-m3-end'),undefined);
  assert.equal(scene('s21-intro').nextSceneId,'s21-choice-note');
  assert.equal(scene('s22-after-m3-end'),undefined);
  assert.equal(scene('s23-after-m3-end'),undefined);
  assert.equal(scene('s24-after-m3-end'),undefined);
  assert.equal(scene('s25-after-m3-end').beats[0].type,'ending');
  for(const id of ['s18','s19','s20']){
    assert.equal(scene(id+'-m3-end'),undefined);
    assert.equal(scene(id+'-after-m3-end'),undefined);
  }
});

const standardRoute = {
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
  's14-gesture-choice':'walk','s15-voice-dispatch':'damir',
  's15-privacy-choice':'a','s15-gesture-dispatch':'walk',
  's16-care-choice':'a',
};

function runtime(snapshot) {
  const graph = defineNarrativeGraph(graphData);
  const catalog = defineNarrativeCatalog(catalogData);
  const update = createNarrativeRuntimeUpdate({graph,catalog});
  let state = {narrative: JSON.parse(JSON.stringify(snapshot ?? createNarrativeState(graph)))};
  const act = action => update({deltaMs:16,state,inputs:[{schemaVersion:1,type:'pointer',
    action,phase:'up',timestamp:171,source:'renderer'}],setState(s){state=s;}});
  const advance = id => {
    assert.equal(state.narrative.sceneId, id);
    for(const beat of scene(id).beats.filter(b => b.type==='dialogue'))
      act('narrative:next:'+beat.id);
  };
  return {graph,catalog,act,advance,get:()=>state.narrative};
}

function beforeS17({nick='a',editor='editor',damir='a'}={}) {
  const run=runtime();
  const route={...standardRoute,
    's13-work-choice':editor, 's15-privacy-choice':nick,'s16-care-choice':damir};
  for(let i=0;i<5000 && run.get().sceneId!=='s17-intro';i++){
    const {sceneId,beatIndex}=run.get();
    const beat=scene(sceneId)?.beats[beatIndex];
    const previous=sceneId+':'+beatIndex+':'+run.get().actionLog.length;
    assert.ok(beat,sceneId+':'+beatIndex);
    if(beat.type==='dialogue')run.act('narrative:next:'+beat.id);
    else if(beat.type==='choice') {
      assert.ok(route[beat.id], 'unmapped '+beat.id);
      run.act('narrative:choose:'+beat.id+':'+route[beat.id]);
    } else assert.fail('premature ending: '+sceneId);
    const next=run.get();
    assert.notEqual(next.sceneId+':'+next.beatIndex+':'+next.actionLog.length,
      previous,'stalled N1 action at '+sceneId+':'+beatIndex);
  }
  assert.equal(run.get().sceneId,'s17-intro');
  return run;
}

test('real N1: all 3×2×2 prior branches, guarded actions, Back and JSON restoration', () => {
  const nickFlags={a:'nick-failure-private',b:'nick-failure-observed',c:'nick-failure-shared-file'};
  for(const nick of ['a','b','c'])for(const editor of ['editor','shared'])for(const damir of ['a','b']) {
    const run=beforeS17({nick,editor,damir});
    run.advance('s17-intro');
    const before=JSON.stringify(run.get());
    const opposite={a:'b',b:'a',c:'a'}[nick];
    run.act('narrative:choose:s17-n-dispatch:'+opposite);
    assert.equal(JSON.stringify(run.get()),before,'reject other Nick response');
    run.act('narrative:choose:s17-n-dispatch:'+nick);
    assert.equal(run.get().sceneId,'s17-n-'+nick);
    run.advance('s17-n-'+nick);
    if(nick==='c' && editor==='shared' && damir==='b') {
      const saved=JSON.parse(JSON.stringify(run.get()));
      assert.ok(saved.actionLog.some(entry=>entry.type==='choose' &&
        entry.beatId==='s17-n-dispatch' && entry.optionId==='c'));
      const bad=[
        {...saved,flags:{...saved.flags,'nick-failure-private':true}},
        {...saved,flags:Object.fromEntries(
          Object.entries(saved.flags).filter(([k])=>k!=='nick-failure-shared-file'))},
        {...saved,actionLog:saved.actionLog.map(entry=>
          entry.type==='choose' && entry.beatId==='s17-n-dispatch'
            ? {...entry,optionId:'a'} : entry)},
        {...saved,actionLog:saved.actionLog.slice(0,-1)},
      ];
      for(const invalid of bad)assert.throws(()=>createNarrativeRuntimeUpdate({
        graph:run.graph,catalog:run.catalog})({
          deltaMs:16,state:{narrative:invalid},inputs:[{schemaVersion:1,type:'pointer',
            action:'narrative:next:'+scene('s17-common-a').beats[0].id,
            phase:'up',timestamp:172,source:'renderer'}],setState(){},
        }),/inconsistent actionLog provenance or position|unavailable choice/);
    }
    run.advance('s17-common-a');
    const e=editor==='editor'?'a':'b';
    run.act('narrative:choose:s17-e-dispatch:'+(e==='a'?'b':'a'));
    assert.equal(run.get().sceneId,'s17-e-dispatch');
    run.act('narrative:choose:s17-e-dispatch:'+e);
    run.advance('s17-e-'+e);
    run.act('narrative:choose:s17-d-dispatch:'+(damir==='a'?'b':'a'));
    assert.equal(run.get().sceneId,'s17-d-dispatch');
    run.act('narrative:choose:s17-d-dispatch:'+damir);
    run.advance('s17-d-'+damir);
    assert.equal(run.get().sceneId,'s17-group-choice-scene');
    assert.equal(run.get().flags[nickFlags[nick]],true);
    assert.equal(run.get().flags[editor==='editor'?'alice-leads-editor':'alice-leads-shared'],true);
    assert.equal(run.get().flags[damir==='a'?'damir-space-tea':'damir-space-room'],true);
    assert.equal(run.get().flags['private-text-'+({a:'declined',b:'limited',c:'pending'}[nick])],true);
    assert.equal(run.get().routeLock,null);
    const restored=runtime(JSON.parse(JSON.stringify(run.get())));
    restored.act('narrative:choose:s17-group-choice:a');
    assert.equal(restored.get().sceneId,'s17-group-a');
    restored.act('narrative:back');
    assert.equal(restored.get().sceneId,'s17-group-choice-scene');
    assert.equal(restored.get().flags['s17-group-plan'],undefined);
  }
});

test('real N1: independent group and evening choices stay reversible and free',()=>{
  const run=beforeS17({nick:'c',editor:'shared',damir:'b'});
  run.advance('s17-intro');
  run.act('narrative:choose:s17-n-dispatch:c');
  run.advance('s17-n-c');
  run.advance('s17-common-a');
  run.act('narrative:choose:s17-e-dispatch:b');
  run.advance('s17-e-b');
  run.act('narrative:choose:s17-d-dispatch:b');
  run.advance('s17-d-b');
  const base=JSON.parse(JSON.stringify(run.get()));
  for(const group of ['a','b','c','d'])for(const evening of ['eric','nick','damir','self']){
    const path=runtime(base);
    path.act('narrative:choose:s17-group-choice:'+group);
    assert.equal(path.get().sceneId,'s17-group-'+group);
    path.advance('s17-group-'+group);
    path.advance('s17-common-b');
    path.act('narrative:choose:s17-evening-choice:'+evening);
    assert.equal(path.get().sceneId,{'eric':'s18-intro','nick':'s19-intro',
      'damir':'s20-intro','self':'s21-intro'}[evening]);
    assert.equal(path.get().flags['s17-evening-'+evening],true);
    assert.equal(path.get().routeLock,null);
    assert.equal(path.get().flags['private-text-pending'],true);
    path.act('narrative:back');
    assert.equal(path.get().sceneId,'s17-common-b');
    assert.equal(path.get().flags['s17-evening-'+evening],undefined);
  }
});

test('economy remains absent from first novel',()=>{
  assert.equal(existsSync(new URL('../game/config/economy.json',import.meta.url)),false);
  assert.equal(existsSync(new URL('../game/config/premium.json',import.meta.url)),false);
  assert.deepEqual(catalogData.interactions,[]);
});
