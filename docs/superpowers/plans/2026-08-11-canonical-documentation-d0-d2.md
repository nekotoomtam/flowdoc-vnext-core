# Canonical Documentation D0-D2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Select one exact clean source baseline, establish the smallest trustworthy canonical-documentation spine, and publish the Core project truth plane without claiming that any runtime subsystem has already migrated or that any package is release-ready.

**Architecture:** Authored JSON and Markdown own facts; small repository-internal Node ESM tools validate identities/references and render only the approved navigation views. Core provisionally hosts neutral coordination records, while repository-local truth stays local. Content is completed and verified at commit X; an immutable Development Baseline that pins X is then published in a baseline-only commit Y.

**Tech Stack:** Node.js ESM with built-in `node:fs`, `node:path`, `node:child_process`, and `node:crypto`; JSON structured sources; Markdown authored/generated views; TypeScript Vitest integration tests; npm scripts; Git worktree isolation.

## Global Constraints

- Governing design: [Canonical Documentation And Development Versioning Design](../specs/2026-08-11-canonical-documentation-versioning-design.md).
- This plan covers only D0, D1, and D2. D3 Layout cutover, D4 remaining subsystems, D5 package/release boundary, D6 Editor/Backend adoption, D7 coordination transfer, and the later AGENTS/FlowDoc skill redesign each require a separate reviewed plan.
- No implementation starts before D0 selects one exact clean Core commit and the user separately authorizes any Git integration needed to reach it.
- Do not push, merge, rebase, reset, cherry-pick, switch the user's main checkout, or mutate the existing stash without explicit user authorization.
- Core is only the **Provisional Coordination Host**. Use neutral repository IDs and relocation-safe schemas. Do not encode Core filesystem paths or Core ownership into shared coordination identities.
- `manifest.json` lists only records in the new canonical system. Existing phase/superpowers/handoff documents remain legacy evidence until their subsystem cutover; they are not bulk-registered and are not bulk-deleted in D1-D2.
- D1-D2 must not claim that Layout, Phase 5A/5B, Source authority, Editor, Backend, or end-to-end compatibility has migrated merely because infrastructure exists.
- Runtime code, `src/index.ts`, package exports, package version `0.0.0`, package `files`, and release publication remain unchanged.
- Internal docs still fall under the current broad package `docs` allowlist until D5. Record this as an active risk and prohibit package publication in D1-D2; do not silently solve D5 here.
- Authored sources are never overwritten by generation. Generated output is limited to `DOCUMENT_MAP.md`, `GLOSSARY.md`, `GLOSSARY_TH.md`, `VERSION_OVERVIEW.md`, and `CAPABILITY_SET.md`.
- Every generated file carries a generated-file header and is checked into Git. `docs:check` renders in memory and fails on drift.
- The generator formats already-authorized facts only. It cannot infer architecture, promote capability maturity, create verification acceptance, or turn missing evidence into readiness.
- Stable IDs are immutable and typed. Timestamp IDs are restricted to event records such as `BASELINE-*` and `DECISION-*`.
- The structured glossary is the only glossary authority. Technical and Thai glossaries are projections of the same exact term records.
- One lexical form never silently resolves to multiple meanings. Ambiguous aliases list their candidate Term IDs and required context; normative docs must use qualified names and direct IDs.
- Tests use real temporary repositories/directories and the production Node entrypoints. Do not validate only private helper return values.
- Use strict TDD for every behavior: preserve expected RED, implement minimum GREEN, run focused gate, type-check, `git diff --check`, and inspect exact changed paths.
- Commit by coherent responsibility. Do not combine the D0 authorization record, content commit X, and baseline publication commit Y.

---

## D0 Selected Baseline And Stop Rule

User-approved D0 source selection:

```text
repository: flowdoc-vnext-core
worktree: C:\Users\nekot\Documents\GitHub\flowdoc-vnext-core\.worktrees\phase-5b-unified-incremental-root-transition
branch: phase-5b-unified-incremental-root-transition
HEAD: 5bcb497cefe742222a835637cc33eddd5f96b685
working tree: clean
stash top: c711c1135a3e3808d6b0da042c6d2eadec484431
```

Inspected related repository references:

```text
Editor:  43dcebb22735d7330fda0d57d4e7ce9a726e2454
Backend: 280c4ffbe075cd5391cce5219e8f9c40fed16527
D0 compatibility result: not-verified
D0 release readiness: false
```

Before every task, re-run branch, HEAD, status, staged-state, and stash checks. If any exact value or dirty path differs from the latest reviewed checkpoint, stop and report the difference before editing.

## Intended File Map

### Repository-internal tooling

- `scripts/documentation/canonical-docs-model.mjs`
  - Parses and validates the five structured source types.
  - Owns closed enumerations, typed-ID checks, reference resolution, baseline evolution checks, and deterministic normalization.
- `scripts/documentation/canonical-docs-render.mjs`
  - Pure renderers for the five approved generated Markdown views.
- `scripts/generate-canonical-docs.mjs`
  - CLI that reads exact authored sources and writes only approved generated paths.
