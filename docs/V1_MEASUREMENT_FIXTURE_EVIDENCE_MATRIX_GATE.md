# V1 Measurement Fixture Evidence Matrix Gate

Status: Phase 184 v1 measurement fixture evidence matrix gate.

Phase 184 selects and maps the v1 measurement fixture/scenario matrix required
by Phase 183. It assigns stable corpus and fixture ids, maps each fixture to
measurement profile expectations, marks release-gating versus exploratory
coverage, and states which JSON-safe summary facts each fixture must provide.

This is a fixture/evidence matrix phase only. It does not replace
`measureVNextText(...)`, mutate pagination, bind production renderer-backed
measurement, execute external text engines in core, add production PDF/DOCX
renderer work, add backend/storage/auth behavior, implement contenteditable,
change package/document schema, add collaboration/offline behavior, or copy
legacy editor runtime.

## Evidence Reviewed

- `docs/CURRENT_STATUS.md` and `docs/NEXT_PHASE_POINTER.md` identify Phase
  184 as the current v1 measurement fixture evidence matrix gate.
- `docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md` defines the digest,
  parity, drift, fixture-evidence, and replacement-blocker policy.
- `docs/MEASUREMENT_ROLLOUT_GATE.md` keeps production measurement replacement
  blocked until digest, native/WASM parity, and drift evidence are accepted.
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_BOUNDARY.md` defines runtime identity,
  digest, font hash, runtime target, and parity requirements.
- `docs/TEXT_ENGINE_RENDERER_BACKED_PROVIDER_BOUNDARY.md` defines the
  renderer-backed provider bridge, drift report shape, profile gating, and
  default-measurement independence.
- `docs/TEXT_ENGINE_LINE_WRAP_EVIDENCE_BOUNDARY.md` proves evidence-grade
  multi-line line boxes from rustybuzz smoke and Thai line-break evidence.
- `docs/PDF_RENDERER_DECISION_GATE.md` keeps the PDF spike internal-alpha only
  and blocks production renderer fidelity claims.

## Matrix Identity

- Matrix id: `v1-measurement-fixture-evidence-matrix-v1`.
- Corpus id: `v1-measurement-evidence-corpus-v1`.
- Policy revision: `v1-measurement-evidence-policy-v1`.
- Baseline profile alias: `measurement-profile-v1:thai-rustybuzz-icu4x-v1`.
- Production identity profile: the full `measurementProfileId` recorded in
  `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`.
- Output shape: `glyph-line-box-v1`.
- Raw evidence owner: external/package-local evidence lane.
- Root evidence owner: JSON-safe docs/tests summaries only.

Changing any matrix id, corpus id, policy revision, profile id, output shape,
runtime digest, or fixture id resets the related evidence status to `unknown`
until a later summary manifest revalidates it.

## Required Fact Vocabulary

Each fixture row declares which summary facts must be present:

- `glyph-facts`: glyph id, glyph advance, and glyph offset facts.
- `cluster-map`: glyph cluster to UTF-16 text offset mapping.
- `text-range`: UTF-16 start/end offsets for the measured text.
- `line-boxes`: line boxes with UTF-16 text ranges and glyph ranges.
- `total-size`: total measured width and height.
- `line-count`: number of measured lines.
- `drift-summary`: approximate/default versus renderer-backed width, height,
  and line-count drift for the same profile.
- `parity-summary`: native/WASM digest and parity status for the same corpus
  and fixture ids.

Release-gating fixtures must eventually provide every fact above before a
default-measurer replacement can be proposed. Exploratory fixtures may carry
`warning` when `drift-summary` or `parity-summary` is absent, but not
`accepted`.

## Fixture Matrix

| Fixture id | Category | Source evidence | Profile requirement | Gate | Required summary facts |
|---|---|---|---|---|---|
| `v1-measure-latin-product-paragraphs` | Canonical product report paragraphs with Latin text | `fixtures/product-report-vnext.flowdoc.json` and `fixtures/product-report-vnext-minimal.flowdoc.json` text blocks | baseline profile alias plus production identity profile | release-gating | glyph-facts, cluster-map, text-range, line-boxes, total-size, line-count, drift-summary, parity-summary |
| `v1-measure-thai-line-break-core` | Thai text and Thai line-break corpus samples | `fixtures/thai-measurement-corpus.v1.json`; `fixtures/thai-line-break-evidence.v1.json`; `thai-greeting-no-space`; `thai-combining-marks` | production identity profile | release-gating | glyph-facts, cluster-map, text-range, line-boxes, total-size, line-count, drift-summary, parity-summary |
| `v1-measure-mixed-latin-thai-title` | Mixed Latin/Thai text in one text block | `mixed-report-title`; `mixed-product-name`; `packages/text-engine-rust-wasm/fixtures/rustybuzz-native-smoke.mixed-heading.sarabun-bold.v1.json` | production identity profile with `heading-xl` style mapping | release-gating | glyph-facts, cluster-map, text-range, line-boxes, total-size, line-count, drift-summary, parity-summary |
| `v1-measure-styled-inline-font-map` | Styled inline runs across style keys and font mappings | `rustybuzz-shaping-smoke-v1` cases for `paragraph` and `heading-xl`; font asset manifest mappings | production identity profile and stable style mappings | release-gating | glyph-facts, cluster-map, text-range, line-boxes, total-size, line-count, drift-summary, parity-summary |
| `v1-measure-field-chip-adjacency` | Atomic field-ref / field-chip adjacency with surrounding text | large-document acceptance first block and rich-inline commit/session evidence lanes | production identity profile; atomic inline boundaries preserved | release-gating | glyph-facts, cluster-map, text-range, line-boxes, total-size, line-count, drift-summary, parity-summary |
| `v1-measure-table-cell-constrained` | Table-cell text measurement at constrained widths | product report tables and large-document `line-items-table` cell text | production identity profile at constrained cell widths | release-gating | glyph-facts, cluster-map, text-range, line-boxes, total-size, line-count, drift-summary, parity-summary |
| `v1-measure-repeated-header-table-lines` | Repeated header/table scenarios consuming measured line boxes | table pagination and large-document repeated header scenarios | production identity profile; repeated header geometry consumes line boxes | release-gating | glyph-facts, cluster-map, text-range, line-boxes, total-size, line-count, drift-summary, parity-summary |
| `v1-measure-width-narrow-wide-pair` | Narrow and wide available widths for same text | Phase 133 line-wrap evidence narrow `24pt` and wide `10000pt` paths | same profile and text hash across both widths | release-gating | glyph-facts, cluster-map, text-range, line-boxes, total-size, line-count, drift-summary, parity-summary |
| `v1-measure-multiline-forced-break` | Multi-line wrap and forced line-break examples | Phase 133 multi-line wrap evidence and future forced line-break scenario summary | production identity profile; forced break reason kept outside public line boxes | release-gating | glyph-facts, cluster-map, text-range, line-boxes, total-size, line-count, drift-summary, parity-summary |
| `v1-measure-large-document-long-block` | Long text-block cases used by large-document acceptance tests | `tests/largeDocumentAcceptance.test.ts` generated long body text blocks | production identity profile; generated fixture id retained in summary | release-gating | glyph-facts, cluster-map, text-range, line-boxes, total-size, line-count, drift-summary, parity-summary |
| `v1-measure-renderer-backed-drift-summary` | Renderer-backed provider drift summaries for same profile | Phase 135 renderer-backed provider drift report shape | same `measurementProfileId` as source fixtures | release-gating | text-range, line-boxes, total-size, line-count, drift-summary |
| `v1-measure-digest-parity-summary` | Digest and parity summaries for same corpus ids | Phase 134 runtime identity manifest plus future parity summary manifest | same corpus id and production identity profile | release-gating | glyph-facts, cluster-map, text-range, line-boxes, total-size, line-count, parity-summary |

## Exploratory Coverage

Exploratory fixtures are allowed to inform future hardening but cannot satisfy
release-gating replacement criteria by themselves:

| Fixture id | Category | Purpose | Status floor |
|---|---|---|---|
| `v1-explore-page-summary-label` | Thai page label with punctuation | Exercises page-label and punctuation-sensitive measurement before final TOC/page rewrite work | warning |
| `v1-explore-thai-currency-number` | Thai, digits, punctuation, and fallback face | Exercises numeric punctuation and fallback font behavior | warning |
| `v1-explore-browser-worker-wasm-targets` | Browser/worker WASM runtime targets | Tracks whether browser/worker evidence becomes release-blocking later | unknown |
| `v1-explore-pdf-fidelity-probe` | PDF renderer fidelity probe | Keeps future PDF package requirements visible without choosing a renderer | unknown |

## Missing-Evidence Status Policy

- `accepted`: release-gating fixture has the required profile, JSON-safe
  digest identity, matching native/WASM parity, line boxes, total size,
  line count, drift summary inside accepted thresholds, and retained source
  references.
- `warning`: exploratory fixture is missing drift or parity, or a non-release
  fixture has a documented retention limitation.
- `blocked`: release-gating fixture is missing line boxes, total size, line
  count, drift summary, parity summary, digest identity, profile alignment, or
  has non-zero line-count drift after thresholds are accepted.
- `unknown`: raw evidence, digest, parity, profile identity, fixture mapping,
  or retention pointer is absent, stale, or not yet summarized.

Warnings and unknowns may support internal analysis only. They cannot support
default-measurer replacement.

## Raw Evidence Boundary

- Raw rustybuzz, WASM, ICU4X, browser, renderer, and PDF probe outputs stay out
  of root docs/tests unless represented by bounded JSON-safe summaries.
- Root tests may assert matrix ids, fixture ids, required facts, status policy,
  and dependency boundaries.
- Root tests must not require browser drivers, WASM loading, native shaper
  execution, renderer execution, or raw artifact bytes.
- Package-local manifests may retain raw evidence paths when the owning
  package keeps dependency boundaries clean.

## Remaining Replacement Blockers

- Produce JSON-safe summary manifests for all release-gating fixtures.
- Pin the WASM digest and retain runtime identity evidence.
- Produce native/WASM parity summaries for the same corpus ids.
- Produce renderer-backed drift summaries for the same profile ids.
- Choose numeric drift thresholds per profile.
- Define rollout, rollback, telemetry, and fallback policy in a later phase.
- Keep PDF/DOCX renderer fidelity separate from the measurement matrix until
  renderer package selection is accepted.

## Explicit Non-Work

- No `measureVNextText(...)` default replacement.
- No pagination mutation.
- No production renderer-backed measurement binding.
- No external text-engine execution in core.
- No production PDF/DOCX renderer work.
- No backend route/server/storage/auth/authz work.
- No production contenteditable implementation.
- No package/document schema change.
- No collaboration/offline behavior.
- No legacy editor runtime copy.

## PASS

- Stable matrix, corpus, policy, and fixture ids are selected.
- Each required v1 measurement fixture category is mapped.
- Each release-gating fixture is mapped to measurement profile requirements.
- Required summary facts are defined for every fixture row.
- Missing-evidence status policy is explicit.
- Raw evidence remains outside core with only JSON-safe summaries allowed in
  root docs/tests.

## FAIL-BLOCKER

No blocker prevents completing this fixture/evidence matrix gate.

Production/default measurement replacement remains blocked until summary
manifests, digest, parity, drift, thresholds, and a later binding phase are
accepted.

## RISK

- The matrix may need expansion after real PDF/DOCX renderer requirements are
  selected.
- Field-chip adjacency and repeated-header evidence still need concrete
  summary manifests.
- Numeric drift thresholds remain unselected.
- Browser/worker WASM evidence is exploratory until a later phase decides
  whether it is release-blocking.

## UNKNOWN

- Final numeric drift thresholds per profile.
- Final raw evidence retention location.
- Whether browser/worker WASM parity is required for v1 release.
- Whether PDF/DOCX package selection adds new fixture categories.
- Whether package/document schema changes are needed after fixture evidence is
  summarized.

## Next Recommended Phase

Proceed to Phase 185: Measurement Evidence Summary Manifest Gate.

Reason:

- Phase 184 selects the fixture matrix and required summary facts;
- the next safe step is to define the JSON-safe summary manifest shape that
  can carry digest, parity, drift, status, and retention pointers without
  executing external engines in core or replacing the default measurer.

## Files Changed

- `docs/V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE.md`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/v1MeasurementFixtureEvidenceMatrixGate.test.ts`
- `tests/measurementDigestParityDriftHardeningGate.test.ts`

## Behavior Changed

- No runtime behavior changed.
- The v1 measurement fixture evidence matrix is now selected and documented.
- Current-state pointers move from Phase 184 to Phase 185.

## Tests Run

- `npm.cmd run check`

## Risks Left

- Define the Phase 185 JSON-safe measurement evidence summary manifest.
- Fill release-gating fixture summaries without putting raw evidence in root
  tests/docs.
- Keep production binding, pagination mutation, renderer work, backend/storage,
  input, schema, and collaboration out of the measurement matrix lane.

## Intentionally Not Changed

- No `measureVNextText(...)` default replacement.
- No pagination mutation.
- No production renderer-backed measurement binding.
- No external text-engine execution in core.
- No production PDF/DOCX renderer.
- No backend route/server/storage/auth/authz behavior.
- No production contenteditable implementation.
- No package/document schema change.
- No collaboration/offline behavior.
- No legacy editor runtime copy.
