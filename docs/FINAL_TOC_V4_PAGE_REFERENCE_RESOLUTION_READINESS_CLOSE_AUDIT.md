# Final TOC V4 Page-Reference Resolution Readiness Close Audit

Status: Phase 358 close audit.

## Outcome

Final TOC v4 page-reference resolution is ready as a pure core contract over
one complete semantic TOC, its exact measurement and pagination manifest, and
an authoritative complete document-v4 heading-page map. Core can retain exact
ownership, resolve ordered destinations, preserve partial entries, report
decimal digit capacity, separate preview and artifact readiness, and reject
malformed retained facts without measurement, relayout, rendering, or mutation.

This closes the bounded resolution contract only. Production end-to-end output
is not ready because no whole-document v4 pagination composer currently
produces the authoritative heading-page map, no field-backed TOC label
materialization lane feeds artifact-ready labels, and no renderer consumes the
resolved entries.

## PASS

- Bounded TOC pagination windows finalize only through an exact contiguous
  cursor chain with complete title, page, and measured-row coverage.
- The document-v4 heading-page map parser requires a complete map, unique
  heading ids, positive page numbers, bounded page indexes, and retained
  document-pagination ownership.
- Resolution pins semantic, TOC semantic, measurement, pagination manifest,
  heading map, and document pagination fingerprints.
- Semantic entries, measured rows, TOC placements, and heading destinations
  join through retained composite identity without copying measured geometry.
- Missing heading destinations remain ordered unresolved entries and produce
  `partial`; ownership, section, identity, and malformed retained-fact drift
  produce atomic `blocked` output with no entries.
- Extra document headings are ignored normally and counted separately from
  required TOC destinations.
- Decimal page-number overflow remains a resolved destination with explicit
  per-entry and aggregate `overflow` facts. It blocks readiness without hidden
  remeasurement, geometry widening, relayout, or retry.
- Authored-preview labels may satisfy preview readiness. Pending field-backed
  label materialization blocks artifact readiness independently.
- The document-pagination fingerprint is retained as the artifact composition
  pin; resolution emits no renderer command or artifact byte.
- Malformed semantic ordinals/identity, measured capacity, placement indexes,
  duplicate destinations, and invalid page facts block before projection.
- Missing retained capacity returns diagnostics rather than throwing.
- A 1,000-entry case resolves byte-identically across repeated calls, preserves
  immutable inputs, and reports exactly 1,000 entry resolutions, placement
  indexes, and heading-destination indexes.
- Core has no editor, backend, network, DOM, storage, or concrete renderer
  dependency in this lane.

## FAIL / BLOCKER

None for the bounded final TOC v4 page-reference resolution contract.

Production final TOC output remains blocked by the missing whole-document v4
pagination composition/heading-page-map producer, field-backed heading-label
materialization integration, and renderer/artifact consumption.

## RISK

- A caller can satisfy the strict map contract before a production producer
  exists; consumers must not treat test or caller-synthesized maps as artifact
  provenance.
- Decimal-only page text does not cover roman numerals, prefixes, section page
  numbering, or other future formatting profiles.
- The complete TOC pagination manifest retains every page placement and may be
  large for very long documents.
- Partial resolution is useful diagnostic output but is not renderer-ready;
  product surfaces must not silently omit unresolved entries.
- Capacity overflow has no automatic retry in v1 and therefore needs explicit
  orchestration and user-visible policy later.

## UNKNOWN

- Exact owner and retained contract for whole-document v4 composition and
  first-fragment heading selection.
- Final materialized TOC label input/fingerprint and the bounded second-cycle
  policy after field values change heading geometry.
- Versioned page-number formatting beyond positive decimal integers.
- Durable manifest/map retention, expiry, and content-addressed storage.
- Whether any product mode will permit export from partial resolution.

## Files Changed

- Architecture and public input contracts:
  `docs/FINAL_TOC_V4_PAGE_REFERENCE_RESOLUTION_ARCHITECTURE_LOCK.md` and
  `src/toc/tocV4ResolutionInputs.ts`.
- Resolver contract: `src/toc/tocV4PageResolution.ts` and public exports.
- Manifest/map, projection, diagnostics, capacity/readiness, malformed-input,
  immutability, and 1,000-entry scale tests.
- README, phase ledger, cross-repo operating map, and this close audit.

## Behavior Changed

- Core can aggregate bounded TOC pagination windows into one strict complete
  manifest and parse an authoritative heading-page map.
- Core can project final ordered page references with exact ownership pins and
  explicit resolved, partial, or blocked status.
- Capacity and preview/artifact readiness are retained facts rather than hidden
  renderer behavior.
- Malformed retained facts fail closed before entries are returned.

## Tests Run

- Core: type-check and 282 test files / 1,431 tests.
- Editor: type-check, 27 test files / 157 tests, and production build.
- Backend: type-check, 13 test files / 45 tests, and build.

## Risks Left

- Whole-document v4 pagination composition must produce the accepted heading-
  page map rather than requiring callers to synthesize it.
- Field-backed heading labels need a materialized label contract and bounded
  invalidation cycle before artifact readiness can be exercised end to end.
- Renderer and artifact consumers must use retained row/placement references
  without relayout.
- Backend persistence/orchestration and editor status presentation remain
  separate integration work.

## Intentionally Not Changed

- canonical document schemas and authored TOC structure;
- semantic, measurement, and page-window pagination behavior;
- document v3 pagination and final page resolver;
- whole-document v4 composition and heading-page-map production;
- field materialization, renderer commands, artifacts, and export;
- backend routes/storage and editor authoring/status UI.

## Next Recommended Direction

Lock the whole-document v4 pagination composition lane. Define how completed
node/container pagination fragments become one fingerprinted document page
plan and authoritative first-fragment heading-page map, while preserving
bounded work and keeping renderer, persistence, and editor workflow external.
