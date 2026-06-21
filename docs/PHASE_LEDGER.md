# vNext Core Phase Ledger

Parent goal:

- Build a standalone FlowDoc vNext core that owns the next document model.

| Phase | Goal | Status | Evidence |
|---|---|---|---|
| 1 | Node vocabulary and model direction | done | parent repo docs |
| 2 | Relationship graph contract | done | parent repo docs |
| 3 | Package/schema boundary | done | parent repo docs |
| 4 | Prototype adapter plan | done | parent repo docs |
| 5 | First schema/graph slice | done | parent repo core slice |
| 5.5 | Extractable package boundary | done | this repository root |
| 6 | vNext product fixture | done | `fixtures/product-report-vnext.flowdoc.json`; `tests/packageFixture.test.ts` |
| 7 | Legacy cutoff and canonical-only boundary | done | `README.md`; `docs/WORKSPACE_BOUNDARY.md` |
| 8 | Canonical package parser/serializer | done | `src/persistence/package.ts`; `tests/packageFixture.test.ts` |
| 9 | vNext operations | done | `src/operations/documentOperations.ts`; `tests/operations.test.ts` |
| 10 | Pagination/export integration | done | `docs/PHASE_10_CLOSE_AUDIT.md`; `docs/TABLE_PAGINATION_VNEXT_PLAN.md`; `src/pagination/paginationPlan.ts`; `src/pagination/textMeasurement.ts`; `src/pagination/measuredPagination.ts`; `src/pagination/rendererConsumption.ts`; `src/pagination/exportReadiness.ts`; `tests/paginationPlan.test.ts`; `tests/textMeasurement.test.ts`; `tests/measuredPagination.test.ts`; `tests/rendererConsumption.test.ts`; `tests/exportReadiness.test.ts` |
| 11 | Editor runtime bridge and generation artifact lane | done | `src/editorBridge/runtime.ts`; `tests/editorBridgeRuntime.test.ts`; parent consumer evidence lives outside this repository |
| 12 | Physical repository extraction | done | `docs/PHASE_12_REPOSITORY_EXTRACTION_CHECKLIST.md`; `tests/extractionBoundary.test.ts`; `npm.cmd run check` |
| 13 | Repository foundation | done | `AGENTS.md`; `docs/LEGACY_MIGRATION_GATE.md`; `docs/PACKAGE_CONSUMPTION_STRATEGY.md`; `.github/workflows/check.yml`; `README.md` |
| 14 | Core redesign target and runtime session foundation | done | `docs/VNEXT_CORE_REDESIGN_PLAN.md`; `src/runtime/session.ts`; `tests/runtimeSession.test.ts` |
| 15 | Operation kernel split | done | `docs/OPERATION_KERNEL_SPLIT_PLAN.md`; `src/operations/commands.ts`; `src/operations/results.ts`; `src/operations/invalidation.ts`; `src/operations/history.ts`; `src/operations/registry.ts`; `tests/operationKernel.test.ts` |
| 16 | Layout pipeline split | done | `docs/LAYOUT_PIPELINE_SPLIT_PLAN.md`; `src/pagination/layoutPipeline.ts`; `tests/layoutPipeline.test.ts` |
| 17 | Layout internal extraction baseline | done | `docs/LAYOUT_INTERNAL_EXTRACTION_PLAN.md`; `src/pagination/measuredTypes.ts`; `src/pagination/measuredFragments.ts`; `tests/measuredFragments.test.ts` |
| 18 | Template authoring architecture reset | draft | `docs/TEMPLATE_AUTHORING_CORE_PLAN.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/SHARED_TEMPLATE_CORE_CONTRACT.md`; `docs/NODE_FAMILY_CAPABILITY_MODEL.md`; `docs/FRONTEND_AUTHORING_RUNTIME_PLAN.md`; `docs/TEXT_EDITING_TRANSACTION_PLAN.md`; `docs/LIVE_LAYOUT_AND_EXACT_GENERATION_PLAN.md`; `docs/KEY_REGISTRY_BINDING_PLAN.md`; `docs/BACKEND_GENERATION_RUNTIME_PLAN.md`; `docs/LARGE_DOCUMENT_PERFORMANCE_CONTRACT.md`; `docs/LEGACY_REFERENCE_LESSONS.md` |
| 19 | Key registry and data diagnostics | done | `src/binding/keyDataDiagnostics.ts`; `tests/keyDataDiagnostics.test.ts` |
| 20 | Editable authoring session | done | `src/authoring/editableSession.ts`; `tests/editableSession.test.ts` |
| 21 | Text transaction engine | done | `src/authoring/textTransactions.ts`; `tests/textTransactions.test.ts` |
| 22 | Intent history | done | `src/authoring/intentHistory.ts`; `tests/intentHistory.test.ts` |
| 23 | Live layout boundary | done | `src/authoring/liveLayoutBoundary.ts`; `tests/liveLayoutBoundary.test.ts` |

