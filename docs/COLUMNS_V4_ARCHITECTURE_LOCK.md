# Columns V4 Architecture Lock

Status: Phase 282 architecture lock.

## Outcome

Document v4 Columns is one canonical layout container containing ordered,
independent column flows. A Columns fragment completes only when every column
cursor completes; its used height is the maximum used height among its column
fragments. Content from one column never fills unused space in a sibling.

This lock authorizes v4-native geometry, cursor, checkpoint, reconciliation,
nesting, impact, and bounded-scale contracts. It does not activate mixed
document pagination, concrete measurement, renderer/export, backend execution,
or editor controls.

## Semantic Contract

- `columns.columnIds` is canonical track order.
- Each referenced `column.childIds` is canonical column-major reading order.
- Track width uses the existing positive `widthShare` values whose total is
  exactly 100; `columns.props.gap` is interpreted as points for v1.
- Every column receives the same physical page-height constraint and its own
  width constraint.
- Column cursors advance independently and monotonically.
- A completed column remains empty on later continuation pages.
- A Columns page fragment uses the greatest used height among its columns.
- A following block starts only after the final Columns fragment.
- Layout fragments retain canonical columns, column, child, and source-range
  identity; layout allocates no authored identity.
- Empty columns are valid and use zero content height. An all-empty Columns
  uses authored minimum height when present, otherwise zero.

## Nesting Contract

Columns may be a child of a column and therefore recurse. The canonical graph
remains acyclic and v1 accepts at most three Columns containers on one ancestor
path. Depth counts `columns` containers only. A fourth level blocks with a
specific structure diagnostic.

Every nested planner receives the width assigned by its parent track. A
versioned planner capability supplies minimum usable track width; the authored
schema does not hardcode device- or renderer-specific width policy.

## Page Boundary Contract

Overflow and explicit page breaks are separate facts. Overflow in any column
causes the Columns container to continue; sibling columns continue only when
their own cursors have remaining content.

Document v4 continues to restrict `page-break` to a direct child of a body
zone. V1 does not place explicit page-break nodes inside columns or table
cells. Planning contracts may retain a future container-wide hard-break event
slot, but this phase does not widen canonical containment.

## Planning And Performance Contract

Columns pagination follows snapshot, plan, reconcile, and atomic commit:

```text
snapshot active cursors
  -> plan each active lane once
  -> collect legal checkpoints and continuation facts
  -> reconcile one shared physical page boundary
  -> commit every cursor together or commit none
```

- Measurement never executes inside the pagination loop.
- Child planners expose legal break checkpoints; reconciliation selects from
  them instead of remeasuring or relaying out content.
- Prefix heights and binary search are the intended bounded checkpoint path.
- Every successful iteration consumes a child fragment/node or advances a
  page; no progress blocks with a diagnostic.
- Input fingerprints, monotonic cursor trees, and deterministic work facts are
  retained now. Scheduler, worker, priority, cancellation, and telemetry
  execution remain consumer work.
- Core reports changed scope and invalidation facts, not canonical
  `light`/`medium`/`heavy` labels.

## Child Readiness

Accepted v4 text lines are the first supported child-fragment evidence. Other
child node types remain blocked until they expose family-owned measured
fragment/split contracts. Parsing a table, image, TOC, divider, or spacer
inside a column does not by itself claim Columns pagination readiness.

The active document v3 measured paginator is evidence only. V4 implementation
must use document v4/resolved identities and Phase 278-279 source ranges; it
must not copy the active paginator as canonical v4 behavior.

## PASS Criteria

- deterministic source-immutable geometry and nesting validation;
- monotonic single-column cursors and legal checkpoints;
- atomic parallel-lane reconciliation and longest-column completion;
- empty, unequal, continuing, and nested column evidence;
- depth-three acceptance and depth-four rejection;
- no-progress, minimum-width, and unsupported-child diagnostics;
- no repeated measurement during planning; and
- bounded operation-count plus representative multi-page scale evidence.

## RISK

- Narrow nested tracks can be structurally valid but unusable under a selected
  measurement capability.
- Longest-column completion can intentionally leave large blank sibling areas.
- Keep policy can deadlock unless oversized content has a split-or-block
  fallback.
- Nested containers amplify invalidation and continuation-state size.
- Text-only scale does not bound tables, media, generated content, or renderer
  memory.

## UNKNOWN

- Product-selected minimum usable track width by renderer/profile.
- Family-owned image, utility, TOC, and table fragment contracts.
- Mixed-flow page signatures and incremental convergence thresholds.
- Visible editor controls for ratios, gaps, insertion, and nesting feedback.

## Intentionally Not Changed

- document v4 authored shapes and the existing 100-share width rule;
- direct-body-only page-break containment;
- text measurement or line pagination output;
- active document v3 pagination;
- backend/editor mutation and interaction surfaces;
- concrete scheduler, renderer, export, or artifact execution.

## Next Direction

Add v4 track geometry, depth validation, cursor/checkpoint types, and Columns
impact facts before adapting accepted text lines into reusable child fragment
candidates.
