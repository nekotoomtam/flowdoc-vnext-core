import { z } from "zod"
import { buildRelationshipGraph } from "../graph/relationshipGraph.js"
import {
  InlineNodeSchema,
  type InlineNode,
} from "../schema/document.js"
import {
  safeParseFlowDocPackageV2DocumentVNext,
  type FlowDocPackageParseIssue,
  type FlowDocPackageV2DocumentVNext,
} from "../persistence/package.js"
import type { VNextStorageRecordKind } from "../persistence/storageAdapter.js"

export const VNEXT_VERTICAL_SLICE_SCENARIO_SOURCE = "vnext-vertical-slice-scenario"
export const VNEXT_VERTICAL_SLICE_SCENARIO_MODE = "fixture-fed-rc-scenario-boundary"

export type VNextVerticalSliceScenarioStatus = "ready" | "blocked"

export interface VNextVerticalSliceScenarioIssue {
  severity: "error"
  code: string
  path: string
  message: string
}

export interface VNextVerticalSliceScenarioDefinition {
  scenarioVersion: 1
  scenarioId: string
  packageFixture: string
  packageId: string
  rcId: string
  sessionId: string
  measurementProfileId: string
  rendererProfileId: string
  artifactId: string
  intendedEdit: {
    operationKind: "text-block.rich-inline.replace"
    targetTextBlockId: string
    replacementChildren: readonly InlineNode[]
  }
  fieldChip: {
    inlineId: string
    fieldKey: string
  }
  expected: {
    exactGeneration: "stale"
    artifactFormat: "pdf"
    storageCollectionsTouched: readonly VNextStorageRecordKind[]
  }
}

export interface VNextVerticalSliceScenarioSeed {
  rcId: string
  scenarioId: string
  packageId: string
  sessionId: string
  measurementProfileId: string
  rendererProfileId: string
  artifactId: string
  packageVersion: 2
  documentVersion: 3
  operationKind: "text-block.rich-inline.replace"
  targetTextBlockId: string
  replacementInlineCount: number
  fieldRefKeys: readonly string[]
  expectedExactGeneration: "stale"
  expectedArtifactFormat: "pdf"
  expectedStorageCollectionsTouched: readonly VNextStorageRecordKind[]
}

export interface VNextVerticalSliceScenarioPlan {
  source: typeof VNEXT_VERTICAL_SLICE_SCENARIO_SOURCE
  mode: typeof VNEXT_VERTICAL_SLICE_SCENARIO_MODE
  status: VNextVerticalSliceScenarioStatus
  issues: readonly VNextVerticalSliceScenarioIssue[]
  scenario: VNextVerticalSliceScenarioDefinition | null
  packageSummary: {
    packageId: string
    packageVersion: 2
    documentVersion: 3
    sectionCount: number
    fieldCount: number
  } | null
  rcReportSeed: VNextVerticalSliceScenarioSeed | null
  contracts: {
    fixtureFed: true
    canonicalPackageOnly: true
    jsonSafe: true
    fileReads: false
    storageWrites: false
    browserApis: false
    serverRoute: false
    externalPackageImports: false
    packageSchemaChange: false
  }
}

const StorageCollectionSchema = z.enum([
  "package-session",
  "durable-history",
  "rich-inline-session",
  "artifact-manifest",
  "artifact-job",
])

const ScenarioSchema = z.object({
  scenarioVersion: z.literal(1),
  scenarioId: z.string().min(1),
  packageFixture: z.string().min(1),
  packageId: z.string().min(1),
  rcId: z.string().min(1),
  sessionId: z.string().min(1),
  measurementProfileId: z.string().min(1),
  rendererProfileId: z.string().min(1),
  artifactId: z.string().min(1),
  intendedEdit: z.object({
    operationKind: z.literal("text-block.rich-inline.replace"),
    targetTextBlockId: z.string().min(1),
    replacementChildren: z.array(InlineNodeSchema).min(1),
  }),
  fieldChip: z.object({
    inlineId: z.string().min(1),
    fieldKey: z.string().min(1),
  }),
  expected: z.object({
    exactGeneration: z.literal("stale"),
    artifactFormat: z.literal("pdf"),
    storageCollectionsTouched: z.array(StorageCollectionSchema).min(1),
  }),
})

export function createVNextVerticalSliceScenarioPlan(
  packageInput: unknown,
  scenarioInput: unknown,
): VNextVerticalSliceScenarioPlan {
  const issues: VNextVerticalSliceScenarioIssue[] = []
  const packageResult = safeParseFlowDocPackageV2DocumentVNext(packageInput)
  const scenarioResult = ScenarioSchema.safeParse(scenarioInput)

  if (!packageResult.ok) {
    issues.push(...packageResult.issues.map(packageIssue))
  }
  if (!scenarioResult.success) {
    issues.push(...scenarioResult.error.issues.map(zodIssue))
  }

  if (!packageResult.ok || !scenarioResult.success) {
    return plan(null, null, null, issues)
  }

  const pack = packageResult.package
  const scenario = scenarioResult.data
  validateScenarioReferences(pack, scenario, issues)

  const seed = issues.length > 0 ? null : createSeed(pack, scenario)
  const summary = issues.length > 0 ? null : {
    packageId: pack.id,
    packageVersion: pack.packageVersion,
    documentVersion: pack.document.version,
    sectionCount: pack.document.document.sections.length,
    fieldCount: Object.keys(pack.fields.fields).length,
  }

  return plan(scenario, summary, seed, issues)
}

