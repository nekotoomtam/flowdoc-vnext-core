# Native/WASM Parity Summary Gate

Status: Native/WASM Parity Summary Gate complete.

This phase uses WASM Evidence Summary Gate as source of truth. It compares the
native and WASM evidence summary metadata for the same smallest Thai
line-break and canonical Latin paragraph subset. It produces JSON-safe parity
summary metadata only. It does not put raw native/WASM evidence in root
docs/tests and does not claim renderer drift, numeric thresholds, accepted
manifest, production binding, or default-measurer replacement.

## Source Of Truth

- `docs/WASM_EVIDENCE_SUMMARY_GATE.md`
- `docs/NATIVE_EVIDENCE_SUMMARY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-evidence-summary.v1.json`
- `packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json`
- `docs/ARTIFACT_DIGEST_PINNING_EXECUTION.md`
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`
- `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`
- `docs/V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE.md`
- `docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md`
- `docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md`

## Summary Existence Check

The package-local parity summary confirms:

- native evidence summary exists:
  `packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json`;
- WASM evidence summary exists:
  `packages/text-engine-rust-wasm/fixtures/wasm-evidence-summary.v1.json`;
- both summaries share the pinned digest context:
  `4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44`;
- both summaries share matrix id, corpus id, policy revision, measurement
  profile id, output shape, fixture ids, and scenario ids.

## Compared Context

The parity summary records `matched` for:

- artifact digest context;
- matrix id;
- corpus id;
- policy revision;
- measurement profile id;
- output shape;
- fixture ids;
- scenario ids.

The comparison scope is `summary-metadata-only`. This is enough to proceed to
renderer-backed drift summary work, but it is not production measurement
readiness.

## Compared Fact Coverage

The parity summary compares metadata coverage for:

- `glyph-facts`;
- `cluster-map`;
- `text-range`;
- `line-boxes`;
- `total-size`;
- `line-count`.

Each fact is `metadata-present` in both native and WASM summaries and is
recorded as `matched`.

## Package-Local Fixture

The package-local fixture is:

```text
packages/text-engine-rust-wasm/fixtures/native-wasm-parity-summary.v1.json
```

It records:

- `nativeEvidenceSummaryExists=true`;
- `wasmEvidenceSummaryExists=true`;
- `summaryMode="json-safe-native-wasm-parity-metadata-only"`;
- `subsetId="native-wasm-parity-summary-minimal-v1"`;
- `nativeWasmParityStatus="matching-summary-metadata"`;
- `parityScope="summary-metadata-only"`;
- `parityAcceptedForDriftPrerequisite=true`;
- `parityAcceptedForProduction=false`;
- `rendererBackedDriftStatus="unknown"`;
- `numericDriftThresholdStatus="blocked"`;
- `acceptedManifestStatus="blocked"`;
- `defaultMeasurerReplacement=false`.

## Mismatch Policy

If either summary is stale, missing, mismatched, or has different coverage, the
next drift phase must not proceed. The package-local policy records:

- stale digest: `blocked`;
- matrix/corpus/policy/profile/output-shape mismatch: `blocked`;
- fixture id, scenario id, or fact coverage mismatch: `mismatched`.

## Next Phase

Renderer-backed Drift Summary Gate.

Proceed only because the native/WASM summary metadata is matching for this
subset. Renderer-backed drift must still use the same matrix id, corpus id,
policy revision, measurement profile id, output shape, fixture ids, scenario
ids, and pinned artifact digest context.

## Explicit Non-Work

- No raw native/WASM evidence is added to root docs/tests.
- No renderer-backed drift is claimed.
- No numeric thresholds are accepted.
- No accepted summary manifest is claimed.
- No `measureVNextText(...)` replacement happens.
- No pagination mutation happens.
- No production renderer-backed measurement binding happens.
- No production PDF/DOCX renderer work is added.
- No backend routes, storage, auth, or authz are added.
- No production contenteditable implementation is added.
- No package/document schema change is made.
- No collaboration/offline behavior is added.
- No legacy editor runtime is copied.

## PASS

- Native evidence summary exists.
- WASM evidence summary exists.
- Digest context, matrix id, corpus id, policy revision, measurement profile
  id, output shape, fixture ids, and scenario ids match.
- Required fact coverage metadata matches for glyph facts, cluster map, text
  range, line boxes, total size, and line count.
- Raw native/WASM evidence remains outside root docs/tests.
- Renderer drift, thresholds, accepted manifest, production binding, and
  default-measurer replacement remain blocked.

## FAIL-BLOCKER

None for producing the parity summary metadata gate.

Renderer-backed Drift Summary Gate must not proceed if the parity summary is
missing, stale, blocked, mismatched, includes raw native/WASM evidence in root
docs/tests, or changes `measureVNextText(...)`.

## RISK

- This is metadata parity only. It does not compare raw glyph coordinates,
  numeric line boxes, or renderer-backed drift.
- The parity summary is sufficient to unlock the next drift summary gate, but
  it is not accepted production measurement evidence.
- Raw native/WASM retention is still represented as package-local/external
  placeholders.

## UNKNOWN

- Renderer-backed drift remains unknown.
- Numeric drift thresholds remain blocked.
- Accepted summary manifest status remains blocked.
- Production measurement replacement remains blocked.

## Files Changed

- `docs/NATIVE_WASM_PARITY_SUMMARY_GATE.md`
- `packages/text-engine-rust-wasm/fixtures/native-wasm-parity-summary.v1.json`
- `packages/text-engine-rust-wasm/README.md`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`
- `tests/nativeWasmParitySummaryGate.test.ts`
- pointer guard tests

## Behavior Changed

No runtime behavior changed. Production measurement behavior is unchanged.
Only package-local JSON-safe native/WASM parity summary metadata was added.

## Tests Run

- `npm.cmd test -- tests/nativeWasmParitySummaryGate.test.ts tests/wasmEvidenceSummaryGate.test.ts tests/nativeEvidenceSummaryGate.test.ts`
- `npm.cmd test`
- `npm.cmd run type-check`
- `npm.cmd run check`

## Risks Left

- Produce renderer-backed drift summary for the same subset and digest context.
- Define and accept numeric drift thresholds later.
- Produce an accepted summary manifest later.
- Keep production measurement replacement blocked until a later explicit
  binding phase.

## Intentionally Not Changed

- `measureVNextText(...)`
- pagination behavior
- renderer-backed measurement binding
- PDF/DOCX renderer behavior
- backend routes/storage/auth/authz
- production contenteditable
- package/document schema
- collaboration/offline behavior
