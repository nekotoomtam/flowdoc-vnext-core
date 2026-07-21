import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { resolve } from "node:path"

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)))
const artifacts = [
  {
    id: "live-draft-xr1-v1",
    path: "pkg-live-draft/flowdoc_text_engine_bg.wasm",
    sha256: "60d24ed4b5546e580a8fa5dd05d774e7d8b7078958f7d327cf8f66ffcb5b3a85",
  },
  {
    id: "live-draft-mr1-v1",
    path: "pkg-live-draft-mr1/flowdoc_text_engine_mr1_bg.wasm",
    sha256: "cc130a7f8cef2694f8518cecb93b518eac2496fa8f4141f62ca284e6f34b0857",
  },
  {
    id: "live-draft-mr1-range-v1",
    path: "pkg-live-draft-mr1-range/flowdoc_text_engine_mr1_range_bg.wasm",
    sha256: "90bbb751ad3d5613175d689a2b07f95320b856a5e9420118b259d5738b7dabe7",
  },
]

for (const artifact of artifacts) {
  const actual = createHash("sha256").update(readFileSync(resolve(packageRoot, artifact.path))).digest("hex")
  if (actual !== artifact.sha256) {
    throw new Error(`${artifact.id} digest mismatch: expected ${artifact.sha256}, received ${actual}`)
  }
}

process.stdout.write(`${artifacts.length} Live Draft WASM artifact digests verified\n`)