## Current Rule

This repository should prefer isolated vNext implementation over reuse.
Current/prototype structures are reference evidence only and are not accepted
inputs for exported core. The canonical persisted input is
`FlowDocPackage.packageVersion = 2` with `document.version = 3`. Any future
one-off converter must live outside exported core and outside required vNext
checks.

## Phase 18 Draft Design Reset

Phase 18 reframes the next architecture around a dynamic node-based docgen
template builder:

- shared template core remains the common schema, graph, key, validation,
  operation, and package boundary;
- implementation should proceed through phase-sized work in
  `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`, starting with Phase 19 key
  diagnostics or Phase 20 editable-session contracts;
- frontend authoring runtime becomes a first-class runtime for smooth typing,
  selection, IME, node composition, dirty scopes, and live layout;
- backend generation runtime remains deterministic for template plus data to
  exact layout, renderer commands, readiness, and output artifacts;
- node design is governed by families, roles, props, and capabilities rather
  than prototype-style node proliferation;
- large-document behavior is an acceptance contract from the start;
- old FlowDocEditor behavior is reference evidence only and must be classified
  before influencing vNext work.

This phase is a draft architecture reset, not an implementation claim. It does
not change package/document versions, add key history, implement repeat
regions, replace API routes, or flip a visible editor runtime.

## Phase 19 Key/Data Diagnostics

Phase 19 adds the first vNext-native key/data diagnostics for the docgen
template path:

- `collectVNextDocumentFieldRefUsages(...)` collects authored inline
  `field-ref` usages from canonical document v3, including section, zone,
  text-block, inline index, and table row/cell context when present.
- `assessVNextKeyDataDiagnostics(...)` validates package-level field
  definitions, authored field references, and optional scalar data snapshots.
- diagnostics report `ready`, `ready-with-warnings`, or `blocked` without
  materializing bound output.
- registry diagnostics catch mismatched record/definition keys, duplicate
  definition keys, missing definitions, and non-inline `image`/`collection`
  field references.
- data diagnostics catch unknown data keys, invalid scalar value types, and
  unsupported scalar snapshot values for `image`/`collection` fields.
- the public export surface includes `src/binding/keyDataDiagnostics.ts`
  through `src/index.ts`.
- `tests/keyDataDiagnostics.test.ts` covers product fixture usage collection,
  table-cell field-ref context, missing-definition warnings, registry errors,
  data snapshot errors, and the standalone usage collector.

This phase intentionally does not bind values into authored documents, write
resolved values back into `DocumentNode`, add key history, implement required
field policy, add enum option validation, expand repeat/collection data,
replace API routes, add frontend editor runtime, or change layout/export
behavior.

## Phase 20 Editable Authoring Session

Phase 20 adds the first pure authoring-session boundary for the frontend
runtime direction:

- `createVNextEditableSession(...)` and
  `safeCreateVNextEditableSession(...)` create a session from canonical package
  v2/document v3 input only.
