# Cross-Repo Operating Map

Date: 2026-07-12

Status: active coordination map for `flowdoc-vnext-core`,
`flowdoc-vnext-editor`, and `flowdoc-vnext-backend`.

## Purpose

This map defines how work should move across the split FlowDoc vNext
repositories without blurring ownership. It is intentionally small: use it to
choose the right repo, preserve package boundaries, and keep integration work
on a reviewable path.

The default product runtime direction is:

```text
editor intent
  -> editor runtime / command boundary
  -> backend transport envelope
  -> backend revision gate
  -> @flowdoc/vnext-core operation or retained contract
  -> backend response envelope
  -> editor stale-gated runtime apply
```

## Repository Ownership

| Repository | Owns | Must Not Own | Evidence |
|---|---|---|---|
| `flowdoc-vnext-core` | canonical package/document schema, graph facts, operation semantics, pagination/export contracts, renderer-consumption contracts, history-ready records, retained facts | HTTP routes, React/runtime state, DOM state, concrete storage execution, product workflow execution | `AGENTS.md`; `README.md`; `docs/WORKSPACE_BOUNDARY.md`; `src/index.ts`; `tests/extractionBoundary.test.ts` |
| `flowdoc-vnext-editor` | product editor UI, browser runtime state, command policy, viewport/selection truth, adapter-safe core read models, stale-gated runtime apply | direct core internals, backend persistence, HTTP route ownership, WYSIWYG/input runtime before the gate | `flowdoc-vnext-editor/AGENTS.md`; `flowdoc-vnext-editor/src/core/coreAdapter.ts`; `flowdoc-vnext-editor/src/tests/boundary.test.ts`; `flowdoc-vnext-editor/docs/PHASE_1_RISK_REGISTER.md` |
| `flowdoc-vnext-backend` | API transport, request/response envelopes, base-revision checks, package persistence records, concrete storage adapters, backend-owned route parity, orchestration before/after core calls | editor runtime, React state, UI command policy, duplicated core operation semantics | `flowdoc-vnext-backend/AGENTS.md`; `flowdoc-vnext-backend/README.md`; `flowdoc-vnext-backend/src/service/mutationService.ts`; `flowdoc-vnext-backend/src/tests/mutationService.test.ts` |

## Current Evidence Snapshot

- Core remains the source of truth for canonical semantics and package
  contracts: `AGENTS.md`, `README.md`, and `docs/WORKSPACE_BOUNDARY.md`.
- Core public exports have been narrowed away from service-shaped compatibility
  helpers while retained facts remain public: `src/index.ts` and
  `docs/CORE_SERVICE_CONSUMER_MAP.md`.
- Editor package access to `@flowdoc/vnext-core` is isolated behind
  `flowdoc-vnext-editor/src/core/coreAdapter.ts`; boundary tests guard direct
  core imports and lab render-loop imports:
  `flowdoc-vnext-editor/src/tests/boundary.test.ts`.
- Editor risk R7 records that backend/API transport and mutation packets are
  still deferred:
  `flowdoc-vnext-editor/docs/PHASE_1_RISK_REGISTER.md`.
- Backend mutation execution checks `baseRevision` before calling
  `runVNextOperation(...)`:
  `flowdoc-vnext-backend/src/service/mutationService.ts`.
- Backend README still lists generation/artifact route wiring into the
  concrete HTTP server as not yet included:
  `flowdoc-vnext-backend/README.md`.
- Core Phase 258 publishes active and migration-target version-pair facts
  without activating v4 runtime behavior: `src/schema/versionCapability.ts`.
- Backend reports concrete read/mutation support and unwired migration
  persistence through `GET /capabilities/versions`:
  `flowdoc-vnext-backend@a7ca3b7`.
- Editor preflights that response, blocks unsupported package pairs before
  runtime loading, and gates mutation until capability is compatible:
  `flowdoc-vnext-editor@a4c501e`.
- Backend Phase 259 persists core-produced migrations behind base-revision and
  idempotency gates, retains the v3 source snapshot, and rejects active
  mutations after migration: `flowdoc-vnext-backend@f80cd27`.
- Editor capability evidence now recognizes persistence/retention availability
  while migration intent remains deferred: `flowdoc-vnext-editor@ccb63fa`.
- Core Phase 260 provides an isolated v4 read-only session without widening the
  active v3 graph or operation runtime: `flowdoc-vnext-core@db91014`.
- Backend advertises package 3/document 4 reads while keeping mutation on the
  active pair: `flowdoc-vnext-backend@b299e94`.
