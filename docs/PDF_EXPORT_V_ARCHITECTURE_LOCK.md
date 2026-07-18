# PDF Export V Architecture Lock

Phase `PDF-EXPORT-V-A` accepts the cross-repo production-binding order and
splits production validation into pre-render admission and post-render
completion. It does not activate a backend route, worker, storage provider,
renderer profile, or editor workflow.

## Outcome

Phase U could derive the production baseline only after a Phase T renderer
receipt existed. That is sufficient for evidence, but a backend must bind
idempotency, source identity, policy, and measured resource limits before it
allows renderer execution.

Core now exposes two additive pure contracts in
`src/generation/pdfExportProductionBaselineV1.ts`:

1. `createVNextPdfExportProductionAdmissionV1` revalidates the exact source,
   request, measured-contract content, renderer/measurement profiles, bounded
   policy, and all measurable pre-render resource facts. It derives the same
   idempotency payload fingerprint retained by Phase U without requiring a
   renderer receipt.
2. `createVNextPdfExportProductionRenderCompletionV1` rebuilds and compares the
   exact admission, revalidates the Phase T receipt, and applies the output-byte
   limit. Its successful state is only `ready-for-persistence`. It carries no
   PDF bytes, performs no byte verification, and writes no storage metadata.

The original Phase U baseline remains accepted and byte/fingerprint evidence
is unchanged. V-A adds a runtime-safe validation split; it does not replace the
Phase U evidence fixture.

## Runtime Sequence Lock

The production sequence is ordered as follows:

1. authenticate the principal and resolve the tenant;
2. load and pin the exact source revision and measured draw contract;
3. create Core production admission;
4. bind the caller idempotency key to the admission payload fingerprint in one
   durable backend PDF export operation;
5. enqueue or claim that exact operation;
6. check cancellation and deadline before handoff;
7. reload the current source, recreate the Phase T handoff, and require its
   fingerprint to match the admitted handoff;
8. check cancellation and deadline before render, then execute only the exact
   Phase T renderer input;
9. create the Phase T receipt and Core render completion;
10. check cancellation and deadline before persistence;
11. write content-addressed bytes and verify length/SHA-256 by read-after-write;
12. compare-and-swap the artifact manifest, then the artifact job;
13. complete the backend operation and expose authorized status/download
    access.

Metadata must not claim a rendered artifact before verified bytes exist.
Failures after the byte write require bounded orphan-byte reconciliation.

## Ownership Lock

### Core

Core owns request, admission, handoff, receipt, render-completion, resource,
idempotency-payload, commit-order, and activation-blocker semantics. Core does
not own caller keys, durable operation state, clocks, attempts, cancellation
signals, routes, storage, authorization, tenancy, or event delivery.

### Backend

Backend will own a PDF-specific durable operation that retains the caller
idempotency key, Core payload fingerprint, principal/tenant scope, exact source
and contract pins, attempt/deadline/cancellation state, artifact/job ids,
terminal receipt, and stop reason.

The PDF operation may reference the existing generic Core artifact job, but it
must not force PDF-specific principal, tenancy, idempotency, or deadline facts
into that generic record.

Existing backend evidence is reusable but not yet accepted as a binding:

- `src/artifacts/artifactJobExecution.ts` proves injected-renderer byte and
  record execution, but has no worker, route, auth, deadline, cancellation, or
  production renderer binding;
- `src/storage/fileJsonStorage.ts` proves content-addressed byte write and
  readback consistency, but remains an internal-alpha provider without atomic
  multi-record completion or orphan cleanup; and
- the durable composition scheduler proves claim, replay, recovery, due-work,
  and batch patterns. It remains a separate workload and cannot execute PDF
  work without a PDF-specific adapter and tests.

### Renderer

The renderer owns bounded byte execution and cooperative mid-render
cancellation. Promotion must retain the Phase T prohibition on remeasurement,
repagination, relayout, or semantic regrouping. The current synchronous pilot
does not satisfy cancellation or production runtime qualification.

