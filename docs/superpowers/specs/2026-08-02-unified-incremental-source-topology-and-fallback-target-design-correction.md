# Unified Incremental Source Topology And Fallback Target Design Correction

Status: accepted written correction as of 2026-08-02. The direction and this
written document received explicit user approval on 2026-08-02. Implementation
may proceed only through the separately approved revised Phase 5B-2 plan and
its review checkpoints.

This document corrects Source transition topology, incremental target
ownership, complete-fallback target validation, text-segment identity,
equal-layout classification, Flow aliasing, and topology work-accounting gaps
found during Phase 5B-2 Task 2 review.

It is normative wherever it conflicts with:

- `2026-07-30-unified-incremental-root-transition-5b-design.md`;
- `2026-08-01-unified-incremental-root-transition-5b-2-v3-amendment-design.md`;
- `2026-08-02-unified-incremental-transition-evidence-v2-design-correction.md`;
  or
- `2026-08-02-unified-incremental-root-transition-5b-2-evidence-v2.md`.

It does not authorize Phase 5B-3, Editor or Backend work, a generic persistent
sequence framework, production activation, Source/Root V1 retirement, or a
complete-next-input hot path.

## 1. Decision

Phase 5B-2 makes these linked decisions:

1. Task 2 preflight owns bounded semantic delta analysis but does not simulate,
   predict, or fingerprint a next Source tree.
2. Task 4 Source path copy is the sole owner of next Source topology and the
   incremental structural target binding.
3. Atomic local Source batches use the existing Source complete-construction
   `canonicalGroups` partition rule, applied locally rather than to a complete
   next suffix.
4. Incremental candidate acceptance and complete-fallback acceptance use two
   different target authorities because their valid tree topologies may differ.
5. Complete fallback validates an exact logical change target by complete-lane
   replay and comparison. It does not compare an independently complete Root
   with the incremental candidate's topology-sensitive Source binding.
6. Physical text fragments may share one authored `inlineId`; process-local
   object/range authority identifies a physical fragment. Inline-addressed
   atomic source kinds remain unique.
7. Effect classification and equal-layout Flow reuse are proven from bounded
   ordered source/layout delta facts, not from topology-sensitive whole-Source
   summary equality.
8. Topology has no private sixteen-entry capability cap. Work stops only
   through an exact active operation-owned evaluator.

Task 3 and Task 4 remain stopped until this correction is reviewed, the
implementation plan is rewritten, and that rewritten plan receives explicit
approval.

## 2. Confirmed failure modes

### 2.1 Unowned ten-entry split

A strict-interior edit of one text item in a full eight-item leaf may replace
that item with a retained prefix, one replacement, and a retained suffix. The
local final occupancy is ten.

The accepted Source policy exposes maximum occupancy eight and the exact
single-overflow `9 -> 4/5` facts. Task 2 currently generalizes occupancies
`9..16` with `floor(occupancy / 2)`, producing `10 -> 5/5`, and blocks values
above sixteen. Neither behavior has accepted policy authority.

### 2.2 Local and complete topology cannot be required to match

Given a previous complete Source tree with leaf occupancies `[8,8]`, a bounded
strict-interior edit in the first leaf may produce ten local entries.

```text
local bounded path copy:   [8,2,8]
independent complete build: [8,8,2]
```

Both results may contain the same ordered logical source facts and valid
eight-way topology. Repacking the local result to the complete result may move
entries through an arbitrarily long retained suffix. The hot path must not do
that work.

Source summaries hash ordered leaf items and then ordered child summaries.
Their semantic, content, source, provenance, paint, layout-dependency, and
boundary fingerprints may therefore differ solely because tree grouping
differs. Exact equality of those fields is valid for one locally constructed
incremental candidate; it is not a valid logical target test for an
independently complete fallback.

### 2.3 Summary slices are not physical Source items

Task 2 can describe retained prefix/suffix summary slices without allocating a
next Source tree. Task 4 must create physical items. A strict-interior change
may leave two retained text fragments with the same authored `inlineId`, while
the current complete-construction index rejects duplicate inline ids.

