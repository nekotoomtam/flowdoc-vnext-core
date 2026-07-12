import {
  VNEXT_TABLE_RENDERER_SOURCE,
  VNEXT_TABLE_RENDERER_VERSION,
  VNextTableRendererPageOriginV1Schema,
  VNextTableRendererStyleProfileV1Schema,
  type VNextTableRenderBorderCommandV1,
  type VNextTableRenderBoundsV1,
  type VNextTableRenderCommandV1,
  type VNextTableRendererIssueV1,
  type VNextTableRendererPageOriginV1,
  type VNextTableRendererProjectionRequestV1,
  type VNextTableRendererProjectionResultV1,
  type VNextTableRendererStyleProfileV1,
} from "./tableRendererContractV1.js"

function roundPt(value: number): number {
  return Number(value.toFixed(6))
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function issue(
  code: string,
  path: string,
  message: string,
  context: Partial<Pick<VNextTableRendererIssueV1, "pageIndex" | "rowFragmentId" | "sourceCellId" | "candidateId">> = {},
): VNextTableRendererIssueV1 {
  return { code, path, message, severity: "error", ...context }
}

function blocked(tableId: string, issues: VNextTableRendererIssueV1[]): VNextTableRendererProjectionResultV1 {
  return {
    source: VNEXT_TABLE_RENDERER_SOURCE,
    contractVersion: VNEXT_TABLE_RENDERER_VERSION,
    status: "blocked",
    tableId,
    commands: null,
    issues,
  }
}

function bounds(xPt: number, yPt: number, widthPt: number, heightPt: number): VNextTableRenderBoundsV1 {
  return {
    xPt: roundPt(xPt),
    yPt: roundPt(yPt),
    widthPt: roundPt(widthPt),
    heightPt: roundPt(heightPt),
  }
}

function alignmentOffset(align: "top" | "middle" | "bottom", slackPt: number): number {
  if (align === "middle") return roundPt(slackPt / 2)
  return align === "bottom" ? roundPt(slackPt) : 0
}

function rowBackground(
  profile: VNextTableRendererStyleProfileV1,
  role: "header" | "body" | "footer" | "empty-state",
  repeatedHeader: boolean,
): string | null {
  return (repeatedHeader ? profile.rowBackgrounds["repeated-header"] : profile.rowBackgrounds[role])
    ?? profile.defaultCellBackground
}

function addParseIssues(
  issues: VNextTableRendererIssueV1[],
  path: string,
  parsed: { success: false; error: { issues: Array<{ path: PropertyKey[]; message: string }> } },
): void {
  parsed.error.issues.forEach((item) => issues.push(issue(
    "invalid-renderer-input",
    [path, ...item.path.map(String)].join("."),
    item.message,
  )))
}

export function projectVNextTableRendererCommandsV1(
  request: VNextTableRendererProjectionRequestV1,
): VNextTableRendererProjectionResultV1 {
  const tableId = request.pagination.status === "paginated" ? request.pagination.tableId : "unknown-table"
  const issues: VNextTableRendererIssueV1[] = []
  if (request.contractVersion !== VNEXT_TABLE_RENDERER_VERSION || request.kind !== "table-renderer-projection-request") {
    issues.push(issue("invalid-renderer-request", "request", "renderer request must satisfy the v1 contract discriminator"))
  }
  if (typeof request.sectionId !== "string" || request.sectionId.trim().length === 0) issues.push(issue(
    "invalid-section-id", "sectionId", "section id must not be blank",
  ))
  if (typeof request.zoneId !== "string" || request.zoneId.trim().length === 0) issues.push(issue(
    "invalid-zone-id", "zoneId", "zone id must not be blank",
  ))
  if (request.pagination.status !== "paginated") issues.push(issue(
    "pagination-not-ready", "pagination.status", "accepted Table pagination is required before renderer projection",
  ))
  const originsParsed = VNextTableRendererPageOriginV1Schema.array().safeParse(request.pageOrigins)
  const styleParsed = VNextTableRendererStyleProfileV1Schema.safeParse(request.styleProfile)
  if (!originsParsed.success) addParseIssues(issues, "pageOrigins", originsParsed)
  if (!styleParsed.success) addParseIssues(issues, "styleProfile", styleParsed)
  if (issues.length > 0 || request.pagination.status !== "paginated" || !originsParsed.success || !styleParsed.success) {
    return blocked(tableId, issues)
  }
  const pagination = request.pagination
  const origins = originsParsed.data
  const profile = styleParsed.data
  if (typeof request.expectedPaginationFingerprint !== "string"
    || request.expectedPaginationFingerprint !== pagination.fingerprint) issues.push(issue(
    "pagination-fingerprint-mismatch",
    "expectedPaginationFingerprint",
    "renderer request fingerprint pin does not match accepted pagination",
  ))

  const originsByPage = new Map<number, VNextTableRendererPageOriginV1>()
  origins.forEach((origin, index) => {
    if (originsByPage.has(origin.pageIndex)) issues.push(issue(
      "duplicate-page-origin", `pageOrigins[${index}].pageIndex`, `page origin ${origin.pageIndex} is duplicated`,
      { pageIndex: origin.pageIndex },
    ))
    originsByPage.set(origin.pageIndex, origin)
  })
  pagination.pages.forEach((page) => {
    if (!originsByPage.has(page.pageIndex)) issues.push(issue(
      "missing-page-origin", "pageOrigins", `page origin ${page.pageIndex} is missing`, { pageIndex: page.pageIndex },
    ))
  })
  origins.forEach((origin, index) => {
    if (!pagination.pages.some((page) => page.pageIndex === origin.pageIndex)) issues.push(issue(
      "unexpected-page-origin", `pageOrigins[${index}]`, `page origin ${origin.pageIndex} has no pagination page`,
      { pageIndex: origin.pageIndex },
    ))
  })

  let tableWidthPt: number | null = null
  const expectedEdges = new Set<string>()
  pagination.pages.forEach((page, pageArrayIndex) => {
    if (pageArrayIndex > 0 && page.pageIndex <= pagination.pages[pageArrayIndex - 1].pageIndex) issues.push(issue(
      "page-order-invalid", `pagination.pages[${pageArrayIndex}].pageIndex`, "pagination pages must be strictly ordered",
      { pageIndex: page.pageIndex },
    ))
    if (![page.bodyHeightPt, page.availableHeightPt, page.usedHeightPt, page.remainingHeightPt].every(Number.isFinite)
      || page.bodyHeightPt <= 0 || page.availableHeightPt < 0 || page.usedHeightPt < 0
      || page.usedHeightPt > page.availableHeightPt
      || Math.abs(page.availableHeightPt - page.usedHeightPt - page.remainingHeightPt) > 1e-6) issues.push(issue(
      "invalid-page-geometry", `pagination.pages[${pageArrayIndex}]`, "page height facts are invalid or inconsistent",
      { pageIndex: page.pageIndex },
    ))
    let expectedY = 0
    page.rows.forEach((row, rowIndex) => {
      const context = { pageIndex: page.pageIndex, rowFragmentId: row.fragmentId }
      if (!Number.isFinite(row.yOffsetPt) || !Number.isFinite(row.heightPt) || row.heightPt < 0
        || Math.abs(row.yOffsetPt - expectedY) > 1e-6
        || row.yOffsetPt + row.heightPt > page.usedHeightPt + 1e-6) issues.push(issue(
        "invalid-row-fragment-geometry", `pagination.pages[${pageArrayIndex}].rows[${rowIndex}]`,
        "row fragments must be finite, contiguous, and bounded by used page height", context,
      ))
      expectedY = roundPt(row.yOffsetPt + row.heightPt)
      let expectedCellX = 0
      row.cells.forEach((cell, cellIndex) => {
        const cellContext = { ...context, sourceCellId: cell.sourceCellId }
        const horizontalTotal = roundPt(cell.insetsPt.left + cell.contentWidthPt + cell.insetsPt.right)
        if (![cell.xOffsetPt, cell.outerWidthPt, cell.contentWidthPt, cell.usedHeightPt,
          cell.insetsPt.top, cell.insetsPt.right, cell.insetsPt.bottom, cell.insetsPt.left].every(Number.isFinite)
          || cell.outerWidthPt <= 0 || cell.contentWidthPt < 0 || cell.usedHeightPt < 0
          || cell.usedHeightPt > row.heightPt + 1e-6
          || Math.abs(cell.xOffsetPt - expectedCellX) > 1e-6
          || Math.abs(horizontalTotal - cell.outerWidthPt) > 1e-6) issues.push(issue(
          "invalid-cell-fragment-geometry",
          `pagination.pages[${pageArrayIndex}].rows[${rowIndex}].cells[${cellIndex}]`,
          "cell fragments must be contiguous, bounded, and retain exact inset/content width geometry",
          cellContext,
        ))
        expectedCellX = roundPt(cell.xOffsetPt + cell.outerWidthPt)
        cell.placements.forEach((placement, placementIndex) => {
          const candidate = placement.candidate
          const candidateContext = { ...cellContext, candidateId: candidate.candidateId }
          if (!Number.isFinite(placement.yOffsetPt) || !Number.isFinite(candidate.heightPt)
            || placement.yOffsetPt < 0 || candidate.heightPt < 0
            || placement.yOffsetPt + candidate.heightPt > cell.usedHeightPt + 1e-6) issues.push(issue(
            "candidate-outside-cell-fragment",
            `pagination.pages[${pageArrayIndex}].rows[${rowIndex}].cells[${cellIndex}].placements[${placementIndex}]`,
            "candidate placement must fit the accepted cell fragment", candidateContext,
          ))
          if ((candidate.kind === "text-line" || candidate.kind === "image")
            && (!Number.isFinite(candidate.widthPt) || candidate.widthPt < 0
              || candidate.widthPt > cell.contentWidthPt + 1e-6)) issues.push(issue(
            "candidate-width-outside-cell",
            `pagination.pages[${pageArrayIndex}].rows[${rowIndex}].cells[${cellIndex}].placements[${placementIndex}]`,
            "text/image candidate width must fit accepted cell content width", candidateContext,
          ))
          if (candidate.kind === "image" && candidate.assetId == null && profile.missingMediaPolicy === "block") {
            issues.push(issue(
              "missing-image-asset", `pagination.pages[${pageArrayIndex}].rows[${rowIndex}].cells[${cellIndex}].placements[${placementIndex}]`,
              "missing image asset is blocked by the render style profile", candidateContext,
            ))
          }
        })
      })
      if (row.cells.length === 0) issues.push(issue(
        "row-without-cells", `pagination.pages[${pageArrayIndex}].rows[${rowIndex}].cells`,
        "renderer projection requires at least one cell per row fragment", context,
      ))
      if (tableWidthPt == null && row.cells.length > 0) tableWidthPt = expectedCellX
      else if (row.cells.length > 0 && Math.abs((tableWidthPt ?? 0) - expectedCellX) > 1e-6) issues.push(issue(
        "table-width-drift", `pagination.pages[${pageArrayIndex}].rows[${rowIndex}].cells`,
        "every row fragment must resolve to one stable Table width", context,
      ))
    })
    if (Math.abs(expectedY - page.usedHeightPt) > 1e-6) issues.push(issue(
      "page-used-height-drift", `pagination.pages[${pageArrayIndex}].usedHeightPt`,
      "page used height must equal the end of its final row fragment", { pageIndex: page.pageIndex },
    ))
  })
  if (issues.length > 0) return blocked(tableId, issues)

  const commands: VNextTableRenderCommandV1[] = []
  let segmentCount = 0
  let rowFragmentCount = 0
  let cellFragmentCount = 0
  let candidateCount = 0
  let borderCount = 0
  const widthPt = tableWidthPt ?? 0
  pagination.pages.forEach((page) => {
    const origin = originsByPage.get(page.pageIndex)
    if (origin == null) throw new Error("validated page origin missing")
    const pageId = `table-render:page:${page.pageIndex}`
    commands.push({
      id: pageId, kind: "page", pageIndex: page.pageIndex,
      sectionId: request.sectionId, zoneId: request.zoneId, tableId,
      bounds: bounds(origin.xPt, origin.yPt, widthPt, page.bodyHeightPt),
      bodyHeightPt: page.bodyHeightPt, availableHeightPt: page.availableHeightPt,
    })
    if (page.rows.length === 0) return
    segmentCount += 1
    const segmentId = `table-render:segment:${page.pageIndex}`
    const nonRepeatedRows = page.rows.filter((row) => !row.repeatedHeader)
    const firstBody = nonRepeatedRows[0]
    const lastBody = nonRepeatedRows[nonRepeatedRows.length - 1]
    const continuesFromPreviousPage = firstBody != null && firstBody.rowFragmentIndex > 0
    const continuesOnNextPage = lastBody != null && !lastBody.complete
    commands.push({
      id: segmentId, kind: "table-segment", parentId: pageId, pageIndex: page.pageIndex,
      sectionId: request.sectionId, zoneId: request.zoneId, tableId,
      bounds: bounds(origin.xPt, origin.yPt, widthPt, page.usedHeightPt),
      styleProfileId: profile.profileId, continuesFromPreviousPage, continuesOnNextPage,
    })

    page.rows.forEach((row) => {
      const backgroundRowOrdinal = rowFragmentCount
      rowFragmentCount += 1
      const fill = rowBackground(profile, row.rowRole, row.repeatedHeader)
      if (fill == null) return
      row.cells.forEach((cell) => commands.push({
        id: `table-render:background:${page.pageIndex}:${backgroundRowOrdinal}:${cell.cellIndex}`,
        kind: "cell-background", parentId: segmentId, pageIndex: page.pageIndex,
        sectionId: request.sectionId, zoneId: request.zoneId, tableId,
        rowFragmentId: row.fragmentId, sourceCellId: cell.sourceCellId, color: fill,
        bounds: bounds(
          origin.xPt + cell.xOffsetPt, origin.yPt + row.yOffsetPt,
          cell.outerWidthPt, row.heightPt,
        ),
      }))
    })

    let rowOrdinal = 0
    page.rows.forEach((row) => {
      const rowId = `table-render:row:${page.pageIndex}:${rowOrdinal}`
      commands.push({
        id: rowId, kind: "row-fragment", parentId: segmentId, pageIndex: page.pageIndex,
        sectionId: request.sectionId, zoneId: request.zoneId, tableId,
        bounds: bounds(origin.xPt, origin.yPt + row.yOffsetPt, widthPt, row.heightPt),
        rowFragmentId: row.fragmentId, rowIndex: row.rowIndex,
        rowFragmentIndex: row.rowFragmentIndex, rowKey: row.rowKey, rowKind: row.rowKind,
        rowRole: row.rowRole, repeatedHeader: row.repeatedHeader, complete: row.complete,
      })
      row.cells.forEach((cell) => {
        cellFragmentCount += 1
        const cellId = `${rowId}:cell:${cell.cellIndex}`
        const slackPt = roundPt(row.heightPt - cell.usedHeightPt)
        const contentOffsetYPt = alignmentOffset(cell.verticalAlign, slackPt)
        commands.push({
          id: cellId, kind: "cell-fragment", parentId: rowId, pageIndex: page.pageIndex,
          sectionId: request.sectionId, zoneId: request.zoneId, tableId,
          bounds: bounds(
            origin.xPt + cell.xOffsetPt, origin.yPt + row.yOffsetPt,
            cell.outerWidthPt, row.heightPt,
          ),
          rowFragmentId: row.fragmentId, sourceCellId: cell.sourceCellId, cellIndex: cell.cellIndex,
          contentUsedHeightPt: cell.usedHeightPt, contentOffsetYPt,
          verticalAlign: cell.verticalAlign, complete: cell.complete,
        })
        const contentX = roundPt(origin.xPt + cell.xOffsetPt + cell.insetsPt.left)
        const contentY = roundPt(origin.yPt + row.yOffsetPt + contentOffsetYPt)
        cell.placements.forEach((placement) => {
          candidateCount += 1
          const candidate = placement.candidate
          const base = {
            id: `${cellId}:candidate:${candidate.candidateIndex}`,
            parentId: cellId,
            pageIndex: page.pageIndex,
            sectionId: request.sectionId,
            zoneId: request.zoneId,
            tableId,
            rowFragmentId: row.fragmentId,
            sourceCellId: cell.sourceCellId,
            candidateId: candidate.candidateId,
            nodeId: candidate.nodeId,
            candidateIndex: candidate.candidateIndex,
          }
          const yPt = roundPt(contentY + placement.yOffsetPt)
          if (candidate.kind === "text-line") commands.push({
            ...base, kind: "text-line", text: candidate.text, color: profile.textColorFallback,
            bounds: bounds(contentX, yPt, candidate.widthPt, candidate.heightPt),
            sourceStart: clone(candidate.sourceStart), sourceEnd: clone(candidate.sourceEnd),
          })
          else if (candidate.kind === "image") {
            const imageX = candidate.align === "center"
              ? contentX + (cell.contentWidthPt - candidate.widthPt) / 2
              : candidate.align === "right" ? contentX + cell.contentWidthPt - candidate.widthPt : contentX
            commands.push({
              ...base, kind: "image", align: candidate.align,
              bounds: bounds(imageX, yPt, candidate.widthPt, candidate.heightPt),
              assetId: candidate.assetId, assetOwner: candidate.assetOwner,
              placeholder: candidate.assetId == null,
            })
          } else if (candidate.kind === "divider") commands.push({
            ...base, kind: "divider", color: profile.internalRowBorder.color,
            bounds: bounds(
              contentX, yPt + candidate.marginBeforePt, cell.contentWidthPt, candidate.thicknessPt,
            ),
            thicknessPt: candidate.thicknessPt,
          })
          else commands.push({
            ...base, kind: "spacer",
            bounds: bounds(contentX, yPt, cell.contentWidthPt, candidate.heightPt),
          })
        })
      })
      rowOrdinal += 1
    })

    const borders: VNextTableRenderBorderCommandV1[] = []
    page.rows.forEach((row, pageRowIndex) => {
      row.cells.forEach((cell) => {
        if (cell.cellIndex === 0) return
        borders.push({
          id: `table-render:border:column:${page.pageIndex}:${pageRowIndex}:${cell.cellIndex}`,
          kind: "border", parentId: `table-render:row:${page.pageIndex}:${pageRowIndex}:cell:${cell.cellIndex}`,
          ownerKind: "cell-fragment", semanticRole: "internal-column", edge: "left",
          pageIndex: page.pageIndex, sectionId: request.sectionId, zoneId: request.zoneId, tableId,
          bounds: bounds(
            origin.xPt + cell.xOffsetPt, origin.yPt + row.yOffsetPt, 0, row.heightPt,
          ),
          style: profile.internalColumnBorder,
        })
      })
      if (row.complete && pageRowIndex < page.rows.length - 1) borders.push({
        id: `table-render:border:row:${page.pageIndex}:${pageRowIndex}`,
        kind: "border", parentId: `table-render:row:${page.pageIndex}:${pageRowIndex}`,
        ownerKind: "row-fragment", semanticRole: "internal-row", edge: "bottom",
        pageIndex: page.pageIndex, sectionId: request.sectionId, zoneId: request.zoneId, tableId,
        bounds: bounds(origin.xPt, origin.yPt + row.yOffsetPt + row.heightPt, widthPt, 0),
        style: profile.internalRowBorder,
      })
    })
    const outer = [
      ["top", bounds(origin.xPt, origin.yPt, widthPt, 0)],
      ["right", bounds(origin.xPt + widthPt, origin.yPt, 0, page.usedHeightPt)],
      ["bottom", bounds(origin.xPt, origin.yPt + page.usedHeightPt, widthPt, 0)],
      ["left", bounds(origin.xPt, origin.yPt, 0, page.usedHeightPt)],
    ] as const
    outer.forEach(([edge, edgeBounds]) => borders.push({
      id: `table-render:border:outer:${page.pageIndex}:${edge}`,
      kind: "border", parentId: segmentId, ownerKind: "table-segment",
      semanticRole: edge === "bottom" && continuesOnNextPage ? "continuation" : "outer",
      edge, pageIndex: page.pageIndex, sectionId: request.sectionId, zoneId: request.zoneId, tableId,
      bounds: edgeBounds, style: profile.outerBorder,
    }))
    borders.forEach((border) => {
      const orientation = border.bounds.widthPt === 0 ? "vertical" : "horizontal"
      const edgeKey = JSON.stringify([
        border.pageIndex, orientation, border.bounds.xPt, border.bounds.yPt,
        border.bounds.widthPt, border.bounds.heightPt,
      ])
      if (expectedEdges.has(edgeKey)) issues.push(issue(
        "duplicate-border-owner", "commands", `border edge ${edgeKey} has more than one owner`,
        { pageIndex: border.pageIndex },
      ))
      expectedEdges.add(edgeKey)
    })
    borderCount += borders.length
    commands.push(...borders)
  })
  if (issues.length > 0) return blocked(tableId, issues)
  return {
    source: VNEXT_TABLE_RENDERER_SOURCE,
    contractVersion: VNEXT_TABLE_RENDERER_VERSION,
    status: "consumable",
    tableId,
    sectionId: request.sectionId,
    zoneId: request.zoneId,
    styleProfileId: profile.profileId,
    paginationFingerprint: pagination.fingerprint,
    commands,
    fingerprint: JSON.stringify([pagination.fingerprint, origins, profile, commands]),
    summary: {
      pageCount: pagination.pages.length,
      segmentCount,
      rowFragmentCount,
      cellFragmentCount,
      candidateCount,
      borderCount,
      commandCount: commands.length,
    },
    work: {
      pageVisitCount: pagination.pages.length,
      rowVisitCount: rowFragmentCount,
      cellVisitCount: cellFragmentCount,
      candidateVisitCount: candidateCount,
      borderEmitCount: borderCount,
    },
    contracts: {
      authoredDocumentInput: false,
      measurementExecution: false,
      paginationExecution: false,
      relayout: false,
    },
    issues: [],
  }
}
