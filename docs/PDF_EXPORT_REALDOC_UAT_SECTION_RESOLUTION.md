# PDF Export Real Document UAT Section Resolution

Status: `PDF-EXPORT-REALDOC-C` accepted for revision-zero instance planning,
scoped document resolution, collection-row resolution, and table-content
materialization of exact 69C section 2.1. Measurement, pagination, rendering,
artifact production, product eligibility, and production remain closed.

## Decision

REALDOC-C composes existing Core contracts through the isolated
`@flowdoc/uat-realdoc` package. It does not add a canonical UAT schema, node
family, identity type, resolver entrypoint, or renderer behavior.

The accepted sequence is:

```text
REALDOC-B adapter bundle
  -> verify bundle and Structure fingerprints
  -> plan revision-zero Document Instance
  -> resolve document fields and styles with collection placements deferred
  -> resolve requirement and screenshot row streams
  -> materialize cloned row content and item bindings
  -> retain source-item to instance-row provenance
```

The resolution input fingerprint is:

```text
sha256:066ad4ca5bb61db55cd438067beadcceac53d10b324d07606badb32bfc6ec4b3
```

The exact section 2.1 resolution bundle fingerprint is:

```text
sha256:974f82e21abbe49fd3e4e552536d46e553c070a6c2c95dc5874ea627d124b4de
```

The refreshed resolution consumes the D.1 imported-text normalization
fingerprint before allocating generated rows. Raw source identity remains
pinned by the unchanged REALDOC-A baseline.

## Identity And Provenance

The caller-provided Document Instance remains revision zero. Generated row,
cell, node, and inline identities use the existing Core identity standard with
`resolution-orchestrator` ownership, deterministic allocation, and the exact
resolution-input scope.

Each identity derives from canonical structured origins containing the Table,
row source, row template, source row/cell/node/inline, collection field, item
key, and revision pins. REALDOC-C also joins the adapter's source pointer for
each collection item to its generated row identity. The starter graph remains
immutable.

JSON parse/serialize and complete re-resolution reproduce the same bundle,
row identities, generated identities, bindings, provenance, and fingerprints.

## Screenshot Placement

REALDOC-C resolves the preserved B warning with this explicit policy:

```text
section-after-requirements-source-order
```

All seven screenshots are placed in one section-level screenshot table after
the complete requirement table, retaining semantic source order. They are not
automatically placed after individual requirements because the page-free
source has no placement geometry and its links are section-wide all-to-all.

This is a composition decision, not an inferred source fact. A future
Structure Version may introduce finer placement only when better source
evidence exists.

## Exact 69C Result

- 8 resolved document field bindings;
- 18 resolved text-style bindings;
- 2 resolved tables;
- 18 total table rows: 1 authored header plus 17 collection rows;
- 17 materialized rows: 10 requirements plus 7 screenshots;
- 61 cloned nodes and 54 cloned inlines;
- 54 materialized text bindings;
- 7 materialized instance-media image bindings; and
- 17 source-item to instance-row provenance links.

Requirement Accept and Remark values are resolved from the instance
collection snapshot. Approver and approval date resolve from the revision-zero
data snapshot as editable empty values. Screenshot caption, image, and
description remain one `prefer-keep` materialized row for later measurement.

## PASS

- The exact REALDOC-B adapter and Structure fingerprints are required.
- Revision-zero instance planning passes existing lifecycle validation.
- Scoped resolution defers only declared collection-item placements.
- Requirement and screenshot row streams retain snapshot order.
- All generated content passes existing identity, source-graph, item-shape,
  binding, and provenance validators.
- The result survives JSON parse/serialize and deterministic re-resolution.
- Retained evidence contains counts and fingerprints only.

## FAIL / BLOCKER

None for REALDOC-C scope.

Export remains blocked because Thai text and table cells have not been
measured, screenshot rows have not been tested against page capacity, no page
plan exists, and no renderer handoff has executed.

## RISK

- Requirement text retains source newlines; measured line preparation must
  preserve intended breaks.
- A screenshot row may exceed remaining page capacity and require a
  conservative move or split decision.
- Deterministic identity allocation is currently exercised by the isolated
  local UAT orchestrator; Backend persistence remains intentionally absent.

## UNKNOWN

- Measured Thai glyph, line, cell, and row sizes.
- Actual page count and repeated-header occurrences.
- Image frame capacity after caption and description measurement.
- Output bytes, CPU time, peak memory, cancellation, and restart facts.

## Behavior Changed

The isolated UAT package can now turn an accepted section adapter bundle into
a deterministic resolved revision-zero document and two materialized table
streams. Existing Core, Backend, Editor, and production behavior is unchanged.

## Tests Run

- exact external `verify:uat-69c-section-2-1-resolution`;
- retained REALDOC-B adapter verification;
- focused `pdfExportRealdocUatSectionResolution.test.ts` (`4` tests);
- `npm.cmd run type-check`; and
- full `vitest` gate with bounded concurrency (`377` test files, `1,817`
  tests).

## Intentionally Not Changed

- canonical Core package/document schemas and node vocabulary;
- source files, image bytes, and retention policy;
- LOCAL-G renderer, resource envelope, and product eligibility;
- Backend and Editor repositories;
- persistence, revision advancement, measurement, pagination, and rendering;
- production `NO-GO` decision.

Next phase: `PDF-EXPORT-REALDOC-D` section 2.1 measured local export.
