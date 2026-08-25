# Legacy Phase Ledger Compatibility Index

Status: compact compatibility index for legacy D2 tests.

Owner-facing truth now lives in:

- `docs/manifest.json`
- `docs/DOCUMENT_MAP.md`
- `docs/project/CURRENT_STATE.md`
- `docs/project/ROADMAP.md`
- `docs/project/RISK_REGISTER.md`
- `docs/project/KNOWN_UNKNOWNS.md`

This file intentionally keeps only legacy discovery markers still pinned by tests.
Do not add new phase planning truth here; add active truth to canonical project docs instead.

Original document: vNext Core Phase Ledger.

## Retained Legacy Sections

## LIVE-DRAFT-MR1-P Complete Geometry Boundary

Status: accepted as a bounded Core contract checkpoint. Persistent flow-tree
execution, spatial wrapping, product binding, publication, and production
remain NO-GO.

Reviewed Core runtime baseline: `c9a3e09`.

- Added exact body/column/table-cell parent-region ownership through
  `textBlockInitialFlowParentRegionV1`.
- Added Initial TextBlock Flow classification with complete current geometry
  dependencies and capability-honest list/image/empty rows. The pinned
  `declaredLineHeightLayoutUnit` and each text-bearing atom's
  `resolvedGeometryStyle` retain the exact geometry-affecting typography,
  including separate `measurementStyleKey` and `effectiveShapingStyleKey`.
- Added one shared effective shaping-style identity through
  `createVNextTextBlockEffectiveShapingStyleIdentityV1(...)`. Initial Flow binds
  `paragraphFontFamilyKey` and authoritative per-face keys, while the actual
  `createFlowDocTextEngineMultiRunLayoutV1(...)` producer calls the same helper.
  Plain, supported styled, misleading-display-label, and unused-face requests
  retain exact direct-MR1/adapter parity. Valid producer `localStyle` properties
  inserted outside schema order retain the same exact layout and fingerprint
  chain.
- The supported local style subset resolves font size, color, weight, and style
  exactly by authoritative family key rather than display family; authored local
  `fontFamilyKey` overrides remain blocked as `resolved-run-typography`.
- Added strict canonical validation for retained root and nested facts,
  lowercase font digests, and property-order-independent canonical Initial Flow
  fingerprints/context. The adapter preserves the original valid request's own
  enumerable key insertion order in a data-only contained request, snapshots
  own data descriptors without reading accessors, and accepts only ordinary
  dense data arrays with the standard `Array.prototype`, standard own
  length/index descriptors, and canonical indices. Custom prototypes, holes,
  custom string or symbol properties, accessors, cycles, and malformed lengths
  block before output allocation or declared-length iteration. The strict
  data-only adapter envelope accepts only plain/null-prototype roots with
  exactly the own data fields `initialFlow` and `legacyRequest`; symbols,
  hidden/custom extras, and accessors block with zero reads. Complete Zod
  validation and canonical semantic equality still precede unchanged MR1,
  which receives the representation-preserving snapshot. Unknown fields and
  malformed runtime input remain blocked. Both blank and whitespace-only
  `layoutId` values stop before legacy invocation with `layoutId: "unavailable"`;
  valid nonblank ids remain unchanged.
- An effectively rendered-empty field and hard-break-only content require the
  empty-layout contract. Independent list-only and inline-image-only classifier
  and adapter proofs block before legacy MR1.
- Bound process-local classifier provenance to the exact recursively frozen
  flow object. This is not cross-process serialization authority.
- Added an explicit text-subset adapter that preserves exact existing MR1
  layout parity and rejects unsupported, stale, cloned, context-drifted, or
  production-bound inputs.
- The Initial Flow handoff remains non-production and non-publishable:
  publication and production activation remain NO-GO, and every accepted result
  reports `mayPublishLayout: false`.
- Evidence: `docs/LIVE_DRAFT_MR1_COMPLETE_GEOMETRY_BOUNDARY.md`,
  `packages/text-engine-rust-wasm/src/multiRunLayout.ts`,
  `src/layout/textBlockEffectiveShapingStyleIdentityV1.ts`,
  `tests/textBlockInitialFlowParentRegionV1.test.ts`,
  and `tests/textBlockInitialFlowInputV1.test.ts`. The final focused slice
  passed 5 test files / 115 tests; the section-bounded documentation guard passed
  1 test file / 5 tests; the full gate passed 408 test files / 2028 tests.
  Combined focused verification: 6 files / 120 tests.
- Later cleanup note: the initial-flow text-only legacy adapter is retired from
  current core, including its source, public export, and direct test.