- the session exposes the working package/document, relationship graph,
  key/data diagnostics, revision counters, empty dirty scopes, and typed
  session-only selection state.
- raw/current document-shaped input is rejected before session creation.
- package serialization keeps selection, revisions, and dirty scopes outside
  persisted package state.
- `tests/editableSession.test.ts` covers canonical session creation, raw input
  rejection, session-only state isolation, selection shape availability, and
  independence from parent runtime, DOM, layout, and old node names.
- the public export surface includes `src/authoring/editableSession.ts`
  through `src/index.ts`.

This phase intentionally does not add visible editor integration, React/DOM
runtime code, text transactions, undo/redo, live layout, API routes, layout or
export behavior changes, key history, repeat/collection behavior, or package
version changes.

## Phase 21 Text Transaction Engine

Phase 21 adds the first pure text-transaction engine for smooth authoring:

- `projectVNextTextBlockInlines(...)` creates stable text-block model offsets
  over authored inline children, with text nodes editable and atomic inline
  nodes represented as one model character.
- `normalizeVNextTextRange(...)` provides a canonical range shape for anchor
  and focus offsets.
- `runVNextTextTransaction(...)` supports `text.insert`, `text.delete`,
  `text.range.replace`, and `inline.field-ref.insert` against canonical
  document v3 input.
- field references remain authored atomic inline nodes; plain text delete or
  replace cannot edit/remove them as ordinary text.
- successful transactions return the mutated document, text-block dirty scope,
  and a content history intent/merge key for future authoring history.
- `tests/textTransactions.test.ts` covers projection offsets, insert/delete,
  range replace, atomic field-ref insertion/rejection, dirty scope, independence
  from DOM/parent/layout execution, and the existing coarse
  `text-block.text.replace` operation remaining available.

This phase intentionally does not add visible editor integration, DOM selection
mapping, IME lifecycle, undo/redo storage, split/merge block commands, inline
style patch commands, live layout, API routes, exact generation, key history,
repeat/collection behavior, or package version changes.

## Phase 22 Intent History

Phase 22 adds a pure authoring intent-history contract over text transaction
results:

- `createVNextAuthoringIntentHistoryRecord(...)` converts committed and
  rejected text transaction results into JSON-serializable authoring intent
  records.
- `appendVNextAuthoringIntentHistoryRecord(...)` assigns transaction group ids
  and coalesces repeated typing-session records with the same merge key/source.
- `appendVNextAuthoringIntentHistoryResult(...)` combines record creation and
  append for transaction result flows.
- `createVNextSelectionOnlyAuthoringHistoryRecord(...)` marks selection-only
  changes as non-durable so they do not enter durable undo history.
- `groupVNextAuthoringIntentHistory(...)` summarizes committed/rejected
  records by group for future undo/redo UI and diagnostics.
- paste/IME-style insert records are single-entry groups even when backed by
  `text.insert`.
- rejected transaction records preserve failure reason and issues without
  mutating the input document.
- `tests/intentHistory.test.ts` covers typing coalescing, paste grouping,
  field-ref insert grouping, non-durable selection changes, rejected
  diagnostics, and independence from DOM/parent/layout execution.

This phase intentionally does not add concrete undo/redo storage, replay or
inverse-operation generation, visible editor integration, focus restoration,
DOM selection mapping, IME lifecycle runtime, live layout, API routes, exact
generation, key history, repeat/collection behavior, or package version
changes.

## Phase 23 Live Layout Boundary

Phase 23 adds a pure live-layout boundary without replacing measured
pagination:

- `resolveVNextLiveLayoutBoundary(...)` accepts selection impact,
  authoring-history records, or explicit dirty scopes.
- selection-only impact returns `no-layout-request` and leaves exact generation
  unchanged.
- committed text authoring history produces a `text-content` live layout
  request scoped to the affected text block and parent.
- table dirty scopes produce a `table-region` live layout request scoped to the
  affected table and parent.
