import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  parseFlowDocPackageV3DocumentV4,
  planVNextDocumentInstanceMaterializationV1,
  type VNextDocumentInstanceMaterializationRequestV1,
} from "../src/index.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function requestFixture(): VNextDocumentInstanceMaterializationRequestV1 {
  const raw = readFileSync(
    new URL("../fixtures/product-report-v4-image-target.flowdoc.json", import.meta.url),
    "utf8",
  )
  const starterDocument = parseFlowDocPackageV3DocumentV4(JSON.parse(raw)).document
  const publishedRef = {
    structureId: "structure-product-report",
    structureVersionId: "structure-product-report-v4",
    versionOrdinal: 4,
  }
  return {
    contractVersion: 1,
    kind: "document-instance-materialization-request",
    publishedStructure: {
      contractVersion: 1,
      kind: "published-structure-version",
      ...publishedRef,
      sourceDraft: {
        structureId: publishedRef.structureId,
        draftId: "draft-product-report",
        revision: 12,
      },
    },
    instance: {
      contractVersion: 1,
      kind: "document-instance",
      instanceId: "instance-product-report-001",
      revision: 0,
      structureVersion: publishedRef,
    },
    starterDocument,
    policySet: {
      contractVersion: 1,
      kind: "structure-policy-set",
      policySetId: "policy-product-report-v4",
      owner: { kind: "published-structure-version", ref: publishedRef },
      defaultPolicyKey: "default",
      policies: {
        default: {
          key: "default",
          nodeActions: ["content.edit"],
        },
      },
      nodeBindings: { "body-text": "default" },
    },
    instanceMeta: { title: "Customer 001 Product Report" },
  }
}

describe("document instance materialization", () => {
  it("plans a source-immutable instance graph with explicit provenance and ownership", () => {
    const request = requestFixture()
    request.starterDocument.document.meta = {
      title: "Published starter",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-02-01T00:00:00.000Z",
    }
    const sourceBefore = JSON.stringify(request)

    const result = planVNextDocumentInstanceMaterializationV1(request)

    expect(result.status).toBe("planned")
    if (result.status !== "planned") throw new Error(result.issues.map((item) => item.message).join("\n"))
    expect(result.document.document.id).toBe("instance-product-report-001")
    expect(result.document.document.meta).toEqual({ title: "Customer 001 Product Report" })
    expect(result.document.document.sections).toEqual(request.starterDocument.document.sections)
    expect(result.policy).toEqual({
      policySetId: "policy-product-report-v4",
      owner: request.instance.structureVersion,
      bindingMode: "published-structure-reference",
    })
    expect(result.provenance.document).toEqual({
      sourceDocumentId: "product-report-v4-image-target",
      instanceDocumentId: "instance-product-report-001",
    })
    expect(result.provenance.sections.length).toBe(request.starterDocument.document.sections.length)
    expect(result.provenance.nodes.map((item) => item.sourceNodeId)).toEqual(
      request.starterDocument.document.sections.flatMap((section) => Object.values(section.nodes).map((node) => node.id)),
    )
    expect(result.provenance.inlines).toContainEqual({
      sectionId: "section-main",
      textBlockId: "body-text",
      sourceInlineId: "body-prefix",
      instanceInlineId: "body-prefix",
    })
    expect(result.registryOwnership).toEqual({
      fieldContract: "published-structure-version",
      styleCatalog: "published-structure-version",
      staticAssets: "published-structure-version",
      instanceAssets: "document-instance",
      dataSnapshot: "instance-generation-context",
    })
    expect(result.execution).toEqual({
      persistence: "not-run",
      revisionAdvance: false,
      generatedExpansion: "not-run",
      dataResolution: "not-run",
    })
    expect(JSON.stringify(request)).toBe(sourceBefore)
    expect(result.document).not.toBe(request.starterDocument)
  })

  it("blocks identity, owner, revision, structure, and policy binding mismatches", () => {
    const wrongPin = requestFixture()
    wrongPin.instance.structureVersion.structureVersionId = "other-version"
    const nonzeroRevision = requestFixture()
    nonzeroRevision.instance.revision = 1
    const draftPolicy = requestFixture()
    draftPolicy.policySet.owner = {
      kind: "structure-definition-draft",
      ref: { structureId: "structure-product-report", draftId: "draft-product-report", revision: 12 },
    }
    const wrongPolicyVersion = requestFixture()
    if (wrongPolicyVersion.policySet.owner.kind !== "published-structure-version") throw new Error("fixture owner")
    wrongPolicyVersion.policySet.owner.ref.structureVersionId = "other-version"
    const missingBinding = requestFixture()
    missingBinding.policySet.nodeBindings["missing-node"] = "default"
    const invalidStructure = requestFixture()
    invalidStructure.starterDocument.document.sections[0].zoneIds.push("missing-zone")

    const cases = [
      [wrongPin, "instance-structure-version-mismatch"],
      [nonzeroRevision, "instance-revision-not-zero"],
      [draftPolicy, "policy-owner-not-published"],
      [wrongPolicyVersion, "policy-owner-version-mismatch"],
      [missingBinding, "policy-binding-node-missing"],
      [invalidStructure, "invalid-starter-structure"],
    ] as const

    cases.forEach(([request, code]) => {
      const result = planVNextDocumentInstanceMaterializationV1(request)
      expect(result.status).toBe("blocked")
      expect(result.issues.some((item) => item.code === code)).toBe(true)
      expect(result.document).toBeNull()
      expect(result.provenance).toBeNull()
    })
  })

  it("strictly rejects unknown request fields and blank instance titles", () => {
    const extra = clone(requestFixture()) as VNextDocumentInstanceMaterializationRequestV1 & { runtime?: unknown }
    extra.runtime = { persist: true }
    const blankTitle = clone(requestFixture())
    blankTitle.instanceMeta.title = "   "

    for (const request of [extra, blankTitle]) {
      const result = planVNextDocumentInstanceMaterializationV1(request)
      expect(result).toMatchObject({ status: "blocked", document: null, provenance: null })
      expect(result.issues.every((item) => item.code === "invalid-request")).toBe(true)
    }
  })

  it("publishes Phase 272 without activating persistence or resolution", () => {
    const doc = readFileSync(
      new URL("../docs/DOCUMENT_INSTANCE_MATERIALIZATION_CONTRACT.md", import.meta.url),
      "utf8",
    )
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8")
    const ledger = readFileSync(new URL("../docs/PHASE_LEDGER.md", import.meta.url), "utf8")

    expect(doc).toContain("created once from one exact Published")
    expect(doc).toContain("Structure Version. Materialization copies")
    expect(doc).toContain("The backend allocates the `instanceId`")
    expect(doc).toContain("It is not an overlay")
    expect(doc).toContain("persistence, revision advancement, generated expansion")
    expect(readme).toContain("pure source-immutable Document")
    expect(ledger).toContain("## Phase 272 Document Instance Materialization Contract")
  })
})
