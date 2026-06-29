# Text Engine WASM Toolchain Rust Upgrade Execution Gate

Status: text engine WASM toolchain Rust upgrade execution gate.

This gate uses the Text Engine WASM Toolchain Version Compatibility Gate as
the source of truth. It executes the accepted Rust 1.91+ upgrade strategy and
retries `cargo install wasm-pack --locked` only after the captured `rustc`
version satisfies that minimum.

It does not run `wasm:build`, produce a WASM artifact, compute sha256, or
proceed to artifact digest pinning.

## Evidence Reviewed

- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_VERSION_COMPATIBILITY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-version-compatibility.v1.json`
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_PROVISIONING_EXECUTION_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-execution.v1.json`
- `packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs`
- `packages/text-engine-rust-wasm/package.json`

The source compatibility gate selected:

- immediate strategy: `upgrade-rust-toolchain-to-1.91-plus`;
- minimum Rust version: `1.91`;
- longer-term reproducible strategy: pinned CI image;
- previous toolchain: `rustc 1.88.0`, `cargo 1.88.0`;
- previous `wasm32-unknown-unknown`: installed;
- previous `wasm-pack`: unavailable.

## Execution

The environment allowed execution with explicit escalation for network and
user Rust/Cargo toolchain writes.

Executed:

```text
rustup update stable
```

Result:

```text
rustc 1.96.0 (ac68faa20 2026-05-25)
cargo 1.96.0 (30a34c682 2026-05-25)
```

The captured Rust version is newer than `1.91`, so the gate allowed the
`wasm-pack` retry.

Executed after the Rust version check passed:

```text
cargo install wasm-pack --locked
```

Result:

```text
wasm-pack 0.15.0
```

The `wasm32-unknown-unknown` target remains installed.

## Readiness Smoke

The package-local readiness smoke was rerun after `wasm-pack` installation:

```text
npm.cmd --prefix packages/text-engine-rust-wasm run wasm:readiness-smoke
```

JSON-safe result:

- `wasmPackAvailable=true`;
- `wasmPackVersion="wasm-pack 0.15.0"`;
- `wasm32UnknownUnknownInstalled=true`;
- `toolchainReady=true`;
- `canProduceArtifactNow=true`;
- `artifactProduced=false`;
- `digestStatus="pending"`;
- `sha256=null`.

The smoke remains package-local and exits zero. Root `npm run check` must not
require `wasm-pack`, the WASM target, the smoke, the build, or an artifact.

## Package-Local Summary

Rust upgrade execution summary:

```text
packages/text-engine-rust-wasm/fixtures/wasm-toolchain-rust-upgrade-execution.v1.json
```

The summary records:

- `rustUpgrade.command="rustup update stable"`;
- `rustUpgrade.status="succeeded"`;
- `versionAfterUpgrade.rustc="rustc 1.96.0 (ac68faa20 2026-05-25)"`;
- `versionAfterUpgrade.cargo="cargo 1.96.0 (30a34c682 2026-05-25)"`;
- `versionAfterUpgrade.rustcMeetsMinimum=true`;
- `wasmPackRetry.command="cargo install wasm-pack --locked"`;
- `wasmPackRetry.status="installed"`;
- `wasmPackRetry.capturedVersion="wasm-pack 0.15.0"`;
- `postExecutionReadiness.toolchainReady=true`;
- `artifactPolicy.canRetryArtifactProduction=true`;
- `artifactPolicy.artifactProduced=false`;
- `digestPolicy.digestStatus="pending"`;
- `digestPolicy.sha256=null`;
- `rawEvidenceIncluded=false`.

## Next Recommended Work

Proceed to:

```text
Text Engine WASM Artifact Production Retry Gate
```

That next gate may run the package-local `wasm:build` command because
`toolchainReady=true`, but it must produce the artifact only under:

```text
packages/text-engine-rust-wasm/pkg/
```

Accepted artifact path:

```text
packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm
```

Artifact Digest Pinning Execution remains blocked until a real artifact exists.

## Downstream Blockers

These remain blocked:

- artifact digest pinning;
- native evidence;
- WASM evidence;
- native/WASM parity summaries;
- renderer-backed drift summaries;
- numeric drift thresholds;
- accepted summary manifest;
- production binding;
- default-measurer replacement.

## Explicit Non-Work

