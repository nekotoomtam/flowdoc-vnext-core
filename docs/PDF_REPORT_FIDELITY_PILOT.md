# PDF Report Fidelity Pilot

Status: PDF-PILOT-08B-R2C-F natural composition evidence accepted.

Umbrella work item: `PDF-PILOT-INV-9437125258`.

## Objective

Produce a searchable Thai PDF from FlowDoc-owned document and measured-layout
facts, without using Word or DOCX as a runtime renderer. The target is the
12-page OCR benchmark report identified by the pinned external reference
artifact in `fixtures/pdf-report-font-bakeoff-corpus.v1.json`.

This is a bounded fidelity pilot. It does not claim a production PDF renderer.

## Pilot Acceptance Target

- input is a canonical FlowDoc fixture rather than imported DOCX;
- target page size is US Letter, `612 x 792 pt`;
- target page count is 12, with deviations treated as explicit QA failures;
- Thai text remains searchable, selectable, and copyable;
- font bytes embedded in output come only from registered redistributable
  assets;
- tables, five pinned PNG assets, callouts, headers, footers, and page numbers
  render without clipping or overlap;
- the same document, renderer profile, measurement profile, font hashes, and
  source assets produce deterministic artifact identity;
- visual similarity is required, but pixel identity with the Word-produced
  reference is not.

Bookmarks, external links, DOCX output, export UI, backend routes, production
storage, auth/authz, and worker lifecycle integration are outside this pilot.

## PDF-PILOT-01 Scope

Status: PDF-PILOT-01 font bake-off evidence accepted.

Phase 01 pins the reference artifact and source-image hashes, defines six
report-derived Thai/mixed-script samples, and compares these registered font
pairs through the package-local native Rustybuzz path:

- IBM Plex Sans Thai Regular/Bold;
- Sarabun Regular/Bold;
- Noto Sans Thai Regular/Bold;
- local Tahoma Regular/Bold as an external metric and visual reference only.

Tahoma bytes are not copied, retained, packaged, or referenced through a
repository path. The retained summary stores only its local SHA-256 identity
and normalized measurement results.

Next phase: `PDF-PILOT-02` measured PDF draw contract extension.

## Evidence Result

The retained summary is:

```text
packages/text-engine-rust-wasm/fixtures/pdf-report-font-bakeoff-summary.v1.json
```

The decision is:

```text
fixtures/pdf-report-font-bakeoff-decision.v1.json
```

Measured facts:

- all three comparison families cover all six samples with zero missing
  glyphs;
- Sarabun is the only same-token drop-in family under the accepted combined
  advance thresholds;
- IBM Plex Sans Thai is the Regular/body metric leader at `1.0237%` mean and
  `2.0742%` maximum absolute advance delta from local Tahoma;
- IBM Plex Bold is narrower and needs a separate initial scale calibration of
  `1.092188` before renderer-backed line-box review;
- IBM Plex Sans Thai is accepted for this pilot because its body metrics and
  visual tone fit the intended technical report, not because it is a drop-in
  Tahoma clone.

The selection remains pilot-only. `font-assets.v1.json` active `fontAssets`
and `styleMappings` are unchanged.

## PDF-PILOT-02 Scope

Status: PDF-PILOT-02 measured draw contract accepted.

Phase 02 adds the fail-closed measured draw handoff between the existing PDF
adapter plan and a future concrete renderer. It requires exact page boxes,
registered font/hash facts, shaped glyph runs, fill and stroke rectangles,
backend-owned image identities, and deterministic per-page paint order.

The representative fixture binds IBM Plex Sans Thai Regular and one pinned
report PNG to one Letter page. Every paint command preserves its source adapter
bounds exactly, and every source command must be covered. The result remains a
`not-rendered` artifact with null bytes and no production binding.

Primary Phase 02 evidence:

- `docs/PDF_MEASURED_DRAW_CONTRACT_V1.md`;
- `src/renderer/pdfMeasuredDrawContractV1.ts`;
- `fixtures/pdf-pilot-measured-draw-contract.v1.json`;
- `tests/pdfMeasuredDrawContractV1.test.ts`.

Next phase: `PDF-PILOT-03` Thai embedded-font one-page renderer proof.

## PDF-PILOT-03 Scope

Status: PDF-PILOT-03 Thai embedded-font one-page proof accepted.

