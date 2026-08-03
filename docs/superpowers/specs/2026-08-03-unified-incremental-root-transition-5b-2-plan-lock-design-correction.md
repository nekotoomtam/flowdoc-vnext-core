# Unified Incremental Root Transition 5B-2 Plan-Lock Design Correction

**Date:** 2026-08-03
**Status:** approved design; implementation remains blocked pending a rewritten
implementation plan and its review gates
**Scope:** FlowDoc vNext Core only, process-local, Root V2/Persistent Scene V2
active lane
**Repository baseline inspected:** `d2f4211` on
`phase-5b-unified-incremental-root-transition`

## 1. Decision

Phase 5B-2 will continue through a restricted, capability-honest re-baseline.
It will not patch Task 6 in isolation and will not expand into the image,
nontrivial Spatial, translated-subtree, or product-scale work reserved for
5B-3.

The accepted direction is:

1. keep the existing V3 bootstrap, V1 attempt, V3 policy object, runtime facts,
   and fingerprints exact;
2. add a separate 5B-2 bootstrap and V2 attempt lane without a caller policy
   selector;
3. reopen the affected Task 2-5 semantics and ownership gates before resuming
   Task 6;
4. store exact ordinary/mandatory break topology in a private persistent
   process-local sidecar owned by the Flow stage;
5. restrict the active 5B-2 context to an image-free, trivial-Spatial,
   supported auto-height authored box;
6. keep strict translated reuse inactive in 5B-2, so the active disposition
   lane is `E/R/N` with `T = 0`;
7. derive the final work-policy roster from an exact operation-owner registry
   instead of preserving the proposed `27 / 25 / 2` counts; and
8. require published-Root multi-transition, fallback-Root-to-incremental, and
   actual no-suffix-access evidence before activation.

This correction is normative over conflicting portions of:

- `docs/superpowers/plans/2026-08-02-unified-incremental-root-transition-5b-2-evidence-v2.md`;
- `docs/superpowers/specs/2026-08-01-unified-incremental-root-transition-5b-2-v3-amendment-design.md`;
- `docs/superpowers/specs/2026-08-02-unified-incremental-transition-evidence-v2-design-correction.md`; and
- `docs/superpowers/specs/2026-08-02-unified-incremental-source-topology-and-fallback-target-design-correction.md`.

All nonconflicting requirements in those documents remain active.

## 2. Why the current plan is stopped

The existing direction remains correct in its Core-only ownership, exact-object
authority, Evidence V2, local Source packing, candidate-independent fallback,
and separate work ledgers. The Task 5-to-Task 11 chain is nevertheless
incomplete.

The inspected implementation and plan establish these blockers:

- Evidence V2 produces stable `breakOffsets`, but Incremental Flow Tree V1 and
  the committed Task 5 transition do not retain ordinary break opportunities.
  The uncommitted Task 6 code therefore creates one break group per Flow atom,
  which differs from the complete placement kernel for unspaced Latin, spaces,
  Thai, field adjacency, and mandatory hard breaks.
- The uncommitted Line Tree splice calls a recursive `collectLeaves`, slices
  the flattened result, and rebuilds a complete root while reporting
  `completeSuffixTraversalCount: 0`.
- One `recomputed-lines` charge does not bound Flow-node, Flow-atom, break-group,
  Source-mapping, fragment, or placement work within one line. The partial
  algorithm also reruns placement over a growing prefix and can perform
  quadratic work.
- A changed Source cannot legally reuse the previous Spatial State in a new
  Root until the Spatial owner binds that exact unchanged state to the exact
  next Source.
- A Root containing an inline image or nontrivial Spatial context can reach
  the partial line path even though that path uses one full-width interval and
  omits image line metrics/fragments.
- Blanket exact Flow/Line aliasing can retain stale physical source mappings
  after a partial paint or equal-metric edit splits Source fragments.
- The proposed strict translated lane selects a maximal suffix subtree and
  forbids suffix enumeration, but the current Line, Scene, and Delivery
  contracts require eager per-line/per-chunk absolute geometry and expose no
  subtree-transform delivery operation.
- Task 2 currently accepts hard-break and inline-image sentinels as ordinary
  replacement text, contrary to the higher-precedence Evidence V2 correction.
- Several Source, Flow, Evidence, and line visitors inspect summaries,
  descriptors, child slots, atoms, or index entries before their owner work is
  charged.
- The proposed final policy count was fixed before every operation owner and
  work unit existed.

