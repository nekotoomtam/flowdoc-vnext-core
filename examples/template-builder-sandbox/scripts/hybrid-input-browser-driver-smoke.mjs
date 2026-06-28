import { readFileSync } from "node:fs"
import { pathToFileURL } from "node:url"

import {
  createHybridInputBrowserDriverSmokeReport,
} from "../public/hybridInputBrowserDriverSmoke.js"

function readDriverFacts() {
  if (process.env.FLOWDOC_BROWSER_DRIVER_FACTS_JSON) {
    return JSON.parse(process.env.FLOWDOC_BROWSER_DRIVER_FACTS_JSON)
  }
  if (process.env.FLOWDOC_BROWSER_DRIVER_FACTS_PATH) {
    return JSON.parse(readFileSync(process.env.FLOWDOC_BROWSER_DRIVER_FACTS_PATH, "utf8"))
  }
  return null
}

export async function runHybridInputBrowserDriverSmoke(input = {}) {
  const driverFacts = input.driverFacts || readDriverFacts()
  return createHybridInputBrowserDriverSmokeReport({
    driverAvailable: Boolean(driverFacts),
    driverFacts,
    driverName: process.env.FLOWDOC_BROWSER_DRIVER || "not-bound",
    runner: "optional-sandbox-browser-driver-smoke-script",
    ...input,
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = await runHybridInputBrowserDriverSmoke()
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
}
