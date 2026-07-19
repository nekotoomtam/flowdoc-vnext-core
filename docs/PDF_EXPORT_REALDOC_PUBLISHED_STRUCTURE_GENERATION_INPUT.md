# PDF Export REALDOC Published Structure Generation Input

Status: `PDF-EXPORT-REALDOC-E.1` accepted pure Core contract. Mapping,
runtime value validation, materialization, resolution, rendering, Backend
routes, Editor pre-test UI, and production remain inactive.

## Outcome

E.1 introduces one source-neutral contract between trusted Backend admission
and retained Core Structure/instance/snapshot contracts:

```text
Published Structure generation data contract
  + Backend-owned generation instance
  + canonical snapshots OR adapted payload descriptor and mapping profile
  -> content-free generation input plan
  -> mapping-required OR runtime-validation-required
```

Neither accepted input lane is ready for resolution. The plan cannot execute
mapping, apply defaults, materialize a document, resolve values, measure,
paginate, render, persist, or create an artifact.

Primary implementation:

- `src/generation/publishedStructureGenerationInputV1.ts`;
- `tests/publishedStructureGenerationInputV1.test.ts`; and
- public exports through `src/index.ts`.

## FlowDoc-Owned Data Contract

`createVNextPublishedStructureGenerationDataContractV1(...)` creates one
fingerprinted contract containing:

- exact Published Structure Version identity and Structure fingerprint;
- exact Published Field Contract;
- optional Published Collection Item Contract;
- retained snapshot contract identities for scalar/image data, Table
  collections, and instance media; and
- a canonical data-contract fingerprint independent of record insertion order.

The field and collection contracts must belong to the exact Published
Structure Version. A collection item contract must refine the exact field
contract, and each declared collection must point to a field whose type is
`collection`.

This contract describes values accepted by one Structure Version. It does not
store presentation placement or final geometry, and it does not make field
values part of the Structure Definition.

## Direct Canonical Input

`canonical-snapshot-input` accepts strict existing Core inputs:

- one `instance-data-snapshot-v1`;
- zero or more `table-collection-snapshot-v1` records; and
- one `instance-media-snapshot-v1`.

Every snapshot must pin the exact generation instance revision. Collection
snapshot revisions must equal that instance revision. Duplicate snapshot ids,
duplicate collection fields across snapshots, unknown scalar fields,
collection values placed in scalar data, unknown collection fields, and
unknown collection item fields block.

A valid direct plan reports `runtime-validation-required`. E.1 validates shape,
identity, ownership, and known keys only. Required/default/type compatibility,
image target resolution, and full runtime policy remain E.2 work.

The plan retains snapshot ids, counts, and fingerprints. It does not retain
scalar values, collection item values, or source text.

## Adapted Payload Input

`adapted-payload-input` accepts:

- a JSON payload descriptor with Backend-owned payload id, byte length, and
  SHA-256 of the exact raw bytes; and
- one fingerprinted Published Structure mapping profile.

Raw JSON is deliberately not part of the Core request schema. Backend retains
or streams the caller payload and later invokes the accepted E.2 mapping
runtime. The E.1 plan reports `mapping-required` and contains no mapped values.

A mapping profile pins:

- exact Published Structure Version owner;
- source contract id, version, and schema fingerprint;
- exact target generation data contract id and fingerprint;
- mapping profile identity and fingerprint; and
- one execution identity without selecting a global mapping implementation.

Two execution identity families are admitted:

- `named-adapter` for source-specific code such as the isolated UAT adapter;
  and
- `declarative-mapping` for a later accepted mapping language, definition, and
  executor.

Both carry policies that require canonical snapshot output and forbid caller
layout facts, renderer facts, and browser-authoritative execution. E.1 does not
choose between the two families and does not execute either.

## Plan Evidence

`planVNextPublishedStructureGenerationInputV1(...)` returns either a blocked
result or one content-free deterministic plan. An accepted plan pins:

- Published Structure Version and Structure fingerprint;
- generation data contract, field contract, and collection contract
  identities/fingerprints;
- exact generation instance revision;
- direct snapshot fingerprints or payload/mapping-profile identity;
- next step (`mapping` or `runtime-validation`); and
- an exact plan fingerprint.

Execution facts remain explicit:

```text
mapping: not-required | required-not-run
runtimeValidation: not-run
materialization: not-run
resolution: not-run
measurement: not-run
pagination: not-run
artifact: not-run
```

Strict schemas reject unknown root/input properties, including caller layout,
renderer, provider, or raw-payload additions.

## UAT Compatibility Evidence

The REALDOC UAT Structure passes the same generic contract:

- its exact Structure identity and fingerprint;
- its existing Published Field Contract;
- its two collection shapes, `uat.requirements` and `uat.screenshots`; and
- a named-adapter mapping profile targeting the exact generated data contract.

The resulting plan stops at `mapping-required`. No UAT field or source schema
is imported into the Core generation-input implementation. The adapter remains
source-specific package code outside canonical Core semantics.

## Fail-Closed Coverage

Tests cover:

- canonical fingerprints independent of record insertion order;
- named-adapter and declarative-mapping profile identities;
- content-free direct plans and no input mutation;
- raw adapted JSON rejection;
- Structure/instance and snapshot revision mismatch;
- unknown scalar, collection, and collection-item fields;
- duplicate collection identity/ownership;
- fingerprint drift;
- mapping owner and target mismatch;
- unknown caller layout; and
- exact UAT Structure compatibility through generic contracts.

## Explicitly Not Changed

- existing `VNextGenerationRequest` inline-package readiness path;
- package/document/field/collection/snapshot schemas;
- UAT adapter output or REALDOC-D.1 artifact identity;
- runtime data validation, defaults, compatibility enforcement, or mapping;
- materialization, resolution, measurement, pagination, or renderer behavior;
- Backend request/eligibility routes, workers, storage, or providers;
- Editor state, transport, proxy, preview, or PDF controls; and
- production configuration or activation.

## PASS

- Both JSON input families share one Published Structure generation boundary.
- FlowDoc-owned contracts and caller-owned data stay separate.
- Field contracts remain independent from presentation and final geometry.
- Adapted payload bytes remain Backend-owned and absent from Core plans.
- Direct and adapted input stop before runtime validation/resolution.
- UAT fits without becoming canonical schema.

## RISK

- Existing `VNextGenerationRequest` remains an older inline-package readiness
  contract and must not be confused with E.1.
- Current collection snapshots are Table-specific; generic repeat expansion is
  not implied by this contract.
- Content-free fingerprints prove identity, not semantic data correctness.

## UNKNOWN

- Which mapping execution family is selected first in E.2.
- Required/default/type and compatibility policy composition at runtime.
- Payload retention and size limits in Backend.
- Asset upload/reference admission before canonical media snapshots.

## Next Phase

E.2 now executes this input contract through the pure runtime documented in
`docs/PDF_EXPORT_REALDOC_GENERATION_RUNTIME.md`. The next phase is
`PDF-EXPORT-REALDOC-E.3` bounded local Backend DocGen admission. Production
remains NO-GO.
