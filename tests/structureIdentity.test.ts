import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  VNEXT_STRUCTURE_LIFECYCLE_IDENTITY_CONTRACT_VERSION,
  parseVNextStructureLifecycleIdentityV1,
  safeParseVNextStructureLifecycleIdentityV1,
  sameVNextPublishedStructureVersionRefV1,
  serializeVNextStructureLifecycleIdentityV1,
  VNextStructureLifecycleIdentityParseError,
  type VNextDocumentInstanceIdentityV1,
  type VNextPublishedStructureVersionIdentityV1,
  type VNextPublishedStructureVersionRefV1,
  type VNextStructureDefinitionDraftIdentityV1,
} from "../src/index.js"

const publishedRef: VNextPublishedStructureVersionRefV1 = {
  structureId: "operation-guide",
  structureVersionId: "operation-guide@v1",
  versionOrdinal: 1,
}

describe("structure lifecycle identity", () => {
  it("accepts a mutable draft with optional published-version provenance", () => {
    const draft: VNextStructureDefinitionDraftIdentityV1 = {
      contractVersion: 1,
      kind: "structure-definition-draft",
      structureId: "operation-guide",
      draftId: "operation-guide:draft-2",
      revision: 8,
      baseVersion: publishedRef,
    }

    expect(parseVNextStructureLifecycleIdentityV1(draft)).toEqual(draft)
    expect(parseVNextStructureLifecycleIdentityV1({ ...draft, baseVersion: undefined })).toMatchObject({
      kind: "structure-definition-draft",
      revision: 8,
    })
    expect(safeParseVNextStructureLifecycleIdentityV1({
      ...draft,
      baseVersion: { ...publishedRef, structureId: "another-structure" },
    })).toMatchObject({
      ok: false,
      reason: "invalid-identity",
      issues: [{ path: "baseVersion.structureId", severity: "error" }],
    })
  })

  it("pins an immutable published version to an exact source draft revision", () => {
    const published: VNextPublishedStructureVersionIdentityV1 = {
      contractVersion: 1,
      kind: "published-structure-version",
      structureId: "operation-guide",
      structureVersionId: "operation-guide@v2",
      versionOrdinal: 2,
      sourceDraft: {
        structureId: "operation-guide",
        draftId: "operation-guide:draft-2",
        revision: 8,
      },
    }

    expect(parseVNextStructureLifecycleIdentityV1(published)).toEqual(published)
    expect(safeParseVNextStructureLifecycleIdentityV1({
      ...published,
      sourceDraft: { ...published.sourceDraft, structureId: "another-structure" },
    })).toMatchObject({
      ok: false,
      issues: [{ path: "sourceDraft.structureId" }],
    })
  })

  it("pins a materialized document instance to one published structure version", () => {
    const instance: VNextDocumentInstanceIdentityV1 = {
      contractVersion: 1,
      kind: "document-instance",
      instanceId: "guide-project-a",
      revision: 12,
      structureVersion: publishedRef,
    }

    expect(parseVNextStructureLifecycleIdentityV1(instance)).toEqual(instance)
    expect(serializeVNextStructureLifecycleIdentityV1(instance)).toEqual(instance)
    expect(sameVNextPublishedStructureVersionRefV1(instance.structureVersion, publishedRef)).toBe(true)
    expect(sameVNextPublishedStructureVersionRefV1(instance.structureVersion, {
      ...publishedRef,
      versionOrdinal: 2,
    })).toBe(false)
  })

  it("rejects ambiguous, invalid, and package-shaped identities", () => {
    expect(VNEXT_STRUCTURE_LIFECYCLE_IDENTITY_CONTRACT_VERSION).toBe(1)
    for (const candidate of [
      {
        contractVersion: 1,
        kind: "structure-definition-draft",
        structureId: " ",
        draftId: "draft",
        revision: 0,
      },
      {
        contractVersion: 1,
        kind: "published-structure-version",
        structureId: "guide",
        structureVersionId: "guide@v0",
        versionOrdinal: 0,
        sourceDraft: { structureId: "guide", draftId: "draft", revision: 0 },
      },
      {
        contractVersion: 1,
        kind: "document-instance",
        instanceId: "instance",
        revision: -1,
        structureVersion: publishedRef,
      },
      {
        contractVersion: 1,
        kind: "document-instance",
        instanceId: "instance",
        revision: 0,
        structureVersion: publishedRef,
        document: {},
      },
    ]) {
      expect(safeParseVNextStructureLifecycleIdentityV1(candidate).ok).toBe(false)
    }
    expect(() => parseVNextStructureLifecycleIdentityV1({ kind: "document" }))
      .toThrow(VNextStructureLifecycleIdentityParseError)
  })

  it("keeps serialization isolated from later caller mutation", () => {
    const instance: VNextDocumentInstanceIdentityV1 = {
      contractVersion: 1,
      kind: "document-instance",
      instanceId: "guide-project-a",
      revision: 0,
      structureVersion: { ...publishedRef },
    }
    const serialized = serializeVNextStructureLifecycleIdentityV1(instance)
    instance.structureVersion.structureVersionId = "changed"
    expect(serialized.structureVersion.structureVersionId).toBe("operation-guide@v1")
  })

  it("publishes Phase 270 identity boundaries without activating package kinds", () => {
    const doc = readFileSync(new URL("../docs/STRUCTURE_LIFECYCLE_IDENTITY_CONTRACT.md", import.meta.url), "utf8")
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8")
    const ledger = readFileSync(new URL("../docs/PHASE_LEDGER.md", import.meta.url), "utf8")

    expect(doc).toContain("## Identity Shapes")
    expect(doc).toContain("## Identity Invariants")
    expect(doc).toContain("## Package Activation Boundary")
    expect(doc).toMatch(/does not add these identities to either canonical package parser/)
    expect(readme).toContain("Phase 270 adds strict JSON-safe lifecycle identity contracts")
    expect(ledger).toContain("| 270 | Structure lifecycle identity contracts | done |")
    expect(ledger).toContain("## Phase 270 Structure Lifecycle Identity Contracts")
  })
})
