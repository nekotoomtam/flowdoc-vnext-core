# PDF Canonical Report Static-Zone Handoff Proof

Status: PDF-PILOT-08B-R2C-K actual page-number expansion and page-specific
static-zone renderer handoff accepted; body display-list construction remains
blocked.

## Objective

R2C-K consumes the authoritative thirteen-page R2C-J plan. It expands the
canonical generated footer with each final page number, executes native
Rustybuzz shaping and native ICU4X segmentation for every footer instance,
places the repeated header and footer inside their authored reservations, and
passes the 26 static-zone glyph commands through the Core measured-draw
contract without renderer relayout.

## Accepted Sources

- R2C-C projection:
  `f1a756ec9d3028a0eba9cc455bec852eea16cbac9702cd825c4e29bc4113fc2c`;
- R2C-D native shaping:
  `cec16cbc479dc9964014418e5fd887d2093c74388b86239bfcfe4bd78634395f`;
- R2C-E line breaking:
  `10276a106ef11b275de4866d1597a1d6a6c19621f1fe6e41ff6bd1d9e9056c56`;
- R2C-F measured composition:
  `d23b90b440286d7e9061859b60f3a68dc317ac25138b098c5381c63e97bed108`;
- R2C-I pagination inputs:
  `53b7625803925243bbb62ca9a7afcb12257f3fd47e82deebc7de3162ae63de00`;
- R2C-J pagination execution:
  `75390eb748762fff6a6f181c5da9503208a7632b5f63d14e1f29f1bad23888c6`;
- authoritative Core page plan:
  `sha256:a8e66333fbbb7f1a7cffeafcee2379c62b64278cfc20595cd4148b8cc34146d6`.

## Generated Footer Evidence

The page-number source remains the authored `cover-footer-text-page` generated
inline. R2C-K creates one generation-owner fingerprint per closed page, then
creates a fresh Core measurement request for page numbers 1 through 13. Every
request is accepted as one 12pt line with zero missing glyphs.

The one-digit footer width is `112.32pt`; the two-digit width is `117.72pt`.
Both remain below the R2C-I four-digit capacity proof of `128.52pt`. The
manifest's 1,000-page admission ceiling therefore remains covered by the
retained capacity measurement while actual page glyphs are now known.

## Placement Policy

The handoff records placement rules instead of hiding coordinates in the
renderer:

- header horizontal alignment is start;
- footer horizontal alignment is end;
- both lines start at the top of their 24pt reservation;
- baseline offset is
  `lineHeightPt - (lineHeightPt - fontSizePt) / 2`;
- horizontal geometry comes from the Core page-plan body box;
- the renderer may not relayout.

For every page the header paint box begins at
`(56.692913pt, 51.023622pt)` and is `154.8pt x 12pt`. Footer reservation y is
`716.976378pt`; its right edge is fixed at `555.307086pt`. The 9pt caption
font and 12pt line height produce a `10.5pt` baseline offset.

## Renderer Handoff

The retained static-zone adapter plan contains thirteen Letter page boxes and
26 draw-text commands. Its measured-draw contract is `consumable` with:

- 26 glyph-run paint commands;
- 719 glyph facts;
- one registered IBM Plex Sans Thai Regular font asset;
- zero missing glyphs;
- zero images;
- `mayRelayout: false`.

This is intentionally a `page-specific-static-zones-only` handoff. It proves
that the Core renderer contract can consume the final header/footer commands;
it is not represented as a complete document display list.

## Fingerprints

- plan:
  `sha256:e2b8f5e9809964b480853b62d86cdae2b3a47c9d640e03eb6860c4eaf888bf0e`;
- raw native evidence:
  `c0a56202bf24ab69df1807b3071a1f0967027cae877f50ad42f1e833a7fbd178`;
- static-zone measured-draw contract:
  `sha256:b2b485b1d987fd779ab3802a440ba1f4cf6a6f10fd0c25db7cb5e5757d8200f4`;
- accepted R2C-K bundle:
  `11bd19f2e945b6e285678cd4a9cf07067ad07ee9f34b04c55ab09b107317dfb4`.

## Boundary

R2C-K owns actual page-number expansion, page-specific header/footer
instances, explicit static-zone placement, glyph paint commands, and the
static-zone measured-draw contract. It does not own body command decomposition,
the full-document measured-draw contract, PDF bytes, visual acceptance, or the
separate decision about recovering the twelve-page fidelity target.

## Reproduction

```text
npm --prefix packages/pdf-renderer-pilot run build:report-static-zone-handoff
npm test -- --run tests/pdfRendererPilotCanonicalReportStaticZoneHandoff.test.ts
```

Primary retained evidence:

- `fixtures/pdf-pilot-canonical-report-static-zone-handoff.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-static-zone-raw.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-static-zone-handoff-qa.v1.json`;
- `packages/pdf-renderer-pilot/src/canonicalReportStaticZoneHandoff.ts`;
- `tests/pdfRendererPilotCanonicalReportStaticZoneHandoff.test.ts`.

Next phase: `PDF-PILOT-08B-R2C-L` measured body display list and full renderer
contract merge. PDF byte generation remains after the full contract is
consumable.
