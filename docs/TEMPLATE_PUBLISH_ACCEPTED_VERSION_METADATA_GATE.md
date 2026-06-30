# Template Publish Accepted Version Metadata Gate

Status: Template Publish Accepted Version Metadata Gate complete.

This phase uses Template Publish Validation Evidence Gate as source of truth.
It populates JSON-safe accepted published version metadata for the validated
canonical FlowDoc package v2 / document v3 template candidate.

This is a metadata gate only. It does not mutate package/document schema,
publish through backend routes, claim storage durability, produce renderer
artifact bytes, implement auth/authz, implement Variable Schema / Data
Contract, or implement Render API Contract.

## Source Of Truth

- `docs/TEMPLATE_PUBLISH_VALIDATION_EVIDENCE_GATE.md`
- `fixtures/template-publish-validation-evidence.v1.json`
- `fixtures/product-report-vnext.flowdoc.json`
- `docs/TEMPLATE_PUBLISH_VERSION_BOUNDARY_GATE.md`
- `fixtures/template-publish-version-boundary.v1.json`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`

## Validation Evidence Confirmation

Template Publish Validation Evidence Gate is accepted.

The validation candidate is:

```text
fixtures/product-report-vnext.flowdoc.json
```

Confirmed candidate facts:

- `FlowDocPackage.packageVersion = 2`;
- `package.kind = document`;
- `document.version = 3`;
- candidate package id: `product-report-vnext`;
- candidate document id: `product-report-vnext`.

Confirmed validation evidence:

- package parse status: `ready`;
- graph diagnostics status: `ready`;
- key/data diagnostics status: `ready`;
- export-readiness status: `ready-with-warnings`;
- export-readiness blocking issue count: `0`;
- export-readiness warning issue count: `1`;
- measurement status: `mini-checkpoint-only`;
- rejected publish blockers: none.

## Accepted Version Metadata Fixture

The JSON-safe accepted metadata is:

```text
fixtures/template-publish-accepted-version-metadata.v1.json
```

It records:

- metadata id: `template-publish-accepted-version-metadata-v1`;
- source validation evidence id: `template-publish-validation-evidence-v1`;
- source validation evidence status: `accepted`;
- metadata status: `accepted`;
- schema decision required: `false`;
- next recommended work: `Template Publish Close Audit`.

## Accepted Metadata Fields

The accepted version metadata carries:

- `templateId`;
- `templateVersionId`;
- `versionOrdinal`;
- `sourcePackageId`;
- `packageVersion`;
- `documentVersion`;
- `title`;
- `status`;
- `lifecyclePolicyName`;
- `sourceSnapshotRetentionPointer`;
- `validationEvidencePointer`;
- `validationEvidenceStatus`;
- `exportReadinessStatus`;
- `exportReadinessWarningCount`;
- `measurementStatus`.

The metadata preserves export-readiness warning visibility:

```text
exportReadinessStatus = ready-with-warnings
exportReadinessWarningCount = 1
```

The metadata also preserves measurement scope:

```text
measurementStatus = mini-checkpoint-only
```

This does not claim full measurement production readiness.

## Identity And Immutability

Draft template identity remains separate from accepted published template
version identity.

Accepted immutable fields:

- `templateVersionId`;
- `sourceSnapshotRetentionPointer`;
- `validationEvidencePointer`.

Metadata corrections require a lifecycle record or a later dedicated metadata
revision policy. They must not mutate the canonical package/document schema.

## Schema Decision Fallback

The accepted metadata is represented without schema changes.

If a later gate discovers accepted metadata cannot be represented externally,
it must stop and proceed to Template Version Schema Decision Gate.

## Retention Pointer Evidence

Retention pointers:

- source package/template snapshot:
  `repo://fixtures/product-report-vnext.flowdoc.json`;
- validation evidence:
  `repo://fixtures/template-publish-validation-evidence.v1.json`;
- accepted version metadata:
  `repo://fixtures/template-publish-accepted-version-metadata.v1.json`.

These are JSON-safe traceability pointers only. They do not claim production
storage durability.

## Next Phase

Template Publish Close Audit.

Proceed there because accepted version metadata is populated without
package/document schema changes.

If the close audit finds that the lane cannot safely close without schema
changes, it must route to Template Version Schema Decision Gate.

## Explicit Non-Work

- No package/document schema mutation is made.
- No backend production routes are implemented.
- No production storage durability is claimed.
- No renderer artifact bytes are produced.
- No auth/authz behavior is added.
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

- Template Publish Validation Evidence Gate is confirmed accepted.
- The validation candidate is canonical package v2/document v3.
- Accepted version metadata is populated with all required JSON-safe fields.
- Draft template identity remains separate from accepted published version
  identity.
- Accepted `templateVersionId` is immutable.
- Accepted source snapshot and validation evidence pointers are immutable.
- Export-readiness warning visibility is preserved in accepted metadata.
- Measurement remains `mini-checkpoint-only`.
- The metadata is represented without package/document schema changes.
- The next phase is Template Publish Close Audit.

## FAIL-BLOCKER

None for this metadata gate.

Template Publish Close Audit must not close the lane if accepted metadata needs
package/document schema mutation, backend production routes, storage durability
claims, renderer artifact bytes, auth/authz behavior, Variable Schema / Data
Contract, or Render API Contract.

## RISK

- The accepted `templateVersionId` format is still a policy candidate rather
  than a production id generator.
- Retention pointers are repo-local placeholders, not production storage.
- Export-readiness remains `ready-with-warnings`; close audit must decide
  whether that is acceptable for this mini infrastructure lane.

## UNKNOWN

- Final production storage owner for accepted metadata.
- Final lifecycle record shape for metadata corrections.
- Whether later Variable Schema or Render API gates need extra metadata
  references.

## Files Changed

- `docs/TEMPLATE_PUBLISH_ACCEPTED_VERSION_METADATA_GATE.md`
- `fixtures/template-publish-accepted-version-metadata.v1.json`
- `tests/templatePublishAcceptedVersionMetadataGate.test.ts`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`
- pointer guard tests

## Behavior Changed

No runtime behavior changed. This phase records accepted version metadata and
traceability only.

## Tests Run

- `npm.cmd test -- tests/templatePublishAcceptedVersionMetadataGate.test.ts tests/templatePublishValidationEvidenceGate.test.ts`
- `npm.cmd test`
- `npm.cmd run type-check`
- `npm.cmd run check`

## Risks Left

- Close the Template Publish lane in a dedicated close audit.
- Keep schema decisions behind Template Version Schema Decision Gate if close
  audit or later lanes require schema fields.
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
