export interface FlowForm {
  id: string;
  userId: string;
  name: string;
  description: string;
  triggerKeyword: string;
  welcomeMessage: string;
  completionMessage: string;
  questions: FormQuestion[];
  responses: FormResponse[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  responseCount: number;
  completionRate: number;
}

export interface FormQuestion {
  id: string;
  order: number;
  type: 'text' | 'number' | 'email' | 'phone' | 'select' | 'date' | 'yes_no';
  question: string;
  required: boolean;
  options?: string[]; // for select type
  validation?: string; // regex pattern for validation
}

export interface FormResponse {
  id: string;
  formId: string;
  customerPhone: string;
  customerName: string;
  answers: Record<string, string>;
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
  updatedAt?: string;
}

// In-memory storage
export const flowForms: FlowForm[] = [];
export const formResponses: FormResponse[] = [];