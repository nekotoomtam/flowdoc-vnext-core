# Next Phase Pointer

Status: current after Native Evidence Summary Gate.

## Next Phase

WASM Evidence Summary Gate.

## Why This Is Next

Native Evidence Summary Gate used Artifact Digest Pinning Execution as source
of truth and added the smallest package-local native summary metadata subset.

Previous source gate retained for traceability: Artifact Digest Pinning Execution.

The summary fixture is:

```text
packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json
```

The summary is attached to the pinned digest context:

- artifact path:
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- sha256:
  `4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44`;
- matrix id: `v1-measurement-fixture-evidence-matrix-v1`;
- corpus id: `v1-measurement-evidence-corpus-v1`;
- policy revision: `v1-measurement-evidence-policy-v1`;
- output shape: `glyph-line-box-v1`;
- raw native evidence remains outside root docs/tests.

The covered subset is:

- `v1-measure-thai-line-break-core`;
- `v1-measure-latin-product-paragraphs`.

The next safe step is a WASM evidence summary for the same subset and the same
pinned digest context. Native/WASM parity, renderer-backed drift, numeric
thresholds, accepted manifests, production binding, and default-measurer
replacement remain blocked until later phases.

## Inputs

- `docs/CURRENT_STATUS.md`
- `docs/NATIVE_EVIDENCE_SUMMARY_GATE.md`
- `docs/ARTIFACT_DIGEST_PINNING_EXECUTION.md`
- `packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`
- `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`
- `docs/V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE.md`
- `docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md`
- `docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md`

## WASM Evidence Summary Gate Scope

- Produce a JSON-safe WASM evidence summary for the same minimal subset.
- Use the same matrix id, corpus id, policy revision, measurement profile id,
  output shape, and pinned artifact digest context.
- Keep raw WASM evidence outside root docs/tests.
- Keep root summaries bounded to JSON-safe facts and retention pointers.
- Keep native/WASM parity comparison, renderer-backed drift, numeric
  thresholds, accepted manifest, production binding, and default-measurer
  replacement blocked.

## Hard Limits

- No root check dependency on `wasm-pack`.
- No root check dependency on `wasm32-unknown-unknown`.
- No root check dependency on artifact production.
- No raw evidence in root tests/docs.
- No raw native/WASM evidence in root tests/docs.
- No raw native evidence in root docs/tests.
- No rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`.
- No fake WASM evidence.
- No fake parity.
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

- JSON-safe WASM evidence summary for the same smallest accepted subset;
- retention pointers for raw WASM evidence outside root tests/docs;
- explicit blocked status for parity, drift, thresholds, accepted manifest,
  production binding, and default-measurer replacement;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.

## Traceability Anchors

- Text Engine WASM Bindgen Export Dependency Gate.
- Artifact Digest Pinning Execution.
- Historical production retry summary retained `sha256ComputedThisPhase=false`;
  digest pinning happened only after the accepted artifact existed.
