import { Advisor } from '@/types/advisor';

const GEMINI_API_KEY = 'AIzaSyD5eNNhOGBc-gaAnuAFIzjHMBrdHebHpYg';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export class GeminiService {
  private apiKey: string;

  constructor(apiKey: string = GEMINI_API_KEY) {
    this.apiKey = apiKey;
  }

  async generateResponse(
    message: string, 
    advisor: Advisor, 
    conversationHistory: Array<{role: string, content: string}> = []
  ): Promise<string> {
    try {
      const systemPrompt = this.createSystemPrompt(advisor);
      
      // Build conversation context
      const messages = [
        { role: 'user', content: systemPrompt },
        ...conversationHistory.slice(-10), // Keep last 10 messages for context
        { role: 'user', content: message }
      ];

      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          })),
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return `I apologize, but I'm experiencing technical difficulties right now. As ${advisor.name}, I'd love to help you with ${advisor.specialty.toLowerCase()}, but please try again in a moment. In the meantime, you might want to consult with one of my fellow advisors who might be able to assist you.`;
    }
  }

  private createSystemPrompt(advisor: Advisor): string {
    return `You are ${advisor.name}, ${advisor.title}. 

PERSONALITY & APPROACH:
${advisor.approach}

EXPERTISE AREAS:
${advisor.expertise.join(', ')}

SPECIALTY:
${advisor.specialty}

INSTRUCTIONS:
1. Always respond as ${advisor.name} in character
2. Use your expertise in ${advisor.expertise.join(', ')} to provide valuable insights
3. Reference Indian context, examples, and cultural nuances when relevant
4. Keep responses practical, actionable, and helpful
5. If the question is outside your expertise, acknowledge it and suggest which other advisor might be better suited
6. Use a warm, professional tone that matches your character
7. Limit responses to 2-3 paragraphs for readability
8. Use your knowledge of ${advisor.specialty} to provide specific, detailed advice

Remember: You are part of the AI Council of Advisors, a prestigious group of 10 specialized experts helping users with various life challenges. Maintain the dignity and expertise of your role while being approachable and helpful.`;
  }

  async selectBestAdvisor(message: string, advisors: Advisor[]): Promise<Advisor> {
    const messageLower = message.toLowerCase();
    
    // Score each advisor based on keyword matches
    const scores = advisors.map(advisor => {
      let score = 0;
      advisor.keywords.forEach(keyword => {
        if (messageLower.includes(keyword)) {
          score += 1;
        }
      });
      return { advisor, score };
    });

    // Sort by score and return the best match
    scores.sort((a, b) => b.score - a.score);
    
    // If no clear match, return Sam (the friendly companion)
    if (scores[0].score === 0) {
      return advisors.find(a => a.id === 'sam') || advisors[0];
    }
    
    return scores[0].advisor;
  }
}

export const geminiService = new GeminiService();