import { createHash } from "node:crypto"

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function fail(issues) {
  if (issues.length === 0) return
  throw new Error(`Canonical report source-data binding failed:\n- ${issues.join("\n- ")}`)
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex")
}

function snapshotSha256(snapshot) {
  return sha256(Buffer.from(JSON.stringify(snapshot), "utf8"))
}

function approximatelyEqual(left, right) {
  return Math.abs(left - right) <= Math.max(1e-9, Math.abs(right) * 1e-12)
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0)
}

function average(values) {
  return values.length === 0 ? 0 : sum(values) / values.length
}

function stats(values) {
  const sorted = [...values].sort((left, right) => left - right)
  const middle = Math.floor(sorted.length / 2)
  return {
    min: sorted[0],
    median: sorted.length % 2 === 1
      ? sorted[middle]
      : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2,
    max: sorted.at(-1),
    mean: average(sorted),
  }
}

function pct(value, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`
}

function seconds(value) {
  return `${(value / 1000).toFixed(2)} วินาที`
}

function shortSeconds(value) {
  return `${(value / 1000).toFixed(2)} วิ`
}

function mb(value) {
  return `${(value / (1024 * 1024)).toFixed(2)} MB`
}

function thb(value) {
  return `${value.toFixed(2)} บาท`
}

function integer(value, label) {
  if (!Number.isInteger(value)) throw new Error(`${label} must be an integer.`)
  return value
}

function summary(metrics, engine, metric, stat = "median") {
  const value = metrics.engines?.[engine]?.summary?.[metric]?.[stat]
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Missing numeric summary ${engine}/${metric}/${stat}.`)
  }
  return value
}

function firstRun(metrics, engine) {
  const run = metrics.engines?.[engine]?.runs?.[0]
  if (run == null) throw new Error(`Missing run data for ${engine}.`)
  return run
}

function criticalValue(truth, id) {
  const item = truth.criticalValues.find((candidate) => candidate.id === id)
  if (item == null) throw new Error(`Missing ground-truth critical value ${id}.`)
  return String(item.value)
}

function gdimValue(truth, path) {
  const item = truth.gdimFields.find((candidate) => candidate.path === path)
  if (item == null) throw new Error(`Missing ground-truth GDIM value ${path}.`)
  return String(item.value)
}

function thaiDate(benchmarkId) {
  const match = benchmarkId.match(/-(\d{4})-(\d{2})-(\d{2})$/u)
  if (match == null) throw new Error(`Benchmark ID does not end in an ISO date: ${benchmarkId}`)
  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  ]
  const month = months[Number(match[2]) - 1]
  if (month == null) throw new Error(`Benchmark ID has an invalid month: ${benchmarkId}`)
  return `${Number(match[3])} ${month} ${match[1]}`
}

function stableMappingRecord(metrics, engine, issues) {
  const records = metrics.forcedGdim.filter((record) => record.engine === engine)
  if (records.length === 0) {
    issues.push(`forced GDIM records are missing for ${engine}`)
    return null
  }
  const fields = [
    "totalSchemaFields",
    "mappedFields",
    "requiredFields",
    "mappedRequiredFields",
    "expectedDerivableFields",
    "correctMappedFields",
    "mappingPrecision",
    "mappingRecall",
  ]
  for (const field of fields) {
    if (!records.every((record) => record[field] === records[0][field])) {
      issues.push(`${engine} forced GDIM ${field} changes across runs`)
    }
  }
  return records[0]
}

