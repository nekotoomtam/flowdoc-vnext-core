import type { NearestContext } from "../graph/relationshipGraph.js"
import { buildRelationshipGraph } from "../graph/relationshipGraph.js"
import type { DataSnapshot, FieldDefinition, FieldRegistry } from "../persistence/package.js"
import type { DocumentNode, InlineNode, TextBlockNode } from "../schema/document.js"

export type VNextKeyDataDiagnosticsStatus = "ready" | "ready-with-warnings" | "blocked"
export type VNextKeyDataIssueSeverity = "error" | "warning"

export type VNextKeyDataIssueCode =
  | "duplicate-field-key"
  | "field-key-mismatch"
  | "missing-field-definition"
  | "non-inline-field-ref"
  | "unknown-data-key"
  | "invalid-data-value-type"
  | "unsupported-data-field-type"

export interface VNextFieldRefUsage {
  key: string
  fieldRefId: string
  textBlockId: string
  sectionId: string
  zoneId: string
  inlineIndex: number
  path: string
  label?: string
  fallback?: string
  tableId?: string
  tableRowId?: string
  tableCellId?: string
}

export interface VNextKeyDataIssue {
  severity: VNextKeyDataIssueSeverity
  code: VNextKeyDataIssueCode
  key: string
  path: string
  message: string
  fieldRefId?: string
  textBlockId?: string
  sectionId?: string
  zoneId?: string
  tableId?: string
  tableRowId?: string
  tableCellId?: string
}

export interface VNextKeyDataDiagnostics {
  source: "vnext-key-data-diagnostics"
  status: VNextKeyDataDiagnosticsStatus
  usages: VNextFieldRefUsage[]
  issues: VNextKeyDataIssue[]
  summary: {
    usageCount: number
    registryFieldCount: number
    dataKeyCount: number
    errorCount: number
    warningCount: number
    dataProvided: boolean
  }
}

const INLINE_FIELD_TYPES = new Set<FieldDefinition["type"]>([
  "text",
  "number",
  "date",
  "boolean",
  "enum",
])

function issue(
  code: VNextKeyDataIssueCode,
  severity: VNextKeyDataIssueSeverity,
  key: string,
  path: string,
  message: string,
  context: Partial<Omit<VNextKeyDataIssue, "code" | "severity" | "key" | "path" | "message">> = {},
): VNextKeyDataIssue {
  return {
    severity,
    code,
    key,
    path,
    message,
    ...context,
  }
}

function statusFromIssues(issues: readonly VNextKeyDataIssue[]): VNextKeyDataDiagnosticsStatus {
  if (issues.some((item) => item.severity === "error")) return "blocked"
  if (issues.some((item) => item.severity === "warning")) return "ready-with-warnings"
  return "ready"
}

function contextForUsage(context: NearestContext): Pick<VNextFieldRefUsage, "sectionId" | "zoneId" | "tableId" | "tableRowId" | "tableCellId"> {
  return {
    sectionId: context.sectionId,
    zoneId: context.zoneId,
    ...(context.tableId == null ? {} : { tableId: context.tableId }),
    ...(context.tableRowId == null ? {} : { tableRowId: context.tableRowId }),
    ...(context.tableCellId == null ? {} : { tableCellId: context.tableCellId }),
  }
}

function isFieldRef(inline: InlineNode): inline is Extract<InlineNode, { type: "field-ref" }> {
  return inline.type === "field-ref"
}

function collectTextBlockFieldRefs(
  textBlock: TextBlockNode,
  nearest: NearestContext,
  path: string,
): VNextFieldRefUsage[] {
  return textBlock.children.flatMap((inline, inlineIndex) => {
    if (!isFieldRef(inline)) return []

    return [{
      key: inline.key,
      fieldRefId: inline.id,
      textBlockId: textBlock.id,
      inlineIndex,
      path: `${path}.children[${inlineIndex}]`,
      ...contextForUsage(nearest),
      ...(inline.label == null ? {} : { label: inline.label }),
      ...(inline.fallback == null ? {} : { fallback: inline.fallback }),
    }]
  })
}

export function collectVNextDocumentFieldRefUsages(document: DocumentNode): VNextFieldRefUsage[] {
  const graph = buildRelationshipGraph(document)
  const usages: VNextFieldRefUsage[] = []

  document.document.sections.forEach((section, sectionIndex) => {
    Object.entries(section.nodes).forEach(([nodeKey, node]) => {
      if (node.type !== "text-block") return
      const nearest = graph.nearestByNodeId.get(node.id)
      if (nearest == null) return

      usages.push(...collectTextBlockFieldRefs(
        node,
        nearest,
        `document.sections[${sectionIndex}].nodes.${nodeKey}`,
      ))
    })
  })

  return usages
}

