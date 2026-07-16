# PDF Report Fidelity Pilot

Status: PDF-PILOT-01 font bake-off evidence accepted.

Umbrella work item: `PDF-PILOT-INV-9437125258`.

## Objective

Produce a searchable Thai PDF from FlowDoc-owned document and measured-layout
facts, without using Word or DOCX as a runtime renderer. The target is the
12-page OCR benchmark report identified by the pinned external reference
artifact in `fixtures/pdf-report-font-bakeoff-corpus.v1.json`.

This is a bounded fidelity pilot. It does not claim a production PDF renderer.

## Pilot Acceptance Target

- input is a canonical FlowDoc fixture rather than imported DOCX;
- target page size is US Letter, `612 x 792 pt`;
- target page count is 12, with deviations treated as explicit QA failures;
- Thai text remains searchable, selectable, and copyable;
- font bytes embedded in output come only from registered redistributable
  assets;
- tables, five pinned PNG assets, callouts, headers, footers, and page numbers
  render without clipping or overlap;
- the same document, renderer profile, measurement profile, font hashes, and
  source assets produce deterministic artifact identity;
- visual similarity is required, but pixel identity with the Word-produced
  reference is not.

Bookmarks, external links, DOCX output, export UI, backend routes, production
storage, auth/authz, and worker lifecycle integration are outside this pilot.

## PDF-PILOT-01 Scope

Phase 01 pins the reference artifact and source-image hashes, defines six
report-derived Thai/mixed-script samples, and compares these registered font
pairs through the package-local native Rustybuzz path:

- IBM Plex Sans Thai Regular/Bold;
- Sarabun Regular/Bold;
- Noto Sans Thai Regular/Bold;
- local Tahoma Regular/Bold as an external metric and visual reference only.

Tahoma bytes are not copied, retained, packaged, or referenced through a
repository path. The retained summary stores only its local SHA-256 identity
and normalized measurement results.

## Evidence Result

The retained summary is:

```text
packages/text-engine-rust-wasm/fixtures/pdf-report-font-bakeoff-summary.v1.json
```

The decision is:

```text
fixtures/pdf-report-font-bakeoff-decision.v1.json
```

Measured facts:

- all three comparison families cover all six samples with zero missing
  glyphs;
- Sarabun is the only same-token drop-in family under the accepted combined
  advance thresholds;
- IBM Plex Sans Thai is the Regular/body metric leader at `1.0237%` mean and
  `2.0742%` maximum absolute advance delta from local Tahoma;
- IBM Plex Bold is narrower and needs a separate initial scale calibration of
  `1.092188` before renderer-backed line-box review;
- IBM Plex Sans Thai is accepted for this pilot because its body metrics and
  visual tone fit the intended technical report, not because it is a drop-in
  Tahoma clone.

The selection remains pilot-only. `font-assets.v1.json` active `fontAssets`
and `styleMappings` are unchanged.

## Reproduction

On a licensed Windows machine with Tahoma installed:

```text
npm --prefix packages/text-engine-rust-wasm run pdf-font-bakeoff
```

On another environment, provide external reference paths without copying the
font into the repository:

```text
FLOWDOC_PDF_REFERENCE_FONT_REGULAR=<path> \
FLOWDOC_PDF_REFERENCE_FONT_BOLD=<path> \
npm --prefix packages/text-engine-rust-wasm run pdf-font-bakeoff
```

The builder verifies registered candidate hashes, builds the existing native
Rustybuzz smoke executable, emits normalized advance summaries, and retains no
raw glyph arrays or absolute font paths.

## PASS

- The work is recorded as one dedicated PDF pilot with explicit subphases.
- Reference PDF and PNG identities are pinned without copying the external
  report into Core.
- Tahoma remains external and unredistributed.
- Rustybuzz comparison evidence is generated from report-derived text.
- IBM Plex is selected for pilot calibration with its Bold mismatch explicit.
- Active measurement identity and style mappings remain unchanged.

## FAIL / BLOCKER

None for closing PDF-PILOT-01.

Concrete PDF fidelity remains blocked until PDF-PILOT-02 extends the draw
contract with font/style/glyph and paint facts.

## RISK

- Advance compatibility does not prove ascent, descent, line-gap, wrapping,
  embedding, or text-extraction fidelity.
- Local Tahoma hashes identify this machine's reference version only.
- IBM Plex Bold requires per-style calibration and must not inherit a global
  body scale.
- Visual review used a local raster specimen and is not retained as canonical
  renderer evidence.

## UNKNOWN

- final embedded-font subset strategy;
- renderer-backed line-box deltas;
- mixed Thai/Latin extraction order in the chosen PDF implementation;
- table and heading wrap behavior after style-token calibration;
- concrete PDF package and dependency budget.

## Intentionally Not Changed

- no font candidate was promoted into active style mappings;
- no default measurer or measurement profile was replaced;
- no PDF adapter or renderer bytes changed;
- no DOCX work was introduced;
- no backend/editor route, worker, storage, or UI behavior changed;
- no package/document schema changed.

Next phase: `PDF-PILOT-02` measured PDF draw contract extension.