- `scripts/check-canonical-docs.mjs`
  - CLI that validates structured/authored records, compares generated output in memory, and checks prior baseline identity through Git when available.
- `scripts/publish-development-baseline.mjs`
  - Narrow CLI that writes one exact baseline record from explicit full commit hashes after content commit X; it does not commit, tag, or publish Git state.

### Canonical structured and authored sources

- `docs/manifest.json`
- `docs/glossary.json`
- `docs/VERSION_POLICY.md`
- `docs/coordination/REPOSITORY_INDEX.json`
- `docs/coordination/BOUNDARY.md`
- `docs/coordination/DEVELOPMENT_BASELINE.json` — added only in commit Y.
- `docs/project/CURRENT_STATE.md`
- `docs/project/RISK_REGISTER.md`
- `docs/project/KNOWN_UNKNOWNS.md`
- `docs/project/ROADMAP.md`
- `docs/versions/0_1/release.json`
- `docs/versions/0_1/COMPATIBILITY.md`

### Generated, checked-in navigation

- `docs/DOCUMENT_MAP.md`
- `docs/GLOSSARY.md`
- `docs/GLOSSARY_TH.md`
- `docs/versions/0_1/VERSION_OVERVIEW.md`
- `docs/versions/0_1/CAPABILITY_SET.md`

### Tests and package scripts

- `tests/canonicalDocumentationSpine.test.ts`
- `package.json`

No other production, test, documentation, or package path is authorized by this plan.

---

### Task 0: D0 Exact Source Baseline Selection

**Files:**
- Modify only after user approval: `docs/superpowers/plans/2026-08-11-canonical-documentation-d0-d2.md`
- Read: all three repositories' `AGENTS.md`, branch, HEAD, status, upstream, and worktree lists.

**Purpose:** Resolve the stale-main/latest-worktree split before any canonical content exists. This is a human authorization gate, not an implementation task.

- [ ] **Step 1: Inspect all exact repository states read-only**

Run from each repository:

```powershell
git status --short --branch
git rev-parse HEAD
git branch --show-current
git rev-parse --verify origin/main
git rev-list --left-right --count origin/main...HEAD
git worktree list --porcelain
git stash list --format='%H %gd %s'
```

Also read every applicable `AGENTS.md`. Do not fetch unless the user separately authorizes network/upstream refresh.

- [ ] **Step 2: Build the exact candidate comparison**

Report separately:

1. root Core `main` head and cleanliness;
2. linked Phase 5B worktree head and cleanliness;
3. commits present only on each Core candidate;
4. Editor and Backend inspected heads and cleanliness;
5. whether the planning baseline above is still accurate.

- [ ] **Step 3: Stop for the user's Git decision**

Recommend one exact Core content source, but do not merge/cherry-pick/switch. Ask the user to authorize the exact Git operation if one is needed. D1 is blocked until the selected source is reachable in one isolated clean worktree.

- [ ] **Step 4: Record the accepted source without inventing compatibility**

After authorization, capture the literal values:

```powershell
$d0Core = git rev-parse HEAD
$d0Editor = git -C C:\Users\nekot\Documents\GitHub\flowdoc-vnext-editor rev-parse HEAD
$d0Backend = git -C C:\Users\nekot\Documents\GitHub\flowdoc-vnext-backend rev-parse HEAD
```

Replace the planning-baseline block with the three literal 40-character outputs
plus `D0 compatibility result: not-verified` and
`D0 release readiness: false`. If either related-repository hash differs from
the planning observation, update the two Task 6 literal comparison values in
the same plan-only commit. Then commit only this plan update:

```powershell
git add -- docs/superpowers/plans/2026-08-11-canonical-documentation-d0-d2.md
git diff --cached --check
git diff --cached --name-only
git commit -m "docs: select canonical documentation source baseline"
```

Expected staged path count: exactly one. If source selection required a Git integration operation, that operation must remain a separate user-authorized commit and be verified before this record.

---

### Task 1: Build The Executable Canonical Model

**Files:**
- Create: `scripts/documentation/canonical-docs-model.mjs`
- Create: `tests/canonicalDocumentationSpine.test.ts`

**Structured source contracts:**

```js
export const STRUCTURED_PATHS = Object.freeze({
  manifest: "docs/manifest.json",
  glossary: "docs/glossary.json",
  repositoryIndex: "docs/coordination/REPOSITORY_INDEX.json",
  baseline: "docs/coordination/DEVELOPMENT_BASELINE.json",
  release: "docs/versions/0_1/release.json",
})

export const GENERATED_PATHS = Object.freeze([
  "docs/DOCUMENT_MAP.md",
  "docs/GLOSSARY.md",
  "docs/GLOSSARY_TH.md",
  "docs/versions/0_1/VERSION_OVERVIEW.md",
  "docs/versions/0_1/CAPABILITY_SET.md",
])
```

The model uses plain Node objects and explicit validators; do not introduce a generic documentation framework or a second schema authority. Required closed axes:

