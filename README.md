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
- Key history migration boundary plans field-key rename and field-type change
  intent against registry, inline usage, and data-key impact while keeping
  registry/document/data mutation, history writes, and package version changes
  out of this phase
- Repeat / collection / form-slot boundary reports collection field impact,
  blocks collection inline/data misuse, and keeps repeat regions, collection
  binding, form slots, submission state, and package version changes not-run
- Submission state boundary creates external workflow records for draft/
  submitted/reviewed states while keeping workflow storage, routes, package
  mutation, data mutation, and editor session state outside canonical truth
- Persistence close audit records PASS/RISK/UNKNOWN status for the current
  backend/API/persistence foundation without claiming production persistence,
  workflow, migration, collection, or artifact behavior
- PDF renderer adapter boundary converts measured renderer consumption into a
  PDF draw plan and not-rendered artifact manifest without concrete PDF bytes,
  storage writes, authored-document input, or relayout
- DOCX renderer adapter boundary converts measured renderer consumption into a
  DOCX assembly plan and not-rendered artifact manifest without concrete DOCX
  bytes, storage writes, authored-document input, or relayout
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
- Durable history boundary snapshots authoring intent records into
  durable-ready JSON with undo/redo metadata while keeping storage writes,
  inverse patch replay, package snapshots, and selection restoration deferred
- Live layout boundary baseline turns selection, authoring history, and dirty
  scopes into viewport-aware live-layout requests, marks exact generation stale
  after content/table/node changes, and keeps measured pagination as export
  truth
- Backend generation runtime baseline parses API-facing template package/data
  requests, separates package/document/key-data diagnostics, reports
  readiness-only status, and keeps artifacts/generated documents out of the
  response until a later renderer phase
- Generation API route boundary wraps readiness-only generation requests in a
  pure HTTP-shaped response contract without adding a concrete server route,
  storage, exact layout, or artifact rendering
- Session storage boundary prepares canonical package storage records from
  editable sessions while explicitly excluding selection, dirty scopes,
  diagnostics, graph, viewport, live layout, exact layout, and durable history
  from persisted package truth
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
- Normalized editor view boundary adds a browser-safe sandbox module that
  derives lookup-first indexes from boot snapshots and packet-updated view
  models before viewport windowing or lazy heavy-detail routes
- Runtime cache module boundary moves sandbox boot, refresh, and packet-apply
  cache rules into a browser-safe module so the app shell delegates instead of
  owning cache, packet, render, and event behavior together
- Visible range boundary adds a browser-safe section-window contract so
  normalized editor views can expose bounded visible node ids before DOM scroll
  tracking or virtualized rendering
- Visible range request boundary separates range intent, reason, and budget
  from resolved visible node ids so selection, draft, packet, and future
  viewport work can share one request contract
- Structural runtime store boundary gives browser structural indexes their own
  store owner below the editor view before structural packet application or
  virtualized rendering
- Text packet store boundary applies bounded text-block change packets directly
  to the browser runtime store while keeping full structural packet operations
  deferred
- Store-backed render boundary makes sandbox tree/canvas rendering consume a
  runtime-store-backed render model instead of walking tree-shaped snapshot
  sections for active node content
- Render window boundary derives the active canvas section/node window from the
  visible-range contract before DOM viewport controllers or virtualized
  renderer scheduling
- Viewport request boundary converts normalized viewport facts into
  visible-range requests before DOM scroll measurement or virtualized renderer
  scheduling is wired
- Render shell boundary keeps full-document section placeholders in the canvas
  while mounting detailed node content only for the active render window
- Viewport measurement boundary reads browser-local section shell boxes into
  normalized viewport facts before scroll event binding or virtualized renderer
  scheduling is wired
- Viewport apply boundary lets the sandbox manually apply the current measured
  section shell to the visible-range/render-window path as an explicit recovery
  and debugging command
- Viewport scroll controller boundary debounces canvas scroll movement into the
  same measurement apply request path before production viewport scheduling or
  virtualized rendering is wired
- Viewport anchor boundary records section-relative viewport anchors so render
  passes can restore by `sectionId + offsetInSection` before node anchors and
  production scroll anchoring are wired
- Section spacer boundary records measured section heights and reuses them as
  shell/placeholder minimum heights before a production virtual list is wired
- Section offset boundary derives top/height/bottom intervals and viewport
  section predictions from spacer facts before render scheduling uses them
