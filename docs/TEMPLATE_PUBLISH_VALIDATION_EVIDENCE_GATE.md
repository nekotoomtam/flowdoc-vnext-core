# Template Publish Validation Evidence Gate

Status: Template Publish Validation Evidence Gate complete.

This phase uses Template Publish / Version Boundary Gate as source of truth. It
produces JSON-safe publish validation evidence for a canonical FlowDoc package
v2 / document v3 template candidate before accepted version metadata, Variable
Schema, or Render API contracts attach to it.

This is an evidence gate only. It does not publish a template version, create
backend routes, claim storage durability, produce renderer artifact bytes,
implement auth/authz, implement Variable Schema / Data Contract, or implement
Render API Contract.

## Source Of Truth

- `docs/TEMPLATE_PUBLISH_VERSION_BOUNDARY_GATE.md`
- `fixtures/template-publish-version-boundary.v1.json`
- `fixtures/product-report-vnext.flowdoc.json`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `docs/WORKSPACE_BOUNDARY.md`
- `docs/LEGACY_MIGRATION_GATE.md`

## Boundary Confirmation

The source boundary is accepted:

```text
fixtures/template-publish-version-boundary.v1.json
```

It keeps draft template identity separate from published template version
identity, and it defers:

- Variable Schema / Data Contract;
- Render API Contract.

This phase preserves those decisions.

## Validation Evidence Fixture

The JSON-safe publish validation evidence is:

```text
fixtures/template-publish-validation-evidence.v1.json
```

It records:

- evidence id: `template-publish-validation-evidence-v1`;
- source boundary id: `template-publish-version-boundary-v1`;
- evidence status: `accepted`;
- schema decision required: `false`;
- next recommended work:
  `Template Publish Accepted Version Metadata Gate`.

The fixture is a summary. It does not include raw renderer artifacts or raw
storage snapshots.

## Candidate

The validation candidate is:

```text
fixtures/product-report-vnext.flowdoc.json
```

Accepted candidate facts:

- `FlowDocPackage.packageVersion = 2`;
- `package.kind = document`;
- `document.version = 3`;
- candidate package id: `product-report-vnext`;
- candidate document id: `product-report-vnext`.

The candidate remains canonical vNext input. No package/document schema
mutation is introduced by this phase.

## Validation Evidence

The evidence fixture carries JSON-safe summary facts only:

- package parse status: `ready`;
- package parse issue count: `0`;
- graph diagnostics status: `ready`;
- graph diagnostics issue count: `0`;
- key/data diagnostics status: `ready`;
- key/data diagnostics error count: `0`;
- key/data diagnostics warning count: `0`;
- export-readiness status: `ready-with-warnings`;
- export-readiness blocking issue count: `0`;
- export-readiness warning issue count: `1`;
- measurement status: `mini-checkpoint-only`;
- rejected publish blockers for this accepted candidate: none.

The export-readiness warning is retained as validation evidence; it does not
produce renderer artifact bytes and does not claim production renderer
readiness.

Measurement remains limited to the mini infrastructure checkpoint decision from
Measurement Hardening Close Audit. Full v1 measurement production readiness and
default-measurer replacement remain blocked.

## Rejected Publish Attempts

Rejected publish attempts must carry explicit blockers. Accepted blocker
vocabulary:

- `invalid-package`;
- `unsupported-package-version`;
- `unsupported-document-version`;
- `graph-diagnostics-blocked`;
- `key-data-diagnostics-blocked`;
- `export-readiness-blocked`;
- `measurement-status-blocked`;
- `missing-source-snapshot-retention-pointer`.

Rejected attempts must not mutate canonical package/document schema.

## Retention Pointer Evidence

The evidence attaches to the retention pointer shape from the boundary gate:

- source package/template snapshot pointer:
  `repo://fixtures/product-report-vnext.flowdoc.json`;
- validation evidence pointer:
  `repo://fixtures/template-publish-validation-evidence.v1.json`.

These are traceability pointers only. They do not claim production storage
durability.

## Next Phase

Template Publish Accepted Version Metadata Gate.

Proceed there because publish validation evidence is accepted and can be
represented without package/document schema changes.

If a later gate discovers accepted version metadata cannot be represented
without schema changes, it must stop and proceed to a dedicated Template
Version Schema Decision Gate.

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

- The publish/version boundary is confirmed accepted.
- Draft template identity remains separate from published template version
  identity.
- Variable Schema / Data Contract and Render API Contract remain deferred.
- The candidate is canonical package v2/document v3.
- JSON-safe validation evidence exists for package parse, graph diagnostics,
  key/data diagnostics, export-readiness, measurement, and rejected blockers.
- Retention pointers exist for source package/template snapshot and validation
  evidence.
- Rejected publish attempts require explicit blockers and do not mutate
  canonical package schema.
- The next phase is Template Publish Accepted Version Metadata Gate.

## FAIL-BLOCKER

None for this evidence gate.

The next gate must not proceed if accepted version metadata requires
package/document schema mutation, backend production routes, storage durability
claims, renderer artifact bytes, auth/authz behavior, Variable Schema / Data
Contract, or Render API Contract.

## RISK

- Export-readiness is `ready-with-warnings`, so accepted version metadata must
  retain warning visibility.
- Retention pointers are repo-local placeholders, not production storage
  durability.
- The published version id format is still a candidate until the metadata gate
  accepts it.

## UNKNOWN

- Final production storage owner for source package snapshots.
- Final accepted version metadata persistence shape.
- Whether later Variable Schema or Render API contracts require additional
  metadata references.

## Files Changed

- `docs/TEMPLATE_PUBLISH_VALIDATION_EVIDENCE_GATE.md`
- `fixtures/template-publish-validation-evidence.v1.json`
- `tests/templatePublishValidationEvidenceGate.test.ts`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`
- pointer guard tests

## Behavior Changed

No runtime behavior changed. This phase records validation evidence and
traceability only.

## Tests Run

- `npm.cmd test -- tests/templatePublishValidationEvidenceGate.test.ts tests/templatePublishVersionBoundaryGate.test.ts`
- `npm.cmd test`
- `npm.cmd run type-check`
- `npm.cmd run check`

## Risks Left

- Populate accepted version metadata in the next gate.
- Keep schema decisions behind a dedicated Template Version Schema Decision
  Gate if metadata needs cannot be represented externally.
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