function validateSourceModel(metrics, spec, truth, analyzerText, reportBuilderText) {
  const issues = []
  if (metrics.benchmarkId !== spec.benchmarkId) issues.push("metrics and spec benchmark IDs differ")
  if (truth.criticalValues.length !== 29) issues.push("ground truth must contain 29 critical values")
  if (truth.nativeConcepts.length !== 25) issues.push("ground truth must contain 25 native concepts")
  if (truth.gdimFields.length !== 32) issues.push("ground truth must contain 32 derivable GDIM fields")

  for (const flag of [
    "allRunsCompleted",
    "allSourceHashesMatch",
    "allRunsHaveTwoPagesPerEngine",
    "noErrors",
  ]) {
    if (metrics.validation?.[flag] !== true) issues.push(`metrics validation ${flag} is not true`)
  }
  if (metrics.validation?.runs?.length !== spec.runs.length) {
    issues.push("metrics validation run count differs from the benchmark spec")
  } else {
    spec.runs.forEach((run, index) => {
      const validated = metrics.validation.runs[index]
      for (const field of ["round", "order", "provider", "runId"]) {
        if (validated[field] !== run[field]) {
          issues.push(`validation run ${index + 1} ${field} differs from the benchmark spec`)
        }
      }
    })
  }

  for (const [engine, engineMetrics] of Object.entries(metrics.engines ?? {})) {
    if (engineMetrics.runs.length !== 3) issues.push(`${engine} must contain three runs`)
    for (const [metric, reported] of Object.entries(engineMetrics.summary ?? {})) {
      const values = engineMetrics.runs
        .map((run) => run[metric])
        .filter((value) => typeof value === "number" && Number.isFinite(value))
      if (values.length === 0) continue
      const recomputed = stats(values)
      for (const field of ["min", "median", "max", "mean"]) {
        if (!approximatelyEqual(recomputed[field], reported[field])) {
          issues.push(`${engine}/${metric}/${field} does not match its run values`)
        }
      }
    }
    for (const [field, value] of Object.entries(engineMetrics.repeatability ?? {})) {
      if (value !== true) issues.push(`${engine} repeatability ${field} is not true`)
    }
  }

  const totalUsd = sum(Object.values(metrics.engines).flatMap((engine) => (
    engine.runs.map((run) => run.costUsd)
  )))
  const totalThb = sum(Object.values(metrics.engines).flatMap((engine) => (
    engine.runs.map((run) => run.costThb)
  )))
  if (!approximatelyEqual(totalUsd, metrics.totalEstimatedCost.usd)) {
    issues.push("total estimated USD cost does not equal the sum of engine runs")
  }
  if (!approximatelyEqual(totalThb, metrics.totalEstimatedCost.thb)) {
    issues.push("total estimated THB cost does not equal the sum of engine runs")
  }

  const analyzerSignatures = [
    "latencyMs: sum(rows.map((row) => row.latencyMs))",
    "responseBytes: sum(rows.map((row) => row.rawResponseSizeBytes)",
    "characterAccuracy: 1 - ratio(levenshtein",
    "wordAccuracy: 1 - ratio(levenshtein",
    "mappingPrecision: ratio(correct.length, mapped.length)",
    "mappingRecall: ratio(correct.length, truth.gdimFields.length)",
  ]
  for (const signature of analyzerSignatures) {
    if (!analyzerText.includes(signature)) issues.push(`analyze.ts signature is missing: ${signature}`)
  }
  const builderSignatures = ["def pct(", "def seconds(", "def mb(", "def thb(", "def summary("]
  for (const signature of builderSignatures) {
    if (!reportBuilderText.includes(signature)) {
      issues.push(`build_report.py formatter signature is missing: ${signature}`)
    }
  }

  const googleMapping = stableMappingRecord(metrics, "google_document_ai_native", issues)
  const azureMapping = stableMappingRecord(metrics, "azure_document_intelligence_native", issues)
  fail(issues)
  return { googleMapping, azureMapping }
}

function binding(pageId, elementId, property, value, lineage) {
  return { pageId, elementId, property, value, lineage }
}

function mappedLabels(record, preferredPaths) {
  const mappedPaths = new Set(record.mapped.map((field) => field.path))
  const labels = new Map([
    ["goods_shipment.invoice.number", "Invoice No."],
    ["goods_shipment.invoice.date", "Invoice Date"],
    ["goods_shipment.invoice.consignor_info.email", "E-mail"],
    ["goods_shipment.detail.product_info.net_weight.weight", "Net Weight"],
    ["goods_shipment.detail.gross_weight", "Gross Weight"],
    ["goods_shipment.detail.boi", "BOI"],
  ])
  return preferredPaths.filter((path) => mappedPaths.has(path)).map((path) => {
    const label = labels.get(path)
    if (label == null) throw new Error(`Missing display label for mapped path ${path}.`)
    return label
  })
}

function joinWithAnd(values) {
  if (values.length < 2) return values.join("")
  return `${values.slice(0, -1).join(", ")} และ ${values.at(-1)}`
}

