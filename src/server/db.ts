import { 
  User, 
  Room, 
  Booking, 
  Equipment, 
  Borrowing, 
  ActivityLog, 
  SystemStats 
} from '../types/index.ts';

// In-memory persistent database simulator matching Prisma schema
class DatabaseStore {
  users: User[] = [];
  rooms: Room[] = [];
  bookings: Booking[] = [];
  equipments: Equipment[] = [];
  borrowings: Borrowing[] = [];
  logs: ActivityLog[] = [];

  constructor() {
    this.seedDefaultData();
  }

  seedDefaultData() {
    this.users = [
      {
        id: 'usr-admin-01',
        name: 'เอกชัย รุ่งเรืองกิจ (พี่เอก)',
        studentId: '64010099',
        email: 'ekkachai.r@musicclub.ac.th',
        phone: '081-234-5678',
        role: 'ADMIN',
        faculty: 'วิศวกรรมศาสตร์ (ประธานชมรมดนตรีสากล)',
        bandName: 'The Staff Band',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'usr-member-01',
        name: 'กวิน ศรีสุนทร',
        studentId: '65010412',
        email: 'kawin.s@student.ac.th',
        phone: '089-876-5432',
        role: 'MEMBER',
        faculty: 'สถาปัตยกรรมศาสตร์',
        bandName: 'The Midnight Echoes',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'usr-member-02',
        name: 'ฟ้าใส นพเก้า',
        studentId: '66010884',
        email: 'fahsay.n@student.ac.th',
        phone: '095-432-1098',
        role: 'MEMBER',
        faculty: 'นิเทศศาสตร์',
        bandName: 'Luna & The Boys',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'usr-member-03',
        name: 'ติณณ์ วงศ์เจริญ',
        studentId: '65011230',
        email: 'tinn.w@student.ac.th',
        phone: '086-555-7890',
        role: 'MEMBER',
        faculty: 'ศิลปกรรมศาสตร์',
        bandName: 'Neon City Lights',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      }
    ];

    this.rooms = [
      {
        id: 'room-01',
        name: 'Studio A (Main Live Hall)',
        code: 'RM-A101',
        capacity: 12,
        description: 'ห้องซ้อมขนาดใหญ่พิเศษ พร้อมเวทียกระดับ มิกเซอร์ดิจิทัล 32 แชนแนล และระบบมอนิเตอร์ In-Ear',
        equipmentIncluded: [
          'กลองชุด Tama Starclassic + Zildjian K Custom Cymbals',
          'แอมป์กีตาร์ Marshall JVM410H Half Stack',
          'แอมป์กีตาร์ Fender Twin Reverb 65',
          'แอมป์เบส Ampeg SVT-CL + 8x10 Cabinet',
          'เปียโนไฟฟ้า Yamaha CP88',
          'ระบบ PA QSC K12.2 + ไมค์ Shure Beta 58A (4 ตัว)'
        ],
        hourlyRate: 0,
        status: 'AVAILABLE',
        imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
        color: 'indigo'
      },
      {
        id: 'room-02',
        name: 'Studio B (Standard Band Room)',
        code: 'RM-B102',
        capacity: 8,
        description: 'ห้องซ้อมมาตรฐานสำหรับวงดนตรีร็อก/ป๊อป แดมป์เสียงสมบูรณ์แบบ แอร์เย็นฉ่ำ',
        equipmentIncluded: [
          'กลองชุด Pearl Decade Maple',
          'แอมป์กีตาร์ Boss Katana 100 MkII',
          'แอมป์กีตาร์ Orange Crush Pro CR120',
          'แอมป์เบส Fender Rumble 100',
          'คีย์บอร์ด Roland Juno-DS61',
          'ไมโครโฟน Shure SM58 (3 ตัว)'
        ],
        hourlyRate: 0,
        status: 'AVAILABLE',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
        color: 'emerald'
      },
      {
        id: 'room-03',
        name: 'Studio C (Acoustic & Vocal Suite)',
        code: 'RM-C103',
        capacity: 5,
        description: 'ห้องซ้อมอะคูสติก แจ๊ส หรือบันทึกเสียงร้อง ออกแบบอะคูสติกเน้นความอบอุ่นและชัดเจน',
        equipmentIncluded: [
          'เปียโนอะคูสติก Kawai Upright Piano K-300',
          'กลอง Cajon Meinl + ฉาบเล็ก',
          'แอมป์อะคูสติก Fishman Loudbox Artist',
          'คอนเดนเซอร์ไมค์ Audio-Technica AT4040'
        ],
        hourlyRate: 0,
        status: 'AVAILABLE',
        imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=80',
        color: 'amber'
      },
      {
        id: 'room-04',
        name: 'Studio D (Drum & Solo Practice)',
        code: 'RM-D104',
        capacity: 3,
        description: 'ห้องซ้อมเดี่ยว สำหรับฝึกซ้อมกลองชุด หรือเครื่องเป่าส่วนบุคคล',
        equipmentIncluded: [
          'กลองชุดไฟฟ้า Roland V-Drums TD-17KVX',
          'มอนิเตอร์หูฟัง Audio-Technica ATH-M50x',
          'ลำโพงแอมป์กลอง Roland PM-100'
        ],
        hourlyRate: 0,
        status: 'MAINTENANCE',
        imageUrl: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800&auto=format&fit=crop&q=80',
        color: 'rose'
      }
    ];

    this.equipments = [
      {
        id: 'eq-01',
        code: 'EQ-GTR-001',
        name: 'กีตาร์ไฟฟ้า Fender Player Plus Stratocaster',
        category: 'GUITAR',
        brand: 'Fender',
        model: 'Player Plus Strat SSS (Tequila Sunrise)',
        totalQuantity: 2,
        availableQuantity: 1,
        condition: 'EXCELLENT',
        location: 'ตู้เก็บเครื่องสาย A-01',
        description: 'กีตาร์ไฟฟ้า 3 ซิงเกิลคอยล์ Noiseless คอไม้ Maple เรเดียส 12 นิ้ว เหมาะกับทุกแนวเพลง',
        imageUrl: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'eq-02',
        code: 'EQ-GTR-002',
        name: 'กีตาร์โปร่ง Taylor GS Mini-e Koa',
        category: 'GUITAR',
        brand: 'Taylor',
        model: 'GS Mini-e Koa ES-B',
        totalQuantity: 1,
        availableQuantity: 1,
        condition: 'GOOD',
        location: 'ตู้เก็บเครื่องสาย A-02',
        description: 'กีตาร์โปร่งไฟฟ้าไม้โคอา เสียงกังวาน ขนาดพกพา พร้อมปรีแอมป์ต่อแอมป์ได้ทันที',
        imageUrl: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'eq-03',
        code: 'EQ-BAS-001',
        name: 'เบสไฟฟ้า Fender Player Jazz Bass 4 สาย',
        category: 'BASS',
        brand: 'Fender',
        model: 'Player Jazz Bass (Polar White)',
        totalQuantity: 2,
        availableQuantity: 1,
        condition: 'GOOD',
        location: 'ตู้เก็บเครื่องสาย A-03',
        description: 'เบสไฟฟ้า 4 สาย มาตรฐาน ปิ๊กอัพ Alnico 5 Jazz Bass ย่านเบสคมชัดกระชับ',
        imageUrl: 'https://images.unsplash.com/photo-1569420078335-961019623e1f?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'eq-04',
        code: 'EQ-KEY-001',
        name: 'สเตจเปียโน Roland RD-88 88 คีย์',
        category: 'KEYBOARD',
        brand: 'Roland',
        model: 'RD-88 Stage Piano (PHA-4 Concert Keybed)',
        totalQuantity: 1,
        availableQuantity: 0,
        condition: 'EXCELLENT',
        location: 'ชั้นวางคีย์บอร์ด K-01',
        description: 'เปียโนเวที 88 คีย์ระบบค้อนทัชชิ่งเสมือนจริง ซาวด์เอนจิ้น ZEN-Core และ SuperNATURAL',
        imageUrl: 'https://images.unsplash.com/photo-1520523839898-507121c17242?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'eq-05',
        code: 'EQ-MIC-001',
        name: 'ไมโครโฟนสาย Shure SM58-LC (Dynamic Vocal)',
        category: 'MICROPHONE',
        brand: 'Shure',
        model: 'SM58-LC Cardioid',
        totalQuantity: 8,
        availableQuantity: 5,
        condition: 'GOOD',
        location: 'กล่องกันกระแทก MIC-BOX-1',
        description: 'ไมค์ร้องเพลงยอดนิยมระดับตำนาน ทนทาน ตัดเสียงรบกวนรอบข้างได้ดีเยี่ยม',
        imageUrl: 'https://images.unsplash.com/photo-1520523839898-507121c17242?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'eq-06',
        code: 'EQ-MIC-002',
        name: 'ไมโครโฟนเครื่องดนตรี Shure SM57',
        category: 'MICROPHONE',
        brand: 'Shure',
        model: 'SM57 Instrument Dynamic',
        totalQuantity: 4,
        availableQuantity: 3,
        condition: 'GOOD',
        location: 'กล่องกันกระแทก MIC-BOX-2',
        description: 'ไมค์จ่อตู้แอมป์กีตาร์ และจ่อสแนร์กลอง ให้ซาวด์คมชัดพุ่ง',
        imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'eq-07',
        code: 'EQ-AMP-001',
        name: 'แอมป์กีตาร์พกพา Spark 40 By Positive Grid',
        category: 'AMPLIFIER',
        brand: 'Positive Grid',
        model: 'Spark 40 Smart Amp',
        totalQuantity: 2,
        availableQuantity: 2,
        condition: 'EXCELLENT',
        location: 'ตู้เก็บแอมป์พกพา AMP-02',
        description: 'แอมป์อัจฉริยะ 40W พร้อมเอฟเฟกต์ในตัวกว่า 10,000 เสียง เชื่อมต่อบลูทูธได้',
        imageUrl: 'https://images.unsplash.com/photo-1546707012-c46675f12716?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'eq-08',
        code: 'EQ-ACC-001',
        name: 'สายสัญญาณ Mogami Gold Guitar Cable 6 เมตร',
        category: 'ACCESSORIES',
        brand: 'Mogami',
        model: 'Gold Instrument Cable 1/4" to 1/4"',
        totalQuantity: 10,
        availableQuantity: 7,
        condition: 'GOOD',
        location: 'รางแขวนสาย CAB-01',
        description: 'สายแจ็คคุณภาพระดับสตูดิโอ สัญญาณรบกวนต่ำมาก ขั้วต่อ Neutrik ชุบทอง',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'eq-09',
        code: 'EQ-DRM-001',
        name: 'ฉาบชุด Sabian HHX Evolution Cymbal Pack',
        category: 'DRUMS',
        brand: 'Sabian',
        model: 'HHX Evolution (Hi-hat 14", Crash 16", Crash 18", Ride 20")',
        totalQuantity: 2,
        availableQuantity: 1,
        condition: 'GOOD',
        location: 'กระเป๋าฉาบ CYM-BAG-A',
        description: 'ชุดฉาบระดับโปร เนื้อทองเหลือง B20 เสียงมืดอบอุ่นแต่สว่างพุ่ง',
        imageUrl: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=600&auto=format&fit=crop&q=80'
      }
    ];

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    this.bookings = [
      {
        id: 'bk-01',
        bookingCode: 'BK-202610-001',
        userId: 'usr-member-01',
        userName: 'กวิน ศรีสุนทร',
        studentId: '65010412',
        phone: '089-876-5432',
        bandName: 'The Midnight Echoes',
        roomId: 'room-01',
        roomName: 'Studio A (Main Live Hall)',
        date: today,
        startTime: '16:00',
        endTime: '18:00',
        purpose: 'ซ้อมใหญ่เตรียมงานดนตรีในสวน ประจำมหาวิทยาลัย',
        memberCount: 6,
        status: 'APPROVED',
        adminNote: 'อนุมัติเรียบร้อย โปรดรักษาความสะอาดหลังใช้งาน',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 20).toISOString()
      },
      {
        id: 'bk-02',
        bookingCode: 'BK-202610-002',
        userId: 'usr-member-02',
        userName: 'ฟ้าใส นพเก้า',
        studentId: '66010884',
        phone: '095-432-1098',
        bandName: 'Luna & The Boys',
        roomId: 'room-02',
        roomName: 'Studio B (Standard Band Room)',
        date: today,
        startTime: '18:30',
        endTime: '20:30',
        purpose: 'อัดเพลงเดโมส่งประกวด Campus Music Awards',
        memberCount: 5,
        status: 'PENDING',
        adminNote: 'รอนายกชมรมตรวจเช็คตารางซ้อนทับ',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'bk-03',
        bookingCode: 'BK-202610-003',
        userId: 'usr-member-03',
        userName: 'ติณณ์ วงศ์เจริญ',
        studentId: '65011230',
        phone: '086-555-7890',
        bandName: 'Neon City Lights',
        roomId: 'room-03',
        roomName: 'Studio C (Acoustic & Vocal Suite)',
        date: tomorrow,
        startTime: '14:00',
        endTime: '16:00',
        purpose: 'ซ้อมร้องประสานเสียงอะคูสติกงานปฐมนิเทศ',
        memberCount: 4,
        status: 'APPROVED',
        adminNote: 'เรียบร้อย อย่าลืมถอดรองเท้าเข้าห้อง C',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 10).toISOString()
      },
      {
        id: 'bk-04',
        bookingCode: 'BK-202610-004',
        userId: 'usr-member-01',
        userName: 'กวิน ศรีสุนทร',
        studentId: '65010412',
        phone: '089-876-5432',
        bandName: 'The Midnight Echoes',
        roomId: 'room-01',
        roomName: 'Studio A (Main Live Hall)',
        date: yesterday,
        startTime: '17:00',
        endTime: '19:00',
        purpose: 'ซ้อมเพลงคัฟเวอร์',
        memberCount: 5,
        status: 'COMPLETED',
        adminNote: 'ใช้งานเสร็จสมบูรณ์ อุปกรณ์เรียบร้อย',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ];

