
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { message, history, profile, type, imageData } = await req.json();

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API_KEY in server environment" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = type === 'insight' 
      ? "Analyze behaviors and return valid JSON with keys: behaviorLogs, adviceFeedback."
      : `أنت "MindHub" رفيق ذكاء اصطناعي ذكي. المستخدم هو ${profile?.name || 'صديقي'}. أجب بالعربية دائماً.`;

    const modelName = 'gemini-3-flash-preview';

    const currentParts = [];
    if (message) currentParts.push({ text: message });
    if (imageData?.data) {
      currentParts.push({
        inlineData: {
          data: imageData.data,
          mimeType: imageData.mimeType || 'image/jpeg'
        }
      });
    }

    if (currentParts.length === 0) currentParts.push({ text: "مرحباً" });

    const contents = (history || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    contents.push({ role: 'user', parts: currentParts });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction,
        responseMimeType: type === 'insight' ? "application/json" : "text/plain",
      }
    });

    return NextResponse.json({ reply: response.text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