```js
document kind: navigation | glossary | version-policy | repository-index |
  coordination-boundary | development-baseline | current-state |
  risk-register | known-unknowns | roadmap | release-composition |
  compatibility
scope: core | editor | backend | cross-repository
audience: internal | public | both
authority: normative | evidence | navigation | explanatory
lifecycle: draft | active | superseded | retired
capability maturity: planned | evidence | accepted | active | production | retired
term lifecycle: draft | active | compatibility | retired
lexical form kind: localized-label | exact-alias | historical-alias |
  abbreviation | deprecated-alias | ambiguous-alias | explanatory-alias
```

Authored Markdown remains prose authority, but stable records inside a
multi-record file use one machine-readable JSON metadata block immediately
after their heading:

```markdown
## RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001 — Dual canonical truth

<!-- FLOWDOC-RECORD
{"recordId":"RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001","recordKind":"risk","lifecycle":"active","affects":["DOC-CORE-NAVIGATION-MANIFEST"]}
-->
```

The block carries identity, closed metadata, and outbound IDs only. The
surrounding Markdown remains the sole owner of reasoning. The parser rejects a
record block without a matching heading, duplicate records, unknown metadata,
or prose that contradicts a required record section. This avoids YAML/tooling
dependencies and avoids moving risk/unknown/roadmap reasoning into JSON.

- [ ] **Step 1: Write the failing end-to-end fixture tests**

Create a helper that writes a complete minimal fixture under `mkdtempSync`, then executes the real CLI later with `spawnSync(process.execPath, [scriptPath, "--root", fixtureRoot])`. Initial tests must fail because the model/CLI does not exist or does not yet reject:

1. duplicate `DOC-*` IDs;
2. duplicate `TERM-*` IDs;
3. wrong typed prefix for a record kind;
4. missing registered path;
5. a canonical file below a declared canonical root absent from the manifest;
6. unresolved `DOC`, `CONTRACT`, `CAP`, `RISK`, `UNKNOWN`, `GATE`, `TERM`, `CONCEPT`, `WORK`, `BASELINE`, or `DECISION` reference;
7. release line `0.1` with a folder slug other than `0_1`;
8. release line composition pointing into another `versions/*` folder;
9. accepted-or-higher capability without a referenced accepted gate in the selected baseline;
10. same baseline ID with a changed pinned tuple;
11. ambiguous alias used in normative Markdown;
12. deleted term identity instead of a retained retired tombstone.

Run and preserve RED:

```powershell
npx vitest run tests/canonicalDocumentationSpine.test.ts --maxWorkers=1
```

- [ ] **Step 2: Implement exact parsing and validation**

Expose only task-specific functions:

```js
export function loadCanonicalDocumentationModel(root, options = {})
export function validateCanonicalDocumentationModel(model, options = {})
export function validateDevelopmentBaselineEvolution(previous, next)
export function collectCanonicalReferences(markdown)
export function collectEmbeddedCanonicalRecords(markdown)
```

Rules:

- JSON objects reject unknown top-level fields.
- Arrays preserve authored order only where prose order is meaningful; identity maps are rendered in stable ID order.
- full Git hashes match `/^[0-9a-f]{40}$/`.
- stable IDs match their exact kind prefix.
- event IDs match `BASELINE-FLOWDOC-YYYYMMDD-NN` or `DECISION-<SCOPE>-<SUBSYSTEM>-YYYYMMDD-NN`.
- `meansSameAs` resolves only to a semantically exact term and is forbidden on ambiguous forms.
- `supersededBy` resolves to a different exact Term ID in the same Concept family.
- active normative docs may not reference superseded/retired document records or legacy phase prose.
- canonical-root enumeration is bounded to roots declared by this manifest; it does not enumerate all 400+ legacy documents.

- [ ] **Step 3: Prove GREEN and commit**

```powershell
npx vitest run tests/canonicalDocumentationSpine.test.ts --maxWorkers=1
npm run type-check
git diff --check
git add -- scripts/documentation/canonical-docs-model.mjs tests/canonicalDocumentationSpine.test.ts
git diff --cached --name-only
git commit -m "test(docs): define canonical documentation model"
```

Expected staged paths: exactly two.

---

### Task 2: Add Deterministic Generation And Drift Checking

**Files:**
- Create: `scripts/documentation/canonical-docs-render.mjs`
- Create: `scripts/generate-canonical-docs.mjs`
- Create: `scripts/check-canonical-docs.mjs`
- Modify: `tests/canonicalDocumentationSpine.test.ts`
- Modify: `package.json`

**CLI contracts:**

```text
node scripts/generate-canonical-docs.mjs [--root <absolute-or-relative-root>]
node scripts/check-canonical-docs.mjs [--root <root>] [--allow-pending-baseline <BASELINE-ID>]
```

`--allow-pending-baseline` is accepted only during content commit X preparation and only for one exact baseline ID already referenced by `release.json`; the final Y gate runs without it.

- [ ] **Step 1: Write generator behavior REDs**

Add fixture tests proving:

