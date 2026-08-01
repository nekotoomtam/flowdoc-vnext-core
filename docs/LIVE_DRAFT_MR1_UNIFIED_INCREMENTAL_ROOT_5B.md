# Live Draft MR1 Unified Incremental Root 5B-1

Status: implemented and closed at the Core-only Phase 5B-1 final user-review
stop. This handoff does not authorize Phase 5B-2, Phase 5B-3, Phase 5C,
Editor or Backend integration, publication, production activation, or Root
V1/Scene V1 retirement.

## Locked capability boundary

Phase 5B-1 activates only Root V2 true no-op and inline-image paint-fact
transition. True no-op returns the exact previous Root and Persistent Scene
wrappers. Accepted paint transition keeps
`next line-tree dependency === previous exact line-tree dependency` and proves
one exact whole-subtree structural reuse. It does not allocate a replacement
line-tree wrapper, traverse the complete line tree or suffix, recompute a line,
or claim layout reconvergence.

The empty fixture is structural calibration only and executes no transition.
The 128-line exclusion fixture is an inactive reference and executes no
transition. Neither opens empty-block or exclusion incremental capability.

## Independent version layers

- Runtime contracts: Root V2 `2`, Persistent Scene V2 `2`, Transition V1 `1`,
  and Scene Delivery V2 `2`.
- Active public work policy: `5b-1-v3` with exact fingerprint
  `sha256:896f2163367070bd1f1e6fa0d9b34c0f47e371e6256cc9c15bd27e898c185982`.
- Fixture calibration revision: `3`.

Changing fixture calibration alone does not change Root or Scene identity. The
semantic contract, work-policy identity, and fixture calibration revision are
separate version layers.

## Semantic and process-local authority

Persistent Scene V2 separates structural-semantic identity from payload
observation identity. Root V2 separately exposes semantic identity and
process-local composite authority. Payload estimation is observational only;
it cannot select an execution path. Canonical fingerprints do not replace
registered exact-object authority.

Source, line, Scene, and delivery owner helpers recompute the facts they own.
They remain private and task-specific. Complete bootstrap and complete fallback
use the same private Root V2 construction kernel, differing only in envelope
and provenance.

## Deterministic work policy

The V3 policy has 21 ordered rows: 13 locked and eight inactive. Every relative
denominator is `1`.

| Stage / unit | Floor | Absolute | Relative numerator |
| --- | ---: | ---: | ---: |
| `source-flow/source-items` | 1 | 4 | 1 |
| `source-flow/source-lookup-nodes` | 2 | 16 | 1 |
| `source-flow/source-path-copy-nodes` | 2 | 16 | 1 |
| `source-flow/source-leaf-items` | 8 | 32 | 1 |
| `structural-reuse-proof/selected-exact-subtree-nodes` | 1 | 4 | 1 |
| `structural-reuse-proof/line-tree-lookup-nodes` | 2 | 8 | 2 |
| `scene/line-tree-lookup-nodes` | 4 | 16 | 1 |
| `scene/copied-scene-nodes` | 2 | 16 | 1 |
| `scene/replacement-chunks` | 1 | 4 | 1 |
| `scene/scene-tree-lookup-nodes` | 4 | 16 | 1 |
| `delivery-plan/delivery-operations` | 4 | 16 | 1 |
| `delivery-plan/retain-cover-nodes` | 8 | 64 | 1 |
| `delivery-plan/scene-tree-lookup-nodes` | 128 | 512 | 12 |

Inactive rows remain `flow-atoms`, `flow-tree-nodes`,
`spatial-index-nodes`, `spatial-query-bands`, `recomputed-lines`,
`proof-nodes`, `reprojected-lines`, and `visited-fragments`.

Limits are deterministic, stage-specific, and derived from checked-in fixture
evidence. Source and line-tree lookup/path-copy work, Scene lookup/path-copy
work, and delivery lookup/cover work are operation-owned. No wall clock or
payload byte estimate participates in execution selection.

## Fallback and delivery integrity

Fallback remains a two-step protocol. The transition attempt returns
`fallback-required` with one exact Core-minted process-local request. Complete
material arrives later only through the complete-fallback boundary. The
request must bind the exact evaluator/proof authority, failed stage, policy
limit, and attempted-work row. No partial incremental candidate can enter the
complete builder.

Detached complete delivery is descriptor-parsed before ordinary property
reads and then recomposed inside-out for locally owned source mapping, line
fragment/internals, authored geometry, source paint, Scene fragment/chunk,
summary, payload observation, and delivery identity. Upstream opaque facts are
shape-checked and parent-bound, not falsely claimed as locally rederived.
Accessor, symbol, prototype, cycle, unsafe-number, unknown-field, inconsistent
parent/child, and forced-fingerprint-collision inputs are rejected.

Canonical retain cover is scoped to the exact registered Scene tree, versioned
tree policy, and half-open ordinal range. Selection uses stored left-to-right
order and chooses the highest fully contained nodes. Alternate registered tree
history normalization remains inactive.

## Renderer parity and work ledgers

The active transition lane is compared with an independently supplied complete
fallback and a QA-only complete oracle. All three produce equal normalized
renderer `{ chunks, summary }` material for the covered paint transition; true
no-op also preserves normalized renderer material. Root composite fingerprints
are intentionally not used as cross-lane equality because construction
provenance differs.

The evidence keeps these ledgers separate:

- `incrementalCandidateWork`;
- `completeFallbackWork`; and
- `completeOracleWork`.

The complete oracle is QA/verification only and never production hot-path
authority.

## Public/private boundary and capability honesty

`src/index.ts` exposes the V3 active policy, reviewed versioned contracts,
orchestration boundaries, and inspectors. V1/V2 policies and all owner helpers,
authority registries, collision factories, candidate selectors, complete
construction kernel, classifier, and observers remain private.

The manifest records only `trueNoOpIncrementalTransition` and
`imagePaintIncrementalTransition` as active. It records these as false:

- empty-block, exclusion, text/style, semantic-only, authored-box, and
  fixed-height/overflow incremental behavior;
- alternate registered tree-history normalization;
- Worker session protocol, Editor apply, Backend persistence, and production
  activation; and
- Root V1/Scene V1 retirement.

Root V1/Scene V1 remain frozen compatibility and QA reference only. Lifetime
evidence proves object-graph retention/reachability only, not garbage-collection
timing, reclamation, transfer buffers, or product-scale memory behavior.

## Verification

- Final focused gate: 12 files / 142 tests passed; type-check passed.
- Full `npm run check`: type-check passed; 453 test files / 2,512 tests passed.
- Diff hygiene passed.
- Final scoped review found no open Critical or Important finding after the
  V3 documentation drift was corrected.

Detailed evidence is retained under
`.superpowers/sdd/2026-07-31-unified-incremental-root-transition-5b-1-v3-corrective/`.

## Risks and stop condition

Phase 5B-1 does not establish realistic Worker structured-clone cost,
browser/Worker lifetime, product-scale memory, typing or resize latency,
fallback frequency, scheduling behavior, fixed-height/overflow, image asset
loading/decode lifecycle, Columns/Table integration, or 5B-2 text/style and
layout reconvergence.

Stop here for user review. Do not begin Phase 5B-2 without explicit
authorization.
