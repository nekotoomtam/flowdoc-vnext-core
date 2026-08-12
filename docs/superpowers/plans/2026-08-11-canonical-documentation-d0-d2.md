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
- Registered canonical Markdown is a deliberately validated subset, not arbitrary CommonMark or HTML. Task 5 owns the exact pre-validation boundary below; do not add a CommonMark/HTML parser, parser framework, package dependency, or package/lockfile change.

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
multi-record file use this exact line sequence: the record heading, exactly
one empty intervening line containing zero characters, then one
machine-readable three-line JSON metadata block:

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
- Modify: `scripts/documentation/canonical-docs-model.mjs`
- Modify: `scripts/documentation/canonical-docs-render.mjs`
- Modify: `scripts/generate-canonical-docs.mjs`
- Modify: `scripts/check-canonical-docs.mjs`
- Modify: `tests/canonicalDocumentationSpine.test.ts`
- Generate: the five approved generated Markdown paths.

**Approved reconciliation rationale:** Task 1-2 established a test-driven
executable scaffold before the real D1 source shapes were locked. Task 3
forward-corrects that cumulative state so the approved sources, validator,
renderer, CLI behavior, and real-repository tests agree before the D1
checkpoint is published. This is not a D3 expansion: no Layout source, local
contract/capability/gate registry, accepted capability, or verification claim
is added. Keep the Task 1-2 commits as incremental history; do not revert them.

**Interfaces and exact contracts:**

`loadCanonicalDocumentationModel` has this Task 3 interface:

```text
loadCanonicalDocumentationModel(root, {
  allowPendingBaselineId?: string
}) -> {
  root,
  manifest,
  glossary,
  repositoryIndex,
  release,
  baseline: null,
  pendingBaselineId: string | null,
  documents,
  markdownByPath,
  compatibility
}
```

The option is absent by default. When the Development Baseline file is absent,
the loader accepts exactly one pending ID only when
`allowPendingBaselineId === release.baselineId`, `release.lifecycle ===
"planned"`, `release.releaseVersion === "unversioned"`, and
`release.releaseReady === false`; it then returns `baseline: null` and that
exact `pendingBaselineId`. All other missing-baseline cases fail.

`generateCanonicalDocs(root)` may read the release first and auto-select its
exact `baselineId` as the pending loader option only under those same three
non-claim conditions. `checkCanonicalDocs(root, { pendingBaseline })` never
auto-selects: its CLI requires explicit `--allow-pending-baseline <ID>` and
passes that ID into the loader before baseline presence is validated.

**Manifest exact shape:**

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

The manifest top level has exactly `manifestSchemaVersion`, `repositoryId`,
`canonicalRoots`, and `documents`; unknown or missing fields fail. Every
document entry has exactly these fields:

```json
{
  "documentId": "DOC-...",
  "title": "Non-empty authored title",
  "path": "docs/...",
  "kind": "closed-kind",
  "scope": "closed-scope",
  "subsystem": "documentation",
  "audience": "closed-audience",
  "authority": "closed-authority",
  "lifecycle": "closed-lifecycle",
  "appliesTo": {
    "repositoryIds": [],
    "releaseLines": [],
    "contractIds": [],
    "schemaIds": []
  }
}
```

`appliesTo` has exactly `repositoryIds`, `releaseLines`, `contractIds`, and
`schemaIds`. Every array contains distinct strings. `repositoryIds` contains
only distinct registered `REPO-*` identities; `releaseLines` contains only
distinct numeric `major.minor` lines; `contractIds` contains only distinct
`CONTRACT-*` identities; and `schemaIds` contains only distinct `SCHEMA-*`
identities. In Task 3 every document and Term `contractIds` and `schemaIds`
array is exactly empty because no owner registry exists. Selector occurrence
never creates an identity. Any later non-empty selector requires a separately
registered owner before it can resolve.

The closed D1 document-kind values are exactly `navigation`, `glossary`,
`repository-index`, `coordination-boundary`, `release-composition`,
`current-state`, and `compatibility`. The closed D1-D2 subsystem values are
exactly `documentation`, `terminology`, `coordination`, `versioning`, and
`project`. Manifest/glossary/repository records define only the identities they
own; selectors and references never define identities. Validate every
`appliesTo` reference whose owner is available in D1. A non-empty release
capability, contract, or gate selector fails in Task 3 because its later
repository-owned registry does not exist yet; full contract applicability
semantics remain deferred to D3.

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

Use exactly this 11-row D1 document mapping. For every row, `contractIds` and
`schemaIds` are exactly `[]`.

| documentId | path | kind | scope | subsystem | audience | authority | lifecycle | repositoryIds | releaseLines |
|---|---|---|---|---|---|---|---|---|---|
| `DOC-CORE-NAVIGATION-MANIFEST` | `docs/manifest.json` | `navigation` | `core` | `documentation` | `internal` | `normative` | `active` | `[REPO-FLOWDOC-CORE]` | `[]` |
| `DOC-CORE-NAVIGATION-DOCUMENT-MAP` | `docs/DOCUMENT_MAP.md` | `navigation` | `core` | `documentation` | `both` | `navigation` | `active` | `[REPO-FLOWDOC-CORE]` | `[]` |
| `DOC-FLOWDOC-TERMINOLOGY-GLOSSARY-SOURCE` | `docs/glossary.json` | `glossary` | `cross-repository` | `terminology` | `internal` | `normative` | `active` | `[REPO-FLOWDOC-CORE,REPO-FLOWDOC-EDITOR,REPO-FLOWDOC-BACKEND]` | `[]` |
| `DOC-FLOWDOC-TERMINOLOGY-GLOSSARY-TECHNICAL` | `docs/GLOSSARY.md` | `glossary` | `cross-repository` | `terminology` | `both` | `navigation` | `active` | `[REPO-FLOWDOC-CORE,REPO-FLOWDOC-EDITOR,REPO-FLOWDOC-BACKEND]` | `[]` |
| `DOC-FLOWDOC-TERMINOLOGY-GLOSSARY-THAI` | `docs/GLOSSARY_TH.md` | `glossary` | `cross-repository` | `terminology` | `both` | `navigation` | `active` | `[REPO-FLOWDOC-CORE,REPO-FLOWDOC-EDITOR,REPO-FLOWDOC-BACKEND]` | `[]` |
| `DOC-FLOWDOC-COORDINATION-REPOSITORY-INDEX` | `docs/coordination/REPOSITORY_INDEX.json` | `repository-index` | `cross-repository` | `coordination` | `internal` | `normative` | `active` | `[REPO-FLOWDOC-CORE,REPO-FLOWDOC-EDITOR,REPO-FLOWDOC-BACKEND]` | `[]` |
| `DOC-FLOWDOC-COORDINATION-BOUNDARY` | `docs/coordination/BOUNDARY.md` | `coordination-boundary` | `cross-repository` | `coordination` | `internal` | `normative` | `active` | `[REPO-FLOWDOC-CORE,REPO-FLOWDOC-EDITOR,REPO-FLOWDOC-BACKEND]` | `[]` |
| `DOC-CORE-VERSION-0-1-RELEASE-COMPOSITION` | `docs/versions/0_1/release.json` | `release-composition` | `core` | `versioning` | `internal` | `normative` | `active` | `[REPO-FLOWDOC-CORE]` | `[0.1]` |
| `DOC-CORE-VERSION-0-1-VERSION-OVERVIEW` | `docs/versions/0_1/VERSION_OVERVIEW.md` | `current-state` | `core` | `versioning` | `both` | `navigation` | `active` | `[REPO-FLOWDOC-CORE]` | `[0.1]` |
| `DOC-CORE-VERSION-0-1-CAPABILITY-SET` | `docs/versions/0_1/CAPABILITY_SET.md` | `current-state` | `core` | `versioning` | `both` | `navigation` | `active` | `[REPO-FLOWDOC-CORE]` | `[0.1]` |
| `DOC-CORE-VERSION-0-1-COMPATIBILITY` | `docs/versions/0_1/COMPATIBILITY.md` | `compatibility` | `cross-repository` | `versioning` | `internal` | `normative` | `active` | `[REPO-FLOWDOC-CORE,REPO-FLOWDOC-EDITOR,REPO-FLOWDOC-BACKEND]` | `[0.1]` |

