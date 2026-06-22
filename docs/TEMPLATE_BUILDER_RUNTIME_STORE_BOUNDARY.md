# Template Builder Runtime Store Boundary

Status: Phase 49 implementation boundary.

Phase 49 introduces the sandbox structural runtime store. The store owns the
lookup-first structural indexes that were previously assembled inside the
normalized editor view module. The tree-shaped snapshot still exists for boot,
debug, and fallback refresh behavior, but structural lookup now has its own
browser-safe owner.

## Purpose

Phase 45 created the first normalized editor view. Phase 46 split runtime-cache
ownership. Phase 47 and Phase 48 added visible range resolution and request
policy. Phase 49 moves the structural index layer below the editor view:

```text
tree-shaped snapshot
  -> runtimeStore structural indexes
  -> editorView visible range and dirty/change facts
  -> runtimeCache status and browser consumption
```

This prepares the later structural packet phase without claiming that packets
already update the store directly.

## Implemented Module

`examples/template-builder-sandbox/public/runtimeStore.js` owns:

- `createRuntimeStore(...)`;
- `getRuntimeStoreNode(...)`;
- `getRuntimeStoreParent(...)`;
- `getRuntimeStoreChildren(...)`;
- `getRuntimeStoreSectionRootNodes(...)`;
- `RUNTIME_STORE_SOURCE`;
- `RUNTIME_STORE_MODE`.

The module has no DOM dependency and can run in browser or Node tests.

## Store Indexes

The runtime store derives:

- `nodeById`;
- `parentById`;
- `childrenById`;
- `sectionById`;
- `zoneById`;
- `sectionIdByNodeId`;
- `zoneIdByNodeId`;
- `rootZoneIdsBySectionId`;
- `sectionIds`;
- `nodeOrder`;
- store source, mode, version, section count, node count, document revision,
  and previous revision.

`editorView.js` now consumes the store instead of owning structural traversal.
It still owns editor-view facts such as dirty ids, changed ids,
`visibleRangeRequest`, `visibleRange`, and `visibleNodeIds`.

## Runtime Cache Ownership

`runtimeCache.js` now carries `runtimeStore`, `runtimeStoreSource`, and
`runtimeStoreMode` beside editor-view and visible-range facts. App status shows
the store mode, node count, and section count so smoke tests can verify the
active browser path.

Phase 50 adds a narrow direct text packet path on top of this store:
`applyTextChangePacketToRuntimeStore(...)` can update changed text-block
summaries in `nodeById` with apply mode `text-packet-direct`. Full structural
packet application is still deferred.

## Acceptance Evidence

Phase 49 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- sandbox sources include `public/runtimeStore.js` as a dependency-clean
  browser module;
- generated snapshots expose `browser.createStructuralRuntimeStore`;
- Node tests prove runtime-store source, mode, node count, section count,
  parent lookup, child lookup, and section root lookup;
- editor-view tests prove `runtimeStore` sits below visible range and dirty
  facts;
- runtime-cache packet tests prove rebuilt packet caches still carry store
  facts;
- Phase 50 tests prove bounded text packets can update store nodes directly
  while rejecting structural child changes;
- browser smoke verifies store status and draft packet behavior.

## Non-Goals

Phase 49 does not implement:

- structural add/delete/move packet application directly against the store;
- persistent runtime-store storage;
- lazy heavy-detail routes;
- viewport or scroll controllers;
- virtualized rendering;
- hidden/offscreen DOM pruning;
- rich text editing;
- contenteditable DOM mapping;
- live-layout rendering;
- persistence;
- backend API routes outside the sandbox dev server;
- package/document version changes.
