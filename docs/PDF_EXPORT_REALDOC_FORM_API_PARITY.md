# PDF Export REALDOC Form/API Parity

Status: `PDF-EXPORT-REALDOC-E.5.9` accepted for local development.
Production remains NO-GO.

## Decision

Editor Form pre-test and an external adapted-JSON caller now enter the same
Backend admission boundary and the same Core runtime validator. The browser
projects the generated Form into a direct canonical candidate, but Backend
still admits it, allocates instance identity, validates it, retains protected
canonical values, and owns artifact execution.

This is content parity, not instance parity. A direct Form request and an
adapted API request are separate generation intents and therefore retain
different instance, snapshot, canonical-input, operation, and artifact
identities.

## Core Identity

Ready generation runtime results now expose
`canonicalContentFingerprint`. It fingerprints only canonical data values,
field-key-sorted collection content, and the admitted media registry. It does
not include source lane, instance id, Data Snapshot identity, collection/media
snapshot identity, or request identity.

`canonicalInputFingerprint` remains the stronger instance-bound identity. It
must not be replaced by the content fingerprint for replay, persistence,
authorization, stale checks, or artifact lookup. Blocked runtime results expose
`canonicalContentFingerprint: null`.

## Shared Admission

The two accepted lanes are:

```text
generated Form
  -> direct canonical candidate
  -> Backend direct admission
  -> shared Core runtime validation

external JSON
  -> trusted Backend mapping profile
  -> adapted canonical input
  -> shared Core runtime validation
```

Editor owns temporary Form interaction only. It is not a mapper, canonical
identity allocator, resolver, paginator, renderer, artifact store, or source
of Backend validation truth. Imported Form JSON may hydrate only fields that
exist in the exact projection and accepts UTF-8 JSON with or without a BOM.

## Accepted Evidence

The retained 69C section 2.1 input contains 10 requirements and 7 screenshots.
The adapted payload is 749,929 UTF-8 bytes.

- direct Form: `direct`, mapping `not-required`, validation `run-valid`, 0
  errors, and 0 warnings;
- adapted API: `adapted`, mapping `executed`, validation `run-valid`, 0 errors,
  and 3 warnings; and
- both: canonical content fingerprint
  `sha256:f21638952df9a5405196b2b797c882858fad79c8ee1e8d9d2179ef8bc868e1ad`.

Both local artifacts are 10 pages and 1,417,544 bytes. Their SHA-256 values are
different because the two requests intentionally retain different generation
identities. E.5.9 therefore makes no cross-instance byte-parity claim.

Browser QA on `/__qa/realdoc-e5-9-form-api-parity` imported the canonical Form
candidate, retained 10 requirement rows and 7 screenshot rows, submitted the
direct lane, received `run-valid` with 0 warnings, displayed the same content
fingerprint, and completed a 10-page exact Draft PDF with Download available.

## Privacy And Mutation Boundary

Public receipts and retained evidence contain fingerprints, counts, lifecycle
facts, and generated diagnostics only. Mapped business values do not return to
Editor and are not retained in the evidence fixture. Neither lane mutates the
authored Structure Definition or its Published Structure Version.

## Explicitly Not Changed

- no durable protected generation reconstruction or restart acceptance;
- no default route mount, user authorization, tenancy, hosted provider,
  deployment, retention, cost, or production activation;
- no SQLite scheduler optimization or new 240-page scale result;
- no complete Module 2 expansion; and
- no complete 200-page generation run.

## Risks

The direct Form candidate is canonical-shaped caller input, not authoritative
canonical identity. Any future Form control or field type must continue to be
derived from the exact Core projection and pass Backend validation.

Equal content fingerprints prove equal canonical content under this contract.
They do not prove equal request identity, operation history, PDF bytes, or
durable reconstruction.

## Next Phase

`PDF-EXPORT-REALDOC-E.6` owns cross-repository identity, restart, failure,
cancellation, retry, and durable lifecycle acceptance. REALDOC-F remains the
complete Module 2 expansion and REALDOC-G remains the complete 200-page run.
Production remains NO-GO.
