import { z } from "zod"
import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"

export const VNEXT_COMPOSITION_FRAGMENT_WINDOW_SOURCE = "vnext-composition-fragment-window"
export const VNEXT_COMPOSITION_FRAGMENT_WINDOW_VERSION = 1 as const
export const VNEXT_COMPOSITION_FRAGMENT_WINDOW_MAX_PAGES = 10_000
export const VNEXT_COMPOSITION_FRAGMENT_WINDOW_MAX_FRAGMENTS = 100_000

const NonBlankIdSchema = z.string().min(1).max(256).refine((value) => value.trim().length > 0, {
  message: "identity must not be whitespace",
})
const CompactFingerprintSchema = z.string().regex(/^sha256:[a-f0-9]{64}$/u, {
  message: "compact fingerprint must use sha256:<64 lowercase hex characters>",
})
const PointSchema = z.number().finite().nonnegative()
const BoundedCountSchema = z.number().int().nonnegative().max(VNEXT_COMPOSITION_FRAGMENT_WINDOW_MAX_FRAGMENTS)

export const VNextCompositionNodeFamilyV1Schema = z.enum([
  "text-flow",
  "columns-flow",
  "table-flow",
  "generated-flow",
  "utility-flow",
  "media-flow",
])

export const VNextCompositionRootNodeTypeV1Schema = z.enum([
  "text-block",
  "columns",
  "table",
  "toc",
  "page-break",
  "divider",
  "spacer",
  "image",
])

export const VNEXT_COMPOSITION_ROOT_TYPES_BY_FAMILY_V1 = {
  "text-flow": ["text-block"],
  "columns-flow": ["columns"],
  "table-flow": ["table"],
  "generated-flow": ["toc"],
  "utility-flow": ["page-break", "divider", "spacer"],
  "media-flow": ["image"],
} as const satisfies Record<
  z.infer<typeof VNextCompositionNodeFamilyV1Schema>,
  readonly z.infer<typeof VNextCompositionRootNodeTypeV1Schema>[]
>

export const VNextCompositionFragmentOwnerPinsV1Schema = z.object({
  documentStructure: CompactFingerprintSchema,
  resolvedProjection: CompactFingerprintSchema,
  familySource: CompactFingerprintSchema,
  measurement: CompactFingerprintSchema,
  pagination: CompactFingerprintSchema,
}).strict()

export const VNextCompositionFragmentCapacityV1Schema = z.object({
  pageBodyHeightPt: z.number().finite().positive(),
  firstPageAvailableHeightPt: PointSchema,
  maximumPageCount: z.number().int().positive().max(VNEXT_COMPOSITION_FRAGMENT_WINDOW_MAX_PAGES),
  maximumFragmentCount: z.number().int().positive().max(VNEXT_COMPOSITION_FRAGMENT_WINDOW_MAX_FRAGMENTS),
}).strict()

export const VNextCompositionFamilyCursorRefV1Schema = z.object({
  contractVersion: z.literal(VNEXT_COMPOSITION_FRAGMENT_WINDOW_VERSION),
  kind: z.literal("composition-family-cursor-ref"),
  family: VNextCompositionNodeFamilyV1Schema,
  rootNodeId: NonBlankIdSchema,
  ownerFingerprint: CompactFingerprintSchema,
  stateFingerprint: CompactFingerprintSchema,
  complete: z.boolean(),
}).strict()

const HeadingRefSchema = z.object({
  headingNodeId: NonBlankIdSchema,
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
}).strict()

export const VNextCompositionFragmentPlacementV1Schema = z.object({
  fragmentId: NonBlankIdSchema,
  fragmentIndex: z.number().int().nonnegative(),
  sourceNodeId: NonBlankIdSchema,
  blockOffsetPt: PointSchema,
  blockExtentPt: z.number().finite().positive(),
  continuation: z.object({
    fromPrevious: z.boolean(),
    toNext: z.boolean(),
  }).strict(),
  familyEvidenceFingerprint: CompactFingerprintSchema,
  heading: HeadingRefSchema.nullable(),
}).strict()

