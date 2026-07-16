# PDF Multi-Page Resource Reuse Proof

Status: PDF-PILOT-05 multi-page font/image resource reuse proof accepted.

Umbrella work item: `PDF-PILOT-INV-9437125258`.

## Objective

Prove that the isolated PDF renderer can assemble multiple measured pages while
embedding each unique font subset and image asset once, then referencing those
same PDF objects from only the pages that use them.

This phase tests renderer object ownership and reuse. It does not claim the
full 12-page report composition or production storage.

## Three-Page Scenario

The retained contract contains three Letter pages:

- pages 1 and 2 each execute glyph, fill, stroke, and the same OCR accuracy
  image;
- page 3 executes glyph, fill, and stroke with no image command;
- all pages use one measured IBM-derived font subset;
- the two image pages use the same pinned external PNG identity.

The result contains 14 paint commands, six glyph runs, 162 glyph occurrences,
three font resource references, and two image resource references.

## Resource Ownership Result

One global Type0/CIDFontType2 object is shared by all three page dictionaries.
One global Image XObject is shared by pages 1 and 2; page 3 has no XObject
entry. No font or image stream bytes are duplicated per page.

Retained normalized result:

```text
font:  1 unique object / 3 page references
image: 1 unique object / 2 page references
```

`pdffonts 25.07.0` reports one embedded/subset/Unicode font at object `9`.
`pdfimages 25.07.0` reports object `15` on pages 1 and 2. Pypdf confirms page
image counts `[1, 1, 0]` and reconstructs the same pinned PNG SHA-256 from both
image pages.

## Artifact And QA

```text
sha256:7c15cca1e68bd745189b0d3ef3ce2c9170453e869ab5003b3ad99697bb8aa8b4
88,019 bytes, PDF 1.7, 3 Letter pages
```

Poppler and pypdf extract both expected Thai lines exactly on all three pages.
Pdftoppm and pdftocairo render all pages at `1020 x 1320 RGB` and 120 DPI.
Pages 1 and 2 are pixel-identical; page 3 retains text/panel geometry and has
no chart. No missing glyph, clipping, overlap, or paint regression is present.

Generalizing the page assembler preserves the exact Phase 03 and Phase 04 PDF
hashes, so one-page behavior remains byte-for-byte stable.

Retained evidence:

- `fixtures/pdf-pilot-shared-resources-three-page-request.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/shared-resources-three-page-summary.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/shared-resources-three-page-qa.v1.json`;
- `tests/pdfRendererPilotSharedResources.test.ts`.

The local PDF remains ignored evidence at
`output/pdf/flowdoc-pdf-pilot-shared-resources-three-page.pdf`. External image
bytes are not copied into the repository.

## PASS

- Page tree and content streams assemble deterministically across three pages.
- Font and image stream objects are unique and referenced across pages.
- A page without image paint has no image XObject resource.
- Thai extraction and visual placement pass on every page.
- Both earlier one-page artifact identities remain unchanged.
- One-page and multi-page profiles reject each other's page-count shapes.

## FAIL / BLOCKER

None for closing PDF-PILOT-05.

The report-level pilot remains blocked on all five pinned images, canonical
12-page content/composition, and report-wide visual comparison.

## RISK

- Repeated pages intentionally reuse identical content; mixed page templates
  and five distinct image objects are not yet proven.
- The font CMap contains occurrence CIDs for all pages and remains pilot-scale;
  production subset/CID size bounds are not selected.
- Resource dictionaries are deterministic but not optimized into inherited
  page-tree resources.
- Tagged PDF, accessibility semantics, storage, and production dependencies
  remain open.

## UNKNOWN

- all-five-image object sizing and memory behavior;
- canonical report page/header/footer composition;
- 12-page artifact size and deterministic visual-diff thresholds;
- production renderer/subsetter and storage ownership;
- PDF/A, tagging, bookmark, and link requirements.

## Intentionally Not Changed

- no external report image copied into the repository;
- no full-report fixture or 12-page fidelity claim;
- no production dependency, storage, route, worker, auth, or editor binding;
- no active font/measurement profile promotion;
- no DOCX, package, or document-schema behavior.

Next phase: `PDF-PILOT-06` all-five-image multi-page resource matrix.
