# Table V4 Content Materialization Architecture Lock

Status: Phase 299 architecture lock.

## Outcome

Resolved Table content materialization clones collection-row template content
into a derived, source-retaining content graph. It gives every cloned block and
inline a document-resolution-scoped identity, preserves field/image placements,
and emits separate resolved binding facts. It never mutates the authored
Document Instance graph or turns field references into irreversible plain text.

This lock authorizes Published Collection Item Contracts, explicit placement
binding scopes, resolved node/inline identities, bounded row-template cloning,
and deterministic materialization evidence. It does not activate pagination,
renderer/export, backend persistence, public submission APIs, or editor input.

## Public Input And Internal Snapshot Boundary

Public callers submit collection item values and do not need to see or type
`itemKey`. Backend ingestion validates the public payload, creates or recovers
stable item identity, and emits the normalized pinned collection snapshot that
core consumes.

`itemKey` remains an internal normalized snapshot fact in v1. Reorder, edit,
retry, and instance reload retain it; duplicating an item creates a new key. An
optional external source id may help backend matching but does not become a
row, node, or inline id directly.

```text
public values
  -> backend validation and item identity normalization
  -> pinned collection snapshot with internal itemKey
  -> core resolved row and content materialization
```

## Published Collection Item Contract

One exact Published Structure Version owns a versioned collection item
contract. Each collection field declares named item fields with type,
requiredness, and any type-compatible fallback policy. V1 item fields may be
text, number, date, boolean, enum, or image. Nested collection item fields are
blocked until recursive collection semantics have a separate contract.

The parent Published Field Contract still declares the top-level field as
`collection`. The item contract refines its item shape; it cannot create a
collection that does not exist in that parent contract or change its owner.

Missing and explicit null values are different facts. Missing required values
block materialization. Missing optional values may use a defined fallback or
resolve empty. Explicit null is retained as intentional empty and does not
silently become a missing value.

## Explicit Placement Binding Scope

Position does not imply data scope. Every field-bearing placement in a
collection row template has an explicit sidecar binding:

```text
document-field
  -> fieldKey

collection-item-field
  -> collectionFieldKey
  -> itemFieldKey
```

This allows a repeated row to use both item-local values and document-global
values. Core never assumes that a field-ref inside a table must be item-local.

The first binding contract is a Published Structure-owned sidecar keyed by
source placement id. It covers text `field-ref`, inline `image-field-ref`, and
block image-field placements. Every field-bearing placement reachable from a
collection row template must have exactly one binding. Plain text, line breaks,
static asset images, dividers, and spacers require none.

The existing inline grammar remains unchanged in this phase. The sidecar proves
scope semantics before any future canonical inline-schema version decision.

## Resolved Content Identity

Identity Standard v1 adds:

- `resolved-node` with `nodei_` prefix; and
- `resolved-inline` with `inli_` prefix.

Both are allocated by the resolution orchestrator under the exact
`document-resolution` scope. Core validates supplied assignments and never
uses process randomness or source-id string concatenation as allocation.

Node provenance includes table, row source/template, item key, row/cell
instance ids, source node id, Structure version, instance revision, and
collection snapshot revision. Inline provenance additionally includes source
text-block and source inline ids plus resolved parent node id.

All assignments pass the existing canonical allocation-input and batch
conflict audit. Reusing one derived identity for different source content or
scope blocks the whole materialization request.

## Bounded Source Graph

V1 materializes collection rows only. Static and empty-state rows retain their
authored content references from the resolved row stream.

The current document v4 table-cell grammar permits direct child text-block,
image, divider, spacer, and TOC nodes. The first materializer supports:

- text-block, including text, field-ref, line-break, and inline-image children;
- block image;
- divider; and
- spacer.

TOC is generated content and blocks collection-row materialization in v1.
Page-number is invalid in body table text, and page-break/Columns are already
outside table-cell containment. Unsupported content blocks instead of being
dropped or treated as an empty cell.

