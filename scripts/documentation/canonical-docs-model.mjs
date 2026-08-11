import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, join, relative, resolve, sep } from "node:path"

export const STRUCTURED_PATHS = Object.freeze({
  manifest: "docs/manifest.json",
  glossary: "docs/glossary.json",
  repositoryIndex: "docs/coordination/REPOSITORY_INDEX.json",
  baseline: "docs/coordination/DEVELOPMENT_BASELINE.json",
  release: "docs/versions/0_1/release.json",
  compatibility: "docs/versions/0_1/COMPATIBILITY.md",
})

export const GENERATED_PATHS = Object.freeze([
  "docs/DOCUMENT_MAP.md",
  "docs/GLOSSARY.md",
  "docs/GLOSSARY_TH.md",
  "docs/versions/0_1/VERSION_OVERVIEW.md",
  "docs/versions/0_1/CAPABILITY_SET.md",
])

const REQUIRED_DOCUMENT_PATHS = Object.freeze([
  STRUCTURED_PATHS.manifest,
  ...GENERATED_PATHS.slice(0, 3),
  STRUCTURED_PATHS.glossary,
  STRUCTURED_PATHS.repositoryIndex,
  "docs/coordination/BOUNDARY.md",
  STRUCTURED_PATHS.release,
  ...GENERATED_PATHS.slice(3),
  STRUCTURED_PATHS.compatibility,
])
const CANONICAL_ROOTS = Object.freeze(["docs/project", "docs/coordination", "docs/versions/0_1"])
const DOCUMENT_KINDS = new Set(["navigation", "glossary", "repository-index", "coordination-boundary", "release-composition", "current-state", "compatibility", "version-policy", "risk-register", "known-unknowns", "roadmap"])
const SCOPES = new Set(["core", "editor", "backend", "cross-repository"])
const SUBSYSTEMS = new Set(["documentation", "terminology", "coordination", "versioning", "project"])
const AUDIENCES = new Set(["internal", "public", "both"])
const AUTHORITIES = new Set(["normative", "evidence", "navigation", "explanatory"])
const LIFECYCLES = new Set(["draft", "active", "superseded", "retired"])
const RELEASE_LIFECYCLES = new Set(["planned", "active", "superseded", "retired"])
const TERM_LIFECYCLES = new Set(["draft", "active", "compatibility", "retired"])
const FORM_KINDS = new Set(["localized-label", "exact-alias", "historical-alias", "abbreviation", "deprecated-alias", "ambiguous-alias", "explanatory-alias"])
const LANGUAGES = new Set(["technical", "thai", "language-neutral"])
const REPOSITORY_ROLES = new Set(["core-engine", "editor-client", "backend-service"])
const MANIFEST_ADOPTION = new Set(["active", "not-adopted"])
const COMPATIBILITY_VALUES = new Set(["not-verified"])
const TASK_3_PENDING_BASELINE_ID = "BASELINE-FLOWDOC-20260811-01"
const REFERENCE_PATTERN = /\b(?:DOC|REPO|CONTRACT|SCHEMA|CAP|RISK|UNKNOWN|GATE|TERM|CONCEPT|WORK|BASELINE|DECISION)-[A-Z0-9][A-Z0-9-]*\b/g
const RECORD_DOCUMENTS = Object.freeze({
  "risk-register": { recordKind: "risk", prefix: "RISK", fields: ["recordId", "recordKind", "lifecycle", "affects"], sections: ["Adverse event", "Trigger", "Affected IDs", "Mitigation", "Evidence", "Lifecycle"], referenceField: "affects", referenceSection: "Affected IDs" },
  "known-unknowns": { recordKind: "unknown", prefix: "UNKNOWN", fields: ["recordId", "recordKind", "lifecycle", "affects", "closedBy"], sections: ["Missing evidence", "Why it matters", "Blocked decision", "Affected IDs", "Closing gate or work item", "Lifecycle"], referenceField: "affects", referenceSection: "Affected IDs", closingField: "closedBy", closingSection: "Closing gate or work item" },
  roadmap: { recordKind: "work", prefix: "WORK", fields: ["recordId", "recordKind", "lifecycle", "motivatedBy"], sections: ["Motivating risks and unknowns", "Non-goals", "Lifecycle"], referenceField: "motivatedBy", referenceSection: "Motivating risks and unknowns" },
})

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
  if (typeof value !== "string" || value.trim().length === 0) fail(`${label} must be a non-empty string`)
  return value
}

function exactFields(value, fields, label) {
  const keys = Object.keys(object(value, label))
  for (const field of fields) if (!keys.includes(field)) fail(`${label} is missing field ${field}`)
  for (const key of keys) if (!fields.includes(key)) fail(`${label} has unknown field ${key}`)
}

function allowedFields(value, fields, label) {
  for (const key of Object.keys(object(value, label))) if (!fields.includes(key)) fail(`${label} has unknown field ${key}`)
}

function closed(value, values, label) {
  if (!values.has(value)) fail(`${label} must be one of the closed values`)
  return value
}

function id(value, prefix, label) {
  string(value, label)
  if (!new RegExp(`^${prefix}-[A-Z0-9][A-Z0-9-]*$`).test(value)) fail(`${label} must use the ${prefix} prefix`)
  return value
}

