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
  - `fixtures/product-report-vnext-baseline.flowdoc.json`
  - `fixtures/product-report-vnext-minimal.flowdoc.json`
  - `fixtures/reorder-blocked-target-qa.flowdoc.json`
  - role definitions: `docs/FIXTURE_ROLES.md`
- Node v1 inventory audit records the current canonical, graph, operation,
  pagination, backend-passage, and product-presentation coverage before
  text-block grammar and image contracts change the schema.
- Text-block v1 grammar lock defines the target flat inline vocabulary,
  UTF-16/atomic offset rules, style and empty-block normalization, nested text
  target ownership, and the reserved inline-image insertion point.
- Text-block v1 grammar validator and normalizer adds an opt-in pure audit and
  deterministic normalization plan without changing package reads or writes.
- Canonical package parser and serializer with safe parse variants
- Explicit package v2/document v3 to package v3/document v4 migration planning
  audits source graph/text/field/data facts, blocks semantic guesses, applies a
  deterministic source-immutable copy, and requires strict target acceptance.
- Version capability contract distinguishes active package v2/document v3
  runtime support from package v3/document v4 migration-target validation so
  downstream consumers can reject unsupported pairs before parser execution.
- Backend Phase 259 persists explicit migrations behind base-revision and
  idempotency gates while retaining the source v3 snapshot; v4 runtime
  consumers remain intentionally inactive.
- Structure lifecycle contracts now include strict draft/published/instance
  identities, published Structure Policy, and a pure source-immutable Document
  Instance materialization plan with explicit provenance and registry
  ownership. Persistence, data resolution, and generated expansion remain
  inactive.
- Phase 273 pins published field/style/static-media contracts and atomic
  instance Data Snapshot/media inputs to one exact instance revision before
  resolved projection. Cross-registry asset collisions block instead of
  guessing ownership.
- Phase 274 resolves pinned scalar, image, and text-style inputs into explicit
  binding tables beside a source-immutable instance graph. Invalid references
  block the whole projection; generated expansion, pagination, and rendering
  remain inactive.
- Phase 275 adds the v4-native text-block grammar, five-inline projection, safe
  UTF-16 offsets, canonical empty-block caret, and inline-local selection
  anchors. V4 text mutation and editor input remain inactive.
- Phase 276 adds policy-aware v4 rich-inline replacement for exact Structure
  draft or Document Instance revisions, with field/media/style capability
  preflight and identity/history facts. Backend execution remains inactive.
- Phase 277 plans explicit v4 field and atomic inline commands from canonical
  selection anchors, including deterministic text splitting, while retaining
  Phase 276 as the only policy-aware commit boundary.
- Phase 278 creates v4 resolved measurement packets and accepts complete line
  ranges mapped back to authored inline and resolved-field offsets. It does not
  choose a line breaker or paginate.
- Phase 279 paginates accepted v4 text lines into source-retaining page
  fragments without relayout and proves a bounded 6,000-line/250-page
  text-block case. Mixed-document layout/render remains inactive.
- Phase 280 close-audits text-block v4: retained core contracts now unblock
  columns/table split planning and transport integration, while editor input,
  backend execution, mixed layout, generated content, and rendering stay open.
- Phase 281 closes the cross-repo Structure Authoring v4 transport slice
  through backend revision/idempotency and editor stale-apply gates. It keeps
  WYSIWYG input, production storage, columns/table split, mixed layout,
  renderer, and export closed.
- Phase 282 locks Columns v4 as independent parallel column flows with
  longest-column completion, depth-three nesting, direct-body-only page
  breaks, plan/reconcile cursor semantics, and bounded performance criteria.
- Phase 283 adds deterministic v4 Columns track geometry, capability-owned
  minimum width, depth-three structure validation, JSON-safe cursor/checkpoint
  shapes, and factual measurement/pagination/render impact lanes.
- Phase 284 adapts accepted v4 text lines into source-retaining Columns child
  fragment candidates with prefix heights, keep policy, and deterministic
  fingerprints without measuring or paginating content.
- Phase 285 adds a monotonic single-column planner with prefix-height
  checkpoint lookup, continuation cursors, prefer-together fallback,
  oversized-fragment rejection, and no-progress protection.
- Phase 286 reconciles sibling column plans atomically into multi-page Columns
  fragments, retains completed lanes as empty continuations, uses the longest
  lane height, and bounds page attempts without executing measurement.
- Phase 287 recursively paginates nested Columns through depth three using
  parent track width and remaining page height, retaining nested cursor trees
  and blocking depth, width, or cursor ownership mismatches.
- Phase 288 adds stable nested-page signatures and proves 6,000 prepared text
  fragments through depth-three Columns produce 250 pages with bounded linear
  work facts and no measurement execution.
- Phase 289 close-audits Columns v4: the text-backed independent-flow core
  slice now passes geometry, canonical assembly, parallel/nested pagination,
  determinism, impact, and scale gates while mixed child families, renderer,
  authoring operations, backend, and editor remain open.
- Phase 290 locks identity, provenance, and deterministic allocation-input
  facts as separate contracts. New allocated ids are bounded and opaque with
  explicit owners/scopes; existing authored and lifecycle ids are not rewritten.
- Phase 291 publishes strict allocated-identity profiles and structured
  provenance schemas for lifecycle, resolved, layout, request, job, and artifact
  domains without allocating or persisting ids inside core.
- Phase 292 canonicalizes provenance into length-safe allocation-input keys and
  blocks key drift, duplicate/conflicting ids, cross-scope reuse, and one input
  mapping to multiple ids before consumer persistence or pagination.
- Phase 293 closes Identity Standard v1 as the stable prerequisite for Table
  Definition and Resolved Row contracts while backend allocation/persistence,
  collaboration, product display, and table execution remain open.
- Phase 294 locks Table v4 as ordered static/collection row sources resolved
  before measurement, with stable semantic columns, `colSpan` occupancy,
  explicit empty/break policies, and synchronized cell pagination boundaries.
- Phase 295 publishes strict standalone Table Definition contracts with exact
  Structure ownership, stable normalized columns, mixed row sources, row
  templates, gap-free `colSpan`, and explicit v1 `rowSpan` rejection.
- Phase 296 adds exact-instance pinned collection snapshots with retained item
  order, unique stable `itemKey`, JSON-safe scalar/image item values, and no
  array-index identity fallback or external fetching.
- Phase 260 adds an isolated package 3/document 4 read-only runtime projection;
  active mutation, measured layout, exact rendering, and export remain closed.
- Phase 261 adds explicit revisioned editor migration intent, idempotent retry,
  result handling, and verified refresh into the v4 read-only projection.
- Phase 262 adds operation-granular capability and isolated same-parent v4
  `node.reorder`; all other v4 mutation and exact output remain closed.
- Phase 263 adds block-subtree v4 `node.delete` without garbage-collecting
  shared field/data/asset registries.
- Phase 264 adds deterministic block-subtree v4 `node.duplicate`, rewrites
  authored node/inline identities, and preserves shared registry references.
- Phase 265 locks v4 authored/layout/field/media/version truth boundaries and
  makes text-block acceptance a prerequisite for columns/table semantics.
- Phase 266 close-audits generic v4 lifecycle across all valid block/parent
  combinations, aligns image with media, and rejects same-index reorder.
- Phase 267 publishes an evidence-backed v4 node-family readiness matrix and
  names text-block as the next critical dependency for columns/table.
- Phase 268 locks Structure Definition and Materialized Document Instance as
  separate lifecycle artifacts, with external data resolving through a derived
  document projection before pagination and artifacts.
- Phase 269 audits v4 impact across core, backend, and editor, retaining the
  graph/revision/adapter foundations while identifying package, data,
  generation, policy, and product terminology changes required next.
- Phase 270 adds strict JSON-safe lifecycle identity contracts for mutable
  Structure Definition drafts, immutable Published Structure Versions, and
  Materialized Document Instances without activating new package kinds.
- Phase 271 adds strict Structure Policy and effective capability contracts,
  separating core capability, authored governance, and session permission.
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
- Contenteditable range mapping boundary maps bounded segment facts into
  FlowDoc UTF-16 draft offsets while blocking styled-run, atomic-inline, and
  text-mismatch cases before rich inline execution
- Rich inline patch execution boundary consumes mapped ranges and style intent
  to record browser-local styled-run facts while keeping package mutation,
  history, live layout, exact output, and backend calls deferred
- Toolbar command dispatch boundary routes visible draft style controls through
  rich inline execution while keeping active mark detection guarded and package
  mutation deferred
- Field chip insert execution boundary records browser-local atomic chip facts
  from mapped carets and field catalog intent while keeping canonical field-ref
  mutation and key migration deferred
- WYSIWYG execution re-baseline audit records that Phases 117-120 proved
  browser-local execution evidence, not production DOM binding or canonical
  rich inline commits, and sequences Phases 122-126
- Rich inline state boundary consolidates browser-local styled-run and atomic
  field-chip facts into one deterministic draft state while blocking overlap
  ambiguity before canonical commit planning
