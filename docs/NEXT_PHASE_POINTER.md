# Next Phase Pointer

Status: current after Phase 195.

## Next Phase

Text Engine WASM Toolchain Provisioning Bootstrap Gate.

Phase 196: Artifact Digest Pinning Execution remains blocked.

## Why This Is Next

Phase 195 checked the accepted package-local WASM artifact production path:

```text
packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm
```

It reran the package-local readiness smoke:

```text
cd packages/text-engine-rust-wasm
npm run wasm:readiness-smoke
```

The smoke still exits zero but reports unavailable toolchain status:
`wasmPackAvailable=false`, `wasm32UnknownUnknownInstalled=false`,
`toolchainReady=false`, `canProduceArtifactNow=false`,
`artifactProduced=false`, `digestStatus="pending"`, and `sha256=null`.

Because the accepted artifact is not produced, Phase 196 digest pinning must
not proceed. The next safe step is a dedicated provisioning/bootstrap gate that
decides or executes how `wasm-pack` and `wasm32-unknown-unknown` become
available for package-local builds while root checks stay independent.

Native evidence, WASM evidence, native/WASM parity summaries,
renderer-backed drift summaries, numeric thresholds, accepted manifests,
production measurement binding, and default-measurer replacement all remain
blocked until later phases.

## Inputs

- `docs/CURRENT_STATUS.md`
- `docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-production.v1.json`
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_OPTIONAL_READINESS_SMOKE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-optional-readiness-smoke.v1.json`
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_ACQUISITION_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-acquisition.v1.json`
- `packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs`
- `docs/TEXT_ENGINE_WASM_BUILD_TOOLCHAIN_READINESS_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-build-toolchain-readiness.v1.json`
- `docs/TEXT_ENGINE_WASM_ARTIFACT_BUILD_OUTPUT_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-build-output.v1.json`
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
- No fake WASM artifact.
- No fake sha256.
- No Phase 196 digest pinning while the accepted artifact is absent.
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

- package-local provisioning/bootstrap decision for `wasm-pack`;
- package-local provisioning/bootstrap decision for
  `wasm32-unknown-unknown`;
- explicit version policy for installed `wasm-pack` if provisioning succeeds;
- root checks remain independent from WASM tooling;
- artifact production remains blocked until the toolchain is actually
  available;
- digest status remains `pending` unless a real artifact exists;
- explicit blocker status for native evidence, WASM evidence, parity, drift,
  thresholds, accepted manifest, and default-measurer replacement;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.
