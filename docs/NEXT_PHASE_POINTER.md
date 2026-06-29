# Next Phase Pointer

Status: current after Phase 194.

## Next Phase

Phase 195: Text Engine WASM Artifact Production Gate.

## Why This Is Next

Phase 194 runs the package-local WASM toolchain diagnostic through an optional
readiness smoke without making root checks depend on it:

```text
cd packages/text-engine-rust-wasm
npm run wasm:readiness-smoke
```

```text
packages/text-engine-rust-wasm/fixtures/wasm-toolchain-optional-readiness-smoke.v1.json
```

The smoke exits zero and records JSON-safe unavailable/blocked status:
`wasmPackAvailable=false`, `wasm32UnknownUnknownInstalled=false`,
`toolchainReady=false`, `canProduceArtifactNow=false`,
`artifactProduced=false`, `digestStatus="pending"`, and `sha256=null`.

The next safe step is the WASM artifact production gate. If the toolchain is
actually available, Phase 195 may produce the accepted artifact under
`packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`. If the
toolchain is still unavailable, Phase 195 must record the blocker clearly or
propose a dedicated provisioning/bootstrap phase. Do not continue to digest
pinning while the artifact is absent.

Native evidence, WASM evidence, native/WASM parity summaries,
renderer-backed drift summaries, numeric thresholds, accepted manifests,
production measurement binding, and default-measurer replacement all remain
blocked until later phases.

## Inputs

- `docs/CURRENT_STATUS.md`
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_OPTIONAL_READINESS_SMOKE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-optional-readiness-smoke.v1.json`
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_ACQUISITION_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-acquisition.v1.json`
- `packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs`
- `docs/TEXT_ENGINE_WASM_BUILD_TOOLCHAIN_READINESS_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-build-toolchain-readiness.v1.json`
- `docs/TEXT_ENGINE_WASM_ARTIFACT_BUILD_OUTPUT_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-build-output.v1.json`
- `docs/TEXT_ENGINE_WASM_ARTIFACT_DIGEST_PINNING_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_POPULATION_GATE.md`
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_BUILDER_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`
- `packages/text-engine-rust-wasm/rust-shaper/Cargo.toml`
- `packages/text-engine-rust-wasm/rust-shaper/src/main.rs`
- `packages/text-engine-rust-wasm/rust-shaper/src/lib.rs`
- `packages/text-engine-rust-wasm/package.json`
- `docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md`
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_BOUNDARY.md`

## Hard Limits

- No rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`.
- No raw evidence in root tests/docs.
- No raw native/WASM evidence in root tests/docs.
- No root check dependency on `wasm-pack`.
- No root check dependency on `wasm32-unknown-unknown`.
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

- package-local WASM artifact production decision;
- accepted artifact path remains
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- artifact output is produced only if the package-local toolchain is actually
  available;
- if the toolchain is unavailable, explicit blocker status or a dedicated
  provisioning/bootstrap recommendation;
- digest status remains `pending` unless a real artifact exists;
- explicit blocker status for native evidence, WASM evidence, parity, drift,
  thresholds, accepted manifest, and default-measurer replacement;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.
