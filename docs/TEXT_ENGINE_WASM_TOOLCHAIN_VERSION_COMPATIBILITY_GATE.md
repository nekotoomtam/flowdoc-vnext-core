# Text Engine WASM Toolchain Version Compatibility Gate

Status: text engine WASM toolchain version compatibility gate.

This gate uses the Text Engine WASM Toolchain Provisioning Execution Gate as
the source of truth. It chooses the next accepted strategy after
`cargo install wasm-pack --locked` selected `wasm-pack v0.15.0` and failed
because `cargo-platform@0.3.3` requires `rustc 1.91`, while this environment
reports `rustc 1.88.0`.

This is a decision gate only. It does not upgrade Rust, retry
`wasm-pack`, produce a WASM artifact, or proceed to digest pinning.

## Evidence Reviewed

- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_PROVISIONING_EXECUTION_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-execution.v1.json`
- `packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs`
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_PROVISIONING_BOOTSTRAP_GATE.md`
- `docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_GATE.md`

Execution facts from the source gate:

- `cargo install wasm-pack --locked` was attempted;
- the attempted install selected `wasm-pack v0.15.0`;
- install failed because `cargo-platform@0.3.3` requires `rustc 1.91`;
- current `rustc` is `rustc 1.88.0 (6b00bc388 2025-06-23)`;
- current `cargo` is `cargo 1.88.0 (873a06493 2025-05-10)`;
- `wasm32-unknown-unknown` is installed;
- `wasm-pack` is not available;
- `toolchainReady=false`.

## Strategy Comparison

1. Upgrade Rust toolchain to 1.91+

   Status: accepted immediate strategy.

   This directly resolves the observed blocker. The next execution gate should
   upgrade or install a Rust toolchain whose `rustc --version` is `1.91` or
   newer, then retry `cargo install wasm-pack --locked`, capture
   `wasm-pack --version`, and rerun `wasm:readiness-smoke`.

   Tradeoff: this changes developer or CI Rust toolchain state, so it must be
   executed only in a dedicated provisioning execution gate.

2. Pin an older compatible `wasm-pack` version

   Status: deferred risk.

   This could avoid a Rust upgrade, but the current evidence does not prove an
   older `wasm-pack` version that is compatible with `rustc 1.88.0` and the
   package output shape. Choosing this now would add version-discovery risk
   and may hide generated package metadata differences.

3. Use a pinned CI image

   Status: accepted long-term reproducible strategy.

   This is the preferred canonical artifact-production strategy once the exact
   versions are known. The image or runner must pin `rustc`, `cargo`,
   `wasm-pack`, the `wasm32-unknown-unknown` target, and the package-local
   readiness smoke output.

4. Use an internal tool cache

   Status: deferred infrastructure strategy.

   A cache can improve repeatability and speed after accepted versions are
   known. It does not solve the compatibility decision by itself.

5. Use a preinstalled developer toolchain

   Status: allowed but not canonical.

   A compatible developer machine may be useful for local unblock attempts,
   but it is too drift-prone to be the canonical artifact producer.

## Accepted Immediate Strategy

Choose:

```text
upgrade-rust-toolchain-to-1.91-plus
```

Accepted next execution path:

```text
Text Engine WASM Toolchain Rust Upgrade Execution Gate
```

Candidate execution commands for that later gate:

```text
rustup update stable
rustup toolchain install 1.91.0
```

The later execution gate must capture:

- `rustc --version`;
- `cargo --version`;
- `cargo install wasm-pack --locked` result;
- `wasm-pack --version`;
- `npm run wasm:readiness-smoke`.

Artifact production may be retried only after:

- `rustc` is `1.91` or newer;
- `wasm-pack --version` exits zero;
- `wasm32-unknown-unknown` remains installed;
- `npm run wasm:readiness-smoke` reports `toolchainReady=true`;
- root `npm run check` remains independent from WASM tooling.

## Accepted Longer-Term Reproducible Strategy

Choose:

```text
pinned-ci-image
```

The pinned CI image, or equivalent immutable runner, should become the
canonical artifact producer after exact tool versions are accepted.

Required pinned facts:

- image digest or immutable runner id;
- `rustc` version;
- `cargo` version;
- `wasm-pack` version;
- `wasm32-unknown-unknown` target presence;
- package-local readiness smoke output;
- artifact output path.

## Package-Local Summary

Compatibility summary:

```text
packages/text-engine-rust-wasm/fixtures/wasm-toolchain-version-compatibility.v1.json
```

The summary records:

