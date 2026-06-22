# Template Builder Viewport Lazy Detail Boundary

Status: Phase 66 implementation boundary.

Phase 66 adds a browser-safe lazy heavy-detail plan for mounted virtual
sections. The sandbox can now defer obviously heavy node subtrees, such as
tables and multi-column groups, without introducing an API route or async
hydration contract.

## Purpose

Phase 65 stops mounting every section article. Phase 66 starts reducing detail
inside the mounted section window:

- classify heavy node detail from normalized runtime-store indexes;
- protect the selected node path and active draft path from deferral;
- render a local placeholder for deferred heavy detail;
- keep the full runtime store and render window canonical;
- expose deferred/materialized counts in the status bar.

## Module Owner

`examples/template-builder-sandbox/public/viewportLazyDetail.js` owns:

- `VIEWPORT_LAZY_DETAIL_SOURCE`;
- `VIEWPORT_LAZY_DETAIL_MODE`;
- `DEFAULT_HEAVY_CHILD_COUNT`;
- `DEFAULT_HEAVY_SUBTREE_NODE_COUNT`;
- `DEFAULT_HEAVY_TEXT_LENGTH`;
- `createViewportLazyDetailPlan(...)`.

The module must stay browser-safe: no DOM reads, no event binding, no timers, no
transport, no app state, no persistence, no route calls, and no renderer
mutation policy.

## App Boundary

`examples/template-builder-sandbox/public/app.js` remains the renderer
coordinator:

- it passes render-model indexes and selected/draft ids into the lazy-detail
  module;
- it stores `state.viewportLazyDetail`;
- it renders deferred nodes as `canvas-lazy-detail` placeholders;
- it never defers the selected node or its ancestor path;
- it reports `Lazy detail: ...` in the status bar.

`app.js` must not own heavy-node classification, subtree counting, or active
path protection policy.

## Classification Rules

The Phase 66 conservative policy treats a node as heavy when:

- its type is `table` or `columns`;
- its direct child count reaches `DEFAULT_HEAVY_CHILD_COUNT`;
- its subtree count reaches `DEFAULT_HEAVY_SUBTREE_NODE_COUNT`;
- its text length reaches `DEFAULT_HEAVY_TEXT_LENGTH`.

Heavy nodes are deferred only when they are visible in the current render window
and outside the active selected/draft ancestor path.

## Acceptance Evidence

Phase 66 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- the sandbox source guard reads `viewportLazyDetail.js`;
- lazy-detail ownership is checked for source/mode/default thresholds and
  DOM-free behavior;
- `browser.lazyViewportHeavyDetail` is exposed as a generated action lane;
- app rendering consumes lazy-detail plans and exposes status;
- heavy table/columns nodes are deferred when inactive;
- active selected/draft ancestors are materialized instead of deferred.

## Explicit Non-Goals

Phase 66 does not implement a lazy detail API:

- no backend/API route;
- no async hydration;
- no node-aware jump-to-node;
- no production recycled DOM pool;
- no caret-aware scroll anchoring;
- no structural packet engine;
- no rich text or contenteditable mapping;
- no live-layout renderer;
- no persistence;
- no package/document version change.
