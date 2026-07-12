# Table V4 Authoring Risk Hardening Close Audit

Status: Phase 337 close audit.

## Outcome

The bounded Table v4 Structure Draft authoring lane now has a guarded boundary
over its pure atomic kernel. Consumers can preview exact impact, enforce
explicit work/impact budgets, require an exact current confirmation for
destructive commands, commit without source mutation, retain a selective
reversible change set, and apply fingerprint-gated undo/redo.

This closes core risk hardening for the accepted span-one authoring profile. It
does not claim editor confirmation UI, backend revision persistence, durable
undo storage, authentication, collaboration merge, or broader Table semantics.

## PASS

- Preview reruns the same pure authoring kernel used by guarded commit and
  returns identity, scope, invalidation, work, impact counts, and fingerprints.
- Preview does not return proposed document, definition, or mutable change-set
  artifacts and does not mutate its source request.
- Static row delete and column delete require a strict JSON-safe confirmation
  packet pinned to exact draft, command, budgets, before/proposed bundle,
  impact, and reversible change-set fingerprints.
- Missing, stale, or stray confirmation blocks with source document and Table
  Definition unchanged.
- Insert, reorder, resize, and vertical-alignment commands remain
  non-destructive but still pass through the same budget boundary.
- Change sets retain only changed authored nodes and changed Table Definition
  columns, row sources, row templates, or header policy.
- Changed object-key positions are retained so deletion undo reconstructs the
  exact byte-sensitive bundle fingerprint instead of merely equal values.
- Undo requires the exact after fingerprint; redo requires the exact before
  fingerprint. Intervening drift blocks before application.
- Undo/redo re-audits Table authoring readiness and verifies the expected
  opposite bundle fingerprint before returning artifacts.
- Positive integer limits cover row-template visits, unique affected nodes,
  and removed subtree nodes. Invalid or exceeded budgets return no proposed
  artifacts or confirmation.
- Obvious row-template excess blocks before kernel execution; exact planned
  work and impact are enforced before preview readiness or commit.
- Guarded committed history retains its reversible change-set fingerprint
  while existing pure forward replay remains compatible.
- A 1,000-row-template column insertion produces byte-identical repeated
  preview and commit output, exactly 4,001 unique affected nodes, 2,001 changed
  authored nodes, and 1,000 changed row templates, then completes exact undo
  and redo under explicit budgets.
- One-unit-below evidence blocks row-template, affected-node, and
  removed-subtree budgets deterministically.

## FAIL / BLOCKER

None for core risk hardening of the bounded span-one Structure Draft Table
authoring profile.

Editor/backend integration remains a separate topic: editor must present
impact and confirmation/undo UX, while backend must enforce revision,
authorization, retention, and persistence before guarded commits are durable.

## RISK

- Exact preview executes the pure kernel. Only obvious row-template excess is
  preflighted; affected-node and removed-subtree limits are post-plan guards,
  not CPU cancellation.
- A reversible column insertion across 1,000 rows necessarily retains 1,000
  changed rows, 1,000 new cells, and 1,000 changed row templates.
- Fingerprint gates deliberately block any intervening drift and do not merge
  concurrent edits or transform inverse operations.
- Exact fingerprints currently include JSON object-key order. Change sets
  preserve changed key positions, but external normalization must not reorder
  retained bundles before applying undo/redo.
- Confirmation packets prove exact preview continuity, not user identity,
  authorization, or transport authenticity.
- Large exact identity/scope arrays may need backend-side retention plus a
  bounded client summary when product transport is introduced.

## UNKNOWN

- Product and tenant default budgets for each authoring command.
- Durable change-set retention, compression, and content-addressed references.
- Editor language and visualization for destructive impact and budget failure.
- Backend confirmation expiry and revision/authorization envelope design.
- Collaboration-aware inverse transformation or three-way merge semantics.
- Whether governed policies may require confirmation for non-destructive
  commands later.

## Files Changed

- Guard boundary: `src/table/tableAuthoringGuardV1.ts`.
- Reversible artifacts: `src/table/tableAuthoringChangeSetV1.ts`.
- Guarded history relationship: `src/table/tableAuthoringHistoryV1.ts`.
- Public exports, architecture/phase documentation, focused guard/change-set/
  history tests, and 1,000-row scale evidence.

## Behavior Changed

- Core consumers can choose a guarded preview/commit lane instead of directly
  dispatching destructive or large commands to the low-level pure kernel.
- Destructive commit now has a core contract for exact preview continuity
  rather than relying on an unpinned UI boolean.
- Successful guarded commits expose selective reversible data without making
  core own a durable undo stack.
- Work and impact can be rejected by explicit caller budgets before artifacts
  are handed off.

## Tests Run

- Core before this document: type-check and 264 test files / 1,385 tests.
- Final core: type-check and 265 test files / 1,387 tests.
- Editor: type-check, 27 test files / 157 tests, and production build.
- Backend: type-check, 13 test files / 45 tests, and build.

## Risks Left

- Budget defaults and transport summaries remain product/backend decisions.
- Confirmation presentation and undo-stack integration remain editor work.
- Revision gates, authentication, durable history, and persistence remain
  backend work.
- Collection-source lifecycle, merged occupancy, rowSpan, and collaboration
  remain future core versions.

## Intentionally Not Changed

- canonical package/document/Table/Table-Definition schemas;
- low-level pure Table authoring command semantics and capability vocabulary;
- Published Structure Versions and Materialized Document Instances;
- collection-source lifecycle, shared/empty templates, merge/split, or rowSpan;
- Table resolution, measurement, pagination, renderer, or artifact execution;
- backend routes, revision storage, authentication, jobs, and history storage;
- editor state, selection, modal, undo stack, canvas, or drag/drop UI.

## Next Recommended Direction

Move to the TOC node semantic lane. Lock heading-source rules, generated-entry
identity, page-number dependency, update/invalidation behavior, and bounded
authoring capabilities before connecting TOC output to pagination. Return to
Table editor/backend guarded integration as its own cross-repo topic after the
next core node contract is stable.
