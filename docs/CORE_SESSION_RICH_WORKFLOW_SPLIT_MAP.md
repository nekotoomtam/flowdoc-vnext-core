# Core Session Rich Workflow Split Map

Date: 2026-07-03

Status: planning guard before splitting session, rich-inline, and workflow
service-shaped exports.

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
  `createVNextSessionStorageRecord(...)`.
- `tests/sessionStorage.test.ts` proves canonical package snapshots,
  session-only exclusions, `storageStatus: "not-written"`, and no storage,
  DOM, route, or layout execution.
- `docs/SESSION_STORAGE_BOUNDARY.md` records that this is not a storage
  adapter.

Rich-inline session persistence:

- `src/authoring/richInlineSessionPersistence.ts` exports
  `createVNextRichInlineSessionPersistenceRecord(...)` and
  `createVNextRichInlineReplayPatchRecord(...)`.
- The module composes `createVNextSessionStorageRecord(...)` and
  `createVNextDurableHistorySnapshot(...)`.
- `tests/richInlineSessionPersistence.test.ts` proves package/history/replay
  payload composition, invalid replay patch reporting, JSON safety,
  `executionStatus: "not-run"`, and `backendApi: "not-called"`.
- `docs/TEMPLATE_BUILDER_RICH_INLINE_SESSION_PERSISTENCE_BOUNDARY.md` records
  that this is not a storage adapter and does not run replay.

Submission state:

- `src/workflow/submissionState.ts` exports
  `createVNextSubmissionStateRecord(...)`.
- `tests/submissionState.test.ts` proves external workflow metadata,
  validation blockers, `externalSubmissionState: true`,
  `storageWrite: "not-written"`, `routeDispatch: "not-run"`, and no package
  mutation.
- `docs/SUBMISSION_STATE_BOUNDARY.md` records that this is not a workflow
  engine.

Consumer evidence:

- `src/index.ts` still exports `./authoring/sessionStorage.js`,
  `./authoring/richInlineSessionPersistence.js`, and
  `./workflow/submissionState.js`.
- Backend tests still use `createVNextSessionStorageRecord(...)` as fixture
  setup.
- Core storage/vertical-slice tests use session and rich-inline record shapes.
- No direct editor consumer of these service-shaped exports is recorded in
  `docs/CORE_SERVICE_CONSUMER_MAP.md`.

## Split Matrix

| Area | Core Retains | Backend Owns | Current Decision |
|---|---|---|---|
| Session package snapshot | canonical package v2/document v3 snapshot intent, package id/version facts, document revision metadata, persisted-state exclusions | durable session store, storage key lifecycle, idempotency, expected revision gates, read/write routes | split first; introduce/rename a pure package snapshot contract before de-export |
| Rich-inline replay validation | rich-inline commit history facts, before/after inline children validation, field-key usage facts, JSON-safe replay patch records, history-ready metadata | durable rich-inline session storage, replay execution, conflict resolution, selection restoration, backend API calls | split second; keep replay-patch validation in core and move persistence orchestration wording out |
| Submission workflow identity | template id, submission id, document/data revisions, actor/reviewer identity facts, validation issues, package/data/document non-mutation flags | workflow engine, permissions, approval gates, notification/audit writes, workflow storage, routes | split third; retain identity/status facts only if backend needs core validation vocabulary |

## Retained Core Contract Names

Use these names as the target concepts before public de-export:

- session: `packageSnapshot` and `persistedStateExclusions`;
- rich-inline: `richInlineReplayPatchValidation` and `historyReadyFacts`;
- workflow: `submissionIdentityFacts` and `externalWorkflowStatusFacts`.

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
contracts are not split yet. They should not be treated as final core ownership.

## Next Implementation Order

1. Split session package snapshot facts from storage-shaped session record
   wording.
2. Split rich-inline replay-patch validation from persistence orchestration.
3. Split submission identity/status facts from workflow runtime wording.
4. Update backend tests/consumers to use backend-owned storage/workflow routes
   plus retained core facts.
5. Deprecate and de-export the old service-shaped public exports in small,
   reversible windows.

## PASS

- The three remaining service-shaped areas now have explicit retain/move
  ownership.
- Each ownership claim cites current source, test, or boundary docs.
- Public exports remain stable while the split target names are still open.

## FAIL / BLOCKER

- No implementation split or de-export has happened yet.

## RISK

- Keeping storage/workflow-shaped helper names public can make backend concerns
  look like final core ownership.
- Rich-inline replay patch records may need granular operation vocabulary later.
- Submission workflow facts may become product-specific if retained too widely.

## UNKNOWN

- Final exported names for session package snapshots, rich-inline replay
  validation, and submission identity facts.
- Whether backend wants one replacement route/contract per area or a combined
  storage/workflow orchestration layer.
- Whether deprecated route source cleanup should happen before these splits.

## Files Changed

- `docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md`
- `docs/CORE_RETENTION_MAP.md`
- `docs/CORE_SERVICE_CONSUMER_MAP.md`
- `tests/coreSessionRichWorkflowSplitMap.test.ts`
- README and phase ledger pointers

## Behavior Changed

- Documentation and guard tests only.
- No runtime source module changed.
- No public export removed.
- No backend or editor code changed.

## Tests Run

- `npm run check`

## Risks Left

- Session package snapshot split remains.
- Rich-inline replay validation split remains.
- Submission identity/status split remains.
- Backend consumer rewiring remains.

## Intentionally Not Changed

- `src/index.ts` still exports the three service-shaped modules.
- `src/authoring/sessionStorage.ts` is not renamed or moved.
- `src/authoring/richInlineSessionPersistence.ts` is not renamed or moved.
- `src/workflow/submissionState.ts` is not renamed or moved.
- No gateway layer introduced.
