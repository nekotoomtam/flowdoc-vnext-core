import { register } from "node:module"

register("./ts-loader.mjs", new URL("./", import.meta.url))
await import("./build-snapshot.ts")
