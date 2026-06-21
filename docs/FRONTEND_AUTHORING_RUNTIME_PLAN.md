# Frontend Authoring Runtime Plan

Status: draft architecture reset.

The frontend authoring runtime is the browser-side editing engine for building
and editing templates. It is not a backend generation engine, and it must not
make exact export pagination a prerequisite for active typing.

## Goal

Provide a smooth, large-document-safe authoring experience for:

- typing and deleting text;
- IME composition;
- selection and caret state;
- node insertion, movement, duplication, and deletion;
- field/key placement;
- local undo and redo by user intent;
- live validation and diagnostics;
- viewport-first preview and layout;
- save/checkpoint back to canonical package.

## Session Shape

```text
Template package
  -> create editable session
       working document
       graph/index cache
       key registry index
       selection state
       text draft/composition state
       transaction log
       history groups
       dirty scopes
       live layout cache
       viewport state
```

The editable session is the live authoring truth while a user is editing. The
canonical package remains the durable save/publish truth.

Phase 20 implements the first pure session boundary in
`src/authoring/editableSession.ts`. It creates a canonical-package-backed
session with graph/key diagnostics, revision counters, empty dirty scopes, and
session-only selection state. It does not implement visible editor UI, text
transactions, undo, IME handling, or live layout yet.

## Owned State

The frontend runtime may own:

- working document snapshot;
- active selection;
- active text position/range;
- IME composition state;
- local draft text buffers;
- pending transactions;
- undo/redo groups;
- dirty node and dirty range metadata;
- live layout cache;
- viewport window and visible page metadata;
- transient drag/drop/resize preview state.

It must not persist these into `DocumentNode`:

- selection;
- caret geometry;
- hover;
- drag/drop preview;
- active textarea/input values;
- live layout pages;
- measured fragment caches;
- API status;
- generated artifacts.

## Editing Pipeline

```text
Input event
  -> classify intent
  -> update local draft immediately
  -> emit transaction or draft operation
  -> update working document when safe
  -> mark graph/layout dirty scope
  -> update visible layout/cache
  -> group history by user intent
  -> schedule background exact/settled checks as needed
```

Typing feedback must happen before full graph validation or exact pagination.
Validation and layout may catch up, but they must not overwrite a newer local
draft.

## Text Input And IME

IME composition is first-class:

- composition start/update/commit are local authoring events;
- composition updates must not create durable document history entries;
- commit produces one text transaction where possible;
- selection/caret state during composition is editor-only;
- exact pagination waits until commit or a safe idle checkpoint.

The runtime must support Thai text input without forcing every key event
through full document pagination.

## Node Composition

The runtime should expose palette/drop operations over shared core contracts:

- insert node into valid parent;
- move node within valid containment;
- duplicate node/subtree;
- delete node/subtree;
- patch node props;
- insert field reference into text;
- insert table row/column through table-aware commands;
- resize columns through layout-aware commands.

Visual drop targets must map to typed operation targets. Reducers or UI
components must not infer a different target at commit time.

## History

History groups are user-intent based:

- one typing session becomes one undo entry;
- one node insertion becomes one undo entry;
- one drag/drop commit becomes one undo entry;
- selection-only movement does not create document history;
- IME composition updates do not flood history;
- undo restores document plus the display state needed for stable visual
  restoration.

The durable history record format should remain shared-core-friendly, but the
browser runtime may keep extra local metadata for restoration and focus.

## Live Layout

The authoring runtime consumes live layout, not exact generation layout, while
the user is actively editing.

Live layout should:

- be dirty-scope based;
- be viewport-first;
- support partial/visible page rendering;
- never claim export readiness by default;
- settle to exact layout when required for preview/export checks.

## Save And Checkpoint

Save writes canonical package state, not session state.

```text
editable session
  -> flush committed transactions
  -> assert canonical package
  -> serialize package v2/document v3
```

Draft text should be flushed or explicitly rejected before save. Editor-only
state remains outside the package.

## Non-Goals

- No React component design in this contract.
- No DOM/canvas implementation in shared core.
- No exact PDF/DOCX rendering in the frontend runtime.
- No key history implementation in this first authoring slice.
- No collaborative editing model yet.
