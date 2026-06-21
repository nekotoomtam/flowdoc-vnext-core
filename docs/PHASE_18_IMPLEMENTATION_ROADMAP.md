# Phase Implementation Roadmap

Status: draft phase roadmap for the template authoring architecture reset.

This roadmap turns the Phase 18 design reset into phase-sized implementation
work. The agent may split work internally as needed, but owner-facing planning
and reporting should happen at the phase level. Do not report alphabetic lanes,
decimal phases, or checklist fragments as completed product milestones.

This roadmap does not authorize package/document version changes, legacy
compatibility, key history storage, repeat regions, API replacement, or visible
editor runtime integration by itself.

## Parent Direction

Build a dynamic node-based docgen template builder with:

- one shared template core;
- one frontend authoring runtime profile;
- one backend generation runtime profile;
- one canonical package/document model;
- large-document performance as an acceptance condition.

## Roadmap Principles

- Start with contracts and pure helpers before runtime UI code.
- Keep every patch small and reversible.
- Add tests before claiming behavior.
- Prefer browser-safe and Node-safe shared contracts.
- Do not copy the old editor runtime.
- Do not let exact generation layout become the active typing path.
- Do not add node types for role/style/workflow variants.
- Report phase completion only when the phase acceptance is actually met.
- Pause for owner direction only when a phase requires a product or
  architecture decision that cannot be safely inferred.

## Phase 18: Template Authoring Architecture Reset

Goal:

- lock the shared template authoring direction in docs before implementation
  resumes.

Deliverables:

- template authoring core plan;
- shared core contract;
- node family capability model;
- frontend authoring runtime plan;
- text editing transaction plan;
- live layout versus exact generation plan;
- key registry binding plan;
- backend generation runtime plan;
- large-document performance contract;
- legacy reference lessons;
- phase implementation roadmap.

Acceptance:

- design reset is visible from `README.md` and `docs/PHASE_LEDGER.md`;
- old FlowDocEditor remains reference evidence only;
- the next implementation phase can start without using old runtime
  architecture as source of truth.

## Phase 19: Key Registry And Data Diagnostics

Goal:

- make key registry and data snapshot validation first-class in vNext terms.

Deliverables:

- collect inline `field-ref` usages from canonical document v3;
- validate package-level registry keys;
- validate scalar data snapshot values;
- produce generation-readiness diagnostics without binding output mutation.

Tests:

- duplicate keys;
- missing registry definition warning;
- invalid inline target type error;
- invalid scalar data type error;
- missing required value policy if required fields are added;
- field references inside table cells.

Acceptance:

- values remain outside `DocumentNode`;
- generated/resolved values are not written into authored text;
- key history remains deferred;
- package parser behavior remains canonical-only;
- `npm run check` remains green.

## Phase 20: Editable Authoring Session

Goal:

- introduce a pure editable-session boundary that can run in browser or tests
  without React/DOM dependencies.

Deliverables:

- `createVNextEditableSession(...)` over canonical package input;
- working document reference;
- graph/key diagnostics;
- revision counter;
- dirty scope set;
- selection type definitions as session-only data;
- no live layout yet.

Tests:

- creates session from package v2/document v3;
- rejects raw/current document input;
- initializes revision and dirty scope;
- keeps selection outside serialized package;
- remains parent-runtime independent.

Acceptance:

- no visible editor integration;
- no layout/export behavior changes;
- session state is not persisted by package serialization;
- `npm run check` remains green.

## Phase 21: Text Transaction Engine

Goal:

- define and test granular text transactions before using them in UI.

Deliverables:

- text position/range helpers;
- plain text projection over inline children;
- `text.insert`;
- `text.delete`;
- `text.range.replace`;
- `inline.field-ref.insert`;
- transaction result with dirty scope and history intent.

Tests:

- insert/delete in a plain text block;
- replace selected range;
- insert field-ref as atomic inline;
- reject editing inside field-ref as plain text;
- one transaction reports text-block dirty scope;
- existing `text-block.text.replace` still works.

Acceptance:

- keystroke path no longer requires whole-block replacement as the only design;
- no exact pagination is invoked by text transaction tests;
- `npm run check` remains green.

## Phase 22: Intent History

Goal:

- model history groups for typing and structural intents without tying them to
  frontend reducer state.

Deliverables:

- transaction group id;
- history intent metadata;
- coalescing policy contract for typing sessions;
- rejected transaction diagnostics.

