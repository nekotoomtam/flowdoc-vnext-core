# Text Engine WASM Toolchain Provisioning Bootstrap Gate

Status: text engine WASM toolchain provisioning bootstrap gate.

This gate uses Phase 195 as the source of truth. Phase 195 did not produce a
WASM artifact because `wasm-pack` is unavailable and
`wasm32-unknown-unknown` is not installed. This gate decides the package-local
provisioning/bootstrap path and adds a JSON-safe plan/check script, but it
does not install tooling and does not proceed to Artifact Digest Pinning
Execution.

Phase 196 remains blocked until a real artifact exists at:

```text
packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm
```

## Evidence Reviewed

- `docs/CURRENT_STATUS.md` and `docs/NEXT_PHASE_POINTER.md` identify this
  provisioning/bootstrap gate as the next work after Phase 195.
- `docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_GATE.md` records
  `artifactProduced=false`, `artifactPointer=null`,
  `fileSizeBytes=null`, `digestStatus="pending"`, and `sha256=null`.
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-production.v1.json`
  records `acceptedBuild.runStatus="not-run-toolchain-unavailable"` and
  keeps Phase 196 blocked.
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-optional-readiness-smoke.v1.json`
  records `wasmPackAvailable=false`,
  `wasm32UnknownUnknownInstalled=false`, and `toolchainReady=false`.
- `packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs` remains
  the readiness source for availability.

## Accepted Provisioning Path

Accepted provisioning strategy:

```text
developer-or-ci-bootstrap
```

Accepted `wasm-pack` default path:

```text
cargo install wasm-pack --locked
```

Accepted `wasm32-unknown-unknown` target path:

```text
rustup target add wasm32-unknown-unknown
```

Allowed alternates:

- pinned CI image;
- internal tool cache;
- preinstalled developer toolchain.

Policy:

- provisioning is package-local or CI bootstrap work, not root check work;
- root `npm.cmd run check` must not install or require `wasm-pack`;
- root `npm.cmd run check` must not install or require
  `wasm32-unknown-unknown`;
- `wasm:readiness-smoke` remains the availability source before artifact
  production;
- artifact production remains blocked until readiness reports
  `toolchainReady=true`;
- digest pinning remains blocked until a real artifact exists.

## Package-Local Bootstrap Script

Package-local script:

```text
packages/text-engine-rust-wasm/scripts/plan-wasm-toolchain-bootstrap.mjs
```

Package-local command:

```text
cd packages/text-engine-rust-wasm
npm run wasm:bootstrap-plan
```

The script is plan/check only. It exits zero, reports JSON-safe metadata, and
does not run `cargo install wasm-pack --locked` or
`rustup target add wasm32-unknown-unknown`.

Observed current output:

- `rustc.currentVersion="rustc 1.88.0 (6b00bc388 2025-06-23)"`;
- `cargo.currentVersion="cargo 1.88.0 (873a06493 2025-05-10)"`;
- `wasmPack.currentVersion=null`;
- `wasmPack.status="pending-until-installed"`;
- `rustTarget.status="missing"`;
- `availability.wasmPackAvailable=false`;
- `availability.wasm32UnknownUnknownInstalled=false`;
- `availability.toolchainReady=false`;
- `artifactProductionBlocked=true`;
- `digestPinningBlocked=true`;
- `artifactProduced=false`;
- `digestStatus="pending"`;
- `sha256=null`;
- `rawEvidenceIncluded=false`.

## Package-Local Summary

Provisioning/bootstrap summary:

```text
packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-bootstrap.v1.json
```

The summary records:

- `bootstrap.mode="plan-and-check-only"`;
- `bootstrap.installExecuted=false`;
- `bootstrap.scriptInstallsTooling=false`;
- `provisioningDecision.strategy="developer-or-ci-bootstrap"`;
- `acceptedProvisioning.wasmPack.command="cargo install wasm-pack --locked"`;
- `acceptedProvisioning.wasm32UnknownUnknown.command="rustup target add wasm32-unknown-unknown"`;
- `versionPolicy.wasmPack.status="pending-until-installed"`;
- `versionPolicy.rustc.status="observed"`;
- `versionPolicy.cargo.status="observed"`;
- `versionPolicy.rustTarget.status="missing"`;
- `rootCheck.requiresWasmPack=false`;
- `rootCheck.requiresWasm32UnknownUnknown=false`;
- `artifactProductionBlocked=true`;
- `digestPinningBlocked=true`;
- `artifactProduced=false`;
- `digestStatus="pending"`;
- `sha256=null`.

## Next Recommended Work

Do not proceed to Artifact Digest Pinning Execution.

Recommended next work:

