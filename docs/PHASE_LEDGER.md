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
| 40 | Draft text command boundary | done | `docs/TEMPLATE_BUILDER_DRAFT_TEXT_COMMAND_BOUNDARY.md`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/public/styles.css`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 41 | Draft selection/caret hardening | done | `docs/TEMPLATE_BUILDER_DRAFT_SELECTION_CARET_BOUNDARY.md`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/public/styles.css`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 42 | Draft IME composition boundary | done | `docs/TEMPLATE_BUILDER_DRAFT_COMPOSITION_BOUNDARY.md`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/public/styles.css`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 43 | Editor UX north star and normalized view constraint | done | `docs/EDITOR_UX_NORTH_STAR.md`; `docs/FRONTEND_AUTHORING_RUNTIME_PLAN.md`; `docs/LARGE_DOCUMENT_PERFORMANCE_CONTRACT.md`; `docs/TEMPLATE_BUILDER_BROWSER_CACHE_BOUNDARY.md`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 44 | Modular responsibility contract | done | `docs/MODULAR_RESPONSIBILITY_CONTRACT.md`; `AGENTS.md`; `docs/EDITOR_UX_NORTH_STAR.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 45 | Normalized editor view boundary | done | `docs/TEMPLATE_BUILDER_NORMALIZED_EDITOR_VIEW_BOUNDARY.md`; `examples/template-builder-sandbox/public/editorView.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 46 | Runtime cache module boundary | done | `docs/TEMPLATE_BUILDER_RUNTIME_CACHE_MODULE_BOUNDARY.md`; `examples/template-builder-sandbox/public/runtimeCache.js`; `examples/template-builder-sandbox/public/app.js`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 47 | Visible range boundary | done | `docs/TEMPLATE_BUILDER_VISIBLE_RANGE_BOUNDARY.md`; `examples/template-builder-sandbox/public/visibleRange.js`; `examples/template-builder-sandbox/public/editorView.js`; `examples/template-builder-sandbox/public/runtimeCache.js`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 48 | Visible range request boundary | done | `docs/TEMPLATE_BUILDER_VISIBLE_RANGE_REQUEST_BOUNDARY.md`; `examples/template-builder-sandbox/public/visibleRangeRequest.js`; `examples/template-builder-sandbox/public/visibleRange.js`; `examples/template-builder-sandbox/public/runtimeCache.js`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 49 | Structural runtime store boundary | done | `docs/TEMPLATE_BUILDER_RUNTIME_STORE_BOUNDARY.md`; `examples/template-builder-sandbox/public/runtimeStore.js`; `examples/template-builder-sandbox/public/editorView.js`; `examples/template-builder-sandbox/public/runtimeCache.js`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 50 | Text packet store apply boundary | done | `docs/TEMPLATE_BUILDER_TEXT_PACKET_STORE_BOUNDARY.md`; `examples/template-builder-sandbox/public/runtimeStore.js`; `examples/template-builder-sandbox/public/runtimeCache.js`; `examples/template-builder-sandbox/public/app.js`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 51 | Store-backed render boundary | done | `docs/TEMPLATE_BUILDER_STORE_BACKED_RENDER_BOUNDARY.md`; `examples/template-builder-sandbox/public/renderModel.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 52 | Render window boundary | done | `docs/TEMPLATE_BUILDER_RENDER_WINDOW_BOUNDARY.md`; `examples/template-builder-sandbox/public/renderWindow.js`; `examples/template-builder-sandbox/public/renderModel.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 53 | Viewport request boundary | done | `docs/TEMPLATE_BUILDER_VIEWPORT_REQUEST_BOUNDARY.md`; `examples/template-builder-sandbox/public/viewportController.js`; `examples/template-builder-sandbox/public/visibleRangeRequest.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 54 | Render shell placeholder boundary | done | `docs/TEMPLATE_BUILDER_RENDER_SHELL_BOUNDARY.md`; `examples/template-builder-sandbox/public/renderShell.js`; `examples/template-builder-sandbox/public/renderModel.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/public/styles.css`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 55 | Viewport section-shell measurement boundary | done | `docs/TEMPLATE_BUILDER_VIEWPORT_MEASUREMENT_BOUNDARY.md`; `examples/template-builder-sandbox/public/viewportMeasurement.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 56 | Manual viewport measurement apply boundary | done | `docs/TEMPLATE_BUILDER_VIEWPORT_APPLY_BOUNDARY.md`; `examples/template-builder-sandbox/public/viewportMeasurement.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/public/styles.css`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 57 | Debounced viewport scroll controller boundary | done | `docs/TEMPLATE_BUILDER_VIEWPORT_SCROLL_CONTROLLER_BOUNDARY.md`; `examples/template-builder-sandbox/public/viewportScrollController.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 58 | Section viewport anchor boundary | done | `docs/TEMPLATE_BUILDER_VIEWPORT_ANCHOR_BOUNDARY.md`; `examples/template-builder-sandbox/public/viewportAnchor.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 59 | Measured section spacer boundary | done | `docs/TEMPLATE_BUILDER_SECTION_SPACER_BOUNDARY.md`; `examples/template-builder-sandbox/public/viewportSectionSpacers.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/public/styles.css`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 60 | Section offset prediction boundary | done | `docs/TEMPLATE_BUILDER_SECTION_OFFSET_BOUNDARY.md`; `examples/template-builder-sandbox/public/viewportSectionOffsets.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 61 | Viewport scheduler candidate boundary | done | `docs/TEMPLATE_BUILDER_VIEWPORT_SCHEDULER_CANDIDATE_BOUNDARY.md`; `examples/template-builder-sandbox/public/viewportSchedulerCandidate.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 62 | Viewport scheduler apply boundary | done | `docs/TEMPLATE_BUILDER_VIEWPORT_SCHEDULER_APPLY_BOUNDARY.md`; `examples/template-builder-sandbox/public/viewportSchedulerApply.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 63 | Viewport scheduler runtime boundary | done | `docs/TEMPLATE_BUILDER_VIEWPORT_SCHEDULER_RUNTIME_BOUNDARY.md`; `examples/template-builder-sandbox/public/viewportSchedulerRuntime.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 64 | Viewport scheduler automation boundary | done | `docs/TEMPLATE_BUILDER_VIEWPORT_SCHEDULER_AUTOMATION_BOUNDARY.md`; `examples/template-builder-sandbox/public/viewportSchedulerAutomation.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 65 | Viewport virtual stack boundary | done | `docs/TEMPLATE_BUILDER_VIEWPORT_VIRTUAL_STACK_BOUNDARY.md`; `examples/template-builder-sandbox/public/viewportVirtualStack.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/public/styles.css`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 66 | Viewport lazy heavy-detail boundary | done | `docs/TEMPLATE_BUILDER_VIEWPORT_LAZY_DETAIL_BOUNDARY.md`; `examples/template-builder-sandbox/public/viewportLazyDetail.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/public/styles.css`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 67 | Viewport node anchor boundary | done | `docs/TEMPLATE_BUILDER_VIEWPORT_NODE_ANCHOR_BOUNDARY.md`; `examples/template-builder-sandbox/public/viewportNodeAnchor.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 68 | Viewport large-document behavior audit | done | `docs/TEMPLATE_BUILDER_VIEWPORT_LARGE_DOCUMENT_AUDIT.md`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 69 | Structural projection boundary | done | `docs/TEMPLATE_BUILDER_STRUCTURAL_PROJECTION_BOUNDARY.md`; `src/structure/projection.ts`; `src/index.ts`; `tests/structuralProjection.test.ts` |
| 70 | Structural packet contract boundary | done | `docs/TEMPLATE_BUILDER_STRUCTURAL_PACKET_CONTRACT_BOUNDARY.md`; `src/structure/packet.ts`; `src/index.ts`; `tests/structuralPacket.test.ts` |
| 71 | Structural packet store apply boundary | done | `docs/TEMPLATE_BUILDER_STRUCTURAL_PACKET_STORE_BOUNDARY.md`; `examples/template-builder-sandbox/public/runtimeStoreStructuralPacket.js`; `examples/template-builder-sandbox/public/runtimeCache.js`; `examples/template-builder-sandbox/public/editorView.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 72 | Structural mutation bridge boundary | done | `docs/TEMPLATE_BUILDER_STRUCTURAL_MUTATION_BRIDGE_BOUNDARY.md`; `examples/template-builder-sandbox/src/mutationBridge.ts`; `examples/template-builder-sandbox/scripts/serve.mjs`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `examples/template-builder-sandbox/public/sandbox-snapshot.json`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 73 | Structural command UI boundary | done | `docs/TEMPLATE_BUILDER_STRUCTURAL_COMMAND_UI_BOUNDARY.md`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/public/styles.css`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `examples/template-builder-sandbox/public/sandbox-snapshot.json`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 74 | Structural outline jump boundary | done | `docs/TEMPLATE_BUILDER_STRUCTURAL_OUTLINE_JUMP_BOUNDARY.md`; `examples/template-builder-sandbox/public/structuralOutlineNavigation.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/public/styles.css`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `examples/template-builder-sandbox/public/sandbox-snapshot.json`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 75 | Structural diagnostics navigation boundary | done | `docs/TEMPLATE_BUILDER_STRUCTURAL_DIAGNOSTICS_NAVIGATION_BOUNDARY.md`; `examples/template-builder-sandbox/public/structuralDiagnosticsNavigation.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/public/styles.css`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `examples/template-builder-sandbox/public/sandbox-snapshot.json`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 76 | Structural command policy boundary | done | `docs/TEMPLATE_BUILDER_STRUCTURAL_COMMAND_POLICY_BOUNDARY.md`; `examples/template-builder-sandbox/public/structuralCommandPolicy.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `examples/template-builder-sandbox/public/sandbox-snapshot.json`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 77 | Structural Runtime close audit | done | `docs/TEMPLATE_BUILDER_STRUCTURAL_RUNTIME_CLOSE_AUDIT.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 78 | Draft runtime module boundary | done | `docs/TEMPLATE_BUILDER_DRAFT_RUNTIME_MODULE_BOUNDARY.md`; `examples/template-builder-sandbox/public/draftRuntime.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 79 | Text draft layout push boundary | done | `docs/TEMPLATE_BUILDER_TEXT_DRAFT_LAYOUT_PUSH_BOUNDARY.md`; `examples/template-builder-sandbox/public/draftLayoutPush.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 80 | Draft IME hardening boundary | done | `docs/TEMPLATE_BUILDER_DRAFT_IME_HARDENING_BOUNDARY.md`; `examples/template-builder-sandbox/public/draftImePolicy.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 81 | Rich inline style patch boundary | done | `docs/TEMPLATE_BUILDER_RICH_INLINE_STYLE_PATCH_BOUNDARY.md`; `examples/template-builder-sandbox/public/draftInlineStylePatch.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 82 | Toolbar state boundary | done | `docs/TEMPLATE_BUILDER_TOOLBAR_STATE_BOUNDARY.md`; `examples/template-builder-sandbox/public/draftToolbarState.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 83 | Field chip inline boundary | done | `docs/TEMPLATE_BUILDER_FIELD_CHIP_INLINE_BOUNDARY.md`; `examples/template-builder-sandbox/public/draftFieldChipInline.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 84 | Style-aware history boundary | done | `docs/TEMPLATE_BUILDER_STYLE_AWARE_HISTORY_BOUNDARY.md`; `examples/template-builder-sandbox/public/draftStyleHistory.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 85 | WYSIWYG close audit | done | `docs/TEMPLATE_BUILDER_WYSIWYG_CLOSE_AUDIT.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 86 | Generation API route boundary | done | `docs/GENERATION_API_ROUTE_BOUNDARY.md`; `src/generation/apiRoute.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/generationApiRoute.test.ts` |
| 87 | Session storage boundary | done | `docs/SESSION_STORAGE_BOUNDARY.md`; `src/authoring/sessionStorage.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/sessionStorage.test.ts` |
| 88 | Durable history / undo-redo boundary | done | `docs/DURABLE_HISTORY_BOUNDARY.md`; `src/authoring/durableHistory.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/durableHistory.test.ts` |
| 89 | Key history / migration boundary | done | `docs/KEY_HISTORY_MIGRATION_BOUNDARY.md`; `src/binding/keyHistory.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/keyHistory.test.ts` |
| 90 | Repeat / collection / form-slot boundary | done | `docs/REPEAT_COLLECTION_FORM_SLOT_BOUNDARY.md`; `src/binding/repeatCollectionFormSlots.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/repeatCollectionFormSlots.test.ts` |
| 91 | Submission state boundary | done | `docs/SUBMISSION_STATE_BOUNDARY.md`; `src/workflow/submissionState.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/submissionState.test.ts` |
| 92 | Persistence close audit | done | `docs/PERSISTENCE_CLOSE_AUDIT.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/persistenceCloseAudit.test.ts` |
| 93 | PDF renderer adapter boundary | done | `docs/PDF_RENDERER_ADAPTER_BOUNDARY.md`; `src/renderer/pdfAdapter.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/pdfRendererAdapter.test.ts` |
| 94 | DOCX renderer adapter boundary | done | `docs/DOCX_RENDERER_ADAPTER_BOUNDARY.md`; `src/renderer/docxAdapter.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/docxRendererAdapter.test.ts` |
| 95 | Renderer-backed text measurement boundary | done | `docs/RENDERER_BACKED_TEXT_MEASUREMENT_BOUNDARY.md`; `src/renderer/textMeasurementAdapter.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/rendererTextMeasurementAdapter.test.ts` |
| 96 | Pausable layout job engine | done | `docs/PAUSABLE_LAYOUT_JOB_ENGINE_BOUNDARY.md`; `src/pagination/layoutJobEngine.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/layoutJobEngine.test.ts` |
| 97 | Deep table split boundary | done | `docs/DEEP_TABLE_SPLIT_BOUNDARY.md`; `src/pagination/deepTableSplit.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/deepTableSplit.test.ts` |
| 98 | Final TOC / page resolution boundary | done | `docs/FINAL_TOC_PAGE_RESOLUTION_BOUNDARY.md`; `src/pagination/pageResolution.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/pageResolution.test.ts` |
| 99 | Exact output close audit | done | `docs/EXACT_OUTPUT_CLOSE_AUDIT.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/exactOutputCloseAudit.test.ts` |
| 100 | Text measurement engine spike boundary | done | `docs/TEXT_MEASUREMENT_ENGINE_SPIKE_BOUNDARY.md`; `src/renderer/textMeasurementEngineSpike.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/textMeasurementEngineSpike.test.ts` |
| 101 | Font registry spike boundary | done | `docs/FONT_REGISTRY_SPIKE_BOUNDARY.md`; `src/renderer/fontRegistrySpike.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/fontRegistrySpike.test.ts` |
| 102 | Font ownership clearing boundary | done | `docs/FONT_OWNERSHIP_CLEARING_BOUNDARY.md`; `src/renderer/fontOwnership.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/fontOwnership.test.ts` |
| 103 | Font asset copy/hash evidence | done | `docs/FONT_ASSET_COPY_HASH_EVIDENCE.md`; `assets/fonts/font-assets.v1.json`; `assets/fonts/Sarabun/*`; `assets/fonts/Noto_Sans_Thai/*`; `package.json`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/fontAssetEvidence.test.ts` |
| 104 | Measurement profile identity contract | done | `docs/MEASUREMENT_PROFILE_IDENTITY_CONTRACT.md`; `src/renderer/measurementProfileIdentity.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/measurementProfileIdentity.test.ts` |
| 105 | Rust/WASM text engine boundary decision | done | `docs/RUST_WASM_TEXT_ENGINE_BOUNDARY.md`; `src/renderer/rustWasmTextEngineBoundary.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/rustWasmTextEngineBoundary.test.ts` |
| 106 | Thai corpus/oracle boundary | done | `docs/THAI_CORPUS_ORACLE_BOUNDARY.md`; `fixtures/thai-measurement-corpus.v1.json`; `src/renderer/thaiCorpusBoundary.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/thaiCorpusBoundary.test.ts` |
| 107 | Rustybuzz shaping smoke boundary | done | `docs/RUSTYBUZZ_SHAPING_SMOKE_BOUNDARY.md`; `fixtures/rustybuzz-shaping-smoke.v1.json`; `src/renderer/rustybuzzShapingSmoke.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/rustybuzzShapingSmoke.test.ts` |
| 108 | Text engine adapter SPI boundary | done | `docs/TEXT_ENGINE_ADAPTER_SPI_BOUNDARY.md`; `src/renderer/textEngineAdapterSpi.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/textEngineAdapterSpi.test.ts` |
| 109 | Text engine evidence acceptance boundary | done | `docs/TEXT_ENGINE_EVIDENCE_ACCEPTANCE_BOUNDARY.md`; `src/renderer/textEngineEvidenceAcceptance.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/textEngineEvidenceAcceptance.test.ts` |
| 110 | Text engine measurement draft handoff boundary | done | `docs/TEXT_ENGINE_MEASUREMENT_DRAFT_HANDOFF_BOUNDARY.md`; `src/renderer/textEngineMeasurementDraftHandoff.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `tests/textEngineMeasurementDraftHandoff.test.ts` |
| 111 | Text engine adapter lane close audit | done | `docs/TEXT_ENGINE_ADAPTER_LANE_CLOSE_AUDIT.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/textEngineAdapterLaneCloseAudit.test.ts` |
| 112 | Text engine adapter package scaffold | done | `docs/TEXT_ENGINE_ADAPTER_PACKAGE_SCAFFOLD.md`; `packages/text-engine-rust-wasm`; `tsconfig.json`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/textEngineAdapterPackageScaffold.test.ts` |
| 113 | Text engine rustybuzz smoke package boundary | done | `docs/TEXT_ENGINE_RUSTYBUZZ_SMOKE_PACKAGE_BOUNDARY.md`; `packages/text-engine-rust-wasm/rust-shaper`; `packages/text-engine-rust-wasm/fixtures/rustybuzz-native-smoke.sarabun.v1.json`; `packages/text-engine-rust-wasm/package.json`; `packages/text-engine-rust-wasm/README.md`; `.gitignore`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/textEngineRustybuzzSmokePackage.test.ts` |
| 114 | Text engine rustybuzz raw mapping boundary | done | `docs/TEXT_ENGINE_RUSTYBUZZ_RAW_MAPPING_BOUNDARY.md`; `packages/text-engine-rust-wasm/src/rustybuzzRawMapping.ts`; `packages/text-engine-rust-wasm/src/index.ts`; `packages/text-engine-rust-wasm/README.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/textEngineRustybuzzRawMapping.test.ts`; `tests/textEngineRustybuzzSmokePackage.test.ts` |
| 115 | Text engine rustybuzz smoke corpus boundary | done | `docs/TEXT_ENGINE_RUSTYBUZZ_SMOKE_CORPUS_BOUNDARY.md`; `packages/text-engine-rust-wasm/fixtures/rustybuzz-native-smoke.corpus.v1.json`; `packages/text-engine-rust-wasm/fixtures/rustybuzz-native-smoke.*.v1.json`; `packages/text-engine-rust-wasm/src/rustybuzzSmokeCorpus.ts`; `packages/text-engine-rust-wasm/src/index.ts`; `packages/text-engine-rust-wasm/README.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/textEngineRustybuzzSmokeCorpus.test.ts` |
| 116 | WYSIWYG re-entry audit | done | `docs/TEMPLATE_BUILDER_WYSIWYG_REENTRY_AUDIT.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/wysiwygReentryAudit.test.ts` |
| 117 | Contenteditable range mapping boundary | done | `docs/TEMPLATE_BUILDER_CONTENTEDITABLE_RANGE_MAPPING_BOUNDARY.md`; `examples/template-builder-sandbox/public/draftContenteditableRangeMapping.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 118 | Rich inline patch execution boundary | done | `docs/TEMPLATE_BUILDER_RICH_INLINE_PATCH_EXECUTION_BOUNDARY.md`; `examples/template-builder-sandbox/public/draftRichInlinePatchExecution.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `examples/template-builder-sandbox/public/sandbox-snapshot.json`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 119 | Toolbar command dispatch boundary | done | `docs/TEMPLATE_BUILDER_TOOLBAR_COMMAND_DISPATCH_BOUNDARY.md`; `examples/template-builder-sandbox/public/draftToolbarCommandDispatch.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/public/styles.css`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `examples/template-builder-sandbox/public/sandbox-snapshot.json`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 120 | Field chip insert execution boundary | done | `docs/TEMPLATE_BUILDER_FIELD_CHIP_INSERT_EXECUTION_BOUNDARY.md`; `examples/template-builder-sandbox/public/draftFieldChipInsertExecution.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `examples/template-builder-sandbox/public/sandbox-snapshot.json`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 121 | WYSIWYG execution re-baseline audit | done | `docs/TEMPLATE_BUILDER_WYSIWYG_EXECUTION_REBASELINE_AUDIT.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/wysiwygExecutionRebaselineAudit.test.ts` |
| 122 | Browser-local rich inline state boundary | done | `docs/TEMPLATE_BUILDER_RICH_INLINE_STATE_BOUNDARY.md`; `examples/template-builder-sandbox/public/draftRichInlineState.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 123 | Contenteditable segment capture boundary | done | `docs/TEMPLATE_BUILDER_CONTENTEDITABLE_SEGMENT_CAPTURE_BOUNDARY.md`; `examples/template-builder-sandbox/public/draftContenteditableSegmentCapture.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `examples/template-builder-sandbox/public/sandbox-snapshot.json`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 124 | Rich inline commit planning boundary | done | `docs/TEMPLATE_BUILDER_RICH_INLINE_COMMIT_PLANNING_BOUNDARY.md`; `examples/template-builder-sandbox/public/draftRichInlineCommitPlan.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `examples/template-builder-sandbox/public/sandbox-snapshot.json`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 125 | Rich inline commit bridge boundary | done | `docs/TEMPLATE_BUILDER_RICH_INLINE_COMMIT_BRIDGE_BOUNDARY.md`; `src/authoring/richInlineCommit.ts`; `src/authoring/intentHistory.ts`; `src/index.ts`; `examples/template-builder-sandbox/src/mutationBridge.ts`; `examples/template-builder-sandbox/scripts/serve.mjs`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `examples/template-builder-sandbox/public/sandbox-snapshot.json`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/richInlineCommit.test.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 126 | WYSIWYG execution close audit | done | `docs/TEMPLATE_BUILDER_WYSIWYG_EXECUTION_CLOSE_AUDIT.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/wysiwygExecutionCloseAudit.test.ts` |
| 127 | Rich inline undo/redo replay boundary | done | `docs/TEMPLATE_BUILDER_RICH_INLINE_UNDO_REDO_REPLAY_BOUNDARY.md`; `examples/template-builder-sandbox/src/mutationBridge.ts`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `examples/template-builder-sandbox/public/sandbox-snapshot.json`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 128 | Production contenteditable surface hardening boundary | done | `docs/TEMPLATE_BUILDER_CONTENTEDITABLE_SURFACE_HARDENING_BOUNDARY.md`; `examples/template-builder-sandbox/public/draftContenteditableSurfaceHardening.js`; `examples/template-builder-sandbox/public/app.js`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `examples/template-builder-sandbox/public/sandbox-snapshot.json`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 129 | Rich inline persistence/session boundary | done | `docs/TEMPLATE_BUILDER_RICH_INLINE_SESSION_PERSISTENCE_BOUNDARY.md`; `src/authoring/richInlineSessionPersistence.ts`; `src/index.ts`; `examples/template-builder-sandbox/src/coreBoundary.ts`; `examples/template-builder-sandbox/public/sandbox-snapshot.json`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/richInlineSessionPersistence.test.ts`; `tests/templateBuilderSandboxBoundary.test.ts` |
| 130 | Rich inline live/exact parity audit | done | `docs/TEMPLATE_BUILDER_RICH_INLINE_LIVE_EXACT_PARITY_AUDIT.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/richInlineLiveExactParityAudit.test.ts` |
| 131 | Five-lane project progress index | done | `docs/FIVE_LANE_PROJECT_PROGRESS_INDEX.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/fiveLaneProjectProgressIndex.test.ts` |
| 132 | ICU4X line-break evidence manifest boundary | done | `docs/THAI_LINE_BREAK_EVIDENCE_BOUNDARY.md`; `fixtures/thai-line-break-evidence.v1.json`; `src/renderer/thaiLineBreakEvidence.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/thaiLineBreakEvidence.test.ts` |
| 133 | Multi-line wrap evidence boundary | done | `docs/TEXT_ENGINE_LINE_WRAP_EVIDENCE_BOUNDARY.md`; `packages/text-engine-rust-wasm/src/lineWrapEvidence.ts`; `packages/text-engine-rust-wasm/src/index.ts`; `src/renderer/textEngineEvidenceAcceptance.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/textEngineLineWrapEvidence.test.ts` |
| 134 | WASM / ICU4X runtime identity and digest boundary | done | `docs/TEXT_ENGINE_RUNTIME_IDENTITY_BOUNDARY.md`; `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`; `packages/text-engine-rust-wasm/src/runtimeIdentity.ts`; `packages/text-engine-rust-wasm/src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/textEngineRuntimeIdentity.test.ts` |
| 135 | Renderer-backed text measurement provider bridge | done | `docs/TEXT_ENGINE_RENDERER_BACKED_PROVIDER_BOUNDARY.md`; `packages/text-engine-rust-wasm/src/rendererBackedProvider.ts`; `packages/text-engine-rust-wasm/src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/rendererBackedTextEngineProvider.test.ts` |
| 136 | External minimal PDF artifact spike package | done | `docs/PDF_RENDERER_SPIKE_PACKAGE_BOUNDARY.md`; `packages/pdf-renderer-spike/package.json`; `packages/pdf-renderer-spike/src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/pdfRendererSpike.test.ts` |
| 137 | Artifact manifest and storage boundary | done | `docs/ARTIFACT_MANIFEST_BOUNDARY.md`; `src/generation/artifactManifest.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/artifactManifest.test.ts` |
| 138 | Backend artifact route contract boundary | done | `docs/ARTIFACT_API_ROUTE_BOUNDARY.md`; `src/generation/artifactApiRoute.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/artifactApiRoute.test.ts` |
| 139 | Durable layout and artifact job boundary | done | `docs/ARTIFACT_JOB_BOUNDARY.md`; `src/generation/artifactJob.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/artifactJob.test.ts` |
| 140 | Storage adapter interface boundary | done | `docs/STORAGE_ADAPTER_BOUNDARY.md`; `src/persistence/storageAdapter.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/storageAdapter.test.ts` |
| 141 | Product editor integration smoke boundary | done | `docs/PRODUCT_EDITOR_INTEGRATION_SMOKE_BOUNDARY.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/productEditorIntegrationSmoke.test.ts` |
| 142 | Browser timing smoke boundary | done | `docs/BROWSER_TIMING_SMOKE_BOUNDARY.md`; `examples/template-builder-sandbox/scripts/browser-smoke.mjs`; `examples/template-builder-sandbox/package.json`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/browserTimingSmoke.test.ts` |
| 143 | WYSIWYG primary input decision gate | done | `docs/WYSIWYG_PRIMARY_INPUT_DECISION_GATE.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/wysiwygPrimaryInputDecisionGate.test.ts` |
| 144 | Granular rich inline operation decision boundary | done | `docs/RICH_INLINE_OPERATION_DECISION_BOUNDARY.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/richInlineOperationDecision.test.ts` |
| 145 | First vertical slice release candidate plan | done | `docs/FIRST_VERTICAL_SLICE_RC_PLAN.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/firstVerticalSliceReadiness.test.ts` |
| 146 | First vertical slice RC orchestrator boundary | done | `docs/VERTICAL_SLICE_RC_ORCHESTRATOR_BOUNDARY.md`; `src/generation/verticalSliceRc.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/verticalSliceRc.test.ts` |
| 147 | RC scenario fixture boundary | done | `docs/VERTICAL_SLICE_RC_SCENARIO_BOUNDARY.md`; `fixtures/vertical-slice-rc-report.v1.flowdoc.json`; `fixtures/vertical-slice-rc-scenario.v1.json`; `src/generation/verticalSliceScenario.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/verticalSliceScenario.test.ts` |
| 148 | RC measurement selection and drift gate | done | `docs/VERTICAL_SLICE_MEASUREMENT_GATE_BOUNDARY.md`; `src/generation/verticalSliceMeasurementGate.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/verticalSliceMeasurementGate.test.ts` |
| 149 | RC artifact production bridge | done | `docs/VERTICAL_SLICE_ARTIFACT_BRIDGE_BOUNDARY.md`; `src/generation/verticalSliceArtifactBridge.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/verticalSliceArtifactBridge.test.ts` |
| 150 | RC storage simulation boundary | done | `docs/VERTICAL_SLICE_STORAGE_SIMULATION_BOUNDARY.md`; `src/generation/verticalSliceStorageSimulation.ts`; `src/generation/verticalSliceRc.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/verticalSliceStorageSimulation.test.ts` |
| 151 | End-to-end RC report smoke | done | `docs/VERTICAL_SLICE_RC_END_TO_END_SMOKE.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/verticalSliceRcEndToEnd.test.ts` |
| 152 | RC close audit | done | `docs/VERTICAL_SLICE_RC_CLOSE_AUDIT.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/verticalSliceRcCloseAudit.test.ts` |
| 153 | Hybrid managed card input implementation plan | done | `docs/HYBRID_MANAGED_CARD_INPUT_IMPLEMENTATION_PLAN.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/hybridManagedCardInputPlan.test.ts` |

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

## Phase 40 Draft Text Command Boundary

Phase 40 executes the first browser-local text commands from active WYSIWYG
draft command context:

- `docs/TEMPLATE_BUILDER_DRAFT_TEXT_COMMAND_BOUNDARY.md` records implemented
  commands, truth boundary, visible state, acceptance evidence, and non-goals;
- `examples/template-builder-sandbox/public/app.js` now owns
  `draftCommandText`, command action guards, and `applyDraftTextCommand` for
  browser-local `text.insert` and `text.replaceSelection`;
- the inspector draft panel now exposes a command text input plus Insert text
  and Replace selection controls that update only the active draft before
  commit;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.applyDraftTextCommand` as a browser-local action lane;
- `tests/templateBuilderSandboxBoundary.test.ts` proves command text stays out
  of generated snapshots and draft commits still use the existing bridge packet
  path.

This phase intentionally does not implement key/field insertion, rich text
toolbar commands, `inline.style.patch`, style-preserving mixed inline edits,
contenteditable editing, DOM range mapping over rich inline nodes, IME
composition lifecycle, per-keystroke core transactions, replace-selection
bridge routes separate from draft commit, or live layout rendering during
active typing.

## Phase 41 Draft Selection/Caret Hardening

Phase 41 hardens active WYSIWYG draft selection and caret handling without
introducing rich DOM range mapping:

- `docs/TEMPLATE_BUILDER_DRAFT_SELECTION_CARET_BOUNDARY.md` records the
  selection/caret control boundary, command interaction, truth boundary,
  acceptance evidence, and non-goals;
- `examples/template-builder-sandbox/public/app.js` now owns
  `setDraftSelectionRange`, `applyDraftSelectionAction`, and
  `updateDraftSelectionControl` for browser-local range/caret updates;
- the inspector draft panel now exposes start/end range inputs plus cursor
  start, cursor end, and select-all controls;
- draft text commands now restore focus to the draft editor after applying
  command text;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.setDraftSelectionRange` as a browser-local action lane;
- `tests/templateBuilderSandboxBoundary.test.ts` proves the range/caret
  controls remain browser-owned and the draft commit path still uses the
  existing bridge packet route.

This phase intentionally does not implement rich DOM range mapping,
contenteditable editing, multi-range selection, key/field chip insertion,
`inline.style.patch`, style-preserving mixed inline edits, IME composition
lifecycle, per-keystroke core transactions, durable selection persistence,
collaboration cursors, or live layout rendering during active typing.

## Phase 42 Draft IME Composition Boundary

Phase 42 adds a browser-local IME composition guard for active textarea drafts:

- `docs/TEMPLATE_BUILDER_DRAFT_COMPOSITION_BOUNDARY.md` records composition
  state, event handling, guarded actions, visible state, acceptance evidence,
  and non-goals;
- `examples/template-builder-sandbox/public/app.js` now tracks
  `isComposing`, `compositionData`, `compositionSource`, and
  `compositionEventCount` on the active browser draft;
- the canvas draft textarea listens to `compositionstart`,
  `compositionupdate`, and `compositionend`;
- range controls, text commands, and commit are disabled and guarded while IME
  composition is active;
- canvas, inspector, and status bar labels expose browser-local composition
  status;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.trackDraftComposition` as a browser-local action lane;
- `tests/templateBuilderSandboxBoundary.test.ts` proves composition state stays
  out of generated snapshots and draft commits still use the existing bridge
  packet path.

This phase intentionally does not implement language-specific IME behavior,
rich DOM composition mapping, contenteditable editing, key/field chip insertion
during composition, `inline.style.patch`, per-keystroke core transactions,
durable composition persistence, collaboration cursors, or live layout
rendering during active typing.

## Phase 43 Editor UX North Star And Normalized View Constraint

Phase 43 locks the visible editor direction before deeper WYSIWYG/runtime work:

- `docs/EDITOR_UX_NORTH_STAR.md` is now the Phase 43 design boundary for the
  browser document editor as a first-class product surface;
- the minimum WYSIWYG contract requires document-position editing, browser-local
  draft/caret/selection/IME state, operation-backed commits, bounded packet
  updates, and large-document-safe lookup;
- the normalized editor view constraint requires active browser runtime paths
  to use lookup-first indexes such as `nodeById`, `parentById`, `childrenById`,
  visible ranges, node order, dirty ids, and changed subtree ids;
- full recursive tree snapshots remain acceptable for boot, debug, and the
  early sandbox, but they must not become the active runtime shape for typing,
  selection, scroll, or inspector lookup;
- canonical authored nodes may still own semantic ordered child ids such as
  `childIds`, `columnIds`, `rowIds`, and `cellIds`;
- `docs/FRONTEND_AUTHORING_RUNTIME_PLAN.md`,
  `docs/LARGE_DOCUMENT_PERFORMANCE_CONTRACT.md`, and
  `docs/TEMPLATE_BUILDER_BROWSER_CACHE_BOUNDARY.md` now carry the same
  normalized/lazy editor view constraint;
- `tests/templateBuilderSandboxBoundary.test.ts` guards the north-star text so
  future work cannot silently remove the large-document lookup constraint.

This phase intentionally does not implement a new normalized runtime cache,
lazy detail endpoint, virtualized renderer, rich text editing, contenteditable
DOM mapping, concrete live-layout renderer, persistence, API routes, or
package/document version changes.

## Phase 44 Modular Responsibility Contract

Phase 44 records the file/module split guard before deeper editor runtime work:

- `docs/MODULAR_RESPONSIBILITY_CONTRACT.md` defines responsibility-based file
  splitting, split triggers, allowed coordinators, the current sandbox
  exception, review questions, and non-goals;
- `AGENTS.md` now tells future agents not to grow monolithic files that own
  state shape, event binding, rendering, transport, mutation application,
  diagnostics, and command policy together;
- `docs/EDITOR_UX_NORTH_STAR.md` now carries the modular runtime rule beside
  the normalized editor view constraint;
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md` now treats responsibility slicing
  as a roadmap principle and Phase 44 acceptance boundary;
- `tests/templateBuilderSandboxBoundary.test.ts` guards the modularity contract
  so future work cannot silently remove it.

This phase intentionally does not refactor the sandbox browser runtime,
introduce new implementation modules, create a production editor package, add
routes, change public APIs, or change package/document versions.

## Phase 45 Normalized Editor View Boundary

Phase 45 adds the first lookup-first browser editor view:

- `examples/template-builder-sandbox/public/editorView.js` owns browser-safe
  normalized editor view creation and helper reads;
- the editor view derives `nodeById`, `parentById`, `childrenById`,
  `sectionById`, `zoneById`, section/zone node indexes, root zone ids,
  `nodeOrder`, `visibleNodeIds`, dirty ids, changed ids, and changed subtree
  ids;
- the browser runtime cache now stores the editor view and exposes view mode,
  visible node count, child index count, and dirty node count for status/debug;
- tree and canvas rendering traverse through editor view helpers instead of
  directly mapping recursive `node.children` in render code;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.createNormalizedEditorView` as a wired action lane;
- `docs/TEMPLATE_BUILDER_NORMALIZED_EDITOR_VIEW_BOUNDARY.md` records the
  boundary, scale direction, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` imports the browser-safe
  module in Node and proves the expected indexes from the sandbox snapshot.

This phase intentionally does not implement viewport virtualization, lazy
detail routes, structural packet patching without snapshot tree patching, rich
text editing, key/field chips, contenteditable mapping, language-specific IME,
concrete live-layout rendering, persistence, API routes, or package/document
version changes.

## Phase 46 Runtime Cache Module Boundary

Phase 46 splits runtime-cache and packet-apply ownership out of the sandbox app
shell:

- `examples/template-builder-sandbox/public/runtimeCache.js` owns
  `createRuntimeCache`, boot runtime-state creation, refresh runtime-state
  creation, change-packet validation, snapshot view-model patching, and
  packet-to-runtime application;
- `examples/template-builder-sandbox/public/app.js` now delegates boot,
  refresh, and packet apply to the runtime-cache module while keeping render,
  event binding, and draft conflict coordination in the shell;
- runtime-cache creation rebuilds the Phase 45 normalized editor view after
  boot, refresh, and packet application;
- `docs/TEMPLATE_BUILDER_RUNTIME_CACHE_MODULE_BOUNDARY.md` records the
  ownership boundary, packet apply boundary, acceptance evidence, and
  non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves `app.js` no longer owns
  `createRuntimeCache`, `replaceChangedNode`, or packet revision guards, and
  imports the browser-safe runtime-cache module in Node to apply a packet.

This phase intentionally does not implement viewport virtualization, lazy
detail routes, structural packet patching without snapshot tree patching,
production editor package structure, rich text editing, contenteditable DOM
mapping, concrete live-layout rendering, persistence, API routes, or
package/document version changes.

## Phase 47 Visible Range Boundary

Phase 47 replaces the normalized editor view's all-node visible range
placeholder with the first bounded browser-safe range contract:

- `examples/template-builder-sandbox/public/visibleRange.js` owns
  `createVisibleRange(...)`, `flowdoc-visible-range`, the default
  `section-window` range kind, anchor resolution, overscan section windows,
  `maxNodes` truncation, and range metadata;
- `examples/template-builder-sandbox/public/editorView.js` now derives
  `visibleNodeIds` from the visible-range module instead of treating every
  indexed node as visible by default;
- `examples/template-builder-sandbox/public/runtimeCache.js` carries visible
  range facts through boot, refresh, and packet application, and preserves the
  previous visible-range request across accepted packets;
- `examples/template-builder-sandbox/public/app.js` displays the range kind,
  visible node count, total node count, and visible section ids in the sandbox
  status bar;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.resolveVisibleRange` as a wired browser action lane;
- `docs/TEMPLATE_BUILDER_VISIBLE_RANGE_BOUNDARY.md` records the Phase 47
  ownership boundary, current behavior, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` imports the browser-safe
  module in Node, proves the default `section-window` range, proves explicit
  bounded section ranges, and proves runtime-cache packet application preserves
  range facts.

This phase intentionally does not implement DOM scroll tracking, viewport
measurement, actual virtualized rendering, hidden/offscreen DOM pruning, lazy
heavy-detail routes, structural packet patching without snapshot tree patching,
rich text editing, contenteditable DOM mapping, live-layout rendering,
persistence, API routes, or package/document version changes.

## Phase 48 Visible Range Request Boundary

Phase 48 separates visible range intent from resolved visible node ids:

- `examples/template-builder-sandbox/public/visibleRangeRequest.js` owns
  request source, version, reason, budget, selection, draft, and preserve
  helpers;
- `examples/template-builder-sandbox/public/visibleRange.js` now normalizes
  request records before resolving section windows;
- `examples/template-builder-sandbox/public/editorView.js` stores both
  `visibleRangeRequest` and resolved `visibleRange`;
- `examples/template-builder-sandbox/public/runtimeCache.js` exposes request
  source/reason facts and preserves the current request across packet
  application as `packet-apply`;
- `examples/template-builder-sandbox/public/app.js` sends lightweight
  selection and draft intents and displays request status;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.updateVisibleRangeRequest` as a wired browser action lane;
- `docs/TEMPLATE_BUILDER_VISIBLE_RANGE_REQUEST_BOUNDARY.md` records the Phase
  48 request boundary, current behavior, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves boot, selection,
  draft, selection-preserved, packet-apply, request budget override, and
  request/range fact separation.

This phase intentionally does not implement DOM scroll tracking, viewport
measurement, viewport controller ownership, actual virtualized rendering,
hidden/offscreen DOM pruning, lazy heavy-detail routes, structural packet
patching without snapshot tree patching, rich text editing, contenteditable DOM
mapping, live-layout rendering, persistence, API routes, or package/document
version changes.

## Phase 49 Structural Runtime Store Boundary

Phase 49 moves structural lookup indexes into their own browser-safe runtime
store:

- `examples/template-builder-sandbox/public/runtimeStore.js` owns
  `createRuntimeStore(...)`, store source/mode, node lookup, parent lookup,
  child lookup, section root lookup, and structural indexes;
- `examples/template-builder-sandbox/public/editorView.js` now consumes a
  runtime store and keeps editor-specific dirty, changed, and visible-range
  facts above it;
- `examples/template-builder-sandbox/public/runtimeCache.js` carries
  `runtimeStore`, `runtimeStoreSource`, and `runtimeStoreMode` beside
  editor-view and visible-range facts;
- `examples/template-builder-sandbox/public/app.js` displays active store mode,
  node count, and section count in the status bar;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.createStructuralRuntimeStore` as a wired browser action lane;
- `docs/TEMPLATE_BUILDER_RUNTIME_STORE_BOUNDARY.md` records the Phase 49 store
  boundary, current behavior, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves store source/mode,
  node count, section count, parent lookup, child lookup, section root lookup,
  editor-view consumption, and packet-cache store facts.

This phase intentionally does not implement direct id-based structural packet
application, persistent runtime-store storage, lazy heavy-detail routes,
viewport or scroll controllers, virtualized rendering, hidden/offscreen DOM
pruning, rich text editing, contenteditable DOM mapping, live-layout rendering,
persistence, API routes, or package/document version changes.

## Phase 50 Text Packet Store Apply Boundary

Phase 50 lets the existing bounded text-block change packets update the
browser runtime store directly:

- `examples/template-builder-sandbox/public/runtimeStore.js` owns
  `applyTextChangePacketToRuntimeStore(...)`, the `text-packet-direct` apply
  mode, store-copy node replacement, text-block validation, and structural
  child-id guards;
- `examples/template-builder-sandbox/public/runtimeCache.js` applies valid text
  packets to the previous runtime store, updates snapshot metadata separately,
  rebuilds editor-view facts over the updated store, and preserves that store
  through visible-range request changes when revisions match;
- `examples/template-builder-sandbox/public/app.js` reports the latest store
  apply mode in the status bar;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.applyTextPacketToRuntimeStore` as a wired browser action lane;
- `docs/TEMPLATE_BUILDER_TEXT_PACKET_STORE_BOUNDARY.md` records the Phase 50
  boundary, acceptance evidence, fallback behavior, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves direct store text
  packet application, structural-child rejection, packet-cache apply mode,
  metadata-only snapshot revision updates, and visible-range preservation of
  updated store text.

This phase intentionally does not implement structural add/delete/move packet
application, persistent runtime-store storage, lazy heavy-detail routes,
viewport or scroll controllers, virtualized rendering, hidden/offscreen DOM
pruning, rich text editing, contenteditable DOM mapping, live-layout rendering,
persistence, API routes, or package/document version changes.

## Phase 51 Store-Backed Render Boundary

Phase 51 makes the sandbox tree/canvas render path consume a store-backed
render model:

- `examples/template-builder-sandbox/public/renderModel.js` owns
  `createStoreBackedRenderModel(...)`, render-model source/mode, section shell
  creation, node lookup, child lookup, and section root lookup for rendering;
- `examples/template-builder-sandbox/public/app.js` creates a render model for
  each render pass and uses it for selected node reads, tree/canvas section
  roots, recursive node children, inspector child rows, and render status;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.createStoreBackedRenderModel` as a wired browser action lane;
- `docs/TEMPLATE_BUILDER_STORE_BACKED_RENDER_BOUNDARY.md` records the Phase 51
  boundary, current behavior, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves browser-safe render
  model creation, app render ownership, generated action-lane exposure, and
  post-packet render text coming from the runtime store while the tree-shaped
  metadata snapshot can still contain old text.

This phase intentionally does not implement DOM scroll tracking, viewport
measurement, virtualized rendering, hidden/offscreen DOM pruning, lazy
heavy-detail routes, structural add/delete/move packet application, rich text
editing, contenteditable DOM mapping, live-layout rendering, persistence, API
routes, or package/document version changes.

## Phase 52 Render Window Boundary

Phase 52 adds a browser-safe render-window contract between visible ranges and
the sandbox canvas render path:

- `examples/template-builder-sandbox/public/renderWindow.js` owns
  `createRenderWindow(...)`, render-window source/mode, active section ids,
  active node ids, count metadata, and membership helpers;
- `examples/template-builder-sandbox/public/renderModel.js` derives a render
  window from the runtime cache visible range and exposes windowed section root
  and child helpers beside the full store-backed render model;
- `examples/template-builder-sandbox/public/app.js` uses render-window helpers
  for canvas traversal and reports render-window counts in the status bar while
  leaving full section metadata available for navigation/debug;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.resolveRenderWindow` as a wired browser action lane;
- `docs/TEMPLATE_BUILDER_RENDER_WINDOW_BOUNDARY.md` records the Phase 52
  boundary, current behavior, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves browser-safe
  render-window ownership, generated action-lane exposure, render-model
  integration, and visible-range-derived window facts.

This phase intentionally does not implement DOM scroll tracking, viewport
measurement, virtualized renderer scheduling, hidden/offscreen DOM pruning
schedulers, lazy heavy-detail routes, structural add/delete/move packet
application, rich text editing, contenteditable DOM mapping, live-layout
rendering, persistence, API routes, or package/document version changes.

## Phase 53 Viewport Request Boundary

Phase 53 adds a DOM-free viewport request contract before scroll measurement or
virtualized rendering:

- `examples/template-builder-sandbox/public/viewportController.js` owns
  `createViewportFacts(...)`, `resolveViewportRangeRequest(...)`, viewport
  controller source/mode, anchor facts, scroll facts, overscan, budget
  normalization, and draft-preserve behavior;
- `examples/template-builder-sandbox/public/visibleRangeRequest.js` records
  `viewport` and `viewport-preserved` request reasons;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.resolveViewportRangeRequest` as a wired browser action lane;
- `docs/TEMPLATE_BUILDER_VIEWPORT_REQUEST_BOUNDARY.md` records the Phase 53
  boundary, current behavior, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves browser-safe viewport
  request ownership, generated action-lane exposure, runtime-cache/render-window
  consumption, and preserved draft range behavior.

This phase intentionally does not implement DOM scroll event binding, viewport
measurement, spacer or virtual-list rendering, scroll sync, virtualized
renderer scheduling, hidden/offscreen DOM pruning schedulers, lazy heavy-detail
routes, structural add/delete/move packet application, rich text editing,
contenteditable DOM mapping, live-layout rendering, persistence, API routes, or
package/document version changes.

## Phase 54 Render Shell Placeholder Boundary

Phase 54 adds a full-document render shell for the sandbox canvas while keeping
detailed content bounded to the active render window:

- `examples/template-builder-sandbox/public/renderShell.js` owns
  `createRenderShell(...)`, render-shell source/mode, rendered section ids,
  placeholder section ids, section counts, and section-read helpers;
- `examples/template-builder-sandbox/public/renderModel.js` derives a render
  shell after the render window and exposes shell facts beside window facts;
- `examples/template-builder-sandbox/public/app.js` iterates render-shell
  sections for the canvas, renders active-window detail, and renders lightweight
  placeholder pages for sections outside the active window;
- `examples/template-builder-sandbox/public/styles.css` adds minimal
  placeholder page styling without claiming real virtualized rendering;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.createRenderShell` as a wired browser action lane;
- `docs/TEMPLATE_BUILDER_RENDER_SHELL_BOUNDARY.md` records the Phase 54
  boundary, current behavior, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves browser-safe render
  shell ownership, generated action-lane exposure, render-model integration,
  and full-shell/active-window behavior.

This phase intentionally does not implement DOM scroll event binding, viewport
measurement, measured spacer heights, scroll sync, virtualized renderer
scheduling, hidden/offscreen DOM pruning schedulers, lazy heavy-detail routes,
structural add/delete/move packet application, rich text editing,
contenteditable DOM mapping, live-layout rendering, persistence, API routes, or
package/document version changes.

## Phase 55 Viewport Section-Shell Measurement Boundary

Phase 55 adds a bounded measurement layer between the render shell and the
existing viewport request contract:

- `examples/template-builder-sandbox/public/viewportMeasurement.js` owns
  `createViewportMeasurement(...)`, `createViewportFactsFromMeasurement(...)`,
  `resolveMeasuredViewportRangeRequest(...)`, measurement source/mode,
  section visibility facts, and anchor-section selection;
- `examples/template-builder-sandbox/public/app.js` adds `data-section-id` to
  render-shell pages, reads current page rectangles after render, delegates
  normalization to the measurement module, and reports read-only measurement
  status;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.measureViewportShell` as a wired browser action lane;
- `docs/TEMPLATE_BUILDER_VIEWPORT_MEASUREMENT_BOUNDARY.md` records the Phase
  55 boundary, current behavior, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves browser-safe
  measurement ownership, action-lane exposure, synthetic section-box anchoring,
  and reuse of the existing viewport request path.

This phase intentionally does not implement scroll event binding, automatic
visible-range switching from scroll, measured spacer heights, virtualized
renderer scheduling, hidden/offscreen DOM pruning, lazy heavy-detail routes,
structural add/delete/move packet application, rich text editing,
contenteditable DOM mapping, live-layout rendering, persistence, API routes, or
package/document version changes.

## Phase 56 Manual Viewport Measurement Apply Boundary

Phase 56 lets the sandbox manually apply the current viewport measurement to
the visible-range/render-window path:

- `examples/template-builder-sandbox/public/viewportMeasurement.js` owns
  `VIEWPORT_MEASUREMENT_APPLY_MODE` and
  `createViewportMeasurementApplyRequest(...)` as a DOM-free manual apply
  helper over measured viewport requests;
- `examples/template-builder-sandbox/public/app.js` adds an `Apply viewport`
  command, stores the latest manual apply summary, applies the resulting
  visible-range request through `runtimeCache`, and reports apply status;
- `examples/template-builder-sandbox/public/styles.css` styles the metric-strip
  apply command without changing the overall layout shell;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.applyViewportMeasurement` as a wired browser action lane;
- `docs/TEMPLATE_BUILDER_VIEWPORT_APPLY_BOUNDARY.md` records the Phase 56
  boundary, current behavior, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves manual apply ownership,
  generated action-lane exposure, source guards without scroll binding, and
  synthetic measurement-to-render-window behavior.

This phase intentionally does not implement scroll event binding, automatic
visible-range switching while scrolling, debounce/throttle scheduling, measured
spacer heights, virtualized renderer scheduling, hidden/offscreen DOM pruning,
lazy heavy-detail routes, structural add/delete/move packet application, rich
text editing, contenteditable DOM mapping, live-layout rendering, persistence,
API routes, or package/document version changes.

## Phase 57 Debounced Viewport Scroll Controller Boundary

Phase 57 adds a minimal scroll controller over the Phase 55/56 measurement and
apply contracts:

- `examples/template-builder-sandbox/public/viewportScrollController.js` owns
  `VIEWPORT_SCROLL_CONTROLLER_SOURCE`,
  `VIEWPORT_SCROLL_CONTROLLER_MODE`,
  `DEFAULT_VIEWPORT_SCROLL_DEBOUNCE_MS`,
  `createViewportScrollControllerState(...)`,
  `recordViewportScroll(...)`, and `settleViewportScroll(...)` as a DOM-free
  controller policy;
- `examples/template-builder-sandbox/public/app.js` binds the canvas `scroll`
  event, records pending movement, debounces settled scroll, applies the current
  measured section shell through the existing visible-range request path, and
  reports controller status;
- automatic scroll apply is skipped while a browser draft or IME composition is
  active;
- scroll restore after render is guarded so restoring the measured scroll
  position does not create a controller loop;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.controlViewportScroll` as a wired browser action lane;
- `docs/TEMPLATE_BUILDER_VIEWPORT_SCROLL_CONTROLLER_BOUNDARY.md` records the
  Phase 57 boundary, current behavior, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves DOM-free controller
  ownership, app-owned scroll binding, generated action-lane exposure,
  settled-scroll-to-render-window behavior, and draft/IME skip behavior.

This phase intentionally does not implement measured spacer heights, a virtual
list, continuous throttled virtualized renderer scheduling, hidden/offscreen DOM
pruning beyond the existing render shell, lazy heavy-detail routes, structural
add/delete/move packet application, rich text editing, contenteditable DOM
mapping, live-layout rendering, persistence, API routes, or package/document
version changes.

## Phase 58 Section Viewport Anchor Boundary

Phase 58 adds a section-relative viewport anchor over the Phase 55-57
measurement, apply, and scroll-controller contracts:

- `examples/template-builder-sandbox/public/viewportAnchor.js` owns
  `VIEWPORT_ANCHOR_SOURCE`,
  `VIEWPORT_SECTION_ANCHOR_MODE`,
  `VIEWPORT_SECTION_ANCHOR_RESTORE_MODE`,
  `createViewportSectionAnchor(...)`, and
  `resolveViewportSectionAnchorScrollTop(...)` as a DOM-free anchor policy;
- `examples/template-builder-sandbox/public/app.js` records
  `sectionId + offsetInSection` from current viewport measurements;
- manual viewport apply and settled viewport scroll render passes restore from
  the section anchor first, with raw `scrollTop` kept as fallback;
- render restore measures the new section shell before resolving the anchor so
  changed section positions can still produce a stable canvas scroll position;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.trackViewportAnchor` as a wired browser action lane;
- `docs/TEMPLATE_BUILDER_VIEWPORT_ANCHOR_BOUNDARY.md` records the Phase 58
  boundary, current behavior, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves DOM-free anchor
  ownership, app-owned canvas restore, generated action-lane exposure,
  section-shift restore behavior, and missing-section fallback behavior.

This phase intentionally does not implement node anchors, outline
jump-to-node, diagnostics/source jump-to-node, caret-relative text block
anchors, typing-driven live layout pushdown, measured spacer heights,
virtualized renderer scheduling, lazy heavy-detail routes, structural
add/delete/move packet application, rich text editing, contenteditable DOM
mapping, persistence, API routes, or package/document version changes.

## Phase 59 Measured Section Spacer Boundary

Phase 59 adds measured section spacer facts over the Phase 55-58 viewport
measurement, scroll, and anchor contracts:

- `examples/template-builder-sandbox/public/viewportSectionSpacers.js` owns
  `VIEWPORT_SECTION_SPACER_SOURCE`,
  `VIEWPORT_SECTION_SPACER_MODE`,
  `DEFAULT_SECTION_SPACER_HEIGHT`,
  `createViewportSectionSpacerMap(...)`, and
  `resolveViewportSectionSpacer(...)` as a DOM-free spacer policy;
- rendered section measurements update measured section heights;
- placeholder-only measurements use default or previous estimates without
  overwriting prior rendered measurements;
- `examples/template-builder-sandbox/public/app.js` keeps a browser-local
  section spacer map, updates it from viewport measurements, and writes
  `--section-spacer-height`, `data-section-spacer-height`, and
  `data-section-spacer-reason` onto section shell pages;
- `examples/template-builder-sandbox/public/styles.css` uses the spacer height
  as page and placeholder minimum height;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.trackSectionSpacers` as a wired browser action lane;
- `docs/TEMPLATE_BUILDER_SECTION_SPACER_BOUNDARY.md` records the Phase 59
  boundary, current behavior, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves DOM-free spacer
  ownership, app-owned CSS variable application, generated action-lane
  exposure, rendered-measurement updates, and placeholder-preserve behavior.

This phase intentionally does not implement a virtual list, a top-offset map
for arbitrary node windows, continuous virtualized renderer scheduling,
hidden/offscreen DOM pruning beyond the existing render shell, lazy heavy-detail
routes, node anchors, outline jump-to-node, diagnostics/source jump-to-node,
caret-relative text block anchors, typing-driven live layout pushdown,
structural add/delete/move packet application, rich text editing,
contenteditable DOM mapping, persistence, API routes, or package/document
version changes.

## Phase 60 Section Offset Prediction Boundary

Phase 60 derives a section offset index and viewport prediction from the Phase
59 spacer facts:

- `examples/template-builder-sandbox/public/viewportSectionOffsets.js` owns
  `VIEWPORT_SECTION_OFFSET_SOURCE`,
  `VIEWPORT_SECTION_OFFSET_MODE`,
  `VIEWPORT_SECTION_PREDICTION_MODE`,
  `DEFAULT_SECTION_OFFSET_GAP`,
  `createViewportSectionOffsetIndex(...)`,
  `resolveViewportSectionOffset(...)`, and
  `predictViewportFromSectionOffsets(...)` as a DOM-free offset/prediction
  policy;
- long sections are represented as `top/height/bottom` intervals, so
  predictions can report `offsetInSection`, `coveragePx`, and coverage ratios
  without assuming one section equals one viewport;
- `examples/template-builder-sandbox/public/app.js` keeps a browser-local
  offset index, updates it when spacer facts update, predicts visible sections
  from current measurement scroll facts, writes `data-section-offset-top` and
  `data-section-offset-bottom` to shell pages, and reports prediction status;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.predictViewportSections` as a wired browser action lane;
- `docs/TEMPLATE_BUILDER_SECTION_OFFSET_BOUNDARY.md` records the Phase 60
  boundary, long-section behavior, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves DOM-free offset
  ownership, generated action-lane exposure, app-owned prediction status, and
  long-section interval prediction behavior.

This phase intentionally does not implement a virtual list, render-window
scheduling from offset predictions, top/bottom spacer elements outside the
existing page shell, hidden/offscreen DOM pruning beyond the existing render
shell, lazy heavy-detail routes, node anchors, outline jump-to-node,
diagnostics/source jump-to-node, caret-relative text block anchors,
typing-driven live layout pushdown, structural add/delete/move packet
application, rich text editing, contenteditable DOM mapping, persistence, API
routes, or package/document version changes.

## Phase 61 Viewport Scheduler Candidate Boundary

Phase 61 derives observe-only scheduler candidates from the Phase 60 section
offset predictions:

- `examples/template-builder-sandbox/public/viewportSchedulerCandidate.js`
  owns `VIEWPORT_SCHEDULER_CANDIDATE_SOURCE`,
  `VIEWPORT_SCHEDULER_CANDIDATE_MODE`,
  `DEFAULT_VIEWPORT_SCHEDULER_OVERSCAN_SECTIONS`, and
  `createViewportSchedulerCandidate(...)` as a DOM-free candidate policy;
- candidates expand predicted section ids with overscan, compare those ids
  against the active render window, and report current/missing/extra section
  deltas without mutating the visible range;
- candidates classify confidence as measured, estimated, mixed, or missing
  from section offset facts;
- each candidate carries a visible-range request shape and `applyState` /
  `applyReady` flags, but the sandbox app keeps `observeOnly` behavior;
- `examples/template-builder-sandbox/public/app.js` stores the latest
  `viewportSchedulerCandidate` and reports `Viewport candidate: ...` in the
  status bar;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.planViewportCandidate` as a wired browser action lane;
- `docs/TEMPLATE_BUILDER_VIEWPORT_SCHEDULER_CANDIDATE_BOUNDARY.md` records the
  Phase 61 boundary, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves DOM-free candidate
  ownership, generated action-lane exposure, app-owned observe-only status,
  long-section overscan behavior, and non-observe readiness reporting.

This phase intentionally does not implement automatic render-window scheduling
from candidate requests, a virtual list, top/bottom spacer elements outside
the existing page shell, hidden/offscreen DOM pruning beyond the existing
render shell, lazy heavy-detail routes, node anchors, outline jump-to-node,
diagnostics/source jump-to-node, caret-relative text block anchors,
typing-driven live layout pushdown, structural add/delete/move packet
application, rich text editing, contenteditable DOM mapping, persistence, API
routes, or package/document version changes.

## Phase 62 Viewport Scheduler Apply Boundary

Phase 62 lets the sandbox manually apply a scheduler candidate through a
guarded visible-range request path:

- `examples/template-builder-sandbox/public/viewportSchedulerApply.js` owns
  `VIEWPORT_SCHEDULER_APPLY_SOURCE`, `VIEWPORT_SCHEDULER_APPLY_MODE`, and
  `createViewportSchedulerApplyRequest(...)` as a DOM-free apply gate;
- the gate blocks missing, mismatched, draft-active, composition-active,
  revision-mismatched, blocked, not-ready, and stable candidates;
- `examples/template-builder-sandbox/public/app.js` adds an `Apply candidate`
  command, creates a non-observe candidate only for that manual apply attempt,
  then applies the returned request through the existing visible-range path
  when the gate reports ready;
- scheduler apply status is tracked separately from candidate status as
  `Scheduler apply: ...`;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.applyViewportSchedulerCandidate` as a wired browser action lane;
- `docs/TEMPLATE_BUILDER_VIEWPORT_SCHEDULER_APPLY_BOUNDARY.md` records the
  Phase 62 boundary, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves DOM-free apply-gate
  ownership, generated action-lane exposure, ready/stable/blocked behavior,
  and app-owned manual apply wiring.

This phase intentionally does not implement automatic render-window scheduling
from candidates, continuous budgeted scheduling, a virtual list,
hidden/offscreen DOM pruning beyond the existing render shell, lazy
heavy-detail routes, node anchors, caret-aware anchors, structural packet
application, rich text editing, contenteditable DOM mapping, live-layout
rendering, persistence, API routes, or package/document version changes.

## Phase 63 Viewport Scheduler Runtime Boundary

Phase 63 adds a browser-safe runtime state layer around viewport scheduler
candidates before automatic scheduling is claimed:

- `examples/template-builder-sandbox/public/viewportSchedulerRuntime.js` owns
  scheduler source, mode, version, runtime state creation, candidate planning,
  and candidate apply runtime checks;
- runtime-planned candidates receive a monotonic scheduler sequence,
  deterministic request id, signature, and document/runtime revision facts;
- stale candidates are blocked before the Phase 62 apply gate can return a
  visible-range request;
- `examples/template-builder-sandbox/public/app.js` stores
  `viewportSchedulerRuntime`, reports `Scheduler runtime: ...`, and delegates
  candidate/apply policy to the runtime module while keeping DOM measurement
  and render refresh in the browser shell;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.runViewportSchedulerRuntime` as a wired browser action lane;
- `docs/TEMPLATE_BUILDER_VIEWPORT_SCHEDULER_RUNTIME_BOUNDARY.md` records the
  Phase 63 boundary, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves DOM-free runtime
  ownership, action-lane exposure, sequence/request-id planning, stale drops,
  and ready apply handoff through the Phase 62 gate.

This phase intentionally does not implement automatic render-window scheduling,
continuous background scheduling, a virtual list, hidden/offscreen DOM pruning
beyond the existing render shell, lazy heavy-detail routes, node anchors,
caret-aware anchors, structural packet application, rich text editing,
contenteditable DOM mapping, live-layout rendering, persistence, API routes, or
package/document version changes.

## Phase 64 Viewport Scheduler Automation Boundary

Phase 64 adds a budgeted automatic scheduler-apply layer before virtualized
rendering is claimed:

- `examples/template-builder-sandbox/public/viewportSchedulerAutomation.js`
  owns scheduler automation source, mode, finite default max-node budget,
  automation state creation, and budgeted runtime apply execution;
- scheduler automation plans non-observe runtime candidates and applies them
  through the Phase 63 runtime and Phase 62 apply gate;
- automation results expose applied, stable, blocked, stale, and skipped
  states without touching DOM, timers, transport, persistence, or renderer
  implementation details;
- `examples/template-builder-sandbox/public/app.js` stores
  `viewportSchedulerAutomation`, reports `Scheduler auto: ...`, and uses the
  automation path for both manual candidate apply and scroll-settled auto
  scheduling;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.autoApplyViewportScheduler` as a wired browser action lane;
- `docs/TEMPLATE_BUILDER_VIEWPORT_SCHEDULER_AUTOMATION_BOUNDARY.md` records
  the Phase 64 boundary, budget rules, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves DOM-free automation
  ownership, action-lane exposure, finite default budget, disabled skips,
  blocked draft guards, and ready visible-range request handoff.

This phase intentionally does not implement a virtual list, hidden/offscreen DOM
pruning beyond the existing render shell, lazy heavy-detail routes, node
anchors, jump-to-node, caret-aware anchors, structural packet application, rich
text editing, contenteditable DOM mapping, live-layout rendering, persistence,
API routes, or package/document version changes.

## Phase 65 Viewport Virtual Stack Boundary

Phase 65 makes the sandbox renderer consume the render shell through a
section-level virtual stack:

- `examples/template-builder-sandbox/public/viewportVirtualStack.js` owns
  virtual stack source, mode, fallback height, and `createViewportVirtualStack`;
- rendered-window sections become mounted section items while hidden shell
  sections collapse into virtual spacer items;
- spacer heights come from section offset facts so the canvas can preserve
  section-level scroll geometry without mounting every section article;
- `examples/template-builder-sandbox/public/app.js` stores
  `viewportVirtualStack`, reports `Virtual stack: ...`, renders section items as
  pages, and renders spacer items as invisible geometry blocks;
- `examples/template-builder-sandbox/public/styles.css` defines
  `.virtual-section-spacer` without presenting it as a page/card;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.virtualizeViewportSections` as a wired browser action lane;
- `docs/TEMPLATE_BUILDER_VIEWPORT_VIRTUAL_STACK_BOUNDARY.md` records the Phase
  65 boundary, geometry rules, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves DOM-free virtual stack
  ownership, action-lane exposure, app renderer consumption, hidden-section
  spacer collapse, and offset-missing fallback.

This phase intentionally does not implement lazy heavy-detail routes,
node-aware anchors, jump-to-node, recycled DOM pools, caret-aware anchoring,
structural packet application, rich text editing, contenteditable DOM mapping,
live-layout rendering, persistence, API routes, or package/document version
changes.

## Phase 66 Viewport Lazy Heavy-Detail Boundary

Phase 66 adds inactive heavy-node detail deferral inside mounted virtual
sections:

- `examples/template-builder-sandbox/public/viewportLazyDetail.js` owns lazy
  detail source, mode, default thresholds, subtree counting, active path
  protection, and `createViewportLazyDetailPlan`;
- heavy detail classification is conservative: table/columns types, many direct
  children, large subtrees, or large text;
- selected-node and active-draft ancestor paths remain materialized so editing
  and selection do not disappear behind a placeholder;
- `examples/template-builder-sandbox/public/app.js` stores
  `viewportLazyDetail`, reports `Lazy detail: ...`, and renders deferred heavy
  detail as `canvas-lazy-detail` placeholders;
- `examples/template-builder-sandbox/public/styles.css` defines the placeholder
  style without adding an async route or page-level spacer;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.lazyViewportHeavyDetail` as a wired browser action lane;
- `docs/TEMPLATE_BUILDER_VIEWPORT_LAZY_DETAIL_BOUNDARY.md` records the Phase 66
  boundary, classification rules, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves DOM-free lazy detail
  ownership, action-lane exposure, app renderer consumption, heavy node
  deferral, and active path materialization.

This phase intentionally does not implement backend/API lazy routes, async
hydration, node-aware jump-to-node, recycled DOM pools, caret-aware anchoring,
structural packet application, rich text editing, contenteditable DOM mapping,
live-layout rendering, persistence, or package/document version changes.

## Phase 67 Viewport Node Anchor Boundary

Phase 67 adds node-aware selection jump and scroll restore:

- `examples/template-builder-sandbox/public/viewportNodeAnchor.js` owns node
  anchor source, mode, restore mode, normalization, and scroll-top resolution;
- node anchors capture node id, node type, section id, and section-relative node
  offset from browser-provided rectangle facts;
- `examples/template-builder-sandbox/public/app.js` reads mounted node rects,
  creates runtime-store fallback anchors when nodes are not mounted, re-reads
  node rects after render, and restores selection jumps with node anchors;
- node-anchor status is reported as `Node anchor: ...` beside the existing
  section anchor status;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.restoreViewportNodeAnchor` as a wired browser action lane;
- `docs/TEMPLATE_BUILDER_VIEWPORT_NODE_ANCHOR_BOUNDARY.md` records the Phase 67
  boundary, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves DOM-free node-anchor
  ownership, action-lane exposure, app selection restore wiring, node anchor
  restore math, and missing-section fallback.

This phase intentionally does not implement outline jump UI, diagnostics/source
jump UI, caret-relative text anchors, backend/API routes, async lazy detail
hydration, structural packet application, rich text editing, contenteditable DOM
mapping, live-layout rendering, persistence, or package/document version
changes.

## Phase 68 Viewport Large Document Behavior Audit

Phase 68 closes the viewport/virtualization line with a composed large-document
audit before Structural Runtime work starts:

- `docs/TEMPLATE_BUILDER_VIEWPORT_LARGE_DOCUMENT_AUDIT.md` records the audit
  shape, acceptance evidence, and guardrails;
- `tests/templateBuilderSandboxBoundary.test.ts` builds a synthetic 72-section
  / 936-node viewport fixture, then composes scheduler automation,
  visible-range resolution, render-window/shell creation, virtual stack
  mounting, lazy heavy-detail planning, node-aware anchor restore, and
  jump-to-node selection range behavior;
- the audit proves the active viewport path stays bounded to 3 rendered
  sections and 39 visible nodes under an 80-node budget while off-window
  sections remain spacers/placeholders;
- inactive heavy table detail is deferred, while the active selected table path
  stays materialized;
- the audit remains shape-based and does not claim wall-clock performance,
  recycled DOM pools, async hydration, structural packet application, rich text
  editing, backend/API routes, persistence, or package/document version
  changes.

## Phase 69 Structural Projection Boundary

Phase 69 starts the Structural Runtime line with a shared derived projection
over canonical document and graph facts:

- `src/structure/projection.ts` owns
  `STRUCTURAL_PROJECTION_SOURCE`, `STRUCTURAL_PROJECTION_MODE`,
  `STRUCTURAL_PROJECTION_VERSION`, `createStructuralProjection(...)`, and the
  projection node/section/result contracts;
- `src/index.ts` exports the projection contracts through the public package
  boundary;
- each projection node carries node id/type, section/zone context, parent ref,
  depth, path, child node ids, children, nearest context, and capability facts;
- `tests/structuralProjection.test.ts` proves order/depth/parent/path/nearest
  context/capability alignment with `RelationshipGraph`, injected-graph reuse,
  and no canonical document mutation;
- `docs/TEMPLATE_BUILDER_STRUCTURAL_PROJECTION_BOUNDARY.md` records that the
  projection is a read-only working view, not a persisted schema or mutation
  authority.

This phase intentionally does not implement structural packet v1, browser
runtime-store structural apply, add/delete/move command UI, outline or
diagnostics UI, persistence, package/document schema changes, mutable
projection editing, or durable history changes.

## Phase 70 Structural Packet Contract Boundary

Phase 70 defines structural packet v1 as a foundation bridge from accepted core
operation results to future browser runtime-store apply:

- `src/structure/packet.ts` owns `STRUCTURAL_PACKET_SOURCE`,
  `STRUCTURAL_PACKET_VERSION`, `STRUCTURAL_PACKET_STAGE`,
  `createStructuralChangePacket(...)`, `validateStructuralChangePacket(...)`,
  and the packet/list-patch contracts;
- `src/index.ts` exports the packet contracts through the public package
  boundary;
- packet v1 separates node map changes (`nodesAdded`, `nodesUpdated`,
  `nodeIdsRemoved`) from ordered parent-list changes (`parentListPatches`);
- rejected packets carry diagnostics without structural changes and without
  revision advancement;
- `tests/structuralPacket.test.ts` proves insert, delete subtree, reorder,
  rejected packet, and validation behavior;
- `docs/TEMPLATE_BUILDER_STRUCTURAL_PACKET_CONTRACT_BOUNDARY.md` records the
  design rationale and growth warning that packet v1 is a foundation bridge,
  not a durable persistence, collaboration, or backend public API contract.

This phase intentionally does not implement browser runtime-store structural
apply, sandbox structural command UI, persistence, multi-user conflict
handling, offline replay, backend public API exposure, structural packet
durability guarantees, or package/document schema changes.

## Phase 71 Structural Packet Store Apply Boundary

Phase 71 lets the browser runtime store apply structural packet v1 as a local
foundation bridge:

- `examples/template-builder-sandbox/public/runtimeStoreStructuralPacket.js` owns
  `RUNTIME_STORE_STRUCTURAL_PACKET_APPLY_MODE`,
  `isStructuralChangePacket(...)`, and
  `applyStructuralChangePacketToRuntimeStore(...)`;
- structural packet apply validates source/version/stage/status/revision,
  parent-list staleness, missing parents/children, removed children, and
  post-apply index consistency before returning a new store;
- packet authored nodes are normalized into browser runtime node summaries so
  text preview/plain text, capability flags, parent, section, zone, depth,
  path, child count, and node order facts stay consumable by the sandbox;
- `examples/template-builder-sandbox/public/runtimeCache.js` routes structural
  packets through the existing packet-cache path without mutating the snapshot
  tree;
- `examples/template-builder-sandbox/public/editorView.js` now consumes both
  singular text-packet dirty scopes and array-shaped structural operation
  scopes;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.applyStructuralPacketToRuntimeStore` as a wired action lane;
- `tests/templateBuilderSandboxBoundary.test.ts` proves insert/delete direct
  store apply, stale revision rejection, cache routing, dirty/changing index
  facts, and snapshot tree immutability.

This phase intentionally does not implement structural command UI, new
add/delete/move toolbar behavior, persistence, durable structural packet
history/replay, multi-user conflict handling, offline replay, backend public
API exposure, package/document schema changes, or treating structural packet v1
as the long-term storage format.

## Phase 72 Structural Mutation Bridge Boundary

Phase 72 adds a sandbox producer for structural packet v1:

- `examples/template-builder-sandbox/src/mutationBridge.ts` adds
  `insertTextBlock(...)`, `deleteNode(...)`, `reorderNode(...)`, and
  `TemplateBuilderStructuralMutationResponse`;
- bridge structural actions call `runVNextOperation(...)` and then
  `createStructuralChangePacket(...)`, keeping core operations as the mutation
  authority;
- accepted structural operations update the in-memory canonical package and
  bridge revision before returning packet-only responses;
- rejected structural operations return rejected structural packets without
  revision advancement;
- operation scopes are adapted to live-layout dirty scopes before
  `resolveVNextLiveLayoutBoundary(...)`;
- `examples/template-builder-sandbox/scripts/serve.mjs` exposes local sandbox
  routes for insert text-block, delete node, and reorder node;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes structural
  bridge action lanes without adding visible editing controls;
- `tests/templateBuilderSandboxBoundary.test.ts` proves insert/reorder/delete
  packet responses, rejected packets, packet-only response shape, runtime cache
  apply, and snapshot tree immutability.

This phase intentionally does not implement structural toolbar UI, drag/drop
outline editing, durable structural undo/redo, persistence, backend public API
exposure, collaboration/conflict merge, offline replay, or package/document
schema changes.

## Phase 73 Structural Command UI Boundary

Phase 73 exposes bounded structural commands in the sandbox inspector:

- `examples/template-builder-sandbox/public/app.js` adds structure action state,
  target derivation, route selection, request bodies, packet apply, and
  post-command selection behavior;
- inspector controls can insert a text block inside a selected container, insert
  after a selected child, move a reorderable node up/down, and delete a
  deletable node;
- structural commands call the Phase 72 sandbox routes and reuse the existing
  `applyMutationResult(...)` packet/fallback path;
- `examples/template-builder-sandbox/public/styles.css` keeps the compact
  action grid layout bounded;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.runStructuralCommandUi`;
- `tests/templateBuilderSandboxBoundary.test.ts` proves the UI source contract,
  route usage, action catalog entry, and continued packet/runtime-cache
  behavior from Phase 72.

This phase intentionally does not implement drag/drop outline editing,
multi-select operations, durable structural undo/redo, persistence, backend
public API exposure, collaboration/conflict merge, offline replay, or
package/document schema changes.

## Phase 74 Structural Outline Jump Boundary

Phase 74 turns the existing sandbox node tree into an explicit structural
outline navigation contract:

- `examples/template-builder-sandbox/public/structuralOutlineNavigation.js`
  owns `STRUCTURAL_OUTLINE_NAVIGATION_SOURCE`,
  `STRUCTURAL_OUTLINE_NAVIGATION_MODE`, and
  `createStructuralOutlineJumpRequest(...)`;
- outline clicks now create a DOM-free jump request before delegating to the
  existing node selection, visible-range request, and node-anchor restore path;
- `examples/template-builder-sandbox/public/app.js` records browser-local
  outline jump state and reports it in the node tree panel without serializing
  it into the generated snapshot;
- `examples/template-builder-sandbox/public/styles.css` owns the bounded status
  row;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.runStructuralOutlineJump`;
- `tests/templateBuilderSandboxBoundary.test.ts` proves the module contract,
  action catalog entry, app wiring, docs, and continued DOM-free ownership.

This phase intentionally does not implement drag/drop outline editing,
multi-select structural operations, keyboard tree commands, inline outline
rename, diagnostics/source jump UI, durable structural undo/redo, persistence,
backend public API exposure, collaboration/conflict merge, offline replay, or
package/document schema changes.

## Phase 75 Structural Diagnostics Navigation Boundary

Phase 75 adds a bounded diagnostics navigation surface:

- `examples/template-builder-sandbox/public/structuralDiagnosticsNavigation.js`
  owns `STRUCTURAL_DIAGNOSTICS_NAVIGATION_SOURCE`,
  `STRUCTURAL_DIAGNOSTICS_NAVIGATION_MODE`,
  `createStructuralDiagnosticItems(...)`, and
  `createStructuralDiagnosticNavigationRequest(...)`;
- the sandbox inspector now renders snapshot diagnostics and latest packet
  issues as a bounded list;
- document-level diagnostics remain visible but non-clickable;
- node-linked issues can jump only when their `nodeId` exists in the current
  runtime node index;
- accepted diagnostic jumps reuse the Phase 74 outline/node-aware selection
  visible-range path with `selectionSource: "diagnostics"`;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.runStructuralDiagnosticsNavigation`;
- `tests/templateBuilderSandboxBoundary.test.ts` proves item normalization,
  node-linked request behavior, blocked document-level behavior, source guards,
  action catalog entry, docs, and snapshot exposure.

This phase intentionally does not implement a new diagnostics engine, key-data
or graph diagnostic semantic changes, automatic issue fixes, structural command
policy changes, persistence, backend public API exposure,
collaboration/conflict merge, offline replay, durable history, or
package/document schema changes.

## Phase 76 Structural Command Policy Boundary

Phase 76 extracts structural command policy out of the app shell:

- `examples/template-builder-sandbox/public/structuralCommandPolicy.js` owns
  `STRUCTURAL_COMMAND_POLICY_SOURCE`, `STRUCTURAL_COMMAND_POLICY_MODE`,
  `createStructuralCommandPolicy(...)`, `structuralActionRequest(...)`,
  `routeForStructuralAction(...)`, and
  `structuralSelectionAfterResult(...)`;
- insert/delete/reorder availability, guard reasons, target derivation, bridge
  route selection, request body creation, and post-result selection behavior
  are now DOM-free policy behavior;
- `examples/template-builder-sandbox/public/app.js` delegates structural
  command enablement and dispatch to the policy module instead of owning state
  shape, rendering, event binding, transport, mutation application, and command
  rules together;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.evaluateStructuralCommandPolicy`;
- `tests/templateBuilderSandboxBoundary.test.ts` proves policy evaluation,
  route/request/selection-after behavior, source guards, action catalog entry,
  docs, and continued structural bridge packet flow.

This phase intentionally does not add new structural commands, change the
Phase 72 route contract, change structural packet v1 shape, implement
drag/drop, durable structural undo/redo, persistence, backend public API
exposure, collaboration/conflict merge, offline replay, or package/document
schema changes.

## Phase 77 Structural Runtime Close Audit

Phase 77 reviews the completed Structural Runtime foundation from Phases 69-76:

- `docs/TEMPLATE_BUILDER_STRUCTURAL_RUNTIME_CLOSE_AUDIT.md` records PASS,
  FAIL/BLOCKER, RISK, UNKNOWN, must-fix-before-WYSIWYG, track-later, decision
  log, files changed, behavior changed, tests run, and intentionally not
  changed sections;
- the audit closes Structural Runtime as a usable foundation, not as production
  completion;
- the audit records that structural packet v1 remains foundation transport,
  sandbox behavior is not production integration, diagnostics jump depends on
  source-provided `nodeId`, runtime store/render model are browser truth after
  packet apply, and manual browser QA remains unrecorded;
- `README.md` and `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md` link the close
  audit before the next WYSIWYG / Editing line;
- `tests/templateBuilderSandboxBoundary.test.ts` guards the audit document and
  phase ledger entry.

This phase intentionally does not change structural packet shape, sandbox
bridge routes, runtime-store apply behavior, visible inspector behavior,
persistence, backend API, durable history, collaboration, offline replay, or
package/document schema.

## Phase 78 Draft Runtime Module Boundary

Phase 78 starts the next WYSIWYG / Editing foundation line by extracting draft
runtime policy out of the sandbox app shell:

- `examples/template-builder-sandbox/public/draftRuntime.js` owns
  `DRAFT_RUNTIME_SOURCE`, `DRAFT_RUNTIME_MODE`,
  `DRAFT_CARET_SELECTION_MODE`, draft state creation, draft active/dirty/
  commit/status helpers, guarded eligibility messaging, normalized local
  caret/selection facts, range-control state transitions, textarea selection
  and input state transitions, composition state transitions, command context,
  command readiness, and browser-local insert/replace-selection command
  application;
- `examples/template-builder-sandbox/public/app.js` imports the draft runtime
  module and remains responsible for DOM event binding, textarea selection
  writes, focus restoration, rendering, bridge fetches, packet application,
  viewport coordination, and structural coordination;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes the
  `browser.resolveDraftRuntimeState` action lane so snapshots advertise the new
  draft runtime/caret boundary;
- `docs/TEMPLATE_BUILDER_DRAFT_RUNTIME_MODULE_BOUNDARY.md` records the
  boundary, caret selection model, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves the module can run in
  Node, keeps draft selection browser-local, blocks selection/commands while
  composition is active, preserves planned rich/field commands, and keeps
  app-shell behavior delegated.

This phase intentionally does not implement contenteditable DOM mapping, rich
inline range mapping, `inline.style.patch`, field/key chips, per-keystroke core
transactions, live layout rendering during active typing, exact layout/export
readiness from drafts, durable selection persistence, production editor
integration, backend API routes, storage, collaboration, or package/document
schema changes.

## Phase 79 Text Draft Layout Push Boundary

Phase 79 gives active browser-local WYSIWYG drafts a bounded layout-preview
summary without making draft text canonical truth:

- `examples/template-builder-sandbox/public/draftLayoutPush.js` owns
  `DRAFT_LAYOUT_PUSH_SOURCE`, `DRAFT_LAYOUT_PUSH_MODE`,
  `createDraftLayoutPush(...)`, and `draftLayoutPushLabel(...)`;
- draft layout push summaries report idle/stable/preview/composing state,
  active target id, base/current document revision, text length, text delta,
  local preview text, and selection offsets;
- summaries explicitly keep `liveLayout.status = "not-requested"`,
  `liveLayout.request = null`, `exactGeneration.status = "not-run"`, and
  `localPreviewOnly = true`;
- `examples/template-builder-sandbox/public/app.js` renders
  `data-draft-layout-push` in the canvas draft footer, inspector draft panel,
  and status bar while keeping DOM, focus, fetch, packet, viewport, and
  structural coordination in the app shell;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes the
  `browser.pushTextDraftLayout` action lane;
- `docs/TEMPLATE_BUILDER_TEXT_DRAFT_LAYOUT_PUSH_BOUNDARY.md` records the
  boundary, truth model, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves the module can run in
  Node, keeps draft push summaries local, leaves live layout unrequested and
  exact generation not-run, and guards app-shell wiring.

This phase intentionally does not implement live layout rendering during active
typing, exact layout during active typing, renderer-backed measurement, line
wrapping, page breaking, page geometry, contenteditable DOM mapping, rich
inline range mapping, field/key chips, per-keystroke core transactions, durable
history or persistence, backend API routes, storage, collaboration, or
package/document schema changes.

## Phase 80 Draft IME Hardening Boundary

Phase 80 centralizes browser-local WYSIWYG draft IME guard policy without
making draft composition a package, history, renderer, or export truth:

- `examples/template-builder-sandbox/public/draftImePolicy.js` owns
  `DRAFT_IME_POLICY_SOURCE`, `DRAFT_IME_POLICY_MODE`,
  `createDraftImePolicy(...)`, and `draftImePolicyLabel(...)`;
- policy summaries report idle/ready/composing/settled state, reason,
  composition source/event/data-preview facts, target text-block id, command
  guard, range-control guard, commit guard, and bounded language profile;
- summaries explicitly keep `languageProfile = "generic-ime"` by default and
  `exactGeneration.status = "deferred-until-commit"`;
- `examples/template-builder-sandbox/public/app.js` renders
  `data-draft-ime-policy` in the canvas draft footer, inspector draft panel,
  and status bar while using the policy for draft command/range disabled state
  and commit guard messaging;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes the
  `browser.hardenDraftIme` action lane;
- `docs/TEMPLATE_BUILDER_DRAFT_IME_HARDENING_BOUNDARY.md` records the generic
  IME guard boundary, truth model, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves the module can run in
  Node, blocks draft command/range/commit affordances while composing,
  re-enables them after composition settles, keeps exact output deferred until
  commit, and guards app-shell wiring.

This phase intentionally does not implement language-specific production IME
behavior, contenteditable DOM mapping, rich inline range mapping, field/key
chips, toolbar state, durable selection persistence, per-keystroke core
transactions, live layout rendering during active typing, exact layout during
active typing, renderer-backed measurement, backend API routes, storage,
collaboration, or package/document schema changes.

## Phase 81 Rich Inline Style Patch Boundary

Phase 81 models browser-local rich inline style patch intent for selected
WYSIWYG draft ranges without applying authored inline style runs or changing
package truth:

- `examples/template-builder-sandbox/public/draftInlineStylePatch.js` owns
  `DRAFT_INLINE_STYLE_PATCH_SOURCE`, `DRAFT_INLINE_STYLE_PATCH_MODE`,
  `createDraftInlineStylePatch(...)`, and
  `draftInlineStylePatchLabel(...)`;
- style patch summaries report idle/guarded/composing/ready state, selected
  range start/end/length, bounded selected text preview, target text-block id,
  and supported mark intent for bold, italic, underline, and strikethrough;
- summaries explicitly keep `application.status = "not-applied"`,
  `coreTransaction.status = "not-run"`, `history.status = "not-recorded"`,
  `liveLayout.status = "not-requested"`, and `exactGeneration.status =
  "deferred-until-commit"`;
- `examples/template-builder-sandbox/public/app.js` renders
  `data-draft-style-patch` in the canvas draft footer, inspector draft panel,
  and status bar;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes the
  `browser.planDraftInlineStylePatch` action lane;
- `docs/TEMPLATE_BUILDER_RICH_INLINE_STYLE_PATCH_BOUNDARY.md` records the style
  patch request boundary, truth model, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves the module can run in
  Node, guards collapsed selections and active composition, reports ready
  summaries for selected ranges, leaves core/style/history/live/exact work
  unrun, and guards app-shell wiring.

This phase intentionally does not apply inline style, implement rich inline
range mapping, mutate authored inline runs, change `draftRuntime.js` command
execution, introduce toolbar buttons or toolbar state, add field/key chips,
create style-aware history records, request live layout, run exact layout,
alter renderer output, add backend API routes, add storage/collaboration
behavior, or change package/document schema.

## Phase 82 Toolbar State Boundary

Phase 82 exposes browser-local toolbar control readiness for active WYSIWYG
draft ranges without dispatching toolbar commands or detecting authored rich
inline marks:

- `examples/template-builder-sandbox/public/draftToolbarState.js` owns
  `DRAFT_TOOLBAR_STATE_SOURCE`, `DRAFT_TOOLBAR_STATE_MODE`,
  `createDraftToolbarState(...)`, and `draftToolbarStateLabel(...)`;
- toolbar summaries report idle/guarded/composing/ready state, selected range
  start/end/length, target text-block id, enabled control count, active control
  count, and style control facts for bold, italic, underline, and
  strikethrough;
- style controls explicitly keep `activeState =
  "unknown-until-rich-inline-mapping"`;
- summaries explicitly keep `commandDispatch.status = "not-wired"`,
  `coreTransaction.status = "not-run"`, `history.status = "not-recorded"`, and
  `exactGeneration.status = "deferred-until-commit"`;
- `examples/template-builder-sandbox/public/app.js` renders
  `data-draft-toolbar-state` in the canvas draft footer, inspector draft panel,
  and status bar;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes the
  `browser.resolveDraftToolbarState` action lane;
- `docs/TEMPLATE_BUILDER_TOOLBAR_STATE_BOUNDARY.md` records the toolbar state
  boundary, truth model, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves the module can run in
  Node, guards collapsed selections and active composition, enables four style
  controls for selected ranges, leaves active mark state unknown, keeps
  dispatch/core/history/exact work unrun, and guards app-shell wiring.

This phase intentionally does not dispatch toolbar commands, add visible
toolbar buttons, detect active inline marks from authored runs, apply inline
style, implement rich inline range mapping, add field/key chips, create
style-aware history records, request live layout, run exact layout, alter
renderer output, add backend API routes, add storage/collaboration behavior, or
change package/document schema.

## Phase 83 Field Chip Inline Boundary

Phase 83 surfaces catalog-backed field chip inline intent for active WYSIWYG
draft carets without inserting authored `field-ref` nodes or changing package
truth:

- `examples/template-builder-sandbox/public/draftFieldChipInline.js` owns
  `DRAFT_FIELD_CHIP_INLINE_SOURCE`, `DRAFT_FIELD_CHIP_INLINE_MODE`,
  `createDraftFieldChipInline(...)`, and `draftFieldChipInlineLabel(...)`;
- field chip summaries normalize bounded snapshot field facts, selected field
  key marking, caret insertion position, target text-block id, and chip count;
- summaries guard non-collapsed ranges with
  `range-selection-needs-inline-mapping`;
- summaries explicitly keep `command = "inline.fieldRef.insert"`,
  `insertion.status = "not-applied"`, `coreTransaction.status = "not-run"`,
  `history.status = "not-recorded"`, `liveLayout.status = "not-requested"`,
  and `exactGeneration.status = "deferred-until-commit"`;
- `examples/template-builder-sandbox/public/app.js` renders
  `data-draft-field-chip-inline` in the canvas draft footer, inspector draft
  panel, and status bar;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes the
  `browser.planDraftFieldChipInline` action lane;
- `docs/TEMPLATE_BUILDER_FIELD_CHIP_INLINE_BOUNDARY.md` records the field chip
  inline boundary, truth model, acceptance evidence, and non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves the module can run in
  Node, normalizes field catalogs, reports ready summaries for caret
  selections, guards selected ranges and active composition, leaves
  insertion/core/history/live/exact work unrun, and guards app-shell wiring.

This phase intentionally does not insert field refs, add a visible field
picker, modify draft text with chip placeholders, implement rich inline range
mapping, edit field keys, migrate key history, create style-aware history
records, request live layout, run exact layout, alter renderer output, add
backend API routes, add storage/collaboration behavior, or change
package/document schema.

## Phase 84 Style-aware History Boundary

Phase 84 groups ready rich inline draft intents into browser-local style-aware
history summaries without appending durable history or changing
`authoringHistory`:

- `examples/template-builder-sandbox/public/draftStyleHistory.js` owns
  `DRAFT_STYLE_HISTORY_SOURCE`, `DRAFT_STYLE_HISTORY_MODE`,
  `createDraftStyleHistory(...)`, and `draftStyleHistoryLabel(...)`;
- style-aware history summaries collect planned intents from ready style patch
  and field chip summaries;
- planned intent kinds cover `inline.style.patch` and
  `inline.fieldRef.insert`;
- summaries expose the active draft merge-key shape for later grouping;
- summaries explicitly keep `history.status = "not-recorded"`,
  `durableHistory.status = "not-written"`, `coreTransaction.status =
  "not-run"`, `liveLayout.status = "not-requested"`, and
  `exactGeneration.status = "deferred-until-commit"`;
- `examples/template-builder-sandbox/public/app.js` renders
  `data-draft-style-history` in the canvas draft footer, inspector draft panel,
  and status bar;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes the
  `browser.planDraftStyleHistory` action lane;
- `docs/TEMPLATE_BUILDER_STYLE_AWARE_HISTORY_BOUNDARY.md` records the
  style-aware history boundary, truth model, acceptance evidence, and
  non-goals;
- `tests/templateBuilderSandboxBoundary.test.ts` proves the module can run in
  Node, collects planned rich inline intents, keeps history unrecorded and
  durable history unwritten, blocks during composition, and guards app-shell
  wiring.

This phase intentionally does not append durable history, modify
`authoringHistory`, implement undo/redo for style changes, apply inline style,
insert field refs, create style-aware live layout invalidation, run exact
layout, alter renderer output, add backend API routes, add
storage/collaboration behavior, or change package/document schema.

## Phase 85 WYSIWYG Close Audit

Phase 85 closes the current WYSIWYG / Editing foundation pass for Phases 78-84:

- `docs/TEMPLATE_BUILDER_WYSIWYG_CLOSE_AUDIT.md` records PASS/FAIL/RISK/UNKNOWN
  status for the browser-local editing foundation;
- PASS covers the draft runtime, draft layout push, IME guard, style patch
  planning, toolbar state, field chip inline, style-aware history, app-shell
  consumption, action lanes, and boundary tests;
- FAIL / BLOCKER records no blocker for closing this foundation pass;
- RISK records that rich inline execution, toolbar dispatch, field chip
  insertion, style-aware durable history, and contenteditable/rich range
  mapping remain future work;
- UNKNOWN records production IME behavior, active mark detection, style-aware
  live layout invalidation, renderer parity, persistence, collaboration,
  backend API, and durable undo/redo;
- the audit records files changed, behavior changed, tests run, risks left, and
  intentionally-not-changed areas.

This phase intentionally does not implement new runtime behavior, package
schema changes, backend API routes, persistence, collaboration, exact renderer
adapters, export adapters, or durable history changes.

## Phase 86 Generation API Route Boundary

Phase 86 wraps the readiness-only generation runtime in a pure route-response
boundary without adding a concrete server route:

- `src/generation/apiRoute.ts` owns
  `VNEXT_GENERATION_API_ROUTE_SOURCE`, `VNEXT_GENERATION_API_ROUTE_MODE`,
  `VNEXT_GENERATION_API_ROUTE_ACTION`, and
  `createVNextGenerationApiRouteResponse(...)`;
- the adapter accepts HTTP-shaped method/body input and returns a JSON
  response envelope with `httpStatus`, no-store JSON headers, allowed methods,
  readiness result, issues, `artifact: null`, and `generatedDocument: null`;
- valid `POST` requests return `httpStatus = 200`, including valid requests
  whose readiness result is diagnostically blocked;
- invalid request or package shapes return `httpStatus = 400`;
- non-`POST` methods return `httpStatus = 405` with `allow = "POST"`;
- `src/index.ts` exports the route boundary through the public package entry;
- `docs/GENERATION_API_ROUTE_BOUNDARY.md` records the route adapter ownership,
  status mapping, truth boundary, acceptance evidence, and non-goals;
- `tests/generationApiRoute.test.ts` proves route-safe responses and guards the
  module from server frameworks, parent routes, storage, exact layout,
  measured pagination, renderer consumption, and export readiness.

This phase intentionally does not implement a concrete HTTP server route,
template id/version loading, session storage, idempotency persistence, exact
layout execution, renderer adapter output, PDF/DOCX/preview artifacts, artifact
storage, collaboration, backend authentication, rate limiting, or
package/document schema changes.

## Phase 87 Session Storage Boundary

Phase 87 prepares canonical package snapshots for future app-owned persistence
without adding a concrete storage adapter:

- `src/authoring/sessionStorage.ts` owns
  `VNEXT_SESSION_STORAGE_SOURCE`, `VNEXT_SESSION_STORAGE_MODE`, and
  `createVNextSessionStorageRecord(...)`;
- the record carries a serialized package v2/document v3 snapshot and a
  storage manifest with package id/version, document version, document
  revision, dirty-scope count, optional storage key, reason, and
  `storageStatus = "not-written"`;
- persisted-state flags explicitly mark package truth as persisted and
  selection, dirty scopes, revisions, diagnostics, graph, viewport, live
  layout, exact layout, and authoring history as not persisted;
- `src/index.ts` exports the session storage boundary through the public
  package entry;
- `docs/SESSION_STORAGE_BOUNDARY.md` records the ownership, truth boundary,
  acceptance evidence, and non-goals;
- `tests/sessionStorage.test.ts` proves canonical-only package snapshots,
  dirty-session manifest metadata, source independence from storage adapters,
  parent runtime, DOM, routes, layout, and pagination, plus README/roadmap/
  ledger traceability.

This phase intentionally does not implement filesystem/database/browser
storage, a concrete server route, template id/version loading, idempotency
persistence, durable authoring history, undo/redo persistence, offline replay,
collaboration, artifact storage, exact layout execution, renderer adapter
output, backend authentication, rate limiting, or package/document schema
changes.

## Phase 88 Durable History / Undo-redo Boundary

Phase 88 prepares authoring intent history for future durable persistence while
keeping undo/redo execution out of the core storage boundary:

- `src/authoring/durableHistory.ts` owns
  `VNEXT_DURABLE_HISTORY_SOURCE`, `VNEXT_DURABLE_HISTORY_MODE`, and
  `createVNextDurableHistorySnapshot(...)`;
- the snapshot carries JSON-cloned committed and rejected authoring intent
  records, grouped authoring history summaries, optional redo records, and a
  manifest;
- non-durable selection-only records are skipped and counted instead of being
  persisted;
- the manifest reports record counts, redo record counts, undoable counts,
  diagnostic counts, skipped non-durable counts, group counts, and
  `storageStatus = "not-written"`;
- undo/redo metadata reports can-undo/can-redo plus stack depth while keeping
  `executionStatus = "not-run"`, inverse patches `not-stored`, full package
  snapshots `false`, and selection restore `not-persisted`;
- `src/index.ts` exports the durable history boundary through the public
  package entry;
- `docs/DURABLE_HISTORY_BOUNDARY.md` records the ownership, truth boundary,
  acceptance evidence, and non-goals;
- `tests/durableHistory.test.ts` proves record cloning, non-durable filtering,
  rejected diagnostic retention, redo metadata, source independence from
  storage adapters, parent runtime, DOM, routes, transaction execution,
  operation replay, layout, and pagination, plus README/roadmap/ledger
  traceability.

This phase intentionally does not implement filesystem/database/browser
storage, a concrete server route, durable history writes, full undo/redo
execution, inverse patch generation, operation-history unification, structural
undo/redo replay, cross-session replay, focus/caret/selection restoration,
offline replay, collaboration, exact layout execution, renderer adapter output,
artifact storage, backend authentication, rate limiting, or package/document
schema changes.

## Phase 89 Key History / Migration Boundary

Phase 89 prepares key-history migration planning without mutating package,
document, registry, data, or history truth:

- `src/binding/keyHistory.ts` owns
  `VNEXT_KEY_HISTORY_SOURCE`, `VNEXT_KEY_HISTORY_MODE`, and
  `createVNextKeyHistoryMigrationPlan(...)`;
- migration intents cover `field-key.rename` and `field-type.change`;
- plans collect affected inline field-ref usage through
  `collectVNextDocumentFieldRefUsages(...)` and report affected data keys;
- validation blocks empty keys, same-key renames, missing source keys, target
  key collisions, missing type-change keys, unsupported target types, and
  non-inline type changes that would break authored field refs;
- events report planned or blocked status while keeping registry mutation,
  document field-ref mutation, data migration, and key-history writes
  not-applied/not-written;
- application status keeps registry mutation, document field-ref mutation, data
  migration, key-history writes, and package version changes not-run/false;
- `src/index.ts` exports the key history migration boundary through the public
  package entry;
- `docs/KEY_HISTORY_MIGRATION_BOUNDARY.md` records the ownership, truth
  boundary, acceptance evidence, and non-goals;
- `tests/keyHistory.test.ts` proves planned renames, blocked migration intents,
  no package truth mutation, source independence from storage adapters, parent
  runtime, DOM, routes, package parse/serialize, transactions, operations,
  layout, and pagination, plus README/roadmap/ledger traceability.

This phase intentionally does not implement key migration execution, key
history persistence, aliases, deprecated keys, external API compatibility
checks, required field policy, registry schema changes, package/document
version changes, data value migration, authored field-ref mutation, undo/redo
integration, collaboration, backend routes, storage adapters, exact layout
execution, renderer adapter output, artifact storage, or package/document
schema changes.

## Phase 90 Repeat / Collection / Form-slot Boundary

Phase 90 makes repeat, collection, and form-slot readiness explicit without
adding materialization behavior or schema changes:

- `src/binding/repeatCollectionFormSlots.ts` owns
  `VNEXT_REPEAT_COLLECTION_FORM_SLOT_SOURCE`,
  `VNEXT_REPEAT_COLLECTION_FORM_SLOT_MODE`, and
  `assessVNextRepeatCollectionFormSlotReadiness(...)`;
- collection fields are detected from the package field registry and reported
  with affected inline field-ref ids and scalar data-key presence;
- repeat regions and form slots are reported as `not-modeled`;
- submission state, repeat expansion, collection binding, form-slot
  materialization, document mutation, and package version changes are
  not-run/false;
- collection fields used as inline scalar refs are blocked before collection
  binding exists;
- collection fields supplied through the current scalar data snapshot are
  blocked before a collection payload schema exists;
- `src/index.ts` exports the repeat/collection/form-slot boundary through the
  public package entry;
- `docs/REPEAT_COLLECTION_FORM_SLOT_BOUNDARY.md` records the ownership, truth
  boundary, acceptance evidence, and non-goals;
- `tests/repeatCollectionFormSlots.test.ts` proves scalar-only readiness,
  blocked collection misuse, no package truth mutation, source independence
  from storage adapters, parent runtime, DOM, routes, package parse/serialize,
  transactions, operations, layout, and pagination, plus README/roadmap/ledger
  traceability.

This phase intentionally does not implement repeat region nodes, collection
binding, collection payload schema, form-slot schema, submission/reviewer
workflows, repeat expansion, collection row identity, item-level pagination
policy, data-source adapters, authored field-ref mutation, backend routes,
storage adapters, collaboration, exact layout execution, renderer adapter
output, artifact storage, package/document version changes, or
package/document schema changes.

## Phase 91 Submission State Boundary

Phase 91 models submission/reviewer workflow state as external metadata instead
of authored package truth:

- `src/workflow/submissionState.ts` owns
  `VNEXT_SUBMISSION_STATE_SOURCE`, `VNEXT_SUBMISSION_STATE_MODE`, and
  `createVNextSubmissionStateRecord(...)`;
- workflow statuses cover `not-started`, `draft`, `submitted`, `approved`, and
  `rejected`;
- validation blocks missing template ids, invalid document/data revisions,
  missing submission ids for submitted/reviewed states, and missing reviewer
  ids for approved/rejected states;
- scope flags keep package, document node, data snapshot, and editor session
  state out of the submission record while marking external submission state as
  true;
- application status keeps package mutation, document mutation, data mutation,
  history writes, storage writes, route dispatch, and package version changes
  not-run/not-written/false;
- `src/index.ts` exports the submission state boundary through the public
  package entry;
- `docs/SUBMISSION_STATE_BOUNDARY.md` records the ownership, truth boundary,
  acceptance evidence, and non-goals;
- `tests/submissionState.test.ts` proves submitted records, blocked incomplete
  review state, no package truth mutation, source independence from storage
  adapters, parent runtime, DOM, routes, package parse/serialize,
  transactions, operations, layout, and pagination, plus README/roadmap/ledger
  traceability.

This phase intentionally does not implement workflow storage,
submission/reviewer routes, review permissions, approval gates,
notification/audit systems, form-slot runtime, data snapshot mutation,
package/document mutation, package/document version changes, durable history
integration, collaboration, exact layout execution, renderer adapter output,
artifact storage, or package/document schema changes.

## Phase 92 Persistence Close Audit

Phase 92 closes the current Backend / API / Persistence foundation pass for
Phases 86-91:

- `docs/PERSISTENCE_CLOSE_AUDIT.md` records PASS/FAIL/RISK/UNKNOWN status for
  the route, session storage, durable history, key migration, repeat/
  collection/form-slot, and submission state boundaries;
- PASS covers `src/generation/apiRoute.ts`, `src/authoring/sessionStorage.ts`,
  `src/authoring/durableHistory.ts`, `src/binding/keyHistory.ts`,
  `src/binding/repeatCollectionFormSlots.ts`, and
  `src/workflow/submissionState.ts`;
- FAIL / BLOCKER records no blocker for closing this foundation pass;
- RISK records that storage adapters, durable replay, key migration execution,
  repeat/collection materialization, form-slot runtime, submission workflow,
  and artifact storage remain future work;
- UNKNOWN records production storage, backend auth/idempotency, collaboration,
  offline replay, renderer/artifact integration, and product workflow rules;
- the audit records files changed, behavior changed, tests run, risks left,
  and intentionally-not-changed areas;
- `tests/persistenceCloseAudit.test.ts` guards the audit sections and phase
  trail.

This phase intentionally does not implement new runtime behavior, package
schema changes, concrete backend routes, storage writes, durable replay, key
migration execution, repeat expansion, form-slot runtime, submission workflow,
exact renderer adapters, export adapters, or artifact output.

## Phase 93 PDF Renderer Adapter Boundary

Phase 93 adds the first exact-output renderer adapter contract without
rendering PDF bytes:

- `src/renderer/pdfAdapter.ts` owns
  `VNEXT_PDF_RENDERER_ADAPTER_SOURCE`,
  `VNEXT_PDF_RENDERER_ADAPTER_MODE`, and
  `createVNextPdfRendererAdapterPlan(...)`;
- the adapter consumes `VNextMeasuredRendererConsumption`, not authored
  documents;
- consumable measured render commands become JSON-serializable PDF draw
  commands with measured bounds and optional text/table metadata;
- blocked renderer consumption produces a blocked adapter plan and no draw
  commands;
- the PDF renderer contract consumes measured render commands, forbids relayout,
  and does not require authored documents for layout;
- artifact metadata remains `kind = "pdf"`, `status = "not-rendered"`,
  `bytes = null`, and `storageId = null`;
- `src/index.ts` exports the PDF adapter boundary through the public package
  entry;
- `docs/PDF_RENDERER_ADAPTER_BOUNDARY.md` records ownership, truth boundary,
  acceptance evidence, and non-goals;
- `tests/pdfRendererAdapter.test.ts` proves ready draw plans, blocked input,
  source independence from concrete PDF libraries, parent runtime, DOM, routes,
  authored document input, pagination, layout, and export readiness, plus
  README/roadmap/ledger traceability.

This phase intentionally does not implement concrete PDF rendering, PDF bytes,
PDF file writes, artifact storage, font embedding, image embedding, vector
drawing fidelity, accessibility tags, page metadata, renderer-backed text
measurement, exact layout execution, DOCX output, preview output, backend
routes, storage adapters, or package/document schema changes.

## Phase 94 DOCX Renderer Adapter Boundary

Phase 94 adds a DOCX renderer adapter contract without rendering DOCX bytes:

- `src/renderer/docxAdapter.ts` owns
  `VNEXT_DOCX_RENDERER_ADAPTER_SOURCE`,
  `VNEXT_DOCX_RENDERER_ADAPTER_MODE`, and
  `createVNextDocxRendererAdapterPlan(...)`;
- the adapter consumes `VNextMeasuredRendererConsumption`, not authored
  documents;
- consumable measured render commands become JSON-serializable DOCX assembly
  commands with measured bounds and optional text/table metadata;
- blocked renderer consumption produces a blocked adapter plan and no assembly
  commands;
- the DOCX renderer contract consumes measured render commands, forbids
  relayout, does not require authored documents for layout, and does not use
  source documents for structure in this boundary;
- artifact metadata remains `kind = "docx"`, `status = "not-rendered"`,
  `bytes = null`, and `storageId = null`;
- `src/index.ts` exports the DOCX adapter boundary through the public package
  entry;
- `docs/DOCX_RENDERER_ADAPTER_BOUNDARY.md` records ownership, truth boundary,
  acceptance evidence, and non-goals;
- `tests/docxRendererAdapter.test.ts` proves ready assembly plans, blocked
  input, source independence from concrete DOCX libraries, parent runtime, DOM,
  routes, authored document input, pagination, layout, and export readiness,
  plus README/roadmap/ledger traceability.

This phase intentionally does not implement concrete DOCX rendering, DOCX
bytes, DOCX file writes, artifact storage, style mapping, numbering,
headers/footers, table fidelity, media embedding, accessibility metadata,
renderer-backed text measurement, exact layout execution, PDF output, preview
output, backend routes, storage adapters, or package/document schema changes.

## Phase 95 Renderer-backed Text Measurement Boundary

Phase 95 adds a renderer-backed text measurement profile adapter without
implementing a concrete renderer measurement engine:

- `src/renderer/textMeasurementAdapter.ts` owns
  `VNEXT_RENDERER_TEXT_MEASUREMENT_SOURCE`,
  `VNEXT_RENDERER_TEXT_MEASUREMENT_MODE`,
  `createVNextRendererTextMeasurementProfilePlan(...)`, and
  `createVNextRendererBackedTextMeasurer(...)`;
- the profile plan records renderer engine, revision, point-unit support,
  determinism, and required capabilities for line boxes, style keys, and
  available width;
- blocked profiles cannot create a measurer when profile ids are missing, the
  profile is unavailable, output units are not points, line boxes are missing,
  style keys are unsupported, or available width is unsupported;
- nondeterministic profiles remain visible as warnings rather than silently
  passing as stable exact measurement;
- the adapter wraps an external provider behind `VNextTextMeasurer` and passes
  cache key, text hash, style key, renderer engine, and profile revision into
  the provider;
- the adapter requires input `measurementProfileId` to match the renderer-backed
  profile id so measurement cache identity cannot silently drift;
- the renderer contract consumes `vnext-text-measurement-input`, produces
  `vnext-text-measurement-draft`, uses point units, forbids document relayout,
  and does not require authored documents for layout;
- `src/index.ts` exports the renderer-backed text measurement boundary through
  the public package entry;
- `docs/RENDERER_BACKED_TEXT_MEASUREMENT_BOUNDARY.md` records ownership, truth
  boundary, acceptance evidence, and non-goals;
- `tests/rendererTextMeasurementAdapter.test.ts` proves ready profile plans,
  external provider adaptation, blocked profile behavior, cache profile-id
  alignment, source independence from concrete renderers, parent runtime, DOM,
  routes, authored document input, pagination execution, layout execution, and
  renderer consumption, plus README/roadmap/ledger traceability.

This phase intentionally does not implement a browser measurement bridge, PDF
text metrics, DOCX text metrics, canvas/headless execution, font loading, text
shaping, kerning, hyphenation, bidi shaping, measurement storage, backend
routes, renderer-backed pagination execution, exact layout execution, concrete
artifact output, or package/document schema changes.

## Phase 96 Pausable Layout Job Engine

Phase 96 adds a pausable layout job engine over layout pipeline plans without
executing concrete layout:

- `src/pagination/layoutJobEngine.ts` owns
  `VNEXT_PAUSABLE_LAYOUT_JOB_ENGINE_SOURCE`,
  `VNEXT_PAUSABLE_LAYOUT_JOB_ENGINE_MODE`, and
  `runVNextPausableLayoutJobEngineChunk(...)`;
- the engine consumes `VNextLayoutPipelinePlan.jobs`, not authored documents;
- chunks are bounded by `maxJobs` and return a JSON cursor with `jobOffset` and
  completed source item ids;
- repeated chunks can advance every plan job in dependency order while keeping
  stage counts and job results serializable;
- invalid resume cursors that skip dependency completion block with explicit
  dependency issues instead of silently running dependent work;
- the engine contract records executesConcreteLayout = `false`,
  mayRelayoutDocument = `false`, mutatesDocument = `false`, and
  storesCursor = `false`;
- `src/index.ts` exports the pausable layout job engine boundary through the
  public package entry;
- `docs/PAUSABLE_LAYOUT_JOB_ENGINE_BOUNDARY.md` records ownership, truth
  boundary, acceptance evidence, and non-goals;
- `tests/layoutJobEngine.test.ts` proves bounded pause/resume, dependency
  blocking, source independence from concrete pagination, renderer libraries,
  parent runtime, DOM, storage, authored document input, layout execution, and
  renderer consumption, plus README/roadmap/ledger traceability.

This phase intentionally does not implement concrete layout execution, text
measurement execution, table placement, deep table splitting, TOC resolution,
renderer-backed pagination execution, artifact output, backend routes, storage
adapters, cursor persistence, worker queues, cancellation runtime,
prioritization runtime, or package/document schema changes.

## Phase 97 Deep Table Split Boundary

Phase 97 adds a deep table split readiness boundary without implementing
concrete non-text table-cell splitting:

- `src/pagination/deepTableSplit.ts` owns
  `VNEXT_DEEP_TABLE_SPLIT_SOURCE`, `VNEXT_DEEP_TABLE_SPLIT_MODE`, and
  `createVNextDeepTableSplitPlan(...)`;
- the boundary consumes canonical document v3 table structure and does not
  accept legacy/prototype table shapes;
- row strategies distinguish current `text-line-range` candidates,
  `atomic-row`, `empty-row`, and `blocked-deep-content`;
- cell child policies distinguish `splittable-text`, `atomic-block`,
  `generated-atomic`, `ignored-page-break`, and `unsupported`;
- breakable rows with non-text or mixed cell children block with explicit
  deferred deep-split issues instead of being silently treated as ready;
- `allowBreak = false` rows remain explicit atomic rows even when they contain
  non-text cell children;
- the engine contract records executesPagination = `false`,
  executesConcreteLayout = `false`, mayRelayoutDocument = `false`,
  mutatesDocument = `false`, supportsTextLineSplit = `true`, and
  supportsNonTextChildSplit = `false`;
- `src/index.ts` exports the deep table split boundary through the public
  package entry;
- `docs/DEEP_TABLE_SPLIT_BOUNDARY.md` records ownership, truth boundary,
  acceptance evidence, and non-goals;
- `tests/deepTableSplit.test.ts` proves text-only readiness, mixed/non-text
  blocking, source independence from concrete pagination, renderer libraries,
  parent runtime, DOM, storage, layout execution, and renderer consumption, plus
  README/roadmap/ledger traceability.

This phase intentionally does not implement concrete deep table splitting,
non-text cell fragmentation, row group splitting, spans, border collapsing,
nested repeated content, table layout rewrite, text measurement execution,
pagination execution, renderer output, artifact output, backend routes, storage
adapters, or package/document schema changes.

## Phase 98 Final TOC / Page Resolution Boundary

Phase 98 adds post-pagination TOC/page reference resolution without executing
pagination or mutating measured output:

- `src/pagination/pageResolution.ts` owns
  `VNEXT_FINAL_PAGE_RESOLUTION_SOURCE`,
  `VNEXT_FINAL_PAGE_RESOLUTION_MODE`, and
  `resolveVNextFinalPageReferences(...)`;
- the boundary consumes canonical document v3 plus `VNextMeasuredPagination`;
- TOC entries resolve heading node id, heading text, heading level, page index,
  and page number from measured fragments;
- inline page-number status records that page-number inline output is already
  resolved inside measured pagination;
- document/pagination id mismatch blocks instead of producing stale page
  references;
- missing heading fragments produce partial resolution warnings;
- the resolution contract records mayRelayoutDocument = `false`,
  mutatesDocument = `false`, mutatesMeasuredPagination = `false`, and
  writesArtifacts = `false`;
- `src/index.ts` exports the final page resolution boundary through the public
  package entry;
- `docs/FINAL_TOC_PAGE_RESOLUTION_BOUNDARY.md` records ownership, truth
  boundary, acceptance evidence, and non-goals;
- `tests/pageResolution.test.ts` proves TOC heading page resolution,
  page-number inline status, document/pagination mismatch blocking, source
  independence from concrete pagination, renderer libraries, parent runtime,
  DOM, storage, layout execution, and renderer consumption, plus
  README/roadmap/ledger traceability.

This phase intentionally does not implement pagination execution, renderer
execution, text measurement execution, TOC text rewrite, TOC reflow, generated
document mutation, measured fragment mutation, artifact output, backend routes,
storage adapters, or package/document schema changes.

## Phase 99 Exact Output Close Audit

Phase 99 closes the current Exact Output / Renderer foundation pass for
Phases 93-98:

- `docs/EXACT_OUTPUT_CLOSE_AUDIT.md` records PASS/FAIL/RISK/UNKNOWN evidence
  for the current exact-output boundary set;
- PASS evidence cites `src/renderer/pdfAdapter.ts`,
  `src/renderer/docxAdapter.ts`, `src/renderer/textMeasurementAdapter.ts`,
  `src/pagination/layoutJobEngine.ts`, `src/pagination/deepTableSplit.ts`, and
  `src/pagination/pageResolution.ts`;
- RISK/UNKNOWN sections keep concrete PDF/DOCX renderers, renderer-backed text
  measurement engines, concrete pausable layout execution, deep non-text table
  splitting, TOC text rewrite/reflow, artifact storage, backend routes, and
  worker runtime as future work;
- files changed, behavior changed, tests run, risks left, and intentionally not
  changed sections make the handoff explicit;
- `tests/exactOutputCloseAudit.test.ts` proves the audit trail does not claim
  concrete rendering, artifact storage, backend runtime, or write behavior.

This phase intentionally does not implement runtime behavior, package/document
schema changes, parent runtime imports, legacy runtime adoption, concrete
renderer libraries, DOM/canvas/headless execution, pagination relayout,
measured pagination mutation, generated document mutation, artifact writes,
storage writes, network writes, backend routes, or worker runtime.

## Phase 100 Text Measurement Engine Spike Boundary

Phase 100 adds an executable spike planning boundary for the renderer-backed
text measurement risk without importing or executing concrete measurement
engines:

- `src/renderer/textMeasurementEngineSpike.ts` records font assets, shaping
  candidates, line-break candidates, Thai oracle candidates, profile identity
  ingredients, decision rows, blocking issues, warnings, and next steps;
- HarfBuzz can be represented as the primary shaping candidate, ICU4X as the
  deterministic primary line-break candidate, Intl.Segmenter as a comparison
  baseline, and LibThai/PyThaiNLP/AttaCut style tools as Thai oracle paths;
- the spike blocks production pagination binding, missing available fonts,
  missing or unsafe primary shaping, missing or unsafe primary line breaking,
  runtime-dependent primary line breaking, missing Thai support, and missing
  Unicode line-break policy;
- font hashes and engine revisions are part of the profile candidate identity
  so measurement cache/profile drift is visible before production use;
- `tests/textMeasurementEngineSpike.test.ts` proves ready spike planning,
  Intl.Segmenter primary blocking, production-binding blocking, font profile
  identity, source independence, and documentation trail.

This phase intentionally does not install HarfBuzz, ICU4X, Intl.Segmenter,
LibThai, PyThaiNLP, AttaCut, browser canvas, PDF/DOCX renderer libraries, font
readers, storage adapters, backend routes, workers, or legacy runtime code. It
does not read font files, relayout documents, replace measured pagination,
mutate package/document data, write artifacts, or change package/document
schema.

## Phase 101 Font Registry Spike Boundary

Phase 101 adds a pure font registry spike boundary for the Thai measurement
path before any font file operations or concrete measurement engine work:

- `src/renderer/fontRegistrySpike.ts` records font assets, source references,
  vNext target references, license facts, sha256 hash facts, supported scripts,
  style-key mappings, profile identity ingredients, and next steps;
- Sarabun and Noto Sans Thai can be represented as primary/fallback Thai font
  assets and projected into Phase 100 `measurementFontAssets`;
- old FlowDocEditor font paths are allowed only as non-canonical source
  references and are blocked if used as vNext target paths;
- available assets block without verified license facts, sha256 hashes, and
  vNext-owned package/workspace font targets;
- required style mappings block when they point at missing or unavailable font
  assets;
- `tests/fontRegistrySpike.test.ts` proves ready Thai font registration,
  Phase 100 engine-spike handoff, legacy target blocking, license/hash
  blocking, required style mapping validation, source independence, and
  documentation trail.

This phase intentionally does not copy or move font files, read font bytes,
compute hashes, import font parsers, install dependencies, bind production
pagination, replace measured pagination, mutate package/document data, write
artifacts or storage records, or change package/document schema.

## Phase 102 Font Ownership Clearing Boundary

Phase 102 clears the font ownership risk before any file operation or concrete
measurement engine work:

- `src/renderer/fontOwnership.ts` selects package font assets under
  `assets/fonts` as measurement identity and keeps browser `public/fonts` paths
  as optional mirrors only;
- old FlowDocEditor font paths may seed planned copy records only as
  non-canonical source references;
- sha256 hashes must be computed from the copied vNext-owned target files, not
  from source references or browser mirrors;
- planned copy records map source evidence paths to `package-font-asset`
  targets without copying files in this phase;
- Phase 101 registry facts now allow `package-font-asset` targets once the
  copy/hash/license facts exist;
- `tests/fontOwnership.test.ts` proves package font asset ownership, public/
  legacy root blocking, legacy target blocking, source-derived hash blocking,
  registry handoff, source independence, and documentation trail.

This phase intentionally does not copy or move font files, read font bytes,
compute hashes, mutate `package.json`, import font parsers, install
dependencies, bind production pagination, replace measured pagination, mutate
package/document data, write artifacts or storage records, or change
package/document schema.

## Phase 103 Font Asset Copy / Hash Evidence

Phase 103 performs the first vNext-owned font file operation for the Thai
measurement path:

- Sarabun Regular, Bold, Italic, and Bold Italic were copied under
  `assets/fonts/Sarabun`;
- Noto Sans Thai Regular and Bold were copied under
  `assets/fonts/Noto_Sans_Thai/static`;
- Sarabun and Noto Sans Thai OFL license files were copied under
  `assets/fonts`;
- `assets/fonts/font-assets.v1.json` records byte sizes, sha256 hashes,
  verified OFL facts, non-canonical source references, package-font-asset
  target paths, and initial style-key mappings;
- `package.json` now includes `assets` in the package file list;
- `tests/fontAssetEvidence.test.ts` recomputes hashes from copied target files,
  checks license text, validates package file metadata, and proves Phase 101
  registry plus Phase 100 engine-spike handoff without production binding.

This phase intentionally does not parse font bytes, inspect glyphs, run
rustybuzz/HarfBuzz, run ICU4X, create browser public-font mirrors, bind
production pagination, replace measured pagination, render PDF/DOCX output,
write artifacts or storage records, add backend routes, or change
package/document schema.

## Phase 104 Measurement Profile Identity Contract

Phase 104 locks deterministic `measurementProfileId` construction before
concrete text engine execution:

- `src/renderer/measurementProfileIdentity.ts` creates stable profile identity
  plans from copied font hashes, style-key mappings, shaper identity, segmenter
  identity/data, line-break policy, fallback policy, and output shape;
- profile ids change when font hashes, shaper revisions, segmenter data
  revisions, or policy inputs change;
- `Intl.Segmenter` remains valid as comparison evidence but is blocked as
  runtime-dependent primary profile truth;
- missing hashes, broken style mappings, missing engine revisions, blocked
  package boundaries, unsupported fallback policy, and production binding block;
- `tests/measurementProfileIdentity.test.ts` proves stable ids from Phase 103
  font evidence, drift-sensitive identity, blocking behavior, source
  independence, and documentation trail.

This phase intentionally does not read font files, compute hashes, import
rustybuzz/HarfBuzz/ICU4X, execute shaping or segmentation, replace measured
pagination, mutate package/document data, write artifacts or storage records,
add backend routes, or change package/document schema.

## Phase 105 Rust/WASM Text Engine Boundary Decision

Phase 105 clears the Rust/WASM package boundary for future rustybuzz + ICU4X
work:

- `src/renderer/rustWasmTextEngineBoundary.ts` records the selected external
  adapter package direction and keeps vNext core free of direct WASM/Rust
  imports;
- the future adapter must consume measurement profile identity and provide
  renderer-backed text measurement facts;
- direct core dependencies, core-owned WASM builds, missing renderer adapter
  handoff, unpinned engine/data revisions, nondeterminism, missing runtime
  targets, network runtime requirements, and production binding block;
- missing WASM digest remains a warning for the spike and must be resolved
  before production measurement;
- `tests/rustWasmTextEngineBoundary.test.ts` proves the decision, blockers,
  source independence, and documentation trail.

This phase intentionally does not create an adapter package, install Rust/JS
dependencies, build or load WASM, execute shaping or segmentation, replace
measured pagination, mutate package/document data, write artifacts or storage
records, add backend routes, or change package/document schema.

## Phase 106 Thai Corpus / Oracle Boundary

Phase 106 adds a corpus and oracle comparison boundary before executing
segmentation:

- `fixtures/thai-measurement-corpus.v1.json` records Thai, no-space Thai,
  combining mark, mixed Thai/Latin, digit, punctuation, and mixed-script
  samples;
- `src/renderer/thaiCorpusBoundary.ts` validates corpus coverage, primary
  segmenter policy, comparison segmenters, and Thai oracle candidates;
- ICU4X is recorded as the primary deterministic candidate, Intl.Segmenter as
  browser/runtime comparison baseline, and LibThai/PyThaiNLP/AttaCut as Thai
  oracle candidates;
- runtime-dependent primary segmentation, missing oracle, duplicate sample ids,
  missing samples, non-Thai locale, and missing coverage block;
- `tests/thaiCorpusBoundary.test.ts` proves fixture coverage, blockers, source
  independence, and documentation trail.

This phase intentionally does not execute ICU4X, Intl.Segmenter, LibThai,
PyThaiNLP, or AttaCut, compute expected breakpoints, shape glyphs, replace
measured pagination, mutate package/document data, write artifacts or storage
records, add backend routes, or change package/document schema.

## Phase 107 Rustybuzz Shaping Smoke Boundary

Phase 107 defines shaping smoke cases before executing rustybuzz:

- `fixtures/rustybuzz-shaping-smoke.v1.json` records initial smoke cases for
  no-space Thai, Thai combining marks, mixed Thai/Latin/digit heading text, and
  Thai currency text across Sarabun and Noto Sans Thai copied assets;
- `src/renderer/rustybuzzShapingSmoke.ts` validates stable smoke ids, stable
  measurement profile identity, external adapter placement, known copied font
  asset ids, known Thai corpus sample ids, output shape version, and required
  glyph fact coverage;
- smoke cases require glyph ids, advances, offsets, cluster maps, source text
  ranges, and line box facts;
- production binding, unstable profile identity, direct core dependency
  placement, core shaping execution, core font-file reads, core WASM imports,
  unknown references, duplicate case ids, output shape mismatch, and missing
  shaping facts block;
- `tests/rustybuzzShapingSmoke.test.ts` proves fixture readiness, blockers,
  source independence, and documentation trail.

This phase intentionally does not import rustybuzz/HarfBuzz, build or load
WASM, read font files, execute shaping, record actual glyph facts, execute
segmentation or Thai oracles, replace measured pagination, mutate
package/document data, write artifacts or storage records, add backend routes,
or change package/document schema.

## Phase 108 Text Engine Adapter SPI Boundary

Phase 108 defines the future text engine adapter SPI without implementing the
adapter:

- `src/renderer/textEngineAdapterSpi.ts` defines adapter request records,
  future adapter evidence records, glyph fact fields, line box fact fields,
  and a pure readiness planner;
- Phase 107 shaping smoke cases can be mapped into adapter requests using
  copied font asset ids, Thai corpus sample text, stable measurement profile
  identity, and a positive available width;
- the selected contract keeps glyph facts on a
  `glyph-facts-separate-from-pagination-draft` evidence lane and defers the
  pagination-facing line draft to a later
  `derive-line-draft-from-accepted-evidence` mapper;
- production binding, unstable measurement profile identity, direct core
  dependency placement, core engine/WASM imports, core font-file reads, core
  shaping/segmentation execution, missing engine revisions, nondeterminism,
  unknown references, missing shaping facts, and bad request widths block;
- `tests/textEngineAdapterSpi.test.ts` proves smoke-to-request mapping,
  blockers, evidence-lane separation, source independence, and documentation
  trail.

This phase intentionally does not create an adapter package, install Rust/JS
dependencies, build or load WASM, execute shaping or segmentation, read font
files, capture real glyph evidence, mutate `VNextTextMeasurementDraft`, replace
measured pagination, mutate package/document data, write artifacts or storage
records, add backend routes, or change package/document schema.

## Phase 109 Text Engine Evidence Acceptance Boundary

Phase 109 validates adapter evidence before pagination draft handoff:

- `src/renderer/textEngineEvidenceAcceptance.ts` accepts or blocks text engine
  adapter evidence as data, not as engine execution;
- accepted evidence must match the original adapter request, measurement
  profile id, output shape version, expected engine revisions, deterministic
  engine flag, glyph facts, line box facts, and line glyph coverage;
- production binding, core engine execution, pagination draft mutation,
  request/profile/output/engine mismatch, missing glyphs or line boxes,
  malformed glyph facts, malformed line box facts, and incomplete line glyph
  coverage block;
- accepted evidence remains on the glyph fact evidence lane and reports
  `producesMeasurementDraft: false`;
- `tests/textEngineEvidenceAcceptance.test.ts` proves accepted evidence,
  blockers, source independence, and documentation trail.

This phase intentionally does not create an adapter package, install Rust/JS
dependencies, build or load WASM, execute shaping or segmentation, read font
files, capture real glyph evidence, create pagination drafts, replace measured
pagination, mutate package/document data, write artifacts or storage records,
add backend routes, or change package/document schema.

## Phase 110 Text Engine Measurement Draft Handoff Boundary

Phase 110 maps accepted evidence into the existing pagination-facing draft:

- `src/renderer/textEngineMeasurementDraftHandoff.ts` derives
  `VNextTextMeasurementDraft` lines and line boxes from accepted text engine
  evidence plus the original adapter request text;
- glyph facts remain on the separate evidence lane and are not attached to
  `VNextTextMeasurementDraft`;
- production binding, non-accepted evidence, missing accepted evidence, request
  or profile mismatch, unsafe handoff policy, engine execution, evidence
  mutation, glyph-fact attachment, pagination measurer replacement, malformed
  line ranges, and invalid line metrics block;
- `tests/textEngineMeasurementDraftHandoff.test.ts` proves successful handoff,
  blockers, source independence, and documentation trail.

This phase intentionally does not create an adapter package, install Rust/JS
dependencies, build or load WASM, execute shaping or segmentation, read font
files, capture real glyph evidence, attach glyph facts to the draft, bind
production measurement, replace measured pagination, mutate package/document
data, write artifacts or storage records, add backend routes, or change
package/document schema.

## Phase 111 Text Engine Adapter Lane Close Audit

Phase 111 closes the core-side text engine adapter/evidence lane foundation:

- `docs/TEXT_ENGINE_ADAPTER_LANE_CLOSE_AUDIT.md` records PASS, FAIL / BLOCKER,
  RISK, UNKNOWN, files changed, behavior changed, tests run, risks left, and
  intentionally not changed for Phases 104-110;
- the audit confirms the core now has a pure contract lane from measurement
  profile identity through adapter request, evidence acceptance, and
  measurement draft handoff;
- glyph facts remain separate evidence and are not part of
  `VNextTextMeasurementDraft`;
- remaining work is explicitly external adapter implementation, pinned
  rustybuzz/ICU4X/WASM artifacts, real glyph evidence capture, Thai oracle
  comparison, cross-runtime determinism proof, renderer-backed provider wiring,
  and caret/selection cluster-map consumers;
- `tests/textEngineAdapterLaneCloseAudit.test.ts` proves the audit trail.

This phase intentionally does not add runtime behavior, create an adapter
package, install Rust/JS dependencies, build or load WASM, execute shaping or
segmentation, read font files, capture real glyph evidence, bind production
measurement, replace measured pagination, mutate package/document data, write
artifacts or storage records, add backend routes, or change package/document
schema.

## Phase 112 Text Engine Adapter Package Scaffold

Phase 112 creates the external text engine adapter package scaffold:

- `packages/text-engine-rust-wasm` declares `@flowdoc/text-engine-rust-wasm`
  as the future adapter package;
- `packages/text-engine-rust-wasm/src/index.ts` consumes public
  `@flowdoc/vnext-core` contracts with type-only imports and returns
  deterministic mock `VNextTextEngineAdapterEvidence`;
- root and package TypeScript configs resolve the public `@flowdoc/vnext-core`
  package name for local type-checks without making core import the adapter
  back;
- Phase 108 requests can flow through the scaffold, Phase 109 can accept the
  mock evidence, and Phase 110 can derive a draft from it;
- the root core `src/**` does not import the adapter package back;
- production binding, real rustybuzz/HarfBuzz/ICU4X/WASM execution, font-file
  reads, and pagination measurer replacement remain blocked;
- `tests/textEngineAdapterPackageScaffold.test.ts` proves package scaffold
  behavior, blockers, boundary independence, and documentation trail.

This phase intentionally does not install Rust/JS dependencies, build or load
WASM, execute shaping or segmentation, read font files, capture real glyph
evidence, bind production measurement, replace measured pagination, mutate
package/document data, write artifacts or storage records, add backend routes,
or change package/document schema.

## Phase 113 Text Engine Rustybuzz Smoke Package Boundary

Phase 113 adds the first real rustybuzz execution path inside the external
adapter package:

- `packages/text-engine-rust-wasm/rust-shaper` owns a package-local Rust smoke
  crate named `flowdoc-rustybuzz-smoke`;
- the smoke crate pins `rustybuzz = "=0.20.1"`;
- the smoke CLI reads an explicit copied vNext font path, shapes supplied text,
  and prints raw glyph ids, clusters, advances, offsets, glyph count, and
  units-per-em as JSON;
- a package-local raw smoke-output fixture records the successful Sarabun run
  for review without treating those glyphs as accepted FlowDoc evidence;
- `packages/text-engine-rust-wasm/package.json` exposes bounded
  `rustybuzz:smoke` and `rustybuzz:build` commands;
- the TypeScript adapter remains mocked and the core package still does not
  import the adapter package, rustybuzz, WASM, or font-file access;
- WASM build/loading remains a separate gap because this workstation currently
  has `cargo`/`rustc` but no `wasm-pack` or `wasm-bindgen` on `PATH`;
- `tests/textEngineRustybuzzSmokePackage.test.ts` proves package ownership,
  root dependency independence, blocker documentation, and phase trail.

This phase intentionally does not execute ICU4X, build or load WASM, map raw
rustybuzz clusters into accepted FlowDoc evidence, bind production measurement,
replace measured pagination, mutate package/document data, write artifacts or
storage records, add backend routes, or change package/document schema.

## Phase 114 Text Engine Rustybuzz Raw Mapping Boundary

Phase 114 converts raw rustybuzz smoke output into FlowDoc adapter evidence:

- `packages/text-engine-rust-wasm/src/rustybuzzRawMapping.ts` owns the raw
  mapping behavior separately from the mock adapter scaffold;
- raw UTF-8 byte clusters are mapped into UTF-16 text ranges before becoming
  `clusterStartOffset` and `clusterEndOffset`;
- raw font-unit advances and offsets are scaled to point units by
  `fontSizePt / unitsPerEm`;
- the mapper validates request text/font, shaper revision, glyph count, UTF-8
  byte length, scalar count, glyph ids, advances, offsets, and cluster
  boundaries before producing evidence;
- the mapped Sarabun smoke fixture passes Phase 109 evidence acceptance while
  still emitting a missing-WASM-digest warning;
- unsafe cluster boundaries, mismatched font ids, mismatched shaper revisions,
  nondeterministic engines, glyph count mismatches, and production binding are
  blocked;
- the core package still does not import the adapter package, rustybuzz, WASM,
  or font-file access;
- `tests/textEngineRustybuzzRawMapping.test.ts` proves mapping, blockers,
  package independence, and documentation trail.

This phase intentionally does not execute ICU4X, build or load WASM, run
browser/worker loaders, perform multi-line wrapping, compare Thai oracle line
breaks, bind production measurement, replace measured pagination, mutate
package/document data, write artifacts or storage records, add backend routes,
or change package/document schema.

## Phase 115 Text Engine Rustybuzz Smoke Corpus Boundary

Phase 115 expands native rustybuzz smoke coverage across every Phase 107 smoke
case:

- raw rustybuzz fixtures now cover Sarabun regular greeting, Sarabun regular
  combining marks, Sarabun bold mixed heading text, and Noto Sans Thai currency
  fallback text;
- `packages/text-engine-rust-wasm/fixtures/rustybuzz-native-smoke.corpus.v1.json`
  lists one raw output fixture per Phase 107 case;
- `packages/text-engine-rust-wasm/src/rustybuzzSmokeCorpus.ts` builds adapter
  requests from Phase 107 cases plus Thai corpus samples and maps each raw
  output through Phase 114;
- the corpus harness records case, sample, font, style, glyph, zero-advance,
  and repeated-cluster coverage;
- every mapped case passes Phase 109 evidence acceptance while keeping
  missing-WASM-digest warnings visible;
- partial or duplicate corpus evidence is blocked;
- the core package still does not import the adapter package, rustybuzz, WASM,
  or font-file access;
- `tests/textEngineRustybuzzSmokeCorpus.test.ts` proves corpus mapping,
  acceptance, blockers, package independence, and documentation trail.

This phase intentionally does not execute ICU4X, build or load WASM, run
browser/worker loaders, perform native/WASM parity comparison, perform
multi-line wrapping, compare Thai oracle line breaks, bind production
measurement, replace measured pagination, mutate package/document data, write
artifacts or storage records, add backend routes, or change package/document
schema.

## Phase 116 WYSIWYG Re-entry Audit

Phase 116 re-enters the WYSIWYG / Editing lane after the text-engine work:

- `docs/TEMPLATE_BUILDER_WYSIWYG_REENTRY_AUDIT.md` connects the Phase 85
  WYSIWYG foundation close audit with the Phase 113-115 rustybuzz evidence
  lane;
- PASS confirms draft runtime, layout preview, IME guard, style planning,
  toolbar state, field-chip planning, and style-aware history modules remain
  the browser-local foundation;
- RISK records that textarea/plain-text editing, planning-only rich inline
  summaries, `app.js` surface coordination, contenteditable range drift, and
  native-only text-engine evidence are still future production risks;
- UNKNOWN records production IME behavior, active rich-inline mark detection,
  exact renderer/export parity, durable undo/redo grouping, collaboration, and
  persistence behavior;
- phase cards for Phases 117-120 define contenteditable DOM range mapping,
  rich inline range patch execution, toolbar command dispatch, and field chip
  insert execution boundaries;
- tests guard that the audit does not claim runtime behavior, package mutation,
  history writes, live layout, exact output, contenteditable execution, or WASM
  execution.

This phase intentionally does not implement contenteditable runtime behavior,
rich inline execution, toolbar dispatch, field chip insertion, package/document
schema changes, parent runtime imports, legacy runtime adoption, package
mutation, history writes, live layout requests, exact renderer output, backend
routes, persistence, collaboration, or WASM execution.

## Phase 117 Contenteditable Range Mapping Boundary

Phase 117 adds the first managed WYSIWYG re-entry implementation card after the
Phase 116 audit:

- `examples/template-builder-sandbox/public/draftContenteditableRangeMapping.js`
  owns a browser-safe mapper from bounded segment facts to FlowDoc UTF-16 draft
  ranges;
- the mapper reports `utf16-code-unit-offset` ranges and blocks styled runs,
  atomic inline/field-chip segments, segment coverage drift, text mismatch, and
  invalid endpoint facts before rich inline execution;
- `examples/template-builder-sandbox/public/app.js` wires the mapper into the
  existing draft sync path and surfaces `data-draft-contenteditable-range` in
  the canvas draft footer, inspector, and status bar;
- `examples/template-builder-sandbox/src/coreBoundary.ts` adds
  `browser.mapContenteditableRange` as a wired browser-local action lane;
- tests execute ready, composing, styled-run, atomic-inline, and text-mismatch
  paths while proving package mutation, durable history, live layout, exact
  output, and text-engine execution stay off.

This phase intentionally does not replace the textarea with a production
contenteditable surface, bind the DOM `Range` API inside the mapper, apply rich
inline style runs, insert field refs, dispatch toolbar commands, mutate package
state, write durable history, request live layout, run exact output, add backend
routes, add persistence, add collaboration behavior, or execute WASM/text-engine
measurement.

## Phase 118 Rich Inline Patch Execution Boundary

Phase 118 consumes the Phase 117 mapped range and Phase 81 style intent:

- `examples/template-builder-sandbox/public/draftRichInlinePatchExecution.js`
  owns a browser-safe executor that records local styled-run facts for ready
  selected ranges;
- the executor preserves plain draft text while recording mark, enabled state,
  UTF-16 range, selected text preview, and source command;
- unready style/range inputs remain guarded, target mismatches and unsupported
  marks are blocked, and IME composition keeps execution in composing state;
- `examples/template-builder-sandbox/public/app.js` surfaces
  `data-draft-rich-inline-execution` in the canvas draft footer, inspector, and
  status bar;
- `examples/template-builder-sandbox/src/coreBoundary.ts` adds
  `browser.executeRichInlinePatch` as a wired browser-local action lane;
- tests prove applied, guarded, blocked, and composing paths while package
  mutation, core transactions, durable history, live layout, exact output,
  backend API calls, and text-engine execution stay deferred/off.

This phase intentionally does not wire visible toolbar commands, insert field
chips, merge overlapping styled runs, mutate canonical package state, write
durable history, request live layout, run exact output, add backend routes,
add persistence, add collaboration behavior, or execute WASM/text-engine
measurement.

## Phase 119 Toolbar Command Dispatch Boundary

Phase 119 wires visible draft toolbar commands through the Phase 118 executor:

- `examples/template-builder-sandbox/public/draftToolbarCommandDispatch.js`
  owns a browser-safe dispatcher for style toolbar commands;
- inspector draft controls render `data-draft-toolbar-command` buttons for
  supported style marks and dispatch results surface through
  `data-draft-toolbar-dispatch`;
- dispatch requires ready toolbar control state and rich inline execution for
  the selected mark;
- active mark state remains explicit and guarded as
  `unknown-until-rich-inline-mapping`;
- unsupported marks, collapsed ranges, unready rich inline execution, inactive
  drafts, and IME composition are guarded or blocked explicitly;
- tests prove ready, dispatched, rich-inline-blocked, control-blocked,
  unsupported, composing, and idle paths while package mutation, core
  transactions, durable history, live layout, exact output, backend API calls,
  and text-engine execution stay deferred/off.

This phase intentionally does not implement field chip insertion, production
toolbar placement, active mark detection, toggle/merge semantics, canonical
inline mutation, durable history writes, live layout, exact output, backend
routes, persistence, collaboration behavior, or WASM/text-engine measurement.

## Phase 120 Field Chip Insert Execution Boundary

Phase 120 executes field chip intent into browser-local atomic chip facts:

- `examples/template-builder-sandbox/public/draftFieldChipInsertExecution.js`
  owns a browser-safe executor for mapped caret field chip insertion;
- the executor consumes Phase 117 caret mapping and Phase 83 field chip intent;
- ready inserts record atomic chip facts with field key, label, type, data
  status, usage count, placeholder, position, and source command;
- plain draft text is preserved and existing browser-local styled runs can be
  carried forward;
- non-collapsed ranges, missing field catalogs, unsupported rich inline state,
  inactive drafts, and IME composition are guarded or blocked explicitly;
- `examples/template-builder-sandbox/public/app.js` surfaces
  `data-draft-field-chip-insert`;
- `examples/template-builder-sandbox/src/coreBoundary.ts` adds
  `browser.executeDraftFieldChipInsert`;
- tests prove inserted, no-field, non-collapsed, unsupported-rich-inline,
  composing, and idle paths while package mutation, key migration, core
  transactions, durable history, live layout, exact output, backend API calls,
  and text-engine execution stay deferred/off.

This phase intentionally does not implement canonical field-ref insertion, key
migration writes, production field picker UI, mixed rich inline normalization,
durable history writes, live layout, exact output, backend routes, persistence,
collaboration behavior, or WASM/text-engine measurement.

## Phase 121 WYSIWYG Execution Re-baseline Audit

Phase 121 closes the first WYSIWYG execution pass after Phases 117-120:

- `docs/TEMPLATE_BUILDER_WYSIWYG_EXECUTION_REBASELINE_AUDIT.md` records PASS,
  FAIL/BLOCKER, RISK, and UNKNOWN status for the browser-local execution
  evidence built in Phases 117-120;
- PASS confirms the contenteditable range mapper, rich inline patch executor,
  toolbar command dispatcher, and field chip insert executor are browser-safe
  and covered by sandbox boundary tests;
- RISK records that the active surface remains textarea-driven, styled runs and
  atomic chips are not yet a unified rich inline draft model, active mark
  detection/toggle semantics are unknown, and canonical field-ref/package
  commits remain future work;
- UNKNOWN records production DOM segment capture, mixed inline normalization,
  canonical transaction layering, renderer/text-engine participation,
  undo/redo, collaboration, and persistence behavior;
- phase cards for Phases 122-126 define browser-local rich inline state,
  production contenteditable segment capture, canonical commit planning, rich
  inline commit bridge execution, and a close audit.

This phase intentionally does not add runtime behavior, production
contenteditable DOM binding, canonical rich inline commit, field-ref insertion,
key migration writes, package/document schema changes, parent runtime imports,
legacy runtime adoption, durable history writes, live layout requests, exact
renderer output, backend routes, persistence, collaboration, or WASM execution.

## Phase 122 Browser-local Rich Inline State Boundary

Phase 122 consolidates the browser-local WYSIWYG execution facts from Phases
118-120:

- `examples/template-builder-sandbox/public/draftRichInlineState.js` owns the
  browser-safe rich inline state normalizer;
- the normalizer consumes styled-run facts, toolbar patch results, and atomic
  field-chip facts while preserving active draft plain text;
- styled runs and atomic chips are deterministically ordered by UTF-16
  positions before canonical commit planning;
- overlapping style runs, duplicate/ambiguous chips, target drift, text drift,
  invalid ranges, invalid chip positions, and chip/style interior ambiguity are
  blocked explicitly;
- `examples/template-builder-sandbox/public/app.js` surfaces
  `data-draft-rich-inline-state`;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.normalizeDraftRichInlineState`;
- `tests/templateBuilderSandboxBoundary.test.ts` proves idle, text-only, ready
  style-plus-chip, overlapping-style blocked, and composing paths.

This phase intentionally does not implement production contenteditable DOM
segment capture, canonical rich inline commit, canonical field-ref insertion,
key migration writes, package/document schema changes, durable history writes,
live layout requests, exact renderer output, backend routes, persistence,
collaboration behavior, ICU4X execution, or WASM/text-engine measurement.

## Phase 123 Contenteditable Segment Capture Boundary

Phase 123 inserts a bounded browser-local capture step before Phase 117 range
mapping:

- `examples/template-builder-sandbox/public/draftContenteditableSegmentCapture.js`
  owns the contenteditable-style segment capture contract;
- the capture boundary accepts explicit surface segment facts or DOM-like
  `childNodes`/`children` from a contenteditable root;
- it normalizes plain text, styled-run marks, atomic field-chip metadata,
  UTF-16 draft offsets, and selection endpoints into the Phase 117 mapper
  shape;
- it blocks missing surfaces, non-contenteditable roots, target drift, text
  drift, unsupported segment kinds, invalid segment ranges, missing atomic
  field keys, missing selection endpoints, and out-of-range offsets;
- `examples/template-builder-sandbox/public/app.js` surfaces
  `data-draft-contenteditable-segment-capture` and maintains a hidden
  contenteditable-style capture surface for active drafts;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.captureContenteditableSegments`;
- `tests/templateBuilderSandboxBoundary.test.ts` proves ready plain capture,
  DOM-like styled/atomic capture, range-mapper handoff, blocked root/text/target
  cases, and composition guard behavior.

This phase intentionally does not implement production contenteditable DOM
binding, rich inline range mapping for styled/atomic nodes, canonical rich
inline commit, canonical field-ref insertion, key migration writes,
package/document schema changes, durable history writes, live layout requests,
exact renderer output, backend routes, persistence, collaboration behavior,
ICU4X execution, or WASM/text-engine measurement.

## Phase 124 Rich Inline Commit Planning Boundary

Phase 124 maps browser-local rich inline draft state into canonical vNext commit
facts without executing mutation:

- `examples/template-builder-sandbox/public/draftRichInlineCommitPlan.js` owns
  the browser-safe planning contract;
- the planner consumes Phase 122 `browserRichInlineState` records;
- text segments become planned canonical `text` inline children with vNext style
  objects for bold, italic, underline, and strikethrough;
- atomic chip segments become planned canonical `field-ref` inline children
  with key, label, and fallback metadata;
- the plan records the intended `text-block.rich-inline.replace` operation,
  dirty-scope requirement, history intent, key-history check, renderer
  invalidation, live-layout invalidation, and exact-output stale marker;
- stale revision, non-ready rich state, target drift, text drift, unsupported
  overlap, missing field keys, unsupported style marks, invalid segment ranges,
  and segment text mismatch are blocked;
- `examples/template-builder-sandbox/public/app.js` surfaces
  `data-draft-rich-inline-commit-plan`;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.planRichInlineCommit`;
- `tests/templateBuilderSandboxBoundary.test.ts` proves planned style+field
  commits, text-only commits, stale revision blocking, text mismatch blocking,
  missing field-key blocking, overlap blocking, and composition guard behavior.

This phase intentionally does not execute package mutation, canonical field-ref
insertion, key migration writes, package/document schema changes, durable
history writes, live layout requests, exact renderer output, backend routes,
persistence, collaboration behavior, ICU4X execution, or WASM/text-engine
measurement.

## Phase 125 Rich Inline Commit Bridge Boundary

Phase 125 executes the first bounded canonical rich inline commit path:

- `src/authoring/richInlineCommit.ts` owns `runVNextRichInlineCommit(...)` and
  `createVNextRichInlineCommitHistoryRecord(...)`;
- the core helper validates vNext inline children, rejects duplicate inline ids
  and unsupported targets, replaces text-block inline children, rebuilds graph
  and projection facts, returns text-block dirty scope, records field-ref
  key-history facts, and marks exact output stale through render invalidation;
- `src/authoring/intentHistory.ts` now allows
  `text-block.rich-inline.replace` history-ready command records;
- `examples/template-builder-sandbox/src/mutationBridge.ts` exposes
  `commitRichInline(...)`, accepts only Phase 124 planned
  `text-block.rich-inline.replace` plans, rejects stale revisions, appends the
  rich history record, updates the in-memory package, increments document
  revision, and returns bounded change packets;
- `examples/template-builder-sandbox/scripts/serve.mjs` exposes
  `/api/actions/commit-rich-inline`;
- `examples/template-builder-sandbox/public/app.js` adds a separate
  `commit-rich-inline` draft action without changing the plain draft commit
  path;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `sandbox.commitRichInlineDraft`;
- `tests/richInlineCommit.test.ts` proves core replacement, history-ready
  records, dirty scope, key-history facts, render invalidation, duplicate-id
  rejection, unsupported-target rejection, and DOM/package independence;
- `tests/templateBuilderSandboxBoundary.test.ts` proves bridge success,
  stale-plan rejection, invalid-plan rejection, bounded packets, history-ready
  summaries, and live/exact invalidation summaries.

This phase intentionally does not add package/document schema changes, parent
editor imports, legacy runtime adoption, rich undo/redo replay, durable
persistence writes, collaboration behavior, renderer artifact output, ICU4X
execution, or WASM/text-engine measurement replacement.

## Phase 126 WYSIWYG Execution Close Audit

Phase 126 closes the Phase 122-125 WYSIWYG execution foundation pass:

- `docs/TEMPLATE_BUILDER_WYSIWYG_EXECUTION_CLOSE_AUDIT.md` records PASS,
  FAIL/BLOCKER, RISK, UNKNOWN, recommended next cards, files changed,
  behavior changed, tests run, risks left, and intentionally not changed;
- PASS confirms rich inline state normalization, contenteditable segment
  capture, canonical commit planning, and the vNext-native rich inline commit
  bridge;
- FAIL/BLOCKER confirms no blocker prevents closing the foundation pass, while
  explicitly refusing to call production WYSIWYG complete;
- RISK keeps rich undo/redo replay, full inline replacement versus granular
  transactions, production DOM range/caret/IME hardening, durable key history,
  exact renderer parity, persistence, and collaboration open;
- UNKNOWN records the remaining operation-shape, replay, contenteditable,
  collaboration, and text-engine participation questions;
- next cards are Phase 127 rich undo/redo replay, Phase 128 production
  contenteditable surface hardening, Phase 129 rich inline persistence/session,
  and Phase 130 rich inline live/exact parity audit;
- `tests/wysiwygExecutionCloseAudit.test.ts` proves the audit cites Phase
  122-125 docs, code, tests, risks, and phase-trail updates.

This phase intentionally does not add runtime behavior, package/document schema
changes, parent editor imports, legacy runtime adoption, durable persistence
writes, collaboration behavior, renderer artifact output, ICU4X execution, or
WASM/text-engine measurement replacement.

## Phase 127 Rich Inline Undo/Redo Replay Boundary

Phase 127 makes accepted rich inline commits replayable through the sandbox
undo/redo bridge:

- `examples/template-builder-sandbox/src/mutationBridge.ts` stores undo/redo
  patches as a union of plain text patches and rich inline before/after inline
  children;
- accepted rich inline commits capture the original text-block children and the
  committed rich inline children after `runVNextRichInlineCommit(...)`
  succeeds;
- rich undo/redo replay uses `runVNextRichInlineCommit(...)` directly instead
  of routing styled text or field chips through the plain text transaction
  boundary;
- replay updates the in-memory package, document revision, mutation count,
  bounded change packet, dirty scope, and live/exact invalidation summary;
- plain text undo/redo behavior remains covered by its existing packet
  regression test;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `sandbox.replayRichInlineHistory`;
- `docs/TEMPLATE_BUILDER_RICH_INLINE_UNDO_REDO_REPLAY_BOUNDARY.md` records
  PASS, FAIL/BLOCKER, RISK, UNKNOWN, files changed, behavior changed, tests run,
  risks left, and intentionally not changed;
- `tests/templateBuilderSandboxBoundary.test.ts` proves rich commit -> undo ->
  redo packet behavior, action-lane exposure, bridge-source guardrails, and the
  unchanged plain text undo/redo path.

This phase intentionally does not add package/document schema changes, parent
editor imports, legacy runtime adoption, durable persistence/session writes,
collaboration behavior, renderer artifact output, ICU4X execution, or
WASM/text-engine measurement replacement.

## Phase 128 Production Contenteditable Surface Hardening Boundary

Phase 128 hardens the browser-local production contenteditable surface before
it becomes the primary editing input:

- `examples/template-builder-sandbox/public/draftContenteditableSurfaceHardening.js`
  owns `createDraftContenteditableSurfaceHardening(...)` and the label helper;
- the hardening layer consumes Phase 123 segment capture and Phase 117 range
  mapping summaries without mutating package state;
- nested DOM-like selection endpoints resolve back to segment id, UTF-16
  offset, absolute draft value, direction, collapsed state, and caret affinity;
- root id drift, target drift, plain text drift, selection drift, segment
  capture readiness, range mapper status, and IME composition are recorded as
  explicit guards;
- styled-run content can still harden the surface even when the older plain
  range mapper blocks styled ranges;
- `examples/template-builder-sandbox/public/app.js` exposes
  `data-draft-contenteditable-surface-hardening`;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.hardenContenteditableSurface`;
- `docs/TEMPLATE_BUILDER_CONTENTEDITABLE_SURFACE_HARDENING_BOUNDARY.md`
  records PASS, FAIL/BLOCKER, RISK, UNKNOWN, files changed, behavior changed,
  tests run, risks left, and intentionally not changed;
- `tests/templateBuilderSandboxBoundary.test.ts` proves ready nested-selection
  hardening, styled range-mapper guard carry-through, blocked drift cases,
  composition guard behavior, action-lane exposure, and source guardrails.

This phase intentionally does not add package/document schema changes, parent
editor imports, legacy runtime adoption, durable persistence/session writes,
collaboration behavior, renderer artifact output, ICU4X execution, or
WASM/text-engine measurement replacement.

## Phase 129 Rich Inline Persistence/Session Boundary

Phase 129 prepares rich inline commits for future session persistence without
implementing a storage adapter:

- `src/authoring/richInlineSessionPersistence.ts` owns
  `createVNextRichInlineSessionPersistenceRecord(...)` and
  `createVNextRichInlineReplayPatchRecord(...)`;
- the record composes a Phase 87 canonical package session storage record and a
  Phase 88 durable history snapshot;
- rich inline replay patches store before/after vNext inline children, target
  text block id, group id, history sequence, field-key summary, validation
  status, and storage/replay statuses;
- invalid replay patch payloads report validation issues without running replay;
- `src/index.ts` exports the rich inline session persistence boundary;
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `sandbox.planRichInlineSessionPersistence`;
- `docs/TEMPLATE_BUILDER_RICH_INLINE_SESSION_PERSISTENCE_BOUNDARY.md` records
  PASS, FAIL/BLOCKER, RISK, UNKNOWN, files changed, behavior changed, tests run,
  risks left, and intentionally not changed;
- `tests/richInlineSessionPersistence.test.ts` proves package/history/replay
  payload composition, invalid replay patch reporting, JSON safety, source
  independence, and phase-trail updates.

This phase intentionally does not add package/document schema changes, parent
editor imports, legacy runtime adoption, durable storage writes, backend API
routes, collaboration behavior, renderer artifact output, ICU4X execution, or
WASM/text-engine measurement replacement.

## Phase 130 Rich Inline Live/Exact Parity Audit

Phase 130 audits rich inline live/exact stale-signal parity after commit,
undo/redo replay, contenteditable surface hardening, and session persistence:

- `docs/TEMPLATE_BUILDER_RICH_INLINE_LIVE_EXACT_PARITY_AUDIT.md` records PASS,
  FAIL/BLOCKER, RISK, UNKNOWN, files changed, behavior changed, tests run,
  risks left, and intentionally not changed;
- accepted `runVNextRichInlineCommit(...)` results keep text-block dirty
  scopes and `renderInvalidation.exactGenerationStale = true` on the
  `text-content` lane;
- the sandbox bridge calls `rememberLiveLayoutBoundary(...)` after rich inline
  commit, rich undo, and rich redo, producing bounded packet `liveLayout`
  summaries through `resolveVNextLiveLayoutBoundary(...)`;
- the packet summaries expose stale live layout, stale exact generation, and
  `measured-pagination` as the final exact-generation truth;
- rich inline session persistence records continue to exclude `liveLayout`,
  `exactLayout`, and renderer `artifacts`;
- `tests/richInlineLiveExactParityAudit.test.ts` proves core commit parity,
  sandbox commit/undo/redo parity, persistence exclusion, and phase-trail
  updates.

This phase intentionally does not add runtime behavior, package/document schema
changes, parent editor imports, legacy runtime adoption, storage writes,
backend API routes, collaboration behavior, renderer artifact output, ICU4X
execution, or WASM/text-engine measurement replacement.

## Phase 131 Five-Lane Project Progress Index

Phase 131 consolidates the active project roadmap into one five-lane progress
index:

- `docs/FIVE_LANE_PROJECT_PROGRESS_INDEX.md` maps Viewport / Virtualization,
  Structural Runtime, WYSIWYG / Editing, Backend / API / Persistence, and Exact
  Output / Renderer;
- the index records phase coverage, current level, completed foundation work,
  remaining production gaps, recommended order, PASS, FAIL/BLOCKER, RISK,
  UNKNOWN, files changed, behavior changed, tests run, risks left, and
  intentionally not changed;
- Viewport / Virtualization is summarized from Phases 45-68 and
  `docs/TEMPLATE_BUILDER_VIEWPORT_LARGE_DOCUMENT_AUDIT.md`;
- Structural Runtime is summarized from Phases 69-77 and
  `docs/TEMPLATE_BUILDER_STRUCTURAL_RUNTIME_CLOSE_AUDIT.md`;
- WYSIWYG / Editing is summarized from Phases 36-42, 78-85, and 116-130;
- Backend / API / Persistence is summarized from Phases 86-92 plus Phase 129
  rich inline session persistence;
- Exact Output / Renderer is summarized from Phases 93-115, including the
  renderer adapter close audit and text-engine/rustybuzz evidence lane;
- `tests/fiveLaneProjectProgressIndex.test.ts` proves the index names all five
  lanes, keeps production non-goals explicit, and links README, roadmap, and
  ledger updates.

This phase intentionally does not add runtime behavior, package/document schema
changes, parent editor imports, legacy runtime adoption, backend routes,
storage adapters, renderer artifact output, collaboration behavior, or
production contenteditable input.

## Phase 132 ICU4X Line-Break Evidence Manifest Boundary

Phase 132 creates a separate Thai line-break evidence manifest before
multi-line wrapping:

- `fixtures/thai-line-break-evidence.v1.json` records ICU4X primary candidate
  and Intl.Segmenter comparison baseline break opportunities for every Phase
  106 Thai corpus sample;
- the neutral `fixtures/thai-measurement-corpus.v1.json` remains source-only
  corpus text and is not mutated with expected breakpoints;
- `src/renderer/thaiLineBreakEvidence.ts` validates evidence ids, corpus sample
  references, candidate roles, deterministic engine/data revisions, UTF-16
  break offsets, final breaks, and dependency-clean execution policy;
- Intl.Segmenter entries are blocked from becoming primary truth;
- `docs/THAI_LINE_BREAK_EVIDENCE_BOUNDARY.md` records PASS/RISK/UNKNOWN,
  files changed, behavior changed, tests run, risks left, and intentionally
  not changed;
- `tests/thaiLineBreakEvidence.test.ts` proves manifest validation, corpus
  neutrality, duplicate/unknown sample rejection, deterministic revision
  requirements, invalid offset blocking, dependency cleanliness, and phase
  trail updates.

This phase intentionally does not execute ICU4X, Intl.Segmenter, LibThai,
PyThaiNLP, or AttaCut; compute line boxes; implement multi-line wrapping;
replace pagination measurement; bind production measurement; add renderer,
DOM, WASM, or text-engine dependencies; write artifacts; or change
package/document schema.

## Phase 133 Multi-Line Wrap Evidence Boundary

Phase 133 turns accepted glyph evidence plus break opportunities into
multi-line line-box evidence:

- `packages/text-engine-rust-wasm/src/lineWrapEvidence.ts` consumes adapter
  requests, accepted rustybuzz glyph evidence, Phase 132 Thai line-break
  entries, and `availableWidthPt`;
- it emits adapter evidence with multi-line `lineBoxes` while preserving glyph
  facts on the evidence lane;
- break kind and break reason are recorded in line-wrap summaries instead of
  widening the public `VNextTextEngineAdapterLineBoxFact` shape;
- `src/renderer/textEngineEvidenceAcceptance.ts` now rejects overlapping glyph
  coverage, not only missing glyph coverage;
- `tests/textEngineLineWrapEvidence.test.ts` proves existing smoke corpus
  wrapping, narrow/wide width behavior, evidence acceptance, measurement draft
  handoff, overlap rejection, package/core dependency cleanliness, and phase
  trail updates.

This phase intentionally does not change `VNextTextMeasurementDraft`, replace
pagination measurement, bind production measurement, run ICU4X/rustybuzz/WASM,
implement justification, hyphenation, bidi, renderer artifact output, storage
writes, backend routes, or package/document schema changes.

## Phase 134 WASM / ICU4X Runtime Identity And Digest Boundary

Phase 134 records external text-engine runtime identity before parity-ready
claims:

- `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`
  records adapter package name, measurement profile id, output shape, runtime
  targets, rustybuzz revision, ICU4X revision, ICU4X data revision, font
  hashes, WASM digest status, and native/WASM comparison shape;
- `packages/text-engine-rust-wasm/src/runtimeIdentity.ts` validates the
  manifest and blocks missing rustybuzz, ICU4X, ICU4X data, font hash, required
  compared fact, or parity-ready digest/comparison evidence;
- the current fixture is `identity-only` and keeps WASM digest pending as a
  warning instead of claiming full parity;
- `tests/textEngineRuntimeIdentity.test.ts` proves identity validation,
  measurement profile ingredient alignment, parity-ready digest blocking,
  revision/hash/fact blocking, dependency cleanliness, and phase trail updates.

This phase intentionally does not build, import, load, or execute WASM; run
ICU4X; run native/WASM comparison; bind production measurement; replace
pagination measurement; produce renderer artifacts; write storage; add backend
routes; or change package/document schema.

## Phase 135 Renderer-Backed Text Measurement Provider Bridge

Phase 135 bridges accepted text-engine evidence into the existing renderer-
backed text measurement adapter:

- `packages/text-engine-rust-wasm/src/rendererBackedProvider.ts` creates an
  external provider bridge over selected glyph evidence and Thai line-break
  evidence;
- provider measurement runs through Phase 133 wrap evidence, Phase 109 evidence
  acceptance, and Phase 110 measurement draft handoff before returning a
  `VNextTextMeasurementDraft`;
- call sites can wrap the provider with
  `createVNextRendererBackedTextMeasurer(...)`;
- drift reports compare approximate and renderer-backed draft summaries without
  mutating pagination cache or invalidation behavior;
- `tests/rendererBackedTextEngineProvider.test.ts` proves provider measurement,
  profile mismatch blocking, line-box capability blocking, drift reports,
  dependency cleanliness, default measurement independence, and phase trail
  updates.

This phase intentionally does not replace `measureVNextText(...)` defaults,
mutate pagination cache/invalidation contracts, import the provider into core,
run PDF/DOCX rendering, produce artifact bytes, bind production measurement, or
change package/document schema.

## Phase 136 External Minimal PDF Artifact Spike Package

Phase 136 creates the first external PDF byte-producing spike:

- `packages/pdf-renderer-spike` is a private dependency-free package that
  consumes public core `VNextPdfRendererAdapterPlan` output;
- `packages/pdf-renderer-spike/src/index.ts` writes minimal PDF syntax for page
  boxes and text draw commands using built-in Helvetica;
- the spike returns bytes and a local artifact manifest with media type, byte
  length, sha256, renderer profile id, measurement profile id,
  `storageStatus = "not-stored"`, and `localOnly = true`;
- `tests/pdfRendererSpike.test.ts` proves non-empty bytes, stable manifest
  hashing, blocked unsafe inputs, core dependency cleanliness, and phase trail
  updates.

This phase intentionally does not add PDF renderer dependencies to core, import
the spike package from core, claim production PDF fidelity, implement DOCX,
write files or storage records, add backend routes, or change package/document
schema.

## Phase 137 Artifact Manifest And Storage Boundary

Phase 137 defines the core artifact manifest storage-record lifecycle:

- `src/generation/artifactManifest.ts` exports
  `createVNextArtifactManifestPlan(...)`, source/mode constants, lifecycle
  statuses, format/media metadata, profile ids, byte length, sha256,
  `storageKey`, and bounded error summaries;
- rendered records require positive byte length, sha256, and a storage key;
- planned and rendering records keep bytes and hashes explicitly null;
- failed records require bounded error summaries and reject partial byte/hash
  payloads;
- the record always exposes `storageStatus = "not-written"`;
- `tests/artifactManifest.test.ts` proves lifecycle validation, explicit
  missing/null fields, dependency cleanliness, and phase trail updates.

This phase intentionally does not write files, write databases or object
storage, import concrete renderer packages, add backend routes, run PDF/DOCX
rendering, change generation readiness, or change package/document schema.

## Phase 138 Backend Artifact Route Contract Boundary

Phase 138 adds HTTP-shaped artifact route contracts without concrete routes:

- `src/generation/artifactApiRoute.ts` exports helpers for
  `artifact.request`, `artifact.status`, `artifact.listSession`, and
  `artifact.downloadMetadata`;
- generation requests require idempotency keys and return planned artifact
  manifest records;
- status responses expose retry-safe polling metadata for planned/rendering
  artifacts;
- list and download metadata helpers consume caller-supplied artifact manifests
  without storage lookup;
- permission context is required but marked `checked: false`;
- download metadata never includes bytes, streams, or signed URLs.

This phase intentionally does not start a server, add backend routes, read or
write storage, execute auth/authz, call renderer packages, stream artifact
bytes, create durable jobs, or change package/document schema.

## Phase 139 Durable Layout And Artifact Job Boundary

Phase 139 adds durable artifact job records and pure transition helpers:

- `src/generation/artifactJob.ts` exports
  `createVNextArtifactJobPlan(...)` and `advanceVNextArtifactJob(...)`;
- queued job records carry package/session refs, layout/measurement/renderer
  profile ids, requested format/media type, cursor/progress metadata,
  cancellation state, retry count, bounded error state, and a planned artifact
  manifest reference;
- valid transitions advance queued -> layout-running -> layout-complete ->
  rendering -> rendered;
- fail, cancel, and retry transitions are explicit and bounded;
- rendered manifests must match job artifact/profile/format identity;
- `tests/artifactJob.test.ts` proves valid/invalid transitions, retry limit,
  cancellation, manifest identity checks, dependency cleanliness, and phase
  trail updates.

This phase intentionally does not run workers, write queues, execute layout,
call renderer packages, write storage, add backend routes, stream artifact
bytes, or change package/document schema.

## Phase 140 Storage Adapter Interface Boundary

Phase 140 defines concrete-backend-free storage interfaces:

- `src/persistence/storageAdapter.ts` exports typed collection contracts for
  package/session records, durable histories, rich inline session persistence,
  artifact manifests, and artifact jobs;
- write requests include `expectedRevision`, required `idempotencyKey`, and
  optional `writeToken`;
- read/write results return JSON-safe envelopes with revision, key, kind,
  metadata, conflict details, issues, and explicit no-backend contracts;
- pure helper functions shape read/write outcomes without performing storage;
- `tests/storageAdapter.test.ts` keeps the in-memory mock local to tests and
  proves idempotent replay, expected-revision conflict, write-token echoing,
  collection coverage, dependency cleanliness, and phase trail updates.

This phase intentionally does not choose or implement Postgres, S3, filesystem
storage, browser storage, Redis, migrations, auth/authz, backend routes,
storage writes, queue writes, or package/document schema changes.

## Phase 141 Product Editor Integration Smoke Boundary

Phase 141 adds a product-editor-like sandbox composition smoke:

- `tests/productEditorIntegrationSmoke.test.ts` boots the
  `examples/template-builder-sandbox` mutation bridge from the canonical
  product-report fixture;
- the smoke composes outline selection jump, bounded visible range, runtime
  cache/store, render window, structural command policy, structural packets,
  rich inline commit, undo, redo, and live/exact stale signaling;
- structural insert/delete/reorder operations route through packets;
- rich inline commit marks exact generation stale and remains undo/redo
  replayable;
- visible/render window stays bounded at 8 nodes in the smoke.

This phase intentionally does not claim production editor readiness, run real
browser timing, introduce React/DOM integration, import old FlowDocEditor,
write storage, add backend routes, produce renderer artifacts, implement
collaboration/offline behavior, or change package/document schema.

## Phase 142 Browser Timing Smoke Boundary

Phase 142 adds a conservative timing smoke for the sandbox runtime path:

- `examples/template-builder-sandbox/scripts/browser-smoke.mjs` emits JSON
  timing output for initial boot, node selection jump, visible range apply,
  scroll update, structural command apply, rich inline draft open, and rich
  inline commit;
- `examples/template-builder-sandbox/package.json` exposes `npm run
  browser-smoke`;
- the smoke records `browserDriver = "not-bound"`,
  `productionBenchmark = false`, and conservative threshold metadata;
- `tests/browserTimingSmoke.test.ts` runs the script and guards against adding
  Playwright/Puppeteer dependencies to core.

This phase intentionally does not add a browser driver dependency, claim
production browser performance readiness, set strict production thresholds,
perform screenshot/interaction QA, produce renderer artifacts, write storage,
add backend routes, or change package/document schema.

## Phase 143 WYSIWYG Primary Input Decision Gate

Phase 143 records the first production WYSIWYG input recommendation:

- `docs/WYSIWYG_PRIMARY_INPUT_DECISION_GATE.md` compares full-document
  contenteditable, textarea draft island, renderer-owned segment stream, and
  hybrid managed cards with a hardened contenteditable island;
- the matrix evaluates Thai IME, caret/range mapping, field chips, rich inline
  style, copy/paste/delete, undo/redo, exact renderer parity, collaboration
  readiness, and implementation risk;
- the recommended v1 path is hybrid managed cards with a hardened
  contenteditable island for the active text block;
- the decision explicitly rejects full-document contenteditable as the v1
  production primary input.

This phase intentionally does not implement production input, rewrite the
editor, add collaboration behavior, write storage, add backend routes, produce
renderer artifacts, or change package/document schema.

## Phase 144 Granular Rich Inline Operation Decision Boundary

Phase 144 records the v1 rich inline operation policy:

- `docs/RICH_INLINE_OPERATION_DECISION_BOUNDARY.md` compares full inline-child
  replacement, range style patch operations, field chip insert/remove
  operations, and text insert/delete with mark context;
- `text-block.rich-inline.replace` remains accepted for the first single-user
  vertical slice;
- full replacement is explicitly not collaboration-safe or offline-merge-safe;
- granular operations become required before collaboration, offline replay, or
  renderer-owned segment stream editing claims;
- `tests/richInlineOperationDecision.test.ts` guards the current replacement
  source shape and phase trail.

This phase intentionally does not change operation schema, implement
collaboration/offline behavior, write storage, add backend routes, produce
renderer artifacts, or change package/document schema.

## Phase 145 First Vertical Slice Release Candidate Plan

Phase 145 scopes the first single-user release-candidate path:

- `docs/FIRST_VERTICAL_SLICE_RC_PLAN.md` defines the canonical template/report
  to minimal artifact evidence flow;
- the candidate flow includes field binding, browser-local authoring,
  structural edit, rich inline commit, exact generation stale signal,
  renderer-backed measurement evidence, minimal PDF bytes, artifact
  manifest/job records, and storage adapter boundary;
- `tests/firstVerticalSliceReadiness.test.ts` guards the required prior
  evidence docs, single-user scope, and non-production exclusions;
- the plan explicitly blocks production launch, collaboration/offline, full
  WYSIWYG input, default measurement replacement, concrete server/storage,
  full PDF fidelity, DOCX, parent runtime flip, and package/document schema
  change claims.

This phase intentionally does not implement the release candidate, change
runtime behavior, change operation schema, write storage, add backend routes,
bind a production renderer, or change package/document schema.

## Phase 146 First Vertical Slice RC Orchestrator Boundary

Phase 146 adds the first RC report builder:

- `src/generation/verticalSliceRc.ts` exports a pure input-driven
  `createVNextVerticalSliceRcReport(...)` boundary;
- the report carries rc/package/session/profile/artifact identities, exact
  stale status, measurement summary, artifact byte/digest/storage summary,
  storage summary, evidence lane summaries, PASS/RISK/UNKNOWN/FAIL-BLOCKER
  lists, and intentionally-not-production-ready claims;
- required evidence lanes cover canonical package, key/data diagnostics,
  authoring session, rich inline commit, exact generation, measurement,
  artifact, artifact job, and storage;
- `tests/verticalSliceRc.test.ts` proves JSON safety, missing-input blocking,
  dependency cleanliness, and phase trail updates.

This phase intentionally does not load fixtures, call browser APIs, start
server routes, create workers/queues, write storage, import external text
engine or PDF spike packages into core, execute renderers, replace default
measurement, claim production readiness, or change package/document schema.

## Phase 147 RC Scenario Fixture Boundary

Phase 147 adds the first RC scenario fixture:

- `fixtures/vertical-slice-rc-report.v1.flowdoc.json` is a canonical package
  v2/document v3 report fixture;
- `fixtures/vertical-slice-rc-scenario.v1.json` declares the scenario id,
  intended `text-block.rich-inline.replace` edit, field-ref chip case, expected
  stale exact generation, expected PDF artifact, and expected storage
  collections;
- `src/generation/verticalSliceScenario.ts` validates package/scenario inputs
  supplied by callers and returns a Phase 146 report seed;
- `tests/verticalSliceScenario.test.ts` proves canonical parsing, node/field
  reference validation, Phase 146 feed compatibility, dependency cleanliness,
  and phase trail updates.

This phase intentionally does not mutate existing fixtures, accept
old/prototype document shapes, add repeat/collection materialization, add
workflow/reviewer runtime, load files inside the source helper, call browser
APIs, write storage, start routes, execute renderers, import external spike
packages, or change package/document schema.

## Phase 148 RC Measurement Selection And Drift Gate

Phase 148 adds an RC measurement summary gate:

- `src/generation/verticalSliceMeasurementGate.ts` compares caller-supplied
  renderer-backed and approximate measurement summaries;
- the gate blocks wrong `measurementProfileId` and missing line boxes;
- drift over tolerance becomes warning or blocker based on caller policy;
- digest and native/WASM parity status remain visible in the summary;
- `tests/verticalSliceMeasurementGate.test.ts` proves profile blocking, line
  box blocking, drift policy, digest/parity visibility, dependency cleanliness,
  and phase trail updates.

This phase intentionally does not import the external text-engine package,
execute renderer-backed provider code, replace default pagination measurement,
mutate pagination/cache behavior, bind production measurement, or change
package/document schema.

## Phase 149 RC Artifact Production Bridge

Phase 149 adds an RC artifact summary bridge:

- `src/generation/verticalSliceArtifactBridge.ts` consumes caller-supplied PDF
  spike manifest summaries plus core artifact manifest and job records;
- artifact id, renderer profile id, measurement profile id, media type, byte
  length, sha256, manifest, and job identity must align;
- successful and failed artifact production are represented without claiming
  production fidelity;
- `tests/verticalSliceArtifactBridge.test.ts` proves success, failure,
  missing-byte/hash blocking, storage-status guarding, dependency cleanliness,
  and phase trail updates.

This phase intentionally does not import `packages/pdf-renderer-spike` into
core, render bytes, write files/storage, add backend routes, claim production
PDF fidelity, add DOCX output, or change package/document schema.

## Phase 150 RC Storage Simulation Boundary

Phase 150 adds an RC storage simulation summary:

- `src/generation/verticalSliceStorageSimulation.ts` consumes
  caller-supplied `VNextStorageWriteResult` values and returns the Phase 146
  storage summary shape;
- test-local mocks exercise package/session, durable history, rich inline
  session, artifact manifest, and artifact job collection writes;
- expected revision conflicts and idempotent replay are represented;
- `tests/verticalSliceStorageSimulation.test.ts` proves summary status,
  conflicts, invalid requests, dependency cleanliness, and phase trail updates.

This phase intentionally does not choose Postgres, S3, filesystem, browser
storage, Redis, or any concrete backend; perform real storage writes; add
auth/authz; add backend routes; or change package/document schema.

## Phase 151 End-To-End RC Report Smoke

Phase 151 composes the first bounded RC report:

- `tests/verticalSliceRcEndToEnd.test.ts` loads the RC package/scenario
  fixtures, runs key diagnostics, applies the rich inline edit, confirms exact
  generation stale status, runs the measurement gate, artifact bridge, storage
  simulation, and final RC report builder;
- `docs/VERTICAL_SLICE_RC_END_TO_END_SMOKE.md` records PASS/RISK/UNKNOWN and
  remaining non-production limits;
- the report carries PASS, RISK, UNKNOWN, and
  intentionallyNotProductionReady lists.

This phase intentionally does not add a real browser driver, real storage
backend, production PDF renderer, production launch readiness claim,
collaboration/offline behavior, backend route, or package/document schema
change.

## Phase 152 RC Close Audit

Phase 152 closes the first vertical slice RC foundation pass:

- `docs/VERTICAL_SLICE_RC_CLOSE_AUDIT.md` summarizes the proven path from
  input-driven report builder through scenario, measurement gate, artifact
  bridge, storage simulation, and E2E smoke;
- production blockers remain explicit: production WYSIWYG input, concrete
  storage/backend, production PDF fidelity, default measurement replacement,
  native/WASM digest parity, collaboration/offline, and schema changes;
- next recommended lane is Phase 153 Hybrid Managed Card Input Implementation
  Plan;
- `tests/verticalSliceRcCloseAudit.test.ts` guards the audit content and phase
  trail.

This phase intentionally does not claim production readiness, implement
production WYSIWYG input, choose concrete storage, add backend routes, close
production renderer fidelity, replace default measurement, implement
collaboration/offline behavior, or change package/document schema.

## Phase 153 Hybrid Managed Card Input Implementation Plan

Phase 153 turns the Phase 143 input decision into implementation-sized
boundaries:

- `docs/HYBRID_MANAGED_CARD_INPUT_IMPLEMENTATION_PLAN.md` defines ownership
  boundaries for managed cards, the active text-block island, command policy,
  commit bridge, fallback textarea path, and app-shell integration;
- browser-local DOM, selection/caret, IME, segment, toolbar, paste/delete, and
  fallback buffer state are separated from vNext core commit facts;
- guard policies cover styled runs, atomic field chips, IME composition,
  selection/caret, paste/delete, and unsupported blocks;
- Phase 144 `text-block.rich-inline.replace` remains accepted only for the v1
  single-user path and not collaboration/offline claims;
- `tests/hybridManagedCardInputPlan.test.ts` guards plan-only status, Phase
  143/144 references, non-production claims, and phase trail updates.

This phase intentionally does not implement production contenteditable,
full-document contenteditable, collaboration/offline behavior, storage/backend
routes, PDF/DOCX renderer work, legacy editor runtime copy, or
package/document schema changes.

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
