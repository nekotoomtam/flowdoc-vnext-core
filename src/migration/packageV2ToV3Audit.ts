import { buildRelationshipGraph } from "../graph/relationshipGraph.js"
import type { FlowDocPackageV2DocumentVNext } from "../persistence/package.js"
import type { TextBlockNode } from "../schema/document.js"
import { DocumentAssertionError } from "../errors.js"
import { planVNextTextBlockV1Normalization } from "../authoring/textBlockV1Grammar.js"
import type {
  VNextPackageV2ToV3MigrationChange,
  VNextPackageV2ToV3MigrationIssue,
} from "./packageV2ToV3Types.js"

export interface VNextPackageV2ToV3SourceAudit {
  status: "ready" | "blocked"
  structureValid: boolean
  issues: VNextPackageV2ToV3MigrationIssue[]
  changes: VNextPackageV2ToV3MigrationChange[]
  normalizedTextBlocks: Record<string, TextBlockNode>
  summary: {
    sectionCount: number
    nodeCount: number
    textBlockCount: number
    normalizedTextBlockCount: number
    textNormalizationCount: number
  }
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function auditVNextPackageV2ToV3Source(
  pack: FlowDocPackageV2DocumentVNext,
): VNextPackageV2ToV3SourceAudit {
  const issues: VNextPackageV2ToV3MigrationIssue[] = []
  const changes: VNextPackageV2ToV3MigrationChange[] = []
  const normalizedTextBlocks: Record<string, TextBlockNode> = {}
  const nodeCount = pack.document.document.sections.reduce(
    (total, section) => total + Object.keys(section.nodes).length,
    0,
  )

  let graph
  try {
    graph = buildRelationshipGraph(pack.document)
  } catch (error) {
    if (!(error instanceof DocumentAssertionError)) throw error
    error.issues.forEach((item) => {
      issues.push({
        source: "source-structure",
        severity: "error",
        code: "invalid-source-structure",
        path: `document.${item.path}`,
        message: item.message,
      })
    })
    return {
      status: "blocked",
      structureValid: false,
      issues,
      changes,
      normalizedTextBlocks,
      summary: {
        sectionCount: pack.document.document.sections.length,
        nodeCount,
        textBlockCount: 0,
        normalizedTextBlockCount: 0,
        textNormalizationCount: 0,
      },
    }
  }

  const sectionIndexById = new Map(
    pack.document.document.sections.map((section, index) => [section.id, index]),
  )
  let textBlockCount = 0
  let normalizedTextBlockCount = 0

  graph.nodesById.forEach((node) => {
    if (node.type !== "text-block") return
    textBlockCount += 1
    const sectionId = graph.sectionByNodeId.get(node.id)
    const sectionIndex = sectionId == null ? undefined : sectionIndexById.get(sectionId)
    const zoneId = graph.zoneByNodeId.get(node.id)
    const zone = zoneId == null ? undefined : graph.zonesById.get(zoneId)
    if (sectionIndex == null || zone == null) {
      issues.push({
        source: "source-structure",
        severity: "error",
        code: "missing-text-context",
        path: "document.document.sections",
        message: `text-block "${node.id}" has no reachable section and zone context`,
        nodeId: node.id,
      })
      return
    }

    const nodePath = `document.document.sections[${sectionIndex}].nodes.${node.id}`
    const plan = planVNextTextBlockV1Normalization(node, {
      fieldRegistry: pack.fields,
      zoneRole: zone.role,
    })
    plan.validation.issues.forEach((item) => {
      issues.push({
        source: "text-grammar",
        severity: item.severity,
        code: item.code,
        path: `${nodePath}.${item.path}`,
        message: item.message,
        nodeId: node.id,
        ...(item.inlineId == null ? {} : { inlineId: item.inlineId }),
      })
    })

    if (plan.normalizedTextBlock != null) {
      normalizedTextBlocks[node.id] = cloneJson(plan.normalizedTextBlock)
    }
    if (plan.status !== "ready") return

    normalizedTextBlockCount += 1
    plan.changes.forEach((change) => {
      const sourceIndex = node.children.findIndex((child) => child.id === change.sourceInlineId)
      changes.push({
        kind: change.kind,
        path: sourceIndex < 0 ? `${nodePath}.children` : `${nodePath}.children[${sourceIndex}]`,
        message: change.kind === "remove-empty-text"
          ? `remove empty text inline "${change.sourceInlineId}"`
          : `split raw line breaks in inline "${change.sourceInlineId}"`,
        nodeId: node.id,
        sourceInlineId: change.sourceInlineId,
        producedInlineIds: [...change.producedInlineIds],
      })
    })
  })

  return {
    status: issues.some((item) => item.severity === "error") ? "blocked" : "ready",
    structureValid: true,
    issues,
    changes,
    normalizedTextBlocks,
    summary: {
      sectionCount: pack.document.document.sections.length,
      nodeCount,
      textBlockCount,
      normalizedTextBlockCount,
      textNormalizationCount: changes.length,
    },
  }
}
