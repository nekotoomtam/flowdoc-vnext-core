# V1 Hardening Backlog Triage Gate

Status: Phase 182 v1 hardening backlog triage gate.

Phase 182 ranks the remaining production blockers after the internal-alpha
lane closes and chooses the first production hardening lane.

This is a triage and decision boundary only. It does not implement production
input, backend routes, storage durability, renderer fidelity, measurement
replacement, schema changes, collaboration/offline behavior, or legacy runtime
copy.

## Evidence Reviewed

- `docs/CURRENT_STATUS.md` states that Phase 181 is closed as bounded
  internal-alpha evidence and production readiness remains blocked.
- `docs/NEXT_PHASE_POINTER.md` asks Phase 182 to rank hardening work and
  choose one first production lane.
- `docs/INTERNAL_ALPHA_CLOSE_AUDIT_AND_DOC_CONSOLIDATION_GATE.md` closes
  Phases 172-180 without claiming production readiness.
- `docs/INTERNAL_ALPHA_VERTICAL_SLICE.md` proves one bounded path from open
  document through edit, save/reload, minimal PDF spike bytes, artifact byte
  storage/retrieval, and a JSON-safe status report.
- `docs/MEASUREMENT_ROLLOUT_GATE.md` allows guarded internal-alpha measurement
  evidence only and blocks production/default measurement replacement until
  digest, native/WASM parity, drift thresholds, and a later binding phase are
  resolved.
- `docs/PDF_RENDERER_DECISION_GATE.md` keeps the minimal PDF spike as
  internal-alpha evidence only and defers production renderer-package
  selection.
- `docs/GUARDED_INPUT_INTEGRATION_CLOSE_AUDIT.md` accepts guarded input as
  internal-alpha sandbox evidence while blocking production contenteditable,
  clipboard, browser, and collaboration/offline readiness claims.

## Ranking Criteria

- Prefer the lane that unlocks several other production decisions.
- Prefer evidence gates before production runtime binding.
- Keep internal-alpha evidence separate from production readiness.
- Avoid schema, route, renderer, and input commitments until their upstream
  assumptions are explicit.
- Defer lanes that require server, browser, renderer, or collaboration runtime
  ownership before the repo has accepted their production contracts.

## Ranked Hardening Backlog

| Rank | Lane | Decision | Reason |
|---:|---|---|---|
| 1 | Measurement rollout / digest / parity / drift | Select first | Production editing and renderer fidelity need output truth. Phase 179 already identifies digest, native/WASM parity, drift thresholds, and default-measurer replacement as the production blockers, so this lane can harden evidence before runtime binding. |
| 2 | Production storage durability / transactions | Defer until measurement gate starts | Internal-alpha storage writes and artifact byte writes work but are non-transactional. Durable package/session/history/artifact strategy is needed before backend routes or collaboration, but it should not hide unresolved measurement/output truth. |
| 3 | Backend routes + auth/authz | Defer behind storage durability | Phase 176 route-shaped helpers are not server routes. Real routes need storage durability, idempotency, auth/authz, locking, and retention decisions first. |
| 4 | PDF renderer fidelity | Defer behind measurement hardening | Phase 178 explicitly keeps the PDF spike internal-alpha only. Production PDF renderer selection needs measurement profiles, font/text evidence, drift policy, and dependency budget before choosing a package. |
| 5 | Production input/contenteditable binding | Defer behind measurement and durable replay assumptions | Phase 171 proves guarded sandbox evidence only. Production DOM range, caret, IME, clipboard, field-chip, fallback, and commit behavior should not be bound before output truth and durable replay assumptions are less ambiguous. |
| 6 | DOCX renderer | Defer behind PDF/measurement direction | DOCX needs renderer-consumption fidelity and artifact strategy, but PDF is the first exact-output pressure point and shares measurement dependencies. |
| 7 | Collaboration/offline | Defer behind durable storage and operation replay | Collaboration/offline needs durable operation logs, conflict policy, replay semantics, and storage guarantees that are not production-ready yet. |
| 8 | Package/document schema changes if needed | Defer until evidence forces a change | Schema changes should not be used as planning shortcuts. Keep package v2/document v3 stable unless later production evidence proves a required change. |

## Selected First Production Hardening Lane

Select measurement rollout / digest / parity / drift as the first production
hardening lane.

The next phase should define the production measurement evidence gate before
any default measurer replacement:

