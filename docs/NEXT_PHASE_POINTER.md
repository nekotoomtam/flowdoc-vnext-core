# Next Phase Pointer

Status: current after Phase 190.

## Next Phase

Phase 191: Text Engine WASM Artifact Build Output Gate.

## Why This Is Next

Phase 190 checks the Phase 189 package-local WASM artifact candidate paths and
finds no artifact. It defines the accepted future retained artifact path as:

```text
packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm
```

The digest remains `pending` with `sha256=null` and no
`wasmArtifactEvidence.pointer`.

The next safe step is to produce, locate, or explicitly retain that accepted
package-local output path without executing text engines in
`@flowdoc/vnext-core`. Root docs/tests should continue to receive only
JSON-safe summaries and retention pointers.

Native evidence, WASM evidence, native/WASM parity summaries,
renderer-backed drift summaries, numeric thresholds, accepted manifests,
production measurement binding, and default-measurer replacement all remain
blocked until later phases.

## Inputs

- `docs/CURRENT_STATUS.md`
- `docs/TEXT_ENGINE_WASM_ARTIFACT_DIGEST_PINNING_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_POPULATION_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-population.v1.json`
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_BUILDER_GATE.md`
- `packages/text-engine-rust-wasm/src/runtimeIdentityDigestEvidenceBuilder.ts`
- `packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-builder.v1.json`
- `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`
- `docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md`
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_BOUNDARY.md`

## Hard Limits

- No rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`.
- No raw evidence in root tests/docs.
- No raw native/WASM evidence in root tests/docs.
- No native/WASM parity evidence production in root core.
- No renderer-backed measurement as production truth.
- No production contenteditable implementation.
- No backend route/server/auth/authz implementation.
- No production storage readiness claim.
- No production PDF/DOCX renderer.
- No default measurement replacement.
- No pagination mutation.
- No package/document schema change.
- No collaboration/offline behavior.
- No legacy editor runtime copy.

## Expected Output

- accepted package-local WASM artifact output path produced or explicitly
  retained as absent;
- JSON-safe package-local summary update;
- sha256 pinned only if a real artifact exists and context matches;
- digest status reported as `pinned`, `pending`, `missing`, or `stale`;
- explicit blocker status for native evidence, WASM evidence, parity, drift,
  thresholds, accepted manifest, and default-measurer replacement;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.
