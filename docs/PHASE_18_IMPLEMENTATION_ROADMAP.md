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

## Phase 45: Normalized Editor View Boundary

Goal:

- add the first lookup-first browser editor view so the sandbox no longer
  treats the recursive snapshot tree as the only active traversal shape.

Deliverables:

- browser-safe `public/editorView.js` module;
- normalized indexes for node, parent, children, section, zone, node order,
  visible ids, changed ids, changed subtree ids, and dirty ids;
- runtime cache ownership of the editor view;
- tree and canvas render traversal through editor view helper calls;
- status/debug output for editor view mode and visible/index counts;
- action lane for `browser.createNormalizedEditorView`;
- boundary documentation and root tests.

Acceptance:

- boot still uses the existing full snapshot;
- packet application may still patch the current snapshot view model;
- active selection and render traversal have a normalized lookup path;
- `visibleNodeIds` exists as an all-node placeholder for future viewport
  windowing;
- no virtualization, lazy detail endpoint, rich text, contenteditable mapping,
  live renderer, route, persistence, or package version change is claimed.

## Phase 46: Runtime Cache Module Boundary

Goal:

- split sandbox runtime-cache and packet-apply behavior out of the app shell
  before adding viewport, lazy detail, structural packet, or live renderer
  behavior.

Deliverables:

- browser-safe `public/runtimeCache.js` module;
- boot runtime-state creation helper;
- snapshot refresh runtime-state helper;
- packet validation and packet source checks;
- packet-to-snapshot patch helper for the current sandbox view model;
- packet-to-runtime helper that rebuilds the normalized editor view;
- app shell delegation instead of direct cache/packet ownership;
- boundary documentation and root tests.

Acceptance:

- `app.js` no longer defines `createRuntimeCache`, `replaceChangedNode`, or
  packet revision guards;
- runtime-cache helpers can run in Node tests without DOM access;
- packet application still preserves current sandbox behavior and rebuilds the
  normalized editor view;
- the tree-shaped snapshot patch remains explicitly temporary;
- no viewport virtualization, lazy detail endpoint, structural packet engine,
  rich text, contenteditable mapping, live renderer, route, persistence, or
  package version change is claimed.

## Phase 47: Visible Range Boundary

Goal:

- replace the all-node visible range placeholder with a bounded browser-safe
  visible-range contract before real viewport virtualization or lazy detail.

Deliverables:

- browser-safe `public/visibleRange.js` module;
- default `section-window` visible range;
- explicit `anchorSectionId` and `anchorNodeId` support;
- `maxNodes` truncation and window metadata;
- editor-view integration so `visibleNodeIds` comes from the range contract;
- runtime-cache exposure of visible range facts;
- app status output for range kind and node counts;
- action lane for `browser.resolveVisibleRange`;
- boundary documentation and root tests.

Acceptance:

- default editor views report `section-window`, not `all-nodes`;
- `visibleNodeIds` is bounded for the current fixture while total node count
  remains available;
- runtime-cache packet application preserves the current visible-range request;
- rendering may still show the full sandbox document shell;
- no DOM scroll tracking, viewport measurement, virtualized rendering, lazy
  detail endpoint, structural packet engine, rich text, contenteditable
  mapping, live renderer, route, persistence, or package version change is
  claimed.

## Phase 48: Visible Range Request Boundary

Goal:

- separate visible range intent from resolved visible node ids before adding
  viewport controllers, scroll tracking, lazy detail, or virtualized rendering.

Deliverables:

- browser-safe `public/visibleRangeRequest.js` module;
- request source/version/kind/reason/budget contract;
- boot, selection, draft, selection-preserved, and packet-apply request
  helpers;
- editor-view storage for both `visibleRangeRequest` and `visibleRange`;
- runtime-cache exposure of request facts beside resolved range facts;
- app status output for request reason and anchor;
- action lane for `browser.updateVisibleRangeRequest`;
- boundary documentation and root tests.

Acceptance:

- default editor views report a `boot` request and a resolved
  `section-window` range;
- selection can request the selected node's section without changing the range
  resolver's ownership;
- valid drafts mark the request as draft-preserved;
- packet application preserves the prior request as `packet-apply`;
- explicit `maxNodes` remains a budget override, not a fixed product answer;
- rendering may still show the full sandbox document shell;
- no DOM scroll tracking, viewport measurement, viewport controller,
  virtualized rendering, lazy detail endpoint, structural packet engine, rich
  text, contenteditable mapping, live renderer, route, persistence, or package
  version change is claimed.

## Phase 49: Structural Runtime Store Boundary

Goal:

- move structural browser indexes into a dedicated runtime store below the
  editor view before structural packet application, lazy detail, viewport
  controllers, or virtualized rendering.

Deliverables:

- browser-safe `public/runtimeStore.js` module;
- store source/version/mode contract;
- store-owned `nodeById`, `parentById`, `childrenById`, section, zone,
  section-node, zone-node, root-zone, section-order, and node-order indexes;
- store helper reads for node, parent, children, and section roots;
- editor-view integration so editor facts consume a runtime store instead of
  owning structural traversal;
- runtime-cache exposure of store facts;
- app status output for active store mode/counts;
- action lane for `browser.createStructuralRuntimeStore`;
- boundary documentation and root tests.

Acceptance:

- `runtimeStore.js` can build store indexes in Node without DOM access;
- `editorView.js` no longer owns structural map construction;
- runtime caches carry store source/mode facts through boot and packet apply;
- packet application may still patch the tree-shaped snapshot and rebuild the
  store from that snapshot;
- rendering may still show the full sandbox document shell;
- no direct id-based structural packet application, lazy detail endpoint,
  viewport controller, virtualized rendering, rich text, contenteditable
  mapping, live renderer, route, persistence, or package version change is
  claimed.

## Phase 50: Text Packet Store Apply Boundary

Goal:

- make the existing bounded text-block change packets update the browser
  structural runtime store directly before moving to full structural packet
  application, viewport controllers, lazy detail, or virtualized rendering.

Deliverables:

- store-owned text packet apply helper in `public/runtimeStore.js`;
- `text-packet-direct` apply mode;
- runtime-cache path that applies text packets to the runtime store before
  rebuilding editor-view facts;
- metadata-only snapshot update for revision, mutation bridge, diagnostics,
  authoring history, and live-layout summaries;
- visible-range request preservation that keeps the updated store after packet
  apply;
- app status output for the latest store apply mode;
- action lane for `browser.applyTextPacketToRuntimeStore`;
- boundary documentation and tests.

Acceptance:

- text-block packet application updates `runtimeStore.nodeById` without
  changing store structural indexes;
- unsupported structural child changes are rejected by the text packet store
  helper instead of becoming an accidental structural packet engine;
- runtime-cache packet state reports `text-packet-direct`;
- snapshot metadata advances revisions without treating tree sections as the
  active post-packet content model;
- visible-range changes after a packet preserve the updated store text;
- no structural add/delete/move, lazy detail endpoint, viewport controller,
  virtualized rendering, rich text, contenteditable mapping, live renderer,
  route, persistence, or package version change is claimed.

## Phase 51: Store-Backed Render Boundary

Goal:

- make the sandbox tree/canvas render path consume a store-backed render model
  so active node content comes from the runtime store before viewport
  controllers, lazy detail, or virtualized rendering.

Deliverables:

- browser-safe `public/renderModel.js` module;
- render model source/version/mode contract;
- render section shells that combine snapshot page metadata with runtime-store
  section roots;
- render helper reads for node, children, and section roots;
- app shell integration so tree/canvas/inspector child rows use render-model
  reads instead of walking snapshot section trees;
- app status output for render model mode/counts;
- action lane for `browser.createStoreBackedRenderModel`;
- boundary documentation and tests.

Acceptance:

- render model construction can run in Node without DOM access;
- app rendering does not iterate `snapshot.sections.map` for tree/canvas
  section rendering;
- after a text packet, render model reads changed text from the runtime store
  even if the metadata snapshot still has stale tree text;
- snapshot remains available for template/page/action/diagnostic metadata;
- no DOM scroll tracking, viewport measurement, virtualized rendering, lazy
  detail endpoint, structural add/delete/move packet application, rich text,
  contenteditable mapping, live renderer, route, persistence, or package
  version change is claimed.

## Phase 52: Render Window Boundary

Goal:

- derive the active canvas render window from the store-backed render model and
  visible-range contract before DOM viewport controllers, lazy detail, or
  virtualized renderer scheduling.

Deliverables:

- browser-safe `public/renderWindow.js` module;
- render-window source/version/mode contract;
- render-window section ids, node ids, node count, total count, and windowed
  metadata;
- render-model integration so window facts sit beside full store-backed model
  facts;
- canvas traversal helpers that filter section roots and children through the
  active render window;
- app status output for render-window mode/counts;
- action lane for `browser.resolveRenderWindow`;
- boundary documentation and tests.

Acceptance:

- render-window construction can run in Node without DOM access;
- render-window facts are derived from the visible-range contract;
- canvas traversal consumes render-window helpers instead of deciding active
  sections in `app.js`;
- full store-backed render-model section metadata remains available for
  navigation/debug;
- no DOM scroll tracking, viewport measurement, virtualized renderer
  scheduling, hidden/offscreen pruning scheduler, lazy detail endpoint,
  structural add/delete/move packet application, rich text, contenteditable
  mapping, live renderer, route, persistence, or package version change is
  claimed.

## Phase 53: Viewport Request Boundary

Goal:

- define the DOM-free viewport facts and request resolver that future scroll
  controllers must use before DOM measurement or virtualized rendering is
  wired.

Deliverables:

- browser-safe `public/viewportController.js` module;
- viewport controller source/version/mode contract;
- viewport fact normalization for anchors, scroll positions, viewport size,
  overscan, and visible-range budgets;
- resolver that outputs existing `visibleRangeRequest` records;
- preserved-draft behavior so viewport movement does not replace a protected
  draft range;
- action lane for `browser.resolveViewportRangeRequest`;
- boundary documentation and tests.

Acceptance:

- viewport request construction can run in Node without DOM access;
- viewport facts produce a visible-range request that runtime cache and render
  window can consume;
- draft-preserved visible ranges remain stable when viewport requests arrive;
- `app.js` does not own viewport request policy or DOM scroll binding in this
  phase;
- no DOM scroll tracking, viewport measurement, spacer/virtual list,
  virtualized renderer scheduling, hidden/offscreen pruning scheduler, lazy
  detail endpoint, structural add/delete/move packet application, rich text,
  contenteditable mapping, live renderer, route, persistence, or package
  version change is claimed.

## Phase 54: Render Shell / Placeholder Boundary

Goal:

- keep every document section represented in the canvas while detailed node
  content remains bounded to the active render window.

Deliverables:

- browser-safe `public/renderShell.js` module;
- render-shell source/version/mode contract;
- section shell records that mark each section as `rendered` or `placeholder`;
- render-model integration so shell facts sit beside render-window facts;
- canvas traversal through render-shell sections;
- lightweight placeholder pages for sections outside the active render window;
- action lane for `browser.createRenderShell`;
- boundary documentation and tests.

Acceptance:

- render-shell construction can run in Node without DOM access;
- the canvas can show a full-document section shell while only active-window
  sections mount detailed nodes;
- render-shell facts report rendered and placeholder section counts;
- `app.js` consumes render-shell helpers instead of deciding section shell
  policy directly;
- no DOM scroll tracking, viewport measurement, measured spacer heights,
  virtualized renderer scheduling, hidden/offscreen pruning scheduler, lazy
  detail endpoint, structural add/delete/move packet application, rich text,
  contenteditable mapping, live renderer, route, persistence, or package
  version change is claimed.

## Phase 55: Viewport Section-Shell Measurement Boundary

Goal:

- add a bounded DOM measurement bridge that turns render-shell page positions
  into normalized viewport facts before scroll controllers or virtualized
  renderer scheduling are wired.

Deliverables:

- browser-safe `public/viewportMeasurement.js` module;
- measurement source/version/mode contract;
- section shell box normalization for top, bottom, height, visible height, and
  coverage;
- most-visible anchor-section selection;
- conversion from measurement facts into the existing viewport request path;
- app shell page ids and read-only measurement status;
- action lane for `browser.measureViewportShell`;
- boundary documentation and tests.

Acceptance:

- measurement policy can run in Node without DOM access;
- the app only reads DOM rectangle facts and delegates normalization/anchor
  policy to the measurement module;
- synthetic section boxes can produce a viewport request consumed by runtime
  cache and render window;
- render shell pages expose stable section ids for future viewport work;
- no scroll event binding, automatic visible-range switching, measured
  spacer/virtual list, virtualized renderer scheduler, lazy detail endpoint,
  structural packet engine, rich text, contenteditable mapping, live renderer,
  route, persistence, or package version change is claimed.

## Phase 56: Manual Viewport Measurement Apply Boundary

Goal:

- let the sandbox apply the current viewport measurement to the
  visible-range/render-window path through an explicit command before any
  scroll event binding exists.

Deliverables:

- browser-safe measurement apply helper in `public/viewportMeasurement.js`;
- manual apply source/version/mode contract;
- app command to apply the latest measured section shell;
- runtime-cache update through the existing visible-range request path;
- render-window/render-shell update after manual apply;
- app status output for the latest manual apply result;
- action lane for `browser.applyViewportMeasurement`;
- boundary documentation and tests.

Acceptance:

- manual apply policy can run in Node without DOM access;
- app shell does not import viewport controller policy directly;
- synthetic section boxes can switch the active render window through runtime
  cache;
- the visible app exposes a deliberate apply command instead of binding scroll;
- no scroll event binding, automatic visible-range switching while scrolling,
  debounce/throttle scheduler, measured spacer/virtual list, virtualized
  renderer scheduler, lazy detail endpoint, structural packet engine, rich
  text, contenteditable mapping, live renderer, route, persistence, or package
  version change is claimed.

## Phase 57: Debounced Viewport Scroll Controller Boundary

Goal:

- let canvas scroll movement drive the existing viewport measurement apply path
  after the scroll position settles, while keeping controller policy separate
  from DOM and timer ownership.

Deliverables:

- browser-safe scroll controller state/policy module in
  `public/viewportScrollController.js`;
- pending/settled controller statuses with source/version/mode metadata;
- canvas scroll event binding owned by `public/app.js`;
- debounced settle scheduler that applies the current measurement through the
  existing visible-range request path;
- guard that skips automatic apply while a browser draft or IME composition is
  active;
- scroll restore guard after render;
- app status output for the latest scroll controller state;
- action lane for `browser.controlViewportScroll`;
- boundary documentation and tests.

Acceptance:

- scroll controller policy can run in Node without DOM access;
- app shell owns browser scroll events and timers instead of hiding them in the
  controller module;
- synthetic settled scroll can switch the active render window through runtime
  cache;
- draft/IME activity can skip automatic scroll apply;
- the visible app can switch detailed rendering after scroll settles without
  pressing `Apply viewport`;
- no measured spacer/virtual list, continuous virtualized renderer scheduler,
  lazy detail endpoint, structural packet engine, rich text, contenteditable
  mapping, live renderer, route, persistence, or package version change is
  claimed.

## Phase 58: Section Viewport Anchor Boundary

Goal:

- let render passes restore the canvas from a section-relative anchor instead
  of relying only on raw `scrollTop`, while keeping node anchors as an explicit
  later upgrade.

Deliverables:

- browser-safe viewport anchor policy module in `public/viewportAnchor.js`;
- section anchor source/version/mode contract;
- anchor restore source/version/mode contract;
- app tracking for `sectionId + offsetInSection` from current measurements;
- manual apply and settled scroll restore from section anchors;
- raw `scrollTop` fallback when the section cannot be resolved;
- app status output for the latest viewport anchor;
- action lane for `browser.trackViewportAnchor`;
- boundary documentation and tests.

Acceptance:

- section anchor policy can run in Node without DOM access;
- app shell owns browser measurement and canvas scroll restoration;
- synthetic section measurements can restore from a shifted section top;
- missing sections fall back to bounded raw scrollTop;
- the visible app reports a `section-body` anchor after scroll-driven rendering;
- no node anchor, outline jump-to-node, diagnostics/source jump-to-node,
  caret-relative anchor, measured spacer/virtual list, virtualized renderer
  scheduler, lazy detail endpoint, structural packet engine, rich text,
  contenteditable mapping, live renderer, route, persistence, or package
  version change is claimed.

## Phase 59: Measured Section Spacer Boundary

Goal:

- reuse measured section heights as shell/placeholder spacers so section
  placeholders are less likely to shift scroll and anchor positions when detail
  rendering toggles.

Deliverables:

- browser-safe section spacer policy module in `public/viewportSectionSpacers.js`;
- section spacer source/version/mode contract;
- rendered-measurement update policy;
- placeholder-preserve policy so estimates do not overwrite measured heights;
- app tracking for section spacer facts from viewport measurements;
- page shell CSS variable output for `--section-spacer-height`;
- status output for measured versus estimated spacer counts;
- action lane for `browser.trackSectionSpacers`;
- boundary documentation and tests.

Acceptance:

- spacer policy can run in Node without DOM access;
- app shell owns browser measurement and CSS variable application;
- synthetic rendered measurements update the spacer height for a section;
- placeholder measurements preserve prior rendered heights;
- the visible app reports measured section spacers after scroll-driven
  rendering;
- no virtual list, top-offset map for arbitrary node windows, virtualized
  renderer scheduler, lazy detail endpoint, node anchor, outline jump-to-node,
  diagnostics/source jump-to-node, caret-relative anchor, structural packet
  engine, rich text, contenteditable mapping, live renderer, route,
  persistence, or package version change is claimed.

## Phase 60: Section Offset Prediction Boundary

Goal:

- derive top/height/bottom section intervals and viewport section predictions
  from section spacer facts as a root model before virtualized scheduling.

Deliverables:

- browser-safe section offset policy module in `public/viewportSectionOffsets.js`;
- section offset source/version/mode contract;
- viewport prediction source/version/mode contract;
- long-section interval prediction with `offsetInSection`, coverage pixels,
  and coverage ratios;
- app tracking for section offset index and current viewport prediction;
- page shell data attributes for section offset top/bottom;
- status output for predicted anchor section and visible section count;
- action lane for `browser.predictViewportSections`;
- boundary documentation and tests.

Acceptance:

- offset policy can run in Node without DOM access;
- app shell owns browser measurement and status/data output;
- synthetic long sections produce stable interval predictions;
- predictions remain advisory and do not replace DOM measurement for visible
  range apply/render;
- the visible app reports a `section-body` prediction after scroll-driven
  rendering;
- no virtual list, render-window scheduling from offset predictions, lazy
  detail endpoint, node anchor, outline jump-to-node, diagnostics/source
  jump-to-node, caret-relative anchor, structural packet engine, rich text,
  contenteditable mapping, live renderer, route, persistence, or package
  version change is claimed.

## Phase 61: Viewport Scheduler Candidate Boundary

Goal:

- derive observe-only scheduler section candidates from viewport section
  predictions before those candidates are allowed to drive render-window
  scheduling.

Deliverables:

- browser-safe scheduler candidate policy module in
  `public/viewportSchedulerCandidate.js`;
- scheduler candidate source/version/mode contract;
- overscan expansion from predicted section ids into candidate section ids;
- current/missing/extra section deltas against the active render window;
- confidence classification from measured versus estimated section facts;
- candidate visible-range request shape;
- `applyState` and `applyReady` flags, with the sandbox app remaining
  observe-only;
- app tracking and status output for the current viewport scheduler candidate;
- action lane for `browser.planViewportCandidate`;
- boundary documentation and tests.

Acceptance:

- scheduler candidate policy can run in Node without DOM access;
- app shell owns only measurement/status wiring, not candidate math;
- long-section predictions produce overscanned candidate section ids;
- observe-only candidates do not call the render-window apply path;
- explicit non-observe candidates can report `ready` when the current render
  window differs;
- no automatic render-window scheduling from candidate requests, virtual list,
  hidden/offscreen DOM pruning, lazy detail endpoint, node anchor,
  outline jump-to-node, diagnostics/source jump-to-node, caret-relative
  anchor, structural packet engine, rich text, contenteditable mapping, live
  renderer, route, persistence, or package version change is claimed.

## Phase 62: Viewport Scheduler Apply Boundary

Goal:

- let scheduler candidates become visible-range requests through a controlled
  manual apply gate before automatic scheduling or virtualization is claimed.

Deliverables:

- browser-safe scheduler apply policy module in
  `public/viewportSchedulerApply.js`;
- scheduler apply source/version/mode contract;
- guarded apply request shape over scheduler candidates;
- draft, IME, revision, source, request, ready, and stable-state gates;
- app command and status output for `Apply candidate`;
- action lane for `browser.applyViewportSchedulerCandidate`;
- boundary documentation and tests.

Acceptance:

- scheduler apply policy can run in Node without DOM access;
- app shell owns the command binding and runtime-cache update;
- ready candidates can enter the existing visible-range request path;
- stable, draft-active, composition-active, and revision-mismatched candidates
  do not mutate the render window;
- no automatic render-window scheduling loop, virtual list, hidden/offscreen
  DOM pruning, lazy detail endpoint, node anchor, caret-relative anchor,
  structural packet engine, rich text, contenteditable mapping, live renderer,
  route, persistence, or package version change is claimed.

## Phase 63: Viewport Scheduler Runtime Boundary

Goal:

- move scheduler sequence, request-id, runtime status, and stale-candidate
  policy out of `app.js` before automatic scheduling or virtualization is
  claimed.

Deliverables:

- browser-safe scheduler runtime module in
  `public/viewportSchedulerRuntime.js`;
- scheduler runtime source/version/mode contract;
- runtime state with sequence, pending request id, applied/blocked/stale
  counters, and last-blocked reason;
- candidate planning wrapper over the Phase 61 candidate helper;
- runtime apply wrapper over the Phase 62 apply gate;
- stale-candidate checks for request id, sequence, document revision, and
  runtime revision;
- app status output for `Scheduler runtime: ...`;
- action lane for `browser.runViewportSchedulerRuntime`;
- boundary documentation and tests.

Acceptance:

- scheduler runtime policy can run in Node without DOM access;
- runtime-planned candidates receive stable scheduler request ids;
- stale candidates are rejected before changing the visible range;
- ready candidates still enter the existing visible-range request path through
  the Phase 62 apply gate;
- `app.js` coordinates DOM measurement/render refresh but does not own
  scheduler sequence, request-id, or stale-candidate policy;
- no automatic render-window scheduling loop, virtual list, hidden/offscreen
  DOM pruning, lazy detail endpoint, node anchor, caret-relative anchor,
  structural packet engine, rich text, contenteditable mapping, live renderer,
  route, persistence, or package version change is claimed.

## Phase 64: Viewport Scheduler Automation Boundary

Goal:

- make viewport scheduler apply happen automatically under a finite render
  budget while preserving the Phase 62/63 guards and without claiming a
  virtualized renderer.

Deliverables:

- browser-safe scheduler automation module in
  `public/viewportSchedulerAutomation.js`;
- automation source/version/mode contract;
- finite default scheduler max-node budget;
- automation state with attempted/applied/blocked/skipped counters;
- plan/apply wrapper over the Phase 63 runtime;
- app status output for `Scheduler auto: ...`;
- scroll-settled auto apply through the scheduler runtime;
- manual apply routed through the same automation policy;
- action lane for `browser.autoApplyViewportScheduler`;
- boundary documentation and tests.

Acceptance:

- scheduler automation policy can run in Node without DOM access;
- missing scheduler budget receives a finite default max-node cap;
- ready candidates automatically become visible-range requests through the
  Phase 63 runtime and Phase 62 apply gate;
- blocked, stale, stable, disabled, draft, and IME states do not update visible
  range;
- `app.js` coordinates browser measurement/render refresh but does not own
  scheduler budget normalization or automatic apply policy;
- no virtual list, hidden/offscreen DOM pruning, lazy detail endpoint, node
  anchor, jump-to-node, caret-relative anchor, structural packet engine, rich
  text, contenteditable mapping, live renderer, route, persistence, or package
  version change is claimed.

## Phase 65: Viewport Virtual Stack Boundary

Goal:

- make the sandbox renderer consume render-window output without mounting every
  section article, while preserving section-level scroll geometry with virtual
  spacers.

Deliverables:

- browser-safe virtual stack module in `public/viewportVirtualStack.js`;
- virtual stack source/version/mode contract;
- section item and spacer item output;
- offset-backed hidden-section spacer heights;
- offset-missing fallback that mounts all shell sections for bootstrap;
- app renderer consumption of virtual stack items;
- `Virtual stack: ...` status output;
- CSS for invisible virtual section spacers;
- action lane for `browser.virtualizeViewportSections`;
- boundary documentation and tests.

Acceptance:

- virtual stack policy can run in Node without DOM access;
- hidden sections collapse into spacer items instead of mounted page articles;
- mounted section ids remain render-shell rendered section ids;
- app page-stack consumes virtual stack items and exposes mounted count;
- missing offsets fall back to mounting all sections;
- no lazy heavy-detail endpoint, node anchor, jump-to-node, recycled DOM pool,
  caret-relative anchor, structural packet engine, rich text, contenteditable
  mapping, live renderer, route, persistence, or package version change is
  claimed.

## Phase 66: Viewport Lazy Heavy-Detail Boundary

Goal:

- defer inactive heavy node detail inside mounted virtual sections while keeping
  selected/draft paths materialized and avoiding any API/hydration claim.

Deliverables:

- browser-safe lazy detail module in `public/viewportLazyDetail.js`;
- lazy detail source/version/mode contract;
- default heavy-node thresholds;
- heavy node classification by type, child count, subtree count, and text
  length;
- active selected/draft path materialization guard;
- app renderer placeholders for deferred heavy detail;
- `Lazy detail: ...` status output;
- CSS for local lazy-detail placeholders;
- action lane for `browser.lazyViewportHeavyDetail`;
- boundary documentation and tests.

Acceptance:

- lazy detail policy can run in Node without DOM access;
- inactive table/columns detail can be deferred inside the render window;
- selected-node and draft ancestor paths are not deferred;
- app renderer consumes lazy detail plans and exposes deferred counts;
- no backend/API route, async hydration, node-aware jump-to-node, recycled DOM
  pool, caret-relative anchor, structural packet engine, rich text,
  contenteditable mapping, live renderer, persistence, or package version
  change is claimed.

## Phase 67: Viewport Node Anchor Boundary

Goal:

- make selection jumps restore scroll by node id when possible while retaining
  section-anchor fallback and avoiding outline/diagnostics/caret scope.

Deliverables:

- browser-safe node anchor module in `public/viewportNodeAnchor.js`;
- node anchor source/version/mode contract;
- node anchor restore source/version/mode contract;
- app node-rect fact reader in the browser shell;
- fallback node anchors from runtime-store section indexes;
- render restore path that re-reads newly mounted node rects;
- `Node anchor: ...` status output;
- action lane for `browser.restoreViewportNodeAnchor`;
- boundary documentation and tests.

Acceptance:

- node anchor policy can run in Node without DOM access;
- node anchors resolve against section measurement and clamp to scroll bounds;
- missing sections fall back without claiming restore success;
- selection changes pass a node-aware restore anchor into render;
- no outline jump UI, diagnostics/source jump UI, caret-relative text anchor,
  backend/API route, async hydration, structural packet engine, rich text,
  contenteditable mapping, live renderer, persistence, or package version
  change is claimed.

## Phase 68: Viewport Large Document Behavior Audit

Goal:

- close the viewport/virtualization line with a composed large-document audit
  before Structural Runtime work starts.

Deliverables:

- boundary documentation in
  `docs/TEMPLATE_BUILDER_VIEWPORT_LARGE_DOCUMENT_AUDIT.md`;
- synthetic large viewport fixture inside
  `tests/templateBuilderSandboxBoundary.test.ts`;
- composed scheduler automation, visible-range, render-window, render-shell,
  virtual-stack, lazy-detail, node-anchor, and jump-to-node assertions;
- explicit bounded-node and mounted-section counts;
- guardrails that keep the audit shape-based rather than timing-sensitive.

Acceptance:

- the audit fixture has at least 72 sections and 900 runtime nodes;
- scheduler automation moves from the boot section to a far viewport target
  under a finite node budget;
- visible range and render shell stay bounded instead of mounting the whole
  document;
- virtual stack uses spacers for off-window sections;
- lazy detail defers inactive heavy nodes while materializing the active path;
- node-aware anchor restore and jump-to-node behavior work for a far target
  node;
- no structural packet engine, schema change, recycled DOM pool, async
  hydration, outline/diagnostics UI, rich text, route, persistence, or
  wall-clock performance claim is made.

## Phase 69: Structural Projection Boundary

Goal:

- add a shared derived structural projection so renderers, outline,
  diagnostics, and future structural operation planning can consume a
  tree-shaped working view without changing canonical document schema.

Deliverables:

- core projection module in `src/structure/projection.ts`;
- projection source/version/mode contract;
- `createStructuralProjection(...)` over `DocumentNode + RelationshipGraph`;
- section projection with ordered roots;
- node projection with node id/type, section/zone context, parent, depth, path,
  child ids, children, nearest context, and capabilities;
- public export through `src/index.ts`;
- boundary documentation and tests.

Acceptance:

- projection can be built from canonical document input and an optional
  injected graph;
- section roots and child order follow canonical ordered id arrays;
- depth, parent refs, paths, nearest context, and capabilities align with
  `RelationshipGraph`;
- projection creation does not mutate canonical documents;
- no structural packet engine, runtime-store structural apply, schema change,
  mutable projection editing, outline/diagnostics UI, persistence, or history
  change is claimed.

