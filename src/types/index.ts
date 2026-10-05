export type UserRole = 'ADMIN' | 'MEMBER';

export interface User {
  id: string;
  name: string;
  studentId: string;
  email: string;
  phone: string;
  role: UserRole;
  faculty: string;
  bandName?: string;
  avatar?: string;
}

export type RoomStatus = 'AVAILABLE' | 'MAINTENANCE' | 'CLOSED';

export interface Room {
  id: string;
  name: string;
  code: string;
  capacity: number;
  description: string;
  equipmentIncluded: string[];
  hourlyRate: number; // 0 for club members, or nominal fee
  status: RoomStatus;
  imageUrl: string;
  color: string;
}

export type BookingStatus = 
  | 'PENDING'    // รออนุมัติ
  | 'APPROVED'   // อนุมัติแล้ว
  | 'REJECTED'   // ไม่อนุมัติ
  | 'IN_USE'     // กำลังใช้งาน
  | 'COMPLETED'  // ใช้งานเสร็จสิ้น
  | 'CANCELLED'; // ยกเลิกแล้ว

export interface Booking {
  id: string;
  bookingCode: string;
  userId: string;
  userName: string;
  studentId: string;
  phone: string;
  bandName: string;
  roomId: string;
  roomName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  purpose: string;
  memberCount: number;
  status: BookingStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomAvailability {
  roomId: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
}

export type EquipmentCategory = 
  | 'GUITAR'
  | 'BASS'
  | 'DRUMS'
  | 'KEYBOARD'
  | 'AMPLIFIER'
  | 'MICROPHONE'
  | 'ACCESSORIES';

export type EquipmentCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'MAINTENANCE';

export interface Equipment {
  id: string;
  code: string;
  name: string;
  category: EquipmentCategory;
  brand: string;
  model: string;
  totalQuantity: number;
  availableQuantity: number;
  condition: EquipmentCondition;
  location: string;
  description: string;
  imageUrl: string;
}

export type BorrowStatus = 
  | 'REQUESTED' // ขอยืม (รออนุมัติ)
  | 'BORROWED'  // กำลังยืม
  | 'RETURNED'  // คืนแล้ว
  | 'OVERDUE'   // เกินกำหนด
  | 'REJECTED'; // ไม่อนุมัติ

export interface Borrowing {
  id: string;
  borrowCode: string;
  userId: string;
  userName: string;
  studentId: string;
  phone: string;
  equipmentId: string;
  equipmentName: string;
  equipmentCode: string;
  quantity: number;
  borrowDate: string; // YYYY-MM-DD
  expectedReturnDate: string; // YYYY-MM-DD
  actualReturnDate?: string; // YYYY-MM-DD
  purpose: string;
  status: BorrowStatus;
  borrowCondition: EquipmentCondition;
  returnCondition?: EquipmentCondition;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'RETURN';
  entity: 'BOOKING' | 'BORROWING' | 'ROOM' | 'EQUIPMENT';
  description: string;
  actorName: string;
  timestamp: string;
}

export interface SystemStats {
  totalRooms: number;
  activeRoomsToday: number;
  totalEquipments: number;
  availableEquipments: number;
  borrowedEquipments: number;
  pendingBookings: number;
  pendingBorrowings: number;
  overdueBorrowings: number;
  totalUsers: number;
}