Passing focused tests do not override these contract failures. The present
Task 6 working diff is unaccepted RED evidence and must not be committed as a
completed task.

## 3. Scope and capability boundary

### 3.1 Active 5B-2 change families

Within the admitted base context, 5B-2 may activate:

- text insertion, deletion, and replacement that remain inside ordinary text;
- resolved-field rendered-value change under the existing registered-style
  and field authority;
- supported semantic-only, paint-only, equal-metric, and metric-affecting text
  style change;
- retained structural hard-break adjacency;
- passive retained generated-page-number text; and
- true no-op on an admitted 5B-2 Root.

The already accepted 5B-1 inline-image paint behavior remains available only
through the frozen V3 Root/Attempt V1 QA lane. It is not imported into Attempt
V2 because the restricted 5B-2 Root profile is image-free.

The ordinary text protocol must reject `CR`, `LF`, `U+2028`, `U+2029`, and
`U+FFFC` in inserted or replacement text. A text range must not cross, remove,
or reinterpret a structural hard-break or inline-image item. Structural
hard-break/image mutation requires its own exact change family and remains
inactive.

### 3.2 Root-bound admission profile

The 5B-2 complete kernel mints one private
`VNextTextBlockUnifiedLayoutTrivialAdmissionAuthorityInternalV1` from the exact
registered Root graph. The V2 transition attempt consumes that authority by
exact object lookup before Evidence, Source, Flow, or line work.

The authority proves the conjunction of all of these facts:

- the Source contains no inline-image item;
- accepted Source item kinds are text, resolved field, passive generated page
  number, and retained structural hard break;
- the Spatial State is the exact canonical empty/trivial state with zero
  entries, no exclusion, no barrier, no extra page/region continuation, and one
  full-width content context;
- the authored box is an already supported exact auto-height shape with no
  fixed-height, clipping, or overflow policy;
- nondefault supported insets and width are allowed only as unchanged exact
  Root facts and must match the existing authored-box kernel; and
- the change does not mutate image, Spatial, authored-box, fixed-height, or
  overflow facts.

Admission is a registry lookup, not an incremental scan. If a complete build
cannot mint the authority, the V2 attempt returns a structured candidate-free
fallback requirement before producer work. The handoff must describe this
base-state restriction explicitly; it may not publish an unqualified
`textStyleIncrementalTransition: true` capability.

### 3.3 Explicitly inactive

5B-2 does not activate:

- a Root with any retained inline image in the text/style V2 lane;
- nonempty or nontrivial Spatial State, exclusions, barriers, multiple
  regions/pages, or flow-region continuation;
- authored-box mutation, fixed-height, clipping, or overflow;
- structural hard-break or inline-image insertion/deletion through ordinary
  text;
- empty-block incremental layout;
- novel/unregistered style insertion;
- generated-page-number mutation;
- strict translated reuse;
- Worker session/handle/release, scheduling, cancellation, or coalescing;
- Editor/Backend integration, persistence, publication, or production;
- Root V1/Scene V1 retirement; or
- general-purpose persistent-tree, transform, or delivery frameworks.

Image, nontrivial Spatial, strict translated reuse, and their scale closure are
assigned to 5B-3.

## 4. Public version and bootstrap separation

The existing public bootstrap
`createVNextTextBlockUnifiedLayoutRootV2(...)` remains paired with the exact
accepted V3/5B-1 QA lane. Its output, policy object, canonical facts,
fingerprints, and Attempt V1 behavior remain unchanged.

5B-2 adds a distinct public bootstrap:

```ts
createVNextTextBlockUnifiedLayoutRoot5B2V1(...)
```

and the already designed distinct V2 attempt:

```ts
attemptVNextTextBlockUnifiedLayoutRootTransitionV2(...)
```

There is no public work-policy argument and no generic policy registry.

The exact compatibility matrix is:

- a V3 Root is accepted only by Attempt V1;
- a 5B-2 Root is accepted only by Attempt V2;
- cross-lane attempts reject before no-op classification;
- equal policy fingerprints do not substitute for the exact registered policy
  object;
- a V2 true no-op returns the exact previous 5B-2 Root and mints no new
  sidecar, proof, cursor, work, or fallback authority; and
- exact 5B-2 Roots constructed as `complete-bootstrap`, `incremental`, or
  `complete-fallback` may enter the next V2 attempt when their current Root
  registry is complete.

