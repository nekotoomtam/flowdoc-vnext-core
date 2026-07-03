# Core Non-Route Retained-Test Rewrite

Date: 2026-07-03

Status: Window NR-B first retained-test rewrite slice for the remaining
non-route service-shaped helper exports. Public entrypoint compatibility
remains.

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

## Still Compatibility Evidence

This first NR-B slice intentionally does not rewrite every compatibility test.
The following tests still contain compatibility composition, storage, or
vertical-slice evidence and must be handled before or during Window NR-C:

- `tests/sessionPackageSnapshot.test.ts`;
- `tests/richInlineReplayValidation.test.ts`;
- `tests/submissionIdentityStatus.test.ts`;
- `tests/backendRouteStorageBinding.test.ts`;
- `tests/richInlineLiveExactParityAudit.test.ts`;
- `tests/storageAdapter.test.ts`;
- `tests/verticalSliceStorageSimulation.test.ts`;
- `tests/verticalSliceRcEndToEnd.test.ts`.

Those remaining tests are allowed to mention compatibility helper names while
they are still proving composition or historical integration behavior. They
must not be treated as proof that core owns durable session storage,
rich-inline persistence storage, or submission workflow routes.

## Public Export Decision

Window NR-B does not remove public exports. `src/index.ts` still exports:

- `./authoring/sessionStorage.js`;
- `./authoring/richInlineSessionPersistence.js`;
- `./workflow/submissionState.js`.

Window NR-C should narrow the public surface only after the remaining
compatibility tests either move to retained facts or are replaced by backend
tests.

## PASS

- The three historical boundary tests now assert retained core helper facts.
- The rewritten tests avoid named imports of the three deprecated
  service-shaped helper functions.
- Backend-owned replacements and retained core owners remain documented.
- Public entrypoint compatibility remains stable during this first NR-B slice.

## FAIL / BLOCKER

- None for this first NR-B retained-test rewrite slice.

## RISK

- Compatibility helper names remain public until Window NR-C.
- Some storage and vertical-slice historical tests still use compatibility
  record shapes.
- Source modules still contain compatibility helper implementations for public
  compatibility and composition evidence.

## UNKNOWN

- Whether the remaining compatibility tests are all rewritten in a second NR-B
  slice or together with Window NR-C.
- Final timing for public de-export and optional deprecated route source
  cleanup.

## Files Changed

- `tests/sessionStorage.test.ts`
- `tests/richInlineSessionPersistence.test.ts`
- `tests/submissionState.test.ts`
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
- Runtime behavior is unchanged.
- Public entrypoint exports are unchanged.

## Tests Run

- `npm run check`

## Risks Left

- Window NR-B remaining compatibility-test cleanup remains.
- Window NR-C public export narrowing remains.
- Production rich-inline replay execution and submission workflow storage remain
  backend work outside this core patch.

## Intentionally Not Changed

- No public export removed from `src/index.ts`.
- No compatibility helper runtime behavior changed.
- No backend or editor code changed.
- No gateway layer introduced.
