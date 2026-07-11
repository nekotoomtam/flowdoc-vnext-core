# Document V4 Node-Family Readiness Matrix

Status: Phase 267 evidence-backed readiness baseline. This matrix reports
independent capability axes; it does not activate a node family or replace
operation-specific capability checks.

## Status Vocabulary

- `PASS`: the stated scope is implemented and directly tested. For structural
  internals, PASS can mean intentional protection is proven; it does not mean
  generic lifecycle is enabled.
- `PARTIAL`: retained behavior exists, but at least one named part of the axis
  is unavailable.
- `BLOCKED`: required behavior for that axis is unavailable or deliberately
  closed.
- `UNKNOWN`: a decision or representative acceptance evidence is still absent.

There is no aggregate `ready` status. Every consumer must inspect the relevant
axis and retained evidence.

## Matrix

| Node | Family | Schema / references | Allowed parent / role | Core read | Generic lifecycle | Node edit / history | Layout / pagination | Render / export | Editor / backend | Scale |
|---|---|---|---|---|---|---|---|---|---|---|
| `zone` | zone | PASS | PASS: section-owned role | PASS | PASS: protected internal | BLOCKED | BLOCKED | BLOCKED | PARTIAL: structural read | UNKNOWN |
| `text-block` | text | PASS: v4 grammar/inline/field/image refs | PASS: zone/column/cell | PASS | PASS: block root | PARTIAL: policy-aware rich replace/history | PARTIAL: measured line pages; no mixed flow | BLOCKED | PARTIAL: core contracts; no editor/backend | PARTIAL: 6k lines/250 pages |
| `columns` | layout | PASS | PASS: zone/column | PASS | PASS: whole subtree | BLOCKED | BLOCKED | BLOCKED | PARTIAL: generic lifecycle | UNKNOWN |
| `column` | layout | PASS | PASS: columns-owned | PASS | PASS: protected internal | BLOCKED | BLOCKED | BLOCKED | PARTIAL: structural read | UNKNOWN |
| `table` | table | PASS: rectangular grid | PASS: zone/column | PASS | PASS: whole subtree | BLOCKED | BLOCKED | BLOCKED | PARTIAL: generic lifecycle | UNKNOWN |
| `table-row` | table | PASS: cell count/header law | PASS: table-owned | PASS | PASS: protected internal | BLOCKED | BLOCKED | BLOCKED | PARTIAL: structural read | UNKNOWN |
| `table-cell` | table | PASS | PASS: row-owned | PASS | PASS: protected internal | BLOCKED | BLOCKED | BLOCKED | PARTIAL: structural read | UNKNOWN |
| `toc` | generated | PASS | PASS: zone/column/cell | PASS | PASS: block root | BLOCKED | BLOCKED | BLOCKED | PARTIAL: generic lifecycle | UNKNOWN |
| `page-break` | utility | PASS | PASS: direct body-zone only | PASS | PASS: block root | BLOCKED: insert absent | BLOCKED | BLOCKED | PARTIAL: generic lifecycle | UNKNOWN |
| `divider` | utility | PASS | PASS: zone/column/cell | PASS | PASS: block root | BLOCKED: property edit absent | BLOCKED | BLOCKED | PARTIAL: generic lifecycle | UNKNOWN |
| `spacer` | utility | PASS | PASS: zone/column/cell | PASS | PASS: block root | BLOCKED: property edit absent | BLOCKED | BLOCKED | PARTIAL: generic lifecycle | UNKNOWN |
| `image` | media | PASS: asset/image-field refs | PASS: zone/column/cell | PASS | PASS: block root | BLOCKED | BLOCKED | BLOCKED: placeholder only | PARTIAL: generic lifecycle/media read | UNKNOWN |

Inline `text`, `field-ref`, `line-break`, `page-number`, and `inline-image` are
tracked under text-block grammar and media/reference evidence. They are not
independent authored block lifecycle targets.

## Evidence Catalog

### E1 Schema And References

- `src/schema/documentV4Target.ts` owns authored node vocabulary and allowed
  child types.
- `src/schema/documentV4Structure.ts` owns containment, role, table-grid, and
  inline identity validation.
- `src/schema/documentV4ImageTarget.ts` owns block/inline image placement and
  image-field/asset reference validation.
- `src/persistence/packageV3References.ts` owns package field-reference checks.
- `tests/documentV4Target.test.ts`, `tests/documentV4ImageTarget.test.ts`, and
  `tests/packageV3.test.ts` prove strict target acceptance/rejection.

### E2 Core Read Projection

- `src/runtime/readOnlySessionV4.ts` strictly parses package 3/document 4 and
  projects every authored node type, parent, context, and capability.
- `tests/readOnlySessionV4.test.ts` proves isolation from the active v3 session,
  image/media projection, and generic/internal capability facts.

### E3 Generic Lifecycle

- `src/operations/documentV4Operations.ts` owns isolated v4 delete, duplicate,
  and reorder semantics.
- `tests/documentV4GenericLifecycleAudit.test.ts` proves all 20 valid
  block/parent combinations, zone roles, structural protection, source
  immutability, and no-op rejection.
- `docs/DOCUMENT_V4_GENERIC_LIFECYCLE_CLOSE_AUDIT.md` records retained policy.

### E4 Backend Revision Boundary

- `flowdoc-vnext-backend/src/service/mutationService.ts` checks base revision,
  calls core, and writes accepted results only.
- `flowdoc-vnext-backend/src/tests/mutationService.test.ts` proves lifecycle
  persistence, stale rejection, structural rejection, and no-op revision
  retention.

### E5 Editor Consumer Boundary

