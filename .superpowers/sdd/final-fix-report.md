# Phase 2 Final Whole-Branch Fix Report

## Status

All five findings in `.superpowers/sdd/final-fix-brief.md` are fixed from base
`8306a7d8fde972d719512a82cc1ff78042ab50ef`. The Phase 2 foundation remains
Core/MR1 QA-only: Editor, Backend, publication, production, Phase 3 spatial
wrapping, image/list/empty/container geometry, and Document v4/layout-unit work
were not started.

## Implemented Fixes

1. Persistent updates locate affected leaves by cumulative subtree summaries.
   Reused identities are counted when untouched subtrees are returned; created
   identities are recorded during leaf/branch construction. Production update
   code no longer flattens either tree or recursively validates the completed
   tree. Created canonical bytes sum each created node exactly once from shallow
   local facts; branch children are represented only by ordered fingerprints.
2. Derived trees retain Core-owned per-line facts and mutable process-local
   checkpoint sidecars. A missing suffix checkpoint folds only to the nearest
   known anchor, caches the result, and reports the deterministic logical fold
   count. Chained updates now accept far before the prior restart and after the
   prior reconvergence.
3. Range projection validates complete source/run topology, atomic run-kind
   facts, safe UTF-16 endpoints, shaping/font topology, canonical clusters,
   advances, gaps, overlaps, and coverage before projection. The public update
   boundary catches cyclic, unsupported, nonfinite, or structurally unreadable
   values and returns a structured block. Tree/update fingerprints use shallow
   envelopes rooted in Core-owned fingerprints rather than recursive trees.
4. The three unrelated 15-second timeout edits were reverted. Exactly three
   5,000-cluster Phase 2 update tests retain task-local 30-second budgets; no
   global Vitest timeout was added.
5. Accepted semantic checkpoint proof facts, their compositional fingerprint,
   and inspection now bind the exact accepted persistent-flow update fingerprint
   and resulting tree fingerprint.

## Files

- Core contracts/implementation:
  `src/layout/textBlockPersistentFlowContractV1.ts`,
  `src/layout/textBlockPersistentFlowTreeInternalsV1.ts`,
  `src/layout/textBlockPersistentFlowUpdateV1.ts`, and
  `src/layout/textBlockMultiRunIncrementalSemanticCheckpointV1.ts`.
- Focused fixtures/tests:
  `tests/helpers/textBlockPersistentFlowV1.ts`,
  `tests/textBlockPersistentFlowUpdateV1.test.ts`,
  `tests/textEngineIncrementalRangeExecutionV1.test.ts`, and
  `tests/liveDraftMr1PersistentFlowFoundation.test.ts`.
- Timeout reverts:
  `tests/activeTextBlockIsland.test.ts`,
  `tests/textEngineWasmToolchainProvisioningExecutionGate.test.ts`, and
  `tests/textEngineWasmToolchainRustUpgradeExecutionGate.test.ts`.
- Evidence:
  `docs/LIVE_DRAFT_MR1_PERSISTENT_FLOW_FOUNDATION.md`,
  `docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md`, and
  `docs/PHASE_LEDGER.md`.

The approved specification, implementation plan, and
`.superpowers/sdd/progress.md` were not edited.

## TDD Evidence

- Baseline focused gate before the fix: 5 files / 18 tests passed.
- RED command:
  `npx vitest run tests/textBlockPersistentFlowUpdateV1.test.ts tests/liveDraftMr1PersistentFlowFoundation.test.ts`.
  Result: 2 files failed; 6 tests failed and 5 passed. The failures independently
  exposed recursive created-byte accounting, non-arbitrary chained checkpoints,
  malformed projection acceptance, a thrown nonfinite canonical value, missing
  proof update/tree fingerprints, and the out-of-scope timeout edits.
- Focused GREEN: 7 files / 33 tests passed, covering the tree/update contract,
  multi-level boundary split, arbitrary checkpoint positions, malformed/public
  boundaries, semantic window/proof, actual-WASM incremental execution, and
  handoff/ledger guards.
- Reverted-timeout GREEN: 3 files / 22 tests passed under their default timeout
  behavior.

## Fresh Actual-WASM Evidence

All rows start from 21 items / 3 leaves / 4 nodes. Lookup visits, path-copy
visits, and prior suffix folds are 4 / 4 / 0 in every row.

| Family | Replaced/projected UTF-16 | Reused/created nodes | Shallow created bytes | Affected/stable lines |
| --- | --- | --- | --- | --- |
| Thai insertion | 81/82 | 2/3 | 396,752 | 2/2 |
| 18 pt Bold replacement | 54/54 | 2/3 | 424,002 | 2/2 |
| field-adjacent insertion | 124/125 | 2/2 | 395,730 | 3/2 |
| deletion | 81/80 | 2/3 | 396,174 | 2/2 |

Every row retains `completeTreeRebuildCount: 0`,
`completeSemanticPassCount: 0`, and `completeNextSemanticPassCount: 0`.

## Verification

- `npm run type-check`: passed.
- `git diff --check`: passed.
- Canonical `npm run check`: 412 files / 2,047 tests passed, including its
  type-check. The canonical command was run once for this final fix wave and
  completed without timeout or semantic failure.

## Self-Review

- Confirmed production update code contains no complete leaf/node collection or
  recursive tree-structure scan; QA traversal remains test-only.
- Confirmed `reusedNodeCount + createdNodeCount === nextNodeCount` in the
  multi-level and actual-WASM evidence, with object-identity reuse and a one-leaf
  boundary split.
- Confirmed checkpoint fold accounting is positive for far-before reconvergence,
  zero for an existing post-reconvergence anchor, and deterministic after cache
  warm-up by carrying the logical anchor distance.
- Confirmed canonical binding fingerprints are validated before the resulting
  tree/update are registered, and public update failures remain structured.
- Confirmed semantic proof inequality coverage produces different update, tree,
  and proof fingerprints for different accepted next facts.
- Confirmed only the three named Phase 2 stress tests retain explicit budgets;
  the three unrelated files and global config retain default behavior.
- Confirmed historical `completeNextSemanticPassCount: 1` evidence remains in
  its historical MR1-P section while active MR1-Q pointers remain Phase 3-only.
- Confirmed `git diff --check` is clean and no unrelated user changes were
  overwritten.

## Remaining Risks And Concerns

- No unresolved concern blocks this fix wave.
- Complete next-request validation and complete shaping/break/line arrays remain
  in the external path; this fix does not claim an interaction budget.
- Lazy checkpoint caches and proof/tree authority remain process-local. A future
  persisted or cross-process contract needs separate provenance evidence.
- Product-scale retained memory, snapshot rotation, scheduling, rendering, and
  spatial reconvergence remain unmeasured or later-phase work.
