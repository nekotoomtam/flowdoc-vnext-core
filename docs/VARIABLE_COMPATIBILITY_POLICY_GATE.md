# Variable Compatibility Policy Gate

Status: Compatibility Policy With Published Template Versions Gate complete.

This phase uses Required / Missing / Default Value Policy Gate as source of
truth. It defines JSON-safe compatibility policy metadata between the
variable/data contract evidence and accepted published template versions
without implementing runtime data validation, runtime default application,
runtime compatibility enforcement, or Render API Contract.

This is a policy metadata gate only. It does not mutate package/document
schema, implement the full Variable Schema / Data Contract, publish through
backend routes, claim storage durability, produce renderer artifact bytes,
add auth/authz behavior, or replace `measureVNextText(...)`.

## Source Of Truth

- `docs/REQUIRED_MISSING_DEFAULT_VALUE_POLICY_GATE.md`
- `fixtures/required-missing-default-value-policy.v1.json`
- `docs/DATA_CONTRACT_VALIDATION_POLICY_GATE.md`
- `fixtures/data-contract-validation-policy.v1.json`
- `fixtures/template-publish-accepted-version-metadata.v1.json`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`

## Required Missing Default Confirmation

Required / Missing / Default Value Policy Gate is complete.

The policy fixture exists:

```text
fixtures/required-missing-default-value-policy.v1.json
```

The source policy status is:

```text
accepted-policy-metadata-only
```

Candidate variables are confirmed:

- `customer.name`;
- `customer.segment`;
- `prepared.by`;
- `report.period`;
- `report.riskLevel`;
- `report.total`.

Per-variable required/missing/default policy is confirmed:

- `customer.name`: required, default metadata `Customer`, missing warns;
- `customer.segment`: optional, default metadata `Segment`, missing warns;
- `prepared.by`: optional, default metadata `Team`, missing warns;
- `report.period`: required, default metadata `Current Period`, missing
  warns;
- `report.riskLevel`: required, default metadata `Normal`, missing warns, and
  table-cell context mismatch blocks;
- `report.total`: required, no default metadata, missing blocks, and
  table-cell context mismatch blocks.

Extra variables remain `valid-with-warnings` unless they conflict with known
variable ids.

Runtime default application is not implemented.

## Policy Fixture

The JSON-safe compatibility policy evidence is:

```text
fixtures/variable-compatibility-policy.v1.json
```

The policy status is:

```text
accepted-policy-metadata-only
```

This means compatibility status vocabulary, dimensions, blockers, warnings,
and next-lane routing are accepted as metadata. It does not mean runtime
compatibility enforcement is implemented.

## Compatibility Statuses

Accepted compatibility statuses:

- `compatible`;
- `compatible-with-warnings`;
- `incompatible-blocked`;
- `unknown`.

## Compatibility Dimensions

The policy defines these dimensions:

- variable id stability;
- value type candidate stability;
- required/optional policy changes;
- default metadata changes;
- table-cell context changes;
- removed variable behavior;
- added variable behavior;
- renamed/aliased variable behavior;
- published template version identity match.

## Compatibility Policy Direction

Policy decisions:

- same published template version identity is `compatible`;
- published template version mismatch is `incompatible-blocked` unless an
  explicit superseding-version record exists;
- a known variable id change is `incompatible-blocked` unless an explicit
  alias compatibility record exists;
- changing value type candidate is `incompatible-blocked` unless a later
  accepted compatibility metadata phase explicitly accepts it;
- changing display label only is `compatible-with-warnings`;
- adding optional variables is `compatible-with-warnings`;
- adding required variables without default metadata is
  `incompatible-blocked`;
- adding required variables with default metadata is
  `compatible-with-warnings`;
- removing a required variable is `incompatible-blocked`;
- removing an optional variable is `compatible-with-warnings`;
- changing table-cell context for table-bound variables is
  `incompatible-blocked`;
- aliases or compatibility labels that are required but absent route to
  Variable Metadata Resolution Decision Gate.

## Blocker Vocabulary

Incompatible version-change blockers:

- `missing-published-template-version-identity`;
- `published-template-version-mismatch`;
- `missing-superseding-version-record`;
- `known-variable-id-changed`;
- `removed-required-variable`;
- `required-variable-added-without-default-metadata`;
- `required-policy-tightened-without-compatibility-record`;
- `value-type-candidate-changed`;
- `table-cell-context-changed`;
- `renamed-variable-without-alias-record`;
- `invalid-alias-target`;
- `metadata-shape-context-mismatch`;
- `schema-mutation-required`;
- `unknown-compatibility-dimension`.

## Warning Vocabulary

Compatible-with-warnings changes:

- `display-label-changed`;
- `optional-variable-added`;
- `optional-variable-removed`;
- `default-metadata-changed`;
- `default-metadata-added`;
- `default-metadata-removed-for-optional-variable`;
- `required-variable-added-with-default-metadata`;
- `required-policy-loosened`;
- `alias-compatibility-record-present`;
- `superseding-version-record-present`;
- `extra-variable-present`.

## Next Phase

Variable Schema / Data Contract Close Audit.

Proceed there because compatibility policy metadata is accepted without
package/document schema mutation.

If compatibility policy requires schema mutation, route to Template Version
Schema Decision Gate.

If aliases or compatibility labels are required before policy acceptance,
route to Variable Metadata Resolution Decision Gate.

## Explicit Non-Work

- No package/document schema mutation is made.
- No runtime data validation is implemented.
- No runtime default application is implemented.
- No runtime compatibility enforcement is implemented.
- No full Variable Schema / Data Contract is implemented.
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

- Required / Missing / Default Value Policy Gate is confirmed complete.
- Required/missing/default policy fixture exists.
- Candidate variables are confirmed.
- Per-variable required/missing/default policy is confirmed.
- Extra-variable policy is confirmed.
- Runtime default application remains unimplemented.
- JSON-safe compatibility statuses are defined.
- Compatibility dimensions are defined.
- Blocker vocabulary is defined.
- Warning vocabulary is defined.
- Table-cell context changes remain blocked for table-bound variables.
- Render API Contract remains deferred.
- Runtime validation remains deferred.
- Package/document schema is not mutated.
- The next phase is Variable Schema / Data Contract Close Audit.

## FAIL-BLOCKER

None for this policy-metadata gate.

Future work must route to Template Version Schema Decision Gate if
compatibility policy requires package/document schema mutation.

Future work must route to Variable Metadata Resolution Decision Gate if alias
or compatibility labels are required before policy acceptance.

## RISK

- Runtime data validation is not implemented.
- Runtime default application is not implemented.
- Runtime compatibility enforcement is not implemented.
- Render API Contract remains deferred.
- Measurement remains a mini checkpoint only; full v1 measurement production
  readiness is still blocked.

## UNKNOWN

- Final runtime owner for compatibility enforcement.
- Final Render API payload contract.
- Whether later schema evolution will need alias records in canonical package
  metadata.
- Whether future published template versions need a dedicated compatibility
  lifecycle store.

## Files Changed

- `docs/VARIABLE_COMPATIBILITY_POLICY_GATE.md`
- `fixtures/variable-compatibility-policy.v1.json`
- `tests/variableCompatibilityPolicyGate.test.ts`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`
- pointer guard tests

## Behavior Changed

No runtime behavior changed. This phase records JSON-safe variable/template
compatibility policy metadata and next-lane routing only.

## Tests Run

- `npm.cmd test -- tests/variableCompatibilityPolicyGate.test.ts tests/requiredMissingDefaultValuePolicyGate.test.ts`
- `npm.cmd test`
- `npm.cmd run type-check`
- `npm.cmd run check`

## Risks Left

- Close the Variable Schema / Data Contract mini lane.
- Keep Render API Contract deferred until variable/data contract evidence is
  clear.
- Keep runtime validation and compatibility enforcement deferred until a later
  binding phase explicitly accepts them.

## Intentionally Not Changed

- package/document schema
- runtime data validation
- runtime default application
- runtime compatibility enforcement
- full Variable Schema / Data Contract implementation
- Render API Contract implementation
- backend routes/storage/auth/authz
- renderer artifact production
- `measureVNextText(...)`
- pagination behavior
- production renderer-backed measurement binding
- PDF/DOCX renderer behavior
- production contenteditable
- collaboration/offline behavior
- legacy editor runtime
