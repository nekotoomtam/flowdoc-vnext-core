import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { spawnSync } from "node:child_process"
import { afterEach, describe, expect, test } from "vitest"

// @ts-ignore Task-owned executable Node model intentionally has no TypeScript declaration file.
import { collectCanonicalReferences, collectEmbeddedCanonicalRecords, loadCanonicalDocumentationModel, validateCanonicalDocumentationModel, validateDevelopmentBaselineEvolution } from "../scripts/documentation/canonical-docs-model.mjs"
// @ts-ignore Task-owned executable Node renderer intentionally has no TypeScript declaration file.
import { GENERATED_HEADER, renderGeneratedFiles } from "../scripts/documentation/canonical-docs-render.mjs"

const fixtureRoots: string[] = []

afterEach(() => {
  for (const root of fixtureRoots.splice(0)) rmSync(root, { force: true, recursive: true })
})

function write(root: string, relativePath: string, value: unknown): void {
  const path = join(root, relativePath)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`, "utf8")
}

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), "flowdoc-canonical-docs-"))
  fixtureRoots.push(root)

  write(root, "docs/manifest.json", {
    schemaVersion: 1,
    canonicalRoots: ["docs/coordination", "docs/versions/0_1"],
    documents: [
      { documentId: "DOC-CORE-NAVIGATION-MANIFEST", path: "docs/manifest.json", kind: "navigation", scope: "core", audience: "internal", authority: "normative", lifecycle: "active" },
      { documentId: "DOC-CORE-GLOSSARY", path: "docs/glossary.json", kind: "glossary", scope: "core", audience: "both", authority: "normative", lifecycle: "active" },
      { documentId: "DOC-CORE-REPOSITORY-INDEX", path: "docs/coordination/REPOSITORY_INDEX.json", kind: "repository-index", scope: "cross-repository", audience: "internal", authority: "normative", lifecycle: "active" },
      { documentId: "DOC-CORE-DEVELOPMENT-BASELINE", path: "docs/coordination/DEVELOPMENT_BASELINE.json", kind: "development-baseline", scope: "cross-repository", audience: "internal", authority: "normative", lifecycle: "active" },
      { documentId: "DOC-CORE-RELEASE-0-1", path: "docs/versions/0_1/release.json", kind: "release-composition", scope: "core", audience: "public", authority: "normative", lifecycle: "active" },
      { documentId: "DOC-CORE-RISK-REGISTER", path: "docs/coordination/RISK_REGISTER.md", kind: "risk-register", scope: "core", audience: "internal", authority: "normative", lifecycle: "active" },
      { documentId: "DOC-CORE-DOCUMENT-MAP", path: "docs/DOCUMENT_MAP.md", kind: "navigation", scope: "core", audience: "both", authority: "navigation", lifecycle: "active" },
      { documentId: "DOC-CORE-GLOSSARY-TECHNICAL", path: "docs/GLOSSARY.md", kind: "glossary", scope: "core", audience: "both", authority: "navigation", lifecycle: "active" },
      { documentId: "DOC-CORE-GLOSSARY-THAI", path: "docs/GLOSSARY_TH.md", kind: "glossary", scope: "core", audience: "both", authority: "navigation", lifecycle: "active" },
      { documentId: "DOC-VERSION-OVERVIEW", path: "docs/versions/0_1/VERSION_OVERVIEW.md", kind: "current-state", scope: "core", audience: "public", authority: "explanatory", lifecycle: "active" },
      { documentId: "DOC-VERSION-CAPABILITY-SET", path: "docs/versions/0_1/CAPABILITY_SET.md", kind: "current-state", scope: "core", audience: "public", authority: "explanatory", lifecycle: "active" },
    ],
  })
  write(root, "docs/glossary.json", {
    concepts: [{ conceptId: "CONCEPT-CORE-DOCUMENTATION" }],
    terms: [
      { termId: "TERM-CORE-CANONICAL-DOCUMENT", conceptId: "CONCEPT-CORE-DOCUMENTATION", lifecycle: "active", forms: [{ kind: "localized-label", value: "Canonical documentation" }] },
      { termId: "TERM-CORE-LEGACY-DOCUMENT", conceptId: "CONCEPT-CORE-DOCUMENTATION", lifecycle: "retired", forms: [{ kind: "historical-alias", value: "Legacy documentation" }] },
    ],
    retiredTermIds: ["TERM-CORE-LEGACY-DOCUMENT"],
  })
  write(root, "docs/coordination/REPOSITORY_INDEX.json", {
    contracts: [{ contractId: "CONTRACT-CORE-DOCUMENTATION" }],
    capabilities: [{ capabilityId: "CAP-CORE-DOCUMENTATION", maturity: "accepted", acceptedGateIds: ["GATE-CORE-DOCUMENTATION-001"] }],
    risks: ["RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001"],
    unknowns: ["UNKNOWN-CORE-DOCUMENTATION-001"],
    workItems: ["WORK-CORE-DOCUMENTATION-001"],
    decisions: ["DECISION-CORE-DOCUMENTATION-20260811-01"],
  })
  write(root, "docs/coordination/DEVELOPMENT_BASELINE.json", {
    baselineId: "BASELINE-FLOWDOC-20260811-01",
    eventId: "BASELINE-FLOWDOC-20260811-01",
    pinned: { repository: "flowdoc-vnext-core", branch: "main", commit: "0123456789abcdef0123456789abcdef01234567" },
    acceptedGateIds: ["GATE-CORE-DOCUMENTATION-001"],
    decisionIds: ["DECISION-CORE-DOCUMENTATION-20260811-01"],
  })
  write(root, "docs/versions/0_1/release.json", {
    releaseLine: "0.1",
    folderSlug: "0_1",
    baselineId: "BASELINE-FLOWDOC-20260811-01",
    composition: ["DOC-VERSION-OVERVIEW"],
    capabilityIds: ["CAP-CORE-DOCUMENTATION"],
  })
  write(root, "docs/coordination/RISK_REGISTER.md", `## RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001 — Dual canonical truth

<!-- FLOWDOC-RECORD
{"recordId":"RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001","recordKind":"risk","lifecycle":"active","affects":["DOC-CORE-NAVIGATION-MANIFEST"]}
-->

This risk remains actively owned.\n`)
  write(root, "docs/versions/0_1/VERSION_OVERVIEW.md", "# Version overview\n\nThe accepted capability is documented here.\n")
  for (const generatedPath of ["docs/DOCUMENT_MAP.md", "docs/GLOSSARY.md", "docs/GLOSSARY_TH.md", "docs/versions/0_1/CAPABILITY_SET.md"]) write(root, generatedPath, "stale generated output\n")
  return root
}

function runCli(root: string, script: string, ...args: string[]) {
  return spawnSync(process.execPath, [script, "--root", root, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
  })
}

function runCliFromRoot(root: string, script: string, ...args: string[]) {
  return spawnSync(process.execPath, [join(process.cwd(), script), ...args], {
    cwd: root,
    encoding: "utf8",
  })
}

function generated(root: string): Record<string, string> {
  return Object.fromEntries([
    "docs/DOCUMENT_MAP.md",
    "docs/GLOSSARY.md",
    "docs/GLOSSARY_TH.md",
    "docs/versions/0_1/VERSION_OVERVIEW.md",
    "docs/versions/0_1/CAPABILITY_SET.md",
  ].map((path) => [path, readFileSync(join(root, path), "utf8")]))
}

function rewriteJson(root: string, relativePath: string, mutate: (value: any) => void): void {
  const value = JSON.parse(readFileSync(join(root, relativePath), "utf8"))
  mutate(value)
  write(root, relativePath, value)
}

describe("canonical documentation spine", () => {
  test("loads a complete bounded canonical model from a real directory", () => {
    const model = loadCanonicalDocumentationModel(fixture())
    expect(validateCanonicalDocumentationModel(model)).toBe(model)
    expect(model.documents.map((document: { documentId: string }) => document.documentId)).toContain("DOC-CORE-GLOSSARY")
  })

  test("rejects duplicate DOC identities", () => {
    const root = fixture()
    rewriteJson(root, "docs/manifest.json", (manifest) => manifest.documents.push({ ...manifest.documents[0], path: "docs/coordination/DUPLICATE.md" }))
    write(root, "docs/coordination/DUPLICATE.md", "# Duplicate\n")
    expect(() => loadCanonicalDocumentationModel(root)).toThrow(/duplicate.*DOC/i)
  })

  test("rejects duplicate TERM identities", () => {
    const root = fixture()
    rewriteJson(root, "docs/glossary.json", (glossary) => glossary.terms.push({ ...glossary.terms[0], forms: [{ kind: "localized-label", value: "Other" }] }))
    expect(() => loadCanonicalDocumentationModel(root)).toThrow(/duplicate.*TERM/i)
  })

  test("rejects a record whose ID prefix disagrees with its kind", () => {
    const root = fixture()
    write(root, "docs/coordination/RISK_REGISTER.md", `## CAP-CORE-DOCUMENTATION-001 — Incorrect prefix

<!-- FLOWDOC-RECORD
{"recordId":"CAP-CORE-DOCUMENTATION-001","recordKind":"risk","lifecycle":"active","affects":["DOC-CORE-NAVIGATION-MANIFEST"]}
-->
`)
    expect(() => loadCanonicalDocumentationModel(root)).toThrow(/prefix.*risk/i)
  })

  test("accepts roadmap records with their required WORK identity prefix", () => {
    expect(collectEmbeddedCanonicalRecords(`## WORK-CORE-DOCUMENTATION-001 — Documentation roadmap item

<!-- FLOWDOC-RECORD
{"recordId":"WORK-CORE-DOCUMENTATION-001","recordKind":"roadmap","lifecycle":"active","affects":[]}
-->`)).toEqual([
      { recordId: "WORK-CORE-DOCUMENTATION-001", recordKind: "roadmap", lifecycle: "active", affects: [] },
    ])
  })

  test("rejects a manifest path that is not present on disk", () => {
    const root = fixture()
    rewriteJson(root, "docs/manifest.json", (manifest) => { manifest.documents[5].path = "docs/coordination/MISSING.md" })
    expect(() => loadCanonicalDocumentationModel(root)).toThrow(/registered path.*missing/i)
  })

  test("rejects an unregistered canonical file under a declared root", () => {
    const root = fixture()
    write(root, "docs/coordination/UNREGISTERED.md", "# Unregistered\n")
    expect(() => loadCanonicalDocumentationModel(root)).toThrow(/canonical.*manifest/i)
  })

  test("rejects every unresolved canonical reference kind", () => {
    for (const reference of ["DOC-MISSING", "CONTRACT-MISSING", "CAP-MISSING", "RISK-MISSING", "UNKNOWN-MISSING", "GATE-MISSING", "TERM-MISSING", "CONCEPT-MISSING", "WORK-MISSING", "BASELINE-MISSING", "DECISION-MISSING"]) {
      const root = fixture()
      write(root, "docs/coordination/RISK_REGISTER.md", `## RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001 — Dual canonical truth

<!-- FLOWDOC-RECORD
{"recordId":"RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001","recordKind":"risk","lifecycle":"active","affects":["${reference}"]}
-->
`)
      expect(() => loadCanonicalDocumentationModel(root), reference).toThrow(new RegExp(`unresolved.*${reference}`, "i"))
    }
  })

  test("rejects a release line whose folder slug is not its canonical slug", () => {
    const root = fixture()
    rewriteJson(root, "docs/versions/0_1/release.json", (release) => { release.folderSlug = "0-1" })
    expect(() => loadCanonicalDocumentationModel(root)).toThrow(/folderSlug.*0_1/i)
  })

  test("rejects release composition outside its selected version folder", () => {
    const root = fixture()
    write(root, "docs/versions/0_2/OTHER.md", "# Other release\n")
    rewriteJson(root, "docs/manifest.json", (manifest) => manifest.documents.push({ documentId: "DOC-VERSION-OTHER", path: "docs/versions/0_2/OTHER.md", kind: "current-state", scope: "core", audience: "public", authority: "explanatory", lifecycle: "active" }))
    rewriteJson(root, "docs/versions/0_1/release.json", (release) => { release.composition = ["DOC-VERSION-OTHER"] })
    expect(() => loadCanonicalDocumentationModel(root)).toThrow(/composition.*versions\/0_1/i)
  })

  test("rejects accepted capability without an accepted selected-baseline gate", () => {
    const root = fixture()
    rewriteJson(root, "docs/coordination/DEVELOPMENT_BASELINE.json", (baseline) => { baseline.acceptedGateIds = [] })
    expect(() => loadCanonicalDocumentationModel(root)).toThrow(/accepted gate/i)
  })

  test("rejects an unselected accepted capability without a selected-baseline gate", () => {
    const root = fixture()
    rewriteJson(root, "docs/coordination/REPOSITORY_INDEX.json", (index) => index.capabilities.push({ capabilityId: "CAP-CORE-UNSELECTED", maturity: "accepted", acceptedGateIds: ["GATE-CORE-UNSELECTED-001"] }))
    expect(() => loadCanonicalDocumentationModel(root)).toThrow(/CAP-CORE-UNSELECTED.*accepted gate/i)
  })

  test("rejects a repository-index decision without the complete decision event shape", () => {
    const root = fixture()
    rewriteJson(root, "docs/coordination/REPOSITORY_INDEX.json", (index) => { index.decisions = ["DECISION-CORE-INCOMPLETE"] })
    expect(() => loadCanonicalDocumentationModel(root)).toThrow(/DECISION-<SCOPE>-<SUBSYSTEM>-YYYYMMDD-NN/i)
  })

  test("rejects a changed pinned tuple for the same development baseline", () => {
    const previous = { baselineId: "BASELINE-FLOWDOC-20260811-01", pinned: { repository: "flowdoc-vnext-core", branch: "main", commit: "0123456789abcdef0123456789abcdef01234567" } }
    const next = { baselineId: "BASELINE-FLOWDOC-20260811-01", pinned: { repository: "flowdoc-vnext-core", branch: "main", commit: "abcdef0123456789abcdef0123456789abcdef01" } }
    expect(() => validateDevelopmentBaselineEvolution(previous, next)).toThrow(/pinned tuple/i)
  })

  test("rejects ambiguous aliases in normative Markdown", () => {
    const root = fixture()
    rewriteJson(root, "docs/glossary.json", (glossary) => glossary.terms[0].forms.push({ kind: "ambiguous-alias", value: "FlowDoc" }))
    write(root, "docs/coordination/RISK_REGISTER.md", `## RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001 — Dual canonical truth

<!-- FLOWDOC-RECORD
{"recordId":"RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001","recordKind":"risk","lifecycle":"active","affects":["DOC-CORE-NAVIGATION-MANIFEST"]}
-->

FlowDoc is deliberately ambiguous.\n`)
    expect(() => loadCanonicalDocumentationModel(root)).toThrow(/ambiguous alias.*normative/i)
  })

  test("rejects deletion of a retired term identity rather than its tombstone", () => {
    const root = fixture()
    rewriteJson(root, "docs/glossary.json", (glossary) => { glossary.terms = [glossary.terms[0]] })
    expect(() => loadCanonicalDocumentationModel(root)).toThrow(/retired.*tombstone/i)
  })

  test("resolves an earlier embedded record reference to a later manifest document", () => {
    const root = fixture()
    write(root, "docs/coordination/LATER_RISK.md", `## RISK-CORE-LATER-001 — Later risk

<!-- FLOWDOC-RECORD
{"recordId":"RISK-CORE-LATER-001","recordKind":"risk","lifecycle":"active","affects":[]}
-->
`)
    rewriteJson(root, "docs/manifest.json", (manifest) => manifest.documents.push({ documentId: "DOC-CORE-LATER-RISK", path: "docs/coordination/LATER_RISK.md", kind: "risk-register", scope: "core", audience: "internal", authority: "normative", lifecycle: "active" }))
    write(root, "docs/coordination/RISK_REGISTER.md", `## RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001 — Dual canonical truth

<!-- FLOWDOC-RECORD
{"recordId":"RISK-CORE-DOCUMENTATION-DUAL-TRUTH-001","recordKind":"risk","lifecycle":"active","affects":["RISK-CORE-LATER-001"]}
-->
`)
    expect(() => loadCanonicalDocumentationModel(root)).not.toThrow()
  })

  test("parses only heading-bound FLOWDOC records and rejects malformed record metadata", () => {
    expect(collectEmbeddedCanonicalRecords(`## RISK-CORE-TEST-001 — Test\n\n<!-- FLOWDOC-RECORD\n{"recordId":"RISK-CORE-TEST-001","recordKind":"risk","lifecycle":"active","affects":[]}\n-->`)).toEqual([
      { recordId: "RISK-CORE-TEST-001", recordKind: "risk", lifecycle: "active", affects: [] },
    ])
    expect(() => collectEmbeddedCanonicalRecords("<!-- FLOWDOC-RECORD\n{\"recordId\":\"RISK-CORE-TEST-001\",\"recordKind\":\"risk\",\"lifecycle\":\"active\",\"affects\":[]}\n-->"))
      .toThrow(/matching heading/i)
    expect(() => collectEmbeddedCanonicalRecords(`## RISK-CORE-TEST-001 — Test\n\n<!-- FLOWDOC-RECORD\n{"recordId":"RISK-CORE-TEST-001","recordKind":"risk","lifecycle":"active","affects":[],"unknown":true}\n-->`))
      .toThrow(/unknown.*metadata/i)
  })

  test("rejects duplicate embedded records and prose that contradicts required record metadata", () => {
    const record = `## RISK-CORE-TEST-001 — Test\n\n<!-- FLOWDOC-RECORD\n{"recordId":"RISK-CORE-TEST-001","recordKind":"risk","lifecycle":"active","affects":[]}\n-->`
    expect(() => collectEmbeddedCanonicalRecords(`${record}\n\n${record}`)).toThrow(/duplicate.*record/i)
    expect(() => collectEmbeddedCanonicalRecords(`${record}\n\nLifecycle: retired\n`)).toThrow(/contradicts.*lifecycle/i)
  })

  test("collects canonical references without confusing prose punctuation for IDs", () => {
    expect(collectCanonicalReferences("See DOC-CORE-ONE, TERM-CORE-TWO; and DECISION-CORE-DOCS-20260811-01.")).toEqual([
      "DOC-CORE-ONE",
      "TERM-CORE-TWO",
      "DECISION-CORE-DOCS-20260811-01",
    ])
  })

  test("generates byte-identical approved views with the generated header", () => {
    const root = fixture()
    const first = runCli(root, "scripts/generate-canonical-docs.mjs")
    expect(first.status, first.stderr).toBe(0)
    const initial = generated(root)
    const second = runCli(root, "scripts/generate-canonical-docs.mjs")
    expect(second.status, second.stderr).toBe(0)
    expect(generated(root)).toEqual(initial)
    for (const output of Object.values(initial)) expect(output.startsWith(GENERATED_HEADER)).toBe(true)
  })

  test("uses the current directory when a root option is omitted", () => {
    const root = fixture()
    const generate = runCliFromRoot(root, "scripts/generate-canonical-docs.mjs")
    expect(generate.status, generate.stderr).toBe(0)
    const check = runCliFromRoot(root, "scripts/check-canonical-docs.mjs")
    expect(check.status, check.stderr).toBe(0)
  })

  test("checks generated drift in memory without rewriting it", () => {
    const root = fixture()
    expect(runCli(root, "scripts/generate-canonical-docs.mjs").status).toBe(0)
    writeFileSync(join(root, "docs/GLOSSARY.md"), `${GENERATED_HEADER}edited byte\n`, "utf8")
    const check = runCli(root, "scripts/check-canonical-docs.mjs")
    expect(check.status).not.toBe(0)
    expect(check.stderr).toMatch(/drift.*GLOSSARY/i)
    expect(readFileSync(join(root, "docs/GLOSSARY.md"), "utf8")).toBe(`${GENERATED_HEADER}edited byte\n`)
  })

  test("generation changes no authored canonical path", () => {
    const root = fixture()
    const authored = join(root, "docs/coordination/RISK_REGISTER.md")
    const before = readFileSync(authored, "utf8")
    expect(runCli(root, "scripts/generate-canonical-docs.mjs").status).toBe(0)
    expect(readFileSync(authored, "utf8")).toBe(before)
  })

  test("generation fails when structured canonical input is missing or invalid", () => {
    const missing = fixture()
    rmSync(join(missing, "docs/glossary.json"))
    expect(runCli(missing, "scripts/generate-canonical-docs.mjs").status).not.toBe(0)
    const invalid = fixture()
    writeFileSync(join(invalid, "docs/glossary.json"), "{invalid", "utf8")
    expect(runCli(invalid, "scripts/generate-canonical-docs.mjs").status).not.toBe(0)
  })

  test("renders bilingual glossaries with identical sorted Term IDs", () => {
    const outputs = renderGeneratedFiles(loadCanonicalDocumentationModel(fixture()))
    const ids = (output: string) => [...output.matchAll(/^- `(TERM-[A-Z0-9-]+)`/gm)].map((match) => match[1])
    expect(ids(outputs["docs/GLOSSARY.md"])).toEqual([
      "TERM-CORE-CANONICAL-DOCUMENT",
      "TERM-CORE-LEGACY-DOCUMENT",
    ])
    expect(ids(outputs["docs/GLOSSARY_TH.md"])).toEqual(ids(outputs["docs/GLOSSARY.md"]))
  })

  test("sorts document-map links by stable ID within the required groups", () => {
    const root = fixture()
    rewriteJson(root, "docs/manifest.json", (manifest) => { manifest.documents.reverse() })
    const map = renderGeneratedFiles(loadCanonicalDocumentationModel(root))["docs/DOCUMENT_MAP.md"]
    expect(map).toMatch(/## Coordination[\s\S]*DOC-CORE-DEVELOPMENT-BASELINE[\s\S]*DOC-CORE-REPOSITORY-INDEX[\s\S]*DOC-CORE-RISK-REGISTER/)
    expect(map.indexOf("## Active current truth")).toBeLessThan(map.indexOf("## Coordination"))
    expect(map.indexOf("## Coordination")).toBeLessThan(map.indexOf("## Version line"))
    expect(map.indexOf("## Version line")).toBeLessThan(map.indexOf("## Glossary"))
  })

  test("allows only the release-referenced pending baseline identifier", () => {
    const root = fixture()
    expect(runCli(root, "scripts/generate-canonical-docs.mjs").status).toBe(0)
    expect(runCli(root, "scripts/check-canonical-docs.mjs", "--allow-pending-baseline", "BASELINE-FLOWDOC-20260811-01").status).toBe(0)
    const invalid = runCli(root, "scripts/check-canonical-docs.mjs", "--allow-pending-baseline", "BASELINE-FLOWDOC-20260811-99")
    expect(invalid.status).not.toBe(0)
    expect(invalid.stderr).toMatch(/exactly match release baseline/i)
  })

  test("renders a pending baseline as an explicit non-release-ready view", () => {
    const root = fixture()
    const check = runCli(root, "scripts/check-canonical-docs.mjs", "--allow-pending-baseline", "BASELINE-FLOWDOC-20260811-01")
    expect(check.status).not.toBe(0)
    expect(runCli(root, "scripts/generate-canonical-docs.mjs").status).toBe(0)
    const overview = readFileSync(join(root, "docs/versions/0_1/VERSION_OVERVIEW.md"), "utf8")
    expect(overview).toContain("releaseVersion: unversioned")
    expect(overview).toContain("releaseReady: false")
    expect(overview).toContain("compatibility: not-verified")
    expect(overview).toMatch(/not published.*not release-ready/i)
  })
})
