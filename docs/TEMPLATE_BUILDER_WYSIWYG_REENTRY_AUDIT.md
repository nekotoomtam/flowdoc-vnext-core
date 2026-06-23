# Template Builder WYSIWYG Re-entry Audit

Status: Phase 116 re-entry audit.

Phase 116 re-enters the WYSIWYG / Editing lane after the text-engine work in
Phases 113-115. It does not add runtime behavior. Its job is to make the next
production-editing cards explicit so the work can continue without leaving the
Phase 78-85 browser-local foundation or the Phase 113-115 text evidence lane
half-used.

## PASS

- Phase 85 closed the browser-local WYSIWYG foundation:
  `docs/TEMPLATE_BUILDER_WYSIWYG_CLOSE_AUDIT.md`.
- Draft state, caret/selection normalization, text commands, and IME guards
  are owned by
  `examples/template-builder-sandbox/public/draftRuntime.js`.
- Layout preview, IME policy, style patch planning, toolbar state, field chip
  planning, and style-aware history have separate browser-safe modules.
- Phase 115 proved native rustybuzz smoke evidence can cover every Phase 107
  smoke case and map through accepted UTF-16 adapter evidence.
- The WYSIWYG lane must use FlowDoc text offsets, not raw rustybuzz byte
  clusters, when future caret/range work consumes shaping evidence.

## FAIL / BLOCKER

- No blocker prevents continuing to Phase 117.

## RISK

- The active WYSIWYG surface is still textarea/plain-text based.
- Rich inline style patch, toolbar dispatch, field chip insertion, and
  style-aware history are planning boundaries only.
- `app.js` still coordinates DOM binding, focus, fetch, packets, draft state,
  viewport state, structural state, and WYSIWYG planning summaries.
- Contenteditable DOM ranges can drift from FlowDoc text offsets if the mapper
  is not explicit about UTF-16 offsets, atomic inline placeholders, and styled
  run boundaries.
- The text-engine lane has native rustybuzz corpus coverage but not WASM
  parity, ICU4X line breaks, or production measurement binding.

## UNKNOWN

- Production IME behavior for Thai/browser-specific composition edge cases.
- Active mark detection over mixed authored inline runs.
- Exact renderer/export parity for rich inline styles and field chips.
- Durable undo/redo grouping for mixed text/style/field-chip edits.
- Collaboration and persistence conflict behavior for rich editing.

## Phase Cards

### Phase 117 Contenteditable DOM Range Mapping Boundary

Goal:

- introduce a browser-safe contenteditable range mapping module that converts
  between DOM-oriented range facts and FlowDoc UTF-16 draft ranges without
  applying rich edits.

Acceptance:

- module runs in Node without DOM access by consuming bounded DOM-like facts;
- maps collapsed and non-collapsed ranges to draft text offsets;
- blocks atomic inline, styled-run, and mismatched text cases explicitly;
- keeps package truth, history, live layout, exact output, and text-engine
  execution untouched.

### Phase 118 Rich Inline Range Patch Execution Boundary

Goal:

- execute rich inline style patch intent against browser-local draft inline
  ranges without committing package truth directly.

Acceptance:

- consumes Phase 117 range mapping and Phase 81 style intent;
- creates a bounded patch result for selected draft ranges;
- preserves plain text and records styled-run patch facts;
- keeps durable history, live layout, exact output, backend API, and package
  mutation deferred until a later commit boundary.

### Phase 119 Toolbar Command Dispatch Boundary

Goal:

- wire visible toolbar command dispatch to the ready rich inline command
  policies without bypassing IME, range, or style guards.

Acceptance:

- toolbar commands dispatch only when Phase 118 readiness is satisfied;
- active mark state remains explicit and guarded when unknown;
- command dispatch produces local patch results, not canonical document
  mutations;
- collapsed range, composition, unsupported style, and inactive draft states
  remain blocked.

### Phase 120 Field Chip Insert Execution Boundary

Goal:

- execute field chip insertion into browser-local rich inline draft state at
  caret positions while preserving the future canonical `field-ref` boundary.

Acceptance:

- consumes Phase 117 caret mapping and Phase 83 field chip intent;
- inserts a local atomic chip placeholder with field key metadata;
- non-collapsed ranges, composition, missing field catalog, and unsupported
  rich inline states remain blocked;
- package truth, key migration, durable history, live layout, and exact output
  remain deferred until a later commit boundary.

## Files Changed In This Pass

- `docs/TEMPLATE_BUILDER_WYSIWYG_REENTRY_AUDIT.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/wysiwygReentryAudit.test.ts`

## Behavior Changed

- No runtime behavior changed. This phase adds governance, phase cards, and
  guard tests for the next WYSIWYG production-editing pass.

## Tests Run

- `npm.cmd test -- tests/wysiwygReentryAudit.test.ts`
- `npm.cmd run check`

## Risks Left

- Contenteditable range mapping remains future work.
- Rich inline patch execution remains future work.
- Toolbar dispatch remains future work.
- Field chip insertion remains future work.
- WASM parity and ICU4X line breaks remain future text-engine work.

## Intentionally Not Changed

- No package/document schema changes.
- No parent editor imports.
- No legacy runtime adoption.
- No contenteditable runtime behavior.
- No package mutation, history write, live layout request, exact renderer
  output, backend route, persistence, collaboration, or WASM execution.
