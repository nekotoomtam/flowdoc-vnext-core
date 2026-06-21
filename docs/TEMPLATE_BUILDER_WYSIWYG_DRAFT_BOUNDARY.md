# Template Builder WYSIWYG Draft Boundary

Status: Phase 37 implementation boundary.

Phase 37 implements the first visible WYSIWYG text draft path inside the
extractable template-builder sandbox. The goal is a usable document-position
draft surface without making browser-local text the canonical document truth.

## Purpose

The sandbox now supports this early editing flow:

```text
select eligible text-block
  -> start browser-local draft on the canvas
  -> type with immediate local feedback
  -> commit through sandbox.replacePlainTextBlock
  -> apply returned change packet through browser runtime cache
  -> update history, undo/redo availability, dirty scopes, and live-layout
     summary after commit
```

The draft appears in the canvas text-block position. The inspector exposes the
same draft state and commit/cancel controls, but the inspector is not the
editing surface.

## Truth Layers

The browser draft layer owns only:

- active draft target id;
- base document revision;
- original text;
- current draft text;
- dirty/status/message state.

It does not own canonical package state. Canonical document mutation still runs
through the sandbox mutation bridge and the vNext text transaction path.

The browser runtime cache remains a derived view model. It applies the returned
packet after a commit succeeds or rejects. It does not mutate
`snapshot.document`, because the sandbox snapshot does not expose canonical
document structures to the browser.

## Snapshot Facts

Template-builder snapshot nodes now expose draft-specific facts:

- `plainText`: full projected text for safe plain-text blocks;
- `canUseWysiwygDraft`: true only when the block can be edited without losing
  inline content;
- `hasAtomicInline`: true for field refs, page numbers, or line breaks;
- `hasStyledText`: true when text runs carry inline style data;
- `wysiwygDraftGuardReason`: the user-facing reason a block is guarded.

`textPreview` remains a bounded display preview. Draft editing uses `plainText`
so long text is not accidentally truncated before commit.

## Eligibility

Phase 37 can start a draft only for safe text blocks:

- node type is `text-block`;
- projection has at least one character;
- every projected segment is editable text;
- the block has no styled text runs.

Guarded blocks are preserved as authored inline content. The browser must not
flatten field refs, page numbers, line breaks, or styled text runs into one
plain string.

## Draft Lifecycle

Implemented statuses:

- `idle`;
- `editing`;
- `dirty`;
- `committing`;
- `committed`;
- `cancelled`;
- `blocked`;
- `rejected`;
- `conflicted`.

Typing updates the local draft state and draft controls without re-rendering
the full app on each input event. Full render is used for starting, committing,
cancelling, packet application, and conflict/rejection states.

## Commit And Conflict Rules

Commit calls:

```text
POST /api/actions/replace-text?response=packet
```

with the draft text and target text-block id.

Before commit, the browser compares the draft base revision with the current
snapshot revision. If they differ, the draft is preserved and marked
`conflicted`.

Rejected commits preserve the draft text and show the bridge issue. Successful
commits clear the draft, keep the target selected, and apply the packet through
the existing `applyChangePacket(...)` browser cache path.

## Interaction Rules

While a browser draft is active:

- direct mutation bridge buttons are disabled;
- undo/redo buttons are disabled;
- starting another draft is blocked until commit or cancel;
- active typing does not create history records;
- live-layout summaries update only after a successful bridge commit.

## Acceptance Evidence

Phase 37 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- snapshot facts prove safe blocks expose full `plainText`;
- atomic inline blocks expose guarded draft facts;
- browser source contains draft lifecycle, commit, and conflict checks;
- draft commits use the existing bridge route and packet application path;
- browser source still does not mutate canonical snapshot document structures.

## Non-Goals

Phase 37 does not implement:

- rich text toolbar;
- `inline.style.patch`;
- style-preserving mixed inline edit operations;
- DOM caret mapping;
- IME lifecycle;
- multi-range selection;
- per-keystroke core transactions;
- live layout rendering during active typing;
- exact WYSIWYG pagination;
- save/publish persistence;
- backend API routes outside the sandbox dev server.
