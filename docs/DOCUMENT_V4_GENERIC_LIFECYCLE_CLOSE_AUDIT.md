# Document V4 Generic Lifecycle Close Audit

Status: Phase 266 core/backend/editor close audit complete.

## Outcome

Package 3/document 4 generic `node.delete`, `node.duplicate`, and
`node.reorder` behavior is covered across every currently valid block/parent
combination. Structural internals remain protected, page-break remains
body-zone-only, image reports a media operation surface, and same-index reorder
is rejected without a backend write or revision advance.

## Audited Parent Matrix

| Block | Zone | Column | Table cell |
|---|---:|---:|---:|
| `text-block` | PASS | PASS | PASS |
| `columns` | PASS | PASS | blocked by schema |
| `table` | PASS | PASS | blocked by schema |
| `toc` | PASS | PASS | PASS |
| `page-break` | body only | blocked by schema | blocked by schema |
| `divider` | PASS | PASS | PASS |
| `spacer` | PASS | PASS | PASS |
| `image` | PASS | PASS | PASS |

Each PASS cell runs delete, duplicate, and reorder from a strictly parsed
canonical package. Every accepted result is strictly revalidated, preserves
source immutability, and retains full operation/history/scope/invalidation
facts.

## Structural Target Policy

`zone`, `column`, `table-row`, and `table-cell` are internal containment nodes
for this generic lifecycle surface. Direct delete, duplicate, and reorder
requests against them return `unsupported-target`. Complete columns and table
subtrees remain valid block roots and are handled atomically.

## Zone Role Policy

Text-block lifecycle remains valid in body, header, footer, first-page-header,
and first-page-footer zones. Page-break is valid only as a direct child of a
body zone. A package that places page-break under a static zone is rejected
before operation execution.

Future insert/move operations must inspect parent and zone-role context; a
type-level block capability alone is not insertion permission.

## No-Operation Policy

Reorder requires a different valid sibling index. Same-index reorder returns
`invalid-command` with issue code `no-op-index`. The editor already suppresses
same-position drag/drop and request mapping. Backend now proves core rejection
does not persist or advance revision.

## Media Surface

Image is a media family placement, not a utility node. The v4 read projection
and editor-safe operation-surface vocabulary now report `media` while retaining
the same lifecycle capability and shared asset-reference policy.

## Cross-Repo Apply Policy

- backend checks base revision before core execution and persists only accepted
  results;
- rejected targets and no-op reorder retain the current revision;
- editor mutation requests require node capability plus backend operation-kind
  compatibility;
- duplicate selects the returned copied root;
- delete prefers the previous surviving sibling, then the next survivor;
- stale mutation responses cannot replace newer editor state.

## PASS

- All 20 valid block/parent combinations pass all three lifecycle operations.
- Static/body zone-role restrictions remain parser-enforced.
- Four internal structural families reject all generic lifecycle operations.
- Same-index reorder creates no history-ready commit or backend revision.
- Media operation-surface vocabulary is aligned across core and editor.

## FAIL / BLOCKER

- Generic lifecycle does not imply node-specific editing readiness.
- Cross-parent movement, insert operations, text editing, layout, renderer, and
  export remain outside this audit.
- Idempotent mutation receipt storage remains unavailable outside migration.

## RISK

- Future insert/move command policy can overclaim permission if it checks only
  node type rather than parent and zone role.
- Deterministic duplicate suffixes remain package-local, not collaboration-safe.
- Large subtree lifecycle cost still needs scale evidence in the readiness
  matrix.

## UNKNOWN

- Product confirmation policy for deleting or duplicating very large subtrees.
- Durable undo/recovery policy after accepted backend commits.
- Future cross-parent move semantics.

## Intentionally Not Changed

- canonical package/document schemas;
- shared field/data/asset registries;
- text-block grammar or editing transactions;
- measured pagination, renderer consumption, export, and artifacts;
- production storage, collaboration, auth, or publish workflow.

## Next Recommended Direction

Use the published node-family readiness matrix to lock text-block grammar,
inline identity, field placement, and canonical selection contracts.
