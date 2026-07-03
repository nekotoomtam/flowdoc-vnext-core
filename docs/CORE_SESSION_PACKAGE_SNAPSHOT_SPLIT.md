# Core Session Package Snapshot Split

Date: 2026-07-03

Status: session package snapshot retained-contract split complete.

## Purpose

This phase implements the first split from
`docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md`. The core now has a retained
session package snapshot helper that is separate from the storage-shaped
session record helper.

Historical compatibility storage record evidence is preserved below. The
compatibility helper itself was removed from source in Phase 246 after the
retained package snapshot contract and backend/package replacements were proven.

## Retained Core Contract

`src/authoring/sessionStorage.ts` now exports:

- `VNEXT_SESSION_PACKAGE_SNAPSHOT_SOURCE`;
- `VNEXT_SESSION_PACKAGE_SNAPSHOT_MODE`;
- `createVNextSessionPackageSnapshot(...)`;
- `VNextSessionPackageSnapshotRecord`;
- `VNextSessionPackageSnapshotFacts`;
- `VNextSessionPackageSnapshotPersistedState`.

The retained snapshot contract owns:

- canonical package v2/document v3 serialization;
- package id/version and document version facts;
- document revision and dirty-scope count facts;
- persisted-state exclusions for selection, dirty scopes, revisions,
  diagnostics, graph, viewport, live layout, exact layout, and authoring
  history;
- explicit contracts showing no storage record ownership, no storage writes,
  no storage key, no route dispatch, and no backend API call.

## Compatibility Record

`createVNextSessionStorageRecord(...)` used to return the Phase 87
storage-shaped record shape. Before deletion, it composed
`createVNextSessionPackageSnapshot(...)` for package and manifest identity
facts, then added the compatibility storage manifest fields:

- `storageKey`;
- `reason`;
- `storageStatus: "not-written"`.

Those storage-shaped fields were compatibility surface only. Backend-owned
storage, idempotency, expected revisions, and route dispatch are not moved into
the retained core snapshot contract.

## PASS

- Session package snapshot facts now have a retained core helper.
- The historical storage-shaped record composition is covered as past evidence.
- Tests prove the retained snapshot has no storage key/status value, with
  `storageKey` present only as an explicit `false` contract flag.
- The retained package snapshot helper remains stable for current tests and
  consumers.

## FAIL / BLOCKER

- None for the retained package snapshot contract.

## RISK

- Historical docs still mention the deleted storage helper name as migration
  evidence.

## UNKNOWN

- Final name for the eventual backend-owned session storage replacement.
- Whether backend wants to consume only `createVNextSessionPackageSnapshot(...)`
  or a backend route-specific envelope around it.

## Files Changed

- `src/authoring/sessionStorage.ts`
- `tests/sessionPackageSnapshot.test.ts`
- `docs/CORE_SESSION_PACKAGE_SNAPSHOT_SPLIT.md`
- `docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md`
- `docs/SESSION_STORAGE_BOUNDARY.md`
- `docs/CORE_RETENTION_MAP.md`
- `docs/CORE_SERVICE_CONSUMER_MAP.md`
- README and phase ledger pointers

## Behavior Changed

- Added a retained session package snapshot contract.
- Compatibility helper output was removed from source in Phase 246.
- No retained public API was removed.
- No backend or editor code changed.

## Tests Run

- `npm run check`

## Risks Left

- Keep backend-owned session storage records outside core.

## Intentionally Not Changed

- `createVNextSessionStorageRecord(...)` is removed from source in Phase 246.
- `src/index.ts` does not export `./authoring/sessionStorage.js`.
- No concrete storage adapter or backend route added.
- No gateway layer introduced.