- No `wasm-pack` requirement in root checks.
- No `wasm32-unknown-unknown` requirement in root checks.
- No rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`.
- No fake WASM artifact.
- No fake sha256.
- No artifact production.
- No sha256 pinning.
- No `measureVNextText(...)` default replacement.
- No pagination mutation.
- No production renderer-backed measurement binding.
- No production PDF/DOCX renderer work.
- No backend route/server/storage/auth/authz behavior.
- No production contenteditable implementation.
- No package/document schema change.
- No collaboration/offline behavior.
- No legacy editor runtime copy.

## PASS

- Rust upgrade execution was allowed and completed.
- `rustc` now reports `1.96.0`, satisfying the `1.91+` minimum.
- `cargo` now reports `1.96.0`.
- `wasm32-unknown-unknown` remains installed.
- `cargo install wasm-pack --locked` was retried only after the Rust version
  requirement passed.
- `wasm-pack --version` reports `wasm-pack 0.15.0`.
- Package-local `wasm:readiness-smoke` reports `toolchainReady=true`.
- Artifact production is now allowed only as the next dedicated retry gate.
- Root checks remain independent from WASM tooling.

## FAIL-BLOCKER

Artifact Digest Pinning Execution remains blocked because no real artifact
exists at:

```text
packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm
```

Remaining blockers:

- `artifact-production-retry-not-yet-run`;
- `accepted-artifact-path-not-produced`;
- `sha256-not-computed`.

## RISK

- The local Rust stable toolchain changed from `1.88.0` to `1.96.0`.
- The reproducible CI/image strategy is still not pinned.
- Artifact production may still fail in the next gate if the crate or
  `wasm-pack` output shape needs more package-local changes.
- `wasm-bindgen` CLI is still not separately available, though the accepted
  build path is `wasm-pack`.

## UNKNOWN

- Final artifact existence.
- Final artifact file size.
- Final artifact sha256.
- Final generated package metadata shape.
- Final pinned CI image digest or immutable runner id.
- Native evidence, WASM evidence, parity, drift, and threshold outcomes.

## Files Changed

- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_RUST_UPGRADE_EXECUTION_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-rust-upgrade-execution.v1.json`
- `packages/text-engine-rust-wasm/README.md`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/textEngineWasmToolchainRustUpgradeExecutionGate.test.ts`
- prior pointer guard tests

## Behavior Changed

- User toolchain state changed: Rust stable upgraded and `wasm-pack 0.15.0`
  installed.
- Package-local readiness now reports `toolchainReady=true`.
- No runtime measurement behavior changed.
- No root-core WASM or text engine execution was added.
- No artifact was produced.
- No digest was pinned.

## Tests Run

- `npm.cmd test -- tests/textEngineWasmToolchainRustUpgradeExecutionGate.test.ts`
- `npm.cmd test -- tests/textEngineWasmToolchainRustUpgradeExecutionGate.test.ts tests/textEngineWasmToolchainVersionCompatibilityGate.test.ts tests/textEngineWasmToolchainProvisioningExecutionGate.test.ts tests/textEngineWasmToolchainProvisioningBootstrapGate.test.ts tests/textEngineWasmArtifactProductionGate.test.ts tests/textEngineWasmToolchainAcquisitionGate.test.ts tests/textEngineWasmToolchainOptionalReadinessSmoke.test.ts tests/textEngineWasmBuildToolchainReadinessGate.test.ts tests/textEngineWasmArtifactBuildOutputGate.test.ts tests/textEngineWasmArtifactDigestPinningGate.test.ts tests/internalAlphaCloseAuditConsolidation.test.ts tests/v1HardeningBacklogTriageGate.test.ts tests/measurementDigestParityDriftHardeningGate.test.ts tests/v1MeasurementFixtureEvidenceMatrixGate.test.ts tests/measurementEvidenceSummaryManifestGate.test.ts tests/measurementEvidenceSummaryManifestFixtureStubGate.test.ts tests/measurementEvidenceCoverageGapTriageGate.test.ts tests/textEngineRuntimeIdentityDigestEvidenceBuilderGate.test.ts tests/textEngineRuntimeIdentityDigestEvidencePopulationGate.test.ts tests/textEngineAdapterPackageScaffold.test.ts tests/textEngineRustybuzzRawMapping.test.ts tests/textEngineRustybuzzSmokeCorpus.test.ts tests/textEngineRustybuzzSmokePackage.test.ts`
- `npm.cmd run check`
- `Test-Path packages\text-engine-rust-wasm\pkg\flowdoc_text_engine_bg.wasm`
- `git diff --check`

## Risks Left

- Retry artifact production only in the next dedicated gate.
- Produce a real artifact only under `packages/text-engine-rust-wasm/pkg/`.
- Pin sha256 only after a real artifact exists and context matches.
- Keep raw native/WASM/parity/drift evidence outside root tests/docs.
- Keep default-measurer replacement blocked until a later explicit binding
  phase.

## Intentionally Not Changed

- No `wasm-pack` requirement in root checks.
- No `wasm32-unknown-unknown` requirement in root checks.
- No rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`.
- No fake WASM artifact or fake sha256.
- No artifact production or sha256 pinning.
- No `measureVNextText(...)` default replacement.
- No pagination mutation.
- No production renderer-backed measurement binding.
- No production PDF/DOCX renderer.
- No backend route/server/storage/auth/authz behavior.
- No production contenteditable implementation.
- No package/document schema change.
- No collaboration/offline behavior.
- No legacy editor runtime copy.
