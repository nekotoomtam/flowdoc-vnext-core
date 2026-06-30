# Template Variable Render API Planning Gate

Status: Template Publish / Variable Schema / Render API Planning Gate complete.

This phase uses Measurement Hardening Close Audit as source of truth. It plans
and ranks the next non-measurement mini infrastructure lane across Template
Publish / Version Boundary, Variable Schema / Data Contract, and Render API
Contract. It is a planning gate only.

## Source Of Truth

- `docs/MEASUREMENT_HARDENING_CLOSE_AUDIT.md`
- `fixtures/measurement-evidence-summary-manifest.accepted.v1.json`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `docs/WORKSPACE_BOUNDARY.md`
- `docs/LEGACY_MIGRATION_GATE.md`
- `docs/PHASE_LEDGER.md`

## Close-Audit Confirmation

Measurement Hardening Close Audit decided:

- the minimal accepted measurement subset is sufficient for a mini
  infrastructure checkpoint only;
- accepted rows exist for `v1-measure-thai-line-break-core` and
  `v1-measure-latin-product-paragraphs`;
- the full v1 measurement matrix remains `partial-not-accepted`;
- production measurement binding remains blocked;
- default-measurer replacement remains blocked;
- `measureVNextText(...)` remains unchanged.

This planning gate carries that decision forward without claiming full
measurement production readiness.

## Lane Ranking

| Rank | Lane | Decision | Dependency Reason | Risk |
|---|---|---|---|---|
| 1 | Template Publish / Version Boundary | selected first | Variable Schema and Render API need a stable published template/version target to reference. | Without a version boundary, downstream contracts may bind to mutable draft state. |
| 2 | Variable Schema / Data Contract | deferred | It should describe variables against a stable template version, not an unversioned draft. | Starting here can overfit data rules before publish/version identity is stable. |
| 3 | Render API Contract | deferred | Render API inputs should reference published template/version identity and a compatible variable data contract. | Starting here can create API routes around unstable template and variable semantics. |

## Selected First Lane

Selected first implementation lane: Template Publish / Version Boundary.

This lane comes first because FlowDoc needs a stable, reviewable boundary for
draft template state versus published template/version identity before Variable
Schema or Render API work can safely attach their contracts.

## Required Evidence For First Lane

The dedicated Template Publish / Version Boundary Gate should define or prove:

- publishable template candidate source is canonical package v2/document v3;
- draft template identity remains separate from published template version
  identity;
- published version ids are stable and immutable once accepted;
- version metadata is JSON-safe and can be referenced by later Variable Schema
  and Render API gates;
- publish validation reports package parse, graph diagnostics, key/data
  diagnostics, export-readiness status, and measurement status without
  producing artifacts;
- rejected publish attempts carry explicit blockers and do not mutate
  canonical package schema;
- retention pointers identify the source package/template snapshot without
  claiming production storage readiness;
- rollback, deprecation, or superseding-version policy is named at the
  planning boundary;
- production routes, auth/authz, storage durability, renderer artifact output,
  and default-measurer replacement remain blocked unless later dedicated gates
  accept them.

## Deferred Lanes

Variable Schema / Data Contract is deferred until a template publish/version
target exists. Its later gate should attach variables, data-shape validation,
missing-value policy, and compatibility rules to a published template version.

Render API Contract is deferred until both template version identity and
variable data contract direction are known. Its later gate should define
request/response shape and readiness-only behavior before concrete routes,
storage, auth/authz, or renderer artifact bytes.

## Next Phase

Template Publish / Version Boundary Gate.

Proceed only as a dedicated gate that defines the publish/version boundary and
evidence. Do not implement backend routes, storage durability, production
renderer output, or schema changes unless that later phase explicitly scopes
and gates them.

## Explicit Non-Work

- No `measureVNextText(...)` replacement happens.
- No full measurement production readiness is claimed.
- No pagination mutation happens.
- No production renderer-backed measurement binding happens.
- No production PDF/DOCX renderer work is added.
- No backend routes, auth, storage, or production behavior is added.
- No production contenteditable implementation is added.
- No package/document schema change is made in this planning gate.
- No collaboration/offline behavior is added.
- No legacy editor runtime is copied.

## PASS

- Measurement Hardening Close Audit decision is confirmed.
- Full v1 measurement matrix remains `partial-not-accepted`.
- Production binding and default-measurer replacement remain blocked.
- Template Publish / Version Boundary is ranked first and selected.
- Variable Schema / Data Contract and Render API Contract are explicitly
  deferred.
- Evidence required for the Template Publish / Version Boundary Gate is
  defined before implementation.

## FAIL-BLOCKER

None for this planning gate.

The next Template Publish / Version Boundary Gate must not proceed if it needs
to mutate package/document schema, add backend production behavior, or claim
storage/render/API production readiness without a dedicated gate.

## RISK

- Template publish/version identity may reveal missing version metadata or
  lifecycle fields that require a later schema gate.
- Variable Schema and Render API sequencing may need revisiting after the
  publish/version evidence is written.
- Measurement remains mini-checkpoint-only; full matrix completion is still
  required before production measurement replacement.

## UNKNOWN

- Exact version id format and version metadata fields.
- Whether publish validation should remain document-only or include template
  registry/package-envelope metadata.
- Whether later route/storage gates will require additional retention pointer
  fields.

## Files Changed

- `docs/TEMPLATE_VARIABLE_RENDER_API_PLANNING_GATE.md`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`
- `tests/templateVariableRenderApiPlanningGate.test.ts`
- pointer guard tests

## Behavior Changed

No runtime behavior changed. This phase records a planning decision only.

## Tests Run

- `npm.cmd test -- tests/templateVariableRenderApiPlanningGate.test.ts tests/measurementHardeningCloseAudit.test.ts`
- `npm.cmd test`
- `npm.cmd run type-check`
- `npm.cmd run check`

## Risks Left

- Define the Template Publish / Version Boundary Gate before implementation.
- Keep package/document schema changes behind a later explicit schema gate if
  required.
- Keep backend routes, storage durability, auth/authz, renderer artifacts, and
  production binding out of scope.

## Intentionally Not Changed

- `measureVNextText(...)`
- pagination behavior
- renderer-backed measurement binding
- PDF/DOCX renderer behavior
- backend routes/storage/auth/authz
- production contenteditable
- package/document schema
- collaboration/offline behavior
