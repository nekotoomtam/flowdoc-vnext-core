# Large Document Performance Contract

Status: draft architecture reset.

Large-document behavior is not a later optimization. It is a core acceptance
condition for the new architecture.

The old direction nearly worked for normal documents but failed under very
large documents because active editing, rendering, pagination, and
reconciliation were too coupled. vNext must make that failure mode impossible
by design.

## Performance Rules

- A single keystroke must not render the whole document.
- A single keystroke must not exact-paginate the whole document.
- A single keystroke must not rebuild every page fragment.
- Selection-only changes must not trigger layout work.
- Visual-only style changes should avoid geometry recalculation when safe.
- Offscreen pages must not require full DOM/render work.
- Exact generation may be full-document, but it must run outside the active
  typing path.

## Required Mechanisms

### Viewport Windowing

The editor should render visible pages plus a small buffer. Page frames may
remain as scroll placeholders, but detailed content rendering should be
bounded.

### Dirty Scopes

Every authored mutation should emit a dirty scope:

- node;
- parent;
- subtree;
- table;
- section;
- document.

Live layout starts from that scope instead of assuming whole-document work.

### Incremental Indexes

The authoring runtime may rebuild small derived indexes after local edits. Full
graph rebuild remains available for assertion/checkpoint, but it must not be
required for every typing event.

### Local Text Drafts

Active text input uses a local draft buffer. Parent/session document updates
may be coalesced. Exact layout waits for commit or idle boundaries.

### Background Work

Long-running layout, measurement, and generation tasks should be scheduled in
background lanes. Stale results must be ignored if a newer document revision
exists.

### Revision Tracking

Important derived artifacts should carry document/session revisions:

- graph index revision;
- live layout revision;
- exact layout revision;
- bound data revision;
- generation request id.

Stale artifacts must not overwrite newer state.

## Acceptance Scenarios

Large-document tests and smokes should include:

- 500+ text blocks;
- long text blocks that wrap across pages;
- multiple tables with many rows;
- table-cell text editing;
- field references in body and table cells;
- node insertion near the beginning of a long document;
- typing near the end of a long document;
- scrolling while layout is settling;
- undo/redo after a large edit;
- export request after live layout has been dirty.

## Budgets

Exact numeric budgets should be calibrated by implementation, but the contract
starts with these qualitative budgets:

- local typing feedback should feel immediate;
- visible viewport updates should be bounded by visible content, not document
  length;
- exact layout may take longer, but it must be cancellable/stale-safe;
- export readiness must never silently use stale exact layout.

## Instrumentation

The runtime should expose diagnostics for:

- visible node/page count;
- dirty scope size;
- live layout duration;
- exact layout duration;
- stale result drops;
- draft sync delays;
- render count by major surface;
- pagination work units.

Diagnostics observe behavior. They must not become hidden behavior rules.

## Anti-Patterns

- Keypress to full package serialize.
- Keypress to exact export readiness.
- Keypress to complete page command generation.
- Storing paginated fragments in authored document state.
- Re-rendering offscreen pages to keep export readiness fresh.
- Letting stale exact layout replace active live editing state.

## Definition Of Done For Risky Work

Any change that affects typing, layout, pagination, renderer consumption, or
large document startup should state:

- which scopes can become dirty;
- whether exact layout is required;
- whether offscreen rendering is touched;
- how stale work is ignored;
- what large-document test or smoke covers the risk.
