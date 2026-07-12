# Columns V4 Readiness Close Audit

Status: Phase 289 core-contract close audit.

## Outcome

Columns v4 now has deterministic geometry, canonical document input assembly,
text-fragment consumption, monotonic lane cursors, atomic parallel
reconciliation, depth-three recursion, stable signatures, impact facts, and
bounded 250-page scale evidence. This closes the text-backed independent-flow
core slice and unblocks table row/cell split planning.

It does not make Columns or document v4 fully product-ready. Mixed child
families, concrete measurement execution, mixed document composition,
renderer/export, node-specific authoring operations, backend persistence, and
editor controls remain separate incomplete axes.

## PASS

- Existing `widthShare` values totaling 100 and point gaps produce
  deterministic source-immutable track geometry.
- Minimum usable track width belongs to a versioned planner capability rather
  than canonical authored truth.
- Structure validation accepts acyclic Columns nesting through depth three and
  blocks a fourth level explicitly.
- Accepted v4 text lines become source-retaining child candidates with prefix
  heights, legal checkpoints, keep policy, and deterministic fingerprints.
- Single-lane cursors advance monotonically, preserve legal breakpoints, move
  fitting prefer-together content, split oversized keep content, and block a
  fragment taller than the page body.
- Sibling lanes plan from one snapshot and commit atomically. A Columns
  fragment uses the longest lane height; completed lanes remain empty while
  siblings continue.
- Nested Columns receive exact parent track width and remaining page height,
  retain recursive cursors, and preserve preceding y offsets.
- Canonical `columnIds`/`childIds` are assembled into recursive planner input;
  unsupported child families block instead of receiving guessed layout.
- Input fingerprints and recursive page signatures are deterministic and
  source input remains immutable.
- A depth-three test consumes 6,000 prepared text fragments into 250 pages with
  250 page attempts, 750 lane plans, 500 nested plans, 250 checkpoint lookups,
  and no measurement execution.

## FAIL / BLOCKER

- Image, divider, spacer, TOC, generated content, and table do not yet expose
  accepted v4 child fragment/split contracts for Columns.
- No mixed body-zone composer places blocks before/after Columns using these
  continuation fragments.
- No concrete v4 text engine executes measurement packets in the product
  layout pipeline.
- No v4 renderer/export adapter consumes nested Columns fragments.
- No policy-aware Columns property/track operation exists for document v4.
- Backend/editor capability, persistence, ratio/gap controls, insertion,
  nesting feedback, and stale apply for Columns-specific edits remain absent.
- Page signatures are retained facts; incremental convergence/reuse execution
  is not implemented.

## RISK

- Longest-column completion can intentionally leave substantial blank sibling
  space across many pages.
- Minimum height beginning in a short page remainder still needs mixed-composer
  move/split policy rather than a local guess.
- Complete text-source keep policy is bounded v1 behavior; richer child keep,
  widow/orphan, and keep-with-next rules remain absent.
- Recursive cursor and signature size grows with active nested continuations.
- Text-only scale does not bound table, image, generated-content, renderer, or
  artifact memory.

## UNKNOWN

- Product/renderer-selected minimum track width profiles.
- Family-owned measured contracts for image and utility nodes.
- Mixed-flow incremental convergence and page-reuse thresholds.
- Columns track insertion/removal identity and history policy.
- Editor UX for narrow tracks, depth limits, keep diagnostics, and unfinished
  background layout.

## Files And Evidence

- architecture: `docs/COLUMNS_V4_ARCHITECTURE_LOCK.md`;
- geometry/cursors/impact: `src/pagination/columnsV4Contract.ts`;
- text candidates: `src/pagination/columnsV4Fragments.ts`;
- lane planning: `src/pagination/columnsV4LanePlanner.ts`;
- parallel pagination: `src/pagination/columnsV4Pagination.ts`;
- recursive pagination: `src/pagination/columnsV4NestedPagination.ts`;
- canonical input assembly: `src/pagination/columnsV4InputBuilder.ts`; and
- direct evidence: matching `tests/columnsV4*.test.ts` files.

## Intentionally Not Changed

- active package 2/document 3 pagination and operations;
- document v4 node/property shapes and direct-body-only page breaks;
- text measurement acceptance and isolated text pagination;
- table row/cell semantics;
- renderer, export, artifact, scheduler, backend, and editor execution;
- collaboration, auth, tenancy, or production storage.

## Next Recommended Direction

Define table row/cell fragment planning over the same snapshot, legal
checkpoint, atomic reconciliation, and source-retaining continuation rules.
Keep Columns-specific authoring operations and cross-repo UI integration as a
separate lane after property/history policy is accepted.
