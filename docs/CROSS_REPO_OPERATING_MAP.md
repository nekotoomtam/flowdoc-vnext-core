# Cross-Repo Operating Map

Date: 2026-07-12

Status: active coordination map for `flowdoc-vnext-core`,
`flowdoc-vnext-editor`, and `flowdoc-vnext-backend`.

## Purpose

This map defines how work should move across the split FlowDoc vNext
repositories without blurring ownership. It is intentionally small: use it to
choose the right repo, preserve package boundaries, and keep integration work
on a reviewable path.

The default product runtime direction is:

```text
editor intent
  -> editor runtime / command boundary
  -> backend transport envelope
  -> backend revision gate
  -> @flowdoc/vnext-core operation or retained contract
  -> backend response envelope
  -> editor stale-gated runtime apply
```

## Repository Ownership

| Repository | Owns | Must Not Own | Evidence |
|---|---|---|---|
| `flowdoc-vnext-core` | canonical package/document schema, graph facts, operation semantics, pagination/export contracts, renderer-consumption contracts, history-ready records, retained facts | HTTP routes, React/runtime state, DOM state, concrete storage execution, product workflow execution | `AGENTS.md`; `README.md`; `docs/WORKSPACE_BOUNDARY.md`; `src/index.ts`; `tests/extractionBoundary.test.ts` |
| `flowdoc-vnext-editor` | product editor UI, browser runtime state, command policy, viewport/selection truth, adapter-safe core read models, stale-gated runtime apply | direct core internals, backend persistence, HTTP route ownership, WYSIWYG/input runtime before the gate | `flowdoc-vnext-editor/AGENTS.md`; `flowdoc-vnext-editor/src/core/coreAdapter.ts`; `flowdoc-vnext-editor/src/tests/boundary.test.ts`; `flowdoc-vnext-editor/docs/PHASE_1_RISK_REGISTER.md` |
| `flowdoc-vnext-backend` | API transport, request/response envelopes, base-revision checks, package persistence records, concrete storage adapters, backend-owned route parity, orchestration before/after core calls | editor runtime, React state, UI command policy, duplicated core operation semantics | `flowdoc-vnext-backend/AGENTS.md`; `flowdoc-vnext-backend/README.md`; `flowdoc-vnext-backend/src/service/mutationService.ts`; `flowdoc-vnext-backend/src/tests/mutationService.test.ts` |

## Current Evidence Snapshot

- Core remains the source of truth for canonical semantics and package
  contracts: `AGENTS.md`, `README.md`, and `docs/WORKSPACE_BOUNDARY.md`.
- Core public exports have been narrowed away from service-shaped compatibility
  helpers while retained facts remain public: `src/index.ts` and
  `docs/CORE_SERVICE_CONSUMER_MAP.md`.
- Editor package access to `@flowdoc/vnext-core` is isolated behind
  `flowdoc-vnext-editor/src/core/coreAdapter.ts`; boundary tests guard direct
  core imports and lab render-loop imports:
  `flowdoc-vnext-editor/src/tests/boundary.test.ts`.
- Editor risk R7 records that backend/API transport and mutation packets are
  still deferred:
  `flowdoc-vnext-editor/docs/PHASE_1_RISK_REGISTER.md`.
- Backend mutation execution checks `baseRevision` before calling
  `runVNextOperation(...)`:
  `flowdoc-vnext-backend/src/service/mutationService.ts`.
- Backend README still lists generation/artifact route wiring into the
  concrete HTTP server as not yet included:
  `flowdoc-vnext-backend/README.md`.
- Core Phase 258 publishes active and migration-target version-pair facts
  without activating v4 runtime behavior: `src/schema/versionCapability.ts`.
- Backend reports concrete read/mutation support and unwired migration
  persistence through `GET /capabilities/versions`:
  `flowdoc-vnext-backend@a7ca3b7`.
- Editor preflights that response, blocks unsupported package pairs before
  runtime loading, and gates mutation until capability is compatible:
  `flowdoc-vnext-editor@a4c501e`.
- Backend Phase 259 persists core-produced migrations behind base-revision and
  idempotency gates, retains the v3 source snapshot, and rejects active
  mutations after migration: `flowdoc-vnext-backend@f80cd27`.