Phase 03 adds an isolated external renderer profile for exactly one Letter
page. It consumes actual Rustybuzz glyph facts from the Phase 02 contract,
embeds a renamed GID-retaining IBM-derived TrueType subset through
Type0/CIDFontType2, and emits CIDToGIDMap, ToUnicode, and ActualText data.

Poppler and pypdf extract both retained Thai lines exactly. Poppler also
confirms embedded/subset/Unicode font flags, and a 150 DPI raster review passes
glyph placement, clipping, overlap, and panel geometry checks. Images,
multi-page execution, storage, and production binding remain blocked.

Primary Phase 03 evidence:

- `docs/PDF_THAI_ONE_PAGE_RENDERER_PROOF.md`;
- `packages/pdf-renderer-pilot/src/index.ts`;
- `packages/pdf-renderer-pilot/fixtures/one-page-proof-qa.v1.json`;
- `tests/pdfRendererPilotOnePage.test.ts`.

Next phase: `PDF-PILOT-04` digest-bound image and complete one-page paint proof.

## PDF-PILOT-04 Scope

Status: PDF-PILOT-04 digest-bound image and complete one-page paint proof accepted.

Phase 04 executes all four one-page paint-command kinds and binds caller-owned
PNG bytes to the exact image asset digest, dimensions, and media type. The
actual pinned OCR accuracy chart is embedded directly from its IDAT stream;
the external source PNG is not copied into the repository.

Poppler confirms one RGB `1950 x 900`, 8-bit image XObject. Pypdf reconstructs
the original `65,307` PNG bytes and exact SHA-256. Thai extraction remains
exact in both engines, and 150 DPI visual QA passes image aspect, bounds,
sharpness, paint order, and text regression checks.

Primary Phase 04 evidence:

- `docs/PDF_IMAGE_ONE_PAGE_RENDERER_PROOF.md`;
- `fixtures/pdf-pilot-image-one-page-request.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/image-one-page-proof-qa.v1.json`;
- `tests/pdfRendererPilotImageOnePage.test.ts`.

Next phase: `PDF-PILOT-05` multi-page font/image resource reuse proof.

## PDF-PILOT-05 Scope

Phase 05 assembles three measured Letter pages while emitting one shared font
object and one shared image object. All pages reference the font; pages 1 and 2
reference the image; page 3 has no XObject resource. The result retains six
Thai glyph runs and 14 ordered paint commands.

Poppler and pypdf confirm exact extraction on all pages, one font object, one
image object reused on two pages, and image counts `[1, 1, 0]`. Pdftoppm and
pdftocairo visual evidence passes all pages. Phase 03 and Phase 04 PDF hashes
remain byte-for-byte unchanged.

Primary Phase 05 evidence:

- `docs/PDF_MULTI_PAGE_RESOURCE_REUSE_PROOF.md`;
- `fixtures/pdf-pilot-shared-resources-three-page-request.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/shared-resources-three-page-qa.v1.json`;
- `tests/pdfRendererPilotSharedResources.test.ts`.

## PDF-PILOT-06 Scope

Phase 06 assembles five measured Letter pages and binds one different pinned
report PNG to every page. The profile requires five distinct SHA-256 identities
and exact one-to-one page coverage. One Type0 font object remains shared by all
five pages while five image objects remain page-specific.

Poppler and pypdf confirm exact Thai extraction on every page, font object `13`,
image objects `19` through `23`, page image counts `[1, 1, 1, 1, 1]`, and exact
RGB pixel identity against every external source. Both Poppler renderers pass
all portrait/landscape placements. A repeated build preserves the artifact
SHA-256, and Phase 03-05 identities remain unchanged.

Primary Phase 06 evidence:

- `docs/PDF_ALL_IMAGES_RESOURCE_MATRIX.md`;
- `fixtures/pdf-pilot-all-five-images-five-page-request.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/all-five-images-five-page-qa.v1.json`;
- `tests/pdfRendererPilotAllImages.test.ts`.

## PDF-PILOT-07 Scope

Phase 07 verifies the pinned 12-page reference identity, then expands a readable
canonical composition fixture into 509 measured draw commands and 528 paint
commands. The result executes 357 text runs, 8,549 glyph occurrences, 152 box
commands, five unique image objects, and six image paints. Page markers and
image bindings fail closed if their canonical order changes.

