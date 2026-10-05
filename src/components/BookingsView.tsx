import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Calendar, 
  Clock, 
  Search, 
  Plus, 
  Filter, 
  Check, 
  X, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  Users, 
  CheckCircle2, 
  XCircle, 
  PlayCircle,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { Booking, Room, BookingStatus } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../lib/api.ts';
import { RoomAvailability } from '../types/index.ts';

interface BookingsViewProps {
  bookings: Booking[];
  rooms: Room[];
  onRefresh: () => void;
  onCreateBooking: (data: any) => Promise<void>;
  onUpdateBooking: (id: string, data: any) => Promise<void>;
  onDeleteBooking: (id: string) => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

interface BookingFormData {
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  bandName: string;
  memberCount: number;
  phone: string;
  purpose: string;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  bookings,
  rooms,
  onRefresh,
  onCreateBooking,
  onUpdateBooking,
  onDeleteBooking,
  isModalOpen,
  setIsModalOpen,
}) => {
  const { currentUser, isAdmin } = useAuth();

  // Filters & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [adminNoteModal, setAdminNoteModal] = useState<{ id: string; action: 'REJECT' | 'APPROVE' | 'NOTE' } | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [activeTabSub, setActiveTabSub] = useState<'LIST' | 'SCHEDULE'>('LIST');
  const [roomAvailability, setRoomAvailability] = useState<RoomAvailability[]>([]);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);

  // React Hook Form for Booking
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    defaultValues: {
      roomId: rooms[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      startTime: '16:00',
      endTime: '18:00',
      bandName: currentUser?.bandName || '',
      memberCount: 4,
      phone: currentUser?.phone || '',
      purpose: '',
    },
  });

  const watchRoomId = watch('roomId');
  const selectedRoomObj = rooms.find(r => r.id === watchRoomId);
  const availabilityDate = selectedDate || new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (activeTabSub !== 'SCHEDULE') return;
    let isCurrent = true;
    setIsAvailabilityLoading(true);
    api.getAvailability(availabilityDate)
      .then((response) => {
        if (isCurrent) setRoomAvailability(response.data);
      })
      .catch((error) => console.error('Availability fetch error:', error))
      .finally(() => {
        if (isCurrent) setIsAvailabilityLoading(false);
      });
    return () => { isCurrent = false; };
  }, [activeTabSub, availabilityDate]);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingBooking(null);
    reset({
      roomId: rooms[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      startTime: '16:00',
      endTime: '18:00',
      bandName: currentUser?.bandName || '',
      memberCount: 4,
      phone: currentUser?.phone || '',
      purpose: '',
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (b: Booking) => {
    setEditingBooking(b);
    setValue('roomId', b.roomId);
    setValue('date', b.date);
    setValue('startTime', b.startTime);
    setValue('endTime', b.endTime);
    setValue('bandName', b.bandName);
    setValue('memberCount', b.memberCount);
    setValue('phone', b.phone);
    setValue('purpose', b.purpose);
    setIsModalOpen(true);
  };

  // Submit Handler
  const onSubmit = async (formData: BookingFormData) => {
    try {
      if (editingBooking) {
        await onUpdateBooking(editingBooking.id, {
          ...formData,
          memberCount: Number(formData.memberCount),
        });
      } else {
        await onCreateBooking({
          ...formData,
          userId: currentUser?.id,
          memberCount: Number(formData.memberCount),
        });
      }
      setIsModalOpen(false);
      reset();
      setEditingBooking(null);
    } catch (err: any) {
      alert(err.message || 'บันทึกข้อมูลไม่สำเร็จ');
    }
  };

  // Admin Quick Status Change
  const handleStatusChange = async (id: string, newStatus: BookingStatus, note?: string) => {
    try {
      await onUpdateBooking(id, {
        status: newStatus,
        adminNote: note !== undefined ? note : undefined,
      });
      setAdminNoteModal(null);
      setAdminNoteInput('');
    } catch (err: any) {
      alert(err.message || 'ดำเนินการไม่สำเร็จ');
    }
  };

  // Filtering
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      !searchTerm ||
      b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.purpose.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRoom = selectedRoomId === 'ALL' || b.roomId === selectedRoomId;
    const matchesStatus = selectedStatus === 'ALL' || b.status === selectedStatus;
    const matchesDate = !selectedDate || b.date === selectedDate;

    return matchesSearch && matchesRoom && matchesStatus && matchesDate;
  });

  // Status color badge
  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><CheckCircle2 className="w-3 h-3" /> อนุมัติแล้ว</span>;
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30"><Clock className="w-3 h-3" /> รออนุมัติ</span>;
      case 'IN_USE':
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"><PlayCircle className="w-3 h-3" /> กำลังใช้งาน</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300"><Check className="w-3 h-3" /> ใช้งานเสร็จสิ้น</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30"><XCircle className="w-3 h-3" /> ไม่อนุมัติ</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">ยกเลิกแล้ว</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-400" />
            <span>บริการบันทึกการใช้บริการห้องซ้อมดนตรี</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isAdmin ? 'จัดการคำขอจอง ตรวจสอบตาราง และอนุมัติการเข้าใช้ห้อง' : 'จองห้องซ้อม ตรวจสอบห้องว่าง และติดตามสถานะคำขอของคุณ'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Subtab Toggle */}
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex text-xs">
            <button
              onClick={() => setActiveTabSub('LIST')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTabSub === 'LIST'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              รายการจอง
            </button>
            <button
              onClick={() => setActiveTabSub('SCHEDULE')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTabSub === 'SCHEDULE'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ตารางเวลาห้อง
            </button>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>จองห้องซ้อมดนตรี</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อวง, รหัสจอง, สมาชิก, วัตถุประสงค์..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Room Filter */}
          <div>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">เลือกห้องซ้อมทั้งหมด</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} - {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">สถานะทั้งหมด</option>
              <option value="PENDING">รออนุมัติ (Pending)</option>
              <option value="APPROVED">อนุมัติแล้ว (Approved)</option>
              <option value="IN_USE">กำลังใช้งาน (In Use)</option>
              <option value="COMPLETED">ใช้งานเสร็จสิ้น (Completed)</option>
              <option value="REJECTED">ไม่อนุมัติ (Rejected)</option>
              <option value="CANCELLED">ยกเลิกแล้ว (Cancelled)</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg text-xs"
                title="ล้างตัวกรองวันที่"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
          <span>พบ {filteredBookings.length} รายการ จากทั้งหมด {bookings.length} รายการ</span>
          {(searchTerm || selectedRoomId !== 'ALL' || selectedStatus !== 'ALL' || selectedDate) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedRoomId('ALL');
                setSelectedStatus('ALL');
                setSelectedDate('');
              }}
              className="text-indigo-400 hover:text-indigo-300 text-xs"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Schedule or List View */}
      {activeTabSub === 'SCHEDULE' ? (
        /* Visual Schedule Slots */
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>ตารางเวลาการใช้ห้องประจำวัน</span>
            </h3>
            <span className="text-xs text-slate-400">
              วันที่: {selectedDate || new Date().toISOString().split('T')[0]}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {rooms.map((room) => {
              const targetDate = selectedDate || new Date().toISOString().split('T')[0];
              const roomBookings = roomAvailability.filter((booking) => booking.roomId === room.id);

              return (
                <div key={room.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400">
                        {room.code}
                      </span>
                      <h4 className="text-xs font-bold text-white mt-1">{room.name}</h4>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      room.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {room.status === 'AVAILABLE' ? 'เปิดบริการ' : 'ปิดปรับปรุง'}
                    </span>
                  </div>

                  <div className="space-y-2 min-h-[140px]">
                    {isAvailabilityLoading ? (
                      <div className="h-full flex items-center justify-center text-slate-500 text-xs py-8">กำลังตรวจสอบเวลาว่าง...</div>
                    ) : roomBookings.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-8">
                        <span>ว่างตลอดวัน</span>
                        <button
                          onClick={() => {
                            setValue('roomId', room.id);
                            setValue('date', targetDate);
                            setIsModalOpen(true);
                          }}
                          className="mt-2 text-indigo-400 hover:text-indigo-300 text-[11px]"
                        >
                          + จองเวลานี้
                        </button>
                      </div>
                    ) : (
                      roomBookings.map((b) => (
                        <div
                          key={`${b.startTime}-${b.endTime}`}
                          className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                            b.status === 'APPROVED'
                              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                              : b.status === 'IN_USE'
                              ? 'bg-indigo-950/40 border-indigo-800/60 text-indigo-200'
                              : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span>{b.startTime} - {b.endTime} น.</span>
                            {getStatusBadge(b.status)}
                          </div>
                          {isAdmin && <>
                            {(() => {
                              const booking = bookings.find((item) => item.roomId === room.id && item.date === targetDate && item.startTime === b.startTime && item.endTime === b.endTime);
                              return booking ? <>
                                <div className="font-semibold truncate">{booking.bandName}</div>
                                <div className="text-[10px] text-slate-400">ผู้จอง: {booking.userName}</div>
                              </> : null;
                            })()}
                          </>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List / Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 text-sm font-medium">ไม่พบรายการจองห้องซ้อมที่ตรงตามเงื่อนไข</p>
              <p className="text-slate-500 text-xs mt-1">ลองเปลี่ยนคำค้นหา หรือกดปุ่ม "จองห้องซ้อมดนตรี" เพื่อสร้างรายการใหม่</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">รหัสจอง</th>
                    <th className="py-3.5 px-4">ห้องซ้อม</th>
                    <th className="py-3.5 px-4">วันที่ & เวลา</th>
                    <th className="py-3.5 px-4">วงดนตรี / ผู้จอง</th>
                    <th className="py-3.5 px-4">วัตถุประสงค์</th>
                    <th className="py-3.5 px-4">สถานะ</th>
                    <th className="py-3.5 px-4 text-right">การจัดการ (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {filteredBookings.map((b) => {
                    const isOwnBooking = b.userId === currentUser?.id;
                    const canEdit = isAdmin || (isOwnBooking && b.status === 'PENDING');
                    const canDelete = isAdmin || (isOwnBooking && (b.status === 'PENDING' || b.status === 'CANCELLED'));

                    return (
                      <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-indigo-400 font-semibold">{b.bookingCode}</span>
                          <div className="text-[10px] text-slate-500">
                            {new Date(b.createdAt).toLocaleDateString('th-TH')}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{b.roomName}</div>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Users className="w-3 h-3" /> {b.memberCount} คน
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-medium text-slate-200">{b.date}</div>
                          <div className="text-[11px] text-indigo-300 font-semibold">
                            {b.startTime} - {b.endTime} น.
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-amber-400">{b.bandName}</div>
                          <div className="text-slate-400">{b.userName}</div>
                          <div className="text-[10px] text-slate-500">โทร: {b.phone}</div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="line-clamp-2 text-slate-300">{b.purpose}</p>
                          {b.adminNote && (
                            <div className="text-[10px] text-amber-300 mt-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              หมายเหตุ: {b.adminNote}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getStatusBadge(b.status)}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Admin Quick Action Buttons */}
                            {isAdmin && b.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(b.id, 'APPROVED')}
                                  className="p-1.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg transition-all"
                                  title="อนุมัติการจอง"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setAdminNoteModal({ id: b.id, action: 'REJECT' })}
                                  className="p-1.5 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg transition-all"
                                  title="ไม่อนุมัติการจอง"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {isAdmin && b.status === 'APPROVED' && (
                              <button
                                onClick={() => handleStatusChange(b.id, 'IN_USE')}
                                className="px-2 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-[10px] font-semibold transition-all"
                                title="เริ่มการซ้อม"
                              >
                                เริ่มซ้อม
                              </button>
                            )}

                            {isAdmin && b.status === 'IN_USE' && (
                              <button
                                onClick={() => handleStatusChange(b.id, 'COMPLETED')}
                                className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[10px] font-semibold transition-all"
                                title="ซ้อมเสร็จสิ้น"
                              >
                                ซ้อมเสร็จแล้ว
                              </button>
                            )}

                            {/* Edit Button */}
                            {canEdit && (
                              <button
                                onClick={() => handleOpenEditModal(b)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all"
                                title="แก้ไขรายการ"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete / Cancel Button */}
                            {canDelete && (
                              <button
                                onClick={() => {
                                  if (confirm(`คุณต้องการยกเลิกหรือลบรายการจอง ${b.bookingCode} หรือไม่?`)) {
                                    onDeleteBooking(b.id);
                                  }
                                }}
                                className="p-1.5 bg-slate-800 hover:bg-rose-600/80 text-slate-400 hover:text-white rounded-lg transition-all"
                                title="ลบ/ยกเลิกรายการ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- REACT HOOK FORM BOOKING MODAL (CRUD: CREATE & EDIT) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <span>{editingBooking ? 'แก้ไขการจองห้องซ้อมดนตรี' : 'จองห้องซ้อมดนตรี (Booking)'}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  กรอกข้อมูลพร้อมการตรวจสอบเงื่อนไขความถูกต้อง (Validation)
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
              
              {/* Room Select */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  เลือกห้องซ้อมดนตรี <span className="text-rose-400">*</span>
                </label>
                <select
                  {...register('roomId', { required: 'กรุณาเลือกห้องซ้อม' })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id} disabled={room.status !== 'AVAILABLE'}>
                      {room.name} ({room.code}) - ความจุ {room.capacity} คน {room.status !== 'AVAILABLE' ? '(ปิดปรับปรุง)' : ''}
                    </option>
                  ))}
                </select>
                {selectedRoomObj && (
                  <p className="text-[11px] text-indigo-300/80 mt-1">
                    ℹ️ อุปกรณ์ประจำห้อง: {selectedRoomObj.equipmentIncluded.join(', ')}
                  </p>
                )}
                {errors.roomId && <p className="text-rose-400 text-[11px] mt-1">{errors.roomId.message}</p>}
              </div>

              {/* Date */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  วันที่ต้องการเข้าซ้อม <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  {...register('date', { 
                    required: 'กรุณาระบุวันที่เข้าซ้อม',
                  })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                {errors.date && <p className="text-rose-400 text-[11px] mt-1">{errors.date.message}</p>}
              </div>

              {/* Time Slots */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    เวลาเริ่มต้น <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="time"
                    {...register('startTime', { required: 'ระบุเวลาเริ่ม' })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  {errors.startTime && <p className="text-rose-400 text-[11px] mt-1">{errors.startTime.message}</p>}
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    เวลาสิ้นสุด <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="time"
                    {...register('endTime', { 
                      required: 'ระบุเวลาสิ้นสุด',
                      validate: (val, formValues) => 
                        val > formValues.startTime || 'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น'
                    })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  {errors.endTime && <p className="text-rose-400 text-[11px] mt-1">{errors.endTime.message}</p>}
                </div>
              </div>

              {/* Band Name and Members */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    ชื่อวง / กลุ่มดนตรี <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น The Midnight Echoes"
                    {...register('bandName', { 
                      required: 'กรุณากรอกชื่อวง',
                      minLength: { value: 2, message: 'อย่างน้อย 2 ตัวอักษร' }
                    })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  {errors.bandName && <p className="text-rose-400 text-[11px] mt-1">{errors.bandName.message}</p>}
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    จำนวนสมาชิก (คน) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={selectedRoomObj?.capacity || 15}
                    {...register('memberCount', { 
                      required: 'ระบุจำนวนคน',
                      min: { value: 1, message: 'อย่างน้อย 1 คน' },
                      max: { 
                        value: selectedRoomObj?.capacity || 15, 
                        message: `ความจุสูงสุดห้องนี้คือ ${selectedRoomObj?.capacity || 15} คน` 
                      }
                    })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  {errors.memberCount && <p className="text-rose-400 text-[11px] mt-1">{errors.memberCount.message}</p>}
                </div>
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  เบอร์โทรศัพท์ติดต่อ <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="เช่น 081-234-5678"
                  {...register('phone', { 
                    required: 'กรุณาระบุเบอร์โทรศัพท์ติดต่อ',
                    pattern: {
                      value: /^(0[689]\d{8}|0[689]-\d{3}-\d{4}|0[689]\d-\d{3}-\d{4}|0\d{8,9})$/,
                      message: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (เช่น 089-876-5432)'
                    }
                  })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                {errors.phone && <p className="text-rose-400 text-[11px] mt-1">{errors.phone.message}</p>}
              </div>

              {/* Purpose */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  วัตถุประสงค์ในการเข้าใช้บริการ <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="ระบุรายละเอียด เช่น เตรียมตัวสำหรับงาน Open House, อัดเดโม..."
                  {...register('purpose', { 
                    required: 'กรุณาระบุวัตถุประสงค์',
                    minLength: { value: 5, message: 'อย่างน้อย 5 ตัวอักษร' }
                  })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                {errors.purpose && <p className="text-rose-400 text-[11px] mt-1">{errors.purpose.message}</p>}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'กำลังบันทึก...' : editingBooking ? 'บันทึกการแก้ไข' : 'ยืนยันการจอง'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* --- ADMIN REJECT / NOTE MODAL --- */}
      {adminNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-2">
              {adminNoteModal.action === 'REJECT' ? 'ระบุเหตุผลที่ไม่อนุมัติ' : 'บันทึกเพิ่มเติมจากผู้ดูแล'}
            </h3>
            <textarea
              rows={3}
              value={adminNoteInput}
              onChange={(e) => setAdminNoteInput(e.target.value)}
              placeholder="เช่น ช่วงเวลาซ้อนทับกับกิจกรรมชมรมส่วนกลาง, ห้องอยู่ระหว่างบำรุงรักษา..."
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setAdminNoteModal(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  if (adminNoteModal.action === 'REJECT') {
                    handleStatusChange(adminNoteModal.id, 'REJECTED', adminNoteInput || 'ไม่อนุมัติ');
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                ยืนยันการปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
