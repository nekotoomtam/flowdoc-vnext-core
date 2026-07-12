import {
  safeParseVNextDerivedIdentityProvenanceV1,
  type VNextDerivedIdentityProvenanceV1,
  type VNextIdentityStandardIssue,
} from "./identityStandardV1.js"
import { createVNextIdentityAllocationInputKeyV1 } from "./identityAllocationInputV1.js"

export type VNextIdentityBatchAuditIssueCode =
  | "invalid-provenance"
  | "allocation-input-key-mismatch"
  | "duplicate-identity"
  | "identity-provenance-conflict"
  | "cross-scope-identity-reuse"
  | "allocation-input-identity-conflict"

export interface VNextIdentityBatchAuditIssue {
  code: VNextIdentityBatchAuditIssueCode
  message: string
  path: string
  severity: "error"
  recordIndexes: number[]
  identityId?: string
}

export type VNextIdentityBatchAuditResult =
  | {
      status: "ready"
      records: VNextDerivedIdentityProvenanceV1[]
      identityCount: number
      issues: []
    }
  | {
      status: "blocked"
      records: null
      identityCount: 0
      issues: VNextIdentityBatchAuditIssue[]
    }

function scopeKey(record: VNextDerivedIdentityProvenanceV1): string {
  return JSON.stringify(record.identity.scope)
}

function provenanceKey(record: VNextDerivedIdentityProvenanceV1): string {
  return JSON.stringify({
    origin: record.origin,
    allocationInputKey: record.allocationInputKey,
  })
}

function invalidIssue(index: number, issue: VNextIdentityStandardIssue): VNextIdentityBatchAuditIssue {
  return {
    code: "invalid-provenance",
    message: issue.message,
    path: `[${index}]${issue.path === "" ? "" : `.${issue.path}`}`,
    severity: "error",
    recordIndexes: [index],
  }
}

export function auditVNextDerivedIdentityBatchV1(
  values: readonly unknown[],
): VNextIdentityBatchAuditResult {
  const records: VNextDerivedIdentityProvenanceV1[] = []
  const sourceIndexes: number[] = []
  const issues: VNextIdentityBatchAuditIssue[] = []

  values.forEach((value, index) => {
    const result = safeParseVNextDerivedIdentityProvenanceV1(value)
    if (!result.ok) {
      issues.push(...result.issues.map((issue) => invalidIssue(index, issue)))
      return
    }

    const expectedKey = createVNextIdentityAllocationInputKeyV1(result.provenance.origin)
    if (result.provenance.allocationInputKey !== expectedKey) {
      issues.push({
        code: "allocation-input-key-mismatch",
        message: "allocationInputKey does not match the canonical structured origin",
        path: `[${index}].allocationInputKey`,
        severity: "error",
        recordIndexes: [index],
        identityId: result.provenance.identity.id,
      })
    }

    records.push(result.provenance)
    sourceIndexes.push(index)
  })

  const firstByIdentity = new Map<string, number>()
  const firstByScopedIdentity = new Map<string, number>()
  const firstByScopedAllocationInput = new Map<string, number>()

  records.forEach((record, recordIndex) => {
    const sourceIndex = sourceIndexes[recordIndex]
    const id = record.identity.id
    const scope = scopeKey(record)
    const scopedIdentity = `${scope}\u0000${id}`
    const scopedInput = `${scope}\u0000${record.allocationInputKey}`

    const identityFirstIndex = firstByIdentity.get(id)
    if (identityFirstIndex == null) {
      firstByIdentity.set(id, recordIndex)
    } else if (scopeKey(records[identityFirstIndex]) !== scope) {
      issues.push({
        code: "cross-scope-identity-reuse",
        message: "one allocated identity cannot be reused in a different uniqueness scope",
        path: `[${sourceIndex}].identity.id`,
        severity: "error",
        recordIndexes: [sourceIndexes[identityFirstIndex], sourceIndex],
        identityId: id,
      })
    }

    const scopedIdentityFirstIndex = firstByScopedIdentity.get(scopedIdentity)
    if (scopedIdentityFirstIndex == null) {
      firstByScopedIdentity.set(scopedIdentity, recordIndex)
    } else {
      const first = records[scopedIdentityFirstIndex]
      const sameProvenance = provenanceKey(first) === provenanceKey(record)
      issues.push({
        code: sameProvenance ? "duplicate-identity" : "identity-provenance-conflict",
        message: sameProvenance
          ? "allocated identity appears more than once in the same scope"
          : "allocated identity maps to different provenance in the same scope",
        path: `[${sourceIndex}].identity.id`,
        severity: "error",
        recordIndexes: [sourceIndexes[scopedIdentityFirstIndex], sourceIndex],
        identityId: id,
      })
    }

    const scopedInputFirstIndex = firstByScopedAllocationInput.get(scopedInput)
    if (scopedInputFirstIndex == null) {
      firstByScopedAllocationInput.set(scopedInput, recordIndex)
    } else if (records[scopedInputFirstIndex].identity.id !== id) {
      issues.push({
        code: "allocation-input-identity-conflict",
        message: "one canonical allocation input maps to different identities in the same scope",
        path: `[${sourceIndex}].allocationInputKey`,
        severity: "error",
        recordIndexes: [sourceIndexes[scopedInputFirstIndex], sourceIndex],
        identityId: id,
      })
    }
  })

  if (issues.length > 0) {
    return { status: "blocked", records: null, identityCount: 0, issues }
  }
  return { status: "ready", records, identityCount: records.length, issues: [] }
}
