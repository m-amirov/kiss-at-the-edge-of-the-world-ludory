import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Independently derived from original EP07 S30/S55 (lines 279–378), not game code.
// SHA-256 includes only player-facing paragraph text joined with two newlines.
const original = {
  's30-intro': [8, 'ecde3ad9d632086822c171a386fc0db8ea15c7a281d77bac23754d3c232982b8'],
  's30-c1-a': [2, '9f48cc4c33b1edb517ba2d7903d0b8b714711bb1db4d24c403fbcd92d3179802'],
  's30-c1-b': [3, '76d1fc4debe0b2243942fd20dd049aa76859335da49aa162a914a81554890c88'],
  's30-common': [1, 'fc428366bc77e2a8239c36f83d4c0eb7976a49c207eee632852e9c568538d2f2'],
  's30-c2-a': [1, '7a55701bc61352839a722819bf4318097ee1ba19751784665f3a11458ff9d971'],
  's30-c2-b': [1, '51f9a777fab6cf329ca19dc09c60c7d96a3b66b134f75e6dbd6aa9c7457951c2'],
  's55-intro': [8, '763f69fb39f1e75ea587117ecf0d09ce8857fec885e04ca336bf3bb6cdd66347'],
  's55-c1-a': [1, '45fe5fb4ce3cd152e29fe7721967dfb4a2a4ce33e627a1f18684ca8f5620b08c'],
  's55-c1-b': [2, 'ed5c327c8a23ef78f81ce3ddfdf3a55570b58fa079b486e68c876ef5867e2fc0'],
  's55-common': [1, '2c2e3f9750bb7c441bf4989c9671a7708f68eeec4b34f399a05b52c4115fcd0c'],
  's55-callback-a': [1, '44549dae25a5d6b289ec6cd574a4acdb9d53a49696422b31011cd2c60794f1ce'],
  's55-callback-b': [1, '4a5d46916d3a15dd9f697f7ad147931e0b982618bbca0c33d20a4cea4fa095f0'],
};
const routes = ['eric', 'nick', 'damir', 'alice'];
const scene = (id) => graphData.scenes.find((item) => item.id === id);
const choice = (id, beatId) => scene(id)?.beats.find((beat) => beat.id === beatId);
const prose = (id) => (scene(id)?.beats ?? []).filter((beat) => beat.type === 'dialogue')
  .map((beat) => beat.text.ru);
const clone = (value) => JSON.parse(JSON.stringify(value));

test('S30/S55 preserve all 12 original blocks and 30 paragraphs verbatim', () => {
  assert.equal(Object.keys(original).length, 12);
  assert.equal(Object.values(original).reduce((sum, [count]) => sum + count, 0), 30);
  for (const [id, [count, hash]] of Object.entries(original)) {
    const paragraphs = prose(id);
    assert.equal(paragraphs.length, count, `${id} original paragraph count`);
    assert.equal(createHash('sha256').update(paragraphs.join('\n\n')).digest('hex'),
      hash, `${id} original text SHA-256`);
  }
});

