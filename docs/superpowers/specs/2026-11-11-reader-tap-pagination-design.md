# Reader tap and short-page parity — approved design

## Intent

Restore the original visual-novel reading interaction in Draft PR #3. The reader sees short prose fragments over the CG and advances by tapping the stage **or the prose**, never by an on-screen «Далее» button. A native long dialogue beat must not fill the phone with a scrollable essay.

## User-approved approach

**A — author-owned view pagination (selected).** Paginate the current native beat in the authored UI adapter. Keep the native Ludory narrative graph and its `data-action` handler intact. The invisible native `narrative:next:*` action remains the single source of truth for advancement. Native choices and interactions remain explicit buttons.

**B — split canonical prose into new graph beats (rejected).** This would change beat IDs, saves, source proof, route validation and narrative history.

## Behavioral contract

- Display at most approximately five measured lines of prose at a time (target 3–5) on mobile; adapt to viewport width, reading-size setting and resize. Preserve **every character** of the authored prose in order; favor sentence ends for page boundaries, then word boundaries when a sentence alone exceeds the limit.
- Tap/click on any ordinary stage or prose surface shows the next page. On the last page of a dialogue beat, a tap invokes the existing native Next action **exactly once**. Keyboard Enter/Space/ArrowRight follows the same progression.
- No visible or keyboard-focusable «Далее» button remains. Keep its native DOM action available for dispatch, without modifying managed Studio code. Explicit choice, photo, keepsake and message buttons are never auto-activated. When an interactive beat has prose, choices/actions must not be bypassed.
- «Назад» moves to the preceding local page when there is one. At the first page, native Back handles the previous beat, showing its final page if it has several. Menu, journal and settings never consume a page or advance narrative. Tapping an active control, dragging/scrolling, or selecting text must not advance.
- Re-render of the same beat (e.g. journal or locale change) and resize must not silently skip unseen prose. Reload may restart the *current beat* at its first fragment (native saved beat and graph remain unchanged); no new runtime save schema.
- Preserve the original Manrope/Cormorant fonts, PNGs, palette, source texts, asset provenance, CG responsive behavior, existing Back/Save/Reload, economy disabled, and managed Studio files.

## Acceptance

- Browser interaction and screenshots at 320×700, 390×844, 430×932 and desktop. Particularly long S38 paused and S39 common/active text fit in short fragments; text concatenates to source exactly.
- Clicking the text advances one page, then one beat; an ordinary choice requires an explicit click. Native Back, menu, journal, locale, Save→Reload, resize and restored image sources continue working. No JS errors, no horizontal overflow, no hidden story text permanently inaccessible.
- Regression tests cover sentence and long-sentence splitting, unicode/text preservation, viewport sizing, input exclusion, Back and interaction state. QA expectations stop requiring a visible «Далее» button.
- Keep Draft PR #3 open. Do not merge or publish; independent art gate remains open.
