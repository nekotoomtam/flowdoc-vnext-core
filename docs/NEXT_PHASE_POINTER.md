# Next Phase Pointer

Status: current after Text Engine WASM Toolchain Version Compatibility Gate.

## Next Phase

Text Engine WASM Toolchain Rust Upgrade Execution Gate.

Phase 196: Artifact Digest Pinning Execution remains blocked.

## Why This Is Next

The version compatibility gate compared five strategies after
`cargo install wasm-pack --locked` selected `wasm-pack v0.15.0` and failed
because `cargo-platform@0.3.3` requires `rustc 1.91`, while this environment
reports `rustc 1.88.0`.

Selected strategies:

- immediate: upgrade Rust toolchain to `1.91+`;
- longer-term reproducible: pinned CI image or equivalent immutable runner.

The `wasm32-unknown-unknown` target is already installed, but `wasm-pack` is
still unavailable and package-local readiness still reports:

```text
toolchainReady=false
```

The next safe step is an execution gate for the accepted immediate strategy.
That gate may upgrade or install Rust 1.91+ only with explicit approval for
toolchain changes. It must then retry `cargo install wasm-pack --locked`,
capture `wasm-pack --version`, and rerun `wasm:readiness-smoke`.

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
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_VERSION_COMPATIBILITY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-version-compatibility.v1.json`
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_PROVISIONING_EXECUTION_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-execution.v1.json`
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_PROVISIONING_BOOTSTRAP_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-bootstrap.v1.json`
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

- approved or explicitly blocked Rust 1.91+ upgrade execution;
- exact `rustc` and `cargo` version capture after the upgrade attempt;
- `cargo install wasm-pack --locked` retry only if `rustc` is `1.91+`;
- `wasm-pack --version` capture if install succeeds;
- `wasm:readiness-smoke` rerun after `wasm-pack` is available;
- root checks remain independent from WASM tooling;
- artifact production remains blocked until the toolchain is actually
  available;
- digest status remains `pending` unless a real artifact exists;
- explicit blocker status for native evidence, WASM evidence, parity, drift,
  thresholds, accepted manifest, and default-measurer replacement;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.
