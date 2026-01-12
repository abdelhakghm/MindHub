
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UserProfile } from '../types';
import { getGeminiResponse } from '../services/geminiService';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  profile: UserProfile;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, addMessage, profile }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const currentInput = input;
    const currentImage = selectedImage;

    // إضافة رسالة المستخدم للواجهة
    const userMsg: ChatMessage = { 
      role: 'user', 
      text: currentInput, 
      timestamp: new Date(),
      image: currentImage || undefined
    };
    
    addMessage(userMsg);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      let imageData = undefined;
      if (currentImage) {
        // استخراج بيانات الـ Base64 فقط بدون الترويسة
        imageData = { data: currentImage.split(',')[1], mimeType: 'image/jpeg' };
      }

      const aiText = await getGeminiResponse(profile, messages, currentInput, imageData);
      addMessage({ role: 'model', text: aiText, timestamp: new Date() });
    } catch (error) {
      addMessage({ role: 'model', text: "عذراً، حدث خطأ في الاتصال. تأكد من إعدادات API Key في Vercel.", timestamp: new Date() });
    } finally {
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("تعذر الوصول للكاميرا. يرجى منح الأذونات اللازمة.");
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
      setSelectedImage(dataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCameraActive(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden relative" dir="rtl">
      {isCameraActive && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col">
          <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover" />
          <div className="p-8 flex justify-between items-center bg-black/50 backdrop-blur-md">
            <button onClick={stopCamera} className="text-white font-bold bg-white/10 px-4 py-2 rounded-xl">إلغاء</button>
            <button onClick={capturePhoto} className="w-16 h-16 bg-white rounded-full border-4 border-slate-400 shadow-xl active:scale-90 transition-transform"></button>
            <div className="w-10"></div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/30 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-[2rem] px-5 py-4 text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
            }`}>
              {msg.image && <img src={msg.image} className="mb-3 rounded-xl max-h-48 w-full object-cover border border-white/20" alt="سياق بصري" />}
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 rounded-2xl px-4 py-2 flex gap-1 animate-pulse shadow-sm">
              <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        {selectedImage && (
          <div className="mb-4 relative inline-block animate-in zoom-in duration-300">
            <img src={selectedImage} alt="صورة ملتقطة" className="h-24 w-24 object-cover rounded-2xl border-2 border-indigo-600 shadow-md" />
            <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg">✕</button>
          </div>
        )}
        <div className="flex gap-3 items-center">
          <button onClick={startCamera} className="p-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 border border-slate-200 transition-colors" title="التقط صورة للوجبة أو الكتاب">
            📷
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اسألني عن يومك، وجبتك، أو دراستك..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-right"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 disabled:opacity-50 active:scale-95 transition-all"
          >
            🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
