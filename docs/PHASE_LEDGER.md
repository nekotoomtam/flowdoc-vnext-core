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
| 154 | Input runtime ownership boundary | done | `docs/HYBRID_INPUT_RUNTIME_OWNERSHIP_BOUNDARY.md`; `examples/template-builder-sandbox/public/inputRuntimeOwnership.js`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/hybridInputRuntimeOwnership.test.ts`; `tests/hybridManagedCardInputPlan.test.ts` |
| 155 | Active text-block island boundary | done | `docs/ACTIVE_TEXT_BLOCK_ISLAND_BOUNDARY.md`; `examples/template-builder-sandbox/public/activeTextBlockIsland.js`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/activeTextBlockIsland.test.ts` |
| 156 | Hybrid command policy boundary | done | `docs/HYBRID_INPUT_COMMAND_POLICY_BOUNDARY.md`; `examples/template-builder-sandbox/public/hybridInputCommandPolicy.js`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/hybridInputCommandPolicy.test.ts`; `tests/hybridManagedCardInputPlan.test.ts` |
| 157 | DOM binding smoke boundary | done | `docs/ACTIVE_TEXT_BLOCK_DOM_BINDING_SMOKE.md`; `examples/template-builder-sandbox/public/activeTextBlockDomBinding.js`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/activeTextBlockDomBinding.test.ts`; `tests/hybridManagedCardInputPlan.test.ts` |
| 158 | Active island commit bridge smoke | done | `docs/ACTIVE_ISLAND_COMMIT_BRIDGE_SMOKE.md`; `examples/template-builder-sandbox/public/activeIslandCommitBridge.js`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/activeIslandCommitBridge.test.ts`; `tests/hybridManagedCardInputPlan.test.ts` |
| 159 | Field chip command boundary | done | `docs/FIELD_CHIP_COMMAND_BOUNDARY.md`; `src/authoring/fieldChipCommands.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/fieldChipCommands.test.ts`; `tests/hybridManagedCardInputPlan.test.ts` |
| 160 | Paste/delete preflight boundary | done | `docs/PASTE_DELETE_PREFLIGHT_BOUNDARY.md`; `examples/template-builder-sandbox/public/pasteDeletePreflight.js`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/pasteDeletePreflight.test.ts`; `tests/hybridManagedCardInputPlan.test.ts` |
| 161 | Renderer segment and hit-test evidence boundary | done | `docs/RENDERER_SEGMENT_HIT_TEST_EVIDENCE_BOUNDARY.md`; `src/renderer/segmentHitTestEvidence.ts`; `src/index.ts`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/segmentHitTestEvidence.test.ts`; `tests/hybridManagedCardInputPlan.test.ts`; `tests/activeIslandCommitBridge.test.ts` |
| 162 | Hybrid input foundation close audit | done | `docs/HYBRID_INPUT_FOUNDATION_CLOSE_AUDIT.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/hybridInputFoundationCloseAudit.test.ts`; `tests/hybridManagedCardInputPlan.test.ts` |
| 163 | Hybrid input browser QA boundary | done | `docs/HYBRID_INPUT_BROWSER_QA_BOUNDARY.md`; `examples/template-builder-sandbox/public/hybridInputBrowserQa.js`; `examples/template-builder-sandbox/scripts/hybrid-input-browser-qa.mjs`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/hybridInputBrowserQa.test.ts`; `tests/hybridManagedCardInputPlan.test.ts`; `tests/hybridInputFoundationCloseAudit.test.ts` |
| 164 | Optional browser driver smoke boundary | done | `docs/HYBRID_INPUT_OPTIONAL_BROWSER_DRIVER_SMOKE_BOUNDARY.md`; `examples/template-builder-sandbox/public/hybridInputBrowserDriverSmoke.js`; `examples/template-builder-sandbox/scripts/hybrid-input-browser-driver-smoke.mjs`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/hybridInputBrowserDriverSmoke.test.ts`; `tests/hybridInputBrowserQa.test.ts`; `tests/hybridInputFoundationCloseAudit.test.ts`; `tests/hybridManagedCardInputPlan.test.ts` |
| 165 | Hybrid input browser evidence close audit | done | `docs/HYBRID_INPUT_BROWSER_EVIDENCE_CLOSE_AUDIT.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/hybridInputBrowserEvidenceCloseAudit.test.ts`; `tests/hybridInputBrowserDriverSmoke.test.ts`; `tests/hybridInputBrowserQa.test.ts`; `tests/hybridInputFoundationCloseAudit.test.ts`; `tests/hybridManagedCardInputPlan.test.ts` |
| 166 | Hybrid input hardening threshold plan | done | `docs/HYBRID_INPUT_HARDENING_THRESHOLD_PLAN.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/hybridInputHardeningThresholdPlan.test.ts`; `tests/hybridInputBrowserEvidenceCloseAudit.test.ts`; `tests/hybridInputBrowserDriverSmoke.test.ts`; `tests/hybridInputBrowserQa.test.ts`; `tests/hybridInputFoundationCloseAudit.test.ts`; `tests/hybridManagedCardInputPlan.test.ts` |
| 167 | Browser matrix decision | done | `docs/HYBRID_INPUT_BROWSER_MATRIX_DECISION.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/hybridInputBrowserMatrixDecision.test.ts`; `tests/hybridInputHardeningThresholdPlan.test.ts`; `tests/hybridInputBrowserEvidenceCloseAudit.test.ts`; `tests/hybridInputBrowserDriverSmoke.test.ts`; `tests/hybridInputBrowserQa.test.ts`; `tests/hybridInputFoundationCloseAudit.test.ts`; `tests/hybridManagedCardInputPlan.test.ts` |
| 168 | Guarded input integration plan | done | `docs/GUARDED_INPUT_INTEGRATION_PLAN.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/guardedInputIntegrationPlan.test.ts`; `tests/hybridInputBrowserMatrixDecision.test.ts`; `tests/hybridInputHardeningThresholdPlan.test.ts`; `tests/hybridInputBrowserEvidenceCloseAudit.test.ts`; `tests/hybridInputBrowserDriverSmoke.test.ts`; `tests/hybridInputBrowserQa.test.ts`; `tests/hybridInputFoundationCloseAudit.test.ts`; `tests/hybridManagedCardInputPlan.test.ts` |
| 169 | Guarded input runtime slice 1 | done | `examples/template-builder-sandbox/public/guardedInputRuntimeSlice.js`; `docs/GUARDED_INPUT_RUNTIME_SLICE.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/guardedInputRuntimeSlice.test.ts`; `tests/guardedInputIntegrationPlan.test.ts`; `tests/hybridInputBrowserMatrixDecision.test.ts`; `tests/hybridInputHardeningThresholdPlan.test.ts`; `tests/hybridInputBrowserEvidenceCloseAudit.test.ts`; `tests/hybridInputBrowserDriverSmoke.test.ts`; `tests/hybridInputBrowserQa.test.ts`; `tests/hybridInputFoundationCloseAudit.test.ts`; `tests/hybridManagedCardInputPlan.test.ts` |
| 170 | Guarded input paste/delete/field-chip slice | done | `examples/template-builder-sandbox/public/guardedInputPasteDeleteFieldChipSlice.js`; `docs/GUARDED_INPUT_PASTE_DELETE_FIELD_CHIP_SLICE.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/guardedInputPasteDeleteFieldChipSlice.test.ts`; `tests/guardedInputRuntimeSlice.test.ts`; `tests/guardedInputIntegrationPlan.test.ts`; `tests/hybridInputBrowserMatrixDecision.test.ts`; `tests/hybridInputHardeningThresholdPlan.test.ts`; `tests/hybridInputBrowserEvidenceCloseAudit.test.ts`; `tests/hybridInputBrowserDriverSmoke.test.ts`; `tests/hybridInputBrowserQa.test.ts`; `tests/hybridInputFoundationCloseAudit.test.ts`; `tests/hybridManagedCardInputPlan.test.ts` |
| 171 | Guarded input integration close audit | done | `docs/GUARDED_INPUT_INTEGRATION_CLOSE_AUDIT.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/guardedInputIntegrationCloseAudit.test.ts`; `tests/guardedInputPasteDeleteFieldChipSlice.test.ts`; `tests/guardedInputRuntimeSlice.test.ts`; `tests/guardedInputIntegrationPlan.test.ts`; `tests/hybridInputBrowserMatrixDecision.test.ts`; `tests/hybridInputHardeningThresholdPlan.test.ts`; `tests/hybridInputBrowserEvidenceCloseAudit.test.ts`; `tests/hybridInputBrowserDriverSmoke.test.ts`; `tests/hybridInputBrowserQa.test.ts`; `tests/hybridInputFoundationCloseAudit.test.ts`; `tests/hybridManagedCardInputPlan.test.ts` |
| 172 | Concrete storage choice gate | done | `docs/CONCRETE_STORAGE_CHOICE_GATE.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/concreteStorageChoiceGate.test.ts`; `tests/prePhase172RiskUnknownRegister.test.ts`; `tests/guardedInputIntegrationCloseAudit.test.ts`; roadmap guard tests |
| 173 | External file-backed storage adapter slice | done | `packages/storage-file-json/package.json`; `packages/storage-file-json/tsconfig.json`; `packages/storage-file-json/src/index.ts`; `docs/EXTERNAL_FILE_BACKED_STORAGE_ADAPTER_SLICE.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/storageFileJsonAdapter.test.ts`; `vitest.config.ts` |
| 174 | Artifact byte store slice | done | `packages/storage-file-json/src/index.ts`; `docs/ARTIFACT_BYTE_STORE_SLICE.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/artifactByteStoreSlice.test.ts`; `tests/storageFileJsonAdapter.test.ts` |
| 175 | Storage-backed RC roundtrip smoke | done | `packages/internal-alpha-runner/package.json`; `packages/internal-alpha-runner/tsconfig.json`; `packages/internal-alpha-runner/src/index.ts`; `packages/internal-alpha-runner/src/storageBackedRcRoundtrip.ts`; `docs/STORAGE_BACKED_RC_ROUNDTRIP_SMOKE.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/storageBackedRcRoundtripSmoke.test.ts`; `tests/artifactByteStoreSlice.test.ts`; `tsconfig.json`; `vitest.config.ts` |
| 176 | Backend route contract to storage binding | done | `packages/internal-alpha-runner/src/index.ts`; `packages/internal-alpha-runner/src/storageRouteBinding.ts`; `docs/BACKEND_ROUTE_STORAGE_BINDING_BOUNDARY.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/backendRouteStorageBinding.test.ts`; `tests/storageBackedRcRoundtripSmoke.test.ts` |
| 177 | Artifact job execution slice | done | `packages/internal-alpha-runner/src/artifactJobExecution.ts`; `packages/internal-alpha-runner/src/index.ts`; `packages/internal-alpha-runner/package.json`; `packages/internal-alpha-runner/tsconfig.json`; `docs/ARTIFACT_JOB_EXECUTION_SLICE.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/artifactJobExecutionSlice.test.ts`; `tests/backendRouteStorageBinding.test.ts`; `tsconfig.json`; `vitest.config.ts` |
| 178 | PDF renderer decision gate | done | `docs/PDF_RENDERER_DECISION_GATE.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/pdfRendererDecisionGate.test.ts`; `tests/artifactJobExecutionSlice.test.ts` |
| 179 | Measurement rollout gate | done | `docs/MEASUREMENT_ROLLOUT_GATE.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/measurementRolloutGate.test.ts`; `tests/pdfRendererDecisionGate.test.ts` |
| 180 | Internal alpha vertical slice | done | `packages/internal-alpha-runner/src/internalAlphaVerticalSlice.ts`; `packages/internal-alpha-runner/src/index.ts`; `docs/INTERNAL_ALPHA_VERTICAL_SLICE.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/internalAlphaVerticalSlice.test.ts`; `tests/measurementRolloutGate.test.ts` |
| 181 | Internal alpha close audit and documentation consolidation gate | done | `docs/INTERNAL_ALPHA_CLOSE_AUDIT_AND_DOC_CONSOLIDATION_GATE.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/internalAlphaCloseAuditConsolidation.test.ts`; `tests/internalAlphaVerticalSlice.test.ts` |
| 182 | V1 hardening backlog triage gate | done | `docs/V1_HARDENING_BACKLOG_TRIAGE_GATE.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/v1HardeningBacklogTriageGate.test.ts`; `tests/internalAlphaCloseAuditConsolidation.test.ts` |
| 183 | Measurement digest parity drift hardening gate | done | `docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/measurementDigestParityDriftHardeningGate.test.ts`; `tests/v1HardeningBacklogTriageGate.test.ts` |
| 184 | V1 measurement fixture evidence matrix gate | done | `docs/V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/v1MeasurementFixtureEvidenceMatrixGate.test.ts`; `tests/measurementDigestParityDriftHardeningGate.test.ts` |
| 185 | Measurement evidence summary manifest gate | done | `docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_GATE.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/measurementEvidenceSummaryManifestGate.test.ts`; `tests/v1MeasurementFixtureEvidenceMatrixGate.test.ts` |
| 186 | Measurement evidence summary manifest fixture stub gate | done | `fixtures/measurement-evidence-summary-manifest.stub.v1.json`; `docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_FIXTURE_STUB_GATE.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/measurementEvidenceSummaryManifestFixtureStubGate.test.ts`; pointer guard tests |
| 187 | Measurement evidence coverage gap triage gate | done | `docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md`; `fixtures/measurement-evidence-summary-manifest.stub.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/measurementEvidenceCoverageGapTriageGate.test.ts`; pointer guard tests |
| 188 | Text engine runtime identity digest evidence builder gate | done | `docs/TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_BUILDER_GATE.md`; `packages/text-engine-rust-wasm/src/runtimeIdentityDigestEvidenceBuilder.ts`; `packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-builder.v1.json`; `packages/text-engine-rust-wasm/src/index.ts`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/textEngineRuntimeIdentityDigestEvidenceBuilderGate.test.ts`; pointer guard tests |
| 189 | Text engine runtime identity digest evidence population gate | done | `docs/TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_POPULATION_GATE.md`; `packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-population.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/textEngineRuntimeIdentityDigestEvidencePopulationGate.test.ts`; pointer guard tests |
| 190 | Text engine WASM artifact digest pinning gate | done | `docs/TEXT_ENGINE_WASM_ARTIFACT_DIGEST_PINNING_GATE.md`; `packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/textEngineWasmArtifactDigestPinningGate.test.ts`; pointer guard tests |
| 191 | Text engine WASM artifact build output gate | done | `docs/TEXT_ENGINE_WASM_ARTIFACT_BUILD_OUTPUT_GATE.md`; `packages/text-engine-rust-wasm/fixtures/wasm-artifact-build-output.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/textEngineWasmArtifactBuildOutputGate.test.ts`; pointer guard tests |
| 192 | Text engine WASM build toolchain readiness gate | done | `docs/TEXT_ENGINE_WASM_BUILD_TOOLCHAIN_READINESS_GATE.md`; `packages/text-engine-rust-wasm/rust-shaper/Cargo.toml`; `packages/text-engine-rust-wasm/rust-shaper/src/lib.rs`; `packages/text-engine-rust-wasm/package.json`; `packages/text-engine-rust-wasm/README.md`; `packages/text-engine-rust-wasm/fixtures/wasm-build-toolchain-readiness.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/textEngineWasmBuildToolchainReadinessGate.test.ts`; pointer guard tests |
| 193 | Text engine WASM toolchain acquisition gate | done | `docs/TEXT_ENGINE_WASM_TOOLCHAIN_ACQUISITION_GATE.md`; `packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs`; `packages/text-engine-rust-wasm/package.json`; `packages/text-engine-rust-wasm/README.md`; `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-acquisition.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/textEngineWasmToolchainAcquisitionGate.test.ts`; pointer guard tests |
| 194 | Text engine WASM toolchain optional readiness smoke | done | `docs/TEXT_ENGINE_WASM_TOOLCHAIN_OPTIONAL_READINESS_SMOKE.md`; `packages/text-engine-rust-wasm/package.json`; `packages/text-engine-rust-wasm/README.md`; `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-optional-readiness-smoke.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/textEngineWasmToolchainOptionalReadinessSmoke.test.ts`; pointer guard tests |
| 195 | Text engine WASM artifact production gate | done | `docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_GATE.md`; `packages/text-engine-rust-wasm/fixtures/wasm-artifact-production.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/textEngineWasmArtifactProductionGate.test.ts`; pointer guard tests |
| 195A | Text engine WASM toolchain provisioning bootstrap gate | done | `docs/TEXT_ENGINE_WASM_TOOLCHAIN_PROVISIONING_BOOTSTRAP_GATE.md`; `packages/text-engine-rust-wasm/scripts/plan-wasm-toolchain-bootstrap.mjs`; `packages/text-engine-rust-wasm/package.json`; `packages/text-engine-rust-wasm/README.md`; `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-bootstrap.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/textEngineWasmToolchainProvisioningBootstrapGate.test.ts`; pointer guard tests |
| 195B | Text engine WASM toolchain provisioning execution gate | done | `docs/TEXT_ENGINE_WASM_TOOLCHAIN_PROVISIONING_EXECUTION_GATE.md`; `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-execution.v1.json`; `packages/text-engine-rust-wasm/README.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/textEngineWasmToolchainProvisioningExecutionGate.test.ts`; pointer guard tests |
| 195C | Text engine WASM toolchain version compatibility gate | done | `docs/TEXT_ENGINE_WASM_TOOLCHAIN_VERSION_COMPATIBILITY_GATE.md`; `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-version-compatibility.v1.json`; `packages/text-engine-rust-wasm/README.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/textEngineWasmToolchainVersionCompatibilityGate.test.ts`; pointer guard tests |
| 195D | Text engine WASM toolchain Rust upgrade execution gate | done | `docs/TEXT_ENGINE_WASM_TOOLCHAIN_RUST_UPGRADE_EXECUTION_GATE.md`; `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-rust-upgrade-execution.v1.json`; `packages/text-engine-rust-wasm/README.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/textEngineWasmToolchainRustUpgradeExecutionGate.test.ts`; pointer guard tests |
| 195E | Text engine WASM artifact production retry gate | done | `docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_RETRY_GATE.md`; `packages/text-engine-rust-wasm/fixtures/wasm-artifact-production-retry.v1.json`; `packages/text-engine-rust-wasm/README.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/textEngineWasmArtifactProductionRetryGate.test.ts`; pointer guard tests |
| 195F | Text engine WASM bindgen export dependency gate | done | `docs/TEXT_ENGINE_WASM_BINDGEN_EXPORT_DEPENDENCY_GATE.md`; `packages/text-engine-rust-wasm/rust-shaper/Cargo.toml`; `packages/text-engine-rust-wasm/rust-shaper/Cargo.lock`; `packages/text-engine-rust-wasm/rust-shaper/src/lib.rs`; `packages/text-engine-rust-wasm/fixtures/wasm-bindgen-export-dependency.v1.json`; `packages/text-engine-rust-wasm/README.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/textEngineWasmBindgenExportDependencyGate.test.ts`; pointer guard tests |
| 195G | Text engine WASM artifact production retry after bindgen gate | done | `docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_RETRY_GATE.md`; `packages/text-engine-rust-wasm/fixtures/wasm-artifact-production-retry.v1.json`; `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`; generated package metadata under `packages/text-engine-rust-wasm/pkg/`; `packages/text-engine-rust-wasm/README.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/textEngineWasmArtifactProductionRetryGate.test.ts`; pointer guard tests |
| 196 | Artifact digest pinning execution | done | `docs/ARTIFACT_DIGEST_PINNING_EXECUTION.md`; `packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`; `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`; `packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-builder.v1.json`; `packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-population.v1.json`; `packages/text-engine-rust-wasm/README.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/artifactDigestPinningExecution.test.ts`; pointer guard tests |
| 197 | Native evidence summary gate | done | `docs/NATIVE_EVIDENCE_SUMMARY_GATE.md`; `packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json`; `packages/text-engine-rust-wasm/README.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/nativeEvidenceSummaryGate.test.ts`; pointer guard tests |
| 198 | WASM evidence summary gate | done | `docs/WASM_EVIDENCE_SUMMARY_GATE.md`; `packages/text-engine-rust-wasm/fixtures/wasm-evidence-summary.v1.json`; `packages/text-engine-rust-wasm/README.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/wasmEvidenceSummaryGate.test.ts`; pointer guard tests |
| 199 | Native/WASM parity summary gate | done | `docs/NATIVE_WASM_PARITY_SUMMARY_GATE.md`; `packages/text-engine-rust-wasm/fixtures/native-wasm-parity-summary.v1.json`; `packages/text-engine-rust-wasm/README.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/nativeWasmParitySummaryGate.test.ts`; pointer guard tests |
| 200 | Renderer-backed drift summary gate | done | `docs/RENDERER_BACKED_DRIFT_SUMMARY_GATE.md`; `packages/text-engine-rust-wasm/fixtures/renderer-backed-drift-summary.v1.json`; `packages/text-engine-rust-wasm/README.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/rendererBackedDriftSummaryGate.test.ts`; pointer guard tests |
| 201 | Numeric drift threshold decision | done | `docs/NUMERIC_DRIFT_THRESHOLD_DECISION.md`; `packages/text-engine-rust-wasm/fixtures/numeric-drift-threshold-decision.v1.json`; `packages/text-engine-rust-wasm/README.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/numericDriftThresholdDecision.test.ts`; pointer guard tests |
| 202 | Accepted summary manifest population | done | `docs/ACCEPTED_SUMMARY_MANIFEST_POPULATION.md`; `fixtures/measurement-evidence-summary-manifest.accepted.v1.json`; `packages/text-engine-rust-wasm/README.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/acceptedSummaryManifestPopulation.test.ts`; pointer guard tests |
| 203 | Measurement hardening close audit | done | `docs/MEASUREMENT_HARDENING_CLOSE_AUDIT.md`; `fixtures/measurement-evidence-summary-manifest.accepted.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/measurementHardeningCloseAudit.test.ts`; pointer guard tests |
| 204 | Template variable render API planning gate | done | `docs/TEMPLATE_VARIABLE_RENDER_API_PLANNING_GATE.md`; `docs/MEASUREMENT_HARDENING_CLOSE_AUDIT.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/templateVariableRenderApiPlanningGate.test.ts`; pointer guard tests |
| 205 | Template publish version boundary gate | done | `docs/TEMPLATE_PUBLISH_VERSION_BOUNDARY_GATE.md`; `fixtures/template-publish-version-boundary.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/templatePublishVersionBoundaryGate.test.ts`; pointer guard tests |
| 206 | Template publish validation evidence gate | done | `docs/TEMPLATE_PUBLISH_VALIDATION_EVIDENCE_GATE.md`; `fixtures/template-publish-validation-evidence.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/templatePublishValidationEvidenceGate.test.ts`; pointer guard tests |
| 207 | Template publish accepted version metadata gate | done | `docs/TEMPLATE_PUBLISH_ACCEPTED_VERSION_METADATA_GATE.md`; `fixtures/template-publish-accepted-version-metadata.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/templatePublishAcceptedVersionMetadataGate.test.ts`; pointer guard tests |
| 208 | Template publish close audit | done | `docs/TEMPLATE_PUBLISH_CLOSE_AUDIT.md`; `fixtures/template-publish-accepted-version-metadata.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/templatePublishCloseAudit.test.ts`; pointer guard tests |
| 209 | Variable schema data contract planning gate | done | `docs/VARIABLE_SCHEMA_DATA_CONTRACT_PLANNING_GATE.md`; `fixtures/template-publish-accepted-version-metadata.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/variableSchemaDataContractPlanningGate.test.ts`; pointer guard tests |
| 210 | Variable reference discovery gate | done | `docs/VARIABLE_REFERENCE_DISCOVERY_GATE.md`; `fixtures/variable-reference-discovery.v1.json`; `fixtures/product-report-vnext.flowdoc.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/variableReferenceDiscoveryGate.test.ts`; pointer guard tests |
| 211 | Variable schema metadata shape gate | done | `docs/VARIABLE_SCHEMA_METADATA_SHAPE_GATE.md`; `fixtures/variable-schema-metadata-shape.v1.json`; `fixtures/variable-reference-discovery.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/variableSchemaMetadataShapeGate.test.ts`; pointer guard tests |
| 212 | Data contract validation policy gate | done | `docs/DATA_CONTRACT_VALIDATION_POLICY_GATE.md`; `fixtures/data-contract-validation-policy.v1.json`; `fixtures/variable-schema-metadata-shape.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/dataContractValidationPolicyGate.test.ts`; pointer guard tests |
| 213 | Required missing default value policy gate | done | `docs/REQUIRED_MISSING_DEFAULT_VALUE_POLICY_GATE.md`; `fixtures/required-missing-default-value-policy.v1.json`; `fixtures/data-contract-validation-policy.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/requiredMissingDefaultValuePolicyGate.test.ts`; pointer guard tests |
| 214 | Variable compatibility policy gate | done | `docs/VARIABLE_COMPATIBILITY_POLICY_GATE.md`; `fixtures/variable-compatibility-policy.v1.json`; `fixtures/required-missing-default-value-policy.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/variableCompatibilityPolicyGate.test.ts`; pointer guard tests |
| 215 | Variable schema data contract close audit | done | `docs/VARIABLE_SCHEMA_DATA_CONTRACT_CLOSE_AUDIT.md`; `fixtures/variable-reference-discovery.v1.json`; `fixtures/variable-schema-metadata-shape.v1.json`; `fixtures/data-contract-validation-policy.v1.json`; `fixtures/required-missing-default-value-policy.v1.json`; `fixtures/variable-compatibility-policy.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/variableSchemaDataContractCloseAudit.test.ts`; pointer guard tests |
| 216 | Render API contract planning gate | done | `docs/RENDER_API_CONTRACT_PLANNING_GATE.md`; `fixtures/template-publish-accepted-version-metadata.v1.json`; `fixtures/variable-reference-discovery.v1.json`; `fixtures/variable-schema-metadata-shape.v1.json`; `fixtures/data-contract-validation-policy.v1.json`; `fixtures/required-missing-default-value-policy.v1.json`; `fixtures/variable-compatibility-policy.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/renderApiContractPlanningGate.test.ts`; pointer guard tests |
| 217 | Render API request envelope contract gate | done | `docs/RENDER_API_REQUEST_ENVELOPE_CONTRACT_GATE.md`; `fixtures/render-api-request-envelope-contract.v1.json`; `docs/RENDER_API_CONTRACT_PLANNING_GATE.md`; `fixtures/template-publish-accepted-version-metadata.v1.json`; `fixtures/variable-reference-discovery.v1.json`; `fixtures/variable-schema-metadata-shape.v1.json`; `fixtures/data-contract-validation-policy.v1.json`; `fixtures/required-missing-default-value-policy.v1.json`; `fixtures/variable-compatibility-policy.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/renderApiRequestEnvelopeContractGate.test.ts`; pointer guard tests |
| 218 | Render API response status contract gate | done | `docs/RENDER_API_RESPONSE_STATUS_CONTRACT_GATE.md`; `fixtures/render-api-response-status-contract.v1.json`; `fixtures/render-api-request-envelope-contract.v1.json`; `docs/RENDER_API_REQUEST_ENVELOPE_CONTRACT_GATE.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/renderApiResponseStatusContractGate.test.ts`; pointer guard tests |
| 219 | Render-readiness validation policy gate | done | `docs/RENDER_READINESS_VALIDATION_POLICY_GATE.md`; `fixtures/render-readiness-validation-policy.v1.json`; `fixtures/render-api-response-status-contract.v1.json`; `fixtures/render-api-request-envelope-contract.v1.json`; `docs/RENDER_API_RESPONSE_STATUS_CONTRACT_GATE.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/renderReadinessValidationPolicyGate.test.ts`; pointer guard tests |
| 220 | Artifact pointer job status placeholder policy gate | done | `docs/ARTIFACT_POINTER_JOB_STATUS_PLACEHOLDER_POLICY_GATE.md`; `fixtures/artifact-pointer-job-status-placeholder-policy.v1.json`; `fixtures/render-readiness-validation-policy.v1.json`; `fixtures/render-api-response-status-contract.v1.json`; `fixtures/render-api-request-envelope-contract.v1.json`; `docs/RENDER_READINESS_VALIDATION_POLICY_GATE.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/artifactPointerJobStatusPlaceholderPolicyGate.test.ts`; pointer guard tests |
| 221 | Render API error blocker vocabulary gate | done | `docs/RENDER_API_ERROR_BLOCKER_VOCABULARY_GATE.md`; `fixtures/render-api-error-blocker-vocabulary.v1.json`; `fixtures/artifact-pointer-job-status-placeholder-policy.v1.json`; `fixtures/render-readiness-validation-policy.v1.json`; `fixtures/render-api-response-status-contract.v1.json`; `fixtures/render-api-request-envelope-contract.v1.json`; `docs/ARTIFACT_POINTER_JOB_STATUS_PLACEHOLDER_POLICY_GATE.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/renderApiErrorBlockerVocabularyGate.test.ts`; pointer guard tests |
| 222 | Render API contract close audit | done | `docs/RENDER_API_CONTRACT_CLOSE_AUDIT.md`; `fixtures/render-api-error-blocker-vocabulary.v1.json`; `fixtures/artifact-pointer-job-status-placeholder-policy.v1.json`; `fixtures/render-readiness-validation-policy.v1.json`; `fixtures/render-api-response-status-contract.v1.json`; `fixtures/render-api-request-envelope-contract.v1.json`; `docs/RENDER_API_ERROR_BLOCKER_VOCABULARY_GATE.md`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/renderApiContractCloseAudit.test.ts`; pointer guard tests |
| 223 | Mini infrastructure close audit | done | `docs/MINI_INFRASTRUCTURE_CLOSE_AUDIT.md`; `docs/MEASUREMENT_HARDENING_CLOSE_AUDIT.md`; `docs/TEMPLATE_PUBLISH_CLOSE_AUDIT.md`; `docs/VARIABLE_SCHEMA_DATA_CONTRACT_CLOSE_AUDIT.md`; `docs/RENDER_API_CONTRACT_CLOSE_AUDIT.md`; `fixtures/measurement-evidence-summary-manifest.accepted.v1.json`; `fixtures/template-publish-accepted-version-metadata.v1.json`; `fixtures/variable-compatibility-policy.v1.json`; `fixtures/render-api-error-blocker-vocabulary.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/miniInfrastructureCloseAudit.test.ts`; pointer guard tests |
| 224 | Runtime binding implementation planning gate | done | `docs/RUNTIME_BINDING_IMPLEMENTATION_PLANNING_GATE.md`; `docs/MINI_INFRASTRUCTURE_CLOSE_AUDIT.md`; `docs/RENDER_API_REQUEST_ENVELOPE_CONTRACT_GATE.md`; `fixtures/render-api-request-envelope-contract.v1.json`; `fixtures/template-publish-accepted-version-metadata.v1.json`; `fixtures/variable-compatibility-policy.v1.json`; `fixtures/render-api-error-blocker-vocabulary.v1.json`; `docs/CURRENT_STATUS.md`; `docs/NEXT_PHASE_POINTER.md`; `README.md`; `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`; `docs/PHASE_LEDGER.md`; `tests/runtimeBindingImplementationPlanningGate.test.ts`; pointer guard tests |
| 225 | Core retention map | done | `docs/CORE_SERVICE_CONCERN_AUDIT.md`; `docs/CORE_RETENTION_MAP.md`; `README.md`; `docs/PHASE_LEDGER.md`; `tests/coreRetentionMap.test.ts` |
| 226 | Core service consumer map | done | `docs/CORE_SERVICE_CONSUMER_MAP.md`; `docs/CORE_RETENTION_MAP.md`; `docs/CORE_SERVICE_CONCERN_AUDIT.md`; `README.md`; `docs/PHASE_LEDGER.md`; `tests/coreServiceConsumerMap.test.ts` |
| 227 | Backend route parity evidence | done | `docs/CORE_SERVICE_CONSUMER_MAP.md`; `README.md`; `docs/PHASE_LEDGER.md`; `tests/coreServiceConsumerMap.test.ts`; `flowdoc-vnext-backend@2ae6570` |
| 228 | Core route de-export plan | done | `docs/CORE_ROUTE_DEEXPORT_PLAN.md`; `docs/CORE_SERVICE_CONSUMER_MAP.md`; `README.md`; `docs/PHASE_LEDGER.md`; `tests/coreRouteDeexportPlan.test.ts` |
| 229 | Core route deprecation window | done | `src/generation/apiRoute.ts`; `src/generation/artifactApiRoute.ts`; `tests/generationApiRoute.test.ts`; `tests/artifactApiRoute.test.ts`; `docs/CORE_ROUTE_DEPRECATION_WINDOW.md`; `docs/CORE_ROUTE_DEEXPORT_PLAN.md`; `README.md`; `docs/PHASE_LEDGER.md`; `tests/coreRouteDeprecationWindow.test.ts` |
| 230 | Core route retained-contract test rewrite | done | `tests/generationRuntimeRetainedContract.test.ts`; `tests/artifactRetainedContract.test.ts`; `tests/coreRouteRetainedContractRewrite.test.ts`; `docs/CORE_ROUTE_RETAINED_CONTRACT_TEST_REWRITE.md`; `docs/CORE_ROUTE_DEEXPORT_PLAN.md`; `docs/CORE_ROUTE_DEPRECATION_WINDOW.md`; `docs/CORE_SERVICE_CONSUMER_MAP.md`; `README.md`; `docs/PHASE_LEDGER.md` |
| 231 | Core route Window C public export removal | done | `src/index.ts`; `docs/CORE_ROUTE_WINDOW_C_PUBLIC_EXPORT_REMOVAL.md`; `docs/CORE_ROUTE_DEEXPORT_PLAN.md`; `docs/CORE_ROUTE_DEPRECATION_WINDOW.md`; `docs/CORE_ROUTE_RETAINED_CONTRACT_TEST_REWRITE.md`; `docs/CORE_SERVICE_CONSUMER_MAP.md`; `docs/CORE_RETENTION_MAP.md`; `README.md`; `docs/PHASE_LEDGER.md`; `tests/coreRouteWindowCPublicExportRemoval.test.ts`; route guard tests |
| 232 | Core session rich workflow split map | done | `docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md`; `docs/CORE_RETENTION_MAP.md`; `docs/CORE_SERVICE_CONSUMER_MAP.md`; `README.md`; `docs/PHASE_LEDGER.md`; `tests/coreSessionRichWorkflowSplitMap.test.ts` |
| 233 | Core session package snapshot split | done | `src/authoring/sessionStorage.ts`; `tests/sessionPackageSnapshot.test.ts`; `docs/CORE_SESSION_PACKAGE_SNAPSHOT_SPLIT.md`; `docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md`; `docs/SESSION_STORAGE_BOUNDARY.md`; `docs/CORE_RETENTION_MAP.md`; `docs/CORE_SERVICE_CONSUMER_MAP.md`; `README.md`; `docs/PHASE_LEDGER.md`; `tests/coreSessionPackageSnapshotSplit.test.ts` |
| 234 | Core rich inline replay validation split | done | `src/authoring/richInlineSessionPersistence.ts`; `tests/richInlineReplayValidation.test.ts`; `docs/CORE_RICH_INLINE_REPLAY_VALIDATION_SPLIT.md`; `docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md`; `docs/TEMPLATE_BUILDER_RICH_INLINE_SESSION_PERSISTENCE_BOUNDARY.md`; `docs/CORE_RETENTION_MAP.md`; `docs/CORE_SERVICE_CONSUMER_MAP.md`; `README.md`; `docs/PHASE_LEDGER.md`; `tests/coreRichInlineReplayValidationSplit.test.ts`; `tests/coreSessionRichWorkflowSplitMap.test.ts` |
| 235 | Core submission identity/status split | done | `src/workflow/submissionState.ts`; `tests/submissionIdentityStatus.test.ts`; `docs/CORE_SUBMISSION_IDENTITY_STATUS_SPLIT.md`; `docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md`; `docs/SUBMISSION_STATE_BOUNDARY.md`; `docs/CORE_RETENTION_MAP.md`; `docs/CORE_SERVICE_CONSUMER_MAP.md`; `README.md`; `docs/PHASE_LEDGER.md`; `tests/coreSubmissionIdentityStatusSplit.test.ts`; `tests/coreSessionRichWorkflowSplitMap.test.ts` |
| 236 | Core backend consumer rewire closeout | done | `docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md`; `docs/CORE_SERVICE_CONSUMER_MAP.md`; `docs/CORE_RETENTION_MAP.md`; `docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md`; `docs/CORE_SERVICE_CONCERN_AUDIT.md`; `README.md`; `docs/PHASE_LEDGER.md`; `tests/coreBackendConsumerRewireCloseout.test.ts`; `tests/coreServiceConsumerMap.test.ts`; `tests/coreRetentionMap.test.ts`; `tests/coreSessionRichWorkflowSplitMap.test.ts`; `flowdoc-vnext-backend@9d0a850` |
| 237 | Core non-route deprecation window | done | `src/authoring/sessionStorage.ts`; `src/authoring/richInlineSessionPersistence.ts`; `src/workflow/submissionState.ts`; `docs/CORE_NON_ROUTE_DEPRECATION_WINDOW.md`; `docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md`; `docs/CORE_SERVICE_CONSUMER_MAP.md`; `docs/CORE_RETENTION_MAP.md`; `docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md`; `README.md`; `docs/PHASE_LEDGER.md`; `tests/coreNonRouteDeprecationWindow.test.ts` |
| 238 | Core non-route retained-test rewrite | done | `tests/sessionStorage.test.ts`; `tests/richInlineSessionPersistence.test.ts`; `tests/submissionState.test.ts`; `docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md`; `docs/CORE_NON_ROUTE_DEPRECATION_WINDOW.md`; `docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md`; `docs/CORE_SERVICE_CONSUMER_MAP.md`; `docs/CORE_RETENTION_MAP.md`; `docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md`; `README.md`; `docs/PHASE_LEDGER.md`; `tests/coreNonRouteRetainedTestRewrite.test.ts` |
| 239 | Core non-route public-entrypoint test cleanup | done | `tests/sessionPackageSnapshot.test.ts`; `tests/richInlineReplayValidation.test.ts`; `tests/submissionIdentityStatus.test.ts`; `tests/backendRouteStorageBinding.test.ts`; `tests/richInlineLiveExactParityAudit.test.ts`; `tests/storageAdapter.test.ts`; `tests/verticalSliceStorageSimulation.test.ts`; `tests/verticalSliceRcEndToEnd.test.ts`; `docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md`; `README.md`; `docs/PHASE_LEDGER.md`; `tests/coreNonRouteRetainedTestRewrite.test.ts` |
| 240 | Core non-route package-lane cleanup | done | `packages/internal-alpha-runner/src/internalAlphaRecords.ts`; `packages/internal-alpha-runner/src/internalAlphaVerticalSlice.ts`; `packages/internal-alpha-runner/src/storageBackedRcRoundtrip.ts`; `packages/internal-alpha-runner/src/storageRouteBinding.ts`; `packages/internal-alpha-runner/src/index.ts`; `packages/storage-file-json/src/index.ts`; `tests/backendRouteStorageBinding.test.ts`; `docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md`; `README.md`; `docs/PHASE_LEDGER.md`; `tests/coreNonRouteRetainedTestRewrite.test.ts` |
| 241 | Core non-route public export narrowing | done | `src/index.ts`; `src/persistence/storageAdapter.ts`; `tests/coreNonRouteRetainedTestRewrite.test.ts`; `tests/storageAdapter.test.ts`; `tests/storageFileJsonAdapter.test.ts`; `docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md`; `docs/CORE_RETENTION_MAP.md`; `docs/CORE_SERVICE_CONSUMER_MAP.md`; `docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md`; `README.md`; `docs/PHASE_LEDGER.md` |
| 242 | Core compatibility source cleanup audit | done | `docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md`; `src/authoring/sessionStorage.ts`; `src/authoring/richInlineSessionPersistence.ts`; `src/workflow/submissionState.ts`; `tests/coreCompatibilitySourceCleanupAudit.test.ts`; `README.md`; `docs/PHASE_LEDGER.md`; `docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md`; `docs/CORE_RETENTION_MAP.md`; `docs/CORE_SERVICE_CONSUMER_MAP.md`; `docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md` |
| 243 | Core vertical-slice retained storage payload rewrite | done | `tests/verticalSliceStorageSimulation.test.ts`; `tests/verticalSliceRcEndToEnd.test.ts`; `tests/coreCompatibilitySourceCleanupAudit.test.ts`; `docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md`; `README.md`; `docs/PHASE_LEDGER.md` |
| 244 | Core storage adapter generic payload rewrite | done | `tests/storageAdapter.test.ts`; `tests/coreCompatibilitySourceCleanupAudit.test.ts`; `docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md`; `README.md`; `docs/PHASE_LEDGER.md` |
| 245 | Core compatibility composition test rewrite | done | `tests/sessionPackageSnapshot.test.ts`; `tests/richInlineReplayValidation.test.ts`; `tests/richInlineLiveExactParityAudit.test.ts`; `tests/submissionIdentityStatus.test.ts`; `tests/coreCompatibilitySourceCleanupAudit.test.ts`; `docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md`; `README.md`; `docs/PHASE_LEDGER.md` |
| 246 | Core compatibility source deletion | done | `src/authoring/sessionStorage.ts`; `src/authoring/richInlineSessionPersistence.ts`; `src/workflow/submissionState.ts`; `tests/sessionStorage.test.ts`; `tests/sessionPackageSnapshot.test.ts`; `tests/richInlineSessionPersistence.test.ts`; `tests/richInlineReplayValidation.test.ts`; `tests/submissionState.test.ts`; `tests/submissionIdentityStatus.test.ts`; `tests/coreCompatibilitySourceCleanupAudit.test.ts`; `tests/coreNonRouteDeprecationWindow.test.ts`; `tests/coreNonRouteRetainedTestRewrite.test.ts`; `tests/coreRetentionMap.test.ts`; `tests/coreServiceConsumerMap.test.ts`; `tests/coreSessionPackageSnapshotSplit.test.ts`; `tests/coreRichInlineReplayValidationSplit.test.ts`; `tests/coreSubmissionIdentityStatusSplit.test.ts`; `tests/coreSessionRichWorkflowSplitMap.test.ts`; `docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md`; `docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md`; `docs/CORE_RETENTION_MAP.md`; `docs/CORE_SERVICE_CONSUMER_MAP.md`; `docs/CORE_SESSION_PACKAGE_SNAPSHOT_SPLIT.md`; `docs/CORE_RICH_INLINE_REPLAY_VALIDATION_SPLIT.md`; `docs/CORE_SUBMISSION_IDENTITY_STATUS_SPLIT.md`; `docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md`; `README.md`; `docs/PHASE_LEDGER.md` |
| 247 | Node v1 inventory audit | done | `docs/NODE_V1_INVENTORY_AUDIT.md`; `tests/nodeV1InventoryAudit.test.ts`; `README.md`; `docs/PHASE_LEDGER.md`; `flowdoc-vnext-editor@e50e28c`; `flowdoc-vnext-backend@9d4b202` |
| 248 | Text-block v1 grammar lock | done | `docs/TEXT_BLOCK_V1_GRAMMAR_LOCK.md`; `tests/textBlockV1GrammarLock.test.ts`; `docs/NODE_V1_INVENTORY_AUDIT.md`; `README.md`; `docs/PHASE_LEDGER.md`; `flowdoc-vnext-editor@e50e28c`; `flowdoc-vnext-backend@9d4b202` |
| 249 | Text-block v1 grammar validator and normalizer | done | `src/authoring/textBlockV1Grammar.ts`; `src/index.ts`; `tests/textBlockV1Grammar.test.ts`; `tests/textBlockV1GrammarFixtures.test.ts`; `docs/TEXT_BLOCK_V1_GRAMMAR_VALIDATOR.md`; `README.md`; `docs/PHASE_LEDGER.md` |
| 250 | Text-block v1 producer alignment | done | `src/operations/documentOperations.ts`; `tests/operations.test.ts`; `tests/textBlockV1GrammarFixtures.test.ts`; `docs/TEXT_BLOCK_V1_PRODUCER_ALIGNMENT.md`; `docs/TEXT_BLOCK_V1_GRAMMAR_VALIDATOR.md`; `docs/TEXT_BLOCK_V1_GRAMMAR_LOCK.md`; `README.md`; `docs/PHASE_LEDGER.md` |
| 251 | Text-block v1 version and migration decision | done | `src/schema/documentVersionPolicy.ts`; `src/schema/document.ts`; `src/persistence/package.ts`; `src/index.ts`; `tests/textBlockV1VersionMigrationDecision.test.ts`; `docs/TEXT_BLOCK_V1_VERSION_MIGRATION_DECISION.md`; `docs/NODE_V1_INVENTORY_AUDIT.md`; `docs/TEXT_BLOCK_V1_GRAMMAR_LOCK.md`; `docs/TEXT_BLOCK_V1_GRAMMAR_VALIDATOR.md`; `docs/TEXT_BLOCK_V1_PRODUCER_ALIGNMENT.md`; `docs/WORKSPACE_BOUNDARY.md`; `docs/LEGACY_MIGRATION_GATE.md`; `README.md`; `docs/PHASE_LEDGER.md` |
| 252 | Image source contract | done | `src/schema/imageSourceContract.ts`; `src/schema/documentVersionPolicy.ts`; `src/index.ts`; `tests/imageSourceContract.test.ts`; `tests/textBlockV1VersionMigrationDecision.test.ts`; `docs/IMAGE_SOURCE_CONTRACT.md`; `docs/TEXT_BLOCK_V1_VERSION_MIGRATION_DECISION.md`; `docs/NODE_V1_INVENTORY_AUDIT.md`; `docs/TEXT_BLOCK_V1_GRAMMAR_LOCK.md`; `docs/TEXT_BLOCK_V1_GRAMMAR_VALIDATOR.md`; `README.md`; `docs/PHASE_LEDGER.md` |
| 253 | Package v3 image target schemas | done | `src/schema/imageAssetRegistry.ts`; `src/persistence/packageV3ImageTarget.ts`; `src/schema/documentVersionPolicy.ts`; `src/index.ts`; `tests/packageV3ImageTarget.test.ts`; `tests/imageSourceContract.test.ts`; `tests/textBlockV1VersionMigrationDecision.test.ts`; `docs/PACKAGE_V3_IMAGE_TARGET_SCHEMAS.md`; `docs/IMAGE_SOURCE_CONTRACT.md`; `README.md`; `docs/PHASE_LEDGER.md` |
| 254 | Document v4 image target schemas | done | `src/schema/documentV4ImageTarget.ts`; `src/schema/documentVersionPolicy.ts`; `src/index.ts`; `tests/documentV4ImageTarget.test.ts`; `tests/imageSourceContract.test.ts`; `tests/textBlockV1VersionMigrationDecision.test.ts`; `docs/DOCUMENT_V4_IMAGE_TARGET_SCHEMAS.md`; `docs/IMAGE_SOURCE_CONTRACT.md`; `docs/PACKAGE_V3_IMAGE_TARGET_SCHEMAS.md`; `README.md`; `docs/PHASE_LEDGER.md` |
| 255 | Document v4 target schema and containment | done | `src/schema/documentV4Target.ts`; `src/schema/documentV4Structure.ts`; `src/schema/documentVersionPolicy.ts`; `src/index.ts`; `tests/documentV4Target.test.ts`; `tests/imageSourceContract.test.ts`; `tests/textBlockV1VersionMigrationDecision.test.ts`; `docs/DOCUMENT_V4_TARGET_SCHEMA.md`; `docs/DOCUMENT_V4_IMAGE_TARGET_SCHEMAS.md`; `docs/IMAGE_SOURCE_CONTRACT.md`; `docs/PACKAGE_V3_IMAGE_TARGET_SCHEMAS.md`; `docs/NODE_V1_INVENTORY_AUDIT.md`; `README.md`; `docs/PHASE_LEDGER.md` |
| 256 | Package v3/document v4 parser | done | `src/schema/documentV4Foundation.ts`; `src/schema/documentV4ImageTarget.ts`; `src/schema/documentV4Target.ts`; `src/schema/documentV4Structure.ts`; `src/persistence/packageV3.ts`; `src/persistence/packageV3References.ts`; `src/schema/documentVersionPolicy.ts`; `src/index.ts`; `fixtures/product-report-v4-image-target.flowdoc.json`; `tests/packageV3.test.ts`; `tests/documentV4Target.test.ts`; `tests/documentV4ImageTarget.test.ts`; `tests/imageSourceContract.test.ts`; `tests/textBlockV1VersionMigrationDecision.test.ts`; `docs/PACKAGE_V3_DOCUMENT_V4_PARSER.md`; `docs/DOCUMENT_V4_TARGET_SCHEMA.md`; `docs/IMAGE_SOURCE_CONTRACT.md`; `docs/PACKAGE_V3_IMAGE_TARGET_SCHEMAS.md`; `docs/NODE_V1_INVENTORY_AUDIT.md`; `README.md`; `docs/PHASE_LEDGER.md` |
| 257 | Package v2/document v3 to package v3/document v4 migration | done | `src/migration/packageV2ToV3Types.ts`; `src/migration/packageV2ToV3Audit.ts`; `src/migration/packageV2ToV3.ts`; `src/schema/documentVersionPolicy.ts`; `src/index.ts`; `fixtures/product-report-v4-migrated-minimal.flowdoc.json`; `tests/packageV2ToV3Migration.test.ts`; `tests/textBlockV1VersionMigrationDecision.test.ts`; `tests/imageSourceContract.test.ts`; `docs/PACKAGE_V2_TO_V3_MIGRATION.md`; `docs/FIXTURE_ROLES.md`; `docs/PACKAGE_V3_DOCUMENT_V4_PARSER.md`; `docs/PACKAGE_V3_IMAGE_TARGET_SCHEMAS.md`; `docs/DOCUMENT_V4_TARGET_SCHEMA.md`; `docs/IMAGE_SOURCE_CONTRACT.md`; `docs/NODE_V1_INVENTORY_AUDIT.md`; `README.md`; `docs/PHASE_LEDGER.md` |
| 258 | Cross-repo version capability reporting | done | `src/schema/versionCapability.ts`; `src/schema/documentVersionPolicy.ts`; `src/index.ts`; `tests/versionCapability.test.ts`; `tests/textBlockV1VersionMigrationDecision.test.ts`; `docs/VERSION_CAPABILITY_CONTRACT.md`; `docs/PACKAGE_V2_TO_V3_MIGRATION.md`; `docs/CROSS_REPO_OPERATING_MAP.md`; `README.md`; `docs/PHASE_LEDGER.md`; `flowdoc-vnext-backend@a7ca3b7`; `flowdoc-vnext-editor@a4c501e` |
| 259 | Backend revision-gated migration persistence | done | `src/schema/documentVersionPolicy.ts`; `tests/versionCapability.test.ts`; `tests/textBlockV1VersionMigrationDecision.test.ts`; `docs/VERSION_CAPABILITY_CONTRACT.md`; `docs/PACKAGE_V2_TO_V3_MIGRATION.md`; `docs/CROSS_REPO_OPERATING_MAP.md`; `README.md`; `docs/PHASE_LEDGER.md`; `flowdoc-vnext-backend@f80cd27`; `flowdoc-vnext-editor@ccb63fa` |
| 260 | Document v4 read-only runtime consumer | done | `src/runtime/readOnlySessionV4.ts`; `src/schema/versionCapability.ts`; `src/schema/documentVersionPolicy.ts`; `src/index.ts`; `tests/readOnlySessionV4.test.ts`; `tests/versionCapability.test.ts`; `tests/textBlockV1VersionMigrationDecision.test.ts`; `docs/READ_ONLY_RUNTIME_V4.md`; `docs/VERSION_CAPABILITY_CONTRACT.md`; `docs/CROSS_REPO_OPERATING_MAP.md`; `README.md`; `flowdoc-vnext-backend@b299e94`; `flowdoc-vnext-editor@5c422de` |
| 261 | Explicit editor document migration workflow | done | `src/schema/documentVersionPolicy.ts`; `tests/versionCapability.test.ts`; `tests/textBlockV1VersionMigrationDecision.test.ts`; `docs/VERSION_CAPABILITY_CONTRACT.md`; `docs/READ_ONLY_RUNTIME_V4.md`; `docs/PACKAGE_V2_TO_V3_MIGRATION.md`; `docs/CROSS_REPO_OPERATING_MAP.md`; `README.md`; `flowdoc-vnext-backend@5ea90bc`; `flowdoc-vnext-editor@2c0c97d` |
| 262 | Document v4 same-parent reorder vertical slice | done | `src/operations/documentV4Operations.ts`; `src/runtime/readOnlySessionV4.ts`; `src/schema/versionCapability.ts`; `src/schema/documentVersionPolicy.ts`; `src/index.ts`; `tests/documentV4Operations.test.ts`; `tests/readOnlySessionV4.test.ts`; `tests/versionCapability.test.ts`; `docs/DOCUMENT_V4_REORDER_OPERATION.md`; `docs/VERSION_CAPABILITY_CONTRACT.md`; `docs/CROSS_REPO_OPERATING_MAP.md`; `README.md`; `flowdoc-vnext-backend@c77474a`; `flowdoc-vnext-editor@ed22cbc` |
| 263 | Document v4 block-subtree delete vertical slice | done | `src/operations/documentV4Operations.ts`; `src/runtime/readOnlySessionV4.ts`; `src/schema/versionCapability.ts`; `tests/documentV4Operations.test.ts`; `tests/readOnlySessionV4.test.ts`; `tests/versionCapability.test.ts`; `docs/DOCUMENT_V4_DELETE_OPERATION.md`; `docs/DOCUMENT_V4_REORDER_OPERATION.md`; `docs/VERSION_CAPABILITY_CONTRACT.md`; `docs/CROSS_REPO_OPERATING_MAP.md`; `README.md`; `flowdoc-vnext-backend@be2047a`; `flowdoc-vnext-editor@9bad0e9` |
| 264 | Document v4 block-subtree duplicate vertical slice | done | `src/operations/documentV4Operations.ts`; `src/runtime/readOnlySessionV4.ts`; `src/schema/versionCapability.ts`; `tests/documentV4Operations.test.ts`; `tests/readOnlySessionV4.test.ts`; `tests/versionCapability.test.ts`; `docs/DOCUMENT_V4_DUPLICATE_OPERATION.md`; `docs/DOCUMENT_V4_DELETE_OPERATION.md`; `docs/DOCUMENT_V4_REORDER_OPERATION.md`; `docs/VERSION_CAPABILITY_CONTRACT.md`; `docs/CROSS_REPO_OPERATING_MAP.md`; `README.md`; `flowdoc-vnext-core@59a852c`; `flowdoc-vnext-backend@87f68db`; `flowdoc-vnext-editor@2b598d3` |
| 265 | Document v4 node-readiness architecture lock | done | `docs/DOCUMENT_V4_NODE_READINESS_ARCHITECTURE_LOCK.md`; `docs/NODE_FAMILY_CAPABILITY_MODEL.md`; `tests/documentV4NodeReadinessArchitectureLock.test.ts`; `README.md`; `docs/PHASE_LEDGER.md` |
| 266 | Document v4 generic lifecycle close audit | done | `src/operations/documentV4Operations.ts`; `src/runtime/readOnlySessionV4.ts`; `tests/documentV4GenericLifecycleAudit.test.ts`; `tests/readOnlySessionV4.test.ts`; `docs/DOCUMENT_V4_GENERIC_LIFECYCLE_CLOSE_AUDIT.md`; `docs/CROSS_REPO_OPERATING_MAP.md`; `README.md`; `flowdoc-vnext-core@19ae304`; `flowdoc-vnext-backend@71a5fe4`; `flowdoc-vnext-editor@ce2d39a` |
| 267 | Document v4 node-family readiness matrix | done | `docs/DOCUMENT_V4_NODE_FAMILY_READINESS_MATRIX.md`; `tests/documentV4NodeFamilyReadinessMatrix.test.ts`; `docs/DOCUMENT_V4_NODE_READINESS_ARCHITECTURE_LOCK.md`; `docs/DOCUMENT_V4_GENERIC_LIFECYCLE_CLOSE_AUDIT.md`; `docs/CROSS_REPO_OPERATING_MAP.md`; `README.md`; `docs/PHASE_LEDGER.md`; `flowdoc-vnext-core@928ec51` |
| 268 | Structure Definition and Document Instance architecture lock | done | `docs/STRUCTURE_INSTANCE_ARCHITECTURE_LOCK.md`; `tests/structureInstanceArchitectureLock.test.ts`; `docs/CROSS_REPO_OPERATING_MAP.md`; `README.md`; `docs/PHASE_LEDGER.md` |
| 269 | Structure Definition and Document Instance v4 impact audit | done | `docs/STRUCTURE_INSTANCE_V4_IMPACT_AUDIT.md`; `tests/structureInstanceV4ImpactAudit.test.ts`; `docs/STRUCTURE_INSTANCE_ARCHITECTURE_LOCK.md`; `docs/CROSS_REPO_OPERATING_MAP.md`; `README.md`; `docs/PHASE_LEDGER.md` |
| 270 | Structure lifecycle identity contracts | done | `src/lifecycle/structureIdentity.ts`; `src/index.ts`; `tests/structureIdentity.test.ts`; `docs/STRUCTURE_LIFECYCLE_IDENTITY_CONTRACT.md`; `docs/STRUCTURE_INSTANCE_ARCHITECTURE_LOCK.md`; `docs/STRUCTURE_INSTANCE_V4_IMPACT_AUDIT.md`; `docs/CROSS_REPO_OPERATING_MAP.md`; `README.md`; `docs/PHASE_LEDGER.md` |
| 271 | Structure Policy and effective capability contracts | done | `src/lifecycle/structurePolicy.ts`; `src/schema/documentV4Target.ts`; `src/index.ts`; `tests/structurePolicy.test.ts`; `docs/STRUCTURE_POLICY_EFFECTIVE_CAPABILITY_CONTRACT.md`; `docs/STRUCTURE_LIFECYCLE_IDENTITY_CONTRACT.md`; `docs/CROSS_REPO_OPERATING_MAP.md`; `README.md`; `docs/PHASE_LEDGER.md` |

## Phase 271 Structure Policy And Effective Capability Contracts

Phase 271 implements strict standalone Structure Policy metadata, deterministic
explicit-node/parent-child/default binding precedence, node and child action
vocabularies, Style Key allowlists, child type/cardinality constraints, and
structured effective-capability denials across core, structure, and session
layers. Policy v1 has no inheritance graph and cannot widen core containment.

The policy contract remains outside canonical package parsers and is not wired
into current v4 operations, backend mutation, editor command policy, or product
authorization. Next: define pure materialization and provenance semantics using
accepted lifecycle identities and policy bindings.

## Phase 270 Structure Lifecycle Identity Contracts

Phase 270 implements strict JSON-safe retained identities for mutable Structure
Definition drafts, immutable Published Structure Versions, and Materialized
Document Instances. It separates stable structure lineage, mutable draft and
instance revisions, immutable version id/ordinal, source draft provenance, and
the exact published version pin governing each instance. Cross-lineage
provenance, blank ids, invalid revisions/ordinals, and unknown fields are
rejected.

The contract is standalone metadata and does not enter package 2/document 3 or
package 3/document 4 parsers. Backend allocation/persistence, publish,
materialization, policy, migration, editor workflow, and instance APIs remain
inactive. Next: define Structure Policy attachment and effective capability
semantics against these accepted identity domains.

## Phase 269 Structure Definition And Document Instance V4 Impact Audit

Phase 269 classifies current core, backend, and editor contracts against the
Phase 268 lifecycle. It retains v4 node/graph/reference semantics, deterministic
generic operations, explicit migration/source retention, backend revision
gates, editor adapter isolation, and stale apply. It marks the single
`kind: "document"` envelope, package data fallback, artifact-agnostic storage,
inline-template generation request, missing Structure Policy, and product
terminology as change-required.

Invoice, general report, and governed operation-guide cases all converge on one
Resolved Document and measured artifact pipeline. Repeat/collection execution
and compliance remain deferred; legacy generator shapes remain rejected as
canonical input. This phase changes no schema, parser, operation, storage,
route, editor, policy, materialization, resolution, or artifact runtime. Next:
lock minimum Structure Definition, Published Structure Version, and
Materialized Document Instance identity/version contracts.

## Phase 268 Structure Definition And Document Instance Architecture Lock

Phase 268 locks Structure Definition authoring as the product north star and
separates mutable structure drafts, immutable Published Structure Versions,
Materialized Document Instances, atomic Data Snapshots, derived Resolved
Documents, and downstream Artifacts. Instance creation materializes the starter
graph once while retaining governance from the pinned structure version;
generated entries, repeat output, page facts, and measured fragments remain
derived rather than authored instance truth.

The lock keeps simple mapped forms and governed long-form composition on one
document pipeline, classifies legacy SRS/operation-guide generators as
requirement evidence only, and retains compliance/governance systems as future
architecture pressure. It changes no schema, parser, operation, editor,
backend, materialization, policy, resolution, pagination, or artifact runtime.
Next: audit current package 3/document 4 and cross-repo consumers against the
locked lifecycle before selecting canonical package identities.

## Phase 267 Document V4 Node-Family Readiness Matrix

Phase 267 publishes independent schema/reference, parent/role, read, lifecycle,
edit/history, layout/pagination, render/export, editor/backend, and scale status
for every authored v4 node type. Evidence distinguishes protected structural
internals from enabled block lifecycle and identifies text-block grammar,
identity, field placement, selection, transactions, measured lines, and
cross-page acceptance as the next critical path.

This phase changes no runtime behavior. Columns/table node-specific work remains
blocked on text-block acceptance. Next: lock the text-block contracts before
editor draft or measured-line implementation.

## Phase 266 Document V4 Generic Lifecycle Close Audit

Phase 266 proves delete, duplicate, and reorder across all 20 valid v4
block/parent combinations, protects zone/column/row/cell structural internals,
and retains body-only page-break policy. It rejects same-index reorder before a
history-ready commit or backend revision, and aligns image operation-surface
reporting with the media family across core/editor.

This phase intentionally does not activate node-specific editing, cross-parent
move, measured layout, renderer, export, collaboration, or publish behavior.
Next: publish the evidence-backed node-family readiness matrix.

## Phase 265 Document V4 Node-Readiness Architecture Lock

Phase 265 locks authored, field, editor, measured-layout, media, and published
template truth boundaries before node-specific v4 authoring work. It makes
text-block measurement/source mapping and cross-page acceptance prerequisites
for columns/table split planners, aligns the node-family model with the current
v4 schema, and defines evidence axes for the next readiness matrix.

This phase intentionally changes no schema, parser, operation, editor, backend,
layout, renderer, export, or publish behavior. Next: close-audit the generic v4
node lifecycle across valid parent contexts.

## Phase 264 Document V4 Block-Subtree Duplicate Vertical Slice

Phase 264 completes the generic v4 node lifecycle with deterministic
block-subtree duplicate semantics.

- core rewrites every authored node and rich-inline id in the copied subtree;
- containment links point at copied identities while field/data/asset registry
  references remain shared;
- the copied root is inserted immediately after its source in the same parent;
- backend persists accepted copies behind the existing base-revision gate;
- editor partial mode enables duplicate only when core node capability and
  backend operation reporting agree;
- strict full target validation remains required before success.

This phase intentionally does not add text/image editing, cross-parent moves,
registry cloning, measured pagination, exact rendering, or export. Next:
close-audit generic lifecycle behavior and build a node-family readiness matrix
before entering text-block editing semantics.

## Phase 263 Document V4 Block-Subtree Delete Vertical Slice

Phase 263 opens v4 `node.delete` after locking ownership and reference impact.

- Delete is limited to complete block subtrees under zone, column, or table
  cell parent lists; structural internals remain unsupported.
- Core removes containment nodes atomically and strictly validates the complete
  target package before success.
- Fields, data values, image assets, migration snapshots, and receipts are not
  garbage-collected by node deletion.
- Backend persists v4 delete through the existing revision gate and continues
  to reject v4 duplicate.
- Editor partial mode enables delete confirmation and reorder only when core
  node facts and backend operation reporting agree.
- Duplicate ID allocation and shared registry semantics remain the next
  operation gate.

## Phase 262 Document V4 Same-Parent Reorder Vertical Slice

Phase 262 opens the first package 3/document 4 mutation without implying full
v4 activation.

- Capability contract v3 reports supported operation kinds per version pair.
- Core owns a separate strict v4 package operation kernel for same-parent
  `node.reorder` under zone, column, and table-cell block lists.
- The kernel preserves source immutability, validates the complete target, and
  returns history, scope, and node-structure invalidation facts.
- Backend persists v4 reorder through the existing base-revision write gate and
  rejects every other v4 mutation kind.
- Editor requires both core node capability and backend pair/operation support,
  enters `partial` mode, and keeps text/delete/duplicate/live/exact layout off.
- Remaining activation work is named by
  `v4-remaining-operation-layout-render-support`.

## Phase 261 Explicit Editor Document Migration Workflow

Phase 261 closes the explicit editor migration-intent blocker without widening
package 3/document 4 mutation or output capabilities.

- Editor exposes an explicit capability-gated Upgrade command for fresh
  backend package 2/document 3 state only.
- Migration requests capture document id, base revision, request id, source,
  and bounded reason before calling the existing backend route.
- Applied and idempotently replayed results require a matching target document
  read and strict v4 read-only core acceptance before runtime replacement.
- Stale, rejected, mismatched, and unavailable results retain current editor
  state and expose an operation status.
- Indeterminate transport/read failures reuse the original request id so the
  backend receipt can recover through replay.
- The remaining activation blocker is v4 mutation, measured layout, exact
  rendering, and export support.

## Phase 260 Document V4 Read-Only Runtime Consumer

Phase 260 makes persisted package 3/document 4 records safely consumable
without activating v4 mutation or output pipelines.

- Core strictly parses v4 into a separate named read-only session with
  normalized node, relationship, section, zone, and nearest-context indexes.
- Read-only capabilities are false and supported operation kinds are empty.
- Backend advertises active and target document reads separately from its
  active-only mutation pair.
- Editor routes v4 through the core adapter, shows structural text/columns/
  table/image surfaces, and locks text drafts, field chips, structural mutation,
  live layout, and exact layout.
- Image output is a structural placeholder; asset bytes and exact rendering are
  intentionally not claimed.
- Remaining activation gates are explicit editor migration intent and v4
  mutation/measured-layout/render/export support.

## Phase 259 Backend Revision-Gated Migration Persistence

Phase 259 persists explicit package v2/document v3 migrations as package
v3/document v4 without activating v4 runtime consumers.

- Backend request parsing owns route/path identity and bounded intent fields.
- Base revision is checked before core planning and again at repository write.
- Core planner/apply remains the semantic source of truth.
- The in-memory repository atomically records target revision, retained source
  snapshot, and idempotency receipt.
- Identical request replay returns the accepted revision; payload drift under a
  reused request id is rejected.
- Active mutation is rejected after a record becomes package 3/document 4.
- Backend capability reports migration persistence and source retention as
  available; editor evidence consumes that fact without adding migration UI.
- Remaining gates are explicit editor intent and v4 runtime consumer support.

## Phase 258 Cross-Repo Version Capability Reporting

Phase 258 defines core semantic version-pair facts and downstream reporting
without activating package v3/document v4 runtime consumption.

- Package 2/document 3 is active for parse, runtime, mutation, and migration
  source planning.
- Package 3/document 4 is recognized only for parse and migration-target
  validation.
- Unsupported pairs and malformed markers are classified before parser use.
- Backend exposes service-owned read/mutation/migration availability separately
  from core semantic capability.
- Editor consumes the backend response through its transport boundary and
  blocks non-active package pairs before active runtime loading.
- The remaining activation blocker is backend revisioned migration persistence.

## Phase 257 Package V2 Document V3 To Package V3 Document V4 Migration

Phase 257 implements the explicit source-immutable migration planner and apply
boundary without activating downstream consumers.

- Raw v3 input is compared with its parsed canonical form so unknown keys that
  would otherwise be stripped become blocking issues.
- Source graph and zone contexts gate Text-block v1 grammar planning.
- Empty text and raw line breaks are the only authored text normalizations.
- Package/data versions and an empty image registry are added deterministically.
- Page-break, table, field, image, and collection ambiguity blocks migration
  rather than deleting, moving, padding, resizing, or reinterpreting content.
- Apply accepts only ready plans and revalidates the complete target through the
  strict package v3/document v4 parser.
- Paired minimal fixtures prove exact target output while active runtime,
  backend persistence, and editor support remain unchanged.
- Version policy now retains only downstream consumer support as an activation
  blocker.

## Phase 256 Package V3 Document V4 Parser

Phase 256 composes the strict named package v3/document v4 parser without
activating runtime consumers.

- V4-owned strict foundation schemas prevent nested unknown-key stripping.
- Target FieldRegistry v1 enforces strict facts, key equality, and non-scalar
  fallback ownership for image/collection fields.
- Safe parse distinguishes unsupported version, invalid package, invalid
  structure, and invalid references.
- Exact paths cover scalar field refs, inline/block image sources, fallback
  assets, DataSnapshot v2 values, and structural failures.
- A target fixture proves package v3/document v4 parse/serialize round-trip.
- Active package v2 parsing and runtime/editable/generation session entrypoints
  remain isolated.
- Version-policy activation blockers now move to migration and downstream
  consumer support.

## Phase 255 Document V4 Target Schema And Containment

Phase 255 composes the complete isolated document v4 authored union and pure
structural validation without activating package or runtime consumers.

- Block image is accepted under zone, column, and table cell while remaining a
  childless structural node separate from text-block.
- Nested columns remain canonical; tables/columns remain disallowed in cells.
- Page-break is restricted to direct body-zone flow, closing ignored columns,
  table-cell, and static-zone behavior in the target version.
- Page-number is restricted out of body zones and inline ids are unique within
  each text-block.
- Validation adds duplicate section/node, key/id, reachability, parent, cycle,
  columns-width, positive table-width, rectangular table-grid, and header-count
  invariants.
- Active document v3 schema, graph, operations, pagination, and renderer remain
  unchanged.

## Phase 254 Document V4 Image Target Schemas

Phase 254 implements isolated authored image target schemas without activating
document v4 or package v3 parsing.

- Shared strict source, accessibility, positive frame, fit, and normalized crop
  schemas reject URLs, bytes, free positioning, and ambiguous alt semantics.
- Target Text-block v4 adds atomic inline-image alongside tightened text,
  field-ref, page-number, and line-break forms.
- Block image remains a separate structural payload without children, caption,
  floating, wrapping, overlap, or absolute coordinates.
- Pure validation checks static assets, image fields, field compatibility, and
  fallback assets against Phase 253 registries.
- Active document v3 remains isolated and rejects both target image forms.
- Version-policy activation now waits for full document v4 composition rather
  than the completed image target schemas.

## Phase 253 Package V3 Image Target Schemas

Phase 253 implements target package-level image schemas without activating a
package v3/document v4 parser.

- Strict ImageAssetRegistry v1 validates immutable identity, canonical raster
  media, byte length, SHA-256 digest, intrinsic pixels, and key/id equality.
- Strict DataSnapshot v2 retains scalar values and adds `image-asset-ref`.
- Pure cross-reference validation blocks missing image fields, field-type
  mismatches, scalar image values, and missing manifest assets.
- Storage locators, URLs, bytes, upload state, alt text, and crop are rejected
  from manifest entries.
- Active package v2/document v3 parsing and fixtures remain unchanged.
- Version-policy activation now waits for a full package v3 parser rather than
  the completed image registry schema.

## Phase 252 Image Source Contract

Phase 252 separates canonical image identity, backend bytes, field values, and
authored placements before target schema implementation.

- Package truth owns an immutable image asset manifest while backend owns bytes,
  locators, upload state, retention, and garbage collection.
- Static `asset-ref` and dynamic `image-field-ref` form one shared source union
  for inline and block image placements.
- Data snapshot v2 represents image field values as manifest-backed asset refs;
  field registry v1 already carries the image field type.
- Required authored frames, placement-owned accessibility/crop, bounded fit and
  alignment, and no floating/wrap semantics stabilize v1 layout behavior.
- The package asset manifest changes the envelope, resolving the target to
  package v3/document v4 while leaving active v2/v3 parsing unchanged.
- Public decision facts and source guards do not activate image schemas,
  uploads, migration, diagnostics, layout, or rendering.

## Phase 251 Text-block v1 Version And Migration Decision

Phase 251 preserves package v2/document v3 as the active canonical format and
selects document v4 as the target for tightened Text-block v1 grammar plus
inline and block image shapes.

- Package v2 remains the provisional target because text grammar and authored
  nodes do not change the package envelope.
- The Image Source Contract must reopen package version if canonical asset
  truth adds a required package-level registry or envelope field.
- V3 reads remain strict and unchanged; package reads never normalize or
  silently upgrade.
- Migration is explicit copy-forward: core owns pure semantic planning and
  target validation, backend owns revisioned persistence and source retention,
  and editor owns user intent and refreshed-revision application.
- A public JSON-safe policy record exposes active and target versions,
  migration mode, and activation blockers without adding a v4 parser or
  migration executor.

## Phase 250 Text-block v1 Producer Alignment

Phase 250 removes the accepted-write debt identified by the target grammar
validator without changing document versions or package-read behavior.

- Table row and column insert now create paragraph text-blocks with canonical
  empty `children: []`.
- One operation-local factory keeps both table producers on the same authored
  shape.
- Generated cells still own concrete text-block nodes and preserve existing
  operation scope, invalidation, and history contracts.
- Functional tests prove both generated shape and target-grammar acceptance.
- Editor caret placeholders remain runtime-only and are not authored inline
  children.

## Phase 249 Text-block v1 Grammar Validator And Normalizer

Phase 249 implements an opt-in pure target-grammar boundary without changing
package v2/document v3 parsing or accepted write paths.

- Validation returns valid, normalization-required, or blocked with JSON-safe
  issues and counts.
- Deterministic normalization removes empty text and converts raw CR/LF to
  explicit line-break atomics while preserving text styles and stable ids.
- Duplicate ids, malformed inline shapes, unsafe Unicode, missing/incompatible
  fields, and invalid page-number zones block without guessed repairs.
- Image and collection fields cannot pass as scalar text field-ref usages.
- UTF-16 offset safety rejects positions inside surrogate pairs while leaving
  grapheme policy to the input adapter.
- All 72 text-blocks across the four current product fixtures pass without
  normalization or blockers.
- Existing parser, operations, backend, editor, layout, and renderer behavior
  remain unchanged.

## Phase 248 Text-block v1 Grammar Lock

Phase 248 locks the target Text-block v1 grammar before schema/runtime work.

- Text-block remains a flat ordered inline list with block-scoped UTF-16 model
  offsets.
- Text leaves target non-empty text without CR/LF; line breaks become explicit
  inline atomics and canonical empty blocks use `children: []`.
- Field-ref, page-number, and future inline-image are one-slot managed atomics.
- Sparse style remains on text leaves while insertion marks, caret, selection,
  and IME remain runtime facts.
- Nested active text-block targeting is separated from columns/table group
  structural selection.
- Granular transactions remain primary; full rich replacement remains a
  bounded single-user fallback and not collaboration protocol.
- The phase reserves inline-image semantics but does not add its schema or
  choose its source/document-version contract.
- `tests/textBlockV1GrammarLock.test.ts` guards vocabulary, ownership, offset,
  blockers, current source evidence, and repository navigation.

## Phase 247 Node v1 Inventory Audit

Phase 247 records the current Node v1 truth across canonical schema,
relationship graph, operations, pagination, backend package passage, and the
product editor presentation boundary.

- The audit inventories eleven authored node types and four inline node types.
- It distinguishes canonical capability from product-visible surface and
  transport reachability.
- It records divider/spacer presentation, internal structural capabilities,
  page-break-in-columns behavior, and missing insertion ownership as blockers
  rather than silently changing runtime behavior.
- It accepts text-block grammar as the next detailed phase and requires both
  inline and block image forms before Node v1 closes.
- It keeps fragmentation, field placement, virtualization, upload/crop, and
  exact editor/export parity deferred.
- `tests/nodeV1InventoryAudit.test.ts` guards inventory completeness, required
  review sections, cross-repo evidence pointers, and the no-runtime-change
  boundary.

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

## Phase 154 Input Runtime Ownership Boundary

Phase 154 implements the first browser-local ownership classifier for the
selected hybrid managed card input lane:

- `examples/template-builder-sandbox/public/inputRuntimeOwnership.js` defines
  the ownership source/mode constants, target types, rejection reasons,
  command readiness shape, target classifier, and summary label;
- ownership can classify `none`, `managed-card-selection`,
  `active-text-block-island`, `textarea-fallback`, and `rejected` targets;
- ownership facts include active node id, active text-block id, target type,
  reason, allowed commands, blocked commands, fallback reason, command
  readiness, owner responsibilities, browser-local status, canonical package
  truth status, core commit status, and production readiness status;
- unsupported targets, full-document contenteditable, raw DOM HTML package
  truth, non-text island requests, invalid fallback requests, missing node ids,
  and multiple active islands return explicit rejection reasons;
- IME composition blocks commit bridge preparation;
- `tests/hybridInputRuntimeOwnership.test.ts` proves the pure ownership
  decisions, one-island guard, composition commit guard, dependency cleanliness,
  docs, roadmap, and phase trail.

This phase intentionally does not bind DOM events, implement production
contenteditable behavior, commit document mutations, add storage/backend
routes, add PDF/DOCX renderer work, copy legacy editor runtime, or change
package/document schema.

## Phase 155 Active Text-Block Island Boundary

Phase 155 implements the browser-local active text-block island lifecycle after
Phase 154 ownership selects an island target:

- `examples/template-builder-sandbox/public/activeTextBlockIsland.js` defines
  the active island source/mode constants, lifecycle states, transition
  helpers, commit readiness helper, and label helper;
- lifecycle states cover inactive, opening, active, composing, dirty,
  committing, rejected, and closed;
- state tracks text-block id, draft text, rich segment summary, normalized
  UTF-16 selection facts, composition status, dirty flag, fallback
  eligibility, commit request facts, and close reason;
- IME composition blocks commit request;
- cross-block selection and draft updates are rejected;
- closing a dirty island without a commit is explicit;
- `tests/activeTextBlockIsland.test.ts` proves lifecycle transitions,
  composition guard behavior, cross-block rejection, close reasons, dependency
  cleanliness, docs, roadmap, and phase trail.

This phase intentionally does not use DOM Selection/Range objects, commit to
vNext core, handle paste/delete semantics, support cross-block selection, claim
production IME readiness, bind DOM events, add storage/backend routes, add
PDF/DOCX renderer work, copy legacy editor runtime, or change package/document
schema.

## Phase 156 Hybrid Command Policy Boundary

Phase 156 implements the DOM-free command policy matrix for the hybrid input
lane:

- `examples/template-builder-sandbox/public/hybridInputCommandPolicy.js`
  defines command kind constants, readiness constants, rejection reason
  constants, the policy evaluator, and label helper;
- command kinds cover text insert/delete, selection replace, rich inline style
  toggle, field chip insert/delete, text paste, rich paste, commit, and cancel;
- policy results return ready, fallback, or blocked with target type,
  execution mode, command, and reason;
- IME composition blocks destructive commands and commit;
- field chip internals cannot be edited as raw text;
- cross-block selection, unsupported HTML paste, structural boundary delete,
  and ambiguous style overlap are blocked explicitly;
- textarea fallback keeps plain-text commands ready while rich commands fall
  back;
- `tests/hybridInputCommandPolicy.test.ts` proves active island readiness,
  composition blocking, field-chip internal blocking, paste/delete blocking,
  textarea fallback, managed card behavior, dependency cleanliness, docs,
  roadmap, and phase trail.

This phase intentionally does not execute commands, mutate package data, bind
DOM events, implement field-chip behavior beyond policy decisions, add
storage/backend routes, add PDF/DOCX renderer work, copy legacy editor runtime,
or change package/document schema.

## Phase 157 DOM Binding Smoke Boundary

Phase 157 implements a bounded JSON-safe DOM binding smoke for one active
text-block island:

- `examples/template-builder-sandbox/public/activeTextBlockDomBinding.js`
  defines the DOM binding smoke source/mode constants, capture helper, and
  label helper;
- accepted capture facts include active node id, text-block id, text snapshot,
  text length, UTF-16 selection start/end, composition active flag, and safe
  status;
- unsafe captures are rejected for missing active island, missing surface,
  missing contenteditable root, target mismatch, text mismatch, missing or
  out-of-range offsets, and DOM Range/object selection facts;
- DOM state remains browser-local and JSON-safe;
- `tests/activeTextBlockDomBinding.test.ts` proves accepted capture facts,
  composition facts, unsafe diagnostics, dependency cleanliness, docs,
  roadmap, and phase trail.

This phase intentionally does not claim production DOM range support, support
all browsers, handle paste/delete semantics, commit to core, implement
production contenteditable behavior, add storage/backend routes, add PDF/DOCX
renderer work, copy legacy editor runtime, or change package/document schema.

## Phase 158 Active Island Commit Bridge Smoke

Phase 158 implements a bounded active-island capture to rich inline commit
bridge smoke:

- `examples/template-builder-sandbox/public/activeIslandCommitBridge.js`
  defines source/mode constants, the v1 `text-block.rich-inline.replace`
  operation kind, bridge request builder, and label helper;
- accepted capture facts become a `sandbox.commitRichInline` request with a
  planned rich inline replacement operation;
- `tests/activeIslandCommitBridge.test.ts` sends the generated request through
  the existing sandbox mutation bridge and verifies packet refresh plus
  live/exact stale signal;
- stale and unsafe paths remain rejected and do not produce new bridge
  requests;
- runtime cache refresh stays bounded to packet response expectations.

This phase intentionally does not implement granular rich inline operations,
claim collaboration/offline safety, commit raw contenteditable HTML, bypass the
rich inline commit boundary, add storage/backend routes, add PDF/DOCX renderer
work, copy legacy editor runtime, or change package/document schema.

## Phase 159 Field Chip Command Boundary

Phase 159 implements pure authoring contracts for field-chip commands:

- `src/authoring/fieldChipCommands.ts` defines source/mode constants, command
  kinds, clipboard facts, field-chip facts, rich inline intent facts, and
  `createFieldChipCommand(...)`;
- `src/index.ts` exports the field-chip command boundary;
- commands cover delete, copy, paste, replace-with-text, and blocked internal
  edit;
- safe delete, paste, and replace-with-text produce planned
  `text-block.rich-inline.replace` intent;
- copy produces field-chip clipboard facts without mutation intent;
- internal chip edits, cross-block selection, missing chip, missing field key,
  and missing clipboard field chip are blocked explicitly;
- `tests/fieldChipCommands.test.ts` proves safe command intents, copy behavior,
  blocked unsafe facts, export boundary, docs, roadmap, and phase trail.

This phase intentionally does not bind DOM events, implement collaboration
semantics, change package/document schema, allow arbitrary chip internals to
become editable text, add storage/backend routes, add PDF/DOCX renderer work,
copy legacy editor runtime, or claim production contenteditable readiness.

## Phase 160 Paste/Delete Preflight Boundary

Phase 160 implements browser-local preflight for paste and delete decisions:

- `examples/template-builder-sandbox/public/pasteDeletePreflight.js` defines
  source/mode constants, normalized actions, the preflight helper, and label
  helper;
- preflight handles plain text paste, rich text paste summary, unsupported HTML
  paste, delete selection, backspace near field chip, delete across chip
  boundary, delete across structural boundary, and IME composition guard;
- results return allow, transform, fallback, or reject;
- field chip and structural boundaries are protected;
- unsafe HTML is rejected or normalized;
- `tests/pasteDeletePreflight.test.ts` proves paste normalization, rich paste
  fallback/transform/reject, field-chip boundary transform/reject, structural
  delete rejection, composition guard, dependency cleanliness, docs, roadmap,
  and phase trail.

This phase intentionally does not use arbitrary pasted HTML as package truth,
allow structural boundary delete, commit while IME composition is active,
implement browser clipboard integration, add storage/backend routes, add
PDF/DOCX renderer work, copy legacy editor runtime, or change package/document
schema.

## Phase 161 Renderer Segment / Hit-Test Evidence Boundary

Phase 161 implements renderer segment and hit-test evidence validation:

- `src/renderer/segmentHitTestEvidence.ts` defines source/mode constants,
  segment facts, hit-test request/response facts, validation, and hit-test
  evidence helpers;
- `src/index.ts` exports the evidence boundary;
- segment facts cover segment id, text-block id, inline child id, UTF-16
  range, glyph range, line index, box geometry, atomic flag, field-chip flag,
  and style facts;
- hit-test evidence can return exact, nearest, low, or none confidence with
  affinity and nearest offset;
- invalid UTF-16 ranges and non-atomic field-chip segments are blocked;
- `tests/segmentHitTestEvidence.test.ts` proves valid evidence, field-chip
  atomic representation, hit-test uncertainty, invalid range blocking, export
  boundary, docs, roadmap, and phase trail.
- `tests/activeIslandCommitBridge.test.ts` keeps the existing Phase 158
  browser-adjacent spawn checks bounded under full-suite timing.

This phase intentionally does not execute a renderer, bind DOM selection,
replace the contenteditable range mapper, claim caret parity, require
production measurement binding, add storage/backend routes, add PDF/DOCX
renderer work, copy legacy editor runtime, or change package/document schema.

## Phase 162 Hybrid Input Foundation Close Audit

Phase 162 closes the hybrid managed card input foundation pass across Phases
154-161:

- Phase 154 proves browser-local ownership classification for managed cards,
  active text-block islands, textarea fallback, and rejected targets;
- Phase 155 proves the DOM-free active island lifecycle and commit-request
  readiness facts;
- Phase 156 proves the command policy matrix before execution;
- Phase 157 proves JSON-safe DOM binding smoke facts without DOM Range/
  Selection parity;
- Phase 158 proves the active island commit bridge can route through the
  existing rich inline replacement bridge;
- Phase 159 proves atomic field-chip command contracts;
- Phase 160 proves paste/delete preflight classification;
- Phase 161 proves renderer segment and hit-test evidence facts without
  renderer execution or caret parity.

The audit keeps production input readiness blocked. Phase 163 is recommended
as a Hybrid Input Browser QA Boundary before production contenteditable
binding.

This phase intentionally does not implement production contenteditable,
full-document contenteditable, collaboration/offline behavior, storage/backend
routes, PDF/DOCX renderer work, package/document schema changes, or legacy
editor runtime copy.

## Phase 163 Hybrid Input Browser QA Boundary

Phase 163 implements a sandbox-local browser QA evidence boundary:

- `examples/template-builder-sandbox/public/hybridInputBrowserQa.js` defines
  browser QA source/mode constants, case ids, report creation, and labels;
- `examples/template-builder-sandbox/scripts/hybrid-input-browser-qa.mjs`
  outputs the report as JSON without adding a browser driver dependency;
- report cases cover selection start/end, caret move, IME composition
  lifecycle, plain text paste, blocked rich/unsafe paste, delete/backspace near
  field chip, active island commit, fallback behavior, and single active
  text-block island guard;
- unsafe rich paste remains blocked and does not become package truth;
- active island ownership remains limited to one text block;
- field-chip atomics remain guarded by preflight command transform;
- `tests/hybridInputBrowserQa.test.ts` proves report shape, case evidence,
  optional script execution, dependency cleanliness, documentation, roadmap,
  and phase trail.
- `tests/hybridInputFoundationCloseAudit.test.ts` keeps the Phase 162 trail
  current after the roadmap advances to Phase 164.

This phase intentionally does not claim production contenteditable readiness,
implement full-document contenteditable, copy old FlowDocEditor runtime, change
package/document schema, add storage/backend routes, add collaboration/offline
behavior, add renderer/PDF/DOCX work, or require Playwright/Puppeteer in core
check.

## Phase 164 Optional Browser Driver Smoke Boundary

Phase 164 implements optional browser-driver smoke evidence intake for the
hybrid active text-block island sandbox path:

- `examples/template-builder-sandbox/public/hybridInputBrowserDriverSmoke.js`
  defines optional driver smoke source/mode constants, case ids, report
  creation, and labels;
- `examples/template-builder-sandbox/scripts/hybrid-input-browser-driver-smoke.mjs`
  outputs JSON reports and can consume externally supplied driver facts through
  environment JSON/path inputs;
- no browser driver facts produces an explicit blocked report instead of
  failing core check;
- supplied driver facts can prove focus, selection/caret movement, plain
  typing, IME composition, plain paste, unsafe paste blocking, field-chip
  delete guard, and active island commit evidence;
- unsafe DOM behavior remains blocked and does not become package truth;
- `tests/hybridInputBrowserDriverSmoke.test.ts` proves blocked no-driver
  output, supplied driver evidence output, script behavior, dependency
  cleanliness, documentation, roadmap, and phase trail.

This phase intentionally does not require a browser driver in core check, add a
browser automation dependency to `@flowdoc/vnext-core`, claim production
browser/contenteditable readiness, implement full-document contenteditable,
copy old FlowDocEditor runtime, change package/document schema, add
storage/backend routes, add PDF/DOCX renderer work, or add collaboration/
offline behavior.

## Phase 165 Hybrid Input Browser Evidence Close Audit

Phase 165 closes the browser evidence lane across Phases 163-164:

- Phase 163 sandbox-local browser QA evidence proves JSON-safe reports for
  selection/caret, IME/composition, paste/delete, field-chip guard, active
  island commit, fallback behavior, and one active text-block island ownership;
- Phase 164 optional browser-driver smoke evidence intake proves missing driver
  facts are blocked safely and externally supplied driver facts can be
  summarized without adding browser automation dependencies;
- production browser readiness and production contenteditable readiness remain
  blocked;
- production blockers, risks, unknowns, files changed, behavior changed, tests
  run, and intentional non-work are recorded;
- Phase 166 is recommended as a Hybrid Input Hardening Threshold Plan before
  browser driver matrix or production contenteditable binding work.

This phase intentionally does not implement production contenteditable binding,
claim production browser readiness, require a browser driver in core check, add
Playwright/Puppeteer to `@flowdoc/vnext-core`, change package/document schema,
add storage/backend routes, add PDF/DOCX renderer work, or add collaboration/
offline behavior.

## Phase 166 Hybrid Input Hardening Threshold Plan

Phase 166 defines hybrid input hardening thresholds before browser matrix or
guarded input integration planning:

- PASS/WARNING/BLOCKED/UNKNOWN policy is explicit;
- thresholds cover selection/caret, IME composition, paste/delete, field-chip
  atomicity, active island commit, fallback behavior, and JSON-safe report
  completeness;
- v1 blockers are separated from warnings that may remain visible;
- `tests/hybridInputHardeningThresholdPlan.test.ts` proves the threshold
  policy, v1 blocker/warning separation, documentation, roadmap, and phase
  trail.

This phase intentionally does not implement production contenteditable, choose
a browser matrix, add browser automation dependencies to core, change
package/document schema, add storage/backend routes, add PDF/DOCX renderer
work, or add collaboration/offline behavior.

## Phase 167 Browser Matrix Decision

Phase 167 chooses the minimum v1 browser/OS/IME matrix:

- v1 accepts Windows Chromium-family and Microsoft Edge as the named product
  browser target;
- v1 requires English and Thai input paths plus IME composition lifecycle
  evidence;
- Firefox, Safari, mobile, complex CJK IME, Linux, macOS, and broad
  cross-browser visual caret parity are deferred;
- Phase 166 thresholds are mapped to the selected v1 matrix;
- `tests/hybridInputBrowserMatrixDecision.test.ts` proves matrix selection,
  deferrals, threshold mapping, hard limits, roadmap, and phase trail.

This phase intentionally does not implement production contenteditable, add a
browser automation dependency to core, require a browser driver in core check,
change package/document schema, add storage/backend routes, add PDF/DOCX
renderer work, or add collaboration/offline behavior.

## Phase 168 Guarded Input Integration Plan

Phase 168 defines the guarded integration plan for the hybrid active
text-block island:

- managed card runtime, active text-block island runtime, command policy,
  commit bridge, fallback textarea path, and app-shell integration ownership
  are separated;
- browser-local state is separated from the accepted vNext core commit truth;
- styled runs, atomic inline field chips, IME composition, selection/caret,
  paste/delete, and unsupported blocks have guard policy;
- active block packet refresh, stale revision rejection, fallback behavior, and
  `text-block.rich-inline.replace` commit bridge routing are explicit;
- `tests/guardedInputIntegrationPlan.test.ts` proves ownership, browser-local
  versus core truth, guard policy, packet refresh, roadmap, and phase trail.

This phase intentionally does not implement production contenteditable, claim
production browser readiness, implement full-document contenteditable, add a
browser automation dependency to core, require a browser driver in core check,
change package/document schema, add storage/backend routes, add PDF/DOCX
renderer work, add collaboration/offline behavior, or copy legacy editor
runtime.

## Phase 169 Guarded Input Runtime Slice 1

Phase 169 implements the first sandbox-local guarded input runtime slice:

- `examples/template-builder-sandbox/public/guardedInputRuntimeSlice.js`
  composes runtime ownership, active text-block island lifecycle, command
  policy, DOM binding smoke, and active island commit bridge smoke;
- one eligible active text block can produce a JSON-safe accepted report and a
  planned `text-block.rich-inline.replace` bridge request;
- selection/caret facts remain UTF-16 offsets;
- composition-active commit is blocked;
- fallback textarea and unsupported target paths are explicit;
- packet refresh after accepted bridge planning is required;
- `tests/guardedInputRuntimeSlice.test.ts` proves accepted, composition
  blocked, fallback, unsupported, dependency cleanliness, docs, roadmap, and
  phase trail behavior.

This phase intentionally does not implement production contenteditable, claim
production browser readiness, implement full-document contenteditable, add a
browser automation dependency to core, require a browser driver in core check,
change package/document schema, add storage/backend routes, add PDF/DOCX
renderer work, add collaboration/offline behavior, or copy legacy editor
runtime.

## Phase 170 Guarded Input Paste/Delete/Field-chip Slice

Phase 170 implements the sandbox-local paste/delete/field-chip input slice:

- `examples/template-builder-sandbox/public/guardedInputPasteDeleteFieldChipSlice.js`
  composes the Phase 169 runtime slice with paste/delete preflight;
- plain paste and normalized paste produce JSON-safe decisions;
- unsafe rich paste and arbitrary DOM HTML are blocked;
- delete/backspace near a field chip transforms into explicit atomic
  field-chip command intent;
- field-chip copy and replace-with-text remain atomic command facts;
- field-chip internal edit, structural delete, and composition-active actions
  are blocked;
- `tests/guardedInputPasteDeleteFieldChipSlice.test.ts` proves paste,
  unsafe paste, delete near chip, blocked unsafe deletes, direct field-chip
  commands, dependency cleanliness, docs, roadmap, and phase trail behavior.

This phase intentionally does not implement production contenteditable, claim
production browser readiness, bind production clipboard events, implement
full-document contenteditable, add a browser automation dependency to core,
require a browser driver in core check, change package/document schema, add
storage/backend routes, add PDF/DOCX renderer work, add collaboration/offline
behavior, or copy legacy editor runtime.

## Phase 171 Guarded Input Integration Close Audit

Phase 171 closes the guarded hybrid input integration lane across Phases
166-170:

- Phase 166 hardening thresholds, Phase 167 browser matrix, Phase 168
  integration plan, Phase 169 runtime slice, and Phase 170 paste/delete/
  field-chip slice are audited together;
- proven selection/caret, active island commit, IME/composition blocking,
  paste/delete, field-chip atomicity, fallback, and packet refresh evidence is
  summarized;
- production blockers remain visible;
- the decision accepts internal-alpha sandbox evidence only and blocks
  production contenteditable, browser, clipboard, collaboration/offline, and
  storage/backend readiness claims;
- `tests/guardedInputIntegrationCloseAudit.test.ts` proves evidence coverage,
  blocker visibility, decision language, docs, roadmap, and phase trail.

This phase intentionally does not implement production contenteditable, claim
production browser readiness, bind production clipboard events, implement
full-document contenteditable, add a browser automation dependency to core,
require a browser driver in core check, change package/document schema, add
storage/backend routes, add PDF/DOCX renderer work, add collaboration/offline
behavior, or copy legacy editor runtime.

## Pre-Phase 172 Risk / Unknown Register

Before Phase 172 storage choice work, the risk / unknown register sharpens
what storage must not assume:

- guarded input evidence remains internal-alpha sandbox evidence, not
  production input truth;
- production contenteditable, browser, clipboard, and collaboration/offline
  readiness remain blocked;
- Thai IME, browser-driver matrix, artifact retention, fallback UX, granular
  rich-inline operations, and storage durability remain explicit unknowns;
- storage candidates must label input/browser readiness as dependency risk and
  must not add backend routes, schema changes, renderer work, or browser
  automation to core as part of the choice gate;
- `tests/prePhase172RiskUnknownRegister.test.ts` proves the register, storage
  gate rule, risk buckets, unknowns, roadmap, and phase trail.

This register intentionally does not implement storage/backend routes, change
package/document schema, implement production contenteditable, claim
production browser readiness, bind production clipboard events, add browser
automation dependencies to core, require a browser driver in core check, add
PDF/DOCX renderer work, add collaboration/offline behavior, or copy legacy
editor runtime.

## Phase 172 Concrete Storage Choice Gate

Phase 172 chooses the first internal-alpha storage direction:

- immediate path: external file-backed JSON record adapter;
- package target: `packages/storage-file-json`;
- artifact bytes are deferred to a separate filesystem byte-store slice;
- SQLite plus filesystem artifacts remains a later hardening path, not a
  required Phase 173 dependency;
- Postgres, browser storage, and S3/object storage are deferred;
- the adapter may store package/session, durable history, rich inline session,
  artifact manifest, and artifact job records only;
- `tests/concreteStorageChoiceGate.test.ts` proves the decision, option
  comparison, record/byte separation, storage gate assumptions, roadmap, and
  phase trail.

This phase intentionally does not implement a concrete adapter, write files,
add SQLite/native dependencies, write artifact bytes, add backend routes,
implement auth/authz, change package/document schema, claim production
input/browser/clipboard readiness, add PDF/DOCX renderer work, add
collaboration/offline behavior, or copy legacy editor runtime.

## Phase 173 External File-Backed Storage Adapter Slice

Phase 173 implements the first concrete internal-alpha record adapter outside
core:

- package: `@flowdoc/storage-file-json`;
- package path: `packages/storage-file-json`;
- it imports public storage request/envelope helpers from
  `@flowdoc/vnext-core`;
- it stores package/session, durable history, rich inline session, artifact
  manifest, and artifact job records as JSON envelopes;
- it proves read-after-write, idempotencyKey replay, stale expectedRevision
  conflict, and revision increment;
- artifact manifest/job remain records only and do not write artifact bytes;
- `tests/storageFileJsonAdapter.test.ts` proves behavior, package boundary,
  core dependency cleanliness, documentation, and the Phase 174 next lane.

This phase intentionally does not place the concrete adapter in core, modify
`src/persistence/storageAdapter.ts` into a concrete adapter, add filesystem or
database writes to core, add SQLite/native dependencies, claim multi-record
transaction atomicity, write artifact bytes, add backend routes, implement
auth/authz, change package/document schema, assume production contenteditable
or browser/clipboard readiness, add PDF/DOCX renderer work, add
collaboration/offline behavior, or copy legacy editor runtime.

## Phase 174 Artifact Byte Store Slice

Phase 174 adds a separate filesystem artifact byte store in the external
storage package:

- package: `@flowdoc/storage-file-json`;
- byte store factory: `createFlowDocFileJsonArtifactByteStore(...)`;
- bytes are stored under an `artifact-bytes` directory owned by the caller's
  filesystem root;
- storage keys include the base64url artifact id and sha256 digest;
- writes compute sha256 and return byte length, digest, storage key, and file
  path metadata;
- reads return stored bytes and verify the storage key digest;
- missing artifacts return a bounded `missing` result;
- rendered manifests can be checked against stored byte facts without mutating
  the manifest schema;
- `tests/artifactByteStoreSlice.test.ts` proves write/read behavior, missing
  artifacts, manifest consistency, record/byte-store separation, docs, roadmap,
  and phase trail.

This phase intentionally does not place byte writes in core, add SQLite/native
dependencies, claim multi-record transaction atomicity between records and
bytes, add backend routes, implement auth/authz, change package/document
schema, claim production storage readiness, assume production contenteditable
or browser/clipboard readiness, add PDF/DOCX renderer work, add
collaboration/offline behavior, or copy legacy editor runtime.

## Phase 175 Storage-Backed RC Roundtrip Smoke

Phase 175 adds the first internal-alpha integration runner over concrete
storage:

- package: `@flowdoc/internal-alpha-runner`;
- runner: `runFlowDocStorageBackedRcRoundtripSmoke(...)`;
- fixture loading remains caller-owned;
- the runner validates the RC scenario, applies the rich inline commit, creates
  session/history/rich-inline/artifact manifest/artifact job records, writes
  those records through `@flowdoc/storage-file-json`, writes artifact bytes,
  reloads records and bytes, checks manifest consistency, and emits a JSON-safe
  RC report;
- concrete storage evidence is external to core and feeds the existing
  input-driven RC report instead of changing core's storage contracts;
- `tests/storageBackedRcRoundtripSmoke.test.ts` proves concrete record writes,
  byte writes, reloads, manifest consistency, report status, docs, roadmap, and
  phase trail.

This phase intentionally does not add backend routes, implement auth/authz,
claim production storage readiness, make record-plus-byte writes atomic, run a
PDF renderer, change package/document schema, assume production contenteditable
or browser/clipboard readiness, add collaboration/offline behavior, or copy
legacy editor runtime.

## Phase 176 Backend Route Contract To Storage Binding

Phase 176 binds route-shaped helper functions to concrete record storage:

- package: `@flowdoc/internal-alpha-runner`;
- helper: `createFlowDocStorageRouteBinding(...)`;
- session save/load calls the concrete package/session collection;
- artifact request creates planned artifact manifest and queued artifact job
  records;
- artifact status reads artifact job records;
- artifact metadata reads artifact manifest records;
- responses are JSON-safe, include method/status/header/body shape, keep
  `bytes: null`, and declare `serverRoute: false`;
- `tests/backendRouteStorageBinding.test.ts` proves session save/load,
  conflict/missing/method handling, artifact request/status/metadata, docs,
  roadmap, and phase trail.

This phase intentionally does not register HTTP server routes, execute
auth/authz, stream artifact bytes, read artifact bytes, run a renderer, claim
production backend or storage readiness, change package/document schema, add
collaboration/offline behavior, or copy legacy editor runtime.

## Phase 177 Artifact Job Execution Slice

Phase 177 adds an external internal-alpha artifact job executor:

- package: `@flowdoc/internal-alpha-runner`;
- helper: `runFlowDocArtifactJobExecutionSlice(...)`;
- consumes public core artifact job and manifest contracts;
- calls the existing external minimal PDF spike package;
- writes and reloads artifact bytes through the filesystem byte store;
- persists planned, rendering, rendered, and failed manifest states as record
  envelopes;
- persists queued, rendered, and failed artifact job states as record
  envelopes;
- returns a JSON-safe report with no raw PDF bytes.

This phase intentionally does not add a worker, queue, server route, auth/authz,
production PDF/DOCX renderer, production contenteditable or browser readiness
claim, package/document schema change, collaboration/offline behavior, or
legacy editor runtime copy. Record writes and byte writes remain
non-transactional internal-alpha evidence.

## Phase 178 PDF Renderer Decision Gate

Phase 178 decides the PDF renderer direction after artifact job execution:

- keep `@flowdoc/pdf-renderer-spike` for internal-alpha vertical slice evidence
  only;
- do not choose or add a production PDF renderer package in this phase;
- do not harden the spike into a production fidelity renderer;
- defer production renderer package selection until measurement rollout and
  internal-alpha vertical slice evidence are clearer;
- keep DOCX, browser print-to-PDF, backend routes, workers/queues, auth/authz,
  package/document schema changes, collaboration/offline, and legacy editor
  runtime copy out of scope.

Next recommended phase: Phase 179 Measurement Rollout Gate.

## Phase 179 Measurement Rollout Gate

Phase 179 decides the measurement rollout path after PDF renderer selection is
deferred:

- allow guarded internal-alpha measurement evidence for the selected vertical
  slice only;
- keep `measureVNextText(...)` default replacement blocked;
- preserve Phase 148 profile, line-box, drift, digest, and native/WASM parity
  gate signals;
- allow Phase 180 to proceed with accepted or warning measurement evidence when
  risks remain visible;
- keep production measurement rollout blocked until digest is present,
  native/WASM parity is matched, drift thresholds are accepted, and a later
  binding phase explicitly replaces the default measurer.

This phase intentionally does not mutate pagination, execute the external text
engine in core, bind production renderer-backed measurement, change schemas,
add backend/storage/PDF/DOCX/worker/auth/collaboration/offline behavior, claim
production input readiness, or copy legacy editor runtime.

Next recommended phase: Phase 180 Internal Alpha Vertical Slice.

## Phase 180 Internal Alpha Vertical Slice

Phase 180 runs one bounded internal-alpha path:

- open the Phase 147 fixture package as a vNext editable session;
- edit the active text block with `text-block.rich-inline.replace`;
- save package/session, durable-history, and rich-inline-session records;
- reload the saved package/session record;
- generate the PDF adapter plan from the reloaded package snapshot;
- execute the minimal PDF spike through the Phase 177 artifact job path;
- store and retrieve artifact bytes;
- return a bounded JSON-safe status report.

This phase intentionally does not implement production contenteditable,
full-document contenteditable, backend routes, auth/authz, production storage,
production PDF/DOCX rendering, default measurement replacement, schema changes,
collaboration/offline behavior, or legacy editor runtime copy.

Next recommended phase: Phase 181 Internal Alpha Close Audit And Documentation
Consolidation Gate.

## Phase 181 Internal Alpha Close Audit And Documentation Consolidation Gate

Phase 181 closes the internal-alpha evidence lane and adds compact current-state
docs:

- close audit: `docs/INTERNAL_ALPHA_CLOSE_AUDIT_AND_DOC_CONSOLIDATION_GATE.md`;
- current status: `docs/CURRENT_STATUS.md`;
- next phase pointer: `docs/NEXT_PHASE_POINTER.md`;
- audited evidence covers Phases 172-180;
- proven internal-alpha path remains bounded evidence, not production
  readiness;
- production blockers remain explicit across input, backend/storage,
  measurement, PDF/DOCX, collaboration/offline, and schema work.

This phase intentionally does not implement production contenteditable,
backend routes, auth/authz, production storage, production PDF/DOCX rendering,
default measurement replacement, package/document schema changes,
collaboration/offline behavior, or legacy editor runtime copy.

Next recommended phase: Phase 182 V1 Hardening Backlog Triage Gate.

## Phase 182 V1 Hardening Backlog Triage Gate

Phase 182 ranks the production hardening backlog and chooses the first
production hardening lane:

- selected lane: measurement rollout / digest / parity / drift;
- first deferred lanes: production storage durability/transactions, backend
  routes plus auth/authz, PDF renderer fidelity, and production input binding;
- later deferred lanes: DOCX renderer, collaboration/offline, and package/
  document schema changes if evidence later requires them;
- internal-alpha evidence remains bounded evidence and is not production
  readiness.

This phase intentionally does not implement production contenteditable,
backend routes, auth/authz, production storage, production PDF/DOCX rendering,
default measurement replacement, pagination mutation, package/document schema
changes, collaboration/offline behavior, or legacy editor runtime copy.

Next recommended phase: Phase 183 Measurement Digest Parity Drift Hardening
Gate.

## Phase 183 Measurement Digest Parity Drift Hardening Gate

Phase 183 defines the production measurement evidence gate before any default
measurement replacement or production binding:

- digest identity and retention expectations;
- native/WASM parity acceptance criteria;
- drift threshold status, escalation, and blocked/warning/unknown policy;
- required v1 measurement fixture/scenario evidence categories;
- blockers before replacing `measureVNextText(...)`.

This phase intentionally does not replace `measureVNextText(...)`, mutate
pagination, bind production renderer-backed measurement, execute external text
engines in core, add production PDF/DOCX renderer work, add backend routes,
storage, auth/authz, implement contenteditable, change package/document schema,
add collaboration/offline behavior, or copy legacy editor runtime.

Next recommended phase: Phase 184 V1 Measurement Fixture Evidence Matrix Gate.

## Phase 184 V1 Measurement Fixture Evidence Matrix Gate

Phase 184 selects the v1 measurement fixture evidence matrix:

- matrix id: `v1-measurement-fixture-evidence-matrix-v1`;
- corpus id: `v1-measurement-evidence-corpus-v1`;
- release-gating and exploratory fixture ids;
- profile requirements for the baseline alias and production identity profile;
- required JSON-safe summary facts for glyph, cluster, text range, line boxes,
  total size, line count, drift, and parity evidence;
- missing-evidence states for accepted, warning, blocked, and unknown.

This phase intentionally does not replace `measureVNextText(...)`, mutate
pagination, bind production renderer-backed measurement, execute external text
engines in core, add production PDF/DOCX renderer work, add backend routes,
storage, auth/authz, implement contenteditable, change package/document schema,
add collaboration/offline behavior, or copy legacy editor runtime.

Next recommended phase: Phase 185 Measurement Evidence Summary Manifest Gate.

## Phase 185 Measurement Evidence Summary Manifest Gate

Phase 185 defines the JSON-safe measurement evidence summary manifest shape:

- manifest id, matrix id, corpus id, policy revision, measurement profile id,
  fixture/scenario ids, and gate type;
- required fact coverage;
- digest identity summary;
- native/WASM parity summary;
- renderer-backed drift summary;
- accepted, warning, blocked, and unknown status fields;
- retention pointers for raw native, WASM, and renderer evidence;
- raw evidence owner and root-summary owner;
- blockers before default-measurer replacement.

This phase intentionally does not replace `measureVNextText(...)`, mutate
pagination, bind production renderer-backed measurement, execute external text
engines in core, put raw evidence in root docs/tests, add production PDF/DOCX
renderer work, add backend routes, storage, auth/authz, implement
contenteditable, change package/document schema, add collaboration/offline
behavior, or copy legacy editor runtime.

Next recommended phase: Phase 186 Measurement Evidence Summary Manifest Fixture
Stub Gate.

## Phase 186 Measurement Evidence Summary Manifest Fixture Stub Gate

Phase 186 adds a JSON-safe stub manifest for the Phase 184 matrix:

- stub file:
  `fixtures/measurement-evidence-summary-manifest.stub.v1.json`;
- manifest id: `measurement-evidence-summary-manifest-stub-v1`;
- all release-gating fixture rows from Phase 184 are represented;
- useful exploratory rows are represented separately;
- `rawEvidenceIncluded=false`;
- release-gating fixture statuses remain `unknown`;
- required fact coverage remains `missing`;
- digest identity remains `pending`;
- native/WASM parity remains `not-run`;
- renderer-backed drift remains `unknown`;
- retention pointers are `null` or external placeholders with
  `includedInRoot=false`;
- top-level replacement blockers remain.

This phase intentionally does not replace `measureVNextText(...)`, mutate
pagination, bind production renderer-backed measurement, execute external text
engines in core, put raw evidence in root docs/tests, add production PDF/DOCX
renderer work, add backend routes, storage, auth/authz, implement
contenteditable, change package/document schema, add collaboration/offline
behavior, or copy legacy editor runtime.

Next recommended phase: Phase 187 Measurement Evidence Coverage Gap Triage
Gate.

## Phase 187 Measurement Evidence Coverage Gap Triage Gate

Phase 187 ranks the missing evidence exposed by the Phase 186 stub manifest:

- source stub:
  `fixtures/measurement-evidence-summary-manifest.stub.v1.json`;
- all 12 release-gating rows remain unknown/missing;
- top-ranked gap is digest/runtime identity, including pending WASM digest;
- next gaps are fixture/corpus descriptors, native evidence, WASM evidence,
  parity summaries, renderer-backed drift summaries, numeric drift thresholds,
  and accepted root summary manifest;
- owners are grouped across text-engine package, renderer-backed provider,
  fixture/corpus owner, root JSON-safe summary owner, and future PDF/DOCX
  renderer owner;
- first rows to fill start with `v1-measure-digest-parity-summary`,
  `v1-measure-thai-line-break-core`, and
  `v1-measure-styled-inline-font-map`;
- recommended next phase is Phase 188 Text Engine Runtime Identity Digest
  Evidence Builder Gate.

This phase intentionally does not produce real native/WASM evidence, execute
rustybuzz/WASM/ICU4X in core, run renderer-backed measurement as production
truth, replace `measureVNextText(...)`, mutate pagination, put raw evidence in
root docs/tests, add production PDF/DOCX renderer work, add backend routes,
storage, auth/authz, implement contenteditable, change package/document schema,
add collaboration/offline behavior, or copy legacy editor runtime.

Next recommended phase: Phase 188 Text Engine Runtime Identity Digest Evidence
Builder Gate.

## Phase 188 Text Engine Runtime Identity Digest Evidence Builder Gate

Phase 188 defines the first package-local runtime identity digest evidence
builder path:

- builder:
  `packages/text-engine-rust-wasm/src/runtimeIdentityDigestEvidenceBuilder.ts`;
- builder fixture:
  `packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-builder.v1.json`;
- evidence owner stays in `@flowdoc/text-engine-rust-wasm`;
- root handoff is JSON-safe and carries matrix id, corpus id, policy revision,
  measurement profile id, output shape, runtime revisions, font hashes, WASM
  digest status, and retention pointers;
- digest status policy is `pinned`, `pending`, `missing`, and `stale`;
- current package-local digest remains `pending`;
- native evidence, WASM evidence, native/WASM parity summaries,
  renderer-backed drift summaries, numeric thresholds, accepted manifest, and
  default-measurer replacement remain blocked.

This phase intentionally does not execute rustybuzz/WASM/ICU4X in
`@flowdoc/vnext-core`, put raw native/WASM evidence in root tests/docs, replace
`measureVNextText(...)`, mutate pagination, bind production renderer-backed
measurement, add production PDF/DOCX renderer work, add backend routes,
storage, auth/authz, implement contenteditable, change package/document
schema, add collaboration/offline behavior, or copy legacy editor runtime.

Next recommended phase: Phase 189 Text Engine Runtime Identity Digest Evidence
Population Gate.

## Phase 189 Text Engine Runtime Identity Digest Evidence Population Gate

Phase 189 evaluates the Phase 188 digest evidence builder path and explicitly
retains the current digest as pending:

- population summary:
  `packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-population.v1.json`;
- decision: `retained-pending`;
- `canPinDigestNow=false`;
- no package-local WASM artifact is present;
- runtime identity manifest still records `digestStatus="pending"` and
  `sha256=null`;
- root summary handoff remains JSON-safe;
- raw native/WASM evidence remains outside root tests/docs;
- production readiness and default-measurer replacement remain false;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, and accepted manifest remain blocked.

This phase intentionally does not execute rustybuzz/WASM/ICU4X in
`@flowdoc/vnext-core`, build or load WASM in root core, put raw native/WASM
evidence in root tests/docs, replace `measureVNextText(...)`, mutate
pagination, bind production renderer-backed measurement, add production
PDF/DOCX renderer work, add backend routes, storage, auth/authz, implement
contenteditable, change package/document schema, add collaboration/offline
behavior, or copy legacy editor runtime.

Next recommended phase: Phase 190 Text Engine WASM Artifact Digest Pinning
Gate.

## Phase 190 Text Engine WASM Artifact Digest Pinning Gate

Phase 190 checks the Phase 189 package-local WASM artifact candidate paths and
keeps digest pinning pending because no artifact exists:

- pinning summary:
  `packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`;
- accepted future artifact path:
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- all Phase 189 candidate paths are package-local and absent;
- `artifactFound=false`;
- `canPinDigestNow=false`;
- `pinningDecision="pending-no-artifact"`;
- `digestStatus="pending"`;
- `sha256=null`;
- `wasmArtifactPointer=null`;
- root summary handoff remains JSON-safe;
- raw native/WASM evidence remains outside root tests/docs;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, accepted manifest, and default-measurer
  replacement remain blocked.

This phase intentionally does not execute rustybuzz/WASM/ICU4X in
`@flowdoc/vnext-core`, put raw native/WASM evidence in root tests/docs, replace
`measureVNextText(...)`, mutate pagination, bind production renderer-backed
measurement, add production PDF/DOCX renderer work, add backend routes,
storage, auth/authz, implement contenteditable, change package/document
schema, add collaboration/offline behavior, or copy legacy editor runtime.

Next recommended phase: Phase 191 Text Engine WASM Artifact Build Output Gate.

## Phase 191 Text Engine WASM Artifact Build Output Gate

Phase 191 defines the package-local WASM build/output path and command for the
accepted Phase 190 artifact path, then keeps artifact production blocked
because the current repo/environment is not WASM-build ready:

- build output summary:
  `packages/text-engine-rust-wasm/fixtures/wasm-artifact-build-output.v1.json`;
- accepted future artifact path:
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- accepted future command:
  `wasm-pack build rust-shaper --target web --out-dir ../pkg --out-name flowdoc_text_engine`;
- command status: `blocked-not-runnable`;
- `wasm-pack` is unavailable;
- `wasm32-unknown-unknown` is not installed;
- `rust-shaper` is still a binary native smoke crate without `lib.rs`,
  `cdylib`, or WASM export boundary;
- `canProduceArtifactNow=false`;
- `artifactProduced=false`;
- `artifactPointer=null`;
- `digestStatus="pending"`;
- `sha256=null`;
- root summary handoff remains JSON-safe;
- raw native/WASM evidence remains outside root tests/docs;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, accepted manifest, production binding, and
  default-measurer replacement remain blocked.

This phase intentionally does not execute rustybuzz/WASM/ICU4X in
`@flowdoc/vnext-core`, put raw native/WASM evidence in root tests/docs, replace
`measureVNextText(...)`, mutate pagination, bind production renderer-backed
measurement, add production PDF/DOCX renderer work, add backend routes,
storage, auth/authz, implement contenteditable, change package/document
schema, add collaboration/offline behavior, or copy legacy editor runtime.

Next recommended phase: Phase 192 Text Engine WASM Build Toolchain Readiness
Gate.

## Phase 192 Text Engine WASM Build Toolchain Readiness Gate

Phase 192 makes the package-local WASM build toolchain and crate target
readiness explicit without producing a WASM artifact:

- readiness summary:
  `packages/text-engine-rust-wasm/fixtures/wasm-build-toolchain-readiness.v1.json`;
- accepted future artifact path:
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- accepted path: `wasm-pack`;
- direct Cargo plus `wasm-bindgen` remains a deferred alternate;
- `cargo` is available;
- `wasm-pack` is unavailable;
- `wasm-bindgen` CLI is unavailable;
- `wasm32-unknown-unknown` is not installed;
- `rust-shaper` now has `src/lib.rs`;
- `rust-shaper` now declares `[lib] name = "flowdoc_text_engine"` and
  `crate-type = ["cdylib", "rlib"]`;
- native `main.rs` smoke path remains intact;
- package-local `wasm:build` script metadata records the accepted command;
- root `npm.cmd run check` does not require `wasm-pack` or the WASM target;
- `toolchainReady=false`;
- `crateTargetShapeReady=true`;
- `canProduceArtifactNow=false`;
- `artifactProduced=false`;
- `artifactPointer=null`;
- `digestStatus="pending"`;
- `sha256=null`;
- raw native/WASM evidence remains outside root tests/docs;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, accepted manifest, production binding, and
  default-measurer replacement remain blocked.

This phase intentionally does not execute rustybuzz/WASM/ICU4X in
`@flowdoc/vnext-core`, put raw native/WASM evidence in root tests/docs, require
`wasm-pack` or `wasm32-unknown-unknown` in root checks, produce an artifact,
pin sha256, replace `measureVNextText(...)`, mutate pagination, bind
production renderer-backed measurement, add production PDF/DOCX renderer work,
add backend routes, storage, auth/authz, implement contenteditable, change
package/document schema, add collaboration/offline behavior, or copy legacy
editor runtime.

Next recommended phase: Phase 193 Text Engine WASM Toolchain Acquisition Gate.

## Phase 193 Text Engine WASM Toolchain Acquisition Gate

Phase 193 defines how the package-local WASM build toolchain becomes available
without making root checks depend on it:

- acquisition summary:
  `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-acquisition.v1.json`;
- diagnostic script:
  `packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs`;
- package script: `wasm:check-toolchain`;
- accepted `wasm-pack` availability path: developer/CI bootstrap;
- accepted `wasm-pack` provisioning command:
  `cargo install wasm-pack --locked`;
- accepted target provisioning command:
  `rustup target add wasm32-unknown-unknown`;
- root `npm.cmd run check` does not require `wasm-pack`, the WASM target, the
  diagnostic, or an artifact;
- `wasm-pack` version policy is pending until installed and must be pinned
  before artifact production;
- diagnostic exit policy is `always-zero`;
- `canProduceArtifactNow=false`;
- `artifactProduced=false`;
- `artifactPointer=null`;
- `digestStatus="pending"`;
- `sha256=null`;
- raw native/WASM evidence remains outside root tests/docs;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, accepted manifest, production binding, and
  default-measurer replacement remain blocked.

This phase intentionally does not require `wasm-pack` or
`wasm32-unknown-unknown` in root checks, execute rustybuzz/WASM/ICU4X in
`@flowdoc/vnext-core`, put raw native/WASM evidence in root tests/docs,
produce a fake WASM artifact, pin a fake sha256, replace
`measureVNextText(...)`, mutate pagination, bind production renderer-backed
measurement, add production PDF/DOCX renderer work, add backend routes,
storage, auth/authz, implement contenteditable, change package/document
schema, add collaboration/offline behavior, or copy legacy editor runtime.

Next recommended phase: Phase 194 Text Engine WASM Toolchain Optional
Readiness Smoke.

## Phase 194 Text Engine WASM Toolchain Optional Readiness Smoke

Phase 194 runs the package-local toolchain diagnostic through an optional
readiness smoke without making root checks depend on it:

- readiness smoke summary:
  `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-optional-readiness-smoke.v1.json`;
- package script: `wasm:readiness-smoke`;
- wrapper command: `npm run wasm:check-toolchain`;
- smoke exit policy: `always-zero`;
- observed smoke exit code: `0`;
- `wasm-pack` is unavailable;
- `wasm32-unknown-unknown` is not installed;
- `toolchainReady=false`;
- `canProduceArtifactNow=false`;
- `artifactProduced=false`;
- `artifactPointer=null`;
- `digestStatus="pending"`;
- `sha256=null`;
- root `npm.cmd run check` does not require `wasm-pack`, the WASM target, the
  readiness smoke, or an artifact;
- raw native/WASM evidence remains outside root tests/docs;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, accepted manifest, production binding, and
  default-measurer replacement remain blocked.

This phase intentionally does not require `wasm-pack` or
`wasm32-unknown-unknown` in root checks, execute rustybuzz/WASM/ICU4X in
`@flowdoc/vnext-core`, put raw native/WASM evidence in root tests/docs,
produce a fake WASM artifact, pin a fake sha256, produce an artifact, replace
`measureVNextText(...)`, mutate pagination, bind production renderer-backed
measurement, add production PDF/DOCX renderer work, add backend routes,
storage, auth/authz, implement contenteditable, change package/document
schema, add collaboration/offline behavior, or copy legacy editor runtime.

Next recommended phase: Phase 195 Text Engine WASM Artifact Production Gate.

## Phase 195 Text Engine WASM Artifact Production Gate

Phase 195 checks the accepted package-local WASM artifact production path and
does not run `wasm:build` because the Phase 194 readiness smoke still reports
unavailable tooling:

- artifact production summary:
  `packages/text-engine-rust-wasm/fixtures/wasm-artifact-production.v1.json`;
- accepted artifact path:
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- accepted package script: `wasm:build`;
- build run status: `not-run-toolchain-unavailable`;
- `wasm-pack` is unavailable;
- `wasm32-unknown-unknown` is not installed;
- `toolchainReady=false`;
- `artifactProduced=false`;
- `artifactPointer=null`;
- `retentionPointer=null`;
- `fileSizeBytes=null`;
- `digestStatus="pending"`;
- `sha256=null`;
- Phase 196 Artifact Digest Pinning Execution is blocked until a real artifact
  exists;
- root `npm.cmd run check` does not require `wasm-pack`, the WASM target, the
  readiness smoke, the WASM build, or an artifact;
- raw native/WASM evidence remains outside root tests/docs;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, accepted manifest, production binding, and
  default-measurer replacement remain blocked.

This phase intentionally does not require `wasm-pack` or
`wasm32-unknown-unknown` in root checks, execute rustybuzz/WASM/ICU4X in
`@flowdoc/vnext-core`, put raw native/WASM evidence in root tests/docs,
produce a fake WASM artifact, pin a fake sha256, produce an artifact, replace
`measureVNextText(...)`, mutate pagination, bind production renderer-backed
measurement, add production PDF/DOCX renderer work, add backend routes,
storage, auth/authz, implement contenteditable, change package/document
schema, add collaboration/offline behavior, or copy legacy editor runtime.

Next recommended work: Text Engine WASM Toolchain Provisioning Bootstrap
Gate.

## Phase 195A Text Engine WASM Toolchain Provisioning Bootstrap Gate

The provisioning bootstrap gate defines the accepted package-local
provisioning strategy without executing network or system toolchain changes:

- provisioning bootstrap summary:
  `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-bootstrap.v1.json`;
- package-local script:
  `packages/text-engine-rust-wasm/scripts/plan-wasm-toolchain-bootstrap.mjs`;
- package script: `wasm:bootstrap-plan`;
- strategy: `developer-or-ci-bootstrap`;
- `wasm-pack` default provisioning command:
  `cargo install wasm-pack --locked`;
- `wasm32-unknown-unknown` provisioning command:
  `rustup target add wasm32-unknown-unknown`;
- allowed alternates: pinned CI image, internal tool cache, and preinstalled
  developer toolchain;
- `rustc` version observed as `rustc 1.88.0 (6b00bc388 2025-06-23)`;
- `cargo` version observed as `cargo 1.88.0 (873a06493 2025-05-10)`;
- `wasm-pack` version remains pending until installed;
- `wasm32-unknown-unknown` remains missing;
- root `npm.cmd run check` does not require `wasm-pack`, the WASM target, the
  bootstrap plan, the readiness smoke, the WASM build, or an artifact;
- artifact production remains blocked;
- digest pinning remains blocked;
- raw native/WASM evidence remains outside root tests/docs;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, accepted manifest, production binding, and
  default-measurer replacement remain blocked.

This phase intentionally does not require `wasm-pack` or
`wasm32-unknown-unknown` in root checks, execute rustybuzz/WASM/ICU4X in
`@flowdoc/vnext-core`, produce a fake WASM artifact, pin a fake sha256,
produce an artifact, replace `measureVNextText(...)`, mutate pagination, bind
production renderer-backed measurement, add production PDF/DOCX renderer work,
add backend routes, storage, auth/authz, implement contenteditable, change
package/document schema, add collaboration/offline behavior, or copy legacy
editor runtime.

Next recommended work: Text Engine WASM Toolchain Provisioning Execution
Gate. Artifact Digest Pinning Execution remains blocked.

## Phase 195B Text Engine WASM Toolchain Provisioning Execution Gate

The provisioning execution gate attempts the accepted package-local
provisioning path and records the result as JSON-safe summary metadata:

- provisioning execution summary:
  `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-execution.v1.json`;
- `cargo install wasm-pack --locked` was attempted with explicit escalation
  for network and user Rust toolchain writes;
- the attempted `wasm-pack` install selected `wasm-pack v0.15.0`;
- `wasm-pack` was not installed because dependency `cargo-platform@0.3.3`
  requires `rustc 1.91` while this environment reports `rustc 1.88.0`;
- `rustup target add wasm32-unknown-unknown` was attempted and succeeded;
- post-execution `wasm:readiness-smoke` reports
  `wasm32UnknownUnknownInstalled=true`, `wasmPackAvailable=false`, and
  `toolchainReady=false`;
- root `npm.cmd run check` does not require `wasm-pack`, the WASM target,
  provisioning execution, the readiness smoke, the WASM build, or an artifact;
- artifact production remains blocked until `toolchainReady=true`;
- digest pinning remains blocked until a real artifact exists;
- raw native/WASM evidence remains outside root tests/docs;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, accepted manifest, production binding, and
  default-measurer replacement remain blocked.

This phase intentionally does not require `wasm-pack` or
`wasm32-unknown-unknown` in root checks, execute rustybuzz/WASM/ICU4X in
`@flowdoc/vnext-core`, produce a fake WASM artifact, pin a fake sha256,
produce an artifact, replace `measureVNextText(...)`, mutate pagination, bind
production renderer-backed measurement, add production PDF/DOCX renderer work,
add backend routes, storage, auth/authz, implement contenteditable, change
package/document schema, add collaboration/offline behavior, or copy legacy
editor runtime.

Next recommended work: Text Engine WASM Toolchain Version Compatibility Gate.
Artifact Digest Pinning Execution remains blocked.

## Phase 195C Text Engine WASM Toolchain Version Compatibility Gate

The version compatibility gate compares the available strategies after
`cargo install wasm-pack --locked` selects `wasm-pack v0.15.0` and fails
because `cargo-platform@0.3.3` requires `rustc 1.91` while this environment
reports `rustc 1.88.0`:

- compatibility summary:
  `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-version-compatibility.v1.json`;
- compared strategies: upgrade Rust to `1.91+`, pin older compatible
  `wasm-pack`, pinned CI image, internal tool cache, and preinstalled
  developer toolchain;
- immediate accepted strategy: upgrade Rust toolchain to `1.91+`;
- longer-term reproducible accepted strategy: pinned CI image or equivalent
  immutable runner;
- `wasm32-unknown-unknown` remains recorded as installed;
- `wasm-pack` remains unavailable;
- `toolchainReady=false`;
- root `npm.cmd run check` does not require `wasm-pack`, the WASM target, the
  compatibility strategy, the readiness smoke, the WASM build, or an artifact;
- artifact production remains blocked until `wasm-pack` is available and
  `toolchainReady=true`;
- digest pinning remains blocked until a real artifact exists;
- raw native/WASM evidence remains outside root tests/docs;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, accepted manifest, production binding, and
  default-measurer replacement remain blocked.

This phase intentionally does not require `wasm-pack` or
`wasm32-unknown-unknown` in root checks, execute rustybuzz/WASM/ICU4X in
`@flowdoc/vnext-core`, produce a fake WASM artifact, pin a fake sha256,
produce an artifact, replace `measureVNextText(...)`, mutate pagination, bind
production renderer-backed measurement, add production PDF/DOCX renderer work,
add backend routes, storage, auth/authz, implement contenteditable, change
package/document schema, add collaboration/offline behavior, or copy legacy
editor runtime.

Next recommended work: Text Engine WASM Toolchain Rust Upgrade Execution
Gate. Artifact Digest Pinning Execution remains blocked.

## Phase 195D Text Engine WASM Toolchain Rust Upgrade Execution Gate

The Rust upgrade execution gate executes the accepted immediate strategy from
Phase 195C and records the result as JSON-safe package-local metadata:

- Rust upgrade execution summary:
  `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-rust-upgrade-execution.v1.json`;
- `rustup update stable` was attempted with explicit escalation for network
  and user Rust toolchain writes;
- the upgraded toolchain reports `rustc 1.96.0` and `cargo 1.96.0`;
- `wasm32-unknown-unknown` remains installed;
- `cargo install wasm-pack --locked` was retried only after `rustc` satisfied
  the `1.91+` requirement;
- `wasm-pack --version` reports `wasm-pack 0.15.0`;
- post-execution `wasm:readiness-smoke` reports `wasmPackAvailable=true`,
  `wasm32UnknownUnknownInstalled=true`, `toolchainReady=true`, and
  `canProduceArtifactNow=true`;
- root `npm.cmd run check` does not require `wasm-pack`, the WASM target,
  Rust upgrade execution, the readiness smoke, the WASM build, or an artifact;
- artifact production was not run in this phase and must occur only in the
  next dedicated retry gate;
- digest pinning remains blocked until a real artifact exists;
- raw native/WASM evidence remains outside root tests/docs;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, accepted manifest, production binding, and
  default-measurer replacement remain blocked.

This phase intentionally does not require `wasm-pack` or
`wasm32-unknown-unknown` in root checks, execute rustybuzz/WASM/ICU4X in
`@flowdoc/vnext-core`, produce a fake WASM artifact, pin a fake sha256,
produce an artifact, replace `measureVNextText(...)`, mutate pagination, bind
production renderer-backed measurement, add production PDF/DOCX renderer work,
add backend routes, storage, auth/authz, implement contenteditable, change
package/document schema, add collaboration/offline behavior, or copy legacy
editor runtime.

Next recommended work: Text Engine WASM Artifact Production Retry Gate.
Artifact Digest Pinning Execution remains blocked.

## Phase 195E Text Engine WASM Artifact Production Retry Gate

The artifact production retry gate attempts the accepted package-local build
after Phase 195D reports `toolchainReady=true`:

- artifact production retry summary:
  `packages/text-engine-rust-wasm/fixtures/wasm-artifact-production-retry.v1.json`;
- readiness before build reports `wasmPackAvailable=true`,
  `wasmPackVersion="wasm-pack 0.15.0"`,
  `wasm32UnknownUnknownInstalled=true`, `toolchainReady=true`, and
  `canProduceArtifactNow=true`;
- package-local `npm run wasm:build` was attempted;
- underlying command:
  `wasm-pack build rust-shaper --target web --out-dir ../pkg --out-name flowdoc_text_engine`;
- the crate compiled for the WASM target, but `wasm-pack` failed package
  generation because `rust-shaper/Cargo.toml` lacks
  `wasm-bindgen = "0.2"`;
- accepted artifact path
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm` remains
  absent;
