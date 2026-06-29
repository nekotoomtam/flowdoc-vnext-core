# Text Engine WASM Build Toolchain Readiness Gate

Status: Phase 192 text engine WASM build toolchain readiness gate.

Phase 192 makes the package-local WASM build toolchain and crate target
readiness explicit without producing a WASM artifact. It uses Phase 191 as the
source of truth for the accepted artifact path:

```text
packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm
```

This phase adds a minimal package-local `rust-shaper` library target and build
script metadata, but keeps artifact production and digest pinning blocked
because `wasm-pack` is unavailable and `wasm32-unknown-unknown` is not
installed.

## Evidence Reviewed

- `docs/CURRENT_STATUS.md` and `docs/NEXT_PHASE_POINTER.md` identify Phase
  192 as the current build toolchain readiness gate.
- `docs/TEXT_ENGINE_WASM_ARTIFACT_BUILD_OUTPUT_GATE.md` defines the accepted
  package-local output path and records the Phase 191 build blockers.
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-build-output.v1.json`
  records the accepted command, `digestStatus="pending"`, and no artifact
  pointer.
- `packages/text-engine-rust-wasm/rust-shaper/Cargo.toml` now declares a
  `cdylib`/`rlib` library target while preserving the native binary smoke
  target.
- `packages/text-engine-rust-wasm/rust-shaper/src/main.rs` remains the native
  rustybuzz smoke entrypoint.
- `packages/text-engine-rust-wasm/rust-shaper/src/lib.rs` exposes only a
  minimal readiness marker and boundary version for future WASM artifact
  builds.

## Accepted Build Path Decision

Decision: `wasm-pack` is the accepted path.

Accepted package-local command:

```text
cd packages/text-engine-rust-wasm
wasm-pack build rust-shaper --target web --out-dir ../pkg --out-name flowdoc_text_engine
```

Why:

- it matches the Phase 190/191 accepted `pkg` output path;
- it keeps wasm-bindgen package metadata owned by the external adapter lane;
- it avoids adding root-core build behavior or production measurement binding.

Direct Cargo plus `wasm-bindgen` remains a deferred alternate. That path would
need separate CLI/package metadata sequencing and `wasm-bindgen` is not
available in this environment.

## Toolchain Readiness

Toolchain status: `blocked`.

Observed facts:

- `cargo` is available;
- `wasm-pack` is not available;
- `wasm-bindgen` CLI is not available;
- installed Rust target observed for this gate: `x86_64-pc-windows-msvc`;
- `wasm32-unknown-unknown` is not installed;
- root `npm.cmd run check` does not require `wasm-pack`;
- root `npm.cmd run check` does not require the WASM Rust target.

## Crate Target Readiness

Crate target shape status: `minimal-ready`.

Phase 192 adds:

- `packages/text-engine-rust-wasm/rust-shaper/src/lib.rs`;
- `[lib] name = "flowdoc_text_engine"`;
- `[lib] crate-type = ["cdylib", "rlib"]`;
- package-local `wasm:build` script metadata.

The native `main.rs` smoke path remains intact. The new `lib.rs` does not
execute rustybuzz, WASM, ICU4X, shaping, line breaking, glyph capture, or
measurement. It exposes only:

- `FLOWDOC_TEXT_ENGINE_WASM_BOUNDARY_VERSION`;
- `flowdoc_text_engine_wasm_readiness_marker`;
- `flowdoc_text_engine_wasm_boundary_version_len`.

## Package-Local Summary

Readiness summary:

```text
packages/text-engine-rust-wasm/fixtures/wasm-build-toolchain-readiness.v1.json
```

The summary records:

- `toolchainReady=false`;
- `crateTargetShapeReady=true`;
- `canProduceArtifactNow=false`;
- `artifactProduced=false`;
- `artifactPointer=null`;
- `digestStatus="pending"`;
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
Phase 192 summary keeps raw native/WASM/renderer evidence and executable
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

Proceed to Phase 193: Text Engine WASM Toolchain Acquisition Gate.

Reason:

- Phase 192 makes the crate target shape minimally ready;
- the accepted `wasm-pack` path still cannot run;
- the next safe work is deciding how `wasm-pack` and
  `wasm32-unknown-unknown` become available without making root checks or
  production binding depend on them.

## Explicit Non-Work

- No rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`.
- No raw native/WASM evidence in root tests/docs.
- No root check dependency on `wasm-pack`.
- No root check dependency on `wasm32-unknown-unknown`.
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

