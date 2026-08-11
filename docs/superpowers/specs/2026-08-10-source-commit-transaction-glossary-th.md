# อภิธานศัพท์ Source Commit Transaction ฉบับภาษาไทย

**สถานะ:** เอกสารอธิบายภาษาไทยสำหรับผู้อ่าน ไม่ใช่ contract source
แยกต่างหาก

**นิยามบังคับ:**
[Source Commit Transaction Glossary](./2026-08-10-source-commit-transaction-glossary.md)

**สเปกพฤติกรรม:**
[Source Commit Transaction Seam Design](./2026-08-10-source-commit-transaction-seam-design.md)

## 1. วิธีใช้อภิธานศัพท์ฉบับนี้

ฉบับภาษาไทยใช้ `SCT-Txx` และ exact English term ชุดเดียวกับอภิธานศัพท์
technical เพื่อให้คนอ่าน เอกสาร โค้ด และ tests พูดถึงสิ่งเดียวกัน

หากคำอธิบายภาษาไทยกับ technical glossary ดูขัดกัน ให้ยึด technical glossary
เป็นนิยามบังคับ แล้วแก้ฉบับภาษาไทยให้ตรงใน change set เดียวกัน ห้ามแปลชื่อ
contract identifier ในโค้ดเป็นชื่อใหม่

## 2. Identity, Authority และการมองเห็นผลลัพธ์

### SCT-T01 — Source Commit Transaction

transaction เฉพาะงานของ Core ที่ทำให้ CandidateWork authority, next Source
state, Source sidecars และ Source-stage authority ชุดเดียวกันมีผลถาวรผ่าน
synchronous commit tail หนึ่งครั้ง

- เจ้าของคือ private Source commit transaction module
- ไม่ใช่ generic framework
- ไม่ใช่ Root publication, Editor atomic apply หรือ complete fallback

### SCT-T02 — Detached Ticket Identity

object identity ที่สร้างขึ้นเพื่อผูก detached commit plans ให้รู้ว่าเป็นงาน
prospective transaction เดียวกัน แต่ยังไม่มี authority

- ยังใช้ protect, publish, apply หรือ commit ไม่ได้
- clone หรือ object ที่หน้าตาเหมือนกันใช้แทนไม่ได้
- ไม่เหมือน SCT-T03

### SCT-T03 — Live Transaction Ticket

SCT-T02 ตัวเดิมหลัง commit plans ครบ การตรวจที่ล้มเหลวได้จบทั้งหมด active
indexes ติดตั้งครบ และ phase ถูกตั้งเป็น `live` แล้วเท่านั้น

คำว่า live จึงไม่ได้หมายถึง “สร้าง object ticket แล้ว” แต่หมายถึง ticket
ได้รับ authority จาก exact transaction registry แล้ว

### SCT-T04 — Transaction Record

record ใน WeakMap ของ transaction owner ที่ผูกกับ ticket หนึ่งตัว ช่วง live
record เก็บ exact plans, tuple identities, index keys และ phase เมื่อจบแล้วจะ
ถูกยุบเป็น SCT-T08

### SCT-T05 — Active Transaction Index

WeakMap/WeakSet entry ชั่วคราวที่กันไม่ให้ meter, precondition, Source
candidate, sidecar candidate หรือ access reservation ตัวเดียวกันถูกใช้ซ้ำหรือ
ใช้พร้อม transaction อื่น

มันเป็น transaction control state ไม่ใช่ permanent Source/sidecar registration
Active meter/candidate/reservation indexes ต้องถูกลบเมื่อ commit จบ ส่วน
precondition ownership indexes เปลี่ยนบทบาทเป็น weak one-shot history และไม่
นับเป็น active indexes หลัง consumed

### SCT-T06 — Resolvable

authority หรือ output เป็น resolvable เมื่อ owner registry สามารถคืน permanent
record ให้ exact lookup tuple ได้จริง การมี object, การ freeze หรือ fingerprint
เท่ากันยังไม่ถือว่า resolvable

### SCT-T07 — Visible Output

