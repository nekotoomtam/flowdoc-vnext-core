# Template Builder Rich Inline Patch Execution Boundary

Phase 118 executes rich inline style patch intent into browser-local styled-run
facts. It consumes the Phase 117 contenteditable range mapping boundary and the
Phase 81 style patch intent boundary, while keeping canonical package truth
unchanged.

## PASS

- `examples/template-builder-sandbox/public/draftRichInlinePatchExecution.js`
  owns `createDraftRichInlinePatchExecution(...)` and
  `draftRichInlinePatchExecutionLabel(...)`.
- The executor consumes a ready `draftContenteditableRangeMapping` summary and
  a ready `draftInlineStylePatch` summary.
- Ready selected ranges create a bounded browser-local styled run with mark,
  enabled state, UTF-16 range, selected text preview, and source command.
- Plain draft text is preserved in the browser-local inline state.
- Collapsed or unready style/range states remain guarded, target mismatches and
  unsupported style marks are blocked, and IME composition stays composing.
- `examples/template-builder-sandbox/public/app.js` surfaces the execution
  summary through `data-draft-rich-inline-execution`.
- `examples/template-builder-sandbox/src/coreBoundary.ts` advertises
  `browser.executeRichInlinePatch` as a browser-local action lane.

## FAIL / BLOCKER

- None for the Phase 118 boundary.

## RISK

- The styled run is browser-local evidence only; it is not yet attached to a
  durable rich inline draft model with multiple overlapping runs.
- Toolbar dispatch still needs Phase 119 to trigger the executor from visible
  controls instead of the current default style intent.
- Commit-time package mutation, undo/redo grouping, renderer parity, and export
  semantics still need later boundaries.

## UNKNOWN

- How overlapping style runs should merge, split, toggle, or normalize in the
  future canonical inline model.
- How active mark detection should read browser-local styled runs and authored
  package runs together.
- Whether renderer-backed text measurement will need style-run shaping evidence
  before commit.

## Files Changed

- `docs/TEMPLATE_BUILDER_RICH_INLINE_PATCH_EXECUTION_BOUNDARY.md`
- `examples/template-builder-sandbox/public/draftRichInlinePatchExecution.js`
- `examples/template-builder-sandbox/public/app.js`
- `examples/template-builder-sandbox/src/coreBoundary.ts`
- `examples/template-builder-sandbox/public/sandbox-snapshot.json`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/templateBuilderSandboxBoundary.test.ts`

## Behavior Changed

- Active browser drafts now expose local rich inline patch execution facts when
  both range mapping and style patch intent are ready.
- The execution preserves plain text and records styled-run facts only in
  browser-local state.
- No canonical package mutation, core transaction, durable history write, live
  layout request, exact output, backend API call, or text-engine execution is
  performed.

## Tests Run

- `npm.cmd test -- tests/templateBuilderSandboxBoundary.test.ts`
- `npm.cmd run check`

## Risks Left

- Wire visible toolbar controls to dispatch through this execution boundary.
- Support field chip insertion into the same browser-local rich inline state.
- Define overlap/merge/toggle semantics for multiple styled runs.
- Commit browser-local rich inline facts through a later canonical package
  transaction and durable history boundary.

## Intentionally Not Changed

- No package/document schema changes.
- No parent editor runtime or legacy editor imports.
- No visible toolbar dispatch.
- No field chip insertion.
- No durable history write, live layout request, exact output, backend route,
  persistence, collaboration behavior, or WASM/text-engine execution.
