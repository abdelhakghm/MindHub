
import React, { useState, useEffect, Suspense } from 'react';
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
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('lc_profile');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      // Ensure essential fields exist to prevent crashes in sub-components
      return {
        ...parsed,
        learningModules: parsed.learningModules || [],
        behaviorLogs: parsed.behaviorLogs || [],
        adviceFeedback: parsed.adviceFeedback || [],
        points: parsed.points || 0
      };
    } catch (e) {
      console.error("Critical: Failed to parse profile", e);
      localStorage.removeItem('lc_profile'); // Clear corrupted data
      return null;
    }
  });

  const [view, setView] = useState<'dashboard' | 'chat' | 'productivity' | 'learning' | 'health' | 'social'>('dashboard');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('lc_messages');
      return saved ? JSON.parse(saved).map((m: any) => ({...m, timestamp: new Date(m.timestamp)})) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('lc_auth_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('lc_auth_user');
      }
    }
  }, []);

  useEffect(() => {
    if (profile) localStorage.setItem('lc_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('lc_messages', JSON.stringify(messages));
    
    // Logic for AI evolution
    if (profile && messages.length > 0 && messages.length % 5 === 0) {
      const evolveCompanion = async () => {
        try {
          const insights = await updateProfileInsights(profile, messages.slice(-5));
          if (!insights) return;
          
          setProfile(prev => {
            if (!prev) return null;
            const oldLogs = prev.behaviorLogs || [];
            const newly = insights.behaviorLogs || [];
            const map = new Map(oldLogs.map((i: any) => [i.pattern, i]));
            
            newly.forEach((item: any) => {
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

            return {
              ...prev,
              behaviorLogs: Array.from(map.values()).slice(-10),
              adviceFeedback: [...(prev.adviceFeedback || []), ...(insights.adviceFeedback || [])].slice(-20),
              interactionCount: (prev.interactionCount || 0) + 1
            };
          });
        } catch (e) {
          console.error("Non-critical: Insight evolution failed", e);
        }
      };
      evolveCompanion();
    }
  }, [messages, profile]);

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('lc_auth_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setProfile(null);
    localStorage.clear();
    window.location.reload();
  };

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setView('dashboard');
  };

  if (!user) {
    return <AuthGateway onAuthSuccess={handleAuthSuccess} />;
  }

  if (!profile || !profile.onboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans" dir="rtl">
      <Sidebar currentView={view} setView={setView} profile={profile} onLogout={handleLogout} />
      
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="px-8 py-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-20 shadow-sm">
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
          <Suspense fallback={<div className="flex items-center justify-center h-full">جارِ التحميل...</div>}>
            {view === 'dashboard' && <Dashboard profile={profile} />}
            {view === 'chat' && <ChatInterface messages={messages} addMessage={(m) => setMessages([...messages, m])} profile={profile} />}
            {view === 'productivity' && <ProductivityTimer />}
            {view === 'learning' && <LearningHub profile={profile} />}
            {view === 'health' && <HealthWellness />}
            {view === 'social' && <SocialIntelligence />}
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default App;
