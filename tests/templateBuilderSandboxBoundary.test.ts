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
      "../examples/template-builder-sandbox/public/editorView.js",
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
    expect(snapshot.actionLanes.map((action) => action.action)).toContain("browser.createNormalizedEditorView")
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
    const editorViewSource = readText("../examples/template-builder-sandbox/public/editorView.js")
    const coreBoundarySource = readText("../examples/template-builder-sandbox/src/coreBoundary.ts")
    const browserCacheDoc = readText("../docs/TEMPLATE_BUILDER_BROWSER_CACHE_BOUNDARY.md")

    expect(appSource).toContain('from "./editorView.js"')
    expect(appSource).toContain("runtimeCache")
    expect(appSource).toContain("createRuntimeCache")
    expect(appSource).toContain("createEditorView")
    expect(appSource).toContain("editorView")
    expect(appSource).toContain("getEditorViewChildren")
    expect(appSource).toContain("getEditorViewSectionRootNodes")
    expect(appSource).toContain("visibleNodeCount")
    expect(appSource).toContain("viewMode")
    expect(appSource).toContain("applyChangePacket")
    expect(appSource).toContain("flowdoc-template-builder-change-packet")
    expect(appSource).toContain("packet.baseRevision !== state.snapshot.session.documentRevision")
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
    expect(appSource).not.toContain("allNodes")
    expect(appSource).not.toContain("flattenNodes")
    expect(editorViewSource).toContain("createEditorView")
    expect(editorViewSource).toContain("childrenById")
    expect(editorViewSource).toContain("parentById")
    expect(editorViewSource).toContain("visibleNodeIds")
    expect(editorViewSource).toContain("dirtyNodeIds")
    expect(appSource).not.toContain("result.snapshot")
    expect(coreBoundarySource).toContain("browser.applyChangePacket")
    expect(coreBoundarySource).toContain("browser.createNormalizedEditorView")
    expect(coreBoundarySource).toContain("sandbox.recordAuthoringHistory")
    expect(coreBoundarySource).toContain("sandbox.requestLiveLayout")
    expect(coreBoundarySource).toContain("user.undo")
    expect(coreBoundarySource).toContain("user.redo")
    expect(browserCacheDoc).toContain("The browser cache is not canonical document truth")
    expect(browserCacheDoc).toContain("public/editorView.js")
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
        sectionId: view.sectionIdByNodeId.get("cover-title"),
        source: view.source,
        visibleNodeCount: view.visibleNodeIds.length,
        visibleRangeKind: view.visibleRange.kind,
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
      sectionId: string
      source: string
      visibleNodeCount: number
      visibleRangeKind: string
      zoneId: string
    }

    expect(result.source).toBe("flowdoc-normalized-editor-view")
    expect(result.mode).toBe("normalized-editor-view")
    expect(result.nodeCount).toBe(52)
    expect(result.visibleNodeCount).toBe(52)
    expect(result.visibleRangeKind).toBe("all-nodes")
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
