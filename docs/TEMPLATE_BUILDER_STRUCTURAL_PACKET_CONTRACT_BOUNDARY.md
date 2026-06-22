# Template Builder Structural Packet Contract Boundary

Status: Phase 70 foundation boundary.

Phase 70 defines structural packet v1 as a foundation bridge between accepted
core operations and future browser runtime-store structural apply. It is a
local contract for the current Structural Runtime line, not a durable storage,
collaboration, or backend public API format.

## Design Rationale

The current system needs a deterministic way to tell the browser runtime store
what changed after core operations accept authored structural mutations.
Structural packet v1 describes the result of a mutation, not the user's intent:

```text
core operation result
  -> structural packet v1
  -> browser runtime-store apply in a later phase
```

This shape is useful now because:

- mutation authority remains in core operations;
- browser runtime-store apply can update indexes from explicit result facts;
- node map changes are separate from ordered parent-list changes;
- rejected operations can return diagnostics without changing revision or
  runtime state;
- future packet consumers can validate revision and shape before applying.

## Growth Warning

This contract is intentionally a foundation bridge. It is expected to be
revisited before durable persistence, multi-session editing, offline replay,
conflict merge, or backend public API exposure.

Do not treat structural packet v1 as the long-term storage or collaboration
protocol. Future Backend / API / Persistence phases must harden, version, or
replace it before exposing it as a durable boundary.

## Module Owner

`src/structure/packet.ts` owns:

- `STRUCTURAL_PACKET_SOURCE`;
- `STRUCTURAL_PACKET_VERSION`;
- `STRUCTURAL_PACKET_STAGE`;
- `createStructuralChangePacket(...)`;
- `validateStructuralChangePacket(...)`;
- `StructuralChangePacket`;
- `StructuralParentListPatch`.

The public package entrypoint exports the packet contracts through
`src/index.ts`.

## Packet Shape

Structural packet v1 carries:

- `baseRevision` and `nextRevision`;
- operation `action` and `status`;
- `nodesAdded`;
- `nodesUpdated`;
- `nodeIdsRemoved`;
- `parentListPatches`;
- `changedNodeIds`;
- `affectedParentNodeIds`;
- `dirtyScopes`;
- `renderInvalidation`;
- rejected-operation `issues`.

Parent-list patches carry before/after ordered ids and classify the list change
as `insert`, `remove`, `move`, or `replace`.

## Acceptance Evidence

`tests/structuralPacket.test.ts` proves:

- `text-block.insert` produces `nodesAdded`, parent `nodesUpdated`, and an
  `insert` parent-list patch;
- `node.delete` produces removed subtree ids and a `remove` parent-list patch;
- `node.reorder` produces a `move` parent-list patch;
- rejected operations produce diagnostics without structural changes or
  revision advancement;
- packet validation rejects malformed applied packets before runtime-store
  apply phases consume them.

## Non-Goals

Phase 70 does not implement:

- browser runtime-store structural apply;
- sandbox structural command UI;
- persistence;
- multi-user conflict handling;
- offline replay;
- backend public API exposure;
- structural packet durability guarantees;
- package/document schema changes.