function distinct(values, label, parse) {
  const entries = array(values, label)
  const seen = new Set()
  for (const entry of entries) {
    parse(entry)
    if (seen.has(entry)) fail(`duplicate ${label} value: ${entry}`)
    seen.add(entry)
  }
  return entries
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

function parseAppliesTo(value, label) {
  exactFields(value, ["repositoryIds", "releaseLines", "contractIds", "schemaIds"], label)
  const repositoryIds = distinct(value.repositoryIds, `${label} repositoryIds`, (entry) => id(entry, "REPO", `${label} repository ID`))
  const releaseLines = distinct(value.releaseLines, `${label} releaseLines`, (entry) => {
    if (typeof entry !== "string" || !/^\d+\.\d+$/.test(entry)) fail(`${label} release line must be numeric major.minor`)
  })
  const contractIds = distinct(value.contractIds, `${label} contractIds`, (entry) => id(entry, "CONTRACT", `${label} contract ID`))
  const schemaIds = distinct(value.schemaIds, `${label} schemaIds`, (entry) => id(entry, "SCHEMA", `${label} schema ID`))
  if (contractIds.length > 0) fail(`${label} contractIds must be empty because no Task 3 owner registry exists`)
  if (schemaIds.length > 0) fail(`${label} schemaIds must be empty because no Task 3 owner registry exists`)
  return { repositoryIds, releaseLines, contractIds, schemaIds }
}

function parseDocument(record) {
  exactFields(record, ["documentId", "title", "path", "kind", "scope", "subsystem", "audience", "authority", "lifecycle", "appliesTo"], "manifest document")
  id(record.documentId, "DOC", "documentId")
  string(record.title, "document title")
  string(record.path, "document path")
  if (record.path.startsWith("/") || record.path.includes("\\") || record.path.split("/").includes("..")) fail(`document path must be a safe repository-relative path: ${record.path}`)
  closed(record.kind, DOCUMENT_KINDS, "document kind")
  closed(record.scope, SCOPES, "document scope")
  closed(record.subsystem, SUBSYSTEMS, "document subsystem")
  closed(record.audience, AUDIENCES, "document audience")
  closed(record.authority, AUTHORITIES, "document authority")
  closed(record.lifecycle, LIFECYCLES, "document lifecycle")
  return { ...record, appliesTo: parseAppliesTo(record.appliesTo, `document ${record.documentId} appliesTo`) }
}

function parseManifest(value) {
  exactFields(value, ["manifestSchemaVersion", "repositoryId", "canonicalRoots", "documents"], "manifest")
  if (value.manifestSchemaVersion !== 1) fail("manifestSchemaVersion must be 1")
  id(value.repositoryId, "REPO", "manifest repositoryId")
  const canonicalRoots = array(value.canonicalRoots, "canonicalRoots")
  if (JSON.stringify(canonicalRoots) !== JSON.stringify(CANONICAL_ROOTS)) fail(`canonicalRoots must exactly equal ${CANONICAL_ROOTS.join(", ")}`)
  const documents = array(value.documents, "manifest documents").map(parseDocument)
  return { ...value, canonicalRoots, documents }
}

function parseGlossary(value) {
  exactFields(value, ["glossarySchemaVersion", "concepts", "terms", "lexicalForms"], "glossary")
  if (value.glossarySchemaVersion !== 1) fail("glossarySchemaVersion must be 1")
  const concepts = array(value.concepts, "glossary concepts").map((concept) => {
    exactFields(concept, ["conceptId", "labels"], "concept")
    id(concept.conceptId, "CONCEPT", "conceptId")
    exactFields(concept.labels, ["technical", "thai"], `concept ${concept.conceptId} labels`)
    string(concept.labels.technical, `concept ${concept.conceptId} technical label`)
    string(concept.labels.thai, `concept ${concept.conceptId} Thai label`)
    return concept
  })
  const terms = array(value.terms, "glossary terms").map((term) => {
    exactFields(term, ["termId", "conceptId", "canonicalName", "definitions", "lifecycle", "appliesTo", "relations"], "term")
    id(term.termId, "TERM", "termId")
    id(term.conceptId, "CONCEPT", "term conceptId")
    string(term.canonicalName, `term ${term.termId} canonicalName`)
    exactFields(term.definitions, ["technical", "thai"], `term ${term.termId} definitions`)
    string(term.definitions.technical, `term ${term.termId} technical definition`)
    string(term.definitions.thai, `term ${term.termId} Thai definition`)
    closed(term.lifecycle, TERM_LIFECYCLES, "term lifecycle")
    exactFields(term.relations, ["meansSameAs", "relatedTo", "supersededBy"], `term ${term.termId} relations`)
    const meansSameAs = distinct(term.relations.meansSameAs, `term ${term.termId} meansSameAs`, (entry) => id(entry, "TERM", "meansSameAs term ID"))
    const relatedTo = distinct(term.relations.relatedTo, `term ${term.termId} relatedTo`, (entry) => id(entry, "TERM", "relatedTo term ID"))
    if (term.relations.supersededBy !== null) id(term.relations.supersededBy, "TERM", "supersededBy term ID")
    return { ...term, appliesTo: parseAppliesTo(term.appliesTo, `term ${term.termId} appliesTo`), relations: { meansSameAs, relatedTo, supersededBy: term.relations.supersededBy } }
  })
  const lexicalForms = array(value.lexicalForms, "lexicalForms").map((form) => {
    exactFields(form, ["value", "language", "kind", "termId", "possibleTermIds", "resolutionContext"], "lexical form")
    string(form.value, "lexical form value")
    closed(form.language, LANGUAGES, "lexical form language")
    closed(form.kind, FORM_KINDS, "lexical form kind")
    const possibleTermIds = distinct(form.possibleTermIds, `lexical form ${form.value} possibleTermIds`, (entry) => id(entry, "TERM", "possible term ID"))
    if (form.kind === "ambiguous-alias") {
      if (form.termId !== null || possibleTermIds.length < 2 || typeof form.resolutionContext !== "string" || form.resolutionContext.trim().length === 0) fail(`ambiguous-alias ${form.value} requires null termId, at least two possibleTermIds, and resolutionContext`)
    } else {
      id(form.termId, "TERM", `lexical form ${form.value} termId`)
      if (possibleTermIds.length !== 0 || form.resolutionContext !== null) fail(`lexical form ${form.value} requires one termId, empty possibleTermIds, and null resolutionContext`)
    }
    return { ...form, possibleTermIds }
  })
  return { ...value, concepts, terms, lexicalForms }
}

function parseRepositoryIndex(value) {
  exactFields(value, ["repositoryIndexSchemaVersion", "provisionalHostRepositoryId", "futureCoordinationRepository", "repositories"], "repository index")
  if (value.repositoryIndexSchemaVersion !== 1) fail("repositoryIndexSchemaVersion must be 1")
  id(value.provisionalHostRepositoryId, "REPO", "provisionalHostRepositoryId")
  if (value.provisionalHostRepositoryId !== "REPO-FLOWDOC-CORE") fail("provisionalHostRepositoryId must be REPO-FLOWDOC-CORE")
  exactFields(value.futureCoordinationRepository, ["workingName", "lifecycle"], "future coordination repository")
  string(value.futureCoordinationRepository.workingName, "future coordination repository workingName")
  if (value.futureCoordinationRepository.workingName !== "flowdoc-vnext-coordination") fail("future coordination repository workingName must be flowdoc-vnext-coordination")
  if (value.futureCoordinationRepository.lifecycle !== "not-created") fail("future coordination repository lifecycle must be not-created")
  const repositories = array(value.repositories, "repositories").map((repository) => {
    exactFields(repository, ["repositoryId", "name", "role", "manifestAdoption", "manifestDocumentId"], "repository")
    id(repository.repositoryId, "REPO", "repositoryId")
    string(repository.name, "repository name")
    closed(repository.role, REPOSITORY_ROLES, "repository role")
    closed(repository.manifestAdoption, MANIFEST_ADOPTION, "manifest adoption")
    if (repository.manifestAdoption === "active") id(repository.manifestDocumentId, "DOC", "active manifest document ID")
    else if (repository.manifestDocumentId !== null) fail("not-adopted repository manifestDocumentId must be null")
    return repository
  })
  return { ...value, repositories }
}

function parseRelease(value) {
  exactFields(value, ["releaseSchemaVersion", "repositoryId", "releaseLine", "folderSlug", "lifecycle", "releaseVersion", "baselineId", "capabilityIds", "contractIds", "verificationGateIds", "compatibilityDocumentId", "releaseReady"], "release")
  if (value.releaseSchemaVersion !== 1) fail("releaseSchemaVersion must be 1")
  id(value.repositoryId, "REPO", "release repositoryId")
  if (typeof value.releaseLine !== "string" || !/^\d+\.\d+$/.test(value.releaseLine)) fail("releaseLine must be a numeric major.minor line")
  string(value.folderSlug, "release folderSlug")
  closed(value.lifecycle, RELEASE_LIFECYCLES, "release lifecycle")
  string(value.releaseVersion, "releaseVersion")
  id(value.baselineId, "BASELINE", "release baselineId")
  const capabilityIds = distinct(value.capabilityIds, "release capabilityIds", (entry) => id(entry, "CAP", "release capability ID"))
  const contractIds = distinct(value.contractIds, "release contractIds", (entry) => id(entry, "CONTRACT", "release contract ID"))
  const verificationGateIds = distinct(value.verificationGateIds, "release verificationGateIds", (entry) => id(entry, "GATE", "release verification gate ID"))
  id(value.compatibilityDocumentId, "DOC", "release compatibilityDocumentId")
  if (typeof value.releaseReady !== "boolean") fail("releaseReady must be boolean")
  return { ...value, capabilityIds, contractIds, verificationGateIds }
}

function parseCompatibility(markdown) {
  const match = /^<!-- FLOWDOC-COMPATIBILITY\r?\n([^\r\n]+)\r?\n-->/.exec(markdown)
  if (!match) fail("COMPATIBILITY.md must begin with a FLOWDOC-COMPATIBILITY metadata block")
  let value
  try { value = JSON.parse(match[1]) } catch { fail("FLOWDOC-COMPATIBILITY metadata must be valid JSON") }
  exactFields(value, ["compatibilitySchemaVersion", "coreEditor", "coreBackend", "endToEnd"], "FLOWDOC-COMPATIBILITY metadata")
  if (value.compatibilitySchemaVersion !== 1) fail("compatibilitySchemaVersion must be 1")
  for (const field of ["coreEditor", "coreBackend", "endToEnd"]) closed(value[field], COMPATIBILITY_VALUES, `compatibility ${field}`)
  return value
}

function duplicate(values, label) {
  const seen = new Set()
  for (const value of values) {
    if (seen.has(value)) fail(`duplicate ${label} identity: ${value}`)
    seen.add(value)
  }
  return seen
}

function normalizeReferenceLabel(label) {
  return label.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US")
}

function isEscapableAsciiPunctuation(character) {
  const code = character?.charCodeAt(0)
  return (code >= 0x21 && code <= 0x2f)
    || (code >= 0x3a && code <= 0x40)
    || (code >= 0x5b && code <= 0x60)
    || (code >= 0x7b && code <= 0x7e)
}

function referenceDefinitionLabel(line) {
  const match = /^[ \t]{0,3}\[((?:\\.|[^\[\]\\\r\n])+)]:(.*)\r?$/.exec(line)
  if (!match) return null
  const label = normalizeReferenceLabel(match[1])
  if (label.length === 0) return null
  const source = match[2].replace(/^[ \t]*/, "")
  if (source.length === 0) return null

  let destinationEnd
  if (source.startsWith("<")) {
    const close = source.indexOf(">", 1)
    if (close < 2 || source.slice(1, close).includes("<")) return null
    destinationEnd = close + 1
  } else {
    let parentheses = 0
    let index = 0
    for (; index < source.length && !/[ \t]/.test(source[index]); index += 1) {
      const character = source[index]
      if (character === "<" || character === ">") return null
      if (character === "\\" && isEscapableAsciiPunctuation(source[index + 1])) {
        index += 1
        continue
      }
      if (character === "(") parentheses += 1
      if (character === ")") {
        parentheses -= 1
        if (parentheses < 0) return null
      }
    }
    if (index === 0 || parentheses !== 0) return null
    destinationEnd = index
  }

  const remainder = source.slice(destinationEnd)
  if (remainder.length === 0) return label
  if (!/^[ \t]+/.test(remainder)) return null
  const title = remainder.trim()
  if (title.length === 0) return label
  if (!/^(?:"[^"\r\n]*"|'[^'\r\n]*'|\([^()\r\n]*\))$/.test(title)) return null
  return label
}

function stripAliasScanExclusions(markdown) {
  const withoutCode = markdown
    .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, " ")
    .replace(/`[^`\r\n]*`/g, " ")

  const referenceLabels = new Set()
  const visibleLines = withoutCode.split("\n").map((line) => {
    const label = referenceDefinitionLabel(line)
    if (label === null) return line
    referenceLabels.add(label)
    return ""
  })

  return visibleLines.join("\n")
    .replace(/<[A-Za-z][A-Za-z0-9+.-]{1,31}:[^<>\s]+>|<[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+>/g, " ")
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/(\[([^\]\r\n]*)\])\s*\[([^\]\r\n]*)\]/g, (whole, visible, visibleLabel, destinationLabel) => {
      const resolvedLabel = normalizeReferenceLabel(destinationLabel.length === 0 ? visibleLabel : destinationLabel)
      return referenceLabels.has(resolvedLabel) ? visible : whole
    })
    .replace(REFERENCE_PATTERN, " ")
}

export function collectCanonicalReferences(markdown) {
  if (typeof markdown !== "string") fail("Markdown must be a string")
  return [...markdown.matchAll(REFERENCE_PATTERN)].map((match) => match[0])
}

function sortedDistinctIds(value, label) {
  const values = distinct(value, label, (entry) => string(entry, `${label} entry`))
  if (values.length === 0) fail(`${label} must be non-empty`)
  if (JSON.stringify(values) !== JSON.stringify([...values].sort())) fail(`${label} must be sorted by ascending stable ID`)
  return values
}

function parseRecordMetadata(source, definition, label) {
  let metadata
  try { metadata = JSON.parse(source) } catch { fail(`${label} FLOWDOC-RECORD JSON must be valid`) }
  exactFields(metadata, definition.fields, `${label} metadata`)
  id(metadata.recordId, definition.prefix, `${label} recordId`)
  if (metadata.recordKind !== definition.recordKind) fail(`${label} recordKind must be ${definition.recordKind}`)
  closed(metadata.lifecycle, LIFECYCLES, `${label} lifecycle`)
  metadata[definition.referenceField] = sortedDistinctIds(metadata[definition.referenceField], `${label} ${definition.referenceField}`)
  if (definition.closingField) metadata[definition.closingField] = sortedDistinctIds(metadata[definition.closingField], `${label} ${definition.closingField}`)
  return metadata
}

function parseRecordReferenceSection(content, ids, label) {
  const entries = content.replace(/\r/g, "").split("\n").filter((line) => line.length > 0)
  if (entries.length !== ids.length) fail(`${label} must contain one Markdown bullet per ID and no prose`)
  const values = entries.map((line) => {
    const match = /^- \[([A-Z][A-Z0-9-]+)]\(([^\r\n)]+)\)$/.exec(line)
    if (!match) fail(`${label} must contain one Markdown bullet per ID and no prose`)
    return { id: match[1], target: match[2] }
  })
  if (JSON.stringify(values.map((value) => value.id)) !== JSON.stringify(ids)) fail(`${label} must exactly match the sorted metadata IDs`)
  return values
}

function hasProseParagraph(content) {
  const paragraphs = content.replace(/<!--[\s\S]*?-->/g, "").replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, "").split(/\r?\n\s*\r?\n/)
  return paragraphs.some((paragraph) => {
    const lines = paragraph.split(/\r?\n/)
    return lines.length > 0 && lines.some((line) => line.trim().length > 0) && !lines.every((line) => /^\s*(?:[-*+] |\d+\. |>|#{1,6}\s|={3,}|-{3,}$|\s{4}|\t)/.test(line))
  })
}

export function collectEmbeddedCanonicalRecords(markdown, { documentKind, path }) {
  if (typeof markdown !== "string") fail("FLOWDOC-RECORD Markdown must be a string")
  string(path, "FLOWDOC-RECORD path")
  const definition = RECORD_DOCUMENTS[documentKind]
  if (!definition) fail("FLOWDOC-RECORD documentKind must be risk-register, known-unknowns, or roadmap")

  const headingLines = [...markdown.matchAll(/^## (?!#)[^\r\n]*$/gm)]
  const headings = [...markdown.matchAll(/^## ([A-Z][A-Z0-9-]+) — ([^\r\n]*\S[^\r\n]*)$/gm)]
  if (headings.length !== headingLines.length) fail(`${path} level-two record headings must exactly use ## <recordId> — <non-empty title>`)
  const records = []
  const seen = new Set()
  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index]
    const recordId = heading[1]
    id(recordId, definition.prefix, `${path} heading recordId`)
    if (seen.has(recordId)) fail(`duplicate embedded record identity: ${recordId}`)
    seen.add(recordId)
    const afterHeading = heading.index + heading[0].length
    const block = /^\r?\n<!-- FLOWDOC-RECORD\r?\n([^\r\n]+)\r?\n-->(?:\r?\n|$)/.exec(markdown.slice(afterHeading))
    if (!block) fail(`${path} FLOWDOC-RECORD block must immediately follow its matching heading`)
    const metadata = parseRecordMetadata(block[1], definition, `${path} ${recordId}`)
    if (metadata.recordId !== recordId) fail(`${path} heading ID and metadata recordId must agree`)
    const bodyStart = afterHeading + block[0].length
    const bodyEnd = index + 1 < headings.length ? headings[index + 1].index : markdown.length
    const body = markdown.slice(bodyStart, bodyEnd)
    const sectionMatches = [...body.matchAll(/^### ([^\r\n]+)$/gm)]
    if (sectionMatches.length !== definition.sections.length || JSON.stringify(sectionMatches.map((match) => match[1])) !== JSON.stringify(definition.sections)) fail(`${path} ${recordId} sections must use the exact required order with no extras`)
    if (body.slice(0, sectionMatches[0].index).trim().length > 0) fail(`${path} ${recordId} must not contain a prose preamble before its first required section`)
    const references = []
    for (let sectionIndex = 0; sectionIndex < sectionMatches.length; sectionIndex += 1) {
      const section = sectionMatches[sectionIndex]
      const sectionName = section[1]
      const contentStart = section.index + section[0].length
      const contentEnd = sectionIndex + 1 < sectionMatches.length ? sectionMatches[sectionIndex + 1].index : body.length
      const content = body.slice(contentStart, contentEnd)
      if (sectionName === "Lifecycle") {
        if (content.replace(/\r/g, "").trimEnd() !== `\n\n\`${metadata.lifecycle}\``) fail(`${path} ${recordId} lifecycle serialization must be exactly one backticked metadata token`)
      } else if (sectionName === definition.referenceSection) {
        references.push(...parseRecordReferenceSection(content, metadata[definition.referenceField], `${path} ${recordId} ${sectionName}`))
      } else if (definition.closingSection && sectionName === definition.closingSection) {
        references.push(...parseRecordReferenceSection(content, metadata[definition.closingField], `${path} ${recordId} ${sectionName}`))
      } else if (!hasProseParagraph(content)) {
        fail(`${path} ${recordId} ${sectionName} must contain an actual prose paragraph`)
      }
    }
    records.push({ ...metadata, documentKind, path, references, exemptSpans: [
      { start: heading.index + 3, end: heading.index + 3 + recordId.length },
      { start: afterHeading, end: afterHeading + block[0].length },
    ] })
  }
  return records
}

function ownerPathForTarget(root, sourcePath, target, label) {
  if (typeof target !== "string" || target.length === 0 || target.startsWith("/") || target.startsWith("\\") || /^[A-Za-z][A-Za-z0-9+.-]*:/.test(target)) fail(`${label} must use a relative non-URI target`)
  const [pathPart] = target.split("#", 1)
  if (pathPart.length === 0 || pathPart.includes("\\")) fail(`${label} must include a relative repository path`)
  const absolute = resolve(root, dirname(sourcePath), pathPart)
  assertInsideRoot(root, relative(root, absolute), label)
  return relative(root, absolute).split(sep).join("/")
}

function collectTruthProseReferences(markdown, path, records) {
  const characters = markdown.split("")
  for (const span of records.flatMap((record) => record.exemptSpans)) for (let index = span.start; index < span.end; index += 1) characters[index] = " "
  const withoutRecordsOrDeclarations = characters.join("")
  const references = []
  const withoutLinks = withoutRecordsOrDeclarations.replace(/\[([^\]\r\n]+)]\(([^\r\n)]+)\)/g, (whole, label, target) => {
    const labelIds = collectCanonicalReferences(label)
    if (labelIds.length > 0) {
      if (labelIds.length !== 1 || label !== labelIds[0]) fail(`${path} canonical link labels must be exactly one stable ID`)
      references.push({ id: label, target })
    }
    return " ".repeat(whole.length)
  })
  const bare = collectCanonicalReferences(withoutLinks)
  if (bare.length > 0) fail(`${path} contains a bare canonical ID outside a FLOWDOC-RECORD block: ${bare[0]}`)
  return references
}

