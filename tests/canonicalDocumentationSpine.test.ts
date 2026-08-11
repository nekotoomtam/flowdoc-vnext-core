import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { spawnSync } from "node:child_process"
import { afterEach, describe, expect, test } from "vitest"

// @ts-ignore Task-owned executable Node model intentionally has no TypeScript declaration file.
import { collectCanonicalReferences, collectEmbeddedCanonicalRecords, loadCanonicalDocumentationModel, validateCanonicalDocumentationModel } from "../scripts/documentation/canonical-docs-model.mjs"
// @ts-ignore Task-owned executable Node renderer intentionally has no TypeScript declaration file.
import { GENERATED_HEADER, renderGeneratedFiles } from "../scripts/documentation/canonical-docs-render.mjs"

const BASELINE_ID = "BASELINE-FLOWDOC-20260811-01"
const REPOSITORY_IDS = ["REPO-FLOWDOC-CORE", "REPO-FLOWDOC-EDITOR", "REPO-FLOWDOC-BACKEND"]
const GENERATED_PATHS = [
  "docs/DOCUMENT_MAP.md",
  "docs/GLOSSARY.md",
  "docs/GLOSSARY_TH.md",
  "docs/versions/0_1/VERSION_OVERVIEW.md",
  "docs/versions/0_1/CAPABILITY_SET.md",
] as const

const DOCUMENT_ROWS = [
  ["DOC-CORE-NAVIGATION-MANIFEST", "docs/manifest.json", "navigation", "core", "documentation", "internal", "normative", "active", ["REPO-FLOWDOC-CORE"], []],
  ["DOC-CORE-NAVIGATION-DOCUMENT-MAP", "docs/DOCUMENT_MAP.md", "navigation", "core", "documentation", "both", "navigation", "active", ["REPO-FLOWDOC-CORE"], []],
  ["DOC-FLOWDOC-TERMINOLOGY-GLOSSARY-SOURCE", "docs/glossary.json", "glossary", "cross-repository", "terminology", "internal", "normative", "active", REPOSITORY_IDS, []],
  ["DOC-FLOWDOC-TERMINOLOGY-GLOSSARY-TECHNICAL", "docs/GLOSSARY.md", "glossary", "cross-repository", "terminology", "both", "navigation", "active", REPOSITORY_IDS, []],
  ["DOC-FLOWDOC-TERMINOLOGY-GLOSSARY-THAI", "docs/GLOSSARY_TH.md", "glossary", "cross-repository", "terminology", "both", "navigation", "active", REPOSITORY_IDS, []],
  ["DOC-FLOWDOC-COORDINATION-REPOSITORY-INDEX", "docs/coordination/REPOSITORY_INDEX.json", "repository-index", "cross-repository", "coordination", "internal", "normative", "active", REPOSITORY_IDS, []],
  ["DOC-FLOWDOC-COORDINATION-BOUNDARY", "docs/coordination/BOUNDARY.md", "coordination-boundary", "cross-repository", "coordination", "internal", "normative", "active", REPOSITORY_IDS, []],
  ["DOC-CORE-VERSION-0-1-RELEASE-COMPOSITION", "docs/versions/0_1/release.json", "release-composition", "core", "versioning", "internal", "normative", "active", ["REPO-FLOWDOC-CORE"], ["0.1"]],
  ["DOC-CORE-VERSION-0-1-VERSION-OVERVIEW", "docs/versions/0_1/VERSION_OVERVIEW.md", "current-state", "core", "versioning", "both", "navigation", "active", ["REPO-FLOWDOC-CORE"], ["0.1"]],
  ["DOC-CORE-VERSION-0-1-CAPABILITY-SET", "docs/versions/0_1/CAPABILITY_SET.md", "current-state", "core", "versioning", "both", "navigation", "active", ["REPO-FLOWDOC-CORE"], ["0.1"]],
  ["DOC-CORE-VERSION-0-1-COMPATIBILITY", "docs/versions/0_1/COMPATIBILITY.md", "compatibility", "cross-repository", "versioning", "internal", "normative", "active", REPOSITORY_IDS, ["0.1"]],
] as const

const TRUTH_DOCUMENT_ROWS = [
  ["DOC-CORE-PROJECT-VERSION-POLICY", "docs/VERSION_POLICY.md", "version-policy", "cross-repository", "versioning", "internal", "normative", "active", REPOSITORY_IDS, []],
  ["DOC-CORE-PROJECT-CURRENT-STATE", "docs/project/CURRENT_STATE.md", "current-state", "core", "project", "internal", "evidence", "active", ["REPO-FLOWDOC-CORE"], []],
  ["DOC-CORE-PROJECT-RISK-REGISTER", "docs/project/RISK_REGISTER.md", "risk-register", "cross-repository", "project", "internal", "normative", "active", REPOSITORY_IDS, []],
  ["DOC-CORE-PROJECT-KNOWN-UNKNOWNS", "docs/project/KNOWN_UNKNOWNS.md", "known-unknowns", "cross-repository", "project", "internal", "normative", "active", REPOSITORY_IDS, []],
  ["DOC-CORE-PROJECT-ROADMAP", "docs/project/ROADMAP.md", "roadmap", "cross-repository", "project", "internal", "normative", "active", REPOSITORY_IDS, []],
] as const

const fixtureRoots: string[] = []

afterEach(() => {
  for (const root of fixtureRoots.splice(0)) rmSync(root, { force: true, recursive: true })
})

function write(root: string, relativePath: string, value: unknown): void {
  const path = join(root, relativePath)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`, "utf8")
}

function appliesTo(repositoryIds: readonly string[], releaseLines: readonly string[]) {
  return { repositoryIds: [...repositoryIds], releaseLines: [...releaseLines], contractIds: [], schemaIds: [] }
}

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), "flowdoc-canonical-docs-"))
  fixtureRoots.push(root)

  write(root, "docs/manifest.json", {
    manifestSchemaVersion: 1,
    repositoryId: "REPO-FLOWDOC-CORE",
    canonicalRoots: ["docs/project", "docs/coordination", "docs/versions/0_1"],
    documents: DOCUMENT_ROWS.map(([documentId, path, kind, scope, subsystem, audience, authority, lifecycle, repositoryIds, releaseLines]) => ({
      documentId,
      title: `${documentId} title`,
      path,
      kind,
      scope,
      subsystem,
      audience,
      authority,
      lifecycle,
      appliesTo: appliesTo(repositoryIds, releaseLines),
    })),
  })
  write(root, "docs/glossary.json", {
    glossarySchemaVersion: 1,
    concepts: [
      { conceptId: "CONCEPT-FLOWDOC-FACT", labels: { technical: "Fact", thai: "ข้อเท็จจริง" } },
      { conceptId: "CONCEPT-FLOWDOC-RISK", labels: { technical: "Risk", thai: "ความเสี่ยง" } },
    ],
    terms: [
      {
        termId: "TERM-FLOWDOC-FACT",
        conceptId: "CONCEPT-FLOWDOC-FACT",
        canonicalName: "FlowDoc Fact",
        definitions: { technical: "A statement supported by evidence.", thai: "ข้อความที่มีหลักฐานรองรับ" },
        lifecycle: "active",
        appliesTo: appliesTo(REPOSITORY_IDS, []),
        relations: { meansSameAs: [], relatedTo: ["TERM-FLOWDOC-RISK"], supersededBy: null },
      },
      {
        termId: "TERM-FLOWDOC-RISK",
        conceptId: "CONCEPT-FLOWDOC-RISK",
        canonicalName: "FlowDoc Risk",
        definitions: { technical: "A possible adverse outcome.", thai: "ผลลัพธ์เชิงลบที่อาจเกิดขึ้น" },
        lifecycle: "active",
        appliesTo: appliesTo(REPOSITORY_IDS, []),
        relations: { meansSameAs: [], relatedTo: ["TERM-FLOWDOC-FACT"], supersededBy: null },
      },
    ],
    lexicalForms: [
      { value: "status", language: "language-neutral", kind: "ambiguous-alias", termId: null, possibleTermIds: ["TERM-FLOWDOC-FACT", "TERM-FLOWDOC-RISK"], resolutionContext: "Choose the qualified exact term required by the repository record." },
    ],
  })
  write(root, "docs/coordination/REPOSITORY_INDEX.json", {
    repositoryIndexSchemaVersion: 1,
    provisionalHostRepositoryId: "REPO-FLOWDOC-CORE",
    futureCoordinationRepository: { workingName: "flowdoc-vnext-coordination", lifecycle: "not-created" },
    repositories: [
      { repositoryId: "REPO-FLOWDOC-CORE", name: "flowdoc-vnext-core", role: "core-engine", manifestAdoption: "active", manifestDocumentId: "DOC-CORE-NAVIGATION-MANIFEST" },
      { repositoryId: "REPO-FLOWDOC-EDITOR", name: "flowdoc-vnext-editor", role: "editor-client", manifestAdoption: "not-adopted", manifestDocumentId: null },
      { repositoryId: "REPO-FLOWDOC-BACKEND", name: "flowdoc-vnext-backend", role: "backend-service", manifestAdoption: "not-adopted", manifestDocumentId: null },
    ],
  })
  write(root, "docs/coordination/BOUNDARY.md", "# Coordination boundary\n\nCore is the provisional storage host.\n")
  write(root, "docs/versions/0_1/release.json", {
    releaseSchemaVersion: 1,
    repositoryId: "REPO-FLOWDOC-CORE",
    releaseLine: "0.1",
    folderSlug: "0_1",
    lifecycle: "planned",
    releaseVersion: "unversioned",
    baselineId: BASELINE_ID,
    capabilityIds: [],
    contractIds: [],
    verificationGateIds: [],
    compatibilityDocumentId: "DOC-CORE-VERSION-0-1-COMPATIBILITY",
    releaseReady: false,
  })
  write(root, "docs/versions/0_1/COMPATIBILITY.md", `<!-- FLOWDOC-COMPATIBILITY
{"compatibilitySchemaVersion":1,"coreEditor":"not-verified","coreBackend":"not-verified","endToEnd":"not-verified"}
-->

# Compatibility

Core–Editor, Core–Backend, and end-to-end compatibility are not inferred.
`)
  for (const path of GENERATED_PATHS) write(root, path, "stale generated output\n")
  return root
}

function addTruthPlane(root: string): void {
  rewriteJson(root, "docs/manifest.json", (manifest) => {
    manifest.documents.push(...TRUTH_DOCUMENT_ROWS.map(([documentId, path, kind, scope, subsystem, audience, authority, lifecycle, repositoryIds, releaseLines]) => ({
      documentId,
      title: `${documentId} title`,
      path,
      kind,
      scope,
      subsystem,
      audience,
      authority,
      lifecycle,
      appliesTo: appliesTo(repositoryIds, releaseLines),
    })))
  })
  write(root, "docs/VERSION_POLICY.md", "# Version policy\n\nCore, Editor, and Backend version independently. The first proposed Core release is 0.1.0-a.1; it is not authorized by this plan.\n")
  write(root, "docs/project/CURRENT_STATE.md", "# Current state\n\nZero runtime subsystems are registered as migrated in release.json.\n")
  write(root, "docs/project/RISK_REGISTER.md", `# Risk register

## RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001 — Divergent sources
<!-- FLOWDOC-RECORD
{"recordId":"RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001","recordKind":"risk","lifecycle":"active","affects":["DOC-CORE-NAVIGATION-MANIFEST"]}
-->

### Adverse event

Conflicting sources lead to inconsistent decisions.

### Trigger

An unregistered source is treated as authoritative.

### Affected IDs

- [DOC-CORE-NAVIGATION-MANIFEST](../manifest.json)

### Mitigation

Use the canonical manifest and validation gate.

### Evidence

The manifest is the registered owner.

### Lifecycle

\`active\`
`)
  write(root, "docs/project/KNOWN_UNKNOWNS.md", `# Known unknowns

## UNKNOWN-CORE-DOCUMENTATION-CONTRACT-INVENTORY-001 — Contract inventory
<!-- FLOWDOC-RECORD
{"recordId":"UNKNOWN-CORE-DOCUMENTATION-CONTRACT-INVENTORY-001","recordKind":"unknown","lifecycle":"active","affects":["DOC-CORE-VERSION-0-1-RELEASE-COMPOSITION"],"closedBy":["WORK-CORE-LAYOUT-CUTOVER-001"]}
-->

### Missing evidence

The complete contract inventory is not yet authored.

### Why it matters

Release composition cannot select unowned contracts.

### Blocked decision

The package release boundary remains open.

### Affected IDs

- [DOC-CORE-VERSION-0-1-RELEASE-COMPOSITION](../versions/0_1/release.json)

### Closing gate or work item

- [WORK-CORE-LAYOUT-CUTOVER-001](ROADMAP.md#work-core-layout-cutover-001)

### Lifecycle

\`active\`
`)
  write(root, "docs/project/ROADMAP.md", `# Roadmap

## WORK-CORE-LAYOUT-CUTOVER-001 — Layout cutover
<!-- FLOWDOC-RECORD
{"recordId":"WORK-CORE-LAYOUT-CUTOVER-001","recordKind":"work","lifecycle":"active","motivatedBy":["RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001","UNKNOWN-CORE-DOCUMENTATION-CONTRACT-INVENTORY-001"]}
-->

### Motivating risks and unknowns

- [RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001](RISK_REGISTER.md#risk-core-documentation-dual-truth-001)
- [UNKNOWN-CORE-DOCUMENTATION-CONTRACT-INVENTORY-001](KNOWN_UNKNOWNS.md#unknown-core-documentation-contract-inventory-001)

### Non-goals

This does not authorize release publication.

### Lifecycle

\`active\`
`)
}

