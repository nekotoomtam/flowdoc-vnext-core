# PDF Real Export Handoff

Phase `PDF-PILOT-08B-R2C-T` binds the accepted measured draw contract to an
actual PDF byte execution without moving measurement, pagination, layout, or
semantic grouping into the exporter.

## Accepted Boundary

Core owns three deterministic contracts in
`src/generation/pdfExportHandoffV1.ts`:

1. The export request pins the document id, exact revision, document
   fingerprint, source owner, measured-contract identity and full in-memory
   content fingerprint, renderer/measurement profiles, page count, artifact
   id, and PDF media type.
2. The handoff rechecks the current source and exact measured contract before
   exposing renderer input. Any stale revision, changed request, changed
   contract content, or changed profile blocks before renderer execution.
3. The receipt accepts renderer metadata only when artifact id, byte count,
   SHA-256, page count, profiles, and both contract identities match. The
   receipt intentionally carries no PDF bytes and records the artifact as
   `not-stored`.

The pilot execution wrapper consumes only a ready Core handoff. It returns PDF
bytes only after Core accepts the receipt. Renderer or receipt failure returns
no bytes and no partial receipt.

## Canonical Evidence

The canonical OCR report pins:

- document `instance-ocr-benchmark-inv_9437125258-2026-07-16`, revision `1`;
- source bundle `96c48b7287fc0c5532059cf8ad4ff135df5f07fb63bfe6bf6054e150775a8b67`;
- measured contract `sha256:020881c6099d8eec5e73d5558efa0c0d65de67599aa99e82f8cbf9d62e4e6917`;
- measured content `sha256:5f28958947715a3a9bdc006a73688bf8226f782047db5f5c53ffe0349dbd8b78`;
- renderer profile `pdf-pilot-08b-r2c-l-full-document-v1`;
- 13 pages, 1,212,656 bytes, artifact SHA-256
  `c4d09f0dfd66e1e3983bc679602fdc7d397de30edcb4f93fac3a0fa0c422960b`.

Two independent in-memory executions return identical bytes and receipt
fingerprints. The artifact identity remains byte-exact with the accepted Phase
S result.

Primary evidence:

- `packages/pdf-renderer-pilot/fixtures/canonical-report-real-export-handoff.v1.json`;
- `packages/pdf-renderer-pilot/scripts/build-canonical-report-export-handoff-runtime.ts`;
- `tests/pdfExportHandoffV1.test.ts`;
- `tests/pdfRendererPilotRealExportHandoff.test.ts`.

Rebuild with:

```text
npm --prefix packages/pdf-renderer-pilot run build:report-export-handoff
```

## Explicitly Not Accepted

Phase T does not add or accept a backend route, worker or queue, cancellation,
idempotency, durable byte storage, artifact-manifest projection, access
control, resource limits, production renderer binding, or production
fidelity. Those concerns begin with Phase U production-hardening baseline.
Phase U records them in `docs/PDF_EXPORT_PRODUCTION_BASELINE.md` without
claiming that any runtime binding is complete.

## Local Runtime Follow-Up

`PDF-EXPORT-LOCAL-E` reuses this exact Phase T source identity, measured
contract/content identity, and artifact byte identity inside the separate
loopback-only Backend composition. Startup verifies a SHA-256-pinned copy of
this handoff plus every canonical font/image resource before admitting the
document revision. Independent local HTTP and worker connections retain the
same 13-page, 1,212,656-byte artifact through physically verified download.

`PDF-EXPORT-LOCAL-F` adds exact-pin eligibility and the development-only Editor
request/status/cancel/download workflow without changing this artifact. The
normal product Editor document remains ineligible and cannot substitute this
canonical source. This follow-up does not change the Phase T boundary: the
default Backend server, production renderer/provider selection, readiness,
and production activation remain blocked.

