import {
  safeParseFlowDocPackageV2DocumentVNext,
  type FlowDocPackageV2DocumentVNext,
} from "../persistence/package.js"
import {
  safeParseFlowDocPackageV3DocumentV4,
  type FlowDocPackageV3DocumentV4,
} from "../persistence/packageV3.js"
import { auditVNextPackageV2ToV3Source } from "./packageV2ToV3Audit.js"
import {
  VNEXT_PACKAGE_V2_TO_V3_MIGRATION_CONTRACTS,
  VNEXT_PACKAGE_V2_TO_V3_MIGRATION_MODE,
  VNEXT_PACKAGE_V2_TO_V3_MIGRATION_SOURCE,
  type VNextPackageV2ToV3MigrationApplyResult,
  type VNextPackageV2ToV3MigrationChange,
  type VNextPackageV2ToV3MigrationIssue,
  type VNextPackageV2ToV3MigrationPlan,
  type VNextPackageV2ToV3MigrationSummary,
} from "./packageV2ToV3Types.js"

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function collectStrippedSourcePaths(source: unknown, parsed: unknown, path = ""): string[] {
  if (Array.isArray(source) && Array.isArray(parsed)) {
    return source.flatMap((item, index) => (
      index < parsed.length
        ? collectStrippedSourcePaths(item, parsed[index], `${path}[${index}]`)
        : []
    ))
  }
  if (!isRecord(source) || !isRecord(parsed)) return []

  return Object.entries(source).flatMap(([key, value]) => {
    const keyPath = path === "" ? key : `${path}.${key}`
    if (!Object.prototype.hasOwnProperty.call(parsed, key)) return [keyPath]
    return collectStrippedSourcePaths(value, parsed[key], keyPath)
  })
}

function emptySummary(): VNextPackageV2ToV3MigrationSummary {
  return {
    sectionCount: 0,
    nodeCount: 0,
    textBlockCount: 0,
    normalizedTextBlockCount: 0,
    textNormalizationCount: 0,
    errorCount: 0,
    warningCount: 0,
  }
}

function withIssueCounts(
  summary: Omit<VNextPackageV2ToV3MigrationSummary, "errorCount" | "warningCount">,
  issues: readonly VNextPackageV2ToV3MigrationIssue[],
): VNextPackageV2ToV3MigrationSummary {
  return {
    ...summary,
    errorCount: issues.filter((item) => item.severity === "error").length,
    warningCount: issues.filter((item) => item.severity === "warning").length,
  }
}

function basePlan(
  status: "ready" | "blocked",
  issues: VNextPackageV2ToV3MigrationIssue[],
  changes: VNextPackageV2ToV3MigrationChange[],
  summary: VNextPackageV2ToV3MigrationSummary,
  targetCandidate: FlowDocPackageV3DocumentV4 | null,
  sourceVersions: { packageVersion: 2 | null; documentVersion: 3 | null },
): VNextPackageV2ToV3MigrationPlan {
  return {
    source: VNEXT_PACKAGE_V2_TO_V3_MIGRATION_SOURCE,
    mode: VNEXT_PACKAGE_V2_TO_V3_MIGRATION_MODE,
    status,
    sourcePackageVersion: sourceVersions.packageVersion,
    sourceDocumentVersion: sourceVersions.documentVersion,
    targetPackageVersion: 3,
    targetDocumentVersion: 4,
    issues,
    changes,
    summary,
    contracts: VNEXT_PACKAGE_V2_TO_V3_MIGRATION_CONTRACTS,
    targetCandidate,
  }
}

function buildTargetCandidate(
  source: FlowDocPackageV2DocumentVNext,
  normalizedTextBlocks: Readonly<Record<string, import("../schema/document.js").TextBlockNode>>,
): unknown {
  const document = cloneJson(source.document) as unknown as {
    version: number
    document: FlowDocPackageV2DocumentVNext["document"]["document"]
  }
  document.version = 4
  document.document.sections.forEach((section) => {
    Object.entries(section.nodes).forEach(([key, node]) => {
      if (node.type !== "text-block") return
      const normalized = normalizedTextBlocks[node.id]
      if (normalized != null) section.nodes[key] = cloneJson(normalized)
    })
  })

  return {
    packageVersion: 3,
    kind: source.kind,
    id: source.id,
    meta: cloneJson(source.meta),
    document,
    assets: { version: 1, images: {} },
    fields: cloneJson(source.fields),
    ...(source.data == null
      ? {}
      : { data: { version: 2, values: cloneJson(source.data.values) } }),
  }
}

