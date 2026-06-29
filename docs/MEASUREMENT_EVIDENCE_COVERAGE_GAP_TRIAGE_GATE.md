# Measurement Evidence Coverage Gap Triage Gate

Status: Phase 187 measurement evidence coverage gap triage gate.

Phase 187 ranks the missing evidence exposed by the Phase 186 stub manifest.
It assigns gaps to owners, orders prerequisites, selects the first fixture rows
to fill, and recommends the next evidence-builder phase. It is triage only:
no real native/WASM evidence is produced, no external text engine is executed
in core, and default measurement replacement remains blocked.

## Evidence Reviewed

- `docs/CURRENT_STATUS.md` and `docs/NEXT_PHASE_POINTER.md` identify Phase
  187 as the current evidence coverage gap triage gate.
- `docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_FIXTURE_STUB_GATE.md` and
  `fixtures/measurement-evidence-summary-manifest.stub.v1.json` are the source
  of truth for the unknown/missing release-gating rows.
- `docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_GATE.md` defines accepted,
  warning, blocked, unknown, digest, parity, drift, retention, and replacement
  blocker shape.
- `docs/V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE.md` defines fixture ids,
  scenario ids, release-gating versus exploratory status, and required facts.
- `docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md` defines the
  prerequisite order before replacing `measureVNextText(...)`.
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_BOUNDARY.md` keeps runtime identity and
  digest evidence package-local until it is summarized.
- `docs/TEXT_ENGINE_RENDERER_BACKED_PROVIDER_BOUNDARY.md` keeps
  renderer-backed provider drift external and blocks default binding.

## Stub Findings

The Phase 186 manifest has:

- 12 release-gating fixture rows;
- 4 exploratory fixture rows;
- `rawEvidenceIncluded=false`;
- `manifestStatus=unknown`;
- all release-gating `status=unknown`;
- all release-gating required facts marked `missing`;
- release-gating digest identity `pending`;
- release-gating native/WASM parity `not-run`;
- renderer-backed drift `unknown`;
- null raw native/WASM/renderer retention pointers;
- top-level replacement blockers:
  `release-gating-summaries-missing`, `digest-pending`,
  `native-wasm-parity-not-run`, `renderer-backed-drift-unknown`,
  `numeric-drift-thresholds-pending`, and `later-binding-phase-not-run`.

## Ranked Missing Evidence

| Rank | Gap | Owner | Release rows affected | Blocks |
|---|---|---|---|---|
| 1 | Digest/runtime identity is pending, including WASM digest and runtime revision retention | text-engine package | 12 of 12 | every accepted summary and all native/WASM parity claims |
| 2 | Fixture/corpus source descriptors and text/style/width scenario hashes are not summarized | fixture/corpus owner | 12 of 12 | stable native, WASM, drift, and root manifest rows |
| 3 | Native evidence is missing for glyph, cluster, text range, line boxes, total size, and line count | text-engine package | 11 text-engine rows; renderer drift row consumes line-box facts but does not own glyph facts | WASM comparison, parity summaries, and drift input confidence |
| 4 | WASM evidence is missing for the same profile, corpus ids, and scenario ids | text-engine package | 11 text-engine rows; renderer drift row depends on same profile identity | parity summaries and browser/worker readiness decisions |
| 5 | Native/WASM parity summaries are not run | text-engine package and root JSON-safe summary owner | 11 parity-required rows; renderer drift row remains profile-dependent | accepted fixture status and default-measurer replacement |
| 6 | Renderer-backed drift summaries are unknown | renderer-backed provider | 11 drift-required rows; digest/parity summary row is not the drift producer | production drift acceptance and renderer-backed confidence |
| 7 | Numeric drift thresholds are policy-pending | renderer-backed provider and root JSON-safe summary owner | every drift-required release row | accepted drift status |
| 8 | Accepted root summary manifest is absent | root JSON-safe summary owner | 12 of 12 | production readiness claims and any later binding proposal |
| 9 | PDF/DOCX renderer implications remain exploratory | future PDF/DOCX renderer owner | exploratory only until renderer package decisions add rows | future renderer fidelity expansion |

## Owner Grouping

Text-engine package owns:

- runtime identity revision fields;
- WASM artifact digest and digest retention;
- native evidence production outside core;
- WASM evidence production outside core;
- native/WASM parity comparison;
- package-local retention for raw native and raw WASM evidence;
- JSON-safe text-engine summary snippets handed to the root manifest owner.

Renderer-backed provider owns:

- renderer-backed drift summary production outside production binding;
- profile-gated renderer-backed measurement summaries;
- approximate versus renderer-backed drift comparison summaries;
- renderer evidence retention pointers;
- drift status inputs for the root summary owner.

Fixture/corpus owner owns:

- stable corpus id and policy revision alignment;
- fixture/scenario id coverage;
- source text, style, width, table, field-chip, and long-block descriptors;
- release-gating versus exploratory classification;
- ensuring fixture rows can be re-run without changing document schema.

Root JSON-safe summary owner owns:

- manifest shape and bounded root summaries;
- missing-evidence status;
- accepted/warning/blocked/unknown aggregation;
- replacement blocker visibility;
- raw-evidence exclusion from root docs/tests.

Future PDF/DOCX renderer owner owns:

- renderer-fidelity fixture expansion after renderer choices are accepted;
- PDF/DOCX-specific drift or line-box requirements;
- proof that renderer package choices do not backfill measurement acceptance
  without digest, parity, and drift evidence.

## Prerequisite Order

1. Digest/runtime identity: pin runtime revisions, font hashes, output shape,
   measurement profile id, and WASM digest status.
2. Native evidence: produce raw native glyph/cluster/text/line/size evidence
   outside core and retain it package-locally.
3. WASM evidence: produce matching WASM evidence for the same profile, corpus,
   scenario ids, and output shape outside core.
4. Parity summaries: compare native/WASM summaries and emit JSON-safe
   matching/mismatched/not-run status without raw outputs.
5. Renderer-backed drift summaries: produce profile-aligned renderer-backed
   drift summaries after text-engine facts are stable.
6. Numeric drift thresholds: set per-profile width/height tolerances while
   keeping required release line-count drift at zero.
7. Accepted summary manifest: only after the earlier steps are accepted can
   the root summary owner produce an accepted manifest.

## First Rows To Fill

Fill rows in this order:

1. `v1-measure-digest-parity-summary`: establishes digest identity and parity
   summary shape for the corpus before row-specific acceptance.
2. `v1-measure-thai-line-break-core`: highest script/layout risk for v1 and
   the clearest profile-gating case.
3. `v1-measure-styled-inline-font-map`: proves style-to-font profile mapping
   before mixed or field-adjacent text can be trusted.
4. `v1-measure-mixed-latin-thai-title`: catches script mixing and heading
   profile behavior after Thai and style mapping are stable.
5. `v1-measure-width-narrow-wide-pair`: proves width-sensitive line breaking
   for the same text/profile pair.
6. `v1-measure-multiline-forced-break`: extends line boxes to multi-line and
   forced-break cases.
7. `v1-measure-table-cell-constrained`: covers constrained table-cell widths
   before repeated table-header usage.
8. `v1-measure-repeated-header-table-lines`: consumes line boxes inside
   repeated header/table scenarios.
9. `v1-measure-field-chip-adjacency`: covers atomic inline adjacency after
   plain/style/script facts are stable.
10. `v1-measure-latin-product-paragraphs`: baseline product report paragraphs
    should be filled early for sanity, but they are lower risk than Thai,
    mixed, style, width, and table rows.
11. `v1-measure-large-document-long-block`: fills volume/performance-shaped
    long text once row-level facts are stable.
12. `v1-measure-renderer-backed-drift-summary`: fill after enough text-engine
    facts exist to compare profile-aligned renderer-backed summaries.

Exploratory rows remain outside release-gating acceptance until a later matrix
revision makes them release-blocking.

## Recommended Next Phase

Proceed to Phase 188: Text Engine Runtime Identity Digest Evidence Builder
Gate.

Reason:

- digest/runtime identity is the first prerequisite and affects every release
  row;
- the Phase 186 stub records digest as pending everywhere;
- native/WASM evidence, parity, drift, thresholds, and accepted root manifests
  all depend on the digest/runtime identity being pinned first;
- the builder should live in the text-engine package or external evidence lane,
  with root docs/tests receiving only JSON-safe summaries.

## Default-Measurer Replacement Status

`measureVNextText(...)` replacement remains blocked.

Before replacement can be proposed, every release-gating row must have accepted
digest identity, required fact coverage, native/WASM parity when required,
renderer-backed drift when required, numeric thresholds, retention pointers,
and a later binding phase that explicitly accepts default-measurer replacement.

## Explicit Non-Work

- No real native/WASM evidence is produced.
- No rustybuzz/WASM/ICU4X execution in core.
- No renderer-backed measurement is run as production truth.
- No `measureVNextText(...)` default replacement.
- No pagination mutation.
- No raw evidence in root tests/docs.
- No production PDF/DOCX renderer work.
- No backend route/server/storage/auth/authz behavior.
- No production contenteditable implementation.
- No package/document schema change.
- No collaboration/offline behavior.
- No legacy editor runtime copy.

## PASS

- Missing evidence across release-gating rows is ranked.
- Gaps are grouped by text-engine package, renderer-backed provider,
  fixture/corpus owner, root JSON-safe summary owner, and future PDF/DOCX
  renderer owner.
- Prerequisite order is explicit from digest through accepted summary
  manifest.
- First fixture rows to fill are selected.
- Next evidence-builder phase is recommended.
- Default-measurer replacement remains blocked.

## FAIL-BLOCKER

No blocker prevents completing this triage gate.

Production/default measurement replacement remains blocked because no real
digest, native, WASM, parity, drift, threshold, or accepted summary evidence
exists in the root manifest.

## RISK

- First-row ordering may need revision when real text-engine evidence exposes
  unexpected fixture failures.
- Future PDF/DOCX renderer decisions may add release-gating rows.
- Numeric drift thresholds may change the row order after renderer-backed
  summaries exist.
- Retention pointer choices may affect how soon root summaries can be accepted.

## UNKNOWN

- Final WASM digest and build path.
- Final raw native/WASM/renderer retention locations.
- Final per-profile numeric drift thresholds.
- Whether browser/worker WASM parity becomes release-blocking.
- Whether PDF/DOCX renderer package choices add new required facts.
- Which later phase will accept default-measurer replacement.

## Files Changed

- `docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/measurementEvidenceCoverageGapTriageGate.test.ts`
- prior pointer guard tests

## Behavior Changed

- No runtime behavior changed.
- Measurement evidence gaps are now ranked and assigned to owners.
- Current-state pointers move from Phase 187 to Phase 188.

## Tests Run

- `npm.cmd test -- tests/measurementEvidenceCoverageGapTriageGate.test.ts tests/measurementEvidenceSummaryManifestFixtureStubGate.test.ts tests/measurementEvidenceSummaryManifestGate.test.ts tests/v1MeasurementFixtureEvidenceMatrixGate.test.ts tests/measurementDigestParityDriftHardeningGate.test.ts tests/v1HardeningBacklogTriageGate.test.ts tests/internalAlphaCloseAuditConsolidation.test.ts`
- `npm.cmd run check`

## Risks Left

- Build the Phase 188 digest/runtime identity evidence-builder gate.
- Keep raw evidence outside root docs/tests.
- Keep native/WASM/parity/drift evidence production outside core.
- Keep default-measurer replacement blocked until a later explicit binding
  phase.

## Intentionally Not Changed

- No real native/WASM evidence.
- No rustybuzz/WASM/ICU4X execution in core.
- No production renderer-backed measurement truth.
- No `measureVNextText(...)` default replacement.
- No pagination mutation.
- No raw evidence in root tests/docs.
- No production PDF/DOCX renderer.
- No backend route/server/storage/auth/authz behavior.
- No production contenteditable implementation.
- No package/document schema change.
- No collaboration/offline behavior.
- No legacy editor runtime copy.
