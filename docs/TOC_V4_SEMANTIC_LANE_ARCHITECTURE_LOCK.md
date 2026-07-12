# TOC V4 Semantic Lane Architecture Lock

Status: Phase 338 architecture lock.

## Outcome

TOC v4 is a derived semantic node over canonical authored heading text blocks.
The authored `toc` node retains configuration only; generated entries remain a
pure read model and are not copied into document nodes, Text-block children,
or durable authoring state.

This lane owns source collection, generated-entry identity, authored-preview
labels, dependencies, and invalidation facts. Measurement, pagination, final
page-reference resolution, renderer commands, authoring UI, and persistence
remain separate consumers or later lanes.

## Accepted Input

The semantic collector accepts one canonical document v4 value only after
`validateVNextDocumentV4Structure(...)` reports `valid`. It does not accept
document v3, legacy editor objects, renderer fragments, DOM state, or measured
pagination as semantic source truth.

The existing document v3 `resolveVNextFinalPageReferences(...)` boundary is
retained as evidence for post-pagination page lookup. It is not reused as the
v4 semantic collector because it scans node-map insertion order and combines
source collection with final page facts.

## TOC Configuration V1

The existing v4 TOC node remains:

```text
toc.props.title?: string
toc.props.maxLevel?: 1..6
```

V1 defaults `maxLevel` to 6 and uses document-wide body-flow scope. Minimum
level, section filters, explicit heading lists, numbering policy, leader style,
and per-entry overrides remain future versioned additions rather than guessed
optional behavior.

## Heading Sources

A source heading is a reachable `text-block` whose role is
`{ role: "heading", level: 1..6 }` and whose owning zone role is `body`.

Collection order is structural reading order:

1. document section array order;
2. section `zoneIds` order, restricted to body zones;
3. depth-first child-array order through zone, columns/column,
   table/row/cell, and ordinary body containers.

Headings in header, footer, first-page-header, and first-page-footer zones are
excluded. Headings nested in body columns or Table cells are included because
their semantic role is explicit; their order follows authored structural order,
not renderer geometry.

Each TOC applies its own `maxLevel` filter to the same ordered heading source
set. TOC nodes never source themselves and generated entries are never scanned
as headings.

## Authored Preview Label

V1 emits a deterministic authored-preview label, not a claim about final
materialized field values:

- text leaves contribute authored text;
- line breaks contribute one separating space;
- field refs contribute `label`, then `fallback`, then `key`, and retain their
  field key as a dependency;
- page-number and inline-image atomics do not contribute label text;
- whitespace is collapsed and trimmed.

An empty label remains an entry with an explicit warning. It is not silently
removed because heading identity and order remain semantically meaningful.
Final generated/runtime heading labels may resolve field values in a later
materialization lane without changing source heading identity.

## Generated Entry Identity

Generated entries use the exact composite identity:

```text
{ tocNodeId, headingNodeId }
```

Core does not concatenate these ids into a new persisted node id. Entry order
is a derived ordinal only and is not identity. Duplicate heading text is valid;
stable authored heading node identity distinguishes entries.

Each entry retains TOC id, heading id, section id, body zone id, heading level,
ordered source ordinal, TOC-local ordinal, authored-preview label, field keys,
and page-reference status `pending`.

## Invalidation Boundary

- Heading insert/delete/reorder, heading role/level change, authored inline
  content change, or TOC `maxLevel` change rebuilds affected semantic entries.
- Field value change refreshes materialized labels later; V1 reports field-key
  dependency but does not resolve runtime values.
- Pagination-only change keeps semantic identity/order/label and refreshes page
  references only.
- TOC presentation/style change may invalidate measurement/render without
  changing semantic entries.

## Pagination Cycle Boundary

Semantic collection happens before TOC measurement and knows entry count,
labels, levels, and dependencies without page numbers. A later measurement
contract must reserve a fixed-width page-number column so changing `9` to `10`
or `99` to `100` does not reflow entry labels.

Measured pagination then places headings and TOC rows. Final page resolution
maps heading ids to measured page references without mutating authored or
semantic source artifacts. Fixed-width page-number measurement and convergence
proof are not implemented in this semantic phase.

## PASS Criteria

- strict v4 structure gate and immutable source;
- body-only structural traversal across sections and nested containers;
- per-TOC max-level filtering and deterministic composite identity;
- authored-preview labels with explicit field dependencies;
- empty-label and unsupported-state diagnostics without silent omission;
- stable JSON-safe output and deterministic repeated collection;
- explicit semantic versus pagination invalidation facts;
- bounded linear evidence over at least 1,000 headings;
- no document mutation, field-value resolution, measurement, pagination,
  rendering, persistence, network, DOM, or editor state.

## RISK

- Structural order inside Columns is deterministic but may differ from future
  geometry-aware reading order for advanced layouts.
- Heading field refs expose authored preview labels until materialization
  supplies resolved values.
- Including explicit heading roles inside Table cells may surprise products
  that used heading styling without heading semantics.
- Document-wide scope is intentionally narrow; section-local TOCs require a
  later schema decision.
- Fixed-width page-number measurement is required before exact TOC layout can
  safely claim no pagination feedback loop.

## UNKNOWN

- Minimum-level and section/filter configuration shape.
- Explicit `includeInToc` or label-override heading metadata.
- Numbering-prefix ownership and style-catalog contract.
- Empty heading product policy beyond the core warning.
- Geometry-aware reading order for non-linear future layouts.
- Final materialized label contract for field-backed headings.

## Intentionally Not Changed

- canonical document v4 schema and existing TOC/heading shapes;
- document v3 final page-resolution behavior;
- Text-block rich-inline authoring and field registry contracts;
- measurement, pagination, renderer, PDF, or DOCX execution;
- TOC insert/delete/configuration authoring commands and policy actions;
- backend transport/storage and editor state/UI.

## Next Direction

Implement the pure v4 semantic collector and generated-entry contract from
this lock, then add invalidation and scale evidence before opening TOC
measurement or authoring lanes.
