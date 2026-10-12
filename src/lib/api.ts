import type { Booking, Room, RoomAvailability, User } from '../types/index.ts';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.error || `Request failed (${response.status})`);
  }
  return payload as T;
}

export const api = {
  getCurrentUser: () => request<{ success: boolean; data: User }>('/auth/me'),
  register: (data: { name: string; studentId: string; password: string }) => request<{ success: boolean; data: User }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { studentId: string; password: string }) => request<{ success: boolean; data: User }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
  getRooms: () => request<{ success: boolean; count: number; data: Room[] }>('/rooms'),
  getBookings: (filters?: { search?: string; roomId?: string; userId?: string; status?: string; date?: string }) => {
    const params = new URLSearchParams();
    Object.entries(filters ?? {}).forEach(([key, value]) => { if (value) params.set(key, value); });
    return request<{ success: boolean; count: number; data: Booking[] }>(`/bookings?${params.toString()}`);
  },
  getAvailability: (from: string, to = from, roomId?: string) => {
    const params = new URLSearchParams({ from, to });
    if (roomId && roomId !== 'ALL') params.set('roomId', roomId);
    return request<{ success: boolean; data: RoomAvailability[] }>(`/availability?${params.toString()}`);
  },
  createBooking: (data: Partial<Booking>) => request<{ success: boolean; data: Booking }>('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  updateBooking: (id: string, data: Partial<Booking>) => request<{ success: boolean; data: Booking }>(`/bookings/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBooking: (id: string) => request<{ success: boolean }>('/bookings/' + encodeURIComponent(id), { method: 'DELETE' }),
};
