# vNext Core Redesign Plan

Status: design baseline for the next implementation lane.

This plan defines the target architecture for FlowDoc vNext Core after
repository extraction. It is intentionally rebuild-first: existing source files
are evidence and test assets, not final architecture.

## Goal

Design a stable document core that can take canonical package input, apply
auditable operations, produce deterministic layout/export artifacts, and serve
future editor/API consumers without importing parent editor runtime code.

## Non-Negotiables

- vNext package input is the only authored source of truth.
- Generated preview/export output is derived state, not authored document
  state.
- Operations are the mutation API. Direct document mutation outside operations
  is not a public integration path.
- Pagination/export consumes measured fragments and renderer commands. It must
  not let renderers relayout, rewrap, or invent page breaks.
- Legacy/current code is evidence only unless it passes
  `docs/LEGACY_MIGRATION_GATE.md`.
- Parent editor integration is a consumer lane, not core ownership.

## Current Baseline Evidence

| Area | Existing Evidence | Redesign Reading |
|---|---|---|
| Package boundary | `src/persistence/package.ts` parses package v2/document v3. | Keep the package boundary, but separate authored package, normalized package, and runtime session types. |
| Schema | `src/schema/document.ts` defines zones, text-block, columns, table, TOC, page-break, divider, and spacer. | Keep the vocabulary direction, but make node contracts more capability-oriented and less implementation-slice-shaped. |
| Graph | `src/graph/relationshipGraph.ts` builds parent/child context and diagnostics. | Promote graph/indexes to a reusable runtime session dependency for operations, binding, layout, and export. |
| Operations | `src/operations/documentOperations.ts` owns command union, validation, history-ready records, and replay helpers. | Split into command schema, planner, applier, history/event record, and invalidation. |
| Pagination | `src/pagination/measuredPagination.ts` produces measured fragments from plan/text measurement. | Keep measured-fragment truth, but split layout into resumable stages and artifact contracts. |
| Renderer consumption | `src/pagination/rendererConsumption.ts` converts fragments to renderer commands. | Promote renderer commands as an explicit exported artifact API. |
| Bridge runtime | `src/editorBridge/runtime.ts` composes parse, graph, pagination, renderer consumption, and readiness. | Rename conceptually to package runtime/session; editor bridge is a consumer concern. |

## Target Architecture

```text
FlowDocPackage input
  -> parse + normalize
  -> runtime session
       authored document
       field registry
       data snapshot
       relationship graph
       operation registry
       invalidation index
  -> operation pipeline
       command validate
       plan
       apply
       assert
       event/history record
       invalidation scope
  -> layout pipeline
       layout plan
       measurement jobs
       measured fragments
       renderer commands
       export readiness
  -> consumer artifacts
       preview artifact
       SVG proof artifact
       PDF/DOCX renderer input
       diagnostics
```

## Layer Contracts

### 1. Package And Schema

The package layer owns persisted shape only.

Responsibilities:

- parse package v2/document v3;
- reject old/prototype shapes;
- normalize defaults deterministically;
- serialize canonical authored state;
- expose typed package/schema contracts.

Not responsibilities:

- operation application;
- layout measurement;
- renderer commands;
- parent editor compatibility.

Redesign direction:

- Introduce explicit `parse -> normalize -> assert` stages.
- Keep authored package JSON small and durable.
- Move derived/defaulted runtime-only fields out of persisted JSON unless they
  are truly authored.

### 2. Runtime Session

The runtime session is the in-memory truth for a single package processing
run. It is derived from the parsed package and can be discarded/rebuilt.

Responsibilities:

- hold normalized authored document;
- hold field/data context;
- build relationship graph;
- expose stable indexes for operations and layout;
- carry diagnostics and invalidation metadata.

Not responsibilities:

- persist session object as package JSON;
- mutate without operation records;
- depend on parent editor state.

Redesign direction:

- Replace the `editorBridge/runtime.ts` mental model with a core
  `createVNextRuntimeSession(...)` API.
- Keep the old bridge wrapper as a compatibility/export alias only if needed by
  consumers; do not make editor naming the core concept.

### 3. Operation Kernel

Operations are the only public mutation path.

Responsibilities:

- define command schemas;
- validate command target and policy;
- plan the change against graph/indexes;
- apply immutable document changes;
- assert the resulting document;
- emit event/history-ready records;
- emit invalidation scope for graph/layout/export.

Not responsibilities:

- know parent reducer/history state;
- render or paginate directly;
- silently mutate authored JSON outside audit records.

Redesign direction:

- Split the current operation file into modules:
  - `commands`
  - `planner`
  - `apply`
  - `history`
  - `invalidation`
  - `registry`
- Store operation results as events that can replay deterministically.
- Keep rejected operations durable when they matter for audit, but do not let
  rejected records mutate document state.

### 4. Binding And Form Slots

Binding is future-facing but should shape the architecture now.

Responsibilities:

- resolve field refs from package data or request data;
- keep authored template separate from bound runtime view;
- support future constrained form/slot areas without becoming a free-form word
  processor.

