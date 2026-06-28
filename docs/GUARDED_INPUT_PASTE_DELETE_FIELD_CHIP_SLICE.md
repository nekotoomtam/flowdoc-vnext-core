# Guarded Input Paste/Delete/Field-chip Slice

Status: Phase 170 guarded input paste/delete/field-chip slice.

Phase 170 adds a sandbox-local input slice for paste, delete/backspace, and
field-chip commands on top of the Phase 169 guarded runtime slice.

This is not production clipboard binding and not production contenteditable
readiness. It produces JSON-safe decisions and planned field-chip intents only.

## Runtime Boundary

- `examples/template-builder-sandbox/public/guardedInputPasteDeleteFieldChipSlice.js`
  composes the Phase 169 runtime slice with the Phase 160 paste/delete
  preflight boundary.
- Plain text paste can be accepted or normalized.
- Unsafe rich paste and arbitrary DOM HTML are blocked.
- Delete/backspace near a field chip transforms into an explicit field-chip
  command intent.
- Field-chip copy, paste, delete, and replace-with-text commands stay atomic.
- Field-chip internal edits are blocked.
- Structural boundary delete is blocked.
- Composition-active paste/delete/commit is blocked.

## JSON-Safe Report

The report includes source, mode, version, status, hard limits, runtime status,
preflight result, optional field-chip command intent, package mutation status,
and production readiness.

The report must not include DOM objects, raw clipboard events, arbitrary DOM
HTML, storage/backend facts, PDF/DOCX renderer facts, or collaboration/offline
claims.

## PASS

- Plain paste, normalized paste, unsafe paste blocking, structural delete
  blocking, composition blocking, and field-chip boundary delete are covered.
- Field-chip atomics remain command intent facts, not editable plain text.
- Field-chip intents use `text-block.rich-inline.replace` as planned intent
  only.

## FAIL-BLOCKER

- No blocker prevents Phase 171 input integration close audit.
- Production clipboard binding remains blocked.
- Production contenteditable binding remains blocked.

## RISK

- Browser clipboard interoperability is still unproven.
- Field-chip rich inline intents are not applied by this slice.
- Granular rich inline operations remain future work.

## UNKNOWN

- Final browser-driver coverage for clipboard and IME timing remains unknown.
- Product fallback UX remains unknown.
- Collaboration/offline field-chip replay remains unknown.

## Files Changed

- `examples/template-builder-sandbox/public/guardedInputPasteDeleteFieldChipSlice.js`
- `docs/GUARDED_INPUT_PASTE_DELETE_FIELD_CHIP_SLICE.md`
- `tests/guardedInputPasteDeleteFieldChipSlice.test.ts`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/guardedInputRuntimeSlice.test.ts`
- `tests/guardedInputIntegrationPlan.test.ts`
- `tests/hybridInputBrowserMatrixDecision.test.ts`
- `tests/hybridInputHardeningThresholdPlan.test.ts`
- `tests/hybridInputBrowserEvidenceCloseAudit.test.ts`
- `tests/hybridInputBrowserDriverSmoke.test.ts`
- `tests/hybridInputBrowserQa.test.ts`
- `tests/hybridInputFoundationCloseAudit.test.ts`
- `tests/hybridManagedCardInputPlan.test.ts`

## Behavior Changed

- A sandbox-local paste/delete/field-chip evidence helper is available for the
  guarded active text-block island path.
- No core package runtime behavior changed.

## Tests Run

- `npm.cmd test -- tests/guardedInputPasteDeleteFieldChipSlice.test.ts`
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

- Production clipboard events are still outside the package.
- Applying field-chip rich inline intents remains outside this slice.
- Browser matrix evidence for paste/delete timing remains incomplete.

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

Next recommended phase: Phase 171: Input Integration Close Audit.
