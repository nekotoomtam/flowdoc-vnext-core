# PDF Export Real Document Roadmap

Status: accepted local-first roadmap after `PDF-EXPORT-LOCAL-G`.
Production remains NO-GO.

## North Star

The 200-page 69C User Acceptance Record is the first full real-document target.
Work proceeds through bounded vertical slices so each new document capability
is measured against a concrete source rather than inferred in isolation.

```text
external semantic source and images
  -> source-specific adapter
  -> UAT Structure Definition plus Data Snapshot
  -> Materialized Document Instance
  -> Resolved Document
  -> measured composition and pagination
  -> LOCAL PDF artifact
  -> content, visual, resource, and restart evidence
```

The target is a semantically equivalent, editable FlowDoc-native UAT document.
Pixel-close reconstruction is not an initial acceptance requirement because
the semantic source deliberately removed page and placement geometry.

## Phase Order

### REALDOC-A Source Baseline (Accepted)

Pin the exact external PDF, semantic roots, aggregate image set, content facts,
known limitations, and section 2.1 first slice without retaining source bytes
or user-specific paths in the repository.

Exit: exact source bundle verifies against one retained fingerprint.

### REALDOC-B UAT Structure And Source Adapter (Accepted)

Define the source-neutral UAT Structure Definition and a source-specific
`uat_semantic_no_pages_v1` adapter for section 2.1. Keep the adapter outside
canonical Core semantics. Define fixed, repeated, generated, data-bound, and
instance-editable regions explicitly.

Exit: the ten requirements and seven images project into canonical pinned
inputs without content loss, invented pagination, or ambiguous asset identity.

### REALDOC-C Section 2.1 Resolution (Accepted)

Create the revision-zero instance, bind the section data snapshot, retain
source-to-instance provenance, and resolve headings, requirement rows,
screenshots, accept/remark fields, and signature regions.

Exit: one deterministic resolved document survives parse/serialize and
re-resolution without source mutation or identity drift.

### REALDOC-D Section 2.1 Measured Export (Accepted)

Measure Thai text, compose the four-column UAT table, repeat table headers,
split rows conservatively, fit images with preserved aspect ratio, paginate,
and execute the existing LOCAL export workflow.

Exit: the section remains inside the accepted local envelope and passes
content, visual, deterministic-byte, cancellation, and restart checks.

Accepted evidence is an 11-page A4 artifact with four requirement-table
pages, three repeated headers, three conservatively split rows, and seven
whole screenshot rows. Native Thai shaping/segmentation, same-process and
fresh-process byte determinism, cooperative cancellation, and visual review
all pass. The reusable composition and renderer profiles contain no 69C
content or paths.

### REALDOC-D.1 Imported Soft-Wrap Normalization (Accepted)

Classify source-PDF line endings before resolution. Fold layout-only
continuations, preserve paragraph and list-item boundaries, retain
content-free before/after fingerprints and source-line provenance, and leave
authored hard breaks plus shared renderer behavior unchanged.

Exit: requirement text reaches the measured table-cell edge instead of
retaining the source PDF line width. Exact section 2.1 now exports as 10 A4
pages with three requirement pages, two repeated headers, two split rows, and
seven whole screenshot rows. Determinism, cancellation, restart, resource,
and visual checks remain accepted.

### REALDOC-E.0 DocGen Architecture Realignment (Accepted)

Reconnect the REALDOC lane to the Phase 268 Structure Definition lifecycle.
The Editor authors and publishes reusable book-form structures. Test-data
import is a pre-test caller of the same mapping and generation contracts used
by external API clients; it is not primary Document Instance authoring.

Separate FlowDoc-owned field definitions and presentation placements from
caller-owned data JSON. Keep source adapters outside canonical Core semantics,
and keep final page geometry downstream of resolution and measurement.

Exit: the cross-repo ownership, two JSON families, field/presentation split,
pre-test parity, Document Instance role, and REALDOC-E implementation order are
locked in `docs/PDF_EXPORT_REALDOC_DOCGEN_ARCHITECTURE_LOCK.md` without runtime
changes.

### REALDOC-E.1 Published Structure Generation Input (Accepted)

Add one pure Core planning contract for the exact Published Structure Version,
generation data contract, Backend-owned instance, and caller input identity.
Direct canonical snapshots stop at `runtime-validation-required`; adapted JSON
payload descriptors plus a named-adapter or declarative mapping profile stop at
`mapping-required`.