- Editor capability evidence now recognizes persistence/retention availability
  while migration intent remains deferred: `flowdoc-vnext-editor@ccb63fa`.
- Core Phase 260 provides an isolated v4 read-only session without widening the
  active v3 graph or operation runtime: `flowdoc-vnext-core@db91014`.
- Backend advertises package 3/document 4 reads while keeping mutation on the
  active pair: `flowdoc-vnext-backend@b299e94`.
- Editor consumes v4 through `coreAdapter.ts`, projects structural image
  placeholders, and closes mutation/live/exact layout capabilities:
  `flowdoc-vnext-editor@5c422de`.
- Editor Phase 261 submits explicit revisioned migration intent, handles
  applied/stale/rejected/replayed results, and verifies the target read before
  entering v4 read-only mode: `flowdoc-vnext-editor@2c0c97d`.
- Backend migration persistence remains unchanged; its documentation records
  the completed consumer recovery path: `flowdoc-vnext-backend@5ea90bc`.
- Core Phase 262 adds operation-granular capability and isolated v4 same-parent
  reorder semantics: `flowdoc-vnext-core@68192fb`.
- Backend persists only v4 `node.reorder` and reports operation kinds per pair:
  `flowdoc-vnext-backend@c77474a`.
- Editor enters partial mode and enables reorder only when both core node facts
  and backend operation reporting agree: `flowdoc-vnext-editor@ed22cbc`.
- Core Phase 263 adds block-subtree delete while retaining shared package
  registries: `flowdoc-vnext-core@faf198f`.
- Backend persists v4 delete and continues rejecting duplicate:
  `flowdoc-vnext-backend@be2047a`.
- Editor partial mode enables delete/reorder only: `flowdoc-vnext-editor@9bad0e9`.
- Core Phase 264 adds deterministic block-subtree duplicate, rewrites authored
  node/inline identities, and retains shared registries:
  `flowdoc-vnext-core@59a852c`.
- Backend persists revision-gated v4 duplicate: `flowdoc-vnext-backend@87f68db`.
- Editor partial mode enables duplicate only when core and backend capability
  facts agree: `flowdoc-vnext-editor@2b598d3`.
- Core Phase 266 proves all valid generic lifecycle parent/node combinations,
  rejects same-index reorder, and reports image as media:
  `flowdoc-vnext-core@19ae304`.
- Backend proves rejected no-op reorder retains revision:
  `flowdoc-vnext-backend@71a5fe4`.
- Editor consumes the explicit media operation surface for v4 image placement:
  `flowdoc-vnext-editor@ce2d39a`.
- Core Phase 267 publishes independent readiness axes for all authored v4 node
  types and names text-block as the critical columns/table dependency:
  `flowdoc-vnext-core@928ec51`.
- Core Phase 268 locks Structure Definition authoring as the product north star,
  Published Structure Version and Materialized Document Instance as distinct
  lifecycle artifacts, and Resolved Document/Artifact as derived output. This
  decision does not activate publish, materialization, instance APIs, or policy
  execution: `docs/STRUCTURE_INSTANCE_ARCHITECTURE_LOCK.md`.
- Core Phase 269 classifies current core, backend, and editor contracts as
  reusable, change-required, deferred, or rejected against that lifecycle. It
  does not change schema, persistence, API, editor, policy, or runtime behavior:
  `docs/STRUCTURE_INSTANCE_V4_IMPACT_AUDIT.md`.
- Core Phase 270 publishes strict standalone identity contracts for Structure
  Definition drafts, Published Structure Versions, and Materialized Document
  Instances while leaving package kinds and workflows inactive:
  `src/lifecycle/structureIdentity.ts`.
- Core Phase 271 publishes standalone Structure Policy, deterministic binding,
  and core/structure/session effective-capability contracts without activating
  instance operations: `src/lifecycle/structurePolicy.ts`.
- Core Phase 272 publishes a pure revision-zero Document Instance
  materialization plan with exact published-version/policy pins, retained graph
  identity provenance, and explicit registry ownership. Backend persistence,
  Data Snapshot resolution, generated expansion, and product workflow remain
  inactive: `src/lifecycle/documentInstanceMaterialization.ts`.
