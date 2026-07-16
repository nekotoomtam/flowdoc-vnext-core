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

export function materializeCanonicalReportContentParity(
  baseComposition: any,
  manifest: any,
): {
  composition: any
  evidence: CanonicalReportContentParityEvidence
}
