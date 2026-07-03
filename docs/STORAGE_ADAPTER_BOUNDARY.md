# Storage Adapter Boundary

Status: Phase 140 storage adapter interface boundary.

Phase 140 defines interface-only storage contracts for package-session
payloads, durable history, rich inline session payloads, artifact manifests,
and artifact jobs. It adds shared read/write result shapes and optimistic
concurrency metadata without choosing or implementing a concrete backend.

This is an interface boundary, not a concrete storage adapter.

## Evidence

- `src/persistence/storageAdapter.ts` defines storage collections for package
  sessions, durable histories, rich inline sessions, artifact manifests, and
  artifact jobs. After Window NR-C, package-session and rich-inline-session
  payloads are generic `unknown` envelope values so the public storage adapter
  contract does not export deprecated compatibility record shapes.
- `createVNextStorageAdapterContractPlan()` exposes the collection map,
  idempotency key requirement, expected-revision rule, optional write token,
  and explicit no-backend/no-write contracts.
- `evaluateVNextStorageWriteRequest(...)` and
  `createVNextStorageReadResult(...)` are pure result-shaping helpers that a
  future adapter can reuse without performing storage writes themselves.
- `tests/storageAdapter.test.ts` uses a test-local in-memory mock to prove
  expected revision conflicts, idempotent replay, write-token echoing, and
  collection coverage.

## Boundary

Allowed:

- define storage interfaces and collection shapes;
- define JSON-safe read/write envelopes;
- define expected revision, idempotency key, and optional write-token inputs;
- provide pure read/write result evaluators;
- use test-local mocks to prove contract behavior.

Blocked:

- choosing Postgres, S3, file storage, browser storage, Redis, or any concrete
  backend;
- importing database, object storage, browser storage, or backend clients;
- writing files, databases, object storage, browser storage, or network
  storage;
- implementing auth/authz;
- changing package/document schema.

## PASS

- Package/session, durable history, rich inline session, artifact manifest, and
  artifact job collection contracts are explicit.
- Expected revision and idempotency behavior are proven through a test-local
  mock adapter.
- Write-token metadata is represented without implementing locking.
- Core remains concrete-backend-free.

## FAIL / BLOCKER

- No blocker was found for closing this interface boundary.

## RISK

- The mock adapter is test-only and does not prove durability, transactions,
  indexes, migrations, retention, or distributed locking.
- Future concrete adapters may need additional tenancy, encryption, and audit
  metadata.

## UNKNOWN

- Production database/object storage choice remains unknown.
- Migration, backup, retention, locking, indexing, and auth/authz policies
  remain future work.

## Files Changed

- `src/persistence/storageAdapter.ts`
- `src/index.ts`
- `docs/STORAGE_ADAPTER_BOUNDARY.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/storageAdapter.test.ts`

## Behavior Changed

- Core now exposes storage adapter interfaces and pure read/write result
  helpers.
- No concrete storage, auth, backend route, renderer, generation runtime, or
  package/document schema behavior changed.

## Tests Run

- `npm.cmd test -- tests/storageAdapter.test.ts`
- `npm.cmd run check`

## Risks Left

- Pick and implement concrete adapters outside this interface-only boundary.
- Define migrations, indexes, retention, locking, and authorization.
- Connect route contracts and artifact jobs to concrete storage only after the
  backend choice is made.

## Intentionally Not Changed

- No Postgres, S3, file, browser, Redis, or other concrete backend.
- No storage writes in core.
- No auth/authz execution.
- No backend route.
- No queue or worker runtime.
- No package/document schema change.

## Non-goals

No concrete database, object storage, filesystem storage, browser storage,
network call, auth/authz implementation, backend route, worker queue, schema
migration, or package/document schema change is introduced in this phase.
