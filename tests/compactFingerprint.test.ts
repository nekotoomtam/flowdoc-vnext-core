import { describe, expect, it } from "vitest"
import { createVNextCompactFingerprint } from "../src/fingerprint/compactFingerprint.js"

describe("compact browser-safe fingerprint", () => {
  it.each([
    ["", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"],
    ["abc", "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"],
    ["The quick brown fox jumps over the lazy dog", "d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592"],
  ])("matches the SHA-256 vector for %j", (value, digest) => {
    expect(createVNextCompactFingerprint(value)).toBe(`sha256:${digest}`)
  })

  it("is deterministic for UTF-8 input without Node-only crypto", () => {
    const first = createVNextCompactFingerprint("FlowDoc ภาษาไทย")
    expect(createVNextCompactFingerprint("FlowDoc ภาษาไทย")).toBe(first)
    expect(first).toMatch(/^sha256:[a-f0-9]{64}$/u)
  })
})