- Next: Phase 2 Persistent Flow Tree Foundation. Do not start spatial wrapping,
  list decoration, inline-image geometry, empty-block geometry, Editor, Backend,
  table auto-fit, publication, or production activation in this checkpoint.

## MR1-Q Persistent Flow Tree Foundation

Status: accepted as a bounded Core/MR1 QA checkpoint. Editor product binding,
Backend binding, publication, and production remain NO-GO.

Final whole-branch fix-wave base: `8306a7d`.

- Added a versioned immutable Persistent B+ flow rope with fixed 256-unit item,
  eight-item leaf, and eight-child branch bounds; offset-independent items,
  balanced equal leaf depth, and Core-owned Merkle fingerprints are retained.
- Added process-local summary-guided path-copy updates with prefix/suffix
  structural sharing, in-path reused/created identity accounting, shallow local
  created-node byte evidence, exact revision/context/provenance gates, and no
  complete tree rebuild or complete semantic pass.
- Added bounded semantic-window checkpoints with lazy arbitrary-position
  composition and bound semantic proof facts to the exact retained tree,
  accepted update fingerprint, and resulting tree fingerprint. Four accepted
  actual-WASM insertion, Bold, field-adjacent, and deletion rows report
  `completeNextSemanticPassCount: 0`, reuse untouched nodes, and preserve exact
  optional full-oracle QA parity.
- Retained snapshots now expose deterministic persistent-tree item/leaf/node
  summaries. The accepted 4,959-unit fixture begins at 21 items / 3 leaves / 4
  nodes; accepted edits reuse 2 nodes, create 2 or 3 nodes, reposition 2 or 3
  affected lines, and prove two stable lines at reconvergence.
- Text, mixed Text Runs, resolved fields, generated page numbers, and hard
  breaks are tree-ready. Inline images, lists/list decoration, empty blocks,
  positioned objects, spatial wrapping, Columns/Table integration, and table
  auto-fit remain blocked or not present.
- `stagedCoverageCompatible: true` means stable ordered identity and resumable
  references only. B1 is compatibility evidence; Editor staged apply/state is
  not implemented.
- The complete next semantic checkpoint pass is removed. Complete next-request
  validation, complete shaping/break/line arrays, optional QA materialization,
  and product memory/frame budgets remain later work.
- Evidence: `docs/LIVE_DRAFT_MR1_PERSISTENT_FLOW_FOUNDATION.md`,
  `tests/liveDraftMr1PersistentFlowFoundation.test.ts`,
  `tests/textBlockPersistentFlowTreeV1.test.ts`,
  `tests/textBlockPersistentFlowUpdateV1.test.ts`,
  `tests/textBlockMultiRunSemanticWindowV1.test.ts`, and
  `tests/textEngineIncrementalRangeExecutionV1.test.ts`.
- Verification: the MR1-Q documentation guard passed 1 file / 3 tests; the
  combined focused gate passed 7 files / 33 tests; the reverted-timeout default
  gate passed 3 files / 22 tests; `npm run type-check` and `git diff --check`
  passed; the final full `npm run check` passed 412 files / 2,047 tests.
- Next: `Phase 3: Core Spatial Wrapping 3A`. Do not start list/image geometry,
  empty-block geometry, Editor, Backend, Columns/Table integration, table
  auto-fit, publication, or production activation inside Phase 3.

## Phase 3 Core Spatial Wrapping 3A

`Phase 3: Core Spatial Wrapping 3A` is accepted as a bounded Core synthetic QA
checkpoint at implementation baseline `a249b30`.

- Added a strict `core-synthetic-qa-only` immutable persistent y-interval
  treap, deterministic fingerprints, subtree maximum-bottom pruning, and exact
  process-local tree/request/index provenance.
- Added a deterministic Flow Region Provider for left/right/middle/multiple
  rectangular exclusions, top/bottom barriers, overlay neutrality, and
  full-width zero-space advancement.
- Added break-safe multi-interval spatial line placement, mandatory hard-break
  closure, Core-derived fragment geometry, and monotonic expanded-band
  stabilization without trusting retained `request.lines` as new spatial
  decisions.
- At the original Phase 3 baseline, path-copy move/resize updates covered exact
  old/new affected-band unions, `completeIndexRebuildCount: 0`, and bounded
  untouched-subtree identity reuse. This did not claim spatial-line reuse or
  reconvergence.
- Empty and overlay-only indexes retain the zero-query fast path. A 1,024-entry
  narrow query proves pruning without a complete scan. The no-exclusion
  fixture retains exact accepted MR1-Q line range/y/fragment parity.
- Every accepted boundary retains `mayPublishLayout: false`,
  `productionBinding: false`, and `stagedEditorApply: false`.
