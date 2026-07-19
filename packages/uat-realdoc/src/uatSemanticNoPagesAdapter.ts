import { createHash } from "node:crypto"
import { z } from "zod"
import {
  VNextDocumentInstanceIdentityV1Schema,
  VNextInstanceDataSnapshotV1Schema,
  VNextInstanceMediaSnapshotV1Schema,
  VNextTableCollectionSnapshotV1Schema,
  sameVNextPublishedStructureVersionRefV1,
  type DataSnapshotV2Value,
  type ImageAssetDefinition,
  type VNextDocumentInstanceIdentityV1,
  type VNextInstanceDataSnapshotV1,
  type VNextInstanceMediaSnapshotV1,
  type VNextTableCollectionItemV1,
  type VNextTableCollectionSnapshotV1,
} from "@flowdoc/vnext-core"
import {
  createFlowDocUatStructureDefinitionV1,
  flowDocUatPublishedStructureRefV1,
} from "./uatStructureDefinition.js"

export const FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_VERSION = 1 as const
export const FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_ID = "flowdoc-uat-semantic-no-pages-adapter-v1" as const

const NonBlankSchema = z.string().min(1).refine((value) => value.trim().length > 0, {
  message: "value must not be whitespace",
})
const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/u)
const SourceFingerprintSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/u)

const UatImageMetadataSchema = z.object({
  display_width: z.number().positive(),
  display_height: z.number().positive(),
  source_width: z.number().positive(),
  source_height: z.number().positive(),
  pixel_width: z.number().int().positive(),
  pixel_height: z.number().int().positive(),
}).strict()

const UatRequirementSchema = z.object({
  requirement_id: NonBlankSchema,
  feature_text: z.string(),
  feature_bullets: z.array(z.string()),
  element_types: z.array(NonBlankSchema),
  accept_status: z.string(),
  remark: z.string(),
  linked_screenshot_ids: z.array(NonBlankSchema),
}).strict()

const UatScreenshotSchema = z.object({
  screenshot_id: NonBlankSchema,
  file: NonBlankSchema,
  caption: z.string(),
  description: z.string(),
  scope: NonBlankSchema,
  linked_requirement_ids: z.array(NonBlankSchema),
  match_basis: NonBlankSchema,
  confidence: z.enum(["low", "medium", "high"]),
  image_metadata: UatImageMetadataSchema,
}).strict()

const UatSectionSchema = z.object({
  section_id: NonBlankSchema,
  section_number: NonBlankSchema,
  title: z.string(),
  description: z.string(),
  requirements: z.array(UatRequirementSchema),
  screenshots: z.array(UatScreenshotSchema),
  has_requirements: z.boolean(),
  screenshot_ids: z.array(NonBlankSchema),
}).strict()

const UatModuleSchema = z.object({
  module_id: NonBlankSchema,
  module_number: NonBlankSchema,
  title: z.string(),
  description: z.string(),
  sections: z.array(UatSectionSchema),
}).strict()

export const UatSemanticNoPagesDocumentV1Schema = z.object({
  document: z.object({
    title: z.string(),
    project: z.string(),
    version: z.string(),
    author: z.string(),
    updated_date: z.string(),
    source_file_name: NonBlankSchema,
    total_pages: z.number().int().positive(),
    extraction_schema: z.literal("uat_semantic_no_pages_v1"),
  }).strict(),
  modules: z.array(UatModuleSchema).min(1),
}).strict()

export const FlowDocUatImageResourceInputV1Schema = z.object({
  sourcePath: NonBlankSchema,
  mediaType: z.enum(["image/png", "image/jpeg"]),
  byteLength: z.number().int().positive(),
  sha256: Sha256Schema,
  pixelWidth: z.number().int().positive(),
  pixelHeight: z.number().int().positive(),
}).strict()

export const FlowDocUatSemanticNoPagesAdapterInputV1Schema = z.object({
  source: z.object({
    sourceSetId: NonBlankSchema,
    sourceBundleFingerprint: SourceFingerprintSchema,
    semanticMap: z.object({
      fileName: NonBlankSchema,
      byteLength: z.number().int().positive(),
      sha256: Sha256Schema,
    }).strict(),
  }).strict(),
  semanticDocument: UatSemanticNoPagesDocumentV1Schema,
  sectionNumber: NonBlankSchema,
  instance: VNextDocumentInstanceIdentityV1Schema,
  imageResources: z.array(FlowDocUatImageResourceInputV1Schema),
}).strict()