The larger Thai corpus qualifies vertical glyph offsets and multi-glyph
clusters through logical CIDs plus non-extracting artifact overlays. Poppler
finds all 357 runs raw; pypdf finds all after Thai-adjacent whitespace
normalization. Dual Poppler raster inspection passes all twelve pages, and
Phase 03-06 hashes remain unchanged.

Primary Phase 07 evidence:

- `docs/PDF_CANONICAL_REPORT_COMPOSITION_PROOF.md`;
- `fixtures/pdf-pilot-canonical-report-composition.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-twelve-page-qa.v1.json`;
- `tests/pdfRendererPilotCanonicalReport.test.ts`.

## PDF-PILOT-08A Scope

Phase 08A pins the external `build_report.py` identity and applies a separate,
fail-closed decision-content manifest over the unchanged Phase 07 composition.
The materialized 12-page request restores omitted Azure Native and Mapper facts,
the full source SHA and evidence details, complete glossary/reference values,
and corrects Azure OCR Raw JSON from `0.20 MB` to `0.10 MB`.

The contract requires 12 restored elements, 10 table row-count contracts, 8
exact values, 19 semantic strings, and at least 90% of the reference's extracted
non-whitespace character count. The accepted request reaches `91.7506%`, emits
391 text runs and 10,574 glyphs, passes Poppler/pypdf extraction and 12-page
visual QA, and leaves Phase 07 bytes unchanged.

Primary Phase 08A evidence:

- `docs/PDF_CANONICAL_REPORT_CONTENT_PARITY_PROOF.md`;
- `fixtures/pdf-pilot-canonical-report-content-parity.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-content-parity-twelve-page-qa.v1.json`;
- `tests/pdfRendererPilotCanonicalReportContentParity.test.ts`.

## PDF-PILOT-08B Scope

Phase 08B layers a fail-closed typography manifest over the accepted 08A
content composition. It raises body/callout/bullet text to `10.5 pt`, table body
to `9.1 pt`, table headers to `9.3 pt`, captions to `9 pt`, and executes a real
registered IBM Plex Sans Thai Bold subset for headings and table headers.

The builder supports caller-authored multi-line table cells without inferring
wrapping. All 13 style floors, 10 table contracts, two font identities, and the
full 08A semantic contract pass. Same-resolution inspection aligns weighted
median font sizes closely with the reference, while dual Poppler raster,
extraction, geometry, image identity, and deterministic rebuild checks pass all
12 pages. Phase 07 and 08A byte identities remain unchanged.

Primary Phase 08B evidence:

- `docs/PDF_CANONICAL_REPORT_TYPOGRAPHY_CALIBRATION_PROOF.md`;
- `fixtures/pdf-pilot-canonical-report-typography-calibration.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-typography-calibrated-twelve-page-qa.v1.json`;
- `tests/pdfRendererPilotCanonicalReportTypography.test.ts`.

## PDF-PILOT-08B-R1 Scope

Phase 08B-R1 corrects the acceptance gap left by semantic coverage and
typography checks. It pins `build_report.py`, `metrics.json`,
`ground-truth.json`, `benchmark-spec.json`, and `analyze.ts`; verifies their
byte identities; recomputes summary consistency; and derives 205 scalar values
for 16 report elements before shaping.

The audit corrects two maximum-latency values and five Run IDs. The corrected
request retains the 08B geometry, 413 text runs, 10,562 glyphs, two font
subsets, and five images. Both Poppler raster tools, extraction, visual checks,
and deterministic rebuild pass all 12 pages. The 08B artifact remains
unchanged as regression evidence, while its factual claim is explicitly
superseded.

Primary Phase 08B-R1 evidence:

- `docs/PDF_CANONICAL_REPORT_SOURCE_DATA_CORRECTION_PROOF.md`;
- `fixtures/pdf-pilot-canonical-report-source-data.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-source-backed-twelve-page-qa.v1.json`;
- `tests/pdfRendererPilotCanonicalReportSourceData.test.ts`.

## PDF-PILOT-08B-R2A Scope

Phase 08B-R2A replaces the pilot-only source-to-final-lines bridge with a
FlowDoc-native report data boundary. The OCR benchmark adapter verifies five
data files and five image files, reproduces the R1 source snapshot, and emits
published field/collection contracts plus exact-revision scalar, collection,
and media snapshots.

