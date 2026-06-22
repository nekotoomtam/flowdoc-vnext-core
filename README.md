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
- Key/data diagnostics collect authored `field-ref` usages, validate package
  registry/data snapshots, report generation-readiness status, and preserve
  template/data separation without materializing bound output
- Editable authoring session baseline creates a pure browser/Node-safe session
  from canonical packages with working document, graph/key diagnostics,
  revisions, empty dirty scopes, and session-only selection state
- Text transaction engine baseline projects text-block inline children into
  stable model offsets and applies granular text insert, delete, range replace,
  and inline field-ref insert with text-block dirty scope and history intent
  without invoking layout/export
- Authoring intent history baseline records text transaction outcomes as
  undo-policy metadata, coalesces repeated typing by merge key, keeps paste and
  field inserts as single groups, skips selection-only changes from durable
  history, and records rejected transaction diagnostics
- Live layout boundary baseline turns selection, authoring history, and dirty
  scopes into viewport-aware live-layout requests, marks exact generation stale
  after content/table/node changes, and keeps measured pagination as export
  truth
- Backend generation runtime baseline parses API-facing template package/data
  requests, separates package/document/key-data diagnostics, reports
  readiness-only status, and keeps artifacts/generated documents out of the
  response until a later renderer phase
- Large-document acceptance harness generates canonical packages with hundreds
  of text blocks and large tables, then verifies narrow typing dirty scopes and
  explicit readiness-only generation behavior
- Template builder sandbox baseline lives under
  `examples/template-builder-sandbox` as an extractable package that depends on
  the public `@flowdoc/vnext-core` boundary, generates a core-backed browser
  snapshot, and renders the first toolbar/tree/canvas/inspector/status shell
  without adding browser framework dependencies to this core package
- Sandbox interaction baseline enriches that snapshot with relationship facts
  and keeps browser-only node selection synchronized across tree, canvas,
  inspector, and status without persisting selection into canonical package data
- Sandbox mutation bridge baseline exposes one safe in-memory replace action
  that posts from the browser to the sandbox server, calls
  `runVNextTextTransaction(...)` through the public core boundary, and refreshes
  the browser from the returned snapshot
- Sandbox delta boundary adds an optional bounded change-packet response for
  the replace action so future typing can move changed-node facts without
  requiring a full snapshot response after every mutation
- Sandbox browser cache boundary consumes those change packets in the browser:
  the shell still boots from a full snapshot, then applies packet-only mutation
  responses to a browser-owned runtime cache and snapshot view model
- Sandbox text action boundary adds an explicit append-text inspector command
  that calls `text.insert` through the mutation bridge and packet cache path
  without taking on DOM caret or IME behavior yet
- Sandbox history boundary appends vNext authoring intent history records for
  accepted bridge text transactions and exposes a bounded history summary in
  snapshots, packets, inspector, and status without executing undo/redo yet
- Sandbox undo/redo boundary replays accepted bridge text mutations through
  bounded in-memory inverse text patches and the same packet cache path without
  storing full package snapshots
- Sandbox live layout boundary runs accepted sandbox text mutations through the
  core live-layout request boundary and carries bounded `liveLayout` summaries
  in snapshots, packets, inspector, and status without rendering live pages or
  exact layout
- WYSIWYG text draft design lock records the visible editor direction, truth
  layers, inline-content preservation rules, guarded editability, draft
  lifecycle, commit/conflict policy, and required rich text return list before
  visible draft editing is implemented
- WYSIWYG text draft boundary adds a browser-local canvas draft surface for
  safe text blocks, commits through the existing mutation bridge packet path,
  and guards atomic or styled inline content from silent flattening
- Draft selection boundary tracks browser-local textarea selection ranges for
  active WYSIWYG drafts and exposes them in the canvas, inspector, and status
  without persisting selection into canonical packages or history
- Draft command context boundary derives browser-local target, range previews,
  and command readiness from active draft selection before any insert, replace,
  key, or rich text command executes
- Draft text command boundary executes browser-local plain text insert and
  replace-selection commands against the active draft, leaving persistence,
  history, and live layout to the existing draft commit bridge
- Draft selection/caret boundary adds browser-local range controls for active
  drafts so cursor movement, select-all, and replace-selection readiness can be
  driven without relying only on textarea selection events
