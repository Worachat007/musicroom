import { Router, Request, Response, RequestHandler } from 'express';
import { dbStore } from './db.ts';

export const apiRouter = Router();

// Middleware to simulate current authenticated user from header
const getActor = (req: Request) => {
  const actorHeader = req.headers['x-user-id'] as string;
  if (actorHeader) {
    return dbStore.getUserById(actorHeader);
  }
  return undefined;
};

const requireAdmin: RequestHandler = (req, res, next) => {
  const actor = getActor(req);
  if (!actor) return res.status(401).json({ success: false, error: 'กรุณาเข้าสู่ระบบ' });
  if (actor.role !== 'ADMIN') return res.status(403).json({ success: false, error: 'ต้องใช้สิทธิ์ผู้ดูแลระบบ' });
  next();
};

apiRouter.use((req, res, next) => {
  if (!getActor(req)) return res.status(401).json({ success: false, error: 'ไม่พบผู้ใช้หรือกรุณาเข้าสู่ระบบใหม่' });
  next();
});

// --- AUTH & USERS ---
apiRouter.get('/users', (req: Request, res: Response) => {
  const actor = getActor(req)!;
  res.json({ success: true, data: actor.role === 'ADMIN' ? dbStore.getUsers() : [actor] });
});

apiRouter.post('/auth/login', requireAdmin, (req: Request, res: Response) => {
  const { userId, role } = req.body;
  const users = dbStore.getUsers();
  let user = users.find(u => u.id === userId);
  if (!user && role) {
    user = users.find(u => u.role === role);
  }
  if (!user) {
    return res.status(404).json({ success: false, error: 'ไม่พบผู้ใช้งานนี้ในระบบ' });
  }
  return res.json({ success: true, data: user });
});

// --- STATS & LOGS ---
apiRouter.get('/stats', (req: Request, res: Response) => {
  const stats = dbStore.getStats();
  if (getActor(req)!.role !== 'ADMIN') {
    stats.pendingBookings = 0;
    stats.pendingBorrowings = 0;
    stats.overdueBorrowings = 0;
  }
  res.json({ success: true, data: stats });
});

apiRouter.get('/logs', (req: Request, res: Response) => {
  if (getActor(req)!.role !== 'ADMIN') return res.json({ success: true, data: [] });
  res.json({ success: true, data: dbStore.getLogs() });
});

apiRouter.post('/seed/reset', requireAdmin, (req: Request, res: Response) => {
  dbStore.resetData();
  res.json({ success: true, message: 'รีเซ็ตข้อมูลระบบกลับสู่ค่าเริ่มต้นเรียบร้อย' });
});

// --- ROOMS (CRUD: GET, POST, PUT, DELETE) ---
apiRouter.get('/rooms', (req: Request, res: Response) => {
  const { search, status } = req.query as { search?: string; status?: string };
  const rooms = dbStore.getRooms(search, status);
  res.json({ success: true, count: rooms.length, data: rooms });
});

apiRouter.get('/rooms/:id', (req: Request, res: Response) => {
  const room = dbStore.getRoomById(req.params.id);
  if (!room) return res.status(404).json({ success: false, error: 'ไม่พบห้องซ้อมนี้' });
  res.json({ success: true, data: room });
});

apiRouter.get('/availability', (req: Request, res: Response) => {
  const date = String(req.query.date || '');
  if (!date) return res.status(400).json({ success: false, error: 'กรุณาระบุวันที่ต้องการตรวจสอบ' });
  const data = dbStore.getBookings({ date })
    .filter((booking) => ['PENDING', 'APPROVED', 'IN_USE'].includes(booking.status))
    .map(({ roomId, startTime, endTime, status }) => ({ roomId, startTime, endTime, status }));
  res.json({ success: true, data });
});

