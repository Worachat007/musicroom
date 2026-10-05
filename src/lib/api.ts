import { 
  Room, 
  Booking, 
  Equipment, 
  Borrowing, 
  User, 
  SystemStats, 
  ActivityLog 
} from '../types/index.ts';
import { RoomAvailability } from '../types/index.ts';

// Helper for making API calls with headers
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const currentUserId = localStorage.getItem('music_club_user_id') || 'usr-admin-01';
  
  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': currentUserId,
    ...options.headers,
  };

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json();
  if (!response.ok || json.success === false) {
    throw new Error(json.error || 'เกิดข้อผิดพลาดในการประมวลผล');
  }

  return json;
}

export const api = {
  // Stats & Logs
  getStats: () => request<{ success: boolean; data: SystemStats }>('/stats'),
  getLogs: () => request<{ success: boolean; data: ActivityLog[] }>('/logs'),
  resetData: () => request<{ success: boolean; message: string }>('/seed/reset', { method: 'POST' }),

  // Users
  getUsers: () => request<{ success: boolean; data: User[] }>('/users'),
  login: (userId: string, role?: string) => 
    request<{ success: boolean; data: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    }),

  // Rooms CRUD
  getRooms: (search?: string, status?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    return request<{ success: boolean; count: number; data: Room[] }>(`/rooms?${params.toString()}`);
  },
  getRoomById: (id: string) => request<{ success: boolean; data: Room }>(`/rooms/${id}`),
  createRoom: (data: Partial<Room>) => 
    request<{ success: boolean; message: string; data: Room }>('/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateRoom: (id: string, data: Partial<Room>) => 
    request<{ success: boolean; message: string; data: Room }>(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteRoom: (id: string) => 
    request<{ success: boolean; message: string }>(`/rooms/${id}`, {
      method: 'DELETE',
    }),

  // Bookings CRUD
  getBookings: (filters?: { search?: string; roomId?: string; userId?: string; status?: string; date?: string }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.roomId) params.append('roomId', filters.roomId);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date) params.append('date', filters.date);
    return request<{ success: boolean; count: number; data: Booking[] }>(`/bookings?${params.toString()}`);
  },
  getAvailability: (date: string) =>
    request<{ success: boolean; data: RoomAvailability[] }>(`/availability?date=${encodeURIComponent(date)}`),
  createBooking: (data: {
    userId: string;
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    purpose: string;
    bandName: string;
    memberCount: number;
    phone: string;
  }) => 
    request<{ success: boolean; message: string; data: Booking }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBooking: (id: string, data: Partial<Booking>) => 
    request<{ success: boolean; message: string; data: Booking }>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBooking: (id: string) => 
    request<{ success: boolean; message: string }>(`/bookings/${id}`, {
      method: 'DELETE',
    }),

  // Equipments CRUD
  getEquipments: (filters?: { search?: string; category?: string; condition?: string; availableOnly?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.condition) params.append('condition', filters.condition);
    if (filters?.availableOnly) params.append('availableOnly', 'true');
    return request<{ success: boolean; count: number; data: Equipment[] }>(`/equipments?${params.toString()}`);
  },
  createEquipment: (data: Partial<Equipment>) => 
    request<{ success: boolean; message: string; data: Equipment }>('/equipments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateEquipment: (id: string, data: Partial<Equipment>) => 
    request<{ success: boolean; message: string; data: Equipment }>(`/equipments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteEquipment: (id: string) => 
    request<{ success: boolean; message: string }>(`/equipments/${id}`, {
      method: 'DELETE',
    }),

  // Borrowings CRUD
  getBorrowings: (filters?: { search?: string; userId?: string; equipmentId?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.equipmentId) params.append('equipmentId', filters.equipmentId);
    if (filters?.status) params.append('status', filters.status);
    return request<{ success: boolean; count: number; data: Borrowing[] }>(`/borrowings?${params.toString()}`);
  },
  createBorrowing: (data: {
    userId: string;
    equipmentId: string;
    quantity: number;
    borrowDate: string;
    expectedReturnDate: string;
    purpose: string;
    phone: string;
  }) => 
    request<{ success: boolean; message: string; data: Borrowing }>('/borrowings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBorrowing: (id: string, data: Partial<Borrowing>) => 
    request<{ success: boolean; message: string; data: Borrowing }>(`/borrowings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBorrowing: (id: string) => 
    request<{ success: boolean; message: string }>(`/borrowings/${id}`, {
      method: 'DELETE',
    }),
};
