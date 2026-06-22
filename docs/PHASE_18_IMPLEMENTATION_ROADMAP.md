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
- Split implementation by real responsibility boundaries before files become
  state/event/render/transport/diagnostic catch-alls.
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

## Phase 32: Explicit Text Action Boundary

Goal:

- move from whole-block replacement only to one granular text transaction
  action without starting DOM caret or IME work.

Deliverables:

- `sandbox.insertPlainTextAtEnd` bridge action;
- sandbox server route for insert text at end;
- `text.insert` core transaction call through the public package boundary;
- packet response for accepted and rejected insert actions;
- inspector command that uses the existing browser runtime cache;
- text action boundary documentation;
- root boundary tests.

Acceptance:

- replace-block action still works;
- append-text action changes only the selected text block;
- packet responses remain bounded and cache-consumable;
- field-ref or other atomic text blocks stay rejected in this phase;
- no DOM caret mapping, IME composition, browser-derived ranges, live layout
  renderer, persistence, or non-sandbox API route is claimed.

## Phase 33: Sandbox Authoring History Boundary

Goal:

- connect visible sandbox mutations to the vNext authoring intent history
  contract before undo/redo or caret typing work.

Deliverables:

- in-memory authoring history records owned by the sandbox mutation bridge;
- accepted bridge transactions appended through
  `appendVNextAuthoringIntentHistoryResult(...)`;
- bounded `authoringHistory` summary on snapshots and change packets;
- browser inspector and status readouts for history record/group counts;
- action lane entries for history, undo, and redo readiness;
- history boundary documentation;
- root boundary tests.

Acceptance:

- replace-block and append-text actions both create undoable history summaries;
- packet responses carry history summary without a full snapshot tree;
- browser cache updates history from packet responses;
- pre-core validation rejections remain packet issues and do not pretend to be
  durable history;
- undo/redo execution, inverse replay, focus restoration, persistence,
  DOM caret mapping, IME composition, live layout renderer, and non-sandbox API
  routes remain deferred.

## Phase 34: Sandbox Undo Redo Execution Boundary

Goal:

- make sandbox text mutation undo/redo executable through bounded patches
  before caret typing, durable persistence, or structural history work.

Deliverables:

- in-memory undo and redo stacks for accepted sandbox text mutations;
- bounded text patch records containing target id, before text, and after text;
- sandbox server routes for undo and redo;
- undo/redo bridge execution through `text.range.replace`;
- packet responses for accepted and rejected undo/redo actions;
- browser inspector controls that use the existing packet cache path;
- undo/redo boundary documentation;
- root boundary tests.

Acceptance:

- accepted replace-block and append-text actions can be undone and redone;
- undo/redo packet responses remain bounded and omit the full `sections` tree;
- empty undo/redo stacks reject without changing revision;
- new accepted text edits clear the redo stack;
- no full package snapshot history, durable persistence, structural replay,
  keyboard shortcut handling, DOM caret mapping, IME composition, live layout
  renderer, or non-sandbox API route is claimed.

## Phase 35: Sandbox Live Layout Request Boundary

Goal:

- connect accepted sandbox text mutations to the existing live-layout boundary
  so the visible shell can carry bounded live-layout invalidation summaries
  before caret typing, viewport scheduling, or a live renderer.

Deliverables:

- `liveLayout` summary in sandbox snapshots;
- `liveLayout` summary in packet-only mutation responses;
- mutation bridge call to `resolveVNextLiveLayoutBoundary(...)` using the
  committed text transaction dirty scope;
- request counting for accepted layout requests only;
- browser inspector and status consumption through the existing runtime cache;
- live-layout boundary documentation;
- root boundary tests.

Acceptance:

- accepted replace, append, undo, and redo actions report a `text-content`
  live-layout request scoped to the affected text block and parent;
- rejected actions do not increment the live-layout request count;
- packet responses remain bounded and omit the full `sections` tree;
- exact generation is marked stale only as a freshness marker and exact layout
  remains `not-run`;
- no live layout renderer, text measurement cache, viewport scheduler, DOM
  caret mapping, IME composition, save/publish persistence, or non-sandbox API
  route is claimed.

## Phase 36: WYSIWYG Text Draft Design Lock

Goal:

- lock the WYSIWYG document-editor direction before implementing visible text
  drafts, so the next phase does not collapse into an inspector textbox or a
  plain-string editor that blocks rich text, inline fields, caret, IME, and
  layout work.

Deliverables:

