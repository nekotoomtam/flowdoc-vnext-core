# Text Engine WASM Artifact Production Retry Gate

Status: text engine WASM artifact production retry gate after bindgen export
dependency.

This gate uses the Text Engine WASM Bindgen Export Dependency Gate as the
source of truth. It reruns package-local readiness, retries the accepted
`wasm:build` command because readiness reports `toolchainReady=true`, and
records the produced package-local artifact without computing or pinning
sha256.

## Evidence Reviewed

- `docs/TEXT_ENGINE_WASM_BINDGEN_EXPORT_DEPENDENCY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-bindgen-export-dependency.v1.json`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-production-retry.v1.json`
- `packages/text-engine-rust-wasm/package.json`
- `packages/text-engine-rust-wasm/rust-shaper/Cargo.toml`
- `packages/text-engine-rust-wasm/rust-shaper/src/lib.rs`
- `packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs`

The source gate resolved the prior `wasm-bindgen` blocker by adding
`wasm-bindgen = "0.2"` package-locally and exposing only minimal
`#[wasm_bindgen]` readiness/version exports.

## Readiness Confirmed

Before attempting artifact production, package-local readiness reported:

- `wasmPackAvailable=true`;
- `wasmPackVersion="wasm-pack 0.15.0"`;
- `wasm32UnknownUnknownInstalled=true`;
- `toolchainReady=true`;
- `canProduceArtifactNow=true`;
- `digestStatus="pending"`;
- `sha256=null`.

Root checks remain independent from `wasm-pack`, the WASM target, readiness
smoke, WASM build, and artifacts.

## Build Attempt

Executed:

```text
npm.cmd --prefix packages/text-engine-rust-wasm run wasm:build
```

Underlying package-local command:

```text
wasm-pack build rust-shaper --target web --out-dir ../pkg --out-name flowdoc_text_engine
```

Result:

```text
succeeded
```

The build compiled the package-local Rust crate for the WASM target, installed
the required `wasm-bindgen` glue, ran wasm optimization, and emitted the
generated package under:

```text
packages/text-engine-rust-wasm/pkg/
```

This gate does not execute the generated WASM artifact from
`@flowdoc/vnext-core`, does not load the artifact as production measurement,
and does not compute sha256.

## Artifact Result

Accepted artifact path:

```text
packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm
```

Result:

- `artifactProduced=true`;
- `artifactExists=true`;
- `artifactPointer="packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm"`;
- `retentionPointer="packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm"`;
- `fileSizeBytes=13782`;
- `digestStatus="pending"`;
- `sha256=null`.

Generated package metadata shape:

| File | Size |
|---|---:|
| `.gitignore` | 1 |
| `flowdoc_text_engine.d.ts` | 1529 |
| `flowdoc_text_engine.js` | 5258 |
| `flowdoc_text_engine_bg.wasm` | 13782 |
| `flowdoc_text_engine_bg.wasm.d.ts` | 404 |
| `package.json` | 314 |

The generated package manifest records:

- `name="flowdoc-rustybuzz-smoke"`;
- `type="module"`;
- `version="0.0.0"`;
- `main="flowdoc_text_engine.js"`;
- `types="flowdoc_text_engine.d.ts"`.

## Package-Local Summary

Artifact production retry summary:

```text
packages/text-engine-rust-wasm/fixtures/wasm-artifact-production-retry.v1.json
```

The summary records:

- `sourceBindgenExportDependencySummaryId="text-engine-wasm-bindgen-export-dependency-v1"`;
- `readinessBeforeBuild.toolchainReady=true`;
- `buildAttempt.attempted=true`;
- `buildAttempt.exitCode=0`;
- `buildAttempt.status="succeeded"`;
- `artifact.artifactProduced=true`;
- `artifact.artifactPointer="packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm"`;
- `artifact.fileSizeBytes=13782`;
- `generatedPackageMetadataShape.status="generated"`;
- `digestPolicy.digestStatus="pending"`;
- `digestPolicy.sha256=null`;
- `digestPolicy.sha256ComputedThisPhase=false`;
- `rawEvidenceIncluded=false`.

## Next Recommended Work

Proceed to:

```text
Artifact Digest Pinning Execution
```

Reason:

- the accepted artifact now exists at the package-local retained pointer;
- sha256 has not been computed or pinned in this gate;
- digest status remains `pending`.

Native evidence, WASM evidence, native/WASM parity summaries,
renderer-backed drift summaries, numeric thresholds, accepted manifests,
production binding, and default-measurer replacement remain blocked until
their dedicated phases.

## Explicit Non-Work

- No `wasm-pack` requirement in root checks.
- No `wasm32-unknown-unknown` requirement in root checks.
- No rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`.
- No fake WASM artifact.
- No fake sha256.
- No sha256 compute or pinning.
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

- Latest package-local readiness was confirmed before build.
- `wasm:build` was attempted only after `toolchainReady=true`.
- The attempt stayed package-local.
- The accepted artifact exists at
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`.
- Artifact file size and generated package metadata shape are recorded in a
  JSON-safe package-local summary.