- Contenteditable segment capture boundary reads browser-owned
  contenteditable-style segment facts into the Phase 117 mapper shape while
  keeping production DOM binding and canonical rich inline commit deferred
- Rich inline commit planning boundary maps browser-local rich inline state to
  canonical vNext inline child facts and commit effects while keeping package
  mutation execution deferred
- Rich inline commit bridge boundary executes accepted Phase 124 plans through
  a vNext-native in-memory package mutation with history-ready records and
  live/exact invalidation summaries, while keeping persistence and rendering
  out of scope
- WYSIWYG execution close audit closes the Phase 122-125 foundation pass as
  capture -> plan -> commit bridge evidence while keeping production editing
  risks explicit
- Rich inline undo/redo replay, production contenteditable surface hardening,
  rich inline session persistence, and rich inline live/exact parity audit
  carry the WYSIWYG / Editing foundation through Phase 130 without claiming
  renderer artifacts, storage adapters, collaboration, or production primary
  input
- Five-lane project progress index consolidates Viewport / Virtualization,
  Structural Runtime, WYSIWYG / Editing, Backend / API / Persistence, and
  Exact Output / Renderer status into one roadmap audit
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
- Thai line-break evidence manifest boundary records ICU4X primary candidate
  and Intl.Segmenter comparison break opportunities in a separate UTF-16
  evidence fixture without mutating the neutral Thai corpus or computing line
  boxes.
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
- Text engine line wrap evidence boundary consumes rustybuzz glyph advances and
  Thai line-break evidence to produce multi-line adapter line boxes while
  keeping break reasons outside the public line-box fact shape.
- Text engine runtime identity boundary records rustybuzz, ICU4X, ICU4X data,
  font-hash, output-shape, runtime-target, and WASM digest gate evidence before
  native/WASM parity or production measurement binding is claimed.
- Text engine renderer-backed provider bridge routes external accepted
  text-engine evidence through wrap, acceptance, and handoff into the existing
  renderer-backed `VNextTextMeasurer` adapter while keeping default pagination
  measurement unchanged.
- PDF renderer spike package boundary adds a private dependency-free external
  package that consumes vNext PDF adapter plans and emits minimal text-only PDF
  bytes plus a local not-stored artifact manifest.
- Artifact manifest boundary defines the core storage-record lifecycle for
  rendered artifacts, including profile ids, media metadata, byte length,
  sha256, storage key, bounded failure summaries, and explicit not-written
  storage status.
- Artifact API route boundary defines pure HTTP-shaped contracts for artifact
  generation requests, status checks, session artifact lists, and download
  metadata without starting a server, reading storage, executing auth, or
  streaming bytes.
- Artifact job boundary defines durable layout/artifact job records and pure
  lifecycle transitions for queued, layout-running, rendering, rendered,
  failed, cancelled, and retry states without worker, queue, renderer, route,
  or storage execution.
- Storage adapter interface boundary defines typed package/session, history,
  rich inline, artifact manifest, and artifact job storage collection contracts
  with expected revision, idempotency key, and optional write-token shapes
  before any concrete backend choice.
- Product editor integration smoke boundary composes the template-builder
  sandbox viewport, runtime cache/store, structural packets, rich inline
  commit, undo/redo, and live/exact stale signals in one product-like sequence
  without claiming production editor readiness.
- Browser timing smoke boundary adds a dependency-free sandbox timing script
  for boot, visible range, scroll, selection, structural command, rich inline
  draft, and rich inline commit operations while keeping browser-driver and
  production benchmark claims unbound.
- WYSIWYG primary input decision gate recommends hybrid managed cards with a
  hardened contenteditable island for the active text block, while explicitly
  rejecting full-document contenteditable as the v1 production primary input.
- Rich inline operation decision boundary accepts full inline-child replacement
  for the v1 single-user vertical slice while making granular operations a
  prerequisite for collaboration/offline claims.
- First vertical slice RC plan scopes the first single-user path from canonical
  template/report input through field binding, browser-local authoring, rich
  inline stale exact generation, renderer-backed measurement evidence, minimal
  PDF artifact bytes, artifact records, and storage-record boundary without
  claiming production launch readiness.
- Vertical slice RC orchestrator boundary adds an input-driven, JSON-safe
  single-user report builder that composes caller-supplied evidence summaries
  into PASS, RISK, UNKNOWN, FAIL / BLOCKER, and intentionally-not-production
  readiness lists without loading fixtures, writing storage, running renderers,
  importing external packages, or claiming production readiness.
- Vertical slice RC scenario boundary adds the first canonical package
  v2/document v3 RC report fixture plus scenario metadata for a rich inline
  replacement, field-ref chip case, stale exact generation expectation, PDF
  artifact expectation, and storage collection expectation.
- Vertical slice measurement gate compares caller-supplied renderer-backed and
  approximate measurement summaries by `measurementProfileId`, reports drift,
  digest, and native/WASM parity status, and keeps default pagination
  measurement unchanged.
- Vertical slice artifact bridge composes caller-supplied PDF spike manifest
  summaries with core artifact manifest/job records into RC artifact summaries
  without importing the external PDF spike package, writing storage, adding
  routes, or claiming PDF fidelity.
- Vertical slice storage simulation summarizes storage adapter write results
  for package/session, durable history, rich inline session, artifact manifest,
  and artifact job records while representing idempotent replay and revision
  conflicts without choosing a concrete backend.
- Vertical slice RC end-to-end smoke composes the scenario, key diagnostics,
  rich inline commit, exact stale signal, measurement gate, artifact bridge,
  storage simulation, and RC report builder into one bounded report without
  claiming production launch readiness.
- Vertical slice RC close audit closes the first RC foundation pass as a
  bounded single-user evidence path, keeps production blockers visible, and
  recommends the hybrid managed card input implementation plan as the next
  lane.
- Hybrid managed card input implementation plan turns the Phase 143 input
  decision into ownership, guard, fallback, and follow-up phase boundaries
  without implementing production contenteditable behavior.
- Hybrid input runtime ownership boundary adds a browser-safe classifier for
  managed card selection, one active text-block island, textarea fallback, and
  rejected input targets while keeping canonical package truth unmutated.
- Active text-block island boundary adds a DOM-free lifecycle model for one
  active text block, including selection facts, IME composition guard, dirty
  state, commit-request readiness, cross-block rejection, and explicit close
  reasons without committing to vNext core.
- Hybrid command policy boundary adds a DOM-free ready/fallback/blocked matrix
  for text, rich inline, field-chip, paste, commit, and cancel commands before
  any command execution or package mutation.
- Active text-block DOM binding smoke captures JSON-safe contenteditable-like
  surface facts, UTF-16 selection offsets, text snapshots, active node id, and
  composition state for one active island without production DOM range support.
- Active island commit bridge smoke converts accepted island capture facts into
  `text-block.rich-inline.replace` requests and proves the existing sandbox
  rich inline mutation bridge preserves packet refresh and exact stale signals.
- Field chip command boundary exposes pure authoring contracts for delete,
  copy, paste, replace-with-text, and blocked internal edits while preserving
  field-key visibility and routing safe mutations toward rich inline intent.
- Paste/delete preflight boundary classifies plain text paste, rich paste,
  delete selection, field-chip boundary delete, structural boundary delete, and
  IME composition guards as allow, transform, fallback, or reject before
  browser clipboard integration.
- Renderer segment / hit-test evidence boundary defines renderer-backed segment
  facts and hit-test responses with UTF-16 ranges, glyph ranges, boxes,
  atomic/field-chip flags, affinity, and confidence before caret parity claims.
- Hybrid input foundation close audit closes Phases 154-161 as a bounded
  evidence path, keeps production input readiness blocked, and recommends a
  browser-QA-first next lane.
- Hybrid input browser QA boundary adds an optional sandbox-local JSON-safe
  report for selection, caret, IME, paste, delete, active island commit,
  fallback, and one-island guard evidence without requiring a browser driver in
  core check.
- Optional browser driver smoke boundary adds a sandbox-local report contract
  for externally supplied driver facts over focus, selection/caret, typing,
  IME, paste, unsafe paste blocking, field-chip delete guard, and active island
  commit without adding automation dependencies to core check.
- Hybrid input browser evidence close audit closes Phases 163-164 as a browser
  evidence lane, keeps production browser/contenteditable readiness blocked,
  and recommends a hardening-threshold plan before driver matrix or production
  binding work.
- Hybrid input hardening threshold plan defines PASS/WARNING/BLOCKED/UNKNOWN
  policy for selection/caret, IME, paste/delete, field-chip atomicity, active
  island commit, fallback behavior, and JSON-safe report completeness before a
  browser matrix is chosen.
- Browser matrix decision bounds v1 input support to the Windows
  Chromium/Edge path with English and Thai input evidence while deferring
  Firefox, Safari, mobile, complex CJK IME, and broad cross-browser parity.
- Guarded input integration plan assigns the active text-block island mount,
  app-shell packet refresh, fallback textarea path, unsupported-block behavior,
  and commit bridge route before runtime slice implementation.
