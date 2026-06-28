import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readText(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

describe("concrete storage choice gate", () => {
  it("selects an external file-backed JSON record adapter for internal alpha", () => {
    const doc = readText("../docs/CONCRETE_STORAGE_CHOICE_GATE.md")

    expect(doc).toContain("Status: Phase 172 concrete storage choice gate.")
    expect(doc).toContain("This is a decision boundary only.")
    expect(doc).toContain("external file-backed JSON record adapter")
    expect(doc).toContain("package target: `packages/storage-file-json`")
    expect(doc).toContain("consume public storage adapter contracts from `@flowdoc/vnext-core`")
    expect(doc).not.toContain("production storage readiness is achieved")
    expect(doc).not.toContain("production input readiness is achieved")
  })

  it("compares storage options and defers heavier paths", () => {
    const doc = readText("../docs/CONCRETE_STORAGE_CHOICE_GATE.md")

    expect(doc).toContain("## Option Comparison")
    expect(doc).toContain("Filesystem JSON:")
    expect(doc).toContain("SQLite:")
    expect(doc).toContain("Postgres:")
    expect(doc).toContain("Browser storage:")
    expect(doc).toContain("S3/object store:")
    expect(doc).toContain("Deferred because native dependency/install risk")
    expect(doc).toContain("pgAdmin is a Postgres admin UI")
  })

  it("separates record storage from artifact bytes", () => {
    const doc = readText("../docs/CONCRETE_STORAGE_CHOICE_GATE.md")

    expect(doc).toContain("## What It Stores")
    expect(doc).toContain("package/session records")
    expect(doc).toContain("durable history snapshots")
    expect(doc).toContain("rich inline session persistence records")
    expect(doc).toContain("artifact manifest records")
    expect(doc).toContain("artifact job records")
    expect(doc).toContain("read-after-write")
    expect(doc).toContain("expectedRevision conflict")
    expect(doc).toContain("idempotencyKey replay")
    expect(doc).toContain("revision increment")
    expect(doc).toContain("## What It Does Not Store")
    expect(doc).toContain("Artifact bytes.")
    expect(doc).toContain("Phase 174 should add a separate filesystem artifact byte store.")
  })

  it("keeps storage gate assumptions away from production input and backend claims", () => {
    const doc = readText("../docs/CONCRETE_STORAGE_CHOICE_GATE.md")

    expect(doc).toContain("## Storage Gate Assumptions")
    expect(doc).toContain("Storage choice does not make guarded input production-ready.")
    expect(doc).toContain("browser, clipboard, or IME evidence")
    expect(doc).toContain("backend routes, workers, queues, or auth")
    expect(doc).toContain("No filesystem/database writes in core.")
    expect(doc).toContain("No SQLite/native dependency required.")
    expect(doc).toContain("No package/document schema change.")
  })

  it("documents Phase 172 in the phase trail and advances the roadmap", () => {
    const doc = readText("../docs/CONCRETE_STORAGE_CHOICE_GATE.md")
    const readme = readText("../README.md")
    const ledger = readText("../docs/PHASE_LEDGER.md")
    const roadmap = readText("../docs/PHASE_18_IMPLEMENTATION_ROADMAP.md")
    const prePhase172Test = readText("./prePhase172RiskUnknownRegister.test.ts")

    expect(doc).toContain("## PASS")
    expect(doc).toContain("## FAIL-BLOCKER")
    expect(doc).toContain("## RISK")
    expect(doc).toContain("## UNKNOWN")
    expect(doc).toContain("## Files Changed")
    expect(doc).toContain("## Behavior Changed")
    expect(doc).toContain("## Tests Run")
    expect(doc).toContain("## Risks Left")
    expect(doc).toContain("## Intentionally Not Changed")
    expect(doc).toContain("Next recommended phase: Phase 173: External File-Backed Storage Adapter Slice.")
    expect(readme).toContain("Concrete storage choice gate")
    expect(readme).toContain("docs/CONCRETE_STORAGE_CHOICE_GATE.md")
    expect(ledger).toContain("| 172 | Concrete storage choice gate | done |")
    expect(roadmap).toContain("## Phase 172: Concrete Storage Choice Gate")
    expect(roadmap).toContain("Current next step after Phase 172:")
    expect(roadmap).toContain("Phase 173: External File-Backed Storage Adapter Slice")
    expect(prePhase172Test).toContain("Phase 173: External File-Backed Storage Adapter Slice")
  })
})