Not responsibilities:

- convert generated output into authored state;
- make user-submitted data part of the template unless an explicit operation
  does so.

Redesign direction:

- Introduce a future `binding` layer after runtime session and before layout.
- Treat field refs and future slots as runtime values over authored structure.
- Keep field registry versioned separately from document schema.

### 5. Layout And Pagination

Layout owns deterministic measured output from canonical runtime state.

Responsibilities:

- create layout plan;
- split work into resumable measurement/layout jobs;
- produce measured page fragments;
- preserve text wrap and page-break truth;
- report warnings and blocked export conditions.

Not responsibilities:

- let renderers decide layout;
- depend on DOM/editor canvas state;
- mutate authored document state.

Redesign direction:

- Move from one large measured-pagination path toward staged layout:
  - `plan`
  - `measure`
  - `paginate`
  - `fragment`
  - `artifact`
- Make stages resumable so long documents can process in chunks.
- Keep a stable fragment identity model for history/invalidation and export.

### 6. Renderer And Export Artifacts

Core should produce renderer-neutral artifacts, not target renderer side
effects.

Responsibilities:

- convert measured fragments to renderer commands;
- expose export readiness;
- expose bounded preview/SVG proof data;
- describe what PDF/DOCX renderers must consume.

Not responsibilities:

- implement browser editor rendering;
- own PDF/DOCX concrete rendering before the artifact contract is stable;
- let renderer output become authored state.

Redesign direction:

- Promote renderer command/artifact types as public API.
- Add artifact versioning separate from document/package versions.
- Keep concrete PDF/DOCX as later adapters over renderer commands.

## Node Model Direction

Keep the current vocabulary direction, but tighten ownership:

| Concept | Direction |
|---|---|
| `zone` | section-owned root areas for body/static page areas. |
| `text-block` | unified authored text block with role-driven paragraph, heading, list-item, caption, note, and label behavior. |
| inline nodes | authored text, field refs, line breaks, page number markers; future slots must be explicit. |
| `columns` / `column` | layout containers with explicit child relationships and width shares. |
| `table` / row / cell | first-class structured content with fragmentable rows/cells; spans remain gated until table engine catches up. |
| generated nodes | TOC/page-number output is derived unless authored as a placeholder node. |
| spacer/divider | atomic authored layout primitives. |

Potential schema changes to evaluate before implementation:

- replace table row `height` with `minHeight` if fixed height is not truly
  authored;
- make table span support explicit as `unsupported` or gated until layout can
  honor it;
- add stable operation-friendly node creation helpers instead of raw object
  literals in callers;
- decide whether `field-ref` fallback belongs in inline node, field registry,
  or binding request priority.

## Implementation Lanes

### Lane A: Runtime Session Foundation

Goal: create the new core runtime entrypoint without changing public document
schema.

Deliverables:

- `createVNextRuntimeSession(...)`
- normalized package/document result;
- graph/index diagnostics;
- session-level public type;
- tests proving no parent dependency and no editor naming required.

### Lane B: Operation Kernel Split

Goal: split the monolithic operation path while preserving behavior.

Deliverables:

- command registry;
- planner/apply/history/invalidation modules;
- deterministic replay tests;
- existing operation tests migrated without behavior regression.

### Lane C: Layout Pipeline Split

Goal: convert measured pagination into staged, resumable layout pipeline.

Deliverables:

- layout plan result;
- measurement job/result contract;
- measured fragment contract;
- renderer artifact contract;
- long-document chunk/resume tests.

### Lane D: Binding/Form-Slot Preparation

Goal: add architecture for data-driven documents without making generated
output authored state.

Deliverables:

- binding context contract;
- field ref resolution precedence;
- future slot model design;
- tests for authored template versus bound runtime view separation.

### Lane E: Export Artifact API

Goal: expose consumer-ready preview/export artifact APIs from core.

Deliverables:

- renderer command artifact version;
- readiness and diagnostics payload;
- SVG proof artifact builder if it stays core-owned;
- PDF/DOCX adapter requirements.

## First Recommended Job

Start with Lane A: Runtime Session Foundation.

Reason:

- it creates the new center of the architecture without rewriting every
  subsystem at once;
- it lets operations, binding, layout, and export share one canonical runtime
  context;
- it replaces editor-bridge naming as the mental model while keeping current
  tests useful;
- it is reversible and can be proven with focused tests.

## Review Gates

Stop before implementation if any of these become necessary:

- accepting current/old document shapes as canonical input;
- moving parent editor code into this repo;
- changing package/document versions without migration design;
- making renderer output the authored source of truth;
- implementing PDF/DOCX before renderer command artifacts are stable;
- exposing form-slot behavior as free-form editor semantics.

## Acceptance For This Design

PASS when:

- this plan is linked from `README.md` and `docs/PHASE_LEDGER.md`;
- the next implementation lane can start without consulting parent editor
  internals;
- legacy/current behavior remains evidence-only;
- `npm run check` remains green after design docs are added.

