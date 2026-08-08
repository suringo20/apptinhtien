# Modern UI Redesign

## Goal

Modernize Trip Splitter's visual style — "modern but still friendly" — without changing routes, page structure, copy, or the single-column mobile-first layout.

## Scope

**In scope:**
- Typography: replace Patrick Hand with Poppins.
- Color tokens: soften cream background to neutral light gray, white cards, warm near-black text. Blue accent (`--blue`/`--blue-dark`/`--blue-bg`) unchanged.
- Replace hard offset "sketch" shadows (`Npx Npx 0 black`) and thick 2–2.5px black borders with soft diffused elevation shadows + thin 1px light borders, app-wide.
- Give the 5 shared components (`Button`, `Card`, `Chip`, `Field`/`Input`, `BackButton`) real CSS classes (in `index.css`) instead of pure inline styles, to support `:hover` / `:focus` / `:active` / `transition` — buttons get press/lift feedback, inputs get a focus glow, chips animate on toggle.
- Sweep the 8 page files (Register, Login, JoinTrip, CreateTrip, Dashboard, AddActivity, Summary, MyCosts) for hand-rolled inline styles that duplicate the old thick-border/hard-shadow/hardcoded-hex pattern (badges, confirm dialogs, dashed "+ Add" buttons, copy-code button) and recolor/reshape them to the new tokens.

**Out of scope:**
- No route/navigation changes, no mega menu, sidebar, or search bar.
- No copy changes.
- No change to `MobileShell`'s single-column/max-420px layout.
- No change to the blue accent color or brand palette beyond softening neutrals.

## Approach

Layout-only inline styles (flex, margin, gap, width) stay inline on each page. Color/border/shadow/typography move to CSS variables and classes in `index.css`, applied via `className` on shared components and swapped in-place on page-level inline styles.

## Files touched

- `client/index.html` — font link swap
- `client/src/index.css` — new tokens, new component classes
- `client/src/components/Button.tsx`, `Card.tsx`, `Chip.tsx`, `Field.tsx`, `BackButton.tsx` — switch to CSS classes
- `client/src/pages/*.tsx` (all 8) — mechanical recolor sweep of hardcoded old-style values
