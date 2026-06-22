# Template Builder Text Packet Store Boundary

Status: Phase 50 implementation boundary.

Phase 50 makes bounded text change packets update the browser structural
runtime store directly. This is the narrow bridge between the Phase 49
store boundary and later structural packet work: text-block content updates no
longer need to patch the tree-shaped snapshot before the active browser cache
can see the change.

## Purpose

Phase 49 separated structural lookup indexes from the normalized editor view.
Phase 50 lets the store accept the packet shape that already exists today for
safe text mutations:

```text
change packet for text-block content
  -> applyTextChangePacketToRuntimeStore(...)
  -> runtimeStore nodeById update
  -> editorView dirty/change/range facts
  -> runtimeCache packet-cache state
```

The tree-shaped snapshot remains the boot, debug, and refresh payload. After a
text packet, the active browser rendering path reads changed node content from
`runtimeStore`. Snapshot metadata such as revision, mutation bridge summary,
diagnostics, authoring history, and live-layout summary is still updated so the
sandbox shell stays coherent.

## Implemented Module Behavior

`examples/template-builder-sandbox/public/runtimeStore.js` now owns:

- `applyTextChangePacketToRuntimeStore(...)`;
- `RUNTIME_STORE_TEXT_PACKET_APPLY_MODE`;
- direct `nodeById` replacement for changed text-block summaries;
- structural child-id guards for changed text blocks;
- document revision and previous revision updates on the copied store.

The apply mode is `text-packet-direct`.

## Runtime Cache Behavior

`runtimeCache.js` now tries the text packet store path for valid change packets
when a previous runtime store exists. The cache then rebuilds the editor view
over the updated store instead of rebuilding the store from a patched tree.

`applyChangePacketMetadataToSnapshot(...)` updates snapshot metadata without
claiming the tree sections are the active post-packet content model. If a cache
does not yet have a runtime store, the previous tree-shaped snapshot patch
helper remains available as a compatibility fallback.

Visible-range changes after a text packet preserve the updated runtime store
when the snapshot revision and store revision match, so range requests do not
accidentally restore stale tree text.

## Acceptance Evidence

Phase 50 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- source guards prove the text packet store helper and apply mode exist;
- generated snapshots expose `browser.applyTextPacketToRuntimeStore`;
- Node tests prove text packet application updates store content, preserves
  node count and child ids, and rejects structural child changes;
- runtime-cache tests prove packet-cache state reports `text-packet-direct`;
- runtime-cache tests prove metadata snapshots advance revision while the
  active node content comes from the store;
- visible-range refresh after packet apply keeps the direct store text.

## Non-Goals

Phase 50 does not implement structural add/delete/move:

- no id-based structural packet engine for node insertion, deletion, reorder,
  section changes, zone changes, table row/column changes, or column layout
  changes;
- no persistent runtime-store storage;
- no lazy heavy-detail endpoint;
- no viewport or scroll controller;
- no virtualized renderer;
- no hidden/offscreen DOM pruning;
- no rich text editing;
- no contenteditable DOM mapping;
- no live-layout renderer;
- no persistence;
- no backend API routes outside the sandbox dev server;
- no package/document version changes.
