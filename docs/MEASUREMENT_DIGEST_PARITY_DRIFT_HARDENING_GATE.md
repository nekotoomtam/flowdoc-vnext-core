# Measurement Digest Parity Drift Hardening Gate

Status: Phase 183 measurement digest parity drift hardening gate.

Phase 183 defines the production measurement evidence gate selected by Phase
182. It turns digest identity, native/WASM parity, drift thresholds, fixture
coverage, and replacement blockers into explicit policy before any production
measurement binding is attempted.

This is a gate and decision boundary only. It does not replace
`measureVNextText(...)`, mutate pagination, bind renderer-backed measurement
as production truth, execute external text engines in core, add production
PDF/DOCX renderer work, add backend/storage/auth behavior, implement
contenteditable, change package/document schema, add collaboration/offline
behavior, or copy legacy editor runtime.

## Evidence Reviewed

- `docs/CURRENT_STATUS.md` and `docs/NEXT_PHASE_POINTER.md` identify Phase
  183 as the current measurement hardening gate after Phase 182.
- `docs/V1_HARDENING_BACKLOG_TRIAGE_GATE.md` selects measurement rollout /
  digest / parity / drift as the first production hardening lane.
- `docs/MEASUREMENT_ROLLOUT_GATE.md` blocks production/default measurement
  replacement until digest, native/WASM parity, drift thresholds, and a later
  binding phase are resolved.
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_BOUNDARY.md` defines runtime identity
  ingredients and requires a pinned WASM digest before `parity-ready`.
- `docs/TEXT_ENGINE_RENDERER_BACKED_PROVIDER_BOUNDARY.md` defines the external
  provider bridge, line-box/profile gating, drift report shape, and default
  measurement independence.
- `docs/PDF_RENDERER_DECISION_GATE.md` keeps the minimal PDF spike as
  internal-alpha evidence only and defers production renderer-package
  selection.

## Required Digest Identity And Retention

Production measurement evidence must include a stable measurement evidence
identity record before any default-measurer replacement proposal:

- `measurementProfileId` pinned to the same font, shaper, segmenter, fallback,
  line-break policy, and output-shape ingredients used by the evidence;
- rustybuzz revision, ICU4X revision, ICU4X data revision, and output shape
  version;
- font asset ids and sha256 hashes for every measured style path;
- WASM artifact digest with `digestStatus: pinned` before `parity-ready`;
- evidence corpus id, fixture/scenario ids, source package/document fixture
  ids, and policy revision;
- runtime target list for native and WASM evidence, including Node-native and
  browser/worker WASM targets when parity is claimed;
- retention pointer for raw native evidence, raw WASM evidence, accepted drift
  summaries, and blocking/warning reports.

Digest retention expectation:

- raw evidence may live outside core if ownership stays package-local and the
  docs/tests point to stable fixture manifests;
- accepted gate summaries must be JSON-safe and small enough for root tests;
- changing digest, runtime revision, font hashes, output shape, or fixture
  corpus id resets parity and drift acceptance to `unknown` until the gate is
  rerun.

## Native/WASM Parity Acceptance Criteria

Native/WASM parity can be accepted only when all criteria below pass:

- runtime identity status is `parity-ready`;
- WASM digest is pinned and formatted as sha256;
- native and WASM evidence use the same `measurementProfileId`;
- compared facts include glyph id, glyph advance, glyph offset, cluster map,
  text range, line box, total width, total height, and line count;
- every required v1 fixture/scenario has matching native and WASM evidence;
- no missing runtime revision, missing font hash, missing compared fact, or
  wrong profile issue is present;
- parity report status is `matching` for required fixtures or explicitly
  blocked for release-gating differences.

Internal-alpha evidence may remain `identity-ready` or warning-only, but that
does not satisfy production parity.

## Drift Threshold Policy

Drift compares approximate/default measurement summaries with renderer-backed
evidence at the same `measurementProfileId`.

Production drift policy:

| Status | Width / height drift | Line-count drift | Required action |
|---|---|---|---|
| accepted | Within approved per-profile tolerances | 0 for required release fixtures | Eligible as evidence for a later binding proposal |
| warning | Over tolerance on non-release exploratory fixtures, or accepted by documented exception | 0 on required release fixtures | Keep evidence visible and do not replace the default measurer |
| blocked | Over tolerance on any required release fixture | Any non-zero line-count drift on required release fixtures | Block replacement and renderer fidelity claims |
| unknown | Missing digest, parity, profile, fixture, or raw evidence | Missing line boxes or compared facts | Treat as not production-ready |

Until a later phase sets numeric tolerances per profile, the production gate
must treat non-zero line-count drift on required release fixtures as blocked
and any missing digest/parity/profile evidence as unknown.

## Required V1 Measurement Evidence

The production measurement evidence set must cover at least these fixture and
scenario categories before replacement can be proposed:

- canonical product report fixture paragraphs with Latin text;
- Thai text and Thai line-break corpus samples;
- mixed Latin/Thai text in one text block;
- styled inline runs across style keys and font mappings;
- atomic field-ref / field-chip adjacency with surrounding text;
- table-cell text measurement at constrained widths;
- repeated header/table scenarios that consume measured line boxes;
- narrow and wide available widths for the same text;
- multi-line wrap and forced line-break examples;
- long text-block cases used by large-document acceptance tests;
- renderer-backed provider drift summaries for the same profile;
- digest and parity summaries for the same corpus ids.

This phase defines the required evidence. It does not add new fixtures, run
native/WASM comparison, or execute external engines in core.

## Blocked / Warning / Unknown Policy

Use these states for future measurement evidence gates:

- `accepted`: digest pinned, parity matching, profile aligned, required
  fixtures present, drift inside approved thresholds, and no release-gating
  issue remains.
- `warning`: evidence is useful for internal analysis but misses a non-release
  fixture, has an explicit non-release drift exception, or carries a
  non-blocking retention limitation.
- `blocked`: wrong profile, missing line boxes, missing digest for
  `parity-ready`, non-matching native/WASM required facts, line-count drift on
  required fixtures, or over-threshold release fixture drift.
- `unknown`: digest, parity, fixture coverage, profile identity, or raw
  evidence is absent or stale enough that production readiness cannot be
  assessed.

Warnings may support internal-alpha or exploratory work only. They cannot
support default-measurer replacement.

## Blockers Before Replacing `measureVNextText(...)`

Do not propose replacing `measureVNextText(...)` until all blockers below are
closed in a later binding phase:

- digest identity is pinned and retained for the selected production corpus;
- native/WASM parity is matching for required v1 fixtures;
- drift thresholds are numeric, per profile, reviewed, and accepted;
- required v1 fixture/scenario evidence is present and current;
- renderer-backed provider remains external and dependency-clean;
- root core still has no import of the external text-engine package;
- pagination cache/invalidation behavior has a separate migration plan;
- PDF/DOCX renderer fidelity choices are not inferred from the minimal PDF
  spike;
- fallback behavior for blocked/unknown measurement evidence is defined;
- production rollout, rollback, telemetry, and artifact-retention ownership are
  accepted by a later phase.

## Explicit Non-Work

- No `measureVNextText(...)` default replacement.
- No pagination mutation.
- No production renderer-backed measurement binding.
- No external text-engine execution in core.
- No production PDF/DOCX renderer work.
- No backend route/server/storage/auth/authz work.
- No production contenteditable implementation.
- No package/document schema change.
- No collaboration/offline behavior.
- No legacy editor runtime copy.

## PASS

- Digest identity and retention expectations are defined.
- Native/WASM parity acceptance criteria are defined.
- Drift threshold status and escalation policy are defined.
- Required v1 measurement fixture/scenario evidence is defined.
- Blocked/warning/unknown policy is explicit.
- Replacement blockers for `measureVNextText(...)` are explicit.
- Phase 183 remains a gate and does not bind production measurement.

## FAIL-BLOCKER

No blocker prevents completing this policy gate.

Production/default measurement replacement remains blocked until the evidence
gate is satisfied and a later binding phase explicitly accepts replacement.

## RISK

- The fixture categories may still be too small for real v1 documents.
- Numeric drift tolerances remain unselected.
- Native/WASM parity still depends on future digest and comparison evidence.
- PDF/DOCX fidelity may add measurement requirements not yet captured here.
- Keeping the provider external protects core but leaves integration ownership
  for a later phase.

## UNKNOWN

- Final numeric drift tolerances per profile.
- Final production corpus size and retention location.
- Final WASM artifact digest and runtime loading path.
- Whether browser/worker WASM evidence must be release-blocking for v1.
- Production PDF/DOCX renderer package choices.
- How measurement telemetry, rollout, and rollback will be owned.

## Next Recommended Phase

Proceed to Phase 184: V1 Measurement Fixture Evidence Matrix Gate.

Reason:

- Phase 183 defines the production measurement evidence policy;
- the next safe step is to select and map the required v1 measurement fixture
  matrix before executing external engines, binding production measurement, or
  replacing the default measurer.

## Files Changed

- `docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/measurementDigestParityDriftHardeningGate.test.ts`
- `tests/v1HardeningBacklogTriageGate.test.ts`

## Behavior Changed

- No runtime behavior changed.
- The production measurement evidence gate is now defined.
- Current-state pointers move from Phase 183 to Phase 184.

## Tests Run

- `npm.cmd run check`

## Risks Left

- Build the Phase 184 v1 measurement fixture evidence matrix.
- Keep `measureVNextText(...)` default replacement blocked until a later
  accepted binding phase.
- Keep production PDF/DOCX, backend/storage, input, schema, and collaboration
  work out of measurement evidence gates.

## Intentionally Not Changed

- No `measureVNextText(...)` default replacement.
- No pagination mutation.
- No production renderer-backed measurement binding.
- No external text-engine execution in core.
- No production PDF/DOCX renderer.
- No backend route/server/storage/auth/authz behavior.
- No production contenteditable implementation.
- No package/document schema change.
- No collaboration/offline behavior.
- No legacy editor runtime copy.
