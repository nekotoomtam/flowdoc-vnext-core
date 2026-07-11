# Version Capability Contract

Status: Phase 260 read-only v4 consumer contract complete. Full v4 activation
remains blocked.

## Outcome

FlowDoc now has a JSON-safe core source of truth for package/document version
capability. Consumers can distinguish an active runtime pair, a recognized
migration target, unsupported pairs, and invalid version markers without
probing parsers or relying on parser error strings.

## Version Matrix

| Pair | Disposition | Parse | Active session | Read-only session | Mutation | Migration source | Target validation |
|---|---|---:|---:|---:|---:|---:|---:|
| package 2 / document 3 | active | yes | yes | yes | yes | yes | no |
| package 3 / document 4 | migration-target | yes | no | yes | no | no | yes |
| every other pair | unsupported | no | no | no | no | no | no |

Package 3/document 4 has a named read-only structural session. It remains
outside the active graph, operations, pagination, exact renderer, and export
runtime.

## Public APIs

- `VNEXT_CORE_VERSION_CAPABILITY_CONTRACT` publishes active and migration
  target facts plus remaining activation blockers.
- `getVNextCoreVersionSupport(packageVersion, documentVersion)` classifies an
  explicit pair.
- `inspectVNextPackageVersionCapability(value)` reads only top-level package
  and document version markers and never invokes a package parser.

Inspection returns `invalid-version-markers` when either marker is missing or
not a positive integer. A complete unrecognized pair returns `unsupported`.

## Cross-Repo Reporting

Core owns semantic pair facts only.

Backend wraps these facts in a backend-owned HTTP response that separately
reports concrete document-read, mutation, migration-plan, and migration-
persistence availability. Editor validates that response through its backend
transport boundary and blocks non-active package pairs before active runtime
loading.

The response must not imply that core target parsing means backend persistence
or editor runtime support.

## Activation State

Phase 260 completes the named read-only core session and editor/backend read
consumer path. Phase 261 completes explicit editor migration intent, result
handling, and accepted-target refresh. The remaining blocker is
`v4-mutation-layout-render-support`.

The backend now:

- accepts migration requests with a base revision;
- retains the source v3 snapshot;
- persists validated v4 targets as a new revision;
- returns stale, rejected, applied, and idempotent replay results.

Activation remains blocked because v4 does not yet have mutation, measured
layout, exact rendering, or export support.

## PASS

- Active and migration-target version pairs are explicit and JSON-safe.
- Unsupported and malformed markers are distinguishable without parsing.
- V4 active runtime and mutation support remain false.
- `canCreateReadOnlySession` distinguishes safe structural consumption from
  active runtime support.
- Backend/editor can consume one retained core capability vocabulary.
- Remaining activation work is named instead of hidden behind a generic
  downstream blocker.

## FAIL / BLOCKER

- Active operations, measured pagination, exact renderers, and export remain
  v3-only.

## RISK

- A consumer that checks only `canParse` could incorrectly treat a migration
  target as runtime-active; consumers must use the specific capability flag.
- Capability responses can drift if backend/editor copy values instead of
  comparing with the core contract.

## UNKNOWN

- Migration activation policy per document, workspace, or release.
- Source snapshot retention duration.
- Whether future readers support multiple active version pairs concurrently.

## Files Changed

- `src/schema/versionCapability.ts`;
- `src/schema/documentVersionPolicy.ts`;
- `src/index.ts`;
- `tests/versionCapability.test.ts`;
- version-policy, migration, README, and ledger documentation/tests;
- backend/editor capability files in their owning repositories.

Consumer evidence:

- `flowdoc-vnext-backend@a7ca3b7`;
- `flowdoc-vnext-editor@a4c501e`;
- read-only target reporting: `flowdoc-vnext-backend@b299e94`;
- read-only editor consumption: `flowdoc-vnext-editor@5c422de`;
- explicit editor migration workflow: `flowdoc-vnext-editor@2c0c97d`.

## Behavior Changed

Core consumers can inspect version markers and obtain precise semantic support
without invoking active or target package parsers. The target package remains
inactive for runtime use.

## Intentionally Not Changed

- package parser acceptance;
- active runtime/session behavior;
- document operations, graph, pagination, rendering, or export;
- backend routes or persistence in this repository;
- editor state or UI in this repository.

## Next Recommended Direction

Add v4 mutation and measured layout/render support before considering target
activation.
