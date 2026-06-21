# Template Builder Delta Boundary

Status: Phase 30 implementation boundary.

Phase 30 adds a bounded change-packet response next to the existing sandbox
snapshot response. It does not replace the browser runtime yet. The purpose is
to prove that future typing can move changed-node facts without sending the
whole document snapshot after every action.

## Purpose

The mutation route now has two response modes:

```text
POST /api/actions/replace-text
  -> full refreshed snapshot response

POST /api/actions/replace-text?response=packet
  -> bounded change packet response
```

The default response stays snapshot-shaped so the Phase 29 browser UI remains
stable. Packet mode is the Phase 30 contract for the next runtime cache work.

## Packet Contract

`flowdoc-template-builder-change-packet` includes:

- packet version;
- action and mutation status;
- base and next document revisions;
- mutation count and mutation summary;
- changed node ids;
- changed node summaries only for changed nodes;
- affected parent node ids;
- dirty scopes from the core text transaction;
- diagnostics status copied from the refreshed working state;
- issues for rejected actions.

The packet intentionally does not include the complete `sections` snapshot
tree. Consumers that ask for packet mode must either have an existing runtime
cache or explicitly request a fresh snapshot.

## Transitional Rule

Phase 30 may still derive the packet from a refreshed snapshot inside the
sandbox bridge. That is acceptable for this phase because the contract being
proved is response shape and ownership, not final server-side compute cost.

The next runtime-cache phase should stop treating a full snapshot as the only
browser state source after every accepted action.

## Non-Goals

Phase 30 does not implement:

- a persistent browser normalized cache;
- per-keystroke typing;
- DOM caret mapping;
- IME composition;
- undo/redo execution;
- live layout rendering;
- save/publish persistence;
- backend API routes outside the sandbox dev server;
- exact layout, preview, PDF, or DOCX rendering.
