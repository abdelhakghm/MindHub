
import { UserProfile, ChatMessage } from "../types";

/**
 * وظيفة إرسال الطلبات إلى المسار الخلفي الآمن /api/chat
 */
async function callMindHubAPI(payload: any) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Connection failed');
    }

    return await response.json();
  } catch (error) {
    console.error("Service Call Error:", error);
    throw error;
  }
}

export const getGeminiResponse = async (
  profile: UserProfile, 
  history: ChatMessage[], 
  userInput: string,
  image?: { data: string, mimeType: string }
) => {
  try {
    const data = await callMindHubAPI({
      message: userInput,
      history: history.slice(-6), // إرسال آخر 6 رسائل فقط لتقليل استهلاك الـ Tokens
      profile: { name: profile.name, goals: profile.goals },
      imageData: image,
      type: 'chat'
    });

    return data.reply;
  } catch (error) {
    return "عذراً، MindHub يواجه ضغطاً حالياً. تأكد من إعداد API_KEY في Vercel.";
  }
};

export const updateProfileInsights = async (profile: UserProfile, recentMessages: ChatMessage[]) => {
  try {
    const data = await callMindHubAPI({
      message: `حلل الأنماط السلوكية للرسائل التالية: ${JSON.stringify(recentMessages.map(m => m.text))}`,
      history: [],
      profile: { name: profile.name },
      type: 'insight'
    });

    return data.reply ? JSON.parse(data.reply) : null;
  } catch (e) { 
    return null; 
  }
};

export const generateDailyBriefing = async (profile: UserProfile, stats: any) => {
  try {
    const data = await callMindHubAPI({
      message: `قدم لي إيجازاً صباحياً ملهماً. طاقتي اليوم ${stats.energy}%، ونمت لمدة ${stats.sleep} ساعات بجودة ${stats.quality}/10.`,
      history: [],
      profile: { name: profile.name, goals: profile.goals },
      type: 'chat'
    });

    return data.reply;
  } catch (e) { 
    return "يوم جديد مشرق ينتظرك! تذكر أن كل خطوة صغيرة تقربك من أهدافك."; 
  }
};
