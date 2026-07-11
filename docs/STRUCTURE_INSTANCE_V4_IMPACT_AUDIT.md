# Structure Definition And Document Instance V4 Impact Audit

Status: Phase 269 evidence-backed impact audit. This phase classifies current
core, backend, and editor contracts against the Phase 268 lifecycle lock. It
does not add package kinds, schemas, policy evaluation, materialization,
instance APIs, data resolution, or editor behavior.

## Outcome

The current v4 work is a reusable semantic foundation, not a discarded model.
Document node vocabulary, containment validation, reference validation,
revision gating, source retention, stale apply, and adapter boundaries remain
useful. The current package envelope and product terminology conflate authored
structure, actual document instance, embedded data, and generation input, so
those surfaces require explicit change before the lifecycle can be activated.

Phase 269 does not choose the final replacement schema. It narrows Phase 270 to
canonical identity/version contracts before policy or runtime work.

## Classification Vocabulary

- `REUSE`: responsibility and semantics remain valid; later types may be
  renamed or adapted without redesigning the behavior.
- `CHANGE_REQUIRED`: current ownership or shape conflicts with the Phase 268
  lifecycle and must change before activation.
- `DEFER`: valid future requirement that is not needed for the next identity
  contract.
- `REJECT`: must not enter the canonical lifecycle.

## Source Evidence

### Core

- `src/schema/documentV4Target.ts` and
  `src/schema/documentV4Structure.ts` own authored node vocabulary,
  containment, role, and table-grid validation.
- `src/persistence/packageV3.ts` owns one strict
  `FlowDocPackageV3DocumentV4` envelope with `kind: "document"`, one id,
  document graph, assets, fields, and optional data.
- `src/persistence/packageV3References.ts` validates field/image placements and
  data values against package registries.
- `src/persistence/packageV3ImageTarget.ts` supports scalar and image-reference
  values but no collection value contract.
- `src/runtime/readOnlySessionV4.ts` projects a strict v4 package into graph and
  capability facts.
- `src/operations/documentV4Operations.ts` owns deterministic generic
  delete/duplicate/reorder but mutates one whole package without structure
  policy input.
- `src/migration/packageV2ToV3.ts` retains explicit, source-immutable migration
  planning and target validation.
- `src/generation/runtime.ts` accepts an inline template package plus optional
  request data, falls back to package data, and remains readiness-only.
- `src/binding/repeatCollectionFormSlots.ts` explicitly reports collection,
  repeat-region, and form-slot execution as not modeled.
- `docs/TEMPLATE_PUBLISH_VERSION_BOUNDARY_GATE.md` separates mutable draft
  template identity from immutable published template version identity through
  external metadata.

### Backend

- `flowdoc-vnext-backend/src/storage/packageRepository.ts` stores one record per
  `documentId`, supports package 2/document 3 and package 3/document 4, clones
  through strict serializers, and retains migration source snapshots.
- `flowdoc-vnext-backend/src/service/mutationService.ts` checks base revision,
  invokes core semantics, writes accepted packages, and returns a revisioned
  read envelope.
- `flowdoc-vnext-backend/src/service/migrationService.ts` owns revisioned,
  idempotent migration persistence and source retention.
- `flowdoc-vnext-backend/src/routes/generationRoute.ts` exposes readiness-only
  request assessment with no storage reads, resolved document, renderer, or
  artifact execution.

### Editor

- `flowdoc-vnext-editor/src/core/coreAdapter.ts` is the only public core package
  integration boundary.
- `flowdoc-vnext-editor/src/core/corePackageRead.ts` selects the v4 read session
  from package/document versions and does not inspect artifact lifecycle kind.
- `flowdoc-vnext-editor/src/editor/commands/commandPolicy.ts` gates commands
  from projected node capabilities and editor state.
- Editor mutation integration retains backend revision checks and stale-gated
  apply, but calls the active artifact a document throughout runtime/read
  models.

## Core Impact Matrix