## Phase 70: Structural Packet Contract Boundary

Goal:

- define a foundation structural packet contract that describes accepted core
  operation results for future browser runtime-store structural apply.

Deliverables:

- core packet module in `src/structure/packet.ts`;
- packet source/version/stage contract;
- `createStructuralChangePacket(...)` from before-document plus operation
  result;
- `validateStructuralChangePacket(...)`;
- separate node map changes and ordered parent-list patches;
- rejected packet shape that does not advance revision;
- growth warning documentation that packet v1 is not durable persistence,
  collaboration, or backend public API;
- tests and boundary documentation.

Acceptance:

- insert operations produce added nodes and insert list patches;
- delete operations produce removed subtree ids and remove list patches;
- reorder operations produce move list patches;
- rejected operations produce diagnostics without structural changes or
  revision advancement;
- malformed applied packets fail validation before runtime-store apply phases;
- no browser runtime-store structural apply, UI command, persistence,
  multi-user conflict handling, offline replay, backend API exposure,
  structural packet durability guarantee, or schema change is claimed.

## Phase 71: Structural Packet Store Apply Boundary

Goal:

- let the browser runtime store consume structural packet v1 as a local
  foundation bridge while keeping structural command UI and durable protocols
  out of scope.

Deliverables:

- `applyStructuralChangePacketToRuntimeStore(...)` in
  `public/runtimeStoreStructuralPacket.js`;
- structural packet source/version/stage/status/revision validation;
- parent-list stale guards against current runtime-store lists;
- packet-node normalization from canonical authored-node shape to browser
  runtime node summaries;
- derived index rebuild for node, parent, child, section, zone, root, and order
  maps;
- runtime-cache route for structural packets through the existing packet-cache
  path;
- editor-view dirty scope support for array-shaped structural operation
  scopes;
- boundary documentation and tests with growth warning.

Acceptance:

- structural insert packets add runtime nodes and update parent child order;
- structural delete packets remove nodes and restore parent child order;
- stale base revisions and malformed parent-list patches are rejected before
  apply;
- runtime cache can consume a structural packet without mutating the
  tree-shaped snapshot;
- editor-view dirty and changed subtree facts include structural operation
  scope arrays;
- no structural command UI, persistence, durable history/replay,
  collaboration/conflict merge, backend API exposure, long-term packet storage
  guarantee, or schema change is claimed.

## Phase 72: Structural Mutation Bridge Boundary

Goal:

- let sandbox bridge actions produce structural packet v1 from core structural
  operations so Phase 71 has a real packet producer before structural UI is
  wired.

Deliverables:

- bridge methods for text-block insertion, node deletion, and node reorder;
- local sandbox API routes for those bridge methods;
- structural packet-only response shape using `createStructuralChangePacket`;
- core operation execution through `runVNextOperation`;
- operation-scope to live-layout dirty-scope adapter;
- action lane entries for the structural bridge actions;
- boundary documentation and tests.

Acceptance:

- insert text-block bridge responses carry `nodesAdded`, parent `nodesUpdated`,
  and an `insert` parent-list patch;
- reorder bridge responses carry a `move` parent-list patch;
- delete bridge responses carry removed node ids and a `remove` parent-list
  patch;
- rejected core operations return rejected structural packets without revision
  advancement;
- bridge structural packets apply through browser runtime cache and keep the
  tree-shaped snapshot immutable;
- no structural toolbar UI, durable structural undo/redo, persistence,
  collaboration, offline replay, backend public API exposure, or schema change
  is claimed.

## Phase 73: Structural Command UI Boundary

Goal:

- expose bounded inspector controls for structural insert/delete/reorder using
  the Phase 72 bridge routes and Phase 71 runtime-cache apply path.

Deliverables:

- inspector structure command panel;
- structural text-block insert text input;
- insert-inside and insert-after commands;
- move-up and move-down commands;
- delete command;
- command target derivation from runtime store parent/child facts;
- post-command selection behavior;
- action catalog entry and boundary documentation.

Acceptance:

- structural UI actions call packet-only bridge routes;
- app code does not mutate document shape directly;
- command availability is guarded by selected node type and runtime
  capabilities;
- returned packets are applied through the existing runtime cache path;
- no drag/drop outline editing, durable structural undo/redo, persistence,
  backend API exposure, collaboration, offline replay, or schema change is
  claimed.

## Phase 74: Structural Outline Jump Boundary

Goal:

- turn the existing sandbox node tree into an explicit structural outline
  navigation boundary over runtime node ids, visible-range requests, and
  node-aware viewport anchor restore.

Deliverables:

- DOM-free structural outline jump request module;
- outline click binding that delegates through the request module before
  selecting the node;
- browser-local outline jump status;
- action catalog entry for `browser.runStructuralOutlineJump`;
- boundary documentation and tests proving the outline remains navigation-only.

Acceptance:

- outline clicks use `createStructuralOutlineJumpRequest(...)`;
- accepted jump requests carry a selection visible-range request;
- missing node ids are rejected without guessing a fallback;
- generated snapshots expose the action lane but do not serialize outline jump
  state;
- no drag/drop outline editing, multi-select operations, keyboard tree
  commands, inline outline rename, diagnostics/source jump UI, durable
  structural undo/redo, persistence, backend API exposure, collaboration,
  offline replay, or schema change is claimed.

## Phase 75: Structural Diagnostics Navigation Boundary

Goal:

- add a bounded diagnostics navigation surface that lists current
  snapshot/packet diagnostics and jumps only node-linked issues through the
  node-aware selection path.

Deliverables:

- DOM-free structural diagnostics navigation module;
- diagnostics item normalization for snapshot summary and latest packet issues;
- inspector diagnostics list with document-level and node-linked states;
- action catalog entry for `browser.runStructuralDiagnosticsNavigation`;
- boundary documentation and tests.

Acceptance:

- document-level diagnostics are visible but non-clickable;
- node-linked diagnostics jump only when the node id exists in runtime indexes;
- accepted diagnostic jumps reuse the Phase 74 visible-range request path;
- missing-node diagnostics are blocked without fallback guessing;
- no new diagnostics engine, auto-fix, persistence, backend API exposure,
  durable history, or schema change is claimed.

## Phase 76: Structural Command Policy Boundary

Goal:

- extract structural insert/delete/reorder command policy out of the sandbox
  app shell so command availability, targets, routes, request bodies, and
  post-result selection behavior have a DOM-free owner.

Deliverables:

- browser-safe `structuralCommandPolicy.js` module;
- app delegation for structural command button state and dispatch;
- action catalog entry for `browser.evaluateStructuralCommandPolicy`;
- boundary documentation and tests.

Acceptance:

- policy actions return `enabled`, `reason`, and target metadata;
- structural route and request body creation live outside `app.js`;
- post-result selection behavior lives outside `app.js`;
- UI behavior still calls the Phase 72 bridge routes and packet apply path;
- no new commands, structural packet shape change, persistence, backend API,
  durable history, or schema change is claimed.

## Phase 77: Structural Runtime Close Audit

Goal:

- review Phases 69-76 as a Structural Runtime foundation before entering the
  next WYSIWYG / Editing line.

Deliverables:

- close audit document;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN sections;
- risk register split into must-fix-now, track-later, and decision gates;
- README and phase ledger links;
- tests that guard the audit contract.

Acceptance:

- audit states whether Structural Runtime can be treated as a usable foundation;
- audit records that packet v1 is not durable persistence/collaboration/API;
- audit records that runtime store/render model are browser truth after packet
  apply;
- audit records diagnostics node-id limits and missing manual browser QA;
- no runtime behavior, persistence, backend API, durable history, or schema
  change is claimed.

## Phase 78: Draft Runtime Module Boundary

Goal:

- extract browser-local WYSIWYG draft state, caret/selection normalization,
  command context, text command policy, and IME composition guards out of the
  sandbox app shell before richer editing behavior is added.

Deliverables:

- browser-safe draft runtime module in `public/draftRuntime.js`;
- draft runtime source/mode constants;
- idle and active draft state helpers;
- normalized caret/selection model for textarea drafts;
- range-control and selection-input policy outside `app.js`;
- command context/readiness and browser-local insert/replace command policy
  outside `app.js`;
- composition start/update/end guard state outside `app.js`;
- app-shell delegation while preserving DOM focus, render, fetch, and packet
  coordination in `app.js`;
- action lane for the draft runtime/caret boundary;
- boundary documentation and tests.

Acceptance:

- draft runtime policy can run in Node without DOM access;
- `app.js` delegates draft state transitions and command policy to the module;
- active draft selection remains browser-local and is not serialized into
  snapshots, packages, history, or live-layout requests;
- command readiness keeps field insertion and style patching planned;
- draft commits still use the existing bridge packet route;
- no contenteditable mapping, rich inline editing, field chips,
  per-keystroke core transactions, live renderer, persistence, backend API, or
  package/document schema change is claimed.

## Phase 79: Text Draft Layout Push Boundary

Goal:

- surface a bounded browser-local layout preview summary for active WYSIWYG
  text drafts without turning draft text into canonical document truth or
  running live/exact layout during typing.

Deliverables:

- browser-safe draft layout push module in `public/draftLayoutPush.js`;
- draft layout push source/mode constants;
- local idle/stable/preview/composing status and reason derivation;
- text length and delta facts for the active draft;
- explicit `liveLayout.status = "not-requested"`;
- explicit `exactGeneration.status = "not-run"`;
- canvas, inspector, and status-bar consumption;
- action lane for the draft layout push boundary;
- boundary documentation and tests.

Acceptance:

- draft layout push policy can run in Node without DOM access;
- active draft changes update only browser-local preview summaries;
- composing drafts remain guarded and do not create live layout requests;
- exact generation remains not-run until a committed bridge transaction;
- app consumption does not call core layout, pagination, generation, history,
  persistence, or packet application from active typing;
- no renderer-backed measurement, line wrapping, page geometry,
  contenteditable mapping, rich inline editing, field chips, backend API, or
  package/document schema change is claimed.

## Phase 80: Draft IME Hardening Boundary

Goal:

- centralize browser-local WYSIWYG draft IME guard policy without claiming
  language-specific production IME behavior or changing package truth.

Deliverables:

- browser-safe draft IME policy module in `public/draftImePolicy.js`;
- draft IME policy source/mode constants;
- idle/ready/composing/settled status and reason derivation;
- command, range-control, and commit guard booleans;
- explicit `languageProfile = "generic-ime"` default;
- explicit `exactGeneration.status = "deferred-until-commit"`;
- canvas, inspector, and status-bar consumption through
  `data-draft-ime-policy`;
- action lane for `browser.hardenDraftIme`;
- boundary documentation and tests.

Acceptance:

- draft IME policy can run in Node without DOM access;
- active composition blocks draft commands, range controls, and commit through
  one policy summary;
- settled composition re-enables browser-local draft affordances while leaving
  final bridge commit as the only package mutation path;
- exact generation remains deferred until committed bridge transactions;
- app consumption does not call core layout, pagination, generation, history,
  persistence, or packet application from active composition;
- no language-specific IME engine, contenteditable mapping, rich inline
  editing, field chips, toolbar state, backend API, or package/document schema
  change is claimed.

## Phase 81: Rich Inline Style Patch Boundary

Goal:

- model browser-local inline style patch intent for selected WYSIWYG draft
  ranges without applying authored inline style runs or changing package truth.

Deliverables:

- browser-safe inline style patch boundary module in
  `public/draftInlineStylePatch.js`;
- inline style patch source/mode constants;
- supported style marks for the boundary: bold, italic, underline, and
  strikethrough;
- selected range start/end/length facts and bounded selected text preview;
- idle/guarded/composing/ready status and reason derivation;
- explicit `application.status = "not-applied"`;
- explicit `coreTransaction.status = "not-run"`;
- explicit `history.status = "not-recorded"`;
- explicit `liveLayout.status = "not-requested"`;
- explicit `exactGeneration.status = "deferred-until-commit"`;
- canvas, inspector, and status-bar consumption through
  `data-draft-style-patch`;
- action lane for `browser.planDraftInlineStylePatch`;
- boundary documentation and tests.

Acceptance:

- style patch policy can run in Node without DOM access;
- collapsed selections remain guarded;
- active composition blocks style patch requests;
- non-collapsed selected ranges can produce ready style patch summaries;
- ready summaries still do not apply inline style, run core transactions,
  append history, request live layout, or run exact output;
- `draftRuntime.js` command readiness can continue to mark
  `inline.style.patch` as planned until a real rich inline execution phase;
- no toolbar state, field chips, style-aware history, backend API, renderer
  output, or package/document schema change is claimed.

## Phase 82: Toolbar State Boundary

Goal:

- expose browser-local toolbar control readiness for active WYSIWYG draft
  ranges without dispatching toolbar commands or detecting authored rich inline
  marks.

Deliverables:

- browser-safe toolbar state module in `public/draftToolbarState.js`;
- toolbar state source/mode constants;
- style control summaries for bold, italic, underline, and strikethrough;
- selected range start/end/length facts;
- idle/guarded/composing/ready status and reason derivation;
- explicit `activeState = "unknown-until-rich-inline-mapping"`;
- explicit `commandDispatch.status = "not-wired"`;
- explicit `coreTransaction.status = "not-run"`;
- explicit `history.status = "not-recorded"`;
- explicit `exactGeneration.status = "deferred-until-commit"`;
- canvas, inspector, and status-bar consumption through
  `data-draft-toolbar-state`;
- action lane for `browser.resolveDraftToolbarState`;
- boundary documentation and tests.

Acceptance:

- toolbar state can run in Node without DOM access;
- collapsed selections keep future style controls guarded;
- active composition blocks future style controls;
- non-collapsed selected ranges enable the four future style controls;
- active mark state remains unknown until rich inline mapping exists;
- toolbar dispatch, core transactions, history, live layout, and exact output
  remain unrun;
- no visible toolbar buttons, toolbar command dispatch, field chips,
  style-aware history, backend API, renderer output, or package/document schema
  change is claimed.

## Phase 83: Field Chip Inline Boundary

Goal:

- surface catalog-backed field chip inline intent for active WYSIWYG draft
  carets without inserting authored `field-ref` nodes or changing package
  truth.

Deliverables:

- browser-safe field chip inline module in `public/draftFieldChipInline.js`;
- field chip inline source/mode constants;
- bounded field catalog normalization from snapshot field summaries;
- selected field key marking;
- caret insertion position facts;
- idle/guarded/composing/ready status and reason derivation;
- explicit `command = "inline.fieldRef.insert"`;
- explicit `insertion.status = "not-applied"`;
- explicit `coreTransaction.status = "not-run"`;
- explicit `history.status = "not-recorded"`;
- explicit `liveLayout.status = "not-requested"`;
- explicit `exactGeneration.status = "deferred-until-commit"`;
- canvas, inspector, and status-bar consumption through
  `data-draft-field-chip-inline`;
- action lane for `browser.planDraftFieldChipInline`;
- boundary documentation and tests.

Acceptance:

- field chip inline state can run in Node without DOM access;
- snapshot field summaries can be normalized into bounded chip summaries;
- caret selections can produce ready field chip insert-request summaries;
- non-collapsed selected ranges remain guarded until rich inline range mapping
  exists;
- active composition blocks field chip requests;
- insertion, core transactions, history, live layout, and exact output remain
  unrun;
- no visible field picker, field-ref insertion, key history, backend API,
  renderer output, or package/document schema change is claimed.

## Phase 84: Style-aware History Boundary

Goal:

- group ready rich inline draft intents into browser-local style-aware history
  summaries without appending durable history or changing `authoringHistory`.

Deliverables:

- browser-safe style-aware history module in `public/draftStyleHistory.js`;
- style-aware history source/mode constants;
- planned intent collection from ready style patch and field chip summaries;
- intent kind labels for `inline.style.patch` and `inline.fieldRef.insert`;
- active draft merge-key shape;
- idle/guarded/composing/planned status and reason derivation;
- explicit `history.status = "not-recorded"`;
- explicit `durableHistory.status = "not-written"`;
- explicit `coreTransaction.status = "not-run"`;
- explicit `liveLayout.status = "not-requested"`;
- explicit `exactGeneration.status = "deferred-until-commit"`;
- canvas, inspector, and status-bar consumption through
  `data-draft-style-history`;
- action lane for `browser.planDraftStyleHistory`;
- boundary documentation and tests.

Acceptance:

- style-aware history state can run in Node without DOM access;
- ready style patch and field chip summaries can become planned history
  intents;
- planned intents keep history status not-recorded;
- active composition blocks style-aware history planning;
- durable history, core transactions, authoringHistory, live layout, and exact
  output remain unrun/unchanged;
- no undo/redo behavior, style-aware live layout, backend API, renderer output,
  or package/document schema change is claimed.

## Phase 85: WYSIWYG Close Audit

Goal:

- close the current WYSIWYG / Editing foundation pass with explicit
  PASS/FAIL/RISK/UNKNOWN status before backend, persistence, exact renderer, or
  production rich editing work continues.

Deliverables:

- close audit in `docs/TEMPLATE_BUILDER_WYSIWYG_CLOSE_AUDIT.md`;
- PASS evidence for Phases 78-84 browser-local modules and action lanes;
- FAIL/BLOCKER record;
- RISK and UNKNOWN lists for rich inline execution, contenteditable mapping,
  production IME, style-aware live layout, renderer parity, persistence,
  collaboration, and durable undo/redo;
- files changed / behavior changed / tests run / risks left /
  intentionally-not-changed records;
- README, ledger, and boundary test coverage.

Acceptance:

- audit cites the relevant modules and tests;
- audit does not claim production WYSIWYG completion;
- audit confirms package/document schema, backend API, persistence,
  collaboration, durable history, exact renderer, and export adapters were not
  changed;
- focused boundary tests and root checks pass.

## Phase 86: Generation API Route Boundary

Goal:

- add a pure generation readiness route-response boundary without implementing
  a concrete server route, storage, exact layout, or artifact rendering.

Deliverables:

- route adapter in `src/generation/apiRoute.ts`;
- public exports for route source/mode/action constants and
  `createVNextGenerationApiRouteResponse(...)`;
- method policy for `POST`;
- HTTP-shaped status/header/body envelope;
- explicit separation between route status and generation readiness status;
- invalid method, invalid request, valid readiness-blocked, and valid ready
  response tests;
- boundary documentation and ledger/README updates.

Acceptance:

- valid POST generation readiness requests produce route-safe JSON envelopes;
- invalid request or package shapes map to 400 responses;
- valid requests with readiness blockers remain 200 transport responses with
  blocked readiness diagnostics;
- non-POST methods map to 405 with `allow = "POST"`;
- artifacts and generated documents remain `null`;
- route adapter does not import server frameworks, parent app routes, storage,
  exact layout, measured pagination, renderer consumption, or export readiness.

## Phase 87: Session Storage Boundary

Goal:

- add a pure editable-session storage record boundary without implementing a
  concrete storage adapter, route, durable history store, or artifact storage.

Deliverables:

- session storage record creator in `src/authoring/sessionStorage.ts`;
- public exports for session storage source/mode constants and
  `createVNextSessionStorageRecord(...)`;
- canonical package snapshot produced through package serialization;
- manifest with package/document version facts, document revision,
  dirty-scope count, optional storage key, reason, and write status;
- explicit persisted-state flags for package versus session/runtime-only
  state;
- boundary tests for canonical-only package snapshots, session-only exclusion,
  source independence, and documentation trail;
- boundary documentation and ledger/README updates.

Acceptance:

- storage records contain a package v2/document v3 snapshot and manifest;
- selection, dirty scopes, revisions, diagnostics, graph, viewport, live
  layout, exact layout, and authoring history are not persisted into the
  package snapshot;
- storage status remains `not-written`;
- the boundary does not import storage adapters, server frameworks, parent app
  routes, DOM/browser storage APIs, layout, pagination, or renderer execution;
- package/document schema remains unchanged.

## Phase 88: Durable History / Undo-redo Boundary

Goal:

- add a pure durable-ready authoring history snapshot boundary with undo/redo
  metadata, without implementing a concrete history store or replay engine.

Deliverables:

- durable history snapshot creator in `src/authoring/durableHistory.ts`;
- public exports for durable history source/mode constants and
  `createVNextDurableHistorySnapshot(...)`;
- committed and rejected authoring intent records cloned into a JSON-ready
  snapshot;
- non-durable selection-only records skipped with manifest counts;
- grouped authoring history summaries;
- undo/redo metadata for can-undo/can-redo and stack depth;
- explicit markers that storage writes, replay execution, inverse patches,
  full package snapshots, and selection restore are not implemented;
- boundary tests for record cloning, non-durable filtering, rejected
  diagnostics, redo metadata, source independence, and documentation trail;
- boundary documentation and ledger/README updates.

Acceptance:

- durable snapshots carry authoring history records and groups without storing
  package snapshots or editor/runtime state;
- rejected diagnostic records remain auditable while selection-only records
  stay non-durable;
- undo/redo reports metadata only with `executionStatus = "not-run"`;
- storage status remains `not-written`;
- the boundary does not import storage adapters, server frameworks, parent app
  routes, DOM/browser storage APIs, text transaction execution, operation
  replay, layout, pagination, or renderer execution;
- package/document schema remains unchanged.

## Phase 89: Key History / Migration Boundary

Goal:

- add a pure key history migration planning boundary without implementing key
  migration execution, key history persistence, aliases, deprecated keys, or
  package/schema changes.

Deliverables:

- key history migration planner in `src/binding/keyHistory.ts`;
- public exports for key history source/mode constants and
  `createVNextKeyHistoryMigrationPlan(...)`;
- migration intent shapes for field-key rename and field-type change;
- affected field-ref usage and data-key summaries;
- validation for empty keys, same-key renames, missing source keys, target key
  collisions, missing type-change keys, invalid target types, and non-inline
  type changes that would break inline field refs;
- explicit markers that registry mutation, document field-ref mutation, data
  migration, key-history writes, external compatibility checks, and package
  version changes are not implemented;
- boundary tests for planned renames, blocked migration intents, source
  independence, and documentation trail;
- boundary documentation and ledger/README updates.

Acceptance:

- rename and type-change plans report affected registry/data/field-ref facts
  without mutating canonical package truth;
- unsafe intents are blocked before package mutation;
- inline `field-ref` keys remain authored truth until a future executor phase;
- key history writes remain `not-written`;
- package version changes remain `false`;
- the boundary does not import storage adapters, server frameworks, parent app
  routes, DOM/browser storage APIs, package parse/serialize, text transaction
  execution, operation execution, layout, pagination, or renderer execution;
- package/document schema remains unchanged.

## Phase 90: Repeat / Collection / Form-slot Boundary

Goal:

- add a pure readiness boundary for repeat regions, collection binding, and
  form slots without implementing repeat expansion, collection payload schema,
  form-slot schema, submission state, or package/document schema changes.

Deliverables:

- repeat/collection/form-slot readiness helper in
  `src/binding/repeatCollectionFormSlots.ts`;
- public exports for repeat/collection/form-slot source/mode constants and
  `assessVNextRepeatCollectionFormSlotReadiness(...)`;
- collection field detection from the package field registry;
- affected inline field-ref usage and scalar data-key facts;
- explicit repeat-region, form-slot, submission-state, collection-binding, and
  repeat-expansion statuses;
- validation for collection fields used as inline scalar refs and collection
  fields supplied through scalar data snapshots;
- boundary tests for scalar-only readiness, blocked collection misuse, source
  independence, and documentation trail;
- boundary documentation and ledger/README updates.

Acceptance:

- scalar-only packages remain ready while repeat regions and form slots are
  explicitly reported as not modeled;
- collection fields are visible in the boundary result before materialization
  exists;
- collection fields used inline or supplied through scalar data snapshots are
  blocked;
- repeat expansion, collection binding, form-slot materialization, submission
  state, document mutation, and package version changes remain not-run/false;
- the boundary does not import storage adapters, server frameworks, parent app
  routes, DOM/browser storage APIs, package parse/serialize, text transaction
  execution, operation execution, layout, pagination, or renderer execution;
- package/document schema remains unchanged.

## Phase 91: Submission State Boundary

Goal:

- add a pure external submission state boundary without implementing workflow
  storage, submission/reviewer routes, permissions, approval gates, or package/
  document/data mutation.

Deliverables:

- submission state record helper in `src/workflow/submissionState.ts`;
- public exports for submission state source/mode constants and
  `createVNextSubmissionStateRecord(...)`;
- workflow status values for not-started, draft, submitted, approved, and
  rejected;
- validation for missing template id, invalid revisions, missing submission
  id, and missing reviewer id;
- scope flags that keep package, document node, data snapshot, and editor
  session state out of the submission record;
- explicit markers that package mutation, document mutation, data mutation,
  history writes, storage writes, route dispatch, and package version changes
  are not implemented;
- boundary tests for ready submitted records, blocked incomplete review state,
  source independence, and documentation trail;
- boundary documentation and ledger/README updates.

Acceptance:

- submission state records are JSON-serializable external workflow metadata;
- submitted/reviewed states are validated before any workflow write exists;
- package, document, data snapshot, and editor session scopes remain false;
- workflow storage and route dispatch remain not-written/not-run;
- the boundary does not import storage adapters, server frameworks, parent app
  routes, DOM/browser storage APIs, package parse/serialize, text transaction
  execution, operation execution, layout, pagination, or renderer execution;
- package/document schema remains unchanged.

## Phase 92: Persistence Close Audit

Goal:

- close the current Backend / API / Persistence foundation pass with explicit
  PASS/FAIL/RISK/UNKNOWN status before exact renderer, concrete storage, or
  production workflow work continues.

Deliverables:

- close audit in `docs/PERSISTENCE_CLOSE_AUDIT.md`;
- PASS evidence for Phases 86-91 route, session storage, durable history, key
  migration, repeat/collection/form-slot, and submission state boundaries;
- FAIL/BLOCKER record;
- RISK and UNKNOWN lists for concrete storage, durable replay, key migration
  execution, collection/form-slot materialization, submission workflow,
  backend auth/idempotency, and artifact storage;
- files changed / behavior changed / tests run / risks left /
  intentionally-not-changed records;
- README, ledger, and boundary test coverage.

Acceptance:

- audit cites the relevant modules, docs, and tests;
- audit does not claim production persistence, concrete backend routes,
  workflow runtime, key migration execution, collection materialization,
  exact renderer adapters, or artifact output;
- audit confirms package/document schema, parent runtime imports, storage
  writes, exact renderer, and export adapters were not changed;
- focused boundary tests and root checks pass.

## Phase 93: PDF Renderer Adapter Boundary

Goal:

- add a pure PDF renderer adapter plan over measured renderer consumption
  without implementing concrete PDF rendering, PDF bytes, storage writes, or
  renderer-side relayout.

Deliverables:

- PDF renderer adapter in `src/renderer/pdfAdapter.ts`;
- public exports for PDF adapter source/mode constants and
  `createVNextPdfRendererAdapterPlan(...)`;
- PDF draw command shape derived from measured render commands;
- no-relayout PDF renderer contract;
- artifact manifest with `status = "not-rendered"`, `bytes = null`, and
  `storageId = null`;
- blocked renderer-consumption handling that emits no draw commands;
- boundary tests for ready draw plans, blocked input, source independence, and
  documentation trail;
- boundary documentation and ledger/README updates.

Acceptance:

- adapter consumes measured renderer commands, not authored documents;
- ready renderer consumption produces JSON-serializable PDF draw plans;
- blocked renderer consumption blocks PDF draw commands;
- PDF artifacts remain not-rendered and byte/storage fields remain null;
- the boundary does not import concrete PDF libraries, storage adapters,
  server frameworks, parent app routes, DOM APIs, pagination, layout, export
  readiness, or renderer execution;
- package/document schema remains unchanged.

## Phase 94: DOCX Renderer Adapter Boundary

Goal:

- add a pure DOCX renderer adapter plan over measured renderer consumption
  without implementing concrete DOCX rendering, DOCX bytes, storage writes, or
  renderer-side relayout.

Deliverables:

- DOCX renderer adapter in `src/renderer/docxAdapter.ts`;
- public exports for DOCX adapter source/mode constants and
  `createVNextDocxRendererAdapterPlan(...)`;
- DOCX assembly command shape derived from measured render commands;
- no-relayout DOCX renderer contract;
- artifact manifest with `status = "not-rendered"`, `bytes = null`, and
  `storageId = null`;
- blocked renderer-consumption handling that emits no assembly commands;
- boundary tests for ready assembly plans, blocked input, source independence,
  and documentation trail;
- boundary documentation and ledger/README updates.

Acceptance:

- adapter consumes measured renderer commands, not authored documents;
- ready renderer consumption produces JSON-serializable DOCX assembly plans;
- blocked renderer consumption blocks DOCX assembly commands;
- DOCX artifacts remain not-rendered and byte/storage fields remain null;
- the boundary does not import concrete DOCX libraries, storage adapters,
  server frameworks, parent app routes, DOM APIs, pagination, layout, export
  readiness, or renderer execution;
- package/document schema remains unchanged.

## Phase 95: Renderer-backed Text Measurement Boundary

Goal:

- add a pure renderer-backed text measurement profile boundary that can adapt
  external renderer measurement facts into the existing vNext text measurement
  contract without implementing a concrete renderer, DOM bridge, PDF/DOCX text
  metrics, storage writes, or layout relayout.

Deliverables:

- renderer-backed text measurement adapter in
  `src/renderer/textMeasurementAdapter.ts`;
- public exports for renderer text measurement source/mode constants,
  `createVNextRendererTextMeasurementProfilePlan(...)`, and
  `createVNextRendererBackedTextMeasurer(...)`;
