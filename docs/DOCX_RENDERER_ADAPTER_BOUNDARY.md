# DOCX Renderer Adapter Boundary

Status: Phase 94 implementation boundary.

Phase 94 adds a pure DOCX renderer adapter plan over measured renderer
consumption commands. It prepares a DOCX-oriented assembly plan and artifact
manifest without importing a DOCX library, rendering bytes, writing storage, or
relayouting measured output.

This is a DOCX renderer adapter boundary. It is not a concrete DOCX renderer.

## Purpose

The exact-output path now has a DOCX adapter step:

```text
measured pagination
  -> buildVNextMeasuredRendererConsumption(...)
  -> createVNextDocxRendererAdapterPlan(...)
  -> DOCX assembly plan + not-rendered artifact manifest
  -> future concrete DOCX renderer
```

The boundary exists so concrete DOCX work starts from measured render commands
instead of authored documents, DOM geometry, or renderer-side layout guesses.

## Module Ownership

`src/renderer/docxAdapter.ts` owns:

- `VNEXT_DOCX_RENDERER_ADAPTER_SOURCE`;
- `VNEXT_DOCX_RENDERER_ADAPTER_MODE`;
- `createVNextDocxRendererAdapterPlan(...)`;
- DOCX assembly-command shape over measured renderer commands;
- DOCX artifact manifest with `bytes: null`, `storageId: null`, and
  `status: "not-rendered"`;
- pass-through blocking and warning issues from renderer consumption;
- a no-relayout renderer contract for DOCX output.

The module is pure TypeScript and Node-testable. It consumes
`VNextMeasuredRendererConsumption`. It does not accept authored documents, run
pagination, run layout, import DOCX libraries, write files, write storage, call
routes, use DOM state, or return DOCX bytes.

## Truth Boundary

The adapter can carry only measured-command-derived DOCX planning metadata:

- input is measured renderer consumption;
- `rendererContract.consumes = "measured-render-commands"`;
- `mayRelayout = false`;
- `requiresAuthoredDocumentForLayout = false`;
- `mayUseSourceDocumentForStructure = false`;
- blocked renderer consumption produces no DOCX assembly commands;
- artifact.status = `not-rendered`;
- DOCX bytes remain `null`;
- storage id remains `null`.

## Acceptance Evidence

Phase 94 is covered by `tests/docxRendererAdapter.test.ts`:

- consumable measured renderer commands become JSON-serializable DOCX assembly
  plans;
- blocked renderer consumption blocks DOCX assembly commands;
- source guards block concrete DOCX libraries, parent runtime imports, DOM
  access, app routes, authored document input, pagination, layout, and export
  readiness execution;
- README, roadmap, and ledger entries keep the phase trail visible.

## Non-Goals

Phase 94 does not implement concrete DOCX rendering, DOCX bytes, DOCX file
writes, artifact storage, style mapping, numbering, headers/footers, table
fidelity, media embedding, accessibility metadata, renderer-backed text
measurement, exact layout execution, PDF output, preview output, backend
routes, storage adapters, or package/document schema changes.
