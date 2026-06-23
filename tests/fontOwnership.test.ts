import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  createVNextFontOwnershipPlan,
  createVNextFontRegistrySpikePlan,
  VNEXT_FONT_OWNERSHIP_MODE,
  VNEXT_FONT_OWNERSHIP_SOURCE,
  type VNextFontOwnershipInput,
} from "../src/index.js"

function ownershipInput(overrides: Partial<VNextFontOwnershipInput> = {}): VNextFontOwnershipInput {
  return {
    policyId: "thai-font-ownership-v1",
    canonicalAssetRoot: "assets/fonts",
    hashAuthority: "vnext-target-copy",
    browserMirrorRoot: "public/fonts",
    assets: [{
      fontId: "sarabun-regular",
      required: true,
      source: {
        kind: "legacy-reference",
        path: "FlowDocEditor/public/fonts/Sarabun/Sarabun-Regular.ttf",
        canonical: false,
      },
      target: {
        kind: "package-font-asset",
        path: "assets/fonts/Sarabun/Sarabun-Regular.ttf",
      },
    }, {
      fontId: "sarabun-bold",
      required: true,
      source: {
        kind: "legacy-reference",
        path: "FlowDocEditor/public/fonts/Sarabun/Sarabun-Bold.ttf",
        canonical: false,
      },
      target: {
        kind: "package-font-asset",
        path: "assets/fonts/Sarabun/Sarabun-Bold.ttf",
      },
    }, {
      fontId: "noto-sans-thai-regular",
      required: true,
      source: {
        kind: "legacy-reference",
        path: "FlowDocEditor/public/fonts/Noto_Sans_Thai/static/NotoSansThai-Regular.ttf",
        canonical: false,
      },
      target: {
        kind: "package-font-asset",
        path: "assets/fonts/Noto_Sans_Thai/static/NotoSansThai-Regular.ttf",
      },
    }],
    ...overrides,
  }
}

