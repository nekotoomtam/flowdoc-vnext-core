# Template Builder Rich Inline Live/Exact Parity Audit

Status: Phase 130 rich inline live/exact parity audit.

Phase 130 audits the rich inline commit path after Phase 127 undo/redo replay,
Phase 128 contenteditable surface hardening, and Phase 129 session persistence.
The goal is to prove that accepted rich inline commits and replay mutations
invalidate live layout and exact generation consistently without claiming that
renderer artifacts, storage adapters, or collaboration now exist.

This is a live/exact parity audit.

It is not a renderer implementation.

## PASS

- `src/authoring/richInlineCommit.ts` returns a text-block dirty scope and
  `renderInvalidation.exactGenerationStale = true` with lane `text-content`
  for accepted `text-block.rich-inline.replace` commits.
- `examples/template-builder-sandbox/src/mutationBridge.ts` calls
  `rememberLiveLayoutBoundary(...)` after rich inline commit, rich undo, and
  rich redo, so all three packet paths run through
  `resolveVNextLiveLayoutBoundary(...)`.
- `examples/template-builder-sandbox/src/coreBoundary.ts` maps the live-layout
  boundary result into bounded `packet.liveLayout` summaries with request
  count, affected text-block ids, `freshness.liveLayout = "stale"`, and
  `freshness.exactGeneration.status = "stale"`.
- `src/authoring/richInlineSessionPersistence.ts` keeps `liveLayout`,
  `exactLayout`, and `artifacts` outside the persisted rich inline session
  record, preventing persistence from pretending to store renderer truth.
- `tests/richInlineLiveExactParityAudit.test.ts` proves direct core parity,
  sandbox commit/undo/redo parity, persistence exclusion, and phase-trail
  evidence.

## FAIL / BLOCKER

- None for the Phase 130 audit boundary.
- This audit does not close exact renderer output, production contenteditable
  primary input, storage adapter writes, or collaboration.

## RISK

- Exact renderer adapters are not executed after rich inline commit, undo, or
  redo; packets only mark exact generation stale.
- Renderer-backed text measurement and the rustybuzz/WASM lane are not bound to
  rich inline live editing yet.
- The production contenteditable surface is hardened but still not the primary
  editing input.
- Rich inline replay remains full before/after inline-child replacement, which
  may need a smaller semantic operation shape before collaboration.

## UNKNOWN

- Whether the renderer or the editor should own the final segment stream used
  for production contenteditable selection.
- What the exact parity acceptance threshold should be once PDF/DOCX renderer
  artifacts can run after rich inline mutations.
- How collaboration should merge concurrent rich inline changes that each carry
  stale live/exact invalidation.

## Files Changed

- `docs/TEMPLATE_BUILDER_RICH_INLINE_LIVE_EXACT_PARITY_AUDIT.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/richInlineLiveExactParityAudit.test.ts`

## Behavior Changed

- No runtime behavior changed.
- The audit adds regression coverage proving that rich inline commit, undo, and
  redo all surface the same bounded live/exact stale signal.
- The audit also keeps persistence boundaries honest: rich inline session
  records contain package/history/replay payloads, not live layout snapshots,
  exact layout truth, or renderer artifacts.

## Tests Run

- `npm.cmd test -- tests/richInlineLiveExactParityAudit.test.ts`
- `npm.cmd run check`

## Risks Left

- Promote the hardened contenteditable surface to the primary editing input.
- Bind renderer-backed measurement and exact renderer artifact generation after
  rich inline mutations.
- Add concrete storage adapters/routes for rich inline session records.
- Add collaboration merge/conflict behavior for rich inline edits.
- Run a final WYSIWYG / Editing close audit after these remaining risks are
  either implemented or explicitly deferred.

## Intentionally Not Changed

- No package/document schema changes.
- No parent editor runtime or legacy editor imports.
- No storage adapter write or backend API route.
- No collaboration behavior.
- No renderer artifact output.
- No ICU4X execution or WASM/text-engine measurement replacement.