export const VNextCompositionFragmentPageV1Schema = z.object({
  windowPageIndex: z.number().int().nonnegative(),
  flowEffect: z.enum(["place-content", "force-page-advance"]),
  availableHeightPt: PointSchema,
  usedHeightPt: PointSchema,
  remainingHeightPt: PointSchema,
  cursorBefore: VNextCompositionFamilyCursorRefV1Schema,
  cursorAfter: VNextCompositionFamilyCursorRefV1Schema,
  fragments: z.array(VNextCompositionFragmentPlacementV1Schema)
    .max(VNEXT_COMPOSITION_FRAGMENT_WINDOW_MAX_FRAGMENTS),
}).strict()

const WorkSchema = z.object({
  pageCount: z.number().int().nonnegative().max(VNEXT_COMPOSITION_FRAGMENT_WINDOW_MAX_PAGES),
  fragmentCount: BoundedCountSchema,
  cursorCommitCount: z.number().int().nonnegative().max(VNEXT_COMPOSITION_FRAGMENT_WINDOW_MAX_PAGES),
}).strict()

const IssueSchema = z.object({
  code: NonBlankIdSchema,
  severity: z.literal("error"),
  path: z.string().max(512),
  message: z.string().min(1).max(2_000),
}).strict()

const WindowBaseShape = {
  source: z.literal(VNEXT_COMPOSITION_FRAGMENT_WINDOW_SOURCE),
  contractVersion: z.literal(VNEXT_COMPOSITION_FRAGMENT_WINDOW_VERSION),
  kind: z.literal("composition-fragment-window"),
  family: VNextCompositionNodeFamilyV1Schema,
  documentId: NonBlankIdSchema,
  sectionId: NonBlankIdSchema,
  zoneId: NonBlankIdSchema,
  rootNodeId: NonBlankIdSchema,
  rootNodeType: VNextCompositionRootNodeTypeV1Schema,
  sourceOrder: z.number().int().nonnegative(),
  ownerPins: VNextCompositionFragmentOwnerPinsV1Schema,
  capacity: VNextCompositionFragmentCapacityV1Schema,
  cursorBefore: VNextCompositionFamilyCursorRefV1Schema,
  work: WorkSchema,
} as const

const AcceptedWindowSchema = (status: "complete" | "partial") => z.object({
  ...WindowBaseShape,
  status: z.literal(status),
  cursorAfter: VNextCompositionFamilyCursorRefV1Schema,
  pages: z.array(VNextCompositionFragmentPageV1Schema)
    .min(1)
    .max(VNEXT_COMPOSITION_FRAGMENT_WINDOW_MAX_PAGES),
  issues: z.tuple([]),
}).strict()

const FreshPageRequiredWindowSchema = z.object({
  ...WindowBaseShape,
  status: z.literal("fresh-page-required"),
  cursorAfter: VNextCompositionFamilyCursorRefV1Schema,
  pages: z.tuple([]),
  issues: z.tuple([]),
}).strict()

const BlockedWindowSchema = z.object({
  ...WindowBaseShape,
  status: z.literal("blocked"),
  cursorAfter: z.null(),
  pages: z.null(),
  issues: z.array(IssueSchema).min(1).max(1_000),
}).strict()

export const VNextCompositionFragmentWindowInputV1Schema = z.discriminatedUnion("status", [
  AcceptedWindowSchema("complete"),
  AcceptedWindowSchema("partial"),
  FreshPageRequiredWindowSchema,
  BlockedWindowSchema,
])

