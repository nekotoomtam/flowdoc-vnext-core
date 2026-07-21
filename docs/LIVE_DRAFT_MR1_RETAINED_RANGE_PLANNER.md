# Live Draft MR1 Retained Snapshot And Edit-Range Planner

Status: accepted as a deterministic external-adapter contract and focused Core
test slice on 2026-07-21. It does not execute the engine, assemble lines, call
incremental Core acceptance, bind the Editor product path, or publish layout.

## Outcome

The first two MR1-K items are now executable:

1. an accepted complete MR1 TextBlock layout can be converted into one
   immutable process-local retained snapshot; and
2. one exact insert/delete/replace can be converted into a fail-closed initial
   range plan without running Rustybuzz, ICU4X, line breaking, or Core layout.

The implementation remains in `packages/text-engine-rust-wasm`. Core continues
to own accepted geometry contracts and does not import the external adapter.

## Retained snapshot

`createFlowDocTextEngineIncrementalRetainedSnapshotV1(...)` consumes only an
already accepted complete external/Core layout and an exact MR1-range runtime
identity. It retains:

- the complete measurement and source-run topology;
- pinned font faces and break opportunities;
- accepted shaping runs, global UTF-16 clusters, and integer advances;
- accepted positioned lines, fragments, source segments, and Core
  fingerprints;
- one line checkpoint per accepted line; and
- the accepted adapter/Core layout fingerprints and layout-context
  fingerprint.

Each line checkpoint contains its cluster cursor range, the exact Core line
fingerprint, a normalized semantic-line fingerprint, an exact prefix-layout
hash chain, and a normalized suffix-semantic hash chain. The prefix chain is
for unchanged-prefix proof. The suffix chain is independent of absolute line
index, global text offset, and vertical translation, so a later line assembler
can test semantic reconvergence after an edit offset/height delta.

The snapshot also pins the MR1-range artifact/boundary, Rustybuzz revision,
ICU4X code/data revisions, measurement profile, font digests, and
`preserve-code-point-sequence-v1` Unicode policy. Runtime reuse requires that
identity to match exactly.

The complete snapshot is fingerprinted once, recursively frozen, and registered
as a process-local retained object. The planner checks that provenance in
constant time and does not reserialize or rehash the complete retained layout
for every edit. A cloned, transferred, hydrated, or modified object is not
silently trusted by this first contract; a later hydration contract would need
its own complete validation boundary.

## Edit-range planner

`planFlowDocTextEngineIncrementalEditRangeV1(...)` accepts the retained
snapshot, the same current runtime identity, the next measurement, one exact
edit packet, and a bounded policy. It validates that the edit reconstructs the
next code-point sequence and that document/TextBlock identity, width, style,
measurement profile, source-run topology, and revision remain compatible.

The first accepted path requires exactly one changed `text` source run. It can
handle insertion, deletion, replacement, Regular/Bold runs, mixed font sizes,
and edits immediately adjacent to a retained resolved field when the field and
run topology remain unchanged.

The planner then:

1. maps the changed source run to exactly one retained effective shaping run;
2. surrounds the edit with accepted line-break/cluster-safe boundaries plus
   one retained break on each side;
3. projects the range through the edit offset delta;
4. emits global and shaping-run-local UTF-16 offsets;
5. adds 32-unit initial shaping and segmentation contexts at safe scalar
   boundaries;
6. selects the affected previous line and a one-line-lookbehind restart
   checkpoint; and
7. reports retained prefix/suffix cluster counts without executing layout.

The default initial range is capped at 512 UTF-16 units. This plan is only an
input for the next range-engine/assembler slice. New range glyphs and bounded
breaks must still pass their existing exact oracle/fallback contracts.

## Fail-closed scope

The planner returns `fallback-required` for:

- an unregistered/mutated snapshot or runtime-identity drift;
- invalid Unicode scalar offsets or an edit that does not reconstruct the next
  text exactly;
- document, TextBlock, width, profile, style, or revision incompatibility;
- inserted/removed hard breaks;
- changed run count, identity, kind, field, or local style topology;
- more than one changed source run;
- direct resolved-field or other non-text-run edits;
- ambiguous effective shaping-run ownership;
- absent safe retained break boundaries; or
- an initial range beyond the configured bound.

Fallback is a planning result, not an error recovery that weakens exactness.

## Evidence and remaining gate

Focused tests retain deterministic snapshot creation, prefix/suffix chains,
deep immutability, insertion/deletion/replacement, Regular/Bold and mixed-size
runs, field adjacency, valid emoji insertion, surrogate-splitting rejection,
snapshot mutation, runtime drift, style topology changes, field edits, hard
breaks, and oversized-range fallback. The earlier oracle-only reflow analysis
retains identical fingerprints after its semantic-line helper was shared with
the snapshot contract.

No performance budget is claimed in this slice. In particular, the planner
still validates one complete next measurement/edit relationship; the important
lock here is that it does not hash the retained complete layout per edit.

The next checkpoint should execute the planned contextual shaping and bounded
segmentation ranges, splice retained prefix/new/suffix cluster facts, and build
lines from the retained restart checkpoint until the suffix-semantic chain
reconverges. It must remain QA-oracle-only and must not add incremental Core
publication yet.

## Files

- `packages/text-engine-rust-wasm/src/incrementalLineCheckpoint.ts`
- `packages/text-engine-rust-wasm/src/incrementalRetainedSnapshot.ts`
- `packages/text-engine-rust-wasm/src/incrementalEditRangePlanner.ts`
- `packages/text-engine-rust-wasm/src/incrementalReflowAnalysis.ts`
- `tests/textEngineIncrementalRetainedPlanV1.test.ts`
- `docs/LIVE_DRAFT_MR1_CONTEXTUAL_RANGE_FACTS.md`
