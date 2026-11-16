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

/**
 * Recover all authored S08, S66 and S09 C90/C91 decisions from the pinned
 * original interactive layer, preserving original answer paragraphs verbatim.
 * Save-compatible scene-boundary insertion (paragraph timing parity TODO).
 *
 * S08 -> S66 -> S09 is the existing canonical chronological order. Neither
 * the originals nor these compatibility interactions unlock routes or charge
 * premium currency; route facts remain owned by canonical decisions.
 */
export function originalS08S66S09ExtraScenes({ t, beats }) {
  const nextScene = Object.freeze({ S08: 's66-intro', S66: 's09-intro', S09: 's10-intro' });
  return ['S08', 'S66', 'S09'].flatMap(sourceId => {
    const originalChoices = interactionBeats[sourceId];
    if (originalChoices?.length !== 2 ||
        originalChoices.some(entry => entry.options?.map(opt => opt.code).join(',') !== 'A,B')) {
      throw new Error('Pinned interaction schema changed for ' + sourceId);
    }
    return originalChoices.flatMap((entry, index) => {
      const id = sourceId.toLowerCase() + '-c' + (90 + index);
      const continuation = index === 0 ? sourceId.toLowerCase() + '-c91' : nextScene[sourceId];
      return [
        {
          id,
          beats: [
            { id: id + '-prompt', type: 'dialogue', text: t(entry.question) },
            {
              id: id + '-choice', type: 'choice',
              choices: entry.options.map(opt => ({
                id: opt.code.toLowerCase(), label: t(opt.label),
                targetSceneId: id + '-answer-' + opt.code.toLowerCase(),
              })),
            },
          ],
        },
        ...entry.options.map(opt => {
          const answerId = id + '-answer-' + opt.code.toLowerCase();
          return { id: answerId, beats: beats(answerId, opt.text), nextSceneId: continuation };
        }),
      ];
    });
  });
}

/**
 * The original S10/S11 C90/C91 authored reflective choices; the original
 * S11 water-safety consent C1 is unchanged and always runs BEFORE these
 * compatibility inserts. C90/C91 are FREE, without affinity/route mutations.
 * Original questions, choices, and response prose come from the pinned source.
 *
 * Paragraph-level fidelity remains pending; these are currently inserted
 * between canonical scene units so old beat IDs remain intact.
 */
export function originalS10AndS11ExtraScenes({ t, beats }) {
  const continuations = { S10: 's11-intro', S11: 's12-intro' };
  return ['S10', 'S11'].flatMap(sourceId => {
    const decisions = interactionBeats[sourceId];
    if (decisions?.length !== 2 ||
        decisions.some(item => item.options?.map(option => option.code).join(',') !== 'A,B')) {
      throw new Error('Pinned interactive decision source changed: ' + sourceId);
    }
    return decisions.flatMap((item, index) => {
      const name = sourceId.toLowerCase() + '-c' + (90 + index);
      const next = index === 0 ? sourceId.toLowerCase() + '-c91' : continuations[sourceId];
      return [
        {
          id: name,
          beats: [
            { id: name + '-prompt', type: 'dialogue', text: t(item.question) },
            {
              id: name + '-choice',
              type: 'choice',
              choices: item.options.map(option => ({
                id: option.code.toLowerCase(), label: t(option.label),
                targetSceneId: name + '-answer-' + option.code.toLowerCase(),
              })),
            },
          ],
        },
        ...item.options.map(option => {
          const answerId = name + '-answer-' + option.code.toLowerCase();
          return { id: answerId, beats: beats(answerId, option.text), nextSceneId: next };
        }),
      ];
    });
  });
}

/** Authored S12/S13 reflective choices from pinned original source.
 * Compatibility scene-boundary placement; true paragraph timing still pending.
 * Canonical routes, consent, safety and all existing effects are unchanged.
 */
export function originalS12AndS13ExtraScenes({ t, beats }) {
  const continuations = { S12: 's13-intro', S13: 's14-intro' };
  return ['S12', 'S13'].flatMap(sourceId => {
    const decisions = interactionBeats[sourceId];
    if (decisions?.length !== 2 ||
        decisions.some(d => d.options?.map(o => o.code).join(',') !== 'A,B')) {
      throw new Error('Pinned original S12/S13 decision source changed');
    }
    return decisions.flatMap((decision, index) => {
      const id = sourceId.toLowerCase() + '-c' + (90 + index);
      const next = index === 0 ? sourceId.toLowerCase() + '-c91' : continuations[sourceId];
      return [
        {
          id,
          beats: [
            { id: id + '-prompt', type: 'dialogue', text: t(decision.question) },
            {
              id: id + '-choice', type: 'choice',
              choices: decision.options.map(option => ({
                id: option.code.toLowerCase(), label: t(option.label),
                targetSceneId: id + '-answer-' + option.code.toLowerCase(),
              })),
            },
          ],
        },
        ...decision.options.map(option => {
          const answerId = id + '-answer-' + option.code.toLowerCase();
          return { id: answerId, beats: beats(answerId, option.text), nextSceneId: next };
        }),
      ];
    });
  });
}

