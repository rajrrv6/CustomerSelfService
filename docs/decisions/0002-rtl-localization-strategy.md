# Architectural Decision Record (ADR)

## Title
0002-rtl-localization-strategy

## Status
Accepted

## Context
The platform is designed to serve bilingual English (EN) and Arabic (AR) users across the Middle East (AST). Arabic layout requirements mandate not only text translations but complete visual layout mirroring (RTL), including flipped flex-rows, reversed padding-left/right, mirrored icons (like arrows), and aligned tables.

## Decision
We implement a bilingual CSS mirroring framework:
1. Load locale dictionaries dynamically from `src/i18n/en.ts` and `src/i18n/ar.ts` based on context states.
2. Mirror visual layouts by applying the `dir="rtl"` attribute directly to layout wrappers when `lang === 'ar'`.
3. Use RTL-friendly styling and directional utilities, avoiding absolute positioning like `right-0` unless paired with RTL logic.
4. Render mirrored icons conditionally depending on the current text direction state.

## Consequences
- **Pros**: Dynamic translation swaps occur instantly in the DOM without triggering page loads; maintains styling fidelity.
- **Cons**: Development must enforce strict audit checks to ensure new inputs/grids support RTL offsets.

## Alternatives Considered
- **Separate EN/AR CSS Stylesheets**: Rejected because loading secondary static CSS stylesheets during language toggle introduces visual layout shifts and increases network overhead.
