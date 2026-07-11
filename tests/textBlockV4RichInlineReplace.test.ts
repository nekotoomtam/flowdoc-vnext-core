import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  parseFlowDocPackageV3DocumentV4,
  planVNextTextBlockV4InlineCommand,
  runVNextTextBlockV4RichInlineReplace,
  type VNextStructurePolicyNodeAction,
  type VNextTextBlockV4RichInlineReplaceRequestV1,
} from "../src/index.js"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function requestFixture(actions: VNextStructurePolicyNodeAction[] = [
  "content.edit", "field.place", "media.place", "style.override",
]): VNextTextBlockV4RichInlineReplaceRequestV1 {
  const raw = readFileSync(
    new URL("../fixtures/product-report-v4-image-target.flowdoc.json", import.meta.url),
    "utf8",
  )
  const pack = parseFlowDocPackageV3DocumentV4(JSON.parse(raw))
  const owner = {
    structureId: "structure-product-report",
    structureVersionId: "structure-product-report-v4",
    versionOrdinal: 4,
  }
  const body = pack.document.document.sections[0].nodes["body-text"]
  if (body.type !== "text-block") throw new Error("fixture body text missing")
  return {
    contractVersion: 1,
    kind: "text-block-v4-rich-inline-replace-request",
    artifact: {
      contractVersion: 1,
      kind: "document-instance",
      instanceId: pack.document.document.id,
      revision: 8,
      structureVersion: clone(owner),
    },
    document: pack.document,
    fieldContract: {
      contractVersion: 1,
      kind: "published-field-contract",
      fieldContractId: "fields-product-report-v4",
      owner: clone(owner),
      registry: pack.fields,
    },
    policySet: {
      contractVersion: 1,
      kind: "structure-policy-set",
      policySetId: "policy-product-report-v4",
      owner: { kind: "published-structure-version", ref: clone(owner) },
      defaultPolicyKey: "default",
      policies: { default: { key: "default", nodeActions: actions } },
      nodeBindings: {},
    },
    sessionAllowedActions: actions,
    command: {
      kind: "text-block.rich-inline.replace",
      textBlockId: body.id,
      source: "user",
      children: clone(body.children),
    },
  }
}

function bodyChildren(request: VNextTextBlockV4RichInlineReplaceRequestV1) {
  const body = request.document.document.sections[0].nodes["body-text"]
  if (body.type !== "text-block") throw new Error("fixture body text missing")
  return body.children
}

