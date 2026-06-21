# FlowDoc vNext Core

FlowDoc vNext Core is the canonical core package for the next FlowDoc document
model. It owns document/package schema, relationship graph, operation planning,
history-ready operation records, measured pagination, renderer-consumption
contracts, export readiness, and the read-only bridge runtime.

This repository is rebuild-first. The old FlowDocEditor implementation is
reference evidence only; legacy/current code enters this repo only after it
passes `docs/LEGACY_MIGRATION_GATE.md`.

## Commands

```sh
npm install
npm run type-check
npm run test
npm run check
```

CI runs `npm ci` and `npm run check` on push to `main` and on pull requests.

## Package Boundary

- Package name: `@flowdoc/vnext-core`
- Module type: ESM
- Public entrypoint: `src/index.ts`
- Fixture export path: `@flowdoc/vnext-core/fixtures/*`
- Canonical persisted input: package v2 containing document v3

The package must remain runnable without any parent editor checkout.

## Core Rules

- Do not import parent editor runtime, current core runtime, app routes,
  reducers, renderer state, DOM state, or persistence compatibility paths.
- Do not accept old/prototype document shapes as canonical vNext input.
- Do not add compatibility adapters to exported core.
- Keep package parsing, graph facts, operations, pagination, renderer
  consumption, export readiness, and history-ready records consistent.
- Copy legacy/current code only when the unit is small, dependency-clean,
  rewritten into vNext vocabulary, and covered by vNext tests.

## Current Capability Slice

- Document schema version: `3`
- Package envelope target: `FlowDocPackage.packageVersion = 2`
- Implemented baseline nodes: `zone`, `text-block`, `columns`, `column`,
  `table`, `table-row`, `table-cell`, `toc`, `page-break`, `divider`, and
  `spacer`
- Product-shaped fixtures:
  - `fixtures/product-report-vnext.flowdoc.json`
  - `fixtures/product-report-vnext-minimal.flowdoc.json`
- Canonical package parser and serializer with safe parse variants
- Core runtime session entrypoint that parses canonical packages, builds graph
  indexes, exposes fields/data, and lists supported operation kinds without
  invoking layout or parent editor code
- Relationship graph baseline with parent refs, child indexes, nearest
  context, capabilities, and diagnostics
- Operation baseline:
  - `node.delete`
  - `node.duplicate`
  - `node.reorder`
  - `columns.insert`
  - `columns.layout.patch`
  - `text-block.insert`
  - `text-block.text.replace`
  - `table.row.insert`
  - `table.row.delete`
  - `table.column.insert`
  - `table.column.delete`
- Operation results include validation, scope, render invalidation, history
  policy, durable history-ready records, and replay helpers.
- Operation kernel contracts are split into command, result, registry,
  invalidation, and history modules while `runVNextOperation(...)` remains the
  behavior-preserving applier.
- Pagination/export baseline includes page boxes, source item order, text-block
  line fragmentation, static header/footer fragments, page-number inline
  resolution, column fragments, row-level table fragments, splittable text-cell
  rows, renderer-consumption audit, and export readiness.
- Read-only editor bridge runtime composes package parsing, graph, measured
  pagination, renderer-consumption audit, export readiness, and supported
  operation kinds through the core runtime session without accepting current
  runtime document input.

## Important Docs

- `AGENTS.md`: working agreement for agents in this repo
- `docs/WORKSPACE_BOUNDARY.md`: active project/package boundary
- `docs/LEGACY_MIGRATION_GATE.md`: decision gate before moving old code
- `docs/PACKAGE_CONSUMPTION_STRATEGY.md`: local and future dependency options
- `docs/VNEXT_CORE_REDESIGN_PLAN.md`: target architecture for the next core lane
- `docs/OPERATION_KERNEL_SPLIT_PLAN.md`: Lane B operation split boundary
- `docs/PHASE_LEDGER.md`: historical vNext core phase ledger
- `docs/PHASE_10_CLOSE_AUDIT.md`: pagination/export boundary close audit
- `docs/TABLE_PAGINATION_VNEXT_PLAN.md`: table pagination direction
- `docs/PHASE_12_REPOSITORY_EXTRACTION_CHECKLIST.md`: extraction record

## Not Implemented Yet

- visible editor runtime integration
- replacement for current parent `/api/paginate` or `/api/export`
- form-slot or submission-state runtime
- renderer-backed text measurement profile implementation
- non-text table-cell content splitting
- multi-page column balancing
- final pagination-aware TOC page resolution
- concrete PDF/DOCX renderer implementation beyond measured-fragment
  consumption contracts
- durable operation history persistence outside the in-memory replay helper
- product-level editor acceptance smokes
- publishing/distribution strategy beyond local package consumption
