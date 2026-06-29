# Next Phase Pointer

Status: current after Text Engine WASM Artifact Production Retry Gate.

## Next Phase

Text Engine WASM Bindgen Export Dependency Gate.

Phase 196: Artifact Digest Pinning Execution remains blocked.

## Why This Is Next

The artifact production retry gate confirmed package-local readiness:

- `wasmPackAvailable=true`;
- `wasmPackVersion="wasm-pack 0.15.0"`;
- `wasm32UnknownUnknownInstalled=true`;
- `toolchainReady=true`;
- `canProduceArtifactNow=true`.

It then ran the accepted package-local `wasm:build` command:

```text
wasm-pack build rust-shaper --target web --out-dir ../pkg --out-name flowdoc_text_engine
```

The build failed after the crate compiled for the WASM target because
`wasm-pack` requires `rust-shaper/Cargo.toml` to include:

```text
wasm-bindgen = "0.2"
```

The accepted artifact still does not exist:

```text
packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm
```

No generated JS glue, package metadata, TypeScript declarations, or accepted
WASM artifact were produced. Digest pinning must not proceed while the
artifact is absent.

The next safe step is a dedicated package-local dependency/export gate that
decides the `wasm-bindgen` dependency and exported WASM boundary needed by
`wasm-pack`, without changing root checks or production measurement binding.

Native evidence, WASM evidence, native/WASM parity summaries,
renderer-backed drift summaries, numeric thresholds, accepted manifests,
production measurement binding, and default-measurer replacement all remain
blocked until later phases.

## Inputs

- `docs/CURRENT_STATUS.md`
- `docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_RETRY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-production-retry.v1.json`
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_RUST_UPGRADE_EXECUTION_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-rust-upgrade-execution.v1.json`
- `packages/text-engine-rust-wasm/package.json`
- `packages/text-engine-rust-wasm/rust-shaper/Cargo.toml`
- `packages/text-engine-rust-wasm/rust-shaper/src/lib.rs`
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_VERSION_COMPATIBILITY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-version-compatibility.v1.json`
- `docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-production.v1.json`
- `packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs`
- `docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md`
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_BOUNDARY.md`

## Hard Limits

- No root check dependency on `wasm-pack`.
- No root check dependency on `wasm32-unknown-unknown`.
- No raw evidence in root tests/docs.
- No raw native/WASM evidence in root tests/docs.
- No rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`.
- No fake WASM artifact.
- No fake sha256.
- No sha256 compute or pinning while the accepted artifact is absent.
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

- package-local `wasm-bindgen` dependency/export boundary decision;
- no root check dependency on `wasm-bindgen`, `wasm-pack`, the WASM target, the
  readiness smoke, the WASM build, or an artifact;
- explicit decision whether the package-local crate can add
  `wasm-bindgen = "0.2"`;
- explicit exported boundary shape needed for `wasm-pack` package generation;
- artifact production remains blocked until that dependency/export blocker is
  resolved;
- digest status remains `pending` unless a later explicit pinning phase
  computes sha256 from a real artifact;
- explicit blocker status for native evidence, WASM evidence, parity, drift,
  thresholds, accepted manifest, and default-measurer replacement;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.
