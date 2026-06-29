# Text Engine WASM Bindgen Export Dependency Gate

Status: text engine WASM bindgen export dependency gate.

This gate uses the Text Engine WASM Artifact Production Retry Gate as the
source of truth. It resolves the package-local `wasm-bindgen` dependency and
minimal export boundary required by `wasm-pack`, without retrying artifact
production and without changing root checks or production measurement binding.

## Evidence Reviewed

- `docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_RETRY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-production-retry.v1.json`
- `packages/text-engine-rust-wasm/rust-shaper/Cargo.toml`
- `packages/text-engine-rust-wasm/rust-shaper/Cargo.lock`
- `packages/text-engine-rust-wasm/rust-shaper/src/lib.rs`
- `packages/text-engine-rust-wasm/rust-shaper/src/main.rs`

The source gate recorded:

- `wasm:build` reached the package-local WASM compile step;
- `wasm-pack` then failed because `rust-shaper/Cargo.toml` lacked
  `wasm-bindgen = "0.2"`;
- the accepted artifact remained absent;
- digest pinning remained blocked.

## Dependency Decision

Package-local dependency added:

```toml
wasm-bindgen = "0.2"
```

Resolved lockfile version:

```text
wasm-bindgen 0.2.126
```

Scope:

- dependency is added only under
  `packages/text-engine-rust-wasm/rust-shaper`;
- root `npm run check` does not require `wasm-bindgen`;
- no production measurement binding is added.

## Export Boundary

The package-local WASM library now exposes only two non-production
`#[wasm_bindgen]` functions:

```text
flowdoc_text_engine_wasm_readiness_marker() -> u32
flowdoc_text_engine_wasm_boundary_version() -> String
```

The boundary version remains:

```text
flowdoc-text-engine-wasm-boundary-v1
```

The WASM library does not execute rustybuzz shaping, ICU4X, pagination, or
production measurement. The native `src/main.rs` rustybuzz smoke path remains
intact.

## Verification

Package-local compile checks:

```text
cargo check --manifest-path packages/text-engine-rust-wasm/rust-shaper/Cargo.toml --target wasm32-unknown-unknown
cargo check --manifest-path packages/text-engine-rust-wasm/rust-shaper/Cargo.toml
```

Both checks pass.

This gate intentionally does not run:

```text
npm.cmd --prefix packages/text-engine-rust-wasm run wasm:build
```

The accepted artifact is still absent:

```text
packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm
```

## Package-Local Summary

Bindgen/export dependency summary:

```text
packages/text-engine-rust-wasm/fixtures/wasm-bindgen-export-dependency.v1.json
```

The summary records:

- `dependencyDecision.status="added-package-local"`;
- `dependencyDecision.requestedVersion="0.2"`;
- `dependencyDecision.resolvedVersion="0.2.126"`;
- `exportBoundary.status="minimal-non-production"`;
- `exportBoundary.noShapingExecution=true`;
- `nativeSmokePath.status="intact"`;
- `verification.wasmBuildRetriedThisPhase=false`;
- `artifactPolicy.artifactProduced=false`;
- `digestPolicy.digestStatus="pending"`;
- `digestPolicy.sha256=null`;
- `rawEvidenceIncluded=false`.

## Next Recommended Work

Proceed to:

```text
Text Engine WASM Artifact Production Retry Gate
```

Artifact Digest Pinning Execution remains blocked until the accepted artifact
exists.

## Downstream Blockers

These remain blocked:

- Artifact Digest Pinning Execution;
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
- No sha256 compute or pinning.
- No artifact production retry in this gate.
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

- `wasm-bindgen = "0.2"` is added package-locally.
- Cargo resolves `wasm-bindgen 0.2.126`.
- Minimal `#[wasm_bindgen]` exports exist for readiness and boundary version.
- The WASM library does not execute rustybuzz shaping or ICU4X.
- Native `main.rs` smoke path remains intact.
- WASM target and native cargo checks pass.
- Root checks remain independent from WASM tooling.

## FAIL-BLOCKER

Artifact Digest Pinning Execution remains blocked because no real artifact
exists.

