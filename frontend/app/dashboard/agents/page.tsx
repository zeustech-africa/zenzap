'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  metrics: {
    responsesSent: number;
    avgResponseTime: number;
    resolutionRate: number;
    customerSatisfaction: number;
    conversationsAssigned: number;
    conversationsResolved: number;
  };
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'responses' | 'responseTime' | 'satisfaction'>('responses');
  const [showNewAgentForm, setShowNewAgentForm] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', email: '', role: 'agent' });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async () => {
    if (!newAgent.name || !newAgent.email) return;
    
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent)
      });
      
      if (response.ok) {
        setShowNewAgentForm(false);
        setNewAgent({ name: '', email: '', role: 'agent' });
        await fetchAgents();
      }
    } catch (error) {
      alert('Failed to create agent');
    }
  };

  const updateAgentStatus = async (agentId: string, status: string) => {
    try {
      await fetch(`/api/agents/${agentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await fetchAgents();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getSortedAgents = () => {
    return [...agents].sort((a, b) => {
      if (sortBy === 'responses') return b.metrics.responsesSent - a.metrics.responsesSent;
      if (sortBy === 'responseTime') return a.metrics.avgResponseTime - b.metrics.avgResponseTime;
      return b.metrics.customerSatisfaction - a.metrics.customerSatisfaction;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatResponseTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)} sec`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
    return `${Math.round(seconds / 3600)} hr`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading agent performance...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white font-bold ml-4">Agent Performance</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Team Performance</h1>
          <button
            onClick={() => setShowNewAgentForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
          >
            + Add Agent
          </button>
        </div>

        {/* Sort Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSortBy('responses')}
            className={`px-4 py-2 rounded-lg transition ${
              sortBy === 'responses'
                ? 'bg-orange-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Most Active
          </button>
          <button
            onClick={() => setSortBy('responseTime')}
            className={`px-4 py-2 rounded-lg transition ${
              sortBy === 'responseTime'
                ? 'bg-orange-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Fastest Response
          </button>
          <button
            onClick={() => setSortBy('satisfaction')}
            className={`px-4 py-2 rounded-lg transition ${
              sortBy === 'satisfaction'
                ? 'bg-orange-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Best Rated
          </button>
        </div>

        {/* Agents Table */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-gray-300">Agent</th>
                  <th className="text-left p-4 text-gray-300">Status</th>
                  <th className="text-left p-4 text-gray-300">Messages</th>
                  <th className="text-left p-4 text-gray-300">Avg Response</th>
                  <th className="text-left p-4 text-gray-300">Resolution</th>
                  <th className="text-left p-4 text-gray-300">Rating</th>
                  <th className="text-left p-4 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getSortedAgents().map((agent) => (
                  <tr key={agent.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="p-4">
                      <div className="text-white font-medium">{agent.name}</div>
                      <div className="text-gray-400 text-sm">{agent.role}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`}></div>
                        <select
                          value={agent.status}
                          onChange={(e) => updateAgentStatus(agent.id, e.target.value)}
                          className="bg-white/10 border border-white/20 rounded text-white text-sm px-2 py-1"
                        >
                          <option value="online">Online</option>
                          <option value="busy">Busy</option>
                          <option value="offline">Offline</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-4 text-white">{agent.metrics.responsesSent.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`${agent.metrics.avgResponseTime < 60 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {formatResponseTime(agent.metrics.avgResponseTime)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white">{agent.metrics.resolutionRate}%</span>
                        <div className="w-16 bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{ width: `${agent.metrics.resolutionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-white">{agent.metrics.customerSatisfaction.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <button className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Agent Modal */}
        {showNewAgentForm && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-purple-900 to-orange-800 rounded-2xl max-w-md w-full p-6">
              <h2 className="text-white font-bold text-lg mb-4">Add New Agent</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({...newAgent, email: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
                <select
                  value={newAgent.role}
                  onChange={(e) => setNewAgent({...newAgent, role: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="agent">Agent</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={createAgent} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg">
                  Add Agent
                </button>
                <button onClick={() => setShowNewAgentForm(false)} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}