The accepted bundle contains 154 fields, 148 scalar/image values, 6
collections, 73 collection items, and 5 media bindings. Every value or item
retains source provenance. Contract ownership, source-set identity, field and
item types, media identity, deterministic fingerprint, and absence of layout
facts fail closed.

R2A deliberately does not resolve a template, format final display strings,
measure text, wrap lines, lay out pages, paginate, or render PDF bytes. The R1
PDF remains the factual/visual oracle rather than a production-path artifact.

Primary Phase 08B-R2A evidence:

- `docs/PDF_CANONICAL_REPORT_DATA_BINDING_LOCK.md`;
- `fixtures/pdf-pilot-canonical-report-data-bundle.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-data-bundle-qa.v1.json`;
- `tests/pdfRendererPilotCanonicalReportDataBundle.test.ts`.

## PDF-PILOT-08B-R2B Scope

Phase 08B-R2B consumes the accepted R2A data bundle through a native Document
v4 report template. The template owns twelve semantic sections, IBM Plex Sans
Thai style roles, five image placements, 114 scalar placements, and six
collection tables on additive US Letter page settings. It does not claim that
the twelve sections will paginate to twelve pages.

The generic scoped-resolution bridge validates each table definition,
collection-item contract, content-binding contract, and source graph before it
defers item-scoped placements from document-level resolution. It then resolves
document-scoped scalar/image fields and materializes 73 collection rows, 476
cells, and 476 item bindings with deterministic derived identities. All 154
published fields are explicitly classified: 125 presentation-bound and 29
critical evidence-only fields.

R2B preserves the revision-1 instance graph rather than claiming initial
materialization. Locale-aware display formatting, text measurement, automatic
line breaking, layout, pagination, and PDF rendering remain `not-run`.

Primary Phase 08B-R2B evidence:

- `docs/PDF_CANONICAL_REPORT_TEMPLATE_RESOLUTION_PROOF.md`;
- `fixtures/pdf-pilot-canonical-report-template-resolution.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-template-resolution-qa.v1.json`;
- `tests/pdfRendererPilotCanonicalReportTemplateResolution.test.ts`.

## PDF-PILOT-08B-R2C-A Scope

Phase 08B-R2C-A adds a published, typed Display Formatting v1 sidecar between
R2B resolution and future text measurement. The report catalog contains 22
used deterministic formats, assigns all 143 scalar fields and 63 collection
item fields, and formats 114 document plus 476 collection bindings without
changing raw values, resolved identities, or the Document v4 graph.

The formatter reproduces the accepted report oracle for percentages,
durations, byte sizes, THB/USD values, boolean and enum labels, Thai Gregorian
dates, and UTC instants. It pins Latin digits, decimal/group separators, UTC,
Gregorian calendar, and ECMAScript fixed-digit behavior with
`runtimeIntl: false`.

R2C-A produces a complete display overlay that is ready for measurement-request
preparation. Available widths, table geometry, measurement requests, text
measurement, line breaking, layout, pagination, and PDF rendering remain
`not-run`.

Primary Phase 08B-R2C-A evidence:

- `docs/PDF_CANONICAL_REPORT_DISPLAY_FORMATTING_PROOF.md`;
- `fixtures/pdf-pilot-canonical-report-display-formatting.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-display-formatting-qa.v1.json`;
- `tests/pdfRendererPilotCanonicalReportDisplayFormatting.test.ts`.

## PDF-PILOT-08B-R2C-B Scope

Phase 08B-R2C-B consumes the exact R2A, R2B, and R2C-A fingerprints and
prepares the first native measurement-request handoff. It derives one stable
IBM Plex Sans Thai Regular/Bold profile from registered font hashes and all six
report style mappings, while retaining rustybuzz and planned ICU4X identity
without executing either engine.

Portrait Letter geometry produces a `498.614173pt` body width. Authored 175mm
tables use the retained `4pt` cell insets and produce 126 deterministic cell
geometries. The display overlay reaches 150 document requests, 63 authored
header requests, and 476 materialized item requests: 689 ready requests in
total. Twelve footer blocks remain deferred because their page-number inlines
require generated expansion.

