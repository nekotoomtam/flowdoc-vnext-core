# Next Phase Pointer

Status: current after Phase 191.

## Next Phase

Phase 192: Text Engine WASM Build Toolchain Readiness Gate.

## Why This Is Next

Phase 191 defines the accepted package-local WASM build command and output
path:

```text
cd packages/text-engine-rust-wasm
wasm-pack build rust-shaper --target web --out-dir ../pkg --out-name flowdoc_text_engine
```

```text
packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm
```

The command cannot run yet because `wasm-pack` is unavailable,
`wasm32-unknown-unknown` is not installed, and `rust-shaper` is still a binary
native smoke crate without a WASM-ready library/export boundary.

The next safe step is to make the package-local WASM toolchain and crate target
readiness explicit without executing text engines in `@flowdoc/vnext-core`.
Root docs/tests should continue to receive only JSON-safe summaries and
retention pointers.

Native evidence, WASM evidence, native/WASM parity summaries,
renderer-backed drift summaries, numeric thresholds, accepted manifests,
production measurement binding, and default-measurer replacement all remain
blocked until later phases.

## Inputs

- `docs/CURRENT_STATUS.md`
- `docs/TEXT_ENGINE_WASM_ARTIFACT_BUILD_OUTPUT_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-build-output.v1.json`
- `docs/TEXT_ENGINE_WASM_ARTIFACT_DIGEST_PINNING_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_POPULATION_GATE.md`
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_BUILDER_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`
- `packages/text-engine-rust-wasm/rust-shaper/Cargo.toml`
- `packages/text-engine-rust-wasm/rust-shaper/src/main.rs`
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

- package-local WASM build toolchain/crate readiness decision;
- explicit blocker status for `wasm-pack`, Rust target, crate target type, and
  export boundary;
- package-local summary update if safe;
- artifact output remains absent unless the environment/crate is ready;
- digest status remains `pending` unless a real artifact exists and sha256 is
  explicitly in scope;
- explicit blocker status for native evidence, WASM evidence, parity, drift,
  thresholds, accepted manifest, and default-measurer replacement;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.
