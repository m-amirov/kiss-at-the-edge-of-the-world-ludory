# M4 S39 walk mobile background

## Intent

Устранить потерю качества на мобильном `s39-common-01`: добавить самостоятельный environment-only portrait PNG прогулки у гавани, сохранив утверждённый desktop PNG byte-identical.

## Scope and non-goals

- В scope: новый portrait PNG, его provenance/SHA-256/dimensions, source-switch для viewport `<=680px`, regression coverage и fresh browser before/after evidence.
- Вне scope: narrative graph, dialogue, save/reload engine, fonts, S39 café CG, Studio-managed runtime, economy/IAP, merge, publication.
- Anti-goal: не использовать простой crop/upscale/blur/sharpen desktop-файла и не подменять прогулку романтическим CG или screenshot.

## Chosen approach

Author-owned `game-studio/src/ui/original-game-ui.js` держит явную карту desktop filename → portrait filename и меняет только `img.src` при переходе через breakpoint; renderer получает канонический desktop `src` и не расширяется. `docs/migration/m4-mobile-assets.json` fail-closed проверяет импортированный PNG, SHA-256, PNG dimensions, ссылку на approved desktop bytes и отдельный `artStatus: pending-independent-review`; `m4-build-presentation --check` учитывает этот manifest как доказательство raster-файла.

## Acceptance boundary

Local mechanical/provenance checks, `m4-build-presentation --check`, `git diff --check`, focused/full Node tests and actual Chromium captures are required. Local visual QA records before/after pixels and responsive geometry; independent artistic signoff remains a separate gate and is not fabricated by these checks.