function validateScenarioReferences(
  pack: FlowDocPackageV2DocumentVNext,
  scenario: VNextVerticalSliceScenarioDefinition,
  issues: VNextVerticalSliceScenarioIssue[],
): void {
  if (scenario.packageId !== pack.id) {
    issues.push(issue("package-id-mismatch", "packageId", "scenario packageId must match the canonical package id"))
  }

  const graph = buildRelationshipGraph(pack.document)
  const target = graph.nodesById.get(scenario.intendedEdit.targetTextBlockId)
  if (target == null) {
    issues.push(issue("target-not-found", "intendedEdit.targetTextBlockId", "scenario target text-block was not found"))
  } else if (target.type !== "text-block") {
    issues.push(issue("target-not-text-block", "intendedEdit.targetTextBlockId", "scenario target must be a text-block"))
  }

  const inlineIds = new Set<string>()
  for (const [index, child] of scenario.intendedEdit.replacementChildren.entries()) {
    if (child.type !== "text" && child.type !== "field-ref") {
      issues.push(issue("unsupported-rich-inline-child", `intendedEdit.replacementChildren[${index}].type`, "RC rich inline replacement accepts only text and field-ref children"))
    }
    if (inlineIds.has(child.id)) {
      issues.push(issue("duplicate-inline-id", `intendedEdit.replacementChildren[${index}].id`, "replacement inline ids must be unique"))
    }
    inlineIds.add(child.id)
    if (child.type === "field-ref" && pack.fields.fields[child.key] == null) {
      issues.push(issue("unknown-field-key", `intendedEdit.replacementChildren[${index}].key`, "replacement field-ref key must exist in the package field registry"))
    }
  }

  if (!inlineIds.has(scenario.fieldChip.inlineId)) {
    issues.push(issue("field-chip-inline-missing", "fieldChip.inlineId", "fieldChip inlineId must be present in replacementChildren"))
  }
  if (pack.fields.fields[scenario.fieldChip.fieldKey] == null) {
    issues.push(issue("unknown-field-chip-key", "fieldChip.fieldKey", "fieldChip fieldKey must exist in the package field registry"))
  }
}

function createSeed(
  pack: FlowDocPackageV2DocumentVNext,
  scenario: VNextVerticalSliceScenarioDefinition,
): VNextVerticalSliceScenarioSeed {
  const fieldRefKeys = scenario.intendedEdit.replacementChildren.flatMap((child) => child.type === "field-ref" ? [child.key] : [])

  return {
    rcId: scenario.rcId,
    scenarioId: scenario.scenarioId,
    packageId: pack.id,
    sessionId: scenario.sessionId,
    measurementProfileId: scenario.measurementProfileId,
    rendererProfileId: scenario.rendererProfileId,
    artifactId: scenario.artifactId,
    packageVersion: pack.packageVersion,
    documentVersion: pack.document.version,
    operationKind: scenario.intendedEdit.operationKind,
    targetTextBlockId: scenario.intendedEdit.targetTextBlockId,
    replacementInlineCount: scenario.intendedEdit.replacementChildren.length,
    fieldRefKeys,
    expectedExactGeneration: scenario.expected.exactGeneration,
    expectedArtifactFormat: scenario.expected.artifactFormat,
    expectedStorageCollectionsTouched: scenario.expected.storageCollectionsTouched,
  }
}

function plan(
  scenario: VNextVerticalSliceScenarioDefinition | null,
  packageSummary: VNextVerticalSliceScenarioPlan["packageSummary"],
  rcReportSeed: VNextVerticalSliceScenarioSeed | null,
  issues: readonly VNextVerticalSliceScenarioIssue[],
): VNextVerticalSliceScenarioPlan {
  return {
    source: VNEXT_VERTICAL_SLICE_SCENARIO_SOURCE,
    mode: VNEXT_VERTICAL_SLICE_SCENARIO_MODE,
    status: issues.length > 0 ? "blocked" : "ready",
    issues,
    scenario,
    packageSummary,
    rcReportSeed,
    contracts: {
      fixtureFed: true,
      canonicalPackageOnly: true,
      jsonSafe: true,
      fileReads: false,
      storageWrites: false,
      browserApis: false,
      serverRoute: false,
      externalPackageImports: false,
      packageSchemaChange: false,
    },
  }
}

function packageIssue(input: FlowDocPackageParseIssue): VNextVerticalSliceScenarioIssue {
  return issue(input.code, `package.${input.path}`, input.message)
}

function zodIssue(input: z.core.$ZodIssue): VNextVerticalSliceScenarioIssue {
  return issue(input.code, path(input.path), input.message)
}

function issue(code: string, path: string, message: string): VNextVerticalSliceScenarioIssue {
  return {
    severity: "error",
    code,
    path,
    message,
  }
}

function path(segments: readonly unknown[]): string {
  return segments.reduce<string>((current, segment) => {
    const key = typeof segment === "number" ? `[${segment}]` : `${current.length === 0 ? "" : "."}${String(segment)}`
    return `${current}${key}`
  }, "")
}
