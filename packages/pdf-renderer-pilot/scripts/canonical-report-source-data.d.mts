export interface CanonicalReportSourceDataMaterialization {
  composition: any
  evidence: {
    manifestId: string
    sourceSnapshotSha256: string
    sourceFileCount: number
    bindingCount: number
    sourceScalarValueCount: number
    factualCorrectionCount: number
    corrections: Array<{
      pageId: string
      elementId: string
      property: string
      path: Array<string | number>
      before: string
      after: string
      lineage: string[]
    }>
  }
}

export function deriveCanonicalReportSourceSnapshot(sourceBundle: any): any
export function validateCanonicalReportSourceFiles(manifest: any, sourceFilesById: Record<string, Uint8Array>): any
export function materializeCanonicalReportSourceData(
  typographyComposition: any,
  manifest: any,
  sourceFilesById?: Record<string, Uint8Array> | null,
): CanonicalReportSourceDataMaterialization
export function canonicalReportSourceSnapshotSha256(snapshot: any): string