- JSON-serializable profile readiness plan for renderer engine, revision,
  units, determinism, and required capabilities;
- strict profile-id alignment between `measurementProfileId` and the
  renderer-backed measurer so cache identity cannot silently drift;
- blocked profile handling for missing profile ids, unavailable profiles,
  non-point units, missing line boxes, missing style-key support, and missing
  available-width support;
- boundary tests for ready plans, provider adaptation, blocked profiles, cache
  profile-id alignment, source independence, and documentation trail;
- boundary documentation and ledger/README updates.

Acceptance:

- adapter uses the existing `VNextTextMeasurer` interface and does not replace
  `measureVNextText(...)` as the cache/invalidation truth;
- ready profiles can wrap an external measurement provider and return
  `VNextTextMeasurementDraft` values through the existing measurement path;
- blocked profiles cannot create a measurer;
- renderer contract keeps `mayRelayoutDocument = false` and does not require
  authored document input for layout;
- the boundary does not import concrete browser/PDF/DOCX renderer libraries,
  storage adapters, server frameworks, parent app routes, DOM APIs,
  pagination execution, layout pipeline execution, or renderer consumption;
- package/document schema remains unchanged.

## Phase 96: Pausable Layout Job Engine

Goal:

- add a pure pausable layout job engine over `VNextLayoutPipelinePlan.jobs`
  without implementing concrete layout execution, text/table placement,
  renderer execution, cursor persistence, backend routes, or package/document
  mutation.

Deliverables:

- pausable layout job engine in `src/pagination/layoutJobEngine.ts`;
- public exports for pausable layout job engine source/mode constants and
  `runVNextPausableLayoutJobEngineChunk(...)`;
- JSON-serializable cursor with `jobOffset` and completed source item ids;
- bounded chunk execution over layout pipeline jobs;
- dependency blocking for malformed plans or invalid resume cursors that skip
  required source-item completion;
- engine contract that records `executesConcreteLayout = false`,
  `mayRelayoutDocument = false`, `mutatesDocument = false`, and
  `storesCursor = false`;
- boundary tests for pause/resume, dependency blocking, source independence, and
  documentation trail;
- boundary documentation and ledger/README updates.

Acceptance:

- engine consumes a `VNextLayoutPipelinePlan`, not authored documents;
- repeated bounded chunks can advance all plan jobs in dependency order;
- invalid resume cursors block instead of silently running dependent jobs;
- the boundary does not call pagination execution, layout pipeline execution,
  renderer consumption, export readiness, renderer libraries, storage adapters,
  server frameworks, parent app routes, DOM APIs, or persistence;
- package/document schema and measured pagination behavior remain unchanged.

## Phase 97: Deep Table Split Boundary

Goal:

- add a pure deep table split readiness boundary over canonical document v3
  table structure without implementing concrete non-text table-cell splitting,
  pagination execution, text measurement execution, renderer execution, storage
  writes, or package/document mutation.

Deliverables:

- deep table split readiness planner in `src/pagination/deepTableSplit.ts`;
- public exports for deep table split source/mode constants and
  `createVNextDeepTableSplitPlan(...)`;
- row strategy classification for text-line split candidates, explicit atomic
  rows, empty rows, and blocked deep-content rows;
- cell child policy classification for splittable text, atomic blocks,
  generated atomic content, ignored page breaks, and unsupported children;
- blocking issues for missing rows/cells, unsupported children, and deferred
  non-text table-cell child splitting;
- engine contract that records `executesPagination = false`,
  `executesConcreteLayout = false`, `mayRelayoutDocument = false`,
  `mutatesDocument = false`, and `supportsNonTextChildSplit = false`;
- boundary tests for text-only readiness, mixed/non-text blocking, source
  independence, and documentation trail;
- boundary documentation and ledger/README updates.

Acceptance:

- boundary consumes canonical document v3 table structure and does not accept
  legacy/prototype table shapes;
- text-only breakable rows are classified as current line-range split
  candidates;
- breakable rows with non-text or mixed cell children are blocked rather than
  silently claimed as deep-splittable;
- `allowBreak = false` rows remain explicit atomic rows;
- the boundary does not call pagination execution, layout pipeline execution,
  renderer consumption, export readiness, renderer libraries, storage adapters,
  server frameworks, parent app routes, DOM APIs, or persistence;
- package/document schema and measured pagination behavior remain unchanged.

## Phase 98: Final TOC / Page Resolution Boundary

Goal:

- add a pure post-pagination TOC/page reference resolution boundary over
  canonical document v3 and existing measured pagination output without
  executing pagination, relayout, renderer output, text measurement, storage
  writes, or package/document mutation.

Deliverables:

- final page resolution planner in `src/pagination/pageResolution.ts`;
- public exports for final page resolution source/mode constants and
  `resolveVNextFinalPageReferences(...)`;
- TOC entry output with heading id, heading text, heading level, page index, and
  page number;
- page-number inline status preserving the fact that inline page numbers are
  already resolved inside measured pagination;
- blocked handling for document/pagination id mismatch;
- partial handling for headings without measured fragments;
- resolution contract that records `mayRelayoutDocument = false`,
  `mutatesDocument = false`, `mutatesMeasuredPagination = false`, and
  `writesArtifacts = false`;
- boundary tests for resolved TOC page references, mismatch blocking, source
  independence, and documentation trail;
- boundary documentation and ledger/README updates.

Acceptance:

- boundary consumes canonical document v3 plus `VNextMeasuredPagination`;
- TOC heading entries resolve from measured fragment page indexes/numbers;
- document/pagination id mismatch blocks rather than producing stale references;
- the boundary does not call pagination execution, layout pipeline execution,
  renderer consumption, export readiness, renderer libraries, storage adapters,
  server frameworks, parent app routes, DOM APIs, or persistence;
- package/document schema and measured pagination behavior remain unchanged.

## Phase 99: Exact Output Close Audit

Goal:

- close the current Exact Output / Renderer foundation pass by recording
  PASS/FAIL/RISK/UNKNOWN evidence for Phases 93-98 without implementing new
  runtime behavior.

Deliverables:

- close audit in `docs/EXACT_OUTPUT_CLOSE_AUDIT.md`;
- PASS evidence for PDF adapter, DOCX adapter, renderer-backed text
  measurement boundary, pausable layout job engine, deep table split readiness,
  and final TOC/page resolution;
- RISK/UNKNOWN sections that explicitly keep concrete renderers, renderer
  measurement engines, deep layout execution, TOC reflow, artifact storage,
  backend routes, and worker runtime as future work;
- files changed, behavior changed, tests run, risks left, and intentionally not
  changed sections;
- README, phase ledger, and test coverage updates.

Acceptance:

- audit cites the relevant modules, docs, and tests;
- audit does not claim concrete PDF/DOCX bytes, artifact storage, renderer
  measurement execution, deep table split execution, TOC text rewrite/reflow,
  backend routes, or worker runtime;
- audit confirms package/document schema, parent runtime imports, storage
  writes, network writes, and measured pagination mutation were not changed;
- focused boundary tests and root checks pass.

## Phase 100: Text Measurement Engine Spike Boundary

Goal:

- add a pure text measurement engine spike boundary that records font assets,
  shaping candidates, line-break candidates, Thai oracle candidates, cache
  profile ingredients, and production-binding blockers before any concrete
  measurement engine replaces pagination measurement.

Deliverables:

- text measurement engine spike planner in
  `src/renderer/textMeasurementEngineSpike.ts`;
- public exports for text measurement engine spike source/mode constants and
  `createVNextTextMeasurementEngineSpikePlan(...)`;
- font asset readiness facts for family, style, weight, format, source,
  license, revision, availability, and optional hash;
- shaping candidate facts for HarfBuzz or future engines, including glyph
  advances, cluster mapping, complex text, determinism, and package boundary;
- line-break candidate facts for ICU4X, Intl.Segmenter, UAX #14/libunibreak,
  LibThai, PyThaiNLP, AttaCut, or custom engines;
- explicit roles for primary candidate, comparison baseline, Thai oracle, and
  rejected candidates;
- profile candidate id built from font, shaper, line-break, and policy
  ingredients;
- blocking issues for production pagination binding, missing fonts, missing or
  unsafe primary shaper, missing or unsafe primary line breaker, runtime-
  dependent primary line breaking, missing Thai support, and missing Unicode
  line-break policy;
- warnings for unavailable comparison fonts, unhashed available fonts, and
  missing Thai oracle coverage;
- boundary documentation and ledger/README updates.

Acceptance:

- HarfBuzz plus ICU4X can be represented as the primary deterministic spike
  path with Intl.Segmenter as comparison-only baseline and a Thai oracle path
  recorded separately;
- Intl.Segmenter is blocked when selected as the primary truth because it is
  runtime-dependent;
- production pagination measurement replacement is explicitly blocked by this
  spike boundary;
- profile identity is stable only when required font hashes and engine
  revisions are recorded;
- the boundary does not import concrete shaping, segmentation, renderer,
  browser, storage, server, parent-app, or legacy runtime dependencies;
- package/document schema and measured pagination behavior remain unchanged.

## Phase 101: Font Registry Spike Boundary

Goal:

- add a pure font registry spike boundary that records Thai font asset,
  license, hash, target, and style-key mapping facts before font files are
  copied, read, hashed, persisted, or used by a concrete measurement engine.

Deliverables:

- font registry spike planner in `src/renderer/fontRegistrySpike.ts`;
- public exports for font registry spike source/mode constants and
  `createVNextFontRegistrySpikePlan(...)`;
- asset facts for font id, family, style, weight, format, role, availability,
  source reference, target reference, license, hash, revision, and supported
  scripts;
- style-key mapping facts from measured-pagination style keys to primary and
  fallback font ids;
- `measurementFontAssets` projection compatible with the Phase 100 text
  measurement engine spike plan;
- profile candidate id built from registry id, policy revision, font ids, and
  sha256 hashes;
- blocking issues for production measurement binding, missing registry/policy
  identity, duplicate font ids, invalid font facts, available fonts without
  vNext workspace targets, legacy target paths, missing/unverified licenses,
  missing/non-sha256 hashes, missing primary Thai fonts, and broken required
  style mappings;
- warning issues for legacy source references that remain evidence only;
- boundary documentation and ledger/README updates.

Acceptance:

- Sarabun and Noto Sans Thai can be represented as a Thai measurement font set
  with verified license/hash facts and style-key mappings;
- old FlowDocEditor font paths can appear only as non-canonical source
  references, never as vNext target paths;
- registry facts can feed the Phase 100 engine spike without reading files;
- missing license/hash facts and broken required style mappings block;
- the boundary does not read or copy font files, compute hashes, import font
  parsers/renderers, bind production pagination, or mutate schema;
- package/document schema and measured pagination behavior remain unchanged.

## Phase 102: Font Ownership Clearing Boundary

Goal:

- clear the font ownership risk by selecting the vNext-owned package asset root,
  browser mirror policy, and hash authority before any font file copy, hash
  scan, package metadata update, or concrete measurement engine integration.

Deliverables:

- font ownership planner in `src/renderer/fontOwnership.ts`;
- public exports for font ownership source/mode constants and
  `createVNextFontOwnershipPlan(...)`;
- canonical owner decision: package font assets under `assets/fonts`;
- browser mirror decision: `public/fonts` may serve copied fonts but must not
  define measurement identity, hashes, or cache keys;
- planned copy records from non-canonical source references to vNext-owned
  package asset targets;
- registry update policy requiring `package-font-asset` targets, verified
  licenses, and sha256 hashes computed from copied vNext target files;
- blocking issues for public/legacy/absolute canonical roots, source references
  marked canonical, legacy targets, target paths outside the canonical root,
  parent directory segments, browser-public canonical targets, and hashes
  derived from source references or browser mirrors;
- warning issues for old FlowDocEditor source references that remain evidence
  only;
- boundary documentation and ledger/README updates.

Acceptance:

- `assets/fonts` is cleared as the measurement identity root;
- old FlowDocEditor font paths can seed planned copy records only as
  non-canonical source references;
- `public/fonts` is mirror-only and cannot be measurement identity;
- hashes must be computed from the copied vNext-owned target files;
- Phase 101 font registry facts accept `package-font-asset` targets after the
  copy/hash step;
- the boundary does not read or copy font files, compute hashes, update package
  metadata, import font parsers/renderers, bind production pagination, or mutate
  schema;
- package/document schema and measured pagination behavior remain unchanged.

## Phase 103: Font Asset Copy / Hash Evidence

Goal:

- copy the selected Thai font files into the vNext-owned package asset root and
  record sha256 evidence from those target copies before any font parser,
  shaping engine, line breaker, renderer, or production measurement binding is
  introduced.

Deliverables:

- copied Sarabun and Noto Sans Thai font files under `assets/fonts`;
- copied OFL license files under `assets/fonts`;
- font asset evidence manifest at `assets/fonts/font-assets.v1.json`;
- sha256 hashes and byte sizes computed from copied vNext-owned target files;
- non-canonical source references to the old FlowDocEditor font folder;
- package distribution metadata includes `assets`;
- boundary documentation and ledger/README updates;
- focused tests that recompute file hashes and validate registry/engine spike
  handoff.

Acceptance:

- copied target files exist under `assets/fonts` only;
- manifest hash authority is `vnext-target-copy`;
- old FlowDocEditor paths remain source references with `canonical = false`;
- every copied font and license file has a matching byte size and sha256 hash;
- OFL license files are present for Sarabun and Noto Sans Thai;
- the manifest can feed Phase 101 font registry facts and Phase 100 measurement
  engine spike facts without replacing pagination measurement;
- the package file list includes `assets`;
- package/document schema and measured pagination behavior remain unchanged.

## Phase 104: Measurement Profile Identity Contract

Goal:

- define stable `measurementProfileId` construction from copied font hashes,
  style mappings, shaping engine identity, segmentation data identity,
  line-break policy, fallback policy, and output shape before any concrete
  measurement engine runs.

Deliverables:

- measurement profile identity planner in
  `src/renderer/measurementProfileIdentity.ts`;
- public exports for measurement profile identity source/mode constants and
  `createVNextMeasurementProfileIdentityPlan(...)`;
- identity ingredients for font assets, style mappings, shaper identity,
  segmenter identity, fallback policy, and output shape version;
- deterministic `measurementProfileId` parts that change when font hashes,
  shaper revision, segmenter revision/data, or policy inputs change;
- blocking issues for production binding, missing font hashes, broken style
  mappings, missing engine revisions, nondeterministic/runtime-dependent
  primary segmentation, blocked package boundaries, unsupported fallback
  policy, and missing output shape;
- boundary documentation and ledger/README updates.

Acceptance:

- copied Phase 103 font hashes can produce a stable profile id;
- changing a font hash, shaper revision, or segmenter data revision changes the
  profile id;
- `Intl.Segmenter` is blocked as primary truth when runtime-dependent;
- the contract does not read font files, compute hashes, import engines,
  execute shaping/segmentation, replace pagination measurement, or mutate
  schema;
- package/document schema and measured pagination behavior remain unchanged.

## Phase 105: Rust/WASM Text Engine Boundary Decision

Goal:

- decide where the future rustybuzz + ICU4X text engine may live while keeping
  the vNext core package dependency-clean and deterministic.

Deliverables:

- Rust/WASM text engine boundary planner in
  `src/renderer/rustWasmTextEngineBoundary.ts`;
- public exports for Rust/WASM text engine source/mode constants and
  `createVNextRustWasmTextEngineBoundaryPlan(...)`;
- selected placement: future external adapter package that provides
  renderer-backed text measurement facts;
- core contract forbidding direct WASM imports and Rust/WASM build ownership;
- runtime contract for Node/browser/worker targets without network runtime
  dependency;
- blockers for direct core dependency, core WASM imports, core-owned WASM
  builds, missing renderer-backed adapter handoff, missing revisions,
  nondeterministic engines, missing runtime targets, and network runtime
  requirements;
- warning for missing WASM digest before production measurement;
- boundary documentation and ledger/README updates.

Acceptance:

- rustybuzz + ICU4X are cleared only as future external adapter work;
- vNext core does not import Rust, WASM, font parser, browser, or renderer
  dependencies;
- the adapter must feed the existing renderer-backed text measurement boundary;
- production measurement binding remains blocked;
- package/document schema and measured pagination behavior remain unchanged.

## Phase 106: Thai Corpus / Oracle Boundary

Goal:

- add a small Thai measurement corpus and oracle comparison boundary before
  executing ICU4X, Intl.Segmenter, LibThai, PyThaiNLP, AttaCut, shaping, or
  pagination replacement.

Deliverables:

- Thai corpus boundary planner in `src/renderer/thaiCorpusBoundary.ts`;
- public exports for Thai corpus source/mode constants and
  `createVNextThaiCorpusPlan(...)`;
- fixture at `fixtures/thai-measurement-corpus.v1.json`;
- samples covering Thai text, Thai text without spaces, combining marks,
  grapheme/caret concerns, mixed Thai/Latin text, digits, punctuation, and
  mixed scripts;
- primary segmenter policy for ICU4X, comparison baseline policy for
  Intl.Segmenter, and Thai oracle candidates for LibThai/PyThaiNLP/AttaCut;
- blockers for runtime-dependent primary segmenter, missing oracle, missing
  samples, duplicate sample ids, non-Thai locale, and missing category
  coverage;
- boundary documentation and ledger/README updates.

Acceptance:

- corpus coverage includes Thai, no-space Thai, combining marks, Latin, digits,
  punctuation, and mixed-script samples;
- ICU4X is recorded as primary deterministic candidate;
- Intl.Segmenter remains a comparison baseline, not primary truth;
- Thai oracle candidates are recorded before production confidence is claimed;
- no segmenter/oracle library is imported or executed;
- package/document schema and measured pagination behavior remain unchanged.

## Phase 107: Rustybuzz Shaping Smoke Boundary

Goal:

- define the first rustybuzz shaping smoke contract over copied font assets,
  Thai corpus samples, and the stable measurement profile identity without
  executing rustybuzz, loading WASM, or replacing pagination measurement.

Deliverables:

- shaping smoke boundary planner in `src/renderer/rustybuzzShapingSmoke.ts`;
- public exports for rustybuzz shaping smoke source/mode constants and
  `createVNextRustybuzzShapingSmokePlan(...)`;
- fixture at `fixtures/rustybuzz-shaping-smoke.v1.json`;
- smoke cases covering no-space Thai, Thai combining marks, mixed
  Thai/Latin/digit heading text, and Thai currency text;
- required shaping facts for glyph ids, advances, offsets, cluster maps,
  source text ranges, and line box facts;
- blockers for production binding, unstable profile identity, direct core
  dependency placement, core shaping execution, core font-file reads, core WASM
  imports, unknown font/sample references, duplicate case ids, output shape
  mismatch, and missing shaping facts;
- boundary documentation and ledger/README updates.

Acceptance:

- smoke cases reference copied font assets from Phase 103 and corpus samples
  from Phase 106;
- smoke execution remains adapter-owned work beyond the core package boundary;
- no rustybuzz/HarfBuzz/WASM/font parser library is imported or executed;
- production measurement binding remains blocked;
- package/document schema and measured pagination behavior remain unchanged.

## Phase 108: Text Engine Adapter SPI Boundary

Goal:

- define the request/evidence SPI that a future external text engine adapter
  must implement while keeping glyph facts separate from the current
  pagination-facing text measurement draft.

Deliverables:

- text engine adapter SPI planner in `src/renderer/textEngineAdapterSpi.ts`;
- public exports for text engine adapter SPI source/mode constants and
  `createVNextTextEngineAdapterSpiPlan(...)`;
- adapter request contracts carrying measurement profile id, text, corpus
  sample id, font id, style key, available width, output shape version, and
  requested glyph facts;
- future evidence contracts for glyph ids, advances, offsets, cluster ranges,
  and line box facts;
- smoke-to-request mapping from Phase 107 cases and Phase 106 corpus samples;
- evidence-lane contract:
  `glyph-facts-separate-from-pagination-draft`;
- blockers for production binding, unstable profile identity, direct core
  dependency placement, core engine/WASM imports, core font-file reads, core
  shaping/segmentation execution, missing engine revisions, nondeterminism,
  unknown font/sample references, missing shaping facts, and invalid request
  width;
- boundary documentation and ledger/README updates.

Acceptance:

- Phase 107 smoke cases can be converted into adapter requests without running
  an engine;
- core does not import rustybuzz/HarfBuzz/ICU4X/WASM/font parser dependencies;
- glyph facts remain adapter evidence and do not mutate
  `VNextTextMeasurementDraft`;
- package/document schema and measured pagination behavior remain unchanged.

## Phase 109: Text Engine Evidence Acceptance Boundary

Goal:

- validate adapter-produced glyph and line evidence before any pagination-facing
  measurement draft handoff.

Deliverables:

- text engine evidence acceptance planner in
  `src/renderer/textEngineEvidenceAcceptance.ts`;
- public exports for text engine evidence acceptance source/mode constants and
  `createVNextTextEngineEvidenceAcceptancePlan(...)`;
- validation that evidence request id, measurement profile id, output shape,
  engine revisions, deterministic engine flag, glyph facts, cluster ranges, line
  box facts, and line glyph coverage match the adapter request;
- blockers for production binding, core engine execution, pagination draft
  mutation, request/profile/output/engine mismatch, missing evidence, malformed
  glyph facts, malformed line boxes, and incomplete glyph coverage;
- boundary documentation and ledger/README updates.

Acceptance:

- accepted evidence remains on the glyph fact evidence lane;
- accepted evidence does not create or mutate `VNextTextMeasurementDraft`;
- no rustybuzz/HarfBuzz/ICU4X/WASM/font parser library is imported or executed;
- package/document schema and measured pagination behavior remain unchanged.

## Phase 110: Text Engine Measurement Draft Handoff Boundary

Goal:

- transform accepted text engine evidence into the current
  pagination-facing `VNextTextMeasurementDraft` without adding glyph facts to
  the draft or replacing pagination measurement.

Deliverables:

- measurement draft handoff planner in
  `src/renderer/textEngineMeasurementDraftHandoff.ts`;
- public exports for measurement draft handoff source/mode constants and
  `createVNextTextEngineMeasurementDraftHandoffPlan(...)`;
- derivation of draft lines from accepted evidence text ranges;
- derivation of draft line boxes, width, height, and line height from accepted
  line box facts;
- blockers for production binding, non-accepted evidence, missing accepted
  evidence, request/profile/output mismatch, core engine execution, evidence
  mutation, attaching glyph facts to the draft, replacing pagination measurer,
  and malformed line ranges or metrics;
- boundary documentation and ledger/README updates.

Acceptance:

- accepted evidence can produce a `VNextTextMeasurementDraft`;
- glyph facts are dropped from the draft and remain available only as evidence;
- no rustybuzz/HarfBuzz/ICU4X/WASM/font parser library is imported or executed;
- package/document schema and measured pagination behavior remain unchanged.

## Phase 111: Text Engine Adapter Lane Close Audit

Goal:

- close the core-side text engine adapter/evidence lane foundation and make the
  remaining adapter/runtime risks explicit.

Deliverables:

- close audit in `docs/TEXT_ENGINE_ADAPTER_LANE_CLOSE_AUDIT.md`;
- audit coverage for Phases 104-110;
- PASS / FAIL-BLOCKER / RISK / UNKNOWN sections;
- files changed, behavior changed, tests run, risks left, and intentionally not
  changed sections;
- boundary documentation and ledger/README updates.

Acceptance:

- the audit confirms the core contract lane is complete from measurement
  profile identity through adapter request, evidence acceptance, and measurement
  draft handoff;
- the audit does not claim concrete rustybuzz/WASM/ICU4X execution;
- remaining risks are explicitly external adapter/runtime work;
- package/document schema and measured pagination behavior remain unchanged.

## Phase 112: Text Engine Adapter Package Scaffold

Goal:

- create the external adapter package lane before real rustybuzz/WASM or ICU4X
  implementation.

Deliverables:

- package scaffold at `packages/text-engine-rust-wasm`;
- package metadata for `@flowdoc/text-engine-rust-wasm`;
- adapter source that imports public core contracts with type-only
  `@flowdoc/vnext-core` imports;
- local TypeScript config resolution for the public `@flowdoc/vnext-core`
  package name;
- deterministic mock evidence provider returning
  `VNextTextEngineAdapterEvidence`;
- tests proving Phase 108 requests can flow through the package, Phase 109 can
  accept mock evidence, and Phase 110 can derive a draft;
- tests proving core `src/**` does not import the adapter package back;
- boundary documentation and ledger/README updates.

Acceptance:

- the adapter package exists outside core source;
- mock evidence can complete the request/evidence/handoff lane;
- no rustybuzz/HarfBuzz/ICU4X/WASM/font parser library is imported or executed;
- production measurement binding remains blocked;
- package/document schema and measured pagination behavior remain unchanged.

## Phase 113: Text Engine Rustybuzz Smoke Package Boundary

Goal:

- execute the first real rustybuzz smoke path inside the external adapter
  package while keeping vNext core independent from Rust, WASM, font-file
  reads, and production measurement binding.

Deliverables:

- package-local Rust smoke crate under
  `packages/text-engine-rust-wasm/rust-shaper`;
- pinned `rustybuzz = "=0.20.1"` dependency for the smoke crate;
- CLI smoke that reads a copied vNext font asset, shapes supplied text, and
  prints raw glyph ids, clusters, advances, offsets, glyph count, and
  units-per-em as JSON;
- raw package-local smoke-output fixture from the first successful Sarabun
  smoke run, kept separate from accepted FlowDoc glyph evidence;
- package script for the bounded smoke command;
- tests proving real rustybuzz execution stays outside `src/**` and outside the
  TypeScript adapter evidence path;
- boundary documentation and ledger/README updates.

Acceptance:

- the rustybuzz dependency is package-local to the external adapter lane;
- copied vNext font assets can be passed to the smoke command explicitly;
- core `src/**` still does not import the adapter package, rustybuzz, WASM, or
  font-file access;
- WASM build/loading remains recorded as a separate gap until toolchain and
  runtime loader phases land;
- package/document schema and measured pagination behavior remain unchanged.

## Phase 114: Text Engine Rustybuzz Raw Mapping Boundary

Goal:

- convert raw rustybuzz smoke JSON into adapter evidence by explicitly mapping
  UTF-8 byte clusters to UTF-16 text ranges and font units to point units.

Deliverables:

- package-local raw mapper under
  `packages/text-engine-rust-wasm/src/rustybuzzRawMapping.ts`;
- validation for request text/font, shaper revision, glyph count, byte length,
  scalar count, glyph ids, advances, offsets, and UTF-8 cluster boundaries;
- mapping contract that records cluster input/output units and advance
  input/output units;
- single-line smoke line box generation for acceptance-boundary validation;
- tests proving mapped raw Sarabun evidence passes Phase 109 acceptance;
- tests proving unsafe raw clusters and mismatched metadata are blocked;
- boundary documentation and ledger/README updates.

Acceptance:

- raw rustybuzz byte clusters are never used directly as FlowDoc offsets;
- mapped evidence uses UTF-16 text ranges and point units;
- the mapper remains package-local and core `src/**` still does not import the
  adapter package, rustybuzz, WASM, or font-file access;
- WASM loading, ICU4X line breaks, and production measurement binding remain
  blocked;
- package/document schema and measured pagination behavior remain unchanged.

## Phase 115: Text Engine Rustybuzz Smoke Corpus Boundary

Goal:

- run the native rustybuzz smoke/mapping lane across every Phase 107 smoke case
  instead of a single Sarabun sample.

Deliverables:

- raw rustybuzz smoke fixtures for all Phase 107 smoke cases;
- package-local raw fixture manifest;
- corpus harness under
  `packages/text-engine-rust-wasm/src/rustybuzzSmokeCorpus.ts`;
- coverage summary across cases, samples, fonts, styles, glyphs,
  zero-advance glyphs, and repeated-cluster cases;
- tests proving all mapped cases pass Phase 109 evidence acceptance;
- tests proving partial or duplicate corpus evidence is blocked;
- boundary documentation and ledger/README updates.

Acceptance:

- every Phase 107 smoke case has a raw rustybuzz fixture;
- every raw fixture maps through Phase 114 into adapter evidence;
- every mapped evidence object passes Phase 109 evidence acceptance;
- the harness remains package-local and core `src/**` still does not import the
  adapter package, rustybuzz, WASM, or font-file access;
- WASM parity, ICU4X line breaks, multi-line wrapping, and production
  measurement binding remain blocked;
- package/document schema and measured pagination behavior remain unchanged.

## Phase 116: WYSIWYG Re-entry Audit

Goal:

- re-enter the WYSIWYG / Editing lane after the text-engine evidence work and
  define managed phase cards through Phase 120.

Deliverables:

- re-entry audit in `docs/TEMPLATE_BUILDER_WYSIWYG_REENTRY_AUDIT.md`;
- PASS/FAIL/RISK/UNKNOWN review linking Phase 85 and Phases 113-115;
- explicit phase cards for Phases 117-120;
- tests proving the audit does not claim runtime behavior or production rich
  editing;
- README and ledger updates.

Acceptance:

- Phase 85 browser-local foundation remains the WYSIWYG starting point;
- Phase 113-115 text-engine evidence remains visible for future caret/range
  work through UTF-16 FlowDoc offsets, not raw rustybuzz byte clusters;
- contenteditable mapping, rich inline patch execution, toolbar dispatch, and
  field chip insertion are sequenced as separate boundaries;
- no package/document schema, runtime behavior, history, live layout, exact
  output, backend, persistence, collaboration, or WASM behavior changes.

