
import React, { useState, useEffect } from 'react';
import { UserProfile, WeeklyChallenge } from '../types';
import { generateDailyBriefing } from '../services/geminiService';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from 'recharts';

interface DashboardProps {
  profile: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>(() => {
    const saved = localStorage.getItem('lc_weekly_challenges');
    return saved ? JSON.parse(saved) : [
      { id: 'c1', title: 'ثبات النوم', targetCount: 5, currentCount: 3, category: 'health', points: 50, description: 'الحصول على 7 ساعات نوم لمدة 5 أيام.' },
      { id: 'c2', title: 'جلسات التركيز', targetCount: 10, currentCount: 7, category: 'productivity', points: 40, description: 'إكمال 10 جلسات دراسية عميقة.' },
      { id: 'c3', title: 'التواصل العائلي', targetCount: 3, currentCount: 1, category: 'social', points: 30, description: 'إجراء 3 محادثات مطولة مع المقربين.' }
    ];
  });

  const sleepHours = parseFloat(localStorage.getItem('lc_sleep_hours') || '7.5');
  const sleepQuality = parseInt(localStorage.getItem('lc_sleep_quality') || '7');
  const mealLogs = JSON.parse(localStorage.getItem('lc_meal_logs') || '[]');
  const totalSugar = mealLogs.reduce((acc: number, curr: any) => acc + (curr.sugar || 0), 0);
  
  const energyScore = Math.round((Math.min(sleepHours / 8, 1) * 40) + ((sleepQuality / 10) * 40) + 20);
  const currentHour = new Date().getHours();

  const getTodayPriority = () => {
    if (profile.examMode) return { type: 'STUDY', label: 'وضع الاختبار القصوى', icon: '🚨', color: 'bg-red-600', priority: 1 };
    if (energyScore < 45) return { type: 'REST', label: 'الأولوية: التعافي الحيوي', icon: '🛌', color: 'bg-amber-600', priority: 1 };
    if (currentHour < 12 && energyScore > 60) return { type: 'DEEP_WORK', label: 'وقت الإنجاز العميق', icon: '⚡', color: 'bg-indigo-600', priority: 2 };
    if (totalSugar > 45) return { type: 'METABOLIC', label: 'تنبيه: استقرار الأيض', icon: '🥗', color: 'bg-pink-600', priority: 2 };
    return { type: 'BALANCE', label: 'يوم متوازن ومستقر', icon: '🌟', color: 'bg-emerald-600', priority: 3 };
  };

  const priority = getTodayPriority();

