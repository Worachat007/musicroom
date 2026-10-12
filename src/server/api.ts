import { Router, type Request, type RequestHandler, type Response } from 'express';
import { randomUUID } from 'node:crypto';
import { Prisma, type BookingStatus } from '@prisma/client';
import { clearSessionCookie, getSessionUserId, hashPassword, setSessionCookie, verifyPassword } from './auth.ts';
import { listBookings, listRooms, mapBooking, mapRoom, prisma } from './db.ts';

export const apiRouter = Router();

type SafeUser = { id: string; name: string; studentId: string; role: 'ADMIN' | 'MEMBER'; phone: string; bandName: string | null };
type AuthedRequest = Request & { actor: SafeUser };

class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function sendError(response: Response, error: unknown) {
  if (error instanceof ApiError) return response.status(error.status).json({ success: false, error: error.message });
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return response.status(409).json({ success: false, error: 'รหัสนักศึกษานี้สมัครสมาชิกแล้ว' });
  }
  const errorMessage = error instanceof Error ? error.message : '';
  if (errorMessage.includes('Environment variable not found: DATABASE_URL')) {
    return response.status(503).json({ success: false, error: 'ระบบยังไม่ได้เชื่อมต่อฐานข้อมูล กรุณาแจ้งผู้ดูแลระบบตั้งค่า DATABASE_URL ก่อนสมัครสมาชิก' });
  }
  if (errorMessage.includes('SESSION_SECRET is required in production')) {
    return response.status(503).json({ success: false, error: 'ระบบสมาชิกยังตั้งค่าไม่ครบ กรุณาแจ้งผู้ดูแลระบบตรวจสอบ SESSION_SECRET' });
  }
  console.error('API error:', error);
  return response.status(500).json({ success: false, error: 'ระบบขัดข้องชั่วคราว กรุณาลองใหม่ หากยังไม่สำเร็จโปรดแจ้งผู้ดูแลระบบ' });
}

function safeUser(user: { id: string; name: string; studentId: string; role: 'ADMIN' | 'MEMBER'; phone: string; bandName: string | null }): SafeUser {
  return { id: user.id, name: user.name, studentId: user.studentId, role: user.role, phone: user.phone, bandName: user.bandName };
}

apiRouter.post('/auth/register', async (request, response) => {
  try {
    const { name, studentId, password } = request.body ?? {};
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanStudentId = typeof studentId === 'string' ? studentId.trim() : '';
    if (cleanName.length < 2 || cleanName.length > 80) throw new ApiError(400, 'กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร');
    if (!/^\d{9}-\d$/.test(cleanStudentId)) throw new ApiError(400, 'รหัสนักศึกษาต้องอยู่ในรูปแบบ 663450351-5');
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) throw new ApiError(400, 'รหัสผ่านต้องมีความยาว 8-128 ตัวอักษร');

    const user = await prisma.user.create({
      data: { name: cleanName, studentId: cleanStudentId, passwordHash: hashPassword(password) },
      select: { id: true, name: true, studentId: true, role: true, phone: true, bandName: true },
    });
    setSessionCookie(response, user.id);
    return response.status(201).json({ success: true, data: safeUser(user) });
  } catch (error) { return sendError(response, error); }
});

apiRouter.post('/auth/login', async (request, response) => {
  try {
    const { studentId, password } = request.body ?? {};
    if (typeof studentId !== 'string' || typeof password !== 'string') throw new ApiError(400, 'กรุณากรอกรหัสนักศึกษาและรหัสผ่าน');
    const cleanStudentId = studentId.trim();
    if (!/^\d{9}-\d$/.test(cleanStudentId)) throw new ApiError(400, 'รหัสนักศึกษาต้องอยู่ในรูปแบบ 663450351-5');
    const user = await prisma.user.findUnique({ where: { studentId: cleanStudentId } });
    if (!user || !verifyPassword(password, user.passwordHash)) throw new ApiError(401, 'รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง');
    setSessionCookie(response, user.id);
    return response.json({ success: true, data: safeUser(user) });
  } catch (error) { return sendError(response, error); }
});

