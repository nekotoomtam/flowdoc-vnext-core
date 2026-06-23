# Session Storage Boundary

Status: Phase 87 implementation boundary.

Phase 87 adds a pure session-to-storage-record boundary for canonical vNext
packages. It gives app persistence code a stable record shape to consume while
keeping storage writes, adapters, editor selection, runtime diagnostics, layout
artifacts, and durable history outside the package snapshot.

This is a session storage boundary. It is not a storage adapter.

## Purpose

The save-template path now has a core-owned preparation step:

```text
VNextEditableSession
  -> createVNextSessionStorageRecord(...)
  -> canonical package snapshot + storage manifest
  -> future app-owned storage adapter
```

The boundary exists so future app/backend code can persist canonical package
truth without guessing which authoring-session fields are durable.

## Module Ownership

`src/authoring/sessionStorage.ts` owns:

- `VNEXT_SESSION_STORAGE_SOURCE`;
- `VNEXT_SESSION_STORAGE_MODE`;
- `createVNextSessionStorageRecord(...)`;
- a canonical package snapshot created by
  `serializeFlowDocPackageV2DocumentVNext(...)`;
- a storage manifest with package id/version, document version, document
  revision, dirty-scope count, optional storage key, reason, and write status;
- explicit persisted-state flags for package, selection, dirty scopes,
  revisions, diagnostics, graph, viewport, live layout, exact layout, and
  authoring history.

The module is pure TypeScript and Node-testable. It does not write a file,
open a database, call browser storage, start a server, invoke routes, run
layout, render artifacts, mutate the editable session, or change package
schema.

## Truth Boundary

The record can carry only canonical package truth as the persisted payload:

- `package` is persisted as a serialized package v2/document v3 snapshot;
- `selection` remains session-only;
- `dirtyScopes` remain invalidation metadata, not persisted package data;
- `revisions` remain manifest metadata, not persisted package data;
- `diagnostics` and `graph` remain recomputable runtime state;
- `viewport`, `liveLayout`, and `exactLayout` remain runtime/artifact state;
- `authoringHistory` remains unwritten until a durable history phase;
- the manifest records storageStatus = `not-written` because the core boundary
  prepares records but does not own storage side effects.

## Acceptance Evidence

Phase 87 is covered by `tests/sessionStorage.test.ts`:

- storage records include the canonical package snapshot and manifest;
- dirty sessions report revision and dirty-scope metadata without persisting
  session-only fields into the package snapshot;
- source guards block storage adapters, parent runtime imports, DOM access,
  app routes, and layout/pagination execution;
- README, roadmap, and ledger entries keep the phase trail visible.

## Non-Goals

Phase 87 does not implement filesystem/database/browser storage, a concrete
server route, template id/version loading, idempotency persistence, durable
authoring history, undo/redo persistence, offline replay, collaboration,
artifact storage, exact layout execution, renderer adapter output, backend
authentication, rate limiting, or package/document schema changes.
