import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterEach, describe, expect, test } from "vitest"

// @ts-ignore Task-owned executable Node model intentionally has no TypeScript declaration file.
import { collectCanonicalReferences, collectEmbeddedCanonicalRecords, loadCanonicalDocumentationModel, validateCanonicalDocumentationModel, validateDevelopmentBaselineEvolution } from "../scripts/documentation/canonical-docs-model.mjs"

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
      { documentId: "DOC-VERSION-OVERVIEW", path: "docs/versions/0_1/VERSION_OVERVIEW.md", kind: "current-state", scope: "core", audience: "public", authority: "explanatory", lifecycle: "active" },
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
  return root
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
})