- `flowdoc-vnext-editor/src/core/coreAdapter.ts` retains the core import boundary.
- `flowdoc-vnext-editor/src/tests/v4ReadOnly.test.ts` proves partial mode,
  generic lifecycle capability, media projection, and closed text/layout facts.
- `flowdoc-vnext-editor/src/editor/runtime/runtimeBackendMutation.ts` owns stale
  apply and post-delete/duplicate selection policy.
- `flowdoc-vnext-editor/src/tests/backendIntegration.test.ts` proves stale
  rejection, copied-root selection, and previous-sibling delete recovery.

### E6 Text-block Authoring

- `src/authoring/textBlockV4Contract.ts` owns canonical empty-block, five-inline
  projection, UTF-16 selection anchor, field compatibility, and page-number
  zone facts.
- `src/authoring/textBlockV4RichInlineReplace.ts` owns artifact-pinned,
  policy-aware complete inline replacement with identity/history facts.
- `tests/textBlockV4Contract.test.ts` and
  `tests/textBlockV4RichInlineReplace.test.ts` prove the retained boundaries.
- `src/pagination/textBlockV4Measurement.ts` and
  `tests/textBlockV4Measurement.test.ts` prove resolved measurement packets,
  complete lines, and authored/resolved source mapping without pagination.
- `src/pagination/textBlockV4Pagination.ts` and
  `tests/textBlockV4Pagination.test.ts` prove source-retaining line fragments
  and bounded 6,000-line/250-page text-block scale without renderer relayout.

### E7 Closed Axes

- `src/runtime/readOnlySessionV4.ts` reports `canContainText: false` and
  `canSplitAcrossPages: false` for the current target read session.
- `docs/DOCUMENT_V4_NODE_READINESS_ARCHITECTURE_LOCK.md` blocks columns/table
  node-specific work on text-block measured/source-range acceptance.
- Version capability retains `v4-remaining-operation-layout-render-support` as
  an activation blocker.

## Dependency Gates

### Text-Block Critical Path

Text-block remains the critical path because columns and table cells consume it
as their only authored text surface. The following remain blocked or partial:

1. explicit granular text/atomic commands and collaboration-safe identity
   allocation remain partial: managed atomic planning is PASS, granular text
   and collaboration allocation remain blocked;
2. explicit field placement UX/command and external-catalog drift reporting
   remain partial: core placement planning/compatibility/preflight are PASS,
   UX and drift reporting remain blocked;
3. browser draft to core transaction/IME/history integration remains blocked;
4. measured line packets and isolated page fragments with canonical/resolved
   source ranges are PASS; mixed document flow remains blocked;
5. cross-page edit/reflow source facts are PASS, while caret hit testing and
   selection painting remain blocked;
6. representative text-block scale is PARTIAL at 6,000 lines/250 pages; mixed
   document/backend/renderer scale remains UNKNOWN.

### Columns Gate

Columns may retain generic whole-subtree lifecycle, but node-specific readiness
requires text-block acceptance plus parallel child cursors, longest-column group
completion, nested-column invalidation, and multi-page fragment evidence.

### Table Gate

Table may retain generic whole-subtree lifecycle, but node-specific readiness
requires text-block acceptance plus row/cell operations, header repetition,
`allowBreak` behavior, nested line slices, rectangular-grid preservation, and
large-table evidence.

### Generated, Utility, And Media Gates

- TOC requires heading extraction, page resolution, exact-layout reconciliation,
  and renderer evidence.
- Page-break requires insert command policy and measured pagination consumption.
- Divider/spacer require property operations and measured/render evidence.
- Image requires property/source operations, asset-byte resolution, missing
  asset UX, measured placement, and exact renderer evidence.

These families can receive independent future slices, but none removes the
text-block dependency for columns/table.

## Field And Published-Version Constraint

Field key, field capability, authored placement, and runtime value remain
separate. Text `field-ref` and image `image-field-ref` placements share expected
field definitions retained by the template package. External field changes must
produce explicit placement-level drift diagnostics; they must not silently
rewrite a draft or published template version.

Published template versioning, API selection, and durable field-catalog
workflow remain backend/product concerns and are BLOCKED as implemented product
behavior in this matrix.

## PASS

- Schema/reference, strict read projection, and generic lifecycle policy have
  direct evidence for every authored v4 node type.
- Internal structural protection is distinguished from enabled block lifecycle.
- No node family is presented as fully active from parse or lifecycle facts.
- Text-block dependencies for columns/table are explicit.
- Field/media ownership and published-version constraints remain visible.

## FAIL / BLOCKER

- No v4 node has complete node-specific edit, measured pagination, exact render,
  or export readiness.
- Text-block is not ready for editor input or cross-page editing.
- Columns/table split planners remain blocked on text-block acceptance.

## RISK

- Status can drift unless evidence paths and cross-repo consumers are updated
  in the same completed phase.
- Type-level capability can overclaim future insert/move permission without
  parent and zone-role context.
- Scale remains UNKNOWN outside the isolated text-block evidence.

## UNKNOWN

- Granular merge and typing-coalescing decisions beyond bounded full replace.
- Representative mixed-document/backend/renderer scale thresholds.
- Collaboration-safe authored identity allocation.

## Intentionally Not Changed

- package/document schemas, parsers, and operation capability;
- editor input, DOM, selection, draft, and layout runtime;
- backend routes, storage, publish, field catalog, and API selection;
- pagination, renderer, export, and artifact execution.

## Next Recommended Direction

Close-audit text-block readiness and use its accepted line/source contracts to
start columns/table split planning without claiming editor/render readiness.
