# Core Service Consumer Map

Date: 2026-07-03

Status: consumer evidence map after backend route parity, backend non-route
consumer rewiring, retained-contract test rewrite, and Window C public route
export removal.

## Purpose

This map answers which consumers still depend on service-shaped core exports or
old backend-like package lanes. It does not move source code; Window C removed
only the route-shaped public exports. It turns the retention rule into a
practical de-export sequence:
know the consumers first, move backend execution second, split retained core
contracts third, and only then remove exported service-shaped helpers.

The current target shape remains:

```text
editor -> backend -> core
```

Gateway/API edge ownership is still deferred.

## Evidence Snapshot

The consumer scan used narrow `rg` queries across:

- `flowdoc-vnext-core`: `src`, `tests`, `docs`, `README.md`, and old package
  lanes under `packages`;
- `flowdoc-vnext-backend`: `src`, package metadata, and backend tests;
- `flowdoc-vnext-editor`: `src`, package metadata, and `AGENTS.md`.

Current findings:

- Core still publicly exports the service-shaped modules from `src/index.ts`.
- Core tests still directly prove route-shaped, persistence-shaped, workflow,
  concrete-storage, and internal-alpha runner behavior.
- Backend P1 now owns concrete file JSON storage, storage route binding, and
  artifact job storage execution under `flowdoc-vnext-backend/src`.
- Backend route parity now exists on `flowdoc-vnext-backend` `main`, with
  backend-owned contract modules:
  `flowdoc-vnext-backend/src/routes/generationRoute.ts` and
  `flowdoc-vnext-backend/src/routes/artifactRoute.ts`.
- The generation route parity entrypoint is
  `createFlowDocBackendGenerationRouteResponse(...)`; artifact route parity
  entrypoints include
  `createFlowDocBackendArtifactGenerationRouteResponse(...)`,
  `createFlowDocBackendArtifactStatusRouteResponse(...)`,
  `createFlowDocBackendSessionArtifactListRouteResponse(...)`, and
  `createFlowDocBackendArtifactDownloadMetadataRouteResponse(...)`.
- Backend runtime imports retained core contracts from `@flowdoc/vnext-core`;
  the route parity modules call `assessVNextGenerationReadiness(...)` and
  `createVNextArtifactManifestPlan(...)` rather than importing the old core
  route response helpers.
- Backend consumer rewiring is merged to `flowdoc-vnext-backend` `main` at
  commit `9d0a850`.
- Backend now owns non-route replacement contracts:
  `flowdoc-vnext-backend/src/storage/sessionRecord.ts`,
  `flowdoc-vnext-backend/src/storage/richInlineSessionRecord.ts`, and
  `flowdoc-vnext-backend/src/routes/submissionRoute.ts`.
- Backend storage route binding now accepts backend-owned session storage
  records built from `createVNextSessionPackageSnapshot(...)` facts, not core
  `createVNextSessionStorageRecord(...)` records.
- Backend tests assert that the new session/rich-inline/submission paths do
  not import `createVNextSessionStorageRecord(...)`,
  `createVNextRichInlineSessionPersistenceRecord(...)`, or
  `createVNextSubmissionStateRecord(...)`.
- Core route tests now become pure retained-contract tests for generation
  readiness and artifact manifest/job behavior.
- Route-shaped public exports have been removed from `src/index.ts`.
- `docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md` now defines the retained
  session/rich-inline/workflow facts before those public exports move.
- `docs/CORE_SESSION_PACKAGE_SNAPSHOT_SPLIT.md` now implements the retained
  `createVNextSessionPackageSnapshot(...)` helper while keeping the
  compatibility storage record public.
- `docs/CORE_RICH_INLINE_REPLAY_VALIDATION_SPLIT.md` now implements retained
  `createVNextRichInlineReplayPatchValidation(...)` and
  `createVNextRichInlineReplayValidation(...)` helpers while keeping the
  compatibility rich-inline session persistence record public.
- `docs/CORE_SUBMISSION_IDENTITY_STATUS_SPLIT.md` now implements retained
  `createVNextSubmissionIdentityStatus(...)` while keeping the compatibility
  submission state record public.
- Editor depends on `@flowdoc/vnext-core`, but its boundary test keeps package
  imports behind `src/core/coreAdapter.ts`.
