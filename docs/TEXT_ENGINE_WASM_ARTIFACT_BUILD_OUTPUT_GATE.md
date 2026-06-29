# Text Engine WASM Artifact Build Output Gate

Status: Phase 191 text engine WASM artifact build output gate.

Phase 191 defines the package-local WASM build/output path and command for the
accepted artifact path from Phase 190:

```text
packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm
```

The artifact cannot be produced safely in this repository/environment yet. The
build command is blocked because `wasm-pack` is not available, the
`wasm32-unknown-unknown` Rust target is not installed, and the current
`rust-shaper` crate is a binary native smoke crate without a `lib.rs`,
`cdylib` crate type, or WASM export boundary.

This phase keeps `digestStatus="pending"`, `sha256=null`, and
`wasmArtifactEvidence.pointer=null`. It does not execute
rustybuzz/WASM/ICU4X in `@flowdoc/vnext-core`, does not put raw native/WASM
evidence in root tests/docs, and does not replace `measureVNextText(...)`.

## Evidence Reviewed

- `docs/CURRENT_STATUS.md` and `docs/NEXT_PHASE_POINTER.md` identify Phase
  191 as the current WASM artifact build output gate.
- `docs/TEXT_ENGINE_WASM_ARTIFACT_DIGEST_PINNING_GATE.md` defines the accepted
  future artifact path and keeps digest pinning blocked until a real artifact
  exists.
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`
  records `artifactFound=false`, `canPinDigestNow=false`,
  `digestStatus="pending"`, and the accepted output path.
- `packages/text-engine-rust-wasm/package.json` currently has native
  rustybuzz smoke/build scripts only; it has no runnable WASM build script.
- `packages/text-engine-rust-wasm/rust-shaper/Cargo.toml` defines a binary
  crate with `rustybuzz = "=0.20.1"`, but no library target or `cdylib`
  crate type.
- `packages/text-engine-rust-wasm/rust-shaper/src/main.rs` is a native CLI
  smoke entrypoint that reads a font file and prints JSON.

## Accepted Build Path And Command

Accepted future artifact output path:

```text
packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm
```

Accepted package-local build command, once toolchain and crate shape are ready:

```text
cd packages/text-engine-rust-wasm
wasm-pack build rust-shaper --target web --out-dir ../pkg --out-name flowdoc_text_engine
```

The command is recorded as metadata only in this phase. It is not runnable yet
and was not executed.

Package-local build output metadata:

```text
packages/text-engine-rust-wasm/fixtures/wasm-artifact-build-output.v1.json
```

## Build Capability Decision

Decision: `blocked-not-runnable`.

Exact blockers:

- `wasm-pack-not-available`;
- `wasm32-unknown-unknown-target-not-installed`;
- `binary-only-rust-smoke-crate`;
- `missing-lib-rs`;
- `missing-cdylib-crate-type`;
- `missing-wasm-bindgen-export`;
- `accepted-artifact-path-not-produced`;
- `sha256-not-computed`.

Observed environment/package facts:

- `cargo` is available;
- `wasm-pack` is not available;
- installed Rust target observed for this gate: `x86_64-pc-windows-msvc`;
- `wasm32-unknown-unknown` is not installed;
- `rust-shaper/src/main.rs` exists;
- `rust-shaper/src/lib.rs` is absent;
- no `.wasm` artifact exists under `packages/text-engine-rust-wasm`.

## Artifact And Digest Status

The Phase 191 package-local summary records:

- `canProduceArtifactNow=false`;
- `artifactProduced=false`;
- `artifactPointer=null`;
- `digestStatus="pending"`;
- `sha256=null`;
- `rawEvidenceIncluded=false`;
- `productionReady=false`;
- `defaultMeasurerReplacement=false`.

No artifact is written to `packages/text-engine-rust-wasm/pkg/` in this phase.
No sha256 is computed because no real artifact exists.

## JSON-Safe Root Summary

Root docs/tests consume only JSON-safe summaries and retention pointers. The
Phase 191 summary keeps:

- `rawEvidenceIncluded=false`;
- `digestStatus="pending"`;
- `wasmArtifact.sha256=null`;
- runtime identity pointer package-local;
- WASM artifact pointer `null`;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, and accepted manifest blocked.

No raw glyph facts, raw native output, raw WASM output, renderer output, PDF
bytes, or executable artifact bytes are added to root tests/docs.

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

Proceed to Phase 192: Text Engine WASM Build Toolchain Readiness Gate.

Reason:

- Phase 191 defines the accepted build command and output path but cannot
  produce the artifact;
- the next useful work is to make the package-local toolchain/crate shape
  ready for WASM output without executing text engines in
  `@flowdoc/vnext-core`;
- digest pinning, native/WASM evidence, parity, drift, thresholds, accepted
  root summaries, production binding, and default-measurer replacement remain
  blocked until a real artifact exists.

## Explicit Non-Work

- No rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`.
- No raw native/WASM evidence in root tests/docs.
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