test('S30/S55 add only Damir-locked route, three free choices and exact guarded payoff', () => {
  const gate = choice('s59-route-dispatch', 's59-route-choice');
  assert.deepEqual(gate.choices.map(({ id, routeId, targetSceneId, effects }) =>
    [id, routeId, targetSceneId, effects]), [
    ['eric', 'eric', 's28-intro', undefined],
    ['nick', 'nick', 's29-intro', undefined],
    ['damir', 'damir', 's30-intro', undefined],
    ['alice', 'alice', 's31-intro', undefined],
  ]);
  for (const option of gate.choices) assert.equal(option.label.ru, 'Продолжить');
  const authored = [
    ['s30-intro', 's30-c1-choice', [
      ['a', 'Поздравить его и предложить обсудить варианты позже', 's30-c1-a'],
      ['b', 'Попросить сразу назвать важные даты и не строить общих планов до них', 's30-c1-b'],
    ]],
    ['s30-common', 's30-c2-choice', [
      ['a', 'Предложить ему выбрать новую песню для совместной прогулки', 's30-c2-a'],
      ['b', 'Позвать его в магазин за смешными сувенирами', 's30-c2-b'],
    ]],
    ['s55-intro', 's55-c1-choice', [
      ['a', 'Поддразнить Дамира фотографией', 's55-c1-a'],
      ['b', 'Сказать, что ей понравилось видеть его таким', 's55-c1-b'],
    ]],
  ];
  for (const [id, beatId, expected] of authored) {
    const options = choice(id, beatId).choices;
    assert.deepEqual(options.map(({ id: optionId, label, targetSceneId }) =>
      [optionId, label.ru, targetSceneId]), expected);
    for (const option of options) {
      for (const forbidden of ['premium', 'cost', 'requiredEntitlement', 'routeId',
        'romancePoints', 'publishPermission', 'mediaPermission', 'consentToPublish',
        'relocationConsent', 'clinicContract', 'photoPublishApproved']) {
        assert.equal(option[forbidden], undefined, `${beatId}.${option.id}: ${forbidden}`);
      }
      if (beatId === 's30-c2-choice') assert.ok(option.effects.every(({ op }) => op === 'flag_set'));
      else assert.equal(option.effects, undefined);
    }
  }
  assert.deepEqual(choice('s30-common', 's30-c2-choice').choices.map(({ effects }) => effects), [
    [{ op: 'flag_set', id: 's30-time-song', value: true }],
    [{ op: 'flag_set', id: 's30-time-souvenirs', value: true }],
  ]);
  for (const id of ['a', 'b']) {
    assert.equal(scene(`s30-c1-${id}`).nextSceneId, 's30-common');
    assert.equal(scene(`s30-c2-${id}`).nextSceneId, 's55-intro');
    assert.equal(scene(`s55-c1-${id}`).nextSceneId, 's55-common');
    assert.equal(scene(`s55-callback-${id}`).nextSceneId, 's34-intro');
  }
  assert.equal(scene('s55-common').nextSceneId, 's55-callback-dispatch');
  assert.deepEqual(choice('s55-callback-dispatch', 's55-callback-choice').choices
    .map(({ id, label, targetSceneId, when, effects }) =>
      [id, label.ru, targetSceneId, when, effects]), [
    ['a', 'Продолжить', 's55-callback-a', { flag: 's30-time-song' }, undefined],
    ['b', 'Продолжить', 's55-callback-b', { flag: 's30-time-souvenirs' }, undefined],
  ]);
  assert.equal(scene('s55-after-m3-end'), undefined);
  assert.deepEqual(catalogData.interactions, []);
});

