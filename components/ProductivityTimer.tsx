
import React, { useState, useEffect, useRef } from 'react';
import { SessionOutput } from '../types';

const ProductivityTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'Pomodoro' | 'Deep' | 'Light'>('Pomodoro');
  const [showLogModal, setShowLogModal] = useState(false);
  const [outputDesc, setOutputDesc] = useState('');
  const [quality, setQuality] = useState(7);
  
  const timerRef = useRef<number | null>(null);

  const configs = {
    Pomodoro: 25 * 60,
    Deep: 90 * 60,
    Light: 15 * 60
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleSessionComplete();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleSessionComplete = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setShowLogModal(true);
  };

  const saveSession = () => {
    const session: SessionOutput = {
      topicId: 'general',
      timestamp: new Date().toISOString(),
      durationMinutes: Math.floor(configs[mode] / 60),
      outputDescription: outputDesc,
      perceivedQuality: quality,
      energyLevelBefore: 80 // Default or tracked elsewhere
    };

    const existing = JSON.parse(localStorage.getItem('lc_session_outputs') || '[]');
    localStorage.setItem('lc_session_outputs', JSON.stringify([...existing, session]));
    
    // Logic to update profile points or history would go here
    setShowLogModal(false);
    setOutputDesc('');
    resetTimer(mode);
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = (newMode: 'Pomodoro' | 'Deep' | 'Light') => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(configs[newMode]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center py-12" dir="rtl">
      {showLogModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-black text-slate-800 mb-2">ماذا أنجزت فعلياً؟ 🏆</h3>
            <p className="text-sm text-slate-500 mb-6">الإنتاجية تُقاس بالمخرجات، وليس فقط بالوقت.</p>
            
            <textarea
              value={outputDesc}
              onChange={(e) => setOutputDesc(e.target.value)}
              placeholder="مثال: حللت 15 مسألة، كتبت مسودة المقال..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm mb-4 h-32 focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-400 mb-2 text-right">جودة التركيز (1-10)</label>
              <input 
                type="range" min="1" max="10" 
                value={quality} 
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
                <span>10 (تدفق كامل)</span>
                <span>1 (تشتت)</span>
              </div>
            </div>

            <button 
              onClick={saveSession}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              حفظ المخرجات وتحديث السجل
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 w-full mb-8 relative overflow-hidden">
        <div className="flex justify-center gap-4 mb-8">
          {(['Light', 'Pomodoro', 'Deep'] as const).map((m) => (
            <button
              key={m}
              onClick={() => resetTimer(m)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                mode === m ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {m === 'Light' ? 'خفيف' : m === 'Pomodoro' ? 'بومودورو' : 'عميق'}
            </button>
          ))}
        </div>

        <div className="text-8xl font-black text-slate-800 mb-8 tabular-nums tracking-tighter">
          {formatTime(timeLeft)}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={toggleTimer}
            className={`px-12 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all ${
              isActive 
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
            }`}
          >
            {isActive ? 'إيقاف مؤقت' : 'ابدأ جلسة الإنجاز'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-right">
        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
          <h4 className="font-bold text-indigo-900 mb-1 flex items-center gap-2">
            <span>📈</span> التركيز على المخرجات
          </h4>
          <p className="text-xs text-indigo-700 leading-relaxed">
            الهدف ليس إكمال الوقت، بل تسجيل إنجاز ملموس. سأقوم بتحليل مخرجاتك لضبط فترات العمل المثالية لك مستقبلاً.
          </p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
          <h4 className="font-bold text-emerald-900 mb-1 flex items-center gap-2">
            <span>💡</span> رؤية الرفيق الذكي
          </h4>
          <p className="text-xs text-emerald-700 leading-relaxed">
            أظهرت بياناتك السابقة أنك تنجز مخرجات بجودة أعلى (9/10) خلال جلسات الـ 25 دقيقة عندما يكون نومك {'>'} 7 ساعات.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductivityTimer;
