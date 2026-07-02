# Core Route Retained-Contract Test Rewrite

Date: 2026-07-03

Status: retained-contract test rewrite complete. Phase 231 has now removed
public route exports from `src/index.ts`.

## Purpose

This phase closed the test-rewrite blocker from
`docs/CORE_ROUTE_DEEXPORT_PLAN.md`. Core route-shaped helpers remain deprecated
in their source files, but the required core tests no longer assert HTTP-shaped
route ownership. Backend route parity remains the owner of route status,
headers, method handling, permission envelopes, retry metadata, and download
metadata.

No public export was removed in the Phase 230 test-rewrite patch. Window C
export removal is now complete in Phase 231.

## Rewritten Test Ownership

Removed route-helper ownership tests:

- `tests/generationApiRoute.test.ts`;
- `tests/artifactApiRoute.test.ts`.

Added retained-contract tests:

- `tests/generationRuntimeRetainedContract.test.ts`;
- `tests/artifactRetainedContract.test.ts`;
- `tests/coreRouteRetainedContractRewrite.test.ts`.

The new tests import retained core contracts from the public entrypoint without
importing route helpers.

## Retained Contracts Covered

Generation runtime:

- `safeParseVNextGenerationRequest(...)`;
- `assessVNextGenerationReadiness(...)`;
- request parse errors;
- valid-request key/data blockers;
- readiness-only exact-layout and artifact placeholders;
- route/execution independence scans for `src/generation/runtime.ts`.

Artifact manifest/job:

- `createVNextArtifactManifestPlan(...)`;
- manifest lifecycle validation;
- `createVNextArtifactJobPlan(...)`;
- `advanceVNextArtifactJob(...)`;
- queued, layout, rendering, rendered, and blocked transition states;
- durable-record-only, no-worker, no-renderer, no-storage-write contracts.

## Remaining Route Compatibility

The deprecated route-shaped modules still exist:

- `src/generation/apiRoute.ts`;
- `src/generation/artifactApiRoute.ts`.

`src/index.ts` no longer exports:

- `./generation/apiRoute.js`;
- `./generation/artifactApiRoute.js`.

That is intentional after Window C. Phase 230 prepared the removal by moving
test ownership to retained contracts; Phase 231 removed the public exports.

## PASS

- Core retained-contract tests now cover generation readiness and artifact
  manifest/job behavior directly.
- Core route-helper test files no longer exist.
- Retained-contract tests do not import route helpers from `src/index.ts`.
- Window C export removal is now complete.

## FAIL / BLOCKER

- None for the retained-contract test rewrite.

## RISK

- Deprecated route helper source files still duplicate backend route vocabulary
  until source cleanup.
- Historical docs for Phase 86 and Phase 138 still describe the original route
  boundary implementation and should be read as history.

## UNKNOWN

- Whether external `@flowdoc/vnext-core` package consumers still import the
  deprecated route-shaped helpers.

## Files Changed

- `tests/generationRuntimeRetainedContract.test.ts`
- `tests/artifactRetainedContract.test.ts`
- `tests/coreRouteRetainedContractRewrite.test.ts`
- `tests/coreRouteDeexportPlan.test.ts`
- `tests/coreRouteDeprecationWindow.test.ts`
- `tests/coreServiceConsumerMap.test.ts`
- `docs/CORE_ROUTE_RETAINED_CONTRACT_TEST_REWRITE.md`
- `docs/CORE_ROUTE_DEEXPORT_PLAN.md`
- `docs/CORE_ROUTE_DEPRECATION_WINDOW.md`
- `docs/CORE_SERVICE_CONSUMER_MAP.md`
- README and phase ledger pointers

## Behavior Changed

- Test ownership changed from route-helper assertions to retained core
  contract assertions.
- Runtime source behavior is unchanged.
- No public export was removed in the Phase 230 test-rewrite patch; Phase 231
  later removed route-shaped public exports.
- No backend or editor code changed.

## Tests Run

- `npm run check`

## Risks Left

- Deprecated route source cleanup remains.
- Backend HTTP server wiring remains separate.
- Session/rich-inline/workflow split-before-move remains open.

## Intentionally Not Changed

- `src/generation/apiRoute.ts` and `src/generation/artifactApiRoute.ts` still
  exist with Window B deprecation markers.
- No route helper runtime behavior changed.
- No backend route or editor consumer changed.
- No gateway layer introduced.
