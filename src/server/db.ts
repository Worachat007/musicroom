import { PrismaClient } from '@prisma/client';
import type { Booking, Room } from '../types/index.ts';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const roomSelect = {
  id: true,
  code: true,
  name: true,
  capacity: true,
  description: true,
  equipmentIncluded: true,
  hourlyRate: true,
  status: true,
  imageUrl: true,
  color: true,
} as const;

export async function listRooms() {
  return prisma.room.findMany({ select: roomSelect, orderBy: { code: 'asc' } });
}

export async function listBookings(where: Record<string, unknown>, take = 500) {
  return prisma.booking.findMany({
    where: where as never,
    include: { user: { select: { id: true, name: true, studentId: true, phone: true } }, room: { select: roomSelect } },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    take,
  });
}

export function mapRoom(room: any): Room {
  return {
    id: room.id,
    code: room.code,
    name: room.name,
    capacity: room.capacity,
    description: room.description ?? '',
    equipmentIncluded: room.equipmentIncluded ?? [],
    hourlyRate: Number(room.hourlyRate ?? 0),
    status: room.status,
    imageUrl: room.imageUrl ?? '',
    color: room.color ?? 'teal',
  };
}

export function mapBooking(record: any): Booking {
  return {
    id: record.id,
    bookingCode: record.bookingCode,
    userId: record.userId,
    userName: record.user.name,
    studentId: record.user.studentId,
    phone: record.phone || record.user.phone || '',
    bandName: record.bandName,
    roomId: record.roomId,
    roomName: record.room.name,
    date: record.date.toISOString().slice(0, 10),
    startTime: record.startTime,
    endTime: record.endTime,
    purpose: record.purpose,
    memberCount: record.memberCount,
    status: record.status,
    adminNote: record.adminNote ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
