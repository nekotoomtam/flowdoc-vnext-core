# Text-block V4 Inline Commands

Status: Phase 277 explicit field and atomic command planner.

## Decision

Field-ref, line-break, page-number, and inline-image insertion plus atomic
removal use explicit model commands. A planner converts one canonical Phase 275
caret and a complete atomic payload into the child list expected by the single
Phase 276 `text-block.rich-inline.replace` commit boundary.

The planner does not mutate a document, create history, or authorize itself.
Its result must still pass artifact pins, Structure Policy, session permission,
grammar, and full-document validation in Phase 276.

## Insertion

Insertion behavior is deterministic:

- empty block: insert as the first child and return a caret after the atomic;
- text boundary: insert before or after the existing text leaf;
- atomic boundary: offset `0` inserts before and `1` inserts after; and
- inside text: retain the original id on the left and require an explicit new
  id for the right text leaf.

The caller supplies both inserted and split-right ids. Duplicate, blank, time,
and random allocation are not accepted. Sparse run style is copied to both
text halves during a split.

## Field Placement

`field-ref.insert` accepts only scalar inline-compatible keys in the supplied
artifact-owned Field Contract. It creates a placement containing key and local
label/fallback facts; it does not copy a field definition or value into the
text-block.

The resulting rich replacement requires `field.place` only for the new
placement. Image fields continue to use `inline-image` with
`image-field-ref`, while collection fields remain outside text-block v1.

## Atomic Removal

`atomic.remove` targets one non-text inline id. It rejects text leaves. The
caret moves to the previous inline end when possible, otherwise the next inline
start, or the canonical null-inline empty caret when the final atomic is
removed.

## Validation

Current and planned child lists both pass the Phase 275 grammar. This enforces
field compatibility, page-number zone restrictions, five-inline shape, and
unique destination ids before a commit request is produced.

## Non-Goals

- no direct document/package mutation or history record;
- no policy/session bypass;
- no granular text insert/delete or style patch;
- no cross-block move/copy or collaboration allocation;
- no DOM event, clipboard, IME, backend route, pagination, or renderer work.
