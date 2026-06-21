# Template Builder Mutation Bridge Boundary

Status: Phase 29 implementation boundary.

Phase 29 introduces one safe mutation path in the sandbox. It is intentionally
small: replace the complete contents of a selected plain text-block through a
Node bridge that calls the public vNext core transaction API.

## Purpose

The goal is to prove the mutation route before building fluid typing:

```text
browser selected node
  -> POST /api/actions/replace-text
  -> sandbox in-memory bridge
  -> runVNextTextTransaction(...)
  -> refreshed snapshot
  -> browser rerender
```

The browser never mutates canonical document JSON directly.

## Supported Action

`sandbox.replacePlainTextBlock`

- target: selected node must be a `text-block`;
- allowed content: plain text only;
- rejected content: field refs, page numbers, line breaks, and non-text nodes;
- core command: `text.range.replace`;
- persistence: in-memory sandbox package only;
- response: complete refreshed snapshot plus mutation result.

Phase 32 also adds `sandbox.insertPlainTextAtEnd` as the first granular text
insert action. It uses `text.insert` at the selected text-block projection end
offset and returns the same mutation packet shape.

## Runtime Rules

- The bridge owns an in-memory working package initialized from the canonical
  product fixture.
- The bridge imports core through `@flowdoc/vnext-core`.
- The bridge updates document revision and mutation count only after a core
  transaction succeeds.
- Rejected mutations return issues and a refreshed snapshot without changing
  the working package.
- Browser selection remains browser-only and is not written into package data.
- The static snapshot remains available as a fallback for non-API inspection.
- Phase 30 adds `?response=packet` for the same action when a caller wants a
  bounded change packet instead of a complete snapshot response.

## Phase 30 Handoff

The bridge now supports two response shapes:

- snapshot response for the current browser renderer;
- packet-only response for future normalized runtime cache work.

Packet mode must not include the complete snapshot `sections` tree. It should
carry changed node ids, changed node summaries, dirty scopes, revision numbers,
diagnostics, and issues.

## Phase 31 Handoff

The browser mutation UI now requests packet mode and applies the returned
packet to a derived runtime cache. The full snapshot response remains available
for boot, fallback refresh, and non-cache consumers.

## Phase 32 Handoff

The bridge now has both a whole-block replace action and an append-text action.
The append path is explicit and button-driven; it does not infer browser DOM
selection, caret position, or IME composition ranges.

## Phase 33 Handoff

The bridge now appends vNext authoring intent history records for accepted
text transactions and returns a bounded `authoringHistory` summary in snapshots
and change packets. This makes future undo/redo and AI-safe edit audit paths
visible without executing inverse replay yet.

## Phase 34 Handoff

The bridge now owns bounded in-memory undo and redo stacks for accepted sandbox
text mutations. Undo and redo replay text patches through
`runVNextTextTransaction(...)` and return the same packet shape as other bridge
mutations. The stacks store before/after text for a target text block, not full
package snapshots.

## Phase 35 Handoff

The bridge now forwards committed text transaction dirty scopes to
`resolveVNextLiveLayoutBoundary(...)`. Snapshots and change packets carry a
bounded `liveLayout` summary with request count, affected scope, and exact
stale status. Rejected actions keep the previous summary and do not create a
new layout request.

## Non-Goals

Phase 29 and Phase 30 do not implement:

- per-keystroke typing;
- DOM caret mapping;
- IME composition;
- browser-derived text ranges;
- partial range selection from the browser;
- persistent browser normalized cache;
- durable/full undo/redo replay beyond sandbox text patches;
- durable authoring history persistence;
- live layout rendering beyond bounded request summaries;
- save/publish persistence;
- backend API routes outside the sandbox dev server;
- exact layout, preview, PDF, or DOCX rendering.
