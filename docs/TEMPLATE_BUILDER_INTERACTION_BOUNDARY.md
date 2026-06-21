# Template Builder Interaction Boundary

Status: Phase 28 implementation boundary.

Phase 28 keeps the sandbox on a structure-first line. It does not add real
typing yet. The goal is to make node selection meaningful before mutating any
template content.

## Selection Ownership

Selection is browser runtime state owned by the sandbox shell:

```text
tree or canvas click
  -> browser-only selected node id
  -> tree highlight
  -> canvas highlight
  -> inspector context
  -> status bar
```

The selected node id, selection source, hover state, scroll position, and
inspector expansion state must not be written into package v2/document v3 or
the generated snapshot.

## Snapshot Ownership

The sandbox snapshot owns read-only relationship facts generated from
`@flowdoc/vnext-core`:

- node id and type;
- section and zone context;
- parent id and parent kind;
- node path/breadcrumb;
- direct children;
- operation surface;
- capabilities;
- field references;
- diagnostics and action state.

The browser shell may index these facts for rendering, but it must not treat
the DOM tree as document truth.

## Minimum Interaction Contract

- tree and canvas select the same node id;
- clicking nested canvas nodes selects the nearest clicked node, not an
  accidental ancestor;
- inspector shows selected node, parent, section, zone, path, children,
  capabilities, field refs, and action states;
- status bar shows selected node, selection source, surface, revisions, dirty
  scopes, diagnostics, exact layout, and artifact status;
- action states use `wired`, `planned`, and `blocked` without pretending that
  planned/blocked work is executable.

## Non-Goals

Phase 28 does not implement:

- text editing;
- DOM selection/caret mapping;
- IME lifecycle;
- live layout rendering;
- undo/redo execution;
- save/publish persistence;
- backend API routes;
- exact layout, preview, PDF, or DOCX rendering.

## Phase 29 Handoff

The next mutation phase should preserve this rule:

```text
browser action
  -> sandbox bridge
  -> @flowdoc/vnext-core transaction
  -> snapshot refresh
```

The browser must not patch authored document JSON directly.
