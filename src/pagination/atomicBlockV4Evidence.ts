import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import type { VNextResolvedImageBindingV1 } from "../resolution/resolvedDocument.js"
import type { UnitValueV4Target } from "../schema/documentV4Foundation.js"
import {
  AuthoredNodeV4TargetSchema,
  type AuthoredNodeV4Target,
} from "../schema/documentV4Target.js"

export const VNEXT_ATOMIC_BLOCK_V4_EVIDENCE_SOURCE = "vnext-atomic-block-v4-evidence"
export const VNEXT_ATOMIC_BLOCK_V4_EVIDENCE_VERSION = 1 as const

type AtomicNode = Extract<AuthoredNodeV4Target, { type: "page-break" | "divider" | "spacer" | "image" }>

interface EvidenceBase {
  source: typeof VNEXT_ATOMIC_BLOCK_V4_EVIDENCE_SOURCE
  contractVersion: typeof VNEXT_ATOMIC_BLOCK_V4_EVIDENCE_VERSION
  nodeId: string
  availableWidthPt: number
  extentPt: number
  fingerprint: string
}

export type VNextAtomicBlockV4Evidence =
  | (EvidenceBase & {
      nodeType: "page-break"
      family: "utility-flow"
      flowEffect: "force-page-advance"
      details: { intentionalBlankWhenPageEmpty: true }
    })
  | (EvidenceBase & {
      nodeType: "divider"
      family: "utility-flow"
      flowEffect: "place-content"
      details: {
        marginBeforePt: number
        thicknessPt: number
        marginAfterPt: number
        color: string
        style: "solid" | "dashed" | "dotted"
      }
    })
  | (EvidenceBase & {
      nodeType: "spacer"
      family: "utility-flow"
      flowEffect: "place-content"
      details: { heightPt: number }
    })
  | (EvidenceBase & {
      nodeType: "image"
      family: "media-flow"
      flowEffect: "place-content"
      details: {
        widthPt: number
        heightPt: number
        fit: "contain" | "cover"
        align: "left" | "center" | "right"
        crop: null | { x: number; y: number; width: number; height: number }
        assetId: string
        assetOwner: "published-static-media" | "instance-media"
        valueSource: "authored-static" | "data-snapshot" | "authored-fallback"
        decodeExecution: false
      }
    })

export interface VNextAtomicBlockV4EvidenceIssue {
  code: string
  severity: "error"
  path: string
  message: string
  nodeId?: string
}

export type VNextAtomicBlockV4EvidenceResult =
  | { status: "ready"; evidence: VNextAtomicBlockV4Evidence; issues: [] }
  | { status: "blocked"; evidence: null; issues: VNextAtomicBlockV4EvidenceIssue[] }

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function roundPt(value: number): number {
  return Number(value.toFixed(6))
}

function unitToPt(value: UnitValueV4Target): number {
  return roundPt(value.unit === "pt" ? value.value : (value.value * 72) / 25.4)
}

function issue(code: string, path: string, message: string, nodeId?: string): VNextAtomicBlockV4EvidenceIssue {
  return { code, severity: "error", path, message, ...(nodeId == null ? {} : { nodeId }) }
}

function finalize<T extends Omit<VNextAtomicBlockV4Evidence, "fingerprint">>(facts: T): VNextAtomicBlockV4Evidence {
  return {
    ...clone(facts),
    fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)),
  } as VNextAtomicBlockV4Evidence
}

export function hasValidVNextAtomicBlockV4EvidenceFingerprint(value: VNextAtomicBlockV4Evidence): boolean {
  try {
    const { fingerprint, ...facts } = value
    return fingerprint === createVNextCompactFingerprint(JSON.stringify(facts))
  } catch {
    return false
  }
}

