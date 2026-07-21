# Live Draft MR1 Compositional Semantic Checkpoints

Status: accepted as a bounded MR1-O actual-WASM/Core QA checkpoint on
2026-07-21. Product binding, publication, production, and complete
shape/segmentation oracle removal remain NO-GO.

Implementation commit: `1b8d5c4`.

## Outcome

The MR1 incremental path no longer rebuilds and hashes complete semantic prefix
and suffix ranges independently in affected-line assembly and Core acceptance.
The retained Core snapshot now owns line-aligned semantic-range fingerprints
and compositional prefix/suffix chains. The external retained snapshot carries
only the paired checkpoints created from that Core snapshot.

Affected-line assembly finds reconvergence from stable line ranges and retained
suffix checkpoints. Core creates a separate process-local semantic proof and
acceptance validates that proof before composing the retained prefix, newly
positioned affected region, and shifted suffix.

The path still accepts no complete next layout as an input. A complete layout
remains optional QA-only evidence and cannot influence request construction or
incremental acceptance. Every accepted result continues to report
`mayPublishLayout: false`.

## Checkpoint model

For each retained line, Core records one semantic-range line fingerprint over:

- the exact rendered text and UTF-16 range;
- cluster boundaries, text, integer advance, style, face, size, color,
  direction, baseline shift, and features; and
- clipped source segments, including inline id, kind, field key, generated
  owner fingerprint, Text Run style, local style, and rendered text.

Core then folds those line fingerprints into forward prefix and reverse suffix
chains. A successful edit proof uses two retained checkpoint lookups, compares
the unchanged prefix and shifted suffix chains, and reports zero complete
semantic-range hashes.

The retained previous request is not rescanned. The current implementation does
one complete pass over the independently assembled next request to build its
line fingerprints and chains. This remaining pass is measured explicitly; it
is not described as bounded affected-range work.

## Trust and fail-closed boundary

The semantic proof is Core-owned and process-local. It is held in a `WeakMap`
binding to the exact retained snapshot and exact next request object. The next
request and proof are recursively frozen before acceptance. Cloned proofs,
cloned snapshots, a different request object, or mutation of proof facts are
rejected.

Core acceptance independently validates the fixed layout context, including
the measurement `styleKey`. Semantic checkpoint facts include generated page
number ownership, so a changed `generatedOwnerFingerprint` cannot reuse a
retained prefix or suffix silently.

Focused evidence also fails closed for:

- altered edit plans and deliberately small affected-line windows;
- range glyph or segmentation drift;
- suffix cluster advance drift;
- source inline-id, generated-owner, or shaping-style drift;
- production binding; and
- optional full-oracle request or materialized-layout divergence.

## Exactness evidence

The actual MR1-range WASM path remains exact against the independent complete
request and QA materialized layout for four edit families:

- Thai insertion;
- replacement inside the 18 pt Bold run;
- insertion adjacent to a retained resolved field; and
- deletion with a negative offset delta.

Revision-specific physical run, fragment, line, and complete-layout ids are
still regenerated. Semantic reuse does not weaken the distinction between
semantic identity and physical identity.

## Diagnostic timing

Twenty-five warm sequential Windows/Vitest samples used the existing
4,959-UTF-16-unit fixture with optional full-oracle QA enabled. Timing is
observational, host-specific, and excluded from deterministic fingerprints.
No numeric budget is accepted.

| Stage | p50 | p95 |
| --- | ---: | ---: |
| Plan and snapshot validation | 1.95 ms | 2.94 ms |
| Range engine facts | 44.39 ms | 50.55 ms |
| Cluster and break splice | 7.97 ms | 9.83 ms |
| Affected-line assembly | 0.70 ms | 1.62 ms |
| Core incremental acceptance | 83.03 ms | 97.34 ms |
| Optional full-oracle QA | 121.93 ms | 151.69 ms |
| Result and fingerprint | 17.78 ms | 23.86 ms |
| Total | 280.76 ms | 312.32 ms |
| Subtotal excluding optional QA | 158.17 ms | 173.85 ms |

The Core stage was profiled separately over the same 25 samples:

| Core subphase | p50 | p95 |
| --- | ---: | ---: |
| Semantic checkpoint proof | 59.44 ms | 70.24 ms |
| Acceptance after proof | 21.02 ms | 27.00 ms |

Compared with the earlier single MR1-N warm observation, affected-line
assembly fell from 147.6 ms to a 0.70/1.62 ms p50/p95 distribution and the
subtotal excluding optional QA fell from about 492.7 ms to 158.17/173.85 ms.
Those are not directly comparable distributions and do not establish an
interaction budget. They do show that duplicate prefix/suffix range hashing is
no longer the dominant measured work.

One complete next semantic-line pass now dominates the Core stage. The path is
therefore still not interaction-ready or product-bound.

## Verification

- Focused incremental execution: 4/4 tests passed.
- Full Core gate: 404 test files and 1,922 tests passed.
- TypeScript type-check passed.
- Diff whitespace validation passed.

## Next checkpoint

The next bounded checkpoint should remove
`completeNextSemanticPassCount: 1` without trusting adapter-supplied semantic
digests. Core should compose the next request proof from Core-owned immutable
retained-prefix facts, newly affected facts, and shifted-suffix provenance,
while preserving exact request equality, no complete-layout input, optional
full-oracle QA, and all current fail-closed rows.

Only after that complete next pass no longer dominates should complete
shape/segmentation oracle removal be promoted to the next measured target.

Tables, columns, images, repeated headers, auto-fit column width, Editor
product binding, IME/caret/selection, Backend/API activation, whole-document
publication, default-measurer replacement, and production remain outside this
checkpoint.

## Files

- `src/layout/textBlockMultiRunIncrementalSemanticCheckpointV1.ts`
- `src/layout/textBlockMultiRunSemanticV1.ts`
- `src/layout/textBlockMultiRunIncrementalSnapshotV1.ts`
- `src/layout/textBlockMultiRunIncrementalAcceptanceV1.ts`
- `packages/text-engine-rust-wasm/src/incrementalRetainedSnapshot.ts`
- `packages/text-engine-rust-wasm/src/incrementalAffectedLineAssembly.ts`
- `packages/text-engine-rust-wasm/src/incrementalCoreExecution.ts`
- `tests/textEngineIncrementalRangeExecutionV1.test.ts`
