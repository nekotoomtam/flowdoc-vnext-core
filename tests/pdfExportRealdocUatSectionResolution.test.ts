import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  FLOWDOC_UAT_SCREENSHOT_PLACEMENT_POLICY,
  adaptFlowDocUatSemanticNoPagesSectionV1,
  flowDocUatPublishedStructureRefV1,
  resolveFlowDocUatCanonicalGenerationV1,
  resolveFlowDocUatSectionV1,
  type FlowDocUatSemanticNoPagesAdapterInputV1,
  type FlowDocUatSectionDataBundleV1,
} from "../packages/uat-realdoc/src/index.js"

function adapterInput(): FlowDocUatSemanticNoPagesAdapterInputV1 {
  const requirementId = "REQ-SYNTH-C-001"
  const screenshotId = "synthetic_c_img_001"
  return {
    source: {
      sourceSetId: "uat-synthetic-c-source",
      sourceBundleFingerprint: `sha256:${"1".repeat(64)}`,
      semanticMap: {
        fileName: "synthetic_c_semantic.json",
        byteLength: 4096,
        sha256: "2".repeat(64),
      },
    },
    semanticDocument: {
      document: {
        title: "Synthetic UAT Resolution",
        project: "FlowDoc Test",
        version: "1",
        author: "FlowDoc",
        updated_date: "2026-07-19",
        source_file_name: "synthetic.pdf",
        total_pages: 3,
        extraction_schema: "uat_semantic_no_pages_v1",
      },
      modules: [{
        module_id: "module_synthetic",
        module_number: "1",
        title: "โมดูลตัวอย่าง",
        description: "Synthetic module",
        sections: [{
          section_id: "section_synthetic_1_1",
          section_number: "1.1",
          title: "หัวข้อทดสอบ",
          description: "ทดสอบการสร้าง instance",
          has_requirements: true,
          screenshot_ids: [screenshotId],
          requirements: [{
            requirement_id: requirementId,
            feature_text: "รองรับข้อความภาษาไทย\nและบรรทัดถัดไป",
            feature_bullets: ["หัวข้อสังเคราะห์"],
            element_types: ["Functional"],
            accept_status: "blank",
            remark: "",
            linked_screenshot_ids: [screenshotId],
          }],
          screenshots: [{
            screenshot_id: screenshotId,
            file: `images/${screenshotId}.png`,
            caption: "ภาพตัวอย่าง",
            description: "หน้าจอสังเคราะห์สำหรับทดสอบ",
            scope: "section",
            linked_requirement_ids: [requirementId],
            match_basis: "same_section_related_image_block",
            confidence: "medium",
            image_metadata: {
              display_width: 400,
              display_height: 240,
              source_width: 800,
              source_height: 480,
              pixel_width: 800,
              pixel_height: 480,
            },
          }],
        }],
      }],
    },
    sectionNumber: "1.1",
    instance: {
      contractVersion: 1,
      kind: "document-instance",
      instanceId: "instance-uat-synthetic-c-local",
      revision: 0,
      structureVersion: flowDocUatPublishedStructureRefV1(),
    },
    imageResources: [{
      sourcePath: `images/${screenshotId}.png`,
      mediaType: "image/png",
      byteLength: 1200,
      sha256: "a".repeat(64),
      pixelWidth: 800,
      pixelHeight: 480,
    }],
  }
}

function adapterBundle(): FlowDocUatSectionDataBundleV1 {
  const result = adaptFlowDocUatSemanticNoPagesSectionV1(adapterInput())
  if (result.status !== "ready-with-warnings") throw new Error("synthetic adapter input must pass")
  return result.bundle
}

function resolutionRequest(bundle = adapterBundle()) {
  return {
    contractVersion: 1 as const,
    kind: "uat-section-resolution-request" as const,
    adapterBundle: bundle,
    screenshotPlacementPolicy: FLOWDOC_UAT_SCREENSHOT_PLACEMENT_POLICY,
  }
}

