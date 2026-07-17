# PDF Canonical Full-Document Visual Comparison

Status: PDF-PILOT-08B-R2C-N comparison evidence accepted; visual fidelity is
not accepted, and the source-backed thirteen-page result is authoritative.

## Decision

The twelve-page Word PDF remains a useful visual reference, but it is not a
valid fixed page-count oracle for the current source-backed report. The
candidate retains materially more measured evidence and a 328pt continuation
of the final evidence table. R2C-N therefore changes the source-backed profile
to content-driven page count and accepts thirteen pages without claiming
visual fidelity or production readiness.

No content, wrapping fact, page-plan fact, or renderer behavior changes in this
phase.

## Pinned Inputs

- Reference: 714,952 bytes, 12 Letter pages, SHA-256
  `56f17f2cc97bfe545d6f8dba9c4e2f45928c9398d0b8cad129c19b51ca3695a8`.
- Candidate: 1,194,703 bytes, 13 Letter pages, SHA-256
  `014b313690041ba312b10dc0bcbf65a3131580258d80e2f8b07465d8e107ed0f`.
- Candidate source: the exact R2C-L measured-draw bundle executed by R2C-M.

The reference PDF, candidate PDF, contact sheet, and page rasters remain local.
Only normalized measurements and identity facts are retained.

## Method

`pdfplumber` measures page boxes, extracted non-whitespace characters, font
sizes, font names, image locations, vector objects, body bounds, and heading
positions. One cover heading and eleven 16pt section headings are bound in
document order to the pinned twelve-section semantic order. This avoids
pretending that producer-specific Thai extraction from the Word PDF is exact
semantic text.

Poppler renders both inputs at 96 DPI. The inspector records non-white pixel
occupancy in fixed top, body, and bottom regions. Raster occupancy is used as
layout evidence only; pixel parity is inapplicable because the documents do
not contain equivalent content.

## Findings

| Fact | Reference | Candidate | Difference |
| --- | ---: | ---: | ---: |
| Pages | 12 | 13 | +1 |
| Extracted non-whitespace characters | 10,619 | 13,866 | +3,247 / +30.58% |
| Dominant font size | 10.6pt | 10.5pt | -0.1pt |
| 16pt section headings | 11 | 11 | matched scale |
| Bold-character share | 15.89% | 41.75% | +25.86 percentage points |
| Observed body width | 467.43pt | 487.97pt | +20.54pt |
| Images | 6 | 5 | -1 |

The candidate is not merely the reference with different wrapping. Semantic
anchors move by `-2` through `+1` pages rather than drifting in one direction.
The source-backed OCR, Native Extraction, latency/cost, and mapping sections
carry approximately 2.3 to 3.2 times the extracted text of their reference
regions. Conversely, the executive summary and decision view are materially
shorter. This is an information-hierarchy difference as well as a geometry
difference.

The page box and heading scale are close. The font family, weight distribution,
static-zone placement, section density, image pagination, and final table
pagination are not visually equivalent. Full visual fidelity is rejected.

## Twelve-Page Analysis

The current Core body frame is `641.952756pt` high. The reference's observed
body-content envelope is `669.45pt`, suggesting at most `27.497244pt` of
vertical reclamation per page. Across twelve pages that is `329.966928pt`.
The retained terminal table continuation is `328pt`, leaving only
`1.966928pt` of theoretical headroom.

That calculation is not capacity proof. It assumes the observed reference
envelope can become a reusable frame and that all reclaimed space pools across
fresh boundaries, indivisible rows, repeated headers, images, and preserved
spacing. The non-uniform anchors and under-filled intermediate regions show
those assumptions do not hold automatically. A margin-only change therefore
cannot be claimed to recover twelve pages safely.

The accepted policy is:

- page count for the source-backed profile is content-driven;
- thirteen pages is the authoritative result for this exact bundle;
- no evidence row may be removed to match the old reference count;
- wrapping, pagination, and rendering must continue through measured Core
  contracts;
- visual calibration remains open and cannot claim pixel parity.

## Next Boundary

R2C-O should define source-backed information hierarchy before changing layout:
restore a useful decision narrative from authoritative values, separate reader
summary from audit evidence, and calibrate role-level font weight and static
zones. It must repaginate through the existing measurement boundary and accept
the resulting content-driven page count.

## Reproduction

```text
pdftoppm -png -r 96 <reference.pdf> tmp/pdfs/r2c-n/reference/page
pdftoppm -png -r 96 output/pdf/flowdoc-pdf-pilot-canonical-full-document-13-page.pdf tmp/pdfs/r2c-n/current/page
python packages/pdf-renderer-pilot/scripts/inspect-canonical-full-document-visual-comparison.py --reference <reference.pdf>
npm test -- --run tests/pdfRendererPilotCanonicalVisualComparison.test.ts
```

The inspector requires `pdfplumber` and Pillow. Poppler is required to create
the local raster inputs.

Primary retained evidence:

- `packages/pdf-renderer-pilot/fixtures/canonical-full-document-visual-comparison.v1.json`;
- `packages/pdf-renderer-pilot/scripts/inspect-canonical-full-document-visual-comparison.py`;
- `tests/pdfRendererPilotCanonicalVisualComparison.test.ts`.
