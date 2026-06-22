# Template Builder Viewport Scheduler Candidate Boundary

Status: Phase 61 implementation boundary.

Phase 61 adds an observe-only scheduler candidate over the Phase 60 section
offset prediction. It is the first place where the sandbox can say which
sections a future viewport scheduler would ask to render, without letting that
candidate drive the render window yet.

## Why This Exists

Phase 60 can answer "where is the viewport inside the section intervals?"
Phase 61 asks the next question:

```text
section offset prediction
  -> candidate section ids with overscan
  -> visible-range request candidate
  -> observe-only scheduler status
```

This is still not virtualized rendering. DOM measurement and the existing
manual/debounced viewport apply path remain the only path that changes the
active visible range in the sandbox.

## Module Owner

`examples/template-builder-sandbox/public/viewportSchedulerCandidate.js` owns:

- `VIEWPORT_SCHEDULER_CANDIDATE_SOURCE`;
- `VIEWPORT_SCHEDULER_CANDIDATE_MODE`;
- `DEFAULT_VIEWPORT_SCHEDULER_OVERSCAN_SECTIONS`;
- `createViewportSchedulerCandidate(...)`.

The module is DOM-free. It accepts the section offset index, current viewport
prediction, current render window, previous visible-range request, optional
scroll-controller state, and an optional budget. It returns:

- ordered section ids;
- predicted section ids;
- candidate section ids expanded by overscan;
- current/missing/extra section ids versus the active render window;
- confidence: `measured`, `estimated`, `mixed`, or `missing`;
- a candidate visible-range request;
- `applyState` and `applyReady`.

The sandbox app passes `observeOnly` implicitly. Because `observeOnly` defaults
to true, `applyReady` remains false in the visible app. Future phases may call
the same module with `observeOnly: false`, but only after a separate scheduling
boundary is accepted.

## App Boundary

`examples/template-builder-sandbox/public/app.js`:

- keeps `state.viewportSchedulerCandidate`;
- updates it after section offset prediction changes;
- updates it again when scroll movement is recorded or skipped;
- reports `Viewport candidate: ...` in the status bar;
- does not call `setVisibleRangeRequest(...)` from the scheduler candidate.

The only render-window-changing paths remain:

- manual `Apply viewport`;
- debounced settled scroll using the existing measurement apply request;
- selection/draft visible-range requests.

## Acceptance Evidence

Phase 61 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- source guards prove candidate policy lives in
  `viewportSchedulerCandidate.js`;
- the app imports candidate policy but does not own candidate math;
- generated action lanes expose `browser.planViewportCandidate`;
- synthetic section intervals prove long-section predictions expand to
  overscanned candidate section ids;
- observe-only candidates stay non-applying, while explicit non-observe
  candidates can report `ready`.

## Explicit Non-Goals

Phase 61 does not implement the final viewport scheduler:

- no automatic render-window scheduling from candidate requests;
- no virtual list;
- no top/bottom spacer elements outside the existing page shell;
- no hidden/offscreen DOM pruning beyond the existing render shell;
- no lazy heavy-detail route;
- no node anchor;
- no outline jump-to-node;
- no diagnostics/source jump-to-node;
- no caret-relative text block anchor;
- no typing-driven live layout pushdown;
- no structural packet engine;
- no rich text or contenteditable mapping;
- no persistence or API route;
- no package/document version change.