- Viewport scheduler candidate boundary dry-runs overscanned section render
  candidates from viewport predictions before those candidates are allowed to
  drive a render window
- Viewport scheduler apply boundary manually gates scheduler candidates into
  visible-range requests before automatic render scheduling or virtualization
  is claimed
- Viewport scheduler runtime boundary tracks candidate sequence, request ids,
  and stale apply guards before automatic render scheduling is claimed
- Viewport scheduler automation boundary automatically applies budgeted runtime
  candidates while still stopping before virtualized rendering is claimed
- Viewport virtual stack boundary mounts only render-window sections and uses
  section spacers for off-window geometry
- Viewport lazy detail boundary defers inactive heavy node subtrees inside
  mounted virtual sections
- Viewport node anchor boundary restores selection jumps by node id with
  section-relative fallback
- Viewport large-document audit composes scheduler automation, visible range,
  render shell, virtual stack, lazy detail, and node anchors against a bounded
  large section/node set before Structural Runtime work starts
- Structural projection boundary derives read-only tree-shaped working views
  from canonical `DocumentNode` and `RelationshipGraph` facts without changing
  the persisted schema
- Structural packet contract boundary defines foundation bridge packets from
  accepted core operation results without making them durable persistence or
  collaboration protocol
- Structural packet store boundary applies structural packet v1 to browser
  runtime-store indexes as a local foundation bridge, with a growth warning
  before persistence, collaboration, offline replay, or backend API exposure
- Structural mutation bridge boundary lets sandbox bridge actions produce
  structural packet v1 from core insert/delete/reorder operations before
  structural toolbar UI, persistence, or durable history
- Structural command UI boundary exposes bounded inspector insert/delete/reorder
  controls that call structural packet routes and apply through the browser
  runtime cache
- Structural outline jump boundary turns the sandbox node tree into an explicit
  node-aware outline navigation contract over visible range and anchor restore
- Structural diagnostics navigation boundary lists snapshot/packet diagnostics
  and jumps only node-linked issues through the node-aware selection path
- Structural command policy boundary extracts insert/delete/reorder command
  availability, targets, routes, requests, and selection-after behavior from
  the sandbox app shell
- Structural Runtime close audit records PASS/RISK/UNKNOWN status after
  Phases 69-76 before entering the WYSIWYG / Editing line
- Draft runtime module boundary extracts browser-local WYSIWYG draft state,
  caret/selection normalization, command readiness, draft text commands, and
  IME composition guards out of the sandbox app shell before rich inline,
  field-chip, or contenteditable work
- Text draft layout push boundary surfaces a bounded browser-local layout
  preview summary for active drafts while explicitly keeping live layout
  unrequested and exact generation not-run until commit
- Draft IME hardening boundary centralizes browser-local composition guards in
  a policy module, surfaces `data-draft-ime-policy`, and keeps exact output
  deferred until bridge commit
- Rich inline style patch boundary models browser-local selected-range style
  intent, surfaces `data-draft-style-patch`, and keeps core style transactions
  not-run until a later rich inline execution phase
- Toolbar state boundary exposes browser-local style control readiness through
  `data-draft-toolbar-state` while keeping toolbar dispatch not-wired until a
  later command phase
- Field chip inline boundary surfaces catalog-backed field chip insertion
  intent through `data-draft-field-chip-inline` while keeping field-ref
  insertion not-run until a later rich inline execution phase
- Style-aware history boundary groups ready rich inline intents through
  `data-draft-style-history` while keeping durable history not-written
- WYSIWYG close audit records PASS/RISK/UNKNOWN status for the current
  browser-local editing foundation before backend, persistence, and exact
  renderer phases continue
- WYSIWYG re-entry audit reconnects the Phase 85 browser-local editing
  foundation with the Phase 113-115 text-engine evidence lane and defines
  managed cards through contenteditable range mapping, rich inline execution,
  toolbar dispatch, and field chip insertion
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
- Final TOC/page resolution boundary maps TOC heading entries to measured page
  indexes/numbers after pagination without relayout, fragment mutation, or
  renderer execution.
- Exact output close audit records PASS/RISK/UNKNOWN status for the current
  renderer/exact-output foundation without claiming concrete PDF/DOCX bytes,
  artifact storage, renderer jobs, or generated output delivery.
- Deep table split boundary classifies table rows and cell-child policies for
  text-line split readiness while explicitly blocking deferred non-text or mixed
  cell content before a concrete deep table split engine exists.
