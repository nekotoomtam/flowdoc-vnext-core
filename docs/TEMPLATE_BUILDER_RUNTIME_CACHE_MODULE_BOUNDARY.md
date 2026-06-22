# Template Builder Runtime Cache Module Boundary

Status: Phase 46 implementation boundary.

Phase 46 moves the sandbox browser runtime-cache and packet-apply rules out of
the shell file and into a dedicated browser-safe module. The visible sandbox
behavior stays the same, but cache ownership is now separated from rendering,
DOM events, and bridge button orchestration.

## Purpose

After Phase 45, the sandbox had a normalized editor view, but the browser shell
still owned these unrelated responsibilities in one file:

- boot cache creation;
- snapshot refresh cache creation;
- change-packet validation;
- tree-shaped snapshot patching;
- normalized editor view rebuild after packets;
- render and DOM event binding.

That shape was acceptable as temporary scaffolding, but it would become a
scale trap before viewport windowing, lazy detail, structural packet
application, or live-layout rendering. Phase 46 gives runtime-cache behavior a
separate owner before adding heavier editor behavior.

## Implemented Module

`examples/template-builder-sandbox/public/runtimeCache.js` owns:

- `createRuntimeCache(...)`;
- `createBootRuntimeState(...)`;
- `createRefreshRuntimeState(...)`;
- `isChangePacket(...)`;
- `applyChangePacketToSnapshot(...)`;
- `applyChangePacketToRuntime(...)`.

The module imports the normalized editor view module, has no DOM dependency,
and can run in browser or Node tests.

## Runtime Cache Ownership

The runtime cache module owns derived browser runtime facts:

- cache source and mode;
- boot revision;
- document revision;
- packet apply count;
- fallback snapshot refresh count;
- last packet revision;
- normalized editor view;
- node, parent, children, section, zone, node order, visible id, dirty id, and
  changed id indexes.
- visible range facts from the normalized editor view.

`app.js` now coordinates state assignment and rendering only. It delegates boot,
refresh, and packet application to `runtimeCache.js`.

Phase 47 extends this cache with `visibleRange`, `visibleRangeKind`,
`visibleRangeSource`, `visibleRangeWindowed`, and `visibleSectionIds`. Packet
application preserves the previous visible-range request when rebuilding the
editor view.

Phase 48 adds `visibleRangeRequest`, `visibleRangeRequestReason`, and
`visibleRangeRequestSource` beside those resolved range facts. Packet
application now preserves the previous request as `packet-apply` before the
range resolver runs.

Phase 49 adds `runtimeStore`, `runtimeStoreSource`, and `runtimeStoreMode` to
the cache.

Phase 50 adds `runtimeStoreApplyMode` and makes valid bounded text packets use
`applyTextChangePacketToRuntimeStore(...)` before rebuilding editor-view facts.
The direct text path reports `text-packet-direct`. Snapshot metadata still
advances for revision, mutation bridge, diagnostics, authoring history, and
live-layout summaries.

## Packet Apply Boundary

`applyChangePacketToRuntime(...)` now applies supported text-block change
packets to the existing runtime store first. It then rebuilds the normalized
editor view over that updated store. The tree-shaped snapshot is not treated as
the active post-packet content model for supported text packets.

The boundary is explicit:

```text
browser shell
  -> applyChangePacketToRuntime(snapshot, previousCache, packet)
  -> updated runtimeStore nodeById for text packets
  -> metadata-only snapshot revision/status update
  -> updated runtime cache
  -> rebuilt normalized editor view
```

If an old caller has no runtime store, the previous tree-shaped patch helper
remains as a compatibility fallback. Unsupported structural packet attempts are
not silently upgraded into a full structural packet engine.

## Acceptance Evidence

Phase 46 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- sandbox sources include `public/runtimeCache.js` as a dependency-clean
  browser module;
- `app.js` imports and delegates to runtime-cache helpers;
- `app.js` no longer defines `createRuntimeCache`, `replaceChangedNode`, or
  packet revision guards;
- `runtimeCache.js` owns change-packet validation and packet source checks;
- a Node test boots the runtime cache, applies a packet, and verifies
  `text-packet-direct`, updated metadata snapshot revision, mutation bridge
  state, packet count, changed store text, dirty ids, changed subtree ids,
  visible-range facts, and visible range request facts.

## Non-Goals

Phase 46 does not implement:

- viewport virtualization;
- lazy heavy-detail routes;
- full structural packet application for add/delete/move/reorder;
- production editor package structure;
- rich text editing;
- contenteditable DOM mapping;
- live-layout rendering;
- persistence;
- backend API routes outside the sandbox dev server;
- package/document version changes.
