# Template Builder WYSIWYG Close Audit

Status: Phase 85 close audit.

Phase 85 closes the current WYSIWYG / Editing foundation pass for Phases 78-84.
It records what is now a stable browser-local boundary and what remains
intentionally unfinished before production rich editing.

This audit does not implement new runtime behavior.

## PASS

- Draft state, caret/selection normalization, command context, draft text
  commands, composition transitions, and draft guard helpers are owned by
  `examples/template-builder-sandbox/public/draftRuntime.js`.
- Draft layout preview summaries are owned by
  `examples/template-builder-sandbox/public/draftLayoutPush.js` and explicitly
  keep `liveLayout.status = "not-requested"` and
  `exactGeneration.status = "not-run"`.
- IME guard policy is owned by
  `examples/template-builder-sandbox/public/draftImePolicy.js` and centralizes
  command, range-control, and commit blocking during composition.
- Rich inline style patch, toolbar state, field chip inline, and style-aware
  history phases now have browser-safe planning modules with explicit
  `not-run`, `not-applied`, `not-wired`, `not-recorded`, or `not-written`
  statuses.
- `examples/template-builder-sandbox/public/app.js` consumes the browser-local
  modules while retaining DOM event binding, focus restoration, fetch, packet
  application, viewport coordination, and structural coordination.
- `examples/template-builder-sandbox/src/coreBoundary.ts` exposes action lanes
  for draft runtime, draft layout push, IME hardening, style patch planning,
  toolbar state, field chip inline planning, and style-aware history planning.
- `tests/templateBuilderSandboxBoundary.test.ts` proves the modules run in Node
  without DOM access and keeps active draft state out of snapshots, packages,
  history, live layout, and exact output.

## FAIL / BLOCKER

- No blocker was found for closing this foundation pass.

## RISK

- `app.js` still coordinates a large number of browser surfaces. The new
  modules reduce policy ownership, but later phases should keep extracting real
  behavior rather than adding more app-shell state.
- Rich inline style patch, field chip insertion, toolbar command dispatch, and
  style-aware history are planning boundaries only. They are not production
  editing features yet.
- The active draft path still uses a textarea-based plain text surface. Rich
  inline range mapping and contenteditable/DOM range mapping remain future
  work.

## UNKNOWN

- Production IME behavior for language-specific edge cases is unknown.
- Exact active-mark detection over authored rich inline runs is unknown.
- Style-aware live-layout invalidation and renderer parity are unknown.
- Future persistence, collaboration, backend API, and durable undo/redo
  behavior are unknown.

## Files Changed In This Pass

- `examples/template-builder-sandbox/public/draftRuntime.js`
- `examples/template-builder-sandbox/public/draftLayoutPush.js`
- `examples/template-builder-sandbox/public/draftImePolicy.js`
- `examples/template-builder-sandbox/public/draftInlineStylePatch.js`
- `examples/template-builder-sandbox/public/draftToolbarState.js`
- `examples/template-builder-sandbox/public/draftFieldChipInline.js`
- `examples/template-builder-sandbox/public/draftStyleHistory.js`
- `examples/template-builder-sandbox/public/app.js`
- `examples/template-builder-sandbox/src/coreBoundary.ts`
- `examples/template-builder-sandbox/public/sandbox-snapshot.json`
- `README.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `docs/PHASE_LEDGER.md`
- `tests/templateBuilderSandboxBoundary.test.ts`

## Behavior Changed

- Active draft browser UI now surfaces draft runtime, layout push, IME guard,
  style patch planning, toolbar state, field chip planning, and style-aware
  history planning summaries.
- Draft command/range/commit UI affordances now use the centralized IME policy
  for composition blocking.
- No canonical package, authoring history, live layout, exact output, backend
  API, persistence, or renderer behavior changed in this audit.

## Tests Run

- `node --check` on each new browser-local module as it was added.
- `npm.cmd run build` in `examples/template-builder-sandbox` after action lane
  changes.
- `npm.cmd test -- tests/templateBuilderSandboxBoundary.test.ts` after each
  implementation phase.
- `npm.cmd run check` after each implementation phase.

## Risks Left

- Rich inline execution is still future work.
- Contenteditable/DOM range mapping is still future work.
- Field chip insertion UI and command dispatch are still future work.
- Style-aware durable history, undo/redo, and live-layout invalidation are
  still future work.
- Exact renderer/export parity for authored inline styles is still future work.

## Intentionally Not Changed

- No package/document schema changes.
- No parent editor imports.
- No legacy runtime adoption.
- No backend API route changes.
- No persistence or collaboration changes.
- No exact renderer or export adapter changes.
- No durable history changes for active draft planning state.