The old bootstrap must not build 5B-2-only sidecars or silently add 5B-2 work.

## 5. Persistent relative Break Topology

### 5.1 Ownership and representation

Task 5 owns one private task-specific persistent Break Topology tree. It is a
process-local sidecar, not a public Flow V1 field and not part of the frozen
Flow V1/Root V2 runtime shape.

The tree mirrors exact Incremental Flow Tree node/atom boundaries. Each atom
has one private boundary disposition:

```text
prohibited | opportunity | mandatory
```

The representation stores local/relative rendered lengths and subtree
summaries. It never stores a complete array of revision-wide absolute offsets.
An insertion/deletion before a retained suffix therefore retains exact Break
Topology subtrees rather than shifting every suffix entry.

The sidecar is narrow and task-specific:

- its leaf/branch shape follows the exact Flow Tree shape;
- its complete builder consumes exact accepted complete Evidence break facts;
- Task 5 path copy consumes the exact previous/next Flow replacement ranges
  and accepted Evidence V2 break facts;
- unchanged Flow subtrees retain exact Break Topology subtree objects only
  when all corresponding boundary facts are exact;
- it composes summaries only on copied paths; and
- it exposes only owner lookup/path-copy/group-selection seams needed by
  Tasks 5-7.

It must not become a generic sequence, rope, transform, or renderer framework.

### 5.2 Authority tuple and lifecycle

One exact private record binds:

```text
previous Flow object
+ next Flow object
+ exact Source-stage object
+ exact Flow-binding authority
+ accepted Evidence V2 or exact alias proof
+ previous/next Flow replacement ranges
+ earliest recompute offset and atom boundary
+ exact work-policy object
+ exact Break Topology root
+ completed incremental work
```

Fingerprints are integrity facts only. A clone, a foreign sidecar, a stale
transition record, or an equal forced-collision digest cannot mint authority.

The shared 5B-2 complete kernel creates the same current sidecar schema for
both the new bootstrap and complete fallback. Every accepted incremental Root
registers its new current Flow/Break authority atomically. Transition two and
later derive from the most recently published Root, never from immutable
bootstrap evidence or a previous transition's cursor/proof.

`initialFlowFingerprint` and complete `flowEvidenceFingerprint` remain
bootstrap provenance/integrity facts. They are not current V2 Flow/Break
authority after an incremental transition.

## 6. Source, Flow, Spatial, and Line authority chain

### 6.1 Task 2 and Evidence

Task 2 retains the four distinct ranges:

- changed Source range;
- Evidence target range;
- shaping verification range; and
- coverage range.

It consumes the exact admission authority before request/material work,
rejects ordinary structural sentinels and cross-structural ranges, and does no
next Source topology simulation.

Evidence V2 retains its request-scoped meaning. Its
`sourceTopologyFingerprint` is previous/request-material integrity only; it is
not a next Source target, packing proof, fallback target, or Root authority.

Producer and Core acceptance must charge descriptor, array slot, atom, glyph,
cluster, break, guard, and proof work before the first payload inspection or
emission. Invalid results retain factual partial work.

### 6.2 Task 4 Source authority

The Source owner record binds the full normative tuple:

```text
previous Source
+ exact preflight/admission/change authority
+ accepted Evidence or evidence-free layout-delta proof
+ exact policy
+ canonical local packing rule
+ exact next Source candidate
+ completed work
+ topology-sensitive incremental structural target authority
```

The physical Source index and registered-style/refcount sidecars must be
task-specific bounded persistent structures. They may not use an unbounded
history-depth delta scan, whole-registry clone, or unmetered sort. Their node,
entry, collision-bucket, comparison, and copied-path work is owner-charged
before access.

### 6.3 Task 5 Flow alias and metadata path copy

Exact previous Flow object aliasing is permitted only when the owner proves
that every stored Flow atom/source-segment/provenance/local-offset/boundary
fact is exact for the next physical Source authority.

Layout equality alone does not authorize exact Flow payload aliasing. When a
partial semantic, paint, or equal-metric edit changes physical Source
fragmentation but preserves shaping/layout facts, Task 5 performs bounded
metadata/source-mapping path copy while retaining exact shaping metrics and
Break Topology facts. It mints a distinct exact layout-equivalence authority.

Task 5 registers the exact Flow-stage object. Task 6 rejects cloned,
cross-Root, cross-Source, cross-Evidence, cross-policy, stale, or collision-
substituted stage objects before line work.

