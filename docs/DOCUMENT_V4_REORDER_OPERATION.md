# Document V4 Reorder Operation

Status: Phase 262 core/backend/editor vertical slice complete.

## Outcome

Package 3/document 4 supports one isolated mutation operation:
same-parent `node.reorder` for block children of a zone, column, or table cell.
The active v3 operation kernel remains unchanged.

## Contract

`runVNextDocumentV4Operation(...)` strictly parses the source package, clones
it, changes one existing sibling list, and strictly validates the complete
target package. It returns target ids, history policy, graph scope, and
`node-structure` render invalidation.

The operation cannot move a node across parents. Columns, rows, cells, zones,
and other internal structural nodes are rejected.

## Capability

Version capability contract v3 publishes `supportedOperationKinds` per pair.
Package 3/document 4 now reports `node.delete` and `node.reorder`; this must not
be interpreted as permission for duplicate, text, image, layout, or export
behavior.

## PASS

- Source package remains immutable.
- Full target validation runs before success.
- Backend base-revision write and editor stale-apply gates remain active.
- Editor enters `partial` mode and exposes only delete/reorder controls.

## FAIL / BLOCKER

- Remaining operations and measured layout/render/export are unavailable.
- Cross-parent movement is unavailable.

## RISK

- Pair-only mutation reporting would overclaim support; consumers must inspect
  operation kinds.
- Placeholder pagination becomes stale after reorder and is not export truth.

## UNKNOWN

- Duplicate ID allocation and shared registry reference policy.
- Final v4 active-session boundary after partial operations mature.

## Intentionally Not Changed

- v3 operations and package parsing;
- text-block grammar and image source semantics;
- measured pagination, renderer, export, and artifact production;
- cross-parent move semantics.

## Next Recommended Direction

Lock duplicate ID allocation and shared registry reference rules before adding
v4 `node.duplicate`.
