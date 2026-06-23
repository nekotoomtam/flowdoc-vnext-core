# Template Builder WYSIWYG Execution Re-baseline Audit

Status: Phase 121 post-120 re-baseline audit.

Phase 121 closes the first WYSIWYG execution pass after Phases 117-120. It does
not add runtime behavior. Its job is to preserve what the browser-local
execution boundaries proved, name what remains non-canonical, and sequence the
next production-editing cards before the work moves again.

## PASS

- Phase 117 maps bounded contenteditable-like segment facts into FlowDoc
  UTF-16 draft ranges:
  `docs/TEMPLATE_BUILDER_CONTENTEDITABLE_RANGE_MAPPING_BOUNDARY.md`.
- Phase 118 consumes mapped ranges and style intent to record browser-local
  styled-run facts:
  `docs/TEMPLATE_BUILDER_RICH_INLINE_PATCH_EXECUTION_BOUNDARY.md`.
- Phase 119 routes visible draft toolbar style controls through rich inline
  execution:
  `docs/TEMPLATE_BUILDER_TOOLBAR_COMMAND_DISPATCH_BOUNDARY.md`.
- Phase 120 records browser-local atomic field-chip facts from mapped carets
  and field catalog intent:
  `docs/TEMPLATE_BUILDER_FIELD_CHIP_INSERT_EXECUTION_BOUNDARY.md`.
- The Phase 117-120 modules keep package mutation, core transactions, durable
  history, live layout, exact output, backend API calls, persistence,
  collaboration, and text-engine/WASM execution deferred or off.
- Tests in `tests/templateBuilderSandboxBoundary.test.ts` execute ready,
  guarded, blocked, composing, and idle paths for the new WYSIWYG execution
  boundaries.

## FAIL / BLOCKER

- No blocker prevents continuing to Phase 122.

## RISK

- The active sandbox editing surface is still textarea-driven; Phase 117
  consumes bounded segment facts but does not bind real DOM `Range` objects.
- Browser-local styled runs and atomic chips are evidence records, not a unified
  rich inline draft model.
- Toolbar dispatch is apply-style only; active mark detection, toggle behavior,
  overlap normalization, and keyboard shortcuts are still undefined.
- Field chip insertion records atomic chip facts but does not perform canonical
  `field-ref` insertion or key migration.
- Commit-time package mutation, durable history grouping, live layout
  invalidation, exact renderer/export parity, persistence, and collaboration
  remain unimplemented.

## UNKNOWN

- How a production contenteditable surface should normalize nested DOM nodes,
  text nodes, atomic chip wrappers, bidi/caret affinity, and IME composition.
- How browser-local styled runs and atomic chips should merge with authored
  package inline children before commit.
- Whether canonical rich inline commits should reuse existing text transaction
  boundaries directly or introduce a richer mixed-inline transaction layer.
- How renderer-backed measurement and text-engine shaping evidence should
  participate before or after commit.
- How undo/redo, collaboration conflict resolution, and persisted sessions
  should group mixed text/style/field-chip edits.

## Phase Cards

### Phase 122 Browser-local Rich Inline State Boundary

Goal:

- consolidate browser-local plain text, styled-run facts, and atomic chip facts
  into one normalized rich inline draft state.

Acceptance:

- consumes Phase 118 styled-run facts and Phase 120 atomic chip facts;
- preserves plain text and establishes deterministic ordering for style runs
  and chips;
- blocks overlapping/ambiguous runs explicitly instead of silently flattening;
- keeps canonical package mutation, durable history, live layout, exact output,
  backend API, persistence, collaboration, and WASM execution off.

### Phase 123 Production Contenteditable Segment Capture Boundary

Goal:

- capture bounded segment facts from a real contenteditable-style surface
  without moving DOM state into core or package truth.

Acceptance:

- emits the Phase 117 segment contract from browser-owned DOM inspection;
- covers text segments, styled-run wrappers, atomic chip wrappers, collapsed
  selection, non-collapsed selection, and composition guard states;
- keeps the pure mapper reusable in Node tests;
- keeps canonical package mutation, durable history, live layout, exact output,
  backend API, persistence, collaboration, and WASM execution off.

### Phase 124 Canonical Rich Inline Commit Planning Boundary

Goal:

- plan how browser-local rich inline draft state would become canonical vNext
  inline package mutations without executing the commit yet.

Acceptance:

- maps browser-local style runs and atomic chips to vNext terms;
- names required transaction, dirty-scope, history, key-history, and renderer
  invalidation facts;
- blocks unsupported overlap, stale revision, missing field key, and
  text-mismatch cases;
- keeps package mutation, persistence, backend API, live layout execution, and
  exact output execution deferred.

### Phase 125 Rich Inline Commit Bridge Boundary

Goal:

- execute the first bounded canonical commit path for accepted rich inline draft
  state through vNext-native operations.

Acceptance:

- consumes Phase 124 commit plans only;
- produces package mutation and history-ready records through vNext-native
  boundaries, not parent runtime code;
- invalidates live/exact outputs through existing contracts without rendering
  artifacts;
- keeps persistence, collaboration, renderer output, and WASM/text-engine
  replacement out of scope.

### Phase 126 WYSIWYG Execution Close Audit

Goal:

- close the post-120 execution lane and decide whether the next pass should
  continue toward production contenteditable hardening, canonical persistence,
  live layout, or exact output parity.

Acceptance:

- records PASS/FAIL/RISK/UNKNOWN after Phases 122-125;
- confirms no legacy runtime adoption or parent editor imports;
- lists remaining production gaps with explicit phase cards.

## Files Changed In This Pass

- `docs/TEMPLATE_BUILDER_WYSIWYG_EXECUTION_REBASELINE_AUDIT.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/wysiwygExecutionRebaselineAudit.test.ts`

## Behavior Changed

- No runtime behavior changed. This phase adds governance, risk re-baselining,
  and phase cards for the next WYSIWYG execution pass.

## Tests Run

- `npm.cmd test -- tests/wysiwygExecutionRebaselineAudit.test.ts`
- `npm.cmd run check`

## Risks Left

- Production contenteditable segment capture remains future work.
- Unified browser-local rich inline state remains future work.
- Canonical rich inline commit planning and execution remain future work.
- Durable history, live layout invalidation, exact output parity, persistence,
  collaboration, and text-engine/WASM production binding remain future work.

## Intentionally Not Changed

- No package/document schema changes.
- No parent editor imports.
- No legacy runtime adoption.
- No production contenteditable DOM binding.
- No canonical rich inline commit or field-ref insertion.
- No key migration write, durable history write, live layout request, exact
  renderer output, backend route, persistence, collaboration, or WASM execution.
