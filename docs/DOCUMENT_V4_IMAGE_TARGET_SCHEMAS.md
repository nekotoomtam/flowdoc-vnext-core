# Document v4 Image Target Schemas

Status: Phase 254 isolated target-schema implementation. No full document v4
or package v3 parser is activated.

## Outcome

Phase 254 makes the Phase 252 authored image contract executable:

- shared strict image source schemas;
- discriminated accessibility schemas;
- required positive frame and bounded normalized crop schemas;
- atomic inline-image schema;
- target Text-block v4 inline grammar containing inline-image;
- separate structural block image schema;
- pure source-reference validation against FieldRegistry v1 and
  ImageAssetRegistry v1.

The active document v3 schema does not import these target schemas.

## Shared Source

`ImageSourceV4TargetSchema` accepts exactly:

```text
asset-ref(assetId)
image-field-ref(fieldKey, optional fallbackAssetId)
```

Strict source objects reject URLs, paths, storage locators, bytes, base64 data,
and fallback URLs. Reference existence and field compatibility are validated
separately because source shape alone does not own package registries.

## Accessibility

Every placement explicitly chooses one form:

- `described` with non-empty `altText`;
- `decorative` without alt text.

Strict discriminated shapes reject ambiguous empty-alt conventions and prevent
asset-global accessibility metadata.

## Frame And Crop

Every placement stores positive width and height in `pt` or `mm`, plus `contain`
or `cover` fit. Optional crop stores normalized x/y/width/height facts.

The crop schema requires:

- x and y between 0 and 1;
- positive width and height no greater than 1;
- x + width no greater than 1;
- y + height no greater than 1.

Frame schemas reject absolute x/y coordinates, fill/stretch fit, wrapping, and
unknown properties.

## Inline Image

`InlineImageV4TargetSchema` contains one inline id, shared source,
accessibility, frame, and vertical alignment. Alignment is `baseline`, `middle`,
or `text-bottom`.

`TextBlockNodeV4TargetSchema` implements the five-form target inline grammar:

- text;
- field-ref;
- page-number;
- line-break;
- inline-image.

Target text leaves are non-empty and contain no CR/LF. Canonical empty blocks
remain `children: []`. Inline-image remains one atomic model slot by the Phase
248 grammar contract; this schema does not add DOM or transaction behavior.

## Block Image

`BlockImageNodeV4TargetSchema` has `type: image` and owns shared source,
accessibility, frame, and left/center/right structural alignment.

It does not own inline children, caption text, floating, wrapping, overlap,
absolute coordinates, or z-index. Caption remains a separate adjacent
text-block. The block image can later enter the authored structural union
without pretending to be a text editing island.

## Source-reference Validation

`validateVNextDocumentV4ImageTarget(...)` validates parsed inline and block
placements against package registries. It blocks:

- missing static asset ids;
- missing image field definitions;
- non-image fields used as image sources;
- missing fallback asset ids.

The validator is source-immutable and JSON-safe. DataSnapshot v2 resolved image
values remain Phase 253 validation responsibility.

## Active Schema Isolation

`src/schema/document.ts` remains the package v2/document v3 source of truth and
does not import this module. It continues to reject inline-image and block image
forms. A full document v4 authored union will be a separate composition phase.

## PASS

- Inline and block image forms share one source/accessibility/frame contract.
- Inline-image is executable inside target text-block grammar.
- Block image is executable as a distinct structural payload.
- Frame/crop invariants and forbidden free-positioning facts are strict.
- Source references validate against shared field and asset registries.
- Active parser and schema behavior remain unchanged.

## FAIL / BLOCKER

- Full document v4 sections/authored union are not composed yet.
- Graph containment, capabilities, operations, layout, and rendering do not
  accept target image nodes yet.
- Full package v3 parsing and migration remain blocked.

## RISK

- Phase 256 replaces reused role/style/box schemas with a strict v4-owned
  foundation before package parser composition.
- Required frames need editor resize and crop UX before product activation.
- Source validation over a flat placement list must later be integrated with
  document traversal and exact authored paths.

## UNKNOWN

- Non-destructive rotation in the first v4 authored schema.
- Block image margin/box styling beyond frame and alignment.
- Final graph parent capabilities for image under zone, column, and table cell.

## Files Changed

- `src/schema/documentV4ImageTarget.ts`;
- `src/schema/documentVersionPolicy.ts`;
- `src/index.ts`;
- `tests/documentV4ImageTarget.test.ts`;
- `tests/imageSourceContract.test.ts`;
- `tests/textBlockV1VersionMigrationDecision.test.ts`;
- `docs/DOCUMENT_V4_IMAGE_TARGET_SCHEMAS.md`;
- `docs/IMAGE_SOURCE_CONTRACT.md`;
- `docs/PACKAGE_V3_IMAGE_TARGET_SCHEMAS.md`;
- `README.md`;
- `docs/PHASE_LEDGER.md`.

## Behavior Changed

Consumers can explicitly parse target inline/block image placements and target
text-block inline grammar, then validate source references. Active package and
document parsing behavior is unchanged.

## Intentionally Not Changed

- package v2/document v3 schemas and parsers;
- full document v4 or package v3 parser;
- graph capabilities and authored operations;
- fixtures and migration;
- editor/backend integration;
- upload/storage lifecycle;
- pagination, renderer, PDF, and DOCX behavior;
- floating wrap, L-shaped flow, and absolute positioning.

## Next Recommended Direction

Phase 255 composes the complete isolated document v4 schema and containment
rules. Next combine that target with Phase 253 assets/data in a named package
v3/document v4 parser.
