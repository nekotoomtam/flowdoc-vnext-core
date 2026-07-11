import {
  validateVNextDocumentV4ImageTarget,
  type ImagePlacementV4Target,
} from "../schema/documentV4ImageTarget.js"
import type { DocumentNodeV4Target } from "../schema/documentV4Target.js"
import {
  validateVNextPackageV3ImageTarget,
  type DataSnapshotV2Value,
} from "./packageV3ImageTarget.js"
import type {
  FieldDefinitionV1V3,
  FlowDocPackageV3DocumentV4,
  FlowDocPackageV3ParseIssue,
} from "./packageV3.js"

export const VNEXT_PACKAGE_V3_DOCUMENT_V4_SOURCE = "vnext-package-v3-document-v4"

export interface VNextPackageV3ReferenceValidation {
  source: typeof VNEXT_PACKAGE_V3_DOCUMENT_V4_SOURCE
  status: "valid" | "blocked"
  issues: FlowDocPackageV3ParseIssue[]
  summary: {
    fieldRefCount: number
    imagePlacementCount: number
    dataKeyCount: number
    errorCount: number
  }
}

function referenceIssue(code: string, path: string, message: string): FlowDocPackageV3ParseIssue {
  return { source: "references", severity: "error", code, path, message }
}

function isImageDataValue(value: DataSnapshotV2Value): boolean {
  return typeof value === "object" && value != null && "kind" in value && value.kind === "image-asset-ref"
}

function scalarValueMatches(type: FieldDefinitionV1V3["type"], value: DataSnapshotV2Value): boolean {
  if (value === null) return true
  if (type === "text" || type === "date" || type === "enum") return typeof value === "string"
  if (type === "number") return typeof value === "number" && Number.isFinite(value)
  if (type === "boolean") return typeof value === "boolean"
  return false
}

function collectImagePlacements(document: DocumentNodeV4Target): {
  placements: ImagePlacementV4Target[]
  paths: string[]
} {
  const placements: ImagePlacementV4Target[] = []
  const paths: string[] = []

  document.document.sections.forEach((section, sectionIndex) => {
    Object.entries(section.nodes).forEach(([key, node]) => {
      const nodePath = `document.document.sections[${sectionIndex}].nodes.${key}`
      if (node.type === "image") {
        placements.push(node)
        paths.push(nodePath)
      }
      if (node.type === "text-block") {
        node.children.forEach((inline, inlineIndex) => {
          if (inline.type !== "inline-image") return
          placements.push(inline)
          paths.push(`${nodePath}.children[${inlineIndex}]`)
        })
      }
    })
  })

  return { placements, paths }
}

export function validateVNextPackageV3DocumentV4References(
  pack: FlowDocPackageV3DocumentV4,
): VNextPackageV3ReferenceValidation {
  const issues: FlowDocPackageV3ParseIssue[] = []
  let fieldRefCount = 0

  pack.document.document.sections.forEach((section, sectionIndex) => {
    Object.entries(section.nodes).forEach(([key, node]) => {
      if (node.type !== "text-block") return
      node.children.forEach((inline, inlineIndex) => {
        if (inline.type !== "field-ref") return
        fieldRefCount += 1
        const path = `document.document.sections[${sectionIndex}].nodes.${key}.children[${inlineIndex}].key`
        const field = pack.fields.fields[inline.key]
        if (field == null) {
          issues.push(referenceIssue(
            "missing-field-definition",
            path,
            `field-ref "${inline.id}" references missing field "${inline.key}"`,
          ))
        } else if (field.type === "image" || field.type === "collection") {
          issues.push(referenceIssue(
            "non-inline-field-ref",
            path,
            `field-ref "${inline.id}" cannot reference ${field.type} field "${inline.key}"`,
          ))
        }
      })
    })
  })

  const imagePlacements = collectImagePlacements(pack.document)
  const imageValidation = validateVNextDocumentV4ImageTarget(
    imagePlacements.placements,
    pack.assets,
    pack.fields,
    { placementPaths: imagePlacements.paths },
  )
  imageValidation.issues.forEach((item) => {
    issues.push(referenceIssue(item.code, item.path, item.message))
  })

  const imageDataValidation = validateVNextPackageV3ImageTarget(pack.assets, pack.fields, pack.data)
  imageDataValidation.issues.forEach((item) => {
    if (item.code === "unknown-image-field") return
    issues.push(referenceIssue(item.code, item.path, item.message))
  })

  Object.entries(pack.data?.values ?? {}).forEach(([key, value]) => {
    const field = pack.fields.fields[key]
    const path = `data.values.${key}`
    if (field == null) {
      issues.push(referenceIssue("unknown-data-key", path, `data value references missing field "${key}"`))
      return
    }
    if (isImageDataValue(value)) return
    if (field.type === "image") return
    if (field.type === "collection") {
      if (value !== null) {
        issues.push(referenceIssue(
          "unsupported-collection-data",
          path,
          `collection field "${key}" has no v2 data value contract`,
        ))
      }
      return
    }
    if (!scalarValueMatches(field.type, value)) {
      issues.push(referenceIssue(
        "invalid-data-value-type",
        path,
        `field "${key}" has an incompatible data value`,
      ))
    }
  })

  return {
    source: VNEXT_PACKAGE_V3_DOCUMENT_V4_SOURCE,
    status: issues.length === 0 ? "valid" : "blocked",
    issues,
    summary: {
      fieldRefCount,
      imagePlacementCount: imagePlacements.placements.length,
      dataKeyCount: Object.keys(pack.data?.values ?? {}).length,
      errorCount: issues.length,
    },
  }
}