- List decoration, inline-image geometry, empty-block geometry, Editor/Backend binding, Columns/Table integration, Table auto-fit, publication, production activation, and Editor staged apply remain NO-GO.
- Evidence: `docs/LIVE_DRAFT_MR1_SPATIAL_WRAPPING_3A.md`,
  `tests/liveDraftMr1SpatialWrapping3a.test.ts`,
  `tests/textBlockSpatialIndexV1.test.ts`,
  `tests/textBlockFlowRegionProviderV1.test.ts`, and
  `tests/textBlockSpatialWrappingLayoutV1.test.ts`.
- Later cleanup note: the spatial index update V1 wrapper is retired from
  current core, including its source, public export, and direct test.
- Later cleanup note: the spatial wrapping V1 implementation is internal-only
  in current core; retained characterization evidence imports it directly.
- Verification: focused Phase 3 gate passed 8 files / 46 tests;
  `npm run type-check` and `git diff --check` passed; final full
  `npm run check` passed 417 files / 2,078 tests including type-check.
- Next: `Phase 4: Initial TextBlock Geometry`.

## Phase 4A Initial TextBlock Authored Box Geometry

Status: accepted as a bounded Core-only authored-box geometry checkpoint at
implementation baseline
`d39d61f8c16b46b4fb709d045890ab9ee8677fbd`.

- Added one shared exact Initial Flow/request binding inspector used by both
  the existing text-only adapter and Phase 4A composition.
- Added exact point-to-layout-unit authored outer-width, content-width, and
  inset equations. Content width must equal the request width; independently
  converted left/content/right edges must equal outer width.
- Preserved content-local Phase 3 behavior unchanged at y zero and emitted a
  separately fingerprinted box-local Phase 4A projection for lines, intervals,
  placements, and fragments without changing source mappings.
- Added exact top/bottom inset ownership and auto-height from the larger of
  Phase 3 flow height and retained spatial-index `maximumBottomLayoutUnit`.
  Overlay envelopes can extend height without excluding flow.
- Retained the empty and overlay-only zero-query fast path and all Phase 3
  algorithms/fingerprints. This is no spatial-line reuse/reconvergence claim.
- Added fail-closed capability, production, provenance, stale, accessor,
  unsafe-arithmetic, tamper, deterministic-fingerprint, and process-local
  inspection evidence without partial blocked geometry.
- Every accepted result retains `mayPublishLayout: false`,
  `productionBinding: false`, and `stagedEditorApply: false`; positioned-object
  authority remains `core-synthetic-qa-only`.
- List decoration, inline-image geometry, empty-block geometry, Editor/Backend binding, Columns/Table integration, Table auto-fit, publication, production activation, and Editor staged apply remain NO-GO.
- Evidence: `docs/LIVE_DRAFT_MR1_AUTHORED_BOX_GEOMETRY_4A.md`,
  `tests/liveDraftMr1AuthoredBoxGeometry4a.test.ts`,
  `src/layout/textBlockInitialFlowRequestBindingV1.ts`,
  `src/layout/textBlockAuthoredBoxGeometryContractV1.ts`,
  `src/layout/textBlockAuthoredBoxGeometryV1.ts`, and
  `tests/textBlockAuthoredBoxGeometryV1.test.ts`.
- Later cleanup note: the authored box geometry V1 implementation is
  internal-only in current core; retained characterization evidence imports it
  directly.
- Verification: focused Phase 4A gate passed 8 files / 131 tests;
  `git diff --check` passed; full `npm run check` passed 420 files / 2,114
  tests including type-check.
- Next: historical pointer fulfilled by the accepted Phase 4B handoff at
  `docs/LIVE_DRAFT_MR1_INLINE_IMAGE_GEOMETRY_4B.md`.

## Phase 4B Inline Image Line-Box Geometry

Status: implemented and accepted as the bounded Core-only Phase 4B checkpoint
at accepted Task 11 implementation head `f8eb3ba`.

- Added the closed V2 flow-atom path for text clusters, hard breaks, and inline
  images, with shared persistent-flow, spatial-region, wrapping, and
  authored-box kernels beneath frozen V1 and V2 adapters.
- Producer-shaped V2 evidence preserves U+FFFC image slots and hard breaks
  outside shaping. The Node-native and Worker-WASM MR1 rows agree on exact Core
  evidence and break offsets.
- Image-only, mixed, adjacent, multiple, Thai/Latin, field/page-number,
  hard-break, mixed-size, and alignment cases are retained. The spatial path
  covers multi-interval placement, barriers, overlays, zero-space advancement,
  expanded-band requery, and move/resize affected bands.
