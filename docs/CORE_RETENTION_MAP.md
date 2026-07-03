# Core Retention Map

Date: 2026-07-03

Status: retention guard after Core Service Concern Audit, Window C public route
export removal, backend non-route consumer rewiring, Window NR-B
retained-test rewrite/public-entrypoint test cleanup, package-lane cleanup, and
Window NR-C public export narrowing.

## Purpose

This map turns `docs/CORE_SERVICE_CONCERN_AUDIT.md` into a move-and-retain
rule. The goal is not to make core smaller by cutting away anything that looks
backend-shaped. The goal is to keep core as the truth engine for document
semantics, package contracts, pure validation, operation rules, pagination /
renderer-consumption contracts, and history-ready records while backend owns
transport, durable persistence, queue/worker execution, storage implementations,
authorization, and workflow runtime.

The backend migration now has backend-owned file JSON storage, storage route
binding, artifact job storage execution, session/rich-inline records, and
submission route contracts under `flowdoc-vnext-backend` `main@9d0a850`. Core
must use that as migration evidence, not as a reason to delete contract truth
prematurely.

The remaining compatibility source modules are still
`src/authoring/sessionStorage.ts`,
`src/authoring/richInlineSessionPersistence.ts`, and
`src/workflow/submissionState.ts`. They remain source evidence for retained
helper composition and historical tests, not final service ownership.
Window NR-B retained-test rewrite and public-entrypoint test cleanup are
recorded in
`docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md`; package-lane cleanup and
Window NR-C public export narrowing are recorded there as well.

## Move + Retain Rule

Every service concern move must answer both sides before code is removed:

- `backend owns`: runtime execution, IO, routes, request ids, revision gates,
  idempotency, retry scheduling, storage writes, artifact byte lifecycle,
  permissions, workflow runtime, and product/service policy.
- `core retains`: JSON-safe contract shapes, canonical package/schema
  semantics, graph facts, pure operation rules, readiness calculations,
  manifest/job state validation, storage envelope evaluation, authoring
  semantics, renderer-consumption contracts, and history-ready records.
- `temporary duplicate`: allowed only while backend/editor consumers are being
  rewired. It must have a de-export precondition and must not become a second
  long-lived truth.

## Retention Matrix