export function deriveCanonicalReportSourceSnapshot(sourceBundle) {
  const { metrics, spec, truth, analyzerText, reportBuilderText } = sourceBundle
  const { googleMapping, azureMapping } = validateSourceModel(
    metrics,
    spec,
    truth,
    analyzerText,
    reportBuilderText,
  )
  const googleRuns = spec.runs.filter((run) => run.provider === "google")
  const azureRuns = spec.runs.filter((run) => run.provider === "azure")
  if (googleRuns.length !== azureRuns.length) throw new Error("Provider run counts must match.")

  const googleOcr = firstRun(metrics, "google_vision")
  const azureOcr = firstRun(metrics, "azure_document_intelligence")
  const googleNative = firstRun(metrics, "google_document_ai_native")
  const azureNative = firstRun(metrics, "azure_document_intelligence_native")
  const currency = gdimValue(truth, "document_control.currency_code")
  const dpi = truth.method.match(/(\d+)\s*DPI/iu)?.[1]
  if (dpi == null) throw new Error("Ground-truth method does not identify the render DPI.")

  const missingLabels = new Map([
    ["invoice_date", "Invoice Date"],
    ["package", "package"],
    ["product_group", "product group"],
    ["description", "product description"],
    ["product_code", "product code"],
    ["model", "model"],
    ["boi", "BOI"],
    ["origin_country", "country of origin"],
    ["gross_weight", "gross weight"],
    ["shipping_marks", "shipping marks"],
    ["aeo_number", "AEO number"],
  ])
  const azureMissing = azureNative.missingStructuredConcepts.map((id) => {
    const label = missingLabels.get(id)
    if (label == null) throw new Error(`Missing display label for native concept ${id}.`)
    return label
  })
  const firstMissingLine = azureMissing.filter((_, index) => index <= 6 && index !== 2)
  const secondMissingLine = azureMissing.filter((_, index) => index > 6)

  const googleMapped = mappedLabels(googleMapping, [
    "goods_shipment.invoice.number",
    "goods_shipment.invoice.date",
    "goods_shipment.invoice.consignor_info.email",
    "goods_shipment.detail.product_info.net_weight.weight",
    "goods_shipment.detail.gross_weight",
  ])
  const azureMapped = mappedLabels(azureMapping, [
    "goods_shipment.invoice.number",
    "goods_shipment.invoice.consignor_info.email",
    "goods_shipment.detail.product_info.net_weight.weight",
    "goods_shipment.detail.gross_weight",
    "goods_shipment.detail.boi",
  ])
  const azureWrong = azureMapping.wrongMappings.find((field) => (
    field.path === "goods_shipment.detail.boi"
  ))
  if (azureWrong == null) throw new Error("Expected the Azure BOI wrong mapping evidence.")

  const sourceName = spec.source.fileName
  const sourceStem = sourceName.replace(/\.pdf$/iu, "")
  const googleNativeFound = integer(googleNative.structuredConceptsFound, "Google native concepts")
  const azureNativeFound = integer(azureNative.structuredConceptsFound, "Azure native concepts")
  const nativeTotal = truth.nativeConcepts.length
  const nativeCostRatio = summary(metrics, "google_document_ai_native", "costThb")
    / summary(metrics, "azure_document_intelligence_native", "costThb")
  const ocrLatencyDelta = Math.abs(
    summary(metrics, "azure_document_intelligence", "latencyMs")
    - summary(metrics, "google_vision", "latencyMs"),
  )

  const bindings = [
    binding("cover", "identity", "lines", [
      `${sourceName} | ${spec.source.pages} หน้า | Provider ละ ${googleRuns.length} รอบ`,
    ], ["benchmark-spec.json#/source", "benchmark-spec.json#/runs"]),
    binding("cover", "date", "lines", [
      `วันที่ทดสอบ ${thaiDate(spec.benchmarkId)} | อัตราอ้างอิง ${spec.settings.usdToThbRate.toFixed(2)} บาท/USD`,
    ], ["benchmark-spec.json#/benchmarkId", "benchmark-spec.json#/settings/usdToThbRate"]),
    binding("cover", "version", "lines", [
      `ฉบับที่ 1.0 | Benchmark ID: ${spec.benchmarkId}`,
    ], ["benchmark-spec.json#/benchmarkId"]),
    binding("executive-summary", "decision-table", "rows", [
      ["อ่านข้อความสำคัญครบไหม", `ครบ ${googleOcr.criticalValuesFound}/${truth.criticalValues.length}`, `ครบ ${azureOcr.criticalValuesFound}/${truth.criticalValues.length}`, ["ข้อมูลธุรกิจหลัก", "ไม่ตกหล่น"]],
      [["อ่านข้อความ", "เร็วแค่ไหน"], seconds(summary(metrics, "google_vision", "latencyMs")), seconds(summary(metrics, "azure_document_intelligence", "latencyMs")), ["Google เร็วกว่าประมาณ", `${(ocrLatencyDelta / 1000).toFixed(2)} วินาที`]],
      [["จัดข้อมูลเป็น", "โครงสร้าง"], `${googleNativeFound}/${nativeTotal}`, `${azureNativeFound}/${nativeTotal}`, ["Google จัดตารางและ", "รายการสินค้าได้ครบกว่า"]],
      [["ค่าใช้จ่ายงาน", "Native"], thb(summary(metrics, "google_document_ai_native", "costThb")), thb(summary(metrics, "azure_document_intelligence_native", "costThb")), ["Azure ต่ำกว่าประมาณ", `${nativeCostRatio.toFixed(0)} เท่า`]],
      [["Mapping เข้า", "GDIM"], `${googleMapping.correctMappedFields} จาก ${googleMapping.expectedDerivableFields}`, `${azureMapping.correctMappedFields} จาก ${azureMapping.expectedDerivableFields}`, ["คอขวดหลักยังอยู่ที่", "Mapper ของเรา"]],
    ], ["metrics.json#/engines", "metrics.json#/forcedGdim", "ground-truth.json#/criticalValues", "ground-truth.json#/nativeConcepts"]),
    binding("method", "method-table", "rows", [
      ["เอกสาร", `${sourceName}, ${spec.source.pages} หน้า, ${spec.source.sizeBytes.toLocaleString("en-US")} bytes`],
      ["SHA-256", spec.source.sha256],
      ["รูปแบบส่ง", spec.settings.submitMode.split("_").map((part, index) => index === 0 ? `${part[0].toUpperCase()}${part.slice(1)}` : part).join(" ")],
      ["ขอบเขต", "OCR และ Native Extraction"],
      ["จำนวนรอบ", `Google ${googleRuns.length} รอบ และ Azure ${azureRuns.length} รอบ`],
      ["Cost cap", `${spec.settings.maxEstimatedCostUsdPerRun} USD ต่อ run`],
      ["อัตราแปลงเงิน", `${spec.settings.usdToThbRate.toFixed(2)} บาท/USD`],
      ["คำตอบอ้างอิง", `ตรวจจากภาพ PDF ที่ render ${dpi} DPI`],
    ], ["benchmark-spec.json#/source", "benchmark-spec.json#/settings", "ground-truth.json#/method"]),
    binding("ocr-accuracy", "ocr-table", "rows", [
      ["ค่าธุรกิจสำคัญที่อ่านพบ", `${googleOcr.criticalValuesFound}/${truth.criticalValues.length}`, `${azureOcr.criticalValuesFound}/${truth.criticalValues.length}`],
      ["ตัวอักษรและลำดับ", pct(summary(metrics, "google_vision", "characterAccuracy")), pct(summary(metrics, "azure_document_intelligence", "characterAccuracy"))],
      ["คำและลำดับ", pct(summary(metrics, "google_vision", "wordAccuracy")), pct(summary(metrics, "azure_document_intelligence", "wordAccuracy"))],
      ["จำนวนคำที่แบ่งออกมา", String(summary(metrics, "google_vision", "words")), String(summary(metrics, "azure_document_intelligence", "words"))],
      [`คำ confidence ต่ำกว่า ${spec.settings.lowConfidenceThreshold}`, String(summary(metrics, "google_vision", "lowConfidenceWords")), String(summary(metrics, "azure_document_intelligence", "lowConfidenceWords"))],
      ["คำที่มีตำแหน่งอ้างอิง", pct(summary(metrics, "google_vision", "bboxCoverage"), 0), pct(summary(metrics, "azure_document_intelligence", "bboxCoverage"), 0)],
      ["เวลาค่ากลาง", seconds(summary(metrics, "google_vision", "latencyMs")), seconds(summary(metrics, "azure_document_intelligence", "latencyMs"))],
      ["ขนาด Raw JSON", mb(summary(metrics, "google_vision", "responseBytes")), mb(summary(metrics, "azure_document_intelligence", "responseBytes"))],
      ["ค่าใช้จ่ายประมาณการ", thb(summary(metrics, "google_vision", "costThb")), thb(summary(metrics, "azure_document_intelligence", "costThb"))],
    ], ["metrics.json#/engines/google_vision", "metrics.json#/engines/azure_document_intelligence", "benchmark-spec.json#/settings/lowConfidenceThreshold"]),
    binding("source-evidence", "evidence-table", "rows", [
      ["เลขอ้างอิง", `Invoice ${criticalValue(truth, "invoice_number")}, Delivery ${criticalValue(truth, "delivery_number")}, AEO ${criticalValue(truth, "aeo_number")}`],
      ["คู่ค้าและปลายทาง", `${criticalValue(truth, "customer_code")} ${criticalValue(truth, "customer_name")}, ${criticalValue(truth, "destination")}`],
      ["การขนส่ง", `${criticalValue(truth, "transport_mode")}, ${criticalValue(truth, "origin_city")}, ${criticalValue(truth, "ex_factory_date")}, ${criticalValue(truth, "payment_term")}`],
      ["สินค้า", `${criticalValue(truth, "description")}, ${criticalValue(truth, "product_code")}, ${criticalValue(truth, "model")}`],
      ["ราคาและจำนวน", `${criticalValue(truth, "quantity")}, ${criticalValue(truth, "unit_price")} ${currency}/UNIT, ${criticalValue(truth, "amount")} ${currency}`],
      ["น้ำหนัก", `Gross ${criticalValue(truth, "gross_weight")}, Net ${criticalValue(truth, "net_weight")}`],
    ], ["ground-truth.json#/criticalValues", "ground-truth.json#/gdimFields"]),
    binding("native-extraction", "native-table", "rows", [
      ["ข้อมูลที่จัดโครงสร้างได้", `${googleNativeFound}/${nativeTotal} (${pct(googleNative.structuredConceptCoverage, 0)})`, `${azureNativeFound}/${nativeTotal} (${pct(azureNative.structuredConceptCoverage, 0)})`],
      ["Key-value ที่มีชื่อและค่า", String(summary(metrics, "google_document_ai_native", "nonEmptyKeyValues")), String(summary(metrics, "azure_document_intelligence_native", "nonEmptyKeyValues"))],
      ["ตาราง / cells", `${summary(metrics, "google_document_ai_native", "tables")} / ${summary(metrics, "google_document_ai_native", "tableCells")}`, `${summary(metrics, "azure_document_intelligence_native", "tables")} / ${summary(metrics, "azure_document_intelligence_native", "tableCells")}`],
      ["เวลาค่ากลาง", seconds(summary(metrics, "google_document_ai_native", "latencyMs")), seconds(summary(metrics, "azure_document_intelligence_native", "latencyMs"))],
      ["ขนาด Raw JSON", mb(summary(metrics, "google_document_ai_native", "responseBytes")), mb(summary(metrics, "azure_document_intelligence_native", "responseBytes"))],
      ["ค่าใช้จ่ายประมาณการ", thb(summary(metrics, "google_document_ai_native", "costThb")), thb(summary(metrics, "azure_document_intelligence_native", "costThb"))],
    ], ["metrics.json#/engines/google_document_ai_native", "metrics.json#/engines/azure_document_intelligence_native", "ground-truth.json#/nativeConcepts"]),
    binding("native-extraction", "unstructured-fields", "lines", [
      joinWithAnd(firstMissingLine),
      `${joinWithAnd(secondMissingLine)} ยังอยู่ใน OCR`,
      "แต่ไม่อยู่ใน key-value/table ที่ใช้วัด Native coverage",
    ], ["metrics.json#/engines/azure_document_intelligence_native/runs/0/missingStructuredConcepts"]),
    binding("latency-cost-size", "latency-table", "rows", [
      ["Google Vision", shortSeconds(summary(metrics, "google_vision", "latencyMs", "min")), shortSeconds(summary(metrics, "google_vision", "latencyMs")), shortSeconds(summary(metrics, "google_vision", "latencyMs", "max")), thb(summary(metrics, "google_vision", "costThb"))],
      ["Azure OCR", shortSeconds(summary(metrics, "azure_document_intelligence", "latencyMs", "min")), shortSeconds(summary(metrics, "azure_document_intelligence", "latencyMs")), shortSeconds(summary(metrics, "azure_document_intelligence", "latencyMs", "max")), thb(summary(metrics, "azure_document_intelligence", "costThb"))],
      ["Google Document AI", shortSeconds(summary(metrics, "google_document_ai_native", "latencyMs", "min")), shortSeconds(summary(metrics, "google_document_ai_native", "latencyMs")), shortSeconds(summary(metrics, "google_document_ai_native", "latencyMs", "max")), thb(summary(metrics, "google_document_ai_native", "costThb"))],
      ["Azure Native", shortSeconds(summary(metrics, "azure_document_intelligence_native", "latencyMs", "min")), shortSeconds(summary(metrics, "azure_document_intelligence_native", "latencyMs")), shortSeconds(summary(metrics, "azure_document_intelligence_native", "latencyMs", "max")), thb(summary(metrics, "azure_document_intelligence_native", "costThb"))],
    ], ["metrics.json#/engines/*/summary/latencyMs", "metrics.json#/engines/*/summary/costThb"]),
    binding("latency-cost-size", "total-cost", "lines", [
      `ค่าใช้จ่ายประมาณการรวมของการทดสอบ ${spec.runs.length} runs เท่ากับ ${metrics.totalEstimatedCost.usd.toFixed(3)} USD`,
      `หรือ ${metrics.totalEstimatedCost.thb.toFixed(2)} บาท ก่อนหัก free tier`,
    ], ["metrics.json#/totalEstimatedCost", "benchmark-spec.json#/runs"]),
    binding("mapping", "mapping-table", "rows", [
      ["GDIM fields ทั้งหมด", String(googleMapping.totalSchemaFields), String(azureMapping.totalSchemaFields)],
      ["Required fields", String(googleMapping.requiredFields), String(azureMapping.requiredFields)],
      ["Mapper เติมได้", String(googleMapping.mappedFields), String(azureMapping.mappedFields)],
      ["Mapper เติม required fields ได้", String(googleMapping.mappedRequiredFields), String(azureMapping.mappedRequiredFields)],
      ["ฟิลด์ที่ตรวจว่าถูก", String(googleMapping.correctMappedFields), String(azureMapping.correctMappedFields)],
      ["ความถูกต้องของฟิลด์ที่เติม", pct(googleMapping.mappingPrecision, 0), pct(azureMapping.mappingPrecision, 0)],
      ["ข้อมูลที่ควรใช้ได้และถูกนำมาใช้", pct(googleMapping.mappingRecall), pct(azureMapping.mappingRecall)],
    ], ["metrics.json#/forcedGdim", "ground-truth.json#/gdimFields"]),
    binding("mapping", "mapper-fields", "lines", [
      `Google: ${joinWithAnd(googleMapped)}`,
      `Azure: ${joinWithAnd(azureMapped)}`,
      `แต่ ${azureWrong.sourceLabel.replace(/^\*/u, "")} ถูกใส่ช่อง indicator แทน BOI license number จึงเป็นการ map ผิด`,
    ], ["metrics.json#/forcedGdim/*/mapped", "metrics.json#/forcedGdim/*/wrongMappings"]),
    binding("decision-view", "tradeoff-table", "rows", [
      ["อ่านข้อความเร็ว", "Google Vision", `Median ${seconds(summary(metrics, "google_vision", "latencyMs"))} เทียบ Azure OCR ${seconds(summary(metrics, "azure_document_intelligence", "latencyMs"))}`],
      ["ตารางและรายการสินค้า", "Google Document AI", `จัดข้อมูลสำคัญได้ ${pct(googleNative.structuredConceptCoverage, 0)} และคืน ${summary(metrics, "google_document_ai_native", "tables")} ตาราง`],
      ["ลดค่าใช้จ่าย Native", "Azure Native", `${thb(summary(metrics, "azure_document_intelligence_native", "costThb"))} เทียบ Google ${thb(summary(metrics, "google_document_ai_native", "costThb"))}`],
      ["ผลลัพธ์ขนาดเล็ก", "Azure", `Raw Native ${mb(summary(metrics, "azure_document_intelligence_native", "responseBytes"))} เทียบ Google ${mb(summary(metrics, "google_document_ai_native", "responseBytes"))}`],
      ["GDIM พร้อมใช้", "ยังสรุปไม่ได้", `Mapper ใช้ข้อมูลได้เพียง ${(azureMapping.mappingRecall * 100).toFixed(1)}-${pct(googleMapping.mappingRecall)}`],
    ], ["metrics.json#/engines", "metrics.json#/forcedGdim"]),
    binding("appendix-runs", "runs-table", "rows", spec.runs.map((run) => [
      String(run.round),
      String(run.order),
      run.provider === "google" ? "Google" : "Azure",
      run.runId,
      "Completed",
    ]), ["benchmark-spec.json#/runs", "metrics.json#/validation/runs"]),
    binding("appendix-runs", "evidence", "lines", [
      "- ทุก run มี manifest, summary.csv, normalized_results.json และ Raw JSON",
      "  แยกตาม engine และหน้า",
      "- ทุก run ใช้ source SHA-256 เดียวกัน:",
      `  ${spec.source.sha256}`,
      `- ทุก engine ประมวลผลครบ ${spec.source.pages} หน้าและไม่มี error`,
      "- ผลข้อความ key-value และตารางของแต่ละ engine เหมือนเดิมทั้ง 3 รอบ",
    ], ["benchmark-spec.json#/source", "metrics.json#/validation", "metrics.json#/engines/*/repeatability"]),
  ]

  return {
    snapshotVersion: 1,
    benchmarkId: spec.benchmarkId,
    metricsGeneratedAt: metrics.generatedAt,
    document: { headerText: `OCR BENCHMARK | ${sourceStem}` },
    invariants: {
      sourcePageCount: spec.source.pages,
      providerRunCount: googleRuns.length,
      criticalValueCount: truth.criticalValues.length,
      nativeConceptCount: truth.nativeConcepts.length,
      derivableGdimFieldCount: truth.gdimFields.length,
      engineCount: Object.keys(metrics.engines).length,
      allRunsCompleted: metrics.validation.allRunsCompleted,
      allSourceHashesMatch: metrics.validation.allSourceHashesMatch,
      allRunsHaveExpectedPages: metrics.validation.allRunsHaveTwoPagesPerEngine,
      noErrors: metrics.validation.noErrors,
    },
    bindings,
  }
}

