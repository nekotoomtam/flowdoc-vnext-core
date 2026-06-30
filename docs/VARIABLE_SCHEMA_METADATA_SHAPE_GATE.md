# Variable Schema Metadata Shape Gate

Status: Variable Schema Metadata Shape Gate complete.

This phase uses Variable Reference Discovery Gate as source of truth. It
defines a JSON-safe variable schema metadata shape from the discovered
candidate variables without implementing the full Variable Schema / Data
Contract.

This is a metadata-shape evidence gate only. It does not mutate
package/document schema, implement Data Contract Validation Policy, implement
Required / Missing / Default Value Policy, implement Render API Contract,
publish through backend routes, claim storage durability, produce renderer
artifact bytes, or add auth/authz behavior.

## Source Of Truth

- `docs/VARIABLE_REFERENCE_DISCOVERY_GATE.md`
- `fixtures/variable-reference-discovery.v1.json`
- `docs/VARIABLE_SCHEMA_DATA_CONTRACT_PLANNING_GATE.md`
- `fixtures/template-publish-accepted-version-metadata.v1.json`
- `fixtures/product-report-vnext.flowdoc.json`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`

## Discovery Confirmation

Variable Reference Discovery Gate is complete.

The discovery evidence fixture exists:

```text
fixtures/variable-reference-discovery.v1.json
```

The attachment target is confirmed:

- published template version identity:
  `template-product-report-vnext@v1`;
- accepted validation evidence pointer:
  `repo://fixtures/template-publish-validation-evidence.v1.json`;
- source snapshot retention pointer:
  `repo://fixtures/product-report-vnext.flowdoc.json`.

Discovery summary:

- field-ref occurrence count: `11`;
- candidate variable count: `6`;
- registry field count: `6`;
- unresolved reference count: `0`;
- unsupported reference count: `0`;
- duplicate candidate id count: `0`.

Candidate variable ids:

- `customer.name`;
- `customer.segment`;
- `prepared.by`;
- `report.period`;
- `report.riskLevel`;
- `report.total`.

## Metadata Shape Fixture

The JSON-safe metadata shape evidence is:

```text
fixtures/variable-schema-metadata-shape.v1.json
```

Each candidate variable metadata row carries:

- `variableId`;
- `sourceFieldKey`;
- `valueTypeCandidate`;
- `displayLabelCandidate`;
- `occurrenceCount`;
- `occurrenceContextSummary`;
- `registryStatus`;
- `requiredPolicyStatus`;
- `defaultPolicyStatus`;
- `validationPolicyStatus`;
- `compatibilityStatus`.

The current `variableId` policy uses the source field key until a later alias
or compatibility policy exists. This keeps the shape expressible as JSON-safe
metadata and avoids package/document schema mutation.

## Policy Statuses

Required, missing-value, default-value, validation, and compatibility behavior
remain deferred policy work.

The shape records policy status only:

```text
requiredPolicyStatus = deferred-policy
defaultPolicyStatus = deferred-policy
validationPolicyStatus = deferred-until-data-contract-validation-policy-gate
compatibilityStatus = pending-published-template-version-policy
```

These fields are not runtime policy implementation.

## Table-Cell Occurrence Preservation

Table-cell occurrence context is preserved for:

- `metric-value-total-field`;
- `metric-value-risk-field`.

The metadata shape preserves table id, row id, cell id, variable id, and
location summary for those field refs so Data Contract Validation Policy can
reason about table-bound values later.

## Next Phase

Data Contract Validation Policy Gate.

Proceed there because the metadata shape is accepted and does not require
package/document schema mutation.

If a later metadata shape cannot remain external JSON-safe metadata, route to
Template Version Schema Decision Gate.

If discovered variables need unresolved aliases or display metadata before
shaping, route to Variable Metadata Resolution Decision Gate.

## Explicit Non-Work

- No package/document schema mutation is made.
- No full Variable Schema / Data Contract is implemented.
- No Data Contract Validation Policy is implemented.
- No Required / Missing / Default Value Policy is implemented.
- No Render API Contract is implemented.
- No backend production routes are implemented.
- No production storage durability is claimed.
- No renderer artifact bytes are produced.
- No auth/authz behavior is added.
- No `measureVNextText(...)` replacement happens.
- No full measurement production readiness is claimed.
- No pagination mutation happens.
- No production renderer-backed measurement binding happens.
- No production PDF/DOCX renderer work is added.
- No production contenteditable implementation is added.
- No collaboration/offline behavior is added.
- No legacy editor runtime is copied.

## PASS

- Variable Reference Discovery Gate is confirmed complete.
- Discovery evidence fixture exists.
- Attachment target pointers are confirmed.
- Discovery summary counts match the source discovery fixture.
- Candidate variable ids match the source discovery fixture.
- JSON-safe metadata rows are defined for all six candidate variables.
- Each row carries variable id, source field key, value type candidate,
  display label candidate, occurrence count, occurrence context summary,
  registry status, and deferred policy status fields.
- Table-cell occurrence context is preserved for
  `metric-value-total-field` and `metric-value-risk-field`.
- Required/default/missing-value behavior remains deferred policy.
- Data Contract Validation Policy remains deferred.
- Render API Contract remains deferred.
- Package/document schema is not mutated.
- The next phase is Data Contract Validation Policy Gate.

## FAIL-BLOCKER

None for this metadata-shape gate.

Future work must route to Template Version Schema Decision Gate if variable
metadata requires package/document schema mutation.

Future work must route to Variable Metadata Resolution Decision Gate if alias
or display metadata cannot safely use discovered registry facts.

## RISK

- Required/default/missing-value behavior is not implemented yet.
- Data Contract Validation Policy is not implemented yet.
- Compatibility policy with published template versions remains pending.
- Render API Contract remains deferred.
- Measurement remains a mini checkpoint only; full v1 measurement production
  readiness is still blocked.

## UNKNOWN

- Final required/default/missing-value policy.
- Final data contract validation policy.
- Whether aliases or versioned display labels will be required later.
- Final production owner for variable contract records.

## Files Changed

- `docs/VARIABLE_SCHEMA_METADATA_SHAPE_GATE.md`
- `fixtures/variable-schema-metadata-shape.v1.json`
- `tests/variableSchemaMetadataShapeGate.test.ts`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`
- pointer guard tests

## Behavior Changed

No runtime behavior changed. This phase records JSON-safe metadata-shape
evidence and next-lane routing only.

## Tests Run

- `npm.cmd test -- tests/variableSchemaMetadataShapeGate.test.ts tests/variableReferenceDiscoveryGate.test.ts`
- `npm.cmd test`
- `npm.cmd run type-check`
- `npm.cmd run check`

## Risks Left

- Define Data Contract Validation Policy from accepted metadata shape.
- Keep Required / Missing / Default Value Policy deferred until validation
  policy is clear.
- Keep Render API Contract deferred until variable/data contract evidence is
  clear.

## Intentionally Not Changed

- package/document schema
- full Variable Schema / Data Contract implementation
- Data Contract Validation Policy implementation
- Required / Missing / Default Value Policy implementation
- Render API Contract implementation
- backend routes/storage/auth/authz
- renderer artifact production
- `measureVNextText(...)`
- pagination behavior
- production renderer-backed measurement binding
- PDF/DOCX renderer behavior
- production contenteditable
- collaboration/offline behavior
