# Hybrid Input Browser Matrix Decision

Status: Phase 167 browser matrix decision.

Phase 167 chooses the minimum browser, OS, and input-method matrix for the v1
hybrid active text-block island path.

This is a decision boundary only. It does not add browser automation
dependencies, require a browser driver in core check, or implement production
contenteditable.

## Decision

Accepted v1 browser matrix:

- Chromium-family browser on Windows.
- Microsoft Edge on Windows as the named product browser target.
- English keyboard input path.
- Thai keyboard/IME input path.
- IME composition lifecycle evidence for the selected Windows browser path.
- Plain paste, unsafe paste blocking, delete/backspace, field-chip guard, active
  island commit, and fallback behavior checked against the Phase 166
  thresholds.

Optional evidence:

- Externally supplied browser-driver facts from Phase 164 may be used when
  available.
- Manual QA evidence may be attached to the same JSON-safe case vocabulary when
  automation is unavailable.

## Deferred

- Firefox.
- Safari.
- Mobile browsers.
- Complex CJK IME matrices.
- Linux and macOS browser acceptance.
- Cross-browser visual caret parity.

## Matrix Threshold Mapping

- Selection/caret: must PASS Phase 166 thresholds for UTF-16 offsets and active
  text-block bounds.
- IME composition: must PASS for Thai and English selected paths; missing Thai
  IME lifecycle evidence is BLOCKED for v1 input acceptance.
- Paste/delete: plain paste and unsafe paste blocking must PASS; rich paste may
  remain WARNING if fallback is explicit.
- Field-chip atomicity: must PASS for delete/backspace near field chips.
- Active island commit: must PASS through the accepted
  `text-block.rich-inline.replace` bridge shape.
- Fallback behavior: must PASS for unsupported/ineligible blocks.
- JSON-safe reports: must PASS; blocked/no-driver reports are accepted only as
  evidence of missing automation, not production readiness.

## v1 Blockers

- Thai input path lacks IME composition lifecycle evidence.
- Selected Windows Chromium/Edge path cannot produce JSON-safe selection/caret
  evidence.
- Unsafe paste is not blocked.
- Field-chip atomics are editable as plain text.
- Active island commit accepts unsafe capture or stale revision.
- Browser evidence requires adding Playwright/Puppeteer to
  `@flowdoc/vnext-core`.

## PASS

- The minimum v1 browser/OS/IME matrix is explicit.
- Deferred browsers/platforms are explicit.
- Phase 166 thresholds are mapped to the matrix.
- v1 blockers are explicit.

## FAIL-BLOCKER

- No blocker prevents Phase 168 guarded input integration planning.
- Production browser readiness remains blocked.
- Production contenteditable binding remains blocked.

## RISK

- v1 browser support is intentionally narrow.
- Thai IME behavior may still require real manual or driver-backed evidence.
- Deferring Firefox/Safari/mobile may limit external beta breadth.

## UNKNOWN

- Exact automated browser driver choice remains unknown.
- Whether Edge-only evidence is enough for beta remains unknown.
- Complex CJK IME support remains unknown.

## Files Changed

- `docs/HYBRID_INPUT_BROWSER_MATRIX_DECISION.md`
- `tests/hybridInputBrowserMatrixDecision.test.ts`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/hybridInputHardeningThresholdPlan.test.ts`
- `tests/hybridInputBrowserEvidenceCloseAudit.test.ts`
- `tests/hybridInputBrowserDriverSmoke.test.ts`
- `tests/hybridInputBrowserQa.test.ts`
- `tests/hybridInputFoundationCloseAudit.test.ts`
- `tests/hybridManagedCardInputPlan.test.ts`

## Behavior Changed

- No runtime behavior changed.
- The v1 browser/OS/IME matrix is now bounded before guarded input integration
  planning.

## Tests Run

- `npm.cmd test -- tests/hybridInputBrowserMatrixDecision.test.ts`
- `npm.cmd test -- tests/hybridInputHardeningThresholdPlan.test.ts`
- `npm.cmd test -- tests/hybridInputBrowserEvidenceCloseAudit.test.ts`
- `npm.cmd test -- tests/hybridInputBrowserDriverSmoke.test.ts`
- `npm.cmd test -- tests/hybridInputBrowserQa.test.ts`
- `npm.cmd test -- tests/hybridInputFoundationCloseAudit.test.ts`
- `npm.cmd test -- tests/hybridManagedCardInputPlan.test.ts`
- `npm.cmd run check`

## Intentionally Not Changed

- No production contenteditable implementation.
- No browser automation dependency added to core.
- No browser driver requirement in core check.
- No full-document contenteditable.
- No package/document schema change.
- No storage/backend route.
- No PDF/DOCX renderer work.
- No collaboration/offline behavior.

## Next Recommended Phase

Next recommended phase: Phase 168: Guarded Input Integration Plan.
