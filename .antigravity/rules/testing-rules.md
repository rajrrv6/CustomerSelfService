# Verification & Testing Rules

## 1. Required Build Commands
Every major layout modification, translation change, or interface addition requires running:
- `npm run typecheck`: Validates complete TypeScript type safety.
- `npm run build`: Validates production compilation and prerendering.

## 2. Layout Inspections
- Verify all interactive controls (theme picker color swatches, support hours buttons, triage sliders) function without throwing React component errors.
- Ensure the UI looks correct in both light and dark modes, verifying color contrasts.
- Validate dynamic text changes and container alignment mirroring when switching from EN to AR.
- Test grids and drawers under simulated mobile/tablet viewports to ensure responsiveness.
