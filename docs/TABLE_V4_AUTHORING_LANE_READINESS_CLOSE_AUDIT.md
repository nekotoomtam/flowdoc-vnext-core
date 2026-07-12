# Table V4 Authoring Lane Readiness Close Audit

Status: Phase 333 close audit.

## Outcome

The conservative Table v4 authoring lane is ready for Structure Definition
Drafts. Core can audit one exact draft-owned canonical document/Table
Definition bundle and commit span-one row, column, and cell-layout commands
atomically with deterministic history, selection, scope, invalidation,
fingerprint, and work facts.

This closes core authoring readiness for the bounded v1 profile. It does not
claim editor UI integration, backend revision persistence, collection-source
lifecycle editing, merged cells, or rowSpan authoring.

## PASS

- Strict requests accept only exact Structure Definition Draft identity,
  canonical document v4, draft-owned Table Definition v1, exact draft policy,
  session actions, and one command.
- Bundle readiness audits canonical structure, one Table owner, physical and
  semantic column parity, one-to-one row-source/template mapping, span-one cell
  mapping, authored row/cell order, and header policy synchronization.
- Dedicated core/structure/session capability facts exist for every active
  Table action; generic block-child permission cannot authorize Table internals.
- Unsupported collection-source lifecycle, merge/split, rowSpan, and
  cross-owner movement are explicit capability blocks.
- Static row insert adds caller-owned row/source/template/cell identities and
  empty authored cells atomically.
- Static row delete removes the complete row/cell/content subtree, blocks the
  last row and collection sources, and recommends the preceding surviving row.
- Row reorder moves semantic source and authored template row together, rejects
  no-op indexes, and blocks invalid header ordering.
- Stable column insert adds one caller-owned cell per row template, scales
  existing shares proportionally, and preserves total point width.
- Stable column delete removes one complete cell subtree per template,
  normalizes remaining shares, blocks the last column, and recommends the
  preceding surviving column when available.
- Stable column resize preserves semantic share total and physical Table width.
- Cell vertical alignment is a layout-only commit that leaves definition,
  measurement, and pagination valid while invalidating renderer offset.
- Column commands report every affected cell and descendant text block so
  incremental measurement cannot miss sibling width changes.
- Every commit returns identity diff, exact scope, single-entry history,
  selection recommendation, invalidation reasons, before/after document,
  definition and bundle fingerprints, and factual work counts.
- History records retain committed/rejected commands and exact draft pins. Pure
  replay skips rejected records and blocks before-state, command-output,
  after-state, or artifact drift.
- A 1,000-row-template column insert is byte-stable with 1,000 template visits,
  3,000 affected cell visits, 1,000 new cells, fixed 400pt width, and immutable
  source input.

## FAIL / BLOCKER

None for the bounded span-one Structure Draft authoring profile.

Editor/backend integration remains blocked until transport request/revision
contracts and product confirmation UX consume these core facts explicitly.

## RISK

- The one-to-one authoring profile excludes otherwise valid semantic Table
  Definitions with shared templates or separate empty-state templates.
- Column delete is intentionally destructive; editor UX must show affected
  rows/content and require confirmation before dispatch.
- Physical column units normalize to points even when source spelling used mm;
  physical total and ratios remain deterministic.
- History replay proves command determinism but is not durable undo storage and
  does not resolve concurrent edits.
- Large commands carry exact affected id arrays; transport may need bounded
  summaries alongside retained server-side detail later.

## UNKNOWN

- Canonical versioned location of Table Definitions inside a Structure bundle.
- Final editor affordances for row-source roles, break policy, and destructive
  grid previews.
- Collaboration conflict semantics for concurrent row and column edits.
- Shared-template and empty-state authoring model.
- Canonical colSpan/rowSpan occupancy integration and merge content UX.

## Files Changed

- Architecture/readiness: `docs/TABLE_V4_AUTHORING_LANE_ARCHITECTURE_LOCK.md`,
  `src/table/tableAuthoringContractV1.ts`, and
  `src/table/tableAuthoringBundleV1.ts`.
- Commands: `src/table/tableAuthoringV1.ts` and
  `src/table/tableAuthoringGridV1.ts`.
- History: `src/table/tableAuthoringHistoryV1.ts`.
- Capability vocabulary: `src/lifecycle/structurePolicy.ts`.
- Public exports, phase summaries, focused row/grid/history tests, and the
  1,000-row scale fixture/test.

## Behavior Changed

- Core now exposes exact-draft Table structural commands for the accepted v1
  profile instead of requiring raw internal node mutation.
- Document and Table Definition cannot drift through a partially applied Table
  authoring command.
- Consumers receive selection and invalidation recommendations without core
  mutating editor state or executing layout.
- Destructive and width-changing operations expose complete affected subtree,
  cell, and text-block scope.

## Tests Run

- Core before this document: type-check and 260 test files / 1,372 tests.
- Editor: type-check, 27 test files / 157 tests, and production build.
- Backend: type-check, 13 test files / 45 tests, and build.
- Final core type-check/full suite is required after adding this close audit.

## Risks Left

- Product confirmation and conflict UX remain editor concerns.
- Revision gates, persistence, and durable history remain backend concerns.
- Collection-source contract editing and merged occupancy remain future core
  versions rather than hidden compatibility behavior.

## Intentionally Not Changed

- canonical package/document/Table schemas and span-one graph validation;
- Published Structure Versions and Materialized Document Instances;
- collection field/binding contracts and generated materialized rows;
- colSpan merge/split and rowSpan commands;
- Table resolution, measurement, pagination, renderer, or artifact execution;
- existing v3 operations and generic v4 block operation behavior;
- backend transport/storage and editor state/UI.

## Next Recommended Direction

Move to the TOC node semantic lane. Lock heading-source rules, generated-entry
identity, page-number dependency, update/invalidation behavior, and authoring
controls before connecting TOC to pagination output. Keep Table editor/backend
integration as a separate cross-repo topic after the next core node contracts
are stable.
