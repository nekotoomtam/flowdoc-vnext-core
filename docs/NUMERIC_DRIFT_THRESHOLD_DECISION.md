# Numeric Drift Threshold Decision

Status: Numeric Drift Threshold Decision complete.

This phase uses Renderer-backed Drift Summary Gate as source of truth. It
accepts a JSON-safe numeric drift threshold policy for the same Thai
line-break core and canonical Latin paragraph subset. It does not put raw
native, WASM, or renderer evidence in root docs/tests and does not claim an
accepted summary manifest, production binding, or default-measurer
replacement.

## Source Of Truth

- `docs/RENDERER_BACKED_DRIFT_SUMMARY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/renderer-backed-drift-summary.v1.json`
- `docs/NATIVE_WASM_PARITY_SUMMARY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/native-wasm-parity-summary.v1.json`
- `docs/WASM_EVIDENCE_SUMMARY_GATE.md`
- `docs/NATIVE_EVIDENCE_SUMMARY_GATE.md`
- `docs/ARTIFACT_DIGEST_PINNING_EXECUTION.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`
- `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`
- `docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md`
- `docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_GATE.md`
- `docs/V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE.md`

## Prerequisite Check

The threshold decision confirms:

- renderer-backed drift summary exists:
  `packages/text-engine-rust-wasm/fixtures/renderer-backed-drift-summary.v1.json`;
- renderer-backed drift status is `summary-metadata-present`;
- native/WASM parity status is `matching-summary-metadata`;
- artifact digest context is pinned and matched;
- matrix id, corpus id, policy revision, measurement profile id, output shape,
  fixture ids, and scenario ids match the source drift summary;
- raw native/WASM/renderer evidence remains outside root docs/tests.

## Accepted Threshold Policy

The accepted threshold policy is:

| Drift field | Accepted / pass | Warning | Blocked / fail |
|---|---:|---:|---:|
| `width-drift` | `abs(width-drift-pt) <= 0.5` | `0.5 < abs(width-drift-pt) <= 1.0` | `abs(width-drift-pt) > 1.0` or missing summary |
| `height-drift` | `abs(height-drift-pt) <= 0.5` | `0.5 < abs(height-drift-pt) <= 1.0` | `abs(height-drift-pt) > 1.0` or missing summary |
| `line-count-drift` | `abs(line-count-drift) = 0` | not allowed for release-gating fixtures | non-zero or missing summary |

The policy is accepted for the current subset and context. Actual drift values
are not embedded in root docs/tests in this phase.

## Package-Local Fixture

The package-local fixture is:

```text
packages/text-engine-rust-wasm/fixtures/numeric-drift-threshold-decision.v1.json
```

It records:

- `thresholdPolicyRevision="numeric-drift-threshold-policy-v1"`;
- `summaryMode="json-safe-numeric-drift-threshold-policy-only"`;
- `thresholdPolicyDecisionStatus="accepted-policy"`;
- `thresholdEvaluationStatus="not-evaluated-no-raw-values-in-root"`;
- `thresholdsAcceptedForSubsetContext=true`;
- `driftValuesAcceptedForProduction=false`;
- `acceptedManifestStatus="blocked"`;
- `productionReady=false`;
- `defaultMeasurerReplacement=false`.

## Next Phase

Accepted Summary Manifest Population.

Proceed only because numeric thresholds are accepted as policy for this subset
and matching drift context. The accepted manifest phase must still reject
manifest acceptance if the threshold fixture is missing, stale, mismatched,
contains raw evidence in root docs/tests, or attempts to claim production
binding.

## Explicit Non-Work

- No raw renderer evidence is added to root docs/tests.
- No raw native/WASM evidence is added to root docs/tests.
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

- Renderer-backed drift summary exists.
- Native/WASM parity summary and pinned digest context match.
- Matrix id, corpus id, policy revision, measurement profile id, output
  shape, fixture ids, and scenario ids match.
- Numeric width, height, and line-count drift threshold policy is accepted for
  the current subset and context.
- Raw native/WASM/renderer evidence remains outside root docs/tests.
- Accepted manifest, production binding, and default-measurer replacement
  remain blocked.

## FAIL-BLOCKER

None for deciding and accepting the numeric threshold policy.

Accepted Summary Manifest Population must not proceed if the threshold
decision fixture is missing, stale, mismatched, includes raw evidence in root
docs/tests, or changes `measureVNextText(...)`.

## RISK

- The numeric thresholds are accepted for this minimal subset only.
- Warning states cannot support production/default-measurer replacement.
- Actual drift values are not evaluated in root docs/tests in this phase.
- The accepted manifest phase still needs to compose digest, parity, drift,
  threshold, status, and retention summaries.

## UNKNOWN

- Whether broader v1 fixture categories need tighter width/height thresholds.
- Whether PDF/DOCX renderer fidelity will require additional drift dimensions.
- Final production rollout, telemetry, rollback, and binding policy remain
  undecided.

## Files Changed

- `docs/NUMERIC_DRIFT_THRESHOLD_DECISION.md`
- `packages/text-engine-rust-wasm/fixtures/numeric-drift-threshold-decision.v1.json`
- `packages/text-engine-rust-wasm/README.md`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`
- `tests/numericDriftThresholdDecision.test.ts`
- pointer guard tests

## Behavior Changed

No runtime behavior changed. Production measurement behavior is unchanged.
Only package-local JSON-safe numeric threshold policy metadata was added.

## Tests Run

- `npm.cmd test -- tests/numericDriftThresholdDecision.test.ts tests/rendererBackedDriftSummaryGate.test.ts tests/nativeWasmParitySummaryGate.test.ts`
- `npm.cmd test`
- `npm.cmd run type-check`
- `npm.cmd run check`

## Risks Left

- Populate an accepted summary manifest for the same subset and context.
- Keep production measurement replacement blocked until a later explicit
  binding phase.
- Expand threshold review if later release-gating fixtures expose tighter
  requirements.

## Intentionally Not Changed

- `measureVNextText(...)`
- pagination behavior
- renderer-backed measurement binding
- PDF/DOCX renderer behavior
- backend routes/storage/auth/authz
- production contenteditable
- package/document schema
- collaboration/offline behavior
