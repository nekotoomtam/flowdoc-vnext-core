# Next Phase Pointer

Status: current after Measurement Hardening Close Audit.

## Next Phase

Template Publish / Variable Schema / Render API Planning Gate.

## Why This Is Next

Measurement Hardening Close Audit used Accepted Summary Manifest Population as
source of truth and decided:

Decision: sufficient for mini infrastructure checkpoint.

The accepted manifest is still scoped to a minimal subset only:

- `v1-measure-thai-line-break-core`;
- `v1-measure-latin-product-paragraphs`.

The audit confirms each accepted row carries:

- digest identity status: `pinned`;
- native evidence status: `summary-metadata-present`;
- WASM evidence status: `summary-metadata-present`;
- native/WASM parity status: `matching-summary-metadata`;
- renderer-backed drift summary status: `summary-metadata-present`;
- numeric threshold policy status: `accepted-policy`;
- retention pointer status: `present`.

The accepted manifest remains attached to the pinned digest context:

- artifact path:
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- sha256:
  `4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44`;
- matrix id: `v1-measurement-fixture-evidence-matrix-v1`;
- corpus id: `v1-measurement-evidence-corpus-v1`;
- policy revision: `v1-measurement-evidence-policy-v1`;
- threshold policy revision: `numeric-drift-threshold-policy-v1`;
- output shape: `glyph-line-box-v1`.

The full v1 matrix status remains `partial-not-accepted`. This means the
measurement lane can pause for a mini infrastructure checkpoint, but it cannot
claim full v1 measurement production readiness and cannot replace the default
measurer.

Previous source gates retained for traceability:

- Measurement Hardening Close Audit.
- Accepted Summary Manifest Population.
- Numeric Drift Threshold Decision.
- Renderer-backed Drift Summary Gate.
- Native/WASM Parity Summary Gate.
- WASM Evidence Summary Gate.
- Native Evidence Summary Gate.
- Artifact Digest Pinning Execution.
- Text Engine WASM Bindgen Export Dependency Gate.

## Inputs

- `docs/CURRENT_STATUS.md`
- `docs/MEASUREMENT_HARDENING_CLOSE_AUDIT.md`
- `docs/ACCEPTED_SUMMARY_MANIFEST_POPULATION.md`
- `fixtures/measurement-evidence-summary-manifest.accepted.v1.json`
- `fixtures/measurement-evidence-summary-manifest.stub.v1.json`
- `docs/NUMERIC_DRIFT_THRESHOLD_DECISION.md`
- `packages/text-engine-rust-wasm/fixtures/numeric-drift-threshold-decision.v1.json`
- `docs/RENDERER_BACKED_DRIFT_SUMMARY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/renderer-backed-drift-summary.v1.json`
- `docs/NATIVE_WASM_PARITY_SUMMARY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/native-wasm-parity-summary.v1.json`
- `docs/WASM_EVIDENCE_SUMMARY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-evidence-summary.v1.json`
- `docs/NATIVE_EVIDENCE_SUMMARY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json`
- `docs/ARTIFACT_DIGEST_PINNING_EXECUTION.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`
- `docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_GATE.md`
- `docs/V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE.md`
- `docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md`
- `docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md`

## Planning Gate Scope

- Rank Template Publish, Variable Schema, and Render API work for the next
  infrastructure lane.
- Choose the first lane to start after the measurement mini checkpoint.
- Define lane-specific evidence and blockers before implementation.
- Keep the measurement close-audit result scoped to infrastructure checkpoint
  readiness only.
- Keep raw native/WASM/renderer evidence outside root docs/tests.
- Keep root summaries bounded to JSON-safe facts and retention pointers.
- Keep production binding and default-measurer replacement blocked unless a
  later dedicated binding phase explicitly accepts them.

## Remaining Measurement Work Before Production Readiness

These release-gating rows are not required before the planning-gate pivot, but
they are required before full measurement production readiness or
default-measurer replacement:

- `v1-measure-mixed-latin-thai-title`;
- `v1-measure-styled-inline-font-map`;
- `v1-measure-field-chip-adjacency`;
- `v1-measure-table-cell-constrained`;
- `v1-measure-repeated-header-table-lines`;
- `v1-measure-width-narrow-wide-pair`;
- `v1-measure-multiline-forced-break`;
- `v1-measure-large-document-long-block`;
- `v1-measure-renderer-backed-drift-summary`;
- `v1-measure-digest-parity-summary`.

## Hard Limits

- No production binding.
- No default measurement replacement.
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

- planning gate for Template Publish / Variable Schema / Render API;
- ranked next infrastructure lanes;
- selected first lane and explicit deferred lanes;
- explicit measurement close-audit carry-forward blockers;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.

## Traceability Anchors

- Measurement Hardening Close Audit.
- Accepted Summary Manifest Population.
- Numeric Drift Threshold Decision.
- Renderer-backed Drift Summary Gate.
- Native/WASM Parity Summary Gate.
- Artifact Digest Pinning Execution.
- Text Engine WASM Bindgen Export Dependency Gate.
- Historical production retry summary retained `sha256ComputedThisPhase=false`;
  digest pinning happened only after the accepted artifact existed.
- The accepted summary manifest is enough for a mini checkpoint only; the full
  v1 matrix remains partial and default-measurer replacement remains blocked.
