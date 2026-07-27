import type { VNextTextBlockV4MeasurementRequest } from
  "../pagination/textBlockV4Measurement.js"
import type {
  VNextTextBlockMultiRunFontFaceV1,
  VNextTextBlockMultiRunParagraphStyleV1,
  VNextTextBlockResolvedShapingRunV1,
} from "./textBlockMultiRunLayoutContractV1.js"

export interface VNextTextBlockFlowEvidenceInputV2 {
  initialFlowFingerprint: string
  layoutId: string
  measurement: VNextTextBlockV4MeasurementRequest
  layoutUnitPolicyFingerprint: string
  availableWidthLayoutUnit: number
  declaredLineHeightLayoutUnit: number
  paragraphStyle: VNextTextBlockMultiRunParagraphStyleV1
  fontFaces: VNextTextBlockMultiRunFontFaceV1[]
  shapingRuns: VNextTextBlockResolvedShapingRunV1[]
  breakOffsets: number[]
}
