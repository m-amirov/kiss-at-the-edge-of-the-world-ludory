# M3 — S10 «Дорога к Vík. Песня на полчаса»

**Канонический источник:** `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`, `content/season-1-literary-episode-03.md`, от заголовка S10 до S11. `docs/SEASON_1_SCENE_MATRIX.md` того же закреплённого commit подтверждает место S10 после Skógafoss.

В S10 входят все игроки без route lock. Авторский текст об Эрике сохраняется дословно: общий разговор о музыке, условная отсылка к S01-C1, свободный ответ Алисы и единое завершение в гостевом доме Vík.

## Контракты графа

- `s09-common-b` теперь ведёт в `s10-intro`; ранее существовавшая Draft-заглушка `s09-m3-end` удалена.
- `s10-seat-dispatch` — строго технический выбор `Продолжить`, **без effects**. Если установлен `s01-seat-eric`, показывает `s10-seat-eric`. Для `s01-seat-nick|damir` показывает `s10-seat-other`. Все сходятся в один `s10-choice`.
- Авторский S10-C1: `playful` («Подхватить игру») или `quiet` («Оставить момент тихим»), ровно один `eric-tone-playful|quiet` flag. Обе альтернативы бесплатные, без очков отношений, route lock, IAP, premium-content или rewarded ads. В будущем S14 этот флаг должен определять авторский отклик, но S14 пока не интегрирована.
- После `s10-common` следует только техническое `s10-m3-end` (не литературный финал); следующая S11 ожидает переноса. Старые Draft-сохранения на удалённой заглушке S09 могут потребовать явный Restart; автопреобразование чужих состояний не допускается.

## Поблочная сверка текста

Хеши вычислены независимым Node.js парсером непосредственно из pinned `.md` без чтения `game/src/scenes/s10.js`. SHA-256 строки UTF-8 с разделителем абзацев `\n\n`, заголовки, `**Состояние:**` и инструкции по условию не попадают в отображаемый текст.

| Runtime scene | Абзацев | SHA-256 |
| --- | ---: | --- |
| `s10-intro` | 37 | `e9d348cda4dd13ba9d349c907cd0e8179789f1605fc00ecb84da5ac3bdbb45d8` |
| `s10-seat-eric` | 4 | `2b2aa8e0ec19ea74dfc5ef5ca54d09d34a0ad7498a20fe9f682ad043ada45d19` |
| `s10-seat-other` | 3 | `8ba0c85d06f999c4d36acb5f8d135561dc939fcecd4a9dde32609583ff1999f2` |
| `s10-playful` | 5 | `633812b5a1754d6c56ddfe26d22d105098335ba279d6b45dadec2094cf4cde53` |
| `s10-quiet` | 2 | `5e93562a95c3532854991c64b8fbb5deb4a8a672992ea7ce00951ac4d4a72929` |
| `s10-common` | 1 | `1b5c889dfbd25901024b0358304391af00e023256adfda88c112862b3dcb3ad5` |

**Всего 52 уникальных авторских абзаца**, на одном прохождении 43–47 в зависимости от места в S01 и выбора S10. Технические `Продолжить` и граница не считаются авторским текстом.

## Регрессионная приёмка и ограничения

- TDD: до реализации S10-тест дал **3 ожидаемых FAIL / 1 economy PASS**, из-за отсутствия S10 и старой границы S09; затем S10 **4/4 PASS**.
- Совместная регрессия S09+S10 **8/8 PASS**, полный `npm test` **63/63 PASS**; `node --check game/src/story.js`, `node --check game/src/scenes/s10.js`, `git diff --check` — PASS. Это локальная проверка кода, не UI или release certification.
- Реальный N1 runtime проверяет **все 3 варианта S01 × оба S10-C1**: нет доступа к чужой ветке S01; Back отменяет новый флаг, не стирая S01 и S09, и разрешает выбрать противоположный тон. JSON `stringify`→`parse` на новом runtime удерживает нужные flags; добавление конфликтующего либо удаление обязательного `eric-tone-*` flag отвергается как несогласованный `actionLog provenance`.
- Независимый READ-ONLY review после усиления тестов: **0 Critical / 0 Important / 1 Minor**. Все 6 source-блоков и 81 историческая сцена проверены; единственное разрешённое изменение прежней сцены — переход `s09-common-b`. Minor (отложено): постоянный regression browser/launcher restore старого Draft-save с уже удалённым `s09-m3-end` и явным Restart. N1 отвергает неизвестную сцену без `setState`, но весь UI storage workflow не был проверен.
- SHA `game/src/story.js` (дублируется в `game/narrative-assets.json`): `2eeefd2271fd17ee3d37d9f865d7470b0d1341709e09c17b6807d35353d20427`.
- Economy E5 **OFF** для первой игры. Никакой покупки, начисления валюты или premium gate в S10 нет.
- Studio schema 1/2 incompatibility (`Invalid component state fields`) не обходилась. Действительные Yandex/VK ZIP и receipts для S10, браузерная/мобильная проверка, device Save/Reload, изображения/права, локализация EN, GitHub CI и релизная модерация **NOT_RUN/BLOCKED**. Исторические ZIP проверяли только прежний граф S05.

**Статус:** M3 продолжается в Draft PR #2; `releaseReady=false`, `publicationAllowed=false`; никакого merge в `main` или публикации.
