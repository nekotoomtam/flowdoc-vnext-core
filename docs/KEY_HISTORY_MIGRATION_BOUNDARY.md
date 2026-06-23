# Key History Migration Boundary

Status: Phase 89 implementation boundary.

Phase 89 adds a pure key history migration plan boundary. It lets future
template management code ask how a field key rename or type change would affect
the package key registry, authored inline `field-ref` usages, and scalar data
snapshot before any mutation or storage write exists.

This is a key history migration boundary. It is not a key migration executor.

## Purpose

The key-history path now has a core-owned planning step:

```text
canonical document + field registry + optional data snapshot + migration intents
  -> createVNextKeyHistoryMigrationPlan(...)
  -> planned/blocked key events + issues + affected usage facts
  -> future app-owned migration executor and key history store
```

The boundary exists so key history can grow at the package/key registry layer
without smuggling aliases, deprecated keys, resolved data values, or migration
state into `DocumentNode` or inline `field-ref` nodes.

## Module Ownership

`src/binding/keyHistory.ts` owns:

- `VNEXT_KEY_HISTORY_SOURCE`;
- `VNEXT_KEY_HISTORY_MODE`;
- `createVNextKeyHistoryMigrationPlan(...)`;
- migration intent shapes for `field-key.rename` and `field-type.change`;
- validation for empty keys, same-key renames, missing source keys, target key
  collisions, missing type-change keys, unsupported target types, and
  non-inline type changes that would break authored field refs;
- affected inline field-ref and data-key counts;
- planned or blocked key-history events with mutation status explicitly not
  applied;
- an application summary that keeps registry mutation, document field-ref
  mutation, data migration, key-history writes, and package version changes out
  of this phase.

The module is pure TypeScript and Node-testable. It reads canonical document
field-ref usages through the existing key diagnostics collector, but it does
not parse packages, serialize packages, mutate registries, mutate authored
field refs, migrate data values, write key history, call routes, use DOM state,
run layout, or render artifacts.

## Truth Boundary

The plan can carry only migration intent and impact metadata:

- registry mutation remains `not-run`;
- document field-ref mutation remains `not-run`;
- data migration remains `not-run`;
- key-history writes remain `not-written`;
- event-level registry, document field-ref, and data changes remain
  `not-applied`;
- external API compatibility is `not-checked`;
- packageVersionChange = `false`;
- field values remain outside authored nodes;
- inline `field-ref` keys remain unchanged until a future executor phase.

## Acceptance Evidence

Phase 89 is covered by `tests/keyHistory.test.ts`:

- key rename plans report affected field refs and data keys without mutating
  document, registry, or data truth;
- colliding renames and non-inline type changes are blocked before package
  mutation;
- source guards block storage adapters, parent runtime imports, DOM access,
  app routes, package parse/serialize, text transactions, operation execution,
  layout, and pagination;
- README, roadmap, and ledger entries keep the phase trail visible.

## Non-Goals

Phase 89 does not implement key migration execution, key history persistence,
aliases, deprecated keys, external API compatibility checks, required field
policy, registry schema changes, package/document version changes, data value
migration, authored field-ref mutation, undo/redo integration, collaboration,
backend routes, storage adapters, exact layout execution, renderer adapter
output, artifact storage, or package/document schema changes.
