# Template Builder Structural Diagnostics Navigation Boundary

Status: Phase 75 implementation boundary.

Phase 75 adds a bounded diagnostics navigation surface for the sandbox. The
surface summarizes current snapshot diagnostics and can navigate only issues
that already carry a valid `nodeId`. Document-level diagnostics remain
document-level and are not guessed onto a nearby node.

## Runtime Path

```text
snapshot diagnostics / packet issues
  -> createStructuralDiagnosticItems(...)
  -> inspector diagnostics list
  -> createStructuralDiagnosticNavigationRequest(...)
  -> selectNode(..., "diagnostics", { visibleRangeRequest })
  -> Phase 74 outline jump / node-aware visible range path
```

## Owners

- `examples/template-builder-sandbox/public/structuralDiagnosticsNavigation.js`
  owns diagnostics item normalization and node-linked navigation requests.
- `examples/template-builder-sandbox/public/structuralOutlineNavigation.js`
  remains the shared node-aware jump foundation.
- `examples/template-builder-sandbox/public/app.js` owns inspector rendering
  and DOM event binding.
- `examples/template-builder-sandbox/public/styles.css` owns the diagnostics
  list presentation.
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.runStructuralDiagnosticsNavigation`.

## Contract

- document-level diagnostics are visible but not clickable;
- a diagnostic can jump only when its item has `nodeId` and that node id exists
  in the current runtime node index;
- missing-node diagnostics are blocked without fallback guessing;
- accepted jumps reuse the same selection visible-range request and node-anchor
  restore path as Phase 74;
- diagnostics navigation state is browser-only and must not be serialized into
  generated snapshots.

## Acceptance Evidence

- `tests/templateBuilderSandboxBoundary.test.ts` verifies DOM-free diagnostics
  item creation, document-level blocking, node-linked jump requests, action lane
  exposure, app wiring, styles, and documentation.
- `examples/template-builder-sandbox/public/sandbox-snapshot.json` exposes
  `browser.runStructuralDiagnosticsNavigation` after snapshot generation.

## Non-Goals

Phase 75 does not implement a new diagnostics engine, key-data or graph
diagnostic semantic changes, automatic issue fixes, structural command policy
changes, persistence, backend public API exposure, collaboration/conflict
merge, offline replay, durable history, or package/document schema changes.
