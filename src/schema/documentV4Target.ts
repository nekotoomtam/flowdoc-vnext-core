import { z } from "zod"
import {
  BoxStyleV4TargetSchema,
  NonNegativeUnitValueV4TargetSchema,
  PageSettingsV4TargetSchema,
  PositiveUnitValueV4TargetSchema,
  UnitValueV4TargetSchema,
  ZoneRoleV4TargetSchema,
} from "./documentV4Foundation.js"
import {
  BlockImageNodeV4TargetSchema,
  TextBlockNodeV4TargetSchema,
} from "./documentV4ImageTarget.js"

export const VNEXT_DOCUMENT_V4_TARGET_SOURCE = "vnext-document-v4-target"
export const VNEXT_DOCUMENT_V4_TARGET_VERSION = 4 as const
export const VNEXT_DOCUMENT_V4_AUTHORED_NODE_TYPES = [
  "zone",
  "text-block",
  "columns",
  "column",
  "table",
  "table-row",
  "table-cell",
  "toc",
  "page-break",
  "divider",
  "spacer",
  "image",
] as const

const ZoneNodeV4TargetSchema = z.object({
  id: z.string().min(1),
  type: z.literal("zone"),
  role: ZoneRoleV4TargetSchema,
  childIds: z.array(z.string().min(1)),
}).strict()

const ColumnsNodeV4TargetSchema = z.object({
  id: z.string().min(1),
  type: z.literal("columns"),
  props: z.object({
    gap: z.number().nonnegative().optional(),
    minHeight: z.number().positive().optional(),
    alignY: z.enum(["top", "middle", "bottom"]).optional(),
  }).strict().default({}),
  columnIds: z.array(z.string().min(1)).min(1),
}).strict()

const ColumnNodeV4TargetSchema = z.object({
  id: z.string().min(1),
  type: z.literal("column"),
  props: z.object({
    widthShare: z.number().positive().max(100).optional(),
    minHeight: z.number().positive().optional(),
    box: BoxStyleV4TargetSchema.optional(),
  }).strict().default({}),
  childIds: z.array(z.string().min(1)),
}).strict()

const TableNodeV4TargetSchema = z.object({
  id: z.string().min(1),
  type: z.literal("table"),
  props: z.object({
    headerRowCount: z.number().int().nonnegative().optional(),
    repeatHeaderRows: z.boolean().optional(),
    align: z.enum(["left", "center", "right"]).optional(),
    marginTop: NonNegativeUnitValueV4TargetSchema.optional(),
    marginBottom: NonNegativeUnitValueV4TargetSchema.optional(),
  }).strict().default({}),
  columns: z.array(z.object({ width: PositiveUnitValueV4TargetSchema }).strict()).min(1),
  rowIds: z.array(z.string().min(1)).min(1),
}).strict()

const TableRowNodeV4TargetSchema = z.object({
  id: z.string().min(1),
  type: z.literal("table-row"),
  props: z.object({
    minHeight: UnitValueV4TargetSchema.optional(),
    allowBreak: z.boolean().optional(),
  }).strict().default({}),
  cellIds: z.array(z.string().min(1)).min(1),
}).strict()

const TableCellNodeV4TargetSchema = z.object({
  id: z.string().min(1),
  type: z.literal("table-cell"),
  props: z.object({
    verticalAlign: z.enum(["top", "middle", "bottom"]).optional(),
    box: BoxStyleV4TargetSchema.optional(),
  }).strict().default({}),
  childIds: z.array(z.string().min(1)),
}).strict()

const TocNodeV4TargetSchema = z.object({
  id: z.string().min(1),
  type: z.literal("toc"),
  props: z.object({
    title: z.string().optional(),
    maxLevel: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]).optional(),
  }).strict().default({}),
}).strict()

const PageBreakNodeV4TargetSchema = z.object({
  id: z.string().min(1),
  type: z.literal("page-break"),
  props: z.object({}).strict().default({}),
}).strict()

const DividerNodeV4TargetSchema = z.object({
  id: z.string().min(1),
  type: z.literal("divider"),
  props: z.object({
    color: z.string().regex(/^[0-9A-Fa-f]{6}$/).default("CBD5E1"),
    thickness: NonNegativeUnitValueV4TargetSchema.default({ value: 1, unit: "pt" }),
    marginBefore: NonNegativeUnitValueV4TargetSchema.default({ value: 6, unit: "pt" }),
    marginAfter: NonNegativeUnitValueV4TargetSchema.default({ value: 6, unit: "pt" }),
    style: z.enum(["solid", "dashed", "dotted"]).default("solid"),
  }).strict().default({
    color: "CBD5E1",
    thickness: { value: 1, unit: "pt" },
    marginBefore: { value: 6, unit: "pt" },
    marginAfter: { value: 6, unit: "pt" },
    style: "solid",
  }),
}).strict()

const SpacerNodeV4TargetSchema = z.object({
  id: z.string().min(1),
  type: z.literal("spacer"),
  props: z.object({ height: z.number().positive() }).strict(),
}).strict()

export const AuthoredNodeV4TargetSchema = z.discriminatedUnion("type", [
  ZoneNodeV4TargetSchema,
  TextBlockNodeV4TargetSchema,
  ColumnsNodeV4TargetSchema,
  ColumnNodeV4TargetSchema,
  TableNodeV4TargetSchema,
  TableRowNodeV4TargetSchema,
  TableCellNodeV4TargetSchema,
  TocNodeV4TargetSchema,
  PageBreakNodeV4TargetSchema,
  DividerNodeV4TargetSchema,
  SpacerNodeV4TargetSchema,
  BlockImageNodeV4TargetSchema,
])

export const DocumentSectionV4TargetSchema = z.object({
  id: z.string().min(1),
  type: z.literal("section"),
  page: PageSettingsV4TargetSchema,
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
