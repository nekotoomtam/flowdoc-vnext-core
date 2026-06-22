# Template Builder Viewport Measurement Boundary

Status: Phase 55 implementation boundary.

Phase 55 adds the first bounded measurement layer between the rendered canvas
shell and the viewport request contract. It measures section shell boxes into
plain viewport facts without making DOM layout canonical document truth.

## Purpose

Phase 54 kept every document section represented in the canvas through render
shell placeholders. Phase 55 gives that shell a small measurement bridge:

```text
render shell pages
  -> section-shell measurement
  -> viewport facts
  -> viewport request resolver
  -> visible range request
```

This lets later scroll controllers and virtualized renderers reuse the same
request path instead of inventing a second range policy.

Phase 56 builds on this by adding a manual apply boundary. Measurement remains
the producer of facts; applying those facts is an explicit browser action, not
automatic scroll behavior.

## Implemented Module

`examples/template-builder-sandbox/public/viewportMeasurement.js` owns:

- `createViewportMeasurement(...)`;
- `createViewportFactsFromMeasurement(...)`;
- `resolveMeasuredViewportRangeRequest(...)`;
- measurement source, mode, viewport top/height, section visibility, section
  coverage, and anchor-section selection.

The measurement mode is `section-shell-measurement`.

## Runtime Ownership

The browser app may read DOM rectangle facts from `.page[data-section-id]`
elements because DOM measurement is inherently browser-local. The policy that
normalizes those facts and chooses the active section lives in
`viewportMeasurement.js`.

The measurement layer may produce:

- section ids;
- section top, bottom, and height;
- shell state such as `rendered` or `placeholder`;
- viewport top, height, and scroll height;
- visible section ids;
- an anchor section id for the existing viewport request resolver.

The measurement layer must not own canonical authored data, persisted package
state, exact layout truth, or final pagination geometry.

## App Integration

`examples/template-builder-sandbox/public/app.js` now:

- adds `data-section-id` to each render-shell page;
- reads current section page rectangles after render;
- calls `createViewportMeasurement(...)`;
- shows a read-only measurement status in the status bar.

This does not bind scroll events, auto-update the visible range from scrolling,
or replace selection/draft request ownership.

## Acceptance Evidence

Phase 55 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- source guards prove `public/viewportMeasurement.js` is browser-safe and
  DOM-free;
- generated snapshots expose `browser.measureViewportShell`;
- Node tests prove synthetic section shell boxes choose the most-visible
  anchor section and feed the existing viewport request path;
- app source checks prove pages carry section ids and measurement status
  without adding scroll event binding.

## Non-Goals

Phase 55 does not implement viewport control:

- no scroll event binding;
- no automatic visible-range switching from scroll;
- no measured spacer heights;
- no virtual list or virtualized renderer scheduler;
- no hidden/offscreen DOM pruning;
- no lazy heavy-detail endpoint;
- no structural add/delete/move packet application;
- no rich text editing;
- no contenteditable DOM mapping;
- no live-layout renderer;
- no persistence;
- no backend API routes outside the sandbox dev server;
- no package/document version changes.