The geometry reveals that the exhaustive equal-width OCR and Native tables use
19 and 21 columns, leaving only `18.108579pt` and `15.622047pt` of text width.
The handoff is accepted, but report-wide engine execution is gated on revising
the table projection. Automatic wrapping cannot repair an unsuitable table
shape.

Text shaping, line breaking, line boxes, layout, pagination, and PDF rendering
remain `not-run`.

Primary Phase 08B-R2C-B evidence:

- `docs/PDF_CANONICAL_REPORT_MEASUREMENT_HANDOFF_PROOF.md`;
- `fixtures/pdf-pilot-canonical-report-measurement-handoff.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-measurement-handoff-qa.v1.json`;
- `tests/pdfRendererPilotCanonicalReportMeasurementHandoff.test.ts`.

## PDF-PILOT-08B-R2C-C Scope

Phase 08B-R2C-C consumes the exact R2A through R2C-B fingerprints and replaces
the six exhaustive collection tables with fifteen labelled presentation
views. All 63 source item fields retain exactly one primary placement; ten
engine, Run ID, and schema-path contexts repeat explicitly across split views.
The source collection contracts, source rows, raw values, and R2C-A formatting
overlay remain unchanged.

Each projected view has at most six columns, explicit shares totaling 100%,
and a minimum 10% share within the retained 175mm table width. The minimum
cell content width rises from `15.622047pt` to `41.606299pt`. Core scoped
resolution materializes 131 presentation rows and 544 item bindings, then
prepares 165 document, 73 authored table, and 544 materialized table requests:
782 ready requests in total. Twelve generated page-number blocks remain
deferred.

Text shaping, line breaking, line boxes, layout, pagination, and PDF rendering
remain `not-run`.

Primary Phase 08B-R2C-C evidence:

- `docs/PDF_CANONICAL_REPORT_TABLE_PROJECTION_PROOF.md`;
- `fixtures/pdf-pilot-canonical-report-table-projection.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-table-projection-qa.v1.json`;
- `tests/pdfRendererPilotCanonicalReportTableProjection.test.ts`.

## PDF-PILOT-08B-R2C-D Scope

Phase 08B-R2C-D consumes the exact R2C-C fingerprint, binds the report profile
to registered IBM Plex Sans Thai Regular/Bold assets, and executes the
package-local native rustybuzz `0.20.1` binary. The binding is run-aware: 114
Bold label overrides inside Regular blocks remain separate shaping runs.

The 782 block consumers contain 896 runs. One empty cell remains a zero-glyph
run. The remaining 895 runs deduplicate into 434 native executions, while 412
width-sensitive measurement variants preserve the later line-break inputs.
The accepted evidence maps 10,032 glyphs from UTF-8 byte clusters to FlowDoc
UTF-16 ranges with zero missing glyphs.

This closes native glyph execution only. Concrete ICU4X code/data revisions,
native line-height bindings, line boxes, WASM shaping parity, layout,
pagination, and PDF rendering remain blocked or `not-run`.

Primary Phase 08B-R2C-D evidence:

- `docs/PDF_CANONICAL_REPORT_NATIVE_SHAPING_PROOF.md`;
- `fixtures/pdf-pilot-canonical-report-native-shaping.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-native-shaping-raw.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-native-shaping-qa.v1.json`;
- `tests/pdfRendererPilotCanonicalReportNativeShaping.test.ts`.

## PDF-PILOT-08B-R2C-E Scope

Phase 08B-R2C-E consumes the exact R2C-D fingerprint, binds all six report
styles to retained typography line heights, and executes native
`icu_segmenter 2.2.0` with compiled `icu_segmenter_data 2.2.0`. ICU4X UTF-8
byte boundaries are converted to verified FlowDoc UTF-16 offsets before
wrapping.

The 412 measurement variants deduplicate into 352 non-empty segmentation
executions plus one explicit empty-line policy. ICU4X supplies the base UAX #14
breaks. A report-only policy adds breaks after machine-identifier delimiters;
normal Thai and prose remain unchanged. This creates 441 line boxes, wraps 29
measurements, covers all 10,998 measurement glyphs exactly once, and leaves
zero width overflow.

This closes node-native break and line-box evidence only. The source profile
still retains planned ICU4X identity. WASM parity, production binding,
vertical block/table composition, pagination, and PDF rendering remain blocked
or `not-run`.

