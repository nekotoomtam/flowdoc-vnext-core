# Structure Definition And Document Instance Architecture Lock

Status: Phase 268 architecture decision lock. This phase records product
vocabulary, lifecycle, ownership, materialization direction, and non-goals. It
does not add canonical package kinds, publish execution, instance persistence,
policy evaluation, collection expansion, or renderer behavior.

## Outcome

FlowDoc vNext authors a document structure first so external consumers can
create and use documents from an immutable published structure version. The
primary authored product artifact is a Structure Definition, not a PDF and not
an end-user Document Instance.

The retained lifecycle is:

```text
Structure Definition draft
  -> validate
  -> Published Structure Version
  -> external consumer creates a Materialized Document Instance
  -> external data arrives as an atomic Data Snapshot
  -> resolve Structure + Instance + Data + registries
  -> Resolved Document
  -> measure / paginate / render
  -> Artifact
```

Simple mapped forms and governed long-form composition use the same lifecycle.
They differ by structure policy and by how much authored content the instance
adds, not by using separate document engines.

## Canonical Vocabulary

### Structure Definition

A mutable authored structure draft. It owns the starter document graph,
composition rules, field placements, style selections, generation
placeholders, and references to the catalogs needed to validate those facts.
It may use mock preview data, but mock values are not instance data.

### Published Structure Version

An immutable accepted version of a Structure Definition. External consumers
select this exact identity and version. Later structure versions do not mutate
documents created from an earlier version. Publish workflow, authorization,
and durable version storage remain backend/product responsibilities.

### Document Instance

The actual document created from one Published Structure Version. The instance
owns its materialized authored graph, instance content, instance assets or
asset references, accepted data linkage, revision, and history-ready intent.
It retains the exact published structure reference that governs allowed
operations.

### Data Snapshot

An atomic set of external values accepted for one instance/generation context.
It is validated against pinned field expectations and remains separate from
authored nodes. Field definitions, placements, and values are independent
truths. Upstream business payloads may require an adapter before they become a
canonical Data Snapshot.

### Resolved Document

A derived projection produced from the published structure contract, the
materialized instance, accepted data, and retained registries. Field values,
generated entries, repeat output, and page-dependent facts may appear in this
projection without becoming authored instance nodes.

### Artifact

PDF, DOCX, preview, or other generated output. An artifact is downstream
evidence and never replaces Structure Definition, Document Instance, Data
Snapshot, selection, history, or measured source facts.

## Materialized Instance Direction

Creating a Document Instance materializes the Published Structure Version's
starter graph once. Normal open, edit, resolve, render, and export paths do not
rematerialize that starter graph.

Materialization is retained because operations, selection identity, history,
offline/package inspection, and migration can target an actual graph rather
than a virtual overlay. The materialized graph does not detach from governance:
every instance operation remains constrained by the pinned structure version.

Generated TOC entries, page numbers, repeated collection output, and measured
layout fragments are not materialized as authored nodes. Shared media bytes,
field catalogs, style catalogs, and policy definitions may remain referenced or
pinned rather than copied as mutable instance content. Exact portable-package
embedding and backend deduplication remain later storage decisions.

Migration to a later Published Structure Version is explicit. It creates a
validated revision or replacement snapshot through a named migration path; it
is not a live structure update and does not silently rebase instance edits.

## Structure Policy Direction

Core node-family capability states what the engine can do. Structure policy
states the subset an author permits in a specific container or context.
Session permission states the subset the current actor may invoke.

```text
effective command surface
  = core node capability
  intersect structure policy
  intersect session permission
```

Structure policy may eventually constrain allowed child types, cardinality,
insert/delete/duplicate/reorder, content editing, field placement, media use,
style keys, and local overrides. Phase 268 does not select the canonical policy
shape, inheritance rule, or operation evaluator.

Fixed, generated, constrained, and open composition are not four global
document kinds. They are behaviors a Structure Definition may combine across
different regions of one document.

## Data And Resolution Boundary

Structure stores how and where data is used. A generation-facing API supplies
actual values as one accepted snapshot or an immutable snapshot reference. It
does not need to resend the published structure, field definitions, style
catalog, or persisted instance graph with every request.

Authoring mutations remain bounded revisioned commands. They do not resend the
whole document on every keystroke. Backend transport checks base revision and
published-structure compatibility before invoking retained core semantics.

The resolution direction is:

```text
Published Structure Version
  + Materialized Document Instance
  + Data Snapshot
  + Field / Style / Media registries
  -> Resolved Document
```

The resolver must be deterministic for pinned inputs. Renderer and paginator
consume resolved/measured facts; they do not enforce authoring policy or fetch
changing field values during layout.

## Product And Repository Ownership

### Structure Authoring Product

The current product editor authors Structure Definitions. It may preview with
mock data, but its primary saved/published output is a structure contract. A
future Document Composer is an external consumer of a Published Structure
Version, even if it reuses canvas and outline components.