export function createVNextAtomicBlockV4Evidence(input: {
  node: AtomicNode
  availableWidthPt: number
  imageBinding?: VNextResolvedImageBindingV1
}): VNextAtomicBlockV4EvidenceResult {
  const parsed = AuthoredNodeV4TargetSchema.safeParse(input.node)
  const issues: VNextAtomicBlockV4EvidenceIssue[] = []
  if (!parsed.success) issues.push(...parsed.error.issues.map((item) => issue(
    "atomic-node-invalid",
    item.path.map(String).join("."),
    item.message,
  )))
  if (!Number.isFinite(input.availableWidthPt) || input.availableWidthPt <= 0) issues.push(issue(
    "atomic-available-width-invalid",
    "availableWidthPt",
    "atomic block available width must be positive and finite",
  ))
  if (issues.length > 0 || !parsed.success) return { status: "blocked", evidence: null, issues }
  const node = parsed.data
  if (node.type !== "page-break" && node.type !== "divider" && node.type !== "spacer" && node.type !== "image") return {
    status: "blocked",
    evidence: null,
    issues: [issue(
      "atomic-node-type-unsupported",
      "node.type",
      `${node.type} is not a Utility/Media atomic block`,
      node.id,
    )],
  }

  if (node.type === "page-break") return {
    status: "ready",
    evidence: finalize({
      source: VNEXT_ATOMIC_BLOCK_V4_EVIDENCE_SOURCE,
      contractVersion: VNEXT_ATOMIC_BLOCK_V4_EVIDENCE_VERSION,
      nodeId: node.id,
      nodeType: "page-break" as const,
      family: "utility-flow" as const,
      flowEffect: "force-page-advance" as const,
      availableWidthPt: input.availableWidthPt,
      extentPt: 0,
      details: { intentionalBlankWhenPageEmpty: true as const },
    }),
    issues: [],
  }

  if (node.type === "divider") {
    const marginBeforePt = unitToPt(node.props.marginBefore)
    const thicknessPt = unitToPt(node.props.thickness)
    const marginAfterPt = unitToPt(node.props.marginAfter)
    const extentPt = roundPt(marginBeforePt + thicknessPt + marginAfterPt)
    if (extentPt <= 0) return {
      status: "blocked",
      evidence: null,
      issues: [issue(
        "atomic-block-zero-extent",
        "node.props",
        "divider must retain positive total vertical extent",
        node.id,
      )],
    }
    return {
      status: "ready",
      evidence: finalize({
        source: VNEXT_ATOMIC_BLOCK_V4_EVIDENCE_SOURCE,
        contractVersion: VNEXT_ATOMIC_BLOCK_V4_EVIDENCE_VERSION,
        nodeId: node.id,
        nodeType: "divider" as const,
        family: "utility-flow" as const,
        flowEffect: "place-content" as const,
        availableWidthPt: input.availableWidthPt,
        extentPt,
        details: {
          marginBeforePt,
          thicknessPt,
          marginAfterPt,
          color: node.props.color,
          style: node.props.style,
        },
      }),
      issues: [],
    }
  }

  if (node.type === "spacer") {
    const heightPt = roundPt(node.props.height)
    return {
      status: "ready",
      evidence: finalize({
        source: VNEXT_ATOMIC_BLOCK_V4_EVIDENCE_SOURCE,
        contractVersion: VNEXT_ATOMIC_BLOCK_V4_EVIDENCE_VERSION,
        nodeId: node.id,
        nodeType: "spacer" as const,
        family: "utility-flow" as const,
        flowEffect: "place-content" as const,
        availableWidthPt: input.availableWidthPt,
        extentPt: heightPt,
        details: { heightPt },
      }),
      issues: [],
    }
  }

  const binding = input.imageBinding
  if (binding == null || binding.placementId !== node.id) issues.push(issue(
    "resolved-block-image-binding-missing",
    "imageBinding",
    `block image ${node.id} requires its exact resolved image binding`,
    node.id,
  ))
  if (binding != null && (binding.assetId == null || binding.assetOwner === "none" || binding.valueSource === "empty")) issues.push(issue(
    "resolved-block-image-empty",
    "imageBinding.assetId",
    `block image ${node.id} requires a resolved media asset`,
    node.id,
  ))
  if (binding != null && node.source.kind === "asset-ref"
    && (binding.assetId !== node.source.assetId
      || binding.assetOwner !== "published-static-media"
      || binding.valueSource !== "authored-static")) issues.push(issue(
    "resolved-block-image-static-owner-mismatch",
    "imageBinding",
    `static block image ${node.id} binding must retain its authored published asset`,
    node.id,
  ))
  const widthPt = unitToPt(node.props.frame.width)
  const heightPt = unitToPt(node.props.frame.height)
  if (widthPt > input.availableWidthPt) issues.push(issue(
    "block-image-frame-exceeds-available-width",
    "node.props.frame.width",
    `block image width ${widthPt} exceeds available width ${input.availableWidthPt}; pagination does not auto-scale`,
    node.id,
  ))
  if (issues.length > 0 || binding == null || binding.assetId == null || binding.assetOwner === "none" || binding.valueSource === "empty") {
    return { status: "blocked", evidence: null, issues }
  }
  return {
    status: "ready",
    evidence: finalize({
      source: VNEXT_ATOMIC_BLOCK_V4_EVIDENCE_SOURCE,
      contractVersion: VNEXT_ATOMIC_BLOCK_V4_EVIDENCE_VERSION,
      nodeId: node.id,
      nodeType: "image" as const,
      family: "media-flow" as const,
      flowEffect: "place-content" as const,
      availableWidthPt: input.availableWidthPt,
      extentPt: heightPt,
      details: {
        widthPt,
        heightPt,
        fit: node.props.frame.fit,
        align: node.props.align,
        crop: node.props.frame.crop == null ? null : clone(node.props.frame.crop),
        assetId: binding.assetId,
        assetOwner: binding.assetOwner,
        valueSource: binding.valueSource,
        decodeExecution: false as const,
      },
    }),
    issues: [],
  }
}
