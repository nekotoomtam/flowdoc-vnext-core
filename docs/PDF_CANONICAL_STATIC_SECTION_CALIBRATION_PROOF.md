# PDF Canonical Static and Section Calibration Proof

Status: PDF-PILOT-08B-R2C-P static and section calibration accepted; visual
fidelity and production binding remain rejected.

## Decision

R2C-P replaces the report's generic page frame with measured Letter geometry
derived from the pinned reference envelope and verified font offsets. It also
gives the ten reader-summary blocks and two reader labels explicit semantic
roles so normal Core spacing rules can compose their boundaries.

The change runs through template resolution, measurement, shaping,
line-breaking, composition, pagination, static-zone handoff, and PDF rendering.
It does not translate commands after layout, remove source-backed rows, or
force the reference's 12-page count.

## Measured Change

| Absolute gap from reference | R2C-O | R2C-P |
| --- | ---: | ---: |
| Header ink top | 30.37pt | 0.00pt |
| Footer ink bottom | 34.70pt | 0.39pt |
| Body left | 15.33pt | 0.00pt |
| Body top | 22.15pt | 1.54pt |

The accepted page frame is:

- margins: top `20.65pt`, right `72.03pt`, bottom `15.94pt`, left `72.02pt`;
- header reservation: `32.22pt`;
- footer reservation: `24pt`;
- body frame: `x=72.02pt`, `y=52.87pt`, `467.95 x 699.19pt`.

All body draw commands remain between `72.02pt` and `539.97pt`, exactly the
calibrated horizontal body frame. Measured horizontal overflow is zero.

## Semantic Composition

R2C-P introduces `reader-label` and `reader-summary` categories rather than
inferring their layout from text content. The accepted adjacency rules use the
existing 15pt report-body line height:

| Boundary | Gap |
| --- | ---: |
| body to reader label | 12pt |
| reader label to first summary | 6pt |
| summary to summary | 3pt |
| final summary to body | 12pt |

The complete document still contains 185 source body roots. Core produces 189
placements and 13 pages, including the measured final Table continuation. The
page count remains content-driven and all 15 Tables, five images, and source
evidence remain present.

## Acceptance Boundary

Accepted:

- measured static-zone and body-frame calibration;
- exact horizontal containment for body draw commands;
- semantic reader-label and reader-summary spacing;
- complete regeneration through measured Core pagination;
- deterministic PDF identity and structural QA.

Not accepted:

- visual or pixel parity with the reference;
- reference-equivalent callout fills, borders, or emphasis;
- region-level visual thresholds;
- fixed 12-page output;
- production renderer binding.

The exact local candidate is SHA-256
`1e78e3b4a4e9d78b0e7b02fd535bd486db1d3fbab9c37228e6082e00d0c1f36a`
with 1,212,504 bytes. Visual inspection and structural QA find no overlap,
clipping, missing glyphs, or blank pages. Page 13 remains intentionally sparse
because deleting or moving its terminal Table rows would violate the measured
content boundary.

## Evidence

- `packages/pdf-renderer-pilot/fixtures/canonical-full-document-static-section-calibration.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-full-document-reader-hierarchy.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-full-document-13-page-summary.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-full-document-13-page-qa.v1.json`;
- `packages/pdf-renderer-pilot/scripts/inspect-canonical-full-document-visual-comparison.py`;
- `tests/pdfRendererPilotCanonicalStaticSectionCalibration.test.ts`.

Reproduction requires the externally retained reference PDF and local
96-DPI Poppler rasters. The repository retains neither reference PDF bytes nor
raster bytes. Run the visual inspector with `--phase-id PDF-PILOT-08B-R2C-P`
and write the result to the static-section calibration fixture after rebuilding
the complete canonical pipeline and full-document proof.

Next phase: `PDF-PILOT-08B-R2C-Q` measured callout treatment and region-aware
visual thresholds without post-layout patches or source-evidence deletion.