- every layout request includes visible range, affected scope, live layout
  freshness, and an explicit exact-generation stale marker.
- exact generation declares `finalTruth: "measured-pagination"`; live layout is
  not export readiness.
- `tests/liveLayoutBoundary.test.ts` covers selection no-op, text scope,
  table scope, exact generation stale/unchanged markers, and independence from
  measured pagination/export readiness execution.

This phase intentionally does not add a browser live-layout renderer, DOM
viewport integration, text measurement cache, exact layout execution,
pagination/export readiness replacement, API routes, key history,
repeat/collection behavior, or package version changes.

## Phase 12 Extraction Record

Phase 12 is complete for physical repository extraction. This repository has
standalone package files, local type-check/test scripts, canonical vNext
fixtures, parser/serializer tests, and boundary tests proving `src/**` does not
import parent app or current core paths.

Parent app consumers remain outside the extracted core. They should consume the
package through an explicit parent bridge/dependency boundary.

## Phase 10 Close

Phase 10 is closed for the vNext core pagination/export boundary. The close
audit is `docs/PHASE_10_CLOSE_AUDIT.md`. Current pagination/export work is
vNext-only and now has both a planning boundary and measured skeleton output:

- `buildVNextPaginationPlan(...)` produces page boxes, zone source order,
  source item split-policy hints, and measurement status.
- `paginateVNextDocument(...)` consumes the vNext plan and emits measured page
  fragments for body/static zones, forced page breaks, text-block line
  fragmentation, and basic page-number inline resolution.
- `measureVNextText(...)` defines the vNext text measurement boundary with
  stable cache keys, line boxes, measurement profiles, cache hit/miss metadata,
  and operation-driven cache invalidation.
- `columns` nodes now produce `widthShare`/gap-based container and child
  fragments instead of one opaque atomic fragment.
- `table` nodes now produce page-segment, row, cell, and measured text
  fragments with row-level page breaks and repeated header rows.
- over-tall breakable table rows whose cell children are text blocks now split
  by measured line ranges while `allowBreak=false` rows stay atomic and warn.
- table cell child policy is explicit for measured text, atomic spacer/divider,
  generated TOC, and ignored page-break nodes.
- `buildVNextMeasuredRendererConsumption(...)` converts measured fragments into
  renderer commands without accepting authored document input, and blocks when
  table fragments lack geometry, hierarchy, line-range, or table metadata.
- `assessVNextMeasuredPaginationExportReadiness(...)` reports ready,
  ready-with-warnings, or blocked from measured pagination warnings and
  renderer-consumption issues while preserving the no-relayout renderer
  contract.
- `docs/TABLE_PAGINATION_VNEXT_PLAN.md` locks the selected table direction as
  row-level pagination plus splittable cell text, with full table-engine work
  deferred until the B path is stable.
- `createApproximateVNextTextMeasurer(...)` provides deterministic measurement
  for tests and early local integration without importing the parent runtime.
- `buildVNextExportPlan(...)` declares that PDF and DOCX consume measured
  pagination output and must not relayout.
- `resolveVNextPaginationInvalidation(...)` maps operation results to stale or
  unchanged pagination/export readiness.

This phase intentionally does not import the parent layout engine, provide a
renderer-backed measurement profile implementation, split non-text table cell
content across pages, balance columns across multiple pages, finalize TOC page
references, or render PDF/DOCX beyond the measured-fragment consumption
contract.

## Phase 16 Layout Pipeline Split

Phase 16 adds the first vNext-native staged layout pipeline contract over the
existing measured pagination engine:

- `createVNextLayoutPipelinePlan(...)` turns pagination source items into
  deterministic layout jobs and measurement jobs.
- `runVNextLayoutPipelineChunk(...)` provides cursor-based measurement-job
  scheduling and bounded measured page/render-command artifact chunks.
