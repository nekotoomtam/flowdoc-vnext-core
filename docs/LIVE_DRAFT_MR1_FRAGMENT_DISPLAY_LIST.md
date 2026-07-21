# Live Draft MR1 Per-Fragment Display List

Status: Core-only display-list projection accepted on 2026-07-21. Editor QA
Canvas consumption, product binding, Backend binding, whole-document
composition, and production remain NO-GO.

## Outcome

`projectVNextTextBlockMultiRunDisplayListV1(...)` consumes only a Core-accepted
`VNextTextBlockMultiRunLayoutResultV1`. It turns every positioned Text Run
fragment into one deterministic `text-fragment` paint command without measuring
text, wrapping lines, selecting fonts, or recomputing a baseline.

The projection stays in the MR1 fixed-point unit from input through output:

```text
accepted positioned fragment
  + signed safe-integer TextBlock origin
  -> absolute fragment x
  -> absolute shared line baseline y
  -> line bounds and font-metric bounds
  -> pinned style/font/source facts
  -> deterministic paint command
```

The renderer converts layout units to points or pixels once at its paint
boundary. It does not feed converted values back into Core.

## Command Facts

Each command retains:

- layout, line, fragment, and shaping-run identity;
- the accepted layout, line, and fragment fingerprints;
- render offsets and exact fragment text;
- paint order;
- absolute baseline x/y in integer layout units;
- fragment line bounds plus ascent/descent metric bounds;
- accepted advance, ascent, descent, line gap, and zero baseline shift;
- style key, pinned font-face id/family/hash, weight, face style, font size, and
  text color; and
- clipped Text, resolved-field, or generated source segments.

The line records separately retain the complete line box, shared baseline,
ordered command ids, and line-level source segments. This keeps hard-break
source identity even though a hard break does not create a paint command.

For the bounded synthetic MR1 fixture at origin `(72 pt, 100 pt)`, the 10 pt
Regular, 24 pt Bold, and 12 pt Regular fragments have absolute baseline x
positions of 72 pt, 77 pt, and 91.4 pt. All three use the same 119.2 pt
baseline y. Their metric tops differ because their font sizes differ; the
baseline does not.

## Validation

Projection fails closed when:

- the input layout is blocked;
- the fixed-point policy fingerprint differs;
- production binding is requested;
- the projection id or origin is invalid;
- line stacking, line width, shared-baseline, or fragment order drifts;
- applying the origin would exceed signed safe-integer arithmetic;
- fragment source coverage or pinned paint style is invalid; or
- a line or fragment no longer matches its Core-accepted fingerprint.

The projector clones retained source facts and does not mutate the accepted
layout.

## Boundaries

- Core imports no browser, Canvas, PDF, Rust, WASM, font-loader, or Backend
  runtime.
- `rendererMayMeasureText` is `false`.
- `rendererMayRelayout` is `false`.
- Glyph rasterization remains renderer-owned.
- One command currently paints one accepted shaping-run fragment, not one glyph.
  Therefore this contract fixes fragment origins and line geometry but does not
  establish glyph-outline or pixel parity inside a multi-glyph fragment.
- RTL/Bidi, inline images, baseline shift, underline, strikethrough, pagination,
  and whole-document composition remain outside this bounded slice.

## Evidence

- `src/renderer/textBlockMultiRunDisplayListV1.ts`;
- `tests/textBlockMultiRunDisplayListV1.test.ts`; and
- the accepted upstream layout evidence in
  `tests/textBlockMultiRunLayoutV1.test.ts`.

The focused fixture proves exact shared-baseline commands, per-fragment
font-size/weight/face facts, resolved-field retention, determinism,
immutability, fingerprint checks, production blocking, and safe-origin
arithmetic.

## Next

Let a separate Editor QA Canvas path consume these commands. It must load the
same digest-pinned Sarabun faces, convert units only at paint time, set Canvas
font/style/color from each command, call `fillText` at the accepted baseline,
and never call `measureText` or relayout the line. Retain command facts,
nonblank-pixel evidence, and the limitation that Canvas owns glyph
rasterization.