```text
Text Engine WASM Toolchain Provisioning Execution Gate
```

That gate may run provisioning only with explicit developer/CI approval for
network/system toolchain changes. After provisioning succeeds,
`wasm:readiness-smoke` must report `toolchainReady=true` before artifact
production is retried.

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

- Accepted provisioning path for `wasm-pack` is defined.
- Accepted provisioning path for `wasm32-unknown-unknown` is defined.
- Developer/CI bootstrap is selected as the strategy.
- Cached binary, pinned CI image, and preinstalled developer toolchain are
  allowed alternatives.
- Package-local `wasm:bootstrap-plan` is added as a plan/check script.
- `wasm-pack`, `rustc`, `cargo`, and Rust target version policies are defined.
- `wasm:readiness-smoke` remains the source for availability.
- Root checks remain independent from WASM tooling.
- Artifact production and digest pinning remain blocked.

## FAIL-BLOCKER

Provisioning execution is not performed in this gate because it may require
network access and system toolchain changes.

Artifact production remains blocked by:

- `wasm-pack-not-available`;
- `wasm-pack-version-unpinned`;
- `wasm32-unknown-unknown-target-not-installed`;
- `accepted-artifact-path-not-produced`;
- `sha256-not-computed`.

Artifact Digest Pinning Execution remains blocked because no real artifact
exists.

## RISK

- `cargo install wasm-pack --locked` may require network access and may vary
  by Rust registry/cache availability.
- A pinned CI image or internal tool cache may be preferable for reproducible
  builds.
- The exact `wasm-pack` version may affect generated WASM package metadata.
- The Rust toolchain may need a later version policy tighter than current
  observed `rustc`/`cargo` strings.

## UNKNOWN

- Final `wasm-pack` version.
- Final CI/bootstrap owner.
- Whether provisioning uses `cargo install`, cached binary, or pinned image.
- Whether developer machines or CI become the canonical artifact producer.
- Final artifact size.
- Final sha256 digest.

## Files Changed

- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_PROVISIONING_BOOTSTRAP_GATE.md`
- `packages/text-engine-rust-wasm/scripts/plan-wasm-toolchain-bootstrap.mjs`
- `packages/text-engine-rust-wasm/package.json`
- `packages/text-engine-rust-wasm/README.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-bootstrap.v1.json`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/textEngineWasmToolchainProvisioningBootstrapGate.test.ts`
- prior pointer guard tests

## Behavior Changed

- No runtime measurement behavior changed.
- No root-core WASM or text engine execution was added.
- No provisioning command was executed.
- Package-local `wasm:bootstrap-plan` can print the bootstrap plan and
  observed version policy.
- Current-state pointers move from the provisioning bootstrap gate to the
  provisioning execution gate while Artifact Digest Pinning Execution remains
  blocked.

## Tests Run

- `npm.cmd --prefix packages/text-engine-rust-wasm run wasm:bootstrap-plan`
- `npm.cmd test -- tests/textEngineWasmToolchainProvisioningBootstrapGate.test.ts tests/textEngineWasmArtifactProductionGate.test.ts tests/textEngineWasmToolchainOptionalReadinessSmoke.test.ts tests/textEngineWasmToolchainAcquisitionGate.test.ts tests/textEngineWasmBuildToolchainReadinessGate.test.ts tests/textEngineWasmArtifactBuildOutputGate.test.ts tests/textEngineWasmArtifactDigestPinningGate.test.ts tests/textEngineRuntimeIdentityDigestEvidencePopulationGate.test.ts tests/textEngineRuntimeIdentityDigestEvidenceBuilderGate.test.ts tests/measurementEvidenceCoverageGapTriageGate.test.ts tests/measurementEvidenceSummaryManifestFixtureStubGate.test.ts tests/measurementEvidenceSummaryManifestGate.test.ts tests/v1MeasurementFixtureEvidenceMatrixGate.test.ts tests/measurementDigestParityDriftHardeningGate.test.ts tests/v1HardeningBacklogTriageGate.test.ts tests/internalAlphaCloseAuditConsolidation.test.ts tests/textEngineAdapterPackageScaffold.test.ts tests/textEngineRustybuzzRawMapping.test.ts tests/textEngineRustybuzzSmokeCorpus.test.ts tests/textEngineRustybuzzSmokePackage.test.ts`
- `npm.cmd run check`
- `npm.cmd test -- tests/textEngineWasmToolchainProvisioningBootstrapGate.test.ts`

## Risks Left

- Execute provisioning only in a later approved developer/CI bootstrap gate.
- Rerun `wasm:readiness-smoke` after provisioning.
- Rerun artifact production only after `toolchainReady=true`.
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
