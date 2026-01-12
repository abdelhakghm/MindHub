
export interface UserProfile {
  name: string;
  goals: string[];
  challenges: string[];
  focusAreas: string[];
  onboarded: boolean;
  points: number;
  habits: HabitRecord[];
  energyPatterns: EnergyPattern;
  interactionCount: number;
  behaviorLogs: BehaviorLog[];
  sessionOutputs: SessionOutput[];
  examMode: boolean; 
  adviceFeedback: AdviceFeedback[];
  learningModules?: LearningModule[];
}

export interface LearningModule {
  id: string;
  name: string;
  description: string;
  completionPercentage: number;
  exercisesCompleted: number;
  exercisesTotal: number;
  pdfSummaryUrl?: string;
  lastStudied: string;
  // Spaced Repetition Fields
  reviewStage: number; // 0: Not started, 1: 2-day, 2: 5-day, 3: 10-day, 4: Mastered
  nextReviewDate?: string;
  reviewHistory: { date: string; stage: number }[];
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  targetCount: number;
  currentCount: number;
  category: 'productivity' | 'health' | 'learning' | 'social';
  points: number;
  description: string;
}

export interface Skill {
  id: string;
  title: string;
  category: string;
  description: string;
  masteryLevel: number; 
  executions: SkillExecution[];
}

export interface SkillExecution {
  id: string;
  timestamp: string;
  description: string;
  complexity: 'low' | 'medium' | 'high';
  result: string;
}

export interface SessionOutput {
  topicId: string;
  timestamp: string;
  durationMinutes: number;
  outputDescription: string; 
  perceivedQuality: number; 
  energyLevelBefore: number;
}

export interface AdviceFeedback {
  strategy: string; 
  rating: 'positive' | 'negative' | 'ignored';
  timestamp: string;
}

export interface BehaviorLog {
  pattern: string; 
  occurrences: number;
  lastDetected: string;
}

export interface HabitRecord {
  name: string;
  streak: number;
  lastCompleted: string;
  category: 'health' | 'study' | 'social' | 'mindset';
}

export interface EnergyPattern {
  peakHours: number[]; 
  averageSleepDuration: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  image?: string;
}

export interface Topic {
  id: string;
  title: string;
  level: number;
  nextReviewDate: string;
  intervalDays: number; 
}
