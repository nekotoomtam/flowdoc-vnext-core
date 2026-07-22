import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

function runIslandScenario(): Record<string, unknown> {
  const output = execFileSync(process.execPath, ["--input-type=module", "-e", `
    const {
      createHybridInputRuntimeOwnership,
    } = await import("./public/inputRuntimeOwnership.js");
    const {
      ACTIVE_TEXT_BLOCK_ISLAND_MODE,
      ACTIVE_TEXT_BLOCK_ISLAND_SOURCE,
      ACTIVE_TEXT_BLOCK_ISLAND_STATES,
      activeTextBlockIslandCanCommit,
      activeTextBlockIslandLabel,
      activateActiveTextBlockIsland,
      beginActiveTextBlockIslandComposition,
      closeActiveTextBlockIsland,
      createInactiveActiveTextBlockIslandState,
      endActiveTextBlockIslandComposition,
      openActiveTextBlockIsland,
      requestActiveTextBlockIslandCommit,
      updateActiveTextBlockIslandDraft,
      updateActiveTextBlockIslandSelection,
    } = await import("./public/activeTextBlockIsland.js");

    const node = {
      canUseHardenedTextBlockIsland: true,
      id: "cover-title",
      plainText: "Quarterly report",
      type: "text-block",
    };
    const ownership = createHybridInputRuntimeOwnership({
      requestedTargetType: "active-text-block-island",
      selectedNode: node,
    });
    const inactive = createInactiveActiveTextBlockIslandState();
    const opening = openActiveTextBlockIsland(inactive, {
      ownership,
      richSegmentsSummary: {
        segmentCount: 1,
        status: "plain-text",
      },
      selection: {
        end: 9,
        start: 0,
      },
      textBlockId: "cover-title",
      text: "Quarterly report",
    });
    const active = activateActiveTextBlockIsland(opening);
    const selected = updateActiveTextBlockIslandSelection(active, {
      direction: "forward",
      end: 9,
      source: "test-selection",
      start: 0,
      textBlockId: "cover-title",
    });
    const composing = beginActiveTextBlockIslandComposition(selected, {
      data: "ไ",
      source: "compositionstart",
    });
    const draftDuringComposition = updateActiveTextBlockIslandDraft(composing, {
      selection: {
        end: 17,
        start: 17,
      },
      text: "Quarterly report ไ",
    });
    const blockedCommit = requestActiveTextBlockIslandCommit(draftDuringComposition);
    const settled = endActiveTextBlockIslandComposition(draftDuringComposition, {
      data: "ไ",
      text: "Quarterly report ไทย",
    });
    const canCommitAfterComposition = activeTextBlockIslandCanCommit(settled);
    const commitRequested = requestActiveTextBlockIslandCommit(settled);
    const crossBlockSelection = updateActiveTextBlockIslandSelection(active, {
      end: 2,
      start: 0,
      textBlockId: "other-block",
    });
    const crossBlockDraft = updateActiveTextBlockIslandDraft(active, {
      text: "Other",
      textBlockId: "other-block",
    });
    const closedWithoutCommit = closeActiveTextBlockIsland(settled);
    const closedAfterCommit = closeActiveTextBlockIsland(commitRequested);

    console.log(JSON.stringify({
      activeLabel: activeTextBlockIslandLabel(active),
      activeReason: active.reason,
      activeStatus: active.status,
      blockedCommitReason: blockedCommit.commit.reason,
      blockedCommitStatus: blockedCommit.commit.status,
      canCommitAfterComposition,
      closedAfterCommitReason: closedAfterCommit.closeReason,
      closedWithoutCommitReason: closedWithoutCommit.closeReason,
      constants: {
        mode: ACTIVE_TEXT_BLOCK_ISLAND_MODE,
        source: ACTIVE_TEXT_BLOCK_ISLAND_SOURCE,
        states: ACTIVE_TEXT_BLOCK_ISLAND_STATES,
      },
      commitCoreStatus: commitRequested.coreCommit.status,
      commitDraftText: commitRequested.commit.request.draftText,
      commitRequestStatus: commitRequested.commit.status,
      commitStatus: commitRequested.status,
      composingActive: composing.composition.active,
      composingStatus: composing.status,
      crossBlockDraftReason: crossBlockDraft.reason,
      crossBlockDraftStatus: crossBlockDraft.status,
      crossBlockSelectionReason: crossBlockSelection.reason,
      crossBlockSelectionStatus: crossBlockSelection.status,
      dirtyAfterComposition: settled.dirty,
      draftDuringCompositionStatus: draftDuringComposition.status,
      inactivePackageTruth: inactive.canonicalPackageTruth.status,
      openingSelection: opening.selection,
      openingStatus: opening.status,
      settledCompositionActive: settled.composition.active,
      settledStatus: settled.status,
      settledText: settled.draftText,
    }));
  `], {
    cwd: new URL("../examples/template-builder-sandbox", import.meta.url),
    encoding: "utf8",
  })

  return JSON.parse(output) as Record<string, unknown>
}

