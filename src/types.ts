export type Role = 'user' | 'model' | 'system';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export type ReflectionMood = 
  | 'Grateful'
  | 'Calm'
  | 'Energized'
  | 'Reflective'
  | 'Challenged'
  | 'Creative'
  | 'Anxious'
  | 'Accomplished';

export interface SessionSummaryData {
  title: string;
  mood: ReflectionMood;
  keyThemes: string[];
  reflections: string;
  actionItems: string[];
}

export interface ReflectionInsightsData {
  keyInsight: string;
  emotionalPattern: string;
  recurringTheme: string;
  actionForTomorrow: string;
  growthSignal: string;
  generatedAt: number;
}

export interface JournalInteraction {
  id: string;
  userId: string;
  sessionId: string;
  userPrompt: string;
  geminiResponse: string;
  summary?: string;
  mood?: ReflectionMood;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface JournalSession {
  id: string;
  userId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  summary?: SessionSummaryData;
  insights?: ReflectionInsightsData;
  mood?: ReflectionMood;
  interactionsCount: number;
  previewSnippet?: string;
  tags?: string[];
}

export interface UserAuthProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface ApiChatRequest {
  messages: Array<{
    role: 'user' | 'model';
    content: string;
  }>;
  mood?: ReflectionMood;
  userContext?: {
    displayName?: string;
  };
}

export interface ApiChatResponse {
  response: string;
  modelUsed: string;
}

export interface ApiSummarizeRequest {
  messages: Array<{
    role: 'user' | 'model';
    content: string;
  }>;
  existingTitle?: string;
}

export interface ApiSummarizeResponse {
  summary: SessionSummaryData;
  modelUsed: string;
}

export interface ApiInsightsRequest {
  messages: Array<{
    role: 'user' | 'model';
    content: string;
  }>;
  sessionTitle?: string;
}

export interface ApiInsightsResponse {
  insights: ReflectionInsightsData;
  modelUsed: string;
}
