# Rich Inline Operation Decision Boundary

Status: Phase 144 granular rich inline operation decision boundary.

Phase 144 decides whether the current rich inline commit path should remain
full inline-child replacement for v1 or move immediately to granular operations
before the first vertical slice.

This is a decision boundary. It does not change operation schema.

## Decision

Accept `text-block.rich-inline.replace` as the v1 single-user rich inline
operation for the first vertical slice.

Do not claim this operation is collaboration-safe or offline-merge-safe.

Before collaboration, offline replay, or multi-user conflict resolution is
implemented, introduce granular rich inline operations or a semantic delta layer
that can represent style patches, field chip insert/remove, and text insert/
delete with mark context.

## Evidence Read

- `src/authoring/richInlineCommit.ts`
- `src/authoring/intentHistory.ts`
- `src/authoring/durableHistory.ts`
- `docs/TEMPLATE_BUILDER_RICH_INLINE_COMMIT_BRIDGE_BOUNDARY.md`
- `docs/TEMPLATE_BUILDER_RICH_INLINE_UNDO_REDO_REPLAY_BOUNDARY.md`
- `docs/TEMPLATE_BUILDER_RICH_INLINE_LIVE_EXACT_PARITY_AUDIT.md`
- `docs/WYSIWYG_PRIMARY_INPUT_DECISION_GATE.md`

## Operation Matrix

| Option | V1 fit | Undo/redo fit | Storage fit | Collaboration/offline fit | Renderer/exact impact | Risk |
|---|---|---|---|---|---|---|
| Full inline-child replace | Strong for single-user v1; already implemented and replayable | Strong in current sandbox via before/after children | Acceptable as bounded history/session payload | Weak: concurrent edits overwrite sibling semantic intent | Good enough to mark text-content stale | Medium now, high later |
| Range style patch operation | Good for toolbar marks and small style changes | Good if inverse range facts are stable | Better than full replace | Better, but needs range rebasing | Needs segment/hit-test parity | Medium/high now |
| Field chip insert/remove operation | Good for atomic chips | Good if chip identity is stable | Better than full replace | Better, but needs chip conflict policy | Needs atomic segment parity | Medium/high now |
| Text insert/delete with mark context | Strong long-term typing path | Strong when grouped with IME/typing sessions | Better and compact | Best foundation for merges | Needs renderer-backed line/segment mapping | High now |

## V1 Policy

- Keep `text-block.rich-inline.replace` for the first vertical slice.
- Store/replay rich inline v1 history as bounded before/after inline children.
- Keep the operation limited to a single text block.
- Reject duplicate inline ids and unsupported inline children.
- Continue marking exact generation stale on accepted commits.
- Keep field-ref usage visible through key history facts.
- Do not use this operation as a collaboration merge primitive.
- Do not expand it into cross-block or structural edits.

## Granular Upgrade Trigger

Granular rich inline operations become required before any of these claims:

- collaboration-ready editing;
- offline replay with conflict resolution;
- concurrent rich inline merges;
- durable cross-session replay that must preserve user intent instead of only
  before/after state;
- renderer-owned segment stream editing.

## PASS

- v1 operation policy is explicit.
- Current rich inline behavior remains stable.
- Collaboration and offline risks are documented.
- The next upgrade trigger is clear.

## FAIL / BLOCKER

- No blocker prevents using full inline-child replacement for the first
  single-user vertical slice.
- Full replacement remains a blocker for future collaboration/offline claims.

## RISK

- Full replacement can lose semantic intent when two edits touch the same text
  block concurrently.
- Before/after payloads can be larger than granular deltas.
- Future migration must avoid breaking existing v1 history records.

## UNKNOWN

- Exact granular operation schema remains unknown.
- Collaboration merge policy remains unknown.
- Renderer-owned segment stream protocol remains unknown.

## Files Changed

- `docs/RICH_INLINE_OPERATION_DECISION_BOUNDARY.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/richInlineOperationDecision.test.ts`

## Behavior Changed

- No runtime behavior changed.
- The project now has a v1 policy for rich inline operation granularity.

## Tests Run

- `npm.cmd test -- tests/richInlineOperationDecision.test.ts`
- `npm.cmd run check`

## Risks Left

- Design granular rich inline operations before collaboration/offline replay.
- Add field chip delete/copy/paste semantics.
- Preserve compatibility with v1 `text-block.rich-inline.replace` records.

## Intentionally Not Changed

- No operation schema change.
- No collaboration implementation.
- No storage/backend route.
- No renderer artifact output.
- No package/document schema change.

## Next Phase

Phase 145 should define the first vertical slice release candidate with this
policy: v1 rich inline edits may use full inline-child replacement, but the
slice must not claim collaboration/offline readiness.