function loadPending(root: string) {
  return loadCanonicalDocumentationModel(root, { allowPendingBaselineId: BASELINE_ID })
}

function runCli(root: string, script: string, ...args: string[]) {
  return spawnSync(process.execPath, [script, "--root", root, ...args], { cwd: process.cwd(), encoding: "utf8" })
}

function runCliFromRoot(root: string, script: string, ...args: string[]) {
  return spawnSync(process.execPath, [join(process.cwd(), script), ...args], { cwd: root, encoding: "utf8" })
}

function generated(root: string): Record<string, string> {
  return Object.fromEntries(GENERATED_PATHS.map((path) => [path, readFileSync(join(root, path), "utf8")]))
}

function seedGeneratedSentinels(root: string): Record<string, string> {
  const sentinels = Object.fromEntries(GENERATED_PATHS.map((path) => [path, `sentinel:${path}\n`]))
  for (const [path, sentinel] of Object.entries(sentinels)) writeFileSync(join(root, path), sentinel, "utf8")
  return sentinels
}

function rewriteJson(root: string, relativePath: string, mutate: (value: any) => void): void {
  const value = JSON.parse(readFileSync(join(root, relativePath), "utf8"))
  mutate(value)
  write(root, relativePath, value)
}

function documentMapping(documents: any[]) {
  return documents.map(({ documentId, path, kind, scope, subsystem, audience, authority, lifecycle, appliesTo: selectors }) => [
    documentId, path, kind, scope, subsystem, audience, authority, lifecycle, selectors.repositoryIds, selectors.releaseLines,
  ])
}

type TruthPlaneBranchLedgerRow = {
  name: string
  mutation: (root: string) => void
  expected: RegExp
}

const RISK_PATH = "docs/project/RISK_REGISTER.md"
const UNKNOWN_PATH = "docs/project/KNOWN_UNKNOWNS.md"
const ROADMAP_PATH = "docs/project/ROADMAP.md"
const RISK_ID = "RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001"
const UNKNOWN_ID = "UNKNOWN-CORE-DOCUMENTATION-CONTRACT-INVENTORY-001"
const WORK_ID = "WORK-CORE-LAYOUT-CUTOVER-001"

function rewriteText(root: string, relativePath: string, mutate: (source: string) => string): void {
  const path = join(root, relativePath)
  const source = readFileSync(path, "utf8")
  const next = mutate(source)
  if (next === source) throw new Error(`fixture mutation made no change: ${relativePath}`)
  writeFileSync(path, next, "utf8")
}

function replaceText(root: string, relativePath: string, search: string, replacement: string): void {
  rewriteText(root, relativePath, (source) => {
    if (!source.includes(search)) throw new Error(`fixture mutation source is absent from ${relativePath}: ${search}`)
    return source.replace(search, replacement)
  })
}

function mutateTruthManifestRow(root: string, documentId: string, mutate: (document: any) => void): void {
  rewriteJson(root, "docs/manifest.json", (manifest) => {
    const document = manifest.documents.find((candidate: any) => candidate.documentId === documentId)
    if (!document) throw new Error(`truth manifest row is absent: ${documentId}`)
    mutate(document)
  })
}

function addAuxiliaryRecordDocument(root: string, documentId: string, path: string, kind: string, markdown: string): void {
  rewriteJson(root, "docs/manifest.json", (manifest) => {
    manifest.documents.push({
      documentId,
      title: `${documentId} title`,
      path,
      kind,
      scope: "core",
      subsystem: "project",
      audience: "internal",
      authority: "normative",
      lifecycle: "active",
      appliesTo: appliesTo(["REPO-FLOWDOC-CORE"], []),
    })
  })
  write(root, path, markdown)
}

function setRiskAffects(root: string, ids: string[], bullets: string[]): void {
  const original = '"affects":["DOC-CORE-NAVIGATION-MANIFEST"]'
  const replacement = `"affects":${JSON.stringify(ids)}`
  if (replacement !== original) replaceText(root, RISK_PATH, original, replacement)
  replaceText(root, RISK_PATH, "- [DOC-CORE-NAVIGATION-MANIFEST](../manifest.json)", bullets.join("\n"))
}

function setUnknownClosedBy(root: string, ids: string[], bullets: string[]): void {
  replaceText(root, UNKNOWN_PATH, '"closedBy":["WORK-CORE-LAYOUT-CUTOVER-001"]', `"closedBy":${JSON.stringify(ids)}`)
  replaceText(root, UNKNOWN_PATH, "- [WORK-CORE-LAYOUT-CUTOVER-001](ROADMAP.md#work-core-layout-cutover-001)", bullets.join("\n"))
}

function setRoadmapMotivatedBy(root: string, ids: string[], bullets: string[]): void {
  replaceText(root, ROADMAP_PATH, '"motivatedBy":["RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001","UNKNOWN-CORE-DOCUMENTATION-CONTRACT-INVENTORY-001"]', `"motivatedBy":${JSON.stringify(ids)}`)
  replaceText(root, ROADMAP_PATH, `- [RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001](RISK_REGISTER.md#risk-core-documentation-dual-truth-001)
- [UNKNOWN-CORE-DOCUMENTATION-CONTRACT-INVENTORY-001](KNOWN_UNKNOWNS.md#unknown-core-documentation-contract-inventory-001)`, bullets.join("\n"))
}

