# Core Public Export Boundary Review

## Authority Boundary

Owner repository: Core.
Scope: Core-local documentation context for this repository file. This file may describe Core-owned implementation, runtime contracts, package-local tests, setup guidance, or bounded historical evidence.
Project Control owns FlowDoc-wide Work, Phase, Checklist, Evidence, Risk, Unknown, Roadmap, documentation authority, product terminology, compatibility promotion, and map truth. Governing Work: `flowdoc-product-development-resumption > flowdoc-documentation-authority-cleanup`; governing Project Control record: `docs/domains/product-repo-markdown-boundary-completion-2026-09-01.md`.
This file does not promote Core, Backend, Editor, compatibility, release readiness, frontend readiness, FlowDoc product truth, Project Control terminology authority, or map truth.


Date: 2026-08-26

Status: Project Control remediation evidence for
`core-public-export-boundary-review`.

Source baseline reviewed:
`501caec1fe3317309d0f6c18c2dec118fb6994e7`.

## Scope

This review inventories the current Core package public entrypoint and consumer
shape before any additional public export narrowing. It is evidence for the
Project Control work path
`flowdoc-product-development-resumption > core-public-export-boundary-review`.

This review does not publish Core, does not promote release composition, and
does not claim Core-Editor or Core-Backend compatibility acceptance.

## Current Package Boundary

`package.json` identifies the package as private and unreleased:

- package name: `@flowdoc/vnext-core`
- version: `0.0.0`
- private: `true`
- root export: `"." -> "./src/index.ts"`
- fixture export: `"./fixtures/*" -> "./fixtures/*"`
- type entrypoint: `"./src/index.ts"`

The root public entrypoint is therefore a private package surface, not an
approved release API.

## Root Export Inventory

`src/index.ts` currently exposes a broad evidence surface:

- `STAR_EXPORT_LINES=189`
- `NAMED_EXPORT_BLOCKS=30`
- `TOTAL_EXPORT_DECLARATIONS=219`

Top-level public declarations by source area:

| Source area | Export declarations |
|---|---:|
| layout | 43 |
| table | 38 |
| pagination | 21 |
| renderer | 20 |
| authoring | 16 |
| generation | 15 |
| composition | 13 |
| schema | 10 |
| toc | 6 |
| persistence | 5 |
| binding | 3 |
| identity | 3 |
| lifecycle | 4 |
| creatorPreview | 4 |
| migration | 3 |
| resolution | 3 |
| operations | 2 |
| runtime | 2 |
| structure | 2 |
| workflow | 2 |
| editorBridge | 1 |
| errors | 1 |
| fingerprint | 1 |
| graph | 1 |

The largest areas are layout, table, pagination, renderer, authoring,
generation, and composition. That distribution is useful as current evidence,
but it is too broad to treat as an approved public API without a staged
consumer adoption plan.

The Core consumer surface freeze adds one schema-area root export for
`src/schema/consumerSurface.ts`; it is a planning contract, not a package
release subpath or destructive export narrowing.

The Structure Pattern Slot boundary probe adds one lifecycle-area root export
for `src/lifecycle/structurePatternSlots.ts`; it is an additive Core semantic
boundary and does not add a package release subpath or destructive export
narrowing.

The bounded RootV1/SceneV1 retirement removes two contract star exports and two
runtime export blocks. Its later D1/D2 approval is governed by Project Control
`docs/domains/core-v1-closeout-plan-2026-09-05.md`, Work
`flowdoc-product-development-resumption > flowdoc-frontend-expert-roadmap`.
`CORE_LAYOUT_RUNTIME_RETIREMENT.md` records the exact API and evidence boundary.
The earlier review's no-go decision below remains historical to its own lane;
this inventory update does not change package subpaths or broaden retirement.