Remaining blockers:

- `artifact-production-retry-not-yet-run-after-bindgen`;
- `accepted-artifact-path-not-produced`;
- `sha256-not-computed`.

## RISK

- The next artifact production retry may expose generated package metadata or
  export-shape issues.
- Returning a `String` from the boundary version export requires generated
  `wasm-bindgen` glue, which is expected but still unreviewed until artifact
  production succeeds.
- The reproducible CI/image strategy is still not pinned.

## UNKNOWN

- Final artifact existence.
- Final artifact file size.
- Final artifact sha256.
- Final generated JS/TypeScript boundary shape.
- Native evidence, WASM evidence, parity, drift, and threshold outcomes.

## Files Changed

- `docs/TEXT_ENGINE_WASM_BINDGEN_EXPORT_DEPENDENCY_GATE.md`
- `packages/text-engine-rust-wasm/rust-shaper/Cargo.toml`
- `packages/text-engine-rust-wasm/rust-shaper/Cargo.lock`
- `packages/text-engine-rust-wasm/rust-shaper/src/lib.rs`
- `packages/text-engine-rust-wasm/fixtures/wasm-bindgen-export-dependency.v1.json`
- `packages/text-engine-rust-wasm/README.md`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/textEngineWasmBindgenExportDependencyGate.test.ts`
- prior pointer guard tests

## Behavior Changed

- Package-local Rust crate can compile the minimal `wasm-bindgen` export
  boundary.
- No runtime measurement behavior changed.
- No root-core WASM or text engine execution was added.
- No artifact was produced.
- No digest was pinned.

## Tests Run

- `cargo check --manifest-path packages/text-engine-rust-wasm/rust-shaper/Cargo.toml --target wasm32-unknown-unknown`
- `cargo check --manifest-path packages/text-engine-rust-wasm/rust-shaper/Cargo.toml`
- `npm.cmd test -- tests/textEngineWasmBindgenExportDependencyGate.test.ts`
- `npm.cmd test -- tests/textEngineWasmBindgenExportDependencyGate.test.ts tests/textEngineWasmArtifactProductionRetryGate.test.ts tests/textEngineWasmToolchainRustUpgradeExecutionGate.test.ts tests/textEngineWasmToolchainVersionCompatibilityGate.test.ts tests/textEngineWasmToolchainProvisioningExecutionGate.test.ts tests/textEngineWasmToolchainProvisioningBootstrapGate.test.ts tests/textEngineWasmArtifactProductionGate.test.ts tests/textEngineWasmToolchainAcquisitionGate.test.ts tests/textEngineWasmToolchainOptionalReadinessSmoke.test.ts tests/textEngineWasmBuildToolchainReadinessGate.test.ts tests/textEngineWasmArtifactBuildOutputGate.test.ts tests/textEngineWasmArtifactDigestPinningGate.test.ts tests/internalAlphaCloseAuditConsolidation.test.ts tests/v1HardeningBacklogTriageGate.test.ts tests/measurementDigestParityDriftHardeningGate.test.ts tests/v1MeasurementFixtureEvidenceMatrixGate.test.ts tests/measurementEvidenceSummaryManifestGate.test.ts tests/measurementEvidenceSummaryManifestFixtureStubGate.test.ts tests/measurementEvidenceCoverageGapTriageGate.test.ts tests/textEngineRuntimeIdentityDigestEvidenceBuilderGate.test.ts tests/textEngineRuntimeIdentityDigestEvidencePopulationGate.test.ts tests/textEngineAdapterPackageScaffold.test.ts tests/textEngineRustybuzzRawMapping.test.ts tests/textEngineRustybuzzSmokeCorpus.test.ts tests/textEngineRustybuzzSmokePackage.test.ts`
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
- No sha256 compute or pinning.
- No artifact production retry.
- No `measureVNextText(...)` default replacement.
- No pagination mutation.
- No production renderer-backed measurement binding.
- No production PDF/DOCX renderer.
- No backend route/server/storage/auth/authz behavior.
- No production contenteditable implementation.
- No package/document schema change.
- No collaboration/offline behavior.
- No legacy editor runtime copy.
