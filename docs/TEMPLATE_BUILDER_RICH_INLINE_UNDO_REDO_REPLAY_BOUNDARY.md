# Template Builder Rich Inline Undo/Redo Replay Boundary

Status: Phase 127 rich inline undo/redo replay boundary.

Phase 127 turns Phase 125 rich inline commits from history-ready records into
in-memory replayable sandbox undo/redo patches. The bridge keeps the existing
plain text undo path, adds a rich inline patch shape with before/after vNext
inline children, and replays rich undo/redo through the same vNext-native rich
inline replacement helper used by committed plans.

## PASS

- `examples/template-builder-sandbox/src/mutationBridge.ts` now stores sandbox
  undo/redo patches as a union of plain text patches and rich inline patches.
- Rich inline commits capture `beforeChildren` from the current text block and
  `afterChildren` from the accepted Phase 124 plan after
  `runVNextRichInlineCommit(...)` succeeds.
- `applyRichInlineHistoryPatch(...)` replays undo/redo with
  `runVNextRichInlineCommit(...)`, so styled text and `field-ref` inline nodes
  are restored without routing through text-only transactions.
- Rich replay updates the in-memory package, document revision, mutation count,
  bounded change packet, dirty scope, and live/exact invalidation summary.
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `sandbox.replayRichInlineHistory` as a wired commit lane.
- `tests/templateBuilderSandboxBoundary.test.ts` proves rich commit, undo, and
  redo packet behavior while preserving the existing plain text undo/redo
  regression coverage.

## FAIL / BLOCKER

- None for the Phase 127 replay boundary.

## RISK

- Replay is still sandbox in-memory only; durable persistence/session history
  does not yet store or restore rich inline undo patches.
- The replay unit is still full inline-child replacement, not granular rich
  inline operations suitable for collaboration merges.
- Production contenteditable range/caret/IME hardening remains separate from
  this bridge replay boundary.

## UNKNOWN

- Whether durable rich history should store raw before/after inline children or
  a smaller semantic command form.
- How concurrent rich inline replacements should merge when collaboration is
  introduced.
- Whether future granular rich inline operations should share this replay
  packet shape or replace it.

## Files Changed

- `docs/TEMPLATE_BUILDER_RICH_INLINE_UNDO_REDO_REPLAY_BOUNDARY.md`
- `examples/template-builder-sandbox/src/mutationBridge.ts`
- `examples/template-builder-sandbox/src/coreBoundary.ts`
- `examples/template-builder-sandbox/public/sandbox-snapshot.json`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/templateBuilderSandboxBoundary.test.ts`

## Behavior Changed

- Accepted rich inline commits can now be undone and redone through the sandbox
  bridge.
- Rich undo restores the previous inline children and can return the target to
  plain WYSIWYG-draft-safe text.
- Rich redo restores styled text and field chips while preserving bounded
  packet/live-layout summaries.
- Plain text undo/redo behavior remains unchanged.

## Tests Run

- `npm.cmd run build` in `examples/template-builder-sandbox`
- `npm.cmd test -- tests/templateBuilderSandboxBoundary.test.ts --testTimeout=30000`
- `npm.cmd test -- tests/richInlineCommit.test.ts`
- `npm.cmd run check`

## Risks Left

- Add persistence/session-backed rich inline history.
- Decide full replacement versus granular rich inline operations.
- Harden the production contenteditable surface.
- Add collaboration behavior and renderer-backed exact output parity.

## Intentionally Not Changed

- No package/document schema changes.
- No parent editor runtime or legacy editor imports.
- No durable persistence write.
- No collaboration behavior.
- No renderer artifact output.
- No ICU4X execution or WASM/text-engine measurement replacement.
