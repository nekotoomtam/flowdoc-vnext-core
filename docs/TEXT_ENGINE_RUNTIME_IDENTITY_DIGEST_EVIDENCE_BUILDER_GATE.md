# Text Engine Runtime Identity Digest Evidence Builder Gate

Status: Phase 188 text engine runtime identity digest evidence builder gate.

Phase 188 defines the first external/package-local runtime identity and digest
evidence builder path. The builder lives in `@flowdoc/text-engine-rust-wasm`
and returns a JSON-safe root summary handoff. It does not execute
rustybuzz/WASM/ICU4X in `@flowdoc/vnext-core`, does not put raw native/WASM
evidence in root tests/docs, and does not replace `measureVNextText(...)`.

## Evidence Reviewed

- `docs/CURRENT_STATUS.md` and `docs/NEXT_PHASE_POINTER.md` identify Phase
  188 as the current digest evidence-builder gate.
- `docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md` selects
  digest/runtime identity as the first blocker after the Phase 186 stub.
- `fixtures/measurement-evidence-summary-manifest.stub.v1.json` records
  release-gating digest identity as pending and native/WASM parity as not-run.
- `docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_FIXTURE_STUB_GATE.md` keeps
  release-gating fixture rows unknown/missing.
- `docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_GATE.md` defines the JSON-safe
  root summary fields for digest identity, parity, drift, status, retention,
  and replacement blockers.
- `docs/V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE.md` defines matrix id,
  corpus id, policy revision, measurement profile id, and output shape.
