# Hybrid Input Optional Browser Driver Smoke Boundary

Status: Phase 164 optional browser driver smoke boundary.

Phase 164 adds an optional real browser-driver smoke evidence boundary for the
hybrid active text-block island sandbox path. Phase 163 remains the source of
truth for browser-QA cases and JSON-safe report expectations.

This boundary does not claim production browser or contenteditable readiness.

## Contract

`examples/template-builder-sandbox/public/hybridInputBrowserDriverSmoke.js`
owns:

- `HYBRID_INPUT_BROWSER_DRIVER_SMOKE_SOURCE`;
- `HYBRID_INPUT_BROWSER_DRIVER_SMOKE_MODE`;
- `HYBRID_INPUT_BROWSER_DRIVER_SMOKE_CASES`;
- `createHybridInputBrowserDriverSmokeReport(...)`;
- `hybridInputBrowserDriverSmokeLabel(...)`.

The smoke report is JSON-safe and includes:

- source, mode, version, and status;
- Phase 163 baseline source/mode/case-count facts;
- optional driver environment facts;
- driver plan steps;
- hard limit status;
- package truth status;
- one case record per driver smoke scenario;
- summary counts for evidence and blocked cases.

The optional driver smoke cases cover:

- focus active text-block island;
- selection/caret movement;
- plain typing;
- IME/composition evidence when available;
- plain paste;
- blocked unsafe paste;
- delete/backspace near field chip;
- active island commit.

`examples/template-builder-sandbox/scripts/hybrid-input-browser-driver-smoke.mjs`
is a sandbox-local runner. It can consume externally supplied driver facts from
`FLOWDOC_BROWSER_DRIVER_FACTS_JSON` or `FLOWDOC_BROWSER_DRIVER_FACTS_PATH`.
When no driver facts are supplied, it emits a JSON-safe blocked report instead
of failing core check.

## PASS

- Optional browser-driver report shape exists.
- Missing driver facts produce an explicit blocked report.
- Externally supplied driver facts can prove focus, selection/caret movement,
  typing, IME composition, plain paste, unsafe paste blocking, field-chip
  delete guard, and active island commit.
- Unsafe DOM behavior stays blocked and does not become package truth.
- Active island commit evidence still uses the accepted
  `text-block.rich-inline.replace` bridge shape.
- Reports are JSON-safe.
- No browser automation dependency was added to `@flowdoc/vnext-core`.

## FAIL-BLOCKER

- No blocker prevents closing Phase 164.
- Production browser readiness remains blocked.
- Production contenteditable readiness remains blocked.

## RISK

- Real driver execution is optional and depends on externally supplied sandbox
  facts.
- Cross-browser selection, caret, paste, delete, and IME behavior can still
  diverge from the provided facts.
- The smoke boundary validates driver evidence shape, not product acceptance.
- Driver facts can become stale if a future sandbox UI changes without updating
  the external driver harness.

## UNKNOWN

- Which browser driver should be used for durable automation remains unknown.
- Browser matrix coverage remains unknown.
- IME event synthesis support remains unknown.
- Production contenteditable hardening thresholds remain unknown.

## Files Changed

- `docs/HYBRID_INPUT_OPTIONAL_BROWSER_DRIVER_SMOKE_BOUNDARY.md`
- `examples/template-builder-sandbox/public/hybridInputBrowserDriverSmoke.js`
- `examples/template-builder-sandbox/scripts/hybrid-input-browser-driver-smoke.mjs`
- `tests/hybridInputBrowserDriverSmoke.test.ts`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/hybridInputBrowserQa.test.ts`
- `tests/hybridInputFoundationCloseAudit.test.ts`
- `tests/hybridManagedCardInputPlan.test.ts`

## Behavior Changed

- The sandbox now has an optional browser-driver smoke report boundary.
- No runtime path requires a browser driver in core check.
- No package/document schema, storage route, production DOM binding, PDF/DOCX
  renderer, or collaboration/offline behavior changed.

## Tests Run

- `npm.cmd test -- tests/hybridInputBrowserDriverSmoke.test.ts`
- `npm.cmd test -- tests/hybridInputBrowserQa.test.ts`
- `npm.cmd test -- tests/hybridInputFoundationCloseAudit.test.ts`
- `npm.cmd test -- tests/hybridManagedCardInputPlan.test.ts`
- `npm.cmd run check`

## Intentionally Not Changed

- No browser driver requirement in core npm run check.
- No browser automation dependency added to `@flowdoc/vnext-core`.
- No production browser readiness claim.
- No production contenteditable readiness claim.
- No full-document contenteditable.
- No old FlowDocEditor runtime copy.
- No package/document schema change.
- No storage/backend route.
- No PDF/DOCX renderer work.
- No collaboration/offline behavior.

## Next Recommended Phase

Next recommended phase: Phase 165: Hybrid Input Browser Evidence Close Audit.

Reason:

- Phase 163 defines sandbox-local browser QA evidence.
- Phase 164 defines optional driver evidence intake and smoke reporting.
- The next safe step is to close the browser evidence lane before planning any
  production contenteditable binding.
