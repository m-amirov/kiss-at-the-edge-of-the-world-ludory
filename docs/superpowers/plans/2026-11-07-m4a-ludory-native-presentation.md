# M4A Ludory Native Presentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Научить штатный `@ludory/runtime-narrative` безопасно показывать фон, портреты и CG по детерминированной карте `beatId`, не меняя сюжет и сохранения.

**Architecture:** Опциональная immutable-карта `presentation` валидируется отдельно от строгого narrative graph. Чистый resolver вычисляет слой сцены из текущего сохранённого состояния; renderer показывает его под существующей панелью. Studio переносит новую API через штатный bundle/component update и сохраняет authored files.

**Tech Stack:** Node.js ESM (>=22), `node:test`, `@ludory/narrative`, DOM/CSS, esbuild, Ludory Studio, Playwright smoke.

**Spec:** `docs/superpowers/specs/2026-11-07-m4-visual-assets-native-ludory-design.md` в репозитории `m-amirov/kiss-at-the-edge-of-the-world-ludory`, Draft PR #2.

## Global Constraints

- Исполнять в `m-amirov/ludory` из свежей `main`, в отдельной ветке/worktree `LUDORY/.worktrees/<name>`; пользовательские dirty-файлы не трогать.
- Не добавлять поля в `@ludory/narrative` graph/state v1, не менять transition semantics, Back history, платные пути или логику SDK.
- `presentation` **необязателен**; прежние `createNarrativeRenderer({graph,catalog,...})` и интерактивные `assets` остаются совместимыми.
- Никаких сетевых произвольных URL, `eval`, inline JS из authored data, Docker, сервера, изменения публикаций.
- Portrait mobile по умолчанию для narrative template; wide desktop поддерживается. Изображения — same-origin локальные ресурсы, аудио/CDN отдельно.
- Работать через тесты RED → минимальный GREEN → проверка → коммит; один Draft PR для Ludory, без merge в `main` до review и gates.

## Review Focus

1. Неправильный, отсутствующий, cross-origin или path traversal `media.src` — валидатор отклоняет manifest до монтирования (Task 1).
2. Два условных состояния одного beat совпали на одном `narrativeState` — resolver блокирует неоднозначность, а не выбирает последнее (Task 1).
3. Back/Reload после выбора другой ветки — renderer берёт новый stage только из состояния, не из истории DOM (Task 2).
4. Сломанная картинка и нечитаемый мобильный диалог — нейтральный fallback без чужой картинки и доступный UI (Task 2/Task 4).
5. Старая игра с `story.js` без `presentationData` — Studio component update не ломает импорт и не перезаписывает authored файлы (Task 3).

---

## File and interface map

| Файл Ludory | Назначение |
|---|---|
| `packages/runtime-narrative/src/presentation.mjs` (new) | `defineNarrativePresentation(graph, raw)` и `resolveNarrativePresentation(graph, presentation, state)` |
| `packages/runtime-narrative/src/index.mjs` | Дополнительные публичные экспорты |
| `packages/runtime-narrative/src/renderer.mjs` | Необязательный `presentation`, создание DOM-layer |
| `packages/runtime-narrative/src/styles.mjs` | Responsive stage/CG/portrait с safe area |
| `packages/runtime-narrative/test/presentation.test.mjs` (new) | Схема, guard, pure resolver, предикаты и neutral |
| `packages/runtime-narrative/test/renderer.test.mjs` | DOM state, Back/reload, error/alt/focus, старый режим |
| `packages/studio/catalog/templates/narrative-interactive/src/main.js` | Optional export из `story.js`, передача в renderer |
| `packages/studio/catalog/templates/narrative-interactive/src/story.js` | Стартовый `presentationData` = `undefined` (без медиасодержимого) |
| `packages/studio/catalog/templates/narrative-interactive/template.json` | Патч-версия с сохранением ownership |
| `packages/studio/test/narrative-template.test.mjs` | Строгая bundled compatibility |
| `packages/studio/test/component-updates.test.mjs` | Проверка существующих игр и сохранности authored bytes |
| `scripts/build-narrative-template.mjs` | Экспорт API в managed ESM bundle, детерминированный rebuild |
| `packages/runtime-narrative/test/browser/studio-n3-smoke.mjs` | Визуальные сценарии на нескольких размерах (если доступен браузер) |
| `packages/runtime-narrative/README.md` | Контракт `presentation` и ограничения |

