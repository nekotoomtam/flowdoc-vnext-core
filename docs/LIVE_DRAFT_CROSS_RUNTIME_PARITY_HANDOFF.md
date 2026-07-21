# Live Draft Cross-Runtime Parity Handoff

Status: implementation handoff; runtime behavior is not changed by this
document.

Date: 2026-07-20. Updated through the bounded MR1-M checkpoint on 2026-07-21.

This is a parallel product handoff for FlowDoc Live Draft Preview. It does not
replace `docs/NEXT_PHASE_POINTER.md` or change the existing Core phase pointer.

## Objective

Make Form editing update a page-shaped Draft Preview immediately in the
browser, while keeping Backend generation authoritative for Published/API PDF
output.

The browser and Backend should eventually use the same canonical document,
layout, measurement-profile, font, shaping, line-break, and pagination
contracts. They may use different final paint targets:

- Editor paints the shared display list to Canvas;
- Backend paints the shared measured draw contract to PDF.

The goal is shared layout truth, not byte-identical Canvas and PDF artifacts.

## Locked Product Decision

```text
Form edit in Editor
  -> memory-only canonical Draft candidate
  -> debounced Browser Worker request
  -> shared Core layout with an injected browser WASM text measurer
  -> revision-pinned page/display-list result
  -> Canvas Draft Preview

Explicit Published/API generation
  -> Backend admission and canonical validation
  -> shared Core layout with the accepted server text measurer
  -> measured draw contract
  -> protected PDF artifact lifecycle
```

The following rules are locked for this lane:

1. Form typing must not create a Backend request for every keystroke.
2. Backend generation remains the authoritative Published/API result.
3. Browser DOM, CSS, and native Canvas text measurement are not pagination
   truth.
4. Core remains UI-neutral and must not import browser, React, Canvas, PDF,
   Rust, or WASM runtime dependencies.
5. The external text-engine adapter owns browser/worker and Node runtime
   loading and injects measurement facts into Core.
6. Editor may call the same Core layout contracts, but it must not become the
   authority for publication identity, protected admission, or PDF artifacts.
7. Approximate output must never be labeled exact.
8. No 69C-, invoice-, or form-specific field or layout rule may enter the
   generic runtime.

## Current Baseline

Baseline commits when this handoff was written:

| Repository | Commit | Current responsibility |
| --- | --- | --- |
| `flowdoc-vnext-core` | `c0b5ea7` | Core-owned incremental window acceptance, affected-line positioning, and semantic/physical composition parity |
| `flowdoc-vnext-editor` | `43dcebb` | real-Chrome six-range Regular/Bold oracle evidence, diagnostic timing, and fail-closed scope proof |
| `flowdoc-vnext-backend` | `280c4ff` | trusted admission, mapping, generation lifecycle, durable local operation recovery, PDF rendering and delivery |

The immediately preceding MR1-I implementation evidence remains pinned at
Core `78810c5` and Editor `0a5c816`; later MR1-J/MR1-K/MR1-L/MR1-M commits build
on those accepted oracle-analysis facts.

### Core Truth

- Both Editor and Backend depend on `@flowdoc/vnext-core`.
- Core exposes canonical schemas, fingerprinting, measured pagination, renderer
  consumption, measurement-profile identity, text-engine evidence acceptance,
  and `createVNextRendererBackedTextMeasurer(...)`.
- `packages/text-engine-rust-wasm` now exists and records Node-native,
  browser-WASM, and worker-WASM runtime identities.
- A pinned WASM digest and a minimal accepted evidence subset exist.
- The current Measurement Hardening close audit accepts only a mini
  infrastructure checkpoint: Thai line-break core and one canonical Latin
  paragraph row.
- The full v1 measurement matrix is still partial.
- Default `measureVNextText(...)` replacement and production renderer-backed
  measurement binding remain blocked.

Historical documents may say that no concrete adapter or WASM digest exists.
Those statements describe earlier phases. Use
`docs/MEASUREMENT_HARDENING_CLOSE_AUDIT.md` as the newer status source, while
preserving the package boundary defined by
`docs/RUST_WASM_TEXT_ENGINE_BOUNDARY.md`.

### Editor Truth

- Editor imports Core contracts and canonical helpers through
  `src/core/coreAdapter.ts`.
- Editor does not currently run the accepted layout/text-measurement pipeline
  for Form typing.
- `layout.live` exists as job/command scaffolding, and tests still describe a
  `Live layout placeholder completed` result.
- Draft/Published generation currently requires an explicit generation action.
- The blank page labeled `Exact preview not generated` is therefore an honest
  placeholder, not a live document preview.
- Completed Backend PDFs are rendered as page canvases with PDF.js. That is an
  artifact viewer, not the Live Draft layout engine.

### Backend Truth

- Backend imports Core contracts throughout admission, composition,
  generation, storage, and PDF export.
- Backend binds `@flowdoc/pdf-renderer-pilot`, which depends on both Core and
  `@flowdoc/text-engine-rust-wasm`.
- The local 69C path has accepted deterministic evidence for its tested scope,
  including a 10-page PDF.
- The local renderer still reports `productionBinding: false`; production
  activation remains NO-GO.

### Important Conclusion

Shared Core dependency does not yet mean shared live text-engine execution.
Contract parity exists today. Browser/Backend line-break, geometry, and page
parity do not yet have enough evidence for a general exactness claim.

## Runtime Ownership

| Concern | Core | Editor | Backend |
| --- | --- | --- | --- |
| Structure/Data schemas | Own | Consume | Consume and validate |
| Layout and pagination rules | Own | Call | Call |
| Measurement profile identity | Own | Pin and report | Pin and report |
| WASM/Node text-engine loading | Forbid direct ownership | Worker adapter | Server adapter/renderer caller |
| Form state | No | Own, memory-only | Receive only on explicit admission |
| JSON mapping | Contract only | Select payload/profile | Own trusted mapping execution |
| Draft page painting | Display-list contract only | Canvas | Optional exact artifact path |
| Published PDF | Measured draw contract only | Inspect/download | Own generation and bytes |
| Publication identity and authorization | No | No | Own |

## Exactness Vocabulary

The UI and contracts must distinguish these states:

| State | Meaning |
| --- | --- |
| `draft-updating` | A newer Form revision is waiting or running in the worker |
| `draft-current` | Canvas pages match the latest local input revision under the reported profile |
| `draft-approximate` | A fallback path rendered without accepted cross-runtime measurement parity |
| `draft-blocked` | Required font, engine, contract, or layout input is unavailable |
| `published-exact` | Backend completed the accepted measured artifact lifecycle |
| `stale` | Result identity does not match the current Structure/input/profile |

`draft-current` is not automatically `published-exact`. A future
`draft-cross-runtime-exact` claim requires all parity gates in this document.

## Identity And Stale Guards

Every worker request/result must pin at least:

- authoring document id and Structure revision;
- Draft snapshot identity/fingerprint;
- canonical Form candidate fingerprint;
- asset registry fingerprint;
- measurement profile id;
- font manifest and copied-font hashes;
- shaper, segmenter, line-break policy, and WASM digest identities;
- layout pipeline version;
- request revision and request id.

Editor must apply only the newest matching result. A late result from an older
keystroke, Structure revision, profile, font, or worker generation is stale and
must not replace current pages.

## Browser Worker Boundary

The browser implementation should use a dedicated worker so shaping,
measurement, and pagination do not block Form input or scrolling.

The worker protocol should stay JSON-safe except for explicitly transferred
font/WASM bytes. Suggested message families:

```text
live-draft.initialize
live-draft.layout
live-draft.cancel
live-draft.result
live-draft.blocked
live-draft.diagnostics
```

Do not import the worker adapter into Core. The Editor worker imports the
external adapter and injects the accepted measurer into public Core layout
boundaries.

The first implementation should use a QA-only binding and explicit feature
flag. It must not replace the default measurer globally.

## Rendering Boundary

Editor should render Core output rather than re-laying out text with browser
CSS.

Preferred path:

```text
Core measured pages/fragments
  -> renderer consumption/display-list contract
  -> Canvas page renderer
```

Canvas owns painting and hit regions only. Line breaks, glyph positions,
fragment geometry, repeated table headers, page breaks, and overflow decisions
come from the shared measured result.

PDF.js remains the viewer for completed Backend artifacts. It is not reused as
the live authoring renderer.

## Form And JSON Behavior

Form values already exist in Editor memory and may feed a local canonical
candidate into Live Draft Preview without a network round trip.

