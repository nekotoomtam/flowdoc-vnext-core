# Concrete Storage Choice Gate

Status: Phase 172 concrete storage choice gate.

Phase 172 chooses the first internal-alpha storage direction after the guarded
input lane closed and the pre-Phase 172 risk / unknown register made storage
coupling risks explicit.

This is a decision boundary only. It does not implement a concrete adapter,
write files, add backend routes, add auth/authz, change package/document
schema, or claim production storage readiness.

## Decision

Selected immediate internal-alpha path:

- external file-backed JSON record adapter;
- package target: `packages/storage-file-json`;
- consume public storage adapter contracts from `@flowdoc/vnext-core`;
- store JSON record envelopes for package/session, durable history, rich inline
  session, artifact manifest, and artifact job records;
- keep artifact bytes out of the record adapter.

Deferred hardening path:

- SQLite plus filesystem artifacts remains the preferred later hardening path
  after the dependency and migration story is accepted;
- Postgres plus object storage remains a later production/server candidate;
- pgAdmin is a Postgres admin UI, not a storage backend choice.

## Option Comparison

Filesystem JSON:

- PASS for internal-alpha dependency-free storage evidence.
- Simple to inspect, commit to test fixtures, and debug.
- Weak on query/index performance, cross-process concurrency, and migration
  tooling.

SQLite:

- Good later local durability and query path.
- Better than plain JSON for indexed records and consistency checks.
- Deferred because native dependency/install risk can block early adapter work.

Postgres:

- Strong production/server candidate.
- Deferred because it pulls in server setup, credentials, migrations, backup,
  auth/authz, and deployment concerns too early.

Browser storage:

- Useful only for browser-local experiments.
- Rejected for this lane because internal-alpha storage must exercise Node-side
  adapter contracts and artifact/job records.

S3/object store:

- Good later artifact-byte storage candidate.
- Deferred because Phase 172 is record storage choice only and must not add
  network, credentials, signed URLs, retention policy, or production object
  storage assumptions.

## What It Stores

The Phase 173 adapter may store these record envelopes:

- package/session records;
- durable history snapshots;
- rich inline session persistence records;
- artifact manifest records;
- artifact job records.

It must support:

- read-after-write;
- expectedRevision conflict;
- idempotencyKey replay;
- revision increment on accepted update;
- bounded adapter-owned read/write results.

## What It Does Not Store

- Artifact bytes.
- PDF/DOCX output bytes.
- Raw DOM HTML.
- Live DOM selection/range objects.
- Browser clipboard event objects.
- Auth/authz state.
- Collaboration/offline merge state.
- Production input/browser readiness claims.

## Artifact Byte Strategy

- Phase 173 stores artifact manifest/job records only.
- Phase 174 should add a separate filesystem artifact byte store.
- Artifact manifests may reference future storage keys, byte length, and sha256,
  but Phase 173 must not write bytes or pretend bytes exist.

## Migration Risk

- File-backed JSON is easy to inspect but not the final production storage
  target.
- Record files should preserve storage adapter envelope shape so migration to
  SQLite can be mechanical.
- Keys and collection names must be deterministic and safely encoded by the
  adapter package.
- No package/document schema migration is accepted in Phase 172 or Phase 173.

## Storage Gate Assumptions

- Storage choice does not make guarded input production-ready.
- Storage choice does not make browser, clipboard, or IME evidence production
  ready.
- Storage choice does not make field-chip planned intents collaboration/offline
  safe.
- Storage choice does not create backend routes, workers, queues, or auth.

## PASS

- One internal-alpha path is selected: external file-backed JSON record adapter.
- Options are compared and deferrals are explicit.
- Record storage and artifact-byte storage are separated.
- Phase 173 can proceed without adding SQLite/native dependency.

## FAIL-BLOCKER

- No blocker prevents Phase 173 external file-backed adapter work.
- Production storage readiness remains blocked.
- Production input/browser/clipboard readiness remains blocked.

## RISK

- File-backed JSON does not prove production concurrency, indexing, backup, or
  migration tooling.
- Cross-process writes and multi-record transaction atomicity are not claimed.
- SQLite migration remains future work.

## UNKNOWN

- Final SQLite schema and migration shape.
- Production database/object-store split.
- Retention, backup, compaction, locking, and encryption policy.
- Backend route and auth/authz integration.

## Files Changed

- `docs/CONCRETE_STORAGE_CHOICE_GATE.md`
- `tests/concreteStorageChoiceGate.test.ts`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/prePhase172RiskUnknownRegister.test.ts`
- `tests/guardedInputIntegrationCloseAudit.test.ts`
- roadmap guard tests referencing the current next phase.

## Behavior Changed

- No runtime behavior changed.
- The next storage implementation path is now selected as an external
  file-backed JSON record adapter package.

## Tests Run

- `npm.cmd test -- tests/concreteStorageChoiceGate.test.ts tests/prePhase172RiskUnknownRegister.test.ts tests/guardedInputIntegrationCloseAudit.test.ts`
- `npm.cmd run check`

## Risks Left

- Phase 173 still needs to implement the external package and prove real file
  read/write behavior.
- Artifact bytes remain Phase 174 work.
- SQLite remains a later hardening path.

## Intentionally Not Changed

- No concrete storage adapter implementation.
- No filesystem/database writes in core.
- No SQLite/native dependency required.
- No artifact byte writes.
- No backend routes.
- No auth/authz.
- No package/document schema change.
- No production contenteditable/browser/clipboard readiness claim.
- No PDF/DOCX renderer work.
- No collaboration/offline behavior.
- No legacy editor runtime copy.

## Next Recommended Phase

Next recommended phase: Phase 173: External File-Backed Storage Adapter Slice.