| Current area | Classification | Retained value | Required change or limit |
|---|---|---|---|
| v4 node graph and node families | `REUSE` | semantic blocks, containers, media placements, generated placeholders, utility nodes | Reuse as starter/materialized/resolved graph vocabulary; do not add report-specific node types. |
| v4 containment and reference validation | `REUSE` | strict graph, inline identity, field placement, asset reference, table shape checks | Run in artifact-specific validation contexts; resolved-only nodes must not become authored input. |
| package 3/document 4 envelope | `CHANGE_REQUIRED` | strict parse/serialize and package isolation | One `kind: "document"`, one id, graph, fields, assets, and optional data cannot identify Structure Definition versus Document Instance. |
| package id equals document id | `CHANGE_REQUIRED` | local identity consistency | Structure lineage/version identity and instance identity are different namespaces and require explicit references. |
| package field registry | `CHANGE_REQUIRED` | retained expected field contract and placement validation | Clarify external catalog identity/version versus published expected snapshot; do not make instance values field definitions. |
| package data snapshot | `CHANGE_REQUIRED` | atomic scalar/image value validation | Data must be accepted for an instance/generation context, not silently treated as authored structure data or package fallback. |
| image asset registry and placement split | `REUSE` | placement identity remains distinct from shared asset identity | Later split structure-owned static assets, instance assets, external media values, and portable embedding policy. |
| v4 read-only session | `REUSE` | strict package parsing, graph indexes, parent/context facts, capability projection | Entry must become artifact-aware; parse support must not imply structure/instance workflow readiness. |
| v4 generic operations | `REUSE` | deterministic subtree identity rewrite, validation, history-ready metadata, invalidation scope | Apply to the correct mutable artifact and require effective Structure Policy before instance mutation. |
| v2-to-v3 migration pattern | `REUSE` | explicit intent, immutable source, validated target, backend persistence split | Do not reinterpret the current target as the final structure/instance schema; later migrations require named artifact pairs. |
| generation readiness runtime | `CHANGE_REQUIRED` | request diagnostics, key/data validation direction, readiness/artifact separation | Replace inline-template-plus-package-data assumptions with published structure, instance revision, and atomic data snapshot inputs. |
| collection/repeat readiness boundary | `DEFER` | explicit blockers prevent false support | Keep collection values out of scalar inline placement; design repeat identity after structure/instance identity. |
| published template metadata | `REUSE` | mutable draft versus immutable accepted version, retained source pointer | Rewrite vocabulary and attachment target as Structure Definition/Published Structure Version; do not keep a parallel template lifecycle. |
| legacy document/PDF generator shapes | `REJECT` | requirement evidence only | No `ogd_jsonb`, `mode` switch, drawing helper, network call, or persistence behavior becomes canonical input. |

## Backend Impact Matrix

| Current area | Classification | Retained value | Required change or limit |
|---|---|---|---|
| revisioned repository writes | `REUSE` | compare-and-write, strict clone, immutable returned records | Introduce artifact-specific records/repositories instead of one `BackendPackageRecord` keyed only by `documentId`. |
| migration receipts and source snapshots | `REUSE` | idempotency, source retention, revision evidence | Generalize only after canonical structure/instance identity exists; retain backend ownership. |
| mutation service | `REUSE` | read, base-revision gate, core call, write-race handling, read envelope | Route commands by artifact kind and require core policy evaluation for instance commands. Backend must not copy policy semantics. |
| generation readiness route | `CHANGE_REQUIRED` | backend route ownership and public core consumption | Future generation loads a Published Structure Version and Document Instance or creates an allowed ephemeral context; current inline body is evidence only. |
| concrete materialization persistence | `DEFER` | none yet | Backend persists a core-produced materialization result only after Phase 270 identity and later materialization contracts pass. |

## Editor Impact Matrix