Primary Phase 08B-R2C-E evidence:

- `docs/PDF_CANONICAL_REPORT_LINE_BREAKING_PROOF.md`;
- `fixtures/pdf-pilot-canonical-report-line-breaking.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-line-segmentation-raw.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-line-breaking-qa.v1.json`;
- `tests/pdfRendererPilotCanonicalReportLineBreaking.test.ts`.

## PDF-PILOT-08B-R2C-F Scope

Phase 08B-R2C-F expands the 412 deduplicated R2C-E measurements back to all
782 concrete source consumers and submits each result to Core measured-line
acceptance. All consumers pass, producing 832 consumer-specific lines with
safe authored/resolved source endpoints. The document lane retains 165 text
blocks and five fixed instance-media image frames.

The existing Core table preparation pipeline accepts both authored and
materialized text evidence, then prepares 15 tables, 146 rows, and 617 cells.
Natural whole-row heights use the Core minimum-fragment/cell-outer-height rule,
range from 19pt to 30pt, and total 3240pt. The 36 zone flows preserve all 197
top-level nodes in authored order: 185 are ready and twelve generated
page-number footer blocks remain explicitly deferred.

This closes natural block, image, table-row, and ordered-flow evidence only.
Inter-block spacing, coordinates, page capacity, header repetition, row
splitting, pagination, and PDF rendering remain blocked or `not-run`.

Primary Phase 08B-R2C-F evidence:

- `docs/PDF_CANONICAL_REPORT_MEASURED_COMPOSITION_PROOF.md`;
- `fixtures/pdf-pilot-canonical-report-measured-composition.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-measured-composition-qa.v1.json`;
- `tests/pdfRendererPilotCanonicalReportMeasuredComposition.test.ts`.

## Reproduction

On a licensed Windows machine with Tahoma installed:

```text
npm --prefix packages/text-engine-rust-wasm run pdf-font-bakeoff
```

On another environment, provide external reference paths without copying the
font into the repository:

```text
FLOWDOC_PDF_REFERENCE_FONT_REGULAR=<path> \
FLOWDOC_PDF_REFERENCE_FONT_BOLD=<path> \
npm --prefix packages/text-engine-rust-wasm run pdf-font-bakeoff
```

The builder verifies registered candidate hashes, builds the existing native
Rustybuzz smoke executable, emits normalized advance summaries, and retains no
raw glyph arrays or absolute font paths.

Build the retained one-page text/font evidence and local PDF:

```text
npm --prefix packages/pdf-renderer-pilot run build:request
npm --prefix packages/pdf-renderer-pilot run build:subset
npm --prefix packages/pdf-renderer-pilot run build:proof
```

Build the digest-bound image request and local PDF. Outside the sibling report
workspace, provide the external pinned PNG without copying it into Core:

```text
FLOWDOC_PDF_PILOT_OCR_ACCURACY_IMAGE=<path-to-ocr_accuracy.png> \
npm --prefix packages/pdf-renderer-pilot run build:image-request

FLOWDOC_PDF_PILOT_OCR_ACCURACY_IMAGE=<path-to-ocr_accuracy.png> \
npm --prefix packages/pdf-renderer-pilot run build:image-proof
```

Build the shared-resource multi-page request and local proof:

```text
npm --prefix packages/pdf-renderer-pilot run build:multi-page-request

FLOWDOC_PDF_PILOT_OCR_ACCURACY_IMAGE=<path-to-ocr_accuracy.png> \
npm --prefix packages/pdf-renderer-pilot run build:multi-page-proof
```

Build the all-five-image request and local proof. Set the external asset root
when the sibling report workspace is unavailable:

```text
FLOWDOC_PDF_PILOT_REPORT_ASSET_ROOT=<path-to-report-assets> \
npm --prefix packages/pdf-renderer-pilot run build:all-images-request

FLOWDOC_PDF_PILOT_REPORT_ASSET_ROOT=<path-to-report-assets> \
npm --prefix packages/pdf-renderer-pilot run build:all-images-proof
```

Build the canonical composition, dedicated subset, and local twelve-page proof:

```text
FLOWDOC_PDF_PILOT_REPORT_ROOT=<path-to-report-directory> \
npm --prefix packages/pdf-renderer-pilot run build:canonical-request

npm --prefix packages/pdf-renderer-pilot run build:canonical-subset

FLOWDOC_PDF_PILOT_REPORT_ROOT=<path-to-report-directory> \
npm --prefix packages/pdf-renderer-pilot run build:canonical-proof
```