JSON mapping remains Backend-owned. Editor must not download or execute trusted
mapping programs in the browser. Live pages for JSON may begin only after an
accepted Backend mapping/admission result provides an allowed canonical or
measured projection. This restriction does not block Form-first Live Draft.

Form and adapted API data must still converge on the same canonical content
fingerprint before Published generation, as accepted by E.5.9.

## Implementation Roadmap

### LIVE-DRAFT-XR-0: Baseline And Contract

- Record current placeholder behavior with focused tests.
- Define worker request/result and exactness vocabulary contracts.
- Define the cross-runtime comparison result shape.
- Confirm Core remains dependency-clean.
- Capture current small-document latency and main-thread blocking before
  setting numeric performance budgets.

Exit: contracts and baseline evidence only; no exactness claim.

### LIVE-DRAFT-XR-1: Browser/Worker Engine Smoke

- Audit `@flowdoc/text-engine-rust-wasm` for browser-safe entry points.
- Add separate browser/worker and Node exports if runtime-specific imports are
  currently mixed.
- Load the pinned WASM artifact and copied font bytes in a worker.
- Verify runtime/profile/font/WASM identities before measurement.
- Shape and break one accepted Thai row and one accepted Latin row.

Exit: worker results match accepted Node summaries for the two current rows.

### LIVE-DRAFT-XR-2: One-Block Layout Parity

Status: accepted for three bounded QA workloads on 2026-07-20. This is not a
general parity or production-performance claim.

- Inject the worker-backed measurer into Core without replacing the default.
- Run one text block through the same Core pagination boundary in Worker and
  Node.
- Compare break offsets, line boxes, fragment geometry, page count, warnings,
  and deterministic fingerprints.
- Fail closed on identity mismatch.

Exit: one-block Node/Worker parity is accepted under one pinned profile.

### LIVE-DRAFT-XR-3: Form-To-Live-Draft Binding

Status: accepted for one QA-only memory Form scalar on 2026-07-20. This is not
a Canvas, whole-document, Published/API, or production binding claim.

- Project the latest Form candidate into a revision-pinned worker request.
- Debounce bursts without losing the final value.
- Cancel or ignore obsolete work.
- Preserve the previous valid pages while the next revision is running.
- Expose updating, current, approximate, blocked, and stale states honestly.

Exit: typing changes the Draft page without creating a Backend request per
keystroke.

### LIVE-DRAFT-XR-4: Canvas Page Renderer

Status: accepted for bounded QA-only plain text-line Canvas pages on
2026-07-21. This is not a whole-document or glyph-pixel parity claim.

- Paint shared display-list output to stable A4 page canvases.
- Support text, styled runs, field values, images, tables, and repeated headers
  only as each contract becomes accepted.
- Add bounded zoom and page virtualization.
- Keep page dimensions stable while content updates.

Exit: the first accepted fixtures are nonblank, readable, and visually stable
at desktop and mobile widths.

### LIVE-DRAFT-XR-5: Cross-Runtime Matrix

Status: partial checkpoint accepted for nine bounded Node/real-Browser Worker
rows on 2026-07-21. The full release-gating matrix remains
`partial-not-accepted` because retained blockers still exist.

Expand evidence to every release-gating row listed in
`docs/MEASUREMENT_HARDENING_CLOSE_AUDIT.md`, including:

- mixed Thai/Latin text;
- styled inline font mapping;
- field-chip adjacency;
- constrained table cells;
- repeated table headers;
- narrow/wide width pairs;
- forced line/page breaks;
- long blocks and large documents;
- renderer-backed drift and digest parity summaries.

Exit: the full required matrix is accepted before any default-measurer or
general exactness claim.

### LIVE-DRAFT-XR-6: Incremental Layout And Scale

- Invalidate from the earliest affected block/page rather than reflowing the
  entire document for every edit.
- Chunk worker results and virtualize off-screen page painting.
- Test rapid typing, cancellation, images, repeated collections, and table
  growth.
- Run the 200-page REALDOC-G workload and record p50/p95 timings, peak memory,
  long tasks, changed-page count, and stale-result count.

Exit: measured scale evidence exists; numeric budgets are accepted from real
baseline data rather than guessed in advance.

### LIVE-DRAFT-XR-7: Published/API Reconciliation

- Send the same canonical Form content through Backend admission.
- Compare browser Draft and Backend measured identities.
- Explain any accepted difference rather than silently replacing pages.
- Keep Backend output authoritative and retain the existing operation,
  cancellation, retry, diagnostics, and download lifecycle.

Exit: Form Live Draft and Published/API output have traceable shared identities
and accepted drift policy.

## Acceptance Gates

Do not claim cross-runtime exactness until all of these pass:

1. Same Core layout/pagination version.
2. Same measurement profile id.
3. Same copied-font hashes and fallback policy.
4. Same pinned shaper, segmenter/data, line-break policy, and WASM identities.
5. Identical accepted break offsets and page count.
6. Geometry matches the accepted numeric drift policy.
7. Display-list/measured-contract fingerprints match where the contract
   requires equality.
8. All required Thai, Latin, mixed, styled, field, table, and long-document
   matrix rows pass in Node and Browser Worker.
9. Stale worker results cannot update the UI.
10. Browser main-thread responsiveness and 200-page evidence are recorded.

PDF bytes and Canvas pixels do not need identical hashes. Their shared layout
and paint-command semantics must be traceable to the same accepted measured
identity.

## Test Strategy

### Core

- dependency-boundary tests;
- injected-measurer tests without default replacement;
- deterministic layout/result fingerprint tests;
- stale/profile/font/WASM mismatch blockers;
- complete release-gating measurement matrix.

### Editor

- worker protocol parser and lifecycle tests;
- debounce, cancellation, revision, and stale-result tests;
- Form edit to latest Canvas result tests;
- no per-keystroke Backend request test;
- Canvas nonblank pixel checks and page geometry checks;
- desktop/mobile Playwright screenshots;
- long-document virtualization and rapid-edit tests.

### Backend

- same-profile Node measurement evidence;
- canonical Form/API parity retention;
- measured identity returned with artifact lifecycle facts;
- mismatch/reconciliation diagnostics;
- restart, cancel, retry, and artifact verification regression tests.

### Cross-Repo

- one fixture runner that executes the same canonical input in Node and Browser
  Worker and compares normalized measured output;
- explicit version/digest matrix in retained evidence;
- 69C as one real-document fixture, never as a generic rule;
- REALDOC-G 200-page scale run after correctness gates.

## Risks And Required Responses

| Risk | Required response |
| --- | --- |
| Browser and Node load different font bytes | Fail closed before measurement |
| WASM/runtime imports break Vite or Node | Split runtime-specific package entry points |
| Native and WASM numbers drift | Apply accepted numeric policy and retain evidence |
| Worker result arrives after newer typing | Reject by revision and identity |
| Whole document reflows on every key | Add affected-range invalidation and chunking |
| Canvas visually diverges from display list | Add command-level and pixel QA |
| JSON mapper leaks into browser | Keep mapping Backend-owned |
| Draft is mistaken for Published | Preserve target labels and Backend authority |
| One UAT fixture shapes the engine | Expand matrix before general claims |

## Explicit Non-Goals For The First Slice

- no production activation;
- no default `measureVNextText(...)` replacement;
- no global pagination behavior change;
- no API call per keystroke;
- no browser-owned mapping execution;
- no PDF generation in the browser;
- no collaboration/offline implementation;
- no persisted Form values;
- no schema mutation solely to make the first smoke test pass;
- no claim that the two-row mini checkpoint proves general document parity.

## First Task For The Next Thread

Design and prove the next bounded MR1 oracle-independent adapter execution
checkpoint over the accepted MR1-M Core composition boundary. Do not bind or
publish the product path yet and keep Table work deferred.

1. Read the files under **Required Reading**, including the MR1-M composition
   evidence.
2. Make the external adapter construct the complete next Core request from the
   retained snapshot, contextual range facts, cluster/break splice, and
   affected-line builder without requiring a complete next Core layout as an
   execution input.
3. Call `acceptVNextTextBlockMultiRunIncrementalWindowV1(...)` directly with
   those independently assembled facts. Preserve all runtime/font/profile,
   source, UTF-16, topology, and bounded-window fail-closed gates.
4. Keep complete Core acceptance/materialization as an optional QA oracle and
   prove exact parity for the accepted insertion, Bold, field-adjacent, and
   deletion rows plus boundary/fallback cases.
5. Separate runtime-path work from oracle-only work and record stage timings
   without inventing a budget.
6. Do not remove complete shape/segmentation oracles in the same slice unless a
   separately bounded proof replaces each one.
