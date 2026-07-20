# Live Draft XR-5 Source Segments And Forced Breaks

Status: bounded QA-only Core support accepted on 2026-07-21; the full v1
measurement matrix remains partial.

## Outcome

XR-5 keeps the XR-4 no-relayout display-list boundary and adds two facts that
the expanded Node/Browser matrix required:

1. `projectVNextTextFlowDisplayListV1(...)` may receive the exact accepted
   measurement runs and project their clipped inline identities into optional
   per-line `sourceSegments`.
2. The external Live Draft measurement adapter treats a break immediately
   after CR or LF as mandatory, even when later text would still fit on the
   same line.

The source-run projection validates gap-free ranges, complete rendered-text
coverage, exact run text, and required resolved-field keys. Invalid source
runs block the display list. Existing plain XR-4 callers that do not supply
source runs keep the same command shape and fingerprint behavior.

`sourceSegments` retain:

- inline id and run kind;
- resolved field key where applicable;
- clipped global render offsets;
- clipped source-local offsets;
- exact rendered text; and
- retained style/local-style facts when supplied.

They are source and hit-region facts, not permission for a renderer to
measure, reshape, or relayout text.

## Cross-Runtime Evidence

The retained Editor evidence executes nine bounded rows through Node-native
Rustybuzz/ICU4X and a real Chrome Worker WASM runtime. It compares normalized
engine facts, Core line/page geometry, display-list commands, source segments,
and deterministic fingerprints.

The accepted rows cover mixed Thai/Latin, Sarabun regular/bold style mapping,
resolved-field adjacency, the same text at 24 pt and 10,000 pt widths, forced
line breaks, and a 4,959-character long block. Numeric cross-runtime drift was
zero for normalized engine facts, Core geometry, and display-list geometry in
the retained run.

Evidence lives at:

```text
flowdoc-vnext-editor/src/fixtures/live-draft-xr5-cross-runtime-matrix.v1.json
```

## Explicit Blockers

XR-5 retains blockers rather than fabricating support for:

- font-face changes inside one measured inline line;
- constrained Table cell composition;
- repeated Table headers;
- explicit page-break nodes in the one-block text-flow path; and
- default/approximate-versus-renderer drift evaluation.

The full release-gating matrix therefore remains `partial-not-accepted`.
Default `measureVNextText(...)` replacement, production binding, whole-document
exactness, and glyph-pixel parity remain blocked.
