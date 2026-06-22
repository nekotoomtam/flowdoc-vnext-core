# Template Builder Structural Command UI Boundary

Status: Phase 73 implementation boundary.

Phase 73 exposes bounded structural commands in the sandbox inspector. The
browser UI can now call the Phase 72 structural bridge routes for text-block
insert, node delete, and node reorder, then apply the returned structural packet
through the Phase 71 runtime cache path.

## Design Rationale

The structural runtime line now has both sides of the packet bridge:

```text
inspector structural command
  -> sandbox structural bridge route
  -> structural packet v1
  -> browser runtime cache apply
  -> selected node / visible range refresh
```

This phase keeps the UI intentionally small. Commands live in the inspector,
derive their parent/index targets from the active runtime store, and use the
same packet/fallback refresh path as text bridge actions. The browser still
does not mutate document shape directly.

## Command Scope

The inspector can:

- insert a text block inside a selected container node;
- insert a text block after a selected child node;
- move a reorderable selected node up or down within its parent list;
- delete a deletable selected node.

The UI uses runtime facts such as node type, parent id, child order,
`canBeDeleted`, and `canBeReordered` to enable or disable commands before
calling the bridge.

## Module Owner

`examples/template-builder-sandbox/public/app.js` owns:

- structural command target derivation;
- structural route selection;
- structural action request bodies;
- packet apply through `applyMutationResult(...)`;
- post-command selection behavior.

`examples/template-builder-sandbox/public/styles.css` owns the compact
structure action layout.

## Acceptance Evidence

`tests/templateBuilderSandboxBoundary.test.ts` proves:

- app source calls `/api/actions/insert-text-block?response=packet`,
  `/api/actions/delete-node?response=packet`, and
  `/api/actions/reorder-node?response=packet`;
- inspector markup includes `data-structure-action` and `data-structural-text`;
- structural command handlers reuse packet apply instead of direct browser
  document mutation;
- the action catalog exposes `browser.runStructuralCommandUi`;
- Phase 72 bridge packet tests still prove insert/reorder/delete packet
  behavior and runtime-cache apply.

## Non-Goals

Phase 73 does not implement:

- drag/drop outline editing;
- multi-select structural operations;
- durable structural undo/redo;
- persistence;
- backend public API exposure;
- collaboration or conflict merge;
- offline replay;
- package/document schema changes.
