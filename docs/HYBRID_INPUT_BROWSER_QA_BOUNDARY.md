# Hybrid Input Browser QA Boundary

Status: Phase 163 hybrid input browser QA boundary.

Phase 163 creates a browser-QA/evidence boundary for the hybrid active
text-block island. It uses sandbox-local JSON-safe event facts and does not
require a browser driver in core check.

This boundary does not claim production contenteditable readiness.

## Contract

`examples/template-builder-sandbox/public/hybridInputBrowserQa.js` owns:

- `HYBRID_INPUT_BROWSER_QA_SOURCE`;
- `HYBRID_INPUT_BROWSER_QA_MODE`;
- `HYBRID_INPUT_BROWSER_QA_CASES`;
- `createHybridInputBrowserQaReport(...)`;
- `hybridInputBrowserQaLabel(...)`.

The report is JSON-safe and includes:

- source, mode, version, and status;
- environment facts, including optional browser driver status;
- report shape metadata;
- package truth status;
- hard limit status;
- one case record per QA scenario;
- summary counts for evidence, blocked, and fallback cases.

The QA scenarios cover:

- selection start/end;
- caret move;
- IME composition lifecycle;
- plain text paste;
- blocked rich/unsafe paste;
- delete/backspace near field chip;
- active island commit;
- fallback behavior;
- single active text-block island guard.

`examples/template-builder-sandbox/scripts/hybrid-input-browser-qa.mjs` is an
optional sandbox-local runner that writes the report to stdout as JSON. It does
not add Playwright, Puppeteer, or another browser-driver dependency.

## PASS

- Browser QA report shape exists.
- Selection start/end evidence is captured as UTF-16 offsets.
- Caret move evidence is captured as a collapsed UTF-16 selection.
- IME lifecycle evidence keeps commit blocked while composition is active.
- Plain text paste evidence is normalized before package mutation.
- Unsafe rich paste is explicitly blocked.
- Delete/backspace near a field chip transforms into a guarded field-chip
  command.
- Active island commit is represented as a planned existing rich inline
  replacement bridge request.
- Fallback textarea behavior is explicit.
- One active text-block island ownership remains guarded.
- The report is JSON-safe.

## FAIL / BLOCKER

- No blocker prevents closing Phase 163.
- Production contenteditable readiness remains blocked.
- Real browser-driver evidence remains optional and future work.

## RISK

- The boundary uses sandbox-local event facts instead of live browser
  automation.
- Browser selection, caret, paste, delete, and IME behavior may diverge across
  engines.
- Active island commit evidence remains planned-through-existing-bridge and is
  not production binding.
- Field-chip atomics are guarded by preflight evidence, not live DOM event
  handlers.

## UNKNOWN

- Cross-browser caret behavior is unknown.
- Real IME behavior for supported locales is unknown.
- Browser clipboard interoperability is unknown.
- Final production contenteditable hardening policy is unknown.
- Whether Phase 164 should use a browser driver depends on available sandbox
  dependency readiness.

## Files Changed

- `docs/HYBRID_INPUT_BROWSER_QA_BOUNDARY.md`
- `examples/template-builder-sandbox/public/hybridInputBrowserQa.js`
- `examples/template-builder-sandbox/scripts/hybrid-input-browser-qa.mjs`
- `tests/hybridInputBrowserQa.test.ts`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/hybridManagedCardInputPlan.test.ts`
- `tests/hybridInputFoundationCloseAudit.test.ts`

## Behavior Changed

- The sandbox now exposes an optional JSON-safe hybrid input browser QA report.
- No package/document schema, storage route, production DOM binding, PDF/DOCX
  renderer, or collaboration/offline behavior changed.

## Tests Run

- `npm.cmd test -- tests/hybridInputBrowserQa.test.ts`
- `npm.cmd test -- tests/hybridManagedCardInputPlan.test.ts`
- `npm.cmd test -- tests/hybridInputFoundationCloseAudit.test.ts`
- `npm.cmd run check`

## Risks Left

- Phase 164: Optional Browser Driver Smoke Boundary.
- Real browser-driver evidence remains future work.
- Production contenteditable binding remains blocked.

## Intentionally Not Changed

- No production contenteditable implementation.
- No production contenteditable readiness claim.
- No full-document contenteditable.
- No old FlowDocEditor runtime copy.
- No package/document schema change.
- No storage/backend route.
- No collaboration/offline behavior.
- No renderer/PDF/DOCX work.
- No browser driver requirement in core check.