- The authored-box V2 projection includes image fragments and auto-height;
  fixed-height, overflow, and clipping remain rejected.
- Exact Initial Flow/evidence/tree/index/provider/layout object binding,
  capability checks, immutable registration, and fingerprint validation reject
  cloned, changed, accessor-shaped, mutable, and production-bound inputs.
- Evidence: `docs/LIVE_DRAFT_MR1_INLINE_IMAGE_GEOMETRY_4B.md`,
  `tests/liveDraftMr1InlineImageGeometry4b.test.ts`,
  `tests/textEngineFlowEvidenceNodeWasmV2.test.ts`, and the V2
  flow/tree/index/provider/layout/authored-box focused tests.
- Verification: the final focused Phase 4B gate passed 10 files / 130 tests.
  The final full `npm run check` passed 434 files / 2,310 tests including
  type-check.
- Phase 5 remains separately authorized; this handoff does not authorize Phase 5 implementation or activation.
- List decoration, empty-block geometry, Editor/Backend binding, Columns/Table integration, Table auto-fit, publication, production activation, and Editor staged apply remain NO-GO.

## Legacy Test Markers

| 100 | Text measurement engine spike boundary | done |

| 101 | Font registry spike boundary | done |

| 102 | Font ownership clearing boundary | done |

| 103 | Font asset copy/hash evidence | done |

| 104 | Measurement profile identity contract | done |

| 105 | Rust/WASM text engine boundary decision | done |

| 106 | Thai corpus/oracle boundary | done |

| 107 | Rustybuzz shaping smoke boundary | done |

| 108 | Text engine adapter SPI boundary | done |

| 109 | Text engine evidence acceptance boundary | done |

| 110 | Text engine measurement draft handoff boundary | done |

| 111 | Text engine adapter lane close audit | done |

| 112 | Text engine adapter package scaffold | done |

| 113 | Text engine rustybuzz smoke package boundary | done |

| 114 | Text engine rustybuzz raw mapping boundary | done |

| 115 | Text engine rustybuzz smoke corpus boundary | done |

| 116 | WYSIWYG re-entry audit | done |

| 121 | WYSIWYG execution re-baseline audit | done |

| 126 | WYSIWYG execution close audit | done |

| 129 | Rich inline persistence/session boundary | done |

| 130 | Rich inline live/exact parity audit | done |

| 131 | Five-lane project progress index | done |

| 132 | ICU4X line-break evidence manifest boundary | done |

| 133 | Multi-line wrap evidence boundary | done |

| 134 | WASM / ICU4X runtime identity and digest boundary | done |

| 135 | Renderer-backed text measurement provider bridge | done |

| 136 | External minimal PDF artifact spike package | done |

| 137 | Artifact manifest and storage boundary | done |

| 139 | Durable layout and artifact job boundary | done |

| 140 | Storage adapter interface boundary | done |

| 141 | Product editor integration smoke boundary | done |

| 142 | Browser timing smoke boundary | done |

| 143 | WYSIWYG primary input decision gate | done |

| 144 | Granular rich inline operation decision boundary | done |

| 145 | First vertical slice release candidate plan | done |

| 146 | First vertical slice RC orchestrator boundary | done |

| 147 | RC scenario fixture boundary | done |

| 148 | RC measurement selection and drift gate | done |

| 149 | RC artifact production bridge | done |

| 150 | RC storage simulation boundary | done |

| 151 | End-to-end RC report smoke | done |

| 152 | RC close audit | done |

| 153 | Hybrid managed card input implementation plan | done |

| 154 | Input runtime ownership boundary | done |

| 155 | Active text-block island boundary | done |

| 156 | Hybrid command policy boundary | done |

| 157 | DOM binding smoke boundary | done |

| 158 | Active island commit bridge smoke | done |

| 159 | Field chip command boundary | done |

| 160 | Paste/delete preflight boundary | done |

| 161 | Renderer segment and hit-test evidence boundary | done |

| 162 | Hybrid input foundation close audit | done |

| 163 | Hybrid input browser QA boundary | done |

| 164 | Optional browser driver smoke boundary | done |

| 165 | Hybrid input browser evidence close audit | done |

| 166 | Hybrid input hardening threshold plan | done |

| 167 | Browser matrix decision | done |

| 168 | Guarded input integration plan | done |

| 169 | Guarded input runtime slice 1 | done |

| 170 | Guarded input paste/delete/field-chip slice | done |

| 171 | Guarded input integration close audit | done |

| 172 | Concrete storage choice gate | done |

| 173 | External file-backed storage adapter slice | done |

| 174 | Artifact byte store slice | done |

| 175 | Storage-backed RC roundtrip smoke | done |