permanent owner-local record ที่ exact resolver เข้าถึงได้หลัง Source commit
คืนผลแล้ว Detached plan, detached ticket และ candidate ชั่วคราวไม่ใช่ visible
output

### SCT-T08 — Consumed Tombstone

terminal record ขนาดเล็ก `{ phase: "consumed" }` ที่เก็บไว้หลัง commit เพื่อ
ปฏิเสธ replay โดยไม่ลาก Root, Source tree, sidecars, access functions หรือ plans
ทั้งชุดให้มีอายุยาวตาม ticket

## 3. Plans, Owners และ state

### SCT-T09 — Detached Commit Plan

opaque exact-identity plan ที่ owner ของแต่ละส่วนสร้างก่อน live ภายในมี facts,
records และ authority identities ที่ตรวจและจัดเตรียมเสร็จแล้วสำหรับ apply

- prepare อาจคืน `null` ได้ก่อน live
- prepare ห้าม publish, reserve, protect หรือ consume permanent state
- apply ห้ามคืน `null`/`false`
- plan ใช้ข้าม ticket ไม่ได้

### SCT-T10 — CandidateWork Publication Plan

SCT-T09 ของ CandidateWork เก็บ closed-meter proof, compatibility projection,
frozen receipts และ CandidateWork authority/record ที่เตรียมไว้ล่วงหน้า

### SCT-T11 — Source Sidecar Commit Plan

SCT-T09 ของ SourceSidecars เก็บ exact next sidecars, physical item-entry pairs,
sidecar registration, sidecar-candidate consumption และ prevalidated Source
access record

### SCT-T12 — Source Candidate Commit Plan

SCT-T09 ของ SourceState เก็บ canonical Source candidate authority, aliases,
access reservation, next Source state และ candidate retirement mutations

### SCT-T13 — Stage Publication Plan

SCT-T09 ของ SourceAuthority เก็บ Source-stage, structural-target และ optional
layout-delta authorities/records รวมถึง exact Plan A accepted Source-stage
object, private Source-stage result record และ exact commit result ที่สร้างไว้
ก่อน live หลัง commit TransitionSource ต้องคืน object เดิมโดยห้ามสร้างหรือ
freeze ใหม่

### SCT-T14 — Transaction Owner

private leaf module ที่เป็นเจ้าของ ticket records, plan slots, active indexes,
mint rollback, phases, one-shot consumption และ consumed tombstone

module นี้ไม่ถือ Source/Sidecar payload และไม่รองรับ stage อื่น

### SCT-T15 — Coordinator

fixed code path ใน SourceAuthority ที่เรียก prepare/apply ของ participant ตาม
ลำดับตายตัว Coordinator เป็นเจ้าของลำดับ แต่ไม่เป็นเจ้าของ participant data
และไม่รับ callback หรือ participant list จาก caller เฉพาะ Plan A นั้น SCT-T13
ของ SourceAuthority เป็นเจ้าของ accepted Source-stage object กับ private result
record เพื่อให้ result publication อยู่ภายใน SCT-T35

### SCT-T16 — Participant Owner

CandidateWork, SourceSidecars, SourceState หรือ SourceAuthority ในบทบาทเจ้าของ
detached plan และ permanent records ของส่วนตัวเอง

### SCT-T17 — Owner-Local Permanent State

ข้อมูลถาวรหลัง commit เช่น CandidateWork authority, registered Source access,
registered sidecars หรือ Source-stage authority ไม่ใช่ transaction phase ชุดที่
สอง

### SCT-T18 — Transaction Control State

ticket phase, active indexes, attached-plan identities และ replay/one-shot state
ซึ่ง transaction module เป็นเจ้าของเพียงตัวเดียว Participant ห้ามมี shadow copy

### SCT-T19 — Reservation

การจับจอง owner-local ก่อน live เช่น Source access slot หรือ physical entry
pairs ก่อน live reservation ยัง release ได้

### SCT-T20 — Transaction Protection

ข้อเท็จจริงใน active transaction index ที่กัน release/discard ระหว่าง live หรือ
committing เริ่มตอน mint สำเร็จและจบตอน terminal cleanup

