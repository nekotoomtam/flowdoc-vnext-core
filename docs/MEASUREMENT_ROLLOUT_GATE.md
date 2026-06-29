# Measurement Rollout Gate

Status: Phase 179 measurement rollout gate.

Phase 179 decides whether the existing renderer-backed measurement evidence can
support the selected internal-alpha vertical slice after Phase 178 deferred
production PDF renderer selection.

This is a rollout decision boundary. It does not replace default pagination
measurement, change pagination, execute the external text engine, bind a
production measurer, or claim final text measurement truth.

## Decision

Allow guarded internal-alpha measurement evidence for the selected vertical
slice only.

Do not replace `measureVNextText(...)` defaults.

Do not promote renderer-backed measurement to production readiness.

The selected internal-alpha path may proceed when:

- `measurementProfileId` is explicit and stable;
- renderer-backed and approximate summaries use the same profile;
- renderer-backed evidence includes line boxes;
- drift is inside the selected tolerance, or over-tolerance is surfaced as a
  warning/blocker by the Phase 148 gate policy;
- digest and native/WASM parity gaps remain visible in the report.

For production rollout, digest must be pinned, native/WASM parity must be
matched, drift thresholds must be accepted, and the default measurer replacement
must be handled in a later guarded phase.

## Evidence Reviewed

- Phase 135: `docs/TEXT_ENGINE_RENDERER_BACKED_PROVIDER_BOUNDARY.md`
  establishes the external renderer-backed provider bridge, profile gating,
  line-box handoff, and drift report shape.
- Phase 148: `docs/VERTICAL_SLICE_MEASUREMENT_GATE_BOUNDARY.md` establishes
  the RC summary gate for `measurementProfileId`, line boxes, drift tolerance,
  digest status, and native/WASM parity status.
- Phase 175: `docs/STORAGE_BACKED_RC_ROUNDTRIP_SMOKE.md` carries the selected
  RC/internal-alpha measurement summary through the storage-backed report.
- Phase 177: `docs/ARTIFACT_JOB_EXECUTION_SLICE.md` proves artifact execution
  can consume the measurement/profile ids without requiring production
  measurement binding.
- Phase 178: `docs/PDF_RENDERER_DECISION_GATE.md` keeps the PDF spike
  internal-alpha only, so measurement rollout does not inherit renderer
  production claims.

## Rollout Policy

Internal alpha:

- allowed as guarded evidence;
- may proceed with `accepted` or `warning` Phase 148 measurement gate status;
- must preserve digest/parity warnings as UNKNOWN/RISK;
- must stay scoped to the selected internal-alpha scenario/profile.

Production:

- blocked until digest is present;
- blocked until native/WASM parity is matched;
- blocked until drift thresholds are accepted;
- blocked until a later phase explicitly binds the production/default measurer.

## PASS

- The measurement profile is explicit in the RC/internal-alpha report path.
- Phase 148 blocks wrong profiles and missing line boxes.
- Drift policy is already represented as warning or blocker.
- Digest and native/WASM parity status remain visible.
- Phase 180 can use the existing measurement gate as internal-alpha evidence
  without changing the default measurer.

## FAIL-BLOCKER

None for internal-alpha evidence.

Production measurement rollout remains blocked.

## RISK

- Missing digest/parity can still appear as warning in internal-alpha evidence.
- Drift tolerances are acceptable for internal alpha but not final production
  policy.
- The renderer-backed provider still depends on adapter evidence that is not a
  production default.
- Approximate and renderer-backed summaries are compared at summary grain, not
  by full document fidelity.

## UNKNOWN

- Final production drift tolerance.
- Final native/WASM parity promotion criteria.
- Production default-measurer replacement phase.
- Whether selected text-engine evidence covers enough real v1 documents.
- How measurement rollout interacts with future production PDF/DOCX fidelity.

## Files Changed

- `docs/MEASUREMENT_ROLLOUT_GATE.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/measurementRolloutGate.test.ts`
- `tests/pdfRendererDecisionGate.test.ts`

## Behavior Changed

- Roadmap current next phase moves from Phase 179 to Phase 180.
- Measurement evidence is accepted only for the bounded internal-alpha vertical
  slice path.
- Production/default measurement replacement remains explicitly blocked.

## Tests Run

- `npm.cmd run check`

## Risks Left

- Phase 180 still needs a bounded internal-alpha vertical slice run.
- Production measurement rollout must be revisited after digest/parity and
  drift evidence improve.
- Production PDF/DOCX fidelity remains outside this decision.

## Intentionally Not Changed

- No `measureVNextText(...)` default replacement.
- No pagination mutation.
- No production renderer-backed measurer binding.
- No external text-engine execution in core.
- No package/document schema change.
- No backend route, storage, PDF/DOCX, worker, queue, auth, or authz work.
- No production contenteditable or browser input readiness claim.
- No collaboration/offline behavior.
- No legacy editor runtime copy.

Next recommended phase: Phase 180: Internal Alpha Vertical Slice.
