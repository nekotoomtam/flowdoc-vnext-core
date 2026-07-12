# TOC V4 Measurement Lane Architecture Lock

Status: Phase 342 architecture lock.

## Outcome

TOC v4 measurement converts one accepted semantic TOC plan into deterministic
title and entry-row geometry before pagination. It measures generated labels,
reserves a fixed page-number column, exposes leader geometry and row break
facts, and reports fit/overflow without assigning pages or resolving numbers.

This replaces neither the generic text engine nor pagination. It composes the
existing `VNextTextMeasurer` boundary into a TOC-specific generated layout
contract.

## Accepted Input

Measurement accepts:

- one `ready` or `partial` TOC v4 semantic result;
- one TOC id contained by that result;
- positive finite available width and available height in points;
- a non-blank measurement profile id;
- explicit title, entry-level, and page-number style keys;
- explicit level indentation for levels 1..6;
- fixed page-number column width and digit capacity;
- label-to-leader gap, minimum leader width, leader-to-number gap;
- title gap and row gap; and
- positive entry and measured-line execution budgets.

Blocked semantic plans, missing TOC ids, invalid geometry, missing styles, or
impossible label width return no measured layout.

## Row Geometry

For each entry:

```text
row width
  = indent
  + label measurement width budget
  + label-to-leader gap
  + minimum leader width
  + leader-to-number gap
  + fixed page-number column width
```

The page-number column is right aligned at the row's trailing edge and has the
same x/width for every level. Indentation reduces label width; it never shifts
or shrinks the number column.

The label is measured with its level style key and may wrap to multiple lines.
Row height is the larger of label height and one page-number sample line. The
leader belongs to the final label line and spans from that line's measured end
plus label gap to the number column minus number gap.

If the measured final line leaves more than the reserved minimum, the leader
expands. It never reduces label width after measurement and never overlaps the
number column.

## Fixed Page-Number Column

Measurement receives `pageNumberCapacityDigits` and measures a sample made of
that many `8` digits in the page-number style and fixed column width. The
sample must remain one line. This proves reserved capacity independently from
actual page values.

Final page resolution may replace the sample with a number only when its digit
count is within retained capacity. A larger number is a later resolution
overflow and requires remeasurement with a larger explicit capacity; core must
not silently widen the column after pagination.

This fixed width is the primary guard against a page-number/layout feedback
loop. It does not by itself prove pagination convergence.

## Title Geometry

The authored TOC title is measured only when non-empty after trimming. It uses
the title style and full TOC width. A measured title is atomic and carries
`keep-with-first-entry`; `titleGapAfterPt` separates it from the first row.

An empty or absent title has zero geometry and no gap. A title with no entries
is retained but cannot claim keep-with-first-entry satisfaction; measurement
reports this as a warning fact rather than inventing an entry.

## Row And Overflow Policy

Every entry row is `keep-together`. Measurement does not split label lines
across pages. Given available height:

- `fits` means title plus every row/gap fits;
- `split-required` means total height exceeds available height while every
  individual row can fit;
- `forced-row-overflow` means at least one row exceeds available height;
- title plus first row exposes a minimum first-fragment height for pagination.

Pagination later groups complete rows, keeps title with the first row when
possible, and handles a forced row explicitly. Measurement only reports facts.

## Measurement Output

The JSON-safe result retains:

- semantic result and TOC fingerprints;
- exact input geometry/style/profile facts;
- optional measured title geometry;
- one row per semantic entry with composite identity and ordinals;
- label text/line boxes, indent, label area, leader area, number area, and row
  x/y/width/height;
- fixed number sample, digit capacity, and one-line proof;
- total height, row/line counts, minimum first-fragment height, fit status, and
  forced-overflow row identities;
- factual text-measurement/cache work; and
- a deterministic measurement fingerprint.

Measurement targets may use an internal JSON composite cache key, but this is
not an authored node id or generated persisted entry id.

## Execution Budgets

- `maximumEntryCount` blocks before per-entry measurement.
- `maximumMeasuredLineCount` blocks after measured title/rows but before a
  ready layout is returned.

Budget failure returns no partial measured artifact. CPU cancellation,
per-tenant defaults, and durable cache policy remain external.

## Invalidation Boundary

- Semantic entry/configuration change remeasures affected TOCs.
- Materialized label change remeasures entries depending on changed fields.
- Width, style, indent, gap, leader, number capacity, or measurement profile
  change remeasures the complete target TOC.
- Available height change recomputes fit/overflow from retained row geometry;
  a later optimization may avoid text remeasurement.
- Pagination-only page-reference change within retained digit capacity does
  not remeasure TOC rows.

## PASS Criteria

- strict semantic-plan and explicit-layout validation;
- fixed trailing number column and one-line digit-capacity proof;
- deterministic level indentation and wrapped label line geometry;
- non-overlapping label, leader, and page-number areas;
- title keep-with-first-entry and row keep-together facts;
- fits/split-required/forced-row-overflow diagnostics;
- explicit entry/line budgets and immutable inputs;
- byte-identical repeated output and bounded 1,000-entry evidence;
- no field resolution, page assignment, final number replacement, pagination,
  rendering, artifacts, persistence, network, DOM, or editor state.

## RISK

- Style keys are opaque measurement inputs; visual style catalogs remain a
  separate resolution concern.
- Fixed digit capacity must be selected high enough for the product's expected
  page count or final resolution will require remeasurement.
- Keep-together long labels may force a row overflow on unusually short pages.
- Leader geometry depends on the text measurer's final line box accuracy.
- Measuring one entry per semantic row is necessarily proportional to output
  size; cache effectiveness depends on stable profile/style/width keys.

## UNKNOWN

- Product defaults for indent, gaps, leader glyph/style, and digit capacity.
- Whether title style belongs to TOC config or a future style-catalog preset.
- Right-to-left number-column and leader behavior.
- Decimal/roman/section-prefixed page-number formatting capacity.
- Whether future policy permits splitting exceptionally tall entry rows.

## Intentionally Not Changed

- canonical document v4 and TOC semantic contracts;
- generic text measurement implementation or native shaping adapters;
- document v3 TOC placeholder pagination and final page resolver;
- v4 pagination, renderer consumption, PDF, or DOCX execution;
- TOC authoring commands, backend persistence, and editor UI.

## Next Direction

Implement strict measurement preparation plus title/entry row geometry first,
then add overflow/budget/scale evidence before integrating v4 TOC rows with
pagination.