- output is byte-identical across two runs;
- all five files start with `<!-- GENERATED FILE — DO NOT EDIT -->`;
- `docs:check` fails when one generated byte is edited;
- generation never writes an authored path;
- generation fails rather than inventing output from missing or invalid structured input;
- technical and Thai glossaries contain the same Term IDs in the same order;
- a pending baseline produces an explicit `not published / not release-ready` view, not an accepted claim.

- [ ] **Step 2: Implement pure renderers**

```js
export const GENERATED_HEADER = "<!-- GENERATED FILE — DO NOT EDIT -->\n"

export function renderDocumentMap(model)
export function renderTechnicalGlossary(model)
export function renderThaiGlossary(model)
export function renderVersionOverview(model, release)
export function renderCapabilitySet(model, release)
export function renderGeneratedFiles(model)
```

Render rules:

- stable ID ascending order is the deterministic tiebreaker;
- every map link is `[ID — title](relative/path.md)`;
- document map groups active current truth, coordination, version line, glossary, then non-active records;
- generated release views state `releaseVersion: unversioned`, `releaseReady: false`, and `compatibility: not-verified` until exact sources authorize otherwise;
- empty capability and contract sets render an explicit “no subsystem cutover registered” non-claim.

- [ ] **Step 3: Add package scripts**

Modify only `scripts` in `package.json`:

```json
"docs:generate": "node scripts/generate-canonical-docs.mjs",
"docs:check": "node scripts/check-canonical-docs.mjs"
```

Keep `docs:check` separate from the existing root `check` throughout D0-D2.
Commit X legitimately uses pending-baseline mode while Y uses normal mode, so
binding one mode into the root command would make either X or Y dishonest. A
later agent/package workflow may integrate the gates after the baseline exists.
Do not change version, privacy, `check`, exports, files, dependencies, or
lockfile.

- [ ] **Step 4: Prove GREEN and commit**

```powershell
npx vitest run tests/canonicalDocumentationSpine.test.ts --maxWorkers=1
npm run type-check
git diff --check
git add -- package.json scripts/documentation/canonical-docs-render.mjs scripts/generate-canonical-docs.mjs scripts/check-canonical-docs.mjs tests/canonicalDocumentationSpine.test.ts
git diff --cached --name-only
git commit -m "feat(docs): add deterministic canonical navigation"
```

Expected staged paths: exactly five.

---

### Task 3: Author The Minimal Canonical Spine

**Files:**
- Create: `docs/manifest.json`
- Create: `docs/glossary.json`
- Create: `docs/coordination/REPOSITORY_INDEX.json`
- Create: `docs/coordination/BOUNDARY.md`
- Create: `docs/versions/0_1/release.json`
- Create: `docs/versions/0_1/COMPATIBILITY.md`
- Modify: `tests/canonicalDocumentationSpine.test.ts`
- Generate: the five approved generated Markdown paths.

**Manifest minimum shape:**

```json
{
  "manifestSchemaVersion": 1,
  "repositoryId": "REPO-FLOWDOC-CORE",
  "canonicalRoots": [
    "docs/project",
    "docs/coordination",
    "docs/versions/0_1"
  ],
  "documents": []
}
```

Populate `documents` with exact records for every D1-D2 authored/generated path
except the not-yet-published Development Baseline. Task 6 adds that one record
atomically with the baseline file. Every entry has `documentId`, `title`,
`path`, `kind`, `scope`, `subsystem`, `audience`, `authority`, `lifecycle`, and
`appliesTo`. Top-level manifest/glossary/generated map paths are explicitly
registered even though they sit outside `canonicalRoots`.

Use this exact D1 inventory; Task 4 adds the five project-truth IDs and Task 6
adds the baseline ID:

```text
DOC-CORE-NAVIGATION-MANIFEST
DOC-CORE-NAVIGATION-DOCUMENT-MAP
DOC-FLOWDOC-TERMINOLOGY-GLOSSARY-SOURCE
DOC-FLOWDOC-TERMINOLOGY-GLOSSARY-TECHNICAL
DOC-FLOWDOC-TERMINOLOGY-GLOSSARY-THAI
DOC-FLOWDOC-COORDINATION-REPOSITORY-INDEX
DOC-FLOWDOC-COORDINATION-BOUNDARY
DOC-CORE-VERSION-0-1-RELEASE-COMPOSITION
DOC-CORE-VERSION-0-1-VERSION-OVERVIEW
DOC-CORE-VERSION-0-1-CAPABILITY-SET
DOC-CORE-VERSION-0-1-COMPATIBILITY
```

**Repository index minimum facts:**

```json
{
  "repositoryIndexSchemaVersion": 1,
  "provisionalHostRepositoryId": "REPO-FLOWDOC-CORE",
  "futureCoordinationRepository": {
    "workingName": "flowdoc-vnext-coordination",
    "lifecycle": "not-created"
  },
  "repositories": [
    {"repositoryId":"REPO-FLOWDOC-CORE","name":"flowdoc-vnext-core","manifestAdoption":"active"},
    {"repositoryId":"REPO-FLOWDOC-EDITOR","name":"flowdoc-vnext-editor","manifestAdoption":"not-adopted"},
    {"repositoryId":"REPO-FLOWDOC-BACKEND","name":"flowdoc-vnext-backend","manifestAdoption":"not-adopted"}
  ]
}
```

