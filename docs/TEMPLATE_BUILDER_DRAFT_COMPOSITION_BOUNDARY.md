# Template Builder Draft Composition Boundary

Status: Phase 42 implementation boundary.

Phase 42 adds the first browser-local IME composition boundary for active
textarea drafts in the template-builder sandbox. It tracks composition events
and blocks draft commands, range controls, and commit while IME composition is
active.

## Purpose

IME input can produce intermediate text before the user commits the composed
characters. Draft commands must not treat those intermediate states as final
editor intent.

The active draft flow now has a guarded composition layer:

```text
textarea composition events
  -> browser-local draft composition state
  -> guarded range/command/commit controls
  -> compositionend
  -> ordinary draft command or commit flow
```

This is a foundation for Thai, Japanese, Chinese, and other IME workflows. It
does not yet implement language-specific acceptance behavior or per-keystroke
core transactions.

## Implemented State

The active browser draft owns:

- `isComposing`;
- `compositionData`;
- `compositionSource`;
- `compositionEventCount`.

Those fields are reset when the draft starts, cancels, or commits. They stay in
browser state and are not written to generated snapshots or canonical package
data.

## Event Boundary

The canvas textarea now listens for:

- `compositionstart`;
- `compositionupdate`;
- `compositionend`.

During composition, normal textarea `input` still updates the draft text and
selection, but the draft status becomes `composing` and command/commit controls
are guarded until `compositionend`.

## Guarded Actions

While `isComposing` is true:

- text insert is blocked;
- replace-selection is blocked;
- range start/end controls are disabled;
- cursor/select-all controls are disabled;
- draft commit is disabled and guarded in code.

After `compositionend`, the draft returns to ordinary editing state. If the
draft text is dirty, the existing commit path remains:

```text
POST /api/actions/replace-text?response=packet
```

## Visible State

Composition state is visible in:

- the canvas draft footer;
- the inspector draft panel;
- the status bar.

The label is intentionally small and operational because this phase is a guard
boundary, not a full IME UX pass.

## Acceptance Evidence

Phase 42 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- action lanes expose `browser.trackDraftComposition`;
- generated snapshot text does not contain composition draft fields;
- browser source owns composition event handlers and labels;
- draft commits still use the existing bridge packet path.

## Non-Goals

Phase 42 does not implement:

- language-specific IME behavior;
- rich DOM composition mapping;
- contenteditable editing;
- key/field chip insertion during composition;
- `inline.style.patch`;
- per-keystroke core transactions;
- durable composition persistence;
- collaboration cursors;
- live layout rendering during active typing.
