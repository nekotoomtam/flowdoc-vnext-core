# Core Route Deprecation Window

Date: 2026-07-03

Status: Window B compatibility marker for route-shaped core exports. Phase 230
has now replaced route-helper tests with retained-contract tests.

## Purpose

This phase executes Window B from `docs/CORE_ROUTE_DEEXPORT_PLAN.md`. Core route
helpers remain exported for one compatibility window, and their source remains
explicitly marked as deprecated compatibility coverage. Backend route parity is
the owner of HTTP-shaped route envelopes. The follow-up retained-contract test
rewrite has replaced the old route-helper ownership assertions.

## Deprecated Compatibility Exports

The following public core exports remain available but are deprecated:

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

Those retained-contract tests have replaced route-helper ownership assertions
while keeping public route exports available until Window C.

## Removal Preconditions

Before Window C removal:

1. backend route parity remains green;
2. retained-contract tests replace route-helper ownership assertions; done in
   Phase 230;
3. route-helper test files no longer import route helpers from `src/index.ts`;
   done in Phase 230;
4. `src/index.ts` removes `./generation/apiRoute.js` and
   `./generation/artifactApiRoute.js`;
5. `docs/CORE_SERVICE_CONSUMER_MAP.md`,
   `docs/CORE_ROUTE_DEEXPORT_PLAN.md`, README, and
   `docs/PHASE_LEDGER.md` are updated in the same removal patch.

## PASS

- Route-shaped helpers now have explicit source-level `@deprecated` markers.
- Retained-contract tests have replaced route-helper ownership assertions.
- Public exports remain stable for one window.

## FAIL / BLOCKER

- Window C removal has not run yet.

## RISK

- The deprecated route helpers still duplicate backend route vocabulary while
  the compatibility window remains open.
- Unknown external consumers may still rely on the public route exports.

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

- Source and tests are marked deprecated for compatibility-window purposes.
- Runtime behavior is unchanged.
- Public route exports remain available.

## Tests Run

- `npm run check`

## Risks Left

- Window C export removal remains.
- Backend HTTP server wiring remains separate.

## Intentionally Not Changed

- No public export removed.
- No route helper runtime behavior changed.
- No backend or editor code changed.
- No gateway layer introduced.
