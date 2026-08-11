# Canonical Documentation And Development Versioning Design

**Status:** User-approved design; implementation has not started.

**Scope owner:** `flowdoc-vnext-core` first, with one Core-held cross-repository
Development Baseline that references `flowdoc-vnext-editor` and
`flowdoc-vnext-backend` without taking ownership of their release lifecycles.

**Design date:** 2026-08-11

## 1. Decision

FlowDoc will replace its phase-diary-shaped documentation model with an
**Authored Knowledge + Generated Navigation** model.

Human-authored Markdown remains the authority for architecture, contracts,
risk reasoning, unknowns, migration guidance, and other prose that requires
judgment. Small structured records own document identity, terminology,
release-line composition, and exact verified repository snapshots. Generated
and checked-in Markdown maps make those records readable without requiring a
tool at orientation time.

The design has six load-bearing decisions:

1. current facts, risks, unknowns, plans, and evidence are distinct record
   classes and may not silently substitute for one another;
2. release-line folders compose independently versioned contracts and
   subsystem facts; they do not copy those facts into every release;
3. every repository owns an independent SemVer lifecycle, while one Core-held
   Development Baseline records exact cross-repository reference tuples;
4. document, contract, capability, risk, unknown, gate, term, baseline, and
   work identities use typed immutable IDs;
5. one structured glossary source generates the technical and Thai glossaries,
   with immutable exact term definitions and explicit historical lexical
   forms; and
6. Core documentation is migrated subsystem by subsystem as an atomic cutover:
   canonical claims and tests move before superseded files are deleted in the
   same checkpoint.

This is intentionally not a full documentation framework. It creates the
smallest structured spine needed to make routing, identity, applicability, and
evidence references deterministic.

## 2. Evidence Requiring The Reset

The design is based on the repository state inspected on 2026-08-11.

### 2.1 Source-Of-Truth Split

The root `main` worktree is clean at `29d3a61`, which contains the original
Phase 5B design. The latest user-approved Phase 5B-2A implementation and closure
are in the clean linked worktree on
`phase-5b-unified-incremental-root-transition` at `d9b97cb`.

The documentation reset must not derive `CURRENT_STATE` from `main` while that
split exists. D0 Source Baseline Selection must choose one exact clean commit
that contains all accepted work. This design does not authorize a merge, push,
or branch change.

### 2.2 Documentation Volume And Test Coupling

The Core repository has 445 Markdown files, 408 directly under `docs/`, and
approximately 125,694 Markdown lines. The linked Phase 5B worktree has:

- 293 test files that reference documentation or root status documents;
- 277 test files that reference `docs/PHASE_LEDGER.md`;
- 263 test files that reference `README.md`; and
- 136 test files that reference `docs/PHASE_18_IMPLEMENTATION_ROADMAP.md`.

Many of these tests assert phase numbers, prose fragments, and mutual links
among handoff documents. They often protect historical narration rather than
runtime behavior or a durable contract. A path-only rewrite would preserve
that debt under new names.

### 2.3 Package Surface

The root package is private `@flowdoc/vnext-core@0.0.0`. Its current `files`
field includes all of `docs`, `README.md`, and `AGENTS.md`. Without an explicit
distribution boundary, internal risks, roadmaps, unknowns, and agent working
instructions could become package contents when release packaging begins.

### 2.4 Cross-Repository State

`flowdoc-vnext-editor` and `flowdoc-vnext-backend` are both clean on `main`,
both declare private version `0.0.0`, and neither has Core's large doc-coupled
test surface. Core therefore migrates first. Editor and Backend adopt the
proven schema later without moving their documentation ownership into Core.

## 3. Goals

1. Give future contributors one deterministic reading path to current truth.
2. Make each canonical claim identify its owner, applicability, and evidence
   limit.
3. Ensure one word has one normative meaning within one exact Term ID.
4. Preserve old semantic senses without making active contributors read phase
   history by default.
5. Support independent Core, Editor, and Backend release versions.
6. Support future versioned product documentation without copying canonical
   authored documents for every prerelease.
7. Replace prose-link test webs with behavior tests, contract tests, and small
   deterministic documentation validators.