| 176 | Backend route contract to storage binding | done |

| 177 | Artifact job execution slice | done |

| 178 | PDF renderer decision gate | done |

| 179 | Measurement rollout gate | done |

| 180 | Internal alpha vertical slice | done |

| 181 | Internal alpha close audit and documentation consolidation gate | done |

| 182 | V1 hardening backlog triage gate | done |

| 183 | Measurement digest parity drift hardening gate | done |

| 184 | V1 measurement fixture evidence matrix gate | done |

| 185 | Measurement evidence summary manifest gate | done |

| 186 | Measurement evidence summary manifest fixture stub gate | done |

| 187 | Measurement evidence coverage gap triage gate | done |

| 188 | Text engine runtime identity digest evidence builder gate | done |

| 189 | Text engine runtime identity digest evidence population gate | done |

| 190 | Text engine WASM artifact digest pinning gate | done |

| 191 | Text engine WASM artifact build output gate | done |

| 192 | Text engine WASM build toolchain readiness gate | done |

| 193 | Text engine WASM toolchain acquisition gate | done |

| 194 | Text engine WASM toolchain optional readiness smoke | done |

| 195 | Text engine WASM artifact production gate | done |

| 195A | Text engine WASM toolchain provisioning bootstrap gate | done |

| 195B | Text engine WASM toolchain provisioning execution gate | done |

| 195C | Text engine WASM toolchain version compatibility gate | done |

| 195D | Text engine WASM toolchain Rust upgrade execution gate | done |

| 195F | Text engine WASM bindgen export dependency gate | done |

| 195G | Text engine WASM artifact production retry after bindgen gate | done |

| 196 | Artifact digest pinning execution | done |

| 197 | Native evidence summary gate | done |

| 198 | WASM evidence summary gate | done |

| 199 | Native/WASM parity summary gate | done |

| 200 | Renderer-backed drift summary gate | done |

| 201 | Numeric drift threshold decision | done |

| 202 | Accepted summary manifest population | done |

| 203 | Measurement hardening close audit | done |

| 204 | Template variable render API planning gate | done |

| 205 | Template publish version boundary gate | done |

| 206 | Template publish validation evidence gate | done |

| 207 | Template publish accepted version metadata gate | done |

| 208 | Template publish close audit | done |

| 209 | Variable schema data contract planning gate | done |

| 210 | Variable reference discovery gate | done |

| 211 | Variable schema metadata shape gate | done |

| 212 | Data contract validation policy gate | done |

| 213 | Required missing default value policy gate | done |

| 214 | Variable compatibility policy gate | done |

| 215 | Variable schema data contract close audit | done |

| 216 | Render API contract planning gate | done |

| 217 | Render API request envelope contract gate | done |

| 218 | Render API response status contract gate | done |

| 219 | Render-readiness validation policy gate | done |

| 220 | Artifact pointer job status placeholder policy gate | done |

| 221 | Render API error blocker vocabulary gate | done |

| 222 | Render API contract close audit | done |

| 223 | Mini infrastructure close audit | done |

| 224 | Runtime binding implementation planning gate | done |

| 225 | Core retention map | done |

| 226 | Core service consumer map | done |

| 227 | Backend route parity evidence | done |

| 228 | Core route de-export plan | done |

| 229 | Core route deprecation window | done |

| 230 | Core route retained-contract test rewrite | done |

| 231 | Core route Window C public export removal | done |

| 232 | Core session rich workflow split map | done |

| 233 | Core session package snapshot split | done |

| 234 | Core rich inline replay validation split | done |

| 235 | Core submission identity/status split | done |

| 236 | Core backend consumer rewire closeout | done |

| 237 | Core non-route deprecation window | done |

| 238 | Core non-route retained-test rewrite | done |

| 239 | Core non-route public-entrypoint test cleanup | done |

| 240 | Core non-route package-lane cleanup | done |

| 241 | Core non-route public export narrowing | done |

| 242 | Core compatibility source cleanup audit | done |

| 243 | Core vertical-slice retained storage payload rewrite | done |

| 244 | Core storage adapter generic payload rewrite | done |

| 245 | Core compatibility composition test rewrite | done |

| 246 | Core compatibility source deletion | done |

| 247 | Node v1 inventory audit | done |

| 248 | Text-block v1 grammar lock | done |

| 249 | Text-block v1 grammar validator and normalizer | done |

| 251 | Text-block v1 version and migration decision | done |

| 252 | Image source contract | done |

| 254 | Document v4 image target schemas | done |

| 255 | Document v4 target schema and containment | done |

| 256 | Package v3/document v4 parser | done |

