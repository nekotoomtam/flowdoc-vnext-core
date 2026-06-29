# Measurement Evidence Summary Manifest Gate

Status: Phase 185 measurement evidence summary manifest gate.

Phase 185 defines the JSON-safe manifest shape for carrying the Phase 184
fixture matrix evidence forward. The manifest can summarize digest identity,
native/WASM parity, renderer-backed drift, required fact coverage,
missing-evidence status, and retention pointers without storing raw evidence
in root docs/tests.

This is a manifest-shape gate only. It does not replace
`measureVNextText(...)`, mutate pagination, bind production renderer-backed
measurement, execute external text engines in core, put raw evidence in root
tests/docs, add production PDF/DOCX renderer work, add backend/storage/auth
behavior, implement contenteditable, change package/document schema, add
collaboration/offline behavior, or copy legacy editor runtime.

## Evidence Reviewed

- `docs/CURRENT_STATUS.md` and `docs/NEXT_PHASE_POINTER.md` identify Phase
  185 as the current measurement evidence summary manifest gate.
- `docs/V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE.md` selects the matrix id,
  corpus id, fixture ids, release-gating flags, profile requirements, required
  summary facts, raw-evidence boundary, and missing-evidence status policy.
- `docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md` defines digest,
  parity, drift, blocked/warning/unknown, and replacement-blocker policy.
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_BOUNDARY.md` defines runtime identity,
  digest, font hash, runtime target, and parity requirements.
- `docs/TEXT_ENGINE_RENDERER_BACKED_PROVIDER_BOUNDARY.md` defines the
  renderer-backed provider drift report shape and default-measurement
  independence.
- `docs/MEASUREMENT_ROLLOUT_GATE.md` keeps production/default measurement
  replacement blocked until digest, native/WASM parity, and drift evidence are
  accepted in a later binding phase.

## Manifest Contract

The manifest is a JSON-safe summary record. It is not raw evidence.

Required top-level fields:

- `manifestVersion`: `1`.
- `manifestId`: stable id for this summary manifest.
- `matrixId`: `v1-measurement-fixture-evidence-matrix-v1`.
- `corpusId`: `v1-measurement-evidence-corpus-v1`.
- `policyRevision`: `v1-measurement-evidence-policy-v1`.
- `measurementProfileId`: the exact profile represented by every fixture
  summary in the manifest.
- `outputShapeVersion`: `glyph-line-box-v1`.
- `summaryOwner`: root JSON-safe summary owner, such as
  `@flowdoc/vnext-core-docs`.
- `rawEvidenceOwner`: external/package-local evidence owner, such as
  `@flowdoc/text-engine-rust-wasm`.
- `rawEvidenceIncluded`: must be `false`.
- `fixtures`: bounded array of fixture/scenario summary rows.
- `manifestStatus`: aggregate `accepted`, `warning`, `blocked`, or `unknown`.
- `replacementBlockers`: blockers before any default-measurer replacement.
- `retention`: summary-level retention pointers for raw native, WASM,
  renderer, digest, parity, and drift evidence.

## Fixture Summary Shape

Each fixture row must include:

- `fixtureId`: stable Phase 184 fixture id.
- `scenarioIds`: stable scenario/sample ids covered by the summary.
- `gateType`: `release-gating` or `exploratory`.
- `measurementProfileId`: must match the manifest profile.
- `requiredFacts`: required fact ids from the Phase 184 vocabulary.
- `factCoverage`: per-fact `present`, `missing`, or `not-required`.
- `digestIdentity`: digest and runtime identity summary.
- `nativeWasmParity`: native/WASM parity summary.
- `rendererBackedDrift`: renderer-backed drift summary.
- `missingEvidence`: missing evidence items with status and reason.
- `status`: fixture-level `accepted`, `warning`, `blocked`, or `unknown`.
- `retention`: fixture-level retention pointers.
- `replacementBlockers`: fixture-level blockers before replacement.

## Digest Identity Summary

`digestIdentity` must be JSON-safe and bounded:

```json
{
  "status": "pinned | pending | missing | stale",
  "measurementProfileId": "measurement-profile-id",
  "runtimeIdentityManifestId": "text-engine-runtime-identity-v1",
  "rustybuzzRevision": "0.20.1",
  "icu4xRevision": "icu4x-planned",
  "icu4xDataRevision": "icu4x-data-planned",
  "outputShapeVersion": "glyph-line-box-v1",
  "fontAssetHashes": [
    { "fontId": "sarabun-regular", "sha256": "..." }
  ],
  "wasmArtifact": {
    "digestStatus": "pinned | pending | missing",
    "sha256": "sha256-or-null"
  }
}
```

`accepted` fixture status requires `digestIdentity.status = "pinned"` and a
pinned WASM digest when native/WASM parity is claimed.

## Native/WASM Parity Summary

`nativeWasmParity` must summarize comparison status without raw outputs:

```json
{
  "status": "matching | mismatched | not-run | missing | stale",
  "nativeTarget": "node-native",
  "wasmTargets": ["browser-wasm", "worker-wasm"],
  "comparedFacts": [
    "glyph-facts",
    "cluster-map",
    "text-range",
    "line-boxes",
    "total-size",
    "line-count"
  ],
  "issueCount": 0,
  "issues": []
}
```

Release-gating fixtures cannot be `accepted` unless parity status is
`matching`.

## Renderer-Backed Drift Summary

`rendererBackedDrift` must summarize drift at summary grain only:

```json
{
  "status": "accepted | warning | blocked | unknown",
  "approximateSummary": {
    "widthPt": 0,
    "heightPt": 0,
    "lineCount": 0
  },
  "rendererBackedSummary": {
    "widthPt": 0,
    "heightPt": 0,
    "lineCount": 0
  },
  "drift": {
    "widthPt": 0,
    "heightPt": 0,
    "lineCount": 0
  },
  "tolerance": {
    "widthPt": "policy-pending",
    "heightPt": "policy-pending",
    "lineCount": 0
  }
}
```

Until numeric tolerances are accepted, release-gating fixtures with missing
drift summary remain `unknown`, and any non-zero line-count drift remains
`blocked`.

## Missing-Evidence Status

Use the Phase 184 status vocabulary:

- `accepted`: every required fact is present, digest is pinned, parity is
  matching, drift is accepted, and no replacement blocker remains for the
  fixture.
- `warning`: exploratory evidence is incomplete or a non-release limitation is
  explicitly documented.
- `blocked`: release-gating fixture is missing required fact coverage, digest,
  parity, drift, profile alignment, or has release-gating drift failure.
- `unknown`: evidence has not been produced, summarized, retained, or
  revalidated for the current matrix/profile.

The manifest aggregate status must be the most severe fixture/replacement
state, ordered `blocked`, `unknown`, `warning`, `accepted`.

## Retention Pointer Shape

Retention pointers are references, not raw evidence:

```json
{
  "rawNativeEvidence": {
    "owner": "@flowdoc/text-engine-rust-wasm",
    "pointer": "package-local-or-external-reference",
    "includedInRoot": false
  },
  "rawWasmEvidence": {
    "owner": "@flowdoc/text-engine-rust-wasm",
    "pointer": "package-local-or-external-reference",
    "includedInRoot": false
  },
  "rendererEvidence": {
    "owner": "external-renderer-provider",
    "pointer": "package-local-or-external-reference",
    "includedInRoot": false
  }
}
```

Root docs/tests may assert pointer shape, owners, and `includedInRoot: false`.
They must not embed raw native, WASM, renderer, browser, PDF, or artifact
bytes.

## Minimal JSON-Safe Example

```json
{
  "manifestVersion": 1,
  "manifestId": "measurement-evidence-summary-manifest-v1",
  "matrixId": "v1-measurement-fixture-evidence-matrix-v1",
  "corpusId": "v1-measurement-evidence-corpus-v1",
  "policyRevision": "v1-measurement-evidence-policy-v1",
  "measurementProfileId": "measurement-profile-v1:thai-rustybuzz-icu4x-v1",
  "outputShapeVersion": "glyph-line-box-v1",
  "summaryOwner": "@flowdoc/vnext-core-docs",
  "rawEvidenceOwner": "@flowdoc/text-engine-rust-wasm",
  "rawEvidenceIncluded": false,
  "manifestStatus": "unknown",
  "fixtures": [
    {
      "fixtureId": "v1-measure-thai-line-break-core",
      "scenarioIds": ["thai-greeting-no-space", "thai-combining-marks"],
      "gateType": "release-gating",
      "measurementProfileId": "measurement-profile-v1:thai-rustybuzz-icu4x-v1",
      "requiredFacts": ["glyph-facts", "cluster-map", "text-range", "line-boxes", "total-size", "line-count", "drift-summary", "parity-summary"],
      "factCoverage": {
        "glyph-facts": "missing",
        "cluster-map": "missing",
        "text-range": "missing",
        "line-boxes": "missing",
        "total-size": "missing",
        "line-count": "missing",
        "drift-summary": "missing",
        "parity-summary": "missing"
      },
      "status": "unknown",
      "replacementBlockers": ["summary-not-produced"]
    }
  ],
  "replacementBlockers": ["release-gating-summaries-missing"],
  "retention": {
    "rawNativeEvidence": { "owner": "@flowdoc/text-engine-rust-wasm", "pointer": null, "includedInRoot": false },
    "rawWasmEvidence": { "owner": "@flowdoc/text-engine-rust-wasm", "pointer": null, "includedInRoot": false },
    "rendererEvidence": { "owner": "external-renderer-provider", "pointer": null, "includedInRoot": false }
  }
}
```

The example is intentionally `unknown`. It defines shape only and does not
claim evidence has been produced.

## Replacement Blockers

Before any default-measurer replacement can be proposed:

- every release-gating fixture row must have an `accepted` status;
- digest identity must be pinned and retained;
- native/WASM parity must be matching for required fixtures;
- renderer-backed drift summaries must be accepted under numeric thresholds;
- raw evidence retention pointers must be present and outside root docs/tests;
- fallback behavior for blocked/unknown fixtures must be defined;
- a later binding phase must explicitly accept replacement.

## Explicit Non-Work

- No `measureVNextText(...)` default replacement.
- No pagination mutation.
- No production renderer-backed measurement binding.
- No external text-engine execution in core.
- No raw evidence in root tests/docs.
- No production PDF/DOCX renderer work.
- No backend route/server/storage/auth/authz work.
- No production contenteditable implementation.
- No package/document schema change.
- No collaboration/offline behavior.
- No legacy editor runtime copy.

## PASS

- JSON-safe summary manifest shape is defined.
- Matrix id, corpus id, policy revision, measurement profile id, fixture ids,
  and gate types are included.
- Required fact coverage, digest identity, native/WASM parity,
  renderer-backed drift, missing-evidence status, and aggregate status fields
  are defined.
- Retention pointer shape keeps raw evidence outside root docs/tests.
- Replacement blockers before default-measurer replacement are explicit.

## FAIL-BLOCKER

No blocker prevents completing this manifest-shape gate.

Production/default measurement replacement remains blocked until JSON-safe
summary manifests are populated, accepted, and approved by a later binding
phase.

## RISK

- The manifest shape may need expansion when real renderer package
  requirements are selected.
- Numeric drift thresholds remain policy-pending.
- Raw evidence retention locations remain unresolved.
- Fixture summaries may expose missing categories that require a matrix
  revision.

## UNKNOWN

- Final numeric drift thresholds.
- Final retention storage for raw native/WASM/renderer evidence.
- Whether browser/worker WASM parity becomes release-blocking.
- Whether PDF/DOCX renderer choices require additional summary fields.
- Which later phase will accept or reject default-measurer replacement.

## Next Recommended Phase

Proceed to Phase 186: Measurement Evidence Summary Manifest Fixture Stub Gate.

Reason:

- Phase 185 defines the manifest shape;
- the next safe step is to add a JSON-safe stub summary manifest for the Phase
  184 matrix with unknown/missing statuses, without executing external engines
  or binding production measurement.

## Files Changed

- `docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_GATE.md`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/measurementEvidenceSummaryManifestGate.test.ts`
- `tests/v1MeasurementFixtureEvidenceMatrixGate.test.ts`

## Behavior Changed

- No runtime behavior changed.
- The JSON-safe measurement evidence summary manifest shape is now defined.
- Current-state pointers move from Phase 185 to Phase 186.

## Tests Run

- `npm.cmd run check`

## Risks Left

- Add a Phase 186 JSON-safe stub summary manifest.
- Keep raw evidence outside root docs/tests.
- Keep default-measurer replacement blocked until a later binding phase.

## Intentionally Not Changed

- No `measureVNextText(...)` default replacement.
- No pagination mutation.
- No production renderer-backed measurement binding.
- No external text-engine execution in core.
- No raw evidence in root tests/docs.
- No production PDF/DOCX renderer.
- No backend route/server/storage/auth/authz behavior.
- No production contenteditable implementation.
- No package/document schema change.
- No collaboration/offline behavior.
- No legacy editor runtime copy.
