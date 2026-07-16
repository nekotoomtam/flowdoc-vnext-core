# PDF Image One-Page Renderer Proof

Status: PDF-PILOT-04 digest-bound image and complete one-page paint proof accepted.

Umbrella work item: `PDF-PILOT-INV-9437125258`.

## Objective

Extend the isolated Phase 03 renderer so one measured page can execute every
Phase 02 paint-command kind: glyph run, fill rectangle, stroke rectangle, and
image. Image bytes must remain caller-owned and must match the exact contract
digest, dimensions, and media type before any PDF bytes are emitted.

This is still a bounded renderer proof, not a production renderer or storage
binding.

## Image Boundary

`renderFlowDocDigestBoundImageOnePagePdfPilot(...)` receives image bytes beside
the measured contract. The renderer does not resolve paths, fetch URLs, read
storage, or retain the external source image.

Phase 04 accepts non-interlaced, 8-bit grayscale or RGB PNG with standard PNG
compression/filtering. It verifies:

- contract SHA-256 against exact caller bytes;
- PNG signature, chunk boundaries, chunk CRCs, IHDR/IDAT/IEND structure;
- media type, pixel width, and pixel height;
- opaque paint and one measured page.

Palette, alpha, interlaced PNG, JPEG, transparency, and malformed critical
chunks fail closed. The renderer retains decorative/alt-text facts in the
artifact manifest, but it does not claim tagged-PDF accessibility.

## PDF Execution

The renderer embeds concatenated PNG IDAT data directly as an Image XObject
with FlateDecode and PNG predictor 15. It does not decode or recompress the
pixels. Explicit `contain`, `cover`, and normalized crop facts are converted to
a clipped PDF image matrix while preserving the source aspect ratio and the
measured command bounds.

The Phase 03 Type0/CIDFontType2, CIDToGIDMap, ToUnicode, ActualText, fill, and
stroke paths remain active. The Phase 03 entry point still blocks image
commands, and its retained PDF hash remains byte-for-byte unchanged.

## Actual Pinned-Image QA

The accepted local proof uses the external pinned source:

```text
external-report://INV_9437125258/assets/ocr_accuracy.png
sha256:322a132d2aa8746a5345dc78e3f80c53f09aa057ffffa9ffab5765096d9331ce
65,307 bytes, 1950 x 900, 8-bit RGB
```

The source PNG is not copied into this repository. The retained request and QA
facts hold only identity, dimensions, accessibility, and normalized evidence.

Generated PDF identity:

```text
sha256:75050ad4cb4d95d15834b8b84709b5194f3e918bd11d7b86b3fa14d13740e6a8
83,266 bytes, PDF 1.7, 1 Letter page
```

`pdfimages 25.07.0` reports one RGB `1950 x 900`, 8-bit Image XObject at
approximately 285 PPI. `pypdf 6.10.0` reconstructs `65,307` PNG bytes with the
exact original SHA-256, proving byte identity through the PDF image stream.

Poppler and pypdf still extract both Thai lines exactly. The 150 DPI
`1275 x 1650 RGB` raster review confirms the chart is sharp, aspect-correct,
inside measured bounds, and painted without clipping, distortion, or text
regression.

Retained evidence:

- `fixtures/pdf-pilot-image-one-page-request.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/image-one-page-proof-summary.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/image-one-page-proof-qa.v1.json`;
- `tests/pdfRendererPilotImageOnePage.test.ts`.

The generated PDF remains ignored local evidence at
`output/pdf/flowdoc-pdf-pilot-image-one-page.pdf`.

## PASS

- All four measured paint-command kinds execute on one page in deterministic
  paint order.
- Image bytes are bound to contract digest, dimensions, media type, and asset
  identity before rendering.
- PNG IDAT bytes round-trip through PDF with exact source identity.
- Contain, cover, and normalized crop geometry have deterministic tests.
- Thai embedding, positioning, and extraction retain Phase 03 behavior.
- No external report image bytes are committed or retained in Core.

## FAIL / BLOCKER

None for closing PDF-PILOT-04.

Report-level fidelity remains blocked on multi-page resource reuse, all five
pinned images, and full 12-page composition evidence.

## RISK

- Only opaque 8-bit grayscale/RGB PNG is qualified.
- Actual-image QA covers `contain`; `cover` and crop use deterministic synthetic
  fixtures but have not yet been exercised against the report assets.
- Accessibility metadata is retained but the PDF is not tagged.
- PNG bytes are caller-supplied; backend resolution/storage ownership remains
  unimplemented.

## UNKNOWN

- JPEG, alpha/SMask, palette expansion, and transparency strategy;
- cross-page font/image XObject reuse and deduplication;
- all-five-image report fidelity and memory bounds;
- production renderer package, runtime subsetting, and artifact storage path;
- PDF/A, tagging, bookmark, and link requirements.

## Intentionally Not Changed

- no source image copied into Core or renderer fixtures;
- no production dependency, route, worker, storage, auth, or editor binding;
- no multi-page or 12-page report claim;
- no active font/measurement profile promotion;
- no DOCX, package, or document-schema behavior.

Next phase: `PDF-PILOT-05` multi-page font/image resource reuse proof.
