# PDF Report Fidelity Pilot

Status: PDF-PILOT-06 all-five-image resource matrix accepted.

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

## FAIL / BLOCKER

None for closing PDF-PILOT-06.

Report-level PDF fidelity remains blocked on canonical 12-page content,
page-specific composition, and report-wide visual comparison.

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
- Phase 06 uses repeated panel/text content; distinct report page templates,
  headers, footers, tables, and page numbering remain open.

## UNKNOWN

- final production embedded-font subset strategy;
- renderer-backed line-box deltas;
- mixed Thai/Latin extraction order beyond the two accepted one-page lines;
- table and heading wrap behavior after style-token calibration;
- concrete PDF package and dependency budget.
- canonical 12-page object counts, artifact size, and visual-diff thresholds.

## Intentionally Not Changed

- no font candidate was promoted into active style mappings;
- no default measurer or measurement profile was replaced;
- no existing PDF adapter or minimal Helvetica spike behavior changed;
- the new renderer remains an isolated pilot package with no production bind;
- no external report PNG bytes were copied into the repository;
- no DOCX work was introduced;
- no backend/editor route, worker, storage, or UI behavior changed;
- no package/document schema changed.

Next phase: `PDF-PILOT-07` canonical 12-page report composition fixture.
