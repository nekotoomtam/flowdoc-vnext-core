import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

function runCommitBridgeScenario(): Record<string, unknown> {
  const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
    import { readFileSync } from "node:fs";
    import { register } from "node:module";
    import { pathToFileURL } from "node:url";

    register("./ts-loader.mjs", pathToFileURL(process.cwd() + "/scripts/"));
    const { createTemplateBuilderMutationBridge } = await import("./src/mutationBridge.ts");
    const {
      createHybridInputRuntimeOwnership,
    } = await import("./public/inputRuntimeOwnership.js");
    const {
      activateActiveTextBlockIsland,
      createInactiveActiveTextBlockIslandState,
      openActiveTextBlockIsland,
      requestActiveTextBlockIslandCommit,
      updateActiveTextBlockIslandDraft,
    } = await import("./public/activeTextBlockIsland.js");
    const {
      createHybridInputCommandPolicy,
    } = await import("./public/hybridInputCommandPolicy.js");
    const {
      createActiveTextBlockDomBindingSmoke,
    } = await import("./public/activeTextBlockDomBinding.js");
    const {
      ACTIVE_ISLAND_COMMIT_BRIDGE_MODE,
      ACTIVE_ISLAND_COMMIT_BRIDGE_SOURCE,
      ACTIVE_ISLAND_COMMIT_OPERATION_KIND,
      activeIslandCommitBridgeSmokeLabel,
      createActiveIslandCommitBridgeSmoke,
    } = await import("./public/activeIslandCommitBridge.js");

    const fixture = JSON.parse(readFileSync("../../fixtures/product-report-vnext.flowdoc.json", "utf8"));
    const bridge = createTemplateBuilderMutationBridge(fixture, {
      fixturePath: "fixtures/product-report-vnext.flowdoc.json",
    });
    const node = {
      canUseHardenedTextBlockIsland: true,
      id: "cover-header-label",
      plainText: "Product Report",
      type: "text-block",
    };
    const ownership = createHybridInputRuntimeOwnership({
      requestedTargetType: "active-text-block-island",
      selectedNode: node,
    });
    const active = activateActiveTextBlockIsland(openActiveTextBlockIsland(createInactiveActiveTextBlockIslandState(), {
      ownership,
      selection: { end: 14, start: 14 },
      text: "Product Report",
      textBlockId: "cover-header-label",
    }));
    const dirty = updateActiveTextBlockIslandDraft(active, {
      selection: { end: 18, start: 18 },
      text: "Island bridge text",
    });
    const commitReadyIsland = requestActiveTextBlockIslandCommit(dirty);
    const commandPolicy = createHybridInputCommandPolicy({
      activeIsland: commitReadyIsland,
      commandKind: "commit",
      ownership,
    });
    const domBinding = createActiveTextBlockDomBindingSmoke(commitReadyIsland, {
      selection: { end: 18, start: 18 },
      surface: {
        contentEditable: "true",
        dataset: {
          activeNodeId: "cover-header-label",
          textBlockId: "cover-header-label",
        },
        textContent: "Island bridge text",
      },
    });
    const smoke = createActiveIslandCommitBridgeSmoke({
      activeIsland: commitReadyIsland,
      commandPolicy,
      documentRevision: 0,
      domBinding,
    });
    const accepted = bridge.commitRichInline(smoke.bridgeRequest, smoke.bridgeRequest.responseOptions);
    const stale = bridge.commitRichInline(smoke.bridgeRequest, smoke.bridgeRequest.responseOptions);
    const unsafe = createActiveIslandCommitBridgeSmoke({
      activeIsland: commitReadyIsland,
      commandPolicy,
      documentRevision: 1,
      domBinding: { safe: false, status: "unsafe", reason: "text-snapshot-mismatch" },
    });
    const missingRequest = createActiveIslandCommitBridgeSmoke({
      activeIsland: dirty,
      commandPolicy,
      documentRevision: 0,
      domBinding,
    });

    console.log(JSON.stringify({
      acceptedChangedNode: accepted.packet.changedNodes[0],
      acceptedExactStale: accepted.packet.liveLayout.exactGenerationStale,
      acceptedMutation: accepted.mutation,
      acceptedOk: accepted.ok,
      acceptedPacketAction: accepted.packet.action,
      acceptedRevision: accepted.packet.nextRevision,
      bridgeLabel: activeIslandCommitBridgeSmokeLabel(smoke),
      constants: {
        mode: ACTIVE_ISLAND_COMMIT_BRIDGE_MODE,
        operationKind: ACTIVE_ISLAND_COMMIT_OPERATION_KIND,
        source: ACTIVE_ISLAND_COMMIT_BRIDGE_SOURCE,
      },
      missingRequestReason: missingRequest.reason,
      missingRequestStatus: missingRequest.status,
      planChildren: smoke.bridgeRequest.plan.plannedInlineChildren,
      planOperationKind: smoke.bridgeRequest.plan.operationKind,
      planStatus: smoke.bridgeRequest.plan.status,
      runtimeCacheStatus: smoke.runtimeCache.status,
      smokeCanCommit: smoke.canBridgeCommit,
      smokeCoreStatus: smoke.coreTransaction.status,
      smokeExact: smoke.liveExact,
      smokePackage: smoke.packageMutation.status,
      smokeReason: smoke.reason,
      smokeStatus: smoke.status,
      staleIssue: stale.issues[0].code,
      staleOk: stale.ok,
      unsafeBridgeRequest: unsafe.bridgeRequest,
      unsafeReason: unsafe.reason,
      unsafeStatus: unsafe.status,
    }));
  `], {
    cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
    encoding: "utf8",
  })

  return JSON.parse(output) as Record<string, unknown>
}

describe("active island commit bridge smoke", () => {
  it("converts safe island capture facts into the existing rich inline commit bridge path", () => {
    const result = runCommitBridgeScenario()

    expect(result.constants).toMatchObject({
      mode: "browser-local-active-island-commit-bridge-smoke",
      operationKind: "text-block.rich-inline.replace",
      source: "flowdoc-active-island-commit-bridge-smoke",
    })
    expect(result.smokeStatus).toBe("accepted")
    expect(result.smokeReason).toBe("active-island-commit-bridge-ready")
    expect(result.smokeCanCommit).toBe(true)
    expect(result.smokeCoreStatus).toBe("planned-through-existing-bridge")
    expect(result.smokePackage).toBe("planned-through-existing-bridge")
    expect(result.smokeExact).toMatchObject({
      exactGenerationStale: true,
      status: "stale-after-accepted-commit",
    })
    expect(result.runtimeCacheStatus).toBe("refresh-after-accepted-packet")
    expect(result.planStatus).toBe("planned")
    expect(result.planOperationKind).toBe("text-block.rich-inline.replace")
    expect(result.planChildren).toEqual([
      {
        id: "cover-header-label-active-island-text-1",
        text: "Island bridge text",
        type: "text",
      },
    ])
    expect(result.bridgeLabel).toBe("Active island bridge: text-block.rich-inline.replace cover-header-label")
  }, 15_000)

  it("executes the planned request through the sandbox mutation bridge and keeps stale/rejected paths bounded", () => {
    const result = runCommitBridgeScenario()

    expect(result.acceptedOk).toBe(true)
    expect(result.acceptedMutation).toMatchObject({
      action: "sandbox.commitRichInline",
      status: "applied",
      targetTextBlockId: "cover-header-label",
    })
    expect(result.acceptedPacketAction).toBe("sandbox.commitRichInline")
    expect(result.acceptedRevision).toBe(1)
    expect(result.acceptedChangedNode).toMatchObject({
      id: "cover-header-label",
      textPreview: "Island bridge text",
    })
    expect(result.acceptedExactStale).toBe(true)
    expect(result.staleOk).toBe(false)
    expect(result.staleIssue).toBe("stale-rich-inline-plan")
    expect(result.unsafeStatus).toBe("rejected")
    expect(result.unsafeReason).toBe("unsafe-island-capture")
    expect(result.unsafeBridgeRequest).toBeNull()
    expect(result.missingRequestStatus).toBe("rejected")
    expect(result.missingRequestReason).toBe("missing-island-commit-request")
  }, 15_000)

  it("keeps the bridge smoke dependency-clean and does not bypass rich inline commit", () => {
    const source = readText("../examples/template-builder-sandbox/public/activeIslandCommitBridge.js")

    expect(source).toContain("ACTIVE_ISLAND_COMMIT_BRIDGE_SOURCE")
    expect(source).toContain("createActiveIslandCommitBridgeSmoke")
    expect(source).toContain("text-block.rich-inline.replace")
    expect(source).toContain("sandbox.commitRichInline")
    expect(source).toContain("only the existing mutation bridge may apply the plan")
    expect(source).not.toContain("document.")
    expect(source).not.toContain("querySelector")
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("FlowDocEditor")
    expect(source).not.toMatch(/from\s+["']\.\.\/\.\.\/src/)
  })

  it("documents Phase 158 and advances the roadmap to Phase 159", () => {
    const doc = readText("../docs/ACTIVE_ISLAND_COMMIT_BRIDGE_SMOKE.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain("Status: Phase 158 active island commit bridge smoke.")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL / BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("No granular rich inline operations.")
    expect(doc).toContain("No collaboration/offline safety claim.")
    expect(doc).toContain("Phase 159: Field Chip Delete / Copy / Paste Command Boundary")
    expect(readme).toContain("Active island commit bridge smoke")
    expect(readme).toContain("docs/ACTIVE_ISLAND_COMMIT_BRIDGE_SMOKE.md")
    expect(ledger).toContain("| 158 | Active island commit bridge smoke | done |")
    expect(roadmap).toContain("## Phase 158: Active Island Commit Bridge Smoke")
    expect(roadmap).toContain("Phase 159: Field Chip Delete / Copy / Paste Command Boundary")
  })
})
