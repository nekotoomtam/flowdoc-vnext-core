# Core Compatibility Source Cleanup Audit

Date: 2026-07-03

Status: Phase 246 compatibility source deletion complete after Window NR-C
public export narrowing.

## Purpose

Window NR-C removed the remaining non-route service-shaped helpers from the
public package entrypoint. This audit prevents the owner-module compatibility
source from becoming forgotten debt.

The compatibility helpers were short-lived removal candidates, not retained
core API. Phase 246 deletes their source implementations after the test
allowlist reaches zero.

## Cleanup Rule

- Do not add new public exports for the compatibility helpers.
- Do not add new `@flowdoc/vnext-core` consumers of the compatibility helpers.
- Do not add new owner-module imports of the compatibility helpers without
  updating this audit and explaining the replacement blocker.
- Prefer rewriting tests to retained facts, backend-owned records, or
  package-local internal-alpha records before deleting source.
- Treat this audit as short-lived cleanup debt; it should shrink, not grow.

## Deleted Compatibility Helpers

| Helper | Source Owner | Remaining Use | Replacement Target |
|---|---|---|---|
| `createVNextSessionStorageRecord(...)` | `src/authoring/sessionStorage.ts` | deleted in Phase 246 | retained `createVNextSessionPackageSnapshot(...)`; backend `flowdoc-vnext-backend/src/storage/sessionRecord.ts`; internal-alpha `createFlowDocInternalAlphaSessionStorageRecord(...)` |
| `createVNextRichInlineSessionPersistenceRecord(...)` | `src/authoring/richInlineSessionPersistence.ts` | deleted in Phase 246 | retained `createVNextRichInlineReplayValidation(...)`; backend `flowdoc-vnext-backend/src/storage/richInlineSessionRecord.ts`; internal-alpha `createFlowDocInternalAlphaRichInlineSessionRecord(...)` |
| `createVNextSubmissionStateRecord(...)` | `src/workflow/submissionState.ts` | deleted in Phase 246 | retained `createVNextSubmissionIdentityStatus(...)`; backend `flowdoc-vnext-backend/src/routes/submissionRoute.ts` |

Compatibility record types and constants were removed with the helper source.
Do not re-add imports of `VNextRichInlineSessionPersistenceRecord`,
`VNextSubmissionStateRecord`, `VNEXT_SESSION_STORAGE_SOURCE`,
`VNEXT_SESSION_STORAGE_MODE`, `VNEXT_RICH_INLINE_SESSION_PERSISTENCE_SOURCE`,
`VNEXT_RICH_INLINE_SESSION_PERSISTENCE_MODE`, `VNEXT_SUBMISSION_STATE_SOURCE`,
or `VNEXT_SUBMISSION_STATE_MODE`.

## Current Allowlist

The allowlist above is empty.

### Session Storage Compatibility

- No owner-module imports remain.

### Rich Inline Session Compatibility

- No owner-module imports remain.

### Submission State Compatibility

- No owner-module imports remain.

## Recommended Removal Order

- Complete. Do not reintroduce compatibility helper source, types, constants,
  public exports, or owner-module imports.

## Cleanup Progress

- Phase 243 rewrote `tests/verticalSliceStorageSimulation.test.ts` and
  `tests/verticalSliceRcEndToEnd.test.ts` so package-session and
  rich-inline-session payloads use retained facts through
  `createVNextSessionPackageSnapshot(...)` and
  `createVNextRichInlineReplayValidation(...)`.
- Phase 244 rewrote `tests/storageAdapter.test.ts` so package-session and
  rich-inline-session storage collections stay generic `unknown` payload
  contracts backed by retained package snapshot and rich-inline replay facts.
- Phase 245 rewrote the remaining composition tests so
  `tests/sessionPackageSnapshot.test.ts`,
  `tests/richInlineReplayValidation.test.ts`,
  `tests/richInlineLiveExactParityAudit.test.ts`, and
  `tests/submissionIdentityStatus.test.ts` assert retained facts and
  backend/package-owned replacement evidence instead of importing compatibility
  helpers.
- Phase 246 removed the compatibility helper implementations, record types,
  and source/mode constants from `src/authoring/sessionStorage.ts`,
  `src/authoring/richInlineSessionPersistence.ts`, and
  `src/workflow/submissionState.ts`.

## Exit Criteria

- The allowlist above is empty.
- `rg "createVNext(SessionStorageRecord|RichInlineSessionPersistenceRecord|SubmissionStateRecord)" src packages`
  returns no source/package usage.
- test references to those helper names are historical guard strings only, not
  imports or source calls.
- `src/index.ts` continues to export retained facts only.
- `src/persistence/storageAdapter.ts` keeps package-session and
  rich-inline-session payloads as `unknown`.
- `npm run check` passes.

## PASS

- The public entrypoint no longer exposes the compatibility helpers.
- No compatibility helper imports remain in `src`, `tests`, or `packages`.
- Replacement targets are identified for each helper.
- The guard test prevents new untracked compatibility imports.
- Vertical-slice storage simulation and RC smoke tests no longer import the
  compatibility helpers.
- The storage adapter test no longer imports compatibility helpers or depends
  on old package-session/rich-inline-session record shapes.
- Remaining composition tests no longer import compatibility helpers.
- Compatibility helper source implementations, types, and constants are
  removed.

## FAIL / BLOCKER

- None for the cleanup audit.

## RISK

- Historical docs still mention deleted helper names as past evidence.

## UNKNOWN

- Whether deeper historical docs should be further compressed after mainline
  consumers settle on backend-owned record names.

## Files Changed

- `docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md`
- vertical-slice storage simulation tests
- storage adapter and composition tests
- source deletion for the three compatibility helpers
- guard tests for the cleanup allowlist
- README and phase ledger pointers

## Behavior Changed

- Documentation and guard behavior only.
- Vertical-slice storage payload fixtures now use retained core facts instead
  of compatibility helper records.
- Runtime storage adapter behavior is unchanged.
- Public entrypoint behavior is unchanged from Window NR-C.
- Compatibility helper source behavior is removed.

## Tests Run

- `npm run check`

## Risks Left

- Do not reintroduce compatibility helpers.

## Intentionally Not Changed

- No backend or editor code changed.
- No gateway layer introduced.
