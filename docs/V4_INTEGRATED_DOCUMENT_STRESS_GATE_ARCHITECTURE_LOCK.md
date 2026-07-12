# V4 Integrated Document Stress Gate Architecture Lock

Status: Phase 359 architecture lock.

## Outcome

The v4 integrated document stress gate tests how the existing Text-block,
Columns, Table, TOC, lifecycle, resolution, and retained-layout contracts behave
as one evidence set. It must expose cross-lane incompatibility, invalidation
leaks, unbounded work, and missing producers before whole-document composition
or renderer integration begins.

This gate is not a production-readiness claim and does not introduce a new
canonical document type. Its scenario bundle is test evidence only. Every
executed fact must come from an exported core contract; every unavailable lane
must remain an explicit expected blocker rather than a mock success.

## Evidence Sources

- Text-block contract and isolated 6,000-line/250-page evidence:
  `src/pagination/textBlockV4Pagination.ts`,
  `docs/TEXT_BLOCK_V4_READINESS_CLOSE_AUDIT.md`.
- Text-backed Columns depth-three and 6,000-fragment/250-page evidence:
  `src/pagination/columnsV4Pagination.ts`,
  `src/pagination/columnsV4NestedPagination.ts`,
  `docs/COLUMNS_V4_READINESS_CLOSE_AUDIT.md`.
- Table semantic, materialization, prepared cells, synchronized pagination,
  renderer-consumption facts, and 1,000-row/250-page evidence:
  `docs/TABLE_V4_CONTENT_MATERIALIZATION_READINESS_CLOSE_AUDIT.md`,
  `docs/TABLE_V4_SYNCHRONIZED_ROW_PAGINATION_READINESS_CLOSE_AUDIT.md`,
  `docs/TABLE_V4_RENDERER_CONSUMPTION_READINESS_CLOSE_AUDIT.md`.
- TOC semantic, measurement, pagination, and final reference evidence:
  `src/toc/tocV4Semantic.ts`, `src/toc/tocV4Measurement.ts`,
  `src/toc/tocV4Pagination.ts`, `src/toc/tocV4PageResolution.ts`, and
  `docs/FINAL_TOC_V4_PAGE_REFERENCE_RESOLUTION_READINESS_CLOSE_AUDIT.md`.
- Cross-repo ownership and required gates:
  `docs/CROSS_REPO_OPERATING_MAP.md`.

## Scenario Bundle

The retained test-only profile id is `integrated-v4-stress-v1`. One bundle
contains:

- a structure-valid document-v4 graph with body/header/footer zones;
- ordered heading and normal Text-block sources, field refs, line breaks, text
  styles, and inline media references;
- two- and three-track Columns with unequal lane completion and nesting up to
  the accepted depth of three;
- static and collection-backed Tables with authored headers, repeated-header
  policy, text cells, atomic image cells, and span-one v1 occupancy;
- generated TOC semantic entries with fixed page-number capacity;
- exact published structure, policy, data snapshot, field/style/media,
  measurement-profile, and pagination fingerprints where the owning contract
  already accepts them; and
- an expected-blocker manifest for unavailable composition, materialization,
  renderer, persistence, and editor lanes.

The bundle may assemble inputs for multiple public APIs, but it must not become
a hidden whole-document composer or a second canonical package parser.

## Capability States

Each scenario axis has exactly one state:

- `executable`: an exported contract can run and return retained evidence now;
- `contract-only`: a strict retained contract exists, but its production
  producer or consumer is absent; or
- `expected-blocked`: no accepted end-to-end lane exists and the gate must
  preserve that absence visibly.

## Capability Matrix

| Axis | State | Accepted evidence | Gate rule |
|---|---|---|---|
| document-v4 structure and lifecycle pins | `executable` | strict schemas, structure validation, identity/policy/resolution contracts | one graph and exact pins; no prototype input |
| Text-block grammar, rich-inline transaction, measurement acceptance, local pagination | `executable` | exported authoring and pagination contracts | preserve source points, identity, immutability, and bounded line work |
| text-backed Columns planning and nested local pagination | `executable` | depth-three lane planners and continuation checkpoints | unequal lanes finish at the longest lane; no mixed-child claim |
| Table semantic rows, content materialization, prepared cells, synchronized pagination | `executable` | strict row/item/provenance and page fragment contracts | preserve row/cell identity, repeated headers, and synchronized sibling progress |
| Table renderer-consumption facts | `contract-only` | retained renderer-neutral Table commands/facts | prove no relayout; do not claim a production adapter or visual fidelity |
| TOC semantic, measurement, pagination manifest, final resolver | `contract-only` | complete pure lane with caller-supplied authoritative map | execute through resolution only when an accepted map is supplied as test evidence; never call it producer evidence |
| standalone and inline media references | `contract-only` | registry/media pins and fixed atomic Table image candidates | validate ownership and fixed geometry only; no fetch/decode/product rendering |
| mixed body-zone page composition | `expected-blocked` | no accepted producer exists | no summed local pages may be reported as document pages |
| authoritative whole-document heading-page map production | `expected-blocked` | resolver input contract exists, producer does not | fixtures must label supplied maps as synthetic test evidence |
| field-backed TOC label materialization cycle | `expected-blocked` | preview dependency facts exist | artifact readiness must remain blocked for pending labels |
| integrated renderer/export artifact | `expected-blocked` | isolated Table facts only | no PDF/DOCX/preview artifact or visual-readiness claim |
| backend stress orchestration/persistence | `expected-blocked` | current revision-safe mutation transport only | no new route, job, cursor, or artifact persistence claim |
| editor integrated stress UI | `expected-blocked` | current adapter and mutation runtime only | no canvas, viewport, selection, or WYSIWYG readiness claim |

