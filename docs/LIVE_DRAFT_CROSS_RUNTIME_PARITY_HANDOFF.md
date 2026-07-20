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
| `flowdoc-vnext-core` | `3c55681` | canonical contracts, layout/pagination, measurement boundaries, text-engine evidence, measured draw contracts |
| `flowdoc-vnext-editor` | `2053c27` | Design/Preview workspace, dynamic Form/JSON state, exact-preview lifecycle, PDF.js page inspection |
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

- Inject the worker-backed measurer into Core without replacing the default.
- Run one text block through the same Core pagination boundary in Worker and
  Node.
- Compare break offsets, line boxes, fragment geometry, page count, warnings,
  and deterministic fingerprints.
- Fail closed on identity mismatch.

Exit: one-block Node/Worker parity is accepted under one pinned profile.

### LIVE-DRAFT-XR-3: Form-To-Live-Draft Binding

- Project the latest Form candidate into a revision-pinned worker request.
- Debounce bursts without losing the final value.
- Cancel or ignore obsolete work.
- Preserve the previous valid pages while the next revision is running.
- Expose updating, current, approximate, blocked, and stale states honestly.

Exit: typing changes the Draft page without creating a Backend request per
keystroke.

### LIVE-DRAFT-XR-4: Canvas Page Renderer

- Paint shared display-list output to stable A4 page canvases.
- Support text, styled runs, field values, images, tables, and repeated headers
  only as each contract becomes accepted.
- Add bounded zoom and page virtualization.
- Keep page dimensions stable while content updates.

Exit: the first accepted fixtures are nonblank, readable, and visually stable
at desktop and mobile widths.

### LIVE-DRAFT-XR-5: Cross-Runtime Matrix

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

Start with `LIVE-DRAFT-XR-0` and `LIVE-DRAFT-XR-1` only.

1. Read the files under **Required Reading**.
2. Prove with a focused Editor test that `layout.live` is still placeholder
   behavior and that Form typing does not currently produce page output.
3. Audit the text-engine package dependency graph for a browser Worker import.
4. Add or refine runtime-specific entry points without importing WASM into
   Core.
5. Run the two accepted measurement rows in a real Browser Worker.
6. Compare their normalized results with Node evidence under the same pinned
   profile/font/WASM identities.
7. Stop after retained smoke evidence. Do not bind Editor Form state or replace
   the default measurer in the same slice.

## Required Reading

Core:

- `docs/MEASUREMENT_HARDENING_CLOSE_AUDIT.md`
- `docs/RUST_WASM_TEXT_ENGINE_BOUNDARY.md`
- `docs/TEXT_ENGINE_RENDERER_BACKED_PROVIDER_BOUNDARY.md`
- `docs/MEASUREMENT_PROFILE_IDENTITY_CONTRACT.md`
- `src/renderer/textMeasurementAdapter.ts`
- `src/pagination/textMeasurement.ts`
- `src/pagination/layoutPipeline.ts`
- `packages/text-engine-rust-wasm/src/index.ts`
- `packages/text-engine-rust-wasm/src/runtimeIdentity.ts`
- `packages/text-engine-rust-wasm/src/rendererBackedProvider.ts`

Editor:

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
editing. Start with LIVE-DRAFT-XR-0 and LIVE-DRAFT-XR-1 only. Establish the
current Editor placeholder baseline, audit browser Worker compatibility of
@flowdoc/text-engine-rust-wasm, and prove the two currently accepted Thai and
Latin measurement rows in a real Browser Worker against Node evidence.

Preserve the Core dependency boundary, do not replace measureVNextText(...),
do not bind Form state yet, do not add a Backend request per keystroke, and do
not claim general cross-runtime exactness. Add focused tests, retain identity
and parity evidence, update the handoff with PASS/FAIL/RISK/UNKNOWN, then commit
and push each changed repository to main.
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
general cross-runtime exactness. The next implementation slice is XR-2, one
text block through the same injected Core layout/pagination boundary in Node
and Worker.

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
- Editor retains the placeholder baseline, worker protocol, identity pins,
  stale-result comparison, and Browser Worker smoke evidence without Form
  binding.

### FAIL-BLOCKER

- Editor has no real Live Draft text/layout execution yet.
- Full cross-runtime measurement parity is not accepted.
- Default pagination measurement replacement remains blocked.
- No text block has passed the shared Core layout/pagination boundary in both
  runtimes yet; XR-2 remains the next blocker.

### RISK

- Existing historical docs can be mistaken for current adapter status.
- A visually convincing DOM preview could be mistaken for exact pagination.
- Large-document reflow can overwhelm the browser without worker chunking and
  invalidation.
- The executable ICU4X/Rustybuzz WASM is about 1.06 MB before transport-level
  compression; initialization and caching budgets need broader evidence.

### UNKNOWN

- Measured Node/Browser parity beyond the two accepted rows.
- Final performance budgets for small and 200-page documents.
- Final drift reconciliation UX between Live Draft and Published output.
