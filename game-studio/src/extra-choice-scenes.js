/**
 * Recover the two *authored* S01 C90/C91 decisions and S02 consequence from
 * the pinned original season. This is a compatibility slice of the missed
 * interaction layer, not a new synthetic prompt/choice.
 *
 * S01's existing canonical beat IDs, seat choice and all later scenes remain
 * intact so previously saved canonical positions are not renumbered.
 */
import { interactionBeats, interactionEchoes } from './original-interactive-beats.js';

export function originalS01ExtraScenes({ t, beats }) {
  const decisions = interactionBeats.S01;
  const echoes = interactionEchoes.S02;
  if (decisions?.length !== 2 || echoes?.[0]?.[0] !== 'S01-C90') {
    throw new Error('Pinned S01 interaction layer changed; inspect before migration');
  }
  const [c90, c91] = decisions;
  const [, echoA, echoB] = echoes[0];
  function choiceScene(id, data, targetPrefix, continuation, remember = false) {
    const choiceId = `${id}-choice`;
    const options = data.options.map(option => {
      const code = option.code.toLowerCase();
      return {
        id: code,
        label: t(option.label),
        targetSceneId: `${targetPrefix}-${code}`,
        ...(remember ? { effects: [{ op: 'flag_set', id: `s01-extra-c90-${code}`, value: true }] } : {}),
      };
    });
    const answers = data.options.map(option => ({
      id: `${targetPrefix}-${option.code.toLowerCase()}`,
      beats: beats(`${targetPrefix}-${option.code.toLowerCase()}`, option.text),
      nextSceneId: continuation,
    }));
    return [{ id, beats: [{ id: choiceId, type: 'choice', choices: options }] }, ...answers];
  }
  const echoDispatch = {
    id: 's02-c90-echo',
    beats: [{
      id: 's02-c90-echo-route',
      type: 'choice',
      choices: ['a', 'b'].map(code => ({
        id: code,
        label: t('Продолжить'),
        when: { flag: `s01-extra-c90-${code}` },
        targetSceneId: `s02-c90-echo-${code}`,
      })),
    }],
  };
  return [
    ...choiceScene('s01-c90', c90, 's01-c90-answer', 's01-c91', true),
    ...choiceScene('s01-c91', c91, 's01-c91-answer', 's02-c90-echo'),
    echoDispatch,
    { id: 's02-c90-echo-a', beats: beats('s02-c90-echo-a', echoA), nextSceneId: 's02-road' },
    { id: 's02-c90-echo-b', beats: beats('s02-c90-echo-b', echoB), nextSceneId: 's02-road' },
  ];
}