No implementation may invent semantic identity for retained fragments, choose
one duplicate arbitrarily, or defer this problem until transition two.

### 2.4 Topology is not a layout effect

A partial paint-only or equal-metric style change may split a Source item and
change its tree grouping. That grouping can change a whole-Source Merkle layout
fingerprint even when the ordered measurement facts are unchanged. Such a
change must not be promoted to `geometry-affecting-change` merely because a
topology-sensitive aggregate changed.

## 3. Task 2 bounded semantic preflight

Task 2 remains the Core-owned bounded preflight and Transition Evidence V2
material owner. It consumes the exact previous Root, exact change, exact
Root-bound work policy, and exact registered source/style authority.

It produces one exact process-local preflight authority containing:

- the exact validated change and eligibility;
- exact changed previous and next rendered ranges;
- exact bounded previous source fragments and boundary authorities;
- exact ordered replacement Source items;
- exact registered style resolutions;
- exact ordered semantic/content/source/provenance/paint/layout delta facts;
- exact effect classification;
- Core-owned evidence, verification, and coverage ranges;
- source/material work completed by preflight; and
- no next Source node, next Source summary, next Source fingerprint, or
  incremental structural target binding.

The prior requirement that Task 2 compose `expectedTargetBinding` from virtual
retained summaries is withdrawn. Task 2 must not contain a second Source
packing/rebalancing implementation, including a summary-only approximation of
Task 4 topology.

### 3.1 Classification

Classification compares the exact ordered bounded delta:

- `true-no-op`: ordered rendered content, source/provenance, paint, and layout
  facts are unchanged;
- `semantic-only-change`: source/provenance facts change while ordered rendered
  content, paint, and layout facts remain equal;
- `paint-affecting-change`: paint changes while ordered rendered content and
  layout facts remain equal; or
- `geometry-affecting-change`: rendered content or any shaping, metric,
  boundary, or other layout fact changes.

Leaf boundaries, branch boundaries, node counts, tree heights, and Merkle
grouping are excluded from this effect classification. Exact objects and
ordered scalar facts authorize the comparison; fingerprints are integrity
facts only.

True no-op returns the exact previous Root/Scene as already designed.
Semantic-only and paint-only rows produce no text-runtime request. Geometry
rows enter Transition Evidence V2.

## 4. Task 4 atomic Source range splice

Task 4 is the only owner that allocates a next Source tree. It consumes the
exact Task 2 preflight authority and, for geometry rows, the exact accepted
Transition Evidence V2 authority.

The Source owner performs one atomic range splice:

1. locate the minimal contiguous affected leaf run under exact registered
   range coverage;
2. retain nonempty boundary fragments with their exact logical source facts;
3. remove the exact covered previous fragments;
4. emit the exact ordered replacement items once;
5. form the final ordered item batch without exposing internal mini-edit
   history;
6. partition that batch under Section 4.1;
7. splice emitted nodes into copied ancestors;
8. rebalance under Section 4.2; and
9. mint an unregistered next Source candidate and exact transition authority.

Internal delete/split/insert ordering must not affect identity. A caller cannot
select item routing, donor order, packing, or balancing.

### 4.1 Canonical local batch partition

The normative partition function is the existing Source
complete-construction `canonicalGroups` rule, applied only to an affected local
batch:

```text
while remaining > 9:
  emit the leftmost 8
when remaining == 9:
  emit 4, then 5
when remaining is 1..8:
  emit the remainder
when remaining == 0:
  emit no node
```

Representative results are:

```text
9  -> 4/5
10 -> 8/2
15 -> 8/7
16 -> 8/8
17 -> 8/4/5
```

The same ordered grouping rule applies recursively to final child batches at
each copied branch level. It preserves equal heights and repeats until one
root remains. It never runs from complete ordinal zero merely to reproduce an
independent complete builder's suffix grouping.

Every subtree outside the affected/rebalance path remains the exact previous
object. Repartitioning a copied parent may place exact retained child objects
under new parent objects; it must not clone those children.

There is no topology-specific maximum batch size of sixteen. Safe batch
lengths are governed only by the exact active work policy and safe-integer
checks.

