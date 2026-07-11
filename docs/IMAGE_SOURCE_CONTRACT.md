# Image Source Contract

Status: Phase 252 decision boundary. This phase does not activate package v3,
document v4, image schemas, upload execution, or rendering.

## Outcome

FlowDoc image placements reference shared immutable image assets. Canonical
package truth owns an image asset manifest; backend storage owns bytes and
physical locators. Authored nodes never persist URLs, file paths, signed URLs,
blob handles, base64 data, or raw bytes.

The manifest changes the package envelope, so the accepted target is now:

```text
FlowDocPackage.packageVersion = 3
  -> document.version = 4
  -> assets.version = 1
  -> fields.version = 1
  -> optional data.version = 2
```

Package v2/document v3 remains the active format until the target schemas and
migration gates are implemented.

## Truth Layers

| Layer | Owns | Does not own |
|---|---|---|
| Package asset manifest | immutable asset identity, digest, media type, byte length, intrinsic pixel dimensions | bytes, backend locator, upload status, alt text, crop |
| Backend asset store | canonical bytes, locator mapping, upload/transcode state, retention and garbage collection | authored placement, frame, alt text |
| Field registry | central image field identity and compatibility | current image value or placement |
| Data snapshot v2 | resolved image field value as an asset reference | uploaded bytes or authored frame |
| Authored placement | source reference, accessibility, frame, fit, crop, type-specific alignment | intrinsic asset facts or storage locator |
| Editor runtime | upload progress, local preview URL, selection, resize/crop draft | canonical bytes or persisted upload state |
| Layout/renderer | resolved dimensions, line/block geometry, fallback output | authored source mutation or byte storage |

## Asset Manifest

Package v3 adds a required asset registry, including an empty registry when a
document has no images:

```json
{
  "assets": {
    "version": 1,
    "images": {
      "asset-logo-01": {
        "id": "asset-logo-01",
        "kind": "image",
        "mediaType": "image/png",
        "byteLength": 24816,
        "digest": {
          "algorithm": "sha256",
          "value": "<64 lowercase hex characters>"
        },
        "intrinsic": {
          "widthPx": 1200,
          "heightPx": 600
        }
      }
    }
  }
}
```

Asset ids are opaque and immutable. Replacing bytes creates a new asset id.
The digest proves byte identity but is not the authored placement identity.
Core requires ids to be unique within the package; backend may deduplicate
identical bytes without changing authored references.

V1 canonical stored media types are `image/png` and `image/jpeg`. Backend may
accept other safe raster upload formats only by decoding and transcoding them
to a canonical stored form before registration. SVG, animated image behavior,
remote URL rendering, and executable image payloads are outside v1.

EXIF orientation must be applied before canonical dimensions and digest are
recorded. The manifest describes the stored canonical bytes, not the original
upload container.

## Storage And Portability

The JSON package stores the manifest but not image bytes or backend locators.
Backend retains a mapping from package/document ownership plus `assetId` and
digest to immutable bytes. Signed URLs are temporary transport facts only.

Portable bundle/export packaging may include blobs alongside the JSON manifest
later, but it must preserve the same asset ids and digests. Renderers resolve
bytes through an asset resolver contract and must verify the expected digest;
they do not fetch arbitrary authored URLs.

## Source Union

Both inline and block placements use the same discriminated source union.

Static asset usage:

```json
{
  "kind": "asset-ref",
  "assetId": "asset-logo-01"
}
```

Dynamic image-field usage:

```json
{
  "kind": "image-field-ref",
  "fieldKey": "customer.logo",
  "fallbackAssetId": "asset-logo-default"
}
```

`asset-ref` must resolve to the package image manifest. `image-field-ref` must
resolve to a central field whose type is `image`. Its optional fallback must
also resolve to the manifest. Source references do not copy field definitions,
asset metadata, URLs, or bytes into the placement.

Missing sources remain explicit unresolved diagnostics and fallback rendering;
they are never silently removed from authored content.