Raw external JSON remains Backend-owned and is not retained in the Core plan.
Strict ownership, fingerprint, snapshot, field, collection, and mapping-target
drift blocks before materialization or resolution.

Exit: the UAT Structure and both generic input families produce deterministic,
content-free plans through
`docs/PDF_EXPORT_REALDOC_PUBLISHED_STRUCTURE_GENERATION_INPUT.md`. No runtime
mapping, value validation, route, preview, renderer, or artifact executes.

### REALDOC-E.2 Generation Mapping And Validation Runtime (Accepted)

Execute the E.1 direct and adapted lanes through one pure Core runtime. Adapted
UTF-8 JSON must match its admitted byte length and SHA-256, use an injected
mapper whose execution identity exactly matches the profile, and return strict
canonical snapshots before shared validation.

Validate scalar/image values, exact instance media, collection item types, and
required item fields. Apply only typed optional collection-item defaults;
unsupported published-image defaults block until static-media ownership is
bound. Diagnostics retain codes, structural paths, counts, and fingerprints,
not source values or mapper exception messages.

Exit: generic and isolated UAT named-adapter evidence proves direct/adapted
canonical snapshot equality and fingerprint parity through
`docs/PDF_EXPORT_REALDOC_GENERATION_RUNTIME.md`. Materialization, resolution,
Backend routes, Editor UI, artifacts, and production remain inactive.

### REALDOC-E.3 Bounded Local Backend DocGen Admission (Accepted)

Add one optional loopback-only Backend route for an exact Published Structure
Version plus direct canonical data or adapted UTF-8 JSON. Require credential-
derived scope, per-Structure authorization, a bounded idempotency key, a
trusted generation data contract, and an allowlisted exact mapper identity.

Backend creates the revision-0 instance and deterministic snapshot identities.
The HTTP body is capped at 2 MiB and adapted payload text at 1 MiB of UTF-8.
Trusted local asset bytes must match exact length and SHA-256 before Core E.2;
mapped media must then equal the admitted asset registry.

Exit: strict direct/adapted requests produce content-free public receipts and
protected in-memory canonical records with exact idempotency replay. The route
is absent unless explicitly mounted, existing local PDF routes stay unchanged,
and no materialization, worker, artifact, Editor UI, or production activation
occurs. Backend evidence is retained in
`../flowdoc-vnext-backend/docs/PDF_EXPORT_REALDOC_DOCGEN_HANDOFF.md`.

### REALDOC-E.4 Admitted Local Artifact Lifecycle (Accepted)

Connect the admitted request to the existing local worker and artifact
lifecycle through a protected-record-only materializer, exact downstream
identity pins, persistence, status, cancellation, and verified download.

Exit: retained 69C evidence proves direct canonical resolution, measured PDF
generation, route replay, worker completion, cancellation without stored bytes,
persistence, status, integrity check, and verified download. Default route
mounting, Editor UI, durable generation storage, and production stay inactive.

### REALDOC-E.5.0 Document Workspace Product Contract (Accepted)

Lock the local Document Library as a list of Structure authoring projects and
one shared workspace with URL-backed Design and Preview views. Preview owns
temporary generated-Form or mapped-JSON test input while Design retains
authored Structure truth. Draft and Published Preview remain distinct targets,
and every result carries explicit stale pins.

Exit: the product, route, state-ownership, generated-form, preview-target, and
staleness contracts are retained in
`../flowdoc-vnext-editor/docs/REALDOC_DOCUMENT_WORKSPACE_PRODUCT_CONTRACT.md`
without activating Editor, Backend, or Core runtime behavior.

### REALDOC-E.5.1 Local Document Library (Accepted)

Add a bounded newest-first Backend repository query and metadata-only
`GET /documents` response, then route the Editor through `/documents` into the
existing `/documents/:documentId/design` runtime. The local response declares
authorization as not configured and excludes raw packages and generated data.

Exit: ordering, pagination, invalid cursor/limit, content exclusion, strict
Editor transport, desktop/mobile layout, and Library-to-Design navigation pass.
Preview and Published state remain explicitly unavailable.

### REALDOC-E.5.2 Shared Workspace Tabs (Accepted)

