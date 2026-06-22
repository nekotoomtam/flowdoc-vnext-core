import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8")) as unknown
}

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("template builder sandbox boundary", () => {
  it("keeps the sandbox as an extractable package outside root core scripts", () => {
    const rootPackage = readJson("../package.json") as {
      scripts: Record<string, string>
      dependencies: Record<string, string>
      devDependencies: Record<string, string>
      files: string[]
    }
    const sandboxPackage = readJson("../examples/template-builder-sandbox/package.json") as {
      scripts: Record<string, string>
      dependencies: Record<string, string>
      devDependencies: Record<string, string>
    }

    expect(sandboxPackage.dependencies["@flowdoc/vnext-core"]).toBe("file:../..")
    expect(sandboxPackage.scripts).toMatchObject({
      build: expect.stringContaining("build-snapshot"),
      check: expect.stringContaining("tsc"),
      dev: expect.stringContaining("serve"),
    })
    expect(rootPackage.files).not.toContain("examples")
    expect(rootPackage.dependencies).not.toHaveProperty("react")
    expect(rootPackage.devDependencies).not.toHaveProperty("vite")
    expect(rootPackage.scripts).not.toHaveProperty("dev")
  })

  it("imports core only through the public package boundary", () => {
    const bridge = readText("../examples/template-builder-sandbox/src/coreBoundary.ts")
    const tsconfig = readText("../examples/template-builder-sandbox/tsconfig.json")

    expect(bridge).toContain('from "@flowdoc/vnext-core"')
    expect(bridge).not.toMatch(/from\s+["']\.\.\/\.\.\/src/)
    expect(bridge).not.toMatch(/from\s+["']\.\.\/\.\.\/\.\.\/src/)
    expect(tsconfig).toContain('"@flowdoc/vnext-core"')
  })

  it("keeps the sandbox free of parent editor and route dependencies", () => {
    const files = [
      "../examples/template-builder-sandbox/src/coreBoundary.ts",
      "../examples/template-builder-sandbox/src/mutationBridge.ts",
      "../examples/template-builder-sandbox/scripts/build-snapshot.ts",
      "../examples/template-builder-sandbox/scripts/serve.mjs",
      "../examples/template-builder-sandbox/public/runtimeStore.js",
      "../examples/template-builder-sandbox/public/runtimeStoreStructuralPacket.js",
      "../examples/template-builder-sandbox/public/renderWindow.js",
      "../examples/template-builder-sandbox/public/renderShell.js",
      "../examples/template-builder-sandbox/public/renderModel.js",
      "../examples/template-builder-sandbox/public/viewportAnchor.js",
      "../examples/template-builder-sandbox/public/viewportNodeAnchor.js",
      "../examples/template-builder-sandbox/public/viewportMeasurement.js",
      "../examples/template-builder-sandbox/public/viewportScrollController.js",
      "../examples/template-builder-sandbox/public/viewportSchedulerCandidate.js",
      "../examples/template-builder-sandbox/public/viewportSchedulerApply.js",
      "../examples/template-builder-sandbox/public/viewportSchedulerRuntime.js",
      "../examples/template-builder-sandbox/public/viewportSchedulerAutomation.js",
      "../examples/template-builder-sandbox/public/viewportVirtualStack.js",
      "../examples/template-builder-sandbox/public/viewportLazyDetail.js",
      "../examples/template-builder-sandbox/public/viewportSectionOffsets.js",
      "../examples/template-builder-sandbox/public/viewportSectionSpacers.js",
      "../examples/template-builder-sandbox/public/viewportController.js",
      "../examples/template-builder-sandbox/public/visibleRangeRequest.js",
      "../examples/template-builder-sandbox/public/visibleRange.js",
      "../examples/template-builder-sandbox/public/editorView.js",
      "../examples/template-builder-sandbox/public/runtimeCache.js",
      "../examples/template-builder-sandbox/public/app.js",
      "../examples/template-builder-sandbox/public/styles.css",
    ].map(readText).join("\n")

    expect(files).not.toMatch(/\.\.\/\.\.\/packages/)
    expect(files).not.toMatch(/\.\.\/\.\.\/src\/app/)
    expect(files).not.toContain("/api/paginate")
    expect(files).not.toContain("/api/export")
    expect(files).not.toContain("FlowDocEditor")
  })

  it("carries core-derived relationship facts in the generated snapshot", () => {
    const snapshot = readJson("../examples/template-builder-sandbox/public/sandbox-snapshot.json") as {
      sections: Array<{ zones: Array<Record<string, unknown> & { children: Array<Record<string, unknown>> }> }>
      actionLanes: Array<{ action: string; status: string }>
      authoringHistory: { mode: string; recordCount: number; groupCount: number; latestGroup: unknown }
      liveLayout: { mode: string; requestCount: number; exactGenerationStale: boolean; lastResult: unknown }
    }
    const coverZone = snapshot.sections[0].zones[0]
    const coverText = coverZone.children[0]
    const coverTitle = snapshot.sections[0].zones[1].children.find((node) => node.id === "cover-title")

    expect(coverZone).toMatchObject({
      id: "cover-first-header",
      type: "zone",
      sectionId: "section-cover",
      zoneId: "cover-first-header",
      parentId: "section-cover",
      parentKind: "section",
      depth: 0,
      path: ["cover-first-header"],
      canBeDeleted: false,
      canBeDuplicated: false,
      canBeReordered: false,
    })
    expect(coverText).toMatchObject({
      id: "cover-header-label",
      type: "text-block",
      sectionId: "section-cover",
      zoneId: "cover-first-header",
      parentId: "cover-first-header",
      parentKind: "zone",
      depth: 1,
      path: ["cover-first-header", "cover-header-label"],
      canContainText: true,
      canBeDeleted: true,
      canBeDuplicated: true,
      canBeReordered: true,
      canReplacePlainText: true,
      canUseWysiwygDraft: true,
      hasAtomicInline: false,
      hasStyledText: false,
      plainText: "Confidential Product Report",
      wysiwygDraftGuardReason: null,
    })
    expect(coverTitle).toMatchObject({
      id: "cover-title",
      type: "text-block",
      canReplacePlainText: false,
      canUseWysiwygDraft: false,
      hasAtomicInline: true,
      hasStyledText: false,
      plainText: null,
      wysiwygDraftGuardReason: "text-block contains atomic inline content",
    })
    expect(new Set(snapshot.actionLanes.map((action) => action.status))).toEqual(
      new Set(["wired", "planned", "blocked"]),
    )
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.trackDraftSelection")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.deriveDraftCommandContext")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.applyDraftTextCommand")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.setDraftSelectionRange")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.trackDraftComposition")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.createStructuralRuntimeStore")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.applyTextPacketToRuntimeStore")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.applyStructuralPacketToRuntimeStore")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.createStoreBackedRenderModel")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.resolveRenderWindow")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.createRenderShell")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.measureViewportShell")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.applyViewportMeasurement")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.controlViewportScroll")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.trackViewportAnchor")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.restoreViewportNodeAnchor")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.trackSectionSpacers")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.predictViewportSections")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.planViewportCandidate")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.applyViewportSchedulerCandidate")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.runViewportSchedulerRuntime")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.autoApplyViewportScheduler")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.virtualizeViewportSections")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.lazyViewportHeavyDetail")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.resolveViewportRangeRequest")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.createNormalizedEditorView")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.resolveVisibleRange")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.updateVisibleRangeRequest")
    expect(snapshot.authoringHistory).toMatchObject({
      mode: "static-snapshot",
      recordCount: 0,
      groupCount: 0,
      latestGroup: null,
    })
    expect(snapshot.liveLayout).toEqual({
      mode: "static-snapshot",
      requestCount: 0,
      exactGenerationStale: false,
      lastResult: null,
    })
  })

  it("keeps selected node state browser-only", () => {
    const snapshotText = readText("../examples/template-builder-sandbox/public/sandbox-snapshot.json")
    const appSource = readText("../examples/template-builder-sandbox/public/app.js")

    expect(snapshotText).not.toContain("selectedId")
    expect(snapshotText).not.toContain("selectionSource")
    expect(snapshotText).not.toContain("selectionStart")
    expect(snapshotText).not.toContain("selectionEnd")
    expect(snapshotText).not.toContain("selectedTextPreview")
    expect(snapshotText).not.toContain("beforeTextPreview")
    expect(snapshotText).not.toContain("afterTextPreview")
    expect(snapshotText).not.toContain("draftCommandText")
    expect(snapshotText).not.toContain("isComposing")
    expect(snapshotText).not.toContain("compositionData")
    expect(snapshotText).not.toContain("compositionEventCount")
    expect(appSource).toContain("selectedId")
    expect(appSource).toContain("selectionSource")
    expect(appSource).toContain("selectionStart")
    expect(appSource).toContain("selectionEnd")
    expect(appSource).toContain("selectedTextPreview")
    expect(appSource).toContain('closest("[data-node-id]")')
  })

  it("declares one mutation bridge route without direct browser document mutation", () => {
    const serverSource = readText("../examples/template-builder-sandbox/scripts/serve.mjs")
    const bridgeSource = readText("../examples/template-builder-sandbox/src/mutationBridge.ts")
    const appSource = readText("../examples/template-builder-sandbox/public/app.js")
    const snapshot = readJson("../examples/template-builder-sandbox/public/sandbox-snapshot.json") as {
      mutationBridge: { mode: string; documentRevision: number; mutationCount: number; lastMutation: unknown }
      authoringHistory: { mode: string; recordCount: number; groupCount: number; latestGroup: unknown }
      liveLayout: { mode: string; requestCount: number; exactGenerationStale: boolean; lastResult: unknown }
    }

    expect(serverSource).toContain("/api/snapshot")
    expect(serverSource).toContain("/api/actions/replace-text")
    expect(serverSource).toContain("/api/actions/insert-text-at-end")
    expect(serverSource).toContain("/api/actions/undo")
    expect(serverSource).toContain("/api/actions/redo")
    expect(serverSource).toContain('searchParams.get("response") !== "packet"')
    expect(bridgeSource).toContain('from "@flowdoc/vnext-core"')
    expect(bridgeSource).toContain("runVNextTextTransaction")
    expect(bridgeSource).toContain("appendVNextAuthoringIntentHistoryResult")
    expect(bridgeSource).toContain("groupVNextAuthoringIntentHistory")
    expect(bridgeSource).toContain("resolveVNextLiveLayoutBoundary")
    expect(bridgeSource).toContain("createTemplateBuilderLiveLayoutSnapshot")
    expect(bridgeSource).toContain("TemplateBuilderTextUndoPatch")
    expect(bridgeSource).toContain("text.range.replace")
    expect(bridgeSource).toContain("text.insert")
    expect(bridgeSource).toContain("sandbox.insertPlainTextAtEnd")
    expect(bridgeSource).toContain("sandbox.undo")
    expect(bridgeSource).toContain("sandbox.redo")
    expect(bridgeSource).toContain("flowdoc-template-builder-change-packet")
    expect(bridgeSource).toContain("authoringHistory")
    expect(bridgeSource).toContain("liveLayout")
    expect(appSource).toContain("./api/actions/replace-text?response=packet")
    expect(appSource).toContain("./api/actions/insert-text-at-end?response=packet")
    expect(appSource).toContain("./api/actions/undo?response=packet")
    expect(appSource).toContain("./api/actions/redo?response=packet")
    expect(appSource).toContain("Append text")
    expect(appSource).toContain("History")
    expect(appSource).toContain("Live Layout")
    expect(appSource).toContain("Live layout:")
    expect(appSource).toContain("data-history-action")
    expect(appSource).toContain("data-draft-editor")
    expect(appSource).toContain("startDraftForNode")
    expect(appSource).toContain("commitDraft")
    expect(appSource).toContain("lastPacket")
    expect(appSource).not.toContain("snapshot.document")
    expect(bridgeSource).not.toContain("browser.editTextDraft")
    expect(snapshot.mutationBridge).toEqual({
      mode: "static-snapshot",
      documentRevision: 0,
      mutationCount: 0,
      lastMutation: null,
    })
    expect(snapshot.authoringHistory).toEqual({
      mode: "static-snapshot",
      recordCount: 0,
      undoableRecordCount: 0,
      rejectedRecordCount: 0,
      groupCount: 0,
      canUndo: false,
      canRedo: false,
      undoDepth: 0,
      redoDepth: 0,
      nextUndoGroupId: null,
      nextRedoGroupId: null,
      latestGroup: null,
    })
    expect(snapshot.liveLayout).toEqual({
      mode: "static-snapshot",
      requestCount: 0,
      exactGenerationStale: false,
      lastResult: null,
    })
  })

  it("applies and rejects mutations through the sandbox bridge", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import { readFileSync } from "node:fs";
      import { register } from "node:module";
      import { pathToFileURL } from "node:url";

      register("./ts-loader.mjs", pathToFileURL(process.cwd() + "/scripts/"));
      const { createTemplateBuilderMutationBridge } = await import("./src/mutationBridge.ts");
      const fixture = JSON.parse(readFileSync("../../fixtures/product-report-vnext.flowdoc.json", "utf8"));
      const bridge = createTemplateBuilderMutationBridge(fixture, {
        fixturePath: "fixtures/product-report-vnext.flowdoc.json",
      });
      const accepted = bridge.replaceText({
        textBlockId: "cover-header-label",
        text: "Edited through bridge test",
      });
      const rejected = bridge.replaceText({
        textBlockId: "cover-title",
        text: "Should not replace field refs",
      });

      console.log(JSON.stringify({
        acceptedOk: accepted.ok,
        acceptedBridge: accepted.snapshot.mutationBridge,
        acceptedHistory: accepted.snapshot.authoringHistory,
        acceptedContainsText: JSON.stringify(accepted.snapshot.sections).includes("Edited through bridge test"),
        rejectedOk: rejected.ok,
        rejectedIssues: rejected.issues,
        rejectedBridge: rejected.snapshot.mutationBridge,
        rejectedHistory: rejected.snapshot.authoringHistory,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      acceptedOk: boolean
      acceptedBridge: {
        mode: string
        documentRevision: number
        mutationCount: number
        lastMutation: { status: string; targetTextBlockId: string }
      }
      acceptedHistory: {
        mode: string
        recordCount: number
        undoableRecordCount: number
        rejectedRecordCount: number
        groupCount: number
        canUndo: boolean
        canRedo: boolean
        undoDepth: number
        redoDepth: number
        latestGroup: { commandKinds: string[]; recordCount: number; summary: string }
      }
      acceptedContainsText: boolean
      rejectedOk: boolean
      rejectedIssues: Array<{ code: string }>
      rejectedBridge: {
        documentRevision: number
        mutationCount: number
        lastMutation: { status: string; targetTextBlockId: string }
      }
      rejectedHistory: { recordCount: number; groupCount: number }
    }

    expect(result.acceptedOk).toBe(true)
    expect(result.acceptedBridge).toMatchObject({
      mode: "in-memory-bridge",
      documentRevision: 1,
      mutationCount: 1,
      lastMutation: {
        status: "applied",
        targetTextBlockId: "cover-header-label",
      },
    })
    expect(result.acceptedHistory).toMatchObject({
      mode: "in-memory",
      recordCount: 1,
      undoableRecordCount: 1,
      rejectedRecordCount: 0,
      groupCount: 1,
      canUndo: true,
      canRedo: false,
      undoDepth: 1,
      redoDepth: 0,
      latestGroup: {
        commandKinds: ["text.range.replace"],
        recordCount: 1,
        summary: "replace text range in cover-header-label",
      },
    })
    expect(result.acceptedContainsText).toBe(true)
    expect(result.rejectedOk).toBe(false)
    expect(result.rejectedIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "non-plain-text-block" }),
    ]))
    expect(result.rejectedBridge).toMatchObject({
      documentRevision: 1,
      mutationCount: 1,
      lastMutation: {
        status: "rejected",
        targetTextBlockId: "cover-title",
      },
    })
    expect(result.rejectedHistory).toMatchObject({
      recordCount: 1,
      groupCount: 1,
    })
  }, 15_000)

  it("returns bounded packet-only mutation responses", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import { readFileSync } from "node:fs";
      import { register } from "node:module";
      import { pathToFileURL } from "node:url";

      register("./ts-loader.mjs", pathToFileURL(process.cwd() + "/scripts/"));
      const { createTemplateBuilderMutationBridge } = await import("./src/mutationBridge.ts");
      const fixture = JSON.parse(readFileSync("../../fixtures/product-report-vnext.flowdoc.json", "utf8"));
      const bridge = createTemplateBuilderMutationBridge(fixture, {
        fixturePath: "fixtures/product-report-vnext.flowdoc.json",
      });
      const accepted = bridge.replaceText({
        textBlockId: "cover-header-label",
        text: "Packet delta text",
      }, { includeSnapshot: false });
      const rejected = bridge.replaceText({
        textBlockId: "cover-title",
        text: "Should not replace field refs",
      }, { includeSnapshot: false });

      console.log(JSON.stringify({
        acceptedOk: accepted.ok,
        acceptedHasSnapshot: Object.prototype.hasOwnProperty.call(accepted, "snapshot"),
        acceptedPacket: accepted.packet,
        acceptedPacketHasSections: JSON.stringify(accepted.packet).includes('"sections"'),
        rejectedOk: rejected.ok,
        rejectedHasSnapshot: Object.prototype.hasOwnProperty.call(rejected, "snapshot"),
        rejectedPacket: rejected.packet,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      acceptedOk: boolean
      acceptedHasSnapshot: boolean
      acceptedPacket: {
        source: string
        baseRevision: number
        nextRevision: number
        mutationCount: number
        changedNodeIds: string[]
        changedNodes: Array<{ id: string; textPreview: string }>
        affectedParentNodeIds: string[]
        dirtyScopes: Array<{ textBlockId: string; parentNodeIds: string[] }>
        authoringHistory: {
          recordCount: number
          undoableRecordCount: number
          groupCount: number
          canUndo: boolean
          canRedo: boolean
          undoDepth: number
          redoDepth: number
          latestGroup: { commandKinds: string[]; summary: string }
        }
      }
      acceptedPacketHasSections: boolean
      rejectedOk: boolean
      rejectedHasSnapshot: boolean
      rejectedPacket: {
        baseRevision: number
        nextRevision: number
        mutationCount: number
        changedNodeIds: string[]
        authoringHistory: { recordCount: number; groupCount: number }
        issues: Array<{ code: string }>
      }
    }

    expect(result.acceptedOk).toBe(true)
    expect(result.acceptedHasSnapshot).toBe(false)
    expect(result.acceptedPacket).toMatchObject({
      source: "flowdoc-template-builder-change-packet",
      baseRevision: 0,
      nextRevision: 1,
      mutationCount: 1,
      changedNodeIds: ["cover-header-label"],
      changedNodes: [
        expect.objectContaining({
          id: "cover-header-label",
          textPreview: "Packet delta text",
        }),
      ],
      affectedParentNodeIds: ["cover-first-header"],
      dirtyScopes: [
        expect.objectContaining({
          textBlockId: "cover-header-label",
          parentNodeIds: ["cover-first-header"],
        }),
      ],
    })
    expect(result.acceptedPacketHasSections).toBe(false)
    expect(result.acceptedPacket.authoringHistory).toMatchObject({
      recordCount: 1,
      undoableRecordCount: 1,
      groupCount: 1,
      canUndo: true,
      canRedo: false,
      undoDepth: 1,
      redoDepth: 0,
      latestGroup: {
        commandKinds: ["text.range.replace"],
        summary: "replace text range in cover-header-label",
      },
    })
    expect(result.rejectedOk).toBe(false)
    expect(result.rejectedHasSnapshot).toBe(false)
    expect(result.rejectedPacket).toMatchObject({
      baseRevision: 1,
      nextRevision: 1,
      mutationCount: 1,
      changedNodeIds: [],
      authoringHistory: {
        recordCount: 1,
        groupCount: 1,
      },
    })
    expect(result.rejectedPacket.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "non-plain-text-block" }),
    ]))
  }, 15_000)

  it("reports live layout request summaries without running exact layout", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import { readFileSync } from "node:fs";
      import { register } from "node:module";
      import { pathToFileURL } from "node:url";

      register("./ts-loader.mjs", pathToFileURL(process.cwd() + "/scripts/"));
      const { createTemplateBuilderMutationBridge } = await import("./src/mutationBridge.ts");
      const fixture = JSON.parse(readFileSync("../../fixtures/product-report-vnext.flowdoc.json", "utf8"));
      const bridge = createTemplateBuilderMutationBridge(fixture, {
        fixturePath: "fixtures/product-report-vnext.flowdoc.json",
      });
      const initial = bridge.snapshot();
      const accepted = bridge.replaceText({
        textBlockId: "cover-header-label",
        text: "Live layout text",
      }, { includeSnapshot: false });
      const rejected = bridge.replaceText({
        textBlockId: "cover-title",
        text: "Should not replace field refs",
      }, { includeSnapshot: false });
      const afterRejected = bridge.snapshot();

      console.log(JSON.stringify({
        initialLiveLayout: initial.liveLayout,
        acceptedOk: accepted.ok,
        acceptedPacket: accepted.packet,
        acceptedPacketHasSections: JSON.stringify(accepted.packet).includes('"sections"'),
        rejectedOk: rejected.ok,
        rejectedPacket: rejected.packet,
        afterRejectedLiveLayout: afterRejected.liveLayout,
        exactLayoutStatus: afterRejected.diagnostics.exactLayoutStatus,
        artifactStatus: afterRejected.diagnostics.artifactStatus,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      initialLiveLayout: {
        mode: string
        requestCount: number
        exactGenerationStale: boolean
        lastResult: null
      }
      acceptedOk: boolean
      acceptedPacket: {
        liveLayout: {
          mode: string
          requestCount: number
          exactGenerationStale: boolean
          lastResult: {
            kind: string
            reason: string
            requestId: string
            visibleRangeKind: string
            dirtyScopeCount: number
            affected: { textBlockIds: string[]; parentNodeIds: string[]; sectionIds: string[] }
            freshness: {
              liveLayout: string
              exactGeneration: { status: string; finalTruth: string }
            }
          }
        }
      }
      acceptedPacketHasSections: boolean
      rejectedOk: boolean
      rejectedPacket: {
        liveLayout: {
          requestCount: number
          exactGenerationStale: boolean
          lastResult: { reason: string; affected: { textBlockIds: string[] } }
        }
      }
      afterRejectedLiveLayout: {
        requestCount: number
        exactGenerationStale: boolean
        lastResult: { reason: string; affected: { textBlockIds: string[] } }
      }
      exactLayoutStatus: string
      artifactStatus: string
    }

    expect(result.initialLiveLayout).toEqual({
      mode: "in-memory-bridge",
      requestCount: 0,
      exactGenerationStale: false,
      lastResult: null,
    })
    expect(result.acceptedOk).toBe(true)
    expect(result.acceptedPacketHasSections).toBe(false)
    expect(result.acceptedPacket.liveLayout).toMatchObject({
      mode: "in-memory-bridge",
      requestCount: 1,
      exactGenerationStale: true,
      lastResult: {
        kind: "layout-request",
        reason: "text-content",
        requestId: "live-layout:text-content:text:cover-header-label,node:cover-header-label,section:section-cover",
        visibleRangeKind: "unbounded",
        dirtyScopeCount: 1,
        affected: {
          sectionIds: ["section-cover"],
          parentNodeIds: ["cover-first-header"],
          textBlockIds: ["cover-header-label"],
        },
        freshness: {
          liveLayout: "stale",
          exactGeneration: {
            status: "stale",
            finalTruth: "measured-pagination",
          },
        },
      },
    })
    expect(result.rejectedOk).toBe(false)
    expect(result.rejectedPacket.liveLayout).toMatchObject({
      requestCount: 1,
      exactGenerationStale: true,
      lastResult: {
        reason: "text-content",
        affected: { textBlockIds: ["cover-header-label"] },
      },
    })
    expect(result.afterRejectedLiveLayout).toMatchObject({
      requestCount: 1,
      exactGenerationStale: true,
      lastResult: {
        reason: "text-content",
        affected: { textBlockIds: ["cover-header-label"] },
      },
    })
    expect(result.exactLayoutStatus).toBe("not-run")
    expect(result.artifactStatus).toBe("not-rendered")
  }, 15_000)

  it("inserts text at the selected text block end through the sandbox bridge", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import { readFileSync } from "node:fs";
      import { register } from "node:module";
      import { pathToFileURL } from "node:url";

      register("./ts-loader.mjs", pathToFileURL(process.cwd() + "/scripts/"));
      const { createTemplateBuilderMutationBridge } = await import("./src/mutationBridge.ts");
      const fixture = JSON.parse(readFileSync("../../fixtures/product-report-vnext.flowdoc.json", "utf8"));
      const bridge = createTemplateBuilderMutationBridge(fixture, {
        fixturePath: "fixtures/product-report-vnext.flowdoc.json",
      });
      const accepted = bridge.insertTextAtEnd({
        textBlockId: "cover-header-label",
        text: " appended",
      }, { includeSnapshot: false });
      const rejected = bridge.insertTextAtEnd({
        textBlockId: "cover-title",
        text: " should reject",
      }, { includeSnapshot: false });

      console.log(JSON.stringify({
        acceptedOk: accepted.ok,
        acceptedHasSnapshot: Object.prototype.hasOwnProperty.call(accepted, "snapshot"),
        acceptedAction: accepted.packet.action,
        acceptedPacket: accepted.packet,
        acceptedPacketHasSections: JSON.stringify(accepted.packet).includes('"sections"'),
        rejectedOk: rejected.ok,
        rejectedPacket: rejected.packet,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      acceptedOk: boolean
      acceptedHasSnapshot: boolean
      acceptedAction: string
      acceptedPacket: {
        baseRevision: number
        nextRevision: number
        changedNodeIds: string[]
        changedNodes: Array<{ id: string; textPreview: string }>
        dirtyScopes: Array<{ textBlockId: string }>
        authoringHistory: {
          recordCount: number
          undoableRecordCount: number
          groupCount: number
          canUndo: boolean
          canRedo: boolean
          undoDepth: number
          redoDepth: number
          latestGroup: { commandKinds: string[]; summary: string }
        }
      }
      acceptedPacketHasSections: boolean
      rejectedOk: boolean
      rejectedPacket: {
        baseRevision: number
        nextRevision: number
        changedNodeIds: string[]
        authoringHistory: { recordCount: number; groupCount: number }
        issues: Array<{ code: string }>
      }
    }

    expect(result.acceptedOk).toBe(true)
    expect(result.acceptedHasSnapshot).toBe(false)
    expect(result.acceptedAction).toBe("sandbox.insertPlainTextAtEnd")
    expect(result.acceptedPacket).toMatchObject({
      baseRevision: 0,
      nextRevision: 1,
      changedNodeIds: ["cover-header-label"],
      changedNodes: [
        expect.objectContaining({
          id: "cover-header-label",
          textPreview: expect.stringContaining("appended"),
        }),
      ],
      dirtyScopes: [
        expect.objectContaining({ textBlockId: "cover-header-label" }),
      ],
    })
    expect(result.acceptedPacketHasSections).toBe(false)
    expect(result.acceptedPacket.authoringHistory).toMatchObject({
      recordCount: 1,
      undoableRecordCount: 1,
      groupCount: 1,
      canUndo: true,
      canRedo: false,
      undoDepth: 1,
      redoDepth: 0,
      latestGroup: {
        commandKinds: ["text.insert"],
        summary: "insert text into cover-header-label",
      },
    })
    expect(result.rejectedOk).toBe(false)
    expect(result.rejectedPacket).toMatchObject({
      baseRevision: 1,
      nextRevision: 1,
      changedNodeIds: [],
      authoringHistory: {
        recordCount: 1,
        groupCount: 1,
      },
    })
    expect(result.rejectedPacket.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "non-plain-text-block" }),
    ]))
  }, 15_000)

  it("undoes and redoes sandbox text patches through packet responses", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import { readFileSync } from "node:fs";
      import { register } from "node:module";
      import { pathToFileURL } from "node:url";

      register("./ts-loader.mjs", pathToFileURL(process.cwd() + "/scripts/"));
      const { createTemplateBuilderMutationBridge } = await import("./src/mutationBridge.ts");
      const fixture = JSON.parse(readFileSync("../../fixtures/product-report-vnext.flowdoc.json", "utf8"));
      const bridge = createTemplateBuilderMutationBridge(fixture, {
        fixturePath: "fixtures/product-report-vnext.flowdoc.json",
      });
      const replaced = bridge.replaceText({
        textBlockId: "cover-header-label",
        text: "Undo redo text",
      }, { includeSnapshot: false });
      const undone = bridge.undo({ includeSnapshot: false });
      const redone = bridge.redo({ includeSnapshot: false });
      const rejectedRedo = bridge.redo({ includeSnapshot: false });

      console.log(JSON.stringify({
        replacedOk: replaced.ok,
        replacedPacket: replaced.packet,
        replacedPacketHasSections: JSON.stringify(replaced.packet).includes('"sections"'),
        undoneOk: undone.ok,
        undonePacket: undone.packet,
        undonePacketHasSections: JSON.stringify(undone.packet).includes('"sections"'),
        redoneOk: redone.ok,
        redonePacket: redone.packet,
        redonePacketHasSections: JSON.stringify(redone.packet).includes('"sections"'),
        rejectedRedoOk: rejectedRedo.ok,
        rejectedRedoPacket: rejectedRedo.packet,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      replacedOk: boolean
      replacedPacket: {
        nextRevision: number
        changedNodes: Array<{ textPreview: string }>
        authoringHistory: {
          canUndo: boolean
          canRedo: boolean
          undoDepth: number
          redoDepth: number
          nextUndoGroupId: string
          nextRedoGroupId: string | null
        }
      }
      replacedPacketHasSections: boolean
      undoneOk: boolean
      undonePacket: {
        action: string
        baseRevision: number
        nextRevision: number
        mutationCount: number
        changedNodeIds: string[]
        changedNodes: Array<{ id: string; textPreview: string }>
        authoringHistory: {
          recordCount: number
          canUndo: boolean
          canRedo: boolean
          undoDepth: number
          redoDepth: number
          nextUndoGroupId: string | null
          nextRedoGroupId: string
        }
      }
      undonePacketHasSections: boolean
      redoneOk: boolean
      redonePacket: {
        action: string
        baseRevision: number
        nextRevision: number
        mutationCount: number
        changedNodeIds: string[]
        changedNodes: Array<{ id: string; textPreview: string }>
        authoringHistory: {
          recordCount: number
          canUndo: boolean
          canRedo: boolean
          undoDepth: number
          redoDepth: number
          nextUndoGroupId: string
          nextRedoGroupId: string | null
        }
      }
      redonePacketHasSections: boolean
      rejectedRedoOk: boolean
      rejectedRedoPacket: {
        baseRevision: number
        nextRevision: number
        changedNodeIds: string[]
        authoringHistory: { canUndo: boolean; canRedo: boolean; undoDepth: number; redoDepth: number }
        issues: Array<{ code: string }>
      }
    }

    expect(result.replacedOk).toBe(true)
    expect(result.replacedPacket.nextRevision).toBe(1)
    expect(result.replacedPacket.changedNodes[0].textPreview).toBe("Undo redo text")
    expect(result.replacedPacketHasSections).toBe(false)
    expect(result.replacedPacket.authoringHistory).toMatchObject({
      canUndo: true,
      canRedo: false,
      undoDepth: 1,
      redoDepth: 0,
      nextUndoGroupId: "authoring-group-1",
      nextRedoGroupId: null,
    })

    expect(result.undoneOk).toBe(true)
    expect(result.undonePacket).toMatchObject({
      action: "sandbox.undo",
      baseRevision: 1,
      nextRevision: 2,
      mutationCount: 2,
      changedNodeIds: ["cover-header-label"],
      changedNodes: [
        expect.objectContaining({
          id: "cover-header-label",
          textPreview: "Confidential Product Report",
        }),
      ],
      authoringHistory: {
        recordCount: 1,
        canUndo: false,
        canRedo: true,
        undoDepth: 0,
        redoDepth: 1,
        nextUndoGroupId: null,
        nextRedoGroupId: "authoring-group-1",
      },
    })
    expect(result.undonePacketHasSections).toBe(false)

    expect(result.redoneOk).toBe(true)
    expect(result.redonePacket).toMatchObject({
      action: "sandbox.redo",
      baseRevision: 2,
      nextRevision: 3,
      mutationCount: 3,
      changedNodeIds: ["cover-header-label"],
      changedNodes: [
        expect.objectContaining({
          id: "cover-header-label",
          textPreview: "Undo redo text",
        }),
      ],
      authoringHistory: {
        recordCount: 1,
        canUndo: true,
        canRedo: false,
        undoDepth: 1,
        redoDepth: 0,
        nextUndoGroupId: "authoring-group-1",
        nextRedoGroupId: null,
      },
    })
    expect(result.redonePacketHasSections).toBe(false)

    expect(result.rejectedRedoOk).toBe(false)
    expect(result.rejectedRedoPacket).toMatchObject({
      baseRevision: 3,
      nextRevision: 3,
      changedNodeIds: [],
      authoringHistory: {
        canUndo: true,
        canRedo: false,
        undoDepth: 1,
        redoDepth: 0,
      },
    })
    expect(result.rejectedRedoPacket.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "nothing-to-redo" }),
    ]))
  }, 15_000)

  it("applies mutation packets through a browser runtime cache", () => {
    const appSource = readText("../examples/template-builder-sandbox/public/app.js")
    const stylesSource = readText("../examples/template-builder-sandbox/public/styles.css")
    const renderWindowSource = readText("../examples/template-builder-sandbox/public/renderWindow.js")
    const renderShellSource = readText("../examples/template-builder-sandbox/public/renderShell.js")
    const renderModelSource = readText("../examples/template-builder-sandbox/public/renderModel.js")
    const viewportAnchorSource = readText("../examples/template-builder-sandbox/public/viewportAnchor.js")
    const viewportNodeAnchorSource = readText("../examples/template-builder-sandbox/public/viewportNodeAnchor.js")
    const viewportMeasurementSource = readText("../examples/template-builder-sandbox/public/viewportMeasurement.js")
    const viewportScrollControllerSource = readText("../examples/template-builder-sandbox/public/viewportScrollController.js")
    const viewportSchedulerCandidateSource = readText("../examples/template-builder-sandbox/public/viewportSchedulerCandidate.js")
    const viewportSchedulerApplySource = readText("../examples/template-builder-sandbox/public/viewportSchedulerApply.js")
    const viewportSchedulerRuntimeSource = readText("../examples/template-builder-sandbox/public/viewportSchedulerRuntime.js")
    const viewportSchedulerAutomationSource = readText("../examples/template-builder-sandbox/public/viewportSchedulerAutomation.js")
    const viewportVirtualStackSource = readText("../examples/template-builder-sandbox/public/viewportVirtualStack.js")
    const viewportLazyDetailSource = readText("../examples/template-builder-sandbox/public/viewportLazyDetail.js")
    const viewportSectionOffsetsSource = readText("../examples/template-builder-sandbox/public/viewportSectionOffsets.js")
    const viewportSectionSpacersSource = readText("../examples/template-builder-sandbox/public/viewportSectionSpacers.js")
    const viewportControllerSource = readText("../examples/template-builder-sandbox/public/viewportController.js")
    const runtimeStoreSource = readText("../examples/template-builder-sandbox/public/runtimeStore.js")
    const runtimeStoreStructuralPacketSource = readText("../examples/template-builder-sandbox/public/runtimeStoreStructuralPacket.js")
    const editorViewSource = readText("../examples/template-builder-sandbox/public/editorView.js")
    const visibleRangeRequestSource = readText("../examples/template-builder-sandbox/public/visibleRangeRequest.js")
    const visibleRangeSource = readText("../examples/template-builder-sandbox/public/visibleRange.js")
    const runtimeCacheSource = readText("../examples/template-builder-sandbox/public/runtimeCache.js")
    const coreBoundarySource = readText("../examples/template-builder-sandbox/src/coreBoundary.ts")
    const browserCacheDoc = readText("../docs/TEMPLATE_BUILDER_BROWSER_CACHE_BOUNDARY.md")
    const runtimeCacheDoc = readText("../docs/TEMPLATE_BUILDER_RUNTIME_CACHE_MODULE_BOUNDARY.md")
    const visibleRangeDoc = readText("../docs/TEMPLATE_BUILDER_VISIBLE_RANGE_BOUNDARY.md")
    const visibleRangeRequestDoc = readText("../docs/TEMPLATE_BUILDER_VISIBLE_RANGE_REQUEST_BOUNDARY.md")
    const runtimeStoreDoc = readText("../docs/TEMPLATE_BUILDER_RUNTIME_STORE_BOUNDARY.md")
    const textPacketStoreDoc = readText("../docs/TEMPLATE_BUILDER_TEXT_PACKET_STORE_BOUNDARY.md")
    const storeBackedRenderDoc = readText("../docs/TEMPLATE_BUILDER_STORE_BACKED_RENDER_BOUNDARY.md")
    const renderWindowDoc = readText("../docs/TEMPLATE_BUILDER_RENDER_WINDOW_BOUNDARY.md")
    const viewportRequestDoc = readText("../docs/TEMPLATE_BUILDER_VIEWPORT_REQUEST_BOUNDARY.md")
    const renderShellDoc = readText("../docs/TEMPLATE_BUILDER_RENDER_SHELL_BOUNDARY.md")
    const viewportMeasurementDoc = readText("../docs/TEMPLATE_BUILDER_VIEWPORT_MEASUREMENT_BOUNDARY.md")
    const viewportApplyDoc = readText("../docs/TEMPLATE_BUILDER_VIEWPORT_APPLY_BOUNDARY.md")
    const viewportScrollControllerDoc = readText("../docs/TEMPLATE_BUILDER_VIEWPORT_SCROLL_CONTROLLER_BOUNDARY.md")
    const viewportAnchorDoc = readText("../docs/TEMPLATE_BUILDER_VIEWPORT_ANCHOR_BOUNDARY.md")
    const viewportNodeAnchorDoc = readText("../docs/TEMPLATE_BUILDER_VIEWPORT_NODE_ANCHOR_BOUNDARY.md")
    const sectionSpacerDoc = readText("../docs/TEMPLATE_BUILDER_SECTION_SPACER_BOUNDARY.md")
    const sectionOffsetDoc = readText("../docs/TEMPLATE_BUILDER_SECTION_OFFSET_BOUNDARY.md")
    const viewportSchedulerCandidateDoc = readText("../docs/TEMPLATE_BUILDER_VIEWPORT_SCHEDULER_CANDIDATE_BOUNDARY.md")
    const viewportSchedulerApplyDoc = readText("../docs/TEMPLATE_BUILDER_VIEWPORT_SCHEDULER_APPLY_BOUNDARY.md")
    const viewportSchedulerRuntimeDoc = readText("../docs/TEMPLATE_BUILDER_VIEWPORT_SCHEDULER_RUNTIME_BOUNDARY.md")
    const viewportSchedulerAutomationDoc = readText("../docs/TEMPLATE_BUILDER_VIEWPORT_SCHEDULER_AUTOMATION_BOUNDARY.md")
    const viewportVirtualStackDoc = readText("../docs/TEMPLATE_BUILDER_VIEWPORT_VIRTUAL_STACK_BOUNDARY.md")
    const viewportLazyDetailDoc = readText("../docs/TEMPLATE_BUILDER_VIEWPORT_LAZY_DETAIL_BOUNDARY.md")
    const viewportLargeDocumentAuditDoc = readText("../docs/TEMPLATE_BUILDER_VIEWPORT_LARGE_DOCUMENT_AUDIT.md")
    const structuralPacketStoreDoc = readText("../docs/TEMPLATE_BUILDER_STRUCTURAL_PACKET_STORE_BOUNDARY.md")

    expect(appSource).toContain('from "./renderModel.js"')
    expect(appSource).toContain('from "./runtimeCache.js"')
    expect(appSource).toContain("runtimeCache")
    expect(appSource).toContain("createStoreBackedRenderModel")
    expect(appSource).toContain("getStoreBackedRenderChildren")
    expect(appSource).toContain("getStoreBackedRenderSectionRootNodes")
    expect(appSource).toContain("getStoreBackedRenderWindowChildren")
    expect(appSource).toContain("getStoreBackedRenderWindowSectionRootNodes")
    expect(appSource).toContain("isStoreBackedRenderShellSectionRendered")
    expect(appSource).toContain("renderWindowNodeChildren")
    expect(appSource).toContain("renderCanvasPlaceholder")
    expect(appSource).toContain('from "./viewportAnchor.js"')
    expect(appSource).toContain("createViewportSectionAnchor")
    expect(appSource).toContain("resolveViewportSectionAnchorScrollTop")
    expect(appSource).toContain('from "./viewportNodeAnchor.js"')
    expect(appSource).toContain("createViewportNodeAnchor")
    expect(appSource).toContain("resolveViewportNodeAnchorScrollTop")
    expect(appSource).toContain('from "./viewportSectionSpacers.js"')
    expect(appSource).toContain("createViewportSectionSpacerMap")
    expect(appSource).toContain("resolveViewportSectionSpacer")
    expect(appSource).toContain('from "./viewportSectionOffsets.js"')
    expect(appSource).toContain("createViewportSectionOffsetIndex")
    expect(appSource).toContain("predictViewportFromSectionOffsets")
    expect(appSource).toContain("resolveViewportSectionOffset")
    expect(appSource).toContain('from "./viewportVirtualStack.js"')
    expect(appSource).toContain("createViewportVirtualStack")
    expect(appSource).toContain('from "./viewportLazyDetail.js"')
    expect(appSource).toContain("createViewportLazyDetailPlan")
    expect(appSource).toContain('from "./viewportSchedulerAutomation.js"')
    expect(appSource).toContain("createViewportSchedulerAutomationState")
    expect(appSource).toContain("runViewportSchedulerAutomation")
    expect(appSource).toContain('from "./viewportSchedulerRuntime.js"')
    expect(appSource).toContain("planViewportSchedulerRuntimeCandidate")
    expect(appSource).toContain("createViewportSchedulerRuntimeState")
    expect(appSource).toContain('from "./viewportMeasurement.js"')
    expect(appSource).toContain("createViewportMeasurement")
    expect(appSource).toContain("createViewportMeasurementApplyRequest")
    expect(appSource).toContain('from "./viewportScrollController.js"')
    expect(appSource).toContain("createViewportScrollControllerState")
    expect(appSource).toContain("recordViewportScroll")
    expect(appSource).toContain("settleViewportScroll")
    expect(appSource).toContain("readCanvasViewportMeasurement")
    expect(appSource).toContain("applyViewportMeasurement")
    expect(appSource).toContain("scheduleViewportScrollApply")
    expect(appSource).toContain("applySettledViewportScroll")
    expect(appSource).toContain("viewportScrollRestoring")
    expect(appSource).toContain("setViewportAnchorFromMeasurement")
    expect(appSource).toContain("readCanvasViewportNodeAnchor")
    expect(appSource).toContain("createFallbackViewportNodeAnchor")
    expect(appSource).toContain("restoreViewportAnchor")
    expect(appSource).toContain("updateViewportSchedulerCandidate")
    expect(appSource).toContain("updateViewportSectionOffsets")
    expect(appSource).toContain("updateViewportSectionSpacers")
    expect(appSource).toContain("lastViewportApply")
    expect(appSource).toContain("data-section-id")
    expect(appSource).toContain("data-section-offset-bottom")
    expect(appSource).toContain("data-section-offset-top")
    expect(appSource).toContain("data-section-offset-status")
    expect(appSource).toContain("data-viewport-scheduler-candidate-status")
    expect(appSource).toContain("data-viewport-scheduler-apply")
    expect(appSource).toContain("data-viewport-scheduler-apply-status")
    expect(appSource).toContain("data-viewport-scheduler-runtime-status")
    expect(appSource).toContain("data-viewport-scheduler-automation-status")
    expect(appSource).toContain("data-viewport-virtual-stack-status")
    expect(appSource).toContain("data-viewport-lazy-detail-status")
    expect(appSource).toContain("data-viewport-node-anchor-status")
    expect(appSource).toContain("data-virtual-section-spacer")
    expect(appSource).toContain("data-viewport-virtualized")
    expect(appSource).toContain("data-lazy-detail-reason")
    expect(appSource).toContain("data-section-spacer-height")
    expect(appSource).toContain("data-section-spacer-reason")
    expect(appSource).toContain("data-section-spacer-status")
    expect(appSource).toContain("data-viewport-apply")
    expect(appSource).toContain("data-viewport-measurement-status")
    expect(appSource).toContain("data-viewport-anchor-status")
    expect(appSource).toContain("data-viewport-scroll-status")
    expect(appSource).toContain("Measurement:")
    expect(appSource).toContain("Viewport candidate:")
    expect(appSource).toContain("Scheduler apply:")
    expect(appSource).toContain("Scheduler runtime:")
    expect(appSource).toContain("Scheduler auto:")
    expect(appSource).toContain("Virtual stack:")
    expect(appSource).toContain("Lazy detail:")
    expect(appSource).toContain("Node anchor:")
    expect(appSource).toContain("Section offsets:")
    expect(appSource).toContain("Section spacers:")
    expect(appSource).toContain("Viewport anchor:")
    expect(appSource).toContain("Viewport apply:")
    expect(appSource).toContain("Scroll controller:")
    expect(appSource).toContain("addEventListener(\"scroll\"")
    expect(appSource).toContain("createBootRuntimeState")
    expect(appSource).toContain("createRefreshRuntimeState")
    expect(appSource).toContain("applyChangePacketToRuntime")
    expect(appSource).not.toContain('from "./editorView.js"')
    expect(appSource).not.toContain("getEditorViewChildren")
    expect(appSource).not.toContain("getEditorViewSectionRootNodes")
    expect(appSource).toContain('from "./visibleRangeRequest.js"')
    expect(appSource).toContain("Store:")
    expect(appSource).toContain("Render:")
    expect(appSource).toContain("createSelectionVisibleRangeRequest")
    expect(appSource).toContain("createDraftVisibleRangeRequest")
    expect(appSource).toContain("createVisibleRangeRuntimeState")
    expect(appSource).toContain("visibleNodeCount")
    expect(appSource).toContain("Range:")
    expect(appSource).toContain("Range request:")
    expect(appSource).toContain("Render window:")
    expect(appSource).toContain("Render shell:")
    expect(appSource).toContain("Store apply:")
    expect(appSource).toContain("viewMode")
    expect(appSource).toContain("applyChangePacket")
    expect(appSource).toContain("applyChangePacket(result.packet)")
    expect(appSource).toContain("applyBridgeTextAction")
    expect(appSource).toContain("applyHistoryAction")
    expect(appSource).toContain("routeForHistoryAction")
    expect(appSource).toContain("authoringHistory")
    expect(appSource).toContain("liveLayout")
    expect(appSource).toContain("History:")
    expect(appSource).toContain("Live layout:")
    expect(appSource).toContain("setSnapshotFromRefresh(await fetchSnapshot())")
    expect(appSource).toContain("state.runtimeCache?.nodeById.get")
    expect(appSource).not.toContain("node.children.map(renderCanvasNode)")
    expect(appSource).not.toContain("snapshot.sections.map")
    expect(appSource).not.toContain("allNodes")
    expect(appSource).not.toContain("flattenNodes")
    expect(appSource).not.toContain("function createRuntimeCache")
    expect(appSource).not.toContain("function replaceChangedNode")
    expect(appSource).not.toContain("packet.baseRevision !==")
    expect(appSource).not.toContain("resolveViewportRangeRequest")
    expect(appSource).not.toContain("getStoreBackedRenderShellSections")
    expect(stylesSource).toContain(".page.is-placeholder")
    expect(stylesSource).toContain(".canvas-placeholder")
    expect(stylesSource).toContain(".virtual-section-spacer")
    expect(stylesSource).toContain(".canvas-lazy-detail")
    expect(stylesSource).toContain("--section-spacer-height")
    expect(stylesSource).toContain("--virtual-spacer-height")
    expect(runtimeStoreSource).toContain("createRuntimeStore")
    expect(runtimeStoreSource).toContain("flowdoc-structural-runtime-store")
    expect(runtimeStoreSource).toContain("applyTextChangePacketToRuntimeStore")
    expect(runtimeStoreSource).toContain("text-packet-direct")
    expect(runtimeStoreSource).toContain("getRuntimeStoreChildren")
    expect(runtimeStoreSource).toContain("getRuntimeStoreSectionRootNodes")
    expect(runtimeStoreSource).not.toContain("document.")
    expect(runtimeStoreSource).not.toContain("querySelector")
    expect(runtimeStoreStructuralPacketSource).toContain("applyStructuralChangePacketToRuntimeStore")
    expect(runtimeStoreStructuralPacketSource).toContain("structural-packet-direct")
    expect(runtimeStoreStructuralPacketSource).toContain("flowdoc-structural-packet")
    expect(runtimeStoreStructuralPacketSource).toContain("foundation-bridge")
    expect(runtimeStoreStructuralPacketSource).toContain("normalizeRuntimeNode")
    expect(runtimeStoreStructuralPacketSource).not.toContain("document.")
    expect(runtimeStoreStructuralPacketSource).not.toContain("querySelector")
    expect(renderWindowSource).toContain("createRenderWindow")
    expect(renderWindowSource).toContain("flowdoc-render-window")
    expect(renderWindowSource).toContain("visible-range-render-window")
    expect(renderWindowSource).toContain("isNodeInRenderWindow")
    expect(renderWindowSource).toContain("isSectionInRenderWindow")
    expect(renderWindowSource).not.toContain("document.")
    expect(renderWindowSource).not.toContain("querySelector")
    expect(renderShellSource).toContain("createRenderShell")
    expect(renderShellSource).toContain("flowdoc-render-shell")
    expect(renderShellSource).toContain("render-window-shell")
    expect(renderShellSource).toContain("getRenderShellSections")
    expect(renderShellSource).toContain("isRenderShellSectionRendered")
    expect(renderShellSource).not.toContain("document.")
    expect(renderShellSource).not.toContain("querySelector")
    expect(viewportAnchorSource).toContain("createViewportSectionAnchor")
    expect(viewportAnchorSource).toContain("resolveViewportSectionAnchorScrollTop")
    expect(viewportAnchorSource).toContain("flowdoc-viewport-anchor")
    expect(viewportAnchorSource).toContain("section-shell-anchor")
    expect(viewportAnchorSource).toContain("section-shell-anchor-restore")
    expect(viewportAnchorSource).not.toContain("document.")
    expect(viewportAnchorSource).not.toContain("querySelector")
    expect(viewportAnchorSource).not.toContain("addEventListener")
    expect(viewportAnchorSource).not.toContain("setTimeout")
    expect(viewportNodeAnchorSource).toContain("createViewportNodeAnchor")
    expect(viewportNodeAnchorSource).toContain("resolveViewportNodeAnchorScrollTop")
    expect(viewportNodeAnchorSource).toContain("flowdoc-viewport-node-anchor")
    expect(viewportNodeAnchorSource).toContain("node-aware-scroll-anchor")
    expect(viewportNodeAnchorSource).toContain("node-aware-anchor-restore")
    expect(viewportNodeAnchorSource).not.toContain("document.")
    expect(viewportNodeAnchorSource).not.toContain("querySelector")
    expect(viewportNodeAnchorSource).not.toContain("addEventListener")
    expect(viewportNodeAnchorSource).not.toContain("setTimeout")
    expect(viewportMeasurementSource).toContain("createViewportMeasurement")
    expect(viewportMeasurementSource).toContain("createViewportFactsFromMeasurement")
    expect(viewportMeasurementSource).toContain("resolveMeasuredViewportRangeRequest")
    expect(viewportMeasurementSource).toContain("createViewportMeasurementApplyRequest")
    expect(viewportMeasurementSource).toContain("flowdoc-viewport-measurement")
    expect(viewportMeasurementSource).toContain("section-shell-measurement")
    expect(viewportMeasurementSource).toContain("manual-measurement-apply")
    expect(viewportMeasurementSource).toContain('from "./viewportController.js"')
    expect(viewportMeasurementSource).not.toContain("document.")
    expect(viewportMeasurementSource).not.toContain("querySelector")
    expect(viewportScrollControllerSource).toContain("createViewportScrollControllerState")
    expect(viewportScrollControllerSource).toContain("recordViewportScroll")
    expect(viewportScrollControllerSource).toContain("settleViewportScroll")
    expect(viewportScrollControllerSource).toContain("flowdoc-viewport-scroll-controller")
    expect(viewportScrollControllerSource).toContain("debounced-measurement-apply")
    expect(viewportScrollControllerSource).toContain("DEFAULT_VIEWPORT_SCROLL_DEBOUNCE_MS")
    expect(viewportScrollControllerSource).toContain('from "./viewportMeasurement.js"')
    expect(viewportScrollControllerSource).not.toContain("document.")
    expect(viewportScrollControllerSource).not.toContain("querySelector")
    expect(viewportScrollControllerSource).not.toContain("addEventListener")
    expect(viewportScrollControllerSource).not.toContain("setTimeout")
    expect(viewportSchedulerCandidateSource).toContain("createViewportSchedulerCandidate")
    expect(viewportSchedulerCandidateSource).toContain("flowdoc-viewport-scheduler-candidate")
    expect(viewportSchedulerCandidateSource).toContain("observe-only-section-window-candidate")
    expect(viewportSchedulerCandidateSource).toContain("DEFAULT_VIEWPORT_SCHEDULER_OVERSCAN_SECTIONS")
    expect(viewportSchedulerCandidateSource).toContain('from "./visibleRangeRequest.js"')
    expect(viewportSchedulerCandidateSource).toContain("applyReady")
    expect(viewportSchedulerCandidateSource).toContain("observeOnly")
    expect(viewportSchedulerCandidateSource).not.toContain("document.")
    expect(viewportSchedulerCandidateSource).not.toContain("querySelector")
    expect(viewportSchedulerCandidateSource).not.toContain("addEventListener")
    expect(viewportSchedulerCandidateSource).not.toContain("setTimeout")
    expect(viewportSchedulerApplySource).toContain("createViewportSchedulerApplyRequest")
    expect(viewportSchedulerApplySource).toContain("flowdoc-viewport-scheduler-apply")
    expect(viewportSchedulerApplySource).toContain("manual-candidate-apply")
    expect(viewportSchedulerApplySource).toContain("revision-mismatch")
    expect(viewportSchedulerApplySource).toContain("draft-active")
    expect(viewportSchedulerApplySource).not.toContain("document.")
    expect(viewportSchedulerApplySource).not.toContain("querySelector")
    expect(viewportSchedulerApplySource).not.toContain("addEventListener")
    expect(viewportSchedulerApplySource).not.toContain("setTimeout")
    expect(viewportSchedulerRuntimeSource).toContain("createViewportSchedulerRuntimeState")
    expect(viewportSchedulerRuntimeSource).toContain("planViewportSchedulerRuntimeCandidate")
    expect(viewportSchedulerRuntimeSource).toContain("applyViewportSchedulerRuntimeCandidate")
    expect(viewportSchedulerRuntimeSource).toContain("flowdoc-viewport-scheduler-runtime")
    expect(viewportSchedulerRuntimeSource).toContain("bounded-section-window-scheduler")
    expect(viewportSchedulerRuntimeSource).toContain("stale-candidate")
    expect(viewportSchedulerRuntimeSource).toContain('from "./viewportSchedulerCandidate.js"')
    expect(viewportSchedulerRuntimeSource).toContain('from "./viewportSchedulerApply.js"')
    expect(viewportSchedulerRuntimeSource).not.toContain("document.")
    expect(viewportSchedulerRuntimeSource).not.toContain("querySelector")
    expect(viewportSchedulerRuntimeSource).not.toContain("addEventListener")
    expect(viewportSchedulerRuntimeSource).not.toContain("setTimeout")
    expect(viewportSchedulerAutomationSource).toContain("createViewportSchedulerAutomationState")
    expect(viewportSchedulerAutomationSource).toContain("runViewportSchedulerAutomation")
    expect(viewportSchedulerAutomationSource).toContain("flowdoc-viewport-scheduler-automation")
    expect(viewportSchedulerAutomationSource).toContain("budgeted-runtime-auto-apply")
    expect(viewportSchedulerAutomationSource).toContain("DEFAULT_VIEWPORT_SCHEDULER_AUTO_MAX_NODES")
    expect(viewportSchedulerAutomationSource).toContain("applyViewportSchedulerRuntimeCandidate")
    expect(viewportSchedulerAutomationSource).toContain("planViewportSchedulerRuntimeCandidate")
    expect(viewportSchedulerAutomationSource).toContain('from "./viewportSchedulerRuntime.js"')
    expect(viewportSchedulerAutomationSource).not.toContain("document.")
    expect(viewportSchedulerAutomationSource).not.toContain("querySelector")
    expect(viewportSchedulerAutomationSource).not.toContain("addEventListener")
    expect(viewportSchedulerAutomationSource).not.toContain("setTimeout")
    expect(viewportVirtualStackSource).toContain("createViewportVirtualStack")
    expect(viewportVirtualStackSource).toContain("flowdoc-viewport-virtual-stack")
    expect(viewportVirtualStackSource).toContain("section-shell-virtual-stack")
    expect(viewportVirtualStackSource).toContain("DEFAULT_VIRTUAL_SECTION_HEIGHT")
    expect(viewportVirtualStackSource).toContain("virtualized-section-shell")
    expect(viewportVirtualStackSource).not.toContain("document.")
    expect(viewportVirtualStackSource).not.toContain("querySelector")
    expect(viewportVirtualStackSource).not.toContain("addEventListener")
    expect(viewportVirtualStackSource).not.toContain("setTimeout")
    expect(viewportLazyDetailSource).toContain("createViewportLazyDetailPlan")
    expect(viewportLazyDetailSource).toContain("flowdoc-viewport-lazy-detail")
    expect(viewportLazyDetailSource).toContain("heavy-node-detail-plan")
    expect(viewportLazyDetailSource).toContain("DEFAULT_HEAVY_CHILD_COUNT")
    expect(viewportLazyDetailSource).toContain("DEFAULT_HEAVY_SUBTREE_NODE_COUNT")
    expect(viewportLazyDetailSource).toContain("DEFAULT_HEAVY_TEXT_LENGTH")
    expect(viewportLazyDetailSource).toContain("protectedByContext")
    expect(viewportLazyDetailSource).not.toContain("document.")
    expect(viewportLazyDetailSource).not.toContain("querySelector")
    expect(viewportLazyDetailSource).not.toContain("addEventListener")
    expect(viewportLazyDetailSource).not.toContain("setTimeout")
    expect(viewportSectionOffsetsSource).toContain("createViewportSectionOffsetIndex")
    expect(viewportSectionOffsetsSource).toContain("predictViewportFromSectionOffsets")
    expect(viewportSectionOffsetsSource).toContain("resolveViewportSectionOffset")
    expect(viewportSectionOffsetsSource).toContain("flowdoc-section-offset-index")
    expect(viewportSectionOffsetsSource).toContain("section-spacer-offset-index")
    expect(viewportSectionOffsetsSource).toContain("section-offset-viewport-prediction")
    expect(viewportSectionOffsetsSource).toContain("DEFAULT_SECTION_OFFSET_GAP")
    expect(viewportSectionOffsetsSource).toContain('from "./viewportSectionSpacers.js"')
    expect(viewportSectionOffsetsSource).not.toContain("document.")
    expect(viewportSectionOffsetsSource).not.toContain("querySelector")
    expect(viewportSectionOffsetsSource).not.toContain("addEventListener")
    expect(viewportSectionOffsetsSource).not.toContain("setTimeout")
    expect(viewportSectionSpacersSource).toContain("createViewportSectionSpacerMap")
    expect(viewportSectionSpacersSource).toContain("resolveViewportSectionSpacer")
    expect(viewportSectionSpacersSource).toContain("flowdoc-section-spacer")
    expect(viewportSectionSpacersSource).toContain("measured-section-spacer")
    expect(viewportSectionSpacersSource).toContain("DEFAULT_SECTION_SPACER_HEIGHT")
    expect(viewportSectionSpacersSource).not.toContain("document.")
    expect(viewportSectionSpacersSource).not.toContain("querySelector")
    expect(viewportSectionSpacersSource).not.toContain("addEventListener")
    expect(viewportSectionSpacersSource).not.toContain("setTimeout")
    expect(viewportControllerSource).toContain("createViewportFacts")
    expect(viewportControllerSource).toContain("resolveViewportRangeRequest")
    expect(viewportControllerSource).toContain("flowdoc-viewport-controller")
    expect(viewportControllerSource).toContain("viewport-range-request")
    expect(viewportControllerSource).toContain("VIEWPORT_PRESERVED")
    expect(viewportControllerSource).not.toContain("document.")
    expect(viewportControllerSource).not.toContain("querySelector")
    expect(renderModelSource).toContain("createStoreBackedRenderModel")
    expect(renderModelSource).toContain('from "./renderWindow.js"')
    expect(renderModelSource).toContain('from "./renderShell.js"')
    expect(renderModelSource).toContain("createRenderWindow")
    expect(renderModelSource).toContain("createRenderShell")
    expect(renderModelSource).toContain("flowdoc-store-backed-render-model")
    expect(renderModelSource).toContain("renderWindow")
    expect(renderModelSource).toContain("renderShell")
    expect(renderModelSource).toContain("getStoreBackedRenderChildren")
    expect(renderModelSource).toContain("getStoreBackedRenderSectionRootNodes")
    expect(renderModelSource).toContain("getStoreBackedRenderWindowChildren")
    expect(renderModelSource).toContain("getStoreBackedRenderWindowSectionRootNodes")
    expect(renderModelSource).toContain("getStoreBackedRenderShellSections")
    expect(renderModelSource).not.toContain("document.")
    expect(renderModelSource).not.toContain("querySelector")
    expect(editorViewSource).toContain("createEditorView")
    expect(editorViewSource).toContain('from "./runtimeStore.js"')
    expect(editorViewSource).toContain('from "./visibleRange.js"')
    expect(editorViewSource).toContain('from "./visibleRangeRequest.js"')
    expect(editorViewSource).toContain("childrenById")
    expect(editorViewSource).toContain("parentById")
    expect(editorViewSource).toContain("runtimeStore")
    expect(editorViewSource).toContain("visibleNodeIds")
    expect(editorViewSource).toContain("visibleRangeRequest")
    expect(editorViewSource).toContain("dirtyNodeIds")
    expect(editorViewSource).not.toContain("const nodeById = new Map")
    expect(visibleRangeRequestSource).toContain("createVisibleRangeRequest")
    expect(visibleRangeRequestSource).toContain("createSelectionVisibleRangeRequest")
    expect(visibleRangeRequestSource).toContain("createDraftVisibleRangeRequest")
    expect(visibleRangeRequestSource).toContain("preserveVisibleRangeRequest")
    expect(visibleRangeRequestSource).toContain("flowdoc-visible-range-request")
    expect(visibleRangeRequestSource).toContain("VIEWPORT")
    expect(visibleRangeRequestSource).toContain("VIEWPORT_PRESERVED")
    expect(visibleRangeRequestSource).not.toContain("document.")
    expect(visibleRangeRequestSource).not.toContain("querySelector")
    expect(visibleRangeSource).toContain("createVisibleRange")
    expect(visibleRangeSource).toContain('from "./visibleRangeRequest.js"')
    expect(visibleRangeSource).toContain("section-window")
    expect(visibleRangeSource).not.toContain("document.")
    expect(visibleRangeSource).not.toContain("querySelector")
    expect(runtimeCacheSource).toContain("createRuntimeCache")
    expect(runtimeCacheSource).toContain("createBootRuntimeState")
    expect(runtimeCacheSource).toContain("createRefreshRuntimeState")
    expect(runtimeCacheSource).toContain("createVisibleRangeRuntimeState")
    expect(runtimeCacheSource).toContain("applyChangePacketToRuntime")
    expect(runtimeCacheSource).toContain("applyTextChangePacketToRuntimeStore")
    expect(runtimeCacheSource).toContain("applyStructuralChangePacketToRuntimeStore")
    expect(runtimeCacheSource).toContain("applyStructuralChangePacketToRuntime")
    expect(runtimeCacheSource).toContain("applyStructuralPacketMetadataToSnapshot")
    expect(runtimeCacheSource).toContain('from "./runtimeStoreStructuralPacket.js"')
    expect(runtimeCacheSource).toContain("applyChangePacketMetadataToSnapshot")
    expect(runtimeCacheSource).toContain("RUNTIME_CACHE_SOURCE")
    expect(runtimeCacheSource).toContain("runtimeStore")
    expect(runtimeCacheSource).toContain("runtimeStoreApplyMode")
    expect(runtimeCacheSource).toContain("runtimeStoreSource")
    expect(runtimeCacheSource).toContain("visibleRange")
    expect(runtimeCacheSource).toContain("visibleRangeRequest")
    expect(runtimeCacheSource).toContain("visibleRangeKind")
    expect(runtimeCacheSource).toContain("preserveVisibleRangeRequest")
    expect(runtimeCacheSource).toContain("flowdoc-template-builder-change-packet")
    expect(runtimeCacheSource).toContain("isStructuralChangePacket")
    expect(runtimeCacheSource).toContain("packet.baseRevision !== snapshot.session.documentRevision")
    expect(runtimeCacheSource).not.toContain("document.")
    expect(runtimeCacheSource).not.toContain("querySelector")
    expect(appSource).not.toContain("result.snapshot")
    expect(coreBoundarySource).toContain("browser.applyChangePacket")
    expect(coreBoundarySource).toContain("browser.createStructuralRuntimeStore")
    expect(coreBoundarySource).toContain("browser.applyTextPacketToRuntimeStore")
    expect(coreBoundarySource).toContain("browser.applyStructuralPacketToRuntimeStore")
    expect(coreBoundarySource).toContain("browser.createStoreBackedRenderModel")
    expect(coreBoundarySource).toContain("browser.resolveRenderWindow")
    expect(coreBoundarySource).toContain("browser.createRenderShell")
    expect(coreBoundarySource).toContain("browser.measureViewportShell")
    expect(coreBoundarySource).toContain("browser.applyViewportMeasurement")
    expect(coreBoundarySource).toContain("browser.controlViewportScroll")
    expect(coreBoundarySource).toContain("browser.trackViewportAnchor")
    expect(coreBoundarySource).toContain("browser.restoreViewportNodeAnchor")
    expect(coreBoundarySource).toContain("browser.trackSectionSpacers")
    expect(coreBoundarySource).toContain("browser.predictViewportSections")
    expect(coreBoundarySource).toContain("browser.planViewportCandidate")
    expect(coreBoundarySource).toContain("browser.applyViewportSchedulerCandidate")
    expect(coreBoundarySource).toContain("browser.runViewportSchedulerRuntime")
    expect(coreBoundarySource).toContain("browser.autoApplyViewportScheduler")
    expect(coreBoundarySource).toContain("browser.virtualizeViewportSections")
    expect(coreBoundarySource).toContain("browser.lazyViewportHeavyDetail")
    expect(coreBoundarySource).toContain("browser.resolveViewportRangeRequest")
    expect(coreBoundarySource).toContain("browser.createNormalizedEditorView")
    expect(coreBoundarySource).toContain("browser.resolveVisibleRange")
    expect(coreBoundarySource).toContain("browser.updateVisibleRangeRequest")
    expect(coreBoundarySource).toContain("sandbox.recordAuthoringHistory")
    expect(coreBoundarySource).toContain("sandbox.requestLiveLayout")
    expect(coreBoundarySource).toContain("user.undo")
    expect(coreBoundarySource).toContain("user.redo")
    expect(browserCacheDoc).toContain("The browser cache is not canonical document truth")
    expect(browserCacheDoc).toContain("public/editorView.js")
    expect(browserCacheDoc).toContain("public/runtimeCache.js")
    expect(browserCacheDoc).toContain("public/runtimeStore.js")
    expect(browserCacheDoc).toContain("public/renderModel.js")
    expect(browserCacheDoc).toContain("public/visibleRangeRequest.js")
    expect(browserCacheDoc).toContain("public/visibleRange.js")
    expect(runtimeCacheDoc).toContain("Status: Phase 46 implementation boundary.")
    expect(runtimeCacheDoc).toContain("createRuntimeCache")
    expect(runtimeCacheDoc).toContain("applyChangePacketToRuntime")
    expect(runtimeCacheDoc).toContain("now coordinates state assignment and rendering only")
    expect(runtimeCacheDoc).toContain("visibleRangeKind")
    expect(visibleRangeDoc).toContain("Status: Phase 47 implementation boundary.")
    expect(visibleRangeDoc).toContain("createVisibleRange")
    expect(visibleRangeDoc).toContain("section-window")
    expect(visibleRangeDoc).toContain("does not implement")
    expect(visibleRangeRequestDoc).toContain("Status: Phase 48 implementation boundary.")
    expect(visibleRangeRequestDoc).toContain("createVisibleRangeRequest")
    expect(visibleRangeRequestDoc).toContain("visibleRangeRequest")
    expect(visibleRangeRequestDoc).toContain("does not implement")
    expect(runtimeStoreDoc).toContain("Status: Phase 49 implementation boundary.")
    expect(runtimeStoreDoc).toContain("createRuntimeStore")
    expect(runtimeStoreDoc).toContain("structural runtime store")
    expect(runtimeStoreDoc).toContain("does not implement")
    expect(textPacketStoreDoc).toContain("Status: Phase 50 implementation boundary.")
    expect(textPacketStoreDoc).toContain("applyTextChangePacketToRuntimeStore")
    expect(textPacketStoreDoc).toContain("text-packet-direct")
    expect(textPacketStoreDoc).toContain("does not implement structural add/delete/move")
    expect(structuralPacketStoreDoc).toContain("Status: Phase 71 foundation boundary.")
    expect(structuralPacketStoreDoc).toContain("applyStructuralChangePacketToRuntimeStore")
    expect(structuralPacketStoreDoc).toContain("structural-packet-direct")
    expect(structuralPacketStoreDoc).toContain("Growth Warning")
    expect(structuralPacketStoreDoc).toContain("does not implement structural command UI")
    expect(storeBackedRenderDoc).toContain("Status: Phase 51 implementation boundary.")
    expect(storeBackedRenderDoc).toContain("createStoreBackedRenderModel")
    expect(storeBackedRenderDoc).toContain("store-backed-render-model")
    expect(storeBackedRenderDoc).toContain("does not implement viewport virtualization")
    expect(storeBackedRenderDoc).toContain("public/renderWindow.js")
    expect(storeBackedRenderDoc).toContain("public/renderShell.js")
    expect(renderWindowDoc).toContain("Status: Phase 52 implementation boundary.")
    expect(renderWindowDoc).toContain("createRenderWindow")
    expect(renderWindowDoc).toContain("visible-range-render-window")
    expect(renderWindowDoc).toContain("does not implement full viewport virtualization")
    expect(renderWindowDoc).toContain("public/viewportController.js")
    expect(renderWindowDoc).toContain("public/renderShell.js")
    expect(viewportRequestDoc).toContain("Status: Phase 53 implementation boundary.")
    expect(viewportRequestDoc).toContain("resolveViewportRangeRequest")
    expect(viewportRequestDoc).toContain("viewport-range-request")
    expect(viewportRequestDoc).toContain("does not implement viewport control")
    expect(viewportRequestDoc).toContain("render shell")
    expect(renderShellDoc).toContain("Status: Phase 54 implementation boundary.")
    expect(renderShellDoc).toContain("createRenderShell")
    expect(renderShellDoc).toContain("render-window-shell")
    expect(renderShellDoc).toContain("does not implement virtualized rendering")
    expect(viewportMeasurementDoc).toContain("Status: Phase 55 implementation boundary.")
    expect(viewportMeasurementDoc).toContain("createViewportMeasurement")
    expect(viewportMeasurementDoc).toContain("section-shell-measurement")
    expect(viewportMeasurementDoc).toContain("does not bind scroll events")
    expect(viewportApplyDoc).toContain("Status: Phase 56 implementation boundary.")
    expect(viewportApplyDoc).toContain("createViewportMeasurementApplyRequest")
    expect(viewportApplyDoc).toContain("manual-measurement-apply")
    expect(viewportApplyDoc).toContain("no scroll event binding")
    expect(viewportScrollControllerDoc).toContain("Status: Phase 57 implementation boundary.")
    expect(viewportScrollControllerDoc).toContain("viewportScrollController.js")
    expect(viewportScrollControllerDoc).toContain("recordViewportScroll")
    expect(viewportScrollControllerDoc).toContain("settleViewportScroll")
    expect(viewportScrollControllerDoc).toContain("browser.controlViewportScroll")
    expect(viewportScrollControllerDoc).toContain("debounced viewport scroll controller")
    expect(viewportAnchorDoc).toContain("Status: Phase 58 implementation boundary.")
    expect(viewportAnchorDoc).toContain("viewportAnchor.js")
    expect(viewportAnchorDoc).toContain("createViewportSectionAnchor")
    expect(viewportAnchorDoc).toContain("resolveViewportSectionAnchorScrollTop")
    expect(viewportAnchorDoc).toContain("browser.trackViewportAnchor")
    expect(viewportAnchorDoc).toContain("Node anchors remain a required later upgrade")
    expect(viewportNodeAnchorDoc).toContain("Status: Phase 67 implementation boundary.")
    expect(viewportNodeAnchorDoc).toContain("viewportNodeAnchor.js")
    expect(viewportNodeAnchorDoc).toContain("createViewportNodeAnchor")
    expect(viewportNodeAnchorDoc).toContain("resolveViewportNodeAnchorScrollTop")
    expect(viewportNodeAnchorDoc).toContain("browser.restoreViewportNodeAnchor")
    expect(viewportNodeAnchorDoc).toContain("node-aware viewport anchor")
    expect(sectionSpacerDoc).toContain("Status: Phase 59 implementation boundary.")
    expect(sectionSpacerDoc).toContain("viewportSectionSpacers.js")
    expect(sectionSpacerDoc).toContain("createViewportSectionSpacerMap")
    expect(sectionSpacerDoc).toContain("resolveViewportSectionSpacer")
    expect(sectionSpacerDoc).toContain("browser.trackSectionSpacers")
    expect(sectionSpacerDoc).toContain("Placeholder-only sections use a")
    expect(sectionOffsetDoc).toContain("Status: Phase 60 implementation boundary.")
    expect(sectionOffsetDoc).toContain("viewportSectionOffsets.js")
    expect(sectionOffsetDoc).toContain("createViewportSectionOffsetIndex")
    expect(sectionOffsetDoc).toContain("predictViewportFromSectionOffsets")
    expect(sectionOffsetDoc).toContain("browser.predictViewportSections")
    expect(sectionOffsetDoc).toContain("root model, not the destination")
    expect(viewportSchedulerCandidateDoc).toContain("Status: Phase 61 implementation boundary.")
    expect(viewportSchedulerCandidateDoc).toContain("viewportSchedulerCandidate.js")
    expect(viewportSchedulerCandidateDoc).toContain("createViewportSchedulerCandidate")
    expect(viewportSchedulerCandidateDoc).toContain("browser.planViewportCandidate")
    expect(viewportSchedulerCandidateDoc).toContain("observe-only")
    expect(viewportSchedulerCandidateDoc).toContain("does not call `setVisibleRangeRequest(...)`")
    expect(viewportSchedulerApplyDoc).toContain("Status: Phase 62 implementation boundary.")
    expect(viewportSchedulerApplyDoc).toContain("viewportSchedulerApply.js")
    expect(viewportSchedulerApplyDoc).toContain("createViewportSchedulerApplyRequest")
    expect(viewportSchedulerApplyDoc).toContain("browser.applyViewportSchedulerCandidate")
    expect(viewportSchedulerApplyDoc).toContain("does not implement the final viewport scheduler")
    expect(viewportSchedulerRuntimeDoc).toContain("Status: Phase 63 implementation boundary.")
    expect(viewportSchedulerRuntimeDoc).toContain("viewportSchedulerRuntime.js")
    expect(viewportSchedulerRuntimeDoc).toContain("planViewportSchedulerRuntimeCandidate")
    expect(viewportSchedulerRuntimeDoc).toContain("applyViewportSchedulerRuntimeCandidate")
    expect(viewportSchedulerRuntimeDoc).toContain("browser.runViewportSchedulerRuntime")
    expect(viewportSchedulerRuntimeDoc).toContain("stale candidates are dropped")
    expect(viewportSchedulerAutomationDoc).toContain("Status: Phase 64 implementation boundary.")
    expect(viewportSchedulerAutomationDoc).toContain("viewportSchedulerAutomation.js")
    expect(viewportSchedulerAutomationDoc).toContain("DEFAULT_VIEWPORT_SCHEDULER_AUTO_MAX_NODES")
    expect(viewportSchedulerAutomationDoc).toContain("runViewportSchedulerAutomation")
    expect(viewportSchedulerAutomationDoc).toContain("browser.autoApplyViewportScheduler")
    expect(viewportSchedulerAutomationDoc).toContain("finite default max-node cap")
    expect(viewportVirtualStackDoc).toContain("Status: Phase 65 implementation boundary.")
    expect(viewportVirtualStackDoc).toContain("viewportVirtualStack.js")
    expect(viewportVirtualStackDoc).toContain("createViewportVirtualStack")
    expect(viewportVirtualStackDoc).toContain("browser.virtualizeViewportSections")
    expect(viewportVirtualStackDoc).toContain("virtual-section-spacer")
    expect(viewportVirtualStackDoc).toContain("missing offsets fall back")
    expect(viewportLazyDetailDoc).toContain("Status: Phase 66 implementation boundary.")
    expect(viewportLazyDetailDoc).toContain("viewportLazyDetail.js")
    expect(viewportLazyDetailDoc).toContain("createViewportLazyDetailPlan")
    expect(viewportLazyDetailDoc).toContain("browser.lazyViewportHeavyDetail")
    expect(viewportLazyDetailDoc).toContain("canvas-lazy-detail")
    expect(viewportLazyDetailDoc).toContain("active selected/draft ancestor path")
    expect(viewportLargeDocumentAuditDoc).toContain("Status: Phase 68 behavior audit.")
    expect(viewportLargeDocumentAuditDoc).toContain("72 ordered sections")
    expect(viewportLargeDocumentAuditDoc).toContain("936 ordered runtime nodes")
    expect(viewportLargeDocumentAuditDoc).toContain("39 nodes out of 936 total nodes")
    expect(viewportLargeDocumentAuditDoc).toContain("node-aware anchor restores the far target node")
  })

  it("builds normalized editor view indexes from the sandbox snapshot", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import { readFileSync } from "node:fs";
      const {
        createEditorView,
        getEditorViewChildren,
        getEditorViewParent,
        getEditorViewSectionRootNodes,
      } = await import("./public/editorView.js");
      const snapshot = JSON.parse(readFileSync("./public/sandbox-snapshot.json", "utf8"));
      const view = createEditorView(snapshot, {
        packet: {
          changedNodeIds: ["cover-header-label"],
          affectedParentNodeIds: ["cover-first-header"],
          dirtyScopes: [
            { textBlockId: "cover-header-label", parentNodeIds: ["cover-first-header"] },
          ],
        },
      });
      console.log(JSON.stringify({
        changedSubtreeIds: [...view.changedSubtreeIds].sort(),
        childIndexCount: view.childrenById.size,
        coverBodyChildren: getEditorViewChildren(view, "cover-body").map((node) => node.id),
        dirtyNodeIds: [...view.dirtyNodeIds].sort(),
        mode: view.mode,
        nodeCount: view.nodeOrder.length,
        parentId: getEditorViewParent(view, "cover-title")?.id ?? null,
        rootZones: getEditorViewSectionRootNodes(view, "section-cover").map((node) => node.id),
        runtimeStoreMode: view.runtimeStore.mode,
        runtimeStoreNodeCount: view.runtimeStore.nodeCount,
        runtimeStorePreviousRevision: view.runtimeStore.previousRevision,
        runtimeStoreSectionCount: view.runtimeStore.sectionCount,
        runtimeStoreSource: view.runtimeStore.source,
        sectionId: view.sectionIdByNodeId.get("cover-title"),
        source: view.source,
        visibleRangeRequestBudget: view.visibleRangeRequest.budget,
        visibleRangeRequestReason: view.visibleRangeRequest.reason,
        visibleRangeRequestSource: view.visibleRangeRequest.source,
        visibleRangeSectionIds: view.visibleRange.sectionIds,
        visibleRangeSource: view.visibleRange.source,
        visibleRangeWindowed: view.visibleRange.windowed,
        visibleNodeCount: view.visibleNodeIds.length,
        visibleRangeKind: view.visibleRange.kind,
        visibleTotalNodeCount: view.visibleRange.totalNodeCount,
        zoneId: view.zoneIdByNodeId.get("cover-title"),
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      changedSubtreeIds: string[]
      childIndexCount: number
      coverBodyChildren: string[]
      dirtyNodeIds: string[]
      mode: string
      nodeCount: number
      parentId: string
      rootZones: string[]
      runtimeStoreMode: string
      runtimeStoreNodeCount: number
      runtimeStorePreviousRevision: number | null
      runtimeStoreSectionCount: number
      runtimeStoreSource: string
      sectionId: string
      source: string
      visibleNodeCount: number
      visibleRangeKind: string
      visibleRangeRequestBudget: { maxNodes: number | null; mode: string }
      visibleRangeRequestReason: string
      visibleRangeRequestSource: string
      visibleRangeSectionIds: string[]
      visibleRangeSource: string
      visibleRangeWindowed: boolean
      visibleTotalNodeCount: number
      zoneId: string
    }

    expect(result.source).toBe("flowdoc-normalized-editor-view")
    expect(result.mode).toBe("normalized-editor-view")
    expect(result.runtimeStoreSource).toBe("flowdoc-structural-runtime-store")
    expect(result.runtimeStoreMode).toBe("structural-runtime-store")
    expect(result.runtimeStoreNodeCount).toBe(52)
    expect(result.runtimeStoreSectionCount).toBe(3)
    expect(result.runtimeStorePreviousRevision).toBeNull()
    expect(result.nodeCount).toBe(52)
    expect(result.visibleNodeCount).toBe(16)
    expect(result.visibleRangeKind).toBe("section-window")
    expect(result.visibleRangeRequestSource).toBe("flowdoc-visible-range-request")
    expect(result.visibleRangeRequestReason).toBe("boot")
    expect(result.visibleRangeRequestBudget).toEqual({ maxNodes: null, mode: "interactive" })
    expect(result.visibleRangeSource).toBe("flowdoc-visible-range")
    expect(result.visibleRangeSectionIds).toEqual(["section-cover"])
    expect(result.visibleRangeWindowed).toBe(true)
    expect(result.visibleTotalNodeCount).toBe(52)
    expect(result.childIndexCount).toBe(52)
    expect(result.rootZones).toEqual(["cover-first-header", "cover-body", "cover-first-footer"])
    expect(result.coverBodyChildren).toEqual([
      "cover-title",
      "cover-subtitle",
      "cover-meta-columns",
      "cover-divider",
      "cover-note",
    ])
    expect(result.parentId).toBe("cover-body")
    expect(result.sectionId).toBe("section-cover")
    expect(result.zoneId).toBe("cover-body")
    expect(result.dirtyNodeIds).toEqual(["cover-first-header", "cover-header-label"])
    expect(result.changedSubtreeIds).toEqual(["cover-first-header", "cover-header-label"])
  })

  it("builds structural runtime store indexes before editor view consumption", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import { readFileSync } from "node:fs";
      const {
        createRuntimeStore,
        getRuntimeStoreChildren,
        getRuntimeStoreParent,
        getRuntimeStoreSectionRootNodes,
      } = await import("./public/runtimeStore.js");
      const snapshot = JSON.parse(readFileSync("./public/sandbox-snapshot.json", "utf8"));
      const store = createRuntimeStore(snapshot);
      const rebuilt = createRuntimeStore(snapshot, { previousStore: store });
      console.log(JSON.stringify({
        bodyChildren: getRuntimeStoreChildren(store, "cover-body").map((node) => node.id),
        mode: store.mode,
        nodeCount: store.nodeCount,
        parentId: getRuntimeStoreParent(store, "cover-title")?.id ?? null,
        previousRevision: rebuilt.previousRevision,
        rootZones: getRuntimeStoreSectionRootNodes(store, "section-cover").map((node) => node.id),
        sectionCount: store.sectionCount,
        sectionId: store.sectionIdByNodeId.get("cover-title"),
        sectionIds: store.sectionIds,
        source: store.source,
        zoneId: store.zoneIdByNodeId.get("cover-title"),
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      bodyChildren: string[]
      mode: string
      nodeCount: number
      parentId: string
      previousRevision: number
      rootZones: string[]
      sectionCount: number
      sectionId: string
      sectionIds: string[]
      source: string
      zoneId: string
    }

    expect(result.source).toBe("flowdoc-structural-runtime-store")
    expect(result.mode).toBe("structural-runtime-store")
    expect(result.nodeCount).toBe(52)
    expect(result.sectionCount).toBe(3)
    expect(result.sectionIds).toEqual(["section-cover", "section-toc", "section-body"])
    expect(result.previousRevision).toBe(0)
    expect(result.rootZones).toEqual(["cover-first-header", "cover-body", "cover-first-footer"])
    expect(result.bodyChildren).toEqual([
      "cover-title",
      "cover-subtitle",
      "cover-meta-columns",
      "cover-divider",
      "cover-note",
    ])
    expect(result.parentId).toBe("cover-body")
    expect(result.sectionId).toBe("section-cover")
    expect(result.zoneId).toBe("cover-body")
  })

  it("applies text change packets directly to the structural runtime store", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import { readFileSync } from "node:fs";
      const {
        applyTextChangePacketToRuntimeStore,
        createRuntimeStore,
      } = await import("./public/runtimeStore.js");
      const snapshot = JSON.parse(readFileSync("./public/sandbox-snapshot.json", "utf8"));
      const store = createRuntimeStore(snapshot);
      const changedNode = JSON.parse(JSON.stringify(store.nodeById.get("cover-header-label")));
      changedNode.plainText = "Direct store packet text";
      changedNode.textPreview = "Direct store packet text";
      changedNode.textLength = changedNode.plainText.length;
      const result = applyTextChangePacketToRuntimeStore(store, {
        baseRevision: 0,
        nextRevision: 1,
        changedNodeIds: ["cover-header-label"],
        changedNodes: [changedNode],
      });
      const structuralResult = applyTextChangePacketToRuntimeStore(store, {
        baseRevision: 0,
        nextRevision: 1,
        changedNodeIds: ["cover-header-label"],
        changedNodes: [{ ...changedNode, children: [{ id: "new-child" }] }],
      });
      console.log(JSON.stringify({
        applyMode: result.applyMode,
        changedText: result.runtimeStore.nodeById.get("cover-header-label").textPreview,
        childIds: result.runtimeStore.childrenById.get("cover-header-label"),
        currentTextUnchanged: store.nodeById.get("cover-header-label").textPreview,
        documentRevision: result.runtimeStore.documentRevision,
        nodeCount: result.runtimeStore.nodeCount,
        previousRevision: result.runtimeStore.previousRevision,
        source: result.runtimeStore.source,
        structuralOk: structuralResult.ok,
        structuralReason: structuralResult.reason,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      applyMode: string
      changedText: string
      childIds: string[]
      currentTextUnchanged: string
      documentRevision: number
      nodeCount: number
      previousRevision: number
      source: string
      structuralOk: boolean
      structuralReason: string
    }

    expect(result.source).toBe("flowdoc-structural-runtime-store")
    expect(result.applyMode).toBe("text-packet-direct")
    expect(result.changedText).toBe("Direct store packet text")
    expect(result.currentTextUnchanged).toBe("Confidential Product Report")
    expect(result.childIds).toEqual([])
    expect(result.nodeCount).toBe(52)
    expect(result.documentRevision).toBe(1)
    expect(result.previousRevision).toBe(0)
    expect(result.structuralOk).toBe(false)
    expect(result.structuralReason).toContain("structural child changes")
  })

  it("applies structural packets directly to the structural runtime store", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import { readFileSync } from "node:fs";
      const {
        createRuntimeStore,
        getRuntimeStoreChildren,
      } = await import("./public/runtimeStore.js");
      const {
        applyStructuralChangePacketToRuntimeStore,
      } = await import("./public/runtimeStoreStructuralPacket.js");
      const snapshot = JSON.parse(readFileSync("./public/sandbox-snapshot.json", "utf8"));
      const store = createRuntimeStore(snapshot);
      const beforeChildren = [...store.childrenById.get("cover-body")];
      const afterChildren = [beforeChildren[0], "phase-71-inserted", ...beforeChildren.slice(1)];
      const insertedNode = {
        id: "phase-71-inserted",
        type: "text-block",
        role: { role: "paragraph" },
        props: {},
        children: [{ id: "phase-71-inserted-inline-1", type: "text", text: "Structural store packet" }],
      };
      const insertPacket = {
        source: "flowdoc-structural-packet",
        packetVersion: 1,
        stage: "foundation-bridge",
        action: "text-block.insert",
        status: "applied",
        baseRevision: 0,
        nextRevision: 1,
        operation: null,
        failureReason: null,
        nodesAdded: [insertedNode],
        nodesUpdated: [{ id: "cover-body", type: "zone", role: "body", childIds: afterChildren }],
        nodeIdsRemoved: [],
        parentListPatches: [{
          op: "insert",
          sectionId: "section-cover",
          parentId: "cover-body",
          parentKind: "zone",
          childField: "childIds",
          nodeId: "phase-71-inserted",
          toIndex: 1,
          before: beforeChildren,
          after: afterChildren,
        }],
        changedNodeIds: ["phase-71-inserted", "cover-body"],
        affectedParentNodeIds: ["cover-body"],
        dirtyScopes: [{ sectionIds: ["section-cover"], zoneIds: ["cover-body"], nodeIds: ["phase-71-inserted"], parentNodeIds: ["cover-body"], tableIds: [], textBlockIds: ["phase-71-inserted"] }],
        renderInvalidation: null,
        issues: [],
      };
      const insertResult = applyStructuralChangePacketToRuntimeStore(store, insertPacket);
      const staleResult = applyStructuralChangePacketToRuntimeStore(store, { ...insertPacket, baseRevision: 99 });
      const deletePacket = {
        ...insertPacket,
        action: "node.delete",
        baseRevision: 1,
        nextRevision: 2,
        nodesAdded: [],
        nodesUpdated: [{ id: "cover-body", type: "zone", role: "body", childIds: beforeChildren }],
        nodeIdsRemoved: ["phase-71-inserted"],
        parentListPatches: [{
          op: "remove",
          sectionId: "section-cover",
          parentId: "cover-body",
          parentKind: "zone",
          childField: "childIds",
          nodeId: "phase-71-inserted",
          fromIndex: 1,
          before: afterChildren,
          after: beforeChildren,
        }],
        changedNodeIds: ["cover-body", "phase-71-inserted"],
        affectedParentNodeIds: ["cover-body"],
      };
      const deleteResult = applyStructuralChangePacketToRuntimeStore(insertResult.runtimeStore, deletePacket);
      console.log(JSON.stringify({
        deleteChildren: getRuntimeStoreChildren(deleteResult.runtimeStore, "cover-body").map((node) => node.id),
        deleteNodeExists: deleteResult.runtimeStore.nodeById.has("phase-71-inserted"),
        deleteNodeCount: deleteResult.runtimeStore.nodeCount,
        deleteRevision: deleteResult.runtimeStore.documentRevision,
        insertApplyMode: insertResult.applyMode,
        insertChildren: getRuntimeStoreChildren(insertResult.runtimeStore, "cover-body").map((node) => node.id),
        insertDepth: insertResult.runtimeStore.nodeById.get("phase-71-inserted").depth,
        insertParentId: insertResult.runtimeStore.parentById.get("phase-71-inserted"),
        insertPlainText: insertResult.runtimeStore.nodeById.get("phase-71-inserted").plainText,
        insertPreview: insertResult.runtimeStore.nodeById.get("phase-71-inserted").textPreview,
        insertSectionId: insertResult.runtimeStore.sectionIdByNodeId.get("phase-71-inserted"),
        insertZoneId: insertResult.runtimeStore.zoneIdByNodeId.get("phase-71-inserted"),
        originalChildren: getRuntimeStoreChildren(store, "cover-body").map((node) => node.id),
        originalNodeCount: store.nodeCount,
        previousRevision: insertResult.runtimeStore.previousRevision,
        revision: insertResult.runtimeStore.documentRevision,
        staleOk: staleResult.ok,
        staleReason: staleResult.reason,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      deleteChildren: string[]
      deleteNodeCount: number
      deleteNodeExists: boolean
      deleteRevision: number
      insertApplyMode: string
      insertChildren: string[]
      insertDepth: number
      insertParentId: string
      insertPlainText: string
      insertPreview: string
      insertSectionId: string
      insertZoneId: string
      originalChildren: string[]
      originalNodeCount: number
      previousRevision: number
      revision: number
      staleOk: boolean
      staleReason: string
    }

    expect(result.insertApplyMode).toBe("structural-packet-direct")
    expect(result.insertChildren).toEqual([
      "cover-title",
      "phase-71-inserted",
      "cover-subtitle",
      "cover-meta-columns",
      "cover-divider",
      "cover-note",
    ])
    expect(result.insertPreview).toBe("Structural store packet")
    expect(result.insertPlainText).toBe("Structural store packet")
    expect(result.insertParentId).toBe("cover-body")
    expect(result.insertSectionId).toBe("section-cover")
    expect(result.insertZoneId).toBe("cover-body")
    expect(result.insertDepth).toBe(1)
    expect(result.originalChildren).toEqual([
      "cover-title",
      "cover-subtitle",
      "cover-meta-columns",
      "cover-divider",
      "cover-note",
    ])
    expect(result.originalNodeCount).toBe(52)
    expect(result.revision).toBe(1)
    expect(result.previousRevision).toBe(0)
    expect(result.staleOk).toBe(false)
    expect(result.staleReason).toContain("did not match runtime store revision")
    expect(result.deleteChildren).toEqual(result.originalChildren)
    expect(result.deleteNodeExists).toBe(false)
    expect(result.deleteNodeCount).toBe(52)
    expect(result.deleteRevision).toBe(2)
  })

  it("builds bounded visible ranges without rendering the whole document", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import { readFileSync } from "node:fs";
      const { createEditorView } = await import("./public/editorView.js");
      const { createVisibleRange } = await import("./public/visibleRange.js");
      const snapshot = JSON.parse(readFileSync("./public/sandbox-snapshot.json", "utf8"));
      const fullView = createEditorView(snapshot, { visibleRange: { kind: "all-nodes" } });
      const analysisRange = createVisibleRange({
        nodeOrder: fullView.nodeOrder,
        sectionIdByNodeId: fullView.sectionIdByNodeId,
        sectionIds: fullView.sectionIds,
      }, {
        anchorSectionId: "section-body",
        maxNodes: 4,
      });
      console.log(JSON.stringify({
        allNodeCount: fullView.visibleNodeIds.length,
        bodyNodesInSection: analysisRange.nodeIds.every((nodeId) => fullView.sectionIdByNodeId.get(nodeId) === "section-body"),
        defaultKind: createEditorView(snapshot).visibleRange.kind,
        kind: analysisRange.kind,
        nodeCount: analysisRange.nodeCount,
        nodeIds: analysisRange.nodeIds,
        sectionIds: analysisRange.sectionIds,
        source: analysisRange.source,
        totalNodeCount: analysisRange.totalNodeCount,
        truncated: analysisRange.truncated,
        windowed: analysisRange.windowed,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      allNodeCount: number
      bodyNodesInSection: boolean
      defaultKind: string
      kind: string
      nodeCount: number
      nodeIds: string[]
      sectionIds: string[]
      source: string
      totalNodeCount: number
      truncated: boolean
      windowed: boolean
    }

    expect(result.source).toBe("flowdoc-visible-range")
    expect(result.defaultKind).toBe("section-window")
    expect(result.kind).toBe("section-window")
    expect(result.sectionIds).toEqual(["section-body"])
    expect(result.nodeCount).toBe(4)
    expect(result.nodeIds).toHaveLength(4)
    expect(result.bodyNodesInSection).toBe(true)
    expect(result.totalNodeCount).toBe(52)
    expect(result.allNodeCount).toBe(52)
    expect(result.truncated).toBe(true)
    expect(result.windowed).toBe(true)
  })

  it("resolves render windows from visible range facts", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      const {
        createRenderWindow,
        getRenderWindowSections,
        isNodeInRenderWindow,
        isSectionInRenderWindow,
      } = await import("./public/renderWindow.js");
      const sections = [
        { id: "section-cover", page: "A4 portrait", rootZoneIds: ["cover-root"] },
        { id: "section-body", page: "A4 portrait", rootZoneIds: ["body-root"] },
        { id: "section-appendix", page: "A4 portrait", rootZoneIds: ["appendix-root"] },
      ];
      const window = createRenderWindow({
        sections,
        visibleRange: {
          anchorNodeId: "body-title",
          anchorSectionId: "section-body",
          kind: "section-window",
          maxNodes: 2,
          nodeIds: ["body-root", "body-title"],
          request: { reason: "selection" },
          sectionIds: ["section-body"],
          totalNodeCount: 20,
          totalSectionCount: 3,
          truncated: true,
          windowed: true,
        },
      });
      console.log(JSON.stringify({
        activeSections: getRenderWindowSections(window).map((section) => section.id),
        bodyInWindow: isSectionInRenderWindow(window, "section-body"),
        coverInWindow: isSectionInRenderWindow(window, "section-cover"),
        bodyTitleInWindow: isNodeInRenderWindow(window, "body-title"),
        coverRootInWindow: isNodeInRenderWindow(window, "cover-root"),
        mode: window.mode,
        nodeCount: window.nodeCount,
        reason: window.reason,
        source: window.source,
        totalNodeCount: window.totalNodeCount,
        truncated: window.truncated,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      activeSections: string[]
      bodyInWindow: boolean
      coverInWindow: boolean
      bodyTitleInWindow: boolean
      coverRootInWindow: boolean
      mode: string
      nodeCount: number
      reason: string
      source: string
      totalNodeCount: number
      truncated: boolean
    }

    expect(result.source).toBe("flowdoc-render-window")
    expect(result.mode).toBe("visible-range-render-window")
    expect(result.reason).toBe("selection")
    expect(result.activeSections).toEqual(["section-body"])
    expect(result.bodyInWindow).toBe(true)
    expect(result.coverInWindow).toBe(false)
    expect(result.bodyTitleInWindow).toBe(true)
    expect(result.coverRootInWindow).toBe(false)
    expect(result.nodeCount).toBe(2)
    expect(result.totalNodeCount).toBe(20)
    expect(result.truncated).toBe(true)
  })

  it("creates full render shells with active-window placeholders", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      const {
        createRenderShell,
        getRenderShellSections,
        isRenderShellSectionRendered,
      } = await import("./public/renderShell.js");
      const sections = [
        { id: "section-cover", page: "A4 portrait", rootZoneIds: ["cover-root"] },
        { id: "section-body", page: "A4 portrait", rootZoneIds: ["body-root"] },
        { id: "section-appendix", page: "A4 portrait", rootZoneIds: ["appendix-root"] },
      ];
      const shell = createRenderShell({
        sections,
        renderWindow: {
          mode: "visible-range-render-window",
          nodeCount: 2,
          sectionIds: ["section-body"],
          totalNodeCount: 20,
          windowed: true,
        },
      });
      console.log(JSON.stringify({
        bodyRendered: isRenderShellSectionRendered(shell, "section-body"),
        coverRendered: isRenderShellSectionRendered(shell, "section-cover"),
        mode: shell.mode,
        placeholderIds: shell.placeholderSectionIds,
        placeholderSectionCount: shell.placeholderSectionCount,
        renderedIds: shell.renderedSectionIds,
        renderedSectionCount: shell.renderedSectionCount,
        sectionStates: getRenderShellSections(shell).map((section) => ({
          id: section.id,
          placeholder: section.placeholder,
          rendered: section.rendered,
        })),
        source: shell.source,
        totalNodeCount: shell.totalNodeCount,
        windowed: shell.windowed,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      bodyRendered: boolean
      coverRendered: boolean
      mode: string
      placeholderIds: string[]
      placeholderSectionCount: number
      renderedIds: string[]
      renderedSectionCount: number
      sectionStates: Array<{ id: string; placeholder: boolean; rendered: boolean }>
      source: string
      totalNodeCount: number
      windowed: boolean
    }

    expect(result.source).toBe("flowdoc-render-shell")
    expect(result.mode).toBe("render-window-shell")
    expect(result.renderedIds).toEqual(["section-body"])
    expect(result.placeholderIds).toEqual(["section-cover", "section-appendix"])
    expect(result.renderedSectionCount).toBe(1)
    expect(result.placeholderSectionCount).toBe(2)
    expect(result.bodyRendered).toBe(true)
    expect(result.coverRendered).toBe(false)
    expect(result.totalNodeCount).toBe(20)
    expect(result.windowed).toBe(true)
    expect(result.sectionStates).toEqual([
      { id: "section-cover", placeholder: true, rendered: false },
      { id: "section-body", placeholder: false, rendered: true },
      { id: "section-appendix", placeholder: true, rendered: false },
    ])
  })

  it("keeps visible range requests separate from resolved ranges", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import { readFileSync } from "node:fs";
      const { createBootRuntimeState, createVisibleRangeRuntimeState } = await import("./public/runtimeCache.js");
      const {
        createDraftVisibleRangeRequest,
        createSelectionVisibleRangeRequest,
        preserveVisibleRangeRequest,
      } = await import("./public/visibleRangeRequest.js");
      const snapshot = JSON.parse(readFileSync("./public/sandbox-snapshot.json", "utf8"));
      const bootState = createBootRuntimeState(snapshot);
      const selectionRequest = createSelectionVisibleRangeRequest("body-heading", bootState.runtimeCache.visibleRangeRequest, {
        budget: { mode: "interactive", maxNodes: 4 },
      });
      const selectedState = createVisibleRangeRuntimeState(snapshot, bootState.runtimeCache, selectionRequest);
      const draftRequest = createDraftVisibleRangeRequest("body-heading", selectedState.runtimeCache.visibleRangeRequest);
      const draftState = createVisibleRangeRuntimeState(snapshot, selectedState.runtimeCache, draftRequest);
      const preservedSelection = createSelectionVisibleRangeRequest("cover-header-label", draftState.runtimeCache.visibleRangeRequest, {
        draftActive: true,
      });
      const packetRequest = preserveVisibleRangeRequest(draftState.runtimeCache.visibleRangeRequest, { reason: "packet-apply" });
      const packetState = createVisibleRangeRuntimeState(snapshot, draftState.runtimeCache, packetRequest);
      console.log(JSON.stringify({
        bootReason: bootState.runtimeCache.visibleRangeRequest.reason,
        bootRequestSource: bootState.runtimeCache.visibleRangeRequestSource,
        bootRangeSource: bootState.runtimeCache.visibleRangeSource,
        bootSections: bootState.runtimeCache.visibleRange.sectionIds,
        selectionBudget: selectedState.runtimeCache.visibleRangeRequest.budget,
        selectionReason: selectedState.runtimeCache.visibleRangeRequest.reason,
        selectionSections: selectedState.runtimeCache.visibleRange.sectionIds,
        selectionVisibleCount: selectedState.runtimeCache.visibleNodeCount,
        draftPreserve: draftState.runtimeCache.visibleRangeRequest.preserveDuringDraft,
        draftReason: draftState.runtimeCache.visibleRangeRequest.reason,
        preservedReason: preservedSelection.reason,
        preservedFromReason: preservedSelection.preservedFromReason,
        preservedAnchorNodeId: preservedSelection.anchorNodeId,
        packetReason: packetState.runtimeCache.visibleRangeRequest.reason,
        packetPreservedFromReason: packetState.runtimeCache.visibleRangeRequest.preservedFromReason,
        packetSections: packetState.runtimeCache.visibleRange.sectionIds,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      bootRangeSource: string
      bootReason: string
      bootRequestSource: string
      bootSections: string[]
      draftPreserve: boolean
      draftReason: string
      packetPreservedFromReason: string
      packetReason: string
      packetSections: string[]
      preservedAnchorNodeId: string
      preservedFromReason: string
      preservedReason: string
      selectionBudget: { maxNodes: number; mode: string }
      selectionReason: string
      selectionSections: string[]
      selectionVisibleCount: number
    }

    expect(result.bootReason).toBe("boot")
    expect(result.bootRequestSource).toBe("flowdoc-visible-range-request")
    expect(result.bootRangeSource).toBe("flowdoc-visible-range")
    expect(result.bootSections).toEqual(["section-cover"])
    expect(result.selectionReason).toBe("selection")
    expect(result.selectionSections).toEqual(["section-body"])
    expect(result.selectionBudget).toEqual({ maxNodes: 4, mode: "interactive" })
    expect(result.selectionVisibleCount).toBe(4)
    expect(result.draftReason).toBe("draft")
    expect(result.draftPreserve).toBe(true)
    expect(result.preservedReason).toBe("selection-preserved")
    expect(result.preservedFromReason).toBe("draft")
    expect(result.preservedAnchorNodeId).toBe("body-heading")
    expect(result.packetReason).toBe("packet-apply")
    expect(result.packetPreservedFromReason).toBe("draft")
    expect(result.packetSections).toEqual(["section-body"])
  })

  it("derives viewport range requests before DOM scroll measurement is wired", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import { readFileSync } from "node:fs";
      const {
        createBootRuntimeState,
        createVisibleRangeRuntimeState,
      } = await import("./public/runtimeCache.js");
      const {
        createDraftVisibleRangeRequest,
      } = await import("./public/visibleRangeRequest.js");
      const {
        resolveViewportRangeRequest,
      } = await import("./public/viewportController.js");
      const {
        createStoreBackedRenderModel,
        getStoreBackedRenderWindowSections,
      } = await import("./public/renderModel.js");
      const snapshot = JSON.parse(readFileSync("./public/sandbox-snapshot.json", "utf8"));
      const bootState = createBootRuntimeState(snapshot);
      const viewportResult = resolveViewportRangeRequest({
        anchorSectionId: "section-body",
        budget: { mode: "viewport", maxNodes: 5 },
        scrollHeight: 3200,
        scrollTop: 1440,
        viewportHeight: 720,
      }, bootState.runtimeCache.visibleRangeRequest);
      const viewportState = createVisibleRangeRuntimeState(
        snapshot,
        bootState.runtimeCache,
        viewportResult.visibleRangeRequest,
      );
      const renderModel = createStoreBackedRenderModel(viewportState.snapshot, viewportState.runtimeCache);
      const draftRequest = createDraftVisibleRangeRequest("cover-title", bootState.runtimeCache.visibleRangeRequest);
      const preservedViewport = resolveViewportRangeRequest({
        anchorSectionId: "section-body",
        draftActive: true,
        scrollTop: 1800,
        viewportHeight: 720,
      }, draftRequest);
      console.log(JSON.stringify({
        mode: viewportResult.mode,
        preserved: viewportResult.preserved,
        requestBudget: viewportResult.visibleRangeRequest.budget,
        requestReason: viewportResult.visibleRangeRequest.reason,
        requestSource: viewportResult.visibleRangeRequest.source,
        renderWindowNodeCount: renderModel.renderWindowNodeCount,
        renderWindowSections: getStoreBackedRenderWindowSections(renderModel).map((section) => section.id),
        source: viewportResult.source,
        visibleNodeCount: viewportState.runtimeCache.visibleNodeCount,
        visibleRangeSections: viewportState.runtimeCache.visibleRange.sectionIds,
        viewportHeight: viewportResult.viewport.viewportHeight,
        viewportScrollTop: viewportResult.viewport.scrollTop,
        preservedAnchorNodeId: preservedViewport.visibleRangeRequest.anchorNodeId,
        preservedFromReason: preservedViewport.visibleRangeRequest.preservedFromReason,
        preservedRequestReason: preservedViewport.visibleRangeRequest.reason,
        preservedResult: preservedViewport.preserved,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      mode: string
      preserved: boolean
      preservedAnchorNodeId: string
      preservedFromReason: string
      preservedRequestReason: string
      preservedResult: boolean
      renderWindowNodeCount: number
      renderWindowSections: string[]
      requestBudget: { maxNodes: number; mode: string }
      requestReason: string
      requestSource: string
      source: string
      viewportHeight: number
      viewportScrollTop: number
      visibleNodeCount: number
      visibleRangeSections: string[]
    }

    expect(result.source).toBe("flowdoc-viewport-controller")
    expect(result.mode).toBe("viewport-range-request")
    expect(result.preserved).toBe(false)
    expect(result.requestSource).toBe("flowdoc-visible-range-request")
    expect(result.requestReason).toBe("viewport")
    expect(result.requestBudget).toEqual({ maxNodes: 5, mode: "viewport" })
    expect(result.visibleRangeSections).toEqual(["section-body"])
    expect(result.visibleNodeCount).toBe(5)
    expect(result.renderWindowSections).toEqual(["section-body"])
    expect(result.renderWindowNodeCount).toBe(5)
    expect(result.viewportHeight).toBe(720)
    expect(result.viewportScrollTop).toBe(1440)
    expect(result.preservedResult).toBe(true)
    expect(result.preservedRequestReason).toBe("viewport-preserved")
    expect(result.preservedFromReason).toBe("draft")
    expect(result.preservedAnchorNodeId).toBe("cover-title")
  })

  it("measures viewport section shells before scroll binding is wired", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import { readFileSync } from "node:fs";
      const {
        createBootRuntimeState,
        createVisibleRangeRuntimeState,
      } = await import("./public/runtimeCache.js");
      const {
        createViewportFactsFromMeasurement,
        createViewportMeasurement,
        resolveMeasuredViewportRangeRequest,
      } = await import("./public/viewportMeasurement.js");
      const {
        createStoreBackedRenderModel,
        getStoreBackedRenderWindowSections,
      } = await import("./public/renderModel.js");
      const snapshot = JSON.parse(readFileSync("./public/sandbox-snapshot.json", "utf8"));
      const bootState = createBootRuntimeState(snapshot);
      const measurement = createViewportMeasurement({
        measuredAtRevision: bootState.runtimeCache.documentRevision,
        scrollHeight: 2600,
        scrollTop: 1450,
        viewportHeight: 600,
        sections: [
          { id: "section-cover", rendered: false, shellState: "placeholder", top: 0, height: 700 },
          { id: "section-toc", rendered: false, shellState: "placeholder", top: 760, height: 700 },
          { id: "section-body", rendered: true, shellState: "rendered", top: 1520, height: 900 },
        ],
      });
      const viewportFacts = createViewportFactsFromMeasurement({
        budget: { mode: "viewport", maxNodes: 6 },
        measurement,
      });
      const measuredRequest = resolveMeasuredViewportRangeRequest({
        budget: { mode: "viewport", maxNodes: 6 },
        measurement,
      }, bootState.runtimeCache.visibleRangeRequest);
      const viewportState = createVisibleRangeRuntimeState(
        snapshot,
        bootState.runtimeCache,
        measuredRequest.viewportResult.visibleRangeRequest,
      );
      const renderModel = createStoreBackedRenderModel(viewportState.snapshot, viewportState.runtimeCache);
      console.log(JSON.stringify({
        anchorSectionId: measurement.anchorSectionId,
        factsAnchorSectionId: viewportFacts.anchorSectionId,
        measuredAtRevision: measurement.measuredAtRevision,
        mode: measurement.mode,
        requestReason: measuredRequest.viewportResult.visibleRangeRequest.reason,
        requestSource: measuredRequest.viewportResult.visibleRangeRequest.source,
        requestBudget: measuredRequest.viewportResult.visibleRangeRequest.budget,
        renderedBodyCoverage: measurement.sections.find((section) => section.id === "section-body").visibleHeight,
        source: measurement.source,
        visibleSectionIds: measurement.visibleSectionIds,
        viewportResultSource: measuredRequest.viewportResult.source,
        visibleRangeSections: viewportState.runtimeCache.visibleRange.sectionIds,
        renderWindowSections: getStoreBackedRenderWindowSections(renderModel).map((section) => section.id),
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      anchorSectionId: string
      factsAnchorSectionId: string
      measuredAtRevision: number
      mode: string
      renderedBodyCoverage: number
      requestBudget: { maxNodes: number; mode: string }
      requestReason: string
      requestSource: string
      renderWindowSections: string[]
      source: string
      viewportResultSource: string
      visibleRangeSections: string[]
      visibleSectionIds: string[]
    }

    expect(result.source).toBe("flowdoc-viewport-measurement")
    expect(result.mode).toBe("section-shell-measurement")
    expect(result.anchorSectionId).toBe("section-body")
    expect(result.factsAnchorSectionId).toBe("section-body")
    expect(result.measuredAtRevision).toBe(0)
    expect(result.visibleSectionIds).toEqual(["section-toc", "section-body"])
    expect(result.renderedBodyCoverage).toBe(530)
    expect(result.viewportResultSource).toBe("flowdoc-viewport-controller")
    expect(result.requestSource).toBe("flowdoc-visible-range-request")
    expect(result.requestReason).toBe("viewport")
    expect(result.requestBudget).toEqual({ maxNodes: 6, mode: "viewport" })
    expect(result.visibleRangeSections).toEqual(["section-body"])
    expect(result.renderWindowSections).toEqual(["section-body"])
  })

  it("manually applies viewport measurements through the visible range path", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import { readFileSync } from "node:fs";
      const {
        createBootRuntimeState,
        createVisibleRangeRuntimeState,
      } = await import("./public/runtimeCache.js");
      const {
        createViewportMeasurement,
        createViewportMeasurementApplyRequest,
      } = await import("./public/viewportMeasurement.js");
      const {
        createStoreBackedRenderModel,
        getStoreBackedRenderShellSections,
        getStoreBackedRenderWindowSections,
      } = await import("./public/renderModel.js");
      const snapshot = JSON.parse(readFileSync("./public/sandbox-snapshot.json", "utf8"));
      const bootState = createBootRuntimeState(snapshot);
      const measurement = createViewportMeasurement({
        scrollHeight: 2600,
        scrollTop: 1450,
        viewportHeight: 600,
        sections: [
          { id: "section-cover", rendered: true, shellState: "rendered", top: 0, height: 700 },
          { id: "section-toc", rendered: false, shellState: "placeholder", top: 760, height: 700 },
          { id: "section-body", rendered: false, shellState: "placeholder", top: 1520, height: 900 },
        ],
      });
      const applyRequest = createViewportMeasurementApplyRequest({
        budget: { mode: "viewport", maxNodes: 6 },
        measurement,
      }, bootState.runtimeCache.visibleRangeRequest);
      const appliedState = createVisibleRangeRuntimeState(
        snapshot,
        bootState.runtimeCache,
        applyRequest.visibleRangeRequest,
      );
      const renderModel = createStoreBackedRenderModel(appliedState.snapshot, appliedState.runtimeCache);
      console.log(JSON.stringify({
        anchorSectionId: applyRequest.anchorSectionId,
        applyMode: applyRequest.mode,
        applySource: applyRequest.source,
        bootSections: bootState.runtimeCache.visibleRange.sectionIds,
        preserved: applyRequest.preserved,
        renderShellStates: getStoreBackedRenderShellSections(renderModel).map((section) => ({
          id: section.id,
          rendered: section.rendered,
        })),
        renderWindowSections: getStoreBackedRenderWindowSections(renderModel).map((section) => section.id),
        requestReason: applyRequest.visibleRangeRequest.reason,
        requestSource: applyRequest.visibleRangeRequest.source,
        requestBudget: applyRequest.visibleRangeRequest.budget,
        visibleNodeCount: appliedState.runtimeCache.visibleNodeCount,
        visibleRangeSections: appliedState.runtimeCache.visibleRange.sectionIds,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      anchorSectionId: string
      applyMode: string
      applySource: string
      bootSections: string[]
      preserved: boolean
      renderShellStates: Array<{ id: string; rendered: boolean }>
      renderWindowSections: string[]
      requestBudget: { maxNodes: number; mode: string }
      requestReason: string
      requestSource: string
      visibleNodeCount: number
      visibleRangeSections: string[]
    }

    expect(result.applySource).toBe("flowdoc-viewport-measurement")
    expect(result.applyMode).toBe("manual-measurement-apply")
    expect(result.anchorSectionId).toBe("section-body")
    expect(result.preserved).toBe(false)
    expect(result.bootSections).toEqual(["section-cover"])
    expect(result.requestSource).toBe("flowdoc-visible-range-request")
    expect(result.requestReason).toBe("viewport")
    expect(result.requestBudget).toEqual({ maxNodes: 6, mode: "viewport" })
    expect(result.visibleRangeSections).toEqual(["section-body"])
    expect(result.visibleNodeCount).toBe(6)
    expect(result.renderWindowSections).toEqual(["section-body"])
    expect(result.renderShellStates).toEqual([
      { id: "section-cover", rendered: false },
      { id: "section-toc", rendered: false },
      { id: "section-body", rendered: true },
    ])
  })

  it("settles viewport scroll through the measurement apply path", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import { readFileSync } from "node:fs";
      const {
        createBootRuntimeState,
        createVisibleRangeRuntimeState,
      } = await import("./public/runtimeCache.js");
      const {
        createViewportMeasurement,
      } = await import("./public/viewportMeasurement.js");
      const {
        createViewportScrollControllerState,
        recordViewportScroll,
        settleViewportScroll,
      } = await import("./public/viewportScrollController.js");
      const {
        createStoreBackedRenderModel,
        getStoreBackedRenderShellSections,
        getStoreBackedRenderWindowSections,
      } = await import("./public/renderModel.js");
      const snapshot = JSON.parse(readFileSync("./public/sandbox-snapshot.json", "utf8"));
      const bootState = createBootRuntimeState(snapshot);
      const measurement = createViewportMeasurement({
        scrollHeight: 2600,
        scrollTop: 1450,
        viewportHeight: 600,
        sections: [
          { id: "section-cover", rendered: true, shellState: "rendered", top: 0, height: 700 },
          { id: "section-toc", rendered: false, shellState: "placeholder", top: 760, height: 700 },
          { id: "section-body", rendered: false, shellState: "placeholder", top: 1520, height: 900 },
        ],
      });
      const controller = createViewportScrollControllerState({ debounceMs: 180 });
      const pending = recordViewportScroll(controller, {
        measurement,
        scrollTop: measurement.scrollTop,
      });
      const settled = settleViewportScroll(pending, {
        budget: { mode: "viewport", maxNodes: 6 },
        measurement,
        previousRequest: bootState.runtimeCache.visibleRangeRequest,
      });
      const appliedState = createVisibleRangeRuntimeState(
        snapshot,
        bootState.runtimeCache,
        settled.applyRequest.visibleRangeRequest,
      );
      const renderModel = createStoreBackedRenderModel(appliedState.snapshot, appliedState.runtimeCache);
      const draftPending = recordViewportScroll(settled.scrollController, { measurement });
      const draftSkipped = settleViewportScroll(draftPending, {
        draftActive: true,
        measurement,
        previousRequest: appliedState.runtimeCache.visibleRangeRequest,
      });
      const imePending = recordViewportScroll(settled.scrollController, { measurement });
      const imeSkipped = settleViewportScroll(imePending, {
        draftActive: true,
        isComposing: true,
        measurement,
        previousRequest: appliedState.runtimeCache.visibleRangeRequest,
      });
      console.log(JSON.stringify({
        applyMode: settled.applyRequest.mode,
        applySource: settled.applyRequest.source,
        bootSections: bootState.runtimeCache.visibleRange.sectionIds,
        controllerMode: controller.mode,
        controllerSource: controller.source,
        debounceMs: controller.debounceMs,
        draftApplyRequest: draftSkipped.applyRequest,
        draftSkippedReason: draftSkipped.scrollController.lastSkippedReason,
        draftStatus: draftSkipped.scrollController.status,
        imeApplyRequest: imeSkipped.applyRequest,
        imeSkippedReason: imeSkipped.scrollController.lastSkippedReason,
        imeStatus: imeSkipped.scrollController.status,
        lastAppliedAnchorSectionId: settled.scrollController.lastAppliedAnchorSectionId,
        lastSettledEventCount: settled.scrollController.lastSettledEventCount,
        pendingEventCount: pending.eventCount,
        pendingStatus: pending.status,
        renderShellStates: getStoreBackedRenderShellSections(renderModel).map((section) => ({
          id: section.id,
          rendered: section.rendered,
        })),
        renderWindowSections: getStoreBackedRenderWindowSections(renderModel).map((section) => section.id),
        requestReason: settled.applyRequest.visibleRangeRequest.reason,
        requestSource: settled.applyRequest.visibleRangeRequest.source,
        settledAppliedCount: settled.scrollController.appliedCount,
        settledPending: settled.scrollController.pending,
        settledStatus: settled.scrollController.status,
        visibleRangeSections: appliedState.runtimeCache.visibleRange.sectionIds,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      applyMode: string
      applySource: string
      bootSections: string[]
      controllerMode: string
      controllerSource: string
      debounceMs: number
      draftApplyRequest: null
      draftSkippedReason: string
      draftStatus: string
      imeApplyRequest: null
      imeSkippedReason: string
      imeStatus: string
      lastAppliedAnchorSectionId: string
      lastSettledEventCount: number
      pendingEventCount: number
      pendingStatus: string
      renderShellStates: Array<{ id: string; rendered: boolean }>
      renderWindowSections: string[]
      requestReason: string
      requestSource: string
      settledAppliedCount: number
      settledPending: boolean
      settledStatus: string
      visibleRangeSections: string[]
    }

    expect(result.controllerSource).toBe("flowdoc-viewport-scroll-controller")
    expect(result.controllerMode).toBe("debounced-measurement-apply")
    expect(result.debounceMs).toBe(180)
    expect(result.pendingStatus).toBe("pending")
    expect(result.pendingEventCount).toBe(1)
    expect(result.settledStatus).toBe("applied")
    expect(result.settledPending).toBe(false)
    expect(result.settledAppliedCount).toBe(1)
    expect(result.lastSettledEventCount).toBe(1)
    expect(result.applySource).toBe("flowdoc-viewport-measurement")
    expect(result.applyMode).toBe("manual-measurement-apply")
    expect(result.lastAppliedAnchorSectionId).toBe("section-body")
    expect(result.bootSections).toEqual(["section-cover"])
    expect(result.requestSource).toBe("flowdoc-visible-range-request")
    expect(result.requestReason).toBe("viewport")
    expect(result.visibleRangeSections).toEqual(["section-body"])
    expect(result.renderWindowSections).toEqual(["section-body"])
    expect(result.renderShellStates).toEqual([
      { id: "section-cover", rendered: false },
      { id: "section-toc", rendered: false },
      { id: "section-body", rendered: true },
    ])
    expect(result.draftStatus).toBe("skipped")
    expect(result.draftSkippedReason).toBe("draft-active")
    expect(result.draftApplyRequest).toBeNull()
    expect(result.imeStatus).toBe("skipped")
    expect(result.imeSkippedReason).toBe("composition-active")
    expect(result.imeApplyRequest).toBeNull()
  })

  it("restores viewport scroll from section anchors", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      const {
        createViewportMeasurement,
      } = await import("./public/viewportMeasurement.js");
      const {
        createViewportSectionAnchor,
        resolveViewportSectionAnchorScrollTop,
      } = await import("./public/viewportAnchor.js");
      const firstMeasurement = createViewportMeasurement({
        scrollHeight: 2600,
        scrollTop: 1700,
        viewportHeight: 600,
        sections: [
          { id: "section-cover", rendered: true, shellState: "rendered", top: 0, height: 700 },
          { id: "section-toc", rendered: false, shellState: "placeholder", top: 760, height: 700 },
          { id: "section-body", rendered: false, shellState: "placeholder", top: 1520, height: 900 },
        ],
      });
      const anchor = createViewportSectionAnchor({ measurement: firstMeasurement });
      const shiftedMeasurement = createViewportMeasurement({
        scrollHeight: 3000,
        scrollTop: 0,
        viewportHeight: 600,
        sections: [
          { id: "section-cover", rendered: false, shellState: "placeholder", top: 0, height: 700 },
          { id: "section-toc", rendered: false, shellState: "placeholder", top: 840, height: 700 },
          { id: "section-body", rendered: true, shellState: "rendered", top: 1660, height: 1100 },
        ],
      });
      const restored = resolveViewportSectionAnchorScrollTop({
        anchor,
        fallbackScrollTop: firstMeasurement.scrollTop,
        measurement: shiftedMeasurement,
      });
      const missingMeasurement = createViewportMeasurement({
        scrollHeight: 1800,
        scrollTop: 0,
        viewportHeight: 600,
        sections: [
          { id: "section-cover", rendered: true, shellState: "rendered", top: 0, height: 700 },
        ],
      });
      const missing = resolveViewportSectionAnchorScrollTop({
        anchor,
        fallbackScrollTop: 2400,
        measurement: missingMeasurement,
      });
      console.log(JSON.stringify({
        anchorKind: anchor.kind,
        anchorMode: anchor.mode,
        anchorOffset: anchor.offsetInSection,
        anchorSectionId: anchor.sectionId,
        anchorSource: anchor.source,
        missingReason: missing.reason,
        missingRestored: missing.restored,
        missingScrollTop: missing.scrollTop,
        restoreMode: restored.mode,
        restoreReason: restored.reason,
        restoreScrollTop: restored.scrollTop,
        restoreSource: restored.source,
        restored: restored.restored,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      anchorKind: string
      anchorMode: string
      anchorOffset: number
      anchorSectionId: string
      anchorSource: string
      missingReason: string
      missingRestored: boolean
      missingScrollTop: number
      restoreMode: string
      restoreReason: string
      restoreScrollTop: number
      restoreSource: string
      restored: boolean
    }

    expect(result.anchorSource).toBe("flowdoc-viewport-anchor")
    expect(result.anchorMode).toBe("section-shell-anchor")
    expect(result.anchorKind).toBe("section")
    expect(result.anchorSectionId).toBe("section-body")
    expect(result.anchorOffset).toBe(180)
    expect(result.restoreSource).toBe("flowdoc-viewport-anchor")
    expect(result.restoreMode).toBe("section-shell-anchor-restore")
    expect(result.restoreReason).toBe("section-anchor")
    expect(result.restored).toBe(true)
    expect(result.restoreScrollTop).toBe(1840)
    expect(result.missingReason).toBe("section-missing")
    expect(result.missingRestored).toBe(false)
    expect(result.missingScrollTop).toBe(1200)
  })

  it("restores viewport scroll from node-aware anchors", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      const {
        createViewportMeasurement,
      } = await import("./public/viewportMeasurement.js");
      const {
        createViewportNodeAnchor,
        resolveViewportNodeAnchorScrollTop,
      } = await import("./public/viewportNodeAnchor.js");
      const anchor = createViewportNodeAnchor({
        measuredAtRevision: 8,
        nodeHeight: 44,
        nodeId: "body-metrics-table",
        nodeTop: 1900,
        nodeType: "table",
        scrollTop: 1700,
        sectionId: "section-body",
        sectionTop: 1520,
        viewportHeight: 600,
      });
      const shiftedMeasurement = createViewportMeasurement({
        measuredAtRevision: 9,
        scrollHeight: 3600,
        scrollTop: 0,
        viewportHeight: 600,
        sections: [
          { id: "section-cover", rendered: false, shellState: "placeholder", top: 0, height: 700 },
          { id: "section-body", rendered: true, shellState: "rendered", top: 1680, height: 1400 },
        ],
      });
      const restored = resolveViewportNodeAnchorScrollTop({
        anchor,
        fallbackScrollTop: 1700,
        measurement: shiftedMeasurement,
      });
      const missingMeasurement = createViewportMeasurement({
        scrollHeight: 1800,
        scrollTop: 0,
        viewportHeight: 600,
        sections: [
          { id: "section-cover", rendered: true, shellState: "rendered", top: 0, height: 700 },
        ],
      });
      const missing = resolveViewportNodeAnchorScrollTop({
        anchor,
        fallbackScrollTop: 2400,
        measurement: missingMeasurement,
      });
      console.log(JSON.stringify({
        anchorKind: anchor.kind,
        anchorMode: anchor.mode,
        anchorNodeId: anchor.nodeId,
        anchorNodeType: anchor.nodeType,
        anchorOffset: anchor.offsetInSection,
        anchorSectionId: anchor.sectionId,
        anchorSource: anchor.source,
        missingReason: missing.reason,
        missingRestored: missing.restored,
        missingScrollTop: missing.scrollTop,
        restoreMode: restored.mode,
        restoreReason: restored.reason,
        restoreScrollTop: restored.scrollTop,
        restoreSource: restored.source,
        restored: restored.restored,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      anchorKind: string
      anchorMode: string
      anchorNodeId: string
      anchorNodeType: string
      anchorOffset: number
      anchorSectionId: string
      anchorSource: string
      missingReason: string
      missingRestored: boolean
      missingScrollTop: number
      restoreMode: string
      restoreReason: string
      restoreScrollTop: number
      restoreSource: string
      restored: boolean
    }

    expect(result.anchorSource).toBe("flowdoc-viewport-node-anchor")
    expect(result.anchorMode).toBe("node-aware-scroll-anchor")
    expect(result.anchorKind).toBe("node")
    expect(result.anchorNodeId).toBe("body-metrics-table")
    expect(result.anchorNodeType).toBe("table")
    expect(result.anchorSectionId).toBe("section-body")
    expect(result.anchorOffset).toBe(380)
    expect(result.restoreSource).toBe("flowdoc-viewport-node-anchor")
    expect(result.restoreMode).toBe("node-aware-anchor-restore")
    expect(result.restoreReason).toBe("node-anchor")
    expect(result.restored).toBe(true)
    expect(result.restoreScrollTop).toBe(2060)
    expect(result.missingReason).toBe("section-missing")
    expect(result.missingRestored).toBe(false)
    expect(result.missingScrollTop).toBe(1200)
  })

  it("preserves measured section spacer heights over placeholder estimates", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      const {
        createViewportMeasurement,
      } = await import("./public/viewportMeasurement.js");
      const {
        createViewportSectionSpacerMap,
        resolveViewportSectionSpacer,
      } = await import("./public/viewportSectionSpacers.js");
      const bootMeasurement = createViewportMeasurement({
        scrollHeight: 2400,
        scrollTop: 0,
        viewportHeight: 600,
        sections: [
          { id: "section-cover", rendered: true, shellState: "rendered", top: 0, height: 735 },
          { id: "section-toc", rendered: false, shellState: "placeholder", top: 760, height: 720 },
          { id: "section-body", rendered: false, shellState: "placeholder", top: 1520, height: 720 },
        ],
      });
      const bootSpacers = createViewportSectionSpacerMap({ measurement: bootMeasurement });
      const bodyRenderedMeasurement = createViewportMeasurement({
        scrollHeight: 3000,
        scrollTop: 1500,
        viewportHeight: 600,
        sections: [
          { id: "section-cover", rendered: false, shellState: "placeholder", top: 0, height: 720 },
          { id: "section-toc", rendered: false, shellState: "placeholder", top: 760, height: 720 },
          { id: "section-body", rendered: true, shellState: "rendered", top: 1520, height: 1180 },
        ],
      });
      const measuredSpacers = createViewportSectionSpacerMap({
        measurement: bodyRenderedMeasurement,
        previousSpacers: bootSpacers,
      });
      const bodyPlaceholderMeasurement = createViewportMeasurement({
        scrollHeight: 2400,
        scrollTop: 0,
        viewportHeight: 600,
        sections: [
          { id: "section-cover", rendered: true, shellState: "rendered", top: 0, height: 735 },
          { id: "section-toc", rendered: false, shellState: "placeholder", top: 760, height: 720 },
          { id: "section-body", rendered: false, shellState: "placeholder", top: 1520, height: 720 },
        ],
      });
      const preservedSpacers = createViewportSectionSpacerMap({
        measurement: bodyPlaceholderMeasurement,
        previousSpacers: measuredSpacers,
      });
      const bodySpacer = resolveViewportSectionSpacer(preservedSpacers, "section-body");
      const tocSpacer = resolveViewportSectionSpacer(preservedSpacers, "section-toc");
      const missingSpacer = resolveViewportSectionSpacer(preservedSpacers, "section-missing");
      console.log(JSON.stringify({
        bodyHeight: bodySpacer.height,
        bodyReason: bodySpacer.reason,
        estimatedSectionCount: preservedSpacers.estimatedSectionCount,
        measuredSectionCount: preservedSpacers.measuredSectionCount,
        missingHeight: missingSpacer.height,
        missingReason: missingSpacer.reason,
        mode: preservedSpacers.mode,
        sectionCount: preservedSpacers.sectionCount,
        source: preservedSpacers.source,
        tocHeight: tocSpacer.height,
        tocReason: tocSpacer.reason,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      bodyHeight: number
      bodyReason: string
      estimatedSectionCount: number
      measuredSectionCount: number
      missingHeight: number
      missingReason: string
      mode: string
      sectionCount: number
      source: string
      tocHeight: number
      tocReason: string
    }

    expect(result.source).toBe("flowdoc-section-spacer")
    expect(result.mode).toBe("measured-section-spacer")
    expect(result.sectionCount).toBe(3)
    expect(result.measuredSectionCount).toBe(2)
    expect(result.estimatedSectionCount).toBe(1)
    expect(result.bodyHeight).toBe(1180)
    expect(result.bodyReason).toBe("measured")
    expect(result.tocHeight).toBe(720)
    expect(result.tocReason).toBe("estimated")
    expect(result.missingHeight).toBe(720)
    expect(result.missingReason).toBe("default")
  })

  it("predicts viewport coverage from section offset intervals", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      const {
        createViewportMeasurement,
      } = await import("./public/viewportMeasurement.js");
      const {
        createViewportSectionSpacerMap,
      } = await import("./public/viewportSectionSpacers.js");
      const {
        createViewportSectionOffsetIndex,
        predictViewportFromSectionOffsets,
        resolveViewportSectionOffset,
      } = await import("./public/viewportSectionOffsets.js");
      const measurement = createViewportMeasurement({
        scrollHeight: 6200,
        scrollTop: 3200,
        viewportHeight: 700,
        sections: [
          { id: "section-cover", rendered: true, shellState: "rendered", top: 0, height: 831 },
          { id: "section-toc", rendered: false, shellState: "placeholder", top: 849, height: 720 },
          { id: "section-body", rendered: true, shellState: "rendered", top: 1587, height: 4200 },
        ],
      });
      const spacerMap = createViewportSectionSpacerMap({ measurement });
      const offsetIndex = createViewportSectionOffsetIndex({
        sectionGap: 18,
        spacerMap,
      });
      const bodyOffset = resolveViewportSectionOffset(offsetIndex, "section-body");
      const missingOffset = resolveViewportSectionOffset(offsetIndex, "section-missing");
      const prediction = predictViewportFromSectionOffsets({
        offsetIndex,
        scrollTop: 3200,
        viewportHeight: 700,
      });
      const boundaryPrediction = predictViewportFromSectionOffsets({
        offsetIndex,
        scrollTop: 820,
        viewportHeight: 90,
      });
      const bodyVisible = prediction.visibleSections.find((section) => section.sectionId === "section-body");
      console.log(JSON.stringify({
        anchorOffsetInSection: prediction.anchorOffsetInSection,
        anchorSectionId: prediction.anchorSectionId,
        bodyBottom: bodyOffset.bottom,
        bodyCoveragePx: bodyVisible.coveragePx,
        bodyCoverageRatio: bodyVisible.coverageRatio,
        bodyOffsetInSection: bodyVisible.offsetInSection,
        bodyTop: bodyOffset.top,
        boundaryAnchorSectionId: boundaryPrediction.anchorSectionId,
        boundaryPredictedSectionIds: boundaryPrediction.predictedSectionIds,
        mode: offsetIndex.mode,
        missingOffset,
        predictedSectionIds: prediction.predictedSectionIds,
        predictionMode: prediction.mode,
        sectionCount: offsetIndex.sectionCount,
        source: offsetIndex.source,
        totalHeight: offsetIndex.totalHeight,
        viewportCoverageRatio: bodyVisible.viewportCoverageRatio,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      anchorOffsetInSection: number
      anchorSectionId: string
      bodyBottom: number
      bodyCoveragePx: number
      bodyCoverageRatio: number
      bodyOffsetInSection: number
      bodyTop: number
      boundaryAnchorSectionId: string
      boundaryPredictedSectionIds: string[]
      mode: string
      missingOffset: null
      predictedSectionIds: string[]
      predictionMode: string
      sectionCount: number
      source: string
      totalHeight: number
      viewportCoverageRatio: number
    }

    expect(result.source).toBe("flowdoc-section-offset-index")
    expect(result.mode).toBe("section-spacer-offset-index")
    expect(result.predictionMode).toBe("section-offset-viewport-prediction")
    expect(result.sectionCount).toBe(3)
    expect(result.bodyTop).toBe(1587)
    expect(result.bodyBottom).toBe(5787)
    expect(result.totalHeight).toBe(5787)
    expect(result.anchorSectionId).toBe("section-body")
    expect(result.anchorOffsetInSection).toBe(1613)
    expect(result.bodyOffsetInSection).toBe(1613)
    expect(result.bodyCoveragePx).toBe(700)
    expect(result.bodyCoverageRatio).toBeCloseTo(700 / 4200)
    expect(result.viewportCoverageRatio).toBe(1)
    expect(result.predictedSectionIds).toEqual(["section-body"])
    expect(result.boundaryPredictedSectionIds).toEqual(["section-cover", "section-toc"])
    expect(result.boundaryAnchorSectionId).toBe("section-toc")
    expect(result.missingOffset).toBeNull()
  })

  it("builds a virtual section stack from render shell offsets", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      const {
        createRenderShell,
      } = await import("./public/renderShell.js");
      const {
        createViewportVirtualStack,
      } = await import("./public/viewportVirtualStack.js");
      const sections = [
        { id: "section-cover", page: "1" },
        { id: "section-toc", page: "2" },
        { id: "section-body", page: "3" },
        { id: "section-appendix", page: "4" },
      ];
      const renderShell = createRenderShell({
        renderWindow: {
          anchorSectionId: "section-toc",
          sectionIds: ["section-toc", "section-body"],
        },
        sections,
      });
      const offsetIndex = {
        mode: "section-spacer-offset-index",
        sectionGap: 18,
        sections: [
          { bottom: 831, height: 831, index: 0, sectionId: "section-cover", top: 0 },
          { bottom: 1569, height: 720, index: 1, sectionId: "section-toc", top: 849 },
          { bottom: 5787, height: 4200, index: 2, sectionId: "section-body", top: 1587 },
          { bottom: 6605, height: 800, index: 3, sectionId: "section-appendix", top: 5805 },
        ],
        source: "flowdoc-section-offset-index",
        totalHeight: 6605,
      };
      const stack = createViewportVirtualStack({ offsetIndex, renderShell });
      const fallback = createViewportVirtualStack({ renderShell });

      console.log(JSON.stringify({
        bottomSpacerHeight: stack.bottomSpacerHeight,
        fallbackMountedSectionCount: fallback.mountedSectionCount,
        fallbackReason: fallback.reason,
        fallbackVirtualized: fallback.virtualized,
        itemTypes: stack.items.map((item) => item.type),
        mode: stack.mode,
        mountedSectionCount: stack.mountedSectionCount,
        mountedSectionIds: stack.mountedSectionIds,
        reason: stack.reason,
        sectionCount: stack.sectionCount,
        source: stack.source,
        spacerCount: stack.spacerCount,
        spacerSectionIds: stack.items.filter((item) => item.type === "spacer").map((item) => item.sectionIds),
        topSpacerHeight: stack.topSpacerHeight,
        virtualized: stack.virtualized,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      bottomSpacerHeight: number
      fallbackMountedSectionCount: number
      fallbackReason: string
      fallbackVirtualized: boolean
      itemTypes: string[]
      mode: string
      mountedSectionCount: number
      mountedSectionIds: string[]
      reason: string
      sectionCount: number
      source: string
      spacerCount: number
      spacerSectionIds: string[][]
      topSpacerHeight: number
      virtualized: boolean
    }

    expect(result.source).toBe("flowdoc-viewport-virtual-stack")
    expect(result.mode).toBe("section-shell-virtual-stack")
    expect(result.sectionCount).toBe(4)
    expect(result.mountedSectionCount).toBe(2)
    expect(result.mountedSectionIds).toEqual(["section-toc", "section-body"])
    expect(result.virtualized).toBe(true)
    expect(result.reason).toBe("virtualized-section-shell")
    expect(result.itemTypes).toEqual(["spacer", "section", "section", "spacer"])
    expect(result.spacerCount).toBe(2)
    expect(result.spacerSectionIds).toEqual([["section-cover"], ["section-appendix"]])
    expect(result.topSpacerHeight).toBe(831)
    expect(result.bottomSpacerHeight).toBe(800)
    expect(result.fallbackVirtualized).toBe(false)
    expect(result.fallbackReason).toBe("offset-index-missing")
    expect(result.fallbackMountedSectionCount).toBe(4)
  })

  it("plans lazy heavy detail without deferring active node paths", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      const {
        createViewportLazyDetailPlan,
      } = await import("./public/viewportLazyDetail.js");
      const nodes = [
        { id: "zone-body", type: "zone" },
        { id: "body-metrics-table", type: "table" },
        { id: "body-row-1", type: "table-row" },
        { id: "body-cell-1", type: "table-cell" },
        { id: "body-cell-text", type: "text-block", textLength: 12, textPreview: "Metric" },
        { id: "cover-meta-columns", type: "columns" },
        { id: "cover-meta-left", type: "column" },
        { id: "cover-meta-text", type: "text-block", textLength: 18, textPreview: "Prepared by team" },
      ];
      const nodeById = new Map(nodes.map((node) => [node.id, node]));
      const childrenById = new Map([
        ["zone-body", ["body-metrics-table", "cover-meta-columns"]],
        ["body-metrics-table", ["body-row-1"]],
        ["body-row-1", ["body-cell-1"]],
        ["body-cell-1", ["body-cell-text"]],
        ["body-cell-text", []],
        ["cover-meta-columns", ["cover-meta-left"]],
        ["cover-meta-left", ["cover-meta-text"]],
        ["cover-meta-text", []],
      ]);
      const parentById = new Map([
        ["body-metrics-table", "zone-body"],
        ["body-row-1", "body-metrics-table"],
        ["body-cell-1", "body-row-1"],
        ["body-cell-text", "body-cell-1"],
        ["cover-meta-columns", "zone-body"],
        ["cover-meta-left", "cover-meta-columns"],
        ["cover-meta-text", "cover-meta-left"],
      ]);
      const inactive = createViewportLazyDetailPlan({
        childrenById,
        nodeById,
        parentById,
        visibleNodeIds: nodes.map((node) => node.id),
      });
      const activeTableChild = createViewportLazyDetailPlan({
        activeNodeIds: ["body-cell-text"],
        childrenById,
        nodeById,
        parentById,
        visibleNodeIds: nodes.map((node) => node.id),
      });
      const tableDetail = activeTableChild.detailByNodeId.get("body-metrics-table");
      const columnsDetail = activeTableChild.detailByNodeId.get("cover-meta-columns");

      console.log(JSON.stringify({
        activeColumnsDeferred: columnsDetail.deferred,
        activeColumnsReason: columnsDetail.reason,
        activeDeferredNodeIds: activeTableChild.deferredNodeIds,
        activeMaterializedNodeIds: activeTableChild.materializedHeavyNodeIds,
        activeTableDeferred: tableDetail.deferred,
        activeTableProtected: tableDetail.protectedByContext,
        activeTableReason: tableDetail.reason,
        inactiveDeferredNodeIds: inactive.deferredNodeIds,
        inactiveHeavyNodeIds: inactive.heavyNodeIds,
        mode: inactive.mode,
        source: inactive.source,
        thresholds: inactive.thresholds,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      activeColumnsDeferred: boolean
      activeColumnsReason: string
      activeDeferredNodeIds: string[]
      activeMaterializedNodeIds: string[]
      activeTableDeferred: boolean
      activeTableProtected: boolean
      activeTableReason: string
      inactiveDeferredNodeIds: string[]
      inactiveHeavyNodeIds: string[]
      mode: string
      source: string
      thresholds: {
        childCount: number
        subtreeNodeCount: number
        textLength: number
      }
    }

    expect(result.source).toBe("flowdoc-viewport-lazy-detail")
    expect(result.mode).toBe("heavy-node-detail-plan")
    expect(result.thresholds).toEqual({
      childCount: 4,
      subtreeNodeCount: 8,
      textLength: 320,
    })
    expect(result.inactiveHeavyNodeIds).toEqual(["body-metrics-table", "cover-meta-columns"])
    expect(result.inactiveDeferredNodeIds).toEqual(["body-metrics-table", "cover-meta-columns"])
    expect(result.activeTableDeferred).toBe(false)
    expect(result.activeTableProtected).toBe(true)
    expect(result.activeTableReason).toBe("table-detail")
    expect(result.activeColumnsDeferred).toBe(true)
    expect(result.activeColumnsReason).toBe("columns-detail")
    expect(result.activeMaterializedNodeIds).toEqual(["body-metrics-table"])
    expect(result.activeDeferredNodeIds).toEqual(["cover-meta-columns"])
  })

  it("plans observe-only viewport scheduler candidates from section predictions", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      const {
        createViewportMeasurement,
      } = await import("./public/viewportMeasurement.js");
      const {
        createViewportSectionSpacerMap,
      } = await import("./public/viewportSectionSpacers.js");
      const {
        createViewportSectionOffsetIndex,
        predictViewportFromSectionOffsets,
      } = await import("./public/viewportSectionOffsets.js");
      const {
        createViewportSchedulerCandidate,
      } = await import("./public/viewportSchedulerCandidate.js");
      const measurement = createViewportMeasurement({
        scrollHeight: 6200,
        scrollTop: 3200,
        viewportHeight: 700,
        sections: [
          { id: "section-cover", rendered: true, shellState: "rendered", top: 0, height: 831 },
          { id: "section-toc", rendered: false, shellState: "placeholder", top: 849, height: 720 },
          { id: "section-body", rendered: true, shellState: "rendered", top: 1587, height: 4200 },
        ],
      });
      const spacerMap = createViewportSectionSpacerMap({ measurement });
      const offsetIndex = createViewportSectionOffsetIndex({ sectionGap: 18, spacerMap });
      const prediction = predictViewportFromSectionOffsets({
        offsetIndex,
        scrollTop: 3200,
        viewportHeight: 700,
      });
      const currentRenderWindow = {
        anchorSectionId: "section-cover",
        sectionIds: ["section-cover"],
      };
      const observeCandidate = createViewportSchedulerCandidate({
        budget: { maxNodes: 80, mode: "viewport" },
        offsetIndex,
        prediction,
        previousRequest: {
          anchorSectionId: "section-cover",
          budget: { maxNodes: 80, mode: "viewport" },
          reason: "boot",
        },
        reason: "scroll-pending",
        renderWindow: currentRenderWindow,
      });
      const readyCandidate = createViewportSchedulerCandidate({
        budget: { maxNodes: 80, mode: "viewport" },
        observeOnly: false,
        offsetIndex,
        prediction,
        previousRequest: observeCandidate.request,
        renderWindow: currentRenderWindow,
      });
      const stableCandidate = createViewportSchedulerCandidate({
        observeOnly: false,
        offsetIndex,
        prediction,
        previousRequest: observeCandidate.request,
        renderWindow: {
          anchorSectionId: "section-body",
          sectionIds: ["section-toc", "section-body"],
        },
      });
      console.log(JSON.stringify({
        applyReady: observeCandidate.applyReady,
        applyState: observeCandidate.applyState,
        anchorSectionId: observeCandidate.anchorSectionId,
        candidateReason: observeCandidate.candidateReason,
        candidateSectionIds: observeCandidate.candidateSectionIds,
        confidence: observeCandidate.confidence,
        currentSectionIds: observeCandidate.currentSectionIds,
        extraSectionIds: observeCandidate.extraSectionIds,
        missingSectionIds: observeCandidate.missingSectionIds,
        mode: observeCandidate.mode,
        observeOnly: observeCandidate.observeOnly,
        readyApplyReady: readyCandidate.applyReady,
        readyApplyState: readyCandidate.applyState,
        requestAnchorSectionId: observeCandidate.request.anchorSectionId,
        requestMaxNodes: observeCandidate.request.maxNodes,
        requestReason: observeCandidate.request.reason,
        source: observeCandidate.source,
        stableApplyReady: stableCandidate.applyReady,
        stableApplyState: stableCandidate.applyState,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      applyReady: boolean
      applyState: string
      anchorSectionId: string
      candidateReason: string
      candidateSectionIds: string[]
      confidence: string
      currentSectionIds: string[]
      extraSectionIds: string[]
      missingSectionIds: string[]
      mode: string
      observeOnly: boolean
      readyApplyReady: boolean
      readyApplyState: string
      requestAnchorSectionId: string
      requestMaxNodes: number
      requestReason: string
      source: string
      stableApplyReady: boolean
      stableApplyState: string
    }

    expect(result.source).toBe("flowdoc-viewport-scheduler-candidate")
    expect(result.mode).toBe("observe-only-section-window-candidate")
    expect(result.anchorSectionId).toBe("section-body")
    expect(result.candidateReason).toBe("scroll-pending")
    expect(result.candidateSectionIds).toEqual(["section-toc", "section-body"])
    expect(result.currentSectionIds).toEqual(["section-cover"])
    expect(result.missingSectionIds).toEqual(["section-toc", "section-body"])
    expect(result.extraSectionIds).toEqual(["section-cover"])
    expect(result.confidence).toBe("mixed")
    expect(result.observeOnly).toBe(true)
    expect(result.applyReady).toBe(false)
    expect(result.applyState).toBe("observe-only")
    expect(result.requestAnchorSectionId).toBe("section-body")
    expect(result.requestMaxNodes).toBe(80)
    expect(result.requestReason).toBe("viewport")
    expect(result.readyApplyReady).toBe(true)
    expect(result.readyApplyState).toBe("ready")
    expect(result.stableApplyReady).toBe(false)
    expect(result.stableApplyState).toBe("stable")
  })

  it("gates viewport scheduler candidate apply requests before render scheduling", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      const {
        createViewportMeasurement,
      } = await import("./public/viewportMeasurement.js");
      const {
        createViewportSectionSpacerMap,
      } = await import("./public/viewportSectionSpacers.js");
      const {
        createViewportSectionOffsetIndex,
        predictViewportFromSectionOffsets,
      } = await import("./public/viewportSectionOffsets.js");
      const {
        createViewportSchedulerCandidate,
      } = await import("./public/viewportSchedulerCandidate.js");
      const {
        createViewportSchedulerApplyRequest,
      } = await import("./public/viewportSchedulerApply.js");
      const measurement = createViewportMeasurement({
        scrollHeight: 6200,
        scrollTop: 3200,
        viewportHeight: 700,
        sections: [
          { id: "section-cover", rendered: true, shellState: "rendered", top: 0, height: 831 },
          { id: "section-toc", rendered: false, shellState: "placeholder", top: 849, height: 720 },
          { id: "section-body", rendered: true, shellState: "rendered", top: 1587, height: 4200 },
        ],
      });
      const spacerMap = createViewportSectionSpacerMap({ measurement });
      const offsetIndex = createViewportSectionOffsetIndex({ sectionGap: 18, spacerMap });
      const prediction = predictViewportFromSectionOffsets({
        offsetIndex,
        scrollTop: 3200,
        viewportHeight: 700,
      });
      const readyCandidate = createViewportSchedulerCandidate({
        budget: { maxNodes: 80, mode: "viewport" },
        observeOnly: false,
        offsetIndex,
        prediction,
        previousRequest: {
          anchorSectionId: "section-cover",
          budget: { maxNodes: 80, mode: "viewport" },
          reason: "boot",
        },
        renderWindow: {
          anchorSectionId: "section-cover",
          sectionIds: ["section-cover"],
        },
      });
      const stableCandidate = createViewportSchedulerCandidate({
        observeOnly: false,
        offsetIndex,
        prediction,
        previousRequest: readyCandidate.request,
        renderWindow: {
          anchorSectionId: "section-body",
          sectionIds: ["section-toc", "section-body"],
        },
      });
      const ready = createViewportSchedulerApplyRequest({
        candidate: readyCandidate,
        documentRevision: 3,
        runtimeRevision: 3,
        trigger: "manual",
      });
      const stable = createViewportSchedulerApplyRequest({
        candidate: stableCandidate,
        documentRevision: 3,
        runtimeRevision: 3,
      });
      const draftBlocked = createViewportSchedulerApplyRequest({
        candidate: readyCandidate,
        documentRevision: 3,
        draftActive: true,
        runtimeRevision: 3,
      });
      const revisionBlocked = createViewportSchedulerApplyRequest({
        candidate: readyCandidate,
        documentRevision: 4,
        runtimeRevision: 3,
      });
      console.log(JSON.stringify({
        readyAnchorSectionId: ready.anchorSectionId,
        readyApplyReady: ready.applyReady,
        readyApplyState: ready.applyState,
        readyRequestAnchorSectionId: ready.request.anchorSectionId,
        readySource: ready.source,
        readyMode: ready.mode,
        stableApplyReady: stable.applyReady,
        stableApplyState: stable.applyState,
        stableBlockedReason: stable.blockedReason,
        draftBlockedReason: draftBlocked.blockedReason,
        revisionBlockedReason: revisionBlocked.blockedReason,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      draftBlockedReason: string
      readyAnchorSectionId: string
      readyApplyReady: boolean
      readyApplyState: string
      readyMode: string
      readyRequestAnchorSectionId: string
      readySource: string
      revisionBlockedReason: string
      stableApplyReady: boolean
      stableApplyState: string
      stableBlockedReason: string
    }

    expect(result.readySource).toBe("flowdoc-viewport-scheduler-apply")
    expect(result.readyMode).toBe("manual-candidate-apply")
    expect(result.readyAnchorSectionId).toBe("section-body")
    expect(result.readyApplyReady).toBe(true)
    expect(result.readyApplyState).toBe("ready")
    expect(result.readyRequestAnchorSectionId).toBe("section-body")
    expect(result.stableApplyReady).toBe(false)
    expect(result.stableApplyState).toBe("stable")
    expect(result.stableBlockedReason).toBe("render-window-stable")
    expect(result.draftBlockedReason).toBe("draft-active")
    expect(result.revisionBlockedReason).toBe("revision-mismatch")
  })

  it("runs viewport scheduler runtime state before automatic scheduling", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      const {
        createViewportMeasurement,
      } = await import("./public/viewportMeasurement.js");
      const {
        createViewportSectionSpacerMap,
      } = await import("./public/viewportSectionSpacers.js");
      const {
        createViewportSectionOffsetIndex,
        predictViewportFromSectionOffsets,
      } = await import("./public/viewportSectionOffsets.js");
      const {
        applyViewportSchedulerRuntimeCandidate,
        createViewportSchedulerRuntimeState,
        planViewportSchedulerRuntimeCandidate,
      } = await import("./public/viewportSchedulerRuntime.js");
      const measurement = createViewportMeasurement({
        measuredAtRevision: 9,
        scrollHeight: 6200,
        scrollTop: 3200,
        viewportHeight: 700,
        sections: [
          { id: "section-cover", rendered: true, shellState: "rendered", top: 0, height: 831 },
          { id: "section-toc", rendered: false, shellState: "placeholder", top: 849, height: 720 },
          { id: "section-body", rendered: true, shellState: "rendered", top: 1587, height: 4200 },
        ],
      });
      const spacerMap = createViewportSectionSpacerMap({ measurement });
      const offsetIndex = createViewportSectionOffsetIndex({ sectionGap: 18, spacerMap });
      const prediction = predictViewportFromSectionOffsets({
        offsetIndex,
        scrollTop: 3200,
        viewportHeight: 700,
      });
      const baseInput = {
        budget: { maxNodes: 80, mode: "viewport" },
        documentRevision: 9,
        observeOnly: false,
        offsetIndex,
        prediction,
        previousRequest: {
          anchorSectionId: "section-cover",
          budget: { maxNodes: 80, mode: "viewport" },
          reason: "boot",
        },
        renderWindow: {
          anchorSectionId: "section-cover",
          sectionIds: ["section-cover"],
        },
        runtimeRevision: 9,
      };
      const initial = createViewportSchedulerRuntimeState();
      const planned = planViewportSchedulerRuntimeCandidate(initial, baseInput);
      const readyApplied = applyViewportSchedulerRuntimeCandidate(planned, {
        documentRevision: 9,
        runtimeRevision: 9,
        trigger: "manual",
      });
      const newerPlan = planViewportSchedulerRuntimeCandidate(planned, {
        ...baseInput,
        reason: "newer-scroll",
      });
      const staleApplied = applyViewportSchedulerRuntimeCandidate(newerPlan, {
        candidate: planned.candidate,
        documentRevision: 9,
        runtimeRevision: 9,
        trigger: "manual",
      });
      const revisionStale = applyViewportSchedulerRuntimeCandidate(planned, {
        documentRevision: 10,
        runtimeRevision: 9,
        trigger: "manual",
      });
      const undecoratedApplied = applyViewportSchedulerRuntimeCandidate(planned, {
        candidate: {
          ...planned.candidate,
          schedulerRequestId: undefined,
          schedulerSequence: undefined,
          schedulerSource: undefined,
        },
        documentRevision: 9,
        runtimeRevision: 9,
        trigger: "manual",
      });
      console.log(JSON.stringify({
        initialStatus: initial.status,
        plannedCandidateRequestId: planned.candidate.schedulerRequestId,
        plannedCandidateSequence: planned.candidate.schedulerSequence,
        plannedPendingRequestId: planned.pendingRequestId,
        plannedSequence: planned.sequence,
        plannedSource: planned.source,
        plannedStatus: planned.status,
        readyApplyReady: readyApplied.apply.applyReady,
        readyApplySource: readyApplied.apply.source,
        readyLastAppliedRequestId: readyApplied.lastAppliedRequestId,
        readyStatus: readyApplied.status,
        revisionBlockedReason: revisionStale.apply.blockedReason,
        revisionStatus: revisionStale.status,
        staleBlockedReason: staleApplied.apply.blockedReason,
        staleDroppedCount: staleApplied.staleDroppedCount,
        staleStatus: staleApplied.status,
        undecoratedBlockedReason: undecoratedApplied.apply.blockedReason,
        undecoratedStatus: undecoratedApplied.status,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      initialStatus: string
      plannedCandidateRequestId: string
      plannedCandidateSequence: number
      plannedPendingRequestId: string
      plannedSequence: number
      plannedSource: string
      plannedStatus: string
      readyApplyReady: boolean
      readyApplySource: string
      readyLastAppliedRequestId: string
      readyStatus: string
      revisionBlockedReason: string
      revisionStatus: string
      staleBlockedReason: string
      staleDroppedCount: number
      staleStatus: string
      undecoratedBlockedReason: string
      undecoratedStatus: string
    }

    expect(result.initialStatus).toBe("idle")
    expect(result.plannedSource).toBe("flowdoc-viewport-scheduler-runtime")
    expect(result.plannedStatus).toBe("ready")
    expect(result.plannedSequence).toBe(1)
    expect(result.plannedCandidateSequence).toBe(1)
    expect(result.plannedCandidateRequestId).toContain("viewport-scheduler:1:")
    expect(result.plannedPendingRequestId).toBe(result.plannedCandidateRequestId)
    expect(result.readyApplySource).toBe("flowdoc-viewport-scheduler-apply")
    expect(result.readyApplyReady).toBe(true)
    expect(result.readyStatus).toBe("applied")
    expect(result.readyLastAppliedRequestId).toBe(result.plannedCandidateRequestId)
    expect(result.staleStatus).toBe("stale")
    expect(result.staleBlockedReason).toBe("stale-candidate")
    expect(result.staleDroppedCount).toBe(1)
    expect(result.revisionStatus).toBe("stale")
    expect(result.revisionBlockedReason).toBe("stale-candidate")
    expect(result.undecoratedStatus).toBe("stale")
    expect(result.undecoratedBlockedReason).toBe("stale-candidate")
  })

  it("auto-applies budgeted viewport scheduler candidates before virtualization", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      const {
        createViewportMeasurement,
      } = await import("./public/viewportMeasurement.js");
      const {
        createViewportSectionSpacerMap,
      } = await import("./public/viewportSectionSpacers.js");
      const {
        createViewportSectionOffsetIndex,
        predictViewportFromSectionOffsets,
      } = await import("./public/viewportSectionOffsets.js");
      const {
        createViewportSchedulerRuntimeState,
      } = await import("./public/viewportSchedulerRuntime.js");
      const {
        createViewportSchedulerAutomationState,
        runViewportSchedulerAutomation,
      } = await import("./public/viewportSchedulerAutomation.js");
      const measurement = createViewportMeasurement({
        measuredAtRevision: 9,
        scrollHeight: 6200,
        scrollTop: 3200,
        viewportHeight: 700,
        sections: [
          { id: "section-cover", rendered: true, shellState: "rendered", top: 0, height: 831 },
          { id: "section-toc", rendered: false, shellState: "placeholder", top: 849, height: 720 },
          { id: "section-body", rendered: true, shellState: "rendered", top: 1587, height: 4200 },
        ],
      });
      const spacerMap = createViewportSectionSpacerMap({ measurement });
      const offsetIndex = createViewportSectionOffsetIndex({ sectionGap: 18, spacerMap });
      const prediction = predictViewportFromSectionOffsets({
        offsetIndex,
        scrollTop: 3200,
        viewportHeight: 700,
      });
      const baseInput = {
        documentRevision: 9,
        offsetIndex,
        prediction,
        previousRequest: {
          anchorSectionId: "section-cover",
          budget: { maxNodes: 12, mode: "viewport" },
          reason: "boot",
        },
        renderWindow: {
          anchorSectionId: "section-cover",
          sectionIds: ["section-cover"],
        },
        runtimeRevision: 9,
        trigger: "auto",
      };
      const initialRuntime = createViewportSchedulerRuntimeState();
      const initialAutomation = createViewportSchedulerAutomationState();
      const applied = runViewportSchedulerAutomation(initialAutomation, initialRuntime, {
        ...baseInput,
        budget: { maxNodes: 12, mode: "viewport" },
      });
      const defaultBudget = runViewportSchedulerAutomation(initialAutomation, initialRuntime, {
        ...baseInput,
        budget: { mode: "viewport" },
        previousRequest: null,
      });
      const stable = runViewportSchedulerAutomation(applied, applied.runtime, {
        ...baseInput,
        budget: { maxNodes: 12, mode: "viewport" },
        renderWindow: {
          anchorSectionId: applied.runtime.candidate.anchorSectionId,
          sectionIds: applied.runtime.candidate.candidateSectionIds,
        },
      });
      const disabled = runViewportSchedulerAutomation(initialAutomation, initialRuntime, {
        ...baseInput,
        autoApplyEnabled: false,
      });
      const draftBlocked = runViewportSchedulerAutomation(initialAutomation, initialRuntime, {
        ...baseInput,
        budget: { maxNodes: 12, mode: "viewport" },
        draftActive: true,
      });

      console.log(JSON.stringify({
        appliedApplyReady: applied.apply.applyReady,
        appliedBudgetMaxNodes: applied.budget.maxNodes,
        appliedBudgetSource: applied.budget.source,
        appliedRequestBudget: applied.request.budget,
        appliedRequestReason: applied.request.reason,
        appliedRuntimeStatus: applied.runtime.status,
        appliedSource: applied.source,
        appliedStatus: applied.status,
        appliedTrigger: applied.lastTrigger,
        attemptedCount: applied.attemptedCount,
        defaultBudgetMaxNodes: defaultBudget.budget.maxNodes,
        defaultBudgetSource: defaultBudget.budget.source,
        disabledRuntimeSequence: disabled.runtime.sequence,
        disabledSkippedReason: disabled.lastSkippedReason,
        disabledStatus: disabled.status,
        draftBlockedReason: draftBlocked.apply.blockedReason,
        draftRequest: draftBlocked.request,
        draftStatus: draftBlocked.status,
        stableBlockedReason: stable.apply.blockedReason,
        stableRequest: stable.request,
        stableStatus: stable.status,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      appliedApplyReady: boolean
      appliedBudgetMaxNodes: number
      appliedBudgetSource: string
      appliedRequestBudget: { maxNodes: number; mode: string }
      appliedRequestReason: string
      appliedRuntimeStatus: string
      appliedSource: string
      appliedStatus: string
      appliedTrigger: string
      attemptedCount: number
      defaultBudgetMaxNodes: number
      defaultBudgetSource: string
      disabledRuntimeSequence: number
      disabledSkippedReason: string
      disabledStatus: string
      draftBlockedReason: string
      draftRequest: null
      draftStatus: string
      stableBlockedReason: string
      stableRequest: null
      stableStatus: string
    }

    expect(result.appliedSource).toBe("flowdoc-viewport-scheduler-automation")
    expect(result.appliedStatus).toBe("applied")
    expect(result.appliedRuntimeStatus).toBe("applied")
    expect(result.appliedApplyReady).toBe(true)
    expect(result.appliedRequestReason).toBe("viewport")
    expect(result.appliedRequestBudget).toEqual({ maxNodes: 12, mode: "viewport" })
    expect(result.appliedBudgetMaxNodes).toBe(12)
    expect(result.appliedBudgetSource).toBe("input")
    expect(result.appliedTrigger).toBe("auto")
    expect(result.attemptedCount).toBe(1)
    expect(result.defaultBudgetMaxNodes).toBe(80)
    expect(result.defaultBudgetSource).toBe("default")
    expect(result.stableStatus).toBe("stable")
    expect(result.stableBlockedReason).toBe("render-window-stable")
    expect(result.stableRequest).toBeNull()
    expect(result.disabledStatus).toBe("skipped")
    expect(result.disabledSkippedReason).toBe("automation-disabled")
    expect(result.disabledRuntimeSequence).toBe(0)
    expect(result.draftStatus).toBe("blocked")
    expect(result.draftBlockedReason).toBe("draft-active")
    expect(result.draftRequest).toBeNull()
  })

  it("audits large-document viewport behavior across scheduler, virtualization, lazy detail, and node anchors", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      const {
        createVisibleRange,
      } = await import("./public/visibleRange.js");
      const {
        createRenderWindow,
      } = await import("./public/renderWindow.js");
      const {
        createRenderShell,
      } = await import("./public/renderShell.js");
      const {
        createViewportVirtualStack,
      } = await import("./public/viewportVirtualStack.js");
      const {
        createViewportLazyDetailPlan,
      } = await import("./public/viewportLazyDetail.js");
      const {
        createViewportSchedulerRuntimeState,
      } = await import("./public/viewportSchedulerRuntime.js");
      const {
        createViewportSchedulerAutomationState,
        runViewportSchedulerAutomation,
      } = await import("./public/viewportSchedulerAutomation.js");
      const {
        predictViewportFromSectionOffsets,
      } = await import("./public/viewportSectionOffsets.js");
      const {
        createViewportNodeAnchor,
        resolveViewportNodeAnchorScrollTop,
      } = await import("./public/viewportNodeAnchor.js");

      const SECTION_COUNT = 72;
      const SECTION_HEIGHT = 900;
      const SECTION_GAP = 18;
      const BUDGET_MAX_NODES = 80;
      const targetSectionIndex = 50;
      const sections = Array.from({ length: SECTION_COUNT }, (_, index) => ({
        height: SECTION_HEIGHT,
        id: "section-" + String(index).padStart(2, "0"),
        page: String(index + 1),
      }));
      const nodeById = new Map();
      const childrenById = new Map();
      const parentById = new Map();
      const sectionIdByNodeId = new Map();
      const nodeOrder = [];

      function addNode(sectionId, node) {
        nodeById.set(node.id, node);
        childrenById.set(node.id, []);
        sectionIdByNodeId.set(node.id, sectionId);
        nodeOrder.push(node.id);
      }

      function connect(parentId, childId) {
        childrenById.set(parentId, [...(childrenById.get(parentId) || []), childId]);
        parentById.set(childId, parentId);
      }

      for (const section of sections) {
        const zoneId = section.id + "-zone";
        const headingId = section.id + "-heading";
        const paragraphId = section.id + "-paragraph";
        const tableId = section.id + "-table";
        addNode(section.id, { id: zoneId, type: "zone" });
        addNode(section.id, { id: headingId, type: "text-block", textLength: 24, textPreview: section.id + " heading" });
        addNode(section.id, { id: paragraphId, type: "text-block", textLength: 180, textPreview: section.id + " body" });
        addNode(section.id, { id: tableId, type: "table" });
        connect(zoneId, headingId);
        connect(zoneId, paragraphId);
        connect(zoneId, tableId);

        for (let rowIndex = 0; rowIndex < 3; rowIndex += 1) {
          const rowId = tableId + "-row-" + rowIndex;
          const cellId = tableId + "-cell-" + rowIndex;
          const cellTextId = cellId + "-text";
          addNode(section.id, { id: rowId, type: "table-row" });
          addNode(section.id, { id: cellId, type: "table-cell" });
          addNode(section.id, { id: cellTextId, type: "text-block", textLength: 36, textPreview: "cell " + rowIndex });
          connect(tableId, rowId);
          connect(rowId, cellId);
          connect(cellId, cellTextId);
        }
      }

      const offsetSections = sections.map((section, index) => {
        const top = index * (SECTION_HEIGHT + SECTION_GAP);
        const bottom = top + SECTION_HEIGHT;
        return {
          bottom,
          center: top + SECTION_HEIGHT / 2,
          gapAfter: SECTION_GAP,
          height: SECTION_HEIGHT,
          index,
          reason: "measured",
          sectionId: section.id,
          spacerSource: "flowdoc-viewport-section-spacer",
          top,
        };
      });
      const offsetIndex = {
        mode: "section-spacer-offset-index",
        sectionCount: sections.length,
        sectionGap: SECTION_GAP,
        sections: offsetSections,
        source: "flowdoc-section-offset-index",
        totalHeight: offsetSections.at(-1).bottom,
        version: 1,
      };
      const targetSectionId = sections[targetSectionIndex].id;
      const targetNodeId = targetSectionId + "-table-cell-2-text";
      const targetSectionTop = offsetSections[targetSectionIndex].top;
      const indexes = {
        nodeOrder,
        sectionIdByNodeId,
        sectionIds: sections.map((section) => section.id),
      };
      const prediction = predictViewportFromSectionOffsets({
        offsetIndex,
        scrollTop: targetSectionTop + 250,
        viewportHeight: 600,
      });
      const initialRuntime = createViewportSchedulerRuntimeState();
      const initialAutomation = createViewportSchedulerAutomationState();
      const automation = runViewportSchedulerAutomation(initialAutomation, initialRuntime, {
        budget: { maxNodes: BUDGET_MAX_NODES, mode: "viewport" },
        documentRevision: 68,
        offsetIndex,
        prediction,
        previousRequest: {
          anchorSectionId: "section-00",
          budget: { maxNodes: BUDGET_MAX_NODES, mode: "viewport" },
          reason: "boot",
        },
        renderWindow: {
          anchorSectionId: "section-00",
          sectionIds: ["section-00"],
        },
        runtimeRevision: 68,
        trigger: "large-doc-audit",
      });
      const visibleRange = createVisibleRange(indexes, automation.request);
      const renderWindow = createRenderWindow({ sections, visibleRange, nodeIds: nodeOrder });
      const renderShell = createRenderShell({ sections, renderWindow });
      const virtualStack = createViewportVirtualStack({ offsetIndex, renderShell });
      const inactiveLazy = createViewportLazyDetailPlan({
        childrenById,
        nodeById,
        parentById,
        visibleNodeIds: visibleRange.nodeIds,
      });
      const activeLazy = createViewportLazyDetailPlan({
        activeNodeIds: [targetNodeId],
        childrenById,
        nodeById,
        parentById,
        visibleNodeIds: visibleRange.nodeIds,
      });
      const targetTableId = targetSectionId + "-table";
      const inactiveTargetTable = inactiveLazy.detailByNodeId.get(targetTableId);
      const activeTargetTable = activeLazy.detailByNodeId.get(targetTableId);
      const anchor = createViewportNodeAnchor({
        nodeHeight: 24,
        nodeId: targetNodeId,
        nodeTop: targetSectionTop + 430,
        nodeType: "text-block",
        revision: 68,
        scrollTop: 0,
        sectionId: targetSectionId,
        sectionTop: targetSectionTop,
        viewportHeight: 720,
      });
      const restored = resolveViewportNodeAnchorScrollTop({
        anchor,
        measurement: {
          scrollHeight: offsetIndex.totalHeight,
          sections: [
            { height: SECTION_HEIGHT, id: targetSectionId, top: targetSectionTop + 64 },
          ],
          viewportHeight: 720,
        },
      });
      const jumpRange = createVisibleRange(indexes, {
        anchorNodeId: targetNodeId,
        budget: { maxNodes: BUDGET_MAX_NODES, mode: "selection" },
        kind: "section-window",
        overscanSectionsAfter: 1,
        overscanSectionsBefore: 1,
        reason: "selection",
      });
      const jumpWindow = createRenderWindow({ sections, visibleRange: jumpRange, nodeIds: nodeOrder });
      const jumpShell = createRenderShell({ sections, renderWindow: jumpWindow });
      const jumpStack = createViewportVirtualStack({ offsetIndex, renderShell: jumpShell });

      console.log(JSON.stringify({
        activeDeferredCount: activeLazy.deferredCount,
        activeTargetTableDeferred: activeTargetTable.deferred,
        activeTargetTableProtected: activeTargetTable.protectedByContext,
        anchorOffsetInSection: anchor.offsetInSection,
        automationCandidateSectionIds: automation.runtime.candidate.candidateSectionIds,
        automationRequestReason: automation.request.reason,
        automationStatus: automation.status,
        inactiveDeferredCount: inactiveLazy.deferredCount,
        inactiveHeavyNodeCount: inactiveLazy.heavyNodeCount,
        inactiveTargetTableDeferred: inactiveTargetTable.deferred,
        jumpMountedSectionCount: jumpStack.mountedSectionCount,
        jumpMountedSectionIds: jumpStack.mountedSectionIds,
        jumpNodeIncluded: jumpRange.nodeIds.includes(targetNodeId),
        jumpRangeSectionIds: jumpRange.sectionIds,
        jumpVirtualized: jumpStack.virtualized,
        predictionAnchorSectionId: prediction.anchorSectionId,
        restoredReason: restored.reason,
        restoredScrollTop: restored.scrollTop,
        restoredStatus: restored.restored,
        renderShellPlaceholderSectionCount: renderShell.placeholderSectionCount,
        renderShellRenderedSectionCount: renderShell.renderedSectionCount,
        targetSectionId,
        totalNodeCount: nodeOrder.length,
        totalSectionCount: sections.length,
        virtualMountedSectionCount: virtualStack.mountedSectionCount,
        virtualMountedSectionIds: virtualStack.mountedSectionIds,
        virtualSpacerCount: virtualStack.spacerCount,
        virtualTopSpacerSectionCount: virtualStack.items[0].sectionCount,
        virtualized: virtualStack.virtualized,
        visibleNodeCount: visibleRange.nodeCount,
        visibleRangeSectionIds: visibleRange.sectionIds,
        visibleRangeTruncated: visibleRange.truncated,
        visibleRangeWindowed: visibleRange.windowed,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      activeDeferredCount: number
      activeTargetTableDeferred: boolean
      activeTargetTableProtected: boolean
      anchorOffsetInSection: number
      automationCandidateSectionIds: string[]
      automationRequestReason: string
      automationStatus: string
      inactiveDeferredCount: number
      inactiveHeavyNodeCount: number
      inactiveTargetTableDeferred: boolean
      jumpMountedSectionCount: number
      jumpMountedSectionIds: string[]
      jumpNodeIncluded: boolean
      jumpRangeSectionIds: string[]
      jumpVirtualized: boolean
      predictionAnchorSectionId: string
      restoredReason: string
      restoredScrollTop: number
      restoredStatus: boolean
      renderShellPlaceholderSectionCount: number
      renderShellRenderedSectionCount: number
      targetSectionId: string
      totalNodeCount: number
      totalSectionCount: number
      virtualMountedSectionCount: number
      virtualMountedSectionIds: string[]
      virtualSpacerCount: number
      virtualTopSpacerSectionCount: number
      virtualized: boolean
      visibleNodeCount: number
      visibleRangeSectionIds: string[]
      visibleRangeTruncated: boolean
      visibleRangeWindowed: boolean
    }

    expect(result.totalSectionCount).toBe(72)
    expect(result.totalNodeCount).toBe(936)
    expect(result.predictionAnchorSectionId).toBe("section-50")
    expect(result.automationStatus).toBe("applied")
    expect(result.automationRequestReason).toBe("viewport")
    expect(result.automationCandidateSectionIds).toEqual(["section-49", "section-50", "section-51"])
    expect(result.visibleRangeSectionIds).toEqual(["section-49", "section-50", "section-51"])
    expect(result.visibleNodeCount).toBe(39)
    expect(result.visibleRangeWindowed).toBe(true)
    expect(result.visibleRangeTruncated).toBe(false)
    expect(result.renderShellRenderedSectionCount).toBe(3)
    expect(result.renderShellPlaceholderSectionCount).toBe(69)
    expect(result.virtualized).toBe(true)
    expect(result.virtualMountedSectionCount).toBe(3)
    expect(result.virtualMountedSectionIds).toEqual(["section-49", "section-50", "section-51"])
    expect(result.virtualSpacerCount).toBe(2)
    expect(result.virtualTopSpacerSectionCount).toBe(49)
    expect(result.inactiveHeavyNodeCount).toBe(3)
    expect(result.inactiveDeferredCount).toBe(3)
    expect(result.inactiveTargetTableDeferred).toBe(true)
    expect(result.activeTargetTableDeferred).toBe(false)
    expect(result.activeTargetTableProtected).toBe(true)
    expect(result.activeDeferredCount).toBe(2)
    expect(result.anchorOffsetInSection).toBe(430)
    expect(result.restoredStatus).toBe(true)
    expect(result.restoredReason).toBe("node-anchor")
    expect(result.restoredScrollTop).toBe(46394)
    expect(result.jumpRangeSectionIds).toEqual(["section-49", "section-50", "section-51"])
    expect(result.jumpNodeIncluded).toBe(true)
    expect(result.jumpVirtualized).toBe(true)
    expect(result.jumpMountedSectionCount).toBe(3)
    expect(result.jumpMountedSectionIds).toEqual(["section-49", "section-50", "section-51"])
  })

  it("applies change packets through the browser-safe runtime cache module", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import { readFileSync } from "node:fs";
      const {
        applyChangePacketToRuntime,
        createBootRuntimeState,
        createVisibleRangeRuntimeState,
      } = await import("./public/runtimeCache.js");
      const snapshot = JSON.parse(readFileSync("./public/sandbox-snapshot.json", "utf8"));
      function findSnapshotNode(nodes, nodeId) {
        for (const node of nodes) {
          if (node.id === nodeId) return node;
          const child = findSnapshotNode(node.children || [], nodeId);
          if (child) return child;
        }
        return null;
      }
      const bootState = createBootRuntimeState(snapshot);
      const changedNode = JSON.parse(JSON.stringify(bootState.runtimeCache.nodeById.get("cover-header-label")));
      changedNode.plainText = "Runtime cache packet text";
      changedNode.textPreview = "Runtime cache packet text";
      changedNode.textLength = changedNode.plainText.length;
      const result = applyChangePacketToRuntime(bootState.snapshot, bootState.runtimeCache, {
        source: "flowdoc-template-builder-change-packet",
        packetVersion: 1,
        action: "sandbox.replacePlainTextBlock",
        status: "applied",
        baseRevision: 0,
        nextRevision: 1,
        mutationCount: 1,
        mutation: {
          action: "sandbox.replacePlainTextBlock",
          issueCount: 0,
          status: "applied",
          summary: "replace text range in cover-header-label",
          targetTextBlockId: "cover-header-label",
        },
        changedNodeIds: ["cover-header-label"],
        changedNodes: [changedNode],
        affectedParentNodeIds: ["cover-first-header"],
        dirtyScopes: [
          { textBlockId: "cover-header-label", parentNodeIds: ["cover-first-header"] },
        ],
        diagnostics: bootState.snapshot.diagnostics,
        authoringHistory: bootState.snapshot.authoringHistory,
        liveLayout: bootState.snapshot.liveLayout,
        issues: [],
      });
      const rangeState = createVisibleRangeRuntimeState(result.snapshot, result.runtimeCache, {
        anchorNodeId: "cover-header-label",
        reason: "selection",
      });
      console.log(JSON.stringify({
        ok: result.ok,
        changedText: result.runtimeCache.nodeById.get("cover-header-label").textPreview,
        dirtyNodeIds: [...result.runtimeCache.editorView.dirtyNodeIds].sort(),
        changedSubtreeIds: [...result.runtimeCache.editorView.changedSubtreeIds].sort(),
        mode: result.runtimeCache.mode,
        packetsApplied: result.runtimeCache.packetsApplied,
        runtimeSource: result.runtimeCache.source,
        runtimeStoreMode: result.runtimeCache.runtimeStoreMode,
        runtimeStoreNodeCount: result.runtimeCache.runtimeStore.nodeCount,
        runtimeStoreSource: result.runtimeCache.runtimeStoreSource,
        runtimeStoreApplyMode: result.runtimeCache.runtimeStoreApplyMode,
        snapshotTreeText: findSnapshotNode(result.snapshot.sections.flatMap((section) => section.zones), "cover-header-label").textPreview,
        snapshotRevision: result.snapshot.session.documentRevision,
        bridgeMode: result.snapshot.mutationBridge.mode,
        lastMutationTarget: result.snapshot.mutationBridge.lastMutation.targetTextBlockId,
        textAfterVisibleRangeChange: rangeState.runtimeCache.nodeById.get("cover-header-label").textPreview,
        visibleNodeCount: result.runtimeCache.visibleNodeCount,
        visibleRangeRequestReason: result.runtimeCache.visibleRangeRequest.reason,
        visibleRangeRequestSource: result.runtimeCache.visibleRangeRequest.source,
        visibleRangeKind: result.runtimeCache.visibleRangeKind,
        visibleRangeSectionIds: result.runtimeCache.visibleRange.sectionIds,
        visibleTotalNodeCount: result.runtimeCache.visibleRange.totalNodeCount,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      bridgeMode: string
      changedSubtreeIds: string[]
      changedText: string
      dirtyNodeIds: string[]
      lastMutationTarget: string
      mode: string
      ok: boolean
      packetsApplied: number
      runtimeSource: string
      runtimeStoreMode: string
      runtimeStoreNodeCount: number
      runtimeStoreSource: string
      runtimeStoreApplyMode: string
      snapshotTreeText: string
      snapshotRevision: number
      textAfterVisibleRangeChange: string
      visibleNodeCount: number
      visibleRangeKind: string
      visibleRangeRequestReason: string
      visibleRangeRequestSource: string
      visibleRangeSectionIds: string[]
      visibleTotalNodeCount: number
    }

    expect(result.ok).toBe(true)
    expect(result.runtimeSource).toBe("flowdoc-template-builder-runtime-cache")
    expect(result.runtimeStoreSource).toBe("flowdoc-structural-runtime-store")
    expect(result.runtimeStoreMode).toBe("structural-runtime-store")
    expect(result.runtimeStoreApplyMode).toBe("text-packet-direct")
    expect(result.runtimeStoreNodeCount).toBe(52)
    expect(result.mode).toBe("packet-cache")
    expect(result.packetsApplied).toBe(1)
    expect(result.snapshotRevision).toBe(1)
    expect(result.bridgeMode).toBe("in-memory-bridge")
    expect(result.lastMutationTarget).toBe("cover-header-label")
    expect(result.changedText).toBe("Runtime cache packet text")
    expect(result.snapshotTreeText).toBe("Confidential Product Report")
    expect(result.textAfterVisibleRangeChange).toBe("Runtime cache packet text")
    expect(result.dirtyNodeIds).toEqual(["cover-first-header", "cover-header-label"])
    expect(result.changedSubtreeIds).toEqual(["cover-first-header", "cover-header-label"])
    expect(result.visibleNodeCount).toBe(16)
    expect(result.visibleRangeRequestSource).toBe("flowdoc-visible-range-request")
    expect(result.visibleRangeRequestReason).toBe("packet-apply")
    expect(result.visibleRangeKind).toBe("section-window")
    expect(result.visibleRangeSectionIds).toEqual(["section-cover"])
    expect(result.visibleTotalNodeCount).toBe(52)
  })

  it("applies structural packets through the browser-safe runtime cache module", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import { readFileSync } from "node:fs";
      const {
        applyChangePacketToRuntime,
        createBootRuntimeState,
        createVisibleRangeRuntimeState,
      } = await import("./public/runtimeCache.js");
      const snapshot = JSON.parse(readFileSync("./public/sandbox-snapshot.json", "utf8"));
      function findSnapshotNode(nodes, nodeId) {
        for (const node of nodes) {
          if (node.id === nodeId) return node;
          const child = findSnapshotNode(node.children || [], nodeId);
          if (child) return child;
        }
        return null;
      }
      const bootState = createBootRuntimeState(snapshot);
      const beforeChildren = [...bootState.runtimeCache.childrenById.get("cover-body")];
      const afterChildren = [beforeChildren[0], "phase-71-cache-inserted", ...beforeChildren.slice(1)];
      const packet = {
        source: "flowdoc-structural-packet",
        packetVersion: 1,
        stage: "foundation-bridge",
        action: "text-block.insert",
        status: "applied",
        baseRevision: 0,
        nextRevision: 1,
        operation: {
          kind: "text-block.insert",
          source: "api",
          targetNodeIds: ["phase-71-cache-inserted"],
          validationPolicy: "full",
          historyPolicy: {
            kind: "single-entry",
            durableIntent: "structure",
            summary: "insert text-block phase-71-cache-inserted",
          },
          renderInvalidation: null,
          scope: {
            sectionIds: ["section-cover"],
            zoneIds: ["cover-body"],
            nodeIds: ["phase-71-cache-inserted"],
            parentNodeIds: ["cover-body"],
            tableIds: [],
            textBlockIds: ["phase-71-cache-inserted"],
          },
        },
        failureReason: null,
        nodesAdded: [{
          id: "phase-71-cache-inserted",
          type: "text-block",
          role: { role: "paragraph" },
          props: {},
          children: [{ id: "phase-71-cache-inserted-inline-1", type: "text", text: "Runtime cache structural packet" }],
        }],
        nodesUpdated: [{ id: "cover-body", type: "zone", role: "body", childIds: afterChildren }],
        nodeIdsRemoved: [],
        parentListPatches: [{
          op: "insert",
          sectionId: "section-cover",
          parentId: "cover-body",
          parentKind: "zone",
          childField: "childIds",
          nodeId: "phase-71-cache-inserted",
          toIndex: 1,
          before: beforeChildren,
          after: afterChildren,
        }],
        changedNodeIds: ["phase-71-cache-inserted", "cover-body"],
        affectedParentNodeIds: ["cover-body"],
        dirtyScopes: [{
          sectionIds: ["section-cover"],
          zoneIds: ["cover-body"],
          nodeIds: ["phase-71-cache-inserted"],
          parentNodeIds: ["cover-body"],
          tableIds: [],
          textBlockIds: ["phase-71-cache-inserted"],
        }],
        renderInvalidation: { lane: "node-structure", affectedNodeIds: ["phase-71-cache-inserted", "cover-body"], affectedSectionIds: ["section-cover"], pageScope: { kind: "unknown", reason: "pagination-not-integrated" } },
        issues: [],
      };
      const result = applyChangePacketToRuntime(bootState.snapshot, bootState.runtimeCache, packet);
      const rangeState = createVisibleRangeRuntimeState(result.snapshot, result.runtimeCache, {
        anchorNodeId: "phase-71-cache-inserted",
        reason: "selection",
      });
      console.log(JSON.stringify({
        bodyChildren: result.runtimeCache.childrenById.get("cover-body"),
        bridgeMode: result.snapshot.mutationBridge.mode,
        changedSubtreeIds: [...result.runtimeCache.editorView.changedSubtreeIds].sort(),
        dirtyNodeIds: [...result.runtimeCache.editorView.dirtyNodeIds].sort(),
        insertedInNodeOrder: result.runtimeCache.nodeOrder.includes("phase-71-cache-inserted"),
        insertedText: result.runtimeCache.nodeById.get("phase-71-cache-inserted").textPreview,
        lastMutationAction: result.snapshot.mutationBridge.lastMutation.action,
        lastMutationSummary: result.snapshot.mutationBridge.lastMutation.summary,
        mode: result.runtimeCache.mode,
        mutationCount: result.snapshot.mutationBridge.mutationCount,
        ok: result.ok,
        packetsApplied: result.runtimeCache.packetsApplied,
        rangeText: rangeState.runtimeCache.nodeById.get("phase-71-cache-inserted").textPreview,
        runtimeStoreApplyMode: result.runtimeCache.runtimeStoreApplyMode,
        runtimeStoreNodeCount: result.runtimeCache.runtimeStore.nodeCount,
        snapshotInsertedExists: Boolean(findSnapshotNode(result.snapshot.sections.flatMap((section) => section.zones), "phase-71-cache-inserted")),
        snapshotRevision: result.snapshot.session.documentRevision,
        visibleTotalNodeCount: result.runtimeCache.visibleRange.totalNodeCount,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      bodyChildren: string[]
      bridgeMode: string
      changedSubtreeIds: string[]
      dirtyNodeIds: string[]
      insertedInNodeOrder: boolean
      insertedText: string
      lastMutationAction: string
      lastMutationSummary: string
      mode: string
      mutationCount: number
      ok: boolean
      packetsApplied: number
      rangeText: string
      runtimeStoreApplyMode: string
      runtimeStoreNodeCount: number
      snapshotInsertedExists: boolean
      snapshotRevision: number
      visibleTotalNodeCount: number
    }

    expect(result.ok).toBe(true)
    expect(result.runtimeStoreApplyMode).toBe("structural-packet-direct")
    expect(result.runtimeStoreNodeCount).toBe(53)
    expect(result.mode).toBe("packet-cache")
    expect(result.packetsApplied).toBe(1)
    expect(result.snapshotRevision).toBe(1)
    expect(result.bridgeMode).toBe("in-memory-bridge")
    expect(result.mutationCount).toBe(1)
    expect(result.lastMutationAction).toBe("text-block.insert")
    expect(result.lastMutationSummary).toBe("insert text-block phase-71-cache-inserted")
    expect(result.insertedText).toBe("Runtime cache structural packet")
    expect(result.rangeText).toBe("Runtime cache structural packet")
    expect(result.insertedInNodeOrder).toBe(true)
    expect(result.snapshotInsertedExists).toBe(false)
    expect(result.bodyChildren).toEqual([
      "cover-title",
      "phase-71-cache-inserted",
      "cover-subtitle",
      "cover-meta-columns",
      "cover-divider",
      "cover-note",
    ])
    expect(result.dirtyNodeIds).toEqual(["cover-body", "phase-71-cache-inserted"])
    expect(result.changedSubtreeIds).toEqual(["cover-body", "phase-71-cache-inserted"])
    expect(result.visibleTotalNodeCount).toBe(53)
  })

  it("builds a store-backed render model from runtime store content", () => {
    const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
      import { readFileSync } from "node:fs";
      const {
        applyChangePacketToRuntime,
        createBootRuntimeState,
      } = await import("./public/runtimeCache.js");
      const {
        createStoreBackedRenderModel,
        getStoreBackedRenderChildren,
        getStoreBackedRenderNode,
        getStoreBackedRenderSectionRootNodes,
        getStoreBackedRenderShellSections,
        getStoreBackedRenderWindowChildren,
        getStoreBackedRenderWindowSectionRootNodes,
        getStoreBackedRenderWindowSections,
        isStoreBackedRenderShellSectionRendered,
      } = await import("./public/renderModel.js");
      const snapshot = JSON.parse(readFileSync("./public/sandbox-snapshot.json", "utf8"));
      function findSnapshotNode(nodes, nodeId) {
        for (const node of nodes) {
          if (node.id === nodeId) return node;
          const child = findSnapshotNode(node.children || [], nodeId);
          if (child) return child;
        }
        return null;
      }
      const bootState = createBootRuntimeState(snapshot);
      const changedNode = JSON.parse(JSON.stringify(bootState.runtimeCache.nodeById.get("cover-header-label")));
      changedNode.plainText = "Render model store text";
      changedNode.textPreview = "Render model store text";
      changedNode.textLength = changedNode.plainText.length;
      const result = applyChangePacketToRuntime(bootState.snapshot, bootState.runtimeCache, {
        source: "flowdoc-template-builder-change-packet",
        packetVersion: 1,
        action: "sandbox.replacePlainTextBlock",
        status: "applied",
        baseRevision: 0,
        nextRevision: 1,
        mutationCount: 1,
        mutation: {
          action: "sandbox.replacePlainTextBlock",
          issueCount: 0,
          status: "applied",
          summary: "replace text range in cover-header-label",
          targetTextBlockId: "cover-header-label",
        },
        changedNodeIds: ["cover-header-label"],
        changedNodes: [changedNode],
        affectedParentNodeIds: ["cover-first-header"],
        dirtyScopes: [
          { textBlockId: "cover-header-label", parentNodeIds: ["cover-first-header"] },
        ],
        diagnostics: bootState.snapshot.diagnostics,
        authoringHistory: bootState.snapshot.authoringHistory,
        liveLayout: bootState.snapshot.liveLayout,
        issues: [],
      });
      const renderModel = createStoreBackedRenderModel(result.snapshot, result.runtimeCache);
      const coverHeader = getStoreBackedRenderNode(renderModel, "cover-header-label");
      console.log(JSON.stringify({
        bodyRootIds: getStoreBackedRenderSectionRootNodes(renderModel, "section-cover").map((node) => node.id),
        coverHeaderText: coverHeader.textPreview,
        coverRootChildren: getStoreBackedRenderChildren(renderModel, "cover-first-header").map((node) => node.id),
        documentRevision: renderModel.documentRevision,
        mode: renderModel.mode,
        nodeCount: renderModel.nodeCount,
        sectionCount: renderModel.sectionCount,
        sectionIds: renderModel.sections.map((section) => section.id),
        snapshotTreeText: findSnapshotNode(result.snapshot.sections.flatMap((section) => section.zones), "cover-header-label").textPreview,
        source: renderModel.source,
        windowRootChildren: getStoreBackedRenderWindowChildren(renderModel, "cover-first-header").map((node) => node.id),
        windowRootIds: getStoreBackedRenderWindowSectionRootNodes(renderModel, "section-cover").map((node) => node.id),
        windowSectionIds: getStoreBackedRenderWindowSections(renderModel).map((section) => section.id),
        shellSectionIds: getStoreBackedRenderShellSections(renderModel).map((section) => section.id),
        shellSectionStates: getStoreBackedRenderShellSections(renderModel).map((section) => ({
          id: section.id,
          placeholder: section.placeholder,
          rendered: section.rendered,
        })),
        shellCoverRendered: isStoreBackedRenderShellSectionRendered(renderModel, "section-cover"),
        shellBodyRendered: isStoreBackedRenderShellSectionRendered(renderModel, "section-body"),
        renderWindowMode: renderModel.renderWindowMode,
        renderWindowNodeCount: renderModel.renderWindowNodeCount,
        renderWindowSource: renderModel.renderWindowSource,
        renderWindowTotalNodeCount: renderModel.renderWindowTotalNodeCount,
        renderWindowWindowed: renderModel.renderWindow.windowed,
        renderShellMode: renderModel.renderShellMode,
        renderShellPlaceholderSectionCount: renderModel.renderShellPlaceholderSectionCount,
        renderShellRenderedSectionCount: renderModel.renderShellRenderedSectionCount,
        renderShellSectionCount: renderModel.renderShellSectionCount,
        renderShellSource: renderModel.renderShellSource,
        visibleSectionIds: renderModel.visibleSectionIds,
      }));
    `], {
      cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
      encoding: "utf8",
    })
    const result = JSON.parse(output) as {
      bodyRootIds: string[]
      coverHeaderText: string
      coverRootChildren: string[]
      documentRevision: number
      mode: string
      nodeCount: number
      sectionCount: number
      sectionIds: string[]
      snapshotTreeText: string
      source: string
      windowRootChildren: string[]
      windowRootIds: string[]
      windowSectionIds: string[]
      shellSectionIds: string[]
      shellSectionStates: Array<{ id: string; placeholder: boolean; rendered: boolean }>
      shellCoverRendered: boolean
      shellBodyRendered: boolean
      renderWindowMode: string
      renderWindowNodeCount: number
      renderWindowSource: string
      renderWindowTotalNodeCount: number
      renderWindowWindowed: boolean
      renderShellMode: string
      renderShellPlaceholderSectionCount: number
      renderShellRenderedSectionCount: number
      renderShellSectionCount: number
      renderShellSource: string
      visibleSectionIds: string[]
    }

    expect(result.source).toBe("flowdoc-store-backed-render-model")
    expect(result.mode).toBe("store-backed-render-model")
    expect(result.nodeCount).toBe(52)
    expect(result.sectionCount).toBe(3)
    expect(result.documentRevision).toBe(1)
    expect(result.sectionIds).toEqual(["section-cover", "section-toc", "section-body"])
    expect(result.bodyRootIds).toEqual(["cover-first-header", "cover-body", "cover-first-footer"])
    expect(result.coverRootChildren).toEqual(["cover-header-label"])
    expect(result.coverHeaderText).toBe("Render model store text")
    expect(result.snapshotTreeText).toBe("Confidential Product Report")
    expect(result.visibleSectionIds).toEqual(["section-cover"])
    expect(result.renderWindowSource).toBe("flowdoc-render-window")
    expect(result.renderWindowMode).toBe("visible-range-render-window")
    expect(result.renderWindowTotalNodeCount).toBe(52)
    expect(result.renderWindowNodeCount).toBeGreaterThan(0)
    expect(result.renderWindowNodeCount).toBeLessThan(result.nodeCount)
    expect(result.renderWindowWindowed).toBe(true)
    expect(result.windowSectionIds).toEqual(["section-cover"])
    expect(result.windowRootIds).toEqual(["cover-first-header", "cover-body", "cover-first-footer"])
    expect(result.windowRootChildren).toEqual(["cover-header-label"])
    expect(result.renderShellSource).toBe("flowdoc-render-shell")
    expect(result.renderShellMode).toBe("render-window-shell")
    expect(result.renderShellSectionCount).toBe(3)
    expect(result.renderShellRenderedSectionCount).toBe(1)
    expect(result.renderShellPlaceholderSectionCount).toBe(2)
    expect(result.shellCoverRendered).toBe(true)
    expect(result.shellBodyRendered).toBe(false)
    expect(result.shellSectionIds).toEqual(["section-cover", "section-toc", "section-body"])
    expect(result.shellSectionStates).toEqual([
      { id: "section-cover", placeholder: false, rendered: true },
      { id: "section-toc", placeholder: true, rendered: false },
      { id: "section-body", placeholder: true, rendered: false },
    ])
  })

  it("locks the editor north star to normalized large-document lookup", () => {
    const northStarDoc = readText("../docs/EDITOR_UX_NORTH_STAR.md")
    const frontendRuntimeDoc = readText("../docs/FRONTEND_AUTHORING_RUNTIME_PLAN.md")
    const largeDocumentDoc = readText("../docs/LARGE_DOCUMENT_PERFORMANCE_CONTRACT.md")
    const browserCacheDoc = readText("../docs/TEMPLATE_BUILDER_BROWSER_CACHE_BOUNDARY.md")

    expect(northStarDoc).toContain("Status: Phase 43 design boundary.")
    expect(northStarDoc).toContain("Normalized Editor View Constraint")
    expect(northStarDoc).toContain("nodeById")
    expect(northStarDoc).toContain("parentById")
    expect(northStarDoc).toContain("childrenById")
    expect(northStarDoc).toContain("visibleNodeIds")
    expect(northStarDoc).toContain("Booting from a full sandbox snapshot is acceptable")
    expect(northStarDoc).toContain("not acceptable as the long-term active runtime")
    expect(northStarDoc).toContain("Canonical authored documents may keep parent-owned ordered ids")
    expect(frontendRuntimeDoc).toContain("Normalized Editor View")
    expect(largeDocumentDoc).toContain("normalized/lazy indexes")
    expect(browserCacheDoc).toContain("The tree snapshot")
    expect(browserCacheDoc).toContain("active runtime shape for large-document editing")
    expect(northStarDoc).toContain("Phase 47 replaces the all-node visible range placeholder")
    expect(northStarDoc).toContain("Phase 48 separates visible range requests from resolved ranges")
    expect(northStarDoc).toContain("Phase 49 moves structural lookup indexes into a dedicated browser-safe runtime")
    expect(northStarDoc).toContain("Phase 50 adds a narrow text-packet direct apply path")
    expect(northStarDoc).toContain("Phase 51 adds a store-backed render model")
  })

  it("locks future editor work to modular responsibility boundaries", () => {
    const modularDoc = readText("../docs/MODULAR_RESPONSIBILITY_CONTRACT.md")
    const northStarDoc = readText("../docs/EDITOR_UX_NORTH_STAR.md")
    const roadmapDoc = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const agentsDoc = readText("../AGENTS.md")

    expect(modularDoc).toContain("Status: Phase 44 design boundary.")
    expect(modularDoc).toContain("Split by responsibility, not by arbitrary size.")
    expect(modularDoc).toContain("Coordinator files should delegate quickly")
    expect(modularDoc).toContain("The sandbox browser file currently carries multiple concerns")
    expect(modularDoc).toContain("not acceptable for the production editor runtime")
    expect(modularDoc).toContain("Which file owns the new behavior?")
    expect(northStarDoc).toContain("Modular Runtime Rule")
    expect(northStarDoc).toContain("docs/MODULAR_RESPONSIBILITY_CONTRACT.md")
    expect(roadmapDoc).toContain("Phase 44: Modular Responsibility Contract")
    expect(agentsDoc).toContain("Split implementation by real responsibility boundaries")
  })

  it("keeps WYSIWYG browser drafts local until bridge commit", () => {
    const appSource = readText("../examples/template-builder-sandbox/public/app.js")
    const coreBoundarySource = readText("../examples/template-builder-sandbox/src/coreBoundary.ts")

    expect(coreBoundarySource).toContain("plainText")
    expect(coreBoundarySource).toContain("canUseWysiwygDraft")
    expect(coreBoundarySource).toContain("hasAtomicInline")
    expect(coreBoundarySource).toContain("hasStyledText")
    expect(coreBoundarySource).toContain("wysiwygDraftGuardReason")
    expect(coreBoundarySource).toContain("browser.editTextDraft")
    expect(coreBoundarySource).toContain("browser.trackDraftSelection")
    expect(coreBoundarySource).toContain("browser.deriveDraftCommandContext")
    expect(coreBoundarySource).toContain("browser.applyDraftTextCommand")
    expect(coreBoundarySource).toContain("browser.setDraftSelectionRange")
    expect(coreBoundarySource).toContain("browser.trackDraftComposition")
    expect(appSource).toContain("draftTextForNode")
    expect(appSource).toContain("draftSelectionLabel")
    expect(appSource).toContain("normalizedDraftSelection")
    expect(appSource).toContain("updateDraftSelectionFromEditor")
    expect(appSource).toContain("deriveDraftCommandContext")
    expect(appSource).toContain("draftCommandReadiness")
    expect(appSource).toContain("draftCommandSummary")
    expect(appSource).toContain("applyDraftTextCommand")
    expect(appSource).toContain("draftCommandActionCanRun")
    expect(appSource).toContain("draftCompositionLabel")
    expect(appSource).toContain("updateDraftCompositionFromEditor")
    expect(appSource).toContain("setDraftSelectionRange")
    expect(appSource).toContain("applyDraftSelectionAction")
    expect(appSource).toContain("updateDraftSelectionControl")
    expect(appSource).toContain("node?.plainText")
    expect(appSource).toContain("data-draft-editor")
    expect(appSource).toContain("data-draft-selection")
    expect(appSource).toContain("data-draft-selection-input")
    expect(appSource).toContain("data-draft-selection-action")
    expect(appSource).toContain("data-draft-selectionbar")
    expect(appSource).toContain("data-draft-composition")
    expect(appSource).toContain("data-draft-compositionbar")
    expect(appSource).toContain("data-draft-command-summary")
    expect(appSource).toContain("data-draft-command-selected")
    expect(appSource).toContain("data-draft-command-text")
    expect(appSource).toContain("data-draft-command-action")
    expect(appSource).toContain("data-draft-commandbar")
    expect(appSource).toContain("data-draft-action=\"commit\"")
    expect(appSource).toContain("insert-text")
    expect(appSource).toContain("replace-selection")
    expect(appSource).toContain("select-all")
    expect(appSource).toContain("cursor-start")
    expect(appSource).toContain("cursor-end")
    expect(appSource).toContain("compositionstart")
    expect(appSource).toContain("compositionupdate")
    expect(appSource).toContain("compositionend")
    expect(appSource).toContain("isComposing")
    expect(appSource).toContain("Finish IME composition")
    expect(appSource).toContain("Applied browser-local")
    expect(appSource).toContain("focusDraftEditor()")
    expect(appSource).toContain("selectionDirection")
    expect(appSource).toContain("selectionSource")
    expect(appSource).toContain("text.replaceSelection")
    expect(appSource).toContain("inline.fieldRef.insert")
    expect(appSource).toContain("inline.style.patch")
    expect(appSource).toContain("draft.baseRevision !== state.snapshot.session.documentRevision")
    expect(appSource).toContain("routeForBridgeTextAction(\"replace-text\")")
    expect(appSource).toContain("applyMutationResult(result)")
    expect(appSource).toContain("Finish the active browser draft before using direct bridge actions.")
    expect(appSource).not.toContain("state.snapshot.document")
  })
})
