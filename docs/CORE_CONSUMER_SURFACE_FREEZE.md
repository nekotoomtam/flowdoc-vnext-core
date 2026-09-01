# Core Consumer Surface Freeze

## Authority Boundary

Owner repository: Core.
Scope: Core-local documentation context for this repository file. This file may describe Core-owned implementation, runtime contracts, package-local tests, setup guidance, or bounded historical evidence.
Project Control owns FlowDoc-wide Work, Phase, Checklist, Evidence, Risk, Unknown, Roadmap, documentation authority, product terminology, compatibility promotion, and map truth. Governing Work: `flowdoc-product-development-resumption > flowdoc-documentation-authority-cleanup`; governing Project Control record: `docs/domains/product-repo-markdown-boundary-completion-2026-09-01.md`.
This file does not promote Core, Backend, Editor, compatibility, release readiness, frontend readiness, FlowDoc product truth, Project Control terminology authority, or map truth.


Date: 2026-08-27

Status: consumer-surface planning freeze for
`core-consumer-surface-freeze`.

## Scope

This document records the Core-owned consumer surface freeze before Backend,
Editor, or future frontend work binds to Core imports during redesign.

This document does not publish Core, does not authorize package release
composition, does not prove Backend or Editor adoption, and does not promote
FlowDoc product readiness. It is planning evidence plus a pointer to the
machine-readable Core contract in
`src/schema/consumerSurface.ts#VNEXT_CORE_CONSUMER_SURFACE_FREEZE`.

## Active Entrypoints

| Entrypoint | Disposition | Consumers | Decision |
|---|---|---|---|
| `@flowdoc/vnext-core` | supported-current-private-root | Backend service boundary, Editor core adapter | Keep the broad root import stable during transition. Removal is blocked until Backend and Editor adoption evidence exists. |
| `@flowdoc/vnext-core/fixtures/*` | supported-fixture | Backend service boundary, Editor core adapter | Keep fixture subpath support for bounded local evidence. |

No additional subpath export is active in `package.json` in this lane. The
schema, operations, runtime, generation, composition, pagination, renderer,
table, toc, and authoring groups are planned-not-exported candidate groups,
not approved package exports.

## Consumer Boundaries

Backend may consume the current root package and fixture subpath during
transition, but Backend owns Backend document record shape, Backend Revision,
transport, persistence, auth, tenancy, service readiness, deployment,
telemetry, backup, and rollback contracts.

Editor production code may consume Core through `src/core/coreAdapter.ts`.
Future frontend redesign work must not import Core directly. Browser UI state,
Editor draft state, Preview behavior, Outline item presentation, and adapter
copy remain Editor-owned until separate adoption evidence says otherwise.

Core owns Document package parsing, version capability facts, explicit
migration planning, mutation semantics, composition contracts, generation
contracts, artifact contracts, pagination contracts, renderer consumption
contracts, table/toc contracts, and supported Core runtime node semantics
only inside the package boundary.

## Blocked Surfaces

- Direct imports from `flowdoc-vnext-core/src/**` remain blocked.
- Silent read normalization and exported compatibility adapters remain
  blocked.
- Backend transport, storage, readiness, auth, tenancy, deployment, and
  production operations remain blocked as Core surfaces.
- Editor draft, Preview, Outline item, browser state, React state, DOM state,
  and UI workflows remain blocked as Core surfaces.

## PASS

- Core now publishes a JSON-safe consumer surface freeze contract through the
  existing root entrypoint.
- The contract distinguishes supported consumer surfaces from retained
  transition, retained migration, and blocked owner surfaces.
- `package.json` exports remain unchanged: the root entrypoint and fixture
  subpath are the only active package exports.

## FAIL / BLOCKER

- None for the additive Core contract.

## RISK

- Backend still has broad direct root imports, so future public-boundary
  narrowing can break Backend unless the Backend adoption lane moves first.
- Editor tests still import selected root symbols and fixtures directly, so
  test imports need their own adoption policy before root narrowing.
- Candidate subpath names are planning-only and could become stale if the
  package release boundary chooses different groups.

## UNKNOWN

- The final public package subpath set remains UNKNOWN.
- Backend replacement import paths are not staged in this lane.
- Editor test import policy is not staged in this lane.
- Whether the future frontend consumes Backend document records directly or an
  Editor-owned adapter boundary remains UNKNOWN.
- Production Backend readiness and deployed compatibility remain UNKNOWN.

## Behavior Changed

Core gained an additive machine-readable consumer surface freeze contract.
Parser behavior, runtime/session behavior, package exports, Backend routes,
Editor state, Preview behavior, storage, auth, tenancy, deployment, and
production readiness did not change.

## Intentionally Not Changed

- `package.json` export map.
- Backend source.
- Editor source.
- Core parser acceptance.
- Core mutation, migration, pagination, renderer, generation, or composition
  execution behavior.
- FlowDoc or Core readiness truth.
