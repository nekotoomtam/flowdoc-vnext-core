# PDF Export Production Baseline

Phase `PDF-PILOT-08B-R2C-U` defines the production-hardening requirements
around the accepted Phase T request-to-bytes handoff. It accepts a bounded
policy and canonical resource envelope. It does not activate production.

## Ownership

- Core owns exact request/contract/receipt revalidation, deterministic
  idempotency payload identity, resource facts, safe ordering requirements,
  and activation-blocker vocabulary.
- Backend owns the idempotency store, attempt/deadline enforcement,
  cancellation and worker lifecycle, durable bytes and metadata transactions,
  observability sink, authorization, tenancy, routes, and deployment.
- Renderer owns bounded byte execution, cooperative mid-render cancellation,
  and production renderer/runtime profile qualification.

The backend composition scheduler Phase 402 work is a separate composition
worker lifecycle. It is useful cross-repo evidence, but it is not treated as a
PDF export worker binding without an explicit adapter and tests.

## Accepted Policy

The canonical baseline sets provisional ceilings, not production SLAs:

- two attempts and a 120-second execution deadline;
- 100 pages, 100,000 paint commands, and 1,000,000 glyphs;
- 16 fonts and 50 images;
- 25,000,000 pixels for one image and 250,000,000 pixels total; and
- 100,000,000 output bytes.

Core also caps every configurable value at an absolute finite maximum. Blank,
negative, non-integer, or unbounded policies fail closed.

The accepted canonical workload uses 13 pages, 1,814 paint commands, 15,732
glyphs, two fonts, five images, 9,150,048 source pixels, and 1,212,656 output
bytes. Every fact is below its policy limit.

## Required Semantics

The baseline derives an idempotency payload fingerprint from the exact source
revision, request, artifact, measured-contract identities, and execution
policy. Backend must
bind its caller-supplied idempotency key to that payload. Duplicate in-flight
work returns the existing operation, duplicate terminal work returns the
existing receipt, and a conflicting payload is rejected.

Cancellation checkpoints are required before handoff, before render, and
before persistence. Mid-render cancellation remains required because the
current synchronous pilot renderer cannot enforce it. Shutdown must reject new
work and then finish or cancel in-flight work. No automatic loop is added.

Durable commit order is fixed:

1. write content-addressed bytes;
2. verify byte length and SHA-256 through read-after-write;
3. compare-and-swap the artifact manifest; and
4. compare-and-swap the artifact job.

Metadata-before-bytes is forbidden. A bounded orphan-byte cleanup policy is
required for failures between byte and metadata commits.

Observability requires lifecycle events plus request, artifact, source
revision, contract/profile, attempt, stop reason, page/byte count, and duration
dimensions. Source text and PDF bytes are forbidden from events.

## Activation Decision

The baseline is accepted, but production activation remains blocked on ten
bindings:

- backend idempotency;
- deadline enforcement;
- cooperative cancellation;
- PDF worker lifecycle;
- durable byte storage;
- atomic artifact-manifest/job projection;
- observability sink;
- authorization and tenancy;
- production renderer profile promotion; and
- runtime profile qualification.

Primary evidence:

- `src/generation/pdfExportProductionBaselineV1.ts`;
- `tests/pdfExportProductionBaselineV1.test.ts`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-production-baseline.v1.json`;
- `packages/pdf-renderer-pilot/scripts/build-canonical-report-production-baseline-runtime.ts`.

Rebuild with:

```text
npm --prefix packages/pdf-renderer-pilot run build:report-production-baseline
```

The next step should be a cross-repo review that orders these bindings before
starting `PDF-EXPORT-V`. No backend route, worker, storage, or production flag
should be added from this baseline alone.
