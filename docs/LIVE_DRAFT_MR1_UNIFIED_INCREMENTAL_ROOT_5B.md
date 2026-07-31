# Live Draft MR1 Unified Incremental Root 5B-1

Status: corrected Core-only Phase 5B-1 checkpoint at the independent review
stop. This handoff does not authorize Phase 5B-2, Phase 5B-3, Phase 5C,
Editor or Backend integration, publication, production activation, or Root
V1/Scene V1 retirement.

## Locked boundary

Phase 5B-1 has one active Root V2 transition lane for true no-op and inline
image paint-fact changes. A true no-op returns the exact previous Root and
Persistent Scene wrappers. An accepted paint change retains the exact previous
line-tree object and reports one selected exact subtree with zero line-tree
wrapper allocation, zero complete line-tree traversal, zero recomputed lines,
and zero reconvergence proof nodes. This is whole-subtree exact structural
reuse, never a layout reconvergence claim.

Implementation evidence is
`attemptVNextTextBlockUnifiedLayoutRootTransitionInternalV1(...)` in
`src/layout/textBlockUnifiedLayoutTransitionV1.ts`. Exact first/middle/last
paint and no-op evidence is in
`tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts`.

The empty fixture is structural calibration only and executes no transition.
The 128-line exclusion fixture is an inactive reference and executes no
transition. Neither fixture is evidence for empty-block or exclusion
incremental capability. The checked-in facts are in
`fixtures/live-draft-unified-incremental-root-5b-manifest.v1.json` and are
guarded by `tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts`.

## Independent version layers

The handoff manifest separates:

- runtime contracts: Root V2 `2`, Persistent Scene V2 `2`, Transition V1 `1`,
  and Scene Delivery V2 `2`;
- active work policy: `5b-1-v2` with exact fingerprint
  `sha256:a34ec28417de166943010ad6afedd303b1ce9d77df63a7a56069b1d98d18c8c4`;
  and
- fixture calibration revision: `2`.

Changing only an in-memory manifest clone from calibration revision `2` to `3`
does not change the exact Root semantic or composite fingerprint. Root and
Persistent Scene expose no fixture calibration revision. The executable proof
is `keeps fixture calibration revision outside Root and Scene identity` in
`tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts`.

## Semantic and integrity identity

Persistent Scene V2 separates structural-semantic identity from payload
observation identity. Semantic Scene and subtree fingerprints exclude the
payload policy, byte observation, and construction/path-copy work. Persistent
Layout Line Tree V1 now exposes a work-free `semanticFingerprint`; Scene binds
that identity while retaining the work-bearing line-tree fingerprint only for
exact composite authority. Root semantic dependencies therefore remain
work-free transitively. Each Scene node and wrapper separately composes
`payloadObservationFingerprint` and
`estimatedCanonicalPayloadByteCount`. The implementation is
`payloadObservation(...)` plus the complete and paint candidate builders in
`src/layout/textBlockPersistentSceneV2.ts`; the independence gate is
`keeps semantic Scene identity stable when only the payload policy changes`
in `tests/textBlockPersistentSceneV2.test.ts`.

Root V2 likewise separates `semanticFingerprint` from the composite
process-local authority `fingerprint`. Semantic identity excludes construction
provenance, work policy, calibration, work ledgers, and payload observations.
Composite identity binds the active work policy and construction/integrity
facts. A dependency-ordered QA recomposition proves that changing only
line-tree work changes composite authority without changing line-tree, Scene,
or Root semantic identity. Exact tests are in
`tests/textBlockUnifiedLayoutRootV2.test.ts`.

Complete bootstrap and complete fallback both call the single private
`prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2(...)`
kernel in `src/layout/textBlockUnifiedLayoutRootV2.ts`. Equal complete material
has equal Root semantic identity while complete-bootstrap and
complete-fallback retain different construction/composite authority. The
single-kernel observer and candidate-independence gates are in
`tests/textBlockUnifiedLayoutFallbackV1.test.ts`.

## Deterministic work and delivery

The active policy has exactly six execution rows:

| Stage / unit | Floor | Absolute | Relative |
| --- | ---: | ---: | ---: |
| `source-flow/source-items` | 1 | 4 | 1/1 |
| `structural-reuse-proof/selected-exact-subtree-nodes` | 1 | 4 | 1/1 |
| `scene/copied-scene-nodes` | 2 | 16 | 1/1 |
| `scene/replacement-chunks` | 1 | 4 | 1/1 |
| `delivery-plan/delivery-operations` | 4 | 16 | 1/1 |
| `delivery-plan/retain-cover-nodes` | 16 | 64 | 1/1 |