### Editor

Editor is outside V-A through V-G. Export request, status, cancel, and download
UI begins only in the local-first lane after the authenticated backend route,
terminal replay, local renderer, durable providers, and dedicated worker are
composed. Editor preview pagination is not export truth.

## Binding Order

| Phase | Binding work | Production state |
| --- | --- | --- |
| `V-A` | Core admission/completion split and this architecture lock | blocked |
| `V-B` | backend operation repository, tenant/principal scope, caller-key idempotency | admission binding accepted; activation blocked |
| `V-C` | PDF worker claim/replay, attempts, deadline, cancellation, shutdown drain | lifecycle state/replay accepted; activation blocked |
| `V-D` | exact renderer adapter, cooperative cancellation, profile/runtime qualification | adapter/control gate accepted; concrete renderer blocked |
| `V-E` | durable bytes, readback verification, manifest/job CAS, orphan recovery | persistence candidate accepted; production provider blocked |
| `V-F` | privacy-safe observability and restart/fault end-to-end qualification | workflow/observability candidate accepted; production sink blocked |
| `V-G` | authenticated route/status/cancel/download binding and activation review | route candidate accepted; activation NO-GO |

No phase may mark a binding satisfied from contract shape alone. Each binding
requires implementation plus focused failure, replay, and restart evidence in
the owning repository.

## V-A Evidence

Primary evidence:

- `src/generation/pdfExportProductionBaselineV1.ts`;
- `tests/pdfExportProductionLifecycleV1.test.ts`;
- `tests/pdfExportProductionBaselineV1.test.ts`;
- `docs/PDF_EXPORT_PRODUCTION_BASELINE.md`; and
- this document.

V-A proves deterministic admission before a renderer receipt, exact parity
with the Phase U idempotency payload identity, stale-source and measured-limit
rejection before render, exact admission/receipt revalidation after render,
and deferred output-byte enforcement.

## Activation Decision

All ten Phase U runtime bindings remain unsatisfied. V-A performs no worker,
timer, cancellation, renderer, file, storage, manifest/job, event, auth,
tenancy, HTTP, or editor execution. No production flag is added.

## V-B Follow-Up

Backend now retains the exact Core admission inside an immutable PDF export
operation and binds `(tenantId, principalId, callerIdempotencyKey)` to the Core
payload fingerprint. In-memory and SQLite adapters prove exact replay,
conflict, scope isolation, restart, commit-boundary fault, and independent-
handle behavior.

This accepts the durable admission/caller-key sub-boundary. Full production
idempotency remains blocked until the same mapping can return a retained
terminal receipt. Authorization also remains blocked because V-B stores scope
facts but executes no authentication or permission decision.

Primary backend evidence:

- `docs/PDF_EXPORT_DURABLE_OPERATION_IDEMPOTENCY.md`;
- `src/pdfExport/pdfExportOperation.ts`;
- `src/pdfExport/pdfExportOperationRepository.ts`;
- `src/pdfExport/pdfExportOperationSqliteRepository.ts`;
- `src/tests/pdfExportOperation.test.ts`; and
- `src/tests/pdfExportOperationRepository.test.ts`.

## V-C Follow-Up

Backend now retains a separate revisioned lifecycle head over the immutable V-B
operation and atomically journals successful transition receipts. In-memory and
SQLite adapters prove bounded claim/reclaim, attempt exhaustion, exact replay
of the original post-transition snapshot, stale revision rejection, deadline
stops, all three cancellation checkpoints, restart, commit-boundary faults,
and one claim winner across independent handles.

The shutdown-drain gate rejects new claim reservations before waiting for
active reservations to release. It is explicitly process-local and does not
claim durable multi-process queue coordination.

This accepts the PDF lifecycle state/replay sub-boundary. Production deadline
and worker bindings remain blocked until a real worker host invokes these
transitions. Cooperative mid-render cancellation, renderer execution, bytes,
terminal Core receipt replay, artifact projection, observability, auth, routes,
and activation also remain blocked.

