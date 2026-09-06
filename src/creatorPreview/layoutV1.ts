import { z } from "zod"
import { validateVNextCreatorTextContentV1, fingerprintVNextCreatorPreviewV1, type VNextCreatorPreviewOccurrenceTupleV1, type VNextCreatorPreviewValueAddressV1, type VNextCreatorTextDraftV1, type VNextCreatorPreviewSimulationV1, type VNextCreatorTextPreviewIssueV1, type VNextCreatorTextResolvedV1 } from "./contentV1.js"
import { creatorPreviewEngineProviderV1, VNEXT_CREATOR_PREVIEW_LAYOUT_PROFILE_V1 as profile, type VNextCreatorPreviewEngineIdentityV1, type VNextCreatorPreviewMeasurementEngineV1 } from "./engineV1.js"
import { CreatorPreviewLayoutFailureV1, prepareCreatorPreviewLinesV1, type CreatorPreviewClusterV1 } from "./layoutFactsV1.js"
import { registerCreatorEditLayoutV1 } from "./textEditAdmissionV1.js"

const id = z.string().min(1).max(512), revision = z.number().int().nonnegative()
const sourceIdentitySchema = z.object({ definitionId: id, draftId: id, backendRevision: revision, sourceFingerprint: z.string().regex(/^sha256:[a-f0-9]{64}$/u) }).strict()
const requestIdentitySchema = z.object({ sessionId: id, sourceGeneration: revision, simulationRevision: revision, requestId: id }).strict()
const inputSchema = z.object({ draft: z.unknown(), simulation: z.unknown(), sourceIdentity: sourceIdentitySchema, requestIdentity: requestIdentitySchema, engineIdentity: z.unknown() }).strict()
export type VNextCreatorPreviewSourceIdentityV1 = z.infer<typeof sourceIdentitySchema>
export type VNextCreatorPreviewRequestIdentityV1 = z.infer<typeof requestIdentitySchema>
export interface VNextCreatorTextPreviewInputV1 {
  draft: VNextCreatorTextDraftV1; simulation: VNextCreatorPreviewSimulationV1; sourceIdentity: VNextCreatorPreviewSourceIdentityV1
  requestIdentity: VNextCreatorPreviewRequestIdentityV1; engineIdentity: VNextCreatorPreviewEngineIdentityV1
}
export interface VNextCreatorPreviewRectPtV1 { x: number; y: number; width: number; height: number }
export interface VNextCreatorPreviewRegionV1 {
  pageIndex: number; fragmentId: string; lineIndex: number; rectPt: VNextCreatorPreviewRectPtV1
  valueRange: { startUtf16: number; endUtf16: number }; anchorPt: { x: number; y: number; height: number }; kind: "text" | "empty"
}
export interface VNextCreatorPreviewPaintCommandV1 {
  kind: "positioned-glyphs"; authority: "creator-text-preview/1"; pageIndex: number; lineIndex: number; inlineId: string
  text: string; sourceRange: { startUtf16: number; endUtf16: number }; xPt: number; baselinePt: number; advancePt: number
  fontId: "sarabun-regular"; fontSizePt: 12; color: "000000"
  glyphs: { glyphId: number; xPt: number; yPt: number; advancePt: number; clusterUtf16: number }[]
}
export interface VNextCreatorPreviewPageV1 { index: number; widthPt: number; heightPt: number; bodyPt: VNextCreatorPreviewRectPtV1; paintCommands: VNextCreatorPreviewPaintCommandV1[] }
export interface VNextCreatorPreviewOccurrenceV1 { occurrenceId: string; tuple: VNextCreatorPreviewOccurrenceTupleV1; valueAddress: VNextCreatorPreviewValueAddressV1; regions: VNextCreatorPreviewRegionV1[] }
interface ResultIdentity<S = unknown, R = unknown, E = unknown> { sourceIdentity: S; requestIdentity: R; engineIdentity: E }
export type VNextCreatorTextPreviewResultV1 =
  | (ResultIdentity<VNextCreatorPreviewSourceIdentityV1, VNextCreatorPreviewRequestIdentityV1, VNextCreatorPreviewEngineIdentityV1> & { status: "ready"; productionBinding: true; layoutFingerprint: string; pages: VNextCreatorPreviewPageV1[]; occurrences: VNextCreatorPreviewOccurrenceV1[]; validationIssues: VNextCreatorTextPreviewIssueV1[]; issues: [] })
  | (ResultIdentity & { status: "blocked"; productionBinding: false; layoutFingerprint: null; pages: null; occurrences: null; validationIssues: VNextCreatorTextPreviewIssueV1[]; issues: VNextCreatorTextPreviewIssueV1[] })

