# Template Builder Viewport Large Document Audit

## Authority Boundary

Owner repository: Core.
Scope: Core-local documentation context for this repository file. This file may describe Core-owned implementation, runtime contracts, package-local tests, setup guidance, or bounded historical evidence.
Project Control owns FlowDoc-wide Work, Phase, Checklist, Evidence, Risk, Unknown, Roadmap, documentation authority, product terminology, compatibility promotion, and map truth. Governing Work: `flowdoc-product-development-resumption > flowdoc-documentation-authority-cleanup`; governing Project Control record: `docs/domains/product-repo-markdown-boundary-completion-2026-09-01.md`.
This file does not promote Core, Backend, Editor, compatibility, release readiness, frontend readiness, FlowDoc product truth, Project Control terminology authority, or map truth.


Status: Phase 68 behavior audit.

Phase 68 closes the viewport/virtualization line with a large-document behavior
audit before the Structural Runtime line starts. It does not add a new runtime
feature. It proves the existing viewport scheduler, visible-range, render
shell, virtual stack, lazy detail, and node-anchor boundaries compose into a
bounded large-document path.

## Audit Shape

The audit uses a synthetic document-shaped viewport fixture with:

- 72 ordered sections;
- 936 ordered runtime nodes;
- 13 nodes per section, including a heavy table subtree;
- a scheduler budget of 80 visible nodes;
- a far target node in `section-50`.

The composed path is:

```text
section offsets
  -> viewport prediction
  -> scheduler automation
  -> visible range
  -> render window
  -> render shell
  -> virtual stack
  -> lazy heavy-detail plan
  -> node-aware anchor restore
```

## Acceptance Evidence

`tests/templateBuilderSandboxBoundary.test.ts` verifies:

- budgeted scheduler automation applies a far viewport candidate instead of
  keeping the boot section;
- the visible range is bounded to 39 nodes out of 936 total nodes;
- the render shell renders 3 sections and keeps 69 sections as placeholders;
- the virtual stack mounts only the rendered sections and collapses off-window
  sections into spacers;
- lazy heavy-detail planning only scans visible node ids and defers inactive
  heavy tables;
- the active target table path is materialized when the selected node is inside
  that table subtree;
- a node-aware anchor restores the far target node from shifted section
  measurements;
- a selection jump to the far target node produces a render window around the
  target section without remounting the first section.

## Guardrails

The audit is intentionally shape-based instead of wall-clock based. It proves
bounded behavior and dependency boundaries without introducing timing-sensitive
tests.

Phase 68 does not implement:

- production browser performance timing;
- recycled DOM pools;
- async lazy-detail hydration;
- outline or diagnostics jump UI;
- caret-relative text anchoring;
- structural add/delete/move packet application;
- rich text editing or contenteditable mapping;
- backend/API routes;
- persistence;
- package/document schema changes.
