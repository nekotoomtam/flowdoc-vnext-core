# MR1-Q Persistent Flow Tree Foundation

## Status

`MR1-Q Persistent Flow Tree Foundation` is accepted as a bounded Core/MR1 QA
checkpoint. It does not activate product layout. Editor product binding,
Backend binding, publication, and production remain NO-GO. Accepted tree and
incremental results continue to report `mayPublishLayout: false` and
`productionBinding: false`.

## Outcome

Core now exposes a versioned Persistent B+ flow rope with an immutable policy:
at most 256 rendered UTF-16 units per item, eight items per leaf, and eight
children per branch. Flow items and subtree fingerprints are offset-independent,
all leaves have equal depth, and Core owns the canonical Merkle fingerprint
chain. Exact edit proofs path-copy the changed leaf range and structurally reuse
untouched nodes rather than rebuilding the complete tree.

The retained snapshot carries the persistent-tree fingerprint and deterministic
item/leaf/node summary. A bounded line-aligned semantic window proves the stable
suffix from Core-owned fingerprints. The accepted actual-WASM rows report
`completeTreeRebuildCount: 0`, `completeSemanticPassCount: 0`, and
`completeNextSemanticPassCount: 0` while preserving exact optional full-oracle
parity.

That zero removes the complete **next semantic checkpoint pass** only. The
current external execution still assembles and validates a complete next Core
request, and it still carries complete shaping-run, cluster, break-offset, and
line arrays. When a complete layout oracle is supplied, complete-oracle
validation and complete QA materialization also still run; the oracle and
materialization are optional and are absent from the non-QA acceptance path.
Removing those remaining complete-request/array costs is later work, not an
MR1-Q claim.

## Capability Matrix

| Capability | MR1-Q status | Boundary |
| --- | --- | --- |
| text | tree-ready | bounded offset-independent text items reproduce accepted facts |
| mixed Text Runs | tree-ready | source/style identity and shaping advances remain exact across style boundaries |
| resolved fields | tree-ready | resolved value and generated-owner/source identity remain retained |
| generated page numbers | tree-ready | retained as an explicit atomic flow item |
| hard breaks | tree-ready | retained as explicit mandatory-break items; hard-break-only empty layout is still blocked |
| inline image | NO-GO | no accepted line-box/baseline geometry in this tree foundation |
| list and list decoration | NO-GO | list marker, numbering, gap, and indent ownership are not implemented |
| empty block | NO-GO | empty/effectively empty line geometry remains unaccepted |
| positioned objects | not present / NO-GO | no canonical positioned-object contract or spatial index is introduced |
| spatial wrapping | NO-GO | no exclusion geometry or Flow Region Provider is implemented |
| Columns/Table | NO-GO | no container integration is claimed; Table retains grid/width ownership |
| Table auto-fit | NO-GO | intrinsic measurement and auto-fit ownership remain separate later work |
| Editor/Backend/publication/production | NO-GO | no runtime binding, public product activation, publication, or production behavior changes |

## Structural Work Evidence

The accepted 4,959-UTF-16-unit actual-WASM fixture begins with 21 flow items,
3 leaves, and 4 total tree nodes in every row. The counters below were read from
the accepted test results; they are deterministic structural/canonical-byte
counters, not heap samples or performance budgets.

| Actual-WASM edit family | Initial items/leaves/nodes | Replaced previous / projected next UTF-16 | Reused / created nodes | Created canonical bytes | Positioned affected / stable lines | Reconvergence (previous -> next) |
| --- | --- | --- | --- | --- | --- | --- |
| Thai insertion at 2,433 | 21 / 3 / 4 | 81 / 82 | 2 / 3 | 1,663,499 | 2 / 2 | line 63 -> 63; offset 2,472 -> 2,473; delta +1 |
| 18 pt Bold replacement at 1,550 | 21 / 3 / 4 | 54 / 54 | 2 / 3 | 1,690,457 | 2 / 2 | line 39 -> 39; offset 1,556 -> 1,556; delta 0 |
| field-adjacent insertion at 2,356 | 21 / 3 / 4 | 124 / 125 | 2 / 2 | 1,661,601 | 3 / 2 | line 62 -> 62; offset 2,432 -> 2,433; delta +1 |
| deletion at 2,433 | 21 / 3 / 4 | 81 / 80 | 2 / 3 | 1,662,343 | 2 / 2 | line 63 -> 63; offset 2,472 -> 2,471; delta -1 |

Each row records one reconvergence candidate, zero complete semantic-range
comparisons, zero complete previous/next semantic passes, and an exact match
between the previous and next suffix semantic fingerprints. The accepted rows
reuse 37/59/61 prefix lines and 85/62/61 suffix lines according to edit
position; only 2 or 3 affected lines are positioned again.

