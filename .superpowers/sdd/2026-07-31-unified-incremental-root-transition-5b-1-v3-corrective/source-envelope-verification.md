# Phase 5B-1 V3 Source-Envelope Verification

Date: 2026-08-01  
Branch: `phase-5b-unified-incremental-root-transition`  
Activation commit: `fae32d6 feat(layout): activate source-bounded phase 5b-1 v3`

## Result

The Phase 5B-1 V3 work policy is the only active Root V2 policy. Complete
bootstrap, complete fallback, no-op, and image-paint transition paths use the
same exact policy object. V2 is absent from runtime and public exports; one
test-local `5b-1-v2` value remains only to prove that old policy authority is
rejected.

- Policy id: `5b-1-v3`
- Policy fingerprint:
  `sha256:896f2163367070bd1f1e6fa0d9b34c0f47e371e6256cc9c15bd27e898c185982`
- Canonical stage ledger: exactly 21 ordered rows
- Locked rows: 13
- Inactive rows: 8

## Fresh Verification

The following focused gate was run after the last test change:

```text
npx vitest run --config vitest.config.ts tests/textBlockUnifiedLayoutTransitionContractV1.test.ts tests/textBlockUnifiedLayoutSourceStateV1.test.ts tests/textBlockUnifiedLayoutWorkCalibrationV3.test.ts tests/textBlockUnifiedLayoutRootV2.test.ts tests/textBlockUnifiedLayoutTransitionEvidenceV1.test.ts tests/textBlockPersistentLayoutLineTreeV1.test.ts tests/textBlockPersistentSceneV2.test.ts tests/textBlockSceneDeliveryV2.test.ts tests/textBlockUnifiedLayoutTransitionFoundationV1.test.ts tests/textBlockUnifiedLayoutFallbackV1.test.ts tests/textBlockUnifiedLayoutAdversarialV2.test.ts tests/liveDraftMr1UnifiedIncrementalRoot5b.test.ts
```

Result: 12 test files passed; 134 tests passed.

```text
npm run type-check
```

Result: `tsc --noEmit -p tsconfig.json` passed.

`git diff --check` also passed.

## Source-Envelope Threshold Evidence

The complete-root envelope evaluates four Core-owned structural facts before
downstream complete construction:

| Unit | Accepted calibration evidence | Rejection evidence |
| --- | --- | --- |
| `source-items` | attempted 1, effective limit 1 | attempted 2, effective limit 1 |
| `source-lookup-nodes` | height 16 accepted | height 17 rejected at limit 16 |
| `source-path-copy-nodes` | attempted 2 accepted | attempted 3 rejected at limit 2 for the empty structural basis |
| `source-leaf-items` | maximum occupancy 8 accepted | occupancy 9 rejected at limit 8 |

Invalid, fractional, negative, unsafe, or foreign-policy source facts fail
closed. A source-envelope failure stops after source-state preparation: flow,
line, Scene, and Root construction counts remain zero, and no candidate Root
authority is exposed.

## Authority And Lifecycle Evidence

- Complete bootstrap and complete fallback both call
  `prepareVNextTextBlockUnifiedLayoutRootCompleteCandidateInternalV2`; they
  differ only by construction envelope and provenance.
- Source-envelope binding is prepared on an unregistered candidate and becomes
  resolvable only after the Root graph commit succeeds.
- Incremental image-paint Roots require exact previous-envelope authority and
  exact prepared-fact parity before a fresh next authority is committed.
- A complete-fallback envelope rejection does not consume the fallback request.
  Corrected complete material succeeds with the same request; replay after the
  successful commit fails closed.
- Pre-binding source exhaustion and all four source-envelope rows are invariant
  failures and cannot mint fallback.
- A non-source post-binding limit can produce deterministic fallback only from
  one exact unconsumed evaluator authority. Clone, replay, raw tuple, modified
  wrapper, pre-binding authority, and source-row authority are rejected.
- Rejected visits are excluded from completed detail work. The fallback reason
  records attempted work; `incrementalCandidateWork` records only completed
  work.
- Retain-proof failure remains a separate `incremental-proof-failed` path and
  cannot be relabeled as deterministic limit fallback.

## Search Evidence

Targeted searches found:

- no `V3_CANDIDATE` symbol;
- no `mintVNextTextBlockUnifiedLayoutLimitFallbackAttemptInternalV1`;
- no `limitReasonMatchesAttempt`;
- one complete Root V2 construction kernel, called by bootstrap and fallback;
- `treeHeight` only in private source-envelope facts, policy evaluation,
  observations, and tests—not in canonical Root, Source summary, Scene, or
  delivery payload facts.

## Residual Risk

This evidence establishes process-local Core object-graph authority and the
focused Phase 5B-1 gate. It does not establish product-scale memory behavior,
worker/session lifetime, Editor apply semantics, Backend publication, or later
5B-2/5B-3 change-family support. Work-policy limits remain deterministic and
may be recalibrated later without treating payload size or wall-clock time as
an execution-policy input.