- Guarded input runtime slice composes sandbox-local ownership, active island
  lifecycle, command policy, DOM binding smoke, and commit bridge smoke into a
  JSON-safe report and planned rich-inline bridge request without production
  contenteditable binding.
- Guarded input paste/delete/field-chip slice composes the runtime slice with
  paste/delete preflight so plain paste, unsafe paste blocking, structural
  delete blocking, and atomic field-chip command intents are JSON-safe before
  production clipboard binding.
- Guarded input integration close audit accepts the Phase 166-170 lane as
  internal-alpha sandbox evidence while keeping production contenteditable,
  browser, clipboard, collaboration/offline, and storage claims blocked.
- Pre-Phase 172 risk / unknown register sharpens input, browser, commit,
  fallback, field-chip, and storage-coupling risks so the storage choice gate
  cannot inherit production input readiness claims by accident.
- Concrete storage choice gate selects `packages/storage-file-json` as the
  first external internal-alpha record adapter path, defers SQLite/native
  dependency risk, and keeps artifact bytes for a later byte-store slice.
- External file-backed storage adapter slice implements
  `@flowdoc/storage-file-json` outside core with real JSON record
  read-after-write, idempotency replay, expectedRevision conflicts, and
  revision increments while leaving artifact bytes to Phase 174.
- Artifact byte store slice adds a separate filesystem byte store in
  `@flowdoc/storage-file-json` with sha256 computation, read-back, missing
  artifact errors, and manifest-to-byte consistency checks while keeping
  record writes and byte writes non-transactional.
- Storage-backed RC roundtrip smoke adds `@flowdoc/internal-alpha-runner` and
  runs the first RC scenario through concrete file-backed records plus artifact
  bytes before route-shaped storage binding.
- Backend route storage binding boundary adds route-shaped helpers over the
  concrete record adapter for session save/load and artifact request/status/
  metadata without registering a server route or streaming bytes.
- Artifact job execution slice runs the internal-alpha job path from queued
  job through minimal PDF spike bytes, filesystem byte storage, rendered
  manifest, and rendered job status without claiming production renderer or
  backend readiness.
- PDF renderer decision gate keeps the dependency-free minimal PDF spike as
  internal-alpha evidence only and defers production renderer package selection
  until after measurement rollout evidence.
- Measurement rollout gate accepts renderer-backed measurement only as guarded
  internal-alpha evidence for the selected slice and keeps default measurer
  replacement blocked.
- Internal alpha vertical slice runs one bounded path from opening the fixture
  through active text-block edit, save/reload, PDF spike generation, artifact
  storage/retrieval, and status report while keeping production claims blocked.
- Internal alpha close audit and documentation consolidation gate closes the
  Phase 172-180 evidence lane and adds compact current-state pointers for daily
  work without deleting the historical audit trail.
- V1 hardening backlog triage gate ranks the remaining production blockers,
  selects measurement rollout / digest / parity / drift as the first
  production hardening lane, and keeps internal-alpha evidence separate from
  production readiness.
- Measurement digest parity drift hardening gate defines digest identity,
  native/WASM parity, drift status, v1 fixture evidence, and default-measurer
  replacement blockers without binding production measurement.
- V1 measurement fixture evidence matrix gate selects stable corpus and
  fixture ids, release-gating coverage, profile requirements, and required
  JSON-safe summary facts while keeping raw evidence outside core.
- Measurement evidence summary manifest gate defines a JSON-safe manifest
  shape for digest identity, parity, drift, status, and retention pointers
  while keeping raw native/WASM/renderer evidence outside root tests/docs.
- Measurement evidence summary manifest fixture stub gate adds
  `fixtures/measurement-evidence-summary-manifest.stub.v1.json` with all
  release-gating fixture rows still unknown/missing, raw evidence excluded, and
  production measurement replacement blocked.
- Measurement evidence coverage gap triage gate ranks the Phase 186 stub gaps
  by owner and prerequisite order, selects digest/runtime identity as the first
  blocker, and keeps default-measurer replacement blocked.
- Text engine runtime identity digest evidence builder gate adds a
  package-local builder under `@flowdoc/text-engine-rust-wasm` for JSON-safe
  digest/root-summary handoff, keeps the current WASM digest pending, and
  blocks native/WASM/parity/drift/threshold/accepted-manifest lanes.
- Text engine runtime identity digest evidence population gate decides the
  current WASM artifact digest cannot be pinned yet, adds a package-local
  retained-pending summary, and keeps production measurement replacement
  blocked.
- Text engine WASM artifact digest pinning gate checks the package-local
  candidate paths, defines `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`
  as the accepted future output path, and keeps digest pinning pending because
  no artifact exists yet.
- Text engine WASM artifact build output gate defines the package-local
  WASM build command/output metadata, records missing `wasm-pack`, missing
  `wasm32-unknown-unknown`, and binary-only crate blockers, and keeps artifact
  production plus digest pinning pending.
- Text engine WASM build toolchain readiness gate accepts the `wasm-pack`
  path, adds a minimal `cdylib`/`rlib` Rust crate target plus package-local
  `wasm:build` metadata, keeps root checks independent of WASM tooling, and
  leaves artifact production blocked until `wasm-pack` and
  `wasm32-unknown-unknown` are available.
- Text engine WASM toolchain acquisition gate defines developer/CI bootstrap
  for `wasm-pack`, `rustup target add wasm32-unknown-unknown` for target
  provisioning, adds package-local `wasm:check-toolchain`, and keeps artifact
  production plus digest pinning blocked while root checks stay independent.
- Text engine WASM toolchain optional readiness smoke wraps the package-local
  diagnostic with `wasm:readiness-smoke`, records JSON-safe
  unavailable/blocked toolchain status, and keeps artifact production plus
  digest pinning blocked because `wasm-pack` and `wasm32-unknown-unknown` are
  still unavailable.
- Text engine WASM artifact production gate reruns the package-local readiness
  smoke, skips `wasm:build` because the toolchain is unavailable, records
  absent artifact facts as JSON-safe summary values, and keeps Phase 196
  digest pinning blocked until a real artifact exists.
- Text engine WASM toolchain provisioning bootstrap gate selects developer/CI
  bootstrap as the package-local strategy, adds `wasm:bootstrap-plan` as a
  plan/check script, records rustc/cargo/wasm-pack/target version policy, and
  keeps artifact production plus digest pinning blocked.
- Text engine WASM toolchain provisioning execution gate attempts the accepted
  provisioning commands, installs `wasm32-unknown-unknown`, records
  `wasm-pack` installation failure against the current `rustc 1.88.0`
  toolchain, and keeps artifact production plus digest pinning blocked.
- Text engine WASM toolchain version compatibility gate compares Rust upgrade,
  older `wasm-pack` pinning, pinned CI image, internal cache, and preinstalled
  toolchain strategies; it selects Rust 1.91+ upgrade as the immediate path
  and pinned CI image as the longer-term reproducible path.
- Text engine WASM toolchain Rust upgrade execution gate upgrades stable Rust
  to `rustc 1.96.0`, verifies `wasm32-unknown-unknown` remains installed,
  installs `wasm-pack 0.15.0` after the Rust 1.91+ condition passes, records
  `toolchainReady=true`, and keeps artifact production plus digest pinning for
  later dedicated gates.
