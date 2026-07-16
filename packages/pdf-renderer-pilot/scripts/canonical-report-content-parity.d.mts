export interface CanonicalReportContentParityEvidence {
  manifestId: string
  parityLevel: string
  verbatimSentenceParity: boolean
  visualParity: boolean
  requiredElementCount: number
  requiredTableCount: number
  requiredExactItemCount: number
  requiredPageTextCount: number
  referenceNonWhitespaceCharacters: number
  compositionNonWhitespaceCharacters: number
  referenceCoverageRatio: number
}

export function applyCanonicalReportPagePatches(
  inputComposition: any,
  pagePatches: any[],
): any

export function validateCanonicalReportContentParity(
  composition: any,
  manifest: any,
): CanonicalReportContentParityEvidence

export function materializeCanonicalReportContentParity(
  baseComposition: any,
  manifest: any,
): {
  composition: any
  evidence: CanonicalReportContentParityEvidence
}
