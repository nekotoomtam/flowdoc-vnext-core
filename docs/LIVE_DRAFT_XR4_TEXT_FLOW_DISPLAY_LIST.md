# Live Draft XR-4 Text-flow Display List

Status: bounded pure renderer-consumption contract accepted on 2026-07-21.

## Purpose

`projectVNextTextFlowDisplayListV1(...)` converts a complete accepted
`VNextTextFlowV4PaginationResult` into renderer-neutral page boxes and ordered
text-line paint commands. It does not import or execute Canvas, DOM, React,
font loading, text measurement, artifact bytes, or Backend behavior.

The projection retains:

- pagination and fragment fingerprints;
- stable A4/page-body point geometry supplied by the caller;
- measured text, offsets, source points, widths, heights, and y offsets;
- explicit font/style/baseline/color facts; and
- deterministic page, command, and display-list identities.

It blocks incomplete pagination, production binding, invalid page/body/style
facts, page-height mismatch, lines outside the body, and baselines outside a
measured line box.

## Renderer Contract

The result explicitly states:

```text
rendererMayMeasureText = false
rendererMayRelayout = false
lineBreaksAndBounds = core-measured
glyphRasterization = renderer-owned
artifactBytes = false
productionBinding = false
```

`glyphRasterization = renderer-owned` is an intentional limitation. This
contract fixes line and page geometry but does not claim cross-runtime glyph
outline/pixel identity. A consumer may paint the commands but must not reopen
layout decisions.

## Evidence And Scope

Direct tests prove deterministic multi-page commands, source immutability,
geometry/style fail-closed behavior, production-binding rejection, and the
absence of concrete browser/renderer APIs.

The real Chrome Canvas evidence belongs to Editor at
`flowdoc-vnext-editor/src/fixtures/live-draft-xr4-canvas-page-renderer.v1.json`.
That evidence remains QA-only and selected-scalar-only.

XR-4 does not add a whole-document display list, styled runs, images, tables,
Backend admission, artifact bytes, default measurement replacement, or
production activation.

XR-5 later adds optional validated inline/field `sourceSegments` to this same
contract. Those segments preserve source identity only; they do not grant a
renderer measurement or relayout authority. See
`docs/LIVE_DRAFT_XR5_SOURCE_SEGMENTS_AND_FORCED_BREAKS.md`.
