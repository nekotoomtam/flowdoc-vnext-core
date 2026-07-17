# FlowDoc PDF Renderer Pilot

This private external package executes bounded PDF fidelity proofs from public
`@flowdoc/vnext-core` measured draw contracts. It is not the production PDF
renderer and Core does not import it.

## PDF-PILOT-03 Profile

The first profile accepts exactly one page containing opaque glyph runs, fills,
and strokes. It embeds a caller-supplied GID-retaining TrueType subset as a
Type0/CIDFontType2 font, uses contract advances and offsets without reshaping,
and writes both ToUnicode and ActualText extraction data.

Image commands, vertical glyph offsets, transparency, storage, routes, and
production binding fail closed.

## PDF-PILOT-04 Profile

The second profile executes all four one-page paint-command kinds. Caller-owned
8-bit grayscale/RGB PNG bytes are checked against contract digest and dimensions
before their IDAT stream is embedded as a PDF Image XObject. Contain, cover,
and normalized crop use explicit clipping matrices; alpha, palette, JPEG,
transparency, and production binding fail closed.

## PDF-PILOT-05 Profile

The third profile accepts 2-12 measured pages and emits one PDF object per
unique font/image resource. Page dictionaries reference only resources used by
their commands. The retained proof shares one font across three pages and one
image across two pages while preserving both earlier one-page byte identities.

## PDF-PILOT-06 Profile

The fourth profile requires five pages and five distinct image digests, with
exactly one unique image binding per page. The retained proof executes all five
pinned report PNGs, reuses one font object across every page, and rejects
missing, repeated, or unreferenced image-matrix entries.

## PDF-PILOT-07 Profile

The fifth profile accepts only the canonical 12-page OCR benchmark composition.
It validates page markers and six page-to-image bindings, executes 357 measured
text runs and table/callout geometry, and supports measured Thai vertical
offsets through non-extracting continuation-glyph overlays.

## Measured Composition Evidence

`PDF-PILOT-08B-R2C-F` consumes the canonical projection, native shaping, and
line-breaking bundles. It accepts all concrete line results through Core,
prepares table cells and rows with the public Core pipeline, derives natural
text/image/row heights, and inventories authored zone order. This evidence does
not assign coordinates or pages and does not render PDF bytes.

## Vertical Capacity Evidence

`PDF-PILOT-08B-R2C-G` binds exact root-adjacency spacing, Letter page regions,
static-zone reservations, and a Core document-composition manifest. Every body
root can make fresh-page progress, but fresh section boundaries produce a
seventeen-page natural floor against the twelve-page target. The spacing bridge,
generated footer measurement, pagination, and PDF rendering remain blocked.

## Section Reconciliation Evidence

`PDF-PILOT-08B-R2C-H` proves all twelve semantic sections share equivalent
page, header, and footer content, then projects them into one continuous Core
composition section while retaining all 185 roots and semantic-zone lineage.
It binds every root to the Core demand/window spacing bridge and restores an
explicit 11pt gap before eleven non-initial semantic headings. Gross demand is
thirteen capacity units; twelve-page fidelity remains blocked until real
page-top suppression and pagination overhead are known.

## Pagination Input Evidence

`PDF-PILOT-08B-R2C-I` binds all 185 roots to exact measured/prepared/atomic
sources, bounded family configurations, real initial family cursors, and a
refinalized Core composition manifest. It also measures the generated footer
capacity sample `8888` through native rustybuzz, ICU4X, line wrapping, and Core
acceptance. Actual family pagination, page numbers, page assignment, and PDF
rendering remain blocked.

## Pagination Execution Evidence

`PDF-PILOT-08B-R2C-J` executes all family paginators through the Core spacing
bridge and document transition with one-page, one-fragment windows. The
resumable execution finalizes all 185 roots as 187 placements on thirteen
pages, including two repeated table-header fragments. Page count is
content-driven under R2C-N. Actual footer page-number expansion, static
zone paint instances, renderer handoff, and PDF output remain blocked.

## Full Renderer Handoff Evidence

`PDF-PILOT-08B-R2C-L` replays the final bounded document execution to recover
the exact Table windows, projects all measured body text, fixed images, Table
backgrounds, text, and border lines, and merges them with page-specific static
zones. Core accepts the resulting thirteen-page measured-draw contract with
1,778 commands, two IBM Plex font assets, five backend-owned image assets,
zero missing glyphs, and no renderer relayout. PDF bytes and visual acceptance
remain downstream from R2C-L.

## Full-Document Renderer Execution

`PDF-PILOT-08B-R2C-M` pins the complete R2C-L contract by profile, Core
fingerprint, and serialized-content SHA-256. It builds separate Regular/Bold
GID-retaining subsets, verifies five external PNG resources, and emits the
same 1,223,440-byte thirteen-page PDF on repeated execution. Independent
`pypdf`, Poppler, content-stream, extraction, and raster checks accept the PDF
structure. The artifact remains local under `output/pdf/`; visual fidelity and
the twelve-page decision are not accepted by this phase.

## Visual Comparison and Page-Count Decision

`PDF-PILOT-08B-R2C-N` compares the pinned reference and exact R2C-M artifact
through PDF geometry/text facts and local 96-DPI raster occupancy. The
candidate carries 30.58% more extracted non-whitespace text, materially more
Bold text, non-uniform section movement, and a retained 328pt final Table
continuation. A reference-envelope calculation leaves only 1.966928pt of
theoretical twelve-page headroom and is not capacity proof.

