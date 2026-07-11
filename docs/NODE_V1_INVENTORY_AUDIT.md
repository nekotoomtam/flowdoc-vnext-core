# Node v1 Inventory Audit

Date: 2026-07-11

Status: Phase 247 cross-repo inventory and decision boundary. This audit does
not change the canonical schema, operation behavior, backend transport, editor
presentation, pagination, or renderer output.

## Purpose

The FlowDoc v1 node vocabulary must become stable before field placement,
fragmentation, large-document virtualization, or image implementation builds
on it. This audit records what the three split repositories support today and
separates canonical capability from product-visible capability.

The audit answers four questions:

1. Which authored and inline node types are canonical today?
2. Which parent, operation, pagination, and presentation contracts exist for
   each type?
3. Which declared capabilities are not reachable through the product editor?
4. Which decisions must close before Node v1 can be called stable?

## Evidence Scope

Core evidence:

- `src/schema/document.ts`
- `src/graph/relationshipGraph.ts`
- `src/operations/commands.ts`
- `src/operations/documentOperations.ts`
- `src/operations/invalidation.ts`
- `src/authoring/textTransactions.ts`
- `src/pagination/paginationPlan.ts`
- `src/pagination/measuredPagination.ts`
- `tests/packageFixture.test.ts`
- `tests/relationshipGraph.test.ts`
- `tests/operations.test.ts`
- `tests/textTransactions.test.ts`
- `tests/measuredPagination.test.ts`

Editor evidence at `flowdoc-vnext-editor@e50e28c`:

- `src/core/coreRuntimeSeedMapper.ts`
- `src/editor/presentation/nodePresentationProjector.ts`
- `src/editor/presentation/nodePresentationTypes.ts`
- `src/editor/coreBinding/capabilityMirror.ts`
- `src/editor/commands/commandPolicy.ts`
- `src/editor/commands/commandTargets.ts`
- `src/editor/commands/reorderPlacement.ts`
- `src/editor/render/renderProjector.ts`
- `src/tests/nodePresentation.test.ts`
- `src/tests/commands.test.ts`
- `src/tests/renderProjector.test.ts`

Backend evidence at `flowdoc-vnext-backend@9d4b202`:

- `src/contracts/mutation.ts`
- `src/core/coreOperationMapper.ts`
- `src/service/mutationService.ts`
- `src/storage/packageRepository.ts`
- `src/tests/contract.test.ts`
- `src/tests/mutationService.test.ts`

## Truth Layers

Node readiness is not one boolean. The current system has distinct truth
layers:

1. **Canonical schema**: what may be persisted in package v2/document v3.
2. **Relationship graph**: valid parent/child facts and declared capabilities.
3. **Core operations**: commands that can safely mutate canonical documents.
4. **Pagination**: split policy and measured placement behavior.
5. **Backend passage**: package validation, revision gates, persistence, and
   exposed mutation envelopes.
6. **Editor presentation**: which authored nodes become product surfaces,
   internal represented structure, selection targets, and render summaries.

A PASS in one layer does not imply a PASS in the others.

## Context Nodes

`document` and `section` are editor/runtime context nodes, not members of the
canonical `AuthoredNodeSchema` union. Sections own page settings and zone ids;
zones are the first authored nodes in each section. The editor also adds a
synthetic `root` document node for normalized lookup and traversal.

Context nodes must not be treated as reorderable canvas blocks or persisted as
new authored node variants.

## Authored Node Inventory

| Node type | Canonical parent | Children | Generic node operations | Core-specific operations | Core pagination | Product editor | v1 disposition |
|---|---|---|---|---|---|---|---|
| `zone` | section `zoneIds` | block children | none | none | container | context only | retain as infrastructure |
| `text-block` | zone, column, table-cell | inline children | delete, duplicate, reorder | insert, coarse replace, granular text transactions | line-splittable | surface at body flow; internal under columns/table | retain; grammar lock required next |
| `columns` | zone, column | `column` | delete, duplicate, reorder | insert, layout patch | columns policy | product surface | retain as group surface |
| `column` | `columns` | block children | declared delete, duplicate, reorder | none | container | internal under columns surface | capability decision required |
| `table` | zone, column | `table-row` | delete, duplicate, reorder | row/column insert and delete | table policy with repeated headers and deep text split evidence | product surface | retain; fragmentation policy follows node closure |
| `table-row` | table | `table-cell` | none | row insert/delete through table operations | table-row policy | internal under table surface | retain as internal structure |
| `table-cell` | table-row | limited block children | none | created/deleted through table row/column operations | table-cell policy | internal under table surface | retain as internal structure |
| `toc` | zone, column, table-cell | none | delete, duplicate, reorder | none | generated | product surface | retain; insertion/generation UX unresolved |
| `page-break` | zone, column, table-cell | none | delete, duplicate, reorder | none | forced break; ignored with warning inside columns | product surface | retain; insertion command missing |
| `divider` | zone, column, table-cell | none | delete, duplicate, reorder | none | atomic measured block | no product surface | BLOCKER: visibility and selection policy |
| `spacer` | zone, column, table-cell | none | delete, duplicate, reorder | none | atomic measured block | no product surface | BLOCKER: visibility and selection policy |