- Core Phase 273 publishes strict resolution input pins for published
  field/style/static-media contracts and atomic instance Data Snapshot/media
  inputs. It does not resolve values, fetch registries, or activate package
  fallback: `src/resolution/resolutionInputPins.ts`.
- Core Phase 274 publishes a deterministic all-or-blocked Resolved Document
  projection with scalar, image-owner, and text-style binding tables beside an
  immutable instance graph. Generated expansion, pagination, rendering, and
  product workflow remain inactive: `src/resolution/resolvedDocument.ts`.
- Core Phase 275 publishes the v4-native text-block grammar, canonical empty
  block/caret, five-inline offset projection, and inline-local UTF-16 selection
  anchors without activating text mutation or editor input:
  `src/authoring/textBlockV4Contract.ts`.
- Core Phase 276 publishes an artifact-pinned, policy-aware v4 rich-inline
  replacement transaction with field/media/style capability preflight and
  identity/history facts. Backend persistence and editor input remain inactive:
  `src/authoring/textBlockV4RichInlineReplace.ts`.
- Core Phase 277 publishes explicit field-ref/line-break/page-number/
  inline-image insertion and atomic removal planning that feeds Phase 276
  without bypassing policy or allocating implicit ids:
  `src/authoring/textBlockV4InlineCommands.ts`.
- Core Phase 278 publishes resolved v4 text measurement packets and complete
  measured line acceptance with authored/resolved source points. Line-breaker,
  pagination, renderer, and backend job execution remain inactive:
  `src/pagination/textBlockV4Measurement.ts`.
- Core Phase 279 paginates accepted v4 text lines into deterministic
  source-retaining fragments and proves a 6,000-line/250-page text-block case
  without mixed-document layout or rendering:
  `src/pagination/textBlockV4Pagination.ts`.
- Core Phase 280 closes the text-block v4 core-contract slice and explicitly
  separates columns/table and transport work now unblocked from editor input,
  concrete measurement, mixed layout, generated content, and rendering that
  remain closed: `docs/TEXT_BLOCK_V4_READINESS_CLOSE_AUDIT.md`.
- Backend Phase 281 integration supplies backend-owned draft identity, field
  contract, Structure Policy, revision-atomic mutation receipts, and v4
  rich-inline execution: `flowdoc-vnext-backend@0f17be1`.
- Editor Phase 281 integration validates inline children through the core
  adapter, separates backend/core capability versions, builds rich-inline
  intent, and stale-applies results without enabling WYSIWYG:
  `flowdoc-vnext-editor@24cf0d5`.
- Phase 281 closes the cross-repo v4 rich-inline transport slice while keeping
  DOM/IME input, production storage/auth, columns/table split semantics, mixed
  pagination, renderer, and export closed:
  `docs/STRUCTURE_AUTHORING_V4_TRANSPORT_CLOSE_AUDIT.md`.
- Phase 282 locks Columns v4 as depth-three independent parallel flows with
  longest-column completion, measurement-free plan/reconcile semantics, and
  bounded performance acceptance while preserving direct-body-only page
  breaks: `docs/COLUMNS_V4_ARCHITECTURE_LOCK.md`.
- Phase 289 closes the text-backed Columns v4 core slice with canonical input
  assembly, atomic parallel/nested continuation, stable impact/signature facts,
  and 6,000-fragment/250-page/depth-three evidence. Mixed child families,
  renderer/export, authoring operations, backend, and editor remain open:
  `docs/COLUMNS_V4_READINESS_CLOSE_AUDIT.md`.
- Phase 290 separates bounded opaque allocated identity from structured
  provenance and allocation-input facts. Core owns vocabulary and validation;
  backend and named orchestration boundaries retain allocation/collision
  ownership. Existing authored and lifecycle ids remain unchanged:
  `docs/IDENTITY_STANDARD_V1_ARCHITECTURE_LOCK.md`.
- Phase 293 closes Identity Standard v1 after strict profile, provenance,
  canonical-input, and batch-conflict evidence. It unblocks Table Definition
  and Resolved Row contracts without activating backend allocation or table
  execution: `docs/IDENTITY_STANDARD_V1_READINESS_CLOSE_AUDIT.md`.
