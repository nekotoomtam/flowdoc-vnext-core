import { describe, expect, it } from "vitest"
import {
  createVNextTextBlockPersistentFlowTreeV2,
  inspectVNextTextBlockPersistentFlowTreeV2,
  VNEXT_TEXT_BLOCK_INLINE_IMAGE_ALIGNMENT_POLICY_V1,
} from "../src/index.js"
import { acceptedInlineImageEvidenceFixture } from "./helpers/textBlockInlineImageFlowV2.js"

describe("VNext TextBlock Persistent Flow Tree V2", () => {
  it("projects image-only and mixed evidence into source-ordered closed atoms", () => {
    const imageOnly = acceptedInlineImageEvidenceFixture({
      content: "image-only",
      verticalAlign: "middle",
    })
    const imageOnlyResult = createVNextTextBlockPersistentFlowTreeV2(imageOnly)

    expect(imageOnlyResult.status).toBe("accepted")
    if (imageOnlyResult.status !== "accepted") throw new Error("image-only tree blocked")
    const imageOnlyTree = imageOnlyResult.tree
    const image = imageOnlyTree.root.nodeKind === "leaf"
      ? imageOnlyTree.root.atoms[0]
      : undefined
    expect(imageOnlyTree.itemsByKind).toEqual({
      "text-cluster": 0,
      "hard-break": 0,
      "inline-image": 1,
    })
    expect(image).toMatchObject({
      kind: "inline-image",
      inlineId: "image-1",
      assetId: "asset-1",
      renderStartOffset: 0,
      renderEndOffset: 1,
      renderedText: "\uFFFC",
      widthLayoutUnit: 10_000_000,
      heightLayoutUnit: 12_000_000,
      verticalAlign: "middle",
      alignmentPolicyFingerprint:
        VNEXT_TEXT_BLOCK_INLINE_IMAGE_ALIGNMENT_POLICY_V1.fingerprint,
    })

    const mixed = acceptedInlineImageEvidenceFixture({ content: "text-image-text-break" })
    const mixedResult = createVNextTextBlockPersistentFlowTreeV2(mixed)
    expect(mixedResult.status).toBe("accepted")
    if (mixedResult.status !== "accepted") throw new Error("mixed tree blocked")
    const atoms = mixedResult.tree.root.nodeKind === "leaf"
      ? mixedResult.tree.root.atoms
      : []
    expect(atoms.map((atom) => [atom.kind, atom.inlineId, atom.renderStartOffset])).toEqual([
      ["text-cluster", "text-a", 0],
      ["inline-image", "image-1", 1],
      ["text-cluster", "text-b", 2],
      ["hard-break", "break-1", 3],
    ])
    expect(mixedResult.tree).not.toHaveProperty("suffixProof")
    expect(mixedResult.tree).not.toHaveProperty("acceptedLayout")
    expect(mixedResult.tree).not.toHaveProperty("lines")
    expect(mixedResult.tree.contracts).toMatchObject({
      suffixReuseClaim: false,
      reconvergenceClaim: false,
      mayPublishLayout: false,
      productionBinding: false,
    })
  })

  it("changes the tree fingerprint for authored image fit and crop dependencies", () => {
    const contain = createVNextTextBlockPersistentFlowTreeV2(
      acceptedInlineImageEvidenceFixture({ content: "image-only", fit: "contain" }),
    )
    const cover = createVNextTextBlockPersistentFlowTreeV2(
      acceptedInlineImageEvidenceFixture({
        content: "image-only",
        fit: "cover",
        crop: { x: 0, y: 0, width: 0.5, height: 1 },
      }),
    )

    expect(contain.status).toBe("accepted")
    expect(cover.status).toBe("accepted")
    if (contain.status !== "accepted" || cover.status !== "accepted") {
      throw new Error("image dependency trees blocked")
    }
    expect(contain.tree.fingerprint).not.toBe(cover.tree.fingerprint)
  })

  it("rejects foreign authority and production binding without producing a partial tree", () => {
    const fixture = acceptedInlineImageEvidenceFixture({ content: "image-only" })
    const foreignEvidence = createVNextTextBlockPersistentFlowTreeV2({
      initialFlow: fixture.initialFlow,
      evidence: structuredClone(fixture.evidence),
    })
    const foreignInitialFlow = createVNextTextBlockPersistentFlowTreeV2({
      initialFlow: structuredClone(fixture.initialFlow),
      evidence: fixture.evidence,
    })
    const production = createVNextTextBlockPersistentFlowTreeV2({
      ...fixture,
      bindProductionLayout: true,
    })

    for (const result of [foreignEvidence, foreignInitialFlow, production]) {
      expect(result).toMatchObject({ status: "blocked", tree: null })
    }
    expect(foreignEvidence.issues[0]?.code).toBe("flow-evidence-provenance-mismatch")
    expect(foreignInitialFlow.issues[0]?.code).toBe("initial-flow-provenance-mismatch")
    expect(production.issues[0]?.code).toBe("production-binding-forbidden")
  })

  it("returns only a frozen registered tree that cannot be mutated after authority registration", () => {
    const result = createVNextTextBlockPersistentFlowTreeV2(
      acceptedInlineImageEvidenceFixture({ content: "image-only" }),
    )
    expect(result.status).toBe("accepted")
    if (result.status !== "accepted") throw new Error("tree blocked")

    expect(Object.isFrozen(result.tree)).toBe(true)
    expect(() => Object.defineProperty(result.tree, "fingerprint", { value: "changed" })).toThrow()
    expect(inspectVNextTextBlockPersistentFlowTreeV2(result.tree)).toEqual({
      status: "valid",
      fingerprint: result.tree.fingerprint,
    })
  })
})
