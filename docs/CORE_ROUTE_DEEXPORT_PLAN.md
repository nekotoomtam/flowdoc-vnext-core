# Core Route De-export Plan

Date: 2026-07-03

Status: Window C public route export removal complete after backend route
parity evidence, Window B deprecation markers, and retained-contract test
rewrite.

## Purpose

`src/generation/apiRoute.ts` and `src/generation/artifactApiRoute.ts` are
route-shaped helpers inside `@flowdoc/vnext-core`. Backend parity now exists in
`flowdoc-vnext-backend`, so the remaining core work is to remove route ownership
without breaking public package consumers or losing retained contract coverage.

This plan chooses a conservative path:

1. deprecate route-shaped exports for one compatibility window;
2. rewrite core route tests into retained-contract tests;
3. remove route-shaped exports only after the compatibility window is closed.

Window C export removal is complete.
`src/index.ts` no longer exports the route-shaped modules.

## Source Evidence

- Core no longer exports `./generation/apiRoute.js` or
  `./generation/artifactApiRoute.js` from `src/index.ts`.
- Core historical route-helper tests have been removed/replaced by
  retained-contract tests:
  `tests/generationRuntimeRetainedContract.test.ts` and
  `tests/artifactRetainedContract.test.ts`.
- Backend route parity exists in `flowdoc-vnext-backend` commit `2ae6570`:
  `src/routes/generationRoute.ts` and `src/routes/artifactRoute.ts`.
- Backend route parity calls retained core contracts:
  `assessVNextGenerationReadiness(...)` and
  `createVNextArtifactManifestPlan(...)`.
- Backend route parity does not import core route helpers such as
  `createVNextGenerationApiRouteResponse(...)` or
  `createVNextArtifactGenerationApiRouteResponse(...)`.

## Ownership Decision

| Area | Backend Owns | Core Retains | Decision |
|---|---|---|---|
| Generation route response | HTTP-shaped response source/mode/action, method normalization, status code, headers, request transport vocabulary | `src/generation/runtime.ts` readiness parse/assessment, issues, diagnostics, artifact/generated-document null contract | deprecate then de-export from public core |
| Artifact route response | artifact route actions, permission context envelope, retry metadata, route status, download metadata response shape | `src/generation/artifactManifest.ts`, `src/generation/artifactJob.ts`, render-readiness fixtures and status vocabulary | deprecate then de-export from public core |
| Route tests | backend route parity tests | retained-contract tests for readiness and manifest/job behavior | rewrite before removal |

## Selected Compatibility Window

Use one compatibility window:

- **Window A / complete**: publish this plan and keep current exports.
- **Window B / complete**: add explicit deprecation markers to the route
  modules and tests while keeping exports in `src/index.ts`.
- **Window C / complete**: route-shaped exports were removed from
  `src/index.ts` after retained-contract tests replaced route-helper
  assertions.

Do not skip Window B unless a consumer scan proves there are no package users
outside this workspace and the maintainer accepts a direct breaking cleanup.

## Retained Contract Test Rewrite

The retained-contract test rewrite is complete. Route-helper coverage has been
replaced with tests against retained core contracts:

- generation readiness:
  `assessVNextGenerationReadiness(...)`;
- generation request parse, invalid request, and key/data diagnostics:
  `safeParseVNextGenerationRequest(...)` and readiness result issues;
- artifact manifest planning:
  `createVNextArtifactManifestPlan(...)`;
- artifact job state:
  `createVNextArtifactJobPlan(...)` and `advanceVNextArtifactJob(...)`;
- storage-independent route exclusions:
  source scans that prove retained core contracts do not import server,
  storage, renderer execution, or backend package code.

Keep exact HTTP status/header behavior in backend tests only.

Current retained-contract test files:

- `tests/generationRuntimeRetainedContract.test.ts`;
- `tests/artifactRetainedContract.test.ts`;
- `tests/coreRouteRetainedContractRewrite.test.ts`.

## De-export Preconditions

All must be true before `src/index.ts` stops exporting route-shaped modules:

1. Backend route parity remains green and exported from backend.
2. Core route helpers have been marked deprecated for one compatibility window,
   or direct removal has been explicitly approved.
3. Core retained-contract tests cover generation readiness and artifact
   manifest/job behavior without importing route helpers. Done in Phase 230.
4. `tests/generationApiRoute.test.ts` and `tests/artifactApiRoute.test.ts` are
   removed, renamed, or rewritten so they no longer assert HTTP-shaped route
   ownership in core. Done in Phase 230.
5. `src/index.ts` no longer exports `./generation/apiRoute.js` or
   `./generation/artifactApiRoute.js`. Done in Phase 231.
6. `docs/CORE_SERVICE_CONSUMER_MAP.md`, README, and
   `docs/PHASE_LEDGER.md` are updated in the same removal patch. Done in
   Phase 231.

## Guardrails

- Do not add a compatibility adapter that accepts old document/package shapes.
- Do not move backend route status/header/permission behavior into retained
  core contracts.
- Do not import `flowdoc-vnext-backend` from core tests or source.
- Do not wire route helpers into core storage, renderer execution, server
  routes, fetch calls, or filesystem behavior.
- Do not remove `src/generation/runtime.ts`, `src/generation/artifactManifest.ts`,
  `src/generation/artifactJob.ts`, or `src/persistence/storageAdapter.ts` as
  part of route de-export.

## PASS

- Backend route parity exists, so route-shaped core helpers can enter a
  controlled deprecation/de-export lane.
- The retained core owners are explicit.
- The selected path avoids a surprise public break by using one compatibility
  window.

## FAIL / BLOCKER

- None for public route de-export.

## RISK

- Deprecated route helper source files still exist and duplicate backend route
  vocabulary internally until source cleanup.
- External consumers that still imported route helpers from the public
  entrypoint must move to backend route parity or retained contracts.

## UNKNOWN

- Whether there are external `@flowdoc/vnext-core` consumers outside the three
  current repos.
- Whether maintainers want direct removal instead of one-window deprecation.

## Files Changed

- `docs/CORE_ROUTE_DEEXPORT_PLAN.md`
- `tests/coreRouteDeexportPlan.test.ts`
- README and phase ledger pointers

## Behavior Changed

- Public route exports removed.
- Route helpers are marked deprecated in source for Window B.
- Runtime source behavior is unchanged.
- No backend or editor code changed.

## Tests Run

- `npm run check`

## Risks Left

- Deprecated route source cleanup remains.
- Session/rich-inline/workflow split-before-move remains separate.

## Intentionally Not Changed

- `src/generation/apiRoute.ts` and `src/generation/artifactApiRoute.ts` still
  exist as deprecated historical/internal code.
- Core route-helper tests have been replaced by retained-contract tests.
- Backend HTTP server wiring is not changed.