## Image Field Values

Field registry version 1 already includes the `image` field type and remains
unchanged. Data snapshot v1 is scalar-only, so package v3 introduces data
snapshot v2 with an image value form:

```json
{
  "kind": "image-asset-ref",
  "assetId": "asset-customer-logo-2026"
}
```

Image values must reference the package manifest. Changing a field value does
not change authored placement identity, frame, crop, accessibility, or model
offset. Collection values remain outside this image phase.

## Shared Placement Facts

Every image placement stores:

- one source union value;
- one explicit accessibility value;
- a required positive width and height frame using canonical document units;
- `fit` as `contain` or `cover`;
- optional normalized source crop rectangle with `x`, `y`, `width`, and
  `height` in the inclusive 0-to-1 coordinate space.

Accessibility is discriminated rather than inferred from an empty string:

```json
{ "kind": "described", "altText": "Customer logo" }
```

or:

```json
{ "kind": "decorative" }
```

Alt text belongs to each placement because the same asset can have different
meaning in different document contexts. It does not belong to the asset
manifest.

Frames are required for static and field-backed images. Initial insertion may
derive a frame from intrinsic dimensions, but it must serialize explicit width
and height. This keeps layout stable when a dynamic field resolves to an asset
with a different aspect ratio.

Crop belongs to the placement so one asset can be reused with different crops.
Crop and non-destructive rotation do not alter bytes. A destructive transform
or canonical re-encode creates a new immutable asset.

## Inline Image Payload

Target `inline-image` is an atomic child of one text-block:

```json
{
  "id": "inline-logo-01",
  "type": "inline-image",
  "source": { "kind": "asset-ref", "assetId": "asset-logo-01" },
  "accessibility": { "kind": "described", "altText": "Customer logo" },
  "frame": {
    "width": { "value": 12, "unit": "mm" },
    "height": { "value": 6, "unit": "mm" },
    "fit": "contain"
  },
  "verticalAlign": "baseline"
}
```

- It contributes one U+FFFC authored model slot.
- Caret positions exist only before and after it.
- It cannot split independently from its containing line.
- `verticalAlign` is `baseline`, `middle`, or `text-bottom`.
- Text styles are not copied onto it.
- It is resolved and measured before line fragmentation.

## Block Image Payload

Target block image is an authored flow node with `type: "image"`:

```json
{
  "id": "hero-image",
  "type": "image",
  "source": { "kind": "image-field-ref", "fieldKey": "report.hero" },
  "accessibility": { "kind": "decorative" },
  "props": {
    "frame": {
      "width": { "value": 160, "unit": "mm" },
      "height": { "value": 90, "unit": "mm" },
      "fit": "cover",
      "crop": { "x": 0, "y": 0.1, "width": 1, "height": 0.8 }
    },
    "align": "center"
  }
}
```

Block images participate in normal structural flow and can be placed where the
parent capability allows an image child. V1 supports `left`, `center`, and
`right` alignment without floating, overlap, absolute x/y placement, z-index,
text wrap, or L-shaped text flow.

A caption remains an adjacent text-block with `role: "caption"`; the image
node does not own nested caption text in v1.

## Resolution And Measurement

Resolution order is:

```text
authored source
  -> static asset id or image field value
  -> optional fallback asset id
  -> package asset manifest entry
  -> backend byte resolver with digest verification
  -> decoded canonical image
  -> authored frame/crop/fit
  -> measured inline line box or block geometry
  -> page fragments
```

Authored frame dimensions control layout. Intrinsic dimensions validate aspect
ratio and insertion defaults but do not resize a field-backed placement after
data resolution. Missing assets produce diagnostics and a deterministic frame-
sized placeholder; they do not collapse layout or change authored offsets.

## Upload And Mutation Lifecycle

1. Editor requests upload and holds local progress/preview state.
2. Backend validates limits and media, decodes orientation, canonicalizes
   bytes, computes digest and dimensions, and stores an immutable blob.
