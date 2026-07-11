# Document V4 Node Readiness Architecture Lock

Status: Phase 265 architecture decision lock. This phase records required
boundaries and acceptance gates; it does not activate text editing, measured v4
layout, published-template workflows, or container pagination.

## Outcome

Document v4 node readiness must be assessed without collapsing authored truth,
field dependencies, editor drafts, measured layout, backend revisions, or
published template evidence into one model. Text-block readiness is a required
dependency for node-specific columns and table work.

## Non-Negotiable Invariants

1. One authored node may produce many measured layout fragments.
2. Page or line fragmentation never mutates the canonical authored tree.
3. Columns and table cells contain block nodes; they do not own a second text
   model.
4. Field definition, field placement, and field value are separate truths.
5. Image placement identity is separate from shared image asset identity.
6. Layout reflow is not an authored history intent.
7. Published template versions are immutable evidence; this target invariant
   does not move publish workflow ownership into core.
8. Capability is operation- and context-specific. Parse support or family
   membership does not imply edit, layout, render, or export readiness.

## Truth Layers

### Canonical Authored Truth

The package document owns sections, zones, authored nodes, containment,
text-block inline children, and placement references. It does not store browser
selection, DOM state, measured lines, page fragments, or renderer geometry.

### Field Dependency Truth

An external field catalog is the business source of field definitions and
capabilities. The package field registry is the retained expected contract used
by the authored template version. A placement stores only its field reference
and placement-specific facts. Runtime data supplies values separately and may
be carried in a package data snapshot without becoming authored node content.

External field changes must not silently mutate authored placements. A future
draft/publish workflow must report dependency drift at affected placements and
require explicit rebind, removal, or migration before publishing a new
immutable template version. Previously published versions retain their own
document and expected field contract snapshots.

### Editor Interaction Truth

The editor owns draft buffers, selection, caret, composition, viewport, and
optimistic interaction state. A browser draft becomes canonical only through a
validated core transaction and backend revision gate.

### Measured Layout Truth

Text measurement emits ordered line packets with canonical source ranges.
Pagination groups those lines into page fragments. A renderer consumes retained
fragments and must not reconstruct wrapping from authored text.

Illustrative shape only:

```ts
interface MeasuredTextLineV4 {
  lineIndex: number
  start: { inlineId: string; offset: number }
  end: { inlineId: string; offset: number }
  text: string
  widthPt: number
  heightPt: number
}
```

Line text may be retained for renderer consumption, but canonical inline ranges
remain the identity bridge. Measured lines are invalidated and rebuilt when
width, font, style, field resolution, or page settings change.

### Published Template Evidence

A published template version freezes the complete document structure and the
field expectations used by that version. Editing continues in a draft. A draft
created from any retained published version records its base provenance and,
when published, receives the next version in that template lineage. Publishing,
API selection, authorization, and durable version storage remain backend/product
workflow responsibilities.

## Canonical-To-Fragment Contract

A text-block remains one canonical node when it crosses pages. Its measured
fragments carry the same `nodeId` plus bounded line/source ranges. Selection
anchors use canonical text-block, inline, offset, and affinity facts; page
coordinates are a projection and cannot become selection identity.

Columns and tables follow the same one-canonical-to-many-fragments rule but use
family-specific split planners:

- text-block splits by measured line ranges;
- columns split through parallel child cursors and complete when the longest
  column flow completes;
- table splits by row/cell policy, with nested text line ranges for breakable
  rows;
- repeated table headers are generated layout fragments, not duplicated
  authored rows.

Node-specific columns/table implementation remains blocked until text-block
measurement, source-range mapping, editing, and cross-page acceptance pass.

## Inline Identity Direction

The target selection anchor is `{ textBlockId, inlineId, offset, affinity }`.
Detailed operation contracts remain a later phase, but they must preserve these
directions:

- editing text in one leaf preserves that leaf identity when possible;
- splitting retains the left identity and allocates a new right identity;
- merging retains a deterministic surviving identity;
- field references, inline images, line breaks, and page numbers are atomic;
- duplicate allocates new authored node and inline identities;
- layout splitting allocates no authored identity.

Production collaboration-safe allocation remains deferred. The current
revision-gated duplicate suffix policy is retained only as a package-local
operation policy, not a collaboration claim.

## Media Boundary

Block and inline image placements own source reference, frame/crop, alignment,
and accessibility facts. The package image asset registry owns immutable asset
manifest identity and metadata. Backend storage owns locators and bytes.
Duplicate creates placement identity while sharing asset or image-field
references.

## Transaction And History Direction

Browser events are not history entries. Text typing, IME composition, atomic
inline insertion/removal, style changes, and structural commands become bounded
user-intent transactions. Backend revision advances on accepted commits, not
on layout reflow or every DOM event. Exact coalescing and commit timing remain
text-block phase decisions.

## Readiness Matrix Axes

Every v4 node family must receive evidence-backed `PASS`, `PARTIAL`, `BLOCKED`,
or `UNKNOWN` status for:

- schema and reference validation;
- allowed parents and zone-role constraints;
- read projection;
- delete, duplicate, and reorder;
- node-specific editing;
- transaction/history behavior;
- measured pagination and split policy;
- renderer consumption and export readiness;
- editor UX and stale apply;
- backend persistence/revision behavior;
- fixtures, scale evidence, risks, and unknowns.

No aggregate `ready` state may hide a blocked axis.

## PASS

- Authored, field, interaction, layout, published, and artifact truths remain
  separable.
- Text-block is an explicit dependency gate for columns/table semantics.
- Field drift is explicit and cannot rewrite a template silently.
- Media placement and asset ownership remain separate.
- The current v4 node vocabulary and containment baseline are aligned with the
  target schema.

## FAIL / BLOCKER

- Text-block grammar/identity details, transactions, measured line packets, and
  cross-page editing acceptance are not implemented by this phase.
- Columns/table v4 split planners remain blocked on text-block acceptance.
- Published template version workflow and field-drift UI are not implemented.

## RISK

- Inline identity decisions can constrain future annotations and collaboration.
- Field snapshots can drift from external catalogs without explicit diagnostics.
- Large nested containers can amplify layout invalidation and memory cost.

## UNKNOWN

- Empty text-block canonical representation.
- Exact selection affinity and text-leaf merge rules.
- Typing coalescing and commit timing.
- Production collaboration identity allocation.

## Intentionally Not Changed

- package/document schemas and parsers;
- v4 operation semantics and capability reporting;
- editor DOM, draft, selection, or rendering code;
- backend API, publish workflow, version storage, or field catalog service;
- measured pagination, renderer, export, or artifact execution.

## Next Recommended Direction

Close-audit v4 delete, duplicate, and reorder across the current node/parent
matrix, then publish the evidence-backed node-family readiness matrix.
