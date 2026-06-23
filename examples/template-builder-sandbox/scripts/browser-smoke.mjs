import { readFileSync } from "node:fs"
import { register } from "node:module"
import { pathToFileURL } from "node:url"

register("./ts-loader.mjs", new URL("./", import.meta.url))

const { createTemplateBuilderMutationBridge } = await import("../src/mutationBridge.ts")
const {
  applyChangePacketToRuntime,
  createBootRuntimeState,
  createVisibleRangeRuntimeState,
} = await import("../public/runtimeCache.js")
const { createDraftRichInlineState } = await import("../public/draftRichInlineState.js")
const { createRenderWindow } = await import("../public/renderWindow.js")
const { createStructuralOutlineJumpRequest } = await import("../public/structuralOutlineNavigation.js")
const { structuralActionRequest } = await import("../public/structuralCommandPolicy.js")
const { createViewportMeasurement } = await import("../public/viewportMeasurement.js")
const {
  createViewportScrollControllerState,
  recordViewportScroll,
  settleViewportScroll,
} = await import("../public/viewportScrollController.js")

export const FLOWDOC_BROWSER_TIMING_SMOKE_SOURCE = "flowdoc-browser-timing-smoke"
export const FLOWDOC_BROWSER_TIMING_SMOKE_MODE = "sandbox-runtime-timing-smoke"

const fixtureUrl = new URL("../../../fixtures/product-report-vnext.flowdoc.json", import.meta.url)
const thresholds = {
  maxOperationDurationMs: 2500,
  maxTotalDurationMs: 8000,
}

function now() {
  return globalThis.performance.now()
}

async function timed(name, measurements, action) {
  const startedAt = now()
  const value = await action()
  const durationMs = Number((now() - startedAt).toFixed(3))
  measurements.push({
    durationMs,
    name,
    status: durationMs <= thresholds.maxOperationDurationMs ? "passed" : "warning",
    thresholdMs: thresholds.maxOperationDurationMs,
  })
  return value
}

function sectionBoxes(snapshot) {
  return snapshot.sections.map((section, index) => ({
    bottom: (index + 1) * 900,
    height: 900,
    id: section.id,
    rendered: index === 0,
    top: index * 900,
  }))
}

function richInlinePlan(revision) {
  return {
    baseRevision: revision,
    documentRevision: revision,
    operationKind: "text-block.rich-inline.replace",
    plannedInlineChildren: [
      { id: "browser-smoke-rich-1", type: "text", text: "Timed ", style: { fontWeight: "bold" } },
      {
        fallback: "{{customer.name}}",
        id: "browser-smoke-rich-2",
        key: "customer.name",
        label: "Customer",
        type: "field-ref",
      },
      { id: "browser-smoke-rich-3", type: "text", text: " smoke" },
    ],
    status: "planned",
    targetTextBlockId: "cover-header-label",
  }
}

