# PDF Export REALDOC DocGen Architecture Lock

Status: `PDF-EXPORT-REALDOC-E.0` architecture realignment retained through the
accepted E.1 generation input, E.2 Core runtime, and E.3 bounded local Backend
admission. Production remains NO-GO.

## Decision

REALDOC continues the Structure Definition lifecycle locked in Phase 268. It
does not turn the product Editor into a primary Document Instance editor and it
does not turn FlowDoc into a fixed-position invoice or form filler.

The product direction is long-form, data-driven document composition:

```text
Editor authors Structure Definition draft
  -> validate and publish immutable Structure Version
  -> pre-test import or external API supplies data and asset references
  -> source adapter or mapping profile creates one canonical Data Snapshot
  -> Backend allocates the generation/instance context and pins every input
  -> Core resolves, measures, paginates, and projects renderer facts
  -> Backend executes and retains the local artifact lifecycle
```

The 69C UAT source remains one demanding test dataset and one reusable UAT
Structure Definition. It is not the canonical FlowDoc schema and no UAT field,
table, section, or source path becomes a general Core requirement.

## Two JSON Families

### FlowDoc-Owned Structure JSON

The published Structure Version owns the document tree and the contracts that
describe how data may be used. The logical responsibilities include:

- field definitions, types, requirements, and stable semantic identities;
- field placements and presentation selections;
- static authored content, styles, tables, columns, media placements, and
  composition intent;
- collection, repeat, conditional, generated-content, and long-document rules
  as each capability becomes versioned and accepted; and
- the immutable published version, policy, and registry fingerprints needed to
  resolve deterministically.

A field definition does not own an absolute page coordinate. One field value
may be placed more than once and may use different presentation at each
placement. Containers, measured content, and pagination determine the final
page geometry after data resolution.

### Caller-Owned Data JSON

An external application supplies business values and asset references. The
payload does not supply page numbers, table-cell coordinates, renderer
commands, styles, or trusted Structure Definition facts.

An upstream payload may already match the published field/data contract, or a
versioned source adapter/mapping profile may transform it into the canonical
Data Snapshot. Source-specific shape validation and normalization stay outside
canonical Core document semantics. Accepted mapping evidence retains the exact
published Structure Version, source profile, payload fingerprint, output
snapshot fingerprint, asset identities, and provenance needed to fail closed.

Mapping configuration is FlowDoc-owned contract metadata, but the business
payload remains caller-owned data. The mapping layer does not become a third
mutable document truth.

## Field And Presentation Separation

Field definitions, field values, and field placements are independent truths:

```text
field definition + accepted value
  -> one or more presentation placements in the Structure
  -> resolved document tree
  -> measured flow layout and pagination
```

Changing a heading to a table cell, moving a value to a footer, showing the
same value twice, or changing a repeated collection presentation must not
require the caller to add layout facts to its payload. A new document type
composed from accepted node and presentation capabilities requires a new
Structure Version, not a document-specific renderer branch.

When a requested presentation needs a genuinely new capability such as a
chart, barcode, new repeat family, or new pagination rule, that capability must
enter the shared versioned vocabulary with Core and renderer evidence. It must
not be hidden inside one mapping adapter.

## Book-Form Composition

FlowDoc targets variable-length document books, not only flat mapped forms.
Resolved data may affect section presence, collection length, table rows,
images, generated entries, and total page count. Long-form requirements include
front matter, headings, repeated headers, flowing tables, headers and footers,
page numbers, TOC/page-reference resolution, appendices, and bounded full-book
pagination as their individual capability lanes are accepted.

Final page placement is downstream of complete resolution and measurement.
The caller payload and the Editor DOM are never page-layout truth.

The current accepted runtime does not yet claim arbitrary generic repeat or
conditional expansion for every node family. REALDOC-D.1 proves scalar fields,
generated Table collection rows, whole images, and one bounded UAT section.
Later phases must extend shared contracts rather than infer that all dynamic
book behavior is already implemented.

## Pre-Test Boundary

The Editor may offer test-data import, mapping diagnostics, outline inspection,
and preview for a Structure Definition draft or Published Structure Version.
This is a pre-test caller of the DocGen pipeline, not the primary instance
authoring product.

Pre-test data must remain separate from authored Structure truth. It must not:

- write business values into field definitions or published starter content;
- make browser layout or browser mapping a second resolver;
- mutate the published version while testing;
- bypass Backend admission, digest checks, or revision/version pins; or
- claim artifact truth from a browser-only preview.

The accepted direction is for pre-test and external API calls to share the
same validation, mapping, resolution, measurement, and artifact contracts.
Editor-only sample fixtures may help interaction tests, but cannot establish a
separate successful path that the Backend API cannot reproduce.

## Document Instance Role

The existing Materialized Document Instance contract remains valid. Backend
allocates its identity and Core deterministically materializes one exact
Published Structure Version. In the DocGen lane it is a generation/resolution
artifact with retained revision and provenance, not evidence that the product
Editor should primarily open and edit generated business documents.

Whether a generation instance is request-scoped, retained for reopen, or
durable for later workflow is a later Backend product decision. In every case,
instance values remain separate from Structure field definitions and later
Structure versions do not silently rewrite an existing instance.

## Repository Ownership

- Core owns Structure/instance identities, field and placement semantics,
  materialization, canonical Data Snapshot validation, deterministic
  resolution, measured composition, pagination, renderer projection, handoff,
  and receipt contracts.
