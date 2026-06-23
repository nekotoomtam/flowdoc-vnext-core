# Template Builder Draft Runtime Module Boundary

Status: Phase 78 implementation boundary.

Phase 78 extracts the browser-local WYSIWYG draft state, caret/selection
normalization, command context, text-command policy, and IME composition guards
out of the sandbox app shell into a browser-safe draft runtime module.

This is a foundation boundary, not a production editor claim. The textarea
draft surface remains intentionally narrow and still commits through the
existing sandbox mutation bridge packet route.

## Purpose

The sandbox draft flow now has a DOM-free owner for draft runtime decisions:

```text
browser-local draft state
  -> normalized caret/selection model
  -> command context and readiness
  -> browser-local text command policy
  -> IME composition guard
  -> existing bridge commit
```

`app.js` still coordinates DOM rendering, event binding, focus restoration,
fetch calls, and packet application. It no longer owns the draft policy details
that future rich text, field chip, or caret mapping phases need to replace or
extend.

## Module Ownership

`examples/template-builder-sandbox/public/draftRuntime.js` owns:

- draft runtime source/mode constants;
- idle and active draft state creation;
- draft active/dirty/commit/status helpers;
- guarded text-block draft eligibility messages;
- browser-local caret/selection normalization;
- range-control and selection-input state transitions;
- textarea selection and input state updates;
- composition start/update/end state transitions;
- command context, readiness, and command summary derivation;
- browser-local insert and replace-selection text command application.

The module is browser-safe and Node-testable. It does not read DOM nodes,
dispatch browser events, call `fetch`, mutate canonical package state, apply
packets, append history, request live layout, or render UI.

## Caret Selection Model

Phase 78 keeps the caret model deliberately local:

- `normalizeDraftSelection(...)` returns a bounded range over the active draft
  text only;
- collapsed selections are caret positions;
- non-collapsed selections are local draft ranges;
- selection carries source and direction metadata for UI/debug visibility;
- selection is never serialized into generated snapshots, packages, bridge
  working packages, history records, or live-layout requests.

This is not rich DOM range mapping. It is the stable local shape that future
contenteditable, styled text, and atomic field-chip work can replace or map
from without rewriting the app shell.

## App Shell Boundary

`examples/template-builder-sandbox/public/app.js` remains the coordinator for:

- reading textarea DOM selection values;
- writing textarea DOM selection values;
- focus restoration;
- rendering canvas and inspector labels;
- bridge commit requests;
- packet application;
- viewport and structural runtime coordination.

The app shell delegates draft state and command policy to the draft runtime
module before touching DOM or transport.

## Acceptance Evidence

Phase 78 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- the sandbox boundary includes `public/draftRuntime.js`;
- the draft runtime module exposes source/mode constants and pure helpers;
- active draft state derives a normalized caret selection;
- range controls and selection inputs are blocked while composition is active;
- insert and replace-selection commands update only browser-local draft state;
- command readiness keeps field insertion and style patching planned;
- `app.js` imports and delegates draft runtime behavior instead of owning the
  full policy directly;
- action lanes expose the draft runtime/caret boundary.

## Non-Goals

Phase 78 does not implement:

- contenteditable DOM mapping;
- rich inline range mapping;
- `inline.style.patch`;
- field/key chips;
- per-keystroke core transactions;
- live layout rendering during active typing;
- exact layout or export readiness from drafts;
- durable selection persistence;
- product editor integration;
- backend API routes, storage, collaboration, or package/document schema
  changes.