- Text engine WASM artifact production retry gate runs package-local
  `wasm:build` after bindgen dependency/export readiness, produces
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`, records
  generated JS/TypeScript/package metadata shape, and keeps digest pinning
  pending until the dedicated sha256 phase.
- Artifact digest pinning execution computes and pins the real package-local
  WASM artifact sha256
  `4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44` after
  matrix, corpus, policy, profile, output shape, and path validation while
  keeping native/WASM evidence, parity, drift, accepted manifests, and
  production measurement replacement blocked.
- Native evidence summary gate adds package-local JSON-safe metadata for the
  Thai line-break core and canonical Latin paragraph subset, attaches it to
  the pinned digest context, and keeps raw native evidence outside root
  docs/tests while blocking WASM evidence, parity, drift, thresholds, accepted
  manifests, and production measurement replacement.
- WASM evidence summary gate adds package-local JSON-safe metadata for the
  same Thai line-break core and canonical Latin paragraph subset, attaches it
  to the same pinned digest context, and keeps raw WASM evidence outside root
  docs/tests while blocking native/WASM parity, drift, thresholds, accepted
  manifests, and production measurement replacement.
- Native/WASM parity summary gate compares the native and WASM summary
  metadata for that same subset, records matching digest context, fixture ids,
  scenario ids, and required fact coverage, and keeps raw native/WASM evidence
  outside root docs/tests while blocking renderer drift, thresholds, accepted
  manifests, and production measurement replacement.
- Renderer-backed drift summary gate adds package-local JSON-safe metadata for
  the same Thai line-break core and canonical Latin paragraph subset, records
  unthresholded drift metadata against the matched parity/digest context, and
  keeps raw native/WASM/renderer evidence outside root docs/tests while
  blocking numeric thresholds, accepted manifests, and production measurement
  replacement.
- Numeric drift threshold decision accepts the package-local JSON-safe width,
  height, and line-count drift threshold policy for that same subset and
  context while keeping raw native/WASM/renderer evidence outside root
  docs/tests and blocking accepted manifest population, production binding,
  and default-measurer replacement.
- Accepted summary manifest population adds a root JSON-safe manifest with
  accepted entries for the same Thai line-break core and canonical Latin
  paragraph subset while keeping the full v1 matrix partial and keeping
  production binding plus default-measurer replacement blocked.
- Measurement hardening close audit confirms those accepted minimal-subset
  entries, decides they are sufficient for a mini infrastructure checkpoint
  only, recommends Template Publish / Variable Schema / Render API planning
  next, and keeps full v1 measurement production readiness plus
  default-measurer replacement blocked.
- Template Publish / Variable Schema / Render API planning gate ranks the next
  non-measurement mini infrastructure lanes, selects Template Publish /
  Version Boundary first, and defers Variable Schema plus Render API until a
  stable published template/version target exists.
- Template Publish / Version Boundary Gate defines mutable draft template
  identity separately from immutable published template version identity,
  JSON-safe version metadata, canonical package v2/document v3 candidate
  source, publish validation evidence shape, retention pointer evidence, and
  rollback/deprecation/superseding policy names without schema, backend,
  renderer, or production measurement changes.
- Template Publish Validation Evidence Gate adds JSON-safe publish validation
  evidence for `fixtures/product-report-vnext.flowdoc.json`, recording package
  parse, graph diagnostics, key/data diagnostics, export-readiness,
  measurement, rejected blocker vocabulary, and retention pointer summaries
  while keeping schema, backend, storage, renderer, Variable Schema, and Render
  API behavior out of scope.
- Template Publish Accepted Version Metadata Gate populates JSON-safe accepted
  published version metadata with immutable template version and source
  snapshot pointer facts, preserves export-readiness warning visibility, and
  keeps measurement at mini-checkpoint scope without schema, backend, storage,
  renderer, Variable Schema, or Render API behavior.
- Template Publish Close Audit closes the Template Publish mini lane for a
  mini infrastructure checkpoint only, accepts `ready-with-warnings` because
  warning visibility is preserved, and selects Variable Schema / Data Contract
  Planning Gate next without schema, backend, storage, renderer, Variable
  Schema, or Render API implementation.
- Variable Schema / Data Contract Planning Gate attaches the variable/data
  lane to the accepted published template version metadata, ranks reference
  discovery before schema/policy work, and selects Variable Reference Discovery
  Gate next without implementing Variable Schema, Render API, backend,
  storage, renderer, or schema behavior.
- Variable Reference Discovery Gate produces JSON-safe discovery evidence for
  the accepted published template version target, records 11 authored
  field-ref occurrences and 6 candidate variable ids, resolves every candidate
  against the package field registry, and selects Variable Schema Metadata
  Shape Gate next without schema, Render API, backend, storage, or renderer
  behavior.
- Variable Schema Metadata Shape Gate defines JSON-safe metadata rows for all
  6 discovered candidate variables, preserves table-cell occurrence context
  for `metric-value-total-field` and `metric-value-risk-field`, keeps
  required/default/validation/compatibility behavior deferred as metadata
  statuses, and selects Data Contract Validation Policy Gate next without
  schema, Render API, backend, storage, or renderer behavior.
- Data Contract Validation Policy Gate defines JSON-safe validation policy
  vocabulary, accepted result statuses, blocker/warning vocabulary, and
  table-cell value policy status preservation for the accepted metadata shape,
  then selects Required / Missing / Default Value Policy Gate next without
  runtime validation, schema, Render API, backend, storage, or renderer
  behavior.
- Required / Missing / Default Value Policy Gate defines JSON-safe required,
  missing, and default-value policy metadata for all 6 candidate variables,
  blocks missing required `report.total`, records defaults as metadata-only
  without runtime application, preserves table-cell context, and selects
  Compatibility Policy With Published Template Versions Gate next without
  runtime validation, schema, Render API, backend, storage, or renderer
  behavior. See `docs/REQUIRED_MISSING_DEFAULT_VALUE_POLICY_GATE.md`.
- Compatibility Policy With Published Template Versions Gate defines
  JSON-safe compatibility policy metadata for variable/data contract evidence
  against published template versions, blocks incompatible id/type/required
  no-default/table-cell/template-version changes, keeps warning-only changes
  explicit, and selects Variable Schema / Data Contract Close Audit next
  without runtime validation, schema, Render API, backend, storage, or renderer
  behavior. See `docs/VARIABLE_COMPATIBILITY_POLICY_GATE.md`.
- Variable Schema / Data Contract Close Audit confirms the accepted
  variable/data evidence chain from reference discovery through compatibility
  policy, closes that mini lane for a mini infrastructure checkpoint only, and
  selects Render API Contract Planning Gate next without runtime validation,
  runtime compatibility enforcement, schema, backend, storage, renderer, or
  Render API implementation. See
  `docs/VARIABLE_SCHEMA_DATA_CONTRACT_CLOSE_AUDIT.md`.
- Render API Contract Planning Gate confirms the accepted template version
  target and variable/data evidence chain, ranks request envelope,
  response/status, readiness, artifact/job placeholder, and blocker vocabulary
  sub-lanes, selects Render API request envelope contract first, and keeps
  backend routes, runtime Render API behavior, storage, auth/authz, renderer
  artifact bytes, runtime validation/defaults/compatibility enforcement, and
  schema mutation out of scope. See
  `docs/RENDER_API_CONTRACT_PLANNING_GATE.md`.
- Render API Request Envelope Contract Gate defines JSON-safe request envelope
  metadata at `fixtures/render-api-request-envelope-contract.v1.json`, anchors
  it to `template-product-report-vnext@v1`, defines the `variables` payload
  container, envelope status vocabulary, malformed-envelope blockers,
  client request/correlation metadata, idempotency and duplicate request
  policy names, and selects Render API Response / Status Contract Gate next
  without backend routes, runtime Render API behavior, storage, auth/authz,
  renderer artifact bytes, runtime validation/defaults/compatibility
  enforcement, or schema mutation. See
  `docs/RENDER_API_REQUEST_ENVELOPE_CONTRACT_GATE.md`.
- Render API Response / Status Contract Gate defines JSON-safe response/status
  metadata at `fixtures/render-api-response-status-contract.v1.json`, maps the
  accepted request envelope statuses to `accepted`, `accepted-with-warnings`,
  `blocked`, and `unknown` response statuses, keeps render job status and
  artifact pointer as metadata-only placeholders, and selects
  Render-Readiness Validation Policy Gate next without backend routes,
  runtime Render API behavior, storage, auth/authz, renderer artifact bytes,
  actual render execution, runtime validation/defaults/compatibility
  enforcement, or schema mutation. See
  `docs/RENDER_API_RESPONSE_STATUS_CONTRACT_GATE.md`.
- Render-Readiness Validation Policy Gate defines JSON-safe readiness policy
  metadata at `fixtures/render-readiness-validation-policy.v1.json`, maps
  response statuses to `render-ready`, `render-ready-with-warnings`,
  `render-blocked`, `readiness-deferred`, and `unknown`, defines required
  evidence checks plus deferred runtime checks, keeps job/artifact lifecycle
  placeholder metadata deferred, and selects Artifact Pointer / Job Status
  Placeholder Policy Gate next without backend routes, runtime Render API
  behavior, storage, auth/authz, renderer artifact bytes, actual render
  execution, runtime validation/defaults/compatibility enforcement, or schema
  mutation. See `docs/RENDER_READINESS_VALIDATION_POLICY_GATE.md`.
- Artifact Pointer / Job Status Placeholder Policy Gate defines JSON-safe
  placeholder policy metadata at
  `fixtures/artifact-pointer-job-status-placeholder-policy.v1.json`, maps the
  prior `deferred-job-placeholder` response placeholder into
  `job-placeholder-deferred`, keeps job id, artifact pointer, artifact
  retention pointer, and artifact bytes null/unproduced, records lifecycle and
  runtime deferrals, and selects Render API Error / Blocker Vocabulary Gate
  next without backend routes, runtime Render API behavior, durable job
  lifecycle, storage, auth/authz, renderer artifact bytes, actual render
  execution, runtime validation/defaults/compatibility enforcement, or schema
  mutation. See
  `docs/ARTIFACT_POINTER_JOB_STATUS_PLACEHOLDER_POLICY_GATE.md`.
- Render API Error / Blocker Vocabulary Gate defines JSON-safe vocabulary
  metadata at `fixtures/render-api-error-blocker-vocabulary.v1.json`,
  preserves request envelope blockers, response/status blocked summary shape,
  readiness blockers/warnings, and artifact/job placeholder blockers/warnings,
  groups vocabulary by boundary, keeps runtime and production readiness flags
  false, and selects Render API Contract Close Audit next without runtime
  error handling, backend routes, runtime Render API behavior, durable job
  lifecycle, storage, auth/authz, renderer artifact bytes, actual render
  execution, runtime validation/defaults/compatibility enforcement, or schema
  mutation. See `docs/RENDER_API_ERROR_BLOCKER_VOCABULARY_GATE.md`.
- Render API Contract Close Audit closes the Render API Contract mini lane for
  a mini infrastructure checkpoint only after confirming planning, request
  envelope, response/status, readiness, artifact/job placeholder, and
  error/blocker vocabulary evidence. It selects Mini Infrastructure Close
  Audit next without claiming backend routes, runtime Render API behavior,
  durable job lifecycle, storage, auth/authz, renderer artifact bytes, actual
  render execution, runtime validation/defaults/compatibility/error handling,
  schema mutation, or full measurement production readiness. See
  `docs/RENDER_API_CONTRACT_CLOSE_AUDIT.md`.
- Mini Infrastructure Close Audit closes the combined mini infrastructure
  checkpoint after confirming Measurement Hardening, Template Publish,
  Variable Schema / Data Contract, and Render API Contract close-audit
  evidence. It selects Runtime Binding / Implementation Planning Gate next
  without implementing runtime binding, backend routes, Render API runtime,
  durable jobs, storage durability, auth/authz, renderer execution, artifact
  bytes, runtime validation/defaults/compatibility/error handling, schema
  mutation, or full measurement production readiness. See
  `docs/MINI_INFRASTRUCTURE_CLOSE_AUDIT.md`.
- Runtime Binding / Implementation Planning Gate ranks the first runtime
  binding lanes, selects Render API Request Envelope Runtime Binding Gate as
  the first implementation slice, and gives the next thread a handoff plan
  anchored by the accepted request envelope contract and fixtures. It remains
  planning-only: no runtime binding, backend routes, storage durability,
  auth/authz, durable jobs, renderer execution, artifact bytes, runtime
  validation/defaults/compatibility/error handling, schema mutation, or full
  measurement production readiness is implemented. See
  `docs/RUNTIME_BINDING_IMPLEMENTATION_PLANNING_GATE.md`.
- Core Service Concern Audit and Core Retention Map classify service-shaped
  modules before de-export work, then lock a move-and-retain rule: backend owns
  transport, persistence, route, job, and workflow execution while core retains
  pure package/schema, graph, operations, readiness, storage-envelope,
  manifest/job, authoring, renderer-consumption, and history-ready contracts.
  See `docs/CORE_SERVICE_CONCERN_AUDIT.md` and
  `docs/CORE_RETENTION_MAP.md`.
- Core Service Consumer Map separates the current cross-repo consumers for
  route-shaped API helpers, persistence/workflow builders, old concrete package
  lanes, retained core contracts, and the editor adapter before any public
  service-shaped export is deprecated or removed. It now records backend route
  parity evidence for generation and artifact route contracts while keeping
  core de-export work gated by a compatibility window. See
  `docs/CORE_SERVICE_CONSUMER_MAP.md`.
- Core Route De-export Plan selects one compatibility window for
  `src/generation/apiRoute.ts` and `src/generation/artifactApiRoute.ts` before
  removing route-shaped public exports, and requires retained-contract tests to
  replace HTTP-shaped route helper assertions. See
  `docs/CORE_ROUTE_DEEXPORT_PLAN.md`.
- Core Route Deprecation Window applies Window B source-level `@deprecated`
  markers to the route-shaped generation/artifact helpers while keeping public
  exports stable. See `docs/CORE_ROUTE_DEPRECATION_WINDOW.md`.
- Core Route Retained-Contract Test Rewrite replaces generation/artifact
  route-helper test ownership with direct readiness, manifest, and artifact job
  contract tests before Window C public export removal. See
  `docs/CORE_ROUTE_RETAINED_CONTRACT_TEST_REWRITE.md`.
- Core Route Window C Public Export Removal removes route-shaped
  generation/artifact modules from `src/index.ts` while keeping retained
  readiness, artifact manifest, and artifact job contracts public. See
  `docs/CORE_ROUTE_WINDOW_C_PUBLIC_EXPORT_REMOVAL.md`.
- Core Session Rich Workflow Split Map separates the next three
  split-before-move areas into session package snapshot facts, rich-inline
  replay validation facts, and submission workflow identity/status facts before
  any public de-export. See `docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md`.
- Core Session Package Snapshot Split adds
  `createVNextSessionPackageSnapshot(...)` as the retained package snapshot
  contract; the former compatibility storage record is historical evidence and
  is removed from source in Phase 246. See
  `docs/CORE_SESSION_PACKAGE_SNAPSHOT_SPLIT.md`.
- Core Rich Inline Replay Validation Split adds
  `createVNextRichInlineReplayValidation(...)` and patch-level validation
  records as retained replay validation contracts; the former rich-inline
  persistence helper is historical evidence and is removed from source in Phase
  246. See
  `docs/CORE_RICH_INLINE_REPLAY_VALIDATION_SPLIT.md`.
- Core Submission Identity Status Split adds
  `createVNextSubmissionIdentityStatus(...)` as the retained external
  workflow identity/status contract; the former submission state helper is
  historical evidence and is removed from source in Phase 246. See
  `docs/CORE_SUBMISSION_IDENTITY_STATUS_SPLIT.md`.
- Core Backend Consumer Rewire Closeout records that backend `main@9d0a850`
  now owns session, rich-inline, and submission replacement records/routes
  over retained core facts before the non-route deprecation/de-export/source
  cleanup windows run. See
  `docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md`.
- Core Non-Route Deprecation Window starts Window NR-A by marking the remaining
  service-shaped helper names as deprecated compatibility exports while keeping
  public entrypoint compatibility stable. See
  `docs/CORE_NON_ROUTE_DEPRECATION_WINDOW.md`.
- Core Non-Route Retained-Test Rewrite starts Window NR-B by moving the first
  historical session/rich-inline/submission boundary tests to retained core
  facts while leaving public entrypoint compatibility stable. See
  `docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md`.
- Core Non-Route Public-Entrypoint Test Cleanup finishes the NR-B core-test
  cleanup by moving remaining compatibility/storage/vertical-slice test imports
  of deprecated helper names off `../src/index.js` and onto owner modules. See
  `docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md`.
- Core Non-Route Package-Lane Cleanup moves old internal-alpha concrete package
  lanes off deprecated non-route compatibility helper/type imports from
  `@flowdoc/vnext-core` while preserving their historical JSON evidence shape.
  See `docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md`.
- Core Non-Route Public Export Narrowing completes Window NR-C by narrowing
  `src/index.ts` to retained non-route facts and removing service-shaped
  compatibility helper/type/constants from the package public entrypoint. See
  `docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md`.
- Core Compatibility Source Cleanup Audit records the short-lived owner-module
  compatibility helper allowlist after NR-C, tracks the rewrite path, and now
  records Phase 246 source deletion. See
  `docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md`.
- Core Vertical-Slice Retained Storage Payload Rewrite removes vertical-slice
  storage simulation and RC smoke imports of owner-module compatibility helpers
  by using retained package snapshot and rich-inline replay validation facts.
  See `docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md`.
- Core Storage Adapter Generic Payload Rewrite removes storage adapter test
  imports of owner-module compatibility helpers and keeps package-session plus
  rich-inline-session payloads generic `unknown` values backed by retained
  facts. See `docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md`.
- Core Compatibility Composition Test Rewrite removes the remaining composition
  test imports of owner-module compatibility helpers and leaves only
  source-internal compatibility helper composition immediately before deletion.
  See
  `docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md`.
- Core Compatibility Source Deletion removes owner-module compatibility helper
  implementations, types, and source/mode constants after the allowlist reaches
  zero while keeping retained non-route facts public. See
  `docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md`.
- Text engine WASM bindgen export dependency gate adds package-local
  `wasm-bindgen = "0.2"`, switches the WASM library to minimal readiness and
  boundary-version `#[wasm_bindgen]` exports, keeps native smoke intact, and
  unblocks artifact production retry.