- No fake artifact or fake sha256 was produced.
- Root checks remain independent from WASM tooling and artifact production.

## FAIL-BLOCKER

No blocker prevents completing this artifact production retry gate.

Artifact Digest Pinning Execution remains pending, not failed, because sha256
has not been computed or pinned yet.

Production/default measurement replacement remains blocked because digest is
pending, native/WASM evidence is blocked, parity is not-run, renderer drift is
unknown, numeric thresholds are blocked, and no accepted summary manifest
exists.

## RISK

- The generated package metadata is a local `wasm-pack` output and the
  longer-term reproducible CI/image strategy is still not pinned.
- The next digest phase must validate the artifact path and runtime identity
  context before pinning sha256.
- The generated WASM boundary is still a readiness/version export only; it is
  not measurement evidence.

## UNKNOWN

- Final artifact sha256.
- Whether the generated artifact digest matches the runtime identity context
  required by the pinning policy.
- Native evidence, WASM evidence, parity, drift, and threshold outcomes.
- Browser/worker loading semantics for the generated package.

## Files Changed

- `docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_RETRY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-production-retry.v1.json`
- package-local generated output under `packages/text-engine-rust-wasm/pkg/`
- `packages/text-engine-rust-wasm/README.md`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/textEngineWasmArtifactProductionRetryGate.test.ts`
- prior pointer guard tests

## Behavior Changed

- Package-local `wasm:build` now succeeds after the bindgen dependency/export
  gate.
- A real package-local WASM artifact is produced at the accepted path.
- No runtime measurement behavior changed.
- No root-core WASM or text engine execution was added.
- No digest was pinned.

## Tests Run

- `npm.cmd --prefix packages/text-engine-rust-wasm run wasm:readiness-smoke`
- `npm.cmd --prefix packages/text-engine-rust-wasm run wasm:build`
- `Get-Item packages\text-engine-rust-wasm\pkg\flowdoc_text_engine_bg.wasm`
- `npm.cmd test -- tests/textEngineWasmArtifactProductionRetryGate.test.ts`
- `npm.cmd test -- tests/textEngineWasmArtifactProductionRetryGate.test.ts tests/textEngineWasmBindgenExportDependencyGate.test.ts tests/textEngineWasmToolchainRustUpgradeExecutionGate.test.ts tests/textEngineWasmToolchainVersionCompatibilityGate.test.ts tests/textEngineWasmToolchainProvisioningExecutionGate.test.ts tests/textEngineWasmToolchainProvisioningBootstrapGate.test.ts tests/textEngineWasmArtifactProductionGate.test.ts tests/textEngineWasmToolchainAcquisitionGate.test.ts tests/textEngineWasmToolchainOptionalReadinessSmoke.test.ts tests/textEngineWasmBuildToolchainReadinessGate.test.ts tests/textEngineWasmArtifactBuildOutputGate.test.ts tests/textEngineWasmArtifactDigestPinningGate.test.ts tests/internalAlphaCloseAuditConsolidation.test.ts tests/v1HardeningBacklogTriageGate.test.ts tests/measurementDigestParityDriftHardeningGate.test.ts tests/v1MeasurementFixtureEvidenceMatrixGate.test.ts tests/measurementEvidenceSummaryManifestGate.test.ts tests/measurementEvidenceSummaryManifestFixtureStubGate.test.ts tests/measurementEvidenceCoverageGapTriageGate.test.ts tests/textEngineRuntimeIdentityDigestEvidenceBuilderGate.test.ts tests/textEngineRuntimeIdentityDigestEvidencePopulationGate.test.ts tests/textEngineAdapterPackageScaffold.test.ts tests/textEngineRustybuzzRawMapping.test.ts tests/textEngineRustybuzzSmokeCorpus.test.ts tests/textEngineRustybuzzSmokePackage.test.ts`
- `npm.cmd run check`
- `git diff --check`

## Risks Left

- Pin sha256 only in the next dedicated digest execution phase.
- Keep raw native/WASM/parity/drift evidence outside root tests/docs.
- Keep default-measurer replacement blocked until a later explicit binding
  phase.
- Keep production measurement binding blocked until digest, evidence, parity,
  drift, thresholds, and accepted manifest gates pass.

## Intentionally Not Changed

- No `wasm-pack` requirement in root checks.
- No `wasm32-unknown-unknown` requirement in root checks.
- No rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`.
- No fake WASM artifact or fake sha256.
- No sha256 compute or pinning.
- No `measureVNextText(...)` default replacement.
- No pagination mutation.
- No production renderer-backed measurement binding.
- No production PDF/DOCX renderer.
- No backend route/server/storage/auth/authz behavior.
- No production contenteditable implementation.
- No package/document schema change.
- No collaboration/offline behavior.
- No legacy editor runtime copy.
