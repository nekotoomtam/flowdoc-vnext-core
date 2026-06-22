# Template Builder Visible Range Request Boundary

Status: Phase 48 implementation boundary.

Phase 48 separates the question "why and where should the editor look?" from
the resolved visible node ids. The sandbox still does not measure viewport
geometry or virtualize DOM output, but the runtime now carries a first-class
`visibleRangeRequest` beside the resolved `visibleRange`.

## Purpose

Phase 47 added `public/visibleRange.js`, which can turn section and node
anchors into bounded visible node ids. Phase 48 adds the request layer that
decides which anchor, reason, and budget should be used before that resolver
runs.

The Phase 48 flow is:

```text
browser event or runtime transition
  -> visibleRangeRequest
  -> visibleRange resolver
  -> editorView.visibleRange
  -> runtimeCache.visibleRange facts
```

This keeps scroll, selection, draft, packet, and future viewport behavior from
encoding policy directly inside the range resolver or app renderer.

## Implemented Module

`examples/template-builder-sandbox/public/visibleRangeRequest.js` owns:

- `createVisibleRangeRequest(...)`;
- `createBootVisibleRangeRequest(...)`;
- `createSelectionVisibleRangeRequest(...)`;
- `createDraftVisibleRangeRequest(...)`;
- `preserveVisibleRangeRequest(...)`;
- request source, version, kind, reason, and budget constants.

The module has no DOM dependency. It only returns plain request records.

## Request Shape

A visible range request contains:

- `source: "flowdoc-visible-range-request"`;
- `version: 1`;
- `kind`, currently `section-window` or debug `all-nodes`;
- `reason`, such as `boot`, `selection`, `draft`, `packet-apply`, or
  `selection-preserved`;
- `anchorNodeId` and `anchorSectionId`;
- `budget`, currently `{ mode, maxNodes }`;
- section overscan settings;
- `preserveDuringDraft`;
- `preservedFromReason` when a request is carried forward.

`maxNodes` is a budget field, not a permanent product answer. The default is
`null`, which lets the current section window decide the node count. Tests
prove explicit budget overrides work without locking the product to a fixed
number.

## Runtime Ownership

- `visibleRangeRequest.js` owns request creation and preserve rules.
- `visibleRange.js` normalizes the request and resolves it into node ids.
- `editorView.js` stores both `visibleRangeRequest` and `visibleRange`.
- `runtimeCache.js` exposes request reason/source beside resolved range facts.
- `app.js` sends lightweight event intent for selection and draft start.

Packet application preserves the current request and records
`reason: "packet-apply"` so accepted mutations do not silently reset the
active visible section.

## Current Behavior

- Boot starts from a `boot` request anchored to the first section.
- Selecting a node creates a `selection` request anchored to that node.
- Starting a valid draft creates a `draft` request and marks it
  `preserveDuringDraft`.
- Selection while a draft-preserved request is active produces
  `selection-preserved`.
- Packet application preserves the prior anchor and budget as
  `packet-apply`.
- The status bar displays both request and resolved range facts.

## Acceptance Evidence

Phase 48 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- sandbox sources include `public/visibleRangeRequest.js` as a dependency-clean
  browser module;
- generated snapshots expose `browser.updateVisibleRangeRequest`;
- Node tests prove boot, selection, draft, selection-preserved, and
  packet-apply request behavior;
- runtime-cache tests prove request source/reason and resolved range source are
  separate facts;
- browser smoke verifies range request status and packet-cache draft commit
  behavior.

## Non-Goals

Phase 48 does not implement:

- DOM scroll tracking;
- viewport measurement;
- viewport controller ownership;
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
