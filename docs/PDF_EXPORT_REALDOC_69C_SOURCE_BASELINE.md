# PDF Export Real Document 69C Source Baseline

Status: `PDF-EXPORT-REALDOC-A` accepted for a local external source baseline.
Production remains NO-GO.

## Decision

The 69C User Acceptance Record is the first product-readable target after the
accepted LOCAL-A through LOCAL-G canonical lane. The original PDF is retained
as a read-only content and visual oracle. The page-free semantic bundle is the
ordered semantic input. Neither source is copied into this repository.

The exact external inputs are pinned by
`fixtures/pdf-export-realdoc-69c-source-baseline.v1.json`. The manifest records
the PDF byte length and SHA-256, all three semantic root file lengths and
SHA-256 values, and one canonical digest over the sorted 149-image set. The
bundle fingerprint binds those facts into one source identity.

## Accepted Source Facts

- PDF: `69C_UAT_RC_26-07-17.pdf`, 200 A4 pages, 73,921,912 bytes.
- Semantic schema: `uat_semantic_no_pages_v1` with page fields removed.
- Semantic bundle: 3 modules, 29 sections, 240 requirements, 149 screenshots,
  and 421 ordered stream records.
- Requirement ids are unique and continuous from `REQ0001` through
  `REQ0240`.
- Every referenced PNG exists, dimensions match metadata, and no orphan PNG
  or duplicate image digest group was observed.
- The 149 PNGs total 21,033,151 bytes and 65,129,970 pixels.

The external source can be checked without copying it into the repository:

```text
npm run verify:uat-69c-source-baseline -- --pdf <pdf-path> --semantic-dir <semantic-directory>
```

The verifier fails closed on PDF drift, semantic root drift, image count,
image bytes, image dimensions, image digest, the section 2.1 slice, or the
combined source fingerprint.

## First Slice

Section `2.1` (ทะเบียนข้อมูลหอผู้ป่วย) is the first bounded slice:

- `REQ0137` through `REQ0146`;
- 10 requirements and 4,833 feature-text characters;
- 7 screenshots, 1,117,389 bytes, and 3,494,022 pixels; and
- source PDF pages 121 through 129, before section 2.2 begins on page 130.

This shape fits the accepted LOCAL-G page, image-count, and image-pixel
envelope. Actual measured draw commands, glyphs, output bytes, and execution
cost remain unknown until the Structure Definition and source adapter produce
the first measured contract.

## Preserved Limitations

The semantic source deliberately omits page, bounding-box, style, margin,
column, table-cell, header/footer, and authored screenshot-placement geometry.
Every requirement in a section currently links every screenshot in that
section. Those links prove section-level relation only; they do not identify
the exact screenshot insertion point.

The original PDF therefore remains an oracle, not a layout source. The next
phase must produce a FlowDoc-native UAT Structure Definition and make any
screenshot-placement decision explicit. Pixel-close reconstruction is not
claimed from the page-free semantic source.

## Ownership

- Source-specific parsing stays outside canonical Core document semantics.
- Core owns the source-neutral Structure Definition, instance/resolution,
  measured composition, pagination, and export contracts.
- Backend later owns trusted source retention, digest-bound resource loading,
  local operation orchestration, and artifact persistence.
- Editor later owns import selection, instance editing, preview, and the
  eligible local export lifecycle.

## Explicit Non-Work

- No PDF, semantic JSON, or PNG source bytes are committed.
- No user-specific absolute source path is retained.
- No package or document schema changes.
- No UAT import adapter or Structure Definition implementation.
- No renderer execution or artifact output.
- No Backend route, Editor workflow, hosted provider, or production binding.
- No weakening of the accepted LOCAL-G canonical resource policy.

## Acceptance

- The exact external source bundle is identity-pinned and locally verified.
- Repository evidence is small, JSON-safe, and contains no source document
  content or image bytes.
- Section 2.1 is selected with exact semantic and image resource facts.
- Missing layout and relation granularity remain explicit.
- Production remains NO-GO.

## PASS

- External PDF, semantic roots, image set, section 2.1, and combined bundle
  fingerprint verify against the retained manifest.
- Focused baseline tests and the full Core gate pass.
- The existing LOCAL-G canonical source, profile, runtime, and production
  decision remain unchanged.

## FAIL / BLOCKER

None for REALDOC-A source-baseline scope.

Product-readable admission remains blocked until REALDOC-B supplies the UAT
Structure Definition, source adapter, stable canonical identities, and
digest-bound section 2.1 resources.

## RISK

- The external bytes are not repository-retained, so future use must run the
  verifier before import.
- Section-level all-to-all screenshot links cannot select exact placement.
- The full 200-page source exceeds the accepted LOCAL-G canonical page, image,
  total-pixel, and output-byte shape and must not enter that profile directly.

## UNKNOWN

- Section 2.1 measured paint-command and glyph counts.
- Section 2.1 output byte length, wall time, CPU, and peak memory.
- Final screenshot placement policy and the amount of visual convergence
  required after the first FlowDoc-native export.

## Behavior Changed

An opt-in repository script can now verify a caller-supplied external 69C
source bundle. No import-time code, Core runtime, renderer, Backend, or Editor
behavior changed.

## Tests Run

- external source verifier against the user-provided PDF and semantic folder;
- `npm.cmd test -- tests/pdfExportRealdoc69cSourceBaseline.test.ts`;
- `npm.cmd run check` (`375` test files, `1,806` tests).

## Intentionally Not Changed

- canonical package/document schemas and parsers;
- LOCAL-G resolver, measured contract, renderer profile, and resource policy;
- Backend and Editor repositories;
- production activation decision.

Next phase: `PDF-EXPORT-REALDOC-B` UAT Structure Definition and section 2.1
source adapter.
