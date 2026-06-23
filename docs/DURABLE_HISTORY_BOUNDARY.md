# Durable History Boundary

Status: Phase 88 implementation boundary.

Phase 88 adds a pure durable-ready authoring history snapshot boundary. It
prepares committed and rejected authoring intent records for a future history
store while exposing undo/redo stack metadata without running undo, redo,
cross-session replay, or storage writes.

This is a durable history boundary. It is not a durable history store.

## Purpose

The history persistence path now has a core-owned preparation step:

```text
authoring intent records
  -> createVNextDurableHistorySnapshot(...)
  -> durable-ready records + groups + undo/redo manifest
  -> future app-owned durable history store
```

The boundary exists so future app/backend storage can persist authoring intent
history without smuggling package snapshots, selection state, layout artifacts,
or renderer output into history records.

## Module Ownership

`src/authoring/durableHistory.ts` owns:

- `VNEXT_DURABLE_HISTORY_SOURCE`;
- `VNEXT_DURABLE_HISTORY_MODE`;
- `createVNextDurableHistorySnapshot(...)`;
- durable filtering that skips `non-durable` selection-only records;
- JSON-cloned committed and rejected authoring intent records;
- grouped authoring history summaries from
  `groupVNextAuthoringIntentHistory(...)`;
- manifest counts for records, redo records, undoable records, diagnostic
  records, skipped non-durable records, and groups;
- undo/redo capability metadata with execution explicitly not run.

The module is pure TypeScript and Node-testable. It does not write storage,
start a server, call browser storage, mutate packages, run text transactions,
run operation replay, apply inverse patches, restore selection, run layout, or
render artifacts.

## Truth Boundary

The snapshot can carry only durable-ready history metadata:

- committed authoring intent records can contribute to undo depth;
- rejected diagnostic records can be retained for audit;
- selection-only records remain non-durable and are skipped;
- redo records can be reported separately from the primary undo history;
- package snapshots are not stored;
- dirty scopes, diagnostics, graph, viewport, live layout, exact layout, and
  artifacts are not persisted in this history payload;
- undo/redo uses `replayMode = "metadata-only"`;
- inverse patches are `not-stored`;
- full package snapshots are `false`;
- selection restoration is `not-persisted`;
- the manifest records executionStatus = `not-run` because this boundary does
  not execute undo/redo.

## Acceptance Evidence

Phase 88 is covered by `tests/durableHistory.test.ts`:

- durable history snapshots include cloned committed records, groups, and
  undo metadata;
- selection-only records are skipped while rejected diagnostics remain
  auditable;
- redo metadata is bounded and does not store package snapshots;
- source guards block storage adapters, parent runtime imports, DOM access,
  app routes, transaction execution, operation replay, layout, and pagination;
- README, roadmap, and ledger entries keep the phase trail visible.

## Non-Goals

Phase 88 does not implement filesystem/database/browser storage, a concrete
server route, durable history writes, full undo/redo execution, inverse patch
generation, operation-history unification, structural undo/redo replay,
cross-session replay, focus/caret/selection restoration, offline replay,
collaboration, exact layout execution, renderer adapter output, artifact
storage, backend authentication, rate limiting, or package/document schema
changes.