const authenticate: RequestHandler = async (request, response, next) => {
  try {
    const userId = getSessionUserId(request);
    if (!userId) throw new ApiError(401, 'กรุณาเข้าสู่ระบบ');
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, studentId: true, role: true, phone: true, bandName: true } });
    if (!user) throw new ApiError(401, 'ไม่พบบัญชีผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
    (request as AuthedRequest).actor = safeUser(user);
    next();
  } catch (error) { sendError(response, error); }
};

apiRouter.use(authenticate);

apiRouter.get('/auth/me', (request, response) => response.json({ success: true, data: (request as AuthedRequest).actor }));
apiRouter.post('/auth/logout', (_request, response) => {
  clearSessionCookie(response);
  response.json({ success: true });
});

apiRouter.get('/rooms', async (_request, response) => {
  try {
    const rooms = await listRooms();
    response.json({ success: true, count: rooms.length, data: rooms.map(mapRoom) });
  } catch (error) { sendError(response, error); }
});

apiRouter.get('/bookings', async (request, response) => {
  try {
    const actor = (request as AuthedRequest).actor;
    const { search, roomId, userId, status, date } = request.query;
    const where: Prisma.BookingWhereInput = {};
    if (actor.role !== 'ADMIN') where.userId = actor.id;
    else if (typeof userId === 'string' && userId !== 'ALL') where.userId = userId;
    if (typeof roomId === 'string' && roomId !== 'ALL') where.roomId = roomId;
    if (typeof status === 'string' && status !== 'ALL') where.status = status as BookingStatus;
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) where.date = new Date(`${date}T00:00:00.000Z`);
    if (typeof search === 'string' && search.trim()) {
      const query = search.trim();
      where.OR = [
        { bookingCode: { contains: query, mode: 'insensitive' } },
        { bandName: { contains: query, mode: 'insensitive' } },
        { purpose: { contains: query, mode: 'insensitive' } },
        { user: { name: { contains: query, mode: 'insensitive' } } },
        { user: { studentId: { contains: query, mode: 'insensitive' } } },
        { room: { name: { contains: query, mode: 'insensitive' } } },
      ];
    }
    const records = await listBookings(where, 500);
    response.json({ success: true, count: records.length, data: records.map(mapBooking) });
  } catch (error) { sendError(response, error); }
});

apiRouter.get('/availability', async (request, response) => {
  try {
    const date = typeof request.query.date === 'string' ? request.query.date : undefined;
    const from = typeof request.query.from === 'string' ? request.query.from : date;
    const to = typeof request.query.to === 'string' ? request.query.to : from;
    if (!from || !to || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) throw new ApiError(400, 'กรุณาระบุช่วงวันที่ให้ถูกต้อง');
    const fromDate = new Date(`${from}T00:00:00.000Z`);
    const toDate = new Date(`${to}T00:00:00.000Z`);
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime()) || toDate < fromDate || toDate.getTime() - fromDate.getTime() > 42 * 86400000) throw new ApiError(400, 'ช่วงวันที่ไม่ถูกต้อง (เลือกได้ไม่เกิน 42 วัน)');
    const roomId = typeof request.query.roomId === 'string' ? request.query.roomId : undefined;
    const records = await prisma.booking.findMany({
      where: { date: { gte: fromDate, lte: toDate }, status: { in: ['PENDING', 'APPROVED', 'IN_USE'] }, ...(roomId && roomId !== 'ALL' ? { roomId } : {}) },
      select: { roomId: true, date: true, startTime: true, endTime: true, status: true },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
    response.json({ success: true, data: records.map((booking) => ({ ...booking, date: booking.date.toISOString().slice(0, 10) })) });
  } catch (error) { sendError(response, error); }
});

