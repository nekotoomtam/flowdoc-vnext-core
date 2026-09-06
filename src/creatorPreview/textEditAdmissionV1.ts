import { fingerprintVNextCreatorPreviewV1, type VNextCreatorTextResolvedV1 } from "./contentV1.js"
import type { VNextCreatorTextPreviewResultV1 } from "./layoutV1.js"
export type CreatorEditReadyV1 = Extract<VNextCreatorTextPreviewResultV1, { status: "ready" }>
type Source = Pick<VNextCreatorTextResolvedV1, "prefix" | "value" | "suffix" | "inlineIds" | "tuple" | "occurrenceId" | "valueAddress">
export function freezeCreatorEditV1<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freezeCreatorEditV1(child)
    Object.freeze(value)
  }
  return value
}
const layouts = new WeakMap<object, { result: CreatorEditReadyV1; source: Source; digest: string }>()
/** Package-internal registration at the trusted layout producer. Never a wire API. */
export function registerCreatorEditLayoutV1(result: CreatorEditReadyV1, source: VNextCreatorTextResolvedV1): CreatorEditReadyV1 {
  const { prefix, value, suffix, inlineIds, tuple, occurrenceId, valueAddress } = source
  layouts.set(result, freezeCreatorEditV1({ result: structuredClone(result),
    source: structuredClone({ prefix, value, suffix, inlineIds, tuple, occurrenceId, valueAddress }), digest: fingerprintVNextCreatorPreviewV1(result) }))
  return result
}
export function requireCreatorEditLayoutV1(input: unknown) {
  const record = input && typeof input === "object" ? layouts.get(input) : undefined
  if (!record) throw new Error("Creator layout is not admitted in this runtime")
  let matches = false
  try { matches = fingerprintVNextCreatorPreviewV1(input) === record.digest } catch { /* fail closed */ }
  if (!matches) throw new Error("Creator layout was mutated after admission")
  return record
}
