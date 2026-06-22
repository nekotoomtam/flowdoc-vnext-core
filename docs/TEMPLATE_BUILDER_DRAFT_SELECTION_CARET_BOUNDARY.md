# Template Builder Draft Selection Caret Boundary

Status: Phase 41 implementation boundary.

Phase 41 hardens active draft selection and caret handling inside the
template-builder sandbox. It adds browser-local range controls so a user can set
the draft cursor or select the full draft without relying only on textarea
keyboard or mouse selection events.

## Purpose

The draft text command flow now has a stable selection control path:

```text
active draft text
  -> textarea selection events
  -> inspector range controls
  -> browser-local command context
  -> browser-local text command
  -> existing draft commit
```

This is not full rich DOM range mapping. It is a practical hardening step for
plain textarea drafts so `text.replaceSelection` can be exercised reliably
before rich text, inline fields, or IME lifecycle work.

## Implemented Controls

The inspector draft panel now owns:

- selection start input;
- selection end input;
- Cursor start;
- Cursor end;
- Select all.

Those controls call `setDraftSelectionRange(...)`, clamp offsets to the active
draft text length, update the textarea selection when the editor exists, and
keep selection state in the browser draft layer.

## Command Interaction

Draft text commands now consume the hardened selection state:

- collapsed selection keeps `text.insert` ready and
  `text.replaceSelection` guarded;
- non-collapsed selection marks `text.replaceSelection` ready;
- applying a text command collapses the draft selection after inserted text and
  focuses the draft editor for continued typing.

The command path still does not fetch, mutate canonical package state, append
history, or request live layout until the draft is committed.

## Truth Boundary

Selection/caret state remains browser-local:

- no generated sandbox snapshot stores selection control values;
- no canonical vNext package stores selection control values;
- no authoring history record is created by selection-only changes;
- no live-layout request is created by selection-only changes;
- no new bridge route is added for selection or replace-selection.

Commit still sends the full draft text through:

```text
POST /api/actions/replace-text?response=packet
```

## Acceptance Evidence

Phase 41 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- action lanes expose `browser.setDraftSelectionRange`;
- browser source owns `setDraftSelectionRange`,
  `applyDraftSelectionAction`, and `updateDraftSelectionControl`;
- range controls are present as browser-local `data-draft-selection-*`
  attributes;
- draft text commands still commit through the existing bridge packet path.

Browser smoke additionally verifies Select all enables Replace selection and
replace-selection updates only the active draft before commit.

## Non-Goals

Phase 41 does not implement:

- rich DOM range mapping;
- contenteditable editing;
- multi-range selection;
- key/field chip insertion;
- `inline.style.patch`;
- style-preserving mixed inline edits;
- IME composition lifecycle;
- per-keystroke core transactions;
- durable selection persistence;
- collaboration cursors;
- live layout rendering during active typing.
