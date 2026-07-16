# PDF Canonical Report Decision-Content Parity Proof

Status: PDF-PILOT-08A decision-content parity proof accepted.

Umbrella work item: `PDF-PILOT-INV-9437125258`.

## Objective

Close the semantic omissions found after PDF-PILOT-07 without mixing in the
typography calibration planned for PDF-PILOT-08B. The phase keeps the accepted
Phase 07 measured renderer and 12-page identity, but materializes a separate
content-parity request and font subset so the earlier byte evidence remains
unchanged.

This phase claims decision-relevant semantic content parity. It does not claim
verbatim sentence parity, typography parity, pixel equivalence, automatic
layout, or production integration.

## Pinned Content Source

The parity manifest binds both the final reference PDF and the external report
builder that authored its content:

```text
reference PDF sha256: 56f17f2cc97bfe545d6f8dba9c4e2f45928c9398d0b8cad129c19b51ca3695a8
build_report.py sha256: d074e334ab877dbe1294fe6ecc2b7c080a4932731999f638c0eeac29650d2e49
build_report.py bytes: 54,349
```

The request builder fails before shaping if either external identity drifts.
Neither external file is copied into Core.

## Content Contract

`fixtures/pdf-pilot-canonical-report-content-parity.v1.json` applies explicit
replace/insert operations over the retained Phase 07 composition. It then
validates:

- 12 required restored elements;
- 10 table row-count contracts;
- 8 exact factual values;
- 19 required semantic strings;
- a minimum 90% non-whitespace character ratio against the reference.

The materialized report retains 9,743 of the reference's 10,619 extracted
non-whitespace characters, or `91.7506%`. The manifest rejects removal of the
Azure unstructured-field inventory, Mapper details, full source SHA-256,
complete Azure source URL, or corrected table facts.

Restored decision content includes:

- the cover's primary-suite label and full method SHA-256;
- Azure OCR values not represented by Native key-value/table output;
- current Google/Azure Mapper fields and the BOI mis-mapping explanation;
- all four root causes of the Mapping gap across pages 8 and 9;
- complete evidence SHA/path/reproduction facts;
- CER/WER abbreviations, polygon terminology, and the full Azure reference URL.

The OCR table's Azure Raw JSON value is corrected from the Phase 07 fixture's
incorrect `0.20 MB` to the source-backed `0.10 MB`.

## Artifact And QA

```text
sha256: 2b22eda73f9124e5bcb8c3d582f458cec78a8a230bebc6409909ad74c319f338
899,486 bytes, PDF 1.7, 12 Letter pages
543 measured draw commands / 562 ordered paint commands
391 glyph runs / 10,574 glyph occurrences / 152 box commands
```

Poppler recovers all `391/391` text runs exactly. Pypdf recovers 330 raw and all
391 after whitespace normalization; all 19 required semantic strings remain
extractable. The dedicated 37,596-byte Type0 subset retains 138 glyph IDs.

All twelve pages render at `1224 x 1584` RGB pixels at 144 DPI. Individual-page
and contact-sheet inspection confirms the restored page 6, 8, and 9 sections,
all page markers, no missing glyph, no clipped content, no text-bound overlap,
and no footer collision. All six image paints retain exact RGB pixel identity.
A second build produces the same hash.

Retained evidence:

- `fixtures/pdf-pilot-canonical-report-content-parity.v1.json`;
- `fixtures/pdf-pilot-canonical-report-content-parity-twelve-page-request.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-content-parity-font-subset-manifest.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-content-parity-twelve-page-summary.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-content-parity-twelve-page-qa.v1.json`;
- `tests/pdfRendererPilotCanonicalReportContentParity.test.ts`.

The generated local PDF is
`output/pdf/flowdoc-pdf-pilot-canonical-report-content-parity-twelve-page.pdf`.

## PASS

- Pinned reference PDF and report-builder identities fail closed.
- Every required section, factual value, table row count, and semantic string is
  present in the materialized composition.
- Content coverage exceeds the retained 90% acceptance floor.
- Poppler/pypdf extraction, deterministic rendering, image identity, and
  twelve-page visual inspection pass.
- Phase 07 PDF and subset hashes remain byte-identical.

## FAIL / BLOCKER

None for closing PDF-PILOT-08A.

Production report fidelity remains blocked on readable typography, bold-style
execution, report-wide visual thresholds, and production ownership/integration.

## RISK

- The parity level is semantic and decision-relevant, not a verbatim copy of
  every reference sentence.
- IBM Plex Regular and the Phase 07 small font sizes remain unchanged; this
  phase must not be read as a readability acceptance.
- Pypdf requires whitespace normalization for exact mixed Thai/Latin run
  presence.
- Layout remains caller-measured with no automatic wrapping or pagination.

## Intentionally Not Changed

- no Phase 07 retained artifact or fixture was replaced;
- no font size, font weight, or style token was calibrated;
- no renderer profile or production adapter was activated;
- no external PDF, source builder, report image, or Tahoma byte was retained;
- no route, worker, storage, auth, editor, DOCX, or schema behavior changed.

Next phase: `PDF-PILOT-08B` typography and layout calibration.
