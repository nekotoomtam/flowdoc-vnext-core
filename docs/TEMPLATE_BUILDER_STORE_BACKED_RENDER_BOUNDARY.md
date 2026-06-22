# Template Builder Store-Backed Render Boundary

Status: Phase 51 implementation boundary.

Phase 51 makes the sandbox render path consume a store-backed render model
instead of walking the tree-shaped snapshot for page/root/node content. The
snapshot remains the boot, debug, and metadata payload, but active node reads
for tree and canvas rendering now come from the runtime store.

## Purpose

Phase 50 lets bounded text packets update `runtimeStore.nodeById` directly.
Phase 51 makes rendering follow that active runtime shape:

```text
snapshot section/page metadata
  + runtimeStore section roots and node content
  -> store-backed render model
  -> tree/canvas/inspector read path
```

This prevents a post-packet render or visible-range change from drifting back
to stale tree-shaped snapshot text while still keeping the sandbox shell simple
before viewport work.

## Implemented Module

`examples/template-builder-sandbox/public/renderModel.js` owns:

- `createStoreBackedRenderModel(...)`;
- `getStoreBackedRenderNode(...)`;
- `getStoreBackedRenderChildren(...)`;
- `getStoreBackedRenderSectionRootNodes(...)`;
- render model source, mode, version, section count, node count, and visible
  section facts.

The render model mode is `store-backed-render-model`.

Phase 52 adds `public/renderWindow.js` on top of this model so the active
canvas traversal can consume visible-range-derived section and node windows
without moving that policy into `app.js`.

## Runtime Ownership

`app.js` now creates a render model during render and uses it for:

- selected node reads before falling back to runtime cache;
- node children in tree, canvas, and inspector child rows;
- section root zones in tree and canvas;
- render status reporting.

`snapshot.sections` is no longer the app shell's section iteration path for
tree/canvas rendering. Section ids and page labels are carried as metadata in
the render model, while root zones and node content are resolved from the
runtime store.

## Acceptance Evidence

Phase 51 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- source guards prove `public/renderModel.js` is browser-safe and app rendering
  imports it;
- generated snapshots expose `browser.createStoreBackedRenderModel`;
- Node tests prove the render model reads changed text from the runtime store
  after a text packet while the tree-shaped snapshot still contains old text;
- source guards prove `app.js` no longer uses `snapshot.sections.map` for
  tree/canvas rendering.

## Non-Goals

Phase 51 does not implement viewport virtualization:

- no DOM scroll tracking;
- no viewport measurement;
- no hidden/offscreen DOM pruning;
- no lazy heavy-detail endpoint;
- no structural add/delete/move packet application;
- no rich text editing;
- no contenteditable DOM mapping;
- no live-layout renderer;
- no persistence;
- no backend API routes outside the sandbox dev server;
- no package/document version changes.
