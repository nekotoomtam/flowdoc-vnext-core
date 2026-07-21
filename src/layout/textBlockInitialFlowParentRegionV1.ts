import { z } from "zod"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import {
  VNextNonNegativeLayoutUnitV1Schema,
  VNextPositiveLayoutUnitV1Schema,
} from "./layoutUnitPolicyV1.js"

export const VNEXT_TEXT_BLOCK_INITIAL_FLOW_PARENT_REGION_SOURCE =
  "vnext-text-block-initial-flow-parent-region-v1" as const
export const VNEXT_TEXT_BLOCK_INITIAL_FLOW_PARENT_REGION_VERSION = 1 as const

export type VNextTextBlockInitialFlowParentOwnerKindV1 = "body" | "column" | "table-cell"

export interface VNextTextBlockInitialFlowParentRegionInputV1 {
  ownerKind: VNextTextBlockInitialFlowParentOwnerKindV1
  ownerId: string
  xLayoutUnit: number
  yLayoutUnit: number
  widthLayoutUnit: number
  availableHeightLayoutUnit: number | null
}

export interface VNextTextBlockInitialFlowParentRegionV1
  extends VNextTextBlockInitialFlowParentRegionInputV1 {
  source: typeof VNEXT_TEXT_BLOCK_INITIAL_FLOW_PARENT_REGION_SOURCE
  contractVersion: typeof VNEXT_TEXT_BLOCK_INITIAL_FLOW_PARENT_REGION_VERSION
  kind: "text-block-parent-region"
  fingerprint: string
}

export interface VNextTextBlockInitialFlowParentRegionIssueV1 {
  code: "invalid-parent-region"
  severity: "error"
  path: string
  message: string
}

export type VNextTextBlockInitialFlowParentRegionResultV1 =
  | {
      status: "accepted"
      mayPublishLayout: false
      productionBinding: false
      region: VNextTextBlockInitialFlowParentRegionV1
      issues: []
    }
  | { status: "blocked"; region: null; issues: VNextTextBlockInitialFlowParentRegionIssueV1[] }

export type VNextTextBlockInitialFlowParentRegionInspectionV1 =
  | { status: "valid" }
  | {
      status: "invalid"
      code: "invalid-parent-region" | "parent-region-fingerprint-mismatch"
      message: string
    }

const NonBlankStringSchema = z.string().refine((value) => value.trim().length > 0, {
  message: "owner id must not be blank",
})

const InputSchema = z.object({
  ownerKind: z.enum(["body", "column", "table-cell"]),
  ownerId: NonBlankStringSchema,
  xLayoutUnit: VNextNonNegativeLayoutUnitV1Schema,
  yLayoutUnit: VNextNonNegativeLayoutUnitV1Schema,
  widthLayoutUnit: VNextPositiveLayoutUnitV1Schema,
  availableHeightLayoutUnit: VNextPositiveLayoutUnitV1Schema.nullable(),
}).strict()

const RetainedRegionSchema = InputSchema.extend({
  source: z.literal(VNEXT_TEXT_BLOCK_INITIAL_FLOW_PARENT_REGION_SOURCE),
  contractVersion: z.literal(VNEXT_TEXT_BLOCK_INITIAL_FLOW_PARENT_REGION_VERSION),
  kind: z.literal("text-block-parent-region"),
  fingerprint: z.string(),
}).strict()

function issue(path: string, message: string): VNextTextBlockInitialFlowParentRegionIssueV1 {
  return { code: "invalid-parent-region", severity: "error", path, message }
}

function freeze<T>(value: T): T {
  return Object.freeze(value)
}

export function createVNextTextBlockInitialFlowParentRegionV1(
  input: VNextTextBlockInitialFlowParentRegionInputV1,
): VNextTextBlockInitialFlowParentRegionResultV1 {
  const parsed = InputSchema.safeParse(input)
  if (!parsed.success) return {
    status: "blocked",
    region: null,
    issues: parsed.error.issues.map((item) => issue(
      item.path.map(String).join(".") || "parentRegion",
      item.message,
    )),
  }
  const facts = {
    source: VNEXT_TEXT_BLOCK_INITIAL_FLOW_PARENT_REGION_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_INITIAL_FLOW_PARENT_REGION_VERSION,
    kind: "text-block-parent-region" as const,
    ...parsed.data,
  }
  return {
    status: "accepted",
    mayPublishLayout: false,
    productionBinding: false,
    region: freeze({
      ...facts,
      fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)),
    }),
    issues: [],
  }
}

export function inspectVNextTextBlockInitialFlowParentRegionV1(
  region: unknown,
): VNextTextBlockInitialFlowParentRegionInspectionV1 {
  const parsed = RetainedRegionSchema.safeParse(region)
  if (!parsed.success) return {
    status: "invalid",
    code: "invalid-parent-region",
    message: parsed.error.issues.map((item) => item.message).join("; "),
  }
  const recreated = createVNextTextBlockInitialFlowParentRegionV1({
    ownerKind: parsed.data.ownerKind,
    ownerId: parsed.data.ownerId,
    xLayoutUnit: parsed.data.xLayoutUnit,
    yLayoutUnit: parsed.data.yLayoutUnit,
    widthLayoutUnit: parsed.data.widthLayoutUnit,
    availableHeightLayoutUnit: parsed.data.availableHeightLayoutUnit,
  })
  if (recreated.status !== "accepted") return {
    status: "invalid",
    code: "invalid-parent-region",
    message: recreated.issues.map((item) => item.message).join("; "),
  }
  return recreated.region.fingerprint === parsed.data.fingerprint
    ? { status: "valid" }
    : {
        status: "invalid",
        code: "parent-region-fingerprint-mismatch",
        message: "parent region facts do not match the retained fingerprint",
      }
}
