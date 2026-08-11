import { dirname, relative } from "node:path"

import { GENERATED_PATHS } from "./canonical-docs-model.mjs"

export const GENERATED_HEADER = "<!-- GENERATED FILE — DO NOT EDIT -->\n"

function byId(left, right, key) {
  if (left[key] === right[key]) return 0
  return left[key] < right[key] ? -1 : 1
}

function titleFor(document) {
  return document.documentId
    .replace(/^DOC-/, "")
    .split("-")
    .map((word) => word.slice(0, 1) + word.slice(1).toLowerCase())
    .join(" ")
}

function documentLink(document, from) {
  const path = relative(dirname(from), document.path).split("\\").join("/")
  return `[${document.documentId} — ${titleFor(document)}](${path})`
}

function section(title, documents, from) {
  if (documents.length === 0) return ""
  return `## ${title}\n\n${documents.sort((left, right) => byId(left, right, "documentId")).map((document) => `- ${documentLink(document, from)}`).join("\n")}\n\n`
}

function header(title) {
  return `${GENERATED_HEADER}\n# ${title}\n\n`
}

export function renderDocumentMap(model) {
  const active = model.documents.filter((document) => document.lifecycle === "active")
  const glossary = active.filter((document) => document.kind === "glossary")
  const coordination = active.filter((document) => document.path.startsWith("docs/coordination/"))
  const versionLine = active.filter((document) => document.path.startsWith("docs/versions/"))
  const assigned = new Set([...glossary, ...coordination, ...versionLine])
  const currentTruth = active.filter((document) => !assigned.has(document))
  const inactive = model.documents.filter((document) => document.lifecycle !== "active")
  return `${header("Canonical document map")}${section("Active current truth", currentTruth, "docs/DOCUMENT_MAP.md")}${section("Coordination", coordination, "docs/DOCUMENT_MAP.md")}${section("Version line", versionLine, "docs/DOCUMENT_MAP.md")}${section("Glossary", glossary, "docs/DOCUMENT_MAP.md")}${section("Non-active records", inactive, "docs/DOCUMENT_MAP.md")}`
}

function renderGlossary(model, language) {
  const terms = [...model.glossary.terms].sort((left, right) => byId(left, right, "termId"))
  const title = language === "th" ? "อภิธานศัพท์หลัก" : "Technical glossary"
  const entries = terms.map((term) => {
    const label = term.forms.find((form) => form.kind === "localized-label")?.value ?? "No localized label registered"
    return `- \`${term.termId}\` — ${label} (${term.lifecycle})`
  }).join("\n")
  return `${header(title)}${entries || "No terms registered."}\n`
}

export function renderTechnicalGlossary(model) {
  return renderGlossary(model, "technical")
}

export function renderThaiGlossary(model) {
  return renderGlossary(model, "th")
}

function releaseFacts(release) {
  return [
    `releaseLine: ${release.releaseLine}`,
    "releaseVersion: unversioned",
    "releaseReady: false",
    "compatibility: not-verified",
    `baselineId: ${release.baselineId}`,
  ].map((fact) => `- ${fact}`).join("\n")
}

export function renderVersionOverview(model, release = model.release) {
  return `${header("Version overview")}## Release status\n\n${releaseFacts(release)}\n\nThis view is not published and not release-ready. It makes no accepted release claim.\n`
}

export function renderCapabilitySet(model, release = model.release) {
  const capabilities = model.repositoryIndex.capabilities
    .filter((capability) => release.capabilityIds.includes(capability.capabilityId))
    .sort((left, right) => byId(left, right, "capabilityId"))
  const contracts = [...model.repositoryIndex.contracts].sort((left, right) => byId(left, right, "contractId"))
  const listedCapabilities = capabilities.map((capability) => `- \`${capability.capabilityId}\` — maturity: ${capability.maturity}`).join("\n")
  const listedContracts = contracts.map((contract) => `- \`${contract.contractId}\``).join("\n")
  const cutover = capabilities.length === 0 && contracts.length === 0 ? "No subsystem cutover registered." : "No subsystem cutover is claimed by this generated view."
  return `${header("Capability set")}## Release status\n\n${releaseFacts(release)}\n\n## Capabilities\n\n${listedCapabilities || "No subsystem cutover registered."}\n\n## Contracts\n\n${listedContracts || "No subsystem cutover registered."}\n\n${cutover}\n`
}

export function renderGeneratedFiles(model) {
  const release = model.release
  return Object.freeze({
    [GENERATED_PATHS[0]]: renderDocumentMap(model),
    [GENERATED_PATHS[1]]: renderTechnicalGlossary(model),
    [GENERATED_PATHS[2]]: renderThaiGlossary(model),
    [GENERATED_PATHS[3]]: renderVersionOverview(model, release),
    [GENERATED_PATHS[4]]: renderCapabilitySet(model, release),
  })
}