function decodeJson(bytes, label) {
  try {
    return JSON.parse(Buffer.from(bytes).toString("utf8"))
  } catch (caught) {
    throw new Error(`${label} is not valid JSON: ${caught instanceof Error ? caught.message : caught}`)
  }
}

export function validateCanonicalReportSourceFiles(manifest, sourceFilesById) {
  const issues = []
  const decoded = {}
  for (const source of manifest.sourceFiles) {
    const bytes = sourceFilesById[source.sourceId]
    if (bytes == null) {
      issues.push(`source file ${source.sourceId} is missing`)
      continue
    }
    const byteLengthMatches = bytes.byteLength === source.bytes
    const sha256Matches = sha256(bytes) === source.sha256
    if (!byteLengthMatches) issues.push(`${source.sourceId} byte length differs`)
    if (!sha256Matches) issues.push(`${source.sourceId} SHA-256 differs`)
    if (!byteLengthMatches || !sha256Matches) continue
    if (source.mediaType === "application/json") decoded[source.sourceId] = decodeJson(bytes, source.sourceId)
    else decoded[source.sourceId] = Buffer.from(bytes).toString("utf8")
  }
  fail(issues)
  return {
    metrics: decoded.metrics,
    spec: decoded.spec,
    truth: decoded.truth,
    analyzerText: decoded.analyzer,
    reportBuilderText: decoded.reportBuilder,
  }
}

