import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

function collectFiles(dir: string, predicate: (path: string) => boolean): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    const stat = statSync(path)

    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === "dist" || entry === "coverage") return []
      return collectFiles(path, predicate)
    }

    return predicate(path) ? [path] : []
  })
}

function repoPath(path: string): string {
  return relative(repoRoot, path).replace(/\\/g, "/")
}

describe("vNext repository boundary", () => {
  it("has the standalone repository files required for package ownership", () => {
    expect(existsSync(join(repoRoot, "package.json"))).toBe(true)
    expect(existsSync(join(repoRoot, "package-lock.json"))).toBe(true)
    expect(existsSync(join(repoRoot, "tsconfig.json"))).toBe(true)
    expect(existsSync(join(repoRoot, "vitest.config.ts"))).toBe(true)
    expect(existsSync(join(repoRoot, "README.md"))).toBe(true)
    expect(existsSync(join(repoRoot, "AGENTS.md"))).toBe(true)
    expect(existsSync(join(repoRoot, ".github/workflows/check.yml"))).toBe(true)
    expect(existsSync(join(repoRoot, "src/index.ts"))).toBe(true)
    expect(existsSync(join(repoRoot, "fixtures/product-report-vnext.flowdoc.json"))).toBe(true)
    expect(existsSync(join(repoRoot, "docs/WORKSPACE_BOUNDARY.md"))).toBe(true)
    expect(existsSync(join(repoRoot, "docs/LEGACY_MIGRATION_GATE.md"))).toBe(true)
    expect(existsSync(join(repoRoot, "docs/PACKAGE_CONSUMPTION_STRATEGY.md"))).toBe(true)
  })

  it("keeps exported source independent from parent app and current core paths", () => {
    const sourceFiles = collectFiles(join(repoRoot, "src"), (path) => path.endsWith(".ts"))
    const forbiddenPatterns = [
      /\.\.\/\.\.\/src\/app/,
      /\.\.\/\.\.\/packages\/core/,
      /from\s+["'][^"']*src\/app/,
      /from\s+["'][^"']*packages\/core/,
    ]
    const violations = sourceFiles.flatMap((path) => {
      const source = readFileSync(path, "utf8")
      return forbiddenPatterns.some((pattern) => pattern.test(source)) ? [repoPath(path)] : []
    })

    expect(violations).toEqual([])
  })

  it("keeps canonical source free of legacy prototype node APIs", () => {
    const sourceFiles = collectFiles(join(repoRoot, "src"), (path) => path.endsWith(".ts"))
    const forbiddenPatterns = [
      /flow-row/,
      /flow-stack/,
      /paragraph\.split/,
      /type:\s*z\.literal\(["']paragraph["']\)/,
      /type:\s*["']paragraph["']/,
    ]
    const violations = sourceFiles.flatMap((path) => {
      const source = readFileSync(path, "utf8")
      return forbiddenPatterns.some((pattern) => pattern.test(source)) ? [repoPath(path)] : []
    })

    expect(violations).toEqual([])
  })
})