Media assets and registries are referenced, not cloned once per row. Only the
image placement node/inline receives derived identity.

## Source Verification And Clone Plan

Materialization consumes one exact Document Instance graph, one accepted
resolved row stream, the Published Collection Item/Binding contracts, resolved
document-global bindings, item values, and complete identity assignments.

For every collection row it:

1. resolves the source row template and source cells in the authored graph;
2. verifies cell placement ids and child ownership;
3. rejects missing, multiply owned, or unsupported descendants;
4. clones each supported block and inline using supplied identities;
5. rewrites cloned text-block inline ids and cloned cell child references;
6. emits source-to-resolved node/inline provenance;
7. emits item-local and document-global value bindings separately; and
8. commits the complete row content or nothing.

The authored graph, resolved row input, contracts, snapshot values, field
registries, styles, and media registries remain immutable.

## Binding Output

Materialized field/image placements remain typed placements. Resolved values
live in binding tables:

```text
resolvedPlacementId
  + binding scope
  + field key(s)
  + value
  + value source
  + source item identity when item-local
```

Document-field bindings reuse the exact pinned Resolved Document binding facts
instead of re-resolving global data independently. Item-field bindings validate
against the Published Collection Item Contract and the current snapshot item.

Image values remain asset references with explicit published-static or
instance-media ownership. Materialization does not fetch or copy media bytes.

## Determinism And Invalidation

- The same pinned inputs and identity assignments produce byte-stable JSON.
- Reordering collection items changes row order but not stable item-derived
  identity assignments.
- Changing one item's values invalidates that row's binding/measurement path,
  not unrelated rows or authored nodes.
- Changing a row template, binding contract, item contract, style, or cell span
  invalidates every affected materialized occurrence explicitly.
- Work facts count visited rows, cells, nodes, inlines, and bindings. Repeated
  source graph scans from the document root are not allowed per item.

## Version Storage Consequence

Materialized content is derived instance output, not a new Published Structure
Version. Published versions remain full logical immutable snapshots with
optional semantic change sets and storage-level chunk deduplication. Derived
content may be cached by complete input fingerprints but never becomes the
source of truth for authored structure.

## PASS Criteria

- public payload does not require itemKey while core snapshot identity remains
  stable and internal;
- exact Published Collection Item and placement-binding ownership;
- explicit document/item scope for every field-bearing placement;
- `nodei_` and `inli_` assignments with exact provenance and conflict audit;
- complete source graph/cell ownership validation;
- deterministic source-immutable cloning of supported block/inline families;
- separate item/global text/image binding facts;
- unsupported generated/deep content blocks all-or-nothing; and
- bounded work facts plus representative repeated-row scale evidence.

## RISK

- Derived identity volume grows with repeated descendants even when item values
  are small.
- Sidecar bindings can drift from inline/image placements unless completeness
  is validated against the exact source graph.
- Collection item contract changes require a new Published Structure Version
  and explicit instance migration or regeneration.
- Cloned rich text preserves style/media references whose registries must stay
  pinned for later measurement and rendering.
- A future canonical scoped field-ref shape will require an explicit migration
  from the sidecar contract, not silent interpretation.

## UNKNOWN

- Public API create/update envelopes and backend item matching persistence.
- Product limits for collection items and item-field counts.
- Nested object/collection fields and locale formatting.
- TOC or other generated content inside repeated rows.
- Cache eviction and chunking policy for very large materialized row graphs.

## Intentionally Not Changed

- public API routes or backend normalization implementation;
- current internal `itemKey` collection snapshot field;
- canonical document v4 text-block/image/table schemas;
- Resolved Document v1 global binding behavior;
- static/empty-state authored content identity;
- Table row/cell pagination and repeated-header fragments;
- renderer, export, storage, and editor authoring/runtime.

## Next Direction

Implement strict Published Collection Item and Table Content Binding contracts,
then extend Identity Standard v1 with resolved node/inline profiles before
building the source-immutable materialization planner.