export type UatSemanticNoPagesDocumentV1 = z.infer<typeof UatSemanticNoPagesDocumentV1Schema>
export type FlowDocUatImageResourceInputV1 = z.infer<typeof FlowDocUatImageResourceInputV1Schema>
export type FlowDocUatSemanticNoPagesAdapterInputV1 = z.infer<
  typeof FlowDocUatSemanticNoPagesAdapterInputV1Schema
>

export interface FlowDocUatSourcePointerV1 {
  sourcePointer: string | null
  derivation: "copy" | "normalized-list" | "media-identity" | "default-empty"
}

export interface FlowDocUatSectionDataBundleV1 {
  contractVersion: typeof FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_VERSION
  kind: "uat-section-data-bundle"
  adapterId: typeof FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_ID
  sourceSet: {
    sourceSetId: string
    sourceBundleFingerprint: string
    semanticMap: { fileName: string; byteLength: number; sha256: string }
    selectedSectionNumber: string
    selectedImageResources: FlowDocUatImageResourceInputV1[]
  }
  structureVersion: ReturnType<typeof flowDocUatPublishedStructureRefV1>
  structureFingerprint: string
  instance: VNextDocumentInstanceIdentityV1
  dataSnapshot: VNextInstanceDataSnapshotV1
  collectionSnapshot: VNextTableCollectionSnapshotV1
  mediaSnapshot: VNextInstanceMediaSnapshotV1
  semantic: {
    module: { moduleId: string; moduleNumber: string; title: string; description: string }
    section: { sectionId: string; sectionNumber: string; title: string; description: string }
    requirements: Array<{
      requirementId: string
      featureBullets: string[]
      elementTypes: string[]
      linkedScreenshotIds: string[]
    }>
    screenshots: Array<{
      screenshotId: string
      file: string
      scope: string
      linkedRequirementIds: string[]
      matchBasis: string
      confidence: "low" | "medium" | "high"
    }>
    relations: {
      linkGranularity: "section-all-to-all" | "explicit-many-to-many"
      screenshotPlacement: "unresolved-source-order-only"
      screenshotOrder: string[]
    }
  }
  provenance: {
    scalars: Record<string, FlowDocUatSourcePointerV1>
    collections: Record<string, { items: Record<string, FlowDocUatSourcePointerV1> }>
    media: Record<string, FlowDocUatSourcePointerV1 & { screenshotId: string; sourcePath: string }>
  }
  ownership: {
    adapterOwns: ["source-shape-validation", "data-projection", "source-provenance"]
    adapterMustNotOwn: [
      "instance-allocation",
      "structure-layout",
      "screenshot-placement",
      "text-measurement",
      "pagination",
      "pdf-bytes",
    ]
  }
  execution: {
    materialization: "not-run"
    resolution: "not-run"
    measurement: "not-run"
    pagination: "not-run"
    pdfRendering: "not-run"
  }
  summary: {
    scalarValueCount: number
    requirementCount: number
    screenshotCount: number
    collectionItemCount: number
    mediaAssetCount: number
    featureTextCharacterCount: number
    sourceImageByteLength: number
    sourceImagePixelCount: number
  }
  warnings: FlowDocUatSectionDataBundleWarningV1[]
  bundleFingerprint: string
}

export interface FlowDocUatSectionDataBundleIssueV1 {
  code: string
  path: string
  message: string
  severity: "error"
}

export interface FlowDocUatSectionDataBundleWarningV1 {
  code: "page-geometry-unavailable" | "screenshot-placement-unresolved" | "section-all-to-all-links"
  path: string
  message: string
  severity: "warning"
}

export type FlowDocUatSectionDataBundleResultV1 =
  | {
      status: "ready-with-warnings"
      bundle: FlowDocUatSectionDataBundleV1
      issues: []
      warnings: FlowDocUatSectionDataBundleWarningV1[]
    }
  | {
      status: "blocked"
      bundle: null
      issues: FlowDocUatSectionDataBundleIssueV1[]
      warnings: []
    }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function pathString(path: readonly PropertyKey[]): string {
  return path.reduce<string>((current, segment) => (
    typeof segment === "number"
      ? `${current}[${segment}]`
      : current === "" ? String(segment) : `${current}.${String(segment)}`
  ), "")
}

