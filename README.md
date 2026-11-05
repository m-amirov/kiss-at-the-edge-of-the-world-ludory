# Поцелуй на краю света — Ludory

Новый проект для чистого переноса визуальной новеллы на [Ludory](https://github.com/m-amirov/ludory).

- Исходная игра: https://github.com/m-amirov/kiss-at-the-edge-of-the-world
- Фреймворк: https://github.com/m-amirov/ludory
- Статус: M1 завершён, M2 — нативный проект Ludory; **M3 в работе** — авторские S01 → S02 → S65 → S03 → S04 → S05 → S06 → S07 → S08 → S66 → S09 → S10 → S11 → S12 → S13 → S14 → S15 → S16 → S17 → **S18 / S19 / S20 / S21→S61 → S22 → S23 → S24 → S25 → S58 → S26 → S27** с условиями, выборами и регрессионными тестами. S22–S26 (включая S58) завершают эпизод 6; S27 начинает эпизод 7 с общей волонтёрской работы у Lagarfljót и тремя бесплатными вариантами помощи. После закрепления одной из четырёх линий в S26 все они читают одинаковую S27, а выбранная линия сохраняется для будущих глав. **Следующая S59 ещё не перенесена**. Полноценная приёмка, медиа и релиз не завершены. **Для первой игры экономика выключена**: все сюжетные решения бесплатны, нет внутренней валюты, платных сцен, рекламы за вознаграждение и IAP; отдельный opt-in шаблон Ludory `narrative-economy` зарезервирован для будущих игр.
- Исходный проект и его история остаются неизменными; CEOS/Starter Kit не являются зависимостями нового проекта.

Никаких заявлений о релизной готовности или публикации до прохождения соответствующих проверок.

## Материалы миграции

- [Проектное решение](docs/superpowers/specs/2026-11-03-kiss-ludory-migration-design.md) и [план M1](docs/superpowers/plans/2026-11-03-m1-inventory.md).
- [Точная Git-tree инвентаризация](docs/migration/m1-inventory.json) двух закреплённых ревизий.
- [Матрица канона и паритета](docs/migration/m1-canon-parity.md) — различает наличие рукописей, интеграцию и неподтверждённые сценарии.
- [Доказательства и границы аудита](docs/migration/m1-evidence.md).
- [Критерии начала M2](docs/migration/m2-readiness.md).
- [Поблочная проверка авторского S01](docs/migration/m2-s01-fidelity.md).
- [M2: локальный runtime, экспорт и открытые ограничения](docs/migration/m2-playtest-evidence.md).
- [M3: точный перенос S02](docs/migration/m3-s02-fidelity.md), [S65](docs/migration/m3-s65-fidelity.md), [S03](docs/migration/m3-s03-fidelity.md), [S04](docs/migration/m3-s04-fidelity.md), [S05](docs/migration/m3-s05-fidelity.md), [S06](docs/migration/m3-s06-fidelity.md), [S07](docs/migration/m3-s07-fidelity.md), [S08](docs/migration/m3-s08-fidelity.md), [S66](docs/migration/m3-s66-fidelity.md), [S09](docs/migration/m3-s09-fidelity.md), [S10](docs/migration/m3-s10-fidelity.md), [S11](docs/migration/m3-s11-fidelity.md), [S12](docs/migration/m3-s12-fidelity.md), [S13](docs/migration/m3-s13-fidelity.md), [S14](docs/migration/m3-s14-fidelity.md), [S15](docs/migration/m3-s15-fidelity.md), [S16](docs/migration/m3-s16-fidelity.md), [S17](docs/migration/m3-s17-fidelity.md), [S18](docs/migration/m3-s18-fidelity.md), [S19](docs/migration/m3-s19-fidelity.md), [S20](docs/migration/m3-s20-fidelity.md), [S21/S61](docs/migration/m3-s21-s61-fidelity.md), [S22](docs/migration/m3-s22-fidelity.md), [S23](docs/migration/m3-s23-fidelity.md), [S24](docs/migration/m3-s24-fidelity.md), [S25](docs/migration/m3-s25-fidelity.md), [S58](docs/migration/m3-s58-fidelity.md), [S26](docs/migration/m3-s26-fidelity.md) и [S27](docs/migration/m3-s27-fidelity.md).

Проверка инструмента M1: `npm run test:m1` (Node.js 22+ и Git). Для повторного формирования манифеста нужны локальные read-only checkouts исходной игры и Ludory на закреплённых SHA; команда приведена в evidence.

## Локальный сценарный срез Ludory

`game/` создан официальным Studio-шаблоном `narrative-interactive` из закреплённого Ludory. Для запуска в браузере из корня репозитория: `python3 -m http.server 8080 --directory game`, затем `http://localhost:8080`. Полный набор тестов: `npm test`; `npm run test:m2` запускает только исторические проверки S01. Сервер нужен лишь для HTTP-раздачи статических файлов — backend игры не требуется.

**Актуальная техническая база:** Ludory Studio `narrative-interactive` 1.2.2; на предыдущем доверенном хосте `components status = IN_SYNC`, но в нынешнем checkout используемая Studio CLI отвергает состояние компонентов из-за несовпадения схем (`Invalid component state fields`, schema 1/2). Runtime использует название игры из манифеста, авторские модули находятся вне управляемого шаблона. Английские реплики пока являются копией русского текста — это не готовая локализация. Для условных сцен N1 нужны дополнительные технические кнопки «Продолжить», пока нет автоматического перехода по predicate. Сохранения предыдущих неопубликованных черновиков на удалённых технических концовках могут потребовать явного Restart; версии/миграция saves должны быть утверждены до релиза. Кнопка Back после перезагрузки не гарантируется: N1 хранит историю переходов только в памяти.

Сценарные тесты выполняются локально; парные Yandex/VK ZIP + receipts ранее проходили локальную проверку **только для исторического среза S05**. Для текущего графа S27 экспорт **NOT_RUN** из-за несовместимого состояния компонентов Studio. Браузерный UI, фактический Save/Reload на устройствах, ассеты/права, GitHub CI и площадочная модерация не являются пройденными release gates. Обновление Studio и её доверия к проекту требует штатной процедуры, а не копирования или подмены доверия из Git.
