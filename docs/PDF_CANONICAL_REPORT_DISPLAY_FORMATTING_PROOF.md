# PDF Canonical Report Display Formatting Proof

Status: PDF-PILOT-08B-R2C-A typed display formatting accepted.

## Objective

Turn the locale-neutral scalar and collection values accepted by R2A/R2B into
deterministic display strings before text measurement. Formatting must remain
a published sidecar owned by the exact Structure Version. It must not mutate
source values, the authored graph, resolved identities, or materialized table
content.

## Architecture

Core now publishes a strict Display Formatting v1 contract and pure formatter.
The contract pins the Published Field Contract and Collection Item Contract,
requires complete scalar/item assignment coverage, validates format/type
compatibility, and blocks owner or contract-id drift.

The canonical report publishes 22 used format definitions across 143 scalar
fields and 63 collection item-field definitions. The supported report profiles
cover plain text, fixed/grouped numbers, percentages, millisecond-to-second and
byte-to-megabyte scaling, THB/USD units, boolean labels, enum labels, Gregorian
Thai month-name dates, and UTC instants.

Formatting does not use `Intl`. The contract pins Latin digits, `.` decimal,
`,` grouping, Gregorian calendar, UTC, and the ECMAScript `toFixed` algorithm.
These choices reproduce the accepted JavaScript report oracle and avoid hidden
OS/runtime locale data. They are not a general locale framework claim.

## Accepted Evidence

- R2A data bundle fingerprint:
  `ee9a5ad4b1f363f64afa37f9e23cb3e4a892bfe248be468ddd4d6487165abc4d`;
- R2B template bundle fingerprint:
  `86f4fc3ddea01bfeba013292b09cbddb92dc7731cc07398c6c65f536ab27cf38`;
- retained resolution input fingerprint:
  `report-resolution-10fc0b213ab9b695b2263762`;
- R2C-A bundle fingerprint:
  `e4f0411afc7d6868971019fb536146f63aa355b5a6e48c606502342bd6302e26`;
- 114 document bindings and 476 collection bindings formatted;
- all 590 outputs retain raw typed value, raw resolved text, format key,
  format kind, display text, and source placement identity;
- 268 outputs intentionally differ from raw resolver text;
- deterministic rebuild produces identical fixture and QA bytes.

Representative accepted outputs:

| Source value | Format | Display text |
|---|---|---|
| `2026-07-16` | Thai Gregorian date | `16 กรกฎาคม 2026` |
| `6495.463799998164` ms | seconds, two digits | `6.50 วินาที` |
| `8.63784` THB | THB, two digits | `8.64 บาท` |
| `0.848809922896413` | percent, one digit | `84.9%` |
| `4053388` bytes | grouped bytes | `4,053,388 bytes` |

## Preserved Lineage

Document bindings retain the exact R2B text-block and inline identities.
Collection bindings retain table, collection, item, source-placement, and
resolved `inli` identities. Their raw canonical text must equal the R2B
binding value before a display string is accepted.

Evidence-only critical fields receive format assignments because the
Published contract is complete, but they are not promoted into presentation
bindings. Images and collection fields are excluded from scalar formatting.

## Measurement Boundary

The bundle is `ready-for-measurement-request-preparation`: formatted values are
complete and can replace raw binding text in a future measurement input view.
R2C-A does not calculate available widths, table cell geometry, measurement
requests, line breaks, glyphs, coordinates, page count, or PDF bytes.

This separation is required because table text requests need accepted cell
geometry, while external text-engine execution still belongs outside direct
Core dependencies.

## Reproduction

```text
npm --prefix packages/pdf-renderer-pilot run build:report-display-formatting
npm run test -- --run tests/pdfRendererPilotCanonicalReportDisplayFormatting.test.ts
npm run check
```

The builder validates committed R2A and R2B fixtures, builds R2C-A twice,
requires exact JSON equality, validates all lineage and formatting facts, and
writes the committed bundle and QA summary.

## Residual Risk

- Future values exactly at decimal half-way boundaries need explicit
  cross-language parity evidence if a non-JavaScript formatter is introduced.
- New enum values block until the Published format contract supplies labels.
- Current date profiles cover ISO dates and UTC instants only.
- Text width, automatic wrapping, table sizing, and page count remain unknown.

## Next Boundary

`PDF-PILOT-08B-R2C-B` should project these display bindings into text-block
measurement requests, derive table cell geometry from accepted width facts,
and prepare external text-engine requests without yet claiming pagination or
PDF rendering.
