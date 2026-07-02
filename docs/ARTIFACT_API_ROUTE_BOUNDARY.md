# Artifact API Route Boundary

Status: Phase 138 backend artifact route contract boundary.

Phase 138 adds pure HTTP-shaped artifact route response contracts for
requesting generation, checking status, listing session artifacts, and
returning download metadata. It stabilizes the API envelope before concrete
server routes, storage adapters, workers, or byte streaming exist.

This is a backend artifact route contract boundary. It is not a concrete
server route.

## Evidence

- `src/generation/artifactApiRoute.ts` defines route-safe helpers for
  `artifact.request`, `artifact.status`, `artifact.listSession`, and
  `artifact.downloadMetadata`.
- The route helpers reuse the Phase 137 artifact manifest validator and never
  perform storage lookups, writes, renderer execution, auth checks, or byte
  streaming.
- `tests/artifactApiRoute.test.ts` originally proved valid/invalid request
  mapping, idempotency key representation, permission placeholders, retry-safe
  status responses, metadata-only download responses, dependency cleanliness,
  and the phase trail. That route-helper ownership test was superseded in
  Phase 230 by `tests/artifactRetainedContract.test.ts`; backend route parity
  now owns HTTP-shaped envelope behavior.

## Boundary

Allowed:

- shape HTTP-like JSON responses with `httpStatus`, headers, allowed methods,
  body, issues, and action-specific result data;
- require idempotency keys for artifact generation requests;
- require permission context for every route contract;
- mark permission context as present but `checked: false`;
- return retry-safe polling metadata for planned/rendering artifacts;
- return download metadata without bytes or URLs.

Blocked:

- starting a server;
- registering backend routes;
- reading or writing storage;
- looking up artifacts from a database or object store;
- executing PDF/DOCX renderers;
- implementing auth/authz;
- streaming artifact bytes;
- mutating package/document schema.

## PASS

- Route contracts map valid and invalid request shapes.
- Idempotency key handling is represented for generation requests.
- Permission context is required but not executed.
- Status responses are retry-safe.
- Download responses are metadata-only and never stream bytes.

## FAIL / BLOCKER

- No blocker was found for closing this route-contract boundary.

## RISK

- These helpers rely on caller-supplied artifact manifests until storage
  adapters exist.
- Final URL signing, authorization policy, and storage lookup semantics remain
  future work.

## UNKNOWN

- Concrete backend framework, auth/authz provider, storage lookup path, signed
  download URL strategy, and worker/job integration remain unknown.

## Files Changed

- `src/generation/artifactApiRoute.ts`
- `src/index.ts`
- `docs/ARTIFACT_API_ROUTE_BOUNDARY.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/artifactApiRoute.test.ts` (historical; superseded by
  `tests/artifactRetainedContract.test.ts` in Phase 230)

## Behavior Changed

- Core now exposes pure artifact API route response helpers.
- No server, storage, renderer, auth, streaming, pagination, generation
  runtime, or package/document schema behavior changed.

## Tests Run

- `npm.cmd test -- tests/artifactApiRoute.test.ts` (historical)
- Current retained-contract coverage: `npm.cmd test -- tests/artifactRetainedContract.test.ts`
- `npm.cmd run check`

## Risks Left

- Connect contracts to durable artifact jobs after the job boundary exists.
- Add storage adapter reads/writes behind explicit interfaces in a later phase.
- Decide auth/authz execution and signed download URL strategy outside core
  contract-only helpers.

## Intentionally Not Changed

- No concrete server route.
- No storage reads or writes.
- No renderer execution.
- No auth/authz implementation.
- No byte streaming.
- No generated document payload.
- No package/document schema change.

## Non-goals

No server, network call, storage adapter, database/object-store lookup,
renderer package import, PDF/DOCX byte generation, auth execution, streaming,
job queue, or schema change is introduced in this phase.
