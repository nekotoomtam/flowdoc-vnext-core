# Template Builder Viewport Scheduler Automation Boundary

Status: Phase 64 implementation boundary.

Phase 64 turns the Phase 63 scheduler runtime into a budgeted automatic apply
contract. It lets the browser sandbox move from observe/manual scheduling to a
guarded auto-apply path when viewport facts change, without claiming a virtual
renderer or full document unmounting.

## Purpose

The scheduler must be able to request a new render window without app-owned
policy. Phase 64 adds a small automation layer that:

- normalizes scheduler budget with a finite default max-node cap;
- plans a non-observe runtime candidate;
- applies that candidate through the Phase 63 runtime and Phase 62 apply gate;
- exposes an automation status for applied, stable, blocked, stale, or skipped
  results;
- returns a visible-range request only when all guards pass.

## Module Owner

`examples/template-builder-sandbox/public/viewportSchedulerAutomation.js` owns:

- `VIEWPORT_SCHEDULER_AUTOMATION_SOURCE`;
- `VIEWPORT_SCHEDULER_AUTOMATION_MODE`;
- `DEFAULT_VIEWPORT_SCHEDULER_AUTO_MAX_NODES`;
- `createViewportSchedulerAutomationState(...)`;
- `runViewportSchedulerAutomation(...)`.

The module may import the Phase 63 runtime. It must not import or touch DOM
APIs, app state, browser events, timers, transport, persistence, or renderer
implementation details.

## App Boundary

`examples/template-builder-sandbox/public/app.js` remains the browser
coordinator:

- it passes current viewport facts, render-window facts, revisions, draft/IME
  state, and trigger into the automation module;
- it stores `state.viewportSchedulerAutomation`;
- it mirrors runtime-owned candidate/apply results into existing status output;
- it renders `Scheduler auto: ...` beside scheduler runtime status;
- it applies the returned visible-range request only when automation reports a
  ready scheduler apply result;
- it uses the same automation path for manual candidate apply and scroll-settled
  auto apply.

`app.js` must not own scheduler budget normalization, runtime sequencing,
stale-candidate policy, or automatic apply policy.

## Budget Rules

The automation layer always sends a finite scheduler budget:

- explicit `budget.maxNodes` wins;
- otherwise the previous visible-range request budget can be reused;
- otherwise `DEFAULT_VIEWPORT_SCHEDULER_AUTO_MAX_NODES` is used;
- budget mode remains `viewport` unless an explicit non-empty mode is supplied.

This bounds render scheduling before a virtual renderer exists. It does not
guarantee a final mounted-node count because Phase 65 still owns virtualized
render consumption.

## Acceptance Evidence

Phase 64 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- the sandbox source guard reads `viewportSchedulerAutomation.js`;
- automation ownership is checked for source/mode/default budget and DOM-free
  behavior;
- `browser.autoApplyViewportScheduler` is exposed as a generated action lane;
- automatic scheduling applies ready candidates through the runtime and Phase
  62 gate;
- missing scheduler budget receives the finite default cap;
- disabled automation skips without changing the runtime;
- draft/IME and stale guards still block before visible-range updates.

## Explicit Non-Goals

Phase 64 does not implement virtualized rendering:

- no virtual list;
- no hidden/offscreen DOM pruning beyond the existing render shell;
- no lazy heavy-detail route;
- no node-aware anchor or jump-to-node;
- no structural packet engine;
- no rich text or contenteditable mapping;
- no live-layout renderer;
- no persistence or API route;
- no package/document version change.