function validateBooking(input: Record<string, unknown>, roomCapacity: number, allowExistingPastDate = false) {
  const roomId = typeof input.roomId === 'string' ? input.roomId : '';
  const date = typeof input.date === 'string' ? input.date : '';
  const startTime = typeof input.startTime === 'string' ? input.startTime : '';
  const endTime = typeof input.endTime === 'string' ? input.endTime : '';
  const bandName = typeof input.bandName === 'string' ? input.bandName.trim() : '';
  const purpose = typeof input.purpose === 'string' ? input.purpose.trim() : '';
  const phone = typeof input.phone === 'string' ? input.phone.trim() : '';
  const memberCount = Number(input.memberCount);
  if (!roomId) throw new ApiError(400, 'กรุณาเลือกห้องซ้อม');
  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) throw new ApiError(400, 'วันที่จองไม่ถูกต้อง');
  if (!allowExistingPastDate && date < new Date().toISOString().slice(0, 10)) throw new ApiError(400, 'ไม่สามารถจองวันที่ผ่านมาแล้ว');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime) || startTime >= endTime) throw new ApiError(400, 'ช่วงเวลาไม่ถูกต้อง เวลาเริ่มต้องก่อนเวลาสิ้นสุด');
  if (bandName.length < 2 || bandName.length > 80) throw new ApiError(400, 'ชื่อวง/กลุ่มต้องมีความยาว 2-80 ตัวอักษร');
  if (purpose.length < 3 || purpose.length > 500) throw new ApiError(400, 'วัตถุประสงค์ต้องมีความยาว 3-500 ตัวอักษร');
  if (!Number.isInteger(memberCount) || memberCount < 1 || memberCount > roomCapacity) throw new ApiError(400, `จำนวนสมาชิกต้องอยู่ระหว่าง 1-${roomCapacity} คน`);
  if (phone && !/^[0-9+()\- ]{8,20}$/.test(phone)) throw new ApiError(400, 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง');
  return { roomId, date: new Date(`${date}T00:00:00.000Z`), dateText: date, startTime, endTime, bandName, purpose, memberCount, phone };
}

async function getRoomForBooking(roomId: string) {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw new ApiError(404, 'ไม่พบห้องซ้อมที่เลือก');
  if (room.status !== 'AVAILABLE') throw new ApiError(400, 'ห้องนี้ปิดให้บริการชั่วคราว');
  return room;
}