Do not place local checkout paths or readiness claims in this record.

**Release-line minimum facts:**

```json
{
  "releaseSchemaVersion": 1,
  "repositoryId": "REPO-FLOWDOC-CORE",
  "releaseLine": "0.1",
  "folderSlug": "0_1",
  "lifecycle": "planned",
  "releaseVersion": "unversioned",
  "baselineId": "BASELINE-FLOWDOC-20260811-01",
  "capabilityIds": [],
  "contractIds": [],
  "verificationGateIds": [],
  "compatibilityDocumentId": "DOC-CORE-VERSION-0-1-COMPATIBILITY",
  "releaseReady": false
}
```

The baseline ID is reserved for this D0-D2 publication sequence. If D0 execution occurs after 2026-08-11 or that ID already exists in history, allocate the next valid event ID before any source is written and use that exact ID consistently.

**Initial glossary inventory:**

Create Concept and exact Term records for:

- Fact, Defect, Unknown, Risk, Decision, Plan, Evidence;
- Release Line, Release Version, Development Baseline;
- Provisional Coordination Host;
- Term Family, Exact Term Definition, Lexical Form;
- Capability Maturity and Release Readiness.

Each has technical and Thai definitions. Add aliases only when classifiable. The words `status`, `ready`, `active`, and `baseline` must not be globally guessed; either qualify them or declare the lexical form ambiguous with resolution context.

- [ ] **Step 1: Add repository-fixture REDs for the real spine**

Tests must fail until all real structured paths exist, every path is registered, generated output matches, the release line remains a non-claim, and Editor/Backend are `not-adopted` plus `not-verified`.

- [ ] **Step 2: Author neutral sources and boundary**

`BOUNDARY.md` must say:

- Core is storage host only, not semantic owner of Editor/Backend readiness;
- each repository owns local implementation, contracts, risks, evidence, release readiness, and Git operations;
- coordination may own exact baseline, repository roles, compatibility view, global IDs/shared term families, and release-set references;
- no worker/queue/scheduler/remote mutation protocol exists;
- future transfer is one-owner atomic relocation; dual-active copies are forbidden.

`COMPATIBILITY.md` records Core–Editor, Core–Backend, and end-to-end as `not-verified`; it makes no inferred compatibility statement.

- [ ] **Step 3: Generate, validate, and commit**

```powershell
npm run docs:generate
npm run docs:check -- --allow-pending-baseline BASELINE-FLOWDOC-20260811-01
npx vitest run tests/canonicalDocumentationSpine.test.ts --maxWorkers=1
npm run type-check
git diff --check
git add -- docs/manifest.json docs/glossary.json docs/coordination/REPOSITORY_INDEX.json docs/coordination/BOUNDARY.md docs/versions/0_1/release.json docs/versions/0_1/COMPATIBILITY.md docs/DOCUMENT_MAP.md docs/GLOSSARY.md docs/GLOSSARY_TH.md docs/versions/0_1/VERSION_OVERVIEW.md docs/versions/0_1/CAPABILITY_SET.md tests/canonicalDocumentationSpine.test.ts
git diff --cached --name-only
git commit -m "docs: establish canonical documentation spine"
```

Expected staged paths: exactly twelve.

---

### Task 4: Author The D2 Project Truth Plane

**Files:**
- Create: `docs/VERSION_POLICY.md`
- Create: `docs/project/CURRENT_STATE.md`
- Create: `docs/project/RISK_REGISTER.md`
- Create: `docs/project/KNOWN_UNKNOWNS.md`
- Create: `docs/project/ROADMAP.md`
- Modify: `docs/manifest.json`
- Modify: `tests/canonicalDocumentationSpine.test.ts`
- Regenerate: `docs/DOCUMENT_MAP.md`

**Required truth records:**

Register these exact document identities:

```text
DOC-CORE-PROJECT-VERSION-POLICY
DOC-CORE-PROJECT-CURRENT-STATE
DOC-CORE-PROJECT-RISK-REGISTER
DOC-CORE-PROJECT-KNOWN-UNKNOWNS
DOC-CORE-PROJECT-ROADMAP
```

`CURRENT_STATE.md` owns only inspected facts:

- Core package is private `0.0.0` and no alpha release has been authorized;
- D0 selected one exact Core source commit;
- Editor and Backend heads are inspected references, not compatibility acceptance;
- canonical-documentation migration is active only through D2;
- zero runtime subsystems are registered as migrated in `release.json`;
- accepted Phase 5B evidence remains legacy-unmigrated until D3 and is not a release-composition claim;
- package documentation boundary remains broad until D5;
- production activation remains false.

`RISK_REGISTER.md` must create stable risk IDs for:

```text
RISK-CORE-DOCUMENTATION-STALE-SOURCE-001
RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001
RISK-CORE-DOCUMENTATION-TEST-COUPLING-001
RISK-CORE-DOCUMENTATION-PACKAGE-SURFACE-001
RISK-FLOWDOC-COORDINATION-DUAL-OWNER-001
RISK-FLOWDOC-COORDINATION-BASELINE-GHOST-001
```