## Phase 117: Contenteditable Range Mapping Boundary

Goal:

- add the first managed Phase 116 follow-up by mapping bounded
  contenteditable-like segment facts into FlowDoc draft UTF-16 ranges.

Scope:

- browser-safe `draftContenteditableRangeMapping.js` module;
- app evidence through `data-draft-contenteditable-range`;
- action lane for `browser.mapContenteditableRange`;
- executable tests for ready, composing, styled-run, atomic-inline, and
  text-mismatch paths;
- README, ledger, and phase documentation.

Acceptance:

- plain segment facts map anchor/focus endpoints to
  `utf16-code-unit-offset` ranges;
- styled runs, atomic inline/field-chip segments, invalid segment coverage,
  text mismatch, and invalid endpoints block explicitly;
- mapper output keeps application not-applied, core transaction not-run,
  history not-recorded, live layout not-requested, exact generation deferred,
  and text engine not-executed;
- no production DOM `Range` binding, package mutation, rich inline execution,
  toolbar dispatch, field-ref insertion, persistence, backend, collaboration,
  exact output, live layout, or WASM execution.

## Phase 118: Rich Inline Patch Execution Boundary

Goal:

- execute ready rich inline style patch intent into browser-local styled-run
  facts using the Phase 117 mapped range.

Scope:

- browser-safe `draftRichInlinePatchExecution.js` module;
- app evidence through `data-draft-rich-inline-execution`;
- action lane for `browser.executeRichInlinePatch`;
- executable tests for applied, guarded, blocked, and composing paths;
- README, ledger, and phase documentation.

Acceptance:

- ready Phase 117 range mapping and Phase 81 style intent produce one bounded
  browser-local styled run;
- plain draft text is preserved while styled-run facts record mark, enabled
  state, range, selected text, and source command;
- collapsed/unready style or range states remain guarded; target mismatches and
  unsupported marks remain blocked; composition remains composing;
- package mutation, core transaction, history, live layout, exact output,
  backend API, persistence, collaboration, and WASM/text-engine execution stay
  deferred/off.

## Phase 119: Toolbar Command Dispatch Boundary

Goal:

- wire visible draft toolbar style commands through the Phase 118 rich inline
  execution boundary.

Scope:

- browser-safe `draftToolbarCommandDispatch.js` module;
- inspector toolbar buttons through `data-draft-toolbar-command`;
- app evidence through `data-draft-toolbar-dispatch`;
- action lane for `browser.dispatchDraftToolbarCommand`;
- tests for ready, dispatched, blocked, guarded, composing, and idle paths;
- README, ledger, and phase documentation.

Acceptance:

- dispatch requires ready toolbar control state and rich inline execution for
  the requested style mark;
- command dispatch produces browser-local patch results, not canonical package
  mutations;
- active mark state remains explicit and guarded while unknown;
- collapsed ranges, composition, unsupported style marks, inactive drafts, and
  unready rich inline execution remain guarded or blocked;
- package mutation, core transaction, history, live layout, exact output,
  backend API, persistence, collaboration, and WASM/text-engine execution stay
  deferred/off.

## Phase 120: Field Chip Insert Execution Boundary

Goal:

- execute ready field chip insertion intent into browser-local atomic chip facts
  at mapped caret positions.

Scope:

- browser-safe `draftFieldChipInsertExecution.js` module;
- app evidence through `data-draft-field-chip-insert`;
- action lane for `browser.executeDraftFieldChipInsert`;
- tests for inserted, guarded, blocked, composing, and idle paths;
- README, ledger, and phase documentation.

Acceptance:

- ready Phase 117 caret mapping and Phase 83 field chip intent produce one
  browser-local atomic chip fact;
- plain draft text is preserved and existing browser-local styled runs can be
  carried forward;
- non-collapsed ranges, missing field catalog, unsupported rich inline state,
  inactive drafts, and composition remain guarded or blocked;
- canonical field-ref mutation, key migration, package mutation, core
  transaction, history, live layout, exact output, backend API, persistence,
  collaboration, and WASM/text-engine execution stay deferred/off.

## Phase 121: WYSIWYG Execution Re-baseline Audit

Goal:

- close the first post-re-entry WYSIWYG execution pass after Phases 117-120 and
  sequence the next browser-local-to-canonical editing cards.

Deliverables:

- re-baseline audit in
  `docs/TEMPLATE_BUILDER_WYSIWYG_EXECUTION_REBASELINE_AUDIT.md`;
- PASS/FAIL/RISK/UNKNOWN review of Phase 117 contenteditable range mapping,
  Phase 118 rich inline patch execution, Phase 119 toolbar dispatch, and Phase
  120 field chip insert execution;
- explicit phase cards for Phases 122-126;
- tests proving the audit does not claim production DOM binding or canonical
  rich inline commits;
- README and ledger updates.

Acceptance:

- Phase 117-120 browser-local execution evidence remains visible and linked;
- package mutation, canonical field-ref insertion, durable history, live
  layout, exact output, backend API, persistence, collaboration, and
  WASM/text-engine execution remain explicitly deferred/off;
- next cards start with browser-local rich inline state consolidation before
  production contenteditable capture or canonical commit execution;
- no package/document schema, runtime behavior, backend, persistence,
  collaboration, renderer, or WASM behavior changes.

## Phase 122: Browser-local Rich Inline State Boundary

Goal:

- consolidate browser-local plain text, styled-run facts, toolbar patch
  results, and atomic field-chip facts into one normalized rich inline draft
  state before canonical commit planning.

Deliverables:

- browser-safe rich inline state module at
  `examples/template-builder-sandbox/public/draftRichInlineState.js`;
- visible sandbox summary through `data-draft-rich-inline-state`;
- action lane for `browser.normalizeDraftRichInlineState`;
- boundary doc in `docs/TEMPLATE_BUILDER_RICH_INLINE_STATE_BOUNDARY.md`;
- tests proving text-only, ready style-plus-chip, overlapping-style blocked,
  and composing paths.

Acceptance:

- styled runs and atomic chips are deterministically ordered by UTF-16
  positions;
- plain draft text is preserved and text drift is blocked;
- overlapping/ambiguous rich inline facts are blocked instead of silently
  flattened;
- package mutation, canonical field-ref insertion, durable history, live
  layout, exact output, backend API, persistence, collaboration, and
  WASM/text-engine execution stay deferred/off.

## Phase 123: Contenteditable Segment Capture Boundary

Goal:

- insert a bounded browser-local segment capture step before Phase 117 range
  mapping so future contenteditable surfaces can emit deterministic text,
  styled-run, and atomic-chip facts without mutating canonical package state.

Deliverables:

- browser-safe segment capture module at
  `examples/template-builder-sandbox/public/draftContenteditableSegmentCapture.js`;
- visible sandbox summary through
  `data-draft-contenteditable-segment-capture`;
- hidden contenteditable-style draft capture surface in the sandbox app;
- action lane for `browser.captureContenteditableSegments`;
- boundary doc in
  `docs/TEMPLATE_BUILDER_CONTENTEDITABLE_SEGMENT_CAPTURE_BOUNDARY.md`;
- tests proving ready plain capture, DOM-like styled/atomic capture,
  range-mapper handoff, root/text/target blockers, and composition guard paths.

Acceptance:

- captured plain-text segment facts can feed Phase 117 mapping;
- styled-run marks and atomic field-chip metadata are preserved as browser-local
  evidence;
- non-contenteditable roots, target drift, text drift, invalid segment facts,
  missing atomic keys, and invalid selection endpoints are blocked;
- package mutation, canonical rich inline commit, canonical field-ref
  insertion, durable history, live layout, exact output, backend API,
  persistence, collaboration, and WASM/text-engine execution stay deferred/off.

## Phase 124: Canonical Rich Inline Commit Planning Boundary

Goal:

- map browser-local rich inline draft state to canonical vNext inline commit
  facts without executing package mutation.

Deliverables:

- browser-safe commit planner module at
  `examples/template-builder-sandbox/public/draftRichInlineCommitPlan.js`;
- visible sandbox summary through `data-draft-rich-inline-commit-plan`;
- action lane for `browser.planRichInlineCommit`;
- boundary doc in
  `docs/TEMPLATE_BUILDER_RICH_INLINE_COMMIT_PLANNING_BOUNDARY.md`;
- tests proving planned style+field commits, text-only commits, stale revision
  blocking, text mismatch blocking, missing field-key blocking, overlap
  blocking, and composition guard paths.

Acceptance:

- browser-local text segments map to planned canonical `text` inline children
  with vNext style objects;
- browser-local atomic chips map to planned canonical `field-ref` inline
  children with key/label/fallback metadata;
- required transaction, dirty-scope, history, key-history, renderer
  invalidation, live-layout invalidation, and exact-output stale facts are
  named;
- unsupported overlap, stale revision, missing field key, target drift, and
  text mismatch are blocked;
- package mutation, canonical field-ref insertion execution, durable history,
  live layout execution, exact output execution, backend API, persistence,
  collaboration, and WASM/text-engine execution stay deferred/off.

## Phase 125: Rich Inline Commit Bridge Boundary

Goal:

- execute accepted Phase 124 rich inline commit plans through a vNext-native
  in-memory package mutation path.

Deliverables:

- core rich inline commit helper at `src/authoring/richInlineCommit.ts`;
- history-ready rich inline command records through the authoring history
  boundary;
- sandbox mutation bridge method and API route for Phase 124 plans;
- app action for `commit-rich-inline` separate from the plain text commit path;
- action lane for `sandbox.commitRichInlineDraft`;
- boundary doc in
  `docs/TEMPLATE_BUILDER_RICH_INLINE_COMMIT_BRIDGE_BOUNDARY.md`;
- tests proving core replacement, bridge packet updates, history-ready records,
  stale-plan rejection, invalid-plan rejection, live/exact invalidation, and
  package/DOM independence.

Acceptance:

- bridge execution consumes Phase 124 `text-block.rich-inline.replace` plans
  only;
- package mutation and history-ready records are produced through vNext-native
  code, not parent runtime code;
- live/exact outputs are invalidated through existing contracts without
  rendering artifacts;
- stale plan revisions and invalid inline children are rejected before mutation;
- persistence, collaboration, renderer output, and WASM/text-engine replacement
  remain out of scope.

## Phase 126: WYSIWYG Execution Close Audit

Goal:

- close the Phase 122-125 WYSIWYG execution foundation pass and decide the next
  risk-bearing lanes without claiming production WYSIWYG completion.

Deliverables:

- close audit in
  `docs/TEMPLATE_BUILDER_WYSIWYG_EXECUTION_CLOSE_AUDIT.md`;
- PASS/FAIL/RISK/UNKNOWN review of rich inline state, contenteditable segment
  capture, commit planning, and commit bridge execution;
- explicit next cards for rich undo/redo replay, production contenteditable
  hardening, rich persistence/session behavior, and rich live/exact parity;
- tests proving the close audit cites Phase 122-125 docs, code, and tests.

Acceptance:

- confirms Phase 122-125 evidence as a foundation close only;
- confirms no parent runtime import, legacy runtime adoption, old document
  shape acceptance, persistence write, collaboration behavior, renderer output,
  or WASM/text-engine execution was introduced;
- records remaining production gaps with phase-ready labels;
- does not add runtime behavior.

## Phase 127: Rich Inline Undo/Redo Replay Boundary

Goal:

- replay accepted rich inline commit patches through sandbox undo/redo using
  the vNext-native rich inline replacement helper.

Deliverables:

- mutation bridge undo/redo patch union for plain text and rich inline patches;
- rich inline before/after child capture when accepted plans commit;
- rich inline history replay helper that calls `runVNextRichInlineCommit(...)`;
- action lane for `sandbox.replayRichInlineHistory`;
- boundary doc in
  `docs/TEMPLATE_BUILDER_RICH_INLINE_UNDO_REDO_REPLAY_BOUNDARY.md`;
- tests proving rich commit -> undo -> redo packet behavior and unchanged
  plain text undo/redo behavior.

Acceptance:

- accepted rich inline commits become undoable in the sandbox bridge;
- undo restores the previous vNext inline children and redo restores styled
  text plus field chips;
- replay updates revision, mutation count, dirty scopes, bounded packets, and
  live/exact invalidation summaries;
- replay does not route rich inline content through plain text transactions;
- persistence, collaboration, renderer output, and WASM/text-engine replacement
  remain out of scope.

## Phase 128: Production Contenteditable Surface Hardening Boundary

Goal:

- harden the browser-local production contenteditable surface before it becomes
  the primary editing input.

Deliverables:

- browser-safe hardening module at
  `examples/template-builder-sandbox/public/draftContenteditableSurfaceHardening.js`;
- nested DOM-like selection endpoint resolution back to segment id, UTF-16
  offset, absolute draft value, direction, collapsed state, and caret affinity;
- drift guards for root id, target text block, plain text, selection endpoint,
  segment capture readiness, range mapper status, and IME composition;
- action lane for `browser.hardenContenteditableSurface`;
- visible sandbox summaries through `data-draft-contenteditable-surface-hardening`;
- boundary doc in
  `docs/TEMPLATE_BUILDER_CONTENTEDITABLE_SURFACE_HARDENING_BOUNDARY.md`;
- tests proving ready nested-selection hardening, styled range-mapper guard
  carry-through, blocked drift cases, composition guard behavior, and unchanged
  package mutation boundaries.

Acceptance:

- a contenteditable root with nested text nodes can resolve DOM-like selection
  endpoints into deterministic vNext draft offsets;
- styled-run content does not get flattened only to satisfy the old plain range
  mapper;
- root/target/text/selection drift and IME composition are blocked before
  package mutation;
- package mutation, persistence, collaboration, renderer output, and
  WASM/text-engine replacement remain out of scope.

## Phase 129: Rich Inline Persistence / Session Boundary

Goal:

- prepare rich inline commits and replay patches for future session
  persistence without implementing a concrete storage adapter.

Deliverables:

- core record creator at
  `src/authoring/richInlineSessionPersistence.ts`;
- rich inline replay patch records with before/after vNext inline children,
  target text block id, group id, history sequence, field-key summary,
  validation status, and not-run replay status;
- composition with Phase 87 canonical package session storage records and
  Phase 88 durable history snapshots;
- public export through `src/index.ts`;
- action lane for `sandbox.planRichInlineSessionPersistence`;
- boundary doc in
  `docs/TEMPLATE_BUILDER_RICH_INLINE_SESSION_PERSISTENCE_BOUNDARY.md`;
- tests proving package/history/replay payload composition, invalid replay
  patch reporting, JSON safety, source independence, and phase-trail updates.

Acceptance:

- accepted rich inline commits can produce a JSON-safe persistence record that
  contains package truth, durable authoring history, and rich replay patches;
- invalid replay patch payloads are reported without running replay;
- storage writes, backend routes, replay execution, selection restoration,
  collaboration, renderer output, and WASM/text-engine replacement remain out
  of scope.

## Phase 130: Rich Inline Live/Exact Parity Audit

Goal:

- audit the rich inline commit/replay/session trail for live layout and exact
  generation stale-signal parity without implementing renderer artifacts.

Deliverables:

- audit doc in
  `docs/TEMPLATE_BUILDER_RICH_INLINE_LIVE_EXACT_PARITY_AUDIT.md`;
- tests proving direct rich inline commit dirty scopes mark live layout and
  exact generation stale;
- tests proving sandbox rich inline commit, undo, and redo packets expose the
  same bounded `liveLayout` stale summary;
- tests proving rich inline session persistence records continue to exclude
  live layout, exact layout, and renderer artifacts;
- README, phase ledger, and roadmap updates.

Acceptance:

- accepted rich inline commits and replay mutations carry text-content dirty
  scopes into `resolveVNextLiveLayoutBoundary(...)`;
- packet `liveLayout` summaries expose stale live layout and stale exact
  generation with `measured-pagination` as the final truth;
- persistence stays package/history/replay-only and does not store live/exact
  renderer truth;
- primary contenteditable input, storage writes, collaboration, renderer
  artifacts, and WASM/text-engine replacement remain out of scope.

## Phase 131: Five-Lane Project Progress Index

Goal:

- consolidate the project roadmap into one current-status index across
  Viewport / Virtualization, Structural Runtime, WYSIWYG / Editing,
  Backend / API / Persistence, and Exact Output / Renderer.

Deliverables:

- progress index in `docs/FIVE_LANE_PROJECT_PROGRESS_INDEX.md`;
- lane table with phase coverage, current level, completed foundation,
  production gaps, and recommended order;
- PASS/RISK/UNKNOWN consolidation using phase ledger, roadmap, and close audit
  evidence;
- README, phase ledger, and roadmap updates;
- drift test proving the index names all five lanes and cites the key evidence
  docs.

Acceptance:

- each lane clearly names what has been completed, what level it has reached,
  what remains before production, and which docs/tests prove the status;
- the index does not claim runtime behavior, production completion, storage,
  renderer artifacts, collaboration, or primary contenteditable input;
- future phase planning can use the index to choose the next lane without
  rereading the entire phase ledger first.

## Phase 132: ICU4X Line-Break Evidence Manifest Boundary

Goal:

- create a separate line-break evidence manifest for Thai corpus samples
  without mutating the neutral Thai corpus fixture.

Deliverables:

- `fixtures/thai-line-break-evidence.v1.json` with ICU4X primary candidate and
  Intl.Segmenter comparison baseline break opportunities;
- `src/renderer/thaiLineBreakEvidence.ts` pure validator over corpus sample ids,
  candidate roles, engine/data revisions, UTF-16 offsets, and break kinds;
- `docs/THAI_LINE_BREAK_EVIDENCE_BOUNDARY.md`;
- README, phase ledger, and roadmap updates;
- tests proving corpus neutrality, unknown sample/duplicate id rejection,
  deterministic revision requirements, Intl baseline policy, dependency
  cleanliness, and documentation trail.

Acceptance:

- line-break evidence validates separately from the source Thai corpus;
- every evidence entry references an existing corpus sample id;
- ICU4X is the only primary deterministic candidate;
- Intl.Segmenter is comparison baseline only;
- offsets are UTF-16 code unit positions and include the final sample break;
- no segmentation engine, renderer, pagination, storage, schema, or production
  measurement behavior is introduced.

## Phase 133: Multi-Line Wrap Evidence Boundary

Goal:

- consume rustybuzz glyph advances plus Thai line-break opportunities and
  produce multi-line adapter line boxes that existing evidence acceptance and
  measurement draft handoff can accept.

Deliverables:

- `packages/text-engine-rust-wasm/src/lineWrapEvidence.ts` package-local wrap
  evidence boundary;
- public package export from `packages/text-engine-rust-wasm/src/index.ts`;
- exact-once line glyph coverage validation in
  `src/renderer/textEngineEvidenceAcceptance.ts`;
- `docs/TEXT_ENGINE_LINE_WRAP_EVIDENCE_BOUNDARY.md`;
- README, phase ledger, and roadmap updates;
- tests for Thai-only, Thai without spaces, mixed Thai/Latin, combining marks,
  digits/punctuation, narrow width, wide width, acceptance/handoff, overlap
  rejection, dependency cleanliness, and documentation trail.

Acceptance:

- existing rustybuzz smoke corpus evidence can be wrapped into multiple line
  boxes using Phase 132 break opportunities;
- produced evidence passes `createVNextTextEngineEvidenceAcceptancePlan(...)`;
- accepted evidence passes
  `createVNextTextEngineMeasurementDraftHandoffPlan(...)`;
- break reason and break kind stay in the wrap summary instead of widening
  public adapter line boxes;
- `VNextTextMeasurementDraft`, pagination measurement, renderer output,
  production measurement binding, and package/document schema remain unchanged.

## Phase 134: WASM / ICU4X Runtime Identity And Digest Boundary

Goal:

- define the external text-engine runtime identity and digest gate before
  native/WASM parity or production measurement can be claimed.

Deliverables:

