# Template Builder Structural Runtime Close Audit

Status: Phase 77 close audit.

Phase 77 reviews the Structural Runtime line after Phases 69-76. It does not
add runtime behavior. It records what is now reliable enough to build on, what
is still intentionally sandbox-only or foundation-only, and which risks should
be carried into later Phase Cards.

## Scope Reviewed

Reviewed phases:

- Phase 69: structural projection;
- Phase 70: structural packet contract;
- Phase 71: browser runtime-store structural packet apply;
- Phase 72: sandbox structural mutation bridge;
- Phase 73: bounded inspector structural command UI;
- Phase 74: structural outline jump;
- Phase 75: structural diagnostics navigation;
- Phase 76: structural command policy extraction.

## PASS

- Structural projection is a read-only working view over canonical document and
  relationship graph facts, not a persisted schema.
- Structural packet v1 exists as a foundation bridge from accepted core
  operations to browser runtime-store apply.
- Browser runtime-store structural packet apply updates lookup indexes without
  mutating the tree-shaped boot snapshot.
- Sandbox structural bridge actions produce packet-only insert, delete, and
  reorder responses through core operations.
- Inspector structural commands call the sandbox bridge routes and reuse the
  browser runtime-cache packet apply path.
- Outline navigation uses a DOM-free node-aware jump request before selecting
  nodes and restoring viewport anchors.
- Diagnostics navigation only jumps issues with valid runtime node ids and does
  not guess node targets for document-level diagnostics.
- Structural command policy is now owned by a DOM-free module instead of the
  app shell owning rendering, event binding, transport, mutation application,
  and command rules together.

## FAIL / BLOCKER

No blocker was found that prevents moving into the next WYSIWYG / Editing
design phase.

This is not a claim that Structural Runtime is production-complete. It means
the current foundation is coherent enough to build the next line on top of it
without reopening 69-76 first.

## RISK Register

| Risk | Severity | Owner Line | Disposition |
|---|---:|---|---|
| Structural packet v1 is a foundation bridge, not a durable persistence, collaboration, or backend public API protocol. | High | Backend / API / Persistence | Track later; must design durable operation log/versioning before external exposure. |
| Structural behavior is still proven in the sandbox, not in the production editor shell. | High | UX / Integration | Track later; require product integration smoke before UX redesign is called complete. |
| Diagnostics navigation can only jump issues that already include a valid `nodeId`. | Medium | Diagnostics / Structural Runtime | Track later; future diagnostics producers should emit node-linked issues where safe. |
| Tree-shaped boot snapshot intentionally becomes stale after packet apply while runtime store/render model hold current state. | Medium | Runtime / Renderer | Keep as design constraint; consumers must read runtime store/render model after packet apply. |
| Structural command policy only covers insert text-block, delete node, and reorder node. | Medium | Structural Runtime | Track later; new commands need new Phase Cards and policy tests. |
| Manual browser interaction QA has not been recorded in this repo. | Medium | QA / UX | Recommended before broad UX redesign; not a core-contract blocker. |
| Phase 73 documentation is historical: Phase 76 moved command target, route, request, and selection-after ownership from `app.js` into `structuralCommandPolicy.js`. | Low | Documentation | Marked in this audit; future readers should treat Phase 76 as the latest owner contract. |

## UNKNOWN

- Real browser feel after repeated structural insert/delete/reorder operations
  has not been manually recorded.
- Accessibility and keyboard behavior for outline/diagnostics navigation has
  not been designed.
- Very large document behavior after many structural edits has test coverage
  through packet/runtime-store shape checks, but not a browser timing claim.

## Must Fix Before WYSIWYG

None.

The WYSIWYG / Editing line can start from the current Structural Runtime
foundation as long as it treats the following as constraints:

- runtime store/render model are the current browser truth after packet apply;
- structural packet v1 is local foundation transport only;
- structural command policy is the command-rule owner;
- diagnostics navigation must not infer node targets without `nodeId`.

## Track Later

- durable structural history/undo-redo;
- backend public structural mutation API;
- storage/session persistence;
- collaboration/conflict merge/offline replay;
- drag/drop outline editing and keyboard outline commands;
- richer diagnostics source ownership with node-linked issue emission;
- production editor integration smoke and browser interaction QA.

## Decision Log

- Decision: close Structural Runtime as a usable foundation, not as production
  completion.
- Decision: do not expand Phase 77 into implementation or refactor work.
- Decision: carry persistence/history/backend as later-line Phase Cards.
- Decision: enter WYSIWYG / Editing only after its own Phase Card locks
  selection, caret, IME, command, and non-goal boundaries.

## Files Changed

Phase 77 changes only documentation and tests:

- `docs/TEMPLATE_BUILDER_STRUCTURAL_RUNTIME_CLOSE_AUDIT.md`;
- `README.md`;
- `docs/PHASE_LEDGER.md`;
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`;
- `tests/templateBuilderSandboxBoundary.test.ts`.

## Behavior Changed

None. Phase 77 is an audit phase.

## Tests Run

Expected verification for this phase:

- focused `tests/templateBuilderSandboxBoundary.test.ts`;
- root type-check;
- full root test suite.

## Intentionally Not Changed

- structural packet v1 shape;
- Phase 72 sandbox bridge routes;
- browser runtime-store apply behavior;
- visible inspector command behavior;
- persistence, backend API, durable history, collaboration, offline replay, or
  package/document schema.
