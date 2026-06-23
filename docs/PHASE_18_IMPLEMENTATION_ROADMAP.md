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