- generated package metadata shape is `not-generated`;
- `artifactProduced=false`, `artifactPointer=null`, `fileSizeBytes=null`,
  `digestStatus="pending"`, and `sha256=null`;
- root `npm.cmd run check` does not require `wasm-pack`, the WASM target,
  readiness smoke, WASM build, artifact production retry, or an artifact;
- digest pinning remains blocked until a real artifact exists;
- raw native/WASM evidence remains outside root tests/docs;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, accepted manifest, production binding, and
  default-measurer replacement remain blocked.

This phase intentionally does not require `wasm-pack` or
`wasm32-unknown-unknown` in root checks, execute rustybuzz/WASM/ICU4X in
`@flowdoc/vnext-core`, produce a fake WASM artifact, pin a fake sha256,
compute sha256, replace `measureVNextText(...)`, mutate pagination, bind
production renderer-backed measurement, add production PDF/DOCX renderer work,
add backend routes, storage, auth/authz, implement contenteditable, change
package/document schema, add collaboration/offline behavior, or copy legacy
editor runtime.

Next recommended work: Text Engine WASM Bindgen Export Dependency Gate.
Artifact Digest Pinning Execution remains blocked.

## Phase 195F Text Engine WASM Bindgen Export Dependency Gate

The bindgen export dependency gate resolves the package-local blocker reported
by Phase 195E without retrying artifact production:

