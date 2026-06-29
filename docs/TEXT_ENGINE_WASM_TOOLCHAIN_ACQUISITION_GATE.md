# Text Engine WASM Toolchain Acquisition Gate

Status: Phase 193 text engine WASM toolchain acquisition gate.

Phase 193 decides how the package-local WASM toolchain becomes available for
future artifact builds. It uses Phase 192 as the source of truth for the
accepted `wasm-pack` build path and the accepted artifact output path:

```text
packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm
```

This phase does not install `wasm-pack`, does not install
`wasm32-unknown-unknown`, does not produce a WASM artifact, and does not pin a
sha256 digest. It adds only package-local acquisition metadata and an optional
diagnostic script that can report unavailable tooling without failing root
checks.

## Evidence Reviewed

- `docs/CURRENT_STATUS.md` and `docs/NEXT_PHASE_POINTER.md` identify Phase
  193 as the current toolchain acquisition gate.
- `docs/TEXT_ENGINE_WASM_BUILD_TOOLCHAIN_READINESS_GATE.md` accepts
  `wasm-pack` as the build path, keeps direct Cargo plus `wasm-bindgen` as a
  deferred alternate, and records the missing toolchain.
- `packages/text-engine-rust-wasm/fixtures/wasm-build-toolchain-readiness.v1.json`
  records `toolchainReady=false`, `crateTargetShapeReady=true`,
  `wasm-pack` unavailable, and `wasm32-unknown-unknown` absent.
- `packages/text-engine-rust-wasm/package.json` owns package-local scripts.
- `packages/text-engine-rust-wasm/rust-shaper/Cargo.toml` already has the
  minimal `flowdoc_text_engine` `cdylib`/`rlib` target from Phase 192.

## Accepted Acquisition Path

Accepted `wasm-pack` availability path:

```text
developer-or-ci-bootstrap
```

Accepted provisioning command, to be run only by a package-local developer or
CI bootstrap step outside root checks:

```text
cargo install wasm-pack --locked
```

Policy:

- `wasm-pack` is a package-local toolchain prerequisite, not a root package
  dependency.
- Root `npm.cmd run check` must not install or require `wasm-pack`.
- Artifact production remains blocked until the package-local diagnostic
  reports `wasmPackAvailable=true`.
- The exact `wasm-pack` version remains pending/unknown in this phase.
- A later phase must capture and pin the exact `wasm-pack --version` output
  before artifact production is accepted.

## Rust Target Provisioning Path

Accepted Rust target provisioning path:

```text
rustup target add wasm32-unknown-unknown
```

Policy:

- the target is provisioned by developer or CI bootstrap for the package-local
  text-engine lane;
- root `npm.cmd run check` must not install or require the target;
- artifact production remains blocked until the package-local diagnostic
  reports `wasm32UnknownUnknownInstalled=true`;
- installed target evidence remains JSON-safe summary metadata.

## Diagnostic Script

Package-local diagnostic script:

```text
packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs
```

Package-local command:

```text
cd packages/text-engine-rust-wasm
npm run wasm:check-toolchain
```

The diagnostic checks:

- `cargo --version`;
- `rustup target list --installed`;
- `wasm-pack --version`;
- `wasm-bindgen --version` as a deferred alternate-path signal.

The diagnostic exit policy is `always-zero`. Missing `wasm-pack` or missing
`wasm32-unknown-unknown` is reported as JSON-safe blocked status, not as a root
test failure.

## Package-Local Summary

Acquisition summary:

```text
packages/text-engine-rust-wasm/fixtures/wasm-toolchain-acquisition.v1.json
```

The summary records:

- `acceptedBuildPath="wasm-pack"`;
- `wasmPackAcquisition.currentStatus="unavailable"`;
- `wasmPackAcquisition.versionPolicy.status="pending-until-installed"`;
- `rustupTargetProvisioning.currentStatus="missing"`;
- `diagnostic.exitPolicy="always-zero"`;
- `rootCheck.requiresWasmPack=false`;
- `rootCheck.requiresWasm32UnknownUnknown=false`;
- `artifactPolicy.canProduceArtifactNow=false`;
- `digestPolicy.digestStatus="pending"`;
- `sha256=null`;
- `rawEvidenceIncluded=false`;
- `productionReady=false`;
- `defaultMeasurerReplacement=false`.

## Artifact And Digest Status

Artifact production remains blocked. No artifact is written under
`packages/text-engine-rust-wasm/pkg/`.

