# Core Service Concern Audit

Date: 2026-07-02

Status: planning audit before moving service-owned behavior from
`@flowdoc/vnext-core` into `flowdoc-vnext-backend`.

## Purpose

FlowDoc vNext now has three intended axes:

```text
editor -> backend -> core
```

This audit classifies current core modules by responsibility before any move is
made. The target is not to make core smaller for its own sake. The target is to
keep core as the document semantics and calculation package, while backend owns
service concerns such as transport, revision gates, storage, routes, jobs,
artifact lifecycle, workflow state, and authorization.

Gateway/API edge work is explicitly deferred. The current architecture should
remain `editor -> backend -> core` until multiple backend services, external
API versioning, tenant routing, rate limits, or auth edge ownership create a
real gateway need.

## Audit Rules

Classifications:

- `keep-core`: pure document/package semantics, graph facts, operation
  semantics, pagination/export calculations, renderer consumption contracts,
  validation, diagnostics, and history-ready records.
- `split-contract`: core may keep JSON-safe types, validation, readiness, or
  pure state transition rules, but backend should own route/storage/job/runtime
  execution.
- `move-backend`: service implementation or service-shaped orchestration should
  move to `flowdoc-vnext-backend` or a backend-owned package.
- `defer`: no move yet because the code is test scaffolding, a sandbox, or an
  external adapter lane that needs a separate migration plan.

## Current Boundary Evidence

- Core public entrypoint exports both engine modules and service-shaped modules:
  `src/index.ts` exports `persistence/storageAdapter`, `generation/apiRoute`,
  `generation/artifactApiRoute`, `generation/artifactJob`,
  `authoring/sessionStorage`, `authoring/richInlineSessionPersistence`, and
  `workflow/submissionState`.
- The core boundary document says canonical input is package v2/document v3 and
  rejects parent app routes, runtime paths, and persistence compatibility paths:
  `docs/WORKSPACE_BOUNDARY.md`.
- The migration gate says ownership must belong in schema, graph, operations,
  pagination, renderer consumption, export readiness, or history-ready records:
  `docs/LEGACY_MIGRATION_GATE.md`.
- The phase ledger records service-oriented phases as boundary or deferred work:
  `docs/PHASE_LEDGER.md` phases 86, 87, 137-140, 176-177, and 217-222.
- The new backend repo already owns an initial mutation/revision/service
  boundary: `flowdoc-vnext-backend/src/service/mutationService.ts`.

## Decision Matrix

