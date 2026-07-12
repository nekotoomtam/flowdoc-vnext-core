import type { AuthoredNodeV4Target } from "../schema/documentV4Target.js"
import type { DataSnapshotV2Value } from "../persistence/packageV3ImageTarget.js"

export function isVNextTableImageValueV1(
  value: DataSnapshotV2Value | undefined,
): value is { kind: "image-asset-ref"; assetId: string } {
  return typeof value === "object" && value != null && value.kind === "image-asset-ref"
}

export function isVNextTableItemValueCompatibleV1(
  type: string,
  value: DataSnapshotV2Value,
): boolean {
  if (value === null) return true
  if (type === "number") return typeof value === "number" && Number.isFinite(value)
  if (type === "boolean") return typeof value === "boolean"
  if (type === "image") return isVNextTableImageValueV1(value)
  return typeof value === "string"
}

export function getVNextAuthoredPlacementFallbackV1(
  node: AuthoredNodeV4Target,
  sourcePlacementId: string,
): string | undefined {
  if (node.type === "image") {
    return node.source.kind === "image-field-ref" ? node.source.fallbackAssetId : undefined
  }
  if (node.type !== "text-block") return undefined
  const inline = node.children.find((candidate) => candidate.id === sourcePlacementId)
  if (inline?.type === "field-ref") return inline.fallback
  if (inline?.type === "inline-image" && inline.source.kind === "image-field-ref") {
    return inline.source.fallbackAssetId
  }
  return undefined
}

export function formatVNextTableScalarValueV1(value: string | number | boolean): string {
  return typeof value === "string" ? value : String(value)
}
