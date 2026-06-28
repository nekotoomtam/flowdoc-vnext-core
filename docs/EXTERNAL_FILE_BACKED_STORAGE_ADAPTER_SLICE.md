# External File-Backed Storage Adapter Slice

Status: Phase 173 external file-backed storage adapter slice.

Phase 173 implements the first concrete internal-alpha storage adapter outside
`@flowdoc/vnext-core`. It follows the Phase 172 decision to start with an
external file-backed JSON record adapter in `packages/storage-file-json` and
keeps core dependency-clean.

This phase stores record envelopes only. Artifact bytes remain Phase 174 work.

## Boundary

- Adapter package: `packages/storage-file-json`.
- Package name: `@flowdoc/storage-file-json`.
- Core contract source: public storage adapter request/envelope helpers from
  `@flowdoc/vnext-core`.
- Concrete backend: file-backed JSON records.
- Record format: one `VNextStorageRecordEnvelope` JSON file per collection key.
- Storage key: base64url-encoded record key under the collection directory.
- Writes are single-record writes only.

## Stored Records

The adapter exposes collections for:

- package/session records;
- durable history records;
- rich inline session records;
- artifact manifest records;
- artifact job records.

Artifact manifest and artifact job collections are records only. They do not
write PDF bytes, object-store blobs, or byte-store metadata.

## Accepted Behavior

- Real read-after-write behavior is implemented through JSON files.
- `expectedRevision: null` creates a missing record.
- `expectedRevision: <current>` accepts an update and increments `revision`.
- Stale `expectedRevision` returns a bounded conflict result.
- Reusing the same `idempotencyKey` for the same stored record replays the
  previous successful write.
- The adapter returns adapter-owned bounded read/write results with
  `flowdoc-file-json-storage-adapter` as the source.
- Read errors, invalid requests, and corrupt JSON return bounded adapter-owned
  errors instead of throwing through normal storage result paths.

## Core Boundary

`src/persistence/storageAdapter.ts` remains interface-only. It still owns the
public request/envelope semantics and helper evaluation, but it does not import
filesystem APIs, database clients, concrete file paths, or package-local
storage code.

The concrete adapter imports `@flowdoc/vnext-core`. Core does not import this
adapter back.

## PASS

- `packages/storage-file-json` now provides the first external file-backed JSON
  storage adapter.
- The adapter consumes public storage adapter contracts from
  `@flowdoc/vnext-core`.
- Real file read-after-write is covered by tests.
- Idempotency replay, stale revision conflict, and revision increment are
  covered by tests.
- All Phase 173 record kinds have collections.
- Artifact manifest/job are stored as records only.
- Core remains dependency-clean and interface-only.

## FAIL-BLOCKER

- No blocker prevents Phase 174 artifact byte store work.
- Production storage readiness remains blocked.
- Backend route binding remains blocked.
- Multi-record transaction atomicity remains blocked.

## RISK

- Direct JSON file writes do not prove crash-safe atomicity, compaction,
  indexing, cross-process locking, backup, or migration tooling.
- File-backed JSON may become awkward for larger internal-alpha datasets.
- SQLite remains the likely hardening path if internal-alpha record volume or
  query requirements grow.
- Idempotency is per stored record envelope, not a cross-collection operation
  log.

## UNKNOWN

- Final SQLite schema and migration strategy.
- Retention, backup, encryption, and locking policy.
- Backend route authentication and authorization integration.
- Artifact byte naming, digest persistence, and manifest-to-byte consistency
  checks for Phase 174.

## Files Changed

- `packages/storage-file-json/package.json`
- `packages/storage-file-json/tsconfig.json`
- `packages/storage-file-json/src/index.ts`
- `docs/EXTERNAL_FILE_BACKED_STORAGE_ADAPTER_SLICE.md`
- `tests/storageFileJsonAdapter.test.ts`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `vitest.config.ts`

## Behavior Changed

- A new external adapter package can write and read JSON record envelopes from
  a caller-provided filesystem directory.
- The current project roadmap now advances from Phase 173 to Phase 174:
  Artifact Byte Store Slice.
- No vNext core runtime behavior changes.

## Tests Run

- `npm.cmd run check`

## Risks Left

- Artifact bytes are still not stored.
- Backend routes are still not bound to this adapter.
- Production storage readiness is not claimed.
- Multi-record transaction atomicity is not claimed.
- SQLite/native database hardening remains future work.

## Intentionally Not Changed

- No concrete adapter was added to `@flowdoc/vnext-core` source.
- `src/persistence/storageAdapter.ts` was not turned into a concrete adapter.
- No filesystem or database writes were added to core.
- No SQLite/native dependency was added.
- No multi-record transaction atomicity is claimed.
- No artifact bytes are written.
- No backend routes were added.
- No auth/authz was added.
- No package/document schema change was made.
- No production contenteditable, browser, or clipboard readiness is assumed.
- No PDF/DOCX renderer work was added.
- No collaboration/offline behavior was added.
- No legacy editor runtime was copied.

## Next Recommended Phase

Next recommended phase: Phase 174: Artifact Byte Store Slice.