- `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`;
- `packages/text-engine-rust-wasm/src/runtimeIdentity.ts`;
- package export from `packages/text-engine-rust-wasm/src/index.ts`;
- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_BOUNDARY.md`;
- README, phase ledger, and roadmap updates;
- tests for identity validation, measurement-profile alignment, missing digest
  blocking when parity-ready is claimed, missing runtime revision blocking,
  valid parity-ready contract shape, dependency cleanliness, and documentation
  trail.

Acceptance:

- runtime identity records rustybuzz revision, ICU4X revision, ICU4X data
  revision, font hashes, measurement profile id, output shape, runtime targets,
  and WASM digest status;
- missing rustybuzz/ICU4X/data revisions block;
- missing WASM digest is allowed as identity-only warning but blocks
  `parity-ready`;
- native/WASM comparison shape exists but is not claimed as run until matching
  evidence exists;
- no WASM loading, ICU4X execution, production measurement binding, renderer
  output, pagination replacement, storage, backend route, or schema change is
  introduced.

## Phase 135: Renderer-Backed Text Measurement Provider Bridge

Goal:

- bridge accepted text-engine evidence into
  `createVNextRendererBackedTextMeasurer(...)` through an external provider
  while keeping production measurement disabled by default.

Deliverables:

- `packages/text-engine-rust-wasm/src/rendererBackedProvider.ts`;
- package export from `packages/text-engine-rust-wasm/src/index.ts`;
- `docs/TEXT_ENGINE_RENDERER_BACKED_PROVIDER_BOUNDARY.md`;
- README, phase ledger, and roadmap updates;
- tests for provider measurement through wrap/acceptance/handoff, wrong
  profile blocking, missing line-box profile blocking, drift reports, default
  measurement independence, dependency cleanliness, and documentation trail.

Acceptance:

- external provider can produce `VNextTextMeasurementDraft` through the
  existing renderer-backed adapter;
- wrong `measurementProfileId` is blocked by the core renderer-backed measurer;
- missing line-box capability is blocked by the existing renderer profile plan;
- drift reports compare approximate and renderer-backed draft summaries;
- default `measureVNextText(...)` behavior, pagination cache/invalidation,
  production binding, renderer output, artifact bytes, and package/document
  schema remain unchanged.

## Phase 136: External Minimal PDF Artifact Spike Package

Goal:

- create an external/private PDF spike package that consumes FlowDoc PDF adapter
  plans and produces minimal text-only PDF bytes.

Deliverables:

- `packages/pdf-renderer-spike/package.json`;
- `packages/pdf-renderer-spike/src/index.ts`;
- `docs/PDF_RENDERER_SPIKE_PACKAGE_BOUNDARY.md`;
- README, phase ledger, and roadmap updates;
- tests for non-empty PDF bytes, stable artifact manifest shape, blocked unsafe
  inputs, external dependency cleanliness, and documentation trail.

Acceptance:

- external package consumes public core PDF adapter output;
- minimal PDF bytes are produced without adding PDF libraries to core;
- artifact manifest records media type, byte length, sha256, profile ids,
  local-only status, and not-stored status;
- core does not import the spike package;
- no DOCX output, storage write, backend route, production PDF fidelity claim,
  or package/document schema change is introduced.

## Phase 137: Artifact Manifest And Storage Boundary

Goal:

- define a core artifact manifest and storage-record lifecycle without
  implementing production storage.

Deliverables:

- `src/generation/artifactManifest.ts`;
- `docs/ARTIFACT_MANIFEST_BOUNDARY.md`;
- README, phase ledger, and roadmap updates;
- tests for rendered/planned/rendering/failed lifecycle records, bounded error
  summaries, explicit missing/null fields, storage side-effect guards, and
  documentation trail.

Acceptance:

- manifest records validate `artifactId`, source package/session identity,
  renderer and measurement profile ids, format, media type, byte length,
  sha256, storage key, created time, lifecycle status, and failure summary;
- rendered records require positive byte length, sha256, and storage key;
- failed records require bounded error summaries;
- storage status remains `not-written`;
- no file writes, database writes, storage adapter, backend route, renderer
  package import, production storage behavior, or package/document schema
  change is introduced.

## Phase 138: Backend Artifact Route Contract Boundary

Goal:

- define route-safe response contracts for requesting, checking, listing, and
  retrieving artifact metadata without concrete server routes or storage.

Deliverables:

- `src/generation/artifactApiRoute.ts`;
- `docs/ARTIFACT_API_ROUTE_BOUNDARY.md`;
- README, phase ledger, and roadmap updates;
- tests for valid/invalid route shapes, idempotency key representation,
  permission placeholders, retry-safe status responses, metadata-only download
  responses, dependency cleanliness, and documentation trail.

Acceptance:

- artifact generation requests create planned manifest responses with
  idempotency keys;
- status, list, and download metadata contracts consume caller-supplied
  artifact manifests without storage lookup;
- permission context is required but remains `checked: false`;
- retry-safe polling metadata is explicit;
- no server, network call, storage read/write, renderer execution, auth/authz
  implementation, byte streaming, or package/document schema change is
  introduced.

## Phase 139: Durable Layout Job / Artifact Job Boundary

Goal:

- extend the pausable layout job idea toward durable artifact generation jobs
  without concrete worker execution.

Deliverables:

- `src/generation/artifactJob.ts`;
- `docs/ARTIFACT_JOB_BOUNDARY.md`;
- README, phase ledger, and roadmap updates;
- tests for valid status transitions, invalid transition blocking, retry
  limits, cancellation flags, bounded errors, manifest identity checks,
  dependency cleanliness, and documentation trail.

Acceptance:

- job records include job id, package/session reference, layout profile,
  measurement profile, renderer profile, requested format, cursor/progress,
  cancellation flag, retry count, artifact manifest reference, and bounded
  error summary;
- pure helpers advance queued -> layout-running -> layout-complete ->
  rendering -> rendered;
- fail, cancel, and retry semantics are explicit;
- invalid transitions are blocked;
- no worker runtime, queue, file/storage write, backend route, renderer
  execution, concrete layout execution, or package/document schema change is
  introduced.

## Phase 140: Storage Adapter Interface Boundary

Goal:

- define storage adapter interfaces for packages, sessions, history, artifacts,
  and jobs without choosing a concrete database or object store.

Deliverables:

- `src/persistence/storageAdapter.ts`;
- `docs/STORAGE_ADAPTER_BOUNDARY.md`;
- README, phase ledger, and roadmap updates;
- tests using a test-local mock adapter for expected revision, idempotency
  replay, write-token metadata, collection coverage, dependency cleanliness,
  and documentation trail.

Acceptance:

- interface-only storage collections are defined for package/session records,
  durable histories, rich inline session persistence, artifact manifests, and
  artifact jobs;
- write requests include `expectedRevision`, `idempotencyKey`, and optional
  `writeToken`;
- read/write result envelopes are JSON-safe and explicit;
- mock adapter proves conflict and idempotency behavior without becoming core
  storage implementation;
- no concrete database, object store, filesystem write, browser storage,
  network call, auth/authz implementation, backend route, or package/document
  schema change is introduced.

## Phase 141: Product Editor Integration Smoke Boundary

Goal:

- compose viewport, structural runtime, and WYSIWYG foundations in a
  product-editor-like sandbox scenario without claiming production editor
  readiness.

Deliverables:

- `tests/productEditorIntegrationSmoke.test.ts`;
- `docs/PRODUCT_EDITOR_INTEGRATION_SMOKE_BOUNDARY.md`;
- README, phase ledger, and roadmap updates.

Acceptance:

- smoke boots the template-builder sandbox mutation bridge from a canonical
  vNext package fixture;
- outline selection jump, bounded visible range, and render window are
  composed;
- structural insert, delete, and reorder actions route through packets;
- rich inline commit marks exact generation stale;
- rich inline undo/redo replay remains functional;
- render window stays bounded;
- no React/DOM production integration, old FlowDocEditor import, storage,
  backend route, renderer artifact output, collaboration behavior, or
  package/document schema change is introduced.

## Phase 142: Real Browser Timing Smoke Boundary

Goal:

- add a conservative browser-runtime timing smoke for the sandbox without
  turning it into a production benchmark suite.

Deliverables:

- `examples/template-builder-sandbox/scripts/browser-smoke.mjs`;
- `tests/browserTimingSmoke.test.ts`;
- `docs/BROWSER_TIMING_SMOKE_BOUNDARY.md`;
- README, phase ledger, and roadmap updates.

Acceptance:

- smoke emits timing JSON for boot, visible range apply, scroll update,
  selection jump, structural command apply, rich inline draft open, and rich
  inline commit;
- thresholds are explicit and conservative;
- script remains dependency-free and records `browserDriver = "not-bound"`;
- no Playwright/Puppeteer dependency is added to core;
- no production performance claim, strict production threshold, renderer
  artifact output, storage/backend route, collaboration behavior, or
  package/document schema change is introduced.

## Phase 143: WYSIWYG Primary Input Decision Gate

Goal:

- decide the first production WYSIWYG primary input direction without
  implementing it.

Deliverables:

- `docs/WYSIWYG_PRIMARY_INPUT_DECISION_GATE.md`;
- `tests/wysiwygPrimaryInputDecisionGate.test.ts`;
- README, phase ledger, and roadmap updates.

Acceptance:

- decision matrix compares full-document contenteditable, textarea draft
  island, renderer-owned segment stream, and hybrid managed cards with a
  hardened contenteditable island;
- criteria include Thai IME, caret/range mapping, field chips, rich inline
  style, copy/paste/delete, undo/redo, exact renderer parity, collaboration
  readiness, and implementation risk;
- recommendation is explicit;
- no production input implementation, editor rewrite, collaboration behavior,
  storage/backend route, renderer artifact output, or package/document schema
  change is introduced.

## Phase 144: Granular Rich Inline Operation Decision Boundary

Goal:

- decide whether rich inline commits stay full inline-child replacement for v1
  or move immediately to granular operations.

Deliverables:

- `docs/RICH_INLINE_OPERATION_DECISION_BOUNDARY.md`;
- `tests/richInlineOperationDecision.test.ts`;
- README, phase ledger, and roadmap updates.

Acceptance:

- current full replacement operation is audited against range style patch,
  field chip insert/remove, and text insert/delete with mark context options;
- v1 policy is explicit;
- collaboration/offline risk is documented;
- guard tests prove current source remains replacement-only unless a later
  phase changes schema intentionally;
- no operation schema change, collaboration behavior, storage/backend route,
  renderer artifact output, or package/document schema change is introduced.

## Phase 145: First Vertical Slice Release Candidate Plan

Goal:

- define the smallest single-user release-candidate path from canonical
  template/report input to minimal artifact evidence without implementing
  production binding.

Deliverables:

- `docs/FIRST_VERTICAL_SLICE_RC_PLAN.md`;
- `tests/firstVerticalSliceReadiness.test.ts`;
- README, phase ledger, and roadmap updates.

Acceptance:

- candidate flow includes canonical package load, field binding diagnostics,
  browser-local authoring session, structural edit, rich inline commit, exact
  generation stale signal, renderer-backed measurement evidence, minimal PDF
  artifact bytes, artifact manifest/job records, and storage adapter boundary;
- single-user scope is explicit;
- production launch, collaboration/offline, full WYSIWYG input, default
  measurement replacement, concrete server/storage, full PDF fidelity, DOCX,
  parent runtime flip, and package/document schema changes are explicitly out
  of scope;
- required prior evidence docs are listed;
- no runtime behavior, operation schema, storage/backend route, renderer
  production binding, or package/document schema change is introduced.

## Phase 146: First Vertical Slice RC Orchestrator Boundary

Goal:

- add a pure input-driven RC report builder that receives caller-supplied
  summaries and returns one bounded JSON-safe readiness report.

Deliverables:

- `src/generation/verticalSliceRc.ts`;
- `tests/verticalSliceRc.test.ts`;
- `docs/VERTICAL_SLICE_RC_ORCHESTRATOR_BOUNDARY.md`;
- README, phase ledger, and roadmap updates.

Acceptance:

- report includes rcId, packageId, sessionId, measurementProfileId,
  rendererProfileId, artifactId, exact generation status, byte length/digest
  status, storage status, PASS, RISK, UNKNOWN, FAIL / BLOCKER, and
  intentionally-not-production-ready lists;
- missing package/session/measurement/artifact ids and missing evidence lanes
  block or report explicitly;
- builder is input-driven and does not load fixtures or call later phase
  helpers;
- no UI, server route, worker, queue, storage write, browser API, renderer
  execution, external package import, default measurement replacement,
  production binding, or package/document schema change is introduced.

## Phase 147: RC Scenario Fixture Boundary

Goal:

- create the first product-shaped RC scenario fixture that can feed the Phase
  146 report builder.

Deliverables:

- `fixtures/vertical-slice-rc-report.v1.flowdoc.json`;
- `fixtures/vertical-slice-rc-scenario.v1.json`;
- `src/generation/verticalSliceScenario.ts`;
- `tests/verticalSliceScenario.test.ts`;
- `docs/VERTICAL_SLICE_RC_SCENARIO_BOUNDARY.md`;
- README, phase ledger, and roadmap updates.

Acceptance:

- scenario fixture parses as canonical package v2/document v3;
- scenario metadata includes scenario id, intended rich inline edit, expected
  stale exact generation, expected artifact format, expected storage
  collections, and a field-ref chip case;
- scenario references valid node ids and field ids;
- scenario can feed the Phase 146 report builder without the builder loading
  fixtures;
- no existing fixture mutation, old/prototype document shape,
  repeat/collection materialization, workflow/reviewer runtime, browser API,
  storage write, renderer execution, external spike import, or
  package/document schema change is introduced.

## Phase 148: RC Measurement Selection And Drift Gate

Goal:

- add an RC-level gate that selects caller-supplied renderer-backed
  measurement evidence by `measurementProfileId` and reports drift against
  approximate measurement.

Deliverables:

- `src/generation/verticalSliceMeasurementGate.ts`;
- `tests/verticalSliceMeasurementGate.test.ts`;
- `docs/VERTICAL_SLICE_MEASUREMENT_GATE_BOUNDARY.md`;
- README, phase ledger, and roadmap updates.

Acceptance:

- wrong `measurementProfileId` blocks;
- missing renderer-backed or approximate line boxes block;
- drift over tolerance reports warning or blocked based on policy;
- digest and native/WASM parity status remain visible;
- no external text-engine import, renderer-backed provider execution, default
  pagination measurement replacement, pagination mutation, production
  measurement binding, or package/document schema change is introduced.

## Phase 149: RC Artifact Production Bridge

Goal:

- compose caller-supplied PDF spike output summaries with artifact manifest and
  artifact job records for the RC report.

Deliverables:

- `src/generation/verticalSliceArtifactBridge.ts`;
- `tests/verticalSliceArtifactBridge.test.ts`;
- `docs/VERTICAL_SLICE_ARTIFACT_BRIDGE_BOUNDARY.md`;
- README, phase ledger, and roadmap updates.

Acceptance:

- successful and failed artifact production summaries can be represented;
- missing byteLength, sha256, mediaType, and identity mismatches block;
- storageStatus remains not-stored/not-written before storage simulation;
- no `packages/pdf-renderer-spike` import into core, file/storage write,
  backend route, renderer execution, PDF fidelity claim, DOCX output, or
  package/document schema change is introduced.

## Phase 150: RC Storage Simulation Boundary

Goal:

- summarize storage adapter write results for RC package/session, history,
  rich inline, artifact manifest, and artifact job records without choosing a
  concrete backend.

Deliverables:

- `src/generation/verticalSliceStorageSimulation.ts`;
- `tests/verticalSliceStorageSimulation.test.ts`;
- `docs/VERTICAL_SLICE_STORAGE_SIMULATION_BOUNDARY.md`;
- README, phase ledger, and roadmap updates.

Acceptance:

- RC records can be evaluated through storage adapter contracts;
- expected revision conflict is represented;
- idempotent replay is represented;
- no concrete backend, real storage write, auth/authz, backend route, storage
  adapter interface rewrite, or package/document schema change is introduced.

## Phase 151: End-To-End RC Report Smoke

Goal:

- run one bounded end-to-end smoke that composes the Phase 146-150 RC
  boundaries into a final RC readiness report.

Deliverables:

- `tests/verticalSliceRcEndToEnd.test.ts`;
- `docs/VERTICAL_SLICE_RC_END_TO_END_SMOKE.md`;
- README, phase ledger, and roadmap updates.

Acceptance:

- one bounded RC report is produced;
- the report includes PASS, RISK, UNKNOWN, and
  intentionallyNotProductionReady;
- scenario, key diagnostics, rich inline commit, exact stale signal,
  measurement gate, artifact bridge, storage simulation, and report builder
  compose;
- no real browser driver, real storage backend, production PDF renderer,
  launch readiness claim, collaboration/offline behavior, route, or
  package/document schema change is introduced.

## Phase 152: RC Close Audit

Goal:

- close the first vertical slice RC foundation pass and explicitly decide what
  is proved versus still risky.

Deliverables:

- `docs/VERTICAL_SLICE_RC_CLOSE_AUDIT.md`;
- `tests/verticalSliceRcCloseAudit.test.ts`;
- README, phase ledger, and roadmap updates.

Acceptance:

- close audit summarizes the proven vertical slice path;
- production blockers, risks left, and unknowns remain visible;
- next recommended lane is clear;
- no production readiness claim, production WYSIWYG input, production storage,
  production renderer fidelity, collaboration/offline behavior, route, or
  package/document schema change is introduced.

## Phase 153: Hybrid Managed Card Input Implementation Plan

Goal:

- turn the Phase 143 hybrid managed card input decision into implementation
  phase boundaries without implementing production DOM/contenteditable behavior.

Deliverables:

- `docs/HYBRID_MANAGED_CARD_INPUT_IMPLEMENTATION_PLAN.md`;
- `tests/hybridManagedCardInputPlan.test.ts`;
- README, phase ledger, and roadmap updates.

Acceptance:

- ownership boundaries cover managed card runtime, active text-block island
  runtime, command policy, commit bridge, fallback textarea path, and app-shell
  integration;
- browser-local state and vNext core commit facts are separated;
- guard policy covers styled runs, atomic inline field chips, IME composition,
  selection/caret, paste/delete, and unsupported blocks;
- fallback policy for textarea/plain-text editing is explicit;
- follow-up phases include input runtime ownership boundary, active text block
  island boundary, DOM binding smoke, and commit bridge smoke;
- no production contenteditable implementation, full-document contenteditable,
  collaboration/offline behavior, storage/backend route, PDF/DOCX renderer
  work, legacy editor runtime copy, or package/document schema change is
  introduced.

## Phase 154: Input Runtime Ownership Boundary

Goal:

- create the first implementation boundary for hybrid managed card input
  ownership before active island lifecycle, DOM binding, or commit execution.

Deliverables:

- `examples/template-builder-sandbox/public/inputRuntimeOwnership.js`;
- `docs/HYBRID_INPUT_RUNTIME_OWNERSHIP_BOUNDARY.md`;
- `tests/hybridInputRuntimeOwnership.test.ts`;
- README, phase ledger, roadmap, and Phase 153 roadmap guard updates.

Acceptance:

- runtime ownership can identify no active target, managed card selection,
  active text-block island, textarea fallback, and rejected targets;
- ownership facts include active node id, active text-block id, mode, reason,
  allowed commands, blocked commands, fallback reason, and command readiness;
- unsupported targets, full-document contenteditable, raw DOM HTML package
  truth, non-text island requests, invalid fallback requests, missing node ids,
  and multiple active islands return explicit rejection reasons;
- only one active text-block island can be selected;
- IME composition blocks commit bridge preparation;
- browser-local ownership facts are separated from canonical package truth;
- no DOM binding, production contenteditable behavior, document mutation,
  storage/backend route, PDF/DOCX renderer work, package/document schema
  change, or legacy editor runtime copy is introduced.

## Phase 155: Active Text-Block Island Boundary

Goal:

- implement the browser-local active text-block island state model before real
  DOM events, command execution, or commit bridge behavior.

Deliverables:

- `examples/template-builder-sandbox/public/activeTextBlockIsland.js`;
- `docs/ACTIVE_TEXT_BLOCK_ISLAND_BOUNDARY.md`;
- `tests/activeTextBlockIsland.test.ts`;
- README, phase ledger, and roadmap updates.

Acceptance:

- active island lifecycle supports inactive, opening, active, composing, dirty,
  committing, rejected, and closed states;
- state tracks text-block id, draft text, rich segment summary, normalized
  UTF-16 selection facts, composition status, dirty flag, fallback eligibility,
  commit request facts, and close reason;
- IME composition blocks commit request;
- cross-block selection and draft updates are rejected;
- dirty state and closing without commit are explicit;
- no DOM Selection/Range objects, vNext core commit, paste/delete handling,
  cross-block selection support, production IME readiness claim, storage/
  backend route, PDF/DOCX renderer work, package/document schema change, or
  legacy editor runtime copy is introduced.

## Phase 156: Hybrid Command Policy Boundary

Goal:

- create the command policy layer that decides whether commands are ready,
  should fall back to textarea/plain-text behavior, or are blocked.

Deliverables:

- `examples/template-builder-sandbox/public/hybridInputCommandPolicy.js`;
- `docs/HYBRID_INPUT_COMMAND_POLICY_BOUNDARY.md`;
- `tests/hybridInputCommandPolicy.test.ts`;
- README, phase ledger, roadmap, and Phase 153 roadmap guard updates.

Acceptance:

- command kinds cover text insert/delete, selection replace, rich inline style
  toggle, field chip insert/delete, text paste, rich paste, commit, and cancel;
- commands return ready, fallback, or blocked readiness;
- IME composition blocks destructive commands and commit;
- field chip internals cannot be edited as raw text;
- cross-block selection, unsupported HTML paste, structural boundary delete,
  and ambiguous style overlap are blocked with explicit reasons;
- textarea fallback keeps plain-text commands ready while rich commands fall
  back;
- no command execution, package data mutation, DOM binding, field-chip
  implementation beyond command policy, storage/backend route, PDF/DOCX
  renderer work, package/document schema change, or legacy editor runtime copy
  is introduced.

## Phase 157: DOM Binding Smoke Boundary

Goal:

- add the first guarded DOM-binding smoke for one active text-block island as
  JSON-safe capture facts.

Deliverables:

- `examples/template-builder-sandbox/public/activeTextBlockDomBinding.js`;
- `docs/ACTIVE_TEXT_BLOCK_DOM_BINDING_SMOKE.md`;
- `tests/activeTextBlockDomBinding.test.ts`;
- README, phase ledger, roadmap, and Phase 153 roadmap guard updates.

Acceptance:

- one active text block can expose a contenteditable island smoke;
- captured facts include active node id, text-block id, text snapshot,
  selection start/end as UTF-16 offsets, composition active flag, safe/unsafe
  capture status, and diagnostics;
- unsafe captures are rejected for missing surface, missing contenteditable
  root, target mismatch, text mismatch, missing/out-of-range offsets, and DOM
  Range/object selection facts;
- DOM state remains browser-local and JSON-safe;
- no production DOM range support, all-browser support claim, paste/delete
  semantics, core commit, production contenteditable implementation, storage/
  backend route, PDF/DOCX renderer work, package/document schema change, or
  legacy editor runtime copy is introduced.

## Phase 158: Active Island Commit Bridge Smoke

Goal:

- connect accepted active-island facts to the existing vNext rich inline commit
  path in a bounded sandbox smoke.

Deliverables:

- `examples/template-builder-sandbox/public/activeIslandCommitBridge.js`;
- `tests/activeIslandCommitBridge.test.ts`;
- `docs/ACTIVE_ISLAND_COMMIT_BRIDGE_SMOKE.md`;
- README, phase ledger, roadmap, and Phase 153 roadmap guard updates.

Acceptance:

- accepted island capture facts convert into a `text-block.rich-inline.replace`
  bridge request;
- the request routes through the existing `sandbox.commitRichInline` mutation
  bridge in tests;
- accepted commit preserves packet refresh and live/exact stale signal;
- rejected or unsafe island facts do not produce a bridge request;
- no granular rich inline operations, collaboration/offline safety claim, raw
  contenteditable HTML commit, rich inline boundary bypass, storage/backend
  route, PDF/DOCX renderer work, package/document schema change, or legacy
  editor runtime copy is introduced.

## Phase 159: Field Chip Delete / Copy / Paste Command Boundary

Goal:

- define and test v1 field-chip commands for the hybrid active island.

Deliverables:

- `src/authoring/fieldChipCommands.ts`;
- `src/index.ts`;
- `tests/fieldChipCommands.test.ts`;
- `docs/FIELD_CHIP_COMMAND_BOUNDARY.md`;
- README, phase ledger, roadmap, and Phase 153 roadmap guard updates.

Acceptance:

- command contracts cover field-chip delete, copy, paste,
  replace-with-text, and blocked internal edit;
- field chips remain atomic managed inline units;
- field key visibility is preserved in command facts;
- safe delete, paste, and replace-with-text produce rich inline replacement
  intent;
- copy produces clipboard facts and no mutation intent;
- internal chip edit, cross-block selection, missing chip, missing field key,
  and missing clipboard field chip are blocked;
- no DOM event binding, collaboration semantics, package/document schema
  change, arbitrary chip internals as editable text, storage/backend route,
  PDF/DOCX renderer work, or legacy editor runtime copy is introduced.

## Phase 160: Paste / Delete Preflight Boundary

Goal:

- define paste and delete preflight logic for the active text-block island
  before production input uses it.

Deliverables:

- `examples/template-builder-sandbox/public/pasteDeletePreflight.js`;
- `tests/pasteDeletePreflight.test.ts`;
- `docs/PASTE_DELETE_PREFLIGHT_BOUNDARY.md`;
- README, phase ledger, roadmap, and Phase 153 roadmap guard updates.

Acceptance:

- preflight handles plain text paste, rich text paste summary, unsupported HTML
  paste, delete selection, backspace near field chip, delete across chip
  boundary, delete across structural boundary, and IME composition guard;
- normalized action returns allow, transform, fallback, or reject;
- unsafe HTML is rejected or normalized;
- field chip and structural boundaries are protected;
- no arbitrary pasted HTML as package truth, structural boundary delete, commit
  while IME composition is active, browser clipboard integration, storage/
  backend route, PDF/DOCX renderer work, package/document schema change, or
  legacy editor runtime copy is introduced.

## Phase 161: Renderer Segment / Hit-Test Evidence Boundary

Goal:

- define the evidence shape for renderer-backed segments and hit-test facts
  before future caret/selection parity work.

Deliverables:

- `src/renderer/segmentHitTestEvidence.ts`;
- `src/index.ts`;
- `tests/segmentHitTestEvidence.test.ts`;
- `docs/RENDERER_SEGMENT_HIT_TEST_EVIDENCE_BOUNDARY.md`;
- README, phase ledger, roadmap, and Phase 153 roadmap guard updates.

Acceptance:

- segment facts include segment id, text-block id, inline child id, UTF-16
  range, glyph range, line index, x/y/width/height box, atomic flag, field-chip
  flag, and style facts;
- hit-test request/response includes point, nearest offset, segment id,
  affinity, and confidence;
- invalid UTF-16 ranges are blocked;
- field-chip atomic segments can be represented;
- hit-test output can express uncertainty;
- no renderer execution, DOM selection binding, contenteditable range mapper
  replacement, caret parity claim, production measurement binding, storage/
  backend route, PDF/DOCX renderer work, package/document schema change, or
  legacy editor runtime copy is introduced.

## Phase 162: Hybrid Input Close Audit

Goal:

- close the hybrid managed card input foundation pass across Phases 154-161 and
  recommend the next guarded lane.

Deliverables:

- `docs/HYBRID_INPUT_FOUNDATION_CLOSE_AUDIT.md`;
- `tests/hybridInputFoundationCloseAudit.test.ts`;
- README, phase ledger, roadmap, and Phase 153 roadmap guard updates.

Acceptance:

- the audit cites Phase 154 input runtime ownership, Phase 155 active island
  lifecycle, Phase 156 command policy, Phase 157 DOM binding smoke, Phase 158
  commit bridge smoke, Phase 159 field-chip commands, Phase 160 paste/delete
  preflight, and Phase 161 renderer segment hit-test evidence;
- the audit states that production input readiness is not achieved;
- production blockers, risks, and unknowns remain explicit;
- the next recommended lane is Phase 163: Hybrid Input Browser QA Boundary;
- no production contenteditable implementation, full-document contenteditable,
  collaboration/offline behavior, storage/backend route, PDF/DOCX renderer
  work, package/document schema change, or legacy editor runtime copy is
  introduced.

## Phase 163: Hybrid Input Browser QA Boundary

Goal:

- create a browser-QA/evidence boundary for hybrid active text-block island
  input without claiming production readiness.

Deliverables:

- `docs/HYBRID_INPUT_BROWSER_QA_BOUNDARY.md`;
- `examples/template-builder-sandbox/public/hybridInputBrowserQa.js`;
- `examples/template-builder-sandbox/scripts/hybrid-input-browser-qa.mjs`;
- `tests/hybridInputBrowserQa.test.ts`;
- README, phase ledger, roadmap, and Phase 153 roadmap guard updates.

Acceptance:

- browser QA report shape exists and is JSON-safe;
- selection start/end, caret move, IME lifecycle, plain text paste, blocked
  rich/unsafe paste, delete/backspace near field chip, active island commit,
  fallback behavior, and single active text-block island guard have evidence or
  explicit blocked/fallback status;
- unsafe DOM behavior does not become package truth;
- active island ownership remains limited to one text block;
- field-chip atomics remain guarded;
- browser driver usage remains optional and sandbox-local;
- no production contenteditable readiness claim, full-document contenteditable,
  old FlowDocEditor runtime copy, package/document schema change, storage/
  backend route, collaboration/offline behavior, renderer/PDF/DOCX work, or
  browser driver requirement in core check is introduced.

## Phase 164: Optional Browser Driver Smoke Boundary

Goal:

- create an optional browser-driver smoke boundary for the hybrid active
  text-block island sandbox path without requiring a browser driver in core
  check.

Deliverables:

- `docs/HYBRID_INPUT_OPTIONAL_BROWSER_DRIVER_SMOKE_BOUNDARY.md`;
- `examples/template-builder-sandbox/public/hybridInputBrowserDriverSmoke.js`;
- `examples/template-builder-sandbox/scripts/hybrid-input-browser-driver-smoke.mjs`;
- `tests/hybridInputBrowserDriverSmoke.test.ts`;
- README, phase ledger, roadmap, and roadmap guard updates.

Acceptance:

- optional browser-driver report shape exists and is JSON-safe;
- missing browser driver facts produce explicit blocked status instead of core
  check failure;
- externally supplied driver facts can cover focus active text-block island,
  selection/caret movement, plain typing, IME/composition evidence when
  available, plain paste, blocked unsafe paste, delete/backspace near field
  chip, and active island commit;
- unsafe DOM behavior does not become package truth;
- active island evidence stays limited to the sandbox path;
- no browser driver requirement in core `npm run check`, browser automation
  dependency in `@flowdoc/vnext-core`, production browser/contenteditable
  readiness claim, full-document contenteditable, old FlowDocEditor runtime
  copy, package/document schema change, storage/backend route, PDF/DOCX
  renderer work, or collaboration/offline behavior is introduced.

## Phase 165: Hybrid Input Browser Evidence Close Audit

Goal:

- close the Phase 163-164 browser evidence lane and decide the next guarded
  input lane before production contenteditable binding.

Deliverables:

- `docs/HYBRID_INPUT_BROWSER_EVIDENCE_CLOSE_AUDIT.md`;
- `tests/hybridInputBrowserEvidenceCloseAudit.test.ts`;
- README, phase ledger, roadmap, and roadmap guard updates.

Acceptance:

- Phase 163 sandbox-local QA evidence is audited;
- Phase 164 optional browser-driver evidence intake is audited;
- proven selection/caret, IME/composition, paste/delete, field-chip guard,
  active island commit, and fallback behavior evidence is summarized;
- production blockers remain visible;
- next lane recommendation is clear;
- no production contenteditable binding, production browser readiness claim,
  browser driver requirement in core check, browser automation dependency in
  `@flowdoc/vnext-core`, package/document schema change, storage/backend route,
  PDF/DOCX renderer work, or collaboration/offline behavior is introduced.

## Phase 166: Hybrid Input Hardening Threshold Plan

Goal:

- define PASS/WARNING/BLOCKED/UNKNOWN thresholds that decide whether hybrid
  input can move toward guarded internal-alpha integration.

Deliverables:

- `docs/HYBRID_INPUT_HARDENING_THRESHOLD_PLAN.md`;
- `tests/hybridInputHardeningThresholdPlan.test.ts`;
- README, phase ledger, roadmap, and roadmap guard updates.

Acceptance:

- PASS/WARNING/BLOCKED/UNKNOWN policy is explicit;
- thresholds cover selection/caret, IME composition, paste/delete, field-chip
  atomicity, active island commit, fallback behavior, and JSON-safe report
  completeness;
- failures that block v1 are separated from warnings that can remain visible;
- no production contenteditable implementation, browser matrix choice, browser
  automation dependency in core, package/document schema change, storage/
  backend route, PDF/DOCX renderer work, or collaboration/offline behavior is
  introduced.

## Phase 167: Browser Matrix Decision

Goal:

- choose the minimum browser/OS/IME matrix for the v1 hybrid active text-block
  island path.

Deliverables:

- `docs/HYBRID_INPUT_BROWSER_MATRIX_DECISION.md`;
- `tests/hybridInputBrowserMatrixDecision.test.ts`;
- README, phase ledger, roadmap, and roadmap guard updates.

Acceptance:

- Windows Chromium-family and Microsoft Edge are selected for v1;
- English and Thai input paths are selected for v1;
- IME composition lifecycle evidence is required for the selected path;
- Firefox, Safari, mobile, complex CJK IME, Linux, macOS, and broad
  cross-browser visual caret parity are deferred;
- Phase 166 thresholds are mapped to the selected matrix;
- no production contenteditable implementation, browser automation dependency
  in core, browser driver requirement in core check, package/document schema
  change, storage/backend route, PDF/DOCX renderer work, or
  collaboration/offline behavior is introduced.

## Phase 168: Guarded Input Integration Plan

Goal:

- define the guarded integration plan for the active text-block island before
  implementing a runtime slice.

Deliverables:

- `docs/GUARDED_INPUT_INTEGRATION_PLAN.md`;
- `tests/guardedInputIntegrationPlan.test.ts`;
- README, phase ledger, roadmap, and roadmap guard updates.

Acceptance:

- ownership boundaries are explicit for managed card runtime, active
  text-block island runtime, command policy, commit bridge, fallback textarea
  path, and app-shell integration;
- browser-local state is separated from what may commit into vNext core;
- styled runs, atomic inline field chips, IME composition, selection/caret,
  paste/delete, and unsupported blocks have guard policy;
- active block packet refresh, stale revision rejection, fallback, and commit
  bridge route are explicit;
- no production contenteditable implementation, production browser readiness
  claim, full-document contenteditable, browser automation dependency in core,
  browser driver requirement in core check, package/document schema change,
  storage/backend route, PDF/DOCX renderer work, collaboration/offline
  behavior, or legacy editor runtime copy is introduced.

## Phase 169: Guarded Input Runtime Slice 1

Goal:

- implement the first sandbox-local guarded input runtime slice that composes
  accepted ownership, active island lifecycle, command policy, DOM binding
  smoke, and commit bridge smoke.

Deliverables:

- `examples/template-builder-sandbox/public/guardedInputRuntimeSlice.js`;
- `docs/GUARDED_INPUT_RUNTIME_SLICE.md`;
- `tests/guardedInputRuntimeSlice.test.ts`;
- README, phase ledger, roadmap, and roadmap guard updates.

Acceptance:

- one eligible active text block can produce a JSON-safe accepted report and a
  planned `text-block.rich-inline.replace` bridge request;
- selection/caret facts remain UTF-16 offsets;
- IME composition-active commit is blocked;
- fallback textarea and unsupported-block paths are explicit;
- packet refresh is required after accepted bridge planning;
- no production contenteditable implementation, production browser readiness
  claim, full-document contenteditable, browser automation dependency in core,
  browser driver requirement in core check, package/document schema change,
  storage/backend route, PDF/DOCX renderer work, collaboration/offline
  behavior, or legacy editor runtime copy is introduced.

## Phase 170: Paste/Delete/Field-chip Input Slice

Goal:

- implement the sandbox-local paste/delete/field-chip input slice over the
  guarded runtime slice.

Deliverables:

- `examples/template-builder-sandbox/public/guardedInputPasteDeleteFieldChipSlice.js`;
- `docs/GUARDED_INPUT_PASTE_DELETE_FIELD_CHIP_SLICE.md`;
- `tests/guardedInputPasteDeleteFieldChipSlice.test.ts`;
- README, phase ledger, roadmap, and roadmap guard updates.

Acceptance:

- plain paste and normalized paste are JSON-safe;
- unsafe rich paste and arbitrary DOM HTML are blocked;
- delete/backspace near field chips transforms into explicit atomic field-chip
  command intent;
- field-chip copy and replace-with-text remain atomic command facts;
- field-chip internal edit, structural delete, and composition-active actions
  are blocked;
- no production contenteditable implementation, production browser readiness
  claim, production clipboard binding, full-document contenteditable, browser
  automation dependency in core, browser driver requirement in core check,
  package/document schema change, storage/backend route, PDF/DOCX renderer
  work, collaboration/offline behavior, or legacy editor runtime copy is
  introduced.

## Phase 171: Input Integration Close Audit

Goal:

- close the guarded hybrid input integration lane and decide what is proven,
  blocked, risky, or unknown before any production input binding.

Deliverables:

- `docs/GUARDED_INPUT_INTEGRATION_CLOSE_AUDIT.md`;
- `tests/guardedInputIntegrationCloseAudit.test.ts`;
- README, phase ledger, roadmap, and roadmap guard updates.

Acceptance:

- Phases 166-170 are audited together;
- proven selection/caret, active island commit, IME/composition blocking,
  paste/delete, field-chip atomicity, fallback, and packet refresh evidence is
  summarized;
- production blockers remain visible;
- the decision accepts internal-alpha sandbox evidence only and blocks
  production contenteditable/browser/clipboard/collaboration readiness claims;
- no production contenteditable implementation, production browser readiness
  claim, production clipboard binding, full-document contenteditable, browser
  automation dependency in core, browser driver requirement in core check,
  package/document schema change, storage/backend route, PDF/DOCX renderer
  work, collaboration/offline behavior, or legacy editor runtime copy is
  introduced.

## Pre-Phase 172 Risk / Unknown Register

Goal:

- sharpen the RISK / UNKNOWN surface before Phase 172 chooses concrete storage
  constraints.

Deliverables:

- `docs/PRE_PHASE_172_RISK_UNKNOWN_REGISTER.md`;
- `tests/prePhase172RiskUnknownRegister.test.ts`;
- README, phase ledger, roadmap, and close-audit guard updates.

Acceptance:

- storage choice cannot inherit production input, browser, clipboard, or
  collaboration/offline readiness claims from Phase 166-171;
- input/browser evidence, commit/rich-inline semantics, app-shell/fallback
  ownership, and storage-coupling risks are separated;
- unknowns for production contenteditable, browser-driver evidence, Thai IME,
  product fallback UX, granular rich-inline operations, and storage durability
  remain explicit;
- Phase 172 remains the next phase, but only as a concrete storage choice gate;
- no storage/backend route, package/document schema change, production
  contenteditable implementation, production browser readiness claim,
  production clipboard binding, PDF/DOCX renderer work, collaboration/offline
  behavior, or legacy editor runtime copy is introduced.

## Phase 172: Concrete Storage Choice Gate

Goal:

- choose the first concrete internal-alpha storage direction without
  implementing a storage adapter, route, auth/authz, artifact byte store, or
  production storage backend.

Deliverables:

- `docs/CONCRETE_STORAGE_CHOICE_GATE.md`;
- `tests/concreteStorageChoiceGate.test.ts`;
- README, phase ledger, roadmap, and roadmap guard updates.

Acceptance:

- one internal-alpha path is selected: external file-backed JSON record adapter
  in `packages/storage-file-json`;
- filesystem JSON, SQLite, Postgres, browser storage, and S3/object store are
  compared;
- SQLite plus filesystem artifacts remains a later hardening path, not a
  required dependency for Phase 173;
- record storage and artifact byte storage are separated;
- what the adapter stores, what it does not store, migration risks, and
  artifact byte strategy are explicit;
- no concrete storage adapter implementation, filesystem/database write in
  core, SQLite/native dependency, artifact byte write, backend route, auth/authz,
  package/document schema change, production input/browser/clipboard readiness
  claim, PDF/DOCX renderer work, collaboration/offline behavior, or legacy
  editor runtime copy is introduced.

## Phase 173: External File-Backed Storage Adapter Slice

Goal:

- implement the first concrete internal-alpha storage adapter outside
  `@flowdoc/vnext-core`.

Deliverables:

- `packages/storage-file-json/package.json`;
- `packages/storage-file-json/tsconfig.json`;
- `packages/storage-file-json/src/index.ts`;
- `docs/EXTERNAL_FILE_BACKED_STORAGE_ADAPTER_SLICE.md`;
- `tests/storageFileJsonAdapter.test.ts`;
- `vitest.config.ts`;
- README, phase ledger, and roadmap updates.

Acceptance:

- the adapter lives in `packages/storage-file-json`, not in core source;
- it consumes public storage adapter request/envelope helpers from
  `@flowdoc/vnext-core`;
- package/session, durable history, rich inline session, artifact manifest, and
  artifact job records can be stored as JSON record envelopes;
- read-after-write, idempotencyKey replay, expectedRevision conflict, and
  revision increment are covered by tests;
- artifact manifest/job are records only and do not write bytes;
- no filesystem/database writes are added to core;
- no SQLite/native dependency, multi-record transaction claim, backend route,
  auth/authz, package/document schema change, production input/browser/
  clipboard readiness claim, PDF/DOCX renderer work, collaboration/offline
  behavior, or legacy editor runtime copy is introduced.

## Phase 174: Artifact Byte Store Slice

Goal:

- store artifact bytes in an internal-alpha filesystem byte store beside the
  external file-backed JSON record adapter.

Deliverables:

- `packages/storage-file-json/src/index.ts`;
- `docs/ARTIFACT_BYTE_STORE_SLICE.md`;
- `tests/artifactByteStoreSlice.test.ts`;
- `tests/storageFileJsonAdapter.test.ts`;
- README, phase ledger, and roadmap updates.

Acceptance:

- non-empty artifact bytes can be written to a caller-provided filesystem root;
- `sha256` is computed from stored bytes;
- stored bytes can be read back by `storageKey`;
- missing artifacts return a bounded adapter-owned result;
- rendered artifact manifests can be checked against stored byte facts for
  artifact id, byte length, sha256, and storage key consistency;
- the Phase 173 record adapter remains separate from byte writes and still
  reports `artifactByteWrites: false`;
- no backend route, auth/authz, package/document schema change, production
  storage readiness claim, multi-record transaction claim, PDF/DOCX renderer
  work, collaboration/offline behavior, or legacy editor runtime copy is
  introduced.

## Phase 175: Storage-Backed RC Roundtrip Smoke

Goal:

- run the first RC scenario through concrete internal-alpha record storage and
  artifact byte storage, then feed the reloaded facts into the RC report.

Deliverables:

- `packages/internal-alpha-runner/package.json`;
- `packages/internal-alpha-runner/tsconfig.json`;
- `packages/internal-alpha-runner/src/index.ts`;
- `packages/internal-alpha-runner/src/storageBackedRcRoundtrip.ts`;
- `docs/STORAGE_BACKED_RC_ROUNDTRIP_SMOKE.md`;
- `tests/storageBackedRcRoundtripSmoke.test.ts`;
- `tests/artifactByteStoreSlice.test.ts`;
- root test/type alias updates plus README, phase ledger, and roadmap updates.

Acceptance:

- the runner accepts caller-provided package/scenario fixture values and does
  not load fixtures itself;
- the RC rich inline edit path runs and stales exact generation;
- package/session, durable history, rich inline session, artifact manifest, and
  artifact job records are written and reloaded through concrete file-backed
  storage;
- artifact bytes are written, read back, and checked against a rendered
  manifest;
- the RC report summarizes concrete storage facts while keeping production
  readiness blocked;
- no backend route, auth/authz, package/document schema change, production
  storage readiness claim, multi-record transaction claim, renderer execution,
  PDF/DOCX production work, collaboration/offline behavior, or legacy editor
  runtime copy is introduced.

## Phase 176: Backend Route Contract To Storage Binding

Goal:

- bind route-shaped helper functions to the concrete file-backed record storage
  adapter without opening a server route.

Deliverables:

- `packages/internal-alpha-runner/src/storageRouteBinding.ts`;
- `packages/internal-alpha-runner/src/index.ts`;
- `docs/BACKEND_ROUTE_STORAGE_BINDING_BOUNDARY.md`;
- `tests/backendRouteStorageBinding.test.ts`;
- `tests/storageBackedRcRoundtripSmoke.test.ts`;
- README, phase ledger, and roadmap updates.

Acceptance:

- session load/save helpers read and write package/session records;
- artifact generation request helper creates planned artifact manifest and
  queued artifact job records;
- artifact status helper reads artifact job records;
- artifact metadata helper reads artifact manifest records;
- method mismatch, missing records, and storage conflicts return bounded
  route-shaped responses;
- response bodies remain JSON-safe and keep `bytes: null`;
- no HTTP server route, auth/authz execution, artifact byte streaming, renderer
  execution, package/document schema change, production storage readiness
  claim, collaboration/offline behavior, or legacy editor runtime copy is
  introduced.

## Phase 177: Artifact Job Execution Slice

Goal:

- execute the artifact job slice from request-shaped job input through minimal
  PDF spike bytes, artifact byte storage, and final manifest/job status.

Deliverables:

- `packages/internal-alpha-runner/src/artifactJobExecution.ts`;
- `packages/internal-alpha-runner/src/index.ts`;
- `docs/ARTIFACT_JOB_EXECUTION_SLICE.md`;
- `tests/artifactJobExecutionSlice.test.ts`;
- README, phase ledger, and roadmap updates.

Acceptance:

- queued artifact job and planned manifest records are persisted first;
- layout/render lifecycle transitions are advanced through public core job
  helpers;
- the external minimal PDF spike package produces bytes on the successful path;
- PDF bytes are written and read through the filesystem artifact byte store;
- rendered manifests include byteLength, sha256, and storageKey evidence;
- rendered manifests pass byte-store consistency checks;
- rendered job and manifest records are persisted and reloaded;
- blocked PDF spike execution persists failed job and failed manifest records;
- reports are JSON-safe and do not include raw bytes;
- no worker, queue, server route, auth/authz, production PDF/DOCX renderer,
  package/document schema change, production input readiness claim,
  collaboration/offline behavior, or legacy editor runtime copy is introduced.

## Phase 178: PDF Renderer Decision Gate

Goal:

- decide whether to continue hardening the minimal PDF spike for internal-alpha
  evidence or choose a production PDF renderer package lane.

Decision:

- continue using the existing dependency-free minimal PDF spike for
  internal-alpha vertical slice evidence only;
- do not choose or add a production PDF renderer package in Phase 178;
- defer production renderer-package selection until measurement rollout and the
  internal-alpha vertical slice make fidelity gaps easier to attribute.

Deliverables:

- `docs/PDF_RENDERER_DECISION_GATE.md`;
- `tests/pdfRendererDecisionGate.test.ts`;
- README, phase ledger, and roadmap updates;
- Phase 177 roadmap guard update.

Acceptance:

- Phase 136 minimal PDF spike evidence is referenced;
- Phase 177 artifact job execution evidence is referenced;
- the decision keeps the PDF spike internal-alpha only;
- production PDF renderer readiness remains blocked;
- no production PDF package, DOCX renderer, browser print driver, worker, queue,
  backend route, auth/authz, package/document schema change, production input
  readiness claim, collaboration/offline behavior, or legacy editor runtime copy
  is introduced.

## Phase 179: Measurement Rollout Gate

Goal:

- decide whether renderer-backed measurement evidence can support the selected
  internal-alpha vertical slice under profile, drift, digest, and parity gates.

Decision:

- allow guarded internal-alpha measurement evidence for the selected slice;
- do not replace `measureVNextText(...)` defaults;
- do not claim production renderer-backed measurement readiness;
- keep digest/parity gaps visible as risk or unknown rather than pass.

Deliverables:

- `docs/MEASUREMENT_ROLLOUT_GATE.md`;
- `tests/measurementRolloutGate.test.ts`;
- README, phase ledger, and roadmap updates;
- Phase 178 roadmap guard update.

Acceptance:

- Phase 135 renderer-backed provider bridge evidence is referenced;
- Phase 148 RC measurement gate evidence is referenced;
- Phase 175/177 internal-alpha usage is referenced;
- Phase 178 renderer decision is referenced so measurement does not inherit PDF
  production claims;
- internal-alpha rollout policy is explicit;
- production rollout blockers for digest, native/WASM parity, drift thresholds,
  and default-measurer replacement are explicit;
- no pagination mutation, default measurement replacement, production binding,
  external engine execution in core, backend/storage/PDF/DOCX/worker/auth,
  package/document schema change, production input readiness claim,
  collaboration/offline behavior, or legacy editor runtime copy is introduced.

## Phase 180: Internal Alpha Vertical Slice

Goal:

- run one bounded internal-alpha path from document open through edit, save,
  reload, PDF spike generation, artifact storage/retrieval, and status report.

Deliverables:

- `packages/internal-alpha-runner/src/internalAlphaVerticalSlice.ts`;
- `packages/internal-alpha-runner/src/index.ts`;
- `docs/INTERNAL_ALPHA_VERTICAL_SLICE.md`;
- `tests/internalAlphaVerticalSlice.test.ts`;
- README, phase ledger, and roadmap updates;
- Phase 179 roadmap guard update.

Acceptance:

- fixture package opens as canonical package v2/document v3;
- the selected active text block is edited with
  `text-block.rich-inline.replace`;
- package/session, durable-history, and rich-inline-session records are saved
  and reloaded through file-backed storage;
- PDF generation consumes the reloaded package snapshot;
- artifact job execution produces minimal PDF spike bytes;
- artifact bytes are stored, retrieved, and checked against the rendered
  manifest;
- final status report is JSON-safe, has no fail blockers, and remains
  productionReady false;
- no production contenteditable, full-document contenteditable, backend route,
  auth/authz, production storage, production PDF/DOCX renderer, default
  measurement replacement, package/document schema change, collaboration/
  offline behavior, or legacy editor runtime copy is introduced.

## Phase 181: Internal Alpha Close Audit And Documentation Consolidation Gate

Goal:

- close the internal-alpha evidence lane from Phases 172-180 and consolidate
  current-state documentation into compact entry points.

Deliverables:

- `docs/INTERNAL_ALPHA_CLOSE_AUDIT_AND_DOC_CONSOLIDATION_GATE.md`;
- `docs/CURRENT_STATUS.md`;
- `docs/NEXT_PHASE_POINTER.md`;
- `tests/internalAlphaCloseAuditConsolidation.test.ts`;
- README, phase ledger, and roadmap updates;
- Phase 180 roadmap guard update.

Acceptance:

- Phases 172-180 evidence is audited;
- proven internal-alpha path is explicit;
- production blockers remain visible;
- compact current-state docs are added without deleting or moving historical
  phase evidence;
- next phase is Phase 182: V1 Hardening Backlog Triage Gate;
- no production contenteditable, full-document contenteditable, backend route,
  auth/authz, production storage, production PDF/DOCX renderer, default
  measurement replacement, package/document schema change, collaboration/
  offline behavior, or legacy editor runtime copy is introduced.

## Phase 182: V1 Hardening Backlog Triage Gate

Goal:

- rank the remaining production blockers and choose the first production
  hardening lane without starting production implementation.

Deliverables:

- `docs/V1_HARDENING_BACKLOG_TRIAGE_GATE.md`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- `tests/v1HardeningBacklogTriageGate.test.ts`;
- README, phase ledger, and roadmap updates;
- Phase 181 current-pointer guard update.

Acceptance:

- candidate lanes are ranked: input/contenteditable, backend routes/auth,
  storage durability, PDF fidelity, measurement digest/parity/drift, DOCX,
  collaboration/offline, and schema changes if needed;
- the first production hardening lane is selected as measurement rollout /
  digest / parity / drift;
- every deferred lane has an explicit dependency reason;
- internal-alpha evidence remains separate from production readiness;
- next phase is Phase 183: Measurement Digest Parity Drift Hardening Gate;
- no production contenteditable, backend route/server/auth/authz, production
  storage readiness, production PDF/DOCX renderer, default measurement
  replacement, pagination mutation, package/document schema change,
  collaboration/offline behavior, or legacy editor runtime copy is introduced.

## Phase 183: Measurement Digest Parity Drift Hardening Gate

Goal:

- define the production measurement evidence policy selected by Phase 182
  before any default-measurer replacement or production binding.

Deliverables:

- `docs/MEASUREMENT_DIGEST_PARITY_DRIFT_HARDENING_GATE.md`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- `tests/measurementDigestParityDriftHardeningGate.test.ts`;
- README, phase ledger, and roadmap updates;
- Phase 182 current-pointer guard update.

Acceptance:

- digest identity and retention expectations are defined;
- native/WASM parity acceptance criteria are defined;
- drift status, threshold policy, and escalation rules are defined;
- required v1 measurement fixture/scenario evidence categories are defined;
- blocked, warning, and unknown policy is explicit;
- blockers before replacing `measureVNextText(...)` are explicit;
- next phase is Phase 184: V1 Measurement Fixture Evidence Matrix Gate;
- no `measureVNextText(...)` default replacement, pagination mutation,
  production renderer-backed measurement binding, external text-engine
  execution in core, production PDF/DOCX renderer work, backend routes/storage/
  auth, production contenteditable, package/document schema change,
  collaboration/offline behavior, or legacy editor runtime copy is introduced.

## Phase 184: V1 Measurement Fixture Evidence Matrix Gate

Goal:

- select and map the v1 measurement fixture/scenario matrix required by Phase
  183 without filling raw evidence or binding production measurement.

Deliverables:

- `docs/V1_MEASUREMENT_FIXTURE_EVIDENCE_MATRIX_GATE.md`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- `tests/v1MeasurementFixtureEvidenceMatrixGate.test.ts`;
- README, phase ledger, and roadmap updates;
- Phase 183 current-pointer guard update.

Acceptance:

- stable matrix, corpus, policy, and fixture ids are selected;
- required v1 fixture categories are mapped to release-gating or exploratory
  coverage;
- each release-gating fixture is mapped to measurement profile requirements;
- required facts are defined for glyph facts, cluster map, text range, line
  boxes, total width/height, line count, drift summary, and native/WASM parity
  summary;
- missing-evidence status is defined for accepted, warning, blocked, and
  unknown;
- raw evidence remains outside core and root tests/docs consume only JSON-safe
  summaries;
- next phase is Phase 185: Measurement Evidence Summary Manifest Gate;
- no `measureVNextText(...)` default replacement, pagination mutation,
  production renderer-backed measurement binding, external text-engine
  execution in core, production PDF/DOCX renderer work, backend routes/storage/
  auth, production contenteditable, package/document schema change,
  collaboration/offline behavior, or legacy editor runtime copy is introduced.

## Phase 185: Measurement Evidence Summary Manifest Gate

Goal:

- define the JSON-safe summary manifest shape for the Phase 184 measurement
  fixture matrix without filling raw evidence or binding production
  measurement.

Deliverables:

- `docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_GATE.md`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- `tests/measurementEvidenceSummaryManifestGate.test.ts`;
- README, phase ledger, and roadmap updates;
- Phase 184 current-pointer guard update.

Acceptance:

- manifest id, matrix id, corpus id, policy revision, measurement profile id,
  fixture/scenario ids, and gate type are included;
- required fact coverage is represented;
- digest identity, native/WASM parity, renderer-backed drift, and
  missing-evidence status summaries are represented;
- accepted, warning, blocked, and unknown status fields are defined;
- retention pointers for raw native/WASM/renderer evidence are references and
  keep raw evidence out of root tests/docs;
- raw evidence owner, root-summary owner, and replacement blockers are explicit;
- next phase is Phase 186: Measurement Evidence Summary Manifest Fixture Stub
  Gate;
- no `measureVNextText(...)` default replacement, pagination mutation,
  production renderer-backed measurement binding, external text-engine
  execution in core, raw evidence in root tests/docs, production PDF/DOCX
  renderer work, backend routes/storage/auth, production contenteditable,
  package/document schema change, collaboration/offline behavior, or legacy
  editor runtime copy is introduced.

## Phase 186: Measurement Evidence Summary Manifest Fixture Stub Gate

Goal:

- add a JSON-safe stub summary manifest for the Phase 184 fixture matrix
  without producing real evidence or claiming production readiness.

Deliverables:

- `fixtures/measurement-evidence-summary-manifest.stub.v1.json`;
- `docs/MEASUREMENT_EVIDENCE_SUMMARY_MANIFEST_FIXTURE_STUB_GATE.md`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- `tests/measurementEvidenceSummaryManifestFixtureStubGate.test.ts`;
- README, phase ledger, and roadmap updates;
- pointer guard test updates.

Acceptance:

- all Phase 184 release-gating fixture rows are included;
- useful exploratory rows are included separately;
- `rawEvidenceIncluded=false`;
- release-gating rows remain `unknown` or missing/blocked according to policy;
- required fact coverage remains `missing`;
- digest identity is pending or missing;
- native/WASM parity is not-run or missing;
- renderer-backed drift is unknown;
- retention pointers are null or external placeholders with
  `includedInRoot=false`;
- tests assert the stub cannot be mistaken for accepted evidence;
- next phase is Phase 187: Measurement Evidence Coverage Gap Triage Gate;
- no `measureVNextText(...)` default replacement, pagination mutation,
  production renderer-backed measurement binding, external text-engine
  execution in core, raw evidence in root tests/docs, production PDF/DOCX
  renderer work, backend routes/storage/auth, production contenteditable,
  package/document schema change, collaboration/offline behavior, or legacy
  editor runtime copy is introduced.

## Phase 187: Measurement Evidence Coverage Gap Triage Gate

Goal:

- rank the Phase 186 stub manifest gaps, group them by owner, order
  prerequisites, choose first rows to fill, and recommend the next
  evidence-builder phase without producing real evidence.

Deliverables:

- `docs/MEASUREMENT_EVIDENCE_COVERAGE_GAP_TRIAGE_GATE.md`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- `tests/measurementEvidenceCoverageGapTriageGate.test.ts`;
- README, phase ledger, and roadmap updates;
- pointer guard test updates.

Acceptance:

- missing evidence is ranked across all release-gating rows;
- gaps are grouped by text-engine package, renderer-backed provider,
  fixture/corpus owner, root JSON-safe summary owner, and future PDF/DOCX
  renderer owner;
- prerequisite order is digest/runtime identity, native evidence, WASM
  evidence, parity summaries, renderer-backed drift summaries, numeric drift
  thresholds, and accepted summary manifest;
- first fixture rows to fill are selected;
- next phase is Phase 188: Text Engine Runtime Identity Digest Evidence
  Builder Gate;
- default-measurer replacement remains blocked;
- no real native/WASM evidence, rustybuzz/WASM/ICU4X execution in core,
  production renderer-backed measurement truth, `measureVNextText(...)`
  replacement, pagination mutation, raw evidence in root tests/docs,
  production PDF/DOCX renderer work, backend routes/storage/auth, production
  contenteditable, package/document schema change, collaboration/offline
  behavior, or legacy editor runtime copy is introduced.

## Phase 188: Text Engine Runtime Identity Digest Evidence Builder Gate

Goal:

- define the first package-local runtime identity digest evidence builder path
  without executing text engines in core or producing production measurement
  evidence.

Deliverables:

- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_BUILDER_GATE.md`;
- `packages/text-engine-rust-wasm/src/runtimeIdentityDigestEvidenceBuilder.ts`;
- `packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-builder.v1.json`;
- updated `packages/text-engine-rust-wasm/src/index.ts`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- `tests/textEngineRuntimeIdentityDigestEvidenceBuilderGate.test.ts`;
- README, phase ledger, and roadmap updates;
- pointer guard test updates.

