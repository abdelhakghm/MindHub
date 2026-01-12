
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Critical: Could not find root element.");
  } else {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
} catch (error) {
  console.error("Mounting error:", error);
  document.body.innerHTML = `<div style="padding: 20px; text-align: center; font-family: sans-serif;">
    <h2>فشل تحميل التطبيق</h2>
    <p>يرجى التحقق من مفتاح API أو تحديث الصفحة.</p>
  </div>`;
}