**Glossary exact shape:**

```json
{
  "glossarySchemaVersion": 1,
  "concepts": [],
  "terms": [],
  "lexicalForms": []
}
```

The glossary top level has exactly `glossarySchemaVersion`, `concepts`,
`terms`, and `lexicalForms`. Each Concept has exactly:

```json
{
  "conceptId": "CONCEPT-...",
  "labels": {
    "technical": "Non-empty technical label",
    "thai": "ป้ายชื่อภาษาไทยที่ไม่ว่าง"
  }
}
```

Each exact Term has exactly:

```json
{
  "termId": "TERM-...",
  "conceptId": "CONCEPT-...",
  "canonicalName": "Qualified canonical name",
  "definitions": {
    "technical": "Non-empty technical definition",
    "thai": "คำจำกัดความภาษาไทยที่ไม่ว่าง"
  },
  "lifecycle": "active",
  "appliesTo": {
    "repositoryIds": [],
    "releaseLines": [],
    "contractIds": [],
    "schemaIds": []
  },
  "relations": {
    "meansSameAs": [],
    "relatedTo": [],
    "supersededBy": null
  }
}
```

Term `appliesTo` is the same exact four-array object used by manifest
documents. `relations` has exactly `meansSameAs`, `relatedTo`, and
`supersededBy`; the first two are Term-ID arrays and the last is `null` or one
Term ID. Exact-equivalence and same-family checks apply to `meansSameAs`;
`relatedTo` never asserts equivalence; `supersededBy` resolves to a different
Term ID. Retired terms remain in `terms` as tombstones. There is no
`retiredTermIds` field or parallel retirement authority.

Each Lexical Form has exactly:

```json
{
  "value": "lexical text",
  "language": "language-neutral",
  "kind": "ambiguous-alias",
  "termId": null,
  "possibleTermIds": ["TERM-...", "TERM-..."],
  "resolutionContext": "Non-empty instructions for choosing the exact term"
}
```

`language` is exactly `technical`, `thai`, or `language-neutral`; `kind` uses
the design's closed lexical-form kinds. An `ambiguous-alias` requires
`termId: null`, at least two distinct resolvable `possibleTermIds`, and a
non-empty `resolutionContext`. Every other form requires one exact resolvable
`termId`, an empty `possibleTermIds` array, and `resolutionContext: null`.

Create Concept and exact Term records for:

- Fact, Defect, Unknown, Risk, Decision, Plan, Evidence;
- Release Line, Release Version, Development Baseline;
- Provisional Coordination Host;
- Term Family, Exact Term Definition, Lexical Form;
- Capability Maturity and Release Readiness.

Each has non-empty technical and Thai labels/definitions. Add aliases only
when classifiable. The words `status`, `ready`, `active`, and `baseline` must
not be globally guessed; either use a qualified canonical form or register a
fully specified ambiguous lexical form.

Before scanning active normative Markdown, remove fenced code, inline code,
Markdown link targets, and direct stable IDs from the scan text. Tokenize
letters, digits, and hyphens as one lexical token, so `dual-active` is one
qualified token and is not the bare ambiguous token `active`. Reject a bare
ambiguous form that remains in active normative prose.

Technical and Thai glossary renderers use the matching language-specific
Concept labels and Term definitions. Both outputs sort by the same immutable
Term-ID order and must contain identical Term-ID sequences.

**Repository index exact shape:**

```json
{
  "repositoryIndexSchemaVersion": 1,
  "provisionalHostRepositoryId": "REPO-FLOWDOC-CORE",
  "futureCoordinationRepository": {
    "workingName": "flowdoc-vnext-coordination",
    "lifecycle": "not-created"
  },
  "repositories": [
    {"repositoryId":"REPO-FLOWDOC-CORE","name":"flowdoc-vnext-core","role":"core-engine","manifestAdoption":"active","manifestDocumentId":"DOC-CORE-NAVIGATION-MANIFEST"},
    {"repositoryId":"REPO-FLOWDOC-EDITOR","name":"flowdoc-vnext-editor","role":"editor-client","manifestAdoption":"not-adopted","manifestDocumentId":null},
    {"repositoryId":"REPO-FLOWDOC-BACKEND","name":"flowdoc-vnext-backend","role":"backend-service","manifestAdoption":"not-adopted","manifestDocumentId":null}
  ]
}
```

The repository-index top level and nested objects have exactly the fields
shown. Repository roles are exactly `core-engine`, `editor-client`, and
`backend-service`; manifest adoption is exactly `active` or `not-adopted`.
Only Core is active and resolves to `DOC-CORE-NAVIGATION-MANIFEST`;
Editor/Backend are not adopted and have `manifestDocumentId: null`. Reject
local checkout paths, branches, commits, compatibility, release-readiness, and
other readiness fields as unknown; this neutral index is not a local
contract/capability/risk registry.

