# Next Phase Pointer

Status: current after Accepted Summary Manifest Population.

## Next Phase

Measurement Hardening Close Audit.

## Why This Is Next

Accepted Summary Manifest Population used Numeric Drift Threshold Decision as
source of truth and populated JSON-safe accepted manifest entries for the same
minimal fixture subset.

Previous source gates retained for traceability:

- Accepted Summary Manifest Population.
- Numeric Drift Threshold Decision.
- Renderer-backed Drift Summary Gate.
- Native/WASM Parity Summary Gate.
- WASM Evidence Summary Gate.
- Native Evidence Summary Gate.
- Artifact Digest Pinning Execution.

The summary fixtures are:

```text
packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json
packages/text-engine-rust-wasm/fixtures/wasm-evidence-summary.v1.json
packages/text-engine-rust-wasm/fixtures/native-wasm-parity-summary.v1.json
packages/text-engine-rust-wasm/fixtures/renderer-backed-drift-summary.v1.json
packages/text-engine-rust-wasm/fixtures/numeric-drift-threshold-decision.v1.json
fixtures/measurement-evidence-summary-manifest.accepted.v1.json
```

The accepted manifest is attached to the pinned digest context:

- artifact path:
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- sha256:
  `4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44`;
- matrix id: `v1-measurement-fixture-evidence-matrix-v1`;
- corpus id: `v1-measurement-evidence-corpus-v1`;
- policy revision: `v1-measurement-evidence-policy-v1`;
- threshold policy revision: `numeric-drift-threshold-policy-v1`;
- output shape: `glyph-line-box-v1`;
- native/WASM parity status: `matching-summary-metadata`;
- renderer-backed drift status: `summary-metadata-present`;
- numeric threshold decision status: `accepted-policy`;
- accepted manifest status: `accepted` for the minimal subset;
- full v1 matrix status: `partial-not-accepted`;
- raw native evidence remains outside root docs/tests;
- raw WASM evidence remains outside root docs/tests;
- raw renderer evidence remains outside root docs/tests.

The covered subset is:

- `v1-measure-thai-line-break-core`;
- `v1-measure-latin-product-paragraphs`.

The next safe step is a close audit that decides whether this minimal accepted
subset is enough for a mini infrastructure checkpoint or whether more
release-gating matrix rows must be populated first. Production binding and
default-measurer replacement remain blocked until later phases.

## Inputs

- `docs/CURRENT_STATUS.md`
- `docs/ACCEPTED_SUMMARY_MANIFEST_POPULATION.md`
- `docs/NUMERIC_DRIFT_THRESHOLD_DECISION.md`
- `docs/RENDERER_BACKED_DRIFT_SUMMARY_GATE.md`
- `docs/NATIVE_WASM_PARITY_SUMMARY_GATE.md`
- `docs/WASM_EVIDENCE_SUMMARY_GATE.md`
- `docs/NATIVE_EVIDENCE_SUMMARY_GATE.md`
- `docs/ARTIFACT_DIGEST_PINNING_EXECUTION.md`
- `fixtures/measurement-evidence-summary-manifest.accepted.v1.json`
- `packages/text-engine-rust-wasm/fixtures/numeric-drift-threshold-decision.v1.json`
- `packages/text-engine-rust-wasm/fixtures/renderer-backed-drift-summary.v1.json`
- `packages/text-engine-rust-wasm/fixtures/native-wasm-parity-summary.v1.json`
- `packages/text-engine-rust-wasm/fixtures/wasm-evidence-summary.v1.json`
- `packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`
- `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`
- `fixtures/measurement-evidence-summary-manifest.stub.v1.json`
- `docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_GATE.md`
- `docs/V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE.md`
- `docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md`
- `docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md`
- `docs/MEASUREMENT_ROLLOUT_GATE.md`
- `docs/TEXT_ENGINE_RENDERER_BACKED_PROVIDER_BOUNDARY.md`

## Measurement Hardening Close Audit Scope

- Audit the measurement hardening lane after digest, native evidence, WASM
  evidence, parity, renderer-backed drift, numeric threshold policy, and
  accepted manifest population for the minimal subset.
- Decide whether the minimal accepted subset is enough for a mini
  infrastructure checkpoint.
- Decide whether to pivot next to Template Publish / Variable Schema / Render
  API, or whether more measurement evidence rows are required first.
- Keep raw native/WASM/renderer evidence outside root docs/tests.
- Keep root summaries bounded to JSON-safe facts and retention pointers.
- Keep production binding and default-measurer replacement blocked unless a
  later dedicated binding phase explicitly accepts them.

## Hard Limits

- No root check dependency on `wasm-pack`.
- No root check dependency on `wasm32-unknown-unknown`.
- No root check dependency on artifact production.
- No raw evidence in root tests/docs.
- No raw native/WASM evidence in root tests/docs.
- No raw native/WASM evidence in root docs/tests.
- No raw native evidence in root docs/tests.
- No raw WASM evidence in root docs/tests.
- No raw renderer evidence in root docs/tests.
- No rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`.
- No fake WASM evidence.
- No fake parity.
- No fake renderer drift.
- No fake threshold acceptance.
- No production binding.
- No default measurement replacement.
- No pagination mutation.
- No renderer-backed measurement as production truth.
- No production contenteditable implementation.
- No backend route/server/auth/authz implementation.
- No production storage readiness claim.
- No production PDF/DOCX renderer.
- No package/document schema change.
- No collaboration/offline behavior.
- No legacy editor runtime copy.

## Expected Output

- measurement hardening close audit;
- explicit decision on mini infrastructure checkpoint readiness;
- explicit next lane recommendation;
- explicit blocked status for production binding and default-measurer
  replacement;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.

## Traceability Anchors

- Text Engine WASM Bindgen Export Dependency Gate.
- Artifact Digest Pinning Execution.
- Native Evidence Summary Gate.
- WASM Evidence Summary Gate.
- Native/WASM Parity Summary Gate.
- Renderer-backed Drift Summary Gate.
- Numeric Drift Threshold Decision.
- Accepted Summary Manifest Population.
- Historical production retry summary retained `sha256ComputedThisPhase=false`;
  digest pinning happened only after the accepted artifact existed.
