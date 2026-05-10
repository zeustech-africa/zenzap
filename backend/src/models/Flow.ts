export interface Flow {
  id: string;
  userId: string;
  name: string;
  description?: string;
  trigger: Trigger;
  steps: Step[];
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Trigger {
  type: 'keyword' | 'welcome' | 'time' | 'broadcast';
  keyword?: string;      // for keyword triggers
  keywords?: string[];   // multiple keywords
  delay?: number;        // for time triggers (in minutes)
}

export interface Step {
  id: string;
  order: number;
  condition?: Condition;
  action: Action;
}

export interface Condition {
  type: 'if' | 'else' | 'if_not';
  matches?: string[];    // keywords to match
  intent?: string;       // for NLU (future)
}

export interface Action {
  type: 'send_message' | 'add_tag' | 'remove_tag' | 'assign_agent' | 'http_request' | 'end';
  message?: string;
  messageVariables?: string[];
  tag?: string;
  agentId?: string;
  url?: string;
  method?: 'GET' | 'POST';
}

// In-memory storage (will be replaced with database)
export const flows: Flow[] = [];