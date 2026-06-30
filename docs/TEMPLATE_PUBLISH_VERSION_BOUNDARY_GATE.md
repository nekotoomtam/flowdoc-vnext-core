# Template Publish Version Boundary Gate

Status: Template Publish / Version Boundary Gate complete.

This phase uses Template Publish / Variable Schema / Render API Planning Gate
as source of truth. It defines the publish/version boundary for canonical
FlowDoc template candidates before Variable Schema or Render API contracts
attach to them.

This is a boundary and evidence-shape gate only. It does not implement backend
production routes, production storage durability, renderer artifact bytes,
auth/authz, Variable Schema / Data Contract, or Render API Contract.

## Source Of Truth

- `docs/TEMPLATE_VARIABLE_RENDER_API_PLANNING_GATE.md`
- `docs/MEASUREMENT_HARDENING_CLOSE_AUDIT.md`
- `fixtures/template-publish-version-boundary.v1.json`
- `fixtures/product-report-vnext.flowdoc.json`
- `docs/WORKSPACE_BOUNDARY.md`
- `docs/LEGACY_MIGRATION_GATE.md`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`

## Lane Confirmation

Template Publish / Version Boundary was selected as the first implementation
lane.

Deferred lanes:

- Variable Schema / Data Contract;
- Render API Contract.

Those lanes remain deferred because they need a stable published
template/version target before their contracts can safely attach to template
state.

## Boundary Metadata Fixture

The JSON-safe boundary metadata is:

```text
fixtures/template-publish-version-boundary.v1.json
```

It records:

- boundary id: `template-publish-version-boundary-v1`;
- selected lane: `Template Publish / Version Boundary`;
- boundary status: `accepted`;
- next recommended work: `Template Publish Validation Evidence Gate`;
- schema decision required before validation evidence: `false`.

The schema decision is not required before validation evidence because this
gate can express draft identity, published version identity, validation
evidence, and retention pointers as external JSON-safe metadata. It does not
need to mutate package v2/document v3.

## Template Identity Boundary

Draft template identity and published template version identity are separate.

Draft template identity:

- identity kind: `draft-template`;
- mutable: true;
- identifier fields: `draftTemplateId`, `workingRevisionId`;
- allowed purpose: authoring and review before publish;
- must not be referenced by Variable Schema or Render API contracts.

Published template version identity:

- identity kind: `published-template-version`;
- mutable: false;
- identifier fields: `templateId`, `templateVersionId`, `versionOrdinal`;
- accepted version id rule: immutable after accepted;
- stable reference target for later Variable Schema and Render API gates.

## Published Version Metadata

Published version metadata must be JSON-safe and may include:

- `templateId`;
- `templateVersionId`;
- `versionOrdinal`;
- `sourcePackageId`;
- `packageVersion`;
- `documentVersion`;
- `title`;
- `createdAt`;
- `publishedAt`;
- `status`;
- `lifecyclePolicyName`;
- `sourceSnapshotRetentionPointer`;
- `validationEvidencePointer`.

The accepted status vocabulary is:

- `accepted`;
- `deprecated`;
- `superseded`.

## Immutability Rules

- Accepted `templateVersionId` is immutable.
- Accepted source snapshot pointer is immutable.
- Accepted source package content is immutable.
- Metadata corrections require a separate lifecycle record or a new published
  version.
- Package/document schema changes are not allowed in this gate.

## Publishable Candidate Source

Publishable template candidates must be canonical FlowDoc packages:

```text
FlowDocPackage.packageVersion = 2
document.version = 3
package.kind = document
```

The candidate source can be represented by a retention pointer. This gate does
not copy raw package snapshots into the boundary metadata fixture.

## Publish Validation Evidence Shape

The later Template Publish Validation Evidence Gate should produce JSON-safe
validation evidence with:

- package parse status;
- graph diagnostics status and issue count;
- key/data diagnostics status, error count, and warning count;
- export-readiness status;
- measurement status;
- rejected publish blockers.

Rejected publish blockers include:

- `invalid-package`;
- `unsupported-package-version`;
- `unsupported-document-version`;
- `graph-diagnostics-blocked`;
- `key-data-diagnostics-blocked`;
- `export-readiness-blocked`;
- `measurement-status-blocked`;
- `missing-source-snapshot-retention-pointer`.

## Retention Pointer Evidence

Retention pointer evidence must identify:

- source package/template snapshot pointer;
- validation evidence pointer.

Retention pointer evidence does not claim production storage durability.
Storage durability remains a later production lane decision.

## Lifecycle Policy Names

- rollback policy: `supersede-with-new-template-version`;
- deprecation policy:
  `mark-version-deprecated-without-mutating-source-package`;
- superseding policy: `new-version-references-prior-version`.

## Next Phase

Template Publish Validation Evidence Gate.

Proceed there because the publish/version boundary is accepted and the needed
identity/version semantics can be expressed without package/document schema
changes.

If a later implementation gate discovers missing schema fields, it must stop
and proceed to a dedicated Template Version Schema Decision Gate.

## Explicit Non-Work

- No backend production routes are implemented.
- No production storage durability is claimed.
- No renderer artifact bytes are produced.
- No auth/authz behavior is added.
- No package/document schema change is made.
- No Variable Schema / Data Contract is implemented.
- No Render API Contract is implemented.
- No `measureVNextText(...)` replacement happens.
- No full measurement production readiness is claimed.
- No pagination mutation happens.
- No production renderer-backed measurement binding happens.
- No production PDF/DOCX renderer work is added.
- No production contenteditable implementation is added.
- No collaboration/offline behavior is added.
- No legacy editor runtime is copied.

## PASS

- Template Publish / Version Boundary is confirmed as the selected first lane.
- Variable Schema / Data Contract and Render API Contract remain deferred.
- Draft template identity is separate from published template version identity.
- JSON-safe published version metadata is defined.
- Accepted published version ids are immutable.
- Publishable candidates are restricted to canonical package v2/document v3.
- Publish validation evidence shape is defined.
- Retention pointer evidence is defined without claiming storage durability.
- Rollback, deprecation, and superseding policy names are defined.
- The next phase is Template Publish Validation Evidence Gate.

## FAIL-BLOCKER

None for this boundary gate.

Template Publish Validation Evidence Gate must not proceed if it needs to
mutate package/document schema, implement backend production routes, claim
storage durability, produce renderer artifacts, or attach Variable Schema /
Render API contracts.

## RISK

- Version id format and lifecycle metadata may need refinement when concrete
  publish validation summaries are produced.
- Retention pointer semantics may need a storage-specific gate before
  production persistence.
- Later Variable Schema or Render API gates may require additional references
  after they attach to published version identity.

## UNKNOWN

- Final `templateVersionId` generation algorithm.
- Final storage owner for source package snapshots.
- Whether version lifecycle records become a separate package-level artifact or
  a storage-adapter record.

## Files Changed

- `docs/TEMPLATE_PUBLISH_VERSION_BOUNDARY_GATE.md`
- `fixtures/template-publish-version-boundary.v1.json`
- `tests/templatePublishVersionBoundaryGate.test.ts`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`
- pointer guard tests

## Behavior Changed

No runtime behavior changed. This phase records a boundary decision and
JSON-safe evidence shape only.

## Tests Run

- `npm.cmd test -- tests/templatePublishVersionBoundaryGate.test.ts tests/templateVariableRenderApiPlanningGate.test.ts`
- `npm.cmd test`
- `npm.cmd run type-check`
- `npm.cmd run check`

## Risks Left

- Produce concrete publish validation evidence in the next gate.
- Keep schema changes behind a dedicated Template Version Schema Decision Gate
  if later evidence proves one is needed.
- Keep backend routes, storage durability, renderer artifacts, auth/authz,
  Variable Schema, and Render API implementation out of scope until dedicated
  gates.

## Intentionally Not Changed

- package/document schema
- backend routes/storage/auth/authz
- renderer artifact production
- Variable Schema / Data Contract
- Render API Contract
- `measureVNextText(...)`
- pagination behavior
- production renderer-backed measurement binding
- PDF/DOCX renderer behavior
- production contenteditable
- collaboration/offline behavior
