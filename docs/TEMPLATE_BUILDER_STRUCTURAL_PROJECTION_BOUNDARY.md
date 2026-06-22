# Template Builder Structural Projection Boundary

Status: Phase 69 implementation boundary.

Phase 69 starts the Structural Runtime line by adding a shared structural
projection layer. The projection is a derived working view over canonical
`DocumentNode` v3 and `RelationshipGraph` facts. It is not a new persisted
schema and it is not a mutation authority.

## Boundary

Canonical authored state remains:

```text
DocumentNode v3
  -> section.zoneIds
  -> section.nodes
  -> childIds / columnIds / rowIds / cellIds
```

The projection is built from canonical document state plus graph facts:

```text
DocumentNode + RelationshipGraph
  -> createStructuralProjection(...)
  -> section roots
  -> node views with parent/depth/path/children/capabilities
```

## Module Owner

`src/structure/projection.ts` owns:

- `STRUCTURAL_PROJECTION_SOURCE`;
- `STRUCTURAL_PROJECTION_MODE`;
- `STRUCTURAL_PROJECTION_VERSION`;
- `createStructuralProjection(...)`;
- `StructuralProjection`;
- `StructuralProjectionSection`;
- `StructuralProjectionNode`.

The public package entrypoint exports the projection contracts through
`src/index.ts`.

## Projection Shape

Each node view carries:

- `nodeId`;
- `nodeType`;
- `sectionId`;
- `zoneId`;
- `parent`;
- `depth`;
- `path`;
- `childNodeIds`;
- `children`;
- `nearest`;
- `capabilities`.

This gives renderers, outline views, diagnostics, and future structural
operation planning a tree-shaped working view without duplicating persisted
document truth.

## Acceptance Evidence

`tests/structuralProjection.test.ts` proves:

- projection source/mode/version and document counts;
- section root order follows canonical `zoneIds`;
- node depth, parent, path, child order, nearest context, and capabilities
  align with `RelationshipGraph`;
- an injected graph can be reused without changing the projection contract;
- creating a projection does not mutate the canonical document.

## Non-Goals

Phase 69 does not implement:

- structural packet v1;
- browser runtime-store structural apply;
- add/delete/move command UI;
- outline or diagnostics UI;
- persistence;
- package/document schema changes;
- mutable projection editing;
- durable history or undo/redo changes.
