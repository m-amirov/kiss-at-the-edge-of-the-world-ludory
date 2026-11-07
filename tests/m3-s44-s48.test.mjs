import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import { defineNarrativeGraph } from '../game/assets/ludory-narrative.js';

// Independently extracted *before implementation* from immutable original
// 1e775f1, content/season-1-literary-episode-10.md lines 136–269.
// Paragraphs are joined by LF LF, without headings or place metadata.
const canonical = {
  's44-intro': [4, '98493b334db39b8b69cbf814ae2d6f5425817930450d18c8a47f882219ee03a4'],
  's44-c1-a': [1, '56908d864e6fc1e6607f2ac9ab7bb0348bf4d472e1a690e8e6adee30453116cb'],
  's44-c1-b': [1, '3d3e76ef744e3a07deb07b47d41b1a241bb1b0282f01abf63f0e7bfd854ac274'],
  's44-common': [1, 'c0d72b2de7ffdc2102242608af955ce1f0c0e9924b503a5c88afe3104410c913'],
  's45-intro': [2, '51577704b8341080e1d54a0cede7d54012937f8baa23e1c8ecc7e4bcf3fda955'],
  's45-c1-a': [1, '4642b10147132cbe5c058790ead3cf2506cc65e3b74f5fe0bcb32635bc140a9a'],
  's45-c1-b': [2, '21ee4e73b4811a0db59aa23e8770101270337c35560c7a1cbfac205d86284c0f'],
  's45-common': [1, 'd33888231384726c3f27324ad9705bb0f03f3d1c8bec4573fabb5a03b81072df'],
  's46-intro': [2, 'c5cd2b4b5e562e0b55bdb6c5d29c6039a7efec52f554f32e8727dc90562fdbf9'],
  's46-c1-a': [2, 'aafbcd1a2bdaeb8233f91287919fbcc0d7e1902cfb2a1a25b4b8ccaf9626e224'],
  's46-c1-b': [2, '0ea7b60408b83f121787537ef01705e03602789589c5271cf11027e81aeec8a9'],
  's46-common': [1, '582d3b0b361e4de2266d8d546bcaf19baf06123e49467f8be8da98c29f96b9d3'],
  's47-intro': [2, 'a83a711b54746b37c4a9f36e4b99235a536c592292d48a69ce5e9c0c8609957e'],
  's47-c1-a': [1, 'e61c79a2d07e23eef992c032776fe9563af92a157a448f7a9a3a5145b48cad1a'],
  's47-c1-b': [1, 'ebce53e1759e9a11c1c8ed3a23c0d3462d9e5cdff24dab5560c71dc243c799b0'],
  's47-common': [1, 'b41c69be8f5ebcbe1fdf438733925c0c07ac8781111bddfced79350bd9a22175'],
  's48-intro': [2, '4d90ce2b3152fc0b8f159f9fe968c7a5de0bc48e055a4637109b032ce03ad8c5'],
  's48-route-eric': [1, 'cad067047fafcc35033ecd3eba6a5db3cb1db4cc3d645d7c89f86096d5f2caba'],
  's48-route-nick': [1, 'be3dae11ed43148e32edb8ca9df5ae5ec4d9e1daaf013546045a942dd7454a7b'],
  's48-route-damir': [1, '576d33801d6074cc9f2c4a12cf77ec0881a97a83d2242fb238539569d2b4a510'],
  's48-route-alice': [1, 'fa887a4e536b28f683ad04e4880d193bb261dbc1b546cf310abe38ed263c0a68'],
  's48-common': [1, '417da2c08a152b57415363ea1bac3ca9263f1f4bd0ffcef6f935abe267b4b4ce'],
  's48-c2-a': [1, 'c1b0f5fe7860f39f1e2dd15c2ed9a131157199e61082e5cb5631a9457e231664'],
  's48-c2-b': [1, 'e2e819fe1a30ba6d1897cd250af626c3572f11412e349dd1cbc978871664351a'],
};

const scene = (id) => graphData.scenes.find((node) => node.id === id);
const choice = (id, beatId) => scene(id)?.beats.find((beat) => beat.id === beatId)?.choices;
const paragraphs = (id) => (scene(id)?.beats ?? []).filter((beat) => beat.type === 'dialogue')
  .map((beat) => beat.text.ru);

test('S44–S48 match all 24 pinned authorial text blocks and 34 paragraphs byte-for-byte', () => {
  assert.equal(Object.values(canonical).reduce((sum, [count]) => sum + count, 0), 34);
  for (const [id, [count, digest]] of Object.entries(canonical)) {
    assert.equal(paragraphs(id).length, count, `${id} paragraph count`);
    assert.equal(createHash('sha256').update(paragraphs(id).join('\n\n')).digest('hex'),
      digest, `${id} pinned source SHA-256`);
  }
});