Each risk separates adverse event, trigger, affected IDs, mitigation, evidence, and lifecycle. Facts already observed are not rewritten as risks.

`KNOWN_UNKNOWNS.md` must create stable unknown IDs for:

```text
UNKNOWN-CORE-DOCUMENTATION-CONTRACT-INVENTORY-001
UNKNOWN-CORE-DOCUMENTATION-TEST-MIGRATION-001
UNKNOWN-CORE-PACKAGE-PUBLIC-DOCS-001
UNKNOWN-FLOWDOC-COMPATIBILITY-EDITOR-001
UNKNOWN-FLOWDOC-COMPATIBILITY-BACKEND-001
UNKNOWN-FLOWDOC-COORDINATION-REPOSITORY-001
```

Each states the missing evidence, why it matters, the decision it blocks, and the gate/work item that can close it.

`ROADMAP.md` must create stable work IDs for D3-D7 and the later agent-system task. Each work item references motivating risks/unknowns and states explicit non-goals. It must not include dates as promises.

`VERSION_POLICY.md` must lock:

- independent Core/Editor/Backend SemVer;
- current `0.0.0` stays until the alpha gate passes;
- first proposed Core release is `0.1.0-a.1`, not authorized by this plan;
- release-line folder `0_1` represents line `0.1`, not one prerelease;
- exact prerelease snapshots use `v0.1.0-a.1` tags/artifacts when authorized;
- schema/contract versions are independent from package SemVer;
- no auto-promotion from a Development Baseline to package release.

- [ ] **Step 1: Write truth-plane validation REDs**

Tests fail when:

- the same ID appears in fact/risk/unknown/work categories;
- current state claims a migrated capability while release composition is empty;
- a risk lacks an adverse event or mitigation;
- an unknown lacks missing-evidence and closing-gate fields;
- a roadmap item lacks a motivating ID;
- version policy claims `0.1.0-a.1` is released;
- authored truth references an unregistered ID/path.

- [ ] **Step 2: Author the five documents and register them**

Every canonical reference uses stable ID plus clickable relative path. Do not copy long Phase 5B designs or test counts into current state; link legacy evidence only as explicitly non-canonical migration input when necessary.

- [ ] **Step 3: Generate, prove GREEN, and commit**

```powershell
npm run docs:generate
npm run docs:check -- --allow-pending-baseline BASELINE-FLOWDOC-20260811-01
npx vitest run tests/canonicalDocumentationSpine.test.ts --maxWorkers=1
npm run type-check
git diff --check
git add -- docs/VERSION_POLICY.md docs/project/CURRENT_STATE.md docs/project/RISK_REGISTER.md docs/project/KNOWN_UNKNOWNS.md docs/project/ROADMAP.md docs/manifest.json docs/DOCUMENT_MAP.md tests/canonicalDocumentationSpine.test.ts
git diff --cached --name-only
git commit -m "docs: establish core project truth plane"
```

Expected staged paths: exactly eight.

---

### Task 5: Close D1-D2 Validation And Produce Content Commit X

**Files:**
- Create: `scripts/publish-development-baseline.mjs`
- Modify only if a behavior RED requires it: D1-D2 scripts, sources, generated views, and `tests/canonicalDocumentationSpine.test.ts`.
- Do not create a new report/ledger/handoff document.

- [ ] **Step 1: Run the complete validation matrix**

Before the broad matrix, add the narrow baseline publisher and its REDs. The
publisher writes data only; it never commits, tags, pushes, or accepts a short
hash. Its CLI is:

```text
node scripts/publish-development-baseline.mjs --root . --baseline-id BASELINE-FLOWDOC-20260811-01 --recorded-at 2026-08-11 --core-commit $contentCommit --editor-commit $d0Editor --backend-commit $d0Backend
```

Fixture tests reject a short/non-hex commit, a baseline ID different from the
release's reserved ID, non-empty verification at D2, compatibility other than
`not-verified`, `releaseReady: true`, and reuse of one baseline ID with a
changed repository tuple. The script copies the three exact 40-character CLI
arguments into the record and emits no placeholder value.

Add or confirm real-repository tests for every Section 12.3 rule expressible in D1-D2:

- duplicate/mistyped IDs;
- path existence and canonical-root completeness;
- unresolved and backward-invalid references;
- generated drift;
- release slug and cross-release-line reference prohibition;
- claim-to-gate-to-baseline linkage;
- ambiguous normative aliases and term tombstones;
- baseline ID tuple immutability;
- canonical references to legacy phase documents;
- no subsystem migration or compatibility claim in the empty release composition.

For contract applicability rules with no D3 contract records yet, test temporary fixtures only; do not invent live contracts.

- [ ] **Step 2: Run focused and full gates**

```powershell
npm run docs:generate
npm run docs:check -- --allow-pending-baseline BASELINE-FLOWDOC-20260811-01
npx vitest run tests/canonicalDocumentationSpine.test.ts --maxWorkers=1
npm run type-check
npm run test -- --maxWorkers=1
git diff --check
git status --short
```