| Area | Backend Owns | Core Retains | Current State |
|---|---|---|---|
| Package parser and serializer | package repository reads/writes and service revision gates | `src/persistence/package.ts` canonical package v2/document v3 parse, safe-parse, and serialize truth | keep-core |
| Document schema | none beyond consuming accepted packages | `src/schema/document.ts` persisted document vocabulary and validation | keep-core |
| Relationship graph | service read envelopes may include graph-derived facts | `src/graph/relationshipGraph.ts` graph indexes, parent/child facts, and capability facts | keep-core |
| Operations | request envelope, base revision stale gate, persistence after mutation | `src/operations/documentOperations.ts` and operation result/history-ready semantics | keep-core |
| Runtime session | backend read endpoints and service envelopes | `src/runtime/session.ts` canonical package parse plus graph/session read facts | keep-core |
| Structural projection and packets | transport envelopes and backend/editor delivery | `src/structure/projection.ts` and `src/structure/packet.ts` derived core read models and packet contracts | keep-core |
| Key/data diagnostics | migration execution, durable migration jobs, package/data writes | `src/binding/keyDataDiagnostics.ts`, `keyHistory.ts`, and `repeatCollectionFormSlots.ts` readiness and planning facts | keep-core |
| Text transactions and rich inline commit | service mutation orchestration, revision gates, persistence after accepted mutation | `src/authoring/textTransactions.ts`, `richInlineCommit.ts`, and `fieldChipCommands.ts` authoring mutation semantics | keep-core |
| Live layout boundary | live service transport, browser scheduling, exact layout execution | `src/authoring/liveLayoutBoundary.ts` dirty-scope to layout-request facts | keep-core |
| Durable history snapshot | durable history store, undo service, replay execution | `src/authoring/durableHistory.ts` history-ready JSON snapshot and undo/redo metadata | split-contract |
| Generation readiness runtime | route dispatch, request id lifecycle, output orchestration, durable artifact request | `src/generation/runtime.ts` request parse and readiness-only calculation | split-contract |
| Generation API route | HTTP status, headers, server route, auth, service retry/idempotency policy now owned by backend route parity | readiness result contracts and error vocabulary backed by `src/generation/runtime.ts` | public core export removed; source file `src/generation/apiRoute.ts` remains deprecated/internal until source cleanup |
| Artifact API route | HTTP method/status, permission checks, artifact request/status/list/download routes now owned by backend route parity | manifest/job/readiness contracts in `artifactManifest.ts`, `artifactJob.ts`, and render API contract fixtures | public core export removed; source file `src/generation/artifactApiRoute.ts` remains deprecated/internal until source cleanup |
| Artifact manifest | artifact lifecycle persistence, byte-store pointer mutation, cleanup policy | `src/generation/artifactManifest.ts` JSON-safe manifest validation and status vocabulary | split-contract |
| Artifact job record/state | queue, worker execution, storage writes, retry scheduling, renderer orchestration | `src/generation/artifactJob.ts` durable job record shape and pure transition rules | split-contract |
| Storage adapter contract | file/database/object-store adapters, concrete persistence lifecycle, transaction policy | `src/persistence/storageAdapter.ts` envelope shape, read/write evaluator, idempotency and expected-revision rules | split-contract |
| Session storage record | durable session store, storage key lifecycle, backend read/write routes now represented by `flowdoc-vnext-backend/src/storage/sessionRecord.ts` and `storageRouteBinding.ts` | package snapshot serialization intent and persisted-state exclusions now split into `createVNextSessionPackageSnapshot(...)`; compatibility storage record still exists for owner-module composition/storage/vertical-slice historical tests | backend consumer rewire, Window NR-B public-entrypoint test cleanup, package-lane cleanup, and Window NR-C public export narrowing complete; see `docs/CORE_SESSION_PACKAGE_SNAPSHOT_SPLIT.md`, `docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md`, and `docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md` |
| Rich inline session persistence | storage adapter writes, backend API calls, replay service, conflict resolution execution now represented by `flowdoc-vnext-backend/src/storage/richInlineSessionRecord.ts` | rich inline commit semantics, history records, replay patch validation facts, and before/after child snapshots now split into `createVNextRichInlineReplayValidation(...)`; compatibility persistence record still exists for owner-module composition/storage/vertical-slice historical tests | backend consumer rewire, Window NR-B public-entrypoint test cleanup, package-lane cleanup, and Window NR-C public export narrowing complete; see `docs/CORE_RICH_INLINE_REPLAY_VALIDATION_SPLIT.md`, `docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md`, and `docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md` |
| Submission state | reviewer workflow service, actor/reviewer permissions, route/storage execution now represented by `flowdoc-vnext-backend/src/routes/submissionRoute.ts` | package/document/data identity facts, external workflow status facts, validation facts, and no-mutation contracts now split into `createVNextSubmissionIdentityStatus(...)`; compatibility workflow state record still exists for owner-module composition historical tests | backend consumer rewire, Window NR-B public-entrypoint test cleanup, package-lane cleanup, and Window NR-C public export narrowing complete; see `docs/CORE_SUBMISSION_IDENTITY_STATUS_SPLIT.md`, `docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md`, and `docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md` |
| Editor bridge runtime | backend/editor transport wrappers and product read endpoints currently represented by `src/editorBridge/runtime.ts` consumers | read-only package/graph/pagination/export readiness projection, eventually renamed toward a generic read model | split-contract |
| Concrete file JSON storage | `flowdoc-vnext-backend/src/storage/fileJsonStorage.ts` and future production adapters | no concrete file/db/object-store storage in exported `src/**`; old `packages/storage-file-json` lane remains migration evidence until removal | move-backend |
| Internal alpha runner | `flowdoc-vnext-backend/src/storage/storageRouteBinding.ts` and `src/artifacts/artifactJobExecution.ts` | no runner execution in exported `src/**`; old `packages/internal-alpha-runner` lane remains migration evidence until removal | move-backend |
| Template builder sandbox server | backend/editor-lab route, static serving, browser smoke harness | core mutation, packet, and projection contracts consumed by the sandbox | move-backend-or-editor-lab |
| Text engine WASM and PDF renderer spike | renderer adapter packages and runtime bindings | SPI/contracts, measurement identity, renderer-consumption contracts, and bounded evidence summaries | defer |

## De-export Preconditions

Do not remove public exports only because backend P1 exists. Remove or de-export
a service-shaped core export only after all preconditions for that area are true:

At the sequence level, public de-export is sequenced through Window
NR-A/NR-B/NR-C; NR-A, NR-B core-test cleanup, package-lane cleanup, and Window
NR-C public export narrowing are complete for the remaining non-route
service-shaped helpers.

