# PDF Renderer Adapter Boundary

Status: Phase 93 implementation boundary.

Phase 93 adds a pure PDF renderer adapter plan over measured renderer
consumption commands. It prepares a PDF-oriented draw plan and artifact
manifest without importing a PDF library, rendering bytes, writing storage, or
relayouting measured output.

This is a PDF renderer adapter boundary. It is not a concrete PDF renderer.

## Purpose

The exact-output path now has a PDF adapter step:

```text
measured pagination
  -> buildVNextMeasuredRendererConsumption(...)
  -> createVNextPdfRendererAdapterPlan(...)
  -> PDF draw plan + not-rendered artifact manifest
  -> future concrete PDF renderer
```

The boundary exists so concrete PDF work consumes measured render commands
instead of authored documents, DOM geometry, or renderer-side layout guesses.

## Module Ownership

`src/renderer/pdfAdapter.ts` owns:

- `VNEXT_PDF_RENDERER_ADAPTER_SOURCE`;
- `VNEXT_PDF_RENDERER_ADAPTER_MODE`;
- `createVNextPdfRendererAdapterPlan(...)`;
- PDF draw-command shape over measured renderer commands;
- PDF artifact manifest with `bytes: null`, `storageId: null`, and
  `status: "not-rendered"`;
- pass-through blocking and warning issues from renderer consumption;
- a no-relayout renderer contract for PDF output.

The module is pure TypeScript and Node-testable. It consumes
`VNextMeasuredRendererConsumption`. It does not accept authored documents, run
pagination, run layout, import PDF libraries, draw canvas output, write files,
write storage, call routes, use DOM state, or return PDF bytes.

## Truth Boundary

The adapter can carry only measured-command-derived PDF planning metadata:

- input is measured renderer consumption;
- `rendererContract.consumes = "measured-render-commands"`;
- `mayRelayout = false`;
- `requiresAuthoredDocumentForLayout = false`;
- blocked renderer consumption produces no PDF draw commands;
- artifact.status = `not-rendered`;
- PDF bytes remain `null`;
- storage id remains `null`.

## Acceptance Evidence

Phase 93 is covered by `tests/pdfRendererAdapter.test.ts`:

- consumable measured renderer commands become JSON-serializable PDF draw
  plans;
- blocked renderer consumption blocks PDF draw commands;
- source guards block concrete PDF libraries, parent runtime imports, DOM
  access, app routes, authored document input, pagination, layout, and export
  readiness execution;
- README, roadmap, and ledger entries keep the phase trail visible.

## Non-Goals

Phase 93 does not implement concrete PDF rendering, PDF bytes, PDF file writes,
artifact storage, font embedding, image embedding, vector drawing fidelity,
accessibility tags, page metadata, renderer-backed text measurement, exact
layout execution, DOCX output, preview output, backend routes, storage
adapters, or package/document schema changes.
