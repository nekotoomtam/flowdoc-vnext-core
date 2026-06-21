# Text Editing Transaction Plan

Status: Phase 21 baseline implemented for pure text transactions.

The current vNext operation `text-block.text.replace` is useful for bulk
replacement, import, automation, and bridge pilots. It is too coarse to be the
primary path for active browser typing in large documents.

This plan defines the transaction direction for smooth template text editing.

## Goal

Support granular, intent-grouped text edits:

- insert text;
- delete text;
- replace range;
- split block;
- merge block;
- insert field reference;
- patch inline style;
- handle IME composition;
- group a typing session into one undo entry.

## Phase 21 Baseline

The current baseline implements the pure core path only:

- `projectVNextTextBlockInlines(...)` maps text-block inline children to model
  offsets and projection text.
- `normalizeVNextTextRange(...)` normalizes anchor/focus offsets.
- `runVNextTextTransaction(...)` applies `text.insert`, `text.delete`,
  `text.range.replace`, and `inline.field-ref.insert`.
- `field-ref`, `page-number`, and `line-break` are atomic for plain text
  delete/replace; field references can be inserted as inline nodes but cannot
  be edited as ordinary typed text.
- transaction success reports text-block dirty scope and a content history
  intent/merge key, but does not persist history.

Split block, merge block, inline style patching, IME lifecycle commands,
undo/redo storage, DOM selection mapping, and live layout scheduling remain
future phases.

## Phase 22 Baseline

Intent history now records transaction outcomes without binding them to a
frontend reducer:

- `createVNextAuthoringIntentHistoryRecord(...)` converts text transaction
  results into committed or rejected authoring intent records.
- `appendVNextAuthoringIntentHistoryRecord(...)` assigns group ids and merges
  repeated typing records that share the same merge key/source.
- paste and IME-flavored text insert records are single-entry groups.
- `inline.field-ref.insert` creates a single command group.
- `createVNextSelectionOnlyAuthoringHistoryRecord(...)` marks selection-only
  changes as non-durable and keeps them out of durable history.
- rejected text transactions keep diagnostic issues and do not mutate the
  source document.

Concrete undo/redo storage, inverse edits, focus restoration, DOM selection
mapping, and visible editor integration remain future phases.

## Text Position Model

Text positions should be model positions, not page geometry:

```ts
type TextPosition = {
  textBlockId: string;
  offset: number;
};

type TextRange = {
  textBlockId: string;
  anchor: number;
  focus: number;
};
```

Offsets are in the authored inline text stream for a `text-block`. They are not
page indexes, line indexes, DOM offsets, or rendered coordinates.

When inline nodes are present, the core should define a stable projection from
inline children to text positions and caret boundaries. Field references are
atomic unless a future design allows editing inside them.

## Transaction Kinds

Initial transaction candidates:

```ts
type TextTransaction =
  | { kind: "text.insert"; position: TextPosition; text: string }
  | { kind: "text.delete"; range: TextRange }
  | { kind: "text.range.replace"; range: TextRange; text: string }
  | { kind: "inline.field-ref.insert"; position: TextPosition; key: string }
  | { kind: "inline.style.patch"; range: TextRange; patch: unknown }
  | { kind: "block.split"; position: TextPosition }
  | { kind: "block.merge"; beforeTextBlockId: string; afterTextBlockId: string };
```

These are design names. Implementation may refine names, but it must preserve
the granular intent.

## Draft Lifecycle

```text
edit start
  -> local draft owns immediate visible text
  -> transactions accumulate/coalesce
  -> dirty text-block scope is marked
  -> live layout updates visible region
edit commit
  -> flush final draft to document operation(s)
  -> produce one history group
  -> schedule exact layout/checkpoint
edit cancel
  -> discard draft
  -> restore previous visible text/layout state
```

The local draft is allowed to be ahead of parent/session document state during
a typing burst. Stale parent state must not overwrite a newer active draft.

## IME Composition

Composition events are not durable document operations until commit:

```text
composition.start
composition.update*
composition.commit -> text.range.replace or text.insert
composition.cancel
```

During composition:

- local input feedback is immediate;
- exact layout may be delayed;
- history is not created for every update;
- selection remains editor-only session state.

## Inline Field References

Field references are authored inline nodes:

- inserting a field reference is an inline transaction;
- editing the key is not a plain text edit;
- changing a key should be a registry/key operation or future key-history
  migration;
- field value resolution remains binding output, not authored text.

## History Policy

History should group by user intent:

- continuous typing in one active session -> one entry;
- paste -> one entry;
- IME commit -> one entry;
- split block -> one entry;
- merge block -> one entry;
- field insert -> one entry;
- style command -> one entry or current text-session merge depending on UX.

Rejected transactions may be recorded for diagnostics only when useful; they
must not mutate the document.

## Invalidation

Granular text transactions should emit invalidation scopes:

- text-block content;
- affected inline nodes;
- containing parent block/column/table cell;
- downstream layout range when text height changes;
- exact generation layout stale status.

The live layout layer decides how much visible layout to update immediately.
The exact generation runtime decides when full pagination is required.

## Anti-Patterns

- Do not replace a whole `text-block.children` array for every keystroke.
- Do not rebuild all pages on every input.
- Do not store caret or line position in authored nodes.
- Do not let field values become typed text inside the template.
- Do not create one durable undo entry per key repeat.

## Acceptance

This plan is ready for implementation when tests can cover:

- insert/delete/range replace inside plain text;
- insert field reference at a text position;
- split and merge text blocks;
- typing history coalescing;
- IME commit as one edit;
- rejection of invalid field-key text edits;
- layout invalidation scope smaller than the whole document for local edits.
