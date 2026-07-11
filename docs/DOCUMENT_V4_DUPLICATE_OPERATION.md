# Document V4 Duplicate Operation

Status: Phase 264 core/backend/editor vertical slice complete.

## Outcome

Package 3/document 4 supports `node.duplicate` for complete block subtrees whose
root is a direct child of a zone, column, or table cell.

## Identity Policy

Every authored node id and rich-inline id in the duplicated subtree receives a
new deterministic id. The first copy uses `<source>-copy`; later copies use
`<source>-copy-2`, `<source>-copy-3`, and so on. Node and inline identities are
allocated from one package-wide used-id set.

Containment references inside the copied subtree are rewritten to the new ids.
The source package remains immutable.

## Shared References

Field keys, data keys, image asset ids, image field keys, fallback asset ids,
and package registries remain shared. Duplicate creates a new placement and
content identity; it does not clone registry definitions or asset bytes.

## Placement

The duplicated root is inserted immediately after the source in the same
parent child list. Cross-parent placement is outside this operation.

## Rejected Targets

- zones and section-owned roots;
- column, table-row, and table-cell internals;
- missing nodes or nodes without a supported block parent;
- any result that fails complete package structure/reference validation.

## PASS

- Complete columns and table subtrees are copied atomically.
- Text-block node and inline identities are rewritten.
- Image placements retain shared asset and field references.
- Repeated duplicate requests allocate deterministic collision-free ids.
- History, scope, and node-structure invalidation facts are returned.
- Backend revision and editor stale-apply gates remain active.

## FAIL / BLOCKER

- Text/image editing, measured pagination, exact rendering, and export remain
  unavailable for v4.
- Cross-parent movement and registry cloning remain unavailable.

## RISK

- Large subtree copies can increase package size quickly.
- Deterministic suffixes are package-local and are not a collaboration id
  strategy.

## UNKNOWN

- User-facing copy naming and confirmation policy for large subtrees.
- Future collaboration-safe identity allocation.

## Intentionally Not Changed

- field/data/asset registries and asset bytes;
- migration snapshots and receipts;
- active v3 duplicate semantics;
- measured pagination, renderer, export, and artifacts.

## Next Recommended Direction

Close-audit the generic v4 node lifecycle and build a node-family readiness
matrix before entering text-block editing semantics.
