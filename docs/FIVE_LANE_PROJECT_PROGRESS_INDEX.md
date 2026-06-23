# Five-Lane Project Progress Index

Status: Phase 131 five-lane project progress index and roadmap audit.

Phase 131 consolidates the active roadmap into five product-facing lanes:

- Viewport / Virtualization
- Structural Runtime
- WYSIWYG / Editing
- Backend / API / Persistence
- Exact Output / Renderer

This is a project progress index.

It is not an implementation phase and does not close any production lane by
itself.

## Summary

| Lane | Phase Coverage | Current Level | Done | Remaining Before Production |
|---|---:|---|---|---|
| Viewport / Virtualization | 45-68 | Sandbox/browser-local bounded large-document foundation | normalized editor view, runtime cache, visible range/request, store-backed render model, render window, shell placeholders, section measurement/apply, scroll controller, anchors, spacers, offsets, scheduler candidate/apply/runtime/automation, virtual stack, lazy heavy detail, node anchor, large-document audit | real browser timing, product integration smoke, recycled DOM/async hydration decisions, caret-relative anchoring, production scroll anchoring, renderer segment/measurement integration |
| Structural Runtime | 69-77 | Coherent local structural runtime foundation | projection, packet v1 contract, runtime-store apply, sandbox insert/delete/reorder bridge, command UI, outline jump, diagnostics navigation, command policy, close audit | durable structural history, backend public mutation API, storage/session persistence, collaboration/offline replay, drag/drop and keyboard outline commands, production editor smoke |
| WYSIWYG / Editing | 36-42, 78-85, 116-130 | Browser-local editing foundation plus canonical rich inline commit/replay/session/live-exact signal parity | text draft, draft selection/commands/caret/IME, draft runtime module, layout push, style patch planning, toolbar state, field-chip planning/execution, style-aware history, contenteditable range/segment/surface hardening, rich inline state/plan/commit/undo-redo/session persistence/live-exact audit | primary contenteditable input, production DOM range/caret/IME/copy/paste/delete, granular rich inline operation decision, durable replay/storage, collaboration conflict behavior, exact renderer artifact parity |
| Backend / API / Persistence | 86-92 plus 129 | Pure route/record/readiness contracts | generation route response boundary, session storage record, durable history snapshot, key migration planner, repeat/collection/form-slot readiness, submission state external record, persistence close audit, rich inline session persistence record | concrete server routes, storage adapters and schemas, auth/authz/idempotency/retry, durable undo-redo replay, key migration execution, repeat materialization/form runtime, workflow permissions/routes, artifact storage |
| Exact Output / Renderer | 93-115 | Renderer adapter/readiness contracts plus native rustybuzz smoke evidence | PDF/DOCX planning adapters, renderer-backed measurement adapter, layout job engine, deep table split readiness, TOC/page resolution, exact close audit, font/profile/text-engine evidence lane, external text-engine package scaffold, native rustybuzz smoke, raw UTF-8 to UTF-16 mapping, smoke corpus coverage | concrete PDF/DOCX bytes, renderer libraries/fidelity, production measurement binding, WASM build/load/digests, ICU4X line breaks, multi-line wrap, Thai oracle comparison, concrete layout execution, artifact workers/storage/routes |

## PASS

