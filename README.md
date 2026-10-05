# ระบบบันทึกการใช้บริการห้องซ้อมดนตรี และ การขอยืมอุปกรณ์ห้องซ้อมดนตรี
### (Music Practice Room Booking & Equipment Borrowing System)

ระบบบริหารจัดการและบันทึกข้อมูลการใช้บริการห้องซ้อมดนตรี และการขอยืม-คืนอุปกรณ์ดนตรีของชมรมดนตรีสากล พัฒนาขึ้นโดยเน้นประสิทธิภาพและความครบวงจรในการจัดการข้อมูล รองรับผู้ใช้งาน 2 กลุ่มหลัก ได้แก่ **ผู้ดูแลห้องซ้อม (Admin)** และ **สมาชิกชมรม (Club Member)**

---

## 🌟 คุณสมบัติหลักของระบบ (System Features)

### 1. CRUD (Create, Read, Update, Delete) ครบวงจร
- **การใช้บริการห้องซ้อมดนตรี (Room Bookings):**
  - **Create:** สมาชิกยื่นคำขอจองห้องซ้อม ระบุห้อง วันที่ เวลา วงดนตรี สมาชิก และวัตถุประสงค์
  - **Read:** แสดงรายการจองทั้งแบบตาราง (Table View) และตารางเวลาจำลอง (Daily Room Schedule)
  - **Update:** สมาชิกแก้ไขรายการจองของตนเองได้ / ผู้ดูแลสามารถอนุมัติ (Approve), ไม่อนุมัติ (Reject) หรือเปลี่ยนสถานะเป็นกำลังซ้อม (In-Use) และเสร็จสิ้น (Completed)
  - **Delete:** สมาชิกสามารถยกเลิกคำขอของตนเองได้ / ผู้ดูแลสามารถลบรายการจองที่ไม่ถูกต้อง
- **การขอยืมอุปกรณ์ห้องซ้อมดนตรี (Equipment Borrowing):**
  - **Create:** สมาชิกยื่นคำขอยืมเครื่องดนตรี/อุปกรณ์จากคลัง
  - **Read:** แสดงประวัติการยืม-คืน ตรวจสอบวันกำหนดส่งคืน และแสดงสถานะแบบเรียลไทม์
  - **Update:** ผู้ดูแลอนุมัติการยืม (ตัดสต็อกอัตโนมัติ) หรือตรวจรับคืนอุปกรณ์ (พร้อมระบุสภาพอุปกรณ์ เช่น ดีเยี่ยม, ปกติ, ชำรุด และเพิ่มสต็อกกลับคืน)
  - **Delete:** ยกเลิกหรือลบคำขอยืม
- **การจัดการห้องซ้อม & คลังอุปกรณ์ (Room & Equipment Management):**
  - ผู้ดูแลสามารถเพิ่ม แก้ไข และลบห้องซ้อมและเครื่องดนตรีในระบบได้โดยตรง

### 2. Data Validation (การตรวจสอบความถูกต้องของข้อมูล)
- ขับเคลื่อนด้วย **React Hook Form** ร่วมกับ Server-side Validation:
  - **การจองห้อง:**
    - ตรวจสอบเวลาเริ่มต้นต้องมาก่อนเวลาสิ้นสุด (`startTime < endTime`)
    - ตรวจสอบการจองซ้อนทับ (Conflict Booking Detection): ป้องกันไม่ให้ห้องเดียวกันถูกจองในเวลาที่ทับซ้อนกัน
    - วันที่ต้องไม่เป็นอดีต
    - จำนวนสมาชิกต้องสอดคล้องกับความจุสูงสุดของห้องซ้อมนั้นๆ (`capacity`)
    - ตรวจสอบเบอร์โทรศัพท์ด้วย Regex มาตรฐานเบอร์โทรศัพท์ประเทศไทย (เช่น `089-876-5432`)
    - บังคับระบุชื่อวงและวัตถุประสงค์ไม่ต่ำกว่าความยาวขั้นต่ำ
  - **การยืมอุปกรณ์:**
    - ตรวจสอบจำนวนที่ขอยืมต้องไม่เกินจำนวนคงเหลือในคลัง (`quantity <= availableQuantity`)
    - ตรวจสอบวันที่ส่งคืนต้องไม่เร็วกว่าวันที่ยืม (`expectedReturnDate >= borrowDate`)
    - บังคับติ๊กยอมรับข้อตกลงและเงื่อนไขการดูแลรักษาอุปกรณ์

