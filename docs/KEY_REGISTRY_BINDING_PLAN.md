# Key Registry Binding Plan

Status: draft architecture reset.

Keys are central to the docgen product. Authors place key references in a
dynamic node-based template, and generation receives data for those keys. Key
history is important future work, but it is intentionally not part of this
first reset implementation.

## Goal

Define the vNext direction for:

- package-level key registry;
- inline field references;
- scalar data snapshots;
- binding diagnostics;
- preview/generation runtime views;
- future key history space.

## Current Baseline

`src/persistence/package.ts` already persists:

```ts
type FieldDefinition = {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "boolean" | "enum" | "image" | "collection";
  fallback?: string;
};

type FieldRegistry = {
  version: 1;
  fields: Record<string, FieldDefinition>;
};

type DataSnapshot = {
  version: 1;
  values: Record<string, string | number | boolean | null>;
};
```

`src/schema/document.ts` already models inline `field-ref` with `key`,
`label`, and `fallback`.

Phase 19 adds `src/binding/keyDataDiagnostics.ts` as the first implementation
slice for this plan. It collects authored field references, validates registry
and scalar data snapshots, and reports readiness diagnostics without
materializing bound output or mutating authored template state.

## Ownership Rules

| Data | Owner |
|---|---|
| Field key definitions | package key registry |
| Field references | authored `text-block.children` |
| Current values | data snapshot or generation request |
| Resolved display text | binding runtime view |
| Key rename/type history | future key-history layer |
| Selection/caret/IME state | frontend authoring runtime |

Field values must stay outside authored nodes. Binding may create a temporary
runtime view for preview/export, but that view must not replace the template.

## Field Reference Rules

An inline `field-ref`:

- references a registry key;
- may carry authoring label/fallback display metadata;
- does not carry registry type as local truth;
- does not carry resolved value;
- is atomic for text editing unless a future design says otherwise.

Changing a field reference key is an inline/key operation, not plain text
editing.

## Registry Validation

Validation should report:

- duplicate registry keys as errors;
- field references missing from the registry as warnings during authoring;
- inline references to non-inline field types as errors;
- invalid registry shapes as package errors;
- unused required keys as not blocking unless generation policy requires them.

Generation readiness may be stricter than authoring readiness.

## Data Validation

Scalar data snapshots or request data should validate:

- `text`: string or null;
- `number`: finite number or null;
- `date`: string or null;
- `boolean`: boolean or null;
- `enum`: configured option string or null;
- `image`: not scalar in this slice;
- `collection`: not scalar in this slice.

Missing required values should be generation warnings or blockers depending on
output policy. Invalid value types are errors.

## Binding Runtime View

```text
template document
  + key registry
  + data snapshot/request data
  -> bound runtime view
       resolved scalar field text
       validation issues
       missing value diagnostics
       unresolved field fallback text
```

The bound runtime view is derived. It is allowed to feed preview, exact layout,
and export. It must not be serialized as the authored template unless a future
explicit "materialize values" operation is accepted.

## Future Key History Space

Do not implement key history now, but avoid closing the path.

Likely future needs:

- stable key identity beyond a display label;
- key rename events;
- type-change migration events;
- aliases or deprecated keys;
- per-template key usage history;
- external API compatibility diagnostics.

Current package v2 can continue using `key` as the lookup identity. If key
history becomes a first-class layer, it should be added at the package/key
registry boundary, not inside `DocumentNode` or inline `field-ref` values.

## Deferred

- repeat regions;
- nested object binding;
- collection item identity;
- image/blob payloads;
- submission/reviewer workflows;
- actor identity;
- key history persistence.

These are higher-level product lanes. They must not be smuggled into scalar
field binding as hidden behavior.