- Draft composition boundary tracks browser-local IME composition events for
  active drafts and guards range controls, text commands, and commit while
  composition is active
- Editor UX north star locks the web editor as a first-class product surface
  and requires normalized/lazy editor view indexes instead of recursive tree
  snapshots as the active large-document runtime shape
- Modular responsibility contract requires future editor/runtime work to split
  by real behavior ownership instead of growing monolithic state/event/render/
  transport files
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
- Measured pagination internals now expose shared measured contracts and a
  fragment/page builder before deeper text/table layout extraction.
- Layout pipeline baseline exposes staged planning, measurement-job scheduling,
  bounded measured page/render-command artifact chunks, and complete pipeline
  runs while preserving the existing measured pagination engine.
- Read-only editor bridge runtime composes package parsing, graph, measured
  pagination, renderer-consumption audit, export readiness, and supported
  operation kinds through the core runtime session without accepting current
  runtime document input.

## Important Docs

- `AGENTS.md`: working agreement for agents in this repo
- `docs/WORKSPACE_BOUNDARY.md`: active project/package boundary
- `docs/LEGACY_MIGRATION_GATE.md`: decision gate before moving old code
- `docs/TEMPLATE_AUTHORING_CORE_PLAN.md`: draft architecture reset for the
  dynamic node-based docgen template builder
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`: implementation phases for the
  template authoring architecture reset
- `docs/SHARED_TEMPLATE_CORE_CONTRACT.md`: shared browser/Node-safe core
  contract for authoring and generation runtimes
- `docs/NODE_FAMILY_CAPABILITY_MODEL.md`: node family, containment, and
  capability model that prevents prototype-style node proliferation
- `docs/FRONTEND_AUTHORING_RUNTIME_PLAN.md`: frontend editing/runtime plan for
  smooth typing, selection, IME, dirty scopes, and checkpointing
- `docs/TEXT_EDITING_TRANSACTION_PLAN.md`: granular text transaction direction
  for typing, split/merge, inline fields, and history grouping
- `docs/LIVE_LAYOUT_AND_EXACT_GENERATION_PLAN.md`: live authoring layout versus
  exact generation layout boundary
- `docs/KEY_REGISTRY_BINDING_PLAN.md`: field key, data snapshot, binding, and
  future key-history direction
- `docs/BACKEND_GENERATION_RUNTIME_PLAN.md`: API generation runtime direction
  for template plus data to artifacts
- `docs/LARGE_DOCUMENT_PERFORMANCE_CONTRACT.md`: large-document guardrails for
  rendering, typing, layout, and exact generation
- `docs/RUNTIME_USAGE_MAP.md`: frontend/backend usage map for how real app
  actions call the shared core
- `docs/ACTION_JOB_CONTRACT.md`: action, command, intent, job, and workflow
  contract for future runtime scheduling
- `docs/TEMPLATE_BUILDER_SANDBOX_BOUNDARY.md`: extractable sandbox package
  boundary for the first visible template builder shell
- `docs/TEMPLATE_BUILDER_INTERACTION_BOUNDARY.md`: structure-first node
  selection and inspector interaction contract
- `docs/TEMPLATE_BUILDER_MUTATION_BRIDGE_BOUNDARY.md`: first safe browser to
  bridge to core mutation path for the sandbox
- `docs/TEMPLATE_BUILDER_DELTA_BOUNDARY.md`: bounded change-packet response
  contract beside the existing sandbox snapshot response
- `docs/TEMPLATE_BUILDER_BROWSER_CACHE_BOUNDARY.md`: browser runtime cache
  contract for consuming sandbox change packets after boot
- `docs/TEMPLATE_BUILDER_TEXT_ACTION_BOUNDARY.md`: explicit text insert action
  contract before DOM caret and IME work
- `docs/TEMPLATE_BUILDER_HISTORY_BOUNDARY.md`: sandbox authoring history
  summary contract before undo/redo execution
- `docs/TEMPLATE_BUILDER_UNDO_REDO_BOUNDARY.md`: sandbox text undo/redo replay
  contract before durable history or caret/IME work
- `docs/TEMPLATE_BUILDER_LIVE_LAYOUT_BOUNDARY.md`: sandbox live-layout request
  summary contract before a concrete browser live renderer
- `docs/TEMPLATE_BUILDER_WYSIWYG_DRAFT_DESIGN_LOCK.md`: WYSIWYG text draft
  design lock before visible draft editing implementation
- `docs/TEMPLATE_BUILDER_WYSIWYG_DRAFT_BOUNDARY.md`: first visible sandbox
  WYSIWYG text draft boundary for browser-local canvas editing before rich text
  and caret/IME work
- `docs/TEMPLATE_BUILDER_DRAFT_SELECTION_BOUNDARY.md`: browser-local active
  draft selection range boundary before rich inline range mapping and IME work
- `docs/TEMPLATE_BUILDER_DRAFT_COMMAND_CONTEXT_BOUNDARY.md`: browser-local
  command context and readiness boundary derived from active draft selection
  before command execution
- `docs/TEMPLATE_BUILDER_DRAFT_TEXT_COMMAND_BOUNDARY.md`: browser-local text
  command execution boundary for active drafts before key, rich text, IME, and
  durable DOM selection work
- `docs/TEMPLATE_BUILDER_DRAFT_SELECTION_CARET_BOUNDARY.md`: browser-local
  active draft range/caret hardening before rich DOM mapping and IME work
- `docs/TEMPLATE_BUILDER_DRAFT_COMPOSITION_BOUNDARY.md`: browser-local IME
  composition guard boundary for active drafts before language-specific IME,
  rich DOM mapping, and per-keystroke transactions
- `docs/EDITOR_UX_NORTH_STAR.md`: Phase 43 editor UX and normalized editor
  view constraint before deeper WYSIWYG/runtime work
- `docs/MODULAR_RESPONSIBILITY_CONTRACT.md`: Phase 44 responsibility-sliced
  file/module guard before deeper editor runtime work
- `docs/LEGACY_REFERENCE_LESSONS.md`: reference-only lessons from the old
  FlowDocEditor architecture
- `docs/PACKAGE_CONSUMPTION_STRATEGY.md`: local and future dependency options
- `docs/VNEXT_CORE_REDESIGN_PLAN.md`: target architecture for the next core lane
- `docs/OPERATION_KERNEL_SPLIT_PLAN.md`: Lane B operation split boundary
- `docs/LAYOUT_PIPELINE_SPLIT_PLAN.md`: Lane C layout pipeline split boundary
- `docs/LAYOUT_INTERNAL_EXTRACTION_PLAN.md`: Phase 17 measured pagination
  internal split boundary
- `docs/PHASE_LEDGER.md`: historical vNext core phase ledger
- `docs/PHASE_10_CLOSE_AUDIT.md`: pagination/export boundary close audit
- `docs/TABLE_PAGINATION_VNEXT_PLAN.md`: table pagination direction
- `docs/PHASE_12_REPOSITORY_EXTRACTION_CHECKLIST.md`: extraction record

## Not Implemented Yet

- visible editor runtime integration beyond the extractable sandbox shell,
  in-memory sandbox mutation bridge, browser-local WYSIWYG text drafts for safe
  text blocks, draft selection range tracking, draft command context readiness,
  browser-local draft text commands, browser-local draft range controls,
  browser-local draft composition guards, and bounded history/live-layout
  summaries
- frontend authoring runtime beyond the initial pure editable-session/text
  transaction/intent-history/live-layout boundary contracts, including visible
  node composition, rich text editing, caret mapping, IME, product-level
  undo/redo UI, normalized/lazy editor view implementation,
  responsibility-sliced editor modules, and a concrete browser live-layout
  renderer
- replacement for current parent `/api/paginate` or `/api/export`
- concrete backend API routes, storage, and rendered artifacts on top of the
  generation runtime
- form-slot or submission-state runtime
- key history and key migration records
- renderer-backed text measurement profile implementation
- fully pausable internal text/table placement engine behind measurement job
  results
- non-text table-cell content splitting
- multi-page column balancing
- final pagination-aware TOC page resolution
- concrete PDF/DOCX renderer implementation beyond measured-fragment
  consumption contracts
- durable operation/authoring history persistence outside in-memory helpers
- durable/full undo/redo replay beyond sandbox in-memory text patches
- product-level visible editor acceptance smokes
- durable browser cache persistence and structural packet application
- publishing/distribution strategy beyond local package consumption
