# Live Draft MR1 Engine Facts And Itemization

Status: external adapter, Node-native, executable MR1 WASM test-host, and
bounded real Chrome Worker parity slices accepted on 2026-07-21. The subsequent
Core per-fragment display list is accepted; Editor Canvas/product binding,
Backend binding, and production remain NO-GO.

## Outcome

`@flowdoc/text-engine-rust-wasm` now turns the existing TextBlock v4
measurement source into the accepted Core MR1 multi-run layout contract.

The QA-only pipeline is:

```text
TextBlock v4 measurement source
  -> merge complete paragraph run style with each Text Run local override
  -> resolve exact digest-pinned font face
  -> coalesce adjacent compatible Text/field source runs
  -> shape each effective run with Rustybuzz
  -> segment the complete resolved block with ICU4X
  -> normalize glyph clusters and advances to global UTF-16 ranges
  -> scale advances through LayoutUnitPolicyV1
  -> select cluster-safe, mandatory-break-aware line ranges
  -> call Core acceptVNextTextBlockMultiRunLayoutV1(...)
```

Core remains engine- and renderer-independent. The external package imports
Core; Core does not import the external package.

## Artifact Isolation

The historical XR-1 through XR-5 executable artifact is unchanged:

```text
pkg-live-draft/flowdoc_text_engine_bg.wasm
sha256 60d24ed4b5546e580a8fa5dd05d774e7d8b7078958f7d327cf8f66ffcb5b3a85
boundary flowdoc-text-engine-wasm-live-draft-xr1-v1
```

MR1 uses a separate generated artifact and entry point:

```text
pkg-live-draft-mr1/flowdoc_text_engine_mr1_bg.wasm
sha256 cc130a7f8cef2694f8518cecb93b518eac2496fa8f4141f62ca284e6f34b0857
boundary flowdoc-text-engine-wasm-live-draft-mr1-v1
```

The new Rust export reports raw `unitsPerEm`, ascender, descender, and line-gap
font units with every shape result. Rebuilding MR1 does not overwrite the
historical artifact or revise retained XR evidence.

## Effective Text Run Style

MR1 requires one complete paragraph run style containing family key, size,
color, normal/bold weight, normal/italic face style, and explicit inactive
decoration/strikethrough values. Text source runs apply their existing
`localStyle` as an override. Resolved fields and generated text inherit the
paragraph style.

The current bounded font-face set contains Sarabun Regular and Bold. Both are
verified by SHA-256 before execution and report the same actual metrics:

```text
unitsPerEm       1000
ascentFontUnit   1068
descentFontUnit  -232
lineGapFontUnit  0
```

The adapter maps authored `normal` to weight 400 and `bold` to weight 700. It
blocks unresolved family/weight/style combinations. A runtime result must
match the pinned face id, digest-owned metrics, and text exactly.

Adjacent Text and resolved-field sources may share one shaping run only when
all effective style facts match. A local font-size, weight, family, face style,
or color difference creates a separate run. Underline and strikethrough remain
blocked until the positioned-fragment paint contract carries them.

## Cluster And Line Rules

Rustybuzz returns UTF-8 byte clusters and font-unit glyph advances. The adapter
groups glyphs by cluster, maps cluster boundaries into UTF-16 offsets, sums
font-unit advances safely, and scales them to integer layout units. Missing
glyphs, negative LTR advances, unsafe sums, invalid boundaries, and font metric
drift block.

ICU4X segments the complete resolved block once. Only opportunities that are
also complete shaping-cluster boundaries are offered to Core. CR/LF source
runs are not shaped; their end offsets must still appear as mandatory line
boundaries. The current v1 adapter explicitly blocks RTL/Bidi ranges and marks
accepted runs as `ltr`.

Line selection is bounded greedy wrapping over exact cumulative cluster
advances. If the first legal opportunity itself exceeds the available width,
the request reaches Core and fails closed under Core's v1 overflow rule.

## Runtime Evidence

`tests/textEngineMultiRunNodeWasmV1.test.ts` executes the same 10 pt Regular,
24 pt Bold, and 12 pt resolved-field line through:

- native Rustybuzz/ICU4X executables; and
- the separately pinned executable MR1 WASM artifact.

Both produce exactly equal Core requests and accepted Core layout objects. The
line switches Sarabun Regular to Bold and back to Regular. Actual 24 pt
Sarabun metrics produce a 25,632,000-unit ascent, 5,568,000-unit descent,
31,200,000-unit natural height, and a shared baseline offset of 25,632,000.

The WASM path is also instantiated by a separate Editor QA Worker in real
Chrome. Its complete Core request and accepted layout are byte-for-byte JSON
equal to Node-native execution with zero integer drift. The bounded result
retains three shaping runs, three clusters, one line, three positioned
fragments, the Regular/Bold/Regular face switch, and the resolved-field source
segment. The retained 25 warm layouts observed about 1.9 ms p50 and 3.4 ms p95
on one machine; these are observations, not accepted budgets. See the Editor
repository's `docs/LIVE_DRAFT_MR1_REAL_BROWSER_WORKER.md` and
`src/fixtures/live-draft-mr1-real-browser-worker-parity.v1.json`.

`tests/textEngineMultiRunLayoutV1.test.ts` separately proves deterministic
itemization, compatible source-run coalescing, cluster-safe wrapping,
mandatory hard breaks, source retention, immutability, and fail-closed
production, Bidi, decoration, font mapping, metric drift, and missing-glyph
boundaries.

## Intentionally Not Changed

- Authored TextBlock and Text Run schemas are unchanged.
- Historical XR artifacts and evidence are unchanged.
- The existing default measurer, pagination path, display list, Canvas, PDF,
  Editor, and Backend are unchanged.
- No font or WASM bytes enter Core.
- No production binding is enabled.
- No Canvas, PDF, product-binding, or glyph-pixel parity claim is made.

## Next

The Core per-fragment display-list projection is now accepted and documented in
`LIVE_DRAFT_MR1_FRAGMENT_DISPLAY_LIST.md`. Consume those commands in a separate
Editor QA Canvas path before considering product binding.
