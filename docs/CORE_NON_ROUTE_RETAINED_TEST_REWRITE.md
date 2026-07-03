# Core Non-Route Retained-Test Rewrite

Date: 2026-07-03

Status: Window NR-B retained-test rewrite, public-entrypoint test cleanup,
package-lane cleanup, and Window NR-C public export narrowing for the
remaining non-route service-shaped helper exports. Phase 246 later completes
owner-module compatibility source deletion in
`docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md`.

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
from `../src/index.js`. During Window NR-B, tests that still needed
compatibility records imported from owner modules directly; Phase 243 through
Phase 246 later moved those tests to retained facts, generic payloads, or
backend/package-owned replacement evidence:

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

## Historical Compatibility Evidence

Compatibility record shapes were kept temporarily in source modules and
selected tests for composition evidence:

- `createVNextSessionStorageRecord(...)` was in
  `src/authoring/sessionStorage.ts`;
- `createVNextRichInlineSessionPersistenceRecord(...)` was in
  `src/authoring/richInlineSessionPersistence.ts`;
- `createVNextSubmissionStateRecord(...)` was in
  `src/workflow/submissionState.ts`.

Phase 246 removes those helper implementations, types, and source/mode
constants. Historical docs and guard tests may still mention the names as
migration evidence, not as current API.

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

Phase 246 removes the owner-module compatibility source after the remaining
tests move to retained facts, generic storage payloads, and backend/package
replacement evidence. The helpers are no longer public package entrypoint
exports and no longer exist as current source helpers.

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
- Owner-module compatibility source deletion is tracked and completed by
  `docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md`.

## FAIL / BLOCKER

- None for Window NR-B retained-test rewrite, public-entrypoint test cleanup,
  and package-lane cleanup.

## RISK

- Historical docs still mention the compatibility helper names as migration
  evidence.
- Source deletion means any future compatibility shape checks must live in
  backend/package-owned evidence, not core helper reintroduction.
- Internal-alpha package lanes preserve historical compatibility record JSON
  shape, but own it locally as evidence rather than core public API.

## UNKNOWN

- Whether older historical docs should be compressed after backend replacement
  names settle.

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
- `docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md`

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
- Phase 246 later removes the owner-module compatibility helper source while
  leaving retained facts public.
- Runtime behavior is unchanged.

## Tests Run

- `npm run check`
- `npm test` in `packages/internal-alpha-runner`
- `npm test` in `packages/storage-file-json`

## Risks Left

- Do not reintroduce the deleted compatibility helper source.
- Production rich-inline replay execution and submission workflow storage remain
  backend work outside this core patch.

## Intentionally Not Changed

- No backend or editor code changed.
- No gateway layer introduced.