/**
 * Verbatim original S14 and S15 authored reflective decisions. No new route,
 * affinity, consent or payment effects. Original mid-paragraph position remains
 * separate parity work; preserve the pre-existing canonical choice graph.
 */
export function originalS14AndS15ExtraScenes({ t, beats }) {
  const continuations = Object.freeze({ S14: 's15-intro', S15: 's16-intro' });
  return ['S14', 'S15'].flatMap(sourceId => {
    const authored = interactionBeats[sourceId];
    if (authored?.length !== 2 ||
        authored.some(d => d.options?.map(o => o.code).join(',') !== 'A,B')) {
      throw new Error('Pinned S14/S15 original interaction source mismatch');
    }
    return authored.flatMap((item, index) => {
      const name = sourceId.toLowerCase() + '-c' + (90 + index);
      const next = index === 0 ? sourceId.toLowerCase() + '-c91' : continuations[sourceId];
      return [
        { id: name, beats: [
          { id: name + '-prompt', type: 'dialogue', text: t(item.question) },
          { id: name + '-choice', type: 'choice',
            choices: item.options.map(opt => ({
              id: opt.code.toLowerCase(), label: t(opt.label),
              targetSceneId: name + '-answer-' + opt.code.toLowerCase(),
            })),
          },
        ] },
        ...item.options.map(opt => {
          const answerId = name + '-answer-' + opt.code.toLowerCase();
          return { id: answerId, beats: beats(answerId, opt.text), nextSceneId: next };
        }),
      ];
    });
  });
}

/**
 * Original S16/S17 author-authored C90 and C91 agency beats; S17 C90
 * selects the source-authored delayed callback in S22 on all four evenings.
 * It remains a free reflective choice, not a romance route lock.
 *
 * Old saved canonical scene and beat IDs are retained. Insertion at scene
 * boundaries is not yet the original source-paragraph position.
 */
export function originalS16S17AndS22EchoScenes({ t, beats }) {
  const ending = Object.freeze({ S16: 's17-intro', S17: 's17-common-b' });
  const decisions = ['S16', 'S17'].flatMap(sourceId => {
    const original = interactionBeats[sourceId];
    if (original?.length !== 2 ||
        original.some(item => item.options?.map(option => option.code).join(',') !== 'A,B')) {
      throw new Error('Pinned source changed for original ' + sourceId + ' C90/C91');
    }
    return original.flatMap((entry, index) => {
      const id = sourceId.toLowerCase() + '-c' + (90 + index);
      const next = index === 0 ? sourceId.toLowerCase() + '-c91' : ending[sourceId];
      return [
        { id, beats: [
          { id: id + '-prompt', type: 'dialogue', text: t(entry.question) },
          { id: id + '-choice', type: 'choice', choices: entry.options.map(opt => ({
            id: opt.code.toLowerCase(), label: t(opt.label),
            targetSceneId: id + '-answer-' + opt.code.toLowerCase(),
            ...(sourceId === 'S17' && index === 0 ? {
              effects: [{ op: 'flag_set', id: 's17-extra-c90-' + opt.code.toLowerCase(), value: true }],
            } : {}),
          })) },
        ] },
        ...entry.options.map(opt => {
          const answerId = id + '-answer-' + opt.code.toLowerCase();
          return { id: answerId, beats: beats(answerId, opt.text), nextSceneId: next };
        }),
      ];
    });
  });
  const originalEcho = interactionEchoes.S22?.[0];
  if (originalEcho?.[0] !== 'S17-C90') {
    throw new Error('Missing source S17-C90 delayed S22 reaction');
  }
  return [...decisions,
    {
      id: 's22-s17-c90-echo-dispatch',
      beats: [{
        id: 's22-s17-c90-echo-dispatch-choice', type: 'choice', choices: [
          { id: 'a', label: t('Продолжить'), targetSceneId: 's22-s17-c90-echo-a',
            when: { flag: 's17-extra-c90-a' } },
          { id: 'b', label: t('Продолжить'), targetSceneId: 's22-s17-c90-echo-b',
            when: { flag: 's17-extra-c90-b' } },
          { id: 'legacy', label: t('Продолжить'), targetSceneId: 's22-weather-dispatch',
            when: { not: { any: [
              { flag: 's17-extra-c90-a' }, { flag: 's17-extra-c90-b' },
            ] } } },
        ],
      }],
    },
    { id: 's22-s17-c90-echo-a', beats: beats('s22-s17-c90-echo-a', originalEcho[1]),
      nextSceneId: 's22-weather-dispatch' },
    { id: 's22-s17-c90-echo-b', beats: beats('s22-s17-c90-echo-b', originalEcho[2]),
      nextSceneId: 's22-weather-dispatch' },
  ];
}
