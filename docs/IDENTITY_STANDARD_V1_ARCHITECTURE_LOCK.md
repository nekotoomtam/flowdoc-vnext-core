# Identity Standard V1 Architecture Lock

Status: Phase 290 architecture lock.

## Outcome

FlowDoc vNext separates identity from provenance. An identity answers which
entity a contract refers to. Structured provenance answers where a derived
entity came from. New system-allocated identities use bounded opaque values;
they do not concatenate document ids, item keys, revisions, timestamps, or
other origin facts into the id.

This lock defines the identity classes, allocation ownership, uniqueness
scopes, opacity rules, and provenance envelope required before Resolved Table
row identity is added. It does not rewrite existing authored or lifecycle ids,
choose a random-number or digest implementation, persist allocations, or
activate table resolution.

## Identity Domains

FlowDoc uses three distinct identity domains:

1. **Authored local identity** identifies canonical graph nodes and inline
   children inside their owning document or text block. Existing ids remain
   stable strings under their current schema and operation rules. Human-
   readable values remain valid.
2. **Allocated retained identity** identifies lifecycle artifacts, requests,
   jobs, artifacts, and resolved entities that must survive serialization or
   cross a repository boundary. New contracts in this domain use the v1
   opaque-id profiles.
3. **Derived layout identity** identifies reproducible fragments or attempts
   inside one pinned layout input. It is not authored identity and must never
   enter canonical document history as a node id.

Existing Structure lifecycle contracts currently accept nonblank ids. Phase
290 does not narrow those parsers or migrate stored values. A contract adopts
the opaque profile only when its own versioned schema says so.

## Opaque Identity Rule

A new v1 allocated id has a registered short prefix and an opaque bounded
payload:

```text
<prefix>_<opaque-payload>
```

- The complete id is ASCII and at most 80 characters.
- The payload is 12 to 64 URL-safe alphanumeric, underscore, or hyphen
  characters.
- Consumers may validate the registered prefix but must not decode the
  payload, infer provenance, sort by creation time, or construct related ids
  by string replacement.
- A timestamp alone is not a valid uniqueness strategy.
- Origin ids, external collection item keys, revisions, indexes, labels, and
  user data remain outside the opaque id.

Initial profiles reserve:

| Identity kind | Prefix | Class | Allocation owner | Uniqueness scope |
|---|---|---|---|---|
| Structure | `strc` | lifecycle artifact | backend lifecycle service | global |
| Structure draft | `drft` | lifecycle artifact | backend lifecycle service | global |
| Published Structure Version | `strv` | lifecycle artifact | backend lifecycle service | global |
| Document Instance | `doci` | lifecycle artifact | backend lifecycle service | global |
| Resolved row | `rowi` | resolved entity | resolution orchestrator | document resolution |
| Resolved cell | `celli` | resolved entity | resolution orchestrator | document resolution |
| Resolved group | `grpi` | resolved entity | resolution orchestrator | document resolution |
| Resolved node | `nodei` | resolved entity | resolution orchestrator | document resolution |
| Resolved inline | `inli` | resolved entity | resolution orchestrator | document resolution |
| Layout fragment | `frag` | layout fragment | layout engine | layout input |
| Request | `req` | request | boundary owner | global |
| Job | `job` | job | backend job service | global |
| Artifact | `artf` | artifact | backend artifact service | global |

Prefixes are validation hints, not provenance and not authorization facts.

## Allocation Ownership

- Core owns the versioned identity vocabulary, validation, deterministic
  allocation-input facts, and duplicate/scope audits.
- Backend owns retained lifecycle, request, job, and artifact allocation plus
  collision retry and persistence.
- The resolution orchestrator supplies resolved-entity identities before a
  retained Resolved Document crosses a boundary. Core may validate and derive
  allocation-input facts but does not use hidden process randomness.
- The layout engine may create deterministic fragment identities from one
  fully pinned layout input. Those ids are invalid outside that input scope.
