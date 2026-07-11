# Document v4 Target Schema And Containment

Status: Phase 255 complete isolated document target. Package v3 parsing,
migration, active graph support, and product runtime remain inactive.

## Outcome

Phase 255 composes the complete document v4 authored union from retained v3
structural node families, target Text-block v4, inline-image, and structural
block image. It adds pure structural validation for reference topology,
containment, inline identity, zone restrictions, columns, and table grids.

The active document v3 schema and graph do not import this target module.

## Authored Union

Document v4 contains twelve structural/authored node forms:

- zone;
- text-block;
- columns;
- column;
- table;
- table-row;
- table-cell;
- toc;
- page-break;
- divider;
- spacer;
- image.

Text-block v4 contains the five target inline forms from Phases 248 and 254.
Document version is exactly 4.

## Containment Matrix

| Parent | Allowed children |
|---|---|
| zone | text-block, columns, table, toc, page-break, divider, spacer, image |
| columns | column |
| column | text-block, columns, table, toc, divider, spacer, image |
| table | table-row |
| table-row | table-cell |
| table-cell | text-block, toc, divider, spacer, image |
| all leaves, including image | none |

Block image is therefore accepted in zone, column, and table-cell block flow.
It remains separate from text-block and has no authored children.

Nested columns remain canonical in v4 because current graph and measured-layout
evidence already support column-owned columns. Product insertion and direct
column selection remain separate UI decisions.

Tables and columns remain disallowed directly inside table cells. This keeps
the first v4 table layout bounded while allowing text, generated TOC, utility
blocks, and images.

## Page-break Policy

Page-break is valid only as a direct child of a body zone.

Document v3 allowed page-break under columns and table cells, but measured
pagination emits `page-break-in-columns-ignored` and
`page-break-in-table-cell-ignored`. Static-zone pagination likewise ignores a
page break. Document v4 removes those misleading accepted shapes instead of
persisting authored intent that layout cannot honor.

The active v3 policy remains unchanged for compatibility. V3-to-v4 migration
must block or request an explicit user decision when these page breaks exist;
it must not silently delete them.

## Page-number And Inline Identity

Page-number remains restricted to header, footer, first-page-header, and
first-page-footer zones. A page-number inside a body text-block blocks target
structure validation.

Inline ids must be unique within their owning text-block. The same inline id
may exist in a different text-block because inline identity is block-scoped.

## Structural Invariants

Target validation blocks:

- duplicate section ids;
- node map key/id mismatch;
- duplicate node ids across sections;
- invalid or missing zone references;
- missing children;
- invalid parent-child types;
- multiple parents;
- cycles;
- orphan nodes;
- invalid columns width-share totals;
- non-positive table column widths;
- table row cell counts that differ from table column counts;
- header row counts greater than table row counts;
- invalid page-break and page-number placement;
- duplicate inline ids.

These checks return JSON-safe issues and do not mutate the parsed document.

## Additional Audit Findings

Phase 255 found and closes three target-model gaps beyond image containment:

1. Page-break was canonical in contexts where pagination intentionally ignored
   it. V4 restricts it to direct body-zone flow.
2. The active graph checks table header count but not row cell count against
   column count. V4 target validation requires a rectangular row grid.
3. Active table column width uses a general UnitValue schema and can be
   non-positive. V4 target validation requires positive widths.

The phase also promotes duplicate section and inline-id checks into explicit
target invariants while leaving active compatibility behavior unchanged.

## Active Isolation

`DocumentNodeV4TargetSchema` and `validateVNextDocumentV4Structure(...)` are
public target contracts. They are not imported by active document parsing,
relationship graph construction, operations, backend, or editor.

No package v3 parser is created here. The next package phase must combine this
document schema with Phase 253 assets/data and package-level field/source
validation through a separately named parser.

## PASS

- Full document v4 authored and inline unions are executable.
- Image containment is explicit for zone, column, and table cell.
- Ignored page-break contexts are removed from target canonical input.
- Page-number and inline-id grammar restrictions are executable.
- Structural graph and table invariants are JSON-safe and source-immutable.
- Active package v2/document v3 behavior remains unchanged.

## FAIL / BLOCKER

- Package v3 parser and package-level source/field/asset validation remain
  uncomposed.
- Active relationship graph, operations, pagination, and renderer do not yet
  consume document v4.
- V3-to-v4 migration must define handling for newly invalid page-break and table
  shapes.

## RISK

- Phase 256 replaces reused retained schemas with a strict v4-owned foundation
  before package parser composition.
- Nested columns are canonical but product creation UX remains deferred.
- Strict rectangular tables may expose malformed v3 documents during migration.
- Flat structural validation does not yet produce the full runtime graph maps.

## UNKNOWN

- Divider and spacer product visibility/selection policy.
- Column direct-selection policy.
- Migration UX for ignored v3 page-breaks and malformed table grids.
- TOC/page-break/divider/spacer insertion ownership.

## Files Changed

- `src/schema/documentV4Target.ts`;
- `src/schema/documentV4Structure.ts`;
- `src/schema/documentVersionPolicy.ts`;
- `src/index.ts`;
- `tests/documentV4Target.test.ts`;
- `tests/imageSourceContract.test.ts`;
- `tests/textBlockV1VersionMigrationDecision.test.ts`;
- `docs/DOCUMENT_V4_TARGET_SCHEMA.md`;
- `docs/DOCUMENT_V4_IMAGE_TARGET_SCHEMAS.md`;
- `docs/IMAGE_SOURCE_CONTRACT.md`;
- `docs/PACKAGE_V3_IMAGE_TARGET_SCHEMAS.md`;
- `docs/NODE_V1_INVENTORY_AUDIT.md`;
- `README.md`;
- `docs/PHASE_LEDGER.md`.

## Behavior Changed

Consumers can explicitly parse and structurally validate complete document v4
targets. Active package parsing, graph, authoring, layout, backend, and editor
behavior is unchanged.

## Intentionally Not Changed

- active package v2/document v3 schemas and parser;
- active relationship graph and capabilities;
- package v3 parser and migration;
- fixtures and stored packages;
- authored operations and history;
- editor/backend integration;
- pagination, renderer, PDF, and DOCX behavior;
- divider/spacer/column product UI policy.

## Next Recommended Direction

Phase 256 composes the named package v3/document v4 parser and package-level
reference validation. Next implement pure v3-to-v4 migration planning and apply
boundaries while keeping active runtime/session entrypoints unchanged.