Acceptance:

- package-local digest/runtime identity evidence builder path is defined;
- evidence owner stays in the external text-engine package/lane;
- JSON-safe root summary handoff shape is defined;
- pinned, pending, missing, and stale digest status policy is defined;
- retention pointer policy keeps raw runtime/WASM evidence outside root
  tests/docs;
- builder relationship to measurement profile id, corpus id, policy revision,
  output shape, rustybuzz revision, ICU4X revision, ICU4X data revision, font
  hashes, and WASM artifact digest is explicit;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, accepted summary manifest, and
  default-measurer replacement remain blocked;
- next phase is Phase 189: Text Engine Runtime Identity Digest Evidence
  Population Gate;
- no rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`, raw native/WASM
  evidence in root tests/docs, `measureVNextText(...)` replacement,
  pagination mutation, production renderer-backed measurement binding,
  production PDF/DOCX renderer work, backend routes/storage/auth, production
  contenteditable, package/document schema change, collaboration/offline
  behavior, or legacy editor runtime copy is introduced.

## Phase 189: Text Engine Runtime Identity Digest Evidence Population Gate

Goal:

- decide whether the package-local WASM artifact digest can be pinned now, or
  explicitly retain pending status without claiming production readiness.

Deliverables:

- `docs/TEXT_ENGINE_RUNTIME_IDENTITY_DIGEST_EVIDENCE_POPULATION_GATE.md`;
- `packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-population.v1.json`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- `tests/textEngineRuntimeIdentityDigestEvidencePopulationGate.test.ts`;
- README, phase ledger, and roadmap updates;
- pointer guard test updates.

Acceptance:

- current digest pinning eligibility is decided;
- digest remains explicitly retained as `pending` because no package-local
  WASM artifact is present;
- package-local population summary fixture is JSON-safe;
- root docs/tests consume summaries and retention pointers only;
- pending digest cannot be mistaken for production readiness;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, accepted summary manifest, and
  default-measurer replacement remain blocked;
- next phase is Phase 190: Text Engine WASM Artifact Digest Pinning Gate;
- no rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`, raw native/WASM
  evidence in root tests/docs, `measureVNextText(...)` replacement,
  pagination mutation, production renderer-backed measurement binding,
  production PDF/DOCX renderer work, backend routes/storage/auth, production
  contenteditable, package/document schema change, collaboration/offline
  behavior, or legacy editor runtime copy is introduced.

## Phase 190: Text Engine WASM Artifact Digest Pinning Gate

Goal:

- check the package-local WASM artifact candidate paths, define the accepted
  package-local output path, and pin sha256 only if a real artifact exists.

Deliverables:

- `docs/TEXT_ENGINE_WASM_ARTIFACT_DIGEST_PINNING_GATE.md`;
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- `tests/textEngineWasmArtifactDigestPinningGate.test.ts`;
- README, phase ledger, and roadmap updates;
- pointer guard test updates.

Acceptance:

- Phase 189 candidate artifact paths are checked;
- no package-local WASM artifact is present;
- accepted future output path is defined as
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- digest remains `pending` with `sha256=null`;
- package-local pinning summary fixture is JSON-safe;
- root docs/tests consume summaries and retention pointers only;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, accepted summary manifest, and
  default-measurer replacement remain blocked;
- next phase is Phase 191: Text Engine WASM Artifact Build Output Gate;
- no rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`, raw native/WASM
  evidence in root tests/docs, `measureVNextText(...)` replacement,
  pagination mutation, production renderer-backed measurement binding,
  production PDF/DOCX renderer work, backend routes/storage/auth, production
  contenteditable, package/document schema change, collaboration/offline
  behavior, or legacy editor runtime copy is introduced.

## Phase 191: Text Engine WASM Artifact Build Output Gate

Goal:

- define the package-local WASM build/output path and command, check whether
  the accepted artifact path can be produced, and keep digest pinning pending
  unless a real artifact exists.

Deliverables:

- `docs/TEXT_ENGINE_WASM_ARTIFACT_BUILD_OUTPUT_GATE.md`;
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-build-output.v1.json`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- `tests/textEngineWasmArtifactBuildOutputGate.test.ts`;
- README, phase ledger, and roadmap updates;
- pointer guard test updates.

Acceptance:

- accepted future output path remains
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- accepted future command is recorded as
  `wasm-pack build rust-shaper --target web --out-dir ../pkg --out-name flowdoc_text_engine`;
- command status is `blocked-not-runnable`;
- blocker status records missing `wasm-pack`, missing
  `wasm32-unknown-unknown`, and binary-only native smoke crate shape;
- no artifact is produced under `packages/text-engine-rust-wasm/pkg/`;
- digest remains `pending` with `sha256=null`;
- package-local build output summary fixture is JSON-safe;
- root docs/tests consume summaries and retention pointers only;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, accepted summary manifest, production
  binding, and default-measurer replacement remain blocked;
- next phase is Phase 192: Text Engine WASM Build Toolchain Readiness Gate;
- no rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`, raw native/WASM
  evidence in root tests/docs, `measureVNextText(...)` replacement,
  pagination mutation, production renderer-backed measurement binding,
  production PDF/DOCX renderer work, backend routes/storage/auth, production
  contenteditable, package/document schema change, collaboration/offline
  behavior, or legacy editor runtime copy is introduced.

## Phase 192: Text Engine WASM Build Toolchain Readiness Gate

Goal:

- define package-local WASM toolchain readiness, choose the accepted build
  path, and make the `rust-shaper` crate target minimally ready without
  producing an artifact.

Deliverables:

- `docs/TEXT_ENGINE_WASM_BUILD_TOOLCHAIN_READINESS_GATE.md`;
- `packages/text-engine-rust-wasm/rust-shaper/Cargo.toml`;
- `packages/text-engine-rust-wasm/rust-shaper/src/lib.rs`;
- `packages/text-engine-rust-wasm/package.json`;
- `packages/text-engine-rust-wasm/README.md`;
- `packages/text-engine-rust-wasm/fixtures/wasm-build-toolchain-readiness.v1.json`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- `tests/textEngineWasmBuildToolchainReadinessGate.test.ts`;
- README, phase ledger, and roadmap updates;
- pointer guard test updates.

Acceptance:

- `wasm-pack` availability is checked and documented as unavailable;
- `wasm32-unknown-unknown` availability is checked and documented as absent;
- `wasm-pack` is accepted as the build path for the current `pkg` output;
- direct Cargo plus `wasm-bindgen` remains a deferred alternate;
- `rust-shaper/src/lib.rs` exists;
- `[lib] crate-type = ["cdylib", "rlib"]` is declared;
- `[lib] name = "flowdoc_text_engine"` avoids native bin/lib output filename
  collision;
- native `main.rs` smoke path remains intact;
- package-local `wasm:build` script metadata is added;
- root `npm.cmd run check` does not require `wasm-pack` or the WASM target;
- no artifact is produced under `packages/text-engine-rust-wasm/pkg/`;
- digest remains `pending` with `sha256=null`;
- package-local readiness summary fixture is JSON-safe;
- root docs/tests consume summaries and retention pointers only;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, accepted summary manifest, production
  binding, and default-measurer replacement remain blocked;
- next phase is Phase 193: Text Engine WASM Toolchain Acquisition Gate;
- no rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`, raw native/WASM
  evidence in root tests/docs, root check dependency on `wasm-pack` or
  `wasm32-unknown-unknown`, `measureVNextText(...)` replacement, pagination
  mutation, production renderer-backed measurement binding, production
  PDF/DOCX renderer work, backend routes/storage/auth, production
  contenteditable, package/document schema change, collaboration/offline
  behavior, or legacy editor runtime copy is introduced.

## Phase 193: Text Engine WASM Toolchain Acquisition Gate

Goal:

- decide how `wasm-pack` and `wasm32-unknown-unknown` become available for
  package-local builds without making root checks depend on them.

Deliverables:

- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_ACQUISITION_GATE.md`;
- `packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs`;
- `packages/text-engine-rust-wasm/package.json`;
- `packages/text-engine-rust-wasm/README.md`;
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-acquisition.v1.json`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- `tests/textEngineWasmToolchainAcquisitionGate.test.ts`;
- README, phase ledger, and roadmap updates;
- pointer guard test updates.

Acceptance:

- `wasm-pack` acquisition is accepted as developer/CI bootstrap outside root
  checks;
- `wasm-pack` provisioning command is documented as
  `cargo install wasm-pack --locked`;
- `wasm-pack` version policy remains pending until installed and must be
  pinned before artifact production;
