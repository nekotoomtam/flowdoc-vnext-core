# Next Phase Pointer

Status: current after Text Engine WASM Toolchain Provisioning Execution Gate.

## Next Phase

Text Engine WASM Toolchain Version Compatibility Gate.

Phase 196: Artifact Digest Pinning Execution remains blocked.

## Why This Is Next

The provisioning execution gate attempted the accepted package-local
provisioning path:

```text
cargo install wasm-pack --locked
rustup target add wasm32-unknown-unknown
```

Execution results:

- `rustup target add wasm32-unknown-unknown` succeeded;
- `wasm32-unknown-unknown` is now installed;
- `cargo install wasm-pack --locked` attempted to install
  `wasm-pack v0.15.0`;
- `wasm-pack` installation failed because dependency
  `cargo-platform@0.3.3` requires `rustc 1.91`;
- the current toolchain reports `rustc 1.88.0`;
- post-execution `wasm:readiness-smoke` reports `toolchainReady=false`;
- artifact production remains blocked;
- digest pinning remains blocked.

The next safe step is to choose the version/provisioning strategy before any
artifact production retry:

- upgrade Rust to a toolchain compatible with latest `wasm-pack`;
- pin a compatible `wasm-pack` version explicitly;
- use a pinned CI image;
- use an internal tool cache;
- use a preinstalled developer toolchain.

Do not retry artifact production until package-local readiness reports:

```text
toolchainReady=true
```

Artifact Digest Pinning Execution must not proceed until the accepted artifact
exists at:

```text
packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm
```

Native evidence, WASM evidence, native/WASM parity summaries,
renderer-backed drift summaries, numeric thresholds, accepted manifests,
production measurement binding, and default-measurer replacement all remain
blocked until later phases.

## Inputs

- `docs/CURRENT_STATUS.md`
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_PROVISIONING_EXECUTION_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-execution.v1.json`
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_PROVISIONING_BOOTSTRAP_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-bootstrap.v1.json`
- `packages/text-engine-rust-wasm/scripts/plan-wasm-toolchain-bootstrap.mjs`
- `docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-production.v1.json`
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_OPTIONAL_READINESS_SMOKE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-optional-readiness-smoke.v1.json`
- `packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs`
- `packages/text-engine-rust-wasm/package.json`
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_ACQUISITION_GATE.md`
- `docs/TEXT_ENGINE_WASM_BUILD_TOOLCHAIN_READINESS_GATE.md`
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
- No artifact production until `toolchainReady=true`.
- No Artifact Digest Pinning Execution while the accepted artifact is absent.
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

- chosen strategy for `wasm-pack` compatibility:
  Rust upgrade, pinned compatible `wasm-pack`, pinned CI image, internal cache,
  or preinstalled toolchain;
- explicit policy for whether local developer provisioning or CI is canonical;
- version policy for `rustc`, `cargo`, `wasm-pack`, and
  `wasm32-unknown-unknown`;
- `wasm:readiness-smoke` remains the source for availability;
- root checks remain independent from WASM tooling;
- artifact production remains blocked until the toolchain is actually
  available;
- digest status remains `pending` unless a real artifact exists;
- explicit blocker status for native evidence, WASM evidence, parity, drift,
  thresholds, accepted manifest, and default-measurer replacement;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.
