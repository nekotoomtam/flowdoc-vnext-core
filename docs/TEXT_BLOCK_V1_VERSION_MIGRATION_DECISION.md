# Text-block v1 Version And Migration Decision

Status: Phase 251 decision boundary. No document v4 parser or migration
executor is activated by this phase.

## Outcome

FlowDoc will preserve package v2/document v3 as the active canonical format
while Node v1 contracts are completed. The next canonical authored document
shape is document v4.

Document v4 is required because the target Text-block v1 grammar tightens
shapes that document v3 previously accepted, and Node v1 must add both
`inline-image` and a block image node. Reusing version 3 would let the same
version number describe incompatible accepted shapes.

Phase 252 resolves the target to package v3/document v4 because the image
source contract requires a package-level asset manifest and data snapshot v2.

## Active And Target Matrix

| Concern | Active | Target | Rule |
|---|---|---|---|
| Package envelope | v2 | v3 | Phase 252 adds a required image asset manifest |
| Authored document | v3 | v4 | Version changes for tightened grammar and image shapes |
| v3 parser | strict v3 | retained | Never reinterpret v3 input as v4 |
| v4 parser | absent | required | Add only after the v4 schema is complete |
| Read normalization | off | off | Package reads never mutate or silently upgrade |
| Migration | absent | explicit copy-forward | A separate accepted action creates and validates v4 |

## Why Document V4

Document v3 accepts empty text leaves and raw CR/LF inside text leaves. The
target grammar requires non-empty text leaves, explicit `line-break` atomics,
and `children: []` for a canonical empty block. Old v3 packages must therefore
continue to mean what version 3 meant when they were written.

The future image forms also extend the canonical inline and authored-node
unions. Existing strict consumers correctly reject those unknown forms. A
document-version change makes that incompatibility explicit instead of
presenting it as a malformed document v3.

## Package Version Rule

Text-block grammar and authored node unions belong to `document.version`; they
do not by themselves change the package envelope. Phase 252 subsequently
chooses a required package-level image asset manifest and data snapshot v2, so
the target package version is 3.

## V3 Compatibility Policy

- The current package v2/document v3 parser and serializer remain unchanged in
  accepted behavior.
- V3 reads do not run target-grammar normalization.
- Existing v3 documents remain readable even when they contain shapes that
  need normalization for v4.
- New core-owned producers should emit target-compatible shapes where that can
  be done without changing v3 meaning.
- A v4 document submitted to the current v3 parser remains
  `unsupported-version`, not `invalid-package` and not silently downgraded.

## Migration Contract

Migration is an explicit copy-forward action:

```text
parse canonical v3 source
  -> validate package, graph, fields, and text-block grammar
  -> block on unsafe or unresolved semantic issues
  -> apply deterministic normalization to a copy
  -> add v4 image defaults only when the image contract defines them
  -> stamp document.version = 4
  -> validate through the strict v4 package boundary
  -> backend persists as a new revision while retaining the source snapshot
```

The migration must not mutate its v3 input, run during an ordinary package
read, overwrite a backend record without a base-revision gate, or guess repairs
for blocked grammar issues.

Core owns the pure semantic migration plan and target validation. Backend owns
revision checks, source retention, persistence execution, and transport
results. Editor owns user intent, progress, conflict presentation, and applying
the refreshed revision.

## Activation Gates

Document v4 must not become an accepted canonical write until all of these are
complete:

1. Phase 252 completes the Image Source Contract for inline-image, block image,
   and asset ownership.
2. Document v4 schema contains the complete Node v1 authored and inline unions.
3. Strict v4 package validation covers Text-block v1 grammar and image facts.
4. Pure v3-to-v4 migration planning and application are deterministic and
   source-immutable.
5. Backend can persist migration through a base-revision gate and retain the
   source snapshot.
6. Editor and backend explicitly report unsupported document versions.
7. Product fixtures have v3 source and expected v4 migrated acceptance cases.

## PASS

- Active package v2/document v3 compatibility is preserved.
- Target document v4 has an explicit reason and activation boundary.
- Phase 252 resolves the target envelope to package v3.
- Silent read normalization and in-place migration are rejected.
- Core, backend, and editor migration ownership remain separated.

## FAIL / BLOCKER

- Document v4 activation is blocked by the listed activation gates.
- Package v3/document v4 activation remains blocked until target schemas and
  migration/downstream gates exist.

## RISK

- Supporting v3 and v4 concurrently will require named parsers and explicit
  consumer capability checks rather than one ambiguous parser.
- The package-level asset registry requires package v3 and broadens the backend
  migration surface.
- Rich-inline write paths can still create v3-valid shapes that require later
  v4 normalization until strict v4 preflight exists.

## UNKNOWN

- Upload limits, color normalization, and portable image bundle policy.
- Product policy for when users are offered or required to migrate stored v3
  documents.

## Files Changed

- `src/schema/documentVersionPolicy.ts`
- `src/schema/document.ts`
- `src/persistence/package.ts`
- `src/index.ts`
- `tests/textBlockV1VersionMigrationDecision.test.ts`
- `docs/TEXT_BLOCK_V1_VERSION_MIGRATION_DECISION.md`
- related Phase 247-250 decision documents;
- `docs/WORKSPACE_BOUNDARY.md`;
- `docs/LEGACY_MIGRATION_GATE.md`;
- `README.md`;
- `docs/PHASE_LEDGER.md`.

## Behavior Changed

A public JSON-safe decision record now names active package/document versions,
the target document version, migration ownership, and activation blockers.
Existing parser and serializer acceptance behavior is unchanged.

## Intentionally Not Changed

- active package v2/document v3 accepted shapes;
- document v4 or image schemas;
- package-read normalization;
- migration planning or execution;
- fixtures and stored documents;
- backend routes, storage records, and revisions;
- editor runtime, UI, selection, and DOM;
- pagination, fragments, rendering, and artifacts.

## Next Recommended Direction

After Phase 252 resolves package v3/document v4 and image ownership, implement
the target package asset-registry and data-snapshot schemas without changing
the active package v2/document v3 parser.