- bindgen/export dependency summary:
  `packages/text-engine-rust-wasm/fixtures/wasm-bindgen-export-dependency.v1.json`;
- package-local `wasm-bindgen = "0.2"` dependency was added to
  `packages/text-engine-rust-wasm/rust-shaper/Cargo.toml`;
- `Cargo.lock` records `wasm-bindgen 0.2.126`;
- `src/lib.rs` now exposes only two minimal `#[wasm_bindgen]` functions:
  readiness marker and boundary version;
- the WASM library does not execute rustybuzz shaping, ICU4X, pagination, or
  production measurement;
- native `src/main.rs` rustybuzz smoke path remains intact;
- package-local WASM target and native cargo checks pass;
- package-local `wasm:build` was not retried in this phase;
- accepted artifact path
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm` remains
  absent;
- `artifactProduced=false`, `artifactPointer=null`, `fileSizeBytes=null`,
  `digestStatus="pending"`, and `sha256=null`;
- root `npm.cmd run check` does not require `wasm-bindgen`, `wasm-pack`, the
  WASM target, readiness smoke, WASM build, artifact production retry, or an
  artifact;
- digest pinning remains blocked until a real artifact exists;
- raw native/WASM evidence remains outside root tests/docs;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, accepted manifest, production binding, and
  default-measurer replacement remain blocked.

This phase intentionally does not require `wasm-pack` or
`wasm32-unknown-unknown` in root checks, execute rustybuzz/WASM/ICU4X in
`@flowdoc/vnext-core`, produce a fake WASM artifact, pin a fake sha256,
compute sha256, retry artifact production, replace `measureVNextText(...)`,
mutate pagination, bind production renderer-backed measurement, add
production PDF/DOCX renderer work, add backend routes, storage, auth/authz,
implement contenteditable, change package/document schema, add
collaboration/offline behavior, or copy legacy editor runtime.

Next recommended work: Text Engine WASM Artifact Production Retry Gate.
Artifact Digest Pinning Execution remains blocked.

## Phase 195G Text Engine WASM Artifact Production Retry After Bindgen Gate

The post-bindgen artifact production retry gate uses Phase 195F as source of
truth and reruns the accepted package-local build:

- artifact production retry summary:
  `packages/text-engine-rust-wasm/fixtures/wasm-artifact-production-retry.v1.json`;
- readiness before build reports `wasmPackAvailable=true`,
  `wasmPackVersion="wasm-pack 0.15.0"`,
  `wasm32UnknownUnknownInstalled=true`, `toolchainReady=true`, and
  `canProduceArtifactNow=true`;
- package-local `npm run wasm:build` was attempted after readiness passed;
- underlying command:
  `wasm-pack build rust-shaper --target web --out-dir ../pkg --out-name flowdoc_text_engine`;
- the build succeeded after the package-local `wasm-bindgen` dependency and
  minimal export boundary were added;
- accepted artifact path
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm` now exists;
- generated package metadata shape is `generated`;
- generated files include `flowdoc_text_engine.js`,
  `flowdoc_text_engine.d.ts`, `flowdoc_text_engine_bg.wasm.d.ts`, and
  `package.json`;
