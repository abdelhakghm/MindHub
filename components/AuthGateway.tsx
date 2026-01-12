
import React, { useState } from 'react';

interface AuthGatewayProps {
  onAuthSuccess: (user: any) => void;
}

const AuthGateway: React.FC<AuthGatewayProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      const mockUser = { 
        id: 'user_' + Math.random().toString(36).substr(2, 9), 
        email,
        isNewUser: !isLogin 
      };
      
      onAuthSuccess(mockUser);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-10 transform transition-all hover:scale-[1.01]">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-indigo-100 mb-4 animate-bounce">
            M
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">MindHub</h2>
          <p className="text-xs text-slate-400 font-bold tracking-tight">بواسطة عبد الحق قحمام</p>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
          <button 
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            تسجيل دخول
          </button>
          <button 
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${!isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            إنشاء حساب
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-500 text-xs rounded-xl text-center font-bold border border-red-100 animate-shake">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mr-2 text-right">
              البريد الإلكتروني
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-right"
              placeholder="example@mail.com"
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mr-2 text-right">
              كلمة المرور
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-right"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
            ) : (
              isLogin ? 'دخول للنظام' : 'بدء مرحلة التعارف الرقمي'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-50">
          <p className="text-[10px] text-slate-400 text-center leading-relaxed font-medium">
            MindHub &copy; 2025. Created by <span className="text-indigo-600 font-bold">Abdelhka Guehmam</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthGateway;
