# Modular Responsibility Contract

Status: Phase 44 design boundary.

FlowDoc vNext must not drift back into a single file or single runtime object
that owns every concern. The old direction became hard to change because too
many responsibilities lived together. Phase 44 records the opposite rule:
split implementation by real behavior ownership before a file becomes the only
place that understands the system.

## Purpose

The goal is not to create many tiny files for appearance. The goal is to keep
the system navigable, testable, and replaceable as the editor grows.

Every new behavior should have a clear owner:

- schema and persisted document shape;
- relationship graph and derived indexes;
- operation and transaction planning;
- browser runtime cache and normalized editor view;
- draft/edit buffer state;
- selection, caret, and IME composition state;
- command readiness and command execution;
- mutation transport and packet application;
- layout/live-layout requests;
- renderer consumption and visual projection;
- diagnostics, history, and recovery policy.

If one file starts owning several of those concerns at once, the phase should
split or stop before adding more behavior.

## File Split Rule

Split by responsibility, not by arbitrary size.

A file may coordinate a workflow, but it should not also own all details of:

- state shape;
- derived indexes;
- event binding;
- command policy;
- transport;
- mutation application;
- rendering;
- diagnostics.

The preferred shape is:

```text
feature/
  state.ts        -> local state and invariants
  selectors.ts    -> lookup and derived read models
  commands.ts     -> user/system intent policies
  apply.ts        -> packet or mutation application
  render.ts       -> view projection only
  events.ts       -> DOM/browser event binding only
  tests.ts        -> focused behavior coverage
```

Names may differ, but ownership should remain that clear.

## Split Triggers

Before adding behavior to an existing file, ask whether the file already owns:

- browser state and DOM event binding;
- rendering and mutation transport;
- core contract shaping and UI interaction;
- draft text editing and history/live-layout summaries;
- selection/caret/IME and command execution;
- normalized indexes and heavy detail derivation.

If yes, create or extend a responsibility-specific module instead of expanding
the coordinator.

Split before:

- adding rich text behavior to plain draft code;
- adding key/field chips to text command code;
- adding IME-specific behavior to generic selection code;
- adding viewport virtualization to a boot snapshot renderer;
- adding live-layout rendering to mutation packet application;
- adding persistence or API storage to sandbox-only bridge code.

## Allowed Coordinators

Some files can remain coordinators:

- public entrypoints;
- route handlers;
- shell boot files;
- thin workflow orchestrators;
- compatibility-free bridge boundaries.

Coordinator files should delegate quickly to responsible modules. They should
not become the only place where business rules live.

## Current Exception

The sandbox browser file currently carries multiple concerns because early
phases optimized for proving the visible boundary. That is acceptable as
temporary sandbox scaffolding.

It is not acceptable for the production editor runtime to keep growing that
shape. Before adding rich text, key chips, durable DOM mapping, viewport
virtualization, or a concrete live renderer, the relevant behavior should move
behind responsibility-specific modules.

## Review Questions

Every future implementation phase should answer:

1. Which file owns the new behavior?
2. Which existing file is only coordinating it?
3. Is any file gaining a second unrelated responsibility?
4. Can the behavior be tested without rendering the whole shell?
5. Can the behavior be replaced without rewriting transport, rendering, and
   core contracts together?
6. Does this keep normalized editor view, draft state, transport, renderer,
   and core truth separate?

If the answer is unclear, the phase is not ready.

## Evidence

Existing vNext slices already show the intended direction:

- operation kernel modules split commands, results, invalidation, history, and
  registry concerns;
- layout pipeline modules split measured contracts, fragment building, and
  staged pipeline work;
- browser cache and mutation bridge docs separate canonical truth from derived
  browser view state;
- Phase 43 normalized editor view forbids recursive snapshot trees as the
  active large-document runtime shape.

Phase 44 extends that discipline to file and module ownership.

## Non-Goals

Phase 44 does not refactor the sandbox browser runtime, introduce new
directories, create a production editor package, change public APIs, add routes,
or change package/document versions.
