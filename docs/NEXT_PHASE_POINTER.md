# Next Phase Pointer

Status: current after Native/WASM Parity Summary Gate.

## Next Phase

Renderer-backed Drift Summary Gate.

## Why This Is Next

Native/WASM Parity Summary Gate used WASM Evidence Summary Gate as source of
truth and compared the native/WASM summary metadata for the same minimal
fixture subset.

Previous source gates retained for traceability:

- WASM Evidence Summary Gate.
- Native Evidence Summary Gate.
- Artifact Digest Pinning Execution.

The summary fixtures are:

```text
packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json
packages/text-engine-rust-wasm/fixtures/wasm-evidence-summary.v1.json
packages/text-engine-rust-wasm/fixtures/native-wasm-parity-summary.v1.json
```

The parity summary is attached to the pinned digest context:

- artifact path:
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- sha256:
  `4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44`;
- matrix id: `v1-measurement-fixture-evidence-matrix-v1`;
- corpus id: `v1-measurement-evidence-corpus-v1`;
- policy revision: `v1-measurement-evidence-policy-v1`;
- output shape: `glyph-line-box-v1`;
- raw native evidence remains outside root docs/tests;
- raw WASM evidence remains outside root docs/tests.

The covered subset is:

- `v1-measure-thai-line-break-core`;
- `v1-measure-latin-product-paragraphs`.

The parity status is `matching-summary-metadata` for this subset. The next
safe step is a renderer-backed drift summary for the same subset and the same
pinned digest context. Numeric thresholds, accepted manifests, production
binding, and default-measurer replacement remain blocked until later phases.

## Inputs

- `docs/CURRENT_STATUS.md`
- `docs/NATIVE_WASM_PARITY_SUMMARY_GATE.md`
- `docs/WASM_EVIDENCE_SUMMARY_GATE.md`
- `docs/NATIVE_EVIDENCE_SUMMARY_GATE.md`
- `docs/ARTIFACT_DIGEST_PINNING_EXECUTION.md`
- `packages/text-engine-rust-wasm/fixtures/native-wasm-parity-summary.v1.json`
- `packages/text-engine-rust-wasm/fixtures/wasm-evidence-summary.v1.json`
- `packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`
- `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`
- `docs/V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE.md`
- `docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md`
- `docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md`
- `docs/TEXT_ENGINE_RENDERER_BACKED_PROVIDER_BOUNDARY.md`

## Renderer-Backed Drift Summary Gate Scope

- Produce a JSON-safe renderer-backed drift summary for the same minimal
  subset.
- Require matching parity summary metadata before recording drift summary
  metadata.
- Use the same matrix id, corpus id, policy revision, measurement profile id,
  output shape, fixture ids, scenario ids, and pinned artifact digest context.
- Keep raw native/WASM/renderer evidence outside root docs/tests.
- Keep root summaries bounded to JSON-safe facts and retention pointers.
- Block drift summary on stale digest, profile mismatch, subset mismatch,
  fixture mismatch, scenario mismatch, parity mismatch, or missing summary
  metadata.
- Keep numeric thresholds, accepted manifest, production binding, and
  default-measurer replacement blocked.

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
- No numeric threshold acceptance.
- No accepted summary manifest.
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

- JSON-safe renderer-backed drift summary for the same smallest accepted
  subset;
- explicit blocked status for numeric thresholds, accepted manifest,
  production binding, and default-measurer replacement;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.

## Traceability Anchors

- Text Engine WASM Bindgen Export Dependency Gate.
- Artifact Digest Pinning Execution.
- Native Evidence Summary Gate.
- WASM Evidence Summary Gate.
- Native/WASM Parity Summary Gate.
- Historical production retry summary retained `sha256ComputedThisPhase=false`;
  digest pinning happened only after the accepted artifact existed.