// Real N1 replay from S01: these maps contain authored decisions, not injected flags.
const preS17 = {
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
const afterS17 = {
  's21-letter-choice':'own','s21-reply-choice':'c',
  's21-followup-choice':'friend','s61-editor-choice':'c',
  's61-day-choice':'alone-longer','s61-followup-payoff-choice':'friend',
  's22-weather-choice':'damir','s22-repair-choice':'roles',
  's22-stop-choice':'group','s23-repair-choice':'roles',
  's23-stop-choice':'group','s23-open-choice':'read-page',
  's23-evening-choice':'alice','s23-contact-choice':'skip',
  's23-followup-choice':'skip','s24-evening-choice':'alice',
  's24-contact-choice':'skip','s24-nick-choice':'no-review',
  's24-followup-choice':'skip','s25-evening-choice':'alice',
  's25-contact-choice':'skip','s25-damir-choice':'scheduled-talk',
  's25-eric-choice':'page','s25-followup-choice':'skip',
};
function runtime(snapshot) {
  const graph = defineNarrativeGraph(graphData);
  const catalog = defineNarrativeCatalog(catalogData);
  const update = createNarrativeRuntimeUpdate({ graph, catalog });
  let state = { narrative: clone(snapshot ?? createNarrativeState(graph)) };
  let writes = 0;
  return {
    graph, catalog,
    act(action) {
      update({ deltaMs: 16, state, inputs: [{ schemaVersion: 1, type: 'pointer',
        action, phase: 'up', timestamp: 204, source: 'renderer' }],
      setState(next) { writes += 1; state = next; } });
    },
    get: () => state.narrative,
    writes: () => writes,
  };
}
function walkUntil(run, stop, actions = {}, max = 7500) {
  for (let i = 0; i < max; i++) {
    const { sceneId, beatIndex } = run.get();
    const beat = scene(sceneId)?.beats[beatIndex];
    assert.ok(beat, `missing beat ${sceneId}:${beatIndex}`);
    if (stop(beat, sceneId)) return;
    const before = `${sceneId}:${beatIndex}`;
    if (beat.type === 'dialogue') run.act(`narrative:next:${beat.id}`);
    else if (beat.type === 'choice') {
      assert.ok(actions[beat.id], `unmapped choice ${beat.id}`);
      run.act(`narrative:choose:${beat.id}:${actions[beat.id]}`);
    } else assert.fail(`premature ending ${sceneId}`);
    assert.notEqual(`${run.get().sceneId}:${run.get().beatIndex}`, before, `stalled ${before}`);
  }
  assert.fail('narrative traversal limit exceeded');
}
function checkpointS26() {
  const run = runtime();
  walkUntil(run, (beat) => beat.id === 's17-evening-choice', preS17);
  run.act('narrative:choose:s17-evening-choice:self');
  walkUntil(run, (_beat, id) => id === 's58-intro', afterS17);
  walkUntil(run, (beat) => beat.id === 's58-shop-choice');
  run.act('narrative:choose:s58-shop-choice:alone');
  walkUntil(run, (beat) => beat.id === 's58-payoff-choice');
  run.act('narrative:choose:s58-payoff-choice:other');
  walkUntil(run, (beat) => beat.id === 's26-route-choice');
  return clone(run.get());
}
function rejectWithoutWrite(run, action) {
  const before = JSON.stringify(run.get());
  const writes = run.writes();
  run.act(action);
  assert.equal(JSON.stringify(run.get()), before, `${action}: changed rejected state`);
  assert.equal(run.writes(), writes, `${action}: rejected action wrote state`);
}

test('real N1 S59 accepts only the locked Damir route and preserves other routes', () => {
  const checkpoint = checkpointS26();
  for (const route of routes) {
    const run = runtime(checkpoint);
    run.act(`narrative:choose:s26-route-choice:${route}`);
    walkUntil(run, (beat) => beat.id === `s26-${route}-evening-choice`);
    run.act(`narrative:choose:s26-${route}-evening-choice:self`);
    walkUntil(run, (beat) => beat.id === 's27-work-choice');
    run.act('narrative:choose:s27-work-choice:inga');
    walkUntil(run, (beat) => beat.id === 's59-song-choice');
    run.act('narrative:choose:s59-song-choice:nick');
    walkUntil(run, (beat) => beat.id === 's59-route-choice');
    assert.equal(run.get().routeLock, route);
    for (const other of routes.filter((id) => id !== route)) {
      rejectWithoutWrite(run, `narrative:choose:s59-route-choice:${other}`);
    }
    const before = JSON.stringify(run.get());
    run.act(`narrative:choose:s59-route-choice:${route}`);
    const expected = route === 'damir' ? 's30-intro'
      : route === 'nick' ? 's29-intro'
        : route === 'eric' ? 's28-intro' : 's31-intro';
    assert.equal(run.get().sceneId, expected);
    run.act('narrative:back');
    assert.equal(JSON.stringify(run.get()), before);
    run.act(`narrative:choose:s59-route-choice:${route}`);
    const loaded = runtime(clone(run.get()));
    assert.equal(loaded.get().sceneId, expected);
    assert.equal(loaded.get().routeLock, route);
    assert.equal(loaded.get().routeIntent, route);
  }
});

test('real N1 Damir: all 2×2×2×3 outcomes, Back, callback and JSON restore', () => {
  const run = runtime(checkpointS26());
  run.act('narrative:choose:s26-route-choice:damir');
  walkUntil(run, (beat) => beat.id === 's26-damir-evening-choice');
  run.act('narrative:choose:s26-damir-evening-choice:self');
  walkUntil(run, (beat) => beat.id === 's27-work-choice');
  run.act('narrative:choose:s27-work-choice:bags');
  walkUntil(run, (beat) => beat.id === 's59-song-choice');
  run.act('narrative:choose:s59-song-choice:eric');
  walkUntil(run, (beat) => beat.id === 's59-route-choice');
  run.act('narrative:choose:s59-route-choice:damir');
  walkUntil(run, (beat) => beat.id === 's30-c1-choice');
  const start = clone(run.get());
  for (const letter of ['a', 'b']) for (const time of ['a', 'b']) {
    const branch = runtime(start);
    rejectWithoutWrite(branch, 'narrative:choose:s30-c1-choice:premium');
    branch.act(`narrative:choose:s30-c1-choice:${letter}`);
    walkUntil(branch, (beat) => beat.id === 's30-c2-choice');
    const beforeTime = JSON.stringify(branch.get());
    const alternate = time === 'a' ? 'b' : 'a';
    branch.act(`narrative:choose:s30-c2-choice:${alternate}`);
    branch.act('narrative:back');
    assert.equal(JSON.stringify(branch.get()), beforeTime, 'Back removes alternate time choice');
    branch.act(`narrative:choose:s30-c2-choice:${time}`);
    assert.equal(branch.get().flags[time === 'a' ? 's30-time-song' : 's30-time-souvenirs'], true);
    assert.equal(branch.get().flags[time === 'a' ? 's30-time-souvenirs' : 's30-time-song'], undefined);
    walkUntil(branch, (beat) => beat.id === 's55-c1-choice');
    const beforeS55 = JSON.stringify(branch.get());
    for (const reply of ['a', 'b']) {
      const chosen = runtime(clone(branch.get()));
      const other = reply === 'a' ? 'b' : 'a';
      chosen.act(`narrative:choose:s55-c1-choice:${other}`);
      chosen.act('narrative:back');
      assert.equal(JSON.stringify(chosen.get()), beforeS55, 'Back restores S55 choice');
      chosen.act(`narrative:choose:s55-c1-choice:${reply}`);
      walkUntil(chosen, (beat) => beat.id === 's55-callback-choice');
      rejectWithoutWrite(chosen,
        `narrative:choose:s55-callback-choice:${alternate}`);
      chosen.act(`narrative:choose:s55-callback-choice:${time}`);
      assert.equal(chosen.get().sceneId, `s55-callback-${time}`);
      walkUntil(chosen, (beat) => beat.id === 's34-c1-choice');
      const beforeS34 = JSON.stringify(chosen.get());
      for (const status of ['a', 'b', 'c']) {
        const statusRun = runtime(clone(chosen.get()));
        const alternateStatus = status === 'a' ? 'c' : 'a';
        rejectWithoutWrite(statusRun, 'narrative:choose:s34-c1-choice:premium');
        statusRun.act(`narrative:choose:s34-c1-choice:${alternateStatus}`);
        statusRun.act('narrative:back');
        assert.equal(JSON.stringify(statusRun.get()), beforeS34, 'Back restores S34 choice');
        statusRun.act(`narrative:choose:s34-c1-choice:${status}`);
        for (const flag of ['a', 'b', 'c']) {
          assert.equal(statusRun.get().flags[`s34-status-${{ a: 'active', b: 'paused', c: 'closed' }[flag]}`],
            flag === status ? true : undefined);
        }
        const fresh = runtime(clone(statusRun.get()));
        walkUntil(fresh, (beat) => beat.id === 's34-status-choice');
        const allowed = status;
        rejectWithoutWrite(fresh, 'narrative:choose:s34-status-choice:' + (status === 'a' ? 'b' : 'a'));
        fresh.act('narrative:choose:s34-status-choice:' + allowed);
        if (status === 'c') {
          assert.equal(fresh.get().sceneId, 's35-intro');
          if (letter === 'a' && time === 'a' && reply === 'a') {
            walkUntil(fresh, (beat) => beat.id === 's35-c1-choice');
            fresh.act('narrative:choose:s35-c1-choice:a');
            walkUntil(fresh, (beat) => beat.id === 's63-c1-choice');
            fresh.act('narrative:choose:s63-c1-choice:a');
            walkUntil(fresh, (beat) => beat.id === 's63-c2-choice');
            fresh.act('narrative:choose:s63-c2-choice:b');
            const closed = runtime(clone(fresh.get()));
            walkUntil(closed, (beat) => beat.id === 's36-c1-choice');
            rejectWithoutWrite(closed, 'narrative:choose:s36-c1-choice:premium');
            const before = JSON.stringify(closed.get());
            closed.act('narrative:choose:s36-c1-choice:a');
            closed.act('narrative:back');
            assert.equal(JSON.stringify(closed.get()), before, 'Damir-closed S36 Back');
            closed.act('narrative:choose:s36-c1-choice:b');
            const atEnd = runtime(clone(closed.get()));
            walkUntil(atEnd, (beat) => beat.id === 's36-after-m3-end-beat');
            assert.equal(atEnd.get().routeLock, 'damir');
            assert.equal(atEnd.get().flags['s34-status-closed'], true);
            assert.equal(atEnd.get().flags['s34-status-active'], undefined);
            assert.equal(atEnd.get().flags['s34-status-paused'], undefined);
            assert.equal(atEnd.get().flags['s63-next-venue'], true);
            assert.equal(atEnd.get().flags['s63-next-ticket'], undefined);
            assert.deepEqual(atEnd.get().flags, closed.get().flags);
          }
        } else {
          assert.equal(fresh.get().sceneId, status === 'a' ? 's56-active' : 's56-paused');
          walkUntil(fresh, (beat) => beat.id === 's56-c1-choice');
          fresh.act('narrative:choose:s56-c1-choice:a');
          walkUntil(fresh, (beat) => beat.id === 's56-c2-choice');
          fresh.act('narrative:choose:s56-c2-choice:a');
          walkUntil(fresh, (beat) => beat.id === 's36-c1-choice');
          rejectWithoutWrite(fresh, 'narrative:choose:s36-c1-choice:premium');
          fresh.act('narrative:choose:s36-c1-choice:a');
          walkUntil(fresh, (beat) => beat.id === 's36-after-m3-end-beat');
          assert.equal(fresh.get().flags['s56-next-dish'], true);
          assert.equal(fresh.get().flags['s56-next-chorus'], undefined);
        }
        assert.equal(fresh.get().routeIntent, 'damir');
        assert.equal(fresh.get().routeLock, 'damir');
        assert.equal(fresh.get().flags[time === 'a' ? 's30-time-song' : 's30-time-souvenirs'], true);
        assert.equal(fresh.get().flags[time === 'a' ? 's30-time-souvenirs' : 's30-time-song'], undefined);
        for (const forbidden of ['s30-relocation-approved', 'clinic-contract-signed',
          'damir-photo-publish-approved', 'media-release-approved', 's30-premium'])
          assert.equal(fresh.get().flags[forbidden], undefined);
        assert.equal(fresh.get().flags['beach-footage-safe-only'], true);
      }
    }
  }
});

test('real N1 S56 active/paused: both music decisions, Back and JSON retain S39 payoff', () => {
  const run = runtime(checkpointS26());
  run.act('narrative:choose:s26-route-choice:damir');
  walkUntil(run, (beat) => beat.id === 's26-damir-evening-choice');
  run.act('narrative:choose:s26-damir-evening-choice:self');
  walkUntil(run, (beat) => beat.id === 's27-work-choice');
  run.act('narrative:choose:s27-work-choice:inga');
  walkUntil(run, (beat) => beat.id === 's59-song-choice');
  run.act('narrative:choose:s59-song-choice:damir');
  walkUntil(run, (beat) => beat.id === 's59-route-choice');
  run.act('narrative:choose:s59-route-choice:damir');
  walkUntil(run, (beat) => beat.id === 's30-c1-choice');
  run.act('narrative:choose:s30-c1-choice:a');
  walkUntil(run, (beat) => beat.id === 's30-c2-choice');
  run.act('narrative:choose:s30-c2-choice:b');
  walkUntil(run, (beat) => beat.id === 's55-c1-choice');
  run.act('narrative:choose:s55-c1-choice:b');
  walkUntil(run, (beat) => beat.id === 's55-callback-choice');
  run.act('narrative:choose:s55-callback-choice:b');
  walkUntil(run, (beat) => beat.id === 's34-c1-choice');
  const checkpoint = clone(run.get());
  for (const status of ['a', 'b']) {
    const statusRun = runtime(checkpoint);
    statusRun.act('narrative:choose:s34-c1-choice:' + status);
    walkUntil(statusRun, (beat) => beat.id === 's34-status-choice');
    rejectWithoutWrite(statusRun,
      'narrative:choose:s34-status-choice:' + (status === 'a' ? 'c' : 'a'));
    statusRun.act('narrative:choose:s34-status-choice:' + status);
    walkUntil(statusRun, (beat) => beat.id === 's56-c1-choice');
    const beforeC1 = JSON.stringify(statusRun.get());
    for (const music of ['a', 'b']) for (const next of ['a', 'b']) {
      const branch = runtime(clone(statusRun.get()));
      branch.act('narrative:choose:s56-c1-choice:' + (music === 'a' ? 'b' : 'a'));
      branch.act('narrative:back');
      assert.equal(JSON.stringify(branch.get()), beforeC1);
      branch.act('narrative:choose:s56-c1-choice:' + music);
      walkUntil(branch, (beat) => beat.id === 's56-c2-choice');
      const beforeC2 = JSON.stringify(branch.get());
      branch.act('narrative:choose:s56-c2-choice:' + (next === 'a' ? 'b' : 'a'));
      branch.act('narrative:back');
      assert.equal(JSON.stringify(branch.get()), beforeC2);
      branch.act('narrative:choose:s56-c2-choice:' + next);
      const fresh = runtime(clone(branch.get()));
      walkUntil(fresh, (beat) => beat.id === 's36-c1-choice');
      const beforeS36 = JSON.stringify(fresh.get());
      fresh.act('narrative:choose:s36-c1-choice:' + (next === 'a' ? 'b' : 'a'));
      fresh.act('narrative:back');
      assert.equal(JSON.stringify(fresh.get()), beforeS36, 'S36-C1 Back on Damir route');
      fresh.act('narrative:choose:s36-c1-choice:' + next);
      const throughS36 = runtime(clone(fresh.get()));
      walkUntil(throughS36, (beat) => beat.id === 's36-after-m3-end-beat');
      assert.equal(fresh.get().routeLock, 'damir');
      assert.equal(throughS36.get().routeLock, 'damir');
      assert.equal(fresh.get().flags[status === 'a' ? 's34-status-active' : 's34-status-paused'], true);
      assert.equal(fresh.get().flags[next === 'a' ? 's56-next-dish' : 's56-next-chorus'], true);
      assert.equal(fresh.get().flags[next === 'a' ? 's56-next-chorus' : 's56-next-dish'], undefined);
      assert.equal(fresh.get().flags['s34-status-closed'], undefined);
    }
  }
});

test('real N1 rejects forged Damir route, flags and actionLog without writes', () => {
  const run = runtime(checkpointS26());
  run.act('narrative:choose:s26-route-choice:damir');
  walkUntil(run, (beat) => beat.id === 's26-damir-evening-choice');
  run.act('narrative:choose:s26-damir-evening-choice:self');
  walkUntil(run, (beat) => beat.id === 's27-work-choice');
  run.act('narrative:choose:s27-work-choice:nick');
  walkUntil(run, (beat) => beat.id === 's59-song-choice');
  run.act('narrative:choose:s59-song-choice:damir');
  walkUntil(run, (beat) => beat.id === 's59-route-choice');
  run.act('narrative:choose:s59-route-choice:damir');
  walkUntil(run, (beat) => beat.id === 's30-c1-choice');
  run.act('narrative:choose:s30-c1-choice:b');
  walkUntil(run, (beat) => beat.id === 's30-c2-choice');
  run.act('narrative:choose:s30-c2-choice:b');
  walkUntil(run, (beat) => beat.id === 's55-c1-choice');
  run.act('narrative:choose:s55-c1-choice:a');
  walkUntil(run, (beat) => beat.id === 's55-callback-choice');
  run.act('narrative:choose:s55-callback-choice:b');
  walkUntil(run, (beat) => beat.id === 's34-c1-choice');
  run.act('narrative:choose:s34-c1-choice:b');
  walkUntil(run, (beat) => beat.id === 's34-status-choice');
  run.act('narrative:choose:s34-status-choice:b');
  walkUntil(run, (beat) => beat.id === 's56-c1-choice');
  run.act('narrative:choose:s56-c1-choice:a');
  walkUntil(run, (beat) => beat.id === 's56-c2-choice');
  run.act('narrative:choose:s56-c2-choice:b');
  const valid = clone(run.get());
  const forged = [
    { ...valid, routeLock: 'eric' },
    { ...valid, routeIntent: 'alice' },
    { ...valid, flags: { ...valid.flags, 's30-time-souvenirs': false } },
    { ...valid, flags: { ...valid.flags, 's30-time-song': true } },
    { ...valid, flags: { ...valid.flags, 's34-status-paused': false } },
    { ...valid, flags: { ...valid.flags, 's34-status-active': true } },
    { ...valid, flags: { ...valid.flags, 's56-next-chorus': false } },
    { ...valid, flags: { ...valid.flags, 's56-next-dish': true } },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's59-route-choice' ? { ...entry, optionId: 'nick' } : entry) },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's30-c2-choice' ? { ...entry, optionId: 'a' } : entry) },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's55-callback-choice' ? { ...entry, optionId: 'a' } : entry) },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's34-c1-choice' ? { ...entry, optionId: 'a' } : entry) },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's34-status-choice' ? { ...entry, optionId: 'a' } : entry) },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's56-c1-choice' ? { ...entry, optionId: 'b' } : entry) },
    { ...valid, actionLog: valid.actionLog.map((entry) =>
      entry.beatId === 's56-c2-choice' ? { ...entry, optionId: 'a' } : entry) },
  ];
  for (const invalid of forged) {
    let writes = 0;
    const before = JSON.stringify(invalid);
    const update = createNarrativeRuntimeUpdate({ graph: run.graph, catalog: run.catalog });
    assert.throws(() => update({ deltaMs: 16, state: { narrative: invalid },
      inputs: [{ schemaVersion: 1, type: 'pointer',
        action: 'narrative:next:s56-c2-b-01', phase: 'up',
        timestamp: 204, source: 'renderer' }],
      setState() { writes += 1; },
    // A forged earlier choice can change the replay path: N1 then rejects the
    // next recorded action because its beatId no longer matches that path.
    }), /inconsistent actionLog provenance or position|unavailable choice|action beat mismatch/);
    assert.equal(writes, 0);
    assert.equal(JSON.stringify(invalid), before);
  }
});
