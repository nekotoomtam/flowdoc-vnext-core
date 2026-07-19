import type { z } from "zod"
import {
  type VNextPublishedStructureMappingRuntimeV1,
} from "@flowdoc/vnext-core"
import {
  FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_ID,
  FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_VERSION,
  FlowDocUatSemanticNoPagesAdapterInputV1Schema,
  adaptFlowDocUatSemanticNoPagesSectionV1,
} from "./uatSemanticNoPagesAdapter.js"

export const FLOWDOC_UAT_GENERATION_MAPPER_IMPLEMENTATION_FINGERPRINT = (
  "sha256:40408cadd8ec6d5ce293594a24e88c029d18df6c0f7632513027f87ae0c50b42"
) as const

export const FlowDocUatGenerationPayloadV1Schema = (
  FlowDocUatSemanticNoPagesAdapterInputV1Schema.omit({ instance: true }).strict()
)

export type FlowDocUatGenerationPayloadV1 = z.infer<typeof FlowDocUatGenerationPayloadV1Schema>

function pathString(path: readonly PropertyKey[]): string {
  return path.reduce<string>((current, segment) => {
    if (typeof segment === "number") return `${current}[${segment}]`
    const key = String(segment)
    return current === "" ? key : `${current}.${key}`
  }, "")
}

export function createFlowDocUatGenerationMapperV1(): VNextPublishedStructureMappingRuntimeV1 {
  return {
    execution: {
      kind: "named-adapter",
      adapterId: FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_ID,
      adapterVersion: FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_VERSION,
      implementationFingerprint: FLOWDOC_UAT_GENERATION_MAPPER_IMPLEMENTATION_FINGERPRINT,
    },
    map: (payload, context) => {
      const parsed = FlowDocUatGenerationPayloadV1Schema.safeParse(payload)
      if (!parsed.success) return {
        status: "blocked",
        canonicalInput: null,
        issues: parsed.error.issues.map((item) => ({
          code: item.code.replaceAll("_", "-"),
          path: pathString(item.path),
        })),
      }

      const adapted = adaptFlowDocUatSemanticNoPagesSectionV1({
        ...parsed.data,
        instance: context.instance,
      })
      if (adapted.status === "blocked") return {
        status: "blocked",
        canonicalInput: null,
        issues: adapted.issues.map((item) => ({ code: item.code, path: item.path })),
      }
      return {
        status: "mapped",
        canonicalInput: {
          kind: "canonical-snapshot-input",
          dataSnapshot: adapted.bundle.dataSnapshot,
          collectionSnapshots: [adapted.bundle.collectionSnapshot],
          mediaSnapshot: adapted.bundle.mediaSnapshot,
        },
        warnings: adapted.warnings.map((item) => ({ code: item.code, path: item.path })),
      }
    },
  }
}
