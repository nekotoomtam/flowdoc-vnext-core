import {
  applyCanonicalReportPagePatches,
  validateCanonicalReportContentParity,
} from "./canonical-report-content-parity.mjs"

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function fail(issues) {
  if (issues.length === 0) return
  throw new Error(`Canonical report typography calibration failed:\n- ${issues.join("\n- ")}`)
}

function lineCount(value) {
  return Array.isArray(value) ? value.length : 1
}

export function materializeCanonicalReportTypographyCalibration(
  contentComposition,
  typographyManifest,
  contentManifest,
) {
  const issues = []
  if (typographyManifest.manifestVersion !== 1) issues.push("manifestVersion must be 1")
  if (typographyManifest.baseCompositionId !== contentComposition.compositionId) {
    issues.push("base content composition identity does not match")
  }
  if (typographyManifest.contentParityManifestId !== contentComposition.contentParityManifestId) {
    issues.push("content parity manifest identity does not match")
  }
  fail(issues)

  const metadata = clone(contentComposition)
  metadata.compositionVersion = typographyManifest.outputComposition.version
  metadata.compositionId = typographyManifest.outputComposition.compositionId
  metadata.measurementProfileId = typographyManifest.outputComposition.measurementProfileId
  metadata.typographyManifestId = typographyManifest.manifestId
  metadata.fontIds = [...typographyManifest.fontIds]
  for (const [styleId, patch] of Object.entries(typographyManifest.stylePatches)) {
    if (metadata.styles[styleId] == null) {
      issues.push(`style patch targets unknown style ${styleId}`)
    } else {
      metadata.styles[styleId] = { ...metadata.styles[styleId], ...clone(patch) }
    }
  }
  fail(issues)

  const composition = applyCanonicalReportPagePatches(metadata, typographyManifest.pagePatches)
  const contentEvidence = validateCanonicalReportContentParity(composition, contentManifest)

  for (const requirement of typographyManifest.requiredStyles) {
    const style = composition.styles[requirement.styleId]
    if (style == null) {
      issues.push(`required style ${requirement.styleId} is missing`)
      continue
    }
    if (style.fontSizePt < requirement.minimumFontSizePt) {
      issues.push(`${requirement.styleId} font size is below ${requirement.minimumFontSizePt} pt`)
    }
    if (style.fontId !== requirement.fontId) {
      issues.push(`${requirement.styleId} must use ${requirement.fontId}`)
    }
  }

  let tableCount = 0
  for (const page of composition.pages) {
    for (const element of page.elements) {
      if (element.kind !== "table") continue
      tableCount += 1
      if (element.fontSizePt < typographyManifest.tableAcceptance.minimumBodyFontSizePt) {
        issues.push(`${page.pageId}/${element.id} body font is too small`)
      }
      if ((element.headerFontSizePt ?? element.fontSizePt)
        < typographyManifest.tableAcceptance.minimumHeaderFontSizePt) {
        issues.push(`${page.pageId}/${element.id} header font is too small`)
      }
      if (element.fontId !== typographyManifest.tableAcceptance.bodyFontId) {
        issues.push(`${page.pageId}/${element.id} must use the calibrated body font`)
      }
      if (element.headerFontId !== typographyManifest.tableAcceptance.headerFontId) {
        issues.push(`${page.pageId}/${element.id} must use the calibrated header font`)
      }
      const headerLineHeight = element.headerLineHeightPt ?? element.lineHeightPt
      const headerLines = Math.max(...element.headers.map(lineCount))
      if (headerLines * headerLineHeight + 4 > element.headerHeightPt) {
        issues.push(`${page.pageId}/${element.id} header height cannot contain explicit lines`)
      }
      element.rows.forEach((row, rowIndex) => {
        const rowHeight = element.rowHeightsPt?.[rowIndex] ?? element.rowHeightPt
        const rowLines = Math.max(...row.map(lineCount))
        if (rowLines * element.lineHeightPt + 4 > rowHeight) {
          issues.push(`${page.pageId}/${element.id} row ${rowIndex + 1} cannot contain explicit lines`)
        }
      })
    }
  }
  if (tableCount !== typographyManifest.tableAcceptance.expectedTableCount) {
    issues.push(`expected ${typographyManifest.tableAcceptance.expectedTableCount} tables, found ${tableCount}`)
  }
  fail(issues)

  const boldFontId = typographyManifest.tableAcceptance.headerFontId
  const boldTextElementCount = composition.pages.reduce((total, page) => (
    total + page.elements.filter((element) => (
      element.kind === "text"
      && (element.styleOverrides?.fontId ?? composition.styles[element.style]?.fontId) === boldFontId
    )).length
  ), 0)

  return {
    composition,
    contentEvidence,
    evidence: {
      manifestId: typographyManifest.manifestId,
      fontIds: [...typographyManifest.fontIds],
      requiredStyleCount: typographyManifest.requiredStyles.length,
      calibratedTableCount: tableCount,
      minimumBodyFontSizePt: typographyManifest.requiredStyles.find(
        (item) => item.styleId === "body",
      ).minimumFontSizePt,
      minimumTableBodyFontSizePt: typographyManifest.tableAcceptance.minimumBodyFontSizePt,
      minimumTableHeaderFontSizePt: typographyManifest.tableAcceptance.minimumHeaderFontSizePt,
      boldTextElementCount,
    },
  }
}