Build the separate decision-content parity request, subset, and local proof:

```text
FLOWDOC_PDF_PILOT_REPORT_ROOT=<path-to-report-directory> \
npm --prefix packages/pdf-renderer-pilot run build:content-parity-request

npm --prefix packages/pdf-renderer-pilot run build:content-parity-subset

FLOWDOC_PDF_PILOT_REPORT_ROOT=<path-to-report-directory> \
npm --prefix packages/pdf-renderer-pilot run build:content-parity-proof
```

Build the calibrated Regular/Bold request, subsets, and local proof:

```text
FLOWDOC_PDF_PILOT_REPORT_ROOT=<path-to-report-directory> \
npm --prefix packages/pdf-renderer-pilot run build:typography-request

npm --prefix packages/pdf-renderer-pilot run build:typography-subsets

FLOWDOC_PDF_PILOT_REPORT_ROOT=<path-to-report-directory> \
npm --prefix packages/pdf-renderer-pilot run build:typography-proof
```

Build the source snapshot, source-bound request, and corrected local proof:

```text
FLOWDOC_PDF_PILOT_REPORT_ROOT=<path-to-report-directory> \
npm --prefix packages/pdf-renderer-pilot run build:source-data-manifest

FLOWDOC_PDF_PILOT_REPORT_ROOT=<path-to-report-directory> \
npm --prefix packages/pdf-renderer-pilot run build:source-data-request

FLOWDOC_PDF_PILOT_REPORT_ROOT=<path-to-report-directory> \
npm --prefix packages/pdf-renderer-pilot run build:source-data-proof
```

Build the FlowDoc-native report data bundle without resolving or laying out a
document:

```text
FLOWDOC_PDF_PILOT_REPORT_ROOT=<path-to-report-directory> \
npm --prefix packages/pdf-renderer-pilot run build:report-data-bundle
```

Build and validate the deterministic canonical template-resolution bundle:

```text
npm --prefix packages/pdf-renderer-pilot run build:report-template-resolution
```

Build and validate the typed display-formatting overlay:

```text
npm --prefix packages/pdf-renderer-pilot run build:report-display-formatting
```

Build and validate the measurement-request and table-geometry handoff:

```text
npm --prefix packages/pdf-renderer-pilot run build:report-measurement-handoff
```

Build and validate the table projection and corrected geometry handoff:

```text
npm --prefix packages/pdf-renderer-pilot run build:report-table-projection
```

Build and validate native report shaping evidence:

```text
npm --prefix packages/pdf-renderer-pilot run build:report-native-shaping
```

Build and validate native report line-breaking evidence:

```text
npm --prefix packages/pdf-renderer-pilot run build:report-line-breaking
```

Build and validate measured block/table composition evidence:

```text
npm --prefix packages/pdf-renderer-pilot run build:report-measured-composition
```

## PASS

- The work is recorded as one dedicated PDF pilot with explicit subphases.
- Reference PDF and PNG identities are pinned without copying the external
  report into Core.
- Tahoma remains external and unredistributed.
- Rustybuzz comparison evidence is generated from report-derived text.
- IBM Plex is selected for pilot calibration with its Bold mismatch explicit.
- Active measurement identity and style mappings remain unchanged.
- The measured draw contract preserves exact source bounds, paint order,
  font/image identity, and complete glyph-cluster coverage without rendering.
- The isolated one-page renderer embeds a real GID-retaining Type0 subset and
  passes exact Thai extraction in Poppler and pypdf.
- Deterministic subset bytes, PDF bytes, and 150 DPI visual QA evidence pass.
- Digest-bound PNG execution, exact image round-trip identity, and all four
  one-page paint-command kinds pass.
- One shared font object and one shared image object pass deterministic
  cross-page reference, extraction, and visual QA.
- Five distinct pinned image objects pass one-to-one page coverage, exact pixel
  identity, Thai extraction, and portrait/landscape visual QA.
- Twelve canonical pages pass fixed page identity, measured table/callout
  composition, full-corpus Thai cluster execution, and exact text-run presence.
