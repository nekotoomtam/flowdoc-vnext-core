# PDF Export REALDOC Cross-Repo Lifecycle Acceptance

Status: `PDF-EXPORT-REALDOC-E.6.1` accepted for local development.
`E.6.2` and `E.6.3` remain pending. Production remains NO-GO.

## Decision

The first E.6 boundary makes the protected Backend DocGen admission durable
without changing Core generation semantics or moving business data into
Editor. An adapted request is mapped and validated once, then only its strict
canonical record is persisted. A later Backend process can replay the same
admission receipt and Document Instance identity without rerunning the mapper
or retaining the raw JSON payload.

This is durable admission acceptance, not complete durable export acceptance.
Operation, lifecycle, artifact projection, and Editor reconnect remain the
next two E.6 subphases.

## Identity Chain

The retained identity chain is:

```text
tenant + principal + caller idempotency key + strict request fingerprint
  -> admission id
  -> backend-owned Document Instance id/revision
  -> canonical input/content fingerprints
  -> protected admission record fingerprint
```

The SQLite repository does not allocate a second identity. It stores and
verifies the identity produced by the existing admission service. A replay
returns the original receipt fingerprint and instance id. A changed strict
request under the same scoped caller key remains an idempotency conflict.

## Durable Admission

Backend now provides an optional Node SQLite repository for protected local
admissions. It uses a strict table, unique scope/caller and instance keys, WAL,
and `synchronous = FULL`. Reads validate the strict record schema, recompute
record, receipt, diagnostics, canonical-input, and canonical-content
fingerprints, and cross-check indexed columns against the protected record.

The receipt reports `durablePersistence: true` only when this repository owns
the admission. The existing memory repository continues to report `false`.
Both remain local-only and report `productionBinding: false`.

## Accepted Evidence

- one independent Node process creates the adapted admission and maps once;
- after that process exits, a second process opens the same SQLite file,
  replays the same receipt and instance, and invokes the mapper zero times;
- the protected record contains canonical values but not the raw-only payload
  marker or raw payload text;
- a fault before commit rolls back fully and a later retry creates once;
- a fault after commit returns an uncertain unavailable result, then a later
  retry safely replays the committed receipt; and
- a modified record fails fingerprint verification and admission stops as
  unavailable without remapping or overwriting it.

Backend targeted acceptance passes 14 tests across admission, durable SQLite,
and admitted PDF binding. Editor contract acceptance passes 13 tests and keeps
the content-free receipt boundary while preserving the truthful durability
fact.

## Repository Ownership

- Core owns strict generation, canonical validation, content fingerprint, and
  source-neutral identity semantics. E.6.1 changes no Core runtime schema.
- Backend owns the protected canonical record, SQLite transaction and
  integrity policy, scoped replay, and the truthful durability receipt fact.
- Editor may display or project that fact, but receives no canonical business
  values and owns no durable admission record.

## Remaining E.6

`E.6.2` must compose durable admission with durable operation, lifecycle,
observability, artifact metadata, and artifact bytes, then prove restart at
each meaningful lifecycle point with exact status and verified download.

`E.6.3` must prove Editor reload/reconnect, scoped status recovery, uncertain
cancel/retry reconciliation, stale-result rejection, diagnostics, and download
against the durable Backend composition.

Only after E.6.2 and E.6.3 pass may the complete E.6 cross-repository lifecycle
be marked accepted.

## Explicitly Not Changed

- no default application-server mount or production worker activation;
- no hosted database/object provider, tenancy policy, retention, deployment,
  SLO, or cost decision;
- no SQLite scheduler optimization or new 240-page measurement;
- no REALDOC-F Module 2 expansion;
- no REALDOC-G complete 200-page run; and
- no production GO decision.

## Next Phase

`PDF-EXPORT-REALDOC-E.6.2` owns durable operation, lifecycle, artifact, and
verified-download reconstruction after restart. Production remains NO-GO.
