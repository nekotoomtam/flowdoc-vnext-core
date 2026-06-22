# Template Builder Viewport Scheduler Runtime Boundary

Status: Phase 63 implementation boundary.

Phase 63 adds a browser-safe viewport scheduler runtime around the Phase 61
candidate and Phase 62 apply gate. It tracks candidate sequence, request ids,
revision facts, and stale apply results before any automatic scheduler loop or
virtualized renderer is claimed.

## Purpose

Phase 62 proved that a scheduler candidate can become a visible-range request
through a manual guard. Phase 63 moves the stateful scheduling contract out of
`app.js` so later phases can add budgeted automation without making the sandbox
browser shell own scheduler policy.

The runtime is intentionally small:

- candidate planning gets a monotonic scheduler sequence;
- each candidate gets a deterministic scheduler request id;
- document/runtime revisions are captured beside the candidate;
- apply attempts are rejected when a candidate is stale;
- the existing Phase 62 apply gate still owns draft, IME, revision, ready, and
  stable-window checks.

## Module Owner

`examples/template-builder-sandbox/public/viewportSchedulerRuntime.js` owns:

- `VIEWPORT_SCHEDULER_RUNTIME_SOURCE`;
- `VIEWPORT_SCHEDULER_RUNTIME_MODE`;
- `VIEWPORT_SCHEDULER_RUNTIME_VERSION`;
- `createViewportSchedulerRuntimeState(...)`;
- `planViewportSchedulerRuntimeCandidate(...)`;
- `applyViewportSchedulerRuntimeCandidate(...)`.

The module may import the Phase 61 candidate helper and the Phase 62 apply
gate. It must not import or touch DOM APIs, app state, browser events,
transport, persistence, or renderer implementation details.

## App Boundary

`examples/template-builder-sandbox/public/app.js` remains the browser
coordinator:

- it passes viewport facts, render-window facts, and current revisions into the
  runtime;
- it stores `state.viewportSchedulerRuntime`;
- it mirrors runtime-owned candidate/apply results into existing status output;
- it renders `Scheduler runtime: ...` beside candidate and apply status;
- it still performs the actual visible-range request update only after the
  runtime apply result reports ready.

`app.js` must not own scheduler sequence, request id, stale-candidate policy,
or future automatic scheduling policy.

## Runtime Guard Rules

The runtime blocks an apply attempt before the visible-range path when:

- the candidate is missing;
- the candidate source does not match the Phase 61 candidate contract;
- the candidate is missing runtime decoration (`schedulerSource`,
  `schedulerRequestId`, or `schedulerSequence`);
- the candidate request id no longer matches the latest runtime request;
- the candidate sequence is older than the runtime sequence;
- the candidate document revision no longer matches the active document
  revision;
- the candidate runtime revision no longer matches the active runtime cache
  revision.

The Phase 62 apply gate still blocks:

- draft-active state;
- active IME composition;
- document/runtime revision mismatch;
- blocked candidates;
- not-ready candidates;
- stable render-window candidates;
- missing candidate requests.

## Acceptance Evidence

Phase 63 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- the sandbox source guard reads `viewportSchedulerRuntime.js`;
- runtime ownership is checked for source/mode/version and DOM-free behavior;
- `browser.runViewportSchedulerRuntime` is exposed as a generated action lane;
- runtime planning assigns sequence/request ids;
- stale candidates are dropped before apply;
- ready candidates still pass through the Phase 62 apply gate.

## Explicit Non-Goals

Phase 63 does not implement automatic render-window scheduling:

- no virtual list;
- no hidden/offscreen DOM pruning beyond the existing render shell;
- no lazy heavy-detail route;
- no node-aware anchor or jump-to-node;
- no structural packet engine;
- no rich text or contenteditable mapping;
- no live-layout renderer;
- no persistence or API route;
- no package/document version change.
