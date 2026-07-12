# Table V4 Semantic Architecture Lock

Status: Phase 294 architecture lock.

## Outcome

Table v4 is one semantic table definition whose ordered row sources resolve to
an ordered row stream before measurement and pagination. A row is the
synchronization boundary for its cells: cells flow independently inside the
row, but the row fragment height is the maximum used cell height and every cell
cursor commits atomically at one physical page boundary.

This lock authorizes standalone Table Definition, grid occupancy, row policy,
collection snapshot, and Resolved Row contracts. It does not change the
canonical document v4 parser, activate collection values in the existing
Resolved Document v1 projection, paginate rows, render tables, or expose
backend/editor table workflows.

## Semantic And Authoring Lanes

The semantic lane is implemented first:

```text
authored v4 table graph
  + published Table Definition
  + pinned collection snapshot when required
  -> ordered Resolved Row stream
  -> prepared cell fragment sources
  -> row synchronization and pagination
  -> renderer-consumption facts
```

The authoring lane later owns row-source editing, column ratios, cell merge
controls, validation feedback, and history operations. Authoring UI state must
not become semantic truth.

## Current Evidence Classification

- `src/schema/documentV4Target.ts` and `src/schema/documentV4Structure.ts`
  provide reusable authored table/row/cell identity, containment, widths,
  header count, and rectangular-grid evidence.
- Current v4 `row.cellIds.length === table.columns.length` is a span-one
  invariant, not the final occupancy rule.
- `src/pagination/deepTableSplit.ts` and the active measured table paginator
  consume document v3 and are evidence only. They are not copied as canonical
  v4 table behavior.
- `src/resolution/resolvedDocument.ts` intentionally blocks collection data.
  Table resolution adds a separate pinned collection contract before that
  projection is widened deliberately.

## Table Definition

A versioned Table Definition is semantic metadata owned by one exact Structure
draft or Published Structure Version and bound to one authored `tableId`. It
contains:

- stable semantic columns with unique `columnId` and positive `widthShare`;
- ordered row sources;
- header repeat policy;
- empty-dataset policy; and
- row templates with explicit cell occupancy and row break policy.

Column shares total 100 and resolve against available table width. A table
inside Columns receives the parent track width. Physical point widths are
layout output, not retained semantic truth.

The first standalone contract does not rewrite the positional column array in
the canonical v4 graph. A later adapter must prove exact count/order mapping
before parser integration.

## Ordered Row Sources

Table Definition row sources may be mixed in one explicit order:

- `static-row` references one authored row and assigns `header`, `body`,
  `footer`, or `empty-state` role; or
- `collection-rows` references one collection field, one row template, and a
  stable item-key contract. It expands to zero or more body rows.

Filtering, sorting, and grouping execute in resolution before pagination. The
paginator consumes the resulting order and never queries external data.

Collection expansion requires a pinned snapshot containing ordered items with
unique, nonblank `itemKey` values. Array index is never row identity. The
collection field definition remains external published truth; a row source
cannot redefine its field type or capability locally.

## Empty Dataset Policy

Each collection source selects exactly one policy:

- `header-only`: emit no collection body rows and retain applicable static
  header/footer rows;
- `empty-row`: emit one referenced authored empty-state row; or
- `hide-table`: suppress the complete table result.

`empty-row` requires an `emptyStateRowId`; the other policies reject one.
Suppression is a resolved semantic result, not deletion of the authored table.

## Row Roles And Header Repetition

Row role is semantic and explicit. Header repetition uses resolved leading
header rows only. Repeated headers are generated layout fragments retaining
the source row identity; they do not allocate authored row ids, enter history,
or change resolved row order.

If repeated headers leave no legal body progress on a fresh page, pagination
blocks with a header-progress diagnostic instead of producing header-only
pages forever. Footer repetition is not part of v1.

## Cell Occupancy And Merge Policy

Every row template maps cells onto a zero-based logical column grid:

```text
cellId + columnStart + colSpan + rowSpan
```

- `columnStart` is nonnegative and `colSpan` is positive.
- Occupied ranges must be non-overlapping, gap-free, and end at the table
  column count.
- One cell id may occur once per row template.
- `rowSpan` is present in the vocabulary with v1 value exactly `1`.
- A future `rowSpan > 1` creates a multi-row span-group synchronization
  boundary; v1 blocks it explicitly rather than pretending rows are independent.

