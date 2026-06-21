# Node Family Capability Model

Status: draft architecture reset.

This contract prevents the prototype failure mode where visual variants,
workflow states, and layout contexts became separate node types. vNext should
add node types only when relationship, containment, editing, pagination, or
export behavior is genuinely different.

## Rule

```text
Node type = structural behavior
Role/props = semantic variant
Capability = what the node can do in context
```

Do not create a new node type for every visual style, panel workflow, template
phase, or editor mode.

## Node Families

### Zone

Nodes:

- `zone`

Roles:

- `body`
- `header`
- `footer`
- `first-page-header`
- `first-page-footer`

Purpose:

- section-owned authored content regions;
- pagination/export boundary hints;
- authoring scope for body and static page content.

### Text

Nodes:

- `text-block`

Roles:

- `paragraph`
- `heading`
- `list-item`
- `caption`
- `note`
- `label`

Inline children:

- `text`
- `field-ref`
- `page-number`
- `line-break`

Purpose:

- the only authored block text surface;
- typing, split, merge, inline formatting, field insertion, heading extraction,
  list behavior, and text measurement.

Anti-pattern:

- do not add `heading-node`, `caption-node`, `label-node`, or
  `table-paragraph-node` when `text-block.role` and context capabilities can
  express the difference.

### Layout

Nodes:

- `columns`
- `column`

Purpose:

- side-by-side authored layout;
- width-share and gap policy;
- column-local block containment.

Anti-pattern:

- do not model layout columns as table rows/cells;
- do not reintroduce prototype row/stack naming as canonical API.

### Table

Nodes:

- `table`
- `table-row`
- `table-cell`

Purpose:

- grid semantics;
- row/column operations;
- repeated header policy;
- cell containment;
- table-specific pagination.

Anti-pattern:

- do not treat tables as generic layout columns;
- do not let generic node delete/reorder corrupt table grid law.

### Generated

Nodes:

- `toc`

Inline:

- `page-number`

Purpose:

- authored placeholder for generated output;
- derived entries or page values at layout/generation time.

Anti-pattern:

- do not persist generated TOC entries as authored child nodes unless a future
  materialization operation is accepted.

### Utility

Nodes:

- `page-break`
- `divider`
- `spacer`

Purpose:

- explicit pagination control;
- visible separator;
- intentional authored space.

## Containment Baseline

| Parent | Child field | Allowed children |
|---|---|---|
| `section` | `zoneIds` | `zone` |
| `zone` | `childIds` | `text-block`, `columns`, `table`, `toc`, `page-break`, `divider`, `spacer` |
| `columns` | `columnIds` | `column` |
| `column` | `childIds` | `text-block`, `table`, `divider`, `spacer` |
| `table` | `rowIds` | `table-row` |
| `table-row` | `cellIds` | `table-cell` |
| `table-cell` | `childIds` | `text-block`, `divider`, `spacer` |
| `text-block` | `children` | inline nodes only |

First-slice restrictions remain conservative:

- no nested columns inside columns;
- no columns inside table cells;
- no tables inside table cells;
- no page breaks inside columns or table cells until semantics are designed;
- no generated content as authored children.

## Capability Shape

Each node family should declare capabilities in one place:

```ts
type NodeCapability = {
  family: "zone" | "text" | "layout" | "table" | "generated" | "utility";
  canSelect: boolean;
  canEditText: boolean;
  canContainBlocks: boolean;
  canContainInline: boolean;
  canDropInside: boolean;
  canDropBeforeAfter: boolean;
  canResize: boolean;
  canSplit: boolean;
  canMerge: boolean;
  canDelete: boolean;
  canDuplicate: boolean;
  canReorder: boolean;
  operationSurface: "zone" | "block" | "text" | "layout" | "table" | "inline";
  validationScope: "node" | "parent" | "subtree" | "table" | "section" | "document";
  layoutInvalidation: "none" | "text" | "block" | "container" | "table" | "section";
};
```

Capabilities are consumed by operation planning, selection, drop targeting,
history grouping, validation, live layout invalidation, and generation layout.

## Add-Node Gate

Add a new authored node type only when all are true:

- a role or prop on an existing family cannot represent the concept;
- containment differs from existing families;
- operation behavior differs;
- pagination/export behavior differs;
- tests can prove the new behavior without parent editor runtime code.

If only the label, visual style, toolbar mode, or property panel changes, use a
role, prop, style, or capability instead.