- Measured pagination internals now expose shared measured contracts and a
  fragment/page builder before deeper text/table layout extraction.
- Layout pipeline baseline exposes staged planning, measurement-job scheduling,
  bounded measured page/render-command artifact chunks, and complete pipeline
  runs while preserving the existing measured pagination engine.
- Pausable layout job engine boundary advances layout pipeline plan jobs through
  bounded resumable cursors without executing concrete layout, relayouting
  documents, storing cursors, or invoking renderers.
- Renderer-backed text measurement boundary exposes profile readiness plans and
  a strict `VNextTextMeasurer` adapter for external renderer facts without
  concrete renderer imports, document relayout, or schema changes.
- Text measurement engine spike boundary records font, HarfBuzz shaping,
  ICU4X/Intl.Segmenter line-break, and Thai oracle comparison readiness before
  any concrete engine can replace pagination measurement.
- Font registry spike boundary records Sarabun/Noto Sans Thai asset, license,
  hash, target, and style-key mapping facts before font files are copied or
  used by a concrete measurement engine.
- Font ownership clearing boundary selects package font assets under
  `assets/fonts` as measurement identity while keeping browser `public/fonts`
  paths as optional mirrors only.
- Font asset copy/hash evidence adds the initial Sarabun and Noto Sans Thai
  package font files under `assets/fonts`, records OFL evidence, and verifies
  sha256 hashes from vNext-owned target copies.
- Measurement profile identity contract derives stable `measurementProfileId`
  strings from copied font hashes, style mappings, rustybuzz/ICU4X revisions,
  line-break policy, fallback policy, and output shape.
- Rust/WASM text engine boundary keeps rustybuzz/ICU4X in a future external
  adapter package that returns renderer-backed measurement facts instead of
  making vNext core import WASM directly.
- Thai corpus/oracle boundary adds the first Thai measurement corpus and
  comparison contract for ICU4X, Intl.Segmenter, and Thai oracle candidates
  before segmentation execution.
- Rustybuzz shaping smoke boundary defines the copied-font, Thai-corpus, and
  measurement-profile-backed shape cases that a future external adapter must
  satisfy before production measurement binding.
- Text engine adapter SPI boundary keeps glyph facts on a separate evidence
  lane and maps Phase 107 smoke cases into future external adapter requests
  without changing the pagination measurement draft.
- Text engine evidence acceptance boundary validates adapter-produced glyph and
  line box facts while deliberately keeping pagination draft creation as a
  later handoff.
- Text engine measurement draft handoff boundary maps accepted evidence into
  the existing pagination-facing draft while dropping glyph facts from the
  draft shape.
- Text engine adapter lane close audit records the core-side pass from
  measurement profile identity through adapter request, evidence acceptance, and
  measurement draft handoff without claiming concrete engine execution.
- Text engine adapter package scaffold creates the external
  `@flowdoc/text-engine-rust-wasm` package lane with deterministic mock
  evidence before rustybuzz/WASM implementation.
- Text engine rustybuzz smoke package boundary adds the first package-local
  rustybuzz execution path under `packages/text-engine-rust-wasm/rust-shaper`
  while keeping core source independent from Rust/WASM/font-file access.
- Text engine rustybuzz raw mapping boundary converts package-local raw
  rustybuzz UTF-8 byte clusters and font units into adapter evidence UTF-16
  ranges and point units before any production binding.
- Text engine rustybuzz smoke corpus boundary expands native rustybuzz raw
  fixtures and evidence mapping across every Phase 107 smoke case before WASM
  parity or ICU4X line breaking.
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
- `docs/DURABLE_HISTORY_BOUNDARY.md`: Phase 88 durable-ready authoring history
  and undo/redo metadata boundary before durable stores or replay execution
- `docs/LIVE_LAYOUT_AND_EXACT_GENERATION_PLAN.md`: live authoring layout versus
  exact generation layout boundary
- `docs/KEY_REGISTRY_BINDING_PLAN.md`: field key, data snapshot, binding, and
  future key-history direction
- `docs/KEY_HISTORY_MIGRATION_BOUNDARY.md`: Phase 89 key history migration
  plan boundary before key migration execution or key history persistence
- `docs/REPEAT_COLLECTION_FORM_SLOT_BOUNDARY.md`: Phase 90 repeat,
  collection, and form-slot readiness boundary before schema/materialization
