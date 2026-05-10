import OpenAI from 'openai';

// Pre-trained intent categories (copying SleekFlow's structure)
export interface IntentResult {
  intent: 'booking' | 'pricing' | 'support' | 'complaint' | 'greeting' | 'general';
  confidence: number;
  entities?: {
    date?: string;
    time?: string;
    product?: string;
    price?: string;
  };
}

// Keyword-based fallback (works without API)
const keywordIntents: Record<string, string[]> = {
  booking: ['book', 'appointment', 'schedule', 'reserve', 'booking', 'available'],
  pricing: ['price', 'cost', 'how much', 'rate', 'fee', 'pricing', 'expensive'],
  support: ['help', 'support', 'issue', 'problem', 'not working', 'error'],
  complaint: ['complaint', 'bad', 'terrible', 'awful', 'disappointed', 'angry'],
  greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']
};

export class NLUService {
  async detectIntent(message: string): Promise<IntentResult> {
    const lowerMessage = message.toLowerCase();
    
    // First try keyword matching (fast, free, works offline)
    for (const [intent, keywords] of Object.entries(keywordIntents)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          return {
            intent: intent as IntentResult['intent'],
            confidence: 0.7,
            entities: this.extractEntities(message, intent)
          };
        }
      }
    }
    
    // If OpenAI is configured, use AI for better accuracy
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an intent detection AI. Analyze the customer message and return ONLY a JSON object with:
              - intent: one of [booking, pricing, support, complaint, greeting, general]
              - confidence: number between 0 and 1
              - entities: object with date, time, product, price if found`
            },
            { role: 'user', content: message }
          ],
          temperature: 0,
          max_tokens: 150
        });
        
        const result = JSON.parse(response.choices[0].message.content || '{}');
        return {
          intent: result.intent || 'general',
          confidence: result.confidence || 0.5,
          entities: result.entities
        };
      } catch (error) {
        console.error('OpenAI NLU error:', error);
      }
    }
    
    // Default fallback
    return { intent: 'general', confidence: 0.3 };
  }
  
  private extractEntities(message: string, intent: string): IntentResult['entities'] {
    const entities: IntentResult['entities'] = {};
    const lowerMessage = message.toLowerCase();
    
    // Extract date patterns (simplified)
    const datePatterns = [
      /tomorrow/i, /today/i, /monday|tuesday|wednesday|thursday|friday|saturday|sunday/i,
      /\d{1,2}\/\d{1,2}/, /\d{1,2}-\d{1,2}/
    ];
    
    for (const pattern of datePatterns) {
      if (pattern.test(lowerMessage)) {
        entities.date = message.match(pattern)?.[0];
        break;
      }
    }
    
    // Extract price patterns
    const priceMatch = message.match(/R\s?\d+|\d+\s?rand/i);
    if (priceMatch) entities.price = priceMatch[0];
    
    return entities;
  }
}

export const nluService = new NLUService();