- `docs/PHASE_LEDGER.md` records every lane phase through Phase 130 with
  concrete docs and tests.
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md` contains the detailed phase cards
  for Viewport / Virtualization, Structural Runtime, WYSIWYG / Editing,
  Backend / API / Persistence, and Exact Output / Renderer.
- Viewport / Virtualization has a bounded large-document audit in
  `docs/TEMPLATE_BUILDER_VIEWPORT_LARGE_DOCUMENT_AUDIT.md`.
- Structural Runtime has a close audit in
  `docs/TEMPLATE_BUILDER_STRUCTURAL_RUNTIME_CLOSE_AUDIT.md`.
- WYSIWYG / Editing has close and re-entry audits through
  `docs/TEMPLATE_BUILDER_WYSIWYG_CLOSE_AUDIT.md`,
  `docs/TEMPLATE_BUILDER_WYSIWYG_REENTRY_AUDIT.md`,
  `docs/TEMPLATE_BUILDER_WYSIWYG_EXECUTION_CLOSE_AUDIT.md`, and
  `docs/TEMPLATE_BUILDER_RICH_INLINE_LIVE_EXACT_PARITY_AUDIT.md`.
- Backend / API / Persistence has a close audit in
  `docs/PERSISTENCE_CLOSE_AUDIT.md` and later rich inline session evidence in
  `docs/TEMPLATE_BUILDER_RICH_INLINE_SESSION_PERSISTENCE_BOUNDARY.md`.
- Exact Output / Renderer has a close audit in
  `docs/EXACT_OUTPUT_CLOSE_AUDIT.md`, a text engine lane close audit in
  `docs/TEXT_ENGINE_ADAPTER_LANE_CLOSE_AUDIT.md`, and package-local rustybuzz
  smoke evidence through Phase 115.

## FAIL / BLOCKER

- No blocker prevents using this index as the current project map.
- No lane should be called production-complete from this audit alone.

## RISK

- WYSIWYG production work depends on Exact Output / Renderer and Backend / API /
  Persistence becoming more concrete. Without renderer-backed measurement and
  durable storage/replay, production editing can drift from output truth.
- Viewport / Virtualization and Structural Runtime are still mostly sandbox or
  local runtime foundations; they need product integration smokes before broad
  UX claims.
- Backend / API / Persistence is record/route-safe, but not storage-backed.
- Exact Output / Renderer has strong adapter and text-engine evidence, but no
  concrete PDF/DOCX artifact bytes or production measurement binding.
- Collaboration and offline replay remain cross-lane unknowns.

## UNKNOWN

- Whether the first production editor release is single-user only or must
  include collaboration/offline semantics.
- Which renderer libraries and artifact storage architecture will own PDF/DOCX
  byte generation.
- Whether production contenteditable selection consumes editor-walked segments
  or renderer-owned segment streams.
- What browser performance targets must be met before viewport virtualization
  is accepted as production-ready.
- How much granular rich inline operation work is required before durable
  replay and collaboration can be considered safe.

## Lane Details

### Viewport / Virtualization

Evidence:

- Phases 45-68 in `docs/PHASE_LEDGER.md`.
- `docs/TEMPLATE_BUILDER_VIEWPORT_LARGE_DOCUMENT_AUDIT.md`.
- `tests/templateBuilderSandboxBoundary.test.ts`.

Current level:

- Bounded browser-local large-document foundation.
- Large synthetic viewport behavior is shape-tested: 72 sections, 936 nodes,
  bounded render window, virtual stack, lazy heavy-detail plan, and node-aware
  anchor restore.

Needed next:

- Product editor integration smoke.
- Real browser timing and interaction QA.
- Renderer segment and measurement integration for caret-relative anchoring.
- Production scroll anchoring policy beyond the sandbox section/node anchor
  model.

### Structural Runtime

Evidence:

- Phases 69-77 in `docs/PHASE_LEDGER.md`.
- `docs/TEMPLATE_BUILDER_STRUCTURAL_RUNTIME_CLOSE_AUDIT.md`.
- `src/structure/projection.ts`.
- `src/structure/packet.ts`.
- `tests/structuralProjection.test.ts`.
- `tests/structuralPacket.test.ts`.
- `tests/templateBuilderSandboxBoundary.test.ts`.

Current level:

- Coherent local foundation for projection, packets, runtime-store apply,
  sandbox structural bridge actions, command policy, outline jumps, and
  diagnostics navigation.
- Structural packet v1 is a local foundation bridge, not durable transport.

Needed next:

- Durable structural operation history and undo/redo.
- Backend public mutation route and versioned operation log.
- Storage/session persistence.
- Collaboration/offline replay and conflict policy.
- Production editor smoke, keyboard commands, and drag/drop outline behavior.

### WYSIWYG / Editing

Evidence:

- Phases 36-42, 78-85, and 116-130 in `docs/PHASE_LEDGER.md`.
- `docs/TEMPLATE_BUILDER_WYSIWYG_CLOSE_AUDIT.md`.
- `docs/TEMPLATE_BUILDER_WYSIWYG_REENTRY_AUDIT.md`.
- `docs/TEMPLATE_BUILDER_WYSIWYG_EXECUTION_CLOSE_AUDIT.md`.
- `docs/TEMPLATE_BUILDER_RICH_INLINE_LIVE_EXACT_PARITY_AUDIT.md`.
- `src/authoring/richInlineCommit.ts`.
- `src/authoring/richInlineSessionPersistence.ts`.
- `tests/richInlineCommit.test.ts`.
- `tests/richInlineSessionPersistence.test.ts`.
- `tests/richInlineLiveExactParityAudit.test.ts`.
- `tests/templateBuilderSandboxBoundary.test.ts`.

Current level:

- Browser-local WYSIWYG foundation plus canonical rich inline commit,
  undo/redo replay, session persistence record, and live/exact stale-signal
  parity.
- The hardened contenteditable surface is evidence and guardrail, not yet the
  primary production input.

Needed next:

- Production contenteditable primary input.
- DOM range/caret/IME/copy/paste/delete behavior over real rich inline content.
- Decision on full inline-child replacement versus granular rich inline
  operations.
- Durable storage/replay and selection restoration.
- Exact renderer artifact parity after rich inline edits.
- Collaboration/conflict behavior.

### Backend / API / Persistence

Evidence:

- Phases 86-92 and Phase 129 in `docs/PHASE_LEDGER.md`.
- `docs/PERSISTENCE_CLOSE_AUDIT.md`.
- `docs/GENERATION_API_ROUTE_BOUNDARY.md`.
- `docs/SESSION_STORAGE_BOUNDARY.md`.
- `docs/DURABLE_HISTORY_BOUNDARY.md`.
- `docs/KEY_HISTORY_MIGRATION_BOUNDARY.md`.
- `docs/REPEAT_COLLECTION_FORM_SLOT_BOUNDARY.md`.
- `docs/SUBMISSION_STATE_BOUNDARY.md`.
- `docs/TEMPLATE_BUILDER_RICH_INLINE_SESSION_PERSISTENCE_BOUNDARY.md`.
- `tests/generationApiRoute.test.ts`.
- `tests/sessionStorage.test.ts`.
- `tests/durableHistory.test.ts`.
- `tests/keyHistory.test.ts`.
- `tests/repeatCollectionFormSlots.test.ts`.
- `tests/submissionState.test.ts`.

Current level:

- Pure readiness, response, and record boundaries.
- No concrete server route, database, browser storage, durable storage write,
  key migration execution, repeat materialization, workflow route, or artifact
  storage exists yet.

Needed next:

- Storage adapter and durable schema selection.
- Concrete route integration for generation, session save/load, history, and
  artifacts.
- Auth/authz, idempotency, locking, migration, retry, and retention policy.
- Durable undo/redo replay engine and selection restoration.
- Key migration execution and compatibility policy.
- Repeat/collection materialization and form-slot runtime.
- Submission/reviewer workflow permissions and routes.

### Exact Output / Renderer

Evidence:

- Phases 93-115 in `docs/PHASE_LEDGER.md`.
- `docs/EXACT_OUTPUT_CLOSE_AUDIT.md`.
- `docs/TEXT_ENGINE_ADAPTER_LANE_CLOSE_AUDIT.md`.
- `docs/TEXT_ENGINE_ADAPTER_PACKAGE_SCAFFOLD.md`.
- `docs/TEXT_ENGINE_RUSTYBUZZ_SMOKE_PACKAGE_BOUNDARY.md`.
- `docs/TEXT_ENGINE_RUSTYBUZZ_RAW_MAPPING_BOUNDARY.md`.
- `docs/TEXT_ENGINE_RUSTYBUZZ_SMOKE_CORPUS_BOUNDARY.md`.
- `tests/pdfRendererAdapter.test.ts`.
- `tests/docxRendererAdapter.test.ts`.
- `tests/rendererTextMeasurementAdapter.test.ts`.
- `tests/layoutJobEngine.test.ts`.
- `tests/deepTableSplit.test.ts`.
- `tests/pageResolution.test.ts`.
- `tests/textEngineRustybuzzSmokeCorpus.test.ts`.

Current level:

- Renderer consumption, output planning, measurement profile identity, adapter
  request/evidence acceptance, and package-local native rustybuzz smoke
  evidence are in place.
- The current path can validate raw glyph evidence mapping from rustybuzz
  fixtures into FlowDoc UTF-16 evidence, but it is still smoke evidence.

Needed next:

- Concrete PDF/DOCX renderers that produce bytes and artifact manifests.
- Production renderer-backed text measurement binding.
- WASM build/loading/digest pinning for the text engine package.
- ICU4X line breaking and Thai oracle comparison.
- Multi-line wrap and cross-runtime parity.
- Concrete layout execution behind pausable jobs.
- Deep table non-text splitting and TOC rewrite/reflow.
- Artifact worker, storage, route, permission, and delivery behavior.

## Recommended Order

1. Stabilize the Exact Output / Renderer production measurement path far enough
   that rich inline edits can be compared against output truth.
2. Build Backend / API / Persistence storage adapters and durable replay for
   packages, history, rich inline session records, and artifacts.
3. Add production editor integration smokes for Viewport / Virtualization and
   Structural Runtime.
4. Return to WYSIWYG / Editing production input with renderer-backed segment
   and durable replay assumptions already fixed.

## Files Changed

- `docs/FIVE_LANE_PROJECT_PROGRESS_INDEX.md`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/fiveLaneProjectProgressIndex.test.ts`

## Behavior Changed

- No runtime behavior changed.
- Phase 131 consolidates roadmap evidence into a single project status index.

## Tests Run

- `npm.cmd test -- tests/fiveLaneProjectProgressIndex.test.ts`
- `npm.cmd run check`

## Risks Left

- Each lane still needs production-specific implementation phases.
- The index must be updated when any future lane is closed or reopened.

## Intentionally Not Changed

- No package/document schema changes.
- No parent editor runtime or legacy editor imports.
- No runtime code changes.
- No backend route, storage adapter, renderer artifact output, collaboration,
  or production contenteditable input.
