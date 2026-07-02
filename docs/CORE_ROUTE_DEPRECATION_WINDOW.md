# Core Route Deprecation Window

Date: 2026-07-03

Status: Window B compatibility marker for route-shaped core exports.

## Purpose

This phase executes Window B from `docs/CORE_ROUTE_DEEXPORT_PLAN.md`. Core route
helpers remain exported for one compatibility window, but their source and
route-helper tests are now explicitly marked as deprecated compatibility
coverage. Backend route parity is the owner of HTTP-shaped route envelopes.

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

## Test Marker

`tests/generationApiRoute.test.ts` and `tests/artifactApiRoute.test.ts` now
carry a Window B compatibility marker. Their remaining route-helper assertions
are accepted only for the compatibility window. They should be rewritten or
removed before `src/index.ts` stops exporting the route-shaped modules.

## Removal Preconditions

Before Window C removal:

1. backend route parity remains green;
2. retained-contract tests replace route-helper ownership assertions;
3. route-helper test files no longer import route helpers from `src/index.ts`;
4. `src/index.ts` removes `./generation/apiRoute.js` and
   `./generation/artifactApiRoute.js`;
5. `docs/CORE_SERVICE_CONSUMER_MAP.md`,
   `docs/CORE_ROUTE_DEEXPORT_PLAN.md`, README, and
   `docs/PHASE_LEDGER.md` are updated in the same removal patch.

## PASS

- Route-shaped helpers now have explicit source-level `@deprecated` markers.
- Route-helper tests now identify themselves as compatibility-window coverage.
- Public exports remain stable for one window.

## FAIL / BLOCKER

- Window C removal is blocked until retained-contract tests replace the
  route-helper assertions.

## RISK

- The deprecated route helpers still duplicate backend route vocabulary while
  the compatibility window remains open.
- Unknown external consumers may still rely on the public route exports.

## UNKNOWN

- Whether maintainers will require a second compatibility window before removal.

## Files Changed

- `src/generation/apiRoute.ts`
- `src/generation/artifactApiRoute.ts`
- `tests/generationApiRoute.test.ts`
- `tests/artifactApiRoute.test.ts`
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

- Window C retained-contract rewrite and export removal remain.
- Backend HTTP server wiring remains separate.

## Intentionally Not Changed

- No public export removed.
- No route helper runtime behavior changed.
- No backend or editor code changed.
- No gateway layer introduced.