Tests:

- repeated text inserts can share a group;
- paste creates one group;
- field insert creates one group;
- selection-only changes are non-durable;
- rejected transactions do not mutate document.

Acceptance:

- undo/redo policy is described by core metadata;
- frontend-specific focus restoration remains outside shared core;
- `npm run check` remains green.

## Phase 23: Live Layout Boundary

Goal:

- introduce live-layout inputs/outputs without replacing measured pagination.

Deliverables:

- live layout request type;
- visible range type;
- layout freshness status;
- live layout dirty-scope response;
- exact layout stale marker.

Tests:

- selection impact creates no layout request;
- text impact scopes to text-block/parent;
- table impact scopes to table;
- exact generation stale flag is explicit.

Acceptance:

- no export readiness uses live layout as final truth;
- existing `runVNextLayoutPipeline(...)` behavior remains unchanged;
- `npm run check` remains green.

## Phase 24: Backend Generation Runtime

Goal:

- define API-facing generation runtime without replacing parent routes.

Deliverables:

- generation request parser;
- generation diagnostic result;
- template package plus data validation;
- optional readiness-only runtime function.

Tests:

- canonical package request accepted;
- raw/current document request rejected;
- data validation reported separately from package errors;
- no artifact rendered in readiness-only phase;
- generated output is not returned as authored document state.

Acceptance:

- future API can build on the runtime;
- no current `/api/paginate` or `/api/export` replacement in this phase;
- `npm run check` remains green.

## Phase 25: Large Document Acceptance Harness

Goal:

- add tests/fixtures that make large-document behavior visible before UI work.

Deliverables:

- generated large canonical fixture helper;
- operation/transaction stress tests;
- graph/index timing diagnostics where stable enough;
- no browser dependency in first core harness.

Tests:

- hundreds of text blocks;
- table with many rows;
- text transaction near the start does not require exact pagination;
- text transaction near the end reports narrow dirty scope;
- exact generation remains explicit.

Acceptance:

- performance constraints are test-visible;
- no implementation may silently reintroduce whole-document typing work;
- `npm run check` remains green.

## Phase 26: Runtime Usage Map And Action/Job Contract

Goal:

- design the real frontend/backend usage shape before visible UI or route work.

Deliverables:

- runtime usage map for frontend template builder and backend generation;
- structural editor shell map;
- state ownership map across frontend, core, backend, and artifacts;
- action/job/workflow vocabulary;
- AI-callable action policy;
- lane contract for immediate, background-live, deferred-exact, and external
  artifact work;
- stale-work/revision rules for future scheduling.

Acceptance:

- frontend typing is mapped as immediate local/core work plus bounded live
  layout follow-up;
- exact layout/generation remains deferred and cannot enter the keypress path;
- backend generation is mapped as readiness first, artifacts later;
- future AI tools are constrained to approved actions, permission gates, audit
  records, and the same core transaction/job rails as user actions;
- visible UI implementation can start without guessing state ownership;
- no React/DOM, route, scheduler, storage, or renderer implementation is added.

## Phase 27: Template Builder Sandbox Boundary

Goal:

- create a repo-shaped sandbox for the first visible template builder shell
  without moving browser dependencies into the core package.

Deliverables:

- standalone sandbox package under `examples/template-builder-sandbox`;
- package-local build, check, and dev scripts;
- local `@flowdoc/vnext-core` dependency through the package boundary;
- core-backed snapshot bridge for the canonical product fixture;
- static shell regions for toolbar, node tree, canvas/live view, inspector,
  and status;
- extraction boundary documentation;
- root boundary tests.

Acceptance:

- sandbox source imports core through `@flowdoc/vnext-core`, not root `src/**`;
- root package scripts and dependencies remain core-only;
- the browser shell runs from the sandbox package;
- generated/editor-only state remains outside canonical package data;
- no real typing, live layout renderer, backend route, or persistence is
  claimed in this phase.

## Phase 28: Structure Selection First

Goal:

- make node selection and inspector context useful before adding typing.

Deliverables:

- snapshot relationship facts for section, zone, parent, path, children,
  surface, and capabilities;
- browser-only selected node state;
- tree/canvas/inspector/status synchronization;
- nested canvas selection that chooses the nearest clicked node;
- inspector sections for context, path, capabilities, children, fields, and
  action states;
- action-state vocabulary for `wired`, `planned`, and `blocked`;
- interaction boundary documentation;
- root boundary tests.