### Core

Core owns canonical semantic schemas, reference validation, pure policy facts,
materialization planning/transformation, operation semantics, resolution
contracts, pagination/export contracts, and history-ready records. Core does
not own HTTP, React/DOM state, concrete storage, authorization, or artifact
bytes.

### Backend

Backend owns publish and instance APIs, immutable version persistence,
revision/idempotency gates, concrete materialization persistence, accepted data
snapshots, catalog retrieval, storage optimization, and artifact orchestration.

### External Consumer

An external application, API client, or future Document Composer selects a
Published Structure Version, creates or opens an instance, supplies data, and
invokes only operations allowed by product permission and structure policy.

## Acceptance Pressure

Architecture and later implementation must cover at least these cases without
adding a renderer or node vocabulary per document type:

1. A mapped invoice or shipping form with a mostly fixed starter graph and
   external scalar/image values.
2. A general report with an open body that permits authored text, tables,
   columns, and media.
3. A governed operation guide with required front matter, configurable ordered
   content, generated TOC/list-of-figures output, and constrained image/layout
   presets.

Legacy SRS and operation-guide generators are requirement evidence only. Their
untyped JSON shapes, PDF drawing helpers, network calls, storage behavior, and
layout loops do not become canonical vNext contracts.

Legacy evidence classification:

- `KEEP_REQUIREMENT`: mixed fixed, generated, bound, and authored regions;
- `KEEP_REQUIREMENT`: ordered nested content, separate field values, media
  references, TOC, and long-document pagination;
- `KEEP_CONTRACT`: structure plus instance plus external data resolves to one
  renderable graph;
- `AVOID_PATTERN`: one runtime function owning data interpretation, network
  access, persistence, pagination, drawing, and artifact delivery;
- `DEFER`: editable repeat instances, compliance profiles, approval workflow,
  and cross-document evidence graphs.

## Future Extension Pressure

Governance systems such as quality/process profiles may later define semantic
requirements above Structure Definitions. Phase 268 preserves stable semantic
identity, versioned references, extensible metadata, relationship direction,
and structured diagnostics as future pressure only. It does not add a
compliance engine, standards-specific node types, assessment workflow, or
evidence registry.

## Non-Goals

- no new package/document version or parser acceptance;
- no Structure Definition or Document Instance schema implementation;
- no publish, materialize, migrate, or resolve runtime execution;
- no policy registry, inheritance, or permission evaluator;
- no backend route, storage table, or artifact job change;
- no editor mode, canvas, outline, selection, or preview change;
- no collection/repeat materialization;
- no CMMI, ISO, compliance, approval, or evidence implementation;
- no legacy shape adapter or copied PDF generator;
- no claim that every visual publishing, spreadsheet, CAD, or free-canvas
  document belongs to the structured business-document target.

## PASS

- The product north star is Structure Definition authoring for external use.
- Structure, published version, instance, data, resolved projection, and
  artifact have distinct names and owners.
- Materialization occurs once at instance creation and retains governance.
- Simple mapped forms and governed reports share one downstream graph pipeline.
- Legacy and compliance examples constrain architecture without entering the
  current canonical schema.

## FAIL / BLOCKER

- Package 3/document 4 still has one `kind: "document"` envelope and does not
  implement the locked artifact separation.
- Canonical Structure Definition, Published Structure Version, and Document
  Instance identities are not implemented.
- Structure policy, materialization, resolved projection, and instance API
  execution remain blocked on later phases.

## RISK

- Product conversation can collapse all layers back into the word "document".
- Policy design can become an unbounded boolean matrix or ambiguous inherited
  rule set.
- Materialized starter graphs can duplicate large immutable boilerplate across
  many instances unless backend storage optimization remains transparent.
- Generated and authored nodes can be confused if resolution output is ever
  persisted as instance truth.
- A governed-report acceptance case can overfit the canonical model if treated
  as a schema template rather than requirement evidence.

## UNKNOWN

- Exact package kinds and portability/embedded-snapshot policy.
- Policy attachment, inheritance, diagnostics, and precedence shape.
- Materialized identity allocation and definition-to-instance provenance.
- Editable behavior inside future repeated collection output.
- Exact migration UX and conflict policy between published structure versions.

## Intentionally Not Changed

- package/document schemas, parsers, serializers, fixtures, and migrations;
- v4 read session, operations, capability reporting, and backend revision flow;
- text-block grammar, selection, draft, rich text, and field placement;
- pagination, renderer, export, and artifact execution;
- editor and backend repositories.

## Next Recommended Direction

Audit package 3/document 4, retained publish/data contracts, v4 operations, and
cross-repo consumers against this vocabulary. Classify each existing contract
as reusable, change-required, deferred, or rejected before selecting new
canonical package identities.
