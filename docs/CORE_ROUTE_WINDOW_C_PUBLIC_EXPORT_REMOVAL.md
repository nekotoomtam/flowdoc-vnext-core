# Core Route Window C Public Export Removal

Date: 2026-07-03

Status: Window C export removal is complete.

## Purpose

This phase executes Window C from `docs/CORE_ROUTE_DEEXPORT_PLAN.md`. The
route-shaped generation and artifact helpers are no longer public exports from
the core package entrypoint. Backend route parity owns HTTP-shaped route
envelopes, while retained core contracts remain exported.

## Public Export Removal

Removed from `src/index.ts`:

- `./generation/apiRoute.js`;
- `./generation/artifactApiRoute.js`.

Still exported from `src/index.ts`:

- `./generation/runtime.js`;
- `./generation/artifactManifest.js`;
- `./generation/artifactJob.js`.

## Source Files

The source files still exist:

- `src/generation/apiRoute.ts`;
- `src/generation/artifactApiRoute.ts`.

They remain deprecated historical/internal code in this patch and are not
exported from `src/index.ts`. Deleting or moving those source files can happen
as a separate cleanup after downstream consumers and historical docs no longer
need source-level evidence.

## PASS

- Backend route parity already exists in `flowdoc-vnext-backend`.
- Retained-contract tests cover readiness, manifest, and artifact job behavior.
- Public route-shaped exports are removed from core.
- Retained core generation runtime, artifact manifest, and artifact job exports
  remain stable.

## FAIL / BLOCKER

- None for public route de-export.

## RISK

- External consumers that still import route helpers from `@flowdoc/vnext-core`
  will need to move to backend route parity or retained core contracts.
- Deprecated source files still contain route vocabulary until source cleanup.

## UNKNOWN

- Whether consumers outside the current three repos imported the deprecated
  route-shaped exports before Window C.

## Files Changed

- `src/index.ts`
- `tests/coreRouteWindowCPublicExportRemoval.test.ts`
- `tests/coreRouteDeexportPlan.test.ts`
- `tests/coreRouteDeprecationWindow.test.ts`
- `tests/coreRouteRetainedContractRewrite.test.ts`
- `tests/coreRetentionMap.test.ts`
- `tests/coreServiceConsumerMap.test.ts`
- `docs/CORE_ROUTE_WINDOW_C_PUBLIC_EXPORT_REMOVAL.md`
- `docs/CORE_ROUTE_DEEXPORT_PLAN.md`
- `docs/CORE_ROUTE_DEPRECATION_WINDOW.md`
- `docs/CORE_ROUTE_RETAINED_CONTRACT_TEST_REWRITE.md`
- `docs/CORE_SERVICE_CONSUMER_MAP.md`
- `docs/CORE_RETENTION_MAP.md`
- README and phase ledger pointers

## Behavior Changed

- Public package entrypoint no longer re-exports route-shaped modules.
- Runtime route helper source behavior is unchanged.
- Retained core readiness, manifest, and job exports remain public.
- No backend or editor code changed.

## Tests Run

- `npm run check`

## Risks Left

- Deprecated route source files remain until a later cleanup.
- Backend HTTP server wiring remains separate.
- Session/rich-inline/workflow split-before-move remains open.

## Intentionally Not Changed

- `src/generation/apiRoute.ts` and `src/generation/artifactApiRoute.ts` are not
  deleted in this patch.
- No backend route implementation changed.
- No editor consumer changed.
- No gateway layer introduced.