- Editor currently imports only `safeCreateVNextRuntimeSession` and the
  minimal fixture through that adapter, not the service-shaped exports.

## Consumer Groups

| Group | Core Evidence | Backend Evidence | Editor Evidence | Current Decision |
|---|---|---|---|---|
| Route-shaped generation API | `src/generation/apiRoute.ts`; `tests/generationRuntimeRetainedContract.test.ts`; no `src/index.ts` export | `flowdoc-vnext-backend/src/routes/generationRoute.ts` implements backend-owned parity through `createFlowDocBackendGenerationRouteResponse(...)` without importing `createVNextGenerationApiRouteResponse(...)` | no direct consumer | route parity, retained-contract rewrite, and Window C de-export are complete while `src/generation/runtime.ts` remains retained truth |
| Route-shaped artifact API | `src/generation/artifactApiRoute.ts`; `tests/artifactRetainedContract.test.ts`; no `src/index.ts` export | `flowdoc-vnext-backend/src/routes/artifactRoute.ts` implements backend-owned parity through artifact request/status/list/download metadata response helpers without importing core artifact route response helpers | no direct consumer | route parity, retained-contract rewrite, and Window C de-export are complete while manifest/job/readiness contracts remain retained truth |
| Session storage record | `src/authoring/sessionStorage.ts`; `tests/sessionStorage.test.ts`; `tests/sessionPackageSnapshot.test.ts`; storage and vertical-slice tests | `flowdoc-vnext-backend/src/storage/sessionRecord.ts` creates backend-owned session storage records from `createVNextSessionPackageSnapshot(...)`; `flowdoc-vnext-backend/src/storage/storageRouteBinding.ts` accepts that backend record type | no direct consumer | backend consumer rewire complete; storage-shaped core record remains compatibility surface until Window NR-A/NR-B/NR-C |
| Rich inline session persistence | `src/authoring/richInlineSessionPersistence.ts`; `tests/richInlineReplayValidation.test.ts`; rich-inline, storage, and vertical-slice tests | `flowdoc-vnext-backend/src/storage/richInlineSessionRecord.ts` creates backend-owned records from `createVNextRichInlineReplayValidation(...)` | no direct consumer | backend consumer rewire complete; persistence-shaped core record remains compatibility surface until Window NR-A/NR-B/NR-C |
| Submission state | `src/workflow/submissionState.ts`; `tests/submissionIdentityStatus.test.ts`; `tests/submissionState.test.ts` | `flowdoc-vnext-backend/src/routes/submissionRoute.ts` creates backend-owned route responses from `createVNextSubmissionIdentityStatus(...)` | no direct consumer | backend consumer rewire complete; workflow-shaped core record remains compatibility surface until Window NR-A/NR-B/NR-C |
| Concrete file JSON storage | `packages/storage-file-json`; storage/byte-store tests | `flowdoc-vnext-backend/src/storage/fileJsonStorage.ts` is the backend-owned replacement | no direct consumer | retire core package lane after historical tests are rewired or replaced |
| Internal alpha runner | `packages/internal-alpha-runner`; route/job/vertical-slice tests | `flowdoc-vnext-backend/src/storage/storageRouteBinding.ts` and `flowdoc-vnext-backend/src/artifacts/artifactJobExecution.ts` are backend-owned replacements | no direct consumer | retire core package lane after backend parity and core historical-test cleanup |
| Retained storage/job/manifest contracts | `src/persistence/storageAdapter.ts`; `src/generation/artifactManifest.ts`; `src/generation/artifactJob.ts` | backend imports evaluator/read-result, artifact manifest, and artifact job transition helpers | no direct consumer | keep exported from core as split-contract truth |
| Editor core adapter | no service module ownership | future backend integration should call backend, then backend calls core | `src/core/coreAdapter.ts`; `src/tests/boundary.test.ts` | keep editor import facade; do not expose core service helpers directly to editor |

## De-export Readiness

### Ready For Deprecation, Blocked From Immediate Public Removal

Do not remove these remaining exports yet:
- `./authoring/sessionStorage.js`
- `./authoring/richInlineSessionPersistence.js`
- `./workflow/submissionState.js`

Reasons:

- route-shaped backend parity exists, core route tests now become pure
  retained-contract tests, and route-shaped public exports have been removed;
