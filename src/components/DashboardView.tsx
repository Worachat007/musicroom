import React from 'react';
import { 
  Calendar, 
  Package, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  ChevronRight, 
  Volume2, 
  ArrowUpRight,
  Sparkles,
  Guitar
} from 'lucide-react';
import { SystemStats, Room, ActivityLog } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface DashboardViewProps {
  stats: SystemStats | null;
  rooms: Room[];
  logs: ActivityLog[];
  onNavigate: (tab: string) => void;
  onOpenBookingModal: () => void;
  onOpenBorrowModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  rooms,
  logs,
  onNavigate,
  onOpenBookingModal,
  onOpenBorrowModal,
}) => {
  const { currentUser, isAdmin } = useAuth();

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-xl">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              ยินดีต้อนรับสู่ระบบห้องซ้อมดนตรี & ยืมอุปกรณ์
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              สวัสดี, {currentUser?.name}
            </h1>
            <p className="mt-1 text-slate-300 text-sm max-w-2xl leading-relaxed">
              สิทธิ์การใช้งาน: <span className="font-semibold text-amber-400">{isAdmin ? 'ผู้ดูแลห้องซ้อม (Admin)' : 'สมาชิกชมรมดนตรี (Club Member)'}</span> 
              {currentUser?.bandName && ` • วงประจำ: ${currentUser.bandName}`}
              <br />
              สามารถบันทึกการจองห้องซ้อมดนตรี ขออนุมัติการยืมอุปกรณ์ และติดตามสถานะแบบเรียลไทม์
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenBookingModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>จองห้องซ้อม</span>
            </button>
            <button
              onClick={onOpenBorrowModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-sm border border-slate-700 transition-all active:scale-95"
            >
              <Guitar className="w-4 h-4" />
              <span>ยื่นขอยืมอุปกรณ์</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className={`grid grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-2'} gap-4`}>
        {/* Rooms Active */}
        <div 
          onClick={() => onNavigate('bookings')}
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-4 sm:p-5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">ห้องซ้อมใช้งานวันนี้</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <Volume2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white">
              {stats?.activeRoomsToday ?? 0}
            </span>
            <span className="text-xs text-slate-400">/ {stats?.totalRooms ?? 0} ห้อง</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-indigo-400 group-hover:translate-x-1 transition-transform">
            <span>ดูตารางซ้อมวันนี้</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </div>
        </div>

        {/* Equipment Stock */}
        <div 
          onClick={() => onNavigate('borrowings')}
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 sm:p-5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">อุปกรณ์ดนตรีในคลัง</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white">
              {stats?.availableEquipments ?? 0}
            </span>
            <span className="text-xs text-slate-400">/ {stats?.totalEquipments ?? 0} ชิ้นพร้อมยืม</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>ยืมอยู่ {stats?.borrowedEquipments ?? 0} ชิ้น</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </div>
        </div>

        {isAdmin && <>
        {/* Pending Requests */}
        <div 
          onClick={() => onNavigate('bookings')}
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 sm:p-5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">คำขอรออนุมัติ</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-400">
              {(stats?.pendingBookings ?? 0) + (stats?.pendingBorrowings ?? 0)}
            </span>
            <span className="text-xs text-slate-400">รายการ</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-amber-400/90 group-hover:translate-x-1 transition-transform">
            <span>ห้อง {stats?.pendingBookings ?? 0} | อุปกรณ์ {stats?.pendingBorrowings ?? 0}</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </div>
        </div>

        {/* Overdue Items Alert */}
        <div 
          onClick={() => onNavigate('borrowings')}
          className={`border rounded-xl p-4 sm:p-5 transition-all cursor-pointer group shadow-sm ${
            (stats?.overdueBorrowings ?? 0) > 0
              ? 'bg-rose-950/30 border-rose-800/80 hover:border-rose-500'
              : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">อุปกรณ์เกินกำหนดส่งคืน</span>
            <div className={`p-2 rounded-lg ${
              (stats?.overdueBorrowings ?? 0) > 0
                ? 'bg-rose-500/20 text-rose-400 group-hover:bg-rose-500 group-hover:text-white'
                : 'bg-slate-800 text-slate-400'
            } transition-all`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-bold ${
              (stats?.overdueBorrowings ?? 0) > 0 ? 'text-rose-400' : 'text-slate-300'
            }`}>
              {stats?.overdueBorrowings ?? 0}
            </span>
            <span className="text-xs text-slate-400">รายการค้างส่ง</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-rose-400 group-hover:translate-x-1 transition-transform">
            <span>{(stats?.overdueBorrowings ?? 0) > 0 ? 'ต้องติดตามด่วน' : 'ไม่มีของค้างส่ง'}</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </div>
        </div>
        </>}
      </div>

      {/* Room Showcase & Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>ห้องซ้อมดนตรีในระบบ</span>
              <span className="text-xs font-normal text-slate-400">({rooms.length} ห้อง)</span>
            </h2>
            <p className="text-xs text-slate-400">ตรวจสอบสถานะความพร้อมและเครื่องดนตรีประจำแต่ละห้อง</p>
          </div>
          <button
            onClick={() => onNavigate('bookings')}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
          >
            <span>ดูตารางจองทั้งหมด</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {rooms.map((room) => {
            const isAvailable = room.status === 'AVAILABLE';
            return (
              <div
                key={room.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={room.imageUrl}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-md border ${
                      isAvailable
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {isAvailable ? 'พร้อมใช้งาน' : 'ปิดปรับปรุง'}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900/90 text-amber-400 border border-amber-400/20">
                      {room.code}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                      {room.name}
                    </h3>
                  </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        ความจุ {room.capacity} คน
                      </span>
                      <span className="text-emerald-400 font-medium">ฟรีสำหรับชมรม</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {room.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="text-[11px] font-medium text-slate-400 mb-1.5">เครื่องดนตรีเด่น:</div>
                    <div className="flex flex-wrap gap-1">
                      {room.equipmentIncluded.slice(0, 2).map((item, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 truncate max-w-full">
                          {item.split('+')[0]}
                        </span>
                      ))}
                      {room.equipmentIncluded.length > 2 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400">
                          +{room.equipmentIncluded.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    disabled={!isAvailable}
                    onClick={onOpenBookingModal}
                    className={`w-full py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isAvailable
                        ? 'bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-200'
                        : 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isAvailable ? 'จองห้องนี้' : 'งดให้บริการชั่วคราว'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Grid: Recent Activity Logs & Quick Guidelines */}
      {isAdmin && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Activity Logs (Audit Trail) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-sm">ประวัติกิจกรรมล่าสุดในระบบ (Audit Trail)</h3>
              <p className="text-xs text-slate-400">บันทึกการจอง การอนุมัติ และการยืม-คืนอุปกรณ์</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              อัปเดตอัตโนมัติ
            </span>
          </div>

          <div className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">ยังไม่มีประวัติกิจกรรม</p>
            ) : (
              logs.slice(0, 5).map((log) => {
                const isApprove = log.action === 'APPROVE' || log.action === 'RETURN';
                const isReject = log.action === 'REJECT' || log.action === 'DELETE';
                return (
                  <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/60 text-xs">
                    <div className={`p-1.5 rounded-md mt-0.5 ${
                      isApprove 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : isReject 
                        ? 'bg-rose-500/20 text-rose-400' 
                        : 'bg-indigo-500/20 text-indigo-400'
                    }`}>
                      {isApprove ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-200 truncate">{log.description}</span>
                        <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                          {new Date(log.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        โดย: <span className="text-slate-300 font-medium">{log.actorName}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Club Rules Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <span>กฎระเบียบการใช้ห้อง & อุปกรณ์</span>
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
              <span>จองห้องซ้อมล่วงหน้าอย่างน้อย 1-3 วัน และไม่เกิน 3 ชั่วโมงต่อครั้ง</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
              <span>อุปกรณ์ดนตรีที่ขอยืมออกนอกห้อง ต้องส่งคืนตรงเวลา และตรวจสภาพก่อนส่งคืน</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
              <span>ห้ามนำอาหารและเครื่องดื่มมีสีเข้าห้องซ้อมเด็ดขาด (อนุญาตเฉพาะน้ำเปล่า)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4</span>
              <span>หากอุปกรณ์ชำรุดจากการใช้งานผิดวิธี ผู้ยืมต้องแจ้งผู้ดูแลทันที</span>
            </li>
          </ul>

          <div className="pt-3 border-t border-slate-800">
            <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-300">
              💡 ติดต่อฉุกเฉินผู้ดูแลห้องซ้อม: นายเอกชัย (พี่เอก) โทร 081-234-5678
            </div>
          </div>
        </div>

      </div>}

    </div>
  );
};
