# TOC V4 Measurement Lane Readiness Close Audit

Status: Phase 346 close audit.

## Outcome

The TOC v4 measurement lane is ready as a pure generated-layout contract over
accepted TOC semantic entries and the generic text-measurer boundary. Core can
measure optional title and keep-together entry rows, reserve a fixed trailing
page-number column, expose wrapped label and leader geometry, report fit and
overflow, refit height without text measurement, and enforce bounded work.

This closes measurement readiness only. It does not claim page assignment,
pagination convergence, final page-number replacement, renderer commands,
artifact output, TOC authoring, backend persistence, or editor UI.

## PASS

- Measurement requires a ready/partial semantic plan, an existing TOC id,
  positive finite width/height, non-blank profile/style keys, complete level
  styles/indents, explicit geometry, digit capacity, and positive budgets.
- Blocked semantic input, missing TOC, invalid geometry/style/budget, impossible
  label width, malformed measurer output, and capacity overflow return no
  partial layout.
- The TOC title uses full width and carries `keep-with-first-entry`; an absent or
  empty title contributes no geometry or gap.
- Entry labels use level-specific style and indentation and may wrap to multiple
  measured lines.
- Every entry row is `keep-together`; row height is the maximum of label and
  one-line page-number sample height.
- The fixed page-number column has one x/width across all levels. Indentation
  reduces label width without shifting the number column.
- Digit capacity is proven with a same-length `8` sample that must remain one
  valid measured line inside the fixed column.
- Leader geometry starts after the final measured label line and ends before
  the number column with the configured minimum width and gaps.
- Line-box index, width, height, and y-offset facts are validated before layout
  is accepted.
- Measurement reports `fits`, `split-required`, or `forced-row-overflow`, total
  height, minimum first-fragment height, and exact forced row identities.
- Geometry and fit fingerprints are separate. Cache hit/miss execution facts do
  not change geometry identity.
- Height-only refit preserves title/row geometry and performs zero text
  measurements while changing only fit facts/fingerprint.
- Comparison distinguishes unchanged, fit-only, geometry-changed, and blocked
  states with text/fit/pagination recommendations.
- Entry count blocks before row measurement. Exact measured-line budget blocks
  before a ready layout is returned.
- A 1,000-entry TOC produces byte-identical repeated output with exactly 1,002
  text measurements and lines, 16,020pt total height, and stable number-column
  geometry.
- Refit to a 10pt height reports all 1,000 rows as forced overflow with zero
  text measurement.
- Entry and line budgets block deterministically one unit below exact work.

## FAIL / BLOCKER

None for the bounded TOC v4 generated measurement profile.

Exact visual output remains blocked until a production-qualified text measurer
and renderer consume these contracts. Pagination integration must group rows,
keep title with the first row, and resolve forced overflow without remeasuring
or mutating retained geometry.

## RISK

- The approximate measurer used by deterministic tests is contract evidence,
  not production visual-exact shaping evidence.
- Style keys are opaque inputs; style-catalog resolution and font availability
  remain upstream measurement concerns.
- Digit capacity selected too low for final page counts requires explicit
  remeasurement; silent widening is prohibited.
- Keep-together can force overflow for an exceptionally tall wrapped label.
- The measured-line budget is exact post-measure protection, not CPU
  cancellation before every text call.
- One measurement per generated entry is proportional to required output size;
  production performance depends on stable cache keys and measurer cost.

## UNKNOWN

- Product defaults for title/entry/page styles, indentation, gaps, leader
  glyph/style, digit capacity, and work budgets.
- Right-to-left label, leader, and number-column behavior.
- Roman, decimal-prefixed, or section-prefixed page-number capacity rules.
- Whether future policy may split an exceptionally tall entry row.
- Production cache retention and cross-instance sharing policy.

## Files Changed

- Architecture: `docs/TOC_V4_MEASUREMENT_LANE_ARCHITECTURE_LOCK.md`.
- Measurement, validation, refit, and impact: `src/toc/tocV4Measurement.ts`.
- Public exports, phase trail, focused geometry/overflow tests, malformed
  measurer evidence, and 1,000-entry scale/budget evidence.

## Behavior Changed

- Core now exposes generated TOC row geometry instead of treating TOC as one
  placeholder text block for future v4 consumers.
- Number capacity is explicit and fixed before pagination rather than inferred
  from final page values.
- Available-height changes can recompute fit without rerunning text measurement.
- Consumers can distinguish geometry invalidation from fit-only invalidation.

## Tests Run

- Core before this document: type-check and 273 test files / 1,407 tests.
- Final core: type-check and 274 test files / 1,409 tests.
- Editor: type-check, 27 test files / 157 tests, and production build.
- Backend: type-check, 13 test files / 45 tests, and build.

## Risks Left

- V4 pagination must consume complete rows and keep title with first entry.
- Final v4 heading-page resolution must enforce retained digit capacity.
- Renderer adapters must consume label lines, leader, and number areas without
  relayout.
- Production text shaping/font evidence remains required for visual exactness.
- Authoring commands/UI and backend persistence remain separate work.

## Intentionally Not Changed

- canonical document v4 and TOC semantic schemas/contracts;
- generic text-measurement engine or native shaping adapters;
- document v3 placeholder TOC pagination and final page resolver;
- v4 pagination, renderer, PDF, or DOCX execution;
- TOC authoring operations, backend routes/storage, and editor state/UI.

## Next Recommended Direction

Move to the TOC v4 pagination lane. Build a cursor/checkpoint contract over
complete measured rows, keep title with the first row, emit deterministic page
fragments, handle forced rows explicitly, and preserve measured geometry before
adding final heading-page reference replacement or renderer consumption.