8. Keep Git history as the historical audit trail while removing superseded
   documents from the normal working tree.
9. Keep internal project memory out of package artifacts by default.
10. Prepare a stable truth interface that a later `AGENTS.md` and FlowDoc skill
    can consume without duplicating architecture or status.

## 4. Non-Goals

This design does not authorize or implement:

- deletion, movement, or rewriting of existing documentation;
- migration of any existing test;
- a Core package version bump or registry publication;
- a Git tag, branch merge, push, or stash mutation;
- a public documentation portal or site generator;
- a generic content-management system;
- automatic generation of architecture, risk reasoning, or migration prose;
- Editor or Backend documentation migration;
- a rewritten `AGENTS.md`, personal Codex skill, plugin, or agent capability
  system;
- production activation of any FlowDoc capability; or
- a claim that the current three repository commits are compatible.

The agent operating system is a later design. It may reference the canonical
documentation system produced here, but it may not become another source of
project truth.

## 5. Information Architecture

The target Core structure is:

```text
docs/
|- DOCUMENT_MAP.md                    generated, checked in
|- manifest.json                      authored structured registry
|- glossary.json                      authored structured terminology source
|- GLOSSARY.md                        generated technical glossary
|- GLOSSARY_TH.md                     generated Thai glossary
|- DEVELOPMENT_BASELINE.json          authored exact reference snapshot
|- VERSION_POLICY.md                  authored version rules
|
|- project/
|  |- CURRENT_STATE.md                authored current facts and defects
|  |- RISK_REGISTER.md                authored future adverse possibilities
|  |- KNOWN_UNKNOWNS.md               authored evidence gaps
|  `- ROADMAP.md                      authored future work
|
|- cross-repo/
|  `- BOUNDARY.md                     authored ownership boundary
|
|- contracts/
|  |- layout/
|  |  |- ROOT_V2.md
|  |  |- PERSISTENT_SCENE_V2.md
|  |  `- SOURCE_COMMIT_TRANSACTION_V1.md
|  `- document/
|
|- subsystems/
|  |- layout/
|  |  |- ARCHITECTURE.md
|  |  `- VERIFICATION.md
|  `- document/
|
|- versions/
|  |- 0_1/
|  |  |- release.json                 authored release-line composition
|  |  |- VERSION_OVERVIEW.md          generated, checked in
|  |  |- CAPABILITY_SET.md            generated, checked in
|  |  `- COMPATIBILITY.md             authored and validated
|  `- 0_2/
|
`- public/                             absent until a public-doc design exists
```

The examples under `contracts/layout/` show the intended shape, not a complete
inventory or authority decision for every current layout document. Migration
must discover the exact durable contract set from accepted code, tests, and
reviewed designs.

### 5.1 Ownership By File Class

| Question | Sole canonical owner |
|---|---|
| Where should a reader start? | `DOCUMENT_MAP.md` |
| What exact document IDs and paths exist? | `manifest.json` |
| What does a term mean? | `glossary.json` and generated glossaries |
| What is true now? | `project/CURRENT_STATE.md` |
| What adverse event may happen? | `project/RISK_REGISTER.md` |
| What is not yet known? | `project/KNOWN_UNKNOWNS.md` |
| What work is intended? | `project/ROADMAP.md` |
| What is the active contract? | matching file under `contracts/` |
| How does a subsystem fit together? | matching file under `subsystems/` |
| What does release line `0.1` compose? | `versions/0_1/release.json` |
| What exact commits and gates form a reference snapshot? | `DEVELOPMENT_BASELINE.json` |
| What does runtime actually do? | code, tests, and fixtures |

### 5.2 Fact Taxonomy

The glossary and validators must distinguish:

| Record class | Meaning |
|---|---|
| Fact | An observed statement supported by named evidence. |
| Defect | Current behavior that violates an accepted contract. |
| Unknown | A question for which sufficient evidence does not exist. |
| Risk | A possible future adverse outcome. |
| Decision | An approved policy or boundary. |
| Plan | Intended future work that is not current truth. |
| Evidence | A test, fixture, inspection, or verification result supporting a bounded claim. |

A current defect is not downgraded to a risk. An unknown is not asserted as a
failure. A passing test proves only its named claim limit. A roadmap item does
not make a capability accepted.

## 6. Authored Knowledge And Generated Navigation

### 6.1 Authored Structured Sources

The first structured sources are limited to:

- `manifest.json` for document identity, routing metadata, and lifecycle;
- `glossary.json` for terminology identity and language parity;
- `DEVELOPMENT_BASELINE.json` for exact repository and verification snapshots;
  and
- one `release.json` for each authored release line.

Architecture, contracts, current state, risks, unknowns, compatibility
explanations, and roadmap reasoning remain Markdown.

### 6.2 Generated Files

The first generated Markdown set is limited to:

- `DOCUMENT_MAP.md` from `manifest.json`;
- `GLOSSARY.md` and `GLOSSARY_TH.md` from `glossary.json`; and
- `VERSION_OVERVIEW.md` and `CAPABILITY_SET.md` from a release line's
  `release.json`, resolved through `manifest.json` and the current Development
  Baseline.

Generated files are checked into Git so a contributor can orient without
installing or executing a documentation tool. They carry a generated-file
header and are never edited manually. Verification regenerates them in memory
or a temporary location and fails when the checked-in files differ.

The generator may format and route already-authorized facts. It may not infer
an architecture claim, promote capability maturity, or convert a missing
verification into acceptance.

### 6.3 Document Map Trust Levels

The generated map must prove:

1. **Existence:** every registered path exists;
2. **Identity:** every ID is unique and resolves to exactly one record;
3. **Applicability:** release and contract references obey their declared
   scope; and
4. **Evidence linkage:** a readiness claim resolves to a named verification
   gate accepted by the selected Development Baseline.

This validates routing and bounded claim linkage. Human review remains
responsible for whether authored architecture and risk reasoning are
semantically correct.

## 7. Release And Development Versioning

### 7.1 Independent Repository SemVer

Core, Editor, and Backend own independent Release Versions. They are not
required to have equal numbers or release simultaneously.

The standard form is:

```text
MAJOR.MINOR.PATCH-STAGE.SEQUENCE
0.1.0-a.1
```

Approved prerelease labels are:

- `a` for alpha;
- `b` for beta; and
- `rc` for release candidate.

`PATCH` and prerelease sequence have different meanings. The project does not
use the custom two-component form `0.1-a.1`.

### 7.2 Release Line And Folder Slug

The human and machine release line remains standard dotted notation. Its
authored-folder slug replaces dots with underscores:

```text
Release line: 0.1
Line slug:    0_1
```

The folder name is not itself a SemVer string. The validator deterministically
checks the mapping.

### 7.3 Exact Release Snapshots

Canonical authored documentation is not copied for each alpha, beta, release
candidate, or patch. Exact versions use Git tags and generated artifacts:

```text
SemVer:        0.1.0-a.1
Git tag:       v0.1.0-a.1
Snapshot slug: v0_1_0-a_1
```

An exact snapshot directory may exist in generated documentation output, but
not as another authored canonical tree. No `docs/releases/` record is created
until an actual release process needs one.

### 7.4 Initial Alpha Gate

The current private `0.0.0` means the repository has not entered the formal
release lifecycle. This design does not change it.

Core's proposed first formal version is `0.1.0-a.1`, but it may be assigned
only after:

- the canonical documentation reset is complete for the release's required
  subsystems;
- public/exported contract surfaces are identified;
- the Development Baseline resolves an exact clean Core commit;
- required verification gates pass;
- known unknowns and claim limits are recorded;
- release notes exist; and
- Editor and Backend compatibility are either proven or explicitly
  `not-verified`.

Editor and Backend remain `unversioned` in the Development Baseline until
their own entry gates pass, even if their package manifests still contain
`0.0.0`.

### 7.5 Version Increment Policy

- documentation wording alone does not bump Core Release Version;
- a backward-compatible accepted public capability normally increments minor;
- a correctness fix that preserves accepted compatibility normally increments
  patch when a release is produced;
- a breaking change to an accepted `0.x` public contract increments minor;
- schema and contract versions increment independently of package SemVer; and
- phase or task completion changes evidence or capability maturity, not
  automatically package version.

`1.0.0` requires stable declared public contracts, migration and deprecation
policy, and a proven cross-repository compatibility baseline.

## 8. Shared Development Baseline

The current baseline is stored in Core because Core is the coordination
repository. That storage does not make Core the owner of Editor or Backend
release readiness.

The record shape includes the following illustrative inspected heads. These
values are evidence for the design example only; they do not declare an
accepted cross-repository baseline or compatibility result:

```json
{
  "baselineSchemaVersion": 1,
  "baselineId": "BASELINE-FLOWDOC-20260811-01",
  "recordedAt": "2026-08-11",
  "repositories": {
    "core": {
      "releaseLine": "0.1",
      "releaseVersion": "unversioned",
      "verifiedCommit": "d9b97cb5b3580dc746c355c4e2a0230c629b2d19"
    },
    "editor": {
      "releaseLine": null,
      "releaseVersion": "unversioned",
      "verifiedCommit": "43dcebb22735d7330fda0d57d4e7ce9a726e2454"
    },
    "backend": {
      "releaseLine": null,
      "releaseVersion": "unversioned",
      "verifiedCommit": "280c4ffbe075cd5391cce5219e8f9c40fed16527"
    }
  },
  "verificationSets": [],
  "compatibility": {
    "coreEditor": "not-verified",
    "coreBackend": "not-verified",
    "endToEnd": "not-verified"
  },
  "releaseReady": false
}
```

A baseline is an immutable semantic snapshot. Changing any pinned repository
commit or accepted verification set requires a new `baselineId`. Only one
current baseline file is stored in the working tree; older baselines remain in
Git history and tags.

A pinned commit must have been inspected with a clean working tree. Branch
names are observational metadata at most and are not identity authority.

The baseline record does not attempt to contain the hash of the commit that
contains the record itself. Baseline publication uses a two-commit protocol:

1. commit the complete candidate code, tests, canonical authored documents,
   and generated views as content commit X;
2. run the required verification against exact commit X;
3. commit the baseline record that pins X as a baseline-record-only follow-up
   commit Y; and
4. if a release snapshot is authorized, tag Y.

Commit Y may change only the baseline record and deterministic navigation
fields derived from its already-selected `baselineId`. The same behavior and
documentation validation gates run on Y before handoff. Any source, test,
contract, or semantic-document change invalidates the sequence and requires a
new content commit X. Git identifies the exact commit containing the baseline
record; no recursive self-hash field is introduced.

## 9. Typed Immutable IDs

### 9.1 Format

Stable semantic records use:

```text
<KIND>-<SCOPE>-<SUBSYSTEM>-<SUBJECT>[-VERSION|-SEQUENCE]
```

Examples:

```text
DOC-CORE-PROJECT-CURRENT-STATE
CONTRACT-CORE-LAYOUT-ROOT-V2
CAP-CORE-LAYOUT-INCREMENTAL-ROOT
RISK-CORE-LAYOUT-MEMORY-001
UNKNOWN-CORE-LAYOUT-MEMORY-001
GATE-CORE-LAYOUT-INCREMENTAL-ROOT
TERM-SOURCE-COMMIT-TICKET-V1
WORK-CORE-LAYOUT-MEMORY-001
CONCEPT-SOURCE-COMMIT-TICKET
```

Event records may use a timestamp and sequence:

```text
BASELINE-FLOWDOC-20260811-01
DECISION-CORE-LAYOUT-20260811-01
```

Timestamp IDs are not used for living architecture, contract, capability,
risk, unknown, gate, or glossary identities. Their creation date is metadata,
not meaning.

### 9.2 Identity Rules

- issued IDs never change because a file moves or its heading improves;
- status, owner, path, readiness, and test result are not embedded in IDs;
- a normative meaning change creates a new ID;
- superseded IDs identify their replacement;
- issued term IDs are never deleted or reused;
- namespaces include repository scope where collision is otherwise possible;
  and
- kind, scope, subsystem, authority, lifecycle, audience, and maturity use
  closed enumerations defined by schema and glossary.

The generic field `status` is avoided where it could conflate document
lifecycle, capability maturity, release readiness, and verification result.

### 9.3 Metadata Axes

Document registry entries distinguish:

- `kind`: contract, architecture, current-state, risk-register, and so on;
- `scope`: Core, Editor, Backend, or cross-repository;
- `subsystem`: layout, document, storage, and other controlled values;
- `audience`: internal, public, or both;
- `authority`: normative, evidence, navigation, or explanatory;
- `lifecycle`: draft, active, superseded, or retired; and
- `appliesTo`: release lines, contracts, schemas, or repositories.

Capability `maturity` is a separate closed axis:

```text
planned -> evidence -> accepted -> active -> production -> retired
```

Moving between maturity values does not change capability ID.

## 10. Terminology Model

One structured `glossary.json` generates both language views. It has three
semantic layers.

### 10.1 Term Family

A Term Family groups related semantic evolution without declaring a normative
meaning. Example:

```text
CONCEPT-SOURCE-COMMIT-TICKET
```

### 10.2 Exact Term Definition

Each normative sense has an immutable Term ID and definitions in both
languages:

```text
TERM-SOURCE-COMMIT-TICKET-V1
TERM-SOURCE-COMMIT-TICKET-V2
```

An editorial or translation clarification may retain the ID only when scope,
ownership, lifecycle, and normative conditions do not change. Any normative
meaning change creates a new Term ID.

### 10.3 Lexical Forms

Names associated with an Exact Term Definition are classified as:

- `localized-label`;
- `exact-alias`;
- `historical-alias`;
- `abbreviation`;
- `deprecated-alias`;
- `ambiguous-alias`; or
- `explanatory-alias`.

`meansSameAs` is permitted only for exact semantic equivalence.
`relatedTo` and `supersededBy` are used for related but non-equivalent terms.
An ambiguous lexical form names its possible terms and required resolution
context; the system never guesses.

Normative documents use qualified canonical names and direct Term IDs. If an
old unqualified name could mean V1 or V2, new documents are forbidden from
using it.

### 10.4 Term Lifecycle And Tombstones

```text
draft -> active -> compatibility -> retired
```

Retired entries remain as semantic tombstones. A portal may hide them from
ordinary navigation, but direct resolution and historical documents remain
readable. Git tags additionally preserve the exact glossary snapshot for each
release.

## 11. Reference Model

### 11.1 ID Plus Clickable Path

Canonical Markdown references include both a stable ID and a clickable
relative path:

```markdown
[CONTRACT-CORE-LAYOUT-ROOT-V2 — Root V2](../../contracts/layout/ROOT_V2.md)
```

The manifest resolves the ID to its path. Moving a file requires one registry
change plus updates to affected links; verification fails until both agree.

### 11.2 Release Lines Compose Shared Facts

Release-line folders do not own contract definitions. They select independent
facts:

```text
Core 0.1 -> Root V2 + Persistent Scene V2 + Source Commit Transaction V1
Core 0.2 -> Root V2 + Persistent Scene V2 + Source Commit Transaction V2
```

Therefore `versions/0_2/` never references architecture through
`versions/0_1/`. If two release lines share a contract, both point directly to
the same independently versioned contract file. If the contract meaning
changes, a new contract version and ID are created.

Migration guides are the only normal documents allowed to compare old and new
contract versions directly.

### 11.3 Reference Direction

- `DOCUMENT_MAP` routes to current state, baseline, glossary, and active release
  lines;
- release overviews select capabilities, contracts, and gates;
- capabilities resolve contracts and verification gates;
- risks and unknowns reference affected capability or contract IDs;
- roadmap work references motivating risks, unknowns, or defects;
- verification records reference real tests, fixtures, and commands; and
- tests and code do not treat historical phase prose as runtime authority.

## 12. Verification And Test Migration

### 12.1 Verification Index

Subsystem `VERIFICATION.md` records:

- gate ID;
- supported capability and contract IDs;
- exact test, fixture, and command evidence;
- last accepted Development Baseline; and
- explicit non-claims.

It does not copy test implementation or turn an old test count into permanent
identity. The baseline stores the accepted result summary; tests and fixtures
remain behavioral evidence.

### 12.2 Existing Test Classification

Every doc-coupled Core test is classified before migration:

| Existing intent | Migration |
|---|---|
| Runtime behavior | Retain behavior assertions; remove prose dependency. |
| Durable contract | Move to contract/manifest/glossary validation. |
| Navigation or link existence | Replace with generated-map validation. |
| Phase number or handoff wording | Delete; Git history owns it. |
| README-to-phase mutual reference | Delete or replace with manifest validation. |
| Important claim limit | Move claim into canonical contract or verification record. |
| Historical file-presence guard | Remove with the subsystem cutover. |

Search-and-replace of old document paths is explicitly insufficient.

### 12.3 Validation Gate

The documentation validation command fails on:

- duplicate IDs or term IDs;
- missing registered paths;
- canonical files absent from the registry;
- unresolved ID references;
- generated files differing from their structured sources;
- release-line folder slugs inconsistent with release lines;
- a release line referencing another release line for shared details;
- capabilities referencing missing contracts or gates;
- accepted/active/production claims without baseline-approved verification;
- term references incompatible with a document's contract applicability;
- ambiguous or forbidden aliases in normative documents;
- deleted records with inbound canonical references;
- reuse of issued term tombstones;
- a changed pinned commit tuple under an unchanged baseline ID; and
- canonical documents referencing superseded or unregistered phase documents.

The first implementation remains small and task-specific. Schema extension
requires evidence that the existing fields cannot express a real canonical
record.

## 13. Package Distribution Boundary

Internal project memory is repository-owned and not part of the default package
artifact.

The eventual package allowlist may include only:

- package runtime/type/fixture assets already authorized by the package design;
- `README.md`;
- public documentation when a separate public-doc design approves it; and
- explicitly consumer-facing contracts when their distribution is intentional.

The default package must exclude:

- `AGENTS.md`;
- `project/RISK_REGISTER.md`;
- `project/KNOWN_UNKNOWNS.md`;
- `project/ROADMAP.md`;
- internal Development Baseline coordination records;
- internal architecture/review notes not intended for consumers; and
- historical phase/design/handoff documents.

Migration verification includes a package dry run and an exact artifact file
allowlist. The repository may retain internal documents without shipping them.

## 14. Migration Model

### 14.1 No Big-Bang Rewrite

Core migrates subsystem by subsystem. Legacy files for a scope that has not yet
been migrated may remain temporarily as legacy evidence and test dependencies.
Within a scope that is being cut over, old and new files may coexist only
inside the active migration checkpoint and may not both be declared canonical.
After that scope passes its cutover gate, its superseded files and historical
file-presence tests are removed in the same checkpoint.

`manifest.json` lists only new canonical records. A one-time implementation
plan may map old files to canonical targets or deletion, but that migration map
is not project truth and does not survive as another permanent registry.

### 14.2 Subsystem Cutover Transaction

Each subsystem checkpoint performs, in order:

1. pin the exact clean source baseline;
2. inspect accepted code, tests, fixtures, reviewed design, and current gaps;
3. classify candidate statements as Fact, Defect, Unknown, Risk, Decision,
   Plan, or Evidence;
4. author the smallest canonical contract, subsystem, verification, and
   release-composition records;
5. register stable IDs and applicable glossary terms;
6. migrate behavior and durable contract tests;
7. remove historical prose and file-presence tests that no longer own truth;
8. delete superseded documents in the same checkpoint;
9. regenerate maps and glossaries;
10. run documentation validation, focused subsystem gates, type-check, package
    boundary checks where affected, and the appropriate broader suite; and
11. publish the Development Baseline through the two-commit protocol only after
    the exact content commit and verification set are known.

If a durable claim cannot be placed without ambiguity, the cutover stops. It
does not preserve two canonical documents as a workaround.

### 14.3 Migration Checkpoints

#### D0 — Source Baseline Selection

Choose the exact clean commit containing all accepted work. Resolve the current
`main` versus Phase 5B worktree split through a separately authorized Git
decision. No content migration begins before D0.

#### D1 — Canonical Spine

Add schemas, structured sources, deterministic generation, and validation.
Populate only enough entries to prove the system; do not claim a subsystem has
migrated merely because infrastructure exists.

#### D2 — Project Truth Plane

Create Current State, Risk Register, Known Unknowns, Roadmap, Version Policy,
Development Baseline, and cross-repository boundary. A later agent-system task
may then replace `AGENTS.md` required-reading rules.

#### D3 — Layout And Incremental Transition

Migrate the latest, best-evidenced subsystem first: Root V2, Persistent Scene
V2, Phase 5A/5B incremental transition, Source authority, Source sidecars, and
Source Commit Transaction. Preserve exact claim limits such as Core-only,
process-local, inactive product integration, and bounded object-graph lifetime
evidence.

#### D4 — Remaining Core Subsystems

Apply the same cutover transaction one subsystem at a time. Checkpoint size is
defined by a coherent ownership boundary, not one task per old document.

#### D5 — Package And Release Documentation Boundary

Narrow package documentation contents, prove package dry-run output, and
prepare—but do not automatically trigger—the Core `0.1.0-a.1` entry decision.

#### D6 — Cross-Repository Adoption

After Core proves the model, design and migrate Editor and Backend separately.
Core's baseline references their exact commits and declared versions but cannot
promote their readiness.

## 15. Risks And Decisions

| Risk | Decision |
|---|---|
| Canonical reset starts from stale `main` | D0 exact source selection is mandatory. |
| New paths preserve old prose-test debt | Every doc-coupled test is classified by intent. |
| Old and new docs create dual truth | Only manifest-listed records are canonical; cutover deletes old files in the same checkpoint. |
| Generated maps look correct but claims are false | Release claims require contract and baseline-approved gate resolution plus human semantic review. |
| Version folders copy contracts | Release lines compose independently versioned contracts and subsystem facts. |
| Exact prerelease folders proliferate | Exact snapshots come from tags/artifacts; authored folders use `0_1`, `0_2`. |
| Glossary updates reinterpret old docs | Exact term senses are immutable; changed meaning gets a new Term ID. |
| Old aliases confuse current readers | Lexical forms classify historical, deprecated, and ambiguous aliases. |
| IDs change when files move | IDs are semantic and immutable; paths are mutable registry metadata. |
| One generic status field conflates concepts | Lifecycle, maturity, readiness, and verification result are distinct axes. |
| Core implies Editor/Backend compatibility | Baseline uses explicit `not-verified` until cross-repository evidence exists. |
| Internal project memory ships in package | Package documentation changes to an explicit consumer-facing allowlist. |
| Structured documentation becomes a framework | Only four structured source classes and five generated views are initially allowed. |
| Historical audit trail is lost | Git history and release tags retain deleted documents and exact snapshots. |
| Future agents still scan history by default | Later `AGENTS.md` and FlowDoc skill must start from generated current maps and active release composition. |

## 16. Acceptance Criteria

The design is ready for implementation planning only when the user confirms:

1. Authored Knowledge + Generated Navigation is the selected approach;
2. release-line folders are composition maps using slugs such as `0_1`;
3. exact prerelease snapshots use tags/artifacts rather than copied authored
   folders;
4. Core, Editor, and Backend own independent SemVer lifecycles;
5. the Core-held Development Baseline is coordination evidence, not ownership
   of other repositories;
6. typed semantic IDs and timestamp-only event IDs are accepted;
7. Term Family, Exact Term Definition, and Lexical Form are the terminology
   model;
8. generated maps and glossaries are checked in and validated;
9. superseded documents are deleted after an atomic subsystem cutover and
   retained only in Git history;
10. doc-coupled tests are reclassified rather than path-rewritten;
11. internal agent, risk, unknown, roadmap, and baseline documents are excluded
    from package artifacts by default;
12. D0 resolves the stale-main/latest-worktree split before content migration;
13. Core migrates before Editor and Backend; and
14. agent working agreements and FlowDoc-specific skills are designed only
    after canonical project memory is established.

Implementation must not begin until this written design passes self-review,
the user reviews the committed specification, and a separate detailed
implementation plan is approved.
