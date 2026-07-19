# PDF Export REALDOC UAT Measured Export

Status: `PDF-EXPORT-REALDOC-D` accepted for the bounded local measured export
of UAT section 2.1. Production remains NO-GO.

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
- 6,448 native glyph facts with no missing glyphs;
- 237 measured lines;
- 11 A4 pages and 332 paint commands;
- 4 requirement-table pages;
- 3 split requirement rows and 3 repeated header fragments;
- 7 screenshot pages with 7 whole screenshot rows;
- 2 embedded Thai font subsets; and
- 7 distinct embedded PNG images covering 3,494,022 source pixels.

The exact PDF is 1,425,789 bytes with SHA-256
`1d0de80af9eb94f2bf05b465f8d002dc1a4b8e2ea3850864bda5e76b21a1dd9f`.
Two same-process renders and one fresh-process render return identical bytes
and receipt fingerprints. Cancellation at the first paint checkpoint returns
no bytes and no artifact.

Visual review covers all 11 rendered pages and representative full-size table,
transition, screenshot, and approval pages. Requirement ids remain on one
line, Thai glyphs are legible, table borders and repeated headers align, no
content overlaps or clips, every screenshot preserves its source ratio, and
the Screenshots heading is not orphaned.

The final Core gate passes 378 test files and 1,821 tests with two bounded
workers. The Backend gate passes type-check, build, and 70 test files with 267
tests; 24 provider-dependent integration tests retain their existing dynamic
skip. Focused Core and Backend renderer suites also pass.

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
output/pdf/flowdoc-69c-uat-section-2-1-realdoc-d.pdf
```

Retained evidence contains identities, counts, resource metadata, and receipts
only. It contains no source text, source bytes, PDF bytes, or machine-specific
source path.

## Explicitly Not Accepted

REALDOC-D does not accept source import UI, instance editing, save/reopen,
product-document eligibility, durable operation or artifact persistence,
default route mounting, automatic workers, remote providers, deployment,
tenancy, or production activation.

Next phase: `PDF-EXPORT-REALDOC-E` Editor workflow and local artifact
lifecycle. Production remains NO-GO.
