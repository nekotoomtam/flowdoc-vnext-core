# Template Builder Rich Inline Session Persistence Boundary

Status: Phase 129 rich inline persistence/session boundary.

Phase 129 adds a core-owned record boundary for rich inline session
persistence. It combines the existing canonical package session storage record,
durable authoring history snapshot, and rich inline before/after replay patch
payloads into one JSON-safe record shape for future app-owned storage.

Phase 234 splits retained replay validation facts into
`createVNextRichInlineReplayPatchValidation(...)` and
`createVNextRichInlineReplayValidation(...)` while keeping this persistence
record as compatibility surface.

This is a rich inline session persistence boundary.

It is not a storage adapter.

## PASS

- `src/authoring/richInlineSessionPersistence.ts` owns
  `createVNextRichInlineReplayPatchValidation(...)`,
  `createVNextRichInlineReplayValidation(...)`,
  `createVNextRichInlineSessionPersistenceRecord(...)`, and
  `createVNextRichInlineReplayPatchRecord(...)`.
- The record embeds a Phase 87 `createVNextSessionStorageRecord(...)` package
  snapshot and a Phase 88 `createVNextDurableHistorySnapshot(...)` history
  snapshot without writing storage.
- Rich inline replay patches store `beforeChildren` and `afterChildren`, target
  text block id, group id, history sequence, key-history field keys, validation
  status, and replay/storage statuses.
- Replay patch validation blocks invalid inline nodes, unsupported child kinds,
  and duplicate inline ids while leaving replay execution `not-run`.
- Phase 234 retained replay validation records carry validation/history facts
  without storage status or replay status fields; compatibility records add
  those fields back for Phase 129 shape stability.
- `src/index.ts` exports the rich inline session persistence boundary.
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `sandbox.planRichInlineSessionPersistence` as a wired commit lane.
- `tests/richInlineSessionPersistence.test.ts` proves package/history/replay
  payload composition, invalid replay patch reporting, JSON safety, and source
  independence.

## FAIL / BLOCKER

- None for the Phase 129 record boundary.

## RISK

- The record is storage-ready, but no filesystem, browser, database, or backend
  adapter writes it yet.
- Replay patches store before/after inline children; future granular rich inline
  operations may want a smaller semantic patch representation.
- Selection restoration, collaboration conflict resolution, and cross-session
  replay execution remain unimplemented.

## UNKNOWN

- Whether durable rich inline history should keep full before/after children,
  granular commands, or both.
- How storage adapters should version replay patches across package schema
  evolution.
- How collaboration should merge concurrent rich inline replay payloads.

## Files Changed

- `docs/TEMPLATE_BUILDER_RICH_INLINE_SESSION_PERSISTENCE_BOUNDARY.md`
- `src/authoring/richInlineSessionPersistence.ts`
- `src/index.ts`
- `examples/template-builder-sandbox/src/coreBoundary.ts`
- `examples/template-builder-sandbox/public/sandbox-snapshot.json`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/richInlineSessionPersistence.test.ts`
- `tests/templateBuilderSandboxBoundary.test.ts`

## Behavior Changed

- Rich inline commits can now be prepared as a single JSON-safe session
  persistence record containing package truth, authoring history, and replay
  patch payloads.
- Invalid rich inline replay patch payloads are reported without running
  replay.
- No storage adapter, backend route, package mutation, live layout request,
  exact rendering, collaboration behavior, or replay execution is added.

## Tests Run

- `npm.cmd run build` in `examples/template-builder-sandbox`
- `npm.cmd test -- tests/richInlineSessionPersistence.test.ts`
- `npm.cmd test -- tests/templateBuilderSandboxBoundary.test.ts --testTimeout=30000`
- `npm.cmd run check`

## Risks Left

- Add concrete storage adapters/routes for rich inline session records.
- Deprecate or de-export persistence-shaped rich inline records after backend
  replacement contracts exist.
- Decide full children replay payloads versus granular rich inline operations.
- Add selection restoration and cross-session replay execution.
- Add collaboration merge/conflict behavior.

## Intentionally Not Changed

- No package/document schema changes.
- No parent editor runtime or legacy editor imports.
- No durable storage write.
- No backend API route.
- No collaboration behavior.
- No renderer artifact output.
- No ICU4X execution or WASM/text-engine measurement replacement.
