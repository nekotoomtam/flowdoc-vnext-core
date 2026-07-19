import { createHash } from "node:crypto"
import {
  FLOWDOC_UAT_SCREENSHOT_PLACEMENT_POLICY,
  resolveFlowDocUatSectionV1,
} from "../src/index.js"
import { load69cUatSectionAdapter } from "./verify-69c-section-adapter-runtime.js"

function fingerprint(value: unknown): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex")}`
}

export async function verify69cUatSectionResolution(input: {
  semanticDirectory: string
}): Promise<Record<string, unknown>> {
  const loaded = await load69cUatSectionAdapter(input)
  const request = {
    contractVersion: 1 as const,
    kind: "uat-section-resolution-request" as const,
    adapterBundle: loaded.bundle,
    screenshotPlacementPolicy: FLOWDOC_UAT_SCREENSHOT_PLACEMENT_POLICY,
  }
  const first = resolveFlowDocUatSectionV1(request)
  if (first.status !== "resolved") {
    throw new Error(`69C section resolution blocked: ${JSON.stringify(first.issues)}`)
  }
  const roundTrip = JSON.parse(JSON.stringify(first))
  const second = resolveFlowDocUatSectionV1(JSON.parse(JSON.stringify(request)))
  if (second.status !== "resolved" || JSON.stringify(second) !== JSON.stringify(first)) {
    throw new Error("69C section resolution is not deterministic after request serialization")
  }
  if (JSON.stringify(roundTrip) !== JSON.stringify(first)) {
    throw new Error("69C section resolution result does not survive JSON parse/serialize")
  }

  const bundle = first.bundle
  const requirements = bundle.tables.requirements.materializedContent
  const screenshots = bundle.tables.screenshots.materializedContent
  return {
    evidenceVersion: 1,
    phaseId: "PDF-EXPORT-REALDOC-C",
    status: "accepted",
    sourceBaseline: {
      baselineId: loaded.baseline.baselineId,
      sourceBundleFingerprint: loaded.baseline.sourceBundleFingerprint,
    },
    adapter: {
      bundleFingerprint: loaded.bundle.bundleFingerprint,
      warningCodes: loaded.bundle.warnings.map((warning) => warning.code),
    },
    resolution: {
      structureFingerprint: bundle.structureFingerprint,
      resolutionInputFingerprint: bundle.resolutionInputFingerprint,
      bundleFingerprint: bundle.bundleFingerprint,
      generatedProvenanceFingerprint: fingerprint(bundle.provenance.generated),
      requirementMaterializationFingerprint: fingerprint({
        rows: requirements.rows,
        bindings: requirements.bindings,
      }),
      screenshotMaterializationFingerprint: fingerprint({
        rows: screenshots.rows,
        bindings: screenshots.bindings,
      }),
    },
    placement: {
      status: bundle.screenshotPlacement.status,
      policy: bundle.screenshotPlacement.policy,
      screenshotCount: bundle.screenshotPlacement.screenshotOrder.length,
      requirementLevelPlacement: bundle.screenshotPlacement.requirementLevelPlacement,
      basis: bundle.screenshotPlacement.basis,
    },
    summary: bundle.summary,
    serialization: {
      parseSerializeEqual: true,
      deterministicReresolutionEqual: true,
    },
    execution: bundle.execution,
    contracts: {
      sourceContentRetainedInEvidence: false,
      instanceRevision: bundle.instance.revision,
      identityAllocationOwner: "resolution-orchestrator",
      screenshotPlacementResolved: true,
      authoredGraphMutation: false,
      persistenceExecuted: false,
      measurementExecuted: false,
      paginationExecuted: false,
      rendererExecuted: false,
      artifactProduced: false,
      productionBinding: false,
    },
    nextPhase: "PDF-EXPORT-REALDOC-D section 2.1 measured local export",
  }
}