### 6.4 Spatial alias

Even the exact trivial Spatial object must be rebound to the exact next Source.
The Spatial owner mints a private single-transition alias from:

```text
previous Source
+ exact next Source
+ exact Source-stage/structural authority
+ exact previous trivial Spatial object
+ exact admission authority
+ exact policy
```

Task 9A requires this alias before Root preparation. Each accepted Root gets a
fresh current binding; no binding from the preceding Root crosses a
transition.

### 6.5 Provisional and final Line ownership

Task 6 produces one unregistered provisional physical line at a time from the
exact earliest Flow replacement boundary. Its cursor is single-use and bound
to the exact Root, change, Flow stage, Break Topology, trivial Spatial alias,
authored-box facts, policy, and work ledger.

Task 7 owns reconvergence proof, canonical disposition, and exact Line Tree
cover selection. Task 8 owns final geometry validation and mints the only final
Line binding accepted by Task 9A.

The final Line record binds exact next Source, next Flow/current Break
Topology, trivial Spatial, authored box, disposition/cover, final Line Tree,
and final geometry. It refreshes recompute-seed, source-mapping, spatial-line,
and authored-line sidecars. It never copies the previous Line Tree's prepared
record wholesale.

All cursor, proof, cover, prepared-stage, work-ledger, and fallback-request
capabilities are transition-local and cannot be reused by a later transition.

## 7. Bounded line work and canonical splice

### 7.1 One-line execution

Task 6 consumes exact Break Topology groups. It does not infer a break after
each shaping cluster, reinterpret Source boundaries, or invoke a second
segmenter.

The one-line algorithm must be linear or have a reviewed amortized-linear
proof. It must not rerun placement over a growing prefix. Before the first
read/emission it charges all applicable work, including:

- Line/Flow/Break lookup nodes;
- Flow and placement atoms;
- break groups and boundary entries;
- Source mapping/index nodes and entries;
- emitted fragments;
- line-record construction; and
- recomputed-line completion.

A long unbreakable or zero-advance-heavy line is therefore bounded by atom,
lookup, group, and fragment work, not by `recomputed-lines = 1`.

### 7.2 Reconvergence and splice

Task 7 may select only a canonical highest-node, stored-left-to-right maximal
exact cover. Exact `E` requires exact object and mapping/geometry authority.

The Line Tree splice receives opaque process-local prefix and suffix
cover/path authorities plus replacement lines. Raw ordinal ranges and
fingerprints are not authority. The Line Tree owner copies only boundary
paths, composes summaries from exact retained subtree summaries, and retains
interior subtree objects by identity.

The success path must not flatten the tree, call `collectLeaves`, rebuild the
complete root, enumerate an accepted suffix, or relabel that work under a
different incremental counter.

## 8. Disposition and translated-reuse decision

The canonical disposition vocabulary remains `E/T/R/N`, mutually exclusive
and exhaustive at the contract level. In active 5B-2:

- `E` is exact retained line object, mapping, internals, and geometry;
- `R` is an existing lineage whose changed facts were actually recomputed or
  source-remapped under factual work;
- `N` is a newly created lineage; and
- `T` is always empty and has no executable geometry, Scene, Delivery, or
  policy path.

If summary proof identifies a suffix that would require one constant
translation, the attempt stops and returns a candidate-free fallback
requirement before enumerating that suffix. It may not label the suffix `R`,
create translated line records, or replace translated Scene chunks.

R is valid only for lines actually recomputed/remapped and charged before
access. A small edit may reach end-of-flow through factual R/N work when no
retained translated suffix is being disguised; a selected strict-translation
suffix always follows the fallback rule above.

Strict translated subtree representation, Scene/Delivery transform support,
and scale activation move to 5B-3.

## 9. Scene, Root, fallback, and oracle

### 9.1 Atomic incremental Root

Task 9A requires exact current authority for every edge:

```text
Source -> Flow/Break
Source -> trivial Spatial
Source/Flow/Break/Spatial -> final Line
Source/Line -> Persistent Scene
Scene -> Delivery
all accepted children -> Root
```

It registers the Root graph only after final work audit, target binding,
delivery validation, and all exact child bindings succeed. A failure retains no
partial Source/Flow/Break/Line/Scene candidate in fallback authority.

### 9.2 Candidate-independent Fallback V2

The two-step protocol remains:

1. the attempt returns one exact single-use fallback request containing only
   previous Root/change/policy, sanitized cause facts, and stopped incremental
   work; then
