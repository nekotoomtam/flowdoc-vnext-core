# Core Backend Consumer Rewire Closeout

Date: 2026-07-03

Status: backend consumer rewiring evidence is complete; public core de-export
is still a separate compatibility-window patch.

## Purpose

This closeout records the point where `flowdoc-vnext-backend` stopped consuming
the remaining non-route service-shaped core helpers as backend fixtures or
route contracts. Core can now treat backend consumer rewiring as proven
evidence, while still keeping compatibility exports until core historical tests
and deprecation/de-export windows are rewritten deliberately.

The target shape remains:

```text
editor -> backend -> core
```

## Backend Evidence

Backend `main` is at commit `9d0a850` after merging
`codex/backend-core-consumer-rewire`.

The backend-owned replacements are:

- `flowdoc-vnext-backend/src/storage/sessionRecord.ts` creates backend-owned
  session storage records from retained
  `createVNextSessionPackageSnapshot(...)` facts.
- `flowdoc-vnext-backend/src/storage/richInlineSessionRecord.ts` creates
  backend-owned rich-inline session records from retained
  `createVNextRichInlineReplayValidation(...)` facts.
- `flowdoc-vnext-backend/src/routes/submissionRoute.ts` creates a backend-owned
  submission route contract from retained
  `createVNextSubmissionIdentityStatus(...)` facts.
- `flowdoc-vnext-backend/src/storage/storageRouteBinding.ts` accepts
  backend-owned session storage records rather than core
  `VNextSessionStorageRecord` records.
- Backend tests assert that the new backend session/rich-inline/submission
  paths do not import `createVNextSessionStorageRecord(...)`,
  `createVNextRichInlineSessionPersistenceRecord(...)`, or
  `createVNextSubmissionStateRecord(...)`.

## Core Retained Truth

Core still owns these retained facts:

- session package snapshots:
  `createVNextSessionPackageSnapshot(...)`;
- rich-inline replay validation:
  `createVNextRichInlineReplayPatchValidation(...)` and
  `createVNextRichInlineReplayValidation(...)`;
- submission identity/status facts:
  `createVNextSubmissionIdentityStatus(...)`.

Core still keeps these compatibility records public for now:

- `createVNextSessionStorageRecord(...)`;
- `createVNextRichInlineSessionPersistenceRecord(...)`;
- `createVNextSubmissionStateRecord(...)`.

## De-export Readiness

Backend/editor consumer preconditions are now satisfied for the three
non-route service-shaped helpers:

1. Backend has package-level `@flowdoc/vnext-core` consumers with matching
   tests for replacement backend behavior.
2. The retained core contracts have named owners and direct core tests.
3. Backend no longer imports the service-shaped core helpers.
4. No direct editor consumer of these service-shaped helpers is recorded in
   `docs/CORE_SERVICE_CONSUMER_MAP.md`.

Immediate public removal is still intentionally blocked because core
historical tests still exercise compatibility record shapes:

- `tests/sessionStorage.test.ts`;
- `tests/sessionPackageSnapshot.test.ts`;
- `tests/richInlineSessionPersistence.test.ts`;
- `tests/richInlineReplayValidation.test.ts`;
- `tests/submissionState.test.ts`;
- `tests/submissionIdentityStatus.test.ts`;
- storage and vertical-slice historical tests.

## Next Window

Use a small non-route compatibility sequence:

1. Window NR-A: mark service-shaped helper exports as deprecated in source and
   docs while keeping public entrypoint compatibility. Complete in
   `docs/CORE_NON_ROUTE_DEPRECATION_WINDOW.md`.
2. Window NR-B: rewrite core historical tests so retained-contract tests prove
   core-owned facts, while backend tests prove backend-owned records/routes.
3. Window NR-C: narrow `src/index.ts` public exports to retained helpers only
   and remove the service-shaped compatibility helper names from the public
   entrypoint.

## PASS

- Backend `main@9d0a850` owns session, rich-inline, and submission replacement
  records/routes over retained core facts.
- Backend tests guard against importing the old service-shaped helpers.
- Core retained helpers remain the semantic truth for package snapshots,
  replay validation, and submission identity/status facts.

## FAIL / BLOCKER

- None for backend consumer rewiring evidence.

## RISK

- Core still publicly exports compatibility helper names, so duplicated
  ownership wording can linger until the deprecation/de-export windows run.
- Core historical tests still exercise compatibility record shapes.
- Backend replacements are contract/storage-shell slices, not production
  workflow or replay execution.

## UNKNOWN

- Exact timing for Window NR-A/NR-B/NR-C is not locked.
- Final production workflow storage and rich-inline replay execution shapes are
  not implemented.

## Files Changed

- `docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md`
- `docs/CORE_SERVICE_CONSUMER_MAP.md`
- `docs/CORE_RETENTION_MAP.md`
- `docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md`
- README and phase ledger pointers
- guard tests for the closeout and updated maps

## Behavior Changed

- Documentation and guard tests now record backend consumer rewiring as proven.
- No runtime core source module moved.
- No public core export removed.

## Tests Run

- `npm run check`

## Risks Left

- Window NR-B/NR-C still need implementation.
- Deprecated route source cleanup remains optional.
- Old concrete package lanes remain in core until historical-test replacement
  and package-lane cleanup are scheduled.

## Intentionally Not Changed

- `src/index.ts` still exports the three non-route service-shaped modules.
- `src/authoring/sessionStorage.ts` is not renamed or moved.
- `src/authoring/richInlineSessionPersistence.ts` is not renamed or moved.
- `src/workflow/submissionState.ts` is not renamed or moved.
- No backend, frontend, or gateway code changed in this core patch.
