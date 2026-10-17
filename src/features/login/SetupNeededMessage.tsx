// =====================================================================
// SetupNeededMessage : แสดงเมื่อยังไม่ได้ใส่ค่า Supabase ในไฟล์ .env
// บอกวิธีตั้งค่าทีละขั้น (ดูแบบละเอียดได้ใน README.md)
// =====================================================================
import { WindowBox } from '@/shared/parts/WindowBox'

export function SetupNeededMessage() {
  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <WindowBox title="setup.exe" className="w-full max-w-xl" insideClassName="p-6">
        <h1 className="mb-2 font-title text-3xl font-semibold text-wine">ยังไม่ได้เชื่อมฐานข้อมูล</h1>
        <p className="mb-5 text-soft">ทำตามนี้ครั้งเดียว แล้วรีเฟรชหน้านี้</p>
        <ol className="flex list-decimal flex-col gap-3 pl-5 text-[15px] text-ink">
          <li>
            สมัคร / เข้า <b>supabase.com</b> แล้วกด <b>New project</b>
          </li>
          <li>
            ไปที่ <b>SQL Editor</b> แล้ววางไฟล์ <code className="rounded bg-blush px-1">supabase/sql/001_start.sql</code> กด Run
            แล้วทำแบบเดียวกันกับ <code className="rounded bg-blush px-1">002_files.sql</code>
          </li>
          <li>
            ไปที่ <b>Project Settings &gt; API</b> คัดลอก <b>Project URL</b> และ <b>anon public key</b>
          </li>
          <li>
            คัดลอกไฟล์ <code className="rounded bg-blush px-1">.env.example</code> เป็น <code className="rounded bg-blush px-1">.env</code>{' '}
            แล้ววางค่าทั้งสองลงไป
          </li>
          <li>
            ปิดแล้วเปิด <code className="rounded bg-blush px-1">npm run dev</code> ใหม่
          </li>
        </ol>
      </WindowBox>
    </div>
  )
}
