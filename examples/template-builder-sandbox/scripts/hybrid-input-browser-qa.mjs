import { pathToFileURL } from "node:url"

import {
  createHybridInputBrowserQaReport,
} from "../public/hybridInputBrowserQa.js"

export async function runHybridInputBrowserQaEvidence(input = {}) {
  return createHybridInputBrowserQaReport({
    browserDriver: process.env.FLOWDOC_BROWSER_DRIVER || "not-bound",
    runner: "sandbox-script-json-safe-events",
    ...input,
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = await runHybridInputBrowserQaEvidence()
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
}