- Read-only editor bridge runtime composes package parsing, graph, measured
  pagination, renderer-consumption audit, export readiness, and supported
  operation kinds through the core runtime session without accepting current
  runtime document input.

## Important Docs

- `AGENTS.md`: working agreement for agents in this repo
- `docs/CURRENT_STATUS.md`: compact current-state pointer after Runtime
  Binding / Implementation Planning Gate
- `docs/NEXT_PHASE_POINTER.md`: immediate next-phase pointer and hard limits
- `docs/MEASUREMENT_HARDENING_CLOSE_AUDIT.md`: close audit for the minimal
  measurement subset and mini infrastructure checkpoint decision
- `docs/TEMPLATE_VARIABLE_RENDER_API_PLANNING_GATE.md`: planning gate that
  ranks Template Publish, Variable Schema, and Render API lanes
- `docs/TEMPLATE_PUBLISH_VERSION_BOUNDARY_GATE.md`: accepted publish/version
  identity boundary before validation evidence, Variable Schema, or Render API
- `docs/TEMPLATE_PUBLISH_VALIDATION_EVIDENCE_GATE.md`: JSON-safe publish
  validation evidence before accepted version metadata
- `docs/TEMPLATE_PUBLISH_ACCEPTED_VERSION_METADATA_GATE.md`: JSON-safe
  accepted version metadata before Template Publish close audit
