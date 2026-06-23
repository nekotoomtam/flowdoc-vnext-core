# Template Builder WYSIWYG Execution Close Audit

Status: Phase 126 post-125 WYSIWYG execution close audit.

Phase 126 closes the post-120 WYSIWYG execution foundation pass across Phases
122-125. It does not add runtime behavior. Its job is to record what is now
proved, separate foundation completion from production completion, and name the
next risk-bearing lanes explicitly.

## PASS

- Phase 122 consolidated browser-local styled-run and atomic field-chip facts
  into deterministic rich inline state:
  `docs/TEMPLATE_BUILDER_RICH_INLINE_STATE_BOUNDARY.md`.
- Phase 123 inserted bounded contenteditable segment capture before range
  mapping:
  `docs/TEMPLATE_BUILDER_CONTENTEDITABLE_SEGMENT_CAPTURE_BOUNDARY.md`.
- Phase 124 mapped browser-local rich inline state to canonical vNext inline
  child facts and commit effects without mutation:
  `docs/TEMPLATE_BUILDER_RICH_INLINE_COMMIT_PLANNING_BOUNDARY.md`.
- Phase 125 executed accepted Phase 124 plans through a vNext-native in-memory
  package mutation path:
  `docs/TEMPLATE_BUILDER_RICH_INLINE_COMMIT_BRIDGE_BOUNDARY.md`.
- `src/authoring/richInlineCommit.ts` owns the core rich inline replacement
  helper and history-ready record adapter.
- `examples/template-builder-sandbox/src/mutationBridge.ts` consumes Phase 124
  plans only, rejects stale plans, commits through the core helper, records
  authoring history summaries, and returns bounded packets.
- `tests/templateBuilderSandboxBoundary.test.ts` covers browser-local capture,
  commit planning, bridge success, stale-plan rejection, invalid-plan
  rejection, packet updates, and live/exact invalidation summaries.
- `tests/richInlineCommit.test.ts` covers core replacement, dirty scope,
  history-ready records, key-history facts, render invalidation, duplicate-id
  rejection, unsupported-target rejection, and DOM/package independence.
- No parent editor runtime, legacy runtime adoption, old document shapes,
  persistence routes, renderer output, collaboration behavior, or WASM/text
  engine execution was introduced in Phases 122-125.

## FAIL / BLOCKER

- No blocker prevents closing the Phase 122-125 execution foundation pass.
- This is not a production WYSIWYG close. Production contenteditable editing,
  durable replay, persistence, collaboration, and renderer artifact parity
  remain open.

## RISK

- Rich undo/redo replay is not implemented. Phase 125 emits history-ready
  records, but the sandbox undo stack still replays only plain text patches.
- The first canonical rich inline execution path performs full inline-child replacement,
  not granular mixed-inline transactions.
- The active sandbox authoring surface is still textarea-first with a bounded
  contenteditable-style capture surface. Production DOM `Range`, nested inline
  wrappers, bidi caret affinity, selection drift, and IME edge cases still need
  hardening.
- Key-history evidence records field-ref usage, but durable key history stores,
  aliases, migrations, and field lifecycle writes are not implemented.
- Live/exact outputs are invalidated, not rendered. Exact PDF/DOCX parity after
  rich inline commits remains unproved.
- Persistence and collaboration do not yet consume rich inline history or
  conflict state.

## UNKNOWN

- Whether `text-block.rich-inline.replace` remains the long-term canonical
  operation or becomes a bridge toward granular style/chip transactions.
- How rich undo/redo should replay mixed style and field-ref changes without
  losing selection or chip identity.
- Whether production contenteditable capture should walk DOM nodes directly or
  consume a renderer-owned segment stream.
- How concurrent rich inline commits should merge or reject during
  collaboration.
- How renderer-backed measurement and the Rust/WASM text-engine lane should
  participate after rich inline commit and before exact output.

## Recommended Next Cards

1. Phase 127 Rich Inline Undo/Redo Replay Boundary
2. Phase 128 Production Contenteditable Surface Hardening Boundary
3. Phase 129 Rich Inline Persistence/Session Boundary
4. Phase 130 Rich Inline Live/Exact Parity Audit

## Files Changed

- `docs/TEMPLATE_BUILDER_WYSIWYG_EXECUTION_CLOSE_AUDIT.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/wysiwygExecutionCloseAudit.test.ts`

## Behavior Changed

- No runtime behavior changed. This phase closes the execution foundation pass
  with PASS/FAIL/RISK/UNKNOWN evidence and next-card sequencing.

## Tests Run

- `npm.cmd test -- tests/wysiwygExecutionCloseAudit.test.ts`
- `npm.cmd run check`

## Risks Left

- Rich undo/redo replay.
- Production contenteditable DOM/caret/IME hardening.
- Durable persistence and session replay for rich inline commits.
- Collaboration and conflict handling.
- Exact renderer output parity after rich inline commits.
- Decision on full replacement versus granular mixed-inline transaction shape.

## Intentionally Not Changed

- No package/document schema changes.
- No parent editor runtime or legacy editor imports.
- No new runtime routes beyond the Phase 125 bridge.
- No durable persistence write.
- No collaboration behavior.
- No renderer artifact output.
- No ICU4X execution or WASM/text-engine measurement replacement.