The broad test run may be long; use a sufficient outer timeout. A runner timeout without assertion output is not PASS and must be rerun with a larger window.

- [ ] **Step 3: Audit scope and claims**

Search and classify every match:

```powershell
rg -n "accepted|active|production|releaseReady|compatible|migrated" docs/manifest.json docs/glossary.json docs/VERSION_POLICY.md docs/coordination docs/project docs/versions/0_1 docs/DOCUMENT_MAP.md docs/GLOSSARY.md docs/GLOSSARY_TH.md
rg -n "docs/superpowers|PHASE_LEDGER|LIVE_DRAFT|phase-[0-9]|Phase 5" docs/manifest.json docs/coordination docs/project docs/versions/0_1
git diff -- src/index.ts package-lock.json
```

Expected: no unqualified readiness/migration claim, no canonical dependency on superseded phase prose, and no runtime/public/lockfile diff.

- [ ] **Step 4: Request two fresh read-only reviews**

One reviewer checks task/spec compliance and factual honesty. A second reviewer checks information architecture, reference direction, baseline protocol, and future relocation. Address Critical/Important findings with new REDs, then rerun all gates. Do not broaden to D3-D7.

- [ ] **Step 5: Create or identify content commit X**

If review fixes changed tracked content, make one coherent final content commit:

```powershell
git add -- package.json scripts/documentation scripts/generate-canonical-docs.mjs scripts/check-canonical-docs.mjs scripts/publish-development-baseline.mjs tests/canonicalDocumentationSpine.test.ts docs/manifest.json docs/glossary.json docs/VERSION_POLICY.md docs/coordination/REPOSITORY_INDEX.json docs/coordination/BOUNDARY.md docs/project docs/versions/0_1 docs/DOCUMENT_MAP.md docs/GLOSSARY.md docs/GLOSSARY_TH.md
git diff --cached --check
git diff --cached --name-only
git commit -m "docs: complete canonical project truth foundation"
```

If the tree is already clean because Tasks 1-4 commits collectively form the verified content tree, `HEAD` itself is content commit X; do not create an empty commit. Record:

```powershell
$contentCommit = git rev-parse HEAD
git status --short
```

The tree must be clean and both reviews must be READY before baseline publication.

---

### Task 6: Publish The Immutable Development Baseline As Commit Y

**Files:**
- Create: `docs/coordination/DEVELOPMENT_BASELINE.json`
- Modify: `docs/manifest.json`
- Regenerate: `docs/DOCUMENT_MAP.md`
- Regenerate: `docs/versions/0_1/VERSION_OVERVIEW.md`
- Regenerate: `docs/versions/0_1/CAPABILITY_SET.md`

The already-content-committed publisher writes data only. It does not run Git
commit/tag/push and cannot accept short hashes.

Task 6 registers the baseline file as
`DOC-FLOWDOC-COORDINATION-DEVELOPMENT-BASELINE`; the event record inside it is
the separately typed `BASELINE-FLOWDOC-20260811-01`.

- [ ] **Step 1: Re-run the baseline-publication tests from content commit X**

Tests must reject:

- short or non-hex repository commits;
- a baseline ID that differs from the reserved release reference;
- any compatibility value other than `not-verified` at D2;
- any non-empty verification set at D2;
- `releaseReady: true`;
- reuse of a baseline ID with changed repository tuple;
- normal `docs:check` while the referenced baseline is still absent.

- [ ] **Step 2: Invoke the narrow publisher with the exact inspected tuple**

CLI:

```text
node scripts/publish-development-baseline.mjs \
  --root . \
  --baseline-id BASELINE-FLOWDOC-20260811-01 \
  --recorded-at 2026-08-11 \
  --core-commit $contentCommit \
  --editor-commit $d0Editor \
  --backend-commit $d0Backend
```

Use the exact D0-approved Editor/Backend hashes if they differ from the planning
observations. The generated JSON shape contains these exact fields:

```text
baselineSchemaVersion = 1
baselineId = the exact reserved event ID
recordedAt = the exact publication date
repositories[REPO-FLOWDOC-CORE].verifiedCommit = $contentCommit
repositories[REPO-FLOWDOC-EDITOR].verifiedCommit = $d0Editor
repositories[REPO-FLOWDOC-BACKEND].verifiedCommit = $d0Backend
all releaseVersion values = unversioned
Core releaseLine = 0.1; Editor/Backend releaseLine = null
verificationSets = []
all compatibility values = not-verified
releaseReady = false
```

- [ ] **Step 3: Generate Y navigation and run normal validation**

