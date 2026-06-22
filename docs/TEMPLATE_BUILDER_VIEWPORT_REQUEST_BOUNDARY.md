# Template Builder Viewport Request Boundary

Status: Phase 53 implementation boundary.

Phase 53 adds a browser-safe viewport request contract before DOM scroll
tracking, viewport measurement, spacer lists, or virtualized renderer
scheduling. The contract converts normalized viewport facts into the existing
visible-range request shape.

## Purpose

Phase 52 made the canvas consume an explicit render window. The next stable
step is not to wire scroll behavior directly into `app.js`, but to define the
request object future scroll/viewport code must produce:

```text
viewport facts
  -> viewport request resolver
  -> visible range request
  -> visible range
  -> render window
  -> canvas
```

This keeps DOM measurement, range policy, and render traversal separate.

## Implemented Module

`examples/template-builder-sandbox/public/viewportController.js` owns:

- `createViewportFacts(...)`;
- `resolveViewportRangeRequest(...)`;
- viewport controller source, mode, scroll facts, anchor facts, overscan, and
  budget normalization;
- draft-preserve behavior when a viewport request arrives during a preserved
  draft range.

The viewport request mode is `viewport-range-request`.

## Runtime Ownership

The viewport controller does not read DOM state. It accepts facts such as:

- `anchorSectionId`;
- `anchorNodeId`;
- `scrollTop`;
- `viewportHeight`;
- `scrollHeight`;
- overscan section counts;
- visible-range budget.

The result contains a normal `visibleRangeRequest` that the existing runtime
cache can consume. This lets future DOM scroll measurement become a producer of
facts instead of a new owner of visible range policy.

Phase 54 adds a render shell above this request path. Viewport requests still
choose the active detail window; render shell placeholders keep the rest of the
document represented for future measurement work.

Phase 55 adds `public/viewportMeasurement.js` as a producer of viewport facts
from section shell boxes. The request resolver remains the owner of turning
those facts into visible-range requests.

## Acceptance Evidence

Phase 53 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- source guards prove `public/viewportController.js` is browser-safe;
- generated snapshots expose `browser.resolveViewportRangeRequest`;
- Node tests prove viewport facts produce visible-range requests consumed by
  runtime cache and render window;
- tests prove preserved draft ranges are not replaced by viewport movement.

## Non-Goals

Phase 53 does not implement viewport control:

- no DOM scroll event binding;
- no viewport measurement in this module;
- no spacer or virtual list;
- no scroll sync;
- no hidden/offscreen DOM pruning scheduler;
- no lazy heavy-detail endpoint;
- no structural add/delete/move packet application;
- no rich text editing;
- no contenteditable DOM mapping;
- no live-layout renderer;
- no persistence;
- no backend API routes outside the sandbox dev server;
- no package/document version changes.