### 4.2 Underflow and root rules

After the atomic splice, rebalancing is deterministic:

1. process bottom-up;
2. process affected sibling positions left-to-right at one level;
3. a leaf minimum is one item;
4. a non-root branch minimum is two children;
5. borrow only the minimum entries required to reach the receiver minimum
   while leaving the donor at or above its minimum;
6. inspect the left donor before the right donor;
7. when borrowing is unavailable, merge left before right;
8. re-evaluate the resulting position before advancing;
9. apply the canonical batch partition to any overflow created at a copied
   level; and
10. collapse a unary root only after its level is stable.

Every donor or merge neighbor must be inside exact Core-owned coverage and its
work evaluator must be checked before the node or item slot is visited. A
missing bounded neighbor or exhausted evaluator returns factual fallback
authority; it does not trigger an unmetered search.

Deleting the complete Source remains blocked while empty-block capability is
inactive.

### 4.3 Topology identity and version decision

This correction treats batch-local use of `canonicalGroups` as the explicit
meaning of the existing Source V1 `canonicalLocalPacking: true` contract. The
complete Source builder, Source policy constants, Source policy fingerprint,
existing complete Roots, accepted 5B-1 V3 Roots, and `5b-1-v3` work-policy
identity remain unchanged.

The selected rule determines only future 5B-2 transitioned Source/Root exact
fingerprints. Transition authority must bind the exact selected packing rule
and the future `5b-2-v1` policy object. It must not reinterpret an already
registered Root.

If implementation evidence shows that the selected behavior requires changing
an existing public field or complete-build invariant rather than adding only
the transition semantics specified here, implementation stops for an explicit
Source-version review.

## 5. Incremental structural target authority

Task 4 returns an exact process-local
`incrementalStructuralTargetAuthority`. Its private record binds:

```text
exact previous Source State object
+ exact Task 2 preflight authority
+ exact accepted Evidence V2 authority when required
+ exact Root-bound work-policy object
+ exact unregistered next Source State object
+ exact Source transition packing rule
+ exact completed Source work
+ topology-sensitive next Source target binding
```

The binding is derived from the actual Source-owner path-copy result, not from
a Task 2 virtual tree. Root assembly later derives the actual Root target
binding and requires:

- the exact next Source object recorded by the authority;
- every topology-sensitive target field to equal the Task 4 binding;
- exact dependency objects from the corresponding stage authorities;
- final work audit success; and
- atomic registration only after every check.

A fingerprint-equal clone, alternate packing, alternate previous tree,
cross-change Source, or unregistered candidate cannot substitute for an exact
authority tuple.

The loss of a Task 2 virtual prediction does not weaken acceptance. Correctness
comes from the Source owner's exact transition authority, independent RED
topology fixtures, downstream exact-object checks, and final Root atomic
registration—not from comparing two implementations of the same packing
algorithm.

## 6. Complete-fallback logical change target

Phase 5B-2 adds an additive
`VNextTextBlockUnifiedLayoutFallbackRequestV2` and matching process-local
completion/target authority for text/field/style transitions. Its source is
`"vnext-text-block-unified-layout-fallback-request-v2"` and its contract
version is `2`. Existing fallback V1 request/completion behavior remains frozen
for the 5B-1 compatibility lane.

The 5B-2 fallback request binds:

```text
exact previous Root object
+ exact original change object
+ exact consumed Core-minted fallback-cause proof
+ exact Root-bound work-policy object
+ exact fallback mode/reason/stage
+ exact completed incrementalCandidateWork
+ document/section/TextBlock target
+ exact single-use request object
```

The fallback-cause proof is the exact accepted authority available at the stop
point: validated change, preflight limit, accepted producer failure, operation
limit, or later proof failure. It is consumed while minting the sanitized
fallback request. The request record retains its closed reason/stage/work facts
but does not retain a cause object that reaches a partial Source, Flow, line,
Scene, delivery, or Root candidate. A stop before bounded preflight completion
does not invent a completed preflight. The complete-lane validator revalidates
the original change against the exact previous Root and supplied complete
material as part of its own work.

