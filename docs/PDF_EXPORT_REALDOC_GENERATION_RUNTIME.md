# PDF Export REALDOC Generation Runtime

Status: `PDF-EXPORT-REALDOC-E.2` accepted pure Core mapping and validation
runtime. Backend admission/routes, materialization, resolution, rendering,
Editor pre-test UI, and production remain inactive.

## Outcome

E.2 executes the two E.1 input lanes only far enough to produce one validated
canonical snapshot boundary:

```text
direct canonical snapshots --------------------+
                                                +-> shared runtime validation
adapted UTF-8 JSON -> identity-pinned mapper ---+   -> canonical snapshots
                                                    -> materialization-ready
```

`runVNextPublishedStructureGenerationRuntimeV1(...)` always runs the retained
E.1 planner first. A blocked Structure, instance, data contract, snapshot, or
mapping profile cannot enter runtime execution.

The ready result contains canonical data, collection, and media snapshots for
the later materialization phase. Diagnostics and receipts remain content-free.
No ready result executes materialization, resolution, measurement, pagination,
artifact creation, storage, or a renderer.

Primary implementation:

- `src/generation/publishedStructureGenerationRuntimeV1.ts`;
- `packages/uat-realdoc/src/uatGenerationMapper.ts`;
- `tests/publishedStructureGenerationRuntimeV1.test.ts`; and
- public exports through `src/index.ts` and the UAT package index.

## Payload Admission

`createVNextPublishedStructureJsonPayloadDescriptorV1(...)` derives the exact
UTF-8 byte length and SHA-256 descriptor used by E.1. The adapted runtime
requires the ephemeral JSON text to match both facts before parsing or mapping.

The runtime does not return or retain raw JSON text. Backend remains responsible
for request-size limits, streaming/temporary retention, authorization, and
payload lifecycle. A byte-length mismatch, digest mismatch, or invalid JSON
blocks before mapper execution.

## Mapping Runtime

Mapping is injected through `VNextPublishedStructureMappingRuntimeV1`. The
runtime identity must exactly match the admitted mapping profile execution:

- named adapter id, version, and implementation fingerprint; or
- declarative mapping language/version, definition fingerprint, and executor
  fingerprint.

E.2 does not select a global mapper and does not include a declarative mapping
language engine. A trusted Backend registry will later select the exact
implementation. Mapper exceptions are caught and replaced with a generic
content-free failure; exception messages are never propagated.

A mapper may return only:

- strict canonical snapshots plus content-free warning references; or
- content-free issue references containing a bounded code and structural path.

Raw JSON, layout facts, renderer commands, provider choices, or arbitrary
diagnostic messages are rejected from the mapping result.

## Shared Validation

Mapped snapshots are converted into the same direct E.1 request shape and then
pass the exact validator used by direct input. Validation covers:

- exact instance/revision ownership for data, collection, and media snapshots;
- exact known scalar and collection keys;
- scalar value compatibility for text/date/enum, number, boolean, and image;
- image references present in the exact instance-media snapshot;
- collection item value compatibility;
- required collection item presence and non-null values; and
- typed optional collection item defaults.

The ready result canonicalizes object-key order, preserves collection item
array order, and derives one canonical snapshot fingerprint. Direct and adapted
inputs with the same snapshots therefore converge on the same fingerprint.

## Default Policy

E.2 applies only defaults represented unambiguously by the retained collection
item contract:

- optional string, number, or boolean fallback values are copied into a missing
  item value and reported as a content-free warning;
- required item fields block when absent or null; and
- a published-image fallback blocks until a later contract binds exact static
  media ownership.

The older scalar `FieldDefinition.fallback` remains authored display metadata.
It is a string even for number/boolean field definitions and is not promoted to
a canonical data default. Date strings and enum strings receive type-family
validation only because the retained field contract has no date-format or enum
choice metadata.

## Content-Free Diagnostics

Runtime diagnostics contain only:

- stable Core issue/warning code;
- bounded structural path;
- optional mapper detail code;
- generated message containing contract field identity but no supplied value;
- counts; and
- a deterministic diagnostics fingerprint.

Source values, raw JSON, item keys, asset ids, mapper exception text, and PDF
bytes are not copied into diagnostics. The ready canonical snapshot output does
contain business values because it is the explicit input to later
materialization; that output is not a privacy-safe lifecycle event.

## UAT Parity Evidence

`createFlowDocUatGenerationMapperV1()` wraps the isolated semantic-no-pages UAT
adapter as one named mapping runtime. External UAT JSON omits FlowDoc's Document
Instance identity; the mapper receives that identity from runtime context.