- Editor may allocate temporary UI/session handles, but they do not become
  retained identities unless an owning boundary accepts and returns one.

An allocator must treat an id collision as retry-or-block. It must never merge
two entities because their ids match.

## Uniqueness Scope

Every allocated identity record states its scope explicitly:

- `global` for retained artifacts and boundary request/job identities;
- `document-resolution` for resolved rows, cells, and groups under one exact
  instance revision plus resolution pins; and
- `layout-input` for fragments under one exact measured layout input.

Duplicate checks compare ids only inside the declared scope. Scope identity is
structured metadata, not text embedded in the id. Moving an identity into a
different scope without reallocation is invalid.

## Structured Provenance

Derived identities retain a separate provenance envelope:

```text
identity
  + origin kind
  + named origin references
  + named revision/version pins
  + deterministic allocation-input key
```

The allocation-input key canonically represents those structured facts for
idempotency and replay comparison. It is not the allocated id, is not shown as
an authored node id, and may contain long or Unicode external item keys through
length-safe canonical encoding.

Domain contracts add required provenance fields. A collection-backed Resolved
Table row will require at least table id, row-template id, Data Snapshot pin,
and stable external `itemKey`. A static authored row will instead retain its
authored row origin. Layout fragments retain source identity/range and layout
input pins rather than pretending to be authored nodes.

## Determinism And Duplicate Rules

- Equivalent provenance maps produce the same allocation-input key regardless
  of object insertion order.
- Different origin facts produce different allocation-input keys without
  relying on delimiter-safe string concatenation.
- Deterministic allocation may map a canonical input key to an opaque id, but
  the algorithm and collision policy belong to the allocation owner.
- Random allocation records the same structured provenance after allocation.
- A batch containing duplicate ids in one scope blocks before persistence or
  pagination consumption.
- Reusing one id with different provenance blocks even when both records are
  otherwise valid.

## Table Readiness Consequence

Resolved Table rows must not use array index as identity. Collection ordering
may change while the external item remains the same. The future table contract
therefore carries an opaque `rowi_...` identity beside structured row origin
and uses `itemKey` as an input fact, not as the row id itself.

Repeated header fragments and split row fragments do not allocate new authored
row identities. A split row retains one resolved row identity and distinguishes
fragments through layout-scoped identity and source ranges.

## PASS Criteria

- identity, provenance, and allocation-input keys remain separate;
- new opaque ids are bounded and profile validated;
- allocation ownership and uniqueness scope are explicit;
- provenance maps are canonical and order independent;
- duplicate and cross-scope misuse block with structured diagnostics;
- existing authored/lifecycle ids remain accepted without mass migration; and
- Resolved Table row identity can be defined without index-derived ids.

## RISK

- A producer may validate syntax but still use a weak allocation algorithm;
  collision retry remains owner responsibility.
- Long external keys can enlarge provenance even though ids stay bounded.
- Adopting profiles incrementally means old and new lifecycle records coexist
  until each owning contract versions deliberately.
- Deterministic ids can leak origin correlations if an allocator exposes an
  unhashed canonical key as the payload; the opaque rule forbids that design.

## UNKNOWN

- Concrete backend random/digest implementation and entropy source.
- Persistence indexes and retention period for provenance lookup.
- Product-facing display labels for opaque identities.
- Collaboration-wide temporary-id reconciliation.

## Intentionally Not Changed

- canonical document v3 or document v4 authored id schemas;
- current Structure lifecycle identity parser behavior;
- duplicate-node allocation already owned by document operations;
- materialization graph copying and provenance;
- Columns fragment signatures or pagination cursors;
- backend/editor persistence, transport, or UI; and
- table definition, collection resolution, pagination, or rendering.

## Next Direction

Implement strict v1 allocated-identity and structured-provenance contracts,
canonical allocation-input keys, and duplicate/scope audits. Then define Table
Definition and Resolved Row contracts on that accepted identity base.
