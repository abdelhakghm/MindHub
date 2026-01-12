
'use client';
import dynamic from 'next/dynamic';

// تحميل التطبيق ديناميكياً لضمان عمله في بيئة المتصفح فقط (Client-side)
const App = dynamic(() => import('../App'), { 
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-indigo-600 font-bold">جارِ تشغيل MindHub...</p>
      </div>
    </div>
  )
});

export default function Page() {
  return <App />;
}