1. Backend has a package-level `@flowdoc/vnext-core` consumer with matching
   tests.
2. The retained core contract has a named owner and test coverage.
3. Editor/backend consumers no longer import the service-shaped core export.
4. The old core export is either marked deprecated for one compatibility window
   or removed in the same patch that updates every known consumer.
5. Boundary tests prove exported `src/**` did not gain concrete backend imports,
   filesystem/database writes, HTTP server routes, queue/worker runtime, auth,
   or renderer package execution.

## Boundary Guards

Core guard tests should keep these facts true:

- `src/**` does not import `@flowdoc/storage-file-json`,
  `@flowdoc/internal-alpha-runner`, or `@flowdoc/pdf-renderer-spike`.
- `src/**` does not import Node filesystem or HTTP server modules for service
  runtime execution.
- `src/persistence/storageAdapter.ts` stays interface-only with
  `concreteBackend: null`.
- `src/generation/artifactJob.ts` stays worker/layout/renderer/storage
  execution false.
- `src/generation/artifactManifest.ts` keeps `storageStatus: "not-written"` and
  does not write artifact bytes.
- route-shaped public exports are removed after backend route parity and
  retained-contract rewrite; remaining source files are not long-lived
  canonical route owners.

## Next Implementation Order

1. Window NR-A deprecation markers are complete in
   `docs/CORE_NON_ROUTE_DEPRECATION_WINDOW.md`.
2. Window NR-B retained-test rewrite and public-entrypoint test cleanup are
   complete in
   `docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md`.
3. Window NR-C public export narrowing is complete in
   `docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md`.
4. Remove deprecated route source files only after historical docs and source
   evidence no longer need them.
5. Remove old concrete package lanes from core after backend parity and consumer
   rewiring are both proven.

## PASS

- Retention owners are explicit for every service-shaped area from the audit.
- Backend P1 migration is treated as consumer evidence, not as permission to
  delete core contract truth.
- Backend non-route consumer rewiring is now proven on
  `flowdoc-vnext-backend` `main@9d0a850`.
- Window NR-A deprecation markers are now applied to the remaining non-route
  service-shaped helper functions.
- Window NR-B now moves primary historical tests to retained facts and moves
  remaining compatibility/storage/vertical-slice test imports off the public
  core entrypoint.
- Window NR-C public export narrowing complete: retained non-route facts remain
  public while service-shaped compatibility helpers/types/constants are no
  longer exported from `src/index.ts`.
- De-export work is gated by parity, consumer rewiring, retained contract
  coverage, and boundary guard tests.

## FAIL / BLOCKER

- None for this planning guard.

## RISK

- Route-shaped public exports are removed, but deprecated route source files
  remain until source cleanup.
- Backend and core can drift if duplicated route/storage behavior remains active
  for too long.
- Session, rich-inline, and submission retained helpers now exist and backend
  consumer rewiring is proven; service-shaped compatibility records remain in
  owner modules for historical tests but are no longer public entrypoint
  exports.
- The Phase 232 split map now defines the session package snapshot,
  rich-inline replay-patch validation, and submission identity/status lanes;
  all three implementation splits are complete.

## UNKNOWN

- Exact timing for optional compatibility source cleanup is not locked.
- Final production backend workflow/replay execution shapes are still open.

## Files Changed

- `docs/CORE_RETENTION_MAP.md`
- `docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md`
- `docs/CORE_NON_ROUTE_DEPRECATION_WINDOW.md`
- `docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md`
- `tests/coreRetentionMap.test.ts`
- README and phase ledger pointers

## Behavior Changed

- Documentation, boundary tests, and route public export removal.
- No runtime source modules moved.
- Route-shaped public exports removed; non-route public exports narrowed to
  retained facts.
- Backend consumer rewiring evidence and NR-A deprecation markers are recorded
  as complete.
- Window NR-B retained-test rewrite and public-entrypoint test cleanup are
  recorded as complete.
- Window NR-C public export narrowing is recorded as complete.

## Tests Run

- `npm run check`

## Risks Left

- Deprecated route source cleanup remains optional.
- Compatibility source cleanup/removal remains optional after public de-export.
- Core package cleanup still waits for historical-test replacement.

## Intentionally Not Changed

- No source module moved.
- No owner-module compatibility source implementation removed.
- No backend or editor code changed in this core patch.
- No gateway layer introduced.