3. Backend returns a ready manifest entry; no pending upload entry is authored.
4. A revision-safe package operation registers the asset manifest entry.
5. A separate authored operation inserts or changes an image placement.
6. Removing a placement does not immediately delete the manifest entry or blob.
7. Manifest deletion is blocked while any placement, fallback, or data value
   references the asset.
8. Backend garbage collection follows retention/history policy after the
   manifest reference is removed.

Upload, registration, and placement may be presented as one product action,
but they retain separate failure and revision boundaries.

## Package Version Decision

Phase 251 kept package v2 provisional unless image ownership changed the
package envelope. This contract chooses a required package asset manifest and
data snapshot v2 image values. Existing package v2 serializers would discard
unknown envelope fields, so reusing package v2 would risk silent asset loss.

The target is therefore package v3/document v4. Package v2/document v3 remains
strict and unchanged. No union parser or automatic upgrade is introduced here.

## Activation Gates

Image schema implementation must not activate until:

1. package v3 schemas cover asset registry v1 and optional data snapshot v2;
2. document v4 schemas cover the complete source, accessibility, frame,
   inline-image, and block image payloads;
3. graph containment and capability policy include block image;
4. key/data diagnostics resolve image fields and manifest references;
5. text transactions and rich-inline replacement handle inline-image atomics;
6. pagination and renderer consumption accept measured image facts without
   fetching arbitrary URLs;
7. v3-to-v4 migration and downstream version reporting are implemented.

## PASS

- Asset identity, bytes, locators, field values, and placements have separate
  owners.
- Static and field-backed images share one explicit source union.
- Package v3/document v4 target versions are decided.
- Inline and block image payloads have bounded v1 semantics.
- Required frames prevent dynamic image values from changing authored geometry.
- Alt text and crop are placement-owned rather than asset-owned.
- Upload and garbage collection remain backend lifecycle concerns.

## FAIL / BLOCKER

- No image form is accepted by the active schema yet.
- Target activation remains blocked by the listed schema, operation,
  diagnostics, layout, migration, and downstream gates.

## RISK

- Package v3 broadens migration and backend storage work.
- Required frames trade automatic intrinsic resizing for stable document
  geometry; resize UX must make this understandable.
- Backend canonicalization must preserve expected visual fidelity and color.
- History/source retention can delay blob garbage collection.

## UNKNOWN

- Upload byte and pixel limits.
- Color-profile normalization policy.
- Portable bundle blob layout.
- Whether non-destructive rotation belongs in the first image schema slice.
- Product UX for unresolved dynamic images and decorative/described selection.

## Files Changed

- `src/schema/imageSourceContract.ts`;
- `src/schema/documentVersionPolicy.ts`;
- `src/index.ts`;
- `tests/imageSourceContract.test.ts`;
- `tests/textBlockV1VersionMigrationDecision.test.ts`;
- `docs/IMAGE_SOURCE_CONTRACT.md`;
- related Node/Text-block/version decision documents;
- `README.md`;
- `docs/PHASE_LEDGER.md`.

## Behavior Changed

Public JSON-safe decision facts now define target versions, asset ownership,
source/placement kinds, media policy, and lifecycle boundaries. The target
version policy now resolves to package v3/document v4.

## Intentionally Not Changed

- active package v2/document v3 schemas and parser behavior;
- fixtures and stored packages;
- image upload, byte storage, locators, or garbage collection;
- v3-to-v4 migration execution;
- authored image nodes or inline-image schema;
- field/data diagnostics runtime;
- editor/backend behavior;
- pagination, renderer, PDF, or DOCX behavior;
- floating wrap, L-shaped flow, and absolute positioning.

## Next Recommended Direction

Implement the package v3 asset-registry and data-snapshot v2 schemas as an
isolated target-version module without changing the active v2/v3 parser. Then
implement document v4 image source and placement schemas against that package
boundary.
