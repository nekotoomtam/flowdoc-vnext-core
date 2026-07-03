# Core Session Rich Workflow Split Map

Date: 2026-07-03

Status: planning guard for session, rich-inline, and workflow service-shaped
exports after backend consumer rewiring. The session package snapshot split is
complete in Phase 233, the rich-inline replay validation split is complete in
Phase 234, the submission identity/status split is complete in Phase 235, and
backend consumer rewiring is recorded in
`docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md`.

## Purpose

This map separates the next three service-shaped core areas after the route
lane:

- session package snapshots;
- rich-inline persistence/replay payloads;
- external submission workflow state.

The goal is to keep core as the truth engine for canonical package snapshots,
history-ready records, replay-patch validation facts, and external workflow
identity/status facts while backend owns durable stores, storage keys,
idempotency, routes, replay execution, conflict resolution, permissions, and
workflow runtime.

This patch is planning and guard coverage only. It does not remove public
exports.

## Source Evidence

Session storage:

- `src/authoring/sessionStorage.ts` exports
  `createVNextSessionPackageSnapshot(...)` and
  `createVNextSessionStorageRecord(...)`.
- `tests/sessionStorage.test.ts` proves canonical package snapshots,
  session-only exclusions, `storageStatus: "not-written"`, and no storage,
  DOM, route, or layout execution.
- `tests/sessionPackageSnapshot.test.ts` proves the retained package snapshot
  helper has no storage key/status and the compatibility storage record
  composes retained snapshot facts.
- `docs/SESSION_STORAGE_BOUNDARY.md` records that this is not a storage
  adapter.

Rich-inline session persistence:

- `src/authoring/richInlineSessionPersistence.ts` exports
  `createVNextRichInlineReplayPatchValidation(...)`,
  `createVNextRichInlineReplayValidation(...)`,
  `createVNextRichInlineSessionPersistenceRecord(...)`, and
  `createVNextRichInlineReplayPatchRecord(...)`.
- The module composes `createVNextSessionStorageRecord(...)` and
  `createVNextDurableHistorySnapshot(...)` only in the compatibility
  persistence record path.
- The module composes retained replay validation facts into the compatibility
  replay patch and rich-inline session persistence records.
- `tests/richInlineReplayValidation.test.ts` proves retained patch validation,
  batch replay validation facts, invalid replay patch reporting, compatibility
  record composition, and no storage, DOM, route, layout, backend API, or
  replay execution.
- `tests/richInlineSessionPersistence.test.ts` proves package/history/replay
  payload composition, invalid replay patch reporting, JSON safety,
  `executionStatus: "not-run"`, and `backendApi: "not-called"`.
- `docs/TEMPLATE_BUILDER_RICH_INLINE_SESSION_PERSISTENCE_BOUNDARY.md` records
  that this is not a storage adapter and does not run replay.

Submission state:

- `src/workflow/submissionState.ts` exports
  `createVNextSubmissionIdentityStatus(...)` and
  `createVNextSubmissionStateRecord(...)`.
- The compatibility state record composes retained submission identity/status
  facts before adding workflow-shaped scope/application fields.
- `tests/submissionIdentityStatus.test.ts` proves retained identity/status
  facts, validation blockers, compatibility record composition, and no
  workflow execution, storage, DOM, routes, layout, package parse/serialize, or
  package mutation.
- `tests/submissionState.test.ts` proves external workflow metadata,
  `externalSubmissionState: true`, `storageWrite: "not-written"`,
  `routeDispatch: "not-run"`, and compatibility output stability.
- `docs/SUBMISSION_STATE_BOUNDARY.md` records that this is not a workflow
  engine.

Consumer evidence:

- `src/index.ts` still exports `./authoring/sessionStorage.js`,
  `./authoring/richInlineSessionPersistence.js`, and
  `./workflow/submissionState.js`.
- Backend `main@9d0a850` now uses backend-owned replacements:
  `flowdoc-vnext-backend/src/storage/sessionRecord.ts`,
  `flowdoc-vnext-backend/src/storage/richInlineSessionRecord.ts`, and
  `flowdoc-vnext-backend/src/routes/submissionRoute.ts`.
- Backend tests assert that those replacement paths do not import
  `createVNextSessionStorageRecord(...)`,
  `createVNextRichInlineSessionPersistenceRecord(...)`, or
  `createVNextSubmissionStateRecord(...)`.
- Core storage/vertical-slice tests use session and rich-inline record shapes.
- No direct editor consumer of these service-shaped exports is recorded in
  `docs/CORE_SERVICE_CONSUMER_MAP.md`.

## Split Matrix

