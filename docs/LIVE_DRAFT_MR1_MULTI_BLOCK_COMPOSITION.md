# LIVE-DRAFT-MR1 Multi-Block Composition

Status: accepted as a bounded TextBlock-only Core composition and real Editor
Chrome evidence slice on 2026-07-21. Product binding and production remain
NO-GO.

## Decision

MR1 keeps the existing ownership split while preserving its fixed-point
geometry:

- the external text engine owns shaping, token/word breaks, and accepted line
  candidates;
- Core owns placing those already accepted lines into ordered document pages;
- the renderer consumes Core page placements and cannot measure, relayout, or
  repaginate text.

The existing general document-composition family remains the architectural
reference, but it currently consumes point-valued fragment windows with
0.01-point normalization. MR1 therefore does not route exact micro-point
integers through that rounding boundary. The new adapter is intentionally
bounded to ordered TextBlocks and does not replace or widen the production
composer.

## Core contracts

`composeVNextTextBlockMultiRunDocumentV1` consumes:

- one fixed-point page/body geometry;
- ordered Core-accepted multi-run TextBlock layouts;
- an explicit non-negative inter-block gap;
- dirty TextBlock ids; and
- optionally, the previous accepted document composition.

It emits exact page, block-boundary cursor, and line-placement facts. A line
that does not fit the remaining body height starts on the next page. A line
taller than a complete page body blocks. A gap is applied only between blocks
and is omitted when the next block must start at a fresh page top.

Incremental work is conservative:

1. Core reuses unchanged blocks before the first dirty/mismatched layout.
2. It recomposes from that boundary in source order.
3. Before each later block, it compares the current page/y cursor with the
   previous exact boundary.
4. If that cursor and every remaining block layout fingerprint match, it copies
   the unchanged suffix and stops.

Previous composition fingerprints, layout/line/fragment fingerprints, safe
integer arithmetic, width/height constraints, identity, policy, and production
binding fail closed.

`projectVNextTextBlockMultiRunDocumentDisplayListV1` validates the complete
composition and every accepted layout again. It projects page-indexed line and
fragment commands without shaping, measurement, line breaking, pagination, or
unit conversion before the paint boundary.

When the caller supplies the previous ready display list, unchanged placement
fingerprints reuse its frozen in-process line/command facts and only renumber
paint order. New or moved placements revalidate and project their accepted
layouts. A cloned/cross-runtime previous list is re-fingerprinted before reuse;
a mutated previous list blocks.

## Retained proof

Core focused tests prove:

- a three-block document grows from two pages to three and contracts to two;
- one TextBlock can split across pages with explicit continuation facts;
- a same-height edit at block index 5 reuses five prefix blocks, recomposes one
  block/line, reconverges at block index 6, and reuses four test-fixture suffix
  blocks;
- the 12-block same-height Editor row reuses 11 display lines, projects one,
  and validates only the changed layout;
- a no-change pass reuses the complete document; and
- production binding, unknown dirty ids, over-tall lines, mutated previous
  composition, mutated accepted layout, and mutated placement facts block.

The Editor real-Chrome fixture extends this to 12 TextBlocks. The active block
is close to the first page bottom. Typing grows the document from two to three
pages; deleting contracts it to two. A later same-geometry edit reuses five
prefix blocks, recomposes one block/line, reconverges at block index 6, and
reuses six suffix blocks.

Primary evidence:

- `src/composition/textBlockMultiRunDocumentCompositionV1.ts`;
- `src/renderer/textBlockMultiRunDocumentDisplayListV1.ts`;
- `tests/textBlockMultiRunDocumentCompositionV1.test.ts`;
- `../flowdoc-vnext-editor/docs/LIVE_DRAFT_MR1_MULTI_BLOCK_SCHEDULING.md`; and
- `../flowdoc-vnext-editor/src/fixtures/live-draft-mr1-multi-block-scheduling.v1.json`.

## Scope boundary

This does not bind the product Editor or Backend, replace the production
composer, partially reshape a dirty TextBlock, virtualize a long page stack,
or support tables, columns, images, repeated headers, or auto-fit column width.
Those claims remain separate gates.