- `artifactProduced=true`,
  `artifactPointer="packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm"`,
  `fileSizeBytes=13782`, `digestStatus="pending"`, and `sha256=null`;
- root `npm.cmd run check` does not require `wasm-pack`, the WASM target,
  readiness smoke, WASM build, artifact production retry, or artifacts;
- sha256 was not computed or pinned in this phase;
- raw native/WASM evidence remains outside root tests/docs;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, accepted manifest, production binding, and
  default-measurer replacement remain blocked.

This phase intentionally does not require `wasm-pack` or
`wasm32-unknown-unknown` in root checks, execute rustybuzz/WASM/ICU4X in
`@flowdoc/vnext-core`, produce a fake WASM artifact, pin a fake sha256,
compute sha256, replace `measureVNextText(...)`, mutate pagination, bind
production renderer-backed measurement, add production PDF/DOCX renderer work,
add backend routes, storage, auth/authz, implement contenteditable, change
package/document schema, add collaboration/offline behavior, or copy legacy
editor runtime.

Next recommended work: Artifact Digest Pinning Execution.
Production measurement replacement remains blocked.

## Phase 196 Artifact Digest Pinning Execution

Artifact Digest Pinning Execution uses the post-bindgen artifact production
retry gate as source of truth and pins only the accepted package-local WASM
artifact:

- artifact path:
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- artifact exists and remains package-local;
- file size is `13782` bytes;
- sha256 is
  `4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44`;
- the sha256 is lowercase 64-character hex;
- matrix id, corpus id, policy revision, measurement profile id, output shape,
  and runtime identity context match the digest pinning policy;
- package-local digest/runtime identity summaries now report
  `digestStatus="pinned"`;
- root docs/tests remain limited to JSON-safe summaries and retention
  pointers;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, accepted manifest, production binding, and
  default-measurer replacement remain blocked.

This phase intentionally does not require `wasm-pack` or
`wasm32-unknown-unknown` in root checks, execute rustybuzz/WASM/ICU4X in
`@flowdoc/vnext-core`, put raw native/WASM evidence in root tests/docs, fake
sha256, replace `measureVNextText(...)`, mutate pagination, bind production
renderer-backed measurement, add production PDF/DOCX renderer work, add
backend routes/storage/auth/authz, implement contenteditable, change
package/document schema, add collaboration/offline behavior, or copy legacy
editor runtime.

Next recommended work: Native Evidence Summary Gate.
Production measurement replacement remains blocked.

## Phase 197 Native Evidence Summary Gate

Native Evidence Summary Gate uses Artifact Digest Pinning Execution as source
of truth and adds the first package-local, JSON-safe native evidence summary
metadata subset:

- summary fixture:
  `packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json`;
- source digest summary:
  `packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`;
- artifact path:
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- sha256:
  `4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44`;
- covered release-gating rows:
  `v1-measure-thai-line-break-core` and
  `v1-measure-latin-product-paragraphs`;
- summary mode is `json-safe-native-evidence-metadata-only`;
- raw native evidence is excluded from root docs/tests and represented only by
  package-local/external retention pointers;
- WASM evidence, native/WASM parity summaries, renderer-backed drift
  summaries, numeric thresholds, accepted manifest, production binding, and
  default-measurer replacement remain blocked.

This phase intentionally does not put raw native evidence in root docs/tests,
execute WASM evidence, claim native/WASM parity, claim renderer-backed drift,
accept numeric thresholds, claim accepted summary manifest, replace
`measureVNextText(...)`, mutate pagination, bind production renderer-backed
measurement, add production PDF/DOCX renderer work, add backend
routes/storage/auth/authz, implement contenteditable, change package/document
schema, add collaboration/offline behavior, or copy legacy editor runtime.

Next recommended work: WASM Evidence Summary Gate.
Production measurement replacement remains blocked.

## Phase 198 WASM Evidence Summary Gate

WASM Evidence Summary Gate uses Native Evidence Summary Gate as source of
truth and adds the matching package-local, JSON-safe WASM evidence summary
metadata subset:

- summary fixture:
  `packages/text-engine-rust-wasm/fixtures/wasm-evidence-summary.v1.json`;
- source native summary:
  `packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json`;
- artifact path:
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- sha256:
  `4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44`;
- covered release-gating rows:
  `v1-measure-thai-line-break-core` and
  `v1-measure-latin-product-paragraphs`;
- summary mode is `json-safe-wasm-evidence-metadata-only`;
- raw WASM evidence is excluded from root docs/tests and represented only by
  package-local/external retention pointers;
- native/WASM parity summaries, renderer-backed drift summaries, numeric
  thresholds, accepted manifest, production binding, and default-measurer
  replacement remain blocked.

This phase intentionally does not put raw WASM evidence in root docs/tests,
claim native/WASM parity, claim renderer-backed drift, accept numeric
thresholds, claim accepted summary manifest, replace `measureVNextText(...)`,
mutate pagination, bind production renderer-backed measurement, add production
PDF/DOCX renderer work, add backend routes/storage/auth/authz, implement
contenteditable, change package/document schema, add collaboration/offline
behavior, or copy legacy editor runtime.

Next recommended work: Native/WASM Parity Summary Gate.
Production measurement replacement remains blocked.

## Phase 199 Native/WASM Parity Summary Gate

Native/WASM Parity Summary Gate uses WASM Evidence Summary Gate as source of
truth and compares the native and WASM summary metadata for the same minimal
fixture subset:

- summary fixture:
  `packages/text-engine-rust-wasm/fixtures/native-wasm-parity-summary.v1.json`;
- source native summary:
  `packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json`;
- source WASM summary:
  `packages/text-engine-rust-wasm/fixtures/wasm-evidence-summary.v1.json`;
- artifact path:
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- sha256:
  `4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44`;
- covered release-gating rows:
  `v1-measure-thai-line-break-core` and
  `v1-measure-latin-product-paragraphs`;
- summary mode is `json-safe-native-wasm-parity-metadata-only`;
- parity status is `matching-summary-metadata`;
- raw native/WASM evidence is excluded from root docs/tests and represented
  only by package-local/external retention pointers;
- renderer-backed drift summaries, numeric thresholds, accepted manifest,
  production binding, and default-measurer replacement remain blocked.

This phase intentionally does not put raw native/WASM evidence in root
docs/tests, claim renderer-backed drift, accept numeric thresholds, claim
accepted summary manifest, replace `measureVNextText(...)`, mutate pagination,
bind production renderer-backed measurement, add production PDF/DOCX renderer
work, add backend routes/storage/auth/authz, implement contenteditable, change
package/document schema, add collaboration/offline behavior, or copy legacy
editor runtime.

Next recommended work: Renderer-backed Drift Summary Gate.
Production measurement replacement remains blocked.

## Phase 200 Renderer-backed Drift Summary Gate

Renderer-backed Drift Summary Gate uses Native/WASM Parity Summary Gate as
source of truth and adds package-local, JSON-safe renderer-backed drift summary
metadata for the same minimal fixture subset:

- summary fixture:
  `packages/text-engine-rust-wasm/fixtures/renderer-backed-drift-summary.v1.json`;
- source parity summary:
  `packages/text-engine-rust-wasm/fixtures/native-wasm-parity-summary.v1.json`;
- artifact path:
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- sha256:
  `4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44`;
- covered release-gating rows:
  `v1-measure-thai-line-break-core` and
  `v1-measure-latin-product-paragraphs`;
- summary mode is `json-safe-renderer-backed-drift-metadata-only`;
- native/WASM parity status is `matching-summary-metadata`;
- renderer-backed drift status is `summary-metadata-present`;
- drift metadata coverage is recorded as unthresholded width, height, and
  line-count drift metadata;
- raw native/WASM/renderer evidence is excluded from root docs/tests and
  represented only by package-local/external retention pointers;
- numeric thresholds, accepted manifest, production binding, and
  default-measurer replacement remain blocked.

This phase intentionally does not put raw renderer evidence in root docs/tests,
accept numeric drift thresholds, claim accepted summary manifest, replace
`measureVNextText(...)`, mutate pagination, bind production renderer-backed
measurement, add production PDF/DOCX renderer work, add backend
routes/storage/auth/authz, implement contenteditable, change package/document
schema, add collaboration/offline behavior, or copy legacy editor runtime.

Next recommended work: Numeric Drift Threshold Decision.
Production measurement replacement remains blocked.

## Phase 201 Numeric Drift Threshold Decision

Numeric Drift Threshold Decision uses Renderer-backed Drift Summary Gate as
source of truth and accepts package-local, JSON-safe numeric threshold policy
metadata for the same minimal fixture subset:

- threshold decision fixture:
  `packages/text-engine-rust-wasm/fixtures/numeric-drift-threshold-decision.v1.json`;
- source drift summary:
  `packages/text-engine-rust-wasm/fixtures/renderer-backed-drift-summary.v1.json`;
- artifact path:
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- sha256:
  `4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44`;
- covered release-gating rows:
  `v1-measure-thai-line-break-core` and
  `v1-measure-latin-product-paragraphs`;
- threshold policy revision is `numeric-drift-threshold-policy-v1`;
- width and height drift pass at `<=0.5pt`, warn at `>0.5pt` and `<=1.0pt`,
  and block above `1.0pt`;
- release-gating line-count drift is zero-only;
- threshold policy status is `accepted-policy`;
- raw native/WASM/renderer evidence is excluded from root docs/tests and
  represented only by package-local/external retention pointers;
- accepted manifest, production binding, and default-measurer replacement
  remain blocked.

This phase intentionally does not put raw renderer/native/WASM evidence in
root docs/tests, claim an accepted summary manifest, replace
`measureVNextText(...)`, mutate pagination, bind production renderer-backed
measurement, add production PDF/DOCX renderer work, add backend
routes/storage/auth/authz, implement contenteditable, change package/document
schema, add collaboration/offline behavior, or copy legacy editor runtime.

Next recommended work: Accepted Summary Manifest Population.
Production measurement replacement remains blocked.

## Phase 202 Accepted Summary Manifest Population

Accepted Summary Manifest Population uses Numeric Drift Threshold Decision as
source of truth and adds the first JSON-safe accepted manifest entries for the
same minimal fixture subset:

- accepted manifest fixture:
  `fixtures/measurement-evidence-summary-manifest.accepted.v1.json`;
- source threshold decision:
  `packages/text-engine-rust-wasm/fixtures/numeric-drift-threshold-decision.v1.json`;
- artifact path:
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- sha256:
  `4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44`;
- accepted manifest rows:
  `v1-measure-thai-line-break-core` and
  `v1-measure-latin-product-paragraphs`;
- each row carries JSON-safe digest, native evidence, WASM evidence,
  native/WASM parity, renderer-backed drift, numeric threshold policy, and
  retention pointer status;
- raw native/WASM/renderer evidence is excluded from root docs/tests and
  represented only by package-local/external retention pointers;
- full v1 matrix status remains `partial-not-accepted`;
- production binding and default-measurer replacement remain blocked.

This phase intentionally does not put raw renderer/native/WASM evidence in
root docs/tests, claim production binding, replace `measureVNextText(...)`,
mutate pagination, bind production renderer-backed measurement, add production
PDF/DOCX renderer work, add backend routes/storage/auth/authz, implement
contenteditable, change package/document schema, add collaboration/offline
behavior, or copy legacy editor runtime.

Next recommended work: Measurement Hardening Close Audit.
Production measurement replacement remains blocked.

## Phase 203 Measurement Hardening Close Audit

Measurement Hardening Close Audit uses Accepted Summary Manifest Population as
source of truth and closes the first measurement hardening infrastructure loop
for the minimal accepted subset:

- accepted manifest fixture:
  `fixtures/measurement-evidence-summary-manifest.accepted.v1.json`;
- accepted manifest rows:
  `v1-measure-thai-line-break-core` and
  `v1-measure-latin-product-paragraphs`;
- each accepted row carries digest identity status `pinned`, native evidence
  status `summary-metadata-present`, WASM evidence status
  `summary-metadata-present`, native/WASM parity status
  `matching-summary-metadata`, renderer-backed drift summary status
  `summary-metadata-present`, numeric threshold policy status
  `accepted-policy`, and retention pointer status `present`;
- the pinned artifact path remains
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- the pinned sha256 remains
  `4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44`;
- the full v1 matrix remains `partial-not-accepted`;
- the close audit decision is sufficient for a mini infrastructure checkpoint
  only;
- the recommended next lane is Template Publish / Variable Schema / Render API
  planning.

This phase intentionally does not claim full v1 measurement production
readiness, replace `measureVNextText(...)`, mutate pagination, bind production
renderer-backed measurement, add production PDF/DOCX renderer work, add
backend routes/storage/auth/authz, implement contenteditable, change
package/document schema, add collaboration/offline behavior, put raw
native/WASM/renderer evidence in root docs/tests, or copy legacy editor
runtime.

Next recommended work: Template Publish / Variable Schema / Render API
Planning Gate.
Production measurement replacement remains blocked.

## Phase 204 Template Variable Render API Planning Gate

Template Publish / Variable Schema / Render API Planning Gate uses
Measurement Hardening Close Audit as source of truth and ranks the next
non-measurement mini infrastructure lanes:

- rank 1: Template Publish / Version Boundary, selected first;
- rank 2: Variable Schema / Data Contract, deferred;
- rank 3: Render API Contract, deferred.

Template Publish / Version Boundary is selected first because Variable Schema
and Render API contracts need a stable published template/version target before
they can safely attach to template state. The selected first lane must define
or prove publishable canonical package v2/document v3 source, draft identity
separation from published version identity, stable immutable version ids,
JSON-safe version metadata, publish validation evidence, rejected publish
blockers, retention pointer policy, and rollback/deprecation/superseding
version policy.

This phase intentionally does not replace `measureVNextText(...)`, claim full
measurement production readiness, mutate pagination, bind production
renderer-backed measurement, add production PDF/DOCX renderer work, add
backend routes/storage/auth/authz, implement contenteditable, change
package/document schema, add collaboration/offline behavior, or copy legacy
editor runtime.

Next recommended work: Template Publish / Version Boundary Gate.
Production measurement replacement remains blocked.

## Phase 205 Template Publish Version Boundary Gate

Template Publish / Version Boundary Gate uses Template Publish / Variable
Schema / Render API Planning Gate as source of truth and accepts a JSON-safe
publish/version boundary for canonical FlowDoc template candidates before
Variable Schema or Render API contracts attach.

The accepted boundary records:

- mutable draft template identity for authoring/review work;
- immutable published template version identity for accepted version
  references;
- JSON-safe published version metadata;
- canonical package v2/document v3 as the publishable candidate source;
- publish validation evidence shape for package parse, graph diagnostics,
  key/data diagnostics, export-readiness, measurement status, and rejected
  publish blockers;
- source package/template snapshot retention pointer evidence without claiming
  production storage durability;
- rollback, deprecation, and superseding-version policy names.

The gate concludes a schema decision is not required before validation evidence
because the identity/version semantics can be expressed as external JSON-safe
metadata without mutating package v2/document v3.

This phase intentionally does not implement backend production routes, claim
production storage durability, produce renderer artifact bytes, add auth/authz
behavior, change package/document schema, implement Variable Schema / Data
Contract, implement Render API Contract, replace `measureVNextText(...)`,
claim full measurement production readiness, mutate pagination, bind
production renderer-backed measurement, add production PDF/DOCX renderer work,
implement production contenteditable, add collaboration/offline behavior, or
copy legacy editor runtime.

Next recommended work: Template Publish Validation Evidence Gate.
Production measurement replacement remains blocked.

## Phase 206 Template Publish Validation Evidence Gate

Template Publish Validation Evidence Gate uses Template Publish / Version
Boundary Gate as source of truth and accepts JSON-safe publish validation
evidence for a canonical FlowDoc package v2/document v3 candidate.

The accepted evidence records:

- source boundary id `template-publish-version-boundary-v1` remains accepted;
- draft template identity remains separate from published template version
  identity;
- Variable Schema / Data Contract and Render API Contract remain deferred;
- candidate source is `fixtures/product-report-vnext.flowdoc.json`;
- package parse status is `ready` with zero issues;
- graph diagnostics status is `ready` with zero issues;
- key/data diagnostics status is `ready` with zero errors and zero warnings;
- export-readiness status is `ready-with-warnings` with zero blocking issues;
- measurement status remains `mini-checkpoint-only`;
- rejected publish blockers use the accepted blocker vocabulary and do not
  mutate canonical package schema;
- source snapshot and validation evidence retention pointers are present
  without claiming production storage durability.

This phase intentionally does not mutate package/document schema, implement
backend production routes, claim production storage durability, produce
renderer artifact bytes, add auth/authz behavior, implement Variable Schema /
Data Contract, implement Render API Contract, replace `measureVNextText(...)`,
claim full measurement production readiness, mutate pagination, bind
production renderer-backed measurement, add production PDF/DOCX renderer work,
implement production contenteditable, add collaboration/offline behavior, or
copy legacy editor runtime.

Next recommended work: Template Publish Accepted Version Metadata Gate.
Production measurement replacement remains blocked.

## Phase 207 Template Publish Accepted Version Metadata Gate

Template Publish Accepted Version Metadata Gate uses Template Publish
Validation Evidence Gate as source of truth and populates JSON-safe accepted
published version metadata for the validated canonical package v2/document v3
template candidate.

The accepted metadata records:

- source validation evidence id `template-publish-validation-evidence-v1`
  remains accepted;
- candidate source is `fixtures/product-report-vnext.flowdoc.json`;
- candidate package id and document id are `product-report-vnext`;
- `templateId`, `templateVersionId`, `versionOrdinal`, source package id,
  package/document versions, title, status, lifecycle policy, source snapshot
  pointer, validation evidence pointer/status, export-readiness status/warning
  count, and measurement status;
- draft template identity remains separate from accepted published version
  identity;
- accepted `templateVersionId`, source snapshot pointer, and validation
  evidence pointer are immutable;
- export-readiness warning visibility is preserved;
- measurement remains `mini-checkpoint-only`;
- accepted metadata is represented without package/document schema changes.

This phase intentionally does not mutate package/document schema, implement
backend production routes, claim production storage durability, produce
renderer artifact bytes, add auth/authz behavior, implement Variable Schema /
Data Contract, implement Render API Contract, replace `measureVNextText(...)`,
claim full measurement production readiness, mutate pagination, bind
production renderer-backed measurement, add production PDF/DOCX renderer work,
implement production contenteditable, add collaboration/offline behavior, or
copy legacy editor runtime.

Next recommended work: Template Publish Close Audit.
Production measurement replacement remains blocked.

## Phase 208 Template Publish Close Audit

Template Publish Close Audit uses Template Publish Accepted Version Metadata
Gate as source of truth and decides whether the Template Publish mini lane can
close after accepted version metadata is populated.

The close audit confirms:

- accepted metadata fixture
  `fixtures/template-publish-accepted-version-metadata.v1.json` exists;
- required accepted version metadata fields are present;
- draft template identity remains separate from published template version
  identity;
- accepted `templateVersionId`, source snapshot pointer, and validation
  evidence pointer are immutable;
- export-readiness warning visibility is preserved as
  `ready-with-warnings` with warning count `1`;
- measurement remains `mini-checkpoint-only`;
- accepted metadata is represented without package/document schema changes;
- ready-with-warnings is acceptable for this mini lane close because the
  warning remains visible and no renderer artifact or production renderer
  readiness is claimed.

The audit closes the Template Publish mini lane for a mini infrastructure
checkpoint only. It does not claim production template publishing readiness.

This phase intentionally does not mutate package/document schema, implement
backend production routes, claim production storage durability, produce
renderer artifact bytes, add auth/authz behavior, implement Variable Schema /
Data Contract, implement Render API Contract, replace `measureVNextText(...)`,
claim full measurement production readiness, mutate pagination, bind
production renderer-backed measurement, add production PDF/DOCX renderer work,
implement production contenteditable, add collaboration/offline behavior, or
copy legacy editor runtime.

Next recommended work: Variable Schema / Data Contract Planning Gate.
Production measurement replacement remains blocked.

## Phase 209 Variable Schema Data Contract Planning Gate

Variable Schema / Data Contract Planning Gate uses Template Publish Close
Audit as source of truth and plans the Variable Schema / Data Contract lane
against accepted published template version metadata before implementation.

The planning gate confirms:

- Template Publish mini lane is closed for a mini infrastructure checkpoint
  only;
- accepted metadata fixture
  `fixtures/template-publish-accepted-version-metadata.v1.json` exists;
- stable target fields include `templateId`, `templateVersionId`,
  `versionOrdinal`, source package id, package/document versions, validation
  evidence status, export-readiness status/warning count, and measurement
  status;
- draft template identity remains separate from published template version
  identity;
- accepted `templateVersionId` and retention pointers are immutable;
- Variable Schema / Data Contract evidence can attach to published template
  version identity, accepted validation evidence pointer, and source snapshot
  retention pointer without package/document schema mutation.

It ranks the first sub-lanes as variable reference discovery / candidate
variable list, variable schema metadata shape, data contract validation policy,
missing-value/default/required policy, and compatibility policy with published
template versions. It selects variable reference discovery / candidate
variable list first because later metadata and policy gates need the actual
authored variable-reference surface before they can safely define contracts.

This phase intentionally does not mutate package/document schema, implement
Variable Schema / Data Contract, implement Render API Contract, implement
backend production routes, claim production storage durability, produce
renderer artifact bytes, add auth/authz behavior, replace
`measureVNextText(...)`, claim full measurement production readiness, mutate
pagination, bind production renderer-backed measurement, add production
PDF/DOCX renderer work, implement production contenteditable, add
collaboration/offline behavior, or copy legacy editor runtime.

Next recommended work: Variable Reference Discovery Gate.
Production measurement replacement remains blocked.

## Phase 210 Variable Reference Discovery Gate

Variable Reference Discovery Gate uses Variable Schema / Data Contract
Planning Gate as source of truth and produces JSON-safe discovery evidence for
the accepted published template version target.

The discovery evidence records:

- discovery fixture:
  `fixtures/variable-reference-discovery.v1.json`;
- source snapshot:
  `fixtures/product-report-vnext.flowdoc.json`;
- attachment target: `template-product-report-vnext@v1`;
- accepted validation evidence pointer:
  `repo://fixtures/template-publish-validation-evidence.v1.json`;
- source snapshot retention pointer:
  `repo://fixtures/product-report-vnext.flowdoc.json`;
- package parse status: `ready`;
- discovery source scope: authored inline `field-ref` nodes in text-block
  children, with section/zone/table context;
- field-ref occurrence count: `11`;
- candidate variable count: `6`;
- candidate variable ids: `customer.name`, `customer.segment`,
  `prepared.by`, `report.period`, `report.riskLevel`, and `report.total`;
- registry cross-reference status:
  `all-discovered-refs-resolved`;
- unresolved references: none;
- unsupported references: none;
- duplicate candidate ids: none;
- blockers before Variable Schema Metadata Shape Gate: none.

This phase intentionally does not mutate package/document schema, implement
the full Variable Schema / Data Contract, implement Render API Contract,
implement backend production routes, claim production storage durability,
produce renderer artifact bytes, add auth/authz behavior, replace
`measureVNextText(...)`, claim full measurement production readiness, mutate
pagination, bind production renderer-backed measurement, add production
PDF/DOCX renderer work, implement production contenteditable, add
collaboration/offline behavior, or copy legacy editor runtime.

Next recommended work: Variable Schema Metadata Shape Gate.
Production measurement replacement remains blocked.

## Phase 211 Variable Schema Metadata Shape Gate

Variable Schema Metadata Shape Gate uses Variable Reference Discovery Gate as
source of truth and defines JSON-safe metadata shape evidence for all
discovered candidate variables.

The metadata shape evidence records:

- metadata shape fixture:
  `fixtures/variable-schema-metadata-shape.v1.json`;
- source discovery evidence:
  `repo://fixtures/variable-reference-discovery.v1.json`;
- attachment target: `template-product-report-vnext@v1`;
- accepted validation evidence pointer:
  `repo://fixtures/template-publish-validation-evidence.v1.json`;
- source snapshot retention pointer:
  `repo://fixtures/product-report-vnext.flowdoc.json`;
- discovery field-ref occurrence count: `11`;
- candidate variable count: `6`;
- registry field count: `6`;
- candidate variable ids: `customer.name`, `customer.segment`,
  `prepared.by`, `report.period`, `report.riskLevel`, and `report.total`;
- variable metadata row fields: `variableId`, `sourceFieldKey`,
  `valueTypeCandidate`, `displayLabelCandidate`, `occurrenceCount`,
  `occurrenceContextSummary`, `registryStatus`, `requiredPolicyStatus`,
  `defaultPolicyStatus`, `validationPolicyStatus`, and
  `compatibilityStatus`;
- required policy status: `deferred-policy`;
- default policy status: `deferred-policy`;
- validation policy status:
  `deferred-until-data-contract-validation-policy-gate`;
- compatibility status: `pending-published-template-version-policy`;
- preserved table-cell occurrence context for `metric-value-total-field` and
  `metric-value-risk-field`;
- blockers before Data Contract Validation Policy Gate: none.

This phase intentionally does not mutate package/document schema, implement
the full Variable Schema / Data Contract, implement Data Contract Validation
Policy, implement Required / Missing / Default Value Policy, implement Render
API Contract, implement backend production routes, claim production storage
durability, produce renderer artifact bytes, add auth/authz behavior, replace
`measureVNextText(...)`, claim full measurement production readiness, mutate
pagination, bind production renderer-backed measurement, add production
PDF/DOCX renderer work, implement production contenteditable, add
collaboration/offline behavior, or copy legacy editor runtime.

Next recommended work: Data Contract Validation Policy Gate.
Production measurement replacement remains blocked.

## Phase 212 Data Contract Validation Policy Gate

Data Contract Validation Policy Gate uses Variable Schema Metadata Shape Gate
as source of truth and defines JSON-safe data contract validation policy
vocabulary without implementing runtime data validation.

The policy evidence records:

- policy fixture:
  `fixtures/data-contract-validation-policy.v1.json`;
- source metadata shape:
  `repo://fixtures/variable-schema-metadata-shape.v1.json`;
- policy status: `accepted-vocabulary-only`;
- attachment target: `template-product-report-vnext@v1`;
- accepted validation evidence pointer:
  `repo://fixtures/template-publish-validation-evidence.v1.json`;
- source snapshot retention pointer:
  `repo://fixtures/product-report-vnext.flowdoc.json`;
- candidate variable ids: `customer.name`, `customer.segment`,
  `prepared.by`, `report.period`, `report.riskLevel`, and `report.total`;
- accepted validation result statuses: `valid`, `valid-with-warnings`, and
  `blocked`;
- validation vocabulary for type, required-field, missing-value,
  default-value, unsupported-value, unknown-variable, extra-variable, and
  table-cell value policy statuses;
- blocker vocabulary for invalid data contract payloads;
- preserved table-cell occurrence context for `metric-value-total-field` and
  `metric-value-risk-field`;
- Required / Missing / Default Value detailed behavior:
  deferred to Required / Missing / Default Value Policy Gate;
- Compatibility Policy With Published Template Versions: deferred;
- Render API Contract: deferred;
- blockers before Required / Missing / Default Value Policy Gate: none.

This phase intentionally does not mutate package/document schema, implement
runtime data validation, implement the full Variable Schema / Data Contract,
implement Required / Missing / Default Value behavior, implement
Compatibility Policy, implement Render API Contract, implement backend
production routes, claim production storage durability, produce renderer
artifact bytes, add auth/authz behavior, replace `measureVNextText(...)`,
claim full measurement production readiness, mutate pagination, bind
production renderer-backed measurement, add production PDF/DOCX renderer work,
implement production contenteditable, add collaboration/offline behavior, or
copy legacy editor runtime.

Next recommended work: Required / Missing / Default Value Policy Gate.
Production measurement replacement remains blocked.

## Phase 213 Required Missing Default Value Policy Gate

Required / Missing / Default Value Policy Gate uses Data Contract Validation
Policy Gate as source of truth and defines concrete JSON-safe policy metadata
for required, missing, and default-value behavior without implementing runtime
data validation.

The policy evidence records:

- policy fixture:
  `fixtures/required-missing-default-value-policy.v1.json`;
- source policy fixture:
  `repo://fixtures/data-contract-validation-policy.v1.json`;
- source policy status: `accepted-vocabulary-only`;
- required/missing/default policy status: `accepted-policy-metadata-only`;
- attachment target: `template-product-report-vnext@v1`;
- accepted validation evidence pointer:
  `repo://fixtures/template-publish-validation-evidence.v1.json`;
- source snapshot retention pointer:
  `repo://fixtures/product-report-vnext.flowdoc.json`;
- candidate variable ids: `customer.name`, `customer.segment`,
  `prepared.by`, `report.period`, `report.riskLevel`, and `report.total`;
- accepted validation result statuses: `valid`, `valid-with-warnings`, and
  `blocked`;
- required variables with no default metadata block if missing;
- required variables with default metadata and optional variables are
  `valid-with-warnings` if missing because defaults are metadata-only and are
  not applied at runtime;
- `report.total` blocks on `missing-required-value` because it is required and
  has no default metadata;
- extra variables are `valid-with-warnings` unless they conflict with known
  variable ids;
- preserved table-cell occurrence context for `metric-value-total-field` and
  `metric-value-risk-field`;
- table-cell context mismatch remains blocked;
- Compatibility Policy With Published Template Versions: deferred;
- Render API Contract: deferred;
- blockers before Compatibility Policy With Published Template Versions Gate:
  none.

This phase intentionally does not mutate package/document schema, implement
runtime data validation, apply defaults at runtime, implement the full
Variable Schema / Data Contract, implement Compatibility Policy With
Published Template Versions, implement Render API Contract, implement backend
production routes, claim production storage durability, produce renderer
artifact bytes, add auth/authz behavior, replace `measureVNextText(...)`,
claim full measurement production readiness, mutate pagination, bind
production renderer-backed measurement, add production PDF/DOCX renderer work,
implement production contenteditable, add collaboration/offline behavior, or
copy legacy editor runtime.