- WYSIWYG draft design-lock document;
- explicit truth-layer contract for browser draft, browser cache, mutation
  bridge working package, and canonical package;
- text-block content contract that forbids silent flattening of inline content;
- editable eligibility and guarded-block policy;
- draft lifecycle and conflict policy;
- rich text return list tied to future transaction/runtime work.

Acceptance:

- the next implementation phase can edit on the document canvas without making
  browser draft state canonical truth;
- atomic/rich/mixed text blocks have a guard path before full rich editing;
- history, undo/redo, and live-layout summaries remain commit-owned;
- exact layout, artifact rendering, save/publish, full caret mapping, and IME
  remain out of active typing until explicitly phased.

## Phase 37: WYSIWYG Text Draft Boundary

Goal:

- implement the first visible document-position text draft on the sandbox
  canvas while keeping browser draft state separate from canonical package
  truth.

Deliverables:

- browser-local draft state for one safe text block at a time;
- full `plainText` snapshot fact for draft source text instead of truncated
  `textPreview`;
- WYSIWYG draft eligibility facts and guard reasons for atomic or styled inline
  content;
- canvas draft editor with commit/cancel controls;
- inspector/status draft state;
- commit through the existing mutation bridge packet route;
- conflict check against the draft base document revision.

Acceptance:

- safe text blocks can be edited in document position on the canvas;
- active typing updates local draft state without full app render per keypress;
- committed drafts flow through `replace-text?response=packet` and the browser
  cache applies the returned packet;
- rejected or conflicted commits preserve the draft text;
- field refs, page numbers, line breaks, and styled runs remain guarded instead
  of flattened;
- direct bridge actions and undo/redo are blocked while a browser draft is
  active.

## Phase 38: Draft Selection Boundary

Goal:

- give active WYSIWYG drafts a browser-local selection range contract before
  rich text toolbar, inline range commands, IME, or full DOM caret mapping.

Deliverables:

- draft state fields for `selectionStart`, `selectionEnd`,
  `selectionDirection`, and `selectionSource`;
- textarea event handling for focus, click, mouseup, keyup, select, and input;
- canvas, inspector, and status bar labels for the active draft range;
- source/test evidence that selection range state remains browser-local and is
  not persisted into generated snapshots or canonical package data;
- action lane for `browser.trackDraftSelection`.

Acceptance:

- active draft selection updates without full app re-render per selection
  change;
- collapsed and non-collapsed selections are visible to the user;
- draft commits still send only text and target text-block id through the
  mutation bridge packet route;
- selection-only changes do not create history records, dirty scopes, live
  layout requests, or canonical document mutations.

## Phase 39: Draft Command Context Boundary

Goal:

- derive a browser-local command context from active draft selection before
  executing text, key, or rich inline commands.

Deliverables:

- command surface and target text-block id;
- base document revision;
- selection start/end/length and collapsed status;
- selected, before-selection, and after-selection bounded previews;
- readiness for `text.insert`, `text.replaceSelection`,
  `inline.fieldRef.insert`, and `inline.style.patch`;
- canvas, inspector, and status bar command-context labels;
- action lane for `browser.deriveDraftCommandContext`;
- source/test evidence that command context remains browser-local and does not
  enter generated snapshots or canonical package state.

Acceptance:

- command context updates from draft selection without full app re-render;
- collapsed selection marks insertion ready and replace guarded;
- non-collapsed selection can mark replace ready;
- key and style commands remain planned/guarded until their own phases;
- draft commit continues to send only text and target text-block id through the
  mutation bridge packet route.

## Phase 40: Draft Text Command Boundary

Goal:

- execute the first browser-local text commands from active draft command
  context without adding a new bridge route or mutating canonical state before
  commit.

Deliverables:

- draft command text browser state;
- inspector command text input;
- `text.insert` command button for active drafts;
- guarded `text.replaceSelection` command button for non-empty draft ranges;
- browser-local command application that updates only draft text, selection,
  status, and message;
- action lane for `browser.applyDraftTextCommand`;
- source/test evidence that command text stays out of generated snapshots and
  persistence still goes through the existing draft commit bridge.

Acceptance:

- insert text applies to the active draft without a fetch;
- replace-selection stays disabled/guarded for collapsed ranges;
- applied command text marks the draft dirty and collapses selection after the
  inserted text;
- commit still sends the whole draft through
  `/api/actions/replace-text?response=packet`;
- no key insertion, rich inline patching, IME lifecycle, or live layout render
  is added in this phase.

## Phase 41: Draft Selection/Caret Hardening

Goal:

- make active textarea draft selection and caret movement reliable enough for
  plain text insert and replace-selection commands before rich DOM selection
  mapping.

Deliverables:

- browser-local selection range setter;
- inspector start/end range inputs;
- cursor start, cursor end, and select-all actions;
- clamped selection offsets based on active draft text length;
- command readiness updates from range controls as well as textarea events;
- focus restoration to the draft editor after applying text commands;
- action lane for `browser.setDraftSelectionRange`;
- source/test evidence that range controls remain browser-local and do not
  enter generated snapshots, history, live layout, or bridge routes.

Acceptance:

- select-all marks replace-selection ready for an active draft;
- replace-selection applies to the selected draft range without a fetch;
- selection-only changes do not change document revision, mutation count,
  history, or live-layout request count;
- committed draft text still persists only through
  `/api/actions/replace-text?response=packet`;
- rich DOM mapping, key insertion, `inline.style.patch`, and IME lifecycle
  remain future phases.

## Phase 42: Draft IME Composition Boundary

Goal:

- add a browser-local IME composition guard for active textarea drafts before
  language-specific IME handling, rich DOM selection mapping, or per-keystroke
  core transactions.

Deliverables:

- draft composition state fields for active drafts;
- `compositionstart`, `compositionupdate`, and `compositionend` listeners;
- visible IME/composition status in canvas, inspector, and status bar;
- command and range controls disabled while composition is active;
- draft commit disabled and guarded while composition is active;
- action lane for `browser.trackDraftComposition`;
- source/test evidence that composition state remains browser-local and does
  not enter generated snapshots, history, live layout, or bridge routes.

Acceptance:

- active composition marks draft status as composing;
- insert, replace-selection, range controls, and commit are guarded while
  composition is active;
- compositionend returns the draft to normal editing with draft text preserved;
- selection-only or composition-only state does not change document revision,
  mutation count, history, or live-layout request count;
- commit still persists only through `/api/actions/replace-text?response=packet`.

## Phase 43: Editor UX North Star And Normalized View Constraint

Goal:

- lock the visible web editor as the product north star and prevent recursive
  tree snapshots from becoming the active large-document runtime shape.

Deliverables:

- Phase 43 status for `docs/EDITOR_UX_NORTH_STAR.md`;
- minimum WYSIWYG contract for document-position editing, browser-local
  interaction state, operation-backed commits, and bounded packet updates;
- normalized editor view constraint for `nodeById`, `parentById`,
  `childrenById`, visible ranges, flattened node order, dirty ids, and changed
  subtree ids;
- lazy heavy-detail policy for inline runs, measured geometry, diagnostics,
  history detail, live-layout detail, and exact-generation metadata;
- alignment in frontend runtime, large-document, and browser cache boundary
  docs;
- source/test evidence that the north-star constraint remains documented.

Acceptance:

- canonical authored nodes may still own semantic ordered child ids;
- full tree snapshots are allowed only as boot/debug/early sandbox shapes;
- active typing, selection, scroll, and inspector lookup are constrained toward
  normalized/lazy indexes;
- no new browser runtime implementation, route, persistence, rich text editor,
  or package version change is claimed.

## Phase 44: Modular Responsibility Contract

Goal:

- prevent vNext editor/runtime work from growing into monolithic files that own
  unrelated behavior concerns.

Deliverables:

- `docs/MODULAR_RESPONSIBILITY_CONTRACT.md` as the Phase 44 responsibility
  split boundary;
- working-agreement rule for responsibility-sliced implementation;
- editor north-star alignment that forbids one runtime file from owning state,
  events, commands, transport, packet application, rendering, layout
  reconciliation, and diagnostics together;
- roadmap and ledger entries for the modularity guard;
- source/test evidence that future work keeps the guard documented.

Acceptance:

- future phases must identify which module owns new behavior and which file is
  only coordinating it;
- coordinator files remain thin and delegate to responsibility-specific
  modules;
- the current sandbox browser file remains a temporary exception, not the
  production editor runtime shape;
- no refactor, route, package version change, or production editor package is
  claimed in this phase.

## Later Phases

Goal:

- continue from the accepted phase sequence after the core contracts prove
  stable.

Possible later work:

- rich inline range mapping beyond the textarea draft boundary;
- durable caret and browser selection mapping;
- IME composition boundary;
- required rich text return list: inline style patching, style-preserving
  insert/delete/replace, rich selection toolbar state, atomic field chips inside
  mixed text, style-aware history grouping, and style-aware live-layout
  invalidation;
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