## Workload Profiles

The gate uses deterministic structural workloads, not wall-clock thresholds:

- `smoke`: every executable family appears at least once, including nested
  Columns, a split Table, and a TOC with both static and field-backed labels;
- `medium`: repeated mixed sources and mutation/invalidation checks sized to
  expose accidental whole-graph work; and
- `large`: existing accepted ceilings combined as evidence, including 6,000
  Text-block lines, 6,000 Columns fragments at depth three, 1,000 Table rows,
  and 1,000 TOC headings.

The large profile is a multi-lane workload class. Until mixed composition
exists, local 250-page results must not be added together or described as a
200-300 page integrated document.

## Required Invariants

1. Composite identity and structured provenance remain unique and traceable
   across every lane.
2. Every consumer pins the exact producer fingerprint it claims to consume.
3. Structural, source, row, heading, and fragment order remains deterministic.
4. Repeated runs are byte-stable and source inputs remain immutable.
5. Work counters grow with visited entries/fragments/rows, with no nested
   whole-collection lookup hidden inside per-entry loops.
6. Measurement, pagination, resolution, and renderer-consumption facts stay in
   their owning lanes; downstream lanes do not relayout upstream geometry.
7. One localized mutation invalidates only the documented dependent lanes and
   retains unrelated fingerprints.
8. Malformed ownership, stale pins, broken cursors, missing fields/media, and
   capacity overflow fail closed with stable diagnostics.
9. Partial/resumable work preserves exact cursor/checkpoint continuity.
10. Expected blockers remain visible and cannot be converted to PASS by a
    synthetic producer, placeholder renderer, or page-count arithmetic.

## Phase Plan

1. Phase 359 locks this scenario, capability matrix, invariants, and evidence
   honesty rules.
2. Phase 360 builds the shared test bundle and runs the currently executable
   core lanes without pretending to compose pages.
3. Phase 361 adds smoke/medium/large workload and exact-work evidence.
4. Phase 362 stresses localized mutation and invalidation boundaries.
5. Phase 363 stresses malformed facts, stale pins, failure isolation, and
   resumable recovery.
6. Phase 364 runs cross-repo contract and full repository gates without adding
   deferred product integrations.
7. Phase 365 closes the bounded integrated stress audit and identifies the next
   architecture blocker from measured evidence.

## PASS Criteria

- capability states are evidence-backed and no absent lane is mocked as ready;
- the shared scenario uses only exported core contracts and test-local assembly;
- all required invariants have focused executable or expected-blocker evidence;
- smoke/medium/large outputs are deterministic and source-immutable;
- exact work and resume facts stay bounded at accepted scale;
- core, editor, and backend full gates pass at close; and
- the close audit distinguishes isolated contract strength from integrated
  production readiness.

## RISK

- A large test bundle can become a parallel application architecture if it
  starts owning composition or policy rather than assembling evidence.
- Combining accepted per-lane maxima may create an unrealistic memory-heavy CI
  test; scale phases must keep fixtures deterministic and bounded.
- Synthetic heading-page maps are necessary to exercise the resolver before a
  producer exists, but can overstate readiness unless explicitly labeled.
- Structural work counters do not replace future production memory, shaping,
  worker, renderer, or storage measurements.

## UNKNOWN

- The first real mixed-composer input/output contract and scheduling boundary.
- Accepted memory and elapsed-time thresholds for 200-300 page production jobs.
- Production font shaping, media decoding, renderer streaming, and artifact
  storage profiles.
- Which expected blocker will become the next implementation lane after the
  stress evidence is complete.

## Intentionally Not Changed

- canonical package/document schemas or version activation;
- Text-block, Columns, Table, and TOC runtime behavior;
- whole-document composition, renderer, PDF/DOCX, or artifact bytes;
- backend routes, storage, workers, auth, or tenancy;
- editor state, canvas, viewport, selection, or WYSIWYG input.

## Next Direction

Build the test-local `integrated-v4-stress-v1` smoke bundle and execute each
currently executable lane through its public API. Retain an explicit blocker
ledger beside the outputs and do not produce an integrated page count.
