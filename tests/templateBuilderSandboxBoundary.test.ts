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
      "../examples/template-builder-sandbox/public/renderWindow.js",
      "../examples/template-builder-sandbox/public/renderModel.js",
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
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.createStoreBackedRenderModel")
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.resolveRenderWindow")
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
    const renderWindowSource = readText("../examples/template-builder-sandbox/public/renderWindow.js")
    const renderModelSource = readText("../examples/template-builder-sandbox/public/renderModel.js")
    const runtimeStoreSource = readText("../examples/template-builder-sandbox/public/runtimeStore.js")
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

    expect(appSource).toContain('from "./renderModel.js"')
    expect(appSource).toContain('from "./runtimeCache.js"')
    expect(appSource).toContain("runtimeCache")
    expect(appSource).toContain("createStoreBackedRenderModel")
    expect(appSource).toContain("getStoreBackedRenderChildren")
    expect(appSource).toContain("getStoreBackedRenderSectionRootNodes")
    expect(appSource).toContain("getStoreBackedRenderWindowChildren")
    expect(appSource).toContain("getStoreBackedRenderWindowSectionRootNodes")
    expect(appSource).toContain("getStoreBackedRenderWindowSections")
    expect(appSource).toContain("renderWindowNodeChildren")
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
    expect(runtimeStoreSource).toContain("createRuntimeStore")
    expect(runtimeStoreSource).toContain("flowdoc-structural-runtime-store")
    expect(runtimeStoreSource).toContain("applyTextChangePacketToRuntimeStore")
    expect(runtimeStoreSource).toContain("text-packet-direct")
    expect(runtimeStoreSource).toContain("getRuntimeStoreChildren")
    expect(runtimeStoreSource).toContain("getRuntimeStoreSectionRootNodes")
    expect(runtimeStoreSource).not.toContain("document.")
    expect(runtimeStoreSource).not.toContain("querySelector")
    expect(renderWindowSource).toContain("createRenderWindow")
    expect(renderWindowSource).toContain("flowdoc-render-window")
    expect(renderWindowSource).toContain("visible-range-render-window")
    expect(renderWindowSource).toContain("isNodeInRenderWindow")
    expect(renderWindowSource).toContain("isSectionInRenderWindow")
    expect(renderWindowSource).not.toContain("document.")
    expect(renderWindowSource).not.toContain("querySelector")
    expect(renderModelSource).toContain("createStoreBackedRenderModel")
    expect(renderModelSource).toContain('from "./renderWindow.js"')
    expect(renderModelSource).toContain("createRenderWindow")
    expect(renderModelSource).toContain("flowdoc-store-backed-render-model")
    expect(renderModelSource).toContain("renderWindow")
    expect(renderModelSource).toContain("getStoreBackedRenderChildren")
    expect(renderModelSource).toContain("getStoreBackedRenderSectionRootNodes")
    expect(renderModelSource).toContain("getStoreBackedRenderWindowChildren")
    expect(renderModelSource).toContain("getStoreBackedRenderWindowSectionRootNodes")
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
    expect(runtimeCacheSource).toContain("packet.baseRevision !== snapshot.session.documentRevision")
    expect(runtimeCacheSource).not.toContain("document.")
    expect(runtimeCacheSource).not.toContain("querySelector")
    expect(appSource).not.toContain("result.snapshot")
    expect(coreBoundarySource).toContain("browser.applyChangePacket")
    expect(coreBoundarySource).toContain("browser.createStructuralRuntimeStore")
    expect(coreBoundarySource).toContain("browser.applyTextPacketToRuntimeStore")
    expect(coreBoundarySource).toContain("browser.createStoreBackedRenderModel")
    expect(coreBoundarySource).toContain("browser.resolveRenderWindow")
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
    expect(storeBackedRenderDoc).toContain("Status: Phase 51 implementation boundary.")
    expect(storeBackedRenderDoc).toContain("createStoreBackedRenderModel")
    expect(storeBackedRenderDoc).toContain("store-backed-render-model")
    expect(storeBackedRenderDoc).toContain("does not implement viewport virtualization")
    expect(storeBackedRenderDoc).toContain("public/renderWindow.js")
    expect(renderWindowDoc).toContain("Status: Phase 52 implementation boundary.")
    expect(renderWindowDoc).toContain("createRenderWindow")
    expect(renderWindowDoc).toContain("visible-range-render-window")
    expect(renderWindowDoc).toContain("does not implement full viewport virtualization")
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
        getStoreBackedRenderWindowChildren,
        getStoreBackedRenderWindowSectionRootNodes,
        getStoreBackedRenderWindowSections,
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
        renderWindowMode: renderModel.renderWindowMode,
        renderWindowNodeCount: renderModel.renderWindowNodeCount,
        renderWindowSource: renderModel.renderWindowSource,
        renderWindowTotalNodeCount: renderModel.renderWindowTotalNodeCount,
        renderWindowWindowed: renderModel.renderWindow.windowed,
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
      renderWindowMode: string
      renderWindowNodeCount: number
      renderWindowSource: string
      renderWindowTotalNodeCount: number
      renderWindowWindowed: boolean
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