**Release-line exact shape:**

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

The release top level has exactly the fields shown and has no generic
`composition` field. `capabilityIds`, `contractIds`, and
`verificationGateIds` are all empty in Task 3 and therefore define no owner
IDs. `compatibilityDocumentId` resolves to the exact active manifest record
`DOC-CORE-VERSION-0-1-COMPATIBILITY` at
`docs/versions/0_1/COMPATIBILITY.md`. The renderer reads authored lifecycle,
release version, release readiness, baseline ID, and release selectors; it
never hard-codes or invents those facts. `CAPABILITY_SET.md` uses only release
selectors, and the three empty arrays render an explicit
no-subsystem-cutover, no-readiness-claim result.

`BASELINE-FLOWDOC-20260811-01` is reserved by this approved plan on
2026-08-11. The date embedded in the event ID is its allocation/reservation
date. A later Task 6 publication may have a different `recordedAt` date without
changing this ID. Every Task 3 source, fixture, expectation, generated view,
and command uses the literal `BASELINE-FLOWDOC-20260811-01`.

Before authoring any Task 3 source, perform a read-only current-tree preflight:
`docs/coordination/DEVELOPMENT_BASELINE.json` must not exist, and an existing
`docs/manifest.json` must contain neither a Development Baseline document
record nor the reserved event ID. Any collision is a blocker requiring a new
user decision and a plan amendment; never allocate or substitute another ID
automatically.

`docs/coordination/DEVELOPMENT_BASELINE.json` and its manifest record remain
absent throughout Task 3. Remove or stop exercising the obsolete live
single-`pinned` baseline parser/evolution semantics; do not publish them as the
Task 3 contract. Task 5/content commit X owns the full multi-repository
baseline parser and immutable evolution comparison. Task 6/commit Y owns only
the file, atomic manifest record, and deterministic navigation changes. D3
owns the repository-local contract/capability/gate registries.

**Compatibility exact metadata:**

`COMPATIBILITY.md` begins with this authored metadata block before its prose:

```markdown
<!-- FLOWDOC-COMPATIBILITY
{"compatibilitySchemaVersion":1,"coreEditor":"not-verified","coreBackend":"not-verified","endToEnd":"not-verified"}
-->
```

The metadata object has exactly those four fields and all three compatibility
values are exactly `not-verified` in Task 3. The following authored prose
explains that none of Core–Editor, Core–Backend, or end-to-end compatibility is
inferred. The model parses and validates the exact block. A renderer may
project those three authored values only after exact parsing; it cannot invent
them from missing data or release readiness.

- [ ] **Step 1: Add repository-fixture REDs for the real spine**

Replace obsolete fixtures with the exact approved manifest, glossary,
repository-index, release, compatibility, and pending-baseline shapes above.
Preserve malformed JSON, missing required field, unknown field, duplicate ID,
unsafe path, unresolved reference, generated drift, alias misuse, and authored
path non-mutation unit coverage. Remove tests that publish the obsolete
single-`pinned` baseline shape as live semantics.

Add repository-root assertions for all exact 11 D1 IDs and paths, explicit
registration of top-level generated paths outside `canonicalRoots`, absence
of both the baseline file and its manifest record, exact pending ID matching,
byte-stable five generated views, Core active adoption, Editor/Backend
not-adopted, and all three authored compatibility values equal to
`not-verified`. Assert that non-empty release capability/contract/gate arrays
reject because no Task 3 owner registries exist. Assert language-specific
labels/definitions with identical sorted Term-ID order and the exact alias
scanner exclusions/tokenization. Assert the literal 11-row document mapping,
distinct-string/prefix/format closure for every `appliesTo` array, exact empty
Task 3 `contractIds`/`schemaIds`, and rejection of duplicate or selector-only
identities.

Run:

```powershell
npx vitest run tests/canonicalDocumentationSpine.test.ts --maxWorkers=1
```

Expected: FAIL because production parsers/renderers still accept the obsolete
Task 1-2 shapes, require a baseline file, or read capability facts from the
neutral repository index. A failure caused only by a syntax/import error is
not an accepted RED.

- [ ] **Step 2: GREEN the reconciled model, renderers, and CLIs**

Update only the four authorized tooling files. Implement the exact closed
shapes and identity ownership above, the explicit pending-baseline loader
state, compatibility metadata parsing, language-specific glossary projection,
authored release projection, empty-selector non-claim, and alias scanner
exclusions/tokenization. Keep strict unknown-field rejection. Do not add D3
owner registries or the Task 6 baseline schema.

Run:

```powershell
npx vitest run tests/canonicalDocumentationSpine.test.ts --maxWorkers=1
```

Expected: fixture-level schema/renderer/CLI tests pass while repository-root
tests remain RED only because the six authored sources and five generated
views do not exist yet.

- [ ] **Step 3: Author exact neutral sources, boundary, and compatibility**

Run this read-only collision preflight before creating or changing any Task 3
source:

```powershell
$baselinePath = "docs/coordination/DEVELOPMENT_BASELINE.json"
$manifestPath = "docs/manifest.json"
if (Test-Path -LiteralPath $baselinePath) { throw "baseline collision: $baselinePath already exists" }
if (Test-Path -LiteralPath $manifestPath) {
  $manifestText = Get-Content -Raw -LiteralPath $manifestPath
  if ($manifestText -match '"kind"\s*:\s*"development-baseline"' -or $manifestText -match 'BASELINE-FLOWDOC-20260811-01') {
    throw "baseline collision: current manifest already contains a baseline record or reserved event ID"
  }
}
```

Expected: no output and exit 0. Any thrown collision stops Task 3 for a new
user decision and plan amendment; do not author sources and do not substitute
another baseline ID.

`BOUNDARY.md` must say:

- Core is storage host only, not semantic owner of Editor/Backend readiness;
- each repository owns local implementation, contracts, risks, evidence, release readiness, and Git operations;
- coordination may own exact baseline, repository roles, compatibility view, global IDs/shared term families, and release-set references;
- no worker/queue/scheduler/remote mutation protocol exists;
- future transfer is one-owner atomic relocation; dual-active copies are forbidden.

Author the manifest, glossary, repository index, release composition,
`BOUNDARY.md`, and `COMPATIBILITY.md` using only the exact contracts above.
`COMPATIBILITY.md` starts with the exact metadata block and records Core–Editor,
Core–Backend, and end-to-end as `not-verified`; it makes no inferred
compatibility statement.

