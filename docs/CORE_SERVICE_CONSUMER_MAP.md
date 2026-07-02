# Core Service Consumer Map

Date: 2026-07-03

Status: consumer evidence map after `docs/CORE_RETENTION_MAP.md` and after the
first backend route parity implementation in `flowdoc-vnext-backend`. Public
de-export work has not started.

## Purpose

This map answers which consumers still depend on service-shaped core exports or
old backend-like package lanes. It does not move source code and does not remove
public exports. It turns the retention rule into a practical de-export sequence:
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
- Backend route parity now exists on `flowdoc-vnext-backend` branch
  `codex/backend-route-parity` at commit `2ae6570`, with backend-owned
  contract modules:
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
- Backend test setup still imports `createVNextSessionStorageRecord(...)` to
  seed storage route binding records.
- Editor depends on `@flowdoc/vnext-core`, but its boundary test keeps package
  imports behind `src/core/coreAdapter.ts`.
- Editor currently imports only `safeCreateVNextRuntimeSession` and the
  minimal fixture through that adapter, not the service-shaped exports.

## Consumer Groups

| Group | Core Evidence | Backend Evidence | Editor Evidence | Current Decision |
|---|---|---|---|---|
| Route-shaped generation API | `src/generation/apiRoute.ts`; `tests/generationApiRoute.test.ts`; `src/index.ts` export | `flowdoc-vnext-backend/src/routes/generationRoute.ts` implements backend-owned parity through `createFlowDocBackendGenerationRouteResponse(...)` without importing `createVNextGenerationApiRouteResponse(...)` | no direct consumer | route parity exists; plan controlled de-export while retaining `src/generation/runtime.ts` readiness truth |
| Route-shaped artifact API | `src/generation/artifactApiRoute.ts`; `tests/artifactApiRoute.test.ts`; `src/index.ts` export | `flowdoc-vnext-backend/src/routes/artifactRoute.ts` implements backend-owned parity through artifact request/status/list/download metadata response helpers without importing core artifact route response helpers | no direct consumer | route parity exists; plan controlled de-export while retaining manifest/job/readiness contracts |
| Session storage record | `src/authoring/sessionStorage.ts`; `tests/sessionStorage.test.ts`; storage and vertical-slice tests | `src/tests/storageRouteBinding.test.ts` uses `createVNextSessionStorageRecord(...)` as fixture setup | no direct consumer | split package snapshot helper from storage-shaped record before move |
| Rich inline session persistence | `src/authoring/richInlineSessionPersistence.ts`; rich-inline, storage, and vertical-slice tests | no runtime consumer found | no direct consumer | split replay-patch validation and history-ready facts before move |
| Submission state | `src/workflow/submissionState.ts`; `tests/submissionState.test.ts` | no runtime consumer found | no direct consumer | move workflow runtime to backend; retain only package/document/data identity facts if needed |
| Concrete file JSON storage | `packages/storage-file-json`; storage/byte-store tests | `flowdoc-vnext-backend/src/storage/fileJsonStorage.ts` is the backend-owned replacement | no direct consumer | retire core package lane after historical tests are rewired or replaced |
| Internal alpha runner | `packages/internal-alpha-runner`; route/job/vertical-slice tests | `flowdoc-vnext-backend/src/storage/storageRouteBinding.ts` and `flowdoc-vnext-backend/src/artifacts/artifactJobExecution.ts` are backend-owned replacements | no direct consumer | retire core package lane after backend parity and core historical-test cleanup |
| Retained storage/job/manifest contracts | `src/persistence/storageAdapter.ts`; `src/generation/artifactManifest.ts`; `src/generation/artifactJob.ts` | backend imports evaluator/read-result, artifact manifest, and artifact job transition helpers | no direct consumer | keep exported from core as split-contract truth |
| Editor core adapter | no service module ownership | future backend integration should call backend, then backend calls core | `src/core/coreAdapter.ts`; `src/tests/boundary.test.ts` | keep editor import facade; do not expose core service helpers directly to editor |

## De-export Readiness

### Blocked From Immediate Removal

Do not remove these exports yet:

- `./generation/apiRoute.js`
- `./generation/artifactApiRoute.js`
- `./authoring/sessionStorage.js`
- `./authoring/richInlineSessionPersistence.js`
- `./workflow/submissionState.js`

Reasons:

- route-shaped backend parity exists, but core historical tests still assert
  the old route helper behavior;
- the public compatibility/deprecation window is not locked;
- backend tests still use the session storage record shape;
- core tests still prove service-shaped boundary behavior;
- retained core contract names for package snapshot, replay patch validation,
  and workflow identity facts are not split yet;
- editor/backend consumer rewiring has not been proven.

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
   tests for the replacement backend behavior. This is now true for generation
   and artifact route parity only.
2. The retained core contract has a named owner and direct core tests.
3. Backend and editor no longer import the service-shaped core export.
4. Core historical tests either move to backend or become pure retained-contract
   tests.
5. The de-export patch updates `src/index.ts`, docs, and guard tests together.

## Next Implementation Order

1. Draft the controlled de-export/deprecation window for
   `src/generation/apiRoute.ts` and `src/generation/artifactApiRoute.ts`.
2. Convert core route tests into retained-contract tests or mark the public
   route helpers deprecated for one compatibility window.
3. Split retained core helpers for session package snapshots, rich inline
   replay-patch validation, and submission identity facts.
4. Rewire backend/editor consumers to backend-owned route and persistence
   behavior.
5. De-export route-shaped core modules after the compatibility window and test
   rewrite are complete.
6. Retire `packages/storage-file-json` and `packages/internal-alpha-runner`
   from core after backend parity and historical-test replacement are proven.

## PASS

- The current consumer groups are separated into route-shaped API, persistence
  builders, workflow state, concrete backend package lanes, retained contracts,
  and editor adapter usage.
- Backend route parity now exists for the generation and artifact API route
  contracts without importing the old core route helpers.
- Backend P1 migration is treated as evidence for execution ownership, not as
  permission to delete retained core contracts.
- Editor is currently clean: core package imports are behind its adapter facade,
  and no direct service-shaped export consumer was found.

## FAIL / BLOCKER

- None for route parity evidence capture.

## RISK

- Core still exports route-shaped and storage-shaped helpers, so duplicated
  truth can linger if the de-export window is delayed.
- Backend route parity is contract-only and is not wired into the concrete HTTP
  server yet.
- Backend tests still depend on a core session storage record fixture shape.
- Old core package lanes still contain concrete filesystem behavior for
  historical evidence.

## UNKNOWN

- Final names for retained package snapshot, rich inline replay validation, and
  workflow identity helpers are not locked.
- Compatibility-window length for public de-export is not decided.

## Files Changed

- `docs/CORE_SERVICE_CONSUMER_MAP.md`
- `tests/coreServiceConsumerMap.test.ts`
- README and phase ledger pointers

## Behavior Changed

- Documentation and guard tests only.
- No runtime source modules moved.
- No public exports removed.
- No backend or editor code changed.

## Tests Run

- `npm run check`

## Risks Left

- Core route de-export/deprecation planning remains the next required lane.
- Session/rich-inline/workflow split-before-move remains open.
- Old concrete package lanes remain in core until historical-test replacement
  and consumer rewiring are proven.

## Intentionally Not Changed

- No source module moved.
- No public export removed.
- No core de-export or deprecation marker added.
- No editor consumer changed.
- No gateway layer introduced.
