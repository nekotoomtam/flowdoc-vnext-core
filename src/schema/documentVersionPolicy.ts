export const VNEXT_ACTIVE_PACKAGE_VERSION = 2 as const
export const VNEXT_ACTIVE_DOCUMENT_VERSION = 3 as const
export const VNEXT_TEXT_BLOCK_V1_TARGET_DOCUMENT_VERSION = 4 as const

export const VNEXT_TEXT_BLOCK_V1_VERSION_POLICY = {
  status: "decision-only",
  active: {
    packageVersion: VNEXT_ACTIVE_PACKAGE_VERSION,
    documentVersion: VNEXT_ACTIVE_DOCUMENT_VERSION,
  },
  target: {
    packageVersion: 3,
    documentVersion: VNEXT_TEXT_BLOCK_V1_TARGET_DOCUMENT_VERSION,
    packageVersionCondition: "image-registry-requires-package-envelope-change",
  },
  migration: {
    mode: "explicit-copy-forward",
    automaticReadNormalization: false,
    sourceMutation: false,
    coreOwnsSemanticPlan: true,
    backendOwnsRevisionedPersistence: true,
  },
  activationBlockers: [
    "editor-explicit-migration-intent",
    "v4-mutation-layout-render-support",
  ],
} as const

export type VNextTextBlockV1VersionPolicy = typeof VNEXT_TEXT_BLOCK_V1_VERSION_POLICY
