# Core Submission Identity Status Split

Date: 2026-07-03

Status: submission identity/status retained-contract split complete.

## Purpose

This phase implements the third split from
`docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md`. The core now has retained
submission identity/status helpers that are separate from the workflow-shaped
submission state record helper.

The compatibility submission state record remains public for now, but it
composes the new retained identity/status facts instead of owning those facts
directly.

## Retained Core Contract

`src/workflow/submissionState.ts` now exports:

- `VNEXT_SUBMISSION_IDENTITY_STATUS_SOURCE`;
- `VNEXT_SUBMISSION_IDENTITY_STATUS_MODE`;
- `createVNextSubmissionIdentityStatus(...)`;
- `VNextSubmissionIdentityStatusRecord`;
- `VNextSubmissionIdentityStatusFacts`.

The retained identity/status contract owns:

- template id, submission id, document revision, data revision, actor id,
  reviewer id, and reason facts;
- external workflow status values for `not-started`, `draft`, `submitted`,
  `approved`, and `rejected`;
- validation facts for missing template id, invalid document/data revisions,
  missing submission id for submitted/reviewed states, and missing reviewer id
  for approved/rejected states;
- explicit contracts showing external submission state only, no package
  mutation, no document mutation, no data mutation, no editor-session state, no
  workflow engine, no permission checks, no approval gates, no storage write,
  no route dispatch, and no notification/audit execution.

## Compatibility Record

`createVNextSubmissionStateRecord(...)` remains exported and still returns the
Phase 91 workflow-shaped record shape. It now composes
`createVNextSubmissionIdentityStatus(...)` for status, identity, revision,
actor/reviewer, reason, and validation issue facts before adding compatibility
scope/application fields:

- `scope.externalSubmissionState: true`;
- `application.status: "not-applied"`;
- `packageMutation`, `documentMutation`, and `dataMutation` as `not-run`;
- `historyWrite` and `storageWrite` as `not-written`;
- `routeDispatch: "not-run"`;
- `packageVersionChange: false`.

Those workflow-shaped fields remain compatibility surface only. Backend
workflow storage, permissions, approval gates, notification/audit writes, and
route dispatch are not moved into the retained core identity/status contract.

## PASS

- Submission identity/status facts now have a retained core helper.
- The retained helper has no workflow application fields.
- The compatibility submission state record composes retained identity/status
  facts.
- Tests prove the retained helper has no storage writes, routes, DOM work,
  layout work, package parse/serialize, package mutation, or workflow
  execution.
- The public submission state export remains stable for current tests and
  consumers.

## FAIL / BLOCKER

- No public de-export has happened yet.
- Backend consumer rewiring is now complete in
  `docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md`; public de-export remains a
  separate compatibility window.

## RISK

- `createVNextSubmissionStateRecord(...)` remains public, so downstream code
  can still read workflow-shaped wording as final core ownership until
  deprecation/de-export.
- Submission identity/status facts may still become product-specific if future
  workflow policy is retained too widely.

## UNKNOWN

- Final production workflow storage/review route shape after the backend
  contract shell.
- Whether backend wants one production workflow route/contract or a combined
  persistence/workflow orchestration layer.
- Whether approval gates should consume only retained identity/status facts or
  require product-specific policy facts outside core.

## Files Changed

- `src/workflow/submissionState.ts`
- `tests/submissionIdentityStatus.test.ts`
- `docs/CORE_SUBMISSION_IDENTITY_STATUS_SPLIT.md`
- `docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md`
- `docs/SUBMISSION_STATE_BOUNDARY.md`
- `docs/CORE_RETENTION_MAP.md`
- `docs/CORE_SERVICE_CONSUMER_MAP.md`
- README and phase ledger pointers

## Behavior Changed

- Added retained submission identity/status contracts.
- Existing submission state record output remains compatible.
- No public export removed.
- No backend or editor code changed.

## Tests Run

- `npm run check`

## Risks Left

- Deprecate/de-export workflow-shaped submission state record after backend
  replacement contracts exist and Window NR-A/NR-B/NR-C run.
- Backend consumer rewiring remains.
- Non-route service-shaped public export deprecation windows remain.

## Intentionally Not Changed

- `createVNextSubmissionStateRecord(...)` is not removed.
- `src/index.ts` still exports `./workflow/submissionState.js`.
- No concrete workflow storage adapter or backend route added.
- No permission check, approval gate, notification/audit write, or workflow
  runtime added.
- No gateway layer introduced.