7. Keep tables, columns, images, default-measurer replacement, Editor product
   binding, whole-document production activation, publication, and glyph-pixel
   exactness out.

## Required Reading

Core:

- `docs/MEASUREMENT_HARDENING_CLOSE_AUDIT.md`
- `docs/RUST_WASM_TEXT_ENGINE_BOUNDARY.md`
- `docs/TEXT_ENGINE_RENDERER_BACKED_PROVIDER_BOUNDARY.md`
- `docs/MEASUREMENT_PROFILE_IDENTITY_CONTRACT.md`
- `docs/LIVE_DRAFT_XR5_SOURCE_SEGMENTS_AND_FORCED_BREAKS.md`
- `docs/LIVE_DRAFT_MR1_MULTI_RUN_LAYOUT_CONTRACT.md`
- `docs/LIVE_DRAFT_MR1_ENGINE_FACTS.md`
- `docs/LIVE_DRAFT_MR1_INCREMENTAL_REFLOW_ANALYSIS.md`
- `docs/LIVE_DRAFT_MR1_CONTEXTUAL_RANGE_FACTS.md`
- `docs/LIVE_DRAFT_MR1_RETAINED_RANGE_PLANNER.md`
- `docs/LIVE_DRAFT_MR1_RANGE_EXECUTION_AND_AFFECTED_LINES.md`
- `docs/LIVE_DRAFT_MR1_INCREMENTAL_CORE_COMPOSITION.md`
- `docs/LIVE_DRAFT_MR1_FRAGMENT_DISPLAY_LIST.md`
- `docs/LIVE_DRAFT_MR1_MULTI_BLOCK_COMPOSITION.md`
- `src/renderer/textMeasurementAdapter.ts`
- `src/pagination/textMeasurement.ts`
- `src/pagination/layoutPipeline.ts`
- `packages/text-engine-rust-wasm/src/index.ts`
- `packages/text-engine-rust-wasm/src/runtimeIdentity.ts`
- `packages/text-engine-rust-wasm/src/rendererBackedProvider.ts`
- `packages/text-engine-rust-wasm/src/multiRunLayout.ts`
- `packages/text-engine-rust-wasm/src/runtimeMr1.ts`
- `packages/text-engine-rust-wasm/src/runtimeMr1Range.ts`
- `packages/text-engine-rust-wasm/src/incrementalLineCheckpoint.ts`
- `packages/text-engine-rust-wasm/src/incrementalRetainedSnapshot.ts`
- `packages/text-engine-rust-wasm/src/incrementalEditRangePlanner.ts`
- `packages/text-engine-rust-wasm/src/incrementalRangeFactSplice.ts`
- `packages/text-engine-rust-wasm/src/incrementalAffectedLineWindow.ts`
- `packages/text-engine-rust-wasm/src/incrementalRangeExecution.ts`
- `src/renderer/textBlockMultiRunDisplayListV1.ts`
- `src/composition/textBlockMultiRunDocumentCompositionV1.ts`
- `src/renderer/textBlockMultiRunDocumentDisplayListV1.ts`

Editor:

- `docs/LIVE_DRAFT_XR5_CROSS_RUNTIME_MATRIX.md`
- `docs/LIVE_DRAFT_MR1_REAL_BROWSER_WORKER.md`
- `docs/LIVE_DRAFT_MR1_CANVAS_PAINT.md`
- `docs/LIVE_DRAFT_MR1_MULTILINE_MULTI_GLYPH.md`
- `docs/LIVE_DRAFT_MR1_RAPID_EDIT_LIFECYCLE.md`
- `docs/LIVE_DRAFT_MR1_MULTI_BLOCK_SCHEDULING.md`
- `docs/LIVE_DRAFT_MR1_INCREMENTAL_REFLOW_ANALYSIS.md`
- `docs/LIVE_DRAFT_MR1_CONTEXTUAL_RANGE_FACTS.md`
- `src/fixtures/live-draft-mr1-real-browser-worker-parity.v1.json`
- `src/fixtures/live-draft-mr1-multi-run-canvas-paint.v1.json`
- `src/fixtures/live-draft-mr1-multiline-multi-glyph-canvas.v1.json`
- `src/fixtures/live-draft-mr1-rapid-edit-lifecycle.v1.json`
- `src/fixtures/live-draft-mr1-multi-block-scheduling.v1.json`
- `src/fixtures/live-draft-mr1-incremental-reflow-analysis.v1.json`
- `src/fixtures/live-draft-mr1-contextual-range-facts.v1.json`
- `src/qa/liveDraftMr1Evidence.worker.ts`
- `src/editor/liveDraft/liveDraftMultiRunCanvasPainter.ts`
- `src/editor/liveDraft/liveDraftMultiRunController.ts`
- `src/editor/liveDraft/liveDraftMultiBlockImpact.ts`
- `src/editor/liveDraft/liveDraftMultiBlockScheduler.ts`
- `src/editor/liveDraft/liveDraftMultiBlockController.ts`
- `src/editor/liveDraft/liveDraftMultiBlockCanvasPainter.ts`
- `src/qa/liveDraftXr5Matrix.ts`
- `scripts/run-live-draft-xr5-evidence.mjs`
- `src/core/coreAdapter.ts`
- `src/editor/jobs/jobTypes.ts`
- `src/editor/commands/commandExecutor.ts`
- `src/components/preview/PreviewTestInputView.tsx`
- `src/app/usePublishedPreviewGeneration.ts`
- `docs/REALDOC_DOCUMENT_WORKSPACE_PRODUCT_CONTRACT.md`

Backend:

- `src/docgen/docGenLocalDraftPreview.ts`
- `src/docgen/docGenLocalPublishedPreview.ts`
- `src/pdfExport/pdfExportLocalRenderer.ts`
- `src/localPdfExport/pdfExportRealdocE63Runtime.ts`

## Handoff Prompt

```text
Continue FlowDoc from
flowdoc-vnext-core/docs/LIVE_DRAFT_CROSS_RUNTIME_PARITY_HANDOFF.md.

Read the Required Reading section and inspect all three repositories before
editing. Continue LIVE-DRAFT-XR-5 only from the retained nine-row partial
checkpoint. Use the accepted XR-1 Browser Worker engine smoke, XR-2 one-block
Core layout evidence, XR-3 bounded Form binding, XR-4 Canvas display-list
evidence, XR-5 source-segment/matrix evidence, MR1 fixed-point policy, Core
multi-run layout contract, external engine facts, exact Node/real-Chrome Worker
MR1 evidence, Core per-fragment display-list projection, and separate QA Canvas
paint, multi-line/multi-glyph parity, rapid-edit stale/last-valid lifecycle,
and bounded 12-TextBlock scheduling/frame evidence as prerequisites. Continue
from the immutable retained snapshot/checkpoint, fail-closed edit-range plan,
actual contextual WASM execution, exact cluster/break splice, and affected
line-range reconvergence proof. Design a Core-owned incremental acceptance and
compositional-fingerprint boundary next. Resolve offset-derived physical ids
without weakening semantic/exact distinctions. Keep renderer measurement,
whole-block runtime relayout, and product publication forbidden, and close only
rows whose real owner contracts can be exercised.

Preserve the Core dependency boundary, do not replace measureVNextText(...),
do not add a Backend request per keystroke, do not add whole-document
production activation in the same slice, and do not claim general
cross-runtime or glyph-pixel exactness. Keep Table/column/image work deferred.
Add focused tests, retain accepted and blocked matrix evidence, update the handoff with
PASS/FAIL/RISK/UNKNOWN, then commit and push each changed repository to main.
```

## LIVE-DRAFT-XR-0 / XR-1 Execution Result

Status: accepted for the bounded two-row runtime smoke on 2026-07-20.

The implementation audit corrected an important ambiguity in the earlier
baseline. The historical pinned artifact at
`packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm` is a real
WASM file with the accepted digest, but it exports readiness and boundary
identity only. The older native/WASM "parity" summaries are summary metadata;
they are not retained raw Browser Worker execution.

XR-1 therefore preserves that historical marker artifact and adds a separate
QA-only executable artifact under
`packages/text-engine-rust-wasm/pkg-live-draft/`. Its pinned sha256 is
`60d24ed4b5546e580a8fa5dd05d774e7d8b7078958f7d327cf8f66ffcb5b3a85`.
The package now separates `./node`, `./worker`, `./browser-assets`, and
`./live-draft-smoke` entry points. Core still does not import the adapter.

