# Template Builder WYSIWYG Draft Design Lock

Status: Phase 36 design lock.

Phase 36 locks the direction for WYSIWYG text editing before implementation.
The goal is to prevent the sandbox from becoming a form editor, an inspector
textbox, or a visually plausible but structurally weak middle ground.

## Editor Goal

The visible editor direction is a WYSIWYG document editor. Users should edit
text on the document canvas, in document context, with future paths to rich
text, inline fields, caret restoration, IME, live layout, and exact export.

The first implementation may be deliberately narrow, but it must preserve this
direction.

## Truth Layers

The runtime must keep these layers separate:

- browser draft: immediate local editing feedback;
- browser cache: derived view model plus packet-applied node summaries;
- mutation bridge working package: in-memory sandbox package truth;
- canonical package: durable save/publish truth.

Browser draft state is not canonical document truth. Canonical document changes
must still pass through the mutation bridge and vNext core transaction path.

## Visible Editing Model

Editing should happen on the canvas text block itself, not only through an
inspector field. The draft should appear where the authored text appears.

Minimum WYSIWYG draft behavior:

- click or otherwise activate an eligible text block on the canvas;
- show an editable draft in that document position;
- keep typing feedback local and immediate;
- commit the draft through the existing bridge;
- apply the resulting packet through the browser cache path;
- update history, undo/redo availability, dirty scope count, and live-layout
  summary only after commit.

## Text Block Content Contract

A `text-block` is authored inline content, not a plain string. Existing inline
children include:

- `text`;
- `field-ref`;
- `page-number`;
- `line-break`;
- styled text runs.

The WYSIWYG draft implementation must not flatten mixed inline content into a
plain string and silently lose fields, line breaks, page numbers, or styles.

## Editable Eligibility

The first WYSIWYG draft phase may edit only safe text blocks.

Eligible:

- plain text blocks whose projection is fully editable;
- blocks that can round-trip through the current text transaction path without
  losing inline nodes or style data.

Guarded:

- field refs;
- page numbers;
- line breaks;
- mixed inline content that cannot yet be safely round-tripped;
- styled runs when the current draft path would flatten or discard style.

Guarded blocks should explain why editing is unavailable. They should not be
silently converted.

## Draft Lifecycle

The browser draft lifecycle is:

```text
idle
  -> editing-draft
  -> dirty-draft
  -> committing
  -> committed | rejected | cancelled | conflicted
```

Draft state should include the target text block id, base document revision,
draft text, dirty flag, and last error/conflict status.

## Commit Policy

Do not send every keypress through core, packet application, live layout, or
exact layout. Active typing should stay local until a deliberate commit point.

Allowed commit triggers for early phases:

- explicit apply/commit action;
- blur when the policy is clear and recoverable;
- keyboard shortcut later, after keyboard handling is designed.

Commit must call the existing sandbox mutation bridge. The browser must not
mutate canonical document structures directly.

## Conflict Policy

If the browser draft base revision differs from the current document revision,
the runtime must not overwrite silently.

Minimum conflict behavior:

- preserve draft text;
- mark the draft as conflicted;
- require refresh, cancel, or a deliberate retry policy before commit;
- avoid applying stale packets over newer local state.

## History, Undo, And Redo

Draft edits are not durable history.

History records, undo patches, redo patches, and authoring history summaries
are created only after a commit succeeds through the core transaction path.
Cancelled drafts must not create document history.

## Live Layout Policy

The draft may update what the user sees locally, but Phase 36 does not make
draft text a live layout request. Live-layout summaries are created after a
committed transaction produces dirty scopes.

Do not run exact layout, PDF/DOCX rendering, or export readiness during active
typing.

## Rich Text Return List

Rich text is a required return item, not optional polish.

The WYSIWYG draft phase may start with plain-text-safe editing, but the system
must return to:

- `inline.style.patch`;
- style-preserving text insert, delete, replace, split, merge, and paste;
- toolbar/application state for bold, italic, underline, strikethrough, text
  color, font family, and font size;
- mixed inline selection over styled text runs;
- atomic field chips inside rich text;
- history grouping for style-only and mixed text/style edits;
- style-aware live-layout invalidation;
- exact export parity for authored inline styles.

## Minimum UI Contract

The visible shell should expose:

- current edit state;
- target text block id;
- dirty draft status;
- commit availability;
- cancel availability;
- guarded reason when a block is not editable;
- conflict/rejection status.

These states can be plain and functional first. They do not need visual polish
in the design-lock phase.

## Acceptance Guardrails

Future implementation must prove:

- browser drafts do not mutate canonical document truth directly;
- mixed/atomic/rich text blocks are guarded instead of flattened;
- committed drafts flow through mutation bridge packets;
- history, undo/redo, and live-layout summaries update after commit;
- rejected commits preserve the draft and do not lose user text;
- revision conflicts cannot silently overwrite newer state;
- exact layout and artifact rendering stay out of active typing.

## Non-Goals

This design lock does not implement:

- WYSIWYG draft editing code;
- rich text toolbar;
- inline style patch commands;
- full DOM caret mapping;
- IME lifecycle;
- multi-range selection;
- exact WYSIWYG pagination;
- live layout renderer;
- save/publish persistence;
- backend API routes outside the sandbox dev server.