export type VNextCompositionNodeFamilyV1 = z.infer<typeof VNextCompositionNodeFamilyV1Schema>
export type VNextCompositionRootNodeTypeV1 = z.infer<typeof VNextCompositionRootNodeTypeV1Schema>
export type VNextCompositionFragmentOwnerPinsV1 = z.infer<typeof VNextCompositionFragmentOwnerPinsV1Schema>
export type VNextCompositionFragmentCapacityV1 = z.infer<typeof VNextCompositionFragmentCapacityV1Schema>
export type VNextCompositionFamilyCursorRefV1 = z.infer<typeof VNextCompositionFamilyCursorRefV1Schema>
export type VNextCompositionFragmentPlacementV1 = z.infer<typeof VNextCompositionFragmentPlacementV1Schema>
export type VNextCompositionFragmentPageV1 = z.infer<typeof VNextCompositionFragmentPageV1Schema>
export type VNextCompositionFragmentWindowInputV1 = z.infer<typeof VNextCompositionFragmentWindowInputV1Schema>
export type VNextCompositionFragmentWindowV1 = VNextCompositionFragmentWindowInputV1 & { fingerprint: string }

export interface VNextCompositionFragmentWindowIssueV1 {
  code: string
  severity: "error"
  path: string
  message: string
}

export type VNextCompositionFragmentWindowResultV1 =
  | { status: "ready"; window: VNextCompositionFragmentWindowV1; issues: [] }
  | { status: "blocked"; window: null; issues: VNextCompositionFragmentWindowIssueV1[] }

