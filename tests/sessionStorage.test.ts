import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  createVNextEditableSession,
  createVNextSessionStorageRecord,
  serializeFlowDocPackageV2DocumentVNext,
  VNEXT_SESSION_STORAGE_MODE,
  VNEXT_SESSION_STORAGE_SOURCE,
} from "../src/index.js"

function fixtureValue(name: string): unknown {
  const fixtureUrl = new URL(`../fixtures/${name}`, import.meta.url)
  return JSON.parse(readFileSync(fixtureUrl, "utf8")) as unknown
}

describe("vNext session storage boundary", () => {
  it("creates a canonical package storage record without writing storage", () => {
    const session = createVNextEditableSession(
      fixtureValue("product-report-vnext-minimal.flowdoc.json"),
      { source: "fixture" },
    )
    const record = createVNextSessionStorageRecord(session, {
      storageKey: "template/product-report-vnext-minimal",
      reason: "save-template",
    })

    expect(record).toMatchObject({
      source: VNEXT_SESSION_STORAGE_SOURCE,
      mode: VNEXT_SESSION_STORAGE_MODE,
      manifest: {
        packageId: session.package.id,
        packageVersion: 2,
        documentVersion: 3,
        documentRevision: 0,
        dirtyScopeCount: 0,
        storageKey: "template/product-report-vnext-minimal",
        reason: "save-template",
        storageStatus: "not-written",
        persistedState: {
          package: true,
          selection: false,
          dirtyScopes: false,
          revisions: false,
          diagnostics: false,
          graph: false,
          viewport: false,
          liveLayout: false,
          exactLayout: false,
          authoringHistory: false,
        },
      },
    })
    expect(record.package).toEqual(serializeFlowDocPackageV2DocumentVNext(session.package))
    expect(record.package).not.toBe(session.package)
  })

  it("keeps session-only and runtime-only state outside the persisted package snapshot", () => {
    const session = createVNextEditableSession(fixtureValue("product-report-vnext-minimal.flowdoc.json"))
    const dirtySession = {
      ...session,
      selection: {
        kind: "node" as const,
        nodeId: "title",
        surface: "text-block" as const,
      },
      revisions: {
        ...session.revisions,
        document: 4,
        dirtyScopes: 2,
      },
      dirtyScopes: new Set(["text-block:title", "field:report.total"]),
    }

    const record = createVNextSessionStorageRecord(dirtySession)
    const packageJson = JSON.stringify(record.package)

    expect(record.manifest).toMatchObject({
      documentRevision: 4,
      dirtyScopeCount: 2,
      storageKey: null,
      reason: "session-save-boundary",
      storageStatus: "not-written",
    })
    expect(record.manifest.persistedState.selection).toBe(false)
    expect(record.manifest.persistedState.dirtyScopes).toBe(false)
    expect(record.manifest.persistedState.revisions).toBe(false)
    expect(record.manifest.persistedState.graph).toBe(false)
    expect(record.manifest.persistedState.liveLayout).toBe(false)
    expect(record.manifest.persistedState.exactLayout).toBe(false)
    expect(packageJson).not.toContain("vnext-editable-session")
    expect(packageJson).not.toContain('"selection"')
    expect(packageJson).not.toContain('"dirtyScopes"')
    expect(packageJson).not.toContain('"revisions"')
    expect(packageJson).not.toContain('"diagnostics"')
    expect(packageJson).not.toContain('"graph"')
    expect(packageJson).not.toContain('"viewport"')
    expect(packageJson).not.toContain('"liveLayout"')
    expect(packageJson).not.toContain('"exactLayout"')
    expect(packageJson).not.toContain('"authoringHistory"')
    expect(packageJson).not.toContain('"nodeId"')
  })

  it("keeps the storage boundary independent from adapters, parent runtime, DOM, and routes", () => {
    const sourceUrl = new URL("../src/authoring/sessionStorage.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")

    expect(source).toContain("serializeFlowDocPackageV2DocumentVNext")
    expect(source).toContain('storageStatus: "not-written"')
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
    expect(source).not.toContain("runVNextLayoutPipeline")
    expect(source).not.toContain("paginateVNextDocument")
  })

  it("documents the session storage boundary in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/SESSION_STORAGE_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 87 implementation boundary.")
    expect(boundaryDoc).toContain("src/authoring/sessionStorage.ts")
    expect(boundaryDoc).toContain("This is a session storage boundary.")
    expect(boundaryDoc).toContain("It is not a storage adapter.")
    expect(boundaryDoc).toContain("storageStatus = `not-written`")
    expect(readme).toContain("Session storage boundary")
    expect(readme).toContain("docs/SESSION_STORAGE_BOUNDARY.md")
    expect(ledger).toContain("| 87 | Session storage boundary | done |")
    expect(roadmap).toContain("## Phase 87: Session Storage Boundary")
  })
})
