# Thai Line-Break Evidence Boundary

Status: Phase 132 line-break evidence manifest boundary.

Phase 132 adds a separate evidence manifest for Thai line-break opportunities.
The neutral Thai corpus remains source text only; observed ICU4X,
Intl.Segmenter, and future Thai oracle candidate output lives beside it in a
manifest that can be validated without executing any segmenter.

## Evidence

- `fixtures/thai-line-break-evidence.v1.json` records line-break observations
  for the Phase 106 Thai corpus samples.
- ICU4X entries are the primary deterministic candidate and carry engine
  revision, data revision, line-break policy, UTF-16 break offsets, break
  kinds, and seeded-evidence warnings.
- Intl.Segmenter entries are comparison baselines only. They are explicitly
  runtime-dependent and cannot become primary truth in this boundary.
- `src/renderer/thaiLineBreakEvidence.ts` validates the manifest against
  `fixtures/thai-measurement-corpus.v1.json` without importing ICU4X,
  Intl.Segmenter, LibThai, PyThaiNLP, AttaCut, DOM, PDF, or DOCX code.
- `tests/thaiLineBreakEvidence.test.ts` proves manifest validation, unknown
  sample rejection, duplicate id rejection, deterministic revision requirements,
  Intl baseline policy, source corpus neutrality, and documentation trail.

## Boundary

Allowed:

- validate a separate line-break evidence manifest against the neutral Thai
  corpus;
- record candidate engine, role, engine revision, data revision, line-break
  policy, UTF-16 break offsets, break kind, and warnings;
- mark ICU4X as primary deterministic evidence;
- mark Intl.Segmenter as comparison baseline only;
- reserve Thai oracle candidates as evidence candidates, not truth.

Blocked:

- mutating `fixtures/thai-measurement-corpus.v1.json` with expected breaks;
- executing ICU4X, Intl.Segmenter, LibThai, PyThaiNLP, or AttaCut;
- computing line boxes or multi-line wrapping;
- replacing pagination measurement;
- binding production measurement;
- changing package/document schema;
- adding renderer, DOM, WASM, or concrete text engine dependencies to core.

## Result

The text-engine lane now has a UTF-16-safe break opportunity manifest that
Phase 133 can consume with rustybuzz glyph advances for multi-line wrapping
evidence. The manifest is still evidence, not production measurement truth.

## PASS

- The Thai corpus remains neutral source text in
  `fixtures/thai-measurement-corpus.v1.json`.
- Line-break opportunities are recorded separately in
  `fixtures/thai-line-break-evidence.v1.json`.
- ICU4X is the primary deterministic candidate and carries engine revision,
  data revision, and line-break policy metadata.
- Intl.Segmenter remains a runtime-dependent comparison baseline only.
- UTF-16 break offsets, break kinds, final sample breaks, duplicate ids, and
  unknown sample ids are validated by `src/renderer/thaiLineBreakEvidence.ts`.

## FAIL / BLOCKER

- No blocker was found for closing this evidence-manifest boundary.

## RISK

- The current fixture is seeded contract evidence, not proof that ICU4X has run
  in this repository.
- Break kinds are kept on the line-break evidence lane; Phase 133 must avoid
  widening public adapter line-box facts unless that is explicitly accepted.
- Thai oracle candidates remain future comparison evidence.

## UNKNOWN

- The concrete ICU4X package, data revision, and execution harness are still
  future work.
- Drift between seeded ICU4X, Intl.Segmenter, and future Thai oracle output is
  still unknown.
- Multi-line wrap behavior using these breaks and rustybuzz glyph advances is
  still future work.

## Files Changed

- `fixtures/thai-line-break-evidence.v1.json`
- `src/renderer/thaiLineBreakEvidence.ts`
- `src/index.ts`
- `docs/THAI_LINE_BREAK_EVIDENCE_BOUNDARY.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/thaiLineBreakEvidence.test.ts`

## Behavior Changed

- The core package now exposes a pure Thai line-break evidence manifest
  validator.
- No runtime segmentation, pagination, renderer, storage, or package/document
  schema behavior changed.

## Tests Run

- `npm.cmd test -- tests/thaiLineBreakEvidence.test.ts`
- `npm.cmd run check`

## Risks Left

- Replace seeded evidence with generated ICU4X/Intl/oracle observations through
  the same manifest boundary.
- Consume accepted break opportunities in the Phase 133 multi-line wrap
  evidence boundary.
- Keep production measurement binding blocked until drift and parity are
  proven.

## Intentionally Not Changed

- No mutation to `fixtures/thai-measurement-corpus.v1.json`.
- No ICU4X, Intl.Segmenter, LibThai, PyThaiNLP, or AttaCut execution.
- No line boxes, multi-line wrapping, pagination replacement, production
  measurement binding, renderer artifact output, backend route, storage write,
  dependency change, or package/document schema change.

## Non-goals

No concrete ICU4X execution, Intl.Segmenter execution, Thai oracle execution,
line-box computation, multi-line wrap, pagination measurer replacement,
production measurement binding, renderer artifact output, backend route,
storage write, package/document schema change, WASM build, or dependency change
is introduced in this phase.
