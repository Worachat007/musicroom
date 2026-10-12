import React, { useCallback, useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { AuthView } from './components/AuthView.tsx';
import { Navbar } from './components/Navbar.tsx';
import { BookingsView } from './components/BookingsView.tsx';
import { ToastContainer, type ToastMessage } from './components/Toast.tsx';
import { api } from './lib/api.ts';
import type { Booking, Room } from './types/index.ts';

function MainApp() {
  const { currentUser, isLoading: isAuthLoading, isAdmin } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((previous) => [...previous, { id, type, title, message }]);
    window.setTimeout(() => setToasts((previous) => previous.filter((toast) => toast.id !== id)), 4000);
  };

  const fetchData = useCallback(async () => {
    const [roomsResult, bookingsResult] = await Promise.all([api.getRooms(), api.getBookings()]);
    setRooms(roomsResult.data);
    setBookings(bookingsResult.data);
    setLoadError('');
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    setIsLoading(true);
    Promise.all([api.getRooms(), api.getBookings()])
      .then(([roomsResult, bookingsResult]) => {
        if (!active) return;
        setRooms(roomsResult.data);
        setBookings(bookingsResult.data);
        setLoadError('');
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลได้');
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [currentUser]);

  const createBooking = async (data: Partial<Booking>) => {
    const result = await api.createBooking(data);
    addToast('success', 'จองห้องซ้อมสำเร็จ', `รหัสการจอง ${result.data.bookingCode}`);
    await fetchData();
  };

  const updateBooking = async (id: string, data: Partial<Booking>) => {
    await api.updateBooking(id, data);
    addToast('success', 'บันทึกการแก้ไขแล้ว');
    await fetchData();
  };

  const deleteBooking = async (id: string) => {
    await api.deleteBooking(id);
    addToast('info', 'ยกเลิกรายการจองแล้ว');
    await fetchData();
  };

  if (isAuthLoading) return <div className="min-h-screen grid place-items-center bg-[#f4f5f0] text-[#52615d] text-sm">กำลังตรวจสอบบัญชี...</div>;
  if (!currentUser) return <AuthView />;

  return (
    <div className="min-h-screen bg-[#f4f5f0] text-[#192a2a] font-['Prompt',sans-serif]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-7 py-7 sm:py-9">
        {loadError && <div role="alert" className="mb-5 border border-[#e7b7a7] bg-[#fff2ec] text-[#934c37] px-4 py-3 rounded-md text-sm">โหลดข้อมูลไม่สำเร็จ: {loadError}</div>}
        {isLoading ? (
          <div className="py-24 text-center text-sm text-[#73807b]">กำลังโหลดตารางการจอง...</div>
        ) : (
          <BookingsView
            bookings={bookings}
            rooms={rooms}
            onRefresh={fetchData}
            onCreateBooking={createBooking}
            onUpdateBooking={updateBooking}
            onDeleteBooking={deleteBooking}
            isModalOpen={bookingModalOpen}
            setIsModalOpen={setBookingModalOpen}
          />
        )}
      </main>
      <footer className="border-t border-[#d9dfd8] py-5 px-4 text-center text-xs text-[#7b8580]">SoundSpace · ระบบจองห้องซ้อมดนตรี</footer>
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((previous) => previous.filter((toast) => toast.id !== id))} />
    </div>
  );
}

export default function App() {
  return <AuthProvider><MainApp /></AuthProvider>;
}