The Editor QA runner starts Chrome, opens a dedicated Browser Worker, transfers
the pinned WASM and Sarabun bytes, verifies both digests before execution, and
runs Rustybuzz 0.20.1 plus ICU4X Segmenter 2.2.0. It compares normalized output
against Node-native execution for:

- `thai-greeting-no-space` / `สวัสดีครับตูม`;
- `product-report-vnext-minimal` / `Prepared summary`.

Both rows match in glyph facts, advances, clusters, UTF-8 break offsets, and
UTF-16 break offsets. Retained evidence lives at
`flowdoc-vnext-editor/src/fixtures/live-draft-xr1-browser-worker-smoke.v1.json`.
The evidence retains the older accepted manifest/profile pointer as source-row
identity, but executes under a new QA profile that names the concrete
Rustybuzz/ICU4X revisions. It does not mislabel the historical profile's
`planned` engine ingredients as executed runtime facts.

This accepts XR-0/XR-1 only. It does not bind Form state, produce Draft pages,
replace the default measurer, activate production measurement, or establish
general cross-runtime exactness. XR-2 was implemented in the following slice.

## LIVE-DRAFT-XR-2 Execution Result

Status: accepted for three bounded one-block QA workloads on 2026-07-20.

The external adapter now converts pinned Rustybuzz glyph advances and ICU4X
break opportunities into a synchronous measurement draft. Editor injects that
draft through `createVNextRendererBackedTextMeasurer(...)` only via
`src/core/coreAdapter.ts`, then calls Core measured-line acceptance and bounded
text-flow pagination. Core does not import the adapter, WASM, Worker, or DOM.

The retained short Thai (13 characters), medium mixed (743), and long mixed
(4,959) workloads produce 1, 24, and 120 lines across 1, 2, and 9 pages. All
Node-native and real Chrome Worker samples match for normalized engine output,
line and page geometry, page count, measurement/fragment/final fingerprints,
and repeated-sample stability. Each row retains 5 cold and 25 warm samples;
warm samples call the engine provider zero times.

The run exposed and removed two external-adapter super-linear paths: repeated
glyph rescans during wrapping and repeated whole-string scans while mapping
UTF-8 offsets to Core UTF-16 offsets. Observed Worker round-trip p50 was 3.1
ms, 17.7 ms, and 62.0 ms cold; warm p50/p95 was 0.7/1.7 ms, 6.2/8.4 ms, and
17.3/22.9 ms. These are one-machine observations, not accepted budgets.

Evidence lives at
`flowdoc-vnext-editor/src/fixtures/live-draft-xr2-one-block-performance-parity.v1.json`
and is explained by
`flowdoc-vnext-editor/docs/LIVE_DRAFT_XR2_ONE_BLOCK_EVIDENCE.md`.

XR-2 still does not bind Form state, render Canvas pages, replace the default
measurer, activate production, or prove whole-document incremental scale.
XR-3 was implemented in the following slice.

## LIVE-DRAFT-XR-3 Execution Result

Status: accepted for one bounded QA-only Form scalar on 2026-07-20.

Editor now projects the selected memory-only `documentTitle` value and its
ready canonical Form candidate into revision- and fingerprint-pinned
`live-draft.form-layout` Worker requests. A 75 ms controller coalesces rapid
edits, cancels obsolete in-flight work when possible, rejects late results by
request/revision/Draft/candidate identity, and preserves the previous valid
Core result while the newest revision is updating.

A real Chrome run dispatched 15 separate Form revisions inside one debounce
window and observed one Worker/Core request. A second eight-edit burst retained
the first valid page during `draft-updating`, then applied the latest revision
23 as `draft-current`. Chrome observed zero cross-origin and zero
API/preview/PDF/render/export transport requests. Deterministic controller
tests also force and reject a late obsolete result.

The first browser result took 128.9 ms end-to-end including initial WASM/font
loading. The following warm result took 79.0 ms end-to-end and reported 1.9 ms
inside the Worker. These remain one-machine observations without an accepted
budget.

Evidence lives at
`flowdoc-vnext-editor/src/fixtures/live-draft-xr3-form-binding.v1.json` and is
explained by
`flowdoc-vnext-editor/docs/LIVE_DRAFT_XR3_FORM_BINDING.md`.

XR-3 renders Core-accepted lines in a QA surface only. It does not paint
Canvas, bind a whole document, execute JSON mapping, call Backend admission,
replace the default measurer, activate production, or prove Published/API
equivalence. XR-4 was implemented in the following slice.

## LIVE-DRAFT-XR-4 Execution Result

Status: accepted for bounded QA-only plain text-line Canvas pages on
2026-07-21.

Core now exposes a pure `projectVNextTextFlowDisplayListV1(...)` projection
from complete accepted text-flow pagination into page boxes and ordered
text-line paint commands. It fails closed on incomplete pagination,
production binding, geometry/style drift, line overflow, and invalid baseline
placement. The contract explicitly forbids renderer text measurement and
relayout while leaving glyph rasterization renderer-owned.

Editor retains the detailed Core projection in the Worker result, loads the
pinned Sarabun browser font, and paints responsive A4 Canvas pages without
calling `measureText`. The XR-3 latest-revision and last-valid-result
controller remains unchanged.

A real Chrome run painted 3,035 non-white pixels on the first page and retained
a PNG SHA-256. A 44-line bounded workload produced four A4 canvases from 44
Core commands. Intrinsic pages remained 794 x 1123 pixels; at a 390-pixel
viewport they scaled to 358 x 506.3 CSS pixels with no horizontal overflow.
The previous Canvas fingerprint stayed visible during the next Form revision,
and Chrome observed zero cross-origin or Backend-like requests.

Observed Canvas paint time was 2.6 ms for one page and 4.9 ms total for four
pages. The warm short Worker/Core path reported 3.2 ms; the four-page path
reported 18.8 ms. End-to-end values including the deliberate 75 ms debounce
were 81.0 ms and 100.0 ms. These remain one-machine observations without an
accepted budget.

Core contract documentation lives at
`docs/LIVE_DRAFT_XR4_TEXT_FLOW_DISPLAY_LIST.md`. Editor evidence lives at
`flowdoc-vnext-editor/src/fixtures/live-draft-xr4-canvas-page-renderer.v1.json`
and is explained by
`flowdoc-vnext-editor/docs/LIVE_DRAFT_XR4_CANVAS_RENDERER.md`.

XR-4 covers one selected scalar and plain text-line commands only. Canvas owns
glyph rasterization, so no cross-runtime glyph-position or pixel-parity claim
is made. Styled runs, fields, images, tables, whole-document composition,
virtualization, Backend admission, and production remain out of scope. XR-5
was implemented as a partial matrix checkpoint in the following slice.

## LIVE-DRAFT-XR-5 Partial Checkpoint Execution Result

Status: accepted for nine bounded rows with five explicit retained blockers on
2026-07-21. The full release-gating matrix is not accepted.

The real Node/Chrome harness now loads pinned Sarabun Regular and Bold bytes
and compares normalized Rustybuzz/ICU4X facts, Core accepted lines, page
geometry, display-list commands, optional inline/field source segments, and
deterministic fingerprints. An explicit fail-closed policy requires exact
discrete facts and at most `0.000001 pt` numeric geometry drift.

Nine rows passed: two mixed Thai/Latin rows, two separate style-to-font mapping
rows, one resolved-field adjacency row, a 24 pt / 10,000 pt width pair, one
forced-line-break row, and one 4,959-character long block. The long row
produced 120 lines, nine pages, and 120 display-list commands. Maximum retained
Node/Browser drift was zero for normalized engine facts, Core geometry, and
display-list geometry.

The width pair retained the same normalized-result hash while changing from
five lines to one. The field row retained `customer.name` as a
`resolved-field` source segment. The forced-break row exposed an adapter bug:
newline opportunities were previously optional when later text still fit.
The adapter now treats CR/LF boundaries as mandatory in linear time and the
row deterministically produces three lines.

The retained blocked rows are mixed-font switching inside one line,
constrained Table cell composition, repeated Table headers, explicit
page-break nodes in the one-block flow, and the distinct
default/approximate-versus-renderer drift evaluation. Zero drift between two
renderer-backed runtimes is not mislabeled as the last fixture.

Observed real Browser Worker round trips were about 1.4-23.6 ms cold and
0.7-3.4 ms warm for the short/medium rows. The long row was 76.1 ms cold and
23.1 ms warm. These are one-machine observations without an accepted budget.

