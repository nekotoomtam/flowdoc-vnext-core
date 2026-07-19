# PDF Export REALDOC Admitted Artifact Lifecycle

Status: `PDF-EXPORT-REALDOC-E.4` accepted local-only artifact lifecycle
binding. Production remains NO-GO.

## Boundary

E.4 connects one Backend-protected E.3 canonical generation record to the
existing PDF operation, worker, persistence, status, cancellation, and
verified-download lifecycle:

```text
protected canonical generation record
  -> source-neutral Core materialization and resolution
  -> native measurement and measured draw contract
  -> digest-bound font and image resources
  -> existing Backend PDF operation and lifecycle
  -> local renderer -> content-addressed bytes -> verified download
```

Core now exposes `resolveFlowDocUatCanonicalGenerationV1(...)`. It accepts the
exact canonical snapshot input and Published Structure fingerprint retained by
Backend. It derives screenshot order from canonical collection order and does
not fabricate source-adapter metadata or source-to-instance provenance. The
existing source-adapter resolution API and its fingerprints remain unchanged.

The UAT local runtime composes the resolved generation into the existing
measured export plan, native Thai shaping/segmentation, pagination, and
measured draw contract. Temporary font-subset files are removed before the
result returns. The local runtime receives no raw adapted payload.

## Backend Binding

Backend resolves the protected record by credential-scoped `instanceId` and
exact revision, revalidates record/receipt/canonical fingerprints, and reads
asset bytes only through the trusted digest-verifying registry. The resulting
source identity pins the protected record, canonical input, materializer
implementation, measured contract, and resource identities.

The existing `POST /pdf-exports` request shape remains unchanged: the caller
passes the E.3 `instanceId` and revision zero. Existing idempotent operation,
worker claim, cooperative cancellation, persistence, status, terminal replay,
integrity verification, and download code is reused. No second artifact
lifecycle or renderer path was added.

The UAT materializer is invoked through a bounded local subprocess so Core
retains UAT resolution/measurement ownership without compiling Core source
inside Backend. The subprocess receives canonical snapshots and admitted
asset bytes in memory. It is not a hosted provider or production boundary.

## 69C Evidence

The retained Backend evidence proves the provided section 2.1 source through
the complete local path:

- 10 requirements and 7 screenshots admitted;
- direct canonical lane, revision-zero Backend instance;
- 10-page PDF, 1,417,544 bytes;
- SHA-256
  `61f84cbd503260faf9ff60e303d7053fb09b5ef1b24cb720fc54e0bb24262d0a`;
- exact route replay without rematerialization;
- completed worker and retained artifact persistence;
- physically verified download; and
- cancellation before worker with no persisted bytes.

The content-free evidence is retained in
`../flowdoc-vnext-backend/src/tests/fixtures/pdf-export-realdoc-e4-evidence.v1.json`.
The generated PDF is an ignored local output, not a canonical fixture.

## Guardrails

- No raw adapted payload is retained or reread after E.3.
- No canonical business values enter public receipts, status, or lifecycle
  events.
- Changed canonical data changes the downstream source/request identity.
- UAT remains a document-specific materializer package, not canonical Core
  field schema.
- The default application server, local command, Editor UI, hosted providers,
  durable generation repository, and production binding remain unchanged.

## Visual Review

Rendered page review confirms the accepted soft-wrap behavior, readable Thai
tables, all seven screenshot pages, and the final approval area. The existing
renderer-pilot continuation-page defect remains visible on some pages: the
header and the leading `Pa` of `Page` can be hidden. The same defect is present
in the accepted REALDOC-D artifact, so it is retained as a separate renderer
correctness task rather than concealed as an E.4 lifecycle failure.

## Next Phase

`PDF-EXPORT-REALDOC-E.5.0` locks the Editor Library and shared Design/Preview
workspace without runtime activation. E.5.1 now accepts the bounded local
Library read model and first Library-to-Design view. E.5.2 next adds the shared
workspace header and URL-backed tabs. Imported values remain
separate from authored Structure content and browser preview is not artifact
truth. Production remains NO-GO.
