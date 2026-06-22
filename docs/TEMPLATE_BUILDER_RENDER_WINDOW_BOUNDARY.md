# Template Builder Render Window Boundary

Status: Phase 52 implementation boundary.

Phase 52 adds a browser-safe render window contract between the store-backed
render model and the visible sandbox canvas. The render window answers which
sections and node ids are active for the current render pass without owning DOM
scroll tracking, viewport measurement, or virtualized renderer scheduling.

## Purpose

Phase 47 introduced bounded visible ranges. Phase 51 made rendering read from
the runtime store. Phase 52 connects those two contracts:

```text
runtime store + visible range
  -> store-backed render model
  -> render window
  -> windowed canvas read path
```

The render model still carries full section metadata for navigation and debug
status. The visible canvas consumes the render window so later viewport,
scroll, lazy-detail, and virtualized-renderer work can replace the request
source without changing the canvas traversal contract.

## Implemented Module

`examples/template-builder-sandbox/public/renderWindow.js` owns:

- `createRenderWindow(...)`;
- render-window source, mode, section ids, node ids, and count metadata;
- node and section membership helpers;
- visible-range-backed window facts without browser DOM access.

The render window mode is `visible-range-render-window`.

Phase 53 adds `public/viewportController.js` as a future producer of
visible-range requests. The render window continues to consume resolved visible
ranges and does not read DOM scroll state directly.

Phase 54 adds `public/renderShell.js` above the render window so the canvas can
keep full-document section placeholders while detailed node rendering stays
bounded to the active window.

## Runtime Ownership

`renderModel.js` creates one render window from the active runtime cache's
visible range and exposes:

- render-window source and mode;
- active section/node counts;
- total node counts from the visible-range contract;
- helper reads for windowed canvas section roots and children.

`app.js` consumes those helpers for canvas traversal and status output. It does
not compute render windows directly.

## Acceptance Evidence

Phase 52 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- source guards prove `public/renderWindow.js` is browser-safe;
- generated snapshots expose `browser.resolveRenderWindow`;
- Node tests prove render-window facts are derived from visible ranges;
- app source guards prove canvas traversal consumes render-window helpers;
- render model tests prove the full store-backed model remains available while
  the active render window is bounded.

## Non-Goals

Phase 52 does not implement full viewport virtualization:

- no DOM scroll tracking;
- no viewport measurement;
- no hidden/offscreen DOM pruning scheduler;
- no lazy heavy-detail endpoint;
- no structural add/delete/move packet application;
- no rich text editing;
- no contenteditable DOM mapping;
- no live-layout renderer;
- no persistence;
- no backend API routes outside the sandbox dev server;
- no package/document version changes.
