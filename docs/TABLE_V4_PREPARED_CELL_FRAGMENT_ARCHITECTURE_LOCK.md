# Table V4 Prepared Cell Fragment Architecture Lock

Status: Phase 307 architecture lock.

## Outcome

Prepared Table cell fragments are immutable, measurement-complete,
pagination-free sources for one resolved logical row. They adapt exact Table
Definition occupancy, materialized cell content, and accepted child-family
measurement evidence into legal checkpoints and prefix heights. They never
choose a page break or advance a row cursor.

This lock authorizes standalone Table geometry, table-local text measurement
packets, atomic utility/media candidates, prepared cell assembly, fingerprints,
and bounded invalidation facts. It does not activate synchronized row
pagination, repeated headers, renderer/export, backend execution, or editor UI.

## Pipeline Boundary

```text
Published Table Definition + resolved materialized rows
  -> exact table/cell geometry
  -> child-family measurement packets
  -> externally accepted measurement evidence
  -> prepared child fragment sources
  -> prepared cell fragment sources
  -> synchronized row pagination (later)
```

Measurement runs before fragment preparation. Pagination consumes prepared
sources only and must not call a text engine, media decoder, or geometry
resolver inside its row/page loop.

## Exact Geometry

- Layout input supplies a positive finite Table content width in points.
- Semantic `widthShare` remains the source of column ratios.
- A cell outer width is the sum of every occupied column width from
  `columnStart` through `colSpan`.
- Cell content width subtracts explicit left/right inset facts supplied by the
  selected layout profile. Core does not infer renderer border-collapse or
  padding from pixels, DOM boxes, or editor state.
- A non-positive content width blocks before measurement.
- `colSpan` therefore changes the measurement width and invalidates every
  prepared descendant in that cell.
- V1 continues to reject `rowSpan > 1`; no row-group geometry is guessed.

Rounding occurs at one named point boundary and the last semantic column
absorbs deterministic remainder. Repeated percentage multiplication must not
produce occupancy drift between adjacent cells.

## Measurement Evidence

Text evidence is not accepted as a loose measured-line array. One evidence
record retains both:

- the exact v4 text measurement request; and
- its accepted measured-line result.

Preparation verifies document instance/revision, resolved text-block id,
measurement profile, and exact cell content width before adapting lines. This
prevents a result measured for an old value, different `colSpan`, or different
profile from silently entering pagination.

Table-local request preparation reads cloned text nodes and the separate
materialized text/image bindings. It retains authored/resolved inline source
ranges and style keys. Style catalog resolution remains pinned input; prepared
fragments do not invent missing style definitions.

## Child Family Policies

- `text-block`: one splittable candidate per accepted measured line, retaining
  source ranges and prefix heights.
- `image`: one atomic candidate using the resolved block frame. Missing media
  may remain a binding/presentation policy, but unknown geometry blocks.
- `divider`: one atomic candidate whose height is margin-before + thickness +
  margin-after after explicit unit conversion.
- `spacer`: one atomic candidate using authored point height.
- `toc`, generated content, page breaks, nested tables, and nested Columns are
  blocked until their family-owned prepared-fragment contracts exist.

Atomic means indivisible, not automatically keepable. If one atomic candidate
is taller than a fresh page body, synchronized pagination later returns an
oversized-content diagnostic rather than clipping it.

## Cell Source Contract

One prepared cell source retains:

- table, row, cell, source-cell, and template identities;
- `columnStart`, `colSpan`, outer width, insets, and content width;
- ordered child fragment sources in canonical `childIds` order;
- flattened legal candidates with stable child/source identities;
- prefix heights starting at zero and exact total content height;
- a deterministic fingerprint over semantic pins, geometry, bindings,
  measurement evidence, and child fingerprints; and
- factual preparation work counts.

Child boundaries are legal checkpoints. Text-line boundaries are legal within
a text child. Atomic children expose only their end boundary. Empty cells are
valid and expose a zero-height completed source.

## Row Preparation Boundary

Preparation groups cells by resolved row but does not reconcile them. It
retains row role, break policy, first-fragment minimum height, and exact cell
order for the later row planner. The future planner snapshots every cell cursor,
plans each active cell once, selects one shared boundary, and commits all cell
cursors together or none.

No prepared cell may borrow unused sibling width or height. The row fragment
height remains the maximum consumed cell height after reconciliation.

## Identity And Source Retention

- Static/empty rows retain authored row/cell/node identities.
- Collection rows retain allocated row/cell/node/inline identities and their
  materialization provenance.
- Layout fragments allocate no authored or resolved identities.
- Candidate ids are deterministic layout keys derived from retained source
  facts; they are not registry identities and never enter document history.

## Invalidation And Performance

- Item value or binding change invalidates the affected resolved row/cell
  measurement and preparation path.
- Width, inset, style, profile, frame, or source-content change invalidates the
  affected cell and its later pagination path.
- Row order alone does not change item-key-derived content identity, but it does
  invalidate downstream page placement from the earliest changed row.
- Geometry and source indexing run once per preparation request.
- Candidate prefix heights are built once. Later checkpoint lookup must not
  rescan text from the beginning.
- Work facts count visited rows, cells, child nodes, candidates, and accepted
  measurement records. Wall-clock timing alone is not complexity evidence.

## PASS Criteria

- deterministic `colSpan`-aware point geometry without overlap or drift;
- exact measurement request/result evidence matching cell width and pins;
- source-immutable text-line and atomic child candidates;
- canonical child ordering, legal checkpoints, and prefix heights;
- empty, text, image, divider, spacer, mixed-child, and multi-cell evidence;
- blocked unsupported family, stale width/profile/revision, missing evidence,
  and non-positive content-width cases;
- bounded invalidation and factual work counts; and
- no pagination, rendering, media fetch, DOM, backend, or editor execution.

## RISK

- Existing accepted text-line results do not retain their request; the Table
  adapter must require an explicit paired evidence envelope.
- Materialized Table bindings are separate from the existing Resolved Document
  projection, so table-local request assembly must preserve equivalent field,
  image, and style semantics without forging a canonical document.
- Border-collapse and per-cell box styling need explicit layout-profile facts;
  inferring them now would couple core to a renderer.
- Fixed image frames give deterministic geometry but do not prove asset
  availability or decoding success.
- Flattening very large child sources duplicates candidate indexes unless the
  contract retains compact child ranges and prefix arrays deliberately.

## UNKNOWN

- Final border ownership and collapse policy for renderer/export.
- Whether Table cells will later accept nested Columns in canonical v4.
- Media missing-asset presentation and intrinsic-size fallback policy.
- Production measurement scheduling, cache storage, and cancellation.
- Future rowSpan row-group fragment and repeated-border semantics.

## Intentionally Not Changed

- canonical package 3/document 4 schemas;
- Table Definition, resolved rows, or content materialization contracts;
- existing Text-block and Columns measurement/pagination behavior;
- active document v3 table splitting;
- synchronized row pagination, repeated headers, renderer, and export;
- backend transport/storage and editor authoring/runtime.

## Next Direction

Implement exact Table/cell geometry and a strict paired text measurement
evidence contract. Then add family-owned text and atomic child candidates,
assemble prepared cells/rows, and prove deterministic scale before synchronized
row pagination.
