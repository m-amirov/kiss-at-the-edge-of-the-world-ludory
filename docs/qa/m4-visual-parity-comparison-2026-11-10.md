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
