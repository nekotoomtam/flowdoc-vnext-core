# Template Builder Render Shell Boundary

Status: Phase 54 implementation boundary.

Phase 54 adds a browser-safe render shell contract for the sandbox canvas. The
shell keeps every document section represented in the canvas while only the
active render window mounts detailed node content.

## Purpose

Phase 52 made the canvas render from an active render window. Phase 53 defined
the viewport request language that future scroll code will produce. Phase 54
adds the missing middle layer needed before real scroll measurement:

```text
store-backed render model
  -> render window
  -> render shell
  -> canvas section placeholders + active detail
```

This gives the browser a full-document section shell before DOM measurement,
spacers, or virtualized rendering exists.

## Implemented Module

`examples/template-builder-sandbox/public/renderShell.js` owns:

- `createRenderShell(...)`;
- render-shell source, mode, section counts, rendered section ids, and
  placeholder section ids;
- shell sections that preserve section metadata while marking each section as
  `rendered` or `placeholder`;
- section-read helpers without browser DOM access.

The render shell mode is `render-window-shell`.

## Runtime Ownership

`renderModel.js` creates the render shell after resolving the render window and
exposes shell facts to the app shell.

`app.js` now iterates render-shell sections for the canvas. A section in the
active render window renders detailed node content. Other sections render a
light placeholder page so the canvas has a full-document shell before true
viewport measurement is added.

## Acceptance Evidence

Phase 54 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- source guards prove `public/renderShell.js` is browser-safe;
- generated snapshots expose `browser.createRenderShell`;
- Node tests prove a full shell can contain placeholder sections while the
  active render window remains bounded;
- app source guards prove canvas traversal consumes render-shell helpers.

## Non-Goals

Phase 54 does not implement virtualized rendering:

- no DOM scroll event binding;
- no viewport measurement;
- no measured spacer heights;
- no scroll sync;
- no hidden/offscreen DOM pruning scheduler;
- no lazy heavy-detail endpoint;
- no structural add/delete/move packet application;
- no rich text editing;
- no contenteditable DOM mapping;
- no live-layout renderer;
- no persistence;
- no backend API routes outside the sandbox dev server;
- no package/document version changes.