### 3. Authentication & Authorization (การตรวจสอบสิทธิ์และยืนยันตัวตน)
- ระบบจำแนกบทบาทและสิทธิ์การเข้าถึง (Role-Based Access Control - RBAC):
  - **ผู้ดูแลห้องซ้อม (ADMIN):**
    - อนุมัติ / ปฏิเสธคำขอจองห้องซ้อม
    - อนุมัติการยืม / บันทึกการรับคืนและประเมินสภาพอุปกรณ์
    - เพิ่ม / แก้ไข / ลบ ข้อมูลห้องซ้อมและอุปกรณ์ในคลัง
    - ดูสถิติเชิงลึกและบันทึกประวัติการกระทำในระบบ (Audit Trail Log)
  - **สมาชิกชมรม (MEMBER):**
    - จองห้องซ้อมดนตรีและดูตารางห้องว่าง
    - ยื่นคำขอยืมอุปกรณ์ดนตรี
    - แก้ไขและยกเลิกคำขอของตนเอง
    - ตรวจสอบประวัติการใช้งานและอุปกรณ์ที่กำลังยืมอยู่
  - **Fast Role Switcher:** มีแถบสลับสิทธิ์และเลือกโปรไฟล์ผู้ใช้งานทดสอบ (เอกชัย - พี่เอก แอดมิน, กวิน - มือกีตาร์, ฟ้าใส - นักร้องนำ, ติณณ์ - มือเบส)
- **ขอบเขตสิทธิ์ในแอป:** สมาชิกเห็นและจัดการได้เฉพาะคำขอจอง/ยืมของตนเอง ตรวจสอบช่วงเวลาที่ห้องมีรายการจองได้โดยไม่เห็นข้อมูลผู้จองคนอื่น และไม่มีเมนูจัดการคลัง การอนุมัติ การรับคืน หรือ Audit Trail ผู้ดูแลเท่านั้นที่เข้าถึงการทำงานเหล่านี้ได้ โดย API ตรวจสิทธิ์ซ้ำที่ฝั่งเซิร์ฟเวอร์
- **ข้อจำกัดสำหรับ production:** บัญชีและ role ในโปรเจกต์นี้เป็นข้อมูลจำลอง โดย client ส่ง `x-user-id` เพื่อระบุผู้ใช้ ยังไม่มีรหัสผ่าน/session/token สำหรับยืนยันตัวตนจริง จึงไม่ควรนำ authorization แบบนี้ไปใช้ปกป้องข้อมูลในระบบ production โดยไม่เพิ่ม authentication ก่อน

### 4. Search & Filter (การค้นหาและกรองข้อมูล)
- ค้นหาแบบเรียลไทม์ (Live Search) ด้วยชื่อวง, รหัสการจอง, รหัสอุปกรณ์, ชื่อสมาชิก, รหัสนักศึกษา หรือวัตถุประสงค์
- กรองข้อมูลตามสถานะ:
  - สถานะห้องซ้อม: `PENDING`, `APPROVED`, `IN_USE`, `COMPLETED`, `REJECTED`, `CANCELLED`
  - สถานะการยืม: `REQUESTED`, `BORROWED`, `OVERDUE`, `RETURNED`, `REJECTED`
- กรองตามห้องซ้อม, หมวดหมู่อุปกรณ์ (กีตาร์, เบส, กลอง, คีย์บอร์ด, แอมป์, ไมค์, อุปกรณ์เสริม), และวันที่

### 5. บริการ RESTful API ครบวงจร (GET, POST, PUT, DELETE)
- รองรับการเรียกใช้งานจากทั้งเว็บแอปพลิเคชันและบริการภายนอก พร้อมหน้าต่าง **Interactive REST API Playground** ที่ทดสอบส่ง Request จริงและดู Response JSON ได้ทันที

---

## 🛠️ สถาปัตยกรรมและเทคโนโลยีที่ใช้ (Tech Stack)

| ส่วนประกอบ | เทคโนโลยี | คำอธิบาย |
|---|---|---|
| **Frontend Framework** | Next.js / React 19 | โครงสร้าง Component ยุคใหม่ พร้อม TypeScript |
| **Form & Validation** | React Hook Form | การจัดการฟอร์มประสิทธิภาพสูง ตรวจสอบ Validation รวดเร็วและแม่นยำ |
| **Styling & UI** | Tailwind CSS v4 | สไตล์โมเดิร์น โทนสี Dark Theme สำหรับสตูดิโอดนตรี |
| **Icons & Motion** | Lucide React & Motion | ไอคอนสวยงามและการเคลื่อนไหวที่ราบรื่น |
| **Database & ORM** | Prisma ORM & PostgreSQL | ตัวจำลองและ Schema เชิงสัมพันธ์ (Relational Data Model) ที่สมบูรณ์แบบ |
| **Backend & API** | Express / RESTful API | เส้นทาง API รองรับ Method GET, POST, PUT, DELETE |

---

## 🗄️ โครงสร้างฐานข้อมูล (Prisma & PostgreSQL Schema)

