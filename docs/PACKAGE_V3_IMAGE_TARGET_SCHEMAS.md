# Package v3 Image Target Schemas

Status: Phase 253 isolated target-schema implementation. The active package
v2/document v3 parser remains unchanged.

## Outcome

Phase 253 implements the package-level image contracts that do not depend on a
document v4 authored-node schema:

- strict ImageAssetRegistry v1 schemas;
- strict DataSnapshot v2 schemas with `image-asset-ref` values;
- pure field/data/asset cross-reference validation;
- public target facts and types through the core entrypoint.

This is not a complete package v3 schema or parser. Document v4 remains absent,
so no package v3 input can enter the active runtime through this phase.

## ImageAssetRegistry V1

The registry schema enforces:

- `version = 1`;
- non-empty registry keys and asset ids;
- registry key equals the nested asset id;
- `kind = image`;
- canonical media type is `image/png` or `image/jpeg`;
- positive integer byte length;
- SHA-256 digest with exactly 64 lowercase hexadecimal characters;
- positive integer intrinsic width and height in pixels;
- strict rejection of unknown properties at registry, asset, digest, and
  intrinsic-dimension levels.

Strict unknown-property rejection prevents URLs, signed URLs, storage keys,
file paths, base64 bytes, upload state, alt text, and crop facts from becoming
canonical asset manifest data.

## DataSnapshot V2

DataSnapshot v2 preserves existing scalar values and adds one strict image
value form:

```json
{
  "kind": "image-asset-ref",
  "assetId": "asset-logo"
}
```

The schema accepts string, finite number, boolean, null, or image asset ref
values. Field-aware compatibility remains a separate validation step because
the data schema alone does not own field definitions or the asset manifest.

## Cross-reference Validation

`validateVNextPackageV3ImageTarget(...)` consumes already parsed target assets,
the retained FieldRegistry v1, and optional DataSnapshot v2. It blocks:

- image values whose field definition is missing;
- image values placed under non-image fields;
- non-null scalar values placed under image fields;
- image values whose asset id is absent from the manifest.

Null remains valid for an image field. The validator is pure, JSON-safe, and
does not mutate assets, fields, or data.

This slice does not validate authored static/fallback image references because
those sources do not exist until document v4 schemas are implemented.

## Active Parser Isolation

`src/persistence/package.ts` does not import these target schemas. Its named
package v2/document v3 parser still accepts DataSnapshot v1 and has no asset
registry. Target schemas are exported for direct tests and the future named
package v3/document v4 parser only.

Package reads do not probe, normalize, or upgrade target shapes. Existing v2
serializers retain their current behavior and must not be used on package v3.

## PASS

- Manifest structure and storage-boundary exclusions are executable.
- Image data has a typed asset reference instead of a URL-like string.
- Field/data/asset mismatches block with stable JSON-safe issue codes.
- Active parser behavior and fixtures remain unchanged.
- Target modules remain DOM, storage, route, layout, and renderer independent.

## FAIL / BLOCKER

- A full package v3 parser is blocked until document v4 schema exists.
- Authored inline/block source references cannot be package-validated yet.
- Migration and downstream consumers remain blocked.

## RISK

- Field Registry v1 lives in the active package module; later schema extraction
  may be useful if target package composition grows.
- DataSnapshot v2 structurally accepts scalar values without field-aware scalar
  type enforcement; retained diagnostics still own that wider policy.
- Strict manifests require backend upload canonicalization before registration.

## UNKNOWN

- Whether target package composition should extract shared field schemas into a
  version-neutral module.
- Upload limits, color normalization, and portable bundle layout.
- Collection value representation after the image slice.

## Files Changed

- `src/schema/imageAssetRegistry.ts`;
- `src/persistence/packageV3ImageTarget.ts`;
- `src/schema/documentVersionPolicy.ts`;
- `src/index.ts`;
- `tests/packageV3ImageTarget.test.ts`;
- `tests/imageSourceContract.test.ts`;
- `tests/textBlockV1VersionMigrationDecision.test.ts`;
- `docs/PACKAGE_V3_IMAGE_TARGET_SCHEMAS.md`;
- `docs/IMAGE_SOURCE_CONTRACT.md`;
- `README.md`;
- `docs/PHASE_LEDGER.md`.

## Behavior Changed

Consumers can explicitly parse target image manifest/data shapes and validate
image field values against asset identity. Active package parsing, authoring,
backend, editor, layout, and rendering behavior is unchanged.

## Intentionally Not Changed

- package v2/document v3 parser and serializer;
- package v3 envelope or parser;
- document v4 authored-node schemas;
- fixtures and stored packages;
- upload, bytes, locators, and retention;
- authored image operations or migration;
- editor/backend integration;
- pagination and renderer behavior.

## Next Recommended Direction

After Phase 255 composes the complete document v4 authored union and containment
policy, combine it with this phase in a named package v3/document v4 parser.
