# Document V4 Delete Operation

Status: Phase 263 core/backend/editor vertical slice complete.

## Outcome

Package 3/document 4 supports `node.delete` for complete block subtrees whose
root is a direct child of a zone, column, or table cell.

## Ownership Policy

Delete removes the root id from its parent child list and removes the root plus
all containment descendants from the owning section node registry. It does not
garbage-collect package fields, data values, image assets, or migration source
snapshots.

This is safe because v4 document references point from placements to package
registries. Removing a placement cannot create a missing registry reference in
remaining content. Shared assets and field definitions may remain unused.

## Rejected Targets

- zones and section-owned roots;
- column, table-row, and table-cell internals;
- missing nodes or nodes without a supported block parent;
- any result that fails complete package structure/reference validation.

## PASS

- Source packages remain immutable.
- Complete columns/table subtrees are removed atomically.
- Image placement deletion retains the shared asset registry.
- History, scope, and node-structure invalidation facts are returned.
- Backend revision and editor stale-apply gates remain active.

## FAIL / BLOCKER

- Text/image editing, measured layout, exact rendering, and export remain
  unavailable.
- Asset garbage collection and cross-parent movement remain unavailable.

## RISK

- Unused registries can accumulate until an explicit cleanup operation exists.
- Large subtree deletion needs user confirmation and durable history recovery.

## UNKNOWN

- Retention and cleanup policy for unused assets and fields.
- User-facing confirmation policy for large subtree deletion.

## Intentionally Not Changed

- field/data/asset registries;
- migration snapshots and receipts;
- active v3 delete semantics;
- measured pagination, renderer, export, and artifacts.

## Next Recommended Direction

Close-audit the generic v4 node lifecycle and build a node-family readiness
matrix before entering text-block editing semantics.