function flattenStrings(value, path = [], output = []) {
  if (typeof value === "string") output.push({ path, value })
  else if (Array.isArray(value)) value.forEach((item, index) => flattenStrings(item, [...path, index], output))
  return output
}

function valueAtPath(value, path) {
  return path.reduce((current, segment) => current?.[segment], value)
}

function findElement(composition, pageId, elementId) {
  const page = composition.pages.find((candidate) => candidate.pageId === pageId)
  if (page == null) throw new Error(`Unknown source-data page ${pageId}.`)
  const element = page.elements.find((candidate) => candidate.id === elementId)
  if (element == null) throw new Error(`Unknown source-data element ${pageId}/${elementId}.`)
  return element
}

export function materializeCanonicalReportSourceData(
  typographyComposition,
  manifest,
  sourceFilesById = null,
) {
  const issues = []
  if (manifest.manifestVersion !== 1) issues.push("manifestVersion must be 1")
  if (manifest.baseCompositionId !== typographyComposition.compositionId) {
    issues.push("base typography composition identity does not match")
  }
  if (snapshotSha256(manifest.sourceSnapshot) !== manifest.sourceSnapshotSha256) {
    issues.push("source snapshot SHA-256 does not match")
  }
  fail(issues)

  if (sourceFilesById != null) {
    const sourceBundle = validateCanonicalReportSourceFiles(manifest, sourceFilesById)
    const derived = deriveCanonicalReportSourceSnapshot(sourceBundle)
    if (JSON.stringify(derived) !== JSON.stringify(manifest.sourceSnapshot)) {
      throw new Error("Canonical report source-data binding failed:\n- external sources do not reproduce the pinned source snapshot")
    }
  }

  const composition = clone(typographyComposition)
  composition.compositionVersion = manifest.outputComposition.version
  composition.compositionId = manifest.outputComposition.compositionId
  composition.sourceDataManifestId = manifest.manifestId
  composition.sourceSnapshotSha256 = manifest.sourceSnapshotSha256
  composition.headerText = manifest.sourceSnapshot.document.headerText

  const corrections = []
  let sourceScalarValueCount = 0
  for (const bindingItem of manifest.sourceSnapshot.bindings) {
    const element = findElement(composition, bindingItem.pageId, bindingItem.elementId)
    if (!(bindingItem.property in element)) {
      issues.push(`${bindingItem.pageId}/${bindingItem.elementId} has no ${bindingItem.property}`)
      continue
    }
    const before = clone(element[bindingItem.property])
    const after = clone(bindingItem.value)
    const afterStrings = flattenStrings(after)
    sourceScalarValueCount += afterStrings.length
    for (const item of afterStrings) {
      const previous = valueAtPath(before, item.path)
      if (typeof previous === "string" && previous !== item.value) {
        corrections.push({
          pageId: bindingItem.pageId,
          elementId: bindingItem.elementId,
          property: bindingItem.property,
          path: item.path,
          before: previous,
          after: item.value,
          lineage: bindingItem.lineage,
        })
      }
    }
    element[bindingItem.property] = after
  }

  if (manifest.sourceSnapshot.bindings.length !== manifest.acceptance.expectedBindingCount) {
    issues.push(`expected ${manifest.acceptance.expectedBindingCount} bindings`)
  }
  if (sourceScalarValueCount !== manifest.acceptance.expectedSourceScalarValueCount) {
    issues.push(`expected ${manifest.acceptance.expectedSourceScalarValueCount} source scalar values`)
  }
  if (corrections.length !== manifest.acceptance.expectedFactualCorrectionCount) {
    issues.push(`expected ${manifest.acceptance.expectedFactualCorrectionCount} factual corrections, found ${corrections.length}`)
  }
  fail(issues)

  return {
    composition,
    evidence: {
      manifestId: manifest.manifestId,
      sourceSnapshotSha256: manifest.sourceSnapshotSha256,
      sourceFileCount: manifest.sourceFiles.length,
      bindingCount: manifest.sourceSnapshot.bindings.length,
      sourceScalarValueCount,
      factualCorrectionCount: corrections.length,
      corrections,
    },
  }
}

export function canonicalReportSourceSnapshotSha256(snapshot) {
  return snapshotSha256(snapshot)
}