Run:

```powershell
npm run docs:generate
npm run docs:check -- --allow-pending-baseline BASELINE-FLOWDOC-20260811-01
npx vitest run tests/canonicalDocumentationSpine.test.ts --maxWorkers=1
```

Expected: PASS; generation writes only the five approved paths, checker accepts
the absent baseline only for the exact explicit reserved ID, and all generated
views remain non-claims.

- [ ] **Step 4: Validate the exact 16-path checkpoint and commit**

```powershell
npm run type-check
git diff --check
git add -- docs/manifest.json docs/glossary.json docs/coordination/REPOSITORY_INDEX.json docs/coordination/BOUNDARY.md docs/versions/0_1/release.json docs/versions/0_1/COMPATIBILITY.md docs/DOCUMENT_MAP.md docs/GLOSSARY.md docs/GLOSSARY_TH.md docs/versions/0_1/VERSION_OVERVIEW.md docs/versions/0_1/CAPABILITY_SET.md scripts/documentation/canonical-docs-model.mjs scripts/documentation/canonical-docs-render.mjs scripts/generate-canonical-docs.mjs scripts/check-canonical-docs.mjs tests/canonicalDocumentationSpine.test.ts
git diff --cached --name-only
git commit -m "docs: establish canonical documentation spine"
```

Expected: type-check and diff check pass; staged names are exactly the sixteen
paths listed in `git add`, with no Development Baseline file or manifest record
and no unrelated path. Task 1-2 commits remain in history; this commit is the
forward correction that makes their cumulative scaffold conform to the
approved Task 3 sources.

---

### Task 4: Author The D2 Project Truth Plane

**Files:**
- Create: `docs/VERSION_POLICY.md`
- Create: `docs/project/CURRENT_STATE.md`
- Create: `docs/project/RISK_REGISTER.md`
- Create: `docs/project/KNOWN_UNKNOWNS.md`
- Create: `docs/project/ROADMAP.md`
- Modify: `docs/manifest.json`
- Modify: `scripts/documentation/canonical-docs-model.mjs`
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

Register exactly this five-row Task 4 manifest mapping. Every row has the
existing exact `appliesTo` object shape; array values shown below are literal,
and `contractIds` and `schemaIds` remain exactly empty:

| documentId | path | kind | scope | subsystem | audience | authority | lifecycle | repositoryIds | releaseLines | contractIds | schemaIds |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `DOC-CORE-PROJECT-VERSION-POLICY` | `docs/VERSION_POLICY.md` | `version-policy` | `cross-repository` | `versioning` | `internal` | `normative` | `active` | `[REPO-FLOWDOC-CORE,REPO-FLOWDOC-EDITOR,REPO-FLOWDOC-BACKEND]` | `[]` | `[]` | `[]` |
| `DOC-CORE-PROJECT-CURRENT-STATE` | `docs/project/CURRENT_STATE.md` | `current-state` | `core` | `project` | `internal` | `evidence` | `active` | `[REPO-FLOWDOC-CORE]` | `[]` | `[]` | `[]` |
| `DOC-CORE-PROJECT-RISK-REGISTER` | `docs/project/RISK_REGISTER.md` | `risk-register` | `cross-repository` | `project` | `internal` | `normative` | `active` | `[REPO-FLOWDOC-CORE,REPO-FLOWDOC-EDITOR,REPO-FLOWDOC-BACKEND]` | `[]` | `[]` | `[]` |
| `DOC-CORE-PROJECT-KNOWN-UNKNOWNS` | `docs/project/KNOWN_UNKNOWNS.md` | `known-unknowns` | `cross-repository` | `project` | `internal` | `normative` | `active` | `[REPO-FLOWDOC-CORE,REPO-FLOWDOC-EDITOR,REPO-FLOWDOC-BACKEND]` | `[]` | `[]` | `[]` |
| `DOC-CORE-PROJECT-ROADMAP` | `docs/project/ROADMAP.md` | `roadmap` | `cross-repository` | `project` | `internal` | `normative` | `active` | `[REPO-FLOWDOC-CORE,REPO-FLOWDOC-EDITOR,REPO-FLOWDOC-BACKEND]` | `[]` | `[]` | `[]` |

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

`ROADMAP.md` must create these exact stable work IDs for D3-D7 and the later
agent-system task:

```text
WORK-CORE-LAYOUT-CUTOVER-001
WORK-CORE-REMAINING-SUBSYSTEM-CUTOVER-001
WORK-CORE-PACKAGE-RELEASE-BOUNDARY-001
WORK-FLOWDOC-EDITOR-BACKEND-ADOPTION-001
WORK-FLOWDOC-COORDINATION-TRANSFER-001
WORK-FLOWDOC-AGENT-SYSTEM-REDESIGN-001
```

Each work item references motivating risks/unknowns and states explicit
non-goals. It must not include dates as promises.

`VERSION_POLICY.md` must lock:

- independent Core/Editor/Backend SemVer;
- current `0.0.0` stays until the alpha gate passes;
- first proposed Core release is `0.1.0-a.1`, not authorized by this plan;
- release-line folder `0_1` represents line `0.1`, not one prerelease;
- exact prerelease snapshots use `v0.1.0-a.1` tags/artifacts when authorized;
- schema/contract versions are independent from package SemVer;
- no auto-promotion from a Development Baseline to package release.

**Task 4 embedded-record contract:**

Task 4 restores and exports only this narrow parser, then invokes it from the
real canonical model validation path used by `scripts/check-canonical-docs.mjs`:

```js
export function collectEmbeddedCanonicalRecords(markdown, { documentKind, path })
```

It accepts `documentKind` only as `risk-register`, `known-unknowns`, or
`roadmap`. Each level-two record heading is exactly
`## <recordId> — <non-empty title>`, followed by exactly one empty line
containing zero characters and then one exact three-line `FLOWDOC-RECORD` JSON
block: opener line, one metadata JSON line, and closer line. Zero intervening
blank lines, more than one intervening blank line, or an intervening line that
contains spaces or tabs is invalid. The metadata has one of these exact
shapes; no missing or extra field is accepted:

```json
{"recordId":"RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001","recordKind":"risk","lifecycle":"active","affects":["DOC-CORE-NAVIGATION-MANIFEST"]}
{"recordId":"UNKNOWN-CORE-DOCUMENTATION-CONTRACT-INVENTORY-001","recordKind":"unknown","lifecycle":"active","affects":["DOC-CORE-VERSION-0-1-RELEASE-COMPOSITION"],"closedBy":["WORK-CORE-LAYOUT-CUTOVER-001"]}
{"recordId":"WORK-CORE-LAYOUT-CUTOVER-001","recordKind":"work","lifecycle":"active","motivatedBy":["RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001","UNKNOWN-CORE-DOCUMENTATION-CONTRACT-INVENTORY-001"]}
```

