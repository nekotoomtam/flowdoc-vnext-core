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