- `wasm32-unknown-unknown` provisioning is documented as
  `rustup target add wasm32-unknown-unknown`;
- package-local `wasm:check-toolchain` diagnostic metadata is added;
- diagnostic reports unavailable tooling as JSON-safe status and exits zero;
- root `npm.cmd run check` does not require `wasm-pack`, the WASM target, the
  diagnostic, or a WASM artifact;
- no artifact is produced under `packages/text-engine-rust-wasm/pkg/`;
- digest remains `pending` with `sha256=null`;
- package-local acquisition summary fixture is JSON-safe;
- root docs/tests consume summaries and retention pointers only;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, accepted summary manifest, production
  binding, and default-measurer replacement remain blocked;
- next phase is Phase 194: Text Engine WASM Toolchain Optional Readiness
  Smoke;
- no `wasm-pack` or `wasm32-unknown-unknown` requirement in root checks,
  rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`, raw native/WASM
  evidence in root tests/docs, fake WASM artifact, fake sha256,
  `measureVNextText(...)` replacement, pagination mutation, production
  renderer-backed measurement binding, production PDF/DOCX renderer work,
  backend routes/storage/auth, production contenteditable, package/document
  schema change, collaboration/offline behavior, or legacy editor runtime copy
  is introduced.

## Phase 194: Text Engine WASM Toolchain Optional Readiness Smoke

Goal:

- run the package-local toolchain diagnostic as an optional readiness smoke and
  record JSON-safe availability without requiring root checks to depend on
  WASM tooling.

Deliverables:

- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_OPTIONAL_READINESS_SMOKE.md`;
- `packages/text-engine-rust-wasm/package.json`;
- `packages/text-engine-rust-wasm/README.md`;
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-optional-readiness-smoke.v1.json`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- `tests/textEngineWasmToolchainOptionalReadinessSmoke.test.ts`;
- README, phase ledger, and roadmap updates;
- pointer guard test updates.

Acceptance:

- package-local `wasm:readiness-smoke` wraps `wasm:check-toolchain`;
- the smoke runs and exits zero;
- JSON-safe availability summary is recorded;
- missing `wasm-pack` and missing `wasm32-unknown-unknown` are unavailable
  blockers, not root check failures;
- root `npm.cmd run check` does not require `wasm-pack`, the WASM target, the
  readiness smoke, or a WASM artifact;
- no artifact is produced under `packages/text-engine-rust-wasm/pkg/`;
- digest remains `pending` with `sha256=null`;
- package-local optional readiness smoke summary fixture is JSON-safe;
- root docs/tests consume summaries and retention pointers only;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, accepted summary manifest, production
  binding, and default-measurer replacement remain blocked;
- next phase is Phase 195: Text Engine WASM Artifact Production Gate;
- no `wasm-pack` or `wasm32-unknown-unknown` requirement in root checks,
  rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`, raw native/WASM
  evidence in root tests/docs, fake WASM artifact, fake sha256,
  `measureVNextText(...)` replacement, pagination mutation, production
  renderer-backed measurement binding, production PDF/DOCX renderer work,
  backend routes/storage/auth, production contenteditable, package/document
  schema change, collaboration/offline behavior, or legacy editor runtime copy
  is introduced.

## Phase 195: Text Engine WASM Artifact Production Gate

Goal:

- produce the package-local WASM artifact only if the Phase 194 readiness smoke
  proves the toolchain is available.

Deliverables:

- `docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_GATE.md`;
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-production.v1.json`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- `tests/textEngineWasmArtifactProductionGate.test.ts`;
- README, phase ledger, and roadmap updates;
- pointer guard test updates.

Acceptance:

- Phase 194 readiness is read before artifact production;
- current `wasm:readiness-smoke` still exits zero with unavailable tooling;
- `wasm:build` is not run because `wasm-pack` and
  `wasm32-unknown-unknown` are unavailable;
- no artifact is produced under `packages/text-engine-rust-wasm/pkg/`;
- artifact existence, pointer, retention pointer, and file size are recorded
  as JSON-safe absent values;
- digest remains `pending` with `sha256=null`;
- Phase 196 Artifact Digest Pinning Execution remains blocked until a real
  artifact exists;
- root `npm.cmd run check` does not require `wasm-pack`, the WASM target, the
  readiness smoke, the WASM build, or a WASM artifact;
- package-local artifact production summary fixture is JSON-safe;
- root docs/tests consume summaries and retention pointers only;
- native evidence, WASM evidence, parity summaries, renderer-backed drift
  summaries, numeric thresholds, accepted summary manifest, production
  binding, and default-measurer replacement remain blocked;
- next recommended work is Text Engine WASM Toolchain Provisioning Bootstrap
  Gate;
- no `wasm-pack` or `wasm32-unknown-unknown` requirement in root checks,
  rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`, raw native/WASM
  evidence in root tests/docs, fake WASM artifact, fake sha256,
  `measureVNextText(...)` replacement, pagination mutation, production
  renderer-backed measurement binding, production PDF/DOCX renderer work,
  backend routes/storage/auth, production contenteditable, package/document
  schema change, collaboration/offline behavior, or legacy editor runtime copy
  is introduced.

## Phase 195A: Text Engine WASM Toolchain Provisioning Bootstrap Gate

Goal:

- decide the package-local provisioning/bootstrap path for `wasm-pack` and
  `wasm32-unknown-unknown` while keeping root checks independent.

Deliverables:

- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_PROVISIONING_BOOTSTRAP_GATE.md`;
- `packages/text-engine-rust-wasm/scripts/plan-wasm-toolchain-bootstrap.mjs`;
- `packages/text-engine-rust-wasm/package.json`;
- `packages/text-engine-rust-wasm/README.md`;
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-bootstrap.v1.json`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- `tests/textEngineWasmToolchainProvisioningBootstrapGate.test.ts`;
- README, phase ledger, and roadmap updates;
- pointer guard test updates.

Acceptance:

- accepted `wasm-pack` provisioning path is
  `cargo install wasm-pack --locked`;
- accepted `wasm32-unknown-unknown` provisioning path is
  `rustup target add wasm32-unknown-unknown`;
- developer/CI bootstrap is selected as the strategy;
- cached binary, pinned CI image, and preinstalled developer toolchain are
  allowed alternatives;
- package-local `wasm:bootstrap-plan` script is added;
- bootstrap script is plan/check only and does not install tooling;
- `wasm-pack`, `rustc`, `cargo`, and Rust target version policies are
  recorded;
- `wasm:readiness-smoke` remains the source for availability;
- root `npm.cmd run check` does not require `wasm-pack`, the WASM target, the
  bootstrap plan, the readiness smoke, the WASM build, or an artifact;
- artifact production remains blocked until `toolchainReady=true`;
- digest pinning remains blocked until a real artifact exists;
- no `wasm-pack` or `wasm32-unknown-unknown` requirement in root checks,
  rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`, fake WASM artifact,
  fake sha256, `measureVNextText(...)` replacement, pagination mutation,
  production renderer-backed measurement binding, production PDF/DOCX renderer
  work, backend routes/storage/auth, production contenteditable,
  package/document schema change, collaboration/offline behavior, or legacy
  editor runtime copy is introduced.

## Phase 195B: Text Engine WASM Toolchain Provisioning Execution Gate

Goal:

- execute or explicitly gate the package-local provisioning path for
  `wasm-pack` and `wasm32-unknown-unknown` while keeping root checks
  independent.

Deliverables:

- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_PROVISIONING_EXECUTION_GATE.md`;
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-provisioning-execution.v1.json`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- `tests/textEngineWasmToolchainProvisioningExecutionGate.test.ts`;
- README, phase ledger, package README, and roadmap updates;
- pointer guard test updates.

Acceptance:

- provisioning execution permission is checked through sandbox escalation;
- `cargo install wasm-pack --locked` is attempted;
- `cargo install wasm-pack --locked` fails because `wasm-pack v0.15.0`
  depends on `cargo-platform@0.3.3`, which requires `rustc 1.91`, while this
  environment reports `rustc 1.88.0`;
- `rustup target add wasm32-unknown-unknown` is attempted and succeeds;
- post-execution `wasm:readiness-smoke` reports
  `wasm32UnknownUnknownInstalled=true`, `wasmPackAvailable=false`, and
  `toolchainReady=false`;
- root `npm.cmd run check` does not require `wasm-pack`, the WASM target,
  provisioning execution, the readiness smoke, the WASM build, or an artifact;
- artifact production remains blocked until `toolchainReady=true`;
- digest pinning remains blocked until a real artifact exists;
- no `wasm-pack` or `wasm32-unknown-unknown` requirement in root checks,
  rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`, fake WASM artifact,
  fake sha256, `measureVNextText(...)` replacement, pagination mutation,
  production renderer-backed measurement binding, production PDF/DOCX renderer
  work, backend routes/storage/auth, production contenteditable,
  package/document schema change, collaboration/offline behavior, or legacy
  editor runtime copy is introduced.

## Phase 195C: Text Engine WASM Toolchain Version Compatibility Gate

Goal:

- choose the next accepted `wasm-pack` compatibility strategy after the
  provisioning execution gate proves the current Rust toolchain is too old for
  `wasm-pack v0.15.0`.

Deliverables:

- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_VERSION_COMPATIBILITY_GATE.md`;
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-version-compatibility.v1.json`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- `tests/textEngineWasmToolchainVersionCompatibilityGate.test.ts`;
- README, phase ledger, package README, and roadmap updates;
- pointer guard test updates.

Acceptance:

- compares Rust `1.91+` upgrade, older compatible `wasm-pack` pinning,
  pinned CI image, internal tool cache, and preinstalled developer toolchain;
- selects Rust toolchain upgrade to `1.91+` as the immediate strategy;
- selects pinned CI image or equivalent immutable runner as the longer-term
  reproducible strategy;
- keeps `wasm32-unknown-unknown` recorded as installed;
- keeps `wasmPackAvailable=false`;
- keeps `toolchainReady=false`;
- root `npm.cmd run check` does not require `wasm-pack`, the WASM target, the
  compatibility strategy, the readiness smoke, the WASM build, or an artifact;
- artifact production remains blocked until `wasm-pack` is available and
  `toolchainReady=true`;
- digest pinning remains blocked until a real artifact exists;
- no `wasm-pack` or `wasm32-unknown-unknown` requirement in root checks,
  rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`, fake WASM artifact,
  fake sha256, `measureVNextText(...)` replacement, pagination mutation,
  production renderer-backed measurement binding, production PDF/DOCX renderer
  work, backend routes/storage/auth, production contenteditable,
  package/document schema change, collaboration/offline behavior, or legacy
  editor runtime copy is introduced.

## Phase 195D: Text Engine WASM Toolchain Rust Upgrade Execution Gate

Goal:

- execute or explicitly block the accepted Rust 1.91+ upgrade strategy, then
  retry `cargo install wasm-pack --locked` only if the captured `rustc` version
  is 1.91 or newer.

Deliverables:

- `docs/TEXT_ENGINE_WASM_TOOLCHAIN_RUST_UPGRADE_EXECUTION_GATE.md`;
- `packages/text-engine-rust-wasm/fixtures/wasm-toolchain-rust-upgrade-execution.v1.json`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- `tests/textEngineWasmToolchainRustUpgradeExecutionGate.test.ts`;
- README, phase ledger, package README, and roadmap updates;
- pointer guard test updates.

Acceptance:

- executes `rustup update stable` as the accepted immediate strategy;
- captures `rustc 1.96.0` and `cargo 1.96.0`;
- verifies `rustc` satisfies the `1.91+` minimum before retrying
  `wasm-pack`;
- verifies `wasm32-unknown-unknown` remains installed;
- retries `cargo install wasm-pack --locked` only after the Rust version check
  passes;
- captures `wasm-pack 0.15.0`;
- reruns package-local `wasm:readiness-smoke` and records
  `toolchainReady=true`;
- keeps root `npm.cmd run check` independent from `wasm-pack`, the WASM target,
  Rust upgrade execution, readiness smoke, WASM build, and artifacts;
- does not run `wasm:build`, produce an artifact, compute sha256, or proceed to
  digest pinning;
- no rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`, fake WASM
  artifact, fake sha256, `measureVNextText(...)` replacement, pagination
  mutation, production renderer-backed measurement binding, production PDF/DOCX
  renderer work, backend routes/storage/auth, production contenteditable,
  package/document schema change, collaboration/offline behavior, or legacy
  editor runtime copy is introduced.

## Phase 195E: Text Engine WASM Artifact Production Retry Gate

Goal:

- run package-local `wasm:build` only after readiness reports
  `toolchainReady=true`, then either produce the accepted artifact under
  `packages/text-engine-rust-wasm/pkg/` or record the exact blocker.

Deliverables:

- `docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_RETRY_GATE.md`;
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-production-retry.v1.json`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- `tests/textEngineWasmArtifactProductionRetryGate.test.ts`;
- README, phase ledger, package README, and roadmap updates;
- pointer guard test updates.

Acceptance:

- confirms `wasmPackAvailable=true`;
- confirms `wasmPackVersion="wasm-pack 0.15.0"`;
- confirms `wasm32UnknownUnknownInstalled=true`;
- confirms `toolchainReady=true`;
- confirms `canProduceArtifactNow=true`;
- runs package-local `wasm:build`;
- records build failure as `failed-missing-wasm-bindgen-dependency`;
- records accepted artifact as absent;
- records generated package metadata as `not-generated`;
- keeps `digestStatus="pending"` and `sha256=null`;
- keeps root `npm.cmd run check` independent from `wasm-pack`, the WASM target,
  readiness smoke, WASM build, artifact production retry, and artifacts;
- does not compute sha256 or proceed to digest pinning;
- no rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`, fake WASM
  artifact, fake sha256, `measureVNextText(...)` replacement, pagination
  mutation, production renderer-backed measurement binding, production PDF/DOCX
  renderer work, backend routes/storage/auth, production contenteditable,
  package/document schema change, collaboration/offline behavior, or legacy
  editor runtime copy is introduced.

## Phase 195F: Text Engine WASM Bindgen Export Dependency Gate

Goal:

- resolve the package-local `wasm-bindgen` dependency/export blocker required
  by `wasm-pack` without changing root checks or production measurement
  binding.

Deliverables:

- `docs/TEXT_ENGINE_WASM_BINDGEN_EXPORT_DEPENDENCY_GATE.md`;
- `packages/text-engine-rust-wasm/fixtures/wasm-bindgen-export-dependency.v1.json`;
- `packages/text-engine-rust-wasm/rust-shaper/Cargo.toml`;
- `packages/text-engine-rust-wasm/rust-shaper/Cargo.lock`;
- `packages/text-engine-rust-wasm/rust-shaper/src/lib.rs`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- `tests/textEngineWasmBindgenExportDependencyGate.test.ts`;
- README, phase ledger, package README, and roadmap updates;
- pointer guard test updates.

Acceptance:

- adds `wasm-bindgen = "0.2"` package-locally;
- records resolved `wasm-bindgen 0.2.126` in Cargo.lock;
- defines only minimal non-production `#[wasm_bindgen]` exports for readiness
  marker and boundary version;
- keeps rustybuzz shaping and ICU4X out of the WASM library boundary;
- keeps native `main.rs` rustybuzz smoke path intact;
- passes package-local WASM target and native cargo checks;
- does not retry `wasm:build`;
- keeps accepted artifact absent and digest pinning blocked;
- keeps root `npm.cmd run check` independent from `wasm-bindgen`,
  `wasm-pack`, the WASM target, readiness smoke, WASM build, and artifacts;
- no rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`, fake WASM
  artifact, fake sha256, sha256 compute, `measureVNextText(...)` replacement,
  pagination mutation, production renderer-backed measurement binding,
  production PDF/DOCX renderer work, backend routes/storage/auth, production
  contenteditable, package/document schema change, collaboration/offline
  behavior, or legacy editor runtime copy is introduced.

## Phase 195G: Text Engine WASM Artifact Production Retry After Bindgen Gate

Goal:

- rerun package-local readiness and retry `wasm:build` after the
  package-local `wasm-bindgen` dependency/export blocker has been resolved.

Deliverables:

- `docs/TEXT_ENGINE_WASM_ARTIFACT_PRODUCTION_RETRY_GATE.md`;
- `packages/text-engine-rust-wasm/fixtures/wasm-artifact-production-retry.v1.json`;
- accepted artifact under
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- generated JS/TypeScript/package metadata under
  `packages/text-engine-rust-wasm/pkg/`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- `tests/textEngineWasmArtifactProductionRetryGate.test.ts`;
- README, phase ledger, package README, and roadmap updates;
- pointer guard test updates.

Acceptance:

- confirms `wasmPackAvailable=true`;
- confirms `wasmPackVersion="wasm-pack 0.15.0"`;
- confirms `wasm32UnknownUnknownInstalled=true`;
- confirms `toolchainReady=true`;
- confirms `canProduceArtifactNow=true`;
- runs package-local `wasm:build`;
- records build status as `succeeded`;
- records accepted artifact as present;
- records generated package metadata as `generated`;
- records `fileSizeBytes=13782`;
- keeps `digestStatus="pending"` and `sha256=null`;
- keeps root `npm.cmd run check` independent from `wasm-pack`, the WASM target,
  readiness smoke, WASM build, artifact production retry, and artifacts;
- does not compute sha256 or proceed to digest pinning in this phase;
- no rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`, fake WASM
  artifact, fake sha256, `measureVNextText(...)` replacement, pagination
  mutation, production renderer-backed measurement binding, production PDF/DOCX
  renderer work, backend routes/storage/auth, production contenteditable,
  package/document schema change, collaboration/offline behavior, or legacy
  editor runtime copy is introduced.

## Phase 196: Artifact Digest Pinning Execution

Goal:

- compute and pin sha256 for the accepted package-local WASM artifact only
  when the artifact path and runtime identity context match policy.

Deliverables:

- `docs/ARTIFACT_DIGEST_PINNING_EXECUTION.md`;
- `tests/artifactDigestPinningExecution.test.ts`;
- updated `packages/text-engine-rust-wasm/fixtures/wasm-artifact-digest-pinning.v1.json`;
- updated `packages/text-engine-rust-wasm/fixtures/text-engine-runtime-identity.v1.json`;
- updated `packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-builder.v1.json`;
- updated `packages/text-engine-rust-wasm/fixtures/runtime-identity-digest-evidence-population.v1.json`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- README, phase ledger, package README, and roadmap updates;
- pointer guard test updates.

Acceptance:

- confirms `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`
  exists;
- computes sha256 from the real artifact file;
- requires lowercase 64-character hex sha256;
- records sha256 as
  `4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44`;
- validates package-local artifact path, matrix id, corpus id, policy
  revision, measurement profile id, and output shape;
- updates package-local digest/runtime identity summaries to
  `digestStatus="pinned"`;
- keeps root docs/tests limited to JSON-safe summaries and retention pointers;
- keeps native evidence, WASM evidence, parity, drift, thresholds, accepted
  manifest, production binding, and default-measurer replacement blocked;
- no rustybuzz/WASM/ICU4X execution in `@flowdoc/vnext-core`, fake sha256,
  `measureVNextText(...)` replacement, pagination mutation, production
  renderer-backed measurement binding, production PDF/DOCX renderer work,
  backend routes/storage/auth, production contenteditable, package/document
  schema change, collaboration/offline behavior, or legacy editor runtime copy
  is introduced.

## Phase 197: Native Evidence Summary Gate

Goal:

- produce the smallest JSON-safe native evidence summary metadata subset first,
  starting with Thai line-break core coverage and canonical Latin paragraph
  coverage.

Deliverables:

- `docs/NATIVE_EVIDENCE_SUMMARY_GATE.md`;
- `tests/nativeEvidenceSummaryGate.test.ts`;
- `packages/text-engine-rust-wasm/fixtures/native-evidence-summary.v1.json`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- README, phase ledger, package README, and roadmap updates;
- pointer guard test updates.

Acceptance:

