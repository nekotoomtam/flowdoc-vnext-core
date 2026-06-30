# Data Contract Validation Policy Gate

Status: Data Contract Validation Policy Gate complete.

This phase uses Variable Schema Metadata Shape Gate as source of truth. It
defines a JSON-safe data contract validation policy vocabulary from the
accepted metadata shape without implementing runtime data validation or Render
API Contract.

This is a policy vocabulary gate only. It does not mutate package/document
schema, implement runtime data validation, implement the full Variable Schema /
Data Contract, implement Required / Missing / Default Value behavior,
implement Compatibility Policy With Published Template Versions, implement
Render API Contract, publish through backend routes, claim storage durability,
produce renderer artifact bytes, or add auth/authz behavior.

## Source Of Truth

- `docs/VARIABLE_SCHEMA_METADATA_SHAPE_GATE.md`
- `fixtures/variable-schema-metadata-shape.v1.json`
- `docs/VARIABLE_REFERENCE_DISCOVERY_GATE.md`
- `fixtures/variable-reference-discovery.v1.json`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`

## Metadata Shape Confirmation

Variable Schema Metadata Shape Gate is complete.

The metadata shape fixture exists:

```text
fixtures/variable-schema-metadata-shape.v1.json
```

Candidate variables are confirmed:

- `customer.name`;
- `customer.segment`;
- `prepared.by`;
- `report.period`;
- `report.riskLevel`;
- `report.total`.

The metadata shape carries accepted variable metadata rows for all six
candidate variables and preserves table-cell occurrence context for:

- `metric-value-total-field`;
- `metric-value-risk-field`.

## Policy Fixture

The JSON-safe data contract validation policy evidence is:

```text
fixtures/data-contract-validation-policy.v1.json
```

The policy status is:

```text
accepted-vocabulary-only
```

This means the vocabulary, row shape, result statuses, blockers, warnings, and
routing are accepted. It does not mean runtime payload validation is
implemented.

## Validation Vocabulary

The policy defines JSON-safe vocabulary for:

- type validation status;
- required-field validation status;
- missing-value validation status;
- default-value handling status;
- unsupported-value status;
- unknown-variable status;
- extra-variable policy;
- table-cell value policy status.

Accepted validation result statuses:

- `valid`;
- `valid-with-warnings`;
- `blocked`.

## Blocker Vocabulary

Invalid data contract payload blockers are named as:

- `invalid-payload-shape`;
- `missing-published-template-version-identity`;
- `metadata-shape-context-mismatch`;
- `unknown-variable`;
- `type-mismatch`;
- `unsupported-value`;
- `missing-required-value`;
- `invalid-variable-id`;
- `table-cell-context-mismatch`;
- `schema-mutation-required`.

Warnings are named as:

- `extra-variable-present`;
- `default-value-available-but-not-applied`;
- `missing-value-policy-deferred`.

## Variable Policy Rows

Each candidate variable receives a JSON-safe policy row carrying:

- variable id;
- source field key;
- value type candidate;
- display label candidate;
- occurrence count;
- occurrence context summary;
- type validation status;
- required-field validation status;
- missing-value validation status;
- default-value handling status;
- unsupported-value status;
- unknown-variable status;
- extra-variable policy;
- table-cell value policy status.

Required, missing-value, and default-value behavior remains deferred. This
gate accepts vocabulary only so a later Required / Missing / Default Value
Policy Gate can choose concrete behavior.

## Table-Cell Occurrence Preservation

Table-cell occurrence context is preserved for:

- `metric-value-total-field`;
- `metric-value-risk-field`.

Their table id, row id, cell id, variable id, and location summary remain in
the policy fixture. Their table-cell value policy status is:

```text
table-cell-context-preserved-validation-deferred
```

## Next Phase

Required / Missing / Default Value Policy Gate.

Proceed there because the data contract validation policy vocabulary is
accepted without package/document schema mutation.

If validation policy requires schema mutation, route to Template Version
Schema Decision Gate.

If variable metadata is insufficient for validation policy, route to Variable
Metadata Resolution Decision Gate.

## Explicit Non-Work

- No package/document schema mutation is made.
- No runtime data validation is implemented.
- No full Variable Schema / Data Contract is implemented.
- No Required / Missing / Default Value behavior is implemented.
- No Compatibility Policy is implemented.
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

- Variable Schema Metadata Shape Gate is confirmed complete.
- Metadata shape fixture exists.
- Candidate variables are confirmed.
- JSON-safe data contract validation policy vocabulary is defined.
- Accepted validation result statuses are defined as `valid`,
  `valid-with-warnings`, and `blocked`.
- Blocker vocabulary for invalid data contract payloads is defined.
- Table-cell occurrence context is preserved for
  `metric-value-total-field` and `metric-value-risk-field`.
- Required / Missing / Default Value detailed behavior remains deferred.
- Compatibility Policy With Published Template Versions remains deferred.
- Render API Contract remains deferred.
- Package/document schema is not mutated.
- The next phase is Required / Missing / Default Value Policy Gate.

## FAIL-BLOCKER

None for this policy-vocabulary gate.

Future work must route to Template Version Schema Decision Gate if validation
policy requires package/document schema mutation.

Future work must route to Variable Metadata Resolution Decision Gate if
metadata rows are insufficient for concrete validation policy.

## RISK

- Runtime data validation is not implemented.
- Required/default/missing-value behavior is not implemented yet.
- Compatibility policy with published template versions remains pending.
- Render API Contract remains deferred.
- Measurement remains a mini checkpoint only; full v1 measurement production
  readiness is still blocked.

## UNKNOWN

- Final required/default/missing-value behavior.
- Final compatibility policy with published template versions.
- Final runtime owner for validation execution.
- Final Render API payload contract.

## Files Changed

- `docs/DATA_CONTRACT_VALIDATION_POLICY_GATE.md`
- `fixtures/data-contract-validation-policy.v1.json`
- `tests/dataContractValidationPolicyGate.test.ts`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`
- pointer guard tests

## Behavior Changed

No runtime behavior changed. This phase records JSON-safe validation policy
vocabulary and next-lane routing only.

## Tests Run

- `npm.cmd test -- tests/dataContractValidationPolicyGate.test.ts tests/variableSchemaMetadataShapeGate.test.ts`
- `npm.cmd test`
- `npm.cmd run type-check`
- `npm.cmd run check`

## Risks Left

- Define concrete Required / Missing / Default Value Policy.
- Keep Compatibility Policy With Published Template Versions deferred until
  required/default behavior is clear.
- Keep Render API Contract deferred until variable/data contract evidence is
  clear.

## Intentionally Not Changed

- package/document schema
- runtime data validation
- full Variable Schema / Data Contract implementation
- Required / Missing / Default Value behavior
- Compatibility Policy
- Render API Contract implementation
- backend routes/storage/auth/authz
- renderer artifact production
- `measureVNextText(...)`
- pagination behavior
- production renderer-backed measurement binding
- PDF/DOCX renderer behavior
- production contenteditable
- collaboration/offline behavior