| Area | Current Evidence | Decision | Reason |
|---|---|---|---|
| Package parser/serializer | `src/persistence/package.ts` exports `safeParseFlowDocPackageV2DocumentVNext`, `parseFlowDocPackageV2DocumentVNext`, `serializeFlowDocPackageV2DocumentVNext` | keep-core | Canonical package validation is core truth. Backend consumes it but should not own package semantics. |
| Document schema | `src/schema/document.ts` owns document v3 schema | keep-core | Persisted document vocabulary and validation remain core semantics. |
| Relationship graph | `src/graph/relationshipGraph.ts` owns graph indexes and node capabilities | keep-core | Graph facts and operation-surface facts are core semantics. |
| Operations | `src/operations/documentOperations.ts` exports `runVNextOperation`; `src/operations/commands.ts` defines command kinds | keep-core | Operation semantics are pure document mutation rules. Backend should call this through the package dependency. |
| Runtime session | `src/runtime/session.ts` exports `safeCreateVNextRuntimeSession` | keep-core | Canonical package parse plus graph/session facts are pure core read facts. |
| Structural projection and packets | `src/structure/projection.ts`, `src/structure/packet.ts` | keep-core | Derived graph projections and core operation packets are calculation/contract output, not service execution. |
| Key/data diagnostics | `src/binding/keyDataDiagnostics.ts`, `src/binding/keyHistory.ts`, `src/binding/repeatCollectionFormSlots.ts` | keep-core | These are package/data readiness and migration planning calculations. Actual migration execution and persistence remain backend. |
| Text transactions and rich inline commit | `src/authoring/textTransactions.ts`, `src/authoring/richInlineCommit.ts`, `src/authoring/fieldChipCommands.ts` | keep-core | These are pure authoring semantics and history-ready records. Backend/editor can orchestrate them, but core owns mutation rules. |
| Live layout boundary | `src/authoring/liveLayoutBoundary.ts` | keep-core | Converts dirty scopes/history into layout request facts without executing a service. |
| Durable history snapshot | `src/authoring/durableHistory.ts` | split-contract | History-ready snapshot shape can remain core, but durable storage writes and undo service behavior belong backend/editor. |
| Generation readiness runtime | `src/generation/runtime.ts` exports `safeParseVNextGenerationRequest` and `assessVNextGenerationReadiness` | split-contract | Readiness calculation can remain core; request id, idempotency, output orchestration, and runtime execution belong backend. |
| Generation API route | `src/generation/apiRoute.ts` exports `createVNextGenerationApiRouteResponse` with HTTP status/headers | move-backend | HTTP-shaped route response is backend transport concern. Core can expose readiness result only. |
| Artifact API route | `src/generation/artifactApiRoute.ts` exports artifact request/status/list/download route responses and permission context | move-backend | Route methods, HTTP status, permissions, retry, artifact request, and download metadata are backend concerns. |
| Artifact manifest | `src/generation/artifactManifest.ts` exports `createVNextArtifactManifestPlan` | split-contract | Manifest schema/validation can stay core or a shared contract package; artifact lifecycle and storage pointer mutation belong backend. |
| Artifact job record/state | `src/generation/artifactJob.ts` exports `createVNextArtifactJobPlan` and `advanceVNextArtifactJob` | split-contract | Pure job record transition rules can remain as contract short-term; queue ownership, worker execution, retry scheduling, and persistence belong backend. |
| Storage adapter contract | `src/persistence/storageAdapter.ts` exports `createVNextStorageAdapterContractPlan`, `evaluateVNextStorageWriteRequest`, `createVNextStorageReadResult` | split-contract | Interface/evaluator can remain as JSON-safe contract, but concrete storage adapters and record lifecycle should move backend. |
| Session storage record | `src/authoring/sessionStorage.ts` exports `createVNextSessionStorageRecord` | move-backend | It creates backend persistence records and storage manifests from editor sessions. Core can keep package serializer only. |
| Rich inline session persistence | `src/authoring/richInlineSessionPersistence.ts` exports `createVNextRichInlineSessionPersistenceRecord` | move-backend | It combines session storage, durable history, replay patches, storage keys, and backend API status. That is service persistence orchestration. |
| Submission state | `src/workflow/submissionState.ts` exports `createVNextSubmissionStateRecord` and marks external submission state | move-backend | Workflow state, actor/reviewer facts, and route/storage execution are product/backend workflow concerns. |
| Editor bridge runtime | `src/editorBridge/runtime.ts` exports `safeCreateVNextEditorBridgeRuntime` | split-contract | The read-only bridge is useful as a core projection today, but the name and consumer-facing shape should migrate toward a generic read model contract; editor/backend transport wrappers should not live in core. |
| Concrete file JSON storage | `packages/storage-file-json/src/index.ts` imports `node:fs`, writes JSON records, and exposes `createFlowDocFileJsonStorageAdapter` | move-backend | Filesystem writes are concrete backend/dev storage implementation. It already imports core as a public package, so it can move out cleanly. |
| Internal alpha runner | `packages/internal-alpha-runner/src/storageRouteBinding.ts` and `artifactJobExecution.ts` bind route-shaped requests to storage/PDF artifact execution | move-backend | It is backend route/storage/job orchestration. Keep only as migration evidence until backend absorbs it. |
| Template builder sandbox server | `examples/template-builder-sandbox/scripts/serve.mjs` creates HTTP routes under `/api/actions/*` | move-backend or editor-lab | It is a lab server and frontend sandbox, not core. The mutation semantics it proves should be represented through backend service tests. |
| Text engine WASM package | `packages/text-engine-rust-wasm` | defer | This is an external measurement-engine adapter lane, not a backend service concern. Keep its own migration plan separate from backend split. |
| PDF renderer spike package | `packages/pdf-renderer-spike` | defer | Renderer package extraction is related to artifact execution but should stay as a renderer-adapter decision, not part of the backend-service audit move. |

