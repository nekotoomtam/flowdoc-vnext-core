# Core Compatibility Source Cleanup Audit

Date: 2026-07-03

Status: Phase 243 vertical-slice storage payload rewrite after Window NR-C
public export narrowing.

## Purpose

Window NR-C removed the remaining non-route service-shaped helpers from the
public package entrypoint. This audit prevents the owner-module compatibility
source from becoming forgotten debt.

The compatibility helpers remain source-local only while historical
composition tests still need them. They are removal candidates, not retained core API.

## Cleanup Rule

- Do not add new public exports for the compatibility helpers.
- Do not add new `@flowdoc/vnext-core` consumers of the compatibility helpers.
- Do not add new owner-module imports of the compatibility helpers without
  updating this audit and explaining the replacement blocker.
- Prefer rewriting tests to retained facts, backend-owned records, or
  package-local internal-alpha records before deleting source.
- Treat this audit as short-lived cleanup debt; it should shrink, not grow.

## Remaining Compatibility Helpers

| Helper | Source Owner | Remaining Use | Replacement Target |
|---|---|---|---|
| `createVNextSessionStorageRecord(...)` | `src/authoring/sessionStorage.ts` | historical session package/storage composition and `tests/storageAdapter.test.ts` mocks | retained `createVNextSessionPackageSnapshot(...)`; backend `flowdoc-vnext-backend/src/storage/sessionRecord.ts`; internal-alpha `createFlowDocInternalAlphaSessionStorageRecord(...)` |
| `createVNextRichInlineSessionPersistenceRecord(...)` | `src/authoring/richInlineSessionPersistence.ts` | historical rich-inline session persistence composition, parity, and `tests/storageAdapter.test.ts` mocks | retained `createVNextRichInlineReplayValidation(...)`; backend `flowdoc-vnext-backend/src/storage/richInlineSessionRecord.ts`; internal-alpha `createFlowDocInternalAlphaRichInlineSessionRecord(...)` |
| `createVNextSubmissionStateRecord(...)` | `src/workflow/submissionState.ts` | historical submission workflow-shaped composition test | retained `createVNextSubmissionIdentityStatus(...)`; backend `flowdoc-vnext-backend/src/routes/submissionRoute.ts` |

Compatibility record types and constants are removal candidates with the helper
source. Do not add imports of `VNextRichInlineSessionPersistenceRecord`,
`VNextSubmissionStateRecord`, `VNEXT_SESSION_STORAGE_SOURCE`,
`VNEXT_SESSION_STORAGE_MODE`, `VNEXT_RICH_INLINE_SESSION_PERSISTENCE_SOURCE`,
`VNEXT_RICH_INLINE_SESSION_PERSISTENCE_MODE`, `VNEXT_SUBMISSION_STATE_SOURCE`,
or `VNEXT_SUBMISSION_STATE_MODE`. The only remaining type import is
`VNextSessionStorageRecord` inside
`src/authoring/richInlineSessionPersistence.ts`.

## Current Allowlist

The following owner-module imports are allowed only until their tests are
rewritten or retired.

### Session Storage Compatibility

- `src/authoring/richInlineSessionPersistence.ts`: composes the rich-inline
  compatibility record while that source still exists.
- `tests/sessionPackageSnapshot.test.ts`: proves old storage record composition
  beside retained package snapshot facts.
- `tests/storageAdapter.test.ts`: uses test-local storage envelopes with the
  old session shape.

### Rich Inline Session Compatibility

- `tests/richInlineReplayValidation.test.ts`: proves old session persistence
  composition beside retained replay validation facts.
- `tests/richInlineLiveExactParityAudit.test.ts`: compares old session
  persistence evidence against live/exact invalidation facts.
- `tests/storageAdapter.test.ts`: uses test-local storage envelopes with the
  old rich-inline session shape.

### Submission State Compatibility

- `tests/submissionIdentityStatus.test.ts`: proves old workflow-shaped record
  composition beside retained identity/status facts.

## Recommended Removal Order

1. Rewrite `tests/storageAdapter.test.ts` to use generic `unknown` payloads for
   package-session and rich-inline-session envelopes.
2. Rewrite composition tests to assert retained facts and backend/package-owned
   replacements instead of old core record envelopes.
3. Remove the owner-module compatibility helpers, record types, and source/mode
   constants from `src/authoring/sessionStorage.ts`,
   `src/authoring/richInlineSessionPersistence.ts`, and
   `src/workflow/submissionState.ts`.
4. Update historical docs to describe the removed helpers as past compatibility
   evidence rather than current source.

## Cleanup Progress

- Phase 243 rewrote `tests/verticalSliceStorageSimulation.test.ts` and
  `tests/verticalSliceRcEndToEnd.test.ts` so package-session and
  rich-inline-session payloads use retained facts through
  `createVNextSessionPackageSnapshot(...)` and
  `createVNextRichInlineReplayValidation(...)`.

## Exit Criteria

- The allowlist above is empty.
- `rg "createVNext(SessionStorageRecord|RichInlineSessionPersistenceRecord|SubmissionStateRecord)" src tests packages`
  returns no source/test usage.
- `src/index.ts` continues to export retained facts only.
- `src/persistence/storageAdapter.ts` keeps package-session and
  rich-inline-session payloads as `unknown`.
- `npm run check` passes.

## PASS

- The public entrypoint no longer exposes the compatibility helpers.
- Remaining compatibility usage is owner-module only and explicitly
  allowlisted.
- Replacement targets are identified for each helper.
- The guard test prevents new untracked compatibility imports.
- Vertical-slice storage simulation and RC smoke tests no longer import the
  compatibility helpers.

## FAIL / BLOCKER

- None for the cleanup audit.

## RISK

- Some historical tests still exercise old record shapes until rewritten.
- Leaving owner-module source in place can be misread as current core
  ownership if this audit is ignored.

## UNKNOWN

- Exact deletion phase for each helper.
- Whether each remaining composition test should move to backend-owned
  fixtures, package-local internal-alpha records, or retained facts only.

## Files Changed

- `docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md`
- vertical-slice storage simulation tests
- source deprecation comments for the three compatibility helpers
- guard tests for the cleanup allowlist
- README and phase ledger pointers

## Behavior Changed

- Documentation and guard behavior only.
- Vertical-slice storage payload fixtures now use retained core facts instead
  of compatibility helper records.
- Runtime storage adapter behavior is unchanged.
- Public entrypoint behavior is unchanged from Window NR-C.

## Tests Run

- `npm run check`

## Risks Left

- Rewrite or retire each remaining allowlisted usage.
- Remove compatibility source after the allowlist reaches zero.

## Intentionally Not Changed

- No compatibility helper implementation removed in this audit patch.
- No backend or editor code changed.
- No gateway layer introduced.