Core documentation lives at
`docs/LIVE_DRAFT_XR5_SOURCE_SEGMENTS_AND_FORCED_BREAKS.md`. Retained evidence
lives at
`flowdoc-vnext-editor/src/fixtures/live-draft-xr5-cross-runtime-matrix.v1.json`
and is explained by
`flowdoc-vnext-editor/docs/LIVE_DRAFT_XR5_CROSS_RUNTIME_MATRIX.md`.

## LIVE-DRAFT-MR1 Fixed-Point Foundation

Status: accepted as a Core-only numeric foundation on 2026-07-21. The
subsequent Core multi-run contract, external shaping, and bounded real-Chrome
Worker parity slices are also accepted; runtime paint integration remains
blocked.

Core now publishes `LayoutUnitPolicyV1` for new versioned text-layout
contracts. One point equals 1,000,000 signed safe integer layout units. Point
conversion and signed font-metric scaling fail closed, use deterministic
half-away-from-zero rounding, retain a stable policy fingerprint, and require
exact integer comparison after normalization.

The foundation does not migrate authored units or existing float geometry,
does not change pagination or `measureVNextText(...)`, and does not bind a
renderer or production path. The historical approximate-versus-renderer drift
threshold remains a distinct policy. Documentation lives at
`docs/LIVE_DRAFT_MR1_LAYOUT_UNIT_POLICY.md`; focused evidence lives in
`tests/layoutUnitPolicyV1.test.ts`.

## LIVE-DRAFT-MR1 Core Multi-Run Layout Contract

Status: accepted as a Core-only contract and acceptance slice on 2026-07-21.
Bounded Browser/Node runtime parity was accepted later; display-list binding
and production remain NO-GO.

Core now accepts versioned external shaping evidence containing pinned font
metrics, resolved shaping runs, clusters, break opportunities, and line
ranges. It validates coverage and safe boundaries, then derives exact integer
fragment x positions, mixed-size shared baselines, line height/leading, line
stacking, retained source segments, and deterministic fingerprints. The
bounded fixture covers 10 pt Regular, 24 pt Bold, and a 12 pt resolved field
on one line.

This slice does not load font bytes, execute shaping, validate Text Run
style-to-font resolution, change pagination/display-list behavior, or bind a
renderer. Documentation lives at
`docs/LIVE_DRAFT_MR1_MULTI_RUN_LAYOUT_CONTRACT.md`; focused evidence lives in
`tests/textBlockMultiRunLayoutV1.test.ts`.

## LIVE-DRAFT-MR1 External Engine Facts And Itemization

Status: accepted for Node-native, executable WASM test-host, and bounded real
Chrome Worker evidence on 2026-07-21. Core display-list and separate Editor QA
Canvas slices are accepted; Editor product binding and production remain NO-GO.

The external package now merges complete paragraph style with Text Run local
overrides, resolves hash-pinned Sarabun Regular/Bold faces, reports actual raw
font metrics, shapes compatible runs, segments the complete block, maps
clusters to exact integer geometry, and feeds the accepted Core contract. The
bounded 10 pt Regular / 24 pt Bold / 12 pt field line produces exactly equal
Core request and layout objects under native Rust and the separate executable
MR1 WASM artifact.

The historical XR artifact remains byte-identical. MR1 has a separate WASM
boundary and digest. Its WASM execution is retained in both the automated Node
test host and a separate Editor QA Chrome Worker path. Documentation lives at
`docs/LIVE_DRAFT_MR1_ENGINE_FACTS.md`; focused evidence lives in
`tests/textEngineMultiRunLayoutV1.test.ts` and
`tests/textEngineMultiRunNodeWasmV1.test.ts`.

## LIVE-DRAFT-MR1 Real Browser Worker Parity

Status: accepted for one bounded mixed-size TextBlock in a real Chrome Worker
on 2026-07-21. Core per-fragment display-list and separate Editor QA Canvas
slices are accepted. Editor product binding, Backend binding, whole-document
layout, and production remain NO-GO.

The Editor QA Worker loads the separate MR1 WASM artifact and digest-pinned
Sarabun Regular/Bold bytes. The 10 pt Regular / 24 pt Bold / 12 pt resolved
field fixture produces exactly equal complete Core requests and accepted Core
layouts under Node-native and Chrome Worker execution. Both maximum integer
drifts are zero. The result contains three shaping runs, three clusters, one
line, and three positioned fragments with a Regular/Bold/Regular face switch;
the resolved-field source segment is retained.

The retained warm observations over 25 layouts were about 1.9 ms p50 and
3.4 ms p95 on one machine, with exact repeated results. These are observations,
not accepted budgets. The run made zero Backend-like requests and did not
change the existing product Worker, controller, Canvas, pagination, or default
measurement paths. Editor evidence lives in
`docs/LIVE_DRAFT_MR1_REAL_BROWSER_WORKER.md` and
`src/fixtures/live-draft-mr1-real-browser-worker-parity.v1.json` in the Editor
repository.

## LIVE-DRAFT-MR1 Core Per-Fragment Display List

Status: accepted as a Core-only projection on 2026-07-21. A subsequent separate
Editor QA Canvas slice is accepted; product and production remain NO-GO.

Core now converts each accepted positioned fragment into one deterministic
fixed-point `text-fragment` command. Commands retain absolute shared-baseline
coordinates, line and font-metric bounds, advances, pinned font/style facts,
layout/line/fragment fingerprints, paint order, and source segments. Line
records retain complete line boxes and source identity, including hard breaks
that do not paint.

The projector validates accepted geometry plus line/fragment fingerprints
again, applies a signed safe-integer origin, and blocks arithmetic overflow,
mutation, policy mismatch, and production binding. It performs no measurement,
shaping, line breaking, relayout, unit conversion, or glyph rasterization. Documentation
lives at `docs/LIVE_DRAFT_MR1_FRAGMENT_DISPLAY_LIST.md`; focused evidence lives
in `tests/textBlockMultiRunDisplayListV1.test.ts`.

## LIVE-DRAFT-MR1 Editor QA Canvas Paint

Status: accepted for one bounded mixed-size line in a separate real Chrome QA
Canvas on 2026-07-21. Product binding and production remain NO-GO.

Editor loads the same pinned Sarabun Regular/Bold bytes, projects the accepted
Worker layout through Core only via `src/core/coreAdapter.ts`, and paints three
fragment commands without text measurement or relayout. Node-native and real
Chrome produce exactly equal complete layout and display-list objects with zero
integer drift. The commands retain Regular/Bold/Regular faces, 10/24/12 pt
sizes, the resolved-field identity, and one shared 97.632 pt baseline.

Chrome painted 2,589 non-white pixels on a 794 x 1,123 Canvas and retained a PNG
digest. The observed cold Core projection was about 13.5 ms and Canvas paint was
about 7.5 ms on one machine. These are not accepted budgets. Chrome made zero
Backend-like requests, and existing product Worker/controller/Canvas paths were
not changed. Evidence lives in the Editor repository at
`docs/LIVE_DRAFT_MR1_CANVAS_PAINT.md` and
`src/fixtures/live-draft-mr1-multi-run-canvas-paint.v1.json`.

## LIVE-DRAFT-MR1 Multi-Line Multi-Glyph Canvas

Status: accepted for one bounded mixed-style TextBlock in a separate real
Chrome QA path on 2026-07-21. Product binding, whole-document composition, and
production remain NO-GO.

The longer fixture contains 74 UTF-16 units across English and Thai text,
Sarabun Regular/Bold, 10/12/24 pt runs, and one resolved field. The accepted
result contains four shaping runs, 65 clusters, five lines, and eight
display-list commands. Every command contains multiple glyphs, at least one
shaping run is split across lines, and `customer.displayName` remains retained
in clipped command source segments.

Node-native and real Chrome Worker execution produce exactly equal complete
requests, Core layouts, and Core display lists. All maximum integer drifts are
zero. Twenty-five initialized repetitions at each stage retain identical
facts. The observed warm Worker layout was 5.9 ms p50 / 8.9 ms p95, Core
projection was 2.7 ms p50 / 5.5 ms p95, and Canvas paint was 0 ms p50 / 0.1 ms
p95 on one machine. These are not accepted budgets.

Chrome painted 10,094 non-white pixels on a 794 x 1,123 Canvas and made zero
Backend-like requests. The pixel evidence proves that the accepted commands
were painted; it does not prove Canvas/PDF glyph-outline or pixel parity.
Evidence lives in the Editor repository at
`docs/LIVE_DRAFT_MR1_MULTILINE_MULTI_GLYPH.md` and
`src/fixtures/live-draft-mr1-multiline-multi-glyph-canvas.v1.json`.

## LIVE-DRAFT-MR1 Rapid-Edit Lifecycle

