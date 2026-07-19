# PDF Export REALDOC UAT Measured Export

Status: `PDF-EXPORT-REALDOC-D` accepted for the bounded local measured export
of UAT section 2.1 and refined by accepted `PDF-EXPORT-REALDOC-D.1` imported
soft-wrap normalization. Production remains NO-GO.

## Accepted Boundary

REALDOC-D consumes the exact REALDOC-C resolved instance and adds a reusable
UAT measured-composition lane. The lane is source-neutral: it knows the UAT
Structure Definition and local measurement profile, but contains no 69C text,
image names, semantic paths, or source fingerprints.

The accepted composition:

- shapes IBM Plex Sans Thai with native rustybuzz `0.20.1`;
- segments Thai and explicit hard line breaks with native ICU4X `2.2.0`;
- prepares authored and materialized table cells through Core;
- paginates requirement rows with repeated leading headers;
- keeps screenshot rows whole and preserves image aspect ratio with `contain`;
- keeps the Screenshots heading with the first screenshot row;
- repeats the measured document header and generated page footer;
- creates a Core measured draw contract; and
- hands that contract to the bounded `local-measured-document` renderer.

The shared line-wrap evidence boundary now stops at internal mandatory breaks.
Newline/control characters are not sent to rustybuzz as visible glyphs, while
their source offsets remain part of the accepted measured-line evidence.

REALDOC-D.1 removes source-PDF layout newlines before this boundary while
preserving paragraph/list boundaries. The shared text engine still honors
authored hard breaks. See
`docs/PDF_EXPORT_REALDOC_IMPORTED_SOFT_WRAP_NORMALIZATION.md`.

## Local Renderer Profile

The new renderer profile is `flowdoc-local-measured-document-v1`. It retains
the existing canonical profile unchanged and accepts only a bounded local
contract:

- 1 through 64 pages;
- at most 8 fonts and 64 images;
- at most 50,000,000 declared source-image pixels;
- at most 50,000 paint commands; and
- at most 250,000 glyphs.

It consumes supplied glyph facts, measured vertical offsets, cluster mapping,
font subset bytes, and digest-bound PNG bytes. It may not reshape, remeasure,
repaginate, relayout, write files, write storage, or bind production.

The Backend local renderer SPI can select this profile through the same
trusted resource resolver and cooperative checkpoint control used by the
existing local profiles. Persisted operation, route, and Editor eligibility
remain deferred to REALDOC-E.

## Exact Section 2.1 Evidence

The accepted external 69C slice produces:

- 97 measurement consumers;
- 6,456 native glyph facts with no missing glyphs;
- 204 measured lines;
- 10 A4 pages and 278 paint commands;
- 3 requirement-table pages;
- 2 split requirement rows and 2 repeated header fragments;
- 7 screenshot pages with 7 whole screenshot rows;
- 2 embedded Thai font subsets; and
- 7 distinct embedded PNG images covering 3,494,022 source pixels.

The exact PDF is 1,417,536 bytes with SHA-256
`d4baa97c3e54b62bf3a775f8704a90ee088856bc6974b7c504552a6c13a086fd`.
Two same-process renders and one fresh-process render return identical bytes
and receipt fingerprints. Cancellation at the first paint checkpoint returns
no bytes and no artifact.

Visual review covers all 10 rendered pages and representative full-size table,
transition, screenshot, and approval pages. Requirement ids remain on one
line, Thai glyphs are legible, table borders and repeated headers align, no
content overlaps or clips, every screenshot preserves its source ratio, and
the Screenshots heading is not orphaned.

The final D.1 Core gate passes 379 test files and 1,824 tests with two bounded
workers. The unchanged Backend adapter passes type-check and its focused local
renderer suite with 7 tests. The earlier REALDOC-D full Backend build and 267
test gate remains accepted.

## Evidence And Verification

Primary evidence:

- `packages/uat-realdoc/src/uatMeasuredExport.ts`;
- `packages/uat-realdoc/scripts/uat-native-measurement-runtime.ts`;
- `packages/uat-realdoc/scripts/verify-69c-section-measured-export.mjs`;
- `packages/uat-realdoc/fixtures/69c-section-2-1-measured-export-evidence.v1.json`;
- `packages/pdf-renderer-pilot/src/index.ts`;
- `tests/pdfExportRealdocUatMeasuredExport.test.ts`;
- `tests/pdfRendererPilotControlledExecution.test.ts`; and
- `../flowdoc-vnext-backend/src/tests/pdfExportLocalRenderer.test.ts`.

Recheck the exact external slice with:

```text
npm run verify:uat-69c-section-2-1-measured-export -- --semantic-dir <semantic-directory>
```

The local proof PDF is written to:

```text
output/pdf/flowdoc-69c-uat-section-2-1-realdoc-d1.pdf
```

Retained evidence contains identities, counts, resource metadata, and receipts
only. It contains no source text, source bytes, PDF bytes, or machine-specific
source path.

## Explicitly Not Accepted

REALDOC-D does not accept source import UI, instance editing, save/reopen,
product-document eligibility, durable operation or artifact persistence,
default route mounting, automatic workers, remote providers, deployment,
tenancy, or production activation.

REALDOC-D.1 later normalizes imported soft wraps. REALDOC-E.0 then realigns the
next workflow with API-driven DocGen. Next runtime phase:
`PDF-EXPORT-REALDOC-E.1` Published Structure generation input and mapping
contract. Production remains NO-GO.
