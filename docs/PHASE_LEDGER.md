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
| 24 | Backend generation runtime | done | `src/generation/runtime.ts`; `tests/generationRuntime.test.ts` |
| 25 | Large document acceptance harness | done | `tests/largeDocumentAcceptance.test.ts` |
| 26 | Runtime usage map and action/job contract | done | `docs/RUNTIME_USAGE_MAP.md`; `docs/ACTION_JOB_CONTRACT.md` |
| 27 | Template builder sandbox boundary | done | `examples/template-builder-sandbox`; `docs/TEMPLATE_BUILDER_SANDBOX_BOUNDARY.md`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 28 | Structure selection first | done | `docs/TEMPLATE_BUILDER_INTERACTION_BOUNDARY.md`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `examples/template-builder-sandbox/public/app.js`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 29 | One safe mutation path | done | `docs/TEMPLATE_BUILDER_MUTATION_BRIDGE_BOUNDARY.md`; `examples/template-builder-sandbox/src/mutationBridge.ts`; `examples/template-builder-sandbox/scripts/serve.mjs`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 30 | Snapshot delta boundary | done | `docs/TEMPLATE_BUILDER_DELTA_BOUNDARY.md`; `examples/template-builder-sandbox/src/mutationBridge.ts`; `examples/template-builder-sandbox/scripts/serve.mjs`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 31 | Browser runtime cache boundary | done | `docs/TEMPLATE_BUILDER_BROWSER_CACHE_BOUNDARY.md`; `examples/template-builder-sandbox/public/app.js`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 32 | Explicit text action boundary | done | `docs/TEMPLATE_BUILDER_TEXT_ACTION_BOUNDARY.md`; `examples/template-builder-sandbox/src/mutationBridge.ts`; `examples/template-builder-sandbox/scripts/serve.mjs`; `examples/template-builder-sandbox/public/app.js`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 33 | Sandbox authoring history boundary | done | `docs/TEMPLATE_BUILDER_HISTORY_BOUNDARY.md`; `examples/template-builder-sandbox/src/mutationBridge.ts`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `examples/template-builder-sandbox/public/app.js`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 34 | Sandbox undo redo execution boundary | done | `docs/TEMPLATE_BUILDER_UNDO_REDO_BOUNDARY.md`; `examples/template-builder-sandbox/src/mutationBridge.ts`; `examples/template-builder-sandbox/scripts/serve.mjs`; `examples/template-builder-sandbox/public/app.js`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 35 | Sandbox live layout request boundary | done | `docs/TEMPLATE_BUILDER_LIVE_LAYOUT_BOUNDARY.md`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `examples/template-builder-sandbox/src/mutationBridge.ts`; `examples/template-builder-sandbox/public/app.js`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 36 | WYSIWYG text draft design lock | done | `docs/TEMPLATE_BUILDER_WYSIWYG_DRAFT_DESIGN_LOCK.md`; `docs/FRONTEND_AUTHORING_RUNTIME_PLAN.md`; `docs/TEXT_EDITING_TRANSACTION_PLAN.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md` |
| 37 | WYSIWYG text draft boundary | done | `docs/TEMPLATE_BUILDER_WYSIWYG_DRAFT_BOUNDARY.md`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `examples/template-builder-sandbox/public/app.js`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 38 | Draft selection boundary | done | `docs/TEMPLATE_BUILDER_DRAFT_SELECTION_BOUNDARY.md`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 39 | Draft command context boundary | done | `docs/TEMPLATE_BUILDER_DRAFT_COMMAND_CONTEXT_BOUNDARY.md`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |

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

## Phase 24 Backend Generation Runtime

Phase 24 adds the first API-facing generation runtime contract without
replacing parent routes:

- `safeParseVNextGenerationRequest(...)` parses generation requests that carry
  an inline canonical package, optional request data snapshot, output kind, and
  request/idempotency metadata.
- `assessVNextGenerationReadiness(...)` performs readiness-only assessment for
  template package, document graph, and key/data diagnostics.
- raw/current document-shaped input is rejected through the canonical package
  parser.
