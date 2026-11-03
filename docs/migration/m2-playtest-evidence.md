# M2 — локальные проверки и препятствия

Дата 2026-11-03. Ludory pinned `0d034f1ab7e559b07080c00f6386a453e0e398b2`; standalone `game/` создан Studio внутри своего каталога.

## Подтверждено

- `node --test tests/m2-s01.test.mjs`: семь тестов проходили на локальной редакции S01 (валидный граф, три выбора без route-lock, все ветки сходятся, буквальная целостность пяти текстовых фрагментов, флаг выбранного места, Back с переключением ветки, актуальный story hash и отсутствие демо-медиа).
- `planNarrativePlatformExport(game)`: `READY_TO_DERIVE`, 7 source-files.
- `materializeNarrativePlatformProjects`: `DERIVED_LOCAL`; Yandex — 6 файлов, VK — 9; чужие демо-изображения в производные проекты не попали. Временные результаты штатно удалены через `cleanup()`.
- `src/main.js` остался байт-в-байт каноническим из Studio-шаблона, так что F5b2 compiler не обходился.

## Открытые препятствия

1. **Нет browser acceptance.** На данной рабочей машине не найден системный Chromium/Chrome/Firefox или браузерный test runner. Не проверены реальным браузером запуск, кнопки Save/Back/reload, malformed save, viewport 1000×720 и 390×844. Нельзя ставить browser QA PASS.
2. **Канонический launcher жёстко содержит демо-заголовок** «Вечер у маяка», `Lighthouse Evening` и `narrative-demo` в saveKey. `packages/studio/src/narrative-platform-compile.mjs` сравнивает `src/main.js` с байтами шаблона и при изменении возвращает `F5B_AUTHOR_ENTRY_CONTRACT_UNVERIFIED`. Нужна отдельная доработка Ludory по настройке названия и корректному storage namespace при сохранении verified export.
3. **Studio managed-components conflict.** После штатного авторского редактирования story и удаления демо-ассетов `components status --project game` возвращает `CONFLICT` (изменённые `src/story.js`, `narrative-assets.json`, отсутствуют `assets/lighthouse.svg`, `assets/shoreline.svg`). Trust-receipts и component SHA вручную не переписывались. Нужен поддержанный Ludory workflow отделения игровых authored-files от неизменяемых компонентов и доверенного клонирования на другой хост.
4. **Не готово к релизу.** Это только S01, с текстовым рендером без канонических иллюстраций. Полные EP01–EP10, локализация, художественная приёмка, сценарные тесты, совместимость сохранений, площадочные QA и права на ассеты остаются вне M2.

`DERIVED_LOCAL` означает только доказанную техническую возможность локального преобразования исходников в два временных проекта, **не** готовые ZIP-кандидаты, release-gates или модерацию площадок.