Visual fidelity remains rejected. The corrected source-backed profile now uses
content-driven page count, with this exact thirteen-page result authoritative.
No PDF or raster bytes are retained by the comparison fixture.

## Reader Hierarchy Calibration

`PDF-PILOT-08B-R2C-O` binds executive and decision narrative to 22 ordinary
scalar placements, removes generic Bold from scalar labels, and retains local
Bold only for two reader labels. The exact regenerated PDF remains 13 pages
with 185 body entries, 187 placements, and zero missing glyphs.

Against the accepted R2C-N baseline, Bold share moves from 41.75% to 9.16%
versus 15.89% in the reference. Executive-summary extracted text grows from
290 to 810 characters and decision-view text from 74 to 468, while total
candidate density increases. Information hierarchy is accepted; static-zone
geometry, section composition, visual fidelity, and production binding are not.

## Static and Section Calibration

`PDF-PILOT-08B-R2C-P` moves the Letter frame to measured reference-backed
inputs: `72.02pt` left, `72.03pt` right, a `32.22pt` header reservation, and a
`24pt` footer reservation. Header error falls to zero, footer error to `0.39pt`,
body-left error to zero, and body-top error to `1.54pt`. Tables, images, and
text share the calibrated `467.95pt` width with zero draw-command overflow.

Ten reader summaries and two reader labels use explicit semantic categories
with measured 12/6/3/12pt adjacency rules. Core regenerates 185 body roots as
189 placements on 13 pages with zero missing glyphs. Static geometry and
semantic composition are accepted; callout styling, region-level parity,
fixed page count, and production binding remain rejected.

## Reproduction

Build actual Rustybuzz glyph facts:

```text
npm --prefix packages/pdf-renderer-pilot run build:request
npm --prefix packages/pdf-renderer-pilot run build:image-request
npm --prefix packages/pdf-renderer-pilot run build:multi-page-request
npm --prefix packages/pdf-renderer-pilot run build:all-images-request
npm --prefix packages/pdf-renderer-pilot run build:canonical-request
npm --prefix packages/pdf-renderer-pilot run build:content-parity-request
npm --prefix packages/pdf-renderer-pilot run build:typography-request
npm --prefix packages/pdf-renderer-pilot run build:report-native-shaping
npm --prefix packages/pdf-renderer-pilot run build:report-line-breaking
npm --prefix packages/pdf-renderer-pilot run build:report-measured-composition
npm --prefix packages/pdf-renderer-pilot run build:report-vertical-capacity
npm --prefix packages/pdf-renderer-pilot run build:report-section-reconciliation
npm --prefix packages/pdf-renderer-pilot run build:report-pagination-inputs
npm --prefix packages/pdf-renderer-pilot run build:report-pagination-execution
npm --prefix packages/pdf-renderer-pilot run build:report-static-zone-handoff
npm --prefix packages/pdf-renderer-pilot run build:report-body-display-list
npm --prefix packages/pdf-renderer-pilot run build:full-document-subsets
npm --prefix packages/pdf-renderer-pilot run build:full-document-proof
```

Build the retained subset with Python FontTools:

```text
npm --prefix packages/pdf-renderer-pilot run build:subset
npm --prefix packages/pdf-renderer-pilot run build:canonical-subset
npm --prefix packages/pdf-renderer-pilot run build:content-parity-subset
npm --prefix packages/pdf-renderer-pilot run build:typography-subsets
```

Build the local proof artifact:

```text
npm --prefix packages/pdf-renderer-pilot run build:proof
npm --prefix packages/pdf-renderer-pilot run build:image-proof
npm --prefix packages/pdf-renderer-pilot run build:multi-page-proof
npm --prefix packages/pdf-renderer-pilot run build:all-images-proof
npm --prefix packages/pdf-renderer-pilot run build:canonical-proof
npm --prefix packages/pdf-renderer-pilot run build:content-parity-proof
npm --prefix packages/pdf-renderer-pilot run build:typography-proof
```

The proof PDF is written to
`output/pdf/flowdoc-pdf-pilot-thai-one-page.pdf`. It is local evidence and is
not a stored FlowDoc artifact.

The image proof is written to
`output/pdf/flowdoc-pdf-pilot-image-one-page.pdf`. The external source image is
not copied into the repository.

The shared-resource proof is written to
`output/pdf/flowdoc-pdf-pilot-shared-resources-three-page.pdf`.

The all-images proof is written to
`output/pdf/flowdoc-pdf-pilot-all-five-images-five-page.pdf`. Set
`FLOWDOC_PDF_PILOT_REPORT_ASSET_ROOT` when the pinned external report assets are
not available in the sibling report workspace.

The canonical report proof is written to
`output/pdf/flowdoc-pdf-pilot-canonical-report-twelve-page.pdf`. Set
`FLOWDOC_PDF_PILOT_REPORT_ROOT` when the pinned reference report directory is
not available in the sibling report workspace.

The decision-content parity proof is written separately to
`output/pdf/flowdoc-pdf-pilot-canonical-report-content-parity-twelve-page.pdf`
so the Phase 07 bytes remain retained.

The Regular/Bold typography proof is written to
`output/pdf/flowdoc-pdf-pilot-canonical-report-typography-calibrated-twelve-page.pdf`.