apiRouter.post('/rooms', requireAdmin, (req: Request, res: Response) => {
  try {
    const actor = getActor(req);
    const { name, code, capacity, description, equipmentIncluded, hourlyRate, status, imageUrl, color } = req.body;
    
    // Validation
    if (!name || !code) {
      return res.status(400).json({ success: false, error: 'กรุณากรอกชื่อห้องและรหัสห้อง' });
    }
    if (Number(capacity) <= 0) {
      return res.status(400).json({ success: false, error: 'ความจุของห้องต้องมากกว่า 0 คน' });
    }

    const room = dbStore.createRoom({
      name,
      code,
      capacity: Number(capacity) || 1,
      description: description || '',
      equipmentIncluded: Array.isArray(equipmentIncluded) ? equipmentIncluded : [],
      hourlyRate: Number(hourlyRate) || 0,
      status: status || 'AVAILABLE',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
      color: color || 'indigo'
    }, actor!.name);

    res.status(201).json({ success: true, message: 'บันทึกห้องซ้อมใหม่สำเร็จ', data: room });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.put('/rooms/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const actor = getActor(req);
    const updated = dbStore.updateRoom(req.params.id, req.body, actor!.name);
    res.json({ success: true, message: 'แก้ไขข้อมูลห้องซ้อมสำเร็จ', data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.delete('/rooms/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const actor = getActor(req);
    const ok = dbStore.deleteRoom(req.params.id, actor!.name);
    if (!ok) return res.status(404).json({ success: false, error: 'ไม่พบห้องซ้อมที่ระบุ' });
    res.json({ success: true, message: 'ลบห้องซ้อมสำเร็จ' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// --- BOOKINGS (CRUD: GET, POST, PUT, DELETE) ---
apiRouter.get('/bookings', (req: Request, res: Response) => {
  const actor = getActor(req)!;
  const { search, roomId, userId, status, date } = req.query as any;
  const bookings = dbStore.getBookings({ search, roomId, userId: actor.role === 'ADMIN' ? userId : actor.id, status, date });
  res.json({ success: true, count: bookings.length, data: bookings });
});

apiRouter.get('/bookings/:id', (req: Request, res: Response) => {
  const booking = dbStore.getBookingById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, error: 'ไม่พบรายการจองนี้' });
  const actor = getActor(req)!;
  if (actor.role !== 'ADMIN' && booking.userId !== actor.id) return res.status(403).json({ success: false, error: 'ไม่มีสิทธิ์ดูรายการนี้' });
  res.json({ success: true, data: booking });
});

apiRouter.post('/bookings', (req: Request, res: Response) => {
  try {
    const actor = getActor(req)!;
    const { roomId, date, startTime, endTime, purpose, bandName, memberCount, phone } = req.body;
    
    // Server-side validation
    if (!roomId) return res.status(400).json({ success: false, error: 'กรุณาเลือกห้องซ้อม' });
    if (!date) return res.status(400).json({ success: false, error: 'กรุณาระบุวันที่จอง' });
    if (!startTime || !endTime) return res.status(400).json({ success: false, error: 'กรุณาระบุเวลาเริ่มและเวลาสิ้นสุด' });
    if (!bandName || bandName.trim().length < 2) return res.status(400).json({ success: false, error: 'กรุณาระบุชื่อวง/กลุ่ม (อย่างน้อย 2 ตัวอักษร)' });
    if (!purpose || purpose.trim().length < 3) return res.status(400).json({ success: false, error: 'กรุณาระบุวัตถุประสงค์ในการเข้าใช้บริการ' });

    const newBooking = dbStore.createBooking({
      userId: actor.id,
      roomId,
      date,
      startTime,
      endTime,
      purpose,
      bandName,
      memberCount: Number(memberCount) || 1,
      phone: phone || ''
    });

    res.status(201).json({ success: true, message: 'ส่งคำขอจองห้องซ้อมสำเร็จ รอดำเนินการอนุมัติ', data: newBooking });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.put('/bookings/:id', (req: Request, res: Response) => {
  try {
    const actor = getActor(req);
    const current = dbStore.getBookingById(req.params.id);
    if (!current) return res.status(404).json({ success: false, error: 'ไม่พบรายการจองนี้' });
    let updates = req.body;
    if (actor!.role !== 'ADMIN') {
      if (current.userId !== actor!.id) return res.status(403).json({ success: false, error: 'ไม่มีสิทธิ์แก้ไขรายการนี้' });
      if (current.status !== 'PENDING') return res.status(403).json({ success: false, error: 'แก้ไขได้เฉพาะคำขอที่รออนุมัติ' });
      if ('status' in req.body || 'adminNote' in req.body) return res.status(403).json({ success: false, error: 'สมาชิกไม่สามารถเปลี่ยนสถานะหรือบันทึกหมายเหตุผู้ดูแลได้' });
      const allowedFields = ['roomId', 'date', 'startTime', 'endTime', 'purpose', 'bandName', 'memberCount', 'phone'];
      updates = Object.fromEntries(allowedFields.filter((field) => field in req.body).map((field) => [field, req.body[field]]));
    }
    const updated = dbStore.updateBooking(req.params.id, updates, actor!.name);
    res.json({ success: true, message: 'แก้ไขข้อมูลการจองสำเร็จ', data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.delete('/bookings/:id', (req: Request, res: Response) => {
  try {
    const actor = getActor(req);
    const booking = dbStore.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'ไม่พบรายการจองนี้' });
    if (actor!.role !== 'ADMIN' && (booking.userId !== actor!.id || booking.status !== 'PENDING')) {
      return res.status(403).json({ success: false, error: 'ยกเลิกได้เฉพาะคำขอของคุณที่รออนุมัติ' });
    }
    const ok = dbStore.deleteBooking(req.params.id, actor!.name);
    if (!ok) return res.status(404).json({ success: false, error: 'ไม่พบรายการจองนี้' });
    res.json({ success: true, message: 'ยกเลิกรายการจองสำเร็จ' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// --- EQUIPMENTS (CRUD: GET, POST, PUT, DELETE) ---
apiRouter.get('/equipments', (req: Request, res: Response) => {
  const { search, category, condition, availableOnly } = req.query as any;
  const equipments = dbStore.getEquipments({
    search,
    category,
    condition,
    availableOnly: availableOnly === 'true'
  });
  res.json({ success: true, count: equipments.length, data: equipments });
});

apiRouter.get('/equipments/:id', (req: Request, res: Response) => {
  const eq = dbStore.getEquipmentById(req.params.id);
  if (!eq) return res.status(404).json({ success: false, error: 'ไม่พบอุปกรณ์นี้' });
  res.json({ success: true, data: eq });
});

apiRouter.post('/equipments', requireAdmin, (req: Request, res: Response) => {
  try {
    const actor = getActor(req);
    const { name, code, category, brand, model, totalQuantity, condition, location, description, imageUrl } = req.body;

    if (!name || !code || !category) {
      return res.status(400).json({ success: false, error: 'กรุณากรอกชื่อ รหัส และหมวดหมู่อุปกรณ์' });
    }
    const qty = Number(totalQuantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, error: 'จำนวนอุปกรณ์ต้องมากกว่า 0' });
    }

    const created = dbStore.createEquipment({
      name,
      code,
      category,
      brand: brand || '',
      model: model || '',
      totalQuantity: qty,
      availableQuantity: qty,
      condition: condition || 'GOOD',
      location: location || 'ตู้เก็บอุปกรณ์ชมรม',
      description: description || '',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
    }, actor!.name);

    res.status(201).json({ success: true, message: 'เพิ่มอุปกรณ์ใหม่เข้าสู่คลังสำเร็จ', data: created });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.put('/equipments/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const actor = getActor(req);
    const updated = dbStore.updateEquipment(req.params.id, req.body, actor!.name);
    res.json({ success: true, message: 'แก้ไขข้อมูลอุปกรณ์สำเร็จ', data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.delete('/equipments/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const actor = getActor(req);
    const ok = dbStore.deleteEquipment(req.params.id, actor!.name);
    if (!ok) return res.status(404).json({ success: false, error: 'ไม่พบอุปกรณ์ที่ระบุ' });
    res.json({ success: true, message: 'ลบอุปกรณ์สำเร็จ' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// --- BORROWINGS (CRUD: GET, POST, PUT, DELETE) ---
apiRouter.get('/borrowings', (req: Request, res: Response) => {
  const actor = getActor(req)!;
  const { search, userId, equipmentId, status } = req.query as any;
  const borrowings = dbStore.getBorrowings({ search, userId: actor.role === 'ADMIN' ? userId : actor.id, equipmentId, status });
  res.json({ success: true, count: borrowings.length, data: borrowings });
});

apiRouter.get('/borrowings/:id', (req: Request, res: Response) => {
  const borrowing = dbStore.getBorrowingById(req.params.id);
  if (!borrowing) return res.status(404).json({ success: false, error: 'ไม่พบรายการยืมนี้' });
  const actor = getActor(req)!;
  if (actor.role !== 'ADMIN' && borrowing.userId !== actor.id) return res.status(403).json({ success: false, error: 'ไม่มีสิทธิ์ดูรายการนี้' });
  res.json({ success: true, data: borrowing });
});

apiRouter.post('/borrowings', (req: Request, res: Response) => {
  try {
    const actor = getActor(req)!;
    const { equipmentId, quantity, borrowDate, expectedReturnDate, purpose, phone } = req.body;

    if (!equipmentId) return res.status(400).json({ success: false, error: 'กรุณาเลือกอุปกรณ์ที่ต้องการยืม' });
    if (!borrowDate || !expectedReturnDate) return res.status(400).json({ success: false, error: 'กรุณาระบุวันที่ยืมและกำหนดส่งคืน' });
    if (!purpose || purpose.trim().length < 3) return res.status(400).json({ success: false, error: 'กรุณาระบุวัตถุประสงค์ในการยืมอุปกรณ์' });

    const newBorrowing = dbStore.createBorrowing({
      userId: actor.id,
      equipmentId,
      quantity: Number(quantity) || 1,
      borrowDate,
      expectedReturnDate,
      purpose,
      phone: phone || ''
    });

    res.status(201).json({ success: true, message: 'ส่งคำขอยืมอุปกรณ์สำเร็จ รอผู้ดูแลอนุมัติ', data: newBorrowing });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.put('/borrowings/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const actor = getActor(req);
    const updated = dbStore.updateBorrowing(req.params.id, req.body, actor!.name);
    res.json({ success: true, message: 'อัปเดตรายการยืมสำเร็จ', data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

apiRouter.delete('/borrowings/:id', (req: Request, res: Response) => {
  try {
    const actor = getActor(req);
    const borrowing = dbStore.getBorrowingById(req.params.id);
    if (!borrowing) return res.status(404).json({ success: false, error: 'ไม่พบรายการยืมนี้' });
    if (actor!.role !== 'ADMIN' && (borrowing.userId !== actor!.id || borrowing.status !== 'REQUESTED')) {
      return res.status(403).json({ success: false, error: 'ยกเลิกได้เฉพาะคำขอยืมของคุณที่รออนุมัติ' });
    }
    const ok = dbStore.deleteBorrowing(req.params.id, actor!.name);
    if (!ok) return res.status(404).json({ success: false, error: 'ไม่พบรายการยืมนี้' });
    res.json({ success: true, message: 'ยกเลิกรายการยืมสำเร็จ' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});
