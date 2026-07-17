# PDF Canonical Reader Hierarchy Proof

Status: PDF-PILOT-08B-R2C-O reader hierarchy accepted; visual fidelity and
production binding remain rejected.

## Decision

R2C-O restores source-backed executive and decision narrative through ordinary
FlowDoc field references, removes generic Bold styling from scalar labels, and
repaginates through the existing measured Core pipeline. It does not delete
audit evidence, bypass wrapping, or force the 12-page reference count.

The recalibrated candidate remains 13 Letter pages. R2C-N's content-driven page
count decision remains authoritative; earlier `targetPageCount: 12` fields are
historical diagnostics, not current acceptance gates.

## Measured Change

| Measure | R2C-N baseline | R2C-O | Reference |
| --- | ---: | ---: | ---: |
| Bold character share | 41.7496% | 9.1591% | 15.8866% |
| Absolute Bold-share gap | 25.8630 points | 6.7275 points | 0 |
| Extracted non-whitespace characters | 13,866 | 14,663 | 10,619 |
| Executive-summary characters | 290 | 810 | 1,143 |
| Decision-view characters | 74 | 468 | 1,202 |
| Page count | 13 | 13 | 12 |

The Bold-share gap improves by 19.1355 percentage points. Executive and
decision sections gain 520 and 394 extracted characters respectively while
overall extracted density increases by 797 characters.

## Source And Core Boundary

- 22 additional scalar placements bind narrative text to registered report
  fields; no literal metric values are authored into the template.
- generic scalar labels use the role's Regular font;
- only the executive and decision reader labels retain local Bold overrides;
- the regenerated pipeline contains 185 body roots, 187 placements, 15 Tables,
  five images, and zero missing glyphs;
- Core determines the unchanged 13-page result, including the final measured
  Table continuation on page 13.

The exact candidate is SHA-256
`91787999d2e2711293d4adc1bafcceba610201b934212f0d7b22cc96ea703041`
with 1,223,440 bytes. Independent structural QA accepts its page tree, fonts,
images, text extraction, content-stream operators, and nonblank rasters.

## Acceptance Boundary

Accepted:

- source-backed narrative binding;
- role-level Bold calibration;
- nondecreasing audit-text density;
- content-driven repagination through measured Core;
- deterministic PDF and structural QA identity.

Not accepted:

- pixel or visual parity with the Word reference;
- reference-equivalent static-zone geometry;
- reference-equivalent section composition or callout treatment;
- fixed 12-page output;
- production renderer binding.

Visual inspection confirms no overlap or clipping in the 13-page candidate,
but the candidate remains denser and more audit-oriented than the reference.
Static zones, callout treatment, and section balance remain materially
different.

## Evidence

- `packages/pdf-renderer-pilot/fixtures/canonical-full-document-reader-hierarchy.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-full-document-visual-comparison.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-full-document-13-page-summary.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-full-document-13-page-qa.v1.json`;
- `packages/pdf-renderer-pilot/scripts/inspect-canonical-full-document-visual-comparison.py`;
- `tests/pdfRendererPilotCanonicalReaderHierarchy.test.ts`.

Reproduction requires the externally retained reference PDF and local Poppler
rasters. The repository retains neither reference PDF bytes nor raster bytes.

Next phase: `PDF-PILOT-08B-R2C-P` measured static-zone and section-composition
calibration without deleting source-backed evidence or imposing a page count.
