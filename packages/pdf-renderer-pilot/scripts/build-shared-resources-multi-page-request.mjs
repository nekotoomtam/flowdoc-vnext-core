import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const scriptDir = dirname(fileURLToPath(import.meta.url))
const packageRoot = resolve(scriptDir, "..")
const repoRoot = resolve(packageRoot, "../..")
const sourcePath = join(repoRoot, "fixtures/pdf-pilot-image-one-page-request.v1.json")
const outputPath = join(repoRoot, "fixtures/pdf-pilot-shared-resources-three-page-request.v1.json")

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function suffixId(value, pageIndex) {
  return `${value}:p${pageIndex + 1}`
}

function sourceCommandsForPage(commands, pageIndex, includeImage) {
  return commands
    .filter((command) => includeImage || command.id !== "pdf:pilot:ocr-accuracy")
    .map((command) => ({
      ...clone(command),
      id: suffixId(command.id, pageIndex),
      sourceCommandId: suffixId(command.sourceCommandId, pageIndex),
      fragmentId: suffixId(command.fragmentId, pageIndex),
      nodeId: suffixId(command.nodeId, pageIndex),
      pageIndex,
      pageNumber: pageIndex + 1,
    }))
}

function paintCommandsForPage(commands, pageIndex, includeImage) {
  return commands
    .filter((command) => includeImage || command.kind !== "image")
    .map((command) => ({
      ...clone(command),
      id: suffixId(command.id, pageIndex),
      sourceCommandId: suffixId(command.sourceCommandId, pageIndex),
      pageIndex,
    }))
}

const request = JSON.parse(readFileSync(sourcePath, "utf8"))
const firstPageSources = clone(request.plan.drawCommands)
const firstPagePaint = clone(request.paintCommands)
const firstPageBox = clone(request.pageBoxes[0])
const secondPageSources = sourceCommandsForPage(firstPageSources, 1, true)
const thirdPageSources = sourceCommandsForPage(firstPageSources, 2, false)
const secondPagePaint = paintCommandsForPage(firstPagePaint, 1, true)
const thirdPagePaint = paintCommandsForPage(firstPagePaint, 2, false)

request.rendererProfileId = "pdf-pilot-shared-resources-three-page-v1"
request.plan.pageCount = 3
request.plan.drawCommands = [
  ...firstPageSources,
  ...secondPageSources,
  ...thirdPageSources,
]
request.plan.summary = {
  inputCommandCount: 11,
  drawCommandCount: 11,
  textCommandCount: 6,
  boxCommandCount: 5,
  blockingIssueCount: 0,
  warningIssueCount: 0,
}
request.pageBoxes = [
  firstPageBox,
  { ...clone(firstPageBox), pageIndex: 1, pageNumber: 2 },
  { ...clone(firstPageBox), pageIndex: 2, pageNumber: 3 },
]
request.paintCommands = [
  ...firstPagePaint,
  ...secondPagePaint,
  ...thirdPagePaint,
]

writeFileSync(outputPath, `${JSON.stringify(request, null, 2)}\n`, "utf8")
process.stdout.write(`${outputPath}\n`)
