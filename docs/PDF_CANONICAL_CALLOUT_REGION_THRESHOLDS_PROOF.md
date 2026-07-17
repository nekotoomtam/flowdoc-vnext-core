# PDF Canonical Callout and Region Threshold Proof

Status: PDF-PILOT-08B-R2C-Q measured callout treatment accepted; visual
fidelity and production binding remain rejected.

## Decision

R2C-Q gives the executive and decision summaries authored `text-block` box
semantics and carries those semantics through measurement, projection,
pagination, and PDF paint. The renderer does not infer rectangles from text or
translate commands after layout.

The accepted treatment uses fill `EAF1FF`, 9pt horizontal padding, and 7pt
vertical padding. The 467.95pt body frame therefore produces a 449.95pt inner
measurement width. Both the initial measurement handoff and the projected
document request retain that width.

## Boundary Correction

The first region run found that the table-projection boundary recreated
document requests at the full 467.95pt body width. A mapped-summary line then
extended 4.5095pt beyond the callout even though the upstream request was
correct. R2C-Q closes that gap by requiring boxed projected nodes to reuse the
accepted source measurement width. The final body-command envelope is again
exactly `72.02..539.97pt`, with zero overflow.

## Callout Evidence

| Fact | Accepted result |
| --- | ---: |
| Authored callout nodes | 12 |
| Semantic groups | 2 |
| Source field bindings retained | 22 |
| Measured page fragments | 3 |
| Executive fragment pages | 1, 2 |
| Decision fragment page | 10 |
| Missing glyphs | 0 |

The reference contains two wide blue callout groups. The candidate also has
two semantic groups, but the executive group follows Core pagination across
two pages, so the PDF contains three measured fill fragments. This is expected
content-driven behavior, not an extra authored callout.

The candidate outer width is 467.95pt versus 468.07pt in the reference, a
0.12pt gap. Its left and right edge gaps are 2.996pt and 2.876pt, both inside
the explicit 3.1pt threshold. Measured text inset is exactly 9pt in every
fragment, matching the reference, and rendered rectangle geometry matches the
Core contract within 0.001pt.

## Region Contract

R2C-Q rejects one aggregate pixel-parity score. It accepts six independent
regions:

| Region | Threshold | Observed | Result |
| --- | --- | --- | --- |
| Page box | exact 612 x 792pt | exact | accepted |
| Static zones | top/bottom gap <= 1pt | 0 / 0.39pt | accepted |
| Body frame | left <= 0.1pt, top <= 2pt, overflow <= 0.001pt | 0 / 1.54 / 0pt | accepted |
| Typography | scale <= 0.1pt, Bold share <= 0.08 | 0.1pt / 0.067275 | accepted |
| Callout treatment | semantic, color, padding, width, edge, inset, geometry gates | all pass | accepted |
| Source density | retain baseline text and content-driven page count | retained / 13 pages | accepted |

All region thresholds pass, but visual fidelity remains false. The candidate
contains more source-backed audit evidence and still uses 13 pages versus the
12-page reference. Region acceptance does not claim document parity.

## Artifact

The exact local candidate is SHA-256
`c4d09f0dfd66e1e3983bc679602fdc7d397de30edcb4f93fac3a0fa0c422960b`
with 1,212,656 bytes. Structural QA accepts 13 Letter pages, two embedded font
objects, five image objects, 1,031 extracted glyph runs, 688 Table line paths,
three callout fill fragments, and thirteen nonblank 96-DPI Poppler pages.

## Evidence

- `packages/pdf-renderer-pilot/fixtures/canonical-full-document-callout-regions.v1.json`;
- `fixtures/pdf-pilot-canonical-report-body-display-list.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-full-document-13-page-summary.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-full-document-13-page-qa.v1.json`;
- `packages/pdf-renderer-pilot/scripts/inspect-canonical-full-document-visual-comparison.py`;
- `tests/pdfRendererPilotCanonicalCalloutRegions.test.ts`.

The repository retains neither the reference PDF nor raster bytes. Reproduce
the visual evidence with the pinned external PDF, 96-DPI Poppler rasters, and
`--phase-id PDF-PILOT-08B-R2C-Q` after rebuilding the canonical pipeline.

Next phase: `PDF-PILOT-08B-R2C-R` generic box-boundary and cross-reader
compatibility audit. The main question is whether the accepted pilot treatment
generalizes beyond this report without moving report-specific policy into Core.
