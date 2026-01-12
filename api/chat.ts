
import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: 'edge', // استخدام Edge Runtime لأداء أسرع في Vercel
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { profile, history, userInput, type } = await req.json();

    // تأكد من وجود مفتاح API في متغيرات البيئة بـ Vercel
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = ai.models.getGenerativeModel({ 
      model: 'gemini-3-flash-preview',
      systemInstruction: type === 'insight' 
        ? "حلل سلوك المستخدم بناءً على الرسائل وقدم النتيجة بتنسيق JSON فقط."
        : `أنت "MindHub" - رفيق ذكاء اصطناعي ذكي ومحفز. المستخدم هو ${profile?.name}. أهداف المستخدم: ${profile?.goals?.join(', ')}. رد دائماً باللغة العربية بأسلوب ذكي وبسيط.`
    });

    // تحويل التاريخ من الصيغة المرسلة إلى صيغة Gemini
    const contents = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    contents.push({ role: 'user', parts: [{ text: userInput }] });

    const result = await model.generateContent({
      contents,
      generationConfig: {
        responseMimeType: type === 'insight' ? "application/json" : "text/plain",
      }
    });

    const responseText = result.response.text();

    return new Response(JSON.stringify({ text: responseText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('API Route Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
  }
}