## Priority Migration Plan

### P0: Freeze Contracts Before Moving

Do first:

- Add backend-side consumers for the contracts already needed by mutation/read
  envelopes.
- Keep `@flowdoc/vnext-core` imports package-level only from backend.
- Do not remove core exports while editor/backend consumers are still being
  rewired.

Evidence to preserve:

- `tests/storageAdapter.test.ts` currently proves storage interface behavior.
- `tests/generationRuntime.test.ts` proves readiness-only generation behavior.
- `tests/artifactJob.test.ts` proves artifact job transition behavior.
- `tests/artifactManifest.test.ts` proves manifest validation behavior.

### P1: Move Concrete Backend Implementations

Move or recreate under `flowdoc-vnext-backend`:

- `packages/storage-file-json`
- `packages/internal-alpha-runner`
- route/storage binding behavior from `packages/internal-alpha-runner/src/storageRouteBinding.ts`
- artifact execution behavior from `packages/internal-alpha-runner/src/artifactJobExecution.ts`

Keep core tests that prove core has no direct dependency on those packages until
the move is complete.

### P2: Move Route-Shaped Core Modules

Move backend route modules after backend has matching tests:

- `src/generation/apiRoute.ts`
- `src/generation/artifactApiRoute.ts`

Replacement shape:

- core exposes pure readiness/manifest/job result contracts;
- backend wraps those contracts in HTTP status, headers, permissions,
  idempotency, and retry semantics.

### P3: Move Persistence Record Builders

Move backend-owned persistence record builders:

- `src/authoring/sessionStorage.ts`
- `src/authoring/richInlineSessionPersistence.ts`
- workflow storage/application shape from `src/workflow/submissionState.ts`

Core should retain only package serialization, authoring history records, rich
inline operation semantics, and any pure validation helpers that backend needs.

### P4: Clean Public Exports

Once backend consumes the moved modules:

- remove route/storage/session-persistence exports from `src/index.ts`;
- keep compatibility only through a planned deprecation window if editor/backend
  cannot move in one patch;
- add boundary tests that prevent reintroducing HTTP route, concrete storage,
  or workflow service behavior into exported core.

## Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| Breaking editor/backend consumers by removing public exports too early | high | Move backend consumers first, then de-export in a separate patch. |
| Copying implementation into backend and leaving two active truths | high | Mark moved core modules deprecated or remove them after backend tests pass. |
| Treating contract-only record shapes as production backend behavior | medium | Keep `contractOnly`, `not-written`, `route-contract-only`, and `execution=false` flags until backend owns real implementations. |
| Moving renderer adapter work as part of backend split | medium | Keep renderer/text-engine packages in separate lanes; backend only orchestrates artifact jobs. |
| Adding gateway too early | medium | Defer gateway until multiple backend services or API edge requirements exist. |
| Losing core operation semantics while moving service code | high | Do not move `runVNextOperation`, graph, schema, package parser, or core operation result types. |

## Recommended Next Patch

Start with P1, not P2.

Reason: `flowdoc-vnext-backend` already exists and can safely absorb concrete
backend/dev implementations without changing core public route contracts yet.
The safest next patch is:

1. copy or recreate file-backed storage and storage-route binding tests in
   backend;
2. prove backend imports `@flowdoc/vnext-core` package-level only;
3. leave core source untouched except for documentation until backend parity
   passes;
4. only then remove or de-export the duplicated backend implementation from
   core.

## Post Backend Consumer Rewire Note

Backend P1 and the first non-route consumer rewire are now complete on
`flowdoc-vnext-backend` `main@9d0a850`. Core should no longer plan another
backend move for session, rich-inline, or submission compatibility helpers
before starting de-export work. The next core-owned step is a small
compatibility sequence:

1. Window NR-A: mark service-shaped helper names deprecated while keeping
   public entrypoint compatibility.
2. Window NR-B: rewrite core historical tests toward retained-contract
   assertions.
3. Window NR-C: narrow public exports to retained helper names.

## Intentionally Not Changed In This Audit

- No source modules moved.
- No public exports removed.
- No backend code changed.
- No editor code changed.
- No gateway layer introduced.
- No new runtime behavior claimed.