Payload byte estimates appear only under fixture, transition, Scene, and
delivery `observations`. They are absent from locked/inactive execution units,
threshold rows, fallback reasons, and execution selection. The exact fixture
counters and bytes are rerun against real deterministic transitions by
`matches the deterministic manifest counters and calibration formula` in
`tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts`.

Accepted no-op and paint paths use shallow exact WeakMap authority and never
rehash or recursively freeze retained line-tree/Scene descendants. A private
source-item authority resolves the changed image once and reuses it through
source and Scene path-copy; a 32-transition chain keeps one index lookup and
zero historical Scene-authority probes per transition. The one-item
`source-flow` row therefore remains factual without a policy or calibration
change. Builder-owned exact fragment tokens replace accumulated historical
node-set scans.

Retain covers are canonical only relative to the exact registered Scene tree,
tree-policy fingerprint, and half-open ordinal range. The private selector
chooses the highest fully contained nodes in stored left-to-right order.
`tests/textBlockSceneDeliveryV2.test.ts` covers 8-, 9-, 17-, and 33-chunk
trees plus reordered, nonmaximal, cloned, foreign, policy-drifted, and
payload-observation-drifted authority.

Fallback requests consume one exact Core-minted attempt whose reason, failed
stage, active-policy limit, and work row correspond. Nested delivery data is
descriptor-validated before ordinary reads or canonicalization. Tests use the
real private collision factory to prove equal claimed Scene digests cannot
cross exact delivery or Root authority. Authored-box width/inset changes remain
classified but block at the inactive 5B-3 geometry stage with no cover,
fallback, or child work.

## Public and private boundary

`src/index.ts` exposes the reviewed V2 policy, versioned contracts, public
orchestration boundaries, and public inspectors. The superseded V1 policy,
test-only collision factories, alternate payload-policy construction,
retain-cover candidate builders/selectors, authority registries, Core effect
classifier, complete candidate kernel/observer, and fallback candidate
observer remain private. The executable package-boundary gate is
`exports only the reviewed Root V2 orchestration surface` in
`tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts`.

Core owns the effect-classification function, and the classifier distinguishes
true no-op, semantic-only, paint-affecting, and geometry-affecting facts.
Phase 5B-1 does not execute semantic-only transitions. Classification evidence
is in `src/layout/textBlockUnifiedLayoutTransitionEvidenceV1.ts` and
`tests/textBlockUnifiedLayoutTransitionContractV1.test.ts`.

## Object-graph evidence only

The deterministic lifetime gate proves only object-graph reachability and
retention: a distinct next Root/Scene does not retain the previous wrapper,
unchanged child subtrees retained by structural sharing remain reachable from
the next Scene, and true no-op returns the exact previous wrappers. Evidence
is `passes deterministic wrapper and scene lifetime reachability gates` in
`tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts`.

This is not evidence for garbage-collection timing, product-scale memory,
Worker-handle lifetime, transfer buffers, browser sessions, or memory
reclamation.

## Explicit false capabilities

The manifest records all of these as false:

- empty-block incremental transition;
- exclusion incremental transition;
- semantic-only incremental transition execution;
- alternate registered tree-history normalization;
- Worker session protocol;
- Editor apply;
- Backend persistence; and
- production activation.

`stagedEditorApply`, `mayPublishLayout`, and `productionBinding` remain false.
Editor, Backend, Phase 5C, publication, and production behavior are unchanged.
The repository boundary remains the one documented in
`docs/CROSS_REPO_OPERATING_MAP.md`.

## Verification

- TDD RED: the handoff test ran 1 file / 9 tests with 2 failed and 7 passed.
  The actual failures were missing runtime/calibration metadata and missing
  per-fixture payload observations; inherited V2 policy/public-boundary facts
  already passed.
- Handoff GREEN: 1 file / 9 tests passed.
- Final-review RED evidence covered retained hot-path work, inactive pre-cover
  behavior, three duplicate source lookups, fabricated fallback authority,
  nested delivery getters, and fake collision coverage.
- Complete corrected focused gate: 11 files / 88 tests passed.
- `npm run type-check` and `git diff --check` passed.
- Complete `npm run check`: TypeScript passed, then 452 test files / 2,458
  tests passed.

## Risks and unknowns

Phase 5B-1 does not establish real Worker structured-clone cost, actual
transfer bytes, browser/Worker memory across long sessions, realistic typing
or image-resize latency, fallback frequency, garbage-collection timing,
multi-TextBlock scheduling interaction, or product-scale threshold headroom.
The empty, exclusion, semantic-only, and alternate-history lanes remain
explicitly inactive.

Stop here for independent 5B-1 review. Do not begin Phase 5B-2 without explicit
authorization.