The canonical vocabulary therefore contains eleven authored node types. The
product editor currently exposes five surface types: `text-block`, `columns`,
`table`, `toc`, and `page-break`.

## Parent Child Matrix

The relationship graph currently enforces these authored relationships:

| Parent | Allowed direct children |
|---|---|
| section | `zone` |
| `zone` | `text-block`, `columns`, `table`, `toc`, `page-break`, `divider`, `spacer` |
| `columns` | `column` |
| `column` | `text-block`, `columns`, `table`, `toc`, `page-break`, `divider`, `spacer` |
| `table` | `table-row` |
| `table-row` | `table-cell` |
| `table-cell` | `text-block`, `toc`, `page-break`, `divider`, `spacer` |

Consequences:

- nested columns are canonical through column children;
- tables may be placed in columns but not directly inside table cells;
- columns may not be placed directly inside table cells;
- page breaks are schema-valid inside columns and table cells even though
  measured pagination warns that a page break in columns is ignored;
- table rows and cells are structural children, not body-flow surfaces.

The page-break mismatch is a v1 policy risk: canonical allowance and measured
behavior should not disagree silently.

## Inline Node Inventory

| Inline type | Current semantics | Text transaction behavior | v1 disposition |
|---|---|---|---|
| `text` | text plus optional run style | editable UTF-16 range | retain; style grammar needs lock |
| `field-ref` | key, optional label and fallback | atomic U+FFFC segment; explicit insert command | retain as serialized usage, not field ownership |
| `page-number` | generated page value | atomic U+FFFC segment | retain; valid placement policy unresolved |
| `line-break` | authored hard line break | projects to newline but is non-editable as a segment | retain; deletion/insertion policy needs lock |

The current editor capability mirror sets `canInsertFieldChip` whenever a
surface can contain text. That is implementation evidence from the earlier
node-selected field-chip direction, not the accepted product direction. The
v1 field model treats the registry as central and creates a usage only after a
field is placed into a compatible target. Field placement remains deferred
until node and text-block contracts close.

## Operation Coverage

Core exposes eleven operation kinds:

- generic `node.delete`, `node.duplicate`, and `node.reorder`;
- `columns.insert` and `columns.layout.patch`;
- `text-block.insert` and `text-block.text.replace`;
- table row insert/delete and table column insert/delete.

Granular text transactions are a separate authoring boundary and include text
insert/delete/range replace plus atomic field-ref insertion.

Current product transport exposes only the three generic node operations.
Backend revision checks and package persistence are node-agnostic after the
request maps to core, but columns, text-block, and table-specific operation
envelopes are not yet part of the backend/editor integration lane.

Generic operations are capability-gated in core. The editor first normalizes
an internal node to its owning product surface, then evaluates that surface's
capability. As a result, a capability declared for an internal `column` or a
nested text-block is not directly reachable as that node from current canvas,
outline, or inspector actions.

## Presentation Coverage

The editor presentation projector follows a first-owning-surface rule:

- top-level `text-block`, `columns`, `table`, `toc`, and `page-break` nodes
  become canvas and outline surfaces;
- descendants of a surface are represented by that surface;
- document, section, and zone remain context;
- `divider` and `spacer` have no surface mapping and therefore receive no
  selection target when they occur in body flow.

This rule intentionally makes columns and tables group surfaces, but it also
means text-blocks inside columns and table cells cannot yet become independent
text-editing targets through the product presentation path. The next
text-block phase must distinguish group selection from active descendant text
editing without turning every structural child into a canvas block.

The editor render projector is a summary renderer. It has specialized render
kinds for heading/paragraph text, columns, table, TOC, and page break. It does
not consume canonical measured fragments and does not render divider/spacer
because those nodes never become product surfaces.

## Pagination Classification

Core pagination planning currently classifies:

- zone and column as `container`;
- text-block as `line`;
- columns as `columns`;
- table, table-row, and table-cell with table-specific policies;
- TOC as `generated`;
- page break as `forced-break`;
- divider and spacer as `atomic`.

