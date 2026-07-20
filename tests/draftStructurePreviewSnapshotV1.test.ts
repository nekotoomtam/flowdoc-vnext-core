import { describe, expect, it } from "vitest"
import {
  createVNextDraftStructurePreviewSnapshotV1,
  VNextDraftStructurePreviewSnapshotV1Schema,
} from "../src/index.js"

const HASH = `sha256:${"a".repeat(64)}`

function input() {
  return {
    snapshotId: "draft-preview:operations-guide:8",
    draft: {
      contractVersion: 1 as const,
      kind: "structure-definition-draft" as const,
      structureId: "operations-guide",
      draftId: "operations-guide:draft",
      revision: 8,
    },
    authoring: {
      documentId: "document:operations-guide",
      documentRevision: 8,
    },
    sourcePackage: {
      packageId: "package:operations-guide",
      packageVersion: 3,
      documentVersion: 4,
      packageFingerprint: HASH,
    },
  }
}

function snapshot() {
  return createVNextDraftStructurePreviewSnapshotV1(input())
}

describe("draft Structure Preview snapshot v1", () => {
  it("pins one immutable local draft revision without claiming Published parity", () => {
    const value = snapshot()

    expect(value).toMatchObject({
      kind: "draft-structure-preview-snapshot",
      draft: { revision: 8 },
      authoring: { documentRevision: 8 },
      contracts: {
        immutableSnapshot: true,
        exactDraftRevision: true,
        localPreviewOnly: true,
        publishedStructureVersion: false,
        publishedApiParity: false,
        businessValuesIncluded: false,
        productionBinding: false,
      },
    })
    expect(value.snapshotFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
  })

  it("rejects stale revision pins, fingerprint drift, and unknown fields", () => {
    expect(() => createVNextDraftStructurePreviewSnapshotV1({
      ...input(),
      authoring: { documentId: "document:operations-guide", documentRevision: 7 },
    })).toThrow("exact draft revision")

    const value = snapshot()
    expect(VNextDraftStructurePreviewSnapshotV1Schema.safeParse({
      ...value,
      snapshotFingerprint: HASH,
    }).success).toBe(false)
    expect(VNextDraftStructurePreviewSnapshotV1Schema.safeParse({
      ...value,
      publishedStructureVersionId: "not-allowed",
    }).success).toBe(false)
  })

  it("is deterministic and source-immutable", () => {
    const first = snapshot()
    const second = snapshot()
    expect(second).toEqual(first)

    const input = {
      snapshotId: "draft-preview:mutability",
      draft: {
        contractVersion: 1 as const,
        kind: "structure-definition-draft" as const,
        structureId: "structure:mutability",
        draftId: "draft:mutability",
        revision: 2,
      },
      authoring: { documentId: "document:mutability", documentRevision: 2 },
      sourcePackage: {
        packageId: "package:mutability",
        packageVersion: 3,
        documentVersion: 4,
        packageFingerprint: HASH,
      },
    }
    const created = createVNextDraftStructurePreviewSnapshotV1(input)
    input.draft.draftId = "changed"
    expect(created.draft.draftId).toBe("draft:mutability")
  })
})
