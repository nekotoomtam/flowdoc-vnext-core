# Live Draft MR1 Incremental Core Composition

Status: accepted as a bounded MR1-M Core/WASM QA checkpoint on 2026-07-21.
Oracle-independent adapter execution, product binding, publication, and
production remain NO-GO.

## Outcome

Core now owns a dedicated incremental TextBlock boundary over the line window
proved by MR1-L. The boundary:

1. retains one exact accepted complete Core layout as a deeply frozen,
   process-local snapshot;
2. distinguishes reusable semantic line identity from revision-specific
   shaping-run, fragment, and exact-layout fingerprints;
3. validates the next measurement, shaping facts, break/line coverage, edit,
   fixed layout context, retained prefix, and shifted semantic suffix;
4. positions and fingerprints only the affected lines and fragments;
5. returns deterministic prefix, affected, and suffix references plus their
   exact index, UTF-16 offset, and y-offset transforms; and
6. can materialize those references in a QA-only path and compare the complete
   regenerated Core layout with an independently accepted full oracle.

Every incremental result still reports `mayPublishLayout: false`. Core imports
no WASM, Rust, Worker, browser, Canvas, PDF, or renderer runtime.

## Identity policy

The current external `shapingRunId` includes the run range. A length-changing
edit can therefore change the physical run id and all fragment ids that include
it, even on semantically unchanged prefix lines.

MR1-M keeps that existing contract. It does not pretend those exact ids or
fingerprints are stable across revisions. Instead:

- semantic line facts omit physical run/fragment ids, absolute line/index/y
  placement, and source-local offsets while retaining text, relative ranges,
  source identity, exact fixed-point geometry, and complete style/font facts;
- retained prefix and suffix references reuse only that proved semantic
  geometry;
- affected lines receive new exact physical identities immediately; and
- QA materialization regenerates revision-specific shaping-run, fragment, line,
  and complete-layout fingerprints for all three composed regions.

The external adapter now aliases its semantic-line helper to the Core-owned
implementation, avoiding two definitions of semantic equality.

## Core-owned acceptance

`acceptVNextTextBlockMultiRunIncrementalWindowV1(...)` accepts a Core snapshot,
the complete next Core request assembled from external engine facts, the exact
edit offsets, and the MR1-L restart/reconvergence proof.

It fails closed when any of these conditions is not exact:

- process-local snapshot provenance;
- layout, measurement-profile, fixed-point, paragraph, or pinned-font context;
- advancing instance revision and scalar-safe edit reconstruction;
- source-run coverage and rendered text;
- shaping-run/cluster coverage and safe integer advances;
- break and line coverage at cluster-safe boundaries;
- unchanged prefix ranges and normalized source/shaping semantics;
- shifted suffix ranges, normalized source/shaping semantics, and retained
  suffix checkpoint fingerprint; or
- affected fixed-point positioning, width, baseline, and line-stack arithmetic.

The accepted composition contains only three regions. Prefix and suffix retain
snapshot references plus transforms. Only the affected region contains newly
positioned Core lines. The composition fingerprint covers the snapshot
identity, edit, contracts, references, affected physical lines, semantic
fingerprints, transforms, and work counts. It is intentionally not labeled as
the legacy complete-layout fingerprint.

## QA materialization

`materializeVNextTextBlockMultiRunIncrementalLayoutForQaV1(...)` is a proof
tool, not a product boundary. It derives the next accepted shaping-run facts,
rebinds retained semantic fragments to the next revision's physical run ids,
regenerates source segments and exact fragment/line fingerprints, inserts the
already positioned affected lines, and builds the legacy complete Core layout
fingerprint and summary.

It does not call complete Core acceptance internally. Tests compare its result
with an independently produced complete WASM/Core oracle. The oracle remains
mandatory for this QA checkpoint.

## Evidence

The actual MR1-range WASM fixture retains 4,959 UTF-16 units, five source runs,
three effective shaping runs, 4,319 clusters, 1,121 break opportunities, and
124 accepted lines. Complete composed Core objects match the independent full
Core oracle exactly for:

- Thai insertion;
- replacement inside the 18 pt Bold run;
- insertion adjacent to a retained resolved field; and
- deletion with a negative UTF-16 offset delta.

The comparison includes accepted shaping runs, positioned fragments, source
segments, mixed-size metrics, line geometry, revision-specific physical ids,
all fingerprints, and the complete summary. Cloned snapshots, production
binding, and altered suffix cluster geometry fail closed.

The focused MR1-L/MR1-M actual-WASM test, retained planner tests, and multi-run
layout tests pass together. The repository full gate is recorded in the
handoff commit.

## Performance boundary

MR1-M proves composition semantics, not a typing budget. Acceptance currently
scans complete next shaping, break, line, source, and semantic suffix facts to
fail closed. QA materialization also regenerates a complete layout, and MR1-L
still requires complete shaping, segmentation, and layout oracles before this
boundary is called.

The composition reports reused-prefix, positioned-affected, and reused-suffix
line counts, but no latency threshold is inferred from the focused tests.

## Next checkpoint

The next bounded checkpoint should make the external adapter construct the
complete next Core request from its retained/spliced facts and affected-line
builder without requiring a complete Core layout oracle as an execution input.
It should call the new Core incremental acceptance directly, keep the full
layout only as an optional QA comparison, and record separate stage timings.

Complete shape/segmentation oracle removal, product scheduling, Editor binding,
publication, tables, columns, images, repeated headers, auto-fit column width,
IME/caret/selection, whole-document pagination, and production remain separate
later gates.

## Files

- `src/layout/textBlockMultiRunSemanticV1.ts`
- `src/layout/textBlockMultiRunIncrementalContractV1.ts`
- `src/layout/textBlockMultiRunIncrementalSnapshotV1.ts`
- `src/layout/textBlockMultiRunIncrementalAcceptanceV1.ts`
- `src/layout/textBlockMultiRunIncrementalMaterializeV1.ts`
- `src/layout/textBlockMultiRunDerivationV1.ts`
- `packages/text-engine-rust-wasm/src/incrementalLineCheckpoint.ts`
- `tests/textEngineIncrementalRangeExecutionV1.test.ts`
