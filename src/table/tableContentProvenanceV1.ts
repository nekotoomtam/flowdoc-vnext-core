import type { VNextDerivedIdentityProvenanceV1 } from "../identity/identityStandardV1.js"
import type { VNextTableContentMaterializationIssue } from "./tableContentMaterializationContractV1.js"

export interface VNextTableContentResolutionScopeV1 {
  instanceId: string
  instanceRevision: number
  resolutionInputFingerprint: string
}

export interface VNextTableContentProvenanceExpectationV1 {
  identityKind: "resolved-row" | "resolved-cell" | "resolved-node" | "resolved-inline"
  originKind: "collection-row" | "resolved-cell" | "resolved-node" | "resolved-inline"
  refs: Readonly<Record<string, string>>
  revisionPins: Readonly<Record<string, number>>
  path: string
}

function exactRecord(
  actual: Readonly<Record<string, string | number>>,
  expected: Readonly<Record<string, string | number>>,
): boolean {
  const actualKeys = Object.keys(actual).sort()
  const expectedKeys = Object.keys(expected).sort()
  return actualKeys.length === expectedKeys.length
    && actualKeys.every((key, index) => key === expectedKeys[index] && actual[key] === expected[key])
}

function identityIssue(
  code: string,
  path: string,
  message: string,
): VNextTableContentMaterializationIssue {
  return { source: "identity", code, path, message, severity: "error" }
}

export function validateVNextTableContentProvenanceV1(
  provenance: VNextDerivedIdentityProvenanceV1,
  expected: VNextTableContentProvenanceExpectationV1,
  resolutionScope: VNextTableContentResolutionScopeV1,
): VNextTableContentMaterializationIssue[] {
  const issues: VNextTableContentMaterializationIssue[] = []
  if (provenance.identity.identityKind !== expected.identityKind) issues.push(identityIssue(
    "content-identity-kind-mismatch",
    `${expected.path}.identity.identityKind`,
    `expected ${expected.identityKind} identity`,
  ))
  const scope = provenance.identity.scope
  if (
    scope.kind !== "document-resolution"
    || scope.documentInstanceId !== resolutionScope.instanceId
    || scope.instanceRevision !== resolutionScope.instanceRevision
    || scope.resolutionInputFingerprint !== resolutionScope.resolutionInputFingerprint
  ) issues.push(identityIssue(
    "content-identity-scope-mismatch",
    `${expected.path}.identity.scope`,
    "content identity must use the exact resolved row document-resolution scope",
  ))
  if (provenance.origin.kind !== expected.originKind) issues.push(identityIssue(
    "content-origin-kind-mismatch",
    `${expected.path}.origin.kind`,
    `expected ${expected.originKind} origin`,
  ))
  if (!exactRecord(provenance.origin.refs, expected.refs)) issues.push(identityIssue(
    "content-origin-refs-mismatch",
    `${expected.path}.origin.refs`,
    "content identity origin references do not match the source graph occurrence",
  ))
  if (!exactRecord(provenance.origin.revisionPins, expected.revisionPins)) issues.push(identityIssue(
    "content-origin-revisions-mismatch",
    `${expected.path}.origin.revisionPins`,
    "content identity revision pins do not match the resolved row input",
  ))
  return issues
}