For all three record kinds, `lifecycle` uses only the closed values `draft`,
`active`, `superseded`, or `retired`; every Task 4-authored record is
`active`. `recordId` must use the exact prefix implied by `recordKind`, and the
heading ID, metadata ID, document kind, and record kind must agree. Reference
arrays are non-empty arrays of distinct typed IDs. `affects` resolves through
the unified canonical identity set and cannot contain the record's own ID;
`closedBy` contains only resolvable `GATE-*` or `WORK-*` IDs; and
`motivatedBy` contains only resolvable `RISK-*` or `UNKNOWN-*` IDs.

The parser rejects duplicate record IDs within one document, across the three
record documents, or against an identity already owned by another canonical
category. It parses all three documents before resolving outbound references,
adds their RISK/UNKNOWN/WORK identities to the model's known-ID closure, and
then checks both metadata arrays and authored Markdown references. This makes
cross-category roadmap motivation and affected/closing references resolvable
without treating a reference as an identity definition.

Required prose is also closed and checked against metadata. A risk record has
exactly one each of these non-empty level-three sections, in this exact order,
with no other `###` section inside that record:

```text
risk:    Adverse event -> Trigger -> Affected IDs -> Mitigation -> Evidence -> Lifecycle
unknown: Missing evidence -> Why it matters -> Blocked decision -> Affected IDs -> Closing gate or work item -> Lifecycle
work:    Motivating risks and unknowns -> Non-goals -> Lifecycle
```

Every non-ID section contains at least one non-empty prose paragraph. Every ID
section contains only one Markdown bullet per ID and no prose. Reference-array
identity is set-like, but canonical serialization is deterministic: metadata
arrays and their prose bullet lists are both sorted by ascending stable ID,
duplicates are rejected, and the two sorted sequences must be element-for-
element equal. Therefore a reordered metadata array or prose list is invalid,
not silently normalized. The lifecycle section is serialized exactly as the
heading `### Lifecycle`, one blank line, then one backticked lifecycle token
such as `` `active` ``; no list marker, label, sentence, or second token is
accepted, and the token must equal metadata `lifecycle`.

Outside a `FLOWDOC-RECORD` JSON block, every canonical stable ID in Task 4
authored prose uses the narrow inline form `[<exact stable ID>](<relative
target>)`; the visible label is exactly the ID with no added title or prose.
Reference-style links are not part of this Task 4 grammar. The destination's
path component, resolved relative to the referring document, normalized for
`.` and `..`, and converted to repository-relative `/` separators, must equal
the registered owner path of that exact identity. Document IDs resolve through
the manifest; RISK/UNKNOWN/WORK IDs resolve to their containing registered
document; repository, term, and concept IDs resolve to their registered
structured-source document. URI, absolute, repository-escaping, and pathless
targets are rejected. A fragment may follow the correct owner path but does
not replace it. A link whose label names one ID while its path owns another ID
is invalid even when that destination exists.
The exact ID in the record's defining `##` heading is an identity declaration,
not a prose reference. Bare IDs inside the machine-readable
`FLOWDOC-RECORD` block are exempt from the clickable-prose rule but still
undergo typed identity and outbound closure validation. No other bare-ID
exemption exists in Task 4 authored prose.

This is a task-specific FLOWDOC-RECORD parser and validator, not a generic
Markdown parser, schema engine, plugin system, or reusable documentation
framework. Task 4 must not add or restore
`validateDevelopmentBaselineEvolution`, parse or publish
`DEVELOPMENT_BASELINE.json`, change pending-baseline semantics, or implement
the multi-repository baseline contract. Task 5/content commit X owns the
executable baseline parser and evolution validation; Task 6/commit Y owns only
publication of the already-supported record and its deterministic navigation.

- [ ] **Step 1: Write truth-plane validation REDs**

Add fixture and repository-root tests that use the production
`scripts/check-canonical-docs.mjs` entrypoint. Tests fail when:

- `collectEmbeddedCanonicalRecords` is missing or embedded records do not
  participate in real `docs:check`;
- any Task 4 manifest row is missing/extra or differs in path, kind, scope,
  subsystem, audience, authority, lifecycle, or an exact `appliesTo` array;
- a record block is absent, has zero or more than one intervening blank line
  after its matching heading, has whitespace on the required empty line, is
  relocated, is not an exact three-line block, or contains invalid JSON;
- heading ID, typed ID prefix, `recordKind`, document kind, or closed
  `lifecycle` disagrees;
- metadata has a missing/extra field, an empty/duplicate outbound array, or a
  duplicate identity within/across risk, unknown, and work categories;
- a required prose section is missing, duplicated, empty, extra, or reordered,
  its lifecycle serialization is not exact, or its sorted outbound IDs do not
  exactly match the sorted metadata array;
- an affected, closing, motivating, or authored canonical reference is
  unresolved, including cross-category RISK/UNKNOWN/WORK references;
- prose contains a bare canonical ID, a non-relative/escaping target, or a
  link whose ID points to the existing registered path of a different identity;
- current state claims a migrated capability while release composition is empty;
- a risk lacks an adverse event or mitigation;
- an unknown lacks missing-evidence and closing-gate fields;
- a roadmap item lacks a motivating ID;
- version policy claims `0.1.0-a.1` is released;
- authored truth references an unregistered ID/path.

- [ ] **Step 2: GREEN only the Task 4 model behavior**

Extend the closed document kinds with `version-policy`, `risk-register`,
`known-unknowns`, and `roadmap`. Implement the exact parser contract above in
`scripts/documentation/canonical-docs-model.mjs`, collect all embedded
identities before reference resolution, and include the records in the same
model-validation path exercised by `docs:check`. Do not add a second CLI or a
helper-only validation path.

Run:

```powershell
npx vitest run tests/canonicalDocumentationSpine.test.ts --maxWorkers=1
```

Expected: fixture-level embedded-record tests pass; repository-root
truth-plane assertions remain RED only because the five authored Task 4
documents and regenerated document map do not exist yet.

- [ ] **Step 3: Author the five documents and register them**

Author the five exact manifest rows above. Every prose canonical reference
uses the clickable relative-path contract above, and every embedded record
uses the exact heading, one zero-character empty line, three-line metadata
block, section order, and serialization. Do not copy long Phase 5B designs or
test counts into current state; link legacy evidence only as explicitly
non-canonical migration input when necessary.

