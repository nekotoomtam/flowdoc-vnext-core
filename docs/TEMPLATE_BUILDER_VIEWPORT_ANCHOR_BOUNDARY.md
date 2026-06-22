# Template Builder Viewport Anchor Boundary

Status: Phase 58 implementation boundary.

Phase 58 adds a section-relative viewport anchor to the sandbox. It records the
current viewport as `sectionId + offsetInSection` and uses that anchor when a
render pass needs to restore the canvas position.

Phase 59 builds on this with measured section spacers so placeholder/detail
height changes have a smaller chance of moving that anchor unexpectedly.

## Purpose

Phase 57 could restore only the previous raw `scrollTop`. That is enough for a
small scaffold, but it is not a stable long-document editing contract. When
content above the viewport changes height, a raw scroll number no longer points
at the same reading or editing position.

The Phase 58 contract is intentionally modest:

```text
current viewport measurement
  -> section viewport anchor
  -> visible-range/render update
  -> post-render shell measurement
  -> section anchor restore
  -> canvas scrollTop
```

This is the first stability layer before node anchors, outline jump-to-node,
typing-driven layout pushdown, measured spacers, and true virtualized rendering.

## Implemented Module Contract

`examples/template-builder-sandbox/public/viewportAnchor.js` owns:

- `VIEWPORT_ANCHOR_SOURCE`;
- `VIEWPORT_SECTION_ANCHOR_MODE`;
- `VIEWPORT_SECTION_ANCHOR_RESTORE_MODE`;
- `createViewportSectionAnchor(...)`;
- `resolveViewportSectionAnchorScrollTop(...)`.

The module is DOM-free. It accepts section-shell measurements and returns
plain anchor/restore records. It does not bind events, inspect elements, own
timers, or change visible ranges.

## App Integration

`examples/template-builder-sandbox/public/app.js` now:

- records a section anchor from each current viewport measurement;
- uses the section anchor when manual viewport apply or settled scroll causes a
  render pass;
- measures the rendered shell before restoring so a changed section top can be
  resolved from `sectionId + offsetInSection`;
- keeps raw `scrollTop` as a fallback when the section anchor cannot be
  resolved;
- reports the current anchor in the status bar.

## Why Section First

Section anchors are the lowest-risk stability contract because every render
shell page has a stable section id even when detailed node content is not
mounted. They are enough to keep the viewport from depending only on raw
scrollTop while the renderer is still shell-based.

Node anchors remain a required later upgrade for:

- outline click-to-node navigation;
- diagnostics/source jump-to-node;
- draft/caret anchoring inside a text block;
- node-aware lazy detail loading;
- selection-aware live layout.

The section anchor is therefore a fallback foundation, not a replacement for
node anchors.

## Acceptance Evidence

Phase 58 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- source guards prove `browser.trackViewportAnchor` is exposed;
- source guards prove anchor policy lives in `viewportAnchor.js`;
- source guards prove the anchor module stays DOM-free while `app.js` owns
  measurement and canvas scroll restoration;
- Node tests prove a section anchor restores from a shifted section top and
  falls back safely when the section is missing;
- browser smoke verifies scrolling the sandbox canvas records and restores a
  `section-body` anchor while scroll-driven rendering still works.

## Non-Goals

Phase 58 does not implement the final viewport anchoring system:

- no node anchor;
- no outline jump-to-node;
- no diagnostics/source jump-to-node;
- no caret-relative anchor inside a text block;
- no typing-driven live layout pushdown;
- no measured spacer heights;
- no virtual list;
- no continuous virtualized renderer scheduler;
- no lazy heavy-detail endpoint;
- no hidden/offscreen DOM pruning beyond the existing render shell;
- no rich text editing;
- no contenteditable DOM mapping;
- no persistence;
- no backend API routes outside the sandbox dev server;
- no package/document version changes.
