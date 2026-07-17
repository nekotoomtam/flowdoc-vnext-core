# PDF Canonical Full-Document Renderer Proof

Status: PDF-PILOT-08B-R2C-M deterministic thirteen-page PDF execution and
structural verification accepted; visual fidelity remains pending.

## Objective

R2C-M executes the exact R2C-L full-document measured-draw contract in the
isolated PDF pilot renderer. It supplies per-font GID-retaining subsets and
digest-bound PNG resources, emits deterministic PDF 1.7 bytes, and verifies
the resulting page tree, embedded resources, text extraction, image paint,
and Table border paths with independent tools.

## Fail-Closed Input

The full-document renderer profile accepts only:

- renderer profile `pdf-pilot-08b-r2c-l-full-document-v1`;
- Core contract fingerprint
  `sha256:cbc4102ce70fe3cceaaad18618211839192177eb787adb75e4bb81224003ae42`;
- serialized contract SHA-256
  `17bec29d5833e3c9ab61c63746f1de0cf008fb0259c8f0620776879d3edf7826`;
- thirteen Letter pages, two font assets, and five image assets.

The serialized-content gate detects in-memory command mutation even when a
caller leaves the accepted Core fingerprint unchanged. Production binding and
storage writes remain disabled.

## Font And Image Resources

R2C-M builds separate IBM Plex Sans Thai subsets from the glyph IDs used by
each font in the full contract:

- Regular: 118 retained GIDs, 34,652 bytes;
- Bold: 109 retained GIDs, 28,644 bytes.

Both derivatives retain original GIDs, remove the reserved family name, and
remain smaller than their registered OFL source fonts. The renderer reads the
five original PNG resources through `FLOWDOC_PDF_PILOT_REPORT_ROOT` or the
local sibling report fallback, verifies every digest and dimension, and does
not retain those source image bytes in this repository.

## Rendered Artifact

The deterministic local artifact is:

- path: `output/pdf/flowdoc-pdf-pilot-canonical-full-document-13-page.pdf`;
- size: 1,194,703 bytes;
- SHA-256:
  `014b313690041ba312b10dc0bcbf65a3131580258d80e2f8b07465d8e107ed0f`;
- pages: 13 Letter pages;
- commands: 1,771 paint commands, including 978 glyph runs, 696 line strokes,
  92 fills, and five image paints;
- glyphs: 14,784 measured glyph instances;
- shared resources: two font objects and five image objects.

The build renders twice and requires byte-identical output. The PDF remains a
local ignored proof artifact; the retained summary and QA fixtures contain
identities and inspection facts, not the PDF or external PNG bytes.

## Structural Verification

`pypdf` 6.10.0 accepts the file in strict mode and confirms the trailer root,
thirteen-page tree, and 612 by 792 point page boxes. Resource inspection finds
two embedded Type0/CIDFontType2 fonts with Identity-H, ToUnicode, FontFile2,
and CIDToGIDMap, plus five FlateDecode RGB image objects whose dimensions equal
the contract.

Content-stream inspection confirms:

- 978 `BDC`/`TJ` measured text runs;
- all 978 expected runs present in whitespace-normalized extraction;
- five `Do` image paint operators;
- 696 each of `RG`, `w`, `d`, `m`, `l`, and `S` for Table border lines.

Poppler `pdfinfo` accepts PDF 1.7 and reports thirteen Letter pages. A 96-DPI
`pdftoppm` smoke render produces thirteen 816 by 1,056 pixel pages, all
nonblank. Raster smoke proves executability only; it does not accept visual
parity, clipping, overlap, or the twelve-page target.

## Numeric Boundary

The first execution exposed 233 false glyph-overflow reports caused solely by
IEEE-754 accumulation. The largest excess was 2.84e-13 points. Renderer
geometry comparison now allows a 1e-6 point epsilon and retains a regression
test that still blocks a real 0.001 point overflow.

## Boundary

R2C-M owns isolated renderer execution, exact resource binding, deterministic
PDF bytes, structural parsing, extraction proof, and raster smoke. It does not
bind a production renderer, store the PDF, mutate authored content, accept
visual fidelity, or change the authoritative thirteen-page plan.

## Reproduction

```text
npm --prefix packages/pdf-renderer-pilot run build:full-document-subsets
npm --prefix packages/pdf-renderer-pilot run build:full-document-proof
pdftoppm -png -r 96 output/pdf/flowdoc-pdf-pilot-canonical-full-document-13-page.pdf tmp/pdfs/canonical-full-document-13-page/page
python packages/pdf-renderer-pilot/scripts/inspect-canonical-full-document-proof.py
npm test -- --run tests/pdfRendererPilotCanonicalFullDocument.test.ts
```

The inspector requires `pypdf` and Pillow. Poppler is required for `pdfinfo`
and raster smoke.

Primary retained evidence:

- `packages/pdf-renderer-pilot/fixtures/canonical-full-document-13-page-summary.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-full-document-13-page-qa.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-full-document-*-font-subset-manifest.v1.json`;
- `packages/pdf-renderer-pilot/scripts/inspect-canonical-full-document-proof.py`;
- `tests/pdfRendererPilotCanonicalFullDocument.test.ts`.

Next phase: `PDF-PILOT-08B-R2C-N` compare rendered regions with the reference,
classify layout differences, and decide whether an evidence-backed change can
recover the twelve-page target without deleting content or bypassing policy.
