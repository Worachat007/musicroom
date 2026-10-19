# SoundSpace: ระบบจองห้องซ้อมดนตรี

เว็บสำหรับสมัครสมาชิกด้วยรหัสนักศึกษา ดูปฏิทินเวลาจอง และจัดการคำขอใช้ห้องซ้อม ข้อมูลผู้ใช้ ห้อง และการจองจัดเก็บใน PostgreSQL ผ่าน Prisma จึงคงอยู่ข้ามการ deploy และการทำงานของ Vercel serverless functions

## ความสามารถ

- สมัครสมาชิกและเข้าสู่ระบบด้วยรหัสนักศึกษาในรูปแบบ `XXXXXXXXX-X` (ตัวอย่าง `663450351-5`) และรหัสผ่าน รหัสผ่านจัดเก็บด้วย scrypt และ session ใช้ signed HttpOnly cookie
- สมาชิกดูตารางเวลาที่มีการจองและจัดการรายการของตนเอง ผู้ดูแลดูรายการทั้งหมด อนุมัติ/ปฏิเสธ และจัดการรายการจอง
- ปฏิทินรายเดือนแสดงวันที่และช่วงเวลาที่มีการจอง เลือกวันเพื่อเริ่มจองได้
- ค้นหารายการ และกรองตามห้อง สถานะ และวันที่
- ตรวจสอบรูปแบบข้อมูล ฝั่ง client และ server รวมถึงความจุห้อง ช่วงเวลา และการจองซ้อน
- REST API สำหรับการสมัคร/เข้าสู่ระบบและ CRUD การจอง

## รันในเครื่อง

ต้องใช้ Node.js ที่รองรับ Vite 8 และ PostgreSQL

1. ติดตั้ง dependencies: `npm install`
2. สร้างไฟล์ environment จากตัวอย่างใน PowerShell: `Copy-Item .env.example .env`
3. แก้ `.env` โดยใส่ PostgreSQL connection string จริงใน `DATABASE_URL` และกำหนด `SESSION_SECRET` เป็น secret แบบสุ่มยาว (`.env` ถูก ignore โดย Git)
4. สร้างตาราง: `npm run db:push`
5. เพิ่มห้องเริ่มต้น: `npm run db:seed`
6. เริ่มเว็บและ API: `npm run dev`

หากต้องการบัญชีผู้ดูแล ให้กำหนด `ADMIN_STUDENT_ID`, `ADMIN_PASSWORD` (อย่างน้อย 8 ตัวอักษร) และ `ADMIN_NAME` ก่อนรัน seed คำสั่ง seed จะไม่สร้างบัญชีตัวอย่างหรือเปิดทางสลับสิทธิ์จากหน้าเว็บ

ตรวจสอบโค้ดและ production bundle ด้วย `npm run lint` และ `npm run build`

## Deploy บน Vercel

1. สร้าง PostgreSQL ที่เข้าถึงได้จาก Vercel เช่น Neon หรือ Supabase และคัดลอก connection string สำหรับ runtime
2. เพิ่ม Environment Variables ใน Vercel ทุก environment ที่ต้องการใช้งาน:
   - `DATABASE_URL`: PostgreSQL connection string
   - `SESSION_SECRET`: secret แบบสุ่มที่คาดเดายาก ใช้ค่าเดียวกันทุก function instance
3. ก่อน deploy ครั้งแรก ให้ใช้ connection string ของฐานข้อมูลนั้นในเครื่อง แล้วรัน `npm run db:push` และ `npm run db:seed` เพื่อสร้างตารางและเพิ่มห้อง
4. ตั้ง Build Command เป็น `npm run build` และ Deploy
5. หากต้องการผู้ดูแล ให้กำหนด `ADMIN_STUDENT_ID`, `ADMIN_PASSWORD`, `ADMIN_NAME` ใน environment ของเครื่องที่ใช้ seed แล้วรัน `npm run db:seed` กับฐานข้อมูล production

อย่าใช้ SQLite หรือข้อมูลในหน่วยความจำสำหรับ production serverless และอย่ารัน seed ทุกครั้งที่ build เพราะจะผูกการเปลี่ยนข้อมูลกับการ deploy การสมัครสมาชิกและการจองครั้งถัดไปถูกเขียนลง PostgreSQL ทันที

