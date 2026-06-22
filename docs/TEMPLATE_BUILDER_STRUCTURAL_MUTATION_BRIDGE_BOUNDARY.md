# Template Builder Structural Mutation Bridge Boundary

Status: Phase 72 foundation boundary.

Phase 72 connects sandbox structural bridge actions to core operations and
structural packet v1. The bridge can now produce packet-only responses for
text-block insertion, node deletion, and node reorder, and those packets can be
applied by the browser runtime cache path introduced in Phase 71.

## Design Rationale

Phase 70 defined structural packet v1 and Phase 71 taught the browser runtime
store to apply it. Phase 72 adds the missing producer inside the sandbox
mutation bridge:

```text
sandbox structural bridge action
  -> runVNextOperation(...)
  -> createStructuralChangePacket(...)
  -> browser runtime cache apply
```

Core operations remain the mutation authority. The sandbox bridge does not
invent a second structural mutation format, and it does not mutate browser
state directly. It updates the in-memory canonical package only after core
accepts the operation, then returns the structural packet as the bounded
browser transport.

## Scope Adapter

Structural packets carry operation scopes as array-shaped `VNextOperationScope`
records. Live-layout boundary calls still expect live-layout dirty scopes with
explicit `kind` values. Phase 72 therefore includes a bridge-local adapter from
operation scopes to `kind: "node"` live-layout dirty scopes before calling
`resolveVNextLiveLayoutBoundary(...)`.

That adapter is local to the sandbox bridge. It is not a persistence schema and
not a backend API contract.

## Module Owner

`examples/template-builder-sandbox/src/mutationBridge.ts` owns:

- `insertTextBlock(...)`;
- `deleteNode(...)`;
- `reorderNode(...)`;
- `TemplateBuilderStructuralMutationResponse`;
- structural packet creation through `createStructuralChangePacket(...)`;
- core structural mutation through `runVNextOperation(...)`;
- operation-scope to live-layout dirty-scope adaptation.

`examples/template-builder-sandbox/scripts/serve.mjs` exposes local sandbox
routes:

- `/api/actions/insert-text-block`;
- `/api/actions/delete-node`;
- `/api/actions/reorder-node`.

## Acceptance Evidence

`tests/templateBuilderSandboxBoundary.test.ts` proves:

- structural bridge actions return packet-only responses without `sections`;
- insert responses carry `nodesAdded`, parent `nodesUpdated`, and an `insert`
  parent-list patch;
- reorder responses carry a `move` parent-list patch;
- delete responses carry removed node ids and a `remove` parent-list patch;
- rejected structural operations return rejected structural packets without
  revision advancement;
- structural bridge packets apply through the browser runtime cache and leave
  the tree-shaped snapshot immutable.

## Growth Warning

This remains a foundation bridge. Structural packet responses are local runtime
transport, not durable history, offline replay, collaboration, persistence, or
backend public API.

Before those lines expose structural mutations durably, the operation log,
history policy, conflict model, replay semantics, and API versioning need a
separate design lock.

## Non-Goals

Phase 72 does not implement:

- visible structural toolbar controls;
- drag/drop outline editing;
- durable structural history or undo/redo;
- persistence;
- backend public API exposure;
- collaboration or conflict merge;
- offline replay;
- package/document schema changes.
