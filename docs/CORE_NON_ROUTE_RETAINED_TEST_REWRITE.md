# Core Non-Route Retained-Test Rewrite

Date: 2026-07-03

Status: Window NR-B retained-test rewrite, public-entrypoint test cleanup,
package-lane cleanup, and Window NR-C public export narrowing for the
remaining non-route service-shaped helper exports.

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

## Package-Lane Cleanup

The old concrete package lanes now own their internal-alpha compatibility
record evidence instead of importing the deprecated core helper/type names
through `@flowdoc/vnext-core`:

- `packages/internal-alpha-runner/src/internalAlphaRecords.ts` creates the
  internal-alpha session and rich-inline record envelopes from retained
  `createVNextSessionPackageSnapshot(...)`,
  `createVNextDurableHistorySnapshot(...)`, and
  `createVNextRichInlineReplayValidation(...)` facts;
- `packages/internal-alpha-runner/src/internalAlphaVerticalSlice.ts` and
  `packages/internal-alpha-runner/src/storageBackedRcRoundtrip.ts` use those
  package-local factories for concrete smoke evidence;
- `packages/internal-alpha-runner/src/storageRouteBinding.ts` uses the
  package-local session record type for route-shaped session responses;
- `packages/storage-file-json/src/index.ts` treats package-session and
  rich-inline-session collections as `unknown` JSON envelope payloads instead
  of importing compatibility record shapes from public core.

This cleanup preserves the historical record JSON shape for internal-alpha
evidence while removing package consumers of the deprecated public helper/type
names before Window NR-C.

## Window NR-C Public Export Narrowing

Public entrypoint exports are now narrowed to retained facts. `src/index.ts`
no longer star-exports:

- `./authoring/sessionStorage.js`;
- `./authoring/richInlineSessionPersistence.js`;
- `./workflow/submissionState.js`.

Instead, the public entrypoint exports the retained non-route facts:

- `createVNextSessionPackageSnapshot(...)` and its package snapshot
  constants/types;
- `createVNextRichInlineReplayValidation(...)`,
  `createVNextRichInlineReplayPatchValidation(...)`,
  `createVNextRichInlineReplayPatchRecord(...)`, and their replay validation
  constants/types;
- `createVNextSubmissionIdentityStatus(...)` and its identity/status
  constants/types.

The public entrypoint no longer exports these service-shaped compatibility
helpers/types/constants:

- `createVNextSessionStorageRecord(...)`,
  `VNextSessionStorageRecord`, `VNEXT_SESSION_STORAGE_SOURCE`, and
  `VNEXT_SESSION_STORAGE_MODE`;
- `createVNextRichInlineSessionPersistenceRecord(...)`,
  `VNextRichInlineSessionPersistenceRecord`,
  `VNEXT_RICH_INLINE_SESSION_PERSISTENCE_SOURCE`, and
  `VNEXT_RICH_INLINE_SESSION_PERSISTENCE_MODE`;
- `createVNextSubmissionStateRecord(...)`, `VNextSubmissionStateRecord`,
  `VNEXT_SUBMISSION_STATE_SOURCE`, and `VNEXT_SUBMISSION_STATE_MODE`.

`src/persistence/storageAdapter.ts` now treats package-session and
rich-inline-session collection payloads as `unknown`, while keeping durable
history, artifact manifest, and artifact job payloads typed. This keeps the
storage envelope/evaluator contract public without making old session storage
or rich-inline persistence record shapes public core API.

Compatibility source implementations remain in owner modules for composition
and historical tests. They are no longer public package entrypoint exports.

## PASS

- The three historical boundary tests now assert retained core helper facts.
- The rewritten tests avoid named imports of the three deprecated
  service-shaped helper functions.
- Remaining compatibility/storage/vertical-slice tests no longer import the
  deprecated helper names from `../src/index.js`.
- Old concrete package lanes no longer import deprecated helper/type names
  through `@flowdoc/vnext-core`.
- Public entrypoint exports are narrowed to retained non-route facts.
- The core storage adapter public interface no longer exposes package-session
  or rich-inline-session compatibility record shapes.
- Backend-owned replacements and retained core owners remain documented.
- Owner-module compatibility source implementations remain stable for
  historical composition evidence.

## FAIL / BLOCKER

- None for Window NR-B retained-test rewrite, public-entrypoint test cleanup,
  and package-lane cleanup.

## RISK

- Some storage and vertical-slice historical tests still use compatibility
  record shapes through owner-module imports.
- Source modules still contain compatibility helper implementations for
  owner-module composition evidence.
- Internal-alpha package lanes preserve historical compatibility record JSON
  shape, but own it locally as evidence rather than core public API.

## UNKNOWN

- Whether compatibility source implementations stay internal or are removed in
  a later source cleanup after replacement evidence remains complete.

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
- `packages/internal-alpha-runner/src/internalAlphaRecords.ts`
- `packages/internal-alpha-runner/src/internalAlphaVerticalSlice.ts`
- `packages/internal-alpha-runner/src/storageBackedRcRoundtrip.ts`
- `packages/internal-alpha-runner/src/storageRouteBinding.ts`
- `packages/internal-alpha-runner/src/index.ts`
- `packages/storage-file-json/src/index.ts`
- `tests/backendRouteStorageBinding.test.ts`
- `tests/internalAlphaVerticalSlice.test.ts`
- `tests/storageAdapter.test.ts`
- `tests/storageFileJsonAdapter.test.ts`
- `tests/coreNonRouteRetainedTestRewrite.test.ts`
- `src/index.ts`
- `src/persistence/storageAdapter.ts`

## Behavior Changed

- Test behavior changed: the historical boundary tests now prove retained
  facts instead of compatibility envelope ownership.
- Test imports changed: compatibility record evidence now avoids deprecated
  helper names from the public core entrypoint.
- Package-lane implementation changed: internal-alpha smoke evidence uses
  package-local record factories backed by retained core facts.
- Storage adapter typing changed: package-session and rich-inline-session
  file-backed collections are generic JSON envelope payloads.
- Public entrypoint behavior changed: deprecated non-route service-shaped
  compatibility helpers/types/constants are no longer exported from
  `src/index.ts`.
- Core storage adapter interface behavior changed: package-session and
  rich-inline-session collection payloads are generic `unknown` values.
- Runtime behavior is unchanged.

## Tests Run

- `npm run check`
- `npm test` in `packages/internal-alpha-runner`
- `npm test` in `packages/storage-file-json`

## Risks Left

- Compatibility source cleanup/removal is now tracked by
  `docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md`.
- Production rich-inline replay execution and submission workflow storage remain
  backend work outside this core patch.

## Intentionally Not Changed

- No compatibility helper runtime behavior changed.
- No backend or editor code changed.
- No gateway layer introduced.
