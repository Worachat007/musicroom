import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import type { Booking, BookingStatus, Room, RoomAvailability } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../lib/api.ts';

interface BookingsViewProps {
  bookings: Booking[];
  rooms: Room[];
  onRefresh: () => Promise<void> | void;
  onCreateBooking: (data: Partial<Booking>) => Promise<void>;
  onUpdateBooking: (id: string, data: Partial<Booking>) => Promise<void>;
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

const localDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const todayKey = () => localDateKey(new Date());
const statusText: Record<BookingStatus, string> = {
  PENDING: 'รอตรวจสอบ', APPROVED: 'ยืนยันแล้ว', REJECTED: 'ไม่อนุมัติ', IN_USE: 'กำลังใช้งาน', COMPLETED: 'เสร็จสิ้น', CANCELLED: 'ยกเลิก',
};

export const BookingsView: React.FC<BookingsViewProps> = ({
  bookings, rooms, onRefresh, onCreateBooking, onUpdateBooking, onDeleteBooking, isModalOpen, setIsModalOpen,
}) => {
  const { currentUser, isAdmin } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [selectedRoomId, setSelectedRoomId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [schedule, setSchedule] = useState<RoomAvailability[]>([]);
  const [scheduleError, setScheduleError] = useState('');
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [formError, setFormError] = useState('');
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);

  const firstCalendarDay = useMemo(() => {
    const first = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    return new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay());
  }, [currentMonth]);
  const calendarDays = useMemo(() => Array.from({ length: 42 }, (_, index) => new Date(firstCalendarDay.getFullYear(), firstCalendarDay.getMonth(), firstCalendarDay.getDate() + index)), [firstCalendarDay]);
  const rangeStart = localDateKey(calendarDays[0]);
  const rangeEnd = localDateKey(calendarDays[41]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<BookingFormData>({
    defaultValues: { roomId: '', date: todayKey(), startTime: '16:00', endTime: '18:00', bandName: currentUser?.bandName ?? '', memberCount: 1, phone: currentUser?.phone ?? '', purpose: '' },
  });
  const selectedFormRoom = rooms.find((room) => room.id === watch('roomId'));

  useEffect(() => {
    let active = true;
    setIsScheduleLoading(true);
    api.getAvailability(rangeStart, rangeEnd, selectedRoomId)
      .then((response) => { if (active) { setSchedule(response.data); setScheduleError(''); } })
      .catch((error: unknown) => { if (active) setScheduleError(error instanceof Error ? error.message : 'โหลดปฏิทินไม่สำเร็จ'); })
      .finally(() => { if (active) setIsScheduleLoading(false); });
    return () => { active = false; };
  }, [rangeStart, rangeEnd, selectedRoomId]);

  const visibleBookings = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase();
    return bookings.filter((booking) => {
      if (booking.date !== selectedDate) return false;
      if (selectedRoomId !== 'ALL' && booking.roomId !== selectedRoomId) return false;
      if (selectedStatus !== 'ALL' && booking.status !== selectedStatus) return false;
      if (!query) return true;
      return [booking.bookingCode, booking.bandName, booking.userName, booking.roomName, booking.purpose, booking.studentId]
        .some((value) => value.toLocaleLowerCase().includes(query));
    });
  }, [bookings, searchTerm, selectedDate, selectedRoomId, selectedStatus]);

  const openCreate = (date = selectedDate, roomId = '') => {
    setEditingBooking(null);
    setFormError('');
    reset({ roomId: roomId || rooms.find((room) => room.status === 'AVAILABLE')?.id || '', date, startTime: '16:00', endTime: '18:00', bandName: currentUser?.bandName ?? '', memberCount: 1, phone: currentUser?.phone ?? '', purpose: '' });
    setIsModalOpen(true);
  };

  const openEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setFormError('');
    reset({ roomId: booking.roomId, date: booking.date, startTime: booking.startTime, endTime: booking.endTime, bandName: booking.bandName, memberCount: booking.memberCount, phone: booking.phone, purpose: booking.purpose });
    setIsModalOpen(true);
  };

  const submitBooking = async (data: BookingFormData) => {
    setFormError('');
    try {
      if (editingBooking) await onUpdateBooking(editingBooking.id, data);
      else await onCreateBooking(data);
      setSelectedDate(data.date);
      setCurrentMonth(new Date(Number(data.date.slice(0, 4)), Number(data.date.slice(5, 7)) - 1, 1));
      setIsModalOpen(false);
      setEditingBooking(null);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'บันทึกข้อมูลไม่สำเร็จ');
    }
  };

  const changeStatus = async (booking: Booking, status: BookingStatus) => {
    try { await onUpdateBooking(booking.id, { status, adminNote: status === 'REJECTED' ? 'ไม่อนุมัติ' : undefined }); }
    catch (error) { setScheduleError(error instanceof Error ? error.message : 'อัปเดตสถานะไม่สำเร็จ'); }
  };

  const monthLabel = currentMonth.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
  const calendarSlotsByDate = useMemo(() => {
    const grouped = new Map<string, RoomAvailability[]>();
    for (const slot of schedule) {
      if (!slot.date) continue;
      grouped.set(slot.date, [...(grouped.get(slot.date) ?? []), slot]);
    }
    return grouped;
  }, [schedule]);
  const selectedSlots = schedule.filter((slot) => slot.date === selectedDate);

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] font-semibold text-[#b85f43]">ห้องซ้อม / การจอง</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-[#173b38]">ปฏิทินห้องซ้อม</h1>
          <p className="mt-2 text-sm text-[#6c7874]">เลือกวันที่เพื่อดูช่วงเวลาที่จองและส่งคำขอใช้ห้อง</p>
        </div>
        <button type="button" onClick={() => openCreate()} disabled={rooms.every((room) => room.status !== 'AVAILABLE')} className="h-10 px-4 inline-flex items-center justify-center gap-2 bg-[#bb6043] hover:bg-[#a94f35] disabled:opacity-50 text-white text-sm font-semibold rounded-md">
          <Plus size={17} /> จองห้องซ้อม
        </button>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.8fr)] gap-5 items-start">
        <section className="bg-white border border-[#dce2db] rounded-md overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-[#e4e8e2] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold min-w-[145px]">{monthLabel}</h2>
              <button type="button" onClick={() => setCurrentMonth(new Date())} className="hidden sm:block px-2.5 py-1 border border-[#d6ddd5] rounded text-xs text-[#53635e] hover:bg-[#f3f6f1]">วันนี้</button>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} aria-label="เดือนก่อนหน้า" className="w-8 h-8 grid place-items-center rounded border border-[#d6ddd5] hover:bg-[#f3f6f1]"><ChevronLeft size={17} /></button>
              <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} aria-label="เดือนถัดไป" className="w-8 h-8 grid place-items-center rounded border border-[#d6ddd5] hover:bg-[#f3f6f1]"><ChevronRight size={17} /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-[#e4e8e2] bg-[#f7f8f4]">
            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, index) => <div key={day} className="py-2.5 text-center text-[11px] font-medium text-[#7b8580]">{['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'][index]}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day) => {
              const key = localDateKey(day);
              const slots = calendarSlotsByDate.get(key) ?? [];
              const selected = key === selectedDate;
              const inMonth = day.getMonth() === currentMonth.getMonth();
              const isToday = key === todayKey();
              return (
                <button key={key} type="button" onClick={() => setSelectedDate(key)} aria-pressed={selected} aria-label={`${day.toLocaleDateString('th-TH')} มี ${slots.length} ช่วงเวลาที่ถูกจอง`} className={`min-h-[86px] sm:min-h-[112px] p-1.5 sm:p-2 text-left border-r border-b border-[#e8ebe6] transition-colors ${selected ? 'bg-[#eaf2eb] ring-1 ring-inset ring-[#5d8b76]' : 'hover:bg-[#f7f9f5]'} ${inMonth ? 'text-[#263a36]' : 'text-[#aeb7b1]'}`}>
                  <span className={`w-7 h-7 inline-flex items-center justify-center text-xs rounded-full ${isToday ? 'bg-[#123c38] text-white' : ''} ${selected && !isToday ? 'font-semibold text-[#24604e]' : ''}`}>{day.getDate()}</span>
                  <span className="mt-1 flex flex-col gap-1">
                    {slots.slice(0, 2).map((slot, index) => {
                      const roomLabel = rooms.find((room) => room.id === slot.roomId)?.code ?? 'ห้อง';
                      return <span key={`${slot.roomId}-${slot.startTime}-${index}`} className={`truncate px-1 py-0.5 rounded text-[9px] sm:text-[10px] leading-4 ${slot.status === 'APPROVED' ? 'bg-[#d8eee2] text-[#2f684d]' : slot.status === 'IN_USE' ? 'bg-[#dce8ee] text-[#3d6578]' : 'bg-[#f7e4d8] text-[#91583e]'}`}><span className="hidden sm:inline">{roomLabel} </span>{slot.startTime}</span>;
                    })}
                    {slots.length > 2 && <span className="text-[9px] text-[#78837e]">+{slots.length - 2} ช่วง</span>}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="px-4 py-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-[#77827e]">
            <span className="flex items-center gap-1.5"><i className="w-2 h-2 rounded-full bg-[#d8eee2] border border-[#a8cdb4]" />ยืนยันแล้ว</span>
            <span className="flex items-center gap-1.5"><i className="w-2 h-2 rounded-full bg-[#f7e4d8] border border-[#e6c3ab]" />รอตรวจสอบ</span>
            {isScheduleLoading && <span className="ml-auto">กำลังอัปเดต...</span>}
          </div>
        </section>

        <aside className="bg-white border border-[#dce2db] rounded-md">
          <div className="p-4 sm:p-5 border-b border-[#e4e8e2]">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-[11px] uppercase tracking-wide text-[#89938e]">ตารางวันที่เลือก</p><h2 className="mt-1 text-lg font-semibold">{new Date(`${selectedDate}T12:00:00`).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}</h2></div>
              <button type="button" onClick={() => openCreate(selectedDate)} disabled={selectedDate < todayKey() || rooms.every((room) => room.status !== 'AVAILABLE')} aria-label="จองวันที่เลือก" title="จองวันที่เลือก" className="w-9 h-9 grid place-items-center bg-[#123c38] hover:bg-[#20534c] disabled:opacity-40 text-white rounded-md"><Plus size={18} /></button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <label className="text-[11px] text-[#76817c]">ห้อง
                <select value={selectedRoomId} onChange={(event) => setSelectedRoomId(event.target.value)} className="mt-1 w-full h-9 px-2 border border-[#d9e0d8] bg-white rounded text-xs text-[#2c3e39]"><option value="ALL">ทุกห้อง</option>{rooms.map((room) => <option key={room.id} value={room.id}>{room.code}</option>)}</select>
              </label>
              <label className="text-[11px] text-[#76817c]">สถานะรายการ
                <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} className="mt-1 w-full h-9 px-2 border border-[#d9e0d8] bg-white rounded text-xs text-[#2c3e39"><option value="ALL">ทุกสถานะ</option><option value="PENDING">รอตรวจสอบ</option><option value="APPROVED">ยืนยันแล้ว</option><option value="IN_USE">กำลังใช้งาน</option><option value="COMPLETED">เสร็จสิ้น</option><option value="REJECTED">ไม่อนุมัติ</option><option value="CANCELLED">ยกเลิก</option></select>
              </label>
            </div>
            <div className="relative mt-3"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a9690]" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="ค้นหารหัสจอง วง หรือวัตถุประสงค์" className="w-full h-9 pl-9 pr-3 border border-[#d9e0d8] rounded text-xs outline-none focus:border-[#6e9b83]" /></div>
          </div>

          <div className="p-4 sm:p-5">
            <p className="mb-3 text-xs text-[#7c8782]">ช่วงเวลาที่มีการจอง: {selectedSlots.length} ช่วง</p>
            {scheduleError && <p role="alert" className="mb-3 text-xs text-[#a34f3b]">{scheduleError}</p>}
            {selectedSlots.length === 0 ? (
              <div className="py-6 text-center border border-dashed border-[#d8dfd7] rounded-md">
                <Clock3 size={20} className="mx-auto text-[#93a09a]" />
                <p className="mt-2 text-xs text-[#73807a]">ยังไม่มีช่วงเวลาที่ถูกจอง</p>
                {selectedDate >= todayKey() && <button type="button" onClick={() => openCreate(selectedDate)} className="mt-3 text-xs font-semibold text-[#a6543c] hover:underline">เลือกเวลาจองห้องนี้</button>}
              </div>
            ) : (
              <div className="space-y-2">
                {selectedSlots.map((slot, index) => {
                  const room = rooms.find((item) => item.id === slot.roomId);
                  return <div key={`${slot.roomId}-${slot.startTime}-${index}`} className="flex items-center gap-3 px-3 py-3 bg-[#f6f8f4] border border-[#e3e8e1] rounded-md">
                    <div className="w-1 self-stretch bg-[#6e9b83] rounded-full" />
                    <div className="min-w-0 flex-1"><div className="text-sm font-semibold text-[#25453d]">{slot.startTime} – {slot.endTime}</div><div className="mt-0.5 truncate text-[11px] text-[#75817b]">{room?.code} · {room?.name}</div></div>
                    <span className="text-[10px] text-[#78837e]">{statusText[slot.status]}</span>
                  </div>;
                })}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-[#e4e8e2]">
              <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold">รายการของวันที่เลือก</h3><span className="text-[11px] text-[#89938e]">{visibleBookings.length} รายการ</span></div>
              {visibleBookings.length === 0 ? <p className="py-4 text-center text-xs text-[#8a9490]">ไม่มีรายการจองของคุณที่ตรงกับตัวกรอง</p> : (
                <div className="space-y-3">
                  {visibleBookings.map((booking) => {
                    const ownsBooking = booking.userId === currentUser?.id;
                    const canEdit = isAdmin || (ownsBooking && booking.status === 'PENDING');
                    const canDelete = isAdmin || (ownsBooking && booking.status === 'PENDING');
                    return <article key={booking.id} className="border border-[#e0e6df] rounded-md p-3">
                      <div className="flex items-start justify-between gap-3"><div><div className="text-xs font-semibold text-[#274a41]">{booking.startTime} – {booking.endTime} · {booking.roomName}</div><div className="mt-1 text-[11px] text-[#707c77]">{booking.bookingCode} · {booking.bandName}</div></div><span className={`shrink-0 px-2 py-1 rounded text-[10px] ${booking.status === 'APPROVED' ? 'bg-[#e0f0e5] text-[#3c7653]' : booking.status === 'PENDING' ? 'bg-[#fbebdd] text-[#98613d]' : 'bg-[#edf0ec] text-[#6d7873]'}`}>{statusText[booking.status]}</span></div>
                      <div className="mt-2 text-[11px] text-[#7b8580] line-clamp-2">{booking.purpose}</div>
                      {isAdmin && <div className="mt-2 text-[10px] text-[#7b8580]">{booking.userName} · {booking.studentId}</div>}
                      <div className="mt-3 flex items-center justify-end gap-1.5">
                        {isAdmin && booking.status === 'PENDING' && <><button type="button" onClick={() => void changeStatus(booking, 'APPROVED')} title="ยืนยันการจอง" className="h-7 px-2 inline-flex items-center gap-1 bg-[#e1f0e6] text-[#3b7450] rounded text-[10px]"><Check size={13} /> ยืนยัน</button><button type="button" onClick={() => void changeStatus(booking, 'REJECTED')} className="h-7 px-2 text-[#a24c3d] bg-[#f8e7e1] rounded text-[10px]">ไม่อนุมัติ</button></>}
                        {canEdit && <button type="button" onClick={() => openEdit(booking)} title="แก้ไข" className="w-7 h-7 grid place-items-center text-[#61706a] hover:bg-[#edf1eb] rounded"><Pencil size={14} /></button>}
                        {canDelete && <button type="button" onClick={() => { if (window.confirm(`ยกเลิกการจอง ${booking.bookingCode}?`)) void onDeleteBooking(booking.id); }} title="ยกเลิกการจอง" className="w-7 h-7 grid place-items-center text-[#9e5947] hover:bg-[#faece7] rounded"><Trash2 size={14} /></button>}
                      </div>
                    </article>;
                  })}
                </div>
              )}
              <button type="button" onClick={() => void onRefresh()} className="mt-4 inline-flex items-center gap-1 text-[11px] text-[#73817b] hover:text-[#365e4d]"><ArrowRight size={13} /> รีเฟรชรายการ</button>
            </div>
          </div>
        </aside>
      </div>

      {isModalOpen && <div className="fixed inset-0 z-50 bg-[#102522]/55 flex items-center justify-center p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsModalOpen(false); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="booking-dialog-title" className="w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[#fbfcf8] border border-[#d7dfd7] rounded-md shadow-2xl">
          <div className="sticky top-0 z-10 bg-[#fbfcf8] px-5 py-4 border-b border-[#e1e6df] flex items-center justify-between"><div><h2 id="booking-dialog-title" className="font-semibold">{editingBooking ? 'แก้ไขการจอง' : 'จองห้องซ้อม'}</h2><p className="mt-1 text-xs text-[#79847f]">กรอกวันที่และช่วงเวลาที่ต้องการใช้ห้อง</p></div><button type="button" onClick={() => setIsModalOpen(false)} aria-label="ปิด" className="w-8 h-8 grid place-items-center text-[#697570] hover:bg-[#edf1eb] rounded"><X size={18} /></button></div>
          <form onSubmit={handleSubmit(submitBooking)} className="p-5 space-y-4">
            <label className="block text-xs font-medium text-[#455550]">ห้องซ้อม
              <select {...register('roomId', { required: 'กรุณาเลือกห้องซ้อม' })} className="mt-1.5 w-full h-10 px-3 border border-[#d2dbd2] rounded bg-white text-sm"><option value="">เลือกห้อง</option>{rooms.map((room) => <option key={room.id} value={room.id} disabled={room.status !== 'AVAILABLE'}>{room.code} · {room.name}{room.status !== 'AVAILABLE' ? ' (ปิดบริการ)' : ''}</option>)}</select>
              {errors.roomId && <span className="block mt-1 text-[11px] text-[#b54d3a]">{errors.roomId.message}</span>}
            </label>
            {selectedFormRoom && <p className="-mt-2 text-[11px] text-[#75817b]">ความจุ {selectedFormRoom.capacity} คน{selectedFormRoom.equipmentIncluded.length ? ` · ${selectedFormRoom.equipmentIncluded.join(', ')}` : ''}</p>}
            <label className="block text-xs font-medium text-[#455550]">วันที่
              <input type="date" min={todayKey()} {...register('date', { required: 'กรุณาเลือกวันที่' })} className="mt-1.5 w-full h-10 px-3 border border-[#d2dbd2] rounded bg-white text-sm" />
              {errors.date && <span className="block mt-1 text-[11px] text-[#b54d3a]">{errors.date.message}</span>}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-medium text-[#455550]">เวลาเริ่ม<input type="time" {...register('startTime', { required: 'ระบุเวลาเริ่ม' })} className="mt-1.5 w-full h-10 px-3 border border-[#d2dbd2] rounded bg-white text-sm" />{errors.startTime && <span className="block mt-1 text-[11px] text-[#b54d3a]">{errors.startTime.message}</span>}</label>
              <label className="block text-xs font-medium text-[#455550]">เวลาสิ้นสุด<input type="time" {...register('endTime', { required: 'ระบุเวลาสิ้นสุด', validate: (value, values) => value > values.startTime || 'เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่ม' })} className="mt-1.5 w-full h-10 px-3 border border-[#d2dbd2] rounded bg-white text-sm" />{errors.endTime && <span className="block mt-1 text-[11px] text-[#b54d3a]">{errors.endTime.message}</span>}</label>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block text-xs font-medium text-[#455550]">ชื่อวง / กลุ่ม<input {...register('bandName', { required: 'กรุณาระบุชื่อวง', minLength: { value: 2, message: 'อย่างน้อย 2 ตัวอักษร' }, maxLength: 80 })} className="mt-1.5 w-full h-10 px-3 border border-[#d2dbd2] rounded bg-white text-sm" placeholder="ชื่อวงหรือกลุ่ม" />{errors.bandName && <span className="block mt-1 text-[11px] text-[#b54d3a]">{errors.bandName.message}</span>}</label>
              <label className="block text-xs font-medium text-[#455550]">จำนวนผู้ใช้<input type="number" min={1} max={selectedFormRoom?.capacity ?? 50} {...register('memberCount', { valueAsNumber: true, required: true, min: { value: 1, message: 'อย่างน้อย 1 คน' }, max: { value: selectedFormRoom?.capacity ?? 50, message: `ห้องนี้รับได้ไม่เกิน ${selectedFormRoom?.capacity ?? 50} คน` } })} className="mt-1.5 w-full h-10 px-3 border border-[#d2dbd2] rounded bg-white text-sm" />{errors.memberCount && <span className="block mt-1 text-[11px] text-[#b54d3a]">{errors.memberCount.message}</span>}</label>
            </div>
            <label className="block text-xs font-medium text-[#455550]">เบอร์โทรศัพท์<input type="tel" {...register('phone', { required: 'กรุณาระบุเบอร์โทรศัพท์', pattern: { value: /^[0-9+()\- ]{8,20}$/, message: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง' } })} className="mt-1.5 w-full h-10 px-3 border border-[#d2dbd2] rounded bg-white text-sm" placeholder="08x-xxx-xxxx" />{errors.phone && <span className="block mt-1 text-[11px] text-[#b54d3a]">{errors.phone.message}</span>}</label>
            <label className="block text-xs font-medium text-[#455550]">วัตถุประสงค์<textarea rows={3} {...register('purpose', { required: 'กรุณาระบุวัตถุประสงค์', minLength: { value: 3, message: 'อย่างน้อย 3 ตัวอักษร' }, maxLength: 500 })} className="mt-1.5 w-full px-3 py-2 border border-[#d2dbd2] rounded bg-white text-sm resize-y" placeholder="เช่น ซ้อมสำหรับงานแสดง" />{errors.purpose && <span className="block mt-1 text-[11px] text-[#b54d3a]">{errors.purpose.message}</span>}</label>
            {formError && <p role="alert" className="px-3 py-2 bg-[#f9e8e1] text-[#a64c39] rounded text-xs">{formError}</p>}
            <div className="pt-2 flex justify-end gap-2 border-t border-[#e3e8e1]"><button type="button" onClick={() => setIsModalOpen(false)} className="h-10 px-4 border border-[#d1dad1] text-sm rounded text-[#5f6d67]">ยกเลิก</button><button type="submit" disabled={isSubmitting} className="h-10 px-4 bg-[#123c38] hover:bg-[#20534c] disabled:opacity-50 text-white text-sm font-semibold rounded inline-flex items-center gap-2">{isSubmitting ? 'กำลังบันทึก...' : editingBooking ? 'บันทึกการแก้ไข' : 'ส่งคำขอจอง'}<ArrowLeft size={15} className="rotate-180" /></button></div>
          </form>
        </section>
      </div>}
    </section>
  );
};