- [ ] **Step 4: Generate, prove GREEN, and commit the exact nine paths**

```powershell
npm run docs:generate
npm run docs:check -- --allow-pending-baseline BASELINE-FLOWDOC-20260811-01
npx vitest run tests/canonicalDocumentationSpine.test.ts --maxWorkers=1
npm run type-check
git diff --check
git add -- docs/VERSION_POLICY.md docs/project/CURRENT_STATE.md docs/project/RISK_REGISTER.md docs/project/KNOWN_UNKNOWNS.md docs/project/ROADMAP.md docs/manifest.json docs/DOCUMENT_MAP.md scripts/documentation/canonical-docs-model.mjs tests/canonicalDocumentationSpine.test.ts
git diff --cached --name-only
git commit -m "docs: establish core project truth plane"
```

Expected staged paths: exactly nine, matching the nine paths listed in Task 4
`**Files:**`. No renderer, generator, checker, package, baseline, runtime, or
other documentation path is staged.

---

### Task 5: Close D1-D2 Validation And Produce Content Commit X

**Files:**
- Create: `scripts/publish-development-baseline.mjs`
- Modify: `scripts/documentation/canonical-docs-model.mjs`
- Modify only for the named present-baseline factual-honesty RED/review finding: `scripts/documentation/canonical-docs-render.mjs`
- Modify: `scripts/generate-canonical-docs.mjs`
- Modify: `scripts/check-canonical-docs.mjs`
- Modify: `tests/canonicalDocumentationSpine.test.ts`
- These six implementation/test paths are the complete Task 5 allowlist. Every
  changed path must be required by a named RED or accepted review finding; no
  authored/generated documentation, manifest, package, dependency, lockfile,
  runtime, or other path may change in X.
- `docs/coordination/DEVELOPMENT_BASELINE.json` and its manifest record remain
  absent in X. Task 6 Y remains the exact five data/navigation paths already
  listed in Task 6.
- Do not create a new report/ledger/handoff document.

**Approved supported canonical-Markdown subset:**

This is the approved resolution of the Task 5 parser-edge blocker. Every
manifest-registered canonical `.md` file, authored or generated, undergoes one
deterministic raw-source pre-validation pass before any fence, inline-code,
alias, reference, maturity/compatibility claim, or legacy-link scan. JSON files
are unaffected. The capability claim is intentionally narrow: canonical
Markdown is this validated subset, not arbitrary CommonMark and not HTML.

The pre-validator recognizes only these three owned comment spans:

1. The exact line `<!-- GENERATED FILE — DO NOT EDIT -->` is allowed exactly
   once as the first line of one of the five approved generated files. It is
   invalid on an authored path, after the first line, or when duplicated or
   altered.
2. The exact three-line `FLOWDOC-COMPATIBILITY` block already specified in
   Task 3 is allowed only at the start of the registered compatibility
   document: exact opener line, one metadata JSON line with the existing exact
   schema, then exact `-->` closer. A leading blank line, relocation, wrong
   owner document, malformed JSON, missing/extra field, or altered delimiter
   is invalid.
3. An exact three-line `FLOWDOC-RECORD` block is allowed only in the registered
   risk-register, known-unknowns, or roadmap document, in this exact sequence:
   its exact level-two record heading, exactly one empty intervening line
   containing zero characters, opener line, one metadata JSON line, and closer
   line. For this raw subset phase, validate only delimiter ownership, exact
   three-line comment shape, JSON parsing and exact metadata schema,
   document-kind ownership, exact heading-ID/metadata-ID agreement, and this
   placement. Return the validated block as an owned span. Do not run the full
   Task 4 prose, section, reference, direction, or closure validator during
   this phase. A zero-blank-line, multiple-blank-line, whitespace-only-blank,
   malformed, relocated, unmatched, or wrong-owner candidate is invalid rather
   than ordinary prose.

Validation order is exact:

1. On the unmasked raw source, recognize and validate candidate spans for the
   exact generated header, exact `FLOWDOC-COMPATIBILITY` block, and exact
   `FLOWDOC-RECORD` blocks using their path, document kind, schema, heading,
   and positional contracts above. `FLOWDOC-RECORD` recognition is limited to
   the raw-subset checks listed in item 3; it does not call the full Task 4
   record validator. Any generated-header or `FLOWDOC-*` candidate that is not
   a valid owned span fails immediately. This phase returns all validated
   owned spans with their kind, source range, and parsed metadata where one
   exists.
2. Reject every remaining literal `<!--` or `-->` occurrence anywhere in the
   raw file outside those validated owned spans. This prohibition includes
   prose, inline code, fenced code, Markdown link labels/destinations, and
   examples; those contexts do not escape or mask a delimiter.
3. Scan for angle-bracket constructs outside **all** validated owned spans:
   the exact generated-header span, exact `FLOWDOC-COMPATIBILITY` block spans,
   and exact `FLOWDOC-RECORD` block spans. Outside those spans, a literal `<`
   is supported only when the existing Task-5-specific autolink parser
   consumes the complete angle-bracket construct as a valid URI or email
   autolink. Any other raw `<...>` or HTML-like construct is rejected,
   including inside inline or fenced code. Do not implement an HTML parser,
   and do not claim full CommonMark rendering equivalence.
4. Only after steps 1-3 pass may all validated owned spans—the exact generated
   header plus exact compatibility and record metadata blocks—be removed or
   replaced with stable whitespace for downstream scans. Exact ownership
   validation must precede any removal or masking.
5. Run downstream alias/reference/claim/fence scanning only on the resulting
   pre-validated structural text. Then run the full existing Task 4 record
   prose/section/reference/direction/closure validation using that structural
   text plus the parsed metadata and positions returned for validated
   `FLOWDOC-RECORD` spans. Downstream logic must never mask arbitrary comments,
   maintain general comment state, infer whether comment syntax outranks
   inline/fenced code, or rerun ownership recognition.

The real model load first completes this subset pre-validation for every
registered canonical Markdown file and retains each file's structural text and
owned spans; no alias/reference/claim/fence or full record scan begins until
all registered Markdown passes. A direct call to
`collectEmbeddedCanonicalRecords` must apply the same subset pre-validation to
its input before its full Task 4 validation, while retaining the existing
exported signature. This is one task-specific two-phase path, not a second
record authority or a generic parser framework.

