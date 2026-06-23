# Submission State Boundary

Status: Phase 91 implementation boundary.

Phase 91 adds a pure external submission state record boundary. It lets future
template/reviewer workflows describe submission status and revisions without
writing workflow state into package v2/document v3, data snapshots, editor
sessions, routes, or storage.

This is a submission state boundary. It is not a workflow engine.

## Purpose

The submission workflow path now has a core-owned record shape:

```text
template id + revisions + external workflow facts
  -> createVNextSubmissionStateRecord(...)
  -> external submission state record + validation issues
  -> future app-owned workflow store and route layer
```

The boundary exists so submission/reviewer work can grow outside authored
template truth instead of being hidden in `DocumentNode`, field data snapshots,
or editor session state.

## Module Ownership

`src/workflow/submissionState.ts` owns:

- `VNEXT_SUBMISSION_STATE_SOURCE`;
- `VNEXT_SUBMISSION_STATE_MODE`;
- `createVNextSubmissionStateRecord(...)`;
- workflow status values for `not-started`, `draft`, `submitted`, `approved`,
  and `rejected`;
- validation for missing template id, invalid document/data revisions, missing
  submission id for submitted/reviewed states, and missing reviewer id for
  approved/rejected states;
- scope flags that keep package, document node, data snapshot, and editor
  session state out of the submission record;
- application status that keeps package mutation, document mutation, data
  mutation, history writes, storage writes, and route dispatch out of this
  phase.

The module is pure TypeScript and Node-testable. It does not parse packages,
serialize packages, mutate documents, mutate data snapshots, mutate editor
sessions, write history, write storage, dispatch routes, call DOM APIs, run
layout, or render artifacts.

## Truth Boundary

The record can carry only external workflow metadata:

- `package` scope is `false`;
- `documentNode` scope is `false`;
- `dataSnapshot` scope is `false`;
- `editorSession` scope is `false`;
- externalSubmissionState = `true`;
- package, document, and data mutation remain `not-run`;
- history and storage writes remain `not-written`;
- route dispatch remains `not-run`;
- packageVersionChange remains `false`.

## Acceptance Evidence

Phase 91 is covered by `tests/submissionState.test.ts`:

- submitted records are JSON-serializable external workflow state and do not
  mutate canonical packages;
- incomplete review states are blocked before any workflow write;
- source guards block storage adapters, parent runtime imports, DOM access,
  app routes, package parse/serialize, transactions, operations, layout, and
  pagination;
- README, roadmap, and ledger entries keep the phase trail visible.

## Non-Goals

Phase 91 does not implement workflow storage, submission/reviewer routes,
review permissions, approval gates, notification/audit systems, form-slot
runtime, data snapshot mutation, package/document mutation, package/document
version changes, durable history integration, collaboration, exact layout
execution, renderer adapter output, artifact storage, or package/document
schema changes.
