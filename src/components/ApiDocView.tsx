import React, { useState } from 'react';
import { 
  Code, 
  Send, 
  Database, 
  CheckCircle2, 
  ExternalLink, 
  Layers, 
  Copy, 
  Check,
  Server,
  Terminal
} from 'lucide-react';

interface EndpointDoc {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  sampleBody?: any;
}

export const ApiDocView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'API' | 'SCHEMA'>('API');
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState(0);
  const [customBody, setCustomBody] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const endpoints: EndpointDoc[] = [
    {
      method: 'GET',
      path: '/api/stats',
      summary: 'ดึงข้อมูลสถิติภาพรวม',
      description: 'ส่งกลับจำนวนห้องซ้อม สต็อกอุปกรณ์ จำนวนคำขอรออนุมัติ และของค้างส่ง',
    },
    {
      method: 'GET',
      path: '/api/rooms',
      summary: 'แสดงรายการห้องซ้อมดนตรีทั้งหมด',
      description: 'รองรับ query params: search, status (AVAILABLE, MAINTENANCE)',
    },
    {
      method: 'POST',
      path: '/api/rooms',
      summary: 'บันทึกสร้างห้องซ้อมดนตรีใหม่ (CRUD: Create)',
      description: 'สร้างข้อมูลห้องซ้อมใหม่ พร้อมตรวจสอบรหัสห้องและความจุ',
      sampleBody: {
        name: 'Studio VIP (Acoustic Master)',
        code: 'RM-VIP99',
        capacity: 10,
        description: 'ห้องซ้อมระดับพรีเมียมแดมป์เสียงสตูดิโอเกรด A',
        equipmentIncluded: ['กลอง DW Collector', 'แอมป์ Mesa Boogie'],
        status: 'AVAILABLE'
      }
    },
    {
      method: 'GET',
      path: '/api/bookings',
      summary: 'แสดงรายการบันทึกการใช้บริการห้องซ้อม (CRUD: Read)',
      description: 'รองรับการค้นหา (search) และกรองตามห้อง (roomId), สถานะ (status), วันที่ (date)',
    },
    {
      method: 'POST',
      path: '/api/bookings',
      summary: 'บันทึกการจองห้องซ้อมดนตรีใหม่ (CRUD: Create)',
      description: 'สร้างคำขอจองห้อง พร้อมตรวจสอบการชนกันของช่วงเวลา (Conflict validation)',
      sampleBody: {
        userId: 'usr-member-01',
        roomId: 'room-01',
        date: new Date().toISOString().split('T')[0],
        startTime: '19:00',
        endTime: '21:00',
        bandName: 'The Supernova Band',
        memberCount: 5,
        phone: '089-876-5432',
        purpose: 'ทดสอบบันทึกการจองผ่าน REST API'
      }
    },
    {
      method: 'PUT',
      path: '/api/bookings/bk-01',
      summary: 'แก้ไขรายการจองห้องซ้อม (CRUD: Update)',
      description: 'แก้ไขข้อมูลเวลา วงดนตรี หรือเปลี่ยนสถานะ (APPROVED, REJECTED, IN_USE, COMPLETED)',
      sampleBody: {
        status: 'APPROVED',
        adminNote: 'อนุมัติผ่าน REST API Tester'
      }
    },
    {
      method: 'DELETE',
      path: '/api/bookings/bk-02',
      summary: 'ยกเลิก / ลบรายการจองห้องซ้อม (CRUD: Delete)',
      description: 'ลบรายการจองออกจากระบบอย่างถาวร',
    },
    {
      method: 'GET',
      path: '/api/equipments',
      summary: 'แสดงรายการอุปกรณ์ดนตรีในคลัง (CRUD: Read)',
      description: 'รองรับการกรองตาม category, condition และ availableOnly',
    },
    {
      method: 'POST',
      path: '/api/equipments',
      summary: 'เพิ่มอุปกรณ์ดนตรีใหม่เข้าสู่คลัง (CRUD: Create)',
      description: 'บันทึกรายการอุปกรณ์ แบรนด์ รุ่น รหัสทรัพย์สิน และจำนวนสต็อก',
      sampleBody: {
        name: 'กีตาร์เบส 5 สาย Ibanez SR505E',
        code: 'EQ-BAS-005',
        category: 'BASS',
        brand: 'Ibanez',
        model: 'SR505E Bartolini Pickups',
        totalQuantity: 2,
        condition: 'EXCELLENT',
        location: 'ตู้เก็บ B-02'
      }
    },
    {
      method: 'GET',
      path: '/api/borrowings',
      summary: 'แสดงรายการขอยืมอุปกรณ์ดนตรี (CRUD: Read)',
      description: 'แสดงรายการประวัติการยืม-คืน กรองตามสถานะ REQUESTED, BORROWED, OVERDUE, RETURNED',
    },
    {
      method: 'POST',
      path: '/api/borrowings',
      summary: 'บันทึกคำขอยืมอุปกรณ์ดนตรี (CRUD: Create)',
      description: 'สร้างคำขอยืม พร้อมตรวจสอบสต็อกคงเหลือและกำหนดวันส่งคืน',
      sampleBody: {
        userId: 'usr-member-02',
        equipmentId: 'eq-05',
        quantity: 1,
        borrowDate: new Date().toISOString().split('T')[0],
        expectedReturnDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        purpose: 'ทดสอบส่งคำขอยืมไมค์ Shure SM58 ผ่าน REST API',
        phone: '095-432-1098'
      }
    },
    {
      method: 'PUT',
      path: '/api/borrowings/br-01',
      summary: 'บันทึกการส่งคืนหรืออนุมัติอุปกรณ์ (CRUD: Update)',
      description: 'เปลี่ยนสถานะเป็น BORROWED (ตัดสต็อก) หรือ RETURNED (คืนสต็อกพร้อมตรวจสภาพ)',
      sampleBody: {
        status: 'RETURNED',
        actualReturnDate: new Date().toISOString().split('T')[0],
        returnCondition: 'EXCELLENT',
        adminNote: 'ตรวจรับคืนเรียบร้อย สภาพดีเยี่ยม'
      }
    }
  ];

  const currentEndpoint = endpoints[selectedEndpointIndex];

  // Run Test API Call
  const handleTestApi = async () => {
    setIsLoading(true);
    setTestResult(null);
    try {
      const options: RequestInit = {
        method: currentEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'usr-admin-01',
        },
      };

      if (
        (currentEndpoint.method === 'POST' || currentEndpoint.method === 'PUT') &&
        (customBody || currentEndpoint.sampleBody)
      ) {
        options.body = customBody ? customBody : JSON.stringify(currentEndpoint.sampleBody);
      }

      const res = await fetch(currentEndpoint.path, options);
      const data = await res.json();
      setTestResult({
        status: res.status,
        ok: res.ok,
        data,
      });
    } catch (err: any) {
      setTestResult({
        status: 500,
        ok: false,
        error: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMethodColor = (m: string) => {
    switch (m) {
      case 'GET': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'POST': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'PUT': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'DELETE': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Code className="w-6 h-6 text-indigo-400" />
            <span>REST API Documentation & Database Schema</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            เอกสาร API บริการครบวงจร (GET, POST, PUT, DELETE) พร้อมเครื่องมือ Interactive Live Tester
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex text-xs">
          <button
            onClick={() => setActiveTab('API')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'API'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>REST API Playground</span>
          </button>
          <button
            onClick={() => setActiveTab('SCHEMA')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'SCHEMA'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Prisma / PostgreSQL Schema</span>
          </button>
        </div>
      </div>

      {activeTab === 'API' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Endpoint List */}
          <div className="lg:col-span-5 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
              API Endpoints ({endpoints.length})
            </div>
            
            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
              {endpoints.map((ep, idx) => {
                const isSelected = selectedEndpointIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedEndpointIndex(idx);
                      setCustomBody(ep.sampleBody ? JSON.stringify(ep.sampleBody, null, 2) : '');
                      setTestResult(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${getMethodColor(ep.method)}`}>
                        {ep.method}
                      </span>
                      <span className="font-mono text-slate-200 font-semibold truncate">{ep.path}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium line-clamp-1">{ep.summary}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Endpoint Tester Console */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              
              {/* Endpoint Header */}
              <div className="pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`px-2.5 py-0.5 rounded-md font-mono font-bold text-xs border ${getMethodColor(currentEndpoint.method)}`}>
                    {currentEndpoint.method}
                  </span>
                  <span className="font-mono text-sm font-bold text-white">{currentEndpoint.path}</span>
                </div>
                <h3 className="font-bold text-slate-200 text-sm">{currentEndpoint.summary}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{currentEndpoint.description}</p>
              </div>

              {/* Request Body (For POST / PUT) */}
              {(currentEndpoint.method === 'POST' || currentEndpoint.method === 'PUT') && (
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-medium">Request JSON Body:</span>
                    <button
                      onClick={() => setCustomBody(JSON.stringify(currentEndpoint.sampleBody, null, 2))}
                      className="text-indigo-400 hover:text-indigo-300 text-[11px]"
                    >
                      คืนค่าตัวอย่าง
                    </button>
                  </div>
                  <textarea
                    rows={7}
                    value={customBody || JSON.stringify(currentEndpoint.sampleBody, null, 2)}
                    onChange={(e) => setCustomBody(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-amber-300 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>
              )}

              {/* Send Button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  Headers: <code className="text-slate-400">Content-Type: application/json</code>
                </span>
                <button
                  onClick={handleTestApi}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'กำลังส่ง Request...' : 'ส่ง Request ทดสอบสด'}</span>
                </button>
              </div>

              {/* Response Display */}
              {testResult && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">Response:</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        testResult.ok ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        HTTP {testResult.status} {testResult.ok ? 'OK' : 'ERROR'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(testResult.data, null, 2));
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-slate-400 hover:text-white text-xs flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก JSON'}</span>
                    </button>
                  </div>

                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-64 leading-relaxed">
                    {JSON.stringify(testResult.data || testResult.error, null, 2)}
                  </pre>
                </div>
              )}

            </div>
          </div>

        </div>
      ) : (
        /* Prisma Schema Viewer */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                <span>Prisma Schema for PostgreSQL (prisma/schema.prisma)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                โครงสร้างตารางข้อมูลเชิงสัมพันธ์ (Relational Data Model) ที่ออกแบบเพื่อระบบห้องซ้อมดนตรี
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              PostgreSQL
            </span>
          </div>

          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-indigo-200 overflow-x-auto leading-relaxed">
{`datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String      @id @default(uuid())
  email       String      @unique
  name        String
  studentId   String      @unique
  phone       String
  role        Role        @default(MEMBER) // ADMIN | MEMBER
  faculty     String
  bandName    String?
  bookings    Booking[]
  borrowings  Borrowing[]
}

model Room {
  id                String       @id @default(uuid())
  code              String       @unique // e.g. RM-A101
  name              String       // e.g. Studio A (Main Live Hall)
  capacity          Int          // ความจุผู้ใช้งาน
  hourlyRate        Decimal      @default(0.0)
  status            RoomStatus   @default(AVAILABLE) // AVAILABLE | MAINTENANCE | CLOSED
  equipmentIncluded String[]     // เครื่องดนตรีประจำห้อง
  bookings          Booking[]
}

model Booking {
  id           String        @id @default(uuid())
  bookingCode  String        @unique // e.g. BK-202610-001
  userId       String
  user         User          @relation(fields: [userId], references: [id])
  roomId       String
  room         Room          @relation(fields: [roomId], references: [id])
  date         DateTime      @db.Date
  startTime    String        // e.g. "16:00"
  endTime      String        // e.g. "18:00"
  purpose      String
  bandName     String
  memberCount  Int
  status       BookingStatus @default(PENDING) // PENDING | APPROVED | IN_USE | COMPLETED | REJECTED
}

model Equipment {
  id                String             @id @default(uuid())
  code              String             @unique // e.g. EQ-GTR-001
  name              String
  category          EquipmentCategory  // GUITAR | BASS | DRUMS | KEYBOARD | AMPLIFIER | MICROPHONE
  brand             String
  model             String
  totalQuantity     Int
  availableQuantity Int
  condition         EquipmentCondition // EXCELLENT | GOOD | FAIR | MAINTENANCE
  location          String             // e.g. ตู้เก็บเครื่องสาย A-01
  borrowings        Borrowing[]
}

model Borrowing {
  id                 String             @id @default(uuid())
  borrowCode         String             @unique // e.g. BR-202610-001
  userId             String
  user               User               @relation(fields: [userId], references: [id])
  equipmentId        String
  equipment          Equipment          @relation(fields: [equipmentId], references: [id])
  quantity           Int
  borrowDate         DateTime           @db.Date
  expectedReturnDate DateTime           @db.Date
  actualReturnDate   DateTime?          @db.Date
  status             BorrowStatus       // REQUESTED | BORROWED | RETURNED | OVERDUE | REJECTED
  borrowCondition    EquipmentCondition
  returnCondition    EquipmentCondition?
}`}
          </pre>
        </div>
      )}

    </div>
  );
};