Next recommended work: Compatibility Policy With Published Template Versions
Gate.
Production measurement replacement remains blocked.

## Phase 214 Variable Compatibility Policy Gate

Compatibility Policy With Published Template Versions Gate uses Required /
Missing / Default Value Policy Gate as source of truth and defines JSON-safe
compatibility policy metadata between variable/data contract evidence and the
accepted published template version target.

The policy evidence records:

- policy fixture:
  `fixtures/variable-compatibility-policy.v1.json`;
- source required/missing/default policy fixture:
  `repo://fixtures/required-missing-default-value-policy.v1.json`;
- source policy status: `accepted-policy-metadata-only`;
- compatibility policy status: `accepted-policy-metadata-only`;
- attachment target: `template-product-report-vnext@v1`;
- accepted validation evidence pointer:
  `repo://fixtures/template-publish-validation-evidence.v1.json`;
- source snapshot retention pointer:
  `repo://fixtures/product-report-vnext.flowdoc.json`;
- candidate variable ids: `customer.name`, `customer.segment`,
  `prepared.by`, `report.period`, `report.riskLevel`, and `report.total`;
- compatibility statuses: `compatible`, `compatible-with-warnings`,
  `incompatible-blocked`, and `unknown`;
- compatibility dimensions for published template version identity, variable
  id stability, value type candidate stability, required/optional policy
  changes, default metadata changes, table-cell context changes, removed
  variables, added variables, and renamed/aliased variables;
- incompatible blocker vocabulary for known variable id changes, removed
  required variables, required variables added without default metadata, value
  type candidate changes, table-cell context changes, missing alias records,
  published template version mismatch, and schema mutation requirements;
- warning vocabulary for display-label-only changes, added optional
  variables, optional removals, default metadata changes, accepted alias
  records, accepted superseding-version records, and extra variables;
- preserved table-cell context blocker policy for `metric-value-total-field`
  and `metric-value-risk-field`;
- blockers before Variable Schema / Data Contract Close Audit: none.

This phase intentionally does not mutate package/document schema, implement
runtime data validation, apply defaults at runtime, implement runtime
compatibility enforcement, implement the full Variable Schema / Data Contract,
implement Render API Contract, implement backend production routes, claim
production storage durability, produce renderer artifact bytes, add auth/authz
behavior, replace `measureVNextText(...)`, claim full measurement production
readiness, mutate pagination, bind production renderer-backed measurement,
add production PDF/DOCX renderer work, implement production contenteditable,
add collaboration/offline behavior, or copy legacy editor runtime.

Next recommended work: Variable Schema / Data Contract Close Audit.
Production measurement replacement remains blocked.

## Phase 215 Variable Schema Data Contract Close Audit

Variable Schema / Data Contract Close Audit uses Compatibility Policy With
Published Template Versions Gate as source of truth and audits whether the
Variable Schema / Data Contract mini lane can close.

The audit confirms:

- close audit doc:
  `docs/VARIABLE_SCHEMA_DATA_CONTRACT_CLOSE_AUDIT.md`;
- compatibility policy fixture:
  `fixtures/variable-compatibility-policy.v1.json`;
- prior variable/data contract evidence chain:
  `fixtures/variable-reference-discovery.v1.json`,
  `fixtures/variable-schema-metadata-shape.v1.json`,
  `fixtures/data-contract-validation-policy.v1.json`,
  `fixtures/required-missing-default-value-policy.v1.json`, and
  `fixtures/variable-compatibility-policy.v1.json`;
- candidate variable ids: `customer.name`, `customer.segment`,
  `prepared.by`, `report.period`, `report.riskLevel`, and `report.total`;
- compatibility statuses: `compatible`, `compatible-with-warnings`,
  `incompatible-blocked`, and `unknown`;
- same published template version identity is compatible;
- published template version mismatch, known variable id change, value type
  candidate change, added required variable without default metadata, removed
  required variable, and table-cell context change are blocked unless accepted
  compatibility metadata says otherwise;
- display-label-only changes, added optional variables, added required
  variables with default metadata, and removed optional variables are warning
  compatible;
- Render API Contract remains deferred until this close audit accepts the
  variable/data contract mini lane;
- runtime data validation, runtime default application, and runtime
  compatibility enforcement remain deferred.

Decision: the Variable Schema / Data Contract mini lane can close for a mini
infrastructure checkpoint only. It does not claim runtime validation,
runtime default application, runtime compatibility enforcement, Render API
implementation, or production readiness.

This phase intentionally does not mutate package/document schema, implement
runtime data validation, apply defaults at runtime, implement runtime
compatibility enforcement, implement the full Variable Schema / Data Contract,
implement Render API Contract, implement backend production routes, claim
production storage durability, produce renderer artifact bytes, add auth/authz
behavior, replace `measureVNextText(...)`, claim full measurement production
readiness, mutate pagination, bind production renderer-backed measurement,
add production PDF/DOCX renderer work, implement production contenteditable,
add collaboration/offline behavior, or copy legacy editor runtime.

Next recommended work: Render API Contract Planning Gate.
Production measurement replacement remains blocked.

## Phase 216 Render API Contract Planning Gate

Render API Contract Planning Gate uses Variable Schema / Data Contract Close
Audit as source of truth and plans the Render API Contract lane before
implementation.

The planning gate confirms:

- planning doc: `docs/RENDER_API_CONTRACT_PLANNING_GATE.md`;
- Variable Schema / Data Contract Close Audit is complete;
- the Variable Schema / Data Contract mini lane can close for a mini
  infrastructure checkpoint only;
- accepted template version target:
  `template-product-report-vnext@v1`;
- accepted validation evidence pointer:
  `repo://fixtures/template-publish-validation-evidence.v1.json`;
- source snapshot retention pointer:
  `repo://fixtures/product-report-vnext.flowdoc.json`;
- variable/data evidence chain:
  `fixtures/variable-reference-discovery.v1.json`,
  `fixtures/variable-schema-metadata-shape.v1.json`,
  `fixtures/data-contract-validation-policy.v1.json`,
  `fixtures/required-missing-default-value-policy.v1.json`, and
  `fixtures/variable-compatibility-policy.v1.json`;
- candidate variable ids: `customer.name`, `customer.segment`,
  `prepared.by`, `report.period`, `report.riskLevel`, and `report.total`;
- runtime data validation, runtime default application, and runtime
  compatibility enforcement remain deferred.

Render API Contract sub-lanes are ranked:

1. Render API request envelope contract.
2. Render API response/status contract.
3. Render-readiness validation policy.
4. Artifact pointer / job status placeholder policy.
5. Error/blocker vocabulary.

Selected first sub-lane: Render API request envelope contract.

Reason: response/status, render-readiness validation, artifact pointer / job
status placeholders, and blocker vocabulary need a stable request envelope
that references published template version identity and variable/data payload
contract evidence.

This phase intentionally does not implement backend production routes, Render
API runtime, renderer artifact bytes, production storage durability,
auth/authz behavior, runtime data validation, runtime default application,
runtime compatibility enforcement, package/document schema mutation,
`measureVNextText(...)` replacement, full measurement production readiness,
pagination mutation, production renderer-backed measurement binding,
production PDF/DOCX renderer work, production contenteditable,
collaboration/offline behavior, or legacy editor runtime.

Next recommended work: Render API Request Envelope Contract Gate.
Production measurement replacement remains blocked.

## Phase 217 Render API Request Envelope Contract Gate

Render API Request Envelope Contract Gate uses Render API Contract Planning
Gate as source of truth and defines JSON-safe request envelope contract
metadata before response/status, readiness, artifact pointer, or job status
work.

The gate confirms:

- request envelope doc:
  `docs/RENDER_API_REQUEST_ENVELOPE_CONTRACT_GATE.md`;
- request envelope fixture:
  `fixtures/render-api-request-envelope-contract.v1.json`;
- Render API Contract Planning Gate is complete;
- selected sub-lane is Render API request envelope contract;
- accepted template version target:
  `template-product-report-vnext@v1`;
- request envelope id:
  `render-api-request-envelope-contract-v1`;
- request envelope version: `1`;
- source snapshot retention pointer:
  `repo://fixtures/product-report-vnext.flowdoc.json`;
- accepted validation evidence pointer:
  `repo://fixtures/template-publish-validation-evidence.v1.json`;
- variable/data evidence chain:
  `fixtures/variable-reference-discovery.v1.json`,
  `fixtures/variable-schema-metadata-shape.v1.json`,
  `fixtures/data-contract-validation-policy.v1.json`,
  `fixtures/required-missing-default-value-policy.v1.json`, and
  `fixtures/variable-compatibility-policy.v1.json`;
- candidate variable ids: `customer.name`, `customer.segment`,
  `prepared.by`, `report.period`, `report.riskLevel`, and `report.total`;
- variable payload container: `variables`;
- request envelope status vocabulary: `envelope-valid`,
  `envelope-valid-with-warnings`, and `envelope-blocked`;
- malformed envelope blocker vocabulary including
  `missing-template-version-identity`, `missing-variable-payload`,
  `invalid-variable-payload-shape`, `missing-variable-data-contract-evidence`,
  `variable-data-contract-context-mismatch`,
  `compatibility-policy-context-mismatch`, `invalid-client-request-id`,
  `duplicate-request-policy-missing`, and `schema-mutation-required`;
- response/status contract remains deferred until this request envelope is
  accepted;
- render-readiness validation policy and artifact pointer / job status
  placeholder policy remain deferred.

This phase intentionally does not implement backend production routes, Render
API runtime, renderer artifact bytes, production storage durability,
auth/authz behavior, runtime data validation, runtime default application,
runtime compatibility enforcement, package/document schema mutation,
`measureVNextText(...)` replacement, full measurement production readiness,
pagination mutation, production renderer-backed measurement binding,
production PDF/DOCX renderer work, production contenteditable,
collaboration/offline behavior, or legacy editor runtime.

Next recommended work: Render API Response / Status Contract Gate.
Production measurement replacement remains blocked.

## Phase 218 Render API Response Status Contract Gate

Render API Response / Status Contract Gate uses Render API Request Envelope
Contract Gate as source of truth and defines JSON-safe response/status
contract metadata before render-readiness, artifact lifecycle, job lifecycle,
backend route, storage, auth/authz, or renderer execution work.

The gate confirms:

- response/status doc:
  `docs/RENDER_API_RESPONSE_STATUS_CONTRACT_GATE.md`;
- response/status fixture:
  `fixtures/render-api-response-status-contract.v1.json`;
- request envelope fixture:
  `fixtures/render-api-request-envelope-contract.v1.json`;
- request envelope id:
  `render-api-request-envelope-contract-v1`;
- request envelope version: `1`;
- response contract id:
  `render-api-response-status-contract-v1`;
- accepted template version target:
  `template-product-report-vnext@v1`;
- variable payload container: `variables`;
- variable payload container shape: `json-object-keyed-by-variable-id`;
- required variable ids: `customer.name`, `report.period`,
  `report.riskLevel`, and `report.total`;
- optional variable ids: `customer.segment` and `prepared.by`;
- table-cell-bound variable ids: `report.riskLevel` and `report.total`;
- request envelope status vocabulary: `envelope-valid`,
  `envelope-valid-with-warnings`, and `envelope-blocked`;
- response status vocabulary: `accepted`, `accepted-with-warnings`,
  `blocked`, `deferred-job-placeholder`, and `unknown`;
- `envelope-valid` maps to `accepted`;
- `envelope-valid-with-warnings` maps to `accepted-with-warnings`;
- `envelope-blocked` maps to `blocked`;
- accepted, warning, and blocked response shapes are metadata-only;
- render job status is placeholder metadata only;
- artifact pointer is placeholder metadata only;
- render-readiness validation policy remains deferred until this response
  contract is accepted;
- artifact pointer / job status lifecycle remains deferred beyond placeholder
  metadata.

This phase intentionally does not implement backend production routes, Render
API runtime, renderer artifact bytes, actual render execution, production
storage durability, auth/authz behavior, runtime data validation, runtime
default application, runtime compatibility enforcement, package/document
schema mutation, `measureVNextText(...)` replacement, full measurement
production readiness, pagination mutation, production renderer-backed
measurement binding, production PDF/DOCX renderer work, production
contenteditable, collaboration/offline behavior, or legacy editor runtime.

Next recommended work: Render-Readiness Validation Policy Gate.
Production measurement replacement remains blocked.

## Phase 219 Render Readiness Validation Policy Gate

Render-Readiness Validation Policy Gate uses Render API Response / Status
Contract Gate as source of truth and defines JSON-safe render-readiness
validation policy metadata before artifact pointer lifecycle, job status
lifecycle, backend route, storage, auth/authz, or renderer execution work.

The gate confirms:

- readiness policy doc:
  `docs/RENDER_READINESS_VALIDATION_POLICY_GATE.md`;
- readiness policy fixture:
  `fixtures/render-readiness-validation-policy.v1.json`;
- response/status fixture:
  `fixtures/render-api-response-status-contract.v1.json`;
- request envelope fixture:
  `fixtures/render-api-request-envelope-contract.v1.json`;
- request envelope id:
  `render-api-request-envelope-contract-v1`;
- request envelope version: `1`;
- response contract id:
  `render-api-response-status-contract-v1`;
- readiness policy id:
  `render-readiness-validation-policy-v1`;
- response status vocabulary: `accepted`, `accepted-with-warnings`,
  `blocked`, `deferred-job-placeholder`, and `unknown`;
- readiness status vocabulary: `render-ready`,
  `render-ready-with-warnings`, `render-blocked`, `readiness-deferred`, and
  `unknown`;
- response readiness mapping from `accepted` to `render-ready`,
  `accepted-with-warnings` to `render-ready-with-warnings`, `blocked` to
  `render-blocked`, `deferred-job-placeholder` to `readiness-deferred`, and
  `unknown` to `unknown`;
- job status placeholder remains `deferred-job-placeholder`;
- job id placeholder remains `null`;
- artifact pointer remains `null`;
- artifact bytes are not produced;
- required evidence checks are defined as metadata;
- runtime data validation, runtime default application, runtime compatibility
  enforcement, backend route availability, storage durability, auth/authz,
  renderer execution, and artifact byte production remain deferred;
- artifact pointer / job status lifecycle remains deferred beyond placeholder
  metadata.

This phase intentionally does not implement backend production routes, Render
API runtime, renderer artifact bytes, actual render execution, production
storage durability, auth/authz behavior, runtime data validation, runtime
default application, runtime compatibility enforcement, package/document
schema mutation, `measureVNextText(...)` replacement, full measurement
production readiness, pagination mutation, production renderer-backed
measurement binding, production PDF/DOCX renderer work, production
contenteditable, collaboration/offline behavior, or legacy editor runtime.

Next recommended work: Artifact Pointer / Job Status Placeholder Policy Gate.
Production measurement replacement remains blocked.

## Phase 220 Artifact Pointer Job Status Placeholder Policy Gate

Artifact Pointer / Job Status Placeholder Policy Gate uses Render-Readiness
Validation Policy Gate as source of truth and defines JSON-safe artifact
pointer / job status placeholder policy metadata before backend route,
storage, auth/authz, renderer execution, artifact lifecycle, durable job
lifecycle, or Render API runtime work.

The gate confirms:

- artifact/job placeholder policy doc:
  `docs/ARTIFACT_POINTER_JOB_STATUS_PLACEHOLDER_POLICY_GATE.md`;
- artifact/job placeholder policy fixture:
  `fixtures/artifact-pointer-job-status-placeholder-policy.v1.json`;
- readiness policy fixture:
  `fixtures/render-readiness-validation-policy.v1.json`;
- response/status fixture:
  `fixtures/render-api-response-status-contract.v1.json`;
- request envelope fixture:
  `fixtures/render-api-request-envelope-contract.v1.json`;
- request envelope id:
  `render-api-request-envelope-contract-v1`;
- request envelope version: `1`;
- response contract id:
  `render-api-response-status-contract-v1`;
- readiness policy id:
  `render-readiness-validation-policy-v1`;
- artifact/job placeholder policy id:
  `artifact-pointer-job-status-placeholder-policy-v1`;
- accepted template version target:
  `template-product-report-vnext@v1`;
- job status placeholder vocabulary: `job-placeholder-deferred`,
  `job-not-created`, `job-blocked-before-creation`, and `job-unknown`;
- artifact pointer placeholder vocabulary: `artifact-pointer-null`,
  `artifact-not-produced`, `artifact-blocked-before-production`, and
  `artifact-unknown`;
- job id placeholder remains `null`;
- artifact pointer remains `null`;
- artifact retention pointer remains `null`;
- artifact bytes are not produced;
- storage durability remains not claimed;
- renderer execution remains not implemented;
- backend routes, Render API runtime, durable job lifecycle, storage,
  auth/authz, renderer execution, artifact byte production, runtime data
  validation, runtime default application, and runtime compatibility
  enforcement remain deferred.

This phase intentionally does not implement backend production routes, Render
API runtime, renderer artifact bytes, actual render execution, durable job
ids, durable job lifecycle, production storage durability, auth/authz
behavior, runtime data validation, runtime default application, runtime
compatibility enforcement, package/document schema mutation,
`measureVNextText(...)` replacement, full measurement production readiness,
pagination mutation, production renderer-backed measurement binding,
production PDF/DOCX renderer work, production contenteditable,
collaboration/offline behavior, or legacy editor runtime.

Next recommended work: Render API Error / Blocker Vocabulary Gate.
Production measurement replacement remains blocked.

## Phase 221 Render API Error Blocker Vocabulary Gate

Render API Error / Blocker Vocabulary Gate uses Artifact Pointer / Job Status
Placeholder Policy Gate as source of truth and defines JSON-safe Render API
error/blocker vocabulary metadata before Render API Contract Close Audit.

The gate confirms:

- error/blocker vocabulary doc:
  `docs/RENDER_API_ERROR_BLOCKER_VOCABULARY_GATE.md`;
- error/blocker vocabulary fixture:
  `fixtures/render-api-error-blocker-vocabulary.v1.json`;
- artifact/job placeholder policy fixture:
  `fixtures/artifact-pointer-job-status-placeholder-policy.v1.json`;
- readiness policy fixture:
  `fixtures/render-readiness-validation-policy.v1.json`;
- response/status fixture:
  `fixtures/render-api-response-status-contract.v1.json`;
- request envelope fixture:
  `fixtures/render-api-request-envelope-contract.v1.json`;
- request envelope id:
  `render-api-request-envelope-contract-v1`;
- request envelope version: `1`;
- response contract id:
  `render-api-response-status-contract-v1`;
- readiness policy id:
  `render-readiness-validation-policy-v1`;
- artifact/job placeholder policy id:
  `artifact-pointer-job-status-placeholder-policy-v1`;
- error/blocker vocabulary id:
  `render-api-error-blocker-vocabulary-v1`;
- accepted template version target:
  `template-product-report-vnext@v1`;
- severity vocabulary: `warning`, `blocked`, `deferred`, and `unknown`;
- malformed request envelope blockers are preserved;
- response/status blocked summary shape is preserved;
- readiness blockers and warnings are preserved;
- artifact/job placeholder blockers and warnings are preserved;
- vocabulary is grouped by request-envelope, response-status,
  render-readiness, artifact-job-placeholder, deferred-backend-route,
  deferred-storage, deferred-auth-authz, deferred-renderer-execution,
  deferred-runtime-validation, and schema-mutation boundaries;
- every boundary group records `runtimeImplemented=false` and
  `productionReadinessClaimed=false`;
- the JSON-safe error summary shape is metadata-only.

This phase intentionally does not implement runtime error handling, backend
production routes, Render API runtime, renderer artifact bytes, actual render
execution, durable job ids, durable job lifecycle, production storage
durability, auth/authz behavior, runtime data validation, runtime default
application, runtime compatibility enforcement, package/document schema
mutation, `measureVNextText(...)` replacement, full measurement production
readiness, pagination mutation, production renderer-backed measurement
binding, production PDF/DOCX renderer work, production contenteditable,
collaboration/offline behavior, or legacy editor runtime.

Next recommended work: Render API Contract Close Audit.
Production measurement replacement remains blocked.

## Phase 222 Render API Contract Close Audit

Render API Contract Close Audit uses Render API Error / Blocker Vocabulary
Gate as source of truth and audits whether the Render API Contract mini lane
can close for a mini infrastructure checkpoint only.

The audit confirms:

- close audit doc:
  `docs/RENDER_API_CONTRACT_CLOSE_AUDIT.md`;
- Render API Contract Planning Gate doc exists;
- Render API Request Envelope Contract Gate doc and fixture exist;
- Render API Response / Status Contract Gate doc and fixture exist;
- Render-Readiness Validation Policy Gate doc and fixture exist;
- Artifact Pointer / Job Status Placeholder Policy Gate doc and fixture exist;
- Render API Error / Blocker Vocabulary Gate doc and fixture exist;
- accepted template version target:
  `template-product-report-vnext@v1`;
- request envelope id:
  `render-api-request-envelope-contract-v1`;
- request envelope version: `1`;
- response contract id:
  `render-api-response-status-contract-v1`;
- readiness policy id:
  `render-readiness-validation-policy-v1`;
- artifact/job placeholder policy id:
  `artifact-pointer-job-status-placeholder-policy-v1`;
- error/blocker vocabulary id:
  `render-api-error-blocker-vocabulary-v1`;
- Template Publish mini lane is closed for a mini infrastructure checkpoint
  only;
- Variable Schema / Data Contract mini lane is closed for a mini
  infrastructure checkpoint only;
- Measurement remains mini-checkpoint-only and full v1 measurement production
  readiness remains blocked.

The audit closes the Render API Contract mini lane for a mini infrastructure
checkpoint only. It does not claim backend route readiness, Render API runtime
readiness, renderer execution readiness, artifact byte production, durable job
lifecycle, production storage durability, auth/authz readiness, runtime data
validation, runtime default application, runtime compatibility enforcement,
runtime error handling, package/document schema mutation, or full measurement
production readiness.

Next recommended work: Mini Infrastructure Close Audit.
Production measurement replacement remains blocked.

## Phase 223 Mini Infrastructure Close Audit

Mini Infrastructure Close Audit uses Render API Contract Close Audit as source
of truth and audits whether the combined mini infrastructure checkpoint can
close after four mini lanes have close-audit decisions.

The audit confirms:

- close audit doc:
  `docs/MINI_INFRASTRUCTURE_CLOSE_AUDIT.md`;
- Measurement Hardening Close Audit is complete for mini checkpoint scope;
- Template Publish Close Audit is complete for mini checkpoint scope;
- Variable Schema / Data Contract Close Audit is complete for mini checkpoint
  scope;
- Render API Contract Close Audit is complete for mini checkpoint scope;
- accepted template version target:
  `template-product-report-vnext@v1`;
- accepted measurement manifest status is `accepted`;
- accepted measurement manifest scope is `minimal-accepted-subset-only`;
- full v1 measurement matrix remains `partial-not-accepted`;
- production binding and default-measurer replacement remain blocked;
- accepted template version metadata status is `accepted`;
- variable compatibility policy status is
  `accepted-policy-metadata-only`;
- Render API error/blocker vocabulary status is
  `accepted-vocabulary-metadata-only`;
- every Render API boundary group records `runtimeImplemented=false` and
  `productionReadinessClaimed=false`.

Decision: close the mini infrastructure checkpoint. This close is strong
enough to plan runtime binding from stable metadata, but it does not claim
production readiness.

This phase intentionally does not implement runtime binding, backend
production routes, Render API runtime, renderer artifact bytes, actual render
execution, durable job ids, durable job lifecycle, production storage
durability, auth/authz behavior, runtime error handling, runtime data
validation, runtime default application, runtime compatibility enforcement,
package/document schema mutation, `measureVNextText(...)` replacement, full
measurement production readiness, pagination mutation, production
renderer-backed measurement binding, production PDF/DOCX renderer work,
production contenteditable, collaboration/offline behavior, or legacy editor
runtime.

Next recommended work: Runtime Binding / Implementation Planning Gate.
Production measurement replacement remains blocked.

## Phase 224 Runtime Binding Implementation Planning Gate

Runtime Binding / Implementation Planning Gate uses Mini Infrastructure Close
Audit as source of truth and converts the closed mini infrastructure
checkpoint into a next-thread implementation handoff.

The gate confirms:

- planning gate doc:
  `docs/RUNTIME_BINDING_IMPLEMENTATION_PLANNING_GATE.md`;
- Mini Infrastructure Close Audit is complete;
- accepted template version target:
  `template-product-report-vnext@v1`;
- request envelope id:
  `render-api-request-envelope-contract-v1`;
- request envelope version: `1`;
- source snapshot retention pointer:
  `repo://fixtures/product-report-vnext.flowdoc.json`;
- validation evidence pointer:
  `repo://fixtures/template-publish-validation-evidence.v1.json`;
- variable/data contract evidence pointers are present;
- request envelope validation status vocabulary is `envelope-valid`,
  `envelope-valid-with-warnings`, and `envelope-blocked`;
- malformed-envelope blocker vocabulary is accepted.

The gate ranks runtime binding lanes and selects Render API Request Envelope
Runtime Binding Gate as the first implementation lane. The handoff plan tells
the next thread to start from
`docs/RUNTIME_BINDING_IMPLEMENTATION_PLANNING_GATE.md`, read the accepted
request envelope contract and fixtures, and implement only a package-local/core
request envelope metadata validator.

This phase intentionally does not implement runtime binding, backend
production routes, Render API runtime, response/status runtime mapping,
render-readiness runtime evaluation, renderer artifact bytes, actual render
execution, durable job ids, durable job lifecycle, production storage
durability, auth/authz behavior, runtime error handling, runtime data
validation, runtime default application, runtime compatibility enforcement,
package/document schema mutation, `measureVNextText(...)` replacement, full
measurement production readiness, pagination mutation, production
renderer-backed measurement binding, production PDF/DOCX renderer work,
production contenteditable, collaboration/offline behavior, or legacy editor
runtime.

Next recommended work: Render API Request Envelope Runtime Binding Gate.
Production measurement replacement remains blocked.

## Phase 225 Core Retention Map

Core Retention Map uses the Core Service Concern Audit and the backend P1
service split as evidence, then locks a move-and-retain rule before any
service-shaped export is removed from `@flowdoc/vnext-core`.

The map confirms:

- backend owns transport, durable persistence, concrete storage, route
  execution, artifact byte lifecycle, worker/queue execution, auth/authz,
  workflow runtime, and product/service policy;
- core retains package/schema semantics, graph facts, operation rules,
  readiness calculations, storage envelope evaluation, artifact manifest/job
  validation, authoring semantics, renderer-consumption contracts, and
  history-ready records;
- route-shaped modules and session/rich-inline/workflow persistence builders
  are temporary split-before-move areas, not immediate deletion targets;
- concrete storage and internal-alpha runner behavior has backend migration
  evidence but remains duplicated in core only until consumer rewiring and
  de-export preconditions are proven;
- guard tests scan exported `src/**` for concrete backend package imports and
  server IO so core does not grow service execution again.

This phase intentionally does not move source modules, remove public exports,
change backend/editor consumers, implement a gateway, add production storage,
run artifact rendering, or claim route parity.

Next recommended work: backend route parity for `src/generation/apiRoute.ts`
and `src/generation/artifactApiRoute.ts`, then a controlled de-export plan.

## Phase 226 Core Service Consumer Map

Core Service Consumer Map uses the Core Retention Map and narrow cross-repo
consumer searches as evidence, then separates each service-shaped area into
current consumer groups before route parity or de-export work starts.

The map confirms:

- route-shaped generation and artifact API helpers are still core-exported and
  core-tested, while backend has no import of those response helpers yet;
- backend P1 now owns concrete file JSON storage, storage route binding, and
  artifact job storage execution, but this is migration evidence rather than a
  reason to delete retained core contracts;
- backend runtime consumes retained core storage/job/manifest contracts through
  package-level `@flowdoc/vnext-core` imports;
- backend tests still used `createVNextSessionStorageRecord(...)` as storage
  route binding fixture setup in this historical phase; Phase 236 records the
  later backend-owned session record replacement;
- editor currently keeps `@flowdoc/vnext-core` behind `src/core/coreAdapter.ts`
  and has no direct service-shaped export consumer;
- retained contracts in `src/generation/runtime.ts`,
  `src/generation/artifactManifest.ts`, `src/generation/artifactJob.ts`, and
  `src/persistence/storageAdapter.ts` remain core-owned or split-contract
  truth, not backend service execution.

This phase intentionally does not move source modules, remove public exports,
change backend/editor consumers, implement backend route parity, introduce a
gateway, add production storage, run artifact rendering, or claim route parity.

Next recommended work: implement backend route parity for
`src/generation/apiRoute.ts` and `src/generation/artifactApiRoute.ts`.

## Phase 227 Backend Route Parity Evidence

Backend Route Parity Evidence updates the Core Service Consumer Map after
`flowdoc-vnext-backend` branch `codex/backend-route-parity` commit `2ae6570`
added backend-owned generation and artifact route parity contracts.

The evidence confirms:

- backend now has `flowdoc-vnext-backend/src/routes/generationRoute.ts` with
  `createFlowDocBackendGenerationRouteResponse(...)`;
- backend now has `flowdoc-vnext-backend/src/routes/artifactRoute.ts` with
  artifact request, status, session-list, and download-metadata route response
  helpers;
- backend route parity calls retained core contracts through package-level
  `@flowdoc/vnext-core` imports, including
  `assessVNextGenerationReadiness(...)` and
  `createVNextArtifactManifestPlan(...)`;
- backend route parity does not import the old core route helpers
  `createVNextGenerationApiRouteResponse(...)` or
  `createVNextArtifactGenerationApiRouteResponse(...)`;
- core still exports `src/generation/apiRoute.ts` and
  `src/generation/artifactApiRoute.ts`, so immediate removal remains blocked
  until the public compatibility/deprecation window and historical test rewrite
  are planned.

This phase intentionally does not move source modules, remove public exports,
add deprecation markers, change backend/editor consumers, wire the backend
routes into the concrete HTTP server, introduce a gateway, add production
storage, run artifact rendering, or claim production route readiness.

Next recommended work: draft the controlled de-export/deprecation window for
core generation and artifact route-shaped exports.

## Phase 228 Core Route De-export Plan

Core Route De-export Plan uses Backend Route Parity Evidence as source of truth
and selects a controlled de-export/deprecation window for the route-shaped core
exports in `src/generation/apiRoute.ts` and
`src/generation/artifactApiRoute.ts`.

The plan confirms:

- backend route parity exists at `flowdoc-vnext-backend@2ae6570`;
- core still exports `./generation/apiRoute.js` and
  `./generation/artifactApiRoute.js` from `src/index.ts`;
- at Phase 228 time, core route-helper tests still asserted HTTP-shaped route behavior in
  `tests/generationApiRoute.test.ts` and `tests/artifactApiRoute.test.ts`;
- the selected path is one compatibility window: publish plan, add deprecation
  markers in the next patch, then remove exports after retained-contract tests
  replace route-helper assertions;
- retained core coverage must move to `assessVNextGenerationReadiness(...)`,
  `safeParseVNextGenerationRequest(...)`,
  `createVNextArtifactManifestPlan(...)`,
  `createVNextArtifactJobPlan(...)`, and
  `advanceVNextArtifactJob(...)`;
- backend route status/header/permission behavior must not move back into
  retained core contracts.

This phase intentionally does not move source modules, remove public exports,
add deprecation markers, change backend/editor consumers, wire backend routes
into the concrete HTTP server, introduce a gateway, add production storage, run
artifact rendering, or claim production route readiness.

Next recommended work: add explicit deprecation markers to core route-shaped
helpers and route-helper tests for one compatibility window.

## Phase 229 Core Route Deprecation Window

Core Route Deprecation Window executes Window B from the Core Route De-export
Plan by applying explicit Window B compatibility marker text to route-shaped
core helpers while keeping public exports stable.

The marker phase confirms:

- `src/generation/apiRoute.ts` marks generation route constants and
  `createVNextGenerationApiRouteResponse(...)` as deprecated Window B
  compatibility exports;
- `src/generation/artifactApiRoute.ts` marks artifact route constants and
  artifact request/status/list/download-metadata helpers as deprecated Window B
  compatibility exports;
- `tests/generationApiRoute.test.ts` and `tests/artifactApiRoute.test.ts`
  identified their route-helper assertions as Window B compatibility coverage
  before Phase 230 replaced them with retained-contract tests;
- `src/index.ts` still exports `./generation/apiRoute.js` and
  `./generation/artifactApiRoute.js`;
- retained core owners remain `src/generation/runtime.ts`,
  `src/generation/artifactManifest.ts`, `src/generation/artifactJob.ts`, and
  `src/persistence/storageAdapter.ts`.

This phase intentionally does not remove public exports, change route helper
runtime behavior, change backend/editor consumers, wire backend routes into the
concrete HTTP server, introduce a gateway, add production storage, run artifact
rendering, or claim production route readiness.

Next recommended work: remove route-shaped exports from public core in Window
C now that retained-contract tests replace route-helper ownership assertions.

## Phase 230 Core Route Retained-Contract Test Rewrite

Core Route Retained-Contract Test Rewrite completes the test-rewrite blocker
from the Core Route De-export Plan without removing public route exports.

The rewrite confirms:

- `tests/generationApiRoute.test.ts` and `tests/artifactApiRoute.test.ts` are
  replaced by retained-contract tests;
- `tests/generationRuntimeRetainedContract.test.ts` covers
  `safeParseVNextGenerationRequest(...)` and
  `assessVNextGenerationReadiness(...)` directly;
