# Pre-Phase 172 Risk / Unknown Register

Status: pre-Phase 172 risk and unknown sharpening.

This register sharpens the open risks from the Phase 171 guarded input
integration close audit before Phase 172 chooses any concrete storage direction.

It is a documentation and guard boundary only. It does not implement storage,
production input, browser automation, clipboard binding, collaboration/offline,
or renderer work.

## Storage Gate Rule

Phase 172 may choose a concrete storage direction only if it treats the guarded
input lane as internal-alpha sandbox evidence, not production input truth.

Storage decisions must not assume:

- production contenteditable readiness;
- production browser readiness;
- production clipboard readiness;
- collaboration/offline replay readiness;
- applied granular field-chip operations;
- durable packet refresh semantics from the consumer app shell.

## RISK

Input/browser evidence:

- Thai IME evidence is bounded to the selected Windows Chromium/Edge lane and
  remains insufficient for production browser readiness.
- Browser-driver evidence is optional/sandbox-local and cannot be used as a
  required core check dependency.
- Visual caret parity, mobile browsers, Firefox, Safari, Linux, and macOS remain
  outside the accepted v1 evidence matrix.

Commit and rich-inline semantics:

- The active island bridge uses v1 full `text-block.rich-inline.replace`, which
  is acceptable for the single-user vertical slice but too coarse for
  collaboration/offline replay claims.
- Field-chip delete, paste, copy, and replace-with-text remain atomic command
  facts or planned intents until a later operation lane applies them.
- Raw DOM HTML and live DOM selection objects remain forbidden as package truth.

App-shell and fallback ownership:

- Product-shell mount, packet refresh, stale capture handling, and fallback UX
  remain consumer-owned and are not solved by storage selection.
- Textarea fallback preserves plain text but may lose rich styling; storage must
  not hide that fallback loss as a successful rich edit.

Storage coupling:

- Storage choice may need to record operation history, packet revisions, and
  evidence artifacts, but those records must not imply production input
  readiness.
- Persisted evidence may age as browser, IME, and renderer behavior changes.

## UNKNOWN

- Exact production contenteditable binding strategy.
- Browser-driver matrix, artifact retention policy, and required human QA path.
- Thai IME acceptance threshold for beta.
- Product fallback UX, telemetry, and user-facing blocked-state messaging.
- Granular rich-inline operation strategy for collaboration/offline replay.
- Concrete storage durability target, object-store/database split, migration
  path, and local/offline constraints.

## Pre-Phase 172 Acceptance Guard

Before Phase 172 can pick storage:

- storage candidates must label input/browser readiness as a dependency risk;
- storage candidates must not require browser automation in core check;
- storage candidates must preserve package/document schema independence unless
  a separate schema phase is accepted;
- storage candidates must not add backend routes, PDF/DOCX renderer work, or
  collaboration/offline behavior as part of the choice gate;
- evidence retention must be described as artifact/report storage, not
  production input truth.

## PASS

- RISK and UNKNOWN items are separated and sharpened.
- Phase 172 is still allowed to proceed as a storage choice gate.
- Storage gate assumptions explicitly exclude production input readiness.

## FAIL-BLOCKER

- No blocker prevents Phase 172 planning.
- Production contenteditable readiness remains blocked.
- Production browser readiness remains blocked.
- Collaboration/offline readiness remains blocked.

## Files Changed

- `docs/PRE_PHASE_172_RISK_UNKNOWN_REGISTER.md`
- `tests/prePhase172RiskUnknownRegister.test.ts`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/guardedInputIntegrationCloseAudit.test.ts`

## Behavior Changed

- No runtime behavior changed.
- Phase 172 now has an explicit risk/unknown guard before storage choice work.

## Tests Run

- `npm.cmd test -- tests/prePhase172RiskUnknownRegister.test.ts tests/guardedInputIntegrationCloseAudit.test.ts`
- `npm.cmd run check`

## Risks Left

- Phase 172 still must choose concrete storage constraints.
- Production input binding remains a later lane.
- Browser/IME evidence remains narrow.

## Intentionally Not Changed

- No production contenteditable implementation.
- No production browser readiness claim.
- No production clipboard binding.
- No full-document contenteditable.
- No browser automation dependency added to core.
- No browser driver requirement in core check.
- No package/document schema change.
- No storage/backend route.
- No PDF/DOCX renderer work.
- No collaboration/offline behavior.
- No legacy editor runtime copy.

## Next Recommended Phase

Next recommended phase remains: Phase 172: Concrete Storage Choice Gate.
