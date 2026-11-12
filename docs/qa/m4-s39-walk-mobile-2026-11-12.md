# M4 S39 walk mobile QA — 2026-11-12

## Scope

Issue #5 для S39 walk реализован поверх фактического remote HEAD PR #3. Существующие 9 mobile mappings сохранены; добавлен отдельный десятый portrait PNG только для S39 walk. Desktop-ассет сохранён без перезаписи. Narrative, choices, saves, fonts, S39 café CG, economy и managed Studio не менялись.

## Provenance и SHA-256

| Asset | Dimensions | Bytes | SHA-256 | Статус |
| --- | ---: | ---: | --- | --- |
| `game-studio/assets/vis-s39-alice-damir-cafe-walk.png` | 1920×900 | 1,511,085 | `229f4d2898d66f135e027d6d871517363174c4e40c9fc580dbcf1fe0163f282e` | исходный desktop сохранён |
| `game-studio/assets/vis-s39-alice-damir-cafe-walk-portrait.png` | 1024×1536 | 2,859,863 | `815361d1236108ff64644d33bf56bc1c477977a7d4e68ed7de78fef41d9060fe` | новый native portrait; pending independent review |

Desktop provenance закреплён в `docs/migration/m4-mobile-assets.json`: source commit `1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`, Git blob `bd7be888ae455d686618935c30ad306c742967ff`, исходный SHA-256 выше. Portrait получен встроенным ImageGen 2026-11-12 как отдельный environment-only PNG, без crop/upscale/recompression; reference source — исходный S39 desktop asset. Raw copy для проверки приложен в `artifacts/issue-5-published/s39-cafe-walk-portrait-raw.png` с тем же SHA-256.

Визуально исходный PNG содержит дождливую портовую прогулочную сцену в синем сумеречном свете: мокрая мостовая, фонари, лодки и горы; персонажей, UI, текста и watermark нет.

## Автоматические проверки

- `node --test tests/m4-*.test.mjs` — 46 PASS, 1 SKIP (owner registry unavailable), 0 FAIL.
- `node tools/m4-build-presentation.mjs --check --project game-studio` — PASS; manifest содержит 10 mobile assets, включая `s39-alice-damir-cafe-walk-portrait`.
- Обе presentation checks — PASS после штатного `--write`; legacy generated files не входят в Issue #5 commit.
- `git diff --check` — PASS, whitespace errors отсутствуют.
- `npm run qa:m4:browser` — `M4_BROWSER_QA_PASS`: mobile/desktop, Save/Reload/Back, S01→S03, S07, S18, S26, S38/S39, S44/S46→S48, fonts, image geometry, no JS errors.

## Browser и visual evidence

Проверены viewports 320×700, 390×844, 430×932 и desktop 1440×900. До изменения baseline capture `artifacts/issue-5-before/mobile-s39-cafe-walk-390x844.png` показывает desktop café image на mobile. После изменения:

- `artifacts/issue-5-published/mobile-s39-cafe-walk-320x700.png` — portrait source загружен, dialogue panel и кнопка доступны, горизонтального overflow нет.
- `artifacts/issue-5-published/mobile-s39-cafe-walk-390x844.png` — portrait занимает mobile stage, сцена читаема, panel не ломает композицию.
- `artifacts/issue-5-published/mobile-s39-cafe-walk-430x932.png` — тот же mobile source и корректная responsive геометрия.
- `artifacts/issue-5-published/desktop-s39-cafe-walk-1440x900.png` — исходный desktop source сохранён и используется на desktop.

## Gate status

- Mechanical/provenance: **PASS**.
- Runtime/browser responsive behavior: **PASS**.
- Local pixel visual QA: **PASS** по перечисленным captures и raw PNG.
- Независимая художественная приёмка **конкретно S39 walk**: **ACCEPTED** 2026-11-12 по мобильным скриншотам 320×700, 390×844 и 430×932 (подробности и ограничения: https://github.com/m-amirov/kiss-at-the-edge-of-the-world-ludory/issues/5#issuecomment-6824910484). Статус `artStatus: approved-independent`. Было проверено визуальное качество браузерных кадров и Git blob identity; отдельная полнопиксельная инспекция raw PNG не заявляется. Остальные source-bound кандидаты S03/S38/S39 café по-прежнему pending.
- Release readiness, merge и публикация игры: **не заявляются и не выполнялись**; PR должен оставаться Draft.

## Full-suite note

Полный `npm test` был запущен на чистом detached worktree remote HEAD `30c50a79b412630d34bd01bd779bc8b794f7f51b`; диагностический прогон остановлен после test 80 из-за многочасовых Windows runtime-матриц. Лог: `artifacts/issue-5-baseline/npm-test-clean-remote-partial.log`.

В чистом baseline воспроизведены следующие failures:

- M1 tests 3–7 (`tests/m1-inventory.test.mjs:50`, `:62`, `:71`, `:78`, `:99`) — одинаковый `ENOENT` при записи fixture `C:\Users\user\AppData\Local\Temp\m1-git-fixture-*\content\line\nbreak.md`; это Windows path/fixture defect, не Issue #5.
- M3 S06 (`tests/m3-s06.test.mjs:192`) — `assert.ok(gameRoot.endsWith('/game/'))` на Windows path; это POSIX-only assertion, не Issue #5.

Тот же M1 failure записан в `artifacts/issue-5-baseline/npm-test-issue5-worktree-comparison.log` на publish worktree. M4 target suite завершён отдельно без failures; full-suite PASS локально не заявляется. Известный stale legacy generated proof также воспроизведён на clean baseline и устраняется штатным `--write`; legacy generated files не входят в Issue #5 commit.

## Post-review provenance sign-off

- Независимое визуальное заключение: [Issue #5, комментарий 6824910484](https://github.com/m-amirov/kiss-at-the-edge-of-the-world-ludory/issues/5#issuecomment-6824910484).
- По сравнению с прежним desktop fallback новый портретный S39 walk лучше сохраняет детализацию гавани, гор, освещения и мокрой набережной; надписи, игровые кнопки и персонажи на проверенных скриншотах отсутствуют внутри самого фона.
- Согласованная правка только метаданных: `artStatus: approved-independent` для S39 walk; source PNG, desktop PNG, story, runtime и mobile mapping не модифицированы.
- Подтверждение окончательной записи зависит от успешных проверок GitHub Actions на коммите с этой поправкой. Глобальная художественная и релизная приёмка PR #3 остаётся открытой.