| 257 | Package v2/document v3 to package v3/document v4 migration | done |

| 258 | Cross-repo version capability reporting | done |

| 265 | Document v4 node-readiness architecture lock | done |

| 268 | Structure Definition and Document Instance architecture lock | done |

| 269 | Structure Definition and Document Instance v4 impact audit | done |

| 270 | Structure lifecycle identity contracts | done |

| 271 | Structure Policy and effective capability contracts | done |

| 69 | Structural projection boundary | done |

| 70 | Structural packet contract boundary | done |

| 77 | Structural Runtime close audit | done |

| 78 | Draft runtime module boundary | done |

| 79 | Text draft layout push boundary | done |

| 80 | Draft IME hardening boundary | done |

| 81 | Rich inline style patch boundary | done |

| 82 | Toolbar state boundary | done |

| 83 | Field chip inline boundary | done |

| 84 | Style-aware history boundary | done |

| 85 | WYSIWYG close audit | done |

| 87 | Session storage boundary | done |

| 88 | Durable history / undo-redo boundary | done |

| 89 | Key history / migration boundary | done |

| 90 | Repeat / collection / form-slot boundary | done |

| 91 | Submission state boundary | done |

| 92 | Persistence close audit | done |

| 93 | PDF renderer adapter boundary | done |

| 94 | DOCX renderer adapter boundary | done |

| 95 | Renderer-backed text measurement boundary | done |

| 96 | Pausable layout job engine | done |

| 97 | Deep table split boundary | done |

| 98 | Final TOC / page resolution boundary | done |

| 99 | Exact output close audit | done |

A trusted runner and concrete transactional candidate remain Phase

consumer groups

controlled de-export/deprecation window

demand-free `output-limit` continuation

Exact-window advancement remains Phase 389

## LIVE-DRAFT-MR1-F Multi-Line Multi-Glyph Canvas

## LIVE-DRAFT-MR1-G Rapid-Edit Lifecycle

## LIVE-DRAFT-MR1-H Multi-Block Scheduling And Frame Gate

## LIVE-DRAFT-MR1-I Intra-TextBlock Incremental Reflow Analysis

move-and-retain

Next recommended work: Render API Request Envelope Runtime Binding Gate.

Next recommended work: Runtime Binding / Implementation Planning Gate.

## PDF-EXPORT-REALDOC-E.0 DocGen Architecture Realignment

## PDF-EXPORT-REALDOC-E.1 Published Structure Generation Input

## PDF-EXPORT-REALDOC-E.2 Generation Mapping And Validation Runtime

## PDF-EXPORT-REALDOC-E.3 Bounded Local Backend DocGen Admission

## PDF-EXPORT-REALDOC-E.5.0 Document Workspace Product Contract

## PDF-EXPORT-REALDOC-E.5.1 Local Document Library

## PDF-EXPORT-REALDOC-E.5.2 Shared Workspace Tabs

## PDF-EXPORT-REALDOC-E.5.3 Core Test-Input Projection

## PDF-EXPORT-REALDOC-E.5.4 Temporary Generated Form

## PDF-EXPORT-REALDOC-E.5.5 Temporary JSON And Mapping Preparation

## PDF-EXPORT-REALDOC-E.5.6 Published Preview Binding

## PDF-EXPORT-REALDOC-E.5.8 Preview Lifecycle UX

## PDF-EXPORT-REALDOC-E.5.9 Form/API Parity

## Phase 131 Five-Lane Project Progress Index

## Phase 182 V1 Hardening Backlog Triage Gate

## Phase 183 Measurement Digest Parity Drift Hardening Gate

## Phase 184 V1 Measurement Fixture Evidence Matrix Gate

## Phase 185 Measurement Evidence Summary Manifest Gate

## Phase 186 Measurement Evidence Summary Manifest Fixture Stub Gate

## Phase 187 Measurement Evidence Coverage Gap Triage Gate

## Phase 188 Text Engine Runtime Identity Digest Evidence Builder Gate

## Phase 189 Text Engine Runtime Identity Digest Evidence Population Gate

## Phase 190 Text Engine WASM Artifact Digest Pinning Gate

## Phase 191 Text Engine WASM Artifact Build Output Gate

## Phase 192 Text Engine WASM Build Toolchain Readiness Gate

## Phase 193 Text Engine WASM Toolchain Acquisition Gate

## Phase 194 Text Engine WASM Toolchain Optional Readiness Smoke

## Phase 195A Text Engine WASM Toolchain Provisioning Bootstrap Gate

## Phase 195B Text Engine WASM Toolchain Provisioning Execution Gate

## Phase 195C Text Engine WASM Toolchain Version Compatibility Gate