### Task 1: Strict Presentation Contract & Pure Resolver

**Files:** Create `packages/runtime-narrative/src/presentation.mjs`, `packages/runtime-narrative/test/presentation.test.mjs`; modify `packages/runtime-narrative/src/index.mjs`.

**Interfaces:**
- `defineNarrativePresentation(graph, raw) → frozen Presentation`; `raw = {schemaVersion:1,media:{[id]:{kind,src,alt?}},beats:{[beatId]:PresentationVariant[]}}`.
- Variant: `{id, when?, background?, portraits?, cg?, speaker?, neutral?}`; `portraits: [{characterId,mediaId,slot}]` (`left|center|right`); `cg: {mediaId,mode:'replace-stage'|'overlay'}`; `speaker` is localized `{ru,en}` or omitted; neutral `{reason}` excludes image layers.
- `resolveNarrativePresentation(graph, presentation, narrativeState) → resolved variant|null`; no mutations, global timers or hidden sticky state. `when` semantics from `validatePredicate`/`evaluateNarrativePredicate` of `@ludory/narrative`.
- `media.src` is **flat** `assets/<safe-name>.(png|webp|jpg|jpeg)` for compatibility with current Studio author proof. Presentation does not carry rights statements or external audio URLs.

- [ ] **Step 1: Write failing tests.** Assert `beatId` resolves to expected `background`/`portraits` for graph fixture; a condition `{flag:'s01-seat-eric'}` selects only true branch; unseen beat yields `null`; `neutral` has explicit nonempty reason; rejected: unknown beat/media, duplicate variant ID, wrong kind/slot, active fields with neutral, `https:`, `//`, `../`, `%2e`, backslash, NUL, accessor/prototype pollution, overlapping `when` at runtime; input remains unmodified/frozen output.
- [ ] **Step 2: Run RED.** `node --test packages/runtime-narrative/test/presentation.test.mjs`; expected test failure due missing exports/validation.
- [ ] **Step 3: Implement signatures above.** Use existing `jsonCopy`, validation and predicate semantics where public; if not public, import *public* exports from `@ludory/narrative` only, or add a narrow documented public export without touching graph/state schema. Avoid proving arbitrary predicates mutually exclusive statically; reject simultaneous matches **when evaluating state**.
- [ ] **Step 4: Run GREEN.** Same command, all tests PASS.
- [ ] **Step 5: Commit.** `git add packages/runtime-narrative/src packages/runtime-narrative/test/presentation.test.mjs && git commit -m "feat(narrative): validate and resolve presentation cues"`.

### Task 2: Native DOM Stage / Portrait / CG Composition

**Files:** Modify `packages/runtime-narrative/src/renderer.mjs`, `styles.mjs`, `test/renderer.test.mjs`, `test/host-integration.test.mjs`.

**Interfaces:** `createNarrativeRenderer({graph,catalog,...,presentation?})`; consume `resolveNarrativePresentation(graph,presentation,state.narrative)`, rebuild `stage` and original `panel` atomically. No changes to `createNarrativeRuntimeUpdate` or persisted `state.narrative`.

- [ ] **Step 1: Write failing DOM tests.** On a resolved beat assert `.ludory-narrative__stage` contains `background IMG`, portrait(s) and optional CG with expected `src`/`alt`/`data-role`; on `neutral` no image; switching `state` then Back/Restore switches stage to exactly the corresponding variant; `img.onerror` removes only broken layer; `setLocale` changes speaker/alt safely; without `presentation` prior tree is unchanged; buttons emit same finite actions and preserve focus.
- [ ] **Step 2: Run RED.** `node --test packages/runtime-narrative/test/renderer.test.mjs packages/runtime-narrative/test/host-integration.test.mjs`; expected new stage assertions FAIL, old assertions PASS.
- [ ] **Step 3: Implement renderer and scoped CSS.** `background cover`, portrait `contain`/safe-zone crop, CG explicit mode; scene stays behind a contrast-controlled dialogue panel, 390×844 and 1000×720, scrollable dialogue/choices, pointer and keyboard access. Use DOM methods and `textContent` (never `innerHTML` with authored text). Keep `prefers-reduced-motion` and idempotent `unmount`.
- [ ] **Step 4: Run GREEN.** Same targeted tests, plus `node --test packages/runtime-narrative/test/update.test.mjs`; all PASS.
- [ ] **Step 5: Commit.** `git add packages/runtime-narrative/src packages/runtime-narrative/test && git commit -m "feat(runtime-narrative): render responsive visual stage"`.

