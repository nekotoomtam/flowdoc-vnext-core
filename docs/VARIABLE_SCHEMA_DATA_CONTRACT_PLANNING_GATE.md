# Variable Schema / Data Contract Planning Gate

Status: Variable Schema / Data Contract Planning Gate complete.

This phase uses Template Publish Close Audit as source of truth. It plans the
Variable Schema / Data Contract lane against accepted published template
version metadata before implementation.

This is a planning gate only. It does not mutate package/document schema,
implement Variable Schema / Data Contract, implement Render API Contract,
publish through backend routes, claim storage durability, produce renderer
artifact bytes, or add auth/authz behavior.

## Source Of Truth

- `docs/TEMPLATE_PUBLISH_CLOSE_AUDIT.md`
- `fixtures/template-publish-accepted-version-metadata.v1.json`
- `docs/TEMPLATE_PUBLISH_ACCEPTED_VERSION_METADATA_GATE.md`
- `fixtures/template-publish-validation-evidence.v1.json`
- `fixtures/product-report-vnext.flowdoc.json`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`

## Template Publish Close Confirmation

Template Publish mini lane is closed for a mini infrastructure checkpoint
only.

The accepted published template version metadata exists:

```text
fixtures/template-publish-accepted-version-metadata.v1.json
```

Confirmed stable accepted target fields:

- `templateId`;
- `templateVersionId`;
- `versionOrdinal`;
- `sourcePackageId`;
- `packageVersion`;
- `documentVersion`;
- `validationEvidenceStatus`;
- `exportReadinessStatus`;
- `exportReadinessWarningCount`;
- `measurementStatus`.

The target remains scoped:

- `validationEvidenceStatus = accepted`;
- `exportReadinessStatus = ready-with-warnings`;
- `exportReadinessWarningCount = 1`;
- `measurementStatus = mini-checkpoint-only`.

Draft template identity remains separate from published template version
identity.

Accepted immutable facts:

- accepted `templateVersionId` is immutable;
- source snapshot retention pointer is immutable;
- validation evidence pointer is immutable.

## Contract Attachment Target

The Variable Schema / Data Contract lane must attach to:

- published template version identity:
  `template-product-report-vnext@v1`;
- accepted validation evidence pointer:
  `repo://fixtures/template-publish-validation-evidence.v1.json`;
- source snapshot retention pointer:
  `repo://fixtures/product-report-vnext.flowdoc.json`.

These attachment targets are JSON-safe evidence pointers only. They do not
claim production storage durability or backend publish behavior.

## Ranked Sub-Lanes

1. Variable reference discovery / candidate variable list.
2. Variable schema metadata shape.
3. Data contract validation policy.
4. Missing-value/default/required policy.
5. Compatibility policy with published template versions.

## Selected First Sub-Lane

Decision: select variable reference discovery / candidate variable list as the first Variable Schema / Data Contract sub-lane.

Variable reference discovery comes first because schema metadata, validation
policy, missing-value/default/required policy, and compatibility policy need a
stable list of authored variable references before they can be represented
safely.

No different sub-lane can safely come before discovery because it would define
contract policy without knowing the actual field-ref usage and candidate
variable surface of the accepted template source.

## First Gate Evidence

Variable Reference Discovery Gate must provide JSON-safe planning evidence for:

- accepted template/version attachment target;
- accepted validation evidence pointer;
- source snapshot retention pointer;
- source package parse status;
- discovery source scope;
- authored `field-ref` occurrence inventory;
- candidate variable ids;
- field registry cross-reference status;
- unresolved or unsupported reference status;
- duplicate candidate status;
- occurrence location summaries;
- blockers before variable schema metadata shape;
- explicit confirmation that package/document schema is not mutated.

Raw editor/runtime state and production storage evidence must stay outside root
tests/docs.

## Render API Deferral

Render API Contract remains deferred until variable/data contract evidence is clear.

Render API must not attach to template publish metadata directly before the
Variable Reference Discovery Gate and later Variable Schema / Data Contract
gates define what variable/data inputs a render request can safely require.

## Schema Decision Fallback

Template Version Schema Decision Gate is not selected because this planning
gate can attach the Variable Schema / Data Contract lane to accepted published
version metadata without package/document schema mutation.

If a later variable/data gate cannot represent required contract facts through
external metadata and retention pointers, it must route to Template Version
Schema Decision Gate.

## Explicit Non-Work

- No package/document schema mutation is made.
- No Variable Schema / Data Contract is implemented.
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

- Template Publish mini lane is confirmed closed for a mini infrastructure
  checkpoint only.
- Accepted published template version metadata exists.
- Stable accepted target fields are present.
- Draft template identity remains separate from published template version
  identity.
- Accepted `templateVersionId` and retention pointers are immutable.
- The Variable Schema / Data Contract lane can attach to accepted published
  version metadata without package/document schema mutation.
- Variable reference discovery / candidate variable list is selected first.
- First gate evidence is defined before implementation.
- Render API Contract remains deferred.
- Variable Reference Discovery Gate is the next phase.

## FAIL-BLOCKER

None for this planning gate.

Future work must route to Template Version Schema Decision Gate if variable or
data contract facts cannot attach externally to accepted version metadata.

## RISK

- The candidate variable list is not discovered yet.
- Compatibility policy cannot be accepted until reference discovery and
  metadata shape are complete.
- Export-readiness remains `ready-with-warnings`.
- Measurement remains a mini checkpoint only; full v1 measurement production
  readiness is still blocked.

## UNKNOWN

- Whether discovery will find references missing from the package field
  registry.
- Whether candidate variable ids need aliases, display metadata, or
  compatibility labels.
- Final data contract validation vocabulary.
- Final production owner for template version variable contract records.

## Files Changed

- `docs/VARIABLE_SCHEMA_DATA_CONTRACT_PLANNING_GATE.md`
- `tests/variableSchemaDataContractPlanningGate.test.ts`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`
- pointer guard tests

## Behavior Changed

No runtime behavior changed. This phase records the Variable Schema / Data
Contract lane plan and first sub-lane decision only.

## Tests Run

- `npm.cmd test -- tests/variableSchemaDataContractPlanningGate.test.ts tests/templatePublishCloseAudit.test.ts`
- `npm.cmd test`
- `npm.cmd run type-check`
- `npm.cmd run check`

## Risks Left

- Discover variable references and candidate variables in a dedicated gate.
- Keep variable schema metadata shape behind discovered evidence.
- Keep Render API Contract deferred until variable/data evidence is clear.
- Keep package/document schema changes behind Template Version Schema Decision
  Gate.

## Intentionally Not Changed

- package/document schema
- Variable Schema / Data Contract implementation
- Render API Contract implementation
- backend routes/storage/auth/authz
- renderer artifact production
- `measureVNextText(...)`
- pagination behavior
- production renderer-backed measurement binding
- PDF/DOCX renderer behavior
- production contenteditable
- collaboration/offline behavior