## Phase 195D Text Engine WASM Toolchain Rust Upgrade Execution Gate

## Phase 195F Text Engine WASM Bindgen Export Dependency Gate

## Phase 195G Text Engine WASM Artifact Production Retry After Bindgen Gate

## Phase 195 Text Engine WASM Artifact Production Gate

## Phase 196 Artifact Digest Pinning Execution

## Phase 197 Native Evidence Summary Gate

## Phase 198 WASM Evidence Summary Gate

## Phase 199 Native/WASM Parity Summary Gate

## Phase 200 Renderer-backed Drift Summary Gate

## Phase 201 Numeric Drift Threshold Decision

## Phase 202 Accepted Summary Manifest Population

## Phase 203 Measurement Hardening Close Audit

## Phase 204 Template Variable Render API Planning Gate

## Phase 205 Template Publish Version Boundary Gate

## Phase 206 Template Publish Validation Evidence Gate

## Phase 207 Template Publish Accepted Version Metadata Gate

## Phase 208 Template Publish Close Audit

## Phase 209 Variable Schema Data Contract Planning Gate

## Phase 210 Variable Reference Discovery Gate

## Phase 211 Variable Schema Metadata Shape Gate

## Phase 212 Data Contract Validation Policy Gate

## Phase 213 Required Missing Default Value Policy Gate

## Phase 214 Variable Compatibility Policy Gate

## Phase 215 Variable Schema Data Contract Close Audit

## Phase 216 Render API Contract Planning Gate

## Phase 217 Render API Request Envelope Contract Gate

## Phase 218 Render API Response Status Contract Gate

## Phase 219 Render Readiness Validation Policy Gate

## Phase 220 Artifact Pointer Job Status Placeholder Policy Gate

## Phase 221 Render API Error Blocker Vocabulary Gate

## Phase 222 Render API Contract Close Audit

## Phase 223 Mini Infrastructure Close Audit

## Phase 224 Runtime Binding Implementation Planning Gate

## Phase 225 Core Retention Map

## Phase 226 Core Service Consumer Map

## Phase 227 Backend Route Parity Evidence

## Phase 228 Core Route De-export Plan

## Phase 229 Core Route Deprecation Window

## Phase 230 Core Route Retained-Contract Test Rewrite

## Phase 231 Core Route Window C Public Export Removal

## Phase 232 Core Session Rich Workflow Split Map

## Phase 233 Core Session Package Snapshot Split

## Phase 234 Core Rich Inline Replay Validation Split

## Phase 235 Core Submission Identity Status Split

## Phase 236 Core Backend Consumer Rewire Closeout

## Phase 237 Core Non-Route Deprecation Window

## Phase 238 Core Non-Route Retained-Test Rewrite

## Phase 239 Core Non-Route Public-Entrypoint Test Cleanup

## Phase 240 Core Non-Route Package-Lane Cleanup

## Phase 241 Core Non-Route Public Export Narrowing

## Phase 242 Core Compatibility Source Cleanup Audit

## Phase 243 Core Vertical-Slice Retained Storage Payload Rewrite

## Phase 244 Core Storage Adapter Generic Payload Rewrite

## Phase 245 Core Compatibility Composition Test Rewrite

## Phase 246 Core Compatibility Source Deletion

## Phase 247 Node v1 Inventory Audit

## Phase 248 Text-block v1 Grammar Lock

## Phase 249 Text-block v1 Grammar Validator And Normalizer

## Phase 251 Text-block v1 Version And Migration Decision

## Phase 252 Image Source Contract

## Phase 254 Document V4 Image Target Schemas

## Phase 255 Document V4 Target Schema And Containment

## Phase 256 Package V3 Document V4 Parser

## Phase 257 Package V2 Document V3 To Package V3 Document V4 Migration

## Phase 258 Cross-Repo Version Capability Reporting

## Phase 265 Document V4 Node-Readiness Architecture Lock

## Phase 268 Structure Definition And Document Instance Architecture Lock

## Phase 269 Structure Definition And Document Instance V4 Impact Audit

## Phase 270 Structure Lifecycle Identity Contracts

## Phase 272 Document Instance Materialization Contract

## Phase 273 Resolution Input Pins

## Phase 274 Resolved Document Projection

## Phase 275 Text-block V4 Authoring Contract

## Phase 276 Text-block V4 Rich-inline Replace

## Phase 277 Text-block V4 Inline Commands

## Phase 278 Text-block V4 Measurement Source Ranges

## Phase 279 Text-block V4 Line Pagination

## Phase 280 Text-block V4 Readiness Close Audit

## Phase 281 Structure Authoring V4 Transport Close Audit

