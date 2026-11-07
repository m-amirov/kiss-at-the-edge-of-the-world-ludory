# M4B Kiss Visual Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Принять проверенные визуальные ассеты старой игры, связать их с 66 авторскими сценами и показать в нативном renderer Ludory без изменения литературного графа.

**Architecture:** Игра хранит авторскую visual/source-map отдельно от неизменного графа. Детерминированный build tool создаёт JS-представление карты и проверяемые хеши для Studio; renderer получает `presentationData` через штатное обновление компонента. Пилот S01–S03 принимается до расширения на остальные сцены; аудио и права проверяются отдельно.

**Tech Stack:** Node.js ESM >=22, `node:test`, git objects пинованного исходника, Ludory Studio components/preview, `@ludory/runtime-narrative` M4A, браузерная QA, WebP/PNG/OGG/MP3.

**Spec:** `docs/superpowers/specs/2026-11-07-m4-visual-assets-native-ludory-design.md` (тот же репозиторий). Требуется проверенный commit из `2026-11-07-m4a-ludory-native-presentation.md`.

## Global Constraints

- Текущая рабочая ветка игры — `feat/m2-canonical-s01`, PR #2 **Draft**; создавать M4-ветку/worktree от проверенного HEAD с сохранением пользовательских dirty-файлов. `main` не менять до review/merge.
- Старый источник — **только** `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c` и конкретные пути в Git tree.
- 606 technical scenes, 2633 dialogue beats, 164 choice nodes, 7 ending IDs — baseline для regression; не менять `graphData`, переходы, локализационные фолбэки и схему `state.narrative`.
- Персонажи проверенного источника: Алиса, Эрик, Ник, Дамир. Романтика важнее детектива, крупные портреты, смысловая точность локаций.
- Economy OFF; никаких premium-choice, новых рекламных решений, серверов, Docker, обязательной офлайн-сборки или публикаций.
- `game-dev` CLI **не найден**. До импорта любого файла получить отдельное точное разрешение на admission workflow, команду и destination. Без такого допуска делать только read-only инвентаризацию, metadata/source-map и тесты с neutral fallback; не подменять исходники произвольной картинкой.
- Аудио для VK/Яндекс — CDN; browser autoplay может быть заблокирован, основной сюжет остаётся доступным без звука.

## Review Focus

1. Авторский cue `[chunkIndex,paragraphIndex]` совпадает с несколькими новыми beats или ни с одним — фиксировать `blocked/obsolete`, не приклеивать по ключевым словам (Task 2).
2. Визуальный manifest с правильным именем, но неверным реальным изображением (например, интерьер S17 против гавани S18) — P1 blocker смыслового review (Task 1/Task 5).
3. Рассогласование `story.js` и `narrative-assets.json` после добавления presentation export — Studio preview/export BLOCKED до пересчёта валидного доказательства (Task 3).
4. Исходные права и хеши музыки/CG не подтверждены — файлы остаются `BLOCKED` и не попадают в ZIP (Task 1/Task 5).
5. Скрытый маршрут/Back/reload показывает CG не той романтической ветки — per-route resolver и реальные сценарные тесты проверяют correct state (Task 3/Task 4).

---

## File and interface map

| Файл игры | Назначение |
|---|---|
| `tools/m4-inventory.mjs` (new) | Read-only git-object inventory pinned media, SHA256, rights status |
| `docs/migration/m4-assets-inventory.json` (new) | Таблица кандидатов, источника, прав и решений |
| `game/visuals/source-map.json` (new) | Явная авторская связь source cue → graph beat / route predicate |
| `game/visuals/presentation.json` (new) | Единственный авторский manifest `media` и `beats`; explicit neutral |
| `tools/m4-build-presentation.mjs` (new) | Проверяемая generation `src/presentation.js`, `narrative-assets.json` proof |
| `game/src/presentation.js` (generated) | Статичный `presentationData` для renderer, без runtime network fetch |
| `game/src/story.js` | Только безопасный re-export `presentationData`, не менять прозу |
| `game/narrative-assets.json` | Хеш `story.js` и hash receipts на допущенные flat `assets/vis-*.webp` |
| `game/assets/vis-*.webp` (admission only) | Принятые и проверенные реальные изображения |
| `game/assets/ludory-narrative.js` (managed) | Обновляется **только** через Ludory Studio components update |
| `tests/m4-inventory.test.mjs` (new) | Проверка источника, запрет неправильных прав/хешей |
| `tests/m4-source-map.test.mjs` (new) | Покрытие S01–S03 и затем S01–S66, отсутствие silently dropped cues |
| `tests/m4-presentation.test.mjs` (new) | Pure resolver по веткам, proof, text/graph digest |
| `tests/m4-studio.test.mjs` (new) | Component ownership/preview, сетевые границы и сборка |
| `docs/qa/m4-pilot.md` (new) | Визуальные/браузерные факты, ошибки, screenshots, blocked gates |
| `README.md` | Превью в локальной сети, состояние M4 и необходимые gates |

### Task 1: Audited Asset Candidates and Rights Gate

