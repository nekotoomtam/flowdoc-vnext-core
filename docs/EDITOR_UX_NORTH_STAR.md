# Editor UX North Star

Status: Phase 43 design boundary.

## Why This Exists

FlowDoc vNext must not become only a document API, export engine, or preview
artifact generator.

The primary product surface is a browser-based document editor where users feel
that they are editing the document directly in the web app. Core correctness,
pagination, operations, renderer artifacts, API generation, PDF, and DOCX all
matter, but they must serve that editing experience instead of replacing it.

This document exists because prior planning over-weighted core/export truth and
under-weighted live browser editing UX. Phase 43 also locks the large-document
runtime shape: recursive tree snapshots may help boot or debug the sandbox, but
they must not become the active editor runtime architecture.

## North Star

FlowDoc is a structured web document editor.

The user should feel:

- typing happens in the page, not in a detached form;
- caret, selection, and composition feel native enough for real editing;
- layout updates are stable and understandable while editing;
- long documents remain responsive;
- preview/export match the same layout truth used by the editor;
- structure exists to keep documents reliable, not to make editing feel remote.

## Minimum WYSIWYG Contract

The first usable editor does not need full polish, rich text parity, or final
pagination fidelity. It does need a minimum contract that prevents another
prototype-shaped dead end:

- the user edits at the document position, not only in an inspector form;
- active text input stays browser-local until commit or a safe transaction
  boundary;
- caret, selection, and IME composition remain editor-owned state;
- committed edits flow through vNext operations or text transactions;
- visible state can update from bounded change packets;
- long-document selection, lookup, and scrolling do not walk the whole
  document tree for every interaction.

This contract is a floor, not a final UX claim.

## Truth Model

FlowDoc has different kinds of truth. They must not be collapsed into one
object, and they must not fight each other.

| Layer | Truth Type | Owns | Must Not Own |
|---|---|---|---|
| Core document | authored truth | canonical nodes, fields, operations, history-ready changes | browser caret or IME state |
| Core layout | layout truth | measured fragments, page breaks, line ranges, renderer commands | DOM reflow or renderer guesses |
| Browser editing runtime | live interaction truth | caret, selection, edit buffer, IME composition, optimistic typing overlay | persisted document state or final page layout |
| Renderer/view | visual projection | drawing pages/fragments/overlays from contracts | rewrap, relayout, or invent page breaks |
| Export/API | output consumers | PDF/DOCX/API artifacts from core contracts | becoming the product's only design center |

The browser editing runtime may keep temporary state so typing feels immediate.
That state is allowed and required for UX, but it is not the persisted document
truth.

## Normalized Editor View Constraint

The active editor runtime must be normalized and lookup-first.

Canonical authored documents may keep parent-owned ordered ids such as
`childIds`, `columnIds`, `rowIds`, and `cellIds`. Those arrays are document
semantics: they say which parent owns which ordered children. They should not
be replaced by a single generic edge table in persisted package truth.

The browser editor view, however, must not depend on a recursive `children`
tree as its main working shape. It should derive lightweight indexes such as:

- `nodeById` for direct node lookup;
- `parentById` for upward navigation and commit targets;
- `childrenById` for ordered child traversal;
- `sectionById` and `zoneById` for scoped rendering;
- `visibleNodeIds` or visible page ranges for viewport work;
- `nodeOrder` or flattened structural ranges for keyboard navigation;
- `dirtyNodeIds` and `changedSubtreeIds` for packet application.

The editor should first find the target quickly, then load or derive heavier
facts only for the selected node, visible range, dirty scope, or requested
inspector panel.

Heavy facts include:

- full inline children for rich text editing;
- measured line fragments and geometry;
- diagnostics and readiness details;
- table row/cell layout facts;
- history group details;
- live-layout request results;
- export or exact-generation metadata.

Booting from a full sandbox snapshot is acceptable while the sandbox is small.
It is not acceptable as the long-term active runtime for large documents.

## Snapshot And Packet Rule

The runtime may use different shapes for different jobs:

| Shape | Use | Limit |
|---|---|---|
| Canonical package | persisted authored truth | no browser caret, IME, or viewport state |
| Full tree snapshot | boot, debug, early sandbox rendering | not the per-interaction runtime shape |
| Normalized editor view | selection, hit-test, inspector, viewport rendering | derived, not canonical truth |
| Change packet | accepted or rejected mutation updates | bounded to changed ids and summaries |
| Heavy detail fetch/derive | selected node, visible range, or dirty scope | lazy, scoped, revision-checked |

