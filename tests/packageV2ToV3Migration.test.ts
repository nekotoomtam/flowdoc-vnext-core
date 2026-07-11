import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  applyVNextPackageV2ToV3Migration,
  parseFlowDocPackageV2DocumentVNext,
  planVNextPackageV2ToV3Migration,
  safeParseFlowDocPackageV3DocumentV4,
  type FlowDocPackageV2DocumentVNext,
  type VNextPackageV2ToV3MigrationPlan,
} from "../src/index.js"

function rawFixture(): Record<string, unknown> {
  const raw = readFileSync(new URL("../fixtures/product-report-vnext-minimal.flowdoc.json", import.meta.url), "utf8")
  return JSON.parse(raw) as Record<string, unknown>
}

function expectedTargetFixture(): Record<string, unknown> {
  const raw = readFileSync(
    new URL("../fixtures/product-report-v4-migrated-minimal.flowdoc.json", import.meta.url),
    "utf8",
  )
  return JSON.parse(raw) as Record<string, unknown>
}

function sourceFixture(): FlowDocPackageV2DocumentVNext {
  return parseFlowDocPackageV2DocumentVNext(rawFixture())
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function firstSection(pack: FlowDocPackageV2DocumentVNext) {
  return pack.document.document.sections[0]
}

function titleText(pack: FlowDocPackageV2DocumentVNext) {
  const node = firstSection(pack).nodes.title
  if (node.type !== "text-block") throw new Error("title text-block missing")
  return node
}

describe("Package v2/document v3 to package v3/document v4 migration", () => {
  it("plans and applies a strict source-immutable copy-forward migration", () => {
    const raw = rawFixture()
    const sourceBefore = JSON.stringify(raw)
    const plan = planVNextPackageV2ToV3Migration(raw)

    expect(plan).toMatchObject({
      status: "ready",
      sourcePackageVersion: 2,
      sourceDocumentVersion: 3,
      targetPackageVersion: 3,
      targetDocumentVersion: 4,
      issues: [],
      contracts: {
        deterministicIds: true,
        explicitCopyForward: true,
        sourceMutation: false,
        storageWrites: false,
        targetParserRequired: true,
      },
      targetCandidate: {
        packageVersion: 3,
        document: { version: 4 },
        assets: { version: 1, images: {} },
        data: { version: 2 },
      },
    })
    expect(plan.changes.map((item) => item.kind)).toEqual([
      "package-version",
      "document-version",
      "add-empty-image-registry",
      "data-version",
    ])
    expect(plan.targetCandidate).toEqual(expectedTargetFixture())

    const applied = applyVNextPackageV2ToV3Migration(plan)
    expect(applied.status).toBe("applied")
    expect(applied.package).toEqual(plan.targetCandidate)
    expect(applied.package && safeParseFlowDocPackageV3DocumentV4(applied.package).ok).toBe(true)
    expect(JSON.stringify(raw)).toBe(sourceBefore)
  })

  it("normalizes empty text and raw line breaks with deterministic inline ids", () => {
    const source = sourceFixture()
    const title = titleText(source)
    title.children.unshift({ id: "empty", type: "text", text: "" })
    title.children.push({ id: "multiline", type: "text", text: "alpha\r\nbeta\ngamma" })
    const sourceBefore = JSON.stringify(source)

    const first = planVNextPackageV2ToV3Migration(source)
    const second = planVNextPackageV2ToV3Migration(source)

    expect(first).toEqual(second)
    expect(first.status).toBe("ready")
    expect(first.summary).toMatchObject({
      normalizedTextBlockCount: 1,
      textNormalizationCount: 2,
      errorCount: 0,
      warningCount: 2,
    })
    expect(first.changes).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: "remove-empty-text", sourceInlineId: "empty" }),
      expect.objectContaining({
        kind: "split-raw-line-break",
        sourceInlineId: "multiline",
        producedInlineIds: [
          "multiline",
          "multiline-break-1",
          "multiline-after-1",
          "multiline-break-2",
          "multiline-after-2",
        ],
      }),
    ]))
    expect(JSON.stringify(source)).toBe(sourceBefore)
  })

  it("blocks page breaks outside direct body flow without moving or deleting them", () => {
    const source = sourceFixture()
    const section = firstSection(source)
    section.nodes["column-break"] = { id: "column-break", type: "page-break", props: {} }
    const column = section.nodes["summary-left"]
    if (column.type !== "column") throw new Error("summary-left column missing")
    column.childIds.push("column-break")

    const plan = planVNextPackageV2ToV3Migration(source)

    expect(plan.status).toBe("blocked")
    expect(plan.targetCandidate).toBeNull()
    expect(plan.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        source: "target-validation",
        code: "page-break-outside-body-zone",
        path: "document.document.sections[0].nodes.summary-left.childIds[1]",
      }),
    ]))
    expect(plan.changes.some((item) => item.message.includes("page-break"))).toBe(false)
  })

  it("blocks malformed table grids and non-positive widths instead of guessing repairs", () => {
    const gridSource = sourceFixture()
    const gridSection = firstSection(gridSource)
    const row = gridSection.nodes["detail-header-row"]
    if (row.type !== "table-row") throw new Error("detail row missing")
    gridSection.nodes["detail-cell-extra"] = {
      id: "detail-cell-extra",
      type: "table-cell",
      props: {},
      childIds: [],
    }
    row.cellIds.push("detail-cell-extra")

    const widthSource = sourceFixture()
    const widthTable = firstSection(widthSource).nodes["detail-table"]
    if (widthTable.type !== "table") throw new Error("detail table missing")
    widthTable.columns[0].width.value = 0

    const gridPlan = planVNextPackageV2ToV3Migration(gridSource)
    const widthPlan = planVNextPackageV2ToV3Migration(widthSource)

    expect(gridPlan).toMatchObject({ status: "blocked", targetCandidate: null })
    expect(gridPlan.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "invalid-table-grid" }),
    ]))
    expect(widthPlan).toMatchObject({ status: "blocked", targetCandidate: null })
    expect(widthPlan.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        source: "target-validation",
        path: "document.document.sections[0].nodes.detail-table.columns[0].width",
      }),
    ]))
  })

  it("blocks invalid columns and graph topology at the source audit boundary", () => {
    const source = sourceFixture()
    const column = firstSection(source).nodes["summary-right"]
    if (column.type !== "column") throw new Error("summary-right column missing")
    delete column.props.widthShare

    const plan = planVNextPackageV2ToV3Migration(source)

    expect(plan).toMatchObject({ status: "blocked", targetCandidate: null })
    expect(plan.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        source: "source-structure",
        code: "invalid-source-structure",
      }),
    ]))
  })

  it("blocks image and collection scalar data without inventing assets or collection semantics", () => {
    const imageSource = sourceFixture()
    imageSource.fields.fields.logo = { key: "logo", label: "Logo", type: "image" }
    if (!imageSource.data) throw new Error("fixture data missing")
    imageSource.data.values.logo = "legacy-image-path"

    const collectionSource = sourceFixture()
    collectionSource.fields.fields.items = { key: "items", label: "Items", type: "collection" }
    if (!collectionSource.data) throw new Error("fixture data missing")
    collectionSource.data.values.items = "legacy-collection"

    const imagePlan = planVNextPackageV2ToV3Migration(imageSource)
    const collectionPlan = planVNextPackageV2ToV3Migration(collectionSource)

    expect(imagePlan).toMatchObject({ status: "blocked", targetCandidate: null })
    expect(imagePlan.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "image-field-value-invalid", path: "data.values.logo" }),
    ]))
    expect(collectionPlan).toMatchObject({ status: "blocked", targetCandidate: null })
    expect(collectionPlan.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "unsupported-collection-data", path: "data.values.items" }),
    ]))
  })

  it("blocks unresolved text grammar and target field contract issues", () => {
    const source = sourceFixture()
    titleText(source).children.push({ id: "missing-ref", type: "field-ref", key: "missing.key" })
    source.fields.fields.logo = {
      key: "logo",
      label: "Logo",
      type: "image",
      fallback: "legacy-logo",
    }

    const plan = planVNextPackageV2ToV3Migration(source)

    expect(plan).toMatchObject({ status: "blocked", targetCandidate: null })
    expect(plan.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ source: "text-grammar", code: "missing-field-definition" }),
      expect.objectContaining({ source: "target-validation", path: "fields.fields.logo.fallback" }),
    ]))
  })

  it("blocks invalid source versions and revalidates a ready plan during apply", () => {
    const wrongVersion = rawFixture()
    wrongVersion.packageVersion = 3
    const invalidSourcePlan = planVNextPackageV2ToV3Migration(wrongVersion)
    expect(invalidSourcePlan).toMatchObject({
      status: "blocked",
      sourcePackageVersion: null,
      targetCandidate: null,
    })

    const readyPlan = planVNextPackageV2ToV3Migration(sourceFixture())
    if (readyPlan.targetCandidate == null) throw new Error("ready migration candidate missing")
    const forged = clone(readyPlan) as VNextPackageV2ToV3MigrationPlan
    if (forged.targetCandidate == null) throw new Error("cloned migration candidate missing")
    forged.targetCandidate.packageVersion = 2 as 3

    expect(applyVNextPackageV2ToV3Migration(forged)).toMatchObject({
      status: "blocked",
      package: null,
      issues: [expect.objectContaining({ source: "target-validation", path: "packageVersion" })],
    })
  })

  it("blocks source keys that the active parser would otherwise strip silently", () => {
    const source = rawFixture()
    source.prototypeOnly = true
    const document = source.document as Record<string, unknown>
    const documentValue = document.document as Record<string, unknown>
    documentValue.legacyOnly = { preservedNowhere: true }

    const plan = planVNextPackageV2ToV3Migration(source)

    expect(plan).toMatchObject({ status: "blocked", targetCandidate: null })
    expect(plan.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "unknown-source-key", path: "prototypeOnly" }),
      expect.objectContaining({ code: "unknown-source-key", path: "document.document.legacyOnly" }),
    ]))
  })

  it("publishes Phase 257 contract navigation and disposition evidence", () => {
    const doc = readFileSync(new URL("../docs/PACKAGE_V2_TO_V3_MIGRATION.md", import.meta.url), "utf8")
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8")
    const ledger = readFileSync(new URL("../docs/PHASE_LEDGER.md", import.meta.url), "utf8")

    for (const section of [
      "## Public Boundary",
      "## Migration Flow",
      "## Deterministic Changes",
      "## Blocked Dispositions",
      "## Unknown-Key Loss Guard",
      "## Fixture Pair",
      "## Ownership",
      "## PASS",
      "## FAIL / BLOCKER",
      "## RISK",
      "## UNKNOWN",
      "## Intentionally Not Changed",
      "## Next Recommended Direction",
    ]) {
      expect(doc).toContain(section)
    }
    expect(readme).toContain("docs/PACKAGE_V2_TO_V3_MIGRATION.md")
    expect(ledger).toContain("| 257 | Package v2/document v3 to package v3/document v4 migration | done |")
    expect(ledger).toContain("## Phase 257 Package V2 Document V3 To Package V3 Document V4 Migration")
  })
})