**Files:** Create `tools/m4-inventory.mjs`, `tests/m4-inventory.test.mjs`, `docs/migration/m4-assets-inventory.json`.

**Interfaces:** `inventoryAssets({sourceGitDir,sourceCommit,assetManifestPath,rightsManifestPath}) → {sourceCommit,entries,summary}`; readonly `git cat-file/git show` for the exact commit, independent `sha256` per blob; `entry.status = candidate|accepted|blocked` plus `path,sourceBlobSha,sha256,role,licenseEvidence,reason`.

- [ ] **Step 1: RED tests.** Synthetic pinned Git repo with a valid WebP, missing rights entry, mismatched hash, duplicate target path and 8 music rights rows without digest; verify no mutation, deterministic ordering, `blocked` where proof absent and immutable commit pin. Use `node --test tests/m4-inventory.test.mjs`.
- [ ] **Step 2: Run RED.** Expected failure because inventory module is missing.
- [ ] **Step 3: Implement read-only inventory.** Join old `assets/asset-manifest.json` (123 records) with `assets/provenance/rights-manifest.json` (138 records), collect only manifest-referenced media; compare actual Git object content; classify 8 music entries with missing SHA as **not yet admitted**. No install, file copy, image edit or CLI import.
- [ ] **Step 4: Run GREEN.** `node --test tests/m4-inventory.test.mjs`; compare recorded candidate counts with pinned source, inspect diff and all `blocked` reasons.
- [ ] **Step 5: Commit.** `git add tools/m4-inventory.mjs tests/m4-inventory.test.mjs docs/migration/m4-assets-inventory.json && git commit -m "chore(m4): inventory canonical visual and audio assets"`.

### Task 2: Deterministic Source Cue Map for S01–S03

**Files:** Create `game/visuals/source-map.json`, `tests/m4-source-map.test.mjs`; inspect `game/src/story.js`, `game/src/scenes/s02.js`, `s03.js`, old `src/literary-visual-directions.js`.

**Interfaces:** `source-map.json` includes `sourceCommit`, `sourceSceneId`, `sourceCueId`, original `at:[chunkIndex,paragraphIndex]`, exact `graphBeatId`, converted `when?`, and `status` (`mapped|explicitly-unillustrated|obsolete-with-reason|blocked`). A cue with ambiguous match is not copied to runtime presentation.

- [ ] **Step 1: RED tests.** Verify `S01` initial airport, Nick introduction, outside rain, Damir encounter, 3 seat branches and common reconvergence; `S02` roadside café, `S03` editor-call and Damir CG. Every mapped ID must exist in current graph, every source cue must have exactly one status, route predicates must reflect `s01-seat-eric|nick|damir` flags, and neutral fallback must not borrow art. Run `node --test tests/m4-source-map.test.mjs`.
- [ ] **Step 2: Run RED.** Expected fixture/map missing or unmatched.
- [ ] **Step 3: Build explicit mapping**, using original source chunk and paragraph boundaries and current `beats()` paragraph segmentation; record digest of source text blocks when exact matches exist. Do not infer speaker or location from the visual keyword search. Mark uncertain cue `blocked` and list reason in QA doc; do not force acceptance.
- [ ] **Step 4: Run GREEN.** Same tests, inspect the map against source manually; no skipped conditions.
- [ ] **Step 5: Commit.** `git add game/visuals/source-map.json tests/m4-source-map.test.mjs && git commit -m "feat(m4): map pilot literary cues to native beats"`.

### Task 3: Game Presentation Manifest, Proof and Native Component Adoption

**Files:** Create `game/visuals/presentation.json`, `tools/m4-build-presentation.mjs`, `game/src/presentation.js`, `tests/m4-presentation.test.mjs`, `tests/m4-studio.test.mjs`; modify `game/src/story.js`, `game/narrative-assets.json`, managed components **only via Studio**.

**Interfaces:** `buildPresentation({projectRoot,write=false}) → {presentationSha256,storySha256,assetIds,blocked}`. `write=false` read-only reproducibility check; `write=true` generates `src/presentation.js` (exports `presentationData`) and canonical `narrative-assets.json` proof. `presentationData` passes `defineNarrativePresentation(graph,presentationData)` from Ludory M4A. One source of truth is `visuals/presentation.json`; all media paths flat `assets/vis-*.webp`/`.png`.

- [ ] **Step 1: RED tests.** S01–S03 state/render display matches exact names/cues; all three S01 seats return proper visual stage; `narrative-assets.json.storySha256 == sha256(game/src/story.js)`; every `presentation.media` has accepted inventory entry and proof/hash; unknown media, symlink, wrong SHA, missing image and URL fail validation; legacy `m2-s01.test.mjs` proof assertion is **updated only** for new expected accepted media, not removed. Check immutable graph choice count and ending IDs.
- [ ] **Step 2: Run RED.** `node --test tests/m4-presentation.test.mjs tests/m4-studio.test.mjs tests/m2-s01.test.mjs`; new assertions fail until wiring exists.
- [ ] **Step 3: Implement generator and integration.** Add `export {presentationData} from './presentation.js'` to `src/story.js` *without editing prose*. Use **verified M4A Ludory commit** to run `node packages/studio/bin/ludory.mjs components update --project <absolute-game-dir> --json` first; require `READY` and no authored conflict; only then `--apply`. Update `ludory.studio.json` and `ludory.components.json` via Studio, not by hand. Block admission until separate exact approval for asset tool/destination; an unapproved asset remains explicit neutral in manifest.
- [ ] **Step 4: Run GREEN.** `node --test tests/m4-presentation.test.mjs tests/m4-studio.test.mjs tests/m2-s01.test.mjs`; `node tools/m4-build-presentation.mjs --check`; Studio `components status` and read-only `preview` build; verify byte-identical unchanged authored narrative, no disabled economy paths.
- [ ] **Step 5: Commit.** Stage source, generated data, proof and verified Studio receipts, then `git commit -m "feat(m4): wire pilot visual presentation through Ludory"`.

