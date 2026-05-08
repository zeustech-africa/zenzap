interface AutoReplyRule {
  keyword: string;
  response: string;
  enabled: boolean;
}

interface BusinessHours {
  start: string;
  end: string;
  enabled: boolean;
}

class AutoReplyEngine {
  private rules: AutoReplyRule[] = [];
  private businessHours: BusinessHours = { start: '09:00', end: '17:00', enabled: true };
  
  loadRules(rules: AutoReplyRule[]) {
    this.rules = rules;
  }
  
  loadBusinessHours(hours: BusinessHours) {
    this.businessHours = hours;
  }
  
  isWithinBusinessHours(): boolean {
    if (!this.businessHours.enabled) return true;
    
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    return currentTime >= this.businessHours.start && currentTime <= this.businessHours.end;
  }
  
  getAutoReply(message: string): string | null {
    const lowerMessage = message.toLowerCase();
    
    for (const rule of this.rules) {
      if (rule.enabled && lowerMessage.includes(rule.keyword.toLowerCase())) {
        return rule.response;
      }
    }
    
    return null;
  }
  
  getOutOfOfficeMessage(): string {
    return `Thank you for your message. Our business hours are ${this.businessHours.start} to ${this.businessHours.end}. We'll get back to you as soon as possible.`;
  }
}

export const autoReplyEngine = new AutoReplyEngine();