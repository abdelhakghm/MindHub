
'use client';
import dynamic from 'next/dynamic';

// نستخدم Dynamic Import لتجنب مشاكل الـ SSR مع localStorage والكاميرا
const App = dynamic(() => import('../App'), { ssr: false });

export default function Page() {
  return <App />;
}