The same synthetic UAT section is executed once through direct snapshots and
once through the adapted payload lane. Both produce byte-equivalent canonical
snapshot objects and the same canonical snapshot fingerprint, including two
collection items and one instance-media asset. UAT fields remain outside the
generic Core runtime.

The retained real-source 69C section 2.1 adapter verifier also remains accepted
without fixture drift: adapter bundle fingerprint
`sha256:c4a552188ef80f6d55e9856266f271f445c354740c383ba03bc6dedf9aa021b7`,
15 scalar values, 17 collection items, and 7 media assets. No local source path
or source value is committed as E.2 evidence.

## Fail-Closed Coverage

Tests cover:

- missing or unexpected mapper runtime;
- payload byte-length and digest drift;
- invalid JSON;
- mapping execution identity drift;
- mapper rejection, invalid output, and redacted exceptions;
- mapped snapshot instance drift;
- scalar and collection item type mismatch;
- absent instance media;
- missing/null required collection item fields;
- typed default application without input mutation;
- unsupported published-image defaults; and
- generic plus UAT direct/adapted canonical parity.

## Backend E.3 Handoff Evidence

Backend now wraps this runtime with an explicitly mounted loopback-only
`POST /docgen-local/admissions` boundary. The strict request admits an exact
Published Structure Version, direct data/collections or one allowlisted
mapping-profile identity, and a digest-bound asset registry. Backend creates
the revision-0 instance and snapshot identities; callers cannot provide mapper
code, tenant/principal, layout, renderer, or artifact facts.

The local HTTP body is bounded to 2 MiB and adapted JSON to 1 MiB of UTF-8.
Trusted local asset bytes are checked for exact byte length and SHA-256 before
this Core runtime executes. Ready canonical snapshots live only in a protected
in-memory Backend record. Public receipts retain identities, fingerprints,
counts, and these content-free diagnostics, not raw payload or business values.

E.3 does not change this Core contract. It stops at the same `materialization`
boundary and does not connect a 69C request to resolution, worker execution,
PDF bytes, storage, status, or download. That binding remains E.4.

## Explicitly Not Changed

- E.1 data-contract, mapping-profile, request, and planning semantics;
- Structure/package/document schemas;
- cross-version alias or superseding-version compatibility policy;
- materialization, resolution, table expansion, measurement, or pagination;
- renderer, PDF bytes, artifact identity, or artifact lifecycle;
- Backend route, request parser, mapper registry, storage, worker, or provider;
- Editor route, state, transport, import UI, preview, or PDF controls; and
- production identity, tenancy, deployment, cost, or activation.

## PASS

- Both input families converge through one canonical validator.
- Exact payload and mapper identities block drift before mapping.
- Ready output is materialization-ready but performs no downstream work.
- Diagnostics and receipts retain no business values or thrown error text.
- Typed collection defaults and required item policy now execute fail closed.
- The real UAT adapter proves parity without entering canonical Core semantics.

## RISK

- Ready canonical snapshots contain business data and require Backend access,
  retention, and redaction policy before a route is admitted.
- Current collection snapshots remain Table-specific.
- Scalar required/default/date-format/enum-choice metadata is not represented by
  the retained Published Field Contract.
- Published image defaults require explicit static-media ownership binding.
- The named UAT mapper fingerprint pins an accepted implementation manifest,
  not a build artifact digest.

## UNKNOWN

- Backend mapper registry and payload size/retention policy.
- First declarative mapping language and executor implementation.
- Static versus instance media admission protocol for external callers.
- Temporary versus retained generation-instance lifecycle.

## Next Phase

`PDF-EXPORT-REALDOC-E.4` now binds one Backend-admitted 69C canonical record to
source-neutral materialization/resolution and the existing local artifact
lifecycle. See `docs/PDF_EXPORT_REALDOC_ADMITTED_ARTIFACT_LIFECYCLE.md`.
`PDF-EXPORT-REALDOC-E.5.0` locks the Editor workspace product contract.
REALDOC-E.5.1 now accepts the bounded local Document Library read model and
first Library-to-Design view. E.5.2 now accepts the shared workspace tabs and
Design state retention without Preview execution. Next:
`PDF-EXPORT-REALDOC-E.5.3` now accepts the Core UI-neutral test-input
projection documented in `docs/PDF_EXPORT_REALDOC_TEST_INPUT_PROJECTION.md`.
E.5.4 now accepts temporary Editor Form state without Preview execution. Next
is E.5.5 temporary JSON and mapping-profile state.
Production remains NO-GO.
