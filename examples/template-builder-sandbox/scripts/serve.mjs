import { createReadStream, existsSync, statSync } from "node:fs"
import { createServer } from "node:http"
import path from "node:path"
import { fileURLToPath } from "node:url"

const publicRoot = fileURLToPath(new URL("../public/", import.meta.url))
const host = process.env.FLOWDOC_SANDBOX_HOST || "127.0.0.1"
const startPort = Number(process.env.FLOWDOC_SANDBOX_PORT || 4177)

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

function listen(port) {
  const server = createServer((request, response) => {
    const filePath = resolveRequestPath(request.url || "/")

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
