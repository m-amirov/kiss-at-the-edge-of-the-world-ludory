# Поцелуй на краю света — Ludory

Новый проект для чистого переноса визуальной новеллы на [Ludory](https://github.com/m-amirov/ludory).

- Исходная игра: https://github.com/m-amirov/kiss-at-the-edge-of-the-world
- Фреймворк: https://github.com/m-amirov/ludory
- Статус: M1 — зафиксированная инвентаризация и план переноса; игровой runtime и платформенные сборки в этом репозитории пока отсутствуют.
- Исходный проект и его история остаются неизменными; CEOS/Starter Kit не являются зависимостями нового проекта.

Никаких заявлений о релизной готовности или публикации до прохождения соответствующих проверок.

## Материалы миграции

- [Проектное решение](docs/superpowers/specs/2026-11-03-kiss-ludory-migration-design.md) и [план M1](docs/superpowers/plans/2026-11-03-m1-inventory.md).
- [Точная Git-tree инвентаризация](docs/migration/m1-inventory.json) двух закреплённых ревизий.
- [Матрица канона и паритета](docs/migration/m1-canon-parity.md) — различает наличие рукописей, интеграцию и неподтверждённые сценарии.
- [Доказательства и границы аудита](docs/migration/m1-evidence.md).
- [Критерии начала M2](docs/migration/m2-readiness.md).

Проверка инструмента M1: `npm run test:m1` (Node.js 22+ и Git). Для повторного формирования манифеста нужны локальные read-only checkouts исходной игры и Ludory на закреплённых SHA; команда приведена в evidence.
