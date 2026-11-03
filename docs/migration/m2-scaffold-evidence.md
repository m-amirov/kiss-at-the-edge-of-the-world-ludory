# M2 — Нативный Studio scaffold

Дата: 2026-11-03. Source Ludory pinned at `0d034f1ab7e559b07080c00f6386a453e0e398b2`.

Создано **внутри** новой директории `game/` через официальный `create --preview` → `create --apply`; не переносились рецепты доверия из другого каталога.

| Шаг | Наблюдаемый статус |
| --- | --- |
| `create` preview, profile `narrative-game`, template `narrative-interactive`, targets `yandex-games,vk-games` | `READY`, `conflicts: []` |
| `create --apply` в пустом `game/` | `APPLIED`, 11 записанных файлов |
| `inspect --project game` | `CURRENT`, exit 0 |
| `components status --project game` на текущем хосте | `IN_SYNC`, exit 0 |
| `node --check game/src/main.js` | exit 0 |

Контракт шаблона: `narrative-interactive` 1.2.0, profile `narrative-game` 1.1.0, Node.js 22+; основной `src/main.js` остаётся неизменённым для проверяемого programmatic export F5b2. После авторской интеграции S01 demo-story заменён, изображения маяка/берега удалены из проекта и из `narrative-assets.json`.

`components status: IN_SYNC` относится **только к неизменённому созданному шаблону**. После переноса S01 на этом же хосте наблюдается `CONFLICT` для изменённого `story.js`/`narrative-assets.json` и удалённых `lighthouse.svg`/`shoreline.svg`. Это ограничение текущего механизма managed-компонентов Ludory, а не свидетельство возврата исходного сюжета; экспорт F5b2 проверяется отдельно.

## Граница host trust

Проверка простого копирования шаблона в **другой** корень дала `components status: BLOCKED` с причиной `no registered Studio ownership for this game`. Это ожидаемое ограничение безопасности Studio: `ludory.studio.json` и component manifest не дают права доверять файлам на новом хосте. Не применяли `acceptComponentTrust` и не обходили проверку. После клонирования на другой компьютер владелец должен отдельно просмотреть и подтвердить состояние компонентов по штатному trust-transfer процессу, прежде чем заявлять `IN_SYNC` на том хосте.

**Не заявлено:** готовность игры, канонический сюжет, browser QA, SDK, права на ассеты, релиз/публикация.
