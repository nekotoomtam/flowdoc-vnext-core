# WYSIWYG Primary Input Decision Gate

Status: Phase 143 WYSIWYG primary input decision gate.

Phase 143 compares candidate primary input models for the first production
FlowDoc vNext editor. It is a decision gate only: no production input surface,
DOM binding, schema change, persistence write, collaboration behavior, or
renderer output is implemented here.

## Decision

Recommend: Hybrid managed cards with a hardened contenteditable island for the
currently edited text block.

Do not make full-document contenteditable the primary production input in v1.

The first production editor should keep the normalized editor view, viewport
windowing, structural packets, and renderer/page shell as the product surface.
When the user edits a text block, the active block can enter a hardened
contenteditable island that consumes segment facts, IME guards, field-chip
guards, and vNext commit operations. Atomic field chips and non-text structure
remain managed UI cards rather than arbitrary editable DOM.

This keeps editing in-place while avoiding a full-document contenteditable
runtime that would own too much selection, copy/paste, deletion, and structural
mutation behavior before storage, collaboration, and renderer segment parity
are ready.

## Evidence Read

- `docs/TEMPLATE_BUILDER_WYSIWYG_REENTRY_AUDIT.md`
- `docs/TEMPLATE_BUILDER_WYSIWYG_EXECUTION_CLOSE_AUDIT.md`
- `docs/TEMPLATE_BUILDER_RICH_INLINE_LIVE_EXACT_PARITY_AUDIT.md`
- `docs/TEMPLATE_BUILDER_CONTENTEDITABLE_SURFACE_HARDENING_BOUNDARY.md`
- `docs/FIVE_LANE_PROJECT_PROGRESS_INDEX.md`
- `docs/EDITOR_UX_NORTH_STAR.md`

## Decision Matrix

| Option | Thai IME | Caret/range mapping | Field chips | Rich inline style | Copy/paste/delete | Undo/redo | Exact renderer parity | Collaboration readiness | Implementation risk |
|---|---|---|---|---|---|---|---|---|---|
| Full-document contenteditable primary | High risk: browser DOM composition owns too much surface | High risk across nested blocks, generated content, and virtualized ranges | High risk: chips become editable DOM unless heavily guarded | Medium/high: styled spans need durable segment mapping | High risk: browser default deletion can cross structural boundaries | High risk: browser history conflicts with vNext history | Unknown until renderer segment stream is bound | Weak: concurrent DOM edits hard to merge | Highest |
| Textarea draft island | Lowest IME risk and already proven for plain text | Low for plain text, weak for rich mixed content | Weak: chips are outside native editing | Weak/medium: rich style needs side UI and patch planning | Medium: simple text safe, rich paste/delete limited | Strong for current transaction model | Medium: easy to compare plain text, weak for chips/styles | Medium: single-block commits are easier | Low |
| Renderer-owned segment stream primary | Promising but blocked on renderer-backed segment truth | Strong future path if renderer exposes line/segment hit-test facts | Strong future path with atomics as renderer facts | Strong future path for exact parity | Unknown until segment edit protocol exists | Unknown until operations are granular | Best long-term parity candidate | Medium/high: merge protocol still needed | High now |
| Hybrid managed cards + hardened contenteditable island | Medium: active block uses explicit IME/composition guard | Medium: bounded to active block and segment facts | Stronger: chips remain managed atomics | Medium: styled runs stay segment/operation facts | Medium: block-scoped paste/delete can be guarded | Strong enough for v1 through existing rich commit/replay | Medium now, improves with renderer-backed segments | Medium: block-scoped commits are mergeable later | Medium |

## Recommendation Rationale

- The UX north star requires in-place editing, not a detached inspector-only
  form.
- The existing textarea island is safest but too narrow for first rich
  production editing.
- Full-document contenteditable is too broad while renderer segment parity,
  storage-backed replay, and collaboration semantics are still open.
- Renderer-owned segment stream is the strongest long-term direction but is
  not ready to be the first input implementation.
- Hybrid managed cards preserve structural safety and let the active text block
  feel directly editable while keeping commits inside vNext operations.

## V1 Policy

- Use normalized editor view and viewport windowing as the active runtime
  shape.
- Keep non-text structure managed: blocks, tables, fields, generated content,
  page shell, and structural selection are not arbitrary contenteditable DOM.
- Open one active text-block editing island at a time.
- Consume hardened contenteditable segment/caret facts for rich inline blocks.
- Keep textarea/plain-text fallback for blocks that fail rich hardening.
- Commit through vNext text/rich inline operations and packet updates.
- Mark live/exact generation stale on accepted commits.
- Keep renderer-owned segment stream as a future upgrade path, not a v1
  blocker.

## PASS

- A first production input path is recommended.
- The recommendation respects the editor UX north star while preserving
  package/document truth.
- Thai IME, caret/range mapping, field chips, rich inline style, copy/paste,
  undo/redo, exact parity, collaboration, and implementation risk are explicit.

## FAIL / BLOCKER

- No blocker prevents using this decision as the next WYSIWYG direction.
- The decision does not authorize implementing contenteditable as the
  full-document primary input.

## RISK

- Hybrid input still needs production DOM range/caret/IME hardening beyond the
  sandbox evidence.
- Field-chip delete/copy/paste behavior needs explicit v1 commands.
- Renderer-backed line/segment hit testing is still future work.

## UNKNOWN

- Collaboration/offline merge semantics remain unknown.
- Final renderer-owned segment stream protocol remains unknown.
- Production browser support matrix and IME edge cases remain unknown.

## Files Changed

- `docs/WYSIWYG_PRIMARY_INPUT_DECISION_GATE.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/wysiwygPrimaryInputDecisionGate.test.ts`

## Behavior Changed

- No runtime behavior changed.
- The project now has an explicit primary input recommendation for the first
  production editor slice.

## Tests Run

- `npm.cmd test -- tests/wysiwygPrimaryInputDecisionGate.test.ts`
- `npm.cmd run check`

## Risks Left

- Implement the selected hybrid input path in a later phase.
- Decide granular rich inline operations before durable collaboration work.
- Add renderer-backed segment/hit-test evidence before broader contenteditable
  scope.

## Intentionally Not Changed

- No production contenteditable implementation.
- No editor rewrite.
- No collaboration behavior.
- No storage/backend route.
- No renderer artifact output.
- No package/document schema change.

## Next Phase

Phase 144 should decide whether rich inline commits remain full inline-child
replacement for v1 or move toward granular operations before durable replay
and collaboration.
