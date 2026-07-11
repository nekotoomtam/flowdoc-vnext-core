# Version Capability Contract

Status: Phase 258 complete core contract with backend/editor reporting lanes.
Target runtime activation and migration persistence remain blocked.

## Outcome

FlowDoc now has a JSON-safe core source of truth for package/document version
capability. Consumers can distinguish an active runtime pair, a recognized
migration target, unsupported pairs, and invalid version markers without
probing parsers or relying on parser error strings.

## Version Matrix

| Pair | Disposition | Parse | Runtime session | Mutation | Migration source | Migration target validation |
|---|---|---:|---:|---:|---:|---:|
| package 2 / document 3 | active | yes | yes | yes | yes | no |
| package 3 / document 4 | migration-target | yes | no | no | no | yes |
| every other pair | unsupported | no | no | no | no | no |

Recognizing package 3/document 4 does not activate it in the current runtime,
graph, operations, pagination, renderer, editor, or backend repository.

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

Phase 258 replaces the completed `downstream-consumer-support` blocker with
`backend-revisioned-migration-persistence`.

The blocker remains because the backend does not yet:

- accept a migration request with a base revision;
- retain the source v3 snapshot;
- persist the validated v4 target as a new revision;
- return revision-conflict/idempotency results.

## PASS

- Active and migration-target version pairs are explicit and JSON-safe.
- Unsupported and malformed markers are distinguishable without parsing.
- V4 runtime and mutation support remain false.
- Backend/editor can consume one retained core capability vocabulary.
- Remaining activation work is named instead of hidden behind a generic
  downstream blocker.

## FAIL / BLOCKER

- Backend revisioned migration persistence is not implemented.
- Active runtime, graph, operations, pagination, and renderers remain v3-only.

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

Implement backend revision-gated migration persistence with source snapshot
retention, then let editor request migration explicitly and refresh only from
the accepted new revision.
