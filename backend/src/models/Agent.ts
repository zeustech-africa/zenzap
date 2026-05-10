export interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'agent' | 'viewer';
  status: 'online' | 'offline' | 'busy';
  joinDate: string;
  lastActive: string;
  metrics: AgentMetrics;
}

export interface AgentMetrics {
  totalMessages: number;
  responsesSent: number;
  avgResponseTime: number;  // in seconds
  resolutionRate: number;   // percentage
  customerSatisfaction: number;  // rating 1-5
  conversationsAssigned: number;
  conversationsResolved: number;
  updatedAt: string;
}

// In-memory storage (will be replaced with database)
export const agents: Agent[] = [];

// Initialize with sample admin agent
const adminAgent: Agent = {
  id: 'admin-1',
  name: 'System Admin',
  email: 'admin@zenzap.com',
  role: 'admin',
  status: 'online',
  joinDate: new Date().toISOString(),
  lastActive: new Date().toISOString(),
  metrics: {
    totalMessages: 0,
    responsesSent: 0,
    avgResponseTime: 0,
    resolutionRate: 0,
    customerSatisfaction: 0,
    conversationsAssigned: 0,
    conversationsResolved: 0,
    updatedAt: new Date().toISOString()
  }
};
agents.push(adminAgent);