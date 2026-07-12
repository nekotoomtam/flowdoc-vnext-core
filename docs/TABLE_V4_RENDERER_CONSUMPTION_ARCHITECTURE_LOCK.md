# Table V4 Renderer Consumption Architecture Lock

Status: Phase 323 architecture lock.

## Outcome

Table v4 renderer consumption is a pure projection from accepted synchronized
pagination facts into renderer-neutral page, table-segment, row, cell,
candidate, and border commands. Consumers may paint or assemble those commands;
they may not measure, paginate, inspect authored layout, or infer missing Table
relationships.

This lock authorizes prepared-candidate fact hardening, explicit render style
profiles, renderer-neutral command projection, relationship/readiness audits,
bounded SVG evidence, PDF/DOCX adapter planning, and scale checks. It does not
activate production artifact bytes, backend jobs, or editor canvas replacement.

## Current Evidence And Required Gaps

- `src/pagination/rendererConsumption.ts` proves a no-relayout command boundary
  for active document v3 measured fragments. It is evidence only for v4 Table
  command shape and must not become a compatibility adapter.
- `src/renderer/pdfAdapter.ts` and `src/renderer/docxAdapter.ts` prove that
  artifact adapters can consume commands without authored layout input. Their
  current measured-document command type remains separate.
- Synchronized Table pages retain row/cell geometry and candidate source ranges,
  but renderer-complete facts require three additive hardenings before command
  projection:
  - text-line candidates retain measured text and width;
  - image candidates retain authored horizontal alignment; and
  - prepared cells retain explicit vertical alignment.

Missing facts block renderer readiness. The renderer must never reopen the
authored document to recover them.

## Projection Input

One projection request pins:

- an accepted `VNextTablePaginationResultV1`;
- exact page placement origins for every page index;
- one renderer style profile id and border/background facts;
- Table section/zone context for source retention; and
- the expected prepared/pagination fingerprint.

Page placement supplies physical `xPt` and `yPt` only. Width, row height, cell
offset/width, candidate y offset, and continuation facts remain pagination
truth and cannot be overridden by the renderer profile.

## Command Hierarchy

Commands are ordered and JSON-safe:

```text
page
  -> table-segment
    -> cell-backgrounds
    -> row-fragment
      -> cell-fragment
        -> text-line | image | divider | spacer
    -> internal-grid-borders
    -> outer-segment-borders
```

- Table segment bounds cover the union of row fragments on one page.
- Row bounds use pagination y offset and maximum synchronized row height.
- Cell fragment height equals row fragment height so backgrounds and vertical
  borders span intentionally blank sibling space.
- Cell `contentUsedHeightPt` remains separate from synchronized fragment height.
- Text and atomic child commands use prepared candidate geometry and source
  facts. No command performs line breaking or image sizing.
- Spacer commands retain layout occupancy but may map to no visible paint in a
  concrete adapter.

## Vertical Alignment

Prepared cell alignment is `top`, `middle`, or `bottom`.

- Alignment applies only to the unused vertical space inside one physical row
  fragment.
- Split/continuation fragments align only the candidates consumed by that
  fragment; they never move content across page boundaries.
- The command projection computes one deterministic content offset from row
  fragment height, cell used height, and alignment.
- Insets already included in cell planning are not added again.

## Border Ownership

V1 uses collapsed single-owner borders without renderer inference:

- The `table-segment` owns outer top, right, bottom, and left edges on every
  physical page segment.
- Cells never draw outer left/right edges. Every non-first logical cell owns its
  internal leading vertical edge for the full row-fragment height.
- A complete row fragment owns its internal bottom edge only when another row
  fragment follows on the same page.
- An incomplete split row owns no internal bottom edge. The page segment owns
  its continuation bottom edge.
- A continuation fragment on the next page receives the segment outer top edge;
  it does not invent an internal row top border.
- A repeated header behaves as an ordinary complete row fragment. It owns the
  internal bottom edge before body content, while the segment owns page outer
  edges.
- The last row fragment on a page owns no bottom edge because the segment owns
  it. No edge may have two owners.

Border commands retain semantic role (`outer`, `internal-column`,
`internal-row`, `continuation`) and style facts separately so SVG/PDF/DOCX can
map capabilities without changing ownership.

## Style Profile

Renderer style is explicit versioned input, not authored-layout recovery. V1
retains:

- table outer border style;
- internal row/column border style;
- default cell background and optional row-role backgrounds;
- text color fallback only when candidate/run style does not already own it;
  and
- missing-media placeholder policy as `block` or `draw-placeholder`.

The profile cannot change dimensions. Border widths are centered on accepted
edge coordinates and do not feed back into pagination.

## Readiness And Relationships

Projection is all-or-blocked when:

- page origins are missing, extra, duplicated, or non-finite;
- row/cell/candidate geometry is invalid or exceeds its accepted parent bounds;
- row/cell order or source identity drifts;
- text width/text/source ranges or image width/height/alignment are missing;
- border ownership duplicates or leaves an expected edge unowned;
- repeated-header facts conflict with row kind; or
- pagination/prepared fingerprints do not match the request pin.

Renderer readiness never treats a visually plausible command list as proof of
semantic completeness.

## Adapter Boundary

- SVG preview may serialize commands into bounded deterministic markup for
  visual/geometry evidence only.
- PDF/DOCX plans map supported commands and report unsupported capabilities.
- Adapters may reorder paint operations only within the locked layer order.
- Adapters may not reflow text, resize rows/cells, merge borders differently,
  or query editor/backend state.
- Artifact bytes, fonts/media loading, storage, retries, and cancellation remain
  later execution concerns.

## Performance Boundary

- Visit every page, row fragment, cell, candidate, and owned border once.
- Index style and page-origin facts once per request.
- Emit factual command/work counts and deterministic fingerprints.
- A 250-page/1,000-body-row input must remain byte-stable and command work must
  be linear in consumed fragments and borders.
- Wall-clock timing alone is not complexity evidence.

## PASS Criteria

- renderer-complete prepared text/image/cell facts;
- strict page-placement and render-style contracts;
- deterministic page/segment/row/cell/candidate command hierarchy;
- explicit vertical alignment without repagination;
- single-owner outer/internal/continuation/repeated-header borders;
- complete relationship and bounds audits;
- missing-media block/placeholder policy;
- no authored-document, measurement, pagination, DOM, backend, or editor input;
- deterministic SVG plus PDF/DOCX adapter plans; and
- bounded 250-page command projection evidence.

## RISK

- Centered border widths can extend half a stroke outside accepted bounds;
  adapters must share clipping semantics.
- DOCX may not represent physical split-border ownership exactly without a
  capability warning or fallback.
- Vertical alignment across split fragments can look different from whole-row
  alignment by design because content cannot cross page boundaries.
- Rich text run paint details remain source-range/style facts, not plain text
  alone.
- Large command arrays retain deterministic source facts and may require
  streaming in production adapters.

## UNKNOWN

- Final product border/background presets and theme inheritance.
- Font embedding, glyph fallback, and image decode execution.
- Concrete PDF/DOCX border capability matrix.
- Editor selection/hit-testing over repeated and split layout fragments.
- Streaming/worker thresholds for large artifacts.

## Intentionally Not Changed

- canonical document/package schemas and Table semantics;
- materialization, measurement, prepared geometry, or pagination decisions;
- active document v3 renderer consumption and adapters;
- artifact bytes, storage, jobs, or export readiness;
- backend and editor runtime/UI.

## Next Direction

Harden prepared text/image/cell facts first. Then publish strict render profile
and page-placement contracts before implementing command projection and border
ownership tests.
