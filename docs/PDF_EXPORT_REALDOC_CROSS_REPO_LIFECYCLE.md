# PDF Export REALDOC Cross-Repo Lifecycle Acceptance

Status: `PDF-EXPORT-REALDOC-E.6.3` accepted for local development. Complete
REALDOC-E.6 is accepted for the optional local profile. Production remains
NO-GO.

## Decision

The 69C pre-test can now survive Backend repository reopen and browser reload
without changing the DocGen ownership model. Core remains the owner of exact
generation identity and content fingerprint semantics, Backend remains the
durable source of truth, and Editor retains only a strict content-free session
record needed to reconnect a known attempt.

No Form values, JSON payload text, canonical business data, or PDF bytes move
into browser persistence.

## Identity Chain

```text
authoring document + strict preview context + Published/Draft structure pins
  + exact Form or JSON/profile content fingerprint
  -> protected admission receipt
  -> backend-owned Document Instance id/revision
  + scoped export idempotency key
  -> durable PDF operation/lifecycle
  -> verified artifact metadata + content-addressed PDF bytes
```

Editor uses Core's compact SHA-256 fingerprint helper for exact input-content
identity. The fingerprint detects content drift but does not replace the
instance-bound canonical-input fingerprint, operation identity, or artifact
identity.

## E.6.1 Durable Admission

The optional Backend SQLite repository persists the strict protected canonical
admission. Independent-process replay returns the same sanitized receipt and
Document Instance without mapping raw JSON again. Before-commit rollback,
after-commit reconciliation, corruption rejection, and truthful durability
projection pass.

## E.6.2 Durable Operation And Artifact

The optional local composition combines durable admission, operation,
lifecycle, observability, artifact metadata, and filesystem content-addressed
bytes. Exact workflow replay recovers pending and retained `before-persist`
states. Terminal reopen returns verified metadata and PDF bytes without
rematerialization.

## E.6.3 Explicit Runtime And Editor Reconnect

The local runtime schedules a known operation when the caller creates or
exactly replays it. It performs no automatic startup scan. After browser
reload, Editor validates a strict `sessionStorage` record against the newly
loaded context and replays the same scoped export request.

The session record contains target/context pins, an input SHA-256 fingerprint,
sanitized durable receipt, operation id, and admission/export/cancel
idempotency keys only. A small target marker returns the workspace directly to
the most recent Draft or Published attempt.

If current Form/JSON content does not match the retained input fingerprint,
Editor restores status, diagnostics, and page count but marks the result stale
and exposes the retained artifact only as a read-only inspection surface.
Download remains unavailable. Imported JSON therefore remains memory-only
without making a recovered artifact look current.

Editor persists a cancel key before sending cancellation. Replaying the exact
request and cancel key after interruption returns the retained result instead
of creating a second cancellation.

## Accepted Evidence

- four durable Backend opens prove pending close, exact request replay,
  completion, verified download, pending cancellation, and cancel replay;
- another principal cannot observe the scoped operation;
- all four dispatch attempts report zero failures and automatic startup
  discovery remains false;
- the 749,929-byte adapted 69C input validates 10 requirements and 7
  screenshots with zero errors and three content-free warnings;
- the artifact is exactly 10 pages and 1,417,544 bytes;
- Editor downloads the completed artifact in the active session;
- reload returns directly to Published, displays reconnect activity, restores
  diagnostics/page count, and rejects the absent memory-only JSON as stale;
  and
- the stale result still renders retained PDF pages for visual inspection while
  Download remains unavailable; and
- desktop and 390 x 844 Preview layouts remain coherent.

Retained evidence contains fingerprints, counts, lifecycle facts, and artifact
facts only. It contains no requirement text, raw JSON, screenshot captions, or
local source paths.

## Repository Ownership

- Core owns canonical validation, compact content fingerprinting, exact
  Structure/Document Instance pins, resolution, measured composition,
  pagination, and handoff semantics.
- Backend owns trusted mapping/assets, protected admission, scoped durable
  operation/lifecycle records, explicit resume, cancellation reconciliation,
  rendering, byte verification, and artifact delivery.
- Editor owns dynamic Form/JSON pre-test interaction, target selection,
  content-free reconnect projection, diagnostics, stale-result UX, lifecycle
  commands, and download initiation.

## Explicitly Not Changed

- no default application-server mount or automatic worker discovery;
- no hosted database/object provider, production tenancy/auth policy,
  deployment, retention, SLO, or cost decision;
- no browser persistence of business content or artifact bytes;
- no SQLite scheduler optimization or new 240-page measurement;
- no REALDOC-F Module 2 expansion or REALDOC-G 200-page run; and
- no production GO decision.

## Next Decision

REALDOC-E.6 is complete for the optional local-development profile. SQLite
scale optimization, REALDOC-F, and REALDOC-G remain deferred until explicitly
resumed. Production remains NO-GO.