`PDF-EXPORT-LOCAL-G` retains the same artifact across a complete first-process
request/render/download and second-process terminal replay over actual local
PostgreSQL and MinIO. Both downloads retain the exact byte identity and the
second worker invokes no work. The bounded local readiness audit is accepted;
product-document eligibility, hosted providers, and production activation
remain blocked.

`PDF-EXPORT-REALDOC-A` opens the product-readable follow-up without changing
this handoff. It pins the external 200-page 69C UAT PDF, three page-free
semantic JSON roots, and the canonical 149-image set under one source bundle
fingerprint. Section 2.1 is selected as the first bounded Structure Definition
and source-adapter slice. No measured contract, renderer execution, product
eligibility, hosted provider, or production binding is claimed by the source
baseline.

`PDF-EXPORT-REALDOC-B` accepts a source-neutral UAT Structure Definition and an
isolated strict page-free semantic adapter. Exact section 2.1 source facts now
produce canonical instance-data, table-collection, and instance-media snapshot
inputs with retained provenance and content-sensitive fingerprints. It does
not materialize the starter graph, resolve generated rows, measure, paginate,
or change this handoff's accepted renderer input.

`PDF-EXPORT-REALDOC-C` accepts deterministic revision-zero instance planning,
scoped document resolution, and materialized requirement/screenshot row
streams. It resolves screenshot placement after the section requirement table
in source order and retains source-item to instance-row provenance. No measured
contract, page plan, renderer input, artifact, or product eligibility changes.

`PDF-EXPORT-REALDOC-D` consumes that exact resolution through native Thai
measurement, Core table preparation/pagination/projection, and a separate
bounded `local-measured-document` renderer profile. `PDF-EXPORT-REALDOC-D.1`
then folds source-PDF layout wraps before resolution while retaining semantic
paragraph/list breaks and normalization fingerprints. The exact section exports
as a 10-page deterministic local PDF with repeated requirement headers, whole
aspect-preserved screenshots, cooperative cancellation, and fresh-process
restart equality. The canonical renderer profile remains unchanged. DocGen
admission, durable artifact lifecycle, Editor pre-test, hosted providers, and
production binding remain deferred.

`PDF-EXPORT-REALDOC-E.0` realigns the deferred workflow with the existing
Structure Definition architecture. The Editor remains the Structure authoring
product; test-data import is a pre-test caller of the same mapping and DocGen
contracts used by external API clients. REALDOC-E must pin one Published
Structure Version, mapping/input contract, accepted Data Snapshot, generation
instance, and digest-bound asset set before the existing local artifact
lifecycle can run. No runtime or artifact identity changes in E.0.

`PDF-EXPORT-REALDOC-E.1` now adds the source-neutral generation input plan.
Direct canonical snapshots and adapted payload descriptors share exact
Published Structure, data-contract, instance, mapping, and snapshot identity
pins. Direct input stops before runtime validation; adapted input stops before
mapping. The handoff, measured contract, renderer, bytes, and artifact lifecycle
remain unchanged.

`PDF-EXPORT-REALDOC-E.2` now proves both input lanes converge on one canonical
snapshot object/fingerprint after exact payload/mapper verification and shared
validation. The output stops at `materialization`; no measured handoff,
renderer, bytes, operation, or artifact identity changes.

`PDF-EXPORT-REALDOC-E.3` now places an optional bounded loopback Backend
admission before that `materialization` boundary. Backend owns the revision-0
instance, trusted Structure/data contract and mapper lookup, idempotency, exact
asset-byte checks, protected canonical record, and content-free public receipt.
No 69C request is connected to this measured handoff, renderer, bytes,
operation, or artifact lifecycle until E.4.

`PDF-EXPORT-REALDOC-E.4` now resolves that protected canonical record without
reconstructing adapter provenance, creates the measured 69C handoff, and reuses
the existing local PDF operation, worker, cancellation, persistence, status,
and verified-download lifecycle. The retained 10-page evidence remains
local-only; default mounting, Editor pre-test, durable generation storage,
hosted providers, and production are still inactive.
