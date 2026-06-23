# Text Engine Measurement Draft Handoff Boundary

Status: Phase 110 measurement draft handoff boundary.

Phase 110 maps accepted text engine evidence into the existing
pagination-facing `VNextTextMeasurementDraft`. This is the first handoff from
the glyph fact evidence lane back to the measurement path, but it deliberately
drops glyph facts from the draft. Glyph and cluster facts remain preserved in
accepted evidence for future caret and selection consumers.

## Evidence

- `src/renderer/textEngineMeasurementDraftHandoff.ts` derives lines and line
  boxes from accepted evidence and the original adapter request text.
- `tests/textEngineMeasurementDraftHandoff.test.ts` proves successful draft
  derivation, blocked unsafe handoff policy, blocked non-accepted evidence,
  source independence, and documentation trail.

## Boundary

Allowed:

- consume an accepted text engine evidence plan;
- derive `VNextTextMeasurementDraft.lines` from request text ranges;
- derive pagination-facing line boxes from accepted line box facts;
- compute draft width/height/line height from accepted evidence;
- expose `dropsGlyphFactsFromDraft: true` in the handoff contract;
- leave glyph facts on the separate evidence lane.

Blocked:

- production measurement binding;
- text engine execution;
- evidence mutation;
- attaching glyph facts to `VNextTextMeasurementDraft`;
- replacing pagination measurement;
- malformed line ranges or line metrics.

## Result

Phase 110 closes the safe handoff path: external adapter evidence can be
accepted first, then transformed into the existing pagination measurement draft
without changing the draft shape or making core own shaping execution.

## Non-goals

No adapter package, Rust package, JS dependency, WASM build, rustybuzz/HarfBuzz
execution, ICU4X execution, font parsing, glyph capture, Thai oracle execution,
production measurement binding, pagination replacement, renderer output,
backend route, artifact write, storage write, or package/document schema change
is introduced in this phase.
