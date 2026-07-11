export const VNEXT_IMAGE_SOURCE_CONTRACT_VERSION = 1 as const

export const VNEXT_IMAGE_SOURCE_CONTRACT = {
  status: "decision-only",
  contractVersion: VNEXT_IMAGE_SOURCE_CONTRACT_VERSION,
  targetVersions: {
    packageVersion: 3,
    documentVersion: 4,
    assetRegistryVersion: 1,
    fieldRegistryVersion: 1,
    dataSnapshotVersion: 2,
  },
  sourceKinds: ["asset-ref", "image-field-ref"],
  placementTypes: ["inline-image", "image"],
  assetOwnership: {
    manifestOwner: "package",
    bytesOwner: "backend",
    locatorOwner: "backend",
    identity: "immutable-opaque-asset-id",
    digest: "sha256",
    canonicalMediaTypes: ["image/png", "image/jpeg"],
    packageStoresBytes: false,
    packageStoresLocator: false,
  },
  placement: {
    accessibility: "described-or-decorative",
    frame: "required-width-and-height",
    fitModes: ["contain", "cover"],
    crop: "optional-normalized-source-rectangle",
    inlineAtomicSlotCount: 1,
    floatingWrap: false,
  },
  lifecycle: {
    uploadStateOwner: "backend",
    cropOwner: "authored-placement",
    destructiveTransformCreatesNewAsset: true,
    referencedAssetDeletion: "blocked",
    blobGarbageCollectionOwner: "backend-retention-policy",
  },
} as const

export type VNextImageSourceContract = typeof VNEXT_IMAGE_SOURCE_CONTRACT