- Package-local WASM build toolchain readiness is defined.
- `wasm-pack` availability is checked and recorded as unavailable.
- `wasm32-unknown-unknown` availability is checked and recorded as absent.
- `wasm-pack` is accepted over direct Cargo plus `wasm-bindgen` for the
  current output path.
- `rust-shaper` now has a minimal `cdylib`/`rlib` library target.
- Native `main.rs` smoke path remains intact.
- Package-local `wasm:build` script metadata is added.
- Root `npm.cmd run check` does not require `wasm-pack` or the WASM target.
- Artifact production and digest pinning remain blocked.
- Root docs/tests remain limited to JSON-safe summaries and retention
  pointers.

## FAIL-BLOCKER

No blocker prevents completing this readiness gate.

Producing the WASM artifact is still blocked by missing `wasm-pack` and
missing `wasm32-unknown-unknown`.

Digest pinning remains blocked because no real artifact exists at the accepted
package-local output path.

## RISK

- The minimal exported marker may need to be replaced with a wasm-bindgen
  export once the real artifact build path is available.
- Choosing `wasm-pack` may need revision if CI or local environment policy
  rejects installing it.
- Future toolchain installation can still introduce version drift.
- The final WASM artifact may need additional JS/package metadata beside the
  `.wasm` file.

## UNKNOWN

- Final `wasm-pack` version and installation owner.
- Final `wasm32-unknown-unknown` target provisioning owner.
- Whether direct Cargo plus `wasm-bindgen` becomes necessary later.
- Final WASM export shape for real measurement evidence.
- Final sha256 digest.
- Whether browser/worker WASM digest evidence becomes release-blocking.

## Files Changed

- `docs/TEXT_ENGINE_WASM_BUILD_TOOLCHAIN_READINESS_GATE.md`
- `packages/text-engine-rust-wasm/rust-shaper/Cargo.toml`
- `packages/text-engine-rust-wasm/rust-shaper/src/lib.rs`
- `packages/text-engine-rust-wasm/package.json`
- `packages/text-engine-rust-wasm/README.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-build-toolchain-readiness.v1.json`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/textEngineWasmBuildToolchainReadinessGate.test.ts`
- prior pointer guard tests

## Behavior Changed

- No runtime measurement behavior changed.
- No root-core WASM or text engine execution was added.
- A package-local Rust library target now exists for future WASM artifact
  builds.
- A package-local `wasm:build` script records the accepted command.
- Current-state pointers move from Phase 192 to Phase 193.

## Tests Run

- `npm.cmd test -- tests/textEngineWasmBuildToolchainReadinessGate.test.ts tests/textEngineWasmArtifactBuildOutputGate.test.ts tests/textEngineWasmArtifactDigestPinningGate.test.ts tests/textEngineRuntimeIdentityDigestEvidencePopulationGate.test.ts tests/textEngineRuntimeIdentityDigestEvidenceBuilderGate.test.ts tests/textEngineRustybuzzSmokePackage.test.ts tests/measurementEvidenceCoverageGapTriageGate.test.ts tests/measurementEvidenceSummaryManifestFixtureStubGate.test.ts tests/measurementEvidenceSummaryManifestGate.test.ts tests/v1MeasurementFixtureEvidenceMatrixGate.test.ts tests/measurementDigestParityDriftHardeningGate.test.ts tests/v1HardeningBacklogTriageGate.test.ts tests/internalAlphaCloseAuditConsolidation.test.ts`
- `cargo build --manifest-path packages/text-engine-rust-wasm/rust-shaper/Cargo.toml`
- `npm.cmd test -- tests/textEngineAdapterPackageScaffold.test.ts tests/textEngineRustybuzzRawMapping.test.ts tests/textEngineRustybuzzSmokeCorpus.test.ts tests/textEngineWasmBuildToolchainReadinessGate.test.ts`
- `npm.cmd run check`
- `npm.cmd test -- tests/textEngineWasmBuildToolchainReadinessGate.test.ts`

## Risks Left

- Decide how to provision `wasm-pack` and `wasm32-unknown-unknown`.
- Produce a real artifact only under `packages/text-engine-rust-wasm/pkg/`.
- Pin sha256 only after a real artifact exists and context matches.
- Keep raw native/WASM/parity/drift evidence outside root tests/docs.
- Keep default-measurer replacement blocked until a later explicit binding
  phase.

## Intentionally Not Changed

- No rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`.
- No raw native/WASM evidence in root tests/docs.
- No root check dependency on `wasm-pack` or `wasm32-unknown-unknown`.
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
