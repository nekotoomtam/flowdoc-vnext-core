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

The cross-repo review and binding order are now retained in
`docs/PDF_EXPORT_V_ARCHITECTURE_LOCK.md`. Phase `PDF-EXPORT-V-A` adds pure Core
pre-render admission and post-render validation. Phase `PDF-EXPORT-V-B` adds a
backend immutable operation and durable caller-key mapping. Phase
`PDF-EXPORT-V-C` adds a separate revisioned lifecycle head, atomic transition
replay, bounded claims/attempts, deadline and checkpoint-cancellation decisions,
and a process-local shutdown-drain gate.

V-C does not run an automatic worker or renderer. Phase `PDF-EXPORT-V-D` adds
the exact Core handoff/receipt/completion adapter, bounded cooperative
cancellation checkpoints, and runtime candidate qualification. Validated PDF
bytes cross into `PDF-EXPORT-V-E`, which atomically publishes a SHA-256 content
identity, verifies physical bytes by readback, then projects the rendered Core
manifest and job with transactional CAS. A retained terminal receipt supplies
restart replay, and bounded grace-based reconciliation handles bytes left
before a failed metadata commit.

V-E accepts only the persistence candidate gate. Follow-up `PDF-EXPORT-V-F`
now composes V-B through V-E, atomically retains a closed privacy-safe Core
event chain plus terminal workflow completion, and proves full SQLite restart/
fault recovery. The event batch is terminal evidence rather than a selected
production telemetry delivery and retention provider.

Production storage/event-provider selection, automatic worker hosting,
authorization and tenancy execution, routes, concrete renderer promotion,
deployment, and activation remain blocked. Follow-up V-G carries those
blockers explicitly into its route and activation review.

V-G now accepts an unmounted authenticated request/status/cancel/download
candidate with credential-derived scope, per-action authorization, redacted
status, durable cancellation replay, and terminal plus physical-byte download
verification. Its activation review is **NO-GO**. Injected test providers do
not select production identity policy, source/admission resolution, renderer,
worker hosting, storage, telemetry, server mount, or deployment. No production
binding or flag is activated.

The post-V implementation order is now locked in
`docs/PDF_EXPORT_LOCAL_FIRST_ARCHITECTURE_LOCK.md`. It qualifies a loopback-only
runtime with local providers before production provider selection and does not
change this baseline's NO-GO activation decision.

LOCAL-B through LOCAL-G now accept the controlled renderer adapter, local
PostgreSQL/S3-compatible providers, bounded due-work discovery, the
explicit-start local worker lifecycle, and a separate loopback-only canonical
HTTP composition plus the development-only same-origin Editor workflow. The
LOCAL-G audit adds two-process exact replay, cancellation/corruption evidence,
and a bounded measured resource envelope. The default application server
remains unmounted, browser code receives no local credential, and the normal
product document remains ineligible without fixture substitution. Hosted
providers and production activation remain blocked. None of these local
follow-ups changes this baseline's production NO-GO decision.

`PDF-EXPORT-REALDOC-A` records the exact external 69C UAT source bundle and a
bounded section 2.1 first slice in
`docs/PDF_EXPORT_REALDOC_69C_SOURCE_BASELINE.md`. This is source identity and
planning evidence only. It does not change the accepted production resource
policy, activate a product document, execute rendering, select hosted
providers, or change this baseline's production NO-GO decision.

`PDF-EXPORT-REALDOC-D` later accepts a separate bounded local measured-document
profile. `PDF-EXPORT-REALDOC-D.1` removes source-PDF layout wraps before
measurement and accepts an exact 10-page section 2.1 artifact. Its limits are narrower than
this production baseline, its Backend adapter writes no storage, and its
renderer remains explicitly non-production. This evidence does not select a
hosted provider, mount a default route, activate product eligibility, or
change the production NO-GO decision.

`PDF-EXPORT-REALDOC-E.0` records the DocGen architecture realignment only. It
keeps Structure authoring, external caller data, mapping, canonical Data
Snapshot resolution, and artifact execution as separate boundaries. Test-data
import must converge with the external API path before resolution and cannot
activate a browser-owned renderer or product Document Instance editing lane.
No production binding or blocker changes.

`PDF-EXPORT-REALDOC-E.1` adds only a pure content-free generation input plan.
It explicitly reports mapping or runtime validation as not run and cannot
materialize, resolve, measure, render, persist, or activate production. Direct
and adapted input identities do not select production routes, providers,
workers, authorization, tenancy, or deployment.
