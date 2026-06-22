# Template Builder Visible Range Boundary

Status: Phase 47 implementation boundary.

Phase 47 adds the first bounded visible-range contract for the template-builder
sandbox runtime. The sandbox still renders the full document shell, but the
active normalized editor view no longer reports `visibleNodeIds` as a plain
all-node placeholder by default.

## Purpose

Phase 45 introduced lookup-first editor indexes. Phase 46 moved cache and
packet application into a dedicated runtime-cache module. Phase 47 adds the
next scale guard: visible work must be expressible as ids before any real
viewport virtualization or lazy detail route is added.

The Phase 47 flow is:

```text
snapshot
  -> editor indexes
  -> visible range request
  -> visible node ids
  -> runtime cache status and future viewport/lazy-detail inputs
```

## Implemented Module

`examples/template-builder-sandbox/public/visibleRange.js` owns:

- `createVisibleRange(...)`;
- `VISIBLE_RANGE_SOURCE`;
- `VISIBLE_RANGE_KIND`.

The module has no DOM dependency. It operates on editor-view index inputs:

- `nodeOrder`;
- `sectionIds`;
- `sectionIdByNodeId`.

## Default Range

The default visible range is a `section-window` anchored to the first section.
For the current product report fixture, that means:

- visible section: `section-cover`;
- visible nodes: 16;
- total nodes: 52;
- windowed: true.

This is not claiming visual virtualization. It is a runtime contract that lets
future rendering, selection, lazy detail, and live layout work reason about a
bounded visible slice by node ids.

## Ownership

- `visibleRange.js` owns range calculation.
- `editorView.js` owns normalized indexes and stores the resolved range.
- `runtimeCache.js` carries visible-range facts through boot, refresh, and
  packet application.
- `app.js` only displays range status for now.

## Current Behavior

The visible range supports:

- `section-window`;
- explicit `anchorSectionId`;
- explicit `anchorNodeId` resolved to a section;
- `maxNodes` truncation;
- optional section overscan before and after the anchor section;
- explicit `all-nodes` request for tests/debug.

The runtime cache preserves the prior visible-range request across packet
application so accepted mutations do not silently reset the current range.

## Acceptance Evidence

Phase 47 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- sandbox sources include `public/visibleRange.js` as a dependency-clean
  browser module;
- generated snapshots expose `browser.resolveVisibleRange`;
- `editorView.js` imports the visible-range module;
- default editor views report `section-window`, not `all-nodes`;
- direct Node tests build a bounded section range with `maxNodes` truncation;
- runtime-cache packet application preserves visible-range facts.

## Non-Goals

Phase 47 does not implement:

- DOM scroll tracking;
- viewport measurement;
- actual virtualized rendering;
- hidden/offscreen DOM pruning;
- lazy heavy-detail routes;
- structural packet patching without snapshot tree patching;
- rich text editing;
- contenteditable DOM mapping;
- live-layout rendering;
- persistence;
- backend API routes outside the sandbox dev server;
- package/document version changes.
