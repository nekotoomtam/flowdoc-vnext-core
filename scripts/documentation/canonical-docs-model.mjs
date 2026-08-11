import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative, resolve, sep } from "node:path"

export const STRUCTURED_PATHS = Object.freeze({
  manifest: "docs/manifest.json",
  glossary: "docs/glossary.json",
  repositoryIndex: "docs/coordination/REPOSITORY_INDEX.json",
  baseline: "docs/coordination/DEVELOPMENT_BASELINE.json",
  release: "docs/versions/0_1/release.json",
})

export const GENERATED_PATHS = Object.freeze([
  "docs/DOCUMENT_MAP.md",
  "docs/GLOSSARY.md",
  "docs/GLOSSARY_TH.md",
  "docs/versions/0_1/VERSION_OVERVIEW.md",
  "docs/versions/0_1/CAPABILITY_SET.md",
])

const DOCUMENT_KINDS = new Set(["navigation", "glossary", "version-policy", "repository-index", "coordination-boundary", "development-baseline", "current-state", "risk-register", "known-unknowns", "roadmap", "release-composition", "compatibility"])
const SCOPES = new Set(["core", "editor", "backend", "cross-repository"])
const AUDIENCES = new Set(["internal", "public", "both"])
const AUTHORITIES = new Set(["normative", "evidence", "navigation", "explanatory"])
const LIFECYCLES = new Set(["draft", "active", "superseded", "retired"])
const CAPABILITY_MATURITIES = new Set(["planned", "evidence", "accepted", "active", "production", "retired"])
const TERM_LIFECYCLES = new Set(["draft", "active", "compatibility", "retired"])
const FORM_KINDS = new Set(["localized-label", "exact-alias", "historical-alias", "abbreviation", "deprecated-alias", "ambiguous-alias", "explanatory-alias"])
const RECORD_KINDS = new Set(["risk", "unknown", "roadmap"])
const ID_PREFIXES = Object.freeze({ document: "DOC", term: "TERM", concept: "CONCEPT", contract: "CONTRACT", capability: "CAP", risk: "RISK", unknown: "UNKNOWN", gate: "GATE", work: "WORK", baseline: "BASELINE", decision: "DECISION" })
const RECORD_ID_PREFIXES = Object.freeze({ risk: ID_PREFIXES.risk, unknown: ID_PREFIXES.unknown, roadmap: ID_PREFIXES.work })
const REFERENCE_PATTERN = /\b(?:DOC|CONTRACT|CAP|RISK|UNKNOWN|GATE|TERM|CONCEPT|WORK|BASELINE|DECISION)-[A-Z0-9][A-Z0-9-]*\b/g

function fail(message) {
  throw new Error(`Canonical documentation model: ${message}`)
}

