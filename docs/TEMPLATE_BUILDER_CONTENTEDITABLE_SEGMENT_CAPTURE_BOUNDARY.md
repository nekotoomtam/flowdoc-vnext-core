# Template Builder Contenteditable Segment Capture Boundary

Status: Phase 123 browser-local contenteditable segment capture boundary.

Phase 123 inserts a bounded capture step before the Phase 117
contenteditable range mapper. It reads browser-owned contenteditable-style
surface facts, normalizes them into deterministic segment records, and keeps
canonical package mutation deferred.

## PASS

- `examples/template-builder-sandbox/public/draftContenteditableSegmentCapture.js`
  owns `createDraftContenteditableSegmentCapture(...)` and
  `draftContenteditableSegmentCaptureLabel(...)`.
- The capture boundary accepts a contenteditable root with either explicit
  `segments` or DOM-like `childNodes`/`children`.
- Captured segment facts preserve plain text, styled-run marks, atomic
  field-chip metadata, UTF-16 draft offsets, and selection endpoints in the
  Phase 117 mapper shape.
- The boundary blocks missing surfaces, non-contenteditable roots, target
  drift, text drift, unsupported segment kinds, invalid segment ranges, missing
  atomic field keys, missing selection endpoints, and out-of-range offsets.
- `examples/template-builder-sandbox/public/app.js` surfaces
  `data-draft-contenteditable-segment-capture` beside the draft range, style,
  toolbar, chip, and rich-inline state summaries.
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.captureContenteditableSegments` as a wired browser-local action
  lane.
- `tests/templateBuilderSandboxBoundary.test.ts` proves ready plain capture,
  DOM-like styled/atomic capture, range-mapper handoff, blocked root/text/target
  cases, and composition guard behavior.

## FAIL / BLOCKER

- None for the Phase 123 boundary.

## RISK

- The visible authoring surface is still textarea-first; the sandbox now keeps
  a hidden contenteditable-style capture surface so the contract can be tested
  before production DOM binding.
- Styled runs and field chips are captured, but Phase 117 still blocks mapping
  those ranges until richer inline mapping and canonical commit planning exist.
- Browser selection quirks around nested inline nodes, bidi affinity, and IME
  surfaces still need production browser coverage.

## UNKNOWN

- Whether production contenteditable capture should walk real DOM nodes
  directly or consume a rendering-layer segment stream.
- How atomic field chips should expose editable placeholders, selection stops,
  and deletion affinity.
- How renderer-backed caret measurement, collaboration, persistence, and
  durable undo/redo will consume captured segment identities.

## Files Changed

- `docs/TEMPLATE_BUILDER_CONTENTEDITABLE_SEGMENT_CAPTURE_BOUNDARY.md`
- `examples/template-builder-sandbox/public/draftContenteditableSegmentCapture.js`
- `examples/template-builder-sandbox/public/app.js`
- `examples/template-builder-sandbox/src/coreBoundary.ts`
- `examples/template-builder-sandbox/public/sandbox-snapshot.json`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/templateBuilderSandboxBoundary.test.ts`

## Behavior Changed

- Active browser drafts now expose a contenteditable segment capture summary
  before range mapping.
- The capture step can hand plain-text segment facts into the Phase 117 range
  mapper without mutating package state.
- Styled-run and field-chip facts can be captured as browser-local evidence,
  but canonical rich inline mutation remains deferred.

## Tests Run

- `npm.cmd run build` in `examples/template-builder-sandbox`
- `npm.cmd test -- tests/templateBuilderSandboxBoundary.test.ts --testTimeout=30000`
- `npm.cmd run check`

## Risks Left

- Replace hidden/fallback capture with the real production contenteditable
  surface.
- Add rich inline range mapping for styled and atomic segments.
- Plan canonical rich inline commit records without flattening inline children.
- Add browser-level selection, bidi, nested inline, and IME coverage.

## Intentionally Not Changed

- No package/document schema changes.
- No parent editor runtime or legacy editor imports.
- No canonical inline style commit.
- No canonical field-ref insertion or key migration write.
- No durable history write, live layout request, exact output, backend route,
  persistence, collaboration behavior, ICU4X execution, or WASM/text-engine
  measurement.
