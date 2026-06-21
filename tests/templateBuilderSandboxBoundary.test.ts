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
    }

    expect(serverSource).toContain("/api/snapshot")
    expect(serverSource).toContain("/api/actions/replace-text")
    expect(serverSource).toContain('searchParams.get("response") !== "packet"')
    expect(bridgeSource).toContain('from "@flowdoc/vnext-core"')
    expect(bridgeSource).toContain("runVNextTextTransaction")
    expect(bridgeSource).toContain("text.range.replace")
    expect(bridgeSource).toContain("flowdoc-template-builder-change-packet")
    expect(appSource).toContain("./api/actions/replace-text")
    expect(appSource).toContain("lastPacket")
    expect(appSource).not.toContain("snapshot.document")
    expect(snapshot.mutationBridge).toEqual({
      mode: "static-snapshot",
      documentRevision: 0,
      mutationCount: 0,
      lastMutation: null,
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
        acceptedContainsText: JSON.stringify(accepted.snapshot.sections).includes("Edited through bridge test"),
        rejectedOk: rejected.ok,
        rejectedIssues: rejected.issues,
        rejectedBridge: rejected.snapshot.mutationBridge,
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
      acceptedContainsText: boolean
      rejectedOk: boolean
      rejectedIssues: Array<{ code: string }>
      rejectedBridge: {
        documentRevision: number
        mutationCount: number
        lastMutation: { status: string; targetTextBlockId: string }
      }
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
  })

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
      }
      acceptedPacketHasSections: boolean
      rejectedOk: boolean
      rejectedHasSnapshot: boolean
      rejectedPacket: {
        baseRevision: number
        nextRevision: number
        mutationCount: number
        changedNodeIds: string[]
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
    expect(result.rejectedOk).toBe(false)
    expect(result.rejectedHasSnapshot).toBe(false)
    expect(result.rejectedPacket).toMatchObject({
      baseRevision: 1,
      nextRevision: 1,
      mutationCount: 1,
      changedNodeIds: [],
    })
    expect(result.rejectedPacket.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "non-plain-text-block" }),
    ]))
  })
})
