# M3 — S07 «Общая кухня. Ник и катастрофа с макаронами»

Дата: 2026-11-04. **Частичный M3**, существующий Draft PR #2: S01 → S02 → S65 → S03 → S04 → S05 → S06 → S07. Исходный проект, Ludory framework и `main` не изменяются.

## Точный источник

- Read-only канон: `m-amirov/kiss-at-the-edge-of-the-world@1e775f1fcd5269b2574b5a120a1f4f6f716ebb8c`.
- Файл `content/season-1-vertical-slice-episodes-01-02.md`, секция `### S07. Общая кухня. Ник и катастрофа с макаронами` непосредственно перед `### S08. Гостевой дом. Лямка`.
- Все **14** авторских текстовых блоков перенесены точно. Тест сравнивает SHA-256 от фактических `dialogue.text.ru` в Ludory graph, соединённых `\n\n`, с независимо закреплёнными SHA источника.

| Проигрываемый блок | Абзацев | SHA-256 рукописи и графа |
| --- | ---: | --- |
| `s07-intro` | 1 | `6b6a4447252adc796a9111ccca601c644f7810b368900effddae9590d8f5a614` |
| `s07-weather-nick` | 4 | `c3a4fb3a9299bff78c02b353c5c05ba92f1b39fb6d71149274a91ea19677f189` |
| `s07-seat-nick` | 1 | `3e0387d2cfdd660ac8a48870d585016c7e73f950c4b201eb64877fc89a5b414d` |
| `s07-common-a` | 94 | `ba48e08eaf1f7bef3411ca46e16d7177cd3724d3a8e078df4d5c89388fca8a10` |
| `s07-camera-accepted` | 1 | `8787ce8842c61b213066cbafc2eaf08f8c3cb20c4484cd217a7b7c456b4bc00e` |
| `s07-camera-declined` | 2 | `7727fb8c95f8851e082d0213b6a5e4fac524413d348b76e4e8011b42f7c2bbf9` |
| `s07-camera-negotiated` | 1 | `14245f5dddd83dab25b0fadf4854047d213bf525ce2f6b1af8f1eac2d47c6d5e` |
| `s07-common-b` | 12 | `cb99d2acbc652a3910a661ce0a816de873452536382fac614d118d528ad43eba` |
| `s07-archive-nick` | 1 | `7054b75ff37e3be7f6f9f2e9eee0621d284e120c80c98aff3c8daad7d9718207` |
| `s07-archive-group` | 1 | `982a39c5476581087dd39241e5ebdbdd5e50b3dc0bddd6ccf323dc9a9e111614` |
| `s07-archive-private` | 1 | `f982f01520fffcff05428db2e01544aa2919744bd5647d0467577cbe232df9d4` |
| `s07-common-c` | 1 | `bae9019010b8b7b387bf08b61f772d9a71ddf342b8a22d95c180be5c989dc798` |
| `s07-eric-favorite` | 1 | `5981065d44abf4805d562a342c3c1a63ba95878830352a99aea9f6b16b42aa0d` |
| `s07-eric-music` | 1 | `6deb5fe6278806e79983ed27fada4bb4b5570cdeeb15c8eaad6849b33eb78cc5` |

- `game/src/scenes/s07.js` SHA-256: `b06e5f08fba8aca7855f4014370ab0f8110d1a8e53f11b5d727e38760d2f6acb`.
- `game/src/story.js` SHA-256: `0205f056abd87def46f8255c5b728726ddb0361ed7f089668faea70e03e711ed`; тот же digest в `game/narrative-assets.json`.

## Продолжения, согласие и бесплатный архив

1. Выборы S06-C2 A/B ведут непосредственно в `s07-intro`. Удалён прежний `s06-m3-end`.
2. Если S05-C1 был «Помочь Нику», показывается его авторская реакция на мокрые рукава; иначе эта вставка пропускается. Если в S01-C1 Алиса ехала с Ником, добавляется ещё одна реплика; иначе ничего не добавляется.
3. `consent-camera-accepted|declined-respected|negotiated` из S04-C1 определяет ровно одну из трёх авторских реплик. Отказ остаётся уваженным: нет автоматической съёмки или превращения отказа в согласие.
4. Авторский `S07-C1`: **снимок только Нику** / **общий снимок по согласию** / **не сохранять**. Выбор устанавливает один взаимоисключающий `kitchen-archive-nick|group|private` флаг. Реальное фото не снимается/не отправляется через API; это каноническая текстовая сцена и игровое состояние.
5. После общего текста S07 следует оригинальная реакция на `eric-map-favorite-place|music` из S06. Порядок реакции сохранён как в рукописи, даже если она литературно возвращает разговор к кухне. До S08 остаётся временный `s07-m3-end`.
6. Все выборы **бесплатны**: ни валюты, ни premium-веток, ни rewarded ads/IAP. Игра остаётся на `narrative-interactive`, не принимает opt-in `narrative-economy` (Ludory E5). Проверка free-play охватывает весь граф.

## Проверки

| Gate | Результат |
| --- | --- |
| TDD RED | Четыре теста провалились на отсутствии S07/старой S06 границе; economy-off уже проходил |
| S07 14 prose hashes, переходы, runtime-ветки, Back/JSON/corruption, economy-off | **5/5 PASS** |
| Полный `npm test` | **46/46 PASS** |
| `node --check` новых/изменённых исходников и теста, `git diff --cached --check` | **PASS** |
| Studio `components status` | **BLOCKED** в текущем checkout: `Studio host trust: trusted record directory does not exist`. Нельзя обходить host-trust или автоматически переназначать владение |
| Studio F5b2 Yandex/VK archive receipts | **NOT_RUN**: новый граф ещё не проходил обязательный trust/export gate |
| Реальные браузеры/мобильные, платформа, CI, права, модерация | **NOT_RUN** |

## Ограничения перед релизом

- Старое черновое сохранение на удалённом `s06-m3-end` несовместимо без явного Restart или отдельного versioned save-migration контракта. Не стирали и не переписывали пользовательские данные.
- После JSON восстановления проверено продолжение истории, но **Back через полный reload** не подтверждён из-за текущего memory-only history Ludory N1; требуется отдельная UX/Runtime приёмка.
- Английский текст — fallback на русский, новые изображения и права пока не подтверждены. Portrait, отображение технических «Продолжить», локальное воспроизведение и SDK остаются release gates.
- Draft PR не готов к слиянию или публикации: `releaseReady=false`, `publicationAllowed=false`.

Независимое read-only ревью: **0 Critical, 0 Important**. Три Minor закрыты: в README явно разграничены исторические ZIP до S07, runtime-тест дополнен двумя смешанными сочетаниями weather/seat Nick и запретами недоступных переходов seat/consent/S06-payoff. Эти добавочные проверки проходят отдельную повторную приёмку перед commit.
