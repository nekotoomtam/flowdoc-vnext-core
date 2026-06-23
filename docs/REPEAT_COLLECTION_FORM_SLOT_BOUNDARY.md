# Repeat Collection Form-slot Boundary

Status: Phase 90 implementation boundary.

Phase 90 adds a pure readiness boundary for future repeat regions, collection
binding, and form slots. It makes collection-field impact visible without
materializing repeat output, adding form-slot schema, changing package versions,
or accepting collection payloads in the current scalar data snapshot.

This is a repeat / collection / form-slot boundary. It is not a repeat expansion engine.

## Purpose

The repeat/collection path now has a core-owned readiness step:

```text
canonical document + field registry + optional scalar data snapshot
  -> assessVNextRepeatCollectionFormSlotReadiness(...)
  -> collection field impact + repeat/form-slot status + issues
  -> future repeat expansion, collection binding, and form-slot design
```

The boundary exists so future collection work can be introduced deliberately
instead of making collection fields behave like scalar inline fields or hiding
repeat/form submission state inside `DocumentNode`.

## Module Ownership

`src/binding/repeatCollectionFormSlots.ts` owns:

- `VNEXT_REPEAT_COLLECTION_FORM_SLOT_SOURCE`;
- `VNEXT_REPEAT_COLLECTION_FORM_SLOT_MODE`;
- `assessVNextRepeatCollectionFormSlotReadiness(...)`;
- collection-field detection from the package field registry;
- affected inline field-ref usage facts from
  `collectVNextDocumentFieldRefUsages(...)`;
- scalar data snapshot key detection for collection fields;
- repeat-region and form-slot status surfaces, both explicitly `not-modeled`;
- application status for repeat expansion, collection binding, form-slot
  materialization, submission state, document mutation, and package version
  changes.

The module is pure TypeScript and Node-testable. It does not parse packages,
serialize packages, mutate documents, mutate field registries, expand repeat
regions, bind collection rows, create form slots, create submission state,
write storage, call routes, use DOM state, run layout, or render artifacts.

## Truth Boundary

The readiness result can carry only collection/form-slot impact metadata:

- collection fields remain registry definitions only;
- inline usage of collection fields is blocked before collection binding is
  designed;
- scalar data snapshots cannot carry collection payloads;
- repeat regions remain `not-modeled`;
- form slots remain `not-modeled`;
- submission state remains `not-run`;
- repeat expansion and collection binding remain `not-run`;
- document mutation remains `not-run`;
- packageVersionChange = `false`.

## Acceptance Evidence

Phase 90 is covered by `tests/repeatCollectionFormSlots.test.ts`:

- scalar-only packages stay ready while repeat regions and form slots remain
  explicitly not modeled;
- collection fields used inline or supplied through scalar data snapshots are
  blocked before repeat expansion;
- source guards block storage adapters, parent runtime imports, DOM access,
  app routes, package parse/serialize, transactions, operations, layout, and
  pagination;
- README, roadmap, and ledger entries keep the phase trail visible.

## Non-Goals

Phase 90 does not implement repeat region nodes, collection binding,
collection payload schema, form-slot schema, submission/reviewer workflows,
repeat expansion, collection row identity, item-level pagination policy,
data-source adapters, authored field-ref mutation, backend routes, storage
adapters, collaboration, exact layout execution, renderer adapter output,
artifact storage, package/document version changes, or package/document schema
changes.