export function planVNextPackageV2ToV3Migration(value: unknown): VNextPackageV2ToV3MigrationPlan {
  const parsed = safeParseFlowDocPackageV2DocumentVNext(value)
  if (!parsed.ok) {
    const issues: VNextPackageV2ToV3MigrationIssue[] = parsed.issues.map((item) => ({
      source: "source-schema",
      severity: "error",
      code: item.code,
      path: item.path,
      message: item.message,
    }))
    return basePlan(
      "blocked",
      issues,
      [],
      { ...emptySummary(), errorCount: issues.length },
      null,
      { packageVersion: null, documentVersion: null },
    )
  }

  const source = parsed.package
  const audit = auditVNextPackageV2ToV3Source(source)
  const strippedIssues: VNextPackageV2ToV3MigrationIssue[] = collectStrippedSourcePaths(value, source).map((path) => ({
    source: "source-schema",
    severity: "error",
    code: "unknown-source-key",
    path,
    message: `source key "${path}" is not retained by the canonical v3 parser`,
  }))
  const changes: VNextPackageV2ToV3MigrationChange[] = [
    { kind: "package-version", path: "packageVersion", message: "change package version from 2 to 3" },
    { kind: "document-version", path: "document.version", message: "change document version from 3 to 4" },
    { kind: "add-empty-image-registry", path: "assets", message: "add empty image asset registry v1" },
    ...(source.data == null
      ? []
      : [{
          kind: "data-version" as const,
          path: "data.version",
          message: "change data snapshot version from 1 to 2",
        }]),
    ...audit.changes,
  ]

  if (!audit.structureValid) {
    const issues = [...strippedIssues, ...audit.issues]
    const summary = withIssueCounts(audit.summary, issues)
    return basePlan(
      "blocked",
      cloneJson(issues),
      cloneJson(changes),
      summary,
      null,
      { packageVersion: 2, documentVersion: 3 },
    )
  }

  const candidate = buildTargetCandidate(source, audit.normalizedTextBlocks)
  const target = safeParseFlowDocPackageV3DocumentV4(candidate)
  const targetIssues: VNextPackageV2ToV3MigrationIssue[] = target.ok
    ? []
    : target.issues.map((item) => ({
        source: "target-validation",
        severity: "error",
        code: item.code,
        path: item.path,
        message: item.message,
      }))
  const issues = [...strippedIssues, ...audit.issues, ...targetIssues]
  const summary = withIssueCounts(audit.summary, issues)

  if (!target.ok || issues.some((item) => item.severity === "error")) {
    return basePlan(
      "blocked",
      cloneJson(issues),
      cloneJson(changes),
      summary,
      null,
      { packageVersion: 2, documentVersion: 3 },
    )
  }

  return basePlan(
    "ready",
    cloneJson(issues),
    cloneJson(changes),
    summary,
    cloneJson(target.package),
    { packageVersion: 2, documentVersion: 3 },
  )
}

export function applyVNextPackageV2ToV3Migration(
  plan: VNextPackageV2ToV3MigrationPlan,
): VNextPackageV2ToV3MigrationApplyResult {
  if (plan.status !== "ready" || plan.targetCandidate == null) {
    return {
      source: VNEXT_PACKAGE_V2_TO_V3_MIGRATION_SOURCE,
      mode: VNEXT_PACKAGE_V2_TO_V3_MIGRATION_MODE,
      status: "blocked",
      issues: cloneJson(plan.issues),
      changes: cloneJson(plan.changes),
      package: null,
      contracts: VNEXT_PACKAGE_V2_TO_V3_MIGRATION_CONTRACTS,
    }
  }

  const parsed = safeParseFlowDocPackageV3DocumentV4(plan.targetCandidate)
  if (!parsed.ok) {
    const issues: VNextPackageV2ToV3MigrationIssue[] = parsed.issues.map((item) => ({
      source: "target-validation",
      severity: "error",
      code: item.code,
      path: item.path,
      message: item.message,
    }))
    return {
      source: VNEXT_PACKAGE_V2_TO_V3_MIGRATION_SOURCE,
      mode: VNEXT_PACKAGE_V2_TO_V3_MIGRATION_MODE,
      status: "blocked",
      issues,
      changes: cloneJson(plan.changes),
      package: null,
      contracts: VNEXT_PACKAGE_V2_TO_V3_MIGRATION_CONTRACTS,
    }
  }

  return {
    source: VNEXT_PACKAGE_V2_TO_V3_MIGRATION_SOURCE,
    mode: VNEXT_PACKAGE_V2_TO_V3_MIGRATION_MODE,
    status: "applied",
    issues: cloneJson(plan.issues),
    changes: cloneJson(plan.changes),
    package: cloneJson(parsed.package),
    contracts: VNEXT_PACKAGE_V2_TO_V3_MIGRATION_CONTRACTS,
  }
}
