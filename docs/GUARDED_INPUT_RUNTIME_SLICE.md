# Guarded Input Runtime Slice

Status: Phase 169 guarded input runtime slice 1.

Phase 169 adds a sandbox-local guarded runtime slice that composes the accepted
Phase 154-158 boundaries under the Phase 168 integration plan.

This is not production contenteditable binding. It creates JSON-safe runtime
evidence and, on the accepted path, a planned commit bridge request only.

## Runtime Boundary

- `examples/template-builder-sandbox/public/guardedInputRuntimeSlice.js`
  composes ownership, active island lifecycle, command policy, DOM binding smoke,
  and active island commit bridge smoke.
- The runtime slice opens at most one eligible active text-block island.
- It captures selection/caret as UTF-16 offsets, not live DOM Range objects.
- It blocks commit while IME composition is active.
- It routes ineligible text blocks to textarea fallback.
- It blocks unsupported blocks before rich island activation.
- It produces a `text-block.rich-inline.replace` bridge request only after safe
  capture, command policy readiness, and commit request readiness.

## JSON-Safe Report

The report includes:

- source, mode, version, status, reason, hard limits, and production readiness;
- ownership summary;
- active island state when an island is opened;
- command policy;
- DOM binding smoke capture or blocked reason;
- commit bridge summary;
- packet refresh requirement after an accepted bridge plan;
- package mutation status.

The report must not include live DOM objects, browser selection objects,
arbitrary DOM HTML, storage/backend facts, PDF/DOCX renderer facts, or
collaboration/offline claims.

## PASS

- The sandbox-local runtime slice composes existing Phase 154-158 boundaries.
- Accepted text-block input produces a planned bridge request through
  `text-block.rich-inline.replace`.
- Composition-active commit is blocked.
- Fallback and unsupported target paths are explicit.
- Packet refresh is required after accepted bridge planning.

## FAIL-BLOCKER

- No blocker prevents Phase 170 paste/delete/field-chip input slice work.
- Production contenteditable binding remains blocked.
- Production browser readiness remains blocked.

## RISK

- The runtime slice is still sandbox-local and does not apply package mutation.
- The active island path uses a v1 full rich inline replacement bridge.
- Real browser driver evidence remains outside core check.

## UNKNOWN

- Final product-shell mount details remain consumer-owned.
- Browser-specific IME timing remains evidence-dependent.
- Granular rich inline operation support remains future work.

## Files Changed

- `examples/template-builder-sandbox/public/guardedInputRuntimeSlice.js`
- `docs/GUARDED_INPUT_RUNTIME_SLICE.md`
- `tests/guardedInputRuntimeSlice.test.ts`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/guardedInputIntegrationPlan.test.ts`
- `tests/hybridInputBrowserMatrixDecision.test.ts`
- `tests/hybridInputHardeningThresholdPlan.test.ts`
- `tests/hybridInputBrowserEvidenceCloseAudit.test.ts`
- `tests/hybridInputBrowserDriverSmoke.test.ts`
- `tests/hybridInputBrowserQa.test.ts`
- `tests/hybridInputFoundationCloseAudit.test.ts`
- `tests/hybridManagedCardInputPlan.test.ts`

## Behavior Changed

- A sandbox-local runtime evidence helper is available for the hybrid active
  text-block island path.
- No core package runtime behavior changed.

## Tests Run

- `npm.cmd test -- tests/guardedInputRuntimeSlice.test.ts`
- `npm.cmd test -- tests/guardedInputIntegrationPlan.test.ts`
- `npm.cmd test -- tests/hybridInputBrowserMatrixDecision.test.ts`
- `npm.cmd test -- tests/hybridInputHardeningThresholdPlan.test.ts`
- `npm.cmd test -- tests/hybridInputBrowserEvidenceCloseAudit.test.ts`
- `npm.cmd test -- tests/hybridInputBrowserDriverSmoke.test.ts`
- `npm.cmd test -- tests/hybridInputBrowserQa.test.ts`
- `npm.cmd test -- tests/hybridInputFoundationCloseAudit.test.ts`
- `npm.cmd test -- tests/hybridManagedCardInputPlan.test.ts`
- `npm.cmd run check`

## Risks Left

- Paste/delete/field-chip runtime operations still need their own slice.
- Fallback UX remains policy/evidence only.
- Applying the planned bridge request remains outside this runtime slice.

## Intentionally Not Changed

- No production contenteditable implementation.
- No production browser readiness claim.
- No full-document contenteditable.
- No browser automation dependency added to core.
- No browser driver requirement in core check.
- No package/document schema change.
- No storage/backend route.
- No PDF/DOCX renderer work.
- No collaboration/offline behavior.
- No legacy editor runtime copy.

## Next Recommended Phase

Next recommended phase: Phase 170: Paste/Delete/Field-chip Input Slice.