Digest pinning remains blocked because no real artifact exists at the accepted
package-local output path.

## JSON-Safe Root Summary

Root docs/tests consume only JSON-safe summaries and retention pointers. The
Phase 193 summary keeps raw native/WASM/renderer evidence and executable
artifact bytes outside root tests/docs.

No raw glyph facts, native output, WASM output, renderer output, PDF bytes, or
WASM artifact bytes are added to root tests/docs.

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

## Recommended Next Phase

Proceed to Phase 194: Text Engine WASM Toolchain Optional Readiness Smoke.

Reason:

- Phase 193 defines the acquisition/provisioning policy and diagnostic script;
- the next safe step is a package-local optional readiness smoke that runs the
  diagnostic, records JSON-safe availability, and still does not require an
  artifact if the toolchain remains unavailable.

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

- `wasm-pack` acquisition path is defined as developer/CI bootstrap outside
  root checks.
- `wasm-pack` version policy is defined and remains pending until installed.
- `wasm32-unknown-unknown` provisioning policy is defined through `rustup`.
- Root `npm.cmd run check` remains independent from `wasm-pack` and the WASM
  target.
- Package-local diagnostic script and `wasm:check-toolchain` metadata are
  added.
- Diagnostic unavailable status is JSON-safe and non-fatal.
- Artifact production and digest pinning remain blocked.
- Root docs/tests remain limited to JSON-safe summaries and retention
  pointers.

## FAIL-BLOCKER

No blocker prevents completing this acquisition gate.

Producing the WASM artifact is still blocked by missing `wasm-pack`, missing
`wasm32-unknown-unknown`, and an unpinned `wasm-pack` version.

Digest pinning remains blocked because no real artifact exists at the accepted
package-local output path.

## RISK

- `cargo install wasm-pack --locked` may require network access or a CI cache
  decision in a later phase.
- The accepted provisioning command may need replacement with a prebuilt
  binary, pinned CI image, or internal tool cache.
- The exact `wasm-pack` version may affect emitted JS/package metadata.
- Future toolchain diagnostics can drift if local Rust installations differ.

## UNKNOWN

- Final `wasm-pack` version.
- Final owner for developer-machine provisioning.
- Final owner for CI/bootstrap provisioning.
- Whether direct Cargo plus `wasm-bindgen` becomes necessary later.
- Whether the package-local diagnostic should write a generated summary file
  in Phase 194.
- Final sha256 digest.

## Files Changed

- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_ACQUISITION_GATE.md`
- `packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs`
- `packages/text-engine-rust-wasm/package.json`
- `packages/text-engine-rust-wasm/README.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-acquisition.v1.json`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/textEngineWasmToolchainAcquisitionGate.test.ts`
- prior pointer guard tests

## Behavior Changed

- No runtime measurement behavior changed.
- No root-core WASM or text engine execution was added.
- Package-local `wasm:check-toolchain` can report JSON-safe toolchain
  readiness.
- Current-state pointers move from Phase 193 to Phase 194.

## Tests Run

- `npm.cmd --prefix packages/text-engine-rust-wasm run wasm:check-toolchain`
- `npm.cmd test -- tests/textEngineWasmToolchainAcquisitionGate.test.ts tests/textEngineWasmBuildToolchainReadinessGate.test.ts tests/textEngineWasmArtifactBuildOutputGate.test.ts tests/textEngineWasmArtifactDigestPinningGate.test.ts tests/textEngineRuntimeIdentityDigestEvidencePopulationGate.test.ts tests/textEngineRuntimeIdentityDigestEvidenceBuilderGate.test.ts tests/measurementEvidenceCoverageGapTriageGate.test.ts tests/measurementEvidenceSummaryManifestFixtureStubGate.test.ts tests/measurementEvidenceSummaryManifestGate.test.ts tests/v1MeasurementFixtureEvidenceMatrixGate.test.ts tests/measurementDigestParityDriftHardeningGate.test.ts tests/v1HardeningBacklogTriageGate.test.ts tests/internalAlphaCloseAuditConsolidation.test.ts`
- `npm.cmd run check`
- `npm.cmd test -- tests/textEngineWasmToolchainAcquisitionGate.test.ts`

## Risks Left

- Provision `wasm-pack` and `wasm32-unknown-unknown` in a later package-local
  or CI/bootstrap phase.
- Capture and pin the exact `wasm-pack` version before artifact production.
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
