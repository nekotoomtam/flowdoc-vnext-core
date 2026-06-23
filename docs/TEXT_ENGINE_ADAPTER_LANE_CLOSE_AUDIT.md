# Text Engine Adapter Lane Close Audit

Status: Phase 111 close audit.

Phase 111 closes the current text engine adapter/evidence lane foundation pass
for Phases 104-110. It records what is now stable inside vNext core and what
remains intentionally outside core before concrete rustybuzz/WASM adapter work,
ICU4X execution, Thai oracle comparison, cross-runtime determinism proof, and
production measurement binding.

This audit does not implement new runtime behavior.

## PASS

- Measurement profile identity is owned by
  `src/renderer/measurementProfileIdentity.ts`, covered by
  `tests/measurementProfileIdentity.test.ts`. It derives deterministic
  `measurementProfileId` strings from copied font hashes, style mappings,
  shaper revisions, segmenter/data revisions, line-break policy, fallback
  policy, and output shape.
- Rust/WASM engine placement is owned by
  `src/renderer/rustWasmTextEngineBoundary.ts`, covered by
  `tests/rustWasmTextEngineBoundary.test.ts`. It keeps rustybuzz/ICU4X/WASM in
  a future external adapter package instead of direct core dependencies.
- Thai corpus and oracle planning is owned by
  `src/renderer/thaiCorpusBoundary.ts`, covered by
  `tests/thaiCorpusBoundary.test.ts`. It records deterministic ICU4X as primary
  candidate, Intl.Segmenter as comparison baseline, and Thai oracle candidates.
- Rustybuzz shaping smoke requirements are owned by
  `src/renderer/rustybuzzShapingSmoke.ts`, covered by
  `tests/rustybuzzShapingSmoke.test.ts`. It requires copied font assets, Thai
  corpus sample ids, stable measurement profile identity, and glyph/line facts.
- Text engine adapter SPI is owned by
  `src/renderer/textEngineAdapterSpi.ts`, covered by
  `tests/textEngineAdapterSpi.test.ts`. It maps smoke cases to future adapter
  requests and keeps glyph facts on a separate evidence lane.
- Evidence acceptance is owned by
  `src/renderer/textEngineEvidenceAcceptance.ts`, covered by
  `tests/textEngineEvidenceAcceptance.test.ts`. It accepts adapter evidence only
  after request/profile/output/engine/glyph/line validation.
- Measurement draft handoff is owned by
  `src/renderer/textEngineMeasurementDraftHandoff.ts`, covered by
  `tests/textEngineMeasurementDraftHandoff.test.ts`. It derives the existing
  pagination-facing `VNextTextMeasurementDraft` from accepted evidence while
  dropping glyph facts from the draft.

## FAIL / BLOCKER

- No blocker was found for closing the core text engine adapter lane foundation
  pass.

## RISK

- No concrete adapter package exists yet.
- rustybuzz/HarfBuzz shaping is not executed.
- ICU4X segmentation and line breaking are not executed.
- Thai oracle comparisons are not executed.
- WASM artifact digests are not pinned.
- Accepted evidence is structurally validated, but no real glyph evidence has
  been captured from a text engine.
- The handoff can create a draft from accepted evidence, but production
  pagination still does not use the external adapter.

## UNKNOWN

- The exact rustybuzz crate/package revision, WASM build path, and artifact
  digest are unknown.
- ICU4X data package shape and revision strategy are unknown.
- Cross-runtime parity across Node, browser, and worker execution is unknown.
- Drift tolerance between adapter-derived drafts and existing approximate
  measurement is unknown.
- Caret/selection cluster-map consumers are not designed yet.

## Files Changed In This Pass

- `src/renderer/measurementProfileIdentity.ts`
- `src/renderer/rustWasmTextEngineBoundary.ts`
- `src/renderer/thaiCorpusBoundary.ts`
- `src/renderer/rustybuzzShapingSmoke.ts`
- `src/renderer/textEngineAdapterSpi.ts`
- `src/renderer/textEngineEvidenceAcceptance.ts`
- `src/renderer/textEngineMeasurementDraftHandoff.ts`
- `fixtures/thai-measurement-corpus.v1.json`
- `fixtures/rustybuzz-shaping-smoke.v1.json`
- `docs/MEASUREMENT_PROFILE_IDENTITY_CONTRACT.md`
- `docs/RUST_WASM_TEXT_ENGINE_BOUNDARY.md`
- `docs/THAI_CORPUS_ORACLE_BOUNDARY.md`
- `docs/RUSTYBUZZ_SHAPING_SMOKE_BOUNDARY.md`
- `docs/TEXT_ENGINE_ADAPTER_SPI_BOUNDARY.md`
- `docs/TEXT_ENGINE_EVIDENCE_ACCEPTANCE_BOUNDARY.md`
- `docs/TEXT_ENGINE_MEASUREMENT_DRAFT_HANDOFF_BOUNDARY.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/measurementProfileIdentity.test.ts`
- `tests/rustWasmTextEngineBoundary.test.ts`
- `tests/thaiCorpusBoundary.test.ts`
- `tests/rustybuzzShapingSmoke.test.ts`
- `tests/textEngineAdapterSpi.test.ts`
- `tests/textEngineEvidenceAcceptance.test.ts`
- `tests/textEngineMeasurementDraftHandoff.test.ts`

## Behavior Changed

- The core package now has a complete pure contract lane from measurement
  identity through adapter request, accepted evidence, and measurement draft
  handoff.
- Glyph facts remain separate evidence and are not part of
  `VNextTextMeasurementDraft`.
- No concrete adapter, engine execution, segmentation execution, production
  measurement binding, pagination replacement, or package/document schema
  behavior changed.

## Tests Run

- `npm.cmd test -- tests/measurementProfileIdentity.test.ts`
- `npm.cmd test -- tests/rustWasmTextEngineBoundary.test.ts`
- `npm.cmd test -- tests/thaiCorpusBoundary.test.ts`
- `npm.cmd test -- tests/rustybuzzShapingSmoke.test.ts`
- `npm.cmd test -- tests/textEngineAdapterSpi.test.ts`
- `npm.cmd test -- tests/textEngineEvidenceAcceptance.test.ts`
- `npm.cmd test -- tests/textEngineMeasurementDraftHandoff.test.ts`
- `npm.cmd run type-check`
- `npm.cmd run check`

## Risks Left

- Build the external text engine adapter package.
- Pin rustybuzz/ICU4X/ICU4X data/WASM digests.
- Capture real glyph ids, advances, offsets, clusters, and line boxes.
- Run Thai segmentation/oracle comparisons.
- Prove deterministic results across Node/browser/worker targets.
- Wire accepted adapter evidence through a renderer-backed measurement provider.
- Design caret/selection consumers for cluster-map evidence.

## Intentionally Not Changed

- No package/document schema changes.
- No parent editor imports.
- No legacy runtime adoption.
- No concrete adapter package.
- No rustybuzz, HarfBuzz, ICU4X, WASM, font parser, DOM, canvas, PDF, DOCX, or
  browser renderer dependency.
- No font-file reads in core.
- No shaping, segmentation, Thai oracle, PDF, DOCX, or renderer execution.
- No glyph evidence capture from real engine output.
- No production measurement binding.
- No measured pagination replacement.
- No artifact bytes, filesystem writes, storage writes, or network writes.
