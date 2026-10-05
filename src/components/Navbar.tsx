import React, { useState } from 'react';
import { 
  Music, 
  Calendar, 
  Package, 
  LayoutDashboard, 
  Settings, 
  Code, 
  Shield, 
  UserCheck, 
  ChevronDown, 
  RefreshCw,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  pendingCount: number;
  overdueCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentTab, 
  setCurrentTab,
  pendingCount,
  overdueCount
}) => {
  const { currentUser, allUsers, isAdmin, switchUser, switchRole } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'ภาพรวมระบบ', icon: LayoutDashboard },
    { id: 'bookings', label: 'บริการห้องซ้อมดนตรี', icon: Calendar, badge: pendingCount > 0 ? pendingCount : null },
    { id: 'borrowings', label: 'ยืม-คืนอุปกรณ์ดนตรี', icon: Package, badge: overdueCount > 0 ? `! ${overdueCount}` : null, badgeColor: 'bg-rose-500' },
    ...(isAdmin ? [
      { id: 'manage', label: 'จัดการคลัง & ห้อง', icon: Settings },
      { id: 'api-docs', label: 'REST API & Schema', icon: Code },
    ] : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 h-16">
          
          {/* Logo & Brand */}
          <div className="flex shrink-0 items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif]">
                  SoundSpace
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Club Studio
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                ระบบบันทึกการใช้ห้องซ้อม & ยืมอุปกรณ์
              </p>
            </div>
          </div>

          {/* User & Role Switcher */}
          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Quick Role Switch Buttons */}
            {isAdmin && <div className="hidden lg:flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => switchRole('ADMIN')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                  isAdmin
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="สลับเป็นสิทธิ์ผู้ดูแลห้องซ้อม"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>ผู้ดูแล</span>
              </button>
              <button
                onClick={() => switchRole('MEMBER')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                  !isAdmin
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="สลับเป็นสิทธิ์สมาชิกชมรม"
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>สมาชิกชมรม</span>
              </button>
            </div>}

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all text-left"
              >
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser?.name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/40"
                />
                <div className="hidden sm:block text-xs">
                  <div className="font-medium text-slate-200 truncate max-w-[120px]">
                    {currentUser?.name.split(' ')[0]}
                  </div>
                  <div className={`text-[10px] font-semibold ${isAdmin ? 'text-amber-400' : 'text-indigo-400'}`}>
                    {isAdmin ? '🛡️ ผู้ดูแลระบบ' : '🎸 สมาชิกชมรม'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 text-xs divide-y divide-slate-800">
                    <div className="p-2">
                      <p className="font-semibold text-slate-200">{currentUser?.name}</p>
                      <p className="text-slate-400">{currentUser?.email}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          รหัสนักศึกษา: {currentUser?.studentId}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isAdmin ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'
                        }`}>
                          {currentUser?.role}
                        </span>
                      </div>
                      {currentUser?.bandName && (
                        <p className="text-[11px] text-amber-400/90 mt-1">วง: {currentUser.bandName}</p>
                      )}
                    </div>

                    {/* Demo account switcher is available to admins only. */}
                    {isAdmin && <div className="p-2 space-y-1">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 px-1">
                        สลับบัญชีทดสอบสิทธิ์:
                      </p>
                      {allUsers.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setShowUserMenu(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                            currentUser?.id === u.id
                              ? 'bg-indigo-600/30 border border-indigo-500/40 text-white'
                              : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div>
                            <div className="font-medium text-slate-200">{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.faculty}</div>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                            u.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'
                          }`}>
                            {u.role === 'ADMIN' ? 'ผู้ดูแล' : 'สมาชิก'}
                          </span>
                        </button>
                      ))}
                    </div>}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <nav aria-label="เมนูหลัก" className="flex overflow-x-auto py-2 gap-1 border-t border-slate-800 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] font-bold px-1 rounded-full text-white ${tab.badgeColor || 'bg-amber-500'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
};
