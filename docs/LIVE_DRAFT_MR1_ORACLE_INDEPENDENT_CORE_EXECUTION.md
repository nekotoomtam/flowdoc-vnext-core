# Live Draft MR1 Oracle-Independent Core Execution

Status: accepted as a bounded MR1-N actual-WASM/Core QA checkpoint on
2026-07-21. Complete shape/segmentation oracle removal, product publication,
and production remain NO-GO.

## Outcome

The external text-engine adapter can now execute the retained MR1 edit plan,
splice the next shaping and break facts, independently assemble the complete
next line ranges, build the complete next Core request, and call the MR1-M Core
incremental acceptance boundary without receiving a complete next Core layout
as an input.

The complete layout is now optional and used only after incremental acceptance
for QA comparison. Omitting it leaves `fullLayoutOracleFingerprint: null` and
still produces an accepted incremental Core composition. Every result continues
to report `mayPublishLayout: false`.

## Paired retained snapshots

Creating an external retained snapshot now also creates the matching Core-owned
incremental snapshot once. The association is kept in a process-local `WeakMap`;
it is not serialized into the external snapshot fingerprint and cannot be
recovered by cloning, transfer, or hydration.

This preserves both boundaries:

- the external snapshot owns runtime, font, range-plan, cluster, break, and
  line-checkpoint evidence; and
- the Core snapshot owns accepted layout provenance, semantic identity, affected
  positioning, and compositional fingerprints.

Snapshot creation still verifies the complete accepted Core layout once. That
cost and duplicate active-snapshot memory remain explicit risks.

## Oracle-independent line assembly

`assembleFlowDocTextEngineIncrementalAffectedLinesV1(...)` consumes only the
retained snapshot, reproduced plan, next measurement, spliced shaping runs,
spliced break offsets, and bounded line policy.

It:

1. verifies the unchanged restart boundary and semantic prefix;
2. derives line widths from exact integer cluster advances at accepted breaks;
3. requires two shifted stable line ranges after the edit;
4. compares normalized previous/next suffix source, text, cluster, style, and
   advance semantics under the Core-owned semantic-range definition;
5. composes retained prefix, new affected lines, and shifted suffix line ranges;
   and
6. validates complete indexed coverage at break and cluster boundaries.

It does not read a next positioned line, next Core fingerprint, or next layout
summary. The retained suffix line checkpoint is carried forward only after the
normalized semantic range matches.

## Adapter-to-Core execution

`executeFlowDocTextEngineIncrementalCorePlanV1(...)` reproduces the immutable
plan before engine work, executes the existing contextual range facts, splices
clusters and breaks, runs the oracle-independent line assembly, constructs the
next `VNextTextBlockMultiRunLayoutRequestV1`, and calls
`acceptVNextTextBlockMultiRunIncrementalWindowV1(...)`.

The accepted output contains:

- the independently assembled complete Core request;
- bounded range evidence and splice work facts;
- retained/new/shifted affected-line evidence;
- the Core incremental composition with newly positioned affected fragments;
  and
- optional QA parity facts when a complete oracle was supplied.

An optional oracle must have an exactly equal independently assembled request.
Only then does the QA materializer regenerate the complete physical layout and
require exact equality with the oracle. A divergent optional oracle fails
closed and cannot influence request construction or reconvergence.

## Diagnostic timing

`profileFlowDocTextEngineIncrementalCorePlanV1(...)` records these phases without
putting timing into any deterministic fingerprint:

- plan and snapshot validation;
- range engine facts;
- cluster and break splice;
- affected-line assembly;
- Core incremental acceptance;
- optional full-oracle QA; and
- result assembly and fingerprinting.

One warm Vitest/Windows diagnostic sample over the 4,959-unit insertion row
observed 705.6 ms with optional QA enabled: 4.3 ms plan/snapshot, 111.5 ms range
facts, 22.5 ms splice, 147.6 ms affected-line assembly, 187.3 ms Core
incremental acceptance, 212.9 ms optional QA, and 19.6 ms result/fingerprint.
The phase subtotal excluding optional QA was about 492.7 ms.

This is one observational host sample, not p50/p95, a browser result, or an
accepted budget. It proves that removing the full layout input alone does not
make the path interaction-ready. Whole-suffix semantic hashing in both line
assembly and Core acceptance is now a larger measured target than the splice,
and must not be hidden behind a successful correctness claim.

## Evidence

The actual MR1-range WASM fixture proves the no-layout-oracle path for a Thai
insertion. The independently assembled request exactly equals the complete
oracle request even though the oracle was not passed to execution.

Optional-QA execution proves complete request and materialized Core-layout
equality for:

- Thai insertion;
- replacement inside the 18 pt Bold run;
- insertion adjacent to a retained resolved field; and
- deletion with a negative offset delta.

The path also fails closed for altered plans and range facts inherited from
MR1-L, an inconsistent optional oracle, and an undersized affected-line window.
Timing remains diagnostic-only with `numericBudgetAccepted: false`.

## Next checkpoint

The next bounded checkpoint should replace repeated complete semantic-range
hashing with Core-owned compositional prefix/suffix checkpoints that can be
verified from retained chains plus the affected boundary. It should avoid
scanning and hashing the same suffix independently in the adapter and Core,
then remeasure the seven MR1-N stages before attempting to remove the remaining
complete shape/segmentation oracles.

Tables, columns, images, repeated headers, auto-fit column width, Editor product
binding, IME/caret/selection, whole-document publication, Backend/API
activation, and production remain outside this checkpoint.

## Files

- `src/layout/textBlockMultiRunSemanticV1.ts`
- `packages/text-engine-rust-wasm/src/incrementalRetainedSnapshot.ts`
- `packages/text-engine-rust-wasm/src/incrementalAffectedLineAssembly.ts`
- `packages/text-engine-rust-wasm/src/incrementalCoreExecution.ts`
- `tests/textEngineIncrementalRangeExecutionV1.test.ts`
