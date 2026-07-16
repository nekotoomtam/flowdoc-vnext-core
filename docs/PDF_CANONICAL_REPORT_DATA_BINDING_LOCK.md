# PDF Canonical Report Data And Binding Lock

Status: PDF-PILOT-08B-R2A report data and binding lock accepted.

## Objective

Replace the report pilot's direct source-to-final-lines bridge with a pinned,
FlowDoc-native data boundary. This phase converts the authoritative OCR
benchmark sources into typed field, collection, data snapshot, and media
snapshot contracts. It does not build a template or produce layout/PDF facts.

## Accepted Flow

```text
external benchmark sources
  -> OCR benchmark report data adapter
  -> published field + collection item contracts
  -> revision-pinned scalar, collection, and media snapshots
  -> provenance index
```

The old source-backed 12-page PDF remains a factual and visual oracle. It is
not evidence that the production FlowDoc resolution, text, layout, or PDF
pipeline has executed.

## Source Identity

The adapter verifies the five R1 data identities before reading facts:

- `build_report.py`: `d074e334ab877dbe1294fe6ecc2b7c080a4932731999f638c0eeac29650d2e49`;
- `metrics.json`: `b9b6f11475b45a15080631dc1c280071704ee09bae55466e7a18699cccd6f309`;
- `ground-truth.json`: `77e4973ae4f21da4c50bcfb2700551372e3333b0d638840b6879f20a10c8bea0`;
- `benchmark-spec.json`: `acbf7d6eaccaa82b8f86f80b8123602ae204b56e8da8f10f19b12df979b54568`;
- `analyze.ts`: `f0744b147a69783df8471d852b2785464f7ed0939da35fbf74dd6ec84dc1cffb`.

It also verifies all five PNG byte hashes and dimensions against
`fixtures/pdf-report-font-bakeoff-corpus.v1.json`. The reproduced source
snapshot is
`cfca20e65bfac2e2b20fe837d54985fada0e256549aefd18c8b935b20471ac26`.

## Contract Lock

All retained contracts pin the same instance revision and structure version:

- structure: `structure-ocr-benchmark-report-v1`;
- instance revision: `instance-ocr-benchmark-inv_9437125258-2026-07-16`, revision `1`;
- field contract: `fields-ocr-benchmark-report-v1`;
- collection item contract: `collection-items-ocr-benchmark-report-v1`;
- scalar/image data snapshot: `data-inv_9437125258-2026-07-16-r1`;
- collection snapshot: `collections-inv_9437125258-2026-07-16-r1`;
- media snapshot: `media-inv_9437125258-2026-07-16-r1`.

The bundle retains 154 fields, 148 scalar/image values, 6 collections, 73
collection items, and 5 image bindings. Scalar facts remain typed raw values;
the adapter does not own Thai display strings, units, percentage formatting,
or authored visual lines.

Collection ownership is explicit:

- `report.runs`: 6 provider runs;
- `report.ocr_runs`: 6 OCR engine runs;
- `report.native_runs`: 6 native extraction runs;
- `report.native_missing_concepts`: 13 missing-concept records;
- `report.mapping_fields`: 10 mapped GDIM records;
- `report.gdim_expected_fields`: 32 expected GDIM records.

Every scalar/image field and collection item has source provenance. Source
hashes, source-set identity, media registry identity, field types, exact item
shapes, owner pins, and the complete bundle fingerprint fail closed on drift.

## Boundary

The bundle deliberately records `not-run` for template resolution, text
measurement, line breaking, layout, pagination, and PDF rendering. It rejects
retained line arrays, point coordinates, glyphs, paint commands, page boxes,
font sizes, and measurement request IDs.

Therefore this phase proves the input side of the production path only. It
does not claim automatic wrapping, pagination, visual parity, or a production
PDF artifact.

## Evidence

- adapter: `packages/pdf-renderer-pilot/src/canonicalReportDataAdapter.ts`;
- generator: `packages/pdf-renderer-pilot/scripts/build-canonical-report-data-bundle.mjs`;
- bundle: `fixtures/pdf-pilot-canonical-report-data-bundle.v1.json`;
- QA: `packages/pdf-renderer-pilot/fixtures/canonical-report-data-bundle-qa.v1.json`;
- tests: `tests/pdfRendererPilotCanonicalReportDataBundle.test.ts`.

The accepted bundle fingerprint is
`ee9a5ad4b1f363f64afa37f9e23cb3e4a892bfe248be468ddd4d6487165abc4d`.

## Reproduction

```text
FLOWDOC_PDF_PILOT_REPORT_ROOT=<path-to-INV_9437125258> \
npm --prefix packages/pdf-renderer-pilot run build:report-data-bundle
```

The generator performs two in-process builds and requires byte-equivalent JSON
before writing the bundle and QA record.

## Next Phase

`PDF-PILOT-08B-R2B` will introduce the canonical FlowDoc report template and
resolve it against these exact contracts. Text measurement, wrapping, layout,
pagination, and PDF remain deferred.