- `docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md` requires pinned
  digest identity before parity-ready or default-measurer replacement claims.
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_BOUNDARY.md` defines the package-local
  runtime identity manifest and existing identity-only validation boundary.
- `docs/TEXT_ENGINE_RENDERER_BACKED_PROVIDER_BOUNDARY.md` keeps
  renderer-backed drift external and default measurement independent.

## Builder Path

Package-local builder:

```text
packages/text-engine-rust-wasm/src/runtimeIdentityDigestEvidenceBuilder.ts
```

Package-local builder manifest shape:

```text
packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-builder.v1.json
```

Runtime identity source manifest:

```text
packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json
```

The builder consumes an in-memory runtime identity manifest and returns a
JSON-safe `rootSummary`. It does not read files, load WASM, execute native
shaping, execute ICU4X, compare runtime outputs, mutate pagination, bind
production measurement, or write artifacts.

## JSON-Safe Root Summary Handoff

The root handoff shape includes:

- `summaryId`: `text-engine-runtime-identity-digest-root-summary-v1`;
- `matrixId`: `v1-measurement-fixture-evidence-matrix-v1`;
- `corpusId`: `v1-measurement-evidence-corpus-v1`;
- `policyRevision`: `v1-measurement-evidence-policy-v1`;
- `runtimeIdentityPolicyRevision`: source runtime identity policy revision;
- `measurementProfileId`: exact runtime identity profile id;
- `outputShapeVersion`: `glyph-line-box-v1`;
- `runtimeIdentityManifestId`: `text-engine-runtime-identity-v1`;
- `adapterPackageName`: `@flowdoc/text-engine-rust-wasm`;
- `digestStatus`: `pinned`, `pending`, `missing`, or `stale`;
- `rawEvidenceIncluded`: `false`;
- `evidenceOwner`: `@flowdoc/text-engine-rust-wasm`;
- `rootSummaryOwner`: `@flowdoc/vnext-core-docs`;
- runtime revisions for rustybuzz, ICU4X, and ICU4X data;
- WASM artifact digest status and sha256 when present;
- font asset hashes;
- retention pointers for runtime identity and WASM artifact evidence;
- downstream blocker flags for native evidence, WASM evidence, parity,
  renderer-backed drift, numeric thresholds, and accepted summary manifest.

## Digest Status Policy

- `pinned`: runtime identity matches the requested matrix/profile/output shape
  and the WASM artifact digest is a lowercase sha256.
- `pending`: runtime identity is present and aligned, but the WASM artifact
  digest is not pinned yet.
- `missing`: a pinned digest claim is missing a valid sha256 artifact digest.
- `stale`: runtime identity, measurement profile, output shape, or digest
  declaration no longer matches the requested evidence context.

The Phase 188 package-local fixture remains `pending` because the runtime
identity manifest still has `wasmArtifact.digestStatus="pending"` and
`sha256=null`.

## Retention Pointer Policy

Root docs/tests may assert pointer shape only:

```json
{
  "owner": "@flowdoc/text-engine-rust-wasm",
  "pointer": "package-local-or-null-reference",
  "includedInRoot": false
}
```

Rules:

- runtime identity evidence pointer must reference the package-local runtime
  identity manifest;
- WASM artifact evidence pointer may remain `null` while digest is pending;
- raw native/WASM outputs must not enter root docs/tests;
- root summaries must keep `rawEvidenceIncluded=false`;
- changing runtime identity, measurement profile id, output shape, policy
  revision, font hashes, rustybuzz revision, ICU4X revision, ICU4X data
  revision, or WASM digest resets downstream status to `unknown` until later
  summaries are rebuilt.

## Identity Ingredients

The builder ties digest status to:

- `measurementProfileId`;
- `corpusId`;
- `policyRevision`;
- `outputShapeVersion`;
- rustybuzz revision;
- ICU4X revision;
- ICU4X data revision;
- font asset hashes;
- WASM artifact digest status and sha256.

These ingredients are summarized only. They are not used to run text
measurement in this phase.

## Downstream Blockers

The builder leaves these blocked for later phases:

- native evidence;
- WASM evidence;
- native/WASM parity summaries;
- renderer-backed drift summaries;
- numeric drift thresholds;
- accepted summary manifest;
- default-measurer replacement.

## Recommended Next Phase

Proceed to Phase 189: Text Engine Runtime Identity Digest Evidence Population
Gate.

Reason:

- Phase 188 defines the package-local builder and root handoff shape;
- the current package-local digest remains pending;
- the next safe step is to populate or explicitly retain the package-local
  runtime identity/WASM artifact digest evidence without executing text engines
  in root core or binding production measurement.

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

- Package-local digest/runtime identity builder path is defined.
- Evidence ownership stays in `@flowdoc/text-engine-rust-wasm`.
- JSON-safe root summary handoff shape is defined.
- Digest status policy covers pinned, pending, missing, and stale.
- Retention pointer policy keeps raw evidence outside root docs/tests.
- Builder relationship to matrix/profile/runtime/font/WASM identity is
  explicit.
- Native evidence, WASM evidence, parity summaries, renderer drift summaries,
  numeric thresholds, accepted manifest, and default-measurer replacement
  remain blocked.

## FAIL-BLOCKER

No blocker prevents completing this builder gate.

Production/default measurement replacement remains blocked because the current
digest is pending and no native/WASM/parity/drift/threshold/accepted manifest
evidence exists.

## RISK

- The current WASM artifact digest remains pending.
- Retention pointer conventions may need refinement when real artifact storage
  is selected.
- Future digest population may expose runtime identity mismatches.
- Browser/worker WASM loading semantics remain unknown.

## UNKNOWN

- Final WASM artifact build path and sha256.
- Final package-local retention location for raw runtime identity and WASM
  artifact evidence.
- Whether browser/worker WASM evidence becomes release-blocking.
- Final native/WASM parity execution path.
- Final numeric drift thresholds and accepted root manifest phase.

## Files Changed

- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_BUILDER_GATE.md`
- `packages/text-engine-rust-wasm/src/runtimeIdentityDigestEvidenceBuilder.ts`
- `packages/text-engine-rust-wasm/src/index.ts`
- `packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-builder.v1.json`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/textEngineRuntimeIdentityDigestEvidenceBuilderGate.test.ts`
- prior pointer guard tests

## Behavior Changed

- No runtime measurement behavior changed.
- A package-local pure builder can now create a JSON-safe runtime identity
  digest root summary handoff.
- Current-state pointers move from Phase 188 to Phase 189.

## Tests Run

- `npm.cmd test -- tests/textEngineRuntimeIdentityDigestEvidenceBuilderGate.test.ts tests/measurementEvidenceCoverageGapTriageGate.test.ts tests/measurementEvidenceSummaryManifestFixtureStubGate.test.ts tests/measurementEvidenceSummaryManifestGate.test.ts tests/v1MeasurementFixtureEvidenceMatrixGate.test.ts tests/measurementDigestParityDriftHardeningGate.test.ts tests/v1HardeningBacklogTriageGate.test.ts tests/internalAlphaCloseAuditConsolidation.test.ts tests/textEngineRuntimeIdentity.test.ts`
- `npm.cmd run check`
- `npm.cmd test -- tests/textEngineRuntimeIdentityDigestEvidenceBuilderGate.test.ts`

## Risks Left

- Populate or pin the package-local WASM artifact digest in a later phase.
- Keep native/WASM/parity/drift evidence production outside core.
- Keep raw evidence outside root docs/tests.
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