Host timing and heap observations remain diagnostic only. No frame, latency,
retained-memory, or product interaction budget is accepted by MR1-Q, and the
canonical byte counts above must not be read as live heap usage.

## Feedback Lane Compatibility

`stagedCoverageCompatible: true` means only that the immutable tree preserves
stable ordered identity, structural sharing, and resumable range references
that a later coverage contract can bind. It does not implement Editor staged
apply/state, viewport scheduling, current/off-screen presentation, or a product
coverage result. `stagedEditorApply: false` remains authoritative. Design B1 is
compatibility evidence only, not Editor implementation.

## PASS

- Policy constants, offset-independent items, balanced equal leaf depth,
  Core-owned Merkle fingerprints, and recursively frozen process-local trees are
  accepted.
- Exact path-copy updates reuse untouched nodes and reject cloned provenance,
  stale revision, context drift, topology drift, and invalid reconvergence.
- Text, mixed Text Runs, resolved fields, generated page numbers, and hard
  breaks are represented in the tree without changing accepted MR1 facts.
- Bounded semantic-window proof and incremental acceptance both report
  `completeNextSemanticPassCount: 0` for the four actual-WASM edit families.
- Complete next layout input is not required. Optional QA materialization
  remains exact when a full oracle is supplied.
- Retained snapshots expose deterministic tree item/leaf/node summaries without
  granting serialization, publication, or product authority.

## FAIL / BLOCKER

- Complete next-request validation and complete shaping-run, cluster,
  break-offset, and line arrays remain in the external execution path; replacing
  them with equally strong bounded work is later work.
- Complete layout-oracle validation and complete layout materialization remain
  available only as optional QA work; they are not a production result.
- Inline image geometry, list decoration, empty-block layout, positioned
  objects, spatial wrapping, Columns/Table integration, and Table auto-fit are
  blocked or not present.
- Editor product binding is NO-GO. No Editor staged apply/state, Backend binding,
  public product API activation, publication, or production binding is
  implemented.

## RISK

- Process-local provenance deliberately rejects cloned, transferred, or
  persisted tree/proof objects; a future cross-process hydration contract must
  preserve equivalent authority.
- Complete request validation and complete shaping/break arrays can dominate
  work even though the complete next semantic checkpoint pass is gone.
- Optional QA materialization can be mistaken for a runtime requirement or a
  publishable result unless callers preserve the explicit gate.
- Active persistent trees and paired external/Core snapshots retain overlapping
  facts; rotation policy and product-scale memory remain unmeasured.

## UNKNOWN

- Product-scale retained-tree/snapshot heap cost and rotation policy.
- Product frame, latency, and interaction budgets under representative Editor
  scheduling, rendering, and long-document workloads.
- The bounded replacement for complete request validation and complete
  shaping/break arrays.
- Cross-process or persisted resumable coverage authority with equally strong
  identity and provenance.
- Exact spatial reconvergence behavior once positioned exclusions exist.

## Verification

Focused commands:

```text
npx vitest run tests/liveDraftMr1PersistentFlowFoundation.test.ts
npx vitest run tests/liveDraftMr1PersistentFlowFoundation.test.ts tests/liveDraftMr1CompleteGeometryBoundary.test.ts tests/textBlockPersistentFlowTreeV1.test.ts tests/textBlockPersistentFlowUpdateV1.test.ts tests/textBlockMultiRunSemanticWindowV1.test.ts tests/textEngineIncrementalRetainedPlanV1.test.ts tests/textEngineIncrementalRangeExecutionV1.test.ts
npm run type-check
git diff --check
```

- Documentation guard RED: 1 test file failed / 2 tests failed because the
  handoff and aligned pointers did not exist.
- Documentation guard GREEN: 1 test file passed / 2 tests passed.
- Combined focused result: 7 test files passed / 28 tests passed.
- `npm run type-check` passed with no TypeScript errors.
- `git diff --check` passed with no whitespace errors.
- Final full `npm run check`: 412 test files passed / 2,042 tests passed,
  including its type-check.
- The first full-suite attempt had two five-second test timeouts under parallel
  host load. Both timed-out tests passed together immediately afterward, and the
  exact full command then passed. No semantic assertion failed and no timeout or
  implementation behavior was changed.

## Next Checkpoint

Proceed to `Phase 3: Core Spatial Wrapping 3A`. Implement only the persistent
y-interval spatial index and Flow Region Provider over strict synthetic Core
inputs. Do not start list/image geometry, empty-block geometry, Editor binding,
Backend binding, Columns/Table integration, table auto-fit, publication, or
production activation inside Phase 3.