Primary backend evidence:

- `docs/PDF_EXPORT_LIFECYCLE_WORKER_CONTROL.md`;
- `src/pdfExport/pdfExportLifecycle.ts`;
- `src/pdfExport/pdfExportLifecycleRepository.ts`;
- `src/pdfExport/pdfExportLifecycleSqliteRepository.ts`;
- `src/pdfExport/pdfExportShutdownDrain.ts`;
- `src/tests/pdfExportLifecycleRepository.test.ts`; and
- `src/tests/pdfExportShutdownDrain.test.ts`.

## V-D Follow-Up

Backend now recreates and compares the exact admitted Core handoff before
advancing the V-C `before-render` checkpoint. A qualified-candidate renderer
receives only that exact renderer input plus an asynchronous cooperative
cancellation control. The control reloads durable lifecycle state and enforces
bounded monotonic paint-command checkpoints, cancellation, deadline, claim
ownership, and claim expiry.

Candidate bytes are returned only after byte/evidence identity checks, the
exact Core receipt and production render completion, and a durable
`before-persist` lifecycle check. Source/profile/runtime drift, checkpoint
gaps, byte drift, output-limit overflow, cancellation, deadline, and renderer
exceptions return no bytes or partial receipt.

The adapter/control/runtime candidate gate is accepted. The qualification
record deliberately retains `concreteProductionRendererSelected = false`; the
synchronous pilot is neither imported nor promoted. Production renderer
profile promotion therefore remains an activation blocker until a selected
concrete renderer passes the gate with retained evidence.

Primary backend evidence:

- `docs/PDF_EXPORT_RENDERER_ADAPTER_QUALIFICATION.md`;
- `src/pdfExport/pdfExportRendererQualification.ts`;
- `src/pdfExport/pdfExportRendererAttempt.ts`;
- `src/tests/pdfExportRendererQualification.test.ts`;
- `src/tests/pdfExportRendererAttempt.test.ts`; and
- `src/tests/helpers/pdfExportRendererFixture.ts`.

## V-E Follow-Up

Backend now consumes only V-D `ready-for-persistence` output and revalidates
the immutable operation, V-D/Core fingerprints, byte evidence, and exact live
V-C `before-persist` head. PDF bytes are atomically published under a bare
SHA-256 content identity and physically read back before any rendered metadata
can be committed.

In-memory and SQLite repositories retain one terminal persistence receipt per
operation. SQLite performs manifest CAS before job CAS inside one transaction.
Restart, independent-handle concurrency, faults after either CAS and on both
sides of commit, exact replay, identity conflict, corruption, and readback
failure are covered. Bounded orphan reconciliation requires a grace period,
caps scan/delete work, and rechecks metadata references before deletion.

This accepts the V-E persistence candidate gate. It does not select or deploy a
production storage provider, mutate V-C lifecycle after commit, emit events,
or add auth, status/download routes, or production activation. Concrete
renderer selection also remains blocked.

Primary backend evidence:

- `docs/PDF_EXPORT_DURABLE_ARTIFACT_PERSISTENCE.md`;
- `src/pdfExport/pdfExportContentAddressedStore.ts`;
- `src/pdfExport/pdfExportArtifactPersistence.ts`;
- `src/pdfExport/pdfExportArtifactPersistenceSqliteRepository.ts`;
- `src/tests/pdfExportContentAddressedStore.test.ts`;
- `src/tests/pdfExportArtifactPersistence.test.ts`; and
- `src/tests/pdfExportArtifactPersistenceSqlite.test.ts`.

Follow-up V-F is recorded below. Routes and production activation remain
closed.

## V-F Follow-Up

Backend now composes V-B through V-E behind one end-to-end candidate. It reads
terminal workflow state and physically verifies retained V-E bytes before
renderer execution, then atomically commits a fingerprint-chained event batch
and terminal workflow completion. The completion binds the exact V-E receipt
and retained V-C lifecycle evidence without mutating the V-C schema.

