import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  createVNextSubmissionIdentityStatus,
  parseFlowDocPackageV2DocumentVNext,
  VNEXT_SUBMISSION_IDENTITY_STATUS_MODE,
  VNEXT_SUBMISSION_IDENTITY_STATUS_SOURCE,
} from "../src/index.js"

function fixturePackage(name: string) {
  const fixtureUrl = new URL(`../fixtures/${name}`, import.meta.url)
  return parseFlowDocPackageV2DocumentVNext(JSON.parse(readFileSync(fixtureUrl, "utf8")) as unknown)
}

describe("vNext submission identity/status retained contract", () => {
  it("creates retained identity/status facts without workflow application fields", () => {
    const pack = fixturePackage("product-report-vnext-minimal.flowdoc.json")
    const before = JSON.stringify(pack)
    const identityStatus = createVNextSubmissionIdentityStatus({
      templateId: pack.id,
      documentRevision: 5,
      dataRevision: 2,
      submissionId: "submission-001",
      workflowStatus: "submitted",
      actorId: "author-001",
      reason: "submit for review",
    })

    expect(identityStatus).toEqual({
      source: VNEXT_SUBMISSION_IDENTITY_STATUS_SOURCE,
      mode: VNEXT_SUBMISSION_IDENTITY_STATUS_MODE,
      facts: {
        status: "ready",
        workflowStatus: "submitted",
        templateId: pack.id,
        submissionId: "submission-001",
        documentRevision: 5,
        dataRevision: 2,
        actorId: "author-001",
        reviewerId: null,
        reason: "submit for review",
        contracts: {
          submissionIdentityFacts: true,
          externalWorkflowStatusFacts: true,
          validationFacts: true,
          externalSubmissionState: true,
          packageMutation: false,
          documentMutation: false,
          dataMutation: false,
          editorSession: false,
          workflowEngine: false,
          permissions: false,
          approvalGates: false,
          storageWrite: false,
          routeDispatch: false,
          notificationAudit: false,
        },
      },
      issues: [],
    })
    expect(JSON.stringify(pack)).toBe(before)
    expect(Object.prototype.hasOwnProperty.call(identityStatus, "scope")).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(identityStatus, "application")).toBe(false)
    expect(JSON.stringify(identityStatus)).not.toContain('"not-written"')
    expect(JSON.stringify(identityStatus)).not.toContain('"not-run"')
    expect(JSON.parse(JSON.stringify(identityStatus))).toEqual(identityStatus)
  })

  it("blocks incomplete review identity/status facts without workflow execution", () => {
    const identityStatus = createVNextSubmissionIdentityStatus({
      templateId: "",
      documentRevision: -1,
      dataRevision: 1.5,
      workflowStatus: "approved",
    })

    expect(identityStatus.facts).toMatchObject({
      status: "blocked",
      workflowStatus: "approved",
      templateId: null,
      submissionId: null,
      documentRevision: null,
      dataRevision: null,
      reviewerId: null,
      contracts: {
        workflowEngine: false,
        permissions: false,
        approvalGates: false,
        storageWrite: false,
        routeDispatch: false,
      },
    })
    expect(identityStatus.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: "missing-template-id",
        path: "templateId",
      }),
      expect.objectContaining({
        code: "invalid-document-revision",
        path: "documentRevision",
      }),
      expect.objectContaining({
        code: "invalid-data-revision",
        path: "dataRevision",
      }),
      expect.objectContaining({
        code: "missing-submission-id",
        path: "submissionId",
      }),
      expect.objectContaining({
        code: "missing-reviewer-id",
        path: "reviewerId",
      }),
    ]))
  })

  it("keeps backend submission route replacement evidence composed from retained facts", () => {
    const input = {
      templateId: "product-report-vnext-minimal",
      documentRevision: 5,
      dataRevision: 2,
      submissionId: "submission-001",
      workflowStatus: "submitted" as const,
      actorId: "author-001",
      reason: "submit for review",
    }
    const identityStatus = createVNextSubmissionIdentityStatus(input)
    const backendRouteEvidence = {
      owner: "flowdoc-vnext-backend/src/routes/submissionRoute.ts",
      status: identityStatus.facts.status,
      workflowStatus: identityStatus.facts.workflowStatus,
      templateId: identityStatus.facts.templateId,
      submissionId: identityStatus.facts.submissionId,
      documentRevision: identityStatus.facts.documentRevision,
      dataRevision: identityStatus.facts.dataRevision,
      actorId: identityStatus.facts.actorId,
      reviewerId: identityStatus.facts.reviewerId,
      reason: identityStatus.facts.reason,
      issues: identityStatus.issues,
      routeDispatch: "backend-owned-not-core",
    }

    expect(backendRouteEvidence).toMatchObject({
      owner: "flowdoc-vnext-backend/src/routes/submissionRoute.ts",
      status: identityStatus.facts.status,
      workflowStatus: identityStatus.facts.workflowStatus,
      templateId: identityStatus.facts.templateId,
      submissionId: identityStatus.facts.submissionId,
      documentRevision: identityStatus.facts.documentRevision,
      dataRevision: identityStatus.facts.dataRevision,
      actorId: identityStatus.facts.actorId,
      reviewerId: identityStatus.facts.reviewerId,
      reason: identityStatus.facts.reason,
      issues: identityStatus.issues,
      routeDispatch: "backend-owned-not-core",
    })
    expect(identityStatus.facts.contracts).toMatchObject({
      storageWrite: false,
      routeDispatch: false,
      workflowEngine: false,
    })
  })

  it("keeps the retained identity/status helper independent from workflow execution, storage, routes, DOM, and package changes", () => {
    const source = readFileSync(new URL("../src/workflow/submissionState.ts", import.meta.url), "utf8")
    const helperStart = source.indexOf("export function createVNextSubmissionIdentityStatus")
    const stateStart = source.indexOf("export function createVNextSubmissionStateRecord")
    const helperSource = source.slice(helperStart, stateStart)

    expect(helperSource).toContain("validationIssues(input)")
    expect(helperSource).toContain("submissionIdentityFacts: true")
    expect(helperSource).toContain("externalWorkflowStatusFacts: true")
    expect(helperSource).toContain("workflowEngine: false")
    expect(helperSource).toContain("storageWrite: false")
    expect(helperSource).toContain("routeDispatch: false")
    expect(helperSource).not.toContain('"not-written"')
    expect(helperSource).not.toContain('"not-run"')
    expect(helperSource).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(helperSource).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(helperSource).not.toMatch(/node:fs|node:http|node:https|express|fastify/)
    expect(helperSource).not.toContain("fetch(")
    expect(helperSource).not.toContain("localStorage")
    expect(helperSource).not.toContain("sessionStorage")
    expect(helperSource).not.toContain("indexedDB")
    expect(helperSource).not.toMatch(/\bdocument\.(querySelector|createElement|body|addEventListener)/)
    expect(helperSource).not.toContain("HTMLElement")
    expect(helperSource).not.toContain("window.")
    expect(helperSource).not.toContain("/api/")
    expect(helperSource).not.toContain("parseFlowDocPackage")
    expect(helperSource).not.toContain("serializeFlowDocPackage")
    expect(helperSource).not.toContain("runVNextTextTransaction")
    expect(helperSource).not.toContain("runVNextOperation")
    expect(helperSource).not.toContain("runVNextLayoutPipeline")
    expect(helperSource).not.toContain("paginateVNextDocument")
  })
})