Reservation กับ protection เป็นคนละอย่างกัน Participant ถือ reservation ได้แต่
ไม่ถือ protection map

### SCT-T21 — Permanent Registration

mapping ถาวรที่ owner ติดตั้งเมื่อ apply commit plan แล้ว และยังอยู่หลัง
transaction consumed โดยต้องไม่ลาก full transaction record ติดไปด้วย

## 4. Operations และ boundaries

### SCT-T22 — Prepare

ทำงานที่ล้มเหลวได้ทั้งหมดก่อน live ได้แก่ validation, exact lookup, bounded
inspection, allocation, copy, freeze และ record construction Prepare คืน `null`
ได้โดยห้ามมี partial output

### SCT-T23 — Attach

ผูก owner-issued SCT-T09 เข้ากับ fixed slot ของ SCT-T02 Attach เป็นการกระทำ
สุดท้ายของ plan preparation ที่สำเร็จ แต่ยังไม่ทำให้ ticket live

### SCT-T24 — Mint

ตรวจ conflict และติดตั้ง active transaction indexes ทั้งชุด ตั้ง phase เป็น
`live` เมื่อการติดตั้งครบเท่านั้น หากล้มเหลวต้อง rollback กลับไป absent

### SCT-T25 — Live Boundary

จุดเดียวที่หลังจากนั้นต้องไม่มี normal rejection, work limit, conflict/duplicate
check, allocation, freeze, caller-input read, external execution หรือ fallback
decision เหลืออยู่

### SCT-T26 — Apply

นำ exact prevalidated commit plan ของ participant ไปติดตั้งด้วย plain internal
registry mutations เท่านั้น เมื่อ Apply เริ่ม invariant checks ทั้งหมดต้องจบแล้ว
Apply ไม่เรียก external code และคืน `null`/`false` ไม่ได้

### SCT-T27 — Publish

ติดตั้ง permanent owner record จน exact authority resolve ได้ การ allocate หรือ
prepare detached authority อย่างเดียวยังไม่ใช่ publish

### SCT-T28 — Commit

operation synchronous ครั้งเดียวของ coordinator ที่เปลี่ยน `live` เป็น
`committing`, apply fixed plans, cleanup terminal indexes, ยุบ record เป็น SCT-T08
แล้วคืน precreated result

### SCT-T29 — Consume

ทำให้ authority, ticket, precondition, meter หรือ candidate ใช้สำเร็จซ้ำอีกครั้ง
ไม่ได้ เป็น lifecycle fact ไม่ใช่เพียงการลบ object

### SCT-T30 — Retire

ลบ candidate handles และ aliases ชั่วคราวหลัง permanent successor state ติดตั้ง
แล้ว โดยยังรักษา next Source state และ permanent registrations

### SCT-T31 — Release

ยกเลิก reservation ก่อน live โดยไม่ publish ทำได้เมื่อ exact reservation ยังไม่
ถูก transaction protection ป้องกัน

### SCT-T32 — Discard

ลบ uncommitted candidate และ temporary records ทุก handle ต้อง normalize ไป
canonical authority ก่อนตรวจ protection

### SCT-T33 — Cleanup

การเก็บ temporary preparation/candidate state หลัง pre-live rejection โดยทั่วไป
ไม่ได้แปลว่า transaction indexes เคยถูกติดตั้ง

### SCT-T34 — Mint Rollback

ลบทุก transaction index ที่ติดตั้งไปแล้วจาก mint ที่ล้มเหลวตามลำดับย้อนกลับ
ทำให้ exact tuple retry ได้และ candidates/reservations release ได้ ไม่ใช่ generic
undo หลัง live

### SCT-T35 — No-Fail Tail

fixed synchronous code ตั้งแต่ mint สำเร็จจนเป็น consumed tombstone การตัดสินใจ
ที่ล้มเหลวได้และ allocation ตาม input ต้องจบก่อน tail หาก internal invariant
ผิดให้ throw ห้ามเปลี่ยนเป็น fallback หรือ partial accepted result

