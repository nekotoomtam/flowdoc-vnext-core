# Live Draft MR1 Multi-Run Layout Contract

Status: Core contract and acceptance slice accepted on 2026-07-21. A
subsequent external Node-native and executable-WASM test-host slice now feeds
this contract. Real Browser Worker evidence, display-list binding, renderer
binding, and production activation remain inactive.

## Outcome

MR1 now has a versioned, JSON-safe boundary for one TextBlock whose resolved
text can contain more than one shaping run and more than one font size on the
same line. The authored TextBlock and Text Run schemas are unchanged.

The boundary is split by responsibility:

- `src/layout/textBlockMultiRunLayoutContractV1.ts` owns the input, accepted
  result, positioned-line, positioned-fragment, font-face, cluster, source
  segment, and issue shapes;
- `src/layout/textBlockMultiRunLayoutV1.ts` validates external evidence and
  derives canonical integer geometry; and
- `src/layout/layoutUnitPolicyV1.ts` owns exact micro-point conversion,
  rounding, safe arithmetic, and the required policy fingerprint.

`acceptVNextTextBlockMultiRunLayoutV1(...)` consumes the existing
`VNextTextBlockV4MeasurementRequest`. It does not change or replace the
existing measurement, pagination, or display-list paths.

## Ownership

The external adapter must provide:

- pinned static font-face identity and raw integer font metrics;
- resolved shaping-run ranges and style/font facts;
- ordered cluster ranges and integer advances;
- accepted break opportunities; and
- selected line ranges.

Core then validates:

- the `LayoutUnitPolicyV1` fingerprint and exact available width;
- gap-free authored/resolved source ranges;
- shaping coverage of every paintable range while excluding hard breaks;
- safe UTF-16, shaping-run, cluster, and line boundaries;
- mandatory hard-break boundaries;
- pinned font identity and safely scaled metrics;
- line coverage and available-width bounds; and
- all geometry arithmetic as signed safe integers.

Core derives, rather than accepts from a renderer:

- each fragment's `xLayoutUnit` from ordered cluster advances;
- each line's maximum ascent and descent across its fragments;
- one shared baseline per line;
- declared-line-height leading when the declared height exceeds natural font
  height;
- the stacked `yOffsetLayoutUnit` for each line; and
- deterministic fingerprints for shaping runs, fragments, lines, and the
  complete accepted result.

The renderer is a future consumer of these facts. It may not measure text or
relayout a line.

## Mixed-Size Baseline Rule

For each accepted shaping run, Core scales raw font metrics using
`LayoutUnitPolicyV1`:

```text
ascent  = scale(face ascent, font size)
descent = magnitude(scale(face descent, font size))

line natural ascent  = max(fragment ascents)
line natural descent = max(fragment descents)
line natural height  = natural ascent + natural descent
line height          = max(declared line height, natural height)
leading before       = floor((line height - natural height) / 2)
leading after        = remaining leading
baseline offset      = leading before + natural ascent
```

`lineGapLayoutUnit` is retained per face/run for evidence, but MR1 v1 does not
add it a second time after the paragraph's declared line height has owned
leading. Baseline shift is fixed to zero in v1.

The bounded acceptance fixture places 10 pt Regular, 24 pt Bold, and a 12 pt
resolved field on one line. Its exact advances are 5,000,000, 14,400,000, and
6,000,000 layout units. Core derives fragment x positions 0, 5,000,000, and
19,400,000, a 25,400,000-unit line width, a 19,200,000-unit baseline, and a
24,000,000-unit line height.

## Source And Run Boundaries

A shaping run may span more than one measurement source run or be split into
more than one positioned line fragment. Core retains the intersecting Text,
resolved-field, and generated source segments on each fragment. A line may
split a shaping run only at a complete cluster boundary.

This permits a future adapter to coalesce adjacent source runs only after it
has proved that their effective shaping style is compatible. MR1's current
Core slice accepts already-resolved style/font evidence; it does not yet prove
that a Text Run's `localStyle` was merged into the paragraph style or mapped
to the correct pinned font face. That validation belongs to the next external
itemization/style-resolution slice and remains a blocker for cross-runtime
acceptance.

Hard-break measurement runs are excluded from shaping and paint fragments.
Their end offsets remain mandatory line boundaries, and their source identity
is retained on the containing line.

## Fail-Closed V1 Limits

MR1 v1 blocks:

- empty TextBlocks;
- inline images;
- RTL/Bidi shaping (`direction` is currently `ltr` only);
- non-zero baseline shifts;
- a line boundary inside a shaping cluster;
- missing, overlapping, or out-of-range shaping evidence;
- lines wider than the exact available width;
- unsafe integer metrics, advances, coordinates, or line stacks; and
- any request that asks to bind production layout.

Italic is retained as a font-face data value, but no italic runtime evidence
is accepted by this slice. Decorations and strikethrough remain authored
style data and do not yet have per-fragment paint commands.

## Evidence

`tests/textBlockMultiRunLayoutV1.test.ts` proves:

- exact mixed-size shared-baseline and fragment-position geometry;
- resolved-field source retention;
- one externally resolved shaping run spanning multiple source runs;
- one shaping run splitting into multiple line fragments;
- mandatory hard-break handling without painting break text;
- deterministic, immutable, JSON-safe results and fingerprints;
- fail-closed policy, coverage, cluster, width, inline-image, and production
  boundaries; and
- independence from Rustybuzz, Harfbuzz, ICU4X, WASM, DOM, Canvas, PDF, font
  byte loading, storage, and Backend runtimes.

## Next

The external Node-native and executable-WASM test-host facts now live in
`LIVE_DRAFT_MR1_ENGINE_FACTS.md`. Feed the same facts into this Core acceptance
boundary from a real Browser Worker next, then add per-fragment display-list
commands.