test('S48 farewell precedes individual finals and has exactly one route and S41 callback', () => {
  assert.equal(scene('s42-common')?.nextSceneId, 's48-intro');
  assert.equal(scene('s43-common')?.nextSceneId, 's48-intro');
  assert.deepEqual(choice('s48-intro', 's48-route-choice')?.map((v) => [
    v.id, v.label?.ru, v.routeId, v.targetSceneId, v.effects,
  ]), ['eric', 'nick', 'damir', 'alice'].map((id) => [
    id, 'Продолжить', id, `s48-route-${id}`, undefined,
  ]));
  for (const id of ['eric', 'nick', 'damir', 'alice'])
    assert.equal(scene(`s48-route-${id}`)?.nextSceneId, 's48-common');
  assert.equal(scene('s48-common')?.nextSceneId, 's48-c2-dispatch');
  assert.deepEqual(choice('s48-c2-dispatch', 's48-c2-route')?.map((v) => [
    v.id, v.when, v.targetSceneId, v.effects,
  ]), [
    ['a', { flag: 's41-aftertext-group-walk' }, 's48-c2-a', undefined],
    ['b', { flag: 's41-aftertext-alone' }, 's48-c2-b', undefined],
  ]);
  for (const id of ['a', 'b'])
    assert.equal(scene(`s48-c2-${id}`)?.nextSceneId, 's48-final-dispatch');
  assert.deepEqual(choice('s48-final-dispatch', 's48-final-route')?.map((v) => [
    v.id, v.routeId, v.when, v.targetSceneId,
  ]), [
    ['eric', 'eric', { flag: 's42-decision-continue' }, 's44-intro'],
    ['nick', 'nick', { flag: 's42-decision-continue' }, 's45-intro'],
    ['damir', 'damir', { flag: 's42-decision-continue' }, 's46-intro'],
    ['alice', 'alice', undefined, 's47-intro'],
    ...['eric', 'nick', 'damir'].map((id) => [`${id}-independent`, id,
      { not: { flag: 's42-decision-continue' } }, 's47-intro']),
  ]);
});

test('each finale has free C1, one common epilogue and seven distinct ending IDs', () => {
  const endingIds = [];
  const labels = {
    s44: ['Поцеловать Эрика и подтвердить их следующую встречу',
      'Обнять его и оставить свидание без красивого финального жеста'],
    s45: ['Поцеловать Ника без камеры', 'Договориться посмотреть фильм вместе дома'],
    s46: ['Назвать встречу дома их первым новым свиданием',
      'Попросить ещё раз подтвердить дату после возвращения'],
    s47: ['Сохранить его только для себя', 'Написать подруге и договориться о встрече'],
  };
  for (const base of Object.keys(labels)) {
    assert.deepEqual(choice(`${base}-intro`, `${base}-c1-choice`)?.map((v) => [
      v.id, v.label.ru, v.targetSceneId, v.effects,
    ]), ['a', 'b'].map((id, i) => [id, labels[base][i], `${base}-c1-${id}`,
      [{ op: 'flag_set', id: `${base}-choice-${id}`, value: true }]]));
    for (const id of ['a', 'b'])
      assert.equal(scene(`${base}-c1-${id}`)?.nextSceneId, `${base}-common`);
    assert.equal(scene(`${base}-common`)?.nextSceneId,
      base === 's47' ? 's47-ending' : `${base}-end-dispatch`);
    if (base === 's47') {
      assert.equal(scene('s47-ending')?.beats[0]?.endingId, 'alice');
      endingIds.push('alice');
    } else {
      for (const id of ['a', 'b']) {
        const endingScene = `${base}-ending-${id}`;
        const endingId = { s44: 'eric', s45: 'nick', s46: 'damir' }[base] + '-' + id;
        endingIds.push(endingId);
        assert.equal(scene(endingScene)?.beats[0]?.endingId, endingId);
        assert.equal(scene(endingScene)?.beats[0]?.type, 'ending');
      }
    }
  }
  assert.deepEqual([...endingIds].sort(),
    ['alice', 'eric-a', 'eric-b', 'nick-a', 'nick-b', 'damir-a', 'damir-b'].sort());
  assert.equal(scene('s42-s43-after-m3-end'), undefined);
  assert.doesNotThrow(() => defineNarrativeGraph(graphData));
  const newOptions = graphData.scenes.filter((v) => /^s4[4-8]-/.test(v.id))
    .flatMap((v) => v.beats).flatMap((v) => v.choices ?? []);
  for (const option of newOptions) {
    for (const key of ['cost', 'premium', 'requiredEntitlement', 'purchase',
      'publishPermission', 'mediaPermission', 'realMessage', 'realMedia'])
      assert.equal(option[key], undefined, `${key} forbidden on ${option.id}`);
  }
  assert.deepEqual(catalogData.interactions, []);
});