- Phase 294 locks Table v4 semantic truth as ordered static/collection row
  sources, stable columns, span-aware occupancy, explicit row policies, and
  pre-pagination resolved rows. Existing v4 parsers and document v3 pagination
  remain unchanged: `docs/TABLE_V4_SEMANTIC_ARCHITECTURE_LOCK.md`.
- Phase 298 closes the Table v4 semantic row-stream slice with strict
  definition, collection snapshot, empty-policy, published-field, ordered-row,
  and `rowi`/`celli` provenance evidence. Descendant content materialization,
  pagination, backend, and editor remain open:
  `docs/TABLE_V4_SEMANTIC_READINESS_CLOSE_AUDIT.md`.
- Phase 299 locks resolved Table content materialization: public callers submit
  values without internal item identity, backend normalization remains external,
  and core validates Published item/binding contracts plus supplied derived
  node/inline identities before immutable cloning:
  `docs/TABLE_V4_CONTENT_MATERIALIZATION_ARCHITECTURE_LOCK.md`.
- Phase 306 closes resolved Table content materialization with strict Published
  item/placement contracts, source planning, supplied row/cell/node/inline
  provenance, immutable supported-node cloning, separate value bindings, and
  1,000-row deterministic evidence. Public input normalization, prepared cell
  fragments, synchronized pagination, backend, and editor remain open:
  `docs/TABLE_V4_CONTENT_MATERIALIZATION_READINESS_CLOSE_AUDIT.md`.
- Phase 307 locks prepared Table cell fragments around exact `colSpan` geometry,
  paired measurement request/result evidence, text-line and atomic child-family
  policies, prefix heights, fingerprints, and bounded invalidation. Synchronized
  row pagination, renderer, backend, and editor remain inactive:
  `docs/TABLE_V4_PREPARED_CELL_FRAGMENT_ARCHITECTURE_LOCK.md`.
- Phase 315 closes prepared Table cell fragments with exact point geometry,
  shared collection/authored Text-block measurement packets, paired evidence,
  text/atomic candidates, complete ordered rows, invalidation facts, and
  1,000-row deterministic evidence. Synchronized row pagination, repeated
  headers, renderer, backend, and editor remain open:
  `docs/TABLE_V4_PREPARED_CELL_FRAGMENT_READINESS_CLOSE_AUDIT.md`.
- Phase 316 locks synchronized Table row pagination with monotonic cell/row
  cursors, boundary inset accounting, atomic maximum-height reconciliation,
  allow/prefer-keep/strict-keep execution, repeated leading headers, progress
  guards, and bounded scale criteria. Renderer, backend, and editor remain
  inactive: `docs/TABLE_V4_SYNCHRONIZED_ROW_PAGINATION_ARCHITECTURE_LOCK.md`.
- Phase 322 closes synchronized Table row pagination with strict cell/row/Table
  cursors, first/final inset accounting, atomic maximum-height fragments, all
  row break policies, bounded multi-row pages, repeated authored headers,
  progress guards, and deterministic 250-page evidence. Renderer consumption,
  export, backend, and editor remain open:
  `docs/TABLE_V4_SYNCHRONIZED_ROW_PAGINATION_READINESS_CLOSE_AUDIT.md`.
- Phase 323 locks Table v4 renderer consumption as a renderer-neutral,
  no-relayout projection with complete text/image/alignment facts, explicit
  page placement/style profiles, command hierarchy, single-owner split and
  repeated-header borders, adapter/readiness boundaries, and 250-page criteria:
  `docs/TABLE_V4_RENDERER_CONSUMPTION_ARCHITECTURE_LOCK.md`.
- Phase 324 keeps renderer-complete Table facts inside core output: measured
  text/width and image alignment survive prepared candidates; vertical
  alignment, content width, and insets survive synchronized row fragments.
  Editor/backend consumers must not recover these facts from DOM or authored
  nodes.
- Phase 325 projects accepted Table pagination into strict renderer-neutral
  commands. Core owns page/segment/row/cell/candidate relationships, row roles,
  vertical alignment, missing-media readiness, bounds audits, and one-owner
  borders; concrete SVG/PDF/DOCX consumers remain adapters and may not relayout.
- Phase 326 supplies bounded SVG geometry evidence and PDF/DOCX capability
  plans without artifact bytes, media fetching, or relayout. Adapter fallbacks
  are explicit, and 250-page projection proves deterministic linear work before
  backend jobs or editor preview consume the commands.
