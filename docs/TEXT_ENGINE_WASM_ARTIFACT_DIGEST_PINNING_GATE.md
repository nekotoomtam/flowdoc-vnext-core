# Text Engine WASM Artifact Digest Pinning Gate

Status: Phase 190 text engine WASM artifact digest pinning gate.

Phase 190 checks the package-local WASM artifact candidate paths recorded by
Phase 189. No candidate artifact exists, so the digest cannot be pinned. This
phase defines the accepted future package-local output path and keeps
`digestStatus="pending"` with `sha256=null`.

This is a pinning decision gate only. It does not execute rustybuzz/WASM/ICU4X
in `@flowdoc/vnext-core`, does not build or load WASM in root core, does not
put raw native/WASM evidence in root tests/docs, and does not replace
`measureVNextText(...)`.

## Evidence Reviewed

- `docs/CURRENT_STATUS.md` and `docs/NEXT_PHASE_POINTER.md` identify Phase
  190 as the current WASM artifact digest pinning gate.
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_POPULATION_GATE.md`
  records Phase 189 as retained-pending because no package-local WASM artifact
  exists.
- `packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-population.v1.json`
  records the candidate paths and confirms `canPinDigestNow=false`,
  `digestStatus="pending"`, and `sha256=null`.
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_BUILDER_GATE.md` defines
  the JSON-safe root summary shape and the `pinned`, `pending`, `missing`, and
  `stale` digest policy.
- `packages/text-engine-rust-wasm/src/runtimeIdentityDigestEvidenceBuilder.ts`
  only reports pinned when sha256 is a lowercase 64-character hex string and
  the runtime identity context matches.
- `packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-builder.v1.json`
  defines the matrix id, corpus id, policy revision, measurement profile id,
  and output shape context.
- `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`
  still records `digestStatus="pending"`, `sha256=null`, and parity not-run.
- `docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md` and
  `docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md` keep digest pinning
  ahead of native/WASM evidence, parity, drift, and replacement claims.

## Candidate Path Check

Phase 190 checked the Phase 189 candidate paths:

| Candidate path | Package-local | Exists now | Result |
|---|---:|---:|---|
| `packages/text-engine-rust-wasm/dist/flowdoc_text_engine_bg.wasm` | yes | no | not pinned |
| `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm` | yes | no | selected future output path, not pinned |
| `packages/text-engine-rust-wasm/target/wasm32-unknown-unknown/release/flowdoc_text_engine.wasm` | yes | no | not pinned |

No `.wasm` artifact is present under `packages/text-engine-rust-wasm`.

## Accepted Package-Local Output Path

Accepted future retained artifact path:

```text
packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm
```

Reason:

- it stays inside `packages/text-engine-rust-wasm`;
- it matches common wasm-pack package output naming;
- it separates retained distributable WASM output from intermediate Rust
  target output;
- it can become the `wasmArtifactEvidence.pointer` only after a real artifact
  exists and sha256 is pinned.

The package-local pinning summary is:

```text
packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json
```

It records:

- `acceptedArtifactPath="packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm"`;
- `acceptedArtifactPathStatus="defined-not-present"`;
- `artifactFound=false`;
- `canPinDigestNow=false`;
- `pinningDecision="pending-no-artifact"`;
- `digestStatus="pending"`;
- `sha256=null`;
- `wasmArtifactPointer=null`;
- `rawEvidenceIncluded=false`;
- `productionReady=false`;
- `defaultMeasurerReplacement=false`.

## Pinning Rules

Future pinning may set `digestStatus="pinned"` only when all of these are true:

- artifact path is package-local;
- artifact exists at the accepted path or an explicitly accepted replacement
  path;
- sha256 is lowercase 64-character hex;
- matrix id is `v1-measurement-fixture-evidence-matrix-v1`;
- corpus id is `v1-measurement-evidence-corpus-v1`;
- policy revision is `v1-measurement-evidence-policy-v1`;
- measurement profile id matches the runtime identity manifest;
- output shape is `glyph-line-box-v1`;
- raw evidence remains outside root tests/docs.

