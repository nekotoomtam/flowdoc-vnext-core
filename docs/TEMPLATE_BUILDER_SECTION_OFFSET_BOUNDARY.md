# Template Builder Section Offset Boundary

Status: Phase 60 implementation boundary.

Phase 60 adds a section offset index and viewport prediction over measured
section spacer facts. It lets the sandbox reason about section ranges as
`top/height/bottom` intervals without turning that prediction into the final
render scheduler.

Phase 61 builds on these offset predictions by deriving observe-only scheduler
candidates. Those candidates remain dry-run status and do not replace DOM
measurement or the accepted viewport apply path.

## Purpose

Phase 59 knows how tall each section shell should be. Phase 60 derives where
those sections live in the scrollable document:

```text
section spacer map
  -> section offset index
  -> viewport range prediction
  -> predicted visible sections and offsetInSection
```

This is a root model, not the destination. DOM viewport measurement remains the
source of truth for applying visible range changes in this phase.

## Implemented Module Contract

`examples/template-builder-sandbox/public/viewportSectionOffsets.js` owns:

- `VIEWPORT_SECTION_OFFSET_SOURCE`;
- `VIEWPORT_SECTION_OFFSET_MODE`;
- `VIEWPORT_SECTION_PREDICTION_MODE`;
- `DEFAULT_SECTION_OFFSET_GAP`;
- `createViewportSectionOffsetIndex(...)`;
- `resolveViewportSectionOffset(...)`;
- `predictViewportFromSectionOffsets(...)`.

The module is DOM-free. It accepts section spacer facts, derives cumulative
section intervals, and predicts which section intervals intersect a viewport
range.

## Long Section Behavior

Long sections are represented as intervals, not as a single screen:

```text
section-body top 1587 height 4200 bottom 5787
viewport scrollTop 3200 height 700 bottom 3900
```

The prediction marks `section-body` visible because its interval intersects the
viewport interval. It also records:

```text
offsetInSection = 3200 - 1587 = 1613
coveragePx = 700
coverageRatio = 700 / 4200
```

This keeps the section-level root useful for long documents while leaving
node-aware and chunk-aware anchoring for later phases.

## App Integration

`examples/template-builder-sandbox/public/app.js` now:

- keeps a browser-local section offset index;
- updates that index when section spacer facts update;
- predicts visible sections from the current measurement scroll range;
- exposes `data-section-offset-top` and `data-section-offset-bottom` on page
  shells for inspection;
- reports the predicted anchor section, offset, and visible section count in
  the status bar.

## Acceptance Evidence

Phase 60 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- source guards prove `browser.predictViewportSections` is exposed;
- source guards prove offset policy lives in `viewportSectionOffsets.js`;
- source guards prove the offset module stays DOM-free while `app.js` owns DOM
  measurement and status output;
- Node tests prove long sections produce section interval predictions with
  `offsetInSection` and coverage facts;
- browser smoke verifies scrolling to `section-body` keeps DOM measurement
  working while the offset prediction reports the same section root.

## Non-Goals

Phase 60 does not implement the final viewport scheduler:

- no virtual list;
- no render-window scheduling from offset predictions;
- no top/bottom spacer elements outside the existing page shell;
- no hidden/offscreen DOM pruning beyond the existing render shell;
- no lazy heavy-detail endpoint;
- no node anchor;
- no outline jump-to-node;
- no diagnostics/source jump-to-node;
- no caret-relative anchor inside a text block;
- no typing-driven live layout pushdown;
- no rich text editing;
- no contenteditable DOM mapping;
- no persistence;
- no backend API routes outside the sandbox dev server;
- no package/document version changes.
