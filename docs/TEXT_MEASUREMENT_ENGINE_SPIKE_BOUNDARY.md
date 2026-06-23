# Text Measurement Engine Spike Boundary

Status: Phase 100 spike boundary.

Phase 100 turns the renderer-backed text measurement risk into an executable
spike plan. It does not install or execute HarfBuzz, ICU4X, Intl.Segmenter,
LibThai, PyThaiNLP, AttaCut, browser canvas, PDF renderers, DOCX renderers, or
font file readers.

The boundary records which measurement ingredients are ready to test before
any concrete engine is allowed to replace the current pagination measurement
path.

## Boundary

The boundary lives in `src/renderer/textMeasurementEngineSpike.ts`.

It exposes:

- `VNEXT_TEXT_MEASUREMENT_ENGINE_SPIKE_SOURCE`;
- `VNEXT_TEXT_MEASUREMENT_ENGINE_SPIKE_MODE`;
- `createVNextTextMeasurementEngineSpikePlan(...)`.

The plan is JSON-serializable and records:

- available font assets, including family, style, weight, format, source,
  license, revision, and optional hash;
- shaping candidates such as HarfBuzz, with determinism, glyph advance,
  cluster, complex-text, and package-boundary facts;
- line-break candidates such as ICU4X, Intl.Segmenter, UAX #14/libunibreak,
  LibThai, PyThaiNLP, AttaCut, or custom engines;
- comparison roles: primary candidate, comparison baseline, Thai oracle, or
  rejected;
- a profile candidate id made from font, shaping, line-break, and policy
  ingredients;
- blocking issues when a spike tries to bind production pagination, lacks
  available fonts, lacks a primary shaper, lacks a primary line breaker, uses a
  nondeterministic/runtime-dependent primary line breaker, or cannot prove Thai
  and Unicode line-break support;
- warnings for unavailable comparison fonts, unhashed fonts, or missing
  Thai-specific oracle coverage.

## Selected Direction

The recommended first concrete spike is:

```text
Sarabun / Noto Sans Thai fonts
  -> HarfBuzz shaping candidate
  -> ICU4X primary line-break candidate
  -> Intl.Segmenter comparison baseline
  -> LibThai / PyThaiNLP / AttaCut Thai oracle comparison
  -> drift report against createApproximateVNextTextMeasurer(...)
```

HarfBuzz is the preferred shaping candidate because exact line width requires
glyph advances and cluster mapping. It is not a line breaker by itself.

ICU4X is the preferred primary line-break spike candidate because a pinned
engine/data version can be made deterministic. Intl.Segmenter remains useful
as a browser/runtime comparison baseline, but runtime-dependent behavior must
not become the only cache or exact-output truth. Thai-specific tools remain
oracle/comparison candidates until packaging, licensing, and runtime boundaries
are decided.

## Truth

This boundary may describe and validate a measurement-engine spike plan.

This boundary must not:

- read font files;
- import concrete shaping, line-breaking, browser, PDF, or DOCX libraries;
- install dependencies;
- execute renderers;
- call DOM, canvas, headless browser, backend routes, or network APIs;
- relayout a document;
- replace `measureVNextText(...)` or `createApproximateVNextTextMeasurer(...)`;
- mutate package/document data;
- write generated documents, artifacts, storage records, or cache files;
- make legacy FlowDocEditor font paths part of the canonical vNext input.

Old font folders can seed a future font registry only after the assets are
copied through the vNext boundary with license and hash facts. The old project
path remains reference evidence only.

## Acceptance Evidence

- `tests/textMeasurementEngineSpike.test.ts` covers a HarfBuzz plus ICU4X
  spike plan, Intl.Segmenter as comparison-only baseline, production
  pagination binding blockers, font readiness/profile identity, source
  independence, and documentation trail.
- `src/index.ts` exports the new boundary without changing package/document
  schema, pagination behavior, renderer execution, or storage behavior.
- `tests/rendererTextMeasurementAdapter.test.ts` remains the adapter boundary
  for future external renderer facts.
- `tests/textMeasurement.test.ts` remains the cache/key/invalidation contract
  for `measureVNextText(...)`.

## Non-Goals

No concrete HarfBuzz integration, ICU4X integration, Intl.Segmenter wrapper,
LibThai/PyThaiNLP/AttaCut integration, font registry, font copy, font hash
scanner, browser/PDF/DOCX renderer-backed measurement provider, bidi shaping,
hyphenation, exact layout engine, pagination replacement, artifact output,
storage adapter, backend route, worker runtime, or schema change is introduced
in this phase.
