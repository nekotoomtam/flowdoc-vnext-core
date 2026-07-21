# Live Draft MR1 Range Execution And Affected Lines

Status: accepted as a bounded MR1-L WASM/Core QA checkpoint on 2026-07-21.
Incremental Core acceptance, positioned-fragment assembly, product binding,
publication, and production remain NO-GO.

## Outcome

The retained MR1-K edit-range plan is now executable in one deliberately
oracle-gated path:

1. the separately pinned MR1-range WASM shapes only the planned effective-run
   range with explicit pre/post context;
2. bounded ICU4X segmentation expands only around the planned TextBlock range;
3. both range results are proved exactly against complete shape/segmentation QA
   oracles;
4. retained prefix clusters, new range clusters, and shifted suffix clusters
   are spliced into deterministic shaping-run facts;
5. retained and new break facts are combined only at scalar- and
   cluster-safe boundaries; and
6. line ranges are rebuilt from the one-line-lookbehind checkpoint until two
   stable lines and the normalized suffix-semantic chain reconverge.

The resulting shaping runs, break offsets, and line ranges must equal the
complete WASM/Core layout oracle exactly. Any mismatch returns
`fallback-required`. The result says `mayPublishLayout: false`.

## Range execution

`executeFlowDocTextEngineIncrementalRangePlanV1(...)` first reproduces the
supplied plan from the immutable process-local snapshot and the complete next
measurement. A cloned or altered plan cannot widen the range.

The runtime executes:

- contextual Rustybuzz range shaping for the affected effective run;
- one full affected-run shape as a QA oracle;
- adaptive bounded ICU4X segmentation for the planned global target; and
- one full TextBlock segmentation as a QA oracle.

Pinned font id/metrics, selected/context offsets, missing-glyph count, full
glyph facts, cluster boundaries, and target breaks must all match. Bounded
segmentation defaults to 32-unit context, two stable expansions, and a maximum
512-unit context. Requiring full context or reaching the limit fails closed.

These complete oracle calls are intentional for MR1-L evidence and are not a
typing fast path.

## Cluster and break splice

The splice retains accepted clusters strictly before the previous planned
range, inserts newly scaled integer clusters for the next range, and shifts
accepted suffix clusters by the exact edit offset delta. Shaping runs after the
affected run shift by the same delta. Every run must retain continuous ordered
coverage, pinned style/font facts, and regenerated deterministic range ids.

Break facts retain only offsets outside the replaced range, insert the
oracle-proved bounded target breaks, shift the suffix, retain mandatory hard
breaks, and filter the result against the newly spliced cluster boundaries.

MR1-L still serializes and compares the complete spliced shaping/break arrays
against the complete layout request. Structural sharing and bounded
compositional fingerprints remain later work; no performance budget is claimed
from this QA path.

## Affected line-range assembly

The line builder starts at the MR1-K one-line-lookbehind checkpoint and uses
only spliced integer cluster advances, accepted break opportunities, mandatory
breaks, and the retained fixed-point available width. It does not call a
renderer and does not ask Core to position fragments.

The bounded policy requires:

- two consecutive shifted line-range matches;
- an exact normalized suffix-semantic checkpoint-chain match;
- at most 32 affected lines; and
- at most 2,048 affected UTF-16 units.

The complete Core oracle is used to prove every independently built line range
and the final retained-prefix/new-window/shifted-suffix composition. This is
QA-only line-range assembly, not incremental Core acceptance.

## Prefix fingerprint finding

The real oracle exposed an important identity fact. Current `shapingRunId`
values include the run end offset. An insertion or deletion changes that id for
the whole effective run, so Core fragment and line fingerprints may change on
semantically unchanged prefix lines that reference the run.

MR1-L therefore adds a normalized prefix-semantic checkpoint chain beside the
existing exact prefix-layout chain:

- `prefixLayoutFingerprint` remains the exact within-snapshot identity proof;
- `prefixSemanticFingerprint` proves unchanged cross-revision line semantics
  while ignoring regenerated run/fragment ids; and
- incremental Core acceptance must later decide how revision-specific physical
  ids and reusable semantic geometry compose. MR1-L does not silently treat a
  semantic match as an exact Core fingerprint match.

## Evidence

The focused WASM test uses the retained 4,959 UTF-16 unit fixture with five
source runs, three effective shaping runs, 4,319 clusters, 1,121 break
opportunities, and 124 accepted lines. It proves:

- one Thai insertion near the middle;
- one replacement inside the 18 pt Bold run;
- one insertion immediately before a retained resolved field;
- one deletion with a negative offset delta;
- exact spliced shaping runs, break offsets, and line ranges;
- exact normalized prefix/suffix semantic chains;
- deterministic repeated execution without input mutation; and
- fail-closed altered plans, divergent range glyph facts, segmentation-context
  exhaustion, and an undersized affected-line window.

The focused range, retained-plan, multi-run, and new MR1-L tests pass together
against the actual MR1-range WASM artifact.

## Remaining gate

The next checkpoint should design a dedicated incremental Core acceptance and
compositional fingerprint boundary over the proved line window. It must resolve
the offset-derived shaping-run/fragment identity question explicitly, position
only affected fragments/lines, shift a semantically proved suffix, and compare
the assembled Core result with the full oracle before publication can be
considered.

Tables, columns, images, repeated headers, auto-fit column width, Backend/API,
React input, IME/caret/selection, product binding, and production remain out of
scope.

## Files

- `packages/text-engine-rust-wasm/src/incrementalRangeFactSplice.ts`
- `packages/text-engine-rust-wasm/src/incrementalAffectedLineWindow.ts`
- `packages/text-engine-rust-wasm/src/incrementalRangeExecution.ts`
- `packages/text-engine-rust-wasm/src/incrementalRetainedSnapshot.ts`
- `tests/textEngineIncrementalRangeExecutionV1.test.ts`
