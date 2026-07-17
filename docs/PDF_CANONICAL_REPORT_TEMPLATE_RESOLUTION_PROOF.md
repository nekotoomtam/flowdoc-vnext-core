# PDF Canonical Report Template And Resolution Proof

Status: PDF-PILOT-08B-R2B canonical report template and resolution accepted.

## Objective

Replace the pilot-only authored-line bridge with a FlowDoc-native report
template and deterministic field/collection resolution boundary. This phase
must consume the accepted R2A data bundle without copying source facts into
template prose or introducing measurement, wrapping, layout, pagination, or
PDF facts.

## Accepted Boundary

The accepted template contains twelve semantic report sections on US Letter
pages. It owns section order, explanatory prose, style references, field and
image placements, and six collection-table shapes. The source adapter remains
the sole owner of benchmark facts and provenance.

Document-level resolution handles scalar and image references. Collection
item references cannot pass through that lane because they require an item
scope. `resolveVNextScopedDocumentV1(...)` closes this orchestration gap by
validating each table definition, item-field contract, table binding contract,
and source graph first. Only placements proven to be item-scoped by those
contracts are deferred; callers cannot provide an arbitrary skip list.

The validated collection plans then resolve and materialize their rows with
exact snapshot pins and externally derived identities. Inline identity remains
text-block scoped, so deferred placements are keyed by source node plus source
placement rather than inline id alone.

## Accepted Evidence

- source data bundle fingerprint:
  `ee9a5ad4b1f363f64afa37f9e23cb3e4a892bfe248be468ddd4d6487165abc4d`;
- resolution input fingerprint:
  `report-resolution-10fc0b213ab9b695b2263762`;
- accepted bundle fingerprint:
  `86f4fc3ddea01bfeba013292b09cbddb92dc7731cc07398c6c65f536ab27cf38`;
- 12 semantic sections, 473 template nodes, and additive `Letter` page size;
- 114 scalar placements and 5 image placements resolved at document scope;
- 6 collection tables, 73 rows, 476 cells, and 476 item bindings materialized;
- 63 item-scoped template placements deferred only after contract validation;
- all 154 fields classified as 125 presentation-bound and 29 critical
  evidence-only fields;
- deterministic rebuild produces the same JSON bundle and fingerprint.

The full fixture retains the source graph and materialized identity/provenance
evidence, so its size is intentionally larger than a renderer request.

## Page And Revision Semantics

`Letter` support is additive to the Document v4 target schema; existing `A4`
behavior is unchanged. Twelve template sections describe semantic structure,
not a fixed page count. Page count can be asserted only after measurement,
line breaking, layout, and pagination execute.

The accepted R2A instance is revision 1. The initial materialization planner
accepts revision 0 only, so R2B records `not-run-existing-revision` instead of
fabricating an initial-materialization claim. The resolved graph must remain
byte-for-byte equal to that instance graph.

## Explicitly Not Proven

- locale-aware display formatting and field-type presentation rules;
- text measurement, automatic wrapping, or line breaking;
- table sizing, section layout, pagination, or a twelve-page result;
- glyph shaping, paint commands, PDF bytes, or production renderer readiness.

Current scalar resolution is locale-neutral string conversion. Percentages,
durations, money, dates, booleans, and rounding must be specified before those
strings become text-engine input.

## Reproduction

```text
npm --prefix packages/pdf-renderer-pilot run build:report-template-resolution
npm run test -- --run tests/pdfRendererPilotCanonicalReportTemplateResolution.test.ts
npm run check
```

The builder validates R2A input, creates the R2B bundle twice, requires exact
determinism, validates the result, and writes the committed fixture and QA
summary.

## Next Boundary

`PDF-PILOT-08B-R2C` must first close typed locale/display formatting, then feed
the formatted resolved graph into the existing text measurement and line-break
contracts. Layout and pagination claims must remain downstream of accepted
measurement evidence.