- request data diagnostics are reported separately from package/document
  errors, so API users can distinguish bad template input from bad request
  data.
- readiness-only results explicitly keep `artifact` and `generatedDocument`
  null and mark exact layout/artifact rendering as not run.
- `tests/generationRuntime.test.ts` covers canonical package acceptance, raw
  document rejection, data diagnostics separated from package errors,
  readiness-only no-artifact behavior, no generated authored document output,
  and independence from parent routes/layout/render execution.

This phase intentionally does not add concrete API routes, template id/version
loading, storage/idempotency implementation, exact layout execution, PDF/DOCX
rendering, generated output artifacts, key history, repeat/collection
expansion, or package version changes.

## Phase 25 Large Document Acceptance Harness

Phase 25 makes large-document behavior test-visible before visible editor work:

- `tests/largeDocumentAcceptance.test.ts` includes a generated canonical
  package helper with 520 body text blocks, a 140-row table, body field
  references, table-cell field references, registry, and data snapshot.
- relationship graph validation covers the generated large document shape and
  catches invalid parent/child or orphan-node regressions.
- a text transaction near the beginning of the large document reports one
  text-block dirty scope, one parent node, and an explicit exact-generation
  stale marker without running exact layout.
- a text transaction near the end of the large document remains scoped to the
  edited text block and does not widen into table or document scope.
- generation readiness accepts the large canonical package, validates field
  data, keeps exact layout `not-run`, keeps artifact rendering `not-rendered`,
  and returns no generated authored document.
- source guards prove the large-document typing and readiness paths do not
  import exact pagination, layout pipeline, or renderer consumption execution.

This phase intentionally does not add browser rendering, viewport scrolling,
timing budgets, exact layout execution, API routes, PDF/DOCX rendering,
storage, key history, repeat/collection behavior, or package version changes.

## Phase 26 Runtime Usage Map And Action/Job Contract

Phase 26 locks the app-facing design before visible UI/API work:

- `docs/RUNTIME_USAGE_MAP.md` maps how the future frontend template builder and
  backend generation runtime use the shared core without creating separate
  document truths.
- the runtime usage map defines the first editor shell shape at a structural
  level: toolbar, node tree, document canvas/live view, inspector, and status
  area.
- it maps ownership across canonical package state, frontend session state,
  authoring transactions, live layout requests, backend generation, and
  artifacts.
- it documents frontend flows for opening templates, typing, inserting field
  references, selection changes, saving, and backend readiness/generation.
- `docs/ACTION_JOB_CONTRACT.md` defines action, command, transaction, intent,
  job, workflow, and artifact vocabulary.
- the action/job contract separates immediate, background-live, deferred-exact,
  and external-artifact lanes to prevent active typing from waiting on exact
  generation or artifact work.
- the action/job contract also defines future AI-callable action rules:
  permission levels, approval gates, audit expectations, safe edit workflow,
  and hard prohibitions against AI bypassing core transactions, diagnostics,
  history, dirty scopes, or stale-work checks.
- it defines stale-work and revision rules for future scheduling, without
  implementing a queue, worker, browser renderer, or server route.

This phase intentionally does not add React/DOM UI, visual design polish,
runtime job scheduling, worker queues, API routes, storage, exact rendering,
PDF/DOCX artifacts, key history, repeat/collection behavior, or package version
changes.

## Phase 27 Template Builder Sandbox Boundary

Phase 27 creates an extractable package-shaped sandbox for the first visible
template builder shell:

- `examples/template-builder-sandbox` owns its own package scripts and can run
  separately from the root core package.
- the sandbox depends on `@flowdoc/vnext-core` through `file:../..` during
  local development and imports core from the public package entrypoint.
- a sandbox Node bridge generates a browser snapshot from the canonical product
  fixture by calling editable-session and generation-readiness core APIs.
- the browser shell renders toolbar, node tree, canvas/live-view placeholder,
  inspector, and status regions from the generated snapshot.
- `docs/TEMPLATE_BUILDER_SANDBOX_BOUNDARY.md` records the extraction and runtime
  boundary.
