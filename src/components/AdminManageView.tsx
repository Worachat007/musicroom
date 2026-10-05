import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  Building2, 
  Package, 
  ShieldAlert,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { Room, Equipment, EquipmentCategory, EquipmentCondition, RoomStatus } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface AdminManageViewProps {
  rooms: Room[];
  equipments: Equipment[];
  onRefresh: () => void;
  onCreateRoom: (data: any) => Promise<void>;
  onUpdateRoom: (id: string, data: any) => Promise<void>;
  onDeleteRoom: (id: string) => Promise<void>;
  onCreateEquipment: (data: any) => Promise<void>;
  onUpdateEquipment: (id: string, data: any) => Promise<void>;
  onDeleteEquipment: (id: string) => Promise<void>;
  onResetData: () => Promise<void>;
}

export const AdminManageView: React.FC<AdminManageViewProps> = ({
  rooms,
  equipments,
  onRefresh,
  onCreateRoom,
  onUpdateRoom,
  onDeleteRoom,
  onCreateEquipment,
  onUpdateEquipment,
  onDeleteEquipment,
  onResetData,
}) => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'ROOMS' | 'EQUIPMENTS'>('ROOMS');

  // Room Modal State
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Equipment Modal State
  const [eqModalOpen, setEqModalOpen] = useState(false);
  const [editingEq, setEditingEq] = useState<Equipment | null>(null);

  // React Hook Form for Room
  const {
    register: registerRoom,
    handleSubmit: handleSubmitRoom,
    reset: resetRoom,
    setValue: setRoomValue,
    formState: { errors: roomErrors },
  } = useForm({
    defaultValues: {
      name: '',
      code: '',
      capacity: 8,
      hourlyRate: 0,
      status: 'AVAILABLE' as RoomStatus,
      description: '',
      equipmentListStr: '',
      imageUrl: '',
    },
  });

  // React Hook Form for Equipment
  const {
    register: registerEq,
    handleSubmit: handleSubmitEq,
    reset: resetEq,
    setValue: setEqValue,
    formState: { errors: eqErrors },
  } = useForm({
    defaultValues: {
      name: '',
      code: '',
      category: 'GUITAR' as EquipmentCategory,
      brand: '',
      model: '',
      totalQuantity: 1,
      condition: 'GOOD' as EquipmentCondition,
      location: 'ตู้เก็บ A-01',
      description: '',
      imageUrl: '',
    },
  });

  // Open Room Modal
  const openRoomModal = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setRoomValue('name', room.name);
      setRoomValue('code', room.code);
      setRoomValue('capacity', room.capacity);
      setRoomValue('hourlyRate', room.hourlyRate);
      setRoomValue('status', room.status);
      setRoomValue('description', room.description);
      setRoomValue('equipmentListStr', room.equipmentIncluded.join('\n'));
      setRoomValue('imageUrl', room.imageUrl);
    } else {
      setEditingRoom(null);
      resetRoom();
    }
    setRoomModalOpen(true);
  };

  // Submit Room
  const onRoomSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        capacity: Number(data.capacity),
        hourlyRate: Number(data.hourlyRate),
        equipmentIncluded: data.equipmentListStr
          ? data.equipmentListStr.split('\n').map((s: string) => s.trim()).filter(Boolean)
          : [],
      };
      if (editingRoom) {
        await onUpdateRoom(editingRoom.id, payload);
      } else {
        await onCreateRoom(payload);
      }
      setRoomModalOpen(false);
      resetRoom();
    } catch (err: any) {
      alert(err.message || 'บันทึกห้องไม่สำเร็จ');
    }
  };

  // Open Eq Modal
  const openEqModal = (eq?: Equipment) => {
    if (eq) {
      setEditingEq(eq);
      setEqValue('name', eq.name);
      setEqValue('code', eq.code);
      setEqValue('category', eq.category);
      setEqValue('brand', eq.brand);
      setEqValue('model', eq.model);
      setEqValue('totalQuantity', eq.totalQuantity);
      setEqValue('condition', eq.condition);
      setEqValue('location', eq.location);
      setEqValue('description', eq.description);
      setEqValue('imageUrl', eq.imageUrl);
    } else {
      setEditingEq(null);
      resetEq();
    }
    setEqModalOpen(true);
  };

  // Submit Eq
  const onEqSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        totalQuantity: Number(data.totalQuantity),
      };
      if (editingEq) {
        await onUpdateEquipment(editingEq.id, payload);
      } else {
        await onCreateEquipment(payload);
      }
      setEqModalOpen(false);
      resetEq();
    } catch (err: any) {
      alert(err.message || 'บันทึกอุปกรณ์ไม่สำเร็จ');
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto mt-10">
        <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">ต้องการสิทธิ์ผู้ดูแลห้องซ้อม (Admin Role Required)</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          หน้านี้สงวนไว้สำหรับผู้ดูแลระบบหรือเจ้าหน้าที่ชมรมดนตรีเพื่อจัดการข้อมูลห้องซ้อมและคลังอุปกรณ์
          คุณสามารถกดปุ่ม <span className="text-amber-400 font-semibold">"สลับเป็นผู้ดูแล"</span> ที่แถบเมนูด้านบนเพื่อทดสอบการทำงาน
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-400" />
            <span>การจัดการห้องซ้อม & คลังอุปกรณ์ (Admin Control)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            เพิ่ม แก้ไข และลบข้อมูลห้องซ้อมดนตรีและอุปกรณ์ในคลังชมรม (CRUD Management)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Subtab Toggle */}
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex text-xs">
            <button
              onClick={() => setActiveTab('ROOMS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'ROOMS'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>ห้องซ้อม ({rooms.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('EQUIPMENTS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'EQUIPMENTS'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>อุปกรณ์ดนตรี ({equipments.length})</span>
            </button>
          </div>

          <button
            onClick={() => (activeTab === 'ROOMS' ? openRoomModal() : openEqModal())}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === 'ROOMS' ? 'เพิ่มห้องซ้อมใหม่' : 'เพิ่มอุปกรณ์ใหม่'}</span>
          </button>

          <button
            onClick={() => {
              if (confirm('คุณต้องการรีเซ็ตข้อมูลตัวอย่างทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่?')) {
                onResetData();
              }
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs transition-all"
            title="รีเซ็ตข้อมูลตัวอย่างเริ่มต้น"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'ROOMS' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">รหัส</th>
                <th className="py-3 px-4">ชื่อห้อง</th>
                <th className="py-3 px-4">ความจุ</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4">อุปกรณ์ประจำห้อง</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {rooms.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">{r.code}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{r.name}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{r.description}</div>
                  </td>
                  <td className="py-3 px-4 font-medium">{r.capacity} คน</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      r.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {r.status === 'AVAILABLE' ? 'เปิดบริการ' : 'ปิดปรับปรุง'}
                    </span>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <span className="text-slate-300 line-clamp-1">{r.equipmentIncluded.join(', ')}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openRoomModal(r)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all"
                        title="แก้ไขข้อมูลห้อง"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`คุณต้องการลบห้อง ${r.name} หรือไม่?`)) {
                            onDeleteRoom(r.id);
                          }
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-rose-600/80 text-slate-400 hover:text-white rounded-lg transition-all"
                        title="ลบห้อง"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">รหัส</th>
                <th className="py-3 px-4">ชื่ออุปกรณ์</th>
                <th className="py-3 px-4">หมวดหมู่ & แบรนด์</th>
                <th className="py-3 px-4">สต็อกคงเหลือ / ทั้งหมด</th>
                <th className="py-3 px-4">สภาพ</th>
                <th className="py-3 px-4">สถานที่จัดเก็บ</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {equipments.map((eq) => (
                <tr key={eq.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">{eq.code}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{eq.name}</div>
                    <div className="text-[10px] text-slate-400">{eq.model}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-300 font-medium">{eq.category}</div>
                    <div className="text-[10px] text-slate-500">{eq.brand}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-emerald-400">{eq.availableQuantity}</span> / {eq.totalQuantity} ชิ้น
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {eq.condition}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{eq.location}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEqModal(eq)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all"
                        title="แก้ไขอุปกรณ์"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`คุณต้องการลบอุปกรณ์ ${eq.name} หรือไม่?`)) {
                            onDeleteEquipment(eq.id);
                          }
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-rose-600/80 text-slate-400 hover:text-white rounded-lg transition-all"
                        title="ลบอุปกรณ์"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- ROOM MODAL (REACT HOOK FORM) --- */}
      {roomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <span>{editingRoom ? 'แก้ไขข้อมูลห้องซ้อม' : 'เพิ่มห้องซ้อมดนตรีใหม่'}</span>
              </h3>
              <button onClick={() => setRoomModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRoom(onRoomSubmit)} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">รหัสห้อง (Code) *</label>
                  <input
                    type="text"
                    placeholder="เช่น RM-A101"
                    {...registerRoom('code', { required: 'กรุณากรอกรหัสห้อง' })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  {roomErrors.code && <p className="text-rose-400 text-[10px] mt-1">{roomErrors.code.message}</p>}
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">ความจุ (คน) *</label>
                  <input
                    type="number"
                    min={1}
                    {...registerRoom('capacity', { required: 'กรุณาระบุความจุ' })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">ชื่อห้องซ้อม *</label>
                <input
                  type="text"
                  placeholder="เช่น Studio A (Main Live Hall)"
                  {...registerRoom('name', { required: 'กรุณากรอกชื่อห้อง' })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                {roomErrors.name && <p className="text-rose-400 text-[10px] mt-1">{roomErrors.name.message}</p>}
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">สถานะห้อง</label>
                <select
                  {...registerRoom('status')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="AVAILABLE">AVAILABLE (พร้อมใช้งาน)</option>
                  <option value="MAINTENANCE">MAINTENANCE (ปิดปรับปรุง)</option>
                  <option value="CLOSED">CLOSED (ปิดบริการ)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">คำอธิบายห้อง</label>
                <textarea
                  rows={2}
                  placeholder="รายละเอียด acoustic และพื้นที่ใช้งาน..."
                  {...registerRoom('description')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">รายการอุปกรณ์ประจำห้อง (1 บรรทัดต่อ 1 ชิ้น)</label>
                <textarea
                  rows={3}
                  placeholder="กลองชุด Tama&#10;แอมป์ Fender Twin Reverb&#10;เปียโน Yamaha"
                  {...registerRoom('equipmentListStr')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRoomModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md"
                >
                  บันทึกข้อมูลห้อง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EQUIPMENT MODAL (REACT HOOK FORM) --- */}
      {eqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                <span>{editingEq ? 'แก้ไขข้อมูลอุปกรณ์' : 'เพิ่มอุปกรณ์ดนตรีใหม่'}</span>
              </h3>
              <button onClick={() => setEqModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEq(onEqSubmit)} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">รหัสอุปกรณ์ (Code) *</label>
                  <input
                    type="text"
                    placeholder="เช่น EQ-GTR-003"
                    {...registerEq('code', { required: 'กรุณากรอกรหัสอุปกรณ์' })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                  {eqErrors.code && <p className="text-rose-400 text-[10px] mt-1">{eqErrors.code.message}</p>}
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">หมวดหมู่ *</label>
                  <select
                    {...registerEq('category')}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="GUITAR">GUITAR (กีตาร์)</option>
                    <option value="BASS">BASS (เบส)</option>
                    <option value="DRUMS">DRUMS (กลอง)</option>
                    <option value="KEYBOARD">KEYBOARD (คีย์บอร์ด)</option>
                    <option value="AMPLIFIER">AMPLIFIER (แอมป์)</option>
                    <option value="MICROPHONE">MICROPHONE (ไมค์)</option>
                    <option value="ACCESSORIES">ACCESSORIES (อุปกรณ์เสริม)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">ชื่ออุปกรณ์ *</label>
                <input
                  type="text"
                  placeholder="เช่น กีตาร์ไฟฟ้า Fender Player Strat"
                  {...registerEq('name', { required: 'กรุณากรอกชื่อ' })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                />
                {eqErrors.name && <p className="text-rose-400 text-[10px] mt-1">{eqErrors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">แบรนด์</label>
                  <input
                    type="text"
                    placeholder="เช่น Fender, Shure"
                    {...registerEq('brand')}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">จำนวนทั้งหมด (ชิ้น) *</label>
                  <input
                    type="number"
                    min={1}
                    {...registerEq('totalQuantity', { required: 'ระบุจำนวน' })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">สภาพอุปกรณ์</label>
                  <select
                    {...registerEq('condition')}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="EXCELLENT">EXCELLENT (ดีเยี่ยม)</option>
                    <option value="GOOD">GOOD (ดี)</option>
                    <option value="FAIR">FAIR (มีรอยการใช้งาน)</option>
                    <option value="MAINTENANCE">MAINTENANCE (ส่งซ่อม)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">สถานที่จัดเก็บ</label>
                  <input
                    type="text"
                    placeholder="เช่น ตู้เก็บเครื่องสาย A-01"
                    {...registerEq('location')}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">รายละเอียดเพิ่มเติม</label>
                <textarea
                  rows={2}
                  placeholder="สเปกอุปกรณ์ จุดเด่น หรืออุปกรณ์ประกอบ..."
                  {...registerEq('description')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEqModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md"
                >
                  บันทึกข้อมูลอุปกรณ์
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
