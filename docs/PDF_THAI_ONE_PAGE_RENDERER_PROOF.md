# PDF Thai One-Page Renderer Proof

Status: PDF-PILOT-03 Thai embedded-font one-page renderer proof accepted.

Umbrella work item: `PDF-PILOT-INV-9437125258`.

## Objective

Prove that an isolated external renderer can consume the measured draw contract
from PDF-PILOT-02 and produce one searchable Letter-page PDF with correctly
positioned Thai glyphs and a real embedded font subset.

This is renderer evidence, not a production PDF renderer selection.

## Execution Boundary

`packages/pdf-renderer-pilot` receives a consumable
`VNextPdfMeasuredDrawContractResultV1` plus caller-supplied source and subset
font bytes. The renderer itself does not read files, shape text, relayout,
write storage, call routes, or bind production behavior.

The one-page profile supports opaque glyph runs, fills, and strokes. Image
commands, transparency, vertical glyph offsets, multi-page input, and blocked
Core contracts fail closed with no partial PDF bytes.

## Font And Text Path

- Rustybuzz `0.20.1` shapes both retained Thai/mixed-script lines against the
  registered IBM Plex Sans Thai Regular source hash.
- FontTools `4.58.2` creates a deterministic `13,596`-byte subset from the
  `113,464`-byte source while retaining measured GIDs.
- The derivative is renamed to remove IBM's Reserved Font Name `Plex`.
- The PDF embeds the subset as Type0/CIDFontType2 with Identity-H,
  CIDToGIDMap, contract-derived widths/offsets, and ToUnicode.
- ActualText retains exact authored run text because Poppler otherwise treats
  some Thai mark-positioning adjustments as word gaps during extraction.

The renderer never invokes a shaping engine. Its visual glyph sequence and
horizontal positioning come from the accepted measured contract.

## QA Evidence

Artifact identity:

```text
sha256:fafa7e4d01df4d9f9b5acdffe2d7652e073e5b329142e4c8886085521322fd24
17,594 bytes, PDF 1.7, 1 Letter page
```

`pdffonts 25.07.0` reports the retained font as CID TrueType with
`emb=yes`, `sub=yes`, and `uni=yes`.

Both `pdftotext 25.07.0` and `pypdf 6.10.0` extract these exact lines:

```text
สรุปผล OCR ภาษาไทย 100%
ค้นหา เลือก และคัดลอกข้อความได้
```

The 150 DPI Poppler raster is `1275 x 1650 RGB`. Visual inspection found no
missing or clipped glyph, incoherent overlap, baseline error, or panel geometry
drift.

Retained evidence:

- `fixtures/pdf-pilot-thai-one-page-request.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/font-subset-manifest.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/fonts/FlowDocThaiPilotSubset-Regular.ttf`;
- `packages/pdf-renderer-pilot/fixtures/one-page-proof-summary.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/one-page-proof-qa.v1.json`;
- `tests/pdfRendererPilotOnePage.test.ts`.

The generated PDF stays under `output/pdf` as ignored local evidence. It is not
an artifact storage record and is reproducible through `build:proof`.

## PASS

- The Core measured draw contract drives real PDF bytes without renderer-side
  shaping or relayout.
- The actual IBM-derived subset is smaller, GID-retaining, renamed, embedded,
  and bound to both source and subset SHA-256 identities.
- Thai marks render correctly and exact text extraction passes two engines.
- Output bytes and artifact identity are deterministic.
- Core and the old minimal Helvetica spike remain unchanged in ownership.

## FAIL / BLOCKER

None for closing PDF-PILOT-03.

The report-level pilot remains blocked on image execution, multi-page resource
reuse, and full 12-page composition evidence.

## RISK

- ActualText is required in addition to ToUnicode for stable Thai extraction
  around positioned mark glyphs; other PDF consumers still need coverage.
- The retained subset is prebuilt evidence. Runtime subsetting orchestration is
  not selected for production.
- Vertical glyph offsets, transparency, and images intentionally fail closed.
- Tagged PDF structure and accessibility semantics are not implemented.

## UNKNOWN

- production PDF package and runtime subsetting strategy;
- PNG/JPEG decode, alpha, crop, and digest-bound byte resolution behavior;
- subset reuse and resource deduplication across 12 pages;
- PDF/A, tagging, metadata, bookmark, and link requirements.

## Intentionally Not Changed

- no production renderer dependency in Core;
- no image command execution or report-wide composition;
- no backend route, worker, storage, auth, editor, or export UI binding;
- no active measurement/font profile promotion;
- no DOCX, bookmark, external-link, package, or document-schema behavior.

Next phase: `PDF-PILOT-04` digest-bound image and complete one-page paint proof.
