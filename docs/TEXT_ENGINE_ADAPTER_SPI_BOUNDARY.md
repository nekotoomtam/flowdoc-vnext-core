# Text Engine Adapter SPI Boundary

Status: Phase 108 adapter SPI boundary.

Phase 108 defines the service-provider interface between vNext core and the
future external text engine adapter. The selected direction is an evidence lane:
adapter-owned shaping returns glyph and line facts as
`vnext-text-engine-adapter-evidence`, then accepted evidence may be mapped into
the existing pagination-facing line draft. Glyph facts are not added to the
pagination measurement draft in this phase.

## Evidence

- `src/renderer/textEngineAdapterSpi.ts` defines adapter request and evidence
  contracts for glyph ids, advances, offsets, cluster ranges, and line boxes.
- `tests/textEngineAdapterSpi.test.ts` proves Phase 107 shaping smoke cases can
  be mapped into adapter requests without executing rustybuzz, WASM, ICU4X, or
  font reads.
- The plan explicitly uses `glyph-facts-separate-from-pagination-draft` as the
  evidence lane and `derive-line-draft-from-accepted-evidence` as the later
  measurement handoff.

## Boundary

Allowed:

- create static adapter request records from copied font asset ids, Thai corpus
  samples, and Phase 107 smoke cases;
- define future adapter evidence records for glyph facts and line box facts;
- require stable measurement profile identity;
- require the external adapter package placement;
- keep the existing pagination-facing text measurement draft unchanged.

Blocked:

- production measurement binding;
- direct core dependency placement;
- core imports of rustybuzz, HarfBuzz, ICU4X, WASM, font parsers, browser
  renderers, or PDF/DOCX renderers;
- core font-file reads;
- core shaping or segmentation execution;
- adapter plans that do not return glyph facts or line boxes;
- mutating `VNextTextMeasurementDraft` to carry glyph facts before the evidence
  lane proves stable;
- document/package schema changes.

## Result

The next implementation step can create an external adapter package that
implements this SPI. That adapter may own rustybuzz/WASM setup, run the Phase
107 smoke cases, record actual glyph evidence, and later expose a mapper into
the renderer-backed measurement provider.

## Non-goals

No Rust package, JS dependency, WASM build, rustybuzz/HarfBuzz execution, ICU4X
execution, font parsing, glyph capture, Thai oracle execution, pagination
replacement, renderer output, backend route, artifact write, storage write, or
package/document schema change is introduced in this phase.