### SCT-T36 — Plain Internal Operation

operation ตายตัวบน Core-created plain records และ exact registry keys ที่ไม่รัน
caller code จึงไม่รวม getter, Proxy trap, callback, observer, logging hook,
external string conversion, Promise, microtask, scheduling หรือ traversal ของ
caller-owned payload

## 5. Equality, failures และ diagnostics

### SCT-T37 — Exact Identity

JavaScript reference identity (`===`) ที่ owner registry รองรับ เป็นฐาน authority
ของ tickets, plans, candidates, reservations และ outputs

### SCT-T38 — Canonical Equality

ความเท่ากันของ canonical semantic facts ใช้ตรวจ deterministic integrity ได้ แต่
ใช้แทน exact identity authority ไม่ได้

### SCT-T39 — Fingerprint Equality

fingerprints เท่ากันไม่ได้หมายถึง object identity หรือ authority ต้องยังปลอดภัย
เมื่อ forced fingerprint collision เกิดขึ้น

### SCT-T40 — Alias Normalization

การแปลงทุก candidate handle ที่รองรับ รวม exact candidate-array aliases ให้เป็น
canonical candidate authority เดียวก่อนตรวจ protection/discard/retirement หรือ
transaction membership

### SCT-T41 — Re-entrancy

execution อื่นเข้ามาระหว่าง transaction-sensitive operation ที่ยังไม่คืนผล
design นี้ปิด re-entrancy หลัง live ด้วยการไม่รัน caller-controlled code หรือ
test callback

### SCT-T42 — Blocked

ผล pre-live สำหรับ malformed input หรือ exact authority/precondition ที่ไม่ผ่าน
และไม่ใช่ work-limit fallback ต้องไม่มี live ticket หรือ published candidate

### SCT-T43 — Fallback-Required

ผลจาก two-step fallback protocol ที่ established แล้ว เกิดจาก exact incremental
work/structural limit ก่อน transaction live และห้ามพา partial Source candidate ไป

### SCT-T44 — Invariant Rejection

synchronous internal error สำหรับ state ที่เป็นไปไม่ได้หลัง fallible checks จบ
เช่น replay, re-entry, wrong phase หรือ wrong exact plan ไม่ใช่ blocked/fallback

### SCT-T45 — Ghost Reservation

transaction/participant index เก่าที่หลงเหลือหลัง rejected preparation หรือ mint
rollback จนขวาง transaction ใหม่หรือผูก state ใหม่กับงานเก่า Fault tests ต้อง
พิสูจน์ว่าไม่มี ghost reservation

### SCT-T46 — Fault Position

integer/enum สำหรับ test เท่านั้นที่แทนขอบเขตการติดตั้ง local mint แต่ละตำแหน่ง
fault เกิดได้หลังติดตั้งบางส่วนก่อน live หรือทันทีก่อนเขียน live ครั้งสุดท้าย
เท่านั้น ห้ามเกิดหลัง ticket live แล้ว โดยไม่ใช้ callback และต้อง reset ใน
`finally`

### SCT-T47 — Retryable Exact Tuple

candidate/precondition/reservation tuple ชุดเดิมหลัง plan rejection หรือ mint
rollback ซึ่งต้อง mint สำเร็จได้เมื่อเอา injected fault ออก

## 6. กฎ parity ระหว่างสองฉบับ

1. ทั้งสองฉบับต้องมี `SCT-T01` ถึง `SCT-T47` ตรงกัน
2. Exact English term และ contract identifier ต้องคงเดิมในฉบับภาษาไทย
3. เพิ่ม ลบ หรือเปลี่ยน Term ID ต้องแก้สองไฟล์ใน change set เดียวกัน
4. Micro-spec, implementation plan, active task briefs และ final reports ต้อง
   อ้าง technical glossary
5. รายงานภาษาไทยต้องอ้างฉบับภาษาไทยด้วย
6. เอกสารประวัติเดิมไม่ต้องแก้ทั้งหมด เว้นแต่ถูกนำกลับมาเป็น active contract
