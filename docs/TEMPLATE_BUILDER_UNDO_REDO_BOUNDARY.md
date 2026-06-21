# Template Builder Undo Redo Boundary

Status: Phase 34 implementation boundary.

Phase 34 wires undo and redo execution for sandbox text mutations without
starting DOM caret, IME, durable persistence, or full snapshot history.

## Purpose

The sandbox now proves this flow:

```text
explicit text action
  -> vNext text transaction
  -> authoring history summary
  -> bounded inverse text patch
  -> undo/redo route
  -> vNext text transaction restore
  -> change packet
  -> browser runtime cache
```

Undo and redo replay only text patches created by the sandbox bridge. They do
not replay arbitrary document history, structural edits, or persisted sessions.

## Patch Ownership

The mutation bridge owns two in-memory stacks:

- undo stack;
- redo stack.

Each stack entry stores only:

- authoring group id;
- source action;
- target text-block id;
- before text;
- after text.

The stack does not store full package snapshots, rendered layout, browser DOM
state, or generated artifacts.

## Runtime Rules

- Accepted replace and append actions push one undo patch and clear redo.
- Undo restores the patch `beforeText` through `text.range.replace`.
- Redo restores the patch `afterText` through `text.range.replace`.
- Undo and redo produce normal change packets with changed node summaries,
  dirty scopes, revision metadata, mutation metadata, diagnostics, and
  authoring-history stack status.
- Empty undo/redo stacks reject with packet issues and do not change revision.
- Undo/redo targets must still be plain text-blocks.
- Browser controls apply undo/redo packets through the existing runtime cache
  path.

Phase 35 reuses the same accepted undo/redo dirty scopes to produce bounded
`liveLayout` request summaries. Undo/redo still do not render live pages or run
exact layout.

## Non-Goals

Phase 34 does not implement:

- durable history persistence;
- full package snapshot history;
- arbitrary structural undo/redo;
- cross-session replay;
- keyboard shortcuts;
- caret or focus restoration;
- per-keystroke typing;
- IME composition;
- live layout rendering beyond bounded request summaries;
- save/publish persistence;
- backend API routes outside the sandbox dev server;
- exact layout, preview, PDF, or DOCX rendering.