Status: accepted for one bounded real Chrome multi-run QA sequence on
2026-07-21. Product binding and production remain NO-GO.

The Editor multi-run controller separates debounce from correctness. Revisions
2 and 3 are coalesced before dispatch. Revision 4 is dispatched, receives an
advisory cancellation after revision 5 supersedes it, then deliberately
completes late. Its request/revision/content identity is rejected as stale and
never reaches Core projection or Canvas publication.

The real Worker is initialized once and executes MR1 WASM Rustybuzz/ICU4X for
revisions 1, 4, 5, and 7. Canvas paints only accepted current revisions 1, 5,
and 7. Revision 1 stays visible while later work is pending; revision 5 stays
visible after the late revision-4 completion and while revision 6 is locally
blocked. Revision 7 replaces it only after its own accepted result and display
list are ready. Final counters are six scheduled updates, four Worker
requests, three applies, one advisory cancellation, one rejected stale result,
and one blocked input.

The QA Worker delays only delivery of the already-computed revision-4 result
by 120 ms to make response reordering deterministic. This is lifecycle
instrumentation, not a scheduler or performance simulation. Chrome painted
only the three current revisions, ended with 10,360 non-white pixels, and made
zero Backend-like requests. Evidence lives in the Editor repository at
`docs/LIVE_DRAFT_MR1_RAPID_EDIT_LIFECYCLE.md` and
`src/fixtures/live-draft-mr1-rapid-edit-lifecycle.v1.json`.

## LIVE-DRAFT-MR1 Multi-Block Scheduling And Frame Gate

Status: accepted for a bounded 12-TextBlock Core/Editor QA path on 2026-07-21.
Product binding and production remain NO-GO.

Core now composes ordered accepted MR1 TextBlock lines into exact fixed-point
pages. It retains a cursor before/after every block, reuses the unchanged
prefix, recomposes from the first dirty/mismatched layout, and stops when the
current page/y cursor and every remaining layout fingerprint exactly match the
previous accepted snapshot. A separate document projector creates page-indexed
commands without renderer measurement, relayout, or pagination.

Editor adds advisory lexical dirty-token ranges, active/visible/near/offscreen
priority, latest queued replacement per TextBlock, stale completion rejection,
complete-snapshot publication, and an atomic scratch-Canvas swap. Tokens decide
work timing and invalidation bounds only; the external engine still owns exact
complete layout of the dirty TextBlock.

The real Chrome fixture places the active mixed-size block at index 5 near page
1's bottom. Typing grows 2 -> 3 pages and deletion contracts 3 -> 2. A delayed
revision is rejected stale, one queued revision is replaced before dispatch,
last-valid survives pending and blocked states, and zero Backend-like requests
occur. A same-height edit reuses five prefix blocks, recomposes one block/line,
reconverges at block index 6, reuses six suffix blocks, and reuses 11 display
lines while validating/projecting only the changed line.

Ten warm edits observed 5.7/6.8 ms p50/p95 for main-thread composition +
projection + atomic paint and 7.3/8.5 ms p50/p95 end-to-end. The bounded warm
main-thread gate is 16.7 ms and passes. It is not a universal product budget.
Evidence lives at `docs/LIVE_DRAFT_MR1_MULTI_BLOCK_COMPOSITION.md` and in the
Editor repository at `docs/LIVE_DRAFT_MR1_MULTI_BLOCK_SCHEDULING.md` plus
`src/fixtures/live-draft-mr1-multi-block-scheduling.v1.json`.

## LIVE-DRAFT-MR1 Intra-TextBlock Incremental Reflow Analysis

Status: accepted as a bounded full-layout-oracle Core/Editor QA slice on
2026-07-21. Actual incremental execution, product binding, and production
remain NO-GO.

The external adapter now separates diagnostic timing for input/style
resolution, Rustybuzz shaping, ICU4X segmentation, line breaking, Core
acceptance/fingerprinting, and adapter fingerprinting. Timing stays outside all
deterministic layout facts. A separate deterministic analysis accepts previous
and next complete MR1 oracle layouts plus one exact edit, restarts one line
before the change, requires two stable lines and an oracle-identical remaining
suffix, and caps a proposed window at 32 lines / 2,048 UTF-16 units.

The real Chrome Worker fixture uses 4,959 UTF-16 units, five source runs, three
effective shaping runs, mixed 12/18 pt Regular/Bold styles, one resolved field,
4,319 clusters, 1,121 breaks, and 124 lines. Start, middle, line-edge,
page-edge, style-boundary, and field-adjacent edits reconverge with zero integer
geometry drift. The style edit is widest at ten lines / 280 UTF-16 units. An
end edit lacks two stable suffix lines and falls back; hard-break and oversized
edits also fall back.

Ninety complete long-block layouts observed 192.7/323.9 ms p50/p95. Stage p50
values were 17.3 ms shaping, 43.8 ms segmentation, 12.3 ms line breaking,
90.2 ms Core acceptance/fingerprinting, and 23.3 ms adapter fingerprinting.
The token advisory observed 1.4/3.3 ms p50/p95. These values are diagnostic,
not budgets. The earlier XR5 23.1 ms warm row was a provider cache hit; this
fixture intentionally repeats every MR1 stage.

The analysis says `full-layout-oracle-analysis-only` and
`mayPublishLayout: false`. It proves the checkpoint policy but does not perform
partial shaping,
partial segmentation, incremental Core acceptance, or suffix publication.
Evidence lives at `docs/LIVE_DRAFT_MR1_INCREMENTAL_REFLOW_ANALYSIS.md` and in
the Editor repository at
`docs/LIVE_DRAFT_MR1_INCREMENTAL_REFLOW_ANALYSIS.md` plus
`src/fixtures/live-draft-mr1-incremental-reflow-analysis.v1.json`.

## LIVE-DRAFT-MR1 Contextual Range Facts

Status: accepted as a bounded native/WASM and real-Chrome Worker QA slice on
2026-07-21. Affected-line assembly, incremental Core acceptance, product
binding, and production remain NO-GO.

The external text-engine package now exposes a separately versioned and
digest-pinned MR1-range WASM artifact. Range shaping receives complete
effective-run text plus explicit selected/context byte ranges, derives
script/direction/language from the complete run, supplies pre/post context to
Rustybuzz, and returns global clusters plus `unsafeToBreak`. Its oracle proof
requires safe full-run cluster boundaries and exact glyph ids, clusters,
advances, and offsets.

Bounded ICU4X segmentation grows context 32 -> 64 -> 128 UTF-16 units, excludes
artificial substring endpoint breaks, and needs two equal consecutive
expansions. Stability alone remains non-authoritative. Requiring full context
or reaching the configured limit returns `fallback-required`; QA separately
compares the bounded facts with the complete ICU4X oracle.

Focused native/WASM tests cover Thai, Latin ligature candidates, a Thai-leading
mixed run, Regular/Bold faces, global offsets, artificial endpoints,
full-context fallback, and surrogate rejection. In real Chrome, six 30-unit
ranges distributed across a 4,959-unit Thai/Latin block match full shaping and
segmentation oracles exactly and make zero Backend-like requests.

Observed diagnostic p50/p95 values were 1.9/3.3 ms for contextual range
shaping versus 9.7/14.8 ms full shaping, and 7.7/10.7 ms for bounded
segmentation versus 26.8/36.0 ms full segmentation. These are observations,
not budgets. Evidence lives at
`docs/LIVE_DRAFT_MR1_CONTEXTUAL_RANGE_FACTS.md` and in the Editor repository at
`docs/LIVE_DRAFT_MR1_CONTEXTUAL_RANGE_FACTS.md` plus
`src/fixtures/live-draft-mr1-contextual-range-facts.v1.json`.

## LIVE-DRAFT-MR1 Retained Snapshot And Edit-Range Planner

Status: accepted as a deterministic external-adapter contract with focused
Core-repository tests on 2026-07-21. Range engine execution, affected-line
assembly, incremental Core acceptance, product binding, and production remain
NO-GO.

The external text-engine adapter can now retain one accepted complete MR1
TextBlock as a deeply frozen, process-local snapshot. It preserves accepted
measurement/source runs, font faces, break offsets, shaping runs/clusters,
positioned lines/fragments/source segments, and the accepted adapter, Core, and
layout-context fingerprints. Every line receives an exact Core fingerprint, a
normalized semantic fingerprint, cluster cursors, a prefix exact-layout chain,
a prefix normalized-semantic chain, and a suffix normalized-semantic chain.

