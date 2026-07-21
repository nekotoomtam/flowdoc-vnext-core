# Live Draft MR1 Intra-TextBlock Incremental Reflow Analysis

Status: accepted as a bounded full-layout-oracle analysis slice on 2026-07-21.
Actual incremental shaping, incremental Core acceptance, product binding, and
production remain NO-GO.

## Outcome

The long-block cost is now measured by stage instead of being represented by
one total. The text-engine package also exposes a deterministic, timing-free
checkpoint/reconvergence analysis contract. That contract can prove how much
line geometry a future incremental implementation could reuse, but it cannot
publish layout: every accepted analysis in this slice is checked against a
complete accepted MR1 layout oracle.

The real Chrome Worker fixture contains 4,959 UTF-16 units, five source runs,
three effective shaping runs, mixed 12/18 pt Regular/Bold styles, one resolved
field, 4,319 shaped clusters, 1,121 break opportunities, and 124 accepted
lines. It executes edits near the start, middle, end, a line boundary, a page
boundary, a Text Run style boundary, and a resolved-field boundary.

Six edits prove a bounded window with exact integer geometry. Start, middle,
and line-edge edits reconverge after two reflowed lines; the page-edge and
field-adjacent edits reconverge after three; the style-boundary edit expands
to ten lines / 280 UTF-16 units before reconverging. An edit near the final
line correctly falls back because two stable suffix lines do not remain.
Hard-break and deliberately oversized edits also fall back.

## Diagnostic timing

The retained real-Chrome run records 90 complete MR1 layouts. Observed
p50/p95 values were 192.7/323.9 ms for a complete long-block layout. The
stage p50 values were:

| Stage | p50 |
|---|---:|
| input and style resolution | 0.3 ms |
| Rustybuzz shaping | 17.3 ms |
| ICU4X segmentation and normalization | 43.8 ms |
| break filtering and line selection | 12.3 ms |
| Core acceptance and Core fingerprinting | 90.2 ms |
| external adapter fingerprinting | 23.3 ms |

The Editor advisory token-impact pass observed 1.4/3.3 ms p50/p95. The oracle
analysis itself observed 27.4/42.5 ms because this QA proof deliberately
re-hashes and compares the complete remaining suffix. Those suffix comparisons
must become precomputed checkpoint fingerprints before runtime activation.

These timings are diagnostic observations from one machine, not product
budgets. The earlier XR5 23.1 ms warm observation was a cache-hit path that did
not invoke the measurement provider. This fixture intentionally executes full
MR1 shaping, segmentation, Core acceptance, and both fingerprint layers on
every sample, so the two numbers describe different work.

## Checkpoint contract

`analyzeFlowDocTextEngineIncrementalReflowV1` applies these rules:

1. The edit must be one exact UTF-16-safe replacement that reconstructs the
   next oracle text.
2. Width, declared line height, fixed-point policy, paragraph style, pinned
   font faces, layout identity, and measurement profile must remain compatible.
3. A hard-break edit falls back in this first contract.
4. Reflow restarts one accepted line before the edited line, bounded at line
   zero. This retains the incoming line-width state needed by a later executor.
5. Reconvergence needs two consecutive semantic line matches after offset
   adjustment, followed by an oracle comparison of the complete remaining
   suffix.
6. A proposed window is limited to 32 next lines and 2,048 UTF-16 units.
7. Line comparison includes text, exact integer width/height/baseline facts,
   fragment positions and advances, resolved styles/fonts, and normalized
   source segments. It ignores regenerated ids, absolute offsets, and vertical
   indices that a future assembler must rebuild from the new snapshot.
8. Missing evidence, changed context, a prefix mismatch, absent
   reconvergence, or an oversized window returns `fallback-required`.

The output says `execution: full-layout-oracle-analysis-only` and
`mayPublishLayout: false`. Timing values are produced by a separate diagnostic
profile and never enter deterministic layout or checkpoint fingerprints.

## Why this is not the fast path yet

The current Rust/WASM boundary still receives the complete text of each
effective run and the complete TextBlock for segmentation. Core still validates
and fingerprints the complete request and accepted layout. Therefore this
slice proves restart/reconvergence semantics but performs no partial shaping,
partial segmentation, incremental Core acceptance, or suffix publication.

The next implementation slice should:

1. add a versioned range-shaping result with explicit pre/post context and
   global UTF-16 mapping;
2. define bounded segmentation context and prove its break facts against the
   full ICU4X oracle;
3. retain prefix/suffix clusters plus precomputed line-checkpoint fingerprints;
4. rebuild only the affected line window, then feed a dedicated incremental
   Core acceptance boundary;
5. reuse retained Core fingerprints structurally instead of hashing the full
   object twice; and
6. keep full-layout fallback for end-of-block, hard-break, context, policy,
   window, and reconvergence failures.

No Table, column, image, repeated-header, auto-fit-width, Backend/API, or
product Editor behavior changes in this slice.

## Evidence

- `packages/text-engine-rust-wasm/src/multiRunLayout.ts`
- `packages/text-engine-rust-wasm/src/multiRunLayoutContract.ts`
- `packages/text-engine-rust-wasm/src/incrementalReflowAnalysis.ts`
- `tests/textEngineMultiRunLayoutV1.test.ts`
- `../flowdoc-vnext-editor/docs/LIVE_DRAFT_MR1_INCREMENTAL_REFLOW_ANALYSIS.md`
- `../flowdoc-vnext-editor/src/fixtures/live-draft-mr1-incremental-reflow-analysis.v1.json`
