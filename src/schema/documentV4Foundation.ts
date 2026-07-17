import { z } from "zod"

const HexColorV4TargetSchema = z.string().regex(/^[0-9A-Fa-f]{6}$/)

export const UnitValueV4TargetSchema = z.object({
  value: z.number(),
  unit: z.enum(["pt", "mm"]),
}).strict()

export const PositiveUnitValueV4TargetSchema = UnitValueV4TargetSchema.refine((value) => value.value > 0, {
  message: "unit value must be positive",
})

export const NonNegativeUnitValueV4TargetSchema = UnitValueV4TargetSchema.refine((value) => value.value >= 0, {
  message: "unit value must be non-negative",
})

export const TextRunStyleV4TargetSchema = z.object({
  fontSize: PositiveUnitValueV4TargetSchema.optional(),
  fontFamilyKey: z.string().min(1).optional(),
  textColor: HexColorV4TargetSchema.optional(),
  fontWeight: z.enum(["normal", "bold"]).optional(),
  fontStyle: z.enum(["normal", "italic"]).optional(),
  textDecoration: z.enum(["none", "underline"]).optional(),
  strikethrough: z.boolean().optional(),
}).strict()

export const ListItemRoleMetadataV4TargetSchema = z.object({
  instanceId: z.string().min(1),
  level: z.number().int().min(0).max(7),
  itemId: z.string().min(1),
  startAt: z.number().int().positive().optional(),
}).strict()

export const TextBlockRoleV4TargetSchema = z.discriminatedUnion("role", [
  z.object({ role: z.literal("paragraph") }).strict(),
  z.object({
    role: z.literal("heading"),
    level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
  }).strict(),
  z.object({
    role: z.literal("list-item"),
    list: ListItemRoleMetadataV4TargetSchema,
  }).strict(),
  z.object({ role: z.literal("caption") }).strict(),
  z.object({ role: z.literal("note") }).strict(),
  z.object({ role: z.literal("label") }).strict(),
])

export const BoxPaddingV4TargetSchema = z.object({
  top: NonNegativeUnitValueV4TargetSchema,
  right: NonNegativeUnitValueV4TargetSchema,
  bottom: NonNegativeUnitValueV4TargetSchema,
  left: NonNegativeUnitValueV4TargetSchema,
}).strict()

export const BoxBorderSideV4TargetSchema = z.object({
  style: z.enum(["solid", "dashed", "dotted", "none"]),
  width: NonNegativeUnitValueV4TargetSchema,
  color: HexColorV4TargetSchema.default("000000"),
}).strict()

export const BoxStyleV4TargetSchema = z.object({
  fill: HexColorV4TargetSchema.optional(),
  padding: BoxPaddingV4TargetSchema.optional(),
  border: z.object({
    top: BoxBorderSideV4TargetSchema.optional(),
    right: BoxBorderSideV4TargetSchema.optional(),
    bottom: BoxBorderSideV4TargetSchema.optional(),
    left: BoxBorderSideV4TargetSchema.optional(),
  }).strict().optional(),
}).strict()

export const TextBlockPropsV4TargetSchema = z.object({
  textStyleId: z.string().min(1).optional(),
  box: BoxStyleV4TargetSchema.optional(),
}).strict()

export const ZoneRoleV4TargetSchema = z.enum([
  "body",
  "header",
  "footer",
  "first-page-header",
  "first-page-footer",
])

export const PageSettingsV4TargetSchema = z.object({
  size: z.enum(["A4", "Letter"]),
  orientation: z.enum(["portrait", "landscape"]),
  margin: z.object({
    top: UnitValueV4TargetSchema,
    right: UnitValueV4TargetSchema,
    bottom: UnitValueV4TargetSchema,
    left: UnitValueV4TargetSchema,
  }).strict(),
  headerReserved: z.number().nonnegative().optional(),
  footerReserved: z.number().nonnegative().optional(),
  headerFooterHorizontalMode: z.enum(["body", "full"]).optional(),
  pageNumberStart: z.number().positive().int().optional(),
}).strict()

export type UnitValueV4Target = z.infer<typeof UnitValueV4TargetSchema>
export type TextRunStyleV4Target = z.infer<typeof TextRunStyleV4TargetSchema>
export type TextBlockRoleV4Target = z.infer<typeof TextBlockRoleV4TargetSchema>
export type TextBlockPropsV4Target = z.infer<typeof TextBlockPropsV4TargetSchema>
export type ZoneRoleV4Target = z.infer<typeof ZoneRoleV4TargetSchema>