- `tests/artifactRetainedContract.test.ts` covers
  `createVNextArtifactManifestPlan(...)`, `createVNextArtifactJobPlan(...)`,
  and `advanceVNextArtifactJob(...)` directly;
- `tests/coreRouteRetainedContractRewrite.test.ts` guards that the old
  route-helper tests are gone before Window C removes
  `./generation/apiRoute.js` and `./generation/artifactApiRoute.js` from
  `src/index.ts`;
- backend-owned HTTP status/header/method/permission/download behavior remains
  out of retained core tests.

This phase intentionally does not remove public exports, change route helper
runtime behavior, change backend/editor consumers, wire backend routes into the
concrete HTTP server, introduce a gateway, add production storage, run artifact
rendering, or claim production route readiness.

Next recommended work: execute Window C by removing route-shaped public exports
from `src/index.ts` and updating route/history docs in the same patch.

## Phase 231 Core Route Window C Public Export Removal

Core Route Window C Public Export Removal completes the controlled route
de-export lane by removing route-shaped generation and artifact modules from
the public core entrypoint.

The removal confirms:

- `src/index.ts` no longer exports `./generation/apiRoute.js` or
  `./generation/artifactApiRoute.js`;
- retained core exports remain available for `./generation/runtime.js`,
  `./generation/artifactManifest.js`, and `./generation/artifactJob.js`;
- route helper source files still exist with deprecation markers as
  historical/internal code only;
- backend route parity remains the owner of HTTP status/header/method,
  permission, retry, and download metadata behavior;
- `tests/coreRouteWindowCPublicExportRemoval.test.ts` guards Window C status
  across source, docs, README, and the phase ledger.

This phase intentionally does not delete `src/generation/apiRoute.ts` or
`src/generation/artifactApiRoute.ts`, change backend/editor consumers, wire
backend routes into the concrete HTTP server, introduce a gateway, add
production storage, run artifact rendering, or claim production route
readiness.

Next recommended work: continue the service split with session package
snapshot, rich-inline replay validation, and submission identity facts, or
clean up deprecated route source files if historical evidence is no longer
needed.

## Phase 232 Core Session Rich Workflow Split Map

Core Session Rich Workflow Split Map separates the next three service-shaped
core areas before implementation or public de-export.

The map confirms:

- session storage currently exports `createVNextSessionStorageRecord(...)`,
  keeps canonical package snapshot and persisted-state exclusion facts in core,
  and leaves durable storage, storage keys, idempotency, and routes to backend;
- rich-inline session persistence currently exports
  `createVNextRichInlineSessionPersistenceRecord(...)` and
  `createVNextRichInlineReplayPatchRecord(...)`, retains replay-patch
  validation and history-ready facts in core, and leaves storage writes,
  backend APIs, replay execution, conflict resolution, and selection
  restoration to backend/product runtime;
- submission state currently exports `createVNextSubmissionStateRecord(...)`,
  retains template/submission/revision/actor/reviewer identity and validation
  facts in core only if needed, and leaves workflow engine, permissions,
  approval gates, route dispatch, and storage writes to backend;
- `src/index.ts` still exports `./authoring/sessionStorage.js`,
  `./authoring/richInlineSessionPersistence.js`, and
  `./workflow/submissionState.js` until retained names and backend replacement
  contracts are implemented;
- `tests/coreSessionRichWorkflowSplitMap.test.ts` guards the map, current
  public exports, source markers, and repo navigation.

This phase intentionally does not rename or move source modules, remove public
exports, change backend/editor consumers, add storage/workflow routes, execute
rich-inline replay, introduce a gateway, or claim production persistence
readiness.

Next recommended work: implement the first split by extracting/renaming
session package snapshot facts away from storage-shaped session record wording.

## Phase 233 Core Session Package Snapshot Split

Core Session Package Snapshot Split implements the first split from
`docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md` by adding a retained package
snapshot helper while preserving the existing storage-shaped compatibility
record.

The split confirms:

- `src/authoring/sessionStorage.ts` now exports
  `createVNextSessionPackageSnapshot(...)` plus package snapshot source/mode
  constants and retained fact types;
- the retained helper serializes the canonical package v2/document v3 snapshot
  and keeps package id/version, document version, document revision,
  dirty-scope count, and persisted-state exclusion facts;
- `createVNextSessionStorageRecord(...)` remains public and composes the
  retained helper before adding `storageKey`, `reason`, and
  `storageStatus: "not-written"` compatibility manifest fields;
- `tests/sessionPackageSnapshot.test.ts` proves the retained helper is
  independent from storage writes, routes, DOM, and layout while the storage
  record output remains compatible;
- `tests/coreSessionPackageSnapshotSplit.test.ts` guards README, ledger,
  split-map, storage-boundary, retention-map, and consumer-map navigation.

This phase intentionally does not remove public exports, rename
`src/authoring/sessionStorage.ts`, add backend storage routes, change backend
or editor consumers, introduce a gateway, run rich-inline replay, or claim
production persistence readiness.

Next recommended work: rich-inline replay-patch validation split is completed
in Phase 234; continue with submission identity/status facts.

## Phase 234 Core Rich Inline Replay Validation Split

Core Rich Inline Replay Validation Split implements the second split from
`docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md` by adding retained rich-inline
replay validation helpers while preserving the existing persistence-shaped
compatibility records.

The split confirms:

- `src/authoring/richInlineSessionPersistence.ts` now exports
  `createVNextRichInlineReplayPatchValidation(...)`,
  `createVNextRichInlineReplayValidation(...)`, replay validation source/mode
  constants, and retained validation fact types;
- retained patch validation clones before/after inline children, validates
  inline schema, reports duplicate ids and unsupported child kinds, records
  field-ref usage, and carries history sequence/group/summary facts when
  supplied;
- retained batch validation reports history-ready record count, rich history
  record count, replay patch count, invalid replay patch count, field keys,
  and explicit no-storage/no-route/no-backend/no-replay-execution contracts;
- `createVNextRichInlineReplayPatchRecord(...)` remains public and composes the
  retained patch validation before adding `replayStatus: "not-run"` and
  `storageStatus: "not-written"` compatibility fields;
- `createVNextRichInlineSessionPersistenceRecord(...)` remains public and
  composes retained replay validation facts before adding compatibility
  package/history/session persistence fields;
- `tests/richInlineReplayValidation.test.ts` proves retained validation,
  invalid patch reporting, compatibility composition, and source independence.

This phase intentionally does not remove public exports, rename
`src/authoring/richInlineSessionPersistence.ts`, add backend storage routes,
change backend or editor consumers, introduce a gateway, run replay execution,
resolve conflicts, restore selection, or claim production persistence
readiness.

Next recommended work: submission identity/status split is completed in Phase
235; continue with backend consumer rewiring and non-route service-shaped
de-export windows.

## Phase 235 Core Submission Identity Status Split

Core Submission Identity Status Split implements the third split from
`docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md` by adding a retained submission
identity/status helper while preserving the existing workflow-shaped
compatibility record.

The split confirms:

- `src/workflow/submissionState.ts` now exports
  `createVNextSubmissionIdentityStatus(...)`, identity/status source/mode
  constants, and retained fact types;
- retained identity/status facts carry template id, submission id, document
  revision, data revision, actor id, reviewer id, reason, workflow status, and
  validation issues;
- retained contracts explicitly keep package mutation, document mutation, data
  mutation, editor-session state, workflow engine execution, permissions,
  approval gates, storage writes, route dispatch, and notification/audit
  execution out of core;
- `createVNextSubmissionStateRecord(...)` remains public and composes retained
  identity/status facts before adding Phase 91 scope/application compatibility
  fields;
- `tests/submissionIdentityStatus.test.ts` proves retained facts, invalid
  review-state blockers, compatibility composition, and source independence.

This phase intentionally does not remove public exports, rename
`src/workflow/submissionState.ts`, add backend workflow routes, change backend
or editor consumers, introduce a gateway, execute permissions, apply approval
gates, write workflow storage, dispatch routes, or claim production workflow
readiness.

Next recommended work: backend consumer rewiring is recorded in Phase 236;
start Window NR-A deprecation markers for the remaining non-route
service-shaped public exports.

## Phase 236 Core Backend Consumer Rewire Closeout

Core Backend Consumer Rewire Closeout records the backend evidence after
`flowdoc-vnext-backend` `main@9d0a850` stopped consuming the remaining
non-route service-shaped core helpers as backend fixture/route contracts.

The closeout confirms:

- backend `src/storage/sessionRecord.ts` creates backend-owned session storage
  records from retained `createVNextSessionPackageSnapshot(...)` facts;
- backend `src/storage/richInlineSessionRecord.ts` creates backend-owned
  rich-inline session records from retained
  `createVNextRichInlineReplayValidation(...)` facts;
- backend `src/routes/submissionRoute.ts` creates backend-owned submission
  route responses from retained `createVNextSubmissionIdentityStatus(...)`
  facts;
- backend storage route binding accepts backend-owned session records rather
  than core `VNextSessionStorageRecord` values;
- backend tests assert the replacement paths do not import
  `createVNextSessionStorageRecord(...)`,
  `createVNextRichInlineSessionPersistenceRecord(...)`, or
  `createVNextSubmissionStateRecord(...)`;
- `docs/CORE_SERVICE_CONSUMER_MAP.md`, `docs/CORE_RETENTION_MAP.md`, and
  `docs/CORE_SESSION_RICH_WORKFLOW_SPLIT_MAP.md` now treat backend consumer
  rewiring as proven evidence, not future work.

This phase intentionally does not remove public exports, rename source modules,
rewrite all historical compatibility tests, touch backend/frontend code, add a
gateway, run rich-inline replay execution, or implement production submission
workflow storage.

Next recommended work: Window NR-A is complete in Phase 237; Window NR-B should
rewrite historical tests toward retained contracts; Window NR-C should narrow
`src/index.ts` to retained helper exports.

## Phase 237 Core Non-Route Deprecation Window

Core Non-Route Deprecation Window starts Window NR-A from
`docs/CORE_BACKEND_CONSUMER_REWIRE_CLOSEOUT.md` by marking the remaining
non-route service-shaped helper names as deprecated compatibility exports while
keeping public entrypoint compatibility stable.

The window confirms:

- `createVNextSessionStorageRecord(...)` is source-marked with
  `@deprecated Window NR-A compatibility export` and points to backend
  `src/storage/sessionRecord.ts` plus retained
  `createVNextSessionPackageSnapshot(...)` facts;
- `createVNextRichInlineSessionPersistenceRecord(...)` is source-marked with
  `@deprecated Window NR-A compatibility export` and points to backend
  `src/storage/richInlineSessionRecord.ts` plus retained
  `createVNextRichInlineReplayValidation(...)` facts;
- `createVNextSubmissionStateRecord(...)` is source-marked with
  `@deprecated Window NR-A compatibility export` and points to backend
  `src/routes/submissionRoute.ts` plus retained
  `createVNextSubmissionIdentityStatus(...)` facts;
- `src/index.ts` still exports `./authoring/sessionStorage.js`,
  `./authoring/richInlineSessionPersistence.js`, and
  `./workflow/submissionState.js` for compatibility;
- `docs/CORE_NON_ROUTE_DEPRECATION_WINDOW.md`, README, and map docs record
  that Window NR-B/NR-C remain.

This phase intentionally does not remove public exports, rewrite historical
compatibility tests, change helper runtime behavior, touch backend/frontend
code, add a gateway, run rich-inline replay execution, or implement production
submission workflow storage.

Next recommended work: Window NR-B should rewrite core historical tests so
retained-contract tests prove core facts and backend tests prove backend-owned
records/routes.

## Phase 238 Core Non-Route Retained-Test Rewrite

Core Non-Route Retained-Test Rewrite starts Window NR-B by moving the first
historical session, rich-inline, and submission boundary tests away from
service-shaped compatibility helper ownership and onto retained core facts.

The window confirms:

- `tests/sessionStorage.test.ts` now uses
  `createVNextSessionPackageSnapshot(...)` to prove package snapshot facts,
  persisted-state exclusions, and no storage/route/backend ownership;
- `tests/richInlineSessionPersistence.test.ts` now uses
  `createVNextRichInlineReplayValidation(...)` to prove rich-inline replay
  validation facts, history-ready counts, invalid replay-patch reporting, and
  no storage/replay/backend ownership;
- `tests/submissionState.test.ts` now uses
  `createVNextSubmissionIdentityStatus(...)` to prove submission
  identity/status facts, validation blockers, and no workflow/route/storage
  ownership;
- those three historical tests no longer import
  `createVNextSessionStorageRecord(...)`,
  `createVNextRichInlineSessionPersistenceRecord(...)`, or
  `createVNextSubmissionStateRecord(...)` from the public core entrypoint;
- `docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md` records the remaining
  compatibility composition, storage, and vertical-slice tests that still need
  later cleanup before or during Window NR-C.

This phase intentionally does not remove public exports, rewrite every
compatibility composition test, change helper runtime behavior, touch backend
or frontend code, add a gateway, run rich-inline replay execution, or implement
production submission workflow storage.

Next recommended work: finish the remaining NR-B compatibility-test cleanup or
plan Window NR-C public export narrowing once the remaining composition tests
have a retained/backend owner.

## Phase 239 Core Non-Route Public-Entrypoint Test Cleanup

Core Non-Route Public-Entrypoint Test Cleanup finishes the NR-B core-test
cleanup by moving remaining compatibility/storage/vertical-slice test imports
of the deprecated helper names off `../src/index.js` and onto owner modules.

The cleanup confirms:

- `tests/sessionPackageSnapshot.test.ts` and
  `tests/backendRouteStorageBinding.test.ts` import
  `createVNextSessionStorageRecord(...)` from
  `src/authoring/sessionStorage.ts`;
- `tests/richInlineReplayValidation.test.ts`,
  `tests/richInlineLiveExactParityAudit.test.ts`,
  `tests/storageAdapter.test.ts`,
  `tests/verticalSliceStorageSimulation.test.ts`, and
  `tests/verticalSliceRcEndToEnd.test.ts` import
  `createVNextRichInlineSessionPersistenceRecord(...)` from
  `src/authoring/richInlineSessionPersistence.ts`;
- `tests/submissionIdentityStatus.test.ts` imports
  `createVNextSubmissionStateRecord(...)` from
  `src/workflow/submissionState.ts`;
- `tests/coreNonRouteRetainedTestRewrite.test.ts` guards that the known NR-B
  compatibility tests do not import those deprecated helper names from the
  public core entrypoint.

This phase intentionally does not remove public exports, change compatibility
helper runtime behavior, touch backend/frontend code, retire old concrete
package lanes, add a gateway, run rich-inline replay execution, or implement
production submission workflow storage.

Next recommended work: Phase 240 package-lane cleanup is complete; continue to
Window NR-C public export narrowing.

## Phase 240 Core Non-Route Package-Lane Cleanup

Core Non-Route Package-Lane Cleanup removes the old concrete package lanes as
consumers of deprecated non-route compatibility helper/type names through
`@flowdoc/vnext-core` before Window NR-C public export narrowing.

The cleanup confirms:

- `packages/internal-alpha-runner/src/internalAlphaRecords.ts` owns
  internal-alpha session and rich-inline compatibility record envelopes while
  composing retained core facts from `createVNextSessionPackageSnapshot(...)`,
  `createVNextDurableHistorySnapshot(...)`, and
  `createVNextRichInlineReplayValidation(...)`;
- `packages/internal-alpha-runner/src/internalAlphaVerticalSlice.ts` and
  `packages/internal-alpha-runner/src/storageBackedRcRoundtrip.ts` use those
  package-local factories for smoke evidence;
- `packages/internal-alpha-runner/src/storageRouteBinding.ts` uses the
  package-local session record type for route-shaped session responses;
- `packages/storage-file-json/src/index.ts` stores package-session and
  rich-inline-session payloads as generic JSON envelope values instead of
  importing compatibility record shapes from public core;
- `tests/coreNonRouteRetainedTestRewrite.test.ts` guards the package lanes
  against importing deprecated compatibility helper/type names from
  `@flowdoc/vnext-core`.

This phase intentionally does not remove public exports, change compatibility
helper runtime behavior, touch backend/frontend repos, introduce a gateway, run
rich-inline replay execution, or implement production submission workflow
storage.

Next recommended work: Phase 241 public export narrowing is complete; decide
whether owner-module compatibility source implementations stay as historical
evidence or move into a later source cleanup.

## Phase 241 Core Non-Route Public Export Narrowing

Core Non-Route Public Export Narrowing completes Window NR-C by narrowing the
package public entrypoint away from the remaining non-route service-shaped
compatibility helpers/types/constants.

The narrowing confirms:

- `src/index.ts` no longer star-exports `src/authoring/sessionStorage.ts`,
  `src/authoring/richInlineSessionPersistence.ts`, or
  `src/workflow/submissionState.ts`;
- the public entrypoint still exports retained non-route facts:
  `createVNextSessionPackageSnapshot(...)`,
  `createVNextRichInlineReplayValidation(...)`,
  `createVNextRichInlineReplayPatchValidation(...)`,
  `createVNextRichInlineReplayPatchRecord(...)`, and
  `createVNextSubmissionIdentityStatus(...)`;
- the public entrypoint no longer exports
  `createVNextSessionStorageRecord(...)`,
  `createVNextRichInlineSessionPersistenceRecord(...)`,
  `createVNextSubmissionStateRecord(...)`, or their service-shaped
  compatibility record/source constants and types;
- `src/persistence/storageAdapter.ts` keeps the storage envelope/evaluator
  contract public while treating package-session and rich-inline-session
  payloads as `unknown`;
- `tests/coreNonRouteRetainedTestRewrite.test.ts` guards the retained public
  names, removed service-shaped public names, and storage adapter generic
  payload boundary.

This phase intentionally does not remove owner-module compatibility source
implementations, rename source modules, touch backend/frontend repos, introduce
a gateway, run rich-inline replay execution, or implement production submission
workflow storage.

Next recommended work: Phase 242 compatibility source cleanup audit is
complete; rewrite the allowlisted tests so the owner-module compatibility
helpers can be deleted.

## Phase 242 Core Compatibility Source Cleanup Audit

Core Compatibility Source Cleanup Audit records the short-lived owner-module
compatibility helper debt that remains after Window NR-C public export
narrowing.

The audit confirms:

- `docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md` lists the remaining
  compatibility helpers, their replacement targets, the current owner-module
  import allowlist, and deletion exit criteria;
- source deprecation comments in `src/authoring/sessionStorage.ts`,
  `src/authoring/richInlineSessionPersistence.ts`, and
  `src/workflow/submissionState.ts` now point at the cleanup audit and state
  that Window NR-C removed the helpers from the public package entrypoint;
- `tests/coreCompatibilitySourceCleanupAudit.test.ts` prevents new untracked
  owner-module imports of the compatibility helpers;
- `src/index.ts` remains narrowed to retained facts while source cleanup is
  pending.

This phase intentionally does not remove compatibility helper implementations,
rewrite the allowlisted tests, touch backend/frontend repos, introduce a
gateway, run rich-inline replay execution, or implement production submission
workflow storage.

Next recommended work: Phase 243 vertical-slice retained storage payload
rewrite is complete; rewrite `tests/storageAdapter.test.ts` in Phase 244.

## Phase 243 Core Vertical-Slice Retained Storage Payload Rewrite

Core Vertical-Slice Retained Storage Payload Rewrite removes the vertical-slice
storage simulation and RC smoke tests from the owner-module compatibility
helper allowlist after Window NR-C.

The rewrite confirms:

- `tests/verticalSliceStorageSimulation.test.ts` no longer imports
  `createVNextSessionStorageRecord(...)` or
  `createVNextRichInlineSessionPersistenceRecord(...)`;
- `tests/verticalSliceRcEndToEnd.test.ts` no longer imports those
  compatibility helpers;
- both tests use retained facts from `createVNextSessionPackageSnapshot(...)`
  and `createVNextRichInlineReplayValidation(...)` as generic storage payloads
  for package-session and rich-inline-session writes;
- `tests/coreCompatibilitySourceCleanupAudit.test.ts` removes those
  vertical-slice files from the compatibility import allowlist;
- `docs/CORE_COMPATIBILITY_SOURCE_CLEANUP_AUDIT.md` records that the
  vertical-slice storage rewrite is complete while storage-adapter and
  composition-test cleanup remains.

This phase intentionally does not remove compatibility helper implementations,
rewrite `tests/storageAdapter.test.ts`, rewrite composition tests, touch
backend/frontend repos, introduce a gateway, run rich-inline replay execution,
or implement production submission workflow storage.

Next recommended work: Phase 244 storage adapter generic payload rewrite is
complete; rewrite the remaining composition tests in Phase 245.

## Phase 244 Core Storage Adapter Generic Payload Rewrite

Core Storage Adapter Generic Payload Rewrite removes
`tests/storageAdapter.test.ts` from the owner-module compatibility helper
allowlist.

The rewrite confirms:

- `tests/storageAdapter.test.ts` no longer imports
  `createVNextSessionStorageRecord(...)` or
  `createVNextRichInlineSessionPersistenceRecord(...)`;
- package-session writes use a test-local generic payload backed by
  `createVNextSessionPackageSnapshot(...)`;
- rich-inline-session writes use retained facts from
  `createVNextRichInlineReplayValidation(...)`;
- `src/persistence/storageAdapter.ts` continues to expose
  `packageSessions: VNextStorageCollection<unknown>` and
  `richInlineSessions: VNextStorageCollection<unknown>`;
- `tests/coreCompatibilitySourceCleanupAudit.test.ts` removes
  `tests/storageAdapter.test.ts` from the compatibility import allowlist.

This phase intentionally does not remove compatibility helper implementations,
rewrite composition tests, touch backend/frontend repos, introduce a gateway,
run rich-inline replay execution, or implement production submission workflow
storage.

Next recommended work: Phase 245 composition test rewrite is complete; Phase
246 should remove the owner-module compatibility helper source.

## Phase 245 Core Compatibility Composition Test Rewrite

Core Compatibility Composition Test Rewrite removes the remaining composition
tests from the owner-module compatibility helper allowlist.

The rewrite confirms:

- `tests/sessionPackageSnapshot.test.ts` no longer imports
  `createVNextSessionStorageRecord(...)` and asserts backend storage
  replacement evidence from retained package snapshot facts;
- `tests/richInlineReplayValidation.test.ts` no longer imports
  `createVNextRichInlineSessionPersistenceRecord(...)` and asserts backend
  rich-inline session replacement evidence from retained replay validation
  facts;
- `tests/richInlineLiveExactParityAudit.test.ts` no longer imports the
  rich-inline compatibility helper and proves retained durable history plus
  replay validation facts stay live/exact artifact-free;
- `tests/submissionIdentityStatus.test.ts` no longer imports
  `createVNextSubmissionStateRecord(...)` and asserts backend route replacement
  evidence from retained submission identity/status facts;
- `tests/coreCompatibilitySourceCleanupAudit.test.ts` now leaves only the
  source-internal `createVNextSessionStorageRecord(...)` and
  `VNextSessionStorageRecord` imports inside
  `src/authoring/richInlineSessionPersistence.ts` allowlisted.

This phase intentionally does not remove compatibility helper implementations,
touch backend/frontend repos, introduce a gateway, run rich-inline replay
execution, or implement production submission workflow storage.

Next recommended work: Phase 246 compatibility source deletion is complete;
merge the cleanup branch to main before starting the next backend/frontend
integration lane.

## Phase 246 Core Compatibility Source Deletion

Core Compatibility Source Deletion removes the short-lived owner-module
compatibility helpers after the allowlist reaches zero.

The deletion confirms:

- `src/authoring/sessionStorage.ts` removes
  `createVNextSessionStorageRecord(...)`,
  `VNextSessionStorageRecord`, `VNEXT_SESSION_STORAGE_SOURCE`, and
  `VNEXT_SESSION_STORAGE_MODE` while keeping
  `createVNextSessionPackageSnapshot(...)`;
- `src/authoring/richInlineSessionPersistence.ts` removes
  `createVNextRichInlineSessionPersistenceRecord(...)`,
  `VNextRichInlineSessionPersistenceRecord`,
  `VNEXT_RICH_INLINE_SESSION_PERSISTENCE_SOURCE`, and
  `VNEXT_RICH_INLINE_SESSION_PERSISTENCE_MODE` while keeping replay
  validation helpers and the retained replay patch record;
- `src/workflow/submissionState.ts` removes
  `createVNextSubmissionStateRecord(...)`,
  `VNextSubmissionStateRecord`, `VNEXT_SUBMISSION_STATE_SOURCE`, and
  `VNEXT_SUBMISSION_STATE_MODE` while keeping
  `createVNextSubmissionIdentityStatus(...)`;
- targeted source/package scans find no current source/package usage of the
  deleted compatibility helper names;
- guard docs now describe the helper names as historical migration evidence,
  not current core API.

This phase intentionally does not rename the retained source modules, remove
route-shaped deprecated source files, touch backend/frontend repos, introduce a
gateway, run rich-inline replay execution, or implement production submission
workflow storage.

Next recommended work: merge this branch to main, then choose the next
backend/frontend integration lane from the retained facts now left in core.

## Phase 247 Reorder Blocked-Target QA Fixture

This phase adds canonical core evidence for browser-visible reorder failure
paths without widening product document semantics.

The fixture confirms:

- `fixtures/reorder-blocked-target-qa.flowdoc.json` is a small vNext package
  with two visible canvas text-block surfaces under different zone parents;
- `tests/packageFixture.test.ts` parses the fixture, proves the cross-parent
  surface relationship, and keeps the text-block reorder capability explicit;
- `README.md` lists the fixture as product-shaped QA coverage rather than a
  replacement for the default product report fixture.

This phase intentionally does not add cross-parent move semantics, editor HTTP
transport, DOM state, backend storage execution, browser automation evidence,
or production product content changes to core.

Next recommended work: use this fixture through backend seed data and editor
configuration to capture blocked-target browser visual evidence.

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

## Phase 272 Document Instance Materialization Contract

Phase 272 adds the first pure Structure-to-Instance transition without
activating persistence or product workflow:

- `planVNextDocumentInstanceMaterializationV1(...)` strictly accepts one exact
  Published Structure Version, a revision-zero backend-allocated instance,
  its valid starter graph, published Structure Policy, and instance title;
- exact instance and policy version pins, starter structure, and policy node
  bindings are validated before a plan can be produced;
- the source graph remains immutable while the instance root id changes and
  section, node, and inline ids retain scoped identity;
- explicit provenance maps every retained graph identity back to its published
  starter; and
- field/style/static-media, instance-media, and Data Snapshot ownership is
  recorded without copying or resolving those registries.

This phase intentionally does not persist, allocate ids, advance revisions,
resolve data, expand generated nodes, migrate instances, paginate, or render.
Backend materialization execution and resolved projection remain later phases.

## Phase 273 Resolution Input Pins

Phase 273 adds strict standalone inputs for deterministic resolution:

- one Published Resolution Bundle pins the field contract, bounded text-style
  catalog, and static media to an exact Published Structure Version;
- Data Snapshot and instance media snapshots pin an exact Document Instance
  id, revision, and structure version independently of field definitions;
- the materialized document root must equal the instance id; and
- published and instance asset ids may not collide while authored image sources
  remain unnamespaced.

This phase intentionally does not resolve scalar/image values, merge registries,
fetch mutable state, change package parsing, persist, paginate, or render.

## Phase 274 Resolved Document Projection

Phase 274 adds a deterministic, all-or-blocked projection over Phase 273 pins:

- scalar field refs resolve from atomic data, authored fallback, or explicit
  empty text without changing field definitions;
- authored static images and instance data images resolve through separate
  owner-aware binding records;
- text style ids resolve to published preset facts while local inline style
  remains the override layer;
- the materialized graph and source input remain immutable; and
- invalid structure, data type, field, style, or media references block the
  entire projection.

The projection intentionally does not expand generated nodes, resolve
collections/repeats, paginate, render, persist, fetch inputs, or activate the
current package generation runtime.

## Phase 275 Text-block V4 Authoring Contract

Phase 275 closes the first text-block readiness unknowns on document v4:

- canonical authored emptiness is `children: []` with no persisted caret
  sentinel;
- an empty caret uses `inlineId: null` and offset zero, while non-empty anchors
  use stable text-block/inline identity, local UTF-16 offset, and affinity;
- text, field-ref, line-break, page-number, and inline-image project to one
  deterministic model stream with atomic non-text slots;
- field placement compatibility and page-number zone policy are validated
  against pinned authored facts; and
- shared safe UTF-16 logic is extracted without coupling v4 to the document v3
  grammar contract.

This phase intentionally does not add v4 text mutation, editor DOM/IME state,
backend persistence, measured lines, pagination, renderer, or cross-page edit
acceptance.

## Phase 276 Text-block V4 Rich-inline Replace

Phase 276 adds the first v4-native content transaction:

- complete inline replacement remains the bounded single-user v1 commit policy;
- Structure drafts and Document Instances require exact artifact, policy, and
  field-contract ownership pins;
- effective core/structure/session capability checks require content edit plus
  field, media, or style permission only when those placements change;
- v4 grammar and full resulting-document validation run before commit; and
- output includes inline identity diff, field keys, scope, durable history, and
  text-content invalidation facts without mutating source input.

This phase intentionally does not claim collaboration/offline merge safety,
add granular text/atomic commands, execute backend persistence, integrate editor
DOM/IME input, paginate, render, or accept cross-page editing.

## Phase 277 Text-block V4 Inline Commands

Phase 277 adds explicit field and managed-atomic command planning:

- field-ref, line-break, page-number, and inline-image insertion starts from a
  canonical v4 caret and produces a complete replacement child list;
- insertion inside text retains the left identity and requires a caller-supplied
  unique right identity while preserving sparse run style;
- atomic removal targets identity and returns a deterministic neighboring or
  canonical empty-block caret;
- current and planned blocks pass v4 grammar and field/zone checks; and
- planner output remains source-immutable and must pass the Phase 276
  artifact/policy/session/history commit boundary.

This phase intentionally does not mutate documents, create history, allocate
implicit ids, add granular text/style commands, integrate DOM/IME/backend,
paginate, or render.

## Phase 278 Text-block V4 Measurement Source Ranges

Phase 278 adds the first v4 resolved measurement boundary:

- Resolved Document text, field values, hard breaks, inline images, styles,
  width, profile, and instance revision become one source-immutable packet;
- measured lines must cover the entire rendered stream with valid geometry and
  safe UTF-16 boundaries;
- accepted line endpoints map back to authored inline identity and local offset;
- wrapped field values additionally retain resolved offsets while the authored
  field placement remains atomic; and
- empty text-blocks accept one zero-range measured line.

This phase intentionally does not choose/execute a line breaker, expand page
numbers, paginate, render, load fonts/media bytes, integrate editor DOM, or run
backend measurement jobs.

## Phase 279 Text-block V4 Line Pagination

Phase 279 consumes accepted measured lines without relayout:

- one canonical text-block becomes deterministic per-page fragments retaining
  the same node id, line ranges, and canonical/resolved source points;
- whole lines pack by measured height and over-height lines block;
- page-local y offsets and used/remaining body height are explicit;
- authored graph and identities remain immutable; and
- a 6,000-line, 250-page bounded text-block case supplies representative scale
  evidence under the local regression threshold.

This phase intentionally does not paginate mixed document nodes, add paragraph
keep/widow/orphan policy, split columns/tables, render, integrate editor/backend,
or claim complete 250-page artifact readiness.

## Phase 280 Text-block V4 Readiness Close Audit

Phase 280 records that v4 grammar/empty state/selection, lifecycle-aware rich
replacement, managed field/atomic planning, resolved bindings, measured source
ranges, isolated line pagination, and 6,000-line/250-page text scale have direct
core evidence. These facts unblock columns/table split planning and
backend/editor transport integration as separate next phases.

The audit intentionally keeps concrete measurement-engine execution, mixed
document pagination, generated page numbers, renderer/export, backend mutation
persistence, editor DOM/IME/stale apply, cross-page UX, field drift,
collaboration, and mixed-document scale open.

## Phase 281 Structure Authoring V4 Transport Close Audit

Phase 281 records that lifecycle-aware rich replacement now crosses editor
intent, backend capability/revision/idempotency gates, core policy semantics,
backend mutation receipt persistence, and editor stale-gated apply. Backend
owns draft identity, field contract, Structure Policy, and session actions;
the editor submits only target identity and core-validated inline children.

The audit intentionally keeps editor draft/DOM/IME input, production auth and
storage, collaboration, concrete measurement, columns/table split semantics,
mixed pagination, renderer, and export closed. The next semantic dependency is
columns parallel child flow followed by table cell/row split policy.

## Phase 282 Columns V4 Architecture Lock

Phase 282 locks Columns as one canonical group of ordered independent column
flows. Page fragments complete at the longest active column, completed sibling
lanes remain empty, reading order is column-major, and nested Columns are
acyclic with a v1 maximum depth of three.

The lock preserves the existing 100-share width contract and direct-body-only
page breaks. It requires measurement-free cursor planning, legal checkpoints,
atomic parallel reconciliation, no-progress protection, impact facts, and
bounded scale evidence without activating a scheduler, mixed layout,
renderer/export, backend mutation, or editor controls.

## Phase 283 Columns V4 Geometry And Impact Contract

Phase 283 computes source-immutable track geometry from the existing 100-share
and point-gap contract, with minimum usable width supplied by a versioned
planner capability. Document v4 structure validation now accepts at most three
Columns containers on an ancestor path and blocks a fourth with an explicit
diagnostic.

The phase also publishes JSON-safe cursor/checkpoint shapes and factual Columns
impact lanes. Width, gap, and structure changes invalidate measurement,
pagination, and rendering; minimum-height changes invalidate pagination and
rendering only. It does not paginate children, classify cost, run a scheduler,
or alter backend/editor behavior.