async function ensureNoConflict(tx: Prisma.TransactionClient, roomId: string, date: Date, startTime: string, endTime: string, excludeId?: string) {
  const conflict = await tx.booking.findFirst({
    where: { roomId, date, status: { in: ['PENDING', 'APPROVED', 'IN_USE'] }, startTime: { lt: endTime }, endTime: { gt: startTime }, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
  if (conflict) throw new ApiError(409, 'ช่วงเวลานี้มีผู้จองแล้ว กรุณาเลือกเวลาอื่น');
}

apiRouter.post('/bookings', async (request, response) => {
  try {
    const actor = (request as AuthedRequest).actor;
    const input = request.body ?? {};
    const room = await getRoomForBooking(String(input.roomId ?? ''));
    const validated = validateBooking(input, room.capacity);
    const booking = await prisma.$transaction(async (tx) => {
      await ensureNoConflict(tx, room.id, validated.date, validated.startTime, validated.endTime);
      const created = await tx.booking.create({
        data: {
          bookingCode: `BK-${validated.dateText.replaceAll('-', '')}-${randomUUID().slice(0, 6).toUpperCase()}`,
          userId: actor.id,
          roomId: room.id,
          date: validated.date,
          startTime: validated.startTime,
          endTime: validated.endTime,
          purpose: validated.purpose,
          bandName: validated.bandName,
          phone: validated.phone || actor.phone,
          memberCount: validated.memberCount,
        },
      });
      return tx.booking.findUniqueOrThrow({ where: { id: created.id }, include: { user: { select: { id: true, name: true, studentId: true, phone: true } }, room: { select: { id: true, code: true, name: true, capacity: true, description: true, equipmentIncluded: true, hourlyRate: true, status: true, imageUrl: true, color: true } } } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    response.status(201).json({ success: true, data: mapBooking(booking) });
  } catch (error) { sendError(response, error); }
});

apiRouter.put('/bookings/:id', async (request, response) => {
  try {
    const actor = (request as unknown as AuthedRequest).actor;
    const current = await prisma.booking.findUnique({ where: { id: request.params.id }, include: { room: true } });
    if (!current) throw new ApiError(404, 'ไม่พบรายการจองนี้');
    if (actor.role !== 'ADMIN' && (current.userId !== actor.id || current.status !== 'PENDING')) throw new ApiError(403, 'แก้ไขได้เฉพาะคำขอของคุณที่รออนุมัติ');

    const updates = request.body ?? {};
    if (actor.role !== 'ADMIN' && ('status' in updates || 'adminNote' in updates)) throw new ApiError(403, 'ไม่มีสิทธิ์เปลี่ยนสถานะการจอง');
    const roomId = typeof updates.roomId === 'string' ? updates.roomId : current.roomId;
    const targetRoom = await getRoomForBooking(roomId);
    const validated = validateBooking({
      roomId,
      date: typeof updates.date === 'string' ? updates.date : current.date.toISOString().slice(0, 10),
      startTime: updates.startTime ?? current.startTime,
      endTime: updates.endTime ?? current.endTime,
      bandName: updates.bandName ?? current.bandName,
      purpose: updates.purpose ?? current.purpose,
      memberCount: updates.memberCount ?? current.memberCount,
      phone: updates.phone ?? current.phone,
    }, targetRoom.capacity, (typeof updates.date !== 'string' || updates.date === current.date.toISOString().slice(0, 10)));
    const allowedStatuses: BookingStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'IN_USE', 'COMPLETED', 'CANCELLED'];
    const status = actor.role === 'ADMIN' && allowedStatuses.includes(updates.status) ? updates.status as BookingStatus : current.status;
    const updated = await prisma.$transaction(async (tx) => {
      if (['PENDING', 'APPROVED', 'IN_USE'].includes(status)) await ensureNoConflict(tx, roomId, validated.date, validated.startTime, validated.endTime, current.id);
      const record = await tx.booking.update({
        where: { id: current.id },
        data: {
          roomId,
          date: validated.date,
          startTime: validated.startTime,
          endTime: validated.endTime,
          bandName: validated.bandName,
          purpose: validated.purpose,
          memberCount: validated.memberCount,
          phone: validated.phone,
          status,
          ...(actor.role === 'ADMIN' && typeof updates.adminNote === 'string' ? { adminNote: updates.adminNote.slice(0, 500) } : {}),
        },
      });
      return tx.booking.findUniqueOrThrow({ where: { id: record.id }, include: { user: { select: { id: true, name: true, studentId: true, phone: true } }, room: { select: { id: true, code: true, name: true, capacity: true, description: true, equipmentIncluded: true, hourlyRate: true, status: true, imageUrl: true, color: true } } } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    response.json({ success: true, data: mapBooking(updated) });
  } catch (error) { sendError(response, error); }
});

apiRouter.delete('/bookings/:id', async (request, response) => {
  try {
    const actor = (request as unknown as AuthedRequest).actor;
    const booking = await prisma.booking.findUnique({ where: { id: request.params.id } });
    if (!booking) throw new ApiError(404, 'ไม่พบรายการจองนี้');
    if (actor.role !== 'ADMIN' && (booking.userId !== actor.id || booking.status !== 'PENDING')) throw new ApiError(403, 'ยกเลิกได้เฉพาะคำขอของคุณที่รออนุมัติ');
    await prisma.booking.delete({ where: { id: booking.id } });
    response.json({ success: true });
  } catch (error) { sendError(response, error); }
});
