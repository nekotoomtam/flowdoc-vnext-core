# Storage-Backed RC Roundtrip Smoke

Status: Phase 175 storage-backed RC roundtrip smoke.

Phase 175 runs the first internal-alpha RC roundtrip through concrete external
storage. It composes the Phase 147 scenario fixture, Phase 158/144 rich inline
commit path, Phase 173 file-backed record adapter, and Phase 174 artifact byte
store, then feeds the resulting facts into the Phase 146 RC report contract.

This phase proves storage-backed evidence only. It does not add backend routes,
server handlers, production storage readiness, renderer execution, or a
transactional record-plus-byte store.

## Boundary

- Runner package: `packages/internal-alpha-runner`.
- Runner API: `runFlowDocStorageBackedRcRoundtripSmoke(...)`.
- Concrete record storage: `@flowdoc/storage-file-json`.
- Concrete artifact byte storage: `@flowdoc/storage-file-json`.
- Core RC report remains input-driven and does not write storage itself.
- Fixture loading remains caller-owned; the runner accepts package/scenario
  inputs instead of reading fixture files.

## Roundtrip Path

The smoke performs this sequence:

1. validate the canonical package and RC scenario;
2. run the rich inline replacement command;
3. create session, durable history, and rich inline session records;
4. write artifact bytes and compute `sha256`;
5. create a rendered artifact manifest from stored byte facts;
6. create and advance an artifact job record to rendered;
7. write package/session, durable history, rich inline session, artifact
   manifest, and artifact job records;
8. read every record back from file-backed storage;
9. read artifact bytes back and verify manifest consistency;
10. produce a JSON-safe RC report summary.

## PASS

- Package/session, durable history, rich inline session, artifact manifest, and
  artifact job records are written and reloaded through concrete storage.
- Artifact bytes are written and reloaded through the byte store.
- Artifact manifest-to-byte consistency is checked.
- The RC report consumes real storage facts instead of mock write results.
- Core remains dependency-clean; concrete storage stays outside
  `@flowdoc/vnext-core`.

## FAIL-BLOCKER

- No blocker prevents route-shaped storage binding work in Phase 176.
- Backend route binding remains blocked until Phase 176.
- Production storage readiness remains blocked.
- Transactional record-plus-byte atomicity remains blocked.

## RISK

- Record writes and byte writes are separate operations.
- The smoke writes local filesystem evidence only.
- Artifact bytes are caller-supplied spike bytes; renderer execution remains a
  later phase.
- Storage reload proves read-after-write, not retention, backup, locking, or
  migration readiness.

## UNKNOWN

- Route handler error mapping and status codes.
- Whether the first backend binding should expose byte reads or metadata only.
- Whether record and byte writes need a compensation step before internal
  alpha.
- Final production database/object-store split.

## Files Changed

- `packages/internal-alpha-runner/package.json`
- `packages/internal-alpha-runner/tsconfig.json`
- `packages/internal-alpha-runner/src/index.ts`
- `packages/internal-alpha-runner/src/storageBackedRcRoundtrip.ts`
- `docs/STORAGE_BACKED_RC_ROUNDTRIP_SMOKE.md`
- `tests/storageBackedRcRoundtripSmoke.test.ts`
- `tests/artifactByteStoreSlice.test.ts`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tsconfig.json`
- `vitest.config.ts`

## Behavior Changed

- A new internal-alpha runner can execute a concrete storage-backed RC
  roundtrip from caller-provided fixture inputs and artifact bytes.
- The current project roadmap now advances from Phase 175 to Phase 176:
  Backend Route Contract To Storage Binding.
- No vNext core runtime behavior changes.

## Tests Run

- `npm.cmd run check`

## Risks Left

- Backend route-shaped helpers are not bound yet.
- Artifact job execution still does not run the PDF spike renderer.
- Record and byte writes are not transactionally linked.
- Production storage readiness is not claimed.

## Intentionally Not Changed

- No backend routes were added.
- No auth/authz was added.
- No concrete storage writes were added to core.
- No package/document schema change was made.
- No production contenteditable, browser, or clipboard readiness is assumed.
- No PDF/DOCX renderer execution was added.
- No collaboration/offline behavior was added.
- No legacy editor runtime was copied.

## Next Recommended Phase

Next recommended phase: Phase 176: Backend Route Contract To Storage Binding.
