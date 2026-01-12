
import React, { useState, useEffect, useRef } from 'react';

const HealthWellness: React.FC = () => {
  const [sleepHours, setSleepHours] = useState(() => parseFloat(localStorage.getItem('lc_sleep_hours') || '7.5'));
  const [sleepQuality, setSleepQuality] = useState(() => parseInt(localStorage.getItem('lc_sleep_quality') || '7'));
  const [mealLogs, setMealLogs] = useState(() => {
    const saved = localStorage.getItem('lc_meal_logs');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'فطور بروتيني', calories: 450, sugar: 5, caffeine: 0, time: '8:00 AM', status: 'جيد جداً' },
      { id: 2, name: 'قهوة اسبريسو', calories: 5, sugar: 0, caffeine: 80, time: '10:30 AM', status: 'انتبه للكافيين' }
    ];
  });

  const [newMealName, setNewMealName] = useState('');
  const [newMealCals, setNewMealCals] = useState('');
  const [newMealSugar, setNewMealSugar] = useState('');
  const [newMealCaffeine, setNewMealCaffeine] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    localStorage.setItem('lc_meal_logs', JSON.stringify(mealLogs));
  }, [mealLogs]);

  useEffect(() => {
    localStorage.setItem('lc_sleep_hours', sleepHours.toString());
    localStorage.setItem('lc_sleep_quality', sleepQuality.toString());
  }, [sleepHours, sleepQuality]);

  const totals = mealLogs.reduce((acc: any, curr: any) => ({
    calories: acc.calories + (curr.calories || 0),
    sugar: acc.sugar + (curr.sugar || 0),
    caffeine: acc.caffeine + (curr.caffeine || 0),
  }), { calories: 0, sugar: 0, caffeine: 0 });

  const energyScore = (() => {
    const hScore = Math.min(sleepHours / 8, 1) * 35;
    const qScore = (sleepQuality / 10) * 35;
    const nutritionScore = Math.max(0, 30 - (totals.sugar / 10) - (totals.caffeine > 300 ? 10 : 0));
    return Math.round(hScore + qScore + nutritionScore);
  })();

  const getActivityRecommendation = () => {
    if (energyScore < 40) return { title: "راحة نشطة فقط", desc: "طاقتك منخفضة جداً. تجنب التمارين المجهدة. اقترح تمدداً لمدة 5 دقائق أو تنفساً عميقاً.", icon: "🧘‍♂️", color: "bg-slate-50 border-slate-200 text-slate-700" };
    if (energyScore < 65) return { title: "حركة خفيفة (15 دقيقة)", desc: "طاقتك متوسطة. مشي سريع لمسافة قصيرة سيعيد تنشيط دورتك الدموية دون إرهاق جهازك العصبي.", icon: "🚶‍♂️", color: "bg-blue-50 border-blue-100 text-blue-800" };
    if (totals.sugar > 40) return { title: "تفريغ السكر (مكثف قصير)", desc: "بسبب استهلاك السكر العالي، ننصح بـ 7 دقائق من القفز أو تمرين سريع لحرق الجلوكوز ومنع خمول السكر.", icon: "⚡", color: "bg-pink-50 border-pink-100 text-pink-800" };
    return { title: "جلسة قوة أو كارديو", desc: "طاقتك ممتازة! وقت مثالي لجلسة تمرين كاملة أو مشي طويل.", icon: "💪", color: "bg-emerald-50 border-emerald-100 text-emerald-800" };
  };

  const recommendation = getActivityRecommendation();

  const addMeal = () => {
    if (!newMealName.trim()) return;
    const newMeal = {
      id: Date.now(),
      name: newMealName,
      calories: parseInt(newMealCals) || 0,
      sugar: parseInt(newMealSugar) || 0,
      caffeine: parseInt(newMealCaffeine) || 0,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'تم الإضافة'
    };
    setMealLogs([newMeal, ...mealLogs]);
    setNewMealName('');
    setNewMealCals('');
    setNewMealSugar('');
    setNewMealCaffeine('');
    setShowAdd(false);
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("تعذر الوصول للكاميرا");
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      setNewMealName('وجبة تم تحليلها (صورة)');
      setNewMealCals('480');
      setNewMealSugar('8');
      setNewMealCaffeine('0');
      stopCamera();
      setShowAdd(true);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCameraActive(false);
  };

  const removeMeal = (id: number) => {
    setMealLogs(mealLogs.filter((m: any) => m.id !== id));
  };

  return (
    <div className="space-y-6" dir="rtl">
      {isCameraActive && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover" />
          <div className="p-8 flex justify-between items-center bg-black/50 backdrop-blur-md">
            <button onClick={stopCamera} className="text-white font-bold px-4 py-2 bg-white/10 rounded-xl">إلغاء</button>
            <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full border-8 border-slate-400/50 shadow-2xl active:scale-90 transition-transform"></button>
            <div className="w-10"></div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Bio-Performance Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-8 rounded-[2.5rem] text-white shadow-xl flex items-center justify-between">
        <div className="max-w-xl">
          <h3 className="text-2xl font-black mb-2 flex items-center gap-3">
             <span className="p-2 bg-white/20 rounded-lg">🧬</span>
             مؤشر الأداء الحيوي: {energyScore}%
          </h3>
          <p className="text-sm opacity-90 leading-relaxed">
            طاقتك اليوم تتأثر بـ {sleepHours} ساعات نوم ونسبة سكر {totals.sugar > 40 ? 'مرتفعة' : 'مستقرة'}. 
            {energyScore < 50 ? ' ركز على المهام الروتينية اليوم، دماغك يحتاج وقتاً للتعافي.' : ' قدرتك على التعلم العميق في ذروتها الآن.'}
          </p>
        </div>
        <div className="hidden md:block text-6xl opacity-30">🧠</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Adaptive Activity Recommendation */}
        <div className={`lg:col-span-2 p-8 rounded-[2.5rem] border shadow-sm flex flex-col md:flex-row gap-6 items-center ${recommendation.color}`}>
          <div className="text-6xl">{recommendation.icon}</div>
          <div className="flex-1 text-center md:text-right">
             <h4 className="text-xl font-black mb-2">توصية النشاط المتكيفة</h4>
             <p className="text-sm font-bold mb-1">{recommendation.title}</p>
             <p className="text-xs opacity-80 leading-relaxed">{recommendation.desc}</p>
          </div>
          <button className="px-8 py-3 bg-white/20 hover:bg-white/40 border border-white/30 rounded-2xl text-sm font-black transition-all">تم التنفيذ</button>
        </div>

        {/* Metabolic Summary */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4 text-center">المقاييس الحيوية</h4>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-[11px] font-bold mb-1">
                <span className="text-slate-500">مستوى السكر</span>
                <span className={totals.sugar > 40 ? 'text-red-500' : 'text-emerald-500'}>{totals.sugar} غم</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500" style={{ width: `${Math.min(100, (totals.sugar / 60) * 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] font-bold mb-1">
                <span className="text-slate-500">ضغط الكافيين</span>
                <span className={totals.caffeine > 300 ? 'text-amber-600' : 'text-indigo-600'}>{totals.caffeine} ملغ</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, (totals.caffeine / 400) * 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sleep & Recovery Tracker */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">جودة الاستشفاء 😴</h3>
            <div className="flex gap-2">
               <button onClick={() => setSleepHours(Math.max(0, sleepHours - 0.5))} className="w-8 h-8 bg-slate-50 rounded-lg font-bold hover:bg-slate-100 transition-colors">-</button>
               <button onClick={() => setSleepHours(sleepHours + 0.5)} className="w-8 h-8 bg-slate-50 rounded-lg font-bold hover:bg-slate-100 transition-colors">+</button>
            </div>
          </div>
          
          <div className="flex items-end gap-6 mb-8">
            <div className="flex-1">
               <p className="text-4xl font-black text-slate-800">{sleepHours}<span className="text-sm font-medium text-slate-400 mr-2">ساعة</span></p>
               <p className="text-[10px] text-indigo-600 font-bold mt-1">
                 {sleepHours < 7 ? '⚠️ تحت الحد المثالي للتعلم' : '✅ وقت كافٍ لتثبيت الذاكرة'}
               </p>
            </div>
            <div className="flex-1">
               <p className="text-xs text-slate-400 font-bold mb-2">جودة النوم ({sleepQuality}/10)</p>
               <input 
                 type="range" min="1" max="10" 
                 value={sleepQuality} 
                 onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                 className="w-full accent-indigo-600"
               />
            </div>
          </div>

          <div className="p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100/50">
            <h5 className="text-xs font-bold text-indigo-700 mb-2">💡 نصيحة للإنتاجية الليلة:</h5>
            <p className="text-[10px] text-indigo-800 leading-relaxed">
              بناءً على نشاطك وتغذيتك، يفضل التوقف عن المذاكرة في الساعة <span className="font-black">9:30 مساءً</span> لضمان دورة نوم كاملة تبدأ في الـ 11.
            </p>
          </div>
        </div>

        {/* Smart Nutrition Logger */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">سجل التغذية والكافيين</h3>
            <div className="flex gap-2">
              <button onClick={startCamera} className="p-3 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-all">📷</button>
              <button onClick={() => setShowAdd(!showAdd)} className="p-3 bg-indigo-600 text-white rounded-full hover:rotate-90 transition-all shadow-lg shadow-indigo-100">
                {showAdd ? '✕' : '+'}
              </button>
            </div>
          </div>

          {showAdd && (
            <div className="mb-6 p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 animate-in fade-in zoom-in duration-300">
              <input 
                type="text" value={newMealName} onChange={(e) => setNewMealName(e.target.value)}
                placeholder="اسم الوجبة (مثلاً: قهوة سوداء)"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <div className="grid grid-cols-3 gap-2">
                <input type="number" value={newMealCals} onChange={(e) => setNewMealCals(e.target.value)} placeholder="سعرة" className="bg-white border border-slate-200 rounded-xl px-2 py-3 text-xs focus:outline-none text-center" />
                <input type="number" value={newMealSugar} onChange={(e) => setNewMealSugar(e.target.value)} placeholder="سكر (غم)" className="bg-white border border-slate-200 rounded-xl px-2 py-3 text-xs focus:outline-none text-center" />
                <input type="number" value={newMealCaffeine} onChange={(e) => setNewMealCaffeine(e.target.value)} placeholder="كافيين (ملغ)" className="bg-white border border-slate-200 rounded-xl px-2 py-3 text-xs focus:outline-none text-center" />
              </div>
              <button onClick={addMeal} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">تسجيل وتحليل التأثير الحيوى</button>
            </div>
          )}

          <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
            {mealLogs.length === 0 ? (
              <div className="text-center py-10 opacity-30">لا توجد سجلات اليوم</div>
            ) : (
              mealLogs.map((meal: any) => (
                <div key={meal.id} className="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all hover:shadow-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{meal.caffeine > 0 ? '☕' : meal.sugar > 10 ? '🍩' : '🥗'}</span>
                    <div>
                      <h5 className="font-bold text-sm text-slate-800">{meal.name}</h5>
                      <div className="flex gap-2 text-[10px] text-slate-400 font-medium">
                        <span>{meal.calories} سعرة</span>
                        {meal.sugar > 0 && <span className="text-pink-500">{meal.sugar}غم سكر</span>}
                        {meal.caffeine > 0 && <span className="text-amber-600">{meal.caffeine}ملغ كافيين</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeMeal(meal.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 p-2 transition-opacity">✕</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthWellness;
