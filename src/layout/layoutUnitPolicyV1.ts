import { z } from "zod"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"

export const VNEXT_LAYOUT_UNIT_POLICY_V1_SOURCE = "vnext-layout-unit-policy-v1" as const
export const VNEXT_LAYOUT_UNIT_POLICY_V1_VERSION = 1 as const
export const VNEXT_LAYOUT_UNITS_PER_POINT = 1_000_000 as const
export const VNEXT_LAYOUT_UNIT_ROUNDING_POLICY = "half-away-from-zero" as const

const SafeIntegerSchema = z.number().int().refine(Number.isSafeInteger, {
  message: "layout values must be safe integers",
})

export const VNextLayoutUnitV1Schema = SafeIntegerSchema
export const VNextNonNegativeLayoutUnitV1Schema = SafeIntegerSchema.nonnegative()
export const VNextPositiveLayoutUnitV1Schema = SafeIntegerSchema.positive()

export type VNextLayoutUnitV1 = z.infer<typeof VNextLayoutUnitV1Schema>

export type VNextLayoutUnitIssueCodeV1 =
  | "invalid-point-value"
  | "unsafe-layout-unit"
  | "invalid-layout-unit"
  | "invalid-font-metric"
  | "invalid-font-size"
  | "invalid-units-per-em"
  | "unsafe-integer-product"

export interface VNextLayoutUnitIssueV1 {
  code: VNextLayoutUnitIssueCodeV1
  severity: "error"
  path: string
  message: string
}

export type VNextPointToLayoutUnitResultV1 =
  | {
      source: typeof VNEXT_LAYOUT_UNIT_POLICY_V1_SOURCE
      contractVersion: typeof VNEXT_LAYOUT_UNIT_POLICY_V1_VERSION
      status: "accepted"
      layoutUnit: VNextLayoutUnitV1
      issues: []
    }
  | {
      source: typeof VNEXT_LAYOUT_UNIT_POLICY_V1_SOURCE
      contractVersion: typeof VNEXT_LAYOUT_UNIT_POLICY_V1_VERSION
      status: "blocked"
      layoutUnit: null
      issues: VNextLayoutUnitIssueV1[]
    }

export type VNextLayoutUnitToPointResultV1 =
  | {
      source: typeof VNEXT_LAYOUT_UNIT_POLICY_V1_SOURCE
      contractVersion: typeof VNEXT_LAYOUT_UNIT_POLICY_V1_VERSION
      status: "accepted"
      point: number
      issues: []
    }
  | {
      source: typeof VNEXT_LAYOUT_UNIT_POLICY_V1_SOURCE
      contractVersion: typeof VNEXT_LAYOUT_UNIT_POLICY_V1_VERSION
      status: "blocked"
      point: null
      issues: VNextLayoutUnitIssueV1[]
    }

export interface VNextLayoutUnitPolicyV1 {
  source: typeof VNEXT_LAYOUT_UNIT_POLICY_V1_SOURCE
  contractVersion: typeof VNEXT_LAYOUT_UNIT_POLICY_V1_VERSION
  status: "accepted-policy"
  pointUnit: "pt"
  layoutUnit: "micro-point"
  layoutUnitsPerPoint: typeof VNEXT_LAYOUT_UNITS_PER_POINT
  numericShape: "signed-safe-integer"
  rounding: typeof VNEXT_LAYOUT_UNIT_ROUNDING_POLICY
  maximumAbsoluteLayoutUnit: number
  maximumAbsoluteWholePoint: number
  crossRuntimeComparison: "exact-integer"
  rendererConversion: "divide-once-at-paint-boundary"
  authoredDocumentUnitsChanged: false
  legacyGeometryMigration: false
  productionBinding: false
  fingerprint: string
}

function issue(
  code: VNextLayoutUnitIssueCodeV1,
  path: string,
  message: string,
): VNextLayoutUnitIssueV1 {
  return { code, severity: "error", path, message }
}

function acceptedLayoutUnit(layoutUnit: number): VNextPointToLayoutUnitResultV1 {
  return {
    source: VNEXT_LAYOUT_UNIT_POLICY_V1_SOURCE,
    contractVersion: VNEXT_LAYOUT_UNIT_POLICY_V1_VERSION,
    status: "accepted",
    layoutUnit,
    issues: [],
  }
}

function blockedLayoutUnit(issues: VNextLayoutUnitIssueV1[]): VNextPointToLayoutUnitResultV1 {
  return {
    source: VNEXT_LAYOUT_UNIT_POLICY_V1_SOURCE,
    contractVersion: VNEXT_LAYOUT_UNIT_POLICY_V1_VERSION,
    status: "blocked",
    layoutUnit: null,
    issues,
  }
}

