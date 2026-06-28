# Guarded Input Integration Plan

Status: Phase 168 guarded input integration plan.

Phase 168 defines where the hybrid active text-block island may integrate with
the app shell after the Phase 166 hardening thresholds and Phase 167 browser
matrix decision.

This is a plan boundary only. It does not implement production contenteditable,
full-document contenteditable, or production browser readiness.

## Integration Ownership

Managed card runtime:

- owns card selection, card-level focus, block activation intent, and inactive
  managed-card rendering;
- does not own text editing internals, DOM Range objects, or package mutation.

Active text-block island runtime:

- mounts only for one eligible active text block selected by the app shell;
- owns browser-local text snapshot, UTF-16 selection/caret facts, composition
  state, and pre-commit capture facts;
- must close or route to fallback before another island opens.

Command policy:

- owns allow, reject, fallback, and transform decisions for typing, paste,
  delete, field-chip commands, commit, and unsupported targets;
- must block destructive commands while IME composition is active.

Commit bridge:

- accepts only the safe active island capture shape;
- routes the v1 accepted commit through `text-block.rich-inline.replace`;
- rejects stale revision, unsafe capture, raw DOM HTML, and multi-island
  commits.

Fallback textarea path:

- owns plain-text editing for unsupported or ineligible blocks;
- preserves plain text while making rich formatting loss explicit;
- must not masquerade as rich contenteditable support.

App-shell integration:

- owns choosing the active block, providing the current block packet, refreshing
  the packet after accepted commits, and closing stale islands;
- remains outside `@flowdoc/vnext-core` and does not import legacy editor
  runtime layers into the package.

## Browser-Local Versus Core Truth

Browser-local only:

- focus state;
- live DOM selection or Range objects;
- IME composition lifecycle state;
- transient paste/delete preflight facts;
- draft text snapshot before safe capture;
- fallback textarea UI state.

Commits into vNext core:

- accepted `text-block.rich-inline.replace` command input;
- JSON-safe command result, validation result, history-ready record, and render
  invalidation metadata already owned by vNext core boundaries.

Never commits into vNext core:

- arbitrary DOM HTML;
- live DOM objects;
- browser selection objects;
- untrusted clipboard fragments;
- unsupported block edits.

## Guard Policy

Styled runs:

- v1 may replace the full rich inline child list through the accepted bridge;
- unknown or unsupported rich styling falls back or rejects before commit.

Atomic inline field chips:

- field chips remain atomic;
- internal edits are blocked;
- delete/backspace near a chip must transform into explicit field-chip command
  intent or reject.

IME composition:

- composition start/update/end facts stay browser-local but must be visible in
  evidence;
- destructive commands, paste/delete, and commit are blocked while composition
  is active.

Selection and caret:

- selection/caret facts are UTF-16 offsets bounded to the active text block;
- cross-block, DOM-object-backed, or out-of-range selections are blocked.

Paste and delete:

- plain paste may normalize to text;
- unsafe rich paste and arbitrary DOM HTML are blocked;
- structural delete is rejected;
- delete selection is bounded to the active text block.

Unsupported blocks:

- unsupported or ineligible blocks do not open a rich island;
- they route to fallback textarea or reject with explicit status.

## Packet Refresh

- App shell opens an active island from a current text-block packet.
- The island records the packet revision and active block id.
- Commit bridge rejects stale revision or active block mismatch.
- Accepted commit returns a core command result.
- App shell refreshes the packet from canonical package state before the next
  edit.

## Phase Sequence After 168

- Phase 169: Guarded Input Runtime Slice 1.
- Phase 170: Paste/Delete/Field-chip Input Slice.
- Phase 171: Input Integration Close Audit.

## PASS

- Integration ownership is split across managed card runtime, active island
  runtime, command policy, commit bridge, fallback textarea path, and app shell.
- Browser-local state and vNext core commit truth are separated.
- Guard policy covers styled runs, field chips, IME, selection/caret,
  paste/delete, and unsupported blocks.
- Packet refresh and stale packet rejection are explicit.

## FAIL-BLOCKER

- No blocker prevents Phase 169 guarded runtime slice planning.
- Production contenteditable binding remains blocked.
- Production browser readiness remains blocked.

## RISK

- The first runtime slice must avoid growing into a monolithic editor runtime.
- Fallback UX remains policy-only.
- v1 full rich inline child replacement may still be too coarse for later
  collaboration/offline claims.

## UNKNOWN

- Exact app-shell UI mount point remains consumer-owned.
- Final browser-driver automation strategy remains unknown.
- Rich inline granular operation roadmap remains future work.

## Files Changed

- `docs/GUARDED_INPUT_INTEGRATION_PLAN.md`
- `tests/guardedInputIntegrationPlan.test.ts`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/hybridInputBrowserMatrixDecision.test.ts`
- `tests/hybridInputHardeningThresholdPlan.test.ts`
- `tests/hybridInputBrowserEvidenceCloseAudit.test.ts`
- `tests/hybridInputBrowserDriverSmoke.test.ts`
- `tests/hybridInputBrowserQa.test.ts`
- `tests/hybridInputFoundationCloseAudit.test.ts`
- `tests/hybridManagedCardInputPlan.test.ts`

## Behavior Changed

- No runtime behavior changed.
- The current next implementation lane is now bounded as a guarded runtime
  slice after an integration plan, not production contenteditable binding.

## Tests Run

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

- Runtime slice implementation may expose missing packet-refresh details.
- Browser-local IME behavior still needs evidence from the selected v1 matrix.
- Field-chip delete transforms need integration smoke before production claims.

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

Next recommended phase: Phase 169: Guarded Input Runtime Slice 1.
