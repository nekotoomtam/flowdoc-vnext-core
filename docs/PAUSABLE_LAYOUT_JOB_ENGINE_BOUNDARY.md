# Pausable Layout Job Engine Boundary

Status: Phase 96 implementation boundary.

This is a pausable layout job engine boundary.

It is not a concrete layout execution engine.

Phase 96 adds a bounded cursor engine over `VNextLayoutPipelinePlan.jobs`. The
engine lets future exact layout work advance plan jobs in small resumable chunks
without changing the existing measured pagination engine or claiming concrete
text/table placement execution.

## Boundary

The boundary lives in `src/pagination/layoutJobEngine.ts`.

It exposes:

- `VNEXT_PAUSABLE_LAYOUT_JOB_ENGINE_SOURCE`;
- `VNEXT_PAUSABLE_LAYOUT_JOB_ENGINE_MODE`;
- `runVNextPausableLayoutJobEngineChunk(...)`.

The engine consumes an existing `VNextLayoutPipelinePlan` and returns:

- a JSON-serializable chunk;
- current job offset and bounded result count;
- completed source item ids in `nextCursor`;
- stage summary counts;
- dependency blocking issues for invalid resume cursors or malformed plans;
- an engine contract with executesConcreteLayout = `false`,
  mayRelayoutDocument = `false`, mutatesDocument = `false`, and
  storesCursor = `false`.

## Truth

The engine may record that plan jobs have been advanced in dependency order.
It may pause and resume by passing the returned cursor into the next call.

The engine must not:

- call `paginateVNextDocument(...)`;
- call `runVNextLayoutPipeline(...)`;
- build renderer consumption;
- execute concrete text/table placement;
- measure text;
- relayout authored documents;
- mutate document/package data;
- store cursor state;
- call backend routes;
- import browser, PDF, DOCX, canvas, or headless renderer libraries.

Existing `runVNextLayoutPipelineChunk(...)` remains the measured
pagination/artifact chunking boundary. This phase introduces a lower-level job
cursor contract so future exact layout work has a safe place to attach concrete
executors after the contract is proven.

## Acceptance Evidence

- `tests/layoutJobEngine.test.ts` proves bounded pause/resume chunks,
  dependency blocking for skipped cursors, source independence, and
  documentation trail.
- `tests/layoutPipeline.test.ts` remains the existing layout pipeline contract.
- `src/index.ts` exports the new boundary without changing package/document
  schema, measured pagination behavior, or renderer consumption behavior.

## Non-Goals

No concrete layout execution, text measurement execution, table placement
engine, deep table split, TOC resolution, renderer-backed pagination execution,
artifact output, backend route, storage adapter, cursor persistence, worker
queue, cancellation runtime, prioritization runtime, or schema change is
introduced in this phase.