- confirms digest identity is pinned against
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`;
- records sha256 as
  `4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44`;
- carries matrix id `v1-measurement-fixture-evidence-matrix-v1`;
- carries corpus id `v1-measurement-evidence-corpus-v1`;
- carries policy revision `v1-measurement-evidence-policy-v1`;
- carries output shape `glyph-line-box-v1`;
- records `v1-measure-thai-line-break-core` and
  `v1-measure-latin-product-paragraphs` as the minimal native summary subset;
- keeps raw native evidence outside root docs/tests;
- keeps root checks independent from `wasm-pack` and the WASM target;
- keeps WASM evidence, native/WASM parity, renderer-backed drift, numeric
  thresholds, accepted manifest, production binding, and default-measurer
  replacement blocked;
- no `measureVNextText(...)` replacement, pagination mutation, production
  renderer-backed measurement binding, production PDF/DOCX renderer work,
  backend routes/storage/auth, production contenteditable, package/document
  schema change, collaboration/offline behavior, or legacy editor runtime copy
  is introduced.

## Phase 198: WASM Evidence Summary Gate

Goal:

- produce JSON-safe WASM evidence summary metadata for the same smallest
  native subset:
  `v1-measure-thai-line-break-core` and
  `v1-measure-latin-product-paragraphs`.

Deliverables:

- `docs/WASM_EVIDENCE_SUMMARY_GATE.md`;
- `tests/wasmEvidenceSummaryGate.test.ts`;
- `packages/text-engine-rust-wasm/fixtures/wasm-evidence-summary.v1.json`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- README, phase ledger, package README, and roadmap updates;
- pointer guard test updates.

Acceptance:

- confirms native evidence summary exists and matches the pinned digest
  context;
- records sha256 as
  `4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44`;
- carries matrix id `v1-measurement-fixture-evidence-matrix-v1`;
- carries corpus id `v1-measurement-evidence-corpus-v1`;
- carries policy revision `v1-measurement-evidence-policy-v1`;
- carries output shape `glyph-line-box-v1`;
- records `v1-measure-thai-line-break-core` and
  `v1-measure-latin-product-paragraphs` as the minimal WASM summary subset;
- requires the WASM subset and scenario ids to match the native summary;
- keeps raw WASM evidence outside root docs/tests;
- keeps root checks independent from `wasm-pack` and the WASM target;
- keeps native/WASM parity, renderer-backed drift, numeric thresholds,
  accepted manifest, production binding, and default-measurer replacement
  blocked;
- no `measureVNextText(...)` replacement, pagination mutation, production
  renderer-backed measurement binding, production PDF/DOCX renderer work,
  backend routes/storage/auth, production contenteditable, package/document
  schema change, collaboration/offline behavior, or legacy editor runtime copy
  is introduced.

## Phase 199: Native/WASM Parity Summary Gate

Goal:

- compare the native and WASM evidence summary metadata for the same Thai
  line-break core and canonical Latin paragraph subset.

Deliverables:

- `docs/NATIVE_WASM_PARITY_SUMMARY_GATE.md`;
- `tests/nativeWasmParitySummaryGate.test.ts`;
- `packages/text-engine-rust-wasm/fixtures/native-wasm-parity-summary.v1.json`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- README, phase ledger, package README, and roadmap updates;
- pointer guard test updates.

Acceptance:

- confirms native evidence summary exists;
- confirms WASM evidence summary exists;
- records sha256 as
  `4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44`;
- requires matching matrix id `v1-measurement-fixture-evidence-matrix-v1`;
- requires matching corpus id `v1-measurement-evidence-corpus-v1`;
- requires matching policy revision `v1-measurement-evidence-policy-v1`;
- requires matching output shape `glyph-line-box-v1`;
- requires matching measurement profile id, fixture ids, and scenario ids;
- compares metadata coverage for glyph facts, cluster map, text range, line
  boxes, total size, and line count;
- records parity status as `matching-summary-metadata`;
- keeps raw native/WASM evidence outside root docs/tests;
- keeps root checks independent from `wasm-pack` and the WASM target;
- keeps renderer-backed drift, numeric thresholds, accepted manifest,
  production binding, and default-measurer replacement blocked;
- no `measureVNextText(...)` replacement, pagination mutation, production
  renderer-backed measurement binding, production PDF/DOCX renderer work,
  backend routes/storage/auth, production contenteditable, package/document
  schema change, collaboration/offline behavior, or legacy editor runtime copy
  is introduced.

## Phase 200: Renderer-backed Drift Summary Gate

Goal:

- produce a JSON-safe renderer-backed drift summary for the same Thai
  line-break core and canonical Latin paragraph subset.

Deliverables:

- `docs/RENDERER_BACKED_DRIFT_SUMMARY_GATE.md`;
- `tests/rendererBackedDriftSummaryGate.test.ts`;
- `packages/text-engine-rust-wasm/fixtures/renderer-backed-drift-summary.v1.json`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- README, phase ledger, package README, and roadmap updates;
- pointer guard test updates.

Acceptance:

- confirms Native/WASM parity summary exists;
- confirms parity status is `matching-summary-metadata`;
- records sha256 as
  `4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44`;
- requires matching matrix id `v1-measurement-fixture-evidence-matrix-v1`;
- requires matching corpus id `v1-measurement-evidence-corpus-v1`;
- requires matching policy revision `v1-measurement-evidence-policy-v1`;
- requires matching output shape `glyph-line-box-v1`;
- requires matching measurement profile id, fixture ids, and scenario ids;
- records renderer-backed drift status as `summary-metadata-present`;
- records drift metadata coverage as unthresholded width, height, and
  line-count drift metadata;
- keeps raw native/WASM/renderer evidence outside root docs/tests;
- keeps root checks independent from `wasm-pack` and the WASM target;
- keeps numeric thresholds, accepted manifest, production binding, and
  default-measurer replacement blocked;
- no `measureVNextText(...)` replacement, pagination mutation, production
  renderer-backed measurement binding, production PDF/DOCX renderer work,
  backend routes/storage/auth, production contenteditable, package/document
  schema change, collaboration/offline behavior, or legacy editor runtime copy
  is introduced.

## Phase 201: Numeric Drift Threshold Decision

Goal:

- decide numeric drift threshold policy for the same Thai line-break core and
  canonical Latin paragraph subset.

Deliverables:

- `docs/NUMERIC_DRIFT_THRESHOLD_DECISION.md`;
- `tests/numericDriftThresholdDecision.test.ts`;
- `packages/text-engine-rust-wasm/fixtures/numeric-drift-threshold-decision.v1.json`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- README, phase ledger, package README, and roadmap updates;
- pointer guard test updates.

Acceptance:

- confirms renderer-backed drift summary exists;
- confirms renderer-backed drift status is `summary-metadata-present`;
- requires matching native/WASM parity summary and pinned digest context;
- requires matching matrix id `v1-measurement-fixture-evidence-matrix-v1`;
- requires matching corpus id `v1-measurement-evidence-corpus-v1`;
- requires matching policy revision `v1-measurement-evidence-policy-v1`;
- requires matching output shape `glyph-line-box-v1`;
- requires matching measurement profile id, fixture ids, and scenario ids;
- accepts width drift pass at `<=0.5pt`, warning through `<=1.0pt`, and
  blocked above `1.0pt`;
- accepts height drift pass at `<=0.5pt`, warning through `<=1.0pt`, and
  blocked above `1.0pt`;
- accepts release-gating line-count drift as zero-only;
- keeps raw native/WASM/renderer evidence outside root docs/tests;
- keeps accepted manifest, production binding, and default-measurer
  replacement blocked;
- no `measureVNextText(...)` replacement, pagination mutation, production
  renderer-backed measurement binding, production PDF/DOCX renderer work,
  backend routes/storage/auth, production contenteditable, package/document
  schema change, collaboration/offline behavior, or legacy editor runtime copy
  is introduced.

## Phase 202: Accepted Summary Manifest Population

Goal:

- populate accepted summary manifest entries for the same Thai line-break core
  and canonical Latin paragraph subset.

Deliverables:

- `docs/ACCEPTED_SUMMARY_MANIFEST_POPULATION.md`;
- `tests/acceptedSummaryManifestPopulation.test.ts`;
- `fixtures/measurement-evidence-summary-manifest.accepted.v1.json`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- README, phase ledger, package README, and roadmap updates;
- pointer guard test updates.

Acceptance:

- confirms numeric drift threshold decision exists;
- confirms numeric threshold policy status is `accepted-policy`;
- requires matching renderer-backed drift summary, native/WASM parity summary,
  and pinned digest context;
- requires matching matrix id `v1-measurement-fixture-evidence-matrix-v1`;
- requires matching corpus id `v1-measurement-evidence-corpus-v1`;
- requires matching policy revision `v1-measurement-evidence-policy-v1`;
- requires matching threshold policy revision
  `numeric-drift-threshold-policy-v1`;
- requires matching output shape `glyph-line-box-v1`;
- requires matching measurement profile id, fixture ids, and scenario ids;
- populates accepted manifest entries for `v1-measure-thai-line-break-core`
  and `v1-measure-latin-product-paragraphs`;
- carries only JSON-safe digest, native evidence, WASM evidence,
  native/WASM parity, renderer-backed drift, numeric threshold policy, and
  retention pointer statuses;
- keeps raw native/WASM/renderer evidence outside root docs/tests;
- keeps production binding and default-measurer replacement blocked;
- no `measureVNextText(...)` replacement, pagination mutation, production
  renderer-backed measurement binding, production PDF/DOCX renderer work,
  backend routes/storage/auth, production contenteditable, package/document
  schema change, collaboration/offline behavior, or legacy editor runtime copy
  is introduced.

## Phase 203: Measurement Hardening Close Audit

Goal:

- audit whether the accepted minimal measurement subset is enough for a mini
  infrastructure checkpoint, or whether more release-gating matrix rows must
  be populated before pivoting.

Deliverables:

- `docs/MEASUREMENT_HARDENING_CLOSE_AUDIT.md`;
- `tests/measurementHardeningCloseAudit.test.ts`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- README, phase ledger, package README, and roadmap updates;
- pointer guard test updates.

Acceptance:

- confirms accepted manifest exists at
  `fixtures/measurement-evidence-summary-manifest.accepted.v1.json`;
- confirms accepted entries exist for `v1-measure-thai-line-break-core` and
  `v1-measure-latin-product-paragraphs`;
- confirms each accepted entry carries digest identity status `pinned`, native
  evidence status `summary-metadata-present`, WASM evidence status
  `summary-metadata-present`, native/WASM parity status
  `matching-summary-metadata`, renderer-backed drift summary status
  `summary-metadata-present`, numeric threshold policy status
  `accepted-policy`, and retention pointer status `present`;
- confirms the full v1 matrix remains `partial-not-accepted`;
- decides the minimal accepted subset is sufficient for a mini infrastructure
  checkpoint only;
- recommends pivoting next to Template Publish / Variable Schema / Render API
  planning;
- lists remaining release-gating rows required before full measurement
  production readiness or default-measurer replacement;
- keeps raw native/WASM/renderer evidence outside root docs/tests;
- keeps production binding and default-measurer replacement blocked;
- no full v1 measurement production readiness, `measureVNextText(...)`
  replacement, pagination mutation, production renderer-backed measurement
  binding, production PDF/DOCX renderer work, backend routes/storage/auth,
  production contenteditable, package/document schema change,
  collaboration/offline behavior, or legacy editor runtime copy is introduced.

## Phase 204: Template Publish / Variable Schema / Render API Planning Gate

Goal:

- plan and rank the next non-measurement mini infrastructure lane across
  Template Publish / Version Boundary, Variable Schema / Data Contract, and
  Render API Contract.

Deliverables:

- `docs/TEMPLATE_VARIABLE_RENDER_API_PLANNING_GATE.md`;
- `tests/templateVariableRenderApiPlanningGate.test.ts`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- README, phase ledger, and roadmap updates;
- pointer guard test updates.

Acceptance:

- confirms Measurement Hardening Close Audit decided the minimal accepted
  measurement subset is sufficient for mini infrastructure checkpoint only;
- confirms full v1 measurement matrix remains `partial-not-accepted`;
- keeps production binding and default-measurer replacement blocked;
- compares Template Publish / Version Boundary, Variable Schema / Data
  Contract, and Render API Contract;
- ranks Template Publish / Version Boundary first;
- defers Variable Schema / Data Contract until template version identity
  exists;
- defers Render API Contract until template version identity and variable data
  contract direction exist;
- defines required evidence for the dedicated Template Publish / Version
  Boundary Gate;
- keeps the phase planning-only;
- no `measureVNextText(...)` replacement, full measurement production
  readiness claim, pagination mutation, production renderer-backed measurement
  binding, production PDF/DOCX renderer work, backend routes/storage/auth,
  production contenteditable, package/document schema change,
  collaboration/offline behavior, or legacy editor runtime copy is introduced.

## Phase 205: Template Publish / Version Boundary Gate

Goal:

- define the publish/version boundary for canonical FlowDoc template candidates
  before Variable Schema or Render API contracts attach to them.

Deliverables:

- `docs/TEMPLATE_PUBLISH_VERSION_BOUNDARY_GATE.md`;
- `fixtures/template-publish-version-boundary.v1.json`;
- `tests/templatePublishVersionBoundaryGate.test.ts`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- README, phase ledger, and roadmap updates;
- pointer guard test updates.

Acceptance:

- confirms Template Publish / Version Boundary was selected as the first
  implementation lane;
- keeps Variable Schema / Data Contract and Render API Contract deferred;
- separates mutable draft template identity from immutable published template
  version identity;
- defines JSON-safe published version metadata;
- defines immutability rules for accepted published version ids, source
  snapshot pointers, and accepted source package content;
- restricts publishable candidates to canonical package v2/document v3;
- defines publish validation evidence shape for package parse, graph
  diagnostics, key/data diagnostics, export-readiness, measurement status, and
  rejected publish blockers;
- defines source package/template snapshot retention pointer evidence without
  claiming production storage durability;
- defines rollback, deprecation, and superseding-version policy names;
- concludes a schema decision is not required before validation evidence
  because the boundary semantics can be represented as external JSON-safe
  metadata;
- no backend production route, production storage durability claim, renderer
  artifact bytes, auth/authz behavior, package/document schema change,
  Variable Schema / Data Contract implementation, Render API Contract
  implementation, `measureVNextText(...)` replacement, full measurement
  production readiness claim, pagination mutation, production renderer-backed
  measurement binding, production PDF/DOCX renderer work, production
  contenteditable, collaboration/offline behavior, or legacy editor runtime
  copy is introduced.

## Phase 206: Template Publish Validation Evidence Gate

Goal:

- produce JSON-safe publish validation evidence for a canonical FlowDoc package
  v2 / document v3 template candidate.

Deliverables:

- `docs/TEMPLATE_PUBLISH_VALIDATION_EVIDENCE_GATE.md`;
- `fixtures/template-publish-validation-evidence.v1.json`;
- `tests/templatePublishValidationEvidenceGate.test.ts`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- README, phase ledger, and roadmap updates;
- pointer guard test updates.

Acceptance:

- confirms the publish/version boundary is accepted;
- keeps draft template identity separate from published template version
  identity;
- keeps Variable Schema / Data Contract and Render API Contract deferred;
- uses canonical package v2/document v3 candidate
  `fixtures/product-report-vnext.flowdoc.json`;
- records JSON-safe package parse, graph diagnostics, key/data diagnostics,
  export-readiness, measurement, and rejected blocker summaries;
- attaches evidence to source snapshot and validation evidence retention
  pointers without claiming production storage durability;
- requires rejected publish attempts to carry explicit blockers and not mutate
  canonical package schema;
- no package/document schema mutation, backend production route, production
  storage durability claim, renderer artifact bytes, auth/authz behavior,
  Variable Schema / Data Contract implementation, Render API Contract
  implementation, `measureVNextText(...)` replacement, full measurement
  production readiness claim, pagination mutation, production renderer-backed
  measurement binding, production PDF/DOCX renderer work, production
  contenteditable, collaboration/offline behavior, or legacy editor runtime
  copy is introduced.

## Phase 207: Template Publish Accepted Version Metadata Gate

Goal:

- populate JSON-safe accepted version metadata for the validated canonical
  FlowDoc package v2 / document v3 template candidate.

Deliverables:

- `docs/TEMPLATE_PUBLISH_ACCEPTED_VERSION_METADATA_GATE.md`;
- `fixtures/template-publish-accepted-version-metadata.v1.json`;
- `tests/templatePublishAcceptedVersionMetadataGate.test.ts`;
- updated `docs/CURRENT_STATUS.md`;
- updated `docs/NEXT_PHASE_POINTER.md`;
- README, phase ledger, and roadmap updates;
- pointer guard test updates.

Acceptance:

- confirms Template Publish Validation Evidence Gate is accepted;
- confirms the validation candidate is canonical package v2/document v3;
- confirms package parse, graph diagnostics, key/data diagnostics,
  export-readiness, measurement, and rejected blocker statuses from validation
  evidence;
- populates required JSON-safe accepted metadata fields;
- keeps draft template identity separate from published template version
  identity;
- enforces immutable accepted `templateVersionId` and source snapshot pointer;
- preserves export-readiness warning visibility in accepted metadata;
- represents metadata without package/document schema changes;
- no package/document schema mutation, backend production route, production
  storage durability claim, renderer artifact bytes, auth/authz behavior,
  Variable Schema / Data Contract implementation, Render API Contract
  implementation, `measureVNextText(...)` replacement, full measurement
  production readiness claim, pagination mutation, production renderer-backed
  measurement binding, production PDF/DOCX renderer work, production
  contenteditable, collaboration/offline behavior, or legacy editor runtime
  copy is introduced.

## Later Phases

Goal:

- continue from the accepted phase sequence after the core contracts prove
  stable.

Possible later work:

- automatic budgeted render scheduling after the manual candidate gate proves
  stable;
- rich inline range mapping beyond the textarea draft boundary;
- durable caret and browser selection mapping;
- IME composition boundary;
- required rich text return list: inline style patching, style-preserving
  insert/delete/replace, rich selection toolbar state, atomic field chips inside
  mixed text, style-aware history grouping, and style-aware live-layout
  invalidation;
- concrete API route work;
- exact renderer adapters;
- repeat/collection materialization and form-slot schema/runtime;
- submission/reviewer workflow storage, routes, permissions, and runtime;
- key migration execution, aliases/deprecated keys, and key history stores;
- concrete session storage adapters and durable history stores;
- durable undo/redo replay and selection restoration;
- collaboration storage design.

## Current Next Recommended Phase

Current next step after Phase 207:

```text
Template Publish Close Audit
```

Reason:

- Phase 166 now defines the PASS/WARNING/BLOCKED/UNKNOWN threshold policy for
  hybrid input hardening;
- Phase 167 applies those thresholds to a narrow Windows Chromium/Edge plus
  English/Thai input matrix;
- Phase 168 now defines where the active island mounts, how the app shell
  refreshes packets, and how fallback/commit bridge routing stays guarded;
- Phase 169 now composes the first sandbox-local runtime slice and planned
  bridge request without applying package mutation;
- Phase 170 now covers paste/delete/field-chip input hardening over that
  runtime slice;
- Phase 171 now closes the guarded input lane as internal-alpha sandbox
  evidence while keeping production input claims blocked;
- the pre-Phase 172 risk / unknown register makes storage-coupling assumptions
  explicit before storage choices are accepted;
- Phase 172 now selects an external file-backed JSON record adapter as the
  first concrete internal-alpha storage path;
- Phase 173 now implements that adapter outside `@flowdoc/vnext-core` in
  `packages/storage-file-json`;
- Phase 174 now stores artifact bytes separately from record envelopes, with
  digest and manifest consistency checks;
- Phase 175 now runs the RC vertical slice through concrete record storage plus
  artifact byte storage and reloads the stored facts;
- Phase 176 now binds route-shaped helpers to concrete record storage without
  opening a concrete server route;
- Phase 177 now executes the artifact job slice from queued job through minimal
  PDF spike bytes, byte storage, and manifest/job status updates;
- Phase 178 now keeps the dependency-free PDF spike as internal-alpha evidence
  only and defers production renderer package selection;
- Phase 179 now allows renderer-backed measurement only as guarded
  internal-alpha evidence under profile, drift, digest, and parity gates;
- Phase 180 now runs one bounded internal-alpha vertical slice from open
  document through edit, save, reload, PDF spike generation, artifact storage,
  retrieval, and status report;
- Phase 181 now closes the internal-alpha evidence pass and consolidates
  current-state documentation so daily work has a compact source of truth;
- Phase 182 now ranks production hardening blockers and chooses measurement
  rollout / digest / parity / drift as the first hardening lane;
- Phase 183 now defines digest identity, native/WASM parity criteria, drift
  policy, required v1 evidence categories, and blockers before replacing
  `measureVNextText(...)`;
- Phase 184 now selects stable corpus/fixture ids, release-gating coverage,
  profile requirements, required summary facts, and missing-evidence states;
- Phase 185 now defines the JSON-safe measurement evidence summary manifest
  shape for digest, parity, drift, status, retention, and replacement blockers;
- Phase 186 now adds a JSON-safe stub summary manifest with release-gating
  rows unknown/missing, raw evidence excluded, and default-measurer replacement
  blocked;
- Phase 187 now ranks the missing evidence gaps, owners, and prerequisites and
  selects digest/runtime identity as the first blocker;
- Phase 188 now defines the package-local digest/runtime identity evidence
  builder, JSON-safe root handoff shape, pinned/pending/missing/stale digest
  policy, and raw-evidence retention pointer rules;
- Phase 189 now decides digest cannot be pinned because no package-local WASM
  artifact is present, then records a JSON-safe retained-pending population
  summary;
- Phase 190 now checks all recorded candidate paths, finds no package-local
  WASM artifact, defines `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`
  as the accepted future output path, and keeps digest pending;
- Phase 191 now defines the accepted package-local build command/output path
  but cannot produce the artifact because `wasm-pack` is unavailable,
  `wasm32-unknown-unknown` is not installed, and `rust-shaper` is still a
  binary native smoke crate without a WASM-ready export boundary;
- Phase 192 now accepts the `wasm-pack` path, defers direct Cargo plus
  `wasm-bindgen` as an alternate, adds a minimal `cdylib`/`rlib`
  `rust-shaper` library target and package-local `wasm:build` script metadata,
  keeps root checks independent of WASM tooling, and leaves artifact
  production blocked because `wasm-pack` and `wasm32-unknown-unknown` remain
  unavailable;
- Phase 193 now defines developer/CI bootstrap as the `wasm-pack` acquisition
  path, `rustup target add wasm32-unknown-unknown` as the target provisioning
  path, pending exact `wasm-pack` version policy, and package-local
  `wasm:check-toolchain` diagnostic metadata that exits zero with JSON-safe
  unavailable status;
- Phase 194 now runs the optional package-local readiness smoke, records exit
  code `0`, keeps `wasmPackAvailable=false`,
  `wasm32UnknownUnknownInstalled=false`, `toolchainReady=false`,
  `canProduceArtifactNow=false`, `artifactProduced=false`,
  `digestStatus="pending"`, and `sha256=null`;
- Phase 195 now reruns the package-local readiness smoke, does not run
  `wasm:build`, records `artifactProduced=false`, `artifactPointer=null`,
  `fileSizeBytes=null`, `digestStatus="pending"`, and `sha256=null`, and
  blocks Phase 196 Artifact Digest Pinning Execution until a real artifact
  exists;
- Phase 195A now selects developer/CI bootstrap as the provisioning strategy,
  adds package-local `wasm:bootstrap-plan`, records `rustc` and `cargo`
  version policy, keeps `wasm-pack` pending until installed, keeps
  `wasm32-unknown-unknown` missing, and keeps root checks independent;
- Phase 195B now attempts provisioning execution, installs
  `wasm32-unknown-unknown`, records `wasm-pack` installation failure because
  `wasm-pack v0.15.0` requires a dependency needing `rustc 1.91` while this
  environment reports `rustc 1.88.0`, and keeps root checks independent;
- Phase 195C now compares Rust upgrade, older pinned `wasm-pack`, pinned CI
  image, internal tool cache, and preinstalled developer toolchain strategies,
  selects Rust 1.91+ upgrade as the immediate strategy, selects pinned CI image
  as the longer-term reproducible strategy, and keeps root checks independent;
- Phase 195D now executes `rustup update stable`, captures `rustc 1.96.0` and
  `cargo 1.96.0`, verifies `wasm32-unknown-unknown` remains installed,
  installs `wasm-pack 0.15.0` after the Rust 1.91+ condition passes, and
  records package-local `toolchainReady=true`;
- Phase 195E now runs package-local `wasm:build` after readiness reports
  `toolchainReady=true`, records `failed-missing-wasm-bindgen-dependency`, and
  keeps the accepted artifact absent;
- Phase 195F now adds package-local `wasm-bindgen = "0.2"`, resolves
  `wasm-bindgen 0.2.126`, exports only readiness marker and boundary version
  through `#[wasm_bindgen]`, keeps native smoke intact, and passes package-local
  native plus WASM target cargo checks;
- Phase 195G now reruns package-local readiness, runs `wasm:build`, produces
  the accepted artifact at
  `packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm`, records
  generated JS/TypeScript/package metadata, keeps `digestStatus="pending"` and
  `sha256=null`, and leaves production measurement binding blocked;
- Phase 196 now confirms the accepted package-local artifact exists, computes
  sha256 from the real artifact file, validates artifact path, matrix id,
  corpus id, policy revision, measurement profile id, and output shape, then
  pins the package-local digest as
  `4667b7fe401eddf09133a8a22af11456ab018b2a32c668a031b8120a79db8a44`;
- Phase 197 now adds package-local JSON-safe native evidence summary metadata
  for `v1-measure-thai-line-break-core` and
  `v1-measure-latin-product-paragraphs`, attaches it to the pinned digest
  context, and keeps raw native output outside root docs/tests;
- Phase 198 now adds matching package-local JSON-safe WASM evidence summary
  metadata for the same fixture subset and pinned digest context, while keeping
  raw WASM output outside root docs/tests;
- Phase 199 now compares the native and WASM summary metadata for the same
  fixture subset, records matching digest/profile/fixture/scenario/fact
  coverage metadata, and keeps raw native/WASM output outside root docs/tests;
- Phase 200 now adds renderer-backed drift summary metadata for the same
  fixture subset and pinned digest context, while keeping raw renderer output
  outside root docs/tests;
- Phase 201 now accepts numeric width, height, and zero-line-count drift
  threshold policy for the same fixture subset and matching drift context;
- Phase 202 now populates accepted manifest entries for the same minimal
  fixture subset while keeping the full v1 matrix partial and production
  binding blocked;
- Phase 203 now confirms those accepted manifest entries, keeps the full v1
  matrix `partial-not-accepted`, decides the minimal subset is sufficient for a
  mini infrastructure checkpoint only, and recommends a Template Publish /
  Variable Schema / Render API planning gate next;
- Phase 204 now ranks the next non-measurement mini infrastructure lanes,
  selects Template Publish / Version Boundary first, defers Variable Schema
  and Render API until a stable published template/version target exists, and
  defines evidence required for the dedicated publish/version gate;
- Phase 205 now accepts the Template Publish / Version Boundary fixture,
  separates mutable draft identity from immutable published template version
  identity, defines JSON-safe version metadata, validation evidence shape,
  retention pointer evidence, and lifecycle policy names, and selects Template
  Publish Validation Evidence Gate next;
- Phase 206 now accepts JSON-safe publish validation evidence for
  `fixtures/product-report-vnext.flowdoc.json`, records package parse, graph,
  key/data, export-readiness, measurement, rejected blocker, and retention
  pointer summaries, and selects Template Publish Accepted Version Metadata
  Gate next;
- Phase 207 now populates JSON-safe accepted published version metadata,
  preserves validation evidence and export-readiness warning visibility, marks
  accepted version and source pointer facts immutable, and selects Template
  Publish Close Audit next;
- it keeps production contenteditable, full-document contenteditable,
  collaboration/offline, backend route, production PDF/DOCX renderer,
  package/document schema, and legacy editor runtime work out of scope.

## Historical Phase 206 Handoff

Current next step after Phase 206:

```text
Template Publish Accepted Version Metadata Gate
```

That was the Phase 206 handoff recommendation. Phase 207 is now complete,
so it is no longer the current next step after Phase 207.

## Historical Phase 205 Handoff

Current next step after Phase 205:

```text
Template Publish Validation Evidence Gate
```

That was the Phase 205 handoff recommendation. Phase 206 is now complete,
so it is no longer the current next step after Phase 206.

## Historical Phase 204 Handoff

Current next step after Phase 204:

```text
Template Publish / Version Boundary Gate
```

That was the Phase 204 handoff recommendation. Phase 205 is now complete,
so it is no longer the current next step after Phase 205.

## Historical Phase 203 Handoff

Current next step after Phase 203:

```text
Template Publish / Variable Schema / Render API Planning Gate
```

That was the Phase 203 handoff recommendation. Phase 204 is now complete,
so it is no longer the current next step after Phase 204.

## Historical Phase 202 Handoff

Current next step after Phase 202:

```text
Measurement Hardening Close Audit
```

That was the Phase 202 handoff recommendation. Phase 203 is now complete,
so it is no longer the current next step after Phase 203.

## Historical Phase 201 Handoff

Current next step after Phase 201:

```text
Accepted Summary Manifest Population
```

That was the Phase 201 handoff recommendation. Phase 202 is now complete,
so it is no longer the current next step after Phase 202.

## Historical Phase 200 Handoff

Current next step after Phase 200:

```text
Numeric Drift Threshold Decision
```

That was the Phase 200 handoff recommendation. Phase 201 is now complete,
so it is no longer the current next step after Phase 201.

## Historical Phase 199 Handoff

Current next step after Phase 199:

```text
Renderer-backed Drift Summary Gate
```

That was the Phase 199 handoff recommendation. Phase 200 is now complete,
so it is no longer the current next step after Phase 200.

## Historical Phase 198 Handoff

Current next step after Phase 198:

```text
Native/WASM Parity Summary Gate
```

That was the Phase 198 handoff recommendation. Phase 199 is now complete,
so it is no longer the current next step after Phase 199.

## Historical Phase 197 Handoff

Current next step after Phase 197:

```text
WASM Evidence Summary Gate
```

That was the Phase 197 handoff recommendation. Phase 198 is now complete,
so it is no longer the current next step after Phase 198.

## Historical Phase 196 Handoff

Current next step after Phase 196:

```text
Native Evidence Summary Gate
```

That was the Phase 196 handoff recommendation. Phase 197 is now complete,
so it is no longer the current next step after Phase 197.

## Historical Phase 195G Handoff

Current next step after Phase 195G:

```text
Artifact Digest Pinning Execution
```

That was the Phase 195G handoff recommendation. Phase 196 is now complete,
so it is no longer the current next step after Phase 196.

## Historical Phase 195F Handoff

Current next step after Phase 195F:

```text
Text Engine WASM Artifact Production Retry Gate
```

That was the Phase 195F handoff recommendation. Phase 195G is now complete,
so it is no longer the current next step after Phase 195G.

## Historical Phase 195E Handoff

Current next step after Phase 195E:

```text
Text Engine WASM Bindgen Export Dependency Gate
```

That was the Phase 195E handoff recommendation. Phase 195F is now complete,
so it is no longer the current next step after Phase 195F.

## Historical Phase 195D Handoff

Current next step after Phase 195D:

```text
Text Engine WASM Artifact Production Retry Gate
```

That was the Phase 195D handoff recommendation. Phase 195E is now complete,
so it is no longer the current next step after Phase 195E.

## Historical Phase 195C Handoff

Current next step after Phase 195C:

```text
Text Engine WASM Toolchain Rust Upgrade Execution Gate
```

That was the Phase 195C handoff recommendation. Phase 195D is now complete,
so it is no longer the current next step after Phase 195D.

## Historical Phase 195B Handoff

Current next step after Phase 195B:

```text
Text Engine WASM Toolchain Version Compatibility Gate
```

That was the Phase 195B handoff recommendation. Phase 195C is now complete,
so it is no longer the current next step after Phase 195C.

## Historical Phase 195A Handoff

Current next step after Phase 195A:

```text
Text Engine WASM Toolchain Provisioning Execution Gate
```

That was the Phase 195A handoff recommendation. Phase 195B is now complete,
so it is no longer the current next step after Phase 195B.

## Historical Phase 195 Handoff

Current next step after Phase 195:

```text
Text Engine WASM Toolchain Provisioning Bootstrap Gate
```

That was the Phase 195 handoff recommendation. Phase 195A is now complete, so
it is no longer the current next step after Phase 195A.

## Historical Phase 194 Handoff

Current next step after Phase 194:

```text
Phase 195: Text Engine WASM Artifact Production Gate
```

That was the Phase 194 handoff recommendation. Phase 195 is now complete, so
it is no longer the current next step after Phase 195.

## Historical Phase 193 Handoff

Current next step after Phase 193:

```text
Phase 194: Text Engine WASM Toolchain Optional Readiness Smoke
```

That was the Phase 193 handoff recommendation. Phase 194 is now complete, so
it is no longer the current next step after Phase 194.

## Historical Phase 192 Handoff

Current next step after Phase 192:

```text
Phase 193: Text Engine WASM Toolchain Acquisition Gate
```

That was the Phase 192 handoff recommendation. Phase 193 is now complete, so
it is no longer the current next step after Phase 193.

## Historical Phase 191 Handoff

Current next step after Phase 191:

```text
Phase 192: Text Engine WASM Build Toolchain Readiness Gate
```

That was the Phase 191 handoff recommendation. Phase 192 is now complete, so
it is no longer the current next step after Phase 193.

## Historical Phase 190 Handoff

Current next step after Phase 190:

```text
Phase 191: Text Engine WASM Artifact Build Output Gate
```

That was the Phase 190 handoff recommendation. Phase 191 is now complete, so
it is no longer the current next step after Phase 192.

## Historical Phase 189 Handoff

Current next step after Phase 189:

```text
Phase 190: Text Engine WASM Artifact Digest Pinning Gate
```

That was the Phase 189 handoff recommendation. Phase 190 is now complete, so
it is no longer the current next step after Phase 190.

## Historical Phase 188 Handoff

Current next step after Phase 188:

```text
Phase 189: Text Engine Runtime Identity Digest Evidence Population Gate
```

That was the Phase 188 handoff recommendation. Phase 189 is now complete, so
it is no longer the current next step after Phase 189.

## Historical Phase 187 Handoff

Current next step after Phase 187:

```text
Phase 188: Text Engine Runtime Identity Digest Evidence Builder Gate
```

That was the Phase 187 handoff recommendation. Phase 188 is now complete, so
it is no longer the current next step after Phase 188.

## Historical Phase 186 Handoff

Current next step after Phase 186:

```text
Phase 187: Measurement Evidence Coverage Gap Triage Gate
```

That was the Phase 186 handoff recommendation. Phase 187 is now complete, so
it is no longer the current next step after Phase 187.

## Historical Phase 185 Handoff

Current next step after Phase 185:

```text
Phase 186: Measurement Evidence Summary Manifest Fixture Stub Gate
```

That was the Phase 185 handoff recommendation. Phase 186 is now complete, so
it is no longer the current next step after Phase 186.

## Historical Phase 184 Handoff

Current next step after Phase 184:

```text
Phase 185: Measurement Evidence Summary Manifest Gate
```

That was the Phase 184 handoff recommendation. Phase 185 is now complete, so
it is no longer the current next step after Phase 185.

## Historical Phase 183 Handoff

Current next step after Phase 183:

```text
Phase 184: V1 Measurement Fixture Evidence Matrix Gate
```

That was the Phase 183 handoff recommendation. Phase 184 is now complete, so
it is no longer the current next step after Phase 184.

## Historical Phase 182 Handoff

Current next step after Phase 182:

```text
Phase 183: Measurement Digest Parity Drift Hardening Gate
```

That was the Phase 182 handoff recommendation. Phase 183 is now complete, so
it is no longer the current next step after Phase 183.

## Historical Phase 181 Handoff

Current next step after Phase 181:

```text
Phase 182: V1 Hardening Backlog Triage Gate
```

That was the Phase 181 handoff recommendation. Phase 182 is now complete, so
it is no longer the current next step after Phase 182.

## Historical Phase 180 Handoff

Current next step after Phase 180:

```text
Phase 181: Internal Alpha Close Audit And Documentation Consolidation Gate
```

That was the Phase 180 handoff recommendation. Phase 181 is now complete, so
it is no longer the current next step after Phase 181.

## Historical Phase 179 Handoff

Current next step after Phase 179:

```text
Phase 180: Internal Alpha Vertical Slice
```

That was the Phase 179 handoff recommendation. Phase 180 is now complete, so
it is no longer the current next step after Phase 180.

## Historical Phase 178 Handoff

Current next step after Phase 178:

```text
Phase 179: Measurement Rollout Gate
```

That was the Phase 178 handoff recommendation. Phase 179 is now complete, so
it is no longer the current next step after Phase 179.

## Historical Phase 177 Handoff

Current next step after Phase 177:

```text
Phase 178: PDF Renderer Decision Gate
```

That was the Phase 177 handoff recommendation. Phase 178 is now complete, so
it is no longer the current next step after Phase 178.

## Historical Phase 176 Handoff

Current next step after Phase 176:

```text
Phase 177: Artifact Job Execution Slice
```

That was the Phase 176 handoff recommendation. Phase 177 is now complete, so
it is no longer the current next step after Phase 177.

## Historical Phase 175 Handoff

Current next step after Phase 175:

```text
Phase 176: Backend Route Contract To Storage Binding
```

That was the Phase 175 handoff recommendation. Phase 176 is now complete, so
it is no longer the current next step after Phase 176.

## Historical Phase 174 Handoff

Current next step after Phase 174:

```text
Phase 175: Storage-backed RC Roundtrip Smoke
```

That was the Phase 174 handoff recommendation. Phase 175 is now complete, so
it is no longer the current next step after Phase 175.

## Historical Phase 173 Handoff

Current next step after Phase 173:

```text
Phase 174: Artifact Byte Store Slice
```

That was the Phase 173 handoff recommendation. Phase 174 is now complete, so
it is no longer the current next step after Phase 174.

## Historical Phase 172 Handoff

Current next step after Phase 172:

```text
Phase 173: External File-Backed Storage Adapter Slice
```

That was the Phase 172 handoff recommendation. Phase 173 is now complete, so
it is no longer the current next step after Phase 173.

## Historical Phase 18 First Implementation Recommendation

The Phase 18 reset originally recommended starting with Phase 19 or Phase 20.
That was the historical first implementation recommendation from the Phase 18
reset, not the current next step after Phase 172, Phase 173, or Phase 174.

Historical first phase:

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

Historical alternative first phase:

```text
Phase 20: Editable Authoring Session
```

Reason:

- it establishes the frontend runtime as first-class;
- it can be pure and testable;
- it prepares the path for granular text transactions.

## Explicit Non-Work

Do not start these without a separate accepted design:

- production contenteditable implementation;
- full-document contenteditable;
- collaboration/offline behavior;
- storage/backend route;
- PDF/DOCX renderer work;
- package/document schema change;
- legacy editor runtime copy;
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
