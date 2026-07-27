import { createVNextCompactFingerprint } from "../fingerprint/compactFingerprint.js"
import { stringifyVNextCanonicalJson } from "../fingerprint/canonicalJson.js"
import type { VNextTextBlockAcceptedMultiRunLayoutV1 } from "./textBlockMultiRunIncrementalContractV1.js"
import type { VNextTextBlockInitialFlowV1 } from "./textBlockInitialFlowInputV1.js"
import {
  inspectVNextTextBlockInitialFlowRequestBindingV1,
} from "./textBlockInitialFlowRequestBindingV1.js"
import type { VNextTextBlockMultiRunLayoutRequestV1 } from "./textBlockMultiRunLayoutContractV1.js"
import { acceptVNextTextBlockMultiRunLayoutV1 } from "./textBlockMultiRunLayoutV1.js"

export const VNEXT_TEXT_BLOCK_INITIAL_FLOW_TEXT_ONLY_ADAPTER_SOURCE =
  "vnext-text-block-initial-flow-text-only-adapter-v1" as const
export const VNEXT_TEXT_BLOCK_INITIAL_FLOW_TEXT_ONLY_ADAPTER_VERSION = 1 as const

const ADAPTER_METADATA_UNAVAILABLE = "unavailable"

export type VNextTextBlockInitialFlowTextOnlyAdapterIssueCodeV1 =
  | "invalid-initial-flow"
  | "initial-flow-capability-required"
  | "legacy-context-mismatch"
  | "legacy-layout-rejected"

export interface VNextTextBlockInitialFlowTextOnlyAdapterIssueV1 {
  code: VNextTextBlockInitialFlowTextOnlyAdapterIssueCodeV1
  severity: "error"
  path: string
  message: string
}

interface AdapterBase {
  source: typeof VNEXT_TEXT_BLOCK_INITIAL_FLOW_TEXT_ONLY_ADAPTER_SOURCE
  contractVersion: typeof VNEXT_TEXT_BLOCK_INITIAL_FLOW_TEXT_ONLY_ADAPTER_VERSION
  initialFlowFingerprint: string
  layoutId: string
  contracts: {
    legacyTextSubsetOnly: true
    completeGeometryClassified: true
    rendererMayMeasureText: false
    rendererMayRelayout: false
    mayPublishLayout: false
    productionBinding: false
  }
}

export type VNextTextBlockInitialFlowTextOnlyAdapterResultV1 =
  | (AdapterBase & {
      status: "accepted-text-subset"
      layout: VNextTextBlockAcceptedMultiRunLayoutV1
      fingerprint: string
      issues: []
    })
  | (AdapterBase & {
      status: "blocked"
      layout: null
      fingerprint: null
      issues: VNextTextBlockInitialFlowTextOnlyAdapterIssueV1[]
    })

function clone<T>(value: T): T {
  return JSON.parse(stringifyVNextCanonicalJson(value)) as T
}

function compact(value: unknown): string {
  return createVNextCompactFingerprint(stringifyVNextCanonicalJson(value))
}

function base(initialFlowFingerprint: string, layoutId: string): AdapterBase {
  return {
    source: VNEXT_TEXT_BLOCK_INITIAL_FLOW_TEXT_ONLY_ADAPTER_SOURCE,
    contractVersion: VNEXT_TEXT_BLOCK_INITIAL_FLOW_TEXT_ONLY_ADAPTER_VERSION,
    initialFlowFingerprint,
    layoutId,
    contracts: {
      legacyTextSubsetOnly: true,
      completeGeometryClassified: true,
      rendererMayMeasureText: false,
      rendererMayRelayout: false,
      mayPublishLayout: false,
      productionBinding: false,
    },
  }
}

