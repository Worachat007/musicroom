import React, { useState } from 'react';
import { ArrowRight, CalendarDays, LockKeyhole, Music2, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

const formatStudentId = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  return digits.length > 9 ? `${digits.slice(0, 9)}-${digits.slice(9)}` : digits;
};

export const AuthView: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (mode === 'register') await register(name, studentId, password);
      else await login(studentId, password);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ไม่สามารถดำเนินการได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f5f0] text-[#192a2a] grid lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative min-h-[35vh] lg:min-h-screen overflow-hidden bg-[#123c38] text-[#f5f1e8] px-7 py-8 sm:px-12 lg:px-16 lg:py-12 flex flex-col justify-between">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#b6d0c2 0.7px, transparent 0.7px)', backgroundSize: '18px 18px' }} />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-[#db744d] text-white flex items-center justify-center rounded-md"><Music2 size={21} /></div>
          <span className="font-semibold tracking-wide">SOUNDSPACE / STUDIO</span>
        </div>
        <div className="relative max-w-xl py-12 lg:py-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e6a17f]">Music club room booking</p>
          <h1 className="mt-5 text-4xl sm:text-5xl font-semibold leading-tight">พื้นที่ซ้อม<br />เริ่มต้นจากวันว่าง</h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-[#d0dfd5]">ดูตารางห้องซ้อม เลือกวันที่สะดวก และจัดการการจองของคุณได้ในที่เดียว</p>
        </div>
        <div className="relative hidden lg:flex items-center gap-3 text-xs text-[#bfd0c7]">
          <CalendarDays size={16} /><span>ปฏิทินการจองห้องซ้อม</span><span className="mx-2 text-[#e6a17f]">/</span><span>สมาชิกด้วยรหัสนักศึกษา</span>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.16em] font-semibold text-[#bb6043]">สมาชิกชมรมดนตรี</p>
            <h2 className="mt-2 text-2xl font-semibold">{mode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชีสมาชิก'}</h2>
            <p className="mt-2 text-sm text-[#687574]">ใช้รหัสนักศึกษาเพื่อเข้าสู่ระบบและจองห้องซ้อม</p>
          </div>

          <div className="flex border-b border-[#cfd6cf] mb-7" role="tablist" aria-label="การยืนยันตัวตน">
            <button type="button" onClick={() => { setMode('login'); setError(''); }} className={`px-1 pb-3 mr-7 text-sm border-b-2 ${mode === 'login' ? 'border-[#bb6043] text-[#192a2a] font-semibold' : 'border-transparent text-[#75807e]'}`}>เข้าสู่ระบบ</button>
            <button type="button" onClick={() => { setMode('register'); setError(''); }} className={`px-1 pb-3 text-sm border-b-2 ${mode === 'register' ? 'border-[#bb6043] text-[#192a2a] font-semibold' : 'border-transparent text-[#75807e]'}`}>สมัครสมาชิก</button>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {mode === 'register' && (
              <label className="block text-sm font-medium">
                ชื่อที่ใช้แสดง
                <span className="mt-2 relative block"><UserRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#83908d]" /><input name="name" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={80} autoComplete="name" className="w-full h-12 pl-10 pr-3 border border-[#cbd3cc] bg-white rounded-md outline-none focus:border-[#bb6043]" placeholder="ชื่อ-นามสกุล" /></span>
              </label>
            )}
            <label className="block text-sm font-medium">
              รหัสนักศึกษา
              <span className="mt-2 relative block"><UserRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#83908d]" /><input name="studentId" value={studentId} onChange={(event) => setStudentId(formatStudentId(event.target.value))} required inputMode="numeric" maxLength={11} pattern="[0-9]{9}-[0-9]" autoComplete="username" aria-describedby="student-id-help" className="w-full h-12 pl-10 pr-3 border border-[#cbd3cc] bg-white rounded-md outline-none focus:border-[#bb6043]" placeholder="เช่น 663450351-5" /></span>
              <span id="student-id-help" className="mt-1.5 block text-xs font-normal text-[#7c8885]">ใช้ตัวเลข 9 หลัก ตามด้วยขีดและตัวเลข 1 หลัก เช่น 663450351-5</span>
            </label>
            <label className="block text-sm font-medium">
              รหัสผ่าน
              <span className="mt-2 relative block"><LockKeyhole size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#83908d]" /><input name="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={128} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="w-full h-12 pl-10 pr-3 border border-[#cbd3cc] bg-white rounded-md outline-none focus:border-[#bb6043]" placeholder="อย่างน้อย 8 ตัวอักษร" /></span>
            </label>

            {error && <p role="alert" className="text-sm text-[#b43f32] bg-[#f9e7e1] border border-[#efc9bc] px-3 py-2 rounded-md">{error}</p>}
            <button type="submit" disabled={isSubmitting} className="w-full h-12 flex items-center justify-center gap-2 bg-[#bb6043] hover:bg-[#a94f35] disabled:opacity-60 text-white font-semibold rounded-md transition-colors">
              {isSubmitting ? 'กำลังดำเนินการ...' : mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
              {!isSubmitting && <ArrowRight size={17} />}
            </button>
          </form>
          <p className="mt-6 text-xs leading-5 text-[#7c8885]">รหัสผ่านจะถูกเข้ารหัสก่อนจัดเก็บ และใช้สำหรับบัญชีของคุณเท่านั้น</p>
        </div>
      </section>
    </main>
  );
};
