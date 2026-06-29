# Text Engine WASM Artifact Production Gate

Status: Phase 195 text engine WASM artifact production gate.

Phase 195 uses Phase 194 as the source of truth. It checks whether the
package-local WASM toolchain is available before artifact production. The
current readiness smoke still reports missing `wasm-pack` and missing
`wasm32-unknown-unknown`, so this phase does not run `wasm:build` and does not
produce a WASM artifact.

Accepted future artifact path:

```text
packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm
```

## Evidence Reviewed

- `docs/CURRENT_STATUS.md` and `docs/NEXT_PHASE_POINTER.md` identified Phase
  195 as the artifact production gate.
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_OPTIONAL_READINESS_SMOKE.md` required the
  artifact gate to build only when the package-local toolchain is available.
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-optional-readiness-smoke.v1.json`
  recorded `wasmPackAvailable=false`,
  `wasm32UnknownUnknownInstalled=false`, `toolchainReady=false`,
  `canProduceArtifactNow=false`, `artifactProduced=false`,
  `artifactPointer=null`, `digestStatus="pending"`, and `sha256=null`.
- `npm.cmd --prefix packages/text-engine-rust-wasm run wasm:readiness-smoke`
  was run again for Phase 195 and still reported
  `wasm-pack-not-available` and
  `wasm32-unknown-unknown-target-not-installed`.
- `packages/text-engine-rust-wasm/package.json` owns the package-local
  `wasm:build` command, but the command remains gated by toolchain
  availability.

## Production Decision

Decision: `blocked-not-produced`.

The artifact production command is not run in this phase because:

- `wasm-pack` is unavailable;
- `wasm32-unknown-unknown` is not installed;
- the exact `wasm-pack` version is still unpinned;
- no real artifact exists at the accepted package-local output path.

No fake artifact is produced. No file is created under
`packages/text-engine-rust-wasm/pkg/`.

## Package-Local Summary

Artifact production summary:

```text
packages/text-engine-rust-wasm/fixtures/wasm-artifact-production.v1.json
```

The summary records:

- `acceptedArtifactPath="packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm"`;
- `acceptedBuild.packageScript="wasm:build"`;
- `acceptedBuild.runStatus="not-run-toolchain-unavailable"`;
- `readinessSource.wasmPackAvailable=false`;
- `readinessSource.wasm32UnknownUnknownInstalled=false`;
- `readinessSource.toolchainReady=false`;
- `artifact.artifactProduced=false`;
- `artifact.artifactExists=false`;
- `artifact.artifactPointer=null`;
- `artifact.retentionPointer=null`;
- `artifact.fileSizeBytes=null`;
- `artifact.rawArtifactIncluded=false`;
- `digest.digestStatus="pending"`;
- `digest.sha256=null`;
- `digest.phase196ArtifactDigestPinningExecution="blocked"`;
- `rawEvidenceIncluded=false`;
- `productionReady=false`;
- `defaultMeasurerReplacement=false`.

## Artifact And Digest Status

Artifact production remains blocked. The accepted artifact path is still a
future output path, not evidence of a produced artifact.

Digest pinning remains blocked because no real artifact exists. Phase 196:
Artifact Digest Pinning Execution must not proceed until a later gate produces
the accepted artifact under `packages/text-engine-rust-wasm/pkg/`.

## Next Recommended Work

Do not proceed to Phase 196.

Recommended next work:

```text
Text Engine WASM Toolchain Provisioning Bootstrap Gate
```

That gate should decide or execute the package-local provisioning path for
`wasm-pack` and `wasm32-unknown-unknown` without making root checks depend on
those tools. After the toolchain is available, rerun the artifact production
gate before digest pinning.

## Downstream Blockers

These remain blocked:

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
- No raw native/WASM evidence in root tests/docs.
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

- Phase 194 readiness was checked before artifact production.
- The current package-local readiness smoke was run and still exits zero.
- Artifact production is correctly skipped because the toolchain is
  unavailable.
- Artifact existence, file size, pointer, and retention pointer are recorded
  as JSON-safe absent values.
