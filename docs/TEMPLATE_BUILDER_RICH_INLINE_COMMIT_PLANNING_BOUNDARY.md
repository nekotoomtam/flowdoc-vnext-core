# Template Builder Rich Inline Commit Planning Boundary

Status: Phase 124 canonical rich inline commit planning boundary.

Phase 124 maps the browser-local rich inline draft state into canonical vNext
inline commit facts. It plans the package mutation, transaction, dirty scope,
history, key-history, live-layout, and exact-output effects without applying
them.

## PASS

- `examples/template-builder-sandbox/public/draftRichInlineCommitPlan.js` owns
  `createDraftRichInlineCommitPlan(...)` and
  `draftRichInlineCommitPlanLabel(...)`.
- The planner consumes Phase 122 `browserRichInlineState` records and emits
  canonical vNext inline child shapes: `text` children with style objects and
  `field-ref` children with key/label/fallback metadata.
- The planner records the intended `text-block.rich-inline.replace` operation,
  planned dirty scope, history intent, key-history check, renderer
  invalidation, live-layout invalidation, and exact-output stale marker.
- The planner blocks non-ready rich inline state, stale draft revision, target
  drift, text drift, unsupported overlap, unsupported style marks, missing
  field keys, invalid segment ranges, and segment text mismatch.
- `examples/template-builder-sandbox/public/app.js` surfaces
  `data-draft-rich-inline-commit-plan` in the draft footer, inspector, and
  status bar.
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.planRichInlineCommit` as a wired browser-local action lane.
- `tests/templateBuilderSandboxBoundary.test.ts` proves planned style+field
  commits, text-only commits, stale revision blocking, text mismatch blocking,
  missing field-key blocking, overlap blocking, and composition guard behavior.

## FAIL / BLOCKER

- None for the Phase 124 planning boundary.

## RISK

- The plan uses a new `text-block.rich-inline.replace` operation name that is
  not executed yet. Phase 125 must decide whether to implement that operation
  directly or decompose it through vNext-native transaction helpers.
- Dirty scope parent ids are marked as resolved by the core graph at commit
  time, not calculated in the browser-local planner.
- Style conversion currently maps the supported browser marks to the existing
  vNext style fields only: bold, italic, underline, and strikethrough.

## UNKNOWN

- Whether canonical rich inline commit should replace the full inline child
  list or become a granular mixed-inline transaction sequence.
- How durable undo/redo should group style-only, chip-only, and mixed
  style+field edits after commit execution exists.
- How collaboration conflict handling should compare planned rich inline state
  against concurrent package revisions.

## Files Changed

- `docs/TEMPLATE_BUILDER_RICH_INLINE_COMMIT_PLANNING_BOUNDARY.md`
- `examples/template-builder-sandbox/public/draftRichInlineCommitPlan.js`
- `examples/template-builder-sandbox/public/app.js`
- `examples/template-builder-sandbox/src/coreBoundary.ts`
- `examples/template-builder-sandbox/public/sandbox-snapshot.json`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/templateBuilderSandboxBoundary.test.ts`

## Behavior Changed

- Active browser drafts now expose a rich inline commit plan summary after rich
  inline state normalization.
- The plan converts browser-local rich inline segments to canonical vNext
  inline child facts.
- No package document state, core transaction, durable history record, live
  layout execution, exact output generation, backend call, persistence write,
  collaboration behavior, or text-engine execution is performed.

## Tests Run

- `npm.cmd run build` in `examples/template-builder-sandbox`
- `npm.cmd test -- tests/templateBuilderSandboxBoundary.test.ts --testTimeout=30000`
- `npm.cmd run check`

## Risks Left

- Execute accepted commit plans through vNext-native operations in Phase 125.
- Decide whether full inline-child replacement is the right canonical mutation
  shape or only the first bridge boundary.
- Add durable history grouping, live layout invalidation, exact output
  invalidation, persistence, and collaboration behavior after commit execution.

## Intentionally Not Changed

- No package/document schema changes.
- No parent editor runtime or legacy editor imports.
- No package mutation execution.
- No canonical field-ref insertion execution.
- No key migration write, durable history write, live layout request, exact
  output render, backend route, persistence, collaboration behavior, ICU4X
  execution, or WASM/text-engine measurement.