| Area | Core Retains | Backend Owns | Current Decision |
|---|---|---|---|
| Session package snapshot | canonical package v2/document v3 snapshot intent, package id/version facts, document revision metadata, persisted-state exclusions | durable session store, storage key lifecycle, idempotency, expected revision gates, read/write routes | split complete; `createVNextSessionPackageSnapshot(...)` is the retained helper before storage-record de-export |
| Rich-inline replay validation | rich-inline commit history facts, before/after inline children validation, field-key usage facts, JSON-safe replay patch validation records, history-ready metadata | durable rich-inline session storage, replay execution, conflict resolution, selection restoration, backend API calls | split complete; `createVNextRichInlineReplayValidation(...)` is the retained helper before persistence-record de-export |
| Submission workflow identity | template id, submission id, document/data revisions, actor/reviewer identity facts, validation issues, package/data/document non-mutation flags | workflow engine, permissions, approval gates, notification/audit writes, workflow storage, routes | split complete; `createVNextSubmissionIdentityStatus(...)` is the retained helper before workflow-record de-export |

## Retained Core Contract Names

Use these names as the target concepts before public de-export:

- session: `packageSnapshot` and `persistedStateExclusions`; implemented by
  `createVNextSessionPackageSnapshot(...)`;
- rich-inline: `richInlineReplayPatchValidation` and `historyReadyFacts`;
  implemented by `createVNextRichInlineReplayPatchValidation(...)` and
  `createVNextRichInlineReplayValidation(...)`;
- workflow: `submissionIdentityFacts` and `externalWorkflowStatusFacts`.
  implemented by `createVNextSubmissionIdentityStatus(...)`.

The exact exported helper names are not locked in this patch.

## Backend-Owned Concerns

Do not move these into retained core contracts:

- filesystem, database, object-store, or browser storage writes;
- storage adapter binding or concrete collection implementations;
- HTTP route status, headers, request ids, or backend API calls;
- idempotency persistence, expected-revision stale gates, or write tokens;
- rich-inline replay execution, conflict resolution, or selection restoration;
- reviewer permissions, approval gates, notification/audit systems, or
  workflow runtime.

## Current Public Export Decision

Keep these public exports for now:

- `./authoring/sessionStorage.js`;
- `./authoring/richInlineSessionPersistence.js`;
- `./workflow/submissionState.js`.

They stay public only because retained contract names and backend replacement
contracts still need a compatibility deprecation/de-export window. They should
not be treated as final core ownership.

## Next Implementation Order

1. Window NR-A deprecation markers are complete in
   `docs/CORE_NON_ROUTE_DEPRECATION_WINDOW.md`.
2. Start Window NR-B: rewrite core historical tests so retained-contract tests
   prove core facts and backend tests prove backend-owned records/routes.
3. Start Window NR-C: narrow `src/index.ts` to retained helper exports and
   remove service-shaped compatibility helper names from public core.

## PASS

- The three remaining service-shaped areas now have explicit retain/move
  ownership.
- Each ownership claim cites current source, test, or boundary docs.
- Backend consumer rewiring is proven for session, rich-inline, and submission.
- Window NR-A source-level deprecation markers are applied to the compatibility
  helper functions.
- Public exports remain stable until the non-route compatibility windows run.

## FAIL / BLOCKER

- None for split and backend consumer rewiring evidence.

## RISK

- Keeping storage/workflow-shaped helper names public can make backend concerns
  look like final core ownership until Window NR-C.
- Rich-inline compatibility replay patch records may need granular operation
  vocabulary later.
- Submission workflow facts may become product-specific if future workflow
  policy is retained too widely.

## UNKNOWN

- Exact timing for Window NR-A/NR-B/NR-C.
- Whether deprecated route source cleanup should happen before non-route
  public export removal.
- Final production replay execution and workflow storage shapes.

## Files Changed

- `docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md`
- `docs/CORE_RETENTION_MAP.md`
- `docs/CORE_SERVICE_CONSUMER_MAP.md`
- `docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md`
- `docs/CORE_NON_ROUTE_DEPRECATION_WINDOW.md`
- `docs/CORE_RICH_INLINE_REPLAY_VALIDATION_SPLIT.md`
- `docs/CORE_SUBMISSION_IDENTITY_STATUS_SPLIT.md`
- `tests/coreSessionRichWorkflowSplitMap.test.ts`
- `tests/richInlineReplayValidation.test.ts`
- `tests/submissionIdentityStatus.test.ts`
- README and phase ledger pointers

## Behavior Changed

- Split-map documentation and guard tests updated after retained helper
  implementation and backend consumer rewiring.
- `src/authoring/richInlineSessionPersistence.ts` now has retained replay
  validation helpers.
- `src/workflow/submissionState.ts` now has retained identity/status helpers.
- No public export removed.
- No backend or editor code changed.

## Tests Run

- `npm run check`

## Risks Left

- Storage-shaped session record deprecation/de-export remains.
- Rich-inline persistence-shaped record deprecation/de-export remains.
- Submission workflow-shaped record deprecation/de-export remains.
- Window NR-B/NR-C remains.

## Intentionally Not Changed

- `src/index.ts` still exports the three service-shaped modules.
- `src/authoring/sessionStorage.ts` is not renamed or moved.
- `src/authoring/richInlineSessionPersistence.ts` is not renamed or moved.
- `src/workflow/submissionState.ts` is not renamed or moved.
- No gateway layer introduced.
