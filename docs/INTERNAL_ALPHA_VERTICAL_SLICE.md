# Internal Alpha Vertical Slice

Status: Phase 180 internal alpha vertical slice.

Phase 180 runs one bounded internal-alpha path:

```text
open document
-> edit active text block
-> save
-> reload
-> generate PDF spike bytes
-> store artifact
-> retrieve artifact
-> show bounded status report
```

This is still internal-alpha evidence. It is not production launch readiness.

## Scope

- Use the existing RC fixture and scenario from Phase 147.
- Open the canonical package as a vNext editable session.
- Apply one active text-block `text-block.rich-inline.replace` edit.
- Save package/session, durable-history, and rich-inline-session records through
  the external file-backed JSON adapter.
- Reload the package/session record from storage.
- Generate the PDF adapter plan from the reloaded package snapshot.
- Execute the Phase 177 artifact job path with the minimal PDF spike.
- Store and retrieve artifact bytes through the filesystem byte store.
- Produce a bounded JSON-safe RC/internal-alpha status report.

## PASS

- The package opens as canonical package v2/document v3.
- The active text-block edit is accepted and exact generation is marked stale.
- Session, durable history, and rich-inline records are written and read back.
- PDF generation uses the reloaded package snapshot.
- PDF spike bytes are stored, retrieved, and checked against the rendered
  manifest.
- Artifact job and manifest records reach rendered status.
- The final report has no fail blockers and remains productionReady false.

## FAIL-BLOCKER

None for the internal-alpha slice.

Any package/scenario validation failure, rich-inline rejection, storage failure,
PDF plan blocker, artifact job failure, byte retrieval failure, or status report
fail blocker stops the runner with bounded issues.

## RISK

- The PDF output remains minimal spike-grade evidence.
- Measurement evidence is guarded internal-alpha evidence only.
- Record writes and artifact byte writes are not transactionally linked.
- The runner is a direct helper, not a server route or queue worker.

## UNKNOWN

- Production contenteditable binding.
- Production storage/backend route/auth/authz.
- Production PDF/DOCX renderer fidelity.
- Production measurement digest/parity rollout.
- Multi-record transaction strategy.
- Collaboration/offline semantics.

## Files Changed

- `packages/internal-alpha-runner/src/internalAlphaVerticalSlice.ts`
- `packages/internal-alpha-runner/src/index.ts`
- `docs/INTERNAL_ALPHA_VERTICAL_SLICE.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/internalAlphaVerticalSlice.test.ts`
- `tests/measurementRolloutGate.test.ts`

## Behavior Changed

- `@flowdoc/internal-alpha-runner` now exports
  `runFlowDocInternalAlphaVerticalSlice(...)`.
- The internal-alpha runner can produce a complete bounded status report after
  saving/reloading records, generating PDF spike bytes, storing artifact bytes,
  and retrieving them.
- Roadmap current next phase moves from Phase 180 to Phase 181.

## Tests Run

- `npm.cmd run check`

## Risks Left

- Close the internal-alpha evidence lane with a focused close audit.
- Consolidate the current-state docs so daily work does not depend on scanning
  the full phase history.
- Production binding lanes remain separate and blocked.

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

Next recommended phase: Phase 181: Internal Alpha Close Audit And Documentation Consolidation Gate.
