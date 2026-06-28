# Hybrid Input Browser Evidence Close Audit

Status: Phase 165 hybrid input browser evidence close audit.

Phase 165 closes the browser evidence lane across Phases 163-164. This is an
audit and decision boundary only.

This audit does not claim production browser readiness or production
contenteditable readiness.

## Intent

- Close the Phase 163 sandbox-local QA evidence lane.
- Close the Phase 164 optional browser-driver evidence intake lane.
- State what is proved, still risky, and still blocked before any production
  contenteditable binding plan.
- Choose the next guarded lane.

## Proven Evidence

Phase 163 proves sandbox-local JSON-safe browser QA evidence:

- selection start/end is represented as UTF-16 offsets;
- caret movement is represented as a collapsed UTF-16 selection;
- IME composition lifecycle blocks commit while composition is active;
- plain text paste is normalized before package mutation;
- unsafe rich paste is explicitly blocked and does not become package truth;
- delete/backspace near a field chip transforms into a guarded field-chip
  command;
- active island commit is represented through the existing
  `text-block.rich-inline.replace` bridge shape;
- textarea fallback behavior is explicit;
- one active text-block island ownership remains guarded.

Phase 164 proves optional browser-driver evidence intake:

- missing browser-driver facts produce explicit blocked status instead of core
  check failure;
- externally supplied facts can summarize focus, selection/caret movement,
  plain typing, IME composition when available, plain paste, unsafe paste
  blocking, field-chip delete guard, and active island commit;
- reports remain JSON-safe;
- browser automation dependencies are not added to `@flowdoc/vnext-core`;
- browser-driver execution remains optional and sandbox-local.

## Production Blockers

- Not production browser ready.
- Not production contenteditable ready.
- No production contenteditable binding.
- No full-document contenteditable.
- No required browser-driver execution in core check.
- No browser matrix acceptance.
- No production DOM Range/Selection parity.
- No production IME or clipboard interoperability proof.
- No live DOM event handler hardening threshold.
- No production field-chip DOM atomics proof.
- No package/document schema change.
- No storage/backend route.
- No PDF/DOCX renderer work.
- No collaboration/offline behavior.

## PASS

- Phase 163 and Phase 164 evidence are both referenced.
- Selection/caret, IME/composition, paste/delete, field-chip guard, active
  island commit, and fallback behavior are summarized.
- Production blockers remain visible.
- Next lane recommendation is clear.
- No browser driver is required in core check.
- No browser automation dependency is added to `@flowdoc/vnext-core`.

## FAIL-BLOCKER

- No blocker prevents closing the browser evidence lane.
- Production browser readiness remains blocked.
- Production contenteditable binding remains blocked.

## RISK

- Phase 163 uses sandbox-local facts rather than live browser automation.
- Phase 164 validates externally supplied driver facts, not a durable browser
  matrix.
- IME/composition support can vary by OS, browser, language, and driver.
- Clipboard and paste behavior can diverge across browser engines.
- Field-chip atomics are still guarded by evidence/preflight, not production
  DOM event handlers.
- Active island commit still relies on v1 full rich inline replacement.

## UNKNOWN

- Browser driver choice is unknown.
- Minimum browser/OS/IME matrix is unknown.
- Production hardening thresholds are unknown.
- Production caret/selection parity thresholds are unknown.
- Production paste sanitization thresholds are unknown.
- Production field-chip DOM atomicity thresholds are unknown.

## Next Recommended Phase

Next recommended phase: Phase 166: Hybrid Input Hardening Threshold Plan.

Reason:

- Phase 163 establishes sandbox-local browser QA evidence.
- Phase 164 establishes optional browser-driver evidence intake.
- Before choosing a browser driver matrix or production contenteditable binding,
  the project needs explicit hardening thresholds for selection/caret, IME,
  paste/delete, field-chip atomics, commit bridge drift, JSON-safe reporting,
  and blocked/unknown status policy.
- A browser driver matrix plan can follow once those thresholds exist.
- A production contenteditable binding plan should wait until the threshold and
  matrix expectations are accepted.

## Files Changed

- `docs/HYBRID_INPUT_BROWSER_EVIDENCE_CLOSE_AUDIT.md`
- `tests/hybridInputBrowserEvidenceCloseAudit.test.ts`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/hybridInputBrowserDriverSmoke.test.ts`
- `tests/hybridInputBrowserQa.test.ts`
- `tests/hybridInputFoundationCloseAudit.test.ts`
- `tests/hybridManagedCardInputPlan.test.ts`

## Behavior Changed

- No runtime behavior changed.
- The project now has a close audit for the hybrid input browser evidence lane.

## Tests Run

- `npm.cmd test -- tests/hybridInputBrowserEvidenceCloseAudit.test.ts`
- `npm.cmd test -- tests/hybridInputBrowserDriverSmoke.test.ts`
- `npm.cmd test -- tests/hybridInputBrowserQa.test.ts`
- `npm.cmd test -- tests/hybridInputFoundationCloseAudit.test.ts`
- `npm.cmd test -- tests/hybridManagedCardInputPlan.test.ts`
- `npm.cmd run check`

## Intentionally Not Changed

- No production contenteditable binding.
- No production browser readiness claim.
- No production contenteditable readiness claim.
- No browser driver requirement in core check.
- No Playwright/Puppeteer dependency added to `@flowdoc/vnext-core`.
- No full-document contenteditable.
- No old FlowDocEditor runtime copy.
- No package/document schema change.
- No storage/backend route.
- No PDF/DOCX renderer work.
- No collaboration/offline behavior.