Acceptance:

- selection state remains outside canonical package data and generated
  snapshot persistence;
- inspector uses core-derived snapshot facts, not DOM-derived document truth;
- planned or blocked actions are not executable;
- no real text editing, live layout renderer, route, or persistence is claimed.

## Phase 29: One Safe Mutation Path

Goal:

- prove one browser-to-bridge-to-core mutation path before fluid typing.

Deliverables:

- in-memory sandbox mutation bridge;
- `GET /api/snapshot` for current working snapshot;
- `POST /api/actions/replace-text` for selected plain text-block replacement;
- core-backed `text.range.replace` transaction;
- refreshed snapshot response after accepted or rejected mutations;
- mutation bridge status in the snapshot and status bar;
- browser control for the safe replace action;
- mutation bridge boundary documentation;
- root boundary tests.

Acceptance:

- browser code does not mutate canonical document JSON directly;
- mutation bridge imports core through `@flowdoc/vnext-core`;
- only plain text-blocks can be replaced in this phase;
- rejected mutations do not change the working package;
- no per-keystroke typing, caret mapping, persistence, live layout renderer, or
  non-sandbox API route is claimed.

## Phase 30: Snapshot Delta Boundary

Goal:

- add a bounded mutation response shape before per-keystroke typing work makes
  full snapshot responses too expensive.

Deliverables:

- change packet type for sandbox mutation responses;
- packet-only response mode for `POST /api/actions/replace-text`;
- changed node summaries without complete `sections` snapshot payload;
- dirty scopes and revision metadata in the packet;
- current browser snapshot path preserved as the default;
- delta boundary documentation;
- root boundary tests.

Acceptance:

- existing snapshot mutation response still works;
- packet mode omits the full snapshot tree;
- changed node ids and dirty scopes come from the core mutation path;
- rejected packet responses do not change revisions or working package state;
- no browser normalized cache, per-keystroke typing, live layout renderer,
  persistence, or non-sandbox API route is claimed.

## Phase 31: Browser Runtime Cache Boundary

Goal:

- make the sandbox browser consume change packets after boot instead of using
  full snapshot responses as the active mutation path.

Deliverables:

- browser runtime cache built from the boot snapshot;
- node id lookup for selection and inspector reads;
- packet-only bridge action request from the browser;
- packet apply path that updates changed node summaries, revisions,
  diagnostics, mutation metadata, and dirty scope count;
- revision guard with snapshot refresh fallback;
- cache status in the shell;
- browser cache boundary documentation;
- root boundary tests.

Acceptance:

- `GET /api/snapshot` remains the boot path;
- mutation UI asks for `?response=packet`;
- browser source does not read mutation `result.snapshot`;
- packet apply keeps browser cache derived from, not equal to, canonical
  package truth;
- no per-keystroke typing, DOM caret mapping, live layout renderer,
  persistence, structural packet operation, or non-sandbox API route is
  claimed.

## Later Phases

Goal:

- continue from the accepted phase sequence after the core contracts prove
  stable.

Possible later work:

- visible editor integration;
- concrete API route work;
- exact renderer adapters;
- repeat/collection design;
- key history design;
- collaborative/session storage design.

## First Recommended Implementation Phase

Start with Phase 19 or Phase 20.

Recommended first phase:

```text
Phase 19: Key Registry And Data Diagnostics
```

Reason:

- docgen depends on key correctness;
- existing package schema already has `fields` and optional `data`;
- diagnostics are pure core behavior;
- it does not require visible editor runtime or layout rewrites;
- it strengthens the template/data separation before authoring sessions mutate
  anything.

Alternative first phase:

```text
Phase 20: Editable Authoring Session
```

Reason:

- it establishes the frontend runtime as first-class;
- it can be pure and testable;
- it prepares the path for granular text transactions.

## Explicit Non-Work

Do not start these without a separate accepted design:

- key history persistence;
- repeat region expansion;
- collection binding;
- collaborative editing;
- concrete PDF/DOCX renderer rewrites;
- parent app runtime flip;
- replacing current parent API routes;
- copying old WYSIWYG runtime layers;
- accepting old/prototype document shapes in exported core.

## Review Output For Phase Work

Every phase completion or blocker report should include:

- PASS;
- FAIL / BLOCKER;
- RISK;
- UNKNOWN;
- files changed;
- behavior changed;
- tests run;
- risks left;
- intentionally not changed.
