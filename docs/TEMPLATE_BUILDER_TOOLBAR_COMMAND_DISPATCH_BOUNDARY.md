# Template Builder Toolbar Command Dispatch Boundary

Phase 119 wires visible browser-local toolbar style commands through the Phase
118 rich inline patch execution boundary. It dispatches style commands into
local patch results without mutating canonical package truth.

## PASS

- `examples/template-builder-sandbox/public/draftToolbarCommandDispatch.js`
  owns `createDraftToolbarCommandDispatch(...)` and
  `draftToolbarCommandDispatchLabel(...)`.
- The dispatcher consumes `draftToolbarState` and
  `draftRichInlinePatchExecution` summaries.
- Toolbar commands dispatch only when the toolbar control is ready and rich
  inline execution is ready for the selected style mark.
- Visible draft toolbar controls are rendered in the inspector through
  `data-draft-toolbar-command`.
- Dispatch results surface through `data-draft-toolbar-dispatch` in the canvas
  draft footer, inspector, and status bar.
- Active mark state remains explicit and guarded as unknown until richer inline
  mark detection exists.
- Unsupported style commands, collapsed ranges, unready rich inline execution,
  inactive drafts, and IME composition are guarded or blocked explicitly.

## FAIL / BLOCKER

- None for the Phase 119 boundary.

## RISK

- Dispatch currently produces a single browser-local patch result; it does not
  merge multiple styled runs or toggle active marks.
- Visible controls still operate inside the sandbox inspector, not a production
  editor toolbar surface.
- Commit, undo/redo grouping, renderer parity, export, persistence, and
  collaboration remain later boundaries.

## UNKNOWN

- How active style detection should combine authored package runs and
  browser-local draft runs.
- Whether toolbar commands should be apply-only, toggle, or mode-aware once
  overlapping rich inline state exists.
- How keyboard shortcuts and accessibility affordances should share the same
  dispatch policy.

## Files Changed

- `docs/TEMPLATE_BUILDER_TOOLBAR_COMMAND_DISPATCH_BOUNDARY.md`
- `examples/template-builder-sandbox/public/draftToolbarCommandDispatch.js`
- `examples/template-builder-sandbox/public/app.js`
- `examples/template-builder-sandbox/public/styles.css`
- `examples/template-builder-sandbox/src/coreBoundary.ts`
- `examples/template-builder-sandbox/public/sandbox-snapshot.json`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/templateBuilderSandboxBoundary.test.ts`

## Behavior Changed

- The sandbox inspector now renders style command buttons for active drafts.
- Clicking a ready style command dispatches through the rich inline execution
  boundary and records a browser-local patch result.
- No canonical package mutation, core transaction, durable history write, live
  layout request, exact output, backend API call, persistence, collaboration, or
  text-engine execution is performed.

## Tests Run

- `npm.cmd test -- tests/templateBuilderSandboxBoundary.test.ts`
- `npm.cmd run check`

## Risks Left

- Field chip insertion must join the same browser-local rich inline state in
  Phase 120.
- Active mark detection and toggle/merge semantics remain unknown.
- Production toolbar placement, shortcuts, history grouping, and commit
  semantics remain later work.

## Intentionally Not Changed

- No package/document schema changes.
- No parent editor runtime or legacy editor imports.
- No field chip insertion.
- No canonical inline mutation or durable history write.
- No live layout request, exact output, backend route, persistence,
  collaboration behavior, or WASM/text-engine execution.
