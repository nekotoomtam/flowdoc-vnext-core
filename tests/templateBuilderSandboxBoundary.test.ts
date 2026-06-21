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
      actionLanes: Array<{ status: string }>
      authoringHistory: { mode: string; recordCount: number; groupCount: number; latestGroup: unknown }
    }
    const coverZone = snapshot.sections[0].zones[0]
    const coverText = coverZone.children[0]

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
    })
    expect(new Set(snapshot.actionLanes.map((action) => action.status))).toEqual(
      new Set(["wired", "planned", "blocked"]),
    )
    expect(snapshot.authoringHistory).toMatchObject({
      mode: "static-snapshot",
      recordCount: 0,
      groupCount: 0,
      latestGroup: null,
    })
  })

  it("keeps selected node state browser-only", () => {
    const snapshotText = readText("../examples/template-builder-sandbox/public/sandbox-snapshot.json")
    const appSource = readText("../examples/template-builder-sandbox/public/app.js")

    expect(snapshotText).not.toContain("selectedId")
    expect(snapshotText).not.toContain("selectionSource")
    expect(appSource).toContain("selectedId")
    expect(appSource).toContain("selectionSource")
    expect(appSource).toContain('closest("[data-node-id]")')
  })

  it("declares one mutation bridge route without direct browser document mutation", () => {
    const serverSource = readText("../examples/template-builder-sandbox/scripts/serve.mjs")
    const bridgeSource = readText("../examples/template-builder-sandbox/src/mutationBridge.ts")
    const appSource = readText("../examples/template-builder-sandbox/public/app.js")
    const snapshot = readJson("../examples/template-builder-sandbox/public/sandbox-snapshot.json") as {
      mutationBridge: { mode: string; documentRevision: number; mutationCount: number; lastMutation: unknown }
      authoringHistory: { mode: string; recordCount: number; groupCount: number; latestGroup: unknown }
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
    expect(bridgeSource).toContain("TemplateBuilderTextUndoPatch")
    expect(bridgeSource).toContain("text.range.replace")
    expect(bridgeSource).toContain("text.insert")
    expect(bridgeSource).toContain("sandbox.insertPlainTextAtEnd")
    expect(bridgeSource).toContain("sandbox.undo")
    expect(bridgeSource).toContain("sandbox.redo")
    expect(bridgeSource).toContain("flowdoc-template-builder-change-packet")
    expect(bridgeSource).toContain("authoringHistory")
    expect(appSource).toContain("./api/actions/replace-text?response=packet")
    expect(appSource).toContain("./api/actions/insert-text-at-end?response=packet")
    expect(appSource).toContain("./api/actions/undo?response=packet")
    expect(appSource).toContain("./api/actions/redo?response=packet")
    expect(appSource).toContain("Append text")
    expect(appSource).toContain("History")
    expect(appSource).toContain("data-history-action")
    expect(appSource).toContain("lastPacket")
    expect(appSource).not.toContain("snapshot.document")
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
    const coreBoundarySource = readText("../examples/template-builder-sandbox/src/coreBoundary.ts")
    const browserCacheDoc = readText("../docs/TEMPLATE_BUILDER_BROWSER_CACHE_BOUNDARY.md")

    expect(appSource).toContain("runtimeCache")
    expect(appSource).toContain("createRuntimeCache")
    expect(appSource).toContain("applyChangePacket")
    expect(appSource).toContain("flowdoc-template-builder-change-packet")
    expect(appSource).toContain("packet.baseRevision !== state.snapshot.session.documentRevision")
    expect(appSource).toContain("applyChangePacket(result.packet)")
    expect(appSource).toContain("applyBridgeTextAction")
    expect(appSource).toContain("applyHistoryAction")
    expect(appSource).toContain("routeForHistoryAction")
    expect(appSource).toContain("authoringHistory")
    expect(appSource).toContain("History:")
    expect(appSource).toContain("setSnapshotFromRefresh(await fetchSnapshot())")
    expect(appSource).toContain("state.runtimeCache?.nodeById.get")
    expect(appSource).not.toContain("result.snapshot")
    expect(coreBoundarySource).toContain("browser.applyChangePacket")
    expect(coreBoundarySource).toContain("sandbox.recordAuthoringHistory")
    expect(coreBoundarySource).toContain("user.undo")
    expect(coreBoundarySource).toContain("user.redo")
    expect(browserCacheDoc).toContain("The browser cache is not canonical document truth")
  })
})