function materialize(source: VNextCreatorTextResolvedV1, lines: CreatorPreviewClusterV1[][]) {
  const pages: VNextCreatorPreviewPageV1[] = [], regions: VNextCreatorPreviewRegionV1[] = []
  const linesPerPage = Math.floor((profile.pageHeightPt - 72) / 18)
  let emptyAnchor: { x: number; y: number; pageIndex: number; lineIndex: number } | undefined
  lines.forEach((line, lineIndex) => {
    const pageIndex = Math.floor(lineIndex / linesPerPage), y = 36 + (lineIndex % linesPerPage) * 18
    if (!pages[pageIndex]) pages.push({ index: pageIndex, widthPt: profile.pageWidthPt, heightPt: profile.pageHeightPt,
      bodyPt: { x: 36, y: 36, width: profile.pageWidthPt - 72, height: profile.pageHeightPt - 72 }, paintCommands: [] })
    let x = 36, cursor = 0
    while (cursor < line.length) {
      const group: CreatorPreviewClusterV1[] = [line[cursor++]]
      while (cursor < line.length && line[cursor].inlineIndex === group[0].inlineIndex) group.push(line[cursor++])
      const start = group[0].start, end = group.at(-1)!.end, width = group.reduce((total, cluster) => total + cluster.advancePt, 0)
      const baselinePt = y + 14.016 // Sarabun: 12.816pt ascent + 1.2pt half-leading in an 18pt line.
      const command: VNextCreatorPreviewPaintCommandV1 = { kind: "positioned-glyphs", authority: "creator-text-preview/1", pageIndex, lineIndex,
        inlineId: source.inlineIds[group[0].inlineIndex], text: source.text.slice(start, end), sourceRange: { startUtf16: start, endUtf16: end },
        xPt: x, baselinePt, advancePt: width, fontId: "sarabun-regular", fontSizePt: 12, color: "000000", glyphs: [] }
      let pen = x
      for (const cluster of group) {
        if (source.value.length === 0 && cluster.start === source.prefix.length) emptyAnchor = { x: pen, y, pageIndex, lineIndex }
        for (const glyph of cluster.glyphs) {
          command.glyphs.push({ glyphId: glyph.glyphId, xPt: pen + glyph.xOffset * .012, yPt: baselinePt - glyph.yOffset * .012, advancePt: glyph.xAdvance * .012, clusterUtf16: cluster.start })
          pen += glyph.xAdvance * .012
        }
      }
      pages[pageIndex].paintCommands.push(command)
      if (group[0].inlineIndex === 1) regions.push({ pageIndex, lineIndex, fragmentId: JSON.stringify([source.occurrenceId, lineIndex, start, end]),
        rectPt: { x, y, width, height: 18 }, anchorPt: { x, y, height: 18 }, kind: "text", valueRange: { startUtf16: start - source.prefix.length, endUtf16: end - source.prefix.length } })
      x += width
    }
    if (source.value.length === 0 && (!line.length || line.at(-1)!.end === source.prefix.length)) emptyAnchor = { x, y, pageIndex, lineIndex }
  })
  if (source.value.length === 0) {
    if (!emptyAnchor) throw new CreatorPreviewLayoutFailureV1("missing-empty-anchor", "Empty field insertion position unavailable")
    const { x, y, pageIndex, lineIndex } = emptyAnchor
    regions.push({ pageIndex, lineIndex, fragmentId: JSON.stringify([source.occurrenceId, "empty"]), kind: "empty", rectPt: { x, y, width: 0, height: 18 }, anchorPt: { x, y, height: 18 }, valueRange: { startUtf16: 0, endUtf16: 0 } })
  }
  return { pages, occurrences: [{ occurrenceId: source.occurrenceId, tuple: source.tuple, valueAddress: source.valueAddress, regions }] }
}