- `tests/templateBuilderSandboxBoundary.test.ts` guards package extraction,
  public core import usage, and parent-route independence.

This phase intentionally does not implement real typing, DOM selection mapping,
IME behavior, live layout rendering, scheduler queues, backend API routes,
save/publish persistence, exact layout, preview, PDF, or DOCX rendering.

## Phase 28 Structure Selection First

Phase 28 makes sandbox selection meaningful without introducing text mutation:

- the generated sandbox snapshot now carries core-derived relationship facts
  for each node: section, zone, parent, path, children, operation surface, and
  capabilities.
- the browser shell keeps selected node id and selection source as browser-only
  state; those facts are not written into package data or the generated
  snapshot.
- tree, canvas, inspector links, and status bar synchronize around one selected
  node id.
- nested canvas clicks select the nearest clicked node instead of bubbling to
  an ancestor.
- the inspector shows selected node details, parent/context, breadcrumb,
  capabilities, direct children, field references, and action states.
- action states use `wired`, `planned`, and `blocked` so unavailable work is
  visible without being executable.
- `docs/TEMPLATE_BUILDER_INTERACTION_BOUNDARY.md` records the structure-first
  interaction contract.
- `tests/templateBuilderSandboxBoundary.test.ts` guards relationship snapshot
  facts, browser-only selection, and action-state vocabulary.

This phase intentionally does not implement real typing, DOM caret mapping,
IME behavior, live layout rendering, undo/redo execution, save/publish
persistence, backend API routes, exact layout, preview, PDF, or DOCX rendering.

## Phase 29 One Safe Mutation Path

Phase 29 proves a single mutation route before fluid typing work starts:

- the sandbox server now exposes `GET /api/snapshot` and
  `POST /api/actions/replace-text`.
- `createTemplateBuilderMutationBridge(...)` owns an in-memory working package
  initialized from the canonical product fixture.
- the bridge accepts only selected plain text-block replacement and rejects
  non-text nodes, empty text, field refs, page numbers, line breaks, and other
  atomic inline content.
- accepted mutations call `runVNextTextTransaction(...)` with
  `text.range.replace` through the public `@flowdoc/vnext-core` boundary.
- successful mutations update the in-memory package, document revision,
  mutation count, dirty scope count, and last mutation summary, then return a
  refreshed snapshot.
- rejected mutations return issues and a refreshed snapshot without changing
  the working package.
- the browser fetches `/api/snapshot`, posts replace actions to the bridge, and
  rerenders from the returned snapshot; it still does not patch authored JSON
  directly.
- `docs/TEMPLATE_BUILDER_MUTATION_BRIDGE_BOUNDARY.md` records the mutation
  bridge contract.
- `tests/templateBuilderSandboxBoundary.test.ts` guards the API routes, public
  core imports, static snapshot bridge metadata, and in-memory mutation
  behavior.

This phase intentionally does not implement per-keystroke typing, DOM caret
mapping, IME behavior, partial browser text ranges, undo/redo execution,
save/publish persistence, backend API routes outside the sandbox server, exact
layout, preview, PDF, or DOCX rendering.

## Phase 30 Snapshot Delta Boundary

Phase 30 adds a bounded response contract beside the existing full snapshot
mutation response:

- `POST /api/actions/replace-text` keeps returning a refreshed snapshot by
  default so the Phase 29 browser path stays stable.
- `POST /api/actions/replace-text?response=packet` returns a
  `flowdoc-template-builder-change-packet` without the complete `sections`
  snapshot tree.
- the packet includes packet version, action, mutation status, base/next
  revisions, mutation count, changed node ids, changed node summaries, affected
  parent ids, dirty scopes, diagnostics status, and issues.
- accepted packet responses include only the changed text-block summary and
  dirty scope from the core text transaction.
- rejected packet responses preserve revision and mutation count and report
  issues without sending a full snapshot.
- the browser status bar can show the last packet received while still using
  the full snapshot path for current rendering.
