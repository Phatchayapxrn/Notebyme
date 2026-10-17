# ระบบ "เข้าสู่ระบบ" (login)

หน้า `/login` (เข้าได้โดยไม่ต้องล็อกอิน ไม่มีเมนู: `isPublic: true`)

| ไฟล์ | ทำอะไร |
|---|---|
| `feature.tsx` | ข้อมูลระบบ (`isPublic`, `showInMenu: false`) |
| `LoginPage.tsx` | กล่อง "nice to meet you !" สลับ เข้าสู่ระบบ / สมัครใหม่ ด้วยอีเมล + รหัสผ่าน |
| `loginActions.ts` | `logIn`, `signUp`, `logOut` + `toThaiError` แปลข้อความ error เป็นไทย |
| `FallingPetals.tsx` | กลีบดอกไม้ร่วงพื้นหลัง (ปิดเองถ้าเครื่องตั้ง "ลดการเคลื่อนไหว") |
| `SetupNeededMessage.tsx` | แสดงเมื่อยังไม่ได้ใส่ค่าในไฟล์ `.env` บอกวิธีตั้งค่า |

## เรื่องที่ควรรู้
- ล็อกอินเสร็จจะพากลับไปหน้าที่ตั้งใจจะเข้าตอนแรก
- ถ้า Supabase เปิด "Confirm email" สมัครแล้วต้องกดลิงก์ในอีเมลก่อน (ปิดได้ ดู README หลัก ขั้นที่ 4)
- อยากเพิ่มล็อกอินด้วย Google: เปิด Provider ใน Supabase แล้วเพิ่มปุ่มที่เรียก
  `database.auth.signInWithOAuth({ provider: 'google' })` ใน `loginActions.ts`
