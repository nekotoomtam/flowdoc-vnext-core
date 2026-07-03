# Core Non-Route Retained-Test Rewrite

Date: 2026-07-03

Status: Window NR-B retained-test rewrite and public-entrypoint test cleanup
for the remaining non-route service-shaped helper exports. Public entrypoint
compatibility remains.

## Purpose

This window rewrites the first historical core boundary tests away from
backend/storage/workflow-shaped compatibility helper ownership and toward
retained core facts.

Backend consumer rewiring is already proven on `flowdoc-vnext-backend`
`main@9d0a850`, and Window NR-A already marks the service-shaped helper names
as deprecated compatibility exports. Window NR-B starts the test cleanup that
must happen before Window NR-C can narrow public exports.

## Rewritten Historical Tests

These historical tests now prove retained core facts directly:

- `tests/sessionStorage.test.ts` uses
  `createVNextSessionPackageSnapshot(...)` to prove canonical package snapshot
  facts, persisted-state exclusions, and no storage/route/backend ownership.
- `tests/richInlineSessionPersistence.test.ts` uses
  `createVNextRichInlineReplayValidation(...)` to prove rich-inline replay
  validation facts, history-ready counts, invalid replay-patch reporting, and
  no storage/replay/backend ownership.
- `tests/submissionState.test.ts` uses
  `createVNextSubmissionIdentityStatus(...)` to prove submission
  identity/status facts, validation blockers, and no workflow/route/storage
  ownership.

The rewritten tests no longer import
`createVNextSessionStorageRecord(...)`,
`createVNextRichInlineSessionPersistenceRecord(...)`, or
`createVNextSubmissionStateRecord(...)` from the public core entrypoint.

## Public-Entrypoint Test Cleanup

The following tests still contain compatibility composition, storage, or
vertical-slice evidence, but they no longer import the deprecated helper names
from `../src/index.js`. When they still need compatibility records, they import
from the owner module directly:

- `tests/sessionPackageSnapshot.test.ts`;
- `tests/richInlineReplayValidation.test.ts`;
- `tests/submissionIdentityStatus.test.ts`;
- `tests/backendRouteStorageBinding.test.ts`;
- `tests/richInlineLiveExactParityAudit.test.ts`;
- `tests/storageAdapter.test.ts`;
- `tests/verticalSliceStorageSimulation.test.ts`;
- `tests/verticalSliceRcEndToEnd.test.ts`.

Those tests are allowed to mention compatibility helper names while they are
still proving composition or historical integration behavior. They must not be
treated as proof that core owns durable session storage, rich-inline
persistence storage, or submission workflow routes, and they must not require
the deprecated helper names from the public entrypoint before Window NR-C.

## Still Compatibility Evidence

Compatibility record shapes still exist in source modules and selected tests
for composition evidence:

- `createVNextSessionStorageRecord(...)` remains in
  `src/authoring/sessionStorage.ts`;
- `createVNextRichInlineSessionPersistenceRecord(...)` remains in
  `src/authoring/richInlineSessionPersistence.ts`;
- `createVNextSubmissionStateRecord(...)` remains in
  `src/workflow/submissionState.ts`.

Old concrete package lanes under `packages/internal-alpha-runner` still consume
compatibility records through `@flowdoc/vnext-core`. That package-lane cleanup
is separate from this core test cleanup and should be settled before or during
Window NR-C if those package lanes are not retired first.

## Public Export Decision

Window NR-B does not remove public exports. `src/index.ts` still exports:

- `./authoring/sessionStorage.js`;
- `./authoring/richInlineSessionPersistence.js`;
- `./workflow/submissionState.js`.

Window NR-C can now narrow the core test-facing public surface, but it still
needs to decide whether compatibility source implementations stay internal,
move to backend/package lanes, or are removed with replacement evidence.

## PASS

- The three historical boundary tests now assert retained core helper facts.
- The rewritten tests avoid named imports of the three deprecated
  service-shaped helper functions.
- Remaining compatibility/storage/vertical-slice tests no longer import the
  deprecated helper names from `../src/index.js`.
- Backend-owned replacements and retained core owners remain documented.
- Public entrypoint compatibility remains stable during Window NR-B.

## FAIL / BLOCKER

- None for Window NR-B retained-test rewrite and public-entrypoint test
  cleanup.

## RISK

- Compatibility helper names remain public until Window NR-C.
- Some storage and vertical-slice historical tests still use compatibility
  record shapes through owner-module imports.
- Source modules still contain compatibility helper implementations for public
  compatibility and composition evidence.
- Old concrete package lanes still import compatibility helper names through
  `@flowdoc/vnext-core`.

## UNKNOWN

- Final timing for public de-export and optional deprecated route source
  cleanup.
- Whether old concrete package lanes are retired or rewired before Window NR-C.

## Files Changed

- `tests/sessionStorage.test.ts`
- `tests/richInlineSessionPersistence.test.ts`
- `tests/submissionState.test.ts`
- compatibility/storage/vertical-slice tests that still need owner-module
  compatibility record imports
- `docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md`
- `docs/CORE_NON_ROUTE_DEPRECATION_WINDOW.md`
- `docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md`
- `docs/CORE_SERVICE_CONSUMER_MAP.md`
- `docs/CORE_RETENTION_MAP.md`
- `docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md`
- README and phase ledger pointers
- guard tests for Window NR-B

## Behavior Changed

- Test behavior changed: the historical boundary tests now prove retained
  facts instead of compatibility envelope ownership.
- Test imports changed: compatibility record evidence now avoids deprecated
  helper names from the public core entrypoint.
- Runtime behavior is unchanged.
- Public entrypoint exports are unchanged.

## Tests Run

- `npm run check`

## Risks Left

- Window NR-C public export narrowing remains.
- Old concrete package-lane imports remain for a later package cleanup or
  retirement decision.
- Production rich-inline replay execution and submission workflow storage remain
  backend work outside this core patch.

## Intentionally Not Changed

- No public export removed from `src/index.ts`.
- No compatibility helper runtime behavior changed.
- No backend or editor code changed.
- No gateway layer introduced.
