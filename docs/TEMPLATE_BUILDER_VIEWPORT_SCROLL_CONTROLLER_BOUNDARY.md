# Template Builder Viewport Scroll Controller Boundary

Status: Phase 57 implementation boundary.

Phase 57 adds the first debounced viewport scroll controller path to the
sandbox. It listens to canvas scroll movement, waits for the movement to
settle, and then applies the current measured section shell through the same
visible-range request path proven in Phase 56.

Phase 58 builds on this with a section-relative viewport anchor so controller
render passes do not have to rely only on raw `scrollTop` restoration.

## Purpose

The controller is intentionally small:

```text
canvas scroll event
  -> record pending viewport scroll
  -> debounce until settled
  -> read current section-shell measurement
  -> create viewport measurement apply request
  -> visible range request
  -> runtime cache
  -> render window
  -> render shell
```

This gives the sandbox a usable scroll-to-render feedback loop without claiming
the final viewport controller, measured spacer model, or virtualized renderer.

## Implemented Module Contract

`examples/template-builder-sandbox/public/viewportScrollController.js` owns:

- `VIEWPORT_SCROLL_CONTROLLER_SOURCE`;
- `VIEWPORT_SCROLL_CONTROLLER_MODE`;
- `DEFAULT_VIEWPORT_SCROLL_DEBOUNCE_MS`;
- `createViewportScrollControllerState(...)`;
- `recordViewportScroll(...)`;
- `settleViewportScroll(...)`.

The module is DOM-free. It does not bind events, read elements, or own timers.
It only records controller state and decides whether a settled scroll can
produce a measurement apply request.

## App Integration

`examples/template-builder-sandbox/public/app.js` now:

- binds the sandbox canvas `scroll` event;
- records pending scroll movement with the controller module;
- debounces settled scroll with a browser-local timer;
- applies the current measurement through the existing visible-range request
  path when safe;
- skips automatic apply while a browser draft or IME composition is active;
- restores scroll position after render without letting restore events create a
  controller loop;
- reports scroll-controller status in the status bar.

Manual `Apply viewport` remains available as a debugging and recovery command.

## Acceptance Evidence

Phase 57 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- source guards prove `browser.controlViewportScroll` is exposed;
- source guards prove scroll policy lives in `viewportScrollController.js`;
- source guards prove the scroll controller stays DOM-free while `app.js` owns
  the actual browser event binding;
- Node tests prove settled scroll can switch the active render window through
  runtime cache;
- Node tests prove active drafts/IME can skip automatic apply;
- browser smoke verifies scrolling the sandbox canvas can switch detailed
  rendering after debounce without pressing `Apply viewport`.

## Non-Goals

Phase 57 does not implement the final viewport system:

- no measured spacer heights;
- no virtual list;
- no continuous throttled virtualized renderer scheduler;
- no lazy heavy-detail endpoint;
- no hidden/offscreen DOM pruning beyond the existing render shell;
- no viewport range persistence;
- no structural add/delete/move packet application;
- no rich text editing;
- no contenteditable DOM mapping;
- no live-layout renderer;
- no persistence;
- no backend API routes outside the sandbox dev server;
- no package/document version changes.
