# Template Builder Draft Command Context Boundary

Status: Phase 39 implementation boundary.

Phase 39 derives a browser-local command context from the active WYSIWYG draft
selection. It answers where a future command would apply before the sandbox
actually executes insert, replace, key, or rich text commands.

## Purpose

The active draft flow now has a command map:

```text
active draft text
  -> local selection range
  -> command context
  -> readiness for future commands
```

This context is the bridge between selection tracking and later command
execution phases. It prevents future actions from guessing target/range details
directly from ad hoc DOM reads.

## Context Fields

The browser derives:

- command surface;
- target text-block id;
- base document revision;
- selection start/end/length;
- collapsed selection status;
- selection source and direction;
- selected text preview;
- before-selection preview;
- after-selection preview;
- readiness for future commands.

The previews are bounded UI summaries, not document payloads.

## Command Readiness

Phase 39 exposes readiness for:

- `text.insert`;
- `text.replaceSelection`;
- `inline.fieldRef.insert`;
- `inline.style.patch`.

`text.insert` is marked ready for active safe text drafts. `text.replaceSelection`
is ready only when the selection is not collapsed. Key insertion and rich style
patching remain planned because they require atomic inline draft support and
rich inline range mapping.

## Truth Boundary

Command context is browser-local state derived from draft text and textarea
selection. It is not stored in:

- generated sandbox snapshots;
- canonical vNext packages;
- mutation bridge working packages;
- authoring history records;
- live layout requests.

Commit still sends only draft text and target text-block id to:

```text
POST /api/actions/replace-text?response=packet
```

## Visible State

The sandbox shows command context in:

- the canvas draft footer;
- the inspector draft panel;
- the status bar.

Selection and command context updates refresh only draft-specific labels. They
do not re-render the full app, execute commands, or call the mutation bridge.

## Acceptance Evidence

Phase 39 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- generated snapshot text does not contain command-context preview fields;
- browser source owns command context derivation and readiness;
- core action lanes expose `browser.deriveDraftCommandContext`;
- WYSIWYG draft commits still use the existing bridge packet path.

## Non-Goals

Phase 39 does not implement:

- command execution from this context;
- replace-selection bridge routes;
- key/field insertion;
- rich text toolbar;
- `inline.style.patch`;
- contenteditable editing;
- DOM range mapping over rich inline nodes;
- IME composition lifecycle;
- per-keystroke core transactions;
- live layout rendering during active typing.
