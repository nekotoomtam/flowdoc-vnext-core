# Next Phase Pointer

Status: current after Text Engine WASM Toolchain Provisioning Bootstrap Gate.

## Next Phase

Text Engine WASM Toolchain Provisioning Execution Gate.

Phase 196: Artifact Digest Pinning Execution remains blocked.

## Why This Is Next

The provisioning bootstrap gate defines the package-local strategy without
installing tooling:

```text
cd packages/text-engine-rust-wasm
npm run wasm:bootstrap-plan
```

The plan/check script records:

- `provisioningDecision.strategy="developer-or-ci-bootstrap"`;
- `acceptedProvisioning.wasmPack.command="cargo install wasm-pack --locked"`;
- `acceptedProvisioning.wasm32UnknownUnknown.command="rustup target add wasm32-unknown-unknown"`;
- `versionPolicy.rustc.status="observed"`;
- `versionPolicy.cargo.status="observed"`;
- `versionPolicy.wasmPack.status="pending-until-installed"`;
- `versionPolicy.rustTarget.status="missing"`;
- `artifactProductionBlocked=true`;
- `digestPinningBlocked=true`.

The next safe step is an execution gate that may run provisioning only with
explicit developer/CI approval for network and system toolchain changes. After
provisioning, `wasm:readiness-smoke` must report `toolchainReady=true` before
artifact production can be retried.

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

- approved or explicitly blocked provisioning execution for `wasm-pack`;
- approved or explicitly blocked provisioning execution for
  `wasm32-unknown-unknown`;
- exact installed `wasm-pack`, `rustc`, and `cargo` version capture if
  provisioning succeeds;
- `wasm:readiness-smoke` rerun after provisioning;
- root checks remain independent from WASM tooling;
- artifact production remains blocked until the toolchain is actually
  available;
- digest status remains `pending` unless a real artifact exists;
- explicit blocker status for native evidence, WASM evidence, parity, drift,
  thresholds, accepted manifest, and default-measurer replacement;
- explicit non-work;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN;
- updated current-status pointer.
