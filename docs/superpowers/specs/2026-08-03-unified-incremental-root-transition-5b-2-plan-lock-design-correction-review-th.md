# เอกสารประกอบการรีวิวภาษาไทย: Phase 5B-2 Plan-Lock Correction

**วันที่:** 2026-08-03
**สถานะ:** เอกสารช่วยรีวิว ไม่ใช่ normative contract แยกต่างหาก
**เอกสารหลัก:**
`2026-08-03-unified-incremental-root-transition-5b-2-plan-lock-design-correction.md`

ไฟล์นี้สรุปเอกสารหลักเป็นภาษาไทยเพื่อให้ตรวจได้สะดวก หากถ้อยคำในไฟล์นี้
คลุมเครือ ให้ยึดข้อกำหนดที่เจาะจงกว่าในเอกสารหลัก และแก้ทั้งสองไฟล์ให้ตรงกันก่อน
เริ่มเขียน implementation plan

## 1. คำตัดสิน

เลือก re-baseline 5B-2 แบบจำกัด capability อย่างซื่อสัตย์ ไม่ปะ Task 6 จุดเดียว
และไม่ขยาย 5B-2 ไปเป็น image/Spatial/translated-transform framework

- V3 bootstrap, Attempt V1, policy และ fingerprint เดิมคง exact
- เพิ่ม 5B-2 bootstrap และ Attempt V2 เป็นคนละ public symbol
- เปิด Tasks 2-5 เฉพาะส่วนที่ audit พบว่าต้องแก้
- Task 6 partial ปัจจุบันเป็น RED evidence ที่ยังรับไม่ได้
- `T` ไม่ execute ใน 5B-2 และงาน translated scale ย้ายไป 5B-3
- จำนวน policy rows ต้อง derive จาก owner registry จริง ไม่ล็อก `27/25/2`

## 2. ขอบเขต Root ที่ Attempt V2 รับ

Attempt V2 รับเฉพาะ Root ที่ complete 5B-2 kernel mint exact
`trivialLayoutAdmissionAuthority` ได้ โดยต้องเป็นจริงพร้อมกันทั้งหมด:

- ไม่มี inline image ใน Root
- Source มีเฉพาะ text, resolved field, passive generated page number และ
  retained structural hard break
- Spatial State เป็น canonical trivial/empty, ไม่มี exclusion/barrier/หลาย
  region/page และมี full-width content context เดียว
- authored box เป็น supported auto-height shape; nondefault inset/width ใช้ได้เมื่อ
  เป็น exact unchanged Root fact
- ไม่มี fixed-height, clipping หรือ overflow
- change ไม่แก้ image/Spatial/authored-box/fixed-height/overflow

Admission failure ต้องคืน candidate-free fallback ก่อน Evidence/Source/Flow/Line
work และ manifest ต้องใส่ qualifier นี้ ห้ามประกาศ text/style capability แบบกว้าง

## 3. Ordinary text กับ structural content

Ordinary insert/replace ต้อง reject `CR`, `LF`, `U+2028`, `U+2029` และ `U+FFFC`
รวมถึง range ที่คร่อม/ลบ structural hard break หรือ inline-image item

Retained structural hard break และ adjacency รอบ edit ใช้เป็น passive context ได้
แต่ hard-break/image mutation ต้องมี structural change family ของตนเอง ซึ่งยัง
inactive ใน 5B-2

5B-1 inline-image paint ยังอยู่ใน frozen V3/Attempt V1 lane เท่านั้น ไม่ไหลเข้า
Attempt V2 ที่กำหนดให้ Root image-free

## 4. Break Topology ที่หายไป

Task 5 ต้องเป็นเจ้าของ private persistent relative Break Topology sidecar:

- mirror exact Flow Tree node/atom boundaries
- boundary ต่อ atom เป็น `prohibited | opportunity | mandatory`
- เก็บ relative length/summary ไม่เก็บ flat absolute offsets ทั้ง revision
- complete 5B-2 bootstrap และ fallback ใช้ builder เดียวกัน
- Task 5 path-copy เฉพาะ affected boundary paths และ retain exact suffix subtree
- Task 6 ใช้ exact group authority นี้ ห้ามเดา break ต่อ shaping cluster หรือรัน
  segmenter ตัวที่สอง
- fingerprint เป็น integrity เท่านั้น; exact object/WeakMap record เป็น authority

Public Flow V1 และ Root V2 runtime shape/fingerprint ไม่เปลี่ยนเพราะ sidecar นี้

## 5. Authority chain ที่ต้องครบทุก Root

ทุก accepted Root ต้องมี exact current binding ต่อไปนี้:

```text
Source -> Flow/Break
Source -> trivial Spatial
Source/Flow/Break/Spatial -> final Line
Source/Line -> Persistent Scene
Scene -> Delivery
all children -> Root
```

- Task 4 structural-target record ต้อง bind normative tuple ครบ
- exact Flow/Line alias ใช้ได้เมื่อ stored physical mapping ทุก field ยัง exact
- ถ้า partial paint/equal-metric edit ทำ Source fragmentation เปลี่ยน ต้อง bounded
  metadata/source-mapping path-copy โดย retain layout internals/geometry
- Spatial object เดิมยังต้อง mint alias ใหม่ให้ exact next Source
- Task 8 mint final Line binding และ refresh sidecars; ห้าม copy previous prepared
  record ทั้งก้อน
- cursor/proof/cover/work/fallback request เป็น transition-local ใช้ข้ามรอบไม่ได้

## 6. Task 6, splice และ E/R/N

