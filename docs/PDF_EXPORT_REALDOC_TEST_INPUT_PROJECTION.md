# PDF Export REALDOC Test-Input Projection

Status: `PDF-EXPORT-REALDOC-E.5.3` accepted pure Core projection. Editor Form
state, JSON input, Preview execution, Backend admission calls, artifacts, and
production remain inactive.

## Outcome

E.5.3 adds one UI-neutral read projection between an exact Published Structure
artifact and later temporary test-input state:

```text
Published Structure owner/fingerprint and Document V4 graph
  + exact generation data contract
  + exact Published table definitions and placement bindings
  -> deterministic test-input projection
  -> later Editor-owned temporary values
```

`projectVNextPublishedStructureTestInputV1(...)` accepts no test values and
runs no mapping, snapshot creation, validation, materialization, resolution,
measurement, pagination, renderer, operation, or artifact lifecycle.

Primary implementation:

- `src/generation/publishedStructureTestInputProjectionV1.ts`;
- `tests/publishedStructureTestInputProjectionV1.test.ts`; and
- public exports through `src/index.ts`.

## Exact Pins

The request pins:

- one Published Structure Version owner;
- its retained Structure fingerprint and Document V4 graph;
- one exact E.1 generation data contract and fingerprint; and
- zero or more exact Published table definitions and placement-binding
  contracts.

The Structure owner and fingerprint must equal the data-contract pins. Every
table definition and binding contract must belong to the same Published
Structure Version. The projection records deterministic fingerprints for the
table definition and binding contracts it consumed.

Core validates the Document V4 graph and every supplied table content source
plan before projection. This function verifies pin agreement; a trusted
Structure repository remains responsible for loading the artifact represented
by the retained Structure fingerprint.

## Field Identity And Order

The projection traverses sections, zones, child arrays, text inlines, image
placements, tables, rows, and cells in canonical Document V4 order. A
collection row source is placed at its authored table. Table placement bindings
resolve whether a field-like token belongs to document scope or a collection
item scope.

One document field key produces one projected value identity even when it has
multiple text or image placements. The output retains placement count and only
the first placement for ordering and diagnostic navigation. Presentation
placement never changes input identity.

Placed fields are grouped by their first Structure section. Fields present in
the generation data contract but absent from the document remain available in
one explicit `unplaced` group, sorted by key. They are not silently discarded.
Collection item fields follow first-placement order inside their template;
unplaced item fields follow in stable key order.

## Constraint Facts

The projection reports only facts represented by accepted contracts:

| Fact | Document field | Collection item field |
| --- | --- | --- |
| Requiredness | `metadata-unavailable` | Exact `required` boolean |
| Generation default | `metadata-unavailable` for scalar/image | Exact optional typed fallback, absent, or explicitly unsupported published-asset fallback |
| Enum choices | `metadata-unavailable` | `metadata-unavailable` |
| Date format | `metadata-unavailable` | `metadata-unavailable` |
| Non-applicable facts | Explicit `not-applicable` | Explicit `not-applicable` |

The older document-field `fallback` string remains authored display metadata.
It is not promoted into a generation default. The output is ready even when a
scalar constraint is unavailable because that absence is explicit; later
Editor behavior must not claim stronger validation.

## Collections And Images

Every collection field requires an exact collection item shape. A missing item
contract blocks because Core cannot safely project repeatable values from only
a collection label.

Collection output declares ordered repetition, required unique `itemKey`
identity within the collection, item fields, and the canonical table collection
snapshot target. Minimum and maximum item metadata remain unavailable. A later
Editor may apply a local operational editing cap, but that cap is not a
generation-contract constraint.

Image fields declare an `image-asset-ref` value, the exact instance media
snapshot registry, and required asset existence. Published-asset item defaults
remain unsupported until static-media ownership is bound by the generation
runtime.

## Fail-Closed Coverage

Projection blocks on:

- malformed or caller-extended requests;
- Structure owner or fingerprint mismatch;
- invalid Document V4 structure;
- collection fields without item contracts;
- table owner, definition, source-plan, or binding drift;
- duplicate table or placement bindings;
- unknown document, collection, or collection-item fields; and
- text/image placement type mismatch.

The ready projection contains authored labels and accepted contract defaults,
but no caller payload, test value, canonical snapshot, instance, media bytes,
or artifact bytes. Inputs are not mutated and record insertion order does not
change the projection fingerprint.

## 69C Evidence

The existing UAT Structure passes through the generic projection without
adding UAT fields to canonical Core code:

- 17 document fields;
- 10 placed and 7 explicit unplaced document fields;
- 2 repeatable collections;
- 13 collection item fields, 7 of them placed in row templates; and
- 1 image item field pinned to instance media.

Reversing field, item-field, and supplied table record order produces the same
projection and fingerprint. Adding a second placement of the document-title
field increases placement count while retaining one field/value identity.

## Explicitly Not Changed

- no field, collection, snapshot, or runtime validation schema is widened;
- no scalar requiredness, enum choices, date format, or row limit is invented;
- no temporary Form/JSON values or browser persistence is added;
- no Draft Preview identity or admission path is added;
- no Backend route, repository, operation, worker, or artifact behavior changes;
- no renderer or exact page Preview executes; and
- no authentication, authorization, tenancy, provider, deployment, cost, or
  production activation changes.

## PASS

- The projection is pure, deterministic, versioned, and UI-neutral.
- Exact Published Structure and generation data-contract pins remain visible.
- Placement order and input identity stay separate.
- Collection item scope is resolved through explicit table bindings.
- Missing scalar metadata is represented instead of guessed.
- The 69C Structure proves scalar, collection, unplaced, and image behavior.

## RISK

- The current generation contract still cannot express scalar requiredness,
  enum choices, date formats, or semantic collection size limits.
- A caller must supply the complete trusted table-contract set for item-scoped
  authored templates.
- The projection pin verifies supplied identity agreement; trusted artifact
  lookup must verify bytes/fingerprint before invoking it.

## UNKNOWN

- Final source-neutral scalar constraint vocabulary beyond requiredness,
  allowed values, and value format.
- The local operational item limit used by the first Editor collection editor.
- Published Structure lookup transport consumed by the Editor workspace.

## Next Phase

`PDF-EXPORT-REALDOC-E.5.4` adds Editor-owned temporary Form state and maps this
projection into scalar, collection, and image inputs. It must preserve exact
missing-metadata states and still stop before JSON mapping and Preview
execution. Production remains NO-GO.