| Current area | Classification | Retained value | Required change or limit |
|---|---|---|---|
| core adapter boundary | `REUSE` | one audited package integration point | Add artifact-aware reads through this adapter only. |
| read envelope and stale apply | `REUSE` | source/base revision alignment and stale blocking | Carry artifact identity/revision without treating document schema version as runtime revision. |
| package-version-only v4 selection | `CHANGE_REQUIRED` | isolated v4 session selection | Inspect canonical artifact kind and supported lifecycle capability before selecting a session. |
| editor command policy | `REUSE` | UI/session command filtering and reason presentation | Consume effective capability returned from retained semantics; UI policy is not Structure Policy authority. |
| current product editor scope | `CHANGE_REQUIRED` | canvas, outline, selection, command dispatch | Name and save the current product as Structure Authoring. A future Instance Composer is a separate downstream workflow even if UI components are reused. |
| browser Materialize or persist execution | `REJECT` | none | Browser must not invent instance graphs or bypass backend revision/idempotency persistence. |

## Acceptance Case Coverage

| Case | Reusable current foundation | Missing before product support |
|---|---|---|
| mapped invoice/shipping form | node graph, field/image placements, scalar/image data checks, pagination contracts | structure/instance identity, published pins, accepted instance data flow, exact artifact runtime |
| general authored report | text/table/columns/image vocabulary, lifecycle operations, editor canvas/outline | Structure Policy, instance creation, text-block editing, measured v4 layout, renderer |
| governed operation guide | nested graph, ordered children, TOC/image placeholders, media registry, long-document pressure | required/allowed composition policy, materialization, generated resolution, collection/repeat, list-of-figures, scale evidence |

No acceptance case requires a second renderer or a legacy report-specific node
family. All cases must converge on one Resolved Document and measured artifact
pipeline.

## Required Contract Order

1. Define Structure Definition draft, Published Structure Version, and
   Materialized Document Instance identity/version contracts.
2. Define policy attachment and effective capability semantics.
3. Define pure materialization and provenance/identity behavior.
4. Define Data Snapshot/catalog/media pins and Resolved Document projection.
5. Resume text-block and node-family execution on those retained boundaries.
6. Add backend/editor workflows only after core contracts are accepted.

This order prevents package, route, and UI implementation from guessing the
same lifecycle differently.

## PASS

- Current node, graph, reference, operation, revision, and adapter foundations
  have explicit reuse paths.
- Conflicting package, generation, and product terminology surfaces are named
  as change-required rather than silently reinterpreted.
- Invoice, general report, and operation-guide cases converge on one resolved
  graph pipeline.
- Legacy code remains evidence only and repeat/compliance execution stays
  deferred.

## FAIL / BLOCKER

- No canonical Structure Definition or Document Instance package exists.
- Current package data fallback conflicts with explicit instance/generation
  Data Snapshot ownership.
- Current generic operations have no Structure Policy input.
- Backend storage has one document record namespace and no materialization API.
- Editor reads one document artifact and has no Structure Authoring lifecycle
  projection.

## RISK

- Renaming old template metadata without consolidating it can create two
  competing published-version lifecycles.
- Keeping data optional inside every package can reintroduce structure/data
  ambiguity after the new identity contract lands.
- Reusing generic operations without policy preflight can grant instance users
  structure-author permissions.
- Adding artifact kinds directly in all three repos at once can create a broad,
  hard-to-review migration.

## UNKNOWN

- Final package kind names and whether published/instance portable packages
  embed or reference immutable supporting snapshots.
- Exact structure lineage/version id format.
- Definition-to-instance node provenance and identity allocation.
- Catalog and media registry merge/collision policy during resolution.
- Whether stateless generation may create an ephemeral instance and under which
  restrictions.

## Intentionally Not Changed

- schemas, parsers, serializers, fixtures, migrations, and public exports;
- core read sessions, operations, generation runtime, and pagination;
- backend records, repositories, services, routes, and storage;
- editor adapter, runtime state, command policy, canvas, and UI;
- text-block, policy, materialization, collection, resolution, or compliance
  implementation.

## Next Recommended Direction

Define the minimum canonical identity/version contracts for mutable Structure
Definition drafts, immutable Published Structure Versions, and Materialized
Document Instances. Keep those contracts JSON-safe and pure in core; do not add
backend persistence or editor workflow until the identity gate passes.
