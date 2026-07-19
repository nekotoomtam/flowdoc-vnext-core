import { createHash } from "node:crypto"
import {
  createVNextPublishedStructureGenerationDataContractV1,
  createVNextPublishedStructureMappingProfileV1,
} from "@flowdoc/vnext-core"
import {
  FLOWDOC_UAT_GENERATION_MAPPER_IMPLEMENTATION_FINGERPRINT,
} from "./uatGenerationMapper.js"
import {
  FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_ID,
  FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_VERSION,
} from "./uatSemanticNoPagesAdapter.js"
import {
  createFlowDocUatStructureDefinitionV1,
  flowDocUatPublishedStructureRefV1,
} from "./uatStructureDefinition.js"

export const FLOWDOC_UAT_GENERATION_DATA_CONTRACT_ID = "uat-e2-generation-data-v1" as const
export const FLOWDOC_UAT_GENERATION_MAPPING_PROFILE_ID = "uat-semantic-no-pages-e2-v1" as const

function schemaFingerprint(): string {
  return `sha256:${createHash("sha256").update(JSON.stringify({
    sourceContractId: "uat_semantic_no_pages_v1",
    sourceContractVersion: 1,
    adapterId: FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_ID,
    adapterVersion: FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_VERSION,
    inputContract: "FlowDocUatGenerationPayloadV1",
  })).digest("hex")}`
}

export function createFlowDocUatGenerationDataContractV1() {
  const uat = createFlowDocUatStructureDefinitionV1()
  return createVNextPublishedStructureGenerationDataContractV1({
    dataContractId: FLOWDOC_UAT_GENERATION_DATA_CONTRACT_ID,
    publishedStructure: uat.structure,
    publishedStructureFingerprint: uat.structureFingerprint,
    fieldContract: uat.fieldContract,
    collectionItemContract: uat.collectionItemContract,
  })
}

export function createFlowDocUatGenerationMappingProfileV1() {
  const contract = createFlowDocUatGenerationDataContractV1()
  return createVNextPublishedStructureMappingProfileV1({
    mappingProfileId: FLOWDOC_UAT_GENERATION_MAPPING_PROFILE_ID,
    mappingProfileVersion: 1,
    owner: flowDocUatPublishedStructureRefV1(),
    sourceContract: {
      sourceContractId: "uat_semantic_no_pages_v1",
      sourceContractVersion: 1,
      schemaFingerprint: schemaFingerprint(),
    },
    target: {
      dataContractId: contract.dataContractId,
      dataContractFingerprint: contract.dataContractFingerprint,
    },
    execution: {
      kind: "named-adapter",
      adapterId: FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_ID,
      adapterVersion: FLOWDOC_UAT_SEMANTIC_NO_PAGES_ADAPTER_VERSION,
      implementationFingerprint: FLOWDOC_UAT_GENERATION_MAPPER_IMPLEMENTATION_FINGERPRINT,
    },
  })
}
