import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function runProductEditorSmoke() {
  const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
    import { readFileSync } from "node:fs";
    import { register } from "node:module";
    import { pathToFileURL } from "node:url";

    register("./ts-loader.mjs", pathToFileURL(process.cwd() + "/scripts/"));
    const { createTemplateBuilderMutationBridge } = await import("./src/mutationBridge.ts");
    const {
      applyChangePacketToRuntime,
      createBootRuntimeState,
      createVisibleRangeRuntimeState,
    } = await import("./public/runtimeCache.js");
    const { createRenderWindow } = await import("./public/renderWindow.js");
    const { createStructuralOutlineJumpRequest } = await import("./public/structuralOutlineNavigation.js");
    const { structuralActionRequest } = await import("./public/structuralCommandPolicy.js");

    const fixture = JSON.parse(readFileSync("../../fixtures/product-report-vnext.flowdoc.json", "utf8"));
    const bridge = createTemplateBuilderMutationBridge(fixture, {
      fixturePath: "fixtures/product-report-vnext.flowdoc.json",
    });
    let snapshot = bridge.snapshot();
    let state = createBootRuntimeState(snapshot);

    const outlineJump = createStructuralOutlineJumpRequest({
      documentRevision: snapshot.session.documentRevision,
      node: state.runtimeCache.nodeById.get("cover-title"),
      nodeId: "cover-title",
      previousVisibleRangeRequest: state.runtimeCache.visibleRangeRequest,
    });
    const visibleRangeRequest = {
      ...outlineJump.visibleRangeRequest,
      budget: {
        ...outlineJump.visibleRangeRequest.budget,
        maxNodes: 8,
      },
      overscanSectionsAfter: 0,
      overscanSectionsBefore: 0,
    };
    state = createVisibleRangeRuntimeState(snapshot, state.runtimeCache, visibleRangeRequest);
    const initialRenderWindow = createRenderWindow({
      nodeIds: state.runtimeCache.nodeOrder,
      sections: snapshot.sections,
      visibleRange: state.runtimeCache.visibleRange,
    });

    const insertPolicy = structuralActionRequest({
      action: "insert-after",
      childrenById: state.runtimeCache.childrenById,
      node: state.runtimeCache.nodeById.get("cover-title"),
      nodeById: state.runtimeCache.nodeById,
      structuralText: "Smoke structural block",
    });
    const inserted = bridge.insertTextBlock({
      ...insertPolicy.body,
      nodeId: "phase-141-inserted",
    }, { includeSnapshot: false });
    let applied = applyChangePacketToRuntime(snapshot, state.runtimeCache, inserted.packet);
    if (!applied.ok) throw new Error(\`insert apply failed: \${applied.reason}\`);
    snapshot = applied.snapshot;
    state = { runtimeCache: applied.runtimeCache, snapshot };

    const insertedId = inserted.packet.nodesAdded?.[0]?.id || "phase-141-inserted";
    const deleted = bridge.deleteNode({ nodeId: insertedId }, { includeSnapshot: false });
    applied = applyChangePacketToRuntime(snapshot, state.runtimeCache, deleted.packet);
    if (!applied.ok) throw new Error(\`delete apply failed: \${applied.reason}\`);
    snapshot = applied.snapshot;
    state = { runtimeCache: applied.runtimeCache, snapshot };

    const reorderPolicy = structuralActionRequest({
      action: "move-down",
      childrenById: state.runtimeCache.childrenById,
      node: state.runtimeCache.nodeById.get("cover-title"),
      nodeById: state.runtimeCache.nodeById,
    });
    const reordered = bridge.reorderNode(reorderPolicy.body, { includeSnapshot: false });
    applied = applyChangePacketToRuntime(snapshot, state.runtimeCache, reordered.packet);
    if (!applied.ok) throw new Error(\`reorder apply failed: \${applied.reason}\`);
    snapshot = applied.snapshot;
    state = { runtimeCache: applied.runtimeCache, snapshot };

    const revision = snapshot.session.documentRevision;
    const richPlan = {
      baseRevision: revision,
      documentRevision: revision,
      operationKind: "text-block.rich-inline.replace",
      plannedInlineChildren: [
        { id: "cover-header-label-rich-1", type: "text", text: "Smoke ", style: { fontWeight: "bold" } },
        { id: "cover-header-label-rich-2", type: "field-ref", key: "customer.name", label: "Customer", fallback: "{{customer.name}}" },
        { id: "cover-header-label-rich-3", type: "text", text: " check" },
      ],
      status: "planned",
      targetTextBlockId: "cover-header-label",
    };
    const rich = bridge.commitRichInline({ plan: richPlan }, { includeSnapshot: false });
    applied = applyChangePacketToRuntime(snapshot, state.runtimeCache, rich.packet);
    if (!applied.ok) throw new Error(\`rich apply failed: \${applied.reason}\`);
    snapshot = applied.snapshot;
    state = { runtimeCache: applied.runtimeCache, snapshot };

    const undone = bridge.undo({ includeSnapshot: false });
    applied = applyChangePacketToRuntime(snapshot, state.runtimeCache, undone.packet);
    if (!applied.ok) throw new Error(\`undo apply failed: \${applied.reason}\`);
    snapshot = applied.snapshot;
    state = { runtimeCache: applied.runtimeCache, snapshot };

    const redone = bridge.redo({ includeSnapshot: false });
    applied = applyChangePacketToRuntime(snapshot, state.runtimeCache, redone.packet);
    if (!applied.ok) throw new Error(\`redo apply failed: \${applied.reason}\`);
    snapshot = applied.snapshot;
    state = { runtimeCache: applied.runtimeCache, snapshot };

    console.log(JSON.stringify({
      boundedVisibleNodeCount: state.runtimeCache.visibleNodeCount,
      counts: bridge.snapshot().counts,
      deleted: { action: deleted.packet.action, ok: deleted.ok },
      finalRevision: snapshot.session.documentRevision,
      initialRenderWindow: {
        nodeCount: initialRenderWindow.nodeCount,
        sectionCount: initialRenderWindow.sectionCount,
        windowed: initialRenderWindow.windowed,
      },
      inserted: {
        action: inserted.packet.action,
        insertedId,
        ok: inserted.ok,
        packetSource: inserted.packet.source,
      },
      outlineJump: {
        mode: outlineJump.mode,
        ok: outlineJump.ok,
        selectionSource: outlineJump.selectionSource,
      },
      redone: {
        action: redone.packet.action,
        canUndo: redone.packet.authoringHistory.canUndo,
        ok: redone.ok,
      },
      reordered: { action: reordered.packet.action, ok: reordered.ok },
      rich: {
        action: rich.packet.action,
        historyKind: rich.packet.authoringHistory.latestGroup.commandKinds[0],
        ok: rich.ok,
        stale: rich.packet.liveLayout.exactGenerationStale,
      },
      undone: {
        action: undone.packet.action,
        canRedo: undone.packet.authoringHistory.canRedo,
        ok: undone.ok,
      },
      visibleRange: {
        maxNodes: state.runtimeCache.visibleRange.maxNodes,
        nodeCount: state.runtimeCache.visibleRange.nodeCount,
        windowed: state.runtimeCache.visibleRange.windowed,
      },
    }));
  `], {
    cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
    encoding: "utf8",
  })

  return JSON.parse(output) as {
    boundedVisibleNodeCount: number
    counts: { nodes: number; sections: number; textBlocks: number }
    deleted: { action: string; ok: boolean }
    finalRevision: number
    initialRenderWindow: { nodeCount: number; sectionCount: number; windowed: boolean }
    inserted: { action: string; insertedId: string; ok: boolean; packetSource: string }
    outlineJump: { mode: string; ok: boolean; selectionSource: string }
    redone: { action: string; canUndo: boolean; ok: boolean }
    reordered: { action: string; ok: boolean }
    rich: { action: string; historyKind: string; ok: boolean; stale: boolean }
    undone: { action: string; canRedo: boolean; ok: boolean }
    visibleRange: { maxNodes: number; nodeCount: number; windowed: boolean }
  }
}

