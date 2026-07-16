function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function flattenStrings(value) {
  if (Array.isArray(value)) return value.flatMap(flattenStrings)
  return [String(value)]
}

function elementContentItems(element) {
  if (element.kind === "text") return flattenStrings(element.lines)
  if (element.kind === "table") return flattenStrings([element.headers, element.rows])
  return []
}

function nonWhitespaceLength(values) {
  return values.join("").replace(/\s+/gu, "").length
}

function pageContentItems(page) {
  return page.elements.flatMap(elementContentItems)
}

function fail(issues) {
  if (issues.length === 0) return
  throw new Error(`Canonical report content parity failed:\n- ${issues.join("\n- ")}`)
}

export function applyCanonicalReportPagePatches(inputComposition, pagePatches) {
  const composition = clone(inputComposition)
  const issues = []
  for (const pagePatch of pagePatches) {
    const page = composition.pages.find((candidate) => candidate.pageId === pagePatch.pageId)
    if (page == null) {
      issues.push(`page patch targets unknown page ${pagePatch.pageId}`)
      continue
    }
    for (const operation of pagePatch.operations) {
      const element = clone(operation.element)
      const existingIndex = page.elements.findIndex((candidate) => candidate.id === element.id)
      if (operation.kind === "replace") {
        if (existingIndex === -1) {
          issues.push(`${page.pageId}/${element.id} cannot replace a missing element`)
        } else {
          page.elements[existingIndex] = element
        }
        continue
      }
      if (operation.kind === "merge") {
        if (existingIndex === -1) {
          issues.push(`${page.pageId}/${element.id} cannot merge a missing element`)
        } else {
          page.elements[existingIndex] = { ...page.elements[existingIndex], ...element }
        }
        continue
      }
      if (operation.kind === "insert-after") {
        if (existingIndex !== -1) {
          issues.push(`${page.pageId}/${element.id} cannot insert a duplicate element`)
          continue
        }
        const anchorIndex = page.elements.findIndex(
          (candidate) => candidate.id === operation.afterElementId,
        )
        if (anchorIndex === -1) {
          issues.push(`${page.pageId}/${element.id} has unknown anchor ${operation.afterElementId}`)
        } else {
          page.elements.splice(anchorIndex + 1, 0, element)
        }
        continue
      }
      issues.push(`${page.pageId}/${element.id} has unsupported operation ${operation.kind}`)
    }
  }
  fail(issues)
  return composition
}

export function validateCanonicalReportContentParity(composition, manifest) {
  const issues = []
  if (composition.pages.length !== manifest.expectedPageCount) {
    issues.push(`expected ${manifest.expectedPageCount} pages, found ${composition.pages.length}`)
  }
  const elementByKey = new Map()
  for (const page of composition.pages) {
    const seen = new Set()
    for (const element of page.elements) {
      if (seen.has(element.id)) issues.push(`${page.pageId} contains duplicate element ${element.id}`)
      seen.add(element.id)
      elementByKey.set(`${page.pageId}/${element.id}`, element)
    }
  }

  for (const requirement of manifest.requiredElements) {
    const key = `${requirement.pageId}/${requirement.elementId}`
    const element = elementByKey.get(key)
    if (element == null) {
      issues.push(`required element ${key} is missing`)
    } else if (requirement.kind != null && element.kind !== requirement.kind) {
      issues.push(`required element ${key} must be ${requirement.kind}`)
    }
  }

  for (const requirement of manifest.requiredTableRows) {
    const key = `${requirement.pageId}/${requirement.elementId}`
    const element = elementByKey.get(key)
    if (element?.kind !== "table") {
      issues.push(`required table ${key} is missing`)
    } else if (element.rows.length !== requirement.rowCount) {
      issues.push(`required table ${key} must retain ${requirement.rowCount} rows`)
    }
  }

  for (const requirement of manifest.requiredExactItems) {
    const key = `${requirement.pageId}/${requirement.elementId}`
    const element = elementByKey.get(key)
    if (element == null || !elementContentItems(element).includes(requirement.text)) {
      issues.push(`required exact content is missing from ${key}: ${JSON.stringify(requirement.text)}`)
    }
  }

  for (const requirement of manifest.requiredPageText) {
    const page = composition.pages.find((candidate) => candidate.pageId === requirement.pageId)
    const text = page == null ? "" : pageContentItems(page).join("\n")
    if (!text.includes(requirement.text)) {
      issues.push(`required page content is missing from ${requirement.pageId}: ${JSON.stringify(requirement.text)}`)
    }
  }

  const fixedPageText = composition.pages.flatMap((page) => [
    "OCR BENCHMARK | INV_9437125258",
    `รายงานผลการทดสอบ | หน้า ${page.pageNumber}`,
  ])
  const compositionNonWhitespaceCharacters = nonWhitespaceLength([
    ...fixedPageText,
    ...composition.pages.flatMap(pageContentItems),
  ])
  const referenceNonWhitespaceCharacters = manifest.coverage.referenceExtractedNonWhitespaceCharacters
  const referenceCoverageRatio = compositionNonWhitespaceCharacters / referenceNonWhitespaceCharacters
  if (referenceCoverageRatio < manifest.coverage.minimumReferenceRatio) {
    issues.push(
      `content coverage ${referenceCoverageRatio.toFixed(4)} is below ${manifest.coverage.minimumReferenceRatio}`,
    )
  }
  fail(issues)

  return {
    manifestId: manifest.manifestId,
    parityLevel: manifest.claim.parityLevel,
    verbatimSentenceParity: manifest.claim.verbatimSentenceParity,
    visualParity: manifest.claim.visualParity,
    requiredElementCount: manifest.requiredElements.length,
    requiredTableCount: manifest.requiredTableRows.length,
    requiredExactItemCount: manifest.requiredExactItems.length,
    requiredPageTextCount: manifest.requiredPageText.length,
    referenceNonWhitespaceCharacters,
    compositionNonWhitespaceCharacters,
    referenceCoverageRatio: Number(referenceCoverageRatio.toFixed(6)),
  }
}

export function materializeCanonicalReportContentParity(baseComposition, manifest) {
  const issues = []
  if (manifest.manifestVersion !== 1) issues.push("manifestVersion must be 1")
  if (manifest.baseCompositionId !== baseComposition.compositionId) {
    issues.push("base composition identity does not match")
  }
  if (manifest.referenceArtifactSha256 !== baseComposition.referenceArtifact.sha256) {
    issues.push("reference artifact identity does not match")
  }
  fail(issues)

  const metadata = clone(baseComposition)
  metadata.compositionVersion = manifest.outputComposition.version
  metadata.compositionId = manifest.outputComposition.compositionId
  metadata.contentParityManifestId = manifest.manifestId
  const composition = applyCanonicalReportPagePatches(metadata, manifest.pagePatches)
  const evidence = validateCanonicalReportContentParity(composition, manifest)
  return { composition, evidence }
}
