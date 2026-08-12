import { dirname, relative } from "node:path"

import { GENERATED_PATHS } from "./canonical-docs-model.mjs"

export const GENERATED_HEADER = "<!-- GENERATED FILE — DO NOT EDIT -->\n"

function byId(left, right, key) {
  return left[key] === right[key] ? 0 : left[key] < right[key] ? -1 : 1
}

function documentLink(document, from) {
  const path = relative(dirname(from), document.path).split("\\").join("/")
  return `[${document.documentId} — ${document.title}](${path})`
}

function section(title, documents, from) {
  if (documents.length === 0) return ""
  return `## ${title}\n\n${[...documents].sort((left, right) => byId(left, right, "documentId")).map((document) => `- ${documentLink(document, from)}`).join("\n")}\n\n`
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
  return `${header("Canonical document map")}${section("Active current truth", currentTruth, GENERATED_PATHS[0])}${section("Coordination", coordination, GENERATED_PATHS[0])}${section("Version line", versionLine, GENERATED_PATHS[0])}${section("Glossary", glossary, GENERATED_PATHS[0])}${section("Non-active records", inactive, GENERATED_PATHS[0])}`.trimEnd() + "\n"
}

function renderGlossary(model, language) {
  const thai = language === "thai"
  const concepts = new Map(model.glossary.concepts.map((concept) => [concept.conceptId, concept]))
  const entries = [...model.glossary.terms].sort((left, right) => byId(left, right, "termId")).map((term) => {
    const concept = concepts.get(term.conceptId)
    const label = thai ? concept.labels.thai : concept.labels.technical
    const definition = thai ? term.definitions.thai : term.definitions.technical
    return `## \`${term.termId}\` — ${label}\n\n${definition}\n\n- Canonical name: ${term.canonicalName}\n- Lifecycle: ${term.lifecycle}\n`
  }).join("\n")
  return `${header(thai ? "อภิธานศัพท์หลัก" : "Technical glossary")}${entries || (thai ? "ไม่มีคำศัพท์ที่ลงทะเบียน\n" : "No terms registered.\n")}`
}

export function renderTechnicalGlossary(model) {
  return renderGlossary(model, "technical")
}

export function renderThaiGlossary(model) {
  return renderGlossary(model, "thai")
}

function releaseFacts(model, release) {
  return [
    `repositoryId: ${release.repositoryId}`,
    `releaseLine: ${release.releaseLine}`,
    `lifecycle: ${release.lifecycle}`,
    `releaseVersion: ${release.releaseVersion}`,
    `releaseReady: ${release.releaseReady}`,
    `baselineId: ${release.baselineId}`,
    `coreEditor: ${model.compatibility.coreEditor}`,
    `coreBackend: ${model.compatibility.coreBackend}`,
    `endToEnd: ${model.compatibility.endToEnd}`,
  ].map((fact) => `- ${fact}`).join("\n")
}

export function renderVersionOverview(model, release = model.release) {
  const baselineStatement = model.baseline === null
    ? "The Development Baseline is pending publication. This planned, unversioned, non-ready view makes no release or compatibility claim."
    : `Development Baseline ${model.baseline.baselineId} was recorded on ${model.baseline.recordedAt}. This unversioned, non-ready record makes no release or compatibility claim.`
  return `${header("Version overview")}## Authored release facts\n\n${releaseFacts(model, release)}\n\n${baselineStatement}\n`
}

export function renderCapabilitySet(model, release = model.release) {
  const selectors = [
    ["Capabilities", release.capabilityIds],
    ["Contracts", release.contractIds],
    ["Verification gates", release.verificationGateIds],
  ].map(([title, ids]) => `## ${title}\n\n${ids.length === 0 ? "No identities selected." : ids.map((id) => `- \`${id}\``).join("\n")}`).join("\n\n")
  return `${header("Capability set")}## Authored release facts\n\n${releaseFacts(model, release)}\n\n${selectors}\n\nNo subsystem cutover is selected; no release-readiness claim is made.\n`
}

export function renderGeneratedFiles(model) {
  return Object.freeze({
    [GENERATED_PATHS[0]]: renderDocumentMap(model),
    [GENERATED_PATHS[1]]: renderTechnicalGlossary(model),
    [GENERATED_PATHS[2]]: renderThaiGlossary(model),
    [GENERATED_PATHS[3]]: renderVersionOverview(model),
    [GENERATED_PATHS[4]]: renderCapabilitySet(model),
  })
}
