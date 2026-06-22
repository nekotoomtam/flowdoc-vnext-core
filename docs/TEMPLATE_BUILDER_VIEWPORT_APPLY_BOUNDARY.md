# Template Builder Viewport Apply Boundary

Status: Phase 56 implementation boundary.

Phase 56 let the sandbox manually apply the current viewport measurement to
the existing visible-range request path. It proved the pipeline from measured
section shells into the render window without binding scroll events.

Phase 57 builds on this by adding a debounced scroll controller. The manual
apply command remains available as an explicit debugging and recovery command.

## Purpose

Phase 55 measured the rendered section shell. Phase 56 makes that measurement
actionable through a deliberate manual command:

```text
current section-shell measurement
  -> manual measurement apply request
  -> viewport request resolver
  -> visible range request
  -> runtime cache
  -> render window
  -> render shell
```

This is the first point where viewport measurement can affect which section
mounts detailed node content, but the user action is explicit and bounded.

## Implemented Module Contract

`examples/template-builder-sandbox/public/viewportMeasurement.js` now owns:

- `VIEWPORT_MEASUREMENT_APPLY_MODE`;
- `createViewportMeasurementApplyRequest(...)`;
- reuse of `resolveMeasuredViewportRangeRequest(...)`;
- the `manual-measurement-apply` mode that returns a normal
  `visibleRangeRequest`.

The apply helper stays DOM-free. It accepts an existing measurement or plain
measurement input and produces the same request shape consumed by
`runtimeCache.js`.

## App Integration

At the Phase 56 boundary, `examples/template-builder-sandbox/public/app.js`:

- keeps the latest viewport measurement in browser-local state;
- exposes an `Apply viewport` command in the canvas metric strip;
- applies the measurement through `createViewportMeasurementApplyRequest(...)`;
- updates the runtime cache through the existing visible-range request path;
- reports the latest manual viewport apply result in the status bar.

The app restored the measured canvas scroll position for that manual apply
render pass only. Phase 56 itself had no scroll event binding; the later
debounced scroll controller is documented separately in
`docs/TEMPLATE_BUILDER_VIEWPORT_SCROLL_CONTROLLER_BOUNDARY.md`.

## Acceptance Evidence

Phase 56 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- source guards prove `browser.applyViewportMeasurement` is exposed;
- source guards prove the app uses the measurement apply helper and still does
  not add scroll event binding;
- Node tests prove a synthetic measurement can manually switch the active
  render window through runtime cache;
- browser smoke verifies scrolling the sandbox canvas and clicking
  `Apply viewport` can switch detailed rendering to the measured section.

## Non-Goals

Phase 56 did not implement a viewport controller:

- no scroll event binding;
- no automatic visible-range switching while scrolling;
- no debounce or throttle scheduler;
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
