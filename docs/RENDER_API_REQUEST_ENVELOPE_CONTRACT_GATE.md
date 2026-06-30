# Render API Request Envelope Contract Gate

Status: Render API Request Envelope Contract Gate complete.

This gate uses Render API Contract Planning Gate as source of truth. It defines
the JSON-safe Render API request envelope contract for the accepted published
template version and accepted variable/data contract evidence.

This is a contract metadata gate only. It does not implement backend
production routes, Render API runtime behavior, renderer artifact byte
production, production storage durability, auth/authz behavior, runtime data
validation, runtime default application, runtime compatibility enforcement,
package/document schema mutation, or actual render execution.

## Source Of Truth

- `docs/RENDER_API_CONTRACT_PLANNING_GATE.md`
- `fixtures/template-publish-accepted-version-metadata.v1.json`
- `fixtures/variable-reference-discovery.v1.json`
- `fixtures/variable-schema-metadata-shape.v1.json`
- `fixtures/data-contract-validation-policy.v1.json`
- `fixtures/required-missing-default-value-policy.v1.json`
- `fixtures/variable-compatibility-policy.v1.json`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`

## Planning Confirmation

Render API Contract Planning Gate is complete.

The selected first sub-lane is:

```text
Render API request envelope contract
```

The accepted published template version target is:

```text
template-product-report-vnext@v1
```

Accepted identity facts:

- `templateId="template-product-report-vnext"`;
- `templateVersionId="template-product-report-vnext@v1"`;
- `versionOrdinal=1`.

Source snapshot retention pointer:

```text
repo://fixtures/product-report-vnext.flowdoc.json
```

Accepted validation evidence pointer:

```text
repo://fixtures/template-publish-validation-evidence.v1.json
```

Variable/data contract evidence pointers:

- `fixtures/variable-reference-discovery.v1.json`;
- `fixtures/variable-schema-metadata-shape.v1.json`;
- `fixtures/data-contract-validation-policy.v1.json`;
- `fixtures/required-missing-default-value-policy.v1.json`;
- `fixtures/variable-compatibility-policy.v1.json`.

Candidate variable ids are confirmed:

- `customer.name`;
- `customer.segment`;
- `prepared.by`;
- `report.period`;
- `report.riskLevel`;
- `report.total`.

## Contract Fixture

The JSON-safe request envelope contract metadata is recorded at:

```text
fixtures/render-api-request-envelope-contract.v1.json
```

The fixture records:

- `requestEnvelopeId="render-api-request-envelope-contract-v1"`;
- `requestEnvelopeVersion=1`;
- `templateVersionIdentity`;
- `sourceSnapshotRetentionPointer`;
- `validationEvidencePointer`;
- `variableDataContractEvidencePointers`;
- `variablePayloadContainer`;
- `variablePayloadPolicyReference`;
- `compatibilityPolicyReference`;
- `renderIntent`;
- `clientRequestId` / `correlationId` policy;
- `idempotencyPolicyName`;
- `duplicateRequestPolicyName`;
- malformed envelope blocker vocabulary.

## Variable Payload Container

The variable payload container is:

```text
variables
```

Container shape:

```text
json-object-keyed-by-variable-id
```

Allowed variable ids:

- `customer.name`;
- `customer.segment`;
- `prepared.by`;
- `report.period`;
- `report.riskLevel`;
- `report.total`.

Required variable ids:

- `customer.name`;
- `report.period`;
- `report.riskLevel`;
- `report.total`.

Optional variable ids:

- `customer.segment`;
- `prepared.by`.

Required without default metadata:

- `report.total`.

Table-cell-bound variable ids:

- `report.riskLevel`;
- `report.total`.

Runtime defaults are not applied in this gate. Runtime data validation is not
implemented in this gate.

## Validation Status Vocabulary

Request envelope validation status vocabulary:

- `envelope-valid`;
- `envelope-valid-with-warnings`;
- `envelope-blocked`.

The envelope maps policy statuses as metadata only:

- `valid` -> `envelope-valid`;
- `valid-with-warnings` -> `envelope-valid-with-warnings`;
- `blocked` -> `envelope-blocked`.

## Malformed Envelope Blockers

Malformed envelope blocker vocabulary:

- `missing-template-version-identity`;
- `unknown-template-version-identity`;
- `missing-variable-payload`;
- `invalid-variable-payload-shape`;
- `missing-variable-data-contract-evidence`;
- `variable-data-contract-context-mismatch`;
- `compatibility-policy-context-mismatch`;
- `invalid-client-request-id`;
- `duplicate-request-policy-missing`;
- `schema-mutation-required`.

## Correlation And Idempotency

Correlation metadata:

- `clientRequestId` is required;
- `correlationId` is optional;
- client request id format policy is `non-empty-json-string`;
- invalid client request id blocks the envelope with
  `invalid-client-request-id`.

Idempotency metadata:

- idempotency policy name:
  `render-api-request-envelope-idempotency-v1`;
- idempotency key source:
  `clientRequestId-plus-templateVersionId`;
- runtime idempotency enforcement is not implemented.

Duplicate request metadata:

- duplicate request policy name:
  `render-api-duplicate-request-policy-v1`;
- duplicate request runtime handling is not implemented.

## Deferred Contract Lanes

Response/status contract remains deferred to:

```text
Render API Response / Status Contract Gate
```

Render-readiness validation policy remains deferred.

Artifact pointer / job status placeholder policy remains deferred.

Error/blocker vocabulary is covered only for malformed request envelopes in
this gate. Broader route, storage, auth, renderer, and runtime failure
vocabulary remains deferred.

## Route And Fallback Decisions

Next phase: Render API Response / Status Contract Gate.

If the request envelope contract is accepted, proceed to Render API Response /
Status Contract Gate.

If request envelope work requires backend routes, storage durability,
auth/authz, renderer artifact bytes, or actual render execution, route to the
appropriate dedicated production gate.

If request envelope work requires package/document schema mutation, route to
Template Version Schema Decision Gate.

## Explicit Non-Work

- No backend production routes are implemented.
- No Render API runtime is implemented.
- No renderer artifact bytes are produced.
- No production storage durability is claimed.
- No auth/authz behavior is added.
- No runtime data validation is implemented.
- No defaults are applied at runtime.
- No runtime compatibility enforcement is implemented.
- No package/document schema mutation is made.
- No `measureVNextText(...)` replacement happens.
- No full measurement production readiness is claimed.
- No pagination mutation happens.
- No production renderer-backed measurement binding happens.
- No production PDF/DOCX renderer work is added.
- No production contenteditable implementation is added.
- No collaboration/offline behavior is added.
- No legacy editor runtime is copied.

## PASS

- Render API Contract Planning Gate is complete.
- Selected first sub-lane is Render API request envelope contract.
- Accepted published template version target is confirmed.
- Source snapshot retention pointer is confirmed.
- Accepted validation evidence pointer is confirmed.
- Variable/data contract evidence pointers are confirmed.
- Candidate variable ids are confirmed.
- JSON-safe request envelope contract fixture exists.
- Variable payload container shape is defined against candidate variable ids.
- Request envelope validation status vocabulary is defined.
- Malformed envelope blocker vocabulary is defined.
- Response/status contract remains deferred.
- Render-readiness validation policy remains deferred.
- Artifact pointer / job status placeholder policy remains deferred.
- Backend routes, storage durability, auth/authz, renderer artifact bytes,
  actual render execution, and runtime validation remain out of scope.
- Package/document schema is not mutated.

## FAIL-BLOCKER

None for this gate.

Future work must route to a dedicated production gate if it needs backend
routes, storage durability, auth/authz, renderer artifact bytes, or actual
render execution.

Future work must route to Template Version Schema Decision Gate if the request
envelope cannot be represented without package/document schema mutation.

## RISK

- Request envelope metadata is accepted, but runtime validation is still not
  implemented.
- Runtime default application is still deferred.
- Runtime compatibility enforcement is still deferred.
- Response/status contract is not accepted yet.
- Render-readiness validation policy is not accepted yet.
- Artifact pointer / job status placeholder policy is not accepted yet.
- Measurement remains a mini checkpoint only; full v1 measurement production
  readiness is still blocked.

## UNKNOWN

- Final backend route owner.
- Final response/status shape.
- Final render-readiness validation owner.
- Final job/artifact pointer lifecycle owner.
- Final production storage/auth/authz boundaries.

## Files Changed

- `docs/RENDER_API_REQUEST_ENVELOPE_CONTRACT_GATE.md`
- `fixtures/render-api-request-envelope-contract.v1.json`
- `tests/renderApiRequestEnvelopeContractGate.test.ts`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`
- pointer guard tests

## Behavior Changed

No runtime behavior changed. This phase records request envelope contract
metadata and next-lane routing only.

## Tests Run

- `npm.cmd test -- tests/renderApiRequestEnvelopeContractGate.test.ts tests/renderApiContractPlanningGate.test.ts`
- `npm.cmd test`
- `npm.cmd run type-check`
- `npm.cmd run check`

## Risks Left

- Define response/status behavior without implementing backend routes or
  renderer execution.
- Keep runtime validation and compatibility enforcement deferred until a later
  binding phase explicitly accepts them.
- Keep production readiness claims blocked until production routes, storage,
  auth/authz, renderer behavior, and full measurement evidence are accepted.

## Intentionally Not Changed

- package/document schema
- backend routes/storage/auth/authz
- Render API runtime
- renderer artifact production
- runtime data validation
- runtime default application
- runtime compatibility enforcement
- full Variable Schema / Data Contract runtime behavior
- `measureVNextText(...)`
- pagination behavior
- production renderer-backed measurement binding
- PDF/DOCX renderer behavior
- production contenteditable
- collaboration/offline behavior
- legacy editor runtime
