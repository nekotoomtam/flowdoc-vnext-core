# Text Engine Line Wrap Evidence Boundary

Status: Phase 133 multi-line wrap evidence boundary.

Phase 133 consumes accepted rustybuzz glyph evidence and Phase 132 Thai
line-break opportunities to produce multi-line adapter line boxes. It keeps
glyph facts on the evidence lane and keeps `VNextTextMeasurementDraft`
unchanged.

## Evidence

- `packages/text-engine-rust-wasm/src/lineWrapEvidence.ts` owns the package-
  local wrap evidence boundary.
- The boundary consumes a `VNextTextEngineAdapterRequest`, accepted
  `VNextTextEngineAdapterEvidence`, a Thai line-break evidence entry, and an
  `availableWidthPt`.
- It emits `VNextTextEngineAdapterEvidence` with multi-line
  `lineBoxes` while recording break kind and break reason in a separate
  line-wrap summary, not in the public adapter line-box fact shape.
- `src/renderer/textEngineEvidenceAcceptance.ts` now rejects overlapping line
  glyph ranges as well as missing glyph coverage.
- `tests/textEngineLineWrapEvidence.test.ts` proves Thai-only, Thai without
  spaces, mixed Thai/Latin, combining marks, digits/punctuation, narrow width,
  wide width, evidence acceptance, measurement draft handoff, dependency
  cleanliness, and documentation trail.

## Boundary

Allowed:

- consume accepted glyph evidence from the existing rustybuzz smoke corpus;
- consume UTF-16 break opportunities from the Thai line-break evidence
  manifest;
- greedily choose line breaks by `availableWidthPt`;
- produce multi-line adapter `lineBoxes`;
- record break reason, break kind, text ranges, glyph ranges, and overflow
  warnings in a line-wrap summary;
- pass the produced evidence through existing evidence acceptance and handoff.

Blocked:

- changing `VNextTextMeasurementDraft`;
- widening public adapter line-box facts with break metadata;
- replacing pagination measurement;
- binding production measurement;
- running ICU4X, rustybuzz, WASM, or renderer code;
- implementing justification, hyphenation, bidi, renderer output, storage, or
  package/document schema changes.

## PASS

- Multi-line line boxes can be produced from the existing native rustybuzz
  smoke corpus and Phase 132 break evidence.
- Existing evidence acceptance accepts produced line boxes.
- Existing measurement draft handoff derives pagination-facing drafts while
  dropping glyph facts.
- Line and glyph ranges use UTF-16 offsets and contiguous glyph ranges.
- Break reason metadata stays outside the public adapter line-box contract.

## FAIL / BLOCKER

- No blocker was found for closing this evidence boundary.

## RISK

- The wrap algorithm is evidence-grade greedy wrapping, not full typography.
- Seeded break evidence still needs replacement by generated ICU4X/Intl/oracle
  observations.
- Complex script shaping order and bidi behavior remain future work.

## UNKNOWN

- Drift against concrete ICU4X, browser Intl.Segmenter, and Thai oracle output
  is still unknown.
- Native/WASM parity for wrapped evidence is still unknown.
- Production pagination replacement tolerance is still unknown.

## Files Changed

- `packages/text-engine-rust-wasm/src/lineWrapEvidence.ts`
- `packages/text-engine-rust-wasm/src/index.ts`
- `src/renderer/textEngineEvidenceAcceptance.ts`
- `docs/TEXT_ENGINE_LINE_WRAP_EVIDENCE_BOUNDARY.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/textEngineLineWrapEvidence.test.ts`

## Behavior Changed

- The external text engine package now has a pure multi-line wrap evidence
  boundary.
- Evidence acceptance now enforces exact-once line glyph coverage.
- No production measurement, pagination, renderer, storage, or schema behavior
  changed.

## Tests Run

- `npm.cmd test -- tests/textEngineLineWrapEvidence.test.ts`
- `npm.cmd run check`

## Risks Left

- Native/WASM parity and digest pinning.
- Replacement of seeded line-break evidence with generated segmenter evidence.
- Renderer-backed provider binding remains future work.

## Intentionally Not Changed

- No `VNextTextMeasurementDraft` shape change.
- No production measurement binding.
- No pagination measurement replacement.
- No renderer artifact output.
- No ICU4X, rustybuzz, WASM, PDF, DOCX, DOM, storage, or backend execution.
- No package/document schema change.

## Non-goals

No production typography fidelity, justification, hyphenation, bidi handling,
browser/worker WASM loading, renderer-backed provider binding, pagination
replacement, PDF/DOCX output, backend route, storage write, or schema change is
introduced in this phase.