function object(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be a plain object`)
  return value
}

function array(value, label) {
  if (!Array.isArray(value)) fail(`${label} must be an array`)
  return value
}

function string(value, label) {
  if (typeof value !== "string" || value.length === 0) fail(`${label} must be a non-empty string`)
  return value
}

function exactFields(value, allowed, label) {
  for (const key of Object.keys(object(value, label))) {
    if (!allowed.includes(key)) fail(`${label} has unknown field ${key}`)
  }
}

function closed(value, values, label) {
  if (!values.has(value)) fail(`${label} must be one of the closed values`)
  return value
}

function id(value, prefix, label) {
  string(value, label)
  if (!new RegExp(`^${prefix}-[A-Z0-9][A-Z0-9-]*$`).test(value)) fail(`${label} must use the ${prefix} prefix for ${label}`)
  return value
}

function decisionId(value, label) {
  id(value, ID_PREFIXES.decision, label)
  if (!/^DECISION-[A-Z][A-Z0-9-]*-[A-Z0-9-]+-\d{8}-\d{2}$/.test(value)) fail(`${label} must match DECISION-<SCOPE>-<SUBSYSTEM>-YYYYMMDD-NN`)
  return value
}

function json(root, path) {
  const absolute = join(root, path)
  if (!existsSync(absolute)) fail(`registered path is missing: ${path}`)
  try {
    return JSON.parse(readFileSync(absolute, "utf8"))
  } catch (error) {
    fail(`invalid JSON at ${path}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function filesBelow(root, rootPath) {
  const absolute = join(root, rootPath)
  if (!existsSync(absolute)) return []
  const entries = []
  for (const name of readdirSync(absolute)) {
    const child = join(absolute, name)
    if (statSync(child).isDirectory()) entries.push(...filesBelow(root, relative(root, child).split(sep).join("/")))
    else entries.push(relative(root, child).split(sep).join("/"))
  }
  return entries
}

function assertInsideRoot(root, path, label) {
  const resolvedRoot = resolve(root)
  const resolvedPath = resolve(root, path)
  if (resolvedPath !== resolvedRoot && !resolvedPath.startsWith(`${resolvedRoot}${sep}`)) fail(`${label} escapes the canonical root`)
}

function parseDocument(record) {
  exactFields(record, ["documentId", "title", "path", "kind", "scope", "audience", "authority", "lifecycle"], "manifest document")
  id(record.documentId, ID_PREFIXES.document, "documentId")
  string(record.title, "document title")
  string(record.path, "document path")
  if (record.path.startsWith("/") || record.path.includes("\\") || record.path.split("/").includes("..")) fail(`document path must be a safe repository-relative path: ${record.path}`)
  closed(record.kind, DOCUMENT_KINDS, "document kind")
  closed(record.scope, SCOPES, "document scope")
  closed(record.audience, AUDIENCES, "document audience")
  closed(record.authority, AUTHORITIES, "document authority")
  closed(record.lifecycle, LIFECYCLES, "document lifecycle")
  return record
}

function parseManifest(value) {
  exactFields(value, ["schemaVersion", "canonicalRoots", "documents"], "manifest")
  if (value.schemaVersion !== 1) fail("manifest schemaVersion must be 1")
  const canonicalRoots = array(value.canonicalRoots, "canonicalRoots")
  if (canonicalRoots.length === 0) fail("canonicalRoots must not be empty")
  for (const root of canonicalRoots) {
    string(root, "canonical root")
    if (!root.startsWith("docs/") || root.includes("..") || root.includes("\\")) fail(`canonical root must be a safe docs path: ${root}`)
  }
  const documents = array(value.documents, "manifest documents").map(parseDocument)
  return { ...value, canonicalRoots, documents }
}

function parseGlossary(value) {
  exactFields(value, ["concepts", "terms", "retiredTermIds"], "glossary")
  const concepts = array(value.concepts, "glossary concepts")
  const terms = array(value.terms, "glossary terms")
  const retiredTermIds = array(value.retiredTermIds, "retiredTermIds")
  for (const concept of concepts) {
    exactFields(concept, ["conceptId"], "concept")
    id(concept.conceptId, ID_PREFIXES.concept, "conceptId")
  }
  for (const term of terms) {
    exactFields(term, ["termId", "conceptId", "lifecycle", "forms", "meansSameAs", "supersededBy"], "term")
    id(term.termId, ID_PREFIXES.term, "termId")
    id(term.conceptId, ID_PREFIXES.concept, "term conceptId")
    closed(term.lifecycle, TERM_LIFECYCLES, "term lifecycle")
    for (const form of array(term.forms, "term forms")) {
      exactFields(form, ["kind", "value"], "lexical form")
      closed(form.kind, FORM_KINDS, "lexical form kind")
      string(form.value, "lexical form value")
    }
    if (term.meansSameAs !== undefined) id(term.meansSameAs, ID_PREFIXES.term, "meansSameAs")
    if (term.supersededBy !== undefined) id(term.supersededBy, ID_PREFIXES.term, "supersededBy")
  }
  for (const retiredTermId of retiredTermIds) id(retiredTermId, ID_PREFIXES.term, "retired term ID")
  return { ...value, concepts, terms, retiredTermIds }
}

function parseRepositoryIndex(value) {
  exactFields(value, ["contracts", "capabilities", "risks", "unknowns", "workItems", "decisions"], "repository index")
  const contracts = array(value.contracts, "contracts")
  const capabilities = array(value.capabilities, "capabilities")
  for (const contract of contracts) {
    exactFields(contract, ["contractId"], "contract")
    id(contract.contractId, ID_PREFIXES.contract, "contractId")
  }
  for (const capability of capabilities) {
    exactFields(capability, ["capabilityId", "maturity", "acceptedGateIds"], "capability")
    id(capability.capabilityId, ID_PREFIXES.capability, "capabilityId")
    closed(capability.maturity, CAPABILITY_MATURITIES, "capability maturity")
    for (const gate of array(capability.acceptedGateIds, "capability acceptedGateIds")) id(gate, ID_PREFIXES.gate, "accepted gate ID")
  }
  for (const [label, prefix] of [["risks", "RISK"], ["unknowns", "UNKNOWN"], ["workItems", "WORK"], ["decisions", "DECISION"]]) {
    for (const entry of array(value[label], label)) {
      if (prefix === ID_PREFIXES.decision) decisionId(entry, label)
      else id(entry, prefix, label)
    }
  }
  return { ...value, contracts, capabilities }
}

function parseBaseline(value) {
  exactFields(value, ["baselineId", "eventId", "pinned", "acceptedGateIds", "decisionIds"], "development baseline")
  id(value.baselineId, ID_PREFIXES.baseline, "baselineId")
  if (!/^BASELINE-FLOWDOC-\d{8}-\d{2}$/.test(value.eventId)) fail("baseline eventId must match BASELINE-FLOWDOC-YYYYMMDD-NN")
  exactFields(value.pinned, ["repository", "branch", "commit"], "baseline pinned tuple")
  string(value.pinned.repository, "pinned repository")
  string(value.pinned.branch, "pinned branch")
  if (!/^[0-9a-f]{40}$/.test(value.pinned.commit)) fail("pinned commit must be a full lowercase Git hash")
  for (const gate of array(value.acceptedGateIds, "baseline acceptedGateIds")) id(gate, ID_PREFIXES.gate, "baseline accepted gate")
  for (const decision of array(value.decisionIds, "baseline decisionIds")) {
    decisionId(decision, "baseline decision ID")
  }
  return value
}

function parseRelease(value) {
  exactFields(value, ["releaseLine", "folderSlug", "baselineId", "composition", "capabilityIds"], "release")
  if (!/^\d+\.\d+$/.test(value.releaseLine)) fail("releaseLine must be a numeric major.minor line")
  string(value.folderSlug, "release folderSlug")
  id(value.baselineId, ID_PREFIXES.baseline, "release baselineId")
  for (const documentId of array(value.composition, "release composition")) id(documentId, ID_PREFIXES.document, "release composition document")
  for (const capabilityId of array(value.capabilityIds, "release capabilityIds")) id(capabilityId, ID_PREFIXES.capability, "release capability ID")
  return value
}

function duplicate(ids, label) {
  const seen = new Set()
  for (const value of ids) {
    if (seen.has(value)) fail(`duplicate ${label} identity: ${value}`)
    seen.add(value)
  }
  return seen
}

export function collectCanonicalReferences(markdown) {
  if (typeof markdown !== "string") fail("Markdown must be a string")
  return [...markdown.matchAll(REFERENCE_PATTERN)].map((match) => match[0])
}

export function collectEmbeddedCanonicalRecords(markdown) {
  if (typeof markdown !== "string") fail("Markdown must be a string")
  const block = /<!--\s*FLOWDOC-RECORD\s*\n([\s\S]*?)\n?-->/g
  const records = []
  const recordIds = new Set()
  let match
  while ((match = block.exec(markdown)) !== null) {
    const before = markdown.slice(0, match.index)
    const headingLine = before.trimEnd().split("\n").pop()
    const identifier = headingLine && /^#{2,6}\s+([A-Z][A-Z0-9-]*)\s+—\s+.+$/.exec(headingLine)
    if (!identifier) fail("FLOWDOC-RECORD requires a matching heading immediately before it")
    let record
    try { record = JSON.parse(match[1]) } catch { fail("FLOWDOC-RECORD metadata must be valid JSON") }
    for (const key of Object.keys(object(record, "FLOWDOC-RECORD metadata"))) {
      if (!["recordId", "recordKind", "lifecycle", "affects"].includes(key)) fail(`unknown FLOWDOC-RECORD metadata field ${key}`)
    }
    if (record.recordId !== identifier[1]) fail("FLOWDOC-RECORD recordId must match its heading")
    closed(record.recordKind, RECORD_KINDS, "FLOWDOC-RECORD recordKind")
    id(record.recordId, RECORD_ID_PREFIXES[record.recordKind], `FLOWDOC-RECORD ${record.recordKind} recordId`)
    closed(record.lifecycle, LIFECYCLES, "FLOWDOC-RECORD lifecycle")
    array(record.affects, "FLOWDOC-RECORD affects").forEach((reference) => string(reference, "FLOWDOC-RECORD affected ID"))
    const following = markdown.slice(block.lastIndex, markdown.indexOf("\n##", block.lastIndex) === -1 ? markdown.length : markdown.indexOf("\n##", block.lastIndex))
    const statedLifecycle = /(?:^|\n)\s*Lifecycle:\s*(\w+)\s*(?:\n|$)/i.exec(following)
    if (statedLifecycle && statedLifecycle[1].toLowerCase() !== record.lifecycle) fail("prose contradicts required record lifecycle section")
    if (recordIds.has(record.recordId)) fail(`duplicate embedded record identity: ${record.recordId}`)
    recordIds.add(record.recordId)
    records.push(record)
  }
  return records
}

export function validateDevelopmentBaselineEvolution(previous, next) {
  object(previous, "previous baseline")
  object(next, "next baseline")
  if (previous.baselineId !== next.baselineId) return next
  const tuple = (baseline) => baseline.pinned && [baseline.pinned.repository, baseline.pinned.branch, baseline.pinned.commit].join("\u0000")
  if (tuple(previous) !== tuple(next)) fail(`baseline ${next.baselineId} changes its pinned tuple`)
  return next
}

export function validateCanonicalDocumentationModel(model, options = {}) {
  object(model, "model")
  object(options, "validation options")
  const { root, manifest, glossary, repositoryIndex, baseline, release, markdownByPath } = model
  string(root, "model root")
  parseManifest(manifest)
  parseGlossary(glossary)
  parseRepositoryIndex(repositoryIndex)
  parseBaseline(baseline)
  parseRelease(release)

  const documents = manifest.documents
  const documentIds = duplicate(documents.map((document) => document.documentId), "DOC")
  duplicate(documents.map((document) => document.path), "document path")
  const termIds = duplicate(glossary.terms.map((term) => term.termId), "TERM")
  const conceptIds = duplicate(glossary.concepts.map((concept) => concept.conceptId), "CONCEPT")
  const contractIds = duplicate(repositoryIndex.contracts.map((contract) => contract.contractId), "CONTRACT")
  const capabilityIds = duplicate(repositoryIndex.capabilities.map((capability) => capability.capabilityId), "CAP")
  const baselineIds = new Set([baseline.baselineId])
  const knownIds = new Set([...documentIds, ...termIds, ...conceptIds, ...contractIds, ...capabilityIds, ...baselineIds, ...repositoryIndex.risks, ...repositoryIndex.unknowns, ...repositoryIndex.workItems, ...repositoryIndex.decisions, ...baseline.decisionIds, ...repositoryIndex.capabilities.flatMap((capability) => capability.acceptedGateIds), ...baseline.acceptedGateIds])

  for (const term of glossary.terms) {
    if (!conceptIds.has(term.conceptId)) fail(`term ${term.termId} has unresolved concept ${term.conceptId}`)
    if (term.meansSameAs !== undefined) {
      const target = glossary.terms.find((candidate) => candidate.termId === term.meansSameAs)
      if (!target || target.conceptId !== term.conceptId) fail(`meansSameAs for ${term.termId} must resolve to a semantically exact term in the same concept family`)
      if (term.forms.some((form) => form.kind === "ambiguous-alias")) fail(`meansSameAs is forbidden on ambiguous forms for ${term.termId}`)
    }
    if (term.supersededBy !== undefined) {
      const target = glossary.terms.find((candidate) => candidate.termId === term.supersededBy)
      if (!target || target.termId === term.termId || target.conceptId !== term.conceptId) fail(`supersededBy for ${term.termId} must resolve to a different term in the same concept family`)
    }
  }
  for (const retiredTermId of glossary.retiredTermIds) {
    const tombstone = glossary.terms.find((term) => term.termId === retiredTermId)
    if (!tombstone || tombstone.lifecycle !== "retired") fail(`retired term ${retiredTermId} must be retained as a retired tombstone`)
  }

  const expectedStructuredPaths = Object.values(STRUCTURED_PATHS)
  for (const path of expectedStructuredPaths) if (!documents.some((document) => document.path === path)) fail(`manifest must register structured path ${path}`)
  for (const document of documents) {
    assertInsideRoot(root, document.path, "document path")
    if (!existsSync(join(root, document.path))) fail(`registered path is missing: ${document.path}`)
  }
  const registeredPaths = new Set(documents.map((document) => document.path))
  for (const canonicalRoot of manifest.canonicalRoots) {
    assertInsideRoot(root, canonicalRoot, "canonical root")
    for (const path of filesBelow(root, canonicalRoot)) if (!registeredPaths.has(path)) fail(`canonical file ${path} under a declared canonical root is absent from the manifest`)
  }

  const expectedSlug = release.releaseLine.replace(".", "_")
  if (release.folderSlug !== expectedSlug) fail(`release folderSlug for ${release.releaseLine} must be ${expectedSlug}`)
  const releaseFolder = `docs/versions/${release.folderSlug}/`
  for (const compositionId of release.composition) {
    const compositionDocument = documents.find((document) => document.documentId === compositionId)
    if (!compositionDocument) fail(`release composition has unresolved document ${compositionId}`)
    if (!compositionDocument.path.startsWith(releaseFolder)) fail(`release composition must remain inside ${releaseFolder}`)
  }
  if (!baselineIds.has(release.baselineId)) fail(`release has unresolved baseline ${release.baselineId}`)
  for (const capabilityId of release.capabilityIds) {
    const capability = repositoryIndex.capabilities.find((candidate) => candidate.capabilityId === capabilityId)
    if (!capability) fail(`release has unresolved capability ${capabilityId}`)
  }
  for (const capability of repositoryIndex.capabilities) {
    if (["accepted", "active", "production"].includes(capability.maturity) && !capability.acceptedGateIds.some((gate) => baseline.acceptedGateIds.includes(gate))) fail(`accepted capability ${capability.capabilityId} requires a referenced accepted gate in the selected baseline`)
  }

  const embeddedRecordsByPath = new Map()
  const embeddedRecordIds = new Set()
  for (const document of documents) {
    const markdown = markdownByPath[document.path]
    if (markdown === undefined) continue
    const records = collectEmbeddedCanonicalRecords(markdown)
    for (const record of records) {
      if (embeddedRecordIds.has(record.recordId)) fail(`duplicate embedded record identity: ${record.recordId}`)
      embeddedRecordIds.add(record.recordId)
      knownIds.add(record.recordId)
    }
    embeddedRecordsByPath.set(document.path, records)
  }
  for (const document of documents) {
    const markdown = markdownByPath[document.path]
    if (markdown === undefined) continue
    const records = embeddedRecordsByPath.get(document.path)
    for (const record of records) {
      for (const reference of record.affects) if (!knownIds.has(reference)) fail(`unresolved canonical reference ${reference}`)
    }
    for (const reference of collectCanonicalReferences(markdown)) {
      if (!knownIds.has(reference)) fail(`unresolved canonical reference ${reference}`)
      if (document?.authority === "normative" && document.lifecycle === "active" && reference.startsWith("DOC-")) {
        const referencedDocument = documents.find((candidate) => candidate.documentId === reference)
        if (referencedDocument && ["superseded", "retired"].includes(referencedDocument.lifecycle)) fail(`active normative document ${document.documentId} cannot reference ${referencedDocument.lifecycle} document ${reference}`)
      }
    }
    if (document?.authority === "normative" && document.lifecycle === "active") {
      if (/\blegacy phase\b/i.test(markdown)) fail(`active normative document ${document.documentId} may not reference legacy phase prose`)
      for (const term of glossary.terms) for (const form of term.forms) {
        if (form.kind === "ambiguous-alias" && new RegExp(`(^|[^A-Za-z0-9])${form.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=$|[^A-Za-z0-9])`, "i").test(markdown)) fail(`ambiguous alias ${form.value} is forbidden in normative Markdown`)
      }
    }
  }
  return model
}

export function loadCanonicalDocumentationModel(root, options = {}) {
  object(options, "load options")
  const normalizedRoot = resolve(string(root, "root"))
  const manifest = parseManifest(json(normalizedRoot, STRUCTURED_PATHS.manifest))
  const glossary = parseGlossary(json(normalizedRoot, STRUCTURED_PATHS.glossary))
  const repositoryIndex = parseRepositoryIndex(json(normalizedRoot, STRUCTURED_PATHS.repositoryIndex))
  const baseline = parseBaseline(json(normalizedRoot, STRUCTURED_PATHS.baseline))
  const release = parseRelease(json(normalizedRoot, STRUCTURED_PATHS.release))
  const markdownByPath = {}
  for (const document of manifest.documents) {
    assertInsideRoot(normalizedRoot, document.path, "document path")
    if (!existsSync(join(normalizedRoot, document.path))) fail(`registered path is missing: ${document.path}`)
    if (document.path.endsWith(".md")) markdownByPath[document.path] = readFileSync(join(normalizedRoot, document.path), "utf8")
  }
  const model = Object.freeze({ root: normalizedRoot, manifest, glossary, repositoryIndex, baseline, release, documents: manifest.documents, markdownByPath })
  return validateCanonicalDocumentationModel(model, options)
}
