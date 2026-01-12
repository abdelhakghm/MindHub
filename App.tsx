
import React, { useState, useEffect } from 'react';
import { UserProfile, ChatMessage } from './types';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import ProductivityTimer from './components/ProductivityTimer';
import LearningHub from './components/LearningHub';
import HealthWellness from './components/HealthWellness';
import SocialIntelligence from './components/SocialIntelligence';
import AuthGateway from './components/AuthGateway';
import { updateProfileInsights } from './services/geminiService';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null); // Supabase User object
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('lc_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [view, setView] = useState<'dashboard' | 'chat' | 'productivity' | 'learning' | 'health' | 'social'>('dashboard');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('lc_messages');
    return saved ? JSON.parse(saved).map((m: any) => ({...m, timestamp: new Date(m.timestamp)})) : [];
  });

  // Load user from session simulation (would be Supabase auth listener)
  useEffect(() => {
    const savedUser = localStorage.getItem('lc_auth_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (profile) localStorage.setItem('lc_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('lc_messages', JSON.stringify(messages));
    
    if (profile && messages.length > 0 && messages.length % 5 === 0) {
      const evolveCompanion = async () => {
        const insights = await updateProfileInsights(profile, messages.slice(-5));
        setProfile(prev => {
          if (!prev) return null;
          const updateLogs = (old: any[] = [], newly: any[] = []) => {
            const map = new Map(old.map(i => [i.pattern, i]));
            newly.forEach(item => {
              if (map.has(item.pattern)) {
                const existing = map.get(item.pattern);
                map.set(item.pattern, { 
                  ...existing, 
                  occurrences: (existing.occurrences || 1) + 1,
                  lastDetected: new Date().toISOString()
                });
              } else {
                map.set(item.pattern, { ...item, occurrences: 1, lastDetected: new Date().toISOString() });
              }
            });
            return Array.from(map.values()).slice(-10);
          };

          return {
            ...prev,
            behaviorLogs: updateLogs(prev.behaviorLogs, insights.behaviorLogs),
            adviceFeedback: [...(prev.adviceFeedback || []), ...(insights.adviceFeedback || [])].slice(-20),
            interactionCount: (prev.interactionCount || 0) + 1
          };
        });
      };
      evolveCompanion();
    }
  }, [messages]);

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('lc_auth_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lc_auth_user');
  };

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    const initializedProfile: UserProfile = {
      ...newProfile,
      habits: [],
      adviceFeedback: [],
      behaviorLogs: [],
      sessionOutputs: [],
      examMode: false,
      energyPatterns: { peakHours: [9, 10, 11], averageSleepDuration: 7.5 },
      interactionCount: 0,
      points: 100
    };
    setProfile(initializedProfile);
    setView('dashboard');
  };

  // 1. Check if authenticated
  if (!user) {
    return <AuthGateway onAuthSuccess={handleAuthSuccess} />;
  }

  // 2. Check if onboarded
  if (!profile || !profile.onboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar currentView={view} setView={setView} profile={profile} onLogout={handleLogout} />
      
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="px-8 py-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                {view === 'dashboard' && 'اللوحة الرئيسية'}
                {view === 'chat' && 'المدرب الشخصي'}
                {view === 'productivity' && 'استوديو التركيز'}
                {view === 'learning' && 'مركز التعلم الذكي'}
                {view === 'health' && 'الصحة واللياقة'}
                {view === 'social' && 'الذكاء الاجتماعي'}
              </h1>
              <p className="text-sm text-slate-500">أهلاً بك، {profile.name}</p>
            </div>
            
            <button 
              onClick={() => setProfile({ ...profile, examMode: !profile.examMode })}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                profile.examMode 
                ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
                : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-indigo-300'
              }`}
            >
              <span>{profile.examMode ? '🔥 وضع الاختبار' : '🛡️ الوضع العادي'}</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-2xl text-sm font-bold flex items-center gap-2">
              <span>🏆</span> {profile.points || 0}
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
          {view === 'dashboard' && <Dashboard profile={profile} />}
          {view === 'chat' && <ChatInterface messages={messages} addMessage={(m) => setMessages([...messages, m])} profile={profile} />}
          {view === 'productivity' && <ProductivityTimer />}
          {view === 'learning' && <LearningHub profile={profile} />}
          {view === 'health' && <HealthWellness />}
          {view === 'social' && <SocialIntelligence />}
        </div>
      </main>
    </div>
  );
};

export default App;
