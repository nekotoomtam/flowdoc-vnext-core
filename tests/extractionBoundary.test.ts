import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const workspaceRoot = fileURLToPath(new URL("../", import.meta.url))

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

function workspacePath(path: string): string {
  return relative(workspaceRoot, path).replace(/\\/g, "/")
}

describe("vNext extraction boundary", () => {
  it("has the standalone workspace files required before repository extraction", () => {
    expect(existsSync(join(workspaceRoot, "package.json"))).toBe(true)
    expect(existsSync(join(workspaceRoot, "tsconfig.json"))).toBe(true)
    expect(existsSync(join(workspaceRoot, "vitest.config.ts"))).toBe(true)
    expect(existsSync(join(workspaceRoot, "README.md"))).toBe(true)
    expect(existsSync(join(workspaceRoot, "src/index.ts"))).toBe(true)
    expect(existsSync(join(workspaceRoot, "fixtures/product-report-vnext.flowdoc.json"))).toBe(true)
    expect(existsSync(join(workspaceRoot, "docs/WORKSPACE_BOUNDARY.md"))).toBe(true)
  })

  it("keeps exported source independent from parent app and current core paths", () => {
    const sourceFiles = collectFiles(join(workspaceRoot, "src"), (path) => path.endsWith(".ts"))
    const forbiddenPatterns = [
      /\.\.\/\.\.\/src\/app/,
      /\.\.\/\.\.\/packages\/core/,
      /from\s+["'][^"']*src\/app/,
      /from\s+["'][^"']*packages\/core/,
    ]
    const violations = sourceFiles.flatMap((path) => {
      const source = readFileSync(path, "utf8")
      return forbiddenPatterns.some((pattern) => pattern.test(source)) ? [workspacePath(path)] : []
    })

    expect(violations).toEqual([])
  })

  it("keeps canonical source free of legacy prototype node APIs", () => {
    const sourceFiles = collectFiles(join(workspaceRoot, "src"), (path) => path.endsWith(".ts"))
    const forbiddenPatterns = [
      /flow-row/,
      /flow-stack/,
      /paragraph\.split/,
      /type:\s*z\.literal\(["']paragraph["']\)/,
      /type:\s*["']paragraph["']/,
    ]
    const violations = sourceFiles.flatMap((path) => {
      const source = readFileSync(path, "utf8")
      return forbiddenPatterns.some((pattern) => pattern.test(source)) ? [workspacePath(path)] : []
    })

    expect(violations).toEqual([])
  })
})