- Digest status remains `pending` with `sha256=null`.
- Root `npm.cmd run check` remains independent from `wasm-pack`, the WASM
  target, the readiness smoke, the WASM build, and the artifact.
- Root docs/tests remain limited to JSON-safe summaries and retention
  pointers.

## FAIL-BLOCKER

Producing the WASM artifact is blocked by:

- `wasm-pack-not-available`;
- `wasm-pack-version-unpinned`;
- `wasm32-unknown-unknown-target-not-installed`;
- `accepted-artifact-path-not-produced`;
- `sha256-not-computed`.

Phase 196 digest pinning is blocked because no real artifact exists.

## RISK

- Toolchain provisioning may require network access, a pinned binary, or a CI
  cache decision.
- The final `wasm-pack` version may affect emitted JS and WASM package
  metadata.
- A later artifact production phase must ensure output stays under
  `packages/text-engine-rust-wasm/pkg/`.
- Repeating Phase 195 before provisioning will continue to be blocker-only.

## UNKNOWN

- Final `wasm-pack` version.
- Final developer-machine provisioning owner.
- Final CI/bootstrap provisioning owner.
- Whether provisioning uses `cargo install wasm-pack --locked`, a cached
  binary, or a pinned CI image.
- Final WASM artifact size.
- Final sha256 digest.

## Files Changed

- `docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-production.v1.json`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/textEngineWasmArtifactProductionGate.test.ts`
- prior pointer guard tests

## Behavior Changed

- No runtime measurement behavior changed.
- No root-core WASM or text engine execution was added.
- No artifact was produced.
- Current-state pointers move from Phase 195 to the toolchain provisioning
  bootstrap recommendation while Phase 196 remains blocked.

## Tests Run

- `npm.cmd --prefix packages/text-engine-rust-wasm run wasm:readiness-smoke`
- `npm.cmd test -- tests/textEngineWasmArtifactProductionGate.test.ts tests/textEngineWasmToolchainOptionalReadinessSmoke.test.ts tests/textEngineWasmToolchainAcquisitionGate.test.ts tests/textEngineWasmBuildToolchainReadinessGate.test.ts tests/textEngineWasmArtifactBuildOutputGate.test.ts tests/textEngineWasmArtifactDigestPinningGate.test.ts tests/textEngineRuntimeIdentityDigestEvidencePopulationGate.test.ts tests/textEngineRuntimeIdentityDigestEvidenceBuilderGate.test.ts tests/measurementEvidenceCoverageGapTriageGate.test.ts tests/measurementEvidenceSummaryManifestFixtureStubGate.test.ts tests/measurementEvidenceSummaryManifestGate.test.ts tests/v1MeasurementFixtureEvidenceMatrixGate.test.ts tests/measurementDigestParityDriftHardeningGate.test.ts tests/v1HardeningBacklogTriageGate.test.ts tests/internalAlphaCloseAuditConsolidation.test.ts tests/textEngineAdapterPackageScaffold.test.ts tests/textEngineRustybuzzRawMapping.test.ts tests/textEngineRustybuzzSmokeCorpus.test.ts tests/textEngineRustybuzzSmokePackage.test.ts`
- `npm.cmd run check`
- `npm.cmd test -- tests/textEngineWasmArtifactProductionGate.test.ts`

## Risks Left

- Provision `wasm-pack` and `wasm32-unknown-unknown` in a later package-local
  or CI/bootstrap phase.
- Rerun artifact production only after the toolchain is actually available.
- Produce a real artifact only under `packages/text-engine-rust-wasm/pkg/`.
- Pin sha256 only after a real artifact exists and context matches.
- Keep raw native/WASM/parity/drift evidence outside root tests/docs.
- Keep default-measurer replacement blocked until a later explicit binding
  phase.

## Intentionally Not Changed

- No `wasm-pack` requirement in root checks.
- No `wasm32-unknown-unknown` requirement in root checks.
- No rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`.
- No raw native/WASM evidence in root tests/docs.
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
