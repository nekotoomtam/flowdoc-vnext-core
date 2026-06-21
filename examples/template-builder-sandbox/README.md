# Template Builder Sandbox

Status: Phase 27 extractable sandbox boundary.

This folder is a repo-shaped sandbox for the future FlowDoc template builder.
It exists under this repository only so the UI boundary can be developed beside
the core contracts while staying easy to move into a separate repository later.

## Run

```sh
npm run check
npm run dev
```

The dev server builds a snapshot from the local `@flowdoc/vnext-core` package
boundary and serves the static shell from `public/`.

## Boundary

- Depend on `@flowdoc/vnext-core`, currently through `file:../..`.
- Import only the public package entrypoint from sandbox source.
- Keep visible editor state in the sandbox, outside canonical packages.
- Generate browser-facing snapshots through the sandbox core boundary.
- Do not add sandbox runtime dependencies to the root core package.

When this sandbox moves to its own repository, replace `file:../..` with the
chosen git, registry, or workspace dependency for `@flowdoc/vnext-core`.

## Current Scope

Implemented:

- standalone package scripts;
- Node bridge that calls core through `@flowdoc/vnext-core`;
- generated browser snapshot from the canonical product fixture;
- static editor shell with toolbar, node tree, canvas, inspector, and status;
- browser-local WYSIWYG draft editing for safe text blocks, committed through
  the sandbox mutation bridge;
- browser-local draft selection range tracking while a draft is active;
- browser-local draft command context and readiness before command execution;
- bounded authoring history, undo/redo, and live-layout summaries after bridge
  commits;
- boundary tests from the root repository.

Not implemented:

- rich text editing;
- command execution from draft context;
- durable DOM selection mapping beyond active textarea drafts;
- live layout renderer;
- background job scheduler;
- backend API route;
- save/publish persistence.
