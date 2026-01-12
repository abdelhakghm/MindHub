
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { UserProfile, ChatMessage, LearningModule } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const updateLearningModuleDeclaration: FunctionDeclaration = {
  name: 'updateLearningModule',
  parameters: {
    type: Type.OBJECT,
    description: 'Updates learning progress, adds exercises, or completes a scheduled review session.',
    properties: {
      moduleName: {
        type: Type.STRING,
        description: 'Name of the module (e.g., "Physics", "ميكانيك").',
      },
      completionPercentage: {
        type: Type.NUMBER,
        description: 'New completion percentage (0-100).',
      },
      exercisesDelta: {
        type: Type.NUMBER,
        description: 'Number of exercises to add to current total.',
      },
      isReviewComplete: {
        type: Type.BOOLEAN,
        description: 'True if a scheduled Spaced Repetition review was completed.',
      },
      notes: {
        type: Type.STRING,
        description: 'Contextual notes for the update.',
      },
    },
    required: ['moduleName'],
  },
};

export const getGeminiResponse = async (
  profile: UserProfile, 
  history: ChatMessage[], 
  userInput: string,
  image?: { data: string, mimeType: string }
) => {
  const model = "gemini-3-flash-preview";
  const learningModules: LearningModule[] = JSON.parse(localStorage.getItem('lc_learning_modules') || '[]');
  const now = new Date();
  
  const learningSummary = learningModules.map(m => 
    `- ${m.name}: ${m.completionPercentage}% (تمارين: ${m.exercisesCompleted}/${m.exercisesTotal}). المرحلة: ${m.reviewStage || 0}. المراجعة القادمة: ${m.nextReviewDate ? new Date(m.nextReviewDate).toLocaleDateString() : 'لا يوجد'}. ملخص PDF: ${m.pdfSummaryUrl ? 'متوفر' : 'غير متوفر'}`
  ).join('\n');

  const systemInstruction = `
    أنت "MindHub" - مساعد تعلم ذكي ومخطط تربوي متخصص برمجك "عبد الحق قحمام".
    مهمتك الحالية: العمل كـ "Learning Orchestrator" لتوجيه المستخدم بناءً على بياناته الفعلية.

    سجل التعلم الحالي للمستخدم:
    ${learningSummary}

    قواعد التوجيه (Next Action Logic):
    1. مراجعة التكرار المتباعد: ركز على المهام المستحقة.
    2. استكمال النواقص: اقترح إكمال تمارين في مادة غير مكتملة.
    3. تعميق الفهم: اقترح شرح المادة لتعزيز الحفظ.
    4. تحدث دائماً بصفتك MindHub وكن ذكياً ومحفزاً بأسلوب إنساني راقٍ.
  `;

  const contents = history.slice(-10).map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  const currentParts: any[] = [{ text: userInput }];
  if (image) {
    currentParts.push({ inlineData: { data: image.data, mimeType: image.mimeType } });
  }
  contents.push({ role: 'user', parts: currentParts });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: contents.flatMap(c => c.parts) },
      config: { 
        systemInstruction, 
        temperature: 0.7,
        tools: [{ functionDeclarations: [updateLearningModuleDeclaration] }]
      }
    });

    if (response.functionCalls) {
      for (const call of response.functionCalls) {
        if (call.name === 'updateLearningModule') {
          const { moduleName, completionPercentage, exercisesDelta, isReviewComplete, notes } = call.args as any;
          updateModuleLocally(moduleName, completionPercentage, exercisesDelta, isReviewComplete, notes);
        }
      }
      
      const secondResponse = await ai.models.generateContent({
          model,
          contents: [...contents.flatMap(c => c.parts), { text: "تم تحديث سجلات التعلم. أخبر المستخدم بالنتيجة والاقتراح القادم بوضوح بأسلوب رفيقك الذكي MindHub." }],
          config: { systemInstruction }
      });
      return secondResponse.text;
    }

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "أنا MindHub، رفيقك معك دائماً. واجهت مشكلة تقنية بسيطة، لكن يمكننا المتابعة.";
  }
};

const updateModuleLocally = (name: string, percentage?: number, delta?: number, isReviewComplete?: boolean, notes?: string) => {
  const saved = localStorage.getItem('lc_learning_modules');
  if (!saved) return;
  
  let modules: LearningModule[] = JSON.parse(saved);
  const searchName = name.toLowerCase();
  const intervals = [0, 2, 5, 10];

  const updated = modules.map(m => {
    if (m.name.toLowerCase().includes(searchName) || searchName.includes(m.name.toLowerCase())) {
      let count = m.exercisesCompleted;
      if (delta) count = Math.min(m.exercisesTotal, m.exercisesCompleted + delta);
      
      let perc = m.completionPercentage;
      if (percentage !== undefined) perc = percentage;
      else if (delta) perc = Math.round((count / m.exercisesTotal) * 100);

      let stage = m.reviewStage || 0;
      let nextDate = m.nextReviewDate;
      const history = m.reviewHistory || [];

      if (perc >= 100 && m.completionPercentage < 100 && stage === 0) {
        stage = 1;
        const d = new Date();
        d.setDate(d.getDate() + intervals[1]);
        nextDate = d.toISOString();
      }

      if (isReviewComplete) {
        history.push({ date: new Date().toISOString(), stage: stage });
        stage = Math.min(4, stage + 1);
        if (stage < 4) {
          const d = new Date();
          d.setDate(d.getDate() + intervals[stage]);
          nextDate = d.toISOString();
        } else {
          nextDate = undefined;
        }
      }

      return {
        ...m,
        exercisesCompleted: count,
        completionPercentage: perc,
        reviewStage: stage,
        nextReviewDate: nextDate,
        reviewHistory: history,
        lastStudied: new Date().toISOString()
      };
    }
    return m;
  });

  localStorage.setItem('lc_learning_modules', JSON.stringify(updated));
  window.dispatchEvent(new Event('storage_update'));
};

export const updateProfileInsights = async (profile: UserProfile, recentMessages: ChatMessage[]) => {
  const model = "gemini-3-flash-preview";
  const prompt = `أنت MindHub. حلل السلوكيات والاحتياجات بناءً على هذه المحادثة: ${JSON.stringify(recentMessages.map(m => m.text))}. أرجع JSON فقط.`;
  try {
    const res = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(res.text || '{"behaviorLogs":[], "adviceFeedback":[]}');
  } catch (e) { return { behaviorLogs: [], adviceFeedback: [] }; }
};

export const generateDailyBriefing = async (profile: UserProfile, stats: { energy: number, sleep: number, quality: number }) => {
  const model = "gemini-3-flash-preview";
  const modules: LearningModule[] = JSON.parse(localStorage.getItem('lc_learning_modules') || '[]');
  const now = new Date();
  const due = modules.filter(m => m.nextReviewDate && new Date(m.nextReviewDate) <= now);
  
  const prompt = `بصفتك MindHub، قدم إيجازاً ذكياً. 
  الطاقة: ${stats.energy}%. 
  المراجعات المستحقة: ${due.map(m => m.name).join('، ')}. 
  قدم نصيحة واحدة محددة بأسلوب محفز جداً.`;
  
  try {
    const res = await ai.models.generateContent({ model, contents: prompt });
    return res.text;
  } catch (e) { return "يوم جديد مع MindHub، فرصة جديدة للتقدم."; }
};
