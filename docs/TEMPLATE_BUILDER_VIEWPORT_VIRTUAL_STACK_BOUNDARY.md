# Template Builder Viewport Virtual Stack Boundary

Status: Phase 65 implementation boundary.

Phase 65 makes the sandbox canvas consume the render shell through a section
virtual stack. The canvas mounts only rendered-window section articles and uses
spacer items for off-window sections so scroll geometry can survive without
mounting the whole document.

## Purpose

Phase 64 can automatically request a budgeted render window. Phase 65 makes
that request visible in renderer consumption:

- rendered sections become mounted section items;
- off-window shell sections become virtual spacer items;
- spacer height comes from the section offset/spacer model;
- the canvas reports mounted section count separately from render-shell section
  count;
- the full render shell remains the semantic source of section order and
  placeholder state.

## Module Owner

`examples/template-builder-sandbox/public/viewportVirtualStack.js` owns:

- `VIEWPORT_VIRTUAL_STACK_SOURCE`;
- `VIEWPORT_VIRTUAL_STACK_MODE`;
- `DEFAULT_VIRTUAL_SECTION_HEIGHT`;
- `createViewportVirtualStack(...)`.

The module must stay browser-safe: no DOM reads, no event binding, no timers, no
transport, no app state, no persistence, and no renderer-node mutation policy.

## App Boundary

`examples/template-builder-sandbox/public/app.js` remains the browser renderer
coordinator:

- it builds a virtual stack from `renderModel.renderShell` and the current
  section offset index;
- it renders section items as page articles;
- it renders spacer items as invisible `virtual-section-spacer` blocks;
- it keeps page measurement on mounted section articles only;
- it reports `Virtual stack: ...` in the status bar.

`app.js` must not compute virtual spacer ranges or decide mounted section ids by
itself.

## Geometry Rules

The virtual stack preserves section geometry at section granularity:

- contiguous hidden shell sections collapse into one spacer item;
- spacer height is the hidden range from first hidden section top to last hidden
  section bottom;
- existing CSS grid gaps provide the boundary gap before/after each spacer;
- if offset facts are missing, the stack falls back to mounting all shell
  sections so measurement can bootstrap safely.

This is not final production virtualization. It is a renderer-consumption
boundary that makes later lazy detail and node-aware anchoring possible.

## Acceptance Evidence

Phase 65 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- the sandbox source guard reads `viewportVirtualStack.js`;
- virtual stack ownership is checked for source/mode and DOM-free behavior;
- `browser.virtualizeViewportSections` is exposed as a generated action lane;
- app rendering consumes virtual stack items and exposes virtual stack status;
- hidden sections collapse into top/bottom spacer items;
- missing offsets fall back to mounting all sections.

## Explicit Non-Goals

Phase 65 does not implement the remaining viewport line:

- no lazy heavy-detail route;
- no node-aware anchor or jump-to-node;
- no recycled DOM pool;
- no caret-aware scroll anchoring;
- no structural packet engine;
- no rich text or contenteditable mapping;
- no live-layout renderer;
- no persistence or API route;
- no package/document version change.