The Creator text Preview addition contributes two star exports and two named
blocks from `src/creatorPreview`. The Core-owned validator, product layout DTOs,
and verified measurement capability are bounded to `creator-text-preview/1`.
The separate adapter subpath `@flowdoc/text-engine-rust-wasm/creator-text-preview`
initializes the pinned raw engine under CCR `core-creator-preview-raw-facts-01`,
governed by Project Control `flowdoc-core-creator-preview-dispatch-2026-09-06.md`
under `flowdoc-product-development-resumption > flowdoc-frontend-expert-roadmap`.
The initializer is trusted executable host code; wire identities cannot mint
measurement capabilities. Existing RootV2, SceneDeliveryV2 and text-flow
display-list restrictions remain unchanged. The focused source tests are
`tests/creatorTextContentV1.test.ts` and `tests/creatorTextPreviewV1.test.ts`.
This inventory entry does not accept downstream integration or release readiness.
The consumer scans and gate results below remain historical to the original review.

## Consumer Evidence

Editor production source keeps the package behind one facade:
`flowdoc-vnext-editor/src/core/coreAdapter.ts`. It also imports the minimal
fixture through `@flowdoc/vnext-core/fixtures/*`. Editor tests import selected
root exports and fixtures directly, but the production adapter shape is the
important boundary.

Backend production source imports `@flowdoc/vnext-core` directly across
contracts, composition, routes, docgen, local/pdf export, service, storage,
artifacts, fixtures, and tests. That broad dependency means a root export
removal could break backend adoption even when Core tests still pass.

## Boundary Decision

NO-GO: do not remove, rename, or narrow the root public entrypoint in this
lane.

Reasons:

- Backend still has broad direct imports from the package root.
- Editor production usage is facade-shaped, but tests still import selected
  root exports directly.
- `UNKNOWN-CORE-PACKAGE-PUBLIC-DOCS-001` remains active.
- `RISK-CORE-DOCUMENTATION-PACKAGE-SURFACE-001` remains active.
- The current package is private `0.0.0`, so this lane should record evidence
  before release-boundary selection rather than declare release API.

## Staged Adoption Path

The next safe public-boundary step is additive, not destructive:

1. Keep `"." -> "./src/index.ts"` stable until Backend and Editor adoption are
   proven against replacement import paths.
2. Add or document explicit subpath groups before consumers move, for example
   schema, persistence, operations, runtime, generation, composition,
   pagination, renderer, table, toc, authoring, and fixtures.
3. Move Backend direct imports to the selected subpaths behind backend-owned
   tests.
4. Keep Editor production imports behind `src/core/coreAdapter.ts`.
5. Only after both consumers pass their gates, remove or deprecate root exports
   in a separate lane with matching Core, Backend, Editor, and Project Control
   evidence.

## PASS

- Current package metadata and export shape are inventoried.
- The root entrypoint breadth is quantified from `src/index.ts`.
- Editor production usage is identified as facade-shaped.
- Backend usage is identified as broad direct root consumption.
- A no-go decision blocks destructive export narrowing in this lane.

## FAIL / BLOCKER

- None for evidence capture.

## RISK

- A future public-boundary change can break Backend without failing Core-local
  tests.
- Root export breadth can be mistaken for an approved release API if release
  composition expands before the public docs unknown is closed.
- Consumer scans are point-in-time repository evidence and must be refreshed
  before any later de-export patch.

## UNKNOWN

- The final approved public subpath set is not selected.
- Backend replacement import paths are not staged.
- Editor test imports are not staged behind an adopted public-boundary rule.
- Core, Editor, Backend, and FlowDoc release readiness remain unpromoted.

## Files Changed

- `docs/CORE_PUBLIC_EXPORT_BOUNDARY_REVIEW.md`
- `tests/corePublicExportBoundaryReview.test.ts`

## Behavior Changed

- Documentation and guard coverage only.
- Additive consumer-surface contract source only.
- No parser, runtime, migration, pagination, renderer, or generation execution
  behavior changed.
- No `package.json` export map changed.

## Tests Run

- `npx vitest run tests/corePublicExportBoundaryReview.test.ts --silent`
  passed: 1 test file / 3 tests.
- `npm run check` passed: 459 test files / 2,941 tests.

## Intentionally Not Changed

- `package.json`
- Backend source
- Editor source
- Release composition
- Project Control system map truth
