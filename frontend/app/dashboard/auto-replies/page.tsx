'use client';

import { useState, useEffect } from 'react';

interface AutoReplyRule {
  id: string;
  keyword: string;
  response: string;
  enabled: boolean;
  matchExact: boolean;
}

export default function AutoRepliesPage() {
  const [rules, setRules] = useState<AutoReplyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoReplyRule | null>(null);
  const [keyword, setKeyword] = useState('');
  const [response, setResponse] = useState('');
  const [matchExact, setMatchExact] = useState(false);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zenzap-backend.onrender.com';
  
  useEffect(() => {
    fetchRules();
  }, []);
  
  const fetchRules = async () => {
    try {
      const res = await fetch(`${API_URL}/api/automation/rules`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setRules(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch rules:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveRule = async () => {
    if (!keyword.trim() || !response.trim()) {
      alert('Please enter both keyword and response');
      return;
    }
    
    setSaving(true);
    
    try {
      let res;
      if (editingRule) {
        res = await fetch(`${API_URL}/api/automation/rules/${editingRule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            keyword: keyword.trim(),
            response: response.trim(),
            matchExact,
            enabled: editingRule.enabled,
          }),
        });
      } else {
        res = await fetch(`${API_URL}/api/automation/rules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            keyword: keyword.trim(),
            response: response.trim(),
            matchExact,
          }),
        });
      }
      
      if (res.ok) {
        resetForm();
        fetchRules();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save rule');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleToggleRule = async (rule: AutoReplyRule) => {
    try {
      const res = await fetch(`${API_URL}/api/automation/rules/${rule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...rule,
          enabled: !rule.enabled,
        }),
      });
      if (res.ok) fetchRules();
    } catch (error) {
      alert('Failed to update rule');
    }
  };
  
  const handleDeleteRule = async (id: string) => {
    if (!confirm('Delete this auto-reply rule?')) return;
    try {
      const res = await fetch(`${API_URL}/api/automation/rules/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) fetchRules();
    } catch (error) {
      alert('Failed to delete rule');
    }
  };
  
  const resetForm = () => {
    setKeyword('');
    setResponse('');
    setMatchExact(false);
    setEditingRule(null);
    setShowForm(false);
  };
  
  const editRule = (rule: AutoReplyRule) => {
    setEditingRule(rule);
    setKeyword(rule.keyword);
    setResponse(rule.response);
    setMatchExact(rule.matchExact);
    setShowForm(true);
  };
  
  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="text-gray-400">Loading auto-reply rules...</div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Auto-Replies</h1>
          <p className="text-gray-400">Set up automatic responses to customer messages</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            + Add Rule
          </button>
        )}
      </div>
      
      {showForm && (
        <div className="bg-white/10 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingRule ? 'Edit Rule' : 'New Auto-Reply Rule'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Keyword</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g., price, hours, location"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
              <p className="text-xs text-gray-500 mt-1">When customer types this word, auto-reply triggers</p>
            </div>
            
            <div>
              <label className="block text-sm text-gray-300 mb-1">Auto-Response</label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Your automatic reply message..."
                rows={3}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
            </div>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={matchExact}
                onChange={(e) => setMatchExact(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-300">Exact match only (not partial)</span>
            </label>
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveRule}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Rule'}
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {rules.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-white/5 rounded-lg">
          <p className="text-gray-400 mb-4">No auto-reply rules yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Create Your First Rule
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`bg-white/5 rounded-lg p-4 border ${
                rule.enabled ? 'border-white/10' : 'border-red-500/30'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-sm">
                      Keyword: {rule.keyword}
                    </span>
                    {rule.matchExact && (
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                        Exact match
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${rule.enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-gray-300">{rule.response}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleRule(rule)}
                    className={`px-3 py-1 rounded text-sm ${
                      rule.enabled
                        ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }`}
                  >
                    {rule.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => editRule(rule)}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm hover:bg-blue-500/30"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}