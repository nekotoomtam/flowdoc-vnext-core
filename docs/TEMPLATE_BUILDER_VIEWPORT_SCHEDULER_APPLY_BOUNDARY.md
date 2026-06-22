# Template Builder Viewport Scheduler Apply Boundary

Status: Phase 62 implementation boundary.

Phase 62 lets the sandbox manually apply a viewport scheduler candidate through
the same visible-range request path used by viewport measurement. It is a
controlled gate after the Phase 61 observe-only candidate, not an automatic
virtualized renderer scheduler.

## Purpose

Phase 61 could predict which sections a future scheduler would request, but
the visible app only displayed that candidate. Phase 62 adds one guarded apply
step:

```text
section offset prediction
  -> scheduler candidate
  -> scheduler apply gate
  -> visible range request
  -> runtime cache
  -> render window
  -> render shell
```

The gate exists so candidate requests do not bypass draft, IME, revision, or
render-window stability checks.

## Module Owner

`examples/template-builder-sandbox/public/viewportSchedulerApply.js` owns:

- `VIEWPORT_SCHEDULER_APPLY_SOURCE`;
- `VIEWPORT_SCHEDULER_APPLY_MODE`;
- `createViewportSchedulerApplyRequest(...)`.

The module is DOM-free. It accepts a scheduler candidate and runtime guard
facts, then returns either a visible-range request or a blocked/stable status.
It does not call `setVisibleRangeRequest(...)`, bind events, read elements,
own timers, or mutate runtime cache state.

## App Boundary

`examples/template-builder-sandbox/public/app.js`:

- exposes an `Apply candidate` command in the canvas metric strip;
- creates a non-observe candidate only for the gated apply attempt;
- calls `createViewportSchedulerApplyRequest(...)`;
- applies the returned visible-range request through the existing
  `setVisibleRangeRequest(...)` path only when the gate reports ready;
- preserves section-anchor scroll restoration when a current viewport
  measurement is available;
- reports `Scheduler apply: ...` in the status bar.

Candidate status remains visible separately as `Viewport candidate: ...`.

## Guard Rules

The apply gate blocks when:

- no scheduler candidate exists;
- the candidate source is not the expected viewport scheduler source;
- a browser draft is active;
- IME composition is active;
- document and runtime revisions do not match;
- the candidate has no request;
- the candidate is blocked or not ready;
- the candidate is stable and would not change the render window.

Stable candidates are reported as stable, not as errors.

## Acceptance Evidence

Phase 62 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- source guards prove scheduler apply policy lives in
  `viewportSchedulerApply.js`;
- generated action lanes expose `browser.applyViewportSchedulerCandidate`;
- synthetic candidates prove ready, stable, draft-blocked, and
  revision-blocked apply behavior;
- app source guards prove the visible command applies through the existing
  visible-range request path.

## Explicit Non-Goals

Phase 62 does not implement the final viewport scheduler:

- no automatic render-window scheduling from candidates;
- no continuous budgeted scheduling loop;
- no virtual list;
- no hidden/offscreen DOM pruning beyond the existing render shell;
- no lazy heavy-detail route;
- no node anchor or caret-aware anchor;
- no structural packet engine;
- no rich text or contenteditable mapping;
- no live-layout renderer;
- no persistence or API route;
- no package/document version change.