describe("active text-block island boundary", () => {
  it("models the active island lifecycle without package mutation", () => {
    const result = runIslandScenario()

    expect(result.constants).toMatchObject({
      mode: "browser-local-active-text-block-island-boundary",
      source: "flowdoc-active-text-block-island",
      states: [
        "inactive",
        "opening",
        "active",
        "composing",
        "dirty",
        "committing",
        "rejected",
        "closed",
      ],
    })
    expect(result.inactivePackageTruth).toBe("not-mutated")
    expect(result.openingStatus).toBe("opening")
    expect(result.openingSelection).toMatchObject({
      end: 9,
      start: 0,
      textBlockId: "cover-title",
      unit: "utf16-code-unit-offset",
    })
    expect(result.activeStatus).toBe("active")
    expect(result.activeReason).toBe("active")
    expect(result.activeLabel).toBe("Active island: active cover-title")
  })

  it("blocks commit while IME composition is active and allows it after settlement", () => {
    const result = runIslandScenario()

    expect(result.composingStatus).toBe("composing")
    expect(result.composingActive).toBe(true)
    expect(result.draftDuringCompositionStatus).toBe("composing")
    expect(result.blockedCommitStatus).toBe("blocked")
    expect(result.blockedCommitReason).toBe("composition-active")
    expect(result.settledStatus).toBe("dirty")
    expect(result.settledCompositionActive).toBe(false)
    expect(result.settledText).toBe("Quarterly report ไทย")
    expect(result.dirtyAfterComposition).toBe(true)
    expect(result.canCommitAfterComposition).toBe(true)
    expect(result.commitStatus).toBe("committing")
    expect(result.commitRequestStatus).toBe("requested")
    expect(result.commitDraftText).toBe("Quarterly report ไทย")
    expect(result.commitCoreStatus).toBe("not-run")
  })

  it("rejects cross-block ranges and makes close-without-commit explicit", () => {
    const result = runIslandScenario()

    expect(result.crossBlockSelectionStatus).toBe("rejected")
    expect(result.crossBlockSelectionReason).toBe("cross-block-selection")
    expect(result.crossBlockDraftStatus).toBe("rejected")
    expect(result.crossBlockDraftReason).toBe("cross-block-draft-update")
    expect(result.closedWithoutCommitReason).toBe("closed-without-commit")
    expect(result.closedAfterCommitReason).toBe("closed")
  })

  it("keeps the module DOM-free and separate from command execution", () => {
    const source = readText("../examples/template-builder-sandbox/public/activeTextBlockIsland.js")

    expect(source).toContain("ACTIVE_TEXT_BLOCK_ISLAND_SOURCE")
    expect(source).toContain("createInactiveActiveTextBlockIslandState")
    expect(source).toContain("openActiveTextBlockIsland")
    expect(source).toContain("beginActiveTextBlockIslandComposition")
    expect(source).toContain("requestActiveTextBlockIslandCommit")
    expect(source).toContain("Phase 155 models lifecycle only")
    expect(source).not.toContain("document.")
    expect(source).not.toContain("querySelector")
    expect(source).not.toContain("getSelection")
    expect(source).not.toContain("fetch(")
    expect(source).not.toContain("FlowDocEditor")
    expect(source).not.toMatch(/from\s+["']\.\.\/\.\.\/src/)
  })

  it("documents Phase 155 and advances the roadmap to Phase 156", () => {
    const doc = readText("../docs/ACTIVE_TEXT_BLOCK_ISLAND_BOUNDARY.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")

    expect(doc).toContain("Status: Phase 155 active text-block island boundary.")
    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL / BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("No DOM Selection/Range objects.")
    expect(doc).toContain("No commit to vNext core.")
    expect(doc).toContain("Phase 156: Hybrid Command Policy Boundary")
    expect(readme).toContain("Active text-block island boundary")
    expect(readme).toContain("docs/ACTIVE_TEXT_BLOCK_ISLAND_BOUNDARY.md")
    expect(ledger).toContain("| 155 | Active text-block island boundary | done |")
    expect(roadmap).toContain("## Phase 155: Active Text-Block Island Boundary")
    expect(roadmap).toContain("Phase 156: Hybrid Command Policy Boundary")
  })
})
