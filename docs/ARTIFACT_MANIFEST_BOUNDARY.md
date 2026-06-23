# Artifact Manifest Boundary

Status: Phase 137 artifact manifest and storage boundary.

Phase 137 adds a core-owned artifact manifest record contract for renderer
outputs after bytes exist, while keeping storage persistence, renderer
execution, backend routes, and package/document schema changes out of core.

This is an artifact manifest and storage-record boundary. It is not a storage
adapter.

## Evidence

- `src/generation/artifactManifest.ts` defines artifact manifest lifecycle
  statuses, format/media metadata, profile ids, sha256, byte length,
  `storageKey`, bounded failure summaries, and explicit `storageStatus`.
- `createVNextArtifactManifestPlan(...)` validates records, requires explicit
  nulls for intentionally absent fields, and returns JSON-serializable plans.
- `tests/artifactManifest.test.ts` proves rendered, planned, rendering, and
  failed lifecycle behavior; bounded error summaries; dependency cleanliness;
  and the phase documentation trail.

## Boundary

Allowed:

- define artifact manifest records for `planned`, `rendering`, `rendered`,
  `failed`, `expired`, and `deleted` lifecycle states;
- require rendered records to carry `byteLength`, `sha256`, and `storageKey`;
- require failed records to carry bounded `code`, `message`, and `retryable`
  error summaries;
- keep storage write status explicit as storageStatus = `not-written`.

Blocked:

- writing files, databases, object storage, browser storage, or cache entries;
- importing concrete renderer packages or the PDF spike package into core;
- adding backend routes;
- running PDF/DOCX rendering;
- mutating package/document schema;
- replacing generation readiness or pagination behavior.

## PASS

- Artifact manifest records validate before any production storage binding.
- Missing fields are explicit and must use `null` when intentionally absent.
- Failed records carry bounded error summaries only.
- Core source remains dependency-clean and side-effect-free.

## FAIL / BLOCKER

- No blocker was found for closing this storage-record boundary.

## RISK

- The manifest lifecycle is contract-only; no persistence durability is
  claimed.
- Future storage adapters may need to extend the record with adapter-specific
  tenancy, retention, and authorization metadata.

## UNKNOWN

- Production storage adapter implementation and storage backend are still
  unknown.
- Artifact retention, deletion semantics, and remote URL/signing policies
  remain future work.

## Files Changed

- `src/generation/artifactManifest.ts`
- `src/index.ts`
- `docs/ARTIFACT_MANIFEST_BOUNDARY.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/artifactManifest.test.ts`

## Behavior Changed

- Core now exposes a pure artifact manifest validator/plan boundary.
- No renderer, storage, backend route, pagination, generation runtime, or
  package/document schema behavior changed.

## Tests Run

- `npm.cmd test -- tests/artifactManifest.test.ts`
- `npm.cmd run check`

## Risks Left

- Implement a concrete storage adapter interface in a later guarded phase.
- Decide retention and delete/expire semantics once production storage exists.
- Connect manifest records to durable layout/artifact jobs without bypassing
  the route and storage boundaries.

## Intentionally Not Changed

- No file writes.
- No database or object storage writes.
- No backend route.
- No renderer package import.
- No PDF/DOCX rendering.
- No generated document payload.
- No package/document schema change.

## Non-goals

No storage adapter, concrete backend route, durable job queue, renderer
execution, PDF/DOCX fidelity work, browser storage, network call, or schema
change is introduced in this phase.