function registryDefinitions(registry: FieldRegistry): {
  definitionsByKey: Map<string, FieldDefinition>
  issues: VNextKeyDataIssue[]
} {
  const definitionsByKey = new Map<string, FieldDefinition>()
  const issues: VNextKeyDataIssue[] = []

  Object.entries(registry.fields).forEach(([recordKey, definition]) => {
    const path = `fields.fields.${recordKey}`

    if (definition.key !== recordKey) {
      issues.push(issue(
        "field-key-mismatch",
        "error",
        definition.key,
        `${path}.key`,
        `field definition key "${definition.key}" must match registry key "${recordKey}"`,
      ))
    }

    if (definitionsByKey.has(definition.key)) {
      issues.push(issue(
        "duplicate-field-key",
        "error",
        definition.key,
        `${path}.key`,
        `field registry contains duplicate field key "${definition.key}"`,
      ))
      return
    }

    definitionsByKey.set(definition.key, definition)
  })

  return { definitionsByKey, issues }
}

function validateUsage(
  usage: VNextFieldRefUsage,
  definition: FieldDefinition | undefined,
): VNextKeyDataIssue[] {
  if (definition == null) {
    return [issue(
      "missing-field-definition",
      "warning",
      usage.key,
      usage.path,
      `field-ref "${usage.fieldRefId}" references missing field key "${usage.key}"`,
      usage,
    )]
  }

  if (!INLINE_FIELD_TYPES.has(definition.type)) {
    return [issue(
      "non-inline-field-ref",
      "error",
      usage.key,
      usage.path,
      `field-ref "${usage.fieldRefId}" references non-inline ${definition.type} field "${usage.key}"`,
      usage,
    )]
  }

  return []
}

function expectedValueType(fieldType: FieldDefinition["type"]): string {
  if (fieldType === "number") return "number or null"
  if (fieldType === "boolean") return "boolean or null"
  if (fieldType === "image" || fieldType === "collection") return "not supported by scalar data snapshots"
  return "string or null"
}

function isValidScalarValue(definition: FieldDefinition, value: DataSnapshot["values"][string]): boolean {
  if (value == null) return true

  if (definition.type === "text" || definition.type === "date" || definition.type === "enum") {
    return typeof value === "string"
  }
  if (definition.type === "number") {
    return typeof value === "number" && Number.isFinite(value)
  }
  if (definition.type === "boolean") {
    return typeof value === "boolean"
  }

  return false
}

function validateDataSnapshot(
  data: DataSnapshot | undefined,
  definitionsByKey: ReadonlyMap<string, FieldDefinition>,
): VNextKeyDataIssue[] {
  if (data == null) return []

  return Object.entries(data.values).flatMap(([key, value]) => {
    const definition = definitionsByKey.get(key)
    const path = `data.values.${key}`

    if (definition == null) {
      return [issue(
        "unknown-data-key",
        "warning",
        key,
        path,
        `data snapshot contains unknown field key "${key}"`,
      )]
    }

    if (definition.type === "image" || definition.type === "collection") {
      return [issue(
        "unsupported-data-field-type",
        "error",
        key,
        path,
        `field "${key}" uses ${definition.type}, which is not supported by scalar data snapshots`,
      )]
    }

    if (!isValidScalarValue(definition, value)) {
      return [issue(
        "invalid-data-value-type",
        "error",
        key,
        path,
        `field "${key}" expects ${expectedValueType(definition.type)}`,
      )]
    }

    return []
  })
}

export function assessVNextKeyDataDiagnostics(
  document: DocumentNode,
  registry: FieldRegistry,
  data?: DataSnapshot,
): VNextKeyDataDiagnostics {
  const usages = collectVNextDocumentFieldRefUsages(document)
  const { definitionsByKey, issues: registryIssues } = registryDefinitions(registry)
  const usageIssues = usages.flatMap((usage) => validateUsage(usage, definitionsByKey.get(usage.key)))
  const dataIssues = validateDataSnapshot(data, definitionsByKey)
  const issues = [...registryIssues, ...usageIssues, ...dataIssues]
  const errorCount = issues.filter((item) => item.severity === "error").length
  const warningCount = issues.filter((item) => item.severity === "warning").length

  return {
    source: "vnext-key-data-diagnostics",
    status: statusFromIssues(issues),
    usages,
    issues,
    summary: {
      usageCount: usages.length,
      registryFieldCount: Object.keys(registry.fields).length,
      dataKeyCount: data == null ? 0 : Object.keys(data.values).length,
      errorCount,
      warningCount,
      dataProvided: data != null,
    },
  }
}
