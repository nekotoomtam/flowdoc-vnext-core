# Template Builder Style-aware History Boundary

Status: Phase 84 implementation boundary.

Phase 84 adds a bounded browser-local style-aware history summary for active
WYSIWYG drafts. It lets the sandbox group future rich inline intents, such as
style patch and field chip insert requests, without appending durable history or
changing authoring history snapshots.

This is a style-aware history boundary. It does not append durable history.

## Purpose

The active draft flow now has a history-planning layer:

```text
style patch / field chip summaries
  -> style-aware history summary
  -> canvas / inspector / status visibility
  -> later durable history execution phase
```

The summary exists so future style-only, field-chip, and mixed rich inline
commands can agree on grouping and merge-key shape before any history store is
changed.

## Module Ownership

`examples/template-builder-sandbox/public/draftStyleHistory.js` owns:

- `DRAFT_STYLE_HISTORY_SOURCE`;
- `DRAFT_STYLE_HISTORY_MODE`;
- `createDraftStyleHistory(...)`;
- `draftStyleHistoryLabel(...)`;
- planned intent collection from ready style patch and field chip summaries;
- intent kind labels for `inline.style.patch` and `inline.fieldRef.insert`;
- style-aware merge key shape for active drafts;
- idle, guarded, composing, and planned status derivation;
- explicit `history.status = "not-recorded"`;
- explicit `durableHistory.status = "not-written"`;
- explicit `coreTransaction.status = "not-run"`;
- explicit `liveLayout.status = "not-requested"`;
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
coordination. Phase 84 intentionally does not update `authoringHistory`.

## Truth Boundary

Style-aware history state is browser-local planning state:

- active draft text remains local;
- canonical package state is unchanged;
- authored inline runs are not patched;
- field refs are not inserted;
- `authoringHistory` snapshots and packets are unchanged;
- undo/redo stacks are unchanged;
- live layout and exact output are not run by history planning;
- export readiness remains outside the active draft path.

## Acceptance Evidence

Phase 84 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- the style-aware history module exposes source/mode constants and pure helpers;
- ready style patch and field chip summaries can become planned history
  intents;
- planned intents keep `historyStatus = "not-recorded"`;
- durable/core/live/exact statuses remain not-written, not-run, not-requested,
  and deferred;
- active composition blocks the style-aware history summary;
- `app.js` imports the module and renders `data-draft-style-history`;
- action lanes expose the style-aware history boundary.

## Non-Goals

Phase 84 does not append durable history, modify `authoringHistory`, implement
undo/redo for style changes, apply inline style, insert field refs, create
style-aware live layout invalidation, run exact layout, alter renderer output,
add backend API routes, add storage/collaboration behavior, or change
package/document schema.