const TRUTH_PLANE_BRANCH_LEDGER: TruthPlaneBranchLedgerRow[] = [
  {
    name: "manifest / missing Task 4 row",
    mutation: (root) => rewriteJson(root, "docs/manifest.json", (manifest) => {
      manifest.documents = manifest.documents.filter((document: any) => document.documentId !== "DOC-CORE-PROJECT-RISK-REGISTER")
    }),
    expected: /Task 4 manifest is missing row DOC-CORE-PROJECT-RISK-REGISTER/i,
  },
  {
    name: "manifest / extra Task 4 row",
    mutation: (root) => {
      rewriteJson(root, "docs/manifest.json", (manifest) => manifest.documents.push({
        documentId: "DOC-CORE-PROJECT-EXTRA",
        title: "Extra Task 4 row",
        path: "docs/project/EXTRA.md",
        kind: "current-state",
        scope: "core",
        subsystem: "project",
        audience: "internal",
        authority: "evidence",
        lifecycle: "active",
        appliesTo: appliesTo(["REPO-FLOWDOC-CORE"], []),
      }))
      write(root, "docs/project/EXTRA.md", "# Extra\n")
    },
    expected: /Task 4 manifest has extra row DOC-CORE-PROJECT-EXTRA/i,
  },
  {
    name: "manifest / path mismatch",
    mutation: (root) => {
      const alternatePath = "docs/project/RISK_REGISTER_ALTERNATE.md"
      write(root, alternatePath, readFileSync(join(root, RISK_PATH), "utf8"))
      rmSync(join(root, RISK_PATH))
      mutateTruthManifestRow(root, "DOC-CORE-PROJECT-RISK-REGISTER", (document) => { document.path = alternatePath })
    },
    expected: /Task 4 manifest row DOC-CORE-PROJECT-RISK-REGISTER path must exactly equal docs\/project\/RISK_REGISTER\.md/i,
  },
  {
    name: "manifest / kind mismatch",
    mutation: (root) => mutateTruthManifestRow(root, "DOC-CORE-PROJECT-RISK-REGISTER", (document) => { document.kind = "known-unknowns" }),
    expected: /Task 4 manifest row DOC-CORE-PROJECT-RISK-REGISTER kind must exactly equal risk-register/i,
  },
  {
    name: "manifest / scope mismatch",
    mutation: (root) => mutateTruthManifestRow(root, "DOC-CORE-PROJECT-RISK-REGISTER", (document) => { document.scope = "core" }),
    expected: /Task 4 manifest row DOC-CORE-PROJECT-RISK-REGISTER scope must exactly equal cross-repository/i,
  },
  {
    name: "manifest / subsystem mismatch",
    mutation: (root) => mutateTruthManifestRow(root, "DOC-CORE-PROJECT-RISK-REGISTER", (document) => { document.subsystem = "documentation" }),
    expected: /Task 4 manifest row DOC-CORE-PROJECT-RISK-REGISTER subsystem must exactly equal project/i,
  },
  {
    name: "manifest / audience mismatch",
    mutation: (root) => mutateTruthManifestRow(root, "DOC-CORE-PROJECT-RISK-REGISTER", (document) => { document.audience = "both" }),
    expected: /Task 4 manifest row DOC-CORE-PROJECT-RISK-REGISTER audience must exactly equal internal/i,
  },
  {
    name: "manifest / authority mismatch",
    mutation: (root) => mutateTruthManifestRow(root, "DOC-CORE-PROJECT-RISK-REGISTER", (document) => { document.authority = "evidence" }),
    expected: /Task 4 manifest row DOC-CORE-PROJECT-RISK-REGISTER authority must exactly equal normative/i,
  },
  {
    name: "manifest / lifecycle mismatch",
    mutation: (root) => mutateTruthManifestRow(root, "DOC-CORE-PROJECT-RISK-REGISTER", (document) => { document.lifecycle = "draft" }),
    expected: /Task 4 manifest row DOC-CORE-PROJECT-RISK-REGISTER lifecycle must exactly equal active/i,
  },
  {
    name: "manifest / repositoryIds mismatch",
    mutation: (root) => mutateTruthManifestRow(root, "DOC-CORE-PROJECT-RISK-REGISTER", (document) => { document.appliesTo.repositoryIds = ["REPO-FLOWDOC-CORE"] }),
    expected: /Task 4 manifest row DOC-CORE-PROJECT-RISK-REGISTER repositoryIds must exactly equal/i,
  },
  {
    name: "manifest / releaseLines mismatch",
    mutation: (root) => mutateTruthManifestRow(root, "DOC-CORE-PROJECT-RISK-REGISTER", (document) => { document.appliesTo.releaseLines = ["0.1"] }),
    expected: /Task 4 manifest row DOC-CORE-PROJECT-RISK-REGISTER releaseLines must exactly equal \[\]/i,
  },
  {
    name: "manifest / contractIds mismatch",
    mutation: (root) => mutateTruthManifestRow(root, "DOC-CORE-PROJECT-RISK-REGISTER", (document) => { document.appliesTo.contractIds = ["CONTRACT-TEST-ONLY"] }),
    expected: /contractIds must be empty because no Task 3 owner registry exists/i,
  },
  {
    name: "manifest / schemaIds mismatch",
    mutation: (root) => mutateTruthManifestRow(root, "DOC-CORE-PROJECT-RISK-REGISTER", (document) => { document.appliesTo.schemaIds = ["SCHEMA-TEST-ONLY"] }),
    expected: /schemaIds must be empty because no Task 3 owner registry exists/i,
  },
  {
    name: "record envelope / absent FLOWDOC-RECORD block",
    mutation: (root) => rewriteText(root, RISK_PATH, (source) => source.replace(/<!-- FLOWDOC-RECORD\r?\n[^\r\n]+\r?\n-->\r?\n/, "")),
    expected: /FLOWDOC-RECORD block must immediately follow its matching heading/i,
  },
  {
    name: "record envelope / invalid JSON",
    mutation: (root) => replaceText(root, RISK_PATH, '{"recordId"', '{invalid"recordId"'),
    expected: /FLOWDOC-RECORD JSON must be valid/i,
  },
  {
    name: "record identity / heading and metadata mismatch",
    mutation: (root) => replaceText(root, RISK_PATH, `"recordId":"${RISK_ID}"`, '"recordId":"RISK-CORE-DOCUMENTATION-DUAL-TRUTH-002"'),
    expected: /heading ID and metadata recordId must agree/i,
  },
  {
    name: "record identity / wrong typed prefix",
    mutation: (root) => replaceText(root, RISK_PATH, `## ${RISK_ID} —`, "## UNKNOWN-CORE-DOCUMENTATION-DUAL-TRUTH-001 —"),
    expected: /heading recordId must use the RISK prefix/i,
  },
  {
    name: "record identity / wrong recordKind",
    mutation: (root) => replaceText(root, RISK_PATH, '"recordKind":"risk"', '"recordKind":"unknown"'),
    expected: /recordKind must be risk/i,
  },
  {
    name: "record identity / document-kind disagreement",
    mutation: (root) => addAuxiliaryRecordDocument(root, "DOC-TEST-DOCUMENT-KIND-DISAGREEMENT", "docs/project/DOCUMENT_KIND_DISAGREEMENT.md", "known-unknowns", readFileSync(join(root, RISK_PATH), "utf8")),
    expected: /heading recordId must use the UNKNOWN prefix/i,
  },
  {
    name: "record identity / invalid lifecycle",
    mutation: (root) => replaceText(root, RISK_PATH, '"lifecycle":"active"', '"lifecycle":"paused"'),
    expected: /lifecycle must be one of the closed values/i,
  },
  {
    name: "metadata / missing outbound field",
    mutation: (root) => replaceText(root, RISK_PATH, ',"affects":["DOC-CORE-NAVIGATION-MANIFEST"]', ""),
    expected: /metadata is missing field affects/i,
  },
  {
    name: "metadata / empty outbound array",
    mutation: (root) => setRiskAffects(root, [], []),
    expected: /affects must be non-empty/i,
  },
  {
    name: "metadata / duplicate outbound ID",
    mutation: (root) => setRiskAffects(root, ["DOC-CORE-NAVIGATION-MANIFEST", "DOC-CORE-NAVIGATION-MANIFEST"], [
      "- [DOC-CORE-NAVIGATION-MANIFEST](../manifest.json)",
      "- [DOC-CORE-NAVIGATION-MANIFEST](../manifest.json)",
    ]),
    expected: /duplicate .*affects value: DOC-CORE-NAVIGATION-MANIFEST/i,
  },
  {
    name: "metadata / genuine cross-document duplicate identity",
    mutation: (root) => addAuxiliaryRecordDocument(root, "DOC-TEST-CROSS-DOCUMENT-RISK", "docs/project/CROSS_DOCUMENT_RISK.md", "risk-register", readFileSync(join(root, RISK_PATH), "utf8")),
    expected: /duplicate embedded record identity: RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001/i,
  },
  {
    name: "metadata / collision with an existing canonical category",
    mutation: (root) => rewriteText(root, RISK_PATH, (source) => source.replaceAll(RISK_ID, "DOC-CORE-NAVIGATION-MANIFEST")),
    expected: /embedded record identity collides with an existing canonical identity: DOC-CORE-NAVIGATION-MANIFEST/i,
  },
  {
    name: "sections / missing required section",
    mutation: (root) => rewriteText(root, RISK_PATH, (source) => source.replace(/\n### Evidence\r?\n[\s\S]*?(?=\n### Lifecycle)/, "")),
    expected: /sections must use the exact required order with no extras/i,
  },
  {
    name: "sections / duplicate required section",
    mutation: (root) => replaceText(root, RISK_PATH, "### Evidence\n\nThe manifest is the registered owner.", "### Evidence\n\nThe manifest is the registered owner.\n\n### Evidence\n\nA second evidence section."),
    expected: /sections must use the exact required order with no extras/i,
  },
  {
    name: "sections / extra section",
    mutation: (root) => replaceText(root, RISK_PATH, "### Lifecycle", "### Review\n\nA review paragraph.\n\n### Lifecycle"),
    expected: /sections must use the exact required order with no extras/i,
  },
  {
    name: "sections / reordered sections",
    mutation: (root) => rewriteText(root, RISK_PATH, (source) => source.replace(
      "### Adverse event\n\nConflicting sources lead to inconsistent decisions.\n\n### Trigger\n\nAn unregistered source is treated as authoritative.",
      "### Trigger\n\nAn unregistered source is treated as authoritative.\n\n### Adverse event\n\nConflicting sources lead to inconsistent decisions.",
    )),
    expected: /sections must use the exact required order with no extras/i,
  },
  {
    name: "sections / empty non-ID section",
    mutation: (root) => replaceText(root, RISK_PATH, "### Evidence\n\nThe manifest is the registered owner.", "### Evidence\n\n"),
    expected: /Evidence must contain an actual prose paragraph/i,
  },
  {
    name: "lifecycle / wrong unbackticked token",
    mutation: (root) => replaceText(root, RISK_PATH, "`active`", "active"),
    expected: /lifecycle serialization must be exactly one backticked metadata token/i,
  },
  {
    name: "lifecycle / list serialization",
    mutation: (root) => replaceText(root, RISK_PATH, "`active`", "- `active`"),
    expected: /lifecycle serialization must be exactly one backticked metadata token/i,
  },
  {
    name: "lifecycle / label serialization",
    mutation: (root) => replaceText(root, RISK_PATH, "`active`", "Lifecycle: `active`"),
    expected: /lifecycle serialization must be exactly one backticked metadata token/i,
  },
  {
    name: "lifecycle / sentence serialization",
    mutation: (root) => replaceText(root, RISK_PATH, "`active`", "The lifecycle is `active`."),
    expected: /lifecycle serialization must be exactly one backticked metadata token/i,
  },
  {
    name: "lifecycle / extra token",
    mutation: (root) => replaceText(root, RISK_PATH, "`active`", "`active` `draft`"),
    expected: /lifecycle serialization must be exactly one backticked metadata token/i,
  },
  {
    name: "lifecycle / metadata mismatch",
    mutation: (root) => replaceText(root, RISK_PATH, "`active`", "`draft`"),
    expected: /lifecycle serialization must be exactly one backticked metadata token/i,
  },
  {
    name: "metadata prose parity / mismatched IDs",
    mutation: (root) => setRiskAffects(root, ["DOC-CORE-NAVIGATION-MANIFEST"], ["- [DOC-CORE-NAVIGATION-DOCUMENT-MAP](../DOCUMENT_MAP.md)"]),
    expected: /Affected IDs must exactly match the sorted metadata IDs/i,
  },
  {
    name: "metadata prose parity / reordered metadata IDs",
    mutation: (root) => setRiskAffects(root, ["DOC-CORE-NAVIGATION-MANIFEST", "DOC-CORE-NAVIGATION-DOCUMENT-MAP"], [
      "- [DOC-CORE-NAVIGATION-MANIFEST](../manifest.json)",
      "- [DOC-CORE-NAVIGATION-DOCUMENT-MAP](../DOCUMENT_MAP.md)",
    ]),
    expected: /affects must be sorted by ascending stable ID/i,
  },
  {
    name: "metadata prose parity / reordered prose bullets",
    mutation: (root) => setRiskAffects(root, ["DOC-CORE-NAVIGATION-DOCUMENT-MAP", "DOC-CORE-NAVIGATION-MANIFEST"], [
      "- [DOC-CORE-NAVIGATION-MANIFEST](../manifest.json)",
      "- [DOC-CORE-NAVIGATION-DOCUMENT-MAP](../DOCUMENT_MAP.md)",
    ]),
    expected: /Affected IDs must exactly match the sorted metadata IDs/i,
  },
  {
    name: "metadata prose parity / duplicate prose bullet",
    mutation: (root) => setRiskAffects(root, ["DOC-CORE-NAVIGATION-MANIFEST"], [
      "- [DOC-CORE-NAVIGATION-MANIFEST](../manifest.json)",
      "- [DOC-CORE-NAVIGATION-MANIFEST](../manifest.json)",
    ]),
    expected: /Affected IDs must contain one Markdown bullet per ID and no prose/i,
  },
  {
    name: "closure / unresolved affects",
    mutation: (root) => setRiskAffects(root, ["DOC-MISSING"], ["- [DOC-MISSING](../missing.md)"]),
    expected: /affects has unresolved canonical identity DOC-MISSING/i,
  },
  {
    name: "closure / self affects",
    mutation: (root) => setRiskAffects(root, [RISK_ID], [`- [${RISK_ID}](RISK_REGISTER.md#risk-core-documentation-dual-truth-001)`]),
    expected: /affects cannot contain its own identity/i,
  },
  {
    name: "closure / unresolved closedBy",
    mutation: (root) => setUnknownClosedBy(root, ["WORK-MISSING"], ["- [WORK-MISSING](ROADMAP.md#work-missing)"]),
    expected: /closedBy must contain resolvable GATE or WORK identities/i,
  },
  {
    name: "closure / wrong-type closedBy",
    mutation: (root) => setUnknownClosedBy(root, [RISK_ID], [`- [${RISK_ID}](RISK_REGISTER.md#risk-core-documentation-dual-truth-001)`]),
    expected: /closedBy must contain resolvable GATE or WORK identities/i,
  },
  {
    name: "closure / unresolved motivatedBy",
    mutation: (root) => setRoadmapMotivatedBy(root, ["RISK-MISSING", UNKNOWN_ID], [
      "- [RISK-MISSING](RISK_REGISTER.md#risk-missing)",
      `- [${UNKNOWN_ID}](KNOWN_UNKNOWNS.md#unknown-core-documentation-contract-inventory-001)`,
    ]),
    expected: /motivatedBy must contain resolvable RISK or UNKNOWN identities/i,
  },
  {
    name: "closure / wrong-type motivatedBy",
    mutation: (root) => setRoadmapMotivatedBy(root, ["DOC-CORE-NAVIGATION-MANIFEST", UNKNOWN_ID], [
      "- [DOC-CORE-NAVIGATION-MANIFEST](../manifest.json)",
      `- [${UNKNOWN_ID}](KNOWN_UNKNOWNS.md#unknown-core-documentation-contract-inventory-001)`,
    ]),
    expected: /motivatedBy must contain resolvable RISK or UNKNOWN identities/i,
  },
  {
    name: "closure / genuine negative cross-category target removal",
    mutation: (root) => rewriteText(root, ROADMAP_PATH, (source) => source.replaceAll(WORK_ID, "WORK-CORE-LAYOUT-CUTOVER-002")),
    expected: /closedBy must contain resolvable GATE or WORK identities/i,
  },
  {
    name: "authored reference / unregistered ID and path",
    mutation: (root) => rewriteText(root, "docs/project/CURRENT_STATE.md", (source) => `${source}\n[DOC-UNREGISTERED](../UNREGISTERED.md)\n`),
    expected: /unresolved authored canonical reference DOC-UNREGISTERED/i,
  },
  {
    name: "authored reference / decorated non-exact link label",
    mutation: (root) => rewriteText(root, "docs/project/CURRENT_STATE.md", (source) => `${source}\n[DOC-CORE-NAVIGATION-MANIFEST — manifest](../manifest.json)\n`),
    expected: /canonical link labels must be exactly one stable ID/i,
  },
  {
    name: "link target / URI",
    mutation: (root) => rewriteText(root, "docs/project/CURRENT_STATE.md", (source) => `${source}\n[DOC-CORE-NAVIGATION-MANIFEST](https://example.test/manifest.json)\n`),
    expected: /must use a relative non-URI target/i,
  },
  {
    name: "link target / absolute path",
    mutation: (root) => rewriteText(root, "docs/project/CURRENT_STATE.md", (source) => `${source}\n[DOC-CORE-NAVIGATION-MANIFEST](/docs/manifest.json)\n`),
    expected: /must use a relative non-URI target/i,
  },
  {
    name: "link target / repository escaping",
    mutation: (root) => rewriteText(root, "docs/project/CURRENT_STATE.md", (source) => `${source}\n[DOC-CORE-NAVIGATION-MANIFEST](../../../outside.md)\n`),
    expected: /escapes the canonical root/i,
  },
  {
    name: "link target / pathless fragment",
    mutation: (root) => rewriteText(root, "docs/project/CURRENT_STATE.md", (source) => `${source}\n[DOC-CORE-NAVIGATION-MANIFEST](#manifest)\n`),
    expected: /must include a relative repository path/i,
  },
  {
    name: "link grammar / reference-style link",
    mutation: (root) => rewriteText(root, "docs/project/CURRENT_STATE.md", (source) => `${source}\n[DOC-CORE-NAVIGATION-MANIFEST][manifest]\n\n[manifest]: ../manifest.json\n`),
    expected: /contains a bare canonical ID outside a FLOWDOC-RECORD block/i,
  },
  {
    name: "current state / migrated-capability claim with empty release composition",
    mutation: (root) => write(root, "docs/project/CURRENT_STATE.md", "# Current state\n\nThe layout capability is migrated.\n"),
    expected: /current state cannot claim a migrated capability while release composition is empty/i,
  },
  {
    name: "risk / adverse-event omission",
    mutation: (root) => replaceText(root, RISK_PATH, "Conflicting sources lead to inconsistent decisions.", ""),
    expected: /Adverse event must contain an actual prose paragraph/i,
  },
  {
    name: "risk / mitigation omission",
    mutation: (root) => replaceText(root, RISK_PATH, "Use the canonical manifest and validation gate.", ""),
    expected: /Mitigation must contain an actual prose paragraph/i,
  },
  {
    name: "unknown / missing-evidence omission",
    mutation: (root) => replaceText(root, UNKNOWN_PATH, "The complete contract inventory is not yet authored.", ""),
    expected: /Missing evidence must contain an actual prose paragraph/i,
  },
  {
    name: "unknown / closing field omission",
    mutation: (root) => replaceText(root, UNKNOWN_PATH, ',"closedBy":["WORK-CORE-LAYOUT-CUTOVER-001"]', ""),
    expected: /metadata is missing field closedBy/i,
  },
  {
    name: "roadmap / missing motivating ID",
    mutation: (root) => setRoadmapMotivatedBy(root, [], []),
    expected: /motivatedBy must be non-empty/i,
  },
  {
    name: "effective astral regression / shifted metadata span cannot erase prose ID",
    mutation: (root) => {
      replaceText(root, RISK_PATH, `## ${RISK_ID} — Divergent sources`, `## ${RISK_ID} — ${"😀".repeat(38)} Divergent sources`)
      replaceText(root, RISK_PATH, "Conflicting sources lead to inconsistent decisions.", "REPO-FLOWDOC-CORE remains bare inside otherwise-valid prose.")
    },
    expected: /contains a bare canonical ID outside a FLOWDOC-RECORD block: REPO-FLOWDOC-CORE/i,
  },
  {
    name: "prose paragraph / raw-HTML-block-only body",
    mutation: (root) => replaceText(root, RISK_PATH, "Conflicting sources lead to inconsistent decisions.", "<div>not a prose paragraph</div>"),
    expected: /Adverse event must contain an actual prose paragraph/i,
  },
]

const RED_BRANCHES_AT_91A7973 = new Set([
  "manifest / missing Task 4 row",
  "manifest / extra Task 4 row",
  "manifest / path mismatch",
  "manifest / kind mismatch",
  "manifest / scope mismatch",
  "manifest / subsystem mismatch",
  "manifest / audience mismatch",
  "manifest / authority mismatch",
  "manifest / lifecycle mismatch",
  "manifest / repositoryIds mismatch",
  "manifest / releaseLines mismatch",
  "metadata / collision with an existing canonical category",
  "prose paragraph / raw-HTML-block-only body",
])
const AUDITED_TRUTH_PLANE_BRANCH_LEDGER = TRUTH_PLANE_BRANCH_LEDGER.map((row) => ({
  ...row,
  baselineAt91a7973: RED_BRANCHES_AT_91A7973.has(row.name) ? "RED" : "covered",
}))

const TRUTH_PLANE_POSITIVE_LEDGER: { name: string, mutation: (root: string) => void }[] = [
  {
    name: "valid embedded records",
    mutation: () => {},
  },
  {
    name: "valid embedded record after astral title text",
    mutation: (root) => replaceText(root, RISK_PATH, `## ${RISK_ID} — Divergent sources`, `## ${RISK_ID} — ${"😀".repeat(38)} Divergent sources`),
  },
  {
    name: "correct owner path with fragment",
    mutation: (root) => rewriteText(root, "docs/project/CURRENT_STATE.md", (source) => `${source}\n[DOC-CORE-NAVIGATION-MANIFEST](../manifest.json#document)\n`),
  },
]

describe("canonical documentation spine", () => {
  test("loads the approved pending-baseline model without publishing a baseline record", () => {
    const root = fixture()
    const model = loadPending(root)
    expect(validateCanonicalDocumentationModel(model, { allowPendingBaselineId: BASELINE_ID })).toBe(model)
    expect(model.baseline).toBeNull()
    expect(model.pendingBaselineId).toBe(BASELINE_ID)
    expect(model.compatibility).toEqual({ compatibilitySchemaVersion: 1, coreEditor: "not-verified", coreBackend: "not-verified", endToEnd: "not-verified" })
    expect(existsSync(join(root, "docs/coordination/DEVELOPMENT_BASELINE.json"))).toBe(false)
    expect(model.documents.some((document: any) => document.kind === "development-baseline")).toBe(false)
  })

  test("accepts a missing baseline only for the exact explicit planned unversioned non-ready release", () => {
    const root = fixture()
    expect(() => loadCanonicalDocumentationModel(root)).toThrow(/baseline.*missing|pending baseline/i)
    expect(() => loadCanonicalDocumentationModel(root, { allowPendingBaselineId: "BASELINE-FLOWDOC-20260811-99" })).toThrow(/pending baseline.*exactly match/i)
    for (const [field, value] of [["lifecycle", "active"], ["releaseVersion", "0.1.0"], ["releaseReady", true]] as const) {
      const changed = fixture()
      rewriteJson(changed, "docs/versions/0_1/release.json", (release) => { release[field] = value })
      expect(() => loadCanonicalDocumentationModel(changed, { allowPendingBaselineId: BASELINE_ID }), field).toThrow(/pending baseline.*planned.*unversioned.*false/i)
    }
  })

  test("rejects any pending baseline other than the Task 3 reserved literal before generation writes", () => {
    const alternateBaselineId = "BASELINE-FLOWDOC-20260811-02"

    const direct = fixture()
    rewriteJson(direct, "docs/versions/0_1/release.json", (release) => { release.baselineId = alternateBaselineId })
    expect(() => loadCanonicalDocumentationModel(direct, { allowPendingBaselineId: alternateBaselineId })).toThrow(/reserved pending baseline.*BASELINE-FLOWDOC-20260811-01/i)

    const generatedRoot = fixture()
    const sentinels = seedGeneratedSentinels(generatedRoot)
    rewriteJson(generatedRoot, "docs/versions/0_1/release.json", (release) => { release.baselineId = alternateBaselineId })
    const generation = runCli(generatedRoot, "scripts/generate-canonical-docs.mjs")
    expect(generation.status).not.toBe(0)
    expect(generation.stderr).toMatch(/reserved pending baseline.*BASELINE-FLOWDOC-20260811-01/i)
    expect(generated(generatedRoot)).toEqual(sentinels)

    const checkedRoot = fixture()
    rewriteJson(checkedRoot, "docs/versions/0_1/release.json", (release) => { release.baselineId = alternateBaselineId })
    const check = runCli(checkedRoot, "scripts/check-canonical-docs.mjs", "--allow-pending-baseline", alternateBaselineId)
    expect(check.status).not.toBe(0)
    expect(check.stderr).toMatch(/reserved pending baseline.*BASELINE-FLOWDOC-20260811-01/i)
  })

  test("rejects malformed JSON before generating any view", () => {
    const root = fixture()
    const sentinels = seedGeneratedSentinels(root)
    writeFileSync(join(root, "docs/glossary.json"), "{invalid", "utf8")
    expect(runCli(root, "scripts/generate-canonical-docs.mjs").status).not.toBe(0)
    expect(generated(root)).toEqual(sentinels)
  })

  test("rejects missing and unknown fields in every approved source shape", () => {
    const cases: [string, (value: any) => void][] = [
      ["docs/manifest.json", (value) => { delete value.repositoryId }],
      ["docs/glossary.json", (value) => { value.unknown = true }],
      ["docs/coordination/REPOSITORY_INDEX.json", (value) => { delete value.futureCoordinationRepository.lifecycle }],
      ["docs/versions/0_1/release.json", (value) => { value.composition = [] }],
    ]
    for (const [path, mutate] of cases) {
      const root = fixture()
      rewriteJson(root, path, mutate)
      expect(() => loadPending(root), path).toThrow(/missing field|unknown field/i)
    }
  })

  test("requires exact document fields, authored titles, safe paths, and unique DOC identities and paths", () => {
    const missingTitle = fixture()
    rewriteJson(missingTitle, "docs/manifest.json", (manifest) => { delete manifest.documents[0].title })
    expect(() => loadPending(missingTitle)).toThrow(/title|missing field/i)

    const unsafe = fixture()
    rewriteJson(unsafe, "docs/manifest.json", (manifest) => { manifest.documents[6].path = "docs/coordination/../escape.md" })
    expect(() => loadPending(unsafe)).toThrow(/safe repository-relative path/i)

    const duplicateId = fixture()
    rewriteJson(duplicateId, "docs/manifest.json", (manifest) => { manifest.documents[1].documentId = manifest.documents[0].documentId })
    expect(() => loadPending(duplicateId)).toThrow(/duplicate.*DOC/i)

    const duplicatePath = fixture()
    rewriteJson(duplicatePath, "docs/manifest.json", (manifest) => { manifest.documents[1].path = manifest.documents[0].path })
    expect(() => loadPending(duplicatePath)).toThrow(/duplicate.*path/i)
  })

  test("rejects unregistered canonical files below a declared root", () => {
    const root = fixture()
    write(root, "docs/coordination/UNREGISTERED.md", "# Unregistered\n")
    expect(() => loadPending(root)).toThrow(/canonical file.*absent from the manifest/i)
  })

  test("closes appliesTo selectors over distinct registered D1 identities", () => {
    const mutations: ((manifest: any) => void)[] = [
      (manifest) => manifest.documents[0].appliesTo.repositoryIds.push("REPO-FLOWDOC-CORE"),
      (manifest) => manifest.documents[0].appliesTo.repositoryIds = ["REPO-SELECTOR-ONLY"],
      (manifest) => manifest.documents[0].appliesTo.releaseLines = ["0_1"],
      (manifest) => manifest.documents[0].appliesTo.releaseLines = ["0.2"],
      (manifest) => manifest.documents[0].appliesTo.contractIds = ["CONTRACT-SELECTOR-ONLY"],
      (manifest) => manifest.documents[0].appliesTo.schemaIds = ["SCHEMA-SELECTOR-ONLY"],
    ]
    for (const mutate of mutations) {
      const root = fixture()
      rewriteJson(root, "docs/manifest.json", mutate)
      expect(() => loadPending(root)).toThrow(/duplicate|repository|release line|contractIds|schemaIds|owner registry/i)
    }
  })

  test("rejects selector-only release capability, contract, and gate identities", () => {
    for (const field of ["capabilityIds", "contractIds", "verificationGateIds"] as const) {
      const root = fixture()
      rewriteJson(root, "docs/versions/0_1/release.json", (release) => { release[field] = [field === "capabilityIds" ? "CAP-SELECTOR-ONLY" : field === "contractIds" ? "CONTRACT-SELECTOR-ONLY" : "GATE-SELECTOR-ONLY"] })
      expect(() => loadPending(root), field).toThrow(/owner registr|must be empty/i)
    }
  })

  test("keeps the repository index neutral and resolves only Core's active manifest adoption", () => {
    const root = fixture()
    const model = loadPending(root)
    expect(model.repositoryIndex.repositories.map((repository: any) => [repository.repositoryId, repository.role, repository.manifestAdoption, repository.manifestDocumentId])).toEqual([
      ["REPO-FLOWDOC-CORE", "core-engine", "active", "DOC-CORE-NAVIGATION-MANIFEST"],
      ["REPO-FLOWDOC-EDITOR", "editor-client", "not-adopted", null],
      ["REPO-FLOWDOC-BACKEND", "backend-service", "not-adopted", null],
    ])
    rewriteJson(root, "docs/coordination/REPOSITORY_INDEX.json", (index) => { index.repositories[1].releaseReady = false })
    expect(() => loadPending(root)).toThrow(/unknown field releaseReady/i)
  })

  test("requires the exact provisional host and future coordination working name", () => {
    const editorHost = fixture()
    rewriteJson(editorHost, "docs/coordination/REPOSITORY_INDEX.json", (index) => { index.provisionalHostRepositoryId = "REPO-FLOWDOC-EDITOR" })
    expect(() => loadPending(editorHost)).toThrow(/provisionalHostRepositoryId.*REPO-FLOWDOC-CORE/i)

    const alternateName = fixture()
    rewriteJson(alternateName, "docs/coordination/REPOSITORY_INDEX.json", (index) => { index.futureCoordinationRepository.workingName = "flowdoc-coordination-alternate" })
    expect(() => loadPending(alternateName)).toThrow(/workingName.*flowdoc-vnext-coordination/i)
  })

  test("requires the exact active compatibility document and authored metadata", () => {
    const root = fixture()
    rewriteJson(root, "docs/versions/0_1/release.json", (release) => { release.compatibilityDocumentId = "DOC-CORE-NAVIGATION-DOCUMENT-MAP" })
    expect(() => loadPending(root)).toThrow(/compatibilityDocumentId/i)

    const malformed = fixture()
    write(malformed, "docs/versions/0_1/COMPATIBILITY.md", "# Compatibility\n")
    expect(() => loadPending(malformed)).toThrow(/FLOWDOC-COMPATIBILITY/i)

    const unknown = fixture()
    write(unknown, "docs/versions/0_1/COMPATIBILITY.md", `<!-- FLOWDOC-COMPATIBILITY\n{"compatibilitySchemaVersion":1,"coreEditor":"not-verified","coreBackend":"not-verified","endToEnd":"not-verified","extra":true}\n-->\n`)
    expect(() => loadPending(unknown)).toThrow(/unknown field extra/i)
  })

  test("validates exact term relations and ambiguous lexical-form resolution", () => {
    const unresolved = fixture()
    rewriteJson(unresolved, "docs/glossary.json", (glossary) => { glossary.terms[0].relations.relatedTo = ["TERM-MISSING"] })
    expect(() => loadPending(unresolved)).toThrow(/relatedTo.*unresolved/i)

    const wrongFamily = fixture()
    rewriteJson(wrongFamily, "docs/glossary.json", (glossary) => { glossary.terms[0].relations.meansSameAs = ["TERM-FLOWDOC-RISK"] })
    expect(() => loadPending(wrongFamily)).toThrow(/meansSameAs.*same concept family/i)

    const ambiguous = fixture()
    rewriteJson(ambiguous, "docs/glossary.json", (glossary) => { glossary.lexicalForms[0].possibleTermIds = ["TERM-FLOWDOC-FACT"] })
    expect(() => loadPending(ambiguous)).toThrow(/ambiguous-alias.*at least two/i)
  })

  test("rejects visible ambiguous aliases but excludes code, every Markdown link target, direct IDs, and qualified hyphenated tokens", () => {
    const bare = fixture()
    write(bare, "docs/coordination/BOUNDARY.md", "# Boundary\n\nThe status is unspecified.\n")
    expect(() => loadPending(bare)).toThrow(/ambiguous alias status/i)

    const excluded = fixture()
    write(excluded, "docs/coordination/BOUNDARY.md", `# Boundary

\`status\`, [safe inline](https://example.test/status), and TERM-FLOWDOC-FACT remain excluded.

[safe reference][status]
[safe destination identifier][destination-id]
[safe scheme autolink reference][status-ref]
[safe compact reference][compact-ref]
[safe balanced reference][balanced-ref]

[status]: https://example.test/status
[destination-id]: https://example.test/status
[status-ref]: <https://example.test/status> "qualified destination"
[compact-ref]:https://example.test/status
[balanced-ref]:https://example.test/a(b)/status

<https://example.test/status>
<foo:status>
<status@example.test>
<mailto:status@example.test>

\`\`\`text
status
\`\`\`

A dual-status token is qualified.
`)
    expect(() => loadPending(excluded)).not.toThrow()

    const visibleInline = fixture()
    write(visibleInline, "docs/coordination/BOUNDARY.md", "# Boundary\n\n[status](https://example.test/safe) remains visible.\n")
    expect(() => loadPending(visibleInline)).toThrow(/ambiguous alias status/i)

    const visibleReference = fixture()
    write(visibleReference, "docs/coordination/BOUNDARY.md", "# Boundary\n\n[status][ref] remains visible.\n\n[ref]: https://example.test/safe\n")
    expect(() => loadPending(visibleReference)).toThrow(/ambiguous alias status/i)
  })

  test("does not treat malformed reference definitions as hidden link destinations", () => {
    const missingDestination = fixture()
    write(missingDestination, "docs/coordination/BOUNDARY.md", "# Boundary\n\n[status]:\n")
    expect(() => loadPending(missingDestination)).toThrow(/ambiguous alias status/i)

    const invalidTitle = fixture()
    write(invalidTitle, "docs/coordination/BOUNDARY.md", "# Boundary\n\n[safe]: https://example.test/safe \"status\n")
    expect(() => loadPending(invalidTitle)).toThrow(/ambiguous alias status/i)

    const unbalancedDestination = fixture()
    write(unbalancedDestination, "docs/coordination/BOUNDARY.md", "# Boundary\n\n[status]: broken)\n")
    expect(() => loadPending(unbalancedDestination)).toThrow(/ambiguous alias status/i)

    const escapedWhitespace = fixture()
    write(escapedWhitespace, "docs/coordination/BOUNDARY.md", "# Boundary\n\n[status]: broken\\ value\n")
    expect(() => loadPending(escapedWhitespace)).toThrow(/ambiguous alias status/i)
  })

  test("treats trailing whitespace as no reference title and permits punctuation escapes in bare destinations", () => {
    const trailingWhitespace = fixture()
    write(trailingWhitespace, "docs/coordination/BOUNDARY.md", "# Boundary\n\n[status]: https://example.test/safe   \n")
    expect(() => loadPending(trailingWhitespace)).not.toThrow()

    const escapedPunctuation = fixture()
    write(escapedPunctuation, "docs/coordination/BOUNDARY.md", "# Boundary\n\n[status]: https://example.test/safe\\)destination\n")
    expect(() => loadPending(escapedPunctuation)).not.toThrow()
  })

  test("strips reference destination labels only when they resolve to valid normalized definitions", () => {
    const unresolved = fixture()
    write(unresolved, "docs/coordination/BOUNDARY.md", "# Boundary\n\n[safe][status]\n")
    expect(() => loadPending(unresolved)).toThrow(/ambiguous alias status/i)

    const resolved = fixture()
    write(resolved, "docs/coordination/BOUNDARY.md", "# Boundary\n\n[safe][STATUS   REF]\n\n[ status ref ]:https://example.test/status\n")
    expect(() => loadPending(resolved)).not.toThrow()

    const shortcut = fixture()
    write(shortcut, "docs/coordination/BOUNDARY.md", "# Boundary\n\n[status]\n\n[status]: https://example.test/safe\n")
    expect(() => loadPending(shortcut)).toThrow(/ambiguous alias status/i)
  })

  test("collects stable references and rejects unresolved active normative references", () => {
    expect(collectCanonicalReferences("DOC-CORE-ONE, REPO-FLOWDOC-CORE, TERM-FLOWDOC-FACT; BASELINE-FLOWDOC-20260811-01.")).toEqual([
      "DOC-CORE-ONE", "REPO-FLOWDOC-CORE", "TERM-FLOWDOC-FACT", BASELINE_ID,
    ])
    const root = fixture()
    write(root, "docs/coordination/BOUNDARY.md", "# Boundary\n\nSee DOC-MISSING.\n")
    expect(() => loadPending(root)).toThrow(/unresolved canonical reference DOC-MISSING/i)
  })

  test.each(AUDITED_TRUTH_PLANE_BRANCH_LEDGER)("truth-plane branch ledger / $baselineAt91a7973 at 91a7973 / $name", ({ mutation, expected }) => {
    const root = fixture()
    addTruthPlane(root)
    mutation(root)
    const check = runCli(root, "scripts/check-canonical-docs.mjs", "--allow-pending-baseline", BASELINE_ID)
    expect(check.status).not.toBe(0)
    expect(check.stderr).toMatch(expected)
  })

  test.each(TRUTH_PLANE_POSITIVE_LEDGER)("truth-plane positive ledger / $name", ({ mutation }) => {
    const root = fixture()
    addTruthPlane(root)
    mutation(root)
    const generation = runCli(root, "scripts/generate-canonical-docs.mjs")
    expect(generation.status, generation.stderr).toBe(0)
    const check = runCli(root, "scripts/check-canonical-docs.mjs", "--allow-pending-baseline", BASELINE_ID)
    expect(check.status, check.stderr).toBe(0)
  })

  test("truth-plane positive ledger / real-root cross-category closure", () => {
    const root = process.cwd()
    const check = runCli(root, "scripts/check-canonical-docs.mjs", "--allow-pending-baseline", BASELINE_ID)
    expect(check.status, check.stderr).toBe(0)
    const model = loadCanonicalDocumentationModel(root, { allowPendingBaselineId: BASELINE_ID })
    const workIds = new Set(model.embeddedRecords.filter((record: any) => record.recordKind === "work").map((record: any) => record.recordId))
    const motivatedIds = new Set(model.embeddedRecords.filter((record: any) => record.recordKind !== "work").map((record: any) => record.recordId))
    expect(model.embeddedRecords.filter((record: any) => record.recordKind === "unknown").flatMap((record: any) => record.closedBy).every((recordId: string) => workIds.has(recordId))).toBe(true)
    expect(model.embeddedRecords.filter((record: any) => record.recordKind === "work").flatMap((record: any) => record.motivatedBy).every((recordId: string) => motivatedIds.has(recordId))).toBe(true)
  })

  test("collects embedded truth records and validates them through the production checker entrypoint", () => {
    const root = fixture()
    addTruthPlane(root)
    const records = collectEmbeddedCanonicalRecords(readFileSync(join(root, "docs/project/RISK_REGISTER.md"), "utf8"), {
      documentKind: "risk-register",
      path: "docs/project/RISK_REGISTER.md",
    })
    expect(records).toHaveLength(1)
    expect(records[0]).toMatchObject({ recordId: "RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001", recordKind: "risk", lifecycle: "active", affects: ["DOC-CORE-NAVIGATION-MANIFEST"] })
    expect(runCli(root, "scripts/generate-canonical-docs.mjs").status).toBe(0)
    const check = runCli(root, "scripts/check-canonical-docs.mjs", "--allow-pending-baseline", BASELINE_ID)
    expect(check.status, check.stderr).toBe(0)
  })

  test("rejects malformed, duplicate, unresolved, and non-clickable truth-plane records through the production checker entrypoint", () => {
    const cases: [string, (root: string) => void, RegExp][] = [
      ["record block must immediately follow its heading", (root) => {
        const path = join(root, "docs/project/RISK_REGISTER.md")
        writeFileSync(path, readFileSync(path, "utf8").replace("\n<!-- FLOWDOC-RECORD", "\nA separating paragraph.\n\n<!-- FLOWDOC-RECORD"), "utf8")
      }, /immediately follow/i],
      ["record metadata has no extra fields", (root) => {
        const path = join(root, "docs/project/RISK_REGISTER.md")
        writeFileSync(path, readFileSync(path, "utf8").replace("\"affects\":[\"DOC-CORE-NAVIGATION-MANIFEST\"]", "\"affects\":[\"DOC-CORE-NAVIGATION-MANIFEST\"],\"extra\":true"), "utf8")
      }, /unknown field extra/i],
      ["record prose references use their registered owner paths", (root) => {
        const path = join(root, "docs/project/RISK_REGISTER.md")
        writeFileSync(path, readFileSync(path, "utf8").replace("../manifest.json", "../glossary.json"), "utf8")
      }, /registered owner path|owns another/i],
      ["canonical prose references cannot be bare IDs", (root) => {
        const path = join(root, "docs/project/RISK_REGISTER.md")
        writeFileSync(path, readFileSync(path, "utf8").replace("Conflicting sources lead", "DOC-CORE-NAVIGATION-MANIFEST conflicts lead"), "utf8")
      }, /bare canonical ID/i],
      ["record identities are unique across truth-plane categories", (root) => {
        const path = join(root, "docs/project/RISK_REGISTER.md")
        const source = readFileSync(path, "utf8")
        writeFileSync(path, `${source}${source.slice(source.indexOf("\n##"))}`, "utf8")
      }, /duplicate.*identity/i],
    ]
    for (const [, mutate, expected] of cases) {
      const root = fixture()
      addTruthPlane(root)
      mutate(root)
      const check = runCli(root, "scripts/check-canonical-docs.mjs", "--allow-pending-baseline", BASELINE_ID)
      expect(check.status).not.toBe(0)
      expect(check.stderr).toMatch(expected)
    }
  })

  test("closes Task 4 prose exemptions, prose bodies, and version non-claims through the production checker", () => {
    const cases: [string, (root: string) => void, RegExp][] = [
      ["a bare ID in an ordinary level-two heading", (root) => {
        const path = join(root, "docs/VERSION_POLICY.md")
        writeFileSync(path, `${readFileSync(path, "utf8")}\n## DOC-CORE-NAVIGATION-MANIFEST\n`, "utf8")
      }, /bare canonical ID/i],
      ["a bare ID in a fake record comment", (root) => writeFileSync(join(root, "docs/project/CURRENT_STATE.md"), "<!-- FLOWDOC-RECORD\nDOC-CORE-NAVIGATION-MANIFEST\n-->\n", "utf8"), /bare canonical ID/i],
      ["nonblank preamble before the first section", (root) => {
        const path = join(root, "docs/project/RISK_REGISTER.md")
        writeFileSync(path, readFileSync(path, "utf8").replace("-->\n\n### Adverse", "-->\n\nStray prose.\n\n### Adverse"), "utf8")
      }, /preamble/i],
      ["list-only prose body", (root) => {
        const path = join(root, "docs/project/RISK_REGISTER.md")
        writeFileSync(path, readFileSync(path, "utf8").replace("Conflicting sources lead to inconsistent decisions.", "- A list is not prose."), "utf8")
      }, /prose paragraph/i],
      ["code-only prose body", (root) => {
        const path = join(root, "docs/project/RISK_REGISTER.md")
        writeFileSync(path, readFileSync(path, "utf8").replace("Conflicting sources lead to inconsistent decisions.", "```text\nonly code\n```"), "utf8")
      }, /prose paragraph/i],
      ["comment-only prose body", (root) => {
        const path = join(root, "docs/project/RISK_REGISTER.md")
        writeFileSync(path, readFileSync(path, "utf8").replace("Conflicting sources lead to inconsistent decisions.", "<!-- only a comment -->"), "utf8")
      }, /prose paragraph/i],
      ["a released claim before unrelated non-authorization prose", (root) => writeFileSync(join(root, "docs/VERSION_POLICY.md"), "The proposed 0.1.0-a.1 is released.\n\nAnother package is not authorized.\n", "utf8"), /version policy.*released|not authorized/i],
    ]
    for (const [, mutate, expected] of cases) {
      const root = fixture()
      addTruthPlane(root)
      mutate(root)
      const check = runCli(root, "scripts/check-canonical-docs.mjs", "--allow-pending-baseline", BASELINE_ID)
      expect(check.status).not.toBe(0)
      expect(check.stderr).toMatch(expected)
    }
  })

  test("rejects astral-shifted bare IDs, Markdown block-only bodies, and distant proposed-version claims", () => {
    const cases: [string, (root: string) => void, RegExp][] = [
      ["astral Unicode before a record does not broaden its exemption", (root) => {
        const path = join(root, "docs/project/RISK_REGISTER.md")
        writeFileSync(path, `😀\n${readFileSync(path, "utf8").replace("# Risk register", "# Risk register\n\nDOC-CORE-NAVIGATION-MANIFEST")}`, "utf8")
      }, /bare canonical ID/i],
      ["indented code is not a prose paragraph", (root) => {
        const path = join(root, "docs/project/RISK_REGISTER.md")
        writeFileSync(path, readFileSync(path, "utf8").replace("Conflicting sources lead to inconsistent decisions.", "    code only"), "utf8")
      }, /prose paragraph/i],
      ["heading-only prose is rejected", (root) => {
        const path = join(root, "docs/project/RISK_REGISTER.md")
        writeFileSync(path, readFileSync(path, "utf8").replace("Conflicting sources lead to inconsistent decisions.", "#### Heading only"), "utf8")
      }, /prose paragraph/i],
      ["distant claims before and after the required statement are rejected", (root) => {
        const path = join(root, "docs/VERSION_POLICY.md")
        const source = readFileSync(path, "utf8")
        writeFileSync(path, `0.1.0-a.1 was released.\n\n${source}\n\nAuthorization for 0.1.0-a.1 is granted.\n`, "utf8")
      }, /cannot claim 0\.1\.0-a\.1 is released or authorized/i],
    ]
    for (const [, mutate, expected] of cases) {
      const root = fixture()
      addTruthPlane(root)
      mutate(root)
      const check = runCli(root, "scripts/check-canonical-docs.mjs", "--allow-pending-baseline", BASELINE_ID)
      expect(check.status).not.toBe(0)
      expect(check.stderr).toMatch(expected)
    }
  })

  test("branch ledger: rejects every remaining block-only body and proposed-version claim form through the checker", () => {
    const bodyCases = ["```text\ncode\n```", "    indented", "<!-- comment -->", "- list", "> quote", "#### heading", "Heading\n---", "***", "_ _ _", "- - -"]
    for (const body of bodyCases) {
      const root = fixture(); addTruthPlane(root)
      const path = join(root, "docs/project/RISK_REGISTER.md")
      writeFileSync(path, readFileSync(path, "utf8").replace("Conflicting sources lead to inconsistent decisions.", body), "utf8")
      const check = runCli(root, "scripts/check-canonical-docs.mjs", "--allow-pending-baseline", BASELINE_ID)
      expect(check.status).not.toBe(0); expect(check.stderr).toMatch(/prose paragraph/i)
    }
    for (const claim of ["0.1.0-a.1 is a release.", "Authorization is granted for 0.1.0-a.1.", "0.1.0-a.1 is authorized."]) {
      const root = fixture(); addTruthPlane(root)
      const path = join(root, "docs/VERSION_POLICY.md")
      writeFileSync(path, `${readFileSync(path, "utf8")}\n\n${claim}\n`, "utf8")
      const check = runCli(root, "scripts/check-canonical-docs.mjs", "--allow-pending-baseline", BASELINE_ID)
      expect(check.status).not.toBe(0); expect(check.stderr).toMatch(/cannot claim 0\.1\.0-a\.1 is released or authorized/i)
    }
  })

  test("generates five byte-stable approved views and uses the generated header", () => {
    const root = fixture()
    const first = runCli(root, "scripts/generate-canonical-docs.mjs")
    expect(first.status, first.stderr).toBe(0)
    const initial = generated(root)
    const second = runCli(root, "scripts/generate-canonical-docs.mjs")
    expect(second.status, second.stderr).toBe(0)
    expect(generated(root)).toEqual(initial)
    expect(Object.keys(initial)).toEqual([...GENERATED_PATHS])
    for (const output of Object.values(initial)) expect(output.startsWith(GENERATED_HEADER)).toBe(true)
  })

  test("renders language-specific labels and definitions in one immutable Term-ID order", () => {
    const outputs = renderGeneratedFiles(loadPending(fixture()))
    const ids = (output: string) => [...output.matchAll(/^## `(TERM-[A-Z0-9-]+)`/gm)].map((match) => match[1])
    expect(ids(outputs["docs/GLOSSARY.md"])).toEqual(["TERM-FLOWDOC-FACT", "TERM-FLOWDOC-RISK"])
    expect(ids(outputs["docs/GLOSSARY_TH.md"])).toEqual(ids(outputs["docs/GLOSSARY.md"]))
    expect(outputs["docs/GLOSSARY.md"]).toContain("Fact")
    expect(outputs["docs/GLOSSARY.md"]).toContain("A statement supported by evidence.")
    expect(outputs["docs/GLOSSARY_TH.md"]).toContain("ข้อเท็จจริง")
    expect(outputs["docs/GLOSSARY_TH.md"]).toContain("ข้อความที่มีหลักฐานรองรับ")
  })

  test("sorts document-map links by immutable ID within its stable groups", () => {
    const root = fixture()
    rewriteJson(root, "docs/manifest.json", (manifest) => { manifest.documents.reverse() })
    const map = renderGeneratedFiles(loadPending(root))["docs/DOCUMENT_MAP.md"]
    expect(map.indexOf("## Active current truth")).toBeLessThan(map.indexOf("## Coordination"))
    expect(map.indexOf("## Coordination")).toBeLessThan(map.indexOf("## Version line"))
    expect(map.indexOf("## Version line")).toBeLessThan(map.indexOf("## Glossary"))
    expect(map).toContain("[DOC-CORE-NAVIGATION-MANIFEST — DOC-CORE-NAVIGATION-MANIFEST title](manifest.json)")
  })

  test("projects authored release and compatibility facts with an explicit empty-selector non-claim", () => {
    const outputs = renderGeneratedFiles(loadPending(fixture()))
    const overview = outputs["docs/versions/0_1/VERSION_OVERVIEW.md"]
    expect(overview).toContain("lifecycle: planned")
    expect(overview).toContain("releaseVersion: unversioned")
    expect(overview).toContain("releaseReady: false")
    expect(overview).toContain(`baselineId: ${BASELINE_ID}`)
    expect(overview).toContain("coreEditor: not-verified")
    expect(overview).toContain("coreBackend: not-verified")
    expect(overview).toContain("endToEnd: not-verified")
    expect(outputs["docs/versions/0_1/CAPABILITY_SET.md"]).toMatch(/no subsystem cutover.*no release-readiness claim/i)
  })

  test("checks generated drift in memory without rewriting it", () => {
    const root = fixture()
    expect(runCli(root, "scripts/generate-canonical-docs.mjs").status).toBe(0)
    writeFileSync(join(root, "docs/GLOSSARY.md"), `${GENERATED_HEADER}edited byte\n`, "utf8")
    const check = runCli(root, "scripts/check-canonical-docs.mjs", "--allow-pending-baseline", BASELINE_ID)
    expect(check.status).not.toBe(0)
    expect(check.stderr).toMatch(/drift.*GLOSSARY/i)
    expect(readFileSync(join(root, "docs/GLOSSARY.md"), "utf8")).toBe(`${GENERATED_HEADER}edited byte\n`)
  })

  test("generation changes no authored canonical source", () => {
    const root = fixture()
    const authoredPaths = ["docs/manifest.json", "docs/glossary.json", "docs/coordination/REPOSITORY_INDEX.json", "docs/coordination/BOUNDARY.md", "docs/versions/0_1/release.json", "docs/versions/0_1/COMPATIBILITY.md"]
    const before = Object.fromEntries(authoredPaths.map((path) => [path, readFileSync(join(root, path), "utf8")]))
    expect(runCli(root, "scripts/generate-canonical-docs.mjs").status).toBe(0)
    expect(Object.fromEntries(authoredPaths.map((path) => [path, readFileSync(join(root, path), "utf8")]))).toEqual(before)
  })

  test("the checker requires the explicit exact pending baseline while generation auto-selects only the non-claim release", () => {
    const root = fixture()
    expect(runCli(root, "scripts/generate-canonical-docs.mjs").status).toBe(0)
    expect(runCli(root, "scripts/check-canonical-docs.mjs").status).not.toBe(0)
    expect(runCli(root, "scripts/check-canonical-docs.mjs", "--allow-pending-baseline", BASELINE_ID).status).toBe(0)
    const wrong = runCli(root, "scripts/check-canonical-docs.mjs", "--allow-pending-baseline", "BASELINE-FLOWDOC-20260811-99")
    expect(wrong.status).not.toBe(0)
    expect(wrong.stderr).toMatch(/pending baseline.*exactly match/i)
  })

  test("uses the current directory when a root option is omitted", () => {
    const root = fixture()
    expect(runCliFromRoot(root, "scripts/generate-canonical-docs.mjs").status).toBe(0)
    const check = runCliFromRoot(root, "scripts/check-canonical-docs.mjs", "--allow-pending-baseline", BASELINE_ID)
    expect(check.status, check.stderr).toBe(0)
  })

  test("the repository root has the literal D2 truth-plane inventory and no Task 6 baseline publication", () => {
    const root = process.cwd()
    const model = loadCanonicalDocumentationModel(root, { allowPendingBaselineId: BASELINE_ID })
    expect(documentMapping(model.documents)).toEqual([...DOCUMENT_ROWS, ...TRUTH_DOCUMENT_ROWS])
    expect(model.manifest.canonicalRoots).toEqual(["docs/project", "docs/coordination", "docs/versions/0_1"])
    expect(model.documents.filter((document: any) => !model.manifest.canonicalRoots.some((canonicalRoot: string) => document.path.startsWith(`${canonicalRoot}/`))).map((document: any) => document.path)).toEqual([
      "docs/manifest.json", "docs/DOCUMENT_MAP.md", "docs/glossary.json", "docs/GLOSSARY.md", "docs/GLOSSARY_TH.md", "docs/VERSION_POLICY.md",
    ])
    expect(model.documents.every((document: any) => document.appliesTo.contractIds.length === 0 && document.appliesTo.schemaIds.length === 0)).toBe(true)
    expect(model.glossary.terms.every((term: any) => term.appliesTo.contractIds.length === 0 && term.appliesTo.schemaIds.length === 0)).toBe(true)
    expect(model.baseline).toBeNull()
    expect(model.pendingBaselineId).toBe(BASELINE_ID)
    expect(existsSync(join(root, "docs/coordination/DEVELOPMENT_BASELINE.json"))).toBe(false)
    expect(model.documents.some((document: any) => document.path === "docs/coordination/DEVELOPMENT_BASELINE.json")).toBe(false)
    expect(model.compatibility).toEqual({ compatibilitySchemaVersion: 1, coreEditor: "not-verified", coreBackend: "not-verified", endToEnd: "not-verified" })
    expect(readFileSync(join(root, "docs/VERSION_POLICY.md"), "utf8")).toMatch(/0\.1\.0-a\.1.*not authorized|not authorized.*0\.1\.0-a\.1/i)
    expect(readFileSync(join(root, "docs/project/CURRENT_STATE.md"), "utf8")).toMatch(/zero runtime\s+subsystems.*migrated|no runtime subsystem.*migrated/i)
    expect(model.embeddedRecords.map((record: any) => record.recordId)).toEqual([
      "RISK-CORE-DOCUMENTATION-STALE-SOURCE-001",
      "RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001",
      "RISK-CORE-DOCUMENTATION-TEST-COUPLING-001",
      "RISK-CORE-DOCUMENTATION-PACKAGE-SURFACE-001",
      "RISK-FLOWDOC-COORDINATION-DUAL-OWNER-001",
      "RISK-FLOWDOC-COORDINATION-BASELINE-GHOST-001",
      "UNKNOWN-CORE-DOCUMENTATION-CONTRACT-INVENTORY-001",
      "UNKNOWN-CORE-DOCUMENTATION-TEST-MIGRATION-001",
      "UNKNOWN-CORE-PACKAGE-PUBLIC-DOCS-001",
      "UNKNOWN-FLOWDOC-COMPATIBILITY-EDITOR-001",
      "UNKNOWN-FLOWDOC-COMPATIBILITY-BACKEND-001",
      "UNKNOWN-FLOWDOC-COORDINATION-REPOSITORY-001",
      "WORK-CORE-LAYOUT-CUTOVER-001",
      "WORK-CORE-REMAINING-SUBSYSTEM-CUTOVER-001",
      "WORK-CORE-PACKAGE-RELEASE-BOUNDARY-001",
      "WORK-FLOWDOC-EDITOR-BACKEND-ADOPTION-001",
      "WORK-FLOWDOC-COORDINATION-TRANSFER-001",
      "WORK-FLOWDOC-AGENT-SYSTEM-REDESIGN-001",
    ])
    expect(generated(root)).toEqual(renderGeneratedFiles(model))
  })
})
