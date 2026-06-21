# Template Builder Live Layout Boundary

Status: Phase 35 implementation boundary.

Phase 35 connects accepted sandbox text mutations to the existing vNext live
layout boundary. It does not render live pages. It proves that the visible
sandbox can carry a bounded layout invalidation summary in the same packet path
used for replace, append, undo, and redo.

## Flow

```text
browser text action / undo / redo
  -> sandbox mutation bridge
  -> runVNextTextTransaction(...)
  -> text-block dirty scope
  -> resolveVNextLiveLayoutBoundary(...)
  -> snapshot.liveLayout / packet.liveLayout
  -> browser runtime cache, inspector, and status
```

The dirty scope remains the only bridge between authoring and live layout. The
sandbox does not read browser DOM ranges, does not measure text, and does not
run exact pagination.

## Contract

`liveLayout` is a bounded runtime summary:

- `mode` names `static-snapshot` or `in-memory-bridge`.
- `requestCount` increments only when the core boundary returns
  `layout-request`.
- `lastResult` records kind, reason, request id, visible range kind, dirty
  scope count, affected section/zone/node/text/table ids, and freshness.
- `exactGenerationStale` mirrors the core exact-generation stale marker.
- `freshness.exactGeneration.finalTruth` remains `measured-pagination`.

Accepted text mutations, undo, and redo update this summary before the response
packet is built. Rejected actions do not create a new live layout request; they
return the previous summary unchanged.

## Browser Consumption

The browser applies `packet.liveLayout` through the existing packet cache path.
It displays the latest request count and exact stale marker, but it does not
materialize live layout pages.

## Not Implemented

Phase 35 does not implement:

- a live layout renderer;
- text measurement caches;
- viewport scheduling;
- DOM caret mapping;
- IME composition;
- exact layout execution;
- preview, PDF, or DOCX rendering;
- save/publish persistence;
- backend API routes outside the sandbox dev server.
