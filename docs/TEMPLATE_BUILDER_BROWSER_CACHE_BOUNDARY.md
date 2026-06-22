# Template Builder Browser Cache Boundary

Status: Phase 31 implementation boundary.

Phase 31 turns the Phase 30 change packet into the browser's active mutation
response path. The sandbox still loads a full snapshot on boot, but accepted
and rejected bridge actions now request packet-only responses and apply those
packets to a browser-owned runtime cache.

## Purpose

The browser runtime flow is now:

```text
boot
  -> GET /api/snapshot
  -> browser snapshot view model
  -> browser runtime cache and node index

mutation
  -> POST /api/actions/replace-text?response=packet
  -> apply change packet to snapshot view model
  -> rebuild browser runtime cache
```

The browser cache is not canonical document truth. It is a derived view model
cache for rendering and selection lookup. Canonical package state stays inside
the sandbox mutation bridge and vNext core transaction path.

## Runtime Cache Contract

The browser cache owns:

- node id lookup for selection and inspector reads;
- boot revision;
- current document revision;
- current node count;
- packet apply count;
- last packet revision;
- fallback snapshot refresh count.

The cache is rebuilt from the current browser snapshot view model after a
packet applies. That is acceptable in this phase because the goal is response
ownership and browser-side packet consumption before typing work starts.

Phase 32 reuses this cache path for `sandbox.insertPlainTextAtEnd`, the first
explicit text-insert action.

Phase 33 reuses the same packet path for bounded authoring-history summaries,
so the browser cache updates history status without receiving full history
records or a complete snapshot tree.

Phase 34 sends undo/redo results through the same packet path. The browser does
not replay history locally; it applies changed node summaries returned by the
sandbox bridge.

Phase 35 sends `liveLayout` summaries through the same packet path. The browser
updates request count, affected scope, and exact-stale status without running a
live layout renderer or exact pagination.

Phase 37 uses this same packet path for WYSIWYG browser draft commits. Active
draft text stays local until commit; successful or rejected commits return a
packet that updates the derived browser view model.

Phase 43 clarifies that this early cache is only the first derived browser
view. Rebuilding from the current tree-shaped snapshot remains acceptable for
the small sandbox, but the long-term editor runtime must move toward
normalized lookup indexes (`nodeById`, `parentById`, `childrenById`, visible
range ids, and dirty id sets) with lazy heavy-detail access. The tree snapshot
must not become the active runtime shape for large-document editing.

Phase 45 adds the first normalized editor view module. The sandbox still
patches the tree-shaped snapshot view model after packets, then rebuilds the
editor view, but selection and render traversal now have lookup-first indexes
owned by `public/editorView.js`.

Phase 46 moves boot, refresh, and packet-apply cache rules into
`public/runtimeCache.js`. The app shell delegates to that module and no longer
owns the packet source check, revision guard, tree-shaped patch, or normalized
view rebuild policy directly.

Phase 47 adds `public/visibleRange.js` and changes the default editor view from
an all-node visible range placeholder to a bounded `section-window`. The cache
now carries range kind, visible node count, total node count, and visible
section ids for future viewport/lazy-detail work while the sandbox still
renders the full document shell.

Phase 48 adds `public/visibleRangeRequest.js`. The cache now carries both the
request reason/budget/anchor and the resolved range facts, so selection, draft,
packet apply, and future viewport work can share one intent contract before
range resolution.

Phase 49 adds `public/runtimeStore.js` below the normalized editor view. The
browser cache now carries a store-owned structural lookup layer while the
tree-shaped snapshot remains the boot/debug and temporary packet patch model.

Phase 50 makes supported text-block packets apply directly to the runtime
store. The browser updates snapshot metadata for revision and summaries, but
active changed text comes from `runtimeStore.nodeById` rather than from a
patched tree section.

Phase 51 adds `public/renderModel.js` above the runtime store. Tree and canvas
rendering now consume store-backed section roots and node content while
retaining snapshot metadata for page labels, toolbar facts, diagnostics, and
action summaries.

## Packet Apply Rules

- The browser asks the mutation route for `?response=packet`.
- A valid packet must have source `flowdoc-template-builder-change-packet` and
  packet version `1`.
- The packet base revision must match the browser runtime revision.
- Supported text-block changed node summaries replace matching entries in the
  runtime store.
- Snapshot metadata is updated for revision, mutation bridge, diagnostics,
  authoring history, and live-layout summary; tree sections remain boot/debug
  payloads for supported text packets.
- Mutation bridge metadata, diagnostics, authoring history, live-layout summary,
  dirty scope count, and document revision are updated from the packet.
- If a packet is missing, stale, or asks for a snapshot, the browser refreshes
  from `/api/snapshot` and records a fallback snapshot refresh.

## Non-Goals

Phase 31 does not implement:

- per-keystroke typing;
- DOM caret mapping;
- IME composition;
- partial text ranges from browser selection;
- durable/full undo/redo replay beyond sandbox text patches;
- durable authoring history persistence;
- live layout rendering beyond bounded request summaries;
- structural packet operations;
- durable browser cache persistence;
- save/publish persistence;
- backend API routes outside the sandbox dev server;
- exact layout, preview, PDF, or DOCX rendering.