- `docs/TEMPLATE_BUILDER_DELTA_BOUNDARY.md` records the transitional packet
  contract and the future normalized-cache handoff.
- `tests/templateBuilderSandboxBoundary.test.ts` guards packet-only mutation
  behavior and proves the packet response does not carry the full `sections`
  tree.

This phase intentionally does not implement a persistent browser normalized
cache, per-keystroke typing, DOM caret mapping, IME behavior, undo/redo
execution, live layout rendering, save/publish persistence, backend API routes
outside the sandbox server, exact layout, preview, PDF, or DOCX rendering.

## Phase 31 Browser Runtime Cache Boundary

Phase 31 makes the browser consume packet-only mutation responses:

- the sandbox shell still boots from `GET /api/snapshot`.
- after boot, the browser builds a runtime cache with node id lookup, boot
  revision, current document revision, node count, packet apply count, last
  packet revision, and fallback snapshot refresh count.
- selection and inspector node lookup now read from the browser runtime cache
  instead of flattening the snapshot tree for each lookup.
- the bridge replace UI posts to
  `POST /api/actions/replace-text?response=packet`.
- accepted and rejected packet responses update mutation bridge metadata,
  diagnostics, dirty scope count, document revision, and changed node summaries
  in the browser snapshot view model.
- packets must match the browser's local document revision before they apply.
- missing, stale, or snapshot-required packets trigger an explicit snapshot
  refresh fallback.
- the status bar reports cache mode, node count, and packet apply count.
- `docs/TEMPLATE_BUILDER_BROWSER_CACHE_BOUNDARY.md` records the derived-cache
  contract and the non-canonical ownership rule.
- `tests/templateBuilderSandboxBoundary.test.ts` guards packet-only browser
  action routing and runtime-cache source boundaries.

This phase intentionally does not implement per-keystroke typing, DOM caret
mapping, IME behavior, partial browser text ranges, undo/redo execution, live
layout rendering, structural packet operations, durable browser cache
persistence, save/publish persistence, backend API routes outside the sandbox
server, exact layout, preview, PDF, or DOCX rendering.

## Phase 32 Explicit Text Action Boundary

Phase 32 adds one granular text action without taking on caret or IME work:

- `sandbox.insertPlainTextAtEnd` is exposed through the sandbox mutation bridge.
- the sandbox server exposes
  `POST /api/actions/insert-text-at-end`.
- accepted inserts call `runVNextTextTransaction(...)` with `text.insert`
  through the public `@flowdoc/vnext-core` boundary.
- the insert position is the selected text-block projection end offset.
- insert text is constrained to non-empty single-line text.
- text blocks with field refs, page numbers, or line breaks stay rejected for
  this phase.
- accepted and rejected insert responses use the same change-packet path as the
  replace action.
- the browser inspector has explicit `Replace block` and `Append text`
  commands that both feed the browser runtime cache.
- `docs/TEMPLATE_BUILDER_TEXT_ACTION_BOUNDARY.md` records why DOM caret,
  IME composition, and browser-derived ranges remain deferred.
- `tests/templateBuilderSandboxBoundary.test.ts` guards the route, core command,
  packet behavior, and browser source path.

This phase intentionally does not implement per-keystroke typing, DOM caret
mapping, IME behavior, browser-derived text ranges, partial range replace from
selection, undo/redo execution, live layout rendering, structural packet
operations, durable browser cache persistence, save/publish persistence,
backend API routes outside the sandbox server, exact layout, preview, PDF, or
DOCX rendering.

## Phase 33 Sandbox Authoring History Boundary

Phase 33 connects sandbox bridge mutations to the vNext authoring intent
history contract before undo/redo execution:

- the mutation bridge owns an in-memory authoring history record list beside
  its working package, document revision, mutation count, and last mutation;
- accepted replace and append text transactions call
  `appendVNextAuthoringIntentHistoryResult(...)` with `inputKind: "command"`;
- core transaction rejections can append diagnostic-only history records, while
  pre-core bridge validation rejections remain packet issues only;
- snapshots and change packets expose a bounded `authoringHistory` summary
  with record counts, undoable/rejected counts, group count, and latest group;
