# PDF Canonical Report Body Display List Proof

Status: PDF-PILOT-08B-R2C-L measured body display list and full Core renderer contract accepted; PDF rendering remains pending.

## Objective

R2C-L consumes the final thirteen-page R2C-J page plan and the page-specific
R2C-K static zones. It decomposes every body placement into explicit measured
paint commands, replays Table pagination at the original checkpoint/demand
boundary, projects Table renderer commands, and merges body plus static zones
into one Core measured-draw contract without relayout.

## Body Coverage

The authoritative plan contains 173 body roots and 178 placements. R2C-L
retains all of them as:

- 153 measured text entries;
- 5 fixed image entries;
- 15 prepared Table entries spanning 20 page fragments.

Text commands are split by accepted measured line and native font run. This
preserves the 114 mixed Bold overrides instead of assigning one font to a
whole line. The body produces 952 glyph runs, five image commands, 92 Table
header background fills, and 696 axis-aligned Table border strokes. All glyph
IDs are present.

## Table Replay

Table replay walks the original R2C-J document execution one transition at a
time. It recreates the spacing-adjusted family demand, uses the retained
family cursor and bounded window, and requires every replayed transition trace
and terminal checkpoint to equal the accepted R2C-J evidence. The 15 Tables
reproduce all 20 placed Table pages and five repeated header fragments.

Core Table renderer projection owns row/cell/text/border geometry. The pilot
policy applies `F3F6FA` to header and repeated-header cells, `D9E1E8` borders,
and the resolved `111827` Table text color. Zebra striping is not applied
because it is not authored in the current document contract.

One source Table cell has an intentionally empty measured line. It is retained
as `empty-measured-text-no-glyph-paint`; no fake text or glyph is emitted.
Structural page, segment, row, and cell renderer commands are likewise
retained as no-direct-paint receipts.

## Stroke-Line Contract

The existing measured-draw contract accepted filled and stroked rectangles,
but Table projection represents borders as zero-height horizontal or
zero-width vertical segments. R2C-L adds an axis-aligned `stroke-line` command
to Core and the isolated PDF pilot renderer. This preserves the Table
renderer border owner and width instead of inflating lines into rectangles.
The field is additive; contracts without line strokes retain their previous
summary and fingerprints.

## Full Renderer Handoff

The merged contract is `consumable` across thirteen Letter pages with:

- 1,771 draw commands and 1,771 paint commands;
- 978 glyph runs, including 26 static-zone runs;
- 92 fill rectangles and 696 stroke lines;
- five backend-owned PNG image assets with accessibility text;
- IBM Plex Sans Thai Regular and Bold package font assets;
- `mayRelayout: false` and zero missing glyphs.

The accepted fingerprints are:

- body display list:
  `sha256:74983f6c75fe19ab844fad974587ba90c92edc6a9cdf46676338d435df6cc7d3`;
- full measured-draw contract:
  `sha256:cbc4102ce70fe3cceaaad18618211839192177eb787adb75e4bb81224003ae42`;
- R2C-L bundle:
  `32d067a3b17e1c6598711445067877e29f0c609fe0c1d288d2d0e57871f95990`.

## Boundary

R2C-L owns body command decomposition, exact native glyph reuse, fixed-image
commands, Table pagination replay, Table renderer projection, and the merged
full-document measured-draw contract. It does not emit PDF bytes, claim visual
fidelity, alter the authored document, or conceal the open thirteen-versus-
twelve-page calibration decision.

## Reproduction

```text
npm --prefix packages/pdf-renderer-pilot run build:report-body-display-list
npm test -- --run tests/pdfRendererPilotCanonicalReportBodyDisplayList.test.ts
```

Primary retained evidence:

- `fixtures/pdf-pilot-canonical-report-body-display-list.v1.json`;
- `packages/pdf-renderer-pilot/fixtures/canonical-report-body-display-list-qa.v1.json`;
- `packages/pdf-renderer-pilot/src/canonicalReportBodyDisplayList.ts`;
- `tests/pdfRendererPilotCanonicalReportBodyDisplayList.test.ts`.

Next phase: `PDF-PILOT-08B-R2C-M` execute the isolated full renderer and verify
PDF structure. Visual comparison and the twelve-page calibration decision
remain separate acceptance work.
