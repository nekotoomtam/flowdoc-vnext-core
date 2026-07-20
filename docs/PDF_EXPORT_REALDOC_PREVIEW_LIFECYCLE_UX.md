# PDF Export REALDOC Preview Lifecycle UX

Status: `PDF-EXPORT-REALDOC-E.5.8` accepted for local development.
Production remains NO-GO.

## Decision

Draft and Published Preview now expose the complete local operation lifecycle
without moving artifact truth into Editor. Loading, admission, request,
status, cancellation, retry, terminal failure, download, and stale-result
states are projections over the accepted Backend contracts.

This phase adds no Core runtime schema or generation behavior. Core remains the
owner of exact Structure, mapping, canonical snapshot, resolution, layout, and
artifact identity semantics.

## Retry Identity

A retry after an uncertain admission response reuses the same admission
idempotency key. A retry after an uncertain PDF request reuses the same export
idempotency key. A cancellation retry reuses the same cancellation key.

A terminal cancelled or failed operation starts a new generation intent with
new admission and export keys. A status retry reads the same operation id. A
download retry reads the same completed artifact. Every returned status must
still match the admitted instance id and revision.

## Large Input Boundary

The existing adapted payload ceiling remains 1 MiB. Editor now defers the live
textarea when a payload reaches 256 KiB. The full string stays in memory for
the active pre-test session, but the default UI renders a bounded summary.
Explicit Edit opens an uncontrolled textarea and JSON parsing/diagnostics run
again only when Apply is selected.

This is interaction hardening, not a larger admission limit, durable payload
storage, streaming parser, or full-document scale result.

## Accepted Evidence

The local 69C run used the 749,929-byte adapted payload and exact mapping
profile. The default JSON surface rendered a 732 KiB summary rather than a
live controlled textarea. Mapping completed as `executed`, runtime validation
was `run-valid`, and the content-free receipt reported 0 errors and 3 warnings.

Browser QA accepted:

- context loading and unavailable/retry states;
- pending operation cancellation to `cancelled`;
- retry after cancellation;
- admission failure while Backend was stopped and recovery after restart;
- navigation across all three content-free result diagnostics;
- completed download lifecycle with a verified `application/pdf` response;
- desktop 1280 x 720 and mobile 390 x 844 layouts without incoherent overlap;
  and
- no browser warning or error logs.

The recovered exact Draft artifact was 10 pages and 1,417,544 bytes. The
verified QA response had SHA-256
`e2f2b3f5e6dd9cc28ecabb31032bb6caa0cdae8b1580baf2110f9dc9079f7713`.
This run hash is evidence for the retained QA operation, not a new cross-run
byte-determinism claim.

## Local Harness Boundary

The optional real-document Backend composition runs its evidence renderer in
the listener process. E.5.8 adds a 10-second local dispatch window so the 202
response, pending state, and cancellation command are observable before that
renderer can occupy the process. The default Backend composition and
production scheduler are unchanged.

## Explicitly Not Changed

- no Form admission or Form/API canonical parity evidence;
- no durable Draft snapshot or protected generation reconstruction;
- no arbitrary live Editor draft compiler;
- no widening of the 1 MiB adapted-payload limit;
- no SQLite scheduler optimization or new 240-page scale result;
- no complete Module 2 or 200-page export;
- no default route mount, provider, tenancy, deployment, retention, or SLO;
  and
- no production activation.

## Risks

The local dispatch window is test-harness coordination, not production worker
architecture. The same-process evidence renderer can still delay commands
after dispatch begins. E.6 must prove operation identity, restart, failure,
cancellation, and durable lifecycle behavior through the real cross-repo
composition.

The 732 KiB payload is now bounded in the normal Editor DOM, but it remains an
in-memory string and is parsed in one operation when selected or applied.
REALDOC-G still owns complete 200-page load evidence.

## Next Phase

`PDF-EXPORT-REALDOC-E.5.9` proves that generated Form input and an external
API-shaped caller converge on the same canonical result. E.6 then owns
cross-repo identity, restart, failure, and lifecycle acceptance. Production
remains NO-GO.
