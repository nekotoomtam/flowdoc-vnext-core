# PDF Renderer Spike Package Boundary

Status: Phase 136 external minimal PDF artifact spike package.

Phase 136 creates a private external PDF spike package that consumes public
vNext PDF adapter plans and produces minimal text-only PDF bytes. The core
package remains dependency-clean and does not import the spike.

## Evidence

- `packages/pdf-renderer-spike` is a private package that depends on
  `@flowdoc/vnext-core` as a public package boundary.
- `packages/pdf-renderer-spike/src/index.ts` contains a dependency-free
  minimal PDF writer for text draw commands and page boxes.
- The spike consumes `VNextPdfRendererAdapterPlan`, produces bytes and a local
  artifact manifest with media type, byte length, sha256, renderer profile id,
  measurement profile id, and `storageStatus = "not-stored"`.
- `tests/pdfRendererSpike.test.ts` proves non-empty PDF bytes, stable artifact
  manifest shape, blocked unsafe inputs, core dependency cleanliness, and
  documentation trail.

## Boundary

Allowed:

- consume public core PDF adapter plans;
- emit minimal text-only PDF bytes in the external package;
- hash bytes with sha256;
- keep artifact output local-only and not stored.

Blocked:

- adding PDF renderer dependencies to `@flowdoc/vnext-core`;
- importing the spike package from core;
- claiming production PDF fidelity;
- implementing DOCX in this phase;
- writing files or storage records;
- adding backend routes;
- mutating package/document schema.

## PASS

- Minimal PDF bytes are produced for a text-only measured plan.
- Artifact manifest records byte length and hash.
- Core remains dependency-clean.
- The spike is private and external to core.

## FAIL / BLOCKER

- No blocker was found for closing this spike boundary.

## RISK

- The PDF writer is intentionally minimal and not production fidelity.
- It uses built-in Helvetica and does not embed FlowDoc fonts.
- Thai text fidelity is not claimed by this spike.

## UNKNOWN

- Final production PDF renderer library and fidelity targets remain unknown.
- Font embedding, shaping, tags, images, tables, and storage behavior remain
  future work.

## Files Changed

- `packages/pdf-renderer-spike/package.json`
- `packages/pdf-renderer-spike/src/index.ts`
- `docs/PDF_RENDERER_SPIKE_PACKAGE_BOUNDARY.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/pdfRendererSpike.test.ts`

## Behavior Changed

- A private external spike package can produce local minimal PDF bytes.
- No core renderer, pagination, storage, backend, dependency, or schema
  behavior changed.

## Tests Run

- `npm.cmd test -- tests/pdfRendererSpike.test.ts`
- `npm.cmd run check`

## Risks Left

- Choose a production PDF renderer or continue hardening the external writer.
- Add font embedding and text shaping fidelity.
- Add artifact storage records in a later boundary.

## Intentionally Not Changed

- No PDF renderer dependency in `@flowdoc/vnext-core`.
- No core import of `packages/pdf-renderer-spike`.
- No DOCX output.
- No file/storage writes.
- No backend route.
- No production PDF fidelity claim.
- No package/document schema change.

## Non-goals

No production PDF renderer selection, font embedding, image/table fidelity,
DOCX output, storage write, backend route, artifact worker, or schema change is
introduced in this phase.