Snapshot reuse requires the exact measurement profile, MR1-range WASM digest
and boundary, Rustybuzz and ICU4X revisions, Unicode policy, runtime kind, and
all used font digests. The first contract deliberately accepts only the same
immutable object created in the current process. A cloned, transferred,
hydrated, mutated, or identity-drifted snapshot fails closed. Snapshot hashing
occurs once at creation; the edit planner does not rehash the complete retained
layout on every edit.

The deterministic planner accepts one scalar-safe insertion, deletion, or
replacement inside exactly one stable `text` source run. It covers Regular and
Bold effective runs, mixed font sizes, and text immediately adjacent to a
retained resolved field. It derives the prior and projected shaping range,
bounded shaping/segmentation contexts, retained prefix/suffix cluster counts,
and a one-line-lookbehind restart checkpoint from accepted break/run-edge
facts. Runtime drift, invalid reconstruction, style/source topology changes,
multiple affected runs, direct field or hard-break editing, ambiguous shaping
ownership, unsafe boundaries, surrogate splits, and oversized initial ranges
all return `fallback-required`.

This checkpoint is a plan only. It runs no shaper or segmenter, splices no
clusters, assembles no lines, invokes no Core acceptance, and may not publish a
layout. No performance budget is claimed. The exact contract and evidence live
at `docs/LIVE_DRAFT_MR1_RETAINED_RANGE_PLANNER.md`.

## LIVE-DRAFT-MR1 Range Execution And Affected Lines

Status: accepted as a bounded actual-WASM/Core QA checkpoint on 2026-07-21.
Incremental Core acceptance, positioned-fragment assembly, product binding,
publication, and production remain NO-GO.

MR1-L reproduces the immutable MR1-K plan before execution, then invokes the
separately pinned MR1-range WASM for contextual Rustybuzz shaping and adaptive
bounded ICU4X segmentation. Complete affected-run shaping and complete
TextBlock segmentation remain required QA oracles. Pinned metrics, glyph facts,
cluster boundaries, and target breaks must match exactly.

The external adapter now splices retained prefix clusters, newly scaled range
clusters, and offset-shifted suffix clusters into continuous shaping runs. It
also combines retained, new, shifted, and mandatory break facts only at the new
cluster boundaries. Both complete spliced arrays must equal the complete
WASM/Core oracle request.

An independent line-range builder restarts one line before the edit, consumes
the spliced integer advances and break facts, and stops only after two shifted
line matches plus an exact normalized suffix-semantic chain match. The final
retained-prefix/new-window/shifted-suffix line ranges must equal the complete
Core oracle. It does not ask a renderer to measure and does not ask Core to
position incremental fragments.

The 4,959-unit fixture retains five source runs, three effective shaping runs,
4,319 clusters, 1,121 breaks, and 124 lines. Thai insertion, 18 pt Bold
replacement, field-adjacent insertion, and deletion match complete shaping-run,
break, and line-range facts. Altered plans, glyph drift, bounded-segmentation
exhaustion, and an undersized line window fail closed.

The real oracle exposed that current `shapingRunId` values include the run end
offset. A length edit can therefore change exact Core line/fragment
fingerprints on semantically unchanged prefix lines. MR1-L adds a normalized
prefix-semantic chain beside the exact within-snapshot prefix-layout chain and
does not claim those two proofs are interchangeable. This identity/fingerprint
composition is the next Core-owned gate.

MR1-L still executes complete shape, segmentation, layout, snapshot hashing,
and complete-array comparisons for QA. It is evidence of exact partial fact
construction, not a typing budget or publishable fast path. Evidence lives at
`docs/LIVE_DRAFT_MR1_RANGE_EXECUTION_AND_AFFECTED_LINES.md`.

## LIVE-DRAFT-MR1 Incremental Core Composition

Status: accepted as a bounded Core/WASM QA checkpoint on 2026-07-21.
Oracle-independent adapter execution, product binding, publication, and
production remain NO-GO.

MR1-M adds a Core-owned process-local snapshot, semantic-line contract,
affected-window acceptance boundary, and deterministic prefix/affected/suffix
composition. Core validates the complete next measurement and engine facts,
the exact edit and fixed layout context, unchanged prefix semantics, shifted
suffix semantics, and the MR1-L checkpoint proof. It positions and fingerprints
only the affected lines and reports exact line-index, UTF-16 offset, and y-offset
transforms for the retained regions.

The existing range-derived `shapingRunId` contract is unchanged. Semantic line
identity is now explicitly separate from revision-specific run, fragment, line,
and complete-layout fingerprints. The external adapter aliases the Core-owned
semantic helper instead of maintaining a second definition.

A QA-only materializer rebinds retained semantic fragments to the next
revision's physical ids, regenerates source segments and fingerprints, inserts
the affected lines, and builds the legacy complete Core result without calling
complete Core acceptance internally. The complete assembled object equals the
independent WASM/Core oracle for Thai insertion, 18 pt Bold replacement,
field-adjacent insertion, and deletion. Cloned snapshots, production binding,
and altered suffix geometry fail closed.

This checkpoint still scans complete next fact arrays, MR1-L still supplies
complete engine/layout oracles, and QA materialization is complete-layout work.
It is not a latency budget or publishable runtime path. Evidence lives at
`docs/LIVE_DRAFT_MR1_INCREMENTAL_CORE_COMPOSITION.md`.

## PASS / FAIL-BLOCKER / RISK / UNKNOWN

### PASS

- The product direction and repo ownership are clear.
- Core contracts are shared by Editor and Backend.
- An external text-engine package, runtime identity, renderer-backed provider,
  pinned WASM digest, and minimal evidence checkpoint exist.
- Backend exact PDF generation and Editor PDF inspection exist for local QA.
- The historical marker artifact and the executable XR-1 artifact have
  separate, verified digest identities.
- Node-native and real Browser Worker Rustybuzz/ICU4X execution matches for the
  two bounded accepted smoke rows.
- Three bounded one-block workloads match across Node-native and real Browser
  Worker execution through the injected Core measurement, acceptance, and
  pagination boundaries.
- Cold/warm timing phases are retained without inventing a budget, and all
  warm samples avoid the engine provider.
- One memory-only Form scalar now reaches the real Browser Worker/Core path
  through a 75 ms latest-value debounce without Backend transport.
- Latest revision, stale-result rejection, cancellation, and preservation of
  the previous valid Draft result have focused deterministic coverage.
- A real Chrome rapid-edit run retained Form lifecycle, no-Backend, latest
  revision, Core-line-source, and observational timing evidence.
- Core projects complete text-flow pagination into deterministic page boxes and
  ordered text-line paint commands without concrete renderer dependencies.
- Real responsive A4 Canvas pages consume that display list without browser
  measurement or relayout and retain nonblank-pixel and PNG-hash evidence.
- One-page and four-page Canvas paint timings, stable intrinsic geometry,
  mobile aspect ratio, last-valid Canvas retention, and zero Backend transport
  are retained.
- Nine additional Node/real-Browser Worker rows match exactly in normalized
  engine facts, Core line/page geometry, display-list commands, source facts,
  and deterministic fingerprints under an explicit fail-closed drift policy.
- Sarabun Regular and Bold style mappings, mixed Thai/Latin text, the 24 pt /
  10,000 pt width pair, field adjacency, mandatory line breaks, and a
  120-line/9-page long block have bounded retained evidence.
- Core display-list projection can retain validated clipped source segments,
  including resolved-field identity, without granting renderer relayout.
- The expanded matrix exposed and fixed optional-newline behavior in the
  external Live Draft adapter; focused tests retain mandatory CR/LF behavior.
- New MR1 layout contracts can bind canonical geometry to a fingerprinted
  signed fixed-point policy and compare Browser/Node facts as exact integers.
- Core can validate already-resolved multi-run cluster evidence and derive
  exact mixed-size line baselines, positioned fragments, source segments, and
  fingerprints without importing an engine or renderer.
- External Node-native and separately pinned executable MR1 WASM test-host
  runs resolve Regular/Bold Text Run overrides, report matching real font
  metrics, and produce exactly equal Core requests and accepted layouts for
  one bounded mixed-size line.
- A separate real Chrome QA Worker produces the exact same complete Core
  request and layout for that line with zero integer drift, retains the field
  source segment, switches Regular/Bold/Regular faces, and performs no Backend
  request.
- Core projects all three positioned fragments into deterministic fixed-point
  commands with one shared baseline and distinct 10/24/12 pt pinned styles,
  without renderer measurement or relayout.
- A separate real Chrome QA Canvas consumes those commands with ready
  Regular/Bold faces, paints 2,589 non-white pixels, retains the resolved field,
  and matches Node's complete display list exactly with zero integer drift.
