# Next Phase Pointer

Status: current after Phase 193.

## Next Phase

Phase 194: Text Engine WASM Toolchain Optional Readiness Smoke.

## Why This Is Next

Phase 193 defines how the package-local WASM toolchain becomes available
without making root checks depend on it:

```text
cd packages/text-engine-rust-wasm
npm run wasm:check-toolchain
```

```text
packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs
```

The diagnostic reports `wasm-pack` and `wasm32-unknown-unknown` availability
as JSON-safe status and exits zero. Phase 193 keeps `wasm-pack` acquisition as
developer/CI bootstrap outside root checks, keeps exact `wasm-pack` version
pinning pending until installed, and keeps `rustup target add
wasm32-unknown-unknown` as the accepted target provisioning path.

The next safe step is an optional package-local readiness smoke that runs this
diagnostic and records JSON-safe availability. If the toolchain is still
unavailable, the smoke must report blockers without requiring an artifact.

Native evidence, WASM evidence, native/WASM parity summaries,
renderer-backed drift summaries, numeric thresholds, accepted manifests,
production measurement binding, and default-measurer replacement all remain
blocked until later phases.

## Inputs

- `docs/CURRENT_STATUS.md`
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

- package-local WASM toolchain acquisition/provisioning decision;
- package-local optional diagnostic/readiness smoke summary;
- explicit status for `wasm-pack` and `wasm32-unknown-unknown` availability;
- package-local summary update if safe;
- artifact output remains absent unless the environment is ready and artifact
  production is explicitly in scope;
- digest status remains `pending` unless a real artifact exists and sha256 is
  explicitly in scope;
- explicit blocker status for native evidence, WASM evidence, parity, drift,
  thresholds, accepted manifest, and default-measurer replacement;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.
