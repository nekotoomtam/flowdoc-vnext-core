# Package V2 To V3 Migration

Status: Phase 257 complete pure migration planner and apply boundary. Active
runtime consumers and persistence remain on package v2/document v3.

## Outcome

Phase 257 implements explicit copy-forward migration from canonical package v2
with document v3 to package v3 with document v4.

The migration is never invoked by an ordinary package read. It does not mutate
the source, write storage, retain revisions, or activate target runtime support.

## Public Boundary

The public entrypoint exports:

- `planVNextPackageV2ToV3Migration(value)`;
- `applyVNextPackageV2ToV3Migration(plan)`;
- JSON-safe plan, apply, issue, change, summary, and contract types;
- `auditVNextPackageV2ToV3Source(pack)` for explicit source audit evidence.

A plan is either `ready` with a strict target candidate or `blocked` with no
candidate. Apply accepts only a ready plan and re-runs the package v3/document
v4 parser before returning a cloned target package.

## Migration Flow

```text
parse package v2/document v3
  -> detect keys stripped by the active parser
  -> validate relationship graph and zone context
  -> plan Text-block v1 normalization
  -> build a target copy with explicit envelope defaults
  -> parse package v3/document v4 strictly
  -> return ready candidate or blocked issues
  -> apply revalidates and clones the candidate
```

## Deterministic Changes

The planner may perform only these changes:

| Change | Target behavior |
|---|---|
| package version | `2` becomes `3` |
| document version | `3` becomes `4` |
| data snapshot | version `1` becomes `2`; scalar values are copied |
| image registry | add `{ version: 1, images: {} }` |
| empty text | remove empty text leaves |
| raw CR/LF | split into explicit line-break atomics with deterministic ids |

Package/document identity, metadata, sections, node ids, ordering, fields, and
compatible data values are copied. The migration does not create image assets,
interpret paths or URLs as images, or materialize collections.

## Blocked Dispositions

The migration blocks instead of guessing when it finds:

- unknown source keys that the active v3 parser would strip;
- invalid source graph topology, missing widths, cycles, or orphans;
- unresolved Text-block v1 grammar errors;
- page-break outside direct body-zone flow;
- non-positive table widths or non-rectangular table grids;
- target field registry drift or scalar fallback on image/collection fields;
- scalar non-null image data without an image asset reference;
- non-null collection data without a collection value contract;
- any strict target schema, structure, or reference failure.

No blocked disposition deletes, moves, pads, resizes, or reinterprets authored
content.

## Unknown-Key Loss Guard

The active v3 schemas predate strict nested parsing and can strip unknown object
keys. The migration compares raw input with the parsed canonical shape and
emits `unknown-source-key` for every removed path. This makes silent loss a
blocker even though the active parser remains compatibility-stable.

Defaults inserted by the active parser are not reported because the audit only
tracks source keys absent from the parsed result.

## Fixture Pair

- source: `fixtures/product-report-vnext-minimal.flowdoc.json`;
- expected target: `fixtures/product-report-v4-migrated-minimal.flowdoc.json`.

The complete ready candidate must equal the expected target fixture and pass
the strict package v3/document v4 parser.

## Ownership

- Core owns pure planning, deterministic transformation, and target validation.
- Backend owns base-revision checks, source snapshot retention, persistence,
  idempotency, and transport results.
- Editor owns explicit user intent, progress, issue presentation, conflict UX,
  and refresh to the accepted revision.

## PASS

- Ready migration is deterministic, JSON-safe, and source-immutable.
- Apply revalidates target candidates and rejects forged invalid plans.
- Text normalization reuses the locked Text-block v1 grammar.
- Page-break, table, image, collection, and unknown-key ambiguity is blocked.
- Paired product fixtures prove exact copy-forward output.
- Active parser/runtime behavior is unchanged.

## FAIL / BLOCKER

- Backend has no revision-gated migration persistence route.
- Editor and backend do not yet advertise package/document version capability.
- Active graph, operations, pagination, renderer, and export remain v3-only.

## RISK

- Stored documents with stripped unknown facts will now require explicit user or
  migration-policy resolution.
- Large malformed documents can produce large issue lists; transport may need
  bounded summaries while retaining complete server diagnostics.
- A future image import migration requires external byte/asset evidence and
  must not be folded into this semantic copy-forward path.

## UNKNOWN

- Product policy for optional versus required migration.
- Source snapshot retention duration.
- Per-document, workspace, or release activation strategy.
- Collection data contract and migration UX.

## Files Changed

- `src/migration/packageV2ToV3Types.ts`;
- `src/migration/packageV2ToV3Audit.ts`;
- `src/migration/packageV2ToV3.ts`;
- `src/schema/documentVersionPolicy.ts`;
- `src/index.ts`;
- `tests/packageV2ToV3Migration.test.ts`;
- `fixtures/product-report-v4-migrated-minimal.flowdoc.json`;
- version-policy, fixture-role, target-parser, inventory, README, and ledger
  documentation/tests.

## Behavior Changed

Core now exposes an opt-in pure package v2/document v3 to package v3/document
v4 migration plan/apply boundary. The version policy removes the completed
`v3-to-v4-migration-plan` activation blocker and retains
`downstream-consumer-support`.

## Intentionally Not Changed

- package-read behavior and active canonical versions;
- runtime/editable/generation session entrypoints;
- backend routes, revisions, repositories, or storage;
- editor state, transport, UI, selection, or DOM;
- graph/operation/pagination/render/export v4 consumption;
- image upload, bytes, locators, or asset lifecycle;
- collection materialization.

## Next Recommended Direction

Define cross-repo downstream version capability reporting first, then add a
backend revision-gated migration route that retains the v3 source snapshot and
persists the core-produced v4 package as a new revision.