- browser packet application updates history summary alongside diagnostics,
  revision, mutation metadata, dirty scopes, and changed node summaries;
- the inspector and status bar show history counts and latest group context;
- action lanes now make the history rail wired while undo and redo remain
  planned.

This phase intentionally does not implement undo execution, redo execution,
inverse transaction generation, keyboard shortcuts, focus or caret restoration,
durable history persistence, per-keystroke typing, IME composition, live layout
rendering, save/publish persistence, non-sandbox API routes, exact layout,
preview, PDF, or DOCX rendering.

## Phase 34 Sandbox Undo Redo Execution Boundary

Phase 34 makes sandbox text mutation undo/redo executable without adopting full
snapshot history or caret typing:

- the mutation bridge owns in-memory undo and redo stacks beside its working
  package and authoring history summary;
- each stack entry stores only a group id, source action, target text-block id,
  before text, and after text;
- accepted replace and append actions push an undo patch and clear redo;
- `POST /api/actions/undo` and `POST /api/actions/redo` replay patches through
  `runVNextTextTransaction(...)` with `text.range.replace`;
- accepted undo/redo responses use the same bounded change-packet path as
  other sandbox mutations;
- empty undo/redo stacks reject without changing revision;
- packets and snapshots report undo/redo availability, stack depth, and next
  group ids through `authoringHistory`;
- the browser inspector exposes undo/redo controls and applies results through
  the runtime cache path.

This phase intentionally does not implement durable history persistence, full
package snapshot history, arbitrary structural replay, cross-session replay,
keyboard shortcuts, caret or focus restoration, per-keystroke typing, IME
composition, live layout rendering, save/publish persistence, non-sandbox API
routes, exact layout, preview, PDF, or DOCX rendering.

## Phase 35 Sandbox Live Layout Request Boundary

Phase 35 connects accepted sandbox text mutations to the existing vNext live
layout boundary without introducing a live renderer:

- snapshots and change packets now carry a bounded `liveLayout` summary;
- accepted replace, append, undo, and redo actions call
  `resolveVNextLiveLayoutBoundary(...)` with the committed text transaction
  dirty scope;
- `requestCount` increments only for accepted layout requests;
- rejected actions keep the previous live-layout summary and do not make a new
  request;
- `lastResult` records reason, request id, visible range kind, dirty scope
  count, affected ids, live-layout freshness, and exact-generation freshness;
- exact generation can be marked stale, but `finalTruth` remains
  `measured-pagination` and exact layout remains `not-run`;
- the browser applies `packet.liveLayout` through the same runtime cache path
  and reports it in inspector/status.

This phase intentionally does not implement live layout rendering, text
measurement caches, viewport scheduling, DOM caret mapping, IME composition,
save/publish persistence, non-sandbox API routes, exact layout, preview, PDF,
or DOCX rendering.

## Phase 36 WYSIWYG Text Draft Design Lock

Phase 36 records the WYSIWYG document-editor direction before visible draft
editing is implemented:

- `docs/TEMPLATE_BUILDER_WYSIWYG_DRAFT_DESIGN_LOCK.md` defines the editor goal,
  truth layers, visible editing model, text-block content contract, editable
  eligibility, draft lifecycle, commit policy, conflict policy, history policy,
  live-layout policy, minimum UI contract, acceptance guardrails, and
  non-goals;
- `docs/FRONTEND_AUTHORING_RUNTIME_PLAN.md` now marks rich text editing over
  authored inline text as an explicit runtime goal;
- `docs/TEXT_EDITING_TRANSACTION_PLAN.md` now records the required rich text
  return list for `inline.style.patch`, style-preserving edits, mixed inline
  selection, and style-aware dirty scopes;
- the design lock explicitly forbids silently flattening field refs, page
  numbers, line breaks, or styled text runs into a plain string;
- the next implementation phase should edit on the document canvas while
  keeping browser draft state separate from canonical document truth.

