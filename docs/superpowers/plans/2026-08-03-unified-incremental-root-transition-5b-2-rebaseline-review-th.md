# เอกสารประกอบการรีวิวภาษาไทย: Phase 5B-2 Rebaseline Implementation Plan

**วันที่:** 2026-08-03
**สถานะ:** เอกสารช่วยรีวิว ไม่ใช่ implementation plan แยกต่างหาก
**เอกสารหลัก:**
`2026-08-03-unified-incremental-root-transition-5b-2-rebaseline.md`

หากถ้อยคำในไฟล์นี้ต่างจากเอกสารหลัก ให้หยุดและแก้สองไฟล์ให้ตรงกันก่อนเริ่ม
implementation

## 1. ภาพรวมคำตัดสิน

แผนเดิมหยุดที่ Task 6 เพราะฐาน Tasks 2-5 ยังไม่มี authority/work topology บาง
ส่วนที่ Task 6 ต้องใช้จริง การแก้รอบนี้จึงไม่ปะ Task 6 จุดเดียว แต่ทำตามลำดับ:

```text
Redo Tasks 2-3
  -> review 5B-2A
Redo Tasks 4-5
  -> review 5B-2B
Replace Tasks 6-8
  -> review 5B-2C
Close Tasks 9A-9B
  -> review 5B-2D
Activate Tasks 10-11
  -> full Core gate + user review
```

ยังไม่เริ่ม implementation จากการ commit แผน ผู้ใช้ต้องอนุมัติแผนใหม่แยกอีกครั้ง

### Correction ที่อนุมัติระหว่าง pre-TDD

ตอนเริ่ม Task 2 พบว่า complete Root creator ที่มีอยู่เป็น frozen V3 lane เท่านั้น
จึงเพิ่มลำดับที่ผู้ใช้ออกอนุมัติเมื่อ 2026-08-03:

- Task 2 สร้าง private 5B-2 complete-kernel scaffold และ internal test bootstrap
- ก่อน Task 10 เรียกได้เฉพาะ exact internal 5B-2 calibration/test policy
- ยังไม่ export public bootstrap, Attempt V2 หรือ manifest capability
- Tasks 4/5/8/9A เติม sidecar/child owners เข้า kernel เดิม
- Task 9B เรียก kernel เดิมด้วย `complete-fallback` ไม่สร้าง builder ที่สอง
- Task 10 จึงเปิด public `createVNextTextBlockUnifiedLayoutRoot5B2V1(...)`
- V3 bootstrap/Attempt V1/policy/fingerprint คง exact

## 2. การจัดการ Task 6 ที่ค้างอยู่

working tree ปัจจุบันมี partial Task 6 ที่ยังรับไม่ได้ แผนกำหนดให้ตอนเริ่ม execute:

1. เก็บ tracked diff และไฟล์ untracked ทั้งสองไว้ใน ignored evidence directory
2. คำนวณ SHA-256 เพื่อยืนยันว่าหลักฐานกู้คืนได้
3. restore เฉพาะรายชื่อไฟล์ Task 6 ที่ระบุไว้กลับ reviewed HEAD
4. หยุดทันทีถ้ามีไฟล์อื่น dirty
5. รัน baseline type-check และ full tests ใหม่

ขั้นนี้เกิดหลังผู้ใช้อนุมัติแผนเท่านั้น ไม่ได้ทำระหว่างการเขียนแผน

## 3. Checkpoint 5B-2A — Admission และ Evidence

### Task 2

- สร้าง private 5B-2 complete kernel สำหรับ test/bootstrap ภายในก่อน
- เพิ่ม exact Root-bound admission authority
- Attempt V2 รับเฉพาะ image-free, trivial Spatial, supported unchanged
  auto-height authored box
- reject `CR`, `LF`, `U+2028`, `U+2029`, `U+FFFC`
- ordinary range ห้ามคร่อมหรือแก้ structural hard break/inline image
- admission ต้องเกิดก่อน Evidence/Source/Flow/Line payload access
- แยก `true-no-op`, `semantic-only`, `paint-only`, `equal-metric`,
  `metric-affecting`