Measured pagination has evidence for long text splitting, columns geometry,
table rows with repeated headers, breakable over-tall cell text, atomic
`allowBreak=false` overflow, and explicit non-text table-cell block policies.
This evidence belongs to core exact-layout semantics. The product editor still
uses estimated block heights and must not claim parity from this audit.

`canSplitAcrossPages` is currently a coarse graph capability. It does not
replace the richer pagination split policies above and should not become the
future fragmentation contract without a separate decision.

## Dirty Scope Coverage

Core operations return section, zone, node, parent, table, and text-block
scope facts. Text transactions produce a narrow text-block dirty scope. The
operation invalidation page scope is still explicitly
`pagination-not-integrated`.

This is sufficient for current history and stale-layout signaling, but not for
incremental 200-300 page pagination. Fragment/page invalidation remains a
later phase after node semantics close.

## Backend Passage

PASS:

- canonical packages are parsed through `@flowdoc/vnext-core`;
- package storage is node-agnostic and preserves accepted canonical shapes;
- mutations check base revision before core execution;
- accepted core documents are serialized and persisted with a new revision;
- rejected or stale operations do not overwrite the package.

LIMIT:

- only generic delete/duplicate/reorder are exposed as mutation envelopes;
- there is no image asset byte lifecycle, which is intentionally outside core
  node semantics;
- adding a new canonical image shape will require backend package-consumption
  tests even if no node-specific backend logic is added.

## V1 Decisions

The following directions are accepted for the Node v1 workstream:

1. Node semantics close before fragmentation and large-document windowing.
2. `text-block` is the next detailed grammar phase.
3. Node v1 must include both an atomic inline image usage and a block image
   surface before the vocabulary closes.
4. Inline and block image forms may share asset identity but must not be one
   context-ambiguous node type.
5. Columns remain a group surface; table remains a group surface.
6. Table row and table cell remain canonical internal structure in the first
   product editing baseline.
7. Field definitions remain central; `field-ref` is a serialized usage and
   must not imply field ownership by the selected node.
8. Fragmentation, upload/crop, floating image wrap, field placement UI,
   backend chunk loading, and exact editor/export parity stay deferred.

## BLOCKER

Node v1 cannot close until:

- text-block inline grammar and atomic-offset behavior are locked;
- inline image and block image canonical contracts are decided;
- the document-version policy for adding image shapes is decided;
- divider and spacer receive an explicit product surface or intentional
  non-visual policy;
- direct capability semantics for internal column/row/cell nodes are aligned
  with product selection and operation targeting;
- schema-valid page breaks inside columns receive an accepted behavior;
- TOC/page-break/divider/spacer insertion ownership is decided.

## RISK

- Current graph capabilities can overstate product reachability for internal
  nodes.
- Current editor presentation can hide canonical utility nodes entirely.
- Current field-chip capability naming reflects a superseded node-selected UX.
- Nested text-block editing needs a separate active descendant target from the
  group surface selection target.
- Adding image to document v3 without a version policy could make old strict
  parsers reject new packages without an explicit migration signal.
- Core measured pagination is more advanced than the product preview; mixing
  those readiness claims would hide real integration work.

## UNKNOWN

- Phase 251 resolves image additions and tightened Text-block grammar to target
  document v4; Phase 252 resolves the asset manifest envelope to package v3.
- Whether divider and spacer should be independently selectable surfaces or
  utility affordances owned by adjacent flow slots.
- Whether column-level direct selection is required in v1 or only through a
  columns inspector mode.
- Whether page-number usage should be restricted to header/footer zones.
- Whether nested columns remain an accepted v1 product behavior.
- Which asset metadata belongs in canonical package truth versus an external
  asset registry retained by backend storage.

## PASS

- Canonical authored and inline vocabularies are finite and schema-validated.
- Relationship graph parent/child facts and nearest contexts exist for all
  current authored types.
- Generic structural operations validate through graph capabilities and emit
  history-ready scope/invalidation facts.
- Text, columns, and table have focused core operation evidence.
- Core pagination has explicit split policy and measured evidence for every
  current authored node family.
- Backend package passage and generic mutation revision safety are separated
  from node semantics.
- Editor presentation explicitly distinguishes context, internal, surface,
  and unsupported roles.

## Intentionally Not Changed

- canonical package v2/document v3 schema;
- node or inline unions;
- relationship graph capabilities;
- core operation registry;
- backend mutation envelopes;
- editor surface mapping and field-chip capability names;
- pagination, renderer, or export behavior;
- fixtures or browser runtime behavior.

## Next Recommended Direction

Start Text-block v1 Grammar Lock. The phase should define the complete v1
inline union, UTF-16 offset and atomic deletion rules, style ownership,
line-break/page-number restrictions, nested text editing target behavior, and
the insertion point for future `inline-image` before any schema change is
implemented.
