# Required Missing Default Value Policy Gate

Status: Required / Missing / Default Value Policy Gate complete.

This phase uses Data Contract Validation Policy Gate as source of truth. It
defines concrete JSON-safe Required / Missing / Default Value policy metadata
for the accepted candidate variables without implementing runtime data
validation or Render API Contract.

This is a policy metadata gate only. It does not mutate package/document
schema, implement runtime data validation, apply defaults at runtime,
implement the full Variable Schema / Data Contract, implement Compatibility
Policy With Published Template Versions, implement Render API Contract,
publish through backend routes, claim storage durability, produce renderer
artifact bytes, or add auth/authz behavior.

## Source Of Truth

- `docs/DATA_CONTRACT_VALIDATION_POLICY_GATE.md`
- `fixtures/data-contract-validation-policy.v1.json`
- `docs/VARIABLE_SCHEMA_METADATA_SHAPE_GATE.md`
- `fixtures/variable-schema-metadata-shape.v1.json`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`

## Validation Policy Confirmation

Data Contract Validation Policy Gate is complete.

The policy fixture exists:

```text
fixtures/data-contract-validation-policy.v1.json
```

The source policy status is:

```text
accepted-vocabulary-only
```

Candidate variables are confirmed:

- `customer.name`;
- `customer.segment`;
- `prepared.by`;
- `report.period`;
- `report.riskLevel`;
- `report.total`.

Validation result statuses are confirmed:

- `valid`;
- `valid-with-warnings`;
- `blocked`.

The blocker vocabulary includes:

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

## Policy Fixture

The JSON-safe required/missing/default policy evidence is:

```text
fixtures/required-missing-default-value-policy.v1.json
```

The policy status is:

```text
accepted-policy-metadata-only
```

This means the required status, missing-value behavior, default-value behavior,
blocking vs warning behavior, validation result status, and blocker/warning
mapping are accepted as JSON-safe policy metadata. It does not mean runtime
payload validation or runtime default application is implemented.

## Required Missing Default Policy

Policy rules:

- required variables with no default metadata block if missing;
- required variables with default metadata are `valid-with-warnings` if
  missing because defaults are not applied at runtime in this gate;
- optional variables are `valid-with-warnings` if missing;
- defaults are recorded as metadata only and are not applied at runtime;
- extra variables are `valid-with-warnings` with `extra-variable-present`
  unless they conflict with known variable ids;
- conflicts with known variable ids are blocked with `invalid-variable-id` or
  `type-mismatch`;
- table-cell context mismatch remains blocked with
  `table-cell-context-mismatch`.

Per-variable policy:

- `customer.name`: required, default metadata `Customer`, missing value
  warns with `default-value-available-but-not-applied`;
- `customer.segment`: optional, default metadata `Segment`, missing value
  warns with `default-value-available-but-not-applied`;
- `prepared.by`: optional, default metadata `Team`, missing value warns with
  `default-value-available-but-not-applied`;
- `report.period`: required, default metadata `Current Period`, missing value
  warns with `default-value-available-but-not-applied`;
- `report.riskLevel`: required, default metadata `Normal`, missing value
  warns with `default-value-available-but-not-applied`, and table-cell context
  mismatch blocks;
- `report.total`: required, no default metadata, missing value blocks with
  `missing-required-value`, and table-cell context mismatch blocks.

## Table-Cell Occurrence Preservation

Table-cell occurrence context is preserved for:

- `metric-value-total-field`;
- `metric-value-risk-field`.

Their table id, row id, cell id, variable id, and location summary remain in
the policy fixture. Their table-cell value policy status is:

```text
table-cell-context-mismatch-blocked
```

## Next Phase

Compatibility Policy With Published Template Versions Gate.

Proceed there because the required/missing/default value policy is accepted
without package/document schema mutation.

If policy requires schema mutation, route to Template Version Schema Decision
Gate.

If variable metadata is insufficient, route to Variable Metadata Resolution
Decision Gate.

## Explicit Non-Work

- No package/document schema mutation is made.
- No runtime data validation is implemented.
- No runtime default application is implemented.
- No full Variable Schema / Data Contract is implemented.
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

- Data Contract Validation Policy Gate is confirmed complete.
- Data contract validation policy fixture exists.
- Source policy status is `accepted-vocabulary-only`.
- Candidate variables are confirmed.
- Validation result statuses are confirmed.
- Blocker vocabulary is confirmed.
- Concrete JSON-safe required/missing/default policy rows are defined for all
  six candidate variables.
- Blocking vs warning behavior is defined.
- Default-value behavior is metadata-only and does not apply defaults at
  runtime.
- Extra variables are warnings unless they conflict with known variable ids.
- Table-cell occurrence context is preserved for `metric-value-total-field`
  and `metric-value-risk-field`.
- Compatibility Policy With Published Template Versions remains deferred with
  status only.
- Render API Contract remains deferred.
- Package/document schema is not mutated.
- The next phase is Compatibility Policy With Published Template Versions
  Gate.

## FAIL-BLOCKER

None for this policy-metadata gate.

Future work must route to Template Version Schema Decision Gate if policy
requires package/document schema mutation.

Future work must route to Variable Metadata Resolution Decision Gate if
metadata rows are insufficient for compatibility policy.

## RISK

- Runtime data validation is not implemented.
- Runtime default application is not implemented.
- Compatibility policy with published template versions remains pending.
- Render API Contract remains deferred.
- Measurement remains a mini checkpoint only; full v1 measurement production
  readiness is still blocked.

## UNKNOWN

- Final compatibility policy with published template versions.
- Final runtime owner for validation execution.
- Final Render API payload contract.
- Whether later schema evolution will need aliases or compatibility records.

## Files Changed

- `docs/REQUIRED_MISSING_DEFAULT_VALUE_POLICY_GATE.md`
- `fixtures/required-missing-default-value-policy.v1.json`
- `tests/requiredMissingDefaultValuePolicyGate.test.ts`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`
- pointer guard tests

## Behavior Changed

No runtime behavior changed. This phase records JSON-safe required/missing/
default policy metadata and next-lane routing only.

## Tests Run

- `npm.cmd test -- tests/requiredMissingDefaultValuePolicyGate.test.ts tests/dataContractValidationPolicyGate.test.ts`
- `npm.cmd test`
- `npm.cmd run type-check`
- `npm.cmd run check`

## Risks Left

- Define Compatibility Policy With Published Template Versions.
- Keep Render API Contract deferred until variable/data contract evidence is
  clear.
- Keep runtime validation deferred until a later binding phase explicitly
  accepts it.

## Intentionally Not Changed

- package/document schema
- runtime data validation
- runtime default application
- full Variable Schema / Data Contract implementation
- Compatibility Policy implementation
- Render API Contract implementation
- backend routes/storage/auth/authz
- renderer artifact production
- `measureVNextText(...)`
- pagination behavior
- production renderer-backed measurement binding
- PDF/DOCX renderer behavior
- production contenteditable
- collaboration/offline behavior