Any phase that makes the browser re-walk a full recursive tree during active
typing, selection, or scroll should be rejected or split before implementation.

## Non-Negotiables

- The web editor is a first-class product surface.
- Core layout truth must serve live editing, not only batch export.
- Frontend must not implement a second layout engine.
- Frontend may implement a dedicated interaction runtime.
- Renderer adapters draw from measured fragments/render commands.
- Browser typing may use optimistic overlays, but committed state flows through
  operations.
- IME/composition, especially Thai input, must be designed explicitly.
- Selection and hit-testing must be contract-level concepts, not incidental UI
  behavior.
- Long-document editing must be an acceptance target, not a later polish item.
- Normalized/lazy editor view is a required runtime constraint, not a late
  optimization.
- API/export are important consumers, but they do not replace editor UX.

## Browser Editing Runtime Responsibilities

The browser editing runtime should own:

- edit buffer during active typing;
- IME composition lifecycle;
- caret and selection model;
- hit-testing from rendered fragment/line position back to authored node offset;
- optimistic visual overlay while waiting for core commit/layout;
- operation commit scheduling;
- layout patch reconciliation;
- scroll anchoring and cursor stability;
- transient error/retry behavior when a commit is rejected;
- normalized view indexes for fast node lookup, parent lookup, visible ranges,
  and dirty packet application.

It must not own:

- persisted document mutation outside core operations;
- page-break decisions;
- text wrap truth;
- table row/cell layout truth;
- export-only layout rules;
- compatibility with old/prototype document shapes;
- recursive tree snapshots as the active runtime source for every interaction.

## Core Responsibilities For Editor UX

Core must expose enough contract surface for the browser editor to feel real:

- operation APIs that support small typing edits;
- invalidation scopes suitable for partial layout work;
- measured fragments with stable ids and authored node references;
- line ranges and geometry suitable for caret/hit-test mapping;
- layout patch artifacts that can update a bounded page range;
- graph and relationship facts that can populate normalized editor indexes;
- diagnostics that distinguish blocked layout from recoverable warnings;
- deterministic behavior across preview/export consumers.

Core work should be rejected or revised if it makes the web editor harder to
build, even when it improves export-only behavior.

## Renderer Rule

The frontend renderer is not a layout engine.

It can:

- draw pages;
- draw text lines from measured fragments;
- draw boxes, tables, cells, dividers, spacers, and generated content;
- draw selection/caret/edit overlays;
- map pointer coordinates to fragment and line metadata;
- request operations and layout refreshes.

It cannot:

- rewrap text as source of truth;
- decide page breaks;
- infer table row heights independently;
- mutate authored nodes directly;
- treat DOM layout as canonical document layout.

## Phase Gate For Future Work

Every future phase must answer these questions before implementation:

1. How does this preserve or improve browser editing UX?
2. Does this introduce a second layout truth?
3. What is the frontend interaction impact?
4. What happens while the user is typing?
5. How are caret, selection, hit-test, and IME affected?
6. Can long documents update in bounded work instead of all-at-once work?
7. Does the active browser path use normalized/lazy lookup instead of walking
   a full recursive tree snapshot?
8. What tests or contracts prove the answer?

If these cannot be answered, the phase is not ready.

## Immediate Next Design Target

Before deeper wrap upgrades, design the Browser Editing Runtime Contract and
Normalized Editor View Boundary:

- normalized view indexes and visible range shape;
- lazy heavy-detail access for selected or visible nodes;
- edit buffer contract;
- selection/caret position model;
- hit-test result model;
- operation commit loop;
- optimistic overlay and reconciliation;
- layout patch payload;
- IME/composition rules;
- long-document update budget.

After that contract exists, text-block line-slice extraction and wrap quality
work can continue with the editor UX target in view.

## Drift Warning

If planning starts to describe FlowDoc mainly as:

- an API generator;
- a PDF/DOCX exporter;
- a static preview renderer;
- a core-only document processor;
- a renderer artifact pipeline without live editing;

then the plan has drifted from the product north star and must be corrected
before implementation continues.
