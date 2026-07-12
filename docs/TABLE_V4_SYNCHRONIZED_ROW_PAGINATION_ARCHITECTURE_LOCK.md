# Table V4 Synchronized Row Pagination Architecture Lock

Status: Phase 316 architecture lock.

## Outcome

Table v4 paginates one prepared logical row as synchronized independent cell
flows. Every page attempt snapshots all cell cursors, plans each active cell at
most once, derives one row-fragment height from the maximum used cell height,
and commits every cell cursor together or none.

This lock authorizes cell/row cursor contracts, one-attempt cell and row
planners, row break-policy execution, table-level row pagination, repeated
leading headers, no-progress guards, deterministic work facts, and bounded
scale evidence. It does not activate renderer/export, backend execution, or
editor authoring.

## Planning Layers

```text
prepared cells + immutable cursor snapshot
  -> one cell plan per active cell
  -> one synchronized row-fragment plan
  -> atomic row cursor commit
  -> ordered multi-row page assembly
  -> repeated leading headers when required
```

Cell planning never decides the next logical row. Row planning never measures
or reshapes child content. Table pagination never mutates prepared rows.

## Cell Cursor

One cursor retains:

```text
sourceCellId + cell identity + candidateIndex + complete
```

- `candidateIndex` is a monotonic boundary from zero through candidate count.
- Cursor cell identity and source cell id must match the prepared cell exactly.
- Empty cells begin uncommitted at candidate index zero; their first plan
  completes boundary insets exactly once.
- Completed cells remain complete and consume zero height on later fragments of
  the same row.
- Cursor serialization is JSON-safe and contains no DOM/range/runtime object.

## Vertical Insets

- Top inset applies only while `candidateIndex === 0` on the first cell
  fragment.
- Bottom inset applies only when the plan consumes the final candidate and
  completes that cell.
- Continuation fragments neither repeat top inset nor reserve bottom inset
  unless they complete the cell.
- An empty cell completes with top + bottom inset on the row's first fragment.
  It consumes zero on later row continuations.
- Candidate prefix heights remain content-only; planners add boundary insets
  explicitly instead of rewriting prepared measurements.

## Cell Planning

The cell planner uses prefix heights and bounded checkpoint lookup to choose the
greatest legal candidate boundary fitting the supplied row/page height.

- Text-line and atomic candidate boundaries are equally legal checkpoints;
  atomic candidates remain indivisible because each is one candidate.
- Placements retain candidate/source identities and y offsets beginning after
  applicable top inset.
- If the next candidate can fit a fresh page but not the current remainder, the
  plan requests one fresh page without advancing its cursor.
- If the next candidate plus required boundary insets cannot fit a fresh page,
  planning blocks with an oversized-candidate diagnostic.
- A planned result either advances, completes, or explicitly requests a fresh
  page. Any other state blocks as no progress.

## Row Cursor And Atomic Commit

One row cursor retains row identity, row index, fragment index, completion, and
cell cursors in canonical cell order.

For one attempt:

```text
clone row cursor
  -> apply first-fragment break policy
  -> plan each active cell once from the same available height
  -> reject any blocked cell without committing siblings
  -> row used height = max(cell used heights, first-fragment minimum height)
  -> commit all cell cursors atomically
```

Cells may consume different candidate counts. The shared physical row fragment
uses the maximum used height; shorter sibling cells intentionally leave blank
space. Following rows begin only after every cell completes.

The authored minimum row height applies to the first row fragment only. If it
cannot fit a fresh page body, pagination blocks. It is not repeated on
continuation fragments.

## Break Policies

- `allow`: plan cell checkpoints immediately in the current remainder.
- `prefer-keep`: on the row's first fragment, move the whole row to a fresh page
  when its maximum prepared outer height fits a fresh page but not the current
  remainder. If taller than a fresh page, fall back to `allow` splitting.
- `strict-keep`: the row must complete as one fragment. Move it once when it
  fits a fresh page but not the current remainder; block when its required
  height exceeds a fresh page body.

Policies apply before any cell cursor commit. Continuation fragments always use
the already-authorized split path and cannot re-run keep decisions.

## Multi-row Pagination

- Prepared row order is canonical input order.
- The first page may expose less available height than a fresh page body.
- A row requesting a fresh page may create one zero-height page remainder and
  retry once at full body height.
- Every successful loop iteration completes a row, advances at least one cell
  candidate, or advances from a partial remainder to a fresh page.
- Page count and attempt count are bounded independently.
- Page fragments retain row/cell/candidate identities, geometry, used height,
  continuation facts, and source row index.

## Repeated Leading Headers

When policy is `repeat-leading-headers`, only the contiguous leading authored
rows with role `header` repeat.

- Original header rows participate normally on the first page.
- Repeated headers are layout fragments referencing the same prepared authored
  rows. They allocate no authored/resolved identities and do not enter history.
- Headers repeat only on continuation pages containing later row content.
- Every repeated header is planned from its initial cursor and must complete
  under `strict-keep` semantics in the fresh-page body.
- If repeated headers leave no legal body-row progress on a fresh page,
  pagination blocks with a header-progress diagnostic instead of emitting an
  unbounded sequence of header-only pages.
- V1 does not repeat footer rows.

## Fingerprints And Work Facts

- Cursor and fragment fingerprints use unambiguous JSON tuple encoding.
- Work facts count page attempts, row plans, cell plans, checkpoint lookups,
  consumed candidates, completed rows, repeated header rows, and fresh-page
  advances.
- Each active cell is planned at most once per row/page attempt.
- Prefix-height lookup must not rescan consumed candidates from row start.
- Wall-clock timing alone is not complexity evidence.

## PASS Criteria

- strict JSON-safe monotonic cell and row cursors;
- first/final-only inset accounting and empty-cell behavior;
- independent cell progress with maximum-height row reconciliation;
- atomic all-cell commit or no commit;
- allow, prefer-keep, and strict-keep evidence;
- partial-first-page fresh-page advance and no-progress protection;
- oversized text/atomic/minimum-height diagnostics;
- unequal, early-complete, empty, and multi-fragment cells;
- ordered multi-row pagination and repeated leading headers;
- header-only progress guard, page/attempt limits, and deterministic output;
- representative 200-300 page scale with factual work counts; and
- no measurement, mutation, rendering, backend, or editor execution.

## RISK

- Reserving bottom inset only on completion means checkpoint lookup must test a
  different height for the final boundary than intermediate boundaries.
- Strict-keep relies on complete prepared outer height; future dynamic child
  families must retain the same exact-height contract.
- Repeated headers amplify work and can consume most of a page body.
- Many cells with uneven line heights intentionally create blank sibling space.
- Future rowSpan changes synchronization from one row to one span group and
  requires a versioned capability boundary.

## UNKNOWN

- Renderer border ownership between split row fragments and repeated headers.
- Product-selected maximum page/attempt limits.
- Widow/orphan policy inside Table text beyond accepted line checkpoints.
- Footer repetition, group headers, subtotals, and rowSpan groups.
- Incremental repagination convergence threshold after edits.

## Intentionally Not Changed

- canonical document/package schemas and Table Definition;
- prepared cell geometry, measurement evidence, or materialization;
- existing Text-block and Columns pagination;
- active document v3 table splitting;
- renderer/export and artifact assembly;
- backend transport/storage and editor UI/runtime.

## Next Direction

Implement strict cell/row cursor contracts and the one-attempt synchronized row
planner first. Prove break policies, insets, atomic commit, oversized content,
and no-progress behavior before adding multi-row pages and repeated headers.