### Task 3

- ปิด shape ของ Evidence V2 ให้ request-scoped เท่านั้น
- producer และ Core acceptance คิด work ก่อนอ่าน descriptor/slot/atom/glyph/
  cluster/break/guard/proof
- Node กับ Worker-WASM ต้อง normalized equal
- failure/limit เก็บ factual work แต่ไม่สร้าง partial candidate

ผ่าน Task 2-3 แล้วต้องมีรีวิวภาษาไทยแยก และไม่มี Critical/Important ก่อน Task 4

## 4. Checkpoint 5B-2B — Source, Flow, Break และ Spatial

### Task 4

เพิ่ม private task-specific Source sidecars สองส่วน:

- physical Source index
- registered-style/refcount registry

ใช้ canonical versioned 8-way B+ shape, deterministic left-to-right balancing
และ path-copy เฉพาะ affected paths ไม่ใช้ unbounded history scan, whole clone
หรือ unmetered sort

Source authority ต้อง bind previous/next Source, admission/change, Evidence หรือ
layout-delta proof, policy, packing rule, index/style roots และ factual work ครบ

### Task 5

- exact Flow alias ใช้ได้เมื่อ physical mapping/provenance/offset/boundary ทุก
  field ยัง exact
- ถ้า layout เท่าเดิมแต่ Source fragmentation เปลี่ยน ต้อง metadata path-copy
- เพิ่ม private persistent relative Break Topology ที่ mirror exact Flow shape
- boundary ต่อ atom เป็น `prohibited | opportunity | mandatory`
- Task 6 รับ canonical Break groups จาก sidecar นี้ ห้ามเดา break ต่อ Flow atom
- exact trivial Spatial object ต้อง mint alias ใหม่ให้ exact next Source ทุก
  transition ที่ไม่ใช่ true no-op

Task 6 ห้ามเริ่มจน review 5B-2A และ 5B-2B ผ่านทั้งคู่

## 5. Checkpoint 5B-2C — Line, Reconvergence, E/R/N และ Geometry

### Task 6

- one-line algorithm ต้อง linear หรือมี amortized-linear proof
- คิด lookup/group/atom/source/fragment/line work ก่อน access
- long unbreakable และ zero-advance-heavy line ต้องถูก bound แม้
  `recomputed-lines = 1`
- Line splice รับ opaque boundary-path authority
- ห้าม `collectLeaves`, flatten, complete-root rebuild หรือ accepted-suffix walk

### Task 7

- exact reconvergence ใช้ exact registered summary/object/mapping/geometry
  authority
- canonical cover เลือก highest stored node และ left-to-right แบบ deterministic
- E/R/N mutually exclusive และ exhaustive
- `T = 0` และไม่มี Geometry/Scene/Delivery/policy path
- constant-translation suffix ต้อง fallback ก่อน enumerate suffix

### Task 8

- E retain exact line/internals/mapping/geometry
- R/N เท่านั้นที่ recompute/remap/validate และคิด factual work
- mint final Line binding ใหม่และ refresh recompute/source/spatial/authored
  sidecars
- ห้าม copy previous prepared Line record ทั้งก้อน

review 5B-2C ต้องยืนยันด้วย instrumentation ว่า exact 2,048-line suffix และ
translation-fallback suffix ไม่มี Line/Scene suffix reads

## 6. Checkpoint 5B-2D — Scene, Root, Fallback และ Oracle

### Task 9A

- Scene retain E subtrees และ replace เฉพาะ R/N chunks
- Delivery ใช้ canonical retain-range/splice-range
- payload estimate เป็น observation/delivery-estimation integrity เท่านั้น ไม่
  อยู่ใน semantic Scene identity และไม่เปลี่ยน execution policy
- Root register atomically หลัง Source/Flow/Break/Spatial/Line/Scene/Delivery
  authority และ work audit ผ่านครบ
