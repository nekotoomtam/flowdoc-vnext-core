# Layout Pipeline Split Plan

Status: implementation baseline complete.

This document owns Lane C from `docs/VNEXT_CORE_REDESIGN_PLAN.md`.

## Goal

Move layout/pagination toward a staged pipeline that can be chunked and resumed
without letting renderer/export code become the layout source of truth.

## Split Boundaries

| Stage | Owns | Must Not Own |
|---|---|---|
| `plan` | pagination plan, source order, source item identities | text measurement or page placement |
| `measure` | deterministic measurement job scheduling | renderer output or authored document mutation |
| `paginate` | measured page/fragment production | renderer relayout |
| `fragment-artifact` | bounded measured page chunks | authored package input |
| `renderer-artifact` | render command chunks from measured fragments | DOM/editor canvas state |
| `export-readiness` | readiness summary and issues | concrete PDF/DOCX rendering |

## Current Implementation

- `src/pagination/layoutPipeline.ts` introduces the public staged layout
  pipeline contract.
- `createVNextLayoutPipelinePlan(...)` builds deterministic jobs from the
  existing pagination plan.
- `runVNextLayoutPipelineChunk(...)` resumes measurement-job scheduling before
  emitting bounded measured page/render-command artifact chunks.
- `runVNextLayoutPipeline(...)` returns a complete pipeline run with measured
  pagination, renderer-consumption, and export-readiness artifacts.
- `paginateVNextDocument(...)` remains the behavior-preserving measured
  pagination engine for this baseline.

## Current Behavior Contract

- The pipeline source is canonical `DocumentNode` input only.
- Measurement jobs are stable source-item jobs, not parent/editor tasks.
- Artifact chunks contain measured pages and render commands for a bounded page
  range.
- Renderer contracts still require measured pagination fragments and forbid
  relayout.
- Existing measured pagination behavior remains covered by current tests.

## Not Changed

- No concrete PDF/DOCX renderer was added.
- No parent editor runtime, DOM/canvas state, or current app route was imported.
- The internal table/text placement algorithm in `measuredPagination.ts`
  remains the current engine.
- Measurement job results are scheduled pipeline records; moving actual text
  measurement execution behind resumable job results remains a later split.
- Non-text table-cell splitting, multi-page column balancing, and final TOC page
  resolution remain deferred.

## Verification

- `tests/layoutPipeline.test.ts` covers staged planning, measurement-job
  chunk/resume, bounded page/render-command artifact chunks, full pipeline
  contracts, and independence from old runtime names.
- Existing pagination/export tests keep the behavior-preserving engine covered.
- `npm run check` must pass.