Valid URI/email autolinks already accepted by the task-specific parser remain
supported. Existing inline-code and fenced-code syntax also remains supported
when its contents contain no forbidden HTML-comment delimiter or raw
HTML/HTML-like construct. No other comment or HTML form is supported.

**Task 5 executable Development Baseline contract:**

Task 5, before content commit X, implements the parser and evolution guard
that Task 6 will execute without changing code. The exact
`DEVELOPMENT_BASELINE.json` shape is:

```json
{
  "baselineSchemaVersion": 1,
  "baselineId": "BASELINE-FLOWDOC-20260811-01",
  "recordedAt": "2026-08-11",
  "repositories": {
    "REPO-FLOWDOC-CORE": {"releaseLine":"0.1","releaseVersion":"unversioned","verifiedCommit":"5bcb497cefe742222a835637cc33eddd5f96b685"},
    "REPO-FLOWDOC-EDITOR": {"releaseLine":null,"releaseVersion":"unversioned","verifiedCommit":"43dcebb22735d7330fda0d57d4e7ce9a726e2454"},
    "REPO-FLOWDOC-BACKEND": {"releaseLine":null,"releaseVersion":"unversioned","verifiedCommit":"280c4ffbe075cd5391cce5219e8f9c40fed16527"}
  },
  "verificationSets": [],
  "compatibility": {"coreEditor":"not-verified","coreBackend":"not-verified","endToEnd":"not-verified"},
  "releaseReady": false
}
```

The top level, `repositories`, each repository entry, and `compatibility`
reject missing or unknown fields. Repository keys are exactly the three stable
repository IDs above. `baselineSchemaVersion` is exactly `1`; `baselineId`
matches `^BASELINE-FLOWDOC-[0-9]{8}-[0-9]{2}$` and equals the release's exact
reserved ID. `recordedAt` is one real calendar date serialized as
`YYYY-MM-DD`; every `verifiedCommit` matches `/^[0-9a-f]{40}$/` and is not the
all-zero hash; Core has
`releaseLine: "0.1"`; Editor and Backend have `releaseLine: null`; all three
have `releaseVersion: "unversioned"`; `verificationSets` is exactly `[]`; all
compatibility fields are exactly `"not-verified"`; and `releaseReady` is
exactly `false`. The literal hashes above are the inspected design inputs used
to demonstrate the shape, not the publication tuple: Task 6 replaces the Core
value with content commit X and rechecks the exact D0 Editor/Backend values.

`loadCanonicalDocumentationModel` has exactly two normal states:

1. When the baseline file is absent, it accepts only the existing explicit
   pending option whose ID equals the planned, unversioned, not-ready release
   baseline ID; it returns `baseline: null` and that `pendingBaselineId`.
   Without the exact option it fails.
2. When the baseline file exists, it parses the exact shape above, requires
   its ID to equal `release.baselineId`, returns the parsed record as
   `baseline` and `pendingBaselineId: null`, and requires no pending option.
   Supplying `allowPendingBaselineId` when the file exists fails as a
   contradictory loader state.

Update generation in X so it auto-selects pending mode only when the baseline
file is absent. With a present baseline it performs a normal load. Normal
`docs:check` without `--allow-pending-baseline` fails while the baseline is
absent and participates in the parsed present-baseline model after Task 6.

Restore and implement:

```js
export function validateDevelopmentBaselineEvolution(previous, next)
```

Both non-null arguments are parsed against the exact schema. A missing
previous record permits the first publication. When `baselineId` is the same,
the ordered tuple of the three `(repositoryId, verifiedCommit)` pairs must be
identical and the full parsed record must be semantically equal; any changed
commit, repository key, release line/version, verification set,
compatibility, readiness, or recorded date requires a new baseline ID. A new
ID is validated normally and is not treated as same-event mutation.

`scripts/check-canonical-docs.mjs` must call this evolution guard whenever a
present worktree baseline is loaded. It reads the prior committed baseline at
the same path from `HEAD` through Git when available; only Git's exact
path-not-present result means `previous: null`. Malformed prior JSON, another
Git failure, or same-ID mutation fails real `docs:check`. This is the sole
Task 5 baseline parser/evolution path; do not create a generic JSON schema
framework or a second baseline authority.

- [ ] **Step 1: Write and preserve the baseline parser/publisher and subset-boundary REDs**

Add fixture tests through the real loader, generator, publisher, and
`scripts/check-canonical-docs.mjs`. The publisher writes data only; it never
commits, tags, pushes, or accepts a short hash. Its CLI is:

```text
node scripts/publish-development-baseline.mjs --root . --baseline-id BASELINE-FLOWDOC-20260811-01 --recorded-at 2026-08-11 --core-commit $contentCommit --editor-commit $d0Editor --backend-commit $d0Backend
```

Fixture tests reject a short/non-hex commit, a baseline ID different from the
release's reserved ID, non-empty verification at D2, compatibility other than
`not-verified`, `releaseReady: true`, and reuse of one baseline ID with a
changed repository tuple. The script copies the three exact 40-character CLI
arguments into the record and emits no placeholder value.

Also prove RED for every missing/unknown nested field, wrong repository key,
invalid date, all-zero publisher hash, wrong release line/version, absent
baseline without pending allowance, present baseline incorrectly treated as
pending, normal `docs:check` rejecting a valid present baseline, and a
same-ID mutation of each repository commit and each other semantic field.

Add real-checker fixture REDs through `scripts/check-canonical-docs.mjs` for
the raw-source subset boundary. Preserve the literal blocker shape with an
inline-code comment opener, a real tilde fence containing a comment closer,
and each visible tail in separate cases:

```markdown
`<!--`
~~~md
-->
~~~
Renderer is production.
```

The other two visible tails are `Core and Editor are compatible.` and
`[legacy](../PHASE_LEDGER.md)`. Each must fail for unsupported comment syntax
before a fence or visible-tail scan can hide or reinterpret it. Also add
negative fixtures for a comment opener and a comment closer inside fenced
code, an ordinary arbitrary comment, raw HTML, a generated header on the wrong
path or line, a malformed/relocated compatibility block, and a malformed,
relocated, or wrong-owner record block. For record placement, separately
reject zero intervening blank lines, more than one intervening blank line, and
an intervening line containing spaces or tabs.

Add positive real-checker fixtures for each exact owned form: the generated
header on an approved generated file, the exact compatibility block at its
document start, and successfully parsed exact record blocks after their
specified headings with exactly one zero-character empty intervening line.
Prove that the angle-bracket scan excludes each of those three owned span
kinds, including the non-metadata generated header, only after its ownership
validates. Preserve positives for existing valid URI/email autolinks, inline
code, and backtick/tilde fences whose contents contain no forbidden
HTML-comment delimiter or raw HTML/HTML-like construct. These positives prove
that the boundary is a supported subset rather than a blanket rejection of
autolinks or code.

