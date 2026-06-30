# Variable Reference Discovery Gate

Status: Variable Reference Discovery Gate complete.

This phase uses Variable Schema / Data Contract Planning Gate as source of
truth. It produces JSON-safe variable reference discovery evidence and a
candidate variable list for the accepted published template version target.

This is a discovery evidence gate only. It does not mutate package/document
schema, implement the full Variable Schema / Data Contract, implement Render
API Contract, publish through backend routes, claim storage durability, produce
renderer artifact bytes, or add auth/authz behavior.

## Source Of Truth

- `docs/VARIABLE_SCHEMA_DATA_CONTRACT_PLANNING_GATE.md`
- `fixtures/template-publish-accepted-version-metadata.v1.json`
- `fixtures/product-report-vnext.flowdoc.json`
- `docs/TEMPLATE_PUBLISH_CLOSE_AUDIT.md`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`

## Planning Gate Confirmation

Variable Schema / Data Contract Planning Gate is complete.

Selected first sub-lane:

```text
Variable Reference Discovery / candidate variable list
```

The attachment target is confirmed:

- published template version identity:
  `template-product-report-vnext@v1`;
- accepted validation evidence pointer:
  `repo://fixtures/template-publish-validation-evidence.v1.json`;
- source snapshot retention pointer:
  `repo://fixtures/product-report-vnext.flowdoc.json`.

## Source Snapshot

The discovery source snapshot is:

```text
fixtures/product-report-vnext.flowdoc.json
```

Package parse status is `ready`.

Discovery source scope:

- includes authored inline nodes with `type=field-ref`;
- includes field-ref nodes inside text-block children;
- includes section, zone, and table occurrence context;
- includes package field registry cross-reference;
- excludes page-number inline nodes, line-break nodes, TOC generated output,
  renderer output, and data value materialization.

## Discovery Evidence Fixture

The JSON-safe discovery evidence is:

```text
fixtures/variable-reference-discovery.v1.json
```

Discovery summary:

- field-ref occurrence count: `11`;
- candidate variable count: `6`;
- registry field count: `6`;
- unresolved reference count: `0`;
- unsupported reference count: `0`;
- duplicate candidate id count: `0`;
- package/document schema mutated: `false`;
- Render API Contract deferred: `true`.

Candidate variable ids:

- `customer.name`;
- `customer.segment`;
- `prepared.by`;
- `report.period`;
- `report.riskLevel`;
- `report.total`.

## Occurrence Inventory

The occurrence inventory records JSON-safe facts only:

- field-ref id;
- field key;
- text-block id;
- section id;
- zone id;
- inline index;
- package path;
- optional table id, row id, and cell id;
- fallback;
- registry status;
- compact location summary.

Table-cell occurrence context is preserved for:

- `metric-value-total-field`;
- `metric-value-risk-field`.

## Registry Cross-Reference

All discovered field refs are resolved against the package field registry.

Cross-reference status:

```text
fieldRegistryStatus = all-discovered-refs-resolved
duplicateCandidateStatus = no-duplicate-candidate-ids
```

Unresolved references: none.

Unsupported references: none.

Blockers before Variable Schema Metadata Shape Gate: none.

## Next Phase

Variable Schema Metadata Shape Gate.

Proceed there because variable references are discovered with no unresolved or
unsupported blockers.

If later discovery evidence finds references missing from the field registry
or unsupported inline field types, route to Variable Reference Resolution
Decision Gate.

If discovery cannot be represented without schema changes, route to Template
Version Schema Decision Gate.

## Explicit Non-Work

- No package/document schema mutation is made.
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

- Variable Schema / Data Contract Planning Gate is confirmed complete.
- Variable Reference Discovery / candidate variable list is confirmed as the
  selected first sub-lane.
- Attachment target pointers are confirmed.
- Source package parse status is `ready`.
- Discovery source scope is defined.
- Authored field-ref occurrences are discovered.
- JSON-safe occurrence inventory is populated.
- Candidate variable ids are populated.
- Discovered field refs are cross-referenced against the package field
  registry.
- Unresolved and unsupported references are empty.
- Duplicate candidate ids are absent.
- Occurrence location summaries are present.
- Blockers before Variable Schema Metadata Shape Gate are empty.
- Package/document schema is not mutated.
- Render API Contract remains deferred.
- The next phase is Variable Schema Metadata Shape Gate.

## FAIL-BLOCKER

None for this discovery gate.

Future work must route to Variable Reference Resolution Decision Gate if
missing registry entries or unsupported field-ref types appear.

Future work must route to Template Version Schema Decision Gate if discovery
facts cannot remain external JSON-safe metadata.

## RISK

- Candidate variable semantics are not shaped yet.
- Required/default/missing-value behavior is not decided yet.
- Compatibility policy with published template versions is not decided yet.
- Export-readiness remains `ready-with-warnings`.
- Measurement remains a mini checkpoint only; full v1 measurement production
  readiness is still blocked.

## UNKNOWN

- Final variable schema metadata shape.
- Final required/default/missing-value policy.
- Whether candidate variables need aliases or compatibility labels.
- Final production owner for variable contract records.

## Files Changed

- `docs/VARIABLE_REFERENCE_DISCOVERY_GATE.md`
- `fixtures/variable-reference-discovery.v1.json`
- `tests/variableReferenceDiscoveryGate.test.ts`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_PHASE_POINTER.md`
- `docs/PHASE_LEDGER.md`
- `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`
- `README.md`
- pointer guard tests

## Behavior Changed

No runtime behavior changed. This phase records JSON-safe discovery evidence
and next-lane routing only.

## Tests Run

- `npm.cmd test -- tests/variableReferenceDiscoveryGate.test.ts tests/variableSchemaDataContractPlanningGate.test.ts`
- `npm.cmd test`
- `npm.cmd run type-check`
- `npm.cmd run check`

## Risks Left

- Define Variable Schema Metadata Shape from discovered candidate variables.
- Keep data contract validation policy deferred until metadata shape is clear.
- Keep Render API Contract deferred until variable/data contract evidence is
  clear.

## Intentionally Not Changed

- package/document schema
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
