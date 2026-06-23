# Template Builder Draft IME Hardening Boundary

Status: Phase 80 implementation boundary.

Phase 80 centralizes the WYSIWYG draft IME guard into a small browser-safe
policy module. It keeps the existing draft composition behavior intact while
giving later rich-editing phases one bounded place to ask whether draft
commands, range controls, or commit should be blocked during composition.

This is a generic IME guard boundary. It is not a language-specific production
IME implementation.

## Purpose

The active draft flow now has an explicit guard layer:

```text
textarea composition events
  -> draft runtime composition state
  -> draft IME policy summary
  -> canvas / inspector / status visibility
  -> existing bridge commit after composition settles
```

The policy exists so later toolbar, rich inline style, field chip, and
history-ready phases can depend on one browser-local composition contract
instead of scattering `isComposing` checks through UI code.

## Module Ownership

`examples/template-builder-sandbox/public/draftImePolicy.js` owns:

- `DRAFT_IME_POLICY_SOURCE`;
- `DRAFT_IME_POLICY_MODE`;
- `createDraftImePolicy(...)`;
- `draftImePolicyLabel(...)`;
- idle, ready, composing, and settled status derivation;
- command, range-control, and commit guard booleans;
- composition source/event/data-preview facts;
- `languageProfile = "generic-ime"` unless a caller supplies a bounded label;
- explicit `exactGeneration.status = "deferred-until-commit"`.

The module is browser-safe and Node-testable. It does not read DOM nodes, call
`fetch`, run core text transactions, apply packets, append history, request
live layout, run exact layout, or serialize package data.

## App Shell Boundary

`examples/template-builder-sandbox/public/app.js` consumes the policy in:

- the canvas draft footer;
- the inspector draft panel;
- the status bar;
- draft command text disabled state;
- draft range input/action disabled state;
- draft commit guard messaging.

The app shell still owns DOM event binding, focus restoration, render updates,
bridge fetches, packet application, viewport coordination, and structural
coordination.

## Truth Boundary

The draft IME policy is browser-local:

- active draft text remains local until commit;
- canonical package state is unchanged;
- selection/composition facts are not serialized as package data;
- authoring history is unchanged until an accepted bridge commit;
- live layout and exact output are not run during composition;
- export readiness remains outside the active draft path.

Accepted bridge commits still produce the real dirty scope, history, packet,
and live-layout summary through the existing mutation bridge after composition
is no longer active.

## Acceptance Evidence

Phase 80 is covered by `tests/templateBuilderSandboxBoundary.test.ts`:

- the IME policy module exposes source/mode constants and pure helpers;
- idle/ready/composing/settled states produce bounded summaries;
- composing drafts block command, range, and commit affordances;
- settled composition re-enables those browser-local affordances;
- exact generation is explicitly deferred until commit;
- `app.js` imports the module and renders `data-draft-ime-policy`;
- action lanes expose the IME hardening boundary.

## Non-Goals

Phase 80 does not implement language-specific IME behavior, contenteditable DOM
mapping, rich inline range mapping, field/key chips, toolbar state, durable
selection persistence, per-keystroke core transactions, live layout rendering
during active typing, exact layout during active typing, renderer-backed
measurement, backend API routes, storage, collaboration, or package/document
schema changes.
