# Document Instance Materialization Contract

Status: Phase 272 pure core contract.

## Decision

A Materialized Document Instance is created once from one exact Published
Structure Version. Materialization copies the accepted starter document graph
into the new instance identity while retaining section, node, and inline ids
inside the new document scope. It is not an overlay and it does not continue to
follow later edits to the Structure Definition.

The backend allocates the `instanceId` and supplies a revision-zero Document
Instance identity. Core validates and plans the deterministic copy. Backend
later owns idempotency, persistence, revision advancement, and source retention.

## Required Inputs

`planVNextDocumentInstanceMaterializationV1(...)` accepts one strict request:

- an exact Published Structure Version identity;
- a backend-allocated Document Instance identity at revision `0`, pinned to
  that exact published version;
- a strict and structurally valid document v4 starter graph;
- a Structure Policy Set owned by that exact published version; and
- the new instance title.

Policy node bindings must reference nodes that exist in the starter graph.
Draft-owned policies, mismatched version pins, invalid graphs, and unknown
request properties block the plan.

## Identity And Provenance

The instance document root id becomes `instanceId`. Source timestamps are not
copied because they describe the published starter rather than creation of the
instance record. Section, node, and inline ids remain unchanged; those ids are
scoped by the new document identity and therefore remain compatible with the
published policy bindings.

The plan records explicit source-to-instance mappings for:

- the document root;
- every section;
- every authored node; and
- every inline inside a text block.

The mappings are identity evidence, not a live synchronization link. Future
migration from one published structure version to another requires a separate,
explicit contract and must not mutate this provenance silently.

## Registry Ownership

Materialization records ownership facts but does not yet copy or resolve the
registries:

| Registry or input | Owner at this boundary |
|---|---|
| field contract | Published Structure Version |
| style catalog | Published Structure Version |
| static assets | Published Structure Version |
| instance assets | Document Instance |
| Data Snapshot | instance/generation context |

Portable embedding and catalog/media collision rules belong to the next
resolved-projection phase. Instance field values must not become field
definitions.

## Explicit Non-Execution

The plan reports that persistence, revision advancement, generated expansion,
and data resolution did not run. Materialization does not:

- write storage or allocate identities;
- increment a backend revision;
- expand TOC, repeat, page-number, or other generated output;
- merge a Data Snapshot, field catalog, style catalog, or media registry;
- paginate, render, or emit an artifact; or
- migrate an existing instance to another structure version.

## Acceptance

- source request and starter graph remain immutable;
- the resulting graph is a separate JSON-safe value under the instance id;
- all structure, policy-owner, version-pin, and node-binding mismatches block;
- provenance covers every retained section, node, and inline identity; and
- execution and registry ownership remain explicit rather than inferred.
