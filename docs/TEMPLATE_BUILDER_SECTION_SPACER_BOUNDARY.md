# Template Builder Section Spacer Boundary

Status: Phase 59 implementation boundary.

Phase 59 adds measured section spacer facts to the sandbox. It records section
heights from browser-local shell measurements and reuses those heights as
section shell minimum heights on later render passes.

## Purpose

Phase 58 can restore from `sectionId + offsetInSection`, but the shell can
still shift when a section changes between placeholder and rendered detail.
Section spacers reduce that shift by letting a placeholder keep the last known
section height.

The Phase 59 contract is deliberately bounded:

```text
section-shell measurement
  -> section spacer map
  -> render shell page style
  -> placeholder min-height
  -> later measurement refresh
```

This improves scroll stability before measured spacers become a production
virtual list or renderer scheduler.

## Implemented Module Contract

`examples/template-builder-sandbox/public/viewportSectionSpacers.js` owns:

- `VIEWPORT_SECTION_SPACER_SOURCE`;
- `VIEWPORT_SECTION_SPACER_MODE`;
- `DEFAULT_SECTION_SPACER_HEIGHT`;
- `createViewportSectionSpacerMap(...)`;
- `resolveViewportSectionSpacer(...)`.

The module is DOM-free. It accepts normalized viewport measurements and keeps
rendered section heights as measured facts. Placeholder-only sections use a
default or previous estimate, but they do not overwrite a previous rendered
measurement.

## App Integration

`examples/template-builder-sandbox/public/app.js` now:

- keeps a browser-local section spacer map;
- updates that map from viewport measurements;
- renders each page shell with `--section-spacer-height`;
- exposes `data-section-spacer-height` and `data-section-spacer-reason` for
  inspection and tests;
- applies the spacer height as the page/placeholder minimum height;
- reports measured versus estimated spacer counts in the status bar.

## Acceptance Evidence

Phase 59 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- source guards prove `browser.trackSectionSpacers` is exposed;
- source guards prove spacer policy lives in `viewportSectionSpacers.js`;
- source guards prove the spacer module stays DOM-free while `app.js` owns DOM
  measurement and CSS variable application;
- Node tests prove rendered measurements update section heights;
- Node tests prove placeholder measurements preserve previous rendered heights;
- browser smoke verifies scrolling to `section-body` records a measured spacer
  for the rendered body section and keeps scroll-driven rendering working.

## Non-Goals

Phase 59 does not implement the final viewport spacer system:

- no virtual list;
- no top-offset spacer map for arbitrary node windows;
- no continuous virtualized renderer scheduler;
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