describe("vNext font ownership clearing boundary", () => {
  it("clears package font assets as the canonical owner while keeping public fonts as mirrors", () => {
    const plan = createVNextFontOwnershipPlan(ownershipInput())

    expect(plan).toMatchObject({
      source: VNEXT_FONT_OWNERSHIP_SOURCE,
      mode: VNEXT_FONT_OWNERSHIP_MODE,
      status: "cleared",
      policyId: "thai-font-ownership-v1",
      canonicalOwner: {
        assetRoot: "assets/fonts",
        targetKind: "package-font-asset",
        hashAuthority: "vnext-target-copy",
        publicMirrorIsIdentitySource: false,
      },
      browserMirror: {
        root: "public/fonts",
        allowed: true,
        identitySource: false,
      },
      summary: {
        assetCount: 3,
        requiredAssetCount: 3,
        plannedCopyCount: 3,
        legacySourceReferenceCount: 3,
      },
      registryUpdatePolicy: {
        targetKindAfterCopy: "package-font-asset",
        requireVerifiedLicense: true,
        requireSha256FromTargetCopy: true,
        legacySourceMayRemainEvidence: true,
      },
      executionContract: {
        readsFontFiles: false,
        copiesFontFiles: false,
        computesHashes: false,
        mutatesPackageJson: false,
        mutatesPackageSchema: false,
        writesArtifacts: false,
        usesLegacyRuntime: false,
      },
      blockingIssues: [],
    })
    expect(plan.warningIssues.map((issue) => issue.code)).toEqual([
      "legacy-source-reference",
      "legacy-source-reference",
      "legacy-source-reference",
    ])
    expect(plan.plannedCopies).toEqual([{
      fontId: "sarabun-regular",
      status: "planned",
      sourceReferencePath: "FlowDocEditor/public/fonts/Sarabun/Sarabun-Regular.ttf",
      targetPath: "assets/fonts/Sarabun/Sarabun-Regular.ttf",
      hashMustBeComputedFrom: "vnext-target-copy",
    }, {
      fontId: "sarabun-bold",
      status: "planned",
      sourceReferencePath: "FlowDocEditor/public/fonts/Sarabun/Sarabun-Bold.ttf",
      targetPath: "assets/fonts/Sarabun/Sarabun-Bold.ttf",
      hashMustBeComputedFrom: "vnext-target-copy",
    }, {
      fontId: "noto-sans-thai-regular",
      status: "planned",
      sourceReferencePath: "FlowDocEditor/public/fonts/Noto_Sans_Thai/static/NotoSansThai-Regular.ttf",
      targetPath: "assets/fonts/Noto_Sans_Thai/static/NotoSansThai-Regular.ttf",
      hashMustBeComputedFrom: "vnext-target-copy",
    }])
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan)
  })

  it("blocks public and legacy roots from becoming measurement identity", () => {
    const publicRoot = createVNextFontOwnershipPlan(ownershipInput({
      canonicalAssetRoot: "public/fonts",
    }))
    const legacyRoot = createVNextFontOwnershipPlan(ownershipInput({
      canonicalAssetRoot: "C:/Users/nekot/Documents/GitHub/FlowDocEditor/public/fonts",
    }))

    expect(publicRoot.status).toBe("blocked")
    expect(publicRoot.blockingIssues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      "canonical-root-is-public",
      "target-outside-canonical-root",
    ]))
    expect(legacyRoot.status).toBe("blocked")
    expect(legacyRoot.blockingIssues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      "canonical-root-is-legacy",
      "canonical-root-is-absolute",
      "target-outside-canonical-root",
    ]))
  })

  it("blocks legacy target paths and source references marked as canonical", () => {
    const plan = createVNextFontOwnershipPlan(ownershipInput({
      assets: [{
        fontId: "sarabun-regular",
        required: true,
        source: {
          kind: "legacy-reference",
          path: "FlowDocEditor/public/fonts/Sarabun/Sarabun-Regular.ttf",
          canonical: true,
        },
        target: {
          kind: "package-font-asset",
          path: "C:/Users/nekot/Documents/GitHub/FlowDocEditor/public/fonts/Sarabun/Sarabun-Regular.ttf",
        },
      }],
    }))

    expect(plan.status).toBe("blocked")
    expect(plan.blockingIssues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      "source-reference-marked-canonical",
      "target-outside-canonical-root",
      "target-is-legacy",
    ]))
  })

  it("blocks non-package targets and source-derived hashes for canonical assets", () => {
    const plan = createVNextFontOwnershipPlan(ownershipInput({
      hashAuthority: "source-reference",
      assets: [{
        ...ownershipInput().assets[0],
        target: {
          kind: "browser-public-mirror",
          path: "public/fonts/Sarabun/Sarabun-Regular.ttf",
        },
      }],
    }))

    expect(plan.status).toBe("blocked")
    expect(plan.blockingIssues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      "hash-authority-not-target-copy",
      "target-kind-not-package-asset",
      "target-outside-canonical-root",
    ]))
  })

  it("allows package font asset targets to become ready registry facts after copy and hash", () => {
    const registry = createVNextFontRegistrySpikePlan({
      registryId: "thai-core-fonts-v1",
      policyRevision: "font-policy-v2",
      assets: [{
        fontId: "sarabun-regular",
        family: "Sarabun",
        style: "normal",
        weight: 400,
        format: "ttf",
        role: "primary-thai",
        availability: "available",
        source: {
          kind: "legacy-reference",
          reference: "FlowDocEditor/public/fonts/Sarabun/Sarabun-Regular.ttf",
          canonical: false,
        },
        target: {
          kind: "package-font-asset",
          path: "assets/fonts/Sarabun/Sarabun-Regular.ttf",
        },
        license: {
          id: "OFL-1.1",
          verified: true,
        },
        hash: {
          algorithm: "sha256",
          value: "sarabun-regular-target-copy-hash",
        },
        supportedScripts: ["Thai", "Latin"],
      }],
      styleMappings: [{
        styleKey: "paragraph",
        primaryFontId: "sarabun-regular",
        required: true,
      }],
    })

    expect(registry.status).toBe("ready-for-measurement-spike")
    expect(registry.measurementFontAssets).toEqual([expect.objectContaining({
      fontId: "sarabun-regular",
      source: "future-registry",
      hash: "sha256-sarabun-regular-target-copy-hash",
    })])
  })

  it("keeps the font ownership boundary independent from font IO and package mutation", () => {
    const sourceUrl = new URL("../src/renderer/fontOwnership.ts", import.meta.url)
    const source = readFileSync(sourceUrl, "utf8")

    expect(source).toContain("createVNextFontOwnershipPlan")
    expect(source).toContain("package-font-asset")
    expect(source).toContain("browser-public-mirror")
    expect(source).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(source).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(source).not.toMatch(/node:fs|node:path|node:http|node:https|express|fastify/)
    expect(source).not.toMatch(/from\s+["'](?:fontkit|opentype\.js|ttf-parser|harfbuzzjs|canvas|puppeteer|playwright)["']/)
    expect(source).not.toMatch(/require\(["'](?:fontkit|opentype\.js|ttf-parser|harfbuzzjs|canvas|puppeteer|playwright)["']\)/)
    expect(source).not.toContain("readFile")
    expect(source).not.toContain("writeFile")
    expect(source).not.toContain("createHash")
    expect(source).not.toContain("package.json")
    expect(source).not.toContain("DocumentNode")
    expect(source).not.toContain("paginateVNextDocument")
    expect(source).not.toContain("measureVNextText")
  })

  it("documents the font ownership clearing boundary in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/FONT_OWNERSHIP_CLEARING_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 102 risk clearing boundary.")
    expect(boundaryDoc).toContain("assets/fonts")
    expect(boundaryDoc).toContain("public/fonts")
    expect(boundaryDoc).toContain("vNext-owned target copy")
    expect(readme).toContain("Font ownership clearing boundary")
    expect(readme).toContain("docs/FONT_OWNERSHIP_CLEARING_BOUNDARY.md")
    expect(ledger).toContain("| 102 | Font ownership clearing boundary | done |")
    expect(roadmap).toContain("## Phase 102: Font Ownership Clearing Boundary")
  })
})
