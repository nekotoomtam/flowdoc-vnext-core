# WASM Evidence Summary Gate

Status: WASM Evidence Summary Gate complete.

This phase uses Native Evidence Summary Gate as source of truth. It adds a
package-local, JSON-safe WASM evidence summary metadata fixture for the same
smallest Thai line-break and canonical Latin paragraph subset. It does not put
raw WASM evidence in root docs/tests, does not claim native/WASM parity, and
does not claim production measurement readiness.

## Source Of Truth

- `docs/NATIVE_EVIDENCE_SUMMARY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json`
- `docs/ARTIFACT_DIGEST_PINNING_EXECUTION.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`
- `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`
- `docs/V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE.md`
- `docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md`
- `docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md`

## Digest Identity Check

The WASM summary attaches to the same pinned digest context as the native
summary:

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
- native source summary id is `text-engine-native-evidence-summary-v1`;
- `rawEvidenceIncluded=false`.

## WASM Summary Subset

The WASM subset must match the native evidence summary subset exactly:

| Fixture id | Coverage | Scenario ids | Status |
|---|---|---|---|
| `v1-measure-thai-line-break-core` | Thai line-break core coverage | `thai-greeting-no-space`, `thai-combining-marks` | `summary-metadata-present` |
| `v1-measure-latin-product-paragraphs` | Canonical Latin paragraph coverage | `product-report-vnext`, `product-report-vnext-minimal` | `summary-metadata-present` |

Each row carries JSON-safe metadata for WASM fact coverage:

- `glyph-facts`;
- `cluster-map`;
- `text-range`;
- `line-boxes`;
- `total-size`;
- `line-count`.

The summary does not include raw glyph arrays, raw cluster maps, raw line box
coordinates, raw WASM output, stdout, or stderr. Raw WASM evidence is
represented only by package-local/external retention pointers.

## Package-Local Fixture

The package-local fixture is:

```text
packages/text-engine-rust-wasm/fixtures/wasm-evidence-summary.v1.json
```

It records:

- `wasmEvidenceSummaryExists=true`;
- `summaryMode="json-safe-wasm-evidence-metadata-only"`;
- `sourceSubsetId="native-evidence-summary-minimal-v1"`;
- `subsetId="wasm-evidence-summary-minimal-v1"`;
- `rawWasmEvidenceIncluded=false`;
- `rawWasmOutputIncluded=false`;
- `wasmEvidenceExecutionMode="metadata-only-no-wasm-execution"`;
- `wasmEngineExecutionInCore=false`;
- `wasmArtifactLoadedByRoot=false`;
- `nativeEvidenceStatus="summary-metadata-present"`;
- `wasmEvidenceStatus="summary-metadata-present"`;
- `nativeWasmParityStatus="not-run"`;
- `rendererBackedDriftStatus="unknown"`;
- `numericDriftThresholdStatus="blocked"`;
- `acceptedManifestStatus="blocked"`;
- `defaultMeasurerReplacement=false`.

## Next Phase

Native/WASM Parity Summary Gate.

Proceed only because the WASM evidence summary exists, matches the native
subset, and matches the pinned digest context. The parity phase must compare
summaries under the same matrix id, corpus id, policy revision, measurement
profile id, output shape, and artifact digest context. It must still block on
stale digest, subset mismatch, profile mismatch, or missing summary metadata.

## Explicit Non-Work

- No raw WASM evidence is added to root docs/tests.
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

- Native evidence summary exists and matches the pinned digest context.
- WASM evidence summary fixture exists.
- WASM subset matches the native Thai line-break core and canonical Latin
  paragraph subset.
- Raw WASM evidence remains outside root docs/tests.
- The summary is attached to the pinned digest context.
- Native/WASM parity, drift, thresholds, accepted manifest, production
  binding, and default-measurer replacement remain blocked.

## FAIL-BLOCKER

None for producing the WASM evidence summary metadata gate.

Native/WASM Parity Summary Gate must not proceed if the package-local WASM
summary fixture is missing, has a stale digest context, diverges from the
native subset, includes raw WASM output in root docs/tests, or changes
`measureVNextText(...)`.

## RISK

- This is metadata-only WASM summary coverage. It is not accepted parity
  evidence and not an accepted root measurement manifest.
- Raw WASM evidence retention is represented as package-local/external
  placeholders and may need concrete retention paths in a later evidence
  production phase.
- Thai line-break and Latin paragraph coverage are the first subset only; the
  remaining release-gating rows still need summaries.

## UNKNOWN

- Native/WASM parity remains not-run.
- Renderer-backed drift remains unknown.
- Numeric drift thresholds remain blocked.
- Accepted summary manifest status remains blocked.

## Files Changed

- `docs/WASM_EVIDENCE_SUMMARY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-evidence-summary.v1.json`
- `packages/text-engine-rust-wasm/README.md`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`
- `tests/wasmEvidenceSummaryGate.test.ts`
- pointer guard tests

## Behavior Changed

No runtime behavior changed. Production measurement behavior is unchanged.
Only package-local JSON-safe WASM evidence summary metadata was added.

## Tests Run

- `npm.cmd test -- tests/wasmEvidenceSummaryGate.test.ts tests/nativeEvidenceSummaryGate.test.ts`
- `npm.cmd test`
- `npm.cmd run type-check`
- `npm.cmd run check`

## Risks Left

- Compare native and WASM summaries in a later parity gate.
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
