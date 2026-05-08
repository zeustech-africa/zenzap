'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Lead {
  id: string;
  customerName: string;
  customerPhone: string;
  status: string;
  score: number;
  interest: string;
  createdAt: string;
  nextFollowUpAt?: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/leads/stats/summary');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const updateStatus = async (leadId: string, newStatus: string) => {
    try {
      await fetch(`/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      await fetchLeads();
      await fetchStats();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const addNote = async () => {
    if (!selectedLead || !noteText.trim()) return;
    
    try {
      await fetch(`/api/leads/${selectedLead.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteText, createdBy: 'Current User' })
      });
      setShowNoteModal(false);
      setNoteText('');
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const filteredLeads = selectedStatus === 'all' 
    ? leads 
    : leads.filter(l => l.status === selectedStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-400';
      case 'contacted': return 'bg-yellow-500/20 text-yellow-400';
      case 'qualified': return 'bg-purple-500/20 text-purple-400';
      case 'won': return 'bg-green-500/20 text-green-400';
      case 'lost': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading leads...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white font-bold ml-4">Lead Management</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-gray-400 text-sm">Total Leads</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.new}</div>
              <div className="text-gray-400 text-sm">New</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.won}</div>
              <div className="text-gray-400 text-sm">Converted</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.conversionRate.toFixed(1)}%</div>
              <div className="text-gray-400 text-sm">Conversion Rate</div>
            </div>
          </div>
        )}

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'new', 'contacted', 'qualified', 'won', 'lost'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg transition ${
                selectedStatus === status
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Leads Table */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-gray-300">Customer</th>
                  <th className="text-left p-4 text-gray-300">Interest</th>
                  <th className="text-left p-4 text-gray-300">Score</th>
                  <th className="text-left p-4 text-gray-300">Status</th>
                  <th className="text-left p-4 text-gray-300">Created</th>
                  <th className="text-left p-4 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-t border-white/10">
                    <td className="p-4">
                      <div className="text-white">{lead.customerName}</div>
                      <div className="text-gray-400 text-sm">{lead.customerPhone}</div>
                    </td>
                    <td className="p-4 text-gray-300">{lead.interest}</td>
                    <td className="p-4">
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div className="bg-orange-500 rounded-full h-2" style={{ width: `${lead.score}%` }}></div>
                      </div>
                      <div className="text-gray-400 text-xs mt-1">{lead.score}/100</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <select
                          onChange={(e) => updateStatus(lead.id, e.target.value)}
                          className="bg-white/10 border border-white/20 rounded text-sm text-white px-2 py-1"
                          defaultValue={lead.status}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="won">Won</option>
                          <option value="lost">Lost</option>
                        </select>
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowNoteModal(true);
                          }}
                          className="text-orange-400 hover:text-orange-300 text-sm"
                        >
                          Note
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-purple-900 to-orange-800 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-white font-bold mb-4">Add Note for {selectedLead?.customerName}</h2>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 mb-4"
              placeholder="Enter note..."
            />
            <div className="flex gap-3">
              <button onClick={addNote} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg">Save</button>
              <button onClick={() => setShowNoteModal(false)} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}