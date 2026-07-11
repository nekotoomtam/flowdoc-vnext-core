# Structure Policy And Effective Capability Contract

Status: Phase 271 retained core policy contract. This phase implements strict
standalone Structure Policy metadata, deterministic binding resolution, and
effective capability evaluation. It does not wire policy into current v4
operations, package parsers, backend mutation, editor command policy,
materialization, or persistence.

## Outcome

Engine capability, Structure Policy, and session permission are separate
truths:

```text
effective capability
  = core node/containment capability
  intersect Structure Policy
  intersect session permission
```

Core capability states what the engine implements. Structure Policy states what
the Structure author permits in one context. Session permission states what the
current actor may request. No layer may widen a denial from another layer.

## Policy Set

A policy set is owned by an exact Structure Definition draft revision or an
exact Published Structure Version. It contains named policies, one conservative
default, and explicit node bindings.

Each policy separates:

- actions on the node itself;
- child-list actions and allowed child types;
- minimum/maximum child cardinality;
- the policy assigned contextually to unbound children;
- optional allowed Style Keys.

Policy records do not contain user ids, roles, backend authorization, UI state,
or renderer behavior.

## Resolution Precedence

Policy v1 uses one deterministic precedence and no inheritance graph:

1. explicit node binding;
2. parent policy `childPolicyKey`;
3. policy-set default.

An explicit starter-node lock therefore remains stable. A newly materialized or
instance-authored child can receive the contextual child policy without storing
permission booleans on the node. Policy keys reference complete records; policy
records do not extend other policy records, so cycles and multi-parent merge
rules do not exist in v1.

Moving a node to another parent may change its contextual policy unless the
node has an explicit binding. Cross-parent move semantics remain deferred and
must report any effective-policy change before commit.

## Effective Capability

Node action evaluation reports all denied layers in stable order:

1. `core`;
2. `structure`;
3. `session`.

The retained node action vocabulary covers delete, duplicate, reorder, content
edit, Style Key application, local style override, field placement, and media
placement. A successful policy evaluation is necessary but not sufficient for
an operation: target existence, parent context, revision, reference, and full
document validation still apply.

Editor command policy may present retained denial reasons but is not the
authority for Structure Policy. Backend must invoke core-owned policy semantics
after revision preflight and before persistence; it must not duplicate the
intersection rules.

## Cardinality And Containment

Child composition evaluates parent-owned constraints separately from target
node actions:

- core allowed child types are an absolute upper bound;
- Structure Policy may narrow, never widen, those types;
- insert and duplicate respect `maxChildren`;
- delete respects `minChildren`;
- reorder does not change cardinality;
- session permission remains an independent denial layer.

Deleting a child may therefore require both target `node.delete` and parent
`child.delete` approval. Duplicating may require target `node.duplicate`, parent
`child.duplicate`, type acceptance, and remaining capacity.

## Style Direction

`style.apply` and `style.override` are separate node actions. Optional
`allowedStyleKeys` narrows named Style Keys available under one policy; omission
means this policy adds no key allowlist, while an empty list permits none. Exact
catalog pin and style-resolution semantics remain Phase 6 work.

## Package And Operation Boundary

Policy contracts are standalone retained facts. Current package 2/document 3
and package 3/document 4 parsers do not accept them. Current
`runVNextDocumentV4Operation(...)` does not consume them and remains unsuitable
as an activated Document Instance mutation path until a later integration
phase supplies validated policy context.

## PASS

- Policy owner is pinned to a draft revision or published version.
- Policy references, record keys, actions, child types, style keys, and
  cardinality are strictly validated.
- Binding resolution has one deterministic precedence and no inheritance graph.
- Effective denials retain core/structure/session ownership.
- Parent composition constraints cannot widen core containment.

## FAIL / BLOCKER

- Policy is not attached to canonical packages or materialized instances.
- Existing v4 operations and backend/editor consumers do not enforce policy.
- Session permission vocabulary and product authorization remain external.
- Cross-parent moves and contextual-policy change UX remain unavailable.

## RISK

- A permissive default policy can accidentally expose unbound starter nodes.
- Explicit bindings can become stale if materialization/provenance rewrites ids
  without a deterministic mapping.
- Style allowlists can drift unless pinned catalog identity is resolved first.
- Consumers can overclaim permission if they inspect only one denial layer.

## UNKNOWN

- Final policy placement in draft/published portable packages.
- Section/zone-level convenience authoring UX for generating node bindings.
- Session role-to-action mapping and authorization owner.
- Policy behavior for future repeat-generated and editable repeated nodes.

## Intentionally Not Changed

- package/document schemas, parsers, serializers, fixtures, and migrations;
- v4 operations, read session, capability advertisement, and generation;
- backend mutation, persistence, routes, auth, and materialization;
- editor command policy, UI, selection, canvas, and runtime;
- text-block, data resolution, repeat, pagination, renderer, and artifacts.

## Next Recommended Direction

Define pure materialization planning using Published Structure Version identity,
starter graph, policy set, and a backend-supplied instance identity. Preserve
starter authored identities within the instance namespace, allocate no ids from
time, retain policy bindings, and emit explicit provenance before persistence.
