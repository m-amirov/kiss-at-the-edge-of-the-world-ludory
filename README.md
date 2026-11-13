# Поцелуй на краю света — Ludory

Новый проект для чистого переноса визуальной новеллы на [Ludory](https://github.com/m-amirov/ludory).

- Исходная игра: https://github.com/m-amirov/kiss-at-the-edge-of-the-world
- Фреймворк: https://github.com/m-amirov/ludory
- Статус: M1 завершён, M2 — нативный проект Ludory; **M3 в работе**. Перенесены общие сцены S01–S17 (включая S65/S66), развилки S18/S19/S20/S21→S61, общие сцены S22–S27 с S58/S59, четыре линии дня 14 и переходы дней 15–16: Эрик S28→S49→S32→S50, Ник S29→S52→S33→S53, Дамир S30→S55→S34→S56, независимая Алиса S31→S62→S35→S63 (также для закрытых отношений). Все маршруты сходятся в общей S36 (день 17); **Эрик при активных отношениях или паузе продолжает в S37→S51, Ник — в S38→S54, Дамир — в S39→S57, а самостоятельная Алиса и все закрытые романтические линии — в S40→S64 (день 19)**. Поздний разрыв в S37/S38/S39 также ведёт через S40 в S64 без повторного романтического выбора. **После личных сцен все четыре маршрута сходятся в общей S60, затем проходят общую S41 эпизода 10 и расходятся по защищённым маршрутам: действующий роман → S42 (Эрик/Ник/Дамир), самостоятельная Алиса или завершённый роман → S43.** В S42 — три бесплатных решения о будущем отношений; в S43 — два бесплатных самостоятельных решения. После S42/S43 следует **общее прощальное утро S48**, затем авторские финалы **S44 (Эрик), S45 (Ник), S46 (Дамир), S47 (Алиса)** с семью идентификаторами концовок. Непубликованная техническая остановка после S42/S43 заменена настоящими финальными сценами. Полноценная приёмка, медиа и релиз не завершены. **Для первой игры экономика выключена**: все сюжетные решения бесплатны, нет внутренней валюты, премиум-сцен, rewarded-рекламы и IAP; отдельный шаблон Ludory `narrative-economy` зарезервирован для будущих игр.
- Исходный проект и его история остаются неизменными; CEOS/Starter Kit не являются зависимостями нового проекта.

Никаких заявлений о релизной готовности или публикации до прохождения соответствующих проверок.

## M4B — новый Studio-managed проект (Draft)

`game-studio/` — новая изолированная Studio-инициализация из Ludory [объединённого PR #91](https://github.com/m-amirov/ludory/pull/91) (`main`: `28f5d6445ad06f82c3910474d79fbf465a650567`). Изначально создан шаблоном `narrative-interactive` **1.2.3**, затем штатно обновлён до **1.2.4** после исправления SemVer-контракта Studio. Каталог `game/` сохранён в качестве исходного авторского и исторического технического среза; его устаревшие Studio-managed файлы не перезаписывались. Миграция `game-studio/` выполнена только по авторским `src/story.js`, `src/scenes/`, `src/presentation.js`, `visuals/` и `narrative-assets.json`. Вся нативная оболочка, `src/main.js`, `src/entry.js` и runtime bundle созданы официальной Studio CLI и принадлежат Studio.

Для локального предварительного запуска из checkout Ludory с проверенным M4A tree `d0fb1175acd662526b3b4a45188341d18a7737aa`:

```sh
node packages/studio/bin/ludory.mjs components status --project /absolute/path/to/game-repository/game-studio --json
node packages/studio/bin/ludory.mjs preview --project /absolute/path/to/game-repository/game-studio --json
```

На текущем хосте (08.11.2026) владелец отдельно разрешил перенос доверия: `components trust` → `TRUSTED`, `components update` с версией 1.2.4 → `APPLIED`, `components status` → `IN_SYNC`. Предыдущие версии шаблона 1.2.3 после объединения PR #91 конфликтовали из-за изменённого `src/main.js` при неизменном SemVer; исправление подготовлено отдельно в Ludory. Превью `STARTED`, его пять основных HTTP-маршрутов возвращают 200; Chromium в данной sandbox-среде завершился `socket() failed: Operation not permitted`, поэтому сценарная приёмка на экранах телефонов и ПК остаётся **BLOCKED_BROWSER**. На другом хосте требуется новая штатная процедура переноса доверия, без ручного редактирования реестра/receipt. Старый `game/` не обновлялся. Из M4B пока проверена карта **только S01–S03**: 9 привязанных visual cues, 12 нейтральных native beats, 0 допущенных картинок, 0 включённых музыкальных файлов. Правовой gate для ассетов и браузерный pixel QA остаются открытыми. Экономика игры выключена; никакие покупки/премиум-выборы не добавлялись. [M4 Studio QA](docs/qa/m4-studio-recovery.md).

## Материалы миграции

- [Проектное решение](docs/superpowers/specs/2026-11-03-kiss-ludory-migration-design.md) и [план M1](docs/superpowers/plans/2026-11-03-m1-inventory.md).
- [Точная Git-tree инвентаризация](docs/migration/m1-inventory.json) двух закреплённых ревизий.
- [Матрица канона и паритета](docs/migration/m1-canon-parity.md) — различает наличие рукописей, интеграцию и неподтверждённые сценарии.
- [Доказательства и границы аудита](docs/migration/m1-evidence.md).
- [Критерии начала M2](docs/migration/m2-readiness.md).
- [Поблочная проверка авторского S01](docs/migration/m2-s01-fidelity.md).
- [M2: локальный runtime, экспорт и открытые ограничения](docs/migration/m2-playtest-evidence.md).
- [M3: точный перенос S02](docs/migration/m3-s02-fidelity.md), [S65](docs/migration/m3-s65-fidelity.md), [S03](docs/migration/m3-s03-fidelity.md), [S04](docs/migration/m3-s04-fidelity.md), [S05](docs/migration/m3-s05-fidelity.md), [S06](docs/migration/m3-s06-fidelity.md), [S07](docs/migration/m3-s07-fidelity.md), [S08](docs/migration/m3-s08-fidelity.md), [S66](docs/migration/m3-s66-fidelity.md), [S09](docs/migration/m3-s09-fidelity.md), [S10](docs/migration/m3-s10-fidelity.md), [S11](docs/migration/m3-s11-fidelity.md), [S12](docs/migration/m3-s12-fidelity.md), [S13](docs/migration/m3-s13-fidelity.md), [S14](docs/migration/m3-s14-fidelity.md), [S15](docs/migration/m3-s15-fidelity.md), [S16](docs/migration/m3-s16-fidelity.md), [S17](docs/migration/m3-s17-fidelity.md), [S18](docs/migration/m3-s18-fidelity.md), [S19](docs/migration/m3-s19-fidelity.md), [S20](docs/migration/m3-s20-fidelity.md), [S21/S61](docs/migration/m3-s21-s61-fidelity.md), [S22](docs/migration/m3-s22-fidelity.md), [S23](docs/migration/m3-s23-fidelity.md), [S24](docs/migration/m3-s24-fidelity.md), [S25](docs/migration/m3-s25-fidelity.md), [S58](docs/migration/m3-s58-fidelity.md), [S26](docs/migration/m3-s26-fidelity.md), [S27](docs/migration/m3-s27-fidelity.md), [S59](docs/migration/m3-s59-fidelity.md), [S28/S49](docs/migration/m3-s28-s49-fidelity.md), [S29/S52](docs/migration/m3-s29-s52-fidelity.md), [S30/S55](docs/migration/m3-s30-s55-fidelity.md), [S31/S62](docs/migration/m3-s31-s62-fidelity.md), [S32](docs/migration/m3-s32-fidelity.md), [S50](docs/migration/m3-s50-fidelity.md), [S33](docs/migration/m3-s33-fidelity.md), [S53](docs/migration/m3-s53-fidelity.md), [S34](docs/migration/m3-s34-fidelity.md), [S56](docs/migration/m3-s56-fidelity.md), [S35/S63](docs/migration/m3-s35-s63-fidelity.md), [S36](docs/migration/m3-s36-fidelity.md), [S37](docs/migration/m3-s37-fidelity.md), [S38](docs/migration/m3-s38-fidelity.md) и [S39](docs/migration/m3-s39-fidelity.md).

- [S40: независимая Алиса и закрытые романтические маршруты](docs/migration/m3-s40-fidelity.md).
- [S64: продолжение самостоятельной/закрытой линии на день 19](docs/migration/m3-s64-fidelity.md).
- [S51: вечер Эрика на день 19 при продолженных отношениях](docs/migration/m3-s51-fidelity.md).
- [S54: музыкальный вечер Ника на день 19 при продолженных отношениях](docs/migration/m3-s54-fidelity.md).
- [S57: рассвет Дамира на день 19 при продолженных отношениях](docs/migration/m3-s57-fidelity.md).
- [S60: общий вечер с сувенирами после всех четырёх маршрутов](docs/migration/m3-s60-fidelity.md).
- [S41: общее начало эпизода 10, карьерный тезис и два бесплатных выбора](docs/migration/m3-s41-fidelity.md).
- [S42/S43: действующий роман или самостоятельный вечер, свободный выбор без монетизации](docs/migration/m3-s42-s43-fidelity.md).
- [S44–S48: прощальный день, четыре авторских эпилога и семь идентификаторов финалов](docs/migration/m3-s44-s48-fidelity.md).
- [QA preflight: runtime Save/Restore, HTTP, граф и ограничения браузерной/мобильной приёмки](docs/qa/2026-11-07-runtime-preflight.md).

Проверка инструмента M1: `npm run test:m1` (Node.js 22+ и Git). Для повторного формирования манифеста нужны локальные read-only checkouts исходной игры и Ludory на закреплённых SHA; команда приведена в evidence.

## Локальный сценарный срез Ludory

`game/` создан официальным Studio-шаблоном `narrative-interactive` из закреплённого Ludory. Для запуска в браузере из корня репозитория: `python3 -m http.server 8080 --directory game`, затем `http://localhost:8080`. Полный набор тестов: `npm test`; `npm run test:m2` запускает только исторические проверки S01. Сервер нужен лишь для HTTP-раздачи статических файлов — backend игры не требуется.

**Актуальная техническая база:** Ludory Studio `narrative-interactive` 1.2.2; на предыдущем доверенном хосте `components status = IN_SYNC`, но в нынешнем checkout используемая Studio CLI отвергает состояние компонентов из-за несовпадения схем (`Invalid component state fields`, schema 1/2). Runtime использует название игры из манифеста, авторские модули находятся вне управляемого шаблона. Английские реплики пока являются копией русского текста — это не готовая локализация. Для условных сцен N1 нужны дополнительные технические кнопки «Продолжить», пока нет автоматического перехода по predicate. Сохранения предыдущих неопубликованных черновиков на удалённых технических концовках могут потребовать явного Restart; версии/миграция saves должны быть утверждены до релиза. Кнопка Back после перезагрузки не гарантируется: N1 хранит историю переходов только в памяти.

Сценарные тесты выполняются локально; парные Yandex/VK ZIP + receipts ранее проходили локальную проверку **только для исторического среза S05**. Для текущего графа до S64 экспорт **NOT_RUN** из-за несовместимого состояния компонентов Studio. Браузерный UI, фактический Save/Reload на устройствах, ассеты/права, GitHub CI и площадочная модерация не являются пройденными release gates. Обновление Studio и её доверия к проекту требует штатной процедуры, а не копирования или подмены доверия из Git.