    this.borrowings = [
      {
        id: 'br-01',
        borrowCode: 'BR-202610-001',
        userId: 'usr-member-01',
        userName: 'กวิน ศรีสุนทร',
        studentId: '65010412',
        phone: '089-876-5432',
        equipmentId: 'eq-01',
        equipmentName: 'กีตาร์ไฟฟ้า Fender Player Plus Stratocaster',
        equipmentCode: 'EQ-GTR-001',
        quantity: 1,
        borrowDate: today,
        expectedReturnDate: tomorrow,
        purpose: 'นำไปบันทึกเสียงกีตาร์สำหรับโปรเจกต์ส่งอาจารย์ที่สตูดิโอนิเทศ',
        status: 'BORROWED',
        borrowCondition: 'EXCELLENT',
        adminNote: 'ตรวจสอบกระเป๋ากีตาร์และคันโยกครบถ้วน',
        createdAt: new Date(Date.now() - 3600000 * 15).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 14).toISOString()
      },
      {
        id: 'br-02',
        borrowCode: 'BR-202610-002',
        userId: 'usr-member-02',
        userName: 'ฟ้าใส นพเก้า',
        studentId: '66010884',
        phone: '095-432-1098',
        equipmentId: 'eq-05',
        equipmentName: 'ไมโครโฟนสาย Shure SM58-LC (Dynamic Vocal)',
        equipmentCode: 'EQ-MIC-001',
        quantity: 3,
        borrowDate: today,
        expectedReturnDate: tomorrow,
        purpose: 'ใช้ร้องเพลงในงานประกวดรอบคัดเลือกชมรม',
        status: 'REQUESTED',
        borrowCondition: 'GOOD',
        adminNote: 'รอผู้ดูแลตรวจสอบจำนวนไมค์คงเหลือในกล่อง',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'br-03',
        borrowCode: 'BR-202610-003',
        userId: 'usr-member-03',
        userName: 'ติณณ์ วงศ์เจริญ',
        studentId: '65011230',
        phone: '086-555-7890',
        equipmentId: 'eq-04',
        equipmentName: 'สเตจเปียโน Roland RD-88 88 คีย์',
        equipmentCode: 'EQ-KEY-001',
        quantity: 1,
        borrowDate: yesterday,
        expectedReturnDate: yesterday, // Intentionally overdue for demo
        purpose: 'ใช้เล่นเปียโนเปิดหมวกการกุศลหน้าหอประชุม',
        status: 'OVERDUE',
        borrowCondition: 'EXCELLENT',
        adminNote: 'เกินกำหนดส่งคืน 1 วัน ได้ติดต่อเตือนทางเบอร์โทรศัพท์แล้ว',
        createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
      },
      {
        id: 'br-04',
        borrowCode: 'BR-202610-004',
        userId: 'usr-member-02',
        userName: 'ฟ้าใส นพเก้า',
        studentId: '66010884',
        phone: '095-432-1098',
        equipmentId: 'eq-08',
        equipmentName: 'สายสัญญาณ Mogami Gold Guitar Cable 6 เมตร',
        equipmentCode: 'EQ-ACC-001',
        quantity: 2,
        borrowDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
        expectedReturnDate: yesterday,
        actualReturnDate: yesterday,
        purpose: 'ใช้งานซ้อมนอกสถานที่',
        status: 'RETURNED',
        borrowCondition: 'GOOD',
        returnCondition: 'GOOD',
        adminNote: 'ตรวจรับคืนเรียบร้อย ม้วนสายเรียบร้อย ไม่เสียหาย',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
      }
    ];

    this.logs = [
      {
        id: 'log-01',
        action: 'APPROVE',
        entity: 'BOOKING',
        description: 'อนุมัติการจองห้อง Studio A โดยวง The Midnight Echoes',
        actorName: 'เอกชัย รุ่งเรืองกิจ',
        timestamp: new Date(Date.now() - 3600000 * 20).toISOString()
      },
      {
        id: 'log-02',
        action: 'CREATE',
        entity: 'BORROWING',
        description: 'สมาชิก ฟ้าใส นพเก้า ขอยืมไมค์ Shure SM58 จำนวน 3 ตัว',
        actorName: 'ฟ้าใส นพเก้า',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'log-03',
        action: 'RETURN',
        entity: 'BORROWING',
        description: 'รับคืนสาย Mogami Gold 2 เส้น สภาพสมบูรณ์',
        actorName: 'เอกชัย รุ่งเรืองกิจ',
        timestamp: new Date(Date.now() - 86400000 * 1).toISOString()
      }
    ];
  }

  // --- STATS ---
  getStats(): SystemStats {
    const today = new Date().toISOString().split('T')[0];
    const activeRooms = new Set(
      this.bookings
        .filter(b => b.date === today && (b.status === 'APPROVED' || b.status === 'IN_USE'))
        .map(b => b.roomId)
    ).size;

    const totalEquipments = this.equipments.reduce((sum, e) => sum + e.totalQuantity, 0);
    const availableEquipments = this.equipments.reduce((sum, e) => sum + e.availableQuantity, 0);
    const borrowedEquipments = totalEquipments - availableEquipments;

    const pendingBookings = this.bookings.filter(b => b.status === 'PENDING').length;
    const pendingBorrowings = this.borrowings.filter(b => b.status === 'REQUESTED').length;
    const overdueBorrowings = this.borrowings.filter(b => b.status === 'OVERDUE').length;

    return {
      totalRooms: this.rooms.length,
      activeRoomsToday: activeRooms,
      totalEquipments,
      availableEquipments,
      borrowedEquipments,
      pendingBookings,
      pendingBorrowings,
      overdueBorrowings,
      totalUsers: this.users.length
    };
  }

  // --- USERS ---
  getUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  // --- ROOMS CRUD ---
  getRooms(search?: string, status?: string): Room[] {
    let result = [...this.rooms];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r => 
        r.name.toLowerCase().includes(q) || 
        r.code.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    }
    if (status && status !== 'ALL') {
      result = result.filter(r => r.status === status);
    }
    return result;
  }

  getRoomById(id: string): Room | undefined {
    return this.rooms.find(r => r.id === id);
  }

  createRoom(data: Omit<Room, 'id'>, actorName: string = 'Admin'): Room {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      ...data
    };
    this.rooms.push(newRoom);
    this.addLog('CREATE', 'ROOM', `เพิ่มห้องซ้อมใหม่: ${newRoom.name} (${newRoom.code})`, actorName);
    return newRoom;
  }

  updateRoom(id: string, data: Partial<Room>, actorName: string = 'Admin'): Room {
    const idx = this.rooms.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('ไม่พบข้อมูลห้องซ้อมที่ระบุ');
    this.rooms[idx] = { ...this.rooms[idx], ...data };
    this.addLog('UPDATE', 'ROOM', `แก้ไขข้อมูลห้องซ้อม: ${this.rooms[idx].name}`, actorName);
    return this.rooms[idx];
  }

  deleteRoom(id: string, actorName: string = 'Admin'): boolean {
    const room = this.rooms.find(r => r.id === id);
    if (!room) return false;
    // Check if active bookings exist
    const hasActive = this.bookings.some(b => b.roomId === id && (b.status === 'APPROVED' || b.status === 'PENDING'));
    if (hasActive) {
      throw new Error('ไม่สามารถลบห้องนี้ได้เนื่องจากยังมีรายการจองที่รออนุมัติหรือได้รับการอนุมัติอยู่');
    }
    this.rooms = this.rooms.filter(r => r.id !== id);
    this.addLog('DELETE', 'ROOM', `ลบห้องซ้อม: ${room.name}`, actorName);
    return true;
  }

  // --- BOOKINGS CRUD ---
  getBookings(filters?: {
    search?: string;
    roomId?: string;
    userId?: string;
    status?: string;
    date?: string;
  }): Booking[] {
    let result = [...this.bookings];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(b => 
        b.bookingCode.toLowerCase().includes(q) ||
        b.bandName.toLowerCase().includes(q) ||
        b.userName.toLowerCase().includes(q) ||
        b.studentId.toLowerCase().includes(q) ||
        b.roomName.toLowerCase().includes(q) ||
        b.purpose.toLowerCase().includes(q)
      );
    }
    if (filters?.roomId && filters.roomId !== 'ALL') {
      result = result.filter(b => b.roomId === filters.roomId);
    }
    if (filters?.userId && filters.userId !== 'ALL') {
      result = result.filter(b => b.userId === filters.userId);
    }
    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter(b => b.status === filters.status);
    }
    if (filters?.date) {
      result = result.filter(b => b.date === filters.date);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getBookingById(id: string): Booking | undefined {
    return this.bookings.find(b => b.id === id);
  }

  // Check for time slot clash
  checkBookingConflict(roomId: string, date: string, startTime: string, endTime: string, excludeId?: string): boolean {
    const existing = this.bookings.filter(b => 
      b.roomId === roomId &&
      b.date === date &&
      b.id !== excludeId &&
      (b.status === 'APPROVED' || b.status === 'IN_USE')
    );

    for (const b of existing) {
      // Overlap condition: startTime < b.endTime && endTime > b.startTime
      if (startTime < b.endTime && endTime > b.startTime) {
        return true;
      }
    }
    return false;
  }

  createBooking(data: {
    userId: string;
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    purpose: string;
    bandName: string;
    memberCount: number;
    phone: string;
  }): Booking {
    // Validation
    const user = this.getUserById(data.userId);
    if (!user) throw new Error('ไม่พบข้อมูลผู้ใช้ในระบบ');
    const room = this.getRoomById(data.roomId);
    if (!room) throw new Error('ไม่พบห้องซ้อมที่เลือก');
    if (room.status === 'MAINTENANCE' || room.status === 'CLOSED') {
      throw new Error(`ห้อง ${room.name} ขณะนี้ปิดปรับปรุง ไม่สามารถจองได้`);
    }

    if (data.startTime >= data.endTime) {
      throw new Error('เวลาเริ่มใช้งานต้องมาก่อนเวลาสิ้นสุดการใช้งาน');
    }

    if (this.checkBookingConflict(data.roomId, data.date, data.startTime, data.endTime)) {
      throw new Error(`ช่วงเวลา ${data.startTime} - ${data.endTime} ของห้อง ${room.name} มีการจองที่อนุมัติแล้ว กรุณาเลือกช่วงเวลาอื่น`);
    }

    const codeNumber = String(this.bookings.length + 1).padStart(3, '0');
    const dateFormatted = data.date.replace(/-/g, '');
    const bookingCode = `BK-${dateFormatted.substring(0, 6)}-${codeNumber}`;

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      bookingCode,
      userId: user.id,
      userName: user.name,
      studentId: user.studentId,
      phone: data.phone || user.phone,
      bandName: data.bandName,
      roomId: room.id,
      roomName: room.name,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      purpose: data.purpose,
      memberCount: Number(data.memberCount) || 1,
      status: 'PENDING',
      adminNote: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.bookings.unshift(newBooking);
    this.addLog('CREATE', 'BOOKING', `ยื่นขอจองห้องซ้อม ${room.name} โดยวง ${newBooking.bandName}`, user.name);
    return newBooking;
  }

  updateBooking(id: string, updates: Partial<Booking>, actorName: string = 'User'): Booking {
    const idx = this.bookings.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('ไม่พบรายการจองที่ต้องการแก้ไข');

    const current = this.bookings[idx];

    // If changing room or time, check conflict
    const targetRoomId = updates.roomId || current.roomId;
    const targetDate = updates.date || current.date;
    const targetStart = updates.startTime || current.startTime;
    const targetEnd = updates.endTime || current.endTime;

    if (updates.roomId || updates.date || updates.startTime || updates.endTime) {
      if (targetStart >= targetEnd) {
        throw new Error('เวลาเริ่มใช้งานต้องมาก่อนเวลาสิ้นสุดการใช้งาน');
      }
      if (this.checkBookingConflict(targetRoomId, targetDate, targetStart, targetEnd, id)) {
        throw new Error(`ช่วงเวลาดังกล่าวของห้องซ้อมมีรายการจองอื่นทับซ้อนอยู่`);
      }
    }

    this.bookings[idx] = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.addLog(
      updates.status ? (updates.status === 'APPROVED' ? 'APPROVE' : updates.status === 'REJECTED' ? 'REJECT' : 'UPDATE') : 'UPDATE',
      'BOOKING',
      `อัปเดตการจอง ${current.bookingCode} (สถานะ: ${this.bookings[idx].status})`,
      actorName
    );

    return this.bookings[idx];
  }

  deleteBooking(id: string, actorName: string = 'User'): boolean {
    const booking = this.bookings.find(b => b.id === id);
    if (!booking) return false;
    this.bookings = this.bookings.filter(b => b.id !== id);
    this.addLog('DELETE', 'BOOKING', `ยกเลิก/ลบการจองห้อง ${booking.bookingCode}`, actorName);
    return true;
  }

  // --- EQUIPMENTS CRUD ---
  getEquipments(filters?: {
    search?: string;
    category?: string;
    condition?: string;
    availableOnly?: boolean;
  }): Equipment[] {
    let result = [...this.equipments];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(e => 
        e.name.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        e.brand.toLowerCase().includes(q) ||
        e.model.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
      );
    }
    if (filters?.category && filters.category !== 'ALL') {
      result = result.filter(e => e.category === filters.category);
    }
    if (filters?.condition && filters.condition !== 'ALL') {
      result = result.filter(e => e.condition === filters.condition);
    }
    if (filters?.availableOnly) {
      result = result.filter(e => e.availableQuantity > 0);
    }
    return result;
  }

  getEquipmentById(id: string): Equipment | undefined {
    return this.equipments.find(e => e.id === id);
  }

  createEquipment(data: Omit<Equipment, 'id'>, actorName: string = 'Admin'): Equipment {
    const newEq: Equipment = {
      id: `eq-${Date.now()}`,
      ...data,
      availableQuantity: data.totalQuantity
    };
    this.equipments.push(newEq);
    this.addLog('CREATE', 'EQUIPMENT', `เพิ่มอุปกรณ์ใหม่: ${newEq.name} (${newEq.code})`, actorName);
    return newEq;
  }

  updateEquipment(id: string, data: Partial<Equipment>, actorName: string = 'Admin'): Equipment {
    const idx = this.equipments.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('ไม่พบข้อมูลอุปกรณ์ที่ต้องการแก้ไข');
    this.equipments[idx] = { ...this.equipments[idx], ...data };
    this.addLog('UPDATE', 'EQUIPMENT', `แก้ไขข้อมูลอุปกรณ์: ${this.equipments[idx].name}`, actorName);
    return this.equipments[idx];
  }

  deleteEquipment(id: string, actorName: string = 'Admin'): boolean {
    const eq = this.equipments.find(e => e.id === id);
    if (!eq) return false;
    const isBorrowed = this.borrowings.some(b => 
      b.equipmentId === id && (b.status === 'BORROWED' || b.status === 'OVERDUE' || b.status === 'REQUESTED')
    );
    if (isBorrowed) {
      throw new Error('ไม่สามารถลบอุปกรณ์นี้ได้เนื่องจากมีคำขอยืมหรืออยู่ระหว่างการยืมใช้งาน');
    }
    this.equipments = this.equipments.filter(e => e.id !== id);
    this.addLog('DELETE', 'EQUIPMENT', `ลบอุปกรณ์: ${eq.name}`, actorName);
    return true;
  }

  // --- BORROWINGS CRUD ---
  getBorrowings(filters?: {
    search?: string;
    userId?: string;
    equipmentId?: string;
    status?: string;
  }): Borrowing[] {
    let result = [...this.borrowings];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(b => 
        b.borrowCode.toLowerCase().includes(q) ||
        b.userName.toLowerCase().includes(q) ||
        b.studentId.toLowerCase().includes(q) ||
        b.equipmentName.toLowerCase().includes(q) ||
        b.equipmentCode.toLowerCase().includes(q) ||
        b.purpose.toLowerCase().includes(q)
      );
    }
    if (filters?.userId && filters.userId !== 'ALL') {
      result = result.filter(b => b.userId === filters.userId);
    }
    if (filters?.equipmentId && filters.equipmentId !== 'ALL') {
      result = result.filter(b => b.equipmentId === filters.equipmentId);
    }
    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter(b => b.status === filters.status);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getBorrowingById(id: string): Borrowing | undefined {
    return this.borrowings.find(b => b.id === id);
  }

  createBorrowing(data: {
    userId: string;
    equipmentId: string;
    quantity: number;
    borrowDate: string;
    expectedReturnDate: string;
    purpose: string;
    phone: string;
  }): Borrowing {
    const user = this.getUserById(data.userId);
    if (!user) throw new Error('ไม่พบข้อมูลผู้ใช้ในระบบ');
    const eq = this.getEquipmentById(data.equipmentId);
    if (!eq) throw new Error('ไม่พบอุปกรณ์ที่ต้องการยืม');

    const qty = Number(data.quantity) || 1;
    if (qty <= 0) throw new Error('จำนวนที่ต้องการยืมต้องมากกว่า 0');
    if (qty > eq.availableQuantity) {
      throw new Error(`อุปกรณ์ '${eq.name}' มีให้ยืมคงเหลือเพียง ${eq.availableQuantity} ชิ้น (คุณขอ ${qty} ชิ้น)`);
    }

    if (data.borrowDate > data.expectedReturnDate) {
      throw new Error('วันที่คืนอุปกรณ์ต้องไม่เร็วกว่าวันที่ยืม');
    }

    const codeNumber = String(this.borrowings.length + 1).padStart(3, '0');
    const dateFormatted = data.borrowDate.replace(/-/g, '');
    const borrowCode = `BR-${dateFormatted.substring(0, 6)}-${codeNumber}`;

    const newBorrowing: Borrowing = {
      id: `br-${Date.now()}`,
      borrowCode,
      userId: user.id,
      userName: user.name,
      studentId: user.studentId,
      phone: data.phone || user.phone,
      equipmentId: eq.id,
      equipmentName: eq.name,
      equipmentCode: eq.code,
      quantity: qty,
      borrowDate: data.borrowDate,
      expectedReturnDate: data.expectedReturnDate,
      purpose: data.purpose,
      status: 'REQUESTED',
      borrowCondition: eq.condition,
      adminNote: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.borrowings.unshift(newBorrowing);
    this.addLog('CREATE', 'BORROWING', `ยื่นคำขอยืม ${eq.name} x${qty} โดย ${user.name}`, user.name);
    return newBorrowing;
  }

  updateBorrowing(id: string, updates: Partial<Borrowing>, actorName: string = 'Admin'): Borrowing {
    const idx = this.borrowings.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('ไม่พบรายการยืมที่ต้องการแก้ไข');

    const current = this.borrowings[idx];
    const prevStatus = current.status;
    const newStatus = updates.status || prevStatus;

    const eq = this.getEquipmentById(current.equipmentId);

    // Stock adjustments based on status transitions
    if (eq && prevStatus !== newStatus) {
      // Transition from REQUESTED to BORROWED -> decrease available
      if (prevStatus === 'REQUESTED' && newStatus === 'BORROWED') {
        if (eq.availableQuantity < current.quantity) {
          throw new Error(`สต็อกอุปกรณ์ไม่เพียงพอสำหรับการอนุมัติ (เหลือ ${eq.availableQuantity})`);
        }
        eq.availableQuantity -= current.quantity;
      }
      // Transition from BORROWED/OVERDUE to RETURNED -> increase available
      else if ((prevStatus === 'BORROWED' || prevStatus === 'OVERDUE') && newStatus === 'RETURNED') {
        eq.availableQuantity = Math.min(eq.totalQuantity, eq.availableQuantity + current.quantity);
        if (updates.returnCondition) {
          eq.condition = updates.returnCondition;
        }
      }
      // Transition from BORROWED to REJECTED/CANCELLED -> revert stock if needed
      else if (prevStatus === 'BORROWED' && (newStatus === 'REJECTED' || newStatus === 'REQUESTED')) {
        eq.availableQuantity = Math.min(eq.totalQuantity, eq.availableQuantity + current.quantity);
      }
    }

    this.borrowings[idx] = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const action = newStatus === 'RETURNED' ? 'RETURN' : newStatus === 'BORROWED' ? 'APPROVE' : newStatus === 'REJECTED' ? 'REJECT' : 'UPDATE';
    this.addLog(
      action,
      'BORROWING',
      `อัปเดตคำขอยืม ${current.borrowCode} (สถานะ: ${newStatus})`,
      actorName
    );

    return this.borrowings[idx];
  }

  deleteBorrowing(id: string, actorName: string = 'User'): boolean {
    const borrowing = this.borrowings.find(b => b.id === id);
    if (!borrowing) return false;
    
    // If currently borrowed, revert stock
    if (borrowing.status === 'BORROWED' || borrowing.status === 'OVERDUE') {
      const eq = this.getEquipmentById(borrowing.equipmentId);
      if (eq) {
        eq.availableQuantity = Math.min(eq.totalQuantity, eq.availableQuantity + borrowing.quantity);
      }
    }

    this.borrowings = this.borrowings.filter(b => b.id !== id);
    this.addLog('DELETE', 'BORROWING', `ยกเลิก/ลบคำขอยืม ${borrowing.borrowCode}`, actorName);
    return true;
  }

  // --- ACTIVITY LOGS ---
  addLog(action: ActivityLog['action'], entity: ActivityLog['entity'], description: string, actorName: string) {
    this.logs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action,
      entity,
      description,
      actorName,
      timestamp: new Date().toISOString()
    });
    if (this.logs.length > 50) this.logs.pop();
  }

  getLogs(): ActivityLog[] {
    return this.logs;
  }

  resetData() {
    this.seedDefaultData();
  }
}

export const dbStore = new DatabaseStore();
