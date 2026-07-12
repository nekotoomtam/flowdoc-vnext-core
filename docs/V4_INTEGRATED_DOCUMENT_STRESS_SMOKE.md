# V4 Integrated Document Stress Smoke

Status: Phase 360 shared smoke evidence.

## Outcome

The test-local `integrated-v4-stress-v1` bundle runs the currently executable
v4 lanes from one structure-valid document identity set. The smoke uses public
core APIs for document structure, Text-block line pagination, canonical Columns
input and nested pagination, synchronized Table pagination, Table renderer-
neutral projection, and TOC semantic/measurement/pagination/final resolution.

The output is an evidence ledger, not a whole-document page plan. It retains
`integratedPageCount=null` and six expected blockers.

## Shared Evidence

- Source graph: `product-report-v4-migrated-minimal.flowdoc.json`, parsed through
  `DocumentNodeV4TargetSchema`, with one test-local TOC inserted before the
  existing field-backed title.
- Text: four accepted measured title lines paginate through
  `paginateVNextTextBlockV4Lines(...)`.
- Columns: existing summary lanes consume accepted text evidence through
  `createVNextColumnsV4NestedInput(...)` and
  `paginateVNextNestedColumnsV4(...)`.
- Table: the authored header keeps canonical `detail-table` row/cell identities;
  one clearly synthetic materialized body row exercises split text, repeated
  headers, atomic image evidence, and renderer-neutral projection.
- TOC: the field-backed title flows through semantic collection, approximate
  test measurement, page-window pagination, complete manifest finalization,
  and final resolution against a map labeled
  `synthetic-integrated-smoke-pages`.

## Result

| Lane | Capability | Result |
|---|---|---|
| document structure | `executable` | `valid` |
| Text-block local pagination | `executable` | `paginated` |
| Columns nested local pagination | `executable` | `paginated` |
| Table synchronized local pagination | `executable` | `paginated` |
| Table renderer-neutral facts | `contract-only` | `consumable` |
| TOC final resolver | `contract-only` | `resolved` with preview ready and artifact blocked |

Repeated execution is byte-stable and leaves the shared bundle unchanged.

## Expected Blockers

- `mixed-body-composition`
- `whole-document-heading-page-map-production`
- `field-backed-toc-label-materialization`
- `integrated-renderer-artifact`
- `backend-stress-orchestration-persistence`
- `editor-integrated-stress-ui`

The smoke does not infer a page plan, production heading destination, rendered
artifact, persistence result, or editor state from local lane success.

## Files Changed

- Shared test bundle: `tests/helpers/v4IntegratedStressSmoke.ts`.
- Smoke assertions: `tests/v4IntegratedDocumentStressSmoke.test.ts`.
- Architecture/phase discoverability documents.

## Intentionally Not Changed

- exported core runtime contracts or canonical schemas;
- whole-document composition and authoritative heading-page-map production;
- field-backed TOC label materialization;
- production renderer, export, backend, or editor behavior.

## Next Direction

Add medium and large workload profiles over this evidence ledger. Reuse public
lane work counters, keep local page counts separated by lane, and prove that
combined fixture size remains deterministic and bounded without claiming
integrated 200-300 page output.
