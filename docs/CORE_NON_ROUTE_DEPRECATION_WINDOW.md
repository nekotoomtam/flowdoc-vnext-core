# Core Non-Route Deprecation Window

Date: 2026-07-03

Status: Window NR-A compatibility marker for the remaining non-route
service-shaped core helper exports. Public entrypoint compatibility remains.

## Purpose

This phase starts the non-route deprecation sequence selected in
`docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md`. Backend consumer rewiring is
already proven on `flowdoc-vnext-backend` `main@9d0a850`, so core can mark the
remaining service-shaped helper names as compatibility exports without changing
runtime behavior or removing public entrypoint paths yet.

Window NR-A does not remove public exports. It makes ownership explicit:
backend owns durable records/routes, while core retains pure package snapshot,
rich-inline replay validation, and submission identity/status facts.

## Deprecated Compatibility Helpers

The following helper names are now source-marked with
`@deprecated Window NR-A compatibility export`:

- `createVNextSessionStorageRecord(...)`;
- `createVNextRichInlineSessionPersistenceRecord(...)`;
- `createVNextSubmissionStateRecord(...)`.

They remain public from `src/index.ts` during Window NR-A.

## Backend Replacements

Backend-owned replacements live in:

- `flowdoc-vnext-backend/src/storage/sessionRecord.ts`;
- `flowdoc-vnext-backend/src/storage/richInlineSessionRecord.ts`;
- `flowdoc-vnext-backend/src/routes/submissionRoute.ts`.

Backend tests assert that those replacement paths do not import the deprecated
helper names.

## Retained Core Owners

Do not deprecate these retained core facts as part of NR-A:

- `createVNextSessionPackageSnapshot(...)`;
- `createVNextRichInlineReplayPatchValidation(...)`;
- `createVNextRichInlineReplayValidation(...)`;
- `createVNextSubmissionIdentityStatus(...)`.

Retained-contract tests should target package snapshot facts, replay validation
facts, and submission identity/status facts, while backend tests target
backend-owned storage and route envelopes.

## Removal Preconditions

Window NR-C removal is still blocked until:

1. Window NR-B rewrites core historical tests so retained-contract tests prove
   core-owned facts instead of compatibility record ownership.
2. Storage and vertical-slice historical tests no longer require public
   service-shaped helper names from `src/index.ts`.
3. `src/index.ts` removes or narrows the service-shaped helper exports in the
   same patch that updates docs and guard tests.
4. Boundary tests prove exported `src/**` did not gain backend runtime,
   filesystem, HTTP route, workflow engine, permission, replay execution, or
   storage-write ownership.

## PASS

- The three remaining non-route service-shaped helper functions have explicit
  source-level `@deprecated` markers.
- Backend replacements and retained core owner helpers are named in the source
  comments and this doc.
- Public entrypoint compatibility remains stable during Window NR-A.

## FAIL / BLOCKER

- None for Window NR-A compatibility markers.

## RISK

- Deprecated helper names are still public and can still look like core-owned
  service behavior until Window NR-C.
- Unknown external consumers may rely on the compatibility helper names.
- Core historical tests still exercise compatibility record shapes until
  Window NR-B.

## UNKNOWN

- Exact timing for Window NR-B and Window NR-C.
- Whether deprecated route source cleanup happens before or after non-route
  public export removal.

## Files Changed

- `src/authoring/sessionStorage.ts`
- `src/authoring/richInlineSessionPersistence.ts`
- `src/workflow/submissionState.ts`
- `docs/CORE_NON_ROUTE_DEPRECATION_WINDOW.md`
- README and phase ledger pointers
- guard tests for Window NR-A

## Behavior Changed

- Source comments now mark service-shaped helper names as deprecated
  compatibility exports.
- Runtime behavior is unchanged.
- Public entrypoint exports are unchanged.

## Tests Run

- `npm run check`

## Risks Left

- Window NR-B retained-contract test rewrite remains.
- Window NR-C public export removal remains.
- Production rich-inline replay execution and submission workflow storage remain
  backend work outside this core patch.

## Intentionally Not Changed

- No public export removed from `src/index.ts`.
- No compatibility helper runtime behavior changed.
- No backend or editor code changed.
- No gateway layer introduced.
