# Artifact Byte Store Slice

Status: Phase 174 artifact byte store slice.

Phase 174 adds the first internal-alpha artifact byte store beside the Phase
173 file-backed JSON record adapter. It stores artifact bytes on the local
filesystem, computes `sha256`, reads bytes back by `storageKey`, returns a
bounded missing-artifact error, and checks rendered artifact manifests against
stored byte facts.

This is not production storage readiness. It is a local filesystem byte-store
slice for internal-alpha evidence.

## Boundary

- Package: `@flowdoc/storage-file-json`.
- Package path: `packages/storage-file-json`.
- Byte-store factory: `createFlowDocFileJsonArtifactByteStore(...)`.
- Byte root: caller-provided root directory plus `artifact-bytes`.
- Storage key format:
  `artifact-bytes-v1.<base64url-artifact-id>.<sha256>.bin`.
- Manifest consistency compares artifact id, byte length, sha256 digest, and
  storage key.

The Phase 173 record adapter remains separate and still reports
`artifactByteWrites: false`. The Phase 174 byte store reports
`artifactByteWrites: true` and `recordEnvelopeWrites: false`.

## Accepted Behavior

- `write(...)` stores non-empty artifact bytes on disk.
- `write(...)` computes `sha256` from the supplied bytes.
- `write(...)` rejects an `expectedSha256` mismatch without writing accepted
  metadata.
- `read(...)` returns the stored bytes and recomputed digest.
- `read(...)` returns a bounded `missing` result for absent artifacts.
- `verifyManifestConsistency(...)` reads bytes and compares a rendered
  manifest's `artifactId`, `byteLength`, `sha256`, and `storageKey`.
- Manifest consistency does not mutate the manifest. Existing core manifest
  `storageStatus` remains `not-written` until a separate schema decision.

## PASS

- Artifact bytes can now be written to and read from an external filesystem
  byte store.
- The byte store computes sha256 digests.
- Missing artifacts return bounded adapter-owned results.
- Rendered manifest-to-byte consistency is covered.
- The record adapter remains separate from byte writes.
- Core remains dependency-clean.

## FAIL-BLOCKER

- No blocker prevents the storage-backed RC roundtrip smoke.
- Production storage readiness remains blocked.
- Backend route binding remains blocked.
- Multi-record transaction atomicity remains blocked.

## RISK

- Byte writes are direct filesystem writes and do not prove crash-safe atomic
  rename, fsync policy, retention, cleanup, encryption, backup, or locking.
- Record and byte writes are not transactionally linked.
- Manifest `storageStatus` still says `not-written` because changing that is a
  schema decision outside this phase.
- Large artifacts may need streaming writes later; this phase writes a bounded
  `Uint8Array` in one call.

## UNKNOWN

- Final artifact retention and cleanup policy.
- Whether internal alpha needs atomic temp-file rename plus fsync before wider
  use.
- How backend route handlers will bind manifest records to byte-store writes.
- Whether SQLite record storage will become mandatory before broader alpha.

## Files Changed

- `packages/storage-file-json/src/index.ts`
- `docs/ARTIFACT_BYTE_STORE_SLICE.md`
- `tests/artifactByteStoreSlice.test.ts`
- `tests/storageFileJsonAdapter.test.ts`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`

## Behavior Changed

- The external storage package now has a separate artifact byte store.
- Byte-store writes produce byte length, sha256, storage key, and file path
  metadata.
- Byte-store reads return stored bytes and metadata.
- A rendered artifact manifest can be checked against stored byte facts.
- No vNext core runtime behavior changes.

## Tests Run

- `npm.cmd run check`

## Risks Left

- Record and byte writes are still separate operations.
- Backend routes are still not bound to storage.
- Production storage readiness is not claimed.
- Artifact lifecycle cleanup is not implemented.
- SQLite/native database hardening remains future work.

## Intentionally Not Changed

- No concrete adapter was added to `@flowdoc/vnext-core` source.
- No filesystem or database writes were added to core.
- No SQLite/native dependency was added.
- No multi-record transaction atomicity is claimed.
- No backend routes were added.
- No auth/authz was added.
- No package/document schema change was made.
- No production contenteditable, browser, or clipboard readiness is assumed.
- No PDF/DOCX renderer work was added.
- No collaboration/offline behavior was added.
- No legacy editor runtime was copied.

## Next Recommended Phase

Next recommended phase: Phase 175: Storage-backed RC Roundtrip Smoke.
