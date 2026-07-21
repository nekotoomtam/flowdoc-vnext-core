import type { FlowDocTextEngineMultiRunFontFaceV1 } from "./multiRunLayoutContract.js"

export const FLOWDOC_TEXT_ENGINE_MR1_SARABUN_FONT_FACES_V1 = [
  {
    fontFaceId: "sarabun-regular",
    fontFamilyKey: "sarabun",
    fontFamily: "Sarabun",
    fontAssetPath: "assets/fonts/Sarabun/Sarabun-Regular.ttf",
    fontSha256: "b8150084e25734e6f31696c57ff009f5564efa09d295848b717d9e2328c0311d",
    weight: 400,
    style: "normal",
    unitsPerEm: 1_000,
    ascentFontUnit: 1_068,
    descentFontUnit: -232,
    lineGapFontUnit: 0,
  },
  {
    fontFaceId: "sarabun-bold",
    fontFamilyKey: "sarabun",
    fontFamily: "Sarabun",
    fontAssetPath: "assets/fonts/Sarabun/Sarabun-Bold.ttf",
    fontSha256: "5d1fc1ee63ab861fb2022a212b5ff270848582bb9d9cba73b2d2aaabb16d0a18",
    weight: 700,
    style: "normal",
    unitsPerEm: 1_000,
    ascentFontUnit: 1_068,
    descentFontUnit: -232,
    lineGapFontUnit: 0,
  },
] as const satisfies readonly FlowDocTextEngineMultiRunFontFaceV1[]