This phase intentionally does not implement WYSIWYG draft editing code, rich
text toolbar, inline style patch commands, full DOM caret mapping, IME
lifecycle, multi-range selection, exact WYSIWYG pagination, live layout
renderer, save/publish persistence, or backend API routes outside the sandbox
dev server.

## Phase 37 WYSIWYG Text Draft Boundary

Phase 37 implements the first visible WYSIWYG draft surface inside the
extractable template-builder sandbox:

- `docs/TEMPLATE_BUILDER_WYSIWYG_DRAFT_BOUNDARY.md` records the implemented
  browser-local draft contract, truth-layer separation, eligibility facts,
  lifecycle, commit/conflict rules, interaction rules, evidence, and non-goals;
- `examples/template-builder-sandbox/src/coreBoundary.ts` adds full `plainText`
  for safe draft source text, `canUseWysiwygDraft`, `hasAtomicInline`,
  `hasStyledText`, and `wysiwygDraftGuardReason`;
- `examples/template-builder-sandbox/public/app.js` adds one active browser
  draft at a time, canvas-position textarea editing, commit/cancel controls,
  revision conflict checks, rejected-commit preservation, and direct
  bridge/history blocking while a draft is active;
- `examples/template-builder-sandbox/public/styles.css` adds plain functional
  draft styling without changing the larger sandbox layout direction;
- `tests/templateBuilderSandboxBoundary.test.ts` asserts safe/guarded snapshot
  facts and proves browser drafts still commit through the existing bridge
  packet path without mutating canonical document structures.

This phase intentionally does not implement rich text toolbar commands,
`inline.style.patch`, style-preserving mixed inline edits, DOM caret mapping,
IME composition, multi-range selection, per-keystroke core transactions, live
layout rendering during active typing, exact WYSIWYG pagination,
save/publish persistence, or backend API routes outside the sandbox dev server.

## Phase 38 Draft Selection Boundary

Phase 38 adds a browser-local selection range contract for active WYSIWYG
drafts:

- `docs/TEMPLATE_BUILDER_DRAFT_SELECTION_BOUNDARY.md` records the purpose,
  local state fields, interaction events, visible state, commit rules,
  acceptance evidence, and non-goals;
- `examples/template-builder-sandbox/public/app.js` now tracks
  `selectionStart`, `selectionEnd`, `selectionDirection`, and
  `selectionSource` while a canvas draft is active;
- canvas, inspector, and status bar labels now show the active draft range
  without re-rendering the full app on every selection update;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.trackDraftSelection` as a browser-local action lane;
- `tests/templateBuilderSandboxBoundary.test.ts` proves draft selection state
  stays out of generated snapshots and remains separate from canonical package
  mutation.

This phase intentionally does not implement DOM range mapping over rich inline
nodes, contenteditable editing, IME composition lifecycle, toolbar commands,
`inline.style.patch`, style-preserving mixed inline edits, persistent selection
records, collaboration cursors, per-keystroke core transactions, or live layout
rendering during active typing.

## Phase 39 Draft Command Context Boundary

Phase 39 derives command context from active WYSIWYG draft selection without
executing commands:

- `docs/TEMPLATE_BUILDER_DRAFT_COMMAND_CONTEXT_BOUNDARY.md` records context
  fields, command readiness, truth boundary, visible state, acceptance
  evidence, and non-goals;
- `examples/template-builder-sandbox/public/app.js` now derives command
  surface, target text-block id, base revision, selection range, bounded
  selected/before/after previews, and readiness for future insert, replace,
  key, and style commands;
- canvas, inspector, and status bar labels now show command context without
  full app re-render on selection updates;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.deriveDraftCommandContext` as a browser-local action lane;
- `tests/templateBuilderSandboxBoundary.test.ts` proves command-context preview
  fields stay out of generated snapshots and draft commits still use the
  existing bridge packet path.

This phase intentionally does not implement command execution, replace-selection
bridge routes, key/field insertion, rich text toolbar commands,
`inline.style.patch`, contenteditable editing, DOM range mapping over rich
inline nodes, IME composition lifecycle, per-keystroke core transactions, or
live layout rendering during active typing.

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
