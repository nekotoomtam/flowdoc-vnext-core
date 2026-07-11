import { z } from "zod"
import {
  ColumnNodeSchema,
  ColumnsNodeSchema,
  DividerNodeSchema,
  PageBreakNodeSchema,
  PageSettingsSchema,
  SpacerNodeSchema,
  TableCellNodeSchema,
  TableNodeSchema,
  TableRowNodeSchema,
  TocNodeSchema,
  ZoneNodeSchema,
} from "./document.js"
import {
  BlockImageNodeV4TargetSchema,
  TextBlockNodeV4TargetSchema,
} from "./documentV4ImageTarget.js"

export const VNEXT_DOCUMENT_V4_TARGET_SOURCE = "vnext-document-v4-target"
export const VNEXT_DOCUMENT_V4_TARGET_VERSION = 4 as const

export const AuthoredNodeV4TargetSchema = z.discriminatedUnion("type", [
  ZoneNodeSchema.strict(),
  TextBlockNodeV4TargetSchema,
  ColumnsNodeSchema.strict(),
  ColumnNodeSchema.strict(),
  TableNodeSchema.strict(),
  TableRowNodeSchema.strict(),
  TableCellNodeSchema.strict(),
  TocNodeSchema.strict(),
  PageBreakNodeSchema.strict(),
  DividerNodeSchema.strict(),
  SpacerNodeSchema.strict(),
  BlockImageNodeV4TargetSchema,
])

export const DocumentSectionV4TargetSchema = z.object({
  id: z.string().min(1),
  type: z.literal("section"),
  page: PageSettingsSchema.strict(),
  zoneIds: z.array(z.string().min(1)).min(1),
  nodes: z.record(z.string().min(1), AuthoredNodeV4TargetSchema),
}).strict()

export const DocumentNodeV4TargetSchema = z.object({
  version: z.literal(VNEXT_DOCUMENT_V4_TARGET_VERSION),
  document: z.object({
    id: z.string().min(1),
    meta: z.object({
      title: z.string(),
      createdAt: z.string().optional(),
      updatedAt: z.string().optional(),
    }).strict().optional(),
    sections: z.array(DocumentSectionV4TargetSchema).min(1),
  }).strict(),
}).strict()

export type AuthoredNodeV4Target = z.infer<typeof AuthoredNodeV4TargetSchema>
export type AuthoredNodeV4TargetType = AuthoredNodeV4Target["type"]
export type DocumentSectionV4Target = z.infer<typeof DocumentSectionV4TargetSchema>
export type DocumentNodeV4Target = z.infer<typeof DocumentNodeV4TargetSchema>

const ZONE_CHILD_TYPES = [
  "text-block",
  "columns",
  "table",
  "toc",
  "page-break",
  "divider",
  "spacer",
  "image",
] as const satisfies readonly AuthoredNodeV4TargetType[]

const COLUMN_CHILD_TYPES = [
  "text-block",
  "columns",
  "table",
  "toc",
  "divider",
  "spacer",
  "image",
] as const satisfies readonly AuthoredNodeV4TargetType[]

const TABLE_CELL_CHILD_TYPES = [
  "text-block",
  "toc",
  "divider",
  "spacer",
  "image",
] as const satisfies readonly AuthoredNodeV4TargetType[]

export const VNEXT_DOCUMENT_V4_ALLOWED_CHILD_TYPES = {
  zone: ZONE_CHILD_TYPES,
  "text-block": [],
  columns: ["column"],
  column: COLUMN_CHILD_TYPES,
  table: ["table-row"],
  "table-row": ["table-cell"],
  "table-cell": TABLE_CELL_CHILD_TYPES,
  toc: [],
  "page-break": [],
  divider: [],
  spacer: [],
  image: [],
} as const satisfies Record<AuthoredNodeV4TargetType, readonly AuthoredNodeV4TargetType[]>
