# Artifact Job Boundary

Status: Phase 139 durable layout and artifact job boundary.

Phase 139 defines a durable record shape and pure transition helper for exact
layout/artifact generation jobs. It extends the pausable layout-job idea toward
artifact production without executing workers, layout, renderers, queues,
storage, or backend routes.

This is not a worker runtime.

## Evidence

- `src/generation/artifactJob.ts` defines artifact job records with job id,
  package/session references, layout/measurement/renderer profile ids, format,
  media type, cursor, progress, cancellation, retry count, artifact manifest
  reference, bounded error summary, and side-effect contracts.
- `createVNextArtifactJobPlan(...)` creates queued durable job records with a
  planned Phase 137 artifact manifest reference.
- `advanceVNextArtifactJob(...)` advances only valid lifecycle transitions:
  queued -> layout-running -> layout-complete -> rendering -> rendered, with
  explicit fail, cancel, and retry paths.
- `tests/artifactJob.test.ts` proves valid transitions, invalid transition
  blocking, retry limits, cancellation flags, rendered-manifest identity
  checks, dependency cleanliness, and phase trail updates.

## Boundary

Allowed:

- create JSON-safe durable job records;
- advance job metadata through explicit lifecycle transitions;
- record cursor/progress metadata supplied by callers;
- reference artifact manifests from the Phase 137 boundary;
- record bounded failure summaries;
- represent cancellation and retry decisions.

Blocked:

- running worker threads or queues;
- calling concrete layout or pagination execution;
- calling PDF/DOCX renderers;
- writing files, databases, object storage, browser storage, or job queues;
- adding backend routes;
- changing package/document schema.

## PASS

- Job records include package/session refs, profiles, requested format, cursor,
  progress, cancellation, retry count, artifact manifest reference, and bounded
  error state.
- Valid lifecycle transitions advance job metadata.
- Invalid transitions are blocked with explicit issues.
- Retry limits and cancellation semantics are visible.
- No rendering, storage, route, queue, or worker behavior is introduced.

## FAIL / BLOCKER

- No blocker was found for closing this job-record boundary.

## RISK

- Progress is caller-supplied metadata; this phase does not verify real worker
  execution or layout completeness.
- Cancellation is a durable state transition, not an async worker interrupt.

## UNKNOWN

- Concrete worker runtime, queue backend, timeout policy, cancellation
  mechanics, and artifact job scheduling remain unknown.
- Production retry policy and dead-letter handling remain future work.

## Files Changed

- `src/generation/artifactJob.ts`
- `src/index.ts`
- `docs/ARTIFACT_JOB_BOUNDARY.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/artifactJob.test.ts`

## Behavior Changed

- Core now exposes pure artifact job record and transition helpers.
- No worker, queue, storage, backend route, renderer, pagination, generation
  runtime, or package/document schema behavior changed.

## Tests Run

- `npm.cmd test -- tests/artifactJob.test.ts`
- `npm.cmd run check`

## Risks Left

- Connect job records to route contracts and storage adapters in later phases.
- Decide concrete worker/queue runtime and cancellation semantics outside this
  record-only boundary.
- Bind concrete renderers only after production renderer/storage choices are
  made.

## Intentionally Not Changed

- No worker runtime.
- No queue writes.
- No storage reads or writes.
- No backend route.
- No renderer execution.
- No concrete layout execution.
- No generated document payload.
- No package/document schema change.

## Non-goals

No worker runtime, queue implementation, concrete layout execution,
PDF/DOCX byte generation, storage adapter, backend route, network call,
auth/authz execution, or schema change is introduced in this phase.
