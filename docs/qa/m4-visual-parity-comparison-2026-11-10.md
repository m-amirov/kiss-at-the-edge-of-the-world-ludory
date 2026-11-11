# M4 — сравнение UI с исходным `final-ui-*`

Дата сравнения: 2026-11-10. Сравнение выполнено до исправлений по реальным
скриншотам CI-артефакта [13749536584](https://github.com/m-amirov/kiss-at-the-edge-of-the-world-ludory/actions/runs/42784377417/artifacts/13749536584)
и эталонам, сохранённым в исходном репозитории на commit
[`1e775f1`](https://github.com/m-amirov/kiss-at-the-edge-of-the-world/blob/1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c/release-artifacts/).

## Наблюдения до исправлений

| Область | Исходный `final-ui-*` | CI до исправлений | Минимальное действие |
| --- | --- | --- | --- |
| Меню | Kicker `РОМАНТИЧЕСКАЯ ИСТОРИЯ · ИСЛАНДИЯ`, авторский summary, первичная `Новая игра`, вторичные `Эпизоды` и `Настройки` | Другой kicker/summary, `Продолжить чтение`, три вертикальные кнопки, дополнительная иконка в потоке | Вернуть исходную копию и группировку; не добавлять `Эпизоды`, поскольку Ludory Runtime не предоставляет episode picker; сохранить реальные `Начать заново` и `Настройки` |
| Обложка меню | Снимок `final-ui-menu-*` использует исходную indoor-композицию | В PR уже утверждена отдельная lossless PNG-обложка `kiss-at-the-edge-cover.png` | Сохранить утверждённую PNG и не возвращать старый WebP; исправлять только композицию UI поверх неё |
| Верхняя навигация | Одна кнопка `☰ Меню` слева; метаданные не конкурируют с управлением | `Меню` справа, `Назад`/`Журнал` слева | Перенести меню в левую иерархию, оставить `Назад`/`Журнал` реальными runtime-контролами вторичного уровня справа |
| Мобильный CG | Полная иллюстрация и персонажи остаются в кадре | `object-fit: cover` обрезает S03/S07 и аналогично рискует обрезать S26/S38/S39 | На мобильном CG использовать `contain`, сохраняя исходные PNG без перекодирования |
| Длинный текст | Нижняя панель читаема и не закрывает всю сцену | Панель могла занимать до `68dvh` | Ограничить мобильную панель `min(64dvh,560px)` и оставить вертикальную прокрутку текста |

## S01 и допуск ассетов

S01 остаётся намеренно нейтральным. В `game-studio/visuals/source-map.json`
отмечены `keflavik-airport-arrivals-v1.webp` для `s01-airport-01`,
`road-trip-van-interior-rain.webp` для автомобильных веток
`s01-eric-01`/`s01-nick-01`/`s01-damir-01`, а также связанные airport cues.
В `docs/migration/m4-assets-inventory.json` исходные PNG
`keflavik-airport-arrivals-v1.png`, `keflavik-airport-departures.png` и
`road-trip-van-interior-rain.png` имеют статус `blocked` с причиной
`rights_missing` и без `licenseEvidence`. Они не допускаются в presentation и
не должны появляться в браузере.

Текущий допуск сохраняет 63 `accepted`, 0 `candidate`, 60 `blocked`; старый
`menu-hero.webp` остаётся неиспользуемым. Ни один оригинальный PNG или шрифт в
рамках этого UI-исправления не изменяется.

## Статус

Минимальный перечень исправлений определён до реализации и покрыт
`tests/m4-visual-parity-regression.test.mjs` и расширенными assertions в
`tests/m4-browser-qa.mjs`. Независимая художественная приёмка остаётся открытой
до просмотра нового мобильного и desktop-артефакта и сравнения его с
`final-ui-menu-*`/`final-ui-reader-*`; прохождение автоматических тестов не
является художественным `PASS`.

## После исправлений: фактические кадры

Локальный финальный прогон `npm run qa:m4:browser` создал полный набор в
`artifacts/m4-browser-qa/`, включая:

- меню: `mobile-390x844-menu.png`, `desktop-1000x720-menu.png`;
- мобильные кадры без crop: `mobile-s03-damir.png`,
  `mobile-s07-kitchen-pasta.png`, `mobile-s26-choice-eric-01.png`,
  `mobile-s38-paused-01.png`, `mobile-s39-active-01.png`;
- desktop кадры: `desktop-s38-paused-01.png`, `desktop-s39-active-01.png`,
  `desktop-s44-epilogue.png`, `desktop-s46-epilogue.png`,
  `desktop-s48-departure.png`.

Фактический CI «после» набор доступен как
[artifact 13765636255](https://github.com/m-amirov/kiss-at-the-edge-of-the-world-ludory/actions/runs/42815577308/artifacts/13765636255);
push-run и PR-run для HEAD `5593b76` завершились успешно. Предыдущий «до» набор остаётся доступен как
[artifact 13749536584](https://github.com/m-amirov/kiss-at-the-edge-of-the-world-ludory/actions/runs/42784377417/artifacts/13749536584).

Независимое визуальное заключение по кадрам после исправлений: механическая
проверка framing/legibility проходит, но художественная приёмка **OPEN**. В
мобильном portrait CG показывается целиком с blur-fill подложкой, а не как
оригинальный portrait render; это честный компромисс без использования
заблокированных portrait-файлов. Меню сохраняет утверждённую PNG-обложку, хотя
её композиция отличается от indoor baseline; это зафиксированное требование
качества PNG, а не основание возвращать старый WebP.

## Реализация утверждённых прототипов A1/A2

Рабочая реализация выполнена поверх author-owned presentation/UI на HEAD,
производном от `b1a13025a11fee21f71fa87bc81cb411a0d909ec`; managed Studio-файлы,
сюжет, сохранения, шрифты, PNG и экономика не изменялись.

| Cue | Утверждённая композиция | Реализация |
| --- | --- | --- |
| S03 Damir | A2 | scene-specific scale `1.45`, `contain`, верхняя фокусировка |
| S07 pasta/cards | A1 | полный authored frame, `contain`, без crop |
| S26 Eric/Nick/Damir/Alice | A2 | scene-specific scale `1.6`, `contain` |
| S38 Alice/Nick | A2 group | умеренный scale `1.18`, обязательный `contain` |
| S39 café / walk | A2 | scale `1.48`; walk корректно обрабатывается как presentation background |

На мобильных 320×700, 390×844 и 430×932 `Меню`, `Назад` и `Журнал`
проверяются в одной строке с touch target не менее 44×44 CSS px, безопасными
отступами и без горизонтального overflow. Нижняя panel имеет `min-height: 0`
и native vertical scroll; браузерный gate действительно прокручивает длинный
S38 dialogue до кнопки `Далее`, а не ослабляет проверку.

Фактическое локальное browser evidence создано из этого рабочего состояния в:
`C:\Users\user\AppData\Local\Temp\pr3-m4-visual-b1a13025-final4`.
Набор включает desktop/mobile menu, S03, обе ветки S07, S26, S38, обе ветки
S39, S44/S46/S48 и все три мобильных viewport для шести утверждённых
композиций. `npm run qa:m4:browser` завершился строкой
`M4_BROWSER_QA_PASS` без JavaScript errors.

## Текущие release gates

- Static: `41` тест, `40` pass, `1` существующий intentional skip, `0` fail.
- Presentation check: legacy `--check` и `--check --project game-studio` pass.
- Browser: локальный реальный Chromium pass и GitHub Actions pass на
  исправленном кодовом HEAD `305b7d423c70ec85eb69cab2e3bdb23457e98516`.
  [Push run 42964326798](https://github.com/m-amirov/kiss-at-the-edge-of-the-world-ludory/actions/runs/42964326798)
  и [PR run 42964337382](https://github.com/m-amirov/kiss-at-the-edge-of-the-world-ludory/actions/runs/42964337382)
  завершились `success`; статические/provenance checks, Chromium, реальная
  browser QA и сохранение screenshots прошли.
- Новый CI screenshot artifact для прежнего baseline:
  [m4-actual-game-browser-qa, artifact 13789731891](https://github.com/m-amirov/kiss-at-the-edge-of-the-world-ludory/actions/runs/42869965437/artifacts/13789731891),
  ZIP SHA-256 `99d4ceee9930b77c14d9038822f66506951ba910e9f1041846e1f7ba8b55861c`.
  Актуальный PR-артефакт после safe-area исправления:
  [m4-actual-game-browser-qa, artifact 13830364922](https://github.com/m-amirov/kiss-at-the-edge-of-the-world-ludory/actions/runs/42964337382/artifacts/13830364922),
  ZIP digest `sha256:8f4cad3d32b3df264bbda0d3d6e219c20759058b0bbdf72bf22105b9e4c33d25`.
  В нём есть мобильные 320×700, 390×844 и 430×932 кадры для S03, S07 pasta/cards,
  S26, S38, S39 café/walk, а также desktop menu и проверенные эпилоги.
- Независимое визуальное сравнение фактических CI-кадров выполнено, но
  художественный gate остаётся **OPEN**, а не `PASS`: лица и group-CG не
  исчезают, S38 сохраняет `contain`, длинный текст прокручивается, кнопки и
  оригинальные шрифты проходят техническую проверку; при этом меню с
  утверждённой lossless PNG-обложкой композиционно отличается от indoor
  `final-ui-menu-*` baseline. Требуется отдельное решение владельца дизайна по
  этому расхождению.
- Известное визуальное отличие: утверждённая lossless PNG-обложка меню
  сохраняется; она композиционно отличается от исходного indoor
  `final-ui-menu-*`, поэтому старый пережатый WebP не возвращается.

## Safe-area follow-up — 2026-11-11

Независимый просмотр кадров из предыдущего CI-артефакта подтвердил одну
первопричину для S03, S07, S38 и S39: основной image layer имел `top: 0`, а
fixed-навигация занимала верхние 44px плюс верхний отступ. `transform-origin:
center top` сохранял масштаб, но не создавал safe area, поэтому лица и правые
участники оказывались под кнопками. Blur-fill остаётся полноэкранным и может
быть под навигацией; сдвигается только основной CG/background layer.

Исправление ограничено mobile presentation: `--original-cg-safe-top` равен
`max(58px, calc(env(safe-area-inset-top, 0px) + 48px))` и применяется к
утверждённым CG и S39 background, включая source-bound fallback selectors.
Масштабы A1/A2, `contain`, PNG, шрифты, текст, сюжет и managed Studio-файлы
не менялись. Browser QA теперь проверяет фактические bounding boxes: верх
основного media layer не может пересекать нижнюю границу `Меню`/`Назад`/
`Журнал`.

Новый локальный прогон `npm run qa:m4:browser` создал кадры из исправленного
рабочего состояния в:
`C:\Users\user\AppData\Local\Temp\pr3-m4-visual-safe-top-26b9941b-031c-4868-96cf-26b9a7d1d3e1`.
Проверены S03, S07 pasta/cards, S26 Eric, S38 group и S39 café/walk на
320×700, 390×844 и 430×932; результат — `M4_BROWSER_QA_PASS`.

Side-by-side comparisons `before → after` подготовлены из предыдущего
CI-артефакта [13791325367](https://github.com/m-amirov/kiss-at-the-edge-of-the-world-ludory/actions/runs/42871890763/artifacts/13791325367)
и новых кадров в:
`C:\Users\user\AppData\Local\Temp\pr3-m4-before-after-acbec444-5019-40f8-a1a2-00eec26360ae`.
Фактические кадры нового PR-HEAD доступны в [artifact 13830364922](https://github.com/m-amirov/kiss-at-the-edge-of-the-world-ludory/actions/runs/42964337382/artifacts/13830364922)
и локально в:
`C:\Users\user\AppData\Local\Temp\pr3-m4-ci-42964337382b-f706734f-c586-447c-bcc2-cb4a15ca22ed`.
Representative-кадры нового артефакта просмотрены для S03, обеих S07, S26,
S38 и обеих S39; safe-area дефекты устранены. Художественная приёмка по
общей visual parity по-прежнему остаётся открытой до независимого решения
по отличию утверждённой lossless PNG-обложки от indoor `final-ui-menu-*`
baseline.

## Issue #4 — мобильные portrait sources и responsive admission (2026-11-11)

Этот раздел фиксирует актуальную реализацию поверх исторических наблюдений
выше. Старые описания scale `1.45/1.6/1.18/1.48` относятся к предыдущему
состоянию PR и не являются текущими правилами для portrait PNG.

### Admission и provenance

Добавлен отдельный `docs/migration/m4-mobile-assets.json` с pinned source
commit `1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`, breakpoint `680`, SHA-256,
размерами, license/admission evidence и соответствующим desktop media ID.
Для S07 pasta/cards и всех четырёх S26 choice-веток Git blob SHA совпал с
источником; PNG байты и разрешение сохранены. S03/S38/S39 используют
source-bound portrait candidates и имеют статус `pending-independent-review`,
а не художественный `PASS`.

Старые portrait candidates S03/S38/S39 записаны в `rejectedCandidates` и не
подключаются автоматически. Для S39 walk сохранён authored transition
background с fail-closed `desktop-fallback`; романтический portrait вместо него
не подставляется. Заблокированные S01 assets не допущены.

### Runtime/UI

`original-game-ui.js` выбирает portrait source при ширине `<=680px`, desktop
landscape source при большей ширине и переключает source на resize без reload.
Текущий HTML `src` читается до `currentSrc`, поэтому задержка загрузки PNG не
создаёт повторную запись через `MutationObserver`. `original-game.css` отключает
blur-fill только для admitted portrait/fallback слоя, сохраняет `contain`,
safe-area верхней навигации, читаемую прокрутку диалоговой панели и touch
targets `44px+`. Managed Studio files, story graph, text, fonts, desktop
landscape PNG и economy не менялись.

### Фактический Chromium evidence

Локальный запуск `npm run qa:m4:browser` на обновлённом рабочем состоянии
завершился `M4_BROWSER_QA_PASS` без JavaScript errors. Evidence directory:

`C:\Users\user\AppData\Local\Temp\issue4-m4-browser-final-d32c7381-9206-4c9d-aadc-99ccb8f5bb88`

В наборе есть реальные кадры меню и reader для desktop `1440x900`, mobile
`320x700`, `390x844`, `430x932`, а также S03, обе S07, Eric/Nick/Damir/Alice
ветки S26, S38, S39 café и S39 walk, S44/S46/S48. Проверены source switch
без reload, Save/Reload/Back/Continue, длинный текст, safe-area, отсутствие
горизонтального overflow и загрузка оригинальных шрифтов.

Автоматический browser/static gate проходит; независимый художественный gate
остаётся `OPEN` для S03/S38/S39 до отдельного просмотра portrait candidates и
сравнения с canonical `final-ui-*`. Наличие корректного runtime evidence не
подменяет это независимое решение.
