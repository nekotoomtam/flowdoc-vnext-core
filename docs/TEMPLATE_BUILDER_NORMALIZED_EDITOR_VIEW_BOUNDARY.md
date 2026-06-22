# Template Builder Normalized Editor View Boundary

Status: Phase 45 implementation boundary.

Phase 45 adds the first browser-side normalized editor view for the
template-builder sandbox. The sandbox still boots from the existing full
snapshot, but active lookup and render traversal now have a lookup-first view
owned by a separate browser module.

## Purpose

The previous browser cache already built `nodeById`, but rendering still walked
the recursive snapshot tree directly. That was fine for early proof-of-life
work, but it would become a scale trap if every future selection, scroll,
inspector read, or render pass depended on tree traversal.

The Phase 45 flow is:

```text
GET /api/snapshot
  -> tree-shaped boot snapshot
  -> createEditorView(...)
  -> nodeById / parentById / childrenById / visibleNodeIds
  -> render and selection read through editor view helpers
```

Phase 45 packet application still patched the tree-shaped snapshot view model,
then rebuilt the normalized view from the updated snapshot. Phase 50 now lets
bounded text packets update the runtime store directly before rebuilding the
normalized view facts.

## Implemented Module

`examples/template-builder-sandbox/public/editorView.js` owns:

- `createEditorView(...)`;
- `getEditorViewNode(...)`;
- `getEditorViewParent(...)`;
- `getEditorViewChildren(...)`;
- `getEditorViewSectionRootNodes(...)`.

The module has no DOM dependency and can run in browser or Node tests.

## Indexes

The editor view currently derives:

- `nodeById`;
- `parentById`;
- `childrenById`;
- `sectionById`;
- `zoneById`;
- `sectionIdByNodeId`;
- `zoneIdByNodeId`;
- `rootZoneIdsBySectionId`;
- `nodeOrder`;
- `visibleNodeIds`;
- `visibleRange`;
- `dirtyNodeIds`;
- `changedNodeIds`;
- `changedSubtreeIds`.

In Phase 45, `visibleNodeIds` was introduced as a contract slot. Phase 47 moves
that slot behind `public/visibleRange.js`; default editor views now report a
bounded `section-window` range instead of an all-node placeholder. This is
still not a virtualization claim.

## Runtime Cache

The browser runtime cache now stores the editor view and exposes summary facts
for status/debug output:

- view mode;
- node count;
- visible node count;
- child index count;
- dirty node count;
- packet apply count.

Selection, parent lookup, tree traversal, and canvas traversal use the editor
view helpers. The snapshot tree remains present as a boot/debug view model;
bounded text packets now update the runtime store directly.

Phase 46 moves runtime-cache creation and packet application into
`public/runtimeCache.js`. The normalized editor view remains owned by
`public/editorView.js`, while boot, refresh, and packet-triggered rebuilds are
coordinated by the runtime-cache module instead of the app shell.

Phase 47 moves visible-range calculation into `public/visibleRange.js`.
`createEditorView(...)` passes editor indexes to that module and stores both
the resolved `visibleRange` and its `nodeIds`.

Phase 48 adds `visibleRangeRequest` to the editor view. The request records why
the range was asked for and which budget/anchor should be resolved, while
`visibleRange` remains the resolved node-id output.

Phase 49 moves structural traversal and lookup index construction into
`public/runtimeStore.js`. `editorView.js` now consumes `runtimeStore` and owns
only editor-view facts such as dirty ids, changed ids, visible range requests,
and resolved visible ranges.

## Scale Direction

This phase makes the long-term path explicit:

- find nodes by id first;
- follow parent/children indexes for traversal;
- keep visible ranges as ids;
- apply packets by changed ids;
- load or derive heavy details only for selected, visible, or dirty scopes.

The implementation still renders all nodes because viewport windowing is a
future phase. The important change is that the runtime now has the normalized
shape that windowing and lazy detail can build on.

## Acceptance Evidence

Phase 45 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- `editorView.js` builds the expected indexes from the sandbox snapshot;
- section root zones and child traversal resolve through index helpers;
- parent and visible node counts are available without walking the tree from
  the test;
- `app.js` imports the editor view module and renders through helper calls;
- the action lane exposes `browser.createNormalizedEditorView`.

Phase 47 extends the same tests to prove default views use `section-window`,
explicit bounded ranges can be resolved without DOM access, and `visibleNodeIds`
comes from `public/visibleRange.js`.

## Non-Goals

Phase 45 does not implement:

- viewport virtualization;
- lazy detail routes;
- structural packet patching without snapshot tree patching;
- rich text editing;
- key/field chips;
- contenteditable DOM mapping;
- language-specific IME behavior;
- concrete live layout rendering;
- save/publish persistence;
- backend API routes outside the sandbox dev server;
- package/document version changes.