function repinAdapterBundle(bundle: FlowDocUatSectionDataBundleV1): void {
  const { bundleFingerprint: _bundleFingerprint, ...unsigned } = bundle
  bundle.bundleFingerprint = `sha256:${createHash("sha256")
    .update(JSON.stringify(unsigned), "utf8")
    .digest("hex")}`
}

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue)
  if (value == null || typeof value !== "object") return value
  return Object.fromEntries(Object.keys(value as Record<string, unknown>).sort().map((key) => [
    key,
    canonicalValue((value as Record<string, unknown>)[key]),
  ]))
}

function canonicalFingerprint(value: unknown): string {
  return `sha256:${createHash("sha256")
    .update(JSON.stringify(canonicalValue(value)), "utf8")
    .digest("hex")}`
}

describe("PDF-EXPORT-REALDOC-C UAT section resolution", () => {
  it("resolves a Backend-retained canonical generation without adapter provenance", () => {
    const adapted = adapterBundle()
    const canonicalInput = {
      kind: "canonical-snapshot-input" as const,
      dataSnapshot: adapted.dataSnapshot,
      collectionSnapshots: [adapted.collectionSnapshot],
      mediaSnapshot: adapted.mediaSnapshot,
    }
    const result = resolveFlowDocUatCanonicalGenerationV1({
      contractVersion: 1,
      kind: "uat-canonical-generation-resolution-request",
      canonicalInput,
      canonicalInputFingerprint: canonicalFingerprint(canonicalInput),
      publishedStructureFingerprint: adapted.structureFingerprint,
      screenshotPlacementPolicy: FLOWDOC_UAT_SCREENSHOT_PLACEMENT_POLICY,
    })

    expect(result.status).toBe("resolved")
    if (result.status !== "resolved") throw new Error(JSON.stringify(result.issues))
    expect(result.bundle).toMatchObject({
      kind: "uat-canonical-generation-resolution-bundle",
      resolutionId: "flowdoc-uat-canonical-generation-resolution-v1",
      generation: {
        source: "backend-protected-canonical-record",
        publishedStructureFingerprint: adapted.structureFingerprint,
      },
      instance: { instanceId: "instance-uat-synthetic-c-local", revision: 0 },
      screenshotPlacement: { screenshotOrder: ["synthetic_c_img_001"] },
      summary: {
        materializedRowCount: 2,
        imageBindingCount: 1,
        sourceToInstanceRowCount: 0,
      },
    })
    expect("adapter" in result.bundle).toBe(false)

    const drifted = structuredClone(canonicalInput)
    drifted.dataSnapshot.data.values["uat.document.title"] = "drifted"
    expect(resolveFlowDocUatCanonicalGenerationV1({
      contractVersion: 1,
      kind: "uat-canonical-generation-resolution-request",
      canonicalInput: drifted,
      canonicalInputFingerprint: canonicalFingerprint(canonicalInput),
      publishedStructureFingerprint: adapted.structureFingerprint,
      screenshotPlacementPolicy: FLOWDOC_UAT_SCREENSHOT_PLACEMENT_POLICY,
    })).toMatchObject({
      status: "blocked",
      issues: [{ code: "canonical-input-fingerprint-mismatch" }],
    })
  })

  it("materializes revision zero and resolves document fields plus both collection tables", () => {
    const source = resolutionRequest()
    const before = JSON.stringify(source)
    const result = resolveFlowDocUatSectionV1(source)

    expect(result.status).toBe("resolved")
    if (result.status !== "resolved") throw new Error(result.issues.map((item) => item.message).join("\n"))
    expect(result.bundle).toMatchObject({
      contractVersion: 1,
      kind: "uat-section-resolution-bundle",
      resolutionId: "flowdoc-uat-section-resolution-v1",
      instance: { instanceId: "instance-uat-synthetic-c-local", revision: 0 },
      instanceMaterialization: {
        status: "planned",
        document: { document: { id: "instance-uat-synthetic-c-local" } },
      },
      scopedResolution: {
        status: "resolved",
        execution: {
          collectionRowResolution: "not-run",
          collectionContentMaterialization: "not-run",
          measurement: "not-run",
          pagination: "not-run",
          rendering: "not-run",
        },
      },
      screenshotPlacement: {
        status: "resolved",
        policy: "section-after-requirements-source-order",
        bodyOrder: ["uat-requirements-table", "uat-screenshots-heading", "uat-screenshots-table"],
        screenshotOrder: ["synthetic_c_img_001"],
        requirementLevelPlacement: false,
      },
      execution: {
        persistence: "not-run",
        revisionAdvance: false,
        documentMaterialization: "planned",
        documentResolution: "resolved",
        collectionRowResolution: "resolved",
        collectionContentMaterialization: "materialized",
        measurement: "not-run",
        pagination: "not-run",
        rendering: "not-run",
      },
      summary: {
        documentFieldBindingCount: 8,
        styleBindingCount: 18,
        tableCount: 2,
        resolvedRowCount: 3,
        materializedRowCount: 2,
        authoredReferenceRowCount: 1,
        clonedNodeCount: 7,
        clonedInlineCount: 6,
        textBindingCount: 6,
        imageBindingCount: 1,
        sourceToInstanceRowCount: 2,
      },
    })
    expect(result.bundle.scopedResolution.resolvedDocument.bindings.fields).toEqual(expect.arrayContaining([
      expect.objectContaining({ fieldKey: "uat.document.title", value: "Synthetic UAT Resolution" }),
      expect.objectContaining({ fieldKey: "uat.section.title", value: "หัวข้อทดสอบ" }),
      expect.objectContaining({ fieldKey: "uat.approval.name", value: "", valueSource: "data-snapshot" }),
    ]))
    expect(result.bundle.tables.requirements.resolvedRows.rows.map((row) => row.source.kind)).toEqual([
      "static-row", "collection-row",
    ])
    expect(result.bundle.tables.requirements.materializedContent.bindings.text).toEqual(expect.arrayContaining([
      expect.objectContaining({
        sourcePlacementId: "uat-req-feature-placement",
        itemKey: "REQ-SYNTH-C-001",
        value: "รองรับข้อความภาษาไทยและบรรทัดถัดไป",
        valueSource: "item-snapshot",
      }),
      expect.objectContaining({
        sourcePlacementId: "uat-req-accept-placement",
        value: "blank",
        valueSource: "item-snapshot",
      }),
      expect.objectContaining({ sourcePlacementId: "uat-req-remark-placement", value: "" }),
    ]))
    expect(result.bundle.tables.screenshots.materializedContent.bindings.images).toEqual([
      expect.objectContaining({
        sourcePlacementId: "uat-screenshot-image",
        itemKey: "synthetic_c_img_001",
        assetId: "uat-image-synthetic_c_img_001",
        assetOwner: "instance-media",
        valueSource: "item-snapshot",
      }),
    ])
    expect(result.bundle.provenance.sourceToInstanceRows).toEqual([
      expect.objectContaining({
        collectionFieldKey: "uat.requirements",
        itemKey: "REQ-SYNTH-C-001",
        source: { sourcePointer: expect.stringContaining("requirements/0"), derivation: "normalized-imported-text" },
        rowInstanceId: expect.stringMatching(/^rowi_[a-f0-9]{24}$/u),
      }),
      expect.objectContaining({
        collectionFieldKey: "uat.screenshots",
        itemKey: "synthetic_c_img_001",
        source: { sourcePointer: expect.stringContaining("screenshots/0"), derivation: "copy" },
        rowInstanceId: expect.stringMatching(/^rowi_[a-f0-9]{24}$/u),
      }),
    ])
    expect(result.bundle.bundleFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
    expect(result.bundle.resolutionInputFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/u)
    expect(JSON.stringify(source)).toBe(before)
  })

  it("survives parse/serialize and deterministic re-resolution without identity drift", () => {
    const request = resolutionRequest()
    const first = resolveFlowDocUatSectionV1(request)
    const serializedRequest = JSON.parse(JSON.stringify(request))
    const second = resolveFlowDocUatSectionV1(serializedRequest)

    expect(second).toEqual(first)
    expect(JSON.parse(JSON.stringify(first))).toEqual(first)
    if (first.status !== "resolved" || second.status !== "resolved") throw new Error("resolution must pass")
    expect(second.bundle.provenance.sourceToInstanceRows).toEqual(first.bundle.provenance.sourceToInstanceRows)
    expect(second.bundle.provenance.generated).toEqual(first.bundle.provenance.generated)
  })

  it("fails closed on adapter drift, nonzero instance revision, or an unsupported placement decision", () => {
    const truncated = resolveFlowDocUatSectionV1({
      contractVersion: 1,
      kind: "uat-section-resolution-request",
      adapterBundle: { adapterId: "flowdoc-uat-semantic-no-pages-adapter-v1" },
      screenshotPlacementPolicy: FLOWDOC_UAT_SCREENSHOT_PLACEMENT_POLICY,
    })
    expect(truncated).toMatchObject({ status: "blocked", bundle: null })

    const drift = resolutionRequest()
    drift.adapterBundle.dataSnapshot.data.values["uat.section.title"] = "changed without repinning"
    const driftResult = resolveFlowDocUatSectionV1(drift)
    expect(driftResult).toMatchObject({ status: "blocked", bundle: null })
    expect(driftResult.issues.map((item) => item.code)).toContain("adapter-bundle-fingerprint-mismatch")

    const normalizationDrift = resolutionRequest()
    normalizationDrift.adapterBundle.textNormalization.summary.softWrapJoinCount += 1
    repinAdapterBundle(normalizationDrift.adapterBundle)
    const normalizationDriftResult = resolveFlowDocUatSectionV1(normalizationDrift)
    expect(normalizationDriftResult).toMatchObject({ status: "blocked", bundle: null })
    expect(normalizationDriftResult.issues.map((item) => item.code)).toContain(
      "text-normalization-fingerprint-mismatch",
    )

    const revisionAdapterInput = adapterInput()
    revisionAdapterInput.instance.revision = 1
    const revisionAdapter = adaptFlowDocUatSemanticNoPagesSectionV1(revisionAdapterInput)
    if (revisionAdapter.status !== "ready-with-warnings") throw new Error("revision adapter fixture must pass")
    const revision = resolutionRequest(revisionAdapter.bundle)
    const revisionResult = resolveFlowDocUatSectionV1(revision)
    expect(revisionResult).toMatchObject({ status: "blocked", bundle: null })
    expect(revisionResult.issues.map((item) => item.code)).toContain("instance-revision-not-zero")

    const placement = {
      ...resolutionRequest(),
      screenshotPlacementPolicy: "after-each-requirement",
    }
    const placementResult = resolveFlowDocUatSectionV1(placement)
    expect(placementResult).toMatchObject({ status: "blocked", bundle: null })
    expect(placementResult.issues[0].path).toBe("screenshotPlacementPolicy")
  })

  it("retains content-free exact 69C REALDOC-C evidence", () => {
    const evidence = JSON.parse(readFileSync(resolve(
      process.cwd(),
      "packages/uat-realdoc/fixtures/69c-section-2-1-resolution-evidence.v1.json",
    ), "utf8"))

    expect(evidence).toMatchObject({
      evidenceVersion: 1,
      phaseId: "PDF-EXPORT-REALDOC-C",
      status: "accepted",
      placement: {
        policy: "section-after-requirements-source-order",
        requirementLevelPlacement: false,
      },
      summary: {
        tableCount: 2,
        resolvedRowCount: 18,
        materializedRowCount: 17,
        authoredReferenceRowCount: 1,
        clonedNodeCount: 61,
        clonedInlineCount: 54,
        textBindingCount: 54,
        imageBindingCount: 7,
        sourceToInstanceRowCount: 17,
      },
      contracts: {
        sourceContentRetainedInEvidence: false,
        instanceRevision: 0,
        measurementExecuted: false,
        paginationExecuted: false,
        rendererExecuted: false,
        artifactProduced: false,
        productionBinding: false,
      },
    })
    expect(JSON.stringify(evidence)).not.toContain("feature_text")
    expect(JSON.stringify(evidence)).not.toContain("sourcePointer")
  })
})
