# Template Builder Viewport Node Anchor Boundary

Status: Phase 67 implementation boundary.

Phase 67 adds a node-aware viewport anchor and jump-to-node path. The browser
shell may read node rectangle facts, but node anchor normalization and restore
math live in a DOM-free module.

## Purpose

Phase 58 could restore by section-relative anchors. Phase 67 adds node-relative
navigation for selection changes:

- capture a node id, node type, section id, and section-relative node offset;
- resolve the anchor after render against the current section measurement;
- re-read node rects after render when the selected node is newly materialized;
- fall back to section top when the node is not mounted yet;
- expose node anchor restore status beside the section anchor status.

## Module Owner

`examples/template-builder-sandbox/public/viewportNodeAnchor.js` owns:

- `VIEWPORT_NODE_ANCHOR_SOURCE`;
- `VIEWPORT_NODE_ANCHOR_MODE`;
- `VIEWPORT_NODE_ANCHOR_RESTORE_MODE`;
- `createViewportNodeAnchor(...)`;
- `resolveViewportNodeAnchorScrollTop(...)`.

The module must stay browser-safe: no DOM reads, no event binding, no timers, no
transport, no app state, no persistence, and no route calls.

## App Boundary

`examples/template-builder-sandbox/public/app.js` remains the browser
coordinator:

- it reads node and section DOM rectangles when a mounted node is available;
- it creates a fallback node anchor from runtime-store `sectionIdByNodeId` when
  the node is not mounted;
- it passes node anchors into render restore for selection jumps;
- it re-reads node rectangles after render before resolving scroll top;
- it reports `Node anchor: ...` in the status bar.

`app.js` must not own node-anchor normalization or restore math.

## Acceptance Evidence

Phase 67 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- the sandbox source guard reads `viewportNodeAnchor.js`;
- node-anchor ownership is checked for source/mode/restore mode and DOM-free
  behavior;
- `browser.restoreViewportNodeAnchor` is exposed as a generated action lane;
- app selection uses node-aware restore input;
- node anchors resolve against section measurement and clamp to scroll bounds;
- missing sections fall back without claiming restoration.

## Explicit Non-Goals

Phase 67 does not implement every jump surface:

- no outline jump UI;
- no diagnostics/source jump UI;
- no caret-relative text anchor;
- no backend/API route;
- no async lazy detail hydration;
- no structural packet engine;
- no rich text or contenteditable mapping;
- no live-layout renderer;
- no persistence;
- no package/document version change.
