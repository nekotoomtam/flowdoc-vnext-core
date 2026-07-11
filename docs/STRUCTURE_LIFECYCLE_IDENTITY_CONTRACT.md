# Structure Lifecycle Identity Contract

Status: Phase 270 retained core identity contract. This phase implements strict
JSON-safe identity metadata for Structure Definition drafts, Published
Structure Versions, and Materialized Document Instances. It does not activate
new package kinds, parsers, publish workflow, materialization, persistence,
policy evaluation, or instance editing.

## Outcome

The lifecycle now has independent identity facts instead of overloading one
package/document id:

- `structureId` identifies one stable Structure Definition lineage;
- `draftId` and `revision` identify a mutable authoring workspace state;
- `structureVersionId` and `versionOrdinal` identify one immutable published
  version in that lineage;
- `instanceId` and `revision` identify one mutable Materialized Document
  Instance;
- `structureVersion` pins an instance to the exact Published Structure Version
  that governs it.

These identities are core-retained semantic facts. Backend remains responsible
for allocation, monotonic revision/version writes, uniqueness, persistence,
authorization, idempotency, and timestamps.

## Identity Shapes

### Structure Definition Draft

```ts
{
  contractVersion: 1,
  kind: "structure-definition-draft",
  structureId: "operation-guide",
  draftId: "operation-guide:draft-2",
  revision: 8,
  baseVersion?: {
    structureId: "operation-guide",
    structureVersionId: "operation-guide@v1",
    versionOrdinal: 1
  }
}
```

`baseVersion` is optional for a new lineage. A draft may use any retained
Published Structure Version in the same lineage as provenance; it need not use
the latest version. Publishing and migration policy later decide whether that
draft may become the next accepted version.

### Published Structure Version

```ts
{
  contractVersion: 1,
  kind: "published-structure-version",
  structureId: "operation-guide",
  structureVersionId: "operation-guide@v2",
  versionOrdinal: 2,
  sourceDraft: {
    structureId: "operation-guide",
    draftId: "operation-guide:draft-2",
    revision: 8
  }
}
```

The identity pins the exact source draft revision accepted for publication.
Immutability is a lifecycle/storage invariant; ordinary operations never change
an accepted `structureVersionId` or its source draft reference.

### Materialized Document Instance

```ts
{
  contractVersion: 1,
  kind: "document-instance",
  instanceId: "guide-project-a",
  revision: 12,
  structureVersion: {
    structureId: "operation-guide",
    structureVersionId: "operation-guide@v1",
    versionOrdinal: 1
  }
}
```

Ordinary instance mutation advances instance revision but retains the exact
`structureVersion` pin. Moving to another published version is an explicit
migration, not a normal content or structure operation.

## Identity Invariants

1. Every id is an opaque, non-blank string. Core does not derive ids from time,
   titles, labels, paths, or node content.
2. Draft and instance revisions are non-negative integers. Backend owns
   monotonic compare-and-write behavior.
3. Published version ordinals are positive integers. Ordinal is display/order
   evidence, not a substitute for `structureVersionId`.
4. Draft base and published source references must remain in the same
   `structureId` lineage.
5. An instance pin compares structure id, version id, and ordinal. Matching only
   one field is insufficient.
6. Structure, version, draft, instance, package, document-graph, node, inline,
   field, style, and asset ids are separate identity domains.
7. Current transport `documentId` may later map to `instanceId`, but it cannot
   stand in for structure lineage or published version identity.
8. Identity validation does not imply artifact availability, policy approval,
   materialization, persistence, or runtime activation.

## Public Core Contract

`src/lifecycle/structureIdentity.ts` exports:

- strict Zod schemas for all refs and identities;
- inferred JSON-safe types;
- structured safe parse and throwing parse helpers;
- clone-through-validation serialization;
- exact Published Structure Version reference comparison.

Cross-lineage draft provenance and published source references are rejected.
Unknown fields are rejected. No parser accepts a package/document graph as an
identity record.

## Package Activation Boundary

Phase 270 does not add these identities to either canonical package parser.
Package 2/document 3 remains active, and package 3/document 4 remains the
partial migration target. No existing package kind is silently reinterpreted
as a Structure Definition or Document Instance.

A later package identity/schema decision must choose:

- artifact-specific package kinds or envelopes;
- graph id mapping to `structureId` or `instanceId`;
- portable embedded snapshots versus immutable references;
- field/style/media pin ownership;
- explicit migrations from accepted canonical package pairs.

## Cross-Repo Direction

- Core validates identity facts and later owns pure lifecycle compatibility.
- Backend allocates ids/ordinals/revisions and persists immutable published
  versions plus mutable instance records behind revision/idempotency gates.
- Editor consumes structure draft identity through `coreAdapter.ts` and must not
  allocate published or instance identity as authoritative product state.
- External consumers select a complete Published Structure Version reference,
  not a title, ordinal, or latest-version alias during deterministic creation.

## PASS

- Draft, published version, and instance identities are strict and JSON-safe.
- Same-lineage provenance is validated.
- Instance structure pins compare all identity fields.
- Current packages remain unchanged and un-reinterpreted.

## FAIL / BLOCKER

- No package carries these identities yet.
- No publish, materialization, instance mutation policy, persistence, or API
  execution uses the contract yet.
- Node provenance and materialized graph identity remain undefined.

## RISK

- Backend may allocate globally ambiguous ids unless uniqueness scope is stated
  with concrete storage.
- Exposing only version ordinal in product APIs can lose the immutable version
  identity pin.
- Reusing `documentId` for every artifact can collapse the new domains again.

## UNKNOWN

- Final package kinds and graph-root id mapping.
- Published version id allocation and lineage concurrency policy.
- Portable package embedding/reference strategy.
- Definition-node to instance-node provenance shape.

## Intentionally Not Changed

- package/document schemas, parsers, serializers, fixtures, and migrations;
- node graph, operations, read sessions, capability reporting, and generation;
- backend repositories, routes, storage, and revision behavior;
- editor read models, command policy, UI, and runtime behavior;
- policy, materialization, data resolution, repeat, or artifact execution.

## Next Recommended Direction

Define Structure Policy attachment and effective capability semantics using the
accepted identities. Keep core node capability, structure policy, and session
permission separate, and do not activate instance mutation before policy
preflight has a retained owner.
