# PDF Export REALDOC Imported Soft-Wrap Normalization

Status: `PDF-EXPORT-REALDOC-D.1` accepted before REALDOC-E. Production
remains NO-GO.

## Problem

The page-free semantic source retains newline characters that came from the
width of the source PDF. Passing those characters directly to measurement
made otherwise short lines mandatory breaks. Text therefore stopped before
the current table-cell edge even though the measured width still had room.

This is import provenance, not a renderer-width problem. REALDOC-D.1 does not
change the four-column width shares and does not make the shared text engine
ignore authored hard breaks.

## Accepted Profile

`flowdoc-imported-soft-wrap-list-v1` runs inside the isolated page-free source
adapter before document resolution. It applies these source-neutral rules:

- canonicalize CRLF and CR to LF;
- fold nonblank continuation lines into the current paragraph or list item;
- join adjacent Thai and other no-space scripts without adding a space;
- retain a space for Latin/number boundaries and opening quoted text;
- preserve blank-line paragraph boundaries;
- preserve lines beginning with `-`, `*`, common bullet characters, or an
  ordered marker as list-item boundaries; and
- leave the Core line breaker and renderer unchanged.

The result retains block kind, source-line range, list marker, soft-wrap join
count, source/rendered fingerprints, and a normalization fingerprint. The UAT
adapter stores content-free evidence beside its canonical snapshots and marks
changed source provenance as `normalized-imported-text`.

The page-free source has no indentation geometry. A marker at the start of a
source line is therefore retained as a list boundary; the adapter does not
guess that it belongs to a previous item. The materialized v1 UAT field still
uses plain text markers. True list nodes and hanging-indent authoring can be a
separately versioned Structure follow-up and are not required to remove PDF
layout wraps.

## Exact Section Evidence

For the accepted section 2.1 slice, the profile processes 36 prose fields:

- 16 fields change after normalization;
- 176 source lines become 83 semantic blocks;
- 58 blocks are list items;
- 82 PDF layout wraps are folded;
- 58 semantic breaks are retained; and
- feature text changes from 4,833 source characters to 4,764 rendered
  characters without dropping the pinned source identity.

After native measurement and Core pagination, the exact artifact has:

- 6,456 glyph facts and 204 measured lines;
- no missing glyphs and no emergency break opportunities;
- 10 A4 pages and 278 paint commands;
- 3 requirement-table pages, 2 repeated headers, and 2 split rows; and
- 7 whole aspect-preserved screenshot rows.

The exact PDF is 1,417,536 bytes with SHA-256
`d4baa97c3e54b62bf3a775f8704a90ee088856bc6974b7c504552a6c13a086fd`.
Same-process and fresh-process renders retain identical bytes and receipts;
first-checkpoint cancellation returns no bytes or artifact.

Visual review covers all 10 rendered pages. Requirement text now reflows to
the measured cell edge instead of preserving the source PDF line width. Thai
glyphs, repeated headers, table borders, screenshots, page headers, footers,
and approval fields remain legible and unclipped.

## Evidence

Primary evidence:

- `packages/uat-realdoc/src/importedTextNormalization.ts`;
- `packages/uat-realdoc/src/uatSemanticNoPagesAdapter.ts`;
- `packages/uat-realdoc/fixtures/69c-section-2-1-adapter-evidence.v1.json`;
- `packages/uat-realdoc/fixtures/69c-section-2-1-resolution-evidence.v1.json`;
- `packages/uat-realdoc/fixtures/69c-section-2-1-measured-export-evidence.v1.json`;
- `tests/pdfExportRealdocImportedTextNormalization.test.ts`; and
- `tests/pdfExportRealdocUatMeasuredExport.test.ts`.

Recheck the exact artifact with:

```text
npm run verify:uat-69c-section-2-1-measured-export -- --semantic-dir <semantic-directory>
```

The local proof artifact is:

```text
output/pdf/flowdoc-69c-uat-section-2-1-realdoc-d1.pdf
```

REALDOC-D.1 does not activate source import UI, Editor authoring, persistence,
product eligibility, hosted providers, default routes, deployment, or
production. Next phase: `PDF-EXPORT-REALDOC-E` Editor workflow and local
artifact lifecycle.
