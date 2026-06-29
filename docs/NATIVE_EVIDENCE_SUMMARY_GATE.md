# Native Evidence Summary Gate

Status: Native Evidence Summary Gate complete.

This phase uses Artifact Digest Pinning Execution as source of truth. It adds
the smallest package-local, JSON-safe native evidence summary metadata subset
for measurement hardening. It does not put raw native evidence in root
docs/tests, does not run WASM evidence, and does not claim parity or
production measurement readiness.

## Source Of Truth

- `docs/ARTIFACT_DIGEST_PINNING_EXECUTION.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`
- `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`
- `docs/V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE.md`
- `docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md`
- `docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md`

## Digest Identity Check

The native summary attaches to the pinned digest context:

- artifact path:
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- sha256:
  `4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44`;
- matrix id: `v1-measurement-fixture-evidence-matrix-v1`;
- corpus id: `v1-measurement-evidence-corpus-v1`;
- policy revision: `v1-measurement-evidence-policy-v1`;
- output shape: `glyph-line-box-v1`;
- measurement profile id matches
  `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`;
- `rawEvidenceIncluded=false`.

## Native Summary Subset

The smallest subset is deliberately limited to two release-gating fixture rows:

| Fixture id | Coverage | Scenario ids | Status |
|---|---|---|---|
| `v1-measure-thai-line-break-core` | Thai line-break core coverage | `thai-greeting-no-space`, `thai-combining-marks` | `summary-metadata-present` |
| `v1-measure-latin-product-paragraphs` | Canonical Latin paragraph coverage | `product-report-vnext`, `product-report-vnext-minimal` | `summary-metadata-present` |

Each row carries JSON-safe metadata for native fact coverage:

- `glyph-facts`;
- `cluster-map`;
- `text-range`;
- `line-boxes`;
- `total-size`;
- `line-count`.

The summary does not include raw glyph arrays, raw cluster maps, raw line box
coordinates, raw native output, or native engine stdout/stderr. Raw native
evidence is represented only by package-local/external retention pointers.

## Package-Local Fixture

The package-local fixture is:

```text
packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json
```

It records:

- `nativeEvidenceSummaryExists=true`;
- `summaryMode="json-safe-native-evidence-metadata-only"`;
- `subsetId="native-evidence-summary-minimal-v1"`;
- `rawNativeEvidenceIncluded=false`;
- `nativeEngineExecutionInCore=false`;
- `nativeEvidenceStatus="summary-metadata-present"`;
- `wasmEvidenceStatus="blocked"`;
- `nativeWasmParityStatus="not-run"`;
- `rendererBackedDriftStatus="unknown"`;
- `numericDriftThresholdStatus="blocked"`;
- `acceptedManifestStatus="blocked"`;
- `defaultMeasurerReplacement=false`.

## Next Phase

WASM Evidence Summary Gate.

Proceed only because the native evidence summary exists and matches the pinned
digest context. WASM evidence must use the same matrix id, corpus id, policy
revision, measurement profile id, output shape, and artifact digest context.

## Explicit Non-Work

- No raw native evidence is added to root docs/tests.
- No WASM evidence is executed.
- No native/WASM parity is claimed.
- No renderer-backed drift is claimed.
- No numeric thresholds are accepted.
- No accepted summary manifest is claimed.
- No `measureVNextText(...)` replacement happens.
- No pagination mutation happens.
- No production renderer-backed measurement binding happens.
- No production PDF/DOCX renderer work is added.
- No backend routes, storage, auth, or authz are added.
- No production contenteditable implementation is added.
- No package/document schema change is made.
- No collaboration/offline behavior is added.
- No legacy editor runtime is copied.

## PASS

- Digest identity is pinned and context-matched.
- The native evidence summary fixture exists.
- The subset includes Thai line-break core and canonical Latin paragraph
  coverage.
- Raw native evidence remains outside root docs/tests.
- The summary is attached to the pinned digest context.
- WASM evidence, parity, drift, thresholds, accepted manifest, production
  binding, and default-measurer replacement remain blocked.

## FAIL-BLOCKER

None for producing the native evidence summary metadata gate.

WASM Evidence Summary Gate must not proceed if the package-local native
summary fixture is missing, has a stale digest context, includes raw native
output in root docs/tests, or changes `measureVNextText(...)`.

## RISK

- This is metadata-only native summary coverage. It is not an accepted root
  measurement manifest.
- Raw native evidence retention is represented as package-local/external
  placeholders and may need concrete retention paths in a later evidence
  production phase.
- Thai line-break and Latin paragraph coverage are the first subset only; the
  remaining release-gating rows still need summaries.

## UNKNOWN

- WASM evidence output remains unknown.
- Native/WASM parity remains not-run.
- Renderer-backed drift remains unknown.
- Numeric drift thresholds remain blocked.
- Accepted summary manifest status remains blocked.

## Files Changed

- `docs/NATIVE_EVIDENCE_SUMMARY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json`
- `packages/text-engine-rust-wasm/README.md`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`
- `tests/nativeEvidenceSummaryGate.test.ts`
- pointer guard tests

## Behavior Changed

No runtime behavior changed. Production measurement behavior is unchanged.
Only package-local JSON-safe native evidence summary metadata was added.

## Tests Run

- `npm.cmd test -- tests/nativeEvidenceSummaryGate.test.ts tests/artifactDigestPinningExecution.test.ts`
- `npm.cmd test`
- `npm.cmd run type-check`
- `npm.cmd run check`

## Risks Left

- Produce WASM evidence summary for the same subset and digest context.
- Compare native/WASM summaries in a later parity gate.
- Produce renderer-backed drift and numeric threshold policy later.
- Keep production measurement replacement blocked until a later explicit
  binding phase.

## Intentionally Not Changed

- `measureVNextText(...)`
- pagination behavior
- renderer-backed measurement binding
- PDF/DOCX renderer behavior
- backend routes/storage/auth/authz
- production contenteditable
- package/document schema
- collaboration/offline behavior
