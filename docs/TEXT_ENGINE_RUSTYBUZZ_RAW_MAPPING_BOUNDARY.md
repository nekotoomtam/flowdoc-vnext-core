# Text Engine Rustybuzz Raw Mapping Boundary

Status: Phase 114 rustybuzz raw mapping boundary.

Phase 114 closes the first concrete risk discovered by Phase 113: raw
rustybuzz cluster values are UTF-8 byte clusters, while FlowDoc text evidence
uses JavaScript/TypeScript UTF-16 text ranges. This phase adds a package-local
mapper that converts raw rustybuzz smoke JSON into
`VNextTextEngineAdapterEvidence` without binding production measurement.

## Evidence

- `packages/text-engine-rust-wasm/src/rustybuzzRawMapping.ts` owns the raw
  mapping responsibility separately from the mock adapter scaffold.
- `createFlowDocRustybuzzRawEvidenceMappingPlan(...)` validates request/text,
  font id, shaper revision, glyph count, UTF-8 byte length, scalar count,
  glyph ids, raw advances, raw offsets, and cluster boundaries.
- The mapper converts UTF-8 byte clusters into UTF-16 text ranges before
  constructing `clusterStartOffset` and `clusterEndOffset`.
- Raw font-unit advances and offsets are converted to point units using
  `fontSizePt / unitsPerEm`.
- `tests/textEngineRustybuzzRawMapping.test.ts` maps the Phase 113 Sarabun raw
  smoke fixture into adapter evidence and proves Phase 109 acceptance accepts
  it.

## Boundary

Allowed:

- consume raw package-local rustybuzz smoke JSON;
- map UTF-8 byte clusters to UTF-16 text ranges;
- map raw font units to point units;
- create a single-line smoke line box so Phase 109 evidence acceptance can
  validate glyph coverage;
- keep WASM digest warning visible until a real WASM artifact exists.

Blocked:

- production measurement binding;
- treating raw rustybuzz byte clusters as FlowDoc offsets directly;
- accepting clusters that do not land on UTF-8 code point boundaries;
- multi-line wrap, ICU4X line breaks, or Thai oracle comparison;
- browser/worker WASM loading;
- pagination measurer replacement.

## Result

Raw rustybuzz evidence can now cross the adapter evidence acceptance boundary
after deliberate unit conversion. The resulting evidence is still a single-line
smoke artifact: it is enough to validate glyph ids, advances, offsets, cluster
ranges, line coverage, and request/profile identity, but not enough to replace
pagination measurement.

## Non-goals

No ICU4X execution, WASM build, WASM loading, browser runtime loader,
production adapter binding, multi-line wrapping, Thai oracle comparison,
pagination draft mutation, renderer output, backend route, artifact write,
storage write, or package/document schema change is introduced in this phase.
