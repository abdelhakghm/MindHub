
import './globals.css';
import { Cairo } from 'next/font/google';

const cairo = Cairo({ subsets: ['arabic', 'latin'] });

export const metadata = {
  title: 'MindHub | رفيقك الذكي',
  description: 'رفيق ذكاء اصطناعي لتطوير الإنتاجية والتعلم',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} bg-slate-50 text-slate-900 overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