Run and preserve RED:

```powershell
npx vitest run tests/canonicalDocumentationSpine.test.ts --maxWorkers=1
```

Expected: assertion failures show the absent exact baseline parser/evolution
and present-load behavior. A syntax/import failure is not an accepted RED.

- [ ] **Step 2: GREEN the baseline model, subset pre-validator, generator, checker, and publisher**

Implement the exact Task 5 baseline and supported-subset contracts above in
the publisher, model, generator, and checker. The checker/model must first run
the limited raw-source subset pre-validator across every registered Markdown
file and retain its owned spans and structural text. Only after that entire
guard passes may it invoke the existing full Task 4 record and other
structural validators. Preserve Task 4's full record semantics while consuming
the validated record metadata/positions from the first phase and sharing the
final model known-ID closure; never call that full parser to decide raw comment
ownership. Retain the renderer change only for its named present-baseline
factual-honesty RED/review finding. Do not add a general comment masker,
HTML/CommonMark parser, parser framework, package dependency, or lockfile
change. Run:

```powershell
npx vitest run tests/canonicalDocumentationSpine.test.ts --maxWorkers=1
npm run docs:generate
npm run docs:check -- --allow-pending-baseline BASELINE-FLOWDOC-20260811-01
```

Expected: focused tests pass; generation uses pending mode only because the
baseline is still absent in X; explicit pending `docs:check` passes; normal
`docs:check` remains a tested failure until Task 6 publishes the file.

- [ ] **Step 3: Complete the D1-D2 validation matrix**

Add or confirm real-repository tests for every Section 12.3 rule expressible in D1-D2:

- duplicate/mistyped document, term, and embedded RISK/UNKNOWN/WORK IDs;
- embedded-record heading/metadata/prose consistency and real `docs:check`
  closure for affected, closing, motivating, and authored references;
- path existence and canonical-root completeness;
- unresolved and backward-invalid references;
- generated drift;
- release slug and cross-release-line reference prohibition;
- claim-to-gate-to-baseline linkage;
- ambiguous normative aliases and term tombstones;
- baseline ID tuple immutability;
- canonical references to legacy phase documents;
- no subsystem migration or compatibility claim in the empty release composition.
- raw-source supported-subset pre-validation for every registered canonical
  Markdown file, including exact owned comment spans, exact one-empty-line
  record placement, forbidden delimiter/raw HTML rejection in prose and code,
  valid URI/email autolink retention, and the required handoff from limited
  ownership recognition to later full record validation.

For contract applicability rules with no D3 contract records yet, test temporary fixtures only; do not invent live contracts.

- [ ] **Step 4: Run focused and full gates**

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

- [ ] **Step 5: Audit scope and claims**

Search and classify every match:

```powershell
rg -n "accepted|active|production|releaseReady|compatible|migrated" docs/manifest.json docs/glossary.json docs/VERSION_POLICY.md docs/coordination docs/project docs/versions/0_1 docs/DOCUMENT_MAP.md docs/GLOSSARY.md docs/GLOSSARY_TH.md
rg -n "docs/superpowers|PHASE_LEDGER|LIVE_DRAFT|phase-[0-9]|Phase 5" docs/manifest.json docs/coordination docs/project docs/versions/0_1
git diff -- src/index.ts package.json package-lock.json
```

Expected: no unqualified readiness/migration claim, no canonical dependency on superseded phase prose, and no runtime/public/lockfile diff.

- [ ] **Step 6: Request two fresh read-only reviews**

One reviewer checks task/spec compliance and factual honesty. A second reviewer
checks information architecture, reference direction, baseline protocol, and
future relocation. Both independently verify the exact supported-subset
ownership, raw pre-validation ordering, all-owned-span angle-bracket exclusion,
exact heading/one-empty-line/three-line record placement, the non-circular
handoff to later full record validation, allowed positives, forbidden
delimiter/raw-HTML REDs, and six-path Task 5 scope. They review against the
approved validated subset and must not demand arbitrary CommonMark comment or
HTML semantics; this does not waive any failure inside the specified subset.
Address Critical/Important findings with new real-checker REDs, then rerun all
gates. Do not broaden to D3-D7.

- [ ] **Step 7: Create content commit X**

Task 5 changes the publisher, model, renderer for the named factual-honesty
finding, generator, checker, and tests, so make one coherent six-path content
commit X after the gates and reviews are READY:

```powershell
git add -- scripts/check-canonical-docs.mjs scripts/documentation/canonical-docs-model.mjs scripts/documentation/canonical-docs-render.mjs scripts/generate-canonical-docs.mjs scripts/publish-development-baseline.mjs tests/canonicalDocumentationSpine.test.ts
git diff --cached --check
git diff --cached --name-only
git commit -m "docs: complete canonical project truth foundation"
```

The `git add` line is the exact six-path Task 5 scope. Each diff must trace to
a named RED or accepted review finding, and no seventh path is permitted. No
package/dependency/lockfile change is authorized. The baseline JSON and its
manifest record are forbidden in X. Record:

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

Task 6 is a five-path publication/execution task, not an implementation task.
The publisher, exact schema parser, pending/present loader behavior, evolution
guard, supported canonical-Markdown subset pre-validation, checker
integration, and all tests are already committed in X. No script or test
change and no syntax-boundary relaxation is allowed in Y.

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
- Does every registered canonical Markdown file pass the exact validated
  subset boundary, with only the three owned comment forms and supported
  URI/email autolinks?
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
- Every registered canonical Markdown file passes raw-source subset
  pre-validation before structural scans; only the three exact owned comment
  forms and valid task-specific URI/email autolinks are accepted, with no
  arbitrary CommonMark/HTML capability claim.
- Exactly one baseline record exists and pins content commit X.
- Y changes only the baseline record, manifest registration, and deterministic navigation derived from the selected baseline ID.
- Release `0.1` remains planned, unversioned, not ready, with empty migrated capability/contract/gate sets.
- Compatibility remains `not-verified` for all three relationships.
- No runtime subsystem is claimed migrated.
- No internal project memory/package boundary or AGENTS redesign is smuggled into D1-D2.
- Both fresh reviews report no Critical or Important finding.
- Working tree is clean, stash hash is unchanged, and no push/merge/tag occurred.
