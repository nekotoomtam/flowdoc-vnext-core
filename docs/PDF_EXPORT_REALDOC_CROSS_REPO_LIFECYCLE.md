# PDF Export REALDOC Cross-Repo Lifecycle Acceptance

Status: `PDF-EXPORT-REALDOC-E.6.2` accepted for local development.
`E.6.3` remains pending. Production remains NO-GO.

## Decision

The first E.6 boundary makes the protected Backend DocGen admission durable
without changing Core generation semantics or moving business data into
Editor. An adapted request is mapped and validated once, then only its strict
canonical record is persisted. A later Backend process can replay the same
admission receipt and Document Instance identity without rerunning the mapper
or retaining the raw JSON payload.

E.6.2 composes that admission with durable operation, lifecycle, artifact
projection, observability, and content-addressed PDF bytes. Editor reconnect
remains the final E.6 subphase.

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

## Durable Lifecycle

Backend now provides one optional local composition factory that opens five
SQLite repositories plus the existing filesystem content-addressed byte store.
It retains no in-memory repository as durable truth and deletes no durable root
on close. Recovery uses exact workflow replay across the independent stores;
it does not claim a cross-database atomic transaction.

An after-render restart defect was found and repaired. Recovery may recognize
that before-render already passed only when the durable lifecycle is exactly
`claimed` at `before-persist`, the live claim token matches, and the retained
checkpoint check matches. It then uses a revision-bound recovery check before
persistence. Normal first-attempt behavior remains unchanged.

## E.6.2 Accepted Evidence

- generic create, after-render fault, completion, and terminal verification run
  in four independent Node processes;
- the final process reads completed status, exact idempotent replay, terminal
  events, artifact metadata, and verified PDF bytes without materialization;
- another principal cannot read operation, lifecycle, persistence, or terminal
  records;
- the 749,929-byte 69C adapted input maps once and replays after reopen with
  zero mapper calls;
- the 69C lifecycle reopens pending, reopens after an injected render fault at
  `before-persist`, recovers to completion, and reopens terminal state; and
- metadata and verified download agree on 10 pages, 1,417,544 bytes, and SHA-256
  `5deed98f1d7b711dfba18e233b6b9d811ebeaf6e4474efd2f55f64ff08b60ac2`.

## Repository Ownership

- Core owns strict generation, canonical validation, content fingerprint, and
  source-neutral identity semantics. E.6.1/E.6.2 change no Core runtime schema.
- Backend owns the protected canonical record, SQLite transaction and
  integrity policy, scoped operation/lifecycle/artifact replay, byte
  verification, and the truthful durability receipt fact.
- Editor may display or project that fact, but receives no canonical business
  values and owns no durable admission record.

## Remaining E.6

`E.6.3` must prove Editor reload/reconnect, scoped status recovery, uncertain
cancel/retry reconciliation, stale-result rejection, diagnostics, and download
against the durable Backend composition.

The local composition resumes a known exact operation identity; it does not
automatically discover/start pending operations when a process opens. E.6.3
must wire the local runtime and Editor to this explicit resume boundary. Only
after E.6.3 passes may complete E.6 be marked accepted.

## Explicitly Not Changed

- no default application-server mount or production worker activation;
- no hosted database/object provider, tenancy policy, retention, deployment,
  SLO, or cost decision;
- no SQLite scheduler optimization or new 240-page measurement;
- no REALDOC-F Module 2 expansion;
- no REALDOC-G complete 200-page run; and
- no production GO decision.

## Next Phase

`PDF-EXPORT-REALDOC-E.6.3` owns durable local runtime wiring and Editor
reload/reconnect, cancel, retry, diagnostics, status, and verified-download
acceptance. Production remains NO-GO.
