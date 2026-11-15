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
    return [{ id, beats: [
      { id: `${id}-prompt`, type: 'dialogue', text: t(data.question) },
      { id: choiceId, type: 'choice', choices: options },
    ] }, ...answers];
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


/**
 * Restore authored S02 C90/C91 decisions. The existing canonical S02 beats and
 * their save IDs remain untouched; this compatibility insertion currently
 * follows S02-common. Original in-scene timing remains an explicit parity debt.
 */
export function originalS02ExtraScenes({ t, beats }) {
  const decisions = interactionBeats.S02;
  if (decisions?.length !== 2 || interactionEchoes.S41?.[0]?.[0] !== 'S02-C90') {
    throw new Error('Pinned S02 interaction or S41 echo changed; inspect source');
  }
  return decisions.flatMap((decision, index) => {
    const number = 90 + index;
    const sceneId = `s02-c${number}`;
    const nextSceneId = index === 0 ? 's02-c91' : 's65-guesthouse';
    return [
      {
        id: sceneId,
        beats: [
          { id: `${sceneId}-prompt`, type: 'dialogue', text: t(decision.question) },
          {
          id: `${sceneId}-choice`, type: 'choice',
          choices: decision.options.map(option => {
            const code = option.code.toLowerCase();
            return {
              id: code, label: t(option.label),
              targetSceneId: `${sceneId}-answer-${code}`,
              ...(index === 0 ? {
                effects: [{ op: 'flag_set', id: `s02-extra-c90-${code}`, value: true }],
              } : {}),
            };
          }),
          },
        ],
      },
      ...decision.options.map(option => {
        const answerId = `${sceneId}-answer-${option.code.toLowerCase()}`;
        return { id: answerId, beats: beats(answerId, option.text), nextSceneId };
      }),
    ];
  });
}

/**
 * The authored S02-C90 delayed echo returns at the start of S41.
 * A compatibility branch allows old saves from before the S02 restoration
 * to reach unchanged S41 without guessing which choice the player made.
 */
export function originalS41EchoScenes({ t, beats }) {
  const echo = interactionEchoes.S41?.find(([id]) => id === 'S02-C90');
  if (!echo || echo.length !== 3) throw new Error('S41 pinned S02-C90 echo missing');
  const [, answerA, answerB] = echo;
  return [
    {
      id: 's41-c90-echo-route',
      beats: [{
        id: 's41-c90-echo-dispatch', type: 'choice',
        choices: [
          ...['a', 'b'].map(code => ({
            id: code, label: t('Продолжить'),
            when: { flag: `s02-extra-c90-${code}` },
            targetSceneId: `s41-c90-echo-${code}`,
          })),
          {
            id: 'legacy', label: t('Продолжить'),
            when: { not: { any: [
              { flag: 's02-extra-c90-a' },
              { flag: 's02-extra-c90-b' },
            ] } },
            targetSceneId: 's41-intro',
          },
        ],
      }],
    },
    { id: 's41-c90-echo-a', beats: beats('s41-c90-echo-a', answerA), nextSceneId: 's41-intro' },
    { id: 's41-c90-echo-b', beats: beats('s41-c90-echo-b', answerB), nextSceneId: 's41-intro' },
  ];
}

/**
 * Recover authored S65 and S03 C90/C91 choices without renumbering canonical
 * beats. This is an explicit scene-boundary compatibility pass, not yet the
 * original mid-scene timing; moving them requires a separate save migration.
 *
 * S65-C90 has a genuine delayed answer in S03. All alternatives remain free
 * and route-neutral, and source prose is copied verbatim from the pinned layer.
 */
export function originalS65AndS03ExtraScenes({ t, beats }) {
  const s65 = interactionBeats.S65;
  const s03 = interactionBeats.S03;
  const echo = interactionEchoes.S03?.find(entry => entry[0] === 'S65-C90');
  if (s65?.length !== 2 || s03?.length !== 2 || echo?.length !== 3) {
    throw new Error('Pinned S65/S03 interaction source changed; inspect before migration');
  }

  function authoredDecision(sourceId, index, continuation, remember = false) {
    const source = interactionBeats[sourceId][index];
    if (source?.options?.length !== 2 || source.options.map(o => o.code).join(',') !== 'A,B') {
      throw new Error('Unexpected original C90/C91 option schema for ' + sourceId);
    }
    const sceneId = sourceId.toLowerCase() + '-c' + (90 + index);
    const answerId = code => sceneId + '-answer-' + code;
    return [
      {
        id: sceneId,
        beats: [
          { id: sceneId + '-prompt', type: 'dialogue', text: t(source.question) },
          {
            id: sceneId + '-choice',
            type: 'choice',
            choices: source.options.map(option => {
              const code = option.code.toLowerCase();
              return {
                id: code, label: t(option.label), targetSceneId: answerId(code),
                ...(remember ? {
                  effects: [{ op: 'flag_set', id: 's65-extra-c90-' + code, value: true }],
                } : {}),
              };
            }),
          },
        ],
      },
      ...source.options.map(option => {
        const id = answerId(option.code.toLowerCase());
        return { id, beats: beats(id, option.text), nextSceneId: continuation };
      }),
    ];
  }

  return [
    ...authoredDecision('S65', 0, 's65-c91', true),
    ...authoredDecision('S65', 1, 's03-s65-c90-echo-route'),
    {
      id: 's03-s65-c90-echo-route',
      beats: [{
        id: 's03-s65-c90-echo-dispatch', type: 'choice',
        choices: [
          ...['a', 'b'].map(code => ({
            id: code, label: t('Продолжить'),
            when: { flag: 's65-extra-c90-' + code },
            targetSceneId: 's03-s65-c90-echo-' + code,
          })),
          {
            id: 'legacy', label: t('Продолжить'),
            when: { not: { any: [
              { flag: 's65-extra-c90-a' },
              { flag: 's65-extra-c90-b' },
            ] } },
            targetSceneId: 's03-editorial',
          },
        ],
      }],
    },
    { id: 's03-s65-c90-echo-a', beats: beats('s03-s65-c90-echo-a', echo[1]), nextSceneId: 's03-editorial' },
    { id: 's03-s65-c90-echo-b', beats: beats('s03-s65-c90-echo-b', echo[2]), nextSceneId: 's03-editorial' },
    ...authoredDecision('S03', 0, 's03-c91'),
    ...authoredDecision('S03', 1, 's04-intro'),
  ];
}

