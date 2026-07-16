export interface CanonicalReportTypographyCalibrationEvidence {
  manifestId: string
  fontIds: string[]
  requiredStyleCount: number
  calibratedTableCount: number
  minimumBodyFontSizePt: number
  minimumTableBodyFontSizePt: number
  minimumTableHeaderFontSizePt: number
  boldTextElementCount: number
}

export function materializeCanonicalReportTypographyCalibration(
  contentComposition: any,
  typographyManifest: any,
  contentManifest: any,
): {
  composition: any
  contentEvidence: import("./canonical-report-content-parity.mjs").CanonicalReportContentParityEvidence
  evidence: CanonicalReportTypographyCalibrationEvidence
}
