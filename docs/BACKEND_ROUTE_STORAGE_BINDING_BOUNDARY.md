# Backend Route Storage Binding Boundary

Status: Phase 176 backend route contract to storage binding.

Phase 176 binds route-shaped helper functions to the concrete external
file-backed storage adapter. It does not open an HTTP server route. It accepts
plain request objects, calls the Phase 173 record adapter, and returns
JSON-safe response objects with method, status, headers, body, and explicit
contract flags.

This phase is the bridge between route contracts and concrete internal-alpha
storage, not production backend readiness.

## Boundary

- Package: `@flowdoc/internal-alpha-runner`.
- Helper: `createFlowDocStorageRouteBinding(...)`.
- Storage adapter: `@flowdoc/storage-file-json`.
- Methods:
  - `loadSession(...)`;
  - `saveSession(...)`;
  - `requestArtifactGeneration(...)`;
  - `getArtifactStatus(...)`;
  - `getArtifactMetadata(...)`.

The helpers are route-shaped only. They do not register routes, listen on a
port, execute auth/authz, stream bytes, run a renderer, or call a queue.

## Accepted Behavior

- Session save writes a package/session record with `expectedRevision` and
  `idempotencyKey`.
- Session load reads a package/session record and returns bounded missing
  results.
- Artifact generation request creates planned artifact manifest and queued
  artifact job records.
- Artifact status reads an artifact job record.
- Artifact metadata reads an artifact manifest record.
- Method mismatch returns a bounded `405`.
- Storage conflicts return bounded `409`.
- Response bodies always keep `bytes: null`.

## PASS

- Route-shaped helpers now call concrete external record storage.
- Session load/save, artifact request, artifact status, and artifact metadata
  are covered by tests.
- Storage conflict and missing-record responses are bounded.
- Core remains dependency-clean; the route binding lives outside
  `@flowdoc/vnext-core`.

## FAIL-BLOCKER

- No blocker prevents artifact job execution work in Phase 177.
- Production backend readiness remains blocked.
- Auth/authz remains blocked.
- Byte streaming remains blocked.

## RISK

- Multi-record artifact request writes manifest and job records separately.
- Permission context is not executed in this phase.
- Responses are route-shaped helper outputs, not framework handlers.
- No artifact byte lookup is exposed yet.

## UNKNOWN

- Final product HTTP framework and route registration location.
- Auth/authz policy and tenant scoping.
- Error status mapping after real server integration.
- Whether metadata routes should later include signed URLs or byte streaming.

## Files Changed

- `packages/internal-alpha-runner/src/index.ts`
- `packages/internal-alpha-runner/src/storageRouteBinding.ts`
- `docs/BACKEND_ROUTE_STORAGE_BINDING_BOUNDARY.md`
- `tests/backendRouteStorageBinding.test.ts`
- `tests/storageBackedRcRoundtripSmoke.test.ts`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`

## Behavior Changed

- A new internal-alpha route binding helper can map route-shaped requests to
  concrete record storage operations.
- The current project roadmap now advances from Phase 176 to Phase 177:
  Artifact Job Execution Slice.
- No vNext core runtime behavior changes.

## Tests Run

- `npm.cmd run check`

## Risks Left

- Artifact job execution is not wired yet.
- Artifact bytes are not read or streamed by route-shaped helpers.
- Auth/authz is not executed.
- Production backend readiness is not claimed.

## Intentionally Not Changed

- No HTTP server route was added.
- No auth/authz was added.
- No concrete storage writes were added to core.
- No package/document schema change was made.
- No production contenteditable, browser, or clipboard readiness is assumed.
- No PDF/DOCX renderer execution was added.
- No collaboration/offline behavior was added.
- No legacy editor runtime was copied.

## Next Recommended Phase

Next recommended phase: Phase 177: Artifact Job Execution Slice.