describe("product editor integration smoke boundary", () => {
  it("composes viewport, structural runtime, rich inline commit, undo/redo, and live/exact stale signals", () => {
    const result = runProductEditorSmoke()

    expect(result.counts).toMatchObject({
      nodes: 52,
      sections: 3,
      textBlocks: 28,
    })
    expect(result.outlineJump).toEqual({
      mode: "structural-outline-jump",
      ok: true,
      selectionSource: "outline",
    })
    expect(result.visibleRange).toEqual({
      maxNodes: 8,
      nodeCount: 8,
      windowed: true,
    })
    expect(result.initialRenderWindow).toEqual({
      nodeCount: 8,
      sectionCount: 1,
      windowed: true,
    })
    expect(result.inserted).toMatchObject({
      action: "text-block.insert",
      insertedId: "phase-141-inserted",
      ok: true,
    })
    expect(result.inserted.packetSource).toBe("flowdoc-structural-packet")
    expect(result.deleted).toEqual({ action: "node.delete", ok: true })
    expect(result.reordered).toEqual({ action: "node.reorder", ok: true })
    expect(result.rich).toEqual({
      action: "sandbox.commitRichInline",
      historyKind: "text-block.rich-inline.replace",
      ok: true,
      stale: true,
    })
    expect(result.undone).toEqual({ action: "sandbox.undo", canRedo: true, ok: true })
    expect(result.redone).toEqual({ action: "sandbox.redo", canUndo: true, ok: true })
    expect(result.finalRevision).toBe(6)
    expect(result.boundedVisibleNodeCount).toBeLessThanOrEqual(result.visibleRange.maxNodes)
  }, 20_000)

  it("keeps the product editor smoke as a sandbox-only boundary", () => {
    const testSource = readFileSync(new URL("./productEditorIntegrationSmoke.test.ts", import.meta.url), "utf8")
    const bridgeSource = readFileSync(new URL("../examples/template-builder-sandbox/src/mutationBridge.ts", import.meta.url), "utf8")

    expect(testSource).toContain("createTemplateBuilderMutationBridge")
    expect(testSource).toContain("createVisibleRangeRuntimeState")
    expect(testSource).toContain("structuralActionRequest")
    expect(testSource).not.toContain("FlowDoc" + "Editor")
    expect(testSource).not.toMatch(/from ["']react["']/)
    expect(testSource).not.toMatch(/\bdocument\.(querySelector|createElement|body|addEventListener)/)
    expect(bridgeSource).not.toContain("FlowDoc" + "Editor")
    expect(bridgeSource).not.toMatch(/from ["']react["']/)
  })

  it("documents Phase 141 in the phase trail", () => {
    const readText = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")
    const boundaryDoc = readText("../docs/PRODUCT_EDITOR_INTEGRATION_SMOKE_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(boundaryDoc).toContain("Status: Phase 141 product editor integration smoke boundary.")
    expect(boundaryDoc).toContain("tests/productEditorIntegrationSmoke.test.ts")
    expect(boundaryDoc).toContain("This is not a production editor readiness claim")
    expect(readme).toContain("Product editor integration smoke boundary")
    expect(readme).toContain("docs/PRODUCT_EDITOR_INTEGRATION_SMOKE_BOUNDARY.md")
    expect(ledger).toContain("| 141 | Product editor integration smoke boundary | done |")
    expect(roadmap).toContain("## Phase 141: Product Editor Integration Smoke Boundary")
  })
})
