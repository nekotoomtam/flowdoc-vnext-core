# Runtime Binding / Implementation Planning Gate

Status: Runtime Binding / Implementation Planning Gate complete.

This planning gate uses Mini Infrastructure Close Audit as source of truth and
turns the closed mini infrastructure checkpoint into an implementation
handoff. It is planning-only. It does not implement runtime binding, backend
routes, Render API runtime, storage durability, auth/authz, durable job
lifecycle, renderer execution, artifact bytes, runtime data validation,
runtime default application, runtime compatibility enforcement, runtime error
handling, package/document schema changes, or production measurement binding.

## Source Of Truth

- `docs/MINI_INFRASTRUCTURE_CLOSE_AUDIT.md`
- `docs/RENDER_API_REQUEST_ENVELOPE_CONTRACT_GATE.md`
- `fixtures/render-api-request-envelope-contract.v1.json`
- `fixtures/template-publish-accepted-version-metadata.v1.json`
- `fixtures/variable-compatibility-policy.v1.json`
- `fixtures/render-api-error-blocker-vocabulary.v1.json`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`

## Confirmed Inputs

- Mini Infrastructure Close Audit is complete.
- The mini infrastructure checkpoint is closed for checkpoint scope only.
- Accepted template version target is `template-product-report-vnext@v1`.
- Published template version identity is immutable for the accepted metadata
  row.
- Source snapshot retention pointer is
  `repo://fixtures/product-report-vnext.flowdoc.json`.
- Validation evidence pointer is
  `repo://fixtures/template-publish-validation-evidence.v1.json`.
- Variable/data contract evidence pointers exist for discovery, schema
  metadata, validation policy, required/missing/default policy, and
  compatibility policy.
- Render API request envelope contract is accepted as metadata-only.
- Render API response/status, readiness, artifact/job placeholder, and
  error/blocker vocabulary metadata exist.
- Full v1 measurement production readiness remains blocked.

## Ranked Runtime Binding Lanes

1. Render API request envelope runtime binding.
   This is first because it can be implemented as a small package-local/core
   validator against stable metadata: accepted template version identity,
   evidence pointers, variable payload container shape, client request id
   policy, and malformed-envelope blocker vocabulary. It does not require
   backend routes, storage, auth/authz, renderer execution, or schema changes.
2. Variable payload validation runtime.
   This should come after the request envelope is bound because variable
   payload validation needs a stable `variables` container and request
   envelope context.
3. Render-readiness runtime evaluator.
   This should come after variable validation because readiness combines
   template/version, evidence pointers, payload validity, compatibility policy,
   and deferred runtime checks.
4. Response/error runtime mapper.
   This should come after readiness because response statuses and blocker
   summaries need stable readiness outputs.
5. Job lifecycle and artifact placeholder runtime transition.
   This should come after response/error mapping because job and artifact
   placeholders need response-level status and blocker summaries before any
   durable job model is introduced.
6. Backend route, storage durability, and auth/authz planning.
   This remains deferred until core runtime status results exist without a
   server dependency.
7. Renderer execution and artifact byte production planning.
   This remains deferred until request, validation, readiness, and response
   runtime results exist.
8. Production measurement binding and default-measurer replacement.
   This remains deferred until the full v1 measurement matrix is accepted and
   a later binding phase explicitly permits replacement.

## Selected First Implementation Lane

Selected first implementation lane: Render API Request Envelope Runtime
Binding Gate.

Reason: it is the smallest useful runtime slice. It can validate request
envelope identity and JSON-safe shape against accepted metadata while keeping
backend routes, storage, auth/authz, renderer execution, artifact bytes, and
runtime variable validation out of scope.

## First Implementation Evidence

The next thread should produce evidence for a package-local/core request
envelope runtime binding slice:

- a small runtime module that validates request envelope metadata and variable
  payload container shape;
- focused tests for accepted, warning, and blocked envelope outcomes;
- validation that template version identity matches
  `template-product-report-vnext@v1`;
- validation that source snapshot, validation evidence, and variable/data
  contract pointers are present;