```powershell
$contentCommit = git rev-parse HEAD
$d0Editor = "43dcebb22735d7330fda0d57d4e7ce9a726e2454"
$d0Backend = "280c4ffbe075cd5391cce5219e8f9c40fed16527"
$actualEditor = git -C C:\Users\nekot\Documents\GitHub\flowdoc-vnext-editor rev-parse HEAD
$actualBackend = git -C C:\Users\nekot\Documents\GitHub\flowdoc-vnext-backend rev-parse HEAD
if ($actualEditor -ne $d0Editor -or $actualBackend -ne $d0Backend) { throw "D0 inspected reference changed" }
if (git status --porcelain) { throw "Core content worktree is dirty before baseline publication" }
if (git -C C:\Users\nekot\Documents\GitHub\flowdoc-vnext-editor status --porcelain) { throw "Editor is dirty before baseline publication" }
if (git -C C:\Users\nekot\Documents\GitHub\flowdoc-vnext-backend status --porcelain) { throw "Backend is dirty before baseline publication" }
$recordedAt = (Get-Date).ToString("yyyy-MM-dd")
node scripts/publish-development-baseline.mjs --root . --baseline-id BASELINE-FLOWDOC-20260811-01 --recorded-at $recordedAt --core-commit $contentCommit --editor-commit $d0Editor --backend-commit $d0Backend
npm run docs:generate
npm run docs:check
npx vitest run tests/canonicalDocumentationSpine.test.ts --maxWorkers=1
npm run type-check
npm run test -- --maxWorkers=1
git diff --check
```

- [ ] **Step 4: Prove the baseline-only semantic boundary**

Allowed Y changes:

- `DEVELOPMENT_BASELINE.json`;
- manifest registration of that exact baseline record;
- deterministic navigation fields in the three generated views.

No source, script, test, contract, risk, unknown, roadmap, version policy,
compatibility prose, glossary meaning, release composition, package boundary,
or AGENTS change is allowed. The publisher and all tests are already in X;
only its output and deterministic baseline navigation enter Y.

Inspect:

```powershell
git diff --name-only $contentCommit
git diff -- docs/project docs/VERSION_POLICY.md docs/glossary.json docs/coordination/BOUNDARY.md docs/coordination/REPOSITORY_INDEX.json docs/versions/0_1/release.json src tests
```

The second command must be empty except the already-content-committed baseline-publication test/tool are outside the Y diff.

- [ ] **Step 5: Commit Y and verify the final tree**

```powershell
git add -- docs/coordination/DEVELOPMENT_BASELINE.json docs/manifest.json docs/DOCUMENT_MAP.md docs/versions/0_1/VERSION_OVERVIEW.md docs/versions/0_1/CAPABILITY_SET.md
git diff --cached --check
git diff --cached --name-only
git commit -m "docs: publish development baseline"
npm run docs:check
npx vitest run tests/canonicalDocumentationSpine.test.ts --maxWorkers=1
npm run type-check
npm run docs:check
npm run test -- --maxWorkers=1
git status --short
git stash list --format='%H %gd %s' | Select-Object -First 1
```

Expected Y staged paths: exactly five. Do not tag `v0.1.0-a.1`; release entry is outside this plan.

---

### Task 7: Final D0-D2 Handoff

**Files:** No new tracked file.

- [ ] **Step 1: Fresh closure review**

Request one final read-only review of exact X..Y and current tree. It must answer:

- Is there exactly one active owner for every D1-D2 fact?
- Can generated output make any claim not present in authored sources?
- Does the baseline pin X rather than Y, with no recursive self-hash?
- Are Editor/Backend facts references only, not readiness ownership?
- Is every runtime subsystem still explicitly unmigrated?
- Are package/AGENTS/D3-D7 boundaries untouched?

- [ ] **Step 2: Report in Thai with separated categories**

Handoff must include:

- **PASS:** exact commits X and Y, generated paths, validation gates.
- **FAIL/BLOCKER:** any unresolved Critical/Important issue.
- **RISK:** especially broad package docs until D5 and legacy dual-truth pressure until each subsystem cutover.
- **UNKNOWN:** contract inventory, doc-test migration, public docs, compatibility, future coordination repository.
- **Files changed:** exact list grouped by authored/generated/tool/test.
- **Intentionally not changed:** runtime, Layout contracts, old docs, package version/files, AGENTS, Editor, Backend, Git tags, push/merge/stash.

Do not call D1-D2 “documentation migration complete.” The correct closure statement is: **canonical spine and project truth plane established; subsystem cutover remains D3+**.

## Final Acceptance Gates

D0-D2 is complete only when all are true:

- D0 exact source selection is user-authorized and recorded.
- Normal `npm run docs:check` passes without pending-baseline mode.
- Focused canonical-documentation tests pass.
- Full Core `npm run check` passes with sufficient runner time.
- Generated files are byte-stable and checked in.
- Exactly one baseline record exists and pins content commit X.
- Y changes only the baseline record, manifest registration, and deterministic navigation derived from the selected baseline ID.
- Release `0.1` remains planned, unversioned, not ready, with empty migrated capability/contract/gate sets.
- Compatibility remains `not-verified` for all three relationships.
- No runtime subsystem is claimed migrated.
- No internal project memory/package boundary or AGENTS redesign is smuggled into D1-D2.
- Both fresh reviews report no Critical or Important finding.
- Working tree is clean, stash hash is unchanged, and no push/merge/tag occurred.