- required digest identity and persistence expectations;
- native/WASM parity acceptance criteria;
- drift threshold policy and escalation rules;
- fixtures or scenarios needed to represent v1 output risk;
- the blockers that must clear before replacing `measureVNextText(...)`.

This selection does not replace `measureVNextText(...)`, bind a production
renderer-backed measurer, mutate pagination, execute external text engines in
core, or claim production measurement readiness.

## Deferred Lane Rationale

- Input/contenteditable is deferred because the guarded input lane is
  sandbox/internal-alpha evidence and production DOM/clipboard/IME binding
  would depend on output truth and durable replay assumptions that are still
  unsettled.
- Backend routes and auth/authz are deferred because route-shaped helpers are
  not server routes and need production storage, identity, idempotency, and
  authorization contracts first.
- Production storage is deferred behind the first measurement gate because
  durable storage can harden records, but it does not resolve renderer/output
  truth for generated artifacts.
- PDF fidelity is deferred because Phase 178 explicitly delayed production
  renderer package selection until measurement evidence is clearer.
- DOCX is deferred because it shares measurement/output risks and has less
  immediate evidence than the PDF spike path.
- Collaboration/offline is deferred because it depends on durable logs,
  replay, storage, conflict policy, and operation semantics.
- Schema changes are deferred unless later hardening evidence proves a required
  package/document contract change.

## Explicit Non-Work

- No production contenteditable implementation.
- No production clipboard or browser driver requirement.
- No backend route/server/auth/authz implementation.
- No production storage readiness claim.
- No production PDF renderer package or fidelity implementation.
- No DOCX renderer implementation.
- No default measurement replacement.
- No pagination mutation.
- No package/document schema change.
- No collaboration/offline behavior.
- No legacy editor runtime copy.

## PASS

- The remaining production blockers are ranked.
- The first production hardening lane is selected as measurement rollout /
  digest / parity / drift.
- Other lanes are deferred with explicit dependency reasons.
- Internal-alpha evidence remains bounded evidence and is not production
  readiness.
- Current-state pointers can advance beyond Phase 182 without starting
  production implementation.

## FAIL-BLOCKER

No blocker prevents completing this triage gate.

Production readiness remains blocked across measurement, storage/backend,
input, PDF/DOCX renderer fidelity, collaboration/offline, and possible schema
work.

## RISK

- Choosing measurement first may delay the most visible production input work.
- Measurement hardening may reveal PDF/DOCX renderer or font/text-engine
  requirements that require additional gates.
- Storage and backend durability remain unresolved while measurement evidence
  is hardened.
- The internal-alpha PDF spike can still be over-read as output fidelity if
  future phases do not keep the spike boundary visible.

## UNKNOWN

- Final production digest identity and retention policy.
- Native/WASM parity threshold for v1.
- Final drift thresholds and escalation policy.
- Which real v1 fixtures must be in the production measurement evidence set.
- Production PDF and DOCX renderer package choices.
- Production storage/backend/auth architecture.
- Collaboration/offline scope for v1.
- Whether package/document schema changes will be required later.

## Next Recommended Phase

Proceed to Phase 183: Measurement Digest Parity Drift Hardening Gate.

Reason:

- Phase 182 selects measurement as the first hardening lane;
- production/default measurement replacement is still blocked;
- the next safe step is to define the digest, parity, drift, and evidence
  acceptance gate before any production measurement binding.

## Files Changed

- `docs/V1_HARDENING_BACKLOG_TRIAGE_GATE.md`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/v1HardeningBacklogTriageGate.test.ts`
- `tests/internalAlphaCloseAuditConsolidation.test.ts`

## Behavior Changed

- No runtime behavior changed.
- The hardening backlog is now ranked.
- The first production hardening lane is selected as measurement rollout /
  digest / parity / drift.
- Current-state pointers move from Phase 182 to Phase 183.

## Tests Run

- `npm.cmd run check`

## Risks Left

- Define the Phase 183 measurement digest/parity/drift hardening gate.
- Keep `measureVNextText(...)` default replacement blocked until a later
  accepted binding phase.
- Keep deferred production lanes from inheriting internal-alpha claims.

## Intentionally Not Changed

- No production contenteditable implementation.
- No full-document contenteditable.
- No backend route/server/auth/authz behavior.
- No production storage readiness claim.
- No production PDF/DOCX renderer.
- No default measurement replacement.
- No package/document schema change.
- No collaboration/offline behavior.
- No legacy editor runtime copy.
