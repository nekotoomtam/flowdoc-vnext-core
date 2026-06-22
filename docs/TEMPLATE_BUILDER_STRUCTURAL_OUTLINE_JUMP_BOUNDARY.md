# Template Builder Structural Outline Jump Boundary

Status: Phase 74 implementation boundary.

Phase 74 turns the existing sandbox node tree into an explicit structural
outline navigation contract. The outline still renders from the store-backed
render model, but clicks now produce a DOM-free structural outline jump request
before the app shell selects the node, updates the visible-range request, and
restores the node-aware viewport anchor.

## Runtime Path

```text
outline node click
  -> createStructuralOutlineJumpRequest(...)
  -> selectNode(..., "outline", { visibleRangeRequest })
  -> createSelectionVisibleRangeRequest(...)
  -> createVisibleRangeRuntimeState(...)
  -> node-aware viewport anchor restore
```

## Owners

- `examples/template-builder-sandbox/public/structuralOutlineNavigation.js`
  owns the structural outline jump request source, mode, validation, selection
  source, and visible-range request creation.
- `examples/template-builder-sandbox/public/app.js` owns DOM event binding,
  visible state, and viewport anchor restore.
- `examples/template-builder-sandbox/public/styles.css` owns the small outline
  jump status row.
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.runStructuralOutlineJump`.

## Contract

- outline navigation is node-id based;
- a jump is accepted only when the requested id resolves to the current
  runtime/render node;
- accepted jumps use the same node-aware selection visible-range request as
  other selection paths;
- outline jump state is browser-only and must not be serialized into the
  generated snapshot;
- the tree remains a navigation surface, not a structural editing surface.

## Acceptance Evidence

- `tests/templateBuilderSandboxBoundary.test.ts` verifies the DOM-free outline
  jump module, action lane, app wiring, status marker, and documentation
  contract.
- `examples/template-builder-sandbox/public/sandbox-snapshot.json` exposes
  `browser.runStructuralOutlineJump` after snapshot generation.
- Existing node-anchor and visible-range tests continue to prove the underlying
  selection restore path.

## Non-Goals

Phase 74 does not implement drag/drop outline editing, multi-select structural
operations, keyboard tree commands, inline outline rename, diagnostics/source
jump UI, durable structural undo/redo, persistence, backend public API
exposure, collaboration/conflict merge, offline replay, or package/document
schema changes.
