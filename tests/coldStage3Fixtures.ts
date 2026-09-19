import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import type { RunOwnedProviderRun, RunOwnedSemanticOracleStage2Input } from "../src/layout/runOwnedSemanticOracleStage2.js"

export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`
  if (value && typeof value === "object") return `{${Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(",")}}`
  return JSON.stringify(value)
}
export function hash(value: string | Uint8Array): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`
}

export function fixture(text = "กA") {
  const font = readFileSync(new URL("../assets/fonts/Sarabun/Sarabun-Regular.ttf", import.meta.url))
  const keys = [
    { styleKey: "body", language: "en", script: "Latin", direction: "ltr", writingMode: "horizontal-tb" },
    { styleKey: "body", language: "th", script: "Thai", direction: "ltr", writingMode: "horizontal-tb" },
  ]
  const policy = {
    schemaVersion: 1, unicodeVersion: "17.0.0", scriptRevision: "unicode-script-0.5.8",
    bidiRevision: "thai-latin-ltr-only-v1", graphemeRevision: "icu_segmenter-2.2.0",
    lineRevision: "icu_segmenter-2.2.0", shapingRevision: "rustybuzz-0.20.1",
    runBoundaryPolicy: "common-inherited-previous-else-next-v1",
    languageRules: [{ authoredLanguage: "und", script: "Latin", language: "en" }, { authoredLanguage: "und", script: "Thai", language: "th" }],
    fontRouteRules: keys.map((key) => ({ ...key, fontId: key.script === "Thai" ? "Sarabun-Thai" : "Sarabun-Regular", resources: ["sarabun-regular"], coverage: "all-scalars-or-reject" })),
    featureRules: keys.map((key) => ({ ...key, features: ["kern", "liga"] })),
  }
  return {
    providerContext: { providerId: "rust-stage3-thai-latin", providerRevision: "v1", policyDigest: hash(canonical(policy)), policy,
      fonts: [{ resourceId: "sarabun-regular", digest: hash(font), bytes: [...font] }] },
    paragraphContext: { paragraphId: "paragraph-stage3", baseDirection: "ltr" as const, writingMode: "horizontal-tb" as const },
    authoredSpans: text ? [{ spanId: "span-1", startOffset: 0, endOffset: text.length, text, language: "und", styleKey: "body" }] : [],
  }
}

// These are comparison-only oracle inputs, never constructor arguments.
export function oracleInput(input: ReturnType<typeof fixture>, rows: readonly (readonly [number, number, "Thai" | "Latin"])[]): RunOwnedSemanticOracleStage2Input {
  const runs: RunOwnedProviderRun[] = rows.map(([startOffset, endOffset, script]) => ({
    runId: `${script.toLowerCase()}-${startOffset}-${endOffset}`, startOffset, endOffset, script, direction: "ltr",
    language: script === "Thai" ? "th" : "en", fontId: script === "Thai" ? "Sarabun-Thai" : "Sarabun-Regular", features: ["kern", "liga"],
  }))
  return { committedText: input.authoredSpans.map((s) => s.text).join(""), authoredSpans: input.authoredSpans, paragraph: input.paragraphContext,
    caretOffset: 0, composition: "committed", provider: { providerId: input.providerContext.providerId, providerRevision: input.providerContext.providerRevision,
      runs, graphemeSafeOffsets: [0], seamCertificates: [] } }
}