It carries the exact change fingerprint and a `changeTargetClaimFingerprint`
covering its canonical request facts for audit/integrity, but those digests do
not mint target authority. The exact WeakMap record does. It carries no partial
candidate fingerprint, summary, range, target binding, topology, or reuse
decision. An independent complete Root is not required to equal an incremental
structural target.

Fallback Request V2 does not expose an `expectedTargetBinding` field whose
meaning could be mistaken for complete-tree structural equality. The
implementation plan must define its closed data shape and V2 completion result
before execution; it may not reuse a V1 field name with a different meaning.

### 6.1 Two-step completion

The protocol remains two-step:

1. the incremental attempt returns `fallback-required` with one exact
   process-local request; and
2. complete material is supplied later only through the complete-fallback
   boundary.

The complete boundary:

1. validates the exact request/policy tuple and single-use authority;
2. invokes the same complete Root V2 construction kernel used by bootstrap,
   with `complete-fallback` construction provenance;
3. performs a complete-lane logical replay of the exact original change over
   the exact previous registered source/spatial/authored-box facts;
4. stream-compares that logical target with the supplied complete material and
   prepared complete Root;
5. validates document/section/TextBlock, authored-box, spatial, source,
   provenance, paint, layout, and change-family-specific target facts;
6. registers only after replay, Root preparation, work audit, and target
   validation all succeed; and
7. otherwise returns a structured fallback-target failure.

The replay comparison is independent of leaf/branch grouping and incidental
physical segmentation. It compares ordered logical spans and exact canonical
scalar facts. Adjacent spans may normalize only when their exact kind, logical
identity, source/provenance, paint, layout, and boundary facts permit it;
fingerprint equality alone cannot coalesce spans.

This complete replay is charged only to `completeFallbackWork`. Complete
fallback may traverse complete previous and supplied complete material because
it is not the incremental hot path. It must not feed replay output, complete
material, or the complete Root back into an incremental stage.

Complete Root construction receives only the independently supplied complete
material, complete construction envelope, and exact complete work policy. The
logical validator may inspect the exact previous Root and original change held
by the fallback request authority, but neither the builder nor validator may
consume Task 2 replacement objects, Task 4 nodes/summaries, failed candidate
ranges, reuse decisions, or any other partial incremental result.

### 6.2 No production normalized-fingerprint framework

This correction does not add a topology-neutral rolling hash, associative
fingerprint, generic normalized sequence tree, or public normalized identity
to the incremental hot path.

The complete fallback validator may create ephemeral normalized comparison
records while already performing complete-lane work. The QA oracle may perform
its separately metered complete normalization. Neither result is retained as
process-local authority by fingerprint.

## 7. Physical text-fragment identity

For transitioned plain-text items:

- `inlineId` is the authored logical inline identity;
- `lineageId` retains the exact authored/change lineage meaning already
  supplied by the previous item or replacement change;
- retained prefix and suffix fragments keep the previous logical identity and
  may therefore share one `inlineId`;
- each physical fragment is a distinct deeply frozen Source item object with
  exact rendered content and an exact item fingerprint;
- exact physical authority is the item object plus its registered Source tree
  position/range, never the `inlineId` string alone; and
- ordered range lookup, not caller-selected `inlineId`, targets later text and
  style changes.

The process-local Source index and complete Source validation become
kind-aware:

- text `inlineId` entries may map to an ordered nonempty fragment set;
- inline images, resolved fields, generated page numbers, hard breaks, and any
  other inline-addressed atomic kind remain unique;
- a singular inline-id lookup never chooses the first of multiple text
  fragments;
- an operation requiring a unique atomic item blocks on zero, multiple, or
  cross-kind matches; and
- exact range/source-node authority selects text fragments for transition
  work.

Complete Source material may likewise contain multiple ordered plain-text
fragments with one logical `inlineId`. This is required so an independent
complete fallback can represent the same retained prefix/replacement/suffix
semantics as an incremental transition. Complete construction continues to
reject duplicate identity for every inline-addressed atomic kind and rejects
ambiguous or unordered text-fragment facts. Existing accepted complete inputs,
outputs, topology, and fingerprints remain unchanged.