function issue(code: string, path: string, message: string): FlowDocUatSectionDataBundleIssueV1 {
  return { code, path, message, severity: "error" }
}

function warning(
  code: FlowDocUatSectionDataBundleWarningV1["code"],
  path: string,
  message: string,
): FlowDocUatSectionDataBundleWarningV1 {
  return { code, path, message, severity: "warning" }
}

function fingerprint(value: unknown): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex")}`
}

function duplicateValues(values: readonly string[]): string[] {
  const seen = new Set<string>()
  const duplicate = new Set<string>()
  values.forEach((value) => seen.has(value) ? duplicate.add(value) : seen.add(value))
  return [...duplicate].sort()
}

function validateSourceSemantics(
  input: FlowDocUatSemanticNoPagesAdapterInputV1,
): {
  module: UatSemanticNoPagesDocumentV1["modules"][number] | null
  section: UatSemanticNoPagesDocumentV1["modules"][number]["sections"][number] | null
  resources: Map<string, FlowDocUatImageResourceInputV1>
  issues: FlowDocUatSectionDataBundleIssueV1[]
} {
  const issues: FlowDocUatSectionDataBundleIssueV1[] = []
  const sectionMatches = input.semanticDocument.modules.flatMap((module) => (
    module.sections
      .filter((section) => section.section_number === input.sectionNumber)
      .map((section) => ({ module, section }))
  ))
  if (sectionMatches.length !== 1) issues.push(issue(
    "section-selection-invalid",
    "sectionNumber",
    `section number must select exactly one section; found ${sectionMatches.length}`,
  ))
  const selected = sectionMatches[0] ?? null

  const allRequirements = input.semanticDocument.modules.flatMap((module) => (
    module.sections.flatMap((section) => section.requirements.map((requirement) => requirement.requirement_id))
  ))
  duplicateValues(allRequirements).forEach((id) => issues.push(issue(
    "duplicate-requirement-id", "semanticDocument.modules", `duplicate requirement id "${id}"`,
  )))
  const allScreenshots = input.semanticDocument.modules.flatMap((module) => (
    module.sections.flatMap((section) => section.screenshots.map((screenshot) => screenshot.screenshot_id))
  ))
  duplicateValues(allScreenshots).forEach((id) => issues.push(issue(
    "duplicate-screenshot-id", "semanticDocument.modules", `duplicate screenshot id "${id}"`,
  )))

  const resources = new Map<string, FlowDocUatImageResourceInputV1>()
  input.imageResources.forEach((resource, index) => {
    if (resources.has(resource.sourcePath)) issues.push(issue(
      "duplicate-image-resource", `imageResources[${index}].sourcePath`,
      `duplicate image resource path "${resource.sourcePath}"`,
    ))
    resources.set(resource.sourcePath, resource)
  })
  if (selected == null) return { module: null, section: null, resources, issues }

  const { section } = selected
  if (section.has_requirements !== (section.requirements.length > 0)) issues.push(issue(
    "section-requirement-flag-mismatch", "semanticDocument.modules.sections.has_requirements",
    "section has_requirements must match whether requirement records are present",
  ))
  const screenshotIds = section.screenshots.map((screenshot) => screenshot.screenshot_id)
  if (JSON.stringify(section.screenshot_ids) !== JSON.stringify(screenshotIds)) issues.push(issue(
    "section-screenshot-order-mismatch", "semanticDocument.modules.sections.screenshot_ids",
    "section screenshot_ids must equal screenshot records in source order",
  ))
  const requirementIds = new Set(section.requirements.map((requirement) => requirement.requirement_id))
  const screenshotIdSet = new Set(screenshotIds)

  section.requirements.forEach((requirement, requirementIndex) => {
    duplicateValues(requirement.linked_screenshot_ids).forEach((screenshotId) => issues.push(issue(
      "duplicate-linked-screenshot",
      `semanticDocument.section.requirements[${requirementIndex}].linked_screenshot_ids`,
      `requirement links screenshot "${screenshotId}" more than once`,
    )))
    requirement.linked_screenshot_ids.forEach((screenshotId, linkIndex) => {
      if (!screenshotIdSet.has(screenshotId)) issues.push(issue(
        "unknown-linked-screenshot",
        `semanticDocument.section.requirements[${requirementIndex}].linked_screenshot_ids[${linkIndex}]`,
        `requirement links unknown section screenshot "${screenshotId}"`,
      ))
      const screenshot = section.screenshots.find((candidate) => candidate.screenshot_id === screenshotId)
      if (screenshot != null && !screenshot.linked_requirement_ids.includes(requirement.requirement_id)) issues.push(issue(
        "non-reciprocal-screenshot-link",
        `semanticDocument.section.requirements[${requirementIndex}].linked_screenshot_ids[${linkIndex}]`,
        `screenshot "${screenshotId}" does not link back to "${requirement.requirement_id}"`,
      ))
    })
  })
  section.screenshots.forEach((screenshot, screenshotIndex) => {
    duplicateValues(screenshot.linked_requirement_ids).forEach((requirementId) => issues.push(issue(
      "duplicate-linked-requirement",
      `semanticDocument.section.screenshots[${screenshotIndex}].linked_requirement_ids`,
      `screenshot links requirement "${requirementId}" more than once`,
    )))
    screenshot.linked_requirement_ids.forEach((requirementId, linkIndex) => {
      if (!requirementIds.has(requirementId)) issues.push(issue(
        "unknown-linked-requirement",
        `semanticDocument.section.screenshots[${screenshotIndex}].linked_requirement_ids[${linkIndex}]`,
        `screenshot links unknown section requirement "${requirementId}"`,
      ))
      const requirement = section.requirements.find((candidate) => candidate.requirement_id === requirementId)
      if (requirement != null && !requirement.linked_screenshot_ids.includes(screenshot.screenshot_id)) issues.push(issue(
        "non-reciprocal-requirement-link",
        `semanticDocument.section.screenshots[${screenshotIndex}].linked_requirement_ids[${linkIndex}]`,
        `requirement "${requirementId}" does not link back to "${screenshot.screenshot_id}"`,
      ))
    })

    const resource = resources.get(screenshot.file)
    if (resource == null) issues.push(issue(
      "missing-image-resource", `semanticDocument.section.screenshots[${screenshotIndex}].file`,
      `missing trusted image resource for "${screenshot.file}"`,
    ))
    else if (
      resource.pixelWidth !== screenshot.image_metadata.pixel_width
      || resource.pixelHeight !== screenshot.image_metadata.pixel_height
    ) issues.push(issue(
      "image-metadata-mismatch", `imageResources.${screenshot.file}`,
      `trusted image dimensions do not match semantic metadata for "${screenshot.file}"`,
    ))
  })
  input.imageResources.forEach((resource, index) => {
    if (!section.screenshots.some((screenshot) => screenshot.file === resource.sourcePath)) issues.push(issue(
      "unexpected-image-resource", `imageResources[${index}].sourcePath`,
      `image resource "${resource.sourcePath}" does not belong to selected section ${section.section_number}`,
    ))
  })

  return { module: selected.module, section, resources, issues }
}