### Task 3: Studio Bundle, Existing-Project Upgrade & Asset Proof

**Files:** Modify `scripts/build-narrative-template.mjs`, `packages/studio/catalog/templates/narrative-interactive/src/{main,story}.js`, `packages/studio/catalog/templates/narrative-interactive/template.json`, generated `assets/ludory-narrative.js`, `packages/studio/test/{narrative-template,component-updates}.test.mjs`. Check `packages/studio/src/catalog.mjs` and `component-updates.mjs` first; change them only if tests identify a real hole.

**Interfaces:** Bundle exports `defineNarrativePresentation`, `createNarrativeRenderer`; template reads optional authored `presentationData` through `import * as story from './story.js'` to support old `story.js`. Existing `assets` map/`narrative-assets.json` remains for interactive IDs; flat accepted art proof entries in `assets` have `{path,sha256}`.

- [ ] **Step 1: Write failing tests.** New template exposes the optional entrypoint; an **old game lacking `presentationData` still starts**; generated bundle digest deterministic; an authored extra `assets/vis-s01-*.webp` with correct hash passes Studio preview/export proof, tampering or symlink fails; unrelated authored `story.js`, `narrative-assets.json` and protected extra files remain byte-identical after managed component update.
- [ ] **Step 2: Run RED.** `node --test packages/studio/test/narrative-template.test.mjs packages/studio/test/component-updates.test.mjs`; expected new assertions FAIL before implementation.
- [ ] **Step 3: Wire template and build path.** Use namespace import for backwards compatible optional export, update build `stdin` public exports, bump *patch* version from template `1.2.2` only after inspecting registry dependencies, run `npm run build:narrative-template` to refresh managed bundle/hash proof through existing generator. Do **not** hand-edit generated ESM or `game/assets/ludory-narrative.js`.
- [ ] **Step 4: Run GREEN.** Same tests, `npm run check` (if present; verify script in root `package.json`), `node scripts/build-narrative-template.mjs --check`; all PASS. Ensure update plan reports no author conflict before applying on a disposable fixture.
- [ ] **Step 5: Commit.** Stage exact touched files and `git commit -m "feat(studio): ship opt-in visual narrative component"`.

### Task 4: Cross-Viewport QA, Documentation and Draft PR

**Files:** Modify `packages/runtime-narrative/test/browser/studio-n3-smoke.mjs`, `packages/runtime-narrative/README.md` and corresponding Studio documentation if needed.

**Interfaces:** No new public API; consumes Tasks 1–3. QA must use a **real** browser if a browser socket can be opened; no simulated PASS in its absence.

- [ ] **Step 1: Write browser fixture assertions.** Portrait 390×844 and wide 1000×720; stage/media presence, face visible, text/choice bounds, journal and locale, CG replacement, intentionally missing art fallback, reduced-motion CSS and reload consistency. Add negative image-resource test to the same fixture.
- [ ] **Step 2: Run RED** against a fixture without new presentation; expect failures of visual assertions (or `BLOCKED_BROWSER` with recorded reason if browser unavailable, never PASS).
- [ ] **Step 3: Update smoke fixture/docs** to document `presentation` API and best practices; do not change core to satisfy a testing-environment failure.
- [ ] **Step 4: Run GREEN** `node --test packages/runtime-narrative/test/*.test.mjs`, `node --test packages/studio/test/narrative-template.test.mjs`, `npm test`, `npm run check`, `node scripts/build-narrative-template.mjs --check`; run documented browser smoke on a capable host, otherwise record `BLOCKED_BROWSER` and keep PR Draft.
- [ ] **Step 5: Commit and PR.** `git commit -m "test(docs): verify M4 visual narrative presentation"`; push isolated branch, open **Draft** Ludory PR with HEAD SHA, test command/output, source tree digest, browser evidence and blockers. No merge until explicit acceptance.

## Handoff to M4B

Export exact Ludory commit SHA, `presentation` public interface, generated component digest and Studio version. M4B must pin them before updating game. If any compatibility or browser gate remains blocked, M4B may prepare source maps but cannot claim visual pilot PASS or release readiness.