- Phase 327 closes Table v4 renderer consumption readiness across complete
  facts, strict relationship/bounds gates, one-owner borders, adapters, and
  250-page scale. Production artifact execution, backend jobs, and editor
  canvas remain separate: `docs/TABLE_V4_RENDERER_CONSUMPTION_READINESS_CLOSE_AUDIT.md`.
- Phase 328 locks the Table v4 authoring lane around atomic exact-draft
  document/Table-Definition edits, dedicated policy actions, span-one row/grid
  commands, selection/history/invalidation facts, and explicit unsupported
  capabilities: `docs/TABLE_V4_AUTHORING_LANE_ARCHITECTURE_LOCK.md`.
- Phase 329 accepts Table authoring only after exact draft ownership,
  canonical graph, span-one definition mapping, header sync, and policy/session
  capabilities are audited. Editor consumers may use capability facts but must
  not bypass blocked collection, merge/split, rowSpan, or cross-owner actions.
- Phase 330 commits static authored row insert/delete and row-source reorder as
  one core document/definition transaction. Editor supplies durable identities
  and consumes selection/history/invalidation facts; backend still owns
  revision checks and persistence.
- Phase 331 commits span-one column insert/delete/resize and cell vertical
  alignment through the same atomic core bundle. Editor confirmation remains
  required for destructive column deletion; core returns removed subtree and
  fallback-selection facts but does not mutate UI or persist revisions.
- Phase 332 retains committed/rejected Table authoring records with exact draft
  and before/after bundle fingerprints. Replay is pure core evidence only;
  backend owns durable history/persistence and editor owns undo presentation.
- Phase 333 closes the bounded Table v4 authoring lane for core-owned exact
  draft semantics, commands, impact, history, and scale. Backend revision and
  persistence plus editor confirmation/selection/UI remain explicitly external:
  `docs/TABLE_V4_AUTHORING_LANE_READINESS_CLOSE_AUDIT.md`.
- Phase 334 locks Table v4 authoring risk hardening as a guarded core boundary
  over the pure kernel: editor/backend consumers receive exact preview,
  confirmation, reversible change-set, and budget facts without moving UI,
  authentication, or persistence into core:
  `docs/TABLE_V4_AUTHORING_RISK_HARDENING_ARCHITECTURE_LOCK.md`.
- Phase 335 implements the core-owned dry-run/commit boundary. Destructive row
  and column deletion require the exact current confirmation packet; selective
  change sets retain changed slices and exact key positions so undo/redo can
  reconstruct fingerprint-identical bundles or block on intervening drift.
- Phase 336 enforces caller-supplied work/impact budgets before guarded handoff,
  retains the reversible change-set fingerprint in guarded history, and proves
  deterministic 1,000-row preview/commit/undo/redo. Backend still chooses
  tenant/product limits; editor still owns confirmation and undo presentation.
- Phase 337 closes Table v4 authoring risk hardening for core-owned exact
  preview continuity, selective undo/redo, budgets, history linkage, and scale.
  Editor/backend integration remains explicitly separate:
  `docs/TABLE_V4_AUTHORING_RISK_HARDENING_CLOSE_AUDIT.md`.
- Phase 338 locks the TOC v4 semantic lane as a core-owned derived read model
  over structure-valid body-flow headings. Editor owns TOC configuration UX;
  backend owns persistence; pagination and renderers consume later contracts:
  `docs/TOC_V4_SEMANTIC_LANE_ARCHITECTURE_LOCK.md`.
- Phase 339 exposes pure v4 TOC semantic plans from exact authored structure.
  Consumers receive generated entry identity, preview label, field dependency,
  pending page-reference, invalidation, and work facts without core running
  field materialization, pagination, rendering, persistence, or editor state.
- Phase 340 compares v4 TOC semantic plans and reports exact affected TOCs,
  headings, entry changes, and required measurement/pagination/render lanes.
  It remains a pure recommendation boundary; consumers execute no side effect
  through this contract.
- Phase 341 closes TOC v4 semantic readiness for the bounded document-wide
  body-flow profile. Measurement, pagination/page resolution, rendering,
  authoring UX, and persistence remain separate lanes:
  `docs/TOC_V4_SEMANTIC_LANE_READINESS_CLOSE_AUDIT.md`.
