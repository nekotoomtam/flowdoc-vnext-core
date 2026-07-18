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

This follow-up does not change the Phase T boundary: the default Backend
server, Editor integration, production renderer/provider selection, and
production activation remain blocked.