ไฟล์ Schema ถูกบันทึกไว้ที่ `prisma/schema.prisma` โดยมีแบบจำลองดังนี้:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  MEMBER
}

enum RoomStatus {
  AVAILABLE
  MAINTENANCE
  CLOSED
}

enum BookingStatus {
  PENDING
  APPROVED
  REJECTED
  IN_USE
  COMPLETED
  CANCELLED
}

enum EquipmentCategory {
  GUITAR
  BASS
  DRUMS
  KEYBOARD
  AMPLIFIER
  MICROPHONE
  ACCESSORIES
}

enum EquipmentCondition {
  EXCELLENT
  GOOD
  FAIR
  MAINTENANCE
}

enum BorrowStatus {
  REQUESTED
  BORROWED
  RETURNED
  OVERDUE
  REJECTED
}

model User {
  id          String      @id @default(uuid())
  email       String      @unique
  name        String
  studentId   String      @unique
  phone       String
  role        Role        @default(MEMBER)
  faculty     String
  bandName    String?
  bookings    Booking[]
  borrowings  Borrowing[]
}

model Room {
  id                String       @id @default(uuid())
  code              String       @unique // เช่น RM-A101
  name              String       // เช่น Studio A (Main Live Hall)
  capacity          Int
  description       String?
  equipmentIncluded String[]     // เครื่องดนตรีประจำห้อง
  hourlyRate        Decimal      @default(0.0)
  status            RoomStatus   @default(AVAILABLE)
  bookings          Booking[]
}

model Booking {
  id           String        @id @default(uuid())
  bookingCode  String        @unique // เช่น BK-202610-001
  userId       String
  user         User          @relation(fields: [userId], references: [id])
  roomId       String
  room         Room          @relation(fields: [roomId], references: [id])
  date         DateTime      @db.Date
  startTime    String        // เช่น "16:00"
  endTime      String        // เช่น "18:00"
  purpose      String
  bandName     String
  memberCount  Int
  status       BookingStatus @default(PENDING)
  adminNote    String?
}

model Equipment {
  id                String             @id @default(uuid())
  code              String             @unique // เช่น EQ-GTR-001
  name              String
  category          EquipmentCategory
  brand             String
  model             String
  totalQuantity     Int
  availableQuantity Int
  condition         EquipmentCondition @default(GOOD)
  location          String
  borrowings        Borrowing[]
}