- Phase 342 locks TOC v4 measurement as core-owned generated title/row geometry
  over accepted semantic entries and the generic text measurer. Pagination and
  renderer consumers receive later measured contracts; editor/backend do not
  own or duplicate row geometry:
  `docs/TOC_V4_MEASUREMENT_LANE_ARCHITECTURE_LOCK.md`.
- Phase 343 exposes measured TOC title/row geometry, number-capacity proof,
  leader areas, fit/overflow, budgets, and cache work as pure core facts.
  Pagination and renderers may consume these facts later but do not own them.
- Phase 344 lets consumers recompute TOC fit for a new available height without
  remeasuring text, while separate geometry/fit fingerprints and impact facts
  prevent unnecessary layout work or missed pagination invalidation.
- Phase 345 proves the measured TOC contract at 1,000 generated entries with
  deterministic geometry, exact work, bounded refit, and explicit entry/line
  budget failures. No consumer repo executes measurement or pagination yet.
- Phase 346 closes TOC v4 measurement readiness for core-owned generated row
  geometry and fit facts. V4 pagination, final page resolution, renderer
  consumption, authoring UI, and persistence remain separate lanes:
  `docs/TOC_V4_MEASUREMENT_LANE_READINESS_CLOSE_AUDIT.md`.
- Phase 347 locks TOC v4 pagination as core-owned grouping of retained measured
  title/rows into cursor-pinned page fragments. Consumers orchestrate/resume
  pages later without remeasuring or duplicating placement policy:
  `docs/TOC_V4_PAGINATION_LANE_ARCHITECTURE_LOCK.md`.
- Phase 348 exposes pure bounded TOC page windows and resumable cursors without
  measurement or final page resolution. Consumer orchestration may retain the
  cursor but must not rewrite placement, keep, gap, or overflow semantics.
- Phase 349 proves bounded TOC cursor orchestration at 1,000 rows. Backend or
  editor consumers may schedule page windows later, but final page references,
  renderer output, and durable cursor storage remain outside this phase.
- Phase 350 blocks malformed or impossible retained TOC cursor state atomically;
  consumer persistence must preserve the exact contract and measurement pins.
- Phase 351 closes TOC v4 pagination readiness for core-owned measured-row page
  fragments and resumable cursors. Final page references, renderers, authoring,
  and persistence remain separate:
  `docs/TOC_V4_PAGINATION_LANE_READINESS_CLOSE_AUDIT.md`.
- Phase 352 locks final TOC v4 page-reference resolution but records that no
  completed whole-document v4 heading-page producer exists yet. Core owns the
  strict manifest/map/resolver contract; consumer repos must not synthesize
  heading destinations: `docs/FINAL_TOC_V4_PAGE_REFERENCE_RESOLUTION_ARCHITECTURE_LOCK.md`.
- Phase 353 exposes strict core inputs for final resolution: a complete TOC
  pagination-window manifest and validated heading-page map. Backend/editor
  consumers must not bypass cursor-chain or page-map validation.
- Phase 354 resolves complete TOC destinations through core-owned fingerprint
  pins and reference-based projection. Consumers must not duplicate joins or
  treat missing destinations as resolved; partial/readiness remain later phases.
- Phase 355 keeps missing heading destinations as explicit partial entries while
  ownership/section/identity drift remains atomic block. Consumers must not
  omit unresolved entries or infer completeness from extra document map rows.
- Phase 356 exposes capacity and readiness as retained core facts. Editor and
  backend consumers may display or transport preview/artifact blockers, but
  must not widen measured page-number geometry, silently rerun layout, treat
  capacity overflow as unresolved identity, or synthesize renderer commands.
- Phase 357 hardens the final resolver against malformed retained identity,
  capacity, placement, and destination facts and proves 1,000-entry linear
  work. Consumer repos must preserve these exact inputs and diagnostics rather
  than pre-joining, repairing, or dropping malformed rows themselves.
- Phase 358 closes the core-owned final TOC v4 resolution contract after all
  three repository gates pass. Backend/editor consumption remains deferred;
  neither consumer may claim production output until whole-document v4
  composition, field materialization, and renderer lanes exist:
  `docs/FINAL_TOC_V4_PAGE_REFERENCE_RESOLUTION_READINESS_CLOSE_AUDIT.md`.