- failure ห้ามให้ partial candidate เข้า fallback

### Task 9B

- Fallback V2 เป็น two-step และ candidate-independent
- request มีเฉพาะ sanitized public facts; private record เก็บ previous
  Root/change/policy/cause/stopped work
- complete material เข้าภายหลังและเรียก shared private 5B-2 complete kernel
- complete-fallback Root ต้องใช้ต่อเป็น previous Root ของ transition ถัดไปได้
- QA oracle author complete target แยก และห้าม import incremental candidate/
  splice helpers

## 7. Checkpoint 5B-2E — Work Policy และ Activation

### Task 10

- เพิ่ม exact ordered owner/unit registry
- ไม่มี handwritten row count; ใช้ `registry.length`
- ไม่มี T work unit
- ทุก runtime evaluator ต้อง map ไป owner/ledger เดียว
- calibration derive จาก checked-in fixture evidence
- ใช้ floor, absolute, relative formula แบบ deterministic
- test threshold-minus-one/equal/plus-one ทุก active unit
- เพิ่ม public `createVNextTextBlockUnifiedLayoutRoot5B2V1(...)` และ Attempt V2
- V3 bootstrap/Attempt V1/policy/fingerprint ต้อง byte-for-byte exact
- manifest ต้องประกาศ restricted capability พร้อม false flags ที่ยังไม่เปิด

### Task 11

- อัปเดต handoff truth และ frozen ownership map
- รัน mandatory focused matrix
- รัน fresh `npm run check`
- รีวิว diff ทั้งหมดเป็นภาษาไทย แยก Critical/Important/Minor
- commit handoff หลังหลักฐานสดเท่านั้น
- ไม่ push, merge หรือเริ่ม 5B-3

## 8. จุดเสี่ยงที่แผนกั้นไว้

- Source sidecars โตเป็น generic persistent framework
- Break Topology กลายเป็น public Flow shape โดยไม่ตั้งใจ
- exact Flow alias ซ่อน stale physical mapping
- Task 6 รายงาน line work ต่ำแต่ทำ atom/group/source workสูง
- splice เปลี่ยนชื่อ full traversal เป็น incremental counter
- cover ไม่ unique เพราะ tree balancing/tie-breaking ไม่ชัด
- T ถูกแอบเปลี่ยนชื่อเป็น R
- complete bootstrap/fallback builders drift กัน
- oracle reuse incremental helper แล้วสูญเสีย independence
- policy row count ถูกล็อกก่อน owner roster เสถียร
- payload estimate หรือ wall clock เข้า execution policy
- transition 2/3 ใช้ stale bootstrap/transient authority

## 9. สิ่งที่ยัง inactive

- inline-image Root ใน Attempt V2
- nontrivial Spatial/exclusion/barrier/multiple regions
- authored-box mutation, fixed-height, clipping, overflow
- structural hard-break/image mutation
- strict translated reuse
- empty-block incremental layout
- generated-page mutation และ novel style
- Worker session/scheduling/cancellation/coalescing
- Editor/Backend/persistence/publication/production
- V1 retirement และ product-scale memory claim

5B-1 inline-image paint ยังคงอยู่เฉพาะ frozen V3/Attempt V1 QA lane

## 10. จุดที่ผู้ใช้ควรยืนยันก่อน implementation

- ยอมรับการเก็บและ restore partial Task 6 ตาม exact path หลังอนุมัติแผนหรือไม่
- ยอมรับ canonical private 8-way Source sidecars หรือไม่
- ยอมรับให้ Task 5 เป็น gate ของ Break Topology และ Spatial alias ก่อน Task 6
  หรือไม่
- ยอมรับ exact owner registry ที่ไม่มี T unit และ derive row count จริงหรือไม่
- ยอมรับลำดับ review stops ทั้งห้าจุดและการหยุดเมื่อมี Critical/Important หรือไม่

เมื่อห้าข้อนี้ผ่าน จึงเริ่ม execute Task 2 ตามแผนหลักได้
