
import React, { useState, useEffect, Suspense } from 'react';
import { UserProfile, ChatMessage, BehaviorLog } from './types';
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
      return {
        ...parsed,
        learningModules: parsed.learningModules || [],
        behaviorLogs: parsed.behaviorLogs || [],
        adviceFeedback: parsed.adviceFeedback || [],
        points: parsed.points || 0
      };
    } catch (e) {
      localStorage.removeItem('lc_profile');
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
    
    // التحديث التلقائي للذكاء الاصطناعي كل 5 رسائل
    if (profile && messages.length > 0 && messages.length % 5 === 0) {
      const evolveCompanion = async () => {
        const insights = await updateProfileInsights(profile, messages.slice(-5));
        if (insights) {
          setProfile(prev => {
            if (!prev) return null;
            return {
              ...prev,
              behaviorLogs: [...(prev.behaviorLogs || []), ...(insights.behaviorLogs || [])].slice(-10),
              adviceFeedback: [...(prev.adviceFeedback || []), ...(insights.adviceFeedback || [])].slice(-20)
            };
          });
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

  if (!user) return <AuthGateway onAuthSuccess={handleAuthSuccess} />;
  if (!profile || !profile.onboarded) return <Onboarding onComplete={handleOnboardingComplete} />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <Sidebar currentView={view} setView={setView} profile={profile} onLogout={handleLogout} />
      
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="px-8 py-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-slate-800">MindHub</h1>
            <p className="text-sm text-slate-500">مرحباً بك، {profile.name}</p>
          </div>
          <button 
            onClick={() => setProfile({ ...profile, examMode: !profile.examMode })}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
              profile.examMode ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            {profile.examMode ? '🔥 وضع الاختبار' : '🛡️ الوضع العادي'}
          </button>
        </header>

        <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <Suspense fallback={<div>جار التحميل...</div>}>
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