function allToAllLinks(
  section: UatSemanticNoPagesDocumentV1["modules"][number]["sections"][number],
): boolean {
  const requirementIds = [...section.requirements.map((requirement) => requirement.requirement_id)].sort()
  const screenshotIds = [...section.screenshots.map((screenshot) => screenshot.screenshot_id)].sort()
  return section.requirements.every((requirement) => (
    JSON.stringify([...requirement.linked_screenshot_ids].sort()) === JSON.stringify(screenshotIds)
  )) && section.screenshots.every((screenshot) => (
    JSON.stringify([...screenshot.linked_requirement_ids].sort()) === JSON.stringify(requirementIds)
  ))
}

function sourcePointer(
  semanticFileName: string,
  moduleIndex: number,
  sectionIndex: number,
  suffix: string,
): string {
  return `${semanticFileName}#/modules/${moduleIndex}/sections/${sectionIndex}/${suffix}`
}

function createBundle(
  input: FlowDocUatSemanticNoPagesAdapterInputV1,
  module: UatSemanticNoPagesDocumentV1["modules"][number],
  section: UatSemanticNoPagesDocumentV1["modules"][number]["sections"][number],
  resources: Map<string, FlowDocUatImageResourceInputV1>,
): Omit<FlowDocUatSectionDataBundleV1, "bundleFingerprint"> {
  const structure = createFlowDocUatStructureDefinitionV1()
  const semanticFileName = input.source.semanticMap.fileName
  const moduleIndex = input.semanticDocument.modules.indexOf(module)
  const sectionIndex = module.sections.indexOf(section)
  const scalarValues: Record<string, DataSnapshotV2Value> = {
    "uat.document.title": input.semanticDocument.document.title,
    "uat.document.project": input.semanticDocument.document.project,
    "uat.document.version": input.semanticDocument.document.version,
    "uat.document.author": input.semanticDocument.document.author,
    "uat.document.updated_date": input.semanticDocument.document.updated_date,
    "uat.document.source_file_name": input.semanticDocument.document.source_file_name,
    "uat.document.total_pages": input.semanticDocument.document.total_pages,
    "uat.module.number": module.module_number,
    "uat.module.title": module.title,
    "uat.module.description": module.description,
    "uat.section.number": section.section_number,
    "uat.section.title": section.title,
    "uat.section.description": section.description,
    "uat.approval.name": "",
    "uat.approval.date": "",
  }
  const scalarPointers: Record<string, FlowDocUatSourcePointerV1> = {
    "uat.document.title": { sourcePointer: `${semanticFileName}#/document/title`, derivation: "copy" },
    "uat.document.project": { sourcePointer: `${semanticFileName}#/document/project`, derivation: "copy" },
    "uat.document.version": { sourcePointer: `${semanticFileName}#/document/version`, derivation: "copy" },
    "uat.document.author": { sourcePointer: `${semanticFileName}#/document/author`, derivation: "copy" },
    "uat.document.updated_date": { sourcePointer: `${semanticFileName}#/document/updated_date`, derivation: "copy" },
    "uat.document.source_file_name": { sourcePointer: `${semanticFileName}#/document/source_file_name`, derivation: "copy" },
    "uat.document.total_pages": { sourcePointer: `${semanticFileName}#/document/total_pages`, derivation: "copy" },
    "uat.module.number": { sourcePointer: `${semanticFileName}#/modules/${moduleIndex}/module_number`, derivation: "copy" },
    "uat.module.title": { sourcePointer: `${semanticFileName}#/modules/${moduleIndex}/title`, derivation: "copy" },
    "uat.module.description": { sourcePointer: `${semanticFileName}#/modules/${moduleIndex}/description`, derivation: "copy" },
    "uat.section.number": { sourcePointer: sourcePointer(semanticFileName, moduleIndex, sectionIndex, "section_number"), derivation: "copy" },
    "uat.section.title": { sourcePointer: sourcePointer(semanticFileName, moduleIndex, sectionIndex, "title"), derivation: "copy" },
    "uat.section.description": { sourcePointer: sourcePointer(semanticFileName, moduleIndex, sectionIndex, "description"), derivation: "copy" },
    "uat.approval.name": { sourcePointer: null, derivation: "default-empty" },
    "uat.approval.date": { sourcePointer: null, derivation: "default-empty" },
  }

  const requirementItems: VNextTableCollectionItemV1[] = section.requirements.map((requirement) => ({
    itemKey: requirement.requirement_id,
    values: {
      requirement_id: requirement.requirement_id,
      feature_text: requirement.feature_text,
      element_types: requirement.element_types.join(", "),
      accept_status: requirement.accept_status,
      remark: requirement.remark,
      linked_screenshot_ids: requirement.linked_screenshot_ids.join(", "),
    },
  }))
  const images: Record<string, ImageAssetDefinition> = {}
  const screenshotItems: VNextTableCollectionItemV1[] = section.screenshots.map((screenshot) => {
    const resource = resources.get(screenshot.file)
    if (resource == null) throw new Error("validated resource missing")
    const assetId = `uat-image-${screenshot.screenshot_id}`
    images[assetId] = {
      id: assetId,
      kind: "image",
      mediaType: resource.mediaType,
      byteLength: resource.byteLength,
      digest: { algorithm: "sha256", value: resource.sha256 },
      intrinsic: { widthPx: resource.pixelWidth, heightPx: resource.pixelHeight },
    }
    return {
      itemKey: screenshot.screenshot_id,
      values: {
        screenshot_id: screenshot.screenshot_id,
        caption: screenshot.caption,
        description: screenshot.description,
        image: { kind: "image-asset-ref", assetId },
        linked_requirement_ids: screenshot.linked_requirement_ids.join(", "),
        match_basis: screenshot.match_basis,
        confidence: screenshot.confidence,
      },
    }
  })

  const instance = clone(input.instance)
  const dataSnapshot: VNextInstanceDataSnapshotV1 = {
    contractVersion: 1,
    kind: "instance-data-snapshot",
    dataSnapshotId: `${instance.instanceId}:uat:${section.section_number}:data`,
    instance,
    data: { version: 2, values: scalarValues },
  }
  const collectionSnapshot: VNextTableCollectionSnapshotV1 = {
    contractVersion: 1,
    kind: "table-collection-snapshot",
    collectionSnapshotId: `${instance.instanceId}:uat:${section.section_number}:collections`,
    snapshotRevision: 0,
    instance,
    collections: {
      "uat.requirements": { collectionFieldKey: "uat.requirements", items: requirementItems },
      "uat.screenshots": { collectionFieldKey: "uat.screenshots", items: screenshotItems },
    },
  }
  const mediaSnapshot: VNextInstanceMediaSnapshotV1 = {
    contractVersion: 1,
    kind: "instance-media-snapshot",
    mediaSnapshotId: `${instance.instanceId}:uat:${section.section_number}:media`,
    instance,
    registry: { version: 1, images },
  }
  VNextInstanceDataSnapshotV1Schema.parse(dataSnapshot)
  VNextTableCollectionSnapshotV1Schema.parse(collectionSnapshot)
  VNextInstanceMediaSnapshotV1Schema.parse(mediaSnapshot)

  const requirementProvenance = Object.fromEntries(section.requirements.map((requirement, index) => [
    requirement.requirement_id,
    { sourcePointer: sourcePointer(semanticFileName, moduleIndex, sectionIndex, `requirements/${index}`), derivation: "copy" as const },
  ]))
  const screenshotProvenance = Object.fromEntries(section.screenshots.map((screenshot, index) => [
    screenshot.screenshot_id,
    { sourcePointer: sourcePointer(semanticFileName, moduleIndex, sectionIndex, `screenshots/${index}`), derivation: "copy" as const },
  ]))
  const mediaProvenance = Object.fromEntries(section.screenshots.map((screenshot, index) => {
    const assetId = `uat-image-${screenshot.screenshot_id}`
    return [assetId, {
      sourcePointer: sourcePointer(semanticFileName, moduleIndex, sectionIndex, `screenshots/${index}/file`),
      derivation: "media-identity" as const,
      screenshotId: screenshot.screenshot_id,
      sourcePath: screenshot.file,
    }]
  }))
  const linkGranularity = allToAllLinks(section) ? "section-all-to-all" as const : "explicit-many-to-many" as const
  const warnings: FlowDocUatSectionDataBundleWarningV1[] = [
    warning(
      "page-geometry-unavailable", "sourceSet.semanticMap",
      "page-free semantic input cannot supply authored page or placement geometry",
    ),
    warning(
      "screenshot-placement-unresolved", "semantic.relations.screenshotPlacement",
      "screenshot source order is retained but exact requirement insertion points are unavailable",
    ),
    ...(linkGranularity === "section-all-to-all" ? [warning(
      "section-all-to-all-links", "semantic.relations.linkGranularity",
      "every selected requirement links every selected screenshot; links prove section relation only",
    )] : []),
  ]

  return {
    contractVersion: FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_VERSION,
    kind: "uat-section-data-bundle",
    adapterId: FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_ID,
    sourceSet: {
      ...clone(input.source),
      selectedSectionNumber: section.section_number,
      selectedImageResources: section.screenshots.map((screenshot) => clone(resources.get(screenshot.file)!)),
    },
    structureVersion: flowDocUatPublishedStructureRefV1(),
    structureFingerprint: structure.structureFingerprint,
    instance,
    dataSnapshot,
    collectionSnapshot,
    mediaSnapshot,
    semantic: {
      module: {
        moduleId: module.module_id,
        moduleNumber: module.module_number,
        title: module.title,
        description: module.description,
      },
      section: {
        sectionId: section.section_id,
        sectionNumber: section.section_number,
        title: section.title,
        description: section.description,
      },
      requirements: section.requirements.map((requirement) => ({
        requirementId: requirement.requirement_id,
        featureBullets: clone(requirement.feature_bullets),
        elementTypes: clone(requirement.element_types),
        linkedScreenshotIds: clone(requirement.linked_screenshot_ids),
      })),
      screenshots: section.screenshots.map((screenshot) => ({
        screenshotId: screenshot.screenshot_id,
        file: screenshot.file,
        scope: screenshot.scope,
        linkedRequirementIds: clone(screenshot.linked_requirement_ids),
        matchBasis: screenshot.match_basis,
        confidence: screenshot.confidence,
      })),
      relations: {
        linkGranularity,
        screenshotPlacement: "unresolved-source-order-only",
        screenshotOrder: clone(section.screenshot_ids),
      },
    },
    provenance: {
      scalars: scalarPointers,
      collections: {
        "uat.requirements": { items: requirementProvenance },
        "uat.screenshots": { items: screenshotProvenance },
      },
      media: mediaProvenance,
    },
    ownership: {
      adapterOwns: ["source-shape-validation", "data-projection", "source-provenance"],
      adapterMustNotOwn: [
        "instance-allocation", "structure-layout", "screenshot-placement",
        "text-measurement", "pagination", "pdf-bytes",
      ],
    },
    execution: {
      materialization: "not-run",
      resolution: "not-run",
      measurement: "not-run",
      pagination: "not-run",
      pdfRendering: "not-run",
    },
    summary: {
      scalarValueCount: Object.keys(scalarValues).length,
      requirementCount: requirementItems.length,
      screenshotCount: screenshotItems.length,
      collectionItemCount: requirementItems.length + screenshotItems.length,
      mediaAssetCount: Object.keys(images).length,
      featureTextCharacterCount: section.requirements.reduce((sum, requirement) => sum + requirement.feature_text.length, 0),
      sourceImageByteLength: section.screenshots.reduce((sum, screenshot) => sum + resources.get(screenshot.file)!.byteLength, 0),
      sourceImagePixelCount: section.screenshots.reduce((sum, screenshot) => {
        const resource = resources.get(screenshot.file)!
        return sum + resource.pixelWidth * resource.pixelHeight
      }, 0),
    },
    warnings,
  }
}