- `docs/SUBMISSION_STATE_BOUNDARY.md`: Phase 91 external submission workflow
  state boundary before workflow storage, routes, or reviewer runtime
- `docs/PERSISTENCE_CLOSE_AUDIT.md`: Phase 92 Backend / API / Persistence
  foundation close audit and risk register
- `docs/PDF_RENDERER_ADAPTER_BOUNDARY.md`: Phase 93 PDF renderer adapter plan
  boundary before concrete PDF rendering or artifact storage
- `docs/DOCX_RENDERER_ADAPTER_BOUNDARY.md`: Phase 94 DOCX renderer adapter
  plan boundary before concrete DOCX rendering or artifact storage
- `docs/RENDERER_BACKED_TEXT_MEASUREMENT_BOUNDARY.md`: Phase 95
  renderer-backed text measurement profile adapter boundary before concrete
  renderer measurement engines
- `docs/TEXT_MEASUREMENT_ENGINE_SPIKE_BOUNDARY.md`: Phase 100 text
  measurement engine spike boundary before HarfBuzz/ICU4X/Intl/Thai oracle
  implementation
- `docs/FONT_REGISTRY_SPIKE_BOUNDARY.md`: Phase 101 font registry spike
  boundary before font file copy/hash scanning or concrete measurement use
- `docs/FONT_OWNERSHIP_CLEARING_BOUNDARY.md`: Phase 102 font ownership clearing
  boundary before font file copy, package metadata updates, or hash scanning
- `docs/FONT_ASSET_COPY_HASH_EVIDENCE.md`: Phase 103 font asset copy/hash
  evidence before font parsing, shaping, line breaking, or production binding
- `docs/MEASUREMENT_PROFILE_IDENTITY_CONTRACT.md`: Phase 104 measurement
  profile identity contract before concrete rustybuzz/ICU4X execution
- `docs/RUST_WASM_TEXT_ENGINE_BOUNDARY.md`: Phase 105 Rust/WASM text engine
  boundary decision before adapter package or WASM build work
- `docs/THAI_CORPUS_ORACLE_BOUNDARY.md`: Phase 106 Thai corpus/oracle boundary
  before ICU4X/Intl/Thai oracle execution
- `docs/RUSTYBUZZ_SHAPING_SMOKE_BOUNDARY.md`: Phase 107 rustybuzz shaping
  smoke boundary before adapter-owned glyph fact execution
- `docs/TEXT_ENGINE_ADAPTER_SPI_BOUNDARY.md`: Phase 108 text engine adapter
  SPI boundary before external adapter implementation
- `docs/TEXT_ENGINE_EVIDENCE_ACCEPTANCE_BOUNDARY.md`: Phase 109 text engine
  evidence acceptance boundary before pagination draft handoff
- `docs/TEXT_ENGINE_MEASUREMENT_DRAFT_HANDOFF_BOUNDARY.md`: Phase 110 text
  engine measurement draft handoff before production measurement binding
- `docs/TEXT_ENGINE_ADAPTER_LANE_CLOSE_AUDIT.md`: Phase 111 text engine
  adapter lane close audit before external adapter package implementation
- `docs/TEXT_ENGINE_ADAPTER_PACKAGE_SCAFFOLD.md`: Phase 112 external text
  engine adapter package scaffold before rustybuzz/WASM smoke
- `docs/TEXT_ENGINE_RUSTYBUZZ_SMOKE_PACKAGE_BOUNDARY.md`: Phase 113 package-
  local rustybuzz smoke execution before WASM loading or production binding
- `docs/TEXT_ENGINE_RUSTYBUZZ_RAW_MAPPING_BOUNDARY.md`: Phase 114 raw
  rustybuzz evidence mapping before WASM loading or production binding
- `docs/TEXT_ENGINE_RUSTYBUZZ_SMOKE_CORPUS_BOUNDARY.md`: Phase 115 native
  rustybuzz smoke corpus coverage before WASM parity or ICU4X line breaking
- `docs/PAUSABLE_LAYOUT_JOB_ENGINE_BOUNDARY.md`: Phase 96 pausable layout job
  engine boundary before concrete layout execution or cursor persistence
- `docs/DEEP_TABLE_SPLIT_BOUNDARY.md`: Phase 97 deep table split readiness
  boundary before concrete non-text table-cell splitting
