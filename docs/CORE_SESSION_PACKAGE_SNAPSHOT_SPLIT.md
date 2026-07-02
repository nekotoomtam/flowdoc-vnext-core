# Core Session Package Snapshot Split

Date: 2026-07-03

Status: session package snapshot retained-contract split complete.

## Purpose

This phase implements the first split from
`docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md`. The core now has a retained
session package snapshot helper that is separate from the storage-shaped
session record helper.

The compatibility storage record remains public for now, but it composes the
new retained package snapshot facts instead of owning those facts directly.

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

`createVNextSessionStorageRecord(...)` remains exported and still returns the
Phase 87 storage-shaped record shape. It now composes
`createVNextSessionPackageSnapshot(...)` for package and manifest identity
facts, then adds the compatibility storage manifest fields:

- `storageKey`;
- `reason`;
- `storageStatus: "not-written"`.

Those storage-shaped fields remain compatibility surface only. Backend-owned
storage, idempotency, expected revisions, and route dispatch are not moved into
the retained core snapshot contract.

## PASS

- Session package snapshot facts now have a retained core helper.
- The storage-shaped record composes the retained snapshot helper.
- Tests prove the retained snapshot has no storage key/status value, with
  `storageKey` present only as an explicit `false` contract flag.
- The public storage record remains stable for current tests and consumers.

## FAIL / BLOCKER

- No public de-export has happened yet.

## RISK

- `createVNextSessionStorageRecord(...)` remains public, so downstream code can
  still read it as core-owned storage wording until deprecation/de-export.
- Backend tests still use the compatibility storage record as fixture setup.

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
- Existing session storage record output remains compatible.
- No public export removed.
- No backend or editor code changed.

## Tests Run

- `npm run check`

## Risks Left

- Deprecate/de-export storage-shaped session record after backend replacement
  contracts exist.
- Rich-inline replay validation split remains.
- Submission identity/status split remains.

## Intentionally Not Changed

- `createVNextSessionStorageRecord(...)` is not removed.
- `src/index.ts` still exports `./authoring/sessionStorage.js`.
- No concrete storage adapter or backend route added.
- No gateway layer introduced.
