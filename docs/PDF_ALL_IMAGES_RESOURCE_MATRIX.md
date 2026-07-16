# PDF All-Images Resource Matrix

Status: PDF-PILOT-06 all-five-image multi-page resource matrix accepted.

Umbrella work item: `PDF-PILOT-INV-9437125258`.

## Objective

Prove that every pinned report image can cross the measured-contract boundary,
pass digest and dimension validation, become its own PDF Image XObject, and
render beside the accepted Thai font path in one deterministic multi-page PDF.

This phase qualifies image coverage and resource ownership. It does not claim
the canonical 12-page report composition or production storage.

## Five-Page Matrix

The retained contract contains five Letter pages. Every page repeats the
accepted two Thai glyph runs and panel geometry, then paints exactly one
different report PNG using `contain` within a `492 x 360 pt` image area.

The profile fails closed unless all of these are true:

- exactly five measured pages and five image assets are present;
- all five SHA-256 image identities are distinct;
- every page contains exactly one image paint command;
- every declared image asset is painted exactly once.

The retained order is source evidence, OCR accuracy, native extraction,
mapping gap, and latency rounds. The source-evidence portrait and four
landscape charts therefore exercise both contain orientations.

## Artifact And QA

```text
sha256:1b5a3a6b8cd09ca0233d71a500cc27ac19842b2dab2d43eeb21f1a9ac2270d8d
492,655 bytes, PDF 1.7, 5 Letter pages
```

The PDF contains one embedded/subset/Unicode Type0 font object at object `13`,
referenced by all five pages. Image objects `19` through `23` are bound one per
page. Pypdf reports page image counts `[1, 1, 1, 1, 1]` and confirms exact RGB
pixel identity against each external source PNG.

Poppler and pypdf extract both expected Thai lines exactly on every page.
Pdftoppm and pdftocairo render all pages at `1020 x 1320 RGB` and 120 DPI.
Visual inspection covers all five pages with no missing glyph, clipping,
overlap, or image-fit defect. A second build produces the same PDF SHA-256.

Retained evidence:

- `fixtures/pdf-pilot-all-five-images-five-page-request.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/all-five-images-five-page-summary.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/all-five-images-five-page-qa.v1.json`;
- `tests/pdfRendererPilotAllImages.test.ts`.

The local PDF remains ignored evidence at
`output/pdf/flowdoc-pdf-pilot-all-five-images-five-page.pdf`. The five external
PNG files are read from caller-owned storage and are not copied into Core.

## PASS

- All five pinned image identities pass byte, digest, dimension, and media
  validation.
- Five unique image objects are bound to five distinct page dictionaries.
- One font object is reused across all pages without duplicating font bytes.
- Portrait and landscape `contain` placement render without clipping.
- Thai extraction and deterministic PDF bytes pass across the full matrix.
- Phase 03, Phase 04, and Phase 05 artifact hashes remain unchanged.

## FAIL / BLOCKER

None for closing PDF-PILOT-06.

The report-level pilot remains blocked on canonical 12-page content,
page-specific composition, and report-wide visual comparison.

## RISK

- Repeated panel/text content does not prove mixed report templates, tables,
  page numbering, headers, or footers.
- Images are qualified as opaque 8-bit RGB PNG only; alpha, palette, JPEG, and
  transparency remain unsupported.
- The font CMap remains occurrence-based and is suitable only for this bounded
  pilot scale.
- Tagged PDF, bookmarks, links, accessibility structure, and PDF/A remain open.

## Intentionally Not Changed

- no external report image was copied into the repository;
- no production dependency, route, worker, storage, auth, or editor binding;
- no existing font or measurement profile promotion;
- no DOCX, package, or document-schema behavior.

Next phase: `PDF-PILOT-07` canonical 12-page report composition fixture.