2. independently supplied complete material enters the complete-fallback
   boundary later.

Bootstrap and fallback call the same private 5B-2 complete kernel. That kernel
creates fresh Source style/index, Flow/Break, admission, Spatial, Line, Scene,
and Root authorities. Logical replay compares the requested logical target,
not incremental local topology. Complete build work, the three fallback replay
units, and QA oracle work remain separate.

A complete-fallback Root must pass the same 5B-2 inspector and must serve as
the exact previous Root of a later accepted V2 transition without retaining
the consumed request/cause/replay authority.

### 9.3 Independent QA oracle

The complete oracle is tests-only. It authors the complete logical target and
runs complete construction without importing incremental candidate/splice
helpers or deriving expected facts from the candidate Evidence response.

Normalized comparison covers exact ordered logical source/provenance facts,
Break Topology semantics, physical line internals/mappings, geometry, authored
box, renderer Scene facts, and complete delivery. Local incremental and
complete Source topology/fingerprints may differ when their normalized logical
semantics are equal.

`completeOracleWork` receives an exact QA-only schema for complete build,
normalization, renderer/source/geometry comparison, and delivery comparison.
It cannot select production execution or fallback.

## 10. Work-policy ownership

The previous proposed `exactly 27 rows`, `25 locked`, and `2 inactive` counts
are withdrawn. The exploratory Task 6 values `8,192 / 32,768 / 8:1` are not
reviewed production limits and must not appear in the active policy, manifest,
or handoff.

Before calibration, the implementation plan must define one exact ordered
operation-owner registry. At minimum it covers:

| Owner | Factual work that requires pre-visit units |
| --- | --- |
| Admission/Task 2 | exact authority lookup when payload access is required; Source coverage nodes/items |
| Task 3 | request/material/response descriptors, atoms, glyphs, clusters, breaks, guards, proof facts |
| Task 4 | Source items, lookup/path-copy nodes, leaf slots, index nodes/entries/comparisons, style nodes/buckets/entries |
| Task 5 | Flow atoms/nodes; Break lookup/path-copy nodes, boundary/group entries, created leaves/nodes |
| Task 6 | seed/Line lookup nodes, Break groups, Flow/placement atoms, Source lookups, fragments, line completion |
| Line splice | cover/path verification, copied boundary nodes, created leaves/nodes; exact E interiors have zero leaf visits |
| Task 7 | proof/summary nodes; no executable T units |
| Task 8 | actual R/N lines and fragments; E is zero work |
| Task 9 | Line/Scene lookup, copied Scene nodes, replacement chunks, retain-cover nodes, delivery operations |
| Fallback V2 | previous logical items, complete logical items, logical spans |
| Complete 5B-2 kernel | complete Source/Flow/Break/admission/Spatial/Line/Scene work, separate from replay/oracle |

Registry unit IDs are unique and deterministically ordered. The policy has one
exact row for every registered runtime unit and no missing, extra, duplicate,
or unknown owner. Calibration fixtures cover every active unit; inactive units
record an exact reason/version. The final row count is derived and asserted
only after this registry is stable.

Every owner checks before the first observable payload read or emission.
Exact WeakMap membership lookup may precede metering; reading a registered
record's payload to choose whether to charge may not. Limit results retain
factual attempted/completed work and no partial candidate crosses fallback.

Thresholds remain deterministic, fixture-derived, separated from semantic
contract version and calibration revision, and tested at limit-minus-one,
limit, and limit-plus-one. Payload size and wall clock remain observational.

## 11. Verification matrix

The revised plan must use exact fixture IDs and a meta-test for required
dimensions. Test names or character counts are not matrix evidence.

Mandatory coverage includes:

- Latin spaced/unspaced and Thai cluster-sensitive text;
- insert/delete/replace at start/middle/end;
- wrap/no-wrap, exact E reconvergence, no reconvergence, and strict-
  translation fallback;
- structural hard-break adjacency and ordinary sentinel rejection;
- resolved field equal/different metrics and passive generated-page context;
- semantic, paint, equal-metric, and metric-affecting style;
- default and supported nondefault unchanged auto-height authored boxes;
- true forced equal-digest collisions with different exact objects/facts;
- every work-unit threshold triple and first-observable hostile sentinel;
- physical structures and lines at 1/8/32/33/128/2,048 scale;
- long unbreakable and zero-advance-heavy single lines;
- exact 2,048-line E suffix with actual instrumentation proving no suffix
  line/chunk/tree-node access;