Events use only the Core vocabulary and required dimensions. Their schemas are
closed: source text, PDF bytes, raw tenant/principal values, free-form messages,
and arbitrary payloads are not representable. SQLite commits the complete
event chain and terminal completion in one transaction and proves rollback on
both pre-commit fault points plus exact replay after an after-commit fault.

The full durable qualification closes and reopens V-B, V-C, V-E, and V-F
repositories around faults after admission, lifecycle readiness, rendering,
and persistence. Rendering repeats only when durable verified bytes are absent;
terminal replay performs neither rendering nor persistence.

This accepts the workflow and observability candidate gate. The retained event
batch is terminal evidence, not a selected production telemetry provider or
real-time delivery path. Automatic worker hosting, production storage/event
providers and retention, concrete renderer promotion, auth/tenancy execution,
routes, deployment, and activation remain blocked.

Primary backend evidence:

- `docs/PDF_EXPORT_PRIVACY_OBSERVABILITY_QUALIFICATION.md`;
- `src/pdfExport/pdfExportObservability.ts`;
- `src/pdfExport/pdfExportObservabilitySqliteRepository.ts`;
- `src/pdfExport/pdfExportWorkflow.ts`;
- `src/tests/pdfExportObservability.test.ts`;
- `src/tests/pdfExportObservabilitySqlite.test.ts`;
- `src/tests/pdfExportWorkflow.test.ts`; and
- `src/tests/pdfExportWorkflowSqliteQualification.test.ts`.

Follow-up V-G and its carried activation blockers are recorded below.

## V-G Follow-Up And Activation Decision

Backend now exposes an unmounted concrete Node HTTP candidate for request,
status, cancellation, and download. Tenant and principal identity come only
from an injected authenticator; the closed request body cannot carry identity.
Every successful action executes an injected authorizer, and scoped repository
reads conceal operations owned by another principal or tenant.

Request binds the caller `Idempotency-Key` to trusted source/measurement/policy
resolution and repairs a missing lifecycle after admission-only interruption.
Status is redacted. Cancellation checks terminal and persistence evidence first,
retains exact transition replay, and applies the persistence-wins rule for a
late cancellation race. Download returns bytes only when V-F completion, V-E
receipt, immutable operation, and physical length/SHA-256 all agree.

Focused and SQLite-restart tests cover authentication failure, authorization
denial, identity spoofing, cross-scope concealment, request/cancel replay,
status redaction, corruption rejection, bounded HTTP input, restart, and exact
PDF download.

The authenticated route candidate is accepted. Production activation is
**NO-GO** because concrete authentication/authorization policy, trusted
admission resolver, renderer, worker/queue host, byte/metadata provider,
telemetry/retention provider, server mount, rate limiting, secrets/TLS policy,
deployment, and rollout/rollback plans remain unselected or unqualified.

Primary backend evidence:

- `docs/PDF_EXPORT_AUTHENTICATED_ROUTE_ACTIVATION_REVIEW.md`;
- `src/pdfExport/pdfExportRoute.ts`;
- `src/pdfExport/pdfExportHttpHandler.ts`;
- `src/tests/pdfExportRoute.test.ts`;
- `src/tests/pdfExportHttpHandler.test.ts`;
- `src/tests/pdfExportRouteSqliteQualification.test.ts`; and
- `src/tests/pdfExportWorkflow.test.ts`.

`PDF-EXPORT-V` is closed at candidate level. No editor workflow, default
application-server wiring, provider promotion, deployment configuration, or
production flag is accepted by V-G.

## Post-V Local-First Decision

The accepted next lane is `PDF-EXPORT-LOCAL-A` through `LOCAL-G`, beginning
with `docs/PDF_EXPORT_LOCAL_FIRST_ARCHITECTURE_LOCK.md`. It composes the V-A
through V-G candidates entirely on loopback with local PostgreSQL and local
S3-compatible object storage before any paid or hosted provider is selected.

This decision does not reopen V, change its production NO-GO result, mount the
default backend server, or name a production activation phase.
