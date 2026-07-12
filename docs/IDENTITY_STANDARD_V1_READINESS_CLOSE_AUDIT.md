# Identity Standard V1 Readiness Close Audit

Status: Phase 293 core-contract close audit.

## Outcome

Identity Standard v1 is ready to serve as the identity prerequisite for Table
Definition and Resolved Row contracts. The slice separates bounded opaque
identity, structured provenance, deterministic allocation-input facts, and
batch conflict detection without allocating ids or changing existing authored
and lifecycle parsers.

This is core-contract readiness, not product identity readiness. Backend
allocation/persistence, editor display, collaboration reconciliation, and
Resolved Table execution remain outside this close.

## PASS

### Architecture And Scope

- `docs/IDENTITY_STANDARD_V1_ARCHITECTURE_LOCK.md` distinguishes authored
  local, allocated retained, and derived layout identity.
- Existing authored ids and `src/lifecycle/structureIdentity.ts` remain
  unchanged; profile adoption is opt-in through a new versioned contract.
- Core owns vocabulary, validation, canonical input facts, and audits while
  named backend/orchestration boundaries retain allocation and collision retry.

### Allocated Identity Contract

- `src/identity/identityStandardV1.ts` binds thirteen identity kinds to exact
  class, prefix, allocation owner, and uniqueness-scope profiles.
- Opaque payload syntax and bounds are validated without decoding origin facts.
- Global, document-resolution, and layout-input scopes are strict JSON-safe
  contracts with exact revision/fingerprint pins where required.
- `tests/identityStandardV1.test.ts` proves accepted resolved-row identity,
  profile mismatches, malformed payloads, Unicode origin refs, empty origin
  rejection, and unknown-field rejection.

### Allocation Input And Provenance

- `src/identity/identityAllocationInputV1.ts` canonicalizes sorted structured
  maps through JSON encoding; it does not concatenate ambiguous delimiters.
- The provenance builder retains identity, origin references, revision pins,
  and allocation-input key as separate facts.
- Unicode and delimiter-like external item keys remain provenance data and do
  not enlarge or expose the allocated id.

### Batch Conflict Audit

- `src/identity/identityBatchAuditV1.ts` returns either one complete accepted
  batch or no records.
- It blocks invalid provenance, key/origin drift, duplicate identity, one id
  mapping to conflicting provenance, cross-scope id reuse, and one canonical
  allocation input mapping to multiple ids.
- `tests/identityAllocationAuditV1.test.ts` proves order independence and every
  named blocking condition with structured record indexes.

### Table Prerequisite

- `resolved-row` reserves `rowi_` under document-resolution scope and
  resolution-orchestrator ownership.
- Phase 301 additionally reserves `nodei_` and `inli_` for source-retaining
  collection-row content materialization under the same resolution scope.
- A future collection-row origin can retain table id, row-template id, stable
  external item key, Data Snapshot revision, and Structure version pins without
  deriving row identity from array index.
- Split row fragments can retain one resolved row identity while layout owns
  fragment-local identity and source ranges.

## FAIL / BLOCKER

None for the bounded Identity Standard v1 core-contract slice.

## RISK

- Syntax validation cannot prove allocator entropy or digest quality; owning
  producers still need collision retry-or-block behavior.
- Long external keys remain bounded only by future domain contracts and can
  increase retained provenance size.
- Incremental profile adoption permits old nonblank lifecycle ids and new
  opaque-profile ids to coexist deliberately.
- Consumers that skip the batch audit could accept a syntactically valid but
  provenance-conflicting set.

## UNKNOWN

- Backend allocation algorithms, persistence indexes, and retention policy.
- Product display/search behavior for opaque ids.
- Collaboration temporary-id reconciliation.
- Final collection item-key constraints and Table row provenance requirements.

## Tests Run

- Core type-check and complete Vitest suite.
- Identity architecture, schema, allocation-input, and audit targeted suites.
- Backend and editor consumer checks after the final public-export change.

## Intentionally Not Changed

- canonical package/document schemas and authored identity rules;
- Structure lifecycle parser acceptance;
- v4 duplicate/reorder/delete allocation behavior;
- materialization identity copying;
- Columns cursors, signatures, and pagination;
- backend routes/storage and editor runtime/UI; and
- Table Definition, collection resolution, row/cell layout, or rendering.

## Next Direction

Lock Table v4 semantic architecture, then implement Table Definition and
Resolved Row contracts. Start with static and collection-backed row sources,
stable row provenance, rectangular occupancy plus `colSpan`, explicit empty
dataset policy, and row break policy before row/cell pagination.
