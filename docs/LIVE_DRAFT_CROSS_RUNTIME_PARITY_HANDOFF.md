# Live Draft Cross-Runtime Parity Handoff

Status: implementation handoff; runtime behavior is not changed by this
document.

Date: 2026-07-20.

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
| `flowdoc-vnext-core` | `d3062f4` | canonical contracts, layout/pagination, fixed-point multi-run acceptance, external MR1 engine facts |
| `flowdoc-vnext-editor` | `d5c8b10` | Design/Preview workspace plus bounded real-Chrome MR1 Worker parity evidence |
| `flowdoc-vnext-backend` | `280c4ff` | trusted admission, mapping, generation lifecycle, durable local operation recovery, PDF rendering and delivery |

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

Continue MR1 mixed-style/mixed-size inline layout from the retained XR-5
partial matrix checkpoint, accepted real-Chrome Worker parity, and accepted
Core per-fragment display-list projection.

1. Read the files under **Required Reading** plus the XR-5 Core and Editor
   evidence docs, `docs/LIVE_DRAFT_MR1_MULTI_RUN_LAYOUT_CONTRACT.md`, and
   `docs/LIVE_DRAFT_MR1_ENGINE_FACTS.md`.
2. Let a separate Editor QA Canvas path consume the accepted per-fragment
   commands without `measureText`, wrapping, or line-height/baseline
   recomputation.
3. Retain exact command facts, nonblank-pixel evidence, font readiness, and
   observational paint timing before considering product binding. Keep the
   glyph-rasterization limitation explicit.
4. Bind constrained Table-cell and repeated-header rows through their accepted
   Table preparation/pagination/display-list owners; do not impersonate them
   with plain text-block rows.
5. Evaluate the distinct default/approximate-versus-renderer drift fixture
   under the already accepted numeric threshold policy. Do not relabel the
   zero Node/Browser renderer-backed drift summary as that fixture.
6. Keep default-measurer replacement, whole-document production activation,
   XR-6 scale work, and glyph-pixel exactness out of this slice.

## Required Reading

Core:

- `docs/MEASUREMENT_HARDENING_CLOSE_AUDIT.md`
- `docs/RUST_WASM_TEXT_ENGINE_BOUNDARY.md`
- `docs/TEXT_ENGINE_RENDERER_BACKED_PROVIDER_BOUNDARY.md`
- `docs/MEASUREMENT_PROFILE_IDENTITY_CONTRACT.md`
- `docs/LIVE_DRAFT_XR5_SOURCE_SEGMENTS_AND_FORCED_BREAKS.md`
- `docs/LIVE_DRAFT_MR1_MULTI_RUN_LAYOUT_CONTRACT.md`
- `docs/LIVE_DRAFT_MR1_ENGINE_FACTS.md`
- `docs/LIVE_DRAFT_MR1_FRAGMENT_DISPLAY_LIST.md`
- `src/renderer/textMeasurementAdapter.ts`
- `src/pagination/textMeasurement.ts`
- `src/pagination/layoutPipeline.ts`
- `packages/text-engine-rust-wasm/src/index.ts`
- `packages/text-engine-rust-wasm/src/runtimeIdentity.ts`
- `packages/text-engine-rust-wasm/src/rendererBackedProvider.ts`
- `packages/text-engine-rust-wasm/src/multiRunLayout.ts`
- `packages/text-engine-rust-wasm/src/runtimeMr1.ts`
- `src/renderer/textBlockMultiRunDisplayListV1.ts`

Editor:

- `docs/LIVE_DRAFT_XR5_CROSS_RUNTIME_MATRIX.md`
- `docs/LIVE_DRAFT_MR1_REAL_BROWSER_WORKER.md`
- `src/fixtures/live-draft-mr1-real-browser-worker-parity.v1.json`
- `src/qa/liveDraftMr1Evidence.worker.ts`
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
MR1 evidence, and the Core per-fragment display-list projection as
prerequisites. Consume accepted commands through a separate QA Canvas path
without renderer measurement or line relayout. Retain command and bounded
visual evidence, and close only rows whose real owner contracts can be
exercised.

Preserve the Core dependency boundary, do not replace measureVNextText(...),
do not add a Backend request per keystroke, do not add whole-document
production activation in the same slice, and do not claim general
cross-runtime or glyph-pixel exactness. Add focused tests, retain accepted and
blocked matrix evidence, update the handoff with
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
Chrome Worker evidence on 2026-07-21. Core display-list projection is accepted;
Editor Canvas and production remain NO-GO.

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
on 2026-07-21. Core per-fragment display-list projection is accepted. Editor
Canvas/product binding, Backend binding, whole-document layout, and production
remain NO-GO.

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

Status: accepted as a Core-only projection on 2026-07-21. Editor QA Canvas and
production remain NO-GO.

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

### FAIL-BLOCKER

- Styled per-run Canvas paint, field chip-specific Canvas interaction, images,
  tables, and whole-document Canvas composition are not implemented.
- Constrained Table-cell, repeated-header, explicit page-break, and
  default/approximate-versus-renderer drift rows remain explicitly blocked.
- Full cross-runtime measurement parity is not accepted.
- QA Canvas consumption of the per-fragment commands is not implemented yet.
  Current visual evidence remains the older plain-line XR-4 path.
- Default pagination measurement replacement remains blocked.
- Whole-document field/layout coverage and incremental invalidation remain
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
- The 25 warm samples cover one tiny initialized fixture. They do not establish
  a typing budget for long blocks, many Text Runs, or whole documents.
- The 23.1 ms warm long-row observation still reflows and fingerprints the
  complete 4,959-character block; XR-6 affected-range invalidation remains
  necessary.

### UNKNOWN

- Node/Browser parity for Table-cell and repeated-header owner pipelines.
- Default/approximate-versus-renderer drift values for the expanded rows under
  the accepted threshold policy.
- Final performance budgets for small and 200-page documents.
- Canvas paint cost and memory for styled, image, table, and 200-page content.
- Accepted glyph-position/outline reconciliation policy across Canvas and PDF.
- Final drift reconciliation UX between Live Draft and Published output.