Fallback material must preserve the logical identity of retained fragments; it
cannot make a target acceptable by inventing fresh semantic inline identities.
The complete-lane replay verifies fragment ordering and exact source,
provenance, paint, layout, and boundary facts independently of incidental leaf
packing.

Style registry reference counts are maintained per exact physical text item.
Transition two must resolve prefix, replacement, suffix, adjacent retained
items, and released style bindings without reconstructing operation history.

This is an explicit no-data-shape/no-contract-version-bump decision for Source
State V1. `inlineId` continues to mean logical inline identity; the old global
uniqueness check is narrowed to the kinds for which singular inline addressing
is part of the accepted capability. If review determines that widening valid
plain-text segmentation is itself a versioned public semantic change, or if
implementation requires a new serialized segment id, changes the meaning of
an atomic kind's `inlineId`, or exposes ambiguous lookup as accepted authority,
implementation stops for a Source State V2/Root compatibility decision.

## 8. Equal-layout Flow and line ownership

Topology-sensitive Source summary inequality does not by itself invalidate an
equal-layout proof.

For semantic-only and paint-only rows, Task 4 mints an exact bounded
`sourceLayoutDeltaAuthority` proving that every changed ordered logical span
has the same shaping, metric, boundary, and other layout dependency facts.
This authority binds exact previous and next Source objects, exact changed
ranges/items, exact retained subtree authority, and exact work.

Task 5 may bind the exact previous Flow Tree object to the next Source through
the already planned narrow alias proof only when this exact delta authority is
accepted. It does not compare topology-sensitive whole-Source layout
fingerprints as proof of semantic layout equality and does not build a new
Flow wrapper merely to hide that mismatch.

Paint-only rows retain the exact previous Line Tree dependency. Semantic-only
rows may path-copy only source/provenance mappings as already designed while
reusing exact line internals and geometry. Geometry-affecting rows continue
through bounded Flow path copy and text-layout/reconvergence work.

Forced fingerprint collisions must prove that no equal digest can replace an
exact Source, fragment, layout-delta, Flow, or line authority.

## 9. Work ownership

Work remains deterministic, pre-visit, and separated by owner:

- Task 2 counts bounded source/range/style lookup and evidence materialization
  only;
- Task 2 performs no virtual next-tree partition, virtual summary-node
  construction, or next-topology work;
- Task 4 counts every attempted affected leaf item-slot composition under
  `source-leaf-items` before the slot is read/emitted;
- Task 4 counts every attempted changed leaf/branch/root construction under
  `source-path-copy-nodes` before construction;
- donor and merge-neighbor visits are operation-owned Source visits and are
  checked before access;
- complete fallback replay/comparison and independent complete construction
  are recorded only in `completeFallbackWork`;
- QA normalization and complete-oracle construction are recorded only in
  `completeOracleWork`; and
- no stage hides performed work behind a zero counter or recounts producer
  materialization as Source allocation.

The future immutable `5b-2-v1` policy and fixture calibration revision `4`
must include threshold-minus-one, threshold, and threshold-plus-one evidence
for the final Source and complete-fallback units. Existing `5b-1-v3` numbers,
rows, fingerprint, and calibration revision remain unchanged.

No wall-clock or estimated payload byte observation may choose packing,
fallback, or execution path.

## 10. Required RED and adversarial matrix

The rewritten implementation plan must add independent expectations for:

1. full eight-item leaf insertion, deletion, replacement, and partial style
   changes at first, middle, and last positions;
2. final local batches of 9, 10, 15, 16, 17, and an accepted within-limit
   batch above sixteen;
3. exact ordered contents and occupancies, including `10 -> 8/2` and
   `17 -> 8/4/5`;
4. first/middle/last child expansion under a full eight-child parent and
   recursive ten-child branch overflow;
5. multi-leaf and multi-style replacements with canonical replacement order;
6. adjacent underflows, borrow left/right, merge left/right, donor exhaustion,
   and unary-root collapse;