- backend consumer rewiring is now proven on `flowdoc-vnext-backend`
  `main@9d0a850`;
- core historical tests still prove service-shaped compatibility record
  behavior;
- retained core contract names for package snapshot, replay patch validation,
  and workflow identity facts are mapped and implemented;
- editor/backend consumers no longer import the service-shaped helper names.

### Ready To Keep

Keep these as core-owned or split-contract exports:

- `src/generation/runtime.ts`
- `src/generation/artifactManifest.ts`
- `src/generation/artifactJob.ts`
- `src/persistence/storageAdapter.ts`
- authoring operation, history-ready, and rich inline commit semantics;
- package/schema/graph/operation/pagination/renderer-consumption contracts.

### Removal Preconditions

A service-shaped export can be deprecated or removed only when all are true:

1. Backend has a package-level `@flowdoc/vnext-core` consumer with matching
   tests for the replacement backend behavior. This is now true for
   generation/artifact route parity and for session/rich-inline/submission
   non-route consumer rewiring.
2. The retained core contract has a named owner and direct core tests.
3. Backend and editor no longer import the service-shaped core export.
4. Core historical tests either move to backend or become pure retained-contract
   tests. This is now true for generation/artifact route-helper tests, but not
   yet true for all session/rich-inline/submission compatibility tests.
5. The de-export patch updates `src/index.ts`, docs, and guard tests together.

## Next Implementation Order

1. Start Window NR-A by marking the remaining service-shaped helper exports as
   deprecated while keeping public entrypoint compatibility.
2. Rewrite core historical tests for session/rich-inline/submission so
   retained-contract tests prove core facts and backend tests prove backend
   records/routes.
3. Update historical route docs so Phase 86/138 route helper evidence is read
   as history, not current core ownership.
4. Retire `packages/storage-file-json` and `packages/internal-alpha-runner`
   from core after backend parity and historical-test replacement are proven.

## PASS

- The current consumer groups are separated into route-shaped API, persistence
  builders, workflow state, concrete backend package lanes, retained contracts,
  and editor adapter usage.
- Backend route parity now exists for the generation and artifact API route
  contracts without importing the old core route helpers.
- Backend consumer rewiring now exists for session, rich-inline, and
  submission contracts without importing the old service-shaped helpers.
- Backend P1 migration is treated as evidence for execution ownership, not as
  permission to delete retained core contracts.
- Editor is currently clean: core package imports are behind its adapter facade,
  and no direct service-shaped export consumer was found.

## FAIL / BLOCKER

- None for consumer evidence capture.

## RISK

- Deprecated route source files still exist, and storage-shaped helpers remain
  exported, so duplicated truth can linger if source cleanup/splits are
  delayed.
- Backend route parity and non-route replacement slices are contract/storage
  shells and are not all wired into the concrete HTTP server yet.
- Core tests still depend on compatibility record shapes until Window NR-B.
- Old core package lanes still contain concrete filesystem behavior for
  historical evidence.

## UNKNOWN

- Final production backend workflow storage/review route names are not locked.
- Exact timing for Window NR-A/NR-B/NR-C is not decided.
- Final production rich-inline replay and submission workflow execution are
  not implemented yet.

## Files Changed

- `docs/CORE_SERVICE_CONSUMER_MAP.md`
- `docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md`
- `tests/coreServiceConsumerMap.test.ts`
- README and phase ledger pointers

## Behavior Changed

- Documentation, guard tests, and route public export removal.
- No runtime source modules moved.
- Route-shaped public exports removed; remaining service-shaped exports stay.
- Backend consumer rewiring evidence is recorded as complete.
- No backend or editor code changed.

## Tests Run

- `npm run check`

## Risks Left

- Window B deprecation markers, retained-contract rewrite, and Window C public
  export removal now exist; deprecated route source cleanup remains optional.
- Session/rich-inline/workflow split-before-move now has retained helpers and
  backend consumer rewiring evidence; deprecation/de-export windows remain.
- Old concrete package lanes remain in core until historical-test replacement
  and consumer rewiring are proven.

## Intentionally Not Changed

- No source module moved.
- No remaining service-shaped public export removed.
- Core route deprecation markers remain in source files, but the public route
  exports are removed.
- No editor consumer changed.
- No gateway layer introduced.