Add one document-keyed Editor runtime with a shared header and URL-backed
Design/Preview tabs. Design remains mounted across view changes. Preview reports
an honest migration-required or unavailable state and performs no execution.

Exit: direct routes, invalid-view fallback, browser history, desktop/mobile
layout, console state, and Design selection retention pass without Backend or
Core runtime changes.

### REALDOC-E.5.3 Core Test-Input Projection (Accepted)

Add one pure UI-neutral Core projection from an exact Published Structure,
generation data contract, and table binding contracts. Keep one value identity
per document field key, use first-placement document order and section groups,
retain unplaced contract fields, and expose collection item and image/media
requirements.

Exit: the generic 69C Structure projects 17 document fields and 13 collection
item fields deterministically. Missing scalar requiredness, enum choices, date
format, and collection limits remain explicit metadata-unavailable facts. No
test values, Editor state, Preview execution, Backend route, or artifact runs.

### REALDOC-E.5.4 Temporary Generated Form (Accepted)

Add Editor-owned memory-only Form state over the exact E.5.3 projection. Generate
scalar, boolean, image, collection, collection-item, and unplaced controls while
preserving explicit unavailable metadata. Reset all values when projection pins
change and keep selected file bytes outside pure state.

Exit: type guards, collection absence versus included-empty, item-key uniqueness,
100-row and 10 MiB local bounds, desktop/mobile layout, normal Preview fail-closed
behavior, and empty browser console pass. No Backend or Core runtime change.

### REALDOC-E.5.5-E.5.9 Editor Pre-Test And E.6 Cross-Repo Acceptance

Add generated Form state, mapped JSON diagnostics, Published Preview, distinct
Draft Preview, complete stale/lifecycle UX, and Form/API parity evidence.
Imported business values remain separate from the authored Structure
Definition and the browser does not become a second resolver.

E.1 generation input/mapping identity, E.2 runtime mapping/validation parity,
E.3 bounded Backend local admission, E.4 local artifact lifecycle, and E.5.0
product contract, E.5.1 local Library, E.5.2 workspace tabs, E.5.3 Core
test-input projection, and E.5.4 temporary generated Form are accepted.
Remaining subphases are E.5.5 through E.5.9 Editor pre-test implementation and
E.6 cross-repo acceptance.

E.5/E.6 exit: Editor pre-test and an external API-shaped caller produce the same
accepted Data Snapshot and resolved-document identity for one exact Published
Structure Version, and the local artifact retains those pins through restart,
cancellation, retry, and verified download.

### REALDOC-F Module 2 Scale

Expand the accepted structure and adapter to all seven Module 2 sections, 69
requirements, and 41 screenshots. Introduce a separately versioned measured
resource profile only after actual facts are available; do not weaken the
LOCAL-G canonical profile.

Exit: Module 2 exports deterministically with bounded memory, time, bytes,
pagination, progress, cancellation, restart, and artifact verification.

### REALDOC-G Full 200-Page Scale

Resolve all 3 modules, 29 sections, 240 requirements, and 149 screenshots.
Add final TOC page references, page numbering, long-document scheduling,
bounded resource loading, and a full-document local qualification envelope.

Exit: the complete document exports locally without missing content, stale
resource use, unbounded work, or partial terminal evidence.

### REALDOC-H Regression And Local Readiness

Retain section 2.1, Module 2, and the full document as separate regression
levels. Verify semantic coverage, image coverage, representative visual pages,
deterministic identities, load bounds, cancellation, corruption handling, and
restart replay.

Exit: the real-document local lane has a recorded PASS/RISK/UNKNOWN review.
Production remains a separate decision.

## Repository Ownership

- Core: canonical structure/instance/data pins, resolution, measured
  composition, pagination, handoff, and receipt semantics.
- Backend: trusted source and resource resolution, digest verification, local
  operation lifecycle, persistence, cancellation, and artifact delivery.
- Editor: Structure Definition authoring, binding/presentation UX, test-data
  selection, mapping diagnostics, preview interaction, and local lifecycle
  commands without owning durable data or artifact truth.

## Deferred Production Work

Hosted providers, default route mounting, deployment, tenancy, secrets,
provider cost, SLOs, retention, backups, monitoring, rollout, and production
activation remain outside REALDOC-A through REALDOC-H. They require a separate
promotion review after the full local document lane is accepted.
