import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { BookingsView } from './components/BookingsView.tsx';
import { BorrowingView } from './components/BorrowingView.tsx';
import { AdminManageView } from './components/AdminManageView.tsx';
import { ApiDocView } from './components/ApiDocView.tsx';
import { ToastContainer, ToastMessage } from './components/Toast.tsx';
import { api } from './lib/api.ts';
import { Room, Booking, Equipment, Borrowing, SystemStats, ActivityLog } from './types/index.ts';

function MainApp() {
  const { currentUser, isAdmin } = useAuth();
  
  // Navigation tab
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Application Data States
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal control states
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      const [statsRes, roomsRes, bookingsRes, eqRes, borrowRes, logsRes] = await Promise.all([
        api.getStats(),
        api.getRooms(),
        api.getBookings(),
        api.getEquipments(),
        api.getBorrowings(),
        isAdmin ? api.getLogs() : Promise.resolve({ data: [] as ActivityLog[] }),
      ]);

      setStats(statsRes.data);
      setRooms(roomsRes.data);
      setBookings(bookingsRes.data);
      setEquipments(eqRes.data);
      setBorrowings(borrowRes.data);
      setLogs(logsRes.data);
    } catch (err: any) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData, currentUser]);

  useEffect(() => {
    if (!isAdmin && (currentTab === 'manage' || currentTab === 'api-docs')) {
      setCurrentTab('dashboard');
    }
  }, [currentTab, isAdmin]);

  // --- CRUD: Bookings ---
  const handleCreateBooking = async (data: any) => {
    const res = await api.createBooking(data);
    addToast('success', 'ส่งคำขอจองห้องสำเร็จ', `รหัสการจอง: ${res.data.bookingCode}`);
    await fetchData();
  };

  const handleUpdateBooking = async (id: string, data: any) => {
    const res = await api.updateBooking(id, data);
    addToast('success', 'อัปเดตข้อมูลการจองสำเร็จ', `สถานะ: ${res.data.status}`);
    await fetchData();
  };

  const handleDeleteBooking = async (id: string) => {
    await api.deleteBooking(id);
    addToast('info', 'ยกเลิกรายการจองเรียบร้อย');
    await fetchData();
  };

  // --- CRUD: Borrowings ---
  const handleCreateBorrowing = async (data: any) => {
    const res = await api.createBorrowing(data);
    addToast('success', 'ส่งคำขอยืมอุปกรณ์สำเร็จ', `รหัสคำขอ: ${res.data.borrowCode}`);
    await fetchData();
  };

  const handleUpdateBorrowing = async (id: string, data: any) => {
    const res = await api.updateBorrowing(id, data);
    addToast('success', 'อัปเดตรายการยืมสำเร็จ', `สถานะ: ${res.data.status}`);
    await fetchData();
  };

  const handleDeleteBorrowing = async (id: string) => {
    await api.deleteBorrowing(id);
    addToast('info', 'ยกเลิกคำขอยืมอุปกรณ์เรียบร้อย');
    await fetchData();
  };

  // --- CRUD: Rooms ---
  const handleCreateRoom = async (data: any) => {
    const res = await api.createRoom(data);
    addToast('success', 'เพิ่มห้องซ้อมดนตรีใหม่สำเร็จ', res.data.name);
    await fetchData();
  };

  const handleUpdateRoom = async (id: string, data: any) => {
    const res = await api.updateRoom(id, data);
    addToast('success', 'แก้ไขข้อมูลห้องซ้อมสำเร็จ', res.data.name);
    await fetchData();
  };

  const handleDeleteRoom = async (id: string) => {
    await api.deleteRoom(id);
    addToast('info', 'ลบห้องซ้อมสำเร็จ');
    await fetchData();
  };

  // --- CRUD: Equipments ---
  const handleCreateEquipment = async (data: any) => {
    const res = await api.createEquipment(data);
    addToast('success', 'เพิ่มอุปกรณ์ใหม่สำเร็จ', res.data.name);
    await fetchData();
  };

  const handleUpdateEquipment = async (id: string, data: any) => {
    const res = await api.updateEquipment(id, data);
    addToast('success', 'แก้ไขข้อมูลอุปกรณ์สำเร็จ', res.data.name);
    await fetchData();
  };

  const handleDeleteEquipment = async (id: string) => {
    await api.deleteEquipment(id);
    addToast('info', 'ลบอุปกรณ์สำเร็จ');
    await fetchData();
  };

  // Reset seed data
  const handleResetData = async () => {
    await api.resetData();
    addToast('success', 'รีเซ็ตข้อมูลตัวอย่างเรียบร้อย');
    await fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Prompt',sans-serif]">
      
      {/* Top Navbar with quick role switcher */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        pendingCount={isAdmin ? (stats?.pendingBookings ?? 0) + (stats?.pendingBorrowings ?? 0) : 0}
        overdueCount={isAdmin ? stats?.overdueBorrowings ?? 0 : 0}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm">กำลังโหลดข้อมูลระบบห้องซ้อมดนตรี...</p>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                rooms={rooms}
                logs={logs}
                onNavigate={setCurrentTab}
                onOpenBookingModal={() => {
                  setCurrentTab('bookings');
                  setBookingModalOpen(true);
                }}
                onOpenBorrowModal={() => {
                  setCurrentTab('borrowings');
                  setBorrowModalOpen(true);
                }}
              />
            )}

            {currentTab === 'bookings' && (
              <BookingsView
                bookings={bookings}
                rooms={rooms}
                onRefresh={fetchData}
                onCreateBooking={handleCreateBooking}
                onUpdateBooking={handleUpdateBooking}
                onDeleteBooking={handleDeleteBooking}
                isModalOpen={bookingModalOpen}
                setIsModalOpen={setBookingModalOpen}
              />
            )}

            {currentTab === 'borrowings' && (
              <BorrowingView
                equipments={equipments}
                borrowings={borrowings}
                onRefresh={fetchData}
                onCreateBorrowing={handleCreateBorrowing}
                onUpdateBorrowing={handleUpdateBorrowing}
                onDeleteBorrowing={handleDeleteBorrowing}
                isModalOpen={borrowModalOpen}
                setIsModalOpen={setBorrowModalOpen}
              />
            )}

            {currentTab === 'manage' && (
              <AdminManageView
                rooms={rooms}
                equipments={equipments}
                onRefresh={fetchData}
                onCreateRoom={handleCreateRoom}
                onUpdateRoom={handleUpdateRoom}
                onDeleteRoom={handleDeleteRoom}
                onCreateEquipment={handleCreateEquipment}
                onUpdateEquipment={handleUpdateEquipment}
                onDeleteEquipment={handleDeleteEquipment}
                onResetData={handleResetData}
              />
            )}

            {currentTab === 'api-docs' && <ApiDocView />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            SoundSpace Club Studio © 2026 ระบบบันทึกการใช้บริการห้องซ้อมดนตรี & ยืมอุปกรณ์
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Next.js Architecture</span>
            <span>•</span>
            <span>Tailwind CSS</span>
            <span>•</span>
            <span>React Hook Form</span>
            <span>•</span>
            <span>Prisma & PostgreSQL Models</span>
          </div>
        </div>
      </footer>

      {/* Global Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
