# Hybrid Input Hardening Threshold Plan

Status: Phase 166 hybrid input hardening threshold plan.

Phase 166 defines the threshold policy that decides whether hybrid active
text-block input evidence may move toward guarded internal-alpha integration.

This is a plan boundary only. It does not implement production contenteditable,
choose a browser matrix, or add browser automation dependencies to core.

## Status Policy

- PASS: evidence satisfies the accepted threshold and may be used by the
  guarded internal-alpha input path.
- WARNING: evidence is incomplete or narrow, but the selected v1 path can
  continue if the limitation is visible and does not corrupt package truth.
- BLOCKED: evidence is missing or unsafe in a way that can corrupt package
  truth, lose user input, break field-chip atomicity, or hide failure.
- UNKNOWN: evidence has not been collected or the threshold is not yet
  calibrated; UNKNOWN cannot be silently treated as PASS.

## Thresholds

Selection/caret:

- PASS: selection and caret facts are UTF-16 offsets, bounded to the active
  text block, JSON-safe, and never represented by live DOM Range objects.
- WARNING: selection direction or affinity is absent but start/end offsets are
  valid and collapsed caret movement is explicit.
- BLOCKED: offsets are missing, out of range, cross-block, DOM-object-backed, or
  disagree with the active island text snapshot.
- UNKNOWN: bidi/cross-line caret affinity is untested.

IME composition:

- PASS: composition start/end facts are visible and destructive commands,
  paste/delete, and commit are blocked while composition is active.
- WARNING: IME evidence is available only from sandbox-local facts for the
  selected language path.
- BLOCKED: commit can run while composition is active, composition state is
  lost, or text changes are silently committed without lifecycle evidence.
- UNKNOWN: broad IME/browser/OS coverage is untested.

Paste/delete:

- PASS: plain paste normalizes to text, unsafe rich paste is blocked, delete
  selection is bounded, and structural boundary delete is rejected.
- WARNING: supported rich paste is transformed only through known fragments and
  may fall back to plain text.
- BLOCKED: arbitrary DOM HTML becomes package truth, structural delete is
  allowed, or destructive operations bypass composition guard.
- UNKNOWN: browser clipboard interoperability is untested.

Field-chip atomicity:

- PASS: field chips stay atomic, internal edits are blocked, boundary delete
  transforms into explicit field-chip commands, and field key visibility is
  preserved.
- WARNING: copy/paste fidelity is limited to v1 field-chip facts.
- BLOCKED: field-chip internals become editable text, chip key is lost, or
  delete crosses chip boundaries as plain text.
- UNKNOWN: production DOM atomics are untested.

Active island commit:

- PASS: commit uses one active text block, safe captured text snapshot, command
  policy ready state, and the existing `text-block.rich-inline.replace` bridge.
- WARNING: v1 still uses full rich inline child replacement and may report drift
  for future granular operations.
- BLOCKED: raw DOM HTML enters package truth, stale revision is accepted, unsafe
  capture produces a bridge request, or multiple active islands can commit.
- UNKNOWN: production browser commit timing is untested.

Fallback behavior:

- PASS: unsupported or ineligible blocks reject or route to explicit textarea
  fallback without mutating canonical package data.
- WARNING: fallback loses rich styling but preserves plain text safely.
- BLOCKED: unsupported blocks open a rich contenteditable island or fallback
  commits without an explicit policy result.
- UNKNOWN: product UX for fallback messaging is untested.

JSON-safe report completeness:

- PASS: reports include source, mode, version, status, environment, hard
  limits, package truth, case records, summary counts, and no DOM objects.
- WARNING: optional driver facts are absent but represented by explicit blocked
  status.
- BLOCKED: report omits case status, includes DOM objects, hides blocked cases,
  or claims production readiness.
- UNKNOWN: long-running browser-driver artifact retention is untested.

## v1 Blockers

- Cross-block or DOM-object selection/caret facts.
- Commit while IME composition is active.
- Arbitrary DOM HTML becoming package truth.
- Field-chip internals editable as plain text.
- Unsafe capture producing a commit bridge request.
- Multiple active text-block islands committing.
- Missing saveable JSON-safe report for the selected v1 path.
- Hidden UNKNOWN state for selection/caret, IME, paste/delete, field-chip, or
  commit evidence.

## v1 Warnings

- Missing selection direction when start/end offsets are valid.
- Sandbox-local IME evidence before broader driver coverage.
- Plain-text fallback for unsupported rich paste.
- v1 full rich inline child replacement before granular rich inline operations.
- Limited fallback UX while diagnostics remain visible.

## PASS

- PASS/WARNING/BLOCKED/UNKNOWN policy is explicit.
- Thresholds cover selection/caret, IME, paste/delete, field-chip atomicity,
  active island commit, fallback behavior, and JSON-safe report completeness.
- v1 blockers and warnings are separated.

## FAIL-BLOCKER

- No blocker prevents Phase 167 browser matrix decision.
- Production contenteditable binding remains blocked until thresholds and matrix
  are accepted.

## RISK

- Thresholds are still policy, not live product acceptance.
- The first browser matrix may narrow v1 support.
- Some WARNING states may need to become BLOCKED if implementation finds data
  loss or hidden failure.

## UNKNOWN

- Final browser/OS/IME matrix is unknown until Phase 167.
- Product UX thresholds for fallback messaging are unknown.
- Production telemetry and evidence artifact retention are unknown.

## Files Changed

- `docs/HYBRID_INPUT_HARDENING_THRESHOLD_PLAN.md`
- `tests/hybridInputHardeningThresholdPlan.test.ts`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/hybridInputBrowserEvidenceCloseAudit.test.ts`
- `tests/hybridInputBrowserDriverSmoke.test.ts`
- `tests/hybridInputBrowserQa.test.ts`
- `tests/hybridInputFoundationCloseAudit.test.ts`
- `tests/hybridManagedCardInputPlan.test.ts`

## Behavior Changed

- No runtime behavior changed.
- The project now has a threshold policy before browser matrix or production
  input integration planning.

## Tests Run

- `npm.cmd test -- tests/hybridInputHardeningThresholdPlan.test.ts`
- `npm.cmd test -- tests/hybridInputBrowserEvidenceCloseAudit.test.ts`
- `npm.cmd test -- tests/hybridInputBrowserDriverSmoke.test.ts`
- `npm.cmd test -- tests/hybridInputBrowserQa.test.ts`
- `npm.cmd test -- tests/hybridInputFoundationCloseAudit.test.ts`
- `npm.cmd test -- tests/hybridManagedCardInputPlan.test.ts`
- `npm.cmd run check`

## Intentionally Not Changed

- No production contenteditable implementation.
- No browser matrix choice.
- No browser automation dependency added to core.
- No full-document contenteditable.
- No package/document schema change.
- No storage/backend route.
- No PDF/DOCX renderer work.
- No collaboration/offline behavior.

## Next Recommended Phase

Next recommended phase: Phase 167: Browser Matrix Decision.