- validation that `variables` is a JSON object keyed by variable id;
- validation that malformed envelope blockers map to contract vocabulary;
- preservation of response/status, readiness, job/artifact, storage, auth,
  renderer execution, runtime data validation, runtime default application,
  runtime compatibility enforcement, and runtime error handling as deferred;
- pointer updates after the implementation slice.

## Handoff Plan For Next Thread

Start from:

```text
docs/RUNTIME_BINDING_IMPLEMENTATION_PLANNING_GATE.md
```

First implementation phase:

```text
Render API Request Envelope Runtime Binding Gate
```

Read first:

- `docs/MINI_INFRASTRUCTURE_CLOSE_AUDIT.md`
- `docs/RENDER_API_REQUEST_ENVELOPE_CONTRACT_GATE.md`
- `fixtures/render-api-request-envelope-contract.v1.json`
- `fixtures/template-publish-accepted-version-metadata.v1.json`
- `fixtures/variable-compatibility-policy.v1.json`
- `fixtures/render-api-error-blocker-vocabulary.v1.json`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`

Implement first:

- package-local/core request envelope metadata validator;
- status result for `envelope-valid`, `envelope-valid-with-warnings`, and
  `envelope-blocked`;
- blocker mapping for malformed envelope cases.

Do not implement first:

- backend route;
- production storage;
- auth/authz;
- durable job id or lifecycle;
- renderer execution;
- artifact byte production;
- runtime variable data validation;
- runtime default application;
- runtime compatibility enforcement;
- runtime error handling beyond returning JSON-safe metadata;
- package/document schema changes;
- `measureVNextText(...)` replacement.

Stop and route to a decision gate if:

- request envelope binding requires package/document schema mutation;
- request envelope binding requires backend route/storage/auth behavior;
- request envelope binding requires renderer execution or artifact bytes;
- accepted metadata and fixture context do not match.

## PASS

- Mini Infrastructure Close Audit is complete.
- Runtime binding lanes are ranked.
- Render API Request Envelope Runtime Binding Gate is selected first.
- Handoff plan for the next thread is explicit.
- Production blockers remain unchanged.

## FAIL-BLOCKER

None for this planning gate.

Implementation must be blocked later if the first runtime binding slice
requires schema mutation, backend route/storage/auth behavior, renderer
execution, artifact bytes, or mismatched accepted metadata.

## RISK

- The first implementation slice may discover that request envelope metadata
  needs a narrower runtime shape than the contract fixture currently records.
- Variable payload validation may need additional type detail after request
  envelope binding proves the container shape.
- Backend and renderer integration risks are still deferred, not solved.

## UNKNOWN

- Exact module name and public API for the first runtime binding slice.
- Whether request envelope runtime binding should live under a new Render API
  runtime folder or an existing runtime boundary folder.
- Whether later variable validation requires a schema-decision gate.

## Files Changed

- `docs/RUNTIME_BINDING_IMPLEMENTATION_PLANNING_GATE.md`
- `tests/runtimeBindingImplementationPlanningGate.test.ts`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`

## Behavior Changed

No runtime behavior changed. This phase adds planning documentation, pointer
updates, and tests only.

## Tests Run

- `npm.cmd test -- tests/runtimeBindingImplementationPlanningGate.test.ts tests/miniInfrastructureCloseAudit.test.ts`
- `npm.cmd test`
- `npm.cmd run type-check`
- `git diff --check`
- `npm.cmd run check`

## Risks Left

- Runtime binding is not implemented.
- Request envelope runtime validation is not implemented.
- Variable payload validation, readiness evaluation, response/error mapping,
  backend routes, storage, auth/authz, durable jobs, renderer execution,
  artifact bytes, runtime defaults, runtime compatibility enforcement, and
  full measurement production readiness remain blocked or deferred.

## Intentionally Not Changed

- `measureVNextText(...)`
- Pagination behavior
- Package/document schema
- Backend routes or auth/authz
- Storage durability
- Durable job lifecycle
- Renderer execution or artifact bytes
- Runtime data validation/defaults/compatibility/error handling
- Production contenteditable
- Collaboration/offline behavior
- Legacy editor runtime