model Borrowing {
  id                 String             @id @default(uuid())
  borrowCode         String             @unique // เช่น BR-202610-001
  userId             String
  user               User               @relation(fields: [userId], references: [id])
  equipmentId        String
  equipment          Equipment          @relation(fields: [equipmentId], references: [id])
  quantity           Int
  borrowDate         DateTime           @db.Date
  expectedReturnDate DateTime           @db.Date
  actualReturnDate   DateTime?          @db.Date
  purpose            String
  status             BorrowStatus       @default(REQUESTED)
  borrowCondition    EquipmentCondition
  returnCondition    EquipmentCondition?
  adminNote          String?
}
```

---

## 📡 รายละเอียดบริการ REST API (API Endpoints)

| Method | Endpoint | สิทธิ์ (Role) | คำอธิบายการทำงาน |
|---|---|---|---|
| **GET** | `/api/stats` | ทุกคน | ดูสถิติสรุปภาพรวม (ห้องซ้อมที่ใช้งาน, อุปกรณ์คงเหลือ, คำขอรออนุมัติ) |
| **GET** | `/api/rooms` | ทุกคน | แสดงรายการห้องซ้อม (รองรับ filter `search`, `status`) |
| **GET** | `/api/rooms/:id` | ทุกคน | ดูข้อมูลรายละเอียดห้องซ้อมรายห้อง |
| **POST** | `/api/rooms` | ผู้ดูแล (ADMIN) | สร้างข้อมูลห้องซ้อมใหม่ (CRUD: Create) |
| **PUT** | `/api/rooms/:id` | ผู้ดูแล (ADMIN) | แก้ไขข้อมูลห้องซ้อมหรือเปลี่ยนสถานะการเปิดบริการ (CRUD: Update) |
| **DELETE** | `/api/rooms/:id` | ผู้ดูแล (ADMIN) | ลบห้องซ้อมออกจากระบบ (CRUD: Delete) |
| **GET** | `/api/bookings` | ทุกคน | แสดงรายการจองห้องซ้อม (รองรับ filter `roomId`, `userId`, `status`, `date`, `search`) |
| **GET** | `/api/availability?date=YYYY-MM-DD` | ทุกคน | ตรวจสอบช่วงเวลาจองและสถานะห้อง โดยไม่เปิดเผยข้อมูลส่วนตัวของผู้จอง |
| **POST** | `/api/bookings` | ทุกคน | สร้างคำขอจองห้องซ้อมใหม่ พร้อมตรวจสอบเวลาชนกัน |
| **PUT** | `/api/bookings/:id` | ผู้ดูแล / เจ้าของ | อัปเดตข้อมูลการจอง หรือผู้ดูแลอนุมัติ/ปฏิเสธ |
| **DELETE** | `/api/bookings/:id` | ผู้ดูแล / เจ้าของ | ยกเลิกหรือลบรายการจอง |
| **GET** | `/api/equipments` | ทุกคน | แสดงรายการอุปกรณ์ดนตรีในคลัง (รองรับ filter `category`, `availableOnly`) |
| **POST** | `/api/equipments` | ผู้ดูแล (ADMIN) | เพิ่มอุปกรณ์ใหม่เข้าสู่คลัง |
| **PUT** | `/api/equipments/:id` | ผู้ดูแล (ADMIN) | ปรับปรุงข้อมูลและสต็อกอุปกรณ์ |
| **DELETE** | `/api/equipments/:id` | ผู้ดูแล (ADMIN) | ลบอุปกรณ์ออกจากคลัง |
| **GET** | `/api/borrowings` | ทุกคน | แสดงรายการประวัติการยืม-คืนอุปกรณ์ |
| **POST** | `/api/borrowings` | ทุกคน | ส่งคำขอยืมอุปกรณ์ พร้อมตัดการคำนวณโควตาคงเหลือ |
| **PUT** | `/api/borrowings/:id` | ผู้ดูแล (ADMIN) | อนุมัติคำขอยืม หรือบันทึกการส่งคืนพร้อมตรวจสภาพ |
| **DELETE** | `/api/borrowings/:id` | ผู้ดูแล / เจ้าของ | ยกเลิกหรือลบคำขอยืม |
| **POST** | `/api/seed/reset` | ผู้ดูแล (ADMIN) | คืนค่าข้อมูลตัวอย่างตั้งต้นของระบบ |

---

## 🚀 วิธีการติดตั้งและเริ่มต้นใช้งาน (Getting Started)

### 1. ติดตั้ง Dependencies
```bash
npm install
```
คำสั่งนี้จะติดตั้ง Prisma Client และสร้าง client จาก `prisma/schema.prisma` ให้อัตโนมัติ

### 2. ตั้งค่า PostgreSQL และ Prisma
คัดลอก `.env.example` เป็น `.env` แล้วแก้ `DATABASE_URL` ให้ตรงกับ PostgreSQL ของคุณ จากนั้นตรวจสอบ schema และสร้างตาราง:
```bash
npm run db:validate
npm run db:push
```
คำสั่งเพิ่มเติม: `npm run db:migrate` สำหรับ migration, `npm run db:studio` เพื่อเปิด Prisma Studio และ `npm run db:generate` เพื่อสร้าง Prisma Client ใหม่

### 3. เริ่มต้นรันเซิร์ฟเวอร์ (Development Server)
```bash
npm run dev
```
ระบบจะเปิดบริการทั้ง REST API Backend และ React Frontend บนพอร์ต `http://localhost:3000`

### 4. ตรวจสอบโค้ดและการสร้าง Build
```bash
npm run lint
npm run build
```

หมายเหตุ: API ในตัวอย่างนี้ยังเก็บข้อมูลในหน่วยความจำ (`src/server/db.ts`) จึงยังไม่อ่านหรือบันทึกข้อมูลผ่าน Prisma/PostgreSQL แม้จะตั้งค่า schema และเครื่องมือ Prisma ได้แล้วก็ตาม

---

## 👥 บัญชีผู้ใช้งานสำหรับทดสอบระบบ (Demo Accounts)

| ชื่อผู้ใช้ | รหัสนักศึกษา | บทบาท (Role) | ตำแหน่งในชมรม |
|---|---|---|---|
| **เอกชัย รุ่งเรืองกิจ (พี่เอก)** | `64010099` | **ADMIN (ผู้ดูแล)** | ประธานชมรมดนตรีสากล / ผู้ดูแลห้องซ้อม |
| **กวิน ศรีสุนทร** | `65010412` | **MEMBER (สมาชิก)** | มือกีตาร์ วง The Midnight Echoes |
| **ฟ้าใส นพเก้า** | `66010884` | **MEMBER (สมาชิก)** | นักร้องนำ วง Luna & The Boys |
| **ติณณ์ วงศ์เจริญ** | `65011230` | **MEMBER (สมาชิก)** | มือเบส วง Neon City Lights |

*(สามารถกดสลับบทบาทหรือเลือกบัญชีเพื่อทดสอบสิทธิ์ได้ทันทีจากเมนูมุมขวาบนของหน้าจอ)*