export function adaptFlowDocUatSemanticNoPagesSectionV1(
  value: unknown,
): FlowDocUatSectionDataBundleResultV1 {
  const parsed = FlowDocUatSemanticNoPagesAdapterInputV1Schema.safeParse(value)
  if (!parsed.success) return {
    status: "blocked",
    bundle: null,
    issues: parsed.error.issues.map((item) => issue(item.code, pathString(item.path), item.message)),
    warnings: [],
  }

  const input = parsed.data
  const expectedStructureVersion = flowDocUatPublishedStructureRefV1()
  if (!sameVNextPublishedStructureVersionRefV1(input.instance.structureVersion, expectedStructureVersion)) return {
    status: "blocked",
    bundle: null,
    issues: [issue(
      "structure-version-mismatch", "instance.structureVersion",
      "UAT adapter input must pin the accepted UAT Published Structure Version",
    )],
    warnings: [],
  }

  const semantic = validateSourceSemantics(input)
  if (semantic.issues.length > 0 || semantic.module == null || semantic.section == null) return {
    status: "blocked",
    bundle: null,
    issues: semantic.issues,
    warnings: [],
  }

  const unsigned = createBundle(input, semantic.module, semantic.section, semantic.resources)
  const bundle: FlowDocUatSectionDataBundleV1 = {
    ...unsigned,
    bundleFingerprint: fingerprint(unsigned),
  }
  return {
    status: "ready-with-warnings",
    bundle,
    issues: [],
    warnings: clone(bundle.warnings),
  }
}
