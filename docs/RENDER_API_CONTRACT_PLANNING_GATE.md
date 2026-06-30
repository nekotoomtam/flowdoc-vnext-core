# Render API Contract Planning Gate

Status: Render API Contract Planning Gate complete.

This planning gate uses Variable Schema / Data Contract Close Audit as source
of truth. It plans the Render API Contract lane against the accepted published
template version and accepted variable/data contract evidence before any Render
API implementation.

This is planning-only. It does not implement backend production routes, Render
API runtime behavior, renderer artifact byte production, production storage
durability, auth/authz behavior, runtime data validation, runtime default
application, runtime compatibility enforcement, package/document schema
mutation, or production measurement binding.

## Source Of Truth

- `docs/VARIABLE_SCHEMA_DATA_CONTRACT_CLOSE_AUDIT.md`
- `fixtures/template-publish-accepted-version-metadata.v1.json`
- `fixtures/variable-reference-discovery.v1.json`
- `fixtures/variable-schema-metadata-shape.v1.json`
- `fixtures/data-contract-validation-policy.v1.json`
- `fixtures/required-missing-default-value-policy.v1.json`
- `fixtures/variable-compatibility-policy.v1.json`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`

## Source Audit Confirmation

Variable Schema / Data Contract Close Audit is complete.

The Variable Schema / Data Contract mini lane is closed for a mini
infrastructure checkpoint only.

The accepted published template version target is:

```text
template-product-report-vnext@v1
```

The accepted target carries:

- `templateId="template-product-report-vnext"`;
- `templateVersionId="template-product-report-vnext@v1"`;
- `versionOrdinal=1`;
- `sourceSnapshotRetentionPointer="repo://fixtures/product-report-vnext.flowdoc.json"`;
- `validationEvidencePointer="repo://fixtures/template-publish-validation-evidence.v1.json"`;
- `validationEvidenceStatus="accepted"`;
- `measurementStatus="mini-checkpoint-only"`.

The variable/data contract evidence chain exists:

- `fixtures/variable-reference-discovery.v1.json`;
- `fixtures/variable-schema-metadata-shape.v1.json`;
- `fixtures/data-contract-validation-policy.v1.json`;
- `fixtures/required-missing-default-value-policy.v1.json`;
- `fixtures/variable-compatibility-policy.v1.json`.

Candidate variables are confirmed:

- `customer.name`;
- `customer.segment`;
- `prepared.by`;
- `report.period`;
- `report.riskLevel`;
- `report.total`.

Deferred behavior remains deferred:

- runtime data validation;
- runtime default application;
- runtime compatibility enforcement;
- full Variable Schema / Data Contract runtime behavior;
- Render API runtime behavior.

## Render API Contract Lane Ranking

1. Render API request envelope contract.
2. Render API response/status contract.
3. Render-readiness validation policy.
4. Artifact pointer / job status placeholder policy.
5. Error/blocker vocabulary.

### Selected First Sub-Lane

Render API request envelope contract.

Reason:

- response/status contract needs to describe responses to a stable request
  shape;
- render-readiness validation policy needs to know which request fields carry
  published template version identity, variable payload contract metadata, and
  retention pointers;
- artifact pointer and job status placeholders need a request envelope before
  they can safely define ownership and correlation fields;
- error/blocker vocabulary needs the envelope boundary to avoid mixing backend
  route failures with contract-shape failures.

## First Sub-Lane Evidence Requirements

The dedicated Render API Request Envelope Contract Gate must define JSON-safe
evidence for:

- request envelope id and version;
- published template version identity:
  `template-product-report-vnext@v1`;
- source snapshot retention pointer;
- accepted validation evidence pointer;
- variable/data contract evidence pointers;
- candidate variable id list;
- variable payload container shape;
- payload policy reference for required, missing, default, extra, unsupported,
  and table-cell-context behavior;
- compatibility policy reference for published template version matching;
- render intent fields, if needed, as metadata only;
- request correlation or client request id policy, if needed, as metadata only;
- idempotency and duplicate request policy names, if needed, as metadata only;
- explicit blocker vocabulary for malformed envelopes;
- explicit deferral of runtime validation, route handling, job execution,
  storage durability, auth/authz, and artifact byte production.

The first sub-lane may define fixture or metadata shape only if it remains
JSON-safe and does not mutate package/document schema.

## Deferred Lanes

Render API response/status contract is deferred because responses must be
anchored to a stable request envelope first.

Render-readiness validation policy is deferred because readiness checks need
the request envelope to identify template version identity, variable payload
metadata, and retained evidence pointers.

Artifact pointer / job status placeholder policy is deferred because artifact
and job correlation fields need request-envelope ownership and identity rules.

Error/blocker vocabulary is deferred as a standalone lane because the request
envelope must first define which failures are contract-shape failures instead
of backend, storage, auth, renderer, or runtime validation failures.

## Route And Fallback Decisions

Next phase: Render API Request Envelope Contract Gate.

If Render API request envelope planning is accepted, proceed to Render API
Request Envelope Contract Gate.

If a later gate requires package/document schema mutation, route to Template
Version Schema Decision Gate.

If a later gate requires backend routes, storage durability, auth/authz,
renderer artifact bytes, or actual render execution, route to the appropriate
dedicated production gate instead of folding it into Render API contract
planning.

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

- Variable Schema / Data Contract Close Audit is complete.
- The Variable Schema / Data Contract mini lane is closed for a mini
  infrastructure checkpoint only.
- Accepted published template version target
  `template-product-report-vnext@v1` is confirmed.
- Variable/data contract evidence chain exists.
- Candidate variables are confirmed.
- Runtime validation, runtime default application, and runtime compatibility
  enforcement remain deferred.
- Render API Contract sub-lanes are ranked.
- Render API request envelope contract is selected first.
- Required JSON-safe evidence for the first sub-lane is defined.
- Backend route, storage, auth/authz, renderer artifact byte, and actual render
  execution work remain out of scope.

## FAIL-BLOCKER

None for this planning gate.

Future work must route to a dedicated production gate if it needs backend
routes, storage durability, auth/authz, renderer artifact bytes, or actual
render execution.

Future work must route to Template Version Schema Decision Gate if the request
envelope cannot be represented without package/document schema mutation.

## RISK

- Final request envelope fields are not implemented yet.
- Runtime validation is still deferred.
- Runtime default application is still deferred.
- Runtime compatibility enforcement is still deferred.
- Response/status, readiness, artifact pointer, job status, and blocker
  vocabulary lanes are not accepted yet.
- Measurement remains a mini checkpoint only; full v1 measurement production
  readiness is still blocked.

## UNKNOWN

- Final Render API request envelope field names.
- Final response/status contract.
- Final render-readiness validation owner.
- Final job/artifact pointer lifecycle owner.
- Final backend route, storage, and auth/authz boundaries.

## Files Changed

- `docs/RENDER_API_CONTRACT_PLANNING_GATE.md`
- `tests/renderApiContractPlanningGate.test.ts`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`
- pointer guard tests

## Behavior Changed

No runtime behavior changed. This phase records a Render API Contract planning
decision and next-lane routing only.

## Tests Run

- `npm.cmd test -- tests/renderApiContractPlanningGate.test.ts tests/variableSchemaDataContractCloseAudit.test.ts`
- `npm.cmd test`
- `npm.cmd run type-check`
- `npm.cmd run check`

## Risks Left

- Define the Render API request envelope without implementing runtime route or
  render execution behavior.
- Keep backend routes, storage durability, auth/authz, artifact bytes, and
  renderer execution behind dedicated later gates.
- Keep variable/data runtime validation and compatibility enforcement deferred
  until explicitly accepted by a later phase.

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