function signedRoundDivide(numerator: number, positiveDenominator: number): number {
  if (numerator === 0) return 0
  const sign = numerator < 0 ? -1 : 1
  const absoluteNumerator = Math.abs(numerator)
  const quotient = Math.floor(absoluteNumerator / positiveDenominator)
  const remainder = absoluteNumerator % positiveDenominator
  const roundedMagnitude = quotient + (remainder >= Math.ceil(positiveDenominator / 2) ? 1 : 0)
  return sign * roundedMagnitude
}

export function createVNextLayoutUnitPolicyV1(): VNextLayoutUnitPolicyV1 {
  const facts = {
    source: VNEXT_LAYOUT_UNIT_POLICY_V1_SOURCE,
    contractVersion: VNEXT_LAYOUT_UNIT_POLICY_V1_VERSION,
    status: "accepted-policy" as const,
    pointUnit: "pt" as const,
    layoutUnit: "micro-point" as const,
    layoutUnitsPerPoint: VNEXT_LAYOUT_UNITS_PER_POINT,
    numericShape: "signed-safe-integer" as const,
    rounding: VNEXT_LAYOUT_UNIT_ROUNDING_POLICY,
    maximumAbsoluteLayoutUnit: Number.MAX_SAFE_INTEGER,
    maximumAbsoluteWholePoint: Math.floor(Number.MAX_SAFE_INTEGER / VNEXT_LAYOUT_UNITS_PER_POINT),
    crossRuntimeComparison: "exact-integer" as const,
    rendererConversion: "divide-once-at-paint-boundary" as const,
    authoredDocumentUnitsChanged: false as const,
    legacyGeometryMigration: false as const,
    productionBinding: false as const,
  }
  return {
    ...facts,
    fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)),
  }
}

export function convertVNextPointToLayoutUnitV1(
  point: number,
  path = "point",
): VNextPointToLayoutUnitResultV1 {
  if (!Number.isFinite(point)) return blockedLayoutUnit([
    issue("invalid-point-value", path, "point values must be finite"),
  ])
  const scaled = point * VNEXT_LAYOUT_UNITS_PER_POINT
  if (!Number.isFinite(scaled)) return blockedLayoutUnit([
    issue("unsafe-layout-unit", path, "point value exceeds the layout-unit range"),
  ])
  const layoutUnit = scaled < 0 ? -Math.round(-scaled) : Math.round(scaled)
  if (!Number.isSafeInteger(layoutUnit)) return blockedLayoutUnit([
    issue("unsafe-layout-unit", path, "converted layout value must be a safe integer"),
  ])
  return acceptedLayoutUnit(Object.is(layoutUnit, -0) ? 0 : layoutUnit)
}

export function convertVNextLayoutUnitToPointV1(
  layoutUnit: unknown,
  path = "layoutUnit",
): VNextLayoutUnitToPointResultV1 {
  const parsed = VNextLayoutUnitV1Schema.safeParse(layoutUnit)
  if (!parsed.success) return {
    source: VNEXT_LAYOUT_UNIT_POLICY_V1_SOURCE,
    contractVersion: VNEXT_LAYOUT_UNIT_POLICY_V1_VERSION,
    status: "blocked",
    point: null,
    issues: [issue("invalid-layout-unit", path, "layout values must be signed safe integers")],
  }
  return {
    source: VNEXT_LAYOUT_UNIT_POLICY_V1_SOURCE,
    contractVersion: VNEXT_LAYOUT_UNIT_POLICY_V1_VERSION,
    status: "accepted",
    point: parsed.data / VNEXT_LAYOUT_UNITS_PER_POINT,
    issues: [],
  }
}

export function scaleVNextFontMetricToLayoutUnitV1(input: {
  fontMetric: number
  fontSizeLayoutUnit: number
  unitsPerEm: number
}): VNextPointToLayoutUnitResultV1 {
  const issues: VNextLayoutUnitIssueV1[] = []
  if (!Number.isSafeInteger(input.fontMetric)) issues.push(issue(
    "invalid-font-metric",
    "fontMetric",
    "font metrics must be signed safe integers",
  ))
  if (!Number.isSafeInteger(input.fontSizeLayoutUnit) || input.fontSizeLayoutUnit <= 0) issues.push(issue(
    "invalid-font-size",
    "fontSizeLayoutUnit",
    "font size must be a positive safe layout integer",
  ))
  if (!Number.isSafeInteger(input.unitsPerEm) || input.unitsPerEm <= 0) issues.push(issue(
    "invalid-units-per-em",
    "unitsPerEm",
    "units per em must be a positive safe integer",
  ))
  if (issues.length > 0) return blockedLayoutUnit(issues)

  const numerator = input.fontMetric * input.fontSizeLayoutUnit
  if (!Number.isSafeInteger(numerator)) return blockedLayoutUnit([
    issue(
      "unsafe-integer-product",
      "fontMetric",
      "font metric and font size multiplication must remain a safe integer",
    ),
  ])
  return acceptedLayoutUnit(signedRoundDivide(numerator, input.unitsPerEm))
}
