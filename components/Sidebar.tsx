
import React from 'react';
import { UserProfile } from '../types';

interface SidebarProps {
  currentView: 'dashboard' | 'chat' | 'productivity' | 'learning' | 'health' | 'social';
  setView: (view: any) => void;
  profile: UserProfile;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, profile, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: '🏠' },
    { id: 'chat', label: 'المدرب AI', icon: '🤖' },
    { id: 'productivity', label: 'التركيز', icon: '⚡' },
    { id: 'learning', label: 'التعلم', icon: '📚' },
    { id: 'health', label: 'الصحة', icon: '🍏' },
    { id: 'social', label: 'العلاقات', icon: '🤝' },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-lg">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-indigo-200 shadow-lg">M</div>
          <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tighter">
            MindHub
          </span>
        </div>
        <p className="text-[10px] font-bold text-slate-300 mr-14 mb-8 text-right italic">By Abdelhka Guehmam</p>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                currentView === item.id
                  ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-md'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-100 flex flex-col gap-4">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-indigo-700 font-bold text-sm">
            {profile.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-800 truncate">{profile.name}</p>
            <p className="text-[10px] text-slate-400 font-medium">مستوى الرفيق: ذهبي</p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="text-center text-[10px] font-black text-red-400 hover:text-red-600 transition-colors py-2 uppercase tracking-widest"
        >
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
