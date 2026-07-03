export const VNEXT_SUBMISSION_IDENTITY_STATUS_SOURCE = "vnext-submission-identity-status"
export const VNEXT_SUBMISSION_IDENTITY_STATUS_MODE = "submission-identity-status-facts"

export type VNextSubmissionWorkflowStatus =
  | "not-started"
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"

export type VNextSubmissionStateStatus = "ready" | "blocked"

export type VNextSubmissionStateIssueCode =
  | "missing-template-id"
  | "invalid-document-revision"
  | "invalid-data-revision"
  | "missing-submission-id"
  | "missing-reviewer-id"

export interface VNextSubmissionStateIssue {
  severity: "error"
  code: VNextSubmissionStateIssueCode
  path: string
  message: string
}

export interface VNextSubmissionStateInput {
  templateId: string
  documentRevision?: number
  dataRevision?: number
  submissionId?: string
  workflowStatus?: VNextSubmissionWorkflowStatus
  actorId?: string
  reviewerId?: string
  reason?: string
}

export interface VNextSubmissionIdentityStatusFacts {
  status: VNextSubmissionStateStatus
  workflowStatus: VNextSubmissionWorkflowStatus
  templateId: string | null
  submissionId: string | null
  documentRevision: number | null
  dataRevision: number | null
  actorId: string | null
  reviewerId: string | null
  reason: string | null
  contracts: {
    submissionIdentityFacts: true
    externalWorkflowStatusFacts: true
    validationFacts: true
    externalSubmissionState: true
    packageMutation: false
    documentMutation: false
    dataMutation: false
    editorSession: false
    workflowEngine: false
    permissions: false
    approvalGates: false
    storageWrite: false
    routeDispatch: false
    notificationAudit: false
  }
}

export interface VNextSubmissionIdentityStatusRecord {
  source: typeof VNEXT_SUBMISSION_IDENTITY_STATUS_SOURCE
  mode: typeof VNEXT_SUBMISSION_IDENTITY_STATUS_MODE
  facts: VNextSubmissionIdentityStatusFacts
  issues: VNextSubmissionStateIssue[]
}

const REVIEW_STATUSES = new Set<VNextSubmissionWorkflowStatus>(["approved", "rejected"])
const SUBMISSION_ID_STATUSES = new Set<VNextSubmissionWorkflowStatus>(["submitted", "approved", "rejected"])

function nonEmptyString(value: string | undefined): string | null {
  return typeof value === "string" && value.length > 0 ? value : null
}

function revisionValue(value: number | undefined): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null
}

function issue(
  code: VNextSubmissionStateIssueCode,
  path: string,
  message: string,
): VNextSubmissionStateIssue {
  return {
    severity: "error",
    code,
    path,
    message,
  }
}

function revisionIssue(
  code: Extract<VNextSubmissionStateIssueCode, "invalid-document-revision" | "invalid-data-revision">,
  path: string,
  label: string,
  value: number | undefined,
): VNextSubmissionStateIssue[] {
  if (value == null || revisionValue(value) != null) return []
  return [issue(code, path, `${label} must be a non-negative integer`)]
}

function validationIssues(input: VNextSubmissionStateInput): VNextSubmissionStateIssue[] {
  const workflowStatus = input.workflowStatus ?? "not-started"
  const issues: VNextSubmissionStateIssue[] = []

  if (nonEmptyString(input.templateId) == null) {
    issues.push(issue("missing-template-id", "templateId", "submission state requires a template id"))
  }
  issues.push(...revisionIssue(
    "invalid-document-revision",
    "documentRevision",
    "document revision",
    input.documentRevision,
  ))
  issues.push(...revisionIssue(
    "invalid-data-revision",
    "dataRevision",
    "data revision",
    input.dataRevision,
  ))
  if (SUBMISSION_ID_STATUSES.has(workflowStatus) && nonEmptyString(input.submissionId) == null) {
    issues.push(issue(
      "missing-submission-id",
      "submissionId",
      `${workflowStatus} submission state requires a submission id`,
    ))
  }
  if (REVIEW_STATUSES.has(workflowStatus) && nonEmptyString(input.reviewerId) == null) {
    issues.push(issue(
      "missing-reviewer-id",
      "reviewerId",
      `${workflowStatus} submission state requires a reviewer id`,
    ))
  }

  return issues
}

export function createVNextSubmissionIdentityStatus(
  input: VNextSubmissionStateInput,
): VNextSubmissionIdentityStatusRecord {
  const issues = validationIssues(input)

  return {
    source: VNEXT_SUBMISSION_IDENTITY_STATUS_SOURCE,
    mode: VNEXT_SUBMISSION_IDENTITY_STATUS_MODE,
    facts: {
      status: issues.length === 0 ? "ready" : "blocked",
      workflowStatus: input.workflowStatus ?? "not-started",
      templateId: nonEmptyString(input.templateId),
      submissionId: nonEmptyString(input.submissionId),
      documentRevision: revisionValue(input.documentRevision),
      dataRevision: revisionValue(input.dataRevision),
      actorId: nonEmptyString(input.actorId),
      reviewerId: nonEmptyString(input.reviewerId),
      reason: nonEmptyString(input.reason),
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
    issues,
  }
}
