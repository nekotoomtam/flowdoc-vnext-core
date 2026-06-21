# Template Builder Draft Selection Boundary

Status: Phase 38 implementation boundary.

Phase 38 adds the first browser-local selection boundary for active WYSIWYG text
drafts in the template-builder sandbox. It tracks where the user's textarea
selection is during a draft without promoting that selection to canonical
document truth.

Phase 39 derives command context from this selection in
`docs/TEMPLATE_BUILDER_DRAFT_COMMAND_CONTEXT_BOUNDARY.md`.

## Purpose

The draft flow now has a local range signal:

```text
start draft
  -> focus textarea
  -> track selectionStart / selectionEnd / selectionDirection
  -> show range in canvas, inspector, and status
  -> keep range local until commit or cancel
```

This gives future rich text toolbar and inline command work a stable place to
read the active draft range. It avoids forcing those future phases to infer
selection from unrelated DOM state.

## Local Draft Selection State

The browser draft owns these selection fields:

- `selectionStart`;
- `selectionEnd`;
- `selectionDirection`;
- `selectionSource`.

The fields are stored only in `examples/template-builder-sandbox/public/app.js`
state. They are not written into the generated sandbox snapshot, the vNext
package, the mutation bridge working package, or history records.

## Interaction Contract

The draft selection updates on textarea events:

- `focus`;
- `click`;
- `mouseup`;
- `keyup`;
- `select`;
- `input`.

Selection updates refresh only draft-specific DOM labels. They do not re-render
the full app, do not call the mutation bridge, and do not request live layout.

## Visible State

The selection range is visible in:

- the canvas draft footer;
- the inspector draft panel;
- the status bar.

Collapsed selections display as a cursor offset. Non-collapsed selections
display their start/end range and selected length.

## Commit Rules

Commit still sends only the draft text and target text-block id through:

```text
POST /api/actions/replace-text?response=packet
```

The selection range is not sent to core in Phase 38. Successful commits still
clear browser draft state after the returned packet applies through the browser
cache path.

Rejected commits preserve the draft text and selection fields.

## Acceptance Evidence

Phase 38 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- snapshot text does not contain browser draft selection fields;
- browser source owns `selectionStart`, `selectionEnd`, selection labels, and
  selection update handlers;
- core action lanes expose `browser.trackDraftSelection` as a browser-local
  capability;
- WYSIWYG draft commits still use the existing bridge packet path.

## Non-Goals

Phase 38 does not implement:

- DOM range mapping over rich inline nodes;
- contenteditable editing;
- IME composition lifecycle;
- toolbar commands;
- `inline.style.patch`;
- style-preserving mixed inline edits;
- persistent selection records;
- collaboration cursors;
- per-keystroke core transactions;
- live layout rendering during active typing.
