# Template Builder History Boundary

Status: Phase 33 implementation boundary.

Phase 33 wires the sandbox mutation bridge to the vNext authoring intent
history helpers. It does not implement undo or redo execution yet. The purpose
is to prove that visible bridge mutations create the same history/audit rail
that future typing, AI-safe edits, and undo controls must use.

## Purpose

The sandbox authoring flow is now:

```text
browser explicit action
  -> sandbox mutation bridge
  -> runVNextTextTransaction(...)
  -> appendVNextAuthoringIntentHistoryResult(...)
  -> snapshot and change packet authoringHistory summary
  -> browser inspector/status history readout
```

History state is owned by the in-memory bridge runtime. The static generated
snapshot only carries an empty summary so the browser contract is stable before
the API bridge is available.

Phase 34 extends this summary with undo/redo availability and stack depth for
the sandbox's in-memory text patches. The full authoring records and replay
stacks are still not sent to the browser.

## Runtime Rules

- Accepted bridge transactions append a vNext authoring intent history record.
- Core transaction rejections may append diagnostic-only history records when a
  transaction reaches core and fails there.
- Pre-core bridge validation failures remain packet issues only in this phase.
- Explicit inspector commands use `inputKind: "command"` so append-text button
  clicks do not pretend to be continuous keyboard typing sessions.
- Change packets include only an `authoringHistory` summary, not full package
  copies or replay payloads.
- Browser cache application updates history from the packet beside diagnostics,
  mutation bridge metadata, dirty scopes, and changed node summaries.

## Snapshot Summary

`authoringHistory` includes:

- mode;
- record count;
- undoable record count;
- rejected record count;
- group count;
- undo/redo availability;
- undo/redo stack depth;
- next undo/redo group ids;
- latest group summary.

This is intentionally a small status surface. The durable history record shape
remains owned by `@flowdoc/vnext-core`.

## Non-Goals

Phase 33 does not implement:

- durable/full undo/redo beyond sandbox text patches;
- focus or caret restoration;
- keyboard shortcut handling;
- durable history persistence;
- IME or per-keystroke typing;
- live layout rendering;
- save/publish persistence;
- backend API routes outside the sandbox dev server;
- exact layout, preview, PDF, or DOCX rendering.