- A longer mixed Thai/Latin MR1 fixture produces five lines and eight
  multi-glyph commands, retains a resolved field and a shaping run split across
  lines, and matches complete Node/Chrome/Core objects with zero integer drift.
- Twenty-five initialized multi-line layout, projection, and paint samples are
  stable; their observational p50/p95 distributions are retained without
  inventing a performance budget.
- A real Chrome MR1 rapid-edit sequence coalesces undispatched revisions,
  rejects a deliberately late completion, retains last-valid while pending or
  blocked, and paints only revisions 1, 5, and 7 with zero Backend requests.
- Core can compose ordered accepted MR1 TextBlock lines into exact fixed-point
  pages, reuse an unchanged prefix, and stop at an exact downstream block
  boundary without granting pagination authority to Canvas.
- A 12-TextBlock Chrome path prioritizes active/visible work, replaces one
  queued obsolete revision, rejects one late completion, grows 2 -> 3 pages,
  contracts 3 -> 2, and retains last-valid while pending or blocked.
- Ten warm multi-block edits pass the bounded 16.7 ms main-thread gate at
  6.8 ms p95 for composition + projection + atomic Canvas paint.
- A 4,959-unit real-Chrome MR1 fixture now separates complete-layout cost by
  stage and proves exact oracle-only restart/reconvergence windows for six
  start/middle/line/page/style/field-adjacent edits.
- End-of-block, hard-break, and oversized intra-block edits fail closed instead
  of weakening the two-stable-line and bounded-window rules.
- A separately pinned MR1-range artifact produces exact native/WASM contextual
  range glyph facts for Thai, Latin ligature candidates, and mixed Thai/Latin
  effective runs while retaining global cluster offsets.
- Six real-Chrome Regular/Bold ranges across a 4,959-unit block match complete
  shaping and ICU4X segmentation oracles exactly; bounded segmentation
  stabilizes in three context windows and makes zero Backend-like requests.
- An accepted MR1 layout can be retained once as an immutable process-local
  snapshot with exact runtime/font identity and per-line prefix/suffix
  checkpoint chains, without full-snapshot hashing in each edit plan.
- One stable Text Run insertion, deletion, or replacement can produce a
  deterministic contextual engine/segmentation range and restart checkpoint;
  incompatible runtime, topology, field, hard-break, UTF-16, and range cases
  fail closed without executing the engine or granting publication authority.
- The actual MR1-range WASM can execute that plan, prove contextual glyph and
  bounded-break facts against complete QA oracles, and splice exact retained,
  new, and shifted shaping-run/break facts for insertion, Bold replacement,
  field adjacency, and deletion.
- An independent affected line-range builder matches all 124 complete Core
  oracle line ranges after a one-line-lookbehind restart and two-line plus
  normalized suffix-semantic reconvergence proof.
- Altered plans, divergent glyph facts, segmentation-context exhaustion, and
  undersized affected-line windows fail closed before any layout publication.
- Core now accepts a proved incremental line window, positions only affected
  lines, and composes retained prefix/shifted suffix references under an exact
  semantic-versus-physical identity policy without runtime imports.
- QA materialization regenerates revision-specific physical ids and produces a
  complete Core object exactly equal to the independent oracle for insertion,
  Bold replacement, field adjacency, and deletion.

### FAIL-BLOCKER

- Product-bound styled Canvas paint, field chip-specific interaction, images,
  tables, and production whole-document Canvas composition are not implemented.
- Constrained Table-cell, repeated-header, explicit page-break, and
  default/approximate-versus-renderer drift rows remain explicitly blocked.
- Full cross-runtime measurement parity is not accepted.
- Product-bound multi-block scheduling, IME/caret/selection integration, and
  long-document page virtualization are not implemented.
- Default pagination measurement replacement remains blocked.
- Oracle-independent external-adapter execution, product-bound incremental
  composition, whole-document field/layout coverage, and publication remain
  blocked for later slices.

### RISK

- Existing historical docs can be mistaken for current adapter status.
- A visually convincing DOM preview could be mistaken for exact pagination.
- Large-document reflow can overwhelm the browser without worker chunking and
  invalidation.
- Even with a cache hit, long blocks still spend measurable time in Core
  acceptance, pagination, fingerprinting, and Worker round-trip; XR-6 must
  address affected-range invalidation rather than relying on engine cache only.
- The executable ICU4X/Rustybuzz WASM is about 1.06 MB before transport-level
  compression; initialization and caching budgets need broader evidence.
- XR-3's observed 79 ms warm end-to-end update includes its deliberate 75 ms
  debounce; broader UI work and multi-block layout still need measurement.
- Canvas `fillText` owns glyph rasterization; XR-4 locks line/page geometry but
  does not prove Canvas/PDF glyph-position or pixel parity.
- Four bounded pages paint quickly, but unvirtualized large page stacks can
  consume substantial bitmap memory before XR-6.
- The bounded Node/real-Chrome row proves a font-face switch inside one shaped
  line, but can be mistaken for per-fragment paint or general document proof;
  those claims remain blocked.
- The external adapter now proves bounded effective Text Run style/font mapping,
  Browser loading, and Worker transfer, but Canvas consumption and broader
  style fallback remain unproved.
- The 25 warm multi-line samples cover one 74-unit TextBlock. They do not
  establish a typing budget for multiple dirty blocks, long documents, tables,
  or whole-document pagination.
- Longer fragments now have bounded Canvas evidence, but Canvas still owns
  glyph rasterization inside each command and no Canvas/PDF outline or pixel
  reconciliation policy is accepted.
- The rapid-edit response reordering is deliberately instrumented; it proves
  the revision gate, not real scheduler fairness, queue pressure, or input
  responsiveness under concurrent multi-block work.
- The earlier 23.1 ms XR5 warm long-row was a provider cache hit. Repeating all
  MR1 stages over the mixed-run 4,959-unit block observed 192.7/323.9 ms
  p50/p95, so cache-hit and full-work timing must not be conflated.
- Core acceptance/fingerprinting observed 90.2 ms p50 and whole-block ICU4X
  segmentation 43.8 ms p50 in the retained run; shaping-only optimization
  cannot meet an interaction budget by itself.
- The oracle analysis compares and hashes the complete suffix and observed
  27.4 ms p50. Runtime reconvergence needs retained checkpoint fingerprints,
  not this QA-only whole-suffix proof loop.
- The accepted token dirty range is advisory: each dirty TextBlock still runs
  complete shaping and Core acceptance, so one very long active block can still
  exceed an interaction budget.
- Contextual range engine timings are lower in the bounded fixture, but Core
  acceptance/fingerprinting, line assembly, scheduling, React work, and paint
  are not included; the engine observation is not a typing budget.
- The 12-block frame gate excludes product React work, IME, caret/selection,
  viewport bitmap memory, background contention, tables, columns, and images.
- The first retained snapshot duplicates accepted TextBlock layout facts in
  memory for each active snapshot; product-scale retention limits are unknown.
- Process-local provenance intentionally rejects cloned/transferred snapshots,
  so Worker transfer or persisted hydration needs a separately proved contract.
- The planner's retained safe boundary is only the initial range. New shaping
  and segmentation facts still require an exact range oracle before splicing.
- MR1-L deliberately executes complete shape/segmentation and Core layout
  oracles, creates a complete next snapshot, and compares complete spliced
  arrays. Its passing result is not a per-keystroke performance result.
- MR1-M resolves offset-derived ids by separating semantic reuse from physical
  identity, but its complete-array validation and QA materialization can still
  hide the latency benefit until the adapter no longer requires a full layout
  oracle as an execution input.

### UNKNOWN

- Node/Browser parity for Table-cell and repeated-header owner pipelines.
- Default/approximate-versus-renderer drift values for the expanded rows under
  the accepted threshold policy.
- Final performance and bitmap-memory budgets for product-sized and 200-page
  documents.
- Product-safe incremental composition that can publish the proved line window
  without executing a full layout oracle.
- Product-scale retained-snapshot memory and per-edit planner timing.
- Exact performance after complete QA oracle calls and full-array comparisons
  are removed from the runtime path.
- Cross-process or persisted incremental snapshot hydration with equally strong
  provenance and immutability guarantees.
- Product scheduler fairness under continuous active typing plus background
  visible/offscreen invalidations.
- Canvas paint cost and memory for styled, image, table, and 200-page content.
- Accepted glyph-position/outline reconciliation policy across Canvas and PDF.
- Final drift reconciliation UX between Live Draft and Published output.
