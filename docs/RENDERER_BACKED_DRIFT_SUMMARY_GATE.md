# Renderer-Backed Drift Summary Gate

Status: Renderer-backed Drift Summary Gate complete.

This phase uses Native/WASM Parity Summary Gate as source of truth. It produces
a package-local, JSON-safe renderer-backed drift summary metadata fixture for
the same Thai line-break core and canonical Latin paragraph subset. It does
not put raw native, WASM, or renderer evidence in root docs/tests and does not
accept numeric drift thresholds, accepted manifest status, production binding,
or default-measurer replacement.

## Source Of Truth

- `docs/NATIVE_WASM_PARITY_SUMMARY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/native-wasm-parity-summary.v1.json`
- `docs/WASM_EVIDENCE_SUMMARY_GATE.md`
- `docs/NATIVE_EVIDENCE_SUMMARY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-evidence-summary.v1.json`
- `packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json`
- `docs/ARTIFACT_DIGEST_PINNING_EXECUTION.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`
- `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`
- `docs/TEXT_ENGINE_RENDERER_BACKED_PROVIDER_BOUNDARY.md`
- `docs/V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE.md`
- `docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md`
- `docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md`

## Parity Prerequisite Check

The renderer-backed drift summary confirms:

- native/WASM parity summary exists:
  `packages/text-engine-rust-wasm/fixtures/native-wasm-parity-summary.v1.json`;
- parity status is `matching-summary-metadata`;
- parity is accepted only as a drift prerequisite, not production readiness;
- raw native/WASM evidence remains outside root docs/tests.

## Matched Context

The drift summary uses the same context as the parity summary:

- artifact path:
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- sha256:
  `4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44`;
- matrix id: `v1-measurement-fixture-evidence-matrix-v1`;
- corpus id: `v1-measurement-evidence-corpus-v1`;
- policy revision: `v1-measurement-evidence-policy-v1`;
- output shape: `glyph-line-box-v1`;
- measurement profile id matches the runtime identity manifest;
- fixture ids and scenario ids match the parity summary.

## Drift Metadata Coverage

The summary records metadata coverage for:

- `approximate-summary`;
- `renderer-backed-summary`;
- `width-drift`;
- `height-drift`;
- `line-count-drift`.

The drift coverage is unthresholded. Numeric threshold acceptance is explicitly
blocked until a later decision phase.

## Package-Local Fixture

The package-local fixture is:

```text
packages/text-engine-rust-wasm/fixtures/renderer-backed-drift-summary.v1.json
```

It records:

- `nativeWasmParitySummaryExists=true`;
- `nativeWasmParityStatus="matching-summary-metadata"`;
- `summaryMode="json-safe-renderer-backed-drift-metadata-only"`;
- `subsetId="renderer-backed-drift-summary-minimal-v1"`;
- `rendererBackedDriftStatus="summary-metadata-present"`;
- `rendererBackedDriftScope="summary-metadata-only"`;
- `rendererBackedProviderBinding="not-production-bound"`;
- `driftAcceptedForThresholdDecision=true`;
- `driftAcceptedForProduction=false`;
- `numericDriftThresholdStatus="blocked"`;
- `acceptedManifestStatus="blocked"`;
- `defaultMeasurerReplacement=false`.

## Next Phase

Numeric Drift Threshold Decision.

Proceed only because the renderer-backed drift summary exists and matches the
parity/digest context. The threshold decision must not accept thresholds if
the drift summary is missing, stale, blocked, mismatched, or contains raw
renderer evidence in root docs/tests.

## Explicit Non-Work

- No raw renderer evidence is added to root docs/tests.
- No raw native/WASM evidence is added to root docs/tests.
- No numeric drift thresholds are accepted.
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

- Native/WASM parity summary exists.
- Parity status is `matching-summary-metadata`.
- Digest context, matrix id, corpus id, policy revision, measurement profile
  id, output shape, fixture ids, and scenario ids match.
- Renderer-backed drift summary metadata exists for the same subset.
- Raw native/WASM/renderer evidence remains outside root docs/tests.
- Numeric thresholds, accepted manifest, production binding, and
  default-measurer replacement remain blocked.

## FAIL-BLOCKER

None for producing the renderer-backed drift summary metadata gate.

Numeric Drift Threshold Decision must not proceed if the renderer-backed drift
summary is missing, stale, blocked, mismatched, includes raw renderer evidence
in root docs/tests, or changes `measureVNextText(...)`.

## RISK

- This is renderer-backed drift metadata only. It does not accept numeric
  drift tolerances.
- Drift is acceptable only as input to the next threshold decision, not as
  production measurement readiness.
- Raw renderer evidence retention is still represented as an external
  placeholder.

## UNKNOWN

- Final numeric drift thresholds remain blocked.
- Accepted summary manifest status remains blocked.
- Production measurement replacement remains blocked.

## Files Changed

- `docs/RENDERER_BACKED_DRIFT_SUMMARY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/renderer-backed-drift-summary.v1.json`
- `packages/text-engine-rust-wasm/README.md`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`
- `tests/rendererBackedDriftSummaryGate.test.ts`
- pointer guard tests

## Behavior Changed

No runtime behavior changed. Production measurement behavior is unchanged.
Only package-local JSON-safe renderer-backed drift summary metadata was added.

## Tests Run

- `npm.cmd test -- tests/rendererBackedDriftSummaryGate.test.ts tests/nativeWasmParitySummaryGate.test.ts tests/wasmEvidenceSummaryGate.test.ts`
- `npm.cmd test`
- `npm.cmd run type-check`
- `npm.cmd run check`

## Risks Left

- Decide numeric drift thresholds for the same subset and digest context.
- Produce an accepted summary manifest later.
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
