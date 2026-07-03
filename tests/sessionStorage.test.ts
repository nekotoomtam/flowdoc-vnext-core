import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  createVNextEditableSession,
  createVNextSessionPackageSnapshot,
  serializeFlowDocPackageV2DocumentVNext,
  VNEXT_SESSION_PACKAGE_SNAPSHOT_MODE,
  VNEXT_SESSION_PACKAGE_SNAPSHOT_SOURCE,
} from "../src/index.js"

function fixtureValue(name: string): unknown {
  const fixtureUrl = new URL(`../fixtures/${name}`, import.meta.url)
  return JSON.parse(readFileSync(fixtureUrl, "utf8")) as unknown
}

describe("vNext session storage historical boundary", () => {
  it("now proves retained canonical package snapshot facts without storage ownership", () => {
    const session = createVNextEditableSession(
      fixtureValue("product-report-vnext-minimal.flowdoc.json"),
      { source: "fixture" },
    )
    const snapshot = createVNextSessionPackageSnapshot(session)

    expect(snapshot).toMatchObject({
      source: VNEXT_SESSION_PACKAGE_SNAPSHOT_SOURCE,
      mode: VNEXT_SESSION_PACKAGE_SNAPSHOT_MODE,
      facts: {
        packageId: session.package.id,
        packageVersion: 2,
        documentVersion: 3,
        documentRevision: 0,
        dirtyScopeCount: 0,
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
        contracts: {
          canonicalPackage: true,
          storageRecord: false,
          storageWrites: false,
          storageKey: false,
          routeDispatch: false,
          backendApi: false,
        },
      },
    })
    expect(snapshot.package).toEqual(serializeFlowDocPackageV2DocumentVNext(session.package))
    expect(snapshot.package).not.toBe(session.package)
    expect(Object.prototype.hasOwnProperty.call(snapshot, "storageKey")).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(snapshot.facts, "storageKey")).toBe(false)
    expect(JSON.stringify(snapshot)).not.toContain("storageStatus")
  })

  it("keeps session-only and runtime-only state outside retained package snapshot facts", () => {
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

    const snapshot = createVNextSessionPackageSnapshot(dirtySession)
    const packageJson = JSON.stringify(snapshot.package)

    expect(snapshot.facts).toMatchObject({
      documentRevision: 4,
      dirtyScopeCount: 2,
    })
    expect(snapshot.facts.contracts.storageRecord).toBe(false)
    expect(snapshot.facts.contracts.storageWrites).toBe(false)
    expect(snapshot.facts.contracts.routeDispatch).toBe(false)
    expect(snapshot.facts.persistedState.selection).toBe(false)
    expect(snapshot.facts.persistedState.dirtyScopes).toBe(false)
    expect(snapshot.facts.persistedState.revisions).toBe(false)
    expect(snapshot.facts.persistedState.graph).toBe(false)
    expect(snapshot.facts.persistedState.liveLayout).toBe(false)
    expect(snapshot.facts.persistedState.exactLayout).toBe(false)
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

  it("keeps the retained snapshot helper independent from adapters, parent runtime, DOM, and routes", () => {
    const sourceUrl = new URL("../src/authoring/sessionStorage.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")
    const snapshotStart = source.indexOf("export function createVNextSessionPackageSnapshot")
    const storageStart = source.indexOf("export function createVNextSessionStorageRecord")
    const snapshotSource = source.slice(snapshotStart, storageStart)

    expect(snapshotSource).toContain("serializeFlowDocPackageV2DocumentVNext")
    expect(snapshotSource).toContain("canonicalPackage: true")
    expect(snapshotSource).toContain("storageRecord: false")
    expect(snapshotSource).toContain("storageKey: false")
    expect(snapshotSource).not.toContain("storageStatus")
    expect(snapshotSource).not.toContain("reason")
    expect(snapshotSource).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(snapshotSource).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(snapshotSource).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(snapshotSource).not.toContain("fetch(")
    expect(snapshotSource).not.toContain("localStorage")
    expect(snapshotSource).not.toContain("sessionStorage")
    expect(snapshotSource).not.toContain("indexedDB")
    expect(snapshotSource).not.toMatch(/\bdocument\.(querySelector|createElement|body|addEventListener)/)
    expect(snapshotSource).not.toContain("HTMLElement")
    expect(snapshotSource).not.toContain("window.")
    expect(snapshotSource).not.toContain("/api/")
    expect(snapshotSource).not.toContain("runVNextLayoutPipeline")
    expect(snapshotSource).not.toContain("paginateVNextDocument")
  })

  it("documents the retained test rewrite beside the historical session storage boundary", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/SESSION_STORAGE_BOUNDARY.md")
    const retainedRewrite = readText("../docs/CORE_NON_ROUTE_RETAINED_TEST_REWRITE.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 87 implementation boundary.")
    expect(boundaryDoc).toContain("src/authoring/sessionStorage.ts")
    expect(boundaryDoc).toContain("This is a session storage boundary.")
    expect(boundaryDoc).toContain("It is not a storage adapter.")
    expect(boundaryDoc).toContain("storageStatus = `not-written`")
    expect(retainedRewrite).toContain("tests/sessionStorage.test.ts")
    expect(retainedRewrite).toContain("createVNextSessionPackageSnapshot(...)")
    expect(readme).toContain("Session storage boundary")
    expect(readme).toContain("Core Non-Route Retained-Test Rewrite")
    expect(readme).toContain("docs/SESSION_STORAGE_BOUNDARY.md")
    expect(ledger).toContain("| 87 | Session storage boundary | done |")
    expect(ledger).toContain("| 238 | Core non-route retained-test rewrite | done |")
    expect(roadmap).toContain("## Phase 87: Session Storage Boundary")
  })
})
