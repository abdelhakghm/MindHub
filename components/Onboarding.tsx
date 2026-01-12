
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { getGeminiResponse } from '../services/geminiService';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "مرحباً بك في MindHub. أنا هنا لأكون شريكك في تطوير حياتك. لكي أبدأ، ما هو اسمك؟ وما هي أكبر ثلاثة أهداف تود تحقيقها حالياً؟",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    if (messages.length > 5) {
      const finalProfile: UserProfile = {
        name: messages.find(m => m.role === 'user')?.text || 'مستخدم',
        goals: [input],
        challenges: [],
        focusAreas: ['General'],
        onboarded: true,
        points: 100,
        habits: [],
        adviceFeedback: [],
        behaviorLogs: [],
        sessionOutputs: [],
        examMode: false,
        energyPatterns: { peakHours: [9, 10, 11], averageSleepDuration: 7.5 },
        interactionCount: 0
      };
      setTimeout(() => onComplete(finalProfile), 1000);
      return;
    }

    const response = await getGeminiResponse(
      { 
        name: '', 
        goals: [], 
        challenges: [], 
        focusAreas: [], 
        onboarded: false, 
        points: 0, 
        habits: [], 
        adviceFeedback: [],
        behaviorLogs: [],
        sessionOutputs: [],
        examMode: false,
        interactionCount: 0, 
        energyPatterns: { peakHours: [], averageSleepDuration: 0 } 
      },
      messages,
      input + " (أجب باختصار واطلب معلومة إضافية عن روتينك اليومي أو ما يعيقك حالياً)"
    );

    setMessages(prev => [...prev, { role: 'model', text: response, timestamp: new Date() }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col font-sans" dir="rtl">
      <header className="p-6 bg-white border-b border-slate-200 flex items-center gap-4">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">M</div>
        <div>
          <h1 className="text-lg font-black text-slate-800">MindHub</h1>
          <p className="text-xs text-slate-400">بدء مرحلة التعارف الرقمي</p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' 
                : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-sm'
            }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 flex gap-1 animate-pulse">
              <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اكتب ردك هنا..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSend}
            className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all"
          >
            <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