/**
 * Restore the original S04/S05 C90/C91 authored alternatives and responses.
 * Until a save-aware paragraph migration is available these form compatibility
 * scene-boundary continuations; canonical IDs and original choice effects stay
 * unchanged. No paid choices, inferred flags, or synthetic prose are added.
 */
export function originalS04AndS05ExtraScenes({ t, beats }) {
  return ['S04', 'S05'].flatMap(sourceScene => {
    const decisions = interactionBeats[sourceScene];
    if (decisions?.length !== 2) {
      throw new Error('Pinned additional decisions missing: ' + sourceScene);
    }
    return decisions.flatMap((original, index) => {
      if (original.options?.length !== 2 ||
          original.options.map(option => option.code).join(',') !== 'A,B') {
        throw new Error('Pinned C90/C91 option schema changed: ' + sourceScene);
      }
      const name = sourceScene.toLowerCase() + '-c' + (90 + index);
      const next = index === 0 ? sourceScene.toLowerCase() + '-c91' :
        sourceScene === 'S04' ? 's05-intro' : 's06-intro';
      return [
        {
          id: name,
          beats: [
            { id: name + '-prompt', type: 'dialogue', text: t(original.question) },
            {
              id: name + '-choice', type: 'choice',
              choices: original.options.map(option => ({
                id: option.code.toLowerCase(), label: t(option.label),
                targetSceneId: name + '-answer-' + option.code.toLowerCase(),
              })),
            },
          ],
        },
        ...original.options.map(option => {
          const answer = name + '-answer-' + option.code.toLowerCase();
          return { id: answer, beats: beats(answer, option.text), nextSceneId: next };
        }),
      ];
    });
  });
}

/**
 * Original S06/S07 C90/C91 authored choices. These are compatibility
 * scene-boundary inserts: exact *prose* is restored, while paragraph placement
 * and legacy-save timing still require a separate fidelity migration.
 *
 * The S07 C90 answer is remembered for the authentic delayed S08 breakfast
 * reaction. No invented affinity values or premium decisions are introduced.
 */
export function originalS06AndS07ExtraScenes({ t, beats }) {
  const echo = interactionEchoes.S08?.find(item => item[0] === 'S07-C90');
  if (!echo || echo.length !== 3) {
    throw new Error('Pinned original S07-C90 delayed response missing at S08');
  }
  function authoredChoice(sourceId, index) {
    const choices = interactionBeats[sourceId];
    if (choices?.length !== 2) throw new Error('Pinned interaction source missing: ' + sourceId);
    const original = choices[index];
    if (original.options?.map(option => option.code).join(',') !== 'A,B') {
      throw new Error('Pinned interaction options changed for ' + sourceId);
    }
    const name = sourceId.toLowerCase() + '-c' + (90 + index);
    const next = index === 0 ? sourceId.toLowerCase() + '-c91' :
      sourceId === 'S06' ? 's07-intro' : 's08-s07-c90-echo-route';
    return [
      {
        id: name,
        beats: [
          { id: name + '-prompt', type: 'dialogue', text: t(original.question) },
          {
            id: name + '-choice', type: 'choice',
            choices: original.options.map(option => {
              const code = option.code.toLowerCase();
              return {
                id: code, label: t(option.label),
                targetSceneId: name + '-answer-' + code,
                ...(sourceId === 'S07' && index === 0 ? {
                  effects: [{ op: 'flag_set', id: 's07-extra-c90-' + code, value: true }],
                } : {}),
              };
            }),
          },
        ],
      },
      ...original.options.map(option => {
        const id = name + '-answer-' + option.code.toLowerCase();
        return { id, beats: beats(id, option.text), nextSceneId: next };
      }),
    ];
  }
  return [
    ...authoredChoice('S06', 0),
    ...authoredChoice('S06', 1),
    ...authoredChoice('S07', 0),
    ...authoredChoice('S07', 1),
    {
      id: 's08-s07-c90-echo-route',
      beats: [{
        id: 's08-s07-c90-echo-dispatch', type: 'choice',
        choices: [
          ...['a', 'b'].map(code => ({
            id: code, label: t('Продолжить'),
            when: { flag: 's07-extra-c90-' + code },
            targetSceneId: 's08-s07-c90-echo-' + code,
          })),
          {
            id: 'legacy', label: t('Продолжить'),
            when: { not: { any: [
              { flag: 's07-extra-c90-a' },
              { flag: 's07-extra-c90-b' },
            ] } },
            targetSceneId: 's08-intro',
          },
        ],
      }],
    },
    { id: 's08-s07-c90-echo-a', beats: beats('s08-s07-c90-echo-a', echo[1]), nextSceneId: 's08-intro' },
    { id: 's08-s07-c90-echo-b', beats: beats('s08-s07-c90-echo-b', echo[2]), nextSceneId: 's08-intro' },
  ];
}
