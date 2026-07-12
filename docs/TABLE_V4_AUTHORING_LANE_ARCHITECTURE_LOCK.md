# Table V4 Authoring Lane Architecture Lock

Status: Phase 328 architecture lock.

## Outcome

Table v4 authoring edits one Structure Definition Draft through an atomic
bundle of authored document plus draft-owned Table Definition. A command either
returns a fully validated document/definition pair with history, selection,
scope, and invalidation facts, or returns neither changed artifact.

This lock authorizes a conservative span-one authoring profile. It does not
make editor UI state semantic truth, edit Published Structure Versions or
Document Instances, persist revisions, or widen canonical parsing for merged
cells.

## Why The Bundle Is Atomic

The canonical document currently owns positional physical columns, authored
row/cell containment, cell content, and vertical alignment. Table Definition v1
separately owns stable semantic column ids/shares, row sources/templates,
roles, break policy, occupancy, and header policy.

Updating only one side creates drift. Therefore authoring input and output are:

```text
exact Structure Definition Draft identity
  + canonical document v4
  + draft-owned Table Definition v1
  + exact draft policy and session permissions
  + one Table authoring command
  -> committed document + definition + operation facts
     OR blocked with source artifacts unchanged
```

Published versions and materialized instances are immutable structural inputs.
Their text/content lanes remain governed by their own operations.

## Authoring-Ready Profile

Before mutation, core audits one exact Table bundle:

- the document and definition parse independently;
- the definition owner equals the exact draft identity;
- the definition `tableId` resolves to one authored Table in one section;
- semantic and physical column counts match;
- every row template source row belongs to the Table;
- every source row cell order equals its template cell order;
- every cell placement has `rowSpan = 1` and `colSpan = 1`;
- each template covers every column exactly once;
- authored Table rows and definition row sources/templates have deterministic
  one-to-one ordering for the v1 command profile; and
- document header count/repeat flags equal leading semantic header sources and
  header policy.

Any merged-cell definition remains valid for semantic/render consumption but
is authoring-blocked until canonical occupancy integration is versioned.

## V1 Commands

### Static Row Insert

`table.row.insert.static` requires caller-provided stable row, row-source,
row-template, and cell ids. It inserts one empty authored row and one static
semantic source/template at the same index. Role and break policy are explicit.
Core allocates no durable identities.

### Static Row Delete

`table.row.delete.static` targets a static row source. It deletes the authored
row, every cell subtree, row source, and row template atomically. Collection
sources and templates referenced by empty policy are blocked. The last row
cannot be deleted.

The selection recommendation chooses the preceding surviving row when one
exists, otherwise the next surviving row, matching the established deletion
UX direction without mutating editor selection state.

### Row Source Reorder

`table.row.reorder` moves one row source and its authored template row together.
The final definition must retain contiguous leading headers and valid repeat
policy. A same-index move is rejected as a no-op.

### Stable Column Insert

`table.column.insert` requires one new stable column id and one new cell id per
row template. Existing semantic shares scale proportionally into the remaining
share; the new column receives the requested positive share below 100.
Physical widths are recomputed in points from the prior total Table width.

### Stable Column Delete

`table.column.delete` targets a stable semantic column id. In the span-one
profile it deletes exactly one cell subtree from every row template, removes
the physical/semantic column, and proportionally normalizes remaining shares
to 100. The last column cannot be deleted.

### Stable Column Resize

`table.column.resize` changes one semantic share to a positive value below 100
and proportionally redistributes the remainder. Physical widths are recomputed
from the unchanged total point width. No text measurement runs in the command.

### Cell Vertical Alignment

`table.cell.vertical-align.patch` changes one authored Table cell to `top`,
`middle`, or `bottom`. It leaves Table Definition unchanged and invalidates the
cell's row layout/pagination/render facts.

## Capability-Blocked Commands

- collection row-source insert/delete requires field/binding contract edits;
- cell merge/split requires canonical colSpan occupancy integration;
- `rowSpan > 1` requires row-group synchronization v2;
- cross-Table row/cell movement requires ownership/provenance rules; and
- generated materialized rows are never authored nodes.

These capabilities must be reported as blocked, not emulated through raw node
delete/duplicate/reorder.

## Policy And Permission

Table structural commands receive dedicated actions:

- `table.row.insert`, `table.row.delete`, `table.row.reorder`;
- `table.column.insert`, `table.column.delete`, `table.column.resize`; and
- `table.cell.vertical-align.patch`.

Core capability, exact draft policy, and session permission must all allow the
action. Generic block-child actions do not authorize Table internals.

## Commit Facts

Every commit returns:

- source and target stable ids;
- added, removed, retained, and reordered identities;
- exact section/Table/row/cell/text-block scope;
- one durable structural or layout history entry;
- a selection recommendation, never selection state mutation;
- invalidation lane and reasons for definition, measurement, pagination, and
  renderer consumers; and
- before/after document and definition fingerprints.

Row/column structural commits use full validation. Vertical alignment is a
layout commit but still validates the complete bundle.

## Performance Boundary

- index the document graph and Table Definition once per command;
- visit each affected row template/cell subtree once;
- column operations are linear in row templates plus removed subtrees;
- row operations do not scan unrelated sections or Tables;
- retain factual work counts instead of light/medium/heavy labels; and
- prove deterministic behavior over 1,000 span-one row templates.

## PASS Criteria

- strict exact-draft request and authoring-ready bundle audit;
- atomic document/definition commits with source immutability;
- static row insert/delete and row-source reorder;
- stable column insert/delete/resize with normalized shares and point widths;
- cell vertical-alignment patch;
- capability blocks for collection lifecycle, merge/split, and rowSpan;
- policy/session enforcement, selection recommendation, history, scope, and
  invalidation facts;
- deterministic identities/fingerprints and 1,000-row linear work evidence;
- no persistence, network, DOM, editor state, measurement, or pagination.

## RISK

- The v1 one-to-one row profile excludes valid semantic definitions that use
  shared templates or separate empty-state templates.
- Column deletion is destructive to one cell subtree per template and requires
  explicit user confirmation in editor UX even though core command intent is
  already explicit.
- Physical widths are normalized to points, so authored unit spelling may
  change while physical geometry remains stable.
- Policy sets must add dedicated Table actions before commands become usable.
- Future colSpan integration may require a new canonical document version or a
  versioned authored occupancy sidecar.

## UNKNOWN

- Final editor confirmation and preview interaction for destructive grid edits.
- Whether shared row templates should become first-class authoring references.
- Canonical location/versioning of Table Definitions inside a Structure bundle.
- Merge content distribution UX and cross-cell selection behavior.
- Collaboration conflict resolution for simultaneous row/column edits.

## Intentionally Not Changed

- canonical package/document/Table schemas and span-one structure validation;
- Published Structure Versions and Materialized Document Instances;
- Table resolution, materialization, measurement, pagination, and renderer
  decisions;
- existing document v3 operations and generic v4 block operations;
- backend revision/storage execution and editor runtime/UI.

## Next Direction

Implement the authoring-ready bundle audit and capability matrix first. Then
add row, column, and cell command kernels against that accepted boundary.
