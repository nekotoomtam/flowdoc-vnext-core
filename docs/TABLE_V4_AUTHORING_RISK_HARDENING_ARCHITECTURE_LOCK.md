# Table V4 Authoring Risk Hardening Architecture Lock

Status: Phase 334 architecture lock.

## Outcome

Table v4 destructive and large authoring commands gain a guarded boundary over
the existing pure atomic kernel. The boundary previews exact impact, enforces
execution budgets, pins destructive confirmation to the current/proposed
bundle and reversible change set, and emits a selective undo/redo change set.

The existing kernel remains the deterministic semantic executor. Editor and
backend consumers should use the guarded boundary when user confirmation,
staleness, undo, or workload limits matter.

## Guarded Flow

```text
exact Table authoring request + explicit budgets
  -> run pure kernel against immutable source
  -> derive exact impact + selective reversible change set
  -> enforce budgets
  -> return preview + confirmation facts when destructive

same current request + same budgets + preview confirmation
  -> recompute preview
  -> compare artifact, command, before bundle, proposed bundle,
     change-set, impact, and budget fingerprints
  -> commit or stale-block with source unchanged
```

Preview never persists, mutates editor state, runs measurement/pagination, or
claims that a user confirmed anything.

## Impact Preview

Preview retains:

- destructive/non-destructive classification;
- added, removed, retained, and reordered identities;
- affected section/Table/row/template/column/cell/text-block ids;
- unique affected node count and removed subtree node count;
- measurement/pagination/renderer invalidation reasons;
- factual kernel work counts; and
- before/proposed document, definition, and bundle fingerprints.

The preview may expose proposed fingerprints and change facts but does not
return mutable proposed artifacts as a substitute for commit.

## Destructive Confirmation

Static row delete and column delete require confirmation. Confirmation is a
strict JSON-safe packet, not a boolean:

- exact Structure Draft identity;
- exact command packet;
- before and proposed bundle fingerprints;
- impact and reversible change-set fingerprints; and
- exact execution budgets.

Any document, definition, policy, session permission, command, budget, or
impact drift changes at least one pin and blocks as stale. Core does not infer
that visually similar previews are equivalent.

Insert, reorder, resize, and vertical alignment remain non-destructive and may
commit without a confirmation packet, but still pass budgets.

## Selective Reversible Change Set

The change set stores only changed authoring slices:

- exact section/Table owner;
- changed authored nodes as `before`/`after` node snapshots, with null for
  additions/removals;
- changed semantic columns and row sources only when those arrays differ;
- changed row templates keyed by stable template id; and
- changed header policy only when it differs.

Undo requires the current bundle fingerprint to equal the change set's exact
after fingerprint. Redo requires the exact before fingerprint. Applying either
direction reconstructs the selected slices, re-runs authoring bundle readiness,
and verifies the expected opposite fingerprint before returning artifacts.

This is core reversibility evidence, not durable storage or collaboration
conflict resolution.

## Execution Budgets

Each guarded request supplies positive integer limits:

- `maximumRowTemplateVisits`;
- `maximumAffectedNodeCount`; and
- `maximumRemovedSubtreeNodeCount`.

Core rejects malformed limits. It can preflight obvious row-template excess and
must enforce exact post-plan work/impact before commit or preview readiness.
Budget failure returns source artifacts unchanged and no confirmation packet.

The 1,000-row-template fixture remains accepted under an explicit larger
budget and blocks deterministically one unit below each relevant threshold.

## History Boundary

Committed guarded results retain the same command/operation history contract
plus the reversible change-set fingerprint. Durable history may store the
change set separately or by content-addressed reference later. Existing
forward replay remains valid and independent of undo/redo application.

## PASS Criteria

- deterministic dry-run preview with no mutable proposed artifact handoff;
- destructive confirmation pinned to artifact, command, bundles, impact,
  change set, and budgets;
- stale confirmation blocks with unchanged source;
- selective changed-node and definition-slice snapshots;
- exact undo/redo fingerprint gates and post-apply readiness validation;
- malformed, row-template, affected-node, and removed-subtree budget blocks;
- guarded history/change-set relationship facts;
- bounded deterministic 1,000-row preview/commit/undo/redo evidence;
- no persistence, network, DOM, editor state, measurement, or pagination.

## RISK

- Selective snapshots for a 1,000-row column insertion still contain 1,000
  changed rows/templates and cannot be made tiny without losing reversibility.
- Preview currently executes the pure kernel to obtain exact impact; preflight
  prevents obvious row-template excess but other limits are exact post-plan
  guards rather than CPU cancellation.
- Confirmation packets are exact fingerprints, not authentication or user
  identity proof; transport authorization remains backend-owned.
- Undo/redo blocks on any intervening bundle drift instead of attempting a
  three-way merge.

## UNKNOWN

- Product-selected default budgets and per-tenant limits.
- Durable change-set retention, compression, and content-addressed storage.
- Editor confirmation language and impact visualization.
- Collaboration-aware inverse transformation or operational transform model.
- Whether non-destructive commands should optionally require confirmation in
  highly governed Structure policies.

## Intentionally Not Changed

- canonical document/Table/Table-Definition schemas;
- the pure Table authoring command semantics and capability blocks;
- backend authentication, revision persistence, history storage, or jobs;
- editor modal, selection state, undo stack, or UI;
- collection-source lifecycle, merge/split, rowSpan, and collaboration.

## Next Direction

Implement impact preview plus strict confirmation first, then selective change
sets/undo-redo, and finally budget/scale gates before closing hardening.
