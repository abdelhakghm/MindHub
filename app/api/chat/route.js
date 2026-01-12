
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { message, history, profile, type, imageData } = await req.json();

    // استدعاء المفتاح من بيئة الخادم لضمان الأمان القصوى
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key is missing on server environment." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // تعليمات النظام المخصصة لـ MindHub لبناء شخصية ذكية وداعمة
    const systemInstruction = type === 'insight' 
      ? "You are MindHub Behavioral Analyst. Analyze the provided logs and return ONLY a valid JSON object containing patterns, progress, and behavioral feedback."
      : `أنت "MindHub" - رفيق ذكاء اصطناعي ذكي، محفز، وعميق التفكير. المستخدم هو ${profile?.name || 'صديقي'}. أهداف المستخدم الحالية: ${profile?.goals?.join(', ') || 'تطوير الذات'}. أجب دائماً باللغة العربية بأسلوب راقٍ، ملهم، ومختصر قدر الإمكان.`;

    const modelName = 'gemini-3-flash-preview';

    // بناء الأجزاء (Parts) للرسالة الحالية - تدعم النص والصورة
    const currentParts = [];
    if (message) currentParts.push({ text: message });
    
    if (imageData && imageData.data) {
      currentParts.push({
        inlineData: {
          data: imageData.data,
          mimeType: imageData.mimeType || 'image/jpeg'
        }
      });
    }

    // إذا لم يكن هناك نص ولا صورة، نرسل طلباً افتراضياً
    if (currentParts.length === 0) currentParts.push({ text: "مرحباً MindHub" });

    // تحويل سجل المحادثة إلى الصيغة التي يفهمها Gemini
    const contents = (history || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // إضافة الطلب الحالي للسجل
    contents.push({ role: 'user', parts: currentParts });

    const result = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction,
        responseMimeType: type === 'insight' ? "application/json" : "text/plain",
        temperature: 0.7,
      }
    });

    const reply = result.text;
    return NextResponse.json({ reply });

  } catch (error) {
    console.error("Gemini Backend Error:", error);
    return NextResponse.json({ 
      error: "فشل في معالجة الطلب عبر MindHub AI.",
      details: error.message 
    }, { status: 500 });
  }
}