### Task 4: Pilot Browser Acceptance (S01–S03)

**Files:** Create `docs/qa/m4-pilot.md`; extend `tests/m4-presentation.test.mjs` and browser capture configuration through Ludory QA workflow.

**Interfaces:** Evidence records `browser`, viewport, exact git SHA, scene/beat/route, screenshot path/digest, visible bounds, `PASS|FAIL|BLOCKED_BROWSER|BLOCKED_ASSET`, and selected provenance receipt.

- [ ] **Step 1: RED scenarios.** Three S01 branch states, S02 café change, S03 Damir appearance; 390×844 portrait/1000×720 wide; Save→Restore, Back→alternate seat, Reload, journal, keyboard focus; images with 404 give neutral stage. Assert the resolved media ID equals authored cue, no face crop/text overflow.
- [ ] **Step 2: Run RED.** In browser-capable host use `node packages/studio/bin/ludory.mjs preview --project <absolute-game-dir> --lan` and capture via documented QA runner. If sandbox prevents Chromium startup, report `BLOCKED_BROWSER` with stack/command; no fabricated screenshots or PASS.
- [ ] **Step 3: Fix only demonstrated presentation defects**, add reproducible `m4-pilot.md` results; do not alter literary text or route decisions to satisfy visual assertions.
- [ ] **Step 4: Run GREEN.** Targeted game tests, Studio preview/export preflight and actual screenshots on both sizes. If assets rights/browser are blocked, keep Draft and record unresolved gate.
- [ ] **Step 5: Commit.** `git add docs/qa/m4-pilot.md tests/m4-presentation.test.mjs && git commit -m "test(m4): capture S01-S03 visual acceptance"`.

### Task 5: Complete S04–S66 Visual Timeline, OST and Draft Review

**Files:** Extend `game/visuals/{source-map,presentation}.json`, `docs/migration/m4-assets-inventory.json`, `tests/m4-source-map.test.mjs`; add `tests/m4-all-routes.test.mjs` and `docs/qa/m4-full-review.md`; adjust `README.md`. Add admitted media only upon separate authorization.

**Interfaces:** Reuse Tasks 1–4; every source cue has exact status, each reachable beat has a resolved illustrated or explicit neutral stage. Audio `audioCueMap` associates authored scene/route to 8 licensed track IDs and CDN URL supplied only after provenance check; no guessed endpoints.

- [ ] **Step 1: RED tests.** All 66 source scenes and every legacy cue accounted for; per-route visual state never leaks into another ending; 7 ending IDs maintain baseline; S17 kitchen does not show S18 harbor by name alone; empty-art scenes neutral; missing/unverified music not referenced in runtime/ZIP; audio failure never blocks narrative.
- [ ] **Step 2: Run RED.** `node --test tests/m4-source-map.test.mjs tests/m4-all-routes.test.mjs`; expected coverage failures for scenes not yet mapped.
- [ ] **Step 3: Extend map/admission in batches** by source chronology, each with own artistic review and hash receipts. Verify runtime audio adapter (`packages/runtime/src/audio.mjs`) and existing OST/CDN contracts before implementing playback, ensure user gesture for autoplay and mute/lifecycle compatibility. Create `BLOCKED` for unverifiable records, not automatic art generation.
- [ ] **Step 4: Run GREEN.** Targeted tests, then **full** `npm test` (baseline prior execution 237/237, ~29min, re-run actual); `git diff --check`, `node --check` affected JS; actual 7-path QA screenshots and dual-platform *local* export/preflight as available. No claims of CI/browser/platform PASS without logs.
- [ ] **Step 5: Commit and PR.** Commit `feat(m4): complete authored visual timeline`; publish Draft game PR (may extend PR #2 only with explicit scope decision), include exact parent/head SHA, accepted/blocked counts, source receipts, QA evidence, unresolved gates; **no merge**, release, real-platform moderation or publication.

## Release/Execution handoff

1. M4A must be completed/tested before Task 3 component adoption; Tasks 1–2 of M4B can proceed read-only independently.
2. Asset write/admission requires exact command and destination approval independently of this plan; `game-dev` absence is a real blocker to the preferred workflow.
3. User reviews the plans before execution method is chosen. On execution, maintain task-level RED/GREEN evidence and commits; blocked browser/asset gates keep PR Draft and release not ready.
