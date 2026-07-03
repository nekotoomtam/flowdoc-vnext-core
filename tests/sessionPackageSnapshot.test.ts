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

describe("vNext session package snapshot retained contract", () => {
  it("creates canonical package snapshot facts without storage-shaped fields", () => {
    const session = createVNextEditableSession(fixtureValue("product-report-vnext-minimal.flowdoc.json"))
    const snapshot = createVNextSessionPackageSnapshot(session)

    expect(snapshot).toMatchObject({
      source: VNEXT_SESSION_PACKAGE_SNAPSHOT_SOURCE,
      mode: VNEXT_SESSION_PACKAGE_SNAPSHOT_MODE,
      facts: {
        packageId: "product-report-vnext-minimal",
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
    expect(snapshot.facts.contracts.storageKey).toBe(false)
    expect(JSON.stringify(snapshot)).not.toContain("storageStatus")
  })

  it("keeps session-only state out while retaining revision and dirty-scope facts", () => {
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
        document: 9,
        dirtyScopes: 3,
      },
      dirtyScopes: new Set(["text-block:title", "field:customer.name", "field:report.total"]),
    }

    const snapshot = createVNextSessionPackageSnapshot(dirtySession)
    const packageJson = JSON.stringify(snapshot.package)

    expect(snapshot.facts).toMatchObject({
      documentRevision: 9,
      dirtyScopeCount: 3,
    })
    expect(snapshot.facts.persistedState.selection).toBe(false)
    expect(snapshot.facts.persistedState.dirtyScopes).toBe(false)
    expect(snapshot.facts.persistedState.revisions).toBe(false)
    expect(packageJson).not.toContain("vnext-editable-session")
    expect(packageJson).not.toContain('"selection"')
    expect(packageJson).not.toContain('"dirtyScopes"')
    expect(packageJson).not.toContain('"revisions"')
    expect(packageJson).not.toContain('"nodeId"')
  })

  it("keeps backend storage replacement evidence composed from retained snapshot facts", () => {
    const session = createVNextEditableSession(fixtureValue("product-report-vnext-minimal.flowdoc.json"))
    const snapshot = createVNextSessionPackageSnapshot(session)
    const backendReplacementEvidence = {
      owner: "flowdoc-vnext-backend/src/storage/sessionRecord.ts",
      packageId: snapshot.facts.packageId,
      packageVersion: snapshot.facts.packageVersion,
      documentVersion: snapshot.facts.documentVersion,
      documentRevision: snapshot.facts.documentRevision,
      dirtyScopeCount: snapshot.facts.dirtyScopeCount,
      package: snapshot.package,
      persistedState: snapshot.facts.persistedState,
      storageStatus: "backend-owned-not-core",
    }

    expect(backendReplacementEvidence).toMatchObject({
      owner: "flowdoc-vnext-backend/src/storage/sessionRecord.ts",
      packageId: snapshot.facts.packageId,
      packageVersion: snapshot.facts.packageVersion,
      documentVersion: snapshot.facts.documentVersion,
      documentRevision: snapshot.facts.documentRevision,
      dirtyScopeCount: snapshot.facts.dirtyScopeCount,
      persistedState: snapshot.facts.persistedState,
      storageStatus: "backend-owned-not-core",
    })
    expect(backendReplacementEvidence.package).toEqual(snapshot.package)
    expect(snapshot.facts.contracts).toMatchObject({
      storageRecord: false,
      storageWrites: false,
      backendApi: false,
    })
  })

  it("keeps the retained snapshot helper independent from storage, routes, DOM, and layout", () => {
    const source = readFileSync(new URL("../src/authoring/sessionStorage.ts", import.meta.url), "utf8")
    const snapshotStart = source.indexOf("export function createVNextSessionPackageSnapshot")
    const storageStart = source.indexOf("export function createVNextSessionStorageRecord")
    const snapshotSource = source.slice(snapshotStart, storageStart)

    expect(snapshotSource).toContain("serializeFlowDocPackageV2DocumentVNext")
    expect(snapshotSource).toContain("canonicalPackage: true")
    expect(snapshotSource).toContain("storageRecord: false")
    expect(snapshotSource).toContain("storageKey: false")
    expect(snapshotSource).not.toContain("storageStatus")
    expect(snapshotSource).not.toContain("reason")
    expect(snapshotSource).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(snapshotSource).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(snapshotSource).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(snapshotSource).not.toContain("fetch(")
    expect(snapshotSource).not.toContain("/api/")
    expect(snapshotSource).not.toContain("localStorage")
    expect(snapshotSource).not.toContain("sessionStorage")
    expect(snapshotSource).not.toContain("indexedDB")
    expect(snapshotSource).not.toContain("runVNextLayoutPipeline")
    expect(snapshotSource).not.toContain("paginateVNextDocument")
  })
})
