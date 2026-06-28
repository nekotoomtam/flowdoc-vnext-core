# PDF Renderer Decision Gate

Status: Phase 178 PDF renderer decision gate.

Phase 178 decides the next PDF renderer direction after Phase 177 proved that
an artifact job can run through minimal PDF spike bytes, filesystem byte
storage, and rendered manifest/job records.

## Decision

Continue using the existing dependency-free minimal PDF spike for internal-alpha
vertical slice evidence only.

Do not choose or add a production PDF renderer package in Phase 178.

This keeps Phase 179 focused on measurement rollout risk and keeps Phase 180
able to run one bounded internal-alpha path without pulling renderer-package,
font-embedding, browser automation, or backend-route complexity forward too
early.

## Options Reviewed

### Continue Minimal PDF Spike For Internal Alpha

Accepted for the next lane.

- Already exists as `@flowdoc/pdf-renderer-spike`.
- Already consumes `VNextPdfRendererAdapterPlan`.
- Already produces deterministic text-only PDF bytes.
- Already stays dependency-free and storage-write-free.
- Already feeds Phase 177 artifact job execution and byte storage.
- Still explicitly not production fidelity.

### Harden The Spike Into A Production Renderer

Rejected for now.

- Font embedding, shaping fidelity, tables, images, headers/footers, page
  marks, accessibility, metadata, and layout drift thresholds are not proven.
- It would blur the boundary between spike evidence and production renderer
  readiness.

### Choose A Production PDF Package Now

Deferred.

- Candidate packages still need a requirement matrix and proof against measured
  renderer consumption, font handling, Thai/complex text, artifact byte
  stability, dependency footprint, and browser/Node parity expectations.
- Adding a production dependency before the measurement rollout gate would make
  the next failures harder to attribute.

### Use Browser Print-To-PDF

Rejected for this lane.

- It would introduce browser-driver/runtime coupling before the project has a
  production browser/contenteditable claim.
- It does not fit the current Node/internal-alpha storage-backed execution
  evidence lane.

## PASS

- Phase 136 produced dependency-free minimal PDF bytes.
- Phase 177 connected artifact job execution to those bytes and stored artifact
  bytes plus rendered manifest/job records.
- The next internal-alpha vertical slice can use the existing spike as bounded
  artifact evidence.
- No production PDF package, DOCX renderer, browser driver, backend route, or
  core dependency is needed to proceed to Phase 179.

## FAIL-BLOCKER

None for the decision gate.

Production PDF renderer readiness remains blocked.

## RISK

- Internal-alpha PDF bytes remain text-only and spike-grade.
- Continuing with the spike can hide production renderer complexity if later
  phases treat it as fidelity evidence.
- Renderer dependency selection is still unmade.
- Font embedding and complex text PDF fidelity remain unproven.

## UNKNOWN

- Production renderer package.
- PDF font embedding strategy.
- Thai and complex-script PDF fidelity thresholds.
- Image/table/header/footer rendering requirements.
- PDF metadata/accessibility requirements.
- Renderer package dependency budget.
- Browser/Node parity expectations for final renderer output.

## Files Changed

- `docs/PDF_RENDERER_DECISION_GATE.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/pdfRendererDecisionGate.test.ts`
- `tests/artifactJobExecutionSlice.test.ts`

## Behavior Changed

- Roadmap current next phase moves from Phase 178 to Phase 179.
- The project direction is now explicit: keep the minimal PDF spike only for
  internal-alpha evidence and defer production renderer-package selection.

## Tests Run

- `npm.cmd run check`

## Risks Left

- Production PDF renderer selection is still open.
- Measurement rollout must decide whether renderer-backed measurement evidence
  is stable enough for the internal-alpha slice.
- The internal-alpha vertical slice still needs a bounded end-to-end run after
  measurement rollout.

## Intentionally Not Changed

- No production PDF renderer package was added.
- No PDF/DOCX renderer implementation was changed.
- No DOCX work was introduced.
- No browser print/PDF driver was added.
- No backend route, worker, queue, auth, or authz behavior was implemented.
- No package/document schema changed.
- No production contenteditable or browser input readiness was claimed.
- No collaboration/offline behavior was added.
- No legacy editor runtime was copied.

Next recommended phase: Phase 179: Measurement Rollout Gate.
