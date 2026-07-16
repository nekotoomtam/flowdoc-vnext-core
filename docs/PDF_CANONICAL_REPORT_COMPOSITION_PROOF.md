# PDF Canonical Report Composition Proof

Status: PDF-PILOT-07 canonical twelve-page report composition proof accepted.

Umbrella work item: `PDF-PILOT-INV-9437125258`.

## Objective

Prove that FlowDoc's measured-contract path can compose the canonical page map
of the pinned OCR benchmark report: twelve fixed Letter pages with report
content, tables, callouts, headers, footers, and the six expected image paints.

This phase proves deterministic report composition. It does not claim
pixel-equivalence with the Tahoma-authored reference or production binding.

## Canonical Boundary

The readable composition fixture locks twelve page identities from cover
through Appendix B. Every text line is shaped by the registered Rustybuzz and
IBM Plex profile before it enters the measured draw contract. The renderer
does not wrap, paginate, reshape, or infer table geometry.

The retained request contains:

```text
12 pages
509 measured draw commands
528 ordered paint commands
357 glyph runs / 8,549 glyph occurrences
152 box commands
5 unique image assets / 6 image paints
```

The Phase 07 profile rejects a different renderer profile, page count, page
marker order, image-asset count, digest set, or page-to-image binding.

## Thai Cluster Execution

The full report exposed measured Thai facts not present in the earlier small
sample: 20 runs contain 21 glyphs with vertical offsets from `-1.72 pt` to
`0.387 pt`, and some clusters contain more glyphs than Unicode scalars.

Phase 07 keeps the cluster's logical Unicode on its primary CID, maps visual
continuation CIDs to an empty string, and paints those continuation glyphs as
artifact overlays at their measured X/Y positions. ActualText remains on each
logical run. This preserves both shaped visual marks and searchable text.

Poppler finds all 357 measured text runs exactly. Pypdf finds 311 runs raw and
all 357 after removing whitespace it infers between adjacent Thai codepoints
from measured `TJ` adjustments. The earlier strict profiles retain their
existing behavior and byte identities.

## Artifact And QA

```text
sha256:39d8191ff58c2da0f03d7319dd5f3818b7f89642d01885f78cae092634ca1819
830,467 bytes, PDF 1.7, 12 Letter pages
```

One 37,164-byte Type0/CIDFontType2 subset at object `27` is referenced by all
twelve pages. Five image objects are emitted once. The source-evidence object
`33` is reused on pages 1 and 5; objects `34` through `37` cover the other four
report charts. Pypdf confirms exact RGB pixel identity for all six paints.

Pdftoppm and pdftocairo render twelve `1020 x 1320 RGB` pages at 120 DPI.
Contact-sheet and individual-page inspection confirm visible page markers,
tables, callouts, portrait/landscape images, headers, and footers with no
missing glyph, clipping, or overlap. A second build produces the same hash.

Retained evidence:

- `fixtures/pdf-pilot-canonical-report-composition.v1.json`;
- `fixtures/pdf-pilot-canonical-report-twelve-page-request.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-twelve-page-summary.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-twelve-page-qa.v1.json`;
- `tests/pdfRendererPilotCanonicalReport.test.ts`.

The generated PDF remains ignored local evidence at
`output/pdf/flowdoc-pdf-pilot-canonical-report-twelve-page.pdf`. The pinned
reference PDF and its five image files remain in caller-owned storage.

## PASS

- The pinned 12-page reference identity is verified before fixture generation.
- Canonical page order, page markers, tables, callouts, and image placements
  execute from measured commands without renderer relayout.
- The full Thai cluster inventory renders with measured vertical offsets.
- Poppler recovers 357/357 runs raw; pypdf recovers 357/357 after the retained
  Thai-adjacent whitespace normalization.
- One font object and five image objects are reused across twelve pages.
- Phase 03 through Phase 06 artifact hashes remain unchanged.

## FAIL / BLOCKER

None for closing PDF-PILOT-07.

Production PDF fidelity remains blocked on calibrated report-wide visual-diff
thresholds, active renderer ownership, and storage/delivery integration.

## RISK

- The fixture retains decision-relevant report content but is not a verbatim
  copy of every reference sentence.
- IBM Plex Regular is the only executed style; reference Tahoma and bold-style
  metric differences are not calibrated yet.
- Tables are paint geometry, not tagged semantic table structures.
- Empty continuation mappings and artifact overlays are proven with Poppler
  and pypdf only; additional reader compatibility remains open.
- Pypdf raw extraction inserts whitespace around some measured Thai
  adjustments; consumers need the retained Thai-adjacent normalization.
- Links, bookmarks, tagged PDF, PDF/A, and accessibility structure remain open.

## Intentionally Not Changed

- no external reference PDF or PNG was copied into the repository;
- no automatic layout, pagination, wrapping, or font fallback;
- no production dependency, route, worker, storage, auth, or editor binding;
- no DOCX, package, or document-schema behavior.

Next phase: `PDF-PILOT-08` report-wide visual-diff calibration and acceptance thresholds.