- `docs/FINAL_TOC_PAGE_RESOLUTION_BOUNDARY.md`: Phase 98 final TOC/page
  resolution boundary before TOC text rewrite, reflow, or renderer output
- `docs/EXACT_OUTPUT_CLOSE_AUDIT.md`: Phase 99 Exact Output / Renderer
  foundation close audit and risk register
- `docs/BACKEND_GENERATION_RUNTIME_PLAN.md`: API generation runtime direction
  for template plus data to artifacts
- `docs/GENERATION_API_ROUTE_BOUNDARY.md`: Phase 86 pure generation readiness
  route response boundary before concrete server/storage/artifact work
- `docs/SESSION_STORAGE_BOUNDARY.md`: Phase 87 canonical package session
  storage record boundary before concrete storage adapters or durable history
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
- `docs/TEMPLATE_BUILDER_NORMALIZED_EDITOR_VIEW_BOUNDARY.md`: Phase 45
  normalized editor view boundary for lookup-first sandbox runtime indexes
- `docs/TEMPLATE_BUILDER_RUNTIME_CACHE_MODULE_BOUNDARY.md`: Phase 46
  runtime-cache module boundary for boot, refresh, and packet apply ownership
- `docs/TEMPLATE_BUILDER_VISIBLE_RANGE_BOUNDARY.md`: Phase 47 visible range
  boundary for bounded runtime node windows before virtualization
- `docs/TEMPLATE_BUILDER_VISIBLE_RANGE_REQUEST_BOUNDARY.md`: Phase 48 visible
  range request boundary for request reason, budget, and preserve policy
- `docs/TEMPLATE_BUILDER_RUNTIME_STORE_BOUNDARY.md`: Phase 49 structural
  runtime store boundary for browser lookup indexes below the editor view
- `docs/TEMPLATE_BUILDER_TEXT_PACKET_STORE_BOUNDARY.md`: Phase 50 direct text
  packet application boundary for the browser runtime store
- `docs/TEMPLATE_BUILDER_STORE_BACKED_RENDER_BOUNDARY.md`: Phase 51
  store-backed render model boundary before viewport virtualization
- `docs/TEMPLATE_BUILDER_RENDER_WINDOW_BOUNDARY.md`: Phase 52 render-window
  boundary between visible ranges and the canvas render path
- `docs/TEMPLATE_BUILDER_VIEWPORT_REQUEST_BOUNDARY.md`: Phase 53 viewport
  request boundary before DOM scroll measurement and virtualized rendering
- `docs/TEMPLATE_BUILDER_RENDER_SHELL_BOUNDARY.md`: Phase 54 full-document
  canvas shell with active-window detail rendering
- `docs/TEMPLATE_BUILDER_VIEWPORT_MEASUREMENT_BOUNDARY.md`: Phase 55
  section-shell measurement boundary before scroll controllers and virtualized
  renderer scheduling
- `docs/TEMPLATE_BUILDER_VIEWPORT_APPLY_BOUNDARY.md`: Phase 56 manual viewport
  measurement apply boundary and explicit recovery command
- `docs/TEMPLATE_BUILDER_VIEWPORT_SCROLL_CONTROLLER_BOUNDARY.md`: Phase 57
  debounced viewport scroll controller boundary before production viewport
  scheduling and virtualized rendering
- `docs/TEMPLATE_BUILDER_VIEWPORT_ANCHOR_BOUNDARY.md`: Phase 58
  section-relative viewport anchor boundary before node anchors and production
  scroll anchoring
- `docs/TEMPLATE_BUILDER_SECTION_SPACER_BOUNDARY.md`: Phase 59 measured section
  spacer boundary before production virtual lists and renderer scheduling
- `docs/TEMPLATE_BUILDER_SECTION_OFFSET_BOUNDARY.md`: Phase 60 section offset
  index and viewport prediction boundary before virtualized scheduling
- `docs/TEMPLATE_BUILDER_VIEWPORT_SCHEDULER_CANDIDATE_BOUNDARY.md`: Phase 61
  observe-only viewport scheduler candidate boundary before automatic render
  scheduling
- `docs/TEMPLATE_BUILDER_VIEWPORT_SCHEDULER_APPLY_BOUNDARY.md`: Phase 62
  guarded manual scheduler-candidate apply boundary before automatic render
  scheduling
- `docs/TEMPLATE_BUILDER_VIEWPORT_SCHEDULER_RUNTIME_BOUNDARY.md`: Phase 63
  scheduler runtime state and stale-candidate guard boundary before automatic
  render scheduling