## REST API

ทุก endpoint นอกจากสมัคร/เข้าสู่ระบบต้องใช้ session cookie จากการ login หรือ register

| Method | Endpoint | รายละเอียด |
|---|---|---|
| POST | `/api/auth/register` | สมัครด้วย `name`, `studentId`, `password` |
| POST | `/api/auth/login` | เข้าสู่ระบบด้วย `studentId`, `password` |
| GET | `/api/auth/me` | อ่านบัญชีจาก session ปัจจุบัน |
| POST | `/api/auth/logout` | ออกจากระบบ |
| GET | `/api/rooms` | รายการห้องซ้อม |
| GET | `/api/bookings` | รายการจอง รองรับ `search`, `roomId`, `userId` (admin), `status`, `date` |
| GET | `/api/availability?from=YYYY-MM-DD&to=YYYY-MM-DD` | ช่วงเวลาที่ถูกจอง ไม่เปิดเผยตัวตนผู้จอง |
| POST | `/api/bookings` | สร้างรายการจอง |
| PUT | `/api/bookings/:id` | แก้ไขรายการ หรือเปลี่ยนสถานะโดยผู้ดูแล |
| DELETE | `/api/bookings/:id` | ยกเลิกรายการตามสิทธิ์ |

สมาชิกเข้าถึงและแก้ไขได้เฉพาะรายการของตนเอง และแก้ไข/ยกเลิกได้ขณะรอตรวจสอบเท่านั้น การป้องกันสิทธิ์ตรวจที่ API ไม่อาศัยค่าจาก browser

## คุณสมบัติของระบบตามโจทย์

| คุณสมบัติ | มีหรือไม่ / อยู่ตรงไหน |
|---|---|
| CRUD | มีสำหรับการจอง: แสดงรายการ สร้าง แก้ไข และลบการจอง อยู่ใน `BookingsView.tsx`, `App.tsx` และ API ใน `api.ts` สมาชิกแก้ไขหรือลบได้เฉพาะรายการของตนที่รออนุมัติ ส่วนผู้ดูแลจัดการได้ตามสิทธิ์ ทั้งนี้ปุ่ม “ยกเลิก” เรียก DELETE และลบข้อมูลการจองจริง |
| Validation | มีทั้งหน้าเว็บและเซิร์ฟเวอร์ หน้าแบบฟอร์มจองตรวจช่องบังคับ ช่วงเวลา จำนวนสมาชิก เบอร์โทรศัพท์ และความยาวข้อความใน `BookingsView.tsx` ส่วนเซิร์ฟเวอร์ตรวจซ้ำ รวมถึงวันที่ย้อนหลัง ห้องปิดบริการ และช่วงเวลาจองชนกันใน `api.ts` |
| Authentication / Authorization | มี สมัครสมาชิก เข้าสู่ระบบ และออกจากระบบใน `AuthView.tsx` และ `AuthContext.tsx` ฝั่งเซิร์ฟเวอร์ตรวจ session ก่อนเข้าถึง API และตรวจสิทธิ์สมาชิก/ผู้ดูแลใน `api.ts` การเก็บรหัสผ่านและ session อยู่ใน `auth.ts` |
| Search + Filter | มีในหน้า `BookingsView.tsx`: เลือกวันที่ ห้อง สถานะ และค้นหารหัสจอง ชื่อวง ผู้จอง ห้อง วัตถุประสงค์ หรือรหัสนักศึกษา API `GET /bookings` ก็รองรับพารามิเตอร์ค้นหาและตัวกรองใน `api.ts` อย่างไรก็ตาม หน้าเว็บกรองจากรายการที่โหลดมาแล้ว และ API จำกัดผลลัพธ์ไม่เกิน 500 รายการ |
| API: GET, POST, PUT, DELETE | มีครบสำหรับการจอง: `GET /api/bookings`, `POST /api/bookings`, `PUT /api/bookings/:id`, `DELETE /api/bookings/:id` รวมถึง `GET /api/rooms` และ `GET /api/availability` รายการ route อยู่ใน `api.ts` ส่วน `api.ts` เป็นตัวเรียก API จากหน้าเว็บ |