- `docs/TEMPLATE_PUBLISH_CLOSE_AUDIT.md`: close audit for the Template Publish
  mini lane and next Variable Schema / Data Contract planning recommendation
- `docs/VARIABLE_SCHEMA_DATA_CONTRACT_PLANNING_GATE.md`: planning gate for
  variable/data contract attachment target and first discovery sub-lane
- `docs/VARIABLE_REFERENCE_DISCOVERY_GATE.md`: JSON-safe field-ref occurrence
  inventory and candidate variable list for the accepted template version
- `docs/VARIABLE_SCHEMA_METADATA_SHAPE_GATE.md`: JSON-safe variable metadata
  row shape for discovered candidate variables before data contract policy
- `docs/DATA_CONTRACT_VALIDATION_POLICY_GATE.md`: JSON-safe validation policy
  vocabulary before required/missing/default behavior decisions
- `docs/RENDER_API_CONTRACT_PLANNING_GATE.md`: planning gate for Render API
  contract sub-lanes before the request envelope contract
- `docs/RENDER_API_REQUEST_ENVELOPE_CONTRACT_GATE.md`: JSON-safe Render API
  request envelope contract before response/status contract
- `docs/RENDER_API_RESPONSE_STATUS_CONTRACT_GATE.md`: JSON-safe Render API
  response/status contract before render-readiness validation policy
- `docs/RENDER_READINESS_VALIDATION_POLICY_GATE.md`: JSON-safe
  render-readiness validation policy before artifact pointer / job status
  placeholder policy
- `docs/ARTIFACT_POINTER_JOB_STATUS_PLACEHOLDER_POLICY_GATE.md`: JSON-safe
  artifact pointer / job status placeholder policy before Render API
  error/blocker vocabulary
- `docs/RENDER_API_ERROR_BLOCKER_VOCABULARY_GATE.md`: JSON-safe Render API
  error/blocker vocabulary before Render API Contract close audit
- `docs/RENDER_API_CONTRACT_CLOSE_AUDIT.md`: close audit for the Render API
  Contract mini lane before Mini Infrastructure Close Audit
- `docs/MINI_INFRASTRUCTURE_CLOSE_AUDIT.md`: close audit for the combined
  mini infrastructure checkpoint before Runtime Binding / Implementation
  Planning Gate
- `docs/RUNTIME_BINDING_IMPLEMENTATION_PLANNING_GATE.md`: final planning and
  handoff gate before Render API Request Envelope Runtime Binding Gate
- `docs/CORE_SERVICE_CONCERN_AUDIT.md`: classification audit for core-owned,
  backend-owned, split-contract, and deferred service concern areas
- `docs/CORE_RETENTION_MAP.md`: move-and-retain map before service-shaped
  exports are de-exported from core
- `docs/CORE_SERVICE_CONSUMER_MAP.md`: cross-repo consumer map with backend
  route parity evidence before controlled service-shaped export cleanup
- `docs/CORE_ROUTE_DEEXPORT_PLAN.md`: controlled compatibility-window plan
  before route-shaped generation/artifact API exports leave public core
- `docs/CORE_ROUTE_DEPRECATION_WINDOW.md`: Window B deprecation marker record
  for route-shaped generation/artifact API helpers
- `docs/CORE_ROUTE_RETAINED_CONTRACT_TEST_REWRITE.md`: Phase 230 rewrite that
  removes route-helper test ownership before Window C export removal
- `docs/CORE_ROUTE_WINDOW_C_PUBLIC_EXPORT_REMOVAL.md`: Phase 231 removal of
  route-shaped generation/artifact modules from the public core entrypoint
- `docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md`: Phase 232 split map for
  session package snapshots, rich-inline replay validation, and submission
  workflow identity/status facts
- `docs/CORE_SESSION_PACKAGE_SNAPSHOT_SPLIT.md`: Phase 233 retained session
  package snapshot helper split from the compatibility storage record
- `docs/CORE_RICH_INLINE_REPLAY_VALIDATION_SPLIT.md`: Phase 234 retained
  rich-inline replay validation helper split from compatibility persistence
  records
- `docs/CORE_SUBMISSION_IDENTITY_STATUS_SPLIT.md`: Phase 235 retained
  submission identity/status helper split from compatibility workflow records
- `docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md`: Phase 236 evidence that
  backend `main@9d0a850` consumes retained session, rich-inline, and submission
  facts through backend-owned records/routes before core non-route de-export
- `docs/CORE_NON_ROUTE_DEPRECATION_WINDOW.md`: Phase 237 Window NR-A
  deprecation markers for non-route service-shaped helper names
- `docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md`: Phase 238-241 Window NR-B/NR-C
  retained-test rewrite, public-entrypoint test cleanup, package-lane cleanup,
  and public export narrowing for non-route service-shaped helpers
- `docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md`: Phase 242-246 allowlist,
  vertical-slice, storage-adapter, and composition-test rewrite progress, and
  source deletion closeout for owner-module compatibility helpers after NR-C
- `docs/NODE_V1_INVENTORY_AUDIT.md`: Phase 247 cross-repo inventory of
  canonical node, graph, operation, pagination, backend-passage, and product
  presentation readiness before text-block grammar and image work
- `docs/TEXT_BLOCK_V1_GRAMMAR_LOCK.md`: Phase 248 target Text-block v1 grammar,
  offset, atomic, style, field usage, inline-image, selection, and IME decision
  boundary before schema/runtime implementation
- `docs/TEXT_BLOCK_V1_GRAMMAR_VALIDATOR.md`: Phase 249 pure validator,
  deterministic normalization planner/apply boundary, and product fixture
  acceptance evidence
- `docs/TEXT_BLOCK_V1_PRODUCER_ALIGNMENT.md`: Phase 250 table row/column
  producer alignment with canonical empty `children: []` text-blocks
- `docs/TEXT_BLOCK_V1_VERSION_MIGRATION_DECISION.md`: Phase 251 active
  package v2/document v3 compatibility, target document v4, explicit
  copy-forward migration, and activation gate decision
- `docs/IMAGE_SOURCE_CONTRACT.md`: Phase 252 package v3/document v4 image asset
  manifest, static/field source union, inline/block placement, and lifecycle
  ownership decision
- `docs/PACKAGE_V3_IMAGE_TARGET_SCHEMAS.md`: Phase 253 isolated ImageAssetRegistry
  v1, DataSnapshot v2, and image field-to-asset validation without active parser
  changes
- `docs/DOCUMENT_V4_IMAGE_TARGET_SCHEMAS.md`: Phase 254 isolated shared image
  source/frame/accessibility, target text-block inline-image, block image, and
  source-reference validation schemas
- `docs/DOCUMENT_V4_TARGET_SCHEMA.md`: Phase 255 complete isolated document v4
  authored union, image containment, page-break/page-number restrictions, and
  structural/table invariants
- `docs/PACKAGE_V3_DOCUMENT_V4_PARSER.md`: Phase 256 strict named target parser,
  acceptance fixture, exact field/image/data references, and active-runtime
  isolation
- `docs/PACKAGE_V2_TO_V3_MIGRATION.md`: Phase 257 explicit copy-forward planner,
  deterministic apply boundary, blocked disposition matrix, paired fixtures,
  and source unknown-key loss guard
- `docs/VERSION_CAPABILITY_CONTRACT.md`: Phase 258 core version-pair capability
  facts and cross-repo reporting boundary
- `docs/READ_ONLY_RUNTIME_V4.md`: Phase 260 isolated v4 structural read session,
  capability lock, and downstream consumer boundary
- `docs/DOCUMENT_V4_REORDER_OPERATION.md`: Phase 262 operation-granular
  capability and same-parent v4 reorder vertical slice
- `docs/DOCUMENT_V4_DELETE_OPERATION.md`: Phase 263 block-subtree deletion,
  registry retention, and downstream mutation boundary
- `docs/DOCUMENT_V4_DUPLICATE_OPERATION.md`: Phase 264 block-subtree duplicate,
  deterministic identity rewrite, and shared registry policy
- `docs/DOCUMENT_V4_NODE_READINESS_ARCHITECTURE_LOCK.md`: Phase 265 truth-layer,
  text-block dependency, field/media ownership, and readiness-axis lock
- `docs/DOCUMENT_V4_GENERIC_LIFECYCLE_CLOSE_AUDIT.md`: Phase 266 node/parent,
  zone-role, no-operation, media-surface, and cross-repo lifecycle evidence
- `docs/DOCUMENT_V4_NODE_FAMILY_READINESS_MATRIX.md`: Phase 267 independent
  readiness axes, retained evidence, dependency gates, and next blockers