- `docs/TEMPLATE_BUILDER_VIEWPORT_SCHEDULER_AUTOMATION_BOUNDARY.md`: Phase 64
  budgeted automatic scheduler-apply boundary before virtualized renderer
  consumption
- `docs/TEMPLATE_BUILDER_VIEWPORT_VIRTUAL_STACK_BOUNDARY.md`: Phase 65
  section-level virtual stack renderer consumption boundary
- `docs/TEMPLATE_BUILDER_VIEWPORT_LAZY_DETAIL_BOUNDARY.md`: Phase 66
  inactive heavy-node detail deferral boundary inside mounted virtual sections
- `docs/TEMPLATE_BUILDER_VIEWPORT_NODE_ANCHOR_BOUNDARY.md`: Phase 67
  node-aware selection jump and scroll restore boundary
- `docs/TEMPLATE_BUILDER_VIEWPORT_LARGE_DOCUMENT_AUDIT.md`: Phase 68
  large-document viewport behavior audit before Structural Runtime work
- `docs/TEMPLATE_BUILDER_STRUCTURAL_PROJECTION_BOUNDARY.md`: Phase 69
  derived structural projection boundary before structural packet application
- `docs/TEMPLATE_BUILDER_STRUCTURAL_PACKET_CONTRACT_BOUNDARY.md`: Phase 70
  structural packet v1 foundation bridge before runtime-store apply
- `docs/TEMPLATE_BUILDER_STRUCTURAL_PACKET_STORE_BOUNDARY.md`: Phase 71
  browser runtime-store structural packet apply boundary
- `docs/TEMPLATE_BUILDER_STRUCTURAL_MUTATION_BRIDGE_BOUNDARY.md`: Phase 72
  sandbox structural mutation bridge packet producer boundary
- `docs/TEMPLATE_BUILDER_STRUCTURAL_COMMAND_UI_BOUNDARY.md`: Phase 73
  bounded inspector structural command UI boundary
- `docs/TEMPLATE_BUILDER_STRUCTURAL_OUTLINE_JUMP_BOUNDARY.md`: Phase 74
  structural outline jump navigation boundary
- `docs/TEMPLATE_BUILDER_STRUCTURAL_DIAGNOSTICS_NAVIGATION_BOUNDARY.md`: Phase
  75 structural diagnostics navigation boundary
- `docs/TEMPLATE_BUILDER_STRUCTURAL_COMMAND_POLICY_BOUNDARY.md`: Phase 76
  structural command policy boundary
- `docs/TEMPLATE_BUILDER_STRUCTURAL_RUNTIME_CLOSE_AUDIT.md`: Phase 77
  Structural Runtime close audit and risk register
- `docs/TEMPLATE_BUILDER_DRAFT_RUNTIME_MODULE_BOUNDARY.md`: Phase 78
  browser-local draft runtime and caret/selection module boundary
- `docs/TEMPLATE_BUILDER_TEXT_DRAFT_LAYOUT_PUSH_BOUNDARY.md`: Phase 79
  browser-local text draft layout push boundary
- `docs/TEMPLATE_BUILDER_DRAFT_IME_HARDENING_BOUNDARY.md`: Phase 80
  browser-local draft IME hardening boundary
- `docs/TEMPLATE_BUILDER_RICH_INLINE_STYLE_PATCH_BOUNDARY.md`: Phase 81
  browser-local rich inline style patch request boundary
- `docs/TEMPLATE_BUILDER_TOOLBAR_STATE_BOUNDARY.md`: Phase 82
  browser-local toolbar state boundary
- `docs/TEMPLATE_BUILDER_FIELD_CHIP_INLINE_BOUNDARY.md`: Phase 83
  browser-local field chip inline boundary
- `docs/TEMPLATE_BUILDER_STYLE_AWARE_HISTORY_BOUNDARY.md`: Phase 84
  browser-local style-aware history boundary
- `docs/TEMPLATE_BUILDER_WYSIWYG_CLOSE_AUDIT.md`: Phase 85 WYSIWYG foundation
  close audit and risk register
- `docs/TEMPLATE_BUILDER_WYSIWYG_REENTRY_AUDIT.md`: Phase 116 WYSIWYG
  production-editing re-entry audit and Phase 117-120 card plan
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
  browser-local draft composition guards, extracted draft runtime module
  ownership, browser-local draft layout push summaries, and bounded
  history/live-layout summaries
