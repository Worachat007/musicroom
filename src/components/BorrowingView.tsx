import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Package, 
  Search, 
  Plus, 
  Check, 
  X, 
  Trash2, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  Calendar,
  Layers,
  MapPin,
  Guitar
} from 'lucide-react';
import { Equipment, Borrowing, BorrowStatus, EquipmentCondition, EquipmentCategory } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface BorrowingViewProps {
  equipments: Equipment[];
  borrowings: Borrowing[];
  onRefresh: () => void;
  onCreateBorrowing: (data: any) => Promise<void>;
  onUpdateBorrowing: (id: string, data: any) => Promise<void>;
  onDeleteBorrowing: (id: string) => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

interface BorrowFormData {
  equipmentId: string;
  quantity: number;
  borrowDate: string;
  expectedReturnDate: string;
  phone: string;
  purpose: string;
  agreeToTerms: boolean;
}

export const BorrowingView: React.FC<BorrowingViewProps> = ({
  equipments,
  borrowings,
  onRefresh,
  onCreateBorrowing,
  onUpdateBorrowing,
  onDeleteBorrowing,
  isModalOpen,
  setIsModalOpen,
}) => {
  const { currentUser, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'BORROWINGS' | 'CATALOG'>('BORROWINGS');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [returnInspectionModal, setReturnInspectionModal] = useState<Borrowing | null>(null);
  const [returnCondition, setReturnCondition] = useState<EquipmentCondition>('GOOD');
  const [returnNote, setReturnNote] = useState('');

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BorrowFormData>({
    defaultValues: {
      equipmentId: equipments[0]?.id || '',
      quantity: 1,
      borrowDate: new Date().toISOString().split('T')[0],
      expectedReturnDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      phone: currentUser?.phone || '',
      purpose: '',
      agreeToTerms: false,
    },
  });

  const watchEquipmentId = watch('equipmentId');
  const selectedEquipment = equipments.find(e => e.id === watchEquipmentId);

  // Trigger Borrow for specific item from catalog
  const handleBorrowItem = (eq: Equipment) => {
    setValue('equipmentId', eq.id);
    setValue('quantity', 1);
    setValue('borrowDate', new Date().toISOString().split('T')[0]);
    setValue('expectedReturnDate', new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  // Submit Handler
  const onSubmit = async (formData: BorrowFormData) => {
    try {
      await onCreateBorrowing({
        ...formData,
        userId: currentUser?.id,
        quantity: Number(formData.quantity),
      });
      setIsModalOpen(false);
      reset();
    } catch (err: any) {
      alert(err.message || 'บันทึกคำขอยืมไม่สำเร็จ');
    }
  };

  // Admin Handle Status Change
  const handleStatusChange = async (id: string, status: BorrowStatus, note?: string) => {
    try {
      await onUpdateBorrowing(id, {
        status,
        adminNote: note !== undefined ? note : undefined,
      });
    } catch (err: any) {
      alert(err.message || 'ดำเนินการไม่สำเร็จ');
    }
  };

  // Admin Handle Return Confirmation
  const handleConfirmReturn = async () => {
    if (!returnInspectionModal) return;
    try {
      await onUpdateBorrowing(returnInspectionModal.id, {
        status: 'RETURNED',
        actualReturnDate: new Date().toISOString().split('T')[0],
        returnCondition: returnCondition,
        adminNote: returnNote || `ตรวจรับคืนสภาพ: ${returnCondition}`,
      });
      setReturnInspectionModal(null);
      setReturnNote('');
    } catch (err: any) {
      alert(err.message || 'บันทึกการรับคืนไม่สำเร็จ');
    }
  };

  // Filter Borrowings
  const filteredBorrowings = borrowings.filter((b) => {
    const matchesSearch =
      !searchTerm ||
      b.borrowCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.purpose.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || b.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Filter Catalog
  const filteredCatalog = equipments.filter((e) => {
    const matchesSearch =
      !searchTerm ||
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.model.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Badges
  const getBorrowStatusBadge = (status: BorrowStatus) => {
    switch (status) {
      case 'BORROWED':
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"><Clock className="w-3 h-3" /> กำลังยืม</span>;
      case 'REQUESTED':
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30"><Clock className="w-3 h-3" /> ขอยืม (รออนุมัติ)</span>;
      case 'RETURNED':
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><CheckCircle2 className="w-3 h-3" /> คืนแล้ว</span>;
      case 'OVERDUE':
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30"><AlertTriangle className="w-3 h-3" /> เกินกำหนดส่งคืน</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-400"><XCircle className="w-3 h-3" /> ปฏิเสธ</span>;
      default:
        return null;
    }
  };

  const getConditionBadge = (condition: EquipmentCondition) => {
    switch (condition) {
      case 'EXCELLENT':
        return <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">สภาพดีเยี่ยม</span>;
      case 'GOOD':
        return <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">สภาพดี</span>;
      case 'FAIR':
        return <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">มีรอยการใช้งาน</span>;
      case 'MAINTENANCE':
        return <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">ชำรุด/ส่งซ่อม</span>;
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
            <Guitar className="w-6 h-6 text-amber-400" />
            <span>บริการขอยืม & คืนอุปกรณ์ห้องซ้อมดนตรี</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ยื่นคำขอยืมอุปกรณ์ดนตรี ติดตามสต็อกคงเหลือ และบันทึกการส่งคืน
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Subtab Toggle */}
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex text-xs">
            <button
              onClick={() => setActiveTab('BORROWINGS')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'BORROWINGS'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              รายการยืม-คืน
            </button>
            <button
              onClick={() => setActiveTab('CATALOG')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'CATALOG'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              คลังอุปกรณ์ ({equipments.length})
            </button>
          </div>

          <button
            onClick={() => {
              reset();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>ขอยืมอุปกรณ์</span>
          </button>
        </div>
      </div>

      {/* Overdue Items Banner if any */}
      {isAdmin && borrowings.some(b => b.status === 'OVERDUE') && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-rose-300">แจ้งเตือน: มีรายการอุปกรณ์ที่เกินกำหนดส่งคืน!</h4>
            <p className="text-slate-300 mt-0.5">
              มีอุปกรณ์ดนตรีที่ยังไม่นำมาส่งคืนตามกำหนดเวลา โปรดประสานงานติดตามสมาชิกเพื่อนำส่งคืนคลัง
            </p>
          </div>
          <button
            onClick={() => {
              setActiveTab('BORROWINGS');
              setSelectedStatus('OVERDUE');
            }}
            className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold shrink-0"
          >
            กรองเฉพาะที่ค้างส่ง
          </button>
        </div>
      )}

      {/* Search and Filters Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeTab === 'BORROWINGS'
                  ? 'ค้นหารหัสยืม, ชื่ออุปกรณ์, สมาชิกผู้ยืม, รหัสนักศึกษา...'
                  : 'ค้นหาชื่ออุปกรณ์, แบรนด์, รุ่น, รหัสทรัพย์สิน...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Filter Status or Category */}
          <div>
            {activeTab === 'BORROWINGS' ? (
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">สถานะการยืมทั้งหมด</option>
                <option value="REQUESTED">ขอยืม (รออนุมัติ)</option>
                <option value="BORROWED">กำลังยืม (Borrowed)</option>
                <option value="OVERDUE">เกินกำหนดส่งคืน (Overdue)</option>
                <option value="RETURNED">คืนแล้ว (Returned)</option>
                <option value="REJECTED">ไม่อนุมัติ (Rejected)</option>
              </select>
            ) : (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">หมวดหมู่อุปกรณ์ทั้งหมด</option>
                <option value="GUITAR">กีตาร์ (Guitar)</option>
                <option value="BASS">เบส (Bass)</option>
                <option value="DRUMS">กลอง & เครื่องเคาะ (Drums)</option>
                <option value="KEYBOARD">คีย์บอร์ด & เปียโน (Keyboard)</option>
                <option value="AMPLIFIER">แอมป์ (Amplifier)</option>
                <option value="MICROPHONE">ไมโครโฟน (Microphone)</option>
                <option value="ACCESSORIES">อุปกรณ์เสริม & สาย (Accessories)</option>
              </select>
            )}
          </div>

        </div>

        {/* Clear Filter Button */}
        {(searchTerm || selectedStatus !== 'ALL' || selectedCategory !== 'ALL') && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('ALL');
                setSelectedCategory('ALL');
              }}
              className="text-xs text-amber-400 hover:text-amber-300"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      {activeTab === 'CATALOG' ? (
        /* Equipment Catalog Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCatalog.map((eq) => {
            const hasStock = eq.availableQuantity > 0;
            return (
              <div
                key={eq.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={eq.imageUrl}
                    alt={eq.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                  
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950/80 text-amber-400 border border-amber-400/20">
                      {eq.code}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    {getConditionBadge(eq.condition)}
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {eq.brand} • {eq.category}
                    </div>
                    <h3 className="text-sm font-bold text-white mt-0.5 truncate">
                      {eq.name}
                    </h3>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {eq.description || eq.model}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {eq.location}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-[11px]">คงเหลือ:</span>
                        <span className={`font-bold ${
                          hasStock ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {eq.availableQuantity} / {eq.totalQuantity}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={!hasStock}
                    onClick={() => handleBorrowItem(eq)}
                    className={`w-full py-2 rounded-lg text-xs font-semibold transition-all ${
                      hasStock
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95'
                        : 'bg-slate-800/60 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {hasStock ? 'ขอยืมอุปกรณ์ชิ้นนี้' : 'อุปกรณ์ถูกยืมครบแล้ว'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Borrowings Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          {filteredBorrowings.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 text-sm font-medium">ไม่พบรายการขอยืมอุปกรณ์</p>
              <p className="text-slate-500 text-xs mt-1">กดปุ่ม "ขอยืมอุปกรณ์" เพื่อส่งคำขอยืมชิ้นใหม่</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">รหัสยืม</th>
                    <th className="py-3.5 px-4">อุปกรณ์</th>
                    <th className="py-3.5 px-4">จำนวน</th>
                    <th className="py-3.5 px-4">กำหนดวันยืม - คืน</th>
                    <th className="py-3.5 px-4">ผู้ยืม / เบอร์โทร</th>
                    <th className="py-3.5 px-4">วัตถุประสงค์</th>
                    <th className="py-3.5 px-4">สถานะ</th>
                    <th className="py-3.5 px-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {filteredBorrowings.map((b) => {
                    const isOwn = b.userId === currentUser?.id;
                    const canCancel = isOwn && b.status === 'REQUESTED';

                    return (
                      <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-amber-400 font-semibold">{b.borrowCode}</span>
                          <div className="text-[10px] text-slate-500">
                            {new Date(b.createdAt).toLocaleDateString('th-TH')}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{b.equipmentName}</div>
                          <span className="text-[10px] font-mono text-slate-400">{b.equipmentCode}</span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded whitespace-nowrap">
                            {b.quantity} ชิ้น
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="text-slate-300">ยืม: {b.borrowDate}</div>
                          <div className={`text-[11px] font-semibold ${
                            b.status === 'OVERDUE' ? 'text-rose-400' : 'text-slate-400'
                          }`}>
                            คืน: {b.expectedReturnDate}
                          </div>
                          {b.actualReturnDate && (
                            <div className="text-[10px] text-emerald-400">
                              (คืนจริง: {b.actualReturnDate})
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-200">{b.userName}</div>
                          <div className="text-slate-400 text-[11px]">รหัส: {b.studentId}</div>
                          <div className="text-[10px] text-slate-500">โทร: {b.phone}</div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="line-clamp-2 text-slate-300">{b.purpose}</p>
                          {b.adminNote && (
                            <div className="text-[10px] text-amber-300 mt-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              {b.adminNote}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getBorrowStatusBadge(b.status)}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Admin Approve / Reject */}
                            {isAdmin && b.status === 'REQUESTED' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(b.id, 'BORROWED')}
                                  className="p-1.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg transition-all"
                                  title="อนุมัติให้ยืม (ตัดสต็อก)"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleStatusChange(b.id, 'REJECTED', 'ไม่อนุมัติการยืม')}
                                  className="p-1.5 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg transition-all"
                                  title="ปฏิเสธคำขอยืม"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {/* Admin Receive Return with condition check */}
                            {isAdmin && (b.status === 'BORROWED' || b.status === 'OVERDUE') && (
                              <button
                                onClick={() => {
                                  setReturnInspectionModal(b);
                                  setReturnCondition('GOOD');
                                  setReturnNote('');
                                }}
                                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                                title="รับคืนอุปกรณ์และตรวจสภาพ"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>รับคืน</span>
                              </button>
                            )}

                            {/* Member Cancel Own Request */}
                            {canCancel && (
                              <button
                                onClick={() => {
                                  if (confirm('ต้องการยกเลิกคำขอยืมนี้หรือไม่?')) {
                                    onDeleteBorrowing(b.id);
                                  }
                                }}
                                className="px-2 py-1 bg-slate-800 hover:bg-rose-600/80 text-slate-300 hover:text-white rounded-lg text-xs transition-all"
                              >
                                ยกเลิกคำขอ
                              </button>
                            )}

                            {/* Admin Delete */}
                            {isAdmin && (
                              <button
                                onClick={() => {
                                  if (confirm(`คุณต้องการลบข้อมูลคำขอยืม ${b.borrowCode} หรือไม่?`)) {
                                    onDeleteBorrowing(b.id);
                                  }
                                }}
                                className="p-1.5 bg-slate-800 hover:bg-rose-600/80 text-slate-400 hover:text-white rounded-lg transition-all"
                                title="ลบรายการ"
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

      {/* --- REACT HOOK FORM BORROW MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Guitar className="w-5 h-5 text-amber-400" />
                  <span>ยื่นคำขอยืมอุปกรณ์ดนตรี (Borrowing)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  ระบบตรวจสอบสต็อกคงเหลือและระยะเวลาการยืมโดยอัตโนมัติ
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
              
              {/* Equipment Select */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  เลือกอุปกรณ์ดนตรี <span className="text-rose-400">*</span>
                </label>
                <select
                  {...register('equipmentId', { required: 'กรุณาเลือกอุปกรณ์' })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {equipments.map((eq) => (
                    <option key={eq.id} value={eq.id} disabled={eq.availableQuantity <= 0}>
                      {eq.name} ({eq.code}) - ว่าง {eq.availableQuantity}/{eq.totalQuantity} ชิ้น {eq.availableQuantity <= 0 ? '(หมด)' : ''}
                    </option>
                  ))}
                </select>
                {selectedEquipment && (
                  <div className="mt-1.5 p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">ที่เก็บ: {selectedEquipment.location}</span>
                    <span className="text-amber-400 font-semibold">คงเหลือให้ยืม: {selectedEquipment.availableQuantity} ชิ้น</span>
                  </div>
                )}
                {errors.equipmentId && <p className="text-rose-400 text-[11px] mt-1">{errors.equipmentId.message}</p>}
              </div>

              {/* Quantity */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  จำนวนที่ต้องการยืม (ชิ้น) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedEquipment?.availableQuantity || 1}
                  {...register('quantity', {
                    required: 'ระบุจำนวนที่ต้องการยืม',
                    min: { value: 1, message: 'อย่างน้อย 1 ชิ้น' },
                    max: { 
                      value: selectedEquipment?.availableQuantity || 1, 
                      message: `สต็อกคงเหลือเพียง ${selectedEquipment?.availableQuantity || 0} ชิ้น` 
                    }
                  })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                />
                {errors.quantity && <p className="text-rose-400 text-[11px] mt-1">{errors.quantity.message}</p>}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    วันที่ต้องการยืม <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    {...register('borrowDate', { required: 'ระบุวันที่ยืม' })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                  {errors.borrowDate && <p className="text-rose-400 text-[11px] mt-1">{errors.borrowDate.message}</p>}
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    กำหนดวันที่ส่งคืน <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    {...register('expectedReturnDate', { 
                      required: 'ระบุวันที่ส่งคืน',
                      validate: (val, formVals) => 
                        val >= formVals.borrowDate || 'วันที่ส่งคืนต้องไม่ก่อนวันที่ยืม'
                    })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                  {errors.expectedReturnDate && <p className="text-rose-400 text-[11px] mt-1">{errors.expectedReturnDate.message}</p>}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  เบอร์โทรศัพท์ติดต่อ <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="เช่น 089-876-5432"
                  {...register('phone', {
                    required: 'ระบุเบอร์โทรศัพท์ติดต่อ',
                    pattern: {
                      value: /^(0[689]\d{8}|0[689]-\d{3}-\d{4}|0[689]\d-\d{3}-\d{4}|0\d{8,9})$/,
                      message: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง'
                    }
                  })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                />
                {errors.phone && <p className="text-rose-400 text-[11px] mt-1">{errors.phone.message}</p>}
              </div>

              {/* Purpose */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  วัตถุประสงค์ในการยืมใช้งาน <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น นำไปอัดเสียงโปรเจกต์วิชานิเทศ, ซ้อมเปิดหมวกงานการกุศล..."
                  {...register('purpose', { 
                    required: 'กรุณาระบุวัตถุประสงค์',
                    minLength: { value: 5, message: 'อย่างน้อย 5 ตัวอักษร' }
                  })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                />
                {errors.purpose && <p className="text-rose-400 text-[11px] mt-1">{errors.purpose.message}</p>}
              </div>

              {/* Terms Agreement Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('agreeToTerms', {
                      required: 'ท่านต้องยอมรับข้อตกลงในการดูแลรักษาอุปกรณ์'
                    })}
                    className="mt-0.5 rounded border-slate-800 text-amber-500 focus:ring-amber-400"
                  />
                  <span className="text-[11px] text-slate-300 leading-snug">
                    ข้าพเจ้ายินยอมปฏิบัติตามกฎชมรม และสัญญาว่าจะดูแลรักษาอุปกรณ์ให้อยู่ในสภาพสมบูรณ์ หากชำรุดเสียหายยินดีรับผิดชอบตามข้อตกลง
                  </span>
                </label>
                {errors.agreeToTerms && <p className="text-rose-400 text-[11px] mt-1">{errors.agreeToTerms.message}</p>}
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
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'กำลังส่งคำขอ...' : 'ยืนยันขอยืมอุปกรณ์'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* --- ADMIN RETURN INSPECTION MODAL --- */}
      {returnInspectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                <span>ตรวจสอบและบันทึกการส่งคืนอุปกรณ์</span>
              </h3>
              <button onClick={() => setReturnInspectionModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="font-semibold text-white">{returnInspectionModal.equipmentName}</div>
              <div className="text-slate-400">รหัสยืม: {returnInspectionModal.borrowCode} | จำนวน: {returnInspectionModal.quantity} ชิ้น</div>
              <div className="text-slate-400">ผู้ยืม: {returnInspectionModal.userName} (โทร: {returnInspectionModal.phone})</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  สภาพอุปกรณ์ที่ได้รับคืน:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['EXCELLENT', 'GOOD', 'FAIR', 'MAINTENANCE'] as EquipmentCondition[]).map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setReturnCondition(cond)}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        returnCondition === cond
                          ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cond === 'EXCELLENT' && '✨ ดีเยี่ยม 100%'}
                      {cond === 'GOOD' && '👍 ดี พร้อมใช้งาน'}
                      {cond === 'FAIR' && '⚠️ มีรอยการใช้งาน'}
                      {cond === 'MAINTENANCE' && '❌ ชำรุด/ต้องซ่อม'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  หมายเหตุเพิ่มเติม / ข้อบกพร่องที่ตรวจพบ:
                </label>
                <textarea
                  rows={2}
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  placeholder="เช่น คืนอุปกรณ์ครบพร้อมกระเป๋า, สายแจ็คมีเสียงคอกแคกเล็กน้อย..."
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setReturnInspectionModal(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmReturn}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20"
              >
                ยืนยันการรับคืนและเพิ่มสต็อก
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
