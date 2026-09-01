export interface GuidePromptState {
  goal: string;
  user: string;
  instruction: string;
  details: string[];
  examples?: string;
  guardrails: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  fileName?: string;
  fileContent?: string;
  imageUrl?: string;
  timestamp: number;
}

export interface ChatRoom {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface ScenarioConfig {
  id: string;
  stage: number;
  title: string;
  icon: string;
  description: string;
  defaultGoal: string;
  defaultUser: string;
  defaultInstruction: string;
  questionBank: { id: string; title: string; text: string }[];
  availableDetails: { id: string; label: string; text: string }[];
}