- `runVNextLayoutPipeline(...)` returns the complete measured pagination,
  renderer-consumption, and export-readiness artifacts through one layout
  pipeline API.
- artifact chunks preserve the no-relayout renderer contract and include only
  commands for the bounded page range.
- `tests/layoutPipeline.test.ts` proves stage order, measurement-job
  chunk/resume, artifact page chunking, render-command bounds, and source
  independence.

This phase intentionally keeps `paginateVNextDocument(...)` as the placement
engine. Moving actual text/table placement behind resumable job results remains
a later internal split after the public pipeline contract is stable.

## Phase 17 Layout Internal Extraction Baseline

Phase 17 starts splitting measured pagination internals without changing text,
table, renderer, or export behavior:

- `measuredTypes.ts` owns measured pagination options, warnings, fragments,
  pages, and pagination result contracts.
- `measuredFragments.ts` owns measured page creation, source-item backed
  fragment creation, geometry rounding, body/static fragment id buckets, and
  missing-source warnings.
- `paginateVNextDocument(...)` now uses the measured fragment builder while
  remaining the behavior-preserving placement engine.
- renderer/export/layout pipeline and editor bridge consumers import measured
  contracts from `measuredTypes.ts` instead of the placement engine.
- `tests/measuredFragments.test.ts` proves fragment builder behavior directly.

This phase intentionally does not change wrap quality, line breaking, table
splitting, or measurement profile behavior. The next layout-internal target is
text-block line-slice planning, then wrap quality improvements.

## Phase 11 Parent Bridge Boundary

Phase 11 connected the old/current editor environment to vNext through an
explicit bridge without making legacy/current runtime structures the vNext
source of truth. Parent adapter docs and routes are external consumer evidence,
not core ownership.

Current Phase 11 progress:

- `createVNextEditorBridgeRuntime(...)` and
  `safeCreateVNextEditorBridgeRuntime(...)` build a read-only bridge runtime
  from canonical vNext package input only.
- The bridge runtime includes relationship graph, measured pagination,
  renderer-consumption audit, export readiness, and supported operation kinds.
- Raw/current runtime document input is rejected by the bridge parser.
- Import boundary is locked: parent editor imports should go through its bridge
  host and package dependency, not through vNext internals.
- Parent editor bridge host is implemented as a read-only bounded snapshot API.
- Editor/generation boundary mapping stays in the parent consumer repository:
  editor-authored template truth, generation request truth, bound runtime view,
  measured pagination, renderer-consumption, and output artifacts are separate.
- Current `/api/paginate` and `/api/export` remain current-runtime-shaped
  endpoints; the vNext bridge remains canonical-package-only.
- First read-only generation diagnostic consumer is implemented in the parent
  app. It calls the bridge host, records request data as not consumed, and
  reports no editor state/history/selection/pagination/canvas/API side effects.
- First mutating operation pilot is implemented through the parent bridge host.
  It runs `text-block.text.replace`, returns validation/history-ready/scope and
  render-invalidation metadata, and reports no current editor state/history/
  selection/pagination/canvas/API side effects.
- Runtime flip review remains a parent consumer concern. The extracted core
  exposes canonical package/runtime behavior but does not mutate parent editor
  state, history, canvas, selection, WYSIWYG, pagination, or export/API paths.
- Post-Phase-11 generation artifact lanes expose parent-app readiness,
  measured preview artifact, and bounded SVG preview artifact routes without
  replacing current `/api/paginate`, current `/api/export`, editor state,
  history, selection, or canvas behavior.

## Phase 9 Baseline

Current operation commands are graph-backed and canonical-only:

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

They return validation policy, history policy, render invalidation, and graph
scope metadata. `createVNextOperationHistoryRecord(...)` converts committed and
rejected operation results into JSON-serializable history-ready records.
`appendVNextOperationHistoryRecord(...)` and
`replayVNextOperationHistory(...)` provide an in-memory replay contract. This
does not persist durable operation history or integrate with the current editor
runtime yet.
