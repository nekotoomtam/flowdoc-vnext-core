# Product Editor Integration Smoke Boundary

Status: Phase 141 product editor integration smoke boundary.

Phase 141 adds a product-editor-like smoke over the existing template builder
sandbox. It composes viewport windowing, runtime cache/store, structural
command packets, rich inline commit, undo/redo, and live/exact stale signaling
without claiming production editor readiness.

This is not a production editor readiness claim.

## Evidence

- `tests/productEditorIntegrationSmoke.test.ts` boots the sandbox mutation
  bridge from a canonical vNext package fixture.
- The smoke creates an outline selection jump, applies a bounded visible range,
  builds a render window, inserts/deletes/reorders structural nodes through
  packets, commits a rich inline replacement, then runs undo and redo.
- The visible/render window is capped at 8 nodes in the smoke.
- Rich inline commit marks exact generation stale through the existing
  live-layout boundary.

## Boundary

Allowed:

- compose existing sandbox modules in a product-editor-like sequence;
- verify structural operations route through packets;
- verify rich inline commit and undo/redo remain packet/runtime-cache safe;
- verify bounded viewport/render-window behavior.

Blocked:

- claiming production editor readiness;
- introducing React, DOM, browser timing, old FlowDocEditor, or parent runtime
  imports into core tests;
- adding storage, backend routes, collaboration, or renderer artifact output;
- changing package/document schema.

## PASS

- Product-like composition passes in sandbox terms.
- Render window stays bounded.
- Structural operations route through packets.
- Rich inline commits mark exact generation stale.
- Undo/redo rich inline replay remains functional in the sandbox bridge.

## FAIL / BLOCKER

- No blocker was found for closing this smoke boundary.

## RISK

- This smoke is Node/sandbox-driven, not a real browser timing or interaction
  benchmark.
- The active fixture is bounded and product-like, not a full production corpus.
- Production caret, IME, copy/paste, and DOM range behavior remain future work.

## UNKNOWN

- Real browser timing and performance thresholds remain unknown.
- Production input surface choice remains open until the decision gate.
- Collaboration/offline semantics remain unknown.

## Files Changed

- `docs/PRODUCT_EDITOR_INTEGRATION_SMOKE_BOUNDARY.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/productEditorIntegrationSmoke.test.ts`

## Behavior Changed

- A new integration smoke verifies the existing sandbox/product-editor
  composition path.
- No core runtime, storage, backend route, renderer, package/document schema,
  or production editor behavior changed.

## Tests Run

- `npm.cmd test -- tests/productEditorIntegrationSmoke.test.ts`
- `npm.cmd run check`

## Risks Left

- Add real browser timing smoke in the next phase.
- Decide production primary input and granular rich inline operation policy in
  later gates.
- Keep renderer/storage/artifact assumptions explicit before product claims.

## Intentionally Not Changed

- No production editor readiness claim.
- No React/DOM integration.
- No old FlowDocEditor import.
- No storage or backend route.
- No renderer artifact output.
- No collaboration/offline behavior.
- No package/document schema change.

## Non-goals

No real browser timing, production contenteditable input, DOM range/caret/IME
hardening, storage, backend route, collaboration, renderer artifact output, or
schema change is introduced in this phase.
