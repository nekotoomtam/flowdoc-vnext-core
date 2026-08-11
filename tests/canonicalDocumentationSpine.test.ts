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