- Editor consumes v4 through `coreAdapter.ts`, projects structural image
  placeholders, and closes mutation/live/exact layout capabilities:
  `flowdoc-vnext-editor@5c422de`.
- Editor Phase 261 submits explicit revisioned migration intent, handles
  applied/stale/rejected/replayed results, and verifies the target read before
  entering v4 read-only mode: `flowdoc-vnext-editor@2c0c97d`.
- Backend migration persistence remains unchanged; its documentation records
  the completed consumer recovery path: `flowdoc-vnext-backend@5ea90bc`.
- Core Phase 262 adds operation-granular capability and isolated v4 same-parent
  reorder semantics: `flowdoc-vnext-core@68192fb`.
- Backend persists only v4 `node.reorder` and reports operation kinds per pair:
  `flowdoc-vnext-backend@c77474a`.
- Editor enters partial mode and enables reorder only when both core node facts
  and backend operation reporting agree: `flowdoc-vnext-editor@ed22cbc`.
- Core Phase 263 adds block-subtree delete while retaining shared package
  registries: `flowdoc-vnext-core@faf198f`.
- Backend persists v4 delete and continues rejecting duplicate:
  `flowdoc-vnext-backend@be2047a`.
- Editor partial mode enables delete/reorder only: `flowdoc-vnext-editor@9bad0e9`.
- Core Phase 264 adds deterministic block-subtree duplicate, rewrites authored
  node/inline identities, and retains shared registries:
  `flowdoc-vnext-core@59a852c`.
- Backend persists revision-gated v4 duplicate: `flowdoc-vnext-backend@87f68db`.
- Editor partial mode enables duplicate only when core and backend capability
  facts agree: `flowdoc-vnext-editor@2b598d3`.
- Core Phase 266 proves all valid generic lifecycle parent/node combinations,
  rejects same-index reorder, and reports image as media:
  `flowdoc-vnext-core@19ae304`.
- Backend proves rejected no-op reorder retains revision:
  `flowdoc-vnext-backend@71a5fe4`.
- Editor consumes the explicit media operation surface for v4 image placement:
  `flowdoc-vnext-editor@ce2d39a`.
- Core Phase 267 publishes independent readiness axes for all authored v4 node
  types and names text-block as the critical columns/table dependency:
  `flowdoc-vnext-core@928ec51`.
- Core Phase 268 locks Structure Definition authoring as the product north star,
  Published Structure Version and Materialized Document Instance as distinct
  lifecycle artifacts, and Resolved Document/Artifact as derived output. This
  decision does not activate publish, materialization, instance APIs, or policy
  execution: `docs/STRUCTURE_INSTANCE_ARCHITECTURE_LOCK.md`.
- Core Phase 269 classifies current core, backend, and editor contracts as
  reusable, change-required, deferred, or rejected against that lifecycle. It
  does not change schema, persistence, API, editor, policy, or runtime behavior:
  `docs/STRUCTURE_INSTANCE_V4_IMPACT_AUDIT.md`.

## Default Change Routing

Use this table before starting broad work.

| Change Type | Start In | Then Touch | Notes |
|---|---|---|---|
| New canonical node/schema shape | core | backend/editor after core tests pass | Keep package v2/document v3 canonical input only. |
| New document operation semantics | core | backend mapper/service, then editor command policy | Backend must not copy operation logic; it maps transport to core commands. |
| New backend mutation endpoint or envelope | backend | editor transport client, maybe core if a retained contract is missing | Every mutation needs a base-revision check before core execution. |
| Editor command or toolbar behavior | editor | backend/core only if the command needs missing service or semantic support | React components dispatch intent; runtime modules own behavior. |
| Concrete storage or artifact bytes | backend | core only for retained contracts/readiness facts | Core may define contracts, not concrete storage lifecycle. |
| Pagination/export semantic contract | core | backend route/orchestration, editor status/read model | Renderers consume measured output; they should not relayout authored input. |
| WYSIWYG/input runtime | editor only after written gate | core/backend only through explicit commit contracts | Do not start contenteditable/IME/rich-input work from incidental UI pressure. |

## Integration Lane Order

The generic v4 node lifecycle audit and node-family readiness matrix are
complete. Phase 268 inserts the Structure Definition / Materialized Document
Instance lifecycle boundary before text-block execution continues.

1. Use the completed impact audit to lock canonical Structure Definition,
   Published Structure Version, and Document Instance identity/version facts.
