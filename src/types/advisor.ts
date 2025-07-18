export interface Advisor {
  id: string;
  name: string;
  title: string;
  emoji: string;
  expertise: string[];
  specialty: string;
  approach: string;
  keywords: string[];
  color: string;
  secondaryColor: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'advisor';
  timestamp: Date;
  advisorId?: string;
  advisorName?: string;
}

export interface ChatSession {
  id: string;
  advisorId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
}