If the artifact path, profile, output shape, matrix, corpus, policy revision,
or digest declaration does not match, the digest status must remain `pending`,
`missing`, or `stale` instead of `pinned`.

## JSON-Safe Root Summary

Root docs/tests still consume only JSON-safe summaries and retention pointers.
The Phase 190 summary keeps:

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
- default-measurer replacement.

## Recommended Next Phase

Proceed to Phase 191: Text Engine WASM Artifact Build Output Gate.

Reason:

- Phase 190 defines the accepted package-local artifact path but no artifact
  exists yet;
- the next useful work is to produce or explicitly retain the accepted
  package-local WASM output path without executing text engines in
  `@flowdoc/vnext-core`;
- sha256 pinning, native/WASM evidence, parity, drift, thresholds, accepted
  root summaries, production measurement binding, and default-measurer
  replacement remain blocked until a real artifact exists.

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

- Phase 189 candidate artifact paths are checked.
- No package-local WASM artifact is present.
- Accepted package-local future output path is defined.
- Digest remains `pending` with `sha256=null`.
- Package-local pinning summary fixture is added.
- Root docs/tests remain limited to JSON-safe summary and retention pointers.
- Downstream evidence lanes and default-measurer replacement remain blocked.

## FAIL-BLOCKER

No blocker prevents completing this pinning decision gate.

Digest pinning itself remains blocked because no artifact exists at the
accepted package-local output path.

Production/default measurement replacement remains blocked because digest is
pending, native/WASM evidence is blocked, parity is not-run, renderer drift is
unknown, numeric thresholds are blocked, and no accepted summary manifest
exists.

## RISK

- The accepted output path may change if the future WASM build toolchain
  cannot emit `pkg/flowdoc_text_engine_bg.wasm`.
- A future artifact may expose runtime identity or measurement profile drift.
- sha256 pinning may require a package-local build step that is not yet
  defined.
- Browser/worker WASM loading semantics remain unresolved.

## UNKNOWN

- Final package-local WASM build command.
- Whether the accepted output path needs wasm-bindgen or wasm-pack metadata.
- Final sha256 digest.
- Whether browser/worker WASM digest evidence becomes release-blocking.
- Final native/WASM parity execution path.
- Final numeric drift thresholds and accepted root manifest phase.

## Files Changed

- `docs/TEXT_ENGINE_WASM_ARTIFACT_DIGEST_PINNING_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/textEngineWasmArtifactDigestPinningGate.test.ts`
- prior pointer guard tests

## Behavior Changed

- No runtime measurement behavior changed.
- No WASM or text engine execution was added.
- A package-local JSON-safe pinning summary defines the accepted future WASM
  artifact output path and keeps digest pending.
- Current-state pointers move from Phase 190 to Phase 191.

## Tests Run

- `npm.cmd test -- tests/textEngineWasmArtifactDigestPinningGate.test.ts tests/textEngineRuntimeIdentityDigestEvidencePopulationGate.test.ts tests/textEngineRuntimeIdentityDigestEvidenceBuilderGate.test.ts tests/measurementEvidenceCoverageGapTriageGate.test.ts tests/measurementEvidenceSummaryManifestFixtureStubGate.test.ts tests/measurementEvidenceSummaryManifestGate.test.ts tests/v1MeasurementFixtureEvidenceMatrixGate.test.ts tests/measurementDigestParityDriftHardeningGate.test.ts tests/v1HardeningBacklogTriageGate.test.ts tests/internalAlphaCloseAuditConsolidation.test.ts`
- `npm.cmd run check`
- `npm.cmd test -- tests/textEngineWasmArtifactDigestPinningGate.test.ts`

## Risks Left

- Produce or retain a real package-local WASM artifact at the accepted path in
  a later phase.
- Pin sha256 only after the artifact exists and context matches.
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
