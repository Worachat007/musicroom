import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/server/auth.ts';

const prisma = new PrismaClient();

const rooms = [
  { code: 'RM-A101', name: 'Studio A', capacity: 12, description: 'ห้องซ้อมวงขนาดใหญ่ พร้อมกลองชุด แอมป์ และระบบ PA', equipmentIncluded: ['กลองชุด', 'แอมป์กีตาร์', 'แอมป์เบส', 'ไมโครโฟน'], status: 'AVAILABLE' as const, color: 'teal' },
  { code: 'RM-B102', name: 'Studio B', capacity: 8, description: 'ห้องซ้อมมาตรฐานสำหรับวงดนตรี', equipmentIncluded: ['กลองชุด', 'แอมป์กีตาร์', 'แอมป์เบส', 'คีย์บอร์ด'], status: 'AVAILABLE' as const, color: 'amber' },
  { code: 'RM-C103', name: 'Studio C', capacity: 5, description: 'ห้องซ้อมอะคูสติกและฝึกร้องเพลง', equipmentIncluded: ['เปียโน', 'ไมโครโฟน'], status: 'AVAILABLE' as const, color: 'rose' },
  { code: 'RM-D104', name: 'Studio D', capacity: 3, description: 'ห้องซ้อมเดี่ยวและฝึกซ้อมกลอง', equipmentIncluded: ['กลองไฟฟ้า', 'มอนิเตอร์'], status: 'MAINTENANCE' as const, color: 'slate' },
];

async function main() {
  for (const room of rooms) {
    await prisma.room.upsert({
      where: { code: room.code },
      update: {},
      create: { ...room, hourlyRate: 0 },
    });
  }

  const studentId = process.env.ADMIN_STUDENT_ID?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (studentId && password) {
    if (!/^\d{9}-\d$/.test(studentId) || password.length < 8) {
      throw new Error('ADMIN_STUDENT_ID must use the format 123456789-0 and ADMIN_PASSWORD must be at least 8 characters');
    }
    await prisma.user.upsert({
      where: { studentId },
      update: {},
      create: {
        studentId,
        name: process.env.ADMIN_NAME?.trim() || 'ผู้ดูแลระบบ',
        passwordHash: hashPassword(password),
        role: 'ADMIN',
      },
    });
  }

  console.log(`Seeded ${rooms.length} rooms${studentId && password ? ' and configured the administrator account' : ''}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
