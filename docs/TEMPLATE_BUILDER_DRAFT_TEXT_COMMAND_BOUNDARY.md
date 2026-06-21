# Template Builder Draft Text Command Boundary

Status: Phase 40 implementation boundary.

Phase 40 executes the first browser-local text commands from the Phase 39 draft
command context. The command changes only the active textarea draft. It does
not mutate canonical package state, authoring history, live layout, or backend
state until the user commits the whole draft through the existing bridge packet
route.

## Purpose

The active draft flow is now:

```text
active draft text
  -> local selection range
  -> command context
  -> browser-local text command
  -> existing draft commit
  -> mutation bridge packet
```

This gives the frontend a command surface before rich inline, key insertion,
or durable DOM selection work exists.

## Implemented Commands

Phase 40 wires:

- `text.insert` through `data-draft-command-action="insert-text"`;
- `text.replaceSelection` through
  `data-draft-command-action="replace-selection"`.

Both commands use the derived command context target and range. Insert replaces
the active range when a range is selected, matching normal editor typing
behavior. Replace-selection is guarded until the draft selection is non-empty.

The command text lives in browser state as `draftCommandText`. Empty command
text is blocked. Whitespace is preserved once supplied, because the draft layer
must behave like a text editor rather than a form normalizer.

## Truth Boundary

Draft text commands are browser-local:

- no new bridge route is added;
- no fetch is called by command execution;
- no generated sandbox snapshot stores command text;
- no authoring history record is created until draft commit;
- no live-layout request is created until draft commit;
- no canonical vNext package field stores command text or command context.

Commit still sends the entire draft text and target text-block id to:

```text
POST /api/actions/replace-text?response=packet
```

## Visible State

The inspector draft panel exposes:

- command text input;
- Insert text;
- Replace selection.

The canvas draft editor, inspector labels, and status bar continue to show draft
status, selection, and command readiness. Applying a command updates the
textarea value, collapses the selection after the inserted command text, marks
the draft dirty, and leaves persistence to the normal Commit button.

## Acceptance Evidence

Phase 40 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- action lanes expose `browser.applyDraftTextCommand`;
- generated snapshot text does not contain `draftCommandText`;
- browser source owns the draft command input, command buttons, and
  `applyDraftTextCommand`;
- WYSIWYG draft commits still use the existing bridge packet path.

## Non-Goals

Phase 40 does not implement:

- key/field insertion;
- rich text toolbar commands;
- `inline.style.patch`;
- style-preserving mixed inline edits;
- contenteditable editing;
- DOM range mapping over rich inline nodes;
- IME composition lifecycle;
- per-keystroke core transactions;
- a replace-selection bridge route separate from draft commit;
- live layout rendering during active typing.
