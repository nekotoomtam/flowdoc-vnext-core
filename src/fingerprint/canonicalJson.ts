export function compareVNextOrdinalStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function canonicalJson(value: unknown): string {
  if (value == null || typeof value === "string" || typeof value === "boolean") {
    return JSON.stringify(value)
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("canonical JSON requires finite numbers")
    return JSON.stringify(Object.is(value, -0) ? 0 : value)
  }
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(",")}]`
  if (typeof value !== "object") throw new TypeError("canonical JSON requires JSON-safe values")

  const source = value as Record<string, unknown>
  const entries = Object.keys(source)
    .filter((key) => source[key] !== undefined)
    .sort(compareVNextOrdinalStrings)
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(source[key])}`)
  return `{${entries.join(",")}}`
}

export function stringifyVNextCanonicalJson(value: unknown): string {
  return canonicalJson(value)
}

export function sameVNextCanonicalJson(left: unknown, right: unknown): boolean {
  try {
    return stringifyVNextCanonicalJson(left) === stringifyVNextCanonicalJson(right)
  } catch {
    return false
  }
}
