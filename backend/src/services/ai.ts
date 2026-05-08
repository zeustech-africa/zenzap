// Mock AI service for testing (bypasses OpenAI API key requirement)
export const aiService = {
  analyzeMessage: async (message: string, context?: string) => ({
    suggestedReplies: [
      "Thank you for your message. How can I help you today?",
      "I'll look into that for you right away.",
      "Thanks for reaching out!"
    ],
    sentiment: 'neutral',
    intent: 'other',
    confidence: 80
  }),
  generateResponse: async (message: string, businessContext: string) => 
    "Thank you for your message. How can I help you today?",
  detectLanguage: async (message: string) => 'English'
};