2. Lock policy, materialization, and resolved projection contracts without
   activating product workflow.
3. Resume empty text-block, inline identity, selection, and field-placement
   contracts on that lifecycle boundary.
4. Keep editor draft/IME and instance-composer implementation closed until
   their respective contracts pass.
5. Keep core imports behind `src/core/coreAdapter.ts`, revision gates in the
   backend, and stale-gated apply in the editor.

This lane intentionally does not add WYSIWYG, real collaboration, production
storage, artifact rendering, auth, or a new state-management framework.

## Delegated Major Topic Workflow

When the user delegates a broad topic, treat it as one active major workstream
instead of a single patch request.

### Intake

At the start of a major topic:

1. Restate the requested outcome and the repositories likely involved.
2. Read this map, the touched repo `AGENTS.md` files, and the subsystem tests or
   docs required by each touched repo.
3. Split the topic into small phases with clear completion checks.
4. Identify likely blockers, boundary risks, and decisions that would require
   user input before implementation proceeds.

### Execution

During execution:

1. Work phase by phase until the active major topic is complete or genuinely
   blocked.
2. Prefer small, reversible commits/patches even when the topic is large.
3. Keep phase boundaries aligned to real ownership: core semantics, backend
   transport/persistence, editor runtime/UI, tests, and documentation.
4. Keep applying the repo boundary rules in this document; a broad topic is not
   permission to merge responsibilities.
5. Run focused checks after risky phases and full repo gates before broad
   handoff.

### Reporting

The final report should come after the active major topic is complete or
blocked, and should include the standard review output from this document.
Interim updates should stay brief and should report phase progress, blockers,
or material direction changes rather than narrating every file read.

### Stop Conditions

Stop and ask the user before continuing when:

1. The requested outcome conflicts with a repo boundary or legacy migration
   gate.
2. The next phase would require choosing product behavior that is not implied by
   existing docs/tests.
3. A touched repo has unrelated dirty changes that affect the same files or
   make safe patching ambiguous.
4. Full completion would require credentials, external services, or deployment
   actions not available in the local workspace.
5. The work reaches a real architectural fork with similar-cost options and no
   existing evidence points to one.

## Boundary Rules

1. Core does not import editor or backend source.
2. Editor does not import `../flowdoc-vnext-core/src/**` and does not import
   `@flowdoc/vnext-core` outside its core adapter boundary.
3. Backend imports `@flowdoc/vnext-core` as a package and does not copy core
   operation semantics into service modules.
4. Backend route modules may wrap retained core facts, but must own HTTP
   status, request ids, transport status, persistence records, and stale gates.
5. Editor owns browser-local selection, viewport, and interaction state; none
   of that becomes canonical package truth.
6. Concrete storage, file IO, route wiring, and artifact byte lifecycle belong
   to backend-owned modules or backend-owned packages.
7. Legacy/current editor code is evidence only unless it passes
   `docs/LEGACY_MIGRATION_GATE.md`.

## Required Checks

Run the smallest meaningful verification while working, then the full gate
before broad handoff.

| Repository | Focused Check | Full Gate |
|---|---|---|
| core | subsystem Vitest file for touched source | `npm run check` |
| editor | affected `src/tests/*.test.ts` plus boundary test when imports change | `npm run check` |
| backend | affected route/service/storage tests plus contract tests when envelopes change | `npm run check` |

When a change spans repositories, record the check result for each repository
in the handoff.

## Review Output

For broad work or cross-repo handoff, include:

- PASS
- FAIL / BLOCKER
- RISK
- UNKNOWN
- files changed
- behavior changed
- tests run
- risks left
- intentionally not changed

## Near-Term Work Queue

1. Keep this map and each repo's `AGENTS.md` aligned.
2. Lock canonical Structure Definition, Published Structure Version, and
   Materialized Document Instance identity/version contracts from the completed
   Phase 269 audit.
3. Lock policy, materialization, and resolved-projection contracts before
   widening product workflow claims.
4. Resume text-block grammar, inline identity, field placement, and canonical
   selection contracts on that retained lifecycle boundary.
5. Implement text transactions only after those contracts pass.
6. Add measured v4 layout/render consumption without treating placeholder
   pagination as export truth.
7. Keep package v3/document v4 out of active editor/runtime activation until the
   remaining capability gates are explicitly closed.
8. Retire old core package lanes such as `packages/storage-file-json` and
   `packages/internal-alpha-runner` only after historical-test replacement and
   backend parity are proven.