- frontend authoring runtime beyond the initial pure editable-session/text
  transaction/intent-history/live-layout boundary contracts, including visible
  node composition, rich text editing, caret mapping, IME, product-level
  undo/redo UI, production viewport/scroll scheduling, lazy heavy-detail
  routes, responsibility-sliced editor modules, and a concrete browser
  live-layout renderer
- replacement for current parent `/api/paginate` or `/api/export`
- concrete backend server routes, storage adapters/writes, durable session
  history, and rendered artifacts on top of the generation runtime route and
  session storage record boundaries
- repeat/collection materialization and form-slot schema/runtime
- submission/reviewer workflow storage, routes, permissions, and runtime
- key history persistence, aliases/deprecated keys, and key migration execution
- concrete renderer-backed text measurement engines beyond the Phase 95
  profile adapter and Phase 100 engine spike boundary
- concrete HarfBuzz, ICU4X, Intl.Segmenter, LibThai, PyThaiNLP, AttaCut, font
  registry, or font hash execution beyond the Phase 100 spike plan
- concrete font file copy, font file hash scanning, or persisted font registry
  beyond the Phase 101 registry spike boundary
- concrete package font assets under `assets/fonts`, package metadata updates,
  or browser public-font mirrors beyond the Phase 102 ownership decision
- concrete font parsing, glyph inspection, browser public-font mirrors,
  rustybuzz/HarfBuzz shaping, or ICU4X line breaking beyond the Phase 103
  copied font/hash evidence
- concrete measurement engine execution beyond the Phase 104 profile identity
  contract
- concrete Rust/WASM adapter package, WASM build, runtime loader, or ICU4X data
  bundle beyond the Phase 105 boundary decision
- concrete ICU4X, Intl.Segmenter, LibThai, PyThaiNLP, or AttaCut execution
  beyond the Phase 106 corpus/oracle boundary
- concrete rustybuzz/HarfBuzz shaping, WASM loading, glyph fact capture, or
  production measurement binding beyond the Phase 107 shaping smoke boundary
- concrete text engine adapter package implementation, glyph evidence capture,
  or pagination draft mutation beyond the Phase 108 adapter SPI boundary
- concrete pagination draft creation from glyph evidence beyond the Phase 109
  evidence acceptance boundary
- concrete production measurement binding or pagination measurer replacement
  beyond the Phase 110 measurement draft handoff boundary
- concrete rustybuzz/WASM adapter package implementation beyond the Phase 111
  text engine adapter lane close audit
- concrete rustybuzz/WASM shaping inside `@flowdoc/text-engine-rust-wasm`
  beyond the Phase 112 package scaffold
- concrete WASM build/loading, TypeScript adapter binding to real glyph facts,
  or production measurement replacement beyond the Phase 113 package-local
  rustybuzz smoke
- concrete multi-line wrap, ICU4X line breaks, WASM artifact loading, or
  production measurement replacement beyond the Phase 114 raw rustybuzz mapping
- concrete native/WASM parity, ICU4X line breaks, multi-line wrapping, or
  production measurement replacement beyond the Phase 115 smoke corpus harness
- concrete contenteditable mapping, rich inline style execution, toolbar
  command dispatch, field chip insertion, or WYSIWYG production editing beyond
  the Phase 116 re-entry audit
- concrete internal text/table placement execution behind pausable layout job
  records
- concrete non-text table-cell content splitting beyond the Phase 97 readiness
  boundary
- multi-page column balancing
- concrete TOC text rewrite/reflow beyond the Phase 98 final page-reference
  resolution boundary
- concrete PDF/DOCX renderer implementation beyond measured-command adapter
  contracts
- concrete durable operation/authoring history storage adapters and writes
- durable/full undo/redo execution beyond metadata and sandbox in-memory text
  patches
- product-level visible editor acceptance smokes beyond the sandbox render path
- durable browser cache persistence, full structural packet application,
  node-aware production scroll anchoring, and true virtualized renderer
  scheduling beyond the sandbox render-shell, viewport-measurement, manual
  viewport-apply, debounced scroll-controller, section-anchor, section
  spacer/offset, observe-only scheduler-candidate, manual scheduler-apply,
  scheduler-runtime stale guard, budgeted scheduler-auto, section virtual
  stack, lazy heavy-detail, and node-aware anchor contracts
- publishing/distribution strategy beyond local package consumption