- Accepted package-local WASM build/output path is defined.
- Accepted package-local build command is defined as metadata.
- Build capability is checked.
- Exact blockers are documented.
- Digest remains `pending` with `sha256=null`.
- Package-local build output summary fixture is added.
- Root docs/tests remain limited to JSON-safe summaries and retention
  pointers.
- Downstream evidence lanes, production binding, and default-measurer
  replacement remain blocked.

## FAIL-BLOCKER

No blocker prevents completing this build-output gate.

Producing the WASM artifact is blocked by missing `wasm-pack`, missing
`wasm32-unknown-unknown`, and a binary-only native smoke crate shape.

Digest pinning remains blocked because no real artifact exists at the accepted
package-local output path.

## RISK

- The accepted command may need adjustment once the crate is converted to a
  WASM-ready library.
- Installing or vendoring `wasm-pack` may require a later environment or
  dependency policy decision.
- The final artifact may need extra JS/package metadata beside the `.wasm`
  file.
- Future crate changes may expose runtime identity or measurement profile
  drift.

## UNKNOWN

- Final WASM build toolchain owner.
- Whether `wasm-pack` or a direct Cargo plus wasm-bindgen path will be chosen.
- Final `lib.rs` / export shape.
- Final sha256 digest.
- Whether browser/worker WASM digest evidence becomes release-blocking.
- Final native/WASM parity execution path.

## Files Changed

- `docs/TEXT_ENGINE_WASM_ARTIFACT_BUILD_OUTPUT_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-build-output.v1.json`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/textEngineWasmArtifactBuildOutputGate.test.ts`
- prior pointer guard tests

## Behavior Changed

- No runtime measurement behavior changed.
- No WASM or text engine execution was added.
- A package-local JSON-safe build output summary defines the future command
  and records why it cannot run yet.
- Current-state pointers move from Phase 191 to Phase 192.

## Tests Run

- `npm.cmd test -- tests/textEngineWasmArtifactBuildOutputGate.test.ts tests/textEngineWasmArtifactDigestPinningGate.test.ts tests/textEngineRuntimeIdentityDigestEvidencePopulationGate.test.ts tests/textEngineRuntimeIdentityDigestEvidenceBuilderGate.test.ts tests/measurementEvidenceCoverageGapTriageGate.test.ts tests/measurementEvidenceSummaryManifestFixtureStubGate.test.ts tests/measurementEvidenceSummaryManifestGate.test.ts tests/v1MeasurementFixtureEvidenceMatrixGate.test.ts tests/measurementDigestParityDriftHardeningGate.test.ts tests/v1HardeningBacklogTriageGate.test.ts tests/internalAlphaCloseAuditConsolidation.test.ts`
- `npm.cmd run check`
- `npm.cmd test -- tests/textEngineWasmArtifactBuildOutputGate.test.ts`

## Risks Left

- Make the package-local WASM build toolchain and crate target ready in a later
  phase.
- Produce a real artifact only under `packages/text-engine-rust-wasm/pkg/`.
- Pin sha256 only after a real artifact exists and context matches.
- Keep raw native/WASM/parity/drift evidence outside root tests/docs.
- Keep default-measurer replacement blocked until a later explicit binding
  phase.

## Intentionally Not Changed

- No rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`.
- No raw native/WASM evidence in root tests/docs.
- No `measureVNextText(...)` default replacement.
- No pagination mutation.
- No production renderer-backed measurement binding.
- No production PDF/DOCX renderer.
- No backend route/server/storage/auth/authz behavior.
- No production contenteditable implementation.
- No package/document schema change.
- No collaboration/offline behavior.
- No legacy editor runtime copy.
