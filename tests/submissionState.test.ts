import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  createVNextSubmissionStateRecord,
  parseFlowDocPackageV2DocumentVNext,
  VNEXT_SUBMISSION_STATE_MODE,
  VNEXT_SUBMISSION_STATE_SOURCE,
} from "../src/index.js"

function fixturePackage(name: string) {
  const fixtureUrl = new URL(`../fixtures/${name}`, import.meta.url)
  return parseFlowDocPackageV2DocumentVNext(JSON.parse(readFileSync(fixtureUrl, "utf8")) as unknown)
}

describe("vNext submission state boundary", () => {
  it("creates an external submission state record without mutating package truth", () => {
    const pack = fixturePackage("product-report-vnext-minimal.flowdoc.json")
    const before = JSON.stringify(pack)

    const record = createVNextSubmissionStateRecord({
      templateId: pack.id,
      documentRevision: 5,
      dataRevision: 2,
      submissionId: "submission-001",
      workflowStatus: "submitted",
      actorId: "author-001",
      reason: "submit for review",
    })

    expect(record).toEqual({
      source: VNEXT_SUBMISSION_STATE_SOURCE,
      mode: VNEXT_SUBMISSION_STATE_MODE,
      status: "ready",
      workflowStatus: "submitted",
      templateId: pack.id,
      submissionId: "submission-001",
      documentRevision: 5,
      dataRevision: 2,
      actorId: "author-001",
      reviewerId: null,
      reason: "submit for review",
      issues: [],
      scope: {
        package: false,
        documentNode: false,
        dataSnapshot: false,
        editorSession: false,
        externalSubmissionState: true,
      },
      application: {
        status: "not-applied",
        packageMutation: "not-run",
        documentMutation: "not-run",
        dataMutation: "not-run",
        historyWrite: "not-written",
        storageWrite: "not-written",
        routeDispatch: "not-run",
        packageVersionChange: false,
      },
    })
    expect(JSON.stringify(pack)).toBe(before)
    expect(JSON.parse(JSON.stringify(record))).toEqual(record)
  })

  it("blocks incomplete review states before any workflow write", () => {
    const record = createVNextSubmissionStateRecord({
      templateId: "",
      documentRevision: -1,
      dataRevision: 1.5,
      workflowStatus: "approved",
    })

    expect(record.status).toBe("blocked")
    expect(record).toMatchObject({
      workflowStatus: "approved",
      templateId: null,
      submissionId: null,
      documentRevision: null,
      dataRevision: null,
      reviewerId: null,
      application: {
        status: "not-applied",
        packageMutation: "not-run",
        documentMutation: "not-run",
        dataMutation: "not-run",
        historyWrite: "not-written",
        storageWrite: "not-written",
        routeDispatch: "not-run",
        packageVersionChange: false,
      },
    })
    expect(record.issues).toEqual(expect.arrayContaining([
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

  it("keeps the submission state boundary independent from storage, DOM, routes, and package schema changes", () => {
    const sourceUrl = new URL("../src/workflow/submissionState.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")

    expect(source).toContain('storageWrite: "not-written"')
    expect(source).toContain('routeDispatch: "not-run"')
    expect(source).toContain("externalSubmissionState: true")
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
    expect(source).not.toContain("parseFlowDocPackage")
    expect(source).not.toContain("serializeFlowDocPackage")
    expect(source).not.toContain("runVNextTextTransaction")
    expect(source).not.toContain("runVNextOperation")
    expect(source).not.toContain("runVNextLayoutPipeline")
    expect(source).not.toContain("paginateVNextDocument")
  })

  it("documents the submission state boundary in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/SUBMISSION_STATE_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 91 implementation boundary.")
    expect(boundaryDoc).toContain("src/workflow/submissionState.ts")
    expect(boundaryDoc).toContain("This is a submission state boundary.")
    expect(boundaryDoc).toContain("It is not a workflow engine.")
    expect(boundaryDoc).toContain("externalSubmissionState = `true`")
    expect(readme).toContain("Submission state boundary")
    expect(readme).toContain("docs/SUBMISSION_STATE_BOUNDARY.md")
    expect(ledger).toContain("| 91 | Submission state boundary | done |")
    expect(roadmap).toContain("## Phase 91: Submission State Boundary")
  })
})