7. exact retained sibling object identity and zero complete suffix traversal;
8. Task 4 structural target authority matching the final incremental Root;
9. the `[8,8]` counterexample producing a valid local `[8,2,8]` and complete
   `[8,8,2]`, with unequal structural Source summaries but accepted exact
   complete-fallback logical target and equal normalized renderer semantics;
10. prefix/replacement/suffix physical fragment identity and a second
    transition over each fragment;
11. duplicate text logical inline identity accepted only through exact
    transition authority, with atomic inline kinds still unique;
12. partial paint-only and equal-metric style changes that alter Source
    topology but retain exact Flow/layout authority without geometry
    promotion;
13. factual Source/fallback limits at threshold-minus-one, threshold, and
    threshold-plus-one;
14. forced collisions for Source nodes, fragments, coverage, transition
    authority, layout-delta authority, fallback request, and target comparison;
15. complete bootstrap and complete fallback using the same complete Root V2
    kernel; and
16. unchanged Source V1 policy fingerprint, accepted 5B-1 V3 Root/work-policy
    identities, public V1 evidence behavior, and inactive empty-block/image/
    exclusion capabilities.

Independent expected topology tests must not import the production packing or
Source path-copy helper.

## 11. Implementation-plan impact

After this document is reviewed and accepted, the Phase 5B-2 plan must be
revised before implementation resumes:

- Task 2 removes virtual next Source summary/topology composition and
  `expectedTargetBinding` ownership;
- Task 2 retains bounded delta classification, exact replacement material,
  style authority, and Transition Evidence V2 request/material ownership;
- Task 3 remains the bounded producer and evidence-acceptance owner;
- Task 4 gains sole Source packing/path-copy, fragment-index, structural-target,
  and source-layout-delta authority ownership;
- Task 5 consumes the exact source-layout-delta authority for Flow aliasing;
- the complete-fallback integration task adds the 5B-2 logical change-target
  Request/Completion V2 authority and complete-lane replay validation;
- policy calibration includes actual Task 4 topology and complete-fallback
  replay work; and
- Task 3 implementation remains stopped until the revised Task 2 review gate
  passes with no Critical or Important finding.

The current `10 -> 5/5` summary-only implementation is not accepted evidence
and must not be used as the starting authority for Task 4.

## 12. Version separation

The accepted identities remain separate:

- Source topology/data contract: Source State V1, under the explicit stop rule
  in Sections 4.3 and 7;
- producer semantic protocol: Transition Evidence V2, unchanged by this
  correction because its adapter-visible material/response meaning does not
  gain topology or fallback facts;
- complete-fallback target protocol: additive Fallback Request/Completion V2;
- execution work policy: future immutable `5b-2-v1`; and
- fixture calibration revision: future revision `4`.

Fallback V2 does not mutate Fallback V1. Source local packing does not mutate
the Source V1 policy fingerprint. A work-limit adjustment does not rename a
semantic contract. A fixture-only calibration change does not change Root
semantic identity. Any departure from these statements requires a written
version decision before code changes.

## 13. Intentionally deferred

This correction does not add:

- a generic rope, sequence, graph-patch, or history framework;
- a topology-normalized production fingerprint;
- complete suffix repacking in the hot path;
- caller-owned physical segment ids, dirty ranges, topology, reuse, or
  fallback decisions;
- empty-block incremental capability;
- generated-page-number mutation;
- inline-image or exclusion mutation through the text protocol;
- Worker session/handle/release lifecycle;
- scheduling, cancellation, queuing, or coalescing;
- Editor staged/atomic apply or visible state;
- Backend persistence/publication;
- Data Definition/Binding runtime; or
- production activation or V1 retirement.

## 14. Gate

Gate state when this draft was written:

1. satisfied — the blocking review was independently reproduced;
2. satisfied — topology and downstream impact audits were completed;
3. satisfied — the user approved the correction direction;
4. satisfied — this written correction received user review and approval;
5. satisfied — the Phase 5B-2 implementation plan was revised against this
   accepted correction on 2026-08-02;
6. satisfied — the revised plan received explicit user approval on 2026-08-02;
   and
7. released — Task 2 recovery may resume under the approved plan; Task 3/4
   remain subject to the 5B-2A review gate and all later checkpoint stops.
