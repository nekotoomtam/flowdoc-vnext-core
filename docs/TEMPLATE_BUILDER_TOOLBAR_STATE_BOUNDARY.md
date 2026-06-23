# Template Builder Toolbar State Boundary

Status: Phase 82 implementation boundary.

Phase 82 adds a bounded browser-local toolbar state summary for active WYSIWYG
drafts. It lets the sandbox say which future style controls would be enabled
for the current selected range while preserving the current rule that toolbar
commands are not dispatched and rich inline marks are not detected from authored
inline runs yet.

This is a toolbar state boundary. It does not dispatch toolbar commands.

## Purpose

The active draft flow now has a toolbar-state layer:

```text
draft selection range
  -> toolbar state summary
  -> canvas / inspector / status visibility
  -> later toolbar command dispatch phase
```

The summary exists so future toolbar buttons, active mark detection,
style-aware history, and rich inline command dispatch have a bounded state
contract to attach to. It does not make the textarea draft a rich text editor.

## Module Ownership

`examples/template-builder-sandbox/public/draftToolbarState.js` owns:

- `DRAFT_TOOLBAR_STATE_SOURCE`;
- `DRAFT_TOOLBAR_STATE_MODE`;
- `createDraftToolbarState(...)`;
- `draftToolbarStateLabel(...)`;
- style control state for `bold`, `italic`, `underline`, and
  `strikethrough`;
- selected range start/end/length facts;
- idle, guarded, composing, and ready status derivation;
- explicit `activeState = "unknown-until-rich-inline-mapping"` for style
  controls;
- explicit `commandDispatch.status = "not-wired"`;
- explicit `coreTransaction.status = "not-run"`;
- explicit `history.status = "not-recorded"`;
- explicit `exactGeneration.status = "deferred-until-commit"`.

The module is browser-safe and Node-testable. It does not read DOM nodes, call
`fetch`, run core text transactions, apply packets, append history, request
live layout, run exact layout, or serialize package data.

## App Shell Boundary

`examples/template-builder-sandbox/public/app.js` consumes the summary in:

- the canvas draft footer;
- the inspector draft panel;
- the status bar.

The app shell still owns DOM event binding, focus restoration, render updates,
bridge fetches, packet application, viewport coordination, and structural
coordination. Phase 82 intentionally does not add visible toolbar command
buttons.

## Truth Boundary

Toolbar state is browser-local planning state:

- active draft text remains local;
- canonical package state is unchanged;
- authored inline marks are not read or patched;
- toolbar controls are not dispatched;
- authoring history is unchanged;
- live layout and exact output are not run by toolbar state;
- export readiness remains outside the active draft path.

## Acceptance Evidence

Phase 82 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- the toolbar state module exposes source/mode constants and pure helpers;
- collapsed selections keep style controls guarded;
- active composition blocks style controls;
- non-collapsed ranges enable the four future style controls;
- active mark state remains unknown until rich inline mapping exists;
- dispatch/core/history/exact statuses remain not-wired, not-run,
  not-recorded, and deferred;
- `app.js` imports the module and renders `data-draft-toolbar-state`;
- action lanes expose the toolbar state boundary.

## Non-Goals

Phase 82 does not dispatch toolbar commands, add visible toolbar buttons,
detect active inline marks from authored runs, apply inline style, implement
rich inline range mapping, add field/key chips, create style-aware history
records, request live layout, run exact layout, alter renderer output, add
backend API routes, add storage/collaboration behavior, or change
package/document schema.