- `acceptedImmediateStrategy.id="upgrade-rust-toolchain-to-1.91-plus"`;
- `acceptedImmediateStrategy.minimumRustc="1.91"`;
- `acceptedLongTermStrategy.id="pinned-ci-image"`;
- `currentReadiness.wasm32UnknownUnknownInstalled=true`;
- `currentReadiness.wasmPackAvailable=false`;
- `currentReadiness.toolchainReady=false`;
- `artifactPolicy.canRetryArtifactProduction=false`;
- `digestPolicy.digestStatus="pending"`;
- `digestPolicy.sha256=null`;
- `rawEvidenceIncluded=false`.

## Next Recommended Work

Do not retry artifact production.

Do not proceed to Artifact Digest Pinning Execution.

Recommended next work:

```text
Text Engine WASM Toolchain Rust Upgrade Execution Gate
```

That gate may upgrade or install Rust 1.91+ only with explicit approval for
toolchain changes, then retry `cargo install wasm-pack --locked` and rerun
package-local readiness.

## Downstream Blockers

These remain blocked:

- WASM artifact production;
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

- All five compatibility strategies are compared.
- Immediate strategy is selected: upgrade Rust toolchain to `1.91+`.
- Longer-term reproducible strategy is selected: pinned CI image.
- `wasm32-unknown-unknown` remains recorded as installed.
- Artifact production remains blocked until `wasm-pack` is available and
  readiness reports `toolchainReady=true`.
- Digest pinning remains blocked until a real artifact exists.
- Root checks remain independent from WASM tooling.

## FAIL-BLOCKER

`wasm-pack` is still unavailable.

Artifact production remains blocked by:

- `rust-toolchain-upgrade-execution-not-run`;
- `wasm-pack-not-available`;
- `wasm-pack-version-unpinned`;
- `toolchainReady-false`;
- `accepted-artifact-path-not-produced`;
- `sha256-not-computed`.

Artifact Digest Pinning Execution remains blocked because no real artifact
exists.

## RISK

- Upgrading Rust may affect other Rust work on the developer machine or CI.
- Pinning an older `wasm-pack` remains possible but currently lacks evidence.
- A pinned CI image still needs owner, version, and image digest policy.
- The current `wasm32-unknown-unknown` installed target is environment state,
  so the long-term lane must make that state reproducible.

## UNKNOWN

- Final `rustc` version after upgrade.
- Final `cargo` version after upgrade.
- Final `wasm-pack` version.
- Final CI image digest or runner id.
- Final artifact size.
- Final sha256 digest.

## Files Changed

- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_VERSION_COMPATIBILITY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-version-compatibility.v1.json`
- `packages/text-engine-rust-wasm/README.md`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/textEngineWasmToolchainVersionCompatibilityGate.test.ts`
- prior pointer guard tests

## Behavior Changed

- No runtime measurement behavior changed.
- No root-core WASM or text engine execution was added.
- No Rust upgrade was executed.
- No `wasm-pack` provisioning retry was executed.
- No artifact was produced.
- No digest was pinned.

## Tests Run

- `npm.cmd test -- tests/textEngineWasmToolchainVersionCompatibilityGate.test.ts`
- `npm.cmd test -- tests/textEngineWasmToolchainVersionCompatibilityGate.test.ts tests/textEngineWasmToolchainProvisioningExecutionGate.test.ts tests/textEngineWasmToolchainProvisioningBootstrapGate.test.ts tests/textEngineWasmArtifactProductionGate.test.ts tests/textEngineWasmToolchainAcquisitionGate.test.ts tests/textEngineWasmToolchainOptionalReadinessSmoke.test.ts tests/textEngineWasmBuildToolchainReadinessGate.test.ts tests/textEngineWasmArtifactBuildOutputGate.test.ts tests/textEngineWasmArtifactDigestPinningGate.test.ts tests/internalAlphaCloseAuditConsolidation.test.ts tests/v1HardeningBacklogTriageGate.test.ts tests/measurementDigestParityDriftHardeningGate.test.ts tests/v1MeasurementFixtureEvidenceMatrixGate.test.ts tests/measurementEvidenceSummaryManifestGate.test.ts tests/measurementEvidenceSummaryManifestFixtureStubGate.test.ts tests/measurementEvidenceCoverageGapTriageGate.test.ts tests/textEngineRuntimeIdentityDigestEvidenceBuilderGate.test.ts tests/textEngineRuntimeIdentityDigestEvidencePopulationGate.test.ts tests/textEngineAdapterPackageScaffold.test.ts tests/textEngineRustybuzzRawMapping.test.ts tests/textEngineRustybuzzSmokeCorpus.test.ts tests/textEngineRustybuzzSmokePackage.test.ts`
- `npm.cmd run check`

## Risks Left

- Execute Rust 1.91+ upgrade only in the next approved execution gate.
- Rerun `cargo install wasm-pack --locked` only after the Rust upgrade path is
  accepted for execution.
- Rerun `wasm:readiness-smoke` after `wasm-pack` is available.
- Retry artifact production only after `toolchainReady=true`.
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
