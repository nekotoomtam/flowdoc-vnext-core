# Template Builder Contenteditable Surface Hardening Boundary

Status: Phase 128 production contenteditable surface hardening boundary.

Phase 128 adds a browser-local hardening layer for the production
contenteditable surface. It does not mutate package state. It inspects a
contenteditable root, consumes the Phase 123 segment capture and Phase 117
range mapping summaries, resolves nested DOM-like selection endpoints back to
vNext draft segment offsets, and records drift/IME/caret guards before rich
inline package commits.

## PASS

- `examples/template-builder-sandbox/public/draftContenteditableSurfaceHardening.js`
  owns `createDraftContenteditableSurfaceHardening(...)` and
  `draftContenteditableSurfaceHardeningLabel(...)`.
- The hardening layer validates root binding, root id, text-block target,
  segment capture readiness, plain-text drift, selection endpoint resolution,
  and IME composition state.
- Browser DOM-like selection endpoints can start inside nested text nodes and
  still resolve to segment id, UTF-16 offset, absolute draft value, direction,
  collapsed state, and caret affinity.
- Styled-run content can still report a hardened surface even when the older
  plain range mapper blocks styled ranges; the mapper status is carried as a
  guard fact instead of flattening rich inline content.
- `examples/template-builder-sandbox/public/app.js` exposes
  `data-draft-contenteditable-surface-hardening` beside segment capture and DOM
  range summaries.
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes
  `browser.hardenContenteditableSurface` as a wired browser-local action lane.
- `tests/templateBuilderSandboxBoundary.test.ts` proves ready nested-selection
  hardening, styled range-mapper guard carry-through, blocked selection/root/
  target cases, composition guard behavior, action-lane exposure, and source
  guardrails.

## FAIL / BLOCKER

- None for the Phase 128 hardening boundary.

## RISK

- The sandbox still uses the textarea draft as the primary interactive editing
  input; the contenteditable surface is hardened as a bounded browser-local
  contract before replacing that primary input.
- Bidi caret affinity is recorded as pending renderer-backed measurement rather
  than solved in this browser-local pass.
- The hardening layer proves selection facts and drift guards, but persistence,
  collaboration, and renderer output do not yet consume them.

## UNKNOWN

- Whether the renderer should provide the final production segment stream or
  whether the editor should walk DOM nodes directly.
- How atomic field chips should expose before/after/delete affinity once they
  are edited from the production contenteditable surface.
- How collaboration should handle concurrent rich inline edits that resolve
  against different DOM segment snapshots.

## Files Changed

- `docs/TEMPLATE_BUILDER_CONTENTEDITABLE_SURFACE_HARDENING_BOUNDARY.md`
- `examples/template-builder-sandbox/public/draftContenteditableSurfaceHardening.js`
- `examples/template-builder-sandbox/public/app.js`
- `examples/template-builder-sandbox/src/coreBoundary.ts`
- `examples/template-builder-sandbox/public/sandbox-snapshot.json`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/templateBuilderSandboxBoundary.test.ts`

## Behavior Changed

- Active sandbox drafts now expose a contenteditable surface hardening summary.
- Nested DOM-like selection endpoints can be resolved into segment offsets
  before package mutation.
- Root drift, target drift, selection drift, text drift, and IME composition
  now have an explicit browser-local guard result.
- Package mutation, core transactions, history writes, live layout requests,
  exact rendering, backend API calls, persistence, and collaboration remain
  unchanged.

## Tests Run

- `npm.cmd run build` in `examples/template-builder-sandbox`
- `npm.cmd test -- tests/templateBuilderSandboxBoundary.test.ts --testTimeout=30000`
- `npm.cmd run check`

## Risks Left

- Promote the hardened contenteditable surface from bounded evidence to the
  primary editing input.
- Feed hardened rich selection facts into persistence/session-backed rich inline
  history.
- Add renderer-backed caret/bidi measurement and exact output parity.
- Add collaboration conflict behavior for rich inline edits.

## Intentionally Not Changed

- No package/document schema changes.
- No parent editor runtime or legacy editor imports.
- No durable persistence write.
- No collaboration behavior.
- No renderer artifact output.
- No ICU4X execution or WASM/text-engine measurement replacement.
