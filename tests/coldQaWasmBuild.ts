import { execFileSync } from "node:child_process"
import { mkdirSync, rmdirSync } from "node:fs"
import { createRequire } from "node:module"
import { resolve } from "node:path"

/** Both QA suites build the same artifact; protect generation and loading together. */
export async function buildColdQaWasm(): Promise<unknown> {
  const crate = resolve("packages/text-engine-rust-wasm/rust-live-draft-engine")
  const lock = resolve(crate, "target/cold-qa-build.lock")
  mkdirSync(resolve(crate, "target"), { recursive: true })
  const deadline = Date.now() + 180_000
  for (;;) {
    try { mkdirSync(lock); break } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error
      if (Date.now() > deadline) throw new Error("Timed out waiting for the cold QA WASM build lock")
      await new Promise((done) => setTimeout(done, 100))
    }
  }
  try {
    execFileSync("wasm-pack", ["build", crate, "--dev", "--target", "nodejs", "--out-dir", "target/cold-session-qa", "--out-name", "cold_session", "--", "--features", "cold-session-qa"],
      { encoding: "utf8", timeout: 180_000, maxBuffer: 8 * 1024 * 1024 })
    return createRequire(import.meta.url)(resolve(crate, "target/cold-session-qa/cold_session.js"))
  } finally { rmdirSync(lock) }
}
