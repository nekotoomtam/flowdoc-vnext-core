import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  assessVNextKeyDataDiagnostics,
  collectVNextDocumentFieldRefUsages,
  type DataSnapshot,
  type DocumentNode,
  type FieldRegistry,
  parseFlowDocPackageV2DocumentVNext,
} from "../src/index.js"

function fixturePackage(name: string) {
  const fixtureUrl = new URL(`../fixtures/${name}`, import.meta.url)
  return parseFlowDocPackageV2DocumentVNext(JSON.parse(readFileSync(fixtureUrl, "utf8")) as unknown)
}

function diagnosticDocument(): DocumentNode {
  return {
    version: 3,
    document: {
      id: "diagnostic-doc",
      meta: { title: "Diagnostic Doc" },
      sections: [
        {
          id: "section-main",
          type: "section",
          page: {
            size: "A4",
            orientation: "portrait",
            margin: {
              top: { value: 72, unit: "pt" },
              right: { value: 72, unit: "pt" },
              bottom: { value: 72, unit: "pt" },
              left: { value: 72, unit: "pt" },
            },
          },
          zoneIds: ["body-zone"],
          nodes: {
            "body-zone": {
              id: "body-zone",
              type: "zone",
              role: "body",
              childIds: ["intro", "metrics-table"],
            },
            intro: {
              id: "intro",
              type: "text-block",
              role: { role: "paragraph" },
              props: {},
              children: [
                { id: "intro-a", type: "text", text: "Customer " },
                { id: "intro-customer", type: "field-ref", key: "customer.name", fallback: "Customer" },
              ],
            },
            "metrics-table": {
              id: "metrics-table",
              type: "table",
              props: {},
              columns: [{ width: { value: 120, unit: "pt" } }],
              rowIds: ["metrics-row"],
            },
            "metrics-row": {
              id: "metrics-row",
              type: "table-row",
              props: {},
              cellIds: ["metrics-cell"],
            },
            "metrics-cell": {
              id: "metrics-cell",
              type: "table-cell",
              props: {},
              childIds: ["metrics-value"],
            },
            "metrics-value": {
              id: "metrics-value",
              type: "text-block",
              role: { role: "paragraph" },
              props: {},
              children: [
                { id: "metrics-value-label", type: "text", text: "Total " },
                { id: "metrics-value-field", type: "field-ref", key: "report.total", fallback: "0" },
              ],
            },
          },
        },
      ],
    },
  }
}

function registry(fields: FieldRegistry["fields"]): FieldRegistry {
  return { version: 1, fields }
}

describe("vNext key/data diagnostics", () => {
  it("collects field-ref usages with table-cell context from canonical documents", () => {
    const pack = fixturePackage("product-report-vnext.flowdoc.json")
    const diagnostics = assessVNextKeyDataDiagnostics(pack.document, pack.fields, pack.data)

    expect(diagnostics).toMatchObject({
      source: "vnext-key-data-diagnostics",
      status: "ready",
      summary: {
        errorCount: 0,
        warningCount: 0,
        dataProvided: true,
      },
    })

    const tableUsage = diagnostics.usages.find((usage) => usage.fieldRefId === "metric-value-total-field")
    expect(tableUsage).toMatchObject({
      key: "report.total",
      textBlockId: "metric-value-total-text",
      sectionId: "section-body",
      zoneId: "body-main",
      tableId: "body-metrics-table",
      tableRowId: "metrics-data-row",
      tableCellId: "metric-value-total",
    })
  })

  it("reports missing registry definitions as warnings without mutating authored field refs", () => {
    const doc = diagnosticDocument()
    const before = JSON.stringify(doc)
    const diagnostics = assessVNextKeyDataDiagnostics(doc, registry({
      "customer.name": {
        key: "customer.name",
        label: "Customer Name",
        type: "text",
      },
    }))

    expect(diagnostics.status).toBe("ready-with-warnings")
    expect(diagnostics.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        severity: "warning",
        code: "missing-field-definition",
        key: "report.total",
        fieldRefId: "metrics-value-field",
        tableId: "metrics-table",
        tableCellId: "metrics-cell",
      }),
    ]))
    expect(JSON.stringify(doc)).toBe(before)
  })

  it("blocks non-inline field references and inconsistent registry keys", () => {
    const doc = diagnosticDocument()
    const diagnostics = assessVNextKeyDataDiagnostics(doc, registry({
      "customer.name": {
        key: "customer.name",
        label: "Customer Name",
        type: "text",
      },
      "report.total": {
        key: "report.total",
        label: "Report Total",
        type: "collection",
      },
      "alias.total": {
        key: "report.total",
        label: "Duplicate Total",
        type: "number",
      },
      "bad.record": {
        key: "bad.inner",
        label: "Bad Inner Key",
        type: "text",
      },
    }))

    expect(diagnostics.status).toBe("blocked")
    expect(diagnostics.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        severity: "error",
        code: "non-inline-field-ref",
        key: "report.total",
        fieldRefId: "metrics-value-field",
      }),
      expect.objectContaining({
        severity: "error",
        code: "duplicate-field-key",
        key: "report.total",
      }),
      expect.objectContaining({
        severity: "error",
        code: "field-key-mismatch",
        key: "bad.inner",
      }),
    ]))
  })

  it("validates scalar data snapshots separately from authored template state", () => {
    const doc = diagnosticDocument()
    const fields = registry({
      "customer.name": {
        key: "customer.name",
        label: "Customer Name",
        type: "text",
      },
      "report.total": {
        key: "report.total",
        label: "Report Total",
        type: "number",
      },
      "customer.logo": {
        key: "customer.logo",
        label: "Customer Logo",
        type: "image",
      },
    })
    const data: DataSnapshot = {
      version: 1,
      values: {
        "customer.name": 123,
        "report.total": "42",
        "customer.logo": "logo-id",
        "extra.key": "unused",
      },
    }

    const diagnostics = assessVNextKeyDataDiagnostics(doc, fields, data)

    expect(diagnostics.status).toBe("blocked")
    expect(diagnostics.summary).toMatchObject({
      dataProvided: true,
      dataKeyCount: 4,
      errorCount: 3,
      warningCount: 1,
    })
    expect(diagnostics.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        severity: "error",
        code: "invalid-data-value-type",
        key: "customer.name",
      }),
      expect.objectContaining({
        severity: "error",
        code: "invalid-data-value-type",
        key: "report.total",
      }),
      expect.objectContaining({
        severity: "error",
        code: "unsupported-data-field-type",
        key: "customer.logo",
      }),
      expect.objectContaining({
        severity: "warning",
        code: "unknown-data-key",
        key: "extra.key",
      }),
    ]))
  })

  it("exposes a field-ref usage collector for authoring surfaces", () => {
    const usages = collectVNextDocumentFieldRefUsages(diagnosticDocument())

    expect(usages.map((usage) => usage.fieldRefId)).toEqual([
      "intro-customer",
      "metrics-value-field",
    ])
  })
})
