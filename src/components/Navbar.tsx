import React from 'react';
import { CalendarDays, LogOut, Music2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  return (
    <header className="border-b border-[#d9dfd8] bg-[#fbfcf8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-7 min-h-[68px] flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#123c38] text-white rounded-md flex items-center justify-center"><Music2 size={18} /></div>
          <div><div className="text-sm font-semibold tracking-wide">SOUNDSPACE</div><div className="text-[10px] text-[#77817f]">จองห้องซ้อมดนตรี</div></div>
        </div>
        <div className="ml-auto flex items-center gap-3 sm:gap-5">
          <div className="hidden sm:flex items-center gap-2 text-sm text-[#61706c]"><CalendarDays size={16} /><span>ปฏิทินการจอง</span></div>
          <div className="h-8 border-l border-[#d9dfd8]" />
          <div className="text-right"><div className="text-sm font-medium">{currentUser?.name}</div><div className="text-[11px] text-[#78827f]">{currentUser?.studentId}</div></div>
          <button type="button" onClick={() => { void logout(); }} title="ออกจากระบบ" aria-label="ออกจากระบบ" className="w-9 h-9 grid place-items-center border border-[#d2d9d2] text-[#465552] hover:bg-[#edf1ea] rounded-md"><LogOut size={16} /></button>
        </div>
      </div>
    </header>
  );
};