export function validateCanonicalDocumentationModel(model, options = {}) {
  object(model, "model")
  allowedFields(options, ["allowPendingBaselineId"], "validation options")
  const { root, manifest, glossary, repositoryIndex, release, baseline, pendingBaselineId, markdownByPath, compatibility } = model
  string(root, "model root")
  parseManifest(manifest)
  parseGlossary(glossary)
  parseRepositoryIndex(repositoryIndex)
  parseRelease(release)
  exactFields(compatibility, ["compatibilitySchemaVersion", "coreEditor", "coreBackend", "endToEnd"], "compatibility")
  if (baseline !== null) fail("Task 3 development baseline must remain unpublished")
  if (release.baselineId !== TASK_3_PENDING_BASELINE_ID) fail(`reserved pending baseline must be ${TASK_3_PENDING_BASELINE_ID}`)
  if (pendingBaselineId !== release.baselineId || options.allowPendingBaselineId !== release.baselineId) fail("pending baseline must exactly match the release baseline")
  if (release.lifecycle !== "planned" || release.releaseVersion !== "unversioned" || release.releaseReady !== false) fail("pending baseline requires lifecycle planned, releaseVersion unversioned, and releaseReady false")

  const documents = manifest.documents
  const documentIds = duplicate(documents.map((document) => document.documentId), "DOC")
  duplicate(documents.map((document) => document.path), "document path")
  const termIds = duplicate(glossary.terms.map((term) => term.termId), "TERM")
  const conceptIds = duplicate(glossary.concepts.map((concept) => concept.conceptId), "CONCEPT")
  const repositories = duplicate(repositoryIndex.repositories.map((repository) => repository.repositoryId), "REPO")
  duplicate(glossary.lexicalForms.map((form) => `${form.language}\u0000${form.kind}\u0000${form.value.toLocaleLowerCase("en-US")}`), "lexical form")

  if (!repositories.has(manifest.repositoryId)) fail(`manifest repositoryId has unresolved repository ${manifest.repositoryId}`)
  if (!repositories.has(release.repositoryId)) fail(`release repositoryId has unresolved repository ${release.repositoryId}`)
  if (!repositories.has(repositoryIndex.provisionalHostRepositoryId)) fail(`unresolved provisional host repository ${repositoryIndex.provisionalHostRepositoryId}`)
  for (const path of REQUIRED_DOCUMENT_PATHS) if (!documents.some((document) => document.path === path)) fail(`manifest must register required D1 path ${path}`)

  for (const document of documents) {
    for (const repositoryId of document.appliesTo.repositoryIds) if (!repositories.has(repositoryId)) fail(`document ${document.documentId} has unresolved repository ${repositoryId}`)
    for (const releaseLine of document.appliesTo.releaseLines) if (releaseLine !== release.releaseLine) fail(`document ${document.documentId} has unresolved release line ${releaseLine}`)
  }
  for (const term of glossary.terms) {
    if (!conceptIds.has(term.conceptId)) fail(`term ${term.termId} has unresolved concept ${term.conceptId}`)
    for (const repositoryId of term.appliesTo.repositoryIds) if (!repositories.has(repositoryId)) fail(`term ${term.termId} has unresolved repository ${repositoryId}`)
    for (const releaseLine of term.appliesTo.releaseLines) if (releaseLine !== release.releaseLine) fail(`term ${term.termId} has unresolved release line ${releaseLine}`)
    for (const targetId of term.relations.meansSameAs) {
      const target = glossary.terms.find((candidate) => candidate.termId === targetId)
      if (!target || target.termId === term.termId || target.conceptId !== term.conceptId) fail(`meansSameAs for ${term.termId} must resolve to a different exact term in the same concept family`)
    }
    for (const targetId of term.relations.relatedTo) if (!termIds.has(targetId) || targetId === term.termId) fail(`relatedTo for ${term.termId} has unresolved or self term ${targetId}`)
    if (term.relations.supersededBy !== null && (!termIds.has(term.relations.supersededBy) || term.relations.supersededBy === term.termId)) fail(`supersededBy for ${term.termId} must resolve to a different term`)
  }
  for (const form of glossary.lexicalForms) {
    if (form.termId !== null && !termIds.has(form.termId)) fail(`lexical form ${form.value} has unresolved termId ${form.termId}`)
    for (const possibleTermId of form.possibleTermIds) if (!termIds.has(possibleTermId)) fail(`lexical form ${form.value} has unresolved possibleTermId ${possibleTermId}`)
  }

  const expectedRepositories = [
    ["REPO-FLOWDOC-CORE", "flowdoc-vnext-core", "core-engine", "active", "DOC-CORE-NAVIGATION-MANIFEST"],
    ["REPO-FLOWDOC-EDITOR", "flowdoc-vnext-editor", "editor-client", "not-adopted", null],
    ["REPO-FLOWDOC-BACKEND", "flowdoc-vnext-backend", "backend-service", "not-adopted", null],
  ]
  const actualRepositories = repositoryIndex.repositories.map((repository) => [repository.repositoryId, repository.name, repository.role, repository.manifestAdoption, repository.manifestDocumentId])
  if (JSON.stringify(actualRepositories) !== JSON.stringify(expectedRepositories)) fail("repository index must use the exact neutral Core, Editor, and Backend records")
  for (const repository of repositoryIndex.repositories) {
    if (repository.manifestDocumentId !== null && !documentIds.has(repository.manifestDocumentId)) fail(`repository ${repository.repositoryId} has unresolved manifest document ${repository.manifestDocumentId}`)
  }

  const expectedSlug = release.releaseLine.replace(".", "_")
  if (release.folderSlug !== expectedSlug) fail(`release folderSlug for ${release.releaseLine} must be ${expectedSlug}`)
  if (release.capabilityIds.length > 0 || release.contractIds.length > 0 || release.verificationGateIds.length > 0) fail("release selectors must be empty because no Task 3 owner registry exists")
  const compatibilityDocument = documents.find((document) => document.documentId === release.compatibilityDocumentId)
  if (!compatibilityDocument || compatibilityDocument.path !== STRUCTURED_PATHS.compatibility || compatibilityDocument.kind !== "compatibility" || compatibilityDocument.lifecycle !== "active") fail("release compatibilityDocumentId must resolve to the active Task 3 compatibility document")

  const generated = new Set(GENERATED_PATHS)
  for (const document of documents) {
    assertInsideRoot(root, document.path, "document path")
    if (!generated.has(document.path) && !existsSync(join(root, document.path))) fail(`registered path is missing: ${document.path}`)
  }
  const registeredPaths = new Set(documents.map((document) => document.path))
  for (const canonicalRoot of manifest.canonicalRoots) {
    assertInsideRoot(root, canonicalRoot, "canonical root")
    for (const path of filesBelow(root, canonicalRoot)) if (!registeredPaths.has(path)) fail(`canonical file ${path} under a declared canonical root is absent from the manifest`)
  }

  const embeddedRecords = []
  for (const document of documents) {
    if (!Object.hasOwn(RECORD_DOCUMENTS, document.kind)) continue
    const markdown = markdownByPath[document.path]
    if (markdown === undefined) fail(`registered path is missing: ${document.path}`)
    embeddedRecords.push(...collectEmbeddedCanonicalRecords(markdown, { documentKind: document.kind, path: document.path }))
  }
  const recordIds = duplicate(embeddedRecords.map((record) => record.recordId), "embedded record")
  for (const recordId of recordIds) if (documentIds.has(recordId) || termIds.has(recordId) || conceptIds.has(recordId) || repositories.has(recordId) || recordId === release.baselineId) fail(`embedded record identity collides with an existing canonical identity: ${recordId}`)

  const knownIds = new Set([...documentIds, ...termIds, ...conceptIds, ...repositories, release.baselineId, ...recordIds])
  const identityOwners = new Map()
  for (const document of documents) identityOwners.set(document.documentId, document.path)
  for (const term of glossary.terms) identityOwners.set(term.termId, STRUCTURED_PATHS.glossary)
  for (const concept of glossary.concepts) identityOwners.set(concept.conceptId, STRUCTURED_PATHS.glossary)
  for (const repository of repositoryIndex.repositories) identityOwners.set(repository.repositoryId, STRUCTURED_PATHS.repositoryIndex)
  identityOwners.set(release.baselineId, STRUCTURED_PATHS.release)
  for (const record of embeddedRecords) identityOwners.set(record.recordId, record.path)
  for (const record of embeddedRecords) {
    for (const affectedId of record.affects ?? []) {
      if (!knownIds.has(affectedId)) fail(`${record.recordId} affects has unresolved canonical identity ${affectedId}`)
      if (affectedId === record.recordId) fail(`${record.recordId} affects cannot contain its own identity`)
    }
    for (const closedById of record.closedBy ?? []) {
      if (!/^(GATE|WORK)-/.test(closedById) || !knownIds.has(closedById)) fail(`${record.recordId} closedBy must contain resolvable GATE or WORK identities`)
    }
    for (const motivatedById of record.motivatedBy ?? []) {
      if (!/^(RISK|UNKNOWN)-/.test(motivatedById) || !knownIds.has(motivatedById)) fail(`${record.recordId} motivatedBy must contain resolvable RISK or UNKNOWN identities`)
    }
  }

  const truthDocuments = documents.filter((document) => document.path === "docs/VERSION_POLICY.md" || document.path.startsWith("docs/project/"))
  for (const document of truthDocuments) {
    const markdown = markdownByPath[document.path]
    if (markdown === undefined) continue
    for (const reference of collectTruthProseReferences(markdown, document.path, embeddedRecords.filter((record) => record.path === document.path))) {
      const ownerPath = identityOwners.get(reference.id)
      if (!ownerPath) fail(`${document.path} has unresolved authored canonical reference ${reference.id}`)
      if (ownerPathForTarget(root, document.path, reference.target, `${document.path} reference ${reference.id}`) !== ownerPath) fail(`${document.path} reference ${reference.id} must target its registered owner path`)
    }
  }
  const currentStateMarkdown = markdownByPath["docs/project/CURRENT_STATE.md"]
  if (currentStateMarkdown !== undefined && release.capabilityIds.length === 0 && release.contractIds.length === 0 && release.verificationGateIds.length === 0) {
    const normalizedCurrentState = currentStateMarkdown.toLocaleLowerCase("en-US")
    if (normalizedCurrentState.replace(/zero runtime\s+subsystems are registered as migrated in release\.json|legacy-unmigrated/g, "").includes("migrated")) fail("current state cannot claim a migrated capability while release composition is empty")
  }
  const versionPolicyMarkdown = markdownByPath["docs/VERSION_POLICY.md"]
  if (versionPolicyMarkdown !== undefined) {
    const requiredStatement = /first proposed Core release is `?0\.1\.0-a\.1`?; it is not authorized by this\s+plan\./i
    if (!requiredStatement.test(versionPolicyMarkdown)) fail("version policy must state that 0.1.0-a.1 is not authorized")
    const withoutRequiredStatement = versionPolicyMarkdown.replace(requiredStatement, "")
    const allowedSnapshotStatement = /When authorized, the exact prerelease snapshot uses `v0\.1\.0-a\.1` tag and\s+artifact identity\./i
    const claims = withoutRequiredStatement.replace(allowedSnapshotStatement, "")
    if (/(?:\b0\.1\.0-a\.1\b[\s\S]*\b(?:released|authorized)\b|\b(?:released|authorized)\b[\s\S]*\b0\.1\.0-a\.1\b)/i.test(claims)) fail("version policy cannot claim 0.1.0-a.1 is released or authorized")
  }
  for (const document of documents) {
    const markdown = markdownByPath[document.path]
    if (markdown === undefined) continue
    for (const reference of collectCanonicalReferences(markdown)) if (!knownIds.has(reference)) fail(`unresolved canonical reference ${reference}`)
    if (document.authority === "normative" && document.lifecycle === "active") {
      const tokens = stripAliasScanExclusions(markdown.replace(/<!-- FLOWDOC-RECORD\r?\n[^\r\n]+\r?\n-->/g, "")).match(/[\p{L}\p{N}-]+/gu) ?? []
      const normalizedTokens = new Set(tokens.map((token) => token.toLocaleLowerCase("en-US")))
      for (const form of glossary.lexicalForms) {
        if (form.kind === "ambiguous-alias" && normalizedTokens.has(form.value.toLocaleLowerCase("en-US"))) fail(`ambiguous alias ${form.value} is forbidden in active normative Markdown`)
      }
    }
  }
  return model
}