## Phase 284 Columns V4 Text Fragment Candidates

Phase 284 adapts accepted text-block v4 measured lines into reusable Columns
child fragment candidates. Candidates retain canonical source points, measured
height, legal line boundaries, prefix heights, keep policy, and deterministic
input fingerprints while leaving accepted measurement input immutable.

The adapter blocks unaccepted measurement and performs no shaping,
measurement, pagination, cursor mutation, rendering, or scheduler execution.

## Phase 285 Columns V4 Single-lane Planner

Phase 285 consumes prepared child fragment sources through a source-immutable,
monotonic column cursor. Prefix heights select the largest legal fragment
prefix for available height; output retains placements, checkpoints,
continuation reason, and deterministic work facts.

Prefer-together content moves whole when it fits a fresh page and falls back to
legal splitting when oversized. A fragment taller than the full page body,
invalid cursor, or no-progress state blocks explicitly. This phase does not
reconcile sibling lanes, create Columns page fragments, recurse, measure,
render, or schedule work.

## Phase 286 Columns V4 Parallel Reconciliation

Phase 286 plans every sibling column from one cursor snapshot and commits all
lane cursors together only after every lane succeeds. Each page fragment uses
the greatest lane height; completed lanes remain empty on continuation pages,
and Columns completes only when all lanes complete.

The paginator retains first-page remainder, full-page continuation, minimum
height, page-attempt bounds, geometry order, source identity, deterministic
fingerprints, and aggregate work facts. It performs no measurement, authored
mutation, identity allocation, recursion, mixed-flow composition, rendering,
or scheduling.

## Phase 287 Columns V4 Nested Pagination

Phase 287 adds recursive fragment and nested-Columns flow items. Inner Columns
receive the exact parent track width and current remaining page height, return
page-local nested fragments, and retain a JSON-safe cursor tree when they
continue. Outer lanes preserve preceding y offsets and stop at the same
physical page continuation.

Depth three is accepted; depth four, width mismatch, cursor ownership drift,
and atomic nested-lane failure block explicitly. The recursive planner performs
no measurement, authored mutation, identity allocation, renderer work,
backend/editor execution, or generic scheduling.

## Phase 288 Columns V4 Determinism And Scale

Phase 288 adds stable recursive page signatures beside the existing input
fingerprint and work facts. A bounded test paginates 6,000 prepared text
fragments through three nested Columns levels into 250 deterministic pages.

The accepted run records 250 page attempts, 750 lane plans, 500 nested plans,
250 prefix-checkpoint lookups, and 6,000 consumed fragments without measurement
execution or source mutation. Wall-clock coverage is a generous local
regression guard; operation counts are the primary complexity evidence. This
does not prove mixed table/media/generated-content or renderer scale.

## Phase 289 Columns V4 Readiness Close Audit

Phase 289 records PASS evidence for deterministic track geometry, canonical
document-to-planner assembly, accepted text candidates, monotonic lane cursors,
atomic longest-column reconciliation, depth-three recursive continuation,
impact facts, stable signatures, and 6,000-fragment/250-page bounded scale.

Columns layout remains PARTIAL rather than product-ready. Non-text child
fragment contracts, mixed body composition, concrete measurement, renderer
and export, v4 Columns authoring/history operations, backend persistence, and
editor controls remain blocked or unknown. Table row/cell split planning is the
next core semantic dependency.

## Phase 290 Identity Standard V1 Architecture Lock

Phase 290 separates authored local identity, allocated retained identity, and
derived layout identity. New allocated contracts use bounded opaque ids with
registered profiles, explicit allocation owners, and declared uniqueness
scopes while structured provenance and canonical allocation-input facts remain
outside the id.

The lock does not narrow existing authored or Structure lifecycle parsers,
choose backend entropy/digest implementations, persist allocations, or activate
table resolution. It establishes the prerequisite for stable collection-backed
Resolved Table row identities that do not depend on array indexes.

## Phase 291 Identity Standard V1 Contracts

Phase 291 publishes strict allocated-identity profiles for lifecycle, resolved,
layout, request, job, and artifact domains. Accepted records bind identity kind
to its class, bounded opaque prefix, allocation owner, and explicit global,
document-resolution, or layout-input scope.

Structured provenance retains named origin references, revision pins, and an
allocation-input key outside the id. Core validates these records but does not
allocate, retry collisions, persist identity, narrow existing lifecycle ids, or
activate resolved table behavior.

## Phase 292 Identity Allocation Input And Batch Audit

Phase 292 creates order-independent allocation-input keys from structured
origin references and revision pins using canonical JSON rather than delimiter
concatenation. A builder emits accepted provenance records without deriving an
id or choosing an allocation algorithm.

The batch audit blocks key/origin drift, duplicate ids, conflicting provenance,
cross-scope identity reuse, and one canonical allocation input mapping to
multiple ids. Invalid batches return no partial accepted records. Backend
collision retry, persistence, and table resolution remain inactive.

## Phase 293 Identity Standard V1 Readiness Close Audit

Phase 293 records PASS evidence for bounded opaque profiles, explicit owners
and scopes, structured provenance, order-independent allocation-input keys, and
all-or-blocked duplicate/conflict audits. Existing authored and Structure
lifecycle identities remain unchanged.

Identity Standard v1 now unblocks Table Definition and Resolved Row contracts.
Backend allocation quality, collision retry, persistence, product display,
collaboration reconciliation, domain-specific item-key bounds, and table
execution remain open.

## Phase 294 Table V4 Semantic Architecture Lock

Phase 294 defines Table v4 as one semantic definition with stable normalized
columns and ordered static/collection row sources. Resolution validates unique
item keys, applies explicit empty-dataset policy, and emits ordered rows before
measurement or pagination.

Rows synchronize independent cell flows at one physical page boundary,
`colSpan` uses gap-free occupancy, `rowSpan` is reserved but blocked above one,
and row break policy is explicit. Canonical v4 schemas, Resolved Document v1,
document v3 pagination, backend, editor, renderer, and export remain unchanged.

## Phase 295 Table V4 Definition And Occupancy Contracts

Phase 295 publishes standalone Table Definition metadata owned by an exact
Structure draft or Published Structure Version. Stable semantic columns total
100 width shares; ordered static and collection row sources reference strict
row templates with explicit role, empty policy, and break policy.

The validator requires gap-free, non-overlapping `colSpan` occupancy across the
full logical grid, rejects duplicate ids and missing templates, and reserves
`rowSpan` while accepting only one in v1. It does not alter document v4 parsers,
resolve collections, paginate rows, or integrate backend/editor behavior.

## Phase 296 Table V4 Collection Snapshot Contract

Phase 296 publishes an exact Document Instance-pinned collection snapshot with
explicit snapshot revision, named collection records, retained item order,
unique stable item keys, and JSON-safe scalar/image item values. Empty
collections are explicit and valid.

The parser blocks duplicate or blank item keys, collection record-key drift,
and unknown fields. It performs no fetch, field-capability validation, sorting,
filtering, row identity allocation, table resolution, or persistence.

## Phase 297 Table V4 Resolved Row Projection

Phase 297 validates exact published-definition, field-contract, Document
Instance, and collection-snapshot pins before producing ordered static,
empty-state, and collection rows. Collection rows preserve snapshot order and
require externally allocated `rowi`/`celli` provenance for every occurrence.

Resolution audits exact table/source/template/item/cell references, revision
pins, document-resolution scope, allocation-input keys, duplicates, missing and
extra assignments, empty policies, and collection field capability. Output is
all-or-blocked or explicitly suppressed; content cloning, measurement,
pagination, rendering, backend allocation, and persistence remain inactive.

## Phase 298 Table V4 Semantic Readiness Close Audit

Phase 298 records PASS evidence for exact Structure ownership, stable normalized
columns, span-aware row templates, ordered static/collection sources, pinned
collection snapshots, explicit empty policies, collection field capability,
and all-or-blocked `rowi`/`celli` provenance validation.

The semantic row-stream slice is ready, not the complete Table node. Descendant
content materialization, nested item-field schema, sorting/grouping, prepared
cell fragments, synchronized row pagination, renderer/export, backend
allocation/persistence, and editor authoring remain open.

## Phase 299 Table V4 Content Materialization Architecture Lock

Phase 299 separates public collection values from internal normalized item
identity and locks explicit document/item binding scope for every field-bearing
row-template placement. Collection Item and binding contracts belong to the
exact Published Structure Version.

Collection-row content receives externally allocated `nodei`/`inli` identities,
retains exact source provenance, clones supported block/inline placements
without mutating authored structure, and emits separate binding facts. TOC,
pagination, rendering, backend normalization/storage, and editor behavior remain
inactive.

## Phase 300 Published Collection Item And Content Binding Contracts

Phase 300 publishes exact Published Structure-owned collection item shapes for
text, number, date, boolean, enum, and image fields. Required fields reject
missing-value fallbacks; optional fallbacks must match field type, and nested
collections remain outside v1.

Table Content Binding metadata explicitly maps source placements to document or
collection-item fields and declares text/image placement kind. The compatibility
validator aligns owners, parent collection capability, table/template identity,
row-source scope, and field type without inspecting or cloning source graph
content yet.

## Phase 301 Resolved Table Content Identity Profiles

Phase 301 adds `resolved-node`/`nodei_` and `resolved-inline`/`inli_` to
Identity Standard v1. Both are resolved entities supplied by the resolution
orchestrator under the exact document-resolution scope and use the existing
canonical provenance/input-key/batch-conflict contracts.

The change is additive and does not narrow existing identity records, allocate
ids inside core, clone content, persist materialization, or alter canonical
authored node/inline identity.

## Phase 302 Table V4 Content Source Plan

Phase 302 validates the exact authored document, Table Definition, Published
Field/Collection Item contracts, and Content Binding contract before indexing
collection row-template cells, supported nodes, inlines, and field-bearing
placements in one document-root scan.

The source plan blocks missing ownership, unsupported TOC/generated content,
source cell-map drift, missing/extra bindings, placement-kind mismatch, and
embedded-key drift. It performs no identity allocation, cloning, value binding,
measurement, or pagination.

## Phase 303 Resolved Row And Content Identity Assignment Acceptance

Phase 303 publishes strict JSON-safe acceptance for resolved Table row-stream
output and externally supplied row/cell/node/inline content identity assignment
envelopes. Assignment record keys must retain source node/cell/inline facts and
duplicate row assignment ids block.

The schemas do not prove exact materialization provenance, allocate ids, clone
content, resolve values, measure, or paginate. The materializer remains
responsible for semantic source/provenance completeness and batch conflict audit.

## Phase 304 Table V4 Content Materialization

Phase 304 recomputes one accepted source plan, validates exact resolved-row and
global-binding scope, requires complete row/cell/node/inline assignments, and
audits every `nodei`/`inli` origin plus allocation-input key before cloning.

Supported collection-row text-block, image, divider, and spacer content is
cloned source-immutably with rewritten block/inline ids. Item and document text/
image values remain separate binding tables with explicit fallback/null source.
Static rows remain authored references. Identity allocation, media fetch,
measurement, pagination, rendering, persistence, and editor behavior do not run.

## Phase 305 Table V4 Content Materialization Determinism And Scale

Phase 305 materializes 1,000 collection rows twice from the same pinned request
and proves byte-stable JSON, source immutability, 1,000 cloned nodes/inlines/item
bindings, 2,000 content provenance records, and factual work counts with one
source-plan plus one materialization document-root scan.

The evidence bounds semantic materialization work only. It does not measure text,
paginate 200-300 pages, fetch media, render artifacts, or prove production
memory/cache/storage behavior.

## Phase 306 Table V4 Content Materialization Readiness Close Audit

Phase 306 closes the bounded resolved Table content materialization slice across
Published item and scoped-placement contracts, supported source planning,
externally supplied row/cell/node/inline provenance, immutable graph cloning,
separate text/image value bindings, reorder stability, and 1,000-row evidence.

Public collection values still require backend normalization into stable
internal item identities. Prepared cell fragments, synchronized row pagination,
media registry validation, rendering, authoring, and production cache/memory
behavior remain open.

## Phase 307 Table V4 Prepared Cell Fragment Architecture Lock

Phase 307 defines prepared Table cells as measurement-complete,
pagination-free sources with exact `colSpan` geometry, explicit cell insets,
paired text measurement evidence, family-owned text/atomic child policies,
prefix heights, deterministic fingerprints, and bounded invalidation facts.

It does not change canonical schemas or activate measurement engines,
synchronized row pagination, repeated headers, renderer/export, backend, or
editor behavior.

## Phase 308 Table V4 Cell Geometry

Phase 308 publishes strict Table cell layout-profile and geometry contracts.
Stable semantic column shares resolve once to deterministic point tracks; cell
outer/content widths use exact `columnStart`/`colSpan` occupancy and explicit
default or row-template-local insets.

Unknown overrides and non-positive content widths block. Geometry emits stable
fingerprints and factual work counts without measurement, pagination, rendering,
backend, or editor execution.

## Phase 309 Table V4 Text Measurement Preparation

Phase 309 reuses one pure resolved-node Text-block packet builder for existing
Resolved Document and materialized Table paths. Table preparation validates
exact definition/geometry/materialization/style ownership, binds cloned inline
ids, and emits one width/profile/revision-pinned request per collection text
block.

Static authored text remains on the existing Resolved Document measurement
path. The phase does not run a measurement engine, accept measured lines,
prepare fragment candidates, paginate, render, or change backend/editor state.

## Phase 310 Table V4 Text Fragment Evidence

Phase 310 requires every collection Table text measurement result to retain the
exact prepared request. Core re-accepts measured lines against that request,
including UTF-16-safe source ranges and summary facts, before emitting
Table-owned line candidates, prefix heights, and deterministic fingerprints.

Missing, extra, width/profile/revision-drifted, or altered measured evidence
blocks all output. Measurement remains external and pagination/rendering do not
run.

## Phase 311 Table V4 Materialized Cell Preparation

Phase 311 assembles collection-materialized cells in canonical child order.
Accepted text lines remain splittable; block image, divider, and spacer become
family-owned atomic candidates with explicit point geometry. Cells retain
`colSpan` geometry, child candidate ranges, prefix heights, vertical insets,
row break policy, minimum first-fragment height, and deterministic fingerprints.

Authored-reference rows remain explicitly pending for the Resolved Document
measurement lane. Pagination, repeated headers, rendering, media fetch, backend,
and editor behavior do not run.

## Phase 312 Table V4 Authored Cell Preparation And Row Assembly

Phase 312 prepares authored static, header, footer, and empty-state rows from
the exact Resolved Document instance/revision and existing scalar/image/style
bindings. Authored and collection rows share one cell-family builder and retain
distinct authored versus resolved row/cell identity unions.

The final assembler restores exact materialized row order and blocks missing,
duplicate, wrong-kind, or cross-scope rows. Measurement is accepted input;
pagination, repeated headers, rendering, backend, and editor behavior remain
inactive.

## Phase 313 Table V4 Prepared Cell Invalidation Facts

Phase 313 maps item/document values, source content, geometry, style/profile,
image frame, minimum row height, and row order changes to explicit measurement,
preparation, pagination, and render lanes. Local changes require exact affected
row/cell facts; geometry/profile changes are table-wide; reorder retains
prepared evidence and invalidates page placement from one earliest row.

The contract emits factual scope and retained-state facts only. It does not
define product-facing light/medium/heavy labels or execute invalidation.

## Phase 314 Table V4 Prepared Cell Determinism And Scale

Phase 314 prepares 1,000 collection rows twice from the same geometry and text
evidence and proves byte-identical output, source immutability, 1,000 cells,
1,000 visited nodes, 1,000 legal text candidates, and exact factual work counts.

The fixture proves bounded semantic preparation only. It does not execute a
measurement engine, synchronized row pagination, 200-300 page layout,
rendering, export, or production cache/memory behavior.

## Phase 315 Table V4 Prepared Cell Fragment Readiness Close Audit

Phase 315 closes the bounded prepared Table cell fragment slice across exact
`colSpan` geometry, collection/authored measurement packets, paired evidence
re-acceptance, shared text/image/divider/spacer preparation, complete ordered
row assembly, invalidation facts, unambiguous fingerprints, and 1,000-row
determinism.

Synchronized row pagination, break-policy execution, repeated headers,
oversized/no-progress handling, 200-300 page evidence, renderer/export,
backend, and editor remain open.

## Phase 316 Table V4 Synchronized Row Pagination Architecture Lock

Phase 316 defines Table pagination as independent prepared-cell plans reconciled
into one maximum-height row fragment with atomic all-cell cursor commit. It
locks monotonic cursors, first/final-only insets, empty/early-complete cells,
allow/prefer-keep/strict-keep behavior, bounded fresh-page advances,
no-progress/oversized diagnostics, repeated leading headers, and factual
200-300 page scale criteria.

It does not change canonical schemas or activate measurement, renderer/export,
backend, or editor behavior.

## Phase 317 Table V4 Cell Cursor And Planner

Phase 317 publishes strict authored/resolved cell cursor identities and a pure
one-attempt planner. It consumes prepared prefix heights, applies top inset only
at the initial boundary and bottom inset only on completion, commits empty-cell
insets once, advances monotonically, and returns explicit fresh-page or
oversized diagnostics.

The planner does not reconcile sibling cells, apply row break policy, paginate
multiple rows, repeat headers, measure, render, or mutate input.

## Phase 318 Table V4 Synchronized Row Planner

Phase 318 publishes strict authored/resolved row cursors and a pure one-attempt
row planner. It snapshots canonical cell cursors, plans every sibling once,
uses maximum consumed height, commits all cell cursors atomically, retains
early-complete cells as empty continuations, and executes allow, prefer-keep,
strict-keep, and first-fragment minimum-height policy.

Blocked cells, oversized strict rows, cursor/order drift, and no-progress states
return no partial cursor. Multi-row pages and repeated headers remain inactive.

## Phase 319 Table V4 Multi-row Pagination

Phase 319 assembles ordered prepared rows into bounded pages. Completed rows
share remaining page height, split rows retain one active atomic row cursor,
and a partial first-page remainder may advance once to a fresh body. Page and
row-plan limits, deterministic fragments/fingerprints, source immutability, and
factual work counts are explicit.

Repeated headers remain intentionally inactive until base multi-row pagination
is stable. Measurement, rendering, backend, and editor behavior do not run.

## Phase 320 Table V4 Repeated Leading Headers

Phase 320 applies explicit repeat-leading-headers policy to contiguous leading
authored header rows. Continuation pages plan fresh strict-keep layout
fragments that retain authored row/cell identity without allocation or history.

Missing headers, headers that cannot complete, and fresh pages where repeated
headers prevent body progress block before emitting header-only loops. Footer
repetition, renderer borders, backend, and editor behavior remain inactive.

## Phase 321 Table V4 Synchronized Pagination Scale

Phase 321 paginates 1,000 fixed-height body rows plus one repeated authored
header into exactly 250 full pages twice. It proves byte-identical output,
1,250 row/cell plans and checkpoint lookups, 249 repeated header fragments,
source immutability, bounded page/plan limits, and complete cursor progress.

The fixture proves deterministic semantic pagination work. It does not measure,
render, export, or establish production cache/memory/worker behavior.

## Phase 322 Table V4 Synchronized Row Pagination Readiness Close Audit

Phase 322 closes the bounded synchronized Table pagination slice across strict
cell/row/Table cursors, first/final boundary insets, atomic maximum-height row
fragments, allow/prefer-keep/strict-keep policy, first-fragment minimum height,
bounded multi-row pages, repeated authored headers, progress/limit diagnostics,
and deterministic 250-page evidence.

Renderer border ownership/consumption, export, incremental repagination,
rowSpan, backend, and editor behavior remain open.

## Phase 323 Table V4 Renderer Consumption Architecture Lock

Phase 323 defines Table v4 rendering as a pure no-relayout projection from
accepted synchronized pages into page, table-segment, row, cell, candidate,
background, and border commands. It requires measured text/width, image
alignment, cell vertical alignment, explicit page origins/style profile, and
single-owner outer/internal/split/repeated-header borders before adapters run.

It does not change pagination or activate artifact bytes, backend jobs, editor
canvas, or the active document v3 renderer path.

## Phase 324 Table V4 Renderer-Complete Prepared Facts

Status: implemented.

Phase 324 carries measured line text and width, authored image alignment, and
cell vertical alignment into prepared Table cells. Synchronized row fragments
also retain content width and insets so later command projection can position
content without reopening the authored document or recomputing geometry.

The additions are fingerprinted, JSON-safe, covered for authored and
materialized rows, and preserve existing pagination decisions and work counts.

## Phase 325 Table V4 Renderer-Neutral Command Projection

Status: implemented.

Phase 325 adds strict page-origin, border, background, missing-media, and style
profile contracts. Accepted synchronized pagination projects deterministically
into page, segment, background, row, cell, text, image, divider, spacer, and
border commands without authored document input, measurement, pagination, or
relayout.

Projection retains row roles, handles per-fragment vertical alignment, audits
page/row/cell/candidate relationships and bounds, and blocks stale fingerprints
or missing media before exposing any partial command list. Outer, internal
column, internal row, continuation, and repeated-header edges have one owner.

## Phase 326 Table V4 Renderer Adapter Evidence And Scale

Status: implemented.

Phase 326 serializes consumable commands into deterministic bounded SVG markup
for geometry evidence without media fetching or artifact execution. PDF and
DOCX adapter plans retain one operation per command, classify semantic spacers
as no-paint, and report missing-media or DOCX continuation-border fallbacks
instead of silently changing layout.

The existing 1,000-body-row fixture now projects 250 pages into 6,250 commands
with exact page/row/cell/candidate/border work counts. Repeated runs are
byte-stable and work remains linear in visited fragments and emitted borders.

## Phase 327 Table V4 Renderer Consumption Readiness Close Audit

Status: closed.

Phase 327 closes renderer consumption across renderer-complete prepared facts,
row roles, strict page/style/fingerprint input, all-or-blocked relationship and
bounds audits, vertical alignment, missing-media policy, one-owner borders,
SVG evidence, PDF/DOCX capability plans, and deterministic 250-page scale.

Production typography/media execution, PDF/DOCX bytes, backend export jobs,
storage, and editor canvas integration remain intentionally open:
`docs/TABLE_V4_RENDERER_CONSUMPTION_READINESS_CLOSE_AUDIT.md`.

## Phase 328 Table V4 Authoring Lane Architecture Lock

Status: locked.

Phase 328 defines Table authoring as an atomic exact-Structure-Draft edit over
canonical document v4 plus draft-owned Table Definition v1. The first profile
supports static row insert/delete, row-source reorder, stable column
insert/delete/resize, and cell vertical alignment with dedicated policy,
selection, history, scope, invalidation, and fingerprint facts.

Collection source lifecycle, cell merge/split, rowSpan, cross-Table movement,
persistence, and editor state remain explicitly blocked or external:
`docs/TABLE_V4_AUTHORING_LANE_ARCHITECTURE_LOCK.md`.

## Phase 329 Table V4 Authoring-Ready Bundle And Capabilities

Status: implemented.

Phase 329 adds strict exact-draft document/Table-Definition bundle acceptance,
canonical structure and one-owner Table lookup, span-one row/template/cell
mapping, semantic/physical column and header synchronization, dedicated Table
policy actions, session permission facts, and deterministic capability output.

Collection source lifecycle, merge/split, rowSpan, and cross-owner moves are
reported as explicit unsupported capabilities rather than raw node mutations.

## Phase 330 Table V4 Static Row Authoring Commands

Status: implemented.

Phase 330 adds source-immutable static row insert/delete and row-source reorder
over the accepted document/Table-Definition bundle. Callers provide durable
row, source, template, and cell identities; core synchronizes authored rows,
semantic templates/sources, and header props atomically.

Commits return identity diff, exact scope, single-entry history, factual
invalidation, fingerprints, work counts, and a selection recommendation. Row
deletion prefers the preceding surviving row. Collection source deletion and
invalid header moves remain blocked.

## Phase 331 Table V4 Grid And Cell Authoring Commands

Status: implemented.

Phase 331 adds stable semantic column insert/delete/resize synchronized with
physical point widths and one authored cell per row template. Existing shares
redistribute proportionally, total physical width remains fixed, and deletion
reports every removed cell descendant including text blocks.

Cell vertical-alignment patch is a layout-only commit: it leaves Table
Definition, measurement, and pagination facts valid while invalidating renderer
content offset. All commands retain dedicated capability, history, selection,
scope, fingerprint, and work facts.

## Phase 332 Table V4 Authoring History And Scale

Status: implemented.

Phase 332 records committed/rejected Table authoring commands with exact draft,
operation, issue, and before/after bundle fingerprints. Pure replay skips
rejected records and blocks artifact, before-state, command-output, or
after-state drift without persistence or editor state mutation.

A 1,000-row-template span-one fixture inserts one stable column twice to
byte-identical output with exactly 1,000 template visits, 3,000 affected cell
visits (two resized plus one inserted per template), 1,000 added nodes,
preserved 400pt total width, and immutable source input.

## Phase 333 Table V4 Authoring Lane Readiness Close Audit

Status: closed.

Phase 333 closes the span-one Structure Draft authoring profile across exact
document/definition/policy ownership, capability gates, static row
insert/delete/reorder, stable column insert/delete/resize, cell vertical
alignment, complete affected cell/text scope, selection/history/invalidation
facts, fingerprint-pinned replay, and deterministic 1,000-row scale.

Collection-source lifecycle editing, shared/empty templates, merge/split,
rowSpan, collaboration, backend persistence, and editor UI remain intentionally
open: `docs/TABLE_V4_AUTHORING_LANE_READINESS_CLOSE_AUDIT.md`.

## Phase 334 Table V4 Authoring Risk Hardening Architecture Lock

Status: locked.

Phase 334 defines a guarded boundary over the pure Table authoring kernel with
exact dry-run impact, strict destructive confirmation pins, selective changed
node/definition snapshots, fingerprint-gated undo/redo, and explicit
row-template/affected-node/removed-subtree budgets.

Authentication, durable storage, editor confirmation UI, collaboration merge,
and previously blocked Table capabilities remain external or future:
`docs/TABLE_V4_AUTHORING_RISK_HARDENING_ARCHITECTURE_LOCK.md`.

## Phase 335 Table V4 Guarded Preview And Reversible Change Sets

Status: implemented.

Phase 335 adds deterministic impact preview over the source-immutable Table
authoring kernel without returning proposed document/definition artifacts.
Static row and column deletion require an exact confirmation packet pinned to
the draft, command, budgets, before/proposed bundles, impact, and change set;
missing, stale, and stray confirmations block with source artifacts unchanged.

Committed plans emit selective changed-node and Table-Definition snapshots.
Changed object-key positions are retained so exact undo/redo reconstructs the
original byte-sensitive bundle fingerprint, while any current-state drift
blocks before application. Persistence, editor state, measurement, pagination,
authentication, collaboration merge, and durable undo storage remain external.

## Phase 336 Table V4 Authoring Budgets History And Scale

Status: implemented.

Phase 336 enforces positive caller-supplied row-template-visit,
unique-affected-node, and removed-subtree-node budgets. Obvious template excess
blocks before kernel planning; exact work and impact excess block before any
proposed artifacts or confirmation are returned. One-unit-below threshold
tests cover all three budget classes.

Guarded committed history retains the reversible change-set fingerprint while
remaining compatible with pure forward replay. A 1,000-row-template column
insertion produces byte-identical repeated previews and commits, exactly 4,001
unique affected nodes, 2,001 changed authored nodes, and 1,000 changed row
templates, then completes exact fingerprint-gated undo and redo. Product
defaults, tenant policy, durable retention, and UI presentation remain open.

## Phase 337 Table V4 Authoring Risk Hardening Close Audit

Status: closed.

Phase 337 closes the guarded core boundary across exact dry-run impact,
fingerprint-pinned destructive confirmation, selective changed slices with
byte-exact undo/redo reconstruction, explicit execution budgets, guarded
history linkage, drift blocks, and deterministic 1,000-row evidence.

Editor confirmation/undo UI, backend revision/auth/persistence, product budget
defaults, durable retention, collaboration merge, and unsupported broader
Table capabilities remain external or future:
`docs/TABLE_V4_AUTHORING_RISK_HARDENING_CLOSE_AUDIT.md`.

## Phase 338 TOC V4 Semantic Lane Architecture Lock

Status: locked.

Phase 338 defines TOC v4 as a derived semantic read model over structure-valid
body-flow heading Text-blocks. It locks structural traversal order, per-TOC
level filtering, composite `{ tocNodeId, headingNodeId }` identity,
authored-preview labels with field dependencies, semantic/page invalidation,
and the fixed-width page-number boundary needed to avoid layout feedback.

Measurement, pagination, final v4 page resolution, renderer output, TOC
authoring commands, backend persistence, and editor UI remain later or external:
`docs/TOC_V4_SEMANTIC_LANE_ARCHITECTURE_LOCK.md`.

## Phase 339 TOC V4 Semantic Collector And Generated Entries

Status: implemented.

Phase 339 adds a strict, source-immutable document v4 TOC semantic collector.
It validates canonical shape and structure, traverses body flows in nested
structural order, applies each TOC's max level, and emits composite-identity
entries with authored-preview labels, field dependencies, source/TOC ordinals,
and pending page references. Empty labels remain visible as warnings.

The plan reports semantic/materialized-label/page-reference/presentation
invalidation boundaries and factual work without resolving field values or
running measurement, pagination, rendering, persistence, or editor state.

## Phase 340 TOC V4 Semantic Impact And Scale

Status: implemented.

Phase 340 adds deterministic comparison of two accepted TOC v4 semantic plans.
It reports added/removed/moved, level, authored-label, and field-dependency
entry changes with exact affected TOC/heading ids and bounded recommendations
for TOC measurement, pagination, renderer, and page-reference refresh.

A 1,000-heading fixture collects byte-identical output with exactly 1,002 node
visits and 1,000 entry builds. Changing one label affects one heading identity
and its one TOC without falsely reporting entry movement or structural change.
No measurement, pagination, rendering, persistence, or editor state is run.

## Phase 341 TOC V4 Semantic Lane Readiness Close Audit

Status: closed.

Phase 341 closes the bounded document-wide body-flow TOC v4 semantic lane
across strict structure input, nested structural source order, per-TOC filters,
composite identity, authored-preview labels and field dependencies, exact plan
comparison, bounded downstream invalidation, and 1,000-heading scale evidence.

TOC measurement, pagination convergence, final v4 page resolution, renderer
consumption, authoring commands/UI, materialized field labels, and backend
persistence remain later or external:
`docs/TOC_V4_SEMANTIC_LANE_READINESS_CLOSE_AUDIT.md`.

## Phase 342 TOC V4 Measurement Lane Architecture Lock

Status: locked.

Phase 342 defines TOC v4 measurement as deterministic generated title/entry
row geometry over one accepted semantic TOC. It locks level indentation,
wrapped label width, leader and fixed trailing number areas, one-line digit
capacity proof, title/row keep policies, fit/overflow facts, and entry/line
budgets through the generic text measurer.

Page assignment, final number replacement, pagination convergence, renderer
consumption, artifacts, authoring commands/UI, and backend persistence remain
later or external: `docs/TOC_V4_MEASUREMENT_LANE_ARCHITECTURE_LOCK.md`.

## Phase 343 TOC V4 Title And Entry Row Measurement

Status: implemented.

Phase 343 measures one accepted semantic TOC through the generic text measurer.
It emits optional title geometry, wrapped entry labels, fixed trailing number
columns with digit-capacity proof, non-overlapping leader areas, title/row keep
policies, fits/split/forced-row-overflow facts, cache work, and entry/line
budget blocks. Geometry fingerprints exclude cache hit/miss execution state.

No page assignment, final number replacement, pagination, rendering,
persistence, network, DOM, or editor state is run.

## Phase 344 TOC V4 Measurement Fit And Impact Hardening

Status: implemented.

Phase 344 separates stable row geometry from available-height fit fingerprints.
Pure refit recomputes fits/split/forced-row-overflow with zero text measurements
and unchanged title/row geometry. Comparison classifies unchanged, fit-only,
and geometry-changed impact, while stricter line-box validation blocks malformed
measurer width/index/height/offset facts before returning layout.

## Phase 345 TOC V4 Measurement Scale And Budgets

Status: implemented.

Phase 345 measures 1,000 generated TOC entries twice to byte-identical output
with exactly 1,002 uncached text measurements and measured lines, 16,020pt
total height, and stable trailing number geometry. Height-only refit reports
1,000 forced-overflow rows with zero text measurement. Entry and line limits
block deterministically one unit below exact work without partial layout.

## Phase 346 TOC V4 Measurement Lane Readiness Close Audit

Status: closed.

Phase 346 closes the bounded TOC v4 generated measurement lane across strict
input/layout validation, title and wrapped keep-together rows, fixed number
capacity, non-overlapping leaders, fit/forced-overflow, zero-measurement refit,
separate geometry/fit impact, budgets, and 1,000-entry deterministic scale.

V4 pagination/page resolution, renderer/artifacts, production visual-exact
measurer evidence, authoring commands/UI, and backend persistence remain later
or external: `docs/TOC_V4_MEASUREMENT_LANE_READINESS_CLOSE_AUDIT.md`.

## Phase 347 TOC V4 Pagination Lane Architecture Lock

Status: locked.

Phase 347 defines measured TOC pagination through an exact-owner cursor,
atomic title/rows, keep-with-first behavior, explicit impossible-keep and forced
overflow facts, partial-remainder fresh-page advance, bounded page windows,
atomic page cursor commits, no-progress guards, and deterministic resume.

Final page-reference replacement, rendering/artifacts, authoring UI, and
backend persistence remain later or external:
`docs/TOC_V4_PAGINATION_LANE_ARCHITECTURE_LOCK.md`.

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
