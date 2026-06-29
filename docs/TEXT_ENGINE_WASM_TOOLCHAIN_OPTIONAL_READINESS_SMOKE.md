# Text Engine WASM Toolchain Optional Readiness Smoke

Status: Phase 194 text engine WASM toolchain optional readiness smoke.

Phase 194 uses Phase 193 as the source of truth. It runs the package-local
WASM toolchain diagnostic through an optional smoke wrapper, records a
JSON-safe availability summary, and keeps root checks independent from
`wasm-pack`, `wasm32-unknown-unknown`, and WASM artifact production.

This phase does not produce a WASM artifact and does not pin sha256. The smoke
completed, but the package-local toolchain is still unavailable in the current
environment.

## Evidence Reviewed

- `docs/CURRENT_STATUS.md` and `docs/NEXT_PHASE_POINTER.md` identified Phase
  194 as the optional readiness smoke.
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_ACQUISITION_GATE.md` defined
  `wasm-pack` acquisition and `wasm32-unknown-unknown` provisioning outside
  root checks.
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-acquisition.v1.json`
  recorded `wasm-pack` unavailable, the WASM target missing, and artifact
  production blocked.
- `packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs` reports
  JSON-safe toolchain availability and exits zero.
- `packages/text-engine-rust-wasm/package.json` now exposes the package-local
  `wasm:readiness-smoke` wrapper.

## Smoke Command

Package-local command:

```text
cd packages/text-engine-rust-wasm
npm run wasm:readiness-smoke
```

The wrapper runs:

```text
npm run wasm:check-toolchain
```

Observed result:

- exit code: `0`;
- `cargoAvailable=true`;
- `rustupAvailable=true`;
- `wasmPackAvailable=false`;
- `wasmBindgenCliAvailable=false`;
- `wasm32UnknownUnknownInstalled=false`;
- `toolchainReady=false`;
- `canProduceArtifactNow=false`;
- `artifactProduced=false`;
- `digestStatus="pending"`;
- `sha256=null`;
- `rawEvidenceIncluded=false`.

The command is intentionally package-local. Root `npm.cmd run check` must not
run or require it.

## Package-Local Summary

Optional readiness smoke summary:

```text
packages/text-engine-rust-wasm/fixtures/wasm-toolchain-optional-readiness-smoke.v1.json
```

The summary records:

- `smoke.status="completed-blocked"`;
- `smoke.exitPolicy="always-zero"`;
- `smoke.rootCheckRequiresSmoke=false`;
- `availability.availabilityStatus="unavailable-blocked"`;
- `availability.wasmPackAvailable=false`;
- `availability.wasm32UnknownUnknownInstalled=false`;
- `availability.toolchainReady=false`;
- `artifactPolicy.canProduceArtifactNow=false`;
- `artifactPolicy.artifactProduced=false`;
- `artifactPolicy.artifactPointer=null`;
- `digestPolicy.digestStatus="pending"`;
- `digestPolicy.sha256=null`;
- `rawEvidenceIncluded=false`;
- `productionReady=false`;
- `defaultMeasurerReplacement=false`.

## Artifact And Digest Status

Artifact production remains blocked because `wasm-pack` is unavailable and the
`wasm32-unknown-unknown` target is not installed.

The accepted future artifact path remains:

```text
packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm
```

No file is created at that path in this phase.

Digest pinning remains blocked because no real artifact exists. Placeholder
or pending digest state must not be treated as production-ready evidence.

## Phase 195 Branching Rule

Proceed to Phase 195: Text Engine WASM Artifact Production Gate.

Phase 195 may produce the accepted artifact only if the package-local toolchain
is actually available. If the toolchain is still unavailable, Phase 195 must
record the blocker clearly or propose a dedicated provisioning/bootstrap
phase. Do not continue to digest pinning while this blocker remains.

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

- Package-local `wasm:readiness-smoke` wraps `wasm:check-toolchain`.
- The smoke runs and exits zero.
- JSON-safe availability is recorded.
- Missing `wasm-pack` and missing `wasm32-unknown-unknown` are reported as
  blocked availability, not as root check failures.
- Root `npm.cmd run check` remains independent from `wasm-pack`, the WASM
  target, the readiness smoke, and artifact production.
- Artifact production and digest pinning remain blocked.
- Root docs/tests remain limited to JSON-safe summaries and retention
  pointers.

## FAIL-BLOCKER

No blocker prevents completing the optional readiness smoke gate.

Producing the WASM artifact remains blocked by missing `wasm-pack`, missing
`wasm32-unknown-unknown`, and an unpinned `wasm-pack` version.

Digest pinning remains blocked because no real artifact exists at the accepted
package-local output path.

## RISK

- The next artifact production gate may still be a blocker-only phase if the
  toolchain remains unavailable.
- Installing `wasm-pack` may require network access, a cached binary, or a CI
  bootstrap decision.
- The final `wasm-pack` version can affect emitted WASM package metadata.
- Local developer environments may disagree on installed Rust targets.

## UNKNOWN

- Final `wasm-pack` version.
- Final developer-machine provisioning owner.
- Final CI/bootstrap provisioning owner.
- Whether Phase 195 records only the blocker or introduces a dedicated
  provisioning/bootstrap phase.
- Final sha256 digest.

## Files Changed

- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_OPTIONAL_READINESS_SMOKE.md`
- `packages/text-engine-rust-wasm/package.json`
- `packages/text-engine-rust-wasm/README.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-optional-readiness-smoke.v1.json`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/textEngineWasmToolchainOptionalReadinessSmoke.test.ts`
- prior pointer guard tests

## Behavior Changed

- No runtime measurement behavior changed.
- No root-core WASM or text engine execution was added.
- Package-local `wasm:readiness-smoke` can run the diagnostic through a named
  optional smoke wrapper.
- Current-state pointers move from Phase 194 to Phase 195.

## Tests Run

- `npm.cmd --prefix packages/text-engine-rust-wasm run wasm:readiness-smoke`
- `npm.cmd test -- tests/textEngineWasmToolchainOptionalReadinessSmoke.test.ts tests/textEngineWasmToolchainAcquisitionGate.test.ts tests/textEngineWasmBuildToolchainReadinessGate.test.ts tests/textEngineWasmArtifactBuildOutputGate.test.ts tests/textEngineWasmArtifactDigestPinningGate.test.ts tests/textEngineRuntimeIdentityDigestEvidencePopulationGate.test.ts tests/textEngineRuntimeIdentityDigestEvidenceBuilderGate.test.ts tests/measurementEvidenceCoverageGapTriageGate.test.ts tests/measurementEvidenceSummaryManifestFixtureStubGate.test.ts tests/measurementEvidenceSummaryManifestGate.test.ts tests/v1MeasurementFixtureEvidenceMatrixGate.test.ts tests/measurementDigestParityDriftHardeningGate.test.ts tests/v1HardeningBacklogTriageGate.test.ts tests/internalAlphaCloseAuditConsolidation.test.ts`
- `npm.cmd run check`
- `npm.cmd test -- tests/textEngineWasmToolchainOptionalReadinessSmoke.test.ts`

## Risks Left

- Provision `wasm-pack` and `wasm32-unknown-unknown` in a later package-local
  or CI/bootstrap phase.
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
