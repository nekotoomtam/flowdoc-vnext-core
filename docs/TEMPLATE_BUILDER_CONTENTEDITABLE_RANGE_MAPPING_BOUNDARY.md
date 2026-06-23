# Template Builder Contenteditable Range Mapping Boundary

Phase 117 adds a browser-local range mapping boundary for future
contenteditable editing. The boundary consumes bounded segment facts instead of
live DOM nodes, then maps anchor/focus selection positions to FlowDoc draft
UTF-16 offsets.

## PASS

- `examples/template-builder-sandbox/public/draftContenteditableRangeMapping.js`
  owns `createDraftContenteditableRangeMapping(...)` and
  `draftContenteditableRangeMappingLabel(...)`.
- The mapper accepts segment facts with `segmentId`, text, kind, draft start,
  and draft end, then resolves anchor/focus endpoints into
  `utf16-code-unit-offset` ranges.
- The mapper blocks styled text runs, atomic inline/field chip segments, segment
  coverage drift, text mismatches, missing segment endpoints, and out-of-range
  endpoints before reporting a ready range.
- `examples/template-builder-sandbox/public/app.js` surfaces the mapping through
  `data-draft-contenteditable-range` in the canvas draft footer, inspector, and
  status bar.
- `examples/template-builder-sandbox/src/coreBoundary.ts` advertises
  `browser.mapContenteditableRange` as a browser-local action lane.
- `tests/templateBuilderSandboxBoundary.test.ts` executes the mapper and proves
  ready, composing, styled-run, atomic-inline, and text-mismatch behavior.

## FAIL / BLOCKER

- None for the Phase 117 boundary.

## RISK

- The current sandbox still renders the editable surface as a textarea; the new
  boundary uses textarea-derived plain segment facts as a bridge until a real
  contenteditable surface exists.
- Rich inline execution still needs a later phase to consume mapped ranges and
  apply authored inline runs.
- Browser DOM range quirks, nested inline nodes, bidirectional caret affinity,
  and IME composition behavior still require production browser testing.

## UNKNOWN

- Whether production contenteditable selection endpoints will be captured as
  text-node offsets, wrapper-node child indexes, or a normalized inline segment
  stream.
- Whether rich inline field chips should map as atomic nodes, typed chips, or
  editable placeholders.
- How collaboration, durable undo/redo, persistence, and renderer-backed caret
  measurement will consume these mapped ranges.

## Files Changed

- `docs/TEMPLATE_BUILDER_CONTENTEDITABLE_RANGE_MAPPING_BOUNDARY.md`
- `examples/template-builder-sandbox/public/draftContenteditableRangeMapping.js`
- `examples/template-builder-sandbox/public/app.js`
- `examples/template-builder-sandbox/src/coreBoundary.ts`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/templateBuilderSandboxBoundary.test.ts`

## Behavior Changed

- Active browser drafts now expose a contenteditable range mapping summary based
  on bounded plain-text segment facts.
- The sandbox action catalog now records `browser.mapContenteditableRange`.
- No package document state, core transaction, history record, live layout
  request, exact generation, or text-engine execution is performed.

## Tests Run

- `npm.cmd test -- tests/templateBuilderSandboxBoundary.test.ts`
- `npm.cmd run check`

## Risks Left

- Replace textarea-derived facts with real contenteditable segment capture.
- Feed mapped UTF-16 ranges into rich inline patch execution.
- Connect toolbar dispatch and field chip insertion to the mapped range without
  bypassing core package contracts.
- Add browser-level selection and IME coverage once the editable surface exists.

## Intentionally Not Changed

- No runtime package schema changes.
- No parent editor runtime or legacy editor imports.
- No DOM `Range` API binding inside the mapper.
- No inline style mutation, field-ref insertion, durable history write,
  collaboration behavior, persistence, backend route, live layout, exact output,
  or WASM/text-engine execution.
