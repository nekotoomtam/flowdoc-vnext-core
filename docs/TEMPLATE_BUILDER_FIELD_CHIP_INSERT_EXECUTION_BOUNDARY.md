# Template Builder Field Chip Insert Execution Boundary

Phase 120 executes field chip insertion intent into browser-local atomic chip
facts. It consumes Phase 117 caret mapping and Phase 83 field chip intent while
keeping canonical field refs and package truth deferred.

## PASS

- `examples/template-builder-sandbox/public/draftFieldChipInsertExecution.js`
  owns `createDraftFieldChipInsertExecution(...)` and
  `draftFieldChipInsertExecutionLabel(...)`.
- The executor consumes ready `draftContenteditableRangeMapping` caret facts and
  ready `draftFieldChipInline` intent.
- Ready caret insertions create a browser-local atomic chip with field key,
  label, type, data status, usage count, placeholder, position, and source
  command.
- Plain draft text is preserved; any existing browser-local styled runs are
  carried forward.
- Non-collapsed ranges, missing field catalogs, unsupported rich inline state,
  inactive drafts, and IME composition are guarded or blocked explicitly.
- `examples/template-builder-sandbox/public/app.js` surfaces
  `data-draft-field-chip-insert`.
- `examples/template-builder-sandbox/src/coreBoundary.ts` advertises
  `browser.executeDraftFieldChipInsert`.

## FAIL / BLOCKER

- None for the Phase 120 boundary.

## RISK

- Atomic chip facts are browser-local evidence only; canonical `field-ref`
  package mutation and key migration remain later work.
- Field catalog selection is still the sandbox default selected key, not a full
  production picker.
- Mixed styled-run and chip ordering/normalization still needs a future rich
  inline state model.

## UNKNOWN

- How field chips should behave inside overlapping styled runs and IME sessions
  in a production contenteditable surface.
- How key migration and missing-field diagnostics should reconcile draft-local
  chips before commit.
- How exact output and DOCX/PDF renderers should measure atomic chip placeholders
  before canonical field refs exist.

## Files Changed

- `docs/TEMPLATE_BUILDER_FIELD_CHIP_INSERT_EXECUTION_BOUNDARY.md`
- `examples/template-builder-sandbox/public/draftFieldChipInsertExecution.js`
- `examples/template-builder-sandbox/public/app.js`
- `examples/template-builder-sandbox/src/coreBoundary.ts`
- `examples/template-builder-sandbox/public/sandbox-snapshot.json`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/templateBuilderSandboxBoundary.test.ts`

## Behavior Changed

- Active browser drafts now expose browser-local atomic field chip insertion
  facts when caret mapping and field chip intent are ready.
- No canonical field-ref mutation, key migration, package mutation, core
  transaction, durable history write, live layout request, exact output, backend
  API call, persistence, collaboration, or text-engine execution is performed.

## Tests Run

- `npm.cmd test -- tests/templateBuilderSandboxBoundary.test.ts`
- `npm.cmd run check`

## Risks Left

- Define canonical rich inline state that can merge text, styled runs, and atomic
  chips.
- Commit field chip facts through a package transaction, key migration, and
  durable history boundary.
- Add production field picker UI, keyboard shortcuts, diagnostics, and renderer
  parity.

## Intentionally Not Changed

- No package/document schema changes.
- No parent editor runtime or legacy editor imports.
- No canonical field-ref insertion.
- No key migration write.
- No durable history write, live layout request, exact output, backend route,
  persistence, collaboration behavior, or WASM/text-engine execution.
