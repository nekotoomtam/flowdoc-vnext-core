# Template Builder Structural Command Policy Boundary

Status: Phase 76 implementation boundary.

Phase 76 extracts structural command availability, target derivation, bridge
route selection, request body creation, and post-result selection behavior out
of `app.js` into a DOM-free browser-safe policy module. The inspector remains
the visible command surface, but it no longer owns the command rules.

## Runtime Path

```text
selected runtime node + runtime indexes
  -> createStructuralCommandPolicy(...)
  -> inspector enables/disables command buttons
  -> structuralActionRequest(...)
  -> routeForStructuralAction(...)
  -> Phase 72 structural bridge route
  -> structuralSelectionAfterResult(...)
```

## Owners

- `examples/template-builder-sandbox/public/structuralCommandPolicy.js` owns
  `STRUCTURAL_COMMAND_POLICY_SOURCE`, `STRUCTURAL_COMMAND_POLICY_MODE`,
  `createStructuralCommandPolicy(...)`, `structuralActionRequest(...)`,
  `routeForStructuralAction(...)`, and
  `structuralSelectionAfterResult(...)`.
- `examples/template-builder-sandbox/public/app.js` owns rendering, DOM event
  binding, fetch dispatch, and state updates only.
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.evaluateStructuralCommandPolicy`.

## Contract

- policy evaluation is based on the selected node plus `nodeById` and
  `childrenById` runtime indexes;
- command actions return `enabled`, `reason`, and target metadata;
- bridge routes remain the Phase 72 sandbox structural routes;
- request bodies remain packet-producing insert/delete/reorder requests;
- post-result selection stays local browser behavior and is not durable
  history;
- policy state is not serialized into generated snapshots.

## Acceptance Evidence

- `tests/templateBuilderSandboxBoundary.test.ts` verifies DOM-free policy
  evaluation, request body creation, route selection, selection-after behavior,
  app delegation, action lane exposure, and documentation.
- Existing Phase 72/73 packet/runtime-cache tests continue to prove that
  command execution still flows through the structural bridge and packet apply
  path.

## Non-Goals

Phase 76 does not add new structural commands, change the Phase 72 route
contract, change structural packet v1 shape, implement drag/drop, durable
structural undo/redo, persistence, backend public API exposure,
collaboration/conflict merge, offline replay, or package/document schema
changes.