- `docs/STRUCTURE_INSTANCE_ARCHITECTURE_LOCK.md`: Phase 268 product north star,
  lifecycle vocabulary, materialization direction, ownership, and non-goals
- `docs/STRUCTURE_INSTANCE_V4_IMPACT_AUDIT.md`: Phase 269 cross-repo reuse,
  change-required, deferred, rejected, acceptance, and contract-order matrix
- `docs/STRUCTURE_LIFECYCLE_IDENTITY_CONTRACT.md`: Phase 270 structure lineage,
  draft revision, published version, instance pin, and package-activation lock
- `docs/STRUCTURE_POLICY_EFFECTIVE_CAPABILITY_CONTRACT.md`: Phase 271 policy
  ownership, binding precedence, effective denials, containment, and cardinality
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
- `docs/THAI_LINE_BREAK_EVIDENCE_BOUNDARY.md`: Phase 132 ICU4X line-break
  evidence manifest boundary before multi-line wrapping
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
- `docs/TEXT_ENGINE_LINE_WRAP_EVIDENCE_BOUNDARY.md`: Phase 133 multi-line wrap
  evidence boundary before renderer-backed provider binding
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_BOUNDARY.md`: Phase 134 WASM / ICU4X
  runtime identity and digest boundary before parity-ready claims
- `docs/TEXT_ENGINE_RENDERER_BACKED_PROVIDER_BOUNDARY.md`: Phase 135
  renderer-backed text measurement provider bridge before default binding
- `docs/PDF_RENDERER_SPIKE_PACKAGE_BOUNDARY.md`: Phase 136 external minimal
  PDF artifact spike package before storage or production fidelity
- `docs/ARTIFACT_MANIFEST_BOUNDARY.md`: Phase 137 artifact manifest and
  storage-record boundary before production storage adapters
- `docs/ARTIFACT_API_ROUTE_BOUNDARY.md`: Phase 138 backend artifact route
  contract boundary before concrete server routes or storage lookups
- `docs/ARTIFACT_JOB_BOUNDARY.md`: Phase 139 durable layout and artifact job
  record boundary before workers, queues, concrete rendering, or storage
- `docs/STORAGE_ADAPTER_BOUNDARY.md`: Phase 140 storage adapter interface
  boundary before choosing a concrete database, object store, or browser store
- `docs/PRODUCT_EDITOR_INTEGRATION_SMOKE_BOUNDARY.md`: Phase 141 sandbox
  product editor integration smoke before browser timing or production editor
  claims
- `docs/BROWSER_TIMING_SMOKE_BOUNDARY.md`: Phase 142 dependency-free sandbox
  browser timing smoke before real browser-driver benchmark commitments
- `docs/WYSIWYG_PRIMARY_INPUT_DECISION_GATE.md`: Phase 143 primary input
  decision gate before implementing production WYSIWYG input
- `docs/RICH_INLINE_OPERATION_DECISION_BOUNDARY.md`: Phase 144 rich inline
  operation granularity decision before collaboration/offline replay claims
- `docs/FIRST_VERTICAL_SLICE_RC_PLAN.md`: Phase 145 first vertical slice
  release candidate plan before concrete production binding
- `docs/VERTICAL_SLICE_RC_ORCHESTRATOR_BOUNDARY.md`: Phase 146 input-driven
  first vertical slice RC report boundary before scenario/gate composition
- `docs/VERTICAL_SLICE_RC_SCENARIO_BOUNDARY.md`: Phase 147 RC scenario fixture
  boundary before measurement/artifact/storage summary gates
- `docs/VERTICAL_SLICE_MEASUREMENT_GATE_BOUNDARY.md`: Phase 148 RC measurement
  selection and drift gate before artifact/storage composition
- `docs/VERTICAL_SLICE_ARTIFACT_BRIDGE_BOUNDARY.md`: Phase 149 RC artifact
  summary bridge before storage simulation
- `docs/VERTICAL_SLICE_STORAGE_SIMULATION_BOUNDARY.md`: Phase 150 RC storage
  simulation boundary before the end-to-end RC smoke
- `docs/VERTICAL_SLICE_RC_END_TO_END_SMOKE.md`: Phase 151 bounded end-to-end
  RC report smoke before close audit
- `docs/VERTICAL_SLICE_RC_CLOSE_AUDIT.md`: Phase 152 close audit for the first
  vertical slice RC foundation pass
- `docs/HYBRID_MANAGED_CARD_INPUT_IMPLEMENTATION_PLAN.md`: Phase 153 plan
  boundary for the selected hybrid managed card input model
- `docs/HYBRID_INPUT_RUNTIME_OWNERSHIP_BOUNDARY.md`: Phase 154 browser-local
  input runtime ownership boundary before active island lifecycle or DOM
  binding
- `docs/ACTIVE_TEXT_BLOCK_ISLAND_BOUNDARY.md`: Phase 155 browser-local active
  text-block island lifecycle before command policy, DOM binding, or commit
  bridge execution
- `docs/HYBRID_INPUT_COMMAND_POLICY_BOUNDARY.md`: Phase 156 command policy
  boundary before DOM binding, command execution, or package mutation
- `docs/ACTIVE_TEXT_BLOCK_DOM_BINDING_SMOKE.md`: Phase 157 JSON-safe active
  text-block DOM binding smoke before commit bridge execution
- `docs/ACTIVE_ISLAND_COMMIT_BRIDGE_SMOKE.md`: Phase 158 active island capture
  to rich inline commit bridge smoke before field-chip and paste/delete
  hardening
- `docs/FIELD_CHIP_COMMAND_BOUNDARY.md`: Phase 159 field chip command
  contracts before paste/delete preflight and production clipboard binding
- `docs/PASTE_DELETE_PREFLIGHT_BOUNDARY.md`: Phase 160 browser-local
  paste/delete preflight boundary before renderer segment hit-test evidence
- `docs/RENDERER_SEGMENT_HIT_TEST_EVIDENCE_BOUNDARY.md`: Phase 161 renderer
  segment and hit-test evidence boundary before hybrid input close audit
- `docs/HYBRID_INPUT_FOUNDATION_CLOSE_AUDIT.md`: Phase 162 close audit for the
  hybrid managed card input foundation pass before browser QA
- `docs/HYBRID_INPUT_BROWSER_QA_BOUNDARY.md`: Phase 163 optional sandbox-local
  hybrid input browser QA evidence boundary before browser driver smoke
- `docs/HYBRID_INPUT_OPTIONAL_BROWSER_DRIVER_SMOKE_BOUNDARY.md`: Phase 164
  optional browser driver smoke boundary before browser evidence close audit
- `docs/HYBRID_INPUT_BROWSER_EVIDENCE_CLOSE_AUDIT.md`: Phase 165 close audit
  for the hybrid input browser evidence lane before hardening thresholds
- `docs/HYBRID_INPUT_HARDENING_THRESHOLD_PLAN.md`: Phase 166 hardening
  threshold plan before browser matrix decision
- `docs/HYBRID_INPUT_BROWSER_MATRIX_DECISION.md`: Phase 167 v1 browser/OS/IME
  matrix decision before guarded input integration planning
- `docs/GUARDED_INPUT_INTEGRATION_PLAN.md`: Phase 168 guarded input integration
  plan before the first runtime slice
- `docs/GUARDED_INPUT_RUNTIME_SLICE.md`: Phase 169 sandbox-local guarded input
  runtime slice before paste/delete/field-chip input integration
- `docs/GUARDED_INPUT_PASTE_DELETE_FIELD_CHIP_SLICE.md`: Phase 170
  paste/delete/field-chip slice before the input integration close audit
- `docs/GUARDED_INPUT_INTEGRATION_CLOSE_AUDIT.md`: Phase 171 close audit for
  the guarded input integration lane before concrete storage choice
- `docs/PRE_PHASE_172_RISK_UNKNOWN_REGISTER.md`: pre-Phase 172 risk / unknown
  register before concrete storage choice
- `docs/CONCRETE_STORAGE_CHOICE_GATE.md`: Phase 172 concrete storage choice
  gate before the external file-backed storage adapter slice
- `docs/EXTERNAL_FILE_BACKED_STORAGE_ADAPTER_SLICE.md`: Phase 173 external
  file-backed storage adapter slice before artifact byte storage
- `docs/ARTIFACT_BYTE_STORE_SLICE.md`: Phase 174 artifact byte store slice
  before storage-backed RC roundtrip smoke
- `docs/STORAGE_BACKED_RC_ROUNDTRIP_SMOKE.md`: Phase 175 storage-backed RC
  roundtrip smoke before route-shaped storage binding
- `docs/BACKEND_ROUTE_STORAGE_BINDING_BOUNDARY.md`: Phase 176 route-shaped
  storage binding before artifact job execution
- `docs/ARTIFACT_JOB_EXECUTION_SLICE.md`: Phase 177 artifact job execution
  slice before the PDF renderer decision gate
- `docs/PDF_RENDERER_DECISION_GATE.md`: Phase 178 PDF renderer decision gate
  before measurement rollout
- `docs/MEASUREMENT_ROLLOUT_GATE.md`: Phase 179 measurement rollout gate before
  the internal alpha vertical slice
- `docs/INTERNAL_ALPHA_VERTICAL_SLICE.md`: Phase 180 internal alpha vertical
  slice before close audit and documentation consolidation
- `docs/INTERNAL_ALPHA_CLOSE_AUDIT_AND_DOC_CONSOLIDATION_GATE.md`: Phase 181
  close audit and documentation consolidation gate before v1 hardening triage
- `docs/V1_HARDENING_BACKLOG_TRIAGE_GATE.md`: Phase 182 v1 hardening backlog
  triage gate before measurement digest/parity/drift hardening
- `docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md`: Phase 183
  measurement digest/parity/drift hardening gate before v1 fixture evidence
  matrix work
- `docs/V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE.md`: Phase 184 v1
  measurement fixture evidence matrix gate before summary manifest work
- `docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_GATE.md`: Phase 185 measurement
  evidence summary manifest gate before summary fixture stubs
- `docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_FIXTURE_STUB_GATE.md`: Phase 186
  JSON-safe summary manifest fixture stub gate before evidence gap triage
- `docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md`: Phase 187
  measurement evidence coverage gap triage before digest evidence builder work
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_BUILDER_GATE.md`: Phase
  188 text engine runtime identity digest evidence builder gate before digest
  evidence population
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_POPULATION_GATE.md`:
  Phase 189 retained-pending digest evidence population gate before WASM
  artifact digest pinning
- `docs/TEXT_ENGINE_WASM_ARTIFACT_DIGEST_PINNING_GATE.md`: Phase 190 text
  engine WASM artifact digest pinning gate before package-local artifact build
  output work
- `docs/TEXT_ENGINE_WASM_ARTIFACT_BUILD_OUTPUT_GATE.md`: Phase 191 text
  engine WASM artifact build output gate before package-local toolchain/crate
  readiness work
- `docs/TEXT_ENGINE_WASM_BUILD_TOOLCHAIN_READINESS_GATE.md`: Phase 192 text
  engine WASM build toolchain readiness gate before toolchain acquisition work
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_ACQUISITION_GATE.md`: Phase 193 text
  engine WASM toolchain acquisition gate before optional readiness smoke work
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_OPTIONAL_READINESS_SMOKE.md`: Phase 194
  text engine WASM toolchain optional readiness smoke before artifact
  production work
- `docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_GATE.md`: Phase 195 text engine
  WASM artifact production gate before toolchain provisioning/bootstrap work
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_PROVISIONING_BOOTSTRAP_GATE.md`: text
  engine WASM toolchain provisioning bootstrap gate before provisioning
  execution work
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_PROVISIONING_EXECUTION_GATE.md`: text
  engine WASM toolchain provisioning execution gate before version
  compatibility work
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_VERSION_COMPATIBILITY_GATE.md`: text
  engine WASM toolchain version compatibility gate before Rust upgrade
  execution work
- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_RUST_UPGRADE_EXECUTION_GATE.md`: text
  engine WASM toolchain Rust upgrade execution gate before artifact production
  retry work
- `docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_RETRY_GATE.md`: text engine WASM
  artifact production retry gate after package-local `wasm-bindgen`
  dependency/export work
- `docs/ARTIFACT_DIGEST_PINNING_EXECUTION.md`: Artifact Digest Pinning
  Execution record for the real package-local WASM artifact sha256
- `docs/NATIVE_EVIDENCE_SUMMARY_GATE.md`: native evidence summary metadata
  gate for the first Thai line-break and Latin paragraph subset
- `docs/WASM_EVIDENCE_SUMMARY_GATE.md`: WASM evidence summary metadata gate
  for the same first Thai line-break and Latin paragraph subset
- `docs/NATIVE_WASM_PARITY_SUMMARY_GATE.md`: native/WASM parity summary
  metadata gate for the same first Thai line-break and Latin paragraph subset
- `docs/RENDERER_BACKED_DRIFT_SUMMARY_GATE.md`: renderer-backed drift summary
  metadata gate for the same first Thai line-break and Latin paragraph subset
- `docs/NUMERIC_DRIFT_THRESHOLD_DECISION.md`: numeric drift threshold policy
  decision for the same first Thai line-break and Latin paragraph subset
- `docs/ACCEPTED_SUMMARY_MANIFEST_POPULATION.md`: accepted summary manifest
  population for the same first Thai line-break and Latin paragraph subset
- `docs/TEXT_ENGINE_WASM_BINDGEN_EXPORT_DEPENDENCY_GATE.md`: text engine WASM
  bindgen export dependency gate before retrying artifact production
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
- `docs/TEMPLATE_BUILDER_CONTENTEDITABLE_RANGE_MAPPING_BOUNDARY.md`: Phase 117
  browser-local contenteditable range mapping boundary
- `docs/TEMPLATE_BUILDER_RICH_INLINE_PATCH_EXECUTION_BOUNDARY.md`: Phase 118
  browser-local rich inline patch execution boundary
- `docs/TEMPLATE_BUILDER_TOOLBAR_COMMAND_DISPATCH_BOUNDARY.md`: Phase 119
  browser-local toolbar command dispatch boundary
- `docs/TEMPLATE_BUILDER_FIELD_CHIP_INSERT_EXECUTION_BOUNDARY.md`: Phase 120
  browser-local field chip insert execution boundary
- `docs/TEMPLATE_BUILDER_WYSIWYG_EXECUTION_REBASELINE_AUDIT.md`: Phase 121
  WYSIWYG execution re-baseline audit and Phase 122-126 card plan
- `docs/TEMPLATE_BUILDER_RICH_INLINE_STATE_BOUNDARY.md`: Phase 122
  browser-local rich inline state boundary before canonical commit planning
- `docs/TEMPLATE_BUILDER_CONTENTEDITABLE_SEGMENT_CAPTURE_BOUNDARY.md`: Phase
  123 browser-local contenteditable segment capture boundary before production
  DOM binding
- `docs/TEMPLATE_BUILDER_RICH_INLINE_COMMIT_PLANNING_BOUNDARY.md`: Phase 124
  canonical rich inline commit planning boundary before bridge execution
- `docs/TEMPLATE_BUILDER_RICH_INLINE_COMMIT_BRIDGE_BOUNDARY.md`: Phase 125
  rich inline commit bridge boundary for accepted Phase 124 plans
- `docs/TEMPLATE_BUILDER_WYSIWYG_EXECUTION_CLOSE_AUDIT.md`: Phase 126
  WYSIWYG execution close audit and post-125 risk list
- `docs/TEMPLATE_BUILDER_RICH_INLINE_UNDO_REDO_REPLAY_BOUNDARY.md`: Phase 127
  rich inline undo/redo replay boundary for sandbox bridge history patches
- `docs/TEMPLATE_BUILDER_CONTENTEDITABLE_SURFACE_HARDENING_BOUNDARY.md`: Phase
  128 production contenteditable surface hardening boundary
- `docs/TEMPLATE_BUILDER_RICH_INLINE_SESSION_PERSISTENCE_BOUNDARY.md`: Phase
  129 rich inline persistence/session record boundary
- `docs/TEMPLATE_BUILDER_RICH_INLINE_LIVE_EXACT_PARITY_AUDIT.md`: Phase 130
  rich inline live/exact parity audit
- `docs/FIVE_LANE_PROJECT_PROGRESS_INDEX.md`: Phase 131 five-lane project
  progress index and roadmap audit
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
- concrete backend server routes, production storage readiness, durable
  server-bound session/history stores, artifact byte lifecycle cleanup, and
  rendered artifact retrieval on top of the generation runtime route and
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
  beyond the Phase 132 line-break evidence manifest boundary
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
- concrete native/WASM parity execution, ICU4X execution, default
  renderer-backed provider binding, or production measurement replacement
  beyond the Phase 135 renderer-backed provider bridge boundary
- raw native/WASM/renderer evidence values in root docs/tests, full-matrix
  accepted summary manifest, WASM artifact loading, or production measurement
  replacement beyond the template/variable/render planning gate
- concrete production publish route or storage behavior, variable schema/data
  contract implementation, runtime data validation, runtime default
  application, runtime compatibility enforcement, durable job lifecycle,
  artifact byte production, runtime error handling, or render API runtime
  implementation beyond the Runtime Binding / Implementation Planning Gate
- concrete primary contenteditable editing input, rich inline storage adapter
  writes/routes, collaboration, renderer artifact output, or final WYSIWYG
  production editing close beyond the Phase 166 hardening threshold plan
  boundary
- concrete internal text/table placement execution behind pausable layout job
  records
- concrete non-text table-cell content splitting beyond the Phase 97 readiness
  boundary
- multi-page column balancing
- concrete TOC text rewrite/reflow beyond the Phase 98 final page-reference
  resolution boundary
- concrete PDF/DOCX renderer implementation beyond measured-command adapter
  contracts, except for the external Phase 136 text-only PDF bytes spike
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