Task 6 ต้อง consume canonical break groups แบบ linear หรือมี amortized-linear proof
และ charge ก่อนอ่าน Flow node/atom, break group, Source mapping, fragment และ line
record ทุกหน่วย

Line splice รับ opaque exact cover/path authority จาก Task 7 แล้ว copy เฉพาะ
boundary paths ห้าม `collectLeaves`, flatten, rebuild complete root หรือเดิน accepted
suffix

Contract ยังมี `E/T/R/N` แต่ active 5B-2 กำหนด:

- `E` = exact retained object/mapping/internals/geometry
- `R` = existing lineage ที่ recompute/remap จริงและคิด work จริง
- `N` = new lineage
- `T = 0` เสมอ และไม่มี executable Geometry/Scene/Delivery path

หาก proof พบ strict constant-translation suffix ต้อง fallback ก่อน enumerate suffix
ห้ามเปลี่ยนชื่อ suffix เป็น R หรือสร้าง translated line/chunk ทีละรายการ

## 7. Work policy

ถอนข้ออ้าง `27 rows / 25 locked / 2 inactive` และห้ามใช้ค่า exploratory
`8,192 / 32,768 / 8:1` เป็น production limit

ก่อน calibration ต้องมี exact ordered owner/unit registry ครอบอย่างน้อย:

- admission และ Source coverage
- Evidence request/material/response descriptors, atoms, glyphs, clusters,
  breaks, guards และ proofs
- Source items/tree/index/style entries/buckets/comparisons
- Flow tree และ Break Topology lookup/path-copy/groups/nodes
- line seed/lookups/atoms/groups/source mappings/fragments/line completion
- Line cover/splice/path-copy
- E/R/N proof และ geometry
- Scene/Delivery
- Fallback replay
- complete 5B-2 builder แยกจาก replay/oracle

ทุก owner ต้อง check ก่อน first observable payload read/emission, เก็บ factual
partial work เมื่อ limit และห้าม partial candidate ข้าม fallback

## 8. Fallback และ oracle

Fallback V2 ยังคง two-step และ candidate-independent:

1. attempt คืน single-use request ที่มี previous Root/change/policy, sanitized cause
   และ stopped incremental work เท่านั้น
2. complete material เข้า boundary ภายหลัง และ shared 5B-2 complete kernel สร้าง
   sidecars/Root ใหม่ทั้งหมด

Fallback logical replay ไม่บังคับ local incremental topology ให้เท่ากับ complete
topology และ Root ที่ complete-fallback ต้องใช้เป็น previous Root ของ transition
ถัดไปได้จริง

Complete oracle อยู่ใน tests เท่านั้น ต้อง author complete target/layout แยกจาก
incremental helpers และเปรียบเทียบ source/provenance, break semantics, physical
lines, geometry, authored box, Scene และ delivery

## 9. Gate ที่ห้ามข้าม

1. อนุมัติ design correction และ replacement implementation plan
2. Redo 5B2A: Tasks 2-3 พร้อม RED/GREEN และ review ใหม่
3. Redo 5B2B: Tasks 4-5 พร้อม Break Topology/multi-transition review
4. Tasks 6-8: bounded line, exact splice, E/R/N, Spatial alias, final Line binding
5. Tasks 9A/9B: Scene/Root/Fallback และ fallback Root -> incremental
6. Tasks 10-11: owner-derived calibration, atomic activation, exact manifest และ
   full Core gate

ห้าม resume Task 6 ก่อนข้อ 1-3 ผ่าน

## 10. หลักฐานปิดก่อน activation

- published Root ต่อกันจริงอย่างน้อยสาม transitions
- same-lane no-op -> edit โดยไม่มี transient authority ไหลมา
- fallback-complete Root -> incremental -> transition ที่สาม
- exact 2,048-line E suffix โดย instrumentation ยืนยันว่า suffix line/chunk/node
  ไม่ถูกอ่าน
- 2,048-line constant-translation suffix คืน fallback ด้วย `T = 0`
- long unbreakable/zero-advance-heavy single line ภายใต้ factual work
- real forced equal-digest collisions
- threshold-minus-one/threshold/threshold-plus-one ทุก active unit
- independent complete-oracle equality
- V3 bootstrap/Attempt V1 exact regression ก่อนและหลัง activation

## 11. สิ่งที่ยังไม่ทำ

5B-3 ยังคงเป็นเจ้าของ inline-image/nontrivial Spatial/strict translated reuse และ
scale closure ส่วน Worker session, scheduling, Editor, Backend, publication,
production, fixed-height, asset lifecycle และ V1 retirement ยังไม่เปิด

หลักฐาน lifetime รอบนี้อ้างได้เฉพาะ object-graph retention ไม่ใช่ GC timing หรือ
product-scale memory

## 12. จุดที่ผู้รีวิวควรยืนยัน

- ยอมรับ restricted Root profile และ authored-box rule ตาม Section 2 หรือไม่
- ยอมรับว่า 5B-1 image paint อยู่ V3 lane และ 5B-2 Attempt V2 image-free หรือไม่
- ยอมรับ private relative Break Topology sidecar โดยไม่เปลี่ยน public Flow V1 หรือไม่
- ยอมรับ `T = 0` ใน 5B-2 และย้าย strict translation ไป 5B-3 หรือไม่
- ยอมรับการ reopen Tasks 2-5 และบังคับ review stops ใหม่ก่อน Task 6 หรือไม่

เมื่อทั้งห้าข้อนี้ตรงกับเอกสารหลัก จึงถือว่า design พร้อมให้เขียน replacement
implementation plan