- Phase 359 opens the v4 integrated document stress gate as test evidence, not
  product orchestration. Core owns executable semantic/layout contracts;
  backend/editor retain their existing boundaries. Missing mixed composition,
  materialization, renderer, storage, and UI lanes remain expected blockers and
  must not be mocked into cross-repo readiness:
  `docs/V4_INTEGRATED_DOCUMENT_STRESS_GATE_ARCHITECTURE_LOCK.md`.
- Phase 360 executes the shared integrated smoke bundle entirely inside core
  tests. Editor/backend behavior remains untouched; consumers must not treat
  local lane pages, synthetic heading maps, or renderer-neutral Table facts as
  whole-document production output:
  `docs/V4_INTEGRATED_DOCUMENT_STRESS_SMOKE.md`.
- Phase 361 proves bounded medium/large integrated workload evidence and
  compacts final TOC resolution ownership/result fingerprints after scale
  exposed quadratic serialization. Consumers receive SHA-256 top-level pins
  and must not depend on repeated raw upstream fingerprint strings per entry:
  `docs/V4_INTEGRATED_DOCUMENT_STRESS_SCALE_MATRIX.md`.
- Phase 362 proves localized invalidation through core-owned TOC/Table impact
  contracts and observed Text-block/Columns lane fingerprints. This is core
  evidence only; backend cache/persistence orchestration and editor undo/
  selection presentation remain deferred:
  `docs/V4_INTEGRATED_DOCUMENT_STRESS_INVALIDATION_MATRIX.md`.
- Phase 363 proves core failure isolation, TOC exact cursor resume, and honest
  all-or-blocked recovery for current Columns/Table contracts. Backend/editor
  must preserve these diagnostics and accepted-state boundaries rather than
  synthesize repaired cursors, partial commands, relayout, or hidden retry:
  `docs/V4_INTEGRATED_DOCUMENT_STRESS_FAILURE_RECOVERY_MATRIX.md`.
- Phase 364 passes all three repository gates after the integrated stress
  phases. Existing editor adapter and backend package boundaries remain intact;
  neither consumer integrates final TOC/stress orchestration yet, and the six
  product blockers remain explicit:
  `docs/V4_INTEGRATED_DOCUMENT_STRESS_CROSS_REPO_GATE.md`.
- Phase 365 closes bounded integrated stress readiness without activating
  consumer orchestration. Whole-document v4 composition is the next core
  architecture lane; backend will later own scheduling/retention and editor
  will later own progress/blocker presentation after the retained contract is
  stable:
  `docs/V4_INTEGRATED_DOCUMENT_STRESS_READINESS_CLOSE_AUDIT.md`.
- Phase 366 locks whole-document v4 composition without activating editor or
  backend integration. Core owns pure fragment-window validation, composition,
  page-plan/heading-map identity, and diagnostics; backend retains scheduling,
  durable cursors, retries, and storage, while editor retains progress,
  viewport, selection, and preview policy:
  `docs/WHOLE_DOCUMENT_V4_COMPOSITION_ARCHITECTURE_LOCK.md`.

## Default Change Routing

Use this table before starting broad work.

| Change Type | Start In | Then Touch | Notes |
|---|---|---|---|
| New canonical node/schema shape | core | backend/editor after core tests pass | Keep package v2/document v3 canonical input only. |
| New document operation semantics | core | backend mapper/service, then editor command policy | Backend must not copy operation logic; it maps transport to core commands. |
| New backend mutation endpoint or envelope | backend | editor transport client, maybe core if a retained contract is missing | Every mutation needs a base-revision check before core execution. |
| Editor command or toolbar behavior | editor | backend/core only if the command needs missing service or semantic support | React components dispatch intent; runtime modules own behavior. |
| Concrete storage or artifact bytes | backend | core only for retained contracts/readiness facts | Core may define contracts, not concrete storage lifecycle. |
| Pagination/export semantic contract | core | backend route/orchestration, editor status/read model | Renderers consume measured output; they should not relayout authored input. |
| WYSIWYG/input runtime | editor only after written gate | core/backend only through explicit commit contracts | Do not start contenteditable/IME/rich-input work from incidental UI pressure. |

## Integration Lane Order

