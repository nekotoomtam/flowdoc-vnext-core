import { describe, expect, it } from "vitest"
import {
  FLOWDOC_IMPORTED_TEXT_NORMALIZATION_PROFILE_ID,
  createFlowDocImportedTextNormalizationEvidenceV1,
  normalizeFlowDocImportedTextV1,
} from "../packages/uat-realdoc/src/index.js"

describe("PDF-EXPORT-REALDOC-D.1 imported text normalization", () => {
  it("removes PDF layout wraps while preserving semantic list boundaries", () => {
    const source = [
      "หน้าจอแสดงส่วนของ Path Navigate กำกับชื่อเมนู",
      "\"ทะเบียนข้อมูลหอผู้ป่วย\" โดยมีปุ่มสำหรับการ",
      "จัดการ ดังนี้",
      "- ปุ่ม \"ส่งออกข้อมูล\": เมื่อกดระบบต้องทำการ ส่ง",
      "ออกไฟล์ Excel ที่เป็นรายการข้อมูลของหอผู้ป่วย",
      "ทั้งหมดภายในโรงพยาบาล",
      "- ปุ่ม \"นำเข้าข้อมูล\": เมื่อกดระบบต้องทำการ Auto",
      "Direct ไปยังเมนูนำเข้าข้อมูลอย่างง่าย",
    ].join("\n")

    const result = normalizeFlowDocImportedTextV1(source)

    expect(result.profileId).toBe(FLOWDOC_IMPORTED_TEXT_NORMALIZATION_PROFILE_ID)
    expect(result.renderedText).toBe([
      "หน้าจอแสดงส่วนของ Path Navigate กำกับชื่อเมนู \"ทะเบียนข้อมูลหอผู้ป่วย\" โดยมีปุ่มสำหรับการจัดการ ดังนี้",
      "- ปุ่ม \"ส่งออกข้อมูล\": เมื่อกดระบบต้องทำการ ส่งออกไฟล์ Excel ที่เป็นรายการข้อมูลของหอผู้ป่วยทั้งหมดภายในโรงพยาบาล",
      "- ปุ่ม \"นำเข้าข้อมูล\": เมื่อกดระบบต้องทำการ Auto Direct ไปยังเมนูนำเข้าข้อมูลอย่างง่าย",
    ].join("\n"))
    expect(result.blocks.map((block) => ({
      kind: block.kind,
      marker: block.marker,
      sourceLineStart: block.sourceLineStart,
      sourceLineEnd: block.sourceLineEnd,
    }))).toEqual([
      { kind: "paragraph", marker: null, sourceLineStart: 0, sourceLineEnd: 2 },
      { kind: "list-item", marker: "-", sourceLineStart: 3, sourceLineEnd: 5 },
      { kind: "list-item", marker: "-", sourceLineStart: 6, sourceLineEnd: 7 },
    ])
    expect(result.summary).toMatchObject({
      sourceLineCount: 8,
      blockCount: 3,
      paragraphBlockCount: 1,
      listItemBlockCount: 2,
      softWrapJoinCount: 5,
      preservedBreakCount: 2,
      changed: true,
    })
  })

  it("uses blank lines as paragraph boundaries and supports common list markers", () => {
    const result = normalizeFlowDocImportedTextV1([
      "First visual line",
      "continues here.",
      "",
      "Second paragraph.",
      "* First item",
      "continued item text",
      "1. Ordered item",
    ].join("\n"))

    expect(result.renderedText).toBe([
      "First visual line continues here.",
      "Second paragraph.",
      "* First item continued item text",
      "1. Ordered item",
    ].join("\n"))
    expect(result.blocks.map((block) => block.kind)).toEqual([
      "paragraph", "paragraph", "list-item", "list-item",
    ])
    expect(result.summary.blankLineBoundaryCount).toBe(1)
  })

  it("is deterministic and exposes content-free normalization evidence", () => {
    const first = normalizeFlowDocImportedTextV1("โรง\nพยาบาล\n- Auto\nDirect")
    const second = normalizeFlowDocImportedTextV1("โรง\nพยาบาล\n- Auto\nDirect")
    const evidence = createFlowDocImportedTextNormalizationEvidenceV1(first)

    expect(second).toEqual(first)
    expect(first.renderedText).toBe("โรงพยาบาล\n- Auto Direct")
    expect(evidence).not.toHaveProperty("renderedText")
    expect(JSON.stringify(evidence)).not.toContain("โรงพยาบาล")
    expect(evidence.blocks.every((block) => block.textFingerprint.startsWith("sha256:"))).toBe(true)
  })
})
