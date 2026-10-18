# School Emblem SVG Library

เว็บคลังตราโรงเรียนแบบ Static ใช้ HTML, CSS และ JavaScript ล้วน เหมาะกับ GitHub Pages

## วิธีเปิดใช้งาน

1. อัปโหลดไฟล์และโฟลเดอร์ทั้งหมดขึ้น GitHub repository
2. ไปที่ **Settings → Pages**
3. ใน **Build and deployment** เลือก **Deploy from a branch**
4. เลือก branch `main` และ folder `/ (root)` แล้วกด Save
5. รอให้ GitHub Pages เผยแพร่เว็บ

## เพิ่มโรงเรียน

1. วางไฟล์ SVG ใน `assets/emblems/` เช่น `school-name.svg`
2. เปิด `data/schools.json` แล้วเพิ่ม object ตามตัวอย่าง:

```json
{
  "id": "unique-school-id",
  "name": "ชื่อโรงเรียน",
  "alternateName": "ชื่อภาษาอังกฤษหรือชื่ออื่น",
  "region": "ภาคเหนือ",
  "province": "เชียงใหม่",
  "district": "เมืองเชียงใหม่",
  "file": "assets/emblems/school-name.svg",
  "source": "https://example.com/source",
  "notes": "หมายเหตุเพิ่มเติม",
  "addedAt": "2026-10-18"
}
```

ข้อควรจำ:
- `id` ต้องไม่ซ้ำกัน
- `region`, `province`, `district` ใช้ข้อความให้ตรงกันทุกแถว เพื่อให้ตัวกรองรวมข้อมูลได้ถูกต้อง
- `file` ต้องเป็น path แบบ relative จากโฟลเดอร์หลัก และสะกดชื่อไฟล์ให้ตรงกัน
- `source` เป็น URL แหล่งที่มาที่ตรวจสอบได้ จะปล่อยเป็น `""` ก็ได้
- ข้อมูลในชุดนี้เป็นเพียงข้อมูลตัวอย่าง ไม่ใช่คลังตราที่ตรวจสอบครบถ้วน
- SVG ที่ดาวน์โหลดควรผ่านการตรวจสอบก่อนนำขึ้นเว็บ และควรระบุแหล่งที่มา/เงื่อนไขการใช้งานตามเหมาะสม

## ทดสอบบนเครื่อง

อย่าเปิด `index.html` ด้วย `file://` เพราะ browser อาจบล็อก `fetch()` สำหรับ JSON ให้ใช้ local server เช่น VS Code Live Server หรือรัน `python -m http.server 8000` ในโฟลเดอร์นี้ แล้วเปิด `http://localhost:8000`

## โครงสร้างไฟล์

- `index.html` — โครงหน้าเว็บ
- `styles.css` — Dark theme และ responsive layout
- `app.js` — ค้นหา กรอง เรียงลำดับ และแสดงรายละเอียด
- `data/schools.json` — ข้อมูลโรงเรียน
- `assets/emblems/` — เก็บไฟล์ SVG