  useEffect(() => {
    localStorage.setItem('lc_weekly_challenges', JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    const fetchBriefing = async () => {
      setLoading(true);
      const text = await generateDailyBriefing(profile, { energy: energyScore, sleep: sleepHours, quality: sleepQuality });
      setBriefing(text);
      setLoading(false);
    };
    fetchBriefing();
  }, [profile, sleepHours, sleepQuality]);

  const incrementChallenge = (id: string) => {
    setChallenges(prev => prev.map(c => {
      if (c.id === id && c.currentCount < c.targetCount) {
        return { ...c, currentCount: c.currentCount + 1 };
      }
      return c;
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500" dir="rtl">
      
      {/* Priority Highlight: Primary focus for today */}
      <div className={`lg:col-span-12 p-8 rounded-[3rem] text-white shadow-2xl flex flex-col md:flex-row justify-between items-center transition-all ${priority.color}`}>
        <div className="flex items-center gap-6">
          <div className="text-5xl bg-white/20 p-5 rounded-3xl backdrop-blur-md animate-bounce">{priority.icon}</div>
          <div>
            <h2 className="text-3xl font-black mb-1">{priority.label}</h2>
            <p className="text-sm opacity-90 max-w-xl font-medium">
              {priority.type === 'REST' && 'طاقتك حرجة. ركز فقط على النوم، شرب الماء، والمهام الروتينية جداً.'}
              {priority.type === 'STUDY' && 'أنت في ذروة الاستعداد للاختبار. اليوم نركز على المراجعة النشطة والحل العملي.'}
              {priority.type === 'DEEP_WORK' && 'هذا هو وقتك الذهبي. ابدأ بالمهمة الأكثر تعقيداً الآن قبل تشتت الانتباه.'}
              {priority.type === 'METABOLIC' && 'نسبة السكر مرتفعة، مما قد يسبب خمولاً لاحقاً. تحرك لـ 10 دقائق فوراً.'}
              {priority.type === 'BALANCE' && 'يوم مثالي للتقدم في كافة الجوانب: دراسة، صحة، وعلاقات.'}
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 px-6 py-3 bg-white/10 rounded-2xl border border-white/20 flex flex-col items-center backdrop-blur-md">
          <span className="text-[10px] uppercase font-bold opacity-60">مؤشر النظام</span>
          <span className="text-2xl font-black">{energyScore}%</span>
        </div>
      </div>

      <div className="lg:col-span-8 space-y-6">
        {/* Intelligence Briefing Module */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600">🤖</span> الإيجاز الذكي المخصص
          </h3>
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              <div className="h-24 bg-slate-50 rounded w-full"></div>
            </div>
          ) : (
            <div className="prose prose-indigo prose-sm max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
              {briefing}
            </div>
          )}
        </div>

        {/* Energy Chart: Automatically hide if energy is too low to avoid stress */}
        {energyScore >= 45 && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm animate-in slide-in-from-bottom-4">
            <h3 className="text-lg font-bold text-slate-800 mb-8">اتجاه تدفق الإنتاجية 📈</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { day: 'سبت', focus: 60 }, { day: 'أحد', focus: 85 }, 
                  { day: 'اثنين', focus: 45 }, { day: 'ثلاثاء', focus: 90 }, 
                  { day: 'أربعاء', focus: 75 }
                ]}>
                  <defs>
                    <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Area type="monotone" dataKey="focus" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorFocus)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-4 space-y-6">
        {/* Weekly Progress Module */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
          <h3 className="text-lg font-bold mb-6 flex justify-between items-center">
            <span>تحديات الأسبوع</span>
            <span className="text-[10px] font-bold text-indigo-400">التحديث القادم: الأحد</span>
          </h3>
          <div className="space-y-6">
            {challenges.filter(c => priority.type === 'REST' ? c.category === 'health' : true).map(challenge => {
              const isComplete = challenge.currentCount >= challenge.targetCount;
              return (
                <div key={challenge.id} className="relative">
                  <div className="flex justify-between text-[11px] mb-2 font-bold">
                    <span className="opacity-70">{challenge.title}</span>
                    <span className={isComplete ? 'text-emerald-400' : 'text-indigo-400'}>{challenge.currentCount}/{challenge.targetCount}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div className={`h-full transition-all duration-1000 ${isComplete ? 'bg-emerald-400' : 'bg-indigo-500'}`} style={{ width: `${(challenge.currentCount/challenge.targetCount)*100}%` }}></div>
                  </div>
                  {!isComplete && (
                    <button 
                      onClick={() => incrementChallenge(challenge.id)}
                      className="text-[9px] bg-white/5 hover:bg-white/20 px-3 py-1 rounded-lg transition-all"
                    >
                      + تسجيل إنجاز
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Social Opportunity Module: Only visible if energy is HIGH and it's NOT Exam Mode */}
        {energyScore > 75 && !profile.examMode && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm animate-in zoom-in-95 transition-all hover:scale-[1.02]">
             <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><span>🤝</span> فرصة اجتماعية</h4>
             <p className="text-xs text-slate-500 leading-relaxed mb-4">طاقتك الحيوية ممتازة الآن. هذا هو أفضل وقت للتواصل مع المقربين وتجديد الروابط الاجتماعية.</p>
             <button className="w-full py-3 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-black hover:bg-emerald-100 transition-colors">مراجعة قائمة التواصل</button>
          </div>
        )}

        {/* Companion Feedback Logic */}
        <div className={`p-8 rounded-[2.5rem] border transition-all ${priority.type === 'REST' ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
           <div className="flex gap-4 items-start">
             <span className="text-2xl">{priority.type === 'REST' ? '🛌' : '💡'}</span>
             <div>
               <h4 className={`text-xs font-black mb-1 uppercase tracking-wider ${priority.type === 'REST' ? 'text-amber-800' : 'text-slate-800'}`}>رؤية الرفيق اليوم</h4>
               <p className={`text-[10px] leading-relaxed font-medium ${priority.type === 'REST' ? 'text-amber-700/80' : 'text-slate-500'}`}>
                 {priority.type === 'REST' 
                   ? 'تم تقليل الواجهة لعرض الأساسيات فقط. صحتك هي المحرك الأول لكل أهدافك، اعتني بها اليوم.' 
                   : 'كل الأنظمة تعمل بكفاءة. لا تشتت نفسك بمهام جانبية، ركز على الأولوية الموضحة في الأعلى.'}
               </p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