- a 2,048-line constant-translation suffix that returns fallback with `T = 0`
  before suffix/Scene enumeration;
- old-Root immutability and stale transient-authority rejection; and
- independent complete-oracle equality.

Published-Root sequence tests must include:

1. 5B-2 bootstrap Root 0 -> partial paint/equal-metric Source split Root 1 ->
   metric edit Root 2 -> paint/semantic edit Root 3;
2. metric insert/delete/replace -> semantic/paint;
3. exact E reconvergence -> edit inside the exact retained suffix;
4. same-lane true no-op -> edit, proving no transient authority changed; and
5. fallback-complete Root -> incremental Root -> a third transition.

Every step consumes the exact published Root from the preceding step. Tests
may not create a fresh helper Root for the next transition.

## 12. Review and activation gates

The execution sequence is locked:

1. **Plan-correction review:** approve this correction and its rewritten
   implementation plan before editing implementation.
2. **Redo 5B2A:** reopen Tasks 2-3; preserve new RED evidence, pass corrected
   sentinel/admission/descriptor/oracle matrices, and obtain independent
   review.
3. **Redo 5B2B:** reopen Tasks 4-5; pass Source authority/index/style, Flow
   metadata, Break Topology, first-observable, and multi-transition gates, then
   obtain independent review.
4. **Tasks 6-8:** replace the unaccepted partial Task 6 path, pass canonical
   one-line, exact cover/splice, `E/R/N`, Spatial alias, final Line binding,
   2,048 suffix, oracle, and work gates.
5. **Tasks 9A/9B:** pass Scene/Delivery/atomic Root, candidate-independent
   fallback, and fallback-Root-to-incremental gates.
6. **Tasks 10-11:** calibrate the exact owner registry, activate the new 5B-2
   bootstrap/Attempt V2/Fallback V2/policy/manifest atomically, run focused and
   full Core gates, and close only with no open Critical or Important finding.

Task 6 implementation may not resume before gates 1-3 pass. Existing green
tests for reopened work are regressions, not acceptance authority.

The activation commit changes the 5B-2 lane atomically while leaving V3
bootstrap, V3 policy/fingerprint, and Attempt V1 exact. Manifest assertions use
exact keys/values and object identities rather than partial matching.

## 13. Handoff truth

The final manifest and human-readable handoff must state:

- the exact V3 bootstrap/Attempt V1 and 5B-2 bootstrap/Attempt V2 compatibility
  matrix;
- the accepted previous-Root construction kinds;
- the exact admitted 5B-2 base state and authored-box profile;
- inline-image-containing and nontrivial-Spatial base Roots are unsupported;
- ordinary structural sentinels and structural mutation families are rejected;
- private Break Topology is process-local implementation authority, not a
  public Flow V1 contract field;
- exact/conditional Flow and Line alias semantics;
- `T = 0` and strict translated reuse remains inactive;
- transient proof/cursor/work/request authority cannot cross transitions;
- exact policy ID/fingerprint, derived owner roster, calibration revision, and
  fixture SHA;
- separate incremental, complete-fallback, and complete-oracle ledgers;
- object-graph retention is the only current lifetime claim; and
- all 5B-3, Worker, Editor, Backend, publication, production, and V1 retirement
  capabilities remain false.

## 14. Risks and unknowns retained

The following do not block this design but remain explicit:

- product-scale memory, long-session sidecar retention, and garbage-collection
  timing;
- Worker transport/session/handle/release behavior;
- the numeric limits that will result from corrected operation work and fresh
  calibration;
- 5B-3 lazy/eager translated representation and renderer delivery support;
- mixed inline-image and nontrivial Spatial incremental transition scale;
- scheduling, cancellation, coalescing, Editor visible state, Backend
  persistence/publication, fixed-height, and asset lifecycle.

These unknowns may not be converted into active 5B-2 capability claims.

## 15. Plan disposition

The current implementation plan is not executable beyond its regression value.
The replacement plan must preserve the accepted Tasks 1-5 commits as history,
mark the affected Task 2-5 gates reopened, treat the uncommitted Task 6 work as
unaccepted RED evidence, and implement the review sequence in Section 12.

No implementation file is authorized by this design-doc commit. After this
document is committed, the user reviews the written correction. Only after
that review may a replacement implementation plan be written. Implementation
still requires a separate explicit plan approval.
