# Template Builder Structural Packet Store Boundary

Status: Phase 71 foundation boundary.

Phase 71 lets the browser runtime store consume structural packet v1 from the
Phase 70 foundation bridge. The browser store updates lookup indexes from
packet node-map changes and parent-list patches, then rebuilds derived
section/zone/parent/order facts before editor-view and render-model
consumption.

## Design Rationale

The runtime store already owns browser lookup indexes below the normalized
editor view. Applying structural packets at the store boundary keeps structure
changes out of tree-shaped snapshot mutation and lets the render model read the
latest browser state from one store-shaped source:

```text
structural packet v1
  -> applyStructuralChangePacketToRuntimeStore(...)
  -> rebuilt runtime store indexes
  -> runtime cache / editor view / render model
```

This phase deliberately treats the store as an adapter boundary. Packet nodes
arrive in canonical core authored-node shape, while the sandbox renders runtime
node summaries. The store normalizes packet nodes into runtime summaries and
uses `childrenById`, `parentById`, `sectionIdByNodeId`, `zoneIdByNodeId`,
`rootZoneIdsBySectionId`, and `nodeOrder` as the derived browser indexes.

## Growth Warning

This apply path is still a foundation bridge. It is suitable for local
runtime-store updates in the Structural Runtime line, but it is not a durable
persistence, collaboration, offline replay, conflict merge, or backend public
API protocol.

Before Backend / API / Persistence phases expose structural packets outside the
local runtime, the packet/apply contract must be hardened, versioned, or
replaced with a durable operation log and conflict/replay semantics.

## Module Owner

`examples/template-builder-sandbox/public/runtimeStoreStructuralPacket.js` owns:

- `RUNTIME_STORE_STRUCTURAL_PACKET_APPLY_MODE`;
- `isStructuralChangePacket(...)`;
- `applyStructuralChangePacketToRuntimeStore(...)`;
- structural packet revision/source/stage validation;
- parent-list stale guards;
- packet-node normalization into runtime node summaries;
- post-apply index rebuild.

`examples/template-builder-sandbox/public/runtimeCache.js` owns the bounded
cache bridge:

- `applyStructuralPacketMetadataToSnapshot(...)`;
- `applyStructuralChangePacketToRuntime(...)`;
- structural-packet routing through `applyChangePacketToRuntime(...)`.

## Apply Rules

The store rejects a structural packet when:

- source/version/stage do not match structural packet v1;
- status is not `applied`;
- base revision differs from the runtime store revision;
- an applied packet does not advance revision;
- added, updated, removed, or parent-list patch arrays are malformed;
- added nodes already exist;
- removed or updated nodes are missing;
- a parent-list patch references a missing parent/section;
- a parent-list patch's `before` list does not match the current store list;
- a parent-list patch keeps removed children or references missing children;
- the rebuilt index would create cycles, duplicate parent ownership, missing
  child references, or orphan nodes.

Successful apply returns a new runtime store with apply mode
`structural-packet-direct`; the previous store object is not mutated.

## Acceptance Evidence

`tests/templateBuilderSandboxBoundary.test.ts` proves:

- a structural insert packet adds a text block to `cover-body`;
- runtime summaries are normalized with text preview/plain text, parent,
  section, zone, depth, and node order facts;
- stale base revisions are rejected;
- a structural delete packet removes the inserted node and restores child
  order;
- `applyChangePacketToRuntime(...)` can route structural packets through the
  runtime cache while preserving snapshot tree immutability;
- editor-view dirty and changed subtree facts consume structural packet array
  scopes.

## Non-Goals

Phase 71 does not implement:

- structural command UI;
- new add/delete/move toolbar behavior;
- persistence;
- durable history or undo/redo replay for structural packets;
- multi-user conflict handling;
- offline replay;
- backend public API exposure;
- package/document schema changes;
- treating structural packet v1 as long-term storage format.

In short, Phase 71 does not implement structural command UI or any durable
transport/storage guarantee.