- Backend owns publish/version retrieval, mapping-profile selection, trusted
  payload and asset admission, instance/generation identity, idempotency,
  persistence, workers, cancellation, status, and verified artifact delivery.
- Editor owns Structure Definition authoring, binding/presentation UX, test
  payload selection, mapping diagnostics, outline/preview interaction, and
  local lifecycle controls. It does not own durable data or artifact truth.
- External callers own business payload values and select an allowed published
  Structure Version and input contract. They do not submit trusted layout,
  renderer, provider, or persistence identity.

## 69C Evidence Mapping

The accepted REALDOC evidence already follows this boundary:

- `uatStructureDefinition.ts` represents one UAT-specific Structure Version
  using shared Core node, field, collection, media, policy, and table contracts;
- `uatSemanticNoPagesAdapter.ts` validates one source shape and projects exact
  Data Snapshot, collection, media, mapping provenance, and normalization facts;
- `uatSectionResolution.ts` materializes and resolves one generation instance;
- `uatMeasuredExport.ts` consumes resolved facts and shared measured layout;
  and
- REALDOC-D.1 proves one deterministic 10-page local artifact without making
  the source adapter or UAT fields canonical Core semantics.

## REALDOC-E Order

1. `REALDOC-E.0` accepts this architecture realignment and cross-repo wording.
2. `REALDOC-E.1` defines the exact published-Structure generation input and
   mapping-profile contract for direct canonical snapshots and adapted payloads.
3. `REALDOC-E.2` implements runtime validation/mapping with content-free
   diagnostics and proves pre-test/API parity before rendering.
4. `REALDOC-E.3` admits the bounded local DocGen request in Backend and pins
   Structure, payload, Data Snapshot, instance, mapping, and asset identities.
   Accepted.
5. `REALDOC-E.4` connects the admitted 69C generation to the existing local
   worker, cancellation, persistence, status, retry-capable lifecycle, and
   verified download. Accepted.
6. `REALDOC-E.5.0` locks the local Library and shared Design/Preview workspace,
   UI-neutral generated-Form boundary, distinct Draft/Published targets, and
   explicit stale state. Accepted without runtime activation.
7. `REALDOC-E.5.1` through `E.5.9` implement the Library, workspace, input
   projection, Form/JSON state, Preview targets, lifecycle UX, and parity
   evidence without making imported values authored Structure content or
   browser preview artifact truth.
8. `REALDOC-E.6` accepts the complete local request-to-artifact identity and
   restart/fault evidence across Editor, Backend, Core, and renderer.

REALDOC-F then scales the same Structure and generation contracts to all Module
2 sections. REALDOC-G scales to the complete book. REALDOC-H retains separate
section, module, and full-book regression levels.

## Acceptance Invariants

- No fixed global UAT, invoice, or form field list enters Core.
- Field identity is independent from presentation placement and final page
  geometry.
- Test import and external API input converge before canonical resolution.
- One generation pins one exact Published Structure Version, input/mapping
  contract, accepted data identity, asset set, and instance/revision context.
- Renderer and Editor do not reinterpret business payloads or relayout Core
  output.
- Changing data changes downstream identities and cannot replay stale bytes.
- Long-form scale extends shared capabilities instead of adding one-off
  document renderers.

## Explicitly Not Changed

REALDOC-E.0 changes no schema, parser, adapter output, resolver, measured
contract, renderer profile, Backend route, storage record, worker, Editor UI,
or production configuration. The LOCAL-G canonical fixture lane and exact
REALDOC-D.1 bytes remain unchanged.

Hosted providers, default route mounting, production auth/tenancy, deployment,
SLOs, retention, backup, monitoring, cost, rollout, and activation remain
deferred. Production remains NO-GO.

## PASS

- Phase 268 remains the product architecture source of truth.
- The two JSON families and mapping boundary are explicit.
- Field definition, value, placement, and final geometry are separated.
- Pre-test is aligned with the external DocGen API path.
- Document Instance remains a generation/materialization artifact rather than
  redefining the primary Editor product.
- The 69C work remains reusable evidence without becoming canonical schema.

## RISK

- Existing local Editor PDF controls are pinned to a current document revision
  and cannot be relabeled as the DocGen request contract.
- Existing variable/render API mini-lane evidence is metadata-only and uses one
  small fixed variable fixture; runtime mapping and dynamic collections still
  require dedicated contracts.
- Generic repeat, conditional, and mixed long-document expansion are not yet
  accepted for every node family.

## UNKNOWN

- Final mapping DSL versus additional adapters beyond the accepted trusted
  registry boundary.
- Whether local pre-test uses a temporary or retained generation instance.
- Exact published Structure storage and lookup API.
- Final source of asset bytes for external API calls.
- Draft Preview retention and reopen policy after immutable local admission.

## Next Phase

E.1 now accepts the pure Published Structure generation input and mapping
identity contract. E.2 now accepts exact payload/mapper execution and shared runtime
validation in `docs/PDF_EXPORT_REALDOC_GENERATION_RUNTIME.md`. E.3 now accepts
the optional bounded local Backend route, trusted registries, Backend-owned
instance, protected canonical record, and content-free replay receipt. E.4 now
accepts the local artifact lifecycle binding. `PDF-EXPORT-REALDOC-E.5.0` now
locks the Document Library and Design/Preview workspace product contract. Next
phase: `PDF-EXPORT-REALDOC-E.5.1` bounded local Library read model and first
Library view. Production remains NO-GO.