export interface VNextCompositionFragmentWindowExpectationV1 {
  family: VNextCompositionNodeFamilyV1
  documentId: string
  sectionId: string
  zoneId: string
  rootNodeId: string
  rootNodeType: VNextCompositionRootNodeTypeV1
  sourceOrder: number
  ownerPins: VNextCompositionFragmentOwnerPinsV1
  capacity: VNextCompositionFragmentCapacityV1
  cursorBeforeStateFingerprint: string
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function exact(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function near(left: number, right: number): boolean {
  return Math.abs(left - right) <= 0.01
}

function issue(code: string, path: string, message: string): VNextCompositionFragmentWindowIssueV1 {
  return { code, severity: "error", path, message }
}

function formatIssuePath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((current, segment) => {
    if (typeof segment === "number") return `${current}[${segment}]`
    const key = String(segment)
    return current === "" ? key : `${current}.${key}`
  }, "")
}

function schemaIssues(error: z.ZodError): VNextCompositionFragmentWindowIssueV1[] {
  return error.issues.map((item) => issue("invalid-fragment-window", formatIssuePath(item.path), item.message))
}

function validateCursor(
  cursor: VNextCompositionFamilyCursorRefV1,
  facts: VNextCompositionFragmentWindowInputV1,
  path: string,
  issues: VNextCompositionFragmentWindowIssueV1[],
): void {
  if (cursor.family !== facts.family || cursor.rootNodeId !== facts.rootNodeId) issues.push(issue(
    "fragment-window-cursor-owner-mismatch",
    path,
    "family cursor must retain the window family and root node",
  ))
  if (cursor.ownerFingerprint !== facts.ownerPins.measurement) issues.push(issue(
    "fragment-window-cursor-pin-mismatch",
    `${path}.ownerFingerprint`,
    "family cursor must pin the exact measurement owner",
  ))
}

function semanticIssues(facts: VNextCompositionFragmentWindowInputV1): VNextCompositionFragmentWindowIssueV1[] {
  const issues: VNextCompositionFragmentWindowIssueV1[] = []
  const allowedRoots = VNEXT_COMPOSITION_ROOT_TYPES_BY_FAMILY_V1[facts.family]
  if (!(allowedRoots as readonly string[]).includes(facts.rootNodeType)) issues.push(issue(
    "fragment-window-family-root-mismatch",
    "rootNodeType",
    `${facts.family} cannot own root node type ${facts.rootNodeType}`,
  ))
  if (facts.capacity.firstPageAvailableHeightPt > facts.capacity.pageBodyHeightPt) issues.push(issue(
    "fragment-window-first-capacity-invalid",
    "capacity.firstPageAvailableHeightPt",
    "first-page available height must not exceed page-body height",
  ))
  validateCursor(facts.cursorBefore, facts, "cursorBefore", issues)

  if (facts.status === "blocked") {
    if (facts.work.pageCount !== 0 || facts.work.fragmentCount !== 0 || facts.work.cursorCommitCount !== 0) issues.push(issue(
      "fragment-window-blocked-work-invalid",
      "work",
      "blocked windows must not report committed page, fragment, or cursor work",
    ))
    return issues
  }

  validateCursor(facts.cursorAfter, facts, "cursorAfter", issues)
  if (facts.status === "fresh-page-required") {
    if (!exact(facts.cursorBefore, facts.cursorAfter)) issues.push(issue(
      "fragment-window-fresh-page-cursor-drift",
      "cursorAfter",
      "fresh-page-required must retain the exact cursor without progress",
    ))
    if (facts.capacity.firstPageAvailableHeightPt >= facts.capacity.pageBodyHeightPt) issues.push(issue(
      "fragment-window-fresh-page-no-progress",
      "capacity.firstPageAvailableHeightPt",
      "fresh-page-required is invalid when the supplied first page is already fresh",
    ))
    if (facts.work.pageCount !== 0 || facts.work.fragmentCount !== 0 || facts.work.cursorCommitCount !== 0) issues.push(issue(
      "fragment-window-fresh-page-work-invalid",
      "work",
      "fresh-page-required must not report committed work",
    ))
    return issues
  }

  if (facts.cursorBefore.complete) issues.push(issue(
    "fragment-window-start-cursor-complete",
    "cursorBefore.complete",
    "accepted windows cannot start after family pagination is already complete",
  ))

  if (facts.status === "complete" && !facts.cursorAfter.complete) issues.push(issue(
    "fragment-window-complete-cursor-invalid",
    "cursorAfter.complete",
    "complete windows require a complete cursor-after",
  ))
  if (facts.status === "partial" && facts.cursorAfter.complete) issues.push(issue(
    "fragment-window-partial-cursor-invalid",
    "cursorAfter.complete",
    "partial windows require an incomplete cursor-after",
  ))
  if (facts.pages.length > facts.capacity.maximumPageCount) issues.push(issue(
    "fragment-window-page-limit-exceeded",
    "pages",
    "window page count exceeds its pinned maximum",
  ))

  const fragmentIds = new Set<string>()
  let fragmentCount = 0
  let headingCount = 0
  facts.pages.forEach((page, pageIndex) => {
    const expectedAvailableHeight = pageIndex === 0
      ? facts.capacity.firstPageAvailableHeightPt
      : facts.capacity.pageBodyHeightPt
    if (page.windowPageIndex !== pageIndex) issues.push(issue(
      "fragment-window-page-order-invalid",
      `pages[${pageIndex}].windowPageIndex`,
      `expected contiguous window page index ${pageIndex}`,
    ))
    if (!near(page.availableHeightPt, expectedAvailableHeight)) issues.push(issue(
      "fragment-window-page-capacity-mismatch",
      `pages[${pageIndex}].availableHeightPt`,
      "page available height must equal the capacity pinned for its position",
    ))
    if (!near(page.usedHeightPt + page.remainingHeightPt, page.availableHeightPt)) issues.push(issue(
      "fragment-window-page-height-drift",
      `pages[${pageIndex}]`,
      "used and remaining height must equal available height",
    ))
    validateCursor(page.cursorBefore, facts, `pages[${pageIndex}].cursorBefore`, issues)
    validateCursor(page.cursorAfter, facts, `pages[${pageIndex}].cursorAfter`, issues)
    const expectedCursorBefore = pageIndex === 0 ? facts.cursorBefore : facts.pages[pageIndex - 1].cursorAfter
    if (!exact(page.cursorBefore, expectedCursorBefore)) issues.push(issue(
      "fragment-window-page-cursor-chain-broken",
      `pages[${pageIndex}].cursorBefore`,
      "every page must start at the exact previous committed cursor",
    ))
    if (pageIndex < facts.pages.length - 1 && page.cursorAfter.complete) issues.push(issue(
      "fragment-window-premature-complete-page",
      `pages[${pageIndex}].cursorAfter.complete`,
      "only the final page may complete the family cursor",
    ))
    if (exact(page.cursorBefore, page.cursorAfter)) issues.push(issue(
      "fragment-window-page-no-progress",
      `pages[${pageIndex}].cursorAfter`,
      "every committed page must advance the family cursor",
    ))
    if (page.flowEffect === "force-page-advance") {
      if (facts.family !== "utility-flow"
        || facts.rootNodeType !== "page-break"
        || facts.status !== "complete"
        || facts.pages.length !== 1) issues.push(issue(
        "fragment-window-force-page-owner-invalid",
        `pages[${pageIndex}].flowEffect`,
        "force-page-advance requires one complete page-break utility window",
      ))
      if (page.fragments.length !== 0
        || !near(page.usedHeightPt, 0)
        || !near(page.remainingHeightPt, page.availableHeightPt)) issues.push(issue(
        "fragment-window-force-page-geometry-invalid",
        `pages[${pageIndex}]`,
        "force-page-advance must retain zero used height, full remainder, and no placements",
      ))
    } else if (facts.rootNodeType === "page-break") issues.push(issue(
      "fragment-window-page-break-effect-missing",
      `pages[${pageIndex}].flowEffect`,
      "page-break windows must explicitly force page advance",
    ))

    let previousEnd = 0
    page.fragments.forEach((fragment, fragmentIndex) => {
      fragmentCount += 1
      if (fragmentIds.has(fragment.fragmentId)) issues.push(issue(
        "fragment-window-duplicate-fragment",
        `pages[${pageIndex}].fragments[${fragmentIndex}].fragmentId`,
        `fragment ${fragment.fragmentId} appears more than once`,
      ))
      fragmentIds.add(fragment.fragmentId)
      if (fragment.blockOffsetPt + 0.01 < previousEnd) issues.push(issue(
        "fragment-window-fragment-overlap",
        `pages[${pageIndex}].fragments[${fragmentIndex}].blockOffsetPt`,
        "ordered block fragments must not overlap",
      ))
      const fragmentEnd = fragment.blockOffsetPt + fragment.blockExtentPt
      if (fragmentEnd > page.usedHeightPt + 0.01) issues.push(issue(
        "fragment-window-fragment-out-of-page",
        `pages[${pageIndex}].fragments[${fragmentIndex}]`,
        "fragment extent must fit inside committed used page height",
      ))
      previousEnd = fragmentEnd
      if (fragment.heading != null) {
        headingCount += 1
        if (facts.family !== "text-flow"
          || fragment.heading.headingNodeId !== facts.rootNodeId
          || fragment.sourceNodeId !== facts.rootNodeId
          || fragment.fragmentIndex !== 0
          || fragment.continuation.fromPrevious) issues.push(issue(
          "fragment-window-heading-first-fragment-invalid",
          `pages[${pageIndex}].fragments[${fragmentIndex}].heading`,
          "heading identity belongs only to the first non-continuation text-flow fragment of its root",
        ))
      }
    })
  })

  if (!exact(facts.pages.at(-1)?.cursorAfter, facts.cursorAfter)) issues.push(issue(
    "fragment-window-final-cursor-mismatch",
    "cursorAfter",
    "window cursor-after must equal the final committed page cursor",
  ))
  if (fragmentCount > facts.capacity.maximumFragmentCount) issues.push(issue(
    "fragment-window-fragment-limit-exceeded",
    "pages",
    "window fragment count exceeds its pinned maximum",
  ))
  if (headingCount > 1) issues.push(issue(
    "fragment-window-heading-duplicate",
    "pages",
    "a root window may expose its first heading fragment only once",
  ))
  if (facts.work.pageCount !== facts.pages.length
    || facts.work.fragmentCount !== fragmentCount
    || facts.work.cursorCommitCount !== facts.pages.length) issues.push(issue(
    "fragment-window-work-mismatch",
    "work",
    "work facts must exactly match committed pages, fragments, and page cursor commits",
  ))
  return issues
}

function normalizedInput(value: unknown):
  | { ok: true; facts: VNextCompositionFragmentWindowInputV1 }
  | { ok: false; issues: VNextCompositionFragmentWindowIssueV1[] } {
  const parsed = VNextCompositionFragmentWindowInputV1Schema.safeParse(value)
  if (!parsed.success) return { ok: false, issues: schemaIssues(parsed.error) }
  const issues = semanticIssues(parsed.data)
  return issues.length === 0 ? { ok: true, facts: parsed.data } : { ok: false, issues }
}

export function finalizeVNextCompositionFragmentWindowV1(value: unknown): VNextCompositionFragmentWindowResultV1 {
  const normalized = normalizedInput(value)
  if (!normalized.ok) return { status: "blocked", window: null, issues: normalized.issues }
  const facts = clone(normalized.facts)
  return {
    status: "ready",
    window: { ...facts, fingerprint: createVNextCompactFingerprint(JSON.stringify(facts)) },
    issues: [],
  }
}

export function parseVNextCompositionFragmentWindowV1(
  value: unknown,
  expectation?: VNextCompositionFragmentWindowExpectationV1,
): VNextCompositionFragmentWindowResultV1 {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return {
    status: "blocked",
    window: null,
    issues: [issue("invalid-fragment-window", "", "fragment window must be an object")],
  }
  const record = { ...(value as Record<string, unknown>) }
  const fingerprint = record.fingerprint
  delete record.fingerprint
  if (typeof fingerprint !== "string" || !/^sha256:[a-f0-9]{64}$/u.test(fingerprint)) return {
    status: "blocked",
    window: null,
    issues: [issue("invalid-fragment-window-fingerprint", "fingerprint", "fragment window requires a compact sha256 fingerprint")],
  }
  const finalized = finalizeVNextCompositionFragmentWindowV1(record)
  if (finalized.status === "blocked") return finalized
  if (finalized.window.fingerprint !== fingerprint) return {
    status: "blocked",
    window: null,
    issues: [issue("fragment-window-fingerprint-mismatch", "fingerprint", "fragment window facts do not match its retained fingerprint")],
  }
  const window = finalized.window
  if (expectation == null) return { status: "ready", window, issues: [] }

  const issues: VNextCompositionFragmentWindowIssueV1[] = []
  if (window.family !== expectation.family
    || window.documentId !== expectation.documentId
    || window.sectionId !== expectation.sectionId
    || window.zoneId !== expectation.zoneId
    || window.rootNodeId !== expectation.rootNodeId
    || window.rootNodeType !== expectation.rootNodeType
    || window.sourceOrder !== expectation.sourceOrder) issues.push(issue(
    "fragment-window-identity-mismatch",
    "",
    "fragment window identity does not match the requested body item",
  ))
  if (!exact(window.ownerPins, expectation.ownerPins)) issues.push(issue(
    "fragment-window-owner-pins-stale",
    "ownerPins",
    "fragment window owner pins do not match the requested evidence",
  ))
  if (!exact(window.capacity, expectation.capacity)) issues.push(issue(
    "fragment-window-capacity-mismatch",
    "capacity",
    "fragment window capacity does not match the requested page remainder and bounds",
  ))
  if (window.cursorBefore.stateFingerprint !== expectation.cursorBeforeStateFingerprint) issues.push(issue(
    "fragment-window-cursor-stale",
    "cursorBefore.stateFingerprint",
    "fragment window cursor does not match requested family progress",
  ))
  return issues.length === 0
    ? { status: "ready", window, issues: [] }
    : { status: "blocked", window: null, issues }
}
