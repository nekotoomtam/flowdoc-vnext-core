# Live Layout And Exact Generation Plan

Status: Phase 23 baseline implemented for the pure live-layout boundary.

vNext needs two layout profiles over one shared document model:

- live layout for responsive browser authoring;
- exact generation layout for API/export artifacts.

These profiles share schema, graph, measurement contracts, and invalidation
metadata, but they optimize for different latency requirements.

## Decision

```text
Frontend live layout
  fast / partial / viewport-first / dirty-scope based / authoring-only

Backend exact generation layout
  deterministic / complete / artifact-ready / API-safe
```

Live layout must not be treated as export-ready by default. Exact generation
must not be required for every keystroke.

## Phase 23 Baseline

The current baseline defines the boundary contract only:

- `resolveVNextLiveLayoutBoundary(...)` turns selection impact,
  authoring-history records, or dirty scopes into either no layout work or a
  live-layout request.
- selection-only impact returns no layout request and leaves exact generation
  unchanged.
- text dirty scopes produce `text-content` requests scoped to the text block
  and parent node.
- table dirty scopes produce `table-region` requests scoped to the table and
  parent node.
- layout requests carry visible range, affected scope, live layout freshness,
  and exact generation freshness.
- exact generation freshness always names `measured-pagination` as the final
  truth.

The baseline does not execute layout, measure text, update DOM viewport state,
or feed export readiness from live layout.

## Live Layout Responsibilities

Live layout owns:

- visible page/window planning;
- dirty-scope updates;
- local text draft geometry;
- approximate or cached measurement during active typing;
- viewport continuity;
- editor-only layout pending status;
- handoff to exact layout after idle/commit/export request.

Live layout must not own:

- final PDF/DOCX page breaks;
- persistent pagination output;
- renderer artifact truth;
- generated output storage;
- authored document mutation.

## Exact Generation Layout Responsibilities

Exact layout owns:

- full document layout for a template/data/profile input;
- deterministic measurement;
- page breaks;
- repeated table headers;
- generated TOC/page-number resolution;
- renderer command artifacts;
- export readiness.

Exact layout must not own:

- active caret state;
- live typing input feedback;
- DOM selection;
- local draft buffers;
- browser viewport scrolling decisions.

## Shared Inputs

Both profiles consume:

- canonical document structure;
- relationship graph;
- node capabilities;
- key-bound runtime view when previewing/generating data;
- measurement profile contracts;
- invalidation scopes from operations/transactions.

## Dirty Scope Model

Each operation should declare a layout impact:

| Impact | Example | Live layout response |
|---|---|---|
| none | selection | no layout work |
| visual | text color | repaint existing visible fragments |
| text | type/delete | remeasure affected text-block and downstream visible flow |
| block | insert/delete block | update parent flow and visible downstream range |
| container | resize columns | update container subtree and visible downstream range |
| table | row/column/cell edit | update table region and visible downstream range |
| section | page settings | refresh section layout window |
| document | global style/profile | schedule broader recalculation |

Exact generation can choose fuller recomputation for determinism. Live layout
should start from the smallest safe scope.

## Viewport-First Rendering

Large documents require rendering by visible range:

- page frames may be virtualized;
- offscreen rendered content may be omitted;
- graph and document state remain complete;
- live layout may prioritize visible pages plus buffer;
- exact generation remains available for full output.

Viewport decisions are editor runtime state. They must not alter authored
document data or generation artifacts.

## Settling Model

```text
active typing
  -> live layout updates visible area
  -> exact layout marked stale
idle/commit/export
  -> exact generation layout runs for current template/data
  -> diagnostics compare or replace settled preview state
```

The editor may show "layout pending" or "settling" states. It must not silently
present stale exact export readiness.

## Consistency Rules

- The same authored document and data input should settle to the same exact
  layout regardless of frontend live preview history.
- Live layout may be temporarily approximate, but it must not mutate authored
  state to match its approximation.
- Drift between live and exact layout should be measurable and visible when it
  blocks export.
- Export consumes exact generation artifacts, not live layout caches.

## Implementation Direction

Near-term:

- keep existing measured pagination for exact generation;
- introduce live-layout contracts and invalidation scopes before replacing
  placement internals;
- make text editing emit granular scopes;
- make viewport rendering a frontend runtime concern.

Later:

- move text/table placement behind resumable job results;
- reuse measured fragments where live and exact profiles can safely share;
- add measurement profile parity tests for browser/server drift.
