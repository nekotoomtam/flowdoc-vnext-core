# Text Engine Evidence Acceptance Boundary

Status: Phase 109 evidence acceptance boundary.

Phase 109 validates adapter-produced text engine evidence as data. It accepts
glyph facts and line box facts only when they match the original adapter
request, measurement profile identity, output shape, engine revisions, cluster
ranges, and line glyph coverage.

The boundary still does not produce a pagination-facing measurement draft.
`producesMeasurementDraft: false` is intentional: evidence acceptance and
measurement draft handoff remain separate responsibilities.

## Evidence

- `src/renderer/textEngineEvidenceAcceptance.ts` validates adapter evidence
  without importing rustybuzz, HarfBuzz, ICU4X, WASM, font parsers, renderers,
  or pagination placement.
- `tests/textEngineEvidenceAcceptance.test.ts` proves accepted evidence,
  request/profile/engine mismatch blocking, malformed glyph/line blocking,
  source independence, and documentation trail.

## Boundary

Allowed:

- compare evidence to a `VNextTextEngineAdapterRequest`;
- validate glyph ids, advances, offsets, cluster ranges, and font ids;
- validate line box text ranges, glyph ranges, widths, heights, and y offsets;
- keep accepted evidence on the glyph fact evidence lane.

Blocked:

- production measurement binding;
- core engine execution;
- core font-file reads;
- core WASM imports;
- pagination draft mutation;
- accepting mismatched request/profile/output shape/engine revision evidence;
- accepting malformed glyph or line box facts.

## Result

Phase 109 closes the first half of the evidence lane: core can now say whether
adapter evidence is structurally acceptable before any mapper turns it into a
pagination-facing text measurement draft.

## Non-goals

No adapter package, Rust package, JS dependency, WASM build, rustybuzz/HarfBuzz
execution, ICU4X execution, font parsing, glyph capture, Thai oracle execution,
pagination draft creation, pagination replacement, renderer output, backend
route, artifact write, storage write, or package/document schema change is
introduced in this phase.
