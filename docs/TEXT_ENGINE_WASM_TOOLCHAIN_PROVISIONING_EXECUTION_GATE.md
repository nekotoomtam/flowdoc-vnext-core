# Text Engine WASM Toolchain Provisioning Execution Gate

Status: text engine WASM toolchain provisioning execution gate.

This gate uses the Text Engine WASM Toolchain Provisioning Bootstrap Gate as
the source of truth. It executes the accepted package-local provisioning path
where the environment allows it, records the exact result as JSON-safe
summary metadata, and keeps root checks independent from WASM tooling.

Phase 196 Artifact Digest Pinning Execution remains blocked until a real
artifact exists at:

```text
packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm
```

## Evidence Reviewed

- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_PROVISIONING_BOOTSTRAP_GATE.md` selects
  developer/CI bootstrap as the provisioning strategy.
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-bootstrap.v1.json`
  records `cargo install wasm-pack --locked` and
  `rustup target add wasm32-unknown-unknown` as the accepted default
  provisioning commands.
- `packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs` remains
  the source for package-local toolchain availability.
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-production.v1.json`
  keeps artifact production blocked until the toolchain is ready.

## Provisioning Execution Result

Environment execution was allowed through explicit sandbox escalation for
network and user Rust toolchain writes.

`wasm-pack` provisioning was attempted:

```text
cargo install wasm-pack --locked
```

Result:

- `attempted=true`;
- `exitCode=1`;
- `downloadedCandidateVersion="wasm-pack v0.15.0"`;
- `installed=false`;
- `capturedVersion=null`;
- `status="failed-rustc-version-incompatible"`;
- failure summary: `cargo-platform@0.3.3` requires `rustc 1.91`, while the
  current toolchain reports `rustc 1.88.0`.

The Rust target provisioning was attempted:

```text
rustup target add wasm32-unknown-unknown
```

Result:

- `attempted=true`;
- `exitCode=0`;
- `status="installed"`;
- `target="wasm32-unknown-unknown"`;
- `installed=true`.

No raw command output is stored in root docs/tests.

## Post-Execution Readiness Smoke

After provisioning execution, package-local readiness was rerun:

```text
cd packages/text-engine-rust-wasm
npm run wasm:readiness-smoke
```

Observed post-execution facts:

- `cargoAvailable=true`;
- `rustupAvailable=true`;
- `wasmPackAvailable=false`;
- `wasmPackVersion=null`;
- `wasmBindgenCliAvailable=false`;
- `installedRustTargets=["wasm32-unknown-unknown", "x86_64-pc-windows-msvc"]`;
- `wasm32UnknownUnknownInstalled=true`;
- `toolchainReady=false`;
- `canProduceArtifactNow=false`;
- `blockedReasons=["wasm-pack-not-available"]`.

## Package-Local Summary

Provisioning execution summary:

```text
packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-execution.v1.json
```

The summary records:

- `execution.allowedInEnvironment=true`;
- `execution.executionSkipped=false`;
- `wasmPackProvisioning.status="failed-rustc-version-incompatible"`;
- `wasmPackProvisioning.installed=false`;
- `wasm32TargetProvisioning.status="installed"`;
- `postExecutionReadiness.toolchainReady=false`;
- `artifactPolicy.canRetryArtifactProduction=false`;
- `digestPolicy.digestStatus="pending"`;
- `digestPolicy.sha256=null`;
- `rawEvidenceIncluded=false`.

## Next Recommended Work

Do not proceed to Artifact Digest Pinning Execution.

Do not retry artifact production while `toolchainReady=false`.

Recommended next work:

```text
Text Engine WASM Toolchain Version Compatibility Gate
```

That gate should choose one accepted strategy before the next provisioning
retry:

- upgrade the Rust toolchain to a version compatible with the latest
  `wasm-pack`;
- pin a compatible `wasm-pack` version explicitly;
- use a pinned CI image;
- use an internal tool cache;
- use a preinstalled developer toolchain.

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

- No root check dependency on `wasm-pack`.
- No root check dependency on `wasm32-unknown-unknown`.
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

- Provisioning execution permission was checked through sandbox escalation.
- `cargo install wasm-pack --locked` was attempted.
- `rustup target add wasm32-unknown-unknown` was attempted.
- `wasm32-unknown-unknown` is now installed.
- `wasm:readiness-smoke` was rerun after provisioning.
- JSON-safe provisioning execution summary was added.
- Root checks remain independent from WASM tooling.
- Artifact production and digest pinning remain blocked.

## FAIL-BLOCKER

`wasm-pack` is still unavailable.

The attempted `cargo install wasm-pack --locked` path downloaded
`wasm-pack v0.15.0` but failed because a dependency requires `rustc 1.91`
and the current toolchain reports `rustc 1.88.0`.

Artifact production remains blocked by:

- `wasm-pack-install-failed-rustc-version-incompatible`;
- `rustc-1.88.0-below-wasm-pack-0.15.0-dependency-requirement-1.91`;
- `wasm-pack-not-available`;
- `wasm-pack-version-unpinned`;
- `accepted-artifact-path-not-produced`;
- `sha256-not-computed`.

Artifact Digest Pinning Execution remains blocked because no real artifact
exists.

## RISK

- Upgrading Rust locally may affect other Rust work on the machine.
- Pinning an older `wasm-pack` may hide future compatibility issues.
- A pinned CI image or internal tool cache may be safer for reproducible
  artifact production.
- Current package-local readiness now differs from historical Phase 194/195
  unavailable-target evidence because the target was successfully installed.

## UNKNOWN

- Final `wasm-pack` version.
- Whether the accepted strategy is Rust upgrade, pinned `wasm-pack`, pinned
  CI image, internal cache, or preinstalled toolchain.
- Whether developer machines or CI become the canonical artifact producer.
- Final artifact size.
- Final sha256 digest.

## Files Changed

- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_PROVISIONING_EXECUTION_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-execution.v1.json`
- `packages/text-engine-rust-wasm/README.md`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/textEngineWasmToolchainProvisioningExecutionGate.test.ts`
- prior pointer guard tests

## Behavior Changed

- The local Rust toolchain now has `wasm32-unknown-unknown` installed.
- No runtime measurement behavior changed.
- No root-core WASM or text engine execution was added.
- No artifact was produced.
- No digest was pinned.

## Tests Run

- `npm.cmd --prefix packages/text-engine-rust-wasm run wasm:readiness-smoke`
- `cargo install wasm-pack --locked` (expected blocker observed:
  `cargo-platform@0.3.3` requires `rustc 1.91`; current toolchain is
  `rustc 1.88.0`)
- `rustup target add wasm32-unknown-unknown`
- `wasm-pack --version` (expected unavailable after failed install)
- `rustup target list --installed`
- `cargo --version`
- `npm.cmd test -- tests/textEngineWasmToolchainProvisioningExecutionGate.test.ts`
- `npm.cmd test -- tests/textEngineWasmToolchainProvisioningExecutionGate.test.ts tests/textEngineWasmToolchainProvisioningBootstrapGate.test.ts tests/textEngineWasmArtifactProductionGate.test.ts tests/textEngineWasmToolchainAcquisitionGate.test.ts tests/textEngineWasmToolchainOptionalReadinessSmoke.test.ts tests/textEngineWasmBuildToolchainReadinessGate.test.ts tests/textEngineWasmArtifactBuildOutputGate.test.ts tests/textEngineWasmArtifactDigestPinningGate.test.ts tests/internalAlphaCloseAuditConsolidation.test.ts tests/v1HardeningBacklogTriageGate.test.ts tests/measurementDigestParityDriftHardeningGate.test.ts tests/v1MeasurementFixtureEvidenceMatrixGate.test.ts tests/measurementEvidenceSummaryManifestGate.test.ts tests/measurementEvidenceSummaryManifestFixtureStubGate.test.ts tests/measurementEvidenceCoverageGapTriageGate.test.ts tests/textEngineRuntimeIdentityDigestEvidenceBuilderGate.test.ts tests/textEngineRuntimeIdentityDigestEvidencePopulationGate.test.ts tests/textEngineAdapterPackageScaffold.test.ts tests/textEngineRustybuzzRawMapping.test.ts tests/textEngineRustybuzzSmokeCorpus.test.ts tests/textEngineRustybuzzSmokePackage.test.ts`
- `npm.cmd run check`

## Risks Left

- Choose a version compatibility strategy before retrying `wasm-pack`
  provisioning.
- Rerun `wasm:readiness-smoke` after that strategy is applied.
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
