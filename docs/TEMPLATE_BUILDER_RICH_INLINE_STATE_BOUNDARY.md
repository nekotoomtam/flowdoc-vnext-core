# Template Builder Rich Inline State Boundary

Status: Phase 122 browser-local rich inline state boundary.

Phase 122 consolidates the Phase 118 styled-run facts and Phase 120 atomic
field-chip facts into one browser-local rich inline draft state. It does not
commit canonical package inline children.

## Boundary

The boundary lives in
`examples/template-builder-sandbox/public/draftRichInlineState.js`.

It exposes:

- `DRAFT_RICH_INLINE_STATE_SOURCE`;
- `DRAFT_RICH_INLINE_STATE_MODE`;
- `createDraftRichInlineState(...)`;
- `draftRichInlineStateLabel(...)`.

The state consumes:

- active browser draft plain text;
- Phase 118 `browserInlineState.styledRuns`;
- Phase 119 toolbar dispatch patch results when present;
- Phase 120 `browserInlineState.atomicChips`.

The normalized state records:

- preserved plain text and UTF-16 text length;
- deterministically ordered styled runs;
- deterministically ordered atomic chips;
- text and atomic-chip segments ordered by UTF-16 position;
- explicit blockers for unsupported inline states, target drift, text drift,
  invalid style ranges, invalid chip positions, duplicate chips, overlapping
  style runs, and chips inside styled-run interiors.

## Truth

This boundary may normalize browser-local WYSIWYG execution evidence for later
canonical commit planning.

This boundary must not:

- mutate package/document data;
- write durable history;
- request live layout;
- execute exact output;
- call backend routes;
- persist state;
- add collaboration behavior;
- execute text-engine, WASM, DOM range, PDF, or DOCX measurement.

## Acceptance Evidence

- `tests/templateBuilderSandboxBoundary.test.ts` proves idle, text-only,
  ready style-plus-chip, overlapping-style blocked, and composing paths.
- `examples/template-builder-sandbox/public/app.js` surfaces
  `data-draft-rich-inline-state` beside the other WYSIWYG execution summaries.
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.normalizeDraftRichInlineState` as a wired browser-local action lane.

## Non-Goals

No production contenteditable DOM segment capture, canonical rich inline
commit, canonical field-ref insertion, key migration write, durable history
write, live layout request, exact renderer output, backend route, persistence,
collaboration behavior, ICU4X execution, or WASM/text-engine measurement is
introduced in this phase.