- Decision-content parity restores every retained semantic requirement, exceeds
  90% extracted-character coverage, and corrects the source-backed Azure Raw
  JSON value without changing Phase 07 bytes.
- Typography calibration executes source-backed Regular/Bold subsets, matches
  reference-scale body/table medians, and preserves every 08A content assertion
  without overlap, clipping, or prior artifact drift.
- Source-data binding verifies five external identities, derives 205 values
  across 16 elements, corrects seven factual drifts, and rejects stale source
  or snapshot content before shaping.
- Report data binding emits exact-revision FlowDoc field, collection, scalar,
  and media contracts with complete provenance while retaining no layout or
  PDF facts.
- Canonical template resolution preserves the exact R2A instance graph,
  validates six collection scopes before deferral, materializes all 73 rows
  and 476 item values deterministically, and classifies all 154 fields without
  introducing measurement or layout facts.
- Typed display formatting assigns every scalar and collection item field,
  reproduces 590 report display strings with retained raw lineage, and avoids
  runtime locale dependencies while leaving measurement and layout inactive.
- Measurement-request handoff prepares 689 exact-width display-backed requests,
  retains all source identities, defers generated page numbers, and exposes the
  19/21-column table geometry before engine execution.
- Table projection gives all 63 collection item fields one primary placement,
  preserves ten explicit contexts across fifteen views, caps views at six
  columns, prepares 782 requests, and clears the narrow-cell geometry gate
  without mutating source contracts or running the text engine.
- Native report shaping preserves all 782 consumers and 896 authored runs,
  deduplicates 895 non-empty runs into 434 real rustybuzz executions, maps
  10,032 IBM Plex glyphs with no missing glyphs, and retains no synthetic line
  boxes.
- Native report line breaking binds six calibrated line heights, executes 352
  unique ICU4X segmentations for 412 variants, creates 441 contiguous line
  boxes, covers 10,998 measurement glyphs exactly once, and clears all width
  overflow with explicit machine-identifier delimiter tailoring.
- Measured report composition expands line boxes to 782 Core-accepted
  consumers, prepares 165 document blocks, five image frames, 15 tables, 146
  rows, and 617 cells, and inventories 197 ordered flow nodes with twelve
  generated footer blocks explicitly deferred.

## FAIL / BLOCKER

None for closing PDF-PILOT-08B-R2C-F natural composition evidence.

Report-level PDF fidelity remains blocked on calibrated region-aware visual-diff
thresholds, broader reader compatibility, source-profile promotion, native to
WASM parity, inter-block spacing, page-capacity composition, vertical
placement, pagination, and PDF rendering.

## RISK

- Phase 01 advance compatibility alone does not prove ascent, descent,
  line-gap, or wrapping fidelity.
- Local Tahoma hashes identify this machine's reference version only.
- IBM Plex Bold requires per-style calibration and must not inherit a global
  body scale.
- Phase 03 retains normalized visual QA facts, but its raster remains local and
  covers only one page.
- Phase 04/06 qualify opaque RGB PNG only; alpha, palette, JPEG, and
  transparency remain open.
- Phase 08B uses a real 700-weight Bold face. Phase 08C must decide through
  region-aware visual evidence whether any role needs a lighter weight.
- R2C-E tailors machine identifiers after `.`, `_`, `/`, and `-`; later
  multilingual and URL policy must remain separately qualified.

## UNKNOWN

- final production embedded-font subset strategy;
- renderer-backed line-box deltas;
- automatic block spacing and page-capacity policy over accepted natural
  block/table heights;
- cross-language rounding parity for future exact half-way decimal values;
- concrete PDF package and dependency budget;
- report-wide visual-diff thresholds and reader compatibility beyond Poppler
  and pypdf.

## Intentionally Not Changed

- no font candidate was promoted into active style mappings;
- no default measurer or measurement profile was replaced;
- no existing PDF adapter or minimal Helvetica spike behavior changed;
- the new renderer remains an isolated pilot package with no production bind;
- no external report PNG bytes were copied into the repository;
- no DOCX work was introduced;
- no backend/editor route, worker, storage, or UI behavior changed;
- active package v2/document v3 behavior did not change; target Document v4
  gained additive `Letter` support while retaining `A4`.

Next phase: `PDF-PILOT-08B-R2C-G` vertical flow spacing and page-capacity
composition.
