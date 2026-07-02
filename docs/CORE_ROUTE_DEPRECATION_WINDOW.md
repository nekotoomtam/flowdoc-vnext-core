# Core Route Deprecation Window

Date: 2026-07-03

Status: Window B compatibility marker for route-shaped core exports. Phase 230
replaced route-helper tests with retained-contract tests, and Phase 231 removed
public route exports from `src/index.ts`.

## Purpose

This phase executed Window B from `docs/CORE_ROUTE_DEEXPORT_PLAN.md`. Core
route helpers remained exported for one compatibility window, and their source
remains explicitly marked as deprecated compatibility coverage. Backend route
parity is the owner of HTTP-shaped route envelopes. The follow-up
retained-contract test rewrite replaced the old route-helper ownership
assertions, and Window C removed the public route exports.

## Deprecated Compatibility Exports

The following core route helpers were public during Window B and remain
deprecated in their source files, but they are no longer exported from
`src/index.ts` after Window C:

- `VNEXT_GENERATION_API_ROUTE_SOURCE`
- `VNEXT_GENERATION_API_ROUTE_MODE`
- `VNEXT_GENERATION_API_ROUTE_ACTION`
- `createVNextGenerationApiRouteResponse(...)`
- `VNEXT_ARTIFACT_API_ROUTE_SOURCE`
- `VNEXT_ARTIFACT_API_ROUTE_MODE`
- `createVNextArtifactGenerationApiRouteResponse(...)`
- `createVNextArtifactStatusApiRouteResponse(...)`
- `createVNextSessionArtifactListApiRouteResponse(...)`
- `createVNextArtifactDownloadMetadataApiRouteResponse(...)`

They are deprecated because backend route parity now exists in:

- `flowdoc-vnext-backend/src/routes/generationRoute.ts`;
- `flowdoc-vnext-backend/src/routes/artifactRoute.ts`.

## Retained Core Owners

Do not deprecate or move these retained core contracts as part of route
de-export:

- `src/generation/runtime.ts`;
- `src/generation/artifactManifest.ts`;
- `src/generation/artifactJob.ts`;
- `src/persistence/storageAdapter.ts`.

Retained-contract tests should target:

- `assessVNextGenerationReadiness(...)`;
- `safeParseVNextGenerationRequest(...)`;
- `createVNextArtifactManifestPlan(...)`;
- `createVNextArtifactJobPlan(...)`;
- `advanceVNextArtifactJob(...)`.

## Superseded Test Ownership

The Window B route-helper tests have been replaced by retained-contract tests:

- `tests/generationRuntimeRetainedContract.test.ts`;
- `tests/artifactRetainedContract.test.ts`;
- `tests/coreRouteRetainedContractRewrite.test.ts`.

Those retained-contract tests have replaced route-helper ownership assertions.
Window C removed public route exports.

## Removal Preconditions

Window C removal status:

1. backend route parity remains green;
2. retained-contract tests replace route-helper ownership assertions; done in
   Phase 230;
3. route-helper test files no longer import route helpers from `src/index.ts`;
   done in Phase 230;
4. `src/index.ts` removes `./generation/apiRoute.js` and
   `./generation/artifactApiRoute.js`; done in Phase 231;
5. `docs/CORE_SERVICE_CONSUMER_MAP.md`,
   `docs/CORE_ROUTE_DEEXPORT_PLAN.md`, README, and
   `docs/PHASE_LEDGER.md` are updated in the same removal patch. Done in
   Phase 231.

## PASS

- Route-shaped helpers now have explicit source-level `@deprecated` markers.
- Retained-contract tests have replaced route-helper ownership assertions.
- Public route exports are no longer available from `src/index.ts`.

## FAIL / BLOCKER

- None for public route de-export.

## RISK

- The deprecated route helper source files still duplicate backend route
  vocabulary until source cleanup.
- Unknown external consumers may still rely on the removed public route
  exports.

## UNKNOWN

- Whether maintainers will require a second compatibility window before removal.

## Files Changed

- `src/generation/apiRoute.ts`
- `src/generation/artifactApiRoute.ts`
- `tests/generationRuntimeRetainedContract.test.ts`
- `tests/artifactRetainedContract.test.ts`
- `tests/coreRouteRetainedContractRewrite.test.ts`
- `docs/CORE_ROUTE_DEPRECATION_WINDOW.md`
- `tests/coreRouteDeprecationWindow.test.ts`
- README and phase ledger pointers

## Behavior Changed

- Source is marked deprecated for compatibility-window purposes.
- Runtime behavior is unchanged.
- Window C removed public route exports.
- Public route exports are no longer available from `src/index.ts`.

## Tests Run

- `npm run check`

## Risks Left

- Deprecated route source cleanup remains.
- Backend HTTP server wiring remains separate.

## Intentionally Not Changed

- Deprecated route source files are not deleted.
- No route helper runtime behavior changed.
- No backend or editor code changed.
- No gateway layer introduced.
