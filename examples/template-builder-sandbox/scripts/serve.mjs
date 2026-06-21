import { createReadStream, existsSync, readFileSync, statSync } from "node:fs"
import { createServer } from "node:http"
import { register } from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"

register("./ts-loader.mjs", new URL("./", import.meta.url))

const { createTemplateBuilderMutationBridge } = await import("../src/mutationBridge.ts")

const publicRoot = fileURLToPath(new URL("../public/", import.meta.url))
const fixturePath = fileURLToPath(new URL("../../../fixtures/product-report-vnext.flowdoc.json", import.meta.url))
const host = process.env.FLOWDOC_SANDBOX_HOST || "127.0.0.1"
const startPort = Number(process.env.FLOWDOC_SANDBOX_PORT || 4177)
const bridge = createTemplateBuilderMutationBridge(JSON.parse(readFileSync(fixturePath, "utf8")), {
  fixturePath: "fixtures/product-report-vnext.flowdoc.json",
})

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
])

function resolveRequestPath(requestUrl) {
  const parsedUrl = new URL(requestUrl, `http://${host}`)
  const relativePath = decodeURIComponent(parsedUrl.pathname === "/" ? "/index.html" : parsedUrl.pathname)
  const absolutePath = path.resolve(publicRoot, `.${relativePath}`)

  if (!absolutePath.startsWith(publicRoot)) return null
  return absolutePath
}

function serveFile(response, filePath) {
  const extension = path.extname(filePath)
  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Type": mimeTypes.get(extension) || "application/octet-stream",
  })
  createReadStream(filePath).pipe(response)
}

function sendJson(response, statusCode, value) {
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  })
  response.end(`${JSON.stringify(value, null, 2)}\n`)
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = ""
    request.setEncoding("utf8")
    request.on("data", (chunk) => {
      body += chunk
      if (body.length > 16_384) {
        reject(new Error("request body is too large"))
        request.destroy()
      }
    })
    request.on("end", () => {
      try {
        resolve(body.length === 0 ? {} : JSON.parse(body))
      } catch {
        reject(new Error("request body must be JSON"))
      }
    })
    request.on("error", reject)
  })
}

async function handleApi(request, response, parsedUrl) {
  const pathname = parsedUrl.pathname

  if (request.method === "GET" && pathname === "/api/snapshot") {
    sendJson(response, 200, bridge.snapshot())
    return true
  }

  if (request.method === "POST" && pathname === "/api/actions/replace-text") {
    try {
      const body = await readJsonBody(request)
      const result = bridge.replaceText(body, {
        includeSnapshot: parsedUrl.searchParams.get("response") !== "packet",
      })
      sendJson(response, result.ok ? 200 : 422, result)
    } catch (error) {
      sendJson(response, 400, {
        ok: false,
        error: error instanceof Error ? error.message : "invalid request",
        snapshot: bridge.snapshot(),
      })
    }
    return true
  }

  if (request.method === "POST" && pathname === "/api/actions/insert-text-at-end") {
    try {
      const body = await readJsonBody(request)
      const result = bridge.insertTextAtEnd(body, {
        includeSnapshot: parsedUrl.searchParams.get("response") !== "packet",
      })
      sendJson(response, result.ok ? 200 : 422, result)
    } catch (error) {
      sendJson(response, 400, {
        ok: false,
        error: error instanceof Error ? error.message : "invalid request",
        snapshot: bridge.snapshot(),
      })
    }
    return true
  }

  if (pathname.startsWith("/api/")) {
    sendJson(response, 404, { ok: false, error: "unknown sandbox api route" })
    return true
  }

  return false
}

function listen(port) {
  const server = createServer(async (request, response) => {
    const requestUrl = request.url || "/"
    const parsedUrl = new URL(requestUrl, `http://${host}`)

    if (await handleApi(request, response, parsedUrl)) {
      return
    }

    const filePath = resolveRequestPath(requestUrl)

    if (filePath == null) {
      response.writeHead(403)
      response.end("Forbidden")
      return
    }

    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      response.writeHead(404)
      response.end("Not found")
      return
    }

    serveFile(response, filePath)
  })

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && port < startPort + 20) {
      listen(port + 1)
      return
    }
    throw error
  })

  server.listen(port, host, () => {
    console.log(`FlowDoc template builder sandbox: http://${host}:${port}/`)
  })
}

listen(startPort)
