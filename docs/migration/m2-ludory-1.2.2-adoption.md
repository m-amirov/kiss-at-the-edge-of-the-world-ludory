# M2 — принятие Ludory 1.2.2, контроль исходников и локальный экспорт

Дата: 2026-11-03. Репозиторий игры: `m-amirov/kiss-at-the-edge-of-the-world-ludory`, ветка `feat/m2-canonical-s01` (PR #2).

## Подтверждённая операция

До записи повторно проверены независимые согласованные значения:

- `stateSha256`: `a3a7a6de38b34b6eff6de00338907dfdb1edcda152dcd103c14382e6d712003a`
- `proposalSha256`: `b30867a37fd0398f422fda235c68cfb11cd26c8aa3d397a725cdc9305f9905ca`

`components adopt --apply` завершился `APPLIED`, без конфликтов. Обновлены только управляемые `index.html`, `src/main.js`, `ludory.components.json`. Переход `narrative-interactive` **1.2.0 → 1.2.2**, схема состояния **1 → 2**. Авторские пути `src/story.js`, `narrative-assets.json`, `assets/lighthouse.svg`, `assets/shoreline.svg` отделены от managed files. Отсутствующие демо-SVG не возвращались.

Локальная резервная копия автоматически создана Ludory по адресу `game/.ludory-components-backup-MjqxPr/`. Она оставлена нетронутой, в Git не добавляется.

| Контроль | Результат |
| --- | --- |
| `components status --json` | `IN_SYNC`, 1.2.2, `writes: []`, `conflicts: []` |
| SHA-256 `src/story.js` | `ecddb280fb6eef32c83d1b150d4e2772f5682f9d199f6887148fa865fe3571cb` |
| SHA-256 `narrative-assets.json` | `fa099ed3c0273533ee71e37f287590ef9641c62a537898967e418ac577737601` |
| Заголовок из манифеста | `Поцелуй на краю света · Ludory` |
| Локальный исходный export plan | `READY_TO_DERIVE` |
| Оба локальных кандидата | `CANDIDATES_BUILT_LOCAL` |
| Повторное чтение ZIP + проверка с исходным планом | `LOCAL_ARCHIVES_VERIFIED` |
| `npm test` | 17/17, exit 0 |

## Доказательство локальной сборки

- `sourceDigest`: `110f674ce3f03e5686efd3ee09b0eb2477e9f86fa2af8eccb4ae863a95a2f1de`.
- Яндекс ZIP SHA-256: `d2e4bc946d47ededd2a3293a8b3905b35a0f448f30046a31e94558cb171cd7b2`, 4 файла.
- VK ZIP SHA-256: `747c41ebd81ca865f11bf074e3718bc971d11d8e9e529c3d79c4543`, 7 файлов.
- Оба экспорта получены из одного доверенного плана на текущем хосте и независимо перепроверены; временные файлы удалены штатной scoped-очисткой.

**Границы подтверждения:** `releaseReady=false`, `publicationAllowed=false`. Не выполнялись реальный browser/mobile QA, платформенная модерация, публикация, проверки прав на графику или совместимости всех сохранений. Исходный репозиторий игры не изменён. Новый репозиторий содержит только S01; EP01–EP10 не перенесены полностью. Доверие Studio к компонентам ограничено текущим хостом; на другом компьютере требуется отдельный официальный trust workflow.
