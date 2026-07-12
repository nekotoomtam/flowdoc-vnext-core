# TOC V4 Semantic Lane Readiness Close Audit

Status: Phase 341 close audit.

## Outcome

The TOC v4 semantic lane is ready as a pure derived read model over canonical,
structure-valid document v4 authored content. Core can collect body-flow
heading sources in deterministic nested structural order, build per-TOC
generated entries, retain authored-preview field dependencies, compare two
plans, and report exact semantic and downstream invalidation impact.

This closes semantic readiness only. It does not claim measured TOC rows,
pagination convergence, final v4 page references, renderer commands, TOC
authoring operations, backend persistence, or editor UI.

## PASS

- Input is parsed as canonical document v4 and must pass the existing v4
  structure validator before semantic collection.
- Heading sources are reachable heading-role Text-blocks in body zones only;
  header and footer heading roles are excluded.
- Traversal follows section, zone, and depth-first child-array order across
  Columns and Table containers instead of node-map insertion order.
- TOC nodes are restricted to body zones for the accepted semantic profile.
- Every TOC applies its own `maxLevel`, defaulting to six, over the same ordered
  document-wide heading source set.
- Generated entry identity is the composite `{ tocNodeId, headingNodeId }`;
  core does not manufacture or persist a concatenated authored node id.
- Entries retain source and TOC ordinals, section/body-zone ownership, level,
  authored-preview label, field dependencies, and pending page-reference facts.
- Text and line-break content is normalized deterministically. Field refs use
  authored label/fallback/key and remain marked for later materialization.
- Inline images and page-number atomics do not pretend to be authored heading
  text. Empty labels remain entries and produce per-TOC warnings.
- Output is JSON-safe, source-immutable, and byte-identical across repeated
  collection.
- Semantic comparison reports added, removed, moved, level-changed,
  label-changed, and field-dependency-changed entries with exact affected TOC
  and heading ids.
- Unchanged comparison emits no measurement, pagination, renderer, or
  page-reference invalidation.
- Changed comparison recommends affected TOC measurement plus pagination,
  renderer, and page-reference refresh without executing any lane.
- A 1,000-heading fixture produces exactly 1,002 node visits and 1,000 entry
  builds with byte-stable output and immutable source.
- One changed label among 1,000 headings reports one affected heading and its
  one TOC without false movement or structural change.

## FAIL / BLOCKER

None for the bounded document-wide, body-flow TOC v4 semantic profile.

Exact visual TOC output remains blocked until a later measurement contract
defines row geometry, indentation, leader/page-number columns, overflow, and
fixed-width page-number behavior before pagination consumes generated rows.

## RISK

- Structural reading order inside Columns is deterministic but may differ from
  future geometry-aware reading order for advanced non-linear layouts.
- Explicit heading roles inside Table cells are included. Products that used
  heading semantics only for visual styling may see unexpected entries.
- Field-backed headings expose authored preview labels until materialization
  supplies runtime values.
- One semantic plan contains one entry per accepted heading per TOC; many TOCs
  necessarily multiply output and comparison size.
- Comparison consumes complete before/after semantic plans. It does not yet
  incrementally collect only a changed subtree.
- Semantic fingerprints use exact JSON order and should not be normalized by
  consumers before equality checks.

## UNKNOWN

- Minimum-level, section-local, explicit-source, or exclusion filter schema.
- Heading `includeInToc` and TOC label-override semantics.
- Numbering-prefix ownership and style-catalog relationship.
- Final materialized label contract for field-backed headings.
- Geometry-aware reading order for future freeform or wrapped layouts.
- Product policy for empty heading labels beyond the core warning.

## Files Changed

- Architecture: `docs/TOC_V4_SEMANTIC_LANE_ARCHITECTURE_LOCK.md`.
- Semantic collection and generated entries: `src/toc/tocV4Semantic.ts`.
- Exact plan comparison and invalidation: `src/toc/tocV4SemanticImpact.ts`.
- Public exports, repository phase trail, focused contract/impact tests, and
  1,000-heading scale evidence.

## Behavior Changed

- Core now exposes a canonical v4 TOC semantic plan rather than requiring
  consumers to scan node maps or reuse the document v3 final-page resolver.
- TOC configuration and generated entries are separate; derived entries do not
  become authored Text-block children or persisted document nodes.
- Field-backed authored preview labels are explicit dependencies rather than
  silently treated as final runtime values.
- Consumers can distinguish semantic rebuild, materialized-label refresh,
  page-reference refresh, and presentation-only invalidation.

## Tests Run

- Core before this document: type-check and 269 test files / 1,397 tests.
- Final core: type-check and 270 test files / 1,399 tests.
- Editor: type-check, 27 test files / 157 tests, and production build.
- Backend: type-check, 13 test files / 45 tests, and build.

## Risks Left

- Fixed-width page-number column and TOC row measurement remain core layout
  work before pagination feedback can be closed.
- Final v4 heading-to-page resolution and renderer consumption remain future
  lanes.
- TOC authoring commands, policy actions, confirmation/history, and UI remain
  separate authoring work.
- Materialized field label resolution and durable document generation remain
  generation/backend work.

## Intentionally Not Changed

- canonical document v4 TOC, Text-block, heading, field-ref, or style schemas;
- document v3 final TOC/page resolution boundary;
- Text-block rich-inline authoring and field registry contracts;
- measurement, pagination, renderer, PDF, or DOCX execution;
- TOC insert/delete/configuration operations and structure policy actions;
- backend transport, revision, storage, jobs, and history;
- editor state, outline, toolbar, canvas, or generated-entry presentation.

## Next Recommended Direction

Move to the TOC v4 measurement lane. Lock generated row geometry, level
indentation, label wrapping, leader behavior, fixed-width page-number column,
title participation, overflow, and deterministic measurement input before
connecting semantic entries to pagination or final page-reference output.
