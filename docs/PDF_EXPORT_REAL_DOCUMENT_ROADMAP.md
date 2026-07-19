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

### REALDOC-D Section 2.1 Measured Export

Measure Thai text, compose the four-column UAT table, repeat table headers,
split rows conservatively, fit images with preserved aspect ratio, paginate,
and execute the existing LOCAL export workflow.

Exit: the section remains inside the accepted local envelope and passes
content, visual, deterministic-byte, cancellation, and restart checks.

### REALDOC-E Editor Workflow

Expose source selection/import, outline and page preview, instance edits for
Accept, Remark, approver, and date, save/reopen, eligibility, export, cancel,
retry, and verified download through the existing development-only local path.

Exit: Editor, Core, Backend, and the PDF artifact retain the same document
revision and user-visible values.

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
- Editor: import/selection experience, editable instance fields, preview,
  revision eligibility, and local export commands.

## Deferred Production Work

Hosted providers, default route mounting, deployment, tenancy, secrets,
provider cost, SLOs, retention, backups, monitoring, rollout, and production
activation remain outside REALDOC-A through REALDOC-H. They require a separate
promotion review after the full local document lane is accepted.
