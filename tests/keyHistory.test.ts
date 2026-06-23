import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  createVNextKeyHistoryMigrationPlan,
  parseFlowDocPackageV2DocumentVNext,
  VNEXT_KEY_HISTORY_MODE,
  VNEXT_KEY_HISTORY_SOURCE,
} from "../src/index.js"

function fixturePackage(name: string) {
  const fixtureUrl = new URL(`../fixtures/${name}`, import.meta.url)
  return parseFlowDocPackageV2DocumentVNext(JSON.parse(readFileSync(fixtureUrl, "utf8")) as unknown)
}

describe("vNext key history migration boundary", () => {
  it("plans a key rename without mutating document, registry, or data truth", () => {
    const pack = fixturePackage("product-report-vnext-minimal.flowdoc.json")
    const beforeDocument = JSON.stringify(pack.document)
    const beforeRegistry = JSON.stringify(pack.fields)
    const beforeData = JSON.stringify(pack.data)

    const plan = createVNextKeyHistoryMigrationPlan({
      document: pack.document,
      registry: pack.fields,
      data: pack.data,
      intents: [{
        kind: "field-key.rename",
        fromKey: "customer.name",
        toKey: "customer.fullName",
        reason: "customer schema rename",
      }],
    })

    expect(plan).toMatchObject({
      source: VNEXT_KEY_HISTORY_SOURCE,
      mode: VNEXT_KEY_HISTORY_MODE,
      status: "ready",
      application: {
        status: "not-applied",
        registryMutation: "not-run",
        documentFieldRefMutation: "not-run",
        dataMigration: "not-run",
        historyWrite: "not-written",
        packageVersionChange: false,
      },
      summary: {
        intentCount: 1,
        plannedEventCount: 1,
        blockedEventCount: 0,
        affectedFieldRefCount: 1,
        affectedDataKeyCount: 1,
        registryFieldCount: 2,
        issueCount: 0,
      },
      events: [{
        kind: "field-key.rename",
        status: "planned",
        reason: "customer schema rename",
        key: "customer.name",
        fromKey: "customer.name",
        toKey: "customer.fullName",
        fromType: "text",
        toType: "text",
        affectedFieldRefCount: 1,
        affectedFieldRefIds: ["title-customer"],
        affectedDataKey: true,
        registryMutation: "not-applied",
        documentFieldRefMutation: "not-applied",
        dataMigration: "not-applied",
        historyWrite: "not-written",
        externalCompatibility: "not-checked",
      }],
      issues: [],
    })
    expect(plan.usages).toEqual(expect.arrayContaining([
      expect.objectContaining({ fieldRefId: "title-customer", key: "customer.name" }),
    ]))
    expect(JSON.stringify(pack.document)).toBe(beforeDocument)
    expect(JSON.stringify(pack.fields)).toBe(beforeRegistry)
    expect(JSON.stringify(pack.data)).toBe(beforeData)
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan)
  })

  it("blocks colliding renames and non-inline type changes before package mutation", () => {
    const pack = fixturePackage("product-report-vnext-minimal.flowdoc.json")
    const plan = createVNextKeyHistoryMigrationPlan({
      document: pack.document,
      registry: pack.fields,
      data: pack.data,
      intents: [
        {
          kind: "field-key.rename",
          fromKey: "customer.name",
          toKey: "report.total",
        },
        {
          kind: "field-type.change",
          key: "report.total",
          toType: "collection",
        },
      ],
    })

    expect(plan.status).toBe("blocked")
    expect(plan.summary).toMatchObject({
      intentCount: 2,
      plannedEventCount: 0,
      blockedEventCount: 2,
      affectedFieldRefCount: 2,
      affectedDataKeyCount: 2,
      issueCount: 2,
    })
    expect(plan.events.map((event) => event.status)).toEqual(["blocked", "blocked"])
    expect(plan.events[1]).toMatchObject({
      kind: "field-type.change",
      key: "report.total",
      fromType: "number",
      toType: "collection",
      affectedFieldRefIds: ["summary-right-total"],
      dataMigration: "not-applied",
      historyWrite: "not-written",
    })
    expect(plan.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: "target-key-exists",
        fromKey: "customer.name",
        toKey: "report.total",
        path: "intents[0].toKey",
      }),
      expect.objectContaining({
        code: "non-inline-type-breaks-field-refs",
        key: "report.total",
        path: "intents[1].toType",
      }),
    ]))
    expect(plan.application.status).toBe("not-applied")
  })

  it("keeps the key history boundary independent from storage, DOM, routes, layout, and schema migration", () => {
    const sourceUrl = new URL("../src/binding/keyHistory.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")

    expect(source).toContain("collectVNextDocumentFieldRefUsages")
    expect(source).toContain('registryMutation: "not-run"')
    expect(source).toContain('packageVersionChange: false')
    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(source).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("localStorage")
    expect(source).not.toContain("sessionStorage")
    expect(source).not.toContain("indexedDB")
    expect(source).not.toMatch(/\bdocument\.(querySelector|createElement|body|addEventListener)/)
    expect(source).not.toContain("HTMLElement")
    expect(source).not.toContain("window.")
    expect(source).not.toContain("/api/")
    expect(source).not.toContain("runVNextTextTransaction")
    expect(source).not.toContain("runVNextOperation")
    expect(source).not.toContain("parseFlowDocPackage")
    expect(source).not.toContain("serializeFlowDocPackage")
    expect(source).not.toContain("runVNextLayoutPipeline")
    expect(source).not.toContain("paginateVNextDocument")
  })

  it("documents the key history migration boundary in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/KEY_HISTORY_MIGRATION_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 89 implementation boundary.")
    expect(boundaryDoc).toContain("src/binding/keyHistory.ts")
    expect(boundaryDoc).toContain("This is a key history migration boundary.")
    expect(boundaryDoc).toContain("It is not a key migration executor.")
    expect(boundaryDoc).toContain("packageVersionChange = `false`")
    expect(readme).toContain("Key history migration boundary")
    expect(readme).toContain("docs/KEY_HISTORY_MIGRATION_BOUNDARY.md")
    expect(ledger).toContain("| 89 | Key history / migration boundary | done |")
    expect(roadmap).toContain("## Phase 89: Key History / Migration Boundary")
  })
})
