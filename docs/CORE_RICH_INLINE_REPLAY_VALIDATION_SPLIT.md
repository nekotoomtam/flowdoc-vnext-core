# Core Rich Inline Replay Validation Split

Date: 2026-07-03

Status: rich-inline replay validation retained-contract split complete.

## Purpose

This phase implements the second split from
`docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md`. The core now has retained
rich-inline replay validation helpers that are separate from the
persistence-shaped rich-inline session record helper.

The compatibility persistence record remains public for now, but it composes
the new retained validation facts instead of owning those facts directly.

## Retained Core Contract

`src/authoring/richInlineSessionPersistence.ts` now exports:

- `VNEXT_RICH_INLINE_REPLAY_VALIDATION_SOURCE`;
- `VNEXT_RICH_INLINE_REPLAY_VALIDATION_MODE`;
- `createVNextRichInlineReplayPatchValidation(...)`;
- `createVNextRichInlineReplayValidation(...)`;
- `VNextRichInlineReplayPatchValidationRecord`;
- `VNextRichInlineReplayValidationRecord`;
- `VNextRichInlineReplayValidationFacts`.

The retained validation contract owns:

- before/after inline child cloning and schema validation;
- duplicate inline id and unsupported child-kind issues;
- field-ref key usage facts;
- history-ready sequence, group, and summary facts when a history record is
  supplied;
- replay patch count and invalid replay patch count facts;
- explicit contracts showing no storage record ownership, no storage writes,
  no route dispatch, no backend API call, no replay execution, no conflict
  resolution, and no selection restoration.

## Compatibility Record

`createVNextRichInlineReplayPatchRecord(...)` remains exported and still
returns the Phase 129 patch record shape with:

- `replayStatus: "not-run"`;
- `storageStatus: "not-written"`.

`createVNextRichInlineSessionPersistenceRecord(...)` remains exported and still
returns the Phase 129 session persistence record shape. It now composes
`createVNextRichInlineReplayValidation(...)` for replay patch counts, invalid
counts, and retained patch validation facts before adding compatibility
persistence/session fields.

Those persistence-shaped fields remain compatibility surface only. Backend
storage, replay execution, conflict resolution, selection restoration, and API
dispatch are not moved into the retained core validation contract.

## PASS

- Rich-inline replay validation facts now have retained core helpers.
- Patch-level validation has no storage status or replay status fields.
- The compatibility replay patch record composes the retained validation
  record.
- The compatibility session persistence record composes the retained validation
  facts.
- Tests prove the retained validation helper has no storage writes, routes,
  DOM work, layout work, backend API calls, or replay execution.
- The public rich-inline session persistence export remains stable for current
  tests and consumers.

## FAIL / BLOCKER

- No public de-export has happened yet.
- Submission identity/status facts are not split yet.

## RISK

- `createVNextRichInlineSessionPersistenceRecord(...)` remains public, so
  downstream code can still read persistence wording as final core ownership
  until deprecation/de-export.
- Compatibility replay patch records still include storage/replay status fields
  for Phase 129 record stability.
- Future granular rich-inline operations may want a smaller semantic replay
  payload than full before/after inline children.

## UNKNOWN

- Final name for the eventual backend-owned rich-inline storage replacement.
- Whether backend wants full before/after replay payloads, granular operation
  payloads, or both.
- How collaboration conflict resolution should consume retained validation
  facts.

## Files Changed

- `src/authoring/richInlineSessionPersistence.ts`
- `tests/richInlineReplayValidation.test.ts`
- `docs/CORE_RICH_INLINE_REPLAY_VALIDATION_SPLIT.md`
- `docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md`
- `docs/TEMPLATE_BUILDER_RICH_INLINE_SESSION_PERSISTENCE_BOUNDARY.md`
- `docs/CORE_RETENTION_MAP.md`
- `docs/CORE_SERVICE_CONSUMER_MAP.md`
- README and phase ledger pointers

## Behavior Changed

- Added retained rich-inline replay validation contracts.
- Existing replay patch and rich-inline session persistence record outputs
  remain compatible.
- No public export removed.
- No backend or editor code changed.

## Tests Run

- `npm run check`

## Risks Left

- Deprecate/de-export persistence-shaped rich-inline session record after
  backend replacement contracts exist.
- Submission identity/status split remains.
- Backend consumer rewiring remains.

## Intentionally Not Changed

- `createVNextRichInlineReplayPatchRecord(...)` is not removed.
- `createVNextRichInlineSessionPersistenceRecord(...)` is not removed.
- `src/index.ts` still exports `./authoring/richInlineSessionPersistence.js`.
- No concrete storage adapter or backend route added.
- No replay execution, conflict resolution, or selection restoration added.
- No gateway layer introduced.