This replaces cell-count equality once integrated. It does not reuse Columns
track semantics: Table cells and Columns remain separate node families and
pagination contracts even though both reconcile parallel inner flows.

## Row Break Policy

V1 uses an explicit enum:

- `allow`: split at any legal prepared cell checkpoint;
- `prefer-keep`: move the whole row when it fits a fresh page, then split when
  it is taller than a fresh page; and
- `strict-keep`: never split; an oversized fresh-page row blocks.

Compatibility mapping for current authored evidence is `allowBreak: true` to
`allow`, `allowBreak: false` to `strict-keep`, and absent to `prefer-keep`.
This mapping remains adapter behavior and does not mutate the current parser.

Authored minimum row height applies to the row's first fragment only. It is
not repeated as artificial blank height on continuation fragments.

## Resolved Row Identity And Provenance

Static rows retain authored row and cell identity through explicit authored
references. Collection rows use Identity Standard v1 `rowi_` and `celli_`
allocated identities under the exact document-resolution scope.

Collection row provenance includes table id, row-source id, row-template id,
collection field key, stable item key, Structure version pin, instance
revision, and collection snapshot revision. These facts remain outside the
opaque id and must pass the all-or-blocked identity batch audit.

Materialization clones the row-template content into a derived resolved graph
with source-to-resolved provenance. It does not mutate the authored graph or
serialize generated rows as Structure Definition nodes.

## Row Synchronization And Pagination

Prepared cell sources expose measurement-free legal checkpoints. For one row
fragment the paginator:

```text
snapshot every active cell cursor
  -> plan each active cell once
  -> reconcile one shared page boundary
  -> use maximum consumed cell height
  -> commit every cell cursor together or commit none
```

Cells that complete early remain empty in later fragments of the same row.
Following rows begin only after the current row completes. A row fragment
cannot overlap another row or borrow unused sibling-cell space.

Measurement never executes inside the pagination loop. Text-block line
fragments are the first candidate source; other cell child families require
their own prepared fragment contracts. Every iteration must consume content,
complete a row, or advance a page; otherwise it blocks as no progress.

## Performance Boundary

- Resolve row order and item identity once per pinned input.
- Validate occupancy once per definition/template revision.
- Plan each active cell at most once per row/page attempt.
- Use prepared prefix heights and checkpoint lookup; do not rescan all text
  from the beginning after a page break.
- Retain deterministic work facts and fingerprints so incremental consumers can
  invalidate one table, row source, row, or cell without relaying out unrelated
  authored nodes.

Representative 200-300 page table scale remains a later acceptance gate after
row pagination exists. Wall-clock timing alone is not complexity evidence.

## PASS Criteria

- strict Table Definition ownership and source ordering;
- stable semantic columns and normalized width shares;
- static and collection row sources with explicit empty policy;
- unique item keys and Identity Standard provenance;
- gap-free non-overlapping `colSpan` occupancy;
- explicit v1 `rowSpan > 1` rejection;
- row roles, repeat-header progress guard, and break-policy mapping;
- source-immutable Resolved Row output; and
- measurement-free synchronized cell planning contract.

## RISK

- Positional authored v4 columns need a deliberate adapter to stable semantic
  column ids before canonical integration.
- Collection snapshots and scalar Data Snapshot v2 currently have different
  capability surfaces and must not be merged implicitly.
- `colSpan` changes cell widths and therefore invalidates descendant text
  measurement, pagination, and rendering.
- Deep cell content can remain blocked until every child family publishes a
  legal split/atomic policy.
- `rowSpan` later changes the synchronization boundary from one row to a row
  group and will require a new contract version or capability gate.

## UNKNOWN

- Final published collection field schema and external API payload envelope.
- Product-selected item-key size and character limits.
- Group header/footer and subtotal semantics.
- Renderer border-collapse and repeated-header border ownership.
- Incremental invalidation thresholds for very large collection changes.

## Intentionally Not Changed

- canonical package 3/document 4 schemas and structure validation;
- existing table operations or history behavior;
- Resolved Document v1 collection rejection;
- active document v3 deep split and measured pagination;
- Columns contracts and direct-body-only page breaks;
- backend transport/storage and editor UI/runtime; and
- concrete measurement, row pagination, renderer, export, or scheduler.

## Next Direction

Implement standalone Table Definition, row-source, occupancy, empty-policy,
and break-policy schemas with source-immutable validation. Then add pinned
collection snapshot and Resolved Row materialization contracts on Identity
Standard v1.