function blocked(
  initialFlowFingerprint: string,
  layoutId: string,
  code: VNextTextBlockInitialFlowTextOnlyAdapterIssueCodeV1,
  path: string,
  message: string,
): VNextTextBlockInitialFlowTextOnlyAdapterResultV1 {
  return {
    ...base(initialFlowFingerprint, layoutId),
    status: "blocked",
    layout: null,
    fingerprint: null,
    issues: [{ code, severity: "error", path, message }],
  }
}

interface AdapterEnvelope {
  initialFlow: unknown
  legacyRequest: unknown
}

function dataProperty(
  value: object,
  key: PropertyKey,
): PropertyDescriptor | null {
  const descriptor = Object.getOwnPropertyDescriptor(value, key)
  return descriptor != null && Object.hasOwn(descriptor, "value") ? descriptor : null
}

function safeEnvelope(input: unknown): AdapterEnvelope | null {
  try {
    if (input == null || typeof input !== "object" || Array.isArray(input)) return null
    const prototype = Object.getPrototypeOf(input)
    if (prototype !== Object.prototype && prototype !== null) return null
    const keys = Reflect.ownKeys(input)
    if (
      keys.length !== 2
      || keys.some((key) => key !== "initialFlow" && key !== "legacyRequest")
    ) return null
    const initialFlow = dataProperty(input, "initialFlow")
    const legacyRequest = dataProperty(input, "legacyRequest")
    if (
      initialFlow == null
      || legacyRequest == null
      || initialFlow.enumerable !== true
      || legacyRequest.enumerable !== true
    ) return null
    return {
      initialFlow: initialFlow.value,
      legacyRequest: legacyRequest.value,
    }
  } catch {
    return null
  }
}

export function adaptVNextTextBlockInitialFlowToLegacyLayoutV1(input: {
  initialFlow: VNextTextBlockInitialFlowV1
  legacyRequest: VNextTextBlockMultiRunLayoutRequestV1
}): VNextTextBlockInitialFlowTextOnlyAdapterResultV1
export function adaptVNextTextBlockInitialFlowToLegacyLayoutV1(
  input: unknown,
): VNextTextBlockInitialFlowTextOnlyAdapterResultV1
export function adaptVNextTextBlockInitialFlowToLegacyLayoutV1(
  input: unknown,
): VNextTextBlockInitialFlowTextOnlyAdapterResultV1 {
  const envelope = safeEnvelope(input)
  if (envelope == null) return blocked(
    ADAPTER_METADATA_UNAVAILABLE,
    ADAPTER_METADATA_UNAVAILABLE,
    "invalid-initial-flow",
    "input",
    "adapter input must be a strict object containing only initialFlow and legacyRequest",
  )

  const binding = inspectVNextTextBlockInitialFlowRequestBindingV1({
    initialFlow: envelope.initialFlow,
    request: envelope.legacyRequest,
  })
  if (binding.status !== "accepted") {
    const bindingIssue = binding.issues[0]
    return blocked(
      binding.initialFlowFingerprint,
      binding.layoutId,
      bindingIssue?.code === "request-context-mismatch"
        ? "legacy-context-mismatch"
        : bindingIssue?.code === "initial-flow-capability-required"
          ? "initial-flow-capability-required"
          : "invalid-initial-flow",
      bindingIssue?.path === "request" ? "legacyRequest" : "initialFlow",
      bindingIssue?.message ?? "Initial Flow request binding was unavailable",
    )
  }

  const flow = binding.initialFlow
  const request = binding.request
  const layout = acceptVNextTextBlockMultiRunLayoutV1(request)
  if (layout.status !== "accepted") return blocked(
    flow.fingerprint, request.layoutId, "legacy-layout-rejected", "legacyRequest",
    `legacy MR1 layout rejected the request: ${layout.issues.map((item) => item.code).join(", ")}`,
  )
  const facts = {
    ...base(flow.fingerprint, request.layoutId),
    status: "accepted-text-subset" as const,
    layout: clone(layout),
  }
  return {
    ...facts,
    fingerprint: compact(facts),
    issues: [],
  }
}
