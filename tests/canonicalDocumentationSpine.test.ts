import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { spawnSync } from "node:child_process"
import { afterEach, describe, expect, test } from "vitest"

// @ts-ignore Task-owned executable Node model intentionally has no TypeScript declaration file.
import { collectCanonicalReferences, loadCanonicalDocumentationModel, validateCanonicalDocumentationModel } from "../scripts/documentation/canonical-docs-model.mjs"
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

  test("rejects bare ambiguous aliases but excludes code, link targets, direct IDs, and qualified hyphenated tokens", () => {
    const bare = fixture()
    write(bare, "docs/coordination/BOUNDARY.md", "# Boundary\n\nThe status is unspecified.\n")
    expect(() => loadPending(bare)).toThrow(/ambiguous alias status/i)

    const excluded = fixture()
    write(excluded, "docs/coordination/BOUNDARY.md", "# Boundary\n\n`status` and [label](status) and TERM-FLOWDOC-FACT remain excluded.\n\n```text\nstatus\n```\n\nA dual-status token is qualified.\n")
    expect(() => loadPending(excluded)).not.toThrow()
  })

  test("collects stable references and rejects unresolved active normative references", () => {
    expect(collectCanonicalReferences("DOC-CORE-ONE, REPO-FLOWDOC-CORE, TERM-FLOWDOC-FACT; BASELINE-FLOWDOC-20260811-01.")).toEqual([
      "DOC-CORE-ONE", "REPO-FLOWDOC-CORE", "TERM-FLOWDOC-FACT", BASELINE_ID,
    ])
    const root = fixture()
    write(root, "docs/coordination/BOUNDARY.md", "# Boundary\n\nSee DOC-MISSING.\n")
    expect(() => loadPending(root)).toThrow(/unresolved canonical reference DOC-MISSING/i)
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

  test("the repository root has the literal D1 inventory and no Task 6 baseline publication", () => {
    const root = process.cwd()
    const model = loadCanonicalDocumentationModel(root, { allowPendingBaselineId: BASELINE_ID })
    expect(documentMapping(model.documents)).toEqual(DOCUMENT_ROWS)
    expect(model.manifest.canonicalRoots).toEqual(["docs/project", "docs/coordination", "docs/versions/0_1"])
    expect(model.documents.filter((document: any) => !model.manifest.canonicalRoots.some((canonicalRoot: string) => document.path.startsWith(`${canonicalRoot}/`))).map((document: any) => document.path)).toEqual([
      "docs/manifest.json", "docs/DOCUMENT_MAP.md", "docs/glossary.json", "docs/GLOSSARY.md", "docs/GLOSSARY_TH.md",
    ])
    expect(model.documents.every((document: any) => document.appliesTo.contractIds.length === 0 && document.appliesTo.schemaIds.length === 0)).toBe(true)
    expect(model.glossary.terms.every((term: any) => term.appliesTo.contractIds.length === 0 && term.appliesTo.schemaIds.length === 0)).toBe(true)
    expect(model.baseline).toBeNull()
    expect(model.pendingBaselineId).toBe(BASELINE_ID)
    expect(existsSync(join(root, "docs/coordination/DEVELOPMENT_BASELINE.json"))).toBe(false)
    expect(model.documents.some((document: any) => document.path === "docs/coordination/DEVELOPMENT_BASELINE.json")).toBe(false)
    expect(model.compatibility).toEqual({ compatibilitySchemaVersion: 1, coreEditor: "not-verified", coreBackend: "not-verified", endToEnd: "not-verified" })
    expect(generated(root)).toEqual(renderGeneratedFiles(model))
  })
})