describe("text-block v4 rich inline replace", () => {
  it("commits a source-immutable replacement with policy, identity, history, and scope facts", () => {
    const request = requestFixture()
    const prefix = request.command.children[0]
    if (prefix.type !== "text") throw new Error("fixture prefix missing")
    prefix.text = "Prepared for "
    request.command.children.push({ id: "body-suffix", type: "text", text: "." })
    const before = JSON.stringify(request)

    const result = runVNextTextBlockV4RichInlineReplace(request)

    expect(result.status).toBe("committed")
    if (result.status !== "committed") throw new Error(result.issues.map((item) => item.message).join("\n"))
    const body = result.document.document.sections[0].nodes["body-text"]
    expect(body.type === "text-block" && body.children).toEqual(request.command.children)
    expect(result.operation).toMatchObject({
      kind: "text-block.rich-inline.replace",
      source: "user",
      targetTextBlockId: "body-text",
      requiredActions: ["content.edit"],
      policyKey: "default",
      identity: {
        addedInlineIds: ["body-suffix"],
        removedInlineIds: [],
        retainedInlineIds: ["body-prefix", "body-name", "body-space", "body-inline-logo"],
      },
      fieldKeys: ["customer.name"],
      scope: {
        sectionIds: ["section-main"],
        zoneIds: ["body-zone"],
        parentNodeIds: ["body-zone"],
        textBlockIds: ["body-text"],
      },
      historyPolicy: {
        durableIntent: "content",
        kind: "single-entry",
        mergeKey: "rich-inline:body-text",
        collaborationSafe: false,
      },
      renderInvalidation: { lane: "text-content" },
    })
    expect(JSON.stringify(request)).toBe(before)
    expect(result.document).not.toBe(request.document)
  })

  it("requires field, media, and style capabilities only when those placements change", () => {
    const field = requestFixture()
    field.command.children.splice(1, 0, {
      id: "report-total", type: "field-ref", key: "customer.name", label: "Customer",
    })
    const media = requestFixture()
    const inlineImage = media.command.children.find((inline) => inline.type === "inline-image")
    if (inlineImage?.type !== "inline-image") throw new Error("fixture image missing")
    inlineImage.source = { kind: "asset-ref", assetId: "asset-logo" }
    const style = requestFixture()
    const text = style.command.children.find((inline) => inline.type === "text")
    if (text?.type !== "text") throw new Error("fixture text missing")
    text.style = { fontWeight: "bold" }

    const fieldResult = runVNextTextBlockV4RichInlineReplace(field)
    const mediaResult = runVNextTextBlockV4RichInlineReplace(media)
    const styleResult = runVNextTextBlockV4RichInlineReplace(style)

    expect(fieldResult.status === "committed" && fieldResult.operation.requiredActions).toEqual([
      "content.edit", "field.place",
    ])
    expect(mediaResult.status === "committed" && mediaResult.operation.requiredActions).toEqual([
      "content.edit", "media.place",
    ])
    expect(styleResult.status === "committed" && styleResult.operation.requiredActions).toEqual([
      "content.edit", "style.override",
    ])
  })

  it("blocks at the structure-policy and session-permission layers", () => {
    const structureDenied = requestFixture(["content.edit"])
    structureDenied.sessionAllowedActions = ["content.edit", "field.place"]
    structureDenied.command.children.push({ id: "new-field", type: "field-ref", key: "customer.name" })
    const sessionDenied = requestFixture(["content.edit", "field.place"])
    sessionDenied.sessionAllowedActions = ["content.edit"]
    sessionDenied.command.children.push({ id: "new-field", type: "field-ref", key: "customer.name" })

    const structureResult = runVNextTextBlockV4RichInlineReplace(structureDenied)
    const sessionResult = runVNextTextBlockV4RichInlineReplace(sessionDenied)

    expect(structureResult).toMatchObject({
      status: "blocked", reason: "capability-denied",
      issues: [{ code: "structure-policy-denied", action: "field.place" }],
    })
    expect(sessionResult).toMatchObject({
      status: "blocked", reason: "capability-denied",
      issues: [{ code: "session-permission-denied", action: "field.place" }],
    })
  })

  it("blocks no-op, invalid field placement, duplicate identity, and page-number zone", () => {
    const noOp = requestFixture()
    const invalidField = requestFixture()
    invalidField.command.children.push({ id: "missing-field", type: "field-ref", key: "missing.key" })
    const duplicate = requestFixture()
    duplicate.command.children.push(clone(duplicate.command.children[0]))
    const bodyPage = requestFixture()
    bodyPage.command.children.push({ id: "body-page", type: "page-number" })

    expect(runVNextTextBlockV4RichInlineReplace(noOp)).toMatchObject({ status: "blocked", reason: "no-op" })
    expect(runVNextTextBlockV4RichInlineReplace(invalidField)).toMatchObject({
      status: "blocked", reason: "validation-failed",
      issues: [expect.objectContaining({ code: "missing-field-definition" })],
    })
    expect(runVNextTextBlockV4RichInlineReplace(duplicate)).toMatchObject({
      status: "blocked", reason: "validation-failed",
      issues: [expect.objectContaining({ code: "duplicate-inline-id" })],
    })
    expect(runVNextTextBlockV4RichInlineReplace(bodyPage)).toMatchObject({
      status: "blocked", reason: "validation-failed",
      issues: [expect.objectContaining({ code: "page-number-zone-invalid" })],
    })
  })

  it("does not require field.place merely because an unchanged field placement remains", () => {
    const request = requestFixture(["content.edit"])
    const prefix = request.command.children[0]
    if (prefix.type !== "text") throw new Error("fixture prefix missing")
    prefix.text = "Customer: "

    const result = runVNextTextBlockV4RichInlineReplace(request)

    expect(result.status).toBe("committed")
    if (result.status === "committed") expect(result.operation.requiredActions).toEqual(["content.edit"])
    expect(bodyChildren(request).some((inline) => inline.type === "field-ref")).toBe(true)
  })

  it("blocks document-instance and structure-draft policy ownership mismatches", () => {
    const wrongInstancePolicy = requestFixture()
    if (wrongInstancePolicy.policySet.owner.kind !== "published-structure-version") throw new Error("fixture owner")
    wrongInstancePolicy.policySet.owner.ref.structureVersionId = "other-version"
    const wrongInstanceDocument = requestFixture()
    if (wrongInstanceDocument.artifact.kind !== "document-instance") throw new Error("fixture artifact")
    wrongInstanceDocument.artifact.instanceId = "other-instance"
    const draft = requestFixture()
    draft.artifact = {
      contractVersion: 1,
      kind: "structure-definition-draft",
      structureId: "structure-product-report",
      draftId: "draft-product-report",
      revision: 12,
    }
    const draftWrongField = clone(draft)
    draftWrongField.policySet.owner = {
      kind: "structure-definition-draft",
      ref: { structureId: "structure-product-report", draftId: "draft-product-report", revision: 12 },
    }

    expect(runVNextTextBlockV4RichInlineReplace(wrongInstancePolicy)).toMatchObject({
      status: "blocked", reason: "artifact-mismatch",
      issues: [{ code: "instance-policy-owner-mismatch" }],
    })
    expect(runVNextTextBlockV4RichInlineReplace(wrongInstanceDocument)).toMatchObject({
      status: "blocked", reason: "artifact-mismatch",
      issues: [{ code: "instance-document-id-mismatch" }],
    })
    expect(runVNextTextBlockV4RichInlineReplace(draft)).toMatchObject({
      status: "blocked", reason: "artifact-mismatch",
      issues: [
        { code: "draft-policy-owner-mismatch" },
        { code: "draft-field-contract-owner-mismatch" },
      ],
    })
    expect(runVNextTextBlockV4RichInlineReplace(draftWrongField)).toMatchObject({
      status: "blocked", reason: "artifact-mismatch",
      issues: [{ code: "draft-field-contract-owner-mismatch" }],
    })
  })

  it("commits against an exact structure draft policy and field contract revision", () => {
    const request = requestFixture()
    const draftRef = {
      structureId: "structure-product-report",
      draftId: "draft-product-report",
      revision: 12,
    }
    request.artifact = { contractVersion: 1, kind: "structure-definition-draft", ...draftRef }
    request.policySet.owner = { kind: "structure-definition-draft", ref: clone(draftRef) }
    request.fieldContract = {
      contractVersion: 1,
      kind: "draft-field-contract",
      fieldContractId: "fields-draft-product-report-r12",
      owner: clone(draftRef),
      registry: clone(request.fieldContract.registry),
    }
    const prefix = request.command.children[0]
    if (prefix.type !== "text") throw new Error("fixture prefix missing")
    prefix.text = "Draft customer "

    const result = runVNextTextBlockV4RichInlineReplace(request)

    expect(result.status).toBe("committed")
    if (result.status === "committed") expect(result.operation.requiredActions).toEqual(["content.edit"])
  })

  it("publishes Phase 276 without claiming collaboration or backend execution", () => {
    const doc = readFileSync(new URL("../docs/TEXT_BLOCK_V4_RICH_INLINE_REPLACE.md", import.meta.url), "utf8")
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8")
    const ledger = readFileSync(new URL("../docs/PHASE_LEDGER.md", import.meta.url), "utf8")

    expect(doc).toContain("policy-aware v4 content transaction")
    expect(doc).toContain("exact draft id and revision")
    expect(doc).toContain("Unchanged field/image/style facts do not require")
    expect(doc).toContain("explicitly not collaboration-safe")
    expect(readme).toContain("Phase 276 adds policy-aware v4 rich-inline replacement")
    expect(ledger).toContain("## Phase 276 Text-block V4 Rich-inline Replace")
  })

  it("accepts explicit field-placement planner output through the same policy-aware commit", () => {
    const request = requestFixture()
    const body = request.document.document.sections[0].nodes["body-text"]
    if (body.type !== "text-block") throw new Error("fixture body text missing")
    const last = body.children[body.children.length - 1]
    const plan = planVNextTextBlockV4InlineCommand(body, {
      kind: "field-ref.insert",
      anchor: { textBlockId: body.id, inlineId: last.id, offset: 1, affinity: "forward" },
      inline: { id: "customer-name-second", type: "field-ref", key: "customer.name" },
    }, { fieldContract: request.fieldContract.registry, zoneRole: "body" })
    if (plan.status !== "planned") throw new Error(plan.issues.map((item) => item.message).join("\n"))
    request.command.children = plan.children

    const result = runVNextTextBlockV4RichInlineReplace(request)

    expect(result.status).toBe("committed")
    if (result.status === "committed") {
      expect(result.operation.requiredActions).toEqual(["content.edit", "field.place"])
      expect(result.operation.identity.addedInlineIds).toContain("customer-name-second")
    }
  })
})
