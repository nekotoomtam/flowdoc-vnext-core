# Live Draft MR1 Contextual Range Facts

Status: accepted for a bounded native/WASM and real-Chrome Worker QA slice on
2026-07-21. Contextual range shaping and bounded range segmentation are now
executable. Affected-line assembly, incremental Core acceptance, product
binding, and production remain NO-GO.

## Boundary and artifact

The implementation lives in the external
`packages/text-engine-rust-wasm` package. It does not add Rustybuzz, ICU4X,
WASM, Node, or browser dependencies to Core.

The historical XR1 and MR1 WASM artifacts remain byte-identical. Range facts
use a separately generated and verified artifact:

- boundary: `flowdoc-text-engine-wasm-live-draft-mr1-range-v1`;
- SHA-256:
  `90bbb751ad3d5613175d689a2b07f95320b856a5e9420118b259d5738b7dabe7`;
- Rustybuzz: `0.20.1`;
- ICU4X line segmenter/data: `2.2.0`.

## Contextual range shaping

`flowdoc_text_engine_wasm_shape_range_json` and its native executable receive
the complete text of one effective shaping run, a non-empty selected byte
range, and an enclosing context range. All offsets must be UTF-8 scalar
boundaries.

The engine guesses direction, script, and language from the complete effective
run, pins those properties on the selected range, and supplies explicit
pre/post context to Rustybuzz. It returns font metrics and glyph ids, advances,
offsets, global byte clusters, and `unsafeToBreak` facts. The TypeScript
normalizer validates every slice and maps byte boundaries to global UTF-16
offsets without floating-point geometry.

The full-oracle proof first requires the selected start and end to be full-run
cluster boundaries. It then compares glyph id, global cluster, advances, and
offsets exactly. A split cluster, changed font/text, or any glyph mismatch
returns `fallback-required`.

## Bounded segmentation

ICU4X does not expose a context-aware range API in the pinned version. The
adapter therefore segments an enclosing substring, shifts its breaks back to
global offsets, and excludes artificial substring endpoint breaks unless the
endpoint is also a real full-text edge.

The adaptive helper expands context 32 -> 64 -> 128 UTF-16 units and requires
two equal consecutive expansions. It returns `fallback-required` when the
configured limit is reached or complete-text context is required. A stable
range remains advisory (`oracleVerified: false`, `mayPublishLayout: false`)
until QA compares it with the complete ICU4X oracle.

## Accepted evidence

Focused Core tests cover Thai combining behavior, Latin ligature candidates,
a Thai-leading mixed Thai/Latin run, Sarabun Regular/Bold, native/WASM equality,
global cluster offsets, artificial segmentation endpoints, bounded stability,
full-context fallback, and surrogate-splitting rejection.

The Editor real-Chrome Worker tests six 30-unit ranges across a 4,959-unit
Thai/Latin block. All six shape and segmentation proofs are exact, all bounded
segmentation rows stabilize after three context windows, and zero Backend-like
requests occur.

Observed diagnostic p50/p95 values were 9.7/14.8 ms for full shaping versus
1.9/3.3 ms for contextual range shaping, and 26.8/36.0 ms for full segmentation
versus 7.7/10.7 ms for bounded segmentation. These values are observations,
not product budgets.

## Remaining gate

This slice does not splice retained prefix/suffix clusters, rebuild affected
lines, perform incremental Core acceptance, or publish an assembled layout.
The next bounded slice should implement an affected-window line builder plus
retained checkpoint fingerprints and a dedicated incremental Core acceptance
contract. Its QA result must remain exactly equal to a full oracle, and any
unsafe boundary, context limit, hard break, window limit, or reconvergence
failure must select full fallback.

Tables, columns, images, repeated headers, auto-fit column width, Backend/API,
React input, IME/caret/selection, product binding, and production remain out of
scope.

## Evidence files

- `packages/text-engine-rust-wasm/rust-live-draft-engine/src/lib.rs`
- `packages/text-engine-rust-wasm/src/runtimeMr1Range.ts`
- `packages/text-engine-rust-wasm/src/node.ts`
- `packages/text-engine-rust-wasm/src/workerMr1Range.ts`
- `tests/textEngineMr1RangeFactsV1.test.ts`
- `../flowdoc-vnext-editor/docs/LIVE_DRAFT_MR1_CONTEXTUAL_RANGE_FACTS.md`
- `../flowdoc-vnext-editor/src/fixtures/live-draft-mr1-contextual-range-facts.v1.json`
