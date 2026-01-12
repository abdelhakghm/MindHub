
import React, { useState, useEffect } from 'react';
import { UserProfile, LearningModule } from '../types';

interface LearningHubProps {
  profile: UserProfile;
}

const LearningHub: React.FC<LearningHubProps> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState<'theory' | 'skills' | 'modules'>('modules');
  
  const loadModules = (): LearningModule[] => {
    const saved = localStorage.getItem('lc_learning_modules');
    return saved ? JSON.parse(saved) : [
      { id: 'm1', name: 'ميكانيك', description: 'أساسيات الحركة والقوى والنيوتن', completionPercentage: 45, exercisesCompleted: 12, exercisesTotal: 30, lastStudied: new Date().toISOString(), reviewStage: 0, reviewHistory: [] },
      { id: 'm2', name: 'MR', description: 'دراسة الرنين المغناطيسي وتطبيقاته', completionPercentage: 10, exercisesCompleted: 2, exercisesTotal: 25, lastStudied: new Date().toISOString(), reviewStage: 0, reviewHistory: [] }
    ];
  };

  const [modules, setModules] = useState<LearningModule[]>(loadModules);

  useEffect(() => {
    const handleSync = () => setModules(loadModules());
    window.addEventListener('storage_update', handleSync);
    return () => window.removeEventListener('storage_update', handleSync);
  }, []);

  const [showAddModule, setShowAddModule] = useState(false);
  const [newModule, setNewModule] = useState({ name: '', description: '', total: 20 });

  const addModule = () => {
    if (!newModule.name.trim()) return;
    const module: LearningModule = {
      id: Date.now().toString(),
      name: newModule.name,
      description: newModule.description,
      completionPercentage: 0,
      exercisesCompleted: 0,
      exercisesTotal: newModule.total || 20,
      lastStudied: new Date().toISOString(),
      reviewStage: 0,
      reviewHistory: []
    };
    const updated = [...modules, module];
    setModules(updated);
    localStorage.setItem('lc_learning_modules', JSON.stringify(updated));
    setNewModule({ name: '', description: '', total: 20 });
    setShowAddModule(false);
  };

  const handleFileUpload = (moduleId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate linkage in a SQL-like storage system
      const fakeUrl = `supabase://summaries/${moduleId}/${file.name}`;
      const updated = modules.map(m => {
        if (m.id === moduleId) return { ...m, pdfSummaryUrl: fakeUrl };
        return m;
      });
      setModules(updated);
      localStorage.setItem('lc_learning_modules', JSON.stringify(updated));
      alert(`تم ربط ملف ${file.name} بالمادة. سيتمكن الرفيق AI من الإشارة إليه في المراجعات القادمة.`);
    }
  };

  const updateExercise = (id: string, increment: boolean) => {
    const updated = modules.map(m => {
      if (m.id === id) {
        const newCount = increment ? Math.min(m.exercisesTotal, m.exercisesCompleted + 1) : Math.max(0, m.exercisesCompleted - 1);
        const newPerc = Math.round((newCount / m.exercisesTotal) * 100);
        
        let reviewStage = m.reviewStage || 0;
        let nextDate = m.nextReviewDate;

        // Auto-start SR if just completed to 100%
        if (newPerc >= 100 && m.completionPercentage < 100 && reviewStage === 0) {
          reviewStage = 1;
          const d = new Date();
          d.setDate(d.getDate() + 2);
          nextDate = d.toISOString();
        }

        return {
          ...m,
          exercisesCompleted: newCount,
          completionPercentage: newPerc,
          reviewStage,
          nextReviewDate: nextDate,
          lastStudied: new Date().toISOString()
        };
      }
      return m;
    });
    setModules(updated);
    localStorage.setItem('lc_learning_modules', JSON.stringify(updated));
  };

  const isDue = (date?: string) => date ? new Date(date) <= new Date() : false;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex bg-white p-2 rounded-3xl border border-slate-200 shadow-sm w-fit">
        <button onClick={() => setActiveTab('modules')} className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'modules' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-500'}`}>الموديولات التعليمية</button>
        <button onClick={() => setActiveTab('theory')} className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'theory' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-500'}`}>الذكاء الدراسي</button>
      </div>

      {activeTab === 'modules' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div>
              <h3 className="text-xl font-black text-slate-800">إدارة المواد والملخصات</h3>
              <p className="text-xs text-slate-400">ارفع ملخصات PDF لتفعيل المراجعة المتباعدة المتقدمة</p>
            </div>
            <button onClick={() => setShowAddModule(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
              + مادة جديدة
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map(module => {
              const due = isDue(module.nextReviewDate);
              return (
                <div key={module.id} className={`bg-white p-8 rounded-[2.5rem] border shadow-sm transition-all ${due ? 'border-amber-400 ring-4 ring-amber-50 shadow-amber-50' : 'border-slate-100'}`}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-2xl font-black text-slate-800">{module.name}</h4>
                        {module.reviewStage > 0 && (
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${module.reviewStage === 4 ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            {module.reviewStage === 4 ? 'متقن ✨' : `مرحلة ${module.reviewStage}`}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-medium line-clamp-1">{module.description}</p>
                    </div>
                    <div className="text-left ml-4">
                      <span className="text-3xl font-black text-indigo-600">{module.completionPercentage}%</span>
                    </div>
                  </div>

                  {due && (
                    <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3 animate-pulse">
                      <span className="text-xl">🎓</span>
                      <div className="text-xs text-amber-900 font-bold leading-snug">
                        {module.pdfSummaryUrl ? 'وقت المراجعة! الملخص المرفوع بانتظارك، ابدأ القراءة الآن.' : 'مراجعة مستحقة! سجل تقدمك مع الرفيق AI فور الانتهاء.'}
                      </div>
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-2">
                        <span>إكمال التمارين</span>
                        <span>{module.exercisesCompleted} / {module.exercisesTotal}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${module.completionPercentage}%` }}></div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => updateExercise(module.id, true)} className="flex-1 py-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors">تمرين +</button>
                      <button onClick={() => updateExercise(module.id, false)} className="px-4 py-3 bg-slate-50 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100">-</button>
                    </div>

                    <div className="pt-5 border-t border-slate-50 flex items-center justify-between">
                      <label className={`cursor-pointer flex items-center gap-2 text-[10px] font-bold transition-all ${module.pdfSummaryUrl ? 'text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg' : 'text-slate-400 hover:text-indigo-500'}`}>
                        <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleFileUpload(module.id, e)} />
                        <span>{module.pdfSummaryUrl ? '✅ الملخص جاهز' : '📄 رفع ملخص PDF'}</span>
                      </label>
                      <div className="text-right">
                        <span className={`text-[9px] block font-black uppercase tracking-tighter ${due ? 'text-amber-600 animate-bounce' : 'text-slate-300'}`}>
                          {module.nextReviewDate ? `المراجعة: ${new Date(module.nextReviewDate).toLocaleDateString('ar-EG')}` : 'لم تبدأ المراجعة'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'theory' && (
         <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center animate-in fade-in slide-in-from-top-4">
           <div className="text-5xl mb-6">🧠</div>
           <h3 className="text-lg font-bold text-slate-800 mb-2">محرك المراجعة المتباعدة الذكي</h3>
           <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">أقوم بتحليل تاريخ دراستك وجدولة المراجعات تلقائياً. المراجعة الأولى بعد يومين، ثم 5 أيام، ثم 10 أيام لضمان ثبات المعلومات في ذاكرتك طويلة المدى.</p>
         </div>
      )}
    </div>
  );
};

export default LearningHub;