/** Pure product layout consumer. Engine handles are trusted executable capabilities, never serialized input. */
export function createVNextCreatorTextPreviewLayoutV1(input: unknown, engine: VNextCreatorPreviewMeasurementEngineV1): VNextCreatorTextPreviewResultV1 {
  let identities: ResultIdentity = { sourceIdentity: null, requestIdentity: null, engineIdentity: null }
  let validationIssues: VNextCreatorTextPreviewIssueV1[] = []
  const blocked = (issues: VNextCreatorTextPreviewIssueV1[]): VNextCreatorTextPreviewResultV1 => ({ ...identities, status: "blocked", productionBinding: false, layoutFingerprint: null, pages: null, occurrences: null, validationIssues, issues })
  try {
    if (input != null && typeof input === "object") {
      const value = input as Record<string, unknown>
      identities = structuredClone({ sourceIdentity: value.sourceIdentity ?? null, requestIdentity: value.requestIdentity ?? null, engineIdentity: value.engineIdentity ?? null })
    }
    const parsed = inputSchema.safeParse(input)
    if (!parsed.success) return blocked(parsed.error.issues.map(item => ({ code: "invalid-preview-input", path: item.path.join("."), message: item.message })))
    const admitted = validateVNextCreatorTextContentV1(parsed.data.draft, parsed.data.simulation)
    if (admitted.status === "blocked") return blocked(admitted.issues)
    validationIssues = admitted.validationIssues
    const source = admitted.resolved, { sourceIdentity, requestIdentity, engineIdentity } = parsed.data
    if (sourceIdentity.definitionId !== source.draft.definition.id || sourceIdentity.draftId !== source.draft.draft.id || sourceIdentity.sourceFingerprint !== source.sourceFingerprint
      || requestIdentity.sessionId !== source.simulation.sessionId || requestIdentity.simulationRevision !== source.simulation.simulationRevision) {
      return blocked([{ code: "source-request-mismatch", path: "sourceIdentity", message: "Source or request identity does not match the admitted snapshot" }])
    }
    const provider = creatorPreviewEngineProviderV1(engine)
    if (!provider || fingerprintVNextCreatorPreviewV1(engineIdentity) !== fingerprintVNextCreatorPreviewV1(engine.identity)) return blocked([{ code: "engine-identity-mismatch", path: "engineIdentity", message: "A verified matching product engine is required" }])
    const output = materialize(source, prepareCreatorPreviewLinesV1(source, provider))
    return registerCreatorEditLayoutV1({ sourceIdentity: structuredClone(sourceIdentity), requestIdentity: structuredClone(requestIdentity), engineIdentity: structuredClone(engine.identity), status: "ready", productionBinding: true, ...output, validationIssues, issues: [],
      layoutFingerprint: fingerprintVNextCreatorPreviewV1({ sourceIdentity, requestIdentity, engineIdentity, ...output, validationIssues }) }, source)
  } catch (error) {
    return blocked([{ code: error instanceof CreatorPreviewLayoutFailureV1 ? error.code : "measurement-failed", path: "layout", message: error instanceof Error ? error.message : "Preview layout failed" }])
  }
}
