import {
  FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_LINE_BREAK_POLICY,
  FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_DATA_REVISION,
  FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_REVISION,
  FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SHAPER_REVISION,
  FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_WASM_SHA256,
} from "./runtimeCommon.js"

export const FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_ACCEPTED_MANIFEST_ID =
  "measurement-evidence-summary-manifest-accepted-minimal-v1" as const
export const FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SOURCE_MEASUREMENT_PROFILE_ID =
  "measurement-profile-v1:thai-rustybuzz-icu4x-v1:measurement-policy-v1:fonts-font-noto-sans-thai-bold-700-normal-0be544f347b3ab63+font-noto-sans-thai-regular-400-normal-9acb585d8662ca4e+font-sarabun-bold-700-normal-5d1fc1ee63ab861f+font-sarabun-bold-italic-700-italic-a497ef98fad371e0+font-sarabun-italic-400-italic-fb86138e0cf99786+font-sarabun-regular-400-normal-b8150084e25734e6:styles-style-heading-xl-sarabun-bold-noto-sans-thai-bold-noto-sans-thai-regular+style-paragraph-sarabun-regular-noto-sans-thai-regular+style-text-block-paragraph-sarabun-regular-noto-sans-thai-regular:shape-rustybuzz-rustybuzz-wasm-rustybuzz-planned-kern-liga-complex-clusters:segment-icu4x-icu4x-segmenter-icu4x-planned-icu4x-data-planned-icu4x-uax14-thai-v1:fallback-explicit-font-list-v1:output-glyph-line-box-v1" as const
export const FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_MEASUREMENT_PROFILE_ID =
  "live-draft-xr1-smoke-profile-v1:sarabun-regular-b8150084e25734e6:rustybuzz-0.20.1:icu-segmenter-2.2.0:icu-data-2.2.0:icu4x-uax14-thai-v1:glyph-break-smoke-v1" as const

export interface FlowDocTextEngineLiveDraftSmokeRowV1 {
  fixtureId: "v1-measure-thai-line-break-core" | "v1-measure-latin-product-paragraphs"
  scenarioId: "thai-greeting-no-space" | "product-report-vnext-minimal"
  rowId: string
  text: string
  locale: "th" | "en"
  fontId: "sarabun-regular"
  fontAssetPath: "assets/fonts/Sarabun/Sarabun-Regular.ttf"
  fontSha256: "b8150084e25734e6f31696c57ff009f5564efa09d295848b717d9e2328c0311d"
}

export const FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SMOKE_ROWS_V1 = [
  {
    fixtureId: "v1-measure-thai-line-break-core",
    scenarioId: "thai-greeting-no-space",
    rowId: "live-draft-xr1-thai-greeting-no-space",
    text: "สวัสดีครับตูม",
    locale: "th",
    fontId: "sarabun-regular",
    fontAssetPath: "assets/fonts/Sarabun/Sarabun-Regular.ttf",
    fontSha256: "b8150084e25734e6f31696c57ff009f5564efa09d295848b717d9e2328c0311d",
  },
  {
    fixtureId: "v1-measure-latin-product-paragraphs",
    scenarioId: "product-report-vnext-minimal",
    rowId: "live-draft-xr1-latin-prepared-summary",
    text: "Prepared summary",
    locale: "en",
    fontId: "sarabun-regular",
    fontAssetPath: "assets/fonts/Sarabun/Sarabun-Regular.ttf",
    fontSha256: "b8150084e25734e6f31696c57ff009f5564efa09d295848b717d9e2328c0311d",
  },
] as const satisfies readonly FlowDocTextEngineLiveDraftSmokeRowV1[]

export const FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SMOKE_IDENTITY_V1 = {
  acceptedManifestId: FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_ACCEPTED_MANIFEST_ID,
  sourceAcceptedMeasurementProfileId: FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SOURCE_MEASUREMENT_PROFILE_ID,
  measurementProfileId: FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_MEASUREMENT_PROFILE_ID,
  wasmSha256: FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_WASM_SHA256,
  shaperRevision: FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SHAPER_REVISION,
  segmenterRevision: FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_REVISION,
  segmenterDataRevision: FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_SEGMENTER_DATA_REVISION,
  lineBreakPolicy: FLOWDOC_TEXT_ENGINE_LIVE_DRAFT_LINE_BREAK_POLICY,
} as const