export function loadCanonicalDocumentationModel(root, options = {}) {
  allowedFields(options, ["allowPendingBaselineId"], "load options")
  const normalizedRoot = resolve(string(root, "root"))
  const manifest = parseManifest(json(normalizedRoot, STRUCTURED_PATHS.manifest))
  const glossary = parseGlossary(json(normalizedRoot, STRUCTURED_PATHS.glossary))
  const repositoryIndex = parseRepositoryIndex(json(normalizedRoot, STRUCTURED_PATHS.repositoryIndex))
  const release = parseRelease(json(normalizedRoot, STRUCTURED_PATHS.release))
  if (existsSync(join(normalizedRoot, STRUCTURED_PATHS.baseline))) fail("Task 3 development baseline must remain unpublished")
  const allowPendingBaselineId = options.allowPendingBaselineId
  if (allowPendingBaselineId === undefined) fail(`development baseline is missing; pending baseline ${release.baselineId} requires explicit allowance`)
  id(allowPendingBaselineId, "BASELINE", "allowPendingBaselineId")
  if (release.baselineId !== TASK_3_PENDING_BASELINE_ID) fail(`reserved pending baseline must be ${TASK_3_PENDING_BASELINE_ID}`)
  if (allowPendingBaselineId !== release.baselineId) fail(`pending baseline must exactly match release baseline ${release.baselineId}`)
  if (release.lifecycle !== "planned" || release.releaseVersion !== "unversioned" || release.releaseReady !== false) fail("pending baseline requires lifecycle planned, releaseVersion unversioned, and releaseReady false")

  const markdownByPath = {}
  for (const document of manifest.documents) {
    assertInsideRoot(normalizedRoot, document.path, "document path")
    const absolute = join(normalizedRoot, document.path)
    if (document.path.endsWith(".md") && existsSync(absolute)) markdownByPath[document.path] = readFileSync(absolute, "utf8")
  }
  const compatibilityMarkdown = markdownByPath[STRUCTURED_PATHS.compatibility]
  if (compatibilityMarkdown === undefined) fail(`registered path is missing: ${STRUCTURED_PATHS.compatibility}`)
  const compatibility = parseCompatibility(compatibilityMarkdown)
  const embeddedRecords = manifest.documents
    .filter((document) => Object.hasOwn(RECORD_DOCUMENTS, document.kind))
    .flatMap((document) => collectEmbeddedCanonicalRecords(markdownByPath[document.path], { documentKind: document.kind, path: document.path }))
  const model = Object.freeze({ root: normalizedRoot, manifest, glossary, repositoryIndex, release, baseline: null, pendingBaselineId: allowPendingBaselineId, documents: manifest.documents, markdownByPath, compatibility, embeddedRecords })
  return validateCanonicalDocumentationModel(model, { allowPendingBaselineId })
}
