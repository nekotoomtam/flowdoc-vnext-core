# PDF Canonical Report Typography And Layout Calibration Proof

Status: PDF-PILOT-08B typography and layout calibration accepted.

Umbrella work item: `PDF-PILOT-INV-9437125258`.

## Objective

Replace the undersized Phase 07/08A report typography with a readable,
source-calibrated IBM Plex Sans Thai hierarchy while preserving all accepted
decision content and the fixed 12-page measured-renderer boundary.

This phase calibrates font size, font weight, explicit table-cell line breaks,
and page geometry. It does not claim pixel equivalence, automatic wrapping,
production layout ownership, or storage/delivery integration.

## Typography Contract

`fixtures/pdf-pilot-canonical-report-typography-calibration.v1.json` applies a
third composition layer over the accepted 08A content composition. It requires
13 named styles and all 10 report tables to meet these floors:

```text
body/callout/bullet: 10.5 pt Regular
table body:           9.1 pt Regular (minimum 9.0)
table header:         9.3 pt Bold (minimum 9.2)
caption/small:        9.0 pt Regular
header/footer:        8.5 pt Bold/Regular
section:             13.0 pt Bold
page title:          16.0 pt Bold
cover title:         25.0 pt Bold
```

IBM Plex Sans Thai Bold is already registered under OFL-1.1, so no unlicensed
Tahoma bytes or synthetic weight is introduced. The measured request declares
Regular and Bold as separate font assets and embeds independent GID-retaining
Type0 subsets.

Table cells may contain caller-authored line arrays. The request builder centers
those explicit lines inside retained row geometry; it still does not infer or
perform wrapping. Single-line Phase 07/08A table commands retain their original
identity and byte output.

## Reference Calibration

All 12 reference/FlowDoc page pairs were rendered at the same 144 DPI. Weighted
median font sizes now align closely:

```text
page 2:  reference 10.56 pt / FlowDoc 10.50 pt
page 4:  reference  9.00 pt / FlowDoc  9.10 pt
page 6:  reference 10.56 pt / FlowDoc 10.50 pt
page 8:  reference 10.56 pt / FlowDoc 10.50 pt
page 12: reference  9.00 pt / FlowDoc  9.10 pt
```

The full comparison is retained in the QA fixture. Bold headings and table
headers restore the hierarchy missing from the Regular-only proof. Page 6 and
8 chart bounds were rebalanced after visual inspection so restored content did
not make chart labels unnecessarily small.

## Artifact And QA

```text
sha256: 45f9969ec01b1e1d168b624fff969b1fc32056f17d0596ced1c00ead58273b92
941,026 bytes, PDF 1.7, 12 Letter pages
565 measured draw commands / 584 ordered paint commands
413 glyph runs / 10,562 glyph occurrences / 152 box commands
340 Regular runs / 73 Bold runs
```

Poppler recovers all `413/413` runs exactly. Pypdf recovers 355 raw and all 413
after whitespace normalization. All 19 required 08A semantic strings and the
`91.7506%` content ratio remain unchanged.

The Regular subset is 37,512 bytes and the Bold subset is 37,628 bytes; each
retains 138 glyph IDs. Both font objects are referenced from all 12 pages. Five
image objects and six paints retain exact RGB pixel identity.

Pdftoppm and pdftocairo each render 12 nonblank `1224 x 1584 RGB` pages at 144
DPI. Request geometry reports zero text-bound overlaps, maximum non-footer
content bottom `740 pt`, and a `17 pt` gap to the footer boundary. Contact-sheet
and individual-page inspection found no missing glyph, clipping, incoherent
overlap, or footer collision. A second proof build has the same hash.

Retained evidence:

- `fixtures/pdf-pilot-canonical-report-typography-calibration.v1.json`;
- `fixtures/pdf-pilot-canonical-report-typography-calibrated-twelve-page-request.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-typography-regular-font-subset-manifest.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-typography-bold-font-subset-manifest.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-typography-calibrated-twelve-page-summary.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-typography-calibrated-twelve-page-qa.v1.json`;
- `tests/pdfRendererPilotCanonicalReportTypography.test.ts`.

The local proof PDF is
`output/pdf/flowdoc-pdf-pilot-canonical-report-typography-calibrated-twelve-page.pdf`.

## PASS

- Regular/Bold source and subset identities fail closed.
- All 13 style floors and all 10 table typography contracts pass.
- The complete 08A semantic content contract remains accepted.
- Two-font embedding, extraction, deterministic rendering, dual raster tools,
  image identity, geometry, and 12-page visual review pass.
- Phase 07 and Phase 08A PDF/subset hashes remain byte-identical.

## FAIL / BLOCKER

None for closing PDF-PILOT-08B.

Production report fidelity remains blocked on calibrated region-aware visual
thresholds, broader reader compatibility, and production integration.

## RISK

- Bold is a real 700-weight face, not Semibold; visual-diff calibration must
  decide whether any style needs a different weight later.
- Layout remains caller-measured. Explicit cell line arrays are not automatic
  table wrapping or pagination.
- Semantic parity is decision-relevant rather than verbatim sentence parity.
- Accessibility tags, links, bookmarks, PDF/A, and delivery remain open.

## Intentionally Not Changed

- no Phase 07 or 08A retained artifact was replaced;
- no external reference PDF/image/font byte was copied into Core;
- no active editor style mapping or production renderer was changed;
- no route, worker, storage, auth, editor, DOCX, or schema behavior changed.

Next phase: `PDF-PILOT-08C` visual acceptance thresholds.
