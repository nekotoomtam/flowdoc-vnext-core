# PDF Measured Draw Contract v1

Status: PDF-PILOT-02 measured draw contract accepted.

Umbrella work item: `PDF-PILOT-INV-9437125258`.

## Objective

Define the fail-closed handoff between FlowDoc's measured PDF adapter plan and
a future concrete PDF renderer. The contract makes every page, font, shaped
glyph run, rectangle, image, and per-page paint order explicit so a renderer
does not need to infer layout.

It does not render PDF bytes.

## Boundary

`createVNextPdfMeasuredDrawContractV1(...)` consumes:

- one ready `VNextPdfRendererAdapterPlan`;
- exact page boxes;
- registered package-font identities and SHA-256 hashes;
- backend-owned image identities, hashes, dimensions, and accessibility facts;
- explicit `glyph-run`, `fill-rect`, `stroke-rect`, and `image` commands.

A consumable result groups commands by page, sorts them by explicit paint
order, retains font and image identities, and fingerprints the complete draw
handoff. Its artifact remains `not-rendered` with null bytes and storage id.

Core does not read font files or image bytes, execute shaping, relayout the
document, write a PDF, select a renderer package, or bind production behavior.

## Fail-Closed Rules

The whole handoff is blocked, with no partial page or asset result, when:

- the source PDF adapter plan is blocked or production binding is requested;
- strict page, font, image, glyph, or paint input validation fails;
- page indexes, asset ids, command ids, or per-page paint orders conflict;
- a command leaves its declared page or changes measured source bounds;
- a source adapter command is missing an explicit paint command;
- glyph text, source operation, font, measurement profile, glyph indexes, or
  UTF-16 cluster coverage do not agree;
- an image command references an undeclared asset.

The exact-bounds rule is intentional. Clipping, fitting, and paint effects may
be expressed only through explicit paint facts; the renderer may not guess a
new layout.

## Font And Image Ownership

- Font assets are package-owned TTFs under OFL-1.1 with pinned SHA-256
  identity. A concrete renderer must subset them and emit a ToUnicode map.
- Image metadata is carried by Core, but the backend owns and supplies the
  bytes after verifying the pinned digest.
- The selected IBM Plex Sans Thai profile remains pilot-only. This contract
  does not promote it into active style mappings.

## Evidence

- implementation: `src/renderer/pdfMeasuredDrawContractV1.ts`;
- public export: `src/index.ts`;
- representative Thai/font/image/paint fixture:
  `fixtures/pdf-pilot-measured-draw-contract.v1.json`;
- behavior and boundary tests: `tests/pdfMeasuredDrawContractV1.test.ts`.

## PASS

- The renderer handoff now represents text, fills, strokes, and images without
  losing measured source geometry.
- Embedded-font identity, glyph facts, UTF-16 coverage, subset embedding, and
  ToUnicode requirements are explicit.
- Paint order and deterministic handoff identity are explicit.
- Invalid input blocks the entire result without partial output.

## FAIL / BLOCKER

None for closing PDF-PILOT-02.

Concrete PDF output remains blocked until an isolated renderer proof consumes
this contract and demonstrates embedded Thai text and extraction behavior.

## RISK

- Contract validity does not prove that a PDF library preserves glyph
  placement, clipping, transparency, or extraction order.
- The pilot fixture covers one representative page, not the full 12-page
  report composition.
- IBM Plex Bold still requires renderer-backed line-box calibration.

## UNKNOWN

- concrete PDF implementation and dependency budget;
- exact subset-font and ToUnicode behavior of that implementation;
- Thai/Latin copy order and visual output under a real PDF consumer;
- renderer handling of all five pinned report images.

## Intentionally Not Changed

- no PDF bytes, storage records, routes, workers, or production bindings;
- no pagination, shaping, package, document, or active font-profile changes;
- no editor, backend, DOCX, bookmark, or external-link behavior.

Next phase: `PDF-PILOT-03` Thai embedded-font one-page renderer proof.
