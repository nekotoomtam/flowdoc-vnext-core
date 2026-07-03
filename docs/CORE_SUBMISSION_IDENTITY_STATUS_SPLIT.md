# Core Submission Identity Status Split

Date: 2026-07-03

Status: submission identity/status retained-contract split complete.

## Purpose

This phase implements the third split from
`docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md`. The core now has retained
submission identity/status helpers that are separate from the workflow-shaped
submission state record helper.

Historical compatibility submission state record evidence is preserved below.
The compatibility helper itself was removed from source in Phase 246 after
retained identity/status facts and backend route replacements were proven.

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

`createVNextSubmissionStateRecord(...)` used to return the Phase 91
workflow-shaped record shape. Before deletion, it composed
`createVNextSubmissionIdentityStatus(...)` for status, identity, revision,
actor/reviewer, reason, and validation issue facts before adding compatibility
scope/application fields:

- `scope.externalSubmissionState: true`;
- `application.status: "not-applied"`;
- `packageMutation`, `documentMutation`, and `dataMutation` as `not-run`;
- `historyWrite` and `storageWrite` as `not-written`;
- `routeDispatch: "not-run"`;
- `packageVersionChange: false`.

Those workflow-shaped fields were compatibility surface only. Backend
workflow storage, permissions, approval gates, notification/audit writes, and
route dispatch are not moved into the retained core identity/status contract.

## PASS

- Submission identity/status facts now have a retained core helper.
- The retained helper has no workflow application fields.
- The historical submission state record composition is covered as past
  evidence.
- Tests prove the retained helper has no storage writes, routes, DOM work,
  layout work, package parse/serialize, package mutation, or workflow
  execution.
- Retained submission identity/status helpers remain stable for current tests
  and consumers.

## FAIL / BLOCKER

- Backend consumer rewiring is now complete in
  `docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md`; public de-export remains a
  separate compatibility window.

## RISK

- Historical docs still mention the deleted submission state helper name as
  migration evidence.
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
- Compatibility submission state helper output was removed from source in
  Phase 246.
- No retained public API was removed.
- No backend or editor code changed.

## Tests Run

- `npm run check`

## Risks Left

- Keep backend-owned workflow route records outside core.

## Intentionally Not Changed

- `createVNextSubmissionStateRecord(...)` is removed from source in Phase 246.
- `src/index.ts` does not export `./workflow/submissionState.js`.
- No concrete workflow storage adapter or backend route added.
- No permission check, approval gate, notification/audit write, or workflow
  runtime added.
- No gateway layer introduced.
