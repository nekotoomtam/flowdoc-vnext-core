# Package v3 Document v4 Parser

Status: Phase 256 complete isolated target parser. Phase 257 now supplies the
pure migration boundary; active runtime/session, backend, editor, layout, and
rendering remain on package v2/document v3.

## Outcome

Phase 256 composes a separately named package v3/document v4 boundary from:

- strict document v4 foundation and authored schemas;
- Phase 255 structural validation;
- ImageAssetRegistry v1;
- strict FieldRegistry v1 target schemas;
- optional DataSnapshot v2;
- exact authored field/image/data reference validation.

The public APIs are:

- `safeParseFlowDocPackageV3DocumentV4(...)`;
- `parseFlowDocPackageV3DocumentV4(...)`;
- `serializeFlowDocPackageV3DocumentV4(...)`;
- `validateVNextPackageV3DocumentV4References(...)`.

These APIs are target-only. No active runtime entrypoint imports them.

## Strict V4 Foundation

The package parser audit found that the first isolated document v4 composition
reused nested v3 schemas whose default Zod behavior strips unknown keys. A new
canonical parser must not accept an input by silently dropping authored facts.

Phase 256 therefore introduces strict v4-owned schemas for:

- unit values and page settings;
- text styles, roles, list metadata, and text-block props;
- box padding, borders, and fills;
- retained zone, columns, column, table, row, cell, TOC, page-break, divider,
  and spacer shapes;
- every nested props object used by those shapes.

Unknown keys now produce schema errors at package, metadata, field, document,
node, props, frame, crop, unit, and style boundaries. Missing defaults may still
be materialized explicitly by schemas; supplied unknown input is never silently
preserved or discarded.

The active v3 schema remains unchanged.

## Package Shape

The target envelope is strict:

```text
packageVersion = 3
kind = document
id = document.document.id
meta = strict package metadata
document.version = 4
assets.version = 1
fields.version = 1
data.version = 2 when data is present
```

Asset registry and DataSnapshot contracts come from Phase 253. Document and
containment contracts come from Phase 255.

FieldRegistry v1 is re-expressed as a strict target schema because the active
registry is permissive. Registry map keys must equal nested field keys. Field
keys and labels cannot be whitespace. Image and collection fields cannot use a
scalar text fallback; image fallback asset identity belongs to authored image
sources.

## Parse Stages

The named safe parser runs four ordered stages:

1. strict package/document/schema validation;
2. document v4 structural validation;
3. authored field/image and data reference validation;
4. accepted canonical package return.

Failure reasons are:

- `unsupported-version` for package/document version mismatch;
- `invalid-package` for schema or envelope failure;
- `invalid-structure` for containment/topology/table/zone failure;
- `invalid-references` for field, asset, fallback, or data incompatibility.

If structure and references both fail, `invalid-structure` is the primary
reason while the issue list retains all collected semantic failures.

The throwing parser uses `FlowDocPackageV3ParseError`. Serialization validates
through the same complete boundary before returning a JSON clone.

## Exact Reference Validation

Package-level validation traverses the parsed document and records exact paths
for:

- scalar `field-ref` usages;
- inline-image placements;
- block image placements;
- static asset ids;
- image field keys and fallback asset ids;
- DataSnapshot v2 keys and image asset values.

Scalar field-ref accepts text, number, date, boolean, and enum fields. Image and
collection fields require their dedicated placement contracts.

Data validation blocks:

- unknown data keys;
- scalar type mismatches;
- image values under non-image fields;
- scalar non-null values under image fields;
- missing image assets;
- non-null collection data before a collection value contract exists.

Reference validators remain pure and return JSON-safe issue records.

## Acceptance Fixture

`fixtures/product-report-v4-image-target.flowdoc.json` provides target evidence
with:

- package v3/document v4;
- one immutable image asset;
- scalar and image fields;
- DataSnapshot v2 scalar and image values;
- one scalar field-ref;
- one field-backed inline-image with fallback;
- one static block image;
- one header page-number.

The fixture round-trips through the named parser and serializer without source
mutation.

## Active Runtime Isolation

The active package v2 parser rejects the target fixture as
`unsupported-version`. Runtime session, editable session, generation runtime,
backend, and editor remain unwired to the target parser.

This phase does not create a union parser, auto-detect target versions in active
sessions, normalize package reads, or migrate stored records.

## Additional Audit Findings

Phase 256 closes two package-boundary gaps found during composition:

1. Nested target schemas could previously strip unknown facts. V4 now owns a
   strict independent foundation.
2. Active FieldRegistry v1 does not enforce map key equality or image fallback
   ownership. The target registry enforces both without changing v2 behavior.

## PASS

- Named package v3/document v4 parse and serialize APIs are executable.
- Strict nested schemas reject unknown input without silent loss.
- Schema, structure, and reference failures remain distinguishable.
- Exact authored image and field paths are retained in issues.
- Target fixture and serializer round-trip are source-immutable.
- Active package v2/document v3 runtime behavior remains unchanged.

## FAIL / BLOCKER

- Active runtime, backend persistence, and editor version handling do not yet
  consume package v3/document v4.
- Graph maps, operations, pagination, and renderers remain v3-only.

## RISK

- Strict target parsing may expose unknown or malformed facts in stored v3
  packages during migration.
- Returning all semantic issues can produce large diagnostics for heavily
  malformed documents; bounded transport summaries may be needed later.
- Field Registry target schemas now exist separately from active v3 schemas and
  must not drift semantically.

## UNKNOWN

- Product migration trigger and conflict UX.
- Source snapshot retention duration after migration.
- Whether target parser activation occurs per document, workspace, or release.
- Collection data value contract after the image lane.

## Files Changed

- `src/schema/documentV4Foundation.ts`;
- `src/schema/documentV4ImageTarget.ts`;
- `src/schema/documentV4Target.ts`;
- `src/schema/documentV4Structure.ts`;
- `src/persistence/packageV3.ts`;
- `src/persistence/packageV3References.ts`;
- `src/schema/documentVersionPolicy.ts`;
- `src/index.ts`;
- `fixtures/product-report-v4-image-target.flowdoc.json`;
- `tests/packageV3.test.ts`;
- related document/image/version tests and docs;
- `README.md`;
- `docs/PHASE_LEDGER.md`.

## Behavior Changed

Consumers can explicitly parse, validate, and serialize package v3/document v4
through named target APIs. No active consumer behavior changes.

## Intentionally Not Changed

- active package v2/document v3 parser and serializers;
- runtime/editable/generation session entrypoints;
- backend repository, revision, route, or storage behavior;
- editor transport, state, selection, or UI;
- v3-to-v4 migration;
- graph maps, operations, pagination, renderer, PDF, and DOCX behavior;
- upload bytes and asset resolver execution.

## Next Recommended Direction

Phase 257 implements the pure v3-to-v4 migration planner and apply boundary.
Next coordinate downstream capability reporting and backend revisioned
persistence without activating v4 in the existing runtime implicitly.