The generic v4 node lifecycle, text-block core contract, and cross-repo rich
replacement transport are complete as bounded slices.

1. Define table cell/row split policy over the accepted cursor/checkpoint and
   atomic reconciliation direction.
2. Keep Columns property/history operations and backend/editor controls in a
   separate authoring-integration lane.
3. Keep editor draft/IME, concrete measurement, mixed layout, renderer/export,
   and instance-composer implementation closed until their own gates pass.
4. Keep core imports behind `src/core/coreAdapter.ts`, revision gates in the
   backend, and stale-gated apply in the editor.

This lane intentionally does not add WYSIWYG, real collaboration, production
storage, artifact rendering, auth, or a new state-management framework.

## Delegated Major Topic Workflow

When the user delegates a broad topic, treat it as one active major workstream
instead of a single patch request.

### Intake

At the start of a major topic:

1. Restate the requested outcome and the repositories likely involved.
2. Read this map, the touched repo `AGENTS.md` files, and the subsystem tests or
   docs required by each touched repo.
3. Split the topic into small phases with clear completion checks.
4. Identify likely blockers, boundary risks, and decisions that would require
   user input before implementation proceeds.

### Execution

During execution:

1. Work phase by phase until the active major topic is complete or genuinely
   blocked.
2. Prefer small, reversible commits/patches even when the topic is large.
3. Keep phase boundaries aligned to real ownership: core semantics, backend
   transport/persistence, editor runtime/UI, tests, and documentation.
4. Keep applying the repo boundary rules in this document; a broad topic is not
   permission to merge responsibilities.
5. Run focused checks after risky phases and full repo gates before broad
   handoff.

### Reporting

The final report should come after the active major topic is complete or
blocked, and should include the standard review output from this document.
Interim updates should stay brief and should report phase progress, blockers,
or material direction changes rather than narrating every file read.

### Stop Conditions

Stop and ask the user before continuing when:

1. The requested outcome conflicts with a repo boundary or legacy migration
   gate.
2. The next phase would require choosing product behavior that is not implied by
   existing docs/tests.
3. A touched repo has unrelated dirty changes that affect the same files or
   make safe patching ambiguous.
4. Full completion would require credentials, external services, or deployment
   actions not available in the local workspace.
5. The work reaches a real architectural fork with similar-cost options and no
   existing evidence points to one.

## Boundary Rules

1. Core does not import editor or backend source.
2. Editor does not import `../flowdoc-vnext-core/src/**` and does not import
   `@flowdoc/vnext-core` outside its core adapter boundary.
3. Backend imports `@flowdoc/vnext-core` as a package and does not copy core
   operation semantics into service modules.
4. Backend route modules may wrap retained core facts, but must own HTTP
   status, request ids, transport status, persistence records, and stale gates.
5. Editor owns browser-local selection, viewport, and interaction state; none
   of that becomes canonical package truth.
6. Concrete storage, file IO, route wiring, and artifact byte lifecycle belong
   to backend-owned modules or backend-owned packages.
7. Legacy/current editor code is evidence only unless it passes
   `docs/LEGACY_MIGRATION_GATE.md`.

## Required Checks

Run the smallest meaningful verification while working, then the full gate
before broad handoff.

| Repository | Focused Check | Full Gate |
|---|---|---|
| core | subsystem Vitest file for touched source | `npm run check` |
| editor | affected `src/tests/*.test.ts` plus boundary test when imports change | `npm run check` |
| backend | affected route/service/storage tests plus contract tests when envelopes change | `npm run check` |

When a change spans repositories, record the check result for each repository
in the handoff.

## Review Output

For broad work or cross-repo handoff, include:

- PASS
- FAIL / BLOCKER
- RISK
- UNKNOWN
- files changed
- behavior changed
- tests run
- risks left
- intentionally not changed

## Near-Term Work Queue

1. Keep this map and each repo's `AGENTS.md` aligned.
2. Add measured v4 layout/render consumption without treating placeholder
   pagination as export truth.
3. Keep package v3/document v4 out of active editor/runtime activation until the
   remaining capability gates are explicitly closed.
4. Retire old core package lanes such as `packages/storage-file-json` and
   `packages/internal-alpha-runner` only after historical-test replacement and
   backend parity are proven.
