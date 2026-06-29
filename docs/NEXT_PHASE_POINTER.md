# Next Phase Pointer

Status: current after Text Engine WASM Bindgen Export Dependency Gate.

## Next Phase

Text Engine WASM Artifact Production Retry Gate.

Phase 196: Artifact Digest Pinning Execution remains blocked.

## Why This Is Next

The bindgen export dependency gate resolved the package-local blocker from the
previous artifact production retry:

- `wasm-bindgen = "0.2"` is now present in
  `packages/text-engine-rust-wasm/rust-shaper/Cargo.toml`;
- `Cargo.lock` records `wasm-bindgen 0.2.126`;
- `src/lib.rs` exposes only minimal `#[wasm_bindgen]` functions for readiness
  marker and boundary version;
- the WASM library does not execute rustybuzz shaping, ICU4X, pagination, or
  production measurement;
- native `src/main.rs` rustybuzz smoke path remains intact;
- package-local WASM target and native cargo checks pass.

This gate intentionally did not retry artifact production. The accepted
artifact still does not exist:

```text
packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm
```

The next safe step is to retry package-local artifact production. Artifact
Digest Pinning Execution must not proceed until a real artifact exists at the
accepted path.

Native evidence, WASM evidence, native/WASM parity summaries,
renderer-backed drift summaries, numeric thresholds, accepted manifests,
production measurement binding, and default-measurer replacement all remain
blocked until later phases.

## Inputs

- `docs/CURRENT_STATUS.md`
- `docs/TEXT_ENGINE_WASM_BINDGEN_EXPORT_DEPENDENCY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-bindgen-export-dependency.v1.json`
- `docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_RETRY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-production-retry.v1.json`
- `packages/text-engine-rust-wasm/rust-shaper/Cargo.toml`
- `packages/text-engine-rust-wasm/rust-shaper/Cargo.lock`
- `packages/text-engine-rust-wasm/rust-shaper/src/lib.rs`
- `packages/text-engine-rust-wasm/rust-shaper/src/main.rs`
- `packages/text-engine-rust-wasm/package.json`
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

- rerun package-local readiness;
- run package-local `wasm:build`;
- produce the artifact only under
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- if production fails, record the exact package-local blocker;
- record artifact existence, file size, generated package metadata shape, and
  retention pointer in JSON-safe package-local summary metadata;
- keep digest status `pending` unless a later explicit pinning phase computes
  sha256 from a real artifact;
- root checks remain independent from WASM tooling;
- explicit blocker status for native evidence, WASM evidence, parity, drift,
  thresholds, accepted manifest, and default-measurer replacement;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.