## Phase 282 Columns V4 Architecture Lock

## Phase 289 Columns V4 Readiness Close Audit

## Phase 290 Identity Standard V1 Architecture Lock

## Phase 293 Identity Standard V1 Readiness Close Audit

## Phase 294 Table V4 Semantic Architecture Lock

## Phase 298 Table V4 Semantic Readiness Close Audit

## Phase 299 Table V4 Content Materialization Architecture Lock

## Phase 306 Table V4 Content Materialization Readiness Close Audit

## Phase 307 Table V4 Prepared Cell Fragment Architecture Lock

## Phase 315 Table V4 Prepared Cell Fragment Readiness Close Audit

## Phase 316 Table V4 Synchronized Row Pagination Architecture Lock

## Phase 322 Table V4 Synchronized Row Pagination Readiness Close Audit

## Phase 323 Table V4 Renderer Consumption Architecture Lock

## Phase 327 Table V4 Renderer Consumption Readiness Close Audit

## Phase 328 Table V4 Authoring Lane Architecture Lock

## Phase 333 Table V4 Authoring Lane Readiness Close Audit

## Phase 334 Table V4 Authoring Risk Hardening Architecture Lock

## Phase 337 Table V4 Authoring Risk Hardening Close Audit

## Phase 338 TOC V4 Semantic Lane Architecture Lock

## Phase 341 TOC V4 Semantic Lane Readiness Close Audit

## Phase 342 TOC V4 Measurement Lane Architecture Lock

## Phase 346 TOC V4 Measurement Lane Readiness Close Audit

## Phase 347 TOC V4 Pagination Lane Architecture Lock

## Phase 351 TOC V4 Pagination Lane Readiness Close Audit

## Phase 352 Final TOC V4 Page-Reference Resolution Architecture Lock

## Phase 358 Final TOC V4 Page-Reference Resolution Readiness Close Audit

## Phase 359 V4 Integrated Document Stress Gate Architecture Lock

## Phase 360 V4 Integrated Document Stress Smoke

## Phase 361 V4 Integrated Document Stress Scale Matrix

## Phase 362 V4 Integrated Document Stress Invalidation Matrix

## Phase 363 V4 Integrated Document Stress Failure And Recovery Matrix

## Phase 364 V4 Integrated Document Stress Cross-Repo Gate

## Phase 365 V4 Integrated Document Stress Readiness Close Audit

## Phase 366 Whole-Document V4 Composition Architecture Lock

## Phase 367 Whole-Document V4 Common Fragment-Window Contract

## Phase 368 Text-flow V4 Remainder And Cursor Contract

## Phase 369 Utility And Media V4 Atomic Fragment Contracts

## Phase 370 Columns Table And TOC Common Adapter Readiness Lock

## Phase 371 TOC V4 Common Composition Adapter

## Phase 372 Columns V4 Bounded Composition

## Phase 373 Table V4 Shared Page Planner

## Phase 374 Table V4 Bounded Cursor

## Phase 375 Table V4 Common Composition Adapter

## Phase 376 Table V4 Composition Hardening

## Phase 377 Table V4 Composition Scale

## Phase 378 Table V4 Composition Readiness Close Audit

## Phase 379 Sequential Whole-Document V4 Composer Architecture Lock

## Phase 380 Sequential Whole-Document V4 Contracts

## Phase 381 Sequential Whole-Document V4 Ordered Scheduling

## Phase 382 Sequential Whole-Document V4 Recovery

## Phase 383 Sequential Whole-Document V4 Finalization And Scale

## Phase 384 Sequential Whole-Document V4 Readiness Close Audit

## Phase 385 Backend Durable Composition Scheduler Architecture Lock

Phase 386+:

## Phase 386 Backend Durable Composition Scheduler Contracts

## Phase 387 Backend Durable Composition Scheduler Repository

## Phase 388 Backend Durable Composition Scheduler Initialization

## Phase 389 Backend Durable Composition Scheduler Advancement

## Phase 390 Backend Durable Composition Scheduler Recovery And Finalization

## Phase 391 Backend Durable Composition Scheduler Scale Readiness

## Phase 392 Backend Durable Composition Repository Conformance

## Phase 393 Backend Durable Composition SQLite Candidate

Pre-Phase 172 Risk / Unknown Register

production admission wiring and performance hardening remain Phase 394

Production repository conformance remains Phase 392

Production scale/readiness remains Phase 391

progress remain Phase 390

Repository and scheduler execution remain Phase 387+

Runtime contracts and repository implementation remain

Source-pinned initialization remains Phase 388

Window B compatibility marker

Window NR-A

Window NR-B

Window NR-C