export async function runTemplateBuilderBrowserTimingSmoke() {
  const measurements = []
  const fixture = JSON.parse(readFileSync(fixtureUrl, "utf8"))
  let bridge
  let snapshot
  let state

  await timed("initial-snapshot-boot", measurements, () => {
    bridge = createTemplateBuilderMutationBridge(fixture, {
      fixturePath: "fixtures/product-report-vnext.flowdoc.json",
    })
    snapshot = bridge.snapshot()
    state = createBootRuntimeState(snapshot)
  })

  let outlineJump
  await timed("node-selection-jump", measurements, () => {
    outlineJump = createStructuralOutlineJumpRequest({
      documentRevision: snapshot.session.documentRevision,
      node: state.runtimeCache.nodeById.get("cover-title"),
      nodeId: "cover-title",
      previousVisibleRangeRequest: state.runtimeCache.visibleRangeRequest,
    })
  })

  await timed("visible-range-apply", measurements, () => {
    const visibleRangeRequest = {
      ...outlineJump.visibleRangeRequest,
      budget: {
        ...outlineJump.visibleRangeRequest.budget,
        maxNodes: 8,
      },
      overscanSectionsAfter: 0,
      overscanSectionsBefore: 0,
    }
    state = createVisibleRangeRuntimeState(snapshot, state.runtimeCache, visibleRangeRequest)
    createRenderWindow({
      nodeIds: state.runtimeCache.nodeOrder,
      sections: snapshot.sections,
      visibleRange: state.runtimeCache.visibleRange,
    })
  })

  await timed("scroll-update", measurements, () => {
    const measurement = createViewportMeasurement({
      measuredAtRevision: snapshot.session.documentRevision,
      scrollHeight: 2700,
      scrollTop: 900,
      sections: sectionBoxes(snapshot),
      viewportHeight: 900,
    })
    const recorded = recordViewportScroll(createViewportScrollControllerState(), {
      measurement,
      scrollTop: 900,
    })
    settleViewportScroll(recorded, {
      budget: { maxNodes: 8 },
      measurement,
      previousRequest: state.runtimeCache.visibleRangeRequest,
    })
  })

  await timed("structural-command-apply", measurements, () => {
    const insertPolicy = structuralActionRequest({
      action: "insert-after",
      childrenById: state.runtimeCache.childrenById,
      node: state.runtimeCache.nodeById.get("cover-title"),
      nodeById: state.runtimeCache.nodeById,
      structuralText: "Browser smoke block",
    })
    const inserted = bridge.insertTextBlock({
      ...insertPolicy.body,
      nodeId: "phase-142-inserted",
    }, { includeSnapshot: false })
    const applied = applyChangePacketToRuntime(snapshot, state.runtimeCache, inserted.packet)
    if (!applied.ok) throw new Error(`structural apply failed: ${applied.reason}`)
    snapshot = applied.snapshot
    state = { runtimeCache: applied.runtimeCache, snapshot }
  })

  await timed("rich-inline-draft-open", measurements, () => {
    createDraftRichInlineState({
      isComposing: false,
      text: "Timed Customer smoke",
      textBlockId: "cover-header-label",
    }, {
      browserInlineState: {
        atomicChips: [{
          chipId: "customer-chip",
          fieldKey: "customer.name",
          position: 6,
        }],
        plainText: "Timed Customer smoke",
        plainTextPreserved: true,
        status: "normalized",
        styledRuns: [{
          enabled: true,
          mark: "bold",
          range: { end: 5, start: 0, unit: "utf16-code-unit-offset" },
          runId: "bold:0-5",
        }],
      },
    })
  })

  await timed("rich-inline-commit", measurements, () => {
    const revision = snapshot.session.documentRevision
    const rich = bridge.commitRichInline({ plan: richInlinePlan(revision) }, { includeSnapshot: false })
    const applied = applyChangePacketToRuntime(snapshot, state.runtimeCache, rich.packet)
    if (!applied.ok) throw new Error(`rich apply failed: ${applied.reason}`)
    snapshot = applied.snapshot
    state = { runtimeCache: applied.runtimeCache, snapshot }
  })

  const totalDurationMs = Number(measurements.reduce((sum, measurement) => sum + measurement.durationMs, 0).toFixed(3))
  const warningCount = measurements.filter((measurement) => measurement.status === "warning").length
  const status = warningCount === 0 && totalDurationMs <= thresholds.maxTotalDurationMs ? "passed" : "warning"

  return {
    source: FLOWDOC_BROWSER_TIMING_SMOKE_SOURCE,
    mode: FLOWDOC_BROWSER_TIMING_SMOKE_MODE,
    version: 1,
    status,
    environment: {
      browserDriver: "not-bound",
      dependencyFree: true,
      productionBenchmark: false,
      runtime: "node-sandbox-browser-shell",
    },
    fixture: {
      path: "fixtures/product-report-vnext.flowdoc.json",
      nodeCount: bridge.snapshot().counts.nodes,
      sectionCount: bridge.snapshot().counts.sections,
      textBlockCount: bridge.snapshot().counts.textBlocks,
    },
    thresholds,
    measurements,
    summary: {
      maxDurationMs: Math.max(...measurements.map((measurement) => measurement.durationMs)),
      operationCount: measurements.length,
      totalDurationMs,
      warningCount,
    },
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await runTemplateBuilderBrowserTimingSmoke()
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}
