# Next Phase Pointer

Status: current after Phase 192.

## Next Phase

Phase 193: Text Engine WASM Toolchain Acquisition Gate.

## Why This Is Next

Phase 192 makes the package-local WASM crate target shape minimally ready and
accepts the `wasm-pack` path for the Phase 190/191 output path:

```text
cd packages/text-engine-rust-wasm
wasm-pack build rust-shaper --target web --out-dir ../pkg --out-name flowdoc_text_engine
```

```text
packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm
```

The command cannot run yet because `wasm-pack` is unavailable and
`wasm32-unknown-unknown` is not installed. Phase 192 adds
`rust-shaper/src/lib.rs`, `[lib] crate-type = ["cdylib", "rlib"]`, and
package-local `wasm:build` script metadata, while keeping the native
`main.rs` smoke path intact.

The next safe step is deciding how the package-local toolchain is acquired or
provisioned without making root `npm.cmd run check` depend on `wasm-pack` or
the WASM Rust target. Root docs/tests should continue to receive only
JSON-safe summaries and retention pointers.

Native evidence, WASM evidence, native/WASM parity summaries,
renderer-backed drift summaries, numeric thresholds, accepted manifests,
production measurement binding, and default-measurer replacement all remain
blocked until later phases.

## Inputs

- `docs/CURRENT_STATUS.md`
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
- explicit owner/policy for `wasm-pack` and `wasm32-unknown-unknown`
  availability;